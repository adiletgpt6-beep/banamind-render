// LIVE-004 v4 — баланс между насыщенной v1 и слишком простой v3
// (live-videos/tasks/LIVE-004/V4_BRIEF.md, Issue #71). Без импортов Remotion:
// файл читают Node-проверки. Все моменты — слова расшифровки или жесты,
// найденные покадровым просмотром исходника.
import { LIVE04_WORDS } from "../../../live04/transcript.ts";
import { V2_CUE, V2_CUTS } from "../plan.ts";

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const at = (text: string, nth = 0) => {
  const w = LIVE04_WORDS.filter((x) => norm(x.text) === norm(text))[nth];
  if (!w) throw new Error(`LIVE-004 v4: нет слова «${text}» #${nth}`);
  return w.start;
};

export const V4_CUE = {
  ...V2_CUE,
  balany: at("Баланы"),
  zhetkiruu: at("жеткирүү"),
  keede: at("кээде"),
  twenty: at("20"),
  emes: at("эмес"),
  andan: at("Андан"),
  kayra1: at("кайра"),
  zhumushka: at("жумушка"),
  kayra2: at("кайра", 1),
  tempke: at("темпке"),
  kirish: at("кириш"),
  ozubuzgo: at("өзүбүзгө"),
  tomonku: at("төмөнкү"),
  biz: at("Биз"),
} as const;

// Жесты Адилета (покадровый просмотр исходника, шаг 0,2 с):
export const V4_GESTURE = {
  // правая рука поднимается, указательный палец вверх — «профилдеги шилтемеге»
  pointUpFrom: 29.5,
  pointUpPeak: 29.7,
  pointUpTo: 30.5,
  // кончик пальца в кадре на пике (px кадра 1080×1920)
  fingertip: { x: 470, y: 790 },
  // рука показывает вниз (слева в кадре) — «төмөнкү WhatsApp номерге»
  pointDownFrom: 31.55,
  pointDownTo: 32.45,
  // обе руки раскрыты по краям кадра — «Биз дайыма кызматтабыз»
  openHandsFrom: 33.35,
} as const;

export const V4_CUTS = V2_CUTS;
export const V4_END_SEC = 34.5;

export type V4Effect = {
  readonly id: string;
  readonly kind: "insert" | "zoom" | "title" | "cta-visual" | "transition";
  readonly from: number;
  readonly to: number;
  readonly words: string;
  readonly why: string;
};

// Все эффекты v4 — по смыслу, без шаблонного лимита (RULES.md п. 3).
export const V4_EFFECTS: readonly V4Effect[] = [
  { id: "hook-title", kind: "title", from: V4_CUE.balany, to: V4_CUE.keede, words: "Баланы мектепке жеткирүү", why: "хук: тема ролика словами автора" },
  { id: "stopwatch", kind: "insert", from: V4_CUE.keede, to: V4_CUTS[0], words: "кээде 20 мүнөттүк эле иш эмес", why: "20 минут «переливаются» — это не 20 минут" },
  { id: "zoom-emes", kind: "zoom", from: V4_CUE.emes, to: V4_CUTS[0], words: "эмес", why: "эмоциональный акцент, наезд на лицо" },
  { id: "steps", kind: "insert", from: V2_CUE.ishinizdi - 0.1, to: V4_CUTS[1] - 0.1, words: "ишиңизди токтотосуз… мектепке жетесиз", why: "ИШ ⏸ → ЖОЛ → МЕКТЕП ✓" },
  { id: "back-title", kind: "title", from: V4_CUE.andan, to: V4_CUE.kayra2 - 0.3, words: "Андан кийин кайра жумушка", why: "поворот: обратно на работу" },
  { id: "tempo", kind: "insert", from: V4_CUE.kayra2, to: V4_CUTS[2] - 0.15, words: "кайра ошол эле темпке кириш керек", why: "шкала темпа падает и снова поднимается" },
  { id: "zoom-tempo", kind: "zoom", from: V4_CUE.tempke, to: V4_CUTS[2], words: "темпке кириш керек", why: "мягкое приближение на усилии" },
  { id: "week", kind: "insert", from: V2_CUE.birok, to: V4_CUTS[3] - 0.1, words: "Бирок мектеп — жумасына беш күн", why: "пять дней подряд" },
  { id: "zoom-besh", kind: "zoom", from: V2_CUE.besh, to: V4_CUTS[3], words: "беш күн", why: "акцент на масштабе проблемы" },
  { id: "brand", kind: "insert", from: V2_CUE.balago, to: V4_CUTS[4] - 0.2, words: "BalaGo ушул күнүмдүк каттамды өзүбүзгө алабыз", why: "логотип и «Бишкек • Балдар үчүн такси»" },
  { id: "route", kind: "insert", from: V2_CUE.erteng - 0.3, to: V4_CUTS[5] - 0.1, words: "эртең менен үйдөн мектепке… мектептен үйгө", why: "маршрут ҮЙ → МЕКТЕП → ҮЙ" },
  { id: "instagram", kind: "cta-visual", from: V4_GESTURE.pointUpFrom, to: V4_CUE.zhe - 0.05, words: "профилдеги шилтемеге өтүңүз + жест вверх", why: "шапка @balago.kg и стрелка к ссылке в био" },
  { id: "whatsapp", kind: "cta-visual", from: V4_CUE.tomonku, to: V4_END_SEC, words: "төмөнкү WhatsApp номерге жазыңыз + жест вниз", why: "номер 0998 08 38 28 под рукой" },
  { id: "zoom-end", kind: "zoom", from: V4_CUE.biz, to: V4_END_SEC, words: "Биз дайыма кызматтабыз", why: "тёплое мягкое приближение к естественному финалу" },
];

