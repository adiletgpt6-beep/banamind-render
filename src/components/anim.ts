import { Easing, interpolate, spring } from "remotion";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

// Плавное появление снизу: прозрачность + сдвиг, зависит только от кадра.
export const fadeUp = (
  frame: number,
  start: number,
  duration = 18,
  distance = 40,
) => {
  const progress = interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  return {
    opacity: progress,
    translate: `0px ${(1 - progress) * distance}px`,
  };
};

// Пружинное «выпрыгивание» (0 → 1) без перелёта за 1.15.
export const pop = (frame: number, fps: number, start: number) =>
  spring({
    frame: frame - start,
    fps,
    config: { damping: 12, stiffness: 140, mass: 0.8 },
  });

export const progress = (
  frame: number,
  start: number,
  end: number,
  easing = easeInOut,
) => interpolate(frame, [start, end], [0, 1], { ...clamp, easing });
