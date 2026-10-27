// Титры фильма «Sapiens» (BM-013) — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки этой книги: какие слова
// выделять и где редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json), тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const SAPIENS_CAPTIONS: CaptionBook = {
  accent: "#7fd6ea", // книга об острове-человечестве — морская бирюза
  // важные слова (жёлтый): ключевые понятия разбора
  highlight: [
    "доверя", "доверие", "доверия", "незнаком", "договорён", "сотруднич", "сплетн", "язык", "компани", "закон",
    "пшениц", "земледел", "ловушк", "роскош", "необходимост", "излишк", "письм", "табличк", "бухгалтер",
    "иерарх", "деньг", "денег", "монет", "каури", "империи", "империя", "развилк", "горизонт", "незнани",
    "карт", "энерги", "расписани", "семья", "общин", "государств", "рынок", "счасть", "ожидани", "смысл",
    "прогноз", "ответственност", "остров",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["=общая", "=общую", "=общие", "=общих", "=общими", "=цена", "=цену", "=ценой", "=заплатили"],
  // позиции о вере — выделяются цветом без увеличения и кинетики
  calm: ["религи", "=веры", "=вера", "=веру"],
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "h01c", words: ["хаос."] },
    { line: "c05d", words: ["договорённости."] },
    { line: "a01c", words: ["обманом"] },
    { line: "a02d", words: ["ловушкой,"] },
    { line: "u04b", words: ["доверия."] },
    { line: "s01a", words: ["не", "знаем."] },
    { line: "f03e", words: ["хотеть?"] },
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
    SAPIENS_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
