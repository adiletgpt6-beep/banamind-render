import { getStaticFiles, staticFile } from "remotion";
import { requireBg27Manifest } from "./manifestGuard";
import { BG27_VIDEO } from "./script";
import { estimateBg27Manifest, type Bg27Manifest } from "./timing";

// Финальный рендер без полной актуальной озвучки завершается ошибкой.
// Черновые кадры (allowEstimate) можно собрать по оценочным таймингам.
export const loadBg27Manifest = async (allowEstimate: boolean): Promise<Bg27Manifest> => {
  const path = `${BG27_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (allowEstimate) return estimateBg27Manifest();
    throw new Error("Озвучка BalaGoBG027 не создана. Рендер без голосов запрещён.");
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (allowEstimate) return estimateBg27Manifest();
    throw new Error("Озвучка BalaGoBG027 не создана. Рендер без голосов запрещён.");
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (allowEstimate) {
    try {
      return requireBg27Manifest(raw);
    } catch {
      return estimateBg27Manifest();
    }
  }
  return requireBg27Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
