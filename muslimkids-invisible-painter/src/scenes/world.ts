// Единый холст сцен 3–7. Каждый кадр пейзаж собирается заново из состояний сцен
// (Scene03…Scene07), поэтому возвращение на холст в финале — это та же картина,
// по которой зритель «путешествовал».

import type { PaintCtx } from "../engines/InvisiblePainterEngine";
import { withDepth } from "../engines/PainterlyDepthEngine";
import type { CamKey } from "../engines/PainterlyCameraController";
import { deformPoly, drawWash, type Pt } from "../engines/WatercolorSimulationEngine";
import { clamp01, lerp, noise3, smooth, span } from "../utils/noise";
import { drawEarth } from "../painted/LivingEarth";
import { drawBank, drawMountains, drawShoreAndForest, type LandState } from "../painted/PaintedLand";
import { drawOcean, oceanSparkles } from "../painted/PaintedOcean";
import { drawDaySky, drawNight, drawStars, WORLD } from "../painted/PaintedSky";
import { drawHeroDrop, drawImpact, drawRain, drawVaporAndClouds } from "../painted/PaintedClouds";
import { drawTree } from "../painted/PaintedTree";
import { drawBoy } from "../painted/PaintedBoy";
import { s3, S3 } from "./Scene03Ocean";
import { s4, S4 } from "./Scene04Tree";
import { s5 } from "./Scene05Sky";
import { s6 } from "./Scene06Quran";
import { s7 } from "./Scene07Ending";

export const WORLD_START = 466;

/** Границы законченной картины на листе (видны при отдалении камеры). */
export const PAINTING = { left: -420, right: 1500, top: -1550, bottom: 2200 };
export const SMALL_EARTH = { x: 1040, y: -1114, r: 120 };
export const RESERVE = { x: 540, y: -310, rx: 1060, ry: 640 };

export const CAM_B: CamKey[] = [
  { f: WORLD_START, x: 540, y: 1100, zoom: 1.25 },
  { f: 530, x: 600, y: 1130, zoom: 1.32 },
  { f: 585, x: 580, y: 1100, zoom: 1.18 },
  { f: 640, x: 540, y: 1050, zoom: 1.0 },
  { f: 700, x: 540, y: 1040, zoom: 1.0 },
  { f: 752, x: 540, y: -260, zoom: 0.95 },
  { f: 772, x: 420, y: -120, zoom: 1.05 },
  { f: 792, x: 315, y: 300, zoom: 1.5 },
  { f: 806, x: 305, y: 1530, zoom: 2.1 },
  { f: 848, x: 300, y: 1545, zoom: 2.25 },
  { f: 900, x: 310, y: 1470, zoom: 1.7 },
  { f: 960, x: 380, y: 1120, zoom: 1.0 },
  { f: 992, x: 420, y: 980, zoom: 0.92 },
  { f: 1035, x: 470, y: 250, zoom: 0.95 },
  { f: 1075, x: 500, y: -350, zoom: 1.0 },
  { f: 1110, x: 520, y: -250, zoom: 0.9 },
  { f: 1200, x: 540, y: 150, zoom: 0.63 },
  { f: 1318, x: 540, y: 170, zoom: 0.62 },
  { f: 1398, x: 540, y: 624, zoom: 0.42, hold: true },
  { f: 1624, x: 540, y: 624, zoom: 0.42, hold: true },
  { f: 1668, x: 620, y: 1420, zoom: 1.3 },
  { f: 1706, x: 625, y: 1410, zoom: 1.35 },
  { f: 1762, x: 540, y: 876, zoom: 0.37 },
  { f: 1800, x: 540, y: 876, zoom: 0.37 },
];

