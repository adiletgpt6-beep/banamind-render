import { getStaticFiles, staticFile } from "remotion";
import { B17_VIDEO } from "./script";
import { type B17Manifest } from "./timing";
import { requireB17Manifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadB17Manifest = async (): Promise<B17Manifest> => {
  const path = `${B17_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка BalaGoBG017 не создана. Рендер без голосов запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка BalaGoBG017 не создана. Рендер без голосов запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireB17Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};
