// BalaGo-50, выпуск №21 / BG-020 «Тихий вечер пятницы» (композиция BalaGoBG020).
//
// Тёплый минималистичный мини-фильм: один уютный ракурс гостиной в Бишкеке
// и аккуратные крупные планы. Пятница, тишина, сын читает книгу. Родители
// по привычке снова раскладывают школьную логистику следующей недели,
// замечают, что делают это каждую неделю, и сами решают заранее посмотреть
// организованный маршрут. Мама открывает BalaGo и читает порядок
// оформления. Семья только планирует: поездки ещё нет и она не обещается.
//
// Источник речи — этот файл: каждая реплика сценария
// (campaigns/balago-50/episodes/21-BG-020.md) записана дословно в `text`;
// `spoken` — то же для синтеза (бренд и номер — словами для кыргызского TTS).
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.
import { TS2_TTS, TS2_VOICES } from "../../two-schedules-2d/script.ts";

export const BG020_VIDEO = {
  id: "BalaGoBG020",
  output: "balago-bg-020",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-020",
} as const;

// ---------- Сцены ----------
// Шкала адаптивная: сцена длится не меньше minSec; её реплики идут через
// lead секунд после начала сцены и через gap после предыдущей реплики;
// после последней реплики сцены — tail. Длины берутся из фактической
// озвучки, поэтому голос никогда не ускоряется и не обрезается.
export type Bg020SceneId = "hook" | "habit" | "realize" | "open" | "steps" | "cta";

export type Bg020Scene = {
  readonly id: Bg020SceneId;
  readonly title: string;
  readonly minSec: number;
  readonly lead: number;
  readonly tail: number;
};

export const BG020_SCENES: readonly Bg020Scene[] = [
  { id: "hook", title: "1. Тихий вечер пятницы", minSec: 6.6, lead: 2.5, tail: 1.5 },
  { id: "habit", title: "2. Привычка: логистика недели", minSec: 11, lead: 2.6, tail: 1.1 },
  { id: "realize", title: "3. Каждую неделю — снова", minSec: 11, lead: 2.8, tail: 1.3 },
  { id: "open", title: "4. Мама открывает BalaGo", minSec: 11, lead: 1.5, tail: 0.9 },
  { id: "steps", title: "5. Порядок оформления", minSec: 10, lead: 0.7, tail: 1.6 },
  // финал: книга закрывается → обложка становится карточкой контактов
  { id: "cta", title: "6. Финал: Бишкек, профиль, WhatsApp", minSec: 10, lead: 1.7, tail: 3.6 },
];

// Контакты появляются через столько секунд после начала финальной сцены
// и остаются неподвижными до последнего кадра.
export const BG020_CONTACTS_AT = 1.2;
// После последнего слова финальный экран держится не меньше (с).
export const BG020_HOLD_AFTER_VOICE = 3;

// ---------- Голоса ----------
export type Bg020Role = "son" | "mother" | "father" | "narrator";

// Готовые голоса проекта для кыргызской речи (созданы в ElevenLabs Voice
// Design для 2D-роликов; см. src/two-schedules-2d/script.ts). Новые голоса
// не создаются; модель и настройки те же.
export const BG020_TTS = TS2_TTS;
export const BG020_VOICES: Record<Bg020Role, { readonly name: string; readonly voiceId: string }> = {
  son: TS2_VOICES.son,
  mother: TS2_VOICES.mother,
  father: TS2_VOICES.father,
  narrator: TS2_VOICES.narrator,
};

export const ROLE_LABEL: Record<Bg020Role, string> = {
  son: "Бала",
  mother: "Апа",
  father: "Ата",
  narrator: "BalaGo",
};

// ---------- Реплики (дословно по сценарию) ----------
export type Bg020Line = {
  readonly id: string;
  readonly role: Bg020Role;
  readonly scene: Bg020SceneId;
  readonly gap?: number; // пауза после предыдущей реплики той же сцены (с)
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number;
  readonly subtitle?: boolean; // false — текст уже крупно в кадре (финал)
};

