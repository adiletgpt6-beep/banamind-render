// Общие функции скриптов BG-042: манифест озвучки и шкала ролика.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BG42_VIDEO } from "../../../src/campaign50/bg-042/script.ts";
import { buildTimeline, estimateManifest } from "../../../src/campaign50/bg-042/timeline.ts";

export const VOICE_DIR = join("public", BG42_VIDEO.voiceDir);
export const SFX_DIR = join("public", BG42_VIDEO.sfxDir);
export const MANIFEST = join(VOICE_DIR, "manifest.json");
export const ENTRY = "src/campaign50/bg-042/index.ts";
export const BUNDLE = "build/bg-042";

export const readManifest = () => (existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null);

// Шкала по готовой озвучке; без неё — по оценке (только черновые кадры).
export const timeline = (allowEstimate = false) => {
  const m = readManifest();
  if (!m || m.partial) {
    if (!allowEstimate) throw new Error("Нет полной озвучки BG-042 (manifest.json).");
    return buildTimeline(estimateManifest());
  }
  return buildTimeline({ lines: m.lines });
};

export const browserArgs = () =>
  process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
