import { getStaticFiles, staticFile } from "remotion";
import { requireBg39Manifest } from "./manifestGuard";
import { BG39_VIDEO } from "./script";
import { estimateBg39Manifest, type Bg39Manifest } from "./timing";

// Финальный рендер без полной актуальной озвучки завершается ошибкой.
// Черновые кадры (allowEstimate) можно собрать по оценочным таймингам.
export const loadBg39Manifest = async (allowEstimate: boolean): Promise<Bg39Manifest> => {
  const path = `${BG39_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (allowEstimate) return estimateBg39Manifest();
    throw new Error("Озвучка BalaGoBG039 не создана. Рендер без голосов запрещён.");
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (allowEstimate) return estimateBg39Manifest();
    throw new Error("Озвучка BalaGoBG039 не создана. Рендер без голосов запрещён.");
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (allowEstimate) {
    try {
      return requireBg39Manifest(raw);
    } catch {
      return estimateBg39Manifest();
    }
  }
  return requireBg39Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
