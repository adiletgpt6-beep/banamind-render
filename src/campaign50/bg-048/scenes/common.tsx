// Общие помощники сцен: лицо героя (моргание, речь, микродвижения),
// кивки в такт речи, поиск слов реплики, плавные кривые.
import { Easing, interpolate } from "remotion";
import type { Viseme } from "../context";
import { NEUTRAL_FACE, type Face } from "../rig/Head";
import { blinkAt, breathe, sway } from "../rig/motion";
import type { B48Cue } from "../timing";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.45, 0, 0.25, 1);
export const easeOut = Easing.bezier(0.2, 0.8, 0.3, 1);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);

// 0…1 между моментами a и b (с плавностью).
export const prog = (t: number, a: number, b: number, e = ease) => interpolate(t, [a, Math.max(a + 0.001, b)], [0, 1], { ...clamp, easing: e });

// Лицо: базовое выражение + моргание + рот по речи + лёгкий «живой» взгляд.
export const face = (t: number, seed: number, vis: Viseme, base: Partial<Face>, extraBlinks: readonly number[] = []): Face => {
  const b = { ...NEUTRAL_FACE, ...base };
  const micro = 0.05 * sway(t * 0.7, seed + 11);
  return {
    ...b,
    lookX: b.lookX + micro,
    lookY: b.lookY + 0.04 * sway(t * 0.6, seed + 5),
    blink: b.laugh > 0.5 ? 0 : Math.max(b.blink, blinkAt(t, seed, extraBlinks)),
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
export const wordAt = (cue: B48Cue | undefined, prefix: string, fallback: number): number => {
  if (!cue) return fallback;
  const p = prefix.toLowerCase();
  const w = cue.words.find((x) => x.text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").startsWith(p));
  return w ? w.start : fallback;
};
