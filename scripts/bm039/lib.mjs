// Общие данные для скриптов BM-039: сцены, озвучка, тайм-лайн, титры.
import { existsSync, readFileSync } from "node:fs";
import { SCENES } from "../../src/bm039-republic/script.ts";
import { buildTimeline, FPS } from "../../src/bm039-republic/timeline.ts";
import { buildCues } from "../../src/bm039-republic/captions.ts";

export const VOICE_DIR = "public/bm039-republic/voice";
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
