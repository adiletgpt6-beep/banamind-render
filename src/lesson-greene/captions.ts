// Титры фильма BM-005 «48 законов власти» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки этой книги: какие слова
// выделять и где редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json), тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const GREENE_CAPTIONS: CaptionBook = {
  accent: "#c98a0b", // книга о власти — золото короны
  // важные слова (жёлтый): ключевые понятия и примеры книги
  highlight: [
    "власт", "репутац", "двор", "господин", "затмева", "эмоци", "терпени", "молчан", "пауз",
    "слух", "изоляц", "крепост", "финал", "концентр", "момент", "самооблад", "гнев",
    "щедрост", "фантаз", "слабост", "сердц", "зависть", "гибк", "вод", "ценност",
    "фуке", "людовик", "галиле", "кориолан", "микеландж", "чингисхан", "бисмарк", "ротшильд",
    "люстиг", "капоне", "брагадино", "фуше", "талейран", "наполеон",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["манипуляц", "аморальн", "приспособ", "угодничеств", "цинич"],
  calm: [],
  never: ["=власти?"],
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "g02a", words: ["арестовывает"] },
    { line: "g07c", words: ["одно", "солнце."] },
    { line: "g10d", words: ["собственный", "язык."] },
    { line: "g14d", words: ["репутация."] },
    { line: "g22d", words: ["признался."] },
    { line: "g26c", words: ["торопится."] },
    { line: "g35c", words: ["остановитесь"] },
    { line: "g41c", words: ["играть", "собой!"] },
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
    GREENE_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
