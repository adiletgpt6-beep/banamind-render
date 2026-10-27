// Титры BM-017 — фирменные BanaMindAnimatedCaptions; здесь только словарь книги.
// Акцент книги — «красная нить» подозрения.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../../../banamind/captions/build.ts";
import type { Timeline } from "./timeline.ts";

export type Cue = CaptionCue;

export const CHRISTIE_CAPTIONS: CaptionBook = {
  accent: "#ff6b61",
  highlight: ["фигурк", "считалк", "голос", "пластинк", "судь", "довер", "подозр", "остров", "правил", "алиби", "авторитет"],
  accentTerms: ["обвинени", "доказательств", "приговор", "=суд", "справедлив"],
  calm: [],
  kinetic: [{ line: "p3b", words: ["доказательство"] }],
};

export const buildCues = (tl: Timeline): Cue[] =>
  buildCaptionCues(
    tl.lines.map((l) => ({ id: l.id, text: l.text, words: l.words, chars: l.chars, speechFrom: l.speechFrom, speechTo: l.speechTo, holdUntil: l.waitFrom !== undefined ? l.waitFrom - 0.3 : undefined })),
    CHRISTIE_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
