// Океан → облака → дождь. Синие клубы пара поднимаются от моря (Память цвета:
// облака сделаны из той же синей краски), белеют, собираются в облака,
// облака обретают объём; затем идёт дождь, одна капля падает на землю и
// растекается акварельным разводом, в котором проступает семечко.

import { circle, drawWash, waterBloom, type WashSpec } from "../engines/WatercolorSimulationEngine";
import { mix } from "../engines/PainterlyLightingSystem";
import { morphPoly, smoothPath } from "../engines/PaintMorphEngine";
import { paintVolume } from "../engines/PaintToLifeEngine";
import { clamp01, easeIn, lerp, mulberry32, noise3, smooth, smoother } from "../utils/noise";

type Cloud = { id: string; x: number; y: number; w: number };
export const CLOUDS: Cloud[] = [
  { id: "cl-hero", x: 330, y: -380, w: 1.15 },
  { id: "cl-b", x: 880, y: -560, w: 0.95 },
  { id: "cl-c", x: -180, y: -640, w: 0.85 },
  { id: "cl-d", x: 1260, y: -300, w: 0.8 },
  { id: "cl-e", x: 620, y: -900, w: 0.7 },
];
const LOBES = [
  [-150, 10, 70], [-75, -20, 92], [10, -45, 110], [100, -18, 90], [175, 12, 66],
  [-40, 30, 80], [70, 32, 78], [-110, 40, 60], [140, 42, 58],
] as const;

const lobesOf = (c: Cloud) => LOBES.map(([dx, dy, r]) => ({ x: c.x + dx * c.w, y: c.y + dy * c.w, r: r * c.w }));

export type SkyWaterState = {
  /** подъём пара 0..1 */
  vapor: number;
  /** формирование облаков 0..1 */
  clouds: number;
  awaken: number;
  alive: number;
  rain: number;
  f: number;
  alpha: number;
};

let PUFFS: { sx: number; sy: number; tx: number; ty: number; r: number; t: number; ph: number }[] | null = null;
const puffs = () => {
  if (PUFFS) return PUFFS;
  const rng = mulberry32(606);
  PUFFS = [];
  CLOUDS.forEach((c) =>
    lobesOf(c).forEach((l) => {
      PUFFS!.push({ sx: l.x + (rng() - 0.5) * 300, sy: 980 + rng() * 300, tx: l.x, ty: l.y, r: l.r, t: rng() * 0.35, ph: rng() * 6 });
    }),
  );
  return PUFFS;
};

