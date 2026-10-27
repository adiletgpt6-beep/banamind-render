import { ConfigError, loadConfig, type StudioConfig } from "./config";
import { GitHubError, GitHubIssueTracker } from "./github";
import { IntakeError, type IntakeDeps } from "./intake";
import { isOwner, sessionCookieName, verifySessionToken, type Session } from "./session";
import { R2ObjectStore, StorageError } from "./storage";

// Общий слой API: конфигурация, проверка владельца, Origin (CSRF), лимит запросов,
// безопасные ответы без внутренних деталей и секретов.

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

export function errorResponse(status: number, code: string, message: string): Response {
  return json({ error: { code, message } }, status);
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim());
  }
  return null;
}

export function getOwnerSession(request: Request, config: StudioConfig, now = Date.now()): Session | null {
  const token = readCookie(request, sessionCookieName(config.secureCookies));
  const session = verifySessionToken(token, config.authSecret, now);
  return isOwner(session, config.allowedGithubLogin, config.allowedGithubId) ? session : null;
}

/** CSRF-защита: изменяющие запросы принимаются только со своего домена и только JSON. */
export function checkSameOrigin(request: Request, config: StudioConfig): boolean {
  const origin = request.headers.get("origin");
  if (!origin || origin !== config.publicOrigin) return false;
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  const type = request.headers.get("content-type") ?? "";
  return type.toLowerCase().startsWith("application/json");
}

// Лимит запросов в памяти экземпляра функции — дополнительная мера поверх входа
// через GitHub (перебор паролей невозможен: паролей у Studio нет).
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size > 5000) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count++;
  return bucket.count <= limit;
}

export function resetRateLimits(): void {
  buckets.clear();
}

export function clientIp(request: Request): string {
  return request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export interface ApiContext {
  config: StudioConfig;
  session: Session;
  deps: IntakeDeps;
}

export type DepsFactory = (config: StudioConfig) => IntakeDeps;

export const productionDeps: DepsFactory = (config) => ({
  store: new R2ObjectStore(config.r2),
  tracker: new GitHubIssueTracker(config.github),
  maxUploadBytes: config.maxUploadBytes,
  firstLiveNumber: config.firstLiveNumber,
});

export interface GuardOptions {
  env?: Record<string, string | undefined>;
  depsFactory?: DepsFactory;
  rateKey: string;
  rateLimit: number;
}

/** Обёртка API-маршрута: конфиг → владелец → Origin → лимит → обработчик → безопасная ошибка. */
export async function guarded(
  request: Request,
  options: GuardOptions,
  handler: (ctx: ApiContext) => Promise<Response>,
): Promise<Response> {
  let config: StudioConfig;
  try {
    config = loadConfig(options.env ?? process.env);
  } catch (error) {
    if (error instanceof ConfigError) {
      return errorResponse(503, "not_configured", "Studio ещё не подключена: владелец должен задать секреты хостинга");
    }
    throw error;
  }

  const session = getOwnerSession(request, config);
  if (!session) return errorResponse(401, "unauthorized", "Войдите через GitHub");
  if (!checkSameOrigin(request, config)) return errorResponse(403, "forbidden_origin", "Запрос отклонён");
  if (!rateLimit(`${options.rateKey}:${session.login}:${clientIp(request)}`, options.rateLimit, 60_000)) {
    return errorResponse(429, "rate_limited", "Слишком много запросов — подождите минуту");
  }

  try {
    const deps = (options.depsFactory ?? productionDeps)(config);
    return await handler({ config, session, deps });
  } catch (error) {
    if (error instanceof IntakeError) return errorResponse(error.status, error.code, error.message);
    // Логируем только тип и HTTP-статус, без URL с подписями и тел запросов.
    if (error instanceof StorageError || error instanceof GitHubError) {
      console.error(`[studio] ${error.name}: ${error.message} (status ${error.status ?? "?"})`);
      return errorResponse(502, "upstream", "Хранилище или GitHub временно недоступны — повторите");
    }
    console.error("[studio] unexpected error", error instanceof Error ? error.name : typeof error);
    return errorResponse(500, "internal", "Внутренняя ошибка — повторите позже");
  }
}

export async function readJsonBody(request: Request, maxBytes = 16 * 1024): Promise<unknown> {
  const text = await request.text();
  if (text.length > maxBytes) throw new IntakeError(413, "too_large", "Слишком большой запрос");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new IntakeError(400, "bad_json", "Некорректный JSON");
  }
}
