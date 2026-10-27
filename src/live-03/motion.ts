// Анимационные хелперы BalaGoLive03. Всё зависит только от номера кадра:
// spring/interpolate/Easing, без случайностей и реального времени.
// Принципы референса: мягкое ускорение и торможение, небольшая инерция
// (лёгкий перелёт без «резины»), последовательное появление элементов.
import { Easing, interpolate, spring } from "remotion";
import { LIVE3 } from "./edit";

const FPS = LIVE3.fps;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.75, 0);

// Появление с мягкой инерцией: 0 → ~1.03 → 1 за ≈ 0.45 с.
export const enter = (frame: number, start: number) =>
  spring({ frame: frame - start, fps: FPS, config: { damping: 16, stiffness: 170, mass: 0.75 } });

// Спокойное появление без перелёта.
export const settle = (frame: number, start: number, durationInFrames?: number) =>
  spring({ frame: frame - start, fps: FPS, config: { damping: 200, stiffness: 110 }, durationInFrames });

// 0 → 1 на отрезке кадров с плавностью.
export const ramp = (frame: number, from: number, to: number, easing = easeInOut) =>
  interpolate(frame, [from, Math.max(from + 1, to)], [0, 1], { ...clamp, easing });

// Уход: 1 → 0 за dur кадров начиная с start.
export const leave = (frame: number, start: number, dur = 8) => 1 - ramp(frame, start, start + dur, easeIn);

// Окно видимости: мягкий вход в `from`, уход в `to`.
export const visible = (frame: number, from: number, to: number, inDur = 10, outDur = 8) =>
  Math.min(ramp(frame, from, from + inDur, easeOut), leave(frame, to, outDur));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
