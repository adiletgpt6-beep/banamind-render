// Фильм BalaGo №36 «Чемодан у двери» (Эшиктин жанындагы чемодан),
// композиция BalaGo36SuitcaseByTheDoor2D. Рисованная 2D-анимация 1080×1920.
//
// Маму пригласили выступить на профессиональной встрече в другом городе:
// три дня — дорога, выступление, обсуждения. Перед подтверждением поездки
// она открывает школьное расписание сына: обычно после уроков его забирает
// она, папа в эти часы на встречах, бабушка может встретить мальчика дома —
// нужно организовать дорогу к ней. Папа сам договаривается с коллегой,
// переносит встречу и на три дня берёт школьные поездки на себя. Вечером
// родители обсуждают, как готовиться к таким ситуациям, сами находят BalaGo
// и оставляют ПРЕДВАРИТЕЛЬНУЮ заявку, чтобы обсудить маршрут и возможное
// расписание (без подтверждения, водителя и брони). Во время командировки
// сына забирает папа. После возвращения мальчик находит мамин бейдж,
// кладёт рядом свою школьную фотографию и просит рассказать о выступлении.
//
// Длительность не задана заранее: сцены вытягиваются по фактической речи
// (layoutTimeline). Файл без зависимостей от Remotion: его читают
// Node-скрипты озвучки и проверки.

export const SD2_VIDEO = {
  id: "BalaGo36SuitcaseByTheDoor2D",
  output: "balago-36-suitcase-by-the-door-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/suitcase-by-the-door-2d",
} as const;

// Финальный рекламный кадр: полностью собранная композиция держится не
// меньше этого времени и не короче конца речи + запас.
export const SD2_CTA_HOLD_SEC = 6.5;
export const SD2_END_PAD_SEC = 0.8;

// ---------- Сцены ----------
export type Sd2SceneId =
  | "suitcase"
  | "invite"
  | "schedule"
  | "who"
  | "dinner"
  | "three"
  | "meetings"
  | "pack"
  | "request"
  | "trip"
  | "call"
  | "back"
  | "badge"
  | "photo"
  | "folder"
  | "cta";

// tail — время после конца последней реплики сцены (действие, реакция,
// переход); min — нижняя граница длительности сцены (с).
export type Sd2SceneSpec = {
  readonly id: Sd2SceneId;
  readonly code: string; // S01…S16 из сценария
  readonly title: string;
  readonly tail: number;
  readonly min: number;
};

export const SD2_SCENE_SPECS: readonly Sd2SceneSpec[] = [
  { id: "suitcase", code: "S01", title: "S01 · Чемодан, который пока не едет", tail: 1.3, min: 10 },
  { id: "invite", code: "S02", title: "S02 · Приглашение и три дня", tail: 1.5, min: 9 },
  { id: "schedule", code: "S03", title: "S03 · Одно расписание внутри другого", tail: 1.3, min: 8 },
  { id: "who", code: "S04", title: "S04 · Кто что может сделать", tail: 1.2, min: 11 },
  { id: "dinner", code: "S05", title: "S05 · За ужином", tail: 0.5, min: 8 },
  { id: "three", code: "S06", title: "S06 · Вопрос на три дня", tail: 1.6, min: 6 },
  { id: "meetings", code: "S07", title: "S07 · Папа перестраивает встречи", tail: 1.4, min: 14 },
  { id: "pack", code: "S08", title: "S08 · Папка снова в чемодане", tail: 2.4, min: 6 },
  { id: "request", code: "S09", title: "S09 · BalaGo как заранее обсуждённый вариант", tail: 1.8, min: 15 },
  { id: "trip", code: "S10", title: "S10 · Командировка, папа и школа", tail: 6.2, min: 11.5 },
  { id: "call", code: "S11", title: "S11 · Вечерний звонок", tail: 1.3, min: 11 },
  { id: "back", code: "S12", title: "S12 · Мама вернулась", tail: 0.8, min: 10 },
  { id: "badge", code: "S13", title: "S13 · Бейдж", tail: 1.4, min: 5 },
  { id: "photo", code: "S14", title: "S14 · Школьная фотография рядом", tail: 1.2, min: 8 },
  { id: "folder", code: "S15", title: "S15 · Мама открывает папку", tail: 1.6, min: 5 },
  { id: "cta", code: "S16", title: "S16 · Финал BalaGo", tail: 2.8, min: 10 },
];

// ---------- Голоса ----------
export type Sd2Role = "narrator" | "mother" | "father" | "son";

export const SD2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 361,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

type Voice = { readonly name: string; readonly voiceId: string };

// Сохранённые кыргызские голоса проекта (ElevenLabs Voice Design, носители
// кыргызского языка). Новые голоса не создаются, ID взяты из уже
// озвученных роликов проекта:
//   narrator — KG-teacher: тёплый спокойный рассказчик (№12, №22, №27, №30),
//              женский голос, отличный по тембру от голоса мамы;
//   mother   — KG-mother: тёплый мягкий женский голос;
//   father   — KG-husband: спокойный низкий мужской голос (≈ 110 Гц);
//   son      — KG-boy a2-3, выбран пробами C01 и C04
//              (scripts/sd2d-voice-probe.mjs →
//              voice-samples/suitcase-by-the-door-2d/probe/report.json):
//              медиана F0 276–302 Гц (обычный диапазон мальчика 7–9 лет),
//              CER MMS 0,059 / 0. У KG-son v7 remix-2 F0 258–271 Гц, у
//              KG-son — 340–372 Гц (выше детского диапазона; в ролике №22
//              слепое прослушивание описало его как голос взрослой
//              женщины, а KG-boy a2-3 — как голос мальчика-подростка).
//              Детских голосов ElevenLabs Voice Design не создаёт; модель
//              профиля относит все три голоса к взрослым женским. Высота
//              тона и темп не меняются. Это технический замер, не
//              прослушивание.
export const SD2_VOICES: Record<Sd2Role, Voice> = {
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  son: { name: "KG-boy a2-3", voiceId: "8QMDSJuOqCscZvQ6PqlL" },
};

