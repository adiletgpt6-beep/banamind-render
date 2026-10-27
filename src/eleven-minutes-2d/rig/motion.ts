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
// Плавный вход и выход (кубическая).
export const easeInOut = (x: number) => {
  const t = clamp(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = (x: number) => Math.pow(clamp(x), 3);
// Подготовка и мягкое завершение: лёгкий замах назад (≈ 6 %) в начале
// и небольшое дотягивание (≈ 3 %) с возвратом в конце.
export const anticipate = (x: number) => {
  const t = clamp(x);
  const e = easeInOut(t);
  const back = -0.07 * Math.sin(Math.PI * clamp(t / 0.3)) * (1 - e);
  const settle = 0.035 * Math.sin(Math.PI * clamp((t - 0.72) / 0.28));
  return e + back + settle;
};

// Ходьба: плавный разгон (доля acc пути по времени), ровный шаг,
// плавное торможение — без «рывка» скорости посередине.
export const cruise = (x: number, acc = 0.22) => {
  const t = clamp(x);
  const v = 1 / (1 - acc); // скорость на ровном участке
  if (t < acc) return (v * t * t) / (2 * acc);
  if (t > 1 - acc) return 1 - (v * (1 - t) * (1 - t)) / (2 * acc);
  return v * (t - acc / 2);
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

// Ключевые кадры точек.
export const keysV = (f: number, pts: readonly (readonly [number, Vec])[], ease: Ease = easeInOut): Vec => {
  if (f <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, v1] = pts[i];
    const [t0, v0] = pts[i - 1];
    if (f <= t1) return t1 <= t0 ? v1 : lerpV(v0, v1, ease((f - t0) / (t1 - t0)));
  }
  return pts[pts.length - 1][1];
};

// Путь через несколько точек без остановок на промежуточных: равномерная
// параметризация по длине, плавный разгон в начале и торможение в конце.
export const glide = (f: number, from: number, to: number, pts: readonly Vec[], ease: Ease = easeInOut): Vec => {
  const u = ease((f - from) / Math.max(1, to - from));
  const segs = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = segs.reduce((a, b) => a + b, 0) || 1;
  let d = u * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) return lerpV(pts[i], pts[i + 1], segs[i] ? clamp(d / segs[i]) : 1);
    d -= segs[i];
  }
  return pts[pts.length - 1];
};

// Значение функции, сглаженное по окну ±w кадров (мягче старт и остановка).
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

// Моргание: 0 — открыто, 1 — закрыто. Случайные (по seed) интервалы
// 2,4–4,8 с, моргание 5 кадров; плюс принудительные моргания в кадрах extra.
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
