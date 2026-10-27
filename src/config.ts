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
// Правило бренда (README): фото личной машины владельца (carExterior,
// carInterior) и его фотографии (portrait, channel*) в новых роликах не
// используются, пока владелец отдельно не разрешит. Файлы остаются для
// старых роликов.
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
  | "toHome"
  // четвёртый ролик «Утро родителей»
  | "alarm"
  | "busy"
  | "launch"
  | "plan"
  // пятый ролик «Почему я создаю BalaGo» (60 с)
  | "family"
  | "chat"
  | "trust"
  | "founder"
  | "idea"
  | "format"
  | "prelaunch"
  | "contact"
  // шестой ролик «Мектепке жол: үч суроо» (60 с)
  | "tqIntro"
  | "tqWho"
  | "tqRoute"
  | "tqChange"
  | "tqAdilet"
  | "tqInvite";

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
    // Короткий мягкий сигнал будильника (четвёртый ролик).
    alarm: "audio/sfx-alarm.mp3",
    // Пятый ролик: мягкое уведомление и шелест бумаги.
    notify: "audio/sfx-notify.mp3",
    paper: "audio/sfx-paper.mp3",
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

// =====================================================================
// Четвёртый ролик: «Утро родителей» (композиция BalaGoMorningRush).
// Предварительная запись перед запуском: сервис ещё готовится, поэтому
// в ролике нет фото машины и салона, нет дат, цен и «реальных» поездок.
// =====================================================================
export const MORNING_NARRATION: typeof NARRATION = {
  ...NARRATION,
  seed: 31,
  segments: [
    // Начало — живее, рассказ о BalaGo — спокойнее и теплее.
    { id: "hook", text: "Эртең менен шашып жатасызбы?", tag: "[excited]" },
    {
      id: "rush",
      text: "Жумушка үлгүрүш керек, балаңызды мектепке жеткириш керек.",
    },
    { id: "minute", text: "Ар бир мүнөт маанилүү." },
    {
      id: "launch",
      text: "Биз БалаГону ишке киргизүүгө даярданып жатабыз.",
      tag: "[warm]",
    },
    {
      id: "plan",
      text: "Үйдөн мектепке, мектептен үйгө — алдын ала макулдашылган убакта.",
    },
    { id: "register", text: "Балаңызды алдын ала каттаңыз." },
    { id: "link", text: "Профилдеги шилтемеге өтүңүз." },
  ],
};

export const MORNING_SCENE_PLAN: {
  id: SceneId;
  segments: readonly string[];
}[] = [
  { id: "alarm", segments: ["hook"] },
  { id: "busy", segments: ["rush", "minute"] },
  { id: "launch", segments: ["launch"] },
  { id: "plan", segments: ["plan"] },
  { id: "cta", segments: ["register", "link"] },
];

// Финальный экран держится не меньше 3 с после последнего слова.
export const MORNING_TIMING: Timing = {
  ...TIMING,
  ctaHoldSec: 3.2,
};

// Музыка: общая спокойная основа + ритмичный «утренний» слой, который
// плавно уходит, когда появляется BalaGo (сцена launch).
export const MORNING_MUSIC = {
  base: "audio/music-morning.mp3",
  rhythm: "audio/music-morning-rhythm.mp3",
  rhythmOutScene: "launch" as SceneId,
} as const;

export const MORNING_SFX_CUES: SfxCue[] = [
  { scene: "alarm", offset: 2, sound: "alarm", volume: 0.3 },
  { scene: "busy", word: "жумушка", offset: 0, sound: "pop", volume: 0.28 },
  { scene: "busy", word: "мектепке", offset: 0, sound: "pop", volume: 0.28 },
  { scene: "busy", word: "жеткириш", offset: 0, sound: "pop", volume: 0.28 },
  { scene: "launch", word: "БалаГо", offset: 0, sound: "chime", volume: 0.3 },
  { scene: "plan", offset: 0, sound: "whoosh", volume: 0.2 },
  { scene: "cta", word: "каттаңыз", offset: 0, sound: "pop", volume: 0.38 },
];

