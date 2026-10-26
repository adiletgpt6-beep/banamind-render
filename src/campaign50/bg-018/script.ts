// BalaGo-50, выпуск №19 / BG-018 «Семейный чат» (композиция BalaGoBG018).
//
// Хук: в семейном чате три раза, в разные дни, один и тот же вопрос
// «Бүгүн ким алып кетет?». Родители каждый день согласовывают школьные
// поездки: мама спрашивает голосовым, папа на встрече отвечает «уточню».
// Мама листает чат на неделю назад, видит, что вопрос не разовый, и сама
// отправляет в семейный чат ссылку на описание маршрута BalaGo. Папа
// открывает её — и только тогда появляется бренд: полный маршрут
// ҮЙ → МЕКТЕП → ҮЙ, подбор группы, бесплатная полная пробная поездка,
// сообщения водителя в WhatsApp-группе (пишет сам, не автоматика). Финал:
// чат складывается в карточку контактов (Бишкек, ссылка в профиле, WhatsApp).
//
// Чат и сообщения — художественные (вымышленная семья), не действующий бот.
// Источник речи: все кыргызские реплики — здесь (text — титры, spoken —
// произношение для синтеза). Файл без зависимостей от Remotion: его читают
// Node-скрипты озвучки и тесты.
import { TS2_VOICES } from "../../two-schedules-2d/script.ts";

export const BG18_VIDEO = {
  id: "BalaGoBG018",
  output: "balago-bg-018",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-018",
} as const;

export type Bg18Role = "mother" | "father" | "narrator";

export type Bg18SceneId = "hook" | "chat" | "scroll" | "link" | "steps" | "cta";

export type Bg18Line = {
  readonly id: string;
  readonly scene: Bg18SceneId;
  readonly role: Bg18Role;
  readonly text: string; // титры (как в сценарии)
  readonly spoken?: string; // произношение для синтеза, если отличается
  readonly gap?: number; // пауза перед репликой (с), по умолчанию 0,45
  readonly tag?: string; // аудиотег интонации eleven_v3 (не звучит)
  readonly seed?: number;
};

// Реплики сценария campaigns/balago-50/episodes/19-BG-018.md. Длинные
// реплики диктора разделены по предложениям (текст не изменён) — так шаги
// инфографики появляются точно на своих словах.
export const BG18_LINES: readonly Bg18Line[] = [
  { id: "n01", scene: "hook", role: "narrator", text: "Үй-бүлөлүк чатта эң көп кайталанган суроо кайсы?" },
  { id: "m01", scene: "chat", role: "mother", text: "Бүгүн мектептен сиз алып келесизби?" },
  { id: "f01", scene: "chat", role: "father", text: "Жолугушуум бар. Бир аздан кийин тактайын.", gap: 0.7 },
  { id: "n02a", scene: "scroll", role: "narrator", text: "Жооп күн сайын өзгөрөт, бирок суроо өзгөрбөйт." },
  { id: "n02b", scene: "scroll", role: "narrator", text: "Баланын мектепке каттамын алдын ала пландаса болбойбу?", gap: 0.6 },
  { id: "f02", scene: "link", role: "father", text: "Көрөлү, бул кызмат кандай иштейт экен." },
  {
    id: "n03",
    scene: "link",
    role: "narrator",
    text: "BalaGo — Бишкектеги балдар үчүн алдын ала уюштурулган мектепке каттам.",
    spoken: "БалаГо — Бишкектеги балдар үчүн алдын ала уюштурулган мектепке каттам.",
    gap: 0.9,
  },
  { id: "n04a", scene: "steps", role: "narrator", text: "Адегенде ылайыктуу топ түзүлөт." },
  { id: "n04b", scene: "steps", role: "narrator", text: "Биринчи толук сыноо сапары акысыз.", gap: 0.9 },
  {
    id: "n04c",
    scene: "steps",
    role: "narrator",
    text: "Ата-энелерге маалымат WhatsApp тобунда берилет.",
    spoken: "Ата-энелерге маалымат вотсап тобунда берилет.",
    gap: 0.9,
  },
  {
    id: "c01",
    scene: "cta",
    role: "narrator",
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
  },
  {
    id: "c02",
    scene: "cta",
    role: "narrator",
    text: "Каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.",
    spoken: "Каттоо үчүн профилдеги шилтемеге өтүңүз, же вотсап аркылуу нөл, тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз номерине жазыңыз.",
    gap: 0.4,
  },
  {
    id: "c03",
    scene: "cta",
    role: "narrator",
    text: "BalaGo менен жолго чыгалы!",
    spoken: "БалаГо менен жолго чыгалы!",
    gap: 0.5,
  },
];

// Сцены: длительность — по фактической озвучке (лид до первой реплики,
// хвост после последней), не меньше min. Речь не ускоряется.
export const BG18_SCENES: readonly {
  readonly id: Bg18SceneId;
  readonly title: string;
  readonly lead: number;
  readonly tail: number;
  readonly min: number;
}[] = [
  { id: "hook", title: "1. Хук: один вопрос три раза", lead: 2.3, tail: 0.9, min: 6.5 },
  { id: "chat", title: "2. Папа на работе, мама между звонками, сын собирается", lead: 1.4, tail: 1.6, min: 11 },
  { id: "scroll", title: "3. Неделя назад: вопрос не разовый", lead: 2.6, tail: 1.0, min: 11 },
  { id: "link", title: "4. Мама отправляет ссылку, папа открывает", lead: 3.6, tail: 1.2, min: 12.5 },
  { id: "steps", title: "5. Как работает: группа, пробная поездка, WhatsApp", lead: 0.8, tail: 1.6, min: 11 },
  // контакты видны с начала сцены; после последнего слова — ≥ 3 с
  { id: "cta", title: "6. Финал: контакты", lead: 1.2, tail: 3.6, min: 9 },
];

// Контакты финала (AGENTS.md / CLAUDE.md).
export const BG18_CONTACTS = {
  city: "Бишкек • Балдар үчүн такси",
  profile: "Профилдеги шилтемеге өтүңүз",
  or: "же WhatsApp аркылуу жазыңыз",
  phone: "0998 08 38 28",
  slogan: "BalaGo менен жолго чыгалы!",
} as const;

// Синтез: ElevenLabs eleven_v3 с кыргызским языком (как в 2D-роликах).
export const BG18_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 1918,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Голоса — готовые кыргызские голоса проекта (новые не создаются).
export const BG18_VOICES: Record<Bg18Role, { readonly name: string; readonly voiceId: string }> = {
  mother: TS2_VOICES.mother,
  father: TS2_VOICES.father,
  narrator: TS2_VOICES.narrator,
};
