import { getStaticFiles, staticFile } from "remotion";
import { BG32_VIDEO } from "./script";
import { type Bg32Manifest } from "./timing";
import { requireBg32Manifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadBg32Manifest = async (): Promise<Bg32Manifest> => {
  const path = `${BG32_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка BalaGoBG032 не создана. Рендер без голоса запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка BalaGoBG032 не создана. Рендер без голоса запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireBg32Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};