export const MORNING_TEXT = {
  alarm: {
    question: "Эртең менен шашып жатасызбы?",
    highlight: "шашып",
  },
  busy: {
    // Карточки появляются со словами озвучки.
    cards: [
      { label: "Жумуш", icon: "work", word: "жумушка" },
      { label: "Мектеп", icon: "school", word: "мектепке" },
      { label: "Жол", icon: "road", word: "жеткириш" },
    ],
    minute: "Ар бир мүнөт маанилүү",
  },
  launch: {
    status: "Ишке киргизүүгө даярданып жатабыз",
  },
  plan: {
    route: ["Үй", "Мектеп", "Үй"],
    caption: "Алдын ала макулдашылган убакта",
  },
  cta: {
    tagline: "Балдар үчүн такси",
    title: "Алдын ала каттоо",
    button: "Баланы каттоо",
    link: "Шилтеме — профилде",
  },
} as const;

// =====================================================================
// Пятый ролик: «Почему я создаю BalaGo» (композиция BalaGoFounderStory).
// Личная история основателя, ровно 60 секунд. Машина и салон ещё
// готовятся: нет их фото, дат запуска, цен и «реальных» поездок.
// Семейный чат — художественная иллюстрация, не реальная переписка.
// =====================================================================
export const FOUNDER_NARRATION: typeof NARRATION = {
  ...NARRATION,
  seed: 41,
  segments: [
    // Личный рассказ с лёгкой улыбкой.
    { id: "family1", text: "Үй-бүлөбүздө төрт чоң киши бар.", tag: "[warm]" },
    {
      id: "family2",
      text: "Бирок кээде баланы мектепке жеткирүүгө эч кимдин убактысы жок.",
    },
    { id: "busy1", text: "Бирөө жумушта, бирөө жолдо." },
    { id: "busy2", text: "Баарынын өз иши бар." },
    { id: "child", text: "А бала мектепке барышы керек." },
    // Многоточие даёт короткую смысловую паузу перед вопросом.
    { id: "trust", text: "Мындай учурда… кимге ишенсе болот?" },
    { id: "name", text: "Мен Адилетмин." },
    { id: "taxi", text: "Төрт жылдан бери такси айдайм." },
    { id: "arabic", text: "Балдарга араб тилин окуткам." },
    { id: "idea1", text: "БалаГонун идеясы ушул муктаждыктан жаралды." },
    {
      id: "idea2",
      text: "Ата-энеге жардам берип, баланын күнүмдүк жолун алдын ала пландаштыруу.",
    },
    { id: "route1", text: "Үйдөн мектепке, сабактан кийин кайра үйгө." },
    { id: "route2", text: "Убакыт менен маршрутту алдын ала макулдашуу." },
    { id: "prep", text: "Азыр БалаГону ишке киргизүүгө даярданып жатам." },
    { id: "open", text: "Алдын ала каттоо ачык." },
    // Ясное, дружелюбное приглашение.
    {
      id: "link",
      text: "Каттоо үчүн профилдеги шилтемеге өтүңүз.",
      tag: "[cheerful]",
    },
    { id: "whatsapp", text: "Же экрандагы номерге вотсаптан жазыңыз." },
  ],
};

export const FOUNDER_SCENE_PLAN: {
  id: SceneId;
  segments: readonly string[];
}[] = [
  { id: "family", segments: ["family1", "family2"] },
  { id: "chat", segments: ["busy1", "busy2"] },
  { id: "trust", segments: ["child", "trust"] },
  { id: "founder", segments: ["name", "taxi", "arabic"] },
  { id: "idea", segments: ["idea1", "idea2"] },
  { id: "format", segments: ["route1", "route2"] },
  { id: "prelaunch", segments: ["prep", "open"] },
  { id: "contact", segments: ["link", "whatsapp"] },
];

