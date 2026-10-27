// Языковые версии ролика 80-1-4: русская (основная) и кыргызская.
// Картинка, действия, планы, паузы и звуки — общие; у каждой версии свои
// реплики, надписи, озвучка (папка голосов, манифест), распознавание и SRT.
// Режиссура привязывает отдельные жесты и взгляды к словам русских реплик;
// в другой версии то же место находится по слову-якорю (anchors).
// Файл без зависимостей от Remotion: его читают и Node-скрипты.
import { A4_LINES, A4_TEXT, A4_VIDEO, type A4Line } from "./script.ts";
import { A4_ANCHORS_KY, A4_LINES_KY, A4_TEXT_KY, A4_VIDEO_KY } from "./script.ky.ts";

export type A4Lang = "ru" | "ky";

export type A4Pack = {
  readonly lang: A4Lang;
  readonly video: { readonly id: string; readonly code: string; readonly output: string; readonly width: number; readonly height: number; readonly fps: number; readonly voiceDir: string };
  readonly lines: readonly A4Line[];
  readonly text: { readonly one: string; readonly final: string };
  // слово русской реплики → слово этой версии (номер реплики → пары)
  readonly anchors: Readonly<Record<number, Readonly<Record<string, string>>>>;
  readonly voices: string; // голоса ролей и выбор дублей
  readonly pad: string; // страховочное слово после реплики при синтезе (вырезается)
  readonly asr: string; // результаты распознавания
  readonly srt: string;
};

export const A4_PACKS: Readonly<Record<A4Lang, A4Pack>> = {
  ru: {
    lang: "ru",
    video: A4_VIDEO,
    lines: A4_LINES,
    text: A4_TEXT,
    anchors: {},
    voices: "src/lesson80-1-4/voices.json",
    pad: "Хорошо.",
    asr: "docs/lesson80-1-4/voice-asr.json",
    srt: "docs/lesson80-1-4/lesson-80-1-4-one-creator.ru.srt",
  },
  ky: {
    lang: "ky",
    video: A4_VIDEO_KY,
    lines: A4_LINES_KY,
    text: A4_TEXT_KY,
    anchors: A4_ANCHORS_KY,
    voices: "src/lesson80-1-4/voices.ky.json",
    pad: "Жакшы.",
    asr: "docs/lesson80-1-4/voice-asr.ky.json",
    srt: "docs/lesson80-1-4/lesson-80-1-4-one-creator.ky.srt",
  },
};

export const isA4Lang = (x: unknown): x is A4Lang => x === "ru" || x === "ky";
export const a4Pack = (lang: A4Lang = "ru"): A4Pack => A4_PACKS[lang];
