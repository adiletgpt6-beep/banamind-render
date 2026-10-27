// Детерминированная математика анимации: всё считается от времени кадра.

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const ease = {
  linear: (t: number) => t,
  inOutSine: (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t)),
  inOutCubic: (t: number) => {
    const x = clamp(t);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  },
  outCubic: (t: number) => 1 - Math.pow(1 - clamp(t), 3),
  inCubic: (t: number) => Math.pow(clamp(t), 3),
  outQuint: (t: number) => 1 - Math.pow(1 - clamp(t), 5),
  // Небольшой перелёт и возврат — «бумажная» упругость без дрожания.
  outBack: (t: number, s = 1.2) => {
    const x = clamp(t) - 1;
    return 1 + (s + 1) * x * x * x + s * x * x;
  },
};

export type Range = [number, number];

/** Прогресс 0..1 внутри отрезка времени [a, b] с выбранным сглаживанием. */
export const prog = (t: number, r: Range, fn: (x: number) => number = ease.inOutCubic) =>
  fn(clamp((t - r[0]) / (r[1] - r[0])));

/** Подотрезок с запаздыванием: элемент i из n стартует позже на долю spread. */
export const stagger = (p: number, i: number, n: number, spread = 0.5) => {
  if (n <= 1) return clamp(p);
  const start = (i / (n - 1)) * spread;
  return clamp((p - start) / (1 - spread));
};

/** Открытие с последующим закрытием: 0 → 1 (open) … 1 → 0 (close). */
export const openClose = (
  t: number,
  open: Range,
  close: Range,
  fnOpen: (x: number) => number = ease.inOutCubic,
  fnClose: (x: number) => number = ease.inOutCubic,
) => {
  if (t < close[0]) return prog(t, open, fnOpen);
  return 1 - prog(t, close, fnClose);
};

/** Детерминированный псевдослучайный генератор (mulberry32). */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type V3 = [number, number, number];
