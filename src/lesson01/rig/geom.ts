// Геометрия риг-персонажей урока 1. Без Remotion — чистые функции.
//
// Углы сегментов — абсолютные, в градусах: 0 — вниз, 90 — вправо по экрану,
// -90 — влево, 180 — вверх. Длины сегментов постоянны: конечности не
// растягиваются; перспективное укорочение задаётся отдельным множителем.

export type P = { x: number; y: number };

export const rad = (d: number) => (d * Math.PI) / 180;
export const deg = (r: number) => (r * 180) / Math.PI;
export const dir = (a: number): P => ({ x: Math.sin(rad(a)), y: Math.cos(rad(a)) });
export const add = (p: P, q: P): P => ({ x: p.x + q.x, y: p.y + q.y });
export const sub = (p: P, q: P): P => ({ x: p.x - q.x, y: p.y - q.y });
export const mul = (p: P, k: number): P => ({ x: p.x * k, y: p.y * k });
export const along = (p: P, a: number, len: number): P => add(p, mul(dir(a), len));
export const angleOf = (v: P) => deg(Math.atan2(v.x, v.y));
export const dist = (p: P, q: P) => Math.hypot(p.x - q.x, p.y - q.y);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpP = (a: P, b: P, t: number): P => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Кратчайшая интерполяция углов.
export const lerpAngle = (a: number, b: number, t: number) => {
  let d = ((b - a + 540) % 360) - 180;
  if (d < -180) d += 360;
  return a + d * t;
};

// Плавные кривые движения: мягкий разгон и торможение, без пружины.
export const easeInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t: number) => Math.pow(clamp(t), 3);
// «Подготовка — движение — мягкое завершение»: лёгкий обратный ход ≤ 4 %.
export const easeAnticipate = (t: number) => {
  const x = clamp(t);
  if (x < 0.18) return -0.04 * Math.sin((x / 0.18) * Math.PI);
  return easeInOut((x - 0.18) / 0.82);
};

// Двухзвенная инверсная кинематика: от корня S к цели T звеньями l1, l2.
// bend: +1 — локоть/колено уходит вправо от направления S→T, -1 — влево.
// Если цель дальше суммы длин, конечность вытягивается в её сторону без
// растяжения (кисть не «дотягивается» — цели ставятся в пределах досягаемости).
export const ik = (S: P, T: P, l1: number, l2: number, bend: number) => {
  const d = Math.max(1e-3, Math.min(dist(S, T), l1 + l2 - 1e-3));
  const base = angleOf(sub(T, S));
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const A = deg(Math.acos(clamp(cosA, -1, 1)));
  const a1 = base - bend * A;
  const J = along(S, a1, l1);
  const reach = along(S, base, d);
  const a2 = angleOf(sub(reach, J));
  return { a1, a2, J, end: along(J, a2, l2) };
};

// Детерминированный псевдослучайный генератор (одинаковый на превью и рендере).
export const hash01 = (seed: number) => {
  let x = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};
export const strSeed = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
