import { getStaticFiles, staticFile } from "remotion";
import { EM2_VIDEO } from "./script";
import { type Em2Manifest } from "./timing";
import { requireEm2Manifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadEm2Manifest = async (): Promise<Em2Manifest> => {
  const path = `${EM2_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка BalaGoElevenMinutes2D не создана. Рендер без голосов запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка BalaGoElevenMinutes2D не создана. Рендер без голосов запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireEm2Manifest(await res.json(), files.length ? new Set(files.map(f => f.name)) : undefined);
};
