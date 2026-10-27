// BG-005 «Эки район» / «Два района» (кампания BalaGo-50, выпуск №06).
// Сценарий: campaigns/balago-50/episodes/06-BG-005.md (производственная редакция v1).
//
// Визуальный детектив кинематографичной карты Бишкека. Причинно-следственная ось:
//   палец соединяет «Жумуш» и «Мектеп» — между районами извивается жёлтая
//   дорога (хук) →
//   машина мамы: офис → школа → дом → снова офис; полоса рабочего дня
//   рвётся на две части (конфликт) →
//   мама в офисе сравнивает два пути и спрашивает себя, можно ли заранее
//   планировать школьный маршрут отдельно; ищет такой вариант в телефоне
//   и открывает BalaGo (связующее действие) →
//   условная заявка: үй, мектеп, убакыт; карта перестраивается в круг
//   ҮЙ → МЕКТЕП → ҮЙ, рабочий день снова целый →
//   несколько домов сходятся в небольшую совместимую группу (3–4 бала,
//   по местам и безопасности), подбор до 2 недель, затем первая полная
//   пробная поездка бесплатно →
//   нить маршрута выпрямляется в логотип, финал: Бишкек, ссылка в профиле
//   и WhatsApp 0998 08 38 28.
//
// География условная (без адресов и названий улиц); персонажи — художественный
// пример, не документальные клиенты.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG05_VIDEO = {
  id: "BalaGoBG005",
  output: "balago-bg-005",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-005",
} as const;

// ---------- Сцены ----------
// Длительность сцены = max(minSec, начало речи + речь + хвост): монтаж
// подстраивается под фактическую озвучку, речь не ускоряется и не режется.
export type Bg05SceneId =
  | "hook"
  | "detour"
  | "compare"
  | "apply"
  | "group"
  | "cta";

export const BG05_SCENES: readonly {
  readonly id: Bg05SceneId;
  readonly title: string;
  readonly minSec: number;
  readonly tailSec: number; // от конца последней реплики до конца сцены
}[] = [
  {
    id: "hook",
    title: "1. Карта: палец соединяет «Жумуш» и «Мектеп»",
    minSec: 6.2,
    tailSec: 1.2,
  },
  {
    id: "detour",
    title: "2. Крюк: офис → мектеп → үй → офис, день рвётся",
    minSec: 11,
    tailSec: 1.6,
  },
  // после вопроса мамы — поиск в телефоне и выбор BalaGo (связующее действие)
  {
    id: "compare",
    title: "3. Мама сравнивает пути и ищет решение",
    minSec: 12.5,
    tailSec: 5.4,
  },
  {
    id: "apply",
    title: "4. Заявка: үй, мектеп, убакыт → круг ҮЙ → МЕКТЕП → ҮЙ",
    minSec: 12,
    tailSec: 1.6,
  },
  {
    id: "group",
    title: "5. Дома сходятся в группу, затем пробная поездка",
    minSec: 10.5,
    tailSec: 1.8,
  },
  // финал держится ≥ 3 с после последнего слова (с запасом)
  {
    id: "cta",
    title: "6. Финал: Бишкек + оба контакта",
    minSec: 12,
    tailSec: 3.6,
  },
];

// ---------- Голоса ----------
export const BG05_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 501,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые кыргызские голоса проекта (ElevenLabs Voice Design), уже
// проверенные в 2D-роликах. Новые голоса не создаются; озвучка BG-005
// синтезируется заново (чужие MP3 не используются).
export type Bg05Role = "narrator" | "mother";
export const BG05_VOICES: Record<
  Bg05Role,
  { readonly name: string; readonly voiceId: string; readonly from: string }
> = {
  narrator: {
    name: "KG-teacher",
    voiceId: "EBOfpUWl9G5ltD2PkFgy",
    from: "half-hour-2d",
  },
  mother: {
    name: "KG-mother",
    voiceId: "5Xx0r0RX4XWEq5vEdv8p",
    from: "half-hour-2d",
  },
};

