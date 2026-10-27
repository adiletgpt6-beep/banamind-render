import { getStaticFiles, staticFile } from "remotion";
import { requireBg38Manifest } from "./manifestGuard";
import { BG38_VIDEO } from "./script";
import { estimateBg38Manifest, type Bg38Manifest } from "./timing";

// Финальный рендер без полной актуальной озвучки завершается ошибкой.
// Черновые кадры (allowEstimate) можно собрать по оценочным таймингам.
export const loadBg38Manifest = async (allowEstimate: boolean): Promise<Bg38Manifest> => {
  const path = `${BG38_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (allowEstimate) return estimateBg38Manifest();
    throw new Error("Озвучка BalaGoBG038 не создана. Рендер без голосов запрещён.");
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (allowEstimate) return estimateBg38Manifest();
    throw new Error("Озвучка BalaGoBG038 не создана. Рендер без голосов запрещён.");
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (allowEstimate) {
    try {
      return requireBg38Manifest(raw);
    } catch {
      return estimateBg38Manifest();
    }
  }
  return requireBg38Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
