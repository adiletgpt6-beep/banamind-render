// PaintMorphEngine — переходы через трансформацию краски (Paint Morph Transition).
// Organic Shape Interpolation: обе формы пересэмплируются по длине дуги
// в одинаковое число точек, затем интерполируются; в середине перехода
// край «плывёт» по шумовому полю (Fluid-Like Morphing), к концам — точно.

import { clamp01, noise3, smoother } from "../utils/noise";
import type { Pt } from "./WatercolorSimulationEngine";

export function resample(poly: Pt[], n: number, closed = true): Pt[] {
  const P = closed ? [...poly, poly[0]] : poly;
  const acc = [0];
  for (let i = 1; i < P.length; i++) acc.push(acc[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  const L = acc[acc.length - 1];
  const out: Pt[] = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const s = (k / (closed ? n : n - 1)) * L;
    while (j < acc.length - 2 && acc[j + 1] < s) j++;
    const t = (s - acc[j]) / Math.max(1e-6, acc[j + 1] - acc[j]);
    out.push({ x: P[j].x + (P[j + 1].x - P[j].x) * t, y: P[j].y + (P[j + 1].y - P[j].y) * t });
  }
  return out;
}

/** Выровнять стартовую точку b по ближайшей к a[0], чтобы форма не «скручивалась». */
const align = (a: Pt[], b: Pt[]) => {
  let best = 0, bd = Infinity;
  for (let i = 0; i < b.length; i++) {
    const d = (b[i].x - a[0].x) ** 2 + (b[i].y - a[0].y) ** 2;
    if (d < bd) { bd = d; best = i; }
  }
  return [...b.slice(best), ...b.slice(0, best)];
};

export function morphPoly(a: Pt[], b: Pt[], t: number, n = 96, flow = 18, seed = 1): Pt[] {
  const A = resample(a, n);
  const B = align(A, resample(b, n));
  const e = smoother(t);
  const amp = Math.sin(Math.PI * clamp01(t)) * flow;
  return A.map((p, i) => {
    const q = B[i];
    const x = p.x + (q.x - p.x) * e, y = p.y + (q.y - p.y) * e;
    return {
      x: x + noise3(x * 0.006, y * 0.006, seed + t * 2) * amp,
      y: y + noise3(x * 0.006 + 40, y * 0.006, seed + t * 2) * amp,
    };
  });
}

/** Гладкий контур (квадратичные сплайны через середины рёбер). */
export function smoothPath(pts: Pt[]) {
  const p = new Path2D();
  const n = pts.length;
  const m = (i: number) => ({ x: (pts[i % n].x + pts[(i + 1) % n].x) / 2, y: (pts[i % n].y + pts[(i + 1) % n].y) / 2 });
  const s = m(0);
  p.moveTo(s.x, s.y);
  for (let i = 1; i <= n; i++) {
    const c = pts[i % n], e = m(i);
    p.quadraticCurveTo(c.x, c.y, e.x, e.y);
  }
  p.closePath();
  return p;
}
