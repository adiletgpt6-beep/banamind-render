// Точечная сборка BM-034: плотные, чёткие, цветные точки (векторные круги без
// размытия и без свечения) слетаются в ясный силуэт и перестраиваются из одной
// формы в другую. Точки размещаются на шестиугольной сетке — после сборки
// силуэт ровный и читается на телефоне; движение детерминировано (зависит только
// от времени), поэтому нет случайного мерцания между кадрами.
import React from "react";
import { clamp01, ease } from "./kit";

export type Pt = { x: number; y: number; c: string };
type Inside = (x: number, y: number) => boolean;

// ── детерминированный «случай» ──
export const hash = (i: number, s = 0) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const segDist = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax;
  const dy = by - ay;
  const l = dx * dx + dy * dy || 1;
  const k = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l));
  return Math.hypot(px - ax - k * dx, py - ay - k * dy);
};

// ── формы в локальных координатах (центр 0,0; размер ≈ 100 = «единица») ──
export const SH = {
  circle: (r: number): Inside => (x, y) => x * x + y * y <= r * r,
  ring: (r1: number, r2: number): Inside => (x, y) => {
    const d = Math.hypot(x, y);
    return d >= r1 && d <= r2;
  },
  rect: (w: number, h: number, r = 0): Inside => (x, y) => {
    const ax = Math.abs(x) - (w / 2 - r);
    const ay = Math.abs(y) - (h / 2 - r);
    return Math.hypot(Math.max(ax, 0), Math.max(ay, 0)) <= r && Math.abs(x) <= w / 2 && Math.abs(y) <= h / 2;
  },
  heart: (s: number): Inside => (x0, y0) => {
    const x = x0 / s;
    const y = -y0 / s + 0.25;
    const a = x * x + y * y - 1;
    return a * a * a - x * x * y * y * y <= 0;
  },
  // человечек: голова + плечи-туловище
  person: (s: number): Inside => (x, y) => {
    const head = Math.hypot(x, y + 0.62 * s) <= 0.3 * s;
    const body = y >= -0.24 * s && y <= 0.75 * s && Math.abs(x) <= 0.48 * s * Math.min(1, 0.5 + (y + 0.24 * s) / (0.4 * s)) && (y < 0.75 * s);
    return head || body;
  },
  // ломаные линии толщиной w (буквы, галочка, стрелки)
  strokes: (lines: number[][], w: number): Inside => (x, y) => {
    for (const ln of lines) for (let i = 0; i + 3 < ln.length; i += 2) if (segDist(x, y, ln[i], ln[i + 1], ln[i + 2], ln[i + 3]) <= w / 2) return true;
    return false;
  },
  union: (...fs: Inside[]): Inside => (x, y) => fs.some((f) => f(x, y)),
  minus: (a: Inside, b: Inside): Inside => (x, y) => a(x, y) && !b(x, y),
  move: (f: Inside, dx: number, dy: number): Inside => (x, y) => f(x - dx, y - dy),
  shield: (s: number): Inside => (x, y) => {
    const u = x / s;
    const v = y / s;
    if (v < -1 || v > 1.05) return false;
    const half = v < 0.1 ? 0.85 : 0.85 * (1 - (v - 0.1) / 0.95);
    return Math.abs(u) <= half;
  },
};

// буквы для точечных слов (ломаные, высота 100)
const GLYPH: Record<string, number[][]> = {
  Д: [[-30, 50, -10, -50, 30, -50, 30, 50], [-46, 50, 46, 50], [-46, 50, -46, 72], [46, 50, 46, 72]],
  А: [[-40, 50, 0, -50, 40, 50], [-22, 12, 22, 12]],
  Н: [[-30, -50, -30, 50], [30, -50, 30, 50], [-30, 0, 30, 0]],
  Е: [[28, -50, -28, -50, -28, 50, 28, 50], [-28, 0, 20, 0]],
  Т: [[-34, -50, 34, -50], [0, -50, 0, 50]],
  "?": [[-28, -28, -22, -46, 0, -52, 22, -46, 28, -28, 22, -12, 0, 0, 0, 20], [0, 44, 0, 50]],
  "!": [[0, -50, 0, 22], [0, 44, 0, 50]],
  "+": [[-30, 0, 30, 0], [0, -30, 0, 30]],
  О: [[0, -50, -28, -40, -38, 0, -28, 40, 0, 50, 28, 40, 38, 0, 28, -40, 0, -50]],
  ",": [[4, 36, -8, 66]],
  "1": [[-16, -34, 6, -50, 6, 50], [-20, 50, 30, 50]],
  "7": [[-30, -50, 32, -50, -6, 50]],
  М: [[-36, 50, -36, -50, 0, 10, 36, -50, 36, 50]],
  Ы: [[-38, -50, -38, 50, -6, 50, 4, 38, 4, 12, -6, 0, -38, 0], [34, -50, 34, 50]],
  "✓": [[-40, 0, -10, 32, 44, -38]],
};
export const word = (text: string, size: number, w = 22): Inside => {
  const chars = [...text];
  const adv = 104;
  const total = chars.length * adv;
  const lines: number[][] = [];
  chars.forEach((ch, i) => {
    const g = GLYPH[ch];
    if (!g) return;
    const ox = -total / 2 + adv * (i + 0.5);
    for (const ln of g) lines.push(ln.map((v, k) => (k % 2 === 0 ? v + ox : v)));
  });
  const f = SH.strokes(lines, w);
  const k = size / 100;
  return (x, y) => f(x / k, y / k);
};

