// WatercolorSimulationEngine — визуальная модель акварельного пигмента.
//
// Пятно (wash) строится по методу многослойной деформации полигона:
// базовая форма → рекурсивное смещение середин рёбер (неровный «мокрый» край) →
// 8–24 полупрозрачных слоя, каждый со своей дополнительной деформацией.
// Слои кладутся в режиме multiply: перекрытия темнеют, края остаются мягкими,
// разные пигменты смешиваются субтрактивно (синий + золотой = зелёный).
//
// Растекание (Pigment Spread): каждая вершина слоя «добегает» до своей
// позиции со своей задержкой d∈[0..1] из шумового поля, поэтому край
// продвигается неравномерно, языками — не растущий круг.
// Wet Edge — подчёркнутый край, Water Bloom — светлый развод внутри,
// Granulation / Paper Absorption — текстуры в InvisiblePainterEngine.
//
// Всё детерминировано: геометрия кэшируется по id и зависит только от seed.

import { clamp01, easeOut, gauss, mulberry32, noise3, type Rng } from "../utils/noise";

export type Pt = { x: number; y: number };
type VPt = { x: number; y: number; v: number };

export type WashSpec = {
  id: string;
  shape: Pt[];
  origin?: Pt;
  colors: string[];
  layers?: number;
  opacity?: number;
  /** неровность края относительно размера */
  deform?: number;
  /** сила подчёркнутого «мокрого» края 0..1 */
  edge?: number;
  /** доля разброса задержек растекания 0..1 */
  spreadJitter?: number;
  seed?: number;
  /** 'multiply' (прозрачная акварель) или 'source-over' (кроющая гуашь) */
  mode?: GlobalCompositeOperation;
  /** только край, без заливки (ободок развода) */
  noFill?: boolean;
};

type WashGeom = {
  origin: Pt;
  layers: { xs: Float32Array; ys: Float32Array; d: Float32Array; color: string }[];
  edge: { xs: Float32Array; ys: Float32Array; d: Float32Array };
  full: Path2D[];
  fullEdge: Path2D;
  alpha: number;
};

const cache = new Map<string, WashGeom>();

export const circle = (cx: number, cy: number, r: number, n = 12, rx = 1, ry = 1): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return { x: cx + Math.cos(a) * r * rx, y: cy + Math.sin(a) * r * ry };
  });

export const centroid = (pts: Pt[]): Pt => {
  let x = 0, y = 0;
  for (const p of pts) { x += p.x; y += p.y; }
  return { x: x / pts.length, y: y / pts.length };
};

const deformOnce = (pts: VPt[], scale: number, rng: Rng): VPt[] => {
  const out: VPt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    out.push(a);
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const v = (a.v + b.v) / 2;
    // смещение середины: в основном по нормали, немного вдоль ребра
    const nrm = gauss(rng) * len * 0.32 * scale * v;
    const tan = gauss(rng) * len * 0.08 * scale * v;
    out.push({
      x: (a.x + b.x) / 2 + (-dy / len) * nrm + (dx / len) * tan,
      y: (a.y + b.y) / 2 + (dx / len) * nrm + (dy / len) * tan,
      v: v * (0.65 + rng() * 0.6),
    });
  }
  return out;
};

const deform = (pts: VPt[], depth: number, scale: number, rng: Rng) => {
  let p = pts;
  for (let i = 0; i < depth; i++) p = deformOnce(p, scale, rng);
  return p;
};

/** Деформировать произвольный полигон (например, материк в координатах lon/lat). */
export const deformPoly = (pts: Pt[], depth: number, scale: number, seed: number): Pt[] => {
  const rng = mulberry32(seed);
  return deform(pts.map((p) => ({ ...p, v: 0.6 + rng() * 0.8 })), depth, scale, rng).map(({ x, y }) => ({ x, y }));
};

const toArrays = (pts: VPt[], o: Pt, seed: number, jitter: number) => {
  const n = pts.length;
  const xs = new Float32Array(n), ys = new Float32Array(n), d = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    xs[i] = pts[i].x - o.x;
    ys[i] = pts[i].y - o.y;
    const ang = Math.atan2(ys[i], xs[i]);
    // задержка растекания — гладкое шумовое поле по углу и расстоянию
    const nz = noise3(Math.cos(ang) * 1.3 + seed, Math.sin(ang) * 1.3, Math.hypot(xs[i], ys[i]) * 0.004);
    d[i] = clamp01(0.5 + nz * 0.9) * jitter;
  }
  return { xs, ys, d };
};

const pathOf = (xs: Float32Array, ys: Float32Array) => {
  const p = new Path2D();
  p.moveTo(xs[0], ys[0]);
  for (let i = 1; i < xs.length; i++) p.lineTo(xs[i], ys[i]);
  p.closePath();
  return p;
};

