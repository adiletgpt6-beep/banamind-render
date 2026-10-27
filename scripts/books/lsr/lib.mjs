// Общие данные скриптов BM-024: сцены, озвучка, тайм-лайн, титры.
// LSR_SCOPE=pilot — тайм-лайн тестового пилота (сцены pilot: true, без растяжки пауз).
import { existsSync, readFileSync } from "node:fs";
import { PILOT_SCENES, SCENES as ALL } from "../../../src/books/lean-startup-eric-ries/film/script.ts";
import { buildTimeline, FPS } from "../../../src/books/lean-startup-eric-ries/film/timeline.ts";
import { buildCues } from "../../../src/books/lean-startup-eric-ries/film/captions.ts";

export const PILOT = process.env.LSR_SCOPE === "pilot";
export const SCENES = PILOT ? PILOT_SCENES : ALL;
export const COMPOSITION = PILOT ? "LsrPilot" : "LsrFilm";
export const VOICE_DIR = "public/lsr/voice";
export const loadManifest = () => {
  const p = `${VOICE_DIR}/manifest.json`;
  const m = existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
  return m?.lines?.length ? m : null;
};
export const timeline = () => buildTimeline(SCENES, loadManifest(), PILOT ? 0 : undefined);
export const cues = (tl = timeline()) => buildCues(tl);
export const totalFrames = (tl = timeline()) => Math.ceil(tl.duration * FPS);
export { FPS };
