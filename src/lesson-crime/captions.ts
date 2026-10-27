// Титры фильма BM-016 — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const CRIME_CAPTIONS: CaptionBook = {
  accent: "#ffb38a", // тёплый «рассветный» акцент
  highlight: [
    "теори", "арифметик", "весы", "весах", "процент", "совест", "перешагн", "переступ", "необыкновенн", "обыкновенн",
    "наполеон", "порфири", "соня", "сони", "соне", "соню", "лужин", "свидригайлов", "разумихин", "дуня", "лизавет",
    "сибир", "каторг", "признани", "гордост", "=вошь", "бабочк", "свечк", "зеркал",
  ],
  accentTerms: ["воскрес", "человек", "любов", "страдани", "сострадани"],
  calm: ["бог", "евангели", "лазар", "крест"],
  kinetic: [
    { line: "c01b", words: ["посчитать"] },
    { line: "c15d", words: ["Арифметика»"] },
    { line: "c26b", words: ["бабочку"] },
    { line: "c41a", words: ["себя"] },
    { line: "c50c", words: ["воскрес,"] },
    { line: "c55b", words: ["остаётся."] },
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
    CRIME_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
