// Титры фильма BM-007 «Лидер без титула» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки этой книги: какие слова
// выделять и где редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json), тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const LEADER_CAPTIONS: CaptionBook = {
  accent: "#7fd8ff", // книга о лидерстве — светло-голубой акцент
  // важные слова (жёлтый): ключевые понятия книги
  highlight: [
    "титул", "должност", "лидер", "ответствен", "жертв", "мастерств", "новаторств", "искренн", "характер", "этик",
    "приоритет", "перемен", "лавин", "склон", "уважени", "благодар", "слушат", "забот", "общени", "весель",
    "услужлив", "понимани", "здоровь", "вдохнов", "близк", "репутац", "привычк", "пятёрк", "пятерк", "витраж",
    "отношени", "сад", "людей", "=люди",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["=image", "=spark", "=human", "=shine", "прорыв", "=человек"],
  calm: [],
  // сцены, где внизу важные подписи схемы: титры ниже (px от низа кадра)
  lowScenes: { s12: 16, s21: 16, s28: 16, s29: 16, s32: 16, s38: 16 },
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "s07a", words: ["титул", "не", "нужен."] },
    { line: "s09d", words: ["решения."] },
    { line: "s20e", words: ["прорыва."] },
    { line: "s28a", words: ["HUMAN"] },
    { line: "s31b", words: ["великой", "личностью."] },
    { line: "s40a", words: ["немного", "лучше."] },
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
    LEADER_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
