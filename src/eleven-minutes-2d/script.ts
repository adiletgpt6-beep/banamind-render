// Ролик BalaGoElevenMinutes2D — «Он бир мүнөт» («Одиннадцать минут»),
// ровно 120 с. Графическая 2D-история в тёмной подаче: карта, журнал
// поездки, календарь и накопитель времени постепенно отвечают на вопрос
// «На карте до школы 11 минут — почему мама освобождала больше часа?».
// Короткие семейные сцены дают эмоцию.
//
// Время в истории ≠ длительность ролика: вся поездка — 61 мин (постановочные
// значения сюжета, не статистика BalaGo и не обещание экономии). 11 мин на
// карте — только участок «Кеңсе → Мектеп».
// BalaGo — только предварительная заявка: без цен, дат, гарантий,
// контактов, WhatsApp, адреса сайта и выполненных поездок.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const EM2_VIDEO = {
  id: "BalaGoElevenMinutes2D",
  output: "balago-eleven-minutes-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 120,
  voiceDir: "audio/eleven-minutes-2d",
} as const;

export const EM2_FRAMES = EM2_VIDEO.durationSec * EM2_VIDEO.fps;

// ---------- Сцены (фиксированная шкала, секунды) ----------
export type Em2SceneId =
  | "question"
  | "usual"
  | "plan"
  | "leave"
  | "parking"
  | "waiting"
  | "form"
  | "car"
  | "road"
  | "grandma"
  | "same11"
  | "confess"
  | "craft"
  | "final";

export const EM2_SCENES: readonly { readonly id: Em2SceneId; readonly title: string; readonly from: number; readonly to: number }[] = [
  { id: "question", title: "1. Суроо", from: 0, to: 8 },
  { id: "usual", title: "2. Адаттагыдай", from: 8, to: 14 },
  { id: "plan", title: "3. Ишенимдүү эсеп", from: 14, to: 26 },
  { id: "leave", title: "4. Кеңседен чыгуу", from: 26, to: 33 },
  { id: "parking", title: "5. Токтотуучу жай жана жөө жол", from: 33, to: 41 },
  { id: "waiting", title: "6. Күтүү", from: 41, to: 48 },
  { id: "form", title: "7. Спорттук кийим", from: 48, to: 56 },
  { id: "car", title: "8. Кызы айтып бергиси келет", from: 56, to: 67 },
  { id: "road", title: "9. Үйгө жол", from: 67, to: 75 },
  { id: "grandma", title: "10. Чоң апага", from: 75, to: 82 },
  { id: "same11", title: "11. Баягы эле он бир мүнөт", from: 82, to: 90 },
  { id: "confess", title: "12. Түшүнүү", from: 90, to: 100 },
  { id: "craft", title: "13. Колдон жасалган буюм", from: 100, to: 108 },
  { id: "final", title: "14. Арыз, календарь, финал", from: 108, to: 120 },
];

// ---------- Голоса ----------
export type Em2Role = "narrator" | "father" | "mother" | "daughter";

export const EM2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 131,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Сохранённые кыргызские голоса проекта (ElevenLabs Voice Design) — те же,
// что озвучили ролик №12 (src/two-schedules-2d/script.ts, TS2_VOICES).
// Новые голоса и пробы не создаются. Рассказчик — спокойный женский голос
// финала №12 (отличается и от мамы, и от папы).
export const EM2_VOICES: Record<Em2Role, { readonly name: string; readonly voiceId: string }> = {
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  daughter: { name: "KG-daughter", voiceId: "AeboPz5CtE7qRUVvW93b" },
};

// ---------- Реплики ----------
export type Em2Line = {
  readonly id: string;
  readonly role: Em2Role;
  readonly scene: Em2SceneId;
  readonly at: number; // начало речи, с
  readonly text: string; // субтитры (как звучит)
  readonly spoken?: string; // что уходит в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (не звучит)
  readonly seed?: number;
};

