// Единая конфигурация ролика BalaGoPromo.
// Здесь собраны тексты, цвета, пути к материалам и тайминги —
// для правок обычно достаточно менять только этот файл.
// Файл намеренно без импортов: его читают и Node-скрипты (озвучка, кадры).

export const VIDEO = {
  id: "BalaGoPromo",
  width: 1080,
  height: 1920,
  fps: 30,
  // Длительность по умолчанию; реальная считается по озвучке
  // (src/timeline.ts) в пределах TIMING.minSec…TIMING.maxSec.
  durationInFrames: 28 * 30,
} as const;

// Отступы под интерфейс Instagram Reels / Stories (в пикселях кадра 1080×1920).
// Сверху — профиль и кнопки, снизу — подпись и поле комментария,
// справа — колонка лайков/комментариев/репостов.
export const SAFE = {
  top: 250,
  bottom: 400,
  left: 90,
  right: 150,
} as const;

export const COLORS = {
  background: "#FFFFFF",
  yellow: "#FFC90E",
  yellowSoft: "#FFF4C2",
  navy: "#14285A",
  navySoft: "#3A4F80",
  sky: "#EAF3FC",
  street: "#FFFFFF",
  block: "#DCE8F5",
  shadow: "rgba(20, 40, 90, 0.18)",
  white: "#FFFFFF",
} as const;

// Пути относительно папки public/ (используются через staticFile()).
export const ASSETS = {
  logo: "assets/logo.png",
  portrait: "assets/portrait.jpg",
  carExterior: "assets/car-exterior.jpg",
  carInterior: "assets/car-interior.png",
  // Канал Адилета: логотип и фрагмент профиля (имя и число подписчиков).
  channelLogo: "assets/channel-logo.jpg",
  channelStats: "assets/channel-stats.png",
} as const;

// Кадрирование фотографий: точка фокуса (в % по ширине/высоте исходника)
// и плавное приближение zoomFrom → zoomTo за время сцены.
export const PHOTO_CROP = {
  portrait: { focusX: 50, focusY: 75, zoomFrom: 1.02, zoomTo: 1.1 },
  carExterior: { focusX: 50, focusY: 51, zoomFrom: 1.02, zoomTo: 1.08 },
  carInterior: { focusX: 50, focusY: 52, zoomFrom: 1.05, zoomTo: 1.15 },
  // Портрет в сцене «доверие» — крупнее, приближение к лицу.
  portraitClose: { focusX: 50, focusY: 75, zoomFrom: 1.0, zoomTo: 1.12 },
} as const;

// ---------- Сценарий и озвучка ----------
// Дикторский текст — одна цельная дорожка (один запрос к ElevenLabs),
// чтобы интонация связывала предложения. Фрагменты (segments) нужны
// только для монтажа: по их таймингам начинаются сцены.
// «БалаГо» пишем кириллицей, числа — словами.
export type NarrationSegment = {
  readonly id: string;
  readonly text: string;
  // Тег интонации eleven_v3 перед фразой, например "[warm]".
  readonly tag?: string;
};

export const NARRATION: {
  voiceId: string;
  modelId: string;
  languageCode: string;
  seed: number;
  voiceSettings: { stability: number; similarity_boost: number };
  segments: NarrationSegment[];
} = {
  // Голос ElevenLabs: «Eric» — дружелюбный, уверенный мужской голос из
  // стандартной библиотеки. Переменная репозитория ELEVENLABS_VOICE_ID
  // (если задана) имеет приоритет — так голос меняется без правки кода.
  voiceId: "cjVigY5qzO86Huf0OWal",
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 7,
  // eleven_v3: stability 0.0 / 0.5 / 1.0 (выразительнее ↔ стабильнее).
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
  segments: [
    { id: "hook1", text: "Эртең менен шашып жатасызбы?", tag: "[warm]" },
    { id: "hook2", text: "Балаңызды мектепке ким жеткирет?" },
    { id: "brand", text: "БалаГо — балдар үчүн такси." },
    { id: "route", text: "Үйдөн мектепке, мектептен кайра үйгө." },
    { id: "trips", text: "Беш миңден ашык сапар." },
    { id: "kids", text: "Балдар менен иштөө тажрыйбасы." },
    { id: "car", text: "Салон таза, сапар ыңгайлуу, мамиле камкор." },
    { id: "promise", text: "Сизге — тынчтык, балаңызга — камкордук." },
    { id: "slogan", text: "БалаГо менен жолго чыгалы!", tag: "[cheerful]" },
    { id: "cta", text: "Балаңызды профилдеги шилтеме аркылуу каттаңыз." },
  ],
};

