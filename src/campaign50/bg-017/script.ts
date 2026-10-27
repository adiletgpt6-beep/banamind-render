// BalaGo-50, выпуск №18 / BG-017 «Рисунок нашей недели»
// («Биздин апта», композиция BalaGoBG017).
//
// Весь фильм — живой детский рисунок, камера над альбомом на столе. Ребёнок
// цветными мелками рисует свою неделю: жёлтые линии дороги в школу
// перепутаны с синими и зелёными линиями работы мамы и папы — получается
// огромный клубок. Руки родителей расправляют альбом, карандаш папы
// отмечает повторяющийся участок ҮЙ → МЕКТЕП → ҮЙ в каждом дне недели;
// родители сами решают поискать постоянный маршрут. Мама кладёт телефон и
// вручную ищет школьную перевозку, открывает BalaGo — только после её
// касания линия клубка выпрямляется в жёлтую схему маршрута, а затем
// честный порядок: подходящая группа → бесплатная первая полная пробная
// поездка → решение родителей. Лист складывается в открытку с контактами.
// Линии иллюстративные: не реальные улицы Бишкека.
//
// Шкала ролика не фиксирована: сцены и реплики выстраиваются по фактической
// длительности озвучки (timing.ts), речь никогда не ускоряется.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const B17_VIDEO = {
  id: "BalaGoBG017",
  output: "balago-bg-017",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-017",
} as const;

// ---------- Голоса ----------
export type B17Role = "child" | "mother" | "narrator";

