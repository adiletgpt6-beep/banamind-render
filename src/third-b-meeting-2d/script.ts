// Ролик BalaGoThirdBMeeting2D — «Үчүнчү "Б" класстагы сүйлөшүүлөр»
// («Переговоры в третьем "Б"»), сценарий №23.
//
// Айжан руководит дизайн-студией «АЙКЫН». Клиенты (кафе «БУЛАК») переносят
// встречу на 13:30 — ровно на конец уроков дочки. Папа в этот день проводит
// обучение сотрудников. Айжан подключается к переговорам из машины у
// школы: пересаживается назад влево с ноутбуком, дочка садится назад
// вправо и пристёгивается. Посреди уверенной презентации дочка поднимает
// рисунок «3 Б» — лист попадает в веб-камеру, клиент спрашивает, не в
// третьем ли «Б» мама. Мама с улыбкой представляет дочку, клиент тепло
// шутит, затем проект согласуют. Вечером родители сами находят BalaGo и
// отправляют предварительное обращение (без цен, дат, водителя и
// подтверждённого маршрута). Дочка рисует вывеску «АЙКЫН» для маминого
// кабинета и подписывает «Дизайнер — 3 Б». Контакты — последние 150 кадров.
//
// Длительность не задана заранее: сцены вытягиваются по фактической речи
// (layoutTimeline), контактная карточка — ровно последние 150 кадров.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const T3B_VIDEO = {
  id: "BalaGoThirdBMeeting2D",
  output: "balago-23-third-b-meeting-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/third-b-meeting-2d",
} as const;

// Контактная карточка — ровно 5 с (150 кадров) в конце ролика.
export const T3B_CONTACT_FRAMES = 150;

// ---------- Сцены ----------
export type T3bSceneId =
  | "hook"
  | "studio"
  | "calendar"
  | "dad"
  | "parked"
  | "daughter"
  | "present"
  | "drawing"
  | "joke"
  | "approved"
  | "question"
  | "drive"
  | "search"
  | "sign"
  | "contact";

// tail — время после конца последней реплики сцены (действие, реакция,
// переход); min — нижняя граница длительности сцены. Сцена без речи
// (drawing, contact) имеет длину min.
export type T3bSceneSpec = {
  readonly id: T3bSceneId;
  readonly title: string;
  readonly tail: number;
  readonly min: number;
};

export const T3B_SCENE_SPECS: readonly T3bSceneSpec[] = [
  { id: "hook", title: "1. Күтүлбөгөн суроо", tail: 2.3, min: 5.5 },
  { id: "studio", title: "2. Баары даяр", tail: 1.9, min: 11 },
  { id: "calendar", title: "3. Бир убакта эки иш", tail: 2.5, min: 10 },
  { id: "dad", title: "4. Атасы да бош эмес", tail: 2.7, min: 7.5 },
  {
    id: "parked",
    title: "5. Мектептин жанындагы сүйлөшүү бөлмөсү",
    tail: 4.2,
    min: 15.6,
  },
  { id: "daughter", title: "6. Кызы келди", tail: 1.6, min: 13 },
  { id: "present", title: "7. Ишенимдүү презентация", tail: 4.6, min: 11 },
  { id: "drawing", title: "8. «3 Б» кадрга түштү", tail: 0, min: 9.6 },
  { id: "joke", title: "9. Тамаша жана жооп", tail: 2.8, min: 14 },
  { id: "approved", title: "10. Долбоор бекитилди", tail: 4.6, min: 10 },
  { id: "question", title: "11. Тоскоол болгон жокпу?", tail: 2.5, min: 9 },
  { id: "drive", title: "12. Бүгүн жетишти", tail: 2.6, min: 11 },
  { id: "search", title: "13. Ата-эне чечим издейт", tail: 5.3, min: 22 },
  { id: "sign", title: "14. Жаңы көрнөк", tail: 14.4, min: 16 },
  { id: "contact", title: "15. BalaGo", tail: 0, min: T3B_CONTACT_FRAMES / 30 },
];

// ---------- Голоса ----------
export type T3bRole = "narrator" | "mother" | "daughter" | "father" | "client";

