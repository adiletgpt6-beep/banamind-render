import { CH2_LINES, CH2_VIDEO } from "./script.ts";
import { buildCh2Timeline, checkCh2Timeline, type Ch2Manifest, type Ch2ManifestLine } from "./timing.ts";

type VoiceLine = Ch2ManifestLine & { readonly text?: string; readonly spoken?: string };

// Готовое видео требует всех реплик с фактическими таймингами. Оценочные
// тайминги не заменяют звук: без полной озвучки рендер останавливается.
export const requireCh2Manifest = (raw: unknown, files?: ReadonlySet<string>): Ch2Manifest => {
  if (!raw || typeof raw !== "object") throw new Error("Озвучка BalaGoChessTournament2D не создана.");
  const data = raw as Ch2Manifest & { readonly partial?: boolean; readonly lines: readonly VoiceLine[] };
  if (data.version !== 1 || data.kind !== "ch2d" || !Array.isArray(data.lines)) throw new Error("Неизвестный формат manifest.json.");
  if (data.partial || data.estimated) throw new Error("Озвучка BalaGoChessTournament2D неполная. Финальный рендер остановлен.");
  const problems: string[] = [];
  for (const line of CH2_LINES) {
    const matches = data.lines.filter((ml) => ml?.id === line.id);
    const ml = matches[0];
    if (matches.length !== 1 || !ml.file) {
      problems.push(`${line.id}: нет единственной готовой реплики`);
      continue;
    }
    if (ml.text !== line.text || (ml.spoken ?? ml.text) !== (line.spoken ?? line.text)) problems.push(`${line.id}: текст устарел`);
    if (files && !files.has(`${CH2_VIDEO.voiceDir}/${ml.file}`)) problems.push(`${line.id}: нет MP3`);
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
  const timing = checkCh2Timeline(buildCh2Timeline(data));
  if (timing.length) throw new Error(`Речь не помещается в монтаж: ${timing.join("; ")}`);
  return data;
};
