// СЦЕНА 2 — НАРИСОВАННАЯ ЗЕМЛЯ (00:06–00:15)
// Солнце отходит в угол и освещает холст → синий мазок растекается в диск →
// материки и облака → PAINT-TO-LIFE: объём, терминатор, вращение вокруг оси →
// подписи «ДЕНЬ» и «НОЧЬ» → камера ныряет в синий океан (переход Земля → океан).

import type { PaintCtx } from "../engines/InvisiblePainterEngine";
import type { CamKey } from "../engines/PainterlyCameraController";
import { circle, drawWash } from "../engines/WatercolorSimulationEngine";
import { PALETTE } from "../engines/PainterlyLightingSystem";
import { drawEarth, type EarthState } from "../painted/LivingEarth";
import { lerp, lin, span } from "../utils/noise";
import { drawSun, SUN } from "./Scene01FirstStroke";

export const EARTH = { x: 888, y: 1472, r: 359 };
/** Камера сцен 1–2 (мир Солнца и Земли). */
export const CAM_A: CamKey[] = [
  { f: 0, x: 540, y: 820, zoom: 1.32 },
  { f: 165, x: 540, y: 820, zoom: 1.5 },
  { f: 240, x: 812, y: 1255, zoom: 0.92 },
  { f: 400, x: 830, y: 1290, zoom: 0.96 },
  { f: 466, x: EARTH.x - 150, y: EARTH.y - 120, zoom: 7.5 },
];

export const S2 = {
  oceanSpot: 200,
  ocean: [200, 252] as const,
  land: [238, 282] as const,
  clouds: [266, 292] as const,
  awaken: [272, 305] as const,
  day: 345,
  night: 378,
  dive: [405, 462] as const,
  flood: [428, 468] as const,
};

export function earthState(f: number): EarthState {
  const turn = lin(f, 275, 470);
  return {
    key: "e2",
    x: EARTH.x,
    y: EARTH.y,
    r: EARTH.r,
    lon: lerp(-55, -150, turn * (0.6 + 0.4 * turn)) ,
    ocean: span(f, S2.ocean[0], S2.ocean[1]),
    land: span(f, S2.land[0], S2.land[1]),
    clouds: span(f, S2.clouds[0], S2.clouds[1]) * (1 - span(f, 400, 432)),
    awaken: span(f, S2.awaken[0], S2.awaken[1]),
    light: { x: SUN.x - EARTH.x, y: SUN.y - EARTH.y },
  };
}

export function drawScene02(pc: PaintCtx, f: number) {
  const p = pc.p;
  drawSun(pc, f);
  // свет Солнца ложится на холст тёплой лессировкой в сторону Земли
  const warm = span(f, 190, 260);
  if (warm > 0) {
    drawWash(p, { id: "s2-warm", shape: circle(SUN.x + 60, SUN.y + 80, 420, 14), colors: ["#F6D58E", "#F9E2A8"], layers: 10, opacity: 0.18, edge: 0, deform: 0.8 }, warm);
  }
  drawEarth(p, earthState(f), pc.lights, f);
  // Земля → океан: синий пигмент заливает кадр (экранные координаты)
  const fl = span(f, S2.flood[0], S2.flood[1]);
  if (fl > 0) {
    p.save();
    p.setTransform(1, 0, 0, 1, 0, 0);
    drawWash(
      p,
      { id: "flood", shape: circle(540, 960, 1250, 14, 1, 1.15), origin: { x: 520, y: 1000 }, colors: ["#2F78A8", "#3E8CC0", "#2A6E9E"], layers: 16, opacity: 0.85, edge: 0.6, deform: 0.5, spreadJitter: 0.6 },
      fl,
      { time: f * 0.03, wobble: 0.05 },
    );
    p.restore();
  }
}
