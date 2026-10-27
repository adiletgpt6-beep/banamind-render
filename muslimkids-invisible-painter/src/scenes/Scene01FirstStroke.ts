// СЦЕНА 1 — ПЕРВЫЙ МАЗОК (00:00–00:06)
// Чистая бумага → золотое пятно растекается → два мазка вливаются →
// краска закручивается спиралью → нарисованное Солнце с тёплым светом.
// Солнце остаётся на холсте и в сцене 2 (приём «Память цвета»).

import { drawStroke, type StrokeSpec } from "../engines/BrushStrokeEngine";
import { circle, drawWash, type WashSpec } from "../engines/WatercolorSimulationEngine";
import type { PaintCtx } from "../engines/InvisiblePainterEngine";
import { PALETTE } from "../engines/PainterlyLightingSystem";
import { paintVolume } from "../engines/PaintToLifeEngine";
import { lin, span } from "../utils/noise";

export const SUN = { x: 540, y: 820, r: 150 };
const { x: X, y: Y, r: R } = SUN;

const spot: WashSpec = {
  id: "sun-spot",
  shape: circle(X + 6, Y - 4, 64, 16, 1.1, 0.95),
  origin: { x: X, y: Y },
  colors: ["#E5AC51", "#F2C566", "#EBA448"],
  layers: 18,
  opacity: 0.85,
  edge: 0.8,
  deform: 0.75,
  spreadJitter: 0.8,
};
const disk: WashSpec = {
  id: "sun-disk",
  shape: circle(X, Y, R, 14),
  origin: { x: X, y: Y },
  colors: ["#E5AC51", "#F4C76A", "#E8A045", "#F0B95B"],
  layers: 22,
  opacity: 0.85,
  edge: 1,
  deform: 0.55,
  spreadJitter: 0.7,
};
const halo: WashSpec = {
  id: "sun-halo",
  shape: circle(X, Y, R * 1.75, 14),
  origin: { x: X, y: Y },
  colors: ["#F6D58E", "#F8DD9C"],
  layers: 14,
  opacity: 0.3,
  edge: 0.05,
  deform: 0.45,
};

function arc(r0: number, r1: number, a0: number, a1: number, n = 9) {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const a = a0 + (a1 - a0) * t;
    const r = r0 + (r1 - r0) * t;
    return { x: X + Math.cos(a) * r, y: Y + Math.sin(a) * r };
  });
}

// два мазка подтекают к пятну по дуге и сливаются с ним
const feeders: StrokeSpec[] = [
  { id: "sun-feed-1", pts: arc(R * 1.05, 30, -2.2, -0.9, 8), width: 36, color: "#EBA448", color2: "#F4C76A", dry: 0.25, opacity: 0.8, taper: [0.25, 0.2] },
  { id: "sun-feed-2", pts: arc(R * 1.0, 30, 0.95, 2.25, 8), width: 32, color: "#E5AC51", color2: "#F2C566", dry: 0.3, opacity: 0.75, taper: [0.25, 0.2] },
];

// Спираль: краска закручивается и собирается в диск
const swirl: StrokeSpec[] = [
  { id: "sun-sw-1", pts: arc(40, R * 0.95, 0.4, 0.4 + Math.PI * 2.1, 14), width: 44, color: "#F0BE63", color2: "#F7D58A", dry: 0.2, opacity: 0.5, taper: [0.1, 0.2] },
  { id: "sun-sw-2", pts: arc(R * 0.55, R * 0.92, 3.6, 3.6 + Math.PI * 1.6, 12), width: 38, color: "#EDAF55", color2: "#F6CC78", dry: 0.3, opacity: 0.42, taper: [0.15, 0.25] },
  { id: "sun-sw-3", pts: arc(R * 0.82, R * 0.98, 1.9, 1.9 + Math.PI * 1.3, 10), width: 26, color: "#E6A04A", dry: 0.45, opacity: 0.4, taper: [0.2, 0.3] },
];

