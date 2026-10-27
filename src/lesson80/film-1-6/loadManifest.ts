import { getStaticFiles, staticFile } from "remotion";
import { estimateManifest, type Manifest } from "../core/timing";
import { FILM, LINES } from "./script";

// Озвучка фильма из public/lesson-80-1-6/audio/manifest.json. Без полной
// озвучки используется оценка по тексту (Studio); финальный рендер проверяет
// файл отдельно (scripts/lesson80-1-6.test.mjs, L80_STRICT_VOICE=1).
export const loadManifest = async (): Promise<Manifest> => {
  const path = `${FILM.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) return estimateManifest();
  const res = await fetch(staticFile(path));
  if (!res.ok) return estimateManifest();
  const data = (await res.json()) as Manifest;
  if (data.kind !== "lesson80" || data.partial || data.lines.length !== LINES.length) throw new Error("Озвучка LESSON-80-1-6 неполная: запустите npm run audio:voice:lesson-80-1-6");
  return data;
};
