// Общие данные для скриптов урока: сцены, озвучка, тайм-лайн, субтитры.
import { existsSync, readFileSync } from "node:fs";
import { SCENES } from "../../src/lesson-meditations/script.ts";
import { buildTimeline, FPS } from "../../src/lesson-meditations/timeline.ts";
import { buildCues } from "../../src/lesson-meditations/captions.ts";

export const VOICE_DIR = "public/lesson-meditations/voice";
export const loadManifest = () => {
  const p = `${VOICE_DIR}/manifest.json`;
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
};
export const timeline = () => buildTimeline(SCENES, loadManifest());
export const cues = (tl = timeline()) => buildCues(tl);
export const totalFrames = (tl = timeline()) => Math.ceil(tl.duration * FPS);
export { SCENES, FPS };
