// Детерминированные функции движения: всё считается по номеру кадра.
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (x: number) => {
  const t = clamp(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = (x: number) => Math.pow(clamp(x), 3);
// Мягкий «пружинный» выход с небольшим перелётом (без резких рывков).
export const easeBack = (x: number) => {
  const t = clamp(x);
  const c1 = 1.25;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
// Появление: 0 → 1 за d кадров начиная с кадра at.
export const appear = (f: number, at: number, d = 12) => easeOut((f - at) / d);
// Плавное появление и исчезновение: 0 → 1 (at…at+d) … 1 → 0 (out…out+d).
export const span = (f: number, at: number, out: number, d = 10) =>
  appear(f, at, d) * (1 - easeOut((f - out) / d));
// Медленное «дыхание» для живости неподвижных персонажей.
export const breathe = (f: number, period = 90, amp = 1) =>
  amp * Math.sin((f / period) * Math.PI * 2);
// Моргание: короткое закрытие век раз в несколько секунд (детерминированно).
export const blink = (f: number, offset = 0) => {
  const period = 113;
  const p = (f + offset) % period;
  if (p > 6) return 1;
  return Math.abs(p - 3) / 3;
};
