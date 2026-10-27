// Тайминги озвучки: manifest.json пишет tools/voice.mjs (ElevenLabs
// with-timestamps). Время слов — относительно начала файла реплики.
import manifest from "../public/audio/voice/manifest.json";
import { CONTENT, type Line } from "./content";

export type VoiceWord = { readonly text: string; readonly start: number; readonly end: number };
export type VoiceLine = { readonly id: string; readonly file: string; readonly duration: number; readonly words: readonly VoiceWord[]; readonly hash?: string };

const byId = new Map<string, VoiceLine>((manifest.lines as VoiceLine[]).map((l) => [l.id, l]));

export type Cue = { line: Line; voice: VoiceLine | null; from: number; to: number; words: VoiceWord[] };

// Без файла озвучки слова распределяются по оценке ~2,6 слова/с.
export const CUES: Cue[] = CONTENT.lines.map((line) => {
  const voice = byId.get(line.id) ?? null;
  const ws = line.text.split(/\s+/).filter(Boolean);
  const words = voice?.words.length
    ? voice.words.map((w) => ({ text: w.text, start: line.at + w.start, end: line.at + w.end }))
    : ws.map((w, i) => ({ text: w, start: line.at + i / 2.6, end: line.at + (i + 0.85) / 2.6 }));
  const to = voice ? line.at + voice.duration : words[words.length - 1]?.end ?? line.at;
  return { line, voice, from: line.at, to, words };
});

export const speechAt = (t: number) => CUES.some((c) => t >= c.from - 0.1 && t <= c.to + 0.15);
