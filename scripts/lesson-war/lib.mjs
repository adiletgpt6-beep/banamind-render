// Общие данные для скриптов урока: сцены, озвучка, тайм-лайн, субтитры.
import { existsSync, readFileSync } from "node:fs";
import { SCENES } from "../../src/books/war-and-peace-tolstoy/film/script.ts";
import { buildTimeline, FPS } from "../../src/books/war-and-peace-tolstoy/film/timeline.ts";
import { buildCues } from "../../src/books/war-and-peace-tolstoy/film/captions.ts";

export const VOICE_DIR = "public/lesson-war/voice";
export const loadManifest = () => {
  const p = `${VOICE_DIR}/manifest.json`;
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
};
export const timeline = () => buildTimeline(SCENES, loadManifest());
export const cues = (tl = timeline()) => buildCues(tl);
export const totalFrames = (tl = timeline()) => Math.ceil(tl.duration * FPS);
export { SCENES, FPS };
