// BalaGo-50, выпуск №42 / BG-042 «Кеңседен шашылыш кабар»
// (композиция BalaGoBG042, 2D, 1080×1920, 30 fps).
//
// Юмористический «телевыпуск» офисных новостей: студия в кружке-подставке
// для ручек → мини-репортёр в мониторе берёт интервью у настоящей мамы →
// мама сама закрывает шуточные новости и ищет решение → студийная графика
// правил BalaGo → условный пример «если группа сложится» → мама выключает
// «телевизор» и возвращается к своей заявке → фирменный финал.
// Сценарий: campaigns/balago-50/episodes/42-BG-042.md (утверждён 15.10.2026,
// APPROVAL-36-50.md).
//
// Единственный источник речи ролика — BG42_LINES (реплики сценария дословно).
// text — как пишется (титры, проверки); spoken — как произносит синтез
// (BalaGo → БалаГо, WhatsApp → вотсап, «;» → «,»). Файл без зависимостей от
// Remotion: его читают Node-скрипты озвучки и тесты.

export const BG42_VIDEO = {
  id: "BalaGoBG042",
  output: "balago-bg-042-ep42",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/campaign50/bg-042",
  sfxDir: "audio/campaign50/bg-042/sfx",
} as const;

export type Bg42SceneId = "hook" | "interview" | "search" | "rules" | "trial" | "cta";

// Сцены идут подряд; длительность сцены = max(min, конец речи сцены + tail).
// Речь не ускоряется: картинка подстраивается под фактические файлы озвучки.
export const BG42_SCENES: readonly {
  readonly id: Bg42SceneId;
  readonly title: string;
  readonly min: number; // с
  readonly tail: number; // с после конца речи сцены
}[] = [
  { id: "hook", title: "1. Студия в кружке: «Шашылыш кабар!»", min: 5.8, tail: 0.9 },
  { id: "interview", title: "2. Мини-репортёр в мониторе и мама", min: 8, tail: 0.9 },
  { id: "search", title: "3. Мама закрывает новости и сама ищет", min: 11.5, tail: 3.9 },
  { id: "rules", title: "4. Студийная графика: сначала данные и поиск группы", min: 9.5, tail: 1.1 },
  { id: "trial", title: "5. Шарттуу мисал: если группа сложится → «телевизор» выключен", min: 11.5, tail: 1.7 },
  { id: "cta", title: "6. Финал: Бишкек, ссылка в профиле, WhatsApp", min: 12, tail: 3.6 },
];

export type Bg42Role = "anchor" | "reporter" | "mother" | "narrator";

// Подпись говорящего в титрах (как в сценарии).
export const BG42_ROLE_LABEL: Record<Bg42Role, string> = {
  anchor: "Алып баруучу",
  reporter: "Кабарчы",
  mother: "Апа",
  narrator: "Диктор",
};

