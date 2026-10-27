import { getStaticFiles, staticFile } from "remotion";
import { WFH_VIDEO } from "./script";
import { estimateWfhManifest, type WfhManifest } from "./timing";
import { requireWfhManifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
// allowEstimate (только для черновых кадров): без голоса — оценка по тексту.
export const loadWfhManifest = async (allowEstimate = false): Promise<WfhManifest> => {
  const path = `${WFH_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = "Озвучка BalaGoWorkFromHome2D не создана. Рендер без голосов запрещён.";
  if (files.length > 0 && !files.some((f) => f.name === path)) {
    if (allowEstimate) return estimateWfhManifest();
    throw new Error(missing);
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (allowEstimate) return estimateWfhManifest();
    throw new Error(missing);
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  try {
    return requireWfhManifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
  } catch (e) {
    if (allowEstimate) return { ...estimateWfhManifest(), lines: estimateWfhManifest().lines.map((l) => raw.lines?.find((x: { id: string }) => x.id === l.id) ?? l) };
    throw e;
  }
};
