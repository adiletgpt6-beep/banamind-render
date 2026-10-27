// Седьмой ролик: «Бир таң» — анимационная история одного утра семьи
// (композиция BalaGoMorningStory, ≈3 минуты, 1080×1920, 30 fps).
//
// Здесь — всё, что нужно и роликам, и Node-скриптам: сценарий по сценам,
// голоса персонажей, паузы и экранные надписи. Файл без зависимостей от
// Remotion (его читает scripts/generate-story-voice.mjs).
//
// BalaGo ещё готовится к запуску: только предварительная запись. Никаких
// «уже возим», гарантий, проверок водителей, цен, приложения или дат.

export const MS_VIDEO = {
  id: "BalaGoMorningStory",
  output: "balago-morning-story",
  width: 1080,
  height: 1920,
  fps: 30,
  // Озвучка (MP3 по репликам + manifest.json + timeline.json).
  voiceDir: "audio/morning-story",
} as const;

// ---------- Голоса ----------
// Стандартные (premade) голоса библиотеки ElevenLabs — доступны любому
// аккаунту по voice ID. Модель eleven_v3, язык ky. Голос закреплён за
// ролью и используется во всех её репликах.
export type RoleId =
  | "narrator"
  | "father"
  | "mother"
  | "daughter"
  | "driver"
  | "teacher"
  | "boss"
  | "balago";

type Voice = { readonly name: string; readonly voiceId: string };
// Первый голос — основной; если ElevenLabs его не находит (voice_not_found),
// берётся следующий. Один голос не используется двумя ролями.
export const MS_VOICES: Record<
  RoleId,
  { readonly role: string; readonly candidates: readonly Voice[] }
