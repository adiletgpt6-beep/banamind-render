// Титры фильма «Краткая история времени» (BM-014) — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки этой книги: какие слова
// выделять и где редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json), тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const HAWKING_CAPTIONS: CaptionBook = {
  accent: "#ffad42", // книга о звёздах и времени — тёплый янтарь звёздного света
  // важные слова (жёлтый): ключевые понятия разбора
  highlight: [
    "часы", "часов", "время", "времени", "свет", "скорост", "теори", "модел", "гипотез", "наблюден", "провер",
    "гравитац", "искривлен", "пространств", "конус", "галактик", "расширя", "расширени", "спектр", "красн",
    "сингулярн", "неопределённ", "вероятност", "щел", "кварк", "сил", "протон", "горизонт", "энтропи",
    "беспорядк", "стрел", "памят", "излучени", "квантов", "граница", "ошибся", "ошибк",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["=чёрная", "=чёрной", "=чёрные", "=чёрных", "=чёрную", "=дыра", "=дыры", "=дыру", "=дыре", "=дыр"],
  // вопросы веры и философии — выделяются цветом без увеличения и кинетики
  calm: ["=создателя", "=творце", "=творца", "=вере", "=веры"],
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "h01c", words: ["разойдутся."] },
    { line: "m06c", words: ["опровергнуть"] },
    { line: "l03b", words: ["разницы."] },
    { line: "l09d", words: ["разгадка"] },
    { line: "e03a", words: ["удаляются"] },
    { line: "q03b", words: ["по", "одному."] },
    { line: "b03b", words: ["свет"] },
    { line: "b10a", words: ["излучать,"] },
    { line: "a02c", words: ["растёт:"] },
    { line: "a07b", words: ["ошибся."] },
    { line: "z03b", words: ["граница"] },
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
    HAWKING_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
