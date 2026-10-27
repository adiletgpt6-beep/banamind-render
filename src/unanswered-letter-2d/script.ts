// Ролик BalaGoUnansweredLetter2D — «Жооп берилбеген кат»
// («Письмо, на которое мама не отвечала»), сценарий №21, ровно 120 с.
//
// Айжан два года ждала возможности возглавить новое направление. Когда
// предложение пришло, три дня не могла дописать ответ: школьные поездки
// дочки совпадают с будущими встречами, у мужа в эти часы тоже встречи,
// бабушке ездить через город каждый день неудобно. Вечером третьего дня
// муж спрашивает, что её останавливает; они вместе ищут вариант, дочка
// приносит рисунок «мама руководит командой». На следующий день родители
// находят BalaGo и оставляют ПРЕДВАРИТЕЛЬНУЮ заявку на свой маршрут
// «Мектеп → Үй», мама отправляет ответ с предложением ОБСУДИТЬ роль и
// условия перехода и ставит рисунок у ноутбука. Затем рекламное
// объяснение: BalaGo в Бишкеке, оба направления «Үй → Мектеп → Үй», и
// контакты (ссылка в профиле, WhatsApp) с озвученным призывом.
//
// BalaGo — только предварительная заявка: без цен, дат запуска, гарантий,
// водителей, оплаты и подтверждённого маршрута. Номер WhatsApp — только на
// контактной карточке (108,8–120 с) и не озвучивается.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const UL2_VIDEO = {
  id: "BalaGoUnansweredLetter2D",
  output: "balago-unanswered-letter-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 120,
  voiceDir: "audio/unanswered-letter-2d",
} as const;

export const UL2_FRAMES = UL2_VIDEO.durationSec * UL2_VIDEO.fps;
// Контактная карточка с WhatsApp — последние 11,2 с (номер виден ≥ 10 с).
export const UL2_CONTACT_FROM = 108.8;

// ---------- Сцены (фиксированная шкала, секунды) ----------
export type Ul2SceneId =
  | "intro"
  | "offer"
  | "draft"
  | "car"
  | "days"
  | "husband"
  | "calendar"
  | "options"
  | "drawing"
  | "request"
  | "reply"
  | "service"
  | "contact";

export const UL2_SCENES: readonly { readonly id: Ul2SceneId; readonly title: string; readonly from: number; readonly to: number }[] = [
  { id: "intro", title: "1. Эки жыл жана үч күн", from: 0, to: 7 },
  { id: "offer", title: "2. Күтүлгөн сунуш", from: 7, to: 18 },
  { id: "draft", title: "3. Бүтө элек жооп", from: 18, to: 24.3 },
  { id: "car", title: "4. Кызы айтып берет", from: 24.3, to: 34.2 },
  { id: "days", title: "5. Күн кайталанат", from: 34.2, to: 40.8 },
  { id: "husband", title: "6. Жолдошунун суроосу", from: 40.8, to: 48.8 },
  { id: "calendar", title: "7. Себеби көрүнөт", from: 48.8, to: 59.3 },
  { id: "options", title: "8. Вариант издешет", from: 59.3, to: 65.8 },
  { id: "drawing", title: "9. Сүрөт", from: 65.8, to: 80.3 },
  { id: "request", title: "10. Эртеси жана арыз", from: 80.3, to: 90.4 },
  { id: "reply", title: "11. Жооп жана сүрөт", from: 90.4, to: 101.6 },
  { id: "service", title: "12. BalaGo", from: 101.6, to: 108.8 },
  { id: "contact", title: "13. Байланыш", from: 108.8, to: 120 },
];

// ---------- Темы (вкладки) ----------
// Цвет каждой темы постоянен во всём ролике.
export type Ul2Topic = "letter" | "school" | "calendar" | "drawing" | "reply";
export const UL2_TOPICS: readonly { readonly id: Ul2Topic; readonly label: string; readonly color: string }[] = [
  { id: "letter", label: "Кат", color: "#7FB8F0" }, // голубой
  { id: "school", label: "Мектеп", color: "#8FD3A6" }, // мягкий зелёный
  { id: "calendar", label: "Календарь", color: "#B79CF2" }, // фиолетовый
  { id: "drawing", label: "Сүрөт", color: "#FFB45C" }, // тёплый оранжево-жёлтый
  { id: "reply", label: "Жооп", color: "#FFD33D" }, // фирменный жёлтый
];

// ---------- Голоса ----------
export type Ul2Role = "narrator" | "mother" | "father" | "daughter" | "colleague";

