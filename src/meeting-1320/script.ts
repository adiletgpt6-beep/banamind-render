// Фильм BalaGoMeeting1320 — «13:20дагы жолугушуу» («Встреча в 13:20»),
// сценарий №31.
//
// В календаре директора каждый день стоит загадочная встреча в 13:20: без
// компании, имени и номера комнаты. Другие встречи он переносит или проводит
// онлайн, эту — никогда. Новая помощница замечает пункт; важный заказчик
// предлагает 13:30, директор просит предложить 14:30 и постараться вернуться
// к этому времени. В 13:20 он берёт ключи и едет на своей машине — мимо
// бизнес-центра во двор школы. Только там зритель узнаёт, кто его ждал: сын
// выбегает с новостью про удачный опыт. Отец пристёгивает его и везёт домой
// к бабушке (жена работает в другом районе). На парковке офиса — звонок:
// заказчик уже приехал; отец заканчивает разговор и включается в обсуждение.
// Вечером помощница уточняет неделю — «Уулумду мектептен алып кетем». Дома
// отец сам находит BalaGo, показывает жене, они оставляют ПРЕДВАРИТЕЛЬНУЮ
// заявку. Перед сном сын приносит рисунок опыта; отец отодвигает бумаги и
// освобождает место рядом. Затем короткая карточка BalaGo.
// BalaGo в истории никого не возит и ничего не подтверждает.
//
// Длительность не задана заранее: сцены вытягиваются по фактической речи
// (layoutTimeline); финальная карточка с контактами (AGENTS.md) неподвижна
// с начала реплики N20 до конца: ≥ 150 кадров, после последнего слова ≥ 3 с.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const M13_VIDEO = {
  id: "BalaGoMeeting1320",
  output: "balago-31-meeting-1320-2d",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "meeting-1320/voice",
  assetDir: "meeting-1320",
} as const;

// Финальная карточка с контактами (правила проекта, AGENTS.md): ссылка в
// профиле и WhatsApp видны одновременно и неподвижно не меньше 5 с
// (150 кадров) — с начала реплики о контактах (N20) до конца ролика; после
// последнего слова озвучки экран держится не меньше 3 с.
export const M13_CONTACT_FRAMES = 150;
export const M13_FINAL_HOLD = 3;

// ---------- Сцены ----------
export type M13SceneId =
  | "calendar"
  | "notice"
  | "ask"
  | "drive"
  | "reveal"
  | "grandma"
  | "back"
  | "evening"
  | "home"
  | "drawing"
  | "brand";

// tail — время после конца последней реплики (действие, реакция, переход);
// min — нижняя граница длительности сцены (с).
export type M13SceneSpec = {
  readonly id: M13SceneId;
  readonly title: string;
  readonly tail: number;
  readonly min: number;
};

export const M13_SCENE_SPECS: readonly M13SceneSpec[] = [
  { id: "calendar", title: "1. Календардагы 13:20", tail: 1.0, min: 12 },
  { id: "notice", title: "2. Жардамчы байкады", tail: 1.6, min: 12 },
  { id: "ask", title: "3. Жылдырсак болобу?", tail: 1.8, min: 10 },
  { id: "drive", title: "4. Ал кайда барат?", tail: 1.4, min: 11 },
  { id: "reveal", title: "5. Мектептин короосу", tail: 2.0, min: 15 },
  { id: "grandma", title: "6. Чоң энесине", tail: 1.0, min: 11 },
  { id: "back", title: "7. Кеңсеге кайтуу", tail: 1.8, min: 13 },
  { id: "evening", title: "8. Календардагы чындык", tail: 1.8, min: 11 },
  { id: "home", title: "9. Үй-бүлө жол издейт", tail: 1.8, min: 15 },
  { id: "drawing", title: "10. Сүрөт жана бош орун", tail: 3.6, min: 15 },
  { id: "brand", title: "11. BalaGo", tail: 3.4, min: 12 },
];

