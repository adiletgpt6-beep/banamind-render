// Episode 001 assembly: camera path + the one continuous journey.
// Pure TypeScript — also imported by the QA script (scripts/qa-line.ts).

import { cameraAt, resolveCamera, type CamKey } from "../../engines/CameraController.ts";
import { prepareJourney, tipAt, validateJourney } from "../../engines/LivingLineEngine.ts";
import { JourneyBuilder } from "../../engines/SceneTransitionEngine.ts";
import { Easing } from "remotion";
import { buildScene1, DASH_Y } from "../../scenes/s1-sunrise.ts";
import { buildScene2 } from "../../scenes/s2-day-night.ts";
import { buildScene3 } from "../../scenes/s3-world.ts";
import { buildScene4 } from "../../scenes/s4-tree.ts";
import { buildScene5 } from "../../scenes/s5-signs.ts";
import { buildScene6 } from "../../scenes/s6-ornament.ts";
import { buildScene7 } from "../../scenes/s7-question.ts";
import { v } from "../../utils/geometry.ts";
import { levelRot, surf } from "./world.ts";

const S = (u: number, h: number) => surf(u, h);
const key = (f: number, p: { x: number; y: number }, zoom: number, rot = 0, follow = 0, ease?: CamKey["ease"]): CamKey => ({
  f,
  x: p.x,
  y: p.y,
  zoom,
  rot,
  follow,
  ease,
});

const glide = Easing.bezier(0.42, 0, 0.25, 1);

export const CAMERA: CamKey[] = [
  // Scene 1 — close on the planet's top edge.
  key(0, v(0, DASH_Y), 3.1),
  key(56, v(0, DASH_Y), 3.0),
  key(104, v(0, -338), 2.6),
  key(178, v(0, -345), 2.45),
  // Scene 2 — pull back: the horizon was a planet.
  key(240, v(-110, 0), 1.15, 0, 0, glide),
  key(400, v(-110, 0), 1.15),
  // Scene 3 — dive to the lit surface; the camera lies down along it.
  key(430, S(118, 22), 3.3, levelRot(118), 0.35),
  key(470, S(60, 30), 4.4, levelRot(60), 0.55),
  key(500, S(-10, 40), 4.5, levelRot(-10), 0.55),
  key(540, S(-60, 78), 4.4, levelRot(-60), 0.5),
  key(580, S(-92, 90), 6.0, levelRot(-92), 0.5),
  key(690, S(-95, 14), 6.4, levelRot(-95), 0.7, (t) => t),
  // Scene 4 — seed, sprout, tree.
  key(712, S(-95, 2), 7.2, levelRot(-95), 0.4),
  key(748, S(-95, -6), 10, levelRot(-95), 0.3),
  key(790, S(-95, 8), 8.2, levelRot(-95), 0.3),
  key(845, S(-95, 42), 4.8, levelRot(-95), 0.15),
  key(905, S(-86, 56), 3.4, levelRot(-86), 0),
  key(986, S(-78, 64), 3.05, levelRot(-78), 0, (t) => t),
  // Scene 5 — up into the sky, then the whole planet inside an orbit.
  key(1045, v(-430, -360), 1.9, levelRot(-95) * 0.55, 0.55),
  key(1100, v(-250, -430), 1.35, 0.05, 0.35),
  key(1172, v(0, 150), 0.95, 0, 0, glide),
  key(1328, v(0, 150), 0.95),
  // Scene 6 — the globe becomes small; the ornament below it.
  key(1404, v(0, 1050), 0.38, 0, 0, glide),
  key(1604, v(0, 1050), 0.38),
  // Scene 7 — down to the hill, then a gentle pull back.
  key(1648, v(20, 3080), 2.1, 0, 0.3, glide),
  key(1706, v(60, 2990), 1.6, 0, 0),
  key(1800, v(60, 2990), 1.6),
];

const build = () => {
  const j = new JourneyBuilder(v(-8, DASH_Y), 10);
  buildScene1(j);
  buildScene2(j);
  buildScene3(j);
  buildScene4(j);
  buildScene5(j, cameraAt(CAMERA, 1200));
  buildScene6(j);
  buildScene7(j, cameraAt(CAMERA, 1750));
  return prepareJourney(j.strokes, (f) => cameraAt(CAMERA, f).zoom);
};

export const JOURNEY = build();
export const JOURNEY_PROBLEMS = validateJourney(JOURNEY);

export const tip = (f: number) => tipAt(JOURNEY, f);
export const camera = (f: number) => resolveCamera(CAMERA, f, (g) => tipAt(JOURNEY, Math.max(0, g)).p);
