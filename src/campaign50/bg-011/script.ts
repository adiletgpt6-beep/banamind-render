// BalaGo-50, выпуск №12 / BG-011 — «Ключи на холодильнике»
// (композиция BalaGoBG011, 2D, 1080×1920, 30 fps, ≈ 70 с).
//
// Комедия положений: утром папа и мама ищут ключи от машины в папках и
// портфеле, а связка всё время висит на магнитном крючке сбоку
// холодильника. Стоп-кадры с подписями, split-screen из трёх полос
// (папа — портфель, мама — стол, сын уже одет и ждёт), сын показывает на
// крючок — все смеются. Но рядом на доске три записки «ким алып барат?»:
// ключи нашлись, а вопрос «кто сегодня отвезёт» возвращается каждое утро.
// Вечером родители выносят школьный маршрут в отдельный план, и мама сама
// находит BalaGo и читает, как он работает (без мгновенной заявки и без
// выполненной поездки). Визуальный матч-кат: магнитный крючок для ключей
// превращается в жёлтую линию маршрута ҮЙ → МЕКТЕП → ҮЙ и в финал.
//
// Сценарий: campaigns/balago-50/episodes/12-BG-011.md.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG11_VIDEO = {
  id: "BalaGoBG011",
  output: "balago-bg-011",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-011/voice",
  audioDir: "audio/campaign50/bg-011",
  logo: "assets/campaign50/bg-011/logo.png",
  // Общая длительность считается по озвучке (timing.ts), но не короче:
  minSec: 64,
  maxSec: 84,
} as const;

// ---------- Сцены ----------
// Длина сцены — не меньше len (с); если речь длиннее, сцена растягивается
// так, чтобы после последней реплики оставалось tail секунд.
export type Bg11SceneId = "hook" | "split" | "found" | "plan" | "route" | "cta";

export const BG11_SCENES: readonly {
  readonly id: Bg11SceneId;
  readonly title: string;
  readonly len: number;
  readonly tail: number;
}[] = [
  { id: "hook", title: "1. Хук: ключи на крючке, стоп-кадр", len: 7, tail: 1.6 },
  { id: "split", title: "2. Split-screen: портфель, стол, сын", len: 10.5, tail: 3.0 },
  { id: "found", title: "3. Ключи нашлись → записки на доске", len: 12.5, tail: 1.4 },
  { id: "plan", title: "4. Вечером: отдельный план, мама находит BalaGo", len: 13.5, tail: 5.6 },
  { id: "route", title: "5. ҮЙ → МЕКТЕП → ҮЙ, группа, пробная поездка", len: 11, tail: 1.4 },
  // финал: оба способа связи и номер на экране всё время после
  // BG11_CONTACTS_IN, после последнего слова ≥ 3 с (берём 3,6 с)
  { id: "cta", title: "6. Финал: крючок → линия маршрута → контакты", len: 17, tail: 3.6 },
];

// Финальный экран с контактами появляется через столько секунд после
// начала сцены cta и остаётся до конца ролика.
export const BG11_CONTACTS_IN = 2.2;

// ---------- Голоса ----------
export type Bg11Role = "father" | "mother" | "son" | "narrator";

export const BG11_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 1112,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые голоса проекта (ElevenLabs Voice Design, кыргызская речь носителя),
// проверенные в 2D-роликах №10–12; новые голоса не создаются.
export const BG11_VOICES: Record<Bg11Role, { readonly name: string; readonly voiceId: string; readonly from: string }> = {
  // спокойный низкий голос папы (≈110 Гц, CER 2,2 %)
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm", from: "half-hour-2d" },
  // тёплый мягкий голос мамы (CER 1,8 %)
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p", from: "half-hour-2d" },
  // светлый звонкий голос сына (≈286 Гц, CER 4,2 %)
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM", from: "half-hour-2d" },
  // спокойный доброжелательный голос диктора (CER 2,1 %)
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "half-hour-2d" },
};

