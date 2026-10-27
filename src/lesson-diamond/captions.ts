// Титры фильма BM-027 (Даймонд) — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const DIAMOND_CAPTIONS: CaptionBook = {
  accent: "#5fd4c8", // бирюзовый акцент Лаборатории: стеклянные линзы-переменные
  highlight: [
    "даймонд", "яли", "кахамарк", "атауальп", "писарро", "инк", "лаборатор", "линз",
    "географ", "климат", "земледел", "скот", "животн", "растени", "злак", "одомашн",
    "микроб", "болезн", "эпидеми", "письменност", "изобрет", "технолог", "власт", "государств",
    "континент", "широт", "обмен", "гипотез", "плодородн", "китай", "европ", "африк", "америк",
  ],
  accentTerms: ["причин", "сталь", "ружья", "условия", "достоинств"],
  calm: [],
  kinetic: [
    { line: "d01d", words: ["да."] },
    { line: "d05a", words: ["луковица!»"] },
    { line: "d10c", words: ["эпидемия,"] },
    { line: "d20b", words: ["градусов»."] },
    { line: "d26b", words: ["посадили!»"] },
    { line: "d37b", words: ["необходимости,"] },
    { line: "d53b", words: ["самоубийство.»"] },
    { line: "d59c", words: ["историю?"] },
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
    DIAMOND_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
