import { M13_LINES, M13_VIDEO } from "./script.ts";
import { buildM13Timeline, checkM13Timeline, type M13Manifest, type M13ManifestLine } from "./timing.ts";

type VoiceLine = M13ManifestLine & { readonly text?: string; readonly spoken?: string };

// Готовое видео требует всех реплик с фактическими таймингами. Оценочные
// тайминги не заменяют звук: без полной озвучки рендер останавливается.
export const requireM13Manifest = (raw: unknown, files?: ReadonlySet<string>): M13Manifest => {
  if (!raw || typeof raw !== "object") throw new Error("Озвучка BalaGoMeeting1320 не создана.");
  const data = raw as M13Manifest & { readonly partial?: boolean; readonly lines: readonly VoiceLine[] };
  if (data.version !== 1 || data.kind !== "m1320" || !Array.isArray(data.lines)) throw new Error("Неизвестный формат manifest.json.");
  if (data.partial || data.estimated) throw new Error("Озвучка BalaGoMeeting1320 неполная. Финальный рендер остановлен.");
  const problems: string[] = [];
  for (const line of M13_LINES) {
    const matches = data.lines.filter((ml) => ml?.id === line.id);
    const ml = matches[0];
    if (matches.length !== 1 || !ml.file) {
      problems.push(`${line.id}: нет единственной готовой реплики`);
      continue;
    }
    if (ml.text !== line.text || (ml.spoken ?? ml.text) !== (line.spoken ?? line.text)) problems.push(`${line.id}: текст устарел`);
    if (files && !files.has(`${M13_VIDEO.voiceDir}/${ml.file}`)) problems.push(`${line.id}: нет MP3`);
    if (
      ![ml.speechStart, ml.speechEnd, ml.durationSec].every(Number.isFinite) ||
      ml.speechStart < 0 ||
      ml.speechEnd <= ml.speechStart ||
      ml.speechEnd > ml.durationSec + 0.02
    )
      problems.push(`${line.id}: некорректная длительность`);
    if (!ml.words?.length || !ml.chars?.length || !ml.env?.length) problems.push(`${line.id}: нет фактических таймингов речи`);
  }
  if (problems.length) throw new Error(`Нет полной актуальной озвучки: ${problems.join("; ")}`);
  const timing = checkM13Timeline(buildM13Timeline(data));
  if (timing.length) throw new Error(`Речь не помещается в монтаж: ${timing.join("; ")}`);
  return data;
};
