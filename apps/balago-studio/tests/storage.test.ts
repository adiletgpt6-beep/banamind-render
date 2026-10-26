import { describe, expect, it } from "vitest";
import { R2ObjectStore } from "@/lib/storage";
import { UPLOAD_URL_TTL_SECONDS } from "@/lib/config";

const R2 = { accountId: "acc", bucket: "balago-live-raw", accessKeyId: "AKIDTEST", secretAccessKey: "super-secret-r2-key" };

describe("Cloudflare R2 (S3 API)", () => {
  it("signed PUT URL короткоживущий, подписывает Content-Type и не содержит секрет", async () => {
    const store = new R2ObjectStore(R2, async () => new Response(null));
    const url = new URL(await store.presignPut("live/raw/x/source.mp4", "video/mp4", UPLOAD_URL_TTL_SECONDS));
    expect(url.origin).toBe("https://acc.r2.cloudflarestorage.com");
    expect(url.pathname).toBe("/balago-live-raw/live/raw/x/source.mp4");
    expect(UPLOAD_URL_TTL_SECONDS).toBeLessThanOrEqual(3600);
    expect(url.searchParams.get("X-Amz-Expires")).toBe(String(UPLOAD_URL_TTL_SECONDS));
    expect(url.searchParams.get("X-Amz-SignedHeaders")).toContain("content-type");
    expect(url.toString()).not.toContain("super-secret-r2-key");
  });

  it("отклоняет опасные ключи", async () => {
    const store = new R2ObjectStore(R2, async () => new Response(null));
    await expect(store.presignPut("../other/source.mp4", "video/mp4", 60)).rejects.toThrow();
    await expect(store.presignPut("/abs/key", "video/mp4", 60)).rejects.toThrow();
    await expect(store.presignPut("live/raw/a b", "video/mp4", 60)).rejects.toThrow();
  });

  it("атомарная запись использует If-None-Match и возвращает false при 412", async () => {
    const seen: Request[] = [];
    const store = new R2ObjectStore(R2, async (input) => {
      const request = input as Request;
      seen.push(request);
      return new Response(null, { status: 412 });
    });
    expect(await store.putJson("live/numbers/LIVE-005.json", { a: 1 }, { onlyIfAbsent: true })).toBe(false);
    expect(seen[0].headers.get("if-none-match")).toBe("*");
    expect(seen[0].headers.get("authorization")).toMatch(/^AWS4-HMAC-SHA256/);
  });

  it("HEAD возвращает размер и тип или null", async () => {
    const store = new R2ObjectStore(R2, async () =>
      new Response(null, { status: 200, headers: { "content-length": "62914560", "content-type": "video/mp4" } }),
    );
    expect(await store.head("live/raw/x/source.mp4")).toEqual({ size: 62914560, contentType: "video/mp4" });
    const missing = new R2ObjectStore(R2, async () => new Response(null, { status: 404 }));
    expect(await missing.head("live/raw/x/source.mp4")).toBeNull();
  });
});
