// BalaGo-50, выпуск №25 / BG-024 — «Эмне үчүн эртең эле эмес?»
// («Почему не сразу завтра?»), композиция BalaGoBG024, 2D, 1080×1920, 30 fps.
//
// Приём: честная инфографика-ответ на вопрос родителя. Маршрут собирается
// как аккуратный пазл из адресов, школ и времени. Причинная цепочка:
// вопрос «эртең эле?» (кнопка не даёт мгновенного подтверждения) →
// рука родителя пробует сложить пазл и видит, что разные школы и смены
// не совпадают → баштапкы издөө до 2 недель (не обещание старта) →
// только совпавшие точки дают линию маршрута → после формирования группы
// первая полная пробная поездка ҮЙ → МЕКТЕП → ҮЙ бесплатна, решение
// продолжать — за родителем → CTA.
//
// Сценарий: campaigns/balago-50/episodes/25-BG-024.md.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG24_VIDEO = {
  id: "BalaGoBG024",
  output: "balago-bg-024",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-024/voice",
  audioDir: "audio/campaign50/bg-024",
  logo: "assets/campaign50/bg-024/logo.png",
  // Общая длительность считается по озвучке (timing.ts), но не короче:
  minSec: 62,
  maxSec: 90,
} as const;

// ---------- Сцены ----------
// Длина сцены — не меньше len (с); если речь длиннее, сцена растягивается
// так, чтобы после последней реплики оставалось tail секунд.
export type Bg24SceneId = "hook" | "puzzle" | "calendar" | "match" | "trial" | "cta";

export const BG24_SCENES: readonly {
  readonly id: Bg24SceneId;
  readonly title: string;
  readonly len: number;
  readonly tail: number;
}[] = [
  { id: "hook", title: "1. Кнопка «Эртең эле?» → вопрос над пазлом", len: 6.2, tail: 1.6 },
  { id: "puzzle", title: "2. Рука родителя складывает пазл: дарек, мектеп, убакыт", len: 12, tail: 2.2 },
  { id: "calendar", title: "3. Баштапкы топ издөө: 2 жумага чейин — не обещание", len: 13, tail: 1.8 },
  { id: "match", title: "4. Совпавшие точки → линия маршрута (условный пример)", len: 12, tail: 1.8 },
  { id: "trial", title: "5. Полная пробная поездка ҮЙ → МЕКТЕП → ҮЙ, решение родителя", len: 12, tail: 2.2 },
  // финал: оба способа связи и номер на экране всё время сцены,
  // после последнего слова ≥ 3 с (берём 3,6 с)
  { id: "cta", title: "6. Финал: алдын ала каттоо, Бишкек, профиль, WhatsApp", len: 15, tail: 3.6 },
];

// Финальный экран с контактами появляется через столько секунд после
// начала сцены cta и остаётся до конца ролика.
export const BG24_CONTACTS_IN = 0.8;

// ---------- Голос ----------
export type Bg24Role = "narrator";

export const BG24_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 2425,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовый голос проекта (ElevenLabs Voice Design, кыргызская речь),
// проверенный в 2D-роликах №10–15; новые голоса не создаются.
export const BG24_VOICES: Record<Bg24Role, { readonly name: string; readonly voiceId: string; readonly from: string }> = {
  // спокойный доброжелательный голос диктора
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "half-hour-2d" },
};

