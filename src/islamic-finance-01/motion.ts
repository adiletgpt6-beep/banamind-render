// Frame-based, deterministic motion helpers shared by all scenes.
import { Easing, interpolate, spring } from "remotion";
import { IF01_VIDEO } from "./script";

export const FPS = IF01_VIDEO.fps;
export const sec = (s: number) => Math.round(s * FPS);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1); // expo-ish out
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

/** 0→1 between frames a and b (clamped). */
export const prog = (frame: number, a: number, b: number, easing = easeOut) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing });

/** Linear map with clamping. */
export const map = (frame: number, inRange: number[], outRange: number[], easing?: (t: number) => number) =>
  interpolate(frame, inRange, outRange, { ...clamp, ...(easing ? { easing } : {}) });

/** Confident spring (no visible overshoot) — used for numbers and cards. */
export const springFirm = (frame: number, start: number, durationFrames = 24) =>
  spring({ frame: frame - start, fps: FPS, config: { damping: 200, stiffness: 120, mass: 1 }, durationInFrames: durationFrames });

/** Gentle spring with a small overshoot — used for small illustrations and labels. */
export const springSoft = (frame: number, start: number) =>
  spring({ frame: frame - start, fps: FPS, config: { damping: 14, stiffness: 150, mass: 0.9 } });

/** Settled spring with a light bounce — entrances of objects. */
export const springPop = (frame: number, start: number) =>
  spring({ frame: frame - start, fps: FPS, config: { damping: 11, stiffness: 170, mass: 0.7 } });

/** Fade + rise entrance. */
export const riseIn = (frame: number, start: number, duration = 16, distance = 36) => {
  const p = prog(frame, start, start + duration);
  return { opacity: p, transform: `translateY(${(1 - p) * distance}px)` };
};

/** Fade + lift exit (returns opacity and translateY in px). */
export const liftOut = (frame: number, start: number, duration = 12, distance = -40) => {
  const p = prog(frame, start, start + duration, easeIn);
  return { opacity: 1 - p, y: p * distance };
};

/** Soft idle float (±amp px) for illustrations — slow, never distracting. */
export const floatY = (frame: number, amp = 6, period = 90, phase = 0) =>
  Math.sin(((frame + phase) / period) * Math.PI * 2) * amp;

/** Camera push: scale about center from s0 to s1 between frames a..b. */
export const cameraScale = (frame: number, a: number, b: number, s0: number, s1: number) =>
  interpolate(frame, [a, b], [s0, s1], { ...clamp, easing: easeInOut });

/** Mix two hex colors (#RRGGBB) by t∈[0,1]. */
export const mixColor = (c1: string, c2: string, t: number) => {
  const p = (c: string, i: number) => parseInt(c.slice(i, i + 2), 16);
  const k = Math.max(0, Math.min(1, t));
  const ch = (i: number) => Math.round(p(c1, i) + (p(c2, i) - p(c1, i)) * k);
  return `rgb(${ch(1)}, ${ch(3)}, ${ch(5)})`;
};

/** Stroke-draw progress for an SVG path of length `len`. */
export const dash = (len: number, p: number) => ({
  strokeDasharray: len,
  strokeDashoffset: len * (1 - Math.max(0, Math.min(1, p))),
});
