// LIVE-004 v2 — план облегчённого монтажа (единый источник для композиции
// и проверок). Без импортов Remotion: файл читают Node-тесты.
//
// Правило live-videos/RULES.md: ролик 30–45 с → не больше 2–3 смысловых
// анимационных вставок; без лишних переходов, зумов, вспышек и звуков.
// Каждая вставка и каждый звук привязаны к произнесённому слову.
import { LIVE04_WORDS } from "../../live04/transcript.ts";

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const word = (text: string, nth = 0) => {
  const hits = LIVE04_WORDS.filter((w) => norm(w.text) === norm(text));
  const w = hits[nth];
  if (!w) throw new Error(`LIVE-004: слово «${text}» (#${nth}) не найдено`);
  return w;
};
const at = (text: string, nth = 0) => word(text, nth).start;

export const V2_CUE = {
  ishinizdi: at("ишиңизди"),
  toktotosuz: at("токтотосуз"),
  anan: at("анан"),
  zholgo: at("жолго"),
  mektepke2: at("мектепке", 1),
  zhetesiz: at("жетесиз"),
  birok: at("Бирок"),
  mektep: at("мектеп"),
  zhumasyna: at("жумасына"),
  besh: at("беш"),
  kun: at("күн"),
  balago: at("BalaGo"),
  erteng: at("эртең"),
  uydon: at("үйдөн"),
  mektepke3: at("мектепке", 2),
  sabaktan: at("сабактан"),
  kayra3: at("кайра", 2),
  uygo: at("үйгө"),
  profil: at("профилдеги"),
  zhe: at("же", 1),
  whatsapp: at("WhatsApp"),
  lastWordEnd: LIVE04_WORDS[LIVE04_WORDS.length - 1].end,
} as const;

// Склейки исходника (сек), для привязки окончаний вставок.
export const V2_CUTS = [4.03, 8.93, 14.3, 18.2, 21.7, 27.1] as const;

export type Insert = {
  readonly id: string;
  readonly from: number;
  readonly to: number;
  readonly words: string; // какие слова визуализирует
  readonly why: string;
};

// Три смысловые вставки (лимит для 30–45 с — не больше 3).
export const V2_INSERTS: readonly Insert[] = [
  {
    id: "steps",
    from: V2_CUE.ishinizdi - 0.1,
    to: V2_CUTS[1] - 0.1,
    words: "ишиңизди токтотосуз, жолго чыгасыз, мектепке жетесиз",
    why: "проблема как процесс: ИШ ⏸ → ЖОЛ → МЕКТЕП",
  },
  {
    id: "week",
    from: V2_CUE.birok,
    to: V2_CUTS[3] - 0.1,
    words: "Бирок мектеп — жумасына беш күн",
    why: "масштаб проблемы: пять дней подряд",
  },
  {
    id: "route",
    from: V2_CUE.balago,
    to: V2_CUTS[5] - 0.1,
    words: "BalaGo… эртең менен үйдөн мектепке… мектептен үйгө",
    why: "решение: маршрут ҮЙ → МЕКТЕП → ҮЙ",
  },
];

// Звуки — только там, где графика что-то «делает» (8 вместо 47 в v1).
export const V2_SFX: readonly { readonly at: number; readonly name: string; readonly volume: number }[] = [
  { at: V2_CUE.toktotosuz, name: "stop", volume: 0.28 },
  { at: V2_CUE.zhetesiz, name: "success", volume: 0.22 },
  { at: V2_CUE.besh, name: "pop", volume: 0.26 },
  { at: V2_CUE.mektepke3, name: "glide", volume: 0.22 },
  { at: V2_CUE.kayra3, name: "glide", volume: 0.22 },
  { at: V2_CUE.uygo + 0.1, name: "success", volume: 0.22 },
  { at: V2_CUE.profil, name: "pop", volume: 0.26 },
  { at: V2_CUE.whatsapp, name: "pop", volume: 0.26 },
];

// Финал: живой кадр плавно уступает фирменной карточке (без зума и вспышек).
export const V2_END_FADE = { at: V2_CUE.lastWordEnd + 0.15, dur: 0.6 } as const;

// Общий формат плана для проверок (scripts/live-videos/check.mjs).
export const PLAN = {
  task: "LIVE-004",
  version: "v2",
  liveSec: 34.5, // длительность живой части (без фирменной карточки)
  inserts: V2_INSERTS,
  sfx: V2_SFX,
} as const;
