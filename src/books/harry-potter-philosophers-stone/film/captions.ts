// Титры фильма BM-031 «Гарри Поттер и философский камень» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../../../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const POTTER_CAPTIONS: CaptionBook = {
  accent: "#2fbf9b", // мятный акцент стороны «поступок» компаса
  highlight: [
    "ярлык", "происхожден", "ожидани", "страх", "поступ", "выбор", "выбира", "храбр", "дружб", "довери", "провер",
    "зеркал", "желани", "компас", "слав", "знаменит", "ненормальн", "улик", "догадк", "мотив", "манер",
    "гарри", "рон", "гермион", "невилл", "снейп", "квиррелл", "малфо", "хагрид", "дамблдор", "дёрсли", "петуни", "макгонагалл",
  ],
  accentTerms: ["просьб", "своим", "сам", "любовь", "правд"],
  calm: ["десять", "семнадцать", "сто", "пятьдесят"],
  kinetic: [
    { line: "c01d", words: ["кто", "ты?»"] },
    { line: "s03d", words: ["Гриффиндор."] },
    { line: "j07c", words: ["ярлыки."] },
    { line: "r02a", words: ["Квиррелл."] },
    { line: "r10c", words: ["поступку."] },
    { line: "z01b", words: ["личности."] },
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
    POTTER_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
