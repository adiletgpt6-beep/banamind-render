// Общие функции скриптов BG-016: манифест озвучки и шкала ролика.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BG016_VIDEO } from "../../../src/campaign50/bg-016/script.ts";
import { buildTimeline, estimateManifest } from "../../../src/campaign50/bg-016/timeline.ts";

export const VOICE_DIR = join("public", BG016_VIDEO.voiceDir);
export const MANIFEST = join(VOICE_DIR, "manifest.json");
export const ENTRY = "src/campaign50/bg-016/index.ts";
export const BUNDLE = "build/bg-016";

export const readManifest = () => (existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null);

// Шкала по готовой озвучке; без неё — по оценке (предпросмотр).
export const timeline = (allowEstimate = false) => {
  const m = readManifest();
  if (!m) {
    if (!allowEstimate) throw new Error("Нет озвучки BG-016 (manifest.json).");
    return buildTimeline(estimateManifest());
  }
  return buildTimeline({ lines: m.lines });
};

export const browserArgs = () =>
  process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
