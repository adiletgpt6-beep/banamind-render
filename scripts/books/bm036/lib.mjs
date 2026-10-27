// Общие данные скриптов BM-036: сцены, озвучка, тайм-лайн, титры.
// BM036_SCOPE=pilot — тайм-лайн тестового пилота (сцены pilot: true, без растяжки пауз).
import { existsSync, readFileSync } from "node:fs";
import { PILOT_SCENES, SCENES as ALL } from "../../../src/books/richest-man-in-babylon-clason/film/script.ts";
import { buildTimeline, FPS } from "../../../src/books/richest-man-in-babylon-clason/film/timeline.ts";
import { buildCues } from "../../../src/books/richest-man-in-babylon-clason/film/captions.ts";

export const PILOT = process.env.BM036_SCOPE === "pilot";
export const SCENES = PILOT ? PILOT_SCENES : ALL;
export const COMPOSITION = PILOT ? "Bm036Pilot" : "Bm036Film";
export const VOICE_DIR = "public/bm036/voice";
export const loadManifest = () => {
  const p = `${VOICE_DIR}/manifest.json`;
  const m = existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
  return m?.lines?.length ? m : null;
};
export const timeline = () => buildTimeline(SCENES, loadManifest(), PILOT ? 0 : undefined);
export const cues = (tl = timeline()) => buildCues(tl);
export const totalFrames = (tl = timeline()) => Math.ceil(tl.duration * FPS);
export { FPS };
