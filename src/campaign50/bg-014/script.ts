// BalaGo-50, выпуск №15 / BG-014 — «Кызыл кроссовкалар» («Красные кроссовки»)
// (композиция BalaGoBG014, 2D, 1080×1920, 30 fps, ≈ 65–75 с).
//
// Приём: детский POV и добрая визуальная комедия. Ярко-красные кроссовки
// сына — единственный красный акцент на бело-жёлтом фоне и повторяющийся
// мотив: шнурки завязываются сами (стоп-моушн), стоят неподвижно, пока
// вокруг кружат утренние напоминания, и в конце развязываются в две
// жёлтые линии маршрута ҮЙ → МЕКТЕП → ҮЙ.
//
// Причинно-следственная ось: сын давно готов, родители дома утром ещё
// выясняют, кто отвезёт его в школу. Мальчик (на «сиз») спокойно
// спрашивает, почему взрослые всё ещё ищут время. Мама останавливает
// хаотичный календарь и предлагает организовать маршрут заранее, папа
// закрывает ноутбук и находит BalaGo — родители вместе смотрят условия:
// заявка → подбор группы → первая бесплатная полная пробная поездка.
// Ребёнок никуда не уезжает один, поездка BalaGo не показана как уже
// состоявшаяся.
//
// Сценарий: campaigns/balago-50/episodes/15-BG-014.md.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG14_VIDEO = {
  id: "BalaGoBG014",
  output: "balago-bg-014",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-014/voice",
  audioDir: "audio/campaign50/bg-014",
  logo: "assets/campaign50/bg-014/logo.png",
  // Общая длительность считается по озвучке (timing.ts), но не короче:
  minSec: 62,
  maxSec: 90,
} as const;

// ---------- Сцены ----------
// Длина сцены — не меньше len (с); если речь длиннее, сцена растягивается
// так, чтобы после последней реплики оставалось tail секунд.
export type Bg14SceneId = "hook" | "plan" | "match" | "decide" | "laces" | "cta";

export const BG14_SCENES: readonly {
  readonly id: Bg14SceneId;
  readonly title: string;
  readonly len: number;
  readonly tail: number;
}[] = [
  { id: "hook", title: "1. Кроссовки сами завязываются: «Мен даярмын!»", len: 5.6, tail: 0.7 },
  { id: "plan", title: "2. С высоты ребёнка: кто отвезёт?", len: 10, tail: 1.3 },
  { id: "match", title: "3. Кроссовки неподвижны, напоминания кружат", len: 12, tail: 1.0 },
  // после реплики мамы: папа закрывает ноутбук, подходит и открывает BalaGo
  { id: "decide", title: "4. Мама останавливает хаос, папа находит BalaGo", len: 12, tail: 5.6 },
  // после диктора: сын поднимает взгляд на родителей
  { id: "laces", title: "5. Шнурки → маршрут ҮЙ → МЕКТЕП → ҮЙ", len: 13, tail: 2.6 },
  // финал: оба способа связи и номер на экране всё время сцены,
  // после последнего слова ≥ 3 с (берём 3,6 с)
  { id: "cta", title: "6. Финал: Бишкек, профиль, WhatsApp", len: 16, tail: 3.6 },
];

// Финальный экран с контактами появляется через столько секунд после
// начала сцены cta и остаётся до конца ролика.
export const BG14_CONTACTS_IN = 0.8;

// ---------- Голоса ----------
export type Bg14Role = "mother" | "father" | "son" | "narrator";

export const BG14_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 1415,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые голоса проекта (ElevenLabs Voice Design, кыргызская речь),
// проверенные в 2D-роликах №10–12 и BG-006/BG-007; новые не создаются.
export const BG14_VOICES: Record<Bg14Role, { readonly name: string; readonly voiceId: string; readonly from: string }> = {
  // тёплый голос мамы
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p", from: "half-hour-2d" },
  // спокойный низкий голос папы
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm", from: "half-hour-2d" },
  // светлый звонкий голос сына
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM", from: "half-hour-2d" },
  // спокойный доброжелательный голос диктора
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "half-hour-2d" },
};

