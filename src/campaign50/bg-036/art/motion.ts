// Детерминированные функции движения (общие функции проекта, только чтение)
// и несколько своих для бумаги и камеры.
import { clamp, easeInOut, easeOut, lerp } from "../../../two-schedules-2d/rig/motion";

export {
  anticipate,
  clamp,
  easeIn,
  easeInOut,
  easeOut,
  glide,
  hash01,
  keys,
  keysV,
  lerp,
  smoothstep,
} from "../../../two-schedules-2d/rig/motion";

// Прогресс 0…1 на отрезке [a, b] кадров с easing.
export const prog = (f: number, a: number, b: number, ease = easeInOut) =>
  ease((f - a) / Math.max(1, b - a));

// Мягкая пружина: 0 → 1 с небольшим перелётом и затуханием (бумага, штамп).
// k — затухание (больше — меньше перелёт; 6 ≈ перелёт 7 %).
export const spring = (x: number, k = 6) => {
  const t = clamp(x);
  if (t >= 1) return 1;
  return 1 - Math.exp(-k * t) * Math.cos(t * Math.PI * 2.2) * (1 - t * t * t * t);
};

// Появление элемента: прозрачность и подъём снизу.
export const rise = (f: number, at: number, d = 12, dist = 26): React.CSSProperties => {
  const a = easeOut((f - at) / d);
  return { opacity: a, translate: `0 ${(1 - a) * dist}px` };
};

// Исчезновение элемента к кадру at (за d кадров).
export const fadeOutAt = (f: number, at: number, d = 10) => 1 - clamp((f - at) / d);

// Значение a → b за кадры [from, to].
export const tween = (f: number, from: number, to: number, a: number, b: number, ease = easeInOut) =>
  lerp(a, b, ease((f - from) / Math.max(1, to - from)));
