// Общие данные для скриптов фильма BM-003: сцены, озвучка, тайм-лайн, субтитры.
import { existsSync, readFileSync } from "node:fs";
import { SCENES } from "../../../src/books/islamskoe-verouchenie-akyda/script.ts";
import { buildTimeline, FPS } from "../../../src/books/islamskoe-verouchenie-akyda/timeline.ts";
import { buildCues } from "../../../src/books/islamskoe-verouchenie-akyda/captions.ts";

export const VOICE_DIR = "public/akyda/voice";
export const ENTRY = "src/books/islamskoe-verouchenie-akyda/index.ts";
export const COMP = "AkydaFilm";
export const loadManifest = () => {
  const p = `${VOICE_DIR}/manifest.json`;
  if (!existsSync(p)) return null;
  const m = JSON.parse(readFileSync(p, "utf8"));
  return m.lines?.length ? m : null;
};
export const timeline = () => buildTimeline(SCENES, loadManifest());
export const cues = (tl = timeline()) => buildCues(tl);
export const totalFrames = (tl = timeline()) => Math.ceil(tl.duration * FPS);
export { SCENES, FPS };
