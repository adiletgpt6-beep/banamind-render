// Данные фильма BM-017 для скриптов Node (озвучка, звук, SRT) — без React.
// Используется scripts/books/film/*.mjs: node scripts/books/film/voice.mjs <этот файл>
import { existsSync, readFileSync } from "node:fs";
import { buildCues, cueText } from "./captions.ts";
import { FILM, SCENES, VOICE, VOICE_DIR } from "./script.ts";
import { buildTimeline, FPS } from "./timeline.ts";

export const TARGET: number | undefined = undefined; // пилот: без растяжки; полный фильм — 1800
export { buildCues, cueText, FILM, FPS, SCENES, VOICE, VOICE_DIR };

export const loadManifest = () => {
  const p = `${VOICE_DIR}/manifest.json`;
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
};
export const timeline = () => buildTimeline(SCENES, loadManifest(), TARGET);
