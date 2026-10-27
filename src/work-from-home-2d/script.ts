// Двадцать восьмой сценарий, 2D: «Эмне үчүн апасы үйдө кечигет?»
// («Почему мама задерживалась дома?», композиция BalaGoWorkFromHome2D).
//
// Мама — аналитик и работает из дома, но ежедневные поездки за сыном рвут
// её рабочий день: после дороги нужно заново вспоминать задачу, поэтому
// работа уходит в вечер, а ужин остывает. Однажды сына забирает папа и
// занимается с ним дома — при тех же задачах мама закрывает ноутбук в 17:30
// и спокойно смотрит тетрадь сына. Родители понимают, что папа не может
// помогать каждый день, сами находят BalaGo и оставляют предварительную
// заявку на школьный маршрут; дома сына будет встречать мама. В тот же
// вечер мама читает сыну книгу. Последние 150 кадров — контактная карточка.
//
// Только предварительная заявка: без поездки BalaGo, подтверждения
// маршрута, оплаты и ответов сотрудников.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const WFH_VIDEO = {
  id: "BalaGoWorkFromHome2D",
  output: "balago-28-work-from-home-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/work-from-home-2d",
} as const;

// ---------- Сцены (секунды) ----------
// Шкала выставлена по измеренным длительностям озвучки
// (public/audio/work-from-home-2d/manifest.json).
export type WfhSceneId =
  | "paradox"
  | "work"
  | "morning"
  | "keys"
  | "context"
  | "late"
  | "dadPickup"
  | "focus"
  | "closing"
  | "notebook"
  | "calendars"
  | "search"
  | "book"
  | "card";

export const WFH_SCENES: readonly {
  readonly id: WfhSceneId;
  readonly title: string;
  readonly from: number;
  readonly to: number;
}[] = [
  { id: "paradox", title: "01. Ал үйдөн иштейт — бирок баарынан кеч", from: 0, to: 10 },
  { id: "work", title: "02. Чыныгы жумуш күнү", from: 10, to: 21 },
  { id: "morning", title: "03. Эртең мененки жол", from: 21, to: 29.5 },
  { id: "keys", title: "04. Кайра ачкыч", from: 29.5, to: 41.5 },
  { id: "context", title: "05. Баягы эле документ", from: 41.5, to: 55 },
  { id: "late", title: "06. Дагы бир аз", from: 55, to: 68.5 },
  { id: "dadPickup", title: "07. Бул жолу атасы алып келди", from: 68.5, to: 76.5 },
  { id: "focus", title: "08. Иш үзгүлтүксүз", from: 76.5, to: 86.5 },
  { id: "closing", title: "09. 17:30", from: 86.5, to: 101 },
  { id: "notebook", title: "10. Шашпай карачы", from: 101, to: 112 },
  { id: "calendars", title: "11. Туруктуу жол керек", from: 112, to: 125 },
  { id: "search", title: "12. BalaGo'ну өздөрү табышты", from: 125, to: 139 },
  { id: "book", title: "13. Бир бөлүм", from: 139, to: 148 },
  { id: "card", title: "14. Байланыш", from: 148, to: 153 },
];

export const WFH_DURATION = WFH_SCENES[WFH_SCENES.length - 1].to;
export const WFH_FRAMES = Math.round(WFH_DURATION * WFH_VIDEO.fps);
// Контактная карточка — ровно последние 150 кадров (5 с).
export const WFH_CARD_FRAMES = 150;
export const WFH_CARD_FROM = WFH_FRAMES - WFH_CARD_FRAMES;

// ---------- Голоса ----------
export type WfhRole = "narrator" | "mother" | "father" | "son";

