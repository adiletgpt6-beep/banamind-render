// Детерминированные математические утилиты: никакого Date/Math.random.

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, x: number) => clamp((x - a) / (b - a));
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
export const smoother = (t: number) => {
  const x = clamp(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * clamp(t)) - 1) / 2;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInCubic = (t: number) => Math.pow(clamp(t), 3);

/** 0→1 на отрезке [a,b] времени с плавным S-образным ходом. */
export const seg = (t: number, a: number, b: number, ease = smoother) => ease(invLerp(a, b, t));

/** Плавное «окно»: вход [a,b], удержание, выход [c,d]. */
export const windowed = (t: number, a: number, b: number, c: number, d: number) =>
  seg(t, a, b) * (1 - seg(t, c, d));

export type V3 = [number, number, number];
export const v3lerp = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// --- детерминированный шум ---------------------------------------------
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
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

/** Value-noise 2D с квинтической интерполяцией, диапазон [0,1]. */
export const noise2 = (x: number, y: number, seed = 1) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
  const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
  const a = hash2(xi, yi, seed), b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed), d = hash2(xi + 1, yi + 1, seed);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
};

export const fbm2 = (x: number, y: number, oct = 5, seed = 1) => {
  let s = 0, amp = 0.5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) {
    s += amp * noise2(x * f, y * f, seed + i * 17);
    n += amp; amp *= 0.5; f *= 2.03;
  }
  return s / n;
};

/** Гребенчатый шум — острые хребты гор. */
export const ridged2 = (x: number, y: number, oct = 6, seed = 7) => {
  let s = 0, amp = 0.5, f = 1, n = 0, w = 1;
  for (let i = 0; i < oct; i++) {
    let r = 1 - Math.abs(noise2(x * f, y * f, seed + i * 31) * 2 - 1);
    r = r * r * w;
    w = clamp(r * 1.6);
    s += amp * r; n += amp; amp *= 0.5; f *= 2.1;
  }
  return s / n;
};
