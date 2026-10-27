// Десятый ролик в 2D: «Жумуштан жарым саатка» (композиция BalaGoHalfHour2D,
// ровно 120 с, 1080×1920, 30 fps). Отдельная 2D-версия; 3D-версия
// (BalaGoHalfHour, PR #13) не используется и не меняется.
//
// Файл без зависимостей от Remotion: его читают и Node-скрипты
// (scripts/generate-hh2d-voice.mjs, scripts/hh2d-voice-samples.mjs).
//
// BalaGo готовится к запуску: только предварительная регистрация через
// ссылку в профиле. Без WhatsApp, цен, гарантий и подтверждённых поездок.

export const HH2_VIDEO = {
  id: "BalaGoHalfHour2D",
  output: "balago-half-hour-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 120,
  voiceDir: "audio/half-hour-2d",
} as const;

export const HH2_FRAMES = HH2_VIDEO.durationSec * HH2_VIDEO.fps;

// ---------- Сцены (фиксированная шкала, секунды) ----------
export type Hh2SceneId =
  | "office"
  | "delay"
  | "school"
  | "road"
  | "meet"
  | "back"
  | "evening"
  | "form"
  | "cta";

export const HH2_SCENES: readonly {
  readonly id: Hh2SceneId;
  readonly title: string;
  readonly from: number;
  readonly to: number;
}[] = [
  { id: "office", title: "1. Кеңсе", from: 0, to: 14 },
  { id: "delay", title: "2. Кармалып калуу", from: 14, to: 30 },
  { id: "school", title: "3. Мектеп", from: 30, to: 44 },
  { id: "road", title: "4. Жол", from: 44, to: 63 },
  { id: "meet", title: "5. Жолугушуу", from: 63, to: 82 },
  { id: "back", title: "6. Кайра жумушка", from: 82, to: 95 },
  { id: "evening", title: "7. Кечинде үйдө", from: 95, to: 108 },
  { id: "form", title: "8. Алдын ала арыз", from: 108, to: 114 },
  { id: "cta", title: "9. Финалдык экран", from: 114, to: 120 },
];

// ---------- Голоса ----------
export type Hh2Role =
  | "mother"
  | "son"
  | "husband"
  | "boss"
  | "colleague"
  | "teacher";

type Voice = { readonly name: string; readonly voiceId: string };

