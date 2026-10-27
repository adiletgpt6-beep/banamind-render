// BalaGo-50, выпуск №13 / BG-012 «О чём поговорим сегодня?»
// («Бүгүн эмне жөнүндө сүйлөшөбүз?», композиция BalaGoBG012).
//
// Уютный мини-фильм в гостиной: вечер, тёплая лампа, детские рисунки на
// стене. Сын хочет рассказать о своём дне и показать рисунок, а родители —
// не грубо, просто по привычке — опять считают, кто завтра везёт и кто
// забирает. Рисунок ложится рядом с календарём: мама замечает, закрывает
// календарь, папа обнимает сына. Родители сами открывают страницу BalaGo,
// чтобы заранее спланировать дорогу в школу; линии детского рисунка
// становятся маршрутом ҮЙ → МЕКТЕП → ҮЙ и условиями (заявка → подходящая
// группа → бесплатная первая полная пробная поездка). Семья только
// знакомится с сервисом: никаких выполненных поездок и обещаний свободных
// вечеров. Финал — сын рассказывает о рисунке, контакты.
//
// Шкала ролика не фиксирована: сцены и реплики выстраиваются по фактической
// длительности озвучки (timing.ts), речь никогда не ускоряется.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const B12_VIDEO = {
  id: "BalaGoBG012",
  output: "balago-bg-012",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-012",
} as const;

// ---------- Голоса ----------
export type B12Role = "son" | "mother" | "father" | "narrator";

export const B12_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 1312,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые кыргызские голоса проекта (ElevenLabs Voice Design), проверенные
// в прежних роликах замером MMS; новые голоса не создаются. Сына, как
// принято в анимации, озвучивает самый светлый высокий голос проекта —
// тон и темп механически не меняются.
export const B12_VOICES: Record<B12Role, { readonly name: string; readonly voiceId: string }> = {
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm" },
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
};

// ---------- Сцены ----------
export type B12SceneId = "hook" | "plans" | "drawing" | "turn" | "route" | "story";

export type B12ScenePlan = {
  readonly id: B12SceneId;
  readonly title: string;
  // пауза до первой реплики сцены, с (действие без слов)
  readonly lead: number;
  // пауза после последней реплики до конца сцены, с
  readonly tail: number;
  // минимальная длительность сцены, с
  readonly min: number;
};

export const B12_SCENES: readonly B12ScenePlan[] = [
  // сын поднимает альбом, набирается смелости
  { id: "hook", title: "1. Альбом", lead: 1.1, tail: 0.9, min: 5.5 },
  // родители заняты завтрашней дорогой, рисунок не замечен
  { id: "plans", title: "2. Календарь", lead: 1.5, tail: 2.6, min: 11 },
  // рисунок на столе, мама замечает
  { id: "drawing", title: "3. Рисунок", lead: 1.6, tail: 0.9, min: 10 },
  // мама закрывает календарь, папа обнимает сына, вместе открывают BalaGo
  { id: "turn", title: "4. Решение", lead: 3.2, tail: 3.4, min: 13 },
  // линии рисунка → маршрут ҮЙ → МЕКТЕП → ҮЙ и условия
  { id: "route", title: "5. Маршрут", lead: 0.9, tail: 1.2, min: 11 },
  // сын рассказывает о рисунке → финальный экран с контактами
  { id: "story", title: "6. Рассказ и контакты", lead: 1.0, tail: 4.2, min: 20 },
];

// ---------- Реплики ----------
export type B12Line = {
  readonly id: string;
  readonly role: B12Role;
  readonly scene: B12SceneId;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
  // пауза после реплики, с (по умолчанию 0,5)
  readonly gapAfter?: number;
  readonly subtitle?: boolean; // false — без субтитра (финальный экран)
};

