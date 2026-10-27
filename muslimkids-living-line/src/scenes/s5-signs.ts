// Scene 5 — "Signs" (00:33–00:44).
// The line leaves the top of the tree and flies up into the sky, draws a
// constellation and orbital arcs, then a huge circle — inside it the whole
// planet appears again (with the tiny mountains and tree on its edge).
// It underlines the word «РАЗМЫШЛЯЙ».

import { ease } from "../engines/LivingLineEngine.ts";
import { screenToWorld, type Camera } from "../engines/CameraController.ts";
import type { JourneyBuilder } from "../engines/SceneTransitionEngine.ts";
import { arcPath, deg, linePath, polar, rotate, smoothPath, v, type Vec } from "../utils/geometry.ts";
import { PALETTE } from "../styles/palette.ts";
import { E, ORBIT_R, TREE_U } from "../episodes/ep001/world.ts";
import { local } from "./s3-world.ts";

export const CONSTELLATION: Vec[] = [
  v(-480, -360),
  v(-436, -468),
  v(-352, -536),
  v(-262, -606),
  v(-306, -700),
  v(-184, -728),
  v(-122, -652),
];

export const ORBIT_START = deg(-105);

/** Tilted elliptical orbit arcs around the planet (decorative branches). */
export const orbitEllipse = (rx: number, ry: number, tilt: number, from: number, sweep: number): string =>
  smoothPath(
    Array.from({ length: 49 }, (_, i) => {
      const a = from + (sweep * i) / 48;
      return rotate(v(E.x + rx * Math.cos(a), E.y + ry * Math.sin(a)), tilt, E);
    }),
    1,
  );

/** Screen layout of the «РАЗМЫШЛЯЙ» title (see TypographySystem usage). */
export const THINK_UNDERLINE = { y: 1466, x0: 318, x1: 762 };

export const buildScene5 = (j: JourneyBuilder, camAtTitle: Camera) => {
  // 1. Out of the top branch, up into the sky.
  const up = local([
    [TREE_U, 93],
    [TREE_U + 3, 128],
    [TREE_U - 4, 172],
    [TREE_U + 3, 222],
    [TREE_U - 1, 268],
  ]);
  j.draw("s5-rise", smoothPath([...up, CONSTELLATION[0]], 1), 52, {
    at: 990,
    kind: "travel",
    trail: 140,
    ease: ease.flow,
    width: 6,
    glow: 0.9,
  });
  // 2. A constellation drawn with fine lines (stars bloom at each vertex).
  j.draw("s5-constellation", linePath(CONSTELLATION), 48, {
    ease: ease.flow,
    width: 3,
    glow: 0.6,
    color: PALETTE.moon,
  });
  // 3. The huge circle — an orbit around the planet.
  const o0 = polar(E, ORBIT_R, ORBIT_START);
  j.travel("s5-to-orbit", o0, 14, {
    inDir: v(-Math.sin(ORBIT_START), Math.cos(ORBIT_START)),
    bend: 0.5,
    width: 5,
  });
  j.draw("s5-orbit", arcPath(E, ORBIT_R, ORBIT_START, Math.PI * 2), 62, { ease: ease.draw, width: 5.5, glow: 0.8 });
  j.branch("s5-orbit-a", orbitEllipse(ORBIT_R * 0.86, ORBIT_R * 0.3, deg(-18), deg(-200), deg(250)), 1112, 50, {
    width: 2.5,
    glow: 0.4,
    color: PALETTE.blue,
    opacity: 0.8,
  });
  j.branch("s5-orbit-b", orbitEllipse(ORBIT_R * 0.8, ORBIT_R * 0.42, deg(32), deg(-10), deg(230)), 1124, 50, {
    width: 2.2,
    glow: 0.4,
    color: PALETTE.blue,
    opacity: 0.6,
  });
  // 4. The line goes once more around the planet… and on, to the title.
  const glideTo = deg(135);
  j.draw("s5-glide", arcPath(E, ORBIT_R, ORBIT_START, glideTo - ORBIT_START), 30, {
    kind: "travel",
    trail: 520,
    ease: ease.flow,
    width: 6,
    glow: 0.9,
  });
  const u0 = screenToWorld(camAtTitle, v(THINK_UNDERLINE.x0, THINK_UNDERLINE.y));
  const u1 = screenToWorld(camAtTitle, v(THINK_UNDERLINE.x1, THINK_UNDERLINE.y));
  j.travel("s5-to-title", u0, 12, { inDir: v(1, 0), bend: 0.6, width: 5 });
  j.draw("s5-underline", smoothPath([u0, v((u0.x + u1.x) / 2, u0.y + 4), u1]), 22, {
    ease: ease.draw,
    width: 5,
    glow: 0.9,
    opacity: (f) => 1 - Math.min(1, Math.max(0, (f - 1304) / 18)),
  });
};
