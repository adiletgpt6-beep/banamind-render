// Серверная конфигурация. Значения берутся только из секретов хостинга
// (Vercel → Settings → Environment Variables). Ничего отсюда не уходит в браузер:
// в Next.js переменные без префикса NEXT_PUBLIC_ клиенту недоступны.

export const DEFAULT_MAX_UPLOAD_BYTES = 250 * 1024 * 1024; // 250 МБ
export const HARD_MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024; // 2 ГБ — потолок для любого env
export const UPLOAD_URL_TTL_SECONDS = 15 * 60; // signed PUT живёт 15 минут
export const SESSION_TTL_SECONDS = 8 * 60 * 60; // вход владельца — 8 часов
export const DEFAULT_FIRST_LIVE_NUMBER = 5; // LIVE-001…LIVE-004 уже существуют

export interface StudioConfig {
  publicUrl: string;
  publicOrigin: string;
  secureCookies: boolean;
  allowedGithubLogin: string;
  allowedGithubId: string | null;
  githubClientId: string;
  githubClientSecret: string;
  authSecret: string;
  r2: {
    accountId: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  github: {
    token: string;
    owner: string;
    repo: string;
  };
  maxUploadBytes: number;
  firstLiveNumber: number;
}

export class ConfigError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Studio не настроена: не заданы ${missing.join(", ")}`);
    this.name = "ConfigError";
  }
}

const REQUIRED = [
  "STUDIO_PUBLIC_URL",
  "STUDIO_ALLOWED_GITHUB_LOGIN",
  "AUTH_GITHUB_ID",
  "AUTH_GITHUB_SECRET",
  "AUTH_SECRET",
  "R2_ACCOUNT_ID",
  "R2_BUCKET_NAME",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "STUDIO_GITHUB_TOKEN",
  "STUDIO_GITHUB_REPO",
] as const;

type Env = Record<string, string | undefined>;

/** Список имён переменных, которых не хватает (только имена, без значений). */
export function missingConfig(env: Env = process.env): string[] {
  const missing: string[] = REQUIRED.filter((name) => !env[name]?.trim());
  if (env.AUTH_SECRET && env.AUTH_SECRET.trim().length < 32) {
    missing.push("AUTH_SECRET (минимум 32 символа)");
  }
  return missing;
}

export function loadConfig(env: Env = process.env): StudioConfig {
  const missing = missingConfig(env);
  if (missing.length > 0) throw new ConfigError(missing);
  const get = (name: string) => (env[name] ?? "").trim();

  const publicUrl = new URL(get("STUDIO_PUBLIC_URL"));
  const repo = get("STUDIO_GITHUB_REPO");
  const [owner, name, ...rest] = repo.split("/");
  if (!owner || !name || rest.length > 0) {
    throw new ConfigError(["STUDIO_GITHUB_REPO (формат owner/repo)"]);
  }

  const maxRaw = Number(env.STUDIO_MAX_UPLOAD_BYTES ?? DEFAULT_MAX_UPLOAD_BYTES);
  const maxUploadBytes =
    Number.isSafeInteger(maxRaw) && maxRaw > 0
      ? Math.min(maxRaw, HARD_MAX_UPLOAD_BYTES)
      : DEFAULT_MAX_UPLOAD_BYTES;

  const firstRaw = Number(env.STUDIO_FIRST_LIVE_NUMBER ?? DEFAULT_FIRST_LIVE_NUMBER);
  const firstLiveNumber =
    Number.isSafeInteger(firstRaw) && firstRaw >= 1 && firstRaw <= 9999
      ? firstRaw
      : DEFAULT_FIRST_LIVE_NUMBER;

  return {
    publicUrl: publicUrl.toString(),
    publicOrigin: publicUrl.origin,
    secureCookies: publicUrl.protocol === "https:",
    allowedGithubLogin: get("STUDIO_ALLOWED_GITHUB_LOGIN").toLowerCase(),
    allowedGithubId: get("STUDIO_ALLOWED_GITHUB_ID") || null,
    githubClientId: get("AUTH_GITHUB_ID"),
    githubClientSecret: get("AUTH_GITHUB_SECRET"),
    authSecret: get("AUTH_SECRET"),
    r2: {
      accountId: get("R2_ACCOUNT_ID"),
      bucket: get("R2_BUCKET_NAME"),
      accessKeyId: get("R2_ACCESS_KEY_ID"),
      secretAccessKey: get("R2_SECRET_ACCESS_KEY"),
    },
    github: { token: get("STUDIO_GITHUB_TOKEN"), owner, repo: name },
    maxUploadBytes,
    firstLiveNumber,
  };
}
