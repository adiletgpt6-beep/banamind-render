import { getStaticFiles, staticFile } from "remotion";
import { L815_LINES, L815_VIDEO } from "./script";
import { estimateL815Manifest, type L815Manifest } from "./timing";

// Озвучка: public/audio/lesson-80-1-5/manifest.json. Без неё композиция
// собирается по оценочным таймингам (только для разработки); финальная
// проверка (scripts/verify-l815.mjs) требует полного манифеста.
export const loadL815Manifest = async (): Promise<L815Manifest> => {
  const path = `${L815_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) return estimateL815Manifest();
  const res = await fetch(staticFile(path));
  if (res.status === 404) return estimateL815Manifest();
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const m = (await res.json()) as L815Manifest;
  if (m.kind !== "lesson-80-1-5" || !Array.isArray(m.lines)) throw new Error("Неизвестный формат manifest.json.");
  if (m.partial || m.lines.length !== L815_LINES.length) throw new Error("Озвучка Lesson80_1_5 неполная.");
  return m;
};
