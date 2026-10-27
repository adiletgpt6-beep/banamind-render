// Ролик BalaGoChessTournament2D — «Она сказала, что больше не любит шахматы»,
// сценарий №27. Экранное название не показывается (история начинается сразу
// с события).
//
// Дочка (9–10 лет) отказалась от школьного шахматного турнира, а вечером папа
// застаёт её за доской: она снова и снова решает одну задачу. Причина
// раскрывается в разговоре у доски: дополнительные занятия заканчиваются в
// 15:00, у папы в это время встречи, у мамы — работа; она не хотела
// усложнять родителям день. Папа слушает, родители вместе сравнивают
// календари, сами находят BalaGo и оставляют предварительную заявку (без
// цен, водителя, оплаты и подтверждённого маршрута), мама пишет тренеру.
// Финал — новая позиция дочки и папа без пиджака напротив неё.
//
// Длительность не задана заранее: сцены вытягиваются по фактической речи
// (layoutTimeline), контактная карточка — ровно последние 150 кадров.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const CH2_VIDEO = {
  id: "BalaGoChessTournament2D",
  output: "balago-27-chess-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/chess-tournament-2d",
} as const;

// Контактная карточка — ровно 5 с (150 кадров) в конце ролика.
export const CH2_CONTACT_FRAMES = 150;

// ---------- Сцены ----------
export type Ch2SceneId =
  | "hook"
  | "club"
  | "offer"
  | "routine"
  | "time"
  | "message"
  | "dinner"
  | "light"
  | "reason"
  | "heard"
  | "calendars"
  | "search"
  | "coach"
  | "move"
  | "contact";

// tail — время после конца последней реплики (действие, реакция, переход);
// min — нижняя граница длительности сцены. Контактная карточка — ровно
// CH2_CONTACT_FRAMES кадров (с короткой репликой N09 внутри).
export type Ch2SceneSpec = {
  readonly id: Ch2SceneId;
  readonly title: string;
  readonly tail: number;
  readonly min: number;
};

export const CH2_SCENE_SPECS: readonly Ch2SceneSpec[] = [
  { id: "hook", title: "1. Баш тартуу жана такта", tail: 1.0, min: 8 },
  { id: "club", title: "2. Ал шахматты жакшы көрөт", tail: 1.5, min: 11 },
  { id: "offer", title: "3. Турнир", tail: 2.0, min: 9 },
  { id: "routine", title: "4. Кадимки күн", tail: 2.0, min: 11.5 },
  { id: "time", title: "5. Жаңы убакыт", tail: 2.9, min: 12 },
  { id: "message", title: "6. Машыктыруучунун билдирүүсү", tail: 1.8, min: 7 },
  { id: "dinner", title: "7. Кечки тамак", tail: 2.2, min: 8.5 },
  { id: "light", title: "8. Бөлмөдөгү жарык", tail: 5.6, min: 10 },
  { id: "reason", title: "9. Чыныгы себеп", tail: 1.8, min: 18 },
  { id: "heard", title: "10. Атасы угат", tail: 4.8, min: 10 },
  { id: "calendars", title: "11. Эки календарь, бир жадыбал", tail: 1.5, min: 9 },
  { id: "search", title: "12. BalaGo: алдын ала өтүнмө", tail: 2.6, min: 12 },
  { id: "coach", title: "13. Машыктыруучуга жазышат", tail: 4.3, min: 10 },
  { id: "move", title: "14. Ата, эми сенин жүрүшүң", tail: 8.2, min: 11 },
  { id: "contact", title: "15. Байланыш", tail: 0, min: CH2_CONTACT_FRAMES / 30 },
];

// ---------- Голоса ----------
export type Ch2Role = "narrator" | "father" | "daughter" | "mother";

export const CH2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 271,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Сохранённые кыргызские голоса проекта (ElevenLabs), новые не создаются:
//   narrator — KG-teacher: тёплый спокойный рассказчик (№12, №22);
//   father   — KG-husband: спокойный низкий мужской голос (F0 ≈ 110 Гц);
//   mother   — KG-mother: тёплый уверенный женский голос;
//   daughter — KG-daughter: голос девочки из №12; в пробах №26
//              (voice-samples/third-b-meeting-2d/probe/pick.json) слепая
//              оценка 4 из 4 — «ребёнок ≈ 9 лет», CER MMS 0,035, F0 ≈ 281 Гц
//              (заметно выше мамы). Детский голос не получается ускорением
//              взрослой записи: темп и высота тона не меняются.
export const CH2_VOICES: Record<Ch2Role, { readonly name: string; readonly voiceId: string }> = {
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  daughter: { name: "KG-daughter", voiceId: "AeboPz5CtE7qRUVvW93b" },
};

