import { getStaticFiles, staticFile } from "remotion";
import type { Manifest } from "../core/timing";
import { FILM, L80_LINES, lineFile } from "./script";

// Озвучка фильма: без полного актуального манифеста финальный рендер
// останавливается (оценочные тайминги не заменяют звук).
export const loadManifest = async (): Promise<Manifest> => {
  const path = `${FILM.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const names = new Set(files.map((f) => f.name));
  if (files.length > 0 && !names.has(path)) throw new Error("Озвучка Lesson80-1-11 не создана: нет public/lesson-80-1-11/audio/manifest.json. Рендер без голосов запрещён.");
  const res = await fetch(staticFile(path));
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  type Raw = Manifest & { readonly lines: readonly (Manifest["lines"][number] & { readonly text?: string })[] };
  const m = (await res.json()) as Raw;
  if (m.partial || m.estimated) throw new Error("Озвучка Lesson80-1-11 неполная. Финальный рендер остановлен.");
  const problems: string[] = [];
  for (const l of L80_LINES) {
    const ml = m.lines.filter((x) => x.id === l.id);
    if (ml.length !== 1 || !ml[0].file) {
      problems.push(`№${l.id}: нет готовой реплики`);
      continue;
    }
    const x = ml[0] as (typeof ml)[number] & { readonly text?: string };
    if (x.text !== l.text) problems.push(`№${l.id}: текст устарел`);
    if (files.length > 0 && !names.has(`${FILM.voiceDir}/${lineFile(l.id)}`)) problems.push(`№${l.id}: нет MP3`);
    if (!(x.speechEnd > x.speechStart && x.durationSec >= x.speechEnd - 0.02)) problems.push(`№${l.id}: некорректная длительность`);
    if (!x.words?.length || !x.env?.length) problems.push(`№${l.id}: нет таймингов речи`);
  }
  if (problems.length) throw new Error(`Нет полной актуальной озвучки: ${problems.join("; ")}`);
  return m;
};
