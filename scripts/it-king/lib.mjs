// Общие данные для скриптов BM-020: сцены, озвучка, тайм-лайн, титры.
// PILOT=1 — пилот (сцены PILOT без растяжки до 30:00).
import { existsSync, readFileSync } from "node:fs";
import { PILOT, SCENES as ALL } from "../../src/books/it-king-volume-one/film/script.ts";
import { buildTimeline, FPS } from "../../src/books/it-king-volume-one/film/timeline.ts";
import { buildCues } from "../../src/books/it-king-volume-one/film/captions.ts";

export const IS_PILOT = process.env.PILOT === "1";
export const SCENES = IS_PILOT ? ALL.filter((s) => PILOT.includes(s.id)) : ALL;
export const COMPOSITION = IS_PILOT ? "ItPilot" : "ItVolumeOne";
export const ENTRY = "src/books/it-king-volume-one/film/index.ts";
export const VOICE_DIR = "public/it-king/voice";
export const loadManifest = () => {
  const p = `${VOICE_DIR}/manifest.json`;
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
};
const voiced = () => {
  const m = loadManifest();
  return m?.lines?.length ? m : null;
};
export const timeline = () => buildTimeline(SCENES, voiced(), IS_PILOT ? 0 : undefined);
export const cues = (tl = timeline()) => buildCues(tl);
export const totalFrames = (tl = timeline()) => Math.ceil(tl.duration * FPS);
export { ALL, FPS, PILOT };
