// Ролик BalaGoKnowsMyName2D — «Ал менин атымды билеби?»
// («Он знает, как меня зовут?»), сценарий №30.
//
// Родители решают задачу школьной дороги через адреса и расписания. Мама
// руководит отделом, папа работает в IT, машина у семьи есть; трудность —
// регулярно забирать сына после уроков между рабочими встречами. Дома
// мальчика может встретить няня, которая присматривает за его младшей
// сестрой. Вечером сын слышит разговор и спрашивает, будет ли его забирать
// другой человек и знает ли тот его имя. Мама откладывает телефон: до
// поездок нужно познакомиться и всё обсудить, ему тоже. Мальчик сам
// рассказывает про третий «Б» и выход у спортивного зала, папа записывает.
// Родители сами находят BalaGo, читают об Адилете и оставляют
// ПРЕДВАРИТЕЛЬНУЮ заявку; в блокноте — вопросы для разговора. Сын приносит
// машинку: можно ли взять её с собой? Папа добавляет вопрос в список.
// Утром в школу сына везёт папа; у ворот поправляет лямку рюкзака. Сын
// хочет сам назвать своё имя при знакомстве. Затем — контактная карточка.
// BalaGo в истории не приезжает и ничего не подтверждает.
//
// Длительность не задана заранее: сцены вытягиваются по фактической речи
// (layoutTimeline), контактная карточка — ровно последние 150 кадров.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const KM2_VIDEO = {
  id: "BalaGoKnowsMyName2D",
  output: "balago-30-knows-my-name-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/knows-my-name-2d",
} as const;

// Контактная карточка — ровно 5 с (150 кадров) в конце ролика:
// кадры [frames − 150, frames).
export const KM2_CONTACT_FRAMES = 150;

// ---------- Сцены ----------
export type Km2SceneId =
  | "hook"
  | "work"
  | "nanny"
  | "evening"
  | "phoneDown"
  | "thirdB"
  | "balago"
  | "request"
  | "toyCar"
  | "morning"
  | "introduce"
  | "entrance"
  | "contact";

// tail — время после конца последней реплики (действие, реакция, переход);
// min — нижняя граница длительности сцены (с).
export type Km2SceneSpec = {
  readonly id: Km2SceneId;
  readonly title: string;
  readonly tail: number;
  readonly min: number;
};

export const KM2_SCENE_SPECS: readonly Km2SceneSpec[] = [
  { id: "hook", title: "1. Тизмеде жок суроо", tail: 1.6, min: 8 },
  { id: "work", title: "2. Машина бар, убакыт изделет", tail: 1.6, min: 11 },
  { id: "nanny", title: "3. Үйдө тосуп алган киши бар", tail: 1.4, min: 9.5 },
  { id: "evening", title: "4. Кечки издөө", tail: 0.9, min: 12 },
  { id: "phoneDown", title: "5. Апасы телефонду коёт", tail: 1.6, min: 8 },
  { id: "thirdB", title: "6. Үчүнчү «Б» жана башка эшик", tail: 3.2, min: 10 },
  { id: "balago", title: "7. BalaGo'ну табышат", tail: 1.2, min: 15 },
  { id: "request", title: "8. Алдын ала өтүнмө жана суроолор", tail: 1.8, min: 12 },
  { id: "toyCar", title: "9. Дагы бир маанилүү суроо", tail: 2.6, min: 10 },
  { id: "morning", title: "10. Эртеси эртең менен", tail: 2.4, min: 9 },
  { id: "introduce", title: "11. Атымды өзүм айтсам болобу?", tail: 1.6, min: 10 },
  { id: "entrance", title: "12. Мектептин эшиги", tail: 0, min: 4.4 },
  { id: "contact", title: "13. Байланыш", tail: 0, min: KM2_CONTACT_FRAMES / 30 },
];

// ---------- Голоса ----------
// N — рассказчик, K — мальчик, M — мама, F — папа.
export type Km2Role = "narrator" | "boy" | "mother" | "father";

export const KM2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 301,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Сохранённые кыргызские голоса проекта (ElevenLabs Voice Design):
//   narrator — KG-teacher, спокойный взрослый рассказчик (женский голос,
//              отличим и от мамы, и от папы);
//   mother   — KG-mother, естественный тёплый женский голос;
//   father   — KG-husband, спокойный мужской голос;
//   boy      — выбирается пробами (scripts/km2d-voice-probe.mjs). Пока голос
//              не вписан сюда (пустой voiceId), он берётся из
//              voice-samples/knows-my-name-2d/probe/report.json (picked).
export const KM2_VOICES: Record<Km2Role, { readonly name: string; readonly voiceId: string }> = {
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  boy: { name: "", voiceId: "" },
};

