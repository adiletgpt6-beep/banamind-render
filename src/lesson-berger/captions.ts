// Титры фильма BM-038 «Почему мы рассказываем?» (Йона Бергер «Заразительный») — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const BERGER_CAPTIONS: CaptionBook = {
  accent: "#ff8f70",
  highlight: [
    "валют", "триггер", "эмоци", "обществ", "наблюдаем", "ценност", "польз", "истори", "рекомендац", "делят", "делим", "переслал", "пересыла",
    "благоговени", "активаци", "видим", "секрет", "причастност", "бергер", "камер", "искр", "разговор",
  ],
  accentTerms: ["правд", "неправд", "фальшивк", "проверьте", "сбой", "ценная виральност", "ложн"],
  calm: [],
  kinetic: [
    { line: "s01b", words: ["погасла."] },
    { line: "s07b", words: ["всего"] },
    { line: "s12c", words: ["потайная"] },
    { line: "s21b", words: ["пятницы."] },
    { line: "s29c", words: ["огонь»."] },
    { line: "s38b", words: ["чаще."] },
    { line: "s43b", words: ["неправда:"] },
    { line: "s44c", words: ["рассказов."] },
    { line: "s50a", words: ["искрой."] },
    { line: "s53c", words: ["правда"] },
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
    BERGER_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
