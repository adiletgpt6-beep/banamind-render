// Титры фильма «Космос» Карла Сагана (BM-028) — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только настройки этой книги: какие слова
// выделять и где редкая кинетическая типографика. Время слов — из выравнивания
// озвучки (manifest.json), тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const SAGAN_CAPTIONS: CaptionBook = {
  accent: "#c9a15a", // латунь рамы «Окна доказательств»
  // важные слова (жёлтый): ключевые понятия маршрута
  highlight: [
    "наблюден", "объяснен", "провер", "пересмотр", "доказательств", "гипотез", "модел", "измер", "свет", "расстояни",
    "окружност", "тен", "эллипс", "орбит", "планет", "звёзд", "галактик", "расширени", "спектр", "нейтрино",
    "жизн", "атом", "элемент", "библиотек", "оценк", "догадк", "прогноз", "данн", "ошибк", "сигнал",
  ],
  // особо значимые понятия (акцент книги)
  accentTerms: ["=окно", "=окна", "=окне", "=земля", "=земли", "=землю", "=земле"],
  calm: [],
  lowScenes: {},
  // редкие кинетические моменты (≥ 45 с друг от друга)
  kinetic: [
    { line: "m03c", words: ["упрямое."] },
    { line: "o01c", words: ["отпадает."] },
    { line: "o06c", words: ["восемь", "минут"] },
    { line: "p02c", words: ["восьмидесяти", "градусов"] },
    { line: "p07d", words: ["нет."] },
    { line: "s03d", words: ["превращаются"] },
    { line: "s06b", words: ["звёздного", "вещества."] },
    { line: "g03c", words: ["ускоряется."] },
    { line: "c04c", words: ["Тишина"] },
    { line: "e04b", words: ["отвечаем", "за", "Землю"] },
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
    SAGAN_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
