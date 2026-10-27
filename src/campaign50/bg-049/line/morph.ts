// Геометрия «одной жёлтой линии». Каждая форма (знак вопроса, край
// блокнота, курсор, складка заявки, телефон, лупа, луч, горизонт, линия под
// логотипом) приводится к одному и тому же числу точек N, равномерно
// распределённых по длине. Тогда любая форма плавно перетекает в любую:
// точка k одной формы движется к точке k другой. Без зависимостей от
// React (проверяется Node-тестами).
import { getLength, getPointAtLength } from "@remotion/paths";

export const N = 360;
export type Pt = readonly [number, number];
export type Pts = readonly Pt[];

// Форма: SVG-путь (одна непрерывная линия), ломаная или функция t → точка.
export type ShapeSrc =
  | { readonly kind: "path"; readonly key: string; readonly d: string }
  | { readonly kind: "poly"; readonly key: string; readonly pts: Pts }
  | {
      readonly kind: "fn";
      readonly key: string;
      readonly fn: (t: number) => Pt;
    };

// Положение формы в кадре: масштаб s, поворот r (градусы), затем сдвиг x, y.
export type Place = {
  readonly x?: number;
  readonly y?: number;
  readonly s?: number;
  readonly r?: number;
};

const cache = new Map<string, Pts>();

// Равномерная по длине выборка n точек из плотной ломаной.
export const resample = (dense: Pts, n = N): Pts => {
  const acc = [0];
  for (let i = 1; i < dense.length; i++)
    acc.push(
      acc[i - 1] +
        Math.hypot(
          dense[i][0] - dense[i - 1][0],
          dense[i][1] - dense[i - 1][1],
        ),
    );
  const total = acc[acc.length - 1] || 1;
  const out: Pt[] = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const target = (total * k) / (n - 1);
    while (j < acc.length - 2 && acc[j + 1] < target) j++;
    const seg = acc[j + 1] - acc[j] || 1;
    const u = Math.max(0, Math.min(1, (target - acc[j]) / seg));
    out.push([
      dense[j][0] + (dense[j + 1][0] - dense[j][0]) * u,
      dense[j][1] + (dense[j + 1][1] - dense[j][1]) * u,
    ]);
  }
  return out;
};

export const sample = (src: ShapeSrc): Pts => {
  const hit = cache.get(src.key);
  if (hit) return hit;
  let pts: Pts;
  if (src.kind === "path") {
    const len = getLength(src.d);
    const dense: Pt[] = [];
    const steps = 1200;
    for (let i = 0; i <= steps; i++) {
      const p = getPointAtLength(src.d, (len * i) / steps);
      if (p) dense.push([p.x, p.y]);
    }
    pts = resample(dense);
  } else if (src.kind === "poly") {
    pts = resample(src.pts);
  } else {
    const dense: Pt[] = [];
    const steps = 1200;
    for (let i = 0; i <= steps; i++) dense.push(src.fn(i / steps));
    pts = resample(dense);
  }
  cache.set(src.key, pts);
  return pts;
};

export const place = (pts: Pts, p: Place = {}): Pts => {
  const s = p.s ?? 1;
  const a = ((p.r ?? 0) * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const x = p.x ?? 0;
  const y = p.y ?? 0;
  if (s === 1 && a === 0 && x === 0 && y === 0) return pts;
  return pts.map(
    ([px, py]) =>
      [x + s * (px * cos - py * sin), y + s * (px * sin + py * cos)] as Pt,
  );
};

// «Текучий» морф: точки начинают движение не одновременно, а волной от
// начала линии к концу (stagger), поэтому линия будто перетекает, а не
// просто растворяется из одной формы в другую.
export const morph = (
  a: Pts,
  b: Pts,
  t: number,
  stagger = 0.3,
  ease: (x: number) => number = (x) => x,
): Pts => {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const n = a.length;
  return a.map((pa, k) => {
    const local = ease(
      Math.max(0, Math.min(1, t * (1 + stagger) - (stagger * k) / (n - 1))),
    );
    const pb = b[k];
    return [
      pa[0] + (pb[0] - pa[0]) * local,
      pa[1] + (pb[1] - pa[1]) * local,
    ] as Pt;
  });
};

const pointAt = (pts: Pts, u: number): Pt => {
  const f = Math.max(0, Math.min(pts.length - 1, u * (pts.length - 1)));
  const i = Math.floor(f);
  const j = Math.min(pts.length - 1, i + 1);
  const r = f - i;
  return [
    pts[i][0] + (pts[j][0] - pts[i][0]) * r,
    pts[i][1] + (pts[j][1] - pts[i][1]) * r,
  ];
};

// Часть линии от доли a до доли b (0…1) — сглаженный SVG-путь (квадратичные
// кривые через середины отрезков).
export const toPath = (pts: Pts, a = 0, b = 1): string => {
  if (b - a <= 0.0005) return "";
  const n = pts.length;
  const first = pointAt(pts, a);
  const last = pointAt(pts, b);
  const inner: Pt[] = [];
  for (
    let k = Math.ceil(a * (n - 1) + 1e-6);
    k <= Math.floor(b * (n - 1) - 1e-6);
    k++
  )
    inner.push(pts[k]);
  const all = [first, ...inner, last];
  if (all.length < 3)
    return `M ${first[0].toFixed(1)} ${first[1].toFixed(1)} L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
  let d = `M ${all[0][0].toFixed(1)} ${all[0][1].toFixed(1)}`;
  for (let i = 1; i < all.length - 1; i++) {
    const mx = (all[i][0] + all[i + 1][0]) / 2;
    const my = (all[i][1] + all[i + 1][1]) / 2;
    d += ` Q ${all[i][0].toFixed(1)} ${all[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  d += ` L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
  return d;
};

export const headOf = (pts: Pts, b: number) => pointAt(pts, b);
