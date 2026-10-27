// Титры фильма BM-008 «Атомные привычки» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки этой книги: какие слова
// выделять и где редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json), тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const HABITS_CAPTIONS: CaptionBook = {
  accent: "#7ee0a8", // книга о росте маленьких шагов — мягкий зелёный акцент
  // важные слова (жёлтый): ключевые понятия книги
  highlight: [
    "привычк", "систем", "идентичн", "стимул", "желани", "реакци", "вознагражд", "очевидн", "привлекател",
    "прост", "приятн", "окружени", "сигнал", "трени", "повторени", "маленьк", "процент", "голос", "скук",
    "трекер", "дважды", "партнёр", "партнер", "договор", "мастерств", "плато", "разочаровани", "самоконтрол",
    "незаметн", "невидим", "трудн", "неприятн", "непривлекател", "племя", "цепочк", "скрепк", "наград",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["атомн", "=двух", "=минут", "закон"],
  calm: [],
  never: ["=просто", "=проще", "=приятнее", "=трудно", "=простая", "=простую"],
  // сцены, где внизу важные подписи схемы: титры ниже (px от низа кадра)
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "s01b", words: ["ноль,"] },
    { line: "s06a", words: ["тридцать", "семь", "раз"] },
    { line: "s08e", words: ["опускаемся"] },
    { line: "s11c", words: ["большинства."] },
    { line: "s13b", words: ["очевидным."] },
    { line: "s17e", words: ["архитектором."] },
    { line: "s30b", words: ["правило"] },
    { line: "s36b", words: ["пропускайте", "дважды."] },
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
    HABITS_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
