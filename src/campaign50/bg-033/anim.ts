// Детерминированные функции движения BG-033: всё считается по номеру кадра.
// Свои, без импорта из других роликов.
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (x: number) => {
  const t = clamp(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = (x: number) => Math.pow(clamp(x), 3);
// Появление: 0 → 1 за d кадров начиная с кадра at.
export const appear = (f: number, at: number, d = 12) => easeOut((f - at) / d);
// Исчезновение: 1 → 0 за d кадров начиная с кадра at.
export const vanish = (f: number, at: number, d = 12) =>
  1 - easeInOut((f - at) / d);
// Отрезок [a, b] кадров → 0…1 с плавным входом/выходом.
export const span = (f: number, a: number, b: number) =>
  easeInOut((f - a) / Math.max(1, b - a));
// Мягкое «дыхание» (0…1) с периодом period кадров.
export const breathe = (f: number, period = 90) =>
  0.5 - 0.5 * Math.cos((2 * Math.PI * f) / period);
// Небольшое дотягивание при появлении (масштаб 0 → 1 с перелётом).
export const pop = (f: number, at: number, d = 14) => {
  const t = clamp((f - at) / d);
  return easeOut(t) + 0.08 * Math.sin(Math.PI * clamp((t - 0.5) / 0.5));
};
// Детерминированное «случайное» число 0…1 по целому seed.
export const hash01 = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
// Моргание: 1 — глаза открыты, 0 — закрыты. Моргает в кадрах blinks.
export const blinkAt = (f: number, blinks: readonly number[]) => {
  let v = 1;
  for (const b of blinks) {
    const d = Math.abs(f - b);
    if (d < 4) v = Math.min(v, d / 4);
  }
  return v;
};
