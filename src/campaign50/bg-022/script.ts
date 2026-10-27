// BalaGo-50, выпуск №23 / BG-022 — «Бир сапар деген эмне?»
// («Что означает одна поездка?»; композиция BalaGoBG022, 2D, 1080×1920,
// 30 fps, ≈ 65–75 с).
//
// Приём: честная инфографика-ответ на вопрос. Одна непрерывная ярко-жёлтая
// линия рисуется на карте Бишкека от дома до школы (утро) и обратно
// (после уроков) — и замыкается в петлю. Петля складывается в большую
// цифру «1»: одна полная поездка = ҮЙ → МЕКТЕП → ҮЙ. Хук: «1 САПАР»
// делится на две стрелки и собирается обратно.
//
// Причинная ось: вопрос «1 сапар = ?» → первый этап (утро) → второй этап
// (после уроков) → два этапа складываются в одну поездку → тариф считается
// по одностороннему расстоянию школа–дом (без примеров цен) и первая
// полная пробная поездка бесплатна только после формирования группы →
// BalaGo в Бишкеке → CTA.
// Сюжетные кадры поездки помечены как условный пример «после формирования
// маршрута» — услуга не показана как доступная до подбора группы.
//
// Сценарий: campaigns/balago-50/episodes/23-BG-022.md.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG22_VIDEO = {
  id: "BalaGoBG022",
  output: "balago-bg-022",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-022/voice",
  // общие (read-only) файлы проекта: логотип, эффекты, музыка
  logo: "assets/logo.png",
  // Общая длительность считается по озвучке (timing.ts), но не короче:
  minSec: 62,
  maxSec: 90,
} as const;

// ---------- Сцены ----------
// Длина сцены — не меньше len (с); если речь длиннее, сцена растягивается
// так, чтобы после последней реплики оставалось tail секунд.
export type Bg22SceneId =
  | "hook"
  | "morning"
  | "afternoon"
  | "merge"
  | "price"
  | "cta";

export const BG22_SCENES: readonly {
  readonly id: Bg22SceneId;
  readonly title: string;
  readonly len: number;
  readonly tail: number;
}[] = [
  {
    id: "hook",
    title: "1. «1 САПАР = ?» — делится на две стрелки",
    len: 6.2,
    tail: 1.2,
  },
  {
    id: "morning",
    title: "2. 1-бөлүк: утро, ҮЙ → МЕКТЕП",
    len: 13.5,
    tail: 2.0,
  },
  {
    id: "afternoon",
    title: "3. 2-бөлүк: после уроков, МЕКТЕП → ҮЙ",
    len: 13.5,
    tail: 1.6,
  },
  { id: "merge", title: "4. Петля складывается в «1»", len: 10, tail: 2.4 },
  {
    id: "price",
    title: "5. Тариф по одностороннему расстоянию; проба после группы",
    len: 14,
    tail: 1.6,
  },
  // финал: оба способа связи и номер на экране всё время сцены,
  // после последнего слова ≥ 3 с (берём 3,6 с)
  {
    id: "cta",
    title: "6. Финал: Бишкек, профиль, WhatsApp",
    len: 14,
    tail: 3.6,
  },
];

// Финальный экран с контактами появляется через столько секунд после
// начала сцены cta и остаётся до конца ролика.
export const BG22_CONTACTS_IN = 0.8;

// ---------- Голос ----------
export type Bg22Role = "narrator";

export const BG22_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 2322,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовый голос диктора проекта (ElevenLabs Voice Design, кыргызская речь),
// проверенный в 2D-роликах №10–12 и выпусках BG-006/BG-007/BG-014;
// новые голоса не создаются.
export const BG22_VOICES: Record<
  Bg22Role,
  { readonly name: string; readonly voiceId: string; readonly from: string }
> = {
  narrator: {
    name: "KG-teacher",
    voiceId: "EBOfpUWl9G5ltD2PkFgy",
    from: "half-hour-2d",
  },
};

