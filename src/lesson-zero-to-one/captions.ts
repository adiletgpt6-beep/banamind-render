// Титры фильма BM-010 — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки книги: какие слова выделять
// и где редкая кинетическая типографика. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const ZERO_CAPTIONS: CaptionBook = {
  accent: "#7fd8ff", // книга о технологиях и будущем — холодный голубой акцент
  // важные слова (жёлтый): ключевые понятия книги
  highlight: [
    "копир", "конкурен", "монопол", "технолог", "рынок", "рынк", "секрет", "команд", "продаж", "план",
    "удач", "сооснов", "основател", "клиент", "уникальн", "лотерей", "фундамент", "миссия", "миссию",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["=нуля", "=единице", "=единицы", "=новое", "=нового", "=последний", "=десять", "=семь"],
  calm: [],
  never: ["=n", "=x"],
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "z01e", words: ["нуля", "единице."] },
    { line: "m02e", words: ["созидательной", "уникальностью."] },
    { line: "l04a", words: ["маленького", "рынка."] },
    { line: "p01d", words: ["лотерейный", "билет."] },
    { line: "s03d", words: ["никто", "ищет."] },
    { line: "d01c", words: ["частью"] },
    { line: "q05d", words: ["само."] },
  ],
};

export const buildCues = (tl: Timeline): Cue[] =>
  buildCaptionCues(
    tl.lines.map((l) => ({
      id: l.id,
      text: l.text,
      words: l.words,
      chars: l.chars,
      speechFrom: l.speechFrom,
      speechTo: l.speechTo,
      holdUntil: l.waitFrom !== undefined ? l.waitFrom - 0.3 : undefined,
    })),
    ZERO_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
