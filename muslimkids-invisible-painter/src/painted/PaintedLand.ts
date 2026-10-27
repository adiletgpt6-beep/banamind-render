// Земля холста: горы крупными мазками в несколько цветовых слоёв,
// дальний берег с лесом, передний берег с травой. Каждый объект проходит
// PAINT → AWAKENING (свет слева, тени справа) → ALIVE (кроны колышутся).

import { drawStroke, type StrokeSpec } from "../engines/BrushStrokeEngine";
import { circle, drawWash, type Pt, type WashSpec } from "../engines/WatercolorSimulationEngine";
import { PALETTE } from "../engines/PainterlyLightingSystem";
import { clamp01, fbm, mulberry32, noise3, smooth } from "../utils/noise";

const X0 = -700, X1 = 1800;

type Range = { id: string; base: number; h: number; freq: number; seed: number; colors: string[]; opacity: number; snow: boolean; shadow: number };
const RANGES: Range[] = [
  { id: "mt-far", base: 800, h: 430, freq: 0.0019, seed: 3, colors: ["#B4CDEA", "#C3C3E3", "#ABCBE8"], opacity: 0.6, snow: true, shadow: 0.16 },
  { id: "mt-mid", base: 800, h: 290, freq: 0.0028, seed: 7, colors: ["#7FA2CC", "#8C9DCC", "#7AA7CE"], opacity: 0.6, snow: true, shadow: 0.18 },
  { id: "mt-near", base: 812, h: 140, freq: 0.004, seed: 11, colors: ["#6FAE8E", "#77A6A8", "#6AAA84"], opacity: 0.6, snow: false, shadow: 0.18 },
];

const ridgeY = (r: Range, x: number) => {
  const n = Math.abs(fbm(x * r.freq, r.seed, 0.3, 2)) + 0.12 * Math.abs(fbm(x * r.freq * 4, r.seed + 3, 0.1, 2));
  const ridged = 1 - Math.min(1, n * 1.5);
  const env = 0.55 + 0.45 * Math.sin(x * r.freq * 0.9 + r.seed);
  return r.base - r.h * (0.25 + 0.75 * ridged * ridged) * env;
};

/** Верхняя граница гор (для расстановки звёзд только в небе). */
export const ridgeTop = (x: number) => Math.min(...RANGES.map((r) => ridgeY(r, x)));

const ridgePts = (r: Range): Pt[] => {
  const pts: Pt[] = [];
  for (let x = X0; x <= X1; x += 30) pts.push({ x, y: ridgeY(r, x) });
  return pts;
};

const mountainSpec = (r: Range): WashSpec => ({
  id: r.id,
  shape: [...ridgePts(r), { x: X1, y: r.base + 80 }, { x: X0, y: r.base + 80 }],
  origin: { x: 540, y: r.base + 60 },
  colors: r.colors,
  layers: 12,
  opacity: r.opacity,
  edge: 0.5,
  deform: 0.12,
  spreadJitter: 0.5,
});
const MOUNTAINS = RANGES.map(mountainSpec);

// тени на склонах: треугольники от вершин вправо-вниз (свет слева)
type Peak = { x: number; y: number; r: Range };
const peaks = (r: Range): Peak[] => {
  const pts = ridgePts(r);
  const out: Peak[] = [];
  for (let i = 2; i < pts.length - 2; i++) {
    if (pts[i].y < pts[i - 1].y && pts[i].y < pts[i + 1].y && pts[i].y < pts[i - 2].y && pts[i].y < pts[i + 2].y && r.base - pts[i].y > r.h * 0.35) out.push({ ...pts[i], r });
  }
  return out;
};
const PEAKS = RANGES.flatMap(peaks);

export type LandState = {
  mountains: number;
  shore: number;
  forest: number;
  bank: number;
  awaken: number;
  alive: number;
  f: number;
  /** снег на вершинах */
  snow: number;
};

export function drawMountains(ctx: CanvasRenderingContext2D, s: LandState) {
  RANGES.forEach((r, i) => {
    const p = clamp01(s.mountains * 1.5 - i * 0.25);
    drawWash(ctx, MOUNTAINS[i], p, { time: s.f * 0.01, wobble: 0.02 });
    if (s.awaken > 0 && p > 0.6) {
      PEAKS.filter((k) => k.r === r).forEach((k, j) => {
        const sh: WashSpec = {
          id: `${r.id}-sh-${j}`,
          shape: [
            { x: k.x + 4, y: k.y + 6 },
            { x: k.x + (r.base - k.y) * 0.9, y: r.base + 40 },
            { x: k.x + (r.base - k.y) * 0.15, y: r.base + 40 },
          ],
          colors: ["#4A5E9A"],
          layers: 7,
          opacity: r.shadow,
          edge: 0,
          deform: 0.55,
        };
        drawWash(ctx, sh, 1, { alpha: s.awaken });
        if (r.snow) {
          const cap: StrokeSpec = {
            id: `${r.id}-snow-${j}`,
            pts: [{ x: k.x - 34, y: k.y + 34 }, { x: k.x - 8, y: k.y + 8 }, { x: k.x, y: k.y + 2 }, { x: k.x + 16, y: k.y + 20 }],
            width: 14,
            color: "#FFFFFF",
            bristles: 7,
            dry: 0.5,
            opacity: 0.85,
            mode: "source-over",
            taper: [0.25, 0.4],
          };
          drawStroke(ctx, cap, s.snow);
        }
      });
    }
  });
}

