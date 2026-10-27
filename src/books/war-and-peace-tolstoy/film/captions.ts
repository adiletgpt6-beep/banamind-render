// Титры фильма «Война и мир: масштаб выбора» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки книги: слова для выделения,
// акцентный цвет и редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json); тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../../../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const WP_CAPTIONS: CaptionBook = {
  accent: "#ff9f6b", // тёплый свет свечи и зарево 1812 года
  // важные слова (жёлтый): герои, места и события романа
  highlight: [
    "=пьер", "=пьера", "=пьеру", "андре", "наташ", "=марья", "=марьи", "княжна", "николай", "николая", "=соня", "=сони", "каратаев",
    "кутузов", "наполеон", "долохов", "анатол", "=элен", "=петя", "=пети", "аустерлиц", "бородин", "=москва", "=москвы", "=москву", "толстой", "толстого",
    "=небо", "=неба", "=дуб", "плен", "эпилог",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["свобод", "необходимост", "истори", "решени", "случайн", "власт", "величи", "слав", "жалост", "зависимост"],
  calm: [],
  never: [],
  // сцены, где внизу важные подписи схемы: титры ниже
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [],
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
    WP_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
