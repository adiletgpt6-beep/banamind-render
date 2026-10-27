import { getStaticFiles, staticFile } from "remotion";
import { requireBg19Manifest } from "./manifestGuard";
import { BG19_VIDEO } from "./script";
import { estimateBg19Manifest, type Bg19Manifest } from "./timing";

// Финальный рендер без полной актуальной озвучки завершается ошибкой.
// Черновые кадры (allowEstimate) можно собрать по оценочным таймингам.
export const loadBg19Manifest = async (allowEstimate: boolean): Promise<Bg19Manifest> => {
  const path = `${BG19_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (allowEstimate) return estimateBg19Manifest();
    throw new Error("Озвучка BalaGoBG019 не создана. Рендер без голосов запрещён.");
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (allowEstimate) return estimateBg19Manifest();
    throw new Error("Озвучка BalaGoBG019 не создана. Рендер без голосов запрещён.");
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (allowEstimate) {
    try {
      return requireBg19Manifest(raw);
    } catch {
      return estimateBg19Manifest();
    }
  }
  return requireBg19Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
