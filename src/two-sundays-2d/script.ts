// Ролик BalaGoTwoSundays2D — «Эмне үчүн анын эки жекшембиси бар?»
// («Почему у неё два воскресенья?»), сценарий №26.
//
// В детском календаре на месте среды написано «Биздин жекшемби», а
// настоящее воскресенье осталось на своём месте. В будни мама отвозит дочку
// в школу, днём выезжает с работы, привозит её к бабушке и возвращается
// доделывать задачи. По средам папа работает из дома и заранее выделяет
// время на школьные поездки; мама спокойно проводит встречи и приходит
// раньше. Вечером семья вместе готовит ужин, разговаривает и играет — для
// дочки это праздник. Родители сами находят BalaGo и отправляют
// предварительную заявку, чтобы обсудить остальные дни; среда остаётся за
// папой. На следующем ужине календарь становится общим, мама вешает его на
// холодильник, папа спрашивает, кто выберет игру на среду, — дочка
// поднимает руку.
//
// Длительность не задана заранее: сцены вытягиваются по фактической речи
// (layoutTimeline), контактная карточка — ровно последние 150 кадров.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const SU2_VIDEO = {
  id: "BalaGoTwoSundays2D",
  output: "balago-two-sundays-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/two-sundays-2d",
} as const;

// Контактная карточка — ровно 5 с (150 кадров) в конце ролика:
// кадры [frames − 150, frames).
export const SU2_CONTACT_FRAMES = 150;

// ---------- Сцены ----------
export type Su2SceneId =
  | "calendar"
  | "special"
  | "morning"
  | "office"
  | "grandma"
  | "wednesday"
  | "meeting"
  | "dinner"
  | "why"
  | "showDad"
  | "memory"
  | "search"
  | "shared"
  | "fridge"
  | "contact";

// tail — время после конца последней реплики (действие, реакция, переход);
// min — нижняя граница длительности сцены (с).
export type Su2SceneSpec = {
  readonly id: Su2SceneId;
  readonly title: string;
  readonly tail: number;
  readonly min: number;
};

export const SU2_SCENE_SPECS: readonly Su2SceneSpec[] = [
  { id: "calendar", title: "1. Эки жекшемби", tail: 1.4, min: 8 },
  { id: "special", title: "2. Атайын ушинтип жаздым", tail: 1.3, min: 11 },
  { id: "morning", title: "3. Адаттагы таң", tail: 5.0, min: 11.5 },
  { id: "office", title: "4. Жумуш күнүнүн ортосу", tail: 6.2, min: 13 },
  { id: "grandma", title: "5. Эки багыт", tail: 3.4, min: 10 },
  { id: "wednesday", title: "6. Башка шаршемби", tail: 3.4, min: 12 },
  { id: "meeting", title: "7. Жолугушуу үзүлбөйт", tail: 3.6, min: 10 },
  { id: "dinner", title: "8. Дасторкондо үчөө", tail: 3.6, min: 13 },
  { id: "why", title: "9. Эмне үчүн жекшемби", tail: 1.7, min: 14 },
  { id: "showDad", title: "10. Атасына көрсөттү", tail: 2.6, min: 10 },
  { id: "memory", title: "11. Кадимки кеч — майрам", tail: 2.4, min: 11 },
  { id: "search", title: "12. BalaGo'ну өздөрү табышат", tail: 6.2, min: 18 },
  { id: "shared", title: "13. Календарь жалпы болот", tail: 1.4, min: 9 },
  { id: "fridge", title: "14. Оюнду ким тандайт?", tail: 4.6, min: 8 },
  {
    id: "contact",
    title: "15. Байланыш",
    tail: 0,
    min: SU2_CONTACT_FRAMES / 30,
  },
];

// ---------- Голоса ----------
export type Su2Role = "narrator" | "mother" | "daughter" | "father";

