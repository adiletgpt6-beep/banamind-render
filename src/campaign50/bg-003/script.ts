// BG-003 «Куда исчезает обед?» (кампания BalaGo-50, выпуск №04).
// Сценарий: campaigns/balago-50/episodes/04-BG-003.md (производственная
// редакция v1). Стилистика: таймлапс + ожившая шкала обеденного перерыва.
//
// Причинно-следственная ось: час обеда (12:30–13:30) уходит на дорогу
// кеңсе → мектеп → үй → кеңсе (шкала обеда «съедается» сегментами) →
// мама видит на календаре, что так каждый день, и сама задаётся вопросом →
// берёт телефон и ищет «Бишкекте мектепке туруктуу каттам» → находит
// BalaGo: заранее организованный маршрут ҮЙ → МЕКТЕП → ҮЙ → честные шаги
// (сначала формируется подходящая группа, первая полная пробная поездка
// бесплатна, решение продолжать — за родителем) → финал: Бишкек, ссылка
// в профиле и WhatsApp 0998 08 38 28.
//
// Герои и время в пути — условный художественный пример (в кадре
// «Шарттуу мисал»). Поездка BalaGo не показывается выполненной: только план
// маршрута и шаги до старта. Еды в кадре нет (пустая тарелка-символ обеда
// сразу превращается в песочные часы).
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG3_VIDEO = {
  id: "BalaGoBG003",
  output: "balago-bg-003",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-003",
} as const;

// ---------- Сцены ----------
// Длительность сцены = max(minSec, начало речи + речь + хвост): монтаж
// подстраивается под фактическую озвучку, речь не ускоряется и не режется.
export type Bg3SceneId = "hook" | "drive" | "week" | "search" | "steps" | "cta";

export const BG3_SCENES: readonly {
  readonly id: Bg3SceneId;
  readonly title: string;
  readonly minSec: number;
  readonly tailSec: number; // от конца последней реплики до конца сцены
}[] = [
  { id: "hook", title: "1. 12:30 → 13:30: тарелка → песочные часы", minSec: 5.2, tailSec: 0.9 },
  { id: "drive", title: "2. Таймлапс: кеңсе → мектеп → үй → кеңсе", minSec: 12.5, tailSec: 1.0 },
  { id: "week", title: "3. Неделя: каждый день одно и то же", minSec: 11.5, tailSec: 2.8 },
  { id: "search", title: "4. Поиск → BalaGo → один маршрут", minSec: 12.5, tailSec: 1.4 },
  { id: "steps", title: "5. Группа → бесплатная проба → решение", minSec: 11, tailSec: 1.6 },
  // финал держится ≥ 3 с после последнего слова (с запасом)
  { id: "cta", title: "6. Финал: Бишкек + оба контакта", minSec: 12, tailSec: 3.6 },
];

// ---------- Голоса ----------
export type Bg3Role = "narrator" | "mother";

export const BG3_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 3031,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые кыргызские голоса проекта (ElevenLabs Voice Design), проверенные
// в 2D-роликах (замеры MMS); новые голоса не создаются.
//   narrator — спокойный низкий мужской голос (half-hour-2d, CER 2,2 %):
//              контраст с голосом героини и отличие от диктора BG-032;
//   mother   — тёплый, мягкий, немного уставший голос мамы (CER 1,8 %).
export const BG3_VOICES: Record<Bg3Role, { readonly name: string; readonly voiceId: string; readonly from: string }> = {
  narrator: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm", from: "half-hour-2d" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p", from: "half-hour-2d" },
};

// ---------- Реплики ----------
export type Bg3Line = {
  readonly id: string;
  readonly role: Bg3Role;
  readonly scene: Bg3SceneId;
  // начало речи: секунды от начала сцены (или после конца предыдущей
  // реплики той же сцены, если задан afterPrev)
  readonly lead: number;
  readonly afterPrev?: boolean;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

export const BG3_LINES: readonly Bg3Line[] = [
  { id: "n01", role: "narrator", scene: "hook", lead: 0.55, text: "Бир саат түшкү тыныгуу. Ал кайда жоголот?", tag: "[curious]" },
  {
    id: "n02",
    role: "narrator",
    scene: "drive",
    lead: 1.1,
    text: "Кээ бир ата-энелер тыныгуусун баласын мектептен алып келүүгө жумшайт.",
  },
  // Мысль героини (про себя, рот закрыт). Правка естественности v1:
  // «…өзүм бүтүрүшүм керекпи?» → «…өзүм жүрүшүм керекпи?» («жол жүрүү» —
  // обычное «ездить по дороге»); смысл и драматургия не меняются.
  { id: "m01", role: "mother", scene: "week", lead: 5.0, text: "Бул жолду күн сайын өзүм жүрүшүм керекпи?", tag: "[thoughtful]" },
  {
    id: "n03",
    role: "narrator",
    scene: "search",
    lead: 4.6,
    text: "BalaGo — Бишкектеги балдар үчүн алдын ала уюштурулган каттам: үйдөн мектепке, андан кайра үйгө.",
    spoken: "БалаГо — Бишкектеги балдар үчүн алдын ала уюштурулган каттам: үйдөн мектепке, андан кайра үйгө.",
  },
  {
    id: "n04",
    role: "narrator",
    scene: "steps",
    lead: 0.7,
    text: "Алгач каттамга ылайык топ түзүлөт. Биринчи толук сыноо сапары акысыз. Улантуу чечими — сизде.",
  },
  {
    id: "n05",
    role: "narrator",
    scene: "cta",
    lead: 0.8,
    text: "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken:
      "БалаГо — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
    tag: "[warmly]",
  },
  { id: "n06", role: "narrator", scene: "cta", lead: 0.45, afterPrev: true, text: "BalaGo менен жолго чыгалы!", spoken: "БалаГо менен жолго чыгалы!", tag: "[warmly]" },
];

// ---------- Экранные надписи (кыргызча) ----------
export const BG3_TEXT = {
  lunch: "Түшкү тыныгуу",
  hour: "1 саат",
  from: "12:30",
  to: "13:30",
  example: "Шарттуу мисал",
  minLeft: "мүн. калды",
  over: "Тыныгуу бүттү",
  places: { office: "Кеңсе", school: "Мектеп", home: "Үй" },
  legs: ["Мектепке", "Үйгө", "Кеңсеге"],
  days: ["Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума"],
  schoolRoad: "Мектеп жолу",
  everyDay: "Күн сайын ушул жол",
  query: "Бишкекте мектепке туруктуу каттам",
  results: "Издөө жыйынтыктары",
  card: {
    title: "BalaGo — Балдар үчүн такси",
    sub: "Бишкек • алдын ала пландалган каттам",
  },
  plan: {
    title: "Бир каттам — алдын ала пландалат",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    morning: "Эртең менен",
    afternoon: "Сабактан кийин",
    oldWay: "Түшкү тыныгуудагы жол",
  },
  steps: {
    title: "Кантип башталат?",
    s1: "Каттамга ылайык топ түзүлөт",
    s1note: "3–4 бала • издөө 2 жумага чейин",
    s2: "Биринчи толук сыноо сапары — акысыз",
    s2note: "ҮЙ → МЕКТЕП → ҮЙ",
    s3: "Улантуу чечими — сизде",
    s3yes: "Улантам",
    s3think: "Ойлонуп көрөм",
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

export const lineById = (id: string) => {
  const l = BG3_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};
