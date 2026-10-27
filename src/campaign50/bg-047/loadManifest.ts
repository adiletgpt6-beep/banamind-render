import { getStaticFiles, staticFile } from "remotion";
import { requireBg47Manifest } from "./manifestGuard";
import { BG47_VIDEO } from "./script";
import { estimateBg47Manifest, type Bg47Manifest } from "./timing";

// Финальный рендер без полной актуальной озвучки завершается ошибкой.
// Черновые кадры (allowEstimate) можно собрать по оценочным таймингам.
export const loadBg47Manifest = async (allowEstimate: boolean): Promise<Bg47Manifest> => {
  const path = `${BG47_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (allowEstimate) return estimateBg47Manifest();
    throw new Error("Озвучка BalaGoBG047 не создана. Рендер без голосов запрещён.");
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (allowEstimate) return estimateBg47Manifest();
    throw new Error("Озвучка BalaGoBG047 не создана. Рендер без голосов запрещён.");
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (allowEstimate) {
    try {
      return requireBg47Manifest(raw);
    } catch {
      return estimateBg47Manifest();
    }
  }
  return requireBg47Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
