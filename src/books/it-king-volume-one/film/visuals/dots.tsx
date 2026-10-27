// Точечная графика BM-020: формы собираются из чётких точек и в конце движения
// стоят неподвижно с чистыми краями (без вечного шума, тумана и размытия).
// Всё детерминировано: положение точек зависит только от формы и seed,
// движение — только от времени сцены. Math.random не используется.
import React from "react";
import { Easing } from "remotion";
import { C } from "../theme";

export type Dot = { x: number; y: number; r: number; c: number }; // c — индекс цвета в палитре
export type Shape = Dot[];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeOut = Easing.bezier(0.16, 0.84, 0.3, 1);
export const easeInOut = Easing.bezier(0.45, 0, 0.25, 1);

// детерминированный «случай» по номеру точки и seed (hash → 0…1)
export const rnd = (i: number, seed = 1) => {
  let h = (i + 1) * 374761393 + seed * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};

export const PALETTE = [C.teal, C.amber, C.white, C.mist, C.dim, C.bordo, C.tealSoft, C.paper];
export const COL = { teal: 0, amber: 1, white: 2, mist: 3, dim: 4, bordo: 5, tealSoft: 6, paper: 7 } as const;
export type ColName = keyof typeof COL;

// ───────────── построители форм ─────────────
type Opt = { gap?: number; r?: number; col?: ColName };
const D = (x: number, y: number, o: Opt): Dot => ({ x, y, r: o.r ?? 4, c: COL[o.col ?? "teal"] });

export const line = (x1: number, y1: number, x2: number, y2: number, o: Opt = {}): Shape => {
  const gap = o.gap ?? 13;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const n = Math.max(1, Math.round(len / gap));
  return Array.from({ length: n + 1 }, (_, i) => D(x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n, o));
};

export const poly = (pts: [number, number][], o: Opt & { closed?: boolean } = {}): Shape => {
  const out: Shape = [];
  const n = o.closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const [a, b] = [pts[i], pts[(i + 1) % pts.length]];
    out.push(...line(a[0], a[1], b[0], b[1], o).slice(i === 0 ? 0 : 1));
  }
  return out;
};

export const rect = (x: number, y: number, w: number, h: number, o: Opt = {}): Shape =>
  poly(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
    { ...o, closed: true },
  );

export const circle = (cx: number, cy: number, r: number, o: Opt & { from?: number; to?: number } = {}): Shape => {
  const gap = o.gap ?? 13;
  const a0 = o.from ?? 0;
  const a1 = o.to ?? Math.PI * 2;
  const n = Math.max(6, Math.round((Math.abs(a1 - a0) * r) / gap));
  const full = Math.abs(a1 - a0) >= Math.PI * 2 - 1e-6;
  return Array.from({ length: full ? n : n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return D(cx + Math.cos(a) * r, cy + Math.sin(a) * r, o);
  });
};

// квадратичная/кубическая кривая
export const curve = (p: [number, number][], o: Opt = {}): Shape => {
  const gap = o.gap ?? 13;
  const at = (t: number): [number, number] => {
    if (p.length === 3) {
      const u = 1 - t;
      return [u * u * p[0][0] + 2 * u * t * p[1][0] + t * t * p[2][0], u * u * p[0][1] + 2 * u * t * p[1][1] + t * t * p[2][1]];
    }
    const u = 1 - t;
    return [
      u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
      u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1],
    ];
  };
  let len = 0;
  let prev = at(0);
  for (let i = 1; i <= 40; i++) {
    const q = at(i / 40);
    len += Math.hypot(q[0] - prev[0], q[1] - prev[1]);
    prev = q;
  }
  const n = Math.max(2, Math.round(len / gap));
  return Array.from({ length: n + 1 }, (_, i) => {
    const [x, y] = at(i / n);
    return D(x, y, o);
  });
};