// ---------- Реплики ----------
export type Bg14Line = {
  readonly id: string;
  readonly role: Bg14Role;
  readonly scene: Bg14SceneId;
  // Начало речи: секунды от начала сцены, но не раньше чем через gap
  // секунд после конца предыдущей реплики.
  readonly at: number;
  readonly gap?: number;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

export const BG14_LINES: readonly Bg14Line[] = [
  // сын — родителям, на «сиз» (сиздер)
  { id: "s01", role: "son", scene: "hook", at: 1.9, text: "Мен даярмын! А сиздерчи?", tag: "[excited]" },
  { id: "m01", role: "mother", scene: "plan", at: 1.0, text: "Бүгүн мектепке ким жеткирет?", tag: "[hurried]" },
  {
    id: "f01",
    role: "father",
    scene: "plan",
    at: 0,
    gap: 0.45,
    text: "Менин эртең менен жыйыным бар. Сиздин график кандай?",
    tag: "[apologetic]",
  },
  {
    id: "s02",
    role: "son",
    scene: "match",
    at: 3.4,
    text: "Эмне үчүн мен даяр болгондо сиздер дагы эле убакыт издейсиздер?",
    tag: "[curious]",
  },
  {
    id: "n01",
    role: "narrator",
    scene: "match",
    at: 0,
    gap: 0.7,
    text: "Бала даяр. Ал эми чоңдор жолдун графигин кайрадан сүйлөшүп жатышат.",
    tag: "[gently]",
  },
  {
    id: "m02",
    role: "mother",
    scene: "decide",
    at: 1.9,
    text: "Күн сайын шашылбай, мектепке каттамды алдын ала уюштуруунун жолун карайлы.",
    tag: "[thoughtful]",
  },
  {
    id: "n02",
    role: "narrator",
    scene: "laces",
    at: 1.4,
    text: "BalaGo — Бишкектеги балдар үчүн такси. Үйдөн мектепке, кайра үйгө каттам топ түзүлгөндөн кийин уюштурулат. Биринчи толук сыноо сапары акысыз.",
    spoken:
      "БалаГо — Бишкектеги балдар үчүн такси. Үйдөн мектепке, кайра үйгө каттам топ түзүлгөндөн кийин уюштурулат. Биринчи толук сыноо сапары акысыз.",
  },
  {
    id: "n03",
    role: "narrator",
    scene: "cta",
    at: 1.0,
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
    tag: "[warmly]",
  },
  {
    id: "n04",
    role: "narrator",
    scene: "cta",
    at: 0,
    gap: 0.35,
    text: "Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken:
      "Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
  },
  {
    id: "n05",
    role: "narrator",
    scene: "cta",
    at: 0,
    gap: 0.4,
    text: "BalaGo менен жолго чыгалы!",
    spoken: "БалаГо менен жолго чыгалы!",
    tag: "[warmly]",
  },
];

export const lineById = (id: string) => {
  const l = BG14_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const BG14_TEXT = {
  hook: "Мен даярмын!",
  clock: "07:40",
  call: { title: "Жыйын • 08:00", mute: "Үнсүз" },
  momCal: {
    title: "Бүгүн",
    rows: [
      { time: "07:45", text: "Мектепке жеткирүү", who: "Ким?" },
      { time: "08:00", text: "Атанын жыйыны", who: "Ата" },
      { time: "08:30", text: "Апанын жумушу", who: "Апа" },
      { time: "13:00", text: "Мектептен алып келүү", who: "Ким?" },
    ],
    plan: "Алдын ала пландоо",
  },
  // кружащие вокруг кроссовок утренние напоминания (семь)
  reminders: [
    "⏰ 07:00 Ойгонуу",
    "💼 08:00 Жыйын",
    "🏫 08:00 Мектеп",
    "📞 Кардарга чалуу",
    "🚗 Ким жеткирет?",
    "📅 Графикти текшерүү",
    "🏫 13:00 Сабак бүтөт",
  ],
  schoolTimes: { am: "07:30", pm: "13:00" },
  phone: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    open: "Шарттарды көрүү",
  },
  route: {
    city: "Бишкек",
    am: "Эртең менен: ҮЙ → МЕКТЕП",
    pm: "Сабактан кийин: МЕКТЕП → ҮЙ",
    full: "ҮЙ → МЕКТЕП → ҮЙ",
    steps: [
      { title: "Арыз", note: "Дарек жана убакыт" },
      { title: "Топ түзүлөт", note: "3–4 бала • 2 жумага чейин" },
      { title: "Биринчи толук сыноо сапары", note: "Топ түзүлгөндөн кийин", badge: "Акысыз" },
    ],
    car: "Ак унаа • туруктуу айдоочу",
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