export const T3B_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 231,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Сохранённые кыргызские голоса проекта (ElevenLabs Voice Design):
//   narrator — KG-teacher: тёплый спокойный женский голос рассказчика
//              (№10, №12, №22);
//   mother   — KG-mother: тёплый уверенный женский голос (№10, №12, №22);
//   father   — KG-husband: спокойный низкий мужской голос (№10, №12, №22).
// Голоса дочери и клиента выбираются пробами (scripts/t3b-voice-probe.mjs):
// пустой voiceId — голос берётся из voice-samples/third-b-meeting-2d/probe/
// pick.json; пока выбора нет, реплики роли не синтезируются.
export const T3B_VOICES: Record<
  T3bRole,
  { readonly name: string; readonly voiceId: string }
> = {
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  daughter: { name: "", voiceId: "" },
  client: { name: "", voiceId: "" },
};

// Кандидаты для проб (только уже сохранённые голоса проекта).
export const T3B_PROBE_CANDIDATES: Record<
  "daughter" | "client" | "narrator",
  readonly {
    readonly name: string;
    readonly voiceId: string;
    readonly from: string;
  }[]
> = {
  daughter: [
    {
      name: "KG-daughter",
      voiceId: "AeboPz5CtE7qRUVvW93b",
      from: "№12 two-schedules-2d",
    },
    {
      name: "NB2-daughter",
      voiceId: "gtJEwH1YEkKKie4gBpH7",
      from: "№11 no-backup-2d",
    },
    {
      name: "NB2-friend",
      voiceId: "YFFd51gsFa9VT4xGD15W",
      from: "№11 no-backup-2d",
    },
  ],
  client: [
    {
      name: "KG-boss",
      voiceId: "yCcjraKUNFsfIv02eS9D",
      from: "№10 half-hour-2d",
    },
    {
      name: "NB2-brother",
      voiceId: "IRGPSiyjpLdMfh3zNzFo",
      from: "№11 no-backup-2d",
    },
    {
      name: "NB2-father",
      voiceId: "xxKkhYUgtZTPTuHpktPy",
      from: "№11 no-backup-2d",
    },
  ],
  narrator: [
    {
      name: "KG-teacher",
      voiceId: "EBOfpUWl9G5ltD2PkFgy",
      from: "№10 half-hour-2d",
    },
  ],
};

// ---------- Реплики ----------
// text — как звучит и как показывается в субтитрах; spoken — что уходит в
// TTS, если отличается (BalaGo → «БалаГо», «Б» → «Бэ»); tag — аудиотег
// eleven_v3 (не звучит, в субтитры не попадает); call — голос из
// видеозвонка (очень лёгкая полосовая обработка, речь остаётся ясной).
export type T3bLine = {
  readonly id: string;
  readonly role: T3bRole;
  readonly text: string;
  readonly spoken?: string;
  readonly tag?: string;
  readonly seed?: number;
  readonly call?: boolean;
  readonly note: string; // режиссёрское пояснение (не озвучивается)
};

