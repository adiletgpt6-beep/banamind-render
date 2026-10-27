// Титры фильма BM-002 — фирменные анимированные титры BanaMind (src/banamind/captions).
// Здесь только настройки этой книги: какие слова выделять и где редкая кинетическая
// типографика. Время слов — из выравнивания озвучки (manifest.json); тот же расчёт
// идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const BOOK_CAPTIONS: CaptionBook = {
  accent: "#7fd0c8", // бирюзовый акцент книги
  // важные слова (жёлтый): места, ключевые события и понятия
  highlight: [
    "мекк", "медин", "ясриб", "кааб", "хира", "таиф", "бадр", "ухуд", "худайби", "акаб",
    "слон", "замзам", "пещер", "договор", "клятв", "пленн", "ров", "сирот", "сирота",
    "честн", "правд", "терп", "прощ", "мир", "братья", "брат", "верн", "свобод", "амин",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["един", "читай", "милост", "справедлив", "вместе"],
  // имя Бога и Пророка: выделяются цветом, но без увеличения и кинетики
  calm: ["аллах", "пророк", "посланник", "коран"],
  never: ["мира", "миру"],
  // сцены с важными подписями внизу схемы: титры ниже
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "r01b", words: ["«Читай!»"] },
    { line: "m01b", words: ["«Един!"] },
    { line: "h02b", words: ["братья»."] },
    { line: "c04c", words: ["свободны!»"] },
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
    BOOK_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
