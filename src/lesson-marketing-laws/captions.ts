// Титры фильма BM-011 — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки книги: какие слова выделять
// и где редкая кинетическая типографика. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const LAWS_CAPTIONS: CaptionBook = {
  accent: "#ff9f6b", // книга о рынке и брендах — тёплый «вывесочный» оранжевый акцент
  // важные слова (жёлтый): ключевые понятия книги
  highlight: [
    "категори", "сознани", "восприят", "лестниц", "лидер", "атрибут", "бренд", "фокус", "жертв",
    "шумих", "тренд", "причуд", "ресурс", "честн", "противополож", "эго", "неудач", "покупател",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["=первым", "=лучшим", "=слово", "=словом", "=утро", "=рассвет", "=рассвета"],
  calm: [],
  never: ["=a-1"],
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "f01a", words: ["первым,", "лучшим."] },
    { line: "f04d", words: ["первый?»."] },
    { line: "w04a", words: ["одним", "словом"] },
    { line: "l04a", words: ["другим."] },
    { line: "d04c", words: ["везде»."] },
    { line: "t03d", words: ["честность"] },
    { line: "h02b", words: ["прилив:"] },
    { line: "x01b", words: ["терпения."] },
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
    LAWS_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