export const washGeom = (s: WashSpec): WashGeom => {
  const hit = cache.get(s.id);
  if (hit) return hit;
  const seed = s.seed ?? hashStr(s.id);
  const rng = mulberry32(seed);
  const origin = s.origin ?? centroid(s.shape);
  const L = s.layers ?? 14;
  const def = s.deform ?? 1;
  const jitter = s.spreadJitter ?? 0.55;
  const base = deform(s.shape.map((p) => ({ ...p, v: 0.6 + rng() * 0.8 })), 2, def, rng);
  const layers = [];
  for (let k = 0; k < L; k++) {
    const lr = mulberry32(seed * 31 + k * 977);
    const pts = deform(base.map((p) => ({ ...p })), 3, def * 0.55, lr);
    layers.push({ ...toArrays(pts, origin, seed % 97 + k * 0.37, jitter), color: s.colors[k % s.colors.length] });
  }
  const edgePts = deform(base.map((p) => ({ ...p })), 2, def * 0.25, mulberry32(seed + 5));
  const edge = toArrays(edgePts, origin, seed % 97, jitter);
  const alpha = Math.min(0.5, ((s.opacity ?? 0.8) * 2.4) / L);
  if ((s.mode ?? "multiply") === "multiply") {
    // multiply-слои одного пигмента перемножаются: в центре цвет ≈ c^(L·α).
    // Заранее «осветляем» пигмент, чтобы центр пятна давал задуманный цвет,
    // а края оставались светлее — как у настоящей акварели.
    const k = Math.max(1, L * alpha * 0.85);
    for (const l of layers) l.color = liftColor(l.color, k);
  }
  const g: WashGeom = {
    origin,
    layers,
    edge,
    full: layers.map((l) => pathOf(l.xs, l.ys)),
    fullEdge: pathOf(edge.xs, edge.ys),
    alpha,
  };
  cache.set(s.id, g);
  return g;
};

const liftCache = new Map<string, string>();
export function liftColor(c: string, k: number) {
  const key = c + k.toFixed(2);
  const hit = liftCache.get(key);
  if (hit) return hit;
  if (!c.startsWith("#")) return c;
  const n = parseInt(c.slice(1), 16);
  const ch = (sh: number) => Math.round(255 * Math.pow(((n >> sh) & 255) / 255, 1 / k));
  const out = `rgb(${ch(16)},${ch(8)},${ch(0)})`;
  liftCache.set(key, out);
  return out;
}

export function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) % 100000 + 1;
}