// ---------- Реплики ----------
// text — как звучит и как показывается в субтитрах; spoken — что уходит в
// TTS, если отличается (BalaGo → «БалаГо», IT → «ай-ти», «Б» → «бэ», без
// кавычек и тире); tag — аудиотег eleven_v3 (не звучит, в субтитры не
// попадает).
export type Km2Line = {
  readonly id: string;
  readonly role: Km2Role;
  readonly text: string;
  readonly spoken?: string;
  readonly tag?: string;
  readonly seed?: number;
  readonly note: string; // режиссёрское пояснение (не озвучивается)
};

export const KM2_LINES: readonly Km2Line[] = [
  {
    id: "N01",
    role: "narrator",
    text: "Ата-энеси даректи, убакытты, каттамды талкуулап жатышты. Уулунун суроосу башкача болду.",
    tag: "[curious]",
    note: "с лёгким интересом, без рекламного напора",
  },
  {
    id: "K01",
    role: "boy",
    text: "Ал менин атымды билеби?",
    note: "тихо и прямо; любопытство и лёгкая неуверенность, без паники",
  },
  {
    id: "N02",
    role: "narrator",
    text: "Апасы компанияда бөлүм жетектейт. Атасы IT тармагында иштейт. Машинасы бар. Бирок мектептен кийин уулун алып келүү үчүн жумуштагы жолугушуулардын арасынан убакыт табышат.",
    spoken:
      "Апасы компанияда бөлүм жетектейт. Атасы ай-ти тармагында иштейт. Машинасы бар. Бирок мектептен кийин уулун алып келүү үчүн жумуштагы жолугушуулардын арасынан убакыт табышат.",
    note: "деловито, спокойно",
  },
  {
    id: "N03",
    role: "narrator",
    text: "Үйдө уулун нянясы тосуп ала алат. Ал кичинекей карындашын да карайт. Кыйынчылык — баланы күн сайын мектептен алып, үйгө жеткирүүдө.",
    spoken:
      "Үйдө уулун нянясы тосуп ала алат. Ал кичинекей карындашын да карайт. Кыйынчылык, баланы күн сайын мектептен алып, үйгө жеткирүүдө.",
    note: "спокойно, ясно",
  },
  {
    id: "N04",
    role: "narrator",
    text: "Кечинде ата-эне мектептен үйгө жеткирүүнүн жолун издеди. Уулу алардын сөзүн угуп калды.",
    note: "мягко",
  },
  {
    id: "K02",
    role: "boy",
    text: "Эми мени башка киши алып кетеби?",
    note: "без паники, вопросительно",
  },
  {
    id: "F01",
    role: "father",
    text: "Биз азырынча муну кантип уюштурса болорун карап жатабыз.",
    note: "спокойно, повернувшись к сыну",
  },
  {
    id: "M01",
    role: "mother",
    text: "Жолго чыгардан мурда таанышып, баарын сүйлөшөбүз. Сен да таанышасың.",
    tag: "[gently]",
    note: "спокойно и тепло, без назидания",
  },
  {
    id: "K03",
    role: "boy",
    text: "Анда мен үчүнчү «Б» класста окуйм деп айткыла. Спорт залда сабак болгондо, биз башка эшиктен чыгабыз.",
    spoken: "Анда мен үчүнчү бэ класста окуйм деп айткыла. Спорт залда сабак болгондо, биз башка эшиктен чыгабыз.",
    note: "с готовностью объясняет знакомую деталь, не тараторит",
  },
  {
    id: "N05",
    role: "narrator",
    text: "Ата-энеси BalaGo тууралуу маалымат тапты. Адилет беш миңден ашык сапар жасаган. Балдар менен иштеп, аларга араб тилин үйрөткөн.",
    spoken:
      "Ата-энеси БалаГо тууралуу маалымат тапты. Адилет беш миңден ашык сапар жасаган. Балдар менен иштеп, аларга араб тилин үйрөткөн.",
    note: "ровно, без рекламной интонации",
  },
  {
    id: "M02",
    role: "mother",
    text: "Аны менен сүйлөшкүм келет. Биздин каттамды, баланы мектептен кантип тосуп аларын тактап алалы.",
    note: "взрослый осмысленный выбор",
  },
  {
    id: "N06",
    role: "narrator",
    text: "Алар алдын ала өтүнмө калтырышты. Блокнотко сабактын убактысын, кайсы эшиктен чыгарын, үйдө ким тосуп аларын жана сапарга чейин таанышууну жазышты.",
    note: "сопровождает действия, ровный ритм перечисления",
  },
  {
    id: "K04",
    role: "boy",
    text: "Дагы сурагылачы, машинкамды кошо алсам болобу?",
    seed: 360,
    note: "чуть оживлённее; личный маленький вопрос, не каприз",
  },
  {
    id: "N07",
    role: "narrator",
    text: "Атасы бул суроону да тизмеге кошту.",
    tag: "[warmly]",
    note: "тепло",
  },
  {
    id: "N08",
    role: "narrator",
    text: "Эртеси уулун мектепке атасы өзү жеткирди. Дарбазанын жанында рюкзагын түздөп берди.",
    note: "светло, спокойно",
  },
  {
    id: "K05",
    role: "boy",
    text: "Таанышканда, атымды өзүм айтсам болобу?",
    seed: 340,
    note: "самостоятельность и лёгкая улыбка; завершённый вопрос",
  },
  {
    id: "F02",
    role: "father",
    text: "Албетте. Машинкаң тууралуу да айтып бересиң.",
    tag: "[warmly]",
    note: "уверенно и тепло, без торжественности",
  },
  {
    id: "N09",
    role: "narrator",
    text: "BalaGo. Балдар үчүн такси.",
    spoken: "БалаГо. Балдар үчүн такси.",
    note: "только на контактной карточке, спокойно",
  },
];

