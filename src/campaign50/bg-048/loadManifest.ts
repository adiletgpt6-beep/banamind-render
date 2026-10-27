import { getStaticFiles, staticFile } from "remotion";
import { requireB48Manifest } from "./manifestGuard";
import { B48_VIDEO } from "./script";
import { estimateB48Manifest, type B48Manifest } from "./timing";

const PATH = `${B48_VIDEO.voiceDir}/manifest.json`;

// strict — финальный рендер: нет полной актуальной озвучки → ошибка.
// Иначе (Studio, черновые кадры) — озвучка, если она уже есть, или оценка
// таймингов по тексту.
export const loadB48Manifest = async (strict: boolean): Promise<B48Manifest> => {
  const files = getStaticFiles();
  const known = files.length ? new Set(files.map((f) => f.name)) : undefined;
  if (known && !known.has(PATH)) {
    if (strict) throw new Error("Озвучка BalaGoBG048 не создана. Рендер без голосов запрещён.");
    return estimateB48Manifest();
  }
  const res = await fetch(staticFile(PATH));
  if (!res.ok) {
    if (strict) throw new Error(`Озвучка BalaGoBG048 не загружена: HTTP ${res.status}. Рендер без голосов запрещён.`);
    return estimateB48Manifest();
  }
  const raw = await res.json();
  if (strict) return requireB48Manifest(raw, known);
  try {
    return requireB48Manifest(raw, known);
  } catch (e) {
    console.warn(`Черновик: ${(e as Error).message} — используются оценочные тайминги для недостающих реплик.`);
    return { ...(raw as B48Manifest), estimated: true };
  }
};
