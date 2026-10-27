import { getStaticFiles, staticFile } from "remotion";
import { BG020_LINES, BG020_VIDEO } from "./script";
import { buildBg020Timeline, checkBg020Timeline, estimateBg020Manifest, type Bg020Manifest } from "./timeline";

// Готовое видео требует полной актуальной озвучки. Оценочные тайминги —
// только для черновых кадров (allowEstimate), финальный рендер без голоса
// завершается ошибкой.
export const requireBg020Manifest = (raw: unknown, files?: ReadonlySet<string>): Bg020Manifest => {
  if (!raw || typeof raw !== "object") throw new Error("Озвучка BalaGoBG020 не создана.");
  const data = raw as Bg020Manifest;
  if (data.version !== 1 || data.kind !== "bg020" || !Array.isArray(data.lines)) throw new Error("Неизвестный формат manifest.json.");
  if (data.partial || data.estimated) throw new Error("Озвучка BalaGoBG020 неполная.");
  const problems: string[] = [];
  for (const line of BG020_LINES) {
    const matches = data.lines.filter((ml) => ml?.id === line.id);
    const ml = matches[0];
    if (matches.length !== 1 || !ml.file) {
      problems.push(`${line.id}: нет готовой реплики`);
      continue;
    }
    if (ml.text !== line.text || (ml.spoken ?? ml.text) !== (line.spoken ?? line.text)) problems.push(`${line.id}: текст устарел`);
    if (files && !files.has(`${BG020_VIDEO.voiceDir}/${ml.file}`)) problems.push(`${line.id}: нет MP3`);
    if (!ml.words?.length || !ml.chars?.length || !ml.env?.length) problems.push(`${line.id}: нет таймингов речи`);
  }
  if (problems.length) throw new Error(`Нет полной актуальной озвучки: ${problems.join("; ")}`);
  const timing = checkBg020Timeline(buildBg020Timeline(data));
  if (timing.length) throw new Error(`Шкала не прошла проверку: ${timing.join("; ")}`);
  return data;
};

export const loadBg020Manifest = async (allowEstimate: boolean): Promise<Bg020Manifest> => {
  const path = `${BG020_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (allowEstimate) return estimateBg020Manifest();
    throw new Error("Озвучка BalaGoBG020 не создана. Рендер без голосов запрещён.");
  }
  const res = await fetch(staticFile(path));
  if (!res.ok) {
    if (allowEstimate) return estimateBg020Manifest();
    throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  }
  return requireBg020Manifest(await res.json(), files.length ? new Set(files.map((f) => f.name)) : undefined);
};