export type SceneId =
  | "hook"
  | "brand"
  | "route"
  | "driver"
  | "car"
  | "promise"
  | "cta"
  // второй ролик «Кто стоит за BalaGo»
  | "intro"
  | "kids"
  | "care"
  // третий ролик «BalaGo кантип иштейт?»
  | "steps"
  | "register"
  | "toSchool"
  | "toHome";

// Какие фрагменты озвучки звучат в какой сцене (по порядку).
export const SCENE_PLAN: { id: SceneId; segments: readonly string[] }[] = [
  { id: "hook", segments: ["hook1", "hook2"] },
  { id: "brand", segments: ["brand"] },
  { id: "route", segments: ["route"] },
  { id: "driver", segments: ["trips", "kids"] },
  { id: "car", segments: ["car"] },
  { id: "promise", segments: ["promise"] },
  { id: "cta", segments: ["slogan", "cta"] },
];

export type Timing = {
  readonly minSec: number;
  readonly maxSec: number;
  readonly narrationStartSec: number;
  readonly sceneLeadSec: number;
  readonly ctaHoldSec: number;
  readonly transitionFrames: number;
};

// Тайминги первого и второго роликов (у третьего — свои, HOW_TIMING).
export const TIMING: Timing = {
  minSec: 25,
  maxSec: 30,
  // Голос начинается почти сразу — сильное начало.
  narrationStartSec: 0.25,
  // Сцена появляется чуть раньше своей фразы.
  sceneLeadSec: 0.3,
  // Финальный призыв остаётся на экране после последнего слова.
  ctaHoldSec: 2.8,
  transitionFrames: 12,
};

// ---------- Звук ----------
// Музыка и эффекты — собственные, сгенерированы кодом
// (scripts/generate-music.mjs), их можно свободно использовать в рекламе.
export const AUDIO = {
  music: "audio/music.mp3",
  // Громкость музыки без голоса и под голосом (приглушение, «ducking»).
  musicVolume: 0.42,
  musicVolumeUnderVoice: 0.13,
  voiceVolume: 1,
  // Дикторская дорожка и manifest.json (создаёт scripts/generate-voice.mjs).
  voiceDir: "audio/voice",
  sfx: {
    whoosh: "audio/sfx-whoosh.mp3",
    chime: "audio/sfx-chime.mp3",
    pop: "audio/sfx-pop.mp3",
  },
} as const;

// Эффекты — умеренно, только на ключевых моментах. Кадр = начало сцены
// (или начало фрагмента озвучки segment) + offset.
export type SfxCue = {
  scene: SceneId;
  segment?: string;
  // Слово озвучки (начало слова), к которому привязан звук.
  word?: string;
  offset: number;
  sound: keyof typeof AUDIO.sfx;
  volume: number;
};

export const SFX_CUES: SfxCue[] = [
  { scene: "brand", offset: 2, sound: "chime", volume: 0.35 },
  { scene: "route", offset: 0, sound: "whoosh", volume: 0.25 },
  { scene: "car", offset: 0, sound: "whoosh", volume: 0.25 },
  { scene: "cta", segment: "cta", offset: -2, sound: "pop", volume: 0.4 },
];

