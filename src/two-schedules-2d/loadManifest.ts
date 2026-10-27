import { getStaticFiles, staticFile } from "remotion";
import { TS2_VIDEO } from "./script";
import { type Ts2Manifest } from "./timing";
import { requireTs2Manifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadTs2Manifest = async (): Promise<Ts2Manifest> => {
  const path = `${TS2_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка BalaGoTwoSchedules2D не создана. Рендер без голосов запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка BalaGoTwoSchedules2D не создана. Рендер без голосов запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireTs2Manifest(await res.json(), files.length ? new Set(files.map(f => f.name)) : undefined);
};