// ---------- Реплики (текст сценария без изменений) ----------
export type Bg05Line = {
  readonly id: string;
  readonly scene: Bg05SceneId;
  readonly role: Bg05Role;
  // начало речи: секунды от начала сцены (или после конца предыдущей
  // реплики той же сцены, если задан afterPrev)
  readonly lead: number;
  readonly afterPrev?: boolean;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

export const BG05_LINES: readonly Bg05Line[] = [
  {
    id: "n01",
    scene: "hook",
    role: "narrator",
    lead: 0.6,
    text: "Жумушуңуз бир райондо, балаңыздын мектеби башкасындабы?",
    tag: "[curious]",
  },
  {
    id: "n02",
    scene: "detour",
    role: "narrator",
    lead: 0.8,
    text: "Сабак бүткөн сайын узак жолго чыгуу жумуш күнүңүздү экиге бөлүшү мүмкүн.",
  },
  {
    id: "m01",
    scene: "compare",
    role: "mother",
    lead: 1.6,
    text: "Баламдын жолун өзүнчө алдын ала пландаса болобу?",
    tag: "[thoughtful]",
  },
  {
    id: "n03",
    scene: "apply",
    role: "narrator",
    lead: 0.8,
    text: "BalaGo — Бишкектеги балдар үчүн такси. Үй, мектеп жана убакыт боюнча ылайыктуу каттам түзүлөт.",
    spoken:
      "БалаГо — Бишкектеги балдар үчүн такси. Үй, мектеп жана убакыт боюнча ылайыктуу каттам түзүлөт.",
  },
  {
    id: "n04",
    scene: "group",
    role: "narrator",
    lead: 0.8,
    text: "Адегенде ылайыктуу топ тандалат. Андан кийин биринчи толук сыноо сапары акысыз өтөт.",
  },
  {
    id: "n05",
    scene: "cta",
    role: "narrator",
    lead: 0.8,
    text: "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken:
      "БалаГо — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
    tag: "[warmly]",
  },
  {
    id: "n06",
    scene: "cta",
    role: "narrator",
    lead: 0.45,
    afterPrev: true,
    text: "BalaGo менен жолго чыгалы!",
    spoken: "БалаГо менен жолго чыгалы!",
    tag: "[warmly]",
  },
];

// ---------- Экранные надписи (кыргызча) ----------
export const BG05_TEXT = {
  map: {
    work: "Жумуш",
    school: "Мектеп",
    home: "Үй",
    districtA: "Бир район",
    districtB: "Башка район",
    city: "Бишкек",
    note: "Шарттуу карта",
  },
  detour: {
    day: "Жумуш күнү",
    road: "жол",
    split: "экиге бөлүнөт",
    pickup: "Сабак бүттү",
    steps: ["Жумуш", "Мектеп", "Үй", "Жумуш"],
  },
  compare: {
    title: "Эки жол",
    now: "Азыр: күн сайын",
    nowRoute: "Жумуш → Мектеп → Үй → Жумуш",
    plan: "Өзүнчө, алдын ала",
    planRoute: "Үй → Мектеп → Үй",
    search: "Баланы мектепке жеткирүү, Бишкек",
    resultTitle: "BalaGo — Балдар үчүн такси",
    resultSub: "Бишкек • Үй → Мектеп → Үй",
  },
  apply: {
    title: "Арыз",
    example: "Мисал",
    fields: [
      { label: "Үйдүн дареги", value: "Үй" },
      { label: "Мектеп", value: "Мектеп" },
      { label: "Убакыт", value: "Эртең менен • Сабактан кийин" },
    ],
    send: "Жөнөтүү",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    dayWhole: "Жумуш күнү бүтүн",
  },
  group: {
    title: "Ылайыктуу топ",
    size: "3–4 бала",
    sizeNote: "орунга жана коопсуздукка жараша",
    search: "Топ издөө — 2 жумага чейин",
    steps: [
      { title: "Топ тандалат", note: "үй, мектеп, убакыт боюнча" },
      { title: "1-толук сыноо сапары", note: "акысыз" },
    ],
    trialRoute: "ҮЙ → МЕКТЕП → ҮЙ",
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
  const l = BG05_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};