export const T3B_LINES: readonly T3bLine[] = [
  {
    id: "C01",
    role: "client",
    text: "Кечиресиз… Сиз азыр үчүнчү «Б» класстасызбы?",
    spoken: "Кечиресиз... Сиз азыр үчүнчү Бэ класстасызбы?",
    tag: "[curious]",
    call: true,
    note: "доброжелательное удивление; одна запись — в сценах 1 и 9",
  },
  {
    id: "N01",
    role: "narrator",
    text: "Айжан дизайн студиясын жетектейт. Бүгүн ал кардарларга жаңы долбоорун көрсөтмөк. Презентация, эсептөөлөр, материалдардын үлгүлөрү — баары даяр.",
    note: "уверенно, с лёгким интересом",
  },
  {
    id: "N02",
    role: "narrator",
    text: "Бирок эртең менен кардарлар жолугушууну башка убакытка жылдырышты. Дал ошол маалда кызынын сабагы бүтөт.",
    note: "понятное объяснение, без нагнетания",
  },
  {
    id: "F01",
    role: "father",
    text: "Бүгүн кызматкерлерди окутуп жатам. Тилекке каршы, чыга албайм.",
    note: "спокойно, с сожалением",
  },
  {
    id: "M01",
    role: "mother",
    text: "Түшүндүм.",
    tag: "[thoughtfully]",
    note: "приняла, обдумывает",
  },
  {
    id: "N03",
    role: "narrator",
    text: "Айжан мектепке эрте келип, унаадагы жолугушууга даярданды.",
    note: "чуть легче, деловая энергия",
  },
  {
    id: "M02",
    role: "mother",
    text: "Мен сүйлөшүп бүтөйүн. Анан үйгө кетебиз.",
    tag: "[warmly]",
    note: "тёплое объяснение дочке",
  },
  { id: "G01", role: "daughter", text: "Макул.", note: "спокойное согласие" },
  {
    id: "M03",
    role: "mother",
    text: "Бул вариантта аталыш алыстан да жакшы окулат. Материалдардын үлгүлөрүн да даярдадым.",
    note: "профессиональная презентация",
  },
  {
    id: "M04",
    role: "mother",
    text: "Бүгүн көчмө кеңседебиз. Бул — менин кызым.",
    spoken: "Бүгүн көчмө кеңседебиз. Бул менин кызым.",
    tag: "[warmly]",
    note: "улыбается, уверенно подхватывает шутку",
  },
  {
    id: "C02",
    role: "client",
    text: "Сонун көрнөк экен! Эми сиз даярдаган долбоорду көрөлү.",
    tag: "[warmly]",
    call: true,
    note: "искренняя улыбка, затем к работе",
  },
  {
    id: "C03",
    role: "client",
    text: "Ушул вариантты тандайлы. Бизге жакты.",
    call: true,
    note: "деловое согласование",
  },
  {
    id: "M05",
    role: "mother",
    text: "Рахмат. Анда ушул вариант менен улантабыз.",
    note: "спокойная уверенность",
  },
  {
    id: "G02",
    role: "daughter",
    text: "Апа, сүрөтүм тоскоол болгон жокпу?",
    tag: "[softly]",
    seed: 263,
    note: "тихий искренний вопрос (seed 263: в прежнем дубле слышалось «Апам»)",
  },
  {
    id: "M06",
    role: "mother",
    text: "Жок, кызым. Баарына жакты.",
    tag: "[warmly]",
    note: "тепло и прямо",
  },
  {
    id: "N04",
    role: "narrator",
    text: "Бүгүн баарына жетишти. Бирок ар бир жолугушууну мектептин жанында өткөрүү оңой эмес.",
    note: "спокойное наблюдение",
  },
  {
    id: "M07",
    role: "mother",
    text: "Бүгүн жолугушуу жакшы өттү. Бирок күн сайын ушинтип иштей албайм.",
    note: "формулирует задачу, не обвинение",
  },
  {
    id: "F02",
    role: "father",
    text: "Кел, мектепке барып-келүүнүн башка жолун издеп көрөлү.",
    note: "предлагает действовать вместе",
  },
  {
    id: "M08",
    role: "mother",
    text: "Мына, BalaGo. Алдын ала арыз калтырсак болот экен.",
    spoken: "Мына, БалаГо. Алдын ала арыз калтырсак болот экен.",
    note: "нашла вариант, без восторга",
  },
  {
    id: "F03",
    role: "father",
    text: "Кел, кайрылып, каттам тууралуу сүйлөшөлү.",
    note: "спокойное совместное решение",
  },
  {
    id: "G03",
    role: "daughter",
    text: "Апа, кабинетиңе да көрнөк жасап берейинби?",
    tag: "[excited]",
    note: "увлечённая идея, без писка",
  },
  {
    id: "M09",
    role: "mother",
    text: "Кел, чогуу жасайлы.",
    tag: "[warmly]",
    note: "тёплое приглашение",
  },
];

// ---------- Речевые сегменты на шкале ----------
// Один файл реплики может звучать на шкале дважды (C01: сцены 1 и 9) —
// сегмент указывает line. gap — пауза перед репликой: от начала сцены
// (первая реплика сцены) или от конца предыдущей реплики той же сцены.
export type T3bMode = "narration" | "live";
export type T3bSegSpec = {
  readonly id: string;
  readonly line: string;
  readonly scene: T3bSceneId;
  readonly gap: number;
  readonly action: string; // связанное действие (для таблицы реплик)
};

