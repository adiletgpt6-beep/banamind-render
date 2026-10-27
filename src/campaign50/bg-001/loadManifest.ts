import { getStaticFiles, staticFile } from "remotion";
import { BG1_VIDEO } from "./script";
import { type Bg1Manifest } from "./timing";
import { requireBg1Manifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadBg1Manifest = async (): Promise<Bg1Manifest> => {
  const path = `${BG1_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка BalaGoBG001 не создана. Рендер без голосов запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка BalaGoBG001 не создана. Рендер без голосов запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireBg1Manifest(await res.json(), files.length ? new Set(files.map(f => f.name)) : undefined);
};
