// Титры фильма BM-023 «Богатый папа, бедный папа» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки книги: слова для выделения, акцентный цвет
// (мятный цвет «притока денег») и редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json); тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../../../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const RDDP_CAPTIONS: CaptionBook = {
  accent: "#5fe0b0",
  // важные слова (жёлтый): понятия книги
  highlight: [
    "актив", "пассив", "монет", "зарплат", "денежн", "поток", "расход", "доход", "налог", "корпорац",
    "навык", "продаж", "риск", "резерв", "запас", "долг", "кредит", "привычк", "страх", "желани",
    "=бизнес", "=бизнесом", "недвижимост", "грамотност", "опыт", "учёб", "обучени",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["выбор", "свобод", "интеллект", "самодисциплин"],
  calm: [],
  never: ["=доходы", "=расходы"],
  // сцены, где внизу важные подписи схемы: титры ниже
  lowScenes: { b04: 18, b05: 18, b06: 18, f04: 18, z01: 18 },
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "i02b", words: ["разным"] },
    { line: "a05c", words: ["«крысиными", "бегами»."] },
    { line: "b03b", words: ["приносит"] },
    { line: "b09a", words: ["пассив»."] },
    { line: "e05a", words: ["основную", "работу»."] },
    { line: "g03a", words: ["вариантов»."] },
    { line: "h02d", words: ["навык."] },
    { line: "k02c", words: ["«Бояться", "не", "стыдно»."] },
    { line: "m05c", words: ["согреешь!»"] },
    { line: "z05a", words: ["долларом"] },
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
    RDDP_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
