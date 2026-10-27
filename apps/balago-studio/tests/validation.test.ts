import { describe, expect, it } from "vitest";
import {
  cleanText,
  formatLiveId,
  looksLikeVideoContainer,
  parseSubmitRequest,
  parseUploadRequest,
  sourceObjectKey,
} from "@/lib/validation";
import { fakeMp4 } from "./helpers";

const MAX = 250 * 1024 * 1024;
const MB60 = 60 * 1024 * 1024;

describe("метаданные файла", () => {
  it("принимает MP4 и MOV (в т.ч. без MIME от Android)", () => {
    expect(parseUploadRequest({ fileName: "VID_2026.mp4", contentType: "video/mp4", size: MB60 }, MAX)).toEqual({
      ok: true,
      value: { extension: "mp4", contentType: "video/mp4", size: MB60 },
    });
    expect(parseUploadRequest({ fileName: "IMG_1.MOV", contentType: "", size: MB60 }, MAX)).toMatchObject({
      ok: true,
      value: { extension: "mov", contentType: "video/quicktime" },
    });
  });

  it("отклоняет чужие типы, расширения и подмену MIME", () => {
    expect(parseUploadRequest({ fileName: "a.exe", size: MB60 }, MAX).ok).toBe(false);
    expect(parseUploadRequest({ fileName: "a.mp4.html", size: MB60 }, MAX).ok).toBe(false);
    expect(parseUploadRequest({ fileName: "a.mp4", contentType: "text/html", size: MB60 }, MAX).ok).toBe(false);
    expect(parseUploadRequest({ fileName: "", size: MB60 }, MAX).ok).toBe(false);
    expect(parseUploadRequest(null, MAX).ok).toBe(false);
  });

  it("ограничивает размер на сервере", () => {
    expect(parseUploadRequest({ fileName: "a.mp4", size: MAX + 1 }, MAX).ok).toBe(false);
    expect(parseUploadRequest({ fileName: "a.mp4", size: 10 }, MAX).ok).toBe(false);
    expect(parseUploadRequest({ fileName: "a.mp4", size: 1.5 }, MAX).ok).toBe(false);
    expect(parseUploadRequest({ fileName: "a.mp4", size: "60" }, MAX).ok).toBe(false);
  });

  it("ключ объекта строится только из UUID — без имени файла и path traversal", () => {
    const id = "2f1c7a8e-3b4d-4e5f-8a9b-0c1d2e3f4a5b";
    expect(sourceObjectKey(id, "mp4")).toBe(`live/raw/${id}/source.mp4`);
    expect(() => sourceObjectKey("../../etc/passwd", "mp4")).toThrow();
    expect(() => sourceObjectKey(`${id}/..`, "mp4")).toThrow();
  });
});

describe("текст карточки", () => {
  it("сохраняет кыргызские и русские буквы, убирает управляющие символы", () => {
    expect(cleanText("  Ата-энелер үчүн ңөү — тест\u0000‮ ", 100)).toEqual({ ok: true, value: "Ата-энелер үчүн ңөү — тест" });
  });

  it("ограничивает длину и запрещает многострочное название", () => {
    expect(parseSubmitRequest({ title: "a".repeat(121) }).ok).toBe(false);
    expect(parseSubmitRequest({ title: "a\nb" }).ok).toBe(false);
    expect(parseSubmitRequest({ note: "x".repeat(2001) }).ok).toBe(false);
    expect(parseSubmitRequest({}).ok).toBe(true);
  });
});

describe("сигнатура видео", () => {
  it("распознаёт ISO BMFF и отклоняет прочее", () => {
    expect(looksLikeVideoContainer(fakeMp4(32))).toBe(true);
    expect(looksLikeVideoContainer(new TextEncoder().encode("<html><script>alert(1)</script>"))).toBe(false);
    expect(looksLikeVideoContainer(new Uint8Array(4))).toBe(false);
  });

  it("форматирует номер задания", () => {
    expect(formatLiveId(5)).toBe("LIVE-005");
    expect(formatLiveId(150)).toBe("LIVE-150");
  });
});
