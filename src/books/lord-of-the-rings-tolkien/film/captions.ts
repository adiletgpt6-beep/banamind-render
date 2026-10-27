// Титры фильма «Властелин колец» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки книги: слова для выделения,
// акцентный цвет и редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json); тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../../../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const LOTR_CAPTIONS: CaptionBook = {
  accent: "#ffb25e", // золото Кольца
  // важные слова (жёлтый): герои и предметы
  highlight: [
    "кольц", "=фродо", "=сэм", "=сэма", "=сэму", "=сэмом", "горлум", "смеагорл", "гэндальф", "бильбо", "боромир", "фарамир",
    "галадриэл", "арагорн", "саруман", "сарумана", "денетор", "древобород", "=энты", "=энтов", "эовин", "=мерри", "=пин", "=шир", "=шире", "=шира", "хоббит", "мордор",
    "скальбург", "=сад", "=сада", "=рана", "=раны", "=рану",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["жалост", "милосерд", "власт", "искушен", "служ", "слуга", "отказ", "соблазн"],
  calm: [],
  never: ["=кольцом-зеркалом"],
  // сцены, где внизу важные подписи экспоната: титры ниже
  lowScenes: { f02: 18, e05: 18, z01: 18, n06: 18 },
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "i01c", words: ["отказались?"] },
    { line: "a03b", words: ["жалость."] },
    { line: "c04c", words: ["добро"] },
    { line: "e02c", words: ["моим»."] },
    { line: "n02e", words: ["иммунитет."] },
    { line: "n06b", words: ["надевает"] },
    { line: "p05c", words: ["домой"] },
    { line: "z02b", words: ["вы?"] },
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
    LOTR_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
