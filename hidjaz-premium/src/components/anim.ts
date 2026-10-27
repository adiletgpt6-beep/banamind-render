import { Easing, interpolate } from "remotion";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeOut = (x: number) => Easing.out(Easing.cubic)(clamp01(x));
export const easeInOut = (x: number) => Easing.inOut(Easing.cubic)(clamp01(x));
export const range = (f: number, a: number, b: number, from = 0, to = 1, ease = easeOut) =>
  from + (to - from) * ease(interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
/** вход за `inn` кадров и выход за `out` кадров до конца `dur` */
export const inOut = (f: number, dur: number, inn = 12, out = 12) =>
  Math.min(easeOut(f / inn), easeOut((dur - f) / out));
