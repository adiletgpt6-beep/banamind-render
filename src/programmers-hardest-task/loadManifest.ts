import { getStaticFiles, staticFile } from "remotion";
import { requirePhtManifest } from "./manifestGuard";
import { PHT_VIDEO } from "./script";
import type { PhtManifest } from "./timing";

// Нет полной актуальной озвучки — рендер завершается ошибкой.
export const loadPhtManifest = async (): Promise<PhtManifest> => {
  const path = `${PHT_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка фильма №35 не создана. Рендер без голосов запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка фильма №35 не создана. Рендер без голосов запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requirePhtManifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};
