import { beforeEach, describe, expect, it } from "vitest";
import { handleCompleteUpload, handleCreateUpload, handleSubmitUpload } from "@/lib/handlers";
import { resetRateLimits } from "@/lib/http";
import { uploadMarker } from "@/lib/github";
import { manifestKey } from "@/lib/validation";
import { apiRequest, fakeMp4, fakeWorld, ownerCookie, SECRET_VALUES, TEST_ENV } from "./helpers";

const MB60 = 60 * 1024 * 1024;

async function body(res: Response) {
  const text = await res.text();
  for (const secret of SECRET_VALUES) expect(text).not.toContain(secret);
  return JSON.parse(text);
}

/** Полный путь: upload URL → «браузер» кладёт файл в R2 → проверка. */
async function uploadVideo(world: ReturnType<typeof fakeWorld>, size = MB60) {
  const created = await handleCreateUpload(apiRequest("/api/uploads", { fileName: "VID_live.mp4", contentType: "video/mp4", size }), world.options);
  expect(created.status).toBe(201);
  const { uploadId, uploadUrl } = await body(created);
  const key = `live/raw/${uploadId}/source.mp4`;
  expect(uploadUrl).toContain(key);
  world.store.simulateUpload(key, fakeMp4(size), "video/mp4");
  const done = await handleCompleteUpload(apiRequest(`/api/uploads/${uploadId}/complete`, {}), uploadId, world.options);
  expect(done.status).toBe(200);
  expect(await body(done)).toMatchObject({ status: "verified", size });
  return uploadId as string;
}

beforeEach(() => resetRateLimits());

describe("доступ к API", () => {
  it("без входа — 401, чужой аккаунт — 401", async () => {
    const world = fakeWorld();
    const anon = await handleCreateUpload(apiRequest("/api/uploads", {}, { cookie: null }), world.options);
    expect(anon.status).toBe(401);
    const stranger = await handleCreateUpload(apiRequest("/api/uploads", {}, { cookie: ownerCookie("stranger", "7") }), world.options);
    expect(stranger.status).toBe(401);
    expect(world.store.objects.size).toBe(0);
  });

  it("чужой Origin, cross-site и не-JSON отклоняются (CSRF)", async () => {
    const world = fakeWorld();
    const payload = { fileName: "a.mp4", size: MB60 };
    const attacks: Record<string, string | null>[] = [
      { origin: "https://evil.test" },
      { origin: null },
      { "sec-fetch-site": "cross-site" },
      { "content-type": "text/plain" },
    ];
    for (const overrides of attacks) {
      const res = await handleCreateUpload(apiRequest("/api/uploads", payload, overrides), world.options);
      expect(res.status).toBe(403);
    }
  });

  it("без секретов хостинга — 503 и только сообщение, без значений", async () => {
    const world = fakeWorld();
    const res = await handleCreateUpload(apiRequest("/api/uploads", {}), {
      ...world.options,
      env: { ...TEST_ENV, R2_SECRET_ACCESS_KEY: "" },
    });
    expect(res.status).toBe(503);
    expect((await body(res)).error.code).toBe("not_configured");
  });

  it("лимит запросов", async () => {
    const world = fakeWorld();
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) {
      const res = await handleCreateUpload(
        apiRequest("/api/uploads", { fileName: "a.mp4", size: MB60 }, { "x-real-ip": "10.9.9.9" }),
        world.options,
      );
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 10).every((s) => s === 201)).toBe(true);
    expect(statuses.at(-1)).toBe(429);
  });
});

