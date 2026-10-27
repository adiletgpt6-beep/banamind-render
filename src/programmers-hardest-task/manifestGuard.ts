import { PHT_LINES, PHT_VIDEO } from "./script.ts";
import { checkPhtPlan, planPht, type PhtManifest, type PhtManifestLine } from "./timing.ts";

type VoiceLine = PhtManifestLine & { readonly text?: string; readonly spoken?: string };

// Готовый фильм требует всех реплик в актуальной редакции: оценочные
// тайминги не заменяют звук, рендер без голосов запрещён.
export const requirePhtManifest = (raw: unknown, files?: ReadonlySet<string>): PhtManifest => {
  if (!raw || typeof raw !== "object") throw new Error("Озвучка фильма №35 не создана.");
  const data = raw as PhtManifest & { readonly lines: readonly VoiceLine[] };
  if (data.version !== 1 || data.kind !== "pht" || !Array.isArray(data.lines)) throw new Error("Неизвестный формат manifest.json.");
  if (data.partial || data.estimated) throw new Error("Озвучка фильма №35 неполная. Финальный рендер остановлен.");
  const problems: string[] = [];
  for (const line of PHT_LINES) {
    const matches = data.lines.filter((ml) => ml?.id === line.id);
    const ml = matches[0];
    if (matches.length !== 1 || !ml.file) {
      problems.push(`${line.id}: нет единственной готовой реплики`);
      continue;
    }
    if (ml.text !== line.text || (ml.spoken ?? ml.text) !== (line.spoken ?? line.text)) problems.push(`${line.id}: текст устарел`);
    if (files && !files.has(`${PHT_VIDEO.voiceDir}/${ml.file}`)) problems.push(`${line.id}: нет MP3`);
    if (![ml.speechStart, ml.speechEnd, ml.durationSec].every(Number.isFinite) || ml.speechStart < 0 || ml.speechEnd <= ml.speechStart || ml.speechEnd > ml.durationSec + 0.02)
      problems.push(`${line.id}: некорректная длительность`);
    if (!ml.words?.length || !ml.chars?.length || !ml.env?.length) problems.push(`${line.id}: нет фактических таймингов речи`);
  }
  if (problems.length) throw new Error(`Нет полной актуальной озвучки: ${problems.join("; ")}`);
  const timing = checkPhtPlan(planPht(data));
  if (timing.length) throw new Error(`Монтаж по озвучке не сходится: ${timing.join("; ")}`);
  return data;
};