export const T3B_SEG_SPECS: readonly T3bSegSpec[] = [
  {
    id: "C01a",
    line: "C01",
    scene: "hook",
    gap: 0.7,
    action:
      "крупный план клиента в окне звонка; мама замирает, край листа «3 Б»",
  },
  {
    id: "N01",
    line: "N01",
    scene: "studio",
    gap: 1.2,
    action:
      "студия «АЙКЫН»: образцы выравниваются, эскиз «БУЛАК», слайд, список",
  },
  {
    id: "N02",
    line: "N02",
    scene: "calendar",
    gap: 2.8,
    action:
      "сообщение клиента прочитано; встреча 11:00 → 13:30 рядом с уроками",
  },
  {
    id: "F01",
    line: "F01",
    scene: "dad",
    gap: 1.0,
    action: "папа на обучении сотрудников, телефон у уха",
  },
  {
    id: "M01",
    line: "M01",
    scene: "dad",
    gap: 0.6,
    action: "мама кивает, смотрит на папку, берёт ключи",
  },
  {
    id: "N03",
    line: "N03",
    scene: "parked",
    gap: 1.0,
    action: "машина у школы; мама пересаживается назад влево с ноутбуком",
  },
  {
    id: "M02",
    line: "M02",
    scene: "daughter",
    gap: 9.4,
    action: "дочка вышла, открыла дверь, села; мама проверяет ремень",
  },
  {
    id: "G01",
    line: "G01",
    scene: "daughter",
    gap: 0.5,
    action: "дочка кивает",
  },
  {
    id: "M03",
    line: "M03",
    scene: "present",
    gap: 1.8,
    action: "звонок идёт; мама жестом к образцу; варианты «БУЛАК»",
  },
  {
    id: "C01",
    line: "C01",
    scene: "joke",
    gap: 0.5,
    action: "лист в окне звонка; тот же файл, что в сцене 1",
  },
  {
    id: "M04",
    line: "M04",
    scene: "joke",
    gap: 1.0,
    action: "мама замирает, смотрит на рисунок, улыбается",
  },
  {
    id: "C02",
    line: "C02",
    scene: "joke",
    gap: 1.1,
    action: "клиент замечает мальчика с карандашом, улыбается",
  },
  {
    id: "C03",
    line: "C03",
    scene: "approved",
    gap: 1.1,
    action: "клиент выбирает показанный вариант",
  },
  {
    id: "M05",
    line: "M05",
    scene: "approved",
    gap: 0.5,
    action: "мама подтверждает; тачпад, конец звонка, крышка",
  },
  {
    id: "G02",
    line: "G02",
    scene: "question",
    gap: 1.4,
    action: "тихий средний план, лицо дочки",
  },
  {
    id: "M06",
    line: "M06",
    scene: "question",
    gap: 1.0,
    action: "мама оставляет ноутбук, смотрит на дочь",
  },
  {
    id: "N04",
    line: "N04",
    scene: "drive",
    gap: 5.6,
    action: "мама за рулём, ремни; машина едет домой",
  },
  {
    id: "M07",
    line: "M07",
    scene: "search",
    gap: 1.4,
    action: "вечер, родители за столом, дочка с альбомом",
  },
  {
    id: "F02",
    line: "F02",
    scene: "search",
    gap: 0.6,
    action: "папа берёт телефон",
  },
  {
    id: "M08",
    line: "M08",
    scene: "search",
    gap: 5.4,
    action: "поиск, результат, страница BalaGo, «Мектеп → Үй»",
  },
  {
    id: "F03",
    line: "F03",
    scene: "search",
    gap: 0.7,
    action: "WhatsApp: предварительное обращение, «Жөнөтүлдү»",
  },
  {
    id: "G03",
    line: "G03",
    scene: "sign",
    gap: 1.6,
    action: "дочка подходит с альбомом",
  },
  {
    id: "M09",
    line: "M09",
    scene: "sign",
    gap: 0.6,
    action: "мама поворачивается; «АЙКЫН», «Дизайнер — 3 Б»",
  },
];

export const modeOf = (lineId: string): T3bMode =>
  lineId.startsWith("N") ? "narration" : "live";

export const lineById = (id: string) => {
  const l = T3B_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};
export const segById = (id: string) => {
  const s = T3B_SEG_SPECS.find((x) => x.id === id);
  if (!s) throw new Error(`Нет сегмента ${id}`);
  return s;
};

// ---------- Раскладка шкалы по фактической длительности речи ----------
// speech(lineId) — длительность речи реплики (с, от первого до последнего
// звука). Возвращает сцены (кадры) и начало каждого сегмента (с).
export type T3bSceneSpan = {
  readonly id: T3bSceneId;
  readonly title: string;
  readonly from: number;
  readonly to: number;
}; // кадры
export type T3bSegAt = {
  readonly id: string;
  readonly line: string;
  readonly scene: T3bSceneId;
  readonly at: number;
  readonly end: number;
};
export type T3bLayout = {
  readonly scenes: readonly T3bSceneSpan[];
  readonly segments: readonly T3bSegAt[];
  readonly frames: number;
  readonly contactFrom: number; // кадр
};

