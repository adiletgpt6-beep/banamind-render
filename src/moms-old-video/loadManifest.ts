import { getStaticFiles, staticFile } from "remotion";
import { MOV_VIDEO } from "./script";
import { estimateMovManifest, type MovManifest } from "./timing";
import { requireMovManifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
// MOV_PREVIEW=1 (только для черновых кадров и Studio) — оценочные тайминги.
export const loadMovManifest = async (preview: boolean): Promise<MovManifest> => {
  const path = `${MOV_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = () => {
    if (preview) return estimateMovManifest();
    throw new Error("Озвучка фильма №33 не создана. Рендер без голосов запрещён.");
  };
  if (files.length > 0 && !files.some((f) => f.name === path)) return missing();
  const res = await fetch(staticFile(path));
  if (res.status === 404) return missing();
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (preview) {
    try {
      return requireMovManifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      // черновой просмотр: готовые реплики берутся из файла, остальные — оценка
      const est = estimateMovManifest();
      const have = new Map((raw.lines ?? []).filter((l: { file?: string }) => l?.file).map((l: { id: string }) => [l.id, l]));
      return { ...est, lines: est.lines.map((l) => (have.get(l.id) as typeof l) ?? l) };
    }
  }
  return requireMovManifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
