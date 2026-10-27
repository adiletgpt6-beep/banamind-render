import { getStaticFiles, staticFile } from "remotion";
import { B12_VIDEO } from "./script";
import { type B12Manifest } from "./timing";
import { requireB12Manifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadB12Manifest = async (): Promise<B12Manifest> => {
  const path = `${B12_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка BalaGoBG012 не создана. Рендер без голосов запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка BalaGoBG012 не создана. Рендер без голосов запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireB12Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};