// Ровно 60 секунд (1800 кадров). Финальный экран с номером держится
// не меньше 5 с после последнего слова. Общие тайминги TIMING не меняются.
export const FOUNDER_TIMING: Timing = {
  minSec: 60,
  maxSec: 60,
  // Первая секунда — без голоса: заголовок и «падающие» карточки цепляют
  // взгляд, а финальный экран не застаивается слишком долго.
  narrationStartSec: 1.0,
  sceneLeadSec: 0.3,
  ctaHoldSec: 5.2,
  transitionFrames: 12,
};

// Музыка развивается вместе с историей: основа звучит всю минуту,
// лёгкий ритм — в семейной сцене, тёплое раскрытие — с появлением идеи.
export const FOUNDER_MUSIC = {
  base: "audio/music-founder-pad.mp3",
  layers: [
    {
      src: "audio/music-founder-rhythm.mp3",
      from: "family" as SceneId,
      to: "trust" as SceneId,
    },
    { src: "audio/music-founder-warm.mp3", from: "idea" as SceneId },
  ],
} as const;

export const FOUNDER_SFX_CUES: SfxCue[] = [
  { scene: "family", word: "төрт", offset: 0, sound: "paper", volume: 0.3 },
  { scene: "chat", word: "жумушта", offset: -2, sound: "notify", volume: 0.3 },
  { scene: "chat", segment: "busy2", offset: 0, sound: "paper", volume: 0.25 },
  { scene: "founder", offset: 4, sound: "paper", volume: 0.3 },
  { scene: "idea", word: "БалаГо", offset: 0, sound: "chime", volume: 0.3 },
  { scene: "format", offset: 2, sound: "whoosh", volume: 0.16 },
  { scene: "prelaunch", offset: 0, sound: "paper", volume: 0.25 },
  { scene: "contact", word: "номерге", offset: 0, sound: "pop", volume: 0.32 },
];

// Номер WhatsApp — показывается в кадре, ссылка — в README и описании PR.
export const FOUNDER_CONTACT = {
  phone: "0998 08 38 28",
  whatsappUrl: "https://wa.me/996998083828",
} as const;

export const FOUNDER_TEXT = {
  family: {
    title: "Үй-бүлөдө төрт чоң киши",
    highlight: "төрт",
    question: "Баланы ким жеткирет?",
  },
  chat: {
    title: "Үй-бүлө",
    subtitle: "төрт мүчө",
    question: "Баланы ким жеткирет?",
    placeholder: "Билдирүү",
    // Реплики появляются вместе со словами озвучки.
    messages: [
      {
        text: "Жумуштамын",
        reply: "Мен жумуштамын.",
        sender: "Апа",
        word: "жумушта",
      },
      {
        text: "Жолдомун",
        reply: "Мен жолдомун.",
        sender: "Ата",
        word: "жолдо",
      },
      {
        text: "Үлгүрбөйм",
        reply: "Бүгүн үлгүрбөйм.",
        sender: "Эже",
        word: "баарынын",
      },
    ],
    school: "Мектеп",
  },
  trust: {
    question: "Кимге ишенсе болот?",
    highlight: "ишенсе",
  },
  founder: {
    name: "Мен — Адилет",
    facts: [
      { text: "Таксиде төрт жылдык тажрыйба", icon: "wheel", word: "такси" },
      { text: "Балдарга араб тилин окуткам", icon: "book", word: "араб" },
    ],
  },
  idea: {
    notes: [
      { text: "Ата-энеге жардам", word: "ата" },
      { text: "Алдын ала пландаштыруу", word: "пландаштыруу" },
    ],
  },
  format: {
    route: ["Үй", "Мектеп", "Үй"],
    caption: "Убакытты алдын ала макулдашуу",
  },
  prelaunch: {
    status: "Ишке киргизүүгө даярданып жатабыз",
    register: "Алдын ала каттоо",
  },
  contact: {
    tagline: "Балдар үчүн такси",
    title: "Алдын ала каттоо",
    button: "Баланы каттоо",
    link: "Шилтеме — профилде",
    or: "же",
    whatsapp: "WhatsApp аркылуу жазыңыз",
  },
} as const;

