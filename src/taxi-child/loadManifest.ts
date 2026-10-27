import { getStaticFiles, staticFile } from "remotion";
import { TC_VIDEO } from "./script";
import { type TcManifest } from "./timing";
import { requireTcManifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
// allowEstimate (только контрольные кадры до озвучки, --props) — оценочная
// шкала без голоса.
export const loadTcManifest = async (
  allowEstimate: boolean,
): Promise<TcManifest | null> => {
  const path = `${TC_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing =
    "Озвучка TaxiChildLessonsOver не создана. Рендер без голоса запрещён.";
  if (files.length > 0 && !files.some((f) => f.name === path)) {
    if (allowEstimate) return null;
    throw new Error(missing);
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (allowEstimate) return null;
    throw new Error(missing);
  }
  if (!res.ok)
    throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  const names = files.length ? new Set(files.map((f) => f.name)) : undefined;
  if (!allowEstimate) return requireTcManifest(raw, names);
  // Контрольные кадры: устаревшая озвучка не мешает — оценочная шкала.
  try {
    return requireTcManifest(raw, names);
  } catch {
    return null;
  }
};