export const SU2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 261,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Сохранённые кыргызские голоса проекта (ElevenLabs Voice Design):
//   narrator — KG-teacher, тёплый спокойный взрослый рассказчик;
//   mother   — KG-mother, естественный тёплый женский голос;
//   father   — KG-husband, спокойный мужской голос (отличим от рассказчика);
//   daughter — выбирается пробами (scripts/su2d-girl-probe.mjs): прежний
//              KG-daughter при слепом прослушивании оценивается то как
//              ребёнок, то как подросток или взрослая женщина. Пока голос
//              не вписан сюда (пустой voiceId), он берётся из
//              voice-samples/two-sundays-2d/girl-probe/report.json (picked).
export const SU2_VOICES: Record<
  Su2Role,
  { readonly name: string; readonly voiceId: string }
> = {
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  daughter: { name: "", voiceId: "" },
};

// ---------- Реплики ----------
// text — как звучит и как показывается в субтитрах; spoken — что уходит в
// TTS, если отличается (BalaGo → «БалаГо», без кавычек и тире); tag —
// аудиотег eleven_v3 (не звучит, в субтитры не попадает).
export type Su2Line = {
  readonly id: string;
  readonly role: Su2Role;
  readonly text: string;
  readonly spoken?: string;
  readonly tag?: string;
  readonly seed?: number;
  readonly note: string; // режиссёрское пояснение (не озвучивается)
};

