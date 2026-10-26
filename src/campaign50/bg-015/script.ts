// BalaGo-50 • выпуск №16 • BG-015 «Прогулка после работы» (BalaGoBG015).
//
// Явный источник речи и экранных надписей ролика. Сценарий:
// campaigns/balago-50/episodes/16-BG-015.md (утверждён к производству).
//
// Сюжет: вечер, сын у окна с воздушным змеем просит папу выйти погулять,
// папа доделывает работу. Тот же день по шагам: папа уходит из офиса днём,
// сам забирает сына из школы, везёт домой и снова открывает ноутбук.
// Вечером папа видит рисунок сына и календарь, где школьный маршрут
// повторяется каждый день, — и сам начинает искать заранее организованную
// поездку. Находит BalaGo (Бишкек, ҮЙ → МЕКТЕП → ҮЙ), условия: сначала
// подбирается подходящая группа, первая полная пробная поездка бесплатна.
// Тот же проезд камеры от окна к скамейке, что в начале, повторяется как
// «возможная картина, когда маршрут организован» — с пометкой, не как
// уже оказанная услуга. Финал: Бишкек, ссылка в профиле и WhatsApp.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG15_VIDEO = {
  id: "BalaGoBG015",
  output: "balago-bg-015",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-015",
} as const;

export type Bg15Role = "father" | "son" | "narrator";

// ElevenLabs eleven_v3, кыргызский. Голоса — уже проверенные голоса
// проекта (src/two-schedules-2d/script.ts, TS2_VOICES); новые не создаются.
export const BG15_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 1516,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

export const BG15_VOICES: Record<Bg15Role, { readonly name: string; readonly voiceId: string }> = {
  // спокойный низкий голос папы (≈110 Гц)
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  // светлый звонкий голос мальчика (≈286 Гц)
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
  // доброжелательный голос диктора
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
};

// ---------- Сцены ----------
// Длительность сцены не фиксирована: она подстраивается под фактическую
// длину реплик (речь не ускоряется). lead — пауза от начала сцены до первой
// реплики, gap — пауза перед следующей репликой, tail — после последней.
export type Bg15SceneId = "hook" | "day" | "think" | "search" | "steps" | "cta";

export type Bg15Scene = {
  readonly id: Bg15SceneId;
  readonly title: string;
  readonly minSec: number;
  readonly tail: number;
};

export const BG15_SCENES: readonly Bg15Scene[] = [
  { id: "hook", title: "1. Кечки терезе жана бош отургуч", minSec: 9, tail: 0.9 },
  { id: "day", title: "2. Ошол эле күн", minSec: 11, tail: 0.9 },
  { id: "think", title: "3. Сүрөт, календарь, чечим", minSec: 10, tail: 1.9 },
  { id: "search", title: "4. BalaGo баракчасы", minSec: 11.5, tail: 1.0 },
  { id: "steps", title: "5. Шарттар жана мүмкүн болгон көрүнүш", minSec: 11, tail: 3.4 },
  { id: "cta", title: "6. Финал: Бишкек, профиль, WhatsApp", minSec: 12, tail: 3.6 },
];

// ---------- Реплики ----------
export type Bg15Line = {
  readonly id: string;
  readonly role: Bg15Role;
  readonly scene: Bg15SceneId;
  // пауза перед речью: от начала сцены (первая реплика сцены) или от конца
  // предыдущей реплики (секунды)
  readonly pause: number;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number;
  readonly subtitle?: boolean; // по умолчанию — да
};