// Настройки синтеза — те же, что у общего модуля scripts/lib/ts2d-tts.mjs
// (TS2_TTS): ElevenLabs eleven_v3, кыргызский, без ускорения и смены тона.
export const BG42_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Готовые кыргызские голоса проекта (ElevenLabs Voice Design); новые голоса
// не создаются. Замеры MMS — voice-samples/meeting-1320/probe/report.json
// (ветка ролика №31) и манифесты 2D-роликов №10–12.
//   anchor   — KG-boss: взрослый мужской, ≈138 Гц, CER 2,1 % (лучший мужской);
//   reporter — NB2-brother: молодой мужской, ≈122 Гц, CER 5,8 %, тембр иной;
//   mother   — KG-mother: тёплый мягкий женский, CER 1,8 %;
//   narrator — KG-teacher: спокойный доброжелательный женский голос финалов.
export const BG42_VOICES: Record<Bg42Role, { readonly name: string; readonly voiceId: string }> = {
  anchor: { name: "KG-boss", voiceId: "yCcjraKUNFsfIv02eS9D" },
  reporter: { name: "NB2-brother", voiceId: "IRGPSiyjpLdMfh3zNzFo" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p" },
  narrator: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy" },
};

export type Bg42Line = {
  readonly id: string;
  readonly role: Bg42Role;
  readonly scene: Bg42SceneId;
  readonly text: string; // как написано (титры)
  readonly spoken?: string; // как произносится (TTS), если отличается
  // Начало речи: через lead с от начала сцены (первая реплика сцены)
  // или через gap с после конца предыдущей реплики той же сцены.
  readonly lead?: number;
  readonly gap?: number;
  readonly tag?: string; // аудиотег интонации eleven_v3 (не звучит)
  readonly seed: number;
  // Титры: короткие фразы текста и номер слова произношения (spoken),
  // с которого фраза появляется.
  readonly chunks: readonly { readonly text: string; readonly w: number }[];
};

export const BG42_LINES: readonly Bg42Line[] = [
  {
    id: "a1",
    role: "anchor",
    scene: "hook",
    lead: 0.75,
    tag: "[excited]",
    seed: 4201,
    text: "Шашылыш кабар! Кеңседе мектепке жеткирүү маселеси кайра көтөрүлдү!",
    chunks: [
      { text: "Шашылыш кабар!", w: 0 },
      { text: "Кеңседе мектепке жеткирүү маселеси", w: 2 },
      { text: "кайра көтөрүлдү!", w: 6 },
    ],
  },
  {
    id: "r1",
    role: "reporter",
    scene: "interview",
    lead: 1.15,
    tag: "[curious]",
    seed: 4202,
    text: "Эң кыйын учур качан?",
    chunks: [{ text: "Эң кыйын учур качан?", w: 0 }],
  },
  {
    id: "m1",
    role: "mother",
    scene: "interview",
    gap: 0.45,
    seed: 4203,
    text: "Жыйын бүтө электе баламды мектептен алып кетчү убакыт келгенде.",
    chunks: [
      { text: "Жыйын бүтө электе", w: 0 },
      { text: "баламды мектептен алып кетчү", w: 3 },
      { text: "убакыт келгенде.", w: 7 },
    ],
  },
  {
    id: "r2",
    role: "reporter",
    scene: "search",
    lead: 0.6,
    tag: "[curious]",
    seed: 4204,
    text: "Анда кандай жолду караштырасыз?",
    chunks: [{ text: "Анда кандай жолду караштырасыз?", w: 0 }],
  },
  {
    id: "m2",
    role: "mother",
    scene: "search",
    gap: 0.45,
    seed: 4205,
    text: "Күн сайын кайталанган каттамды алдын ала уюштуруунун жолун издеп көрөйүн.",
    chunks: [
      { text: "Күн сайын кайталанган каттамды", w: 0 },
      { text: "алдын ала уюштуруунун", w: 4 },
      { text: "жолун издеп көрөйүн.", w: 7 },
    ],
  },
  {
    id: "a2",
    role: "anchor",
    scene: "rules",
    lead: 0.9,
    seed: 4206,
    text: "BalaGo'до алгач дарек, мектеп жана убакыт көрсөтүлөт.",
    spoken: "БалаГодо алгач дарек, мектеп жана убакыт көрсөтүлөт.",
    chunks: [
      { text: "BalaGo'до алгач", w: 0 },
      { text: "дарек, мектеп жана убакыт", w: 2 },
      { text: "көрсөтүлөт.", w: 6 },
    ],
  },
  {
    id: "a3",
    role: "anchor",
    scene: "rules",
    gap: 0.35,
    seed: 4207,
    text: "Анан ылайыктуу топ изделет; дароо баштоо убада кылынбайт.",
    spoken: "Анан ылайыктуу топ изделет, дароо баштоо убада кылынбайт.",
    chunks: [
      { text: "Анан ылайыктуу топ изделет;", w: 0 },
      { text: "дароо баштоо убада кылынбайт.", w: 4 },
    ],
  },
  {
    id: "n1",
    role: "narrator",
    scene: "trial",
    lead: 0.6,
    seed: 4208,
    text: "Топ түзүлсө, биринчи толук сыноо сапары акысыз болот. Улантууну ата-эне өзү чечет.",
    chunks: [
      { text: "Топ түзүлсө,", w: 0 },
      { text: "биринчи толук сыноо сапары", w: 2 },
      { text: "акысыз болот.", w: 6 },
      { text: "Улантууну ата-эне өзү чечет.", w: 8 },
    ],
  },
  {
    id: "n2",
    role: "narrator",
    scene: "trial",
    gap: 0.5,
    seed: 4209,
    text: "Бул тамаша жаңылык болсо да, шарттары чыныгы.",
    chunks: [
      { text: "Бул тамаша жаңылык болсо да,", w: 0 },
      { text: "шарттары чыныгы.", w: 5 },
    ],
  },
  {
    id: "c1",
    role: "narrator",
    scene: "cta",
    lead: 0.9,
    seed: 4210,
    text: "BalaGo — Бишкектеги балдар үчүн такси.",
    spoken: "БалаГо — Бишкектеги балдар үчүн такси.",
    chunks: [
      { text: "BalaGo — Бишкектеги", w: 0 },
      { text: "балдар үчүн такси.", w: 2 },
    ],
  },
  {
    id: "c2",
    role: "narrator",
    scene: "cta",
    gap: 0.4,
    seed: 4211,
    text: "Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз.",
    spoken: "Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге вотсап аркылуу жазыңыз.",
    chunks: [
      { text: "Балаңызды алдын ала каттоо үчүн", w: 0 },
      { text: "профилдеги шилтемеге өтүңүз", w: 5 },
      { text: "же экрандагы номерге", w: 8 },
      { text: "WhatsApp аркылуу жазыңыз.", w: 11 },
    ],
  },
  {
    id: "c3",
    role: "narrator",
    scene: "cta",
    gap: 0.4,
    seed: 4212,
    text: "BalaGo менен жолго чыгалы!",
    spoken: "БалаГо менен жолго чыгалы!",
    chunks: [{ text: "BalaGo менен жолго чыгалы!", w: 0 }],
  },
];

export const spokenOf = (l: Bg42Line) => l.spoken ?? l.text;
/** Слова произношения — так же, как их считает scripts/lib/ts2d-tts.mjs. */
export const spokenWords = (l: Bg42Line) => spokenOf(l).split(/\s+/).filter((x) => [...x].some((ch) => /[\p{L}\p{N}]/u.test(ch)));

// Надписи в кадре (только кыргызский; BalaGo/WhatsApp — торговые имена).
export const BG42_TEXT = {
  channel: "КЕҢСЕ ЖАҢЫЛЫГЫ",
  breaking: "ШАШЫЛЫШ КАБАР",
  jokePlate: "Ойдон чыгарылган тамаша",
  jokeShort: "Тамаша, ойдон чыгарылган",
  lowerHook: "Ойдон чыгарылган кеңсе жаңылыгы",
  interview: "Жумуштагы үзүлүш",
  search: "Ата-эне өзү издейт",
  query: "Бишкекте мектепке жеткирүү",
  rules: "Алгач: маалымат жана топ издөө",
  noGuarantee: "Топ табылышы кепил эмес",
  searchUpTo: "Издөө — 2 жумага чейин",
  ifGroup: "Эгер топ түзүлсө",
  conditional: "Шарттуу мисал",
  decision: "Сыноодон кийин чечим",
  address: "Дарек",
  school: "Мектеп",
  time: "Убакыт",
  home: "ҮЙ",
  schoolCaps: "МЕКТЕП",
  morning: "Эртең менен",
  afterSchool: "Сабактан кийин",
  trialFree: "1-толук сыноо сапары — акысыз",
  continue: "Улантуу — ата-эненин чечими",
  meeting: "Жыйын",
  siteTagline: "Балдар үчүн такси • Бишкек",
  siteRoute: "үй → мектеп → үй",
  siteButton: "WhatsApp аркылуу жазуу",
} as const;

// Финальный экран (AGENTS.md / CLAUDE.md).
export const BG42_CTA = {
  city: "Бишкек • Балдар үчүн такси",
  link: "Профилдеги шилтемеге өтүңүз",
  or: "же WhatsApp аркылуу жазыңыз",
  phone: "WhatsApp: 0998 08 38 28",
  phoneDigits: "0998 08 38 28",
  go: "BalaGo менен жолго чыгалы!",
  minVisibleSec: 5,
  minAfterVoiceSec: 3,
} as const;