export const SU2_LINES: readonly Su2Line[] = [
  {
    id: "N01",
    role: "narrator",
    text: "Кыздын календарында эки жекшемби бар эле. Бири — өз ордунда. Экинчиси — аптанын ортосунда.",
    spoken:
      "Кыздын календарында эки жекшемби бар эле. Бири өз ордунда. Экинчиси аптанын ортосунда.",
    tag: "[curious]",
    note: "интрига без тревоги",
  },
  {
    id: "N02",
    role: "narrator",
    text: "Апасы кыздын үстөлүндөгү сүрөттү көрдү. Жети күн. Бирок шаршембинин ордуна «Биздин жекшемби» деп жазылыптыр.",
    spoken:
      "Апасы кыздын үстөлүндөгү сүрөттү көрдү. Жети күн. Бирок шаршембинин ордуна, Биздин жекшемби, деп жазылыптыр.",
    note: "спокойно, с лёгким удивлением в конце",
  },
  {
    id: "M01",
    role: "mother",
    text: "Күндөрдү чаташтырып алдыңбы?",
    tag: "[gently]",
    note: "удивлённо и спокойно",
  },
  {
    id: "D01",
    role: "daughter",
    text: "Жок. Атайын ушинтип жаздым.",
    note: "уверенно, чуть улыбаясь",
  },
  {
    id: "N03",
    role: "narrator",
    text: "Адатта алардын таңы шашылыш өтчү. Апасы жумушка даярданып, кызын мектепке жеткирчү.",
    note: "ровно, без паники",
  },
  {
    id: "N04",
    role: "narrator",
    text: "Сабак бүткөндө кайра жумуштан чыгып, кызын үйгө алып келчү.",
    note: "спокойно",
  },
  {
    id: "N05",
    role: "narrator",
    text: "Кыз чоң энесинин жанында калчу. Апасы болсо кеңсеге кайтып, иштерин бүтүрчү.",
    note: "спокойно",
  },
  {
    id: "N06",
    role: "narrator",
    text: "Атасы да кеңседе иштечү. Бирок шаршемби күндөрү үйдөн иштечү. Ал кызын мектепке жеткирип, сабактан кийин алып келүүгө алдын ала убакыт бөлчү.",
    note: "деловито, тепло",
  },
  {
    id: "N07",
    role: "narrator",
    text: "Ошол күнү апасы жолугушууларын шашпай өткөрүп, үйгө адаттагыдан эрте келчү.",
    note: "мягко",
  },
  {
    id: "N08",
    role: "narrator",
    text: "Кечинде баары чогуу тамак даярдашчу. Кызы идиштерди койчу. Атасы жашылча туурачу. Апасы мектептеги жаңылыктарды сурачу.",
    tag: "[warmly]",
    note: "тепло, ровный ритм перечисления",
  },
  {
    id: "M02",
    role: "mother",
    text: "Ошон үчүн жекшемби деп жаздыңбы?",
    tag: "[softly]",
    note: "уже понимая связь, мягко",
  },
  {
    id: "D02",
    role: "daughter",
    text: "Ооба. Сиз «Даярданып жатканда айтып бер» дебейсиз. Атам да үйдө болот. Биз дасторкондун жанында көпкө отура алабыз.",
    spoken:
      "Ооба. Сиз, даярданып жатканда айтып бер, дебейсиз. Атам да үйдө болот. Биз дасторкондун жанында көпкө отура алабыз.",
    note: "искренне, задумчиво, без обиды и жалобы; небольшие паузы между фразами; к маме — на «сиз»",
  },
  {
    id: "N09",
    role: "narrator",
    text: "Кийин апасы календарды күйөөсүнө көрсөттү. Экөө өткөн шаршембини эстешти.",
    tag: "[softly]",
    note: "тихо",
  },
  {
    id: "N10",
    role: "narrator",
    text: "Кадимки кечки тамак. Сабактагы күлкүлүү окуя. Бир аз чогуу ойногон убакыт. Кызы үчүн бул кеч майрамдай болуптур.",
    tag: "[warmly]",
    note: "тепло, с паузами между образами",
  },
  {
    id: "N11",
    role: "narrator",
    text: "Экөө калган күндөрдөгү мектеп каттамын да уюштурууну чечишти. BalaGo кызматын таап, каттамды сүйлөшүү үчүн алдын ала өтүнмө жөнөтүштү.",
    spoken:
      "Экөө калган күндөрдөгү мектеп каттамын да уюштурууну чечишти. БалаГо кызматын таап, каттамды сүйлөшүү үчүн алдын ала өтүнмө жөнөтүштү.",
    note: "сопровождает действия, без рекламной интонации",
  },
  {
    id: "F01",
    role: "father",
    text: "Шаршемби менде калсын. Калган күндөрдү сүйлөшүп көрөлү.",
    note: "спокойно, во время выбора условий",
  },
  {
    id: "N12",
    role: "narrator",
    text: "Кийинки жолу чогуу тамактанып отурганда, кызы календарды кайра алып келди.",
    note: "светло",
  },
  {
    id: "D03",
    role: "daughter",
    text: "Бул жерге пландарыбызды да жазалычы.",
    tag: "[excited]",
    note: "с предложением, оживлённо",
  },
  {
    id: "F02",
    role: "father",
    text: "Шаршембидеги оюнду ким тандайт?",
    tag: "[playfully]",
    note: "тепло, с лёгкой улыбкой",
  },
  {
    id: "N13",
    role: "narrator",
    text: "BalaGo — балдар үчүн такси.",
    spoken: "БалаГо, балдар үчүн такси.",
    note: "только на контактной карточке, спокойно",
  },
];

// ---------- Речевые сегменты на шкале ----------
// mode: narration — закадровый текст (рты закрыты); live — живая речь в кадре.
// gap — пауза перед репликой: от начала сцены (первая реплика сцены) или
// от конца предыдущей реплики той же сцены. В паузах — действие.
export type Su2Mode = "narration" | "live";
export type Su2SegSpec = {
  readonly id: string;
  readonly scene: Su2SceneId;
  readonly gap: number;
  readonly action: string; // связанное действие (для таблицы реплик)
};

