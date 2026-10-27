// BG-009 «Пять рабочих дней» (кампания BalaGo-50, выпуск №10).
// Сценарий: campaigns/balago-50/episodes/10-BG-009.md (производственная
// редакция v1). Задание: campaigns/balago-50/production/TASK_BG-009_EP10.md.
//
// Причинно-следственная ось: пять дверей недели → пять разных рабочих задач
// (пять цветов) → перед каждым днём одна и та же школьная иконка «07:40
// Мектеп» и вопрос, кто отвезёт → повтор виден в календаре недели →
// суббота: родители смотрят на календарь, мама обводит повторяющуюся строку
// и предлагает заранее организовать маршрут, открывает BalaGo и заполняет
// заявку (видимое действие) → пять разорванных отрезков сквозной линии
// соединяются в одну → честные условия: ҮЙ → МЕКТЕП → ҮЙ, подбор группы,
// бесплатная первая пробная полная поездка, решение семьи → финал: Бишкек,
// ссылка в профиле и WhatsApp 0998 08 38 28.
//
// Персонажи и офисы — условные (художественный пример), не статистика и
// не документальные клиенты. Детских реплик в ролике нет.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG9_VIDEO = {
  id: "BalaGoBG009",
  output: "balago-bg-009",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-009",
} as const;

// ---------- Пять дней: пять цветовых ритмов ----------
export type Bg9DayId = "mon" | "tue" | "wed" | "thu" | "fri";

export const BG9_DAYS: readonly {
  readonly id: Bg9DayId;
  readonly name: string; // день недели (кыргызча)
  readonly short: string;
  readonly task: string; // рабочая задача дня
  readonly color: string; // основной цвет дня
  readonly tint: string; // светлый фон дня
  readonly who: "mom" | "dad";
}[] = [
  { id: "mon", name: "Дүйшөмбү", short: "Дш", task: "Жыйын", color: "#3B76D6", tint: "#E6EFFC", who: "dad" },
  { id: "tue", name: "Шейшемби", short: "Шш", task: "Отчет", color: "#22A06B", tint: "#E3F5EC", who: "mom" },
  { id: "wed", name: "Шаршемби", short: "Шр", task: "Кардар менен жолугушуу", color: "#EE8434", tint: "#FDEEDF", who: "dad" },
  { id: "thu", name: "Бейшемби", short: "Бш", task: "Шашылыш тапшырма", color: "#D9465C", tint: "#FBE5E8", who: "mom" },
  { id: "fri", name: "Жума", short: "Жм", task: "Мөөнөт", color: "#8457D0", tint: "#EFE8FA", who: "dad" },
];

// ---------- Сцены ----------
// Длительность сцены = max(minSec, начало речи + речь + хвост): монтаж
// подстраивается под фактическую озвучку, речь не ускоряется и не режется.
export type Bg9SceneId = "hook" | Bg9DayId | "repeat" | "sat" | "how" | "cta";

export const BG9_SCENES: readonly {
  readonly id: Bg9SceneId;
  readonly title: string;
  readonly minSec: number;
  readonly tailSec: number; // от конца последней реплики до конца сцены
}[] = [
  { id: "hook", title: "1. Пять дверей недели", minSec: 5.6, tailSec: 0.9 },
  { id: "mon", title: "2. Дүйшөмбү — жыйын", minSec: 3.5, tailSec: 1.3 },
  { id: "tue", title: "3. Шейшемби — отчет", minSec: 3.4, tailSec: 1.3 },
  { id: "wed", title: "4. Шаршемби — кардар", minSec: 3.6, tailSec: 1.2 },
  { id: "thu", title: "5. Бейшемби — шашылыш тапшырма", minSec: 3.4, tailSec: 1.3 },
  { id: "fri", title: "6. Жума — мөөнөт", minSec: 3.2, tailSec: 1.3 },
  { id: "repeat", title: "7. Повтор: школа каждый день", minSec: 5.8, tailSec: 1.5 },
  { id: "sat", title: "8. Суббота: решение и заявка", minSec: 13, tailSec: 1.1 },
  { id: "how", title: "9. ҮЙ → МЕКТЕП → ҮЙ и условия", minSec: 10.5, tailSec: 1.6 },
  // финал держится ≥ 3 с после последнего слова (с запасом)
  { id: "cta", title: "10. Финал: Бишкек + оба контакта", minSec: 10, tailSec: 3.6 },
];

// ---------- Голоса ----------
export type Bg9Role = "narrator" | "mother";

export const BG9_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 909,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые кыргызские голоса проекта (ElevenLabs Voice Design), уже
// проверенные в 2D-роликах. Новые голоса не создаются.
export const BG9_VOICES: Record<Bg9Role, { readonly name: string; readonly voiceId: string; readonly from: string }> = {
  // спокойный доброжелательный дикторский голос (CER 2,1 % по MMS)
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "half-hour-2d" },
  // тёплый, мягкий голос мамы (CER 1,8 % по MMS)
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p", from: "half-hour-2d" },
};