let FRAME_LAYERS: Pt[][] | null = null;
const frameLayers = () => {
  if (FRAME_LAYERS) return FRAME_LAYERS;
  const { left: l, right: r, top: t, bottom: b } = PAINTING;
  const rect: Pt[] = [];
  const side = (x0: number, y0: number, x1: number, y1: number) => {
    for (let i = 0; i < 12; i++) rect.push({ x: x0 + ((x1 - x0) * i) / 12, y: y0 + ((y1 - y0) * i) / 12 });
  };
  side(l, t, r, t);
  side(r, t, r, b);
  side(r, b, l, b);
  side(l, b, l, t);
  FRAME_LAYERS = Array.from({ length: 4 }, (_, k) => deformPoly(rect, 3, 0.22 + k * 0.04, 300 + k * 11));
  return FRAME_LAYERS;
};

/** Края картины растворяются в бумаге неровной акварельной кромкой. */
function paintingEdge(ctx: CanvasRenderingContext2D) {
  frameLayers().forEach((poly, k) => {
    const path = new Path2D();
    path.rect(PAINTING.left - 4000, PAINTING.top - 4000, 9000, 12000);
    // внутренний контур — против часовой (evenodd вырежет дыру)
    path.moveTo(poly[0].x, poly[0].y);
    for (let i = poly.length - 1; i >= 0; i--) {
      const q = poly[i];
      const s = 1 - k * 0.006; // каждый слой чуть «внутрь» — мягкий градиент кромки
      path.lineTo(540 + (q.x - 540) * s, 400 + (q.y - 400) * s);
    }
    path.closePath();
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = k === 0 ? 1 : 0.4;
    ctx.fill(path, "evenodd");
    ctx.restore();
  });
}

