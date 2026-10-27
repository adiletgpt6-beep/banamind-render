// LIVE-004 v6 — раскладка кинетических субтитров (V6_SUBTITLES_BRIEF.md).
// Индексы — слова LIVE04_WORDS (src/live04/transcript.ts). Зоны выбраны по
// кадрам каждого плана v5: лицо, руки, вставки, Instagram и WhatsApp не
// перекрываются; положение меняется по сценам, а не на каждом слове.
// Без импортов Remotion — файл читают Node-тесты.
import type { CaptionGroup } from "../../../live/KineticCaptions.tsx";

// Слова, которые уже показаны крупной графикой синхронно с речью, — второй
// раз субтитром не дублируются:
//   0–8   крупный заголовок хука («Баланы мектепке жеткирүү» / «кээде
//         20 мүнөттүк эле иш эмес») — в v6 он передаёт речь слово в слово;
//   17–20 заголовок «Андан кийин кайра жумушка»;
//   40–41 заголовок недели «ЖУМАСЫНА 5 КҮН» (появляется на «беш»);
//   42    логотип «BalaGo» на слове «BalaGo».
export const SHOWN_BY_GRAPHICS: readonly (readonly [number, number, string])[] = [
  [0, 8, "заголовок хука"],
  [17, 20, "заголовок «Андан кийин кайра жумушка»"],
  [40, 41, "заголовок недели «ЖУМАСЫНА 5 КҮН»"],
  [42, 42, "логотип BalaGo"],
];

export const V6_CAPTIONS: readonly CaptionGroup[] = [
  // План 2 (4–9 с): лицо ниже центра, схема ИШ → ЖОЛ → МЕКТЕП сверху →
  // слева внизу, у плеча; одна зона на весь план, вход сбоку.
  { from: 9, to: 11, x: 80, y: 1400, align: "left", anim: "slide-left", accent: [11], breakAfter: [10] },
  { from: 12, to: 14, x: 80, y: 1400, align: "left", anim: "slide-left", accent: [13], breakAfter: [13] },
  { from: 15, to: 16, x: 80, y: 1400, align: "left", anim: "slide-left", accent: [15], breakAfter: [15], endAt: 8.95 },
  // План 3 (9–14 с): после заголовка «кайра жумушка» — в его же зоне.
  { from: 21, to: 24, x: 540, y: 880, align: "center", anim: "rise", accent: [23], breakAfter: [22] },
  // «темп»: над шкалой (шкала 1070–1350 px), короткие ударные порции.
  { from: 25, to: 27, x: 540, y: 965, align: "center", anim: "pop" },
  { from: 28, to: 30, x: 540, y: 965, align: "center", anim: "pop", accent: [28], breakAfter: [28], size: 64 },
  // План 4 (14–18 с): общий план — сверху, в небе над головой.
  { from: 31, to: 34, x: 540, y: 370, align: "center", anim: "rise", accent: [33], breakAfter: [33] },
  { from: 35, to: 36, x: 540, y: 370, align: "center", anim: "rise", accent: [36] },
  // «Бирок мектеп — жумасына»: на груди, рядом с карточками дней (1120+ px);
  // «беш күн» дальше показывает заголовок недели.
  { from: 37, to: 39, x: 540, y: 1010, align: "center", anim: "pop", accent: [38], breakAfter: [38], endAt: 17.52 },
  // План 5 (18–22 с): сверху логотип, руки на коленях → на тёмной футболке.
  { from: 43, to: 45, x: 540, y: 900, align: "center", anim: "pop", accent: [45], breakAfter: [44] },
  { from: 46, to: 47, x: 540, y: 900, align: "center", anim: "pop", accent: [47] },
  // План 6 (22–27 с): маршрут внизу (980–1360 px) → над ним, вход снизу.
  { from: 48, to: 51, x: 540, y: 880, align: "center", anim: "rise", accent: [50, 51], breakAfter: [49] },
  { from: 52, to: 53, x: 540, y: 880, align: "center", anim: "rise" },
  { from: 54, to: 56, x: 540, y: 880, align: "center", anim: "rise", accent: [56], breakAfter: [55] },
  // План 7 (27–29 с): общий план, слева сверху над деревьями.
  { from: 57, to: 60, x: 80, y: 380, align: "left", anim: "slide-left", accent: [58], breakAfter: [59] },
  { from: 61, to: 63, x: 80, y: 380, align: "left", anim: "slide-left", accent: [61], breakAfter: [62] },
  // Instagram сверху (268–460) и стрелка от пальца → текст ниже, на груди.
  { from: 64, to: 66, x: 540, y: 1250, align: "center", anim: "pop", accent: [65], breakAfter: [65] },
  // WhatsApp-карточка 1176–1346 px → текст под ней, над нижней зоной Reels.
  { from: 67, to: 71, x: 540, y: 1432, align: "center", anim: "rise", accent: [71], breakAfter: [69], size: 56 },
  { from: 72, to: 74, x: 540, y: 1432, align: "center", anim: "pop", accent: [74], breakAfter: [73], size: 60 },
];
