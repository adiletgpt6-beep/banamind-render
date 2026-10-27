// Титры фильма BM-037 «Двигатель прорыва» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const COLLINS_CAPTIONS: CaptionBook = {
  accent: "#ff7a59", // коралловый акцент «ясности»
  highlight: [
    "маховик", "толч", "направлени", "люд", "команд", "факт", "ясност", "круг", "ежа", "ёж", "еж", "лис",
    "дисциплин", "концепци", "лучшим", "лучшими", "страст", "технолог", "ускорител", "порочн", "рынок", "рынка", "рынку",
    "сравнени", "преемник", "прибыль", "стокдейл", "коллинз", "смит", "моклер", "максвелл", "вуртзел", "уолгрин", "крогер", "ньюкор",
  ],
  accentTerms: ["окно", "зеркал", "скромн", "воля", "волю", "сначала", "перестать", "прекратить", "вера", "веру", "понимани"],
  calm: [],
  kinetic: [
    { line: "c02c", words: ["остановить."] },
    { line: "s03a", words: ["великого»."] },
    { line: "l05a", words: ["зеркала."] },
    { line: "w01b", words: ["люди"] },
    { line: "f06b", words: ["сразу:"] },
    { line: "h05a", words: ["цель"] },
    { line: "d04a", words: ["прекратить"] },
    { line: "t04c", words: ["отставать"] },
    { line: "y01c", words: ["главным?"] },
    { line: "e05a", words: ["направлении."] },
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
    COLLINS_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
