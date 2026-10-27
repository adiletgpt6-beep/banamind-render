import { BG04_LINES, BG04_VIDEO } from "./script.ts";
import { buildBg04Timeline, checkBg04Timeline, type Bg04Manifest, type Bg04ManifestLine } from "./timing.ts";

type VoiceLine = Bg04ManifestLine & { readonly text?: string; readonly spoken?: string };

// Готовое видео требует всех реплик. Оценочные тайминги не заменяют звук.
export const requireBg04Manifest = (raw: unknown, files?: ReadonlySet<string>): Bg04Manifest => {
  if (!raw || typeof raw !== "object") throw new Error("Озвучка BalaGoBG004 не создана.");
  const data = raw as Bg04Manifest & { readonly partial?: boolean; readonly lines: readonly VoiceLine[] };
  if (data.version !== 1 || data.kind !== "bg004" || !Array.isArray(data.lines)) throw new Error("Неизвестный формат manifest.json.");
  if (data.partial || data.estimated) throw new Error("Озвучка BalaGoBG004 неполная. Финальный рендер остановлен.");
  const problems: string[] = [];
  for (const line of BG04_LINES) {
    const matches = data.lines.filter((ml) => ml?.id === line.id);
    const ml = matches[0];
    if (matches.length !== 1 || !ml.file) {
      problems.push(`${line.id}: нет единственной готовой реплики`);
      continue;
    }
    if (ml.text !== line.text || (ml.spoken ?? ml.text) !== (line.spoken ?? line.text)) problems.push(`${line.id}: текст устарел`);
    if (files && !files.has(`${BG04_VIDEO.voiceDir}/${ml.file}`)) problems.push(`${line.id}: нет MP3`);
    if (
      ![ml.speechStart, ml.speechEnd, ml.durationSec].every(Number.isFinite) ||
      ml.speechStart < 0 ||
      ml.speechEnd <= ml.speechStart ||
      ml.speechEnd > ml.durationSec + 0.02
    )
      problems.push(`${line.id}: некорректная длительность`);
    if (!ml.words?.length) problems.push(`${line.id}: нет фактических таймингов речи`);
  }
  if (problems.length) throw new Error(`Нет полной актуальной озвучки: ${problems.join("; ")}`);
  const timing = checkBg04Timeline(buildBg04Timeline(data));
  if (timing.length) throw new Error(`Речь не помещается в монтаж: ${timing.join("; ")}`);
  return data;
};
