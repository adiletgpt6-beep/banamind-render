// Выпуск №07 / BG-006 «Незаконченная презентация» (композиция BalaGoBG006,
// 2D, 1080×1920, 30 fps, 72 с). Сценарий: campaigns/balago-50/episodes/07-BG-006.md.
//
// Субъективная камера + драматургия стоп-кадра. Мама докладывает проект
// коллегам и видит напоминание: скоро закончатся уроки (стоп-кадр).
// После доклада коллега замечает в её календаре «Мектеп» каждый день и
// советует организовать поездки заранее. Мама сама находит BalaGo, читает
// порядок «топ түзүү → акысыз сыноо → чечим» и сохраняет ссылку для заявки.
// Поездка не показывается: группы ещё нет. Финал — Бишкек, ссылка в профиле
// и WhatsApp 0998 08 38 28.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const B6_VIDEO = {
  id: "BalaGoBG006",
  output: "balago-bg-006",
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 72,
  voiceDir: "audio/campaign50/bg-006",
} as const;

export const B6_FRAMES = B6_VIDEO.durationSec * B6_VIDEO.fps;

// ---------- Сцены (фиксированная шкала, секунды) ----------
export type B6SceneId = "hook" | "listen" | "talk" | "search" | "terms" | "cta";

export const B6_SCENES: readonly {
  readonly id: B6SceneId;
  readonly title: string;
  readonly from: number;
  readonly to: number;
}[] = [
  { id: "hook", title: "1. Доклад: напоминание (стоп-кадр)", from: 0, to: 6.5 },
  { id: "listen", title: "2. Коллеги слушают, мама смотрит на часы", from: 6.5, to: 16.5 },
  { id: "talk", title: "3. Календарь и разговор с коллегой", from: 16.5, to: 31 },
  { id: "search", title: "4. Мама сама ищет организованный маршрут", from: 31, to: 41.5 },
  { id: "terms", title: "5. Порядок: топ → сыноо → чечим", from: 41.5, to: 52.5 },
  { id: "cta", title: "6. Финал: Бишкек, профиль, WhatsApp", from: 52.5, to: 72 },
];

// Финальный экран с обоими контактами — от начала сцены cta до конца.
export const B6_CTA_FROM = 52.5;

// ---------- Голоса ----------
export type B6Role = "mother" | "colleague" | "narrator";

export const B6_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 707,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые голоса проекта (ElevenLabs Voice Design, носители кыргызского;
// проверены MMS в роликах №10–12). Новые голоса не создаются.
export const B6_VOICES: Record<B6Role, { readonly name: string; readonly voiceId: string }> = {
  // тёплый мягкий голос мамы
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  // спокойный низкий мужской голос — коллега
  colleague: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  // спокойный доброжелательный женский голос — диктор
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
};

// ---------- Реплики ----------
export type B6Line = {
  readonly id: string;
  readonly role: B6Role;
  readonly scene: B6SceneId;
  readonly at: number; // начало речи (с от начала ролика)
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number;
};

export const B6_LINES: readonly B6Line[] = [
  { id: "m01", role: "mother", scene: "hook", at: 0.7, text: "Демек, биздин негизги чечим...", tag: "[confident]" },
  {
    id: "n01",
    role: "narrator",
    scene: "listen",
    at: 7.2,
    text: "Жумуштагы маанилүү учурду да, балаңыздын мектебин да унуткуңуз келбейт.",
    tag: "[warmly]",
  },
  {
    id: "m02",
    role: "mother",
    scene: "talk",
    at: 19.6,
    text: "Мектепке барып-келүүнү күн сайын графикке батыруу кыйын болуп жатат.",
    tag: "[tired]",
  },
  { id: "c01", role: "colleague", scene: "talk", at: 25.6, text: "Аны алдын ала уюштуруунун жолун карап көрсөңүзчү?", tag: "[gently]" },
  {
    id: "n02",
    role: "narrator",
    scene: "search",
    at: 32.4,
    text: "BalaGo — Бишкекте балдарды үйдөн мектепке, кайра үйгө жеткирүү үчүн уюштурулган кызмат.",
    spoken: "БалаГо — Бишкекте балдарды үйдөн мектепке, кайра үйгө жеткирүү үчүн уюштурулган кызмат.",
  },
  {
    id: "n03",
    role: "narrator",
    scene: "terms",
    at: 41.9,
    text: "Адегенде маршрутуңузга ылайык топ түзүлөт. Биринчи толук сыноо сапары акысыз, андан кийин гана чечим чыгарасыз.",
  },
  {
    id: "n04",
    role: "narrator",
    scene: "cta",
    at: 53.0,
    text: "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
    spoken:
      "БалаГо — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге Ватсап аркылуу жазыңыз. БалаГо менен жолго чыгалы!",
    tag: "[warmly]",
  },
];

// Речь заканчивается не позже чем за 3 с до конца ролика (финальный экран
// держится после последнего слова); с запасом — 68,6 с.
export const B6_DIALOG_END = 68.6;

export const b6LineById = (id: string) => {
  const l = B6_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const B6_TEXT = {
  slide: {
    project: "«Жашыл короо» долбоору",
    title: "Негизги чечим",
    bullets: ["Бюджет: 3 этап", "Мөөнөтү: 6 ай", "Жооптуу: биздин бөлүм"],
    page: "7 / 8",
  },
  reminder: { app: "Эскертме", time: "14:30", text: "Сабак бүтөт — мектеп", sub: "35 мүнөттөн кийин" },
  freeze1: "14:30 — сабак бүтөт",
  freeze2: "Доклад бүтө элек… сабак да бүтүп калат",
  clockNow: 13 * 60 + 55,
  calendar: {
    title: "Ушул апта",
    days: ["Дүй", "Шей", "Шар", "Бей", "Жум"],
    work: "Жолугушуу",
    school: "Мектеп 14:30",
    clash: "Убакыт дал келбейт",
  },
  search: {
    query: "Балдарды мектепке уюштурулган жеткирүү Бишкек",
    resultTitle: "BalaGo — Балдар үчүн такси",
    resultSub: "Бишкек • Үй → Мектеп → Үй",
  },
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси • Бишкек",
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    steps: ["Дарек", "Мектеп", "Убакыт"],
    save: "Шилтемени сактоо",
    saved: "Шилтеме сакталды — арыз үчүн",
  },
  routeSlide: { title: "Уюштурулган маршрут", route: ["ҮЙ", "МЕКТЕП", "ҮЙ"], morning: "Эртең менен", after: "Сабактан кийин" },
  terms: {
    title: "Кантип башталат",
    steps: ["Топ түзүү", "Акысыз сыноо", "Чечим"],
    notes: ["Маршрутуңузга ылайык", "Биринчи толук сапар", "Андан кийин гана"],
    honest: "Сапар топ түзүлгөндөн кийин гана башталат",
  },
  cta: {
    brand: "BalaGo",
    city: "Бишкек • Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    link: "Профилдеги шилтемеге өтүңүз",
    or: "же WhatsApp аркылуу жазыңыз",
    whatsapp: "WhatsApp: 0998 08 38 28",
  },
} as const;
