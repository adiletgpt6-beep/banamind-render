// Детерминированные функции движения: всё считается по номеру кадра.
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (x: number) => {
  const t = clamp(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
// Появление: 0 → 1 за d кадров начиная с кадра at.
export const appear = (f: number, at: number, d = 12) => easeOut((f - at) / d);
export const easeIn = (x: number) => Math.pow(clamp(x), 3);
