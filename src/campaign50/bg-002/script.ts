// BalaGo-50, выпуск №03 / BG-002 — «Үч мүнөт жыйынга чейин»
// («Три минуты до совещания», композиция BG002, 66–75 с по озвучке).
//
// Параллельный монтаж + зрительный таймер. Папа готовится к важному
// совещанию; сын из школы спрашивает, заберёт ли он его. Папа пытается
// передвинуть встречу в календаре — слот занимает другая встреча; неделя
// показывает, что встречи каждый день разные. Видимое решение: папа
// записывает мысль «мектепке каттамды алдын ала уюштуруу» и открывает
// BalaGo. Условная схема маршрута ҮЙ → МЕКТЕП → ҮЙ, честные условия
// (группа, бесплатная полная пробная поездка, затем решение родителей).
// Заявка остаётся открытой — поездка не подтверждена. Таймер
// останавливается у открытой переговорной, затем финальный экран CTA.
//
// Персонажи и офис — условные, не документальные клиенты.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const BG2_VIDEO = {
  id: "BG002",
  output: "balago-bg-002",
  width: 1080,
  height: 1920,
  fps: 30,
  // Длительность считается по фактической озвучке финала: последнее
  // слово + ≥ 3,2 с тишины, в пределах minSec…maxSec.
  minSec: 66,
  maxSec: 75,
  tailSec: 3.4,
  voiceDir: "audio/campaign50/bg-002",
} as const;

// ---------- Сцены (секунды) ----------
export type Bg2SceneId = "hook" | "call" | "calendar" | "app" | "terms" | "cta";

export const BG2_SCENES: readonly {
  readonly id: Bg2SceneId;
  readonly title: string;
  readonly from: number;
  readonly to: number;
}[] = [
  { id: "hook", title: "1. Жыйынга 03:00", from: 0, to: 6.2 },
  { id: "call", title: "2. Параллель: уулу чалат", from: 6.2, to: 17.0 },
  { id: "calendar", title: "3. Календарь жана чечим", from: 17.0, to: 28.6 },
  { id: "app", title: "4. BalaGo: ҮЙ → МЕКТЕП → ҮЙ", from: 28.6, to: 39.2 },
  { id: "terms", title: "5. Шарттар жана жыйынга", from: 39.2, to: 51.4 },
  // фактический конец — по озвучке (calculateMetadata), здесь — верхняя граница
  { id: "cta", title: "6. Финалдык экран", from: 51.4, to: BG2_VIDEO.maxSec },
];

// Зрительный таймер: 03:00 в начале, останавливается у открытой
// переговорной (папа успевает, остаётся 00:10).
export const BG2_TIMER = { startSec: 180, stopAt: 51.0, stopValue: 10 } as const;

// ---------- Голоса ----------
export type Bg2Role = "father" | "son" | "narrator";

export const BG2_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 203,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые голоса проекта (ElevenLabs Voice Design, носители кыргызского),
// проверенные в 2D-роликах №10–12. Новые голоса не создаются.
export const BG2_VOICES: Record<Bg2Role, { readonly name: string; readonly voiceId: string; readonly from: string }> = {
  // спокойный низкий голос отца (≈110 Гц)
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm", from: "half-hour-2d" },
  // светлый звонкий голос сына (≈286 Гц)
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM", from: "half-hour-2d" },
  // спокойный доброжелательный рекламный голос диктора
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", from: "half-hour-2d" },
};

// ---------- Реплики ----------
export type Bg2Line = {
  readonly id: string;
  readonly role: Bg2Role;
  readonly scene: Bg2SceneId;
  readonly at: number; // начало речи, с от начала ролика
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // что уходит в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3, не звучит
  readonly seed?: number;
  readonly phone?: boolean; // голос из телефона
};

