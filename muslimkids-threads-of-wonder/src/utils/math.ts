// Детерминированная математика движка: всё зависит только от номера кадра.

export type V3 = [number, number, number];

export const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** Прогресс 0..1 на интервале кадров [a, b]. */
export const progress = (f: number, a: number, b: number) => clamp((f - a) / (b - a));

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
export const easeOutBack = (t: number, s = 1.2) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
/** Плавная «квинтическая» кривая — нулевые скорость и ускорение на концах. */
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export const v3 = (x = 0, y = 0, z = 0): V3 => [x, y, z];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: V3): V3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const mix3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Поворот вектора вокруг оси (Родриг). */
export const rotateAxis = (p: V3, axis: V3, ang: number): V3 => {
  const k = norm(axis);
  const c = Math.cos(ang), s = Math.sin(ang);
  const kxp = cross(k, p);
  const kd = dot(k, p) * (1 - c);
  return [p[0] * c + kxp[0] * s + k[0] * kd, p[1] * c + kxp[1] * s + k[1] * kd, p[2] * c + kxp[2] * s + k[2] * kd];
};

/** Сидированный ГПСЧ (mulberry32) — фиксированное зерно, одинаковый результат в любом кадре. */
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

const hash2 = (x: number, y: number) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
/** Гладкий value-noise 2D в диапазоне [-1, 1]. */
export const noise2 = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return (lerp(lerp(a, b, u), lerp(c, d, u), v)) * 2 - 1;
};
export const fbm2 = (x: number, y: number, oct = 4) => {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    s += a * noise2(x * f + i * 17.3, y * f - i * 9.1);
    f *= 2.03;
    a *= 0.5;
  }
  return s;
};
/** «Хребтовый» шум для естественных горных силуэтов. */
export const ridged2 = (x: number, y: number, oct = 4) => {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    const n = 1 - Math.abs(noise2(x * f + i * 31.7, y * f + i * 11.9));
    s += a * n * n;
    f *= 2.1;
    a *= 0.5;
  }
  return s;
};

/** sRGB hex → линейный RGB (Three.js работает в линейном пространстве). */
export const hexLin = (hex: string): V3 => {
  const n = parseInt(hex.replace("#", ""), 16);
  const c = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return [c((n >> 16) & 255), c((n >> 8) & 255), c(n & 255)];
};
