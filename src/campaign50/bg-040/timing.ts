// Шкала BalaGoBG040 по фактической озвучке: каждая сцена длится столько,
// сколько нужно её репликам (lead + речь + паузы + tail, не меньше min).
// Реплики выстраиваются одна за другой; речь не ускоряется и не режется.
// Без озвучки — оценка по тексту (только для черновых кадров).
// Без зависимостей от Remotion (читается и Node-скриптами).
import type { Ts2Char, Ts2Cue, Ts2ManifestLine, Ts2Word } from "../../two-schedules-2d/timing.ts";
import { BG40_LINES, BG40_SCENES, BG40_VIDEO, type Bg40Line, type Bg40SceneId } from "./script.ts";

export type Bg40ManifestLine = Ts2ManifestLine & { readonly text?: string; readonly spoken?: string };

export type Bg40Manifest = {
  readonly version: 1;
  readonly kind: "bg040";
  readonly video?: string;
  readonly estimated?: boolean;
  readonly partial?: boolean;
  readonly lines: readonly Bg40ManifestLine[];
};

const FPS = BG40_VIDEO.fps;
const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 13 букв в секунду (кыргызский синтез чуть медленнее 14),
// паузы на знаках препинания.
export const estimateLine = (l: Bg40Line): Bg40ManifestLine => {
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
    t += d + (/[.,!?…—:]$/.test(w) ? 0.32 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * FPS) }, (_, i) => {
    const s = (i + 0.5) / FPS;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateBg40Manifest = (): Bg40Manifest => ({
  version: 1,
  kind: "bg040",
  estimated: true,
  lines: BG40_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс
// (замер в ролике №12) — сдвигаем их к звуку.
const CHAR_LAG = 0.065;

export type Bg40Scene = { readonly id: Bg40SceneId; readonly title: string; readonly from: number; readonly to: number };

export type Bg40Timeline = {
  readonly scenes: readonly Bg40Scene[];
  readonly cues: readonly Ts2Cue[];
  readonly durationSec: number;
  readonly frames: number;
};

export const buildBg40Timeline = (m: Bg40Manifest): Bg40Timeline => {
  const scenes: Bg40Scene[] = [];
  const cues: Ts2Cue[] = [];
  let t = 0;
  for (const sc of BG40_SCENES) {
    const from = t;
    let cursor = from + sc.lead;
    const lines = BG40_LINES.filter((l) => l.scene === sc.id);
    lines.forEach((l, i) => {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
      const at = cursor + (i > 0 ? l.gap ?? 0.35 : 0);
      const shift = at - ml.speechStart;
      const lag = ml.chars && !m.estimated ? CHAR_LAG : 0;
      const cue: Ts2Cue = {
        id: l.id,
        // роли этого ролика входят в роли общего рига (губы по роли)
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

export const sceneOf = (tl: Bg40Timeline, id: Bg40SceneId) => {
  const s = tl.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сцены ${id}`);
  return s;
};

// Длительность сцены в кадрах.
export const sceneFrames = (tl: Bg40Timeline, id: Bg40SceneId) => {
  const s = sceneOf(tl, id);
  return Math.round(s.to * FPS) - Math.round(s.from * FPS);
};

// Начало и конец реплики в кадрах сцены.
export const lineFramesIn = (tl: Bg40Timeline, id: string) => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const line = BG40_LINES.find((l) => l.id === id)!;
  const start = Math.round(sceneOf(tl, line.scene).from * FPS);
  return { from: Math.round(c.from * FPS) - start, to: Math.round(c.to * FPS) - start };
};

// Индекс слова реплики, начинающегося с заданного текста (без регистра);
// nth — какое по счёту совпадение (0 — первое).
export const wordIndex = (id: string, prefix: string, nth = 0) => {
  const line = BG40_LINES.find((l) => l.id === id)!;
  const words = (line.spoken ?? line.text).split(/\s+/).filter((w) => [...w].some(isLetter));
  const hits = words.map((w, i) => (w.toLowerCase().replace(/[^\p{L}]/gu, "").startsWith(prefix.toLowerCase()) ? i : -1)).filter((i) => i >= 0);
  if (hits.length <= nth) throw new Error(`В реплике ${id} нет слова «${prefix}» (№ ${nth + 1})`);
  return hits[nth];
};

// Момент (кадр сцены), когда начинается слово с номером i реплики id.
export const wordFrameIn = (tl: Bg40Timeline, id: string, i: number) => {
  const c = tl.cues.find((x) => x.id === id)!;
  const line = BG40_LINES.find((l) => l.id === id)!;
  const start = Math.round(sceneOf(tl, line.scene).from * FPS);
  const w = c.words[Math.min(Math.max(0, i), c.words.length - 1)];
  const t = w ? w.start : c.from + ((c.to - c.from) * i) / 20;
  return Math.round(t * FPS) - start;
};

// Финальная проверка шкалы: длительность 70–95 с (ориентир сценария
// 75–90 с), финальный экран с контактами ≥ 5 с и ≥ 3 с после последнего
// слова; ни одна реплика не начинается раньше начала файла.
export const checkBg40Timeline = (tl: Bg40Timeline): string[] => {
  const problems: string[] = [];
  const cta = sceneOf(tl, "cta");
  const last = tl.cues[tl.cues.length - 1];
  if (tl.durationSec < 70 || tl.durationSec > 95) problems.push(`длительность ${tl.durationSec.toFixed(1)} с вне 70–95 с`);
  if (tl.durationSec - cta.from < 8) problems.push("финальный экран короче 8 с");
  if (tl.durationSec - last.to < 3) problems.push(`после последнего слова только ${(tl.durationSec - last.to).toFixed(2)} с`);
  for (const c of tl.cues) if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
  // реплики не перекрываются
  for (let i = 1; i < tl.cues.length; i++) {
    const a = tl.cues[i - 1];
    const b = tl.cues[i];
    if (b.audioFrom < a.audioFrom + a.durationSec - 0.05) problems.push(`${b.id} перекрывает ${a.id}`);
  }
  return problems;
};

// Кадр сцены, когда начинается слово реплики (по префиксу; nth — номер совпадения).
export const wordAt = (tl: Bg40Timeline, id: string, prefix: string, nth = 0) => wordFrameIn(tl, id, wordIndex(id, prefix, nth));
