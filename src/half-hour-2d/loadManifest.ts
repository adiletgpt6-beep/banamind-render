import { getStaticFiles, staticFile } from "remotion";
import { HH2_VIDEO } from "./script";
import { estimateHh2Manifest, type Hh2Manifest } from "./timing";

// manifest.json озвучки (scripts/generate-hh2d-voice.mjs). Нет озвучки или
// она неполная — тайминги оцениваются по тексту (ролик без голоса).
export const loadHh2Manifest = async (): Promise<Hh2Manifest> => {
  const path = `${HH2_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) return estimateHh2Manifest();
  const res = await fetch(staticFile(path));
  if (res.status === 404) return estimateHh2Manifest();
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const data = (await res.json()) as Hh2Manifest & { partial?: boolean };
  if (data.version !== 1 || data.kind !== "hh2d") throw new Error("Неизвестный формат manifest.json.");
  if (data.partial) return estimateHh2Manifest();
  return data;
};