export const SU2_SEG_SPECS: readonly Su2SegSpec[] = [
  {
    id: "N01",
    scene: "calendar",
    gap: 0.9,
    action:
      "крупно «Жекшемби» → «Биздин жекшемби»; отъезд: семь клеток сверху, рука дорисовывает луч",
  },
  {
    id: "N02",
    scene: "special",
    gap: 0.7,
    action:
      "мама подходит к столу дочки, присаживается; через плечо — третья клетка",
  },
  {
    id: "M01",
    scene: "special",
    gap: 0.6,
    action: "мама спрашивает, глядя на лист",
  },
  {
    id: "D01",
    scene: "special",
    gap: 0.5,
    action: "дочка придерживает лист, отвечает уверенно",
  },
  {
    id: "N03",
    scene: "morning",
    gap: 0.8,
    action: "сумка закрывается; лямка рюкзака; дверь машины, ремень",
  },
  {
    id: "N04",
    scene: "office",
    gap: 3.0,
    action:
      "мама с коллегами; часы; сохраняет документ; крышка ноутбука; у школы",
  },
  {
    id: "N05",
    scene: "grandma",
    gap: 1.4,
    action: "бабушка встречает дочку; мама возвращается к блокноту",
  },
  {
    id: "N06",
    scene: "wednesday",
    gap: 0.8,
    action:
      "папа в офисе; «Шаршемби» → блок расписания; ключи; встреча у школы",
  },
  {
    id: "N07",
    scene: "meeting",
    gap: 1.4,
    action: "мама спокойно слушает коллегу, отметка, выключает лампу",
  },
  {
    id: "N08",
    scene: "dinner",
    gap: 1.0,
    action: "приборы сверху; кухня: папа режет, мама миска, дочка сервирует",
  },
  {
    id: "M02",
    scene: "why",
    gap: 1.6,
    action: "тот же детский стол; мама спрашивает",
  },
  {
    id: "D02",
    scene: "why",
    gap: 0.8,
    action: "дочка отвечает с паузами; касается фигуры папы; смотрит на маму",
  },
  {
    id: "N09",
    scene: "showDad",
    gap: 1.6,
    action: "мама кладёт календарь перед папой; он отодвигает чашку",
  },
  {
    id: "N10",
    scene: "memory",
    gap: 0.8,
    action: "рисунок дочки; улыбки; настольная игра сверху; снова лист в руках",
  },
  {
    id: "N11",
    scene: "search",
    gap: 1.0,
    action: "телефон: поиск «BalaGo» → школьные поездки → заявка",
  },
  {
    id: "F01",
    scene: "search",
    gap: 1.0,
    action: "папа говорит до отправки; среда — поездка папы",
  },
  {
    id: "N12",
    scene: "shared",
    gap: 0.8,
    action: "следующий ужин; дочка приносит календарь",
  },
  {
    id: "D03",
    scene: "shared",
    gap: 1.0,
    action: "дочка предлагает, смотрит на обоих",
  },
  {
    id: "F02",
    scene: "fridge",
    gap: 4.2,
    action:
      "лист на холодильнике двумя магнитами; папа дописывает «Оюн», спрашивает",
  },
  {
    id: "N13",
    scene: "contact",
    gap: 0.8,
    action: "контактная карточка BalaGo",
  },
];

export const modeOf = (lineId: string): Su2Mode =>
  lineId.startsWith("N") ? "narration" : "live";