// Деликатные лучи — короткие сухие мазки
const rays: StrokeSpec[] = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 + 0.13;
  const r0 = R * 1.28, r1 = R * (i % 2 ? 1.62 : 1.85);
  return {
    id: `sun-ray-${i}`,
    pts: [
      { x: X + Math.cos(a) * r0, y: Y + Math.sin(a) * r0 },
      { x: X + Math.cos(a + 0.04) * (r0 + r1) / 2, y: Y + Math.sin(a + 0.04) * (r0 + r1) / 2 },
      { x: X + Math.cos(a + 0.06) * r1, y: Y + Math.sin(a + 0.06) * r1 },
    ],
    width: i % 2 ? 9 : 13,
    color: "#EBA448",
    color2: "#F6CF7A",
    bristles: 7,
    dry: 0.45,
    opacity: 0.6,
    taper: [0.3, 0.6],
  };
});

/** Нарисовать Солнце; fade — общая прозрачность (для сцены 2). */
export function drawSun(pc: PaintCtx, f: number, fade = 1) {
  const p = pc.p;
  // свет на бумаге появляется раньше, чем станет виден в кадре
  drawWash(p, spot, span(f, 14, 74), { time: f * 0.03, wobble: 0.07, alpha: fade });
  // мазки «впитываются» в диск, когда краска сливается
  const absorb = 1 - 0.75 * span(f, 120, 170);
  drawStroke(p, feeders[0], span(f, 50, 82), { alpha: fade * absorb });
  drawStroke(p, feeders[1], span(f, 66, 98), { alpha: fade * absorb });
  drawWash(p, disk, span(f, 92, 150), { time: f * 0.02, wobble: 0.05, alpha: fade });
  swirl.forEach((s, i) => drawStroke(p, s, span(f, 94 + i * 10, 140 + i * 6), { alpha: fade }));
  // Water Bloom: светлая середина — ощущение сияния изнутри
  const lift = span(f, 118, 165) * fade;
  if (lift > 0) {
    // пигмент «снят» влажной кистью из центра — Солнце светится изнутри
    const g = p.createRadialGradient(X - 12, Y - 14, 0, X - 12, Y - 14, R * 0.75);
    g.addColorStop(0, "rgba(0,0,0,0.75)");
    g.addColorStop(0.45, "rgba(0,0,0,0.4)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    p.save();
    p.globalCompositeOperation = "destination-out";
    p.globalAlpha = lift;
    p.fillStyle = g;
    p.fillRect(X - R, Y - R, R * 2, R * 2);
    p.globalCompositeOperation = "multiply";
    p.globalAlpha = lift * 0.55;
    const y = p.createRadialGradient(X, Y, 0, X, Y, R);
    y.addColorStop(0, "#FCE7A6");
    y.addColorStop(1, "rgba(252,231,166,0)");
    p.fillStyle = y;
    p.fillRect(X - R, Y - R, R * 2, R * 2);
    p.restore();
  }
  // AWAKENING: нарисованный диск обретает объём — тёплая тень снизу-справа, свет сверху-слева
  const disc = new Path2D();
  disc.arc(X, Y, R * 0.98, 0, Math.PI * 2);
  paintVolume(p, disc, { x: X, y: Y, r: R }, { x: -0.7, y: -0.7 }, span(f, 150, 178) * fade * 0.7, "#D9822E", "rgba(255,247,215,1)");
  drawWash(p, halo, span(f, 140, 185), { time: f * 0.02, alpha: fade });
  rays.forEach((r, i) => drawStroke(p, r, span(f, 150 + (i % 6) * 3, 176 + (i % 6) * 3), { alpha: fade * 0.9 }));
  // тёплый свет
  const g = lin(f, 135, 185) * fade;
  if (g > 0) {
    pc.lights.push(p, { kind: "glow", x: X, y: Y, r: R * 3.4, color: "#FFE3A3", alpha: 0.55 * g });
    pc.lights.push(p, { kind: "glow", x: X, y: Y, r: R * 1.4, color: "#FFF4D6", alpha: 0.35 * g });
  }
}

export const sunColor = PALETTE.gold;
