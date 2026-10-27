// The golden line's choreography for "Большой мир в маленькой капле".
// Times are seconds; each stroke is synced to a spoken word (see timeline.json + voice-timing.json).
import { makeLine, Segment } from "../engines/LivingLineEngine";
import { Vec2, smootherstep, lerp, easeOutCubic, easeInOutSine } from "../engines/math";
import { circle, roundedRect } from "../engines/ShapeMorphEngine";
import { frameAt } from "../engines/SpaceMap";
import { ANCHOR_LEAF_DROP, ANCHOR_SECTION_CELL, SURFACE_CUT, VEIN_DIR } from "../engines/NestedWorldEngine";
import { ORNAMENT_C, ornamentPath } from "../components/Ornament";
import { BOY_POLY, QUESTION_POLY, FINAL_ARC } from "../components/BoyOnHill";

const C: Vec2 = { x: 540, y: 960 };
const TAU = Math.PI * 2;

// opening ring: drawn small, then grows into the outline of the Earth
const ringRadius = (t: number) => lerp(70, frameAt(t).earth.R + 7, smootherstep(1.6, 3.1, t));
const openingRing = (t: number) => {
  const f = frameAt(t);
  const r = ringRadius(t);
  return circle({ x: f.earth.gx, y: f.earth.gy }, r, -Math.PI / 2, TAU, 120);
};

const orbitScreen = (r0: number, r1: number, t0: number, t1: number, a0: number, turns: number) => (t: number) => {
  const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  const a = a0 + turns * TAU * easeInOutSine(u);
  const r = lerp(r0, r1, u);
  return { x: C.x + Math.cos(a) * r, y: C.y + Math.sin(a) * r * 1.05 };
};

const veinA = { x: -170 * VEIN_DIR.x, y: -170 * VEIN_DIR.y };
const veinB = { x: SURFACE_CUT.x + 70 * VEIN_DIR.x, y: SURFACE_CUT.y + 70 * VEIN_DIR.y };
const cellRect = roundedRect(ANCHOR_SECTION_CELL, 58, 158, 22);