export function drawVaporAndClouds(ctx: CanvasRenderingContext2D, s: SkyWaterState) {
  if (s.alpha <= 0) return;
  // пар: синие клубы краски поднимаются и белеют
  if (s.vapor > 0 && s.clouds < 1) {
    puffs().forEach((p, i) => {
      const u = smoother((s.vapor - p.t) / 0.65);
      if (u <= 0) return;
      const x = lerp(p.sx, p.tx, u) + Math.sin(u * 5 + p.ph) * 40 * (1 - u);
      const y = lerp(p.sy, p.ty, u);
      const r = lerp(14, p.r * 0.75, u);
      const color = mix("#8FCDEB", "#FFFFFF", smooth(u * 1.4));
      // клуб пара — мягкое пятно гуаши, растёт и белеет по пути вверх
      drawWash(
        ctx,
        { id: `puff-${i}`, shape: circle(p.tx, p.ty, p.r * 0.75, 9, 1.25, 0.85), colors: ["#FFFFFF"], layers: 5, opacity: 0.55, edge: 0, deform: 0.9, mode: "source-over" },
        1,
        { dx: x - p.tx, dy: y - p.ty, scaleX: r / (p.r * 0.75), scaleY: r / (p.r * 0.75), colorOverride: color, alpha: (0.35 + 0.65 * u) * (1 - s.clouds) * s.alpha },
      );
    });
  }
  if (s.clouds <= 0) return;
  for (const c of CLOUDS) {
    const L = lobesOf(c);
    const breathe = 1 + 0.025 * Math.sin(s.f * 0.04 + c.x) * s.alive;
    const dx = Math.sin(s.f * 0.012 + c.y) * 14 * s.alive;
    // голубоватый край-подмалёвок (память синей краски)
    L.forEach((l, i) =>
      drawWash(ctx, { id: `${c.id}-b${i}`, shape: circle(l.x, l.y, l.r * 1.08, 10), colors: ["#BFE0F2"], layers: 5, opacity: 0.5, edge: 0.4, deform: 0.7 }, smooth(s.clouds * 1.3 - i * 0.03), { dx, scaleX: breathe, scaleY: breathe, alpha: s.alpha }),
    );
    // белая гуашь лепестков
    L.forEach((l, i) =>
      drawWash(ctx, { id: `${c.id}-w${i}`, shape: circle(l.x, l.y, l.r, 10), colors: ["#FFFFFF", "#FDFBF5"], layers: 7, opacity: 0.95, edge: 0, deform: 0.6, mode: "source-over" }, smooth(s.clouds * 1.3 - 0.1 - i * 0.03), { dx, scaleX: breathe, scaleY: breathe, alpha: s.alpha }),
    );
    if (s.awaken > 0) {
      // объём: серо-голубая тень снизу, яркий блик сверху-слева
      const sh: WashSpec = { id: `${c.id}-sh`, shape: circle(c.x + 20 * c.w, c.y + 40 * c.w, 175 * c.w, 12, 1.1, 0.42), colors: ["#9DB5D2", "#A9BEDA"], layers: 7, opacity: 0.6, edge: 0.2, deform: 0.5 };
      drawWash(ctx, sh, 1, { dx, alpha: s.awaken * s.alpha });
      const hl: WashSpec = { id: `${c.id}-hl`, shape: circle(c.x - 30 * c.w, c.y - 50 * c.w, 70 * c.w, 10), colors: ["#FFFFFF"], layers: 5, opacity: 0.9, edge: 0, deform: 0.6, mode: "source-over" };
      drawWash(ctx, hl, 1, { dx, alpha: s.awaken * s.alpha * 0.8 });
    }
  }
}

/** Дождь: короткие голубые штрихи из-под облаков. */
export function drawRain(ctx: CanvasRenderingContext2D, s: SkyWaterState, groundY: number) {
  if (s.rain <= 0.001) return;
  const rng = mulberry32(73);
  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < 150; i++) {
    const c = CLOUDS[i % 4];
    const x0 = c.x + (rng() - 0.5) * 360 * c.w;
    const top = c.y + 40 * c.w;
    const range = groundY - top;
    const v = 46 + rng() * 14;
    const ph = rng();
    const start = rng() * 0.4;
    if (s.rain < start) continue;
    const y = top + ((s.f * v + ph * range) % range);
    const L = 26 + rng() * 22;
    const fadeTop = clamp01((y - top) / 120);
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.55 * fadeTop * smooth((s.rain - start) / 0.2) * s.alpha;
    ctx.strokeStyle = i % 3 ? "#5EA8D6" : "#79C5E8";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(x0 - 2, y - L);
    ctx.lineTo(x0, y);
    ctx.stroke();
  }
  ctx.restore();
}

export const DROP = { x0: 330, y0: -300, x1: 300, y1: 1588 };

/** Главная капля: падает с ускорением. u — 0..1 путь. */
export function dropPos(u: number) {
  const e = easeIn(u);
  return { x: lerp(DROP.x0, DROP.x1, e) + Math.sin(u * 3) * 6, y: lerp(DROP.y0, DROP.y1, e) };
}

export function drawHeroDrop(ctx: CanvasRenderingContext2D, u: number, size: number, f: number) {
  if (u <= 0 || u >= 1) return;
  const { x, y } = dropPos(u);
  const r = size;
  const stretch = 1 + easeIn(u) * 0.5;
  const path = new Path2D();
  path.moveTo(x, y - r * 2.6 * stretch);
  path.bezierCurveTo(x + r * 0.5, y - r * 1.4 * stretch, x + r * 1.05, y - r * 0.3, x + r, y + r * 0.15);
  path.arc(x, y + r * 0.15, r, 0, Math.PI);
  path.bezierCurveTo(x - r * 1.05, y - r * 0.3, x - r * 0.5, y - r * 1.4 * stretch, x, y - r * 2.6 * stretch);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  const g = ctx.createLinearGradient(x - r, y - r * 2, x + r, y + r);
  g.addColorStop(0, "#9ED3EE");
  g.addColorStop(1, "#2F78A8");
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = "#174A75";
  ctx.lineWidth = r * 0.12;
  ctx.stroke(path);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.38, y - r * 0.25, r * 0.22, r * 0.38, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  void f;
}

