// BalaGo-50, выпуск №30 / BG-029 — «Чоң сапардын майда деталдары»
// («Маленькие детали большой поездки»), композиция BalaGoBG029, 2D,
// 1080×1920, 30 fps.
//
// Приём: предметная анимация, макропланы. На белом столе в Бишкеке
// маленькая рука раскладывает три детали поездки — ремень, бутылку воды
// 0,5 л и карточку «Ким тосот?». Каждый предмет движением переводит в
// свою сцену: пряжка → ребёнок пристёгнут на своём месте; бутылка
// перекатывается → вода в салоне; карточка раскрывается → встреча у дома
// с заранее согласованным взрослым. Затем три предмета складываются в
// день ҮЙ → МЕКТЕП → ҮЙ (условный пример, проба после формирования
// группы) → финал. Не слайд-шоу из карточек: переходы — реальные
// движения предметов.
//
// Сценарий: campaigns/balago-50/episodes/30-BG-029.md (утверждён владельцем).
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG29_VIDEO = {
  id: "BalaGoBG029",
  output: "balago-bg-029",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-029/voice",
  audioDir: "audio/campaign50/bg-029",
  logo: "assets/campaign50/bg-029/logo.png",
  // Общая длительность считается по озвучке (timing.ts), но не короче:
  minSec: 60,
  maxSec: 100,
} as const;

// ---------- Сцены ----------
// Длина сцены — не меньше len (с); если речь длиннее, сцена растягивается
// так, чтобы после последней реплики оставалось tail секунд.
export type Bg29SceneId = "hook" | "belt" | "water" | "pickup" | "day" | "cta";

export const BG29_SCENES: readonly {
  readonly id: Bg29SceneId;
  readonly title: string;
  readonly len: number;
  readonly tail: number;
}[] = [
  { id: "hook", title: "1. Стол: рука раскладывает ремень, воду и карточку", len: 6, tail: 1.3 },
  { id: "belt", title: "2. Через пряжку: ребёнок пристёгнут на своём месте", len: 9, tail: 1.5 },
  { id: "water", title: "3. Бутылка катится в салон: 0,5 л газсыз", len: 9, tail: 1.5 },
  { id: "pickup", title: "4. Карточка «Ким тосот?» → встреча у дома", len: 10, tail: 1.6 },
  { id: "day", title: "5. Предметы складываются в день ҮЙ → МЕКТЕП → ҮЙ", len: 10, tail: 1.8 },
  // финал: оба способа связи и номер на экране всё время сцены,
  // после последнего слова ≥ 3 с (берём 3,6 с)
  { id: "cta", title: "6. Финал: Бишкек, профиль, WhatsApp", len: 15, tail: 3.6 },
];

// Финальный экран с контактами появляется через столько секунд после
// начала сцены cta и остаётся до конца ролика.
export const BG29_CONTACTS_IN = 0.8;

// ---------- Голос ----------
export type Bg29Role = "narrator";

export const BG29_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 2930,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовый голос проекта (ElevenLabs Voice Design, кыргызская речь),
// проверенный в 2D-роликах №10–15 и №25; новые голоса не создаются.
export const BG29_VOICES: Record<Bg29Role, { readonly name: string; readonly voiceId: string; readonly from: string }> = {
  // спокойный доброжелательный голос диктора
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "half-hour-2d" },
};

// ---------- Реплики (дословно по сценарию 30-BG-029.md) ----------
// Текст каждой сцены разбит по предложениям: так картинка точнее следует
// за речью. Вместе реплики дают дословный текст сценария.
export type Bg29Line = {
  readonly id: string;
  readonly role: Bg29Role;
  readonly scene: Bg29SceneId;
  // Начало речи: секунды от начала сцены, но не раньше чем через gap
  // секунд после конца предыдущей реплики.
  readonly at: number;
  readonly gap?: number;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

export const BG29_LINES: readonly Bg29Line[] = [
  { id: "n01", role: "narrator", scene: "hook", at: 0.6, text: "Балдардын жолунда майда нерселер маанилүү эмеспи?", tag: "[curious]" },
  { id: "n02", role: "narrator", scene: "belt", at: 0.9, text: "Биринчиси — орун жана коопсуздук куру." },
  {
    id: "n03",
    role: "narrator",
    scene: "belt",
    at: 0,
    gap: 0.45,
    text: "Машинадагы ар бир балага ылайыктуу орун менен кур болушу керек.",
    tag: "[calm]",
  },
  { id: "n04", role: "narrator", scene: "water", at: 0.9, text: "Экинчиси — суу." },
  {
    id: "n05",
    role: "narrator",
    scene: "water",
    at: 0,
    gap: 0.45,
    text: "BalaGo унаасында жарым литр газсыз суу сунушталат: даамы бар же жөнөкөй.",
    spoken: "БалаГо унаасында жарым литр газсыз суу сунушталат: даамы бар же жөнөкөй.",
    tag: "[warmly]",
  },
  { id: "n06", role: "narrator", scene: "pickup", at: 0.9, text: "Үчүнчүсү — баланы ким тосуп алары." },
  {
    id: "n07",
    role: "narrator",
    scene: "pickup",
    at: 0,
    gap: 0.45,
    text: "Бала ата-энесине же алдын ала макулдашылган ишенимдүү адамга өткөрүлөт.",
    tag: "[calm]",
  },
  { id: "n08", role: "narrator", scene: "day", at: 0.9, text: "Мындай сапар алдын ала уюшулган каттамда болот." },
  {
    id: "n09",
    role: "narrator",
    scene: "day",
    at: 0,
    gap: 0.4,
    text: "Топ түзүлгөндөн кийин биринчи толук сыноо сапары акысыз, андан ары чечим сиздики.",
    tag: "[warmly]",
  },
  {
    id: "n10",
    role: "narrator",
    scene: "cta",
    at: 1.0,
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
    tag: "[warmly]",
  },
  {
    id: "n11",
    role: "narrator",
    scene: "cta",
    at: 0,
    gap: 0.35,
    text: "Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз.",
    spoken: "Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге Ватсап аркылуу жазыңыз.",
  },
  {
    id: "n12",
    role: "narrator",
    scene: "cta",
    at: 0,
    gap: 0.4,
    text: "BalaGo менен жолго чыгалы!",
    spoken: "БалаГо менен жолго чыгалы!",
    tag: "[warmly]",
  },
];

export const lineById = (id: string) => {
  const l = BG29_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const BG29_TEXT = {
  hook: {
    question: "МАЙДА НЕРСЕБИ?",
    answer: "МАЙДА НЕРСЕЛЕР — МААНИЛҮҮ",
    city: "Бишкек",
    card: "Ким тосот?",
    bottle: "0,5 л",
  },
  belt: {
    title: "1. Орун жана коопсуздук куру",
    own: "Ар бир балага — өз орду",
    buckled: "Кур тагылды",
  },
  water: {
    title: "2. Газсыз суу • 0,5 л",
    label: "0,5 л • газсыз",
    flavored: "даамдуу",
    plain: "жөнөкөй",
  },
  pickup: {
    title: "3. Алдын ала макулдашылган тосуп алуу",
    card: "Ким тосот?",
    options: ["Ата-энеси", "Макулдашылган ишенимдүү адам"],
    after: "Сабактан кийин",
    handed: "Колго өткөрүлдү",
  },
  day: {
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    am: "Эртең менен",
    pm: "Сабактан кийин",
    example: "Шарттуу мисал",
    trial: "Топ түзүлгөндөн кийин — биринчи толук сыноо сапары акысыз",
    choice: "Андан ары чечим — сиздики",
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
