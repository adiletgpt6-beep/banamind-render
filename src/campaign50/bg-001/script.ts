// BG-001 «Восемь открытых вкладок» (кампания BalaGo-50, пилот 1).
// Утверждённый сценарий: campaigns/balago-50/scripts/BG-001.md.
//
// Офис в Бишкеке: мама-менеджер, на ноутбуке восемь рабочих вкладок,
// девятая — «Баланы ким алып кетет?». Дома сын собирает портфель и
// спрашивает маму на «сиз». Мост (правка 01): в календаре встреча
// совпадает с концом уроков, перенос упирается в другую встречу; мама
// думает: «Жолугушууларды жылдыра бергенче, баламдын жолун алдын ала
// уюштурсамчы?» — и сама ищет «Бишкек балдар үчүн такси», открывает
// карточку BalaGo. Только после её выбора звучит BalaGo; карточка
// превращается в маршрут: белая машина BalaGo едет по Бишкеку. Шаги без обещания
// мгновенного старта: арыз → топ түзүү → акысыз биринчи сапар → чечим.
// Финал: Бишкек, ссылка в профиле и WhatsApp 0998 08 38 28.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG1_VIDEO = {
  id: "BalaGoBG001",
  output: "balago-bg-001",
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 72,
  voiceDir: "audio/campaign50/bg-001",
} as const;

export const BG1_FRAMES = BG1_VIDEO.durationSec * BG1_VIDEO.fps;

// ---------- Сцены (фиксированная шкала, секунды) ----------
export type Bg1SceneId = "hook" | "tabs" | "parallel" | "bridge" | "route" | "steps" | "cta";

export const BG1_SCENES: readonly {
  readonly id: Bg1SceneId;
  readonly title: string;
  readonly from: number;
  readonly to: number;
}[] = [
  { id: "hook", title: "1. Сегиз вкладка + тогузунчу", from: 0, to: 6 },
  { id: "tabs", title: "2. Вкладкалар алмашат", from: 6, to: 14.5 },
  { id: "parallel", title: "3. Үйдө уулу, офисте апасы", from: 14.5, to: 24 },
  { id: "bridge", title: "4. Календарь → ой → издөө", from: 24, to: 35 },
  { id: "route", title: "5. BalaGo → маршрут", from: 35, to: 46 },
  { id: "steps", title: "6. Тынч иш + кадамдар", from: 46, to: 57 },
  { id: "cta", title: "7. Финалдык экран", from: 57, to: 72 },
];

// Финальный экран (оба способа связи, Бишкек) — от начала сцены cta до конца.
export const BG1_CTA_FROM = 57;

// ---------- Голоса ----------
export type Bg1Role = "narrator" | "mother" | "son";

export const BG1_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 1001,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые кыргызские голоса проекта (ElevenLabs Voice Design), уже
// проверенные в 2D-роликах №10–12 (замеры MMS в voice-samples/). Новые
// голоса не создаются. Мама и диктор — разные женские голоса; мальчика
// озвучивает самый светлый и звонкий голос проекта (≈ 286 Гц), без
// механического повышения тона и ускорения.
export const BG1_VOICES: Record<Bg1Role, { readonly name: string; readonly voiceId: string; readonly from: string }> = {
  // спокойный доброжелательный женский голос рассказчика (CER 2,1 %)
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "half-hour-2d" },
  // тёплый, мягкий голос мамы (CER 1,8 %)
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p", from: "half-hour-2d" },
  // светлый звонкий голос сына (CER 4,2 %)
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM", from: "half-hour-2d" },
};

