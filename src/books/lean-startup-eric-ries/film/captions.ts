// Титры фильма BM-024 «Бизнес с нуля» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки книги: слова для выделения, акцентный цвет
// (бирюза «капсулы-гипотезы») и редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json); тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../../../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const LSR_CAPTIONS: CaptionBook = {
  accent: "#5fd6ff",
  // важные слова (жёлтый): понятия книги
  highlight: [
    "гипотез", "эксперимент", "клиент", "показател", "метрик", "вираж", "цикл", "когорт", "партии", "партий",
    "механизм", "=mvp", "минимальн", "потер", "фактами", "прыжк", "сплит", "удержани", "почему", "песочниц",
    "лаборатори", "решени", "поведени",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["неопределенност", "неопределённост", "научиться", "проверить", "проверк", "проверя"],
  calm: [],
  never: ["=клиентам", "=показатели"],
  // сцены, где внизу важные подписи схемы: титры ниже
  lowScenes: { i04: 16, s01: 16, r03: 16, z04: 16, x05: 16, k01: 16 },
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "i01b", words: ["никто"] },
    { line: "m01c", words: ["провал»."] },
    { line: "v02a", words: ["фактами»."] },
    { line: "p01b", words: ["обучения,"] },
    { line: "x01a", words: ["тщеславия»."] },
    { line: "r03a", words: ["виражей"] },
    { line: "k04b", words: ["больше»."] },
    { line: "g01a", words: ["раньше»."] },
    { line: "w04a", words: ["обвинений»."] },
    { line: "n04a", words: ["бесполезного,"] },
    { line: "z03b", words: ["делают»."] },
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
    LSR_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
