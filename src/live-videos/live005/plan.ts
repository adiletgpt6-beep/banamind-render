// LIVE-005 v1 — план монтажа: какие вставки, где и зачем (по словам и жестам).
// Читают check.mjs (лимиты, CTA) и тесты; без импортов Remotion.
import { LIVE005_CAPTIONS, SHOWN_BY_GRAPHICS } from "./captions.ts";
import { CUTS, GESTURE, LIVE005_END, at, end } from "./timing.ts";
import { LIVE005_WORDS } from "./transcript.ts";

export type Effect = {
  readonly id: string;
  readonly kind: "insert" | "cta-visual" | "zoom" | "transition" | "title";
  readonly from: number;
  readonly to: number;
  readonly words: string;
  readonly why: string;
};

const span = (a: number, b: number) =>
  LIVE005_WORDS.slice(a, b + 1)
    .map((w) => w.text)
    .join(" ");

// Вставки (одна в кадре одновременно; субтитры — отдельный слой).
export const INSERTS: readonly Effect[] = [
  { id: "clock", kind: "insert", from: at(0) - 0.12, to: CUTS[0] - 0.05, words: `${span(0, 1)} … ${span(6, 9)}`, why: "«Саат үчтө»: тонкий циферблат, стрелки встают на 3:00 на «үчтө»; на «жыйыныңыз бүтпөй калсачы?» минутная шагает дальше и растёт красная дуга — собрание затянулось" },
  { id: "dilemma", kind: "insert", from: at(17) - 0.15, to: CUTS[2] - 0.02, words: span(17, 26), why: "два варианта появляются колонками слева и справа от головы по очереди с раскрытыми ладонями; жёлтая черта — автор буквально «между двух вещей»" },
  { id: "reasons", kind: "insert", from: Math.max(at(35) - 0.15, CUTS[3] + 0.03), to: CUTS[4] - 0.02, words: span(35, 42), why: "перечисление причин накапливается списком — видно, что их несколько; на «шаарда» — деликатная метка «Бишкек»" },
  // держится, пока вверху начинается «ушул мектепке…» (фраза не рвётся); ушла до того,
  // как подходящий автор опускает подол белой куртки в нижнюю зону (~19,5 с)
  { id: "brand", kind: "insert", from: at(43) - 0.12, to: 19.3, words: span(43, 44), why: "поворот к решению: логотип BalaGo на имени бренда" },
  { id: "route", kind: "insert", from: Math.max(at(52) - 0.25, CUTS[5] + 0.04), to: CUTS[6] - 0.05, words: span(52, 59), why: "дорожка ҮЙ — МЕКТЕП без подписей: машинка едет туда на «мектепке» и обратно на «кайра үйгө», галочка на «жеткирүү»" },
  { id: "instagram", kind: "cta-visual", from: GESTURE.pointUp.from - 0.15, to: GESTURE.pointDown.from + 0.05, words: span(63, 65), why: "палец вверх — шапка профиля @balago.kg, стрелка от пальца к строке ссылки" },
  { id: "whatsapp", kind: "cta-visual", from: GESTURE.pointDown.from + 0.05, to: LIVE005_END, words: span(66, 69), why: "палец вниз «төмөнкү» — пузырь WhatsApp с номером 0998 08 38 28 под рукой, сразу контрастный и неподвижный до конца" },
];

export const CAMERA_MOVES: readonly Effect[] = [
  { id: "push-question", kind: "zoom", from: 2.25, to: CUTS[0], words: span(6, 9), why: "мягкий наезд к лицу на вопросе" },
  { id: "push-wide", kind: "zoom", from: CUTS[0], to: CUTS[1], words: span(10, 16), why: "общий план: медленный наезд, человек крупнее" },
  { id: "exhale", kind: "zoom", from: CUTS[1], to: CUTS[1] + 0.9, words: span(17, 18), why: "план с дилеммой раскрывается 1,06 → 1: обе ладони целиком в кадре" },
  { id: "push-hard", kind: "zoom", from: at(27) - 0.1, to: CUTS[3], words: span(27, 28), why: "акцент на «Эң кыйыны»" },
  { id: "drift-reasons", kind: "zoom", from: CUTS[3], to: CUTS[4], words: span(35, 42), why: "лёгкий дрейф под перечисление" },
  { id: "soft-cuts", kind: "transition", from: CUTS[0], to: CUTS[6] + 0.14, words: "склейки автора 3,73 / 6,87 / 10,47 / 13,90 / 22,23 / 26,00 с", why: "жёсткий монтаж автора сохранён; новый план «проявляется» из лёгкого размытия за 4 кадра — без наплыва двух кадров" },
  { id: "blur-zoom", kind: "transition", from: CUTS[4] - 0.25, to: CUTS[4] + 0.32, words: "болот. → BalaGo'нун", why: "главный переход: из проблемы в решение (смена места и тональности музыки)" },
  { id: "push-mission", kind: "zoom", from: at(45), to: CUTS[5], words: span(45, 51), why: "медленный наезд на миссии BalaGo" },
  { id: "open-cta", kind: "zoom", from: CUTS[6], to: CUTS[6] + 1.3, words: span(60, 61), why: "план CTA раскрывается 1,05 → 1 к жесту пальцем вверх (27,6 с)" },
  { id: "push-final", kind: "zoom", from: at(70) - 0.1, to: LIVE005_END, words: span(70, 72), why: "тёплый финальный наезд на «Биз дайыма кызматтабыз»" },
];

export const SFX: readonly { readonly at: number; readonly name: string; readonly volume: number }[] = [
  { at: at(1) - 0.02, name: "clock", volume: 0.32 },
  { at: at(17) - 0.05, name: "tap", volume: 0.3 },
  { at: at(21) - 0.05, name: "tap", volume: 0.3 },
  { at: at(43) - 0.06, name: "shine", volume: 0.28 },
  { at: GESTURE.pointUp.from, name: "tap", volume: 0.26 },
  { at: GESTURE.pointDown.from + 0.05, name: "chime", volume: 0.28 },
];

export const PLAN = {
  task: "LIVE-005",
  version: "v1",
  liveSec: LIVE005_END,
  direction: "Типографика (журнальная ночная) + кинематографичный",
  inserts: INSERTS,
  effects: [...INSERTS, ...CAMERA_MOVES],
  sfx: SFX,
  justification:
    "Решение владельца 14.10.2026 (live/STYLE.md): жёсткого лимита 2–3 вставок нет. Семь вставок идут строго по одной и каждая иллюстрирует произнесённые слова или жест (время, два варианта, список причин, бренд, маршрут, Instagram и WhatsApp по реальным жестам CTA); между ними — чистые планы с субтитрами.",
  cta: {
    spoken: /профилдеги шилтемеге өтүңүз.*WhatsApp'ка жазыңыз/.test(span(60, 72)),
    words: span(60, 69),
    duplicated: false,
    visual: "шапка @balago.kg со стрелкой от пальца (27,6–28,6 с) и пузырь WhatsApp 0998 08 38 28 под рукой (с 28,85 с до конца)",
  },
  city: {
    spoken: false,
    onScreen: "метка «Бишкек» на слове «шаарда» и строка профиля «Бишкектеги балдар үчүн такси»",
  },
  captions: { kind: "editorial-kinetic", groups: LIVE005_CAPTIONS.length, shownByGraphics: SHOWN_BY_GRAPHICS.length },
  end: end(72),
} as const;
