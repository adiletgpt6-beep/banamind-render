// Ролик BalaGoFiveUnsentMessages2D — «Беш жөнөтүлбөгөн үн билдирүү»
// («Пять сообщений, которые сын не отправил»), ровно 120 с.
//
// Сын записал папе пять голосовых заметок (по одной в будний день) и ни
// одной не отправил: хотел рассказать сам, а записывал, чтобы не забыть.
// Отец — руководитель отдела продаж — каждый день забирает сына из школы
// и пытается совмещать это с работой. В субботу он случайно слышит запись,
// они вместе слушают все пять; вечером родители обсуждают школьный маршрут
// и оставляют ПРЕДВАРИТЕЛЬНУЮ заявку BalaGo. В следующий понедельник за
// ужином отец сам спрашивает о дне сына, убирает телефон и слушает.
//
// BalaGo — только предварительная заявка: без цен, дат запуска, гарантий,
// проверок водителей, функций приложения и выполненных поездок. WhatsApp
// основателя — только в последние пять секунд (115–120 с).
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const FU2_VIDEO = {
  id: "BalaGoFiveUnsentMessages2D",
  output: "balago-five-unsent-messages-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 120,
  voiceDir: "audio/five-unsent-messages-2d",
} as const;

export const FU2_FRAMES = FU2_VIDEO.durationSec * FU2_VIDEO.fps;
// Контактная карточка с WhatsApp — ровно последние 150 кадров.
export const FU2_CONTACT_FROM = 115;

// ---------- Сцены (фиксированная шкала, секунды) ----------
export type Fu2SceneId =
  | "intro"
  | "before"
  | "gate"
  | "car"
  | "week"
  | "saturday"
  | "why"
  | "listen"
  | "route"
  | "request"
  | "dinner"
  | "contact";

export const FU2_SCENES: readonly { readonly id: Fu2SceneId; readonly title: string; readonly from: number; readonly to: number }[] = [
  { id: "intro", title: "1. Беш жазуу, нөл жөнөтүлгөн", from: 0, to: 8 },
  { id: "before", title: "2. Атасы үлгүрүүгө аракет кылат", from: 8, to: 14 },
  { id: "gate", title: "3. Бир мүнөт күтө тур", from: 14, to: 27 },
  { id: "car", title: "4. Экинчи аракет", from: 27, to: 34 },
  { id: "week", title: "5. Беш күн", from: 34, to: 42 },
  { id: "saturday", title: "6. Ишемби", from: 42, to: 51 },
  { id: "why", title: "7. Эмне үчүн жөнөтпөдү", from: 51, to: 66 },
  { id: "listen", title: "8. Бешөөнү тең угушат", from: 66, to: 94 },
  { id: "route", title: "9. Маршрут жөнүндө", from: 94, to: 101 },
  { id: "request", title: "10. Алдын ала өтүнмө", from: 101, to: 107 },
  { id: "dinner", title: "11. Кийинки дүйшөмбү", from: 107, to: 115 },
  { id: "contact", title: "12. Байланыш", from: 115, to: 120 },
];

// ---------- Голоса ----------
export type Fu2Role = "narrator" | "father" | "son";

export const FU2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 201,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Сохранённые кыргызские голоса проекта (ElevenLabs Voice Design) — те же,
// что звучат в №12 (src/two-schedules-2d/script.ts, TS2_VOICES) и в
// «Он бир мүнөт». Новые голоса и пробы не создаются.
//   narrator — спокойный доброжелательный голос рассказчика (KG-teacher);
//   father   — спокойный низкий мужской голос (KG-husband, ≈110 Гц);
//   son      — светлый звонкий голос мальчика (KG-son, ≈280 Гц).
// Один и тот же голос сына — в машине, в субботу, во всех пяти записях и
// за ужином. Мама в этой версии сценария не говорит.
export const FU2_VOICES: Record<Fu2Role, { readonly name: string; readonly voiceId: string }> = {
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
};

// ---------- Пять записей ----------
export type Fu2RecordId = "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
export const FU2_RECORDS: readonly { readonly id: Fu2RecordId; readonly day: string; readonly line: string }[] = [
  { id: "monday", day: "Дүйшөмбү", line: "rec1" },
  { id: "tuesday", day: "Шейшемби", line: "rec2" },
  { id: "wednesday", day: "Шаршемби", line: "rec3" },
  { id: "thursday", day: "Бейшемби", line: "rec4" },
  { id: "friday", day: "Жума", line: "rec5" },
];

// ---------- Речевые файлы (каждый синтезируется один раз) ----------
export type Fu2Line = {
  readonly id: string;
  readonly role: Fu2Role;
  readonly text: string; // субтитры (как звучит)
  readonly spoken?: string; // что уходит в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (не звучит)
  readonly seed?: number;
  // Сохранённая запись на телефоне сына: мягкий полосовой фильтр
  // (тембр тот же, речь разборчива).
  readonly record?: boolean;
};