// ---------- Речевые сегменты на шкале ----------
// mode: narration — закадровый текст (рты закрыты); live — живая речь в кадре.
// gap — пауза перед репликой: от начала сцены (первая реплика сцены) или
// от конца предыдущей реплики той же сцены. В паузах — действие.
export type Km2Mode = "narration" | "live";
export type Km2SegSpec = {
  readonly id: string;
  readonly scene: Km2SceneId;
  readonly gap: number;
  readonly action: string; // связанное действие (для таблицы реплик)
};

export const KM2_SEG_SPECS: readonly Km2SegSpec[] = [
  { id: "N01", scene: "hook", gap: 0.5, action: "телефон «Мектеп → Үй», ручка дописывает «Каттам»; камера к сыну" },
  { id: "K01", scene: "hook", gap: 0.7, action: "сын у края стола спрашивает; мама поднимает взгляд от телефона" },
  { id: "N02", scene: "work", gap: 1.3, action: "мама обсуждает документ с коллегой; папа за ноутбуком переносит запись" },
  { id: "N03", scene: "nanny", gap: 0.7, action: "няня и сестрёнка с кубиками; мальчик входит, вешает рюкзак, няня машет" },
  { id: "N04", scene: "evening", gap: 1.0, action: "«Кечинде»: тот же стол, поиск «Мектептен үйгө жеткирүү»; сын подходит" },
  { id: "K02", scene: "evening", gap: 0.6, action: "сын спрашивает у края стола" },
  { id: "F01", scene: "evening", gap: 0.7, action: "папа переводит взгляд, поворачивается к сыну, отвечает" },
  { id: "M01", scene: "phoneDown", gap: 2.4, action: "тот же план вопроса; мама кладёт телефон экраном вниз, отвечает" },
  { id: "K03", scene: "thirdB", gap: 1.3, action: "папа готовит ручку; сын объясняет, показывает дверь на рисунке" },
  { id: "N05", scene: "balago", gap: 1.2, action: "мама берёт тот же телефон: поиск → BalaGo → Адилет; папа наклоняется" },
  { id: "M02", scene: "balago", gap: 0.8, action: "мама поворачивается от телефона к папе" },
  { id: "N06", scene: "request", gap: 0.8, action: "форма заявки → нажатие → «жөнөтүлдү»; строки вопросов в блокноте" },
  { id: "K04", scene: "toyCar", gap: 2.6, action: "сын берёт машинку с полки, приносит, показывает" },
  { id: "N07", scene: "toyCar", gap: 0.7, action: "папа записывает «Машинкасын алса болобу?»; мама улыбается" },
  { id: "N08", scene: "morning", gap: 1.6, action: "«Эртеси эртең менен»: машина семьи у школы; папа поправляет лямку" },
  { id: "K05", scene: "introduce", gap: 1.4, action: "крупно сын: думает, улыбается, спрашивает" },
  { id: "F02", scene: "introduce", gap: 0.7, action: "папа на уровне сына отвечает; сын кивает" },
  { id: "N09", scene: "contact", gap: 0.6, action: "контактная карточка BalaGo" },
];

