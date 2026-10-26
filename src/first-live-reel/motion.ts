// Анимационные хелперы живого ролика: мягкое появление с небольшим
// перелётом (без «резиновых» отскоков), окна видимости, плавности.
import { Easing, interpolate, spring } from "remotion";
import { LIVE_VIDEO } from "./edit";

const FPS = LIVE_VIDEO.fps;

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.75, 0);

// Быстрое мягкое появление: 0 → ~1.04 → 1 за ≈ 0.4 с.
export const enter = (frame: number, start: number) =>
  spring({
    frame: frame - start,
    fps: FPS,
    config: { damping: 15, stiffness: 190, mass: 0.7 },
  });

// Совсем спокойное появление без перелёта.
export const settle = (frame: number, start: number) =>
  spring({
    frame: frame - start,
    fps: FPS,
    config: { damping: 200, stiffness: 120 },
  });

// Уход элемента: 1 → 0 за `dur` кадров начиная с `start`.
export const leave = (frame: number, start: number, dur = 8) =>
  1 - interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: easeIn });

// Прогресс 0 → 1 на отрезке кадров с плавностью.
export const ramp = (frame: number, from: number, to: number, easing = easeInOut) =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing });
