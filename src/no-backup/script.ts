// Ролик «Бүгүн жеткире турган киши жок» (BalaGoNoBackup, сценарий №11,
// 3D, ровно 120 с). Обычно семья помогает друг другу отвозить дочку в школу,
// но сегодня все заняты: папе нужно раньше на работу, бабушка записана к
// врачу, брат после ночной смены, подруга на другом конце города. Мама сама
// отвозит дочку и опаздывает на работу. Вечером родители оставляют
// предварительную заявку BalaGo.
//
// Файл без зависимостей от Remotion (его читают Node-скрипты озвучки).
// BalaGo ещё готовится к запуску: только предварительная заявка, без
// подтверждённых поездок, цен, гарантий, отзывов и дат.

export const NB_VIDEO = {
  id: "BalaGoNoBackup",
  output: "balago-no-backup",
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 120,
  // Речь заканчивается не позже 108 с (дальше — форма и финальный экран).
  speechEndMaxSec: 108,
  ctaFromSec: 114,
  voiceDir: "audio/no-backup",
} as const;

export type NBRole = "mother" | "father" | "daughter" | "grandma" | "brother" | "colleague";

export type NBVoice = { readonly name: string; readonly voiceId: string };

// Кандидаты голосов (стандартные голоса ElevenLabs, проверенные в проекте).
// Бабушка: сначала пробуется Voice Design (тёплый голос пожилой женщины),
// см. scripts/nb-voice-probe.mjs; если сервис не дал голос — Lily/Alice.
export const NB_VOICES: Record<NBRole, { readonly role: string; readonly candidates: readonly NBVoice[] }> = {
  mother: {
    role: "Мама — естественный тёплый женский голос",
    candidates: [
      { name: "Aria", voiceId: "9BWtsMINqrJLrRacOk9x" },
      { name: "Sarah", voiceId: "EXAVITQu4vr4xnSDxMaL" },
      { name: "Matilda", voiceId: "XrExE9yKIg1WjnStdHDv" },
    ],
  },
  father: {
    role: "Папа — спокойный взрослый мужской голос",
    candidates: [
      { name: "Brian", voiceId: "nPczCjzI2devNBz1zQrb" },
      { name: "Chris", voiceId: "iP95p4xoKVk53GoZ742B" },
    ],
  },
  daughter: {
    role: "Дочка — мягкий голос девочки школьного возраста",
    candidates: [
      { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9" },
      { name: "Laura", voiceId: "FGY2WhTYpPnrIDTdsKH5" },
      { name: "Lily", voiceId: "pFZP5JQG7iQjIQuC4Bku" },
    ],
  },
  grandma: {
    role: "Бабушка — тёплый голос пожилой женщины",
    candidates: [
      { name: "Lily", voiceId: "pFZP5JQG7iQjIQuC4Bku" },
      { name: "Alice", voiceId: "Xb7hH8MSUJpSbSDYk0k2" },
    ],
  },
  brother: {
    role: "Брат — уставший молодой мужской голос (голосовое сообщение)",
    candidates: [
      { name: "Liam", voiceId: "TX3LPaxmHKxFdv7VOQHJ" },
      { name: "Will", voiceId: "bIHbv24MWmeRgasZH58o" },
    ],
  },
  colleague: {
    role: "Коллега — спокойный взрослый мужской голос",
    candidates: [
      { name: "Daniel", voiceId: "onwK4e9ZLuTAKqWW03F9" },
      { name: "George", voiceId: "JBFqnCBsd6RMkjVDRZzb" },
    ],
  },
};

// Голоса ролей. Мама, папа и дочка — проверенные голоса седьмого ролика
// («Бир таң»: Aria, Brian, Jessica); пробы альтернатив —
// voice-samples/no-backup/. Голос бабушки: «design» — голос из Voice Design
// (если создан пробами), иначе первый кандидат. Сменить голос роли — одна
// строка; перегенерируются только реплики этой роли.
export const NB_VOICE_CHOICE: Record<NBRole, NBVoice | "design" | null> = {
  mother: { name: "Aria", voiceId: "9BWtsMINqrJLrRacOk9x" },
  father: { name: "Brian", voiceId: "nPczCjzI2devNBz1zQrb" },
  daughter: { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9" },
  grandma: "design",
  brother: { name: "Liam", voiceId: "TX3LPaxmHKxFdv7VOQHJ" },
  colleague: { name: "Daniel", voiceId: "onwK4e9ZLuTAKqWW03F9" },
};

export const NB_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 11,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Пробы голосов (до основной озвучки): по одной фразе роли каждым
// кандидатом. Собираются в один файл voice-samples/no-backup/probes.mp4
// с подписями голосов.
export const NB_PROBES = {
  mother: "Макул, азыр бир жолун табабыз. Мен жеткирем, кызым.",
  father: "Кызым, бүгүн жумушка эртерээк барышым керек болуп калды.",
  daughter: "Ата, бүгүн мени мектепке сен жеткиресиңби?",
  grandma: "Кызым, бүгүн эртең менен дарыгерге жазылып койгом.",
  grandmaDesign:
    "A warm, kind voice of a 65-year-old grandmother from Bishkek speaking Kyrgyz. Gentle and calm, slightly slow, " +
    "soft natural timbre of an elderly woman, not theatrical, recorded close to the microphone in a quiet room.",
  grandmaDesignText:
    "Кызым, бүгүн эртең менен дарыгерге жазылып койгом. Кечирип кой, балам. Эртең болсо мен өзүм алып барам. " +
    "Кабатыр болбо, баары жакшы болот. Небереме салам айт, кечинде чалып коём.",
} as const;

export type NBLine = {
  readonly id: string;
  readonly role: NBRole;
  readonly text: string; // как в сценарии (экран/проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly phone?: boolean; // звучит из телефона (голосовое сообщение)
};

// Реплики по порядку. Монтаж (паузы и действие) — в timeline.ts.
export const NB_LINES: readonly NBLine[] = [
  { id: "d01", role: "daughter", text: "Ата, бүгүн мени мектепке сен жеткиресиңби?" },
  { id: "f01", role: "father", text: "Кызым, бүгүн жумушка эртерээк барышым керек болуп калды." },
  { id: "m01", role: "mother", text: "Макул, азыр бир жолун табабыз." },
  { id: "m02", role: "mother", text: "Апа, бүгүн кызымды мектепке жеткирип коё аласызбы?" },
  { id: "g01", role: "grandma", text: "Кызым, бүгүн эртең менен дарыгерге жазылып койгом." },
  { id: "m03", role: "mother", text: "Макул, апа. Кабатыр болбоңуз." },
  { id: "b01", role: "brother", text: "Эже, түнкү нөөмөттөн жаңы чыктым. Бүгүн бара албайм.", phone: true },
  { id: "d02", role: "daughter", text: "Апа, эми ким менен барам?" },
  { id: "m04", role: "mother", text: "Мен жеткирем, кызым. Жүр, кеттик." },
  { id: "d03", role: "daughter", text: "Рахмат, апа!" },
  { id: "m05", role: "mother", text: "Жакшы оку, кызым." },
  { id: "c01", role: "colleague", text: "Баары жакшыбы?" },
  { id: "m06", role: "mother", text: "Ооба. Бүгүн кызымды мектепке жеткире турган киши табылбай калды." },
  { id: "m07", role: "mother", text: "Күн сайын ким бош экенин сурай бербей, башка жолун табалычы." },
  {
    id: "f02",
    role: "father",
    text: "Мына, BalaGo — балдар үчүн такси. Азыр алдын ала каттоо жүрүп жатат.",
    spoken: "Мына, БалаГо — балдар үчүн такси. Азыр алдын ала каттоо жүрүп жатат.",
  },
];

// Экранные надписи и интерфейсы (кыргызча).
export const NB_TEXT = {
  dadMsg: { from: "Жумуш", body: "Бүгүн жыйналыш 08:00дө башталат" },
  call: { name: "Апа", status: "Чалуу…" },
  brother: { name: "Иним", voice: "Үн билдирүү · 0:04" },
  friend: { name: "Динара", body: "Мен азыр шаардын башка жагындамын. Убагында жетише албайм." },
  workMissed: { app: "Жумуш тобу", body: "Эртең мененки жыйналыш башталды", time: "08:14" },
  school: "№ 24 мектеп",
  form: {
    title: "Алдын ала каттоо",
    name: "Аты-жөнү",
    nameValue: "Айсулуу, 2-класс",
    school: "Мектеп",
    schoolValue: "№ 24 мектеп",
    address: "Дарек",
    addressValue: "Асанбай кичи району",
    time: "Убакыт",
    timeValue: "07:30 — үйдөн мектепке",
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
