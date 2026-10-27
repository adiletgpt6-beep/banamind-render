// BalaGo-50, выпуск №11 / BG-010 — «Сколько стоит переключение?»
// (композиция BalaGoBG010, 2D, 1080×1920, 30 fps, ≈ 70 с).
//
// Визуальная метафора: нить мысли программиста — жёлтая линия, которую он
// ведёт по строкам кода к закрывающей скобке. Уведомление школы рвёт нить;
// после поездки за сыном нить лежит обрывками, и так повторяется
// («сброс контекста»). Связующее действие: папа сам вырезает из своего
// рабочего плана строку «Мектеп» в отдельную вкладку и ищет «Бишкек
// балдар үчүн такси» — так в истории появляется BalaGo. Маршрут
// ҮЙ → МЕКТЕП → ҮЙ показан как план (заявка → подбор группы → первая
// бесплатная полная пробная поездка), без выполненных поездок BalaGo и без
// цифр производительности. В финале линия маршрута сшивает обрывки нити
// и переходит в логотип — метафора, а не заявление, что папа уже клиент.
//
// Сценарий: campaigns/balago-50/episodes/11-BG-010.md.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG10_VIDEO = {
  id: "BalaGoBG010",
  output: "balago-bg-010",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-010/voice",
  audioDir: "audio/campaign50/bg-010",
  logo: "assets/campaign50/bg-010/logo.png",
  // Общая длительность считается по озвучке (timing.ts), но не короче:
  minSec: 64,
  maxSec: 90,
} as const;

// ---------- Сцены ----------
// Длина сцены — не меньше len (с); если речь длиннее, сцена растягивается
// так, чтобы после последней реплики оставалось tail секунд.
export type Bg10SceneId = "hook" | "call" | "back" | "decide" | "route" | "cta";

export const BG10_SCENES: readonly {
  readonly id: Bg10SceneId;
  readonly title: string;
  readonly len: number;
  readonly tail: number;
}[] = [
  { id: "hook", title: "1. Нить мысли в коде рвётся", len: 7, tail: 0.8 },
  { id: "call", title: "2. Звонок сына, папа закрывает ноутбук", len: 12.5, tail: 4.2 },
  { id: "back", title: "3. Возвращение: нить распалась", len: 12, tail: 3.4 },
  { id: "decide", title: "4. Папа вырезает «Мектеп» и ищет решение", len: 10.5, tail: 5.6 },
  { id: "route", title: "5. BalaGo: маршрут и условия", len: 14, tail: 1.6 },
  // финал: оба способа связи и номер на экране всё время сцены,
  // после последнего слова ≥ 3 с (берём 3,6 с)
  { id: "cta", title: "6. Финал: Бишкек, профиль, WhatsApp", len: 17, tail: 3.6 },
];

// Финальный экран с контактами появляется через столько секунд после
// начала сцены cta и остаётся до конца ролика.
export const BG10_CONTACTS_IN = 1.6;

// ---------- Голоса ----------
export type Bg10Role = "father" | "son" | "narrator";

export const BG10_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 1010,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые голоса проекта (ElevenLabs Voice Design, кыргызская речь),
// проверенные в 2D-роликах кампании; новые голоса не создаются.
export const BG10_VOICES: Record<Bg10Role, { readonly name: string; readonly voiceId: string; readonly from: string }> = {
  // спокойный низкий голос папы
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm", from: "half-hour-2d" },
  // светлый звонкий голос сына
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM", from: "half-hour-2d" },
  // спокойный доброжелательный голос диктора
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "half-hour-2d" },
};

// ---------- Реплики ----------
export type Bg10Line = {
  readonly id: string;
  readonly role: Bg10Role;
  readonly scene: Bg10SceneId;
  // Начало речи: секунды от начала сцены, но не раньше чем через gap
  // секунд после конца предыдущей реплики.
  readonly at: number;
  readonly gap?: number;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
  readonly phone?: boolean; // голос из телефона (полоса 120–5000 Гц)
  readonly thought?: boolean; // мысль «про себя» (субтитры курсивом)
};