// =====================================================================
// Шестой ролик: «Мектепке жол: үч суроо» (композиция BalaGoTripQuestions).
// Памятка для родителей: три вопроса перед тем, как договариваться о
// школьных поездках, затем знакомство с Адилетом и предварительная запись.
// Ровно 60 секунд. Нет фото салона, дат запуска, цен, GPS, отзывов,
// «пройденных проверок» и кадров поездок с детьми.
// =====================================================================
export const TQ_NARRATION: typeof NARRATION = {
  // Голос и настройки — как в минутном ролике об основателе (Eric).
  ...FOUNDER_NARRATION,
  seed: 51,
  segments: [
    {
      id: "hook",
      text: "Балаңызды мектепке жеткирүүнү пландап жатасызбы?",
      tag: "[curious]",
    },
    { id: "three", text: "Адегенде үч суроону тактап алыңыз." },
    { id: "q1", text: "Биринчи: баланы ким жеткирет?" },
    { id: "a1", text: "Айдоочу менен таанышып, тажрыйбасын сураңыз." },
    { id: "q2", text: "Экинчи: кайдан, кайда жана саат канчада?" },
    {
      id: "a2",
      text: "Үйдүн дареги, мектеп, алып кетүү жана кайтуу убактысы алдын ала макулдашылсын.",
    },
    { id: "q3", text: "Үчүнчү: пландар өзгөрсө, кантип байланышасыз?" },
    {
      id: "a3",
      text: "Сабак эрте бүтсө же убакыт өзгөрсө, кимге жазарыңызды билиңиз.",
    },
    { id: "name", text: "Мен Адилетмин.", tag: "[warm]" },
    { id: "prep", text: "БалаГону ишке киргизүүгө даярданып жатам." },
    {
      id: "aim",
      text: "Сапардын шарттарын алдын ала тактап, ата-энеге түшүнүктүү кызмат түзгүм келет.",
    },
    { id: "open", text: "Алдын ала каттоо ачык.", tag: "[cheerful]" },
    {
      id: "contact",
      text: "Профилдеги шилтемеге өтүңүз же экрандагы номерге вотсаптан жазыңыз.",
    },
  ],
};

export const TQ_SCENE_PLAN: { id: SceneId; segments: readonly string[] }[] = [
  { id: "tqIntro", segments: ["hook", "three"] },
  { id: "tqWho", segments: ["q1", "a1"] },
  { id: "tqRoute", segments: ["q2", "a2"] },
  { id: "tqChange", segments: ["q3", "a3"] },
  { id: "tqAdilet", segments: ["name", "prep", "aim"] },
  { id: "tqInvite", segments: ["open", "contact"] },
];

// Ровно 60 с (1800 кадров); речь заканчивается не позже 55-й секунды,
// финальный экран держится ≥ 5 с. Тайминги прежних роликов не меняются.
export const TQ_TIMING: Timing = {
  minSec: 60,
  maxSec: 60,
  narrationStartSec: 0.6,
  sceneLeadSec: 0.3,
  ctaHoldSec: 5.2,
  // Сцены стыкуются кадр в кадр (каждая заканчивается тем, с чего
  // начинается следующая), поэтому вместо наплыва — бесшовная склейка:
  // без полупрозрачных «двойников», пустых кадров и наложений текста.
  transitionFrames: 1,
};

// Музыка: те же слои, что у ролика об основателе — лёгкий ритм под
// вопросы, тёплое раскрытие со знакомства с Адилетом.
export const TQ_MUSIC = {
  base: "audio/music-founder-pad.mp3",
  layers: [
    {
      src: "audio/music-founder-rhythm.mp3",
      from: "tqIntro" as SceneId,
      to: "tqAdilet" as SceneId,
    },
    { src: "audio/music-founder-warm.mp3", from: "tqAdilet" as SceneId },
  ],
} as const;

