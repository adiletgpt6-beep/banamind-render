import { getStaticFiles, staticFile } from "remotion";
import { BG13_VIDEO } from "./script";
import { type Bg13Manifest } from "./timing";
import { requireBg13Manifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadBg13Manifest = async (): Promise<Bg13Manifest> => {
  const path = `${BG13_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка BalaGoBG013 не создана. Рендер без голоса запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка BalaGoBG013 не создана. Рендер без голоса запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireBg13Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};
