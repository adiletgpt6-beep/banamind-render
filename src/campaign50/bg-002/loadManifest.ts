import { getStaticFiles, staticFile } from "remotion";
import { BG2_VIDEO } from "./script";
import { type Bg2Manifest } from "./timing";
import { requireBg2Manifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadBg2Manifest = async (): Promise<Bg2Manifest> => {
  const path = `${BG2_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка BG-002 не создана. Рендер без голосов запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка BG-002 не создана. Рендер без голосов запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireBg2Manifest(await res.json(), files.length ? new Set(files.map(f => f.name)) : undefined);
};
