// Титры фильма BM-006 «Атлант расправил плечи» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки этой книги: какие слова
// выделять и где редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json), тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const ATLAS_CAPTIONS: CaptionBook = {
  accent: "#5fe0cf", // сине-зелёный риарден-металл
  // важные слова (жёлтый): ключевые понятия и образы фрагмента
  highlight: [
    "ответственност", "металл", "рельс", "семафор", "мост", "браслет", "цеп", "календар",
    "закон", "=доля", "=долю", "=доли", "конкуренц", "монопол", "прибыл", "=деньги", "=денег",
    "результат", "факт", "расчёт", "намёк", "=вина", "=вину", "=вины", "эгоист", "сделк",
    "уходят", "исчез", "ценност", "собственност", "фрагмент",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["=голт", "=голта", "=голте", "=беру", "загадк"],
  calm: [],
  // кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "i01c", words: ["Джон", "Голт?»"] },
    { line: "d01d", words: ["«Беру»."] },
    { line: "r03c", words: ["цепь,"] },
    { line: "u05c", words: ["социально."] },
    { line: "c07c", words: ["«Все", "мы!»"] },
    { line: "e03f", words: ["отвечать."] },
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
    ATLAS_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
