// Общие типы шкалы LESSON-80 (voice-first): манифест озвучки, реплика на
// шкале (Cue) и оценка длительности без озвучки. Сборка шкалы конкретного
// фильма (порядок реплик, паузы, действия) живёт в папке фильма
// (например, film-1-7/timeline.ts). Без зависимостей от Remotion.
import { FPS } from "./video.ts";
import type { L80Role } from "./roles.ts";

// Реплика любого фильма серии: текст (и вариант для TTS) достаточно, чтобы
// оценить длительность без озвучки.
export type L80LineLike = { readonly id: number; readonly text: string; readonly spoken?: string };

export type Word = { readonly text: string; readonly start: number; readonly end: number };
export type Char = { readonly c: string; readonly start: number; readonly end: number };

export type ManifestLine = {
  readonly id: number;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Word[];
  readonly chars?: readonly Char[];
  // громкость файла по кадрам (30 к/с) от начала файла, 0…1
  readonly env?: readonly number[];
};

export type Manifest = {
  readonly version: 1;
  readonly kind: "lesson80";
  readonly film: string;
  readonly estimated?: boolean;
  readonly partial?: boolean;
  readonly provider?: string;
  readonly lines: readonly ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка без озвучки: ≈ 13 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: L80LineLike): ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.12;
  const words: Word[] = [];
  const chars: Char[] = [];
  for (const w of tokens) {
    const letters = [...w.toLowerCase()].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.18, letters.length / 13);
    letters.forEach((c, i) => chars.push({ c, start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.!?…]$/.test(w) ? 0.35 : /[,—:;]$/.test(w) ? 0.2 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * FPS) }, (_, i) => {
    const s = (i + 0.5) / FPS;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.12, speechEnd: end, words, chars, env };
};

// Реплика на шкале фильма (абсолютные секунды).
export type Cue = {
  readonly id: number;
  readonly role: L80Role;
  readonly scene: number | string;
  readonly file?: string;
  readonly audioFrom: number; // начало файла
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly Word[];
  readonly chars: readonly Char[];
  readonly env: readonly number[]; // по кадрам от audioFrom
};

export type SceneSpan = { readonly id: number | string; readonly title?: string; readonly from: number; readonly to: number };

export type Timeline = {
  readonly cues: readonly Cue[];
  readonly scenes: readonly SceneSpan[];
  readonly durationSec: number;
  readonly durationInFrames: number;
};

export const EMPTY_TIMELINE: Timeline = { cues: [], scenes: [], durationSec: 10, durationInFrames: 300 };

