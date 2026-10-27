import { BG47_LINES, BG47_VIDEO } from "./script.ts";
import { buildBg47Timeline, checkBg47Timeline, type Bg47Manifest } from "./timing.ts";

// Готовое видео требует всех реплик с фактическими таймингами.
// Оценочные тайминги не заменяют звук.
export const requireBg47Manifest = (raw: unknown, files?: ReadonlySet<string>): Bg47Manifest => {
  if (!raw || typeof raw !== "object") throw new Error("Озвучка BalaGoBG047 не создана.");
  const data = raw as Bg47Manifest;
  if (data.version !== 1 || data.kind !== "bg047" || !Array.isArray(data.lines)) throw new Error("Неизвестный формат manifest.json.");
  if (data.partial || data.estimated) throw new Error("Озвучка BalaGoBG047 неполная. Финальный рендер остановлен.");
  const problems: string[] = [];
  for (const line of BG47_LINES) {
    const matches = data.lines.filter((ml) => ml?.id === line.id);
    const ml = matches[0];
    if (matches.length !== 1 || !ml.file) {
      problems.push(`${line.id}: нет единственной готовой реплики`);
      continue;
    }
    if (ml.text !== line.text || (ml.spoken ?? ml.text) !== (line.spoken ?? line.text)) problems.push(`${line.id}: текст устарел`);
    if (files && !files.has(`${BG47_VIDEO.voiceDir}/${ml.file}`)) problems.push(`${line.id}: нет MP3`);
    if (
      ![ml.speechStart, ml.speechEnd, ml.durationSec].every(Number.isFinite) ||
      ml.speechStart < 0 ||
      ml.speechEnd <= ml.speechStart ||
      ml.speechEnd > ml.durationSec + 0.02
    )
      problems.push(`${line.id}: некорректная длительность`);
    if (!ml.words?.length || !ml.env?.length) problems.push(`${line.id}: нет фактических таймингов речи`);
  }
  if (problems.length) throw new Error(`Нет полной актуальной озвучки: ${problems.join("; ")}`);
  const timing = checkBg47Timeline(buildBg47Timeline(data));
  if (timing.length) throw new Error(`Шкала не проходит проверку: ${timing.join("; ")}`);
  return data;
};
