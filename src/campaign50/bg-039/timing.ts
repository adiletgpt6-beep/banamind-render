// Шкала BalaGoBG039 по фактической озвучке: каждая сцена длится столько,
// сколько нужно её репликам (lead + речь + паузы + tail, не меньше min).
// Реплики выстраиваются одна за другой; речь не ускоряется и не режется.
// Без озвучки — оценка по тексту (только для черновых кадров).
// Без зависимостей от Remotion (читается и Node-скриптами).
import type { Ts2Char, Ts2Cue, Ts2ManifestLine, Ts2Word } from "../../two-schedules-2d/timing.ts";
import { BG39_LINES, BG39_SCENES, BG39_VIDEO, type Bg39Line, type Bg39SceneId } from "./script.ts";

export type Bg39ManifestLine = Ts2ManifestLine & { readonly text?: string; readonly spoken?: string };

export type Bg39Manifest = {
  readonly version: 1;
  readonly kind: "bg039";
  readonly video?: string;
  readonly estimated?: boolean;
  readonly partial?: boolean;
  readonly lines: readonly Bg39ManifestLine[];
};

const FPS = BG39_VIDEO.fps;
const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 14 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Bg39Line): Bg39ManifestLine => {
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
    t += d + (/[.,!?…—:;]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * FPS) }, (_, i) => {
    const s = (i + 0.5) / FPS;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateBg39Manifest = (): Bg39Manifest => ({
  version: 1,
  kind: "bg039",
  estimated: true,
  lines: BG39_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс
// (замер в ролике №12) — сдвигаем их к звуку.
const CHAR_LAG = 0.065;

export type Bg39Scene = { readonly id: Bg39SceneId; readonly title: string; readonly from: number; readonly to: number };

export type Bg39Timeline = {
  readonly scenes: readonly Bg39Scene[];
  readonly cues: readonly Ts2Cue[];
  readonly durationSec: number;
  readonly frames: number;
};

export const buildBg39Timeline = (m: Bg39Manifest): Bg39Timeline => {
  const scenes: Bg39Scene[] = [];
  const cues: Ts2Cue[] = [];
  let t = 0;
  for (const sc of BG39_SCENES) {
    const from = t;
    let cursor = from + sc.lead;
    const lines = BG39_LINES.filter((l) => l.scene === sc.id);
    lines.forEach((l, i) => {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
      const at = cursor + (i > 0 ? l.gap ?? 0.35 : 0);
      const shift = at - ml.speechStart;
      const lag = ml.chars && !m.estimated ? CHAR_LAG : 0;
      const cue: Ts2Cue = {
        id: l.id,
        role: l.role,
        file: ml.file,
        audioFrom: shift,
        durationSec: ml.durationSec,
        from: at,
        to: at + (ml.speechEnd - ml.speechStart),
        words: (est.words ?? []).map((w) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
        chars: (est.chars ?? []).map((c) => ({ c: c.c, start: c.start + shift + lag, end: c.end + shift + lag })),
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

export const sceneOf = (tl: Bg39Timeline, id: Bg39SceneId) => {
  const s = tl.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сцены ${id}`);
  return s;
};

export const cueOf = (tl: Bg39Timeline, id: string) => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return c;
};

// Начало и конец реплики в кадрах её сцены.
export const lineFramesIn = (tl: Bg39Timeline, id: string) => {
  const c = cueOf(tl, id);
  const line = BG39_LINES.find((l) => l.id === id)!;
  const start = sceneOf(tl, line.scene).from;
  return { from: Math.round((c.from - start) * FPS), to: Math.round((c.to - start) * FPS) };
};

// Кадр сцены, когда звучит слово реплики id, начинающееся с prefix
// (без учёта регистра и знаков; nth — какое по счёту совпадение).
// Не найдено — доля fallback от длины реплики.
export const wordFrameAt = (tl: Bg39Timeline, id: string, prefix: string, fallback: number, nth = 0) => {
  const c = cueOf(tl, id);
  const line = BG39_LINES.find((l) => l.id === id)!;
  const start = sceneOf(tl, line.scene).from;
  const p = prefix.toLowerCase();
  const hits = c.words.filter((w) => w.text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").startsWith(p));
  const t = hits[nth]?.start ?? c.from + (c.to - c.from) * fallback;
  return Math.round((t - start) * FPS);
};

// Финальная проверка шкалы: длительность 70–100 с, финальный экран с
// контактами ≥ 8 с и ≥ 3 с после последнего слова, реплики не наезжают.
export const checkBg39Timeline = (tl: Bg39Timeline): string[] => {
  const problems: string[] = [];
  const cta = sceneOf(tl, "cta");
  const last = tl.cues[tl.cues.length - 1];
  if (tl.durationSec < 70 || tl.durationSec > 100) problems.push(`длительность ${tl.durationSec.toFixed(1)} с вне 70–100 с`);
  if (tl.durationSec - cta.from < 8) problems.push(`финальный экран ${(tl.durationSec - cta.from).toFixed(2)} с (нужно ≥ 8 с)`);
  if (tl.durationSec - last.to < 3) problems.push(`после последнего слова только ${(tl.durationSec - last.to).toFixed(2)} с`);
  tl.cues.forEach((c, i) => {
    const next = tl.cues[i + 1];
    if (next && c.to + 0.25 > next.from) problems.push(`${c.id}: речь до ${c.to.toFixed(2)} с наезжает на ${next.id}`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
  });
  return problems;
};
