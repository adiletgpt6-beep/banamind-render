import { beforeEach, describe, expect, it } from "vitest";
import { handleCallback, handleLogin, handleLogout } from "@/lib/handlers";
import { resetRateLimits } from "@/lib/http";
import { verifySessionToken } from "@/lib/session";
import { TEST_ENV } from "./helpers";

beforeEach(() => resetRateLimits());

function githubFake(user: { login: string; id: number }) {
  const calls: string[] = [];
  const fetchImpl = (async (url: string) => {
    calls.push(url);
    if (url.startsWith("https://github.com/login/oauth/access_token")) return Response.json({ access_token: "gho_temporary" });
    if (url === "https://api.github.com/user") return Response.json(user);
    return new Response(null, { status: 404 });
  }) as typeof fetch;
  return { calls, fetchImpl };
}

function stateFrom(res: Response): string {
  const location = new URL(res.headers.get("location")!);
  return location.searchParams.get("state")!;
}

function callback(state: string, cookieState: string | null) {
  return new Request(`https://studio.test/api/auth/callback?code=abc&state=${state}`, {
    headers: cookieState ? { cookie: `__Host-studio_oauth_state=${cookieState}` } : {},
  });
}

describe("вход через GitHub", () => {
  it("login ведёт на GitHub без доступа к репозиториям и ставит state-cookie", () => {
    const res = handleLogin(new Request("https://studio.test/api/auth/login"), { env: TEST_ENV });
    expect(res.status).toBe(303);
    const location = new URL(res.headers.get("location")!);
    expect(location.origin).toBe("https://github.com");
    expect(location.searchParams.get("scope")).toBe("");
    expect(location.searchParams.get("redirect_uri")).toBe("https://studio.test/api/auth/callback");
    expect(location.toString()).not.toContain(TEST_ENV.AUTH_GITHUB_SECRET);
    const cookie = res.headers.get("set-cookie")!;
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/Secure/);
    expect(cookie).toMatch(/SameSite=Lax/);
  });

  it("неверный state отклоняется (CSRF при входе)", async () => {
    const { fetchImpl, calls } = githubFake({ login: "OwnerLogin", id: 42 });
    const res = await handleCallback(callback("forged", "real"), { env: TEST_ENV, fetchImpl });
    expect(res.headers.get("location")).toContain("login=state");
    expect(calls).toHaveLength(0);
    const noCookie = await handleCallback(callback("x", null), { env: TEST_ENV, fetchImpl });
    expect(noCookie.headers.get("location")).toContain("login=state");
  });

  it("чужой аккаунт GitHub не получает сессию", async () => {
    const { fetchImpl } = githubFake({ login: "stranger", id: 7 });
    const state = stateFrom(handleLogin(new Request("https://studio.test/api/auth/login"), { env: TEST_ENV }));
    const res = await handleCallback(callback(state, state), { env: TEST_ENV, fetchImpl });
    expect(res.headers.get("location")).toContain("login=denied");
    expect(res.headers.get("set-cookie") ?? "").not.toContain("studio_session=ey");
  });

  it("владелец получает короткую подписанную сессию без токена GitHub", async () => {
    const { fetchImpl } = githubFake({ login: "OwnerLogin", id: 42 });
    const state = stateFrom(handleLogin(new Request("https://studio.test/api/auth/login"), { env: TEST_ENV }));
    const res = await handleCallback(callback(state, state), { env: TEST_ENV, fetchImpl });
    const cookies = res.headers.getSetCookie();
    const session = cookies.find((c) => c.startsWith("__Host-studio_session="))!;
    expect(session).toMatch(/HttpOnly/);
    expect(session).toMatch(/Max-Age=28800/);
    expect(session).not.toContain("gho_temporary");
    const token = decodeURIComponent(session.split(";")[0].split("=").slice(1).join("="));
    expect(verifySessionToken(token, TEST_ENV.AUTH_SECRET)).toMatchObject({ login: "ownerlogin", githubId: "42" });
  });

  it("выход только со своего домена", () => {
    const foreign = handleLogout(new Request("https://studio.test/api/auth/logout", { method: "POST", headers: { origin: "https://evil.test" } }), { env: TEST_ENV });
    expect(foreign.status).toBe(403);
    const own = handleLogout(new Request("https://studio.test/api/auth/logout", { method: "POST", headers: { origin: "https://studio.test" } }), { env: TEST_ENV });
    expect(own.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
