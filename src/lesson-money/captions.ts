// Титры фильма BM-009 «Психология денег» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки этой книги: какие слова
// выделять и где редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json), тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const MONEY_CAPTIONS: CaptionBook = {
  accent: "#7ee8a8", // книга о деньгах — светло-зелёный акцент
  // важные слова (жёлтый): ключевые понятия книги
  highlight: [
    "поведени", "привычк", "терпени", "удач", "риск", "достаточно", "хватает", "ожидани", "сравнива",
    "время", "времени", "выжива", "запас", "свобод", "сбережени", "копит", "богатств", "скромн",
    "репутац", "независимост", "гибкост", "ошибок", "сюрприз", "цена", "цену", "игру",
    "пессимизм", "оптимист", "параноик", "хвост", "невидим",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["=психология", "=психологией", "=достаточно", "=свобода", "=время"],
  calm: [],
  // сцены, где внизу важные подписи схемы: титры ниже (px от низа кадра)
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "s01c", words: ["уборщик."] },
    { line: "s08c", words: ["новички."] },
    { line: "s14c", words: ["Мне", "хватает."] },
    { line: "s19d", words: ["время."] },
    { line: "s30c", words: ["нужны", "вы."] },
    { line: "s32a", words: ["не", "видим."] },
    { line: "s41d", words: ["заплатить."] },
    { line: "s49b", words: ["временем."] },
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
    MONEY_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
