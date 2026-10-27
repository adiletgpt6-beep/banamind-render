// Титры фильма BM-035 (Дахигг) — фирменные анимированные титры BanaMind
// (src/banamind/captions). Здесь только словарь выделений этой книги, акцент
// и редкие кинетические моменты. Время слов — из выравнивания озвучки.
import { buildCaptionCues, type CaptionBook, type CaptionCue } from "../banamind/captions/build.ts";
import type { Timeline } from "./timeline";

export type Cue = CaptionCue;

export const DUHIGG_CAPTIONS: CaptionBook = {
  accent: "#ff9a5c", // оранжевый сигнал Лаборатории невидимых кнопок
  highlight: [
    "дахигг", "привычк", "сигнал", "действи", "наград", "петл", "тяг", "предвкуш", "мозг",
    "автопилот", "базальн", "лайз", "юджин", "джулио", "хопкинс", "пепсодент", "фебриз",
    "мэнди", "данджи", "о’нил", "alcoa", "фелпс", "starbucks", "target", "паркс", "кинг",
    "грановеттер", "макадам", "связ", "вер", "кризис", "ответствен", "загадк", "протокол",
  ],
  accentTerms: ["сигнал", "награда", "тяга", "краеугольн", "золотое"],
  calm: [],
  kinetic: [
    { line: "h01d", words: ["награда."] },
    { line: "h11c", words: ["привычка»."] },
    { line: "h17c", words: ["ощущение.»"] },
    { line: "h25b", words: ["действие.»"] },
    { line: "h33a", words: ["вокруг.»"] },
    { line: "h44b", words: ["напомнили»."] },
    { line: "h55c", words: ["связи."] },
    { line: "h64d", words: ["эксперимент."] },
    { line: "h66c", words: ["плыть.»"] },
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
    DUHIGG_CAPTIONS,
  );

export const cueText = (c: Cue) => c.rows.map((r) => r.map((w) => w.text).join(" "));