export const lineById = (id: string) => {
  const l = SU2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Раскладка шкалы по фактической длительности речи ----------
export type Su2SceneSpan = {
  readonly id: Su2SceneId;
  readonly title: string;
  readonly from: number;
  readonly to: number;
}; // кадры
export type Su2SegAt = {
  readonly id: string;
  readonly scene: Su2SceneId;
  readonly at: number;
  readonly end: number;
};
export type Su2Layout = {
  readonly scenes: readonly Su2SceneSpan[];
  readonly segments: readonly Su2SegAt[];
  readonly frames: number;
  readonly contactFrom: number; // кадр
};

export const layoutTimeline = (speech: (id: string) => number): Su2Layout => {
  const fps = SU2_VIDEO.fps;
  const scenes: Su2SceneSpan[] = [];
  const segments: Su2SegAt[] = [];
  let frame = 0;
  for (const sc of SU2_SCENE_SPECS) {
    const start = frame / fps;
    let t = start;
    let first = true;
    for (const sg of SU2_SEG_SPECS.filter((x) => x.scene === sc.id)) {
      const at =
        Math.round((first ? start + sg.gap : t + sg.gap) * 1000) / 1000;
      const end = at + speech(sg.id);
      segments.push({ id: sg.id, scene: sc.id, at, end });
      t = end;
      first = false;
    }
    const need = first ? sc.min : Math.max(sc.min, t - start + sc.tail);
    const len =
      sc.id === "contact" ? SU2_CONTACT_FRAMES : Math.ceil(need * fps);
    scenes.push({ id: sc.id, title: sc.title, from: frame, to: frame + len });
    frame += len;
  }
  return {
    scenes,
    segments,
    frames: frame,
    contactFrom: frame - SU2_CONTACT_FRAMES,
  };
};

// Оценка длительности речи по тексту — только до генерации озвучки.
export const estimateSpeech = (id: string) => {
  const l = lineById(id);
  const text = l.spoken ?? l.text;
  const letters = [...text].filter((c) => /\p{L}/u.test(c)).length;
  const marks = (text.match(/[.,!?—]/g) ?? []).length;
  return letters / 13 + marks * 0.25;
};

// ---------- Экранные надписи (кыргызча) ----------
export const SU2_TEXT = {
  brand: "BalaGo",
  tagline: "Балдар үчүн такси",
  question: "Эмне үчүн эки жекшемби?",
  // Детский календарь: ровно семь клеток (4 сверху + 3 снизу).
  days: [
    "Дүйшөмбү",
    "Шейшемби",
    "Биздин жекшемби",
    "Бейшемби",
    "Жума",
    "Ишемби",
    "Жекшемби",
  ],
  ourSunday: ["Биздин", "жекшемби"],
  play: "Оюн",
  wednesday: "Шаршемби",
  route3: ["Мектеп", "Үй", "Кеңсе"],
  // Рабочий календарь папы (среда, из дома).
  dadDay: {
    title: "Шаршемби",
    blocks: [
      { time: "08:00", text: "Мектепке жеткирүү", school: true },
      { time: "09:00", text: "Долбоордун отчету", school: false },
      { time: "11:00", text: "Онлайн жолугушуу", school: false },
      { time: "13:00", text: "Мектептен алып келүү", school: true },
      { time: "14:30", text: "Кодду карап чыгуу", school: false },
    ],
  },
  // Телефон родителей (постановочный экран предварительной заявки).
  search: { query: "BalaGo", hint: "Издөө" },
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    route: "Үй → Мектеп → Үй",
    cta: "Мектеп каттамын талкуулоо",
  },
  form: {
    title: "Алдын ала өтүнмө",
    daysLabel: "Каттам күндөрү",
    days: [
      { short: "Дүй", full: "Дүйшөмбү", on: true },
      { short: "Шей", full: "Шейшемби", on: true },
      { short: "Шар", full: "Шаршемби", on: false },
      { short: "Бей", full: "Бейшемби", on: true },
      { short: "Жума", full: "Жума", on: true },
    ],
    chosen: "Дүйшөмбү · Шейшемби · Бейшемби · Жума",
    dadNote: "Шаршембиде атасы алып келет",
    send: "Өтүнмө жөнөтүү",
    sent: "Өтүнмө жөнөтүлдү",
    sentNote: "Каттамды тактоо үчүн байланышабыз",
  },
  // Контактная карточка — последние 5 с.
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    call: "Мектеп каттамын сүйлөшөлү",
    link: "Профилдин башындагы шилтемеге өтүңүз",
    whatsapp: "же WhatsApp аркылуу жазыңыз:",
    phone: "0998 08 38 28",
  },
} as const;