export const layoutTimeline = (
  speech: (lineId: string) => number,
): T3bLayout => {
  const fps = T3B_VIDEO.fps;
  const scenes: T3bSceneSpan[] = [];
  const segments: T3bSegAt[] = [];
  let frame = 0;
  for (const sc of T3B_SCENE_SPECS) {
    const start = frame / fps;
    let t = start;
    let first = true;
    for (const sg of T3B_SEG_SPECS.filter((x) => x.scene === sc.id)) {
      const at =
        Math.round((first ? start + sg.gap : t + sg.gap) * 1000) / 1000;
      const end = at + speech(sg.line);
      segments.push({ id: sg.id, line: sg.line, scene: sc.id, at, end });
      t = end;
      first = false;
    }
    const need = first ? sc.min : Math.max(sc.min, t - start + sc.tail);
    const len =
      sc.id === "contact" ? T3B_CONTACT_FRAMES : Math.ceil(need * fps);
    scenes.push({ id: sc.id, title: sc.title, from: frame, to: frame + len });
    frame += len;
  }
  return {
    scenes,
    segments,
    frames: frame,
    contactFrom: frame - T3B_CONTACT_FRAMES,
  };
};

// Оценка длительности речи по тексту (≈ 13 букв/с, паузы на знаках) —
// только до генерации озвучки (черновые кадры).
export const estimateSpeech = (id: string) => {
  const l = lineById(id);
  const text = l.spoken ?? l.text;
  const letters = [...text].filter((c) => /\p{L}/u.test(c)).length;
  const marks = (text.match(/[.,!?—]/g) ?? []).length;
  return letters / 13 + marks * 0.25;
};

// ---------- Экранные надписи (кыргызча) ----------
export const T3B_TEXT = {
  brand: "BalaGo",
  tagline: "Балдар үчүн такси",
  sameDay: "Ошол эле күнү, эртең менен",
  studio: "АЙКЫН",
  studioSub: "дизайн студиясы",
  client: "БУЛАК",
  clientSub: "кафе",
  // Презентация проекта: два варианта вывески кафе «БУЛАК»
  deck: {
    title: "«БУЛАК» көрнөгү",
    a: "1-вариант",
    b: "2-вариант",
    samples: "Материалдар",
  },
  checklist: ["Презентация", "Эсептөөлөр", "Үлгүлөр"],
  // Сообщение клиента и календарь
  chatFrom: "БУЛАК кафеси",
  message: "Жолугушууну 13:30га жылдырсак болобу?",
  calendar: {
    title: "Бүгүн",
    oldTime: "11:00",
    newTime: "13:30",
    meeting: "БУЛАК: жолугушуу",
    school: "Сабактын бүтүшү — 13:30",
  },
  dadTraining: "Кызматкерлерди окутуу",
  school: "Мектеп",
  // Видеозвонок
  call: {
    you: "Айжан",
    client: "Бакыт",
    second: "Нурлан",
    ended: "Чалуу аяктады",
    mute: "Үн",
    cam: "Камера",
    end: "Бүтүрүү",
  },
  // Рисунки дочки
  drawingClass: "3 Б",
  signTitle: "АЙКЫН",
  signCredit: "Дизайнер — 3 Б",
  // Поиск и предварительное обращение (постановочный экран, без номера)
  search: { query: "Бишкек балдар үчүн такси", hint: "Издөө" },
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    route: "Мектеп → Үй",
    status: "Алдын ала арыздар кабыл алынат",
    cta: "WhatsApp аркылуу жазуу",
  },
  chat: {
    title: "BalaGo",
    text: "Саламатсызбы! Кызыбызды мектептен үйгө алып келүү боюнча алдын ала маалымат алсак болобу?",
    sent: "Жөнөтүлдү",
  },
  // Контактная карточка — последние 5 с.
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    call: "Алдын ала арыз калтырыңыз",
    link: "Профилдеги шилтеме аркылуу",
    whatsapp: "WhatsApp: 0998 08 38 28",
  },
  whatsappUrl: "https://wa.me/996998083828",
} as const;
