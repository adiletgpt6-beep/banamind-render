// Ролик BalaGoTwentyFiveEnvelopes2D — «Двадцать пять конвертов» (сценарий
// №29). Экранное название не показывается: история начинается сразу с
// конверта «Эмир» на детском столе.
//
// Мама находит у сына (Аян, 9–10 лет) двадцать пять конвертов с именами
// одноклассников. Несколько недель назад папин офис переехал в другой район,
// мама тоже работает в офисе; за ужином родители обсуждали школу ближе к
// дому — только как вариант. Аян решил, что уже прощается, и написал всем
// благодарности. Мама слушает, что для него важно (друг по парте,
// учительница, команда проекта), родители сначала изучают регулярные
// поездки в нынешнюю школу, сами находят BalaGo и отправляют
// ПРЕДВАРИТЕЛЬНУЮ заявку для обсуждения маршрута (без водителя, оплаты,
// тарифа и подтверждённого маршрута). В финале та же записка «Эмир»
// получает новую строку — обещание на завтра.
//
// Длительность не задана заранее: сцены вытягиваются по фактической речи
// (layoutTimeline), контактная карточка — ровно последние 150 кадров.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const TE2_VIDEO = {
  id: "BalaGoTwentyFiveEnvelopes2D",
  output: "balago-29-twenty-five-envelopes-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/twenty-five-envelopes-2d",
} as const;

// Контактная карточка — ровно 5 с (150 кадров) в конце ролика.
export const TE2_CONTACT_FRAMES = 150;

// ---------- Сцены ----------
export type Te2SceneId =
  | "names"
  | "memory"
  | "office"
  | "days"
  | "dinner"
  | "note"
  | "heard"
  | "sit"
  | "people"
  | "calendars"
  | "search"
  | "form"
  | "box"
  | "promise"
  | "contact";

// tail — время после конца последней реплики сцены (действие, реакция,
// переход); min — нижняя граница длительности сцены.
export type Te2SceneSpec = {
  readonly id: Te2SceneId;
  readonly title: string;
  readonly tail: number;
  readonly min: number;
};

export const TE2_SCENE_SPECS: readonly Te2SceneSpec[] = [
  { id: "names", title: "1. Жыйырма беш ат", tail: 1.0, min: 9 },
  { id: "memory", title: "2. Бул — эстеликке", tail: 2.4, min: 8 },
  { id: "office", title: "3. Кеңсе көчтү", tail: 1.6, min: 11 },
  { id: "days", title: "4. Күндөрдү алмаштыруу", tail: 1.4, min: 10 },
  { id: "dinner", title: "5. Үйгө жакын мектеп", tail: 2.4, min: 10 },
  { id: "note", title: "6. Чакыруу эмес, ыраазычылык", tail: 6.8, min: 12 },
  { id: "heard", title: "7. Ал эмнени уккан", tail: 2.8, min: 10 },
  { id: "sit", title: "8. Апасы жанына отурат", tail: 1.0, min: 7 },
  { id: "people", title: "9. Мектеп — бул адамдар", tail: 1.8, min: 12 },
  { id: "calendars", title: "10. Адегенде жолду карашат", tail: 1.2, min: 10 },
  { id: "search", title: "11. BalaGo", tail: 1.4, min: 8 },
  { id: "form", title: "12. Алдын ала өтүнмө", tail: 2.3, min: 7 },
  { id: "box", title: "13. Конверттер кутуда", tail: 11.5, min: 13 },
  { id: "promise", title: "14. Ооба, ал көптөн бери сураган", tail: 1.5, min: 7 },
  { id: "contact", title: "15. Байланыш", tail: 0, min: TE2_CONTACT_FRAMES / 30 },
];

// ---------- Голоса ----------
export type Te2Role = "narrator" | "mother" | "son";

export const TE2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 291,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Сохранённые кыргызские голоса проекта (ElevenLabs), новые не создаются.
// Выбраны пробами до массовой генерации (scripts/te2d-voice-probe.mjs →
// voice-samples/twenty-five-envelopes-2d/probe/report.json; замер Meta MMS,
// F0 и профиль голоса — не прослушивание):
//   narrator — KG-husband: тёплый уверенный мужской голос (F0 ≈ 107 Гц),
//              N01 распознан с CER 0,7 %, «жыйырма беш» — верно; KG-teacher
//              дал «2ыйырма» (2,2 %). Мужской рассказчик ясно отличается от
//              мамы; папа в фильме не говорит, рот у него закрыт;
//   mother   — KG-mother: M01 2,9 %, M04 1,2 %;
//   son      — KG-son v7 remix-2: C01/C02/C06 — 5,9/8,2/7,5 % (у KG-boy
//              a2-3 — 17,6/13,7/10 %, «эстеликке» → «эсилике»). Детских
//              голосов ElevenLabs Voice Design не создаёт; это светлый голос
//              актрисы озвучания (профиль — взрослая женщина), темп и высота
//              тона не меняются.
export const TE2_VOICES: Record<Te2Role, { readonly name: string; readonly voiceId: string }> = {
  narrator: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  son: { name: "KG-son v7 remix-2", voiceId: "1c81DEBcmaJMj1QDHWU6" },
};