// Кандидаты проб (голоса проекта).
export const SD2_VOICE_CANDIDATES: Record<Sd2Role, readonly Voice[]> = {
  narrator: [
    { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
    { name: "KG-friend", voiceId: "YFFd51gsFa9VT4xGD15W" },
  ],
  mother: [{ name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" }],
  father: [{ name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" }],
  son: [
    { name: "KG-boy a2-3", voiceId: "8QMDSJuOqCscZvQ6PqlL" },
    { name: "KG-son v7 remix-2", voiceId: "1c81DEBcmaJMj1QDHWU6" },
    { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
  ],
};

// Короткие пробы до массовой генерации (M01, P01, C01, C04 и рассказчик).
export const SD2_PROBES: Record<Sd2Role, readonly string[]> = {
  narrator: ["N01"],
  mother: ["M01"],
  father: ["P01"],
  son: ["C01", "C04"],
};

// ---------- Реплики ----------
// text — как звучит и как показывается в субтитрах; spoken — что уходит в
// TTS, если отличается (BalaGo → «БалаГо», WhatsApp → «Ватсап», номер —
// словами, каждая группа цифр одним токеном через дефис); tag — аудиотег
// eleven_v3 (не звучит, в субтитры не попадает).
export type Sd2Mode = "narration" | "dialogue" | "phone";
export type Sd2Line = {
  readonly id: string;
  readonly role: Sd2Role;
  readonly text: string;
  readonly spoken?: string;
  readonly tag?: string;
  readonly seed?: number;
  readonly note?: string; // характер исполнения (для таблицы)
};

// Итоговый кыргызский текст. Правки производственной версии перевода:
//   N04 — «тосуп алат» → «тосуп ала алат» («может встретить», как в
//         оригинале сценария: бабушка не обязана ездить в школу).
// Остальные реплики — без изменений.
export const SD2_LINES: readonly Sd2Line[] = [
  {
    id: "N01",
    role: "narrator",
    text: "Апасы чемоданын ачты. Иш кагаздары салынган папканы ичине салып, кайра столго койду.",
    note: "спокойно, с лёгкой интригой",
  },
  { id: "C01", role: "son", text: "Апа, командировкадан келип калдыңбы?", tag: "[curious]", note: "живое детское любопытство" },
  { id: "M01", role: "mother", text: "Мен али кете элекмин.", tag: "[warmly]", note: "с лёгкой улыбкой" },
  {
    id: "N02",
    role: "narrator",
    text: "Апасын башка шаардагы кесиптештеринин жолугушуусуна сөз сүйлөөгө чакырышкан. Сапар үч күнгө созулмак: жол, баяндама, кесиптештери менен талкуу.",
    note: "по делу, перечисление спокойно",
  },
  {
    id: "N03",
    role: "narrator",
    text: "Ал бул долбоорго бир нече ай даярданган. Бирок сапарга барарын ырастардан мурда уулунун мектептеги жадыбалын ачты.",
    note: "спокойно, небольшой поворот на «Бирок»",
  },
  {
    id: "N04",
    role: "narrator",
    text: "Сабактан кийин уулун көбүнчө апасы алып кетет. Атасы ошол убакта кеңседеги жолугушууларда болот. Үйдө баланы чоң энеси тосуп ала алат. Болгону мектептен ага жеткирүүнү уюштуруу керек.",
    note: "объясняет, без тревоги",
  },
  { id: "N05", role: "narrator", text: "Кечки тамакта апасы мындай деди:", note: "коротко, мягко" },
  { id: "M02", role: "mother", text: "Балким, ордума кесиптешимдин барышын суранам.", tag: "[thoughtfully]", note: "спокойное сомнение, без печали" },
  { id: "P01", role: "father", text: "Баяндамага өзүң даярдандың да.", tag: "[gently]", note: "внимательно, с удивлением, без упрёка" },
  { id: "M03", role: "mother", text: "Ооба. Ушул үч күндө аны мектептен ким алып кетерин чечишибиз керек.", note: "спокойно, практично" },
  {
    id: "N06",
    role: "narrator",
    text: "Алар календарларын ачып, чогуу карашты. Атасы бир жумушчу талкууну кесиптешине өткөрүп берүүнү макулдашты. Дагы бир жолугушууну эртерээк өткөрмөй болду. Командировка учурунда уулун мектептен өзү алып кетмек болду.",
    note: "уверенно, тепло на последней фразе",
  },
  { id: "N07", role: "narrator", text: "Апасы папканы кайра алып, чемоданга салды.", tag: "[warmly]", note: "облегчение, сдержанно" },
  {
    id: "N08",
    role: "narrator",
    text: "Кечинде экөө мындай учурларга алдын ала даярданууну сүйлөшүштү. Уулунун мектепке барып-келишин туруктуу уюштуруунун жолун издешти. BalaGoну таап, маршрутту жана мүмкүн болгон убакыттарды талкуулоо үчүн алдын ала өтүнмө калтырышты.",
    spoken:
      "Кечинде экөө мындай учурларга алдын ала даярданууну сүйлөшүштү. Уулунун мектепке барып-келишин туруктуу уюштуруунун жолун издешти. БалаГону таап, маршрутту жана мүмкүн болгон убакыттарды талкуулоо үчүн алдын ала өтүнмө калтырышты.",
    note: "спокойно, без рекламной интонации",
  },
  { id: "N09", role: "narrator", text: "Апасы командировкада жүргөндө, уулун мектептен атасы өзү алып кетти.", note: "тепло" },
  { id: "N10", role: "narrator", text: "Кечинде апасына чалышты.", note: "коротко" },
  { id: "P02", role: "father", text: "Сөз сүйлөгөнүң кандай өттү?", tag: "[warmly]", note: "с интересом" },
  { id: "N11", role: "narrator", text: "Апасы залдын сүрөтүн көрсөтүп, угармандардын суроолору жөнүндө айтып берди.", note: "спокойно" },
  { id: "C02", role: "son", text: "Сен сахнада, мына ушул жерде турдуңбу?", tag: "[curious]", note: "удивление и интерес" },
  {
    id: "N12",
    role: "narrator",
    text: "Кайтып келгенде, апасы чемоданды эшиктин жанына койду. Уулу буюмдарын чыгарууга жардам берип жатып, анын бейджин таап алды.",
    note: "тепло, без спешки",
  },
  { id: "C03", role: "son", text: "Карап көрсөм болобу?", seed: 451, note: "осторожно, просит разрешения (без тега: с [softly] голос уходил в шёпот, MMS CER 0,21)" },
  { id: "N13", role: "narrator", text: "Анда апасынын аты жана «Спикер» деген сөз жазылган эле.", tag: "[softly]", note: "тише" },
  { id: "N14", role: "narrator", text: "Бала өзүнүн мектептеги сүрөтүн алып келип, бейдждин жанына койду.", note: "спокойно" },
  { id: "C04", role: "son", text: "Эми аларга эмне айтып бергениңди мага да көрсөтчү.", tag: "[curious]", note: "любопытно, заинтересованно" },
  { id: "N15", role: "narrator", text: "Апасы папканы ачып, уулунун жанына отурду.", tag: "[warmly]", note: "тепло, завершение истории" },
  {
    id: "N16",
    role: "narrator",
    text: "Балаңыздын мектепке барып-келишин алдын ала пландаңыз. BalaGo — Бишкектеги балдар үчүн такси. Үйдөн мектепке, мектептен үйгө. Маршрутту жана убакытты талкуулоо үчүн сайттан өтүнмө калтырыңыз. Профилдин башындагы шилтемеге өтүңүз же WhatsApp аркылуу жазыңыз: 0998 08 38 28. BalaGo менен жолго чыгалы!",
    spoken:
      "Балаңыздын мектепке барып-келишин алдын ала пландаңыз. БалаГо — Бишкектеги балдар үчүн такси. Үйдөн мектепке, мектептен үйгө. Маршрутту жана убакытты талкуулоо үчүн сайттан өтүнмө калтырыңыз. Профилдин башындагы шилтемеге өтүңүз же Ватсап аркылуу жазыңыз: нөл-тогуз-жүз-токсон-сегиз, нөл-сегиз, отуз-сегиз, жыйырма-сегиз. БалаГо менен жолго чыгалы!",
    note: "спокойный рекламный финал, без нажима",
  },
];

// ---------- Речевые сегменты на шкале ----------
// gap — пауза перед репликой: от начала сцены (первая реплика сцены) или
// от конца предыдущей реплики той же сцены. В паузах — действие.
export type Sd2SegSpec = {
  readonly id: string;
  readonly scene: Sd2SceneId;
  readonly gap: number;
  readonly mode: Sd2Mode;
  readonly action: string; // связанное действие (для таблицы реплик)
};

export const SD2_SEG_SPECS: readonly Sd2SegSpec[] = [
  { id: "N01", scene: "suitcase", gap: 0.5, mode: "narration", action: "рука мамы опускает жёлтую папку в открытый чемодан, взгляд на школьный календарь, папка возвращается на стол" },
  { id: "C01", scene: "suitcase", gap: 0.7, mode: "dialogue", action: "разворот к среднему плану: сын в дверном проёме смотрит на папку, спрашивает" },
  { id: "M01", scene: "suitcase", gap: 0.4, mode: "dialogue", action: "мама поворачивается к сыну и улыбается" },
  { id: "N02", scene: "invite", gap: 0.4, mode: "narration", action: "приглашение и зал со сценой; карточки «Жол», «Сөз сүйлөө», «Талкуу»; синяя вставка: три дня одной линией" },
  { id: "N03", scene: "schedule", gap: 0.3, mode: "narration", action: "мама открывает школьное расписание; три дня выделяются жёлтым; линии от дней поездки к школьным отметкам" },
  { id: "N04", scene: "who", gap: 0.3, mode: "narration", action: "мама у школьного двора; папа на встрече в офисе; бабушка открывает дверь; схема «Мектеп → … → Чоң эненин үйү»" },
  { id: "N05", scene: "dinner", gap: 0.6, mode: "narration", action: "семейный ужин, общий план" },
  { id: "M02", scene: "dinner", gap: 0.7, mode: "dialogue", action: "мама кладёт ложку, на секунду опускает взгляд и говорит" },
  { id: "P01", scene: "dinner", gap: 0.6, mode: "dialogue", action: "папа поворачивается, брови чуть поднимаются, напоминает о выступлении" },
  { id: "M03", scene: "three", gap: 0.35, mode: "dialogue", action: "мама поворачивает календарь к папе: три школьные отметки; «Үч күн»" },
  { id: "N06", scene: "meetings", gap: 0.4, mode: "narration", action: "родители с календарями; папа звонит коллеге; карточка встречи уходит к значку коллеги, вторая — на раннее время; три поездки получают метку папы" },
  { id: "N07", scene: "pack", gap: 0.3, mode: "narration", action: "тот же ракурс, что в начале: папка уверенно ложится в чемодан, ладонь разглаживает её, крышка закрывается" },
  { id: "N08", scene: "request", gap: 0.5, mode: "narration", action: "вечер, родители с телефоном: страница BalaGo, поля «Дарек», «Мектеп», «Убакыт», касание «Өтүнмө калтыруу», «Маршрут жана убакыт талкууланат»" },
  { id: "N09", scene: "trip", gap: 0.5, mode: "narration", action: "мама выступает в зале; папа встречает сына у школы, ремень, дверь, папа за рулём серой машины" },
  { id: "N10", scene: "call", gap: 0.4, mode: "narration", action: "папа и сын дома на диване, видеозвонок маме" },
  { id: "P02", scene: "call", gap: 0.45, mode: "dialogue", action: "папа спрашивает, мама на экране улыбается" },
  { id: "N11", scene: "call", gap: 0.5, mode: "narration", action: "мама показывает фото зала (вставка крупно)" },
  { id: "C02", scene: "call", gap: 0.5, mode: "dialogue", action: "сын наклоняется к экрану, показывает на место у сцены" },
  { id: "N12", scene: "back", gap: 0.4, mode: "narration", action: "мама ставит чемодан у двери; открытый чемодан на скамье, вместе достают вещи; сын замечает шнурок бейджа" },
  { id: "C03", scene: "back", gap: 0.5, mode: "dialogue", action: "сын держит карточку, спрашивает разрешения" },
  { id: "N13", scene: "badge", gap: 0.5, mode: "narration", action: "бейдж «Айжан · Спикер» крупно, внимание переходит на лицо сына" },
  { id: "N14", scene: "photo", gap: 0.3, mode: "narration", action: "сын приносит школьную фотографию, кладёт рядом с бейджем" },
  { id: "C04", scene: "photo", gap: 0.5, mode: "dialogue", action: "сын просит показать, что мама рассказывала; мама отвечает взглядом" },
  { id: "N15", scene: "folder", gap: 0.3, mode: "narration", action: "мама садится рядом и открывает жёлтую папку; сын подаётся вперёд" },
  { id: "N16", scene: "cta", gap: 1.0, mode: "narration", action: "раскрытая папка становится светлой плоскостью: BalaGo, «Балдар үчүн такси», «Бишкек», «ҮЙ → МЕКТЕП → ҮЙ», «Баланы каттоо», «Шилтеме профилдин башында», «WhatsApp: 0998 08 38 28»" },
];

export const modeOf = (lineId: string): Sd2Mode => SD2_SEG_SPECS.find((s) => s.id === lineId)?.mode ?? "dialogue";
export const lineById = (id: string) => {
  const l = SD2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Раскладка шкалы по фактической длительности речи ----------
export type Sd2SceneSpan = { readonly id: Sd2SceneId; readonly title: string; readonly from: number; readonly to: number }; // кадры
export type Sd2SegAt = { readonly id: string; readonly scene: Sd2SceneId; readonly at: number; readonly end: number };
export type Sd2Layout = {
  readonly scenes: readonly Sd2SceneSpan[];
  readonly segments: readonly Sd2SegAt[];
  readonly frames: number;
};

// speech(id) — длительность речи реплики (с); ctaAssembledOffset —
// момент (с от начала речи N16), когда финальная композиция собрана
// целиком (слово «Шилтеме»). Финальная сцена держится до
// max(конец речи + SD2_END_PAD_SEC + запас, собранный кадр + SD2_CTA_HOLD_SEC).
// Секунды в кадры переводятся один раз — на границах сцен (Math.ceil),
// поэтому мелкие паузы не накапливают ошибку округления.
export const layoutTimeline = (speech: (id: string) => number, ctaAssembledOffset?: number): Sd2Layout => {
  const fps = SD2_VIDEO.fps;
  const scenes: Sd2SceneSpan[] = [];
  const segments: Sd2SegAt[] = [];
  let frame = 0;
  for (const sc of SD2_SCENE_SPECS) {
    const start = frame / fps;
    let t = start;
    let first = true;
    for (const sg of SD2_SEG_SPECS.filter((x) => x.scene === sc.id)) {
      const at = Math.round((first ? start + sg.gap : t + sg.gap) * 1000) / 1000;
      const end = at + speech(sg.id);
      segments.push({ id: sg.id, scene: sc.id, at, end });
      t = end;
      first = false;
    }
    let need = first ? sc.min : Math.max(sc.min, t - start + sc.tail);
    if (sc.id === "cta") {
      const n16 = segments.find((s) => s.id === "N16")!;
      const assembled = n16.at + (ctaAssembledOffset ?? speech("N16") * 0.7);
      need = Math.max(need, assembled + SD2_CTA_HOLD_SEC - start, n16.end + SD2_END_PAD_SEC + 1.2 - start);
    }
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
// Имя «Айжан» и слово «Спикер» — реквизит вымышленной героини.
export const SD2_TEXT = {
  brand: "BalaGo",
  // приглашение (без названия города и конференции)
  invite: { title: "ЧАКЫРУУ", line: "Кесиптештер жолугушуусу", role: "Баяндамачы", days: "3 күн" },
  // три дня поездки (условно, не реальное расписание конференции)
  tripDays: [
    { day: "1-күн", label: "Жол" },
    { day: "2-күн", label: "Сөз сүйлөө" },
    { day: "3-күн", label: "Талкуу" },
  ],
  // школьное расписание сына: будни, конец уроков; дни поездки — Шш, Шр, Бш
  school: {
    title: "Мектептин жадыбалы",
    week: ["Дш", "Шш", "Шр", "Бш", "Жм"],
    end: "12:30",
    endLabel: "Сабак бүтөт",
    tripCols: [1, 2, 3],
  },
  who: { mom: "Апасы", dad: "Атасы", grandma: "Чоң энеси" },
  route: { school: "Мектеп", grandma: "Чоң эненин үйү", home: "Үй" },
  threeDays: "Үч күн",
  // папин рабочий календарь: две встречи в часы окончания уроков
  dad: {
    title: "Атасынын календары",
    m1: { time: "12:30", label: "Иш талкуусу" },
    m2: { time: "13:00", label: "Жолугушуу" },
    m2new: "10:00",
    colleague: "Кесиптеш",
    trip: "Мектеп",
    tag: "Атасы",
  },
  // мини-страница BalaGo в стиле фильма (иллюстрация, не реальный интерфейс)
  page: {
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: "Үй → Мектеп → Үй",
    fields: [
      { label: "Дарек", value: "Үйдүн дареги" },
      { label: "Мектеп", value: "Мектептин аты" },
      { label: "Убакыт", value: "Сабактан кийин" },
    ],
    button: "Өтүнмө калтыруу",
    sent: "Маршрут жана убакыт талкууланат",
  },
  call: { mom: "Апа", photo: "Зал" },
  badge: { name: "Айжан", role: "Спикер" },
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    button: "Баланы каттоо",
    link: "Шилтеме профилдин башында",
    // номер дал заказчик (WhatsApp); в кадре — как написан
    whatsapp: "WhatsApp",
    phone: "0998 08 38 28",
  },
} as const;

// Слова N16, по которым собирается финальный кадр (появление элементов).
// (слова — как в тексте для TTS: «БалаГо», «Ватсап»). WhatsApp с номером —
// последний элемент: кадр собран через 0,5 с после этого слова.
export const SD2_CTA_WORDS = {
  tagline: "БалаГо",
  city: "Бишкектеги",
  route: "Үйдөн",
  button: "өтүнмө",
  link: "Профилдин",
  whatsapp: "Ватсап",
} as const;
