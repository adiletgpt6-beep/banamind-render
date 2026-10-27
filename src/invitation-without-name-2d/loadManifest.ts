import { getStaticFiles, staticFile } from "remotion";
import { IW2_VIDEO } from "./script";
import { type Iw2Manifest } from "./timing";
import { requireIw2Manifest } from "./manifestGuard";

const MISSING = "Озвучка BalaGoInvitationWithoutName2D не создана. Рендер без голосов запрещён.";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadIw2Manifest = async (): Promise<Iw2Manifest> => {
  const path = `${IW2_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error(MISSING);
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error(MISSING);
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireIw2Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};