/** Удар капли о землю: брызги, синий развод, смешение с зелёным, семечко. */
export function drawImpact(ctx: CanvasRenderingContext2D, f: number, t0: number) {
  const x = DROP.x1, y = DROP.y1;
  const k = f - t0;
  if (k < 0) return;
  // брызги
  if (k < 16) {
    const rng = mulberry32(5);
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "#5EA8D6";
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (i / 8) * Math.PI;
      const v = 4 + rng() * 3;
      const px = x + Math.cos(a) * v * k * 1.6;
      const py = y + Math.sin(a) * v * k * 0.9 + 0.12 * k * k;
      ctx.globalAlpha = 0.8 * (1 - k / 16);
      ctx.beginPath();
      ctx.arc(px, py, 3.2 - k * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  // Paint Morph: капля → цветной развод (форма капли перетекает в плоское пятно)
  if (k < 14) {
    const r = 15;
    const drop = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const tip = Math.max(0, -Math.sin(a));
      return { x: x + Math.cos(a) * r * (1 - tip * 0.75), y: y - r + Math.sin(a) * r - tip * tip * r * 1.6 };
    });
    const splash = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return { x: x + Math.cos(a) * 52 * (1 + 0.18 * Math.sin(a * 5)), y: y + 4 + Math.sin(a) * 20 };
    });
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.85 * (1 - smooth((k - 6) / 8));
    ctx.fillStyle = "#3E8CC0";
    ctx.fill(smoothPath(morphPoly(drop, splash, k / 12, 48, 6, 3)));
    ctx.restore();
  }
  // синий развод на влажной земле (перспектива — приплюснутый)
  const bloom: WashSpec = { id: "impact-blue", shape: circle(x, y + 6, 78, 14, 1, 0.42), origin: { x, y: y + 4 }, colors: ["#3E8CC0", "#5EA8D6", "#2F78A8"], layers: 12, opacity: 0.8, edge: 1, deform: 0.55, spreadJitter: 0.8 };
  drawWash(ctx, bloom, smooth(k / 22), { time: f * 0.04, wobble: 0.08 });
  if (k > 8) waterBloom(ctx, "impact", x - 6, y + 6, 30, smooth((k - 8) / 18), 0.55);
  // Color Mixing: зелёный пигмент земли вливается в синий развод
  const gold: WashSpec = { id: "impact-green", shape: circle(x + 10, y + 6, 70, 12, 1, 0.45), origin: { x: x + 30, y: y + 4 }, colors: ["#5FA070", "#8CB860"], layers: 10, opacity: 0.55, edge: 0.5, deform: 0.7 };
  drawWash(ctx, gold, smooth((k - 14) / 24), { time: f * 0.03, wobble: 0.06 });
  // семечко
  const seed: WashSpec = { id: "seed", shape: circle(x, y - 2, 15, 10, 1.25, 0.72), colors: ["#916849", "#7A5538", "#A47B52"], layers: 10, opacity: 0.95, edge: 1, deform: 0.2 };
  drawWash(ctx, seed, smooth((k - 26) / 18), { rotate: -0.35 });
  // семечко обретает объём (AWAKENING)
  const sp = new Path2D();
  sp.ellipse(x, y - 2, 18, 10, -0.35, 0, Math.PI * 2);
  paintVolume(ctx, sp, { x, y: y - 2, r: 18 }, { x: -1, y: -1 }, smooth((k - 34) / 14), "#4A3428");
  if (k > 36) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.65 * smooth((k - 36) / 10);
    ctx.strokeStyle = "#FFF3D6";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.ellipse(x - 4, y - 6, 8, 3, -0.35, Math.PI * 1.1, Math.PI * 1.7);
    ctx.stroke();
    ctx.restore();
  }
  void noise3;
}
