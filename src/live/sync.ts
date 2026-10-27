// Синхронизация графики с живой речью: все моменты задаются в секундах
// исходной записи (по расшифровке), а не произвольными таймерами.
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export type LiveWord = {
  readonly text: string; // как в субтитрах (с пунктуацией)
  readonly start: number; // секунды от начала исходника
  readonly end: number;
};

export type LivePhrase = {
  readonly id: string;
  readonly words: readonly LiveWord[];
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeBack = Easing.bezier(0.34, 1.45, 0.64, 1);

// 0 → 1 за dur секунд, начиная с момента at.
export const ramp = (t: number, at: number, dur = 0.4, easing = easeOut) =>
  Number.isFinite(at) ? interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing }) : 0;

// Появление в at и исчезновение в out (оба края мягкие).
export const window01 = (t: number, at: number, out: number, inDur = 0.35, outDur = 0.3) =>
  Math.min(ramp(t, at, inDur), 1 - ramp(t, out - outDur, outDur, easeInOut));

export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// Пружина без перелёта за пределы 1.12 (детерминированно по времени).
export const springy = (t: number, at: number, dur = 0.55) => {
  const x = Math.max(0, Math.min(1, (t - at) / dur));
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 1 - Math.exp(-6 * x) * Math.cos(x * 9.5);
};

// Слово по тексту (без пунктуации и регистра), n-е вхождение начиная с 0.
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}:]/gu, "");
export const findWord = (words: readonly LiveWord[], text: string, nth = 0): LiveWord => {
  const key = norm(text);
  const hits = words.filter((w) => norm(w.text) === key);
  const w = hits[nth];
  if (!w) throw new Error(`Слово «${text}» (#${nth}) не найдено в расшифровке`);
  return w;
};

// Какое слово звучит в момент t (для караоке-подсветки).
export const activeWordIndex = (words: readonly LiveWord[], t: number) => {
  let idx = -1;
  for (let i = 0; i < words.length; i++) if (t >= words[i].start - 0.04) idx = i;
  return idx;
};

// Текущее время композиции в секундах.
export const useT = () => useCurrentFrame() / useVideoConfig().fps;
