import { getStaticFiles, staticFile } from "remotion";
import { NY2_VIDEO } from "./script";
import { type Ny2Manifest } from "./timing";
import { requireNy2Manifest } from "./manifestGuard";

const MISSING = "Озвучка BalaGoNineYearOldEmployee2D не создана. Рендер без голосов запрещён.";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadNy2Manifest = async (): Promise<Ny2Manifest> => {
  const path = `${NY2_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error(MISSING);
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error(MISSING);
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireNy2Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};
