// Хронометраж выпуска строится по фактической озвучке: каждая реплика
// начинается после конца предыдущей плюс пауза; сцена начинается чуть раньше
// своей первой реплики и заканчивается на начале следующей сцены.
// Без озвучки (черновые кадры до синтеза) длительность реплики оценивается
// по числу слов — финальный рендер так не собирается (см. Root.tsx).
import type { Scene } from "./episode/types";

export type Word = { text: string; start: number; end: number };
export type VoiceLine = {
  id: string;
  file: string;
  hash: string;
  duration: number; // длина файла, с
  speechStart: number;
  speechEnd: number;
  words: Word[];
  chars: { c: string; start: number; end: number }[];
};
export type VoiceManifest = { version: 1; voice: string; model: string; lines: VoiceLine[] };

export type TimedLine = {
  id: string;
  sceneId: string;
  text: string;
  from: number; // начало файла в ролике, с
  speechFrom: number; // начало речи, с
  speechTo: number;
  file: string | null;
  words: Word[]; // абсолютное время
  chars: { c: string; start: number; end: number }[];
  anchors?: Record<string, string>;
};
export type TimedScene = { id: string; from: number; to: number; lines: TimedLine[] };
export type Timeline = { scenes: TimedScene[]; lines: TimedLine[]; duration: number };

export const FPS = 30;
const LEAD_IN = 0.7; // тишина в начале ролика
const DEFAULT_GAP = 0.32; // пауза между репликами внутри сцены
const SCENE_GAP = 0.75; // пауза при смене сцены
const SCENE_LEAD = 0.45; // сцена появляется до первой реплики
const TAIL = 3.2; // финальный кадр после последнего слова

const estimate = (text: string, at: number): { words: Word[]; dur: number } => {
  const parts = text.split(/\s+/).filter(Boolean);
  const words: Word[] = [];
  let t = 0.05;
  for (const p of parts) {
    const len = 0.12 + p.replace(/[^\p{L}\p{N}]/gu, "").length * 0.055;
    words.push({ text: p, start: at + t, end: at + t + len });
    t += len + 0.07 + (/[.,!?:;—]$/.test(p) ? 0.18 : 0);
  }
  return { words, dur: t + 0.1 };
};

export const buildTimeline = (scenes: Scene[], manifest: VoiceManifest | null): Timeline => {
  const byId = new Map(manifest?.lines.map((l) => [l.id, l]) ?? []);
  const out: TimedScene[] = [];
  const all: TimedLine[] = [];
  let t = LEAD_IN;
  scenes.forEach((sc, si) => {
    if (si > 0) t += SCENE_GAP + (sc.extraLead ?? 0);
    const sceneFrom = Math.max(0, t - SCENE_LEAD);
    const lines: TimedLine[] = [];
    for (const ln of sc.lines) {
      const v = byId.get(ln.id);
      if (v) {
        const from = t - v.speechStart;
        const shift = (x: number) => +(x + from).toFixed(3);
        const tl: TimedLine = {
          id: ln.id,
          sceneId: sc.id,
          text: ln.text,
          from,
          speechFrom: shift(v.speechStart),
          speechTo: shift(v.speechEnd),
          file: v.file,
          words: v.words.map((w) => ({ text: w.text, start: shift(w.start), end: shift(w.end) })),
          chars: v.chars.map((c) => ({ c: c.c, start: shift(c.start), end: shift(c.end) })),
          anchors: ln.anchors,
        };
        lines.push(tl);
        t = tl.speechTo + (ln.pauseAfter ?? DEFAULT_GAP);
      } else {
        const e = estimate(ln.text, t);
        lines.push({ id: ln.id, sceneId: sc.id, text: ln.text, from: t, speechFrom: t, speechTo: t + e.dur, file: null, words: e.words, chars: [], anchors: ln.anchors });
        t += e.dur + (ln.pauseAfter ?? DEFAULT_GAP);
      }
    }
    // сцена держится ещё немного после последней реплики (hold)
    t += sc.hold ?? 0;
    out.push({ id: sc.id, from: sceneFrom, to: 0, lines });
    all.push(...lines);
  });
  const duration = t + TAIL;
  out.forEach((s, i) => (s.to = i + 1 < out.length ? out[i + 1].from : duration));
  return { scenes: out, lines: all, duration };
};

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}$]/gu, "");

/** Время (с) начала слова, содержащего `word`, в реплике; без слова — начало речи. */
export const wordTime = (tl: Timeline, lineId: string, word?: string, nth = 0, edge: "start" | "end" = "start"): number => {
  const ln = tl.lines.find((l) => l.id === lineId);
  if (!ln) throw new Error(`Нет реплики ${lineId}`);
  if (!word) return edge === "start" ? ln.speechFrom : ln.speechTo;
  // русская версия: английское слово привязки → русское слово-якорь
  const anchor = ln.anchors?.[nth ? `${word}#${nth}` : word];
  if (ln.anchors && anchor === undefined) throw new Error(`В реплике ${lineId} нет якоря для «${word}${nth ? "#" + nth : ""}»`);
  if (anchor !== undefined) {
    const [w2, n2] = anchor.split("#");
    word = w2;
    nth = n2 ? Number(n2) : 0;
  }
  const key = norm(word);
  const hits = ln.words.filter((w) => norm(w.text).includes(key));
  const w = hits[nth];
  if (!w) throw new Error(`В реплике ${lineId} нет слова «${word}»`);
  return edge === "start" ? w.start : w.end;
};

/** Разбор привязки Cue (см. episode/types.ts) во время, с. */
export const cueTime = (tl: Timeline, cue: string): number => {
  const m = /^([^@$+\-]+)(?:@([^#+\-]+)(?:#(\d+))?)?(\$)?([+-]\d+(?:\.\d+)?)?$/.exec(cue.trim());
  if (!m) throw new Error(`Неверная привязка «${cue}»`);
  const [, line, word, nth, end, off] = m;
  const base = wordTime(tl, line, word, nth ? Number(nth) : 0, end ? "end" : "start");
  return base + (off ? Number(off) : 0);
};
