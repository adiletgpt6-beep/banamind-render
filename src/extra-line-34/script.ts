// BalaGo №34 «Лишняя строка в объявлении» (кыргызча «Жарыядагы ашыкча сап»),
// композиция BalaGo34ExtraLine. Отдельной заставки с названием нет: фильм
// начинается сразу с объявления о поиске няни.
//
// Мама несколько раз переписывает объявление о поиске няни; последняя
// добавленная строка (водительское удостоверение, уверенное вождение,
// возможность забирать ребёнка из школы) отсекает почти всех хороших
// кандидатов. Приходит женщина, много лет проработавшая воспитателем в
// детском саду: читает сыну книгу, спрашивает его мнение о герое, играет с
// младшей, не перебивая старшего. Машину она не водит. Папа предлагает
// отдельно решить школьную дорогу; родители изучают BalaGo и оставляют
// ПРЕДВАРИТЕЛЬНУЮ заявку на маршрут МЕКТЕП → ҮЙ (дома сына встретит няня),
// с няней договариваются о пробном дне. Вечером мама удаляет ту самую
// строку, сын закладывает страницу в той же книге.
//
// Только предварительное обращение: без подтверждённых поездок, оплаты,
// назначения водителя, цен, телефонов и адреса сайта.
//
// Длительность не задана заранее: сцены вытягиваются по фактической речи
// (layoutTimeline). Файл без зависимостей от Remotion: его читают
// Node-скрипты озвучки и тесты.

export const EL_VIDEO = {
  id: "BalaGo34ExtraLine",
  output: "balago-34-extra-line",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/extra-line-34",
} as const;

// ---------- Сцены ----------
export type ElSceneId =
  | "line"
  | "family"
  | "block"
  | "candidates"
  | "arrival"
  | "ask"
  | "reading"
  | "toy"
  | "question"
  | "split"
  | "balago"
  | "trial"
  | "delete"
  | "bookmark"
  | "cta";

// tail — время после конца последней реплики сцены (действие, реакция,
// переход); min — нижняя граница длительности сцены (с).
export type ElSceneSpec = {
  readonly id: ElSceneId;
  readonly title: string;
  readonly tail: number;
  readonly min: number;
};

export const EL_SCENE_SPECS: readonly ElSceneSpec[] = [
  { id: "line", title: "1. Бир сап", tail: 0.7, min: 8 },
  { id: "family", title: "2. Бала багуучу кимге керек", tail: 0.8, min: 9 },
  { id: "block", title: "3. Дагы бир талап", tail: 1.3, min: 8 },
  { id: "candidates", title: "4. Эки талапкер", tail: 1.1, min: 9 },
  { id: "arrival", title: "5. Тарбиячы келди", tail: 0.5, min: 5.5 },
  { id: "ask", title: "6. Уулунун өтүнүчү", tail: 3.6, min: 6 },
  { id: "reading", title: "7. Китеп жана суроо", tail: 1.5, min: 12 },
  { id: "toy", title: "8. Кичүүсү да кошулат", tail: 1.6, min: 8 },
  { id: "question", title: "9. Суроо", tail: 1.5, min: 7 },
  { id: "split", title: "10. Өзүнчө чечели", tail: 2.6, min: 8 },
  { id: "balago", title: "11. BalaGo", tail: 1.3, min: 13 },
  { id: "trial", title: "12. Сыноо күнү", tail: 1.0, min: 5 },
  { id: "delete", title: "13. Сап өчөт", tail: 0.9, min: 8 },
  { id: "bookmark", title: "14. Ошол эле китеп", tail: 1.75, min: 6 },
  { id: "cta", title: "15. BalaGo", tail: 3.2, min: 12 },
];

// ---------- Голоса ----------
export type ElRole = "narrator" | "mother" | "father" | "caregiver" | "son";

export const EL_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 341,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

export type ElVoice = { readonly name: string; readonly voiceId: string };

