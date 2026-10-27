import { getStaticFiles, staticFile } from "remotion";
import { FU2_VIDEO } from "./script";
import { type Fu2Manifest } from "./timing";
import { requireFu2Manifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadFu2Manifest = async (): Promise<Fu2Manifest> => {
  const path = `${FU2_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка BalaGoFiveUnsentMessages2D не создана. Рендер без голосов запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка BalaGoFiveUnsentMessages2D не создана. Рендер без голосов запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireFu2Manifest(await res.json(), files.length ? new Set(files.map(f => f.name)) : undefined);
};