// ——— Деревья (дальний лес) ———
type Tree = { id: string; x: number; y: number; s: number; kind: "fir" | "round"; t: number; ph: number };
let FOREST: Tree[] | null = null;
const forest = () => {
  if (FOREST) return FOREST;
  const rng = mulberry32(808);
  const out: Tree[] = [];
  for (let k = 0; k < 46; k++) {
    const x = X0 + 200 + rng() * (X1 - X0 - 400);
    const row = rng();
    out.push({ id: `ft-${k}`, x, y: 800 + row * 62, s: 0.45 + row * 0.5 + rng() * 0.15, kind: rng() < 0.45 ? "fir" : "round", t: rng(), ph: rng() * 6 });
  }
  out.sort((a, b) => a.y - b.y);
  FOREST = out;
  return out;
};

const firShape = (x: number, y: number, s: number): Pt[] => [
  { x, y: y - 150 * s }, { x: x + 22 * s, y: y - 95 * s }, { x: x + 14 * s, y: y - 92 * s }, { x: x + 40 * s, y: y - 40 * s },
  { x: x + 28 * s, y: y - 38 * s }, { x: x + 52 * s, y: y + 4 * s }, { x: x - 52 * s, y: y + 4 * s }, { x: x - 28 * s, y: y - 38 * s },
  { x: x - 40 * s, y: y - 40 * s }, { x: x - 14 * s, y: y - 92 * s }, { x: x - 22 * s, y: y - 95 * s },
];

/** Нарисовать одно дерево с покачиванием кроны. */
function drawSmallTree(ctx: CanvasRenderingContext2D, t: Tree, p: number, s: LandState) {
  if (p <= 0) return;
  const sway = Math.sin(s.f * 0.07 + t.ph) * 0.035 * s.alive + noise3(t.x * 0.01, s.f * 0.02, 1) * 0.02 * s.alive;
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.rotate(sway);
  ctx.translate(-t.x, -t.y);
  drawStroke(ctx, { id: `${t.id}-trunk`, pts: [{ x: t.x, y: t.y + 16 * t.s }, { x: t.x + 2, y: t.y - 40 * t.s }], width: 11 * t.s, color: PALETTE.brown, bristles: 5, dry: 0.2, opacity: 0.8 }, clamp01(p * 3));
  const green = ["#4E9C5E", "#5FA070", "#398C65"];
  const crown: WashSpec =
    t.kind === "fir"
      ? { id: `${t.id}-c`, shape: firShape(t.x, t.y - 10 * t.s, t.s), origin: { x: t.x, y: t.y }, colors: ["#3E8C6A", "#4F9A70"], layers: 8, opacity: 0.72, edge: 0.6, deform: 0.35 }
      : { id: `${t.id}-c`, shape: circle(t.x, t.y - 70 * t.s, 50 * t.s, 10, 1, 1.12), origin: { x: t.x, y: t.y - 40 * t.s }, colors: green, layers: 8, opacity: 0.8, edge: 0.6, deform: 0.8 };
  drawWash(ctx, crown, clamp01(p * 1.4 - 0.2), { time: s.f * 0.02 });
  if (s.awaken > 0) {
    // объём кроны: тень справа, светлая молодая листва слева
    const cy = t.kind === "fir" ? t.y - 60 * t.s : t.y - 70 * t.s;
    drawWash(ctx, { id: `${t.id}-sh`, shape: circle(t.x + 18 * t.s, cy + 14 * t.s, 34 * t.s, 8), colors: ["#2A5E6A"], layers: 5, opacity: 0.3, edge: 0, deform: 0.9 }, 1, { alpha: s.awaken });
    drawWash(ctx, { id: `${t.id}-hl`, shape: circle(t.x - 16 * t.s, cy - 18 * t.s, 22 * t.s, 8), colors: ["#E7D27A"], layers: 5, opacity: 0.5, edge: 0, deform: 0.9 }, 1, { alpha: s.awaken });
  }
  ctx.restore();
}

