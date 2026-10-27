// Ролик BalaGoUnansweredLetter2D — «Жооп берилбеген кат»
// («Письмо, на которое мама не отвечала»), сценарий №21, ровно 120 с.
//
// Айжан два года ждала возможности возглавить новое направление. Когда
// предложение пришло, три дня не могла дописать ответ: школьные поездки
// дочки совпадают с будущими встречами, у мужа в эти часы тоже встречи,
// бабушке ездить через город каждый день неудобно. Вечером третьего дня
// муж спрашивает, что её останавливает; они вместе ищут вариант, дочка
// приносит рисунок «мама руководит командой». На следующий день родители
// оставляют ПРЕДВАРИТЕЛЬНУЮ заявку BalaGo на маршрут «Мектеп → Үй», мама
// отправляет ответ с предложением ОБСУДИТЬ роль и условия перехода и
// ставит рисунок у монитора.
//
// BalaGo — только предварительная заявка: без цен, дат запуска, гарантий,
// водителей, оплаты и подтверждённого маршрута. WhatsApp — только в
// последние пять секунд (115–120 с, кадры 3450–3599).
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
// Контактная карточка с WhatsApp — ровно последние 150 кадров.
export const UL2_CONTACT_FROM = 115;

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
  | "contact";

export const UL2_SCENES: readonly { readonly id: Ul2SceneId; readonly title: string; readonly from: number; readonly to: number }[] = [
  { id: "intro", title: "1. Эки жыл жана үч күн", from: 0, to: 8 },
  { id: "offer", title: "2. Күтүлгөн сунуш", from: 8, to: 20 },
  { id: "draft", title: "3. Бош жооп", from: 20, to: 27 },
  { id: "car", title: "4. Кызы айтып берет", from: 27, to: 36 },
  { id: "days", title: "5. Күн кайталанат", from: 36, to: 45 },
  { id: "husband", title: "6. Жолдошунун суроосу", from: 45, to: 54 },
  { id: "calendar", title: "7. Себеби көрүнөт", from: 54, to: 68 },
  { id: "options", title: "8. Вариант издешет", from: 68, to: 77 },
  { id: "drawing", title: "9. Сүрөт", from: 77, to: 93.5 },
  { id: "request", title: "10. Эртеси жана арыз", from: 93.5, to: 102 },
  { id: "reply", title: "11. Жооп жана сүрөт", from: 102, to: 115 },
  { id: "contact", title: "12. Байланыш", from: 115, to: 120 },
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
//   narrator  — спокойный доброжелательный женский голос ведущей (KG-teacher);
//   mother    — тёплый естественный голос мамы (KG-mother);
//   father    — спокойный низкий мужской голос мужа (KG-husband);
//   daughter  — мягкий высокий голос девочки (KG-daughter);
//   colleague — дружелюбный уверенный мужской голос коллеги (Eric, голос
//               ролика «Мектепке жол: үч суроо», eleven_v3 по-кыргызски).
export const UL2_VOICES: Record<Ul2Role, { readonly name: string; readonly voiceId: string }> = {
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
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
  from: "Жетекчилик",
  reSubject: "Жооп: Жаңы багытты жетектөө",
} as const;

// ---------- Календарь предлагаемой роли (постановочный пример) ----------
export const UL2_CAL = {
  title: "Жаңы команда",
  school: "Мектеп — 14:30",
  schoolTime: "14:30",
  schoolAt: 14.5, // часы
  mom: { who: "Айжан", label: "Жолугушуу", from: 14, to: 15, time: "14:00–15:00" },
  dad: { who: "Жолдошу", label: "Жолугушуу", from: 14, to: 15.5, time: "14:00–15:30" },
  partners: "Өнөктөштөр менен жолугушуу",
  otherOffice: "Башка кеңсеге баруу",
  hours: [13, 14, 15] as const,
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

export const UL2_LINES: readonly Ul2Line[] = [
  { id: "n01", role: "narrator", text: "Бул катты ал эки жыл күткөн. Кат келгенде болсо, үч күн жооп жаза алган эмес." },
  { id: "c01", role: "colleague", text: "Куттуктайм! Сен ушуну каалап жүргөн эмес белең?", tag: "[cheerfully]" },
  { id: "m01", role: "mother", text: "Ооба. Бир нерсени ойлонуп алышым керек.", tag: "[warmly]" },
  { id: "d01", role: "daughter", text: "Апа, бизде сүрөт сынагы болот! Мен да катышам.", tag: "[excited]" },
  { id: "m02", role: "mother", text: "Абдан жакшы!", tag: "[warmly]" },
  { id: "n02", role: "narrator", text: "Кызын чоң апасына калтырып, кеңсеге кайтчу. Каттын жообу үч күн бүтпөй турду." },
  { id: "h01", role: "father", text: "Сен дагы эле жооп бере элексиңби? Сени эмне токтотуп жатат?", tag: "[gently]" },
  {
    id: "m03",
    role: "mother",
    text: "Бул кызматты каалайм. Бирок кызды мектептен алып келүүнү кантип уюштурарыбызды азырынча билбейм. Сенин да ошол убакта жолугушууларың бар.",
  },
  { id: "n03", role: "narrator", text: "Баарын жылдыруу мүмкүн эмес. Чоң апасына күн сайын шаар аралоо да оңой эмес." },
  { id: "m04", role: "mother", text: "Муну кайда коёбуз?", tag: "[gently]" },
  { id: "d02", role: "daughter", text: "Сенин жаңы жумушуңа. Сен жетекчи болосуң да?" },
  { id: "m05", role: "mother", text: "Абдан каалайм.", tag: "[warmly]" },
  {
    id: "n04",
    role: "narrator",
    text: "Эртеси алар мектептен үйгө каттам боюнча BalaGo’го алдын ала арыз калтырышты.",
    spoken: "Эртеси алар мектептен үйгө каттам боюнча БалаГого алдын ала арыз калтырышты.",
  },
  { id: "m06", role: "mother", text: UL2_LETTER.reply },
];

// ---------- Речевые сегменты на шкале ролика ----------
// mode: narrator — закадровый текст ведущей (рот ведущей двигается);
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
  { id: "n01", line: "n01", scene: "intro", at: 0.7, mode: "narrator" },
  { id: "c01", line: "c01", scene: "offer", at: 10.3, mode: "live" },
  { id: "m01", line: "m01", scene: "offer", at: 14.4, mode: "live" },
  { id: "d01", line: "d01", scene: "car", at: 29.4, mode: "live" },
  { id: "m02", line: "m02", scene: "car", at: 32.2, mode: "live" },
  { id: "n02", line: "n02", scene: "days", at: 36.6, mode: "narrator" },
  { id: "h01", line: "h01", scene: "husband", at: 46.6, mode: "live" },
  { id: "m03", line: "m03", scene: "calendar", at: 54.8, mode: "live" },
  { id: "n03", line: "n03", scene: "options", at: 68.7, mode: "narrator" },
  { id: "m04", line: "m04", scene: "drawing", at: 80.3, mode: "live" },
  { id: "d02", line: "d02", scene: "drawing", at: 82.2, mode: "live" },
  { id: "m05", line: "m05", scene: "drawing", at: 86.2, mode: "live" },
  { id: "n04", line: "n04", scene: "request", at: 94.0, mode: "narrator" },
  { id: "m06", line: "m06", scene: "reply", at: 103.4, mode: "inner" },
];

// Речь заканчивается не позже: после чтения ответа — нажатие «Жөнөтүү»,
// рисунок у монитора (≥ 2 с), затем контактная карточка (только музыка).
export const UL2_DIALOG_END = 109.6;
// Выразительные паузы перед сегментом (с).
export const UL2_MIN_GAP: Readonly<Record<string, number>> = { m01: 0.6, m02: 0.5, d02: 0.5, m05: 1.0 };

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
  noReply: ["3 күн", "жооп жазган жок"],
  why: "Эмне үчүн?",
  reminder: "Мектепке баруу",
  school: "Мектеп",
  home: "Үй",
  docs: "Бүтпөгөн документтер",
  everyDay: "Күн сайын?",
  optionA: "Баарын жылдыруу",
  optionB: "Чоң апасы күн сайын",
  cityLong: "Шаар аркылуу",
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    title: "Алдын ала арыз",
    fields: [
      ["Үй дареги", "Үй"],
      ["Мектеп", "Мектеп"],
      ["Сабактын убактысы", "14:30 — сабак бүтөт"],
    ],
    routeLabel: "Каттам",
    send: "Алдын ала арыз",
    sent: "Арыз жөнөтүлдү",
  },
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    call: "Алдын ала арыз калтырыңыз",
    link: "Профилдеги шилтеме аркылуу",
    whatsapp: "WhatsApp: 0998 08 38 28",
  },
} as const;