// Дозированные эффекты: разворот каждой карточки, рисование дороги,
// одно мягкое уведомление, акцент на логотипе.
export const TQ_SFX_CUES: SfxCue[] = [
  { scene: "tqWho", offset: 14, sound: "paper", volume: 0.3 },
  { scene: "tqRoute", offset: 14, sound: "paper", volume: 0.3 },
  {
    scene: "tqRoute",
    word: "дареги",
    offset: 0,
    sound: "whoosh",
    volume: 0.16,
  },
  { scene: "tqChange", offset: 14, sound: "paper", volume: 0.3 },
  {
    scene: "tqChange",
    word: "кимге",
    offset: -2,
    sound: "notify",
    volume: 0.3,
  },
  {
    scene: "tqAdilet",
    word: "БалаГо",
    offset: 0,
    sound: "chime",
    volume: 0.28,
  },
];

export const TQ_TEXT = {
  intro: {
    title: "Мектепке жол",
    subtitle: "Адегенде — үч суроо",
    highlight: "үч",
  },
  // Три карточки памятки (номер, вопрос, короткая подпись для памятки).
  cards: [
    { n: 1, question: "Баланы ким жеткирет?", short: "Ким жеткирет?" },
    { n: 2, question: "Кайдан? Кайда? Качан?", short: "Кайдан? Кайда? Качан?" },
    { n: 3, question: "Кантип байланышасыз?", short: "Байланыш" },
  ],
  who: {
    points: [
      { text: "Таанышуу", word: "таанышып" },
      { text: "Тажрыйба", word: "тажрыйбасын" },
    ],
  },
  route: {
    path: ["Үй", "Мектеп", "Үй"],
    chips: [
      { text: "Дарек", word: "дареги" },
      { text: "Мектеп", word: "мектеп" },
      { text: "Убакыт", word: "убактысы" },
    ],
  },
  change: {
    question: "Убакыт өзгөрсөчү?",
    lesson: "Сабак",
  },
  adilet: {
    name: "Мен — Адилет",
    status: "Ишке киргизүүгө даярданып жатабыз",
    memo: "Эсте сактаңыз",
  },
  invite: FOUNDER_TEXT.contact,
} as const;

// ---------- Реестр роликов ----------
// key — имя для скриптов (npm run render:<key>, audio:voice -- <key>).
export type VideoKey =
  | "promo"
  | "driver-intro"
  | "how-it-works"
  | "morning-rush"
  | "founder-story"
  | "trip-questions";

export const VIDEOS: Record<
  VideoKey,
  {
    id: string;
    narration: typeof NARRATION;
    scenePlan: { id: SceneId; segments: readonly string[] }[];
    voiceDir: string;
    output: string;
    timing: Timing;
    // Контрольный кадр «конец сцены» — за столько секунд до её конца.
    stillEndSec?: number;
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
  "morning-rush": {
    id: "BalaGoMorningRush",
    narration: MORNING_NARRATION,
    scenePlan: MORNING_SCENE_PLAN,
    voiceDir: "audio/morning-rush",
    output: "balago-morning-rush",
    timing: MORNING_TIMING,
  },
  "founder-story": {
    id: "BalaGoFounderStory",
    narration: FOUNDER_NARRATION,
    scenePlan: FOUNDER_SCENE_PLAN,
    voiceDir: "audio/founder-story",
    output: "balago-founder-story",
    timing: FOUNDER_TIMING,
  },
  "trip-questions": {
    id: "BalaGoTripQuestions",
    narration: TQ_NARRATION,
    scenePlan: TQ_SCENE_PLAN,
    voiceDir: "audio/trip-questions",
    output: "balago-trip-questions",
    timing: TQ_TIMING,
    // В конце каждой сцены карточка сворачивается в ряд — контрольный
    // кадр берём до этого, с полностью раскрытой карточкой.
    stillEndSec: 1.0,
  },
};
