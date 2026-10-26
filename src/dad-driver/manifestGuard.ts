import { DD_LINES, DD_VIDEO } from "./script.ts";
import { checkDdTiming, type DdManifest, type DdManifestLine } from "./timing.ts";

type VoiceLine = DdManifestLine & { readonly text?: string; readonly spoken?: string; readonly voiceId?: string };

// Готовое видео требует всех реплик. Оценочные тайминги не заменяют звук.
export const requireDdManifest = (raw: unknown, files?: ReadonlySet<string>): DdManifest => {
  if (!raw || typeof raw !== "object") throw new Error("Озвучка BalaGo32DadDriver не создана.");
  const data = raw as DdManifest & { readonly lines: readonly VoiceLine[] };
  if (data.version !== 1 || data.kind !== "dd" || !Array.isArray(data.lines)) throw new Error("Неизвестный формат manifest.json.");
  if (data.partial || data.estimated) throw new Error("Озвучка BalaGo32DadDriver неполная. Финальный рендер остановлен.");
  const problems: string[] = [];
  for (const line of DD_LINES) {
    const matches = data.lines.filter((ml) => ml?.id === line.id);
    const ml = matches[0];
    if (matches.length !== 1 || !ml.file) {
      problems.push(`${line.id}: нет единственной готовой реплики`);
      continue;
    }
    if (ml.text !== line.text || (ml.spoken ?? ml.text) !== (line.spoken ?? line.text)) problems.push(`${line.id}: текст устарел`);
    if (files && !files.has(`${DD_VIDEO.voiceDir}/${ml.file}`)) problems.push(`${line.id}: нет MP3`);
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
  const timing = checkDdTiming(data);
  if (timing.length) throw new Error(`Шкала не сходится: ${timing.join("; ")}`);
  return data;
};
