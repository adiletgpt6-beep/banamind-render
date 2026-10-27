// Превращает векторный силуэт (Canvas Path2D/текст) в набор целевых позиций точек.
// Маска рисуется в OffscreenCanvas (половинное разрешение), затем внутри маски
// раскладывается гексагональная сетка — ровная, «референсная» укладка точек.
import { GRADIENT_NAMES, gradIndex } from "./ParticleColorSystem";
import { hash01 } from "./rng";

export const W = 1080;
export const H = 1920;
const MS = 0.5; // масштаб маски

export type Motion =
  | { type: "float"; amp?: number }
  | { type: "rotate"; cx: number; cy: number; speed: number }
  | { type: "orbit"; cx: number; cy: number; rx: number; ry: number; tilt: number; speed: number; phase: number; bx: number; by: number }
  | { type: "fall"; dist: number; speed: number; phase: number }
  | { type: "twinkle"; speed?: number }
  | { type: "sweep"; period: number; width: number; delay?: number }
  | { type: "pulse"; amp: number; speed: number };

export type ColorMap = "x" | "y" | "radial" | "angle" | "diag" | "index" | "noise" | "const" | ((x: number, y: number, i: number, n: number) => number);

export type PartSpec = {
  draw?: (ctx: CanvasRenderingContext2D) => void;
  points?: Array<[number, number]>;
  spacing?: number;
  r?: number; // абсолютный радиус точки
  rMul?: number;
  rJitter?: number;
  grad: string;
  map?: ColorMap;
  u0?: number;
  u1?: number;
  noise?: number;
  alpha?: number;
  motion?: Motion;
  shimmer?: number; // скорость перелива (доля градиента в секунду)
  jitter?: number; // доля шага: «живая», не машинная сетка
};

export type ShapeSpec = { name: string; parts: PartSpec[] };

export type PartMeta = { motion?: Motion; shimmer: number; count: number };

export type SampledShape = {
  name: string;
  n: number;
  x: Float32Array;
  y: Float32Array;
  r: Float32Array;
  u: Float32Array;
  g: Uint8Array;
  a: Float32Array;
  part: Uint16Array;
  pidx: Float32Array; // позиция точки внутри своей части 0..1 (для волн выделения)
  parts: PartMeta[];
};

let maskCanvas: HTMLCanvasElement | null = null;
const getMaskCtx = () => {
  if (!maskCanvas) {
    // обычный canvas документа: в нём доступны загруженные веб-шрифты (цифры, «?»)
    maskCanvas = document.createElement("canvas");
    maskCanvas.width = W * MS;
    maskCanvas.height = H * MS;
  }
  const ctx = maskCanvas.getContext("2d", { willReadFrequently: true })!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, W * MS, H * MS);
  ctx.setTransform(MS, 0, 0, MS, 0, 0);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  return ctx;
};

const samplePart = (spec: PartSpec, salt: number): Array<[number, number]> => {
  if (spec.points) return spec.points;
  const ctx = getMaskCtx();
  spec.draw!(ctx);
  const mw = W * MS;
  const mh = H * MS;
  const data = ctx.getImageData(0, 0, mw, mh).data;
  let x0 = mw, y0 = mh, x1 = 0, y1 = 0;
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      if (data[(y * mw + x) * 4 + 3] > 127) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  const pts: Array<[number, number]> = [];
  if (x1 < x0) return pts;
  const d = spec.spacing ?? 13;
  const dy = d * 0.8660254;
  const jit = (spec.jitter ?? 0.06) * d;
  const ox = (hash01(salt, 1) - 0.5) * d;
  let row = 0;
  for (let y = y0 / MS + dy * 0.5; y <= y1 / MS + 1; y += dy, row++) {
    for (let x = x0 / MS + (row % 2 ? d / 2 : 0) + ox * 0.2; x <= x1 / MS + 1; x += d) {
      const mx = Math.round(x * MS);
      const my = Math.round(y * MS);
      if (mx < 0 || my < 0 || mx >= mw || my >= mh) continue;
      if (data[(my * mw + mx) * 4 + 3] > 127) {
        const k = pts.length;
        pts.push([x + (hash01(k, salt + 7) - 0.5) * jit, y + (hash01(k, salt + 11) - 0.5) * jit]);
      }
    }
  }
  return pts;
};

const cache = new Map<string, SampledShape>();

export const sampleShape = (spec: ShapeSpec): SampledShape => {
  const hit = cache.get(spec.name);
  if (hit) return hit;
  const all: Array<{ x: number; y: number; r: number; u: number; g: number; a: number; part: number; pidx: number }> = [];
  const parts: PartMeta[] = [];
  spec.parts.forEach((p, pi) => {
    const pts = samplePart(p, pi * 131 + spec.name.length * 17);
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    for (const [x, y] of pts) {
      bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x);
      by0 = Math.min(by0, y); by1 = Math.max(by1, y);
    }
    const cx = (bx0 + bx1) / 2, cy = (by0 + by1) / 2;
    const bw = Math.max(1, bx1 - bx0), bh = Math.max(1, by1 - by0);
    const rad = Math.max(bw, bh) / 2;
    const g = gradIndex(p.grad);
    const u0 = p.u0 ?? 0, u1 = p.u1 ?? 1;
    const rBase = p.r ?? (p.spacing ?? 13) * 0.36 * (p.rMul ?? 1);
    pts.forEach(([x, y], i) => {
      let m: number;
      const map = p.map ?? "diag";
      if (typeof map === "function") m = map(x, y, i, pts.length);
      else if (map === "x") m = (x - bx0) / bw;
      else if (map === "y") m = (y - by0) / bh;
      else if (map === "radial") m = Math.hypot(x - cx, y - cy) / rad;
      else if (map === "angle") m = (Math.atan2(y - cy, x - cx) + Math.PI) / (2 * Math.PI);
      else if (map === "index") m = pts.length > 1 ? i / (pts.length - 1) : 0;
      else if (map === "noise") m = 0.5 + 0.5 * Math.sin(x * 0.011 + Math.sin(y * 0.013) * 2.1) * Math.cos(y * 0.009 - x * 0.004);
      else if (map === "const") m = 0;
      else m = ((x - bx0) / bw + (y - by0) / bh) / 2;
      const u = u0 + (u1 - u0) * m + (p.noise ?? 0.06) * (hash01(i, pi + 3) - 0.5);
      const r = rBase * (1 + (p.rJitter ?? 0.08) * (hash01(i, pi + 5) - 0.5) * 2);
      all.push({ x, y, r, u, g, a: p.alpha ?? 1, part: pi, pidx: pts.length > 1 ? i / (pts.length - 1) : 0 });
    });
    parts.push({ motion: p.motion, shimmer: p.shimmer ?? 0.03, count: pts.length });
  });
  const n = all.length;
  const s: SampledShape = {
    name: spec.name,
    n,
    x: new Float32Array(n), y: new Float32Array(n), r: new Float32Array(n), u: new Float32Array(n),
    g: new Uint8Array(n), a: new Float32Array(n), part: new Uint16Array(n), pidx: new Float32Array(n), parts,
  };
  all.forEach((p, i) => {
    s.x[i] = p.x; s.y[i] = p.y; s.r[i] = p.r; s.u[i] = p.u; s.g[i] = p.g; s.a[i] = p.a; s.part[i] = p.part; s.pidx[i] = p.pidx;
  });
  cache.set(spec.name, s);
  return s;
};

export const gradientCount = GRADIENT_NAMES.length;
