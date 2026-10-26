import { BG34_LINES, BG34_VIDEO } from "./script.ts";
import {
  buildBg34Timeline,
  checkBg34Timeline,
  type Bg34Manifest,
  type Bg34ManifestLine,
} from "./timing.ts";

type VoiceLine = Bg34ManifestLine & {
  readonly text?: string;
  readonly spoken?: string;
};

// Готовое видео требует всех реплик. Оценочные тайминги не заменяют звук.
export const requireBg34Manifest = (
  raw: unknown,
  files?: ReadonlySet<string>,
): Bg34Manifest => {
  if (!raw || typeof raw !== "object")
    throw new Error("Озвучка BalaGoBG034 не создана.");
  const data = raw as Bg34Manifest & {
    readonly partial?: boolean;
    readonly lines: readonly VoiceLine[];
  };
  if (data.version !== 1 || data.kind !== "bg034" || !Array.isArray(data.lines))
    throw new Error("Неизвестный формат manifest.json.");
  if (data.partial || data.estimated)
    throw new Error(
      "Озвучка BalaGoBG034 неполная. Финальный рендер остановлен.",
    );
  const problems: string[] = [];
  for (const line of BG34_LINES) {
    const matches = data.lines.filter((ml) => ml?.id === line.id);
    const ml = matches[0];
    if (matches.length !== 1 || !ml.file) {
      problems.push(`${line.id}: нет единственной готовой реплики`);
      continue;
    }
    if (
      ml.text !== line.text ||
      (ml.spoken ?? ml.text) !== (line.spoken ?? line.text)
    )
      problems.push(`${line.id}: текст устарел`);
    if (files && !files.has(`${BG34_VIDEO.voiceDir}/${ml.file}`))
      problems.push(`${line.id}: нет MP3`);
    if (
      ![ml.speechStart, ml.speechEnd, ml.durationSec].every(Number.isFinite) ||
      ml.speechStart < 0 ||
      ml.speechEnd <= ml.speechStart ||
      ml.speechEnd > ml.durationSec + 0.02
    )
      problems.push(`${line.id}: некорректная длительность`);
    if (!ml.words?.length || !ml.chars?.length || !ml.env?.length)
      problems.push(`${line.id}: нет фактических таймингов речи`);
  }
  if (problems.length)
    throw new Error(`Нет полной актуальной озвучки: ${problems.join("; ")}`);
  const timing = checkBg34Timeline(buildBg34Timeline(data));
  if (timing.length) throw new Error(`Шкала ролика: ${timing.join("; ")}`);
  return data;
};
