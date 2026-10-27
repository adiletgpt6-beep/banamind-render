// BalaGo-50, выпуск №17 — BG-016 «Мама сегодня не спешит»
// (композиция BalaGoBG016, 2D, 1080×1920, 30 fps).
//
// Хук-перевёртыш: секунда тишины среди будильников → «Баланын кыялы»
// (спокойное утро) → реверс в реальность (утренняя спешка) → мальчик
// ставит рядом таймеры «жумуш» и «мектеп» → мама открывает календарь
// и ищет способ спланировать поездки → BalaGo → условия → CTA.
//
// Единственный источник речи ролика: текст реплик ниже (сценарий
// campaigns/balago-50/episodes/17-BG-016.md). spoken — как произносить
// (BalaGo → БалаГо, WhatsApp → вотсап, номер словами); text — как писать.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG016_VIDEO = {
  id: "BalaGoBG016",
  output: "balago-bg-016-ep17",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-016",
} as const;

export type Bg016SceneId = "dream" | "reverse" | "timers" | "search" | "steps" | "cta";

// Сцены идут подряд; длительность сцены = max(min, конец последней реплики + tail).
export const BG016_SCENES: readonly {
  readonly id: Bg016SceneId;
  readonly title: string;
  readonly min: number; // с
  readonly tail: number; // с после конца речи в сцене
}[] = [
  { id: "dream", title: "1. Тишина среди будильников — «Баланын кыялы»", min: 6, tail: 1.3 },
  { id: "reverse", title: "2. Реверс: реальное утро", min: 10, tail: 0.9 },
  { id: "timers", title: "3. Два таймера и календарь", min: 10, tail: 2.2 },
  { id: "search", title: "4. Поиск и маршрут BalaGo", min: 10.5, tail: 1.0 },
  { id: "steps", title: "5. Шаги: арыз → топ → сыноо → чечим", min: 9.5, tail: 1.1 },
  { id: "cta", title: "6. Финал: Бишкек, профиль, WhatsApp", min: 12, tail: 3.6 },
];

export type Bg016Role = "son" | "mother" | "narrator";

export type Bg016Line = {
  readonly id: string;
  readonly role: Bg016Role;
  readonly scene: Bg016SceneId;
  readonly text: string; // как написано (субтитры)
  readonly spoken?: string; // как произносится (TTS)
  // Начало речи: через lead с от начала сцены (первая реплика сцены)
  // или через gap с после конца предыдущей реплики той же сцены.
  readonly lead?: number;
  readonly gap?: number;
  readonly tag?: string; // аудиотег интонации eleven_v3
  readonly seed?: number;
  // Субтитры: куски текста и номер слова произношения (spoken), с которого
  // кусок появляется.
  readonly chunks: readonly { readonly text: string; readonly w: number }[];
};

