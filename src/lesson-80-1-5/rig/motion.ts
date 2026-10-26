// Детерминированные функции движения: всё считается по номеру кадра.
export type Vec = { readonly x: number; readonly y: number };
export const vec = (x: number, y: number): Vec => ({ x, y });
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpV = (a: Vec, b: Vec, t: number): Vec => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
export const smoothstep = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
export const easeInOut = (x: number) => {
  const t = clamp(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = (x: number) => Math.pow(clamp(x), 3);
// Подготовка и мягкое завершение: лёгкий замах назад в начале и
// небольшое дотягивание с возвратом в конце.
export const anticipate = (x: number) => {
  const t = clamp(x);
  const e = easeInOut(t);
  const back = -0.025 * Math.sin(Math.PI * clamp(t / 0.3)) * (1 - e);
  const settle = 0.009 * Math.sin(Math.PI * clamp((t - 0.72) / 0.28));
  return e + back + settle;
};
type Ease = (x: number) => number;
// Ключевые кадры чисел: [[кадр, значение], …]; между ключами — ease.
export const keys = (f: number, pts: readonly (readonly [number, number])[], ease: Ease = easeInOut) => {
  if (f <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, v1] = pts[i];
    const [t0, v0] = pts[i - 1];
    if (f <= t1) return t1 <= t0 ? v1 : lerp(v0, v1, ease((f - t0) / (t1 - t0)));
  }
  return pts[pts.length - 1][1];
};
export const keysV = (f: number, pts: readonly (readonly [number, Vec])[], ease: Ease = easeInOut): Vec => {
  if (f <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, v1] = pts[i];
    const [t0, v0] = pts[i - 1];
    if (f <= t1) return t1 <= t0 ? v1 : lerpV(v0, v1, ease((f - t0) / (t1 - t0)));
  }
  return pts[pts.length - 1][1];
};
// Значение функции, сглаженное по окну ±w кадров.
export const soften = (fn: (t: number) => number, f: number, w = 3) => {
  let acc = 0;
  let n = 0;
  for (let k = -w; k <= w; k++) {
    const wt = w + 1 - Math.abs(k);
    acc += fn(f + k) * wt;
    n += wt;
  }
  return acc / n;
};
// Детерминированный шум 0…1.
export const hash01 = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
// Медленный плавный шум −1…1 (косинусная интерполяция узлов каждые period кадров).
export const slowNoise = (f: number, seed: number, period = 90) => {
  const i = Math.floor(f / period);
  const t = (f - i * period) / period;
  const a = hash01(seed * 31.7 + i) * 2 - 1;
  const b = hash01(seed * 31.7 + i + 1) * 2 - 1;
  return lerp(a, b, smoothstep(t));
};
// Моргание: 0 — открыто, 1 — закрыто. Интервалы 2,4–4,8 с, моргание 5 кадров;
// плюс принудительные моргания в кадрах extra.
export const blinkAt = (f: number, seed: number, extra: readonly number[] = []) => {
  const shape = (d: number) => (d < 0 || d > 5 ? 0 : [0.45, 0.95, 1, 0.6, 0.2, 0][Math.floor(d)]);
  let v = 0;
  for (const e of extra) v = Math.max(v, shape(f - e));
  let t = Math.floor(hash01(seed) * 40);
  let i = 0;
  while (t <= f + 1) {
    v = Math.max(v, shape(f - t));
    t += 72 + Math.floor(hash01(seed * 13 + i * 7.3) * 72);
    i++;
  }
  return v;
};
export const deg = (r: number) => (r * 180) / Math.PI;
export const rad = (d: number) => (d * Math.PI) / 180;
// Две кости (плечо–предплечье) до цели. Сторона сгиба — по pref.
export const twoBone = (root: Vec, target: Vec, l1: number, l2: number, pref: Vec, width = 0.14) => {
  let dx = target.x - root.x;
  let dy = target.y - root.y;
  let d = Math.hypot(dx, dy);
  const maxD = l1 + l2 - 1;
  if (d > maxD) {
    dx *= maxD / d;
    dy *= maxD / d;
    d = maxD;
  }
  const ux = d > 1e-6 ? dx / d : 0;
  const uy = d > 1e-6 ? dy / d : 1;
  d = Math.max(d, Math.abs(l1 - l2) + 2);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const sinA = Math.sqrt(1 - cosA * cosA);
  const bias = pref.x * uy - pref.y * ux;
  const bend = clamp(bias / width, -1, 1);
  const mid = { x: root.x + l1 * cosA * ux + bend * l1 * sinA * uy, y: root.y + l1 * cosA * uy - bend * l1 * sinA * ux };
  return { mid, end: { x: root.x + ux * d, y: root.y + uy * d } };
};
// Чуть темнее / светлее цвета.
export const shade = (hex: string, k = 0.86) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `#${((1 << 24) | (f((n >> 16) & 255) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1)}`;
};