// Голоса ролей выбраны пробами до массовой генерации
// (scripts/el34-voice-probe.mjs → voice-samples/extra-line-34/probe/report.json;
// Meta MMS CER, медиана F0, профиль голоса audeering — технический замер, не
// прослушивание). Список голосов аккаунта ключу недоступен, поэтому пробовались
// сохранённые кыргызские голоса проекта:
//   caregiver — KG-teacher: C01/C03 CER 4,8/5,8 %, F0 200–211 Гц, профиль
//               40–47 лет — ближе всех к героине 45–55 лет, ниже и теплее мамы
//               по тембру;
//   narrator  — KG-daughter: N05/P10 CER 7,2/4,5 %, F0 258–262 Гц, профиль
//               ≈ 22 года — мягкий женский голос, явно отличается и от мамы
//               (≈ 198 Гц), и от воспитателя. KG-teacher как рассказчик точнее
//               (1,4/4,5 %), но он нужнее воспитателю: один голос — одна роль;
//   mother    — KG-mother (M01 8,7 %, «айдайсезби»; лучший из 3 дублей идёт в фильм);
//   father    — KG-husband (F01 0 %, ≈ 109 Гц);
//   son       — KG-son: S01/S02/S04 CER 2,9/0/0 %, F0 281–327 Гц, самый
//               молодой профиль (22–29 лет) среди «мальчиковых» голосов
//               (KG-son v7 remix-2 — 8,8/8,8/0 %, 31–33 года; KG-boy a2-3 —
//               14,7/5,9/0 %). Детских голосов ElevenLabs не создаёт: это светлый
//               голос, темп и высота тона не меняются.
export const EL_VOICES_CONFIRMED = true;

