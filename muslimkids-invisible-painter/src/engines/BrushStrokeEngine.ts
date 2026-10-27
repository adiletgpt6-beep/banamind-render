// BrushStrokeEngine — художественный мазок кисти, появляющийся без руки художника.
//
// Мазок = гладкая кривая (Catmull-Rom по контрольным точкам) + профиль ширины
// (нажим, сужение к концам) + «тело» полупрозрачной краски + 8–18 щетинок.
// Щетинки дают продольную фактуру, а на сухом конце мазка рвутся по шуму
// (Dry Brush). Прогресс p раскрывает мазок вдоль пути с мягкой «головой».

import { clamp01, mulberry32, noise3, smooth } from "../utils/noise";
import { hashStr, type Pt } from "./WatercolorSimulationEngine";

export type StrokeSpec = {
  id: string;
  pts: Pt[];
  width: number;
  color: string;
  /** второй пигмент для части щетинок */
  color2?: string;
  bristles?: number;
  /** сухость кисти 0..1 */
  dry?: number;
  opacity?: number;
  /** сужение [начало, конец] в долях длины */
  taper?: [number, number];
  mode?: GlobalCompositeOperation;
  seed?: number;
};

type StrokeGeom = {
  xs: Float32Array; ys: Float32Array; nx: Float32Array; ny: Float32Array; s: Float32Array;
  len: number;
  br: { off: number; a: number; w: number; c2: boolean; seed: number }[];
};

const cache = new Map<string, StrokeGeom>();

const catmull = (pts: Pt[], step: number): Pt[] => {
  if (pts.length < 2) return pts;
  const out: Pt[] = [];
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const seg = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const n = Math.max(2, Math.ceil(seg / step));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

export const strokeGeom = (sp: StrokeSpec): StrokeGeom => {
  const hit = cache.get(sp.id);
  if (hit) return hit;
  const pts = catmull(sp.pts, Math.max(3, sp.width * 0.18));
  const n = pts.length;
  const xs = new Float32Array(n), ys = new Float32Array(n), nx = new Float32Array(n), ny = new Float32Array(n), s = new Float32Array(n);
  let L = 0;
  for (let i = 0; i < n; i++) {
    xs[i] = pts[i].x;
    ys[i] = pts[i].y;
    if (i > 0) L += Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
    s[i] = L;
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    nx[i] = -dy / l;
    ny[i] = dx / l;
  }
  const rng = mulberry32(sp.seed ?? hashStr(sp.id));
  const B = sp.bristles ?? 12;
  const br = Array.from({ length: B }, (_, k) => ({
    off: (k / (B - 1) - 0.5) * 0.92 + (rng() - 0.5) * 0.08,
    a: 0.25 + rng() * 0.6,
    w: 0.6 + rng() * 0.9,
    c2: !!sp.color2 && rng() < 0.4,
    seed: rng() * 100,
  }));
  const g = { xs, ys, nx, ny, s, len: L, br };
  cache.set(sp.id, g);
  return g;
};

export type StrokeOpts = { alpha?: number; dx?: number; dy?: number; widthMul?: number; time?: number };

/** Нарисовать мазок, раскрытый на долю p длины. */
export function drawStroke(ctx: CanvasRenderingContext2D, sp: StrokeSpec, p: number, o: StrokeOpts = {}) {
  if (p <= 0.001) return;
  const g = strokeGeom(sp);
  const head = g.len * clamp01(p);
  const [t0, t1] = sp.taper ?? [0.12, 0.3];
  const W = sp.width * (o.widthMul ?? 1);
  const seed = sp.seed ?? hashStr(sp.id);
  const wAt = (i: number) => {
    const u = g.s[i] / g.len;
    const tin = smooth(u / Math.max(0.01, t0));
    const tout = smooth((1 - u) / Math.max(0.01, t1));
    // мягкая «голова» мазка, пока он рисуется
    const h = p < 1 ? smooth((head - g.s[i]) / (W * 0.9)) : 1;
    const press = 1 + 0.16 * noise3(g.s[i] * 0.012, seed, 0.3);
    return W * Math.min(tin, tout) * h * press * 0.5;
  };
  let last = 0;
  while (last < g.s.length - 1 && g.s[last + 1] <= head) last++;
  if (last < 1) return;
  const op = (sp.opacity ?? 0.85) * (o.alpha ?? 1);
  ctx.save();
  ctx.globalCompositeOperation = sp.mode ?? "multiply";
  ctx.translate(o.dx ?? 0, o.dy ?? 0);
  // тело мазка
  const widths = new Float32Array(last + 1);
  for (let i = 0; i <= last; i++) widths[i] = wAt(i);
  const body = new Path2D();
  for (let i = 0; i <= last; i++) body[i ? "lineTo" : "moveTo"](g.xs[i] + g.nx[i] * widths[i], g.ys[i] + g.ny[i] * widths[i]);
  for (let i = last; i >= 0; i--) body.lineTo(g.xs[i] - g.nx[i] * widths[i], g.ys[i] - g.ny[i] * widths[i]);
  body.closePath();
  // тело мазка; кроющая гуашь (source-over) плотнее прозрачной акварели
  ctx.globalAlpha = op * (sp.mode === "source-over" ? 0.85 : 0.55);
  ctx.fillStyle = sp.color;
  ctx.fill(body);
  // щетинки
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const dry = sp.dry ?? 0.3;
  const B = g.br.length;
  for (const b of g.br) {
    ctx.strokeStyle = b.c2 ? sp.color2! : sp.color;
    ctx.globalAlpha = op * b.a * 0.55;
    ctx.lineWidth = Math.max(0.8, ((W / B) * 1.7) * b.w);
    ctx.beginPath();
    let pen = false;
    for (let i = 0; i <= last; i++) {
      const u = g.s[i] / g.len;
      // Dry Brush: краска заканчивается к концу мазка — щетинка рвётся
      const thr = -0.55 + dry * 0.9 + u * u * dry * 1.1;
      const on = noise3(g.s[i] * 0.03, b.seed, 1.7) > thr - 0.0;
      const w = widths[i] * b.off * 2;
      const x = g.xs[i] + g.nx[i] * w, y = g.ys[i] + g.ny[i] * w;
      if (on && widths[i] > 0.3) {
        if (!pen) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        pen = true;
      } else pen = false;
    }
    ctx.stroke();
  }
  ctx.restore();
}
