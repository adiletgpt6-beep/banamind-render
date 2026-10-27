// Scene 6 — "The main thought" (00:44–00:54).
// The planet becomes small; the line draws a calm geometric ornament
// (inspired by the harmony of Islamic geometry, not a copy of any existing
// pattern): ring → two interlaced squares → inner ring → small medallions.
// Then it glides softly around the composition.

import { ease } from "../engines/LivingLineEngine.ts";
import { rise, type JourneyBuilder } from "../engines/SceneTransitionEngine.ts";
import { arcPath, deg, joinPaths, linePath, polar, v } from "../utils/geometry.ts";
import { PALETTE } from "../styles/palette.ts";
import { ORN_C, ORN_INNER, ORN_R } from "../episodes/ep001/world.ts";

/** Slow, dignified rotation of the whole ornament. */
export const ornTurn = (f: number): number => deg(7) * rise(f, 1340, 1640, (t) => t);

const P = (a: number, f: number, r = ORN_R) => polar(ORN_C, r, a + ornTurn(f));
const Q = Math.PI / 4;

export const squareA = (f: number): string =>
  linePath([-2, 0, 2, 4, 6].map((k) => P(k * Q, f)));
export const squareB = (f: number): string =>
  linePath([-1, 1, 3, 5, 7].map((k) => P(k * Q, f)));

export const buildScene6 = (j: JourneyBuilder) => {
  // 1. From the underline to the top of the future ornament.
  j.travel("s6-to-ring", P(-2 * Q, 1352), 20, { at: 1332, inDir: v(1, 0), bend: 0.55, width: 6 });
  // 2. Outer ring.
  j.draw("s6-ring", (f) => arcPath(ORN_C, ORN_R, -Math.PI / 2 + ornTurn(f), Math.PI * 2), 52, {
    ease: ease.draw,
    width: 5.5,
    glow: 0.8,
  });
  // 3. Two interlaced squares (one continuous path via a short arc).
  j.draw(
    "s6-squares",
    (f) =>
      joinPaths(
        squareA(f),
        arcPath(ORN_C, ORN_R, -Math.PI / 2 + ornTurn(f), Q),
        squareB(f),
      ),
    72,
    { ease: ease.flow, width: 4.5, glow: 0.7 },
  );
  // 4. Along one edge to an inner vertex, then the inner ring.
  j.draw("s6-to-inner", (f) => linePath([P(-Q, f), P(-Q / 2, f, ORN_INNER)]), 8, {
    kind: "travel",
    trail: 300,
    ease: ease.flow,
    width: 5,
  });
  j.draw("s6-inner", (f) => arcPath(ORN_C, ORN_INNER, -Q / 2 + ornTurn(f), Math.PI * 2), 36, {
    ease: ease.draw,
    width: 4,
    glow: 0.7,
    color: PALETTE.blue,
  });
  // 5. Eight small medallions bloom on the star points (side branches).
  for (let k = 0; k < 8; k++) {
    j.branch(`s6-med-${k}`, (f) => arcPath(P(k * Q - Math.PI / 2, f), ORN_R * 0.05, k * Q, Math.PI * 2), 1500 + k * 3, 18, {
      width: 3,
      glow: 0.5,
      color: PALETTE.goldHot,
    });
  }
  // 6. The line glides around the composition and comes to rest at the bottom.
  j.draw(
    "s6-glide",
    (f) => arcPath(ORN_C, ORN_INNER, -Q / 2 + ornTurn(f), Math.PI / 2 + Q / 2 + Math.PI * 2),
    84,
    { at: 1522, kind: "travel", trail: 900, ease: ease.flow, width: 5.5, glow: 0.9 },
  );
};
