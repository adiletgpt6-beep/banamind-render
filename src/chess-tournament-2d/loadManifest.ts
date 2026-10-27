import { getStaticFiles, staticFile } from "remotion";
import { CH2_VIDEO } from "./script";
import { type Ch2Manifest } from "./timing";
import { requireCh2Manifest } from "./manifestGuard";

const MISSING = "Озвучка BalaGoChessTournament2D не создана. Рендер без голосов запрещён.";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadCh2Manifest = async (): Promise<Ch2Manifest> => {
  const path = `${CH2_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error(MISSING);
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error(MISSING);
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireCh2Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};
