// Десятый сценарий: «Жумуштан жарым саатка» (BalaGoHalfHour, 3D, ровно 120 с).
// Мама каждый день уходит с работы, чтобы забрать сына из школы: задачи
// задерживают, ребёнок ждёт, дорога отнимает время. Вечером семья решает
// заранее организовать школьные поездки и оставляет заявку BalaGo.
//
// Файл без зависимостей от Remotion (его читают Node-скрипты озвучки).
// BalaGo ещё готовится к запуску: только предварительная заявка, без
// «подтверждённой поездки», цен, гарантий и дат.

export const HH_VIDEO = {
  id: "BalaGoHalfHour",
  output: "balago-half-hour",
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 120,
  // Речь заканчивается не позже 114 с; финальный экран — 114–120 с.
  speechEndMaxSec: 114,
  ctaFromSec: 114,
  voiceDir: "audio/half-hour",
} as const;

export type HHRole =
  | "mother"
  | "son"
  | "husband"
  | "colleague"
  | "teacher"
  | "boss";

type Voice = { readonly name: string; readonly voiceId: string };

// Кандидаты голосов (стандартные голоса ElevenLabs). Для сына пробуется
// Voice Design (голос мальчика) — см. scripts/hh-voice-probe.mjs; выбранные
// голоса фиксируются в HH_VOICE_CHOICE после проверки проб.
export const HH_VOICES: Record<HHRole, { readonly role: string; readonly candidates: readonly Voice[] }> = {
  mother: {
    role: "Мама — тёплый взрослый женский голос",
    candidates: [
      { name: "Sarah", voiceId: "EXAVITQu4vr4xnSDxMaL" },
      { name: "Aria", voiceId: "9BWtsMINqrJLrRacOk9x" },
    ],
  },
  son: {
    role: "Сын — мальчик школьного возраста, естественно, без писка",
    candidates: [
      { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9" },
      { name: "Laura", voiceId: "FGY2WhTYpPnrIDTdsKH5" },
    ],
  },
  husband: {
    role: "Муж — спокойный взрослый мужской голос",
    candidates: [{ name: "Brian", voiceId: "nPczCjzI2devNBz1zQrb" }],
  },
  colleague: {
    role: "Коллега — молодой мужской голос",
    candidates: [
      { name: "Liam", voiceId: "TX3LPaxmHKxFdv7VOQHJ" },
      { name: "Will", voiceId: "bIHbv24MWmeRgasZH58o" },
      { name: "Chris", voiceId: "iP95p4xoKVk53GoZ742B" },
    ],
  },
  teacher: {
    role: "Учительница — спокойный уверенный женский голос",
    candidates: [
      { name: "Alice", voiceId: "Xb7hH8MSUJpSbSDYk0k2" },
      { name: "Charlotte", voiceId: "XB0fDUnXU5powFXDhCwa" },
    ],
  },
  boss: {
    role: "Руководитель — спокойный деловой мужской голос",
    candidates: [
      { name: "Daniel", voiceId: "onwK4e9ZLuTAKqWW03F9" },
      { name: "George", voiceId: "JBFqnCBsd6RMkjVDRZzb" },
    ],
  },
};

// Reuse the Kyrgyz-speaking voices prepared for the same family story.
// Cached dialogue comes from f8cdfbf (half-hour-2d); new lines use the same voices.
export const HH_VOICE_CHOICE: Record<HHRole, Voice | null> = {
  "mother": {
    "name": "KG-mother",
    "voiceId": "5Xx0r0RX4XWEq5vEdv8p"
  },
  "boss": {
    "name": "KG-boss",
    "voiceId": "yCcjraKUNFsfIv02eS9D"
  },
  "colleague": {
    "name": "KG-colleague",
    "voiceId": "S87HaYymDP3SARzmBPgS"
  },
  "son": {
    "name": "KG-son",
    "voiceId": "Oxj8oi9pAu19zqQOffmM"
  },
  "teacher": {
    "name": "KG-teacher",
    "voiceId": "EBOfpUWl9G5ltD2PkFgy"
  },
  "husband": {
    "name": "KG-husband",
    "voiceId": "NVEGeFqcDqc5o29VoAQm"
  }
};

export const HH_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 73,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Пробы ключевых реплик мамы и сына (до основной озвучки).
export const HH_PROBES = {
  mother: [
    "Уулумду мектептен алып келишим керек. Тез эле кайтып келем.",
    "Кечирип кой, уулум. Сени күттүрүп койдум.",
  ],
  son: ["Апа, сабак бүттү.", "Апа, эмне үчүн сен дайыма эң акыркы келесиң?"],
  // Описание голоса мальчика для Voice Design (если доступно ключу).
  sonDesign:
    "A calm, natural voice of a 10-year-old boy from Bishkek speaking Kyrgyz. Soft, slightly shy, clear diction, " +
    "no cartoon squeak, not exaggerated, normal child pitch, recorded close to the microphone in a quiet room.",
} as const;

// Второй раунд проб голоса сына (scripts/hh-son-probe.mjs): реплики сына и
// фраза на ө, ү, ң. Кандидаты — стандартные голоса ElevenLabs, доступные
// ключу; Voice Design детского голоса сервис блокирует (blocked_generation),
// обходить это переформулировкой нельзя.
export const HH_SON_PROBES = {
  texts: [
    "Апа, сабак бүттү.",
    "Апа, эмне үчүн сен дайыма эң акыркы келесиң?",
    "Мен өзүм күтүп турдум. Сенин телефонуң өчүк беле?",
  ],
  candidates: [
    { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9" },
    { name: "Laura", voiceId: "FGY2WhTYpPnrIDTdsKH5" },
    { name: "Charlotte", voiceId: "XB0fDUnXU5powFXDhCwa" },
    { name: "River", voiceId: "SAz9YHcvj6GT2YYXdXww" },
    { name: "Lily", voiceId: "pFZP5JQG7iQjIQuC4Bku" },
    { name: "Charlie", voiceId: "IKne3meq5aSn9XLyUdCD" },
    { name: "Will", voiceId: "bIHbv24MWmeRgasZH58o" },
  ],
  // поиск в общей библиотеке голосов (если ключ это разрешает)
  librarySearch: ["boy", "kid", "child", "young boy"],
} as const;

export type HHLine = {
  readonly id: string;
  readonly role: HHRole;
  readonly text: string; // как в сценарии (экран/проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  // Прослушанный и выбранный дубль (voice-samples/half-hour-retake/…);
  // принимается в кэш scripts/hh-adopt-take.mjs, генератор его не заменяет.
  readonly take?: string;
};

// Реплики по порядку. Монтаж (паузы и действие) — в src/half-hour/timeline.ts.
// Рассказчика нет: финальный экран говорит сам за себя (текст + кнопка).
export const HH_LINES: readonly HHLine[] = [
  {
    "id": "m01",
    "role": "mother",
    "text": "Уулумду мектептен алып келишим керек. Жарым саатка чыгып, кайра келем."
  },
  {
    "id": "b01",
    "role": "boss",
    "text": "Макул, бара бериңиз."
  },
  {
    "id": "c01",
    "role": "colleague",
    "text": "Айгерим, бир аз жардам берип коёсуңбу?"
  },
  {
    "id": "m02",
    "role": "mother",
    "text": "Макул. Бирок көпкө кала албайм."
  },
  {
    "id": "s01",
    "role": "son",
    "text": "Апа, сабак бүттү."
  },
  {
    "id": "t01",
    "role": "teacher",
    "text": "Апаң азыр келет. Мен сени менен чогуу күтүп турам."
  },
  {
    "id": "m03",
    "role": "mother",
    "text": "Гүлзат эже, рахмат. Кечиресиз, кечигип калдым.",
    "take": "voice-samples/half-hour-retake/m03-s101-pause.mp3"
  },
  {
    "id": "t02",
    "role": "teacher",
    "text": "Эч нерсе эмес."
  },
  {
    "id": "s02",
    "role": "son",
    "text": "Апа, эмнеге мени дайыма эң акырында алып кетесиң?"
  },
  {
    "id": "m04",
    "role": "mother",
    "text": "Жумуштан чыга албай калдым..."
  },
  {
    "id": "m05",
    "role": "mother",
    "text": "Сени көп күттүрүп койдум. Кечирип кой."
  },
  {
    "id": "m06",
    "role": "mother",
    "text": "Күн сайын же жумушка, же уулума кечигип жатам.",
    "take": "voice-samples/half-hour-retake/m06-s202.mp3"
  },
  {
    "id": "h01",
    "role": "husband",
    "text": "Кел, анын мектепке жолун алдын ала уюштуралы."
  },
  {
    "id": "h02",
    "role": "husband",
    "text": "Мына, BalaGo — балдар үчүн такси. Азыр алдын ала каттоо жүрүп жатат.",
    "spoken": "Мына, БалаГо — балдар үчүн такси. Азыр алдын ала каттоо жүрүп жатат."
  },
  {
    "id": "m07",
    "role": "mother",
    "text": "Анда даректи, мектепти жана убакытты жазалы."
  }
];

// Экранные надписи и интерфейсы (кыргызча).
export const HH_TEXT = {
  reminder: { title: "Эскертме", body: "Уулумдун сабагы бүтөт", time: "12:30" },
  chat: { name: "Уулум", in: "Апа, сабак бүттү.", out: "Азыр чыгып жатам" },
  missed: "3 кабыл алынбаган чалуу",
  task: "Тапшырма: аткарылууда",
  school: "Мектеп",
  form: {
    title: "Алдын ала каттоо",
    school: "Мектеп",
    schoolValue: "№ 61 мектеп",
    address: "Дарек",
    addressValue: "Жал кичи району",
    time: "Убакыт",
    timeValue: "12:30 — мектептен үйгө",
    send: "Арызды жөнөтүү",
    sent: "Арыз жөнөтүлдү. Сиз менен байланышабыз.",
  },
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    status: "Алдын ала каттоо жүрүп жатат",
    button: "Баланы каттоо",
    link: "Профилдеги шилтеме аркылуу",
  },
} as const;