export const EL_VOICES: Record<ElRole, ElVoice | null> = {
  narrator: { name: "KG-daughter", voiceId: "AeboPz5CtE7qRUVvW93b" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  caregiver: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
};

// Кандидаты проб: сохранённые кыргызские голоса проекта (ElevenLabs Voice
// Design и Voice Remix из роликов №10–№30). Кроме того, проба печатает все
// голоса аккаунта с именем «KG-…» и пробует новые женские для рассказчика
// и воспитателя (scripts/el34-voice-probe.mjs).
export const EL_VOICE_CANDIDATES: Record<ElRole, readonly ElVoice[]> = {
  narrator: [
    { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
    { name: "KG-daughter", voiceId: "AeboPz5CtE7qRUVvW93b" },
  ],
  mother: [{ name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" }],
  father: [{ name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" }],
  caregiver: [{ name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" }],
  son: [
    { name: "KG-son v7 remix-2", voiceId: "1c81DEBcmaJMj1QDHWU6" },
    { name: "KG-boy a2-3", voiceId: "8QMDSJuOqCscZvQ6PqlL" },
    { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
  ],
};

// ---------- Реплики ----------
// text — как звучит и как показывается в субтитрах; spoken — что уходит в
// TTS, если отличается (BalaGo → «БалаГо», одинаково во всём фильме);
// tag — аудиотег eleven_v3 (не звучит, в субтитры не попадает).
export type ElMode = "narration" | "dialogue" | "reading";
export type ElLine = {
  readonly id: string;
  readonly role: ElRole;
  readonly text: string;
  readonly spoken?: string;
  readonly tag?: string;
  readonly seed?: number;
  // Части субтитров по смыслу (вместе — ровно text); без поля части
  // считаются автоматически (Subtitles.tsx → chunksOf).
  readonly subs?: readonly string[];
  readonly note: string; // режиссёрское пояснение (не озвучивается)
};

// Языковые правки до генерации (смысл сценария сохранён):
//   C01 «жардам бериш үчүн» → «жардам берүү үчүн» (литературная форма);
//   F01 «кантип алып келүүнү» → «кантип жеткирүүнү» (речь о дороге из
//   школы домой; слово то же, что на карточке «Мектептен үйгө жеткирүү»).
export const EL_LINES: readonly ElLine[] = [
  {
    id: "N01",
    role: "narrator",
    text: "Апасы бала багуучу издеп, жарыясын кайра-кайра өзгөрттү. Акыркы кошкон бир сабы жакшы талапкерлердин көбүн тизмеден чыгарып койду.",
    subs: ["Апасы бала багуучу издеп,", "жарыясын кайра-кайра өзгөрттү.", "Акыркы кошкон бир сабы", "жакшы талапкерлердин көбүн", "тизмеден чыгарып койду."],
    note: "спокойный рассказ о семье, без нажима",
  },
  {
    id: "N02",
    role: "narrator",
    text: "Үйдө эки бала бар: мектепте окуган уулу жана кичинекей кызы. Апасы компаниядагы жумушуна кайтып жатты. Атасы бөлүмдү жетектейт, жыйындары көп.",
    note: "знакомство с семьёй, ровно",
  },
  {
    id: "N03",
    role: "narrator",
    text: "Аларга кичүүсүн карап, уулун мектептен алып келе турган адам керек эле. Ошондуктан жарыяга дагы бир талап кошулду.",
    note: "по делу, без тревоги",
  },
  {
    id: "N04",
    role: "narrator",
    text: "Бир талапкер машинаны жакшы айдайт, бирок кичинекей балдар менен тажрыйбасы аз. Башкасынын балдар менен тажрыйбасы мол, бирок машина айдабайт.",
    note: "нейтрально, без оценки людей",
  },
  {
    id: "N05",
    role: "narrator",
    text: "Бир күнү аларга көп жыл бала бакчада тарбиячы болуп иштеген аял келди.",
    note: "чуть теплее, поворот истории",
  },
  { id: "S01", role: "son", text: "Сиз бул китепти окуп бере аласызбы?", tag: "[curious]", note: "любопытно, немного застенчиво" },
  {
    id: "C01",
    role: "caregiver",
    text: "Кичинекей каарман досуна жардам берүү үчүн кайра артка бурулду.",
    tag: "[warmly]",
    note: "читает вслух, чуть выразительнее разговора",
  },
  { id: "C02", role: "caregiver", text: "Сен кандай ойлойсуң, ал эмнеге кайтып келди?", tag: "[gently]", note: "искренний вопрос ребёнку" },
  { id: "S02", role: "son", text: "Досун жалгыз калтыргысы келген жок.", tag: "[thoughtfully]", note: "объясняет, немного оживляется" },
  {
    id: "N06",
    role: "narrator",
    text: "Кичинекей кызы да оюнчугун сунду. Аял уулунун сөзүн бөлбөй, кызы менен да ойной баштады.",
    note: "тепло, без умиления",
  },
  { id: "M01", role: "mother", text: "А сиз машина айдайсызбы?", tag: "[curious]", note: "практический вопрос, спокойно" },
  {
    id: "C03",
    role: "caregiver",
    text: "Жок. Балдар менен тажрыйбам көп, бирок машина айдабайм.",
    note: "спокойно, без извинений",
  },
  {
    id: "F01",
    role: "father",
    text: "Балдар бул эже менен бат тил табышты. Эми мектептен үйгө кантип жеткирүүнү өзүнчө чечели.",
    subs: ["Балдар бул эже менен бат тил табышты.", "Эми мектептен үйгө", "кантип жеткирүүнү өзүнчө чечели."],
    tag: "[warmly]",
    note: "партнёр, уверенно и доброжелательно, не поучает",
  },
  {
    id: "N07",
    role: "narrator",
    text: "Алар мектептен үйгө туруктуу алып келе турган кызмат издешти. BalaGo тууралуу маалыматты окуп, маршрутту сүйлөшүү үчүн алдын ала өтүнмө калтырышты. Үйдө уулун бала багуучу тосуп алмак.",
    subs: ["Алар мектептен үйгө", "туруктуу алып келе турган кызмат издешти.", "BalaGo тууралуу маалыматты окуп,", "маршрутту сүйлөшүү үчүн", "алдын ала өтүнмө калтырышты.", "Үйдө уулун бала багуучу тосуп алмак."],
    spoken: "Алар мектептен үйгө туруктуу алып келе турган кызмат издешти. БалаГо тууралуу маалыматты окуп, маршрутту сүйлөшүү үчүн алдын ала өтүнмө калтырышты. Үйдө уулун бала багуучу тосуп алмак.",
    note: "спокойно, описывает видимые действия",
  },
  { id: "N08", role: "narrator", text: "Бала багуучу менен эртеси сыноо күнүн өткөрүүгө макулдашышты.", subs: ["Бала багуучу менен эртеси", "сыноо күнүн өткөрүүгө макулдашышты."], note: "коротко и спокойно" },
  { id: "N09", role: "narrator", text: "Кечинде апасы жарыядагы акыркы сапты алып салды.", tag: "[softly]", note: "тихо, вечер" },
  { id: "S03", role: "son", text: "Ал эже дагы келеби?", tag: "[curious]", note: "с надеждой, через плечо мамы" },
  { id: "M02", role: "mother", text: "Ооба, эртең келет.", tag: "[warmly]", note: "тепло, с улыбкой" },
  { id: "S04", role: "son", text: "Эң кызыктуу жерине келгенде токтоп калганбыз.", tag: "[excited]", note: "с ожиданием завтрашнего дня" },
  {
    id: "N10",
    role: "narrator",
    // Финал по просьбе заказчика: ссылка в шапке профиля или WhatsApp
    // (номер — на экране, голосом не читается, как в ролике №12).
    text: "BalaGo — Бишкектеги мектеп окуучулары үчүн. Үйдөн мектепке, мектептен үйгө. Балаңызды каттоо жана маршрутту сүйлөшүү үчүн профилдин башындагы шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
    subs: ["BalaGo — Бишкектеги мектеп окуучулары үчүн.", "Үйдөн мектепке, мектептен үйгө.", "Балаңызды каттоо жана маршрутту сүйлөшүү үчүн", "профилдин башындагы шилтемеге өтүңүз", "же экрандагы номерге", "WhatsApp аркылуу жазыңыз.", "BalaGo менен жолго чыгалы!"],
    spoken: "БалаГо — Бишкектеги мектеп окуучулары үчүн. Үйдөн мектепке, мектептен үйгө. Балаңызды каттоо жана маршрутту сүйлөшүү үчүн профилдин башындагы шилтемеге өтүңүз же экрандагы номерге Ватсап аркылуу жазыңыз. БалаГо менен жолго чыгалы!",
    tag: "[warmly]",
    note: "тёплый короткий финал, без рекламного нажима",
  },
];

// ---------- Речевые сегменты на шкале ----------
// gap — пауза перед репликой: от начала сцены (первая реплика сцены) или
// от конца предыдущей реплики той же сцены. В паузах — действие.
export type ElSegSpec = {
  readonly id: string;
  readonly scene: ElSceneId;
  readonly gap: number;
  readonly mode: ElMode;
  readonly action: string; // связанное действие (таблица реплик)
};

export const EL_SEG_SPECS: readonly ElSegSpec[] = [
  { id: "N01", scene: "line", gap: 0.6, mode: "narration", action: "крупная карточка объявления: две правки, курсор добавляет «Айдоочулук күбөлүк», строка мягко жёлтеет, камера приближается" },
  { id: "N02", scene: "family", gap: 0.4, mode: "narration", action: "карточка становится экраном ноутбука; дом: мама, сын с рюкзаком, малышка с игрушкой; вставки — папа на совещании, мама в офисе" },
  { id: "N03", scene: "block", gap: 0.4, mode: "narration", action: "объявление крупно: забота о малышке и встреча сына; ниже — отдельный блок о вождении; курсор останавливается на «мектептен»" },
  { id: "N04", scene: "candidates", gap: 0.5, mode: "narration", action: "две карточки кандидатов по очереди; мама переводит взгляд с одной на другую" },
  { id: "N05", scene: "arrival", gap: 0.6, mode: "narration", action: "гостиная: воспитатель в кресле, сумка у ног; мама слушает, папа кивает; сын идёт с книгой" },
  { id: "S01", scene: "ask", gap: 0.9, mode: "dialogue", action: "сын поднимает книгу двумя руками, показывает обложку; затем она берёт книгу, освобождает место, сын садится" },
  { id: "C01", scene: "reading", gap: 0.9, mode: "reading", action: "она открывает книгу; крупно страница с двумя зверятами; читает" },
  { id: "C02", scene: "reading", gap: 0.8, mode: "dialogue", action: "смотрит на мальчика и спрашивает" },
  { id: "S02", scene: "reading", gap: 1.0, mode: "dialogue", action: "короткая пауза; мальчик объясняет, оживляется; мама в другом плане улыбается" },
  { id: "N06", scene: "toy", gap: 0.5, mode: "narration", action: "малышка протягивает игрушку; воспитатель принимает её одной рукой, играет, взглядом возвращается к сыну" },
  { id: "M01", scene: "question", gap: 2.6, mode: "dialogue", action: "мама смотрит на список в телефоне и поднимает глаза" },
  { id: "C03", scene: "question", gap: 0.7, mode: "dialogue", action: "спокойный ответ; мама задумчиво опускает взгляд к объявлению" },
  { id: "F01", scene: "split", gap: 1.3, mode: "dialogue", action: "после встречи: папа смотрит на объявление, затем на маму, указывает на пункт о дороге; карточка делится на две" },
  { id: "N07", scene: "balago", gap: 0.6, mode: "narration", action: "экран BalaGo: Бишкек, ҮЙ → МЕКТЕП → ҮЙ, «Баланы каттоо»; затем МЕКТЕП → ҮЙ, «Алдын ала өтүнмө», «Маршрутту талкуулоо»; дома — няня с малышкой" },
  { id: "N08", scene: "trial", gap: 0.5, mode: "narration", action: "мама ставит в календаре «Эртең · сыноо күнү»" },
  { id: "N09", scene: "delete", gap: 0.5, mode: "narration", action: "вечер, та же композиция объявления; мама выделяет блок о вождении" },
  { id: "S03", scene: "delete", gap: 1.7, mode: "dialogue", action: "блок исчезает, строки сдвигаются; сын заглядывает через плечо" },
  { id: "M02", scene: "delete", gap: 0.5, mode: "dialogue", action: "мама поворачивается к сыну, улыбается" },
  { id: "S04", scene: "bookmark", gap: 2.6, mode: "dialogue", action: "сын у книжной полки, достаёт ту же книгу, находит страницу, вкладывает закладку" },
  { id: "N10", scene: "cta", gap: 0.6, mode: "narration", action: "страница светлеет в финальный экран: BalaGo, Бишкек, маршрут, «Баланы каттоо», «Шилтеме — профилдин башында», WhatsApp 0998 08 38 28" },
];

export const modeOf = (lineId: string): ElMode => EL_SEG_SPECS.find((s) => s.id === lineId)?.mode ?? "dialogue";

export const lineById = (id: string) => {
  const l = EL_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Раскладка шкалы по фактической длительности речи ----------
export type ElSceneSpan = { readonly id: ElSceneId; readonly title: string; readonly from: number; readonly to: number }; // кадры
export type ElSegAt = { readonly id: string; readonly scene: ElSceneId; readonly at: number; readonly end: number };
export type ElLayout = {
  readonly scenes: readonly ElSceneSpan[];
  readonly segments: readonly ElSegAt[];
  readonly frames: number;
};

export const layoutTimeline = (speech: (id: string) => number): ElLayout => {
  const fps = EL_VIDEO.fps;
  const scenes: ElSceneSpan[] = [];
  const segments: ElSegAt[] = [];
  let frame = 0;
  for (const sc of EL_SCENE_SPECS) {
    const start = frame / fps;
    let t = start;
    let first = true;
    for (const sg of EL_SEG_SPECS.filter((x) => x.scene === sc.id)) {
      const at = Math.round((first ? start + sg.gap : t + sg.gap) * 1000) / 1000;
      const end = at + speech(sg.id);
      segments.push({ id: sg.id, scene: sc.id, at, end });
      t = end;
      first = false;
    }
    const need = first ? sc.min : Math.max(sc.min, t - start + sc.tail);
    const len = Math.ceil(need * fps);
    scenes.push({ id: sc.id, title: sc.title, from: frame, to: frame + len });
    frame += len;
  }
  return { scenes, segments, frames: frame };
};

// Оценка длительности речи по тексту (≈ 13 букв/с, паузы на знаках) —
// только до генерации озвучки (превью в Studio).
export const estimateSpeech = (id: string) => {
  const l = lineById(id);
  const text = l.spoken ?? l.text;
  const letters = [...text].filter((c) => /\p{L}/u.test(c)).length;
  const marks = (text.match(/[.,!?—:]/g) ?? []).length;
  return letters / 13 + marks * 0.25;
};

// ---------- Экранные надписи (кыргызча) ----------
export const EL_TEXT = {
  // Объявление о поиске няни — один и тот же макет в сценах 1, 3, 13.
  ad: {
    tag: "Жарыя",
    version: "5-вариант",
    title: "Бала багуучу керек",
    // в начале фильма две короткие правки: «Кызыбызга кам көрүү» →
    // «Кичинекей кызыбызга кам көрүү», «Тажрыйбасы бар» → «Балдар менен иш
    // тажрыйбасы»
    itemsBefore: ["Кызыбызга кам көрүү", "Уулубуз мектептен келгенде тосуп алуу", "Тажрыйбасы бар"],
    items: ["Кичинекей кызыбызга кам көрүү", "Уулубуз мектептен келгенде тосуп алуу", "Балдар менен иш тажрыйбасы"],
    // Добавленный пункт требований (одна строка требований на трёх строках
    // для читаемости). В финале удаляется весь пункт.
    extra: ["Айдоочулук күбөлүк", "Ишенимдүү айдоо", "Баланы мектептен алып келүү"],
    extraFocus: "мектептен",
  },
  headline: { text: "Бир сап баарын татаалдаштырды", accent: "Бир сап" },
  // «дал келбейт» не разрывается переносом (неразрывный пробел)
  candidatesHeadline: { text: "Талаптарга толук дал\u00a0келбейт", accent: "толук" },
  candidates: [
    { label: "1-талапкер", plus: "Жакшы айдайт", minus: "Кичинекей балдар менен тажрыйбасы аз" },
    { label: "2-талапкер", plus: "Балдар менен тажрыйбалуу", minus: "Машина айдабайт" },
  ],
  split: { care: "Балдарга кам көрүү", route: "Мектептен үйгө жеткирүү" },
  book: { title: "Кичинекей каарман" },
  site: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    register: "Баланы каттоо",
    // запрос этой семьи
    familyRoute: ["МЕКТЕП", "ҮЙ"],
    request: "Алдын ала өтүнмө",
    discuss: "Маршрутту талкуулоо",
    sent: "Өтүнмө калтырылды",
  },
  calendar: { when: "Эртең", what: "сыноо күнү", full: "Эртең · сыноо күнү" },
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси · Бишкек",
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    button: "Баланы каттоо",
    site: "Шилтеме — профилдин башында",
    // контакт для заявки (по просьбе заказчика)
    whatsappLabel: "WhatsApp",
    whatsappNumber: "0998 08 38 28",
  },
} as const;