const SEGMENTS: Segment[] = [
  // Scene 1 — the hook: a tiny circle becomes the planet
  { kind: "stroke", t0: 0.3, t1: 1.8, ref: "screen", path: openingRing, keep: [3.8, 5.4], width: 4.5 },
  { kind: "orbit", t0: 1.8, t1: 7.3, ref: "globe", at: (t) => {
    const a = -Math.PI / 2 + TAU * (1 + 0.55 * easeOutCubic(Math.min(1, (t - 1.8) / 5.5)));
    const r = ringRadius(t) / frameAt(t).earth.R;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  } },
  // Scene 2 — "здесь день, а там уже ночь"
  { kind: "travel", t0: 7.3, t1: 7.85, bulge: 0.25 },
  { kind: "stroke", t0: 7.85, t1: 8.5, ref: "globe", path: circle({ x: -0.52, y: -0.12 }, 0.13, -Math.PI / 2, TAU), keep: [9.8, 10.4], width: 3.5 },
  { kind: "travel", t0: 8.5, t1: 8.95, bulge: -0.3 },
  { kind: "stroke", t0: 8.95, t1: 9.55, ref: "globe", path: circle({ x: 0.55, y: 0.18 }, 0.13, -Math.PI / 2, TAU), keep: [9.9, 10.5], width: 3.5 },
  { kind: "travel", t0: 9.55, t1: 10.3, bulge: 0.2 },
  // the line chooses a destination and the camera follows it in
  { kind: "stroke", t0: 10.3, t1: 10.95, ref: "dest", path: circle({ x: 0, y: 0 }, 0.07, -Math.PI / 2, TAU), keep: [12.2, 13.0], width: 3.5 },
  { kind: "travel", t0: 10.95, t1: 11.5 },
  { kind: "orbit", t0: 11.5, t1: 18.0, ref: "screen", at: orbitScreen(200, 150, 11.5, 18.0, -Math.PI / 2, 1.6) },
  // Scene 3 — the drop
  { kind: "travel", t0: 18.0, t1: 18.45 },
  { kind: "stroke", t0: 18.45, t1: 19.35, ref: "L", path: circle(ANCHOR_LEAF_DROP, 98, -Math.PI / 2, TAU), keep: [21.9, 22.7], width: 3.5 },
  { kind: "orbit", t0: 19.35, t1: 21.5, ref: "L", at: (t) => {
    const a = -Math.PI / 2 + TAU * 0.6 * easeInOutSine((t - 19.35) / 2.15);
    return { x: ANCHOR_LEAF_DROP.x + Math.cos(a) * 98, y: ANCHOR_LEAF_DROP.y + Math.sin(a) * 98 };
  } },
  { kind: "travel", t0: 21.5, t1: 22.1 },
  { kind: "orbit", t0: 22.1, t1: 24.3, ref: "screen", at: orbitScreen(260, 110, 22.1, 24.3, 0.2, 0.9) },
  // Scene 4 — along the vein, the cut, one cell
  { kind: "travel", t0: 24.3, t1: 24.8 },
  { kind: "stroke", t0: 24.8, t1: 27.0, ref: "S", path: [veinA, veinB], keep: [26.9, 27.6], width: 6, ease: (u) => easeInOutSine(u) },
  { kind: "travel", t0: 27.0, t1: 27.35 },
  { kind: "stroke", t0: 27.35, t1: 28.05, ref: "cut", path: [{ x: 70, y: 0 }, { x: 1010, y: 0 }], keep: [28.9, 29.5], width: 3 },
  { kind: "travel", t0: 28.05, t1: 30.35, bulge: 0.35 },
  { kind: "stroke", t0: 30.35, t1: 31.35, ref: "X", path: cellRect, keep: [33.6, 34.4], width: 3 },
  { kind: "orbit", t0: 31.35, t1: 35.0, ref: "X", at: (t) => {
    const p = cellRect; const u = ((t - 31.35) / 3.65) * 0.75;
    const i = Math.min(p.length - 2, Math.floor(u * (p.length - 1))), fr = u * (p.length - 1) - i;
    return { x: lerp(p[i].x, p[i + 1].x, fr), y: lerp(p[i].y, p[i + 1].y, fr) };
  } },
  // Scene 5 — reverse journey, the line leads us out and re-draws the planet
  { kind: "travel", t0: 35.0, t1: 35.6 },
  { kind: "orbit", t0: 35.6, t1: 41.4, ref: "screen", at: orbitScreen(90, 240, 35.6, 41.4, Math.PI, -1.8) },
  { kind: "travel", t0: 41.4, t1: 41.9 },
  { kind: "stroke", t0: 41.9, t1: 43.4, ref: "globe", path: circle({ x: 0, y: 0 }, 1.045, Math.PI, TAU), keep: [44.6, 46.0], width: 3.5 },
  { kind: "orbit", t0: 43.4, t1: 47.0, ref: "globe", at: (t) => {
    const a = Math.PI + TAU * 0.35 * easeInOutSine((t - 43.4) / 3.6);
    return { x: Math.cos(a) * 1.045, y: Math.sin(a) * 1.045 };
  } },
  // Scene 6 — the ornament
  { kind: "travel", t0: 47.0, t1: 47.6 },
  { kind: "stroke", t0: 47.6, t1: 50.8, ref: "screen", path: ornamentPath(), keep: [54.6, 55.6], width: 2.6, ease: (u) => easeInOutSine(u) },
  { kind: "orbit", t0: 50.8, t1: 54.5, ref: "screen", at: (t) => {
    const a = -Math.PI / 2 + TAU * 0.9 * easeInOutSine((t - 50.8) / 3.7);
    return { x: ORNAMENT_C.x + Math.cos(a) * 150, y: ORNAMENT_C.y + Math.sin(a) * 150 };
  } },
  // Scene 7 — the boy, the question, the final arc
  { kind: "travel", t0: 54.5, t1: 55.2, bulge: 0.2 },
  { kind: "stroke", t0: 55.2, t1: 56.7, ref: "screen", path: BOY_POLY, keep: [61, 62], width: 3.2, ease: (u) => easeInOutSine(u) },
  { kind: "travel", t0: 56.7, t1: 57.0 },
  { kind: "stroke", t0: 57.0, t1: 57.7, ref: "screen", path: QUESTION_POLY, keep: [61, 62], width: 4 },
  { kind: "travel", t0: 57.7, t1: 58.3, bulge: 0.25 },
  { kind: "stroke", t0: 58.3, t1: 59.1, ref: "screen", path: FINAL_ARC, keep: [61, 62], width: 4 },
];

export const LINE = makeLine(SEGMENTS);
