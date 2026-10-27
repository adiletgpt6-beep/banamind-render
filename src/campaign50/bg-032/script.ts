// BG-032 «7, 12 или 20 километров?» (кампания BalaGo-50, пилот 2).
// Утверждённый сценарий: campaigns/balago-50/scripts/BG-032.md.
//
// Честная динамичная инфографика без семейной драмы. Визуальная логика:
// вопрос → две точки (мектеп и үй) и одностороннее расстояние для расчёта →
// три тарифные границы 7 / 12 / 20 км (белая машина BalaGo едет по
// маршруту, цифра превращается в ценник) → одна цена = ҮЙ → МЕКТЕП → ҮЙ
// (утром и после уроков) → финал: Бишкек, ссылка в профиле и
// WhatsApp 0998 08 38 28.
//
// Тарифы (сайт BalaGo, src/data/distancePricing.ts; campaigns/balago-50/
// BRAND_FACTS.md): за одного ребёнка за одну полную поездку, по расстоянию
// школа ↔ дом в одну сторону: ≤ 7 км — 1000 сом; > 7 … ≤ 12 км — 1200 сом;
// > 12 … ≤ 20 км — 1500 сом; свыше 20 км пока не обслуживается.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG32_VIDEO = {
  id: "BalaGoBG032",
  output: "balago-bg-032",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-032",
} as const;

// ---------- Тарифы (единственный источник цифр ролика) ----------
export const BG32_TIERS = [
  { id: "t1", fromKm: 0, toKm: 7, price: 1000 },
  { id: "t2", fromKm: 7, toKm: 12, price: 1200 },
  { id: "t3", fromKm: 12, toKm: 20, price: 1500 },
] as const;
export const BG32_MAX_KM = 20;

// Тариф по расстоянию школа ↔ дом в одну сторону (границы включительно).
export const priceForKm = (km: number): number | null => {
  if (!(km >= 0) || km > BG32_MAX_KM) return null;
  return BG32_TIERS.find((t) => km <= t.toKm)!.price;
};

// ---------- Сцены ----------
// Длительность сцены = max(minSec, начало речи + речь + хвост): монтаж
// подстраивается под фактическую озвучку, речь не ускоряется и не режется.
export type Bg32SceneId = "hook" | "t1" | "t2" | "t3" | "full" | "cta";

export const BG32_SCENES: readonly {
  readonly id: Bg32SceneId;
  readonly title: string;
  readonly minSec: number;
  readonly tailSec: number; // от конца последней реплики до конца сцены
}[] = [
  { id: "hook", title: "1. Вопрос: 7, 12, 20 км", minSec: 4.2, tailSec: 0.9 },
  { id: "t1", title: "2. База расчёта + ≤ 7 км — 1000", minSec: 10.5, tailSec: 1.2 },
  { id: "t2", title: "3. 7–12 км — 1200", minSec: 8.8, tailSec: 1.2 },
  { id: "t3", title: "4. 12–20 км — 1500, > 20 нет", minSec: 9.2, tailSec: 1.4 },
  { id: "full", title: "5. ҮЙ → МЕКТЕП → ҮЙ", minSec: 9.6, tailSec: 1.3 },
  // финал держится ≥ 3 с после последнего слова (с запасом)
  { id: "cta", title: "6. Финал: Бишкек + оба контакта", minSec: 10, tailSec: 3.6 },
];

// ---------- Голос ----------
export const BG32_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 3201,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовый кыргызский голос проекта (ElevenLabs Voice Design), уже
// проверенный в 2D-роликах: спокойный доброжелательный дикторский голос
// (CER 2,1 % по MMS). Новые голоса не создаются.
export const BG32_VOICE = { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "half-hour-2d" } as const;

// ---------- Реплики (утверждённый текст сценария без изменений) ----------
export type Bg32Line = {
  readonly id: string;
  readonly scene: Bg32SceneId;
  // начало речи: секунды от начала сцены (или после конца предыдущей
  // реплики той же сцены, если задан afterPrev)
  readonly lead: number;
  readonly afterPrev?: boolean;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

export const BG32_LINES: readonly Bg32Line[] = [
  { id: "n01", scene: "hook", lead: 0.35, text: "Балаңызды мектепке жеткирүү канча турат?", tag: "[curious]" },
  {
    id: "n02",
    scene: "t1",
    lead: 0.7,
    text: "Мектептен үйгө чейинки аралык жети чакырымга чейин болсо, бир толук сапар — миң сом.",
  },
  { id: "n03", scene: "t2", lead: 0.7, text: "Жетиден ашып, он эки чакырымга чейин болсо — миң эки жүз сом." },
  { id: "n04", scene: "t3", lead: 0.7, text: "Он экиден ашып, жыйырма чакырымга чейин — миң беш жүз сом." },
  {
    id: "n05",
    scene: "full",
    lead: 0.7,
    text: "Бул баа бир тарапка эмес: эртең менен мектепке, сабактан кийин кайра үйгө жеткирүү үчүн.",
  },
  {
    id: "n06",
    scene: "cta",
    lead: 0.7,
    text: "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken:
      "БалаГо — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
    tag: "[warmly]",
  },
  { id: "n07", scene: "cta", lead: 0.45, afterPrev: true, text: "BalaGo менен жолго чыгалы!", spoken: "БалаГо менен жолго чыгалы!", tag: "[warmly]" },
];

// ---------- Экранные надписи (кыргызча) ----------
export const BG32_TEXT = {
  question: "Балаңызды мектепке жеткирүү канча турат?",
  school: "МЕКТЕП",
  home: "ҮЙ",
  city: "Бишкек",
  km: "км",
  basis: "Мектеп ↔ Үй аралыгы • бир тарапка",
  perChild: "1 бала • 1 толук сапар",
  tiers: [
    { range: "7 кмге чейин", note: "Так 7 км да ушул баада" },
    { range: "7ден ашык — 12 кмге чейин", note: "Так 12 км да ушул баада" },
    { range: "12ден ашык — 20 кмге чейин", note: "Так 20 км да ушул баада" },
  ],
  over: "20 кмден ашык — азырынча тейленбейт",
  som: "сом",
  full: {
    title: "ҮЙ → МЕКТЕП → ҮЙ",
    morning: "Эртең менен",
    morningRoute: "Үй → Мектеп",
    afternoon: "Сабактан кийин",
    afternoonRoute: "Мектеп → Үй",
    one: "Бир баа = эки багыт",
    notOneWay: "бир тарапка эмес",
  },
  cta: {
    brand: "BalaGo",
    city: "Бишкек • Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    link: "Профилдеги шилтемеге өтүңүз",
    or: "же WhatsApp аркылуу жазыңыз",
    whatsappLabel: "WhatsApp:",
    whatsappNumber: "0998 08 38 28",
  },
} as const;

export const lineById = (id: string) => {
  const l = BG32_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};