// ---------- Надписи в кадре (кыргызский) ----------
export const TEXT = {
  hook: {
    line1: "Эртең менен шашып жатасызбы?",
    line2: "Балаңызды мектепке ким жеткирет?",
    // Слово, которое подсвечивается жёлтым маркером.
    highlight: "шашып",
  },
  brand: {
    tagline: "Балдар үчүн такси",
  },
  route: {
    stops: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    homeLabel: "ҮЙ",
    schoolLabel: "МЕКТЕП",
  },
  driver: {
    tripsNumber: 5000,
    tripsSuffix: "+",
    tripsCaption: "сапар",
    kidsExperience: "Балдар менен иштөө тажрыйбасы",
  },
  car: {
    features: ["Таза салон", "Ыңгайлуу сапар", "Камкор мамиле"],
  },
  promise: {
    parent: { lead: "Сизге", word: "тынчтык" },
    child: { lead: "Балаңызга", word: "камкордук" },
  },
  cta: {
    title: "BalaGo менен жолго чыгалы!",
    subtitle: "Шилтеме — профилде",
    button: "Баланы каттоо",
  },
} as const;

// =====================================================================
// Второй ролик: «Кто стоит за BalaGo» (композиция BalaGoDriverIntro).
// Личное знакомство с Адилетом — от первого лица.
// =====================================================================
export const DRIVER_NARRATION: typeof NARRATION = {
  ...NARRATION,
  seed: 11,
  segments: [
    { id: "question", text: "Балаңызды кимге ишенип тапшырасыз?" },
    { id: "name", text: "Менин атым Адилет.", tag: "[warm]" },
    { id: "trips", text: "Беш миңден ашык сапар жасагам." },
    { id: "arabic", text: "Балдарга араб тилин окуткам." },
    {
      id: "page",
      text: "Балдарга арналган баракчамда жүз жыйырма миңден ашык катталуучу бар.",
    },
    { id: "care", text: "Балага камкор мамиле жана ыңгайлуу сапар." },
    { id: "slogan", text: "БалаГо менен жолго чыгалы!", tag: "[cheerful]" },
    { id: "cta", text: "Каттоо шилтемеси профилде." },
  ],
};

export const DRIVER_SCENE_PLAN: { id: SceneId; segments: readonly string[] }[] =
  [
    { id: "intro", segments: ["question", "name", "trips"] },
    { id: "kids", segments: ["arabic", "page"] },
    { id: "care", segments: ["care"] },
    { id: "cta", segments: ["slogan", "cta"] },
  ];

// Тихие эффекты на смысловых акцентах.
export const DRIVER_SFX_CUES: SfxCue[] = [
  { scene: "intro", word: "Адилет", offset: 0, sound: "chime", volume: 0.3 },
  { scene: "intro", word: "сапар", offset: 0, sound: "pop", volume: 0.3 },
  { scene: "kids", offset: 0, sound: "whoosh", volume: 0.22 },
  { scene: "kids", word: "катталуучу", offset: 0, sound: "pop", volume: 0.3 },
  { scene: "care", offset: 0, sound: "whoosh", volume: 0.22 },
  { scene: "cta", segment: "cta", offset: -2, sound: "pop", volume: 0.4 },
];

export const DRIVER_TEXT = {
  intro: {
    question: "Балаңызды кимге ишенип тапшырасыз?",
    name: "Мен Адилетмин",
    nameHighlight: "Адилетмин",
    trips: 5000,
    tripsSuffix: "+",
    tripsCaption: "сапар тажрыйбасы",
  },
  kids: {
    arabic: "Балдарга араб тилин окуткам",
    followers: 120000,
    followersSuffix: "+",
    followersCaption: "катталуучу",
    pageCaption: "Балдарга арналган баракча",
  },
  care: {
    // Порядок и слова озвучки, с которыми появляются плашки.
    features: [
      { label: "Камкор мамиле", word: "камкор" },
      { label: "Таза салон", word: "мамиле" },
      { label: "Ыңгайлуу сапар", word: "ыңгайлуу" },
    ],
  },
} as const;

