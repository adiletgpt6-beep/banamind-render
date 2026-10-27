// Общие помощники сцен: лицо героя (моргание, речь, микродвижения),
// кивки в такт речи, поиск слов реплики, монтажные переходы.
import { interpolate } from "remotion";
import type { Viseme } from "../context";
import { NEUTRAL_FACE, type Face } from "../rig/Head";
import { blinkAt, breathe, sway } from "../rig/motion";
import type { B12Cue } from "../timing";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Лицо: базовое выражение + моргание + рот по речи + лёгкий «живой» взгляд.
export const face = (
  t: number,
  seed: number,
  vis: Viseme,
  base: Partial<Face>,
  extraBlinks: readonly number[] = [],
): Face => {
  const b = { ...NEUTRAL_FACE, ...base };
  const micro = 0.05 * sway(t * 0.7, seed + 11);
  return {
    ...b,
    lookX: b.lookX + micro,
    lookY: b.lookY + 0.04 * sway(t * 0.6, seed + 5),
    blink: Math.max(b.blink, blinkAt(t, seed, extraBlinks)),
    // во время речи брови чуть приподнимаются на ударных слогах
    raise: b.raise + (vis.talking ? 0.18 * vis.open : 0),
    mouth: vis.talking ? vis : b.mouth,
  };
};

// Кивок в такт речи (px) и лёгкий наклон головы (град).
export const talkNod = (vis: Viseme, t: number, seed: number) => (vis.talking ? vis.open * 3.5 + 1.2 * Math.sin(t * 6.3 + seed) * vis.open : 0);
export const idleTilt = (t: number, seed: number, amp = 1.6) => amp * sway(t * 0.8, seed);
export const breath = breathe;

// Начало слова реплики (абсолютное время), найденное по началу текста слова.
export const wordAt = (cue: B12Cue | undefined, prefix: string, fallback: number): number => {
  if (!cue) return fallback;
  const p = prefix.toLowerCase();
  const w = cue.words.find((x) => x.text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").startsWith(p));
  return w ? w.start : fallback;
};

// Затемнение-«вспышка» на стыке (0…1).
export const dipAt = (t: number, at: number, d = 0.18) => interpolate(Math.abs(t - at), [0, d], [1, 0], clamp);
