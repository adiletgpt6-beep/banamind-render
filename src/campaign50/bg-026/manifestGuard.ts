import { BG26_LINES, BG26_VIDEO } from "./script.ts";
import { buildBg26Timeline, checkBg26Timeline, type Bg26Manifest, type Bg26ManifestLine } from "./timing.ts";

type VoiceLine = Bg26ManifestLine & { readonly text?: string; readonly spoken?: string };

// Готовое видео требует всех реплик. Оценочные тайминги не заменяют звук.
export const requireBg26Manifest = (raw: unknown, files?: ReadonlySet<string>): Bg26Manifest => {
  if (!raw || typeof raw !== "object") throw new Error("Озвучка BalaGoBG026 не создана.");
  const data = raw as Bg26Manifest & { readonly partial?: boolean; readonly lines: readonly VoiceLine[] };
  if (data.version !== 1 || data.kind !== "bg026" || !Array.isArray(data.lines)) throw new Error("Неизвестный формат manifest.json.");
  if (data.partial || data.estimated) throw new Error("Озвучка BalaGoBG026 неполная. Финальный рендер остановлен.");
  const problems: string[] = [];
  for (const line of BG26_LINES) {
    const matches = data.lines.filter((ml) => ml?.id === line.id);
    const ml = matches[0];
    if (matches.length !== 1 || !ml.file) {
      problems.push(`${line.id}: нет единственной готовой реплики`);
      continue;
    }
    if (ml.text !== line.text || (ml.spoken ?? ml.text) !== (line.spoken ?? line.text)) problems.push(`${line.id}: текст устарел`);
    if (files && !files.has(`${BG26_VIDEO.voiceDir}/${ml.file}`)) problems.push(`${line.id}: нет MP3`);
    if (![ml.speechStart, ml.speechEnd, ml.durationSec].every(Number.isFinite) || ml.speechStart < 0 || ml.speechEnd <= ml.speechStart || ml.speechEnd > ml.durationSec + 0.02)
      problems.push(`${line.id}: некорректная длительность`);
    if (!ml.words?.length || !ml.chars?.length || !ml.env?.length) problems.push(`${line.id}: нет фактических таймингов речи`);
  }
  if (problems.length) throw new Error(`Нет полной актуальной озвучки: ${problems.join("; ")}`);
  const timing = checkBg26Timeline(buildBg26Timeline(data));
  if (timing.length) throw new Error(`Шкала ролика: ${timing.join("; ")}`);
  return data;
};
