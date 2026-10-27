import { describe, expect, it } from "vitest";
import { createSessionToken, isOwner, verifySessionToken } from "@/lib/session";

const SECRET = "x".repeat(40);

describe("сессия владельца", () => {
  it("подписанный токен проверяется и содержит только логин и id", () => {
    const token = createSessionToken("OwnerLogin", "42", SECRET);
    const session = verifySessionToken(token, SECRET);
    expect(session).toMatchObject({ login: "ownerlogin", githubId: "42" });
    expect(Object.keys(session!).sort()).toEqual(["exp", "githubId", "iat", "login"]);
  });

  it("подделка, чужой секрет и мусор отклоняются", () => {
    const token = createSessionToken("ownerlogin", "42", SECRET);
    const [payload, signature] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ login: "ownerlogin", githubId: "42", iat: 0, exp: 9e9 })).toString("base64url");
    expect(verifySessionToken(`${forged}.${signature}`, SECRET)).toBeNull();
    expect(verifySessionToken(`${payload}.${signature}x`, SECRET)).toBeNull();
    expect(verifySessionToken(token, "y".repeat(40))).toBeNull();
    expect(verifySessionToken("garbage", SECRET)).toBeNull();
    expect(verifySessionToken(undefined, SECRET)).toBeNull();
  });

  it("сессия истекает (короткий срок жизни)", () => {
    const now = Date.now();
    const token = createSessionToken("ownerlogin", "42", SECRET, now, 60);
    expect(verifySessionToken(token, SECRET, now + 59_000)).not.toBeNull();
    expect(verifySessionToken(token, SECRET, now + 61_000)).toBeNull();
  });

  it("доступ только единственному владельцу (логин и GitHub id)", () => {
    const own = verifySessionToken(createSessionToken("ownerlogin", "42", SECRET), SECRET);
    const other = verifySessionToken(createSessionToken("stranger", "7", SECRET), SECRET);
    const renamed = verifySessionToken(createSessionToken("ownerlogin", "999", SECRET), SECRET);
    expect(isOwner(own, "OwnerLogin", "42")).toBe(true);
    expect(isOwner(other, "ownerlogin", "42")).toBe(false);
    expect(isOwner(renamed, "ownerlogin", "42")).toBe(false);
    expect(isOwner(null, "ownerlogin", null)).toBe(false);
  });
});