export const BG2_LINES: readonly Bg2Line[] = [
  { id: "n01", role: "narrator", scene: "hook", at: 0.8, text: "Үч мүнөттөн кийин маанилүү жыйын башталат." },
  { id: "s01", role: "son", scene: "call", at: 8.0, text: "Ата, бүгүн мектептен сиз алып кетесизби?" },
  { id: "f01", role: "father", scene: "call", at: 11.7, text: "Балам, убакытты тактап алайын.", tag: "[thoughtful]" },
  { id: "n02", role: "narrator", scene: "calendar", at: 18.0, text: "Жумуштагы жолугушуулар ар күнү бирдей болбойт." },
  { id: "n03", role: "narrator", scene: "calendar", at: 23.2, text: "Мектепке каттамды алдын ала уюштурсачы?" },
  {
    id: "n04",
    role: "narrator",
    scene: "app",
    at: 29.2,
    text: "BalaGo Бишкекте балдарды үйдөн мектепке, сабактан кийин кайра үйгө жеткирүүгө багытталган кызмат.",
    spoken: "БалаГо Бишкекте балдарды үйдөн мектепке, сабактан кийин кайра үйгө жеткирүүгө багытталган кызмат.",
  },
  {
    id: "n05",
    role: "narrator",
    scene: "terms",
    at: 39.6,
    text: "Адегенде ылайыктуу топ түзүлөт. Биринчи толук сыноо сапары акысыз. Андан соң ата-эне чечим кабыл алат.",
  },
  {
    id: "n06",
    role: "narrator",
    scene: "cta",
    at: 52.0,
    text: "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз. BalaGo менен жолго чыгалы!",
    spoken:
      "БалаГо — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз, же Ватсап аркылуу нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз. БалаГо менен жолго чыгалы!",
    tag: "[warmly]",
  },
];

// Последнее слово — не позже maxSec − 3,2 с (финальный экран держится ≥ 3 с).
export const BG2_DIALOG_END = BG2_VIDEO.maxSec - 3.2;

export const BG2_MIN_GAP: Readonly<Record<string, number>> = {};

export const lineById = (id: string) => {
  const l = BG2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Экранные надписи (кыргызча) ----------
export const BG2_TEXT = {
  timer: { label: "Жыйынга", done: "Убагында" },
  room: "Жыйын бөлмөсү",
  docs: "Жыйынга материалдар",
  notify: { from: "Уулум", text: "Сабактан кийин ким алып кетет?", time: "13:57" },
  call: { contact: "Уулум", status: "Сүйлөшүү" },
  calendar: {
    title: "Бүгүн",
    meeting: "Маанилүү жыйын",
    school: "Сабак бүтөт",
    client: "Кардар менен жолугушуу",
    other: "Отчёт талкуулоо",
    busy: "Бул убакыт бош эмес",
    week: "Бул апта",
    days: ["Дүй", "Шей", "Шар", "Бей", "Жума"],
  },
  note: { title: "Эскертме", text: "Мектепке каттамды алдын ала уюштуруу" },
  app: {
    brand: "BalaGo",
    tagline: "Бишкек • Балдар үчүн такси",
    card: "Мектепке каттам",
    cardSub: "Үй → Мектеп → Үй",
    open: "Маршрутту көрүү",
    home: "ҮЙ",
    school: "МЕКТЕП",
    morning: "Эртең менен",
    afterSchool: "Сабактан кийин",
    example: "Шарттуу мисал",
  },
  steps: [
    { title: "Ылайыктуу топ түзүлөт", note: "3–4 бала • 2 жумага чейин" },
    { title: "Биринчи толук сыноо сапары — акысыз", note: "ҮЙ → МЕКТЕП → ҮЙ" },
    { title: "Андан соң — ата-эненин чечими", note: "Төлөм — сыноодон кийин" },
  ],
  form: {
    title: "Арыз",
    fields: [
      ["Маршрут", "Үй → Мектеп → Үй"],
      ["Сабак бүтөт", "15:00"],
    ],
    status: "Сапар азырынча тастыктала элек",
    send: "Арыз калтыруу",
  },
  reply: { to: "Уулума", text: "Балам, бүгүн өзүм алып кетем." },
  cta: {
    brand: "BalaGo",
    city: "Бишкек • Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    link: "Профилдеги шилтемеге өтүңүз",
    or: "же WhatsApp аркылуу жазыңыз",
    whatsapp: "WhatsApp: 0998 08 38 28",
  },
} as const;
