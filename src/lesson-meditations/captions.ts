// Титры фильма BM-012 — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки книги: какие слова выделять
// и где редкая кинетическая типографика. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const MED_CAPTIONS: CaptionBook = {
  accent: "#f2a65a", // римская терракота — тёплый акцент книги
  // важные слова (жёлтый): ключевые понятия книги
  highlight: [
    "суждени", "убеждени", "гнев", "обид", "доброжелательн", "справедлив", "честн", "препятстви",
    "настоящ", "похвал", "слав", "тщеслави", "польз", "добро", "ошибк", "спокойстви",
    "власт", "император", "круг", "характер", "долг", "факт", "рассказ", "скал", "родник", "изумруд",
    "лампад", "улей", "улья", "пчел", "шаг", "благодар", "помощ", "критик", "дневник",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["=самому", "=собой", "=изумрудом", "=неодолимое»", "=путь»", "=сегодня", "=стать"],
  calm: [],
  never: [],
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "i01c", words: ["самому", "себе."] },
    { line: "c07c", words: ["скале»."] },
    { line: "a03a", words: ["обидчику»."] },
    { line: "s03d", words: ["кричит"] },
    { line: "o02b", words: ["укажет", "путь»."] },
    { line: "t02a", words: ["настоящее"] },
    { line: "e04a", words: ["стать"] },
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
    MED_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