// ---------- Голоса ----------
// N — рассказчик (и финальный диктор), F — отец-директор, A — помощница,
// S — сын. Мама, бабушка, заказчик и сотрудники не говорят.
export type M13Role = "narrator" | "father" | "assistant" | "son";

export const M13_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 1320,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Сохранённые кыргызские голоса проекта (ElevenLabs Voice Design).
// Отец — KG-husband: проверенный спокойный мужской голос отцов №10–№30.
// Рассказчик, помощница и сын выбираются короткими пробами
// (scripts/m1320-voice-probe.mjs) среди голосов, уже созданных в аккаунте;
// пока voiceId пуст, голос берётся из voice-samples/meeting-1320/probe/
// report.json (picked). Новые голоса не создаются, тон не повышается, речь
// не ускоряется.
export const M13_VOICES: Record<M13Role, { readonly name: string; readonly voiceId: string }> = {
  narrator: { name: "", voiceId: "" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  assistant: { name: "", voiceId: "" },
  son: { name: "", voiceId: "" },
};

// Кандидаты проб (только голоса, уже созданные в аккаунте проекта).
export const M13_PROBE_CANDIDATES: Record<
  Exclude<M13Role, "father">,
  readonly { readonly id: string; readonly name: string; readonly voiceId: string; readonly from: string }[]
> = {
  // взрослый мужской голос, отличный от голоса отца
  narrator: [
    { id: "boss", name: "KG-boss", voiceId: "yCcjraKUNFsfIv02eS9D", from: "№10 half-hour-2d" },
    { id: "nbfather", name: "NB2-father", voiceId: "xxKkhYUgtZTPTuHpktPy", from: "№11 no-backup-2d" },
    { id: "nbbrother", name: "NB2-brother", voiceId: "IRGPSiyjpLdMfh3zNzFo", from: "№11 no-backup-2d" },
  ],
  // естественный взрослый женский голос, деловая интонация
  assistant: [
    { id: "colleague", name: "KG-colleague", voiceId: "S87HaYymDP3SARzmBPgS", from: "№10 half-hour-2d" },
    { id: "teacher", name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "№10 half-hour-2d" },
    { id: "friend", name: "KG-friend", voiceId: "YFFd51gsFa9VT4xGD15W", from: "№11 no-backup-2d" },
  ],
  // мальчик 8–10 лет (без механического повышения тона)
  son: [
    { id: "remix2", name: "KG-son v7 remix-2", voiceId: "1c81DEBcmaJMj1QDHWU6", from: "№20, №30" },
    { id: "kgboy", name: "KG-boy a2-3", voiceId: "8QMDSJuOqCscZvQ6PqlL", from: "№22, №24" },
    { id: "kgson", name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM", from: "№10, №12" },
  ],
};

// ---------- Реплики ----------
// text — как звучит и как показывается в субтитрах; spoken — что уходит в
// TTS, если отличается (BalaGo → «Балаго», тире → запятая); tag — аудиотег
// eleven_v3 (не звучит, в субтитры не попадает). Время в голосе — словами
// (на экране — 13:20, 13:30, 14:30).
export type M13Line = {
  readonly id: string;
  readonly role: M13Role;
  readonly text: string;
  readonly spoken?: string;
  readonly tag?: string;
  readonly seed?: number;
  // число дублей при синтезе (по умолчанию M13_TAKES = 3)
  readonly takes?: number;
  // ручное деление субтитров на смысловые части (вместе = text)
  readonly subs?: readonly string[];
  readonly note: string; // режиссёрское пояснение (не озвучивается)
};

export const M13_LINES: readonly M13Line[] = [
  {
    id: "N01",
    role: "narrator",
    text: "Директордун күн тартибинде күн сайын бир жолугушуу бар эле. Саат бирден жыйырма мүнөт өткөндө.",
    tag: "[curious]",
    subs: ["Директордун күн тартибинде", "күн сайын бир жолугушуу бар эле.", "Саат бирден жыйырма мүнөт өткөндө."],
    note: "лёгкое любопытство, спокойно",
  },
  {
    id: "N02",
    role: "narrator",
    text: "Компаниянын аты да, адамдын аты-жөнү да, бөлмөнүн номери да жок.",
    note: "перечисление с паузами, загадка",
  },
  {
    id: "N03",
    role: "narrator",
    text: "Жаңы жардамчысы байкады: башка жолугушууларды жылдырат, кээ бирин онлайн өткөрөт. Муну болсо өзгөртпөйт.",
    note: "наблюдение, без оценки",
  },
  {
    id: "N04",
    role: "narrator",
    text: "Бир күнү маанилүү кардар саат бир жарымда келүүнү сунуштады.",
    subs: ["Бир күнү маанилүү кардар", "саат бир жарымда келүүнү сунуштады."],
    note: "деловито",
  },
  {
    id: "A01",
    role: "assistant",
    text: "Бул жолугушууңузду жылдырсак болобу?",
    note: "вежливо, по-деловому, с небольшим интересом",
  },
  {
    id: "F01",
    role: "father",
    text: "Кардарга саат эки жарымды сунушта. Ошого чейин кайтып келгенге аракет кылам.",
    subs: ["Кардарга саат эки жарымды сунушта.", "Ошого чейин кайтып келгенге аракет кылам."],
    note: "спокойно, уверенно, без драматизма",
  },
  {
    id: "N05",
    role: "narrator",
    text: "Белгиленген убакта директор ачкычын алып чыкты.",
    note: "ровно",
  },
  {
    id: "N06",
    role: "narrator",
    text: "Машинасы бизнес-борбордун жанынан өтүп, мектептин короосуна бурулду.",
    subs: ["Машинасы бизнес-борбордун", "жанынан өтүп,", "мектептин короосуна бурулду."],
    note: "ровно, лёгкое ожидание",
  },
  {
    id: "S01",
    role: "son",
    text: "Ата!",
    tag: "[excited]",
    note: "радостно позвал, увидев отца",
  },
  {
    id: "S02",
    role: "son",
    text: "Бүгүн тажрыйбабыз ийгиликтүү болду!",
    tag: "[excited]",
    note: "радость, хочет поделиться",
  },
  {
    id: "F02",
    role: "father",
    text: "Айтып берчи.",
    // короткая реплика (≈ 0,7 с): с тегом [warmly] произношение мягкое, и в
    // готовом миксе MMS слышал «а это перче»; без тега — «а эти берче».
    // В синтез идёт восклицание (слова те же, субтитр — text), шесть
    // дублей; прежний дубль тоже участвует в сравнении
    spoken: "Айтып берчи!",
    seed: 1600,
    takes: 6,
    note: "внимательно, тепло",
  },
  {
    id: "N07",
    role: "narrator",
    text: "Мына, аны күн сайын ким күтүп жүргөн экен.",
    tag: "[warmly]",
    note: "тепло, раскрытие",
  },
  {
    id: "N08",
    role: "narrator",
    text: "Ал уулун үйгө, чоң энесине жеткирди.",
    note: "спокойно",
  },
  {
    id: "N09",
    role: "narrator",
    text: "Жубайы башка райондо иштечү. Түштөн кийин жумуштан чыгууга көбүнчө мүмкүнчүлүгү жок эле.",
    note: "спокойно, без конфликта",
  },
  {
    id: "N10",
    role: "narrator",
    text: "Кеңсеге кайтып келе жатканда телефон чалды: кардар келип калыптыр.",
    subs: ["Кеңсеге кайтып келе жатканда телефон чалды:", "кардар келип калыптыр."],
    note: "деловито",
  },
  {
    id: "N11",
    role: "narrator",
    text: "Ал унаа токтотуучу жайда сүйлөшүүсүн бүтүрүп, кесиптештерине кирди.",
    note: "ровно",
  },
  {
    id: "N12",
    role: "narrator",
    text: "Дароо талкууга кошулду.",
    note: "уверенно",
  },
  {
    id: "N13",
    role: "narrator",
    text: "Кечинде жардамчысы жуманын күн тартибин тактады.",
    subs: ["Кечинде жардамчысы", "жуманын күн тартибин тактады."],
    note: "мягко",
  },
  {
    id: "A02",
    role: "assistant",
    text: "Эртең да ошол убактагы жолугушуу кала береби?",
    note: "уточняет, без иронии",
  },
  {
    id: "F03",
    role: "father",
    text: "Ооба. Уулумду мектептен алып кетем.",
    note: "спокойно и просто",
  },
  {
    id: "N14",
    role: "narrator",
    text: "Үйдө жубайлар күн сайынкы жолду кантип уюштурууну сүйлөштү. Жумуштагы жолугушууларын алдын ала пландагысы келишти.",
    subs: ["Үйдө жубайлар күн сайынкы жолду", "кантип уюштурууну сүйлөштү.", "Жумуштагы жолугушууларын", "алдын ала пландагысы келишти."],
    note: "тепло, спокойно",
  },
  {
    id: "N15",
    role: "narrator",
    text: "Атасы өзү варианттарды издеп, жубайына BalaGoнун сайтын көрсөттү.",
    spoken: "Атасы өзү варианттарды издеп, жубайына Балагонун сайтын көрсөттү.",
    note: "ровно, без рекламной интонации",
  },
  {
    id: "N16",
    role: "narrator",
    text: "Маалыматты чогуу окуп, мектепке барып-келүү үчүн алдын ала өтүнмө калтырышты.",
    subs: ["Маалыматты чогуу окуп,", "мектепке барып-келүү үчүн", "алдын ала өтүнмө калтырышты."],
    note: "ровно",
  },
  {
    id: "N17",
    role: "narrator",
    text: "Уктаар алдында уулу тажрыйбасынын сүрөтүн алып келди.",
    tag: "[softly]",
    note: "тихо, тепло",
  },
  {
    id: "S03",
    role: "son",
    text: "Машинада баарын айтып үлгүргөн жокмун. Азыр айтып берсем болобу?",
    note: "желание рассказать, немного осторожно",
  },
  {
    id: "N18",
    role: "narrator",
    text: "Атасы жумуш кагаздарын четке жылдырып, столдон орун бошотту.",
    tag: "[softly]",
    note: "тихо, тепло",
  },
  {
    id: "F04",
    role: "father",
    text: "Жаныма отур. Баарын башынан айтып бер.",
    tag: "[warmly]",
    note: "тепло, внимательно",
  },
  {
    id: "N19",
    role: "narrator",
    text: "BalaGo — Бишкектеги балдар үчүн такси. Үйдөн мектепке, мектептен үйгө.",
    spoken: "Балаго, Бишкектеги балдар үчүн такси. Үйдөн мектепке, мектептен үйгө.",
    tag: "[warmly]",
    note: "мягко и уверенно",
  },
  {
    id: "N20",
    role: "narrator",
    // оба способа связи (AGENTS.md); номер — на экране, вслух не читается
    text: "Каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз.",
    spoken: "Каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге вотсап аркылуу жазыңыз.",
    // три части по ≤ 2 строки: плашка наверху не заходит на логотип
    subs: ["Каттоо үчүн профилдеги шилтемеге өтүңүз", "же экрандагы номерге", "WhatsApp аркылуу жазыңыз."],
    note: "спокойно, отчётливо",
  },
  {
    id: "N21",
    role: "narrator",
    text: "BalaGo менен жолго чыгалы!",
    spoken: "Балаго менен жолго чыгалы!",
    tag: "[warmly]",
    seed: 1421,
    note: "тепло, уверенно",
  },
];

// ---------- Речевые сегменты на шкале ----------
// mode: narration — закадровый текст (рты закрыты); live — живая речь в кадре.
// gap — пауза перед репликой: от начала сцены (первая реплика сцены) или
// от конца предыдущей реплики той же сцены. В паузах — действие.
export type M13Mode = "narration" | "live";
export type M13SegSpec = {
  readonly id: string;
  readonly scene: M13SceneId;
  readonly gap: number;
  readonly action: string; // связанное действие (для таблицы реплик)
  readonly card?: true; // с этой реплики на экране — карточка с контактами
};

export const M13_SEG_SPECS: readonly M13SegSpec[] = [
  { id: "N01", scene: "calendar", gap: 1.4, action: "крупно «13:20» → отъезд: пункт рабочего календаря среди встреч" },
  { id: "N02", scene: "calendar", gap: 1.6, action: "у пункта пустые поля «Компания», «Аты-жөнү», «Бөлмө»; дни меняются — 13:20 остаётся" },
  { id: "N03", scene: "notice", gap: 1.0, action: "общий план офиса → помощница за монитором; встреча 11:00 переезжает на 16:00, другая — «Онлайн»; 13:20 на месте" },
  { id: "N04", scene: "notice", gap: 0.8, action: "уведомление заказчика: крупно «13:30»" },
  { id: "A01", scene: "ask", gap: 1.2, action: "помощница у двери кабинета спрашивает" },
  { id: "F01", scene: "ask", gap: 1.3, action: "директор смотрит на 13:20, пауза, поднимает взгляд, отвечает; в календаре — «14:30»" },
  { id: "N05", scene: "drive", gap: 1.0, action: "часы 13:20; рука берёт ключи со стола; директор выходит" },
  { id: "N06", scene: "drive", gap: 2.4, action: "дверь машины; бизнес-центр остаётся позади; поворот во двор" },
  { id: "S01", scene: "reveal", gap: 2.6, action: "школьный вход; сын с рюкзаком замечает отца: «Ата!»" },
  { id: "S02", scene: "reveal", gap: 1.3, action: "пауза узнавания; сын подбегает и рассказывает" },
  { id: "F02", scene: "reveal", gap: 5.0, action: "задняя дверь → сын садится → ремень через плечо → защёлка; «Айтып берчи»" },
  { id: "N07", scene: "reveal", gap: 0.8, action: "сын рассказывает в машине; часы 13:20 → пункт календаря обретает смысл" },
  { id: "N08", scene: "grandma", gap: 1.4, action: "порог квартиры: бабушка встречает внука, отец ждёт, пока он войдёт" },
  { id: "N09", scene: "grandma", gap: 1.2, action: "мама за работой в офисе в другом районе" },
  { id: "N10", scene: "back", gap: 1.8, action: "машина встаёт на парковке; звонок, отец отвечает" },
  { id: "N11", scene: "back", gap: 0.4, action: "отец заканчивает разговор, убирает телефон, идёт в офис" },
  { id: "N12", scene: "back", gap: 1.4, action: "переговорная: заказчик и сотрудники; директор садится и включается" },
  { id: "N13", scene: "evening", gap: 0.8, action: "вечерний свет; помощница с планшетом у кабинета, неделя: 13:20 каждый день" },
  { id: "A02", scene: "evening", gap: 0.5, action: "помощница спрашивает о завтра" },
  { id: "F03", scene: "evening", gap: 0.6, action: "директор спокойно отвечает; помощница понимает, кивает, возвращается к работе" },
  { id: "N14", scene: "home", gap: 1.0, action: "дома вечером: супруги за столом, календарь и рабочие дела" },
  { id: "N15", scene: "home", gap: 0.4, action: "отец ищет в телефоне, показывает жене BalaGo; она подсаживается" },
  { id: "N16", scene: "home", gap: 0.3, action: "форма: «Аты-жөнү», «Дарек», «Мектеп», «Убакыт» → «Алдын ала өтүнмө жөнөтүлдү»; «ҮЙ → МЕКТЕП → ҮЙ»" },
  { id: "N17", scene: "drawing", gap: 1.0, action: "отец за столом с бумагами; сын подходит с рисунком" },
  { id: "S03", scene: "drawing", gap: 0.6, action: "крупно сын и рисунок; спрашивает" },
  { id: "N18", scene: "drawing", gap: 1.6, action: "пауза; отец поднимает взгляд; рука отодвигает бумаги, освобождает место" },
  { id: "F04", scene: "drawing", gap: 0.5, action: "отец приглашает; сын садится рядом, кладёт рисунок; отец слушает" },
  { id: "N19", scene: "brand", gap: 0.6, action: "BalaGo, «Бишкек • Балдар үчүн такси», «ҮЙ → МЕКТЕП → ҮЙ», белый Volkswagen Polo" },
  { id: "N20", scene: "brand", gap: 0.4, card: true, action: "карточка с контактами: «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз», крупно номер WhatsApp" },
  { id: "N21", scene: "brand", gap: 0.5, action: "карточка неподвижна до конца; после последнего слова — не меньше 3 с" },
];

export const modeOf = (lineId: string): M13Mode => (lineId.startsWith("N") ? "narration" : "live");

export const lineById = (id: string) => {
  const l = M13_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Раскладка шкалы по фактической длительности речи ----------
export type M13SceneSpan = {
  readonly id: M13SceneId;
  readonly title: string;
  readonly from: number;
  readonly to: number;
}; // кадры
export type M13SegAt = {
  readonly id: string;
  readonly scene: M13SceneId;
  readonly at: number;
  readonly end: number;
};
export type M13Layout = {
  readonly scenes: readonly M13SceneSpan[];
  readonly segments: readonly M13SegAt[];
  readonly frames: number;
  readonly contactFrom: number; // кадр, с которого карточка с контактами неподвижна
};

// Финальная сцена (brand): анимированное вступление бренда (не короче
// BRAND_INTRO с), затем с реплики о контактах (card) — неподвижная карточка
// до конца ролика: не меньше M13_CONTACT_FRAMES кадров и не меньше
// M13_FINAL_HOLD с после последнего слова.
export const BRAND_INTRO = 5;

export const layoutTimeline = (speech: (id: string) => number): M13Layout => {
  const fps = M13_VIDEO.fps;
  const scenes: M13SceneSpan[] = [];
  const segments: M13SegAt[] = [];
  let frame = 0;
  for (const sc of M13_SCENE_SPECS) {
    const start = frame / fps;
    let t = start;
    let first = true;
    for (const sg of M13_SEG_SPECS.filter((x) => x.scene === sc.id)) {
      const at = Math.round((first ? start + sg.gap : t + sg.gap) * 1000) / 1000;
      const end = at + speech(sg.id);
      segments.push({ id: sg.id, scene: sc.id, at, end });
      t = end;
      first = false;
    }
    let need = first ? sc.min : Math.max(sc.min, t - start + sc.tail);
    if (sc.id === "brand") need = Math.max(need, BRAND_INTRO + M13_CONTACT_FRAMES / fps, t - start + M13_FINAL_HOLD + 0.2);
    const len = Math.ceil(need * fps);
    scenes.push({ id: sc.id, title: sc.title, from: frame, to: frame + len });
    frame += len;
  }
  // карточка с контактами — с начала реплики card (за 4 кадра до первого
  // слова), но не позже чем за M13_CONTACT_FRAMES кадров до конца
  const cardSeg = segments.find((sg) => M13_SEG_SPECS.find((x) => x.id === sg.id)?.card);
  const latest = frame - M13_CONTACT_FRAMES;
  const contactFrom = cardSeg ? Math.min(latest, Math.round(cardSeg.at * fps) - 4) : latest;
  return { scenes, segments, frames: frame, contactFrom };
};

// Оценка длительности речи по тексту — только до генерации озвучки.
export const estimateSpeech = (id: string) => {
  const l = lineById(id);
  const text = l.spoken ?? l.text;
  const letters = [...text].filter((c) => /\p{L}/u.test(c)).length;
  const marks = (text.match(/[.,!?—:]/g) ?? []).length;
  return letters / 13 + marks * 0.25;
};

// ---------- Экранные надписи (кыргызча) ----------
export const M13_TEXT = {
  title: "13:20дагы жолугушуу",
  brand: "BalaGo",
  tagline: "Балдар үчүн такси",
  city: "Бишкек",
  route: "ҮЙ → МЕКТЕП → ҮЙ",
  routeParts: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
  everyDay: ["Күн сайын.", "Бир эле убакыт."],
  // рабочий календарь директора
  calendar: {
    app: "Календарь",
    owner: "Директордун күн тартиби",
    days: ["Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума"],
    short: ["Дш", "Шш", "Шр", "Бш", "Жм"],
    mystery: "13:20",
    // пустые поля загадочного пункта
    fields: ["Компания", "Аты-жөнү", "Бөлмө"],
    // встречи по дням (время — название); 13:20 — каждый день без названия
    meetings: [
      [
        ["09:00", "Планёрка"],
        ["11:00", "Отчёт: III чейрек"],
        ["15:00", "Өнөктөштөр менен"],
      ],
      [
        ["09:30", "Бюджет"],
        ["11:30", "Жаңы долбоор"],
        ["16:00", "Келишимдер"],
      ],
      [
        ["10:00", "Маркетинг"],
        ["12:00", "Кадрлар бөлүмү"],
        ["15:30", "Видео чалуу"],
      ],
    ],
    moved: { title: "Отчёт: III чейрек", from: "11:00", to: "16:00" },
    online: "Онлайн",
    client: { label: "Кардар", time: "13:30", note: "Кардар сунуштады" },
    proposal: { label: "Кардарга сунуш", time: "14:30" },
    // после раскрытия (только с 5-й сцены)
    meaning: "Уулум — мектеп",
  },
  clock: "13:20",
  // уведомление о сообщении заказчика (без мелкой переписки)
  notify: { from: "Кардар", text: "Жолугушуу: 13:30?" },
  // таблички и вывески
  office: { building: "Бизнес-борбор", meeting: "Жолугушуу бөлмөсү", door: "Директор" },
  parking: "P",
  school: "Мектеп",
  // экран заказчика в переговорной (без мелкого текста)
  slide: { title: "Долбоордун планы", rows: ["Мөөнөттөр", "Бюджет", "Кийинки кадам"] },
  // неделя на планшете помощницы (вечер)
  week: { title: "Ушул жума", tomorrow: "Эртең" },
  // поиск и страница BalaGo (иллюстративная карточка, не копия сайта)
  search: { query: "Балдарды мектептен алып келүү", hint: "Издөө" },
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    points: ["Үйдөн мектепке жана кайра", "Алдын ала макулдашылган убакыт"],
    cta: "Алдын ала өтүнмө",
  },
  form: {
    title: "Алдын ала өтүнмө",
    fields: ["Аты-жөнү", "Дарек", "Мектеп", "Убакыт"],
    send: "Өтүнмө калтыруу",
    sent: "Алдын ала өтүнмө жөнөтүлдү",
  },
  // рисунок сына: опыт с магнитом и скрепками
  drawing: { title: "Тажрыйба", magnet: "магнит" },
  // финальная карточка с контактами (AGENTS.md): Бишкек и оба способа связи
  cta: {
    brand: "BalaGo",
    city: "Бишкек • Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    link: "Профилдеги шилтемеге өтүңүз",
    whatsappCall: "же WhatsApp аркылуу жазыңыз",
    whatsappLabel: "WhatsApp:",
    phone: "0998 08 38 28",
  },
} as const;
