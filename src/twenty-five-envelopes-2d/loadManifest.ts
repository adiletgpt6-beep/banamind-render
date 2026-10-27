import { getStaticFiles, staticFile } from "remotion";
import { TE2_VIDEO } from "./script";
import { type Te2Manifest } from "./timing";
import { requireTe2Manifest } from "./manifestGuard";

const MISSING = "Озвучка BalaGoTwentyFiveEnvelopes2D не создана. Рендер без голосов запрещён.";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadTe2Manifest = async (): Promise<Te2Manifest> => {
  const path = `${TE2_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error(MISSING);
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error(MISSING);
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireTe2Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};