export const BG016_LINES: readonly Bg016Line[] = [
  {
    id: "c01",
    role: "son",
    scene: "dream",
    lead: 1.7,
    tag: "[curious]",
    text: "Апа, сиз бүгүн эмнеге шашпай жатасыз?",
    chunks: [{ text: "Апа, сиз бүгүн эмнеге шашпай жатасыз?", w: 0 }],
  },
  {
    id: "n01",
    role: "narrator",
    scene: "reverse",
    lead: 1.2,
    text: "Ар бир таңды шашпай баштоо кандай жакшы болмок.",
    chunks: [
      { text: "Ар бир таңды шашпай баштоо", w: 0 },
      { text: "кандай жакшы болмок.", w: 5 },
    ],
  },
  {
    id: "n02",
    role: "narrator",
    scene: "reverse",
    gap: 0.45,
    text: "Бирок мектеп менен жумуштун убактысы дайыма эле шайкеш келе бербейт.",
    chunks: [
      { text: "Бирок мектеп менен жумуштун убактысы", w: 0 },
      { text: "дайыма эле шайкеш келе бербейт.", w: 5 },
    ],
  },
  {
    id: "c02",
    role: "son",
    scene: "timers",
    lead: 1.5,
    text: "Апа, эртең мени сиз жеткиресизби?",
    chunks: [{ text: "Апа, эртең мени сиз жеткиресизби?", w: 0 }],
  },
  {
    id: "m01",
    role: "mother",
    scene: "timers",
    gap: 0.5,
    text: "Балам, каттамды алдын ала пландасак жакшы болот окшойт.",
    chunks: [
      { text: "Балам, каттамды алдын ала пландасак", w: 0 },
      { text: "жакшы болот окшойт.", w: 5 },
    ],
  },
  {
    id: "n03",
    role: "narrator",
    scene: "search",
    lead: 4.0,
    text: "BalaGo — Бишкекте мектепке жана сабактан кийин үйгө жеткирүү үчүн алдын ала уюштурулуучу каттам.",
    spoken: "БалаГо — Бишкекте мектепке жана сабактан кийин үйгө жеткирүү үчүн алдын ала уюштурулуучу каттам.",
    chunks: [
      { text: "BalaGo — Бишкекте мектепке", w: 0 },
      { text: "жана сабактан кийин үйгө жеткирүү үчүн", w: 3 },
      { text: "алдын ала уюштурулуучу каттам.", w: 9 },
    ],
  },
  {
    id: "n04",
    role: "narrator",
    scene: "steps",
    lead: 0.7,
    text: "Алгач багытка ылайык топ түзүлөт. Биринчи толук сыноо сапары акысыз, андан кийин өзүңүз чечим кабыл аласыз.",
    chunks: [
      { text: "Алгач багытка ылайык топ түзүлөт.", w: 0 },
      { text: "Биринчи толук сыноо сапары акысыз,", w: 5 },
      { text: "андан кийин өзүңүз чечим кабыл аласыз.", w: 10 },
    ],
  },
  {
    id: "n05",
    role: "narrator",
    scene: "cta",
    lead: 0.9,
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
    chunks: [{ text: "BalaGo — Бишкектеги балдар үчүн такси.", w: 0 }],
  },
  {
    id: "n06",
    role: "narrator",
    scene: "cta",
    gap: 0.35,
    text: "Профилдеги шилтеме аркылуу балаңызды каттаңыз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken:
      "Профилдеги шилтеме аркылуу балаңызды каттаңыз, же вотсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
    chunks: [
      { text: "Профилдеги шилтеме аркылуу балаңызды каттаңыз", w: 0 },
      { text: "же WhatsApp аркылуу", w: 5 },
      { text: "0998 08 38 28 номерине жазыңыз.", w: 8 },
    ],
  },
  {
    id: "n07",
    role: "narrator",
    scene: "cta",
    gap: 0.4,
    tag: "[warmly]",
    text: "BalaGo менен жолго чыгалы!",
    spoken: "БалаГо менен жолго чыгалы!",
    chunks: [{ text: "BalaGo менен жолго чыгалы!", w: 0 }],
  },
];

// ---------- Голоса ----------
export const BG016_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 1617,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые кыргызские голоса проекта (ElevenLabs Voice Design), уже
// проверенные в 2D-роликах (см. src/two-schedules-2d/script.ts, TS2_VOICES).
// Новые голоса не создаются. Мальчика, как принято в анимации, озвучивает
// светлый высокий голос; темп и высота тона не меняются.
export const BG016_VOICES: Record<Bg016Role, { readonly name: string; readonly voiceId: string }> = {
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
};

// ---------- Обязательный финал ----------
export const BG016_CTA = {
  city: "Бишкек • Балдар үчүн такси",
  profile: "Профилдеги шилтемеге өтүңүз",
  or: "же WhatsApp аркылуу жазыңыз",
  phone: "0998 08 38 28",
  phoneIntl: "+996 998 08 38 28",
  slogan: "BalaGo менен жолго чыгалы!",
  minVisibleSec: 5,
  minAfterVoiceSec: 3,
} as const;

export const DREAM_LABEL = "Баланын кыялы";
