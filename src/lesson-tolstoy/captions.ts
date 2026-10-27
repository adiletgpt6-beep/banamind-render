// Титры фильма по «Войне и миру» Л. Н. Толстого (BM-030) — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки этой книги: какие слова
// выделять и где редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json), тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const TOLSTOY_CAPTIONS: CaptionBook = {
  accent: "#e8b860", // золото карты «Масштаб выбора»
  // важные слова (жёлтый): ключевые понятия маршрута
  highlight: [
    "слав", "деньг", "наследств", "выбор", "свобод", "необходимост", "истори", "власт", "план", "приказ",
    "небо", "неба", "дуб", "плен", "долг", "решени", "причин", "случа", "смысл", "жизн",
    "мир", "войн", "сражени", "отступлени", "москв", "стрел", "точк", "простот", "правд", "терпени",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["=карта", "=карты", "=карте", "=карту", "=толстой", "=толстого", "=толстому"],
  calm: [],
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "i01a", words: ["один", "человек,"] },
    { line: "s05a", words: ["слава", "и", "деньги."] },
    { line: "a04b", words: ["высокого", "неба?"] },
    { line: "a07c", words: ["жизнь", "не", "кончена"] },
    { line: "p03a", words: ["главный", "винт,"] },
    { line: "n08a", words: ["не", "была", "к", "нему", "готова:"] },
    { line: "b03a", words: ["ни", "один", "пункт"] },
    { line: "m04b", words: ["«Москва", "сожжена", "жителями,"] },
    { line: "c04b", words: ["бессмертную", "душу!»"] },
    { line: "h02b", words: ["конус:"] },
    { line: "z03b", words: ["дело", "есть", "у", "каждого."] },
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
      // карточка вопроса появляется в паузе — титр к этому моменту уже ушёл
      holdUntil: l.waitFrom !== undefined ? l.waitFrom - 0.3 : undefined,
    })),
    TOLSTOY_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