const spreadPath = (xs: Float32Array, ys: Float32Array, d: Float32Array, p: number, wob: number, t: number) => {
  const path = new Path2D();
  for (let i = 0; i < xs.length; i++) {
    // вершина начинает движение с задержкой d[i]; к p=1 все на месте
    // общий рост + языки: вершины с малой задержкой убегают вперёд
    const g = 0.5 * easeOut(p) + 0.5 * easeOut(clamp01((p - d[i]) / Math.max(0.05, 1 - d[i])));
    const w = wob ? 1 + wob * noise3(i * 0.07, t, d[i] * 3) * (1 - g * 0.6) : 1;
    const x = xs[i] * g * w, y = ys[i] * g * w;
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  path.closePath();
  return path;
};

export type WashOpts = {
  /** доп. прозрачность 0..1 */
  alpha?: number;
  dx?: number;
  dy?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
  /** «дыхание» мокрого края во время растекания */
  wobble?: number;
  time?: number;
  colorOverride?: string;
};

/** Нарисовать акварельное пятно с прогрессом растекания p (0..1). */
export function drawWash(ctx: CanvasRenderingContext2D, s: WashSpec, p: number, o: WashOpts = {}) {
  if (p <= 0.001) return;
  const g = washGeom(s);
  const a = g.alpha * (o.alpha ?? 1);
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalCompositeOperation = s.mode ?? "multiply";
  ctx.translate(g.origin.x + (o.dx ?? 0), g.origin.y + (o.dy ?? 0));
  if (o.rotate) ctx.rotate(o.rotate);
  if (o.scaleX !== undefined || o.scaleY !== undefined) ctx.scale(o.scaleX ?? 1, o.scaleY ?? 1);
  const done = p >= 0.999;
  ctx.globalAlpha = Math.min(1, a);
  for (let k = 0; k < (s.noFill ? 0 : g.layers.length); k++) {
    const l = g.layers[k];
    ctx.fillStyle = o.colorOverride ?? l.color;
    // слои растекаются чуть по-разному: внешние запаздывают
    const lp = done ? 1 : clamp01(p * (1 + k * 0.025) - k * 0.006);
    ctx.fill(done ? g.full[k] : spreadPath(l.xs, l.ys, l.d, lp, o.wobble ?? 0.04, (o.time ?? 0) + k));
  }
  const edge = s.edge ?? 0.5;
  if (edge > 0) {
    // Wet Edge: пигмент скапливается у границы высыхающего пятна
    ctx.globalAlpha = Math.min(1, (s.opacity ?? 0.8) * 0.32 * edge * (o.alpha ?? 1));
    ctx.strokeStyle = o.colorOverride ?? s.colors[0];
    ctx.lineJoin = "round";
    const base = Math.max(1.2, Math.sqrt(boxSize(g)) * 0.09);
    const path = done ? g.fullEdge : spreadPath(g.edge.xs, g.edge.ys, g.edge.d, p, 0.03, o.time ?? 0);
    ctx.lineWidth = base;
    ctx.stroke(path);
    ctx.globalAlpha *= 0.6;
    ctx.lineWidth = base * 2.4;
    ctx.stroke(path);
  }
  ctx.restore();
}

const sizeCache = new WeakMap<WashGeom, number>();
const boxSize = (g: WashGeom) => {
  const c = sizeCache.get(g);
  if (c !== undefined) return c;
  let mx = 0;
  const { xs, ys } = g.edge;
  for (let i = 0; i < xs.length; i++) mx = Math.max(mx, Math.abs(xs[i]), Math.abs(ys[i]));
  sizeCache.set(g, mx);
  return mx;
};

/** Water Bloom: светлый развод-«цветная капуста» внутри влажного пятна. */
export function waterBloom(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, r: number, p: number, strength = 0.5) {
  drawWash(
    ctx,
    { id: `bloom-${id}`, shape: circle(x, y, r, 10), colors: ["#000"], layers: 8, opacity: strength, edge: 0, deform: 1.3, mode: "destination-out" },
    p,
  );
  // тёмный ободок развода
  drawWash(
    ctx,
    { id: `bloomrim-${id}`, shape: circle(x, y, r * 1.02, 10), colors: ["#174A75"], layers: 1, opacity: 0.8, edge: strength, deform: 1.3, noFill: true },
    p,
  );
}

// ——— Текстуры бумаги и грануляции (процедурные, один раз на вкладку) ———

/** Бесшовный value-noise с периодом P клеток (решётка замкнута по краям). */
const periodicNoise = (P: number, seed: number) => {
  const r = mulberry32(seed);
  const grid = Float32Array.from({ length: P * P }, () => r() * 2 - 1);
  return (u: number, v: number) => {
    const x = u * P, y = v * P;
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const at = (i: number, j: number) => grid[(((j % P) + P) % P) * P + (((i % P) + P) % P)];
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
    return a + (b - a) * sy;
  };
};

let paperTex: HTMLCanvasElement | null = null;
let grainTex: HTMLCanvasElement | null = null;

/** Paper Absorption: волокна и зерно бумаги (тайл 512, бесшовный). */
export function paperTexture(): HTMLCanvasElement {
  if (paperTex) return paperTex;
  const S = 512;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const g = c.getContext("2d")!;
  const img = g.createImageData(S, S);
  const TAU = Math.PI * 2;
  const pn1 = periodicNoise(8, 11), pn2 = periodicNoise(32, 12), pn3 = periodicNoise(128, 13);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S;
      const n1 = pn1(u, v), n2 = pn2(u, v), n3 = pn3(u, v);
      const val = Math.min(255, 249 + n1 * 3 + n2 * 4 + n3 * 4);
      const i = (y * S + x) * 4;
      img.data[i] = val + 4;
      img.data[i + 1] = val + 2;
      img.data[i + 2] = val - 2;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  // волокна бумаги
  const rng = mulberry32(77);
  g.lineCap = "round";
  for (let k = 0; k < 520; k++) {
    const x = rng() * S, y = rng() * S, a = rng() * TAU, l = 6 + rng() * 26;
    const dark = rng() < 0.55;
    g.strokeStyle = dark ? `rgba(150,120,90,${0.05 + rng() * 0.07})` : `rgba(255,255,250,${0.12 + rng() * 0.15})`;
    g.lineWidth = 0.6 + rng() * 0.9;
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      g.beginPath();
      g.moveTo(x + ox, y + oy);
      g.quadraticCurveTo(x + ox + Math.cos(a + 0.4) * l * 0.5, y + oy + Math.sin(a + 0.4) * l * 0.5, x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l);
      g.stroke();
    }
  }
  paperTex = c;
  return c;
}

/** Pigment Granulation: маска зерна (альфа) для destination-out по слою краски. */
export function grainTexture(): HTMLCanvasElement {
  if (grainTex) return grainTex;
  const S = 384;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const g = c.getContext("2d")!;
  const img = g.createImageData(S, S);
  const rng = mulberry32(991);
  const pa = periodicNoise(96, 21), pb = periodicNoise(12, 22);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const n = pa(x / S, y / S) * 1.2, m = pb(x / S, y / S);
      const speck = rng() < 0.02 ? rng() * 0.3 : 0;
      const a = clamp01(0.25 + n * 0.55 + m * 0.25) * 0.75 + speck * 0.4;
      const i = (y * S + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 0;
      img.data[i + 3] = Math.round(clamp01(a) * 255);
    }
  }
  g.putImageData(img, 0, 0);
  grainTex = c;
  return c;
}