export const modeOf = (lineId: string): Km2Mode => (lineId.startsWith("N") ? "narration" : "live");

export const lineById = (id: string) => {
  const l = KM2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Раскладка шкалы по фактической длительности речи ----------
export type Km2SceneSpan = {
  readonly id: Km2SceneId;
  readonly title: string;
  readonly from: number;
  readonly to: number;
}; // кадры
export type Km2SegAt = {
  readonly id: string;
  readonly scene: Km2SceneId;
  readonly at: number;
  readonly end: number;
};
export type Km2Layout = {
  readonly scenes: readonly Km2SceneSpan[];
  readonly segments: readonly Km2SegAt[];
  readonly frames: number;
  readonly contactFrom: number; // кадр
};

export const layoutTimeline = (speech: (id: string) => number): Km2Layout => {
  const fps = KM2_VIDEO.fps;
  const scenes: Km2SceneSpan[] = [];
  const segments: Km2SegAt[] = [];
  let frame = 0;
  for (const sc of KM2_SCENE_SPECS) {
    const start = frame / fps;
    let t = start;
    let first = true;
    for (const sg of KM2_SEG_SPECS.filter((x) => x.scene === sc.id)) {
      const at = Math.round((first ? start + sg.gap : t + sg.gap) * 1000) / 1000;
      const end = at + speech(sg.id);
      segments.push({ id: sg.id, scene: sc.id, at, end });
      t = end;
      first = false;
    }
    const need = first ? sc.min : Math.max(sc.min, t - start + sc.tail);
    const len = sc.id === "contact" ? KM2_CONTACT_FRAMES : Math.ceil(need * fps);
    scenes.push({ id: sc.id, title: sc.title, from: frame, to: frame + len });
    frame += len;
  }
  return { scenes, segments, frames: frame, contactFrom: frame - KM2_CONTACT_FRAMES };
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
export const KM2_TEXT = {
  brand: "BalaGo",
  tagline: "Балдар үчүн такси",
  // подписи времени
  earlier: "Ошол күнү эртерээк",
  evening: "Кечинде",
  nextMorning: "Эртеси эртең менен",
  // начало: телефон и блокнот на столе
  route: { from: "Мектеп", to: "Үй" },
  notePlan: ["Дарек", "Убакыт", "Каттам"],
  // рабочие эпизоды
  doc: { title: "Бөлүмдүн планы", rows: ["1. Максаттар", "2. Мөөнөттөр", "3. Жоопкерлер"] },
  calendar: { meeting: "Жолугушуу", pickup: "Мектептен алуу", time1: "15:00", time2: "16:00" },
  // поиск родителей
  search: { query: "Мектептен үйгө жеткирүү", hint: "Издөө" },
  // записи папы после слов сына
  noteSchool: ["3 «Б»", "Спорт залдын чыгышы"],
  // школа (схема и вывески)
  school: { main: "Негизги кире бериш", gym: "Спорт зал", gymExit: "Спорт залдын чыгышы", sign: "Мектеп" },
  // страница BalaGo (только известные сведения)
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    name: "Адилет",
    facts: ["5000+ сапар", "Балдар менен иштөө тажрыйбасы", "Балдарга араб тилин окуткан"],
    cta: "Алдын ала өтүнмө",
  },
  // постановочный экран предварительной заявки (без персональных данных)
  form: {
    title: "Алдын ала өтүнмө",
    fields: [
      ["Каттам", "Мектеп → Үй"],
      ["Баланын классы", "3 «Б»"],
      ["Эскертүү", "Адегенде таанышып, сүйлөшөлү"],
    ],
    send: "Өтүнмө жөнөтүү",
    sent: "Алдын ала өтүнмө жөнөтүлдү",
  },
  // вопросы в блокноте (без галочек — это вопросы для разговора)
  questions: ["Сабактын убактысы", "Мектептеги чыгыш", "Үйдө ким тосуп алат?", "Сапарга чейин таанышуу"],
  carQuestion: "Машинкасын алса болобу?",
  // контактная карточка — последние 5 с
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    whatsappLabel: "WhatsApp:",
    phone: "0998 08 38 28",
    link: "Маалымат жана алдын ала каттоо — профилдеги шилтемеде",
  },
} as const;