> = {
  narrator: {
    role: "Рассказчик — тёплый естественный мужской голос",
    candidates: [{ name: "Eric", voiceId: "cjVigY5qzO86Huf0OWal" }],
  },
  father: {
    role: "Отец — спокойный низкий мужской голос",
    candidates: [
      { name: "Brian", voiceId: "nPczCjzI2devNBz1zQrb" },
      { name: "Chris", voiceId: "iP95p4xoKVk53GoZ742B" },
      { name: "Will", voiceId: "bIHbv24MWmeRgasZH58o" },
    ],
  },
  mother: {
    role: "Мама — тёплый женский голос 30–40 лет",
    candidates: [
      { name: "Matilda", voiceId: "XrExE9yKIg1WjnStdHDv" },
      { name: "Lily", voiceId: "pFZP5JQG7iQjIQuC4Bp3" },
      { name: "Aria", voiceId: "9BWtsMINqrJLrRacOk9x" },
      { name: "Laura", voiceId: "FGY2WhTYpPnrIDTdsKH5" },
    ],
  },
  daughter: {
    role: "Дочь — молодой мягкий голос (без изменения высоты)",
    candidates: [
      { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9" },
      { name: "Laura", voiceId: "FGY2WhTYpPnrIDTdsKH5" },
      { name: "Charlotte", voiceId: "XB0fDUnXU5powFXDhCwa" },
    ],
  },
  driver: {
    role: "Таксист — взрослый мужской голос, немного уставший",
    candidates: [
      { name: "Bill", voiceId: "pqHfZKP75CyOlxIrRRzK" },
      { name: "Callum", voiceId: "N2lVS1w4EtoT3dr4eOWO" },
      { name: "George", voiceId: "JBFqnCBsd6RMkjVDRZzb" },
      { name: "Roger", voiceId: "CwhRBWXzGAHq8TQ4Fs17" },
    ],
  },
  teacher: {
    role: "Учитель — спокойный уверенный женский голос",
    candidates: [
      { name: "Alice", voiceId: "Xb7hH8MSUJpSbSDYk0k2" },
      { name: "Charlotte", voiceId: "XB0fDUnXU5powFXDhCwa" },
      { name: "Aria", voiceId: "9BWtsMINqrJLrRacOk9x" },
      { name: "River", voiceId: "SAz9YHcvj6GT2YYXdXww" },
      { name: "Laura", voiceId: "FGY2WhTYpPnrIDTdsKH5" },
    ],
  },
  boss: {
    role: "Руководитель — короткий деловой мужской голос",
    candidates: [
      { name: "Daniel", voiceId: "onwK4e9ZLuTAKqWW03F9" },
      { name: "George", voiceId: "JBFqnCBsd6RMkjVDRZzb" },
      { name: "Charlie", voiceId: "IKne3meq5aSn9XLyUdCD" },
      { name: "Liam", voiceId: "TX3LPaxmHKxFdv7VOQHJ" },
      { name: "Will", voiceId: "bIHbv24MWmeRgasZH58o" },
    ],
  },
  balago: {
    role: "Представитель BalaGo — тёплый спокойный женский голос",
    candidates: [
      { name: "Sarah", voiceId: "EXAVITQu4vr4xnSDxMaL" },
      { name: "River", voiceId: "SAz9YHcvj6GT2YYXdXww" },
      { name: "Laura", voiceId: "FGY2WhTYpPnrIDTdsKH5" },
      { name: "Charlotte", voiceId: "XB0fDUnXU5powFXDhCwa" },
    ],
  },
};

export const MS_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 51,
  // eleven_v3: stability 0.0 / 0.5 / 1.0; 0.5 — естественный режим.
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// ---------- Сценарий ----------
// text — реплика как в сценарии (идёт в manifest и на проверку);
// spoken — что отправляется в ElevenLabs, если отличается (бренд кириллицей,
// чтобы голос произнёс «БалаГо», а не по-английски);
// tag — тег интонации eleven_v3; pause — пауза перед репликой, с.
export type StoryLine = {
  readonly id: string;
  readonly role: RoleId;
  readonly text: string;
  readonly spoken?: string;
  readonly tag?: string;
  readonly pause: number;
};

export type StorySceneId =
  | "s01Morning"
  | "s02Plan"
  | "s03Order"
  | "s04First"
  | "s05Second"
  | "s06Traffic"
  | "s07Ride"
  | "s08School"
  | "s09Office"
  | "s10Idea"
  | "s11Call"
  | "s12Final"
  | "s13Cta";

export type StoryScene = {
  readonly id: StorySceneId;
  readonly title: string; // рабочее название (Studio, кадры проверки)
  // Минимальная длина сцены (с): время на действие без речи.
  readonly minSec: number;
  // Хвост после последней реплики сцены (с).
  readonly tail: number;
  readonly lines: readonly StoryLine[];
};

export const MS_SCENES: readonly StoryScene[] = [
  {
    id: "s01Morning",
    title: "1. Кадимки таң",
    minSec: 14,
    tail: 1.2,
    lines: [
      {
        id: "n01",
        role: "narrator",
        tag: "[warm]",
        pause: 2.2,
        text: "Көп үй-бүлөдө эртең менен баары алдын ала белгилүү болот. Ата-эне жумушка даярданат, бала мектепке камынат. Бул үй-бүлөдө кызын мектепке көбүнчө атасы жеткирет.",
      },
    ],
  },
  {
    id: "s02Plan",
    title: "2. План күтүүсүз өзгөрдү",
    minSec: 13,
    tail: 1.6,
    lines: [
      {
        id: "f01",
        role: "father",
        tag: "[apologetic]",
        pause: 1.2,
        text: "Бүгүн кызды мектепке сен жеткирип коё аласыңбы? Менин шашылыш ишим чыгып калды.",
      },
      {
        id: "m01",
        role: "mother",
        tag: "[surprised]",
        pause: 0.5,
        text: "Эмнеге муну кечээ айткан жоксуң? Мен да жумушка кечигишим мүмкүн да.",
      },
      {
        id: "f02",
        role: "father",
        tag: "[apologetic]",
        pause: 0.45,
        text: "Кечирип койчу. Эсимден чыгып кетиптир.",
      },
    ],
  },
  {
    id: "s03Order",
    title: "3. Апа такси чакырат",
    minSec: 12,
    tail: 1.4,
    lines: [
      {
        id: "n02",
        role: "narrator",
        pause: 2.4,
        text: "Пландын күтүүсүз өзгөрүшү эми апанын мойнуна түшөт. Ал жумушка да барышы керек. Кызын мектепке да кечиктирбеши керек.",
      },
    ],
  },
  {
    id: "s04First",
    title: "4. Биринчи такси",
    minSec: 13,
    tail: 1.6,
    lines: [
      {
        id: "m02",
        role: "mother",
        tag: "[worried]",
        pause: 3.4,
        text: "Эмнеге дагы эле ошол жерде турат?..",
      },
      {
        id: "m03",
        role: "mother",
        tag: "[anxious]",
        pause: 3.6,
        text: "Мен жумушка кечигип жатам го...",
      },
    ],
  },
  {
    id: "s05Second",
    title: "5. Экинчи такси алыста",
    minSec: 11,
    tail: 1.8,
    lines: [
      {
        id: "d01",
        role: "daughter",
        tag: "[softly]",
        pause: 2.8,
        text: "Апа, мектепке кечигип калбайбызбы?",
      },
      {
        id: "m04",
        role: "mother",
        tag: "[reassuring]",
        pause: 0.6,
        text: "Жок, кызым. Азыр келет. Даяр болуп туралы.",
      },
    ],
  },
  {
    id: "s06Traffic",
    title: "6. Тыгын",
    minSec: 16,
    tail: 1.2,
    lines: [
      {
        id: "m05",
        role: "mother",
        pause: 2.0,
        text: "Саламатсызбы. Мүмкүн болсо бир аз тезирээк келе аласызбы? Биз мектепке кечигип жатабыз.",
      },
      {
        id: "t01",
        role: "driver",
        tag: "[tired]",
        pause: 0.5,
        text: "Саламатсызбы. Келе жатам. Бирок алдымда чоң тыгын болуп жатат. Жол бошосо эле жетем.",
      },
      {
        id: "m06",
        role: "mother",
        tag: "[tired]",
        pause: 0.45,
        text: "Макул... күтүп турабыз.",
      },
    ],
  },
  {
    id: "s07Ride",
    title: "7. Такси келди",
    minSec: 15,
    tail: 1.4,
    lines: [
      { id: "m07", role: "mother", pause: 2.6, text: "Саламатсызбы." },
      {
        id: "t02",
        role: "driver",
        tag: "[tired]",
        pause: 0.35,
        text: "Саламатсызбы.",
      },
      {
        id: "n03",
        role: "narrator",
        pause: 2.2,
        text: "Эч ким атайын кечиктирген жок. Бирок шаардагы бир эле күтүүсүз өзгөрүү бүт таңкы планды бузуп койду.",
      },
    ],
  },
  {
    id: "s08School",
    title: "8. Мектепке кечигүү",
    minSec: 13.5,
    tail: 2.0,
    lines: [
      {
        id: "e01",
        role: "teacher",
        tag: "[calm]",
        pause: 2.6,
        text: "Кутман таң. Сабак башталып калды. Кийинкиде кечикпегенге аракет кылалы, макулбу?",
      },
      {
        id: "m08",
        role: "mother",
        tag: "[embarrassed]",
        pause: 0.45,
        text: "Макул, кечиресиз.",
      },
      {
        id: "d02",
        role: "daughter",
        tag: "[warm]",
        pause: 0.7,
        text: "Апа, кош болуңуз.",
      },
      {
        id: "m09",
        role: "mother",
        tag: "[warm]",
        pause: 0.35,
        text: "Жакшы оку, кызым.",
      },
    ],
  },
  {
    id: "s09Office",
    title: "9. Эми жумушка да кечигүү",
    minSec: 15,
    tail: 1.4,
    lines: [
      {
        id: "b01",
        role: "boss",
        pause: 2.2,
        text: "Бүгүн кечигип калдыңыз. Кийинкиде убакытты карап келели.",
      },
      {
        id: "m10",
        role: "mother",
        tag: "[tired]",
        pause: 0.45,
        text: "Ооба, кечирип коюңуз.",
      },
      {
        id: "n04",
        role: "narrator",
        tag: "[thoughtful]",
        pause: 2.0,
        text: "Бир эле таң. Бирок канча шашылыш чечим, канча күтүүгө кеткен убакыт, канча нерв...",
      },
    ],
  },
  {
    id: "s10Idea",
    title: "10. Негизги ой",
    minSec: 13.5,
    tail: 1.6,
    lines: [
      {
        id: "n05",
        role: "narrator",
        tag: "[warm]",
        pause: 3.6,
        text: "Ошондо ал бир нерсени түшүндү: баланын мектепке жолун ар бир эртең менен кайрадан чечүүнүн ордуна, аны алдын ала уюштурууга болот.",
      },
    ],
  },
  {
    id: "s11Call",
    title: "11. BalaGo менен байланыш",
    minSec: 16,
    tail: 1.4,
    lines: [
      {
        id: "m11",
        role: "mother",
        pause: 1.8,
        text: "Саламатсызбы. Кызымды мектепке жеткирүү боюнча алдын ала маалымат алсам деп чалып жатам.",
      },
      {
        id: "g01",
        role: "balago",
        tag: "[warm]",
        pause: 0.5,
        text: "Саламатсызбы. Албетте. BalaGo азыр ишке кирүүгө даярданып жатат жана алдын ала каттоо жүрүп жатат. Балаңыздын маршруту менен убактысын калтырсаңыз болот.",
        spoken:
          "Саламатсызбы. Албетте. БалаГо азыр ишке кирүүгө даярданып жатат жана алдын ала каттоо жүрүп жатат. Балаңыздын маршруту менен убактысын калтырсаңыз болот.",
      },
      {
        id: "m12",
        role: "mother",
        tag: "[relieved]",
        pause: 0.5,
        text: "Жакшы экен. Анда алдын ала катталып коёюн.",
      },
      {
        id: "g02",
        role: "balago",
        tag: "[warm]",
        pause: 0.45,
        text: "Макул. Маалыматыңызды калтырыңыз, сиз менен байланышабыз.",
      },
    ],
  },
  {
    id: "s12Final",
    title: "12. Эмоционалдуу финал",
    minSec: 10,
    tail: 0.5,
    lines: [
      {
        id: "n06",
        role: "narrator",
        tag: "[warm]",
        pause: 2.0,
        text: "Ата-энеге — убакыт. Балага — алдын ала уюштурулган жол. BalaGo — балдар үчүн такси. Алдын ала каттоо жүрүп жатат.",
        spoken:
          "Ата-энеге — убакыт. Балага — алдын ала уюштурулган жол. БалаГо — балдар үчүн такси. Алдын ала каттоо жүрүп жатат.",
      },
    ],
  },
  {
    // Чистый финальный экран: без речи, спокойно, номер неподвижен.
    id: "s13Cta",
    title: "13. Финальный экран",
    minSec: 6.5,
    tail: 0,
    lines: [],
  },
];

// Финальный экран не короче этого (после последней реплики).
export const MS_CTA_HOLD_SEC = 6.5;

// ---------- Экранные надписи (только смысловые акценты) ----------
export const MS_TEXT = {
  captions: {
    morning: "Кадимки таң",
    plan: "План күтүүсүз өзгөрдү",
    time: "Убакыт өтүп жатат...",
    minutes: "Дагы 12 мүнөт",
    traffic: "Тыгын",
    school: "Мектепке кечигүү",
    work: "Эми жумушка да кечигүү",
    question: "Ар бир таңды кайрадан уюштуруу керекпи?",
    idea: "Жолду алдын ала уюштурууга болот",
  },
  app: {
    title: "Такси",
    from: "Үй",
    to: "Мектеп",
    order: "Такси чакыруу",
    searching: "Айдоочу изделүүдө...",
    found: "Айдоочу табылды",
    calling: "Чалуу...",
    cancel: "Баш тартуу",
    eta: "12 мүнөт",
    arriving: "Айдоочу жолдо",
  },
  call: {
    driver: "Айдоочу",
    balago: "BalaGo",
  },
  school: "Мектеп",
  office: "Кеңсе",
  ad: {
    sponsored: "Жарнама",
    tagline: "Балдар үчүн такси",
    route: "Үй → Мектеп → Үй",
    status: "Алдын ала каттоо жүрүп жатат",
    button: "Байланышуу",
  },
  form: {
    title: "Алдын ала каттоо",
    route: "Маршрут",
    routeValue: "Үй → Мектеп → Үй",
    time: "Убакыт",
    timeValue: "Сабакка чейин",
    note: "Сиз менен байланышабыз",
  },
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    status: "Алдын ала каттоо жүрүп жатат",
    button: "Баланы каттоо",
    phone: "0998 08 38 28",
    link: "Профилдеги шилтеме аркылуу",
    whatsappUrl: "https://wa.me/996998083828",
  },
} as const;

// Все реплики по порядку.
export const MS_LINES: readonly (StoryLine & { scene: StorySceneId })[] =
  MS_SCENES.flatMap((s) => s.lines.map((l) => ({ ...l, scene: s.id })));
