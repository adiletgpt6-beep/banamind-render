// Небо холста: дневные лессировки, тёплый след Солнца, ночная заливка с мокрым
// краем и звёзды, которые сначала появляются пятнышками светлой краски,
// а затем начинают мягко светиться.

import { circle, drawWash, type Pt } from "../engines/WatercolorSimulationEngine";
import type { LightQueue } from "../engines/PainterlyLightingSystem";
import { mulberry32, noise3, smooth } from "../utils/noise";
import { ridgeTop } from "./PaintedLand";
import { TREE_CROWN } from "./PaintedTree";

export const WORLD = { left: -700, right: 1800, top: -1800, horizon: 760, bottom: 2400 };

// мягкие облачные разводы в дневной лессировке (светлее/темнее)
const SKY_BLOOMS = [
  { x: -200, y: -1300, r: 520, c: "#6BB7DE" }, { x: 900, y: -1100, r: 600, c: "#79C5E8" },
  { x: 300, y: -700, r: 460, c: "#8FCDEB" }, { x: 1300, y: -200, r: 520, c: "#8FCDEB" },
  { x: -400, y: 100, r: 480, c: "#A9D9F0" }, { x: 700, y: 250, r: 420, c: "#B5DEF1" },
];

export function drawDaySky(ctx: CanvasRenderingContext2D, reveal: number, lights: LightQueue, sunGlow: number) {
  if (reveal <= 0) return;
  const g = ctx.createLinearGradient(0, WORLD.top, 0, WORLD.horizon + 60);
  g.addColorStop(0, "#5FB2DD");
  g.addColorStop(0.45, "#86C9EA");
  g.addColorStop(0.85, "#C4E5F4");
  g.addColorStop(1, "#E3F1F6");
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.9 * reveal;
  ctx.fillStyle = g;
  ctx.fillRect(WORLD.left, WORLD.top - 400, WORLD.right - WORLD.left, WORLD.horizon + 460 - WORLD.top);
  ctx.restore();
  SKY_BLOOMS.forEach((b, i) =>
    drawWash(ctx, { id: `sky-bloom-${i}`, shape: circle(b.x, b.y, b.r, 12, 1.4, 0.8), colors: [b.c], layers: 8, opacity: 0.22, edge: 0.25, deform: 0.7 }, reveal),
  );
  if (sunGlow > 0) {
    // Память цвета: Солнце из сцены 1 оставляет тёплый свет
    const S = { x: 170, y: 40, r: 72 };
    drawWash(ctx, { id: "sky-sun-res", shape: circle(S.x, S.y, S.r * 1.05, 14), colors: ["#000"], layers: 6, opacity: 1, edge: 0, deform: 0.3, mode: "destination-out" }, sunGlow);
    drawWash(ctx, { id: "sky-sun", shape: circle(S.x, S.y, S.r * 1.12, 14), colors: ["#E5AC51", "#F2C566", "#F6D27A"], layers: 14, opacity: 0.8, edge: 0.9, deform: 0.3 }, 1, { alpha: sunGlow });
    lights.push(ctx, { kind: "glow", x: S.x, y: S.y, r: 640, color: "#FFE3A3", alpha: 0.5 * sunGlow });
    lights.push(ctx, { kind: "glow", x: S.x, y: S.y, r: 170, color: "#FFF4D6", alpha: 0.45 * sunGlow });
  }
}

/** Ночная лессировка опускается сверху вниз с мокрым неровным краем. */
export function drawNight(ctx: CanvasRenderingContext2D, night: number, f: number) {
  if (night <= 0.001) return;
  const front = WORLD.top - 300 + (WORLD.bottom + 500 - WORLD.top) * smooth(night);
  const pts: Pt[] = [];
  for (let x = WORLD.left; x <= WORLD.right; x += 40) {
    pts.push({ x, y: front + noise3(x * 0.004, f * 0.01, 3) * 110 + noise3(x * 0.02, 1, f * 0.02) * 24 });
  }
  const path = new Path2D();
  path.moveTo(WORLD.left, WORLD.top - 400);
  path.lineTo(WORLD.right, WORLD.top - 400);
  for (let i = pts.length - 1; i >= 0; i--) path.lineTo(pts[i].x, pts[i].y);
  path.closePath();
  const g = ctx.createLinearGradient(0, WORLD.top, 0, WORLD.bottom);
  g.addColorStop(0, "#202D5A");
  g.addColorStop(0.3, "#2A3F72");
  g.addColorStop(0.62, "#46689C");
  g.addColorStop(0.72, "#5A73A6");
  g.addColorStop(1, "#5F6F9E");
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = g;
  ctx.fill(path);
  // мокрый край фронта
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#25386A";
  ctx.lineWidth = 7;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.restore();
}

type Star = { x: number; y: number; r: number; t: number; big: boolean };
let STARS: Star[] | null = null;
const stars = () => {
  if (STARS) return STARS;
  const rng = mulberry32(4242);
  const out: Star[] = [];
  while (out.length < 170) {
    const x = WORLD.left + 150 + rng() * (WORLD.right - WORLD.left - 300);
    const y = WORLD.top + 120 + rng() * (WORLD.horizon - WORLD.top - 120);
    if (y > ridgeTop(x) - 40) continue;
    const dx = (x - TREE_CROWN.x) / TREE_CROWN.rx, dy = (y - TREE_CROWN.y) / TREE_CROWN.ry;
    if (dx * dx + dy * dy < 1.15) continue;
    const big = rng() < 0.12;
    out.push({ x, y, r: big ? 7 + rng() * 5 : 2.5 + rng() * 3.5, t: rng(), big });
  }
  STARS = out;
  return out;
};

/** stars: 0..1 — пятна краски, glow: 0..1 — свечение. */
export function drawStars(ctx: CanvasRenderingContext2D, appear: number, glow: number, lights: LightQueue, f: number, hide?: (x: number, y: number) => boolean) {
  if (appear <= 0.001) return;
  stars().forEach((s, i) => {
    if (hide?.(s.x, s.y)) return;
    const a = smooth((appear - s.t * 0.6) / 0.4);
    if (a <= 0) return;
    drawWash(
      ctx,
      { id: `star-${i}`, shape: circle(s.x, s.y, s.r, 7), colors: ["#FFF6DC", "#FFFFFF"], layers: 4, opacity: 0.95, edge: 0, deform: 0.5, mode: "source-over" },
      a,
    );
    if (s.big) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.7 * a;
      ctx.strokeStyle = "#FFF6DC";
      ctx.lineCap = "round";
      ctx.lineWidth = 2.2;
      const L = s.r * 2.6;
      ctx.beginPath();
      ctx.moveTo(s.x - L, s.y); ctx.lineTo(s.x + L, s.y);
      ctx.moveTo(s.x, s.y - L); ctx.lineTo(s.x, s.y + L);
      ctx.stroke();
      ctx.restore();
    }
    const tw = 0.75 + 0.25 * noise3(i * 1.7, f * 0.045, 0.5);
    if (glow > 0) lights.push(ctx, { kind: "glow", x: s.x, y: s.y, r: s.r * (s.big ? 6 : 4), color: "#FFF1C9", alpha: glow * a * tw * (s.big ? 0.7 : 0.45) });
  });
}