describe("smoke: загрузка 60 МБ → проверка → одна карточка", () => {
  it("создаёт LIVE-005 ровно один раз при повторной отправке", async () => {
    const world = fakeWorld(4);
    const uploadId = await uploadVideo(world);

    const first = await handleSubmitUpload(
      apiRequest(`/api/uploads/${uploadId}/submit`, { title: "Ата-энелер үчүн", note: "Бишкек, @someone <b>" }),
      uploadId,
      world.options,
    );
    expect(first.status).toBe(201);
    const card = await body(first);
    expect(card).toMatchObject({ liveId: "LIVE-005", alreadyExisted: false });

    const again = await handleSubmitUpload(apiRequest(`/api/uploads/${uploadId}/submit`, {}), uploadId, world.options);
    expect(again.status).toBe(200);
    expect(await body(again)).toMatchObject({ liveId: "LIVE-005", issueUrl: card.issueUrl, alreadyExisted: true });
    expect(world.tracker.createCalls).toBe(1);

    const issue = world.tracker.issues[0];
    expect(issue.title).toBe("LIVE-005 — Ата-энелер үчүн");
    expect(issue.body).toContain(`live/raw/${uploadId}/source.mp4`);
    expect(issue.body).toContain(uploadMarker(uploadId));
    expect(issue.body).toContain("`recorded`");
    expect(issue.body).not.toMatch(/X-Amz-|https:\/\/[^\s]*r2/); // никаких signed/download URL
    expect(issue.body).not.toContain("<b>");
    expect(issue.body).not.toContain("@someone");
    for (const secret of SECRET_VALUES) expect(issue.body).not.toContain(secret);
  });

  it("параллельные двойные нажатия дают одну карточку", async () => {
    const world = fakeWorld(4);
    const uploadId = await uploadVideo(world);
    const results = await Promise.all(
      Array.from({ length: 5 }, () => handleSubmitUpload(apiRequest(`/api/uploads/${uploadId}/submit`, {}), uploadId, world.options)),
    );
    const statuses = results.map((r) => r.status);
    expect(statuses.filter((s) => s === 201)).toHaveLength(1);
    expect(statuses.every((s) => s === 201 || s === 200 || s === 409)).toBe(true);
    expect(world.tracker.createCalls).toBe(1);
  });

  it("два разных ролика получают разные номера подряд", async () => {
    const world = fakeWorld(4);
    const a = await uploadVideo(world);
    const b = await uploadVideo(world);
    const [ra, rb] = await Promise.all([
      handleSubmitUpload(apiRequest(`/api/uploads/${a}/submit`, {}), a, world.options).then(body),
      handleSubmitUpload(apiRequest(`/api/uploads/${b}/submit`, {}), b, world.options).then(body),
    ]);
    expect([ra.liveId, rb.liveId].sort()).toEqual(["LIVE-005", "LIVE-006"]);
  });

  it("восстанавливает карточку, если Issue создан, а запись в R2 оборвалась", async () => {
    const world = fakeWorld(4);
    const uploadId = await uploadVideo(world);
    world.tracker.issues.push({ number: 77, title: "LIVE-005 — прошлый запрос", body: `x\n${uploadMarker(uploadId)}`, url: "https://github.test/issues/77" });
    const res = await handleSubmitUpload(apiRequest(`/api/uploads/${uploadId}/submit`, {}), uploadId, world.options);
    expect(await body(res)).toMatchObject({ liveId: "LIVE-005", issueNumber: 77, alreadyExisted: true });
    expect(world.tracker.createCalls).toBe(0);
  });

  it("нельзя отправить в работу непроверенную загрузку", async () => {
    const world = fakeWorld();
    const created = await body(await handleCreateUpload(apiRequest("/api/uploads", { fileName: "a.mp4", size: MB60 }), world.options));
    const res = await handleSubmitUpload(apiRequest(`/api/uploads/${created.uploadId}/submit`, {}), created.uploadId, world.options);
    expect(res.status).toBe(409);
    expect(world.tracker.createCalls).toBe(0);
  });
});

describe("проверка реально сохранённого объекта", () => {
  async function start(world: ReturnType<typeof fakeWorld>) {
    const res = await handleCreateUpload(apiRequest("/api/uploads", { fileName: "a.mp4", size: MB60 }), world.options);
    return (await body(res)).uploadId as string;
  }

  it("файл не загружен — 409, можно повторить", async () => {
    const world = fakeWorld();
    const id = await start(world);
    const res = await handleCompleteUpload(apiRequest(`/api/uploads/${id}/complete`, {}), id, world.options);
    expect(res.status).toBe(409);
  });

  it("другой размер, тип или не-видео — отклоняется и удаляется", async () => {
    for (const [bytes, type] of [
      [fakeMp4(MB60 - 1), "video/mp4"],
      [fakeMp4(MB60), "text/html"],
      [new Uint8Array(MB60), "video/mp4"],
    ] as const) {
      const world = fakeWorld();
      const id = await start(world);
      const key = `live/raw/${id}/source.mp4`;
      world.store.simulateUpload(key, bytes, type);
      const res = await handleCompleteUpload(apiRequest(`/api/uploads/${id}/complete`, {}), id, world.options);
      expect(res.status).toBe(422);
      expect(world.store.objects.has(key)).toBe(false);
      expect((await world.store.getJson<{ status: string }>(manifestKey(id)))?.status).toBe("rejected");
    }
  });

  it("слишком большой файл и некорректный id отклоняются до выдачи URL", async () => {
    const world = fakeWorld();
    const big = await handleCreateUpload(apiRequest("/api/uploads", { fileName: "a.mp4", size: 300 * 1024 * 1024 }), world.options);
    expect(big.status).toBe(400);
    const bad = await handleCompleteUpload(apiRequest("/api/uploads/x/complete", {}), "../../secrets", world.options);
    expect(bad.status).toBe(400);
    expect(world.store.presigned).toHaveLength(0);
  });
});
