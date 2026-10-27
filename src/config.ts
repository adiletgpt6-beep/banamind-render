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
} as const;

// Кадрирование фотографий: точка фокуса (в % по ширине/высоте исходника)
// и плавное приближение zoomFrom → zoomTo за время сцены.
export const PHOTO_CROP = {
  portrait: { focusX: 50, focusY: 42, zoomFrom: 1.02, zoomTo: 1.1 },
  carExterior: { focusX: 46, focusY: 54, zoomFrom: 1.12, zoomTo: 1.22 },
  carInterior: { focusX: 50, focusY: 52, zoomFrom: 1.05, zoomTo: 1.15 },
  // Портрет в сцене «доверие» — крупнее, приближение к лицу.
  portraitClose: { focusX: 50, focusY: 40, zoomFrom: 1.0, zoomTo: 1.12 },
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
  | "cta";

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

export const TIMING = {
  minSec: 25,
  maxSec: 30,
  // Голос начинается почти сразу — сильное начало.
  narrationStartSec: 0.25,
  // Сцена появляется чуть раньше своей фразы.
  sceneLeadSec: 0.3,
  // Финальный призыв остаётся на экране после последнего слова.
  ctaHoldSec: 2.8,
  transitionFrames: 12,
} as const;

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
export const SFX_CUES: {
  scene: SceneId;
  segment?: string;
  offset: number;
  sound: keyof typeof AUDIO.sfx;
  volume: number;
}[] = [
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
