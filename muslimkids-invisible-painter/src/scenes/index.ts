// Порядок сцен и камеры. Сцены 1–2 — «мир Солнца и Земли» (камера A);
// с заливки синим (кадр WORLD_START) — единый пейзаж-холст (камера B), в котором
// проходят сцены 3–7 и куда всё возвращается в финале.
import type { ScenePart } from "../engines/InvisiblePainterEngine";
import { drawSun } from "./Scene01FirstStroke";
import { CAM_A, drawScene02 } from "./Scene02Earth";
import { CAM_B, drawWorld, WORLD_START } from "./world";

export const PARTS: ScenePart[] = [
  { from: 0, to: 180, camera: CAM_A, draw: (pc, f) => drawSun(pc, f) },
  { from: 180, to: WORLD_START, camera: CAM_A, draw: drawScene02 },
  { from: WORLD_START, to: 1800, camera: CAM_B, draw: drawWorld },
];
