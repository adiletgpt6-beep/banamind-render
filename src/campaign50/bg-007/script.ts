// BalaGo-50, выпуск №08 / BG-007 — «Календарь наизнанку»
// (композиция BalaGoBG007, 2D, 1080×1920, 30 fps, ≈ 70 с).
//
// Причинно-следственная ось: весь рабочий график папы двигают из-за
// одного регулярного школьного маршрута (утром в школу, после уроков
// домой). Бумажный календарь превращается в 2D-тетрис: большие блоки
// «Жыйын», «Кардар», «Отчёт» и маленький жёлтый «Мектеп», который никуда
// не помещается. Папа останавливает игру, сын спрашивает, отвезёт ли он
// его завтра, папа решает организовать график иначе и открывает BalaGo:
// маршрут ҮЙ → МЕКТЕП → ҮЙ уходит на отдельную линию, которая ещё только
// планируется (заявка → подбор совместимой группы → первая бесплатная
// полная пробная поездка). Никакой «мгновенной магии» и выполненных
// поездок BalaGo в кадре.
//
// Сценарий: campaigns/balago-50/episodes/08-BG-007.md.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG7_VIDEO = {
  id: "BalaGoBG007",
  output: "balago-bg-007",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-007/voice",
  audioDir: "audio/campaign50/bg-007",
  logo: "assets/campaign50/bg-007/logo.png",
  // Общая длительность считается по озвучке (timing.ts), но не короче:
  minSec: 68,
  maxSec: 80,
} as const;

// ---------- Сцены ----------
// Длина сцены — не меньше len (с); если речь длиннее, сцена растягивается
// так, чтобы после последней реплики оставалось tail секунд.
export type Bg7SceneId = "hook" | "shuffle" | "pause" | "lane" | "steps" | "cta";

export const BG7_SCENES: readonly {
  readonly id: Bg7SceneId;
  readonly title: string;
  readonly len: number;
  readonly tail: number;
}[] = [
  { id: "hook", title: "1. Календарь-пазл: «Мектеп» не помещается", len: 6.5, tail: 0.9 },
  { id: "shuffle", title: "2. Папа двигает встречи", len: 12, tail: 2.4 },
  { id: "pause", title: "3. Пауза: вопрос сына", len: 11, tail: 2.6 },
  { id: "lane", title: "4. BalaGo: отдельная линия маршрута", len: 13, tail: 2.6 },
  { id: "steps", title: "5. Заявка → группа → пробная поездка", len: 10, tail: 1.2 },
  // финал: оба способа связи и номер на экране всё время сцены,
  // после последнего слова ≥ 3 с (берём 3,6 с)
  { id: "cta", title: "6. Финал: Бишкек, профиль, WhatsApp", len: 18, tail: 3.6 },
];

// Финальный экран с контактами появляется через столько секунд после
// начала сцены cta и остаётся до конца ролика.
export const BG7_CONTACTS_IN = 0.8;

// ---------- Голоса ----------
export type Bg7Role = "father" | "son" | "narrator";

export const BG7_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 708,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые голоса проекта (ElevenLabs Voice Design, кыргызская речь носителя),
// проверенные в 2D-роликах №10–12; новые голоса не создаются.
export const BG7_VOICES: Record<Bg7Role, { readonly name: string; readonly voiceId: string; readonly from: string }> = {
  // спокойный низкий голос папы (≈110 Гц, CER 2,2 %)
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm", from: "half-hour-2d" },
  // светлый звонкий голос сына (≈286 Гц, CER 4,2 %)
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM", from: "half-hour-2d" },
  // спокойный доброжелательный голос диктора (CER 2,1 %)
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "half-hour-2d" },
};

// ---------- Реплики ----------
export type Bg7Line = {
  readonly id: string;
  readonly role: Bg7Role;
  readonly scene: Bg7SceneId;
  // Начало речи: секунды от начала сцены, но не раньше чем через gap
  // секунд после конца предыдущей реплики.
  readonly at: number;
  readonly gap?: number;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

export const BG7_LINES: readonly Bg7Line[] = [
  {
    id: "n01",
    role: "narrator",
    scene: "hook",
    at: 0.6,
    text: "Бир кичинекей жазуу бүт графикти жылдырып жатабы?",
    tag: "[curious]",
  },
  {
    id: "n02",
    role: "narrator",
    scene: "shuffle",
    at: 0.9,
    text: "Ар күнү баланы мектепке жеткирүү жана алып келүү үчүн жолугушууларды өзгөртүү оңой эмес.",
  },
  { id: "s01", role: "son", scene: "pause", at: 3.2, text: "Ата, эртең мени сиз жеткиресизби?", tag: "[hopeful]" },
  { id: "f01", role: "father", scene: "pause", at: 0, gap: 0.8, text: "Графигибизди башкача уюштурсак болот экен.", tag: "[thoughtful]" },
  {
    id: "n03",
    role: "narrator",
    scene: "lane",
    at: 2.2,
    text: "BalaGo — Бишкектеги балдар үчүн алдын ала пландалган мектеп каттамы.",
    spoken: "БалаГо — Бишкектеги балдар үчүн алдын ала пландалган мектеп каттамы.",
  },
  {
    id: "n04",
    role: "narrator",
    scene: "steps",
    at: 0.5,
    text: "Дарек менен убакытты бересиз. Ылайыктуу топ түзүлсө, биринчи толук сыноо сапары акысыз өтөт.",
  },
  {
    id: "n05",
    role: "narrator",
    scene: "cta",
    at: 1.0,
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
    tag: "[warmly]",
  },
  {
    id: "n06",
    role: "narrator",
    scene: "cta",
    at: 0,
    gap: 0.35,
    text: "Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken:
      "Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
  },
  {
    id: "n07",
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
  const l = BG7_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const BG7_TEXT = {
  calendar: {
    title: "Бул апта",
    days: ["Дш", "Шш", "Шр", "Бш", "Жм"],
    hours: ["08", "10", "12", "14", "16", "18"],
    noRoom: "Орун жок",
  },
  blocks: { meeting: "Жыйын", client: "Кардар", report: "Отчёт", school: "Мектеп" },
  schoolTimes: { am: "07:30", pm: "13:00" },
  lane: {
    title: "BalaGo каттамы",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    status: "Маршрут пландалууда",
    work: "Жумуш",
  },
  phone: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    open: "Маршрутту пландоо",
  },
  steps: {
    title: "Кантип башталат",
    items: [
      { title: "Дарек жана убакыт", note: "Арыз калтырасыз" },
      { title: "Ылайыктуу топ", note: "3–4 бала • 2 жумага чейин издөө" },
      { title: "Биринчи толук сыноо сапары", note: "Топ түзүлгөндөн кийин", badge: "Акысыз" },
    ],
    send: "Арыз калтыруу",
    sent: "Арыз кабыл алынды",
    searching: "Топ изделүүдө…",
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
