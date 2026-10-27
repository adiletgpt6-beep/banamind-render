// Титры фильма «Трактат о природе» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки этой книги: какие слова
// выделять и где редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json), тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const TRAKTAT_CAPTIONS: CaptionBook = {
  accent: "#7ee8b0", // книга о природе — мятно-зелёный акцент
  // важные слова (жёлтый): ключевые понятия и примеры книги
  highlight: [
    "природ", "причин", "случайн", "аптек", "лекарств", "=муха", "=мухи", "=мухе", "=муху", "=мухой",
    "солнц", "капл", "семечк", "сосн", "атом", "дворец", "дворц", "художник", "рисун", "закон",
    "войск", "командир", "часовщик", "=само", "=собой", "перекрест", "тупик",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["нелеп", "невозмож", "единствен", "=един", "=единый", "=единого", "=единому"],
  // имена Бога: выделяются цветом, но без увеличения и кинетики
  calm: ["творец", "творц", "аллах", "создател", "всемогущ"],
  // дороги 1–3 (подпись «три нелепости») и дворец (подписи «глаз», «язык»)
  lowScenes: { s06: 16, s11: 16, s15: 16, s13: 16 },
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "i03b", words: ["само", "собой"] },
    { line: "s06d", words: ["Нелепость"] },
    { line: "s12h", words: ["нелепость"] },
    { line: "s16i", words: ["невозможно"] },
    { line: "s24c", words: ["невозможно"] },
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
    TRAKTAT_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