export function drawWorld(pc: PaintCtx, f: number) {
  const p = pc.p;
  const a = s3(f), b = s4(f), c = s5(f), d = s6(f), e = s7(f);
  const life = d.life;
  const night = c.night;

  // 1. небо и память о Солнце
  drawDaySky(p, 1, pc.lights, (1 - night) * (0.4 + 0.6 * life));
  // 2. горы, берег, лес
  const land: LandState = {
    mountains: a.mountains,
    shore: a.shore,
    forest: a.forest,
    bank: a.bank,
    awaken: a.landAwaken * life,
    alive: a.landAwaken * life,
    f,
    snow: a.landAwaken,
  };
  // параллакс дальних слоёв во время полёта над морем (к общему плану — сводится к 1)
  const depthK = 1 - span(f, 640, 700);
  withDepth(pc, 1 + 0.16 * depthK, () => drawMountains(p, land));
  withDepth(pc, 1 + 0.06 * depthK, () => drawShoreAndForest(p, land));
  // 3. океан
  const ocean = { horizon: a.horizon, paint: a.seaPaint, awaken: a.seaAwaken * life, alive: a.seaAlive * life, f, night };
  drawOcean(p, ocean);
  // 3a. остаток синей заливки из сцены 2 отступает к горизонту
  if (f < S3.skyReveal[1] + 20) {
    const edge = lerp(150, a.horizon + 30, a.skyReveal);
    const pts: Pt[] = [];
    for (let x = WORLD.left; x <= WORLD.right; x += 40) pts.push({ x, y: edge + noise3(x * 0.006, f * 0.03, 9) * 46 });
    const path = new Path2D();
    pts.forEach((q, i) => (i ? path.lineTo(q.x, q.y) : path.moveTo(q.x, q.y)));
    path.lineTo(WORLD.right, 2300);
    path.lineTo(WORLD.left, 2300);
    path.closePath();
    p.save();
    p.globalCompositeOperation = "multiply";
    const g = p.createLinearGradient(0, edge, 0, edge + 900);
    g.addColorStop(0, "#2F78A8");
    g.addColorStop(1, "#1F5F8F");
    p.globalAlpha = 0.9 * (1 - span(f, WORLD_START, S3.skyReveal[1] + 18));
    p.fillStyle = g;
    p.fill(path);
    p.globalAlpha *= 0.6;
    p.strokeStyle = "#174A75";
    p.lineWidth = 8;
    p.beginPath();
    pts.forEach((q, i) => (i ? p.lineTo(q.x, q.y) : p.moveTo(q.x, q.y)));
    p.stroke();
    p.restore();
  }
  oceanSparkles(p, ocean, 260, "#FFF6DC", 0.5 * a.seaAwaken * (1 - night) * life);
  // 4. передний берег
  drawBank(p, land);
  // 5. пар, облака, дождь
  const sw = { vapor: b.vapor, clouds: b.clouds, awaken: b.cloudAwaken * life, alive: b.cloudAwaken * life, rain: b.rain, f, alpha: 1 - smooth(night * 1.1) * 0.75 };
  drawVaporAndClouds(p, sw);
  drawRain(p, sw, 1600);
  drawHeroDrop(p, b.drop, 15, f);
  drawImpact(p, f, S4.impact);
  // 6. дерево
  drawTree(p, { grow: b.grow, sprout: b.sprout, awaken: b.treeAwaken * life, alive: b.treeAwaken * life, f });
  if (b.treeAwaken > 0 && night < 1) pc.lights.push(p, { kind: "glow", x: 200, y: 560, r: 420, color: "#FFE9B8", alpha: 0.28 * b.treeAwaken * (1 - night) * life });
  // 7. смена дня и ночи
  drawNight(p, night, f);
  drawStars(p, c.stars, c.glow * (0.35 + 0.65 * life), pc.lights, f);
  oceanSparkles(p, ocean, 560, "#FFF1C9", 0.45 * c.glow * (0.4 + 0.6 * life));
  // 8. Земля на ночном небе — часть большой картины (резерв бумаги + роспись)
  if (c.earth > 0) {
    const E = SMALL_EARTH;
    drawWash(p, { id: "earth5-reserve", shape: Array.from({ length: 14 }, (_, i) => ({ x: E.x + Math.cos((i / 14) * 6.283) * E.r * 1.02, y: E.y + Math.sin((i / 14) * 6.283) * E.r * 1.02 })), colors: ["#000"], layers: 6, opacity: 1, edge: 0, deform: 0.15, mode: "destination-out" }, c.earth);
    const spin = lerp(20, 80, clamp01((Math.min(f, 1340) - 1150) / 300));
    drawEarth(p, { key: "e5", x: E.x, y: E.y, r: E.r, lon: spin, ocean: c.earth, land: smooth(c.earth * 1.4 - 0.3), clouds: smooth(c.earth * 1.6 - 0.6), awaken: smooth(c.earth * 1.5 - 0.5) * life, light: { x: -1, y: -0.35 } }, pc.lights, f);
  }
  // 9. мальчик (сцена 7)
  drawBoy(p, { paint: e.boy, awaken: e.boyAwaken, lift: e.lift, f });
  // 10. резерв бумаги под текст перевода смысла
  const res = d.reserve * (1 - e.refill);
  if (res > 0.001) {
    drawWash(
      p,
      { id: "quote-reserve", shape: Array.from({ length: 18 }, (_, i) => ({ x: RESERVE.x + Math.cos((i / 18) * 6.283) * RESERVE.rx, y: RESERVE.y + Math.sin((i / 18) * 6.283) * RESERVE.ry })), colors: ["#000"], layers: 12, opacity: 0.93, edge: 0, deform: 0.5, spreadJitter: 0.7, mode: "destination-out" },
      d.reserve,
      { alpha: 1 - e.refill, time: f * 0.02, wobble: 0.04 },
    );
    // тёплая золотистая лессировка внутри резерва — спокойный фон
    drawWash(p, { id: "quote-glaze", shape: Array.from({ length: 16 }, (_, i) => ({ x: RESERVE.x + Math.cos((i / 16) * 6.283) * RESERVE.rx * 0.96, y: RESERVE.y + Math.sin((i / 16) * 6.283) * RESERVE.ry * 0.94 })), colors: ["#FBEFD2", "#F9E9C6"], layers: 10, opacity: 0.22, edge: 0, deform: 0.5 }, d.reserve, { alpha: 1 - e.refill });
  }
  // 11. края картины на листе
  paintingEdge(p);
}
