// Шкала BalaGoBG047 по фактической озвучке: каждая сцена длится столько,
// сколько нужно её репликам (lead + речь + паузы + tail, не меньше min).
// Реплики выстраиваются одна за другой; речь не ускоряется и не режется.
// Без озвучки — оценка по тексту (только для черновых кадров).
// Без зависимостей от Remotion (читается и Node-скриптами).
import type { Ts2Char, Ts2ManifestLine, Ts2Word } from "../../two-schedules-2d/timing.ts";
import { BG47_CTA_FULL_SEC, BG47_LINES, BG47_SCENES, BG47_VIDEO, type Bg47Line, type Bg47SceneId, type Bg47Voice, type Bg47Who } from "./script.ts";

export type Bg47ManifestLine = Ts2ManifestLine & { readonly text?: string; readonly spoken?: string };

export type Bg47Manifest = {
  readonly version: 1;
  readonly kind: "bg047";
  readonly video?: string;
  readonly estimated?: boolean;
  readonly partial?: boolean;
  readonly lines: readonly Bg47ManifestLine[];
};

export type Bg47Cue = {
  readonly id: string;
  readonly role: Bg47Voice;
  readonly who: Bg47Who;
  readonly file?: string;
  readonly audioFrom: number; // начало файла (с от начала ролика)
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly Ts2Word[];
  readonly env: readonly number[]; // громкость по кадрам от audioFrom, 0…1
};

const FPS = BG47_VIDEO.fps;
const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 14 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Bg47Line): Bg47ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Ts2Word[] = [];
  const chars: Ts2Char[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.2, letters.length / 14);
    letters.forEach((c, i) => chars.push({ c: c.toLowerCase(), start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—:]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * FPS) }, (_, i) => {
    const s = (i + 0.5) / FPS;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.55 + 0.35 * Math.abs(Math.sin(i * 1.7)) : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateBg47Manifest = (): Bg47Manifest => ({
  version: 1,
  kind: "bg047",
  estimated: true,
  lines: BG47_LINES.map(estimateLine),
});

export type Bg47Scene = { readonly id: Bg47SceneId; readonly title: string; readonly from: number; readonly to: number };

export type Bg47Timeline = {
  readonly scenes: readonly Bg47Scene[];
  readonly cues: readonly Bg47Cue[];
  readonly durationSec: number;
  readonly frames: number;
};

export const buildBg47Timeline = (m: Bg47Manifest): Bg47Timeline => {
  const scenes: Bg47Scene[] = [];
  const cues: Bg47Cue[] = [];
  let t = 0;
  for (const sc of BG47_SCENES) {
    const from = t;
    let cursor = from + sc.lead;
    const lines = BG47_LINES.filter((l) => l.scene === sc.id);
    lines.forEach((l, i) => {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const est = ml.words && ml.env ? ml : { ...estimateLine(l), ...ml };
      const at = cursor + (i > 0 ? (l.gap ?? 0.35) : 0);
      const shift = at - ml.speechStart;
      const cue: Bg47Cue = {
        id: l.id,
        role: l.role,
        who: l.who,
        file: ml.file,
        audioFrom: shift,
        durationSec: ml.durationSec,
        from: at,
        to: at + (ml.speechEnd - ml.speechStart),
        words: (est.words ?? []).map((w) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
        env: est.env ?? [],
      };
      cues.push(cue);
      cursor = cue.to;
    });
    // сцена кончается не раньше, чем доиграет файл последней реплики
    const last = lines.length ? cues[cues.length - 1] : null;
    const lastFileEnd = last ? last.audioFrom + last.durationSec : 0;
    const to = Math.max(from + sc.min, cursor + sc.tail, lastFileEnd + 0.1);
    // границы сцен — по кадрам
    const toR = Math.round(to * FPS) / FPS;
    scenes.push({ id: sc.id, title: sc.title, from, to: toR });
    t = toR;
  }
  return { scenes, cues, durationSec: t, frames: Math.round(t * FPS) };
};

export const sceneOf = (tl: Bg47Timeline, id: Bg47SceneId) => {
  const s = tl.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сцены ${id}`);
  return s;
};

const cueOf = (tl: Bg47Timeline, id: string) => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return c;
};

const sceneStartOfLine = (tl: Bg47Timeline, id: string) => {
  const line = BG47_LINES.find((l) => l.id === id);
  if (!line) throw new Error(`Нет реплики ${id}`);
  return sceneOf(tl, line.scene).from;
};

// Начало и конец реплики в кадрах сцены.
export const lineFramesIn = (tl: Bg47Timeline, id: string) => {
  const c = cueOf(tl, id);
  const start = sceneStartOfLine(tl, id);
  return { from: Math.round((c.from - start) * FPS), to: Math.round((c.to - start) * FPS) };
};

// Момент (кадр сцены), когда начинается слово с номером i реплики id.
export const wordFrameIn = (tl: Bg47Timeline, id: string, i: number) => {
  const c = cueOf(tl, id);
  const start = sceneStartOfLine(tl, id);
  const w = c.words[Math.min(Math.max(0, i), c.words.length - 1)];
  const t = w ? w.start : c.from + ((c.to - c.from) * i) / 20;
  return Math.round((t - start) * FPS);
};

// Громкость речи персонажа who в кадре ролика f (0…1) — для губ.
export const speechEnvAt = (tl: Bg47Timeline, who: Bg47Who, f: number) => {
  const t = f / FPS;
  for (const c of tl.cues) {
    if (c.who !== who || t < c.from - 0.05 || t > c.to + 0.1) continue;
    const k = f - Math.round(c.audioFrom * FPS); // как у звуковой Sequence
    return c.env[k] ?? 0;
  }
  return 0;
};

// Финальная проверка шкалы: длительность 62–95 с, финальный экран с
// контактами ≥ 5 с и ≥ 3 с после последнего слова.
export const checkBg47Timeline = (tl: Bg47Timeline): string[] => {
  const problems: string[] = [];
  const cta = sceneOf(tl, "cta");
  const last = tl.cues[tl.cues.length - 1];
  if (tl.durationSec < 62 || tl.durationSec > 95) problems.push(`длительность ${tl.durationSec.toFixed(1)} с вне 62–95 с`);
  if (tl.durationSec - cta.from - BG47_CTA_FULL_SEC < 5.5) problems.push("контакты полностью видны меньше 5,5 с");
  if (tl.durationSec - last.to < 3) problems.push(`после последнего слова только ${(tl.durationSec - last.to).toFixed(2)} с`);
  for (const c of tl.cues) if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
  return problems;
};