export const B12_LINES: readonly B12Line[] = [
  { id: "c01", role: "son", scene: "hook", text: "Апа, ата, бүгүн болгон окуямды айтып берейинби?", tag: "[shyly]" },
  { id: "m01", role: "mother", scene: "plans", text: "Эртең эртең менен сиз алып барасызбы?", gapAfter: 0.6 },
  { id: "f01", role: "father", scene: "plans", text: "Түштөн кийин менин жолугушуум бар экен.", tag: "[thoughtful]" },
  // без аудиотега и с новым seed: с тегом [hopeful] слово «сүрөтүмдү»
  // звучало нечётко во всех трёх дублях (MMS CER 0,25–0,57)
  { id: "c02", role: "son", scene: "drawing", text: "Менин сүрөтүмдү көрөсүздөрбү?", seed: 1400, gapAfter: 1.5 },
  {
    id: "n01",
    role: "narrator",
    scene: "drawing",
    // мини-правка грамматики сценария: «балага суроо берүүнүн ордуна»
    // вместо «балага бериле турган суроолордун ордуна» — смысл тот же
    text: "Айрым кечтерде балага суроо берүүнүн ордуна жолдун графигин талкуулап калабыз.",
    tag: "[softly]",
  },
  {
    id: "m02",
    role: "mother",
    scene: "turn",
    text: "Келгиле, мектепке каттамды алдын ала уюштуруунун жолун карайлы. Анан сенин окуяңды угабыз.",
    tag: "[warmly]",
  },
  {
    id: "n02",
    role: "narrator",
    scene: "route",
    text: "BalaGo Бишкекте үйдөн мектепке, кайра үйгө каттам уюштурат.",
    spoken: "БалаГо Бишкекте үйдөн мектепке, кайра үйгө каттам уюштурат.",
    gapAfter: 0.45,
  },
  {
    id: "n03",
    role: "narrator",
    scene: "route",
    text: "Алгач ылайыктуу топ түзүлөт, андан кийин биринчи толук сыноо сапары акысыз.",
  },
  // сын наконец рассказывает о рисунке (в сценарии — «мальчик начинает
  // рассказывать о рисунке»); обращение к родителям — «сиз»
  { id: "c03", role: "son", scene: "story", text: "Мына, бул — сиз, апа. Бул — сиз, ата. А бул — мен.", tag: "[happily]", gapAfter: 0.8 },
  {
    id: "n04",
    role: "narrator",
    scene: "story",
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
    tag: "[warmly]",
    gapAfter: 0.4,
    subtitle: false,
  },
  // призыв разбит на две короткие фразы — каждая синтезируется чище
  {
    id: "n05",
    role: "narrator",
    scene: "story",
    text: "Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз",
    spoken: "Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз,",
    gapAfter: 0.25,
    subtitle: false,
  },
  {
    id: "n05b",
    role: "narrator",
    scene: "story",
    text: "же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken: "же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
    gapAfter: 0.45,
    subtitle: false,
  },
  {
    id: "n06",
    role: "narrator",
    scene: "story",
    text: "BalaGo менен жолго чыгалы!",
    spoken: "БалаГо менен жолго чыгалы!",
    // без тега: с [cheerfully] «жолго чыгалы» звучало смазанно
    seed: 1400,
    subtitle: false,
  },
];

// Финальный экран (все контакты одновременно) появляется чуть раньше n04.
export const B12_CTA_LEAD = 0.4;
// Минимальные требования к финалу (AGENTS.md).
export const B12_CTA_MIN = 5;
export const B12_AFTER_LAST_WORD_MIN = 3;

export const lineById = (id: string) => {
  const l = B12_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const B12_TEXT = {
  // календарь в телефоне мамы — завтрашняя дорога
  calendar: {
    title: "Эртең",
    day: "Шаршемби",
    rows: [
      { time: "07:40", label: "Мектепке", who: "?", kind: "school" },
      { time: "09:00", label: "Апанын жумушу", who: "Апа", kind: "work" },
      { time: "13:00", label: "Кайра үйгө", who: "?", kind: "home" },
      { time: "14:00", label: "Атанын жолугушуусу", who: "Ата", kind: "work" },
    ],
  },
  // блокнот папы
  planner: { title: "Эртеңки иш", lines: ["10:00 — отчёт", "14:00 — жолугушуу", "18:00 — ?"] },
  // профиль и страница BalaGo в телефоне
  profile: {
    name: "balago.kg",
    title: "BalaGo",
    bio: "Бишкек • Балдар үчүн такси",
    link: "Каттоо шилтемеси",
  },
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    button: "Алдын ала каттоо",
  },
  // маршрут из линий рисунка
  route: { home: "ҮЙ", school: "МЕКТЕП", city: "Бишкек" },
  steps: [
    { n: "1", text: "Арыз калтырасыз" },
    { n: "2", text: "Ылайыктуу топ түзүлөт" },
    { n: "3", text: "Биринчи толук сыноо сапары — акысыз" },
  ],
  stepsNote: "Сапар топ түзүлгөндөн кийин гана башталат",
  cta: {
    brand: "BalaGo",
    city: "Бишкек • Балдар үчүн такси",
    link: "Профилдеги шилтемеге өтүңүз",
    or: "же WhatsApp аркылуу жазыңыз",
    whatsapp: "WhatsApp: 0998 08 38 28",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
  },
} as const;
