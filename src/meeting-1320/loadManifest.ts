import { getStaticFiles, staticFile } from "remotion";
import { M13_VIDEO } from "./script";
import { estimateM13Manifest, type M13Manifest } from "./timing";
import { requireM13Manifest } from "./manifestGuard";

const MISSING = "Озвучка BalaGoMeeting1320 не создана. Рендер без голосов запрещён.";
const PATH = `${M13_VIDEO.voiceDir}/manifest.json`;

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadM13Manifest = async (): Promise<M13Manifest> => {
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === PATH)) throw new Error(MISSING);
  const res = await fetch(staticFile(PATH));
  if (res.status === 404) throw new Error(MISSING);
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireM13Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};

// Черновик (preview: true): готовые реплики, недостающие — по оценке.
// Помечается estimated — финальным роликом не считается.
export const loadM13PreviewManifest = async (): Promise<M13Manifest> => {
  const est = estimateM13Manifest();
  try {
    const res = await fetch(staticFile(PATH));
    if (!res.ok) return est;
    const data = (await res.json()) as M13Manifest;
    const ready = new Map(data.lines.filter((l) => l.file).map((l) => [l.id, l]));
    return { ...est, lines: est.lines.map((l) => ready.get(l.id) ?? l) };
  } catch {
    return est;
  }
};
