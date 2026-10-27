import { getStaticFiles, staticFile } from "remotion";
import { HH_VIDEO } from "./script";
import { estimateHHManifest, type HHManifest } from "./timeline";

// manifest.json озвучки (scripts/generate-hh-voice.mjs). Нет озвучки —
// тайминги оцениваются по тексту (ролик без голоса).
export const loadHHManifest = async (): Promise<HHManifest> => {
  const path = `${HH_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) return estimateHHManifest();
  const res = await fetch(staticFile(path));
  if (res.status === 404) return estimateHHManifest();
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const data = (await res.json()) as HHManifest;
  if (data.version !== 1 || data.kind !== "half-hour") throw new Error("Неизвестный формат manifest.json озвучки.");
  return data;
};
