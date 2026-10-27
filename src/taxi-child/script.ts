// Ролик BalaGo — «Сабак бүттү» (композиция TaxiChildLessonsOver; по сценарию
// Taxi Child, название сервиса заменено на BalaGo).
// Рекламный 2D-ролик для таргета: 1080×1920, 30 fps, ровно 60 с.
//
// Уроки ребёнка заканчиваются раньше рабочего дня родителей. Ролик
// показывает регулярный школьный трансфер BalaGo: дом → школа → дом,
// группа из 3–4 детей, один знакомый водитель, сообщения водителя и
// геолокация в WhatsApp-группе родителей, передача ребёнка согласованному
// взрослому, цена от 1000 сомов за полный маршрут, бесплатный пробный день
// при группе от трёх детей; в финале — ссылка в профиле и WhatsApp 0998 08 38 28.
//
// Озвучка — один диктор (кыргызский), надписи и субтитры — кыргызча;
// название BalaGo и WhatsApp — латиницей, логотип BalaGo (public/assets/logo.png).
// Без неподтверждённых цифр стажа, бейджей проверок, таймеров и обещаний
// «начать завтра» или абсолютной безопасности.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const TC_VIDEO = {
  id: "TaxiChildLessonsOver",
  output: "taxi-child-sabak-buttu",
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 60,
  voiceDir: "audio/taxi-child",
} as const;

export const TC_FRAMES = TC_VIDEO.durationSec * TC_VIDEO.fps;

// ---------- Сцены: бюджет времени по сценарию (секунды) ----------
// Это план, а не жёсткая сетка: фактические границы сцен считаются по
// длительности естественной озвучки (timing.ts → buildTcTimeline), сумма
// всегда ровно 60 с. Диктор не ускоряется ради монтажа.
export type TcSceneId =
  | "hook"
  | "service"
  | "group"
  | "whatsapp"
  | "handoff"
  | "price"
  | "trial"
  | "cta";

export const TC_SCENES: readonly {
  readonly id: TcSceneId;
  readonly title: string;
  readonly budget: readonly [number, number]; // по сценарию
  readonly min: number; // меньше нельзя: не успеть показать действие
  readonly lead: number; // пауза до речи в начале сцены
}[] = [
  {
    id: "hook",
    title: "1. Уроки закончились, работа продолжается",
    budget: [0, 5],
    min: 4,
    lead: 0.3,
  },
  {
    id: "service",
    title: "2. Услуга и оба направления",
    budget: [5, 13],
    min: 6.5,
    lead: 0.4,
  },
  {
    id: "group",
    title: "3. Небольшая группа и знакомый водитель",
    budget: [13, 21],
    min: 6.5,
    lead: 0.4,
  },
  {
    id: "whatsapp",
    title: "4. Родитель получает информацию о поездке",
    budget: [21, 30],
    min: 7.5,
    lead: 0.4,
  },
  {
    id: "handoff",
    title: "5. Возвращение домой и передача взрослому",
    budget: [30, 37],
    min: 6,
    lead: 0.4,
  },
  {
    id: "price",
    title: "6. Цена за полный маршрут",
    budget: [37, 45],
    min: 7,
    lead: 0.4,
  },
  {
    id: "trial",
    title: "7. Бесплатный пробный день",
    budget: [45, 53],
    min: 6.5,
    lead: 0.4,
  },
  {
    id: "cta",
    title: "8. Ссылка в профиле или WhatsApp",
    budget: [53, 60],
    min: 6.5,
    lead: 0.35,
  },
];

// Пауза после речи до следующей сцены и запас в конце ролика.
export const TC_TAIL = 0.35;
export const TC_END_PAD = 0.7; // речь заканчивается не позже 59,3 с

// ---------- Голос ----------
// Один взрослый диктор: мягкий, уверенный, естественная кыргызская речь.
// Готовый кыргызский голос проекта (ElevenLabs Voice Design) — спокойный
// доброжелательный женский голос финала ролика №12 (CER 2,1 %).
export const TC_VOICE = {
  name: "KG-teacher",
  voiceId: "EBOfpUWl9G5ltD2PkFgy",
  from: "half-hour-2d",
} as const;