// ---------- Реплики ----------
// text — как звучит и как показывается в субтитрах; spoken — что уходит в
// TTS, если отличается (BalaGo → «БалаГо»); tag — аудиотег eleven_v3 (не
// звучит, в субтитры не попадает).
export type Ch2Line = {
  readonly id: string;
  readonly role: Ch2Role;
  readonly text: string;
  readonly spoken?: string;
  readonly tag?: string;
  readonly seed?: number;
  readonly note: string; // режиссёрское пояснение (не озвучивается)
};

export const CH2_LINES: readonly Ch2Line[] = [
  {
    id: "N01",
    role: "narrator",
    text: "Кызы турнирге катышуудан баш тартты. Бирок кечинде кайра эле шахмат маселесин чечип отурган.",
    tag: "[curious]",
    note: "с живым любопытством, без объяснения причины",
  },
  {
    id: "N02",
    role: "narrator",
    text: "Ал бир нече айдан бери мектептеги шахмат ийримине барып жүргөн. Жаңы жүрүштөрдү табууну, партияларды талдоону жакшы көрчү. Кээде атасын да жеңчү.",
    tag: "[warmly]",
    note: "тепло, с улыбкой на последней фразе",
  },
  {
    id: "N03",
    role: "narrator",
    text: "Машыктыруучу турнирге даярданууну сунуштады. Кошумча машыгуулар сабактан кийин өтүп, адаттагыдан кеч бүтмөк.",
    note: "спокойно, по делу",
  },
  {
    id: "N04",
    role: "narrator",
    text: "Атасы инженер, апасы бөлүм жетекчиси эле. Атасы түшкү тыныгууда кызын мектептен алып, чоң энесине жеткирип, кайра кеңсеге кайтчу.",
    note: "объясняет привычный день",
  },
  {
    id: "D01",
    role: "daughter",
    text: "Ата, машыгуу саат үчтө бүтөт экен. Мени ошондо алып кете аласыңбы?",
    tag: "[curious]",
    note: "заинтересованно, без заранее заданного огорчения",
  },
  {
    id: "F01",
    role: "father",
    text: "Үчтө дээрлик күн сайын жолугушууларым бар. Сени кантип алып кетерибизди ойлонуш керек.",
    tag: "[thoughtfully]",
    note: "спокойно, в поиске решения, без раздражения",
  },
  {
    id: "N05",
    role: "narrator",
    text: "Бир нече күндөн кийин машыктыруучу жазды: кызы турнирге катышпоону чечиптир.",
    note: "спокойно",
  },
  { id: "M01", role: "mother", text: "Кызым, турнирге катышпайм деп чечтиңби?", tag: "[gently]", note: "мягкий семейный вопрос" },
  { id: "D02", role: "daughter", text: "Мага эми шахмат анча жакпай калды.", tag: "[quietly]", note: "старается сказать обычно, чуть тише" },
  { id: "N06", role: "narrator", text: "Кечинде атасы кызын кайрадан шахмат тактасынын алдында көрдү.", tag: "[softly]", note: "тихо, тепло" },
  // F02: первый вариант (тег [warmly], seed 271) в готовом звуке распознаётся
  // как «күрсетеүсомге» — новые дубли без тега, другой seed.
  { id: "F02", role: "father", text: "Мага да көрсөтөсүңбү?", seed: 283, note: "с интересом, ясно произносит «көрсөтөсүңбү»" },
  { id: "F03", role: "father", text: "Турнирге катышкың келет, туурабы?", tag: "[gently]", note: "деликатно" },
  {
    id: "D03",
    role: "daughter",
    text: "Ооба. Бирок анда мени кечирээк алып кетиш керек болот. Сенин жолугушууларың бар дедиң. Апамдын да иши бар.",
    note: "спокойно и честно, без рыданий",
  },
  {
    id: "F04",
    role: "father",
    text: "Биз сени кантип алып кетерибизди ойлонуп жатканбыз. Машыгуулар канча жолу болорун айтып берчи.",
    tag: "[warmly]",
    note: "уверенно и доброжелательно",
  },
  { id: "M02", role: "mother", text: "Бул күндөрү экөөбүздүн жумушубуз кандай экенин карап көрөлү.", note: "деловито, вместе" },
  { id: "F05", role: "father", text: "Мектептен үйгө жеткирүүнүн башка жолдорун да карап көрөлү.", note: "спокойно, ищет варианты" },
  {
    id: "N07",
    role: "narrator",
    text: "Алар мектептен үйгө жеткирүүнүн жолдорун издеп, BalaGoну табышты. Кошумча сабактан кийинки маршрутту сүйлөшүү үчүн алдын ала өтүнмө калтырышты.",
    spoken: "Алар мектептен үйгө жеткирүүнүн жолдорун издеп, БалаГону табышты. Кошумча сабактан кийинки маршрутту сүйлөшүү үчүн алдын ала өтүнмө калтырышты.",
    note: "описывает уже происходящее",
  },
  { id: "N08", role: "narrator", text: "Апасы машыктыруучуга жазды: кызы катышкысы келет, эми жолду уюштурууну такташат.", note: "спокойно, светло" },
  { id: "D04", role: "daughter", text: "Бул маселени өзүм түздүм. Ата, эми сенин жүрүшүң.", tag: "[happily]", note: "с удовольствием и уверенностью" },
  { id: "N09", role: "narrator", text: "BalaGo — балдар үчүн такси.", spoken: "БалаГо — балдар үчүн такси.", note: "коротко и спокойно" },
];

