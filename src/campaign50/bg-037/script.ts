// BG-037 «Качан төлөйм?» (кампания BalaGo-50, выпуск №37).
// Утверждённый сценарий: campaigns/balago-50/episodes/37-BG-037.md
// (утверждение владельца: episodes/APPROVAL-36-50.md, 15.10.2026).
//
// Единственный вопрос ролика — момент оплаты. Форма: разговор у кухонного
// стола + три физических конверта «Топ», «Сыноо», «Чечим»:
//   1. Мама с банковской картой: «катталганда эле төлөшүм керекпи?»
//   2. Папа раскладывает три конверта и читает условия.
//   3. Конверт «Топ»: подбор группы по адресу/школе/времени, «Азыр төлөм жок».
//   4. Конверт «Сыноо»: условный полный день ҮЙ → МЕКТЕП → ҮЙ, первая
//      полная проба — бесплатно («Шарттуу мисал» всё время сцены).
//   5. Конверт «Чечим»: «Улантам» / «Улантпайм»; карта — только после
//      решения продолжать: чечим → топтом → төлөм.
//   6. Финал: Бишкек, ссылка в профиле и WhatsApp 0998 08 38 28.
//
// Факты (campaigns/balago-50/BRAND_FACTS.md): оплата только после подбора
// совместимой группы, первой полной бесплатной пробы и решения родителя
// продолжать. Старт не обещан сразу; подбор группы не гарантирован.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG37_VIDEO = {
  id: "BalaGoBG037",
  output: "balago-bg-037",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-037",
} as const;

// ---------- Сцены ----------
// Длительность сцены = max(minSec, начало речи + речь + хвост): монтаж
// подстраивается под фактическую озвучку, речь не ускоряется и не режется.
export type Bg37SceneId = "hook" | "rules" | "group" | "trial" | "decide" | "cta";

export const BG37_SCENES: readonly {
  readonly id: Bg37SceneId;
  readonly title: string;
  readonly minSec: number;
  readonly tailSec: number; // от конца последней реплики до конца сцены
}[] = [
  { id: "hook", title: "1. Мама с картой: качан төлөйм?", minSec: 6, tailSec: 1.0 },
  { id: "rules", title: "2. Папа: три конверта, условия", minSec: 11, tailSec: 2.4 },
  { id: "group", title: "3. Конверт «Топ»: подбор, азыр төлөм жок", minSec: 13, tailSec: 1.8 },
  { id: "trial", title: "4. Конверт «Сыноо»: полный день акысыз", minSec: 13, tailSec: 2.2 },
  { id: "decide", title: "5. Конверт «Чечим»: чечим → топтом → төлөм", minSec: 13.5, tailSec: 3.0 },
  // финал держится ≥ 3 с после последнего слова (с запасом)
  { id: "cta", title: "6. Финал: Бишкек + оба контакта", minSec: 16, tailSec: 3.8 },
];

// ---------- Голоса ----------
export type Bg37Role = "mother" | "father" | "narrator";

export const BG37_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 3701,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые кыргызские голоса проекта (ElevenLabs), уже проверенные в
// 2D-роликах (src/two-schedules-2d/script.ts). Новые голоса не создаются.
export const BG37_VOICES: Record<Bg37Role, { readonly name: string; readonly voiceId: string }> = {
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
};

// ---------- Реплики (утверждённый текст сценария без изменений) ----------
export type Bg37Line = {
  readonly id: string;
  readonly role: Bg37Role;
  readonly scene: Bg37SceneId;
  // начало речи: секунды от начала сцены (или после конца предыдущей
  // реплики той же сцены, если задан afterPrev)
  readonly lead: number;
  readonly afterPrev?: boolean;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

export const BG37_LINES: readonly Bg37Line[] = [
  {
    id: "m01",
    role: "mother",
    scene: "hook",
    lead: 0.9,
    text: "BalaGo'го катталганда эле төлөшүм керекпи?",
    spoken: "БалаГого катталганда эле төлөшүм керекпи?",
    tag: "[curious]",
  },
  {
    id: "f02",
    role: "father",
    scene: "rules",
    lead: 1.4,
    text: "Адегенде шарттарын карап чыгалы. Бул кызмат дароо башталчу такси эмес экен.",
    tag: "[calm]",
  },
  {
    id: "n03",
    role: "narrator",
    scene: "group",
    lead: 0.8,
    text: "Биринчи кадамда дарек, мектеп жана убакыт боюнча ылайыктуу топ изделет. Арыз берүү төлөмдү да, эртеңки каттамды да билдирбейт.",
  },
  {
    id: "n04",
    role: "narrator",
    scene: "trial",
    lead: 0.8,
    text: "Топ түзүлгөндө гана биринчи толук сыноо сапары өтөт. Ал сапар толугу менен акысыз.",
  },
  {
    id: "n05",
    role: "narrator",
    scene: "decide",
    lead: 0.8,
    text: "Сынап көргөн соң чечим сиздики. Кызматты улантууну тандасаңыз, андан кийин гана сапар топтому үчүн төлөйсүз.",
  },
  {
    id: "n06",
    role: "narrator",
    scene: "cta",
    lead: 0.8,
    text: "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз.",
    spoken:
      "БалаГо — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге Ватсап аркылуу жазыңыз.",
    tag: "[warmly]",
  },
  { id: "n07", role: "narrator", scene: "cta", lead: 0.45, afterPrev: true, text: "BalaGo менен жолго чыгалы!", spoken: "БалаГо менен жолго чыгалы!", tag: "[warmly]" },
];

// ---------- Экранные надписи (кыргызча) ----------
export const BG37_TEXT = {
  hook: {
    title: "КАТТАЛГАНДА ЭЛЕ ТӨЛӨЙМБҮ?",
    letter: "Катталуу",
    envApply: "Арыз",
    envPay: "Төлөм",
    pay: "ТӨЛӨМ",
  },
  rules: {
    title: "Адегенде шарттарды түшүнөбүз",
    sheet: "Шарттар",
    envelopes: ["Топ", "Сыноо", "Чечим"] as const,
  },
  group: {
    step: "1. Ылайыктуу топ изделет",
    noPay: "Азыр төлөм жок",
    cards: ["Дарек", "Мектеп", "Убакыт"] as const,
    match: "Ылайык",
    noMatch: "Ылайык эмес",
    tomorrow: "Эртең?",
  },
  trial: {
    step: "2. ҮЙ → МЕКТЕП → ҮЙ",
    free: "Биринчи сыноо акысыз",
    sample: "Шарттуу мисал",
    morning: "Эртең менен",
    afternoon: "Сабактан кийин",
    home: "ҮЙ",
    school: "МЕКТЕП",
  },
  decide: {
    step: "3. Чечим → топтом → төлөм",
    yes: "Улантам",
    no: "Улантпайм",
    chain: ["Чечим", "Топтом", "Төлөм"] as const,
  },
  cta: {
    brand: "BalaGo",
    city: "Бишкек • Балдар үчүн такси",
    order: "Төлөм — сыноодон жана чечимден кийин",
    link: "Профилдеги шилтемеге өтүңүз",
    or: "же WhatsApp аркылуу жазыңыз",
    whatsappLabel: "WhatsApp:",
    whatsappNumber: "0998 08 38 28",
  },
} as const;

export const lineById = (id: string) => {
  const l = BG37_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};