export const FU2_LINES: readonly Fu2Line[] = [
  { id: "n01", role: "narrator", text: "Уулу атасына беш үн билдирүү жазган. Бирин да жөнөткөн эмес. Атасы муну кокусунан билди." },
  { id: "n02", role: "narrator", text: "Атасы сатуу бөлүмүн жетектечү. Күн сайын уулун мектептен өзү алып кетчү." },
  { id: "f01", role: "father", text: "Салам, уулум! Бүгүн кандай өттү?", tag: "[cheerfully]" },
  // Сын сам замолкает на «биз…», заметив, что папа отвлёкся.
  { id: "s01", role: "son", text: "Ата, билесиңби, бүгүн биз…", tag: "[excited]" },
  { id: "f02", role: "father", text: "Азыр, уулум. Бир мүнөт күтө турчу.", tag: "[gently]" },
  { id: "f03", role: "father", text: "Анан, бүгүн эмне болду?" },
  { id: "s02", role: "son", text: "Өзгөчө деле эч нерсе.", tag: "[quietly]" },
  {
    id: "n03",
    role: "narrator",
    text: "Күндөр өттү. Уулу аз сүйлөй баштады. Атасы: «Чоңоюп жаткандыр», — деп ойлоду.",
    spoken: "Күндөр өттү. Уулу аз сүйлөй баштады. Атасы: чоңоюп жаткандыр, деп ойлоду.",
  },
  { id: "rec1", role: "son", record: true, text: "Ата, бүгүн биринчи жолу класстын алдында өзүм сүйлөдүм.", tag: "[excited]" },
  { id: "f04", role: "father", text: "Буларды кимге жаздың?", tag: "[gently]" },
  { id: "s03", role: "son", text: "Сага." },
  { id: "f05", role: "father", text: "Анда эмнеге жөнөткөн жоксуң?", tag: "[gently]" },
  { id: "s04", role: "son", text: "Өзүм айтып бергим келген. Унутуп калбайын деп жазып койгом." },
  { id: "rec2", role: "son", record: true, text: "Ата, бүгүн досума бир маселени чыгарууга жардам бердим." },
  { id: "rec3", role: "son", record: true, text: "Ата, бүгүн биздин командага ат ойлоп таптым.", tag: "[excited]" },
  { id: "rec4", role: "son", record: true, text: "Ата, бүгүн китепти окуп бүттүм." },
  { id: "rec5", role: "son", record: true, text: "Ата, бүгүн сага күнүмдү айтып бергим келди.", tag: "[warmly]" },
  { id: "n04", role: "narrator", text: "Мектепке барып келүү жумуш күнүн бөлчү. Бүтпөгөн иштер кечинде да убакыт алчу." },
  {
    id: "n05",
    role: "narrator",
    text: "Алар BalaGo’го алдын ала өтүнмө калтырышты.",
    spoken: "Алар БалаГого алдын ала өтүнмө калтырышты.",
  },
  { id: "f06", role: "father", text: "Бүгүн жаңы жазуу болобу?", tag: "[warmly]" },
  { id: "s05", role: "son", text: "Бүгүн дароо эле айтып бере алам.", tag: "[warmly]" },
];

// ---------- Речевые сегменты на шкале ролика ----------
// mode: narrator — закадровый текст; live — живая речь в кадре (говорит
// только этот персонаж); record — воспроизведение сохранённой записи
// с телефона (рот сидящего мальчика закрыт).
export type Fu2Mode = "narrator" | "live" | "record";
export type Fu2Segment = {
  readonly id: string; // ID сегмента на шкале
  readonly line: string; // речевой файл (FU2_LINES)
  readonly scene: Fu2SceneId;
  readonly at: number; // начало речи, с
  readonly mode: Fu2Mode;
  readonly record?: Fu2RecordId;
};