// =====================================================================
// Третий ролик: «BalaGo кантип иштейт?» (композиция BalaGoHowItWorks).
// Порядок работы сервиса в три шага.
// =====================================================================
export const HOW_NARRATION: typeof NARRATION = {
  ...NARRATION,
  seed: 21,
  segments: [
    { id: "intro", text: "БалаГо кантип иштейт?" },
    { id: "simple", text: "Баары жөнөкөй — үч кадам." },
    {
      id: "step1",
      text: "Биринчи кадам — балаңызды профилдеги шилтеме аркылуу каттаңыз.",
    },
    {
      id: "step2",
      text: "Экинчи кадам — белгиленген убакта үйдөн алып, мектепке жеткиребиз.",
    },
    {
      id: "step3",
      text: "Үчүнчү кадам — сабактан кийин кайра үйүнө алып келебиз.",
    },
    { id: "slogan", text: "БалаГо менен жолго чыгалы!", tag: "[cheerful]" },
    { id: "cta", text: "Каттоо шилтемеси профилде." },
  ],
};

export const HOW_SCENE_PLAN: { id: SceneId; segments: readonly string[] }[] = [
  { id: "steps", segments: ["intro", "simple"] },
  { id: "register", segments: ["step1"] },
  { id: "toSchool", segments: ["step2"] },
  { id: "toHome", segments: ["step3"] },
  { id: "cta", segments: ["slogan", "cta"] },
];

// Свои тайминги: финальный кадр держится не меньше 3 с после последнего
// слова, сцены шагов появляются чуть раньше фразы, чтобы успеть прочитать.
export const HOW_TIMING: Timing = {
  ...TIMING,
  ctaHoldSec: 3.2,
  sceneLeadSec: 0.35,
};

export const HOW_SFX_CUES: SfxCue[] = [
  { scene: "register", offset: 0, sound: "whoosh", volume: 0.22 },
  { scene: "toSchool", offset: 0, sound: "whoosh", volume: 0.22 },
  {
    scene: "toSchool",
    word: "мектепке",
    offset: 6,
    sound: "chime",
    volume: 0.25,
  },
  { scene: "toHome", offset: 0, sound: "whoosh", volume: 0.22 },
  { scene: "cta", segment: "cta", offset: -2, sound: "pop", volume: 0.4 },
];

export const HOW_TEXT = {
  steps: {
    title: "BalaGo кантип иштейт?",
    subtitle: "Үч жөнөкөй кадам",
    labels: ["Каттоо", "Мектепке", "Үйгө"],
  },
  register: {
    title: "Баланы каттаңыз",
    fields: ["Аты-жөнү", "Дарек", "Мектеп", "Убакыт"],
    link: "Шилтеме — профилде",
  },
  toSchool: {
    title: "Үйдөн мектепке",
    caption: "Белгиленген убакта алып кетебиз",
  },
  toHome: {
    title: "Мектептен кайра үйгө",
    caption: "Сабактан кийин үйүнө алып келебиз",
  },
  route: { home: "ҮЙ", school: "МЕКТЕП" },
} as const;

// ---------- Реестр роликов ----------
// key — имя для скриптов (npm run render:<key>, audio:voice -- <key>).
export type VideoKey = "promo" | "driver-intro" | "how-it-works";

export const VIDEOS: Record<
  VideoKey,
  {
    id: string;
    narration: typeof NARRATION;
    scenePlan: { id: SceneId; segments: readonly string[] }[];
    voiceDir: string;
    output: string;
    timing: Timing;
  }
> = {
  promo: {
    id: VIDEO.id,
    narration: NARRATION,
    scenePlan: SCENE_PLAN,
    voiceDir: AUDIO.voiceDir,
    output: "balago-promo",
    timing: TIMING,
  },
  "driver-intro": {
    id: "BalaGoDriverIntro",
    narration: DRIVER_NARRATION,
    scenePlan: DRIVER_SCENE_PLAN,
    voiceDir: "audio/driver-intro",
    output: "balago-driver-intro",
    timing: TIMING,
  },
  "how-it-works": {
    id: "BalaGoHowItWorks",
    narration: HOW_NARRATION,
    scenePlan: HOW_SCENE_PLAN,
    voiceDir: "audio/how-it-works",
    output: "balago-how-it-works",
    timing: HOW_TIMING,
  },
};
