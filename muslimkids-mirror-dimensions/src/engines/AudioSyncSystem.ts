// AudioSyncSystem: фактические тайминги озвучки (scripts/voice.py измеряет
// длительность каждой реплики и время ключевых слов по распознаванию речи).
// Визуальные события привязываются к этим числам, а не к «примерным» секундам.
import manifest from "../data/voice-manifest.json";

export type VoiceLine = {
  id: string;
  start: number;
  duration: number;
  end: number;
  text: string;
  keywords: Record<string, number | null>;
};

const LINES = manifest.lines as unknown as VoiceLine[];

export const voiceLines = LINES;

export const line = (id: string): VoiceLine => {
  const l = LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

/** Время слова в ролике (сек). Если распознавание слово не нашло — запасное значение. */
export const cue = (id: string, keyword: string, fallback: number): number =>
  line(id).keywords[keyword] ?? fallback;