// ---------- Речевые сегменты на шкале ----------
// mode: narration — закадровый текст (рты закрыты); live — живая речь в кадре.
// gap — пауза перед репликой: от начала сцены (первая реплика сцены) или
// от конца предыдущей реплики той же сцены. В паузах — действие.
export type Ch2Mode = "narration" | "live";
export type Ch2SegSpec = {
  readonly id: string;
  readonly scene: Ch2SceneId;
  readonly gap: number;
  readonly action: string; // связанное действие (для таблицы реплик)
};

export const CH2_SEG_SPECS: readonly Ch2SegSpec[] = [
  { id: "N01", scene: "hook", gap: 0.9, action: "сообщение тренера на телефоне → доска под лампой, рука берёт ферзя и возвращает, глаза" },
  { id: "N02", scene: "club", gap: 1.2, action: "«Бир нече күн мурун»; кружок, тетрадь, дома папа признаёт ход дочки" },
  { id: "N03", scene: "offer", gap: 0.7, action: "тренер кладёт расписание; «Аяктоо: 15:00»; девочка берёт лист" },
  { id: "N04", scene: "routine", gap: 0.5, action: "чертёж папы, совещание мамы, папа закрывает папку; машина; бабушка; папа снова за столом" },
  { id: "D01", scene: "time", gap: 1.2, action: "дочка показывает лист, указывает на 15:00" },
  { id: "F01", scene: "time", gap: 1.3, action: "папа открывает календарь: встречи в 15:00" },
  { id: "N05", scene: "message", gap: 1.6, action: "«Бир нече күндөн кийин»; телефон мамы, сообщение «Машыктыруучу»" },
  { id: "M01", scene: "dinner", gap: 1.2, action: "ужин, мама спрашивает" },
  { id: "D02", scene: "dinner", gap: 1.0, action: "дочка смотрит на ложку" },
  { id: "N06", scene: "light", gap: 1.0, action: "коридор, свет из комнаты, дочка у доски" },
  { id: "F02", scene: "reason", gap: 3.7, action: "папа подходит и садится напротив" },
  { id: "F03", scene: "reason", gap: 3.2, action: "тетрадь повернута к папе, думают вместе" },
  { id: "D03", scene: "reason", gap: 1.3, action: "кивает, затем смотрит на папу; папа слушает" },
  { id: "F04", scene: "heard", gap: 1.0, action: "папа чуть наклоняется к дочке" },
  { id: "M02", scene: "calendars", gap: 3.0, action: "папа приносит лист, кладёт между ними и садится рядом с мамой" },
  { id: "F05", scene: "calendars", gap: 2.6, action: "после двух календарей (15:00); мама открывает поиск, папа смотрит" },
  { id: "N07", scene: "search", gap: 0.8, action: "поиск → BalaGo → страница → форма → «Жөнөтүү» → «Өтүнмө жөнөтүлдү»" },
  { id: "N08", scene: "coach", gap: 0.8, action: "сообщение тренеру; вставка: дочка ставит ладью" },
  { id: "D04", scene: "move", gap: 2.4, action: "родители входят; новая позиция; приглашение" },
  { id: "N09", scene: "contact", gap: 0.7, action: "контактная карточка BalaGo" },
];

