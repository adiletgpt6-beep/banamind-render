import { getStaticFiles, staticFile } from "remotion";
import { T3B_VIDEO } from "./script";
import { type T3bManifest } from "./timing";
import { requireT3bManifest } from "./manifestGuard";

const MISSING = "Озвучка BalaGoThirdBMeeting2D не создана. Рендер без голосов запрещён.";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadT3bManifest = async (): Promise<T3bManifest> => {
  const path = `${T3B_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error(MISSING);
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error(MISSING);
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireT3bManifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};
