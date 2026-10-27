import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { SESSION_TTL_SECONDS } from "./config";

// Сессия владельца — подписанная HMAC-SHA256 cookie без хранения токенов GitHub.
// Формат: base64url(JSON) + "." + base64url(HMAC). Подделать без AUTH_SECRET нельзя.

export interface Session {
  login: string;
  githubId: string;
  iat: number;
  exp: number;
}

export function sessionCookieName(secure: boolean): string {
  // Префикс __Host- запрещает подмену cookie с поддоменов (только для HTTPS).
  return secure ? "__Host-studio_session" : "studio_session";
}

export function oauthStateCookieName(secure: boolean): string {
  return secure ? "__Host-studio_oauth_state" : "studio_oauth_state";
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(
  login: string,
  githubId: string,
  secret: string,
  now: number = Date.now(),
  ttlSeconds: number = SESSION_TTL_SECONDS,
): string {
  const iat = Math.floor(now / 1000);
  const session: Session = { login: login.toLowerCase(), githubId, iat, exp: iat + ttlSeconds };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(
  token: string | undefined | null,
  secret: string,
  now: number = Date.now(),
): Session | null {
  if (!token || token.length > 2048) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    if (typeof session.login !== "string" || typeof session.exp !== "number") return null;
    if (session.exp <= Math.floor(now / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

/** Сессия действительна, только если принадлежит единственному владельцу. */
export function isOwner(
  session: Session | null,
  allowedLogin: string,
  allowedId: string | null,
): session is Session {
  if (!session) return false;
  if (session.login !== allowedLogin.toLowerCase()) return false;
  if (allowedId && session.githubId !== allowedId) return false;
  return true;
}

export function randomState(): string {
  return randomBytes(32).toString("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