export const BG10_LINES: readonly Bg10Line[] = [
  {
    id: "n01",
    role: "narrator",
    scene: "hook",
    at: 0.5,
    text: "Бир ойду аягына чыгара электе башка ишке өтүүгө туура келген учур болобу?",
    tag: "[curious]",
  },
  { id: "s01", role: "son", scene: "call", at: 3.0, text: "Ата, бүгүн мектептен сиз алып кетесизби?", tag: "[hopeful]", phone: true },
  { id: "f01", role: "father", scene: "call", at: 0, gap: 0.6, text: "Ооба, балам. Жумушумду токтотуп, чыгайын.", tag: "[warmly]" },
  {
    id: "n02",
    role: "narrator",
    scene: "back",
    at: 3.6,
    text: "Кайтып келгенде ошол ойду кайра чогултуу да убакытты алат. Бул бир эле жолу эмес, кайра кайталанат.",
  },
  {
    id: "f02",
    role: "father",
    scene: "decide",
    at: 2.4,
    text: "Мектепке каттамды өзүнчө алдын ала уюштурсакчы?",
    tag: "[thoughtful]",
    thought: true,
  },
  {
    id: "n03",
    role: "narrator",
    scene: "route",
    at: 0.8,
    text: "BalaGo Бишкекте мектепке каттамды алдын ала уюштурууга жардам берет.",
    spoken: "БалаГо Бишкекте мектепке каттамды алдын ала уюштурууга жардам берет.",
  },
  {
    id: "n04",
    role: "narrator",
    scene: "route",
    at: 0,
    gap: 0.5,
    text: "Адегенде ылайыктуу топ түзүлөт. Андан кийин биринчи толук сыноо сапары акысыз.",
  },
  {
    id: "n05",
    role: "narrator",
    scene: "cta",
    at: 1.4,
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
  const l = BG10_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча; код — условный, безопасный) ----------
export const BG10_TEXT = {
  editor: {
    file: "solution.ts",
    tabs: ["solution.ts", "notes.md"],
    // Условный код без реальных данных; нить мысли идёт от строки 2
    // к закрывающей скобке (последняя строка).
    code: [
      "function solve(tasks) {",
      "  const ready = [];",
      "  for (const t of tasks) {",
      "    if (t.done) continue;",
      "    const next = plan(t);",
      "    ready.push(next);",
      "  }",
      "  return ready",
      "    .filter(Boolean)",
      "    .sort(byOrder);",
      "}",
    ],
    lost: "// ...эмне кылмак элем?",
  },
  notify: { app: "Мектеп", text: "Сабак 12:30да бүтөт", time: "азыр" },
  call: { name: "Уулум", status: "Чалып жатат…" },
  office: {
    note: "Мектеп: күн сайын",
    timetable: "Сабак бүтөт",
    timetableTime: "12:30",
    board: "Тапшырма",
  },
  plan: {
    file: "бүгүн.plan",
    title: "Бүгүнкү план",
    items: [
      { time: "09:30", text: "Код карап чыгуу", school: false },
      { time: "11:00", text: "Тапшырма: solve()", school: false },
      { time: "12:30", text: "Мектептен алып келүү", school: true },
      { time: "14:00", text: "Команда менен жолугушуу", school: false },
    ],
    newTab: "Мектеп каттамы",
    search: "Бишкек балдар үчүн такси",
  },
  result: {
    brand: "BalaGo",
    tagline: "Бишкектеги балдар үчүн такси",
    url: "BalaGo • Балдар үчүн такси",
  },
  route: {
    title: "Мектеп каттамы",
    stops: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    legs: ["эртең менен", "сабактан кийин"],
    status: "Алдын ала пландалат",
  },
  steps: {
    items: [
      { title: "Арыз", note: "Дарек жана убакыт" },
      { title: "Топ түзүү", note: "3–4 бала • 2 жумага чейин издөө" },
      { title: "Биринчи толук сыноо сапары", note: "Топ түзүлгөндөн кийин", badge: "Акысыз" },
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
} as const;
