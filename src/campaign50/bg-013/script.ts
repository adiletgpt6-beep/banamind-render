// BG-013 «Самый длинный вторник» (кампания BalaGo-50, выпуск №14).
// Сценарий: campaigns/balago-50/episodes/14-BG-013.md (исходный
// производственный вариант). Задание: campaigns/balago-50/production/TASK_BG-013_EP14.md.
//
// Визуальная фишка: мир глазами ребёнка — камера на высоте детских глаз
// (взрослые высокие, столешницы видны снизу), часы во всех сценах и мягкое
// «растягивание» времени: стрелки тянутся, как резиновые, циферблат плывёт.
//
// Причинно-следственная ось: хук — огромные часы школы, мальчик спрашивает,
// почему вторник такой длинный → мама вовремя завершает встречу, забирает
// сына на своей машине (он пристёгнут), привозит домой и снова садится за
// работу → вечером звонок коллеги, ноутбук, усталые глаза; сын кладёт рядом
// свой рисунок часов и спрашивает маму на «сиз» → на рисунке две стрелки:
// от офиса мамы и от дома к школе — мама видит, что повторяется дорога, и
// сама ищет в ноутбуке заранее организованную школьную поездку (видимый
// поступок) → рисунок превращается в карту Бишкека: ҮЙ → МЕКТЕП → ҮЙ,
// заявка, подбор группы, бесплатная первая полная пробная поездка (группа
// ещё не готова, поездка не показана) → сын дорисовывает солнце, часы
// превращаются в финальный экран: Бишкек, ссылка в профиле и WhatsApp.
//
// Ребёнок всё время под присмотром, мама приезжает вовремя; без опасных
// ситуаций. Персонажи — художественный пример.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG13_VIDEO = {
  id: "BalaGoBG013",
  output: "balago-bg-013",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-013",
} as const;

// ---------- Сцены ----------
// Длительность сцены = max(minSec, начало речи + речь + хвост): монтаж
// подстраивается под фактическую озвучку, речь не ускоряется и не режется.
export type Bg13SceneId = "hook" | "pickup" | "evening" | "drawing" | "map" | "cta";

export const BG13_SCENES: readonly {
  readonly id: Bg13SceneId;
  readonly title: string;
  readonly minSec: number;
  readonly tailSec: number; // от конца последней реплики до конца сцены
}[] = [
  { id: "hook", title: "1. Огромные часы школы (хук)", minSec: 5.6, tailSec: 1.0 },
  { id: "pickup", title: "2. Офис → школа → дом → снова работа", minSec: 12, tailSec: 1.6 },
  { id: "evening", title: "3. Вечер: звонок, ноутбук, рисунок", minSec: 11, tailSec: 1.0 },
  { id: "drawing", title: "4. Рисунок часов: повторяется дорога → поиск", minSec: 10.5, tailSec: 4.2 },
  { id: "map", title: "5. Карта Бишкека: ҮЙ → МЕКТЕП → ҮЙ и условия", minSec: 11.5, tailSec: 1.7 },
  // финал держится ≥ 3 с после последнего слова (с запасом)
  { id: "cta", title: "6. Солнце на рисунке → финал: Бишкек + оба контакта", minSec: 12, tailSec: 3.6 },
];

// ---------- Голоса ----------
export type Bg13Role = "narrator" | "mother" | "son";

export const BG13_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 1313,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые кыргызские голоса проекта (ElevenLabs Voice Design), уже
// проверенные в 2D-роликах (замеры MMS — voice-samples/). Новые голоса не
// создаются. Сына, как принято в анимации, озвучивает самый светлый и
// звонкий голос проекта (≈ 286 Гц); тон и темп не меняются механически.
export const BG13_VOICES: Record<Bg13Role, { readonly name: string; readonly voiceId: string; readonly from: string }> = {
  // спокойный доброжелательный дикторский голос (CER 2,1 % по MMS)
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "half-hour-2d" },
  // тёплый, мягкий, немного уставший голос мамы (CER 1,8 % по MMS)
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p", from: "half-hour-2d" },
  // светлый звонкий голос сына (CER 4,2 % по MMS)
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM", from: "half-hour-2d" },
};

