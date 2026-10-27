// BalaGo-50, выпуск №39 / BG-039 «Сапар үзгүлтүккө учурасачы?»
// (композиция BalaGoBG039). Сценарий: campaigns/balago-50/episodes/39-BG-039.md
// (утверждён владельцем 15.10.2026, APPROVAL-36-50.md).
//
// Механика эпизода — двусторонний бумажный билет одного полного сапара:
// верх «ҮЙ → МЕКТЕП» (утро) выполнен, низ «МЕКТЕП → ҮЙ» по причине сервиса
// не выполнен и теряет цвет, а вместе с ним блекнет весь билет — сапар
// считается одним целым. Отец (ответственный взрослый, ребёнок дома рядом
// с ним) сам переворачивает билет и спрашивает, что будет с сапаром.
// Затем — действующее правило сайта и отличие от скидки за пропуски.
//
// ВАЖНО — правило компенсации сверено с исходным кодом сайта
// adiletzainidinov/BalaGo (main 469fbdc, 13.10.2026): на сайте показывается
// только шкала src/data/serviceFailureCompensation.ts (блок ServiceGuarantee
// и ответ FAQ «service-failure»): сапары, сорванные по причине сервиса,
// считаются по каждому блоку из 10 запланированных сапаров; 1–3 → +1,
// 4–5 → +2, 6–7 → +3, 8–9 → +4, 10 → +5 сапаров акысыз; «Компенсация
// сиздин пакетиңизге кошулат»; пропуски ребёнка — отдельно. Прежняя
// формулировка «весь день бесплатен и не списывается из пакета» удалена
// с сайта коммитом 8d505c3 («remove old mixed logic», 19.09.2026) и в ролике
// не используется. Поэтому реплика n3 и надписи сцены правила изложены
// по действующему правилу; остальные реплики — текст сценария.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG39_VIDEO = {
  id: "BalaGoBG039",
  output: "balago-bg-039",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-039",
  sfxDir: "audio/campaign50/bg-039/sfx",
} as const;

// ---------- Правило компенсации (единственный источник цифр ролика) ----------
// Та же формула, что getServiceFailureCompensation() на сайте:
// 0 → 0; иначе max(1, floor(min(n, 10) / 2)).
export const BG39_COMP_WINDOW = 10;
export const compensationFor = (failures: number): number => {
  if (!Number.isFinite(failures) || failures <= 0) return 0;
  return Math.max(1, Math.floor(Math.min(Math.floor(failures), BG39_COMP_WINDOW) / 2));
};
// Публичная шкала одного блока из 10 сапаров (как на сайте).
export const BG39_COMP_TIERS = [
  { min: 1, max: 3, rides: 1 },
  { min: 4, max: 5, rides: 2 },
  { min: 6, max: 7, rides: 3 },
  { min: 8, max: 9, rides: 4 },
  { min: 10, max: 10, rides: 5 },
] as const;

// ---------- Сцены ----------
// lead — от начала сцены до первой реплики, tail — после последней,
// min — минимальная длительность сцены (с). Длительность сцены считается
// по фактической озвучке (timing.ts) — речь никогда не ускоряется.
export type Bg39SceneId = "hook" | "father" | "halves" | "rule" | "split" | "cta";

export const BG39_SCENES: readonly {
  readonly id: Bg39SceneId;
  readonly title: string;
  readonly lead: number;
  readonly tail: number;
  readonly min: number;
}[] = [
  { id: "hook", title: "1. Билет: бир бөлүгү аткарылган жок", lead: 1.5, tail: 1.0, min: 6 },
  { id: "father", title: "2. Ата билетти өзү оодарат", lead: 2.6, tail: 1.2, min: 11 },
  { id: "halves", title: "3. Эки бөлүк — бир толук сапар", lead: 0.8, tail: 2.4, min: 12 },
  { id: "rule", title: "4. Кызматтын себеби → компенсация", lead: 0.9, tail: 2.2, min: 16 },
  { id: "split", title: "5. Эки башка эреже", lead: 1.2, tail: 1.6, min: 11 },
  // Финал: все контакты на экране с начала сцены; после последнего слова
  // кадр держится ещё не меньше 3 с (tail).
  { id: "cta", title: "6. Финал: Бишкек жана байланыш", lead: 1.0, tail: 3.8, min: 12 },
];

// ---------- Голоса ----------
// Роли совпадают с ролями 2D-ролика №12 (src/two-schedules-2d), чтобы губы
// персонажей двигались через его готовый риг, а синтез шёл его функциями
// (scripts/lib/ts2d-tts.mjs: ElevenLabs eleven_v3, ky, stability 0.5,
// similarity 0.8; импорт без изменений). Голоса — готовые кыргызские
// голоса проекта (ElevenLabs Voice Design), новые не создаются:
// narrator — KG-teacher (спокойный доброжелательный, CER 2,1 %),
// father — KG-husband (спокойный низкий, CER 2,2 %).
// Таблица ниже — для проверки (тест сверяет её с TS2_VOICES).
export type Bg39Role = "narrator" | "father";

