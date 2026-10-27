import { getStaticFiles, staticFile } from "remotion";
import type { BrandVoice } from "./cues";

// Бренд-реплика финала (public/audio/live04/brand.json). Без файла ролик
// собирается черновиком по оценке; финальный рендер в CI запускается
// с LIVE04_STRICT_VOICE=1 и проверкой verify (scripts/live04/verify.mjs).
export const loadLive04Brand = async (): Promise<BrandVoice | null> => {
  const path = "audio/live04/brand.json";
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) return null;
  const res = await fetch(staticFile(path));
  if (!res.ok) return null;
  const j = await res.json();
  return { durationSec: j.durationSec, speechStart: j.speechStart, speechEnd: j.speechEnd, words: j.words };
};
