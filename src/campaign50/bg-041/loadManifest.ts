import { getStaticFiles, staticFile } from "remotion";
import { BG41_VIDEO } from "./script";
import { type Bg41Manifest } from "./timing";
import { requireBg41Manifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadBg41Manifest = async (): Promise<Bg41Manifest> => {
  const path = `${BG41_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка BalaGoBG041 не создана. Рендер без голоса запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка BalaGoBG041 не создана. Рендер без голоса запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireBg41Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};
