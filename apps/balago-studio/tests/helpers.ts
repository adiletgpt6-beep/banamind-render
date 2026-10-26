import { createSessionToken } from "@/lib/session";
import { MemoryIssueTracker } from "@/lib/github";
import { MemoryObjectStore } from "@/lib/storage";
import type { DepsFactory } from "@/lib/http";

// Тестовые значения. Это НЕ настоящие ключи: только для подменных R2/GitHub.
export const TEST_ENV = {
  STUDIO_PUBLIC_URL: "https://studio.test",
  STUDIO_ALLOWED_GITHUB_LOGIN: "OwnerLogin",
  STUDIO_ALLOWED_GITHUB_ID: "42",
  AUTH_GITHUB_ID: "test-client-id",
  AUTH_GITHUB_SECRET: "test-client-secret-should-never-leak",
  AUTH_SECRET: "test-auth-secret-0123456789abcdef0123456789",
  R2_ACCOUNT_ID: "testaccount",
  R2_BUCKET_NAME: "balago-live-raw",
  R2_ACCESS_KEY_ID: "TESTACCESSKEYID",
  R2_SECRET_ACCESS_KEY: "test-r2-secret-should-never-leak",
  STUDIO_GITHUB_TOKEN: "github_pat_test_should_never_leak",
  STUDIO_GITHUB_REPO: "adiletzainidinov/balago-video",
  STUDIO_MAX_UPLOAD_BYTES: String(250 * 1024 * 1024),
};

export const SECRET_VALUES = [
  TEST_ENV.AUTH_GITHUB_SECRET,
  TEST_ENV.AUTH_SECRET,
  TEST_ENV.R2_SECRET_ACCESS_KEY,
  TEST_ENV.STUDIO_GITHUB_TOKEN,
];

export function ownerCookie(login = "ownerlogin", id = "42"): string {
  return `__Host-studio_session=${createSessionToken(login, id, TEST_ENV.AUTH_SECRET)}`;
}

export function apiRequest(path: string, body: unknown, overrides: Record<string, string | null> = {}): Request {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    origin: "https://studio.test",
    "sec-fetch-site": "same-origin",
    cookie: ownerCookie(),
    "x-real-ip": `10.0.0.${Math.floor(Math.random() * 250)}`,
  };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) delete headers[key];
    else headers[key] = value;
  }
  return new Request(`https://studio.test${path}`, { method: "POST", headers, body: JSON.stringify(body) });
}

export function fakeWorld(repoMax = 4) {
  const store = new MemoryObjectStore();
  const tracker = new MemoryIssueTracker(repoMax);
  const depsFactory: DepsFactory = (config) => ({
    store,
    tracker,
    maxUploadBytes: config.maxUploadBytes,
    firstLiveNumber: config.firstLiveNumber,
  });
  return { store, tracker, options: { env: TEST_ENV, depsFactory } };
}

/** Минимальный корректный заголовок MP4 (атом ftyp) + полезная нагрузка. */
export function fakeMp4(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  bytes.set([0, 0, 0, 0x18, ...new TextEncoder().encode("ftypmp42")], 0);
  return bytes;
}
