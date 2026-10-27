// Раскладка кинетических субтитров LIVE-005 (индексы слов — transcript.ts).
// Своя зона на каждый план — по кадрам исходника и треку лица (face.ts):
// • S1–S5 (площадь, тёмное небо) — над головой, y ≈ 230–480 (лицо ниже ~440–520);
// • S6 (каскад, автор подходит, белая куртка внизу) — верх с мягкой дымкой;
// • S7–S8 (каскад) — нижняя треть на тёмных брюках и плитке.
// Слоты: главная строка может держаться, пока в соседнем слоте идёт фраза
// («САААТ ҮЧТӨ» над «балаңызды мектептен…», «АТА-ЭНЕ» между скобками).
// Слова, которые синхронно показывает графика, здесь не повторяются
// (SHOWN_BY_GRAPHICS): каждое слово речи — ровно один раз.
import type { EdGroup } from "./layout.ts";

export const LIVE005_CAPTIONS: readonly EdGroup[] = [
  // S1 — хук: заголовок у часов держится, ниже — фраза мелко; затем вопрос справа
  { from: 0, to: 1, x: 214, y: 278, align: "left", big: [0, 1], accent: [1], bigSize: 80, slot: "head" },
  { from: 2, to: 5, x: 214, y: 367, align: "left", size: 40, accent: [4, 5], breakAfter: [3], slot: "sub", endAt: 2.3 },
  { from: 6, to: 9, x: 930, y: 318, align: "right", big: [9], accent: [9], bigSize: 92, breakAfter: [8], slot: "head" },
  // S2 — общий план: «АТА-ЭНЕ» крупно в скобках, вокруг — фраза
  // (сверху вниз по порядку речи: «Мындай учурда» → «АТА-ЭНЕ» → «эки нерсенин…»)
  { from: 10, to: 11, x: 540, y: 266, align: "center", slot: "a" },
  { from: 12, to: 12, x: 540, y: 356, align: "center", big: [12], bigSize: 92, slot: "b", brackets: { at: 5.43 }, holdUntil: 6.85 },
  { from: 13, to: 16, x: 540, y: 458, align: "center", big: [13, 14], accent: [13], bigSize: 52, size: 44, breakAfter: [14], slot: "c" },
  // S3 — 17–26 показывает графика «две колонки» (DilemmaColumns)
  // S4 — музей справа светлый: колонка слева; заголовок держится, под ним — мысль
  { from: 27, to: 28, x: 80, y: 272, align: "left", big: [27, 28], accent: [28], bigSize: 64, slot: "a", holdUntil: 13.88 },
  { from: 29, to: 34, x: 80, y: 400, align: "left", big: [31, 32, 33], bigSize: 56, size: 46, breakAfter: [30, 33], slot: "b", strike: { words: [31, 32, 33], at: 12.72 } },
  // S5 — 35–42 показывает графика «список причин» (ReasonsList)
  // S6 — 43–44 показывает логотип (BrandLine) внизу, пока автор далеко;
  // дальше он подходит, белая куртка занимает низ — миссия наверху, над головой,
  // на светлом фасаде — с мягкой дымкой (не плашка)
  { from: 45, to: 47, x: 540, y: 336, align: "center", big: [47], bigSize: 76, breakAfter: [46], haze: 0.5 },
  { from: 48, to: 49, x: 540, y: 336, align: "center", big: [49], accent: [49], breakAfter: [48], haze: 0.5 },
  { from: 50, to: 51, x: 540, y: 336, align: "center", big: [50, 51], accent: [51], breakAfter: [50], haze: 0.5 },
  // S7 — маршрут сверху, субтитры по центру внизу
  { from: 52, to: 54, x: 540, y: 1396, align: "center", big: [54], breakAfter: [53] },
  { from: 55, to: 59, x: 540, y: 1396, align: "center", big: [58, 59], accent: [58], bigSize: 76, breakAfter: [57] },
  // S8 — CTA: справа внизу; затем под пузырём WhatsApp по центру. Слова
  // «шилтемеге» и «WhatsApp'ка» — обычным шрифтом: акцент — сама графика CTA
  { from: 60, to: 61, x: 930, y: 1350, align: "right", big: [60, 61], bigSize: 68, slot: "a", holdUntil: 28.78, endAt: 28.8 },
  { from: 62, to: 65, x: 930, y: 1460, align: "right", size: 52, breakAfter: [63], slot: "b" },
  { from: 66, to: 69, x: 540, y: 1440, align: "center", size: 54, keepCase: [68], breakAfter: [67], slot: "b" },
  { from: 70, to: 72, x: 540, y: 1440, align: "center", big: [72], accent: [72], bigSize: 80, breakAfter: [71], slot: "b" },
];

// [от, до, что показывает] — слова, которые уже синхронно передаёт графика.
export const SHOWN_BY_GRAPHICS: readonly (readonly [number, number, string])[] = [
  [17, 26, "две колонки выбора по бокам головы (DilemmaColumns)"],
  [35, 42, "накопительный список причин (ReasonsList)"],
  [43, 44, "логотип BalaGo + «BalaGo'нун максаты —» (BrandLine)"],
];
