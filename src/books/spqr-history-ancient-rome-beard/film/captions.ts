// Титры фильма BM-040 «Кого Рим считал своим?» — фирменные анимированные титры
// BanaMind (src/banamind/captions). Здесь только словарь выделений этой книги,
// акцент и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../../../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const SPQR_CAPTIONS: CaptionBook = {
  accent: "#e8735f", // терракота городских ворот
  highlight: [
    "гражданин", "граждан", "гражданств", "римлянин", "римлян", "сенат", "народ", "голос",
    "цицерон", "катилин", "ромул", "эней", "легенд", "археолог", "вейи", "союзник", "латинск",
    "раб", "вольноотпущен", "гракх", "полиби", "август", "траян", "плиний", "зоил", "регин", "каракалл",
    "провинци", "империя", "император", "своим", "чужак", "варвар", "свобод",
  ],
  accentTerms: ["своим", "своих", "hostis", "свободные", "принадлежность"],
  calm: [],
  kinetic: [
    { line: "r01d", words: ["своим?"] },
    { line: "r12b", words: ["парадокс"] },
    { line: "r21c", words: ["разные"] },
    { line: "r25b", words: ["раньше"] },
    { line: "r37c", words: ["исчезают."] },
    { line: "r48b", words: ["«Человек", "пять»,"] },
    { line: "r56a", words: ["гражданами."] },
    { line: "r59c", words: ["влиять"] },
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
    SPQR_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
