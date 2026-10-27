// LIVE-004 v3 — те же три смысловые вставки, что в v2, но финал по правилу
// живого CTA (live/STYLE.md, AGENTS.md): Адилет сам говорит о ссылке в профиле
// и WhatsApp — его слова не дублируются ни озвучкой, ни карточками, ни
// заставкой. Ролик заканчивается естественно, на его последнем кадре.
// Бишкек в речи не назван → деликатная надпись в шапке вставки маршрута.
import { LIVE04_WORDS } from "../../live04/transcript.ts";
import { V2_CUE, V2_INSERTS } from "./plan.ts";

export const V3_INSERTS = V2_INSERTS;

// Звуки только на действиях вставок (6); на словах CTA — ни звуков, ни графики.
export const V3_SFX: readonly { readonly at: number; readonly name: string; readonly volume: number }[] = [
  { at: V2_CUE.toktotosuz, name: "stop", volume: 0.26 },
  { at: V2_CUE.zhetesiz, name: "success", volume: 0.2 },
  { at: V2_CUE.besh, name: "pop", volume: 0.24 },
  { at: V2_CUE.mektepke3, name: "glide", volume: 0.2 },
  { at: V2_CUE.kayra3, name: "glide", volume: 0.2 },
  { at: V2_CUE.uygo + 0.1, name: "success", volume: 0.2 },
];

// Естественный конец: длина исходника (последнее слово — 34,11 с).
export const V3_END_SEC = 34.5;

const said = LIVE04_WORDS.map((w) => w.text.toLowerCase()).join(" ");

export const PLAN = {
  task: "LIVE-004",
  version: "v3",
  liveSec: 34.5,
  direction: "минимализм + инфографика (дополнительное)",
  inserts: V3_INSERTS,
  sfx: V3_SFX,
  cta: {
    spoken: /профилдеги шилтемеге өтүңүз/.test(said) && /whatsapp номерге жазыңыз/.test(said),
    words: "профилдеги шилтемеге өтүңүз же төмөнкү WhatsApp номерге жазыңыз",
    duplicated: false, // нет бренд-озвучки, контактных карточек и заставки
  },
  city: { spoken: /бишкек/.test(said), onScreen: "Бишкек • Балдар үчүн такси (шапка вставки маршрута)" },
} as const;
