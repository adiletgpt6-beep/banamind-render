// Хронометраж фильма по фактической озвучке (схема lesson-traktat): реплика
// начинается после конца предыдущей плюс пауза. Запас до целевой длительности
// равномерно распределяется по паузам между сценами и репликами в пределах
// лимитов — речь никогда не ускоряется. Пилот собирается без растяжки (target 0).
// Без озвучки (черновые кадры) длительность реплики оценивается по тексту.
import type { Scene } from "./types";

export type Word = { text: string; start: number; end: number };
export type VoiceLine = {
  id: string;
  file: string;
  hash: string;
  duration: number;
  speechStart: number;
  speechEnd: number;
  words: Word[];
  chars: { c: string; start: number; end: number }[];
  env: number[]; // громкость речи по кадрам (30 fps), 0…1
};
export type VoiceManifest = { version: 1; engine: string; voice: string; lines: VoiceLine[] };

export type TimedLine = {
  id: string;
  sceneId: string;
  index: number; // номер реплики в сцене
  text: string;
  from: number; // начало файла, с
  speechFrom: number;
  speechTo: number;
  file: string | null;
  duration: number;
  words: Word[];
  chars: { c: string; start: number; end: number }[];
  env: number[];
};
export type TimedScene = { id: string; index: number; from: number; to: number; lines: TimedLine[] };
export type Timeline = { scenes: TimedScene[]; lines: TimedLine[]; duration: number; natural: number };

export const FPS = 30;
export const TARGET = 1800; // 30:00 (допуск 29:30–30:30)
const LEAD_IN = 0.5; // вступление начинается сразу, без заставки
const LINE_GAP = 0.55;
const SCENE_GAP = 1.4;
const SCENE_LEAD = 0.6;
const TAIL = 6;
const MAX_SCENE_EXTRA = 4;
const MAX_LINE_EXTRA = 0.7;
const TIGHT_LINE_GAP = 0.35;

export const estimate = (text: string): { words: Word[]; dur: number } => {
  const parts = text.split(/\s+/).filter(Boolean);
  const words: Word[] = [];
  let t = 0.08;
  for (const p of parts) {
    const len = 0.1 + p.replace(/[^\p{L}\p{N}]/gu, "").length * 0.062;
    words.push({ text: p, start: t, end: t + len });
    t += len + 0.06 + (/[.,!?:;—]$/.test(p) ? 0.22 : 0);
  }
  return { words, dur: t + 0.12 };
};

type Gaps = { scene: number; line: number };

const layout = (scenes: Scene[], manifest: VoiceManifest | null, extra: Gaps) => {
  const byId = new Map(manifest?.lines.map((l) => [l.id, l]) ?? []);
  const out: TimedScene[] = [];
  const all: TimedLine[] = [];
  let t = LEAD_IN;
  scenes.forEach((sc, si) => {
    if (si > 0) t += sc.gap ?? SCENE_GAP + extra.scene;
    const sceneFrom = si === 0 ? 0 : Math.max(0, t - SCENE_LEAD);
    const lines: TimedLine[] = [];
    sc.lines.forEach((ln, li) => {
      const v = byId.get(ln.id);
      const est = v ? null : estimate(ln.text);
      const speechStart = v ? v.speechStart : 0;
      const from = t - speechStart;
      const shift = (x: number) => +(x + from).toFixed(3);
      const speechEnd = v ? v.speechEnd : est!.dur;
      const tl: TimedLine = {
        id: ln.id,
        sceneId: sc.id,
        index: li,
        text: ln.text,
        from,
        speechFrom: shift(speechStart),
        speechTo: shift(speechEnd),
        file: v?.file ?? null,
        duration: v?.duration ?? est!.dur,
        words: (v ? v.words : est!.words).map((w) => ({ text: w.text, start: shift(w.start), end: shift(w.end) })),
        chars: (v?.chars ?? []).map((c) => ({ c: c.c, start: shift(c.start), end: shift(c.end) })),
        env: v?.env ?? [],
      };
      t = tl.speechTo;
      t += (ln.pause ?? 0) + (li < sc.lines.length - 1 ? (sc.tight ? TIGHT_LINE_GAP : LINE_GAP + extra.line) : 0);
      lines.push(tl);
      all.push(tl);
    });
    out.push({ id: sc.id, index: si, from: sceneFrom, to: 0, lines });
  });
  const duration = t + TAIL;
  out.forEach((s, i) => (s.to = i + 1 < out.length ? out[i + 1].from : duration));
  return { scenes: out, lines: all, duration };
};

export const buildTimeline = (scenes: Scene[], manifest: VoiceManifest | null, target = TARGET): Timeline => {
  const base = layout(scenes, manifest, { scene: 0, line: 0 });
  let missing = target - base.duration;
  if (missing <= 0) return { ...base, natural: base.duration };
  // вступление (gap/tight) не растягивается — запас уходит в основную часть
  const nScene = scenes.filter((s, i) => i > 0 && s.gap === undefined).length;
  const nLine = scenes.reduce((a, s) => a + (s.tight ? 0 : s.lines.length - 1), 0);
  const scene = Math.min(MAX_SCENE_EXTRA, missing / Math.max(1, nScene));
  missing -= scene * nScene;
  const line = Math.min(MAX_LINE_EXTRA, Math.max(0, missing) / Math.max(1, nLine));
  const tl = layout(scenes, manifest, { scene, line });
  return { ...tl, natural: base.duration };
};

export const frames = (sec: number) => Math.round(sec * FPS);