export const EM2_LINES: readonly Em2Line[] = [
  { id: "n01", role: "narrator", scene: "question", at: 0.7, text: "Мектепке чейин — он бир мүнөт. Анда апасы эмнеге бир сааттан ашык убакыт бөлчү?" },
  { id: "n02", role: "narrator", scene: "usual", at: 8.5, text: "Апасы кызын мектептен алып, чоң апасына калтырып, кайра кеңсеге кайтчу." },
  { id: "f01", role: "father", scene: "plan", at: 15.2, text: "Он бир эле мүнөт экен. Эртең мен алып келейин. Жолугушуулардын ортосунда убактым бар." },
  { id: "m01", role: "mother", scene: "plan", at: 21.0, text: "Макул. Бирок көбүрөөк убакыт бөл." },
  { id: "n03", role: "narrator", scene: "leave", at: 26.6, text: "Эртеси ал баарын эсептеп, кеңседен чыкты. Ноутбугу жанында." },
  { id: "n04", role: "narrator", scene: "parking", at: 33.6, text: "Мектептин жанында токтой турган жер жок. Унааны алысыраак токтотту." },
  { id: "n05", role: "narrator", scene: "waiting", at: 41.5, text: "Балдар бир аз кеч чыгышты. Убакыт өтүп жатты." },
  { id: "d01", role: "daughter", scene: "form", at: 48.6, text: "Ата, спорттук кийимим класста калыптыр." },
  { id: "n06", role: "narrator", scene: "form", at: 52.4, text: "Кайра киришти." },
  { id: "d02", role: "daughter", scene: "car", at: 57.0, text: "Ата, бүгүн эмне болгонун айтып берейинби?" },
  { id: "f02", role: "father", scene: "car", at: 59.7, text: "Ооба, кызым. Айта бер." },
  { id: "n07", role: "narrator", scene: "car", at: 62.6, text: "Кийинки жолугушууга жыйырма мүнөт калды." },
  { id: "n08", role: "narrator", scene: "road", at: 67.8, text: "Үйгө бара жаткан жол да күтүлгөндөн узакка созулду." },
  { id: "n09", role: "narrator", scene: "grandma", at: 75.5, text: "Кызын үйгө киргизди. Мугалимдин өтүнүчүн чоң апасына айтып берди." },
  { id: "n10", role: "narrator", scene: "same11", at: 82.5, text: "Кеңсеге кайтып келди. Картада баягы эле он бир мүнөт." },
  { id: "m02", role: "mother", scene: "confess", at: 90.9, text: "Кандай барып келдиңер?" },
  { id: "f03", role: "father", scene: "confess", at: 93.4, text: "Эми түшүндүм. Эмнеге бир сааттан ашык убакыт бөлөрүңдү." },
  { id: "d03", role: "daughter", scene: "craft", at: 100.8, text: "Ата, мен унаада айтып бүтпөй калдым." },
  { id: "f04", role: "father", scene: "craft", at: 104.4, text: "Көрсөтчү, кызым. Мен угуп жатам." },
  {
    id: "n11",
    role: "narrator",
    scene: "final",
    at: 108.6,
    text: "Алар BalaGo’го алдын ала арыз калтырышты.",
    spoken: "Алар БалаГого алдын ала арыз калтырышты.",
  },
  { id: "n12", role: "narrator", scene: "final", at: 112.4, text: "Эми календарда да жолго жетиштүү убакыт бөлүндү." },
];

// Речь заканчивается не позже: дальше — музыка и спокойный финальный кадр.
export const EM2_DIALOG_END = 115.8;
// Выразительные паузы перед репликой (с).
export const EM2_MIN_GAP: Readonly<Record<string, number>> = { m01: 0.8, f03: 1.2, f04: 1.4 };

export const lineById = (id: string) => {
  const l = EM2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Этапы поездки (время истории, мин) ----------
// 11 мин — только «Кеңсе → Мектеп». Накопление монотонно до 61.
export type Em2Stage = { readonly id: string; readonly label: string; readonly min: number; readonly total: number; readonly scene: Em2SceneId };
export const EM2_STAGES: readonly Em2Stage[] = [
  { id: "drive", label: "Мектепке чейин", min: 11, total: 11, scene: "leave" },
  { id: "park", label: "Токтотуучу жай", min: 6, total: 17, scene: "parking" },
  { id: "walk", label: "Жөө баруу", min: 5, total: 22, scene: "parking" },
  { id: "wait", label: "Күтүү", min: 7, total: 29, scene: "waiting" },
  { id: "kit", label: "Спорттук кийим", min: 8, total: 37, scene: "form" },
  { id: "back", label: "Унаага кайтуу", min: 5, total: 42, scene: "form" },
  { id: "home", label: "Үйгө жол", min: 8, total: 50, scene: "road" },
  { id: "granny", label: "Чоң апасына өткөрүү", min: 4, total: 54, scene: "grandma" },
  { id: "office", label: "Кеңсеге кайтуу", min: 7, total: 61, scene: "same11" },
];
// До следующей встречи (мин) после этапа: машина — 20, дом — 12,
// бабушка — 8, кеңсе — 1 (согласовано с последними 19 мин поездки).
export const EM2_MEETING_LEFT: Readonly<Record<string, number>> = { back: 20, home: 12, granny: 8, office: 1 };
export const EM2_TRIP_TOTAL = 61;

// ---------- Экранные надписи (кыргызча) ----------
export const EM2_TEXT = {
  office: "Кеңсе",
  school: "Мектеп",
  home: "Үй",
  route: "Кеңсе → Мектеп",
  eleven: "11 мүнөт",
  moreThanHour: "Бир сааттан ашык?",
  total: "Жалпы",
  min: "мүнөт",
  mapHint: "Карта",
  journal: "Жол журналы",
  meetingLeft: (n: number) => `Жолугушууга ${n} мүнөт`,
  allRoad: "Бардык жол: 61 мүнөт",
  roles: { father: "Долбоордук топ", mother: "Маркетинг" },
  calendar: {
    title: "Календарь",
    today: "Бүгүн",
    meetingA: "Командалык жолугушуу",
    meetingB: "Кардар менен жолугушуу",
    school: "Мектепке баруу",
    momSchool: "Мектеп",
    times: ["12:00", "13:00", "14:00", "15:00"],
  },
  note: "Эртең түстүү кагаз ала келсин.",
  noteFrom: "Мугалимден",
  kit: "Спорттук кийим",
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    title: "Алдын ала арыз",
    fields: [
      ["Маршрут", "Мектеп → Үй"],
      ["Качан", "Иш күндөрү"],
      ["Эскертүү", "Убакытты сүйлөшөлү"],
    ],
    send: "Алдын ала арыз",
    sent: "Арыз жөнөтүлдү",
  },
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    route: "Мектеп → Үй",
    call: "Алдын ала арыз калтырыңыз",
    button: "Алдын ала арыз",
    link: "Толук маалымат — профилдеги шилтемеде",
  },
} as const;