export const BG39_VOICES: Record<Bg39Role, { readonly name: string; readonly voiceId: string; readonly from: string }> = {
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "half-hour-2d" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm", from: "half-hour-2d" },
};

export type Bg39Line = {
  readonly id: string;
  readonly role: Bg39Role;
  readonly scene: Bg39SceneId;
  readonly text: string; // как в сценарии (титры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
  readonly gap?: number; // пауза перед репликой внутри сцены (с)
};

export const BG39_LINES: readonly Bg39Line[] = [
  // 1. Хук (текст сценария без изменений).
  { id: "n1", role: "narrator", scene: "hook", text: "Кызматтан улам жолдун бир бөлүгү аткарылбай калсачы?", tag: "[curious]" },
  // 2. Ата. Сценарий: «Бир жол толук сапар болуп эсептелет го…» — уточнено
  // только слово («барып-келүү» = туда и обратно), смысл тот же.
  {
    id: "f1",
    role: "father",
    scene: "father",
    text: "Барып-келүү бир толук сапар болуп эсептелет го. Анда бүтүндөй сапар үчүн эмне болот?",
    tag: "[thoughtful]",
  },
  // 3. Две части одного сапара (текст сценария).
  {
    id: "n2",
    role: "narrator",
    scene: "halves",
    text: "BalaGo'до бир толук сапар эки бөлүктөн турат: эртең менен мектепке, сабактан кийин үйгө.",
    spoken: "БалаГодо бир толук сапар эки бөлүктөн турат: эртең менен мектепке, сабактан кийин үйгө.",
  },
  // 4. Действующее правило сайта (см. комментарий в начале файла).
  {
    id: "n3",
    role: "narrator",
    scene: "rule",
    text: "Эгер сапар кызматтын себебинен ишке ашпай калса, мындай учурлар ар бир он сапар боюнча эсептелет. Алар бирден үчкө чейин болсо, пакетиңизге бир акысыз сапар кошулат; төрт же беш болсо — эки акысыз сапар. Шкала андан ары да ушундай уланат.",
  },
  // 5. Отличие от скидки за пропуски ребёнка (текст сценария).
  {
    id: "n4",
    role: "narrator",
    scene: "split",
    text: "Бул — баланын ооруп сабакка барбай калган күнүнө тиешелүү арзандатуудан башка эреже. Эки шартты чаташтырбоо маанилүү.",
  },
  // 6. Финал (текст сценария дословно; в TTS — кириллицей).
  {
    id: "n5",
    role: "narrator",
    scene: "cta",
    text: "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
    spoken:
      "БалаГо — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге Ватсап аркылуу жазыңыз. БалаГо менен жолго чыгалы!",
    tag: "[warmly]",
  },
];

export const bg39LineById = (id: string) => {
  const l = BG39_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const BG39_TEXT = {
  example: "Шарттуу мисал",
  hookTitle: "КЫЗМАТТАН УЛАМ ҮЗГҮЛТҮК БОЛСО?",
  ticket: {
    brand: "BalaGo",
    kind: "1 толук сапар",
    morning: "Эртең менен",
    morningRoute: "ҮЙ → МЕКТЕП",
    afternoon: "Сабактан кийин",
    afternoonRoute: "МЕКТЕП → ҮЙ",
    done: "Аткарылды",
    // сценарий: «Кызмат аткарган жок»; уточнено (редактор): пассив, как
    // «Аткарылды», без двусмысленности «кызмат аткаруу» (нести службу)
    failed: "Аткарылган жок",
    stamp: "КЫЗМАТТЫН СЕБЕБИ",
  },
  father: { equation: "1 толук сапар = эки бөлүк" },
  halves: {
    title: "Эки бөлүк — бир толук сапар",
    whole: "Бир бөлүгү болбой калса — сапар толук аткарылбайт",
  },
  rule: {
    title: "Кызматтын себеби → компенсация",
    window: `Ар бир ${BG39_COMP_WINDOW} сапардын ичинде`,
    caseLabel: "1 учур",
    printed: { big: "+1", small: "сапар акысыз" },
    pack: "Сиздин пакетиңиз",
    added: "Компенсация пакетиңизге кошулат",
    tiers: BG39_COMP_TIERS.map((t) => ({
      range: t.min === t.max ? `${t.min} жолу` : `${t.min}–${t.max} жолу`,
      result: `+${t.rides} сапар акысыз`,
    })),
  },
  split: {
    title: "Эки башка эреже",
    service: { label: "Кызматтын себеби", result: "Өзүнчө компенсация", sub: "акысыз сапар пакетке кошулат" },
    absence: { label: "Баланын өзү барбаган күн", result: "Өзүнчө арзандатуу", sub: "мисалы, ооруп калса" },
  },
  cta: {
    brand: "BalaGo",
    city: "Бишкек • Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    link: "Профилдеги шилтемеге өтүңүз",
    or: "же WhatsApp аркылуу жазыңыз",
    whatsappLabel: "WhatsApp:",
    whatsappNumber: "0998 08 38 28",
    slogan: "BalaGo менен жолго чыгалы!",
  },
} as const;
