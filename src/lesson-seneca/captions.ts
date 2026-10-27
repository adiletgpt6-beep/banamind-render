// Титры фильма BM-026 (Сенека) — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const SENECA_CAPTIONS: CaptionBook = {
  accent: "#5fd4c8", // бирюзовый акцент Мастерской: выбранное, ясное
  highlight: [
    "сенек", "луцили", "эпикур", "мастерск", "коробк", "письм",
    "время", "времени", "внимани", "толп", "одобрени", "довольно", "достат", "страх", "факт", "предполож",
    "друг", "дружб", "доверя", "достоинств", "шум", "покой", "наставлени", "основ", "разум",
  ],
  accentTerms: ["благо", "свобод", "поступ", "выбор"],
  calm: [],
  kinetic: [
    { line: "s02b", words: ["извне?"] },
    { line: "s08b", words: ["наше."] },
    { line: "s12b", words: ["нигде»."] },
    { line: "s24b", words: ["действительность»."] },
    { line: "s31a", words: ["довольно»."] },
    { line: "s42b", words: ["добровольного.»"] },
    { line: "s56b", words: ["подчиненная»."] },
    { line: "s62c", words: ["себе."] },
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
    SENECA_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
