import { getStaticFiles, staticFile } from "remotion";
import { EL_LINES, EL_VIDEO } from "./script";
import { estimateElManifest, type ElManifest } from "./timing";
import { requireElManifest } from "./manifestGuard";

const MISSING = "Озвучка BalaGo34ExtraLine не создана. Рендер без голосов запрещён.";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadElManifest = async (): Promise<ElManifest> => {
  const path = `${EL_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error(MISSING);
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error(MISSING);
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireElManifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};

// Черновой просмотр (preview: true): готовые реплики — по фактическим
// таймингам, недостающие — по оценке текста. Только для кадров и Studio,
// финальный рендер всегда идёт через loadElManifest.
export const loadElPreviewManifest = async (): Promise<ElManifest> => {
  const path = `${EL_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const est = estimateElManifest();
  if (files.length > 0 && !files.some((f) => f.name === path)) return est;
  const res = await fetch(staticFile(path));
  if (!res.ok) return est;
  const raw = (await res.json()) as { kind?: string; lines?: ElManifest["lines"] };
  if (raw.kind !== "el34" || !Array.isArray(raw.lines)) return est;
  const have = new Set(files.map((f) => f.name));
  const ready = raw.lines.filter((l) => l.file && (!files.length || have.has(`${EL_VIDEO.voiceDir}/${l.file}`)));
  const lines = est.lines.map((e) => ready.find((l) => l.id === e.id) ?? e);
  return { version: 1, kind: "el34", estimated: ready.length < EL_LINES.length, lines };
};