export function drawShoreAndForest(ctx: CanvasRenderingContext2D, s: LandState) {
  drawWash(
    ctx,
    {
      id: "shore",
      shape: [{ x: X0, y: 790 }, { x: 200, y: 778 }, { x: 900, y: 792 }, { x: X1, y: 784 }, { x: X1, y: 880 }, { x: 800, y: 868 }, { x: 100, y: 874 }, { x: X0, y: 866 }],
      origin: { x: 540, y: 860 },
      colors: ["#6FAE6A", "#8CB860", "#5FA070"],
      layers: 12,
      opacity: 0.75,
      edge: 0.5,
      deform: 0.35,
    },
    s.shore,
    { time: s.f * 0.02, wobble: 0.03 },
  );
  // светлая песчаная кромка
  drawStroke(ctx, { id: "sand", pts: [{ x: X0, y: 866 }, { x: 100, y: 872 }, { x: 800, y: 866 }, { x: X1, y: 878 }], width: 16, color: "#E9C98C", bristles: 9, dry: 0.4, opacity: 0.8 }, s.shore);
  for (const t of forest()) drawSmallTree(ctx, t, smooth((s.forest - t.t * 0.55) / 0.45), s);
}

// ——— Передний берег ———
export const BANK_TOP: Pt[] = [
  { x: -700, y: 1420 }, { x: -300, y: 1440 }, { x: 0, y: 1490 }, { x: 250, y: 1545 }, { x: 520, y: 1600 },
  { x: 760, y: 1680 }, { x: 980, y: 1800 }, { x: 1150, y: 1960 }, { x: 1250, y: 2250 },
];
export const bankY = (x: number) => {
  for (let i = 0; i < BANK_TOP.length - 1; i++) {
    const a = BANK_TOP[i], b = BANK_TOP[i + 1];
    if (x >= a.x && x <= b.x) return a.y + ((x - a.x) / (b.x - a.x)) * (b.y - a.y);
  }
  return 2250;
};
const BANK: WashSpec = {
  id: "bank",
  shape: [...BANK_TOP, { x: -700, y: 2400 }],
  origin: { x: 100, y: 2000 },
  colors: ["#6FAE6A", "#5FA070", "#8CB860", "#4E9C5E"],
  layers: 14,
  opacity: 0.8,
  edge: 0.6,
  deform: 0.12,
};
const BANK_SHADE: WashSpec = {
  id: "bank-shade",
  shape: [{ x: -700, y: 1760 }, { x: 300, y: 1830 }, { x: 900, y: 1980 }, { x: 1250, y: 2400 }, { x: -700, y: 2400 }],
  colors: ["#2F6E5E"],
  layers: 8,
  opacity: 0.4,
  edge: 0,
  deform: 0.4,
};
let GRASS: StrokeSpec[] | null = null;
const grass = () => {
  if (GRASS) return GRASS;
  const rng = mulberry32(55);
  GRASS = Array.from({ length: 70 }, (_, k) => {
    const x = -600 + rng() * 1750;
    const y = bankY(x) + 6 + rng() * 40;
    const h = 30 + rng() * 46;
    const lean = (rng() - 0.5) * 30;
    return { id: `grass-${k}`, pts: [{ x, y }, { x: x + lean * 0.4, y: y - h * 0.5 }, { x: x + lean, y: y - h }], width: 6 + rng() * 4, color: rng() < 0.5 ? "#2F7E62" : "#5FA070", color2: "#8CB860", bristles: 4, dry: 0.2, opacity: 0.75, taper: [0.05, 0.8] };
  });
  return GRASS;
};
const FLOWERS = Array.from({ length: 16 }, (_, k) => {
  const r = mulberry32(900 + k);
  const x = -500 + r() * 1500;
  return { x, y: bankY(x) + 20 + r() * 60, c: r() < 0.6 ? "#E5AC51" : "#FFFFFF", t: r() };
});

const BANK_RESERVE: WashSpec = { ...BANK, id: "bank-res", colors: ["#000"], layers: 4, opacity: 1, edge: 0, mode: "destination-out" };

export function drawBank(ctx: CanvasRenderingContext2D, s: LandState) {
  // берег лежит поверх моря: сначала «резерв» бумаги, затем зелень
  drawWash(ctx, BANK_RESERVE, s.bank, { time: s.f * 0.02, wobble: 0.03 });
  drawWash(ctx, BANK, s.bank, { time: s.f * 0.02, wobble: 0.03 });
  drawWash(ctx, BANK_SHADE, s.bank, { alpha: 0.4 + 0.6 * s.awaken });
  grass().forEach((g, i) => {
    const p = smooth((s.bank - 0.3 - (i % 10) * 0.04) / 0.4);
    if (p <= 0) return;
    const sw = Math.sin(s.f * 0.08 + i) * 3 * s.alive;
    drawStroke(ctx, g, p, { dx: sw });
  });
  FLOWERS.forEach((fl, i) => {
    const p = smooth((s.bank - 0.6 - fl.t * 0.3) / 0.15);
    if (p > 0) drawWash(ctx, { id: `flower-${i}`, shape: circle(fl.x, fl.y, 7, 6), colors: [fl.c], layers: 4, opacity: 0.9, edge: 0.3, deform: 0.6, mode: fl.c === "#FFFFFF" ? "source-over" : "multiply" }, p);
  });
}