// ---------- Реплики (утверждённый текст, без изменений смысла) ----------
export type Bg1Line = {
  readonly id: string;
  readonly role: Bg1Role;
  readonly scene: Bg1SceneId;
  readonly at: number; // начало речи (секунды от начала ролика)
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

export const BG1_LINES: readonly Bg1Line[] = [
  {
    id: "n01",
    role: "narrator",
    scene: "hook",
    at: 0.4,
    text: "Жумушта сегиз ишиңиз бар. Тогузунчусу — балаңызды мектептен алып кетүү.",
  },
  {
    id: "n02",
    role: "narrator",
    scene: "tabs",
    at: 6.4,
    text: "Жыйын, отчет, кардарлар... Анан дагы мектепке жеткирүү, кайра алып келүү.",
  },
  { id: "s01", role: "son", scene: "parallel", at: 16.4, text: "Апа, бүгүн сиз алып кетесизби?", tag: "[calm]" },
  { id: "m01", role: "mother", scene: "parallel", at: 19.8, text: "Азыр графикти карап көрөйүн.", tag: "[thoughtful]" },
  // мост (правка 01): внутренняя реплика мамы — мысль, из которой
  // рождается решение; она звучит её голосом, губы не двигаются
  {
    id: "m02",
    role: "mother",
    scene: "bridge",
    at: 27.5,
    text: "Жолугушууларды жылдыра бергенче, баламдын жолун алдын ала уюштурсамчы?",
    tag: "[thoughtful]",
  },
  {
    id: "n03",
    role: "narrator",
    scene: "route",
    at: 35.6,
    text: "BalaGo — Бишкектеги балдар үчүн алдын ала уюштурулган такси. Үйдөн мектепке, сабактан кийин кайра үйгө.",
    spoken: "БалаГо — Бишкектеги балдар үчүн алдын ала уюштурулган такси. Үйдөн мектепке, сабактан кийин кайра үйгө.",
  },
  {
    id: "n04",
    role: "narrator",
    scene: "steps",
    at: 46.6,
    text: "Адегенде багытка ылайык топ түзүлөт. Биринчи толук сыноо сапары акысыз. Андан кийин улантууну өзүңүз чечесиз.",
  },
  {
    id: "n05",
    role: "narrator",
    scene: "cta",
    at: 57.5,
    text: "BalaGo — Бишкектеги балдар үчүн такси. Каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
    spoken:
      "БалаГо — Бишкектеги балдар үчүн такси. Каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге Ватсап аркылуу жазыңыз. БалаГо менен жолго чыгалы!",
    tag: "[warmly]",
  },
];

// После последнего слова финальный экран держится ≥ 3 с.
export const BG1_DIALOG_END = BG1_VIDEO.durationSec - 3.2;

export const lineById = (id: string) => {
  const l = BG1_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const BG1_TEXT = {
  // восемь рабочих вкладок (по порядку появления)
  tabs: ["Отчет", "Жыйын 10:00", "Кат", "Кардарлар", "Бюджет", "Келишим", "Презентация", "Тапшырмалар"],
  ninth: "Баланы ким алып кетет?",
  logistic: "Мектепке каттам",
  // мост: календарь дня и поиск
  calendar: {
    title: "Календарь • Бүгүн",
    hours: ["15:00", "16:00", "17:00", "18:00", "19:00"],
    meeting: "Жыйын",
    client: "Кардар менен жолугушуу",
    school: "Сабак бүтөт",
    clash: "Убакыт дал келбейт",
  },
  search: {
    query: "Бишкек балдар үчүн такси",
    title: "BalaGo — Балдар үчүн такси",
    route: "Үй → Мектеп → Үй",
    city: "Бишкек",
    more: "Толугураак",
  },
  clock: { now: "16:40", school: "Сабак бүтөт 17:00" },
  // содержимое вкладок при переключении
  pages: {
    meeting: { title: "Жыйын 10:00", rows: ["Долбоордун планы", "Кардар менен сүйлөшүү", "Жыйынтыктар"] },
    report: { title: "Айлык отчет", rows: ["Сатуу", "Чыгаша", "Пайда"] },
    mail: { title: "Кат", from: "Кардар", subject: "Келишим боюнча суроо", body: "Саламатсызбы! Келишимдин долбоорун бүгүн жөнөтө аласызбы?" },
    clients: { title: "Кардарлар", rows: ["Асель Т.", "Нурбек А.", "Айгерим С.", "Бакыт Ж."] },
    school: {
      title: "Мектепке каттам",
      rows: [
        ["08:00", "Үй → Мектеп"],
        ["17:00", "Мектеп → Үй"],
      ],
    },
  },
  route: { home: "Үй", school: "Мектеп", city: "Бишкек", there: "08:00 Үй → Мектеп", back: "Сабактан кийин: Мектеп → Үй" },
  stepsTitle: "BalaGo • Кантип иштейт?",
  steps: ["Арыз", "Топ түзүү", "Акысыз биринчи сапар", "Чечим"],
  apply: "Арыз калтыруу",
  stepsNote: "Багытка ылайык топ түзүлгөндөн кийин",
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
