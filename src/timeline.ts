// Монтаж под речь: из таймингов дикторской дорожки (manifest.json,
// его создаёт scripts/generate-voice.mjs) считаем начало каждой сцены
// и моменты смысловых акцентов (кадры, когда звучит нужное слово).
// Если озвучки ещё нет — тайминги оцениваются по длине текста, чтобы
// проект открывался в Studio и рендерился.
//
// Файл без зависимостей от Remotion: его использует и Node-скрипт
// контрольных кадров.
import {
  NARRATION,
  SCENE_PLAN,
  TIMING,
  VIDEO,
  type SceneId,
  type Timing,
} from "./config.ts";

export type NarrationWord = {
  readonly text: string;
  readonly start: number;
  readonly end: number;
  readonly segment: string;
};

export type NarrationManifest = {
  readonly version: 2;
  readonly file: string | null;
  readonly durationSec: number;
  readonly segments: { id: string; start: number; end: number }[];
  readonly words: NarrationWord[];
  readonly estimated?: boolean;
};

export type SceneTiming = {
  readonly id: SceneId;
  readonly from: number; // кадр начала сцены в ролике
  readonly durationInFrames: number; // длительность в TransitionSeries
};

export type ScenePlan = readonly {
  id: SceneId;
  segments: readonly string[];
}[];

export type Timeline = {
  readonly plan: ScenePlan;
  readonly timing: Timing;
  readonly durationInFrames: number;
  readonly narrationFrom: number;
  readonly scenes: SceneTiming[];
  readonly manifest: NarrationManifest;
};

const normalizeWord = (s: string) =>
  s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

// Оценка темпа без озвучки: ~15 символов в секунду + паузы между фразами.
export const estimateManifest = (
  narration: { segments: readonly { id: string; text: string }[] } = NARRATION,
): NarrationManifest => {
  const words: NarrationWord[] = [];
  const segments: { id: string; start: number; end: number }[] = [];
  let t = 0;
  for (const seg of narration.segments) {
    const start = t;
    for (const w of seg.text.split(/\s+/).filter(Boolean)) {
      if (!/[\p{L}\p{N}]/u.test(w)) continue;
      const d = Math.max(0.18, w.length / 15);
      words.push({ text: w, start: t, end: t + d, segment: seg.id });
      t += d + 0.06;
    }
    segments.push({ id: seg.id, start, end: t });
    t += 0.35;
  }
  return {
    version: 2,
    file: null,
    durationSec: t,
    segments,
    words,
    estimated: true,
  };
};

export const buildTimeline = (
  manifest: NarrationManifest,
  fps: number = VIDEO.fps,
  plan: ScenePlan = SCENE_PLAN,
  timing: Timing = TIMING,
): Timeline => {
  const narrationFrom = Math.round(timing.narrationStartSec * fps);
  const segStart = (id: string) => {
    const s = manifest.segments.find((x) => x.id === id);
    if (!s) throw new Error(`В озвучке нет фрагмента «${id}».`);
    return s.start;
  };
  const lastSeg = manifest.segments[manifest.segments.length - 1];
  const voiceEndFrame = narrationFrom + Math.ceil(lastSeg.end * fps);
  const maxFrames = Math.round(timing.maxSec * fps);
  const requiredFrames = Math.max(
    voiceEndFrame + Math.round(timing.ctaHoldSec * fps),
    narrationFrom + Math.ceil(manifest.durationSec * fps),
  );
  // Готовая озвучка, включая восстановленную из кэша, должна поместиться
  // целиком и оставить время на финальный призыв. Ограничение длины
  // допустимо только для оценочного монтажа без аудиофайла.
  if (manifest.file && requiredFrames > maxFrames) {
    throw new Error(
      `Озвучка с финальным призывом требует ${(requiredFrames / fps).toFixed(2)} с, ` +
        `больше ${timing.maxSec} с. Сократите текст и пересоздайте озвучку; речь не обрезаем.`,
    );
  }
  const durationInFrames = Math.min(
    maxFrames,
    Math.max(Math.round(timing.minSec * fps), requiredFrames),
  );

  // Сцена появляется чуть раньше своей фразы (lead), первая — с кадра 0.
  const starts = plan.map((scene, i) =>
    i === 0
      ? 0
      : Math.max(
          0,
          narrationFrom +
            Math.round(
              (segStart(scene.segments[0]) - timing.sceneLeadSec) * fps,
            ),
        ),
  );
  const T = timing.transitionFrames;
  const total = durationInFrames;
  const scenes: SceneTiming[] = plan.map((scene, i) => {
    const next = i + 1 < starts.length ? starts[i + 1] : total;
    const isLast = i === plan.length - 1;
    const length = next - starts[i] + (isLast ? 0 : T);
    if (length <= T + 1) {
      throw new Error(
        `Сцена «${scene.id}» слишком короткая (${length} кадров).`,
      );
    }
    return { id: scene.id, from: starts[i], durationInFrames: length };
  });
  return { plan, timing, durationInFrames, narrationFrom, scenes, manifest };
};

// Кадр (относительно начала сцены), когда звучит слово.
// match — начало слова без учёта регистра и знаков; nth — какое по счёту
// совпадение внутри фрагментов этой сцены. Если не нашли — fallback.
export const wordCue = (
  timeline: Timeline,
  sceneId: SceneId,
  match: string,
  fallbackFrame: number,
  nth = 0,
  fps: number = VIDEO.fps,
): number => {
  const scene = timeline.scenes.find((s) => s.id === sceneId);
  const plan = timeline.plan.find((s) => s.id === sceneId);
  if (!scene || !plan) return fallbackFrame;
  const key = normalizeWord(match);
  const hits = timeline.manifest.words.filter(
    (w) =>
      (plan.segments as readonly string[]).includes(w.segment) &&
      normalizeWord(w.text).startsWith(key),
  );
  const hit = hits[nth];
  if (!hit) return fallbackFrame;
  return Math.max(
    0,
    timeline.narrationFrom + Math.round(hit.start * fps) - scene.from,
  );
};

// Кадр (относительно сцены), когда начинается фрагмент озвучки.
export const segmentCue = (
  timeline: Timeline,
  sceneId: SceneId,
  segmentId: string,
  fps: number = VIDEO.fps,
): number => {
  const scene = timeline.scenes.find((s) => s.id === sceneId);
  const seg = timeline.manifest.segments.find((s) => s.id === segmentId);
  if (!scene || !seg) return 0;
  return Math.max(
    0,
    timeline.narrationFrom + Math.round(seg.start * fps) - scene.from,
  );
};

// Интервалы речи (в кадрах ролика) для приглушения музыки.
// Близкие фразы склеиваются, чтобы музыка не «качалась».
export const speechIntervals = (
  timeline: Timeline,
  fps: number = VIDEO.fps,
): [number, number][] => {
  if (!timeline.manifest.file) return [];
  const out: [number, number][] = [];
  for (const s of timeline.manifest.segments) {
    const a = timeline.narrationFrom + Math.floor(s.start * fps);
    const b = timeline.narrationFrom + Math.ceil(s.end * fps);
    const last = out[out.length - 1];
    if (last && a - last[1] < Math.round(0.8 * fps)) last[1] = b;
    else out.push([a, b]);
  }
  return out;
};