export type TcLine = {
  readonly id: string;
  readonly role: "narrator";
  readonly scene: TcSceneId;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

// Текст диктора — по сценарию (название — BalaGo, финал — ссылка в профиле
// или WhatsApp). BalaGo звучит как «БалаГо», WhatsApp — «Ватсап», числа и
// номер телефона — словами.
export const TC_LINES: readonly TcLine[] = [
  {
    id: "n1",
    role: "narrator",
    scene: "hook",
    text: "Сабак бүттү. А сиздин жумуш күнүңүз бүтө элек.",
  },
  {
    id: "n2",
    role: "narrator",
    scene: "service",
    text: "BalaGo — балаңызды үйдөн мектепке, сабактан кийин кайра үйгө жеткирген кызмат.",
    spoken:
      "БалаГо — балаңызды үйдөн мектепке, сабактан кийин кайра үйгө жеткирген кызмат.",
  },
  {
    id: "n3",
    role: "narrator",
    scene: "group",
    text: "Жолу жана убактысы дал келген үч-төрт бала чогуу барат. Каттамда — бир эле тааныш айдоочу.",
  },
  {
    id: "n4",
    role: "narrator",
    scene: "whatsapp",
    text: "Айдоочу WhatsApp тобуна баланы алганын жана жеткиргенин жазат. Унаанын геолокациясын да көрө аласыз.",
    spoken:
      "Айдоочу Ватсап тобуна баланы алганын жана жеткиргенин жазат. Унаанын геолокациясын да көрө аласыз.",
  },
  {
    id: "n5",
    role: "narrator",
    scene: "handoff",
    text: "Балаңызды сизге же алдын ала макулдашылган адамга гана тапшырабыз.",
  },
  {
    id: "n6",
    role: "narrator",
    scene: "price",
    text: "Үйдөн мектепке, кайра үйгө — бир толук сапар. Бир балага миң сомдон башталат.",
  },
  {
    id: "n7",
    role: "narrator",
    scene: "trial",
    text: "Кеминде үч бала чогулганда, биринчи толук күндү акысыз сынап көрүңүз.",
  },
  {
    id: "n8",
    role: "narrator",
    scene: "cta",
    text: "Профилдеги шилтеме аркылуу өтүңүз же WhatsApp'ка жазыңыз: 0998 08 38 28.",
    spoken:
      "Профилдеги шилтеме аркылуу өтүңүз же Ватсапка жазыңыз: нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз.",
    tag: "[warmly]",
  },
];

export const tcLineById = (id: string) => {
  const l = TC_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const TC_TEXT = {
  brand: "BalaGo",
  hook: {
    time: "13:00",
    caption: ["Сабак бүттү.", "А сиз жумуштасыз."],
    reminder: "Баланы мектептен алуу",
    doc: "Чейрек отчёту",
  },
  service: {
    sub: "Балдар үчүн мектеп трансфери",
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
  },
  group: {
    first: "Бир каттамда 3–4 бала",
    second: "Бир эле тааныш айдоочу",
    days: ["Шейшемби", "Шаршемби"],
  },
  whatsapp: {
    caption: "WhatsApp: билдирүүлөр жана геолокация",
    group: "3-каттам · ата-энелер",
    members: "Айдоочу, ата-энелер",
    driver: "Айдоочу",
    msg1: "Бала унаада.",
    msg2: "Мектепке жеттик.",
    location: "Геолокация",
    t1: "07:42",
    t2: "08:05",
    t3: "08:06",
  },
  handoff: {
    caption: ["Алдын ала макулдашылган", "чоң кишиге тапшырабыз"],
    msg: "Үйгө жеттик.",
    time: "13:41",
  },
  price: {
    main: "1000 сомдон",
    per: "/ бала",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    note1: "Так баа аралыкка жараша",
    note2: "Пакеттер 10 сапардан",
  },
  trial: {
    main: "Биринчи толук күн —",
    free: "АКЫСЫЗ",
    cond: "Каттамга кеминде 3 бала чогулганда",
    day: "1-күн",
    to: "Үй → Мектеп",
    back: "Мектеп → Үй",
  },
  cta: {
    city: "Бишкек · Үй → Мектеп → Үй",
    line: "Балаңыздын каттамын чогуу пландайлы",
    button: "Профилдеги шилтеме аркылуу",
    or: "же",
    whatsappLabel: "WhatsApp",
    whatsappNumber: "0998 08 38 28",
  },
} as const;
