import { getStaticFiles, staticFile } from "remotion";
import { SU2_VIDEO } from "./script";
import { estimateSu2Manifest, type Su2Manifest } from "./timing";
import { requireSu2Manifest } from "./manifestGuard";

const MISSING = "Озвучка BalaGoTwoSundays2D не создана. Рендер без голосов запрещён.";
const PATH = `${SU2_VIDEO.voiceDir}/manifest.json`;

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadSu2Manifest = async (): Promise<Su2Manifest> => {
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === PATH)) throw new Error(MISSING);
  const res = await fetch(staticFile(PATH));
  if (res.status === 404) throw new Error(MISSING);
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireSu2Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};

// Черновик (preview: true): готовые реплики, недостающие — по оценке.
// Помечается estimated — финальным роликом не считается.
export const loadSu2PreviewManifest = async (): Promise<Su2Manifest> => {
  const est = estimateSu2Manifest();
  try {
    const res = await fetch(staticFile(PATH));
    if (!res.ok) return est;
    const data = (await res.json()) as Su2Manifest;
    const ready = new Map(data.lines.filter((l) => l.file).map((l) => [l.id, l]));
    return { ...est, lines: est.lines.map((l) => ready.get(l.id) ?? l) };
  } catch {
    return est;
  }
};
