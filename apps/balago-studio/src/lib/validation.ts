// Типизированная проверка всего, что приходит из браузера.
// Данные от браузера не доверенные: имя файла не попадает в ключ объекта,
// тип определяется по белому списку, размер ограничен на сервере.

export const ALLOWED_VIDEO_TYPES = {
  mp4: "video/mp4",
  mov: "video/quicktime",
} as const;

export type VideoExtension = keyof typeof ALLOWED_VIDEO_TYPES;
export type VideoContentType = (typeof ALLOWED_VIDEO_TYPES)[VideoExtension];

export const MIN_UPLOAD_BYTES = 16 * 1024;
export const MAX_FILENAME_LENGTH = 255;
export const MAX_TITLE_LENGTH = 120;
export const MAX_NOTE_LENGTH = 2000;

const UPLOAD_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export interface UploadRequest {
  extension: VideoExtension;
  contentType: VideoContentType;
  size: number;
}

export function isUploadId(value: unknown): value is string {
  return typeof value === "string" && UPLOAD_ID_RE.test(value);
}

/** Ключ объекта строится только из серверного UUID — без имени файла и путей. */
export function sourceObjectKey(uploadId: string, extension: VideoExtension): string {
  if (!isUploadId(uploadId)) throw new Error("invalid upload id");
  if (!(extension in ALLOWED_VIDEO_TYPES)) throw new Error("invalid extension");
  return `live/raw/${uploadId}/source.${extension}`;
}

export function manifestKey(uploadId: string): string {
  if (!isUploadId(uploadId)) throw new Error("invalid upload id");
  return `live/uploads/${uploadId}.json`;
}

export function parseUploadRequest(body: unknown, maxBytes: number): Result<UploadRequest> {
  if (!body || typeof body !== "object") return { ok: false, error: "Пустой запрос" };
  const { fileName, contentType, size } = body as Record<string, unknown>;

  if (typeof fileName !== "string" || fileName.length === 0 || fileName.length > MAX_FILENAME_LENGTH) {
    return { ok: false, error: "Некорректное имя файла" };
  }
  const match = /\.([A-Za-z0-9]{1,8})$/.exec(fileName);
  const extension = match?.[1].toLowerCase();
  if (extension !== "mp4" && extension !== "mov") {
    return { ok: false, error: "Можно загрузить только MP4 или MOV" };
  }
  const expectedType = ALLOWED_VIDEO_TYPES[extension];
  // Android иногда не сообщает тип; пустой допустим, чужой — нет.
  if (contentType !== undefined && contentType !== "" && contentType !== expectedType) {
    return { ok: false, error: "Тип файла не совпадает с расширением" };
  }

  if (typeof size !== "number" || !Number.isSafeInteger(size)) {
    return { ok: false, error: "Не указан размер файла" };
  }
  if (size < MIN_UPLOAD_BYTES) return { ok: false, error: "Файл слишком маленький для видео" };
  if (size > maxBytes) {
    return { ok: false, error: `Файл больше ${Math.floor(maxBytes / 1024 / 1024)} МБ` };
  }
  return { ok: true, value: { extension, contentType: expectedType, size } };
}

export interface SubmitRequest {
  title: string;
  note: string;
}

// Управляющие символы (кроме перевода строки и табуляции) и bidi-переопределения.
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‪-‮⁦-⁩]/g;

export function cleanText(value: unknown, max: number): Result<string> {
  if (value === undefined || value === null) return { ok: true, value: "" };
  if (typeof value !== "string") return { ok: false, error: "Ожидался текст" };
  const cleaned = value.normalize("NFC").replace(/\r\n?/g, "\n").replace(CONTROL_RE, "").trim();
  if (cleaned.length > max) return { ok: false, error: `Текст длиннее ${max} символов` };
  return { ok: true, value: cleaned };
}

export function parseSubmitRequest(body: unknown): Result<SubmitRequest> {
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const title = cleanText(record.title, MAX_TITLE_LENGTH);
  if (!title.ok) return { ok: false, error: `Название: ${title.error}` };
  if (title.value.includes("\n")) return { ok: false, error: "Название должно быть в одну строку" };
  const note = cleanText(record.note, MAX_NOTE_LENGTH);
  if (!note.ok) return { ok: false, error: `Заметка: ${note.error}` };
  return { ok: true, value: { title: title.value, note: note.value } };
}

/**
 * Проверка сигнатуры контейнера ISO BMFF (MP4/MOV): байты 4..8 — тип первого атома.
 * Отсекает переименованные не-видео файлы.
 */
const KNOWN_FIRST_ATOMS = new Set(["ftyp", "moov", "wide", "mdat", "free", "skip", "pnot"]);

export function looksLikeVideoContainer(head: Uint8Array): boolean {
  if (head.length < 12) return false;
  const atom = String.fromCharCode(head[4], head[5], head[6], head[7]);
  return KNOWN_FIRST_ATOMS.has(atom);
}

export function formatLiveId(n: number): string {
  return `LIVE-${String(n).padStart(3, "0")}`;
}

export function formatMegabytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} МБ`;
}
