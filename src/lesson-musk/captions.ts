// Титры фильма BM-029 «Илон Маск: цена невозможного» — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const MUSK_CAPTIONS: CaptionBook = {
  accent: "#7fe3dc", // бирюза стола «инженерия» — цвет модели фильма
  highlight: [
    "систем", "огранич", "испытан", "допущени", "цен", "запас", "доверие", "довери", "команд", "контрол", "прогноз",
    "маск", "вэнс", "кимбал", "эберхард", "тарпеннинг", "штробел", "шотвелл", "тил", "коури", "пейдж",
    "spacex", "tesla", "paypal", "zip2", "x.com", "falcon", "dragon", "merlin", "solarcity",
  ],
  accentTerms: ["невозможн", "полную", "физик", "люди", "людей", "человеческ"],
  calm: ["три", "трёх"],
  kinetic: [
    { line: "c01a", words: ["работающей"] },
        { line: "c22c", words: ["железом."] },
    { line: "c31a", words: ["красным."] },
    { line: "c34c", words: ["владельцы."] },
    { line: "c37f", words: ["бизнесу."] },
    { line: "c47c", words: ["цену,"] },
    { line: "c54a", words: ["полную"] },
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
    MUSK_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