// ---------- Реплики ----------
export type Bg22Line = {
  readonly id: string;
  readonly role: Bg22Role;
  readonly scene: Bg22SceneId;
  // Начало речи: секунды от начала сцены, но не раньше чем через gap
  // секунд после конца предыдущей реплики.
  readonly at: number;
  readonly gap?: number;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

// Тексты — дословно по сценарию 23-BG-022.md (диктор).
export const BG22_LINES: readonly Bg22Line[] = [
  {
    id: "n01",
    role: "narrator",
    scene: "hook",
    at: 1.0,
    text: "BalaGo'до бир сапар деген эмнени билдирет?",
    spoken: "БалаГодо бир сапар деген эмнени билдирет?",
    tag: "[curious]",
  },
  {
    id: "n02",
    role: "narrator",
    scene: "morning",
    at: 1.2,
    text: "Биринчи бөлүгү — эртең менен үйдөн мектепке жеткирүү.",
  },
  {
    id: "n03",
    role: "narrator",
    scene: "afternoon",
    at: 1.0,
    text: "Экинчи бөлүгү — сабактан кийин мектептен кайра үйгө алып келүү.",
  },
  {
    id: "n04",
    role: "narrator",
    scene: "merge",
    at: 1.4,
    text: "Ушул эки багыт биригип, бир толук сапар болуп эсептелет.",
    tag: "[warmly]",
  },
  {
    id: "n05",
    role: "narrator",
    scene: "price",
    at: 0.8,
    text: "Баасы мектеп менен үйдүн ортосундагы бир тараптуу аралыкка жараша эсептелет.",
  },
  {
    id: "n06",
    role: "narrator",
    scene: "price",
    at: 0,
    gap: 0.6,
    text: "Каттам уюшулгандан кийин биринчи толук сыноо сапары акысыз.",
  },
  {
    id: "n07",
    role: "narrator",
    scene: "cta",
    at: 1.0,
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
    tag: "[warmly]",
  },
  {
    id: "n08",
    role: "narrator",
    scene: "cta",
    at: 0,
    gap: 0.35,
    text: "Каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken:
      "Каттоо үчүн профилдеги шилтемеге өтүңүз же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
  },
  {
    id: "n09",
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
  const l = BG22_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const BG22_TEXT = {
  hook: {
    title: "1 САПАР",
    question: "= ?",
    one: "Бир тарап?",
    two: "Барып-келүү?",
  },
  // условный пример: поездка показана только как будущий сценарий
  example: "Каттам уюшулгандан кийинки мисал",
  home: "ҮЙ",
  school: "МЕКТЕП",
  city: "Бишкек",
  part1: { badge: "1-бөлүк", title: "Эртең менен", route: "ҮЙ → МЕКТЕП" },
  part2: { badge: "2-бөлүк", title: "Сабактан кийин", route: "МЕКТЕП → ҮЙ" },
  belt: "Кур тагылды",
  lessons: "Сабактар",
  times: { am: "07:30", lessonsFrom: "08:00", pm: "13:00" },
  handover: "Ата-энесине же макулдашылган адамга гана",
  merge: {
    one: "1",
    word: "ТОЛУК САПАР",
    eq: "1 толук сапар",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    note: "Эки бөлүк — бир сапар",
  },
  price: {
    title: "Баасы кантип эсептелет?",
    measure: "Бир тараптуу аралык",
    km: "км",
    pair: "МЕКТЕП ↔ ҮЙ",
    rule: "Тариф ушул аралыкка жараша",
    perChild: "1 бала • 1 толук сапар",
    steps: [
      { title: "Арыз", note: "Дарек жана убакыт" },
      { title: "Топ түзүлөт", note: "3–4 бала • издөө 2 жумага чейин" },
      {
        title: "Биринчи толук сыноо сапары",
        note: "Каттам уюшулгандан кийин",
        badge: "Акысыз",
      },
    ],
  },
  cta: {
    brand: "BalaGo",
    city: "Бишкек • Балдар үчүн такси",
    route: "1 сапар = ҮЙ → МЕКТЕП → ҮЙ",
    link: "Профилдеги шилтемеге өтүңүз",
    or: "же WhatsApp аркылуу жазыңыз",
    whatsappLabel: "WhatsApp:",
    whatsappNumber: "0998 08 38 28",
  },
} as const;