// Кандидаты проб (голоса проекта).
export const TE2_VOICE_CANDIDATES = {
  narrator: [
    { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
    { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
  ],
  mother: [{ name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" }],
  son: [
    { name: "KG-boy a2-3", voiceId: "8QMDSJuOqCscZvQ6PqlL" },
    { name: "KG-son v7 remix-2", voiceId: "1c81DEBcmaJMj1QDHWU6" },
  ],
} as const;

// ---------- Реплики ----------
// text — как звучит и как показывается в субтитрах; spoken — что уходит в
// TTS, если отличается (BalaGo → «БалаГо»); tag — аудиотег eleven_v3 (не
// звучит, в субтитры не попадает).
export type Te2Mode = "narration" | "dialogue" | "quoted-reading";
export type Te2Line = {
  readonly id: string;
  readonly role: Te2Role;
  readonly text: string;
  readonly spoken?: string;
  readonly tag?: string;
  readonly seed?: number;
  readonly note: string; // режиссёрское пояснение (не озвучивается)
};

// Правка сценария до генерации: в M02 «…бир партада отурган мага жакчу» →
// «…отурганым мага жакчу» (причастию нужен притяжательный аффикс:
// «мне нравилось [то, что я] сидел»); смысл тот же.
export const TE2_LINES: readonly Te2Line[] = [
  {
    id: "N01",
    role: "narrator",
    text: "Апасы уулунун бөлмөсүнөн жыйырма беш конверт тапты. Ар биринде классташынын аты жазылган. Ал эми жакынкы майрамга дагы бир нече ай бар эле.",
    tag: "[curious]",
    note: "любопытство без тревожного нажима",
  },
  { id: "M01", role: "mother", text: "Баарын бир жакка чакырып жатасыңбы?", tag: "[curious]", note: "обычный вопрос с лёгким удивлением" },
  { id: "C01", role: "son", text: "Жок. Бул — эстеликке.", note: "спокойно, короткая пауза после первого слова" },
  {
    id: "N02",
    role: "narrator",
    text: "Бир нече жума мурун атасынын кеңсеси башка районго көчкөн. Ошондон бери мектепке барып-келүү анын жумуш күнүн кыйла узартчу.",
    note: "спокойно, по делу",
  },
  {
    id: "N03",
    role: "narrator",
    text: "Апасы да кеңседе иштейт. Алар күндөрдү алмаштырып, жолугушууларды жылдырып, эртерээк чыгууга аракет кылышты. Бирок баарын күн сайын айкалыштыруу кыйын болду.",
    note: "спокойно, с пониманием",
  },
  {
    id: "N04",
    role: "narrator",
    text: "Кечки тамакта үйгө жакыныраак мектеп тууралуу сүйлөшүшчү. Маалыматын окуп, сабактары жөнүндө сурашты. Азырынча бул — карап жаткан вариант эле.",
    note: "без драмы, вариант",
  },
  {
    id: "M02",
    role: "mother",
    text: "Математикадан жардам бергениң үчүн рахмат. Сени менен бир партада отурганым мага жакчу.",
    tag: "[softly]",
    note: "тихо читает записку, без рекламной интонации",
  },
  { id: "M03", role: "mother", text: "Сен азыркы мектебиңден кетем деп ойлодуңбу?", tag: "[gently]", note: "мягко уточняет" },
  { id: "C02", role: "son", text: "Башка мектеп жөнүндө сүйлөшкөнсүңөр да. Баарына рахмат айтып калайын дегем.", note: "искренне, без обвинения" },
  {
    id: "M04",
    role: "mother",
    text: "Биз азырынча кандай кылсак болорун карап жатабыз. Сага эмне маанилүү экенин айтып берчи.",
    tag: "[warmly]",
    note: "садится рядом, даёт место ответу",
  },
  { id: "C03", role: "son", text: "Бир партада отурган досум...", tag: "[thoughtfully]", note: "начинает перечислять, пауза после мысли" },
  { id: "C04", role: "son", text: "Алгачкы жолу эл алдына чыкканымда колдогон мугалимим...", tag: "[warmly]", note: "тот же голос, с теплом" },
  { id: "C05", role: "son", text: "Анан чогуу мектеп долбоорун даярдап жаткан командам...", note: "интерес к общему делу" },
  {
    id: "N05",
    role: "narrator",
    text: "Кечинде ата-энеси календарларын кайра ачышты. Жанына сабактардын жадыбалын коюшту. Адегенде азыркы мектепке үзгүлтүксүз барып-келүүнүн жолдорун карап көрүүнү чечишти.",
    note: "спокойно, поворот",
  },
  {
    id: "N06",
    role: "narrator",
    text: "Мектепке алып баруу жана үйгө жеткирүү жолдорун издеп, BalaGo долбоорун табышты. Кызмат тууралуу маалыматты чогуу окушту.",
    spoken: "Мектепке алып баруу жана үйгө жеткирүү жолдорун издеп, БалаГо долбоорун табышты. Кызмат тууралуу маалыматты чогуу окушту.",
    note: "описывает уже видимые действия",
  },
  {
    id: "N07",
    role: "narrator",
    text: "Дареги менен мектебин көрсөтүп, мүмкүн болгон маршрутту талкуулоо үчүн алдын ала өтүнмө жөнөтүштү.",
    note: "спокойно",
  },
  { id: "N08", role: "narrator", text: "Кийин апасы уулунун бөлмөсүнө кирди.", tag: "[softly]", note: "короткая связка к финалу" },
  { id: "M05", role: "mother", text: "Муну баары бир бересиңби?", tag: "[warmly]", note: "мягкая улыбка, с интересом" },
  { id: "C06", role: "son", text: "Ооба. Ал көптөн бери көргүсү келип жүргөн.", tag: "[happily]", note: "легко и уверенно" },
  { id: "N09", role: "narrator", text: "BalaGo — балдар үчүн такси.", spoken: "БалаГо — балдар үчүн такси.", note: "коротко и спокойно" },
];

// ---------- Речевые сегменты на шкале ----------
// gap — пауза перед репликой: от начала сцены (первая реплика сцены) или
// от конца предыдущей реплики той же сцены. В паузах — действие.
export type Te2SegSpec = {
  readonly id: string;
  readonly scene: Te2SceneId;
  readonly gap: number;
  readonly mode: Te2Mode;
  readonly action: string; // связанное действие (для таблицы реплик)
};

export const TE2_SEG_SPECS: readonly Te2SegSpec[] = [
  { id: "N01", scene: "names", gap: 0.7, mode: "narration", action: "конверт «Эмир» крупно → рука мамы → отъезд: 5×5 конвертов, календарь будней, Аян закрывает клапан" },
  { id: "M01", scene: "memory", gap: 1.5, mode: "dialogue", action: "мама берёт «Эмир» за край и поднимает" },
  { id: "C01", scene: "memory", gap: 0.9, mode: "dialogue", action: "Аян качает головой, смотрит на конверт; мама удивлена, конверт возвращается на стол" },
  { id: "N02", scene: "office", gap: 1.5, mode: "narration", action: "«Бир нече жума мурун»; папа ставит коробку в новом офисе; схема Үй — Мектеп — Кеңсе; папа у списка встреч" },
  { id: "N03", scene: "days", gap: 0.6, mode: "narration", action: "мама с ноутбуком в офисе; вечером переносят карточку встречи; папа закрывает папку раньше; 13:00 · Сабак бүтөт / Жолугушуу" },
  { id: "N04", scene: "dinner", gap: 1.2, mode: "narration", action: "ужин: родители смотрят «Үйгө жакын мектеп»; Аян смотрит на родителей, затем на значок рюкзака" },
  { id: "M02", scene: "note", gap: 3.4, mode: "quoted-reading", action: "мама открывает клапан «Эмир», достаёт записку и тихо читает" },
  { id: "M03", scene: "heard", gap: 1.4, mode: "dialogue", action: "мама кладёт рисунок, смотрит на сына" },
  { id: "C02", scene: "heard", gap: 1.1, mode: "dialogue", action: "Аян переводит взгляд с конвертов на маму, чуть поднимает плечи" },
  { id: "M04", scene: "sit", gap: 2.6, mode: "dialogue", action: "мама подвигает стул и садится рядом, глаза на уровне сына" },
  { id: "C03", scene: "people", gap: 0.9, mode: "dialogue", action: "за кадром: Эмир показывает строку задачи, Аян дописывает решение" },
  { id: "C04", scene: "people", gap: 1.6, mode: "dialogue", action: "за кадром: первое выступление, учительница кивает, Аян расправляет плечи" },
  { id: "C05", scene: "people", gap: 1.6, mode: "dialogue", action: "за кадром: команда собирает макет, Аян передаёт деталь" },
  { id: "N05", scene: "calendars", gap: 0.9, mode: "narration", action: "два календаря и расписание уроков; пальцы на 13:00 и на встрече" },
  { id: "N06", scene: "search", gap: 0.8, mode: "narration", action: "поиск «Бишкек балдар үчүн такси» → BalaGo → страница; родители читают" },
  { id: "N07", scene: "form", gap: 0.5, mode: "narration", action: "форма: дарек, мектеп, маршрут → «Жөнөтүү» → «Өтүнмө жөнөтүлдү»" },
  { id: "N08", scene: "box", gap: 0.6, mode: "narration", action: "мама у двери; Аян складывает 24 конверта в коробку, достаёт записку «Эмир», дописывает строку" },
  { id: "M05", scene: "promise", gap: 1.0, mode: "dialogue", action: "мама замечает записку, улыбается" },
  { id: "C06", scene: "promise", gap: 0.8, mode: "dialogue", action: "Аян поднимает голову, придвигает комикс к записке" },
  { id: "N09", scene: "contact", gap: 0.6, mode: "narration", action: "контактная карточка BalaGo" },
];

export const modeOf = (lineId: string): Te2Mode => TE2_SEG_SPECS.find((s) => s.id === lineId)?.mode ?? "dialogue";

export const lineById = (id: string) => {
  const l = TE2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Раскладка шкалы по фактической длительности речи ----------
export type Te2SceneSpan = { readonly id: Te2SceneId; readonly title: string; readonly from: number; readonly to: number }; // кадры
export type Te2SegAt = { readonly id: string; readonly scene: Te2SceneId; readonly at: number; readonly end: number };
export type Te2Layout = {
  readonly scenes: readonly Te2SceneSpan[];
  readonly segments: readonly Te2SegAt[];
  readonly frames: number;
  readonly contactFrom: number; // кадр
};

export const layoutTimeline = (speech: (id: string) => number): Te2Layout => {
  const fps = TE2_VIDEO.fps;
  const scenes: Te2SceneSpan[] = [];
  const segments: Te2SegAt[] = [];
  let frame = 0;
  for (const sc of TE2_SCENE_SPECS) {
    const start = frame / fps;
    let t = start;
    let first = true;
    for (const sg of TE2_SEG_SPECS.filter((x) => x.scene === sc.id)) {
      const at = Math.round((first ? start + sg.gap : t + sg.gap) * 1000) / 1000;
      const end = at + speech(sg.id);
      segments.push({ id: sg.id, scene: sc.id, at, end });
      t = end;
      first = false;
    }
    const need = first ? sc.min : Math.max(sc.min, t - start + sc.tail);
    const len = sc.id === "contact" ? TE2_CONTACT_FRAMES : Math.ceil(need * fps);
    scenes.push({ id: sc.id, title: sc.title, from: frame, to: frame + len });
    frame += len;
  }
  return { scenes, segments, frames: frame, contactFrom: frame - TE2_CONTACT_FRAMES };
};

// Оценка длительности речи по тексту (≈ 13 букв/с, паузы на знаках) —
// только до генерации озвучки (превью в Studio).
export const estimateSpeech = (id: string) => {
  const l = lineById(id);
  const text = l.spoken ?? l.text;
  const letters = [...text].filter((c) => /\p{L}/u.test(c)).length;
  const marks = (text.match(/[.,!?—]/g) ?? []).length;
  return letters / 13 + marks * 0.25;
};

// ---------- Двадцать пять конвертов (единственный источник) ----------
// Ровно 25 писем одноклассникам; Аяна в списке нет. Раскладка на столе —
// 5 рядов по 5 (row, col). ID постоянные.
export const ENVELOPE_NAMES = [
  "Эмир", "Бекзат", "Нурбек", "Тимур", "Азамат",
  "Адиль", "Данияр", "Ислам", "Рамазан", "Кубаныч",
  "Руслан", "Арсен", "Улан", "Эрмек", "Жоомарт",
  "Амина", "Айдана", "Нурайым", "Арууке", "Айлин",
  "Асия", "Айпери", "Сезим", "Бегимай", "Мээрим",
] as const;

export type Envelope = { readonly id: string; readonly name: string; readonly row: number; readonly col: number; readonly content: "note" | "drawing" };
export const ENVELOPES: readonly Envelope[] = ENVELOPE_NAMES.map((name, i) => ({
  id: `env-${String(i + 1).padStart(2, "0")}`,
  name,
  row: Math.floor(i / 5),
  col: i % 5,
  content: name === "Бекзат" ? "drawing" : "note",
}));
export const EMIR = ENVELOPES[0];
export const BEKZAT = ENVELOPES[1];

// Записка из «Эмир»: один лист. Исходный текст (две строки благодарности)
// и финальный — та же записка с новой третьей строкой.
export const NOTE = {
  lines: ["Математикадан жардам бергениң үчүн рахмат.", "Сени менен бир партада отурганым мага жакчу."],
  added: "Эртең сага жаңы комиксимди алып келем.",
} as const;

// Состояние стола по ходу фильма (для проверки и для сцен): сколько
// конвертов на столе, в руке, в коробке; где записка и рисунок.
export type DeskState = {
  readonly onDesk: number;
  readonly inHand: number;
  readonly inBox: number;
  readonly note: "in-envelope" | "in-hand" | "on-desk";
  readonly drawing: "in-envelope" | "in-hand" | "on-desk";
  readonly noteLines: number;
};
export const DESK_STATES: Readonly<Record<string, DeskState>> = {
  start: { onDesk: 25, inHand: 0, inBox: 0, note: "in-envelope", drawing: "in-envelope", noteLines: 2 },
  holdEmir: { onDesk: 24, inHand: 1, inBox: 0, note: "in-envelope", drawing: "in-envelope", noteLines: 2 },
  readNote: { onDesk: 24, inHand: 1, inBox: 0, note: "in-hand", drawing: "in-envelope", noteLines: 2 },
  holdBekzat: { onDesk: 24, inHand: 1, inBox: 0, note: "in-envelope", drawing: "in-envelope", noteLines: 2 },
  drawingOut: { onDesk: 25, inHand: 0, inBox: 0, note: "in-envelope", drawing: "on-desk", noteLines: 2 },
  afterTalk: { onDesk: 25, inHand: 0, inBox: 0, note: "in-envelope", drawing: "in-envelope", noteLines: 2 },
  final: { onDesk: 1, inHand: 0, inBox: 24, note: "on-desk", drawing: "in-envelope", noteLines: 3 },
};

// ---------- Экранные надписи (кыргызча) ----------
export const TE2_TEXT = {
  brand: "BalaGo",
  tagline: "Балдар үчүн такси",
  count: "25 конверт",
  before: "Бир нече жума мурун",
  // домашний календарь у стола: обычные будни (без праздников)
  homeCalendar: { month: "Октябрь", days: ["Дш", "Шш", "Шр", "Бш", "Жм", "Иш", "Жк"] },
  map: { home: "Үй", school: "Мектеп", office: "Кеңсе", oldOffice: "Мурунку кеңсе" },
  office: { meetings: "Жолугушуулар", items: ["09:30 · Пландоо", "13:00 · Жолугушуу", "16:00 · Кеңешме"] },
  // один пример расписания: уроки заканчиваются в 13:00, встреча в 13:00
  days: { lessonEnd: "13:00 · Сабак бүтөт", meeting: "13:00 · Жолугушуу", week: ["Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума"] },
  nearSchool: { title: "Үйгө жакын мектеп", lines: ["Сабактар: 08:00 – 13:00", "Ийримдер жана спорт", "Маалымат үчүн"] },
  schedule: { title: "Сабактардын жадыбалы", row: ["1. Математика", "2. Эне тил", "3. Окуу", "4. Музыка", "5. Дене тарбия"], end: "Сабак бүтөт: 13:00" },
  calendar: { dad: "Атасынын календары", mom: "Апасынын календары" },
  project: "Биздин шаар",
  search: { query: "Бишкек балдар үчүн такси", hint: "Издөө" },
  results: ["Шаардык транспорт", "Мектеп жаңылыктары"],
  page: { route: "Үй → Мектеп → Үй", cta: "Алдын ала каттоо", info: "Мектепке алып баруу жана үйгө жеткирүү" },
  form: {
    title: "Алдын ала каттоо",
    address: "Үйдүн дареги",
    addressDone: "Дарек киргизилди",
    school: "Мектеп",
    schoolDone: "Мектеп көрсөтүлдү",
    route: "Үй → Мектеп → Үй",
    send: "Жөнөтүү",
    sent: "Өтүнмө жөнөтүлдү",
    sentSub: "Маршрутту талкуулоо үчүн",
  },
  comic: "Менин комиксим",
  // Контактная карточка — последние 5 с.
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    whatsapp: "WhatsApp: 0998 08 38 28",
    link: "Маалымат жана алдын ала каттоо — профилдеги шилтемеде",
  },
  whatsappUrl: "https://wa.me/996998083828",
} as const;
