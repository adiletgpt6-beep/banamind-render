// Двенадцатый ролик в 2D: «Эки баланын эки башка убактысы»
// («У двоих детей — разное расписание», композиция BalaGoTwoSchedules2D,
// ровно 120 с).
//
// Младший сын заканчивает уроки в 12:00, старшая дочь — в 14:00; они
// учатся в одной школе. Мама рассчитывает поработать дома между поездками:
// забирает сына, кормит обедом, открывает ноутбук — и звонит дочь: уроки
// закончились раньше. Мама снова собирается, сына приходится брать с собой.
// Вечером муж спрашивает о её дне; родители садятся с расписаниями и
// оставляют предварительную заявку BalaGo, чтобы обсудить свой маршрут.
// Только предварительная регистрация: без цен, дат, гарантий
// и выполненных поездок BalaGo. В финале — номер WhatsApp основателя.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const TS2_VIDEO = {
  id: "BalaGoTwoSchedules2D",
  output: "balago-two-schedules-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 120,
  voiceDir: "audio/two-schedules-2d",
} as const;

export const TS2_FRAMES = TS2_VIDEO.durationSec * TS2_VIDEO.fps;
export const TS2_WHATSAPP_FROM = 115; // номер — последние пять секунд

// ---------- Сцены (фиксированная шкала, секунды) ----------
export type Ts2SceneId = "morning" | "trip1" | "lunch" | "call" | "ready" | "trip2" | "evening" | "plan" | "cta";

export const TS2_SCENES: readonly {
  readonly id: Ts2SceneId;
  readonly title: string;
  readonly from: number;
  readonly to: number;
}[] = [
  { id: "morning", title: "1. Эртең менен: план", from: 0, to: 12 },
  { id: "trip1", title: "2. Биринчи сапар", from: 12, to: 25 },
  { id: "lunch", title: "3. Түшкү тамак жана иш", from: 25, to: 41 },
  { id: "call", title: "4. Күтүлбөгөн чалуу", from: 41, to: 55 },
  { id: "ready", title: "5. Кайра даярдануу", from: 55, to: 69.5 },
  { id: "trip2", title: "6. Экинчи сапар", from: 69.5, to: 82 },
  { id: "evening", title: "7. Кечки сүйлөшүү", from: 82, to: 102.5 },
  { id: "plan", title: "8. Бирге чечим издөө", from: 102.5, to: 111 },
  { id: "cta", title: "9. Финалдык экран", from: 111, to: 120 },
];

// ---------- Голоса ----------
export type Ts2Role = "mother" | "father" | "son" | "daughter" | "narrator";

export const TS2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 121,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Голоса проекта, созданные ElevenLabs Voice Design как голоса носителей
// кыргызского языка (стандартные англоязычные голоса дают акцент). Новые
// голоса не создаются — берутся проверенные в 2D-роликах №10 и №11
// (voice-samples/half-hour-2d, voice-samples/no-backup-2d: замеры MMS).
//
// Дети: Voice Design не создаёт детские голоса, а механически поднимать
// тон взрослого голоса или ускорять речь нельзя. Поэтому, как принято в
// анимации, детей озвучивают светлые высокие молодые голоса; у сына голос
// выше и звонче (≈ 286 Гц), у дочери — мягче и спокойнее (≈ 262 Гц).
export const TS2_VOICES: Record<Ts2Role, { readonly name: string; readonly voiceId: string; readonly from: string }> = {
  // тёплый, мягкий, немного уставший голос мамы (№10, CER 1,8 %)
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p", from: "half-hour-2d" },
  // спокойный низкий голос мужа (№10, ≈110 Гц, CER 2,2 %)
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm", from: "half-hour-2d" },
  // самый светлый и звонкий голос (№10, ≈286 Гц, CER 4,2 %)
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM", from: "half-hour-2d" },
  // мягкий, высокий, искренний голос (№11, ≈262 Гц, CER 3,3 %)
  daughter: { name: "KG-daughter", voiceId: "AeboPz5CtE7qRUVvW93b", from: "no-backup-2d" },
  // спокойный доброжелательный женский голос для финала (№10, CER 2,1 %)
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "half-hour-2d" },
};

// ---------- Реплики ----------
export type Ts2Line = {
  readonly id: string;
  readonly role: Ts2Role;
  readonly scene: Ts2SceneId;
  // Момент начала речи (секунды от начала ролика).
  readonly at: number;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
  readonly phone?: boolean; // голос из телефона (звонок)
};

