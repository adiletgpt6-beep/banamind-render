// Титры фильма BM-034 «Игры, в которые играют люди» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const BERNE_CAPTIONS: CaptionBook = {
  accent: "#ff8f70", // коралловый «итог» монтажного стола
  highlight: [
    "родител", "взросл", "ребён", "ребен", "состояни", "трансакци", "стрелк", "уровн", "игр", "выигрыш", "антитезис",
    "поглаживан", "ритуал", "времяпрепровожден", "совет", "пауз", "тишин", "прощени", "помощ", "помочь",
    "берн", "=да,", "=но»", "интерпретац", "независимост", "включённост", "спонтанност", "близост",
  ],
  accentTerms: ["повтор", "итог", "финал", "наблюдени", "догадк", "уважени", "гипотез", "оригинальн"],
  calm: [],
  kinetic: [
    { line: "s01c", words: ["манипулятором?"] },
    { line: "s10a", words: ["возвращается."] },
    { line: "s26b", words: ["ничего"] },
    { line: "s30c", words: ["несоответствие"] },
    { line: "s39a", words: ["путать"] },
    { line: "s50b", words: ["повторение."] },
    { line: "s51b", words: ["меняется."] },
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
    BERNE_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
