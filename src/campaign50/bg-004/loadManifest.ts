import { getStaticFiles, staticFile } from "remotion";
import { BG04_VIDEO } from "./script";
import { type Bg04Manifest } from "./timing";
import { requireBg04Manifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadBg04Manifest = async (): Promise<Bg04Manifest> => {
  const path = `${BG04_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка BalaGoBG004 не создана. Рендер без голоса запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка BalaGoBG004 не создана. Рендер без голоса запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireBg04Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};
