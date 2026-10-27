// Титры фильма BM-036 «Десятая монета» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки фильма: слова для выделения, акцентный цвет
// (бирюза собственного запаса) и редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json); тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../../../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const BM036_CAPTIONS: CaptionBook = {
  accent: "#3fd6e4",
  // важные слова (жёлтый): понятия фильма
  highlight: [
    "монет", "кошел", "запас", "расход", "доход", "долг", "кредитор", "заработ", "план", "желани",
    "нужн", "необходим", "совет", "осторожн", "мастерств", "умени", "промедлен", "решени", "табличк",
    "десят", "семь", "две", "знающ",
  ],
  // особо значимые понятия (акцент фильма)
  accentTerms: ["себе", "свобод", "достоинств", "задач"],
  calm: [],
  never: ["=две", "=семь"],
  // сцены, где внизу важные подписи схемы: титры ниже
  lowScenes: { o02: 18, t04: 18, n07: 18, d08: 18, d09: 18, f02: 18 },
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "o01b", words: ["снова", "пуст."] },
    { line: "b06b", words: ["два", "разных", "умения."] },
    { line: "t04a", words: ["первой."] },
    { line: "t07b", words: ["целиком."] },
    { line: "n06c", words: ["не", "клетка."] },
    { line: "k06c", words: ["дороже", "денег."] },
    { line: "k10a", words: ["решение,"] },
    { line: "v05c", words: ["поспешность"] },
    { line: "d07c", words: ["задачей."] },
    { line: "d09d", words: ["суммы", "плавают."] },
    { line: "w09a", words: ["в", "пыль."] },
    { line: "f05b", words: ["каждая", "монета,"] },
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
    BM036_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