// ── точки внутри формы на шестиугольной сетке ──
const cache = new Map<string, { x: number; y: number }[]>();
export const sample = (key: string, f: Inside, box: number, step: number): { x: number; y: number }[] => {
  const ck = `${key}|${box}|${step}`;
  const hit = cache.get(ck);
  if (hit) return hit;
  const out: { x: number; y: number }[] = [];
  const rowH = step * 0.866;
  let j = 0;
  for (let y = -box; y <= box; y += rowH, j++)
    for (let x = -box + (j % 2 ? step / 2 : 0); x <= box; x += step) if (f(x, y)) out.push({ x, y });
  cache.set(ck, out);
  return out;
};

// цвет точки по палитре: полосы, кольца или случайное смешение (детерминированно)
export const paint = (pts: { x: number; y: number }[], cx: number, cy: number, colors: string[], mode: "mix" | "rows" | "radial" = "mix"): Pt[] =>
  pts.map((p, i) => {
    let ci = 0;
    if (mode === "mix") ci = Math.floor(hash(i, 3) * colors.length);
    if (mode === "rows") ci = Math.abs(Math.floor((p.y + 1000) / 40)) % colors.length;
    if (mode === "radial") ci = Math.min(colors.length - 1, Math.floor(Math.hypot(p.x, p.y) / 45));
    return { x: cx + p.x, y: cy + p.y, c: colors[ci] };
  });

// ── рой: из разбросанных точек к цели (k 0→1) с поочерёдным подлётом ──
export const Swarm: React.FC<{
  pts: Pt[];
  k: number; // общий прогресс сборки 0…1
  t: number;
  r?: number;
  from?: "scatter" | "below" | "left" | "right" | "center";
  spread?: number;
  stagger?: number;
  breathe?: number;
  outline?: boolean;
  opacity?: number;
  seed?: number;
}> = ({ pts, k, t, r = 6, from = "scatter", spread = 900, stagger = 0.55, breathe = 1.4, outline = true, opacity = 1, seed = 0 }) => {
  if (k <= 0 && from !== "scatter") return null;
  const n = pts.length;
  return (
    <g opacity={opacity}>
      {pts.map((p, i) => {
        const h1 = hash(i, seed + 1);
        const h2 = hash(i, seed + 2);
        const delay = h1 * stagger;
        const lk = ease(clamp01((k - delay) / Math.max(0.05, 1 - stagger)));
        let sx = p.x;
        let sy = p.y;
        if (from === "scatter") {
          const a = h2 * Math.PI * 2;
          sx = p.x + Math.cos(a) * spread * (0.4 + h1);
          sy = p.y + Math.sin(a) * spread * 0.6 * (0.4 + h1);
        } else if (from === "below") {
          sx = p.x + (h2 - 0.5) * spread * 0.5;
          sy = 1180 + h1 * 200;
        } else if (from === "left") {
          sx = -100 - h1 * 400;
          sy = p.y + (h2 - 0.5) * 300;
        } else if (from === "right") {
          sx = 2020 + h1 * 400;
          sy = p.y + (h2 - 0.5) * 300;
        } else {
          sx = 960 + (h2 - 0.5) * 40;
          sy = 540 + (h1 - 0.5) * 40;
        }
        // изогнутая траектория
        const bend = Math.sin(lk * Math.PI) * 80 * (h2 - 0.5);
        const x = sx + (p.x - sx) * lk + bend;
        const y = sy + (p.y - sy) * lk - bend * 0.5;
        const idle = lk >= 1 ? Math.sin(t * 1.6 + i * 0.7) * breathe : 0;
        const op = from === "scatter" ? clamp01(k * 6) * (0.6 + 0.4 * lk) : clamp01(lk * 3);
        if (op <= 0.01) return null;
        return <circle key={i} cx={x + idle * 0.6} cy={y + idle} r={r * (0.85 + 0.15 * lk)} fill={p.c} stroke={outline ? "#1b1f3d" : "none"} strokeOpacity={0.35} strokeWidth={1.4} opacity={op} />;
      })}
      {n === 0 ? null : null}
    </g>
  );
};

// ── перестройка: те же точки из формы A в форму B (k 0→1) ──
export const Morph: React.FC<{ a: Pt[]; b: Pt[]; k: number; t: number; r?: number; stagger?: number; breathe?: number; arc?: number }> = ({ a, b, k, t, r = 6, stagger = 0.45, breathe = 1.2, arc = 70 }) => {
  const n = Math.max(a.length, b.length);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const pa = a[i % a.length];
    const pb = b[i % b.length];
    const extraA = i >= a.length; // лишние точки «рождаются» из соседей
    const extraB = i >= b.length; // и «растворяются» в соседях
    const delay = hash(i, 9) * stagger;
    const lk = ease(clamp01((k - delay) / Math.max(0.05, 1 - stagger)));
    const bend = Math.sin(lk * Math.PI) * arc * (hash(i, 4) - 0.5);
    const x = pa.x + (pb.x - pa.x) * lk + bend;
    const y = pa.y + (pb.y - pa.y) * lk - bend * 0.4;
    const c = lk < 0.5 ? pa.c : pb.c;
    let op = 1;
    if (extraA) op = lk;
    if (extraB) op = 1 - lk;
    if (op <= 0.01) continue;
    const idle = Math.sin(t * 1.6 + i * 0.7) * breathe * (lk >= 1 || lk <= 0 ? 1 : 0);
    out.push(<circle key={i} cx={x + idle * 0.6} cy={y + idle} r={r} fill={c} stroke="#1b1f3d" strokeOpacity={0.35} strokeWidth={1.4} opacity={op} />);
  }
  return <g>{out}</g>;
};

// точки формы f в точке (cx, cy) — короткая запись
export const dotsOf = (key: string, f: Inside, cx: number, cy: number, colors: string[], step = 15, box = 420, mode: "mix" | "rows" | "radial" = "mix"): Pt[] => paint(sample(key, f, box, step), cx, cy, colors, mode);
