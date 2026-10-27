import { randomUUID } from "node:crypto";
import { UPLOAD_URL_TTL_SECONDS } from "./config";
import { INTAKE_LABEL, uploadMarker, type IssueTracker } from "./github";
import type { ObjectStore } from "./storage";
import {
  formatLiveId,
  formatMegabytes,
  isUploadId,
  looksLikeVideoContainer,
  manifestKey,
  parseSubmitRequest,
  parseUploadRequest,
  sourceObjectKey,
  type VideoContentType,
  type VideoExtension,
} from "./validation";

// Приём исходника: upload URL → проверка объекта в R2 → одна карточка LIVE-NNN.
// Состояние каждой загрузки хранится в приватном R2 (live/uploads/<id>.json),
// поэтому повторы и параллельные нажатия обрабатываются одинаково на любом
// экземпляре serverless-функции.

export type UploadStatus = "pending" | "verified" | "rejected" | "submitted";

export interface UploadManifest {
  version: 1;
  uploadId: string;
  objectKey: string;
  extension: VideoExtension;
  contentType: VideoContentType;
  size: number;
  status: UploadStatus;
  createdAt: string;
  verifiedAt?: string;
  rejectedReason?: string;
  submittedAt?: string;
  title?: string;
  liveId?: string;
  issue?: { number: number; url: string };
}

export interface IntakeDeps {
  store: ObjectStore;
  tracker: IssueTracker;
  maxUploadBytes: number;
  firstLiveNumber: number;
  now?: () => Date;
  newId?: () => string;
}

export class IntakeError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "IntakeError";
  }
}

const SUBMIT_LOCK_STALE_MS = 2 * 60 * 1000;
const MAX_NUMBER_ATTEMPTS = 50;
const SIGNATURE_BYTES = 32;

const nowOf = (deps: IntakeDeps) => (deps.now ? deps.now() : new Date());

async function readManifest(deps: IntakeDeps, uploadId: unknown): Promise<UploadManifest> {
  if (!isUploadId(uploadId)) throw new IntakeError(400, "bad_id", "Некорректный идентификатор загрузки");
  const manifest = await deps.store.getJson<UploadManifest>(manifestKey(uploadId));
  if (!manifest) throw new IntakeError(404, "not_found", "Загрузка не найдена — начните заново");
  return manifest;
}

async function saveManifest(deps: IntakeDeps, manifest: UploadManifest): Promise<void> {
  await deps.store.putJson(manifestKey(manifest.uploadId), manifest);
}

// ── 1. Выдать signed PUT URL ─────────────────────────────────────────────────

export interface CreateUploadResult {
  uploadId: string;
  uploadUrl: string;
  contentType: VideoContentType;
  expiresAt: string;
}

export async function createUpload(deps: IntakeDeps, body: unknown): Promise<CreateUploadResult> {
  const parsed = parseUploadRequest(body, deps.maxUploadBytes);
  if (!parsed.ok) throw new IntakeError(400, "invalid_file", parsed.error);
  const { extension, contentType, size } = parsed.value;

  const uploadId = deps.newId ? deps.newId() : randomUUID();
  const objectKey = sourceObjectKey(uploadId, extension);
  const now = nowOf(deps);
  const manifest: UploadManifest = {
    version: 1,
    uploadId,
    objectKey,
    extension,
    contentType,
    size,
    status: "pending",
    createdAt: now.toISOString(),
  };
  const created = await deps.store.putJson(manifestKey(uploadId), manifest, { onlyIfAbsent: true });
  if (!created) throw new IntakeError(409, "conflict", "Повторите попытку");

  const uploadUrl = await deps.store.presignPut(objectKey, contentType, UPLOAD_URL_TTL_SECONDS);
  return {
    uploadId,
    uploadUrl,
    contentType,
    expiresAt: new Date(now.getTime() + UPLOAD_URL_TTL_SECONDS * 1000).toISOString(),
  };
}

// ── 2. Проверить реально сохранённый объект ──────────────────────────────────

export interface CompleteUploadResult {
  uploadId: string;
  status: UploadStatus;
  size: number;
  liveId?: string;
  issueUrl?: string;
}

async function reject(deps: IntakeDeps, manifest: UploadManifest, reason: string): Promise<never> {
  await deps.store.delete(manifest.objectKey);
  await saveManifest(deps, { ...manifest, status: "rejected", rejectedReason: reason });
  throw new IntakeError(422, "rejected", reason);
}