// ---------- Реплики ----------
export type Bg11Line = {
  readonly id: string;
  readonly role: Bg11Role;
  readonly scene: Bg11SceneId;
  // Начало речи: секунды от начала сцены, но не раньше чем через gap
  // секунд после конца предыдущей реплики.
  readonly at: number;
  readonly gap?: number;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

export const BG11_LINES: readonly Bg11Line[] = [
  {
    id: "n01",
    role: "narrator",
    scene: "hook",
    at: 0.5,
    text: "Ачкыч кайда? Кызыгы, ал дайыма эле көз алдында болот.",
    tag: "[curious]",
  },
  // сын — к папе на «сиз»
  { id: "s01", role: "son", scene: "split", at: 3.6, text: "Ата, ачкычты таптыңызбы?", tag: "[curious]" },
  { id: "f01", role: "father", scene: "split", at: 0, gap: 0.35, text: "Азыр, балам!", tag: "[excited]" },
  { id: "m01", role: "mother", scene: "split", at: 0, gap: 0.5, text: "Бүгүн ким жеткирет эле?", tag: "[thoughtful]" },
  {
    id: "n02",
    role: "narrator",
    scene: "found",
    at: 4.6,
    text: "Ачкыч табылды. Бирок күн сайын кайра чыккан суроо калды: баланы мектепке ким жеткирет?",
  },
  {
    id: "m02",
    role: "mother",
    scene: "plan",
    at: 3.4,
    text: "Эртең менен шашылбай, каттамды алдын ала уюштуруунун жолун издейли.",
    tag: "[gently]",
  },
  {
    id: "n03",
    role: "narrator",
    scene: "route",
    at: 0.6,
    text: "BalaGo — Бишкектеги балдар үчүн алдын ала уюштурулган такси. Ылайыктуу топ түзүлгөндөн кийин биринчи толук сыноо сапары акысыз.",
    spoken: "БалаГо — Бишкектеги балдар үчүн алдын ала уюштурулган такси. Ылайыктуу топ түзүлгөндөн кийин биринчи толук сыноо сапары акысыз.",
  },
  {
    id: "n04",
    role: "narrator",
    scene: "cta",
    at: 0.6,
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
    tag: "[warmly]",
  },
  {
    id: "n05",
    role: "narrator",
    scene: "cta",
    at: 0,
    gap: 0.35,
    text: "Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken:
      "Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
  },
  {
    id: "n06",
    role: "narrator",
    scene: "cta",
    at: 0,
    gap: 0.4,
    text: "BalaGo менен жолго чыгалы!",
    spoken: "БалаГо менен жолго чыгалы!",
    tag: "[warmly]",
    seed: 1190,
  },
];

export const lineById = (id: string) => {
  const l = BG11_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const BG11_TEXT = {
  // подписи стоп-кадров (комедия положений)
  freeze1: { keys: "Ачкыч — ушул жерде", parents: "Ата менен апа — издөөдө" },
  freeze2: { title: "Бүгүн ким?" },
  // три записки на доске
  notes: [
    { day: "Дүйшөмбү", q: "ким алып барат?" },
    { day: "Шейшемби", q: "ким алып барат?" },
    { day: "Шаршемби", q: "ким алып барат?" },
  ],
  evening: "Ошол эле кечте",
  // отдельный план школьного маршрута
  plan: {
    title: "Мектеп каттамы",
    rows: [
      { time: "07:30", route: "Үй → Мектеп" },
      { time: "13:00", route: "Мектеп → Үй" },
    ],
    days: "Дүйшөмбү – Жума",
    question: "Ким жеткирет?",
  },
  // поиск в телефоне мамы и страница BalaGo («как это работает»)
  search: {
    query: "Бишкек балдар мектеп каттамы",
    resultTitle: "BalaGo — Балдар үчүн такси",
    resultNote: "Бишкек • Үй → Мектеп → Үй",
  },
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    how: "Кантип иштейт?",
    steps: [
      { title: "Арыз", note: "Дарек жана сабак убактысы" },
      { title: "Ылайыктуу топ", note: "3–4 бала • 2 жумага чейин издөө" },
      { title: "Биринчи толук сыноо сапары", note: "Топ түзүлгөндөн кийин", badge: "Акысыз" },
    ],
  },
  // инфографика маршрута
  route: {
    title: "Бир толук сапар",
    stops: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    am: "Эртең менен",
    pm: "Сабактан кийин",
    steps: ["Арыз", "Топ түзүлөт", "Сыноо сапары — акысыз"],
    note: "Топ түзүлгөндөн кийин",
  },
  cta: {
    brand: "BalaGo",
    city: "Бишкек • Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    link: "Профилдеги шилтемеге өтүңүз",
    or: "же WhatsApp аркылуу жазыңыз",
    whatsappLabel: "WhatsApp:",
    whatsappNumber: "0998 08 38 28",
  },
} as const;
