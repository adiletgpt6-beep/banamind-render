import { ConfigError, loadConfig, SESSION_TTL_SECONDS, type StudioConfig } from "./config";
import { completeUpload, createUpload, submitUpload } from "./intake";
import { clientIp, errorResponse, guarded, json, rateLimit, readCookie, readJsonBody, type DepsFactory } from "./http";
import { createSessionToken, oauthStateCookieName, randomState, safeEqual, sessionCookieName } from "./session";

// Обработчики маршрутов отделены от файлов app/ — их можно тестировать
// с подменными R2/GitHub и тестовым окружением без настоящих ключей.

export interface HandlerOptions {
  env?: Record<string, string | undefined>;
  depsFactory?: DepsFactory;
  fetchImpl?: typeof fetch;
}

// ── API загрузки ─────────────────────────────────────────────────────────────

export function handleCreateUpload(request: Request, options: HandlerOptions = {}): Promise<Response> {
  return guarded(request, { ...options, rateKey: "create", rateLimit: 10 }, async ({ deps }) => {
    const result = await createUpload(deps, await readJsonBody(request));
    return json(result, 201);
  });
}

export function handleCompleteUpload(request: Request, uploadId: string, options: HandlerOptions = {}): Promise<Response> {
  return guarded(request, { ...options, rateKey: "complete", rateLimit: 30 }, async ({ deps }) => {
    return json(await completeUpload(deps, uploadId));
  });
}

export function handleSubmitUpload(request: Request, uploadId: string, options: HandlerOptions = {}): Promise<Response> {
  return guarded(request, { ...options, rateKey: "submit", rateLimit: 20 }, async ({ deps }) => {
    const result = await submitUpload(deps, uploadId, await readJsonBody(request));
    return json(result, result.alreadyExisted ? 200 : 201);
  });
}

// ── Вход владельца через GitHub OAuth ────────────────────────────────────────

function cookie(name: string, value: string, config: StudioConfig, maxAge: number, sameSite: "Lax" | "Strict"): string {
  return [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${sameSite}`,
    `Max-Age=${maxAge}`,
    config.secureCookies ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function redirect(location: string, cookies: string[] = []): Response {
  const headers = new Headers({ Location: location, "Cache-Control": "no-store" });
  for (const value of cookies) headers.append("Set-Cookie", value);
  return new Response(null, { status: 303, headers });
}

function configOrNull(env?: Record<string, string | undefined>): StudioConfig | null {
  try {
    return loadConfig(env ?? process.env);
  } catch (error) {
    if (error instanceof ConfigError) return null;
    throw error;
  }
}

export function handleLogin(request: Request, options: HandlerOptions = {}): Response {
  const config = configOrNull(options.env);
  if (!config) return errorResponse(503, "not_configured", "Studio ещё не подключена");
  if (!rateLimit(`login:${clientIp(request)}`, 20, 60_000)) {
    return errorResponse(429, "rate_limited", "Слишком много попыток — подождите минуту");
  }
  const state = randomState();
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", config.githubClientId);
  authorize.searchParams.set("redirect_uri", new URL("/api/auth/callback", config.publicOrigin).toString());
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("scope", ""); // только публичный профиль, доступ к репозиториям не нужен
  authorize.searchParams.set("allow_signup", "false");
  return redirect(authorize.toString(), [cookie(oauthStateCookieName(config.secureCookies), state, config, 600, "Lax")]);
}

export async function handleCallback(request: Request, options: HandlerOptions = {}): Promise<Response> {
  const config = configOrNull(options.env);
  if (!config) return errorResponse(503, "not_configured", "Studio ещё не подключена");
  const fetchImpl = options.fetchImpl ?? fetch;
  const home = new URL("/", config.publicOrigin);
  const fail = (reason: string) => {
    home.searchParams.set("login", reason);
    return redirect(home.toString(), [cookie(oauthStateCookieName(config.secureCookies), "", config, 0, "Lax")]);
  };

  if (!rateLimit(`callback:${clientIp(request)}`, 20, 60_000)) return fail("rate_limited");
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = readCookie(request, oauthStateCookieName(config.secureCookies));
  if (!code || !state || !expectedState || !safeEqual(state, expectedState)) return fail("state");

  const tokenRes = await fetchImpl("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code,
      redirect_uri: new URL("/api/auth/callback", config.publicOrigin).toString(),
    }),
  });
  const token = tokenRes.ok ? ((await tokenRes.json()) as { access_token?: string }).access_token : undefined;
  if (!token) return fail("github");

  const userRes = await fetchImpl("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "balago-video-studio" },
  });
  if (!userRes.ok) return fail("github");
  const user = (await userRes.json()) as { login?: string; id?: number };
  // Токен GitHub дальше не используется и нигде не сохраняется.
  const login = (user.login ?? "").toLowerCase();
  const githubId = String(user.id ?? "");
  if (login !== config.allowedGithubLogin || (config.allowedGithubId && githubId !== config.allowedGithubId)) {
    return fail("denied");
  }

  const session = createSessionToken(login, githubId, config.authSecret);
  return redirect(home.toString(), [
    cookie(sessionCookieName(config.secureCookies), session, config, SESSION_TTL_SECONDS, "Lax"),
    cookie(oauthStateCookieName(config.secureCookies), "", config, 0, "Lax"),
  ]);
}

export function handleLogout(request: Request, options: HandlerOptions = {}): Response {
  const config = configOrNull(options.env);
  if (!config) return errorResponse(503, "not_configured", "Studio ещё не подключена");
  if (request.headers.get("origin") !== config.publicOrigin) return errorResponse(403, "forbidden_origin", "Запрос отклонён");
  return redirect(new URL("/", config.publicOrigin).toString(), [
    cookie(sessionCookieName(config.secureCookies), "", config, 0, "Lax"),
  ]);
}
