// Scene 7 — "A question for the child" (00:54–01:00).
// The line leaves the ornament, draws a hill and — without lifting — a
// little boy who points at the night sky, then a few stars above him.
// Finally it draws the brand ring and returns to the small glowing stroke
// the film started with.

import { ease } from "../engines/LivingLineEngine.ts";
import { morphPath } from "../engines/LineMorphEngine.ts";
import { screenToWorld, type Camera } from "../engines/CameraController.ts";
import { rise, type JourneyBuilder } from "../engines/SceneTransitionEngine.ts";
import {
  add,
  arcPath,
  joinPaths,
  smoothPath,
  sparklePoints,
  linePath,
  v,
  type Vec,
} from "../utils/geometry.ts";
import { PALETTE } from "../styles/palette.ts";
import { HILL_TOP } from "../episodes/ep001/world.ts";
import { restingDash } from "./s1-sunrise.ts";

const HILL_R = 900;
const HILL_C = v(HILL_TOP.x, HILL_TOP.y + HILL_R);
export const hillY = (x: number): number => HILL_C.y - Math.sqrt(HILL_R * HILL_R - (x - HILL_C.x) ** 2);
const hillPts = (x0: number, x1: number, n = 12): Vec[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / n;
    return v(x, hillY(x));
  });

/** Boy silhouette (local: feet at y = 0, facing right, looking & pointing up). */
const BOY_LOCAL: [number, number][] = [
  [-13, 0], [-12, -20], [-11, -37], [-15, -52], [-15, -66], [-16, -80], [-14, -90],
  [-10, -96], [-16, -104], [-20, -115], [-13, -127], [0, -131], [9, -127], [15, -123],
  [17, -119], [13, -117], [14, -112], [8, -107], [3, -100], [9, -92], [20, -103],
  [31, -116], [37, -126], [41, -124], [36, -112], [24, -97], [12, -83], [9, -68],
  [10, -52], [9, -37], [10, -17], [17, -3], [16, 0],
];
export const BOY_K = 2;
export const BOY_HEEL_X = -13 * BOY_K;
export const BOY_TOE_X = 16 * BOY_K;
export const boyPoints = (): Vec[] =>
  BOY_LOCAL.map(([x, y], i) => {
    const p = add(HILL_TOP, v(x * BOY_K, y * BOY_K));
    // Feet stand exactly on the hill line.
    return i === 0 || i === BOY_LOCAL.length - 1 ? v(p.x, hillY(p.x)) : p;
  });

export const STARS: { c: Vec; r: number }[] = [
  { c: v(160, 2860), r: 15 },
  { c: v(50, 2790), r: 11 },
  { c: v(250, 2900), r: 12 },
];

export const LOGO = { ring: v(540, 400), r: 104, dash: v(540, 960), dashHalf: 15 };

export const buildScene7 = (j: JourneyBuilder, camFinal: Camera) => {
  // 1. Out of the ornament, down to a hill.
  const hillStart = v(-300, hillY(-300));
  j.travel("s7-to-hill", hillStart, 26, { at: 1606, inDir: v(1, -0.12), bend: 0.45, width: 6, glow: 0.9 });
  // 2. Hill → boy → hill, in one stroke.
  const boy = boyPoints();
  j.draw("s7-hill-l", smoothPath(hillPts(-300, BOY_HEEL_X), 1), 10, { ease: ease.glide, width: 5, glow: 0.6 });
  j.draw("s7-boy", smoothPath(boy, 0.85), 38, { ease: ease.flow, width: 5, glow: 0.8 });
  j.draw("s7-hill-r", smoothPath(hillPts(BOY_TOE_X, 260), 1), 10, { ease: ease.glide, width: 5, glow: 0.6 });
  // 3. A few stars above him.
  for (const [i, s] of STARS.entries()) {
    const pts = sparklePoints(s.c, s.r);
    j.travel(`s7-to-star-${i}`, pts[0], 10, { bend: 0.4, width: 4 });
    j.draw(`s7-star-${i}`, linePath(pts), 6, { ease: ease.glide, width: 3.5, glow: 0.9, color: PALETTE.goldHot });
  }
  // 4. The brand ring, then — the small stroke of the very first frame.
  const ringC = screenToWorld(camFinal, LOGO.ring);
  const ringR = LOGO.r / camFinal.zoom;
  const ringStart = v(ringC.x - ringR, ringC.y);
  const wave = smoothPath(
    Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      return v(ringC.x - ringR + 2 * ringR * t, ringC.y + Math.sin(t * Math.PI * 2) * ringR * 0.22 * Math.sin(t * Math.PI));
    }),
  );
  const ring = joinPaths(arcPath(ringC, ringR, Math.PI, Math.PI * 2), wave);
  const dc = screenToWorld(camFinal, LOGO.dash);
  const dash = restingDash(dc.x, dc.y, LOGO.dashHalf / camFinal.zoom);
  j.travel("s7-to-logo", ringStart, 10, { inDir: v(0, -1), bend: 0.5, width: 5 });
  j.draw("s7-logo", (f) => morphPath(ring, dash, rise(f, 1772, 1792), { n: 120, wave: 6 / camFinal.zoom }), 22, {
    ease: ease.draw,
    width: 6,
    glow: 1,
  });
};