// ---------- Реплики (дословно по сценарию 25-BG-024.md) ----------
export type Bg24Line = {
  readonly id: string;
  readonly role: Bg24Role;
  readonly scene: Bg24SceneId;
  // Начало речи: секунды от начала сцены, но не раньше чем через gap
  // секунд после конца предыдущей реплики.
  readonly at: number;
  readonly gap?: number;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

export const BG24_LINES: readonly Bg24Line[] = [
  {
    id: "n01",
    role: "narrator",
    scene: "hook",
    at: 0.5,
    text: "Бүгүн катталсаңыз, BalaGo эртең эле алып кетеби?",
    spoken: "Бүгүн катталсаңыз, БалаГо эртең эле алып кетеби?",
    tag: "[curious]",
  },
  {
    id: "n02",
    role: "narrator",
    scene: "puzzle",
    at: 0.9,
    text: "Алгач балдардын дареги, мектеби жана убактысы бири-бирине туура келиши керек.",
    tag: "[thoughtful]",
  },
  {
    id: "n03",
    role: "narrator",
    scene: "calendar",
    at: 0.8,
    text: "Ылайыктуу топту алгачкы издөө эки жумага чейин созулушу мүмкүн. Бул — эртең эле каттам башталат деген убада эмес.",
    tag: "[calm]",
  },
  {
    id: "n04",
    role: "narrator",
    scene: "match",
    at: 1.0,
    text: "Топ түзүлгөндө гана каттамдын шарттарын тактап, кийинки кадамга өтүүгө болот.",
  },
  {
    id: "n05",
    role: "narrator",
    scene: "trial",
    at: 0.9,
    text: "Андан кийин биринчи толук сыноо сапары акысыз өтөт. Кызматты улантуу чечимин өзүңүз кабыл аласыз.",
    tag: "[warmly]",
  },
  {
    id: "n06",
    role: "narrator",
    scene: "cta",
    at: 1.0,
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
    tag: "[warmly]",
  },
  {
    id: "n07",
    role: "narrator",
    scene: "cta",
    at: 0,
    gap: 0.35,
    text: "Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken:
      "Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
  },
  {
    id: "n08",
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
  const l = BG24_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const BG24_TEXT = {
  hook: {
    question: "Каттам эртең эле башталабы?",
    app: "Арыз",
    fields: [
      { k: "Дарек", v: "Үй • Бишкек" },
      { k: "Мектеп", v: "Балаңыздын мектеби" },
      { k: "Убакыт", v: "07:30 • 1-смена" },
    ],
    button: "Эртең эле?",
    pending: "Топ изделүүдө…",
  },
  puzzle: {
    title: "Каттам пазлы",
    city: "Бишкек",
    kinds: ["Дарек", "Мектеп", "Убакыт"],
    // пазл одного ребёнка, к которому подбираются другие
    base: { home: "Жакын үй", school: "А мектеби", time: "1-смена" },
    wrong: { home: "Алыс үй", school: "Б мектеби", time: "2-смена", note: "Туура келбейт" },
    right: { home: "Жакын үй", school: "А мектеби", time: "1-смена", note: "Туура келет" },
    sum: "Шайкештик керек — жөн гана күтүү эмес",
  },
  calendar: {
    title: "Баштапкы топ издөө",
    range: "2 жумага чейин",
    days: 14,
    note: "Бул — старт күнүнүн убадасы эмес",
    sub: "Топ эртерээк да, кечирээк да түзүлүшү мүмкүн",
  },
  match: {
    city: "Бишкек",
    example: "Шарттуу мисал",
    checks: ["Даректер жакын", "Бир мектеп", "Бир убакыт"],
    group: "Топ түзүлдү: 3–4 бала",
    next: "Шарттарды тактоо → кийинки кадам",
    school: "Мектеп",
  },
  trial: {
    after: "Топ түзүлгөндөн кийин",
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    am: "Эртең менен",
    pm: "Сабактан кийин",
    badge: "Биринчи толук сыноо сапары — акысыз",
    choice: "Улантуу чечими — сизде",
    yes: "Улантуу",
    no: "Ойлонуу",
  },
  cta: {
    brand: "BalaGo",
    early: "Алдын ала катталыңыз",
    city: "Бишкек • Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    link: "Профилдеги шилтемеге өтүңүз",
    or: "же WhatsApp аркылуу жазыңыз",
    whatsappLabel: "WhatsApp:",
    whatsappNumber: "0998 08 38 28",
  },
} as const;