export const B17_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 1717,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые кыргызские голоса проекта (ElevenLabs Voice Design), проверенные
// в прежних роликах замером MMS; новые голоса не создаются. Ребёнка (дочь),
// как принято в анимации, озвучивает мягкий высокий голос проекта — тон
// и темп механически не меняются.
export const B17_VOICES: Record<B17Role, { readonly name: string; readonly voiceId: string }> = {
  child: { name: "KG-daughter", voiceId: "AeboPz5CtE7qRUVvW93b" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
};

export const B17_ROLE_LABEL: Record<B17Role, string> = {
  child: "Кызы",
  mother: "Апасы",
  narrator: "",
};

// ---------- Сцены ----------
export type B17SceneId = "hook" | "week" | "notice" | "search" | "route" | "cta";

export type B17ScenePlan = {
  readonly id: B17SceneId;
  readonly title: string;
  // пауза до первой реплики сцены, с (действие без слов)
  readonly lead: number;
  // пауза после последней реплики до конца сцены, с
  readonly tail: number;
  // минимальная длительность сцены, с
  readonly min: number;
};

export const B17_SCENES: readonly B17ScenePlan[] = [
  // мелок рисует огромный жёлтый клубок, надпись «Биздин апта»
  { id: "hook", title: "1. Клубок", lead: 2.2, tail: 0.6, min: 6 },
  // рисунок оживает по дням недели; руки родителей у альбома
  { id: "week", title: "2. Неделя оживает", lead: 5.2, tail: 1.0, min: 12 },
  // родители расправляют альбом, карандаш отмечает повтор ҮЙ→МЕКТЕП→ҮЙ
  { id: "notice", title: "3. Повторяющаяся линия", lead: 3.4, tail: 1.6, min: 12 },
  // мама ищет в телефоне, открывает BalaGo; клубок выпрямляется
  { id: "search", title: "4. Поиск и BalaGo", lead: 3.6, tail: 1.0, min: 12 },
  // ҮЙ → МЕКТЕП → ҮЙ, порядок: группа → пробная поездка → решение
  { id: "route", title: "5. Маршрут и условия", lead: 1.6, tail: 2.2, min: 11 },
  // лист складывается в открытку с контактами
  { id: "cta", title: "6. Контакты", lead: 1.4, tail: 3.4, min: 12 },
];

// ---------- Реплики ----------
export type B17Line = {
  readonly id: string;
  readonly role: B17Role;
  readonly scene: B17SceneId;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
  // пауза после реплики, с (по умолчанию 0,5)
  readonly gapAfter?: number;
  readonly subtitle?: boolean; // false — без субтитра (финальный экран)
};

export const B17_LINES: readonly B17Line[] = [
  { id: "k01", role: "child", scene: "hook", text: "Бул биздин аптабыз! Түшүнүп жатасызбы?", tag: "[excited]" },
  { id: "m01", role: "mother", scene: "week", text: "Канча жол тартыпсың, балам!", tag: "[warmly]", gapAfter: 0.7 },
  { id: "k02", role: "child", scene: "week", text: "Сиздер мектепке улам барып келесиздер го.", tag: "[curious]" },
  {
    id: "n01",
    role: "narrator",
    scene: "notice",
    text: "Күн сайын кайталанган жолду сүрөттөн да байкоого болот.",
    gapAfter: 0.6,
  },
  { id: "n01b", role: "narrator", scene: "notice", text: "Аны алдын ала уюштуруунун жолу барбы?", tag: "[thoughtful]" },
  {
    id: "m02",
    role: "mother",
    scene: "search",
    text: "Мына, Бишкектеги мектеп каттамы жөнүндө маалымат бар экен.",
    gapAfter: 0.9,
  },
  {
    id: "n02",
    role: "narrator",
    scene: "search",
    text: "BalaGo — балдар үчүн алдын ала уюштурулган такси.",
    spoken: "БалаГо — балдар үчүн алдын ала уюштурулган такси.",
  },
  { id: "n03", role: "narrator", scene: "route", text: "Алгач ылайыктуу топ түзүлөт.", gapAfter: 0.55 },
  {
    id: "n03b",
    role: "narrator",
    scene: "route",
    text: "Андан соң биринчи толук сыноо сапары акысыз болуп, улантууну ата-эне чечет.",
  },
  {
    id: "n04",
    role: "narrator",
    scene: "cta",
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
    tag: "[warmly]",
    gapAfter: 0.4,
    subtitle: false,
  },
  // призыв разбит на две короткие фразы — каждая синтезируется чище
  {
    id: "n05",
    role: "narrator",
    scene: "cta",
    text: "Профилдеги шилтемеге өтүңүз",
    spoken: "Профилдеги шилтемеге өтүңүз,",
    gapAfter: 0.3,
    subtitle: false,
  },
  {
    id: "n05b",
    role: "narrator",
    scene: "cta",
    text: "же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken: "же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
    gapAfter: 0.45,
    subtitle: false,
  },
  {
    id: "n06",
    role: "narrator",
    scene: "cta",
    text: "BalaGo менен жолго чыгалы!",
    spoken: "БалаГо менен жолго чыгалы!",
    subtitle: false,
  },
];

// Первая реплика финального экрана; экран появляется чуть раньше неё.
export const B17_CTA_FIRST = "n04";
export const B17_CTA_LEAD = 0.6;
// Минимальные требования к финалу (AGENTS.md).
export const B17_CTA_MIN = 5;
export const B17_AFTER_LAST_WORD_MIN = 3;

export const lineById = (id: string) => {
  const l = B17_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const B17_TEXT = {
  title: "Биздин апта",
  // дни недели (кыргызча, сокращения как в школьном дневнике)
  days: [
    { short: "Дүй", full: "Дүйшөмбү", dest: "work" },
    { short: "Шей", full: "Шейшемби", dest: "school" },
    { short: "Шар", full: "Шаршемби", dest: "car" },
    { short: "Бей", full: "Бейшемби", dest: "work" },
    { short: "Жум", full: "Жума", dest: "school" },
  ],
  labels: { home: "ҮЙ", school: "МЕКТЕП", work: "ИШ" },
  repeat: "ҮЙ → МЕКТЕП → ҮЙ",
  times: "× 5",
  question: "Алдын ала пландасак?",
  // телефон мамы: ручной поиск
  search: {
    query: "Бишкек мектеп каттамы",
    results: [
      { title: "BalaGo — Балдар үчүн такси", sub: "Бишкек • үй → мектеп → үй", brand: true },
      { title: "Мектеп күн тартиби", sub: "Ата-энелер үчүн кеңештер", brand: false },
      { title: "Шаардык транспорт", sub: "Маршруттар жана убакыт", brand: false },
    ],
  },
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    button: "Алдын ала каттоо",
  },
  route: { home: "ҮЙ", school: "МЕКТЕП", morning: "Эртең менен", afternoon: "Сабактан кийин", trip: "1 толук сапар", example: "Шарттуу мисал" },
  steps: [
    { n: "1", text: "Ылайыктуу топ түзүлөт", sub: "3–4 бала, бир багыт" },
    { n: "2", text: "Биринчи толук сыноо сапары — акысыз", sub: "топ түзүлгөндөн кийин" },
    { n: "3", text: "Улантууну ата-эне чечет", sub: "төлөм — сыноо сапарынан кийин гана" },
  ],
  cta: {
    brand: "BalaGo",
    city: "Бишкек • Балдар үчүн такси",
    link: "Профилдеги шилтемеге өтүңүз",
    or: "же WhatsApp аркылуу жазыңыз",
    whatsapp: "WhatsApp: 0998 08 38 28",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    slogan: "BalaGo менен жолго чыгалы!",
  },
} as const;