export const V4_SFX: readonly { readonly at: number; readonly name: string; readonly volume: number }[] = [
  { at: V4_CUE.zhetkiruu, name: "tick", volume: 0.28 },
  { at: V4_CUE.keede, name: "pop", volume: 0.3 },
  { at: V4_CUE.emes, name: "alert", volume: 0.24 },
  { at: V2_CUE.toktotosuz, name: "stop", volume: 0.3 },
  { at: V2_CUE.zhetesiz, name: "success", volume: 0.24 },
  { at: V4_CUE.zhumushka, name: "pop", volume: 0.26 },
  { at: V4_CUE.kirish, name: "glide", volume: 0.28 },
  { at: V2_CUE.besh, name: "pop", volume: 0.3 },
  { at: V2_CUE.balago - 0.04, name: "thump", volume: 0.36 },
  { at: V2_CUE.mektepke3, name: "glide", volume: 0.24 },
  { at: V2_CUE.kayra3, name: "glide", volume: 0.24 },
  { at: V2_CUE.uygo + 0.1, name: "success", volume: 0.26 },
  { at: V4_GESTURE.pointUpFrom, name: "pop", volume: 0.3 },
  { at: V4_CUE.tomonku, name: "notify", volume: 0.22 },
];

const said = LIVE04_WORDS.map((w) => w.text.toLowerCase()).join(" ");

// Общий формат для scripts/live-videos/check.mjs.
export const PLAN = {
  task: "LIVE-004",
  version: "v4",
  liveSec: V4_END_SEC,
  direction: "Reels-микс: инфографика + динамичный разговор",
  inserts: V4_EFFECTS.filter((e) => e.kind === "insert" || e.kind === "cta-visual"),
  effects: V4_EFFECTS,
  sfx: V4_SFX,
  justification: "V4_BRIEF: баланс между v1 и v3, жёсткого лимита нет; каждая вставка привязана к своей фразе, одновременно в кадре — одна",
  cta: {
    spoken: /профилдеги шилтемеге өтүңүз/.test(said) && /whatsapp номерге жазыңыз/.test(said),
    words: "профилдеги шилтемеге өтүңүз же төмөнкү WhatsApp номерге жазыңыз",
    duplicated: false, // нет второй озвучки и финальной заставки; графика — иллюстрация слов и жестов
    visual: "шапка @balago.kg со стрелкой по жесту вверх; номер 0998 08 38 28 по жесту вниз",
  },
  city: { spoken: /бишкек/.test(said), onScreen: "Бишкек • Балдар үчүн такси (логотип BalaGo, 18,7–21,5 с; шапка маршрута)" },
} as const;
