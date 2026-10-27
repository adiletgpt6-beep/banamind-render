// Scene 1 — "The first riddle" (00:00–00:06).
// A tiny golden stroke wakes up, flies, draws the horizon which bends into
// the planet's curve, draws the rising Sun, and — as night falls — the last
// curve of the Sun becomes the crescent moon.

import { ease } from "../engines/LivingLineEngine.ts";
import { morphPath } from "../engines/LineMorphEngine.ts";
import { rise, type JourneyBuilder } from "../engines/SceneTransitionEngine.ts";
import {
  angleDiff,
  angleOf,
  arcPath,
  circleIntersections,
  joinPaths,
  linePath,
  smoothPath,
  v,
} from "../utils/geometry.ts";
import { PALETTE } from "../styles/palette.ts";
import {
  E,
  HZ_A0,
  HZ_A1,
  HZ_LEFT_X,
  HZ_RIGHT_X,
  MOON_C,
  R,
  SHADOW_C,
  SHADOW_R,
  SUN1_R,
  SUN1_X,
  sun1Y,
} from "../episodes/ep001/world.ts";

export const DASH_Y = -345; // screen centre of the opening shot

/** The small resting stroke (also the very last image of the film). */
export const restingDash = (cx: number, cy: number, half: number, bend = 0): string =>
  smoothPath([v(cx - half, cy + bend * 0.4), v(cx, cy - bend), v(cx + half, cy + bend * 0.4)]);

export const horizonStraight = linePath([v(HZ_LEFT_X, -R), v(0, -R), v(HZ_RIGHT_X, -R)]);
export const horizonArc = arcPath(E, R, HZ_A0, HZ_A1 - HZ_A0);
export const horizonAt = (f: number): string =>
  morphPath(horizonStraight, horizonArc, rise(f, 66, 86), { n: 80, wave: 5 });

export const sunCircleAt = (f: number): string =>
  arcPath(v(SUN1_X, sun1Y(f)), SUN1_R, 0, -Math.PI * 2);

/** Crescent: outer rim (right side) + inner shadow arc. */
export const crescent = (() => {
  const [i1, i2] = circleIntersections(MOON_C, SUN1_R, SHADOW_C, SHADOW_R);
  const up = i1.y < i2.y ? i1 : i2;
  const down = i1.y < i2.y ? i2 : i1;
  const aUp = angleOf(MOON_C, up);
  const aDown = angleOf(MOON_C, down);
  const sUp = angleOf(SHADOW_C, up);
  const sDown = angleOf(SHADOW_C, down);
  // right point (0) → up along rim (counter-clockwise, negative sweep)
  const rimUp = arcPath(MOON_C, SUN1_R, 0, angleDiff(0, aUp) > 0 ? angleDiff(0, aUp) - Math.PI * 2 : angleDiff(0, aUp));
  // inner arc: shadow circle's right side, from up to down (clockwise)
  let sweep = sDown - sUp;
  while (sweep < 0) sweep += Math.PI * 2;
  const inner = arcPath(SHADOW_C, SHADOW_R, sUp, sweep);
  // lower rim: from down point back to the right point (counter-clockwise)
  const rimDown = arcPath(MOON_C, SUN1_R, aDown, -aDown);
  return { d: joinPaths(rimUp, inner, rimDown), up, down };
})();

export const buildScene1 = (j: JourneyBuilder) => {
  // 1. A tiny stroke appears in the dark and breathes.
  j.draw(
    "s1-dash",
    (f) => restingDash(SUN1_X, DASH_Y, 8, 1.8 * Math.sin((f - 24) / 3.2) * rise(f, 22, 28) * (1 - rise(f, 32, 38))),
    14,
    { at: 10, kind: "travel", trail: 40, tailDelay: 26, ease: ease.glide, width: 7, glow: 0.9 },
  );
  // 2. It wakes up: a swift loop to the left edge of the world.
  j.travel("s1-fly", v(HZ_LEFT_X, -R), 20, {
    at: 38,
    inDir: v(1, 0),
    bend: 0.55,
    ease: ease.rush,
    width: 6.5,
    glow: 0.9,
  });
  // 3. The horizon… which bends into the curve of a planet.
  j.draw("s1-horizon", horizonAt, 18, { ease: ease.glide, width: 6, glow: 0.7 });
  // 4. Up from the horizon — the Sun is drawn by the same line.
  j.wait(12);
  j.travel("s1-to-sun", v(SUN1_X + SUN1_R, sun1Y(90)), 12, {
    inDir: v(0, -1),
    bend: 0.5,
    width: 6,
    glow: 0.9,
  });
  j.draw("s1-sun", sunCircleAt, 24, {
    ease: ease.draw,
    width: 6.5,
    glow: 1,
    clip: "clip-sky",
    opacity: (f) => 1 - rise(f, 150, 172),
  });
  // 5. Night falls: the last curve of the Sun becomes the crescent.
  j.wait(8);
  j.draw("s1-crescent", crescent.d, 26, {
    at: 142,
    ease: ease.draw,
    width: 5.5,
    glow: 0.9,
    color: (f) => (f < 150 ? PALETTE.gold : f < 166 ? mix(PALETTE.gold, PALETTE.moon, (f - 150) / 16) : PALETTE.moon),
  });
};

/** Simple hex colour mix (0..1). */
export const mix = (a: string, b: string, t: number): string => {
  const k = Math.min(1, Math.max(0, t));
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((c, i) => Math.round(c + (pb[i] - c) * k).toString(16).padStart(2, "0")).join("")}`;
};
