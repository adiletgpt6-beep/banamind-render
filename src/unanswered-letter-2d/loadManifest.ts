import { getStaticFiles, staticFile } from "remotion";
import { UL2_VIDEO } from "./script";
import { type Ul2Manifest } from "./timing";
import { requireUl2Manifest } from "./manifestGuard";

// Нет полной актуальной озвучки — финальный рендер завершается ошибкой.
export const loadUl2Manifest = async (): Promise<Ul2Manifest> => {
  const path = `${UL2_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) throw new Error("Озвучка BalaGoUnansweredLetter2D не создана. Рендер без голосов запрещён.");
  const res = await fetch(staticFile(path));
  if (res.status === 404) throw new Error("Озвучка BalaGoUnansweredLetter2D не создана. Рендер без голосов запрещён.");
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  return requireUl2Manifest(await res.json(), files.length ? new Set(files.map(f => f.name)) : undefined);
};