// Кандидаты: стандартные (premade) голоса ElevenLabs и голоса носителей
// кыргызского языка, созданные Voice Design ("design:<роль>", voice_id — в
// voice-samples/half-hour-2d/design/voices.json; описания —
// src/half-hour-2d/voiceDesign.ts). Пробы мамы, сына и мужа —
// scripts/hh2d-voice-samples.mjs; выбор — HH2_VOICE_CHOICE ниже.
export const HH2_CANDIDATES: Record<Hh2Role, readonly Voice[]> = {
  mother: [
    { name: "Sarah", voiceId: "EXAVITQu4vr4xnSDxMaL" },
    { name: "Aria", voiceId: "9BWtsMINqrJLrRacOk9x" },
    { name: "Charlotte", voiceId: "XB0fDUnXU5powFXDhCwa" },
    { name: "KG-mother", voiceId: "design:mother" },
  ],
  son: [
    { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9" },
    { name: "Laura", voiceId: "FGY2WhTYpPnrIDTdsKH5" },
    { name: "River", voiceId: "SAz9YHcvj6GT2YYXdXww" },
    { name: "KG-son", voiceId: "design:son" },
  ],
  husband: [
    { name: "Brian", voiceId: "nPczCjzI2devNBz1zQrb" },
    { name: "Chris", voiceId: "iP95p4xoKVk53GoZ742B" },
    { name: "Will", voiceId: "bIHbv24MWmeRgasZH58o" },
    { name: "KG-husband", voiceId: "design:husband" },
  ],
  boss: [
    { name: "Daniel", voiceId: "onwK4e9ZLuTAKqWW03F9" },
    { name: "KG-boss", voiceId: "design:boss" },
  ],
  colleague: [
    { name: "Callum", voiceId: "N2lVS1w4EtoT3dr4eOWO" },
    { name: "KG-colleague", voiceId: "design:colleague" },
  ],
  teacher: [
    { name: "Alice", voiceId: "Xb7hH8MSUJpSbSDYk0k2" },
    { name: "KG-teacher", voiceId: "design:teacher" },
  ],
};

// Выбранные голоса (имя из HH2_CANDIDATES). null — ещё не выбран: полная
// озвучка не запускается, ролик собирается по оценочным таймингам.
export const HH2_VOICE_CHOICE: Record<Hh2Role, string | null> = {
  // Стандартные англоязычные голоса давали в кыргызской речи акцент
  // (распознавание MMS: «бүттү» → «бетти», «күттүрүп койдум» → «куттур
  // пойдум»). Все роли озвучивают голоса носителей кыргызского языка,
  // созданные Voice Design (выбор — src/half-hour-2d/voiceDesign.ts).
  mother: "KG-mother",
  son: "KG-son",
  husband: "KG-husband",
  boss: "KG-boss",
  colleague: "KG-colleague",
  teacher: "KG-teacher",
};

export const HH2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 73,
  // eleven_v3: 0.5 — естественный режим (без театральности).
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// ---------- Реплики ----------
// at — начало речи на шкале ролика (с). Длительность берётся из готового
// файла; проверка (scripts/half-hour-2d.test.mjs) требует, чтобы реплика
// закончилась до следующей и до конца диалога (114 с − запас).
// spoken — текст для синтеза, если отличается (BalaGo → «БалаГо»).
export type Hh2Line = {
  readonly id: string;
  readonly role: Hh2Role;
  readonly scene: Hh2SceneId;
  readonly at: number;
  readonly text: string;
  readonly spoken?: string;
  readonly tag?: string;
  // Конец речи не позже (с); по умолчанию — конец сцены.
  readonly maxEnd?: number;
  // Свой seed синтеза (чтобы перегенерировать только эту реплику).
  readonly seed?: number;
};

export const HH2_LINES: readonly Hh2Line[] = [
  {
    id: "m01",
    role: "mother",
    scene: "office",
    at: 2.6,
    text: "Уулумду мектептен алып келишим керек. Жарым саатка чыгып, кайра келем.",
  },
  {
    id: "b01",
    role: "boss",
    scene: "office",
    at: 7.5,
    text: "Макул, бара бериңиз.",
  },
  {
    id: "c01",
    role: "colleague",
    scene: "delay",
    at: 15.4,
    // перегенерация: 3 дубля, лучший по распознаванию MMS
    seed: 201,
    text: "Айгерим, бир аз жардам берип коёсуңбу?",
  },
  {
    id: "m02",
    role: "mother",
    scene: "delay",
    at: 18.5,
    // перегенерация: 3 дубля, лучший по распознаванию MMS
    seed: 101,
    text: "Макул. Бирок көпкө кала албайм.",
  },
  {
    id: "s01",
    role: "son",
    scene: "school",
    at: 34.4,
    text: "Апа, сабак бүттү.",
  },
  {
    id: "m03",
    role: "mother",
    scene: "school",
    at: 39.0,
    text: "Азыр чыгам, уулум.",
  },
  {
    id: "t01",
    role: "teacher",
    scene: "road",
    at: 51.4,
    text: "Апаң азыр келет. Мен сени менен чогуу күтүп турам.",
  },
  {
    id: "m04",
    role: "mother",
    scene: "meet",
    at: 64.6,
    // перегенерация: 3 дубля, лучший по распознаванию MMS
    seed: 101,
    text: "Уулум, кечигип калдым.",
  },
  {
    id: "s02",
    role: "son",
    scene: "meet",
    at: 67.6,
    tag: "[sad]",
    // перегенерация: 3 дубля, лучший по распознаванию MMS
    seed: 101,
    text: "Апа, эмнеге мени дайыма эң акырында алып кетесиң?",
  },
  {
    id: "m05",
    role: "mother",
    scene: "meet",
    at: 72.4,
    text: "Жумуштан чыга албай калдым...",
  },
  {
    id: "m06",
    role: "mother",
    scene: "meet",
    at: 77.2,
    // перегенерация: 3 дубля, лучший по распознаванию MMS
    seed: 101,
    text: "Сени көп күттүрүп койдум. Кечирип кой.",
  },
  {
    id: "m07",
    role: "mother",
    scene: "evening",
    at: 96.0,
    text: "Күн сайын же жумушка, же уулума кечигип жатам.",
  },
  {
    id: "h01",
    role: "husband",
    scene: "evening",
    at: 100.1,
    text: "Кел, анын мектепке жолун алдын ала уюштуралы.",
  },
  {
    id: "h02",
    role: "husband",
    scene: "evening",
    at: 104.0,
    // заканчивается на крупном плане страницы BalaGo (начало сцены формы)
    maxEnd: 110.2,
    text: "Мына, BalaGo — балдар үчүн такси. Азыр алдын ала каттоо жүрүп жатат.",
    spoken:
      "Мына, БалаГо — балдар үчүн такси. Азыр алдын ала каттоо жүрүп жатат.",
  },
];

// Диалог должен закончиться до финального экрана (с запасом).
export const HH2_DIALOG_END = 113.2;

// ---------- Пробы голосов ----------
// Каждый кандидат читает реплики своей роли из ролика.
export const HH2_SAMPLE_LINES: Record<"mother" | "son" | "husband", readonly string[]> = {
  mother: ["m01", "m06"],
  son: ["s01", "s02"],
  husband: ["h01", "h02"],
};

// ---------- Экранные надписи ----------
export const HH2_TEXT = {
  watchMessage: "Апа, сабак бүттү.",
  reply: "Азыр чыгам, уулум.",
  sonContact: "Уулум",
  task: "Квартал отчету",
  missed: "Кабыл алынбаган чалуу",
  school: "Мектеп",
  page: {
    tagline: "Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    status: "Алдын ала каттоо жүрүп жатат",
  },
  form: {
    title: "Алдын ала каттоо",
    school: "Мектеп",
    schoolValue: "№ 12 мектеп",
    address: "Дарек",
    addressValue: "Ахунбаев көч., 45",
    time: "Убакыт",
    timeValue: "Сабактан кийин, 12:30",
    send: "Арызды жөнөтүү",
    sent: "Арыз жөнөтүлдү",
    contact: "Сиз менен байланышабыз.",
  },
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    status: "Алдын ала каттоо жүрүп жатат",
    button: "Баланы каттоо",
    link: "Профилдеги шилтеме аркылуу",
    or: "же",
    whatsapp: "WhatsApp аркылуу жазыңыз",
    // тот же номер проекта, что в BalaGoMorningStory / BalaGoFounderStory
    phone: "0998 08 38 28",
    whatsappUrl: "https://wa.me/996998083828",
  },
} as const;

export const lineById = (id: string) => {
  const l = HH2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};
