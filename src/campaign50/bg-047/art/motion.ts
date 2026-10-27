// Детерминированные функции движения (всё считается по номеру кадра).
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (x: number) => {
  const t = clamp(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = (x: number) => Math.pow(clamp(x), 3);
export const sine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x));
// Пружинка: быстрый подъём с небольшим перелётом (≈ 8 %) и успокоением.
export const springy = (x: number) => {
  const t = clamp(x);
  if (t >= 1) return 1;
  return 1 - Math.exp(-6.5 * t) * Math.cos(9 * t);
};
// Доля перехода от кадра a за d кадров.
export const prog = (f: number, a: number, d: number) => clamp((f - a) / Math.max(1, d));
export const fadeIn = (f: number, a: number, d = 9) => easeOut(prog(f, a, d));
export const fadeOut = (f: number, a: number, d = 9) => 1 - easeIn(prog(f, a, d));
export const window01 = (f: number, a: number, b: number, d = 9) => Math.min(fadeIn(f, a, d), fadeOut(f, b, d));

// Ключевые кадры: [кадр, значение], между ними — плавный переход.
export type Key<T> = readonly [number, T];
export const keyed = (f: number, keys: readonly Key<number>[], ease = easeInOut): number => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [b, vb] = keys[i];
    const [a, va] = keys[i - 1];
    if (f <= b) return lerp(va, vb, ease((f - a) / Math.max(1, b - a)));
  }
  return keys[keys.length - 1][1];
};

// Прыжок по дуге: высота h, длительность d кадров; 0 вне прыжка.
export const hop = (f: number, a: number, d: number, h: number) => {
  const t = (f - a) / d;
  if (t <= 0 || t >= 1) return 0;
  return 4 * h * t * (1 - t);
};
// Сплющивание при приземлении/отталкивании: 1 — норма, <1 — приплюснуто.
export const squashAt = (f: number, a: number, d: number) => {
  const take = prog(f, a - 4, 4);
  const land = prog(f, a + d, 7);
  const s1 = take > 0 && take < 1 ? 0.14 * Math.sin(Math.PI * take) : 0;
  const s2 = land > 0 && land < 1 ? 0.18 * Math.sin(Math.PI * land) * (1 - land * 0.5) : 0;
  return 1 - s1 - s2;
};
// Моргание: 0 — открыт, 1 — закрыт. Период ~ 3,3 с со сдвигом seed.
export const blink = (f: number, seed = 0) => {
  const p = (f + seed * 37) % 100;
  return p < 4 ? Math.sin((p / 4) * Math.PI) : 0;
};

// Точка на ломаной pts при доле пути t (0…1) и направление движения.
export const along = (pts: readonly (readonly [number, number])[], t: number) => {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let d = clamp(t) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const k = segs[i] ? Math.min(1, d / segs[i]) : 0;
      const [ax, ay] = pts[i];
      const [bx, by] = pts[i + 1];
      return { x: ax + (bx - ax) * k, y: ay + (by - ay) * k, dx: bx - ax, dy: by - ay, dist: clamp(t) * total };
    }
    d -= segs[i];
  }
  const last = pts[pts.length - 1];
  return { x: last[0], y: last[1], dx: 0, dy: 0, dist: total };
};
