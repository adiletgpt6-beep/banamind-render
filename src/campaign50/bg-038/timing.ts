// Шкала BalaGoBG038 по фактической озвучке: каждая сцена длится столько,
// сколько нужно её репликам (lead + речь + паузы + tail, не меньше min).
// Реплики выстраиваются одна за другой; речь не ускоряется и не режется.
// Без озвучки — оценка по тексту (только для черновых кадров).
// Без зависимостей от Remotion (читается и Node-скриптами).
import type { Ts2Char, Ts2Cue, Ts2ManifestLine, Ts2Word } from "../../two-schedules-2d/timing.ts";
import { BG38_LINES, BG38_SCENES, BG38_VIDEO, type Bg38Line, type Bg38SceneId } from "./script.ts";

export type Bg38ManifestLine = Ts2ManifestLine & { readonly text?: string; readonly spoken?: string };

export type Bg38Manifest = {
  readonly version: 1;
  readonly kind: "bg038";
  readonly video?: string;
  readonly estimated?: boolean;
  readonly partial?: boolean;
  readonly lines: readonly Bg38ManifestLine[];
};

const FPS = BG38_VIDEO.fps;
const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 13 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Bg38Line): Bg38ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Ts2Word[] = [];
  const chars: Ts2Char[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.2, letters.length / 13);
    letters.forEach((c, i) => chars.push({ c: c.toLowerCase(), start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—:]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * FPS) }, (_, i) => {
    const s = (i + 0.5) / FPS;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateBg38Manifest = (): Bg38Manifest => ({
  version: 1,
  kind: "bg038",
  estimated: true,
  lines: BG38_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс
// (замер в ролике №12) — сдвигаем их к звуку.
const CHAR_LAG = 0.065;

export type Bg38Scene = { readonly id: Bg38SceneId; readonly title: string; readonly from: number; readonly to: number };

export type Bg38Timeline = {
  readonly scenes: readonly Bg38Scene[];
  readonly cues: readonly Ts2Cue[];
  readonly durationSec: number;
  readonly frames: number;
};

export const buildBg38Timeline = (m: Bg38Manifest): Bg38Timeline => {
  const scenes: Bg38Scene[] = [];
  const cues: Ts2Cue[] = [];
  let t = 0;
  for (const sc of BG38_SCENES) {
    const from = t;
    let cursor = from + sc.lead;
    const lines = BG38_LINES.filter((l) => l.scene === sc.id);
    lines.forEach((l, i) => {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
      const at = cursor + (i > 0 ? l.gap ?? 0.35 : 0);
      const shift = at - ml.speechStart;
      const lag = ml.chars && !m.estimated ? CHAR_LAG : 0;
      const cue: Ts2Cue = {
        // роли этого ролика — подмножество ролей рига №12 (губы мамы)
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
    const lastFileEnd = cues.length && lines.length ? cues[cues.length - 1].audioFrom + cues[cues.length - 1].durationSec : 0;
    const to = Math.max(from + sc.min, cursor + sc.tail, lastFileEnd + 0.1);
    // границы сцен — по кадрам
    const toR = Math.round(to * FPS) / FPS;
    scenes.push({ id: sc.id, title: sc.title, from, to: toR });
    t = toR;
  }
  return { scenes, cues, durationSec: t, frames: Math.round(t * FPS) };
};

export const sceneOf = (tl: Bg38Timeline, id: Bg38SceneId) => {
  const s = tl.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сцены ${id}`);
  return s;
};

// Начало и конец реплики в кадрах сцены.
export const lineFramesIn = (tl: Bg38Timeline, id: string) => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const line = BG38_LINES.find((l) => l.id === id)!;
  const start = sceneOf(tl, line.scene).from;
  return { from: Math.round((c.from - start) * FPS), to: Math.round((c.to - start) * FPS) };
};

// Момент (кадр сцены), когда звучит слово с номером i реплики id.
export const wordFrameIn = (tl: Bg38Timeline, id: string, i: number) => {
  const c = tl.cues.find((x) => x.id === id)!;
  const line = BG38_LINES.find((l) => l.id === id)!;
  const start = sceneOf(tl, line.scene).from;
  const w = c.words[Math.min(Math.max(0, i), c.words.length - 1)];
  const t = w ? w.start : c.from + ((c.to - c.from) * i) / 20;
  return Math.round((t - start) * FPS);
};

// Номер слова реплики, с которого начинается фрагмент текста (по
// произносимому тексту; «—» не слово). Нужен, чтобы события анимации
// совпадали со словами озвучки.
export const wordIndexOf = (id: string, needle: string): number => {
  const line = BG38_LINES.find((l) => l.id === id);
  if (!line) throw new Error(`Нет реплики ${id}`);
  const words = (line.spoken ?? line.text).split(/\s+/).filter((w) => [...w].some((ch) => /[\p{L}\p{N}]/u.test(ch)));
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");
  const want = needle.split(/\s+/).map(norm);
  for (let i = 0; i + want.length <= words.length; i++) {
    if (want.every((w, k) => norm(words[i + k]).startsWith(w))) return i;
  }
  throw new Error(`В реплике ${id} нет «${needle}»`);
};

// Финальная проверка шкалы: длительность 60–95 с, финальный экран с
// контактами ≥ 5 с и ≥ 3 с после последнего слова.
export const checkBg38Timeline = (tl: Bg38Timeline): string[] => {
  const problems: string[] = [];
  const cta = sceneOf(tl, "cta");
  const last = tl.cues[tl.cues.length - 1];
  if (tl.durationSec < 60 || tl.durationSec > 95) problems.push(`длительность ${tl.durationSec.toFixed(1)} с вне 60–95 с`);
  if (tl.durationSec - cta.from < 5.5) problems.push("финальный экран короче 5 с");
  if (tl.durationSec - last.to < 3) problems.push(`после последнего слова только ${(tl.durationSec - last.to).toFixed(2)} с`);
  for (const c of tl.cues) if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
  return problems;
};