// ---------- Реплики (текст сценария; дикторский блок разбит по дням) ----------
export type Bg9Line = {
  readonly id: string;
  readonly role: Bg9Role;
  readonly scene: Bg9SceneId;
  // начало речи: секунды от начала сцены (или после конца предыдущей
  // реплики той же сцены, если задан afterPrev)
  readonly lead: number;
  readonly afterPrev?: boolean;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

export const BG9_LINES: readonly Bg9Line[] = [
  { id: "n01", role: "narrator", scene: "hook", lead: 0.8, text: "Беш күн. Беш башка жумуш. Бир эле суроо." },
  { id: "n02", role: "narrator", scene: "mon", lead: 0.55, text: "Дүйшөмбүдө жыйын." },
  { id: "n03", role: "narrator", scene: "tue", lead: 0.5, text: "Шейшембиде отчет." },
  { id: "n04", role: "narrator", scene: "wed", lead: 0.5, text: "Шаршембиде кардар менен жолугушуу." },
  { id: "n05", role: "narrator", scene: "thu", lead: 0.5, text: "Бейшембиде шашылыш тапшырма." },
  { id: "n06", role: "narrator", scene: "fri", lead: 0.5, text: "Жумада мөөнөт." },
  { id: "n07", role: "narrator", scene: "repeat", lead: 0.6, text: "Бирок баланын мектепке жолу күн сайын кайталанат." },
  {
    id: "m01",
    role: "mother",
    scene: "sat",
    lead: 1.9,
    text: "Ар күнү ким алып барарын чечпей, каттамды алдын ала караштыралы.",
    tag: "[gently]",
  },
  {
    id: "n08",
    role: "narrator",
    scene: "sat",
    lead: 3.6,
    afterPrev: true,
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
  },
  {
    id: "n09",
    role: "narrator",
    scene: "how",
    lead: 0.6,
    text: "Үйдөн мектепке, сабактан кийин кайра үйгө. Ылайыктуу топ түзүлгөн соң биринчи толук сыноо сапары акысыз.",
  },
  {
    id: "n10",
    role: "narrator",
    scene: "cta",
    lead: 0.8,
    text: "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken:
      "БалаГо — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
    tag: "[warmly]",
  },
  { id: "n11", role: "narrator", scene: "cta", lead: 0.45, afterPrev: true, text: "BalaGo менен жолго чыгалы!", spoken: "БалаГо менен жолго чыгалы!", tag: "[warmly]" },
];

// ---------- Экранные надписи (кыргызча) ----------
export const BG9_TEXT = {
  hook: {
    five: "5 күн • 5 жумуш",
    question: "Баланы мектепке ким жеткирет?",
  },
  school: "Мектеп",
  schoolTime: "07:40",
  who: "Ким жеткирет?",
  tasks: {
    mon: { board: "Жумалык план", time: "08:00" },
    tue: { doc: "Отчет", pct: "%" },
    wed: { time: "08:30", label: "Кардар" },
    thu: { alert: "Шашылыш!", label: "Тапшырма" },
    fri: { label: "Долбоор", deadline: "Мөөнөт: бүгүн" },
  },
  repeat: {
    title: "Бул жуманын графиги",
    row: "07:40 • Мектеп",
    every: "Күн сайын",
  },
  sat: {
    day: "Ишемби",
    plan: "Алдын ала пландоо",
  },
  app: {
    brand: "BalaGo",
    city: "Бишкек",
    title: "Каттамга өтүнмө",
    route: "Үй → Мектеп → Үй",
    home: "Үй дареги",
    school: "Мектеп",
    time: "Сабактын убактысы",
    homeVal: "Бишкек, үй дареги",
    schoolVal: "Мектеп №…",
    timeVal: "07:40 / 13:00",
    send: "Өтүнмө жөнөтүү",
    sent: "Өтүнмө жөнөтүлдү",
  },
  how: {
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    home: "ҮЙ",
    school: "МЕКТЕП",
    morning: "Эртең менен",
    afternoon: "Сабактан кийин",
    steps: [
      { n: "1", title: "Өтүнмө", note: "Үй, мектеп, сабак убактысы" },
      { n: "2", title: "Ылайыктуу топ түзүлөт", note: "3–4 бала • издөө 2 жумага чейин" },
      { n: "3", title: "Биринчи толук сыноо сапары", note: "акысыз" },
      { n: "4", title: "Уланта бересизби — өзүңүз чечесиз", note: "төлөм сыноодон кийин гана" },
    ],
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
  note: "Мисал шарттуу",
} as const;

export const lineById = (id: string) => {
  const l = BG9_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};
