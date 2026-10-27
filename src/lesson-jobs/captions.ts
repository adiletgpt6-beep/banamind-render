// Титры фильма «Стив Джобс» (BM-015) — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки этой книги: какие слова
// выделять и где редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json), тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const JOBS_CAPTIONS: CaptionBook = {
  accent: "#9fe3ff", // холодный «экранный» голубой: продукт, свет, стекло
  // важные слова (жёлтый): ключевые понятия разбора
  highlight: [
    "прост", "фокус", "лишн", "команд", "дизайн", "продукт", "забор", "обратн", "интеграци", "систем",
    "верси", "свидетел", "расход", "заслуг", "Возняк", "Айв", "Лассетер", "Аткинсон", "Каре", "Кук",
    "Фаделл", "Рубинштейн", "Джонсон", "провал", "магазин", "плеер", "экран", "стекл", "пульт", "кнопк",
    "Xerox", "Pixar", "NeXT", "Макинтош", "Скалли", "Марккул", "правд", "сожален", "грубо",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["=цена", "=цену", "=ценой", "=цены", "=выбор", "=выбрали", "=нет."],
  // здоровье и семья — выделяются цветом без увеличения и кинетики
  calm: ["опухол", "болезн", "печень", "операци", "дочь", "дочер", "Лиза"],
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "h01b", words: ["девяносто", "шесть"] },
    { line: "r02b", words: ["никто", "никогда"] },
    { line: "m05a", words: ["искажения", "реальности."] },
    { line: "m10c", words: ["непослушание."] },
    { line: "x03c", words: ["одинокий", "квадратик"] },
    { line: "v03c", words: ["сказать", "нет."] },
    { line: "s03c", words: ["тысяча", "песен"] },
    { line: "p07c", words: ["несовершенны,"] },
    { line: "e04b", words: ["обращаетесь", "с", "людьми,"] },
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
    JOBS_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
