import { TC_LINES, TC_VIDEO } from "./script.ts";
import {
  checkTcTiming,
  type TcManifest,
  type TcManifestLine,
} from "./timing.ts";

type VoiceLine = TcManifestLine & {
  readonly text?: string;
  readonly spoken?: string;
};

// Готовое видео требует всех реплик диктора. Оценочные тайминги не заменяют звук.
export const requireTcManifest = (
  raw: unknown,
  files?: ReadonlySet<string>,
): TcManifest => {
  if (!raw || typeof raw !== "object")
    throw new Error("Озвучка TaxiChildLessonsOver не создана.");
  const data = raw as TcManifest & {
    readonly partial?: boolean;
    readonly lines: readonly VoiceLine[];
  };
  if (
    data.version !== 1 ||
    data.kind !== "taxi-child" ||
    !Array.isArray(data.lines)
  )
    throw new Error("Неизвестный формат manifest.json.");
  if (data.partial || data.estimated)
    throw new Error(
      "Озвучка TaxiChildLessonsOver неполная. Финальный рендер остановлен.",
    );
  const problems: string[] = [];
  for (const line of TC_LINES) {
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
    if (files && !files.has(`${TC_VIDEO.voiceDir}/${ml.file}`))
      problems.push(`${line.id}: нет MP3`);
    if (
      ![ml.speechStart, ml.speechEnd, ml.durationSec].every(Number.isFinite) ||
      ml.speechStart < 0 ||
      ml.speechEnd <= ml.speechStart ||
      ml.speechEnd > ml.durationSec + 0.02
    )
      problems.push(`${line.id}: некорректная длительность`);
    if (!ml.words?.length)
      problems.push(`${line.id}: нет фактических таймингов слов`);
  }
  if (problems.length)
    throw new Error(`Нет полной актуальной озвучки: ${problems.join("; ")}`);
  const timing = checkTcTiming(data.lines);
  if (timing.length)
    throw new Error(`Речь не помещается в монтаж: ${timing.join("; ")}`);
  return data;
};