export const modeOf = (lineId: string): Ch2Mode => (lineId.startsWith("N") ? "narration" : "live");

export const lineById = (id: string) => {
  const l = CH2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Раскладка шкалы по фактической длительности речи ----------
export type Ch2SceneSpan = { readonly id: Ch2SceneId; readonly title: string; readonly from: number; readonly to: number }; // кадры
export type Ch2SegAt = { readonly id: string; readonly scene: Ch2SceneId; readonly at: number; readonly end: number };
export type Ch2Layout = {
  readonly scenes: readonly Ch2SceneSpan[];
  readonly segments: readonly Ch2SegAt[];
  readonly frames: number;
  readonly contactFrom: number; // кадр
};

export const layoutTimeline = (speech: (id: string) => number): Ch2Layout => {
  const fps = CH2_VIDEO.fps;
  const scenes: Ch2SceneSpan[] = [];
  const segments: Ch2SegAt[] = [];
  let frame = 0;
  for (const sc of CH2_SCENE_SPECS) {
    const start = frame / fps;
    let t = start;
    let first = true;
    for (const sg of CH2_SEG_SPECS.filter((x) => x.scene === sc.id)) {
      const at = Math.round((first ? start + sg.gap : t + sg.gap) * 1000) / 1000;
      const end = at + speech(sg.id);
      segments.push({ id: sg.id, scene: sc.id, at, end });
      t = end;
      first = false;
    }
    const need = first ? sc.min : Math.max(sc.min, t - start + sc.tail);
    const len = sc.id === "contact" ? CH2_CONTACT_FRAMES : Math.ceil(need * fps);
    scenes.push({ id: sc.id, title: sc.title, from: frame, to: frame + len });
    frame += len;
  }
  return { scenes, segments, frames: frame, contactFrom: frame - CH2_CONTACT_FRAMES };
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

// ---------- Шахматы ----------
// Клетка: файл 0…7 (a…h), ряд 0…7 (1…8). a1 — тёмная: (file + rank) чётно.
export type Sq = { readonly file: number; readonly rank: number };
export const sq = (name: string): Sq => ({ file: name.charCodeAt(0) - 97, rank: Number(name[1]) - 1 });
export const sqName = (s: Sq) => `${String.fromCharCode(97 + s.file)}${s.rank + 1}`;
export const isDark = (s: Sq) => (s.file + s.rank) % 2 === 0;

export type PieceKind = "K" | "Q" | "R" | "P";
export type Piece = { readonly id: string; readonly kind: PieceKind; readonly white: boolean; readonly at: string };

// Домашняя задача: белые Kg6, Qe7; чёрные Kh8; ход белых.
// FEN: 7k/4Q3/6K1/8/8/8/8/8 w - - 0 1. Один корректный завершающий ход —
// Qg7# (ферзь защищён королём g6). В фильме решение не объявляется.
export const POSITION_A = {
  fen: "7k/4Q3/6K1/8/8/8/8/8 w - - 0 1",
  pieces: [
    { id: "wK", kind: "K", white: true, at: "g6" },
    { id: "wQ", kind: "Q", white: true, at: "e7" },
    { id: "bK", kind: "K", white: false, at: "h8" },
  ] as readonly Piece[],
  // вариант, который дочка примеряет (ферзь e7 → f7 и обратно на e7)
  tryAt: "f7",
} as const;

// Новая задача дочки: белые Ka1; чёрные Kc2, Rc8; ход чёрных (папы).
// FEN: 2r5/8/8/8/8/8/2k5/K7 b - - 0 1. Один корректный ход — Ra8#.
// В финале папа только подносит руку к ладье (решение не раскрывается).
export const POSITION_B = {
  fen: "2r5/8/8/8/8/8/2k5/K7 b - - 0 1",
  pieces: [
    { id: "wK", kind: "K", white: true, at: "a1" },
    { id: "bK", kind: "K", white: false, at: "c2" },
    { id: "bR", kind: "R", white: false, at: "c8" },
  ] as readonly Piece[],
} as const;

// Учебная позиция в кружке (показывает её находку): белые Kg1, Ra1;
// чёрные Kg8, пешки f7 g7 h7; ход белых. FEN: 6k1/5ppp/8/8/8/8/8/R5K1 w.
// Дочка делает ход Ra1–a8# (мат по последней горизонтали) — настоящий ход.
export const CLUB_POSITION = {
  fen: "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
  pieces: [
    { id: "wK", kind: "K", white: true, at: "g1" },
    { id: "wR", kind: "R", white: true, at: "a1" },
    { id: "bK", kind: "K", white: false, at: "g8" },
    { id: "bf", kind: "P", white: false, at: "f7" },
    { id: "bg", kind: "P", white: false, at: "g7" },
    { id: "bh", kind: "P", white: false, at: "h7" },
  ] as readonly Piece[],
  move: { from: "a1", to: "a8" },
} as const;

// Дома «кээде атасын да жеңчү»: кадр сразу после её хода Rh1–h8#
// (до хода: белые Kb6, Rh1; чёрные Kb8 — FEN 1k6/8/1K6/8/8/8/8/7R w).
export const MEMORY_POSITION = {
  fenBefore: "1k6/8/1K6/8/8/8/8/7R w - - 0 1",
  pieces: [
    { id: "wK", kind: "K", white: true, at: "b6" },
    { id: "wR", kind: "R", white: true, at: "h8" },
    { id: "bK", kind: "K", white: false, at: "b8" },
  ] as readonly Piece[],
} as const;

// FEN по списку фигур (только расстановка) — для проверки данных.
export const placementFen = (pieces: readonly Piece[]) => {
  const rows: string[] = [];
  for (let r = 7; r >= 0; r--) {
    let row = "";
    let empty = 0;
    for (let fl = 0; fl < 8; fl++) {
      const p = pieces.find((x) => x.at === sqName({ file: fl, rank: r }));
      if (!p) {
        empty++;
        continue;
      }
      if (empty) row += String(empty);
      empty = 0;
      const ch = p.kind.toLowerCase();
      row += p.white ? ch.toUpperCase() : ch;
    }
    if (empty) row += String(empty);
    rows.push(row);
  }
  return rows.join("/");
};

// ---------- Экранные надписи (кыргызча) ----------
export const CH2_TEXT = {
  brand: "BalaGo",
  tagline: "Балдар үчүн такси",
  before: "Бир нече күн мурун",
  after: "Бир нече күндөн кийин",
  coach: "Машыктыруучу",
  coachMsg: "Кызыңыз турнирге катышпоону чечти.",
  momMsg: "Кызыбыз турнирге катышкысы келет. Жолду кантип уюштурарыбызды тактап жатабыз.",
  // Лист дополнительных занятий (расписание кружка персонажа).
  schedule: {
    title: "Шахмат",
    sub: "Кошумча машыгуу",
    days: "Дүйшөмбү · Шаршемби · Жума",
    end: "Аяктоо: 15:00",
  },
  tournament: "Турнир",
  notebook: "Маселе",
  // Рабочие календари родителей: встречи в 15:00 (без дат и компаний).
  calendar: {
    title: "Календарь",
    days: ["Дүйшөмбү", "Шаршемби", "Жума"],
    dadItem: "Жолугушуу",
    momItem: "Бөлүм кеңешмеси",
    time: "15:00",
  },
  // Поиск и предварительное обращение (иллюстративный экран, без URL,
  // рейтингов, отзывов и реальной отправки).
  search: { query: "Бишкек балдар үчүн такси", hint: "Издөө" },
  results: ["Мектеп жаңылыктары", "Шаардык транспорт"],
  page: {
    info: "Маршрутту сүйлөшүү үчүн алдын ала өтүнмө калтырыңыз",
    cta: "Алдын ала каттоо",
  },
  form: {
    title: "Алдын ала каттоо",
    route: "Маршрут: Мектеп → Үй",
    when: "Кошумча сабактан кийин",
    days: "Дүйшөмбү · Шаршемби · Жума",
    time: "Убакыт: 15:00",
    send: "Жөнөтүү",
    sent: "Өтүнмө жөнөтүлдү",
  },
  // Контактная карточка — последние 5 с.
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    whatsapp: "WhatsApp: 0998 08 38 28",
    link: "Маалымат жана алдын ала каттоо — профилдеги шилтемеде",
  },
  whatsappUrl: "https://wa.me/996998083828",
} as const;
