// Титры фильма BM-033 («Дракула») — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const DRACULA_CAPTIONS: CaptionBook = {
  accent: "#ffb547", // янтарный свет рукописи против синей ночи
  highlight: [
    "харкер", "джонатан", "=мина", "=мины", "=мине", "=мину", "=миной", "люси", "сьюард", "хельсинг", "квинси", "артур", "рэнфилд",
    "дневник", "запис", "письм", "телеграм", "газет", "фонограф", "машинк", "стенограф", "папк", "копи",
    "замок", "замк", "ящик", "бюро",
  ],
  accentTerms: ["доказательств", "свидетельств", "довери", "проверк", "проверя", "=вместе", "поодиночке", "знани"],
  calm: [],
  kinetic: [
    { line: "d02b", words: ["верит?"] },
    { line: "d09a", words: ["здравый", "смысл"] },
    { line: "d21b", words: ["почерк"] },
    { line: "d35b", words: ["толкование."] },
    { line: "d42c", words: ["общую", "память."] },
    { line: "d51b", words: ["Поодиночке."] },
    { line: "d56c", words: ["записка."] },
    { line: "d59b", words: ["архивом."] },
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
    DRACULA_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