export const TS2_LINES: readonly Ts2Line[] = [
  { id: "f01", role: "father", scene: "morning", at: 3.1, text: "Бүгүн балдарды качан алып келесиң?" },
  { id: "m01", role: "mother", scene: "morning", at: 6.2, text: "Уулубузду он экиде, кызыбызды экиде. Ортодо иштеп алам." },
  { id: "s01", role: "son", scene: "trip1", at: 15.6, text: "Апа, бүгүн сүрөт тарттык. Кечинде сага көрсөтөм.", tag: "[excited]" },
  { id: "m02", role: "mother", scene: "trip1", at: 19.6, text: "Көрсөтөсүң. Азыр үйгө барып тамактаналы.", tag: "[warmly]" },
  { id: "s02", role: "son", scene: "lunch", at: 32.2, text: "Апа, сен да тамак ичесиңби?", seed: 422 },
  { id: "m03", role: "mother", scene: "lunch", at: 35.1, text: "Бир аздан кийин. Сен жей бер, мен бул ишти бүтүрүп алайын." },
  { id: "d01", role: "daughter", scene: "call", at: 45.2, text: "Апа, бүгүн сабагыбыз эрте бүттү. Мени алып кетесиңби?", phone: true, seed: 600 },
  { id: "m04", role: "mother", scene: "call", at: 49.6, text: "Ооба, кызым. Азыр даярданып, жолго чыгам." },
  { id: "s03", role: "son", scene: "ready", at: 59.4, text: "Биз кайра мектепке барабызбы? Мен чарчадым.", tag: "[tired]" },
  { id: "m05", role: "mother", scene: "ready", at: 63.4, text: "Ооба, эжеңди алып келебиз. Анан үйдө эс аласың.", tag: "[gently]" },
  { id: "m06", role: "mother", scene: "trip2", at: 74.6, text: "Жакындап калдык, кызым. Мугалимиңдин жанында күтүп тур." },
  { id: "f02", role: "father", scene: "evening", at: 83.6, text: "Бүгүн ишиңди бүтүрдүңбү?" },
  {
    id: "m07",
    role: "mother",
    scene: "evening",
    at: 85.8,
    text: "Бүтүрө алган жокмун. Бирин алып келсем, кайра экинчисине жөнөдүм. Күнүмдүн көбү жолдо өтүп кетти.",
    tag: "[tired]",
  },
  { id: "d02", role: "daughter", scene: "evening", at: 93.6, text: "Апа, мен сени шаштырдымбы?", tag: "[quietly]" },
  { id: "m08", role: "mother", scene: "evening", at: 96.4, text: "Жок, кызым. Сен күнөөлүү эмессиң. Биз убакытты жакшыраак уюштурушубуз керек.", tag: "[gently]" },
  { id: "m09", role: "mother", scene: "plan", at: 102.7, text: "Кел, экөөнүн убактысын жазып, алдын ала арыз калтыралы." },
  { id: "f03", role: "father", scene: "plan", at: 107.3, text: "Маршрутубуз боюнча сүйлөшүп көрөлү.", seed: 620 },
  {
    id: "n01",
    role: "narrator",
    scene: "cta",
    at: 111.25,
    text: "BalaGo. Балдар үчүн такси. Алдын ала катталуу — профилдеги шилтеме же WhatsApp аркылуу.",
    spoken: "БалаГо. Балдар үчүн такси. Алдын ала катталуу — профилдеги шилтеме же Ватсап аркылуу.",
    tag: "[warmly]",
    seed: 640,
  },
];

// Речь заканчивается до конца ролика (с запасом ≥ 1 с).
export const TS2_DIALOG_END = 119.3;

// Паузы между репликами, которые нужно сохранить (выразительная пауза
// между вопросом дочери и ответом мамы).
export const TS2_MIN_GAP: Readonly<Record<string, number>> = { m08: 0.8 };

export const lineById = (id: string) => {
  const l = TS2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const TS2_TEXT = {
  // утренний план на листке
  plan: {
    title: "Бүгүн",
    son: "Уулум — 12:00",
    daughter: "Кызым — 14:00",
    work: "Ортодо — иш",
  },
  school: "Мектеп",
  // рабочая задача на ноутбуке
  laptop: {
    app: "Документ",
    title: "Апталык отчёт",
    task: "3-бөлүм: жыйынтыктар",
    typed: "Жыйынтыгында, долбоор",
    progress: "2 / 5",
  },
  call: { contact: "Кызым", status: "чалып жатат…", accept: "Жооп берүү", decline: "Четке кагуу", talking: "Сүйлөшүү" },
  chat: {
    contact: "Кызым",
    online: "онлайн",
    msg: "Апа, сен алыстасыңбы?",
    msgTime: "13:21",
    voiceTime: "13:24",
  },
  // вечер: расписания детей
  schedules: [
    { who: "Уулум", time: "12:00", note: "1-класс" },
    { who: "Кызым", time: "14:00", note: "6-класс" },
  ],
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    status: "Алдын ала каттоо жүрүп жатат",
  },
  form: {
    title: "Алдын ала каттоо",
    fields: [
      ["Балдар", "Уулум, кызым"],
      ["Сабак бүтөт", "12:00 • 14:00"],
      ["Маршрут", "Үй → Мектеп → Үй"],
      ["Эскертүү", "Убакытты сүйлөшөлү"],
    ],
    send: "Арыз калтыруу",
    sent: "Алдын ала арыз калтырылды",
    note: "Маршрут жана убакыт боюнча сүйлөшүү үчүн",
  },
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    status: "Алдын ала каттоо жүрүп жатат",
    button: "Баланы каттоо",
    link: "Профилдеги шилтеме аркылуу",
    whatsappLabel: "WhatsApp",
    whatsappNumber: "0998 08 38 28",
  },
} as const;
