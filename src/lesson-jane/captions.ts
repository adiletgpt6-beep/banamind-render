// Титры фильма BM-032 — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const JANE_CAPTIONS: CaptionBook = {
  accent: "#ffb84d", // тёплое золото «огонька голоса» Джейн
  highlight: [
    "джейн", "рочестер", "сент-джон", "хелен", "броклхерст", "темпл", "=рид", "бланш", "берт", "адел",
    "гейтсхед", "ловуд", "тернфилд", "мур-хаус", "ферндин", "уайткросс", "мортон", "бронте",
    "голос", "правд", "услови", "цен", "свобод", "равн", "долг",
  ],
  accentTerms: ["уважать себя", "достоинств", "независим", "собственн", "совест"],
  calm: ["=бог", "=бога", "=богу", "=богом"],
  kinetic: [
    { line: "j01c", words: ["заплатить."] },
    { line: "j10b", words: ["правда»."] },
    { line: "j21b", words: ["свободы»,"] },
    { line: "j29c", words: ["нет."] },
    { line: "j37b", words: ["равны!»"] },
    { line: "j47b", words: ["себя»."] },
    { line: "j57d", words: ["никогда!»"] },
    { line: "j59a", words: ["Джейн!»"] },
    { line: "j67a", words: ["решает"] },
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
    JANE_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
