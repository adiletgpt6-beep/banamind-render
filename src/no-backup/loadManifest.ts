import { getStaticFiles, staticFile } from "remotion";
import { NB_VIDEO } from "./script";
import { estimateNBManifest, type NBManifest } from "./timeline";

// manifest.json озвучки (scripts/generate-nb-voice.mjs). Нет озвучки —
// тайминги оцениваются по тексту (ролик без голоса).
export const loadNBManifest = async (): Promise<NBManifest> => {
  const path = `${NB_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) return estimateNBManifest();
  const res = await fetch(staticFile(path));
  if (res.status === 404) return estimateNBManifest();
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const data = (await res.json()) as NBManifest;
  if (data.version !== 1 || data.kind !== "no-backup") throw new Error("Неизвестный формат manifest.json озвучки.");
  return data;
};
