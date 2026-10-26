import { getStaticFiles, staticFile } from "remotion";
import { DD_VIDEO } from "./script";
import { estimateDdManifest, type DdManifest } from "./timing";
import { requireDdManifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
// Только для разработки (контрольные кадры до синтеза) можно явно
// разрешить оценочные тайминги: --props='{"allowEstimate":true}'.
export const loadDdManifest = async (allowEstimate = false): Promise<DdManifest> => {
  const path = `${DD_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (allowEstimate) return estimateDdManifest();
    throw new Error("Озвучка BalaGo32DadDriver не создана. Рендер без голосов запрещён.");
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (allowEstimate) return estimateDdManifest();
    throw new Error("Озвучка BalaGo32DadDriver не создана. Рендер без голосов запрещён.");
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (allowEstimate && (raw?.partial || raw?.estimated)) return estimateDdManifest();
  return requireDdManifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
