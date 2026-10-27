// Scene 2 — "The secret of day and night" (00:06–00:14).
// The line leaves the moon, completes the horizon into a whole planet,
// draws its axis, the equator with the direction of rotation and the
// continents; then the Sun on the left. The planet turns (west → east),
// the Sun stays where it is: the lit half is day, the other half is night.

import { ease } from "../engines/LivingLineEngine.ts";
import type { JourneyBuilder } from "../engines/SceneTransitionEngine.ts";
import {
  add,
  arcPath,
  joinPaths,
  linePath,
  norm,
  polar,
  rotate,
  scale,
  smoothPath,
  sub,
  v,
  type Vec,
} from "../utils/geometry.ts";
import { PALETTE } from "../styles/palette.ts";
import {
  CONTINENTS,
  E,
  ELEV,
  HZ_A0,
  HZ_A1,
  R,
  SUN2_C,
  SUN2_R,
  SURF_A,
  TILT,
  axisPoint,
  projectFolded,
} from "../episodes/ep001/world.ts";

/** Front half of the equator (view space, not spinning) as points. */
export const equatorFront = (from = -78, to = 78, n = 40): Vec[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const l = ((from + ((to - from) * i) / n) * Math.PI) / 180;
    const x = Math.sin(l);
    const y1 = Math.cos(l) * Math.sin(ELEV);
    const r = rotate(v(x, y1), TILT);
    return v(E.x + r.x * R, E.y + r.y * R);
  });

export const continentPath = (id: string) => (f: number): string => {
  const c = CONTINENTS.find((k) => k.id === id)!;
  return smoothPath(
    c.pts.map(([lo, la]) => projectFolded(lo, la, f)),
    1,
    true,
  );
};

const RAY_YS = [-190, -70, 50];
export const rayPath = (y: number): string => {
  const limb = v(-Math.sqrt(R * R - y * y), y);
  const dir = norm(sub(limb, SUN2_C));
  return linePath([add(SUN2_C, scale(dir, SUN2_R + 8)), sub(limb, scale(dir, 4))]);
};

/** Where the comet-sweep around the planet ends (start of the ridge). */
export const RIDGE_START_U = 130;

export const buildScene2 = (j: JourneyBuilder) => {
  // 1. From the moon down to the planet edge (tangent to its contour).
  const p1 = polar(E, R, HZ_A1);
  j.travel("s2-to-earth", p1, 22, {
    at: 180,
    inDir: v(-Math.sin(HZ_A1), Math.cos(HZ_A1)),
    bend: 0.5,
    width: 6,
    glow: 0.8,
  });
  // 2. The horizon was the top of a planet: complete the circle.
  j.draw("s2-earth", arcPath(E, R, HZ_A1, Math.PI * 2 - (HZ_A1 - HZ_A0)), 38, {
    ease: ease.draw,
    width: 6,
    glow: 0.7,
  });
  // 3. The axis.
  const north = axisPoint(true);
  const south = axisPoint(false);
  j.travel("s2-to-axis", north, 12, { inDir: norm(sub(south, north)), bend: 0.5, width: 5 });
  j.draw("s2-axis", linePath([north, south]), 14, {
    ease: ease.glide,
    width: 3.5,
    glow: 0.5,
    color: PALETTE.goldHot,
    opacity: 0.85,
  });
  // 4. Equator (front half) with the direction of rotation: west → east.
  const eq = equatorFront();
  j.travel("s2-to-equator", eq[0], 8, { inDir: norm(sub(eq[1], eq[0])), bend: 0.4, width: 5 });
  const endP = eq[eq.length - 1];
  const tdir = norm(sub(endP, eq[eq.length - 2]));
  const back = scale(tdir, -16);
  const b1 = add(endP, rotate(back, 0.55));
  const b2 = add(endP, rotate(back, -0.55));
  j.draw("s2-equator", joinPaths(smoothPath(eq), linePath([endP, b1, endP, b2])), 20, {
    ease: ease.flow,
    width: 4.5,
    glow: 0.6,
    color: PALETTE.blue,
  });
  // Continents are sketched by side branches while the equator passes.
  CONTINENTS.forEach((c, i) =>
    j.branch(`s2-cont-${c.id}`, continentPath(c.id), 272 + i * 7, 22, {
      width: 3,
      glow: 0.25,
      color: PALETTE.gold,
      mask: "mask-daylight",
    }),
  );
  // 5. The Sun on the left — it does not move; the planet turns.
  j.travel("s2-to-sun", polar(SUN2_C, SUN2_R, 0), 16, {
    inDir: v(0, 1),
    bend: 0.65,
    width: 6,
    glow: 0.9,
  });
  j.draw("s2-sun", arcPath(SUN2_C, SUN2_R, 0, Math.PI * 2), 20, { ease: ease.draw, width: 6, glow: 1 });
  RAY_YS.forEach((y, i) =>
    j.branch(`s2-ray-${i}`, rayPath(y), j.frame + 2 + i * 4, 16, {
      width: 2.5,
      glow: 0.5,
      color: PALETTE.goldHot,
      opacity: 0.75,
    }),
  );
  // 6. Along a sunbeam to the planet, then a sweep around its whole contour
  //    — through the night side — to the place where the mountains begin.
  const limb = v(-Math.sqrt(R * R - 70 * 70), -70);
  j.draw("s2-beam", linePath([j.pos, limb]), 14, {
    kind: "travel",
    trail: 80,
    ease: ease.flow,
    width: 5,
    glow: 0.9,
  });
  const aLimb = Math.atan2(limb.y, limb.x) + Math.PI * 2; // ≈ 193.5°
  const aRidge = SURF_A + RIDGE_START_U / R; // ≈ -100°
  j.draw("s2-sweep", arcPath(E, R, aLimb, aRidge - aLimb), 76, {
    kind: "travel",
    trail: 420,
    ease: ease.flow,
    width: 6,
    glow: 0.9,
  });
};
