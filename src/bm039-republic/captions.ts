// Титры фильма BM-039 «Государство» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки книги: словарь выделений,
// акцент и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const REPUBLIC_CAPTIONS: CaptionBook = {
  accent: "#7fd6ff", // «Государство» — холодный голубой акцент (свет из пещеры)
  highlight: [
    "справедлив", "несправедлив", "государств", "полис", "душ", "разум", "страж", "философ", "правител",
    "пещер", "тен", "солнц", "кольц", "сил", "закон", "свобод", "тиран", "демократ", "олигарх", "тимократ",
    "воспитан", "истин", "мнени", "поэт", "подражан", "миф", "выбор", "счасть", "вожделен", "ярост",
  ],
  accentTerms: ["=благо", "=блага", "=благу", "идея", "иде", "справедливость"],
  calm: ["бог", "богов", "богам", "боги"],
  never: [],
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "i1d", words: ["жить?"] },
    { line: "b1c2", words: ["сильнейшему."] },
    { line: "b2b3", words: ["исчез."] },
    { line: "b4c5", words: ["своим", "делом"] },
    { line: "b5d2", words: ["философы"] },
    { line: "b7a6", words: ["подобные", "нам."] },
    { line: "b7d2", words: ["повернуть"] },
    { line: "b8d1", words: ["рабство."] },
    { line: "b10e1", words: ["сами."] },
    { line: "e1d", words: ["перевешивает."] },
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
    REPUBLIC_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
