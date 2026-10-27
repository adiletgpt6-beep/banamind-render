// Титры фильма BM-021 «Психология влияния» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const INFLUENCE_CAPTIONS: CaptionBook = {
  accent: "#7fe0ff", // холодный «стеклянный» акцент — цвет модели решения
  highlight: [
    "взаимност", "симпати", "социальное доказательств", "авторитет", "дефицит", "последовательност", "обязательств", "единств",
    "фильтр", "автопилот", "сигнал", "подарок", "долг", "толп", "эксперт", "пауз", "контраст", "уступк",
    "чалдини", "лангер", "риган", "джирард", "голдман", "заппа", "томми",
  ],
  accentTerms: ["выбор", "решени", "подделк", "поддельн", "честн", "свобод"],
  calm: ["семь", "семи"],
  kinetic: [
    { line: "s01c", words: ["нужно?"] },
    { line: "s10c", words: ["паузу."] },
    { line: "s23b", words: ["отделите"] },
    { line: "s36b", words: ["честен"] },
    { line: "s46b", words: ["сейчас,"] },
    { line: "s56d", words: ["её"] },
    { line: "s61d", words: ["подумать»."] },
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
      holdUntil: l.waitFrom !== undefined ? l.waitFrom - 0.3 : undefined,
    })),
    INFLUENCE_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
