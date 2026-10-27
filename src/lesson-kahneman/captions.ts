// Титры фильма BM-004 «Думай медленно… решай быстро» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки этой книги: какие слова
// выделять и где редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json), тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const KAHNEMAN_CAPTIONS: CaptionBook = {
  accent: "#ff9a3d", // книга о двух системах — тёплый оранжевый «Системы 1»
  // важные слова (жёлтый): ключевые понятия и примеры книги
  highlight: [
    "систем", "интуиц", "якор", "привязк", "доступност", "базов", "частот", "выборк", "ореол",
    "регресс", "уверен", "прогноз", "формул", "рамк", "формулировк", "потер", "выигрыш", "риск",
    "владени", "воспомин", "памят", "=пик", "конец", "случайн", "удач", "премортем", "извне",
    "линда", "такси", "кассир", "библиотекар", "фермер", "горилл", "мяч", "бит",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["медленно", "быстро", "подмен", "ошиб", "иллюзи", "ловушк"],
  calm: [],
  never: ["=система"],
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "k02c", words: ["пять", "центов."] },
    { line: "k11b", words: ["одинаковые."] },
    { line: "k14a", words: ["подменяет"] },
    { line: "k19d", words: ["менее", "вероятной."] },
    { line: "k27d", words: ["ошибка", "планирования:"] },
    { line: "k30d", words: ["неприятие", "потерь."] },
    { line: "k37d", words: ["«пик", "конец»."] },
    { line: "k42c", words: ["медленно"] },
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
    KAHNEMAN_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
