import { IW2_LINES, IW2_VIDEO } from "./script.ts";
import { buildIw2Timeline, checkIw2Timeline, type Iw2Manifest, type Iw2ManifestLine } from "./timing.ts";

type VoiceLine = Iw2ManifestLine & { readonly text?: string; readonly spoken?: string };

// Готовое видео требует всех реплик с фактическими таймингами. Оценочные
// тайминги не заменяют звук: без полной озвучки рендер останавливается.
export const requireIw2Manifest = (raw: unknown, files?: ReadonlySet<string>): Iw2Manifest => {
  if (!raw || typeof raw !== "object") throw new Error("Озвучка BalaGoInvitationWithoutName2D не создана.");
  const data = raw as Iw2Manifest & { readonly partial?: boolean; readonly lines: readonly VoiceLine[] };
  if (data.version !== 1 || data.kind !== "iw2d" || !Array.isArray(data.lines)) throw new Error("Неизвестный формат manifest.json.");
  if (data.partial || data.estimated) throw new Error("Озвучка BalaGoInvitationWithoutName2D неполная. Финальный рендер остановлен.");
  const problems: string[] = [];
  for (const line of IW2_LINES) {
    const matches = data.lines.filter((ml) => ml?.id === line.id);
    const ml = matches[0];
    if (matches.length !== 1 || !ml.file) {
      problems.push(`${line.id}: нет единственной готовой реплики`);
      continue;
    }
    if (ml.text !== line.text || (ml.spoken ?? ml.text) !== (line.spoken ?? line.text)) problems.push(`${line.id}: текст устарел`);
    if (files && !files.has(`${IW2_VIDEO.voiceDir}/${ml.file}`)) problems.push(`${line.id}: нет MP3`);
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
  const timing = checkIw2Timeline(buildIw2Timeline(data));
  if (timing.length) throw new Error(`Речь не помещается в монтаж: ${timing.join("; ")}`);
  return data;
};