export const BG15_LINES: readonly Bg15Line[] = [
  { id: "s01", role: "son", scene: "hook", pause: 3.3, text: "Ата, бүгүн сейилдөөгө чыгабызбы?", tag: "[hopeful]", seed: 1730 },
  { id: "f01", role: "father", scene: "hook", pause: 0.5, text: "Көрөлү, балам, жумушумду бүтүрүп алайын.", tag: "[tired]" },
  {
    id: "n01",
    role: "narrator",
    scene: "day",
    pause: 0.7,
    text: "Кээде мектепке барып келүү жумуш күнүңүздү бөлүп, бүтпөгөн иштерди кечке калтырат.",
  },
  {
    id: "f02",
    role: "father",
    scene: "think",
    pause: 3.4,
    text: "Жолду күн сайын өзүм уюштурбай, алдын ала башкача пландаштырсамчы?",
    tag: "[thoughtful]",
  },
  {
    id: "n02",
    role: "narrator",
    scene: "search",
    pause: 1.7,
    text: "BalaGo — Бишкектеги балдар үчүн алдын ала уюштурулган мектеп каттамы. Үйдөн мектепке, сабактан кийин кайра үйгө.",
    spoken: "БалаГо — Бишкектеги балдар үчүн алдын ала уюштурулган мектеп каттамы. Үйдөн мектепке, сабактан кийин кайра үйгө.",
  },
  {
    id: "n03",
    role: "narrator",
    scene: "steps",
    pause: 0.6,
    text: "Адегенде ылайыктуу топ түзүлөт. Биринчи толук сыноо сапары акысыз. Андан кийин улантууну өзүңүз чечесиз.",
  },
  {
    id: "n04",
    role: "narrator",
    scene: "cta",
    pause: 0.9,
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
    tag: "[warmly]",
    subtitle: false,
  },
  {
    id: "n05",
    role: "narrator",
    scene: "cta",
    pause: 0.35,
    text: "Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken:
      "Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
    subtitle: false,
  },
  {
    id: "n06",
    role: "narrator",
    scene: "cta",
    pause: 0.35,
    text: "BalaGo менен жолго чыгалы!",
    spoken: "БалаГо менен жолго чыгалы!",
    tag: "[warmly]",
    subtitle: false,
  },
];

export const lineById = (id: string) => {
  const l = BG15_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const BG15_TEXT = {
  city: "Бишкек",
  hookTime: "20:40",
  dayTimes: ["12:30", "13:00", "13:20", "14:00"],
  dayLabels: ["Жумуштан чыгуу", "Мектептен алуу", "Үйгө жеткирүү", "Кайра жумуш"],
  evening: "19:30",
  laptopTask: "Бүгүнкү иш: 3 / 6",
  drawing: { caption: "Ата экөөбүз" },
  calendar: {
    title: "Октябрь",
    days: ["Дш", "Шй", "Шр", "Бш", "Жм"],
    mark: "12:30 • мектеп",
    nextWeek: "Кийинки жума",
  },
  search: {
    query: "Бишкек мектеп каттамы",
    results: [
      { title: "BalaGo — Балдар үчүн такси", url: "balago.kg", text: "Алдын ала уюштурулган мектеп каттамы. Бишкек." },
      { title: "Мектепке жол: ата-энелерге кеңештер", url: "kabar.kg", text: "Балдардын коопсуз жолу жөнүндө макала." },
    ],
  },
  page: {
    brand: "BalaGo",
    tagline: "Бишкектеги балдар үчүн такси",
    fields: [
      ["Үй", "Дарек"],
      ["Мектеп", "Мектептин аты"],
      ["Убакыт", "Сабак башталат / бүтөт"],
    ],
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    routeNote: "1 толук сапар: эртең менен мектепке, сабактан кийин үйгө",
  },
  steps: [
    { n: "1", title: "Арыз", text: "Үй, мектеп жана убакыт" },
    { n: "2", title: "Ылайыктуу топ", text: "3–4 бала • издөө 2 жумага чейин" },
    { n: "3", title: "Сыноо сапары", text: "Биринчи толук сапар — акысыз" },
  ],
  stepsNote: "Андан кийин улантууну өзүңүз чечесиз",
  possible: "Каттам уюшулганда — мүмкүн болгон көрүнүш",
  possibleSub: "Шарттуу мисал",
  cta: {
    brand: "BalaGo",
    cityLine: "Бишкек • Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    link: "Профилдеги шилтемеге өтүңүз",
    or: "же WhatsApp аркылуу жазыңыз",
    whatsappLabel: "WhatsApp",
    whatsappNumber: "0998 08 38 28",
    slogan: "BalaGo менен жолго чыгалы!",
  },
} as const;