const inPoly = (x: number, y: number, pts: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

// заливка многоугольника гексагональной сеткой (ровная, без шума)
export const fill = (pts: [number, number][], o: Opt = {}): Shape => {
  const gap = o.gap ?? 16;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const out: Shape = [];
  let row = 0;
  for (let y = Math.min(...ys) + gap / 2; y < Math.max(...ys); y += gap * 0.866, row++) {
    for (let x = Math.min(...xs) + (row % 2 ? gap / 2 : gap / 4); x < Math.max(...xs); x += gap) if (inPoly(x, y, pts)) out.push(D(x, y, o));
  }
  return out;
};

export const fillRect = (x: number, y: number, w: number, h: number, o: Opt = {}) =>
  fill(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
    o,
  );

export const disc = (cx: number, cy: number, r: number, o: Opt = {}) =>
  fill(
    Array.from({ length: 40 }, (_, i) => [cx + Math.cos((i / 40) * Math.PI * 2) * r, cy + Math.sin((i / 40) * Math.PI * 2) * r] as [number, number]),
    o,
  );

export const join = (...s: Shape[]): Shape => s.flat();

export const move = (s: Shape, dx: number, dy: number, k = 1): Shape => s.map((d) => ({ ...d, x: d.x * k + dx, y: d.y * k + dy }));

export const recolor = (s: Shape, col: ColName): Shape => s.map((d) => ({ ...d, c: COL[col] }));

// кэш форм: строятся один раз на процесс рендера
const cache = new Map<string, Shape>();
export const memo = (key: string, build: () => Shape): Shape => {
  let s = cache.get(key);
  if (!s) {
    s = build();
    cache.set(key, s);
  }
  return s;
};

// ───────────── отрисовка ─────────────
export type Scatter = "burst" | "rise" | "left" | "right" | "rain";

// где точка была до сборки: детерминированный разброс вокруг формы
const startOf = (d: Dot, i: number, seed: number, mode: Scatter, cx: number, cy: number): [number, number] => {
  const a = rnd(i, seed) * Math.PI * 2;
  const r = 140 + rnd(i, seed + 7) * 420;
  switch (mode) {
    case "rise":
      return [d.x + (rnd(i, seed + 3) - 0.5) * 160, d.y + 260 + rnd(i, seed + 5) * 340];
    case "rain":
      return [d.x + (rnd(i, seed + 3) - 0.5) * 60, d.y - 300 - rnd(i, seed + 5) * 400];
    case "left":
      return [d.x - 380 - rnd(i, seed + 5) * 500, d.y + (rnd(i, seed + 3) - 0.5) * 200];
    case "right":
      return [d.x + 380 + rnd(i, seed + 5) * 500, d.y + (rnd(i, seed + 3) - 0.5) * 200];
    default:
      return [cx + (d.x - cx) * 0.3 + Math.cos(a) * r, cy + (d.y - cy) * 0.3 + Math.sin(a) * r];
  }
};

export type DotsProps = {
  shape: Shape;
  k: number; // 0 — рассыпано, 1 — собрано (форма неподвижна)
  seed?: number;
  scatter?: Scatter;
  spread?: number; // доля времени, на которую растянуты задержки отдельных точек
  opacity?: number;
  palette?: string[];
  glow?: number; // мягкое свечение вокруг каждой точки (0…1), без размытия краёв
  dimTo?: number; // >0: точки гаснут к этому уровню (погасшие окна)
  dimK?: number;
  only?: (d: Dot, i: number) => boolean;
};

export const Dots: React.FC<DotsProps> = ({ shape, k, seed = 1, scatter = "burst", spread = 0.45, opacity = 1, palette = PALETTE, glow = 0, dimTo, dimK = 0, only }) => {
  if (k <= 0.001 || opacity <= 0.001) return null;
  let cx = 0;
  let cy = 0;
  for (const d of shape) {
    cx += d.x;
    cy += d.y;
  }
  cx /= Math.max(1, shape.length);
  cy /= Math.max(1, shape.length);
  const done = k >= 0.999;
  return (
    <g opacity={opacity}>
      {shape.map((d, i) => {
        if (only && !only(d, i)) return null;
        let x = d.x;
        let y = d.y;
        let a = 1;
        if (!done) {
          const delay = rnd(i, seed + 11) * spread;
          const p = easeOut(clamp01((k - delay) / (1 - spread)));
          if (p <= 0) return null;
          const [sx, sy] = startOf(d, i, seed, scatter, cx, cy);
          x = sx + (d.x - sx) * p;
          y = sy + (d.y - sy) * p;
          a = clamp01(p * 1.6);
        }
        const fill = palette[d.c] ?? C.teal;
        const dim = dimTo !== undefined ? 1 - (1 - dimTo) * dimK : 1;
        return (
          <g key={i}>
            {glow > 0 && <circle cx={x} cy={y} r={d.r * 2.6} fill={fill} opacity={0.12 * glow * a * dim} />}
            <circle cx={x} cy={y} r={d.r} fill={fill} opacity={a * dim} />
          </g>
        );
      })}
    </g>
  );
};

// плавный переход одной формы в другую (точки перестраиваются, не исчезают)
export const Morph: React.FC<{ a: Shape; b: Shape; k: number; seed?: number; palette?: string[]; opacity?: number }> = ({ a, b, k, seed = 3, palette = PALETTE, opacity = 1 }) => {
  const n = Math.max(a.length, b.length);
  return (
    <g opacity={opacity}>
      {Array.from({ length: n }, (_, i) => {
        const da = a[i % a.length];
        const db = b[i % b.length];
        const delay = rnd(i, seed) * 0.35;
        const p = easeInOut(clamp01((k - delay) / 0.65));
        // лёгкая дуга, чтобы точки не шли строем
        const bow = Math.sin(p * Math.PI) * (rnd(i, seed + 1) - 0.5) * 120;
        const x = da.x + (db.x - da.x) * p + bow;
        const y = da.y + (db.y - da.y) * p - Math.abs(bow) * 0.4;
        const r = da.r + (db.r - da.r) * p;
        const col = p < 0.5 ? palette[da.c] : palette[db.c];
        // лишние точки одной формы сливаются с соседями другой
        const extra = (i >= a.length && p < 0.5) || (i >= b.length && p > 0.5);
        return <circle key={i} cx={x} cy={y} r={r} fill={col} opacity={extra ? 0 : 1} />;
      })}
    </g>
  );
};

// время появления по репликам сцены: номер реплики (целое) или реплика + доля речи
export type VisualCtx = { t: number; dur: number; beats: number[]; ends: number[] };
export type VisualProps<P = Record<string, unknown>> = VisualCtx & { p: P };
export const at = (ctx: VisualCtx, beat: number) => {
  const i = Math.floor(beat);
  const frac = beat - i;
  const b = ctx.beats[Math.min(i, ctx.beats.length - 1)] ?? 0;
  const e = ctx.ends[Math.min(i, ctx.ends.length - 1)] ?? b;
  return b + (e - b) * frac;
};
export const ramp = (t: number, a: number, d = 1.2) => clamp01((t - a) / d);