export const FU2_SEGMENTS: readonly Fu2Segment[] = [
  { id: "n01", line: "n01", scene: "intro", at: 0.6, mode: "narrator" },
  { id: "n02", line: "n02", scene: "before", at: 8.5, mode: "narrator" },
  { id: "f01", line: "f01", scene: "gate", at: 16.5, mode: "live" },
  { id: "s01", line: "s01", scene: "gate", at: 19.0, mode: "live" },
  { id: "f02", line: "f02", scene: "gate", at: 21.9, mode: "live" },
  { id: "f03", line: "f03", scene: "car", at: 28.2, mode: "live" },
  { id: "s02", line: "s02", scene: "car", at: 30.9, mode: "live" },
  { id: "n03", line: "n03", scene: "week", at: 34.6, mode: "narrator" },
  // Суббота: телефон воспроизводит уже сохранённую запись понедельника.
  { id: "sat-monday", line: "rec1", scene: "saturday", at: 44.3, mode: "record", record: "monday" },
  { id: "f04", line: "f04", scene: "why", at: 52.9, mode: "live" },
  { id: "s03", line: "s03", scene: "why", at: 55.0, mode: "live" },
  { id: "f05", line: "f05", scene: "why", at: 57.5, mode: "live" },
  { id: "s04", line: "s04", scene: "why", at: 59.6, mode: "live" },
  // Совместное прослушивание: тот же список, тот же файл понедельника.
  { id: "monday", line: "rec1", scene: "listen", at: 67.2, mode: "record", record: "monday" },
  { id: "tuesday", line: "rec2", scene: "listen", at: 72.6, mode: "record", record: "tuesday" },
  { id: "wednesday", line: "rec3", scene: "listen", at: 78.0, mode: "record", record: "wednesday" },
  { id: "thursday", line: "rec4", scene: "listen", at: 83.0, mode: "record", record: "thursday" },
  { id: "friday", line: "rec5", scene: "listen", at: 87.6, mode: "record", record: "friday" },
  { id: "n04", line: "n04", scene: "route", at: 94.6, mode: "narrator" },
  { id: "n05", line: "n05", scene: "request", at: 101.6, mode: "narrator" },
  { id: "f06", line: "f06", scene: "dinner", at: 109.3, mode: "live" },
  { id: "s05", line: "s05", scene: "dinner", at: 111.2, mode: "live" },
];

// Речь заканчивается не позже: после фразы сына — улыбка и жест отца,
// затем контактная карточка (только музыка).
export const FU2_DIALOG_END = 113.6;
// Выразительные паузы перед сегментом (с).
export const FU2_MIN_GAP: Readonly<Record<string, number>> = { f02: 0.7, s02: 0.8, f05: 1.8, s04: 0.6 };

export const lineById = (id: string) => {
  const l = FU2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};
export const segmentById = (id: string) => {
  const s = FU2_SEGMENTS.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сегмента ${id}`);
  return s;
};

// ---------- Экранные надписи (кыргызча) ----------
export const FU2_TEXT = {
  brand: "BalaGo",
  tagline: "Балдар үчүн такси",
  voiceMemos: "Үн жазуулары",
  folder: "Атама",
  notSent: "Жөнөтүлгөн эмес",
  heard: "Угулду",
  before: "Буга чейин",
  saturday: "Ишемби",
  nextMonday: "Кийинки дүйшөмбү",
  office: "Кеңсе",
  school: "Мектеп",
  home: "Үй",
  why: "Эмне үчүн?",
  sales: "Сатуу бөлүмү",
  unfinished: "Иш бүтө элек",
  work: "Жумуш",
  workMsg: "Санды тактап коюңуз.",
  recording: "Үн жазуу",
  dayRecord: "күнкү жазуу", // «Дүйшөмбү күнкү жазуу» — день записи
  saved: "Сакталды",
  team: "Биримдик",
  // Заголовки сцен: белая первая строка, светло-голубая вторая.
  titles: {
    intro: ["5 үн билдирүү", "Бирөө да жөнөтүлгөн эмес"],
    before: ["Буга чейин", "Атасы үлгүрүүгө аракет кылчу"],
    gate: ["Мектептин алдында", "Бир мүнөт күтө тур"],
    car: ["Суроо кайталанат", "Жооп кыскарат"],
    week: ["Беш күн", "Бешөө тең сакталды"],
    saturday: ["Ишемби", "Тааныш үн"],
    why: ["Эмне үчүн", "жөнөтпөдү?"],
    listen: ["Беш күндүн жаңылыгы", "Бул жолу атасы угуп жатат"],
    route: ["Ишемби кечинде", "Мектеп жолу жөнүндө"],
    request: ["Алдын ала өтүнмө", "Мектеп → Үй"],
    dinner: ["Кийинки дүйшөмбү", "Телефон четте"],
  } satisfies Partial<Record<Fu2SceneId, readonly [string, string]>>,
  calendar: {
    meetingA: "Кардар менен сүйлөшүү",
    meetingB: "Сатуу пландоосу",
    school: "Мектеп",
    times: ["14:00", "15:00", "16:00", "17:00"],
  },
  chain: ["Мектеп сапары иш күнүн бөлөт", "Иштер кечке калат", "Сапарларды алдын ала пландайлы"],
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    title: "Алдын ала катталуу",
    fields: [
      ["Маршрут", "Мектеп → Үй"],
      ["Качан", "Иш күндөрү"],
      ["Эскертүү", "Убакытты сүйлөшөлү"],
    ],
    send: "Өтүнмө жөнөтүү",
    sent: "Өтүнмө жөнөтүлдү",
  },
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    call: "Балаңызды алдын ала каттаңыз",
    link: "Профилдеги шилтеме аркылуу",
    whatsapp: "WhatsApp: 0998 08 38 28",
  },
} as const;
