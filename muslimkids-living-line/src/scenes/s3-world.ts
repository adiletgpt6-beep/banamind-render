// Scene 3 — "A journey across the world" (00:14–00:23).
// The camera dives to the planet surface. The surface arc rises into a
// mountain ridge, one summit curls up into a cloud, and from the cloud the
// same line forms a raindrop that starts to fall.
//
// Everything here is described in the local surface frame (u along the
// ground, h above it) and mapped onto the curved planet with `surf()`.

import { ease } from "../engines/LivingLineEngine.ts";
import { rise, type JourneyBuilder } from "../engines/SceneTransitionEngine.ts";
import { smoothPath, v, type Vec } from "../utils/geometry.ts";
import { PALETTE } from "../styles/palette.ts";
import { surf, TREE_U } from "../episodes/ep001/world.ts";
import { Easing } from "remotion";

export const local = (pts: [number, number][], du = 0, dh = 0): Vec[] =>
  pts.map(([u, h]) => surf(u + du, h + dh));

export const RIDGE: [number, number][] = [
  [130, 0], [118, 9], [108, 6], [96, 24], [88, 15], [76, 38], [68, 26], [58, 31],
  [46, 52], [35, 36], [24, 30], [12, 47], [2, 38], [-10, 60], [-20, 46], [-29, 50], [-40, 68],
];
export const FOOTHILLS: [number, number][] = [
  [-40, 66], [-49, 47], [-58, 52], [-70, 30], [-82, 20], [-94, 12], [-106, 24], [-118, 15],
  [-131, 29], [-146, 13], [-170, 0],
];
export const CLOUD: [number, number][] = [
  [-60, 100], [-55, 107], [-60, 116], [-70, 120], [-77, 128], [-90, 131], [-101, 127],
  [-108, 121], [-118, 121], [-125, 113], [-122, 104], [-115, 100], [-105, 99], [TREE_U, 99],
];
export const DROP: [number, number][] = [
  [TREE_U, 99], [TREE_U + 1.3, 96.4], [TREE_U + 2.6, 93.4], [TREE_U + 2, 91.1], [TREE_U, 90.2],
  [TREE_U - 2, 91.1], [TREE_U - 2.6, 93.4], [TREE_U - 1.3, 96.4], [TREE_U, 99],
];

export const FALL_FROM = 586;
export const FALL_TO = 700;
export const dropFall = (f: number): number => 89 * Easing.in(Easing.quad)(rise(f, FALL_FROM, FALL_TO, (t) => t));

/** Ripple ellipse on the ground (closed, starts at the top like the drop). */
export const ripple = (rx: number, ry: number): Vec[] =>
  Array.from({ length: 9 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 8) * Math.PI * 2;
    return surf(TREE_U + rx * Math.cos(a), 0.6 - ry * Math.sin(a));
  });

export const buildScene3 = (j: JourneyBuilder) => {
  // 1. The surface arc rises into a mountain ridge.
  j.draw("s3-ridge", smoothPath(local(RIDGE), 0.8), 78, {
    at: 420,
    ease: ease.flow,
    width: 6,
    glow: 0.7,
  });
  // The ridge splits: foothills run on as a side branch…
  j.branch("s3-foothills", smoothPath(local(FOOTHILLS), 0.8), 496, 46, {
    width: 4,
    glow: 0.35,
    color: PALETTE.goldDeep,
  });
  // 2. …while the main line climbs from the summit and curls into a cloud.
  const cloud = local(CLOUD);
  j.travel("s3-to-cloud", cloud[0], 18, {
    at: 500,
    inDir: dirUp(-60),
    bend: 0.5,
    width: 5.5,
    glow: 0.8,
  });
  j.draw("s3-cloud", smoothPath(cloud, 1), 36, { ease: ease.flow, width: 5, glow: 0.7, color: PALETTE.white });
  // 3. From the cloud — a raindrop, drawn by the same line. It falls.
  j.draw(
    "s3-drop",
    (f) => {
      if (f < 700) return smoothPath(local(DROP, 0, -dropFall(f)), 1);
      // landing → ripple (scene 4 continues this very stroke)
      const t = rise(f, 700, 714);
      const drop = local(DROP, 0, -89);
      const rx = 8 + 16 * rise(f, 714, 752, Easing.out(Easing.cubic));
      const ring = ripple(rx, 2.2 + 1.2 * rise(f, 714, 752));
      if (t >= 1) return smoothPath(ring, 1);
      return smoothPath(
        drop.map((p, i) => ({ x: p.x + (ring[i].x - p.x) * t, y: p.y + (ring[i].y - p.y) * t })),
        1,
      );
    },
    16,
    {
      at: 558,
      ease: ease.flow,
      width: 4.5,
      glow: 0.9,
      color: PALETTE.blue,
      opacity: (f) => 1 - rise(f, 716, 752),
    },
  );
};

/** World direction of "up" (outward normal) at surface position u. */
export const dirUp = (u: number): Vec => {
  const a = surf(u, 0);
  const b = surf(u, 1);
  return v(b.x - a.x, b.y - a.y);
};
