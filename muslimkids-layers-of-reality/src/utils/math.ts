// Deterministic math helpers: easing, seeded random, value noise.
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mix3 = (
  a: readonly number[],
  b: readonly number[],
  t: number,
): [number, number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Progress 0..1 of time t inside [t0, t1]. */
export const span = (t: number, t0: number, t1: number) => clamp01((t - t0) / (t1 - t0));

export const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOutQuint = (x: number) =>
  x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2;
/** Long, soft landing: fast start, very gentle settle (reassembly). */
export const easeSettle = (x: number) => {
  const a = easeInOutCubic(x);
  return a * a * (3 - 2 * a) * 0.35 + a * 0.65;
};
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
/** Fade in over [a,b], hold, fade out over [c,d]. */
export const window4 = (t: number, a: number, b: number, c: number, d: number) =>
  Math.min(smoothstep(a, b, t), 1 - smoothstep(c, d, t));

/** mulberry32 — seeded PRNG (fixed seeds → identical geometry every render). */
export const seeded = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const hash2 = (x: number, y: number, seed: number) => {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
export const valueNoise2 = (x: number, y: number, seed = 0) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  let fx = x - xi, fy = y - yi;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = hash2(xi, yi, seed), b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed), d = hash2(xi + 1, yi + 1, seed);
  return lerp(lerp(a, b, fx), lerp(c, d, fx), fy);
};
export const fbm2 = (x: number, y: number, octaves = 5, seed = 0) => {
  let a = 0, amp = 0.5, f = 1, tot = 0;
  for (let i = 0; i < octaves; i++) {
    a += amp * valueNoise2(x * f, y * f, seed + i * 17);
    tot += amp;
    amp *= 0.5;
    f *= 2.03;
  }
  return a / tot;
};