export const UL2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 211,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Сохранённые кыргызские голоса проекта (те же, что в №12 TS2_VOICES,
// «Он бир мүнөт» и «Беш жөнөтүлбөгөн үн билдирүү»). Новые голоса и пробы
// не создаются.
//   narrator  — тёплая уверенная рассказчица (Voice Design, см. voiceDesign.ts);
//   mother    — тёплый естественный голос мамы (KG-mother);
//   father    — спокойный низкий мужской голос мужа (KG-husband);
//   daughter  — мягкий высокий голос девочки (KG-daughter);
//   colleague — дружелюбный уверенный мужской голос коллеги (Eric, голос
//               ролика «Мектепке жол: үч суроо», eleven_v3 по-кыргызски).
export const UL2_VOICES: Record<Ul2Role, { readonly name: string; readonly voiceId: string }> = {
  // рассказчик — голос Voice Design (voiceDesign.ts, voice id — в
  // voice-samples/unanswered-letter-2d/design/voices.json)
  narrator: { name: "KG-narrator", voiceId: "design:narrator" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  daughter: { name: "KG-daughter", voiceId: "AeboPz5CtE7qRUVvW93b" },
  colleague: { name: "Eric", voiceId: "cjVigY5qzO86Huf0OWal" },
};

// ---------- Письмо (одни и те же строки во всех кадрах) ----------
export const UL2_LETTER = {
  heroine: "Айжан",
  subject: "Жаңы багытты жетектөө",
  greeting: "Айжан,",
  offer: "Компаниянын жаңы багытын жетектөөнү сунуштайбыз.",
  draft: "Сунушуңуздарга рахмат…",
  // окончательный ответ — смысловыми порциями (появляются по очереди)
  replyParts: ["Сунушуңуздарга рахмат.", "Жаңы кызматты жана ага өтүүнүн", "шарттарын талкуулагым келет."],
  reply: "Сунушуңуздарга рахмат. Жаңы кызматты жана ага өтүүнүн шарттарын талкуулагым келет.",
  send: "Жөнөтүү",
  sent: "Жөнөтүлдү",
  draftLabel: "Кара нуска",
  draftSaved: "Кара нуска сакталды",
  from: "Жетекчилик",
  reSubject: "Жооп: Жаңы багытты жетектөө",
} as const;

// ---------- Календарь предлагаемой роли (постановочный пример) ----------
// Это график будущей рабочей недели на новой должности (не «сегодня»):
// подзаголовок «Келерки аптанын графиги», выбран понедельник (Дш) — тот же
// порядок каждый будний день. Школьная отметка — время окончания уроков.
export const UL2_CAL = {
  title: "Жаңы команда",
  subtitle: "Келерки аптанын графиги",
  school: "14:30 · Сабак бүтөт",
  schoolTime: "14:30",
  schoolAt: 14.5, // часы
  mom: { who: "Айжан", label: "Жолугушуу", from: 14, to: 15, time: "14:00–15:00" },
  dad: { who: "Жолдошу", label: "Жолугушуу", from: 14, to: 15.5, time: "14:00–15:30" },
  hours: [13, 14, 15, 16] as const,
  week: ["Дш", "Шш", "Шр", "Бш", "Жм"] as const,
} as const;

// ---------- Речевые файлы (каждый синтезируется один раз) ----------
export type Ul2Line = {
  readonly id: string;
  readonly role: Ul2Role;
  readonly text: string; // субтитры (как звучит)
  readonly spoken?: string; // что уходит в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (не звучит)
  readonly seed?: number;
};

// Рассказчик: каждое предложение — отдельный файл. Одной генерацией два
// предложения звучали слитно (пауза между ними ≈ 0,1 с, темп ≈ 16 букв/с);
// отдельные файлы заканчиваются настоящей конечной интонацией, а паузы
// между ними ставит монтаж (UL2_SEGMENTS).
export const UL2_LINES: readonly Ul2Line[] = [
  { id: "n01", role: "narrator", text: "Айжан бул сунушту эки жыл күткөн." },
  { id: "n01b", role: "narrator", text: "Бирок үч күндөн бери жооп бере элек." },
  { id: "c01", role: "colleague", text: "Куттуктайм! Сен ушуну каалап жүргөн эмес белең?", tag: "[cheerfully]" },
  { id: "m01", role: "mother", text: "Ооба. Бир нерсени ойлонуп алышым керек.", tag: "[warmly]" },
  { id: "d01", role: "daughter", text: "Апа, бизде сүрөт сынагы болот! Мен да катышам.", tag: "[excited]" },
  { id: "m02", role: "mother", text: "Абдан жакшы!", tag: "[warmly]" },
  { id: "n02", role: "narrator", text: "Кызын чоң апасына калтырып, кеңсеге кайтчу." },
  { id: "n02b", role: "narrator", text: "Каттын жообу үч күн бүтпөй турду." },
  { id: "h01", role: "father", text: "Сен дагы эле жооп бере элексиңби? Сени эмне токтотуп жатат?", tag: "[gently]" },
  {
    id: "m03",
    role: "mother",
    text: "Бул кызматты каалайм. Бирок кызды мектептен алып келүүнү кантип уюштурарыбызды азырынча билбейм. Сенин да ошол убакта жолугушууларың бар.",
  },
  { id: "n03", role: "narrator", text: "Баарын жылдыруу мүмкүн эмес." },
  { id: "n03b", role: "narrator", text: "Чоң апасына күн сайын шаар аралоо да оңой эмес." },
  { id: "m04", role: "mother", text: "Муну кайда коёбуз?", tag: "[gently]" },
  { id: "d02", role: "daughter", text: "Сенин жаңы жумушуңа. Сен жетекчи болосуң да?" },
  { id: "m05", role: "mother", text: "Абдан каалайм.", tag: "[warmly]" },
  {
    id: "n04",
    role: "narrator",
    text: "Эртеси алар кызды мектептен алып келүүнүн жолун издеп, BalaGo’ну табышты.",
    spoken: "Эртеси алар кызды мектептен алып келүүнүн жолун издеп, БалаГону табышты.",
  },
  { id: "n04b", role: "narrator", text: "Мектептен үйгө каттамга алдын ала арыз калтырышты." },
  { id: "m06", role: "mother", text: UL2_LETTER.reply },
  // рекламный финал: что за услуга (город, оба направления) и как обратиться
  {
    id: "n05",
    role: "narrator",
    text: "BalaGo — Бишкекте балдарды үйдөн мектепке жана мектептен үйгө жеткирүү кызматы.",
    spoken: "БалаГо — Бишкекте балдарды үйдөн мектепке жана мектептен үйгө жеткирүү кызматы.",
  },
  {
    id: "n06",
    role: "narrator",
    text: "Профилдеги шилтемеге өтүңүз же WhatsApp’ка жазыңыз.",
    spoken: "Профилдеги шилтемеге өтүңүз же Ватсапка жазыңыз.",
  },
];

// ---------- Речевые сегменты на шкале ролика ----------
// mode: narrator — закадровый текст рассказчика BalaGo (рты персонажей закрыты,
// в полосе субтитров — логотип);
// live — живая речь в кадре (говорит только этот персонаж);
// inner — внутреннее чтение мамой написанного ответа (все рты закрыты).
export type Ul2Mode = "narrator" | "live" | "inner";
export type Ul2Segment = {
  readonly id: string; // ID сегмента на шкале
  readonly line: string; // речевой файл (UL2_LINES)
  readonly scene: Ul2SceneId;
  readonly at: number; // начало речи, с
  readonly mode: Ul2Mode;
};

export const UL2_SEGMENTS: readonly Ul2Segment[] = [
  { id: "n01", line: "n01", scene: "intro", at: 0.6, mode: "narrator" },
  { id: "n01b", line: "n01b", scene: "intro", at: 3.4, mode: "narrator" },
  { id: "c01", line: "c01", scene: "offer", at: 9.8, mode: "live" },
  { id: "m01", line: "m01", scene: "offer", at: 13.8, mode: "live" },
  { id: "d01", line: "d01", scene: "car", at: 29.4, mode: "live" },
  { id: "m02", line: "m02", scene: "car", at: 32.2, mode: "live" },
  { id: "n02", line: "n02", scene: "days", at: 34.5, mode: "narrator" },
  { id: "n02b", line: "n02b", scene: "days", at: 38.2, mode: "narrator" },
  { id: "h01", line: "h01", scene: "husband", at: 41.8, mode: "live" },
  { id: "m03", line: "m03", scene: "calendar", at: 49.2, mode: "live" },
  { id: "n03", line: "n03", scene: "options", at: 59.6, mode: "narrator" },
  { id: "n03b", line: "n03b", scene: "options", at: 62.1, mode: "narrator" },
  { id: "m04", line: "m04", scene: "drawing", at: 68.6, mode: "live" },
  { id: "d02", line: "d02", scene: "drawing", at: 70.4, mode: "live" },
  { id: "m05", line: "m05", scene: "drawing", at: 74.2, mode: "live" },
  { id: "n04", line: "n04", scene: "request", at: 80.6, mode: "narrator" },
  { id: "n04b", line: "n04b", scene: "request", at: 86.4, mode: "narrator" },
  { id: "m06", line: "m06", scene: "reply", at: 91.5, mode: "inner" },
  { id: "n05", line: "n05", scene: "service", at: 102.0, mode: "narrator" },
  { id: "n06", line: "n06", scene: "contact", at: 109.4, mode: "narrator" },
];

// Последняя реплика (призыв на контактной карточке) заканчивается не позже.
export const UL2_DIALOG_END = 116;
// Выразительные паузы перед сегментом (с).
export const UL2_MIN_GAP: Readonly<Record<string, number>> = { n01b: 0.5, m01: 0.6, m02: 0.5, n02b: 0.4, n03b: 0.4, d02: 0.5, m05: 1.0, n04b: 0.4 };

export const lineById = (id: string) => {
  const l = UL2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};
export const segmentById = (id: string) => {
  const s = UL2_SEGMENTS.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сегмента ${id}`);
  return s;
};

// Подпись говорящего в субтитрах.
export const UL2_SPEAKER: Record<Ul2Role, string> = {
  narrator: "BalaGo",
  mother: "Айжан",
  father: "Жолдошу",
  daughter: "Кызы",
  colleague: "Кесиптеши",
};

// ---------- Экранные надписи (кыргызча) ----------
export const UL2_TEXT = {
  brand: "BalaGo",
  tagline: "Балдар үчүн такси",
  day1: "1-күн",
  day2: "2-күн",
  day3: "3-күн",
  nextDay: "Эртеси",
  evening: "кечинде",
  waited: ["2 жыл", "күттү"],
  noReply: ["3 күн", "жооп бере албай жүрөт"],
  why: "Эмне үчүн?",
  reminder: "Мектепке баруу",
  school: "Мектеп",
  home: "Үй",
  docs: "Бүтпөгөн документтер",
  postponed: "Кийинкиге калды",
  again2: "2-жолу",
  again3: "3-жолу",
  everyDay: "Күн сайын?",
  optionA: "Баарын жылдыруу",
  optionB: "Чоң апасы күн сайын",
  resultA: "Мүмкүн эмес",
  resultB: "Оңой эмес",
  cityLong: "Шаар аркылуу",
  // Поиск решения перед страницей BalaGo (иллюстрация поисковой строки).
  search: {
    query: "Балдарды мектептен алып келүү, Бишкек",
    result: "BalaGo · Бишкек · Балдар үчүн такси",
  },
  // Предварительная заявка (иллюстрация, без реальных данных: адрес и
  // номер школы скрыты точками). Услуга — оба направления; семья выбирает
  // только обратный маршрут «Мектеп → Үй».
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек · Балдар үчүн такси",
    status: "Алдын ала каттоо жүрүп жатат",
    title: "Алдын ала арыз",
    fields: [
      ["Үй дареги", "•••••• көчөсү, ••"],
      ["Мектеп", "№ •• мектеп"],
      ["Сабактын убактысы", "14:30 — сабак бүтөт"],
    ],
    routeLabel: "Каттам",
    routes: ["Үй → Мектеп", "Мектеп → Үй", "Экөө тең"],
    chosen: 1, // семья выбирает обратный маршрут
    chosenNote: "Биздин тандоо",
    send: "Арызды жөнөтүү",
    sent: "Алдын ала арыз кабыл алынды",
    sentNote: "Маршрут жана убакыт кийин такталат",
  },
  // Рекламное объяснение: город, назначение, оба направления.
  service: {
    city: "Бишкек · Балдар үчүн такси",
    route: "Үй → Мектеп → Үй",
    morning: "Эртең менен",
    morningRoute: "Үй → Мектеп",
    after: "Сабактан кийин",
    afterRoute: "Мектеп → Үй",
  },
  cta: {
    brand: "BalaGo",
    tagline: "Бишкек · Балдар үчүн такси",
    route: "Үй → Мектеп → Үй",
    call: "Алдын ала арыз калтырыңыз",
    link: "Профилдеги шилтеме аркылуу",
    whatsapp: "WhatsApp: 0998 08 38 28",
  },
} as const;
