// Титры фильма BM-030 — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../../../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const WAR_CAPTIONS: CaptionBook = {
  accent: "#7fd8ff", // холодно-светлый «небесный» акцент
  highlight: [
    "наполеон", "кутузов", "андрей", "андрею", "андрея", "пьер", "пьера", "пьеру", "наташ", "марь", "николай", "николая", "соня", "соню", "сони",
    "каратаев", "аустерлиц", "бородин", "москв", "диспозици", "план", "тулон", "слав", "долг", "выбор", "плен",
  ],
  accentTerms: ["небо", "неба", "свобод", "необходимост", "жизнь", "любов"],
  calm: ["бог", "евангели", "смерт"],
  kinetic: [
    { line: "w02c", words: ["рассыпается"] },
    { line: "w16a", words: ["небо."] },
    { line: "w32c", words: ["причина»."] },
    { line: "w42b", words: ["вот", "кто!»"] },
    { line: "w47b", words: ["я!»"] },
    { line: "w65b", words: ["настоящее."] },
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
    WAR_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