export const WFH_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 2801,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Голоса выбраны по коротким пробам (voice-samples/work-from-home-2d,
// замеры MMS CER и F0): рассказчик — Eric, голос BalaGo из роликов №1–7
// (N01 распознаётся точнее, чем у KG-teacher: CER 0–3 % против 9–13 %, и
// он отличается от папы по высоте ≈ 160 / 120 Гц); мама, папа и сын —
// кыргызские голоса проекта из роликов №10–12. Детский голос не получается
// повышением тона или ускорением взрослой записи. У папы и сына дубли
// без аудиотегов звучат ровнее, поэтому теги у них не используются.
export const WFH_VOICES: Record<WfhRole, { readonly name: string; readonly voiceId: string }> = {
  narrator: { name: "Eric", voiceId: "cjVigY5qzO86Huf0OWal" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
};

// ---------- Реплики ----------
export type WfhLine = {
  readonly id: string;
  readonly role: WfhRole;
  readonly scene: WfhSceneId;
  readonly at: number; // начало речи, секунды от начала фильма
  readonly mode: "narration" | "dialogue";
  readonly text: string; // субтитры
  readonly spoken?: string; // текст для TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
  // Слова, выделенные в субтитрах жёлтым.
  readonly accent?: readonly string[];
};

export const WFH_LINES: readonly WfhLine[] = [
  {
    id: "N01",
    role: "narrator",
    scene: "paradox",
    at: 0.5,
    mode: "narration",
    text: "Апасы үйдөн иштечү. Бирок жумуштан үйгө баарынан кеч кайтчу… Болгону, коңшу бөлмөдөн чыкчу.",
    spoken: "Апасы үйдөн иштечү. Бирок жумуштан үйгө баарынан кеч кайтчу... Болгону, коңшу бөлмөдөн чыкчу.",
    accent: ["үйдөн", "коңшу", "бөлмөдөн"],
  },
  {
    id: "N02",
    role: "narrator",
    scene: "work",
    at: 10.6,
    mode: "narration",
    text: "Ал — аналитик. Өзүнчө иш үстөлү, жакшы компьютери, команда менен жолугушуулары жана мөөнөтүндө бүтүрө турган тапшырмалары бар.",
    spoken: "Ал аналитик. Өзүнчө иш үстөлү, жакшы компьютери, команда менен жолугушуулары жана мөөнөтүндө бүтүрө турган тапшырмалары бар.",
    accent: ["аналитик"],
  },
  {
    id: "N03",
    role: "narrator",
    scene: "morning",
    at: 21.5,
    mode: "narration",
    text: "Эртең менен атасы кеңсеге кетчү. Апасы уулун мектепке жеткирип, кайра компьютерине отурчу.",
  },
  {
    id: "N04",
    role: "narrator",
    scene: "keys",
    at: 31.2,
    mode: "narration",
    text: "Сабак бүткөндө кайра ачкычын алчу. Уулун мектептен алып келип, түшкү тамагын жылытып берчү.",
    accent: ["кайра"],
  },
  {
    id: "N05",
    role: "narrator",
    scene: "context",
    at: 42.6,
    mode: "narration",
    text: "Экранда баягы эле документ. Эми токтогон жерин эстеп, билдирүүлөрдү окуп, өзү жокто талкууланган суроону түшүнүшү керек.",
    accent: ["баягы эле"],
  },
  { id: "F01", role: "father", scene: "late", at: 57.4, mode: "dialogue", text: "Жакында бүтүрөсүңбү?" },
  { id: "M01", role: "mother", scene: "late", at: 59.6, mode: "dialogue", text: "Дагы бир аз.", tag: "[tired]" },
  {
    id: "N06",
    role: "narrator",
    scene: "late",
    at: 62.2,
    mode: "narration",
    text: "Кечки тамак муздап калды. Апасы чыкканда уулу дасторконду жыйнап жаткан.",
  },
  {
    id: "N07",
    role: "narrator",
    scene: "dadPickup",
    at: 69.2,
    mode: "narration",
    text: "Бир күнү атасынын жолугушуулары эрте бүттү. Бул жолу уулун өзү алып келди.",
    accent: ["өзү"],
  },
  {
    id: "N08",
    role: "narrator",
    scene: "focus",
    at: 77.4,
    mode: "narration",
    text: "Атасы уулу менен алек болуп турду. Апасы болсо ишин үзбөй улантты.",
    accent: ["үзбөй"],
  },
  {
    id: "N09",
    role: "narrator",
    scene: "closing",
    at: 87.2,
    mode: "narration",
    text: "Саат беш жарымда ал ноутбугун жапты.",
    seed: 2850,
    accent: ["беш жарымда"],
  },
  { id: "F02", role: "father", scene: "closing", at: 93.2, mode: "dialogue", text: "Бүгүн ишиң азыраакпы?" },
  {
    id: "M02",
    role: "mother",
    scene: "closing",
    at: 95.0,
    mode: "dialogue",
    text: "Жок, ошол эле. Болгону, алаксыбай отуруп, талдоону бүтүрүп алдым.",
    accent: ["ошол эле", "алаксыбай"],
  },
  {
    id: "B01",
    role: "son",
    scene: "notebook",
    at: 102.6,
    mode: "dialogue",
    text: "Апа, жазганымды карачы. Шашпай карасаң, ээ?",
    seed: 2812,
    accent: ["Шашпай"],
  },
  {
    id: "N10",
    role: "narrator",
    scene: "calendars",
    at: 112.6,
    mode: "narration",
    text: "Атасы айрым күндөрү жардам бере алат. Бирок анын иш тартиби өзгөрүп турат. Алар мектепке барып-келүүнү туруктуу уюштуруунун жолун издешти.",
    accent: ["туруктуу"],
  },
  {
    id: "N11",
    role: "narrator",
    scene: "search",
    at: 130.0,
    mode: "narration",
    text: "BalaGo кызматын таап, мектеп маршрутуна алдын ала өтүнмө калтырышты. Үйдө уулун апасы тосуп алат.",
    spoken: "БалаГо кызматын таап, мектеп маршрутуна алдын ала өтүнмө калтырышты. Үйдө уулун апасы тосуп алат.",
    accent: ["алдын ала"],
  },
  { id: "B02", role: "son", scene: "book", at: 140.6, mode: "dialogue", text: "Бир бөлүм окуйбузбу?", seed: 2812 },
  { id: "M03", role: "mother", scene: "book", at: 143.4, mode: "dialogue", text: "Кел, баштайлы.", tag: "[warmly]", seed: 2850 },
  {
    id: "N12",
    role: "narrator",
    scene: "card",
    at: 148.4,
    mode: "narration",
    text: "BalaGo — балдар үчүн такси.",
    spoken: "БалаГо — балдар үчүн такси.",
    tag: "[warmly]",
  },
];

// Речь заканчивается внутри файла (запас ≥ 0,8 с до конца).
export const WFH_SPEECH_END = WFH_DURATION - 0.8;

// Паузы, которые нужно сохранить: реакция на вопрос перед ответом.
export const WFH_MIN_GAP: Readonly<Record<string, number>> = { M01: 0.45, M02: 0.6, M03: 0.6, N06: 0.6 };

export const wfhLine = (id: string) => {
  const l = WFH_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const WFH_TEXT = {
  doc: {
    app: "Документтер",
    title: "Айлык талдоо",
    section: "3. Сатуулар боюнча жыйынтык",
    columns: ["Ай", "План", "Факт", "Айырма"],
    rows: [
      ["Июль", "120", "118", "−2"],
      ["Август", "125", "131", "+6"],
      ["Сентябрь", "130", "", ""],
      ["Октябрь", "135", "", ""],
    ],
    filled: [
      ["Сентябрь", "130", "137", "+7"],
      ["Октябрь", "135", "140", "+5"],
    ],
    chart: "Динамика",
    done: "Бөлүм бүттү",
    saved: "Сакталды",
  },
  calendar: { title: "Бүгүн", meeting: "Команда менен жолугушуу", meetingTime: "10:00", deadline: "Мөөнөт: жума" },
  chat: {
    title: "Команда",
    msgs: [
      { who: "Айгүл", text: "Бул көрсөткүчтү тактайлы.", time: "13:12" },
      { who: "Тимур", text: "Жаңыртылган маалыматты жөнөттүм.", time: "13:26" },
    ],
  },
  dadCal: { title: "Атамдын жолугушуулары", last: "Жолугушуу", lastTime: "11:00–12:00", free: "Бош" },
  clock: { noon: "13:00", evening: "20:10", done: "17:30", book: "19:10" },
  someDay: "Бир күнү",
  notebook: { title: "Менин үй-бүлөм", lines: ["Апам — аналитик.", "Атам кеңседе иштейт.", "Мен окуганды жакшы көрөм."] },
  plan: {
    days: [
      { day: "Шейшемби", busy: "Жолугушуу", time: "13:00" },
      { day: "Шаршемби", busy: "Бош", time: "13:00" },
    ],
    school: "Сабактын аягы",
    schoolTime: "13:00",
    meeting: "Жолугушуу",
  },
  search: {
    query: "баланы мектептен үйгө жеткирүү",
    resultTitle: "BalaGo",
    resultTag: "Балдар үчүн такси",
    resultText: "Мектепке барып-келүү. Алдын ала өтүнмө калтырса болот.",
    page: ["Үйдөн мектепке, мектептен үйгө", "Ата-эне менен убакытты алдын ала макулдашуу", "Алдын ала өтүнмө"],
  },
  form: {
    title: "Алдын ала өтүнмө",
    fields: [
      ["Маршрут", "Мектеп → Үй"],
      ["Сабак бүтөт", "13:00"],
      ["Баланы үйдө тосуп алуучу", "Апасы"],
    ],
    send: "Жөнөтүү",
    sent: "Өтүнмө жөнөтүлдү",
  },
  book: { title: "Жомоктор", chapter: "1-бөлүм" },
  card: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    whatsappLabel: "WhatsApp",
    whatsappNumber: "0998 08 38 28",
    note: "Маалымат жана алдын ала каттоо — профилдеги шилтемеде",
  },
} as const;

// Ссылка для документации (в кадре не показывается).
export const WFH_WHATSAPP_URL = "https://wa.me/996998083828";
