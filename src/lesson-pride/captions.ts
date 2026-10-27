// Титры фильма BM-019 — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const PRIDE_CAPTIONS: CaptionBook = {
  accent: "#ff9aa8", // розовый акцент линзы Элизабет
  highlight: [
    "дарси", "элизабет", "уикхем", "джейн", "бингли", "шарлотт", "коллинз", "лидия", "лидию", "лидии", "кэтрин",
    "лонгборн", "пемберли", "письм", "впечатлени", "предубежд", "гордост", "уверенност", "провер", "линз",
  ],
  accentTerms: ["уважени", "достоинств", "доказательств", "ошиб"],
  calm: [],
  kinetic: [
    { line: "p01b", words: ["характере?"] },
    { line: "p20c", words: ["«нет»"] },
    { line: "p35c", words: ["себя»."] },
    { line: "p45d", words: ["объявляют."] },
    { line: "p49c", words: ["свободным."] },
    { line: "p53b", words: ["доказательство."] },
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
    PRIDE_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
