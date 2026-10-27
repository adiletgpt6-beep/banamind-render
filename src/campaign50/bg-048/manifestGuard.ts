import { B48_LINES, B48_VIDEO } from "./script.ts";
import { buildB48Timeline, checkB48Timeline, type B48Manifest, type B48ManifestLine } from "./timing.ts";

type VoiceLine = B48ManifestLine & { readonly text?: string; readonly spoken?: string };

// Готовое видео требует всех реплик. Оценочные тайминги не заменяют звук.
export const requireB48Manifest = (raw: unknown, files?: ReadonlySet<string>): B48Manifest => {
  if (!raw || typeof raw !== "object") throw new Error("Озвучка BalaGoBG048 не создана.");
  const data = raw as B48Manifest & { readonly partial?: boolean; readonly lines: readonly VoiceLine[] };
  if (data.version !== 1 || data.kind !== "bg048" || !Array.isArray(data.lines)) throw new Error("Неизвестный формат manifest.json.");
  if (data.partial || data.estimated) throw new Error("Озвучка BalaGoBG048 неполная. Финальный рендер остановлен.");
  const problems: string[] = [];
  for (const line of B48_LINES) {
    const matches = data.lines.filter((ml) => ml?.id === line.id);
    const ml = matches[0];
    if (matches.length !== 1 || !ml.file) {
      problems.push(`${line.id}: нет единственной готовой реплики`);
      continue;
    }
    if (ml.text !== line.text || (ml.spoken ?? ml.text) !== (line.spoken ?? line.text)) problems.push(`${line.id}: текст устарел`);
    if (files && !files.has(`${B48_VIDEO.voiceDir}/${ml.file}`)) problems.push(`${line.id}: нет MP3`);
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
  const timing = checkB48Timeline(buildB48Timeline(data));
  if (timing.length) throw new Error(`Монтаж не сходится с речью: ${timing.join("; ")}`);
  return data;
};
