import { getStaticFiles, staticFile } from "remotion";
import { requireBg40Manifest } from "./manifestGuard";
import { BG40_VIDEO } from "./script";
import { estimateBg40Manifest, type Bg40Manifest } from "./timing";

// Финальный рендер без полной актуальной озвучки завершается ошибкой.
// Черновые кадры (allowEstimate) можно собрать по оценочным таймингам.
export const loadBg40Manifest = async (allowEstimate: boolean): Promise<Bg40Manifest> => {
  const path = `${BG40_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (allowEstimate) return estimateBg40Manifest();
    throw new Error("Озвучка BalaGoBG040 не создана. Рендер без голосов запрещён.");
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (allowEstimate) return estimateBg40Manifest();
    throw new Error("Озвучка BalaGoBG040 не создана. Рендер без голосов запрещён.");
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (allowEstimate) {
    try {
      return requireBg40Manifest(raw);
    } catch {
      return estimateBg40Manifest();
    }
  }
  return requireBg40Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
