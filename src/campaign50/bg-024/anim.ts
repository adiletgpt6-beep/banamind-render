// Детерминированные функции движения: всё считается по номеру кадра.
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (x: number) => {
  const t = clamp(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
// Мягкое «защёлкивание» детали пазла: небольшое дотягивание и возврат.
export const snap = (x: number) => {
  const t = clamp(x);
  return easeOut(t) + 0.06 * Math.sin(Math.PI * clamp((t - 0.55) / 0.45));
};
// Появление: 0 → 1 за d кадров начиная с кадра at.
export const appear = (f: number, at: number, d = 12) => easeOut((f - at) / d);
// Плавное покачивание «туда-обратно» (отказ: деталь не подходит).
export const shake = (f: number, at: number, d = 18, amp = 16) => {
  const t = clamp((f - at) / d);
  return amp * Math.sin(t * Math.PI * 4) * (1 - t);
};
