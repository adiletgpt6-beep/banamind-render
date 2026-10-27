import { getStaticFiles, staticFile } from "remotion";
import { SD2_VIDEO } from "./script";
import { estimateSd2Manifest, type Sd2Manifest } from "./timing";
import { requireSd2Manifest } from "./manifestGuard";

const MISSING = "Озвучка BalaGo36SuitcaseByTheDoor2D не создана. Рендер без голосов запрещён.";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadSd2Manifest = async (): Promise<Sd2Manifest> => {
  const path = `${SD2_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error(MISSING);
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error(MISSING);
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireSd2Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};

// Черновой просмотр (preview): готовые реплики — по фактическим таймингам,
// недостающие — по оценке текста. Для финального рендера не используется.
export const loadSd2ManifestLenient = async (): Promise<Sd2Manifest> => {
  try {
    const res = await fetch(staticFile(`${SD2_VIDEO.voiceDir}/manifest.json`));
    if (!res.ok) return estimateSd2Manifest();
    const data = (await res.json()) as Sd2Manifest;
    return { version: 1, kind: "sd2d", lines: data.lines.filter((l) => l.file) };
  } catch {
    return estimateSd2Manifest();
  }
};