export const BG020_LINES: readonly Bg020Line[] = [
  // ребёнок обращается к обоим родителям; форма «отурабызбы» — «мы»
  { id: "s01", role: "son", scene: "hook", text: "Апа, ата, бүгүн чогуу отурабызбы?", tag: "[gently]", seed: 2101 },
  {
    id: "n01",
    role: "narrator",
    scene: "habit",
    text: "Жума күнү жумуш бүтсө да, кийинки аптанын мектепке каттамы жөнүндө суроо кайра чыгат.",
    seed: 2111,
  },
  { id: "f01", role: "father", scene: "realize", text: "Апта сайын ушуну кайра пландап жатабыз экен.", seed: 2121 },
  { id: "m01", role: "mother", scene: "realize", gap: 0.55, text: "Каттамды алдын ала уюштуруунун жолун карап көрөлүчү.", tag: "[gently]", seed: 2131 },
  {
    id: "n02",
    role: "narrator",
    scene: "open",
    text: "BalaGo — Бишкектеги балдар үчүн мектепке жана кайра үйгө жеткирүү боюнча алдын ала уюштурулуучу кызмат.",
    spoken: "БалаГо — Бишкектеги балдар үчүн мектепке жана кайра үйгө жеткирүү боюнча алдын ала уюштурулуучу кызмат.",
    seed: 2141,
  },
  {
    id: "n03",
    role: "narrator",
    scene: "steps",
    text: "Адегенде ылайыктуу топ түзүлөт. Биринчи толук сыноо сапары акысыз. Андан кийин улантууну өзүңүз чечесиз.",
    seed: 2151,
  },
  {
    id: "n04",
    role: "narrator",
    scene: "cta",
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
    tag: "[warmly]",
    seed: 2161,
    subtitle: false,
  },
  {
    id: "n05",
    role: "narrator",
    scene: "cta",
    gap: 0.45,
    text: "Каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken: "Каттоо үчүн профилдеги шилтемеге өтүңүз, же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
    seed: 2171,
    subtitle: false,
  },
  { id: "n06", role: "narrator", scene: "cta", gap: 0.5, text: "BalaGo менен жолго чыгалы!", spoken: "БалаГо менен жолго чыгалы!", tag: "[warmly]", seed: 2181, subtitle: false },
];

export const bg020LineById = (id: string) => {
  const l = BG020_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const BG020_TEXT = {
  place: "Бишкек • жума, кечки саат 19:40",
  book: { title: "Жомоктор", sub: "балдар үчүн" },
  notebook: {
    friday: "Жума",
    fridayNote: "Бүгүн — үй-бүлө менен",
    monday: "Дүйшөмбү:",
    question: "ким жеткирет?",
  },
  // рабочий календарь папы: неделя, где школьная дорога повторяется
  calendar: {
    title: "Кийинки апта",
    days: ["Дш", "Шш", "Шр", "Бш", "Жм"],
    morning: "07:40 Мектепке",
    work: "Жумуш",
    afternoon: "13:30 Мектептен",
    next: "Дагы бир апта",
    repeat: "Ар апта — ошол эле суроо",
  },
  phone: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    howTitle: "Кантип катталат?",
    lead: "Мектепке жана кайра үйгө — алдын ала уюштурулат",
  },
  steps: [
    { n: "1", title: "Арыз калтырасыз", note: "профилдеги шилтеме же WhatsApp" },
    { n: "2", title: "Ылайыктуу топ түзүлөт", note: "3–4 бала • издөө 2 жумага чейин" },
    { n: "3", title: "Биринчи толук сыноо сапары — акысыз", note: "ҮЙ → МЕКТЕП → ҮЙ" },
    { n: "4", title: "Улантууну өзүңүз чечесиз", note: "төлөм — сыноодон кийин гана" },
  ],
  stepsNote: "Топ түзүлмөйүнчө сапар башталбайт",
  save: "Сактоо",
  saved: "Сакталды",
  planning: "Азырынча — пландап жатабыз",
  cta: {
    brand: "BalaGo",
    city: "Бишкек • Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    link: "Профилдеги шилтемеге өтүңүз",
    or: "же WhatsApp аркылуу жазыңыз",
    whatsappLabel: "WhatsApp:",
    whatsappNumber: "0998 08 38 28",
    slogan: "BalaGo менен жолго чыгалы!",
  },
} as const;
