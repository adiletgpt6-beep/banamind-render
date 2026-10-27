// Титры BM-020 — штатные анимированные титры BanaMind (src/banamind/captions).
// Здесь только настройки книги: словарь выделений, акцент и редкая кинетика.
// Время слов — из выравнивания озвучки, тот же расчёт идёт в кадр и в SRT.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../../../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const IT_CAPTIONS: CaptionBook = {
  accent: "#7fe6dc", // светлая бирюза — цвет «вернувшейся видимости»
  highlight: [
    "дерри", "памят", "помн", "забы", "кораблик", "взросл", "свидетел", "звон", "архив", "рукопис",
    "плотин", "страх", "одиноч", "довер", "вместе", "город", "насили", "молчан", "клятв", "=том",
  ],
  accentTerms: ["замеча", "невидим", "слеп", "отворач", "сквозь"],
  calm: [],
  never: ["оно"],
  lowScenes: {},
  kinetic: [],
};

export const buildCues = (tl: Timeline): Cue[] =>
  buildCaptionCues(
    tl.lines.map((l) => ({ id: l.id, text: l.text, words: l.words, chars: l.chars, speechFrom: l.speechFrom, speechTo: l.speechTo })),
    IT_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
