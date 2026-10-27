// Титры фильма BM-022 — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const COVEY_CAPTIONS: CaptionBook = {
  accent: "#7ff0dc", // бирюза дорожки «выбор»
  highlight: [
    "проактив", "реактив", "круг", "влияни", "забот", "парадигм", "карт", "компас", "мисси", "квадрат", "срочн", "важн",
    "довери", "вклад", "выиграл", "проиграл", "связыват", "понят", "слуша", "синерги", "альтернатив", "пил", "обновлен",
    "развилк", "автопилот", "характер", "гусын", "лестниц", "джунгл", "очки", "кислород", "спирал",
  ],
  accentTerms: ["выбор", "промежут", "свобод", "принцип", "эмпати", "третий", "третье"],
  calm: [],
  kinetic: [
    { line: "s02c", words: ["срочностью."] },
    { line: "s12b", words: ["свободу"] },
    { line: "s21b", words: ["джунгли!»"] },
    { line: "s28d", words: ["сердцем"] },
    { line: "s35c", words: ["мелочами»."] },
    { line: "s47b", words: ["луковица,"] },
    { line: "s53b", words: ["третий"] },
    { line: "s57b", words: ["затачивать!"] },
    { line: "s61a", words: ["система."] },
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
    COVEY_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
