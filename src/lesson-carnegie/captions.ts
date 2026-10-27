// Титры фильма BM-025 «Как завоёвывать друзей…» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const CARNEGIE_CAPTIONS: CaptionBook = {
  accent: "#ffb02e", // тёплый янтарный акцент «Мастерской разговора»
  highlight: [
    "мост", "критик", "осужден", "обвинени", "защит", "признани", "лест", "искренн", "интерес", "слуша", "имя", "имени",
    "спор", "ошибк", "вопрос", "сотрудничеств", "сочувстви", "достоинств", "похвал", "вызов", "репутаци",
    "карнеги", "гувер", "линкольн", "шваб", "гэммонд", "эллисон", "вессон", "томас", "мацони",
  ],
  accentTerms: ["понять", "услышали", "уважени", "право", "добровольн", "унижени", "давлени"],
  calm: ["тридцать", "четыре"],
  kinetic: [
    { line: "c02a", words: ["выиграли?"] },
    { line: "k05b", words: ["унижения."] },
    { line: "l06c", words: ["правда"] },
    { line: "r02a", words: ["победителей»."] },
    { line: "o02c", words: ["«нет»."] },
    { line: "e06d", words: ["замяли."] },
    { line: "z02c", words: ["отказаться."] },
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
    CARNEGIE_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
