// Детерминированные функции движения: всё считается по номеру кадра.
// Базовые (clamp, lerp, easeInOut, keys …) — в rig/motion.ts.
import { clamp, easeOut } from "./rig/motion";

export { anticipate, blinkAt, clamp, easeIn, easeInOut, easeOut, keys, keysV, lerp, smoothstep } from "./rig/motion";

// Появление: 0 → 1 за d кадров начиная с кадра at.
export const appear = (f: number, at: number, d = 12) => easeOut((f - at) / d);

// Упругое появление (лёгкий перелёт ≈ 8 % и возврат).
export const pop = (f: number, at: number, d = 14) => {
  const t = clamp((f - at) / d);
  if (t <= 0) return 0;
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// Затухающее покачивание (отказ, «дрожь» от удивления).
export const shake = (f: number, at: number, d = 18, amp = 16) => {
  const t = clamp((f - at) / d);
  return amp * Math.sin(t * Math.PI * 4) * (1 - t);
};

// Прыжок: высота подскока 0 → h → 0 за d кадров (парабола).
export const hopArc = (f: number, at: number, d: number, h: number) => {
  const t = (f - at) / d;
  return t <= 0 || t >= 1 ? 0 : 4 * h * t * (1 - t);
};

// Сквош при приземлении/толчке: импульс в момент at, затухание за d кадров.
export const squashPulse = (f: number, at: number, d = 10, amp = 1) => {
  const t = (f - at) / d;
  return t < 0 || t > 1 ? 0 : amp * Math.sin(t * Math.PI) * (1 - t * 0.4);
};