export async function completeUpload(deps: IntakeDeps, uploadId: unknown): Promise<CompleteUploadResult> {
  const manifest = await readManifest(deps, uploadId);
  const done = (m: UploadManifest): CompleteUploadResult => ({
    uploadId: m.uploadId,
    status: m.status,
    size: m.size,
    liveId: m.liveId,
    issueUrl: m.issue?.url,
  });
  if (manifest.status === "verified" || manifest.status === "submitted") return done(manifest);
  if (manifest.status === "rejected") {
    throw new IntakeError(422, "rejected", manifest.rejectedReason ?? "Файл отклонён — загрузите заново");
  }

  const head = await deps.store.head(manifest.objectKey);
  if (!head) throw new IntakeError(409, "not_uploaded", "Файл ещё не дошёл до хранилища — повторите загрузку");
  if (head.size !== manifest.size) {
    return reject(deps, manifest, "Размер сохранённого файла не совпадает — загрузите заново");
  }
  if (head.size > deps.maxUploadBytes) return reject(deps, manifest, "Файл больше разрешённого размера");
  if (head.contentType !== manifest.contentType) {
    return reject(deps, manifest, "Тип сохранённого файла не совпадает — загрузите заново");
  }
  const signature = await deps.store.readRange(manifest.objectKey, 0, SIGNATURE_BYTES - 1);
  if (!signature || !looksLikeVideoContainer(signature)) {
    return reject(deps, manifest, "Файл не похож на видео MP4/MOV");
  }

  const verified: UploadManifest = { ...manifest, status: "verified", verifiedAt: nowOf(deps).toISOString() };
  await saveManifest(deps, verified);
  return done(verified);
}

// ── 3. Создать ровно одну карточку LIVE-NNN ──────────────────────────────────

export interface SubmitResult {
  liveId: string;
  issueNumber: number;
  issueUrl: string;
  alreadyExisted: boolean;
}

interface NumberClaim {
  uploadId: string;
  claimedAt: string;
  issue?: { number: number; url: string };
}

const numberClaimKey = (liveId: string) => `live/numbers/${liveId}.json`;
const submitLockKey = (uploadId: string) => `live/locks/submit-${uploadId}.json`;

function liveNumberFromTitle(title: string): number | null {
  const match = /^LIVE-(\d{3,4})\b/.exec(title);
  return match ? Number(match[1]) : null;
}

function liveIdFromTitle(title: string): string | null {
  const n = liveNumberFromTitle(title);
  return n === null ? null : formatLiveId(n);
}

async function allocateLiveNumber(
  deps: IntakeDeps,
  uploadId: string,
  issueTitles: string[],
): Promise<string> {
  const repoMax = await deps.tracker.maxRepoLiveNumber();
  // Номер берём только из начала заголовка: текст темы от пользователя не влияет.
  const issuesMax = Math.max(0, ...issueTitles.map((t) => liveNumberFromTitle(t) ?? 0));
  let candidate = Math.max(deps.firstLiveNumber, repoMax + 1, issuesMax + 1);

  for (let attempt = 0; attempt < MAX_NUMBER_ATTEMPTS; attempt++, candidate++) {
    const liveId = formatLiveId(candidate);
    const claim: NumberClaim = { uploadId, claimedAt: nowOf(deps).toISOString() };
    // Атомарный захват номера: при гонке двух загрузок номер получит только одна.
    if (await deps.store.putJson(numberClaimKey(liveId), claim, { onlyIfAbsent: true })) return liveId;
    const existing = await deps.store.getJson<NumberClaim>(numberClaimKey(liveId));
    if (existing?.uploadId === uploadId) return liveId; // наш прошлый незавершённый захват
  }
  throw new IntakeError(503, "no_number", "Не удалось выделить номер LIVE — попробуйте позже");
}

function escapeMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/@/g, "@​") // без случайных упоминаний
    .replace(/([\\`*_[\]#|])/g, "\\$1");
}

export function buildIssueBody(manifest: UploadManifest, liveId: string, title: string, note: string): string {
  const quoted = note
    ? note
        .split("\n")
        .map((line) => `> ${escapeMarkdown(line)}`)
        .join("\n")
    : "_Заметки нет — направление монтажа выбрать по `live/STYLE.md`._";
  return [
    `## ${liveId} — ${title ? escapeMarkdown(title) : "живой ролик BalaGo"}`,
    "",
    "**Статус:** 📥 получено (`recorded`) — исходник загружен через BalaGo Video Studio.",
    "",
    "### Исходник (приватный Cloudflare R2)",
    `- Ключ объекта: \`${manifest.objectKey}\``,
    `- Формат: ${manifest.extension.toUpperCase()} (\`${manifest.contentType}\`), ${formatMegabytes(manifest.size)}`,
    `- Проверен сервером: ${manifest.verifiedAt ?? "—"}`,
    "- Публичной ссылки нет. Скачивание — только через секреты `R2_*` в Actions/Claude Code;",
    "  временные ссылки в эту карточку не публикуются. Если секреты не подключены — см.",
    "  `apps/balago-studio/docs/DEPLOY.md`, раздел «Доступ монтажа к исходникам».",
    "",
    "### Заметка владельца",
    quoted,
    "",
    "### Дальше (Claude Code: автоматический запуск при включённом GitHub Actions)",
    "- Референс монтажа уже есть: `live-videos/reference/REFERENCE.md` — повторно не запрашивать.",
    "- Правила: `AGENTS.md`, `CLAUDE.md`, `live/STYLE.md`, `live-videos/RULES.md`.",
    "- Для LIVE-006+ GitHub Actions может запустить новую сессию Claude Code автоматически, если настроена авторизация и включён `BALAGO_AUTO_CLAUDE_ENABLED`.",
    "- Если автоматизация выключена, карточка останется в статусе `recorded` и видео безопасно сохранится в R2.",
    "- `task.json` создаётся только когда готова композиция; это не команда на публикацию видео.",
    "- Сначала превью 540×960 и подтверждение владельца, затем финал 1080×1920, 30 fps.",
    "",
    uploadMarker(manifest.uploadId),
  ].join("\n");
}

export async function submitUpload(deps: IntakeDeps, uploadId: unknown, body: unknown): Promise<SubmitResult> {
  const parsed = parseSubmitRequest(body);
  if (!parsed.ok) throw new IntakeError(400, "invalid_text", parsed.error);
  let manifest = await readManifest(deps, uploadId);

  const finished = (m: UploadManifest): SubmitResult => ({
    liveId: m.liveId!,
    issueNumber: m.issue!.number,
    issueUrl: m.issue!.url,
    alreadyExisted: true,
  });
  if (manifest.status === "submitted" && manifest.issue && manifest.liveId) return finished(manifest);
  if (manifest.status !== "verified") {
    throw new IntakeError(409, "not_verified", "Сначала дождитесь проверки загруженного файла");
  }

  // Замок от двойного нажатия: второй параллельный запрос получит 409 и повторит позже.
  const lockKey = submitLockKey(manifest.uploadId);
  const lock = { at: nowOf(deps).toISOString() };
  if (!(await deps.store.putJson(lockKey, lock, { onlyIfAbsent: true }))) {
    const current = await deps.store.getJson<{ at: string }>(lockKey);
    const age = current ? nowOf(deps).getTime() - Date.parse(current.at) : Infinity;
    if (age < SUBMIT_LOCK_STALE_MS) {
      throw new IntakeError(409, "in_progress", "Карточка уже создаётся — подождите пару секунд");
    }
    await deps.store.putJson(lockKey, lock); // зависший замок: продолжаем, дубль отсечёт поиск ниже
  }

  try {
    // Перечитываем после захвата замка: параллельный запрос мог уже закончить.
    manifest = await readManifest(deps, manifest.uploadId);
    if (manifest.status === "submitted" && manifest.issue && manifest.liveId) return finished(manifest);

    const issues = await deps.tracker.listIntakeIssues();
    const marker = uploadMarker(manifest.uploadId);
    const existing = issues.find((issue) => issue.body.includes(marker));

    let liveId: string;
    let issue: { number: number; url: string };
    let alreadyExisted = false;
    if (existing) {
      // Карточка создана прошлой попыткой, но запись в R2 не успела — восстанавливаем.
      liveId = liveIdFromTitle(existing.title) ?? formatLiveId(0);
      issue = { number: existing.number, url: existing.url };
      alreadyExisted = true;
    } else {
      liveId = await allocateLiveNumber(deps, manifest.uploadId, issues.map((i) => i.title));
      const { title, note } = parsed.value;
      const created = await deps.tracker.createIssue({
        title: `${liveId} — ${title || "живой ролик (Studio)"}`,
        body: buildIssueBody(manifest, liveId, title, note),
        labels: [INTAKE_LABEL],
      });
      issue = { number: created.number, url: created.url };
      await deps.store.putJson(numberClaimKey(liveId), {
        uploadId: manifest.uploadId,
        claimedAt: nowOf(deps).toISOString(),
        issue,
      } satisfies NumberClaim);
    }

    await saveManifest(deps, {
      ...manifest,
      status: "submitted",
      submittedAt: nowOf(deps).toISOString(),
      title: parsed.value.title || undefined,
      liveId,
      issue,
    });
    return { liveId, issueNumber: issue.number, issueUrl: issue.url, alreadyExisted };
  } finally {
    await deps.store.delete(lockKey);
  }
}