// ---------- Реплики (текст сценария) ----------
export type Bg13Line = {
  readonly id: string;
  readonly role: Bg13Role;
  readonly scene: Bg13SceneId;
  // начало речи: секунды от начала сцены (или после конца предыдущей
  // реплики той же сцены, если задан afterPrev)
  readonly lead: number;
  readonly afterPrev?: boolean;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

export const BG13_LINES: readonly Bg13Line[] = [
  // ребёнок (закадрово) — вопрос-хук
  { id: "s01", role: "son", scene: "hook", lead: 1.0, text: "Эмнеге шейшемби ушунча узун сезилет?", tag: "[curious]" },
  {
    id: "n01",
    role: "narrator",
    scene: "pickup",
    lead: 0.7,
    text: "Апасы иштен чыгып, баласын мектептен алып келет. Анан үйгө жетип, бүткөрүлбөгөн иштерине кайра киришет.",
  },
  // вечер: сын к маме — только «сиз»
  { id: "s02", role: "son", scene: "evening", lead: 5.3, text: "Апа, сиз бүгүн да чарчадыңызбы?", tag: "[softly]" },
  { id: "m01", role: "mother", scene: "evening", lead: 0.5, afterPrev: true, text: "Бир аз, балам. Жумуш да, жол да узун болду.", tag: "[tired]" },
  { id: "m02", role: "mother", scene: "drawing", lead: 3.0, text: "Күн сайын ушул жолду башкача уюштурса болобу?", tag: "[thoughtful]" },
  {
    id: "n02",
    role: "narrator",
    scene: "map",
    lead: 0.7,
    text: "BalaGo Бишкекте балдарды үйдөн мектепке, сабактан кийин кайра үйгө жеткирүү үчүн каттам уюштурат. Адегенде ылайыктуу топ түзүлөт.",
    spoken:
      "БалаГо Бишкекте балдарды үйдөн мектепке, сабактан кийин кайра үйгө жеткирүү үчүн каттам уюштурат. Адегенде ылайыктуу топ түзүлөт.",
  },
  {
    id: "n03",
    role: "narrator",
    scene: "cta",
    lead: 1.1,
    text: "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken:
      "БалаГо — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
    tag: "[warmly]",
  },
  { id: "n04", role: "narrator", scene: "cta", lead: 0.45, afterPrev: true, text: "BalaGo менен жолго чыгалы!", spoken: "БалаГо менен жолго чыгалы!", tag: "[warmly]" },
];

// ---------- Экранные надписи (кыргызча) ----------
export const BG13_TEXT = {
  hook: { day: "Шейшемби" },
  pickup: {
    office: "Иш",
    school: "Мектеп",
    home: "Үй",
    work: "Кайра жумуш",
    meetingEnd: "Жыйын бүттү",
    onTime: "Убагында",
  },
  evening: { call: "Кесиптеш", calling: "чалып жатат…" },
  drawing: {
    office: "Апамдын иши",
    school: "Мектеп",
    home: "Үй",
    note: "Күн сайын",
  },
  search: {
    query: "Бишкек: балдарды мектепке жеткирүү каттамы",
    resultTitle: "BalaGo — Балдар үчүн такси",
    resultUrl: "Профилдеги шилтеме",
    resultText: "Үй → Мектеп → Үй • алдын ала уюштурулган каттам",
  },
  map: {
    city: "Бишкек",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    home: "ҮЙ",
    school: "МЕКТЕП",
    morning: "Эртең менен",
    afternoon: "Сабактан кийин",
    steps: [
      { n: "1", title: "Өтүнмө", note: "үй, мектеп, сабак убактысы" },
      { n: "2", title: "Ылайыктуу топ түзүлөт", note: "3–4 бала • издөө 2 жумага чейин" },
      { n: "3", title: "Биринчи толук сыноо сапары", note: "акысыз • төлөм сыноодон кийин гана" },
    ],
    pending: "Топ азырынча түзүлө элек",
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
  const l = BG13_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};
