import { getStaticFiles, staticFile } from "remotion";
import { B6_VIDEO } from "./script";
import { type B6Manifest } from "./timing";
import { requireB6Manifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadB6Manifest = async (): Promise<B6Manifest> => {
  const path = `${B6_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка BalaGoBG006 не создана. Рендер без голосов запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка BalaGoBG006 не создана. Рендер без голосов запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireB6Manifest(await res.json(), files.length ? new Set(files.map(f => f.name)) : undefined);
};
