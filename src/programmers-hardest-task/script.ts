// Фильм №35 «Программисттин эң татаал тапшырмасы» («Самая трудная задача
// программиста», композиция BalaGo35ProgrammersHardestTask).
//
// Папа-программист делает семейное приложение: оно исправно показывает
// поездки, напоминает о них и отражает изменения. Но поездки всё равно
// занимают время — родители выходят из офиса, работа остаётся на вечер.
// Сын спрашивает: «Ата, бул колдонмо өзү барып, мени алып келе алабы?»
// Мама предлагает найти помощь с дорогой; родители оставляют
// ПРЕДВАРИТЕЛЬНУЮ заявку BalaGo, чтобы обсудить регулярный маршрут.
// Маршрут не согласован, поездка не состоялась; задача в списке открыта.
//
// Единый источник: реплики (текст субтитров и TTS), голоса, порядок сцен,
// паузы монтажа, экранные надписи. Длительности сцен НЕ задаются вручную:
// их считает планировщик (timing.ts) по фактическим файлам озвучки.
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const PHT_VIDEO = {
  id: "BalaGo35ProgrammersHardestTask",
  output: "balago-35-programmers-hardest-task",
  title: "Программисттин эң татаал тапшырмасы",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/programmers-hardest-task",
} as const;

// ---------- Голоса ----------
export type PhtRole = "narrator" | "father" | "mother" | "son";

export const PHT_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 351,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

// Сохранённые кыргызские голоса проекта (ElevenLabs Voice Design,
// носители языка); новые голоса не создаются. Выбор — по пробам
// voice-samples/programmers-hardest-task/ (report.json: распознавание Meta
// MMS и основной тон; это технический замер, не прослушивание):
//   narrator — KG-boss (№10): спокойный размеренный мужской голос ~50 лет,
//              VO01 — CER 1,7 %, F0 ≈ 120 Гц; ясно отличается от папы;
//   father   — KG-husband: голос папы этой семьи в серии (№12, №25, №27,
//              №33), F0 ≈ 110 Гц. Короткие реплики у него бывают смазаны
//              (проба VO13 — CER 36 %), поэтому больше дублей и выбор
//              лучшего по MMS;
//   mother   — KG-mother: VO14 1,6 %, VO24 5 %, F0 ≈ 210–220 Гц;
//   son      — KG-boy a2-3 (№22, №24): VO22 — 4,3 %, F0 ≈ 276 Гц; в прошлых
//              слепых прослушиваниях звучал как мальчик. Детских голосов
//              Voice Design не создаёт; тон и темп не меняются.
// takes — сколько дублей синтезировать для новой реплики.
export const PHT_VOICES: Record<PhtRole, { readonly name: string; readonly voiceId: string; readonly takes: number }> = {
  narrator: { name: "KG-boss", voiceId: "yCcjraKUNFsfIv02eS9D", takes: 3 },
  father: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm", takes: 4 },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p", takes: 3 },
  son: { name: "KG-boy a2-3", voiceId: "8QMDSJuOqCscZvQ6PqlL", takes: 4 },
};
// Голоса подтверждены пробами — полная озвучка разрешена.
export const PHT_VOICES_CONFIRMED: boolean = true;

// ---------- Сцены ----------
// lead — от начала сцены до начала первой реплики (с), tail — от конца
// последней реплики до конца сцены, min — наименьшая длина сцены (действие
// без речи). Порядок массива = порядок монтажа.
export type PhtSceneId =
  | "hook"
  | "parents"
  | "demo"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "load"
  | "friday"
  | "question"
  | "nextStep"
  | "balago"
  | "request"
  | "task"
  | "game"
  | "cta";

export type PhtScene = {
  readonly id: PhtSceneId;
  readonly title: string;
  readonly lead: number;
  readonly tail: number;
  readonly min?: number;
};

export const PHT_SCENES: readonly PhtScene[] = [
  { id: "hook", title: "01. Хук: колдонмо даяр", lead: 0.7, tail: 0.35 },
  { id: "parents", title: "02. Ата-эне", lead: 0.3, tail: 0.35 },
  { id: "demo", title: "03. Жекшемби: көрсөтүү", lead: 0.35, tail: 0.8 },
  { id: "monday", title: "04. Дүйшөмбү", lead: 0.5, tail: 0.6 },
  { id: "tuesday", title: "05. Шейшемби", lead: 0.5, tail: 1.6 },
  { id: "wednesday", title: "06. Шаршемби", lead: 0.45, tail: 0.9 },
  { id: "thursday", title: "07. Бейшемби", lead: 0.45, tail: 0.7 },
  { id: "load", title: "08. Баары эсепте, жол калды", lead: 0.35, tail: 0.6 },
  { id: "friday", title: "09. Жума", lead: 0.5, tail: 1.3 },
  { id: "question", title: "10. Уулдун суроосу", lead: 0.25, tail: 0.6 },
  { id: "nextStep", title: "11. Апанын сунушу", lead: 1.1, tail: 0.6 },
  { id: "balago", title: "12. BalaGo барагы", lead: 0.35, tail: 0.4 },
  { id: "request", title: "13. Алдын ала өтүнмө", lead: 0.25, tail: 1.5 },
  { id: "task", title: "14. Тизмедеги иш", lead: 0.6, tail: 0.7 },
  { id: "game", title: "15. Сүрөт жана оюн", lead: 0.7, tail: 2.6 },
  { id: "cta", title: "16. BalaGo: финал", lead: 0.7, tail: 1.8 },
];

// ---------- Реплики ----------
export type PhtLine = {
  readonly id: string;
  readonly role: PhtRole;
  readonly scene: PhtSceneId;
  readonly text: string; // как в сценарии (субтитры, SRT, проверка)
  readonly spoken?: string; // что отправляется в TTS, если отличается
  // сколько слов озвучки приходится на каждое слово субтитра, если их число
  // разное (номер телефона: «0998» ↔ «нөл тогуз жүз токсон сегиз»)
  readonly spokenWords?: readonly number[];
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
  readonly takes?: number; // сколько дублей синтезировать (иначе — по роли)
  // Пауза перед репликой (с) от конца предыдущей реплики той же сцены.
  // Первая реплика сцены начинается через scene.lead.
  readonly gap?: number;
  // Слово субтитра, выделенное цветом (одно ключевое понятие).
  readonly accent?: string;
};

export const PHT_GAP = 0.4;

export const PHT_LINES: readonly PhtLine[] = [
  { id: "vo01", role: "narrator", scene: "hook", text: "Атасы үй-бүлө үчүн колдонмо жасады. Ал эч нерсени унутчу эмес.", accent: "колдонмо" },
  { id: "vo02", role: "narrator", scene: "hook", text: "Бирок бир жумадан кийин мектепке барып-келүү маселеси кайра талкууга түштү.", gap: 0.45 },
  { id: "vo03", role: "narrator", scene: "parents", text: "Атасы — программист. Апасы — долбоор жетекчиси. Экөө тең жумуш күнүн алдын ала пландашат." },
  { id: "vo04", role: "narrator", scene: "demo", text: "Жекшемби күнү атасы жаңы колдонмосун көрсөттү." },
  { id: "vo05", role: "father", scene: "demo", text: "Мында сени эртең менен ким жеткирери, сабактан кийин ким алып келери көрүнүп турат.", gap: 1.1, tag: "[warmly]" },
  { id: "vo06", role: "father", scene: "demo", text: "Эскертүүлөр экөөбүздүн тең телефонубузга келет.", gap: 0.55 },
  { id: "vo07", role: "father", scene: "demo", text: "Эми баары көз алдыбызда болот.", gap: 0.6, tag: "[pleased]" },
  { id: "vo08", role: "narrator", scene: "monday", text: "Дүйшөмбүдө колдонмо апасына өз убагында ачкычты эске салды." },
  { id: "vo09", role: "mother", scene: "monday", text: "Кеттикпи?", gap: 1.3, tag: "[warmly]", seed: 900, takes: 5 },
  { id: "vo10", role: "son", scene: "monday", text: "Кеттик!", gap: 0.3, tag: "[excited]" },
  { id: "vo11", role: "narrator", scene: "monday", text: "Апасы уулун мектептен алып, үйгө жеткирип, кеңсеге кайтып келди.", gap: 0.5 },
  { id: "vo12", role: "narrator", scene: "tuesday", text: "Шейшембиде атасынын жумуштагы талкуусу башка убакытка жылды." },
  { id: "vo13", role: "father", scene: "tuesday", text: "Бүгүн сен алып келе аласыңбы?", gap: 1.0, tag: "[gently]", seed: 910, takes: 5 },
  { id: "vo14", role: "mother", scene: "tuesday", text: "Кесиптешим менен убакытты алмаштырсам, болот. Азыр тактап көрөйүн.", gap: 0.9, tag: "[calm]" },
  { id: "vo15", role: "narrator", scene: "wednesday", text: "Шаршембиде мектептеги сабактардын убактысы өзгөрдү." },
  { id: "vo16", role: "narrator", scene: "thursday", text: "Бейшембиде апасына шашылыш жолугушуу чыкты.", seed: 920, takes: 5 },
  { id: "vo17", role: "narrator", scene: "load", text: "Колдонмо бардык өзгөрүүлөрдү так көрсөтүп турду." },
  { id: "vo18", role: "narrator", scene: "load", text: "Ата-эне да өз убагында сүйлөшүп жатты.", gap: 0.5 },
  { id: "vo19", role: "narrator", scene: "load", text: "Бирок баланы алып келүү үчүн кеңседен баары бир чыгыш керек эле.", gap: 0.55 },
  { id: "vo20", role: "narrator", scene: "load", text: "Ал эми бүтпөгөн иштер кечке калып жатты.", gap: 0.55 },
  { id: "vo21", role: "narrator", scene: "friday", text: "Жума күнү атасы календарды карап, дагы эмнени жакшыртсам деп ойлонду." },
  { id: "vo22", role: "son", scene: "question", text: "Ата, бул колдонмо өзү барып, мени алып келе алабы?", tag: "[curious]", accent: "өзү барып" },
  { id: "vo23", role: "father", scene: "question", text: "Азырынча муну кыла албайт.", spoken: "Азырынча... муну кыла албайт.", gap: 1.0, tag: "[amused]", seed: 930, takes: 5 },
  { id: "vo24", role: "mother", scene: "nextStep", text: "Күн тартибин түзүү жеңилдеди. Эми барып-келүүгө жардам табалы.", tag: "[warmly]" },
  { id: "vo25", role: "narrator", scene: "balago", text: "Алар чогуу варианттарды карап, BalaGo барагын ачышты.", spoken: "Алар чогуу варианттарды карап, Балаго барагын ачышты." },
  { id: "vo26", role: "narrator", scene: "request", text: "Мектепти, даректи жана убакытты көрсөтүп, туруктуу каттамды талкуулоо үчүн алдын ала өтүнмө калтырышты." },
  { id: "vo27", role: "father", scene: "task", text: "Мектепке барып-келүүнү тактоо.", tag: "[quietly]" },
  { id: "vo28", role: "son", scene: "game", text: "Бул сенин колдонмоң үчүн.", tag: "[proudly]" },
  { id: "vo29", role: "mother", scene: "game", text: "Тааныштыруу бүттүбү?", gap: 1.1, tag: "[playfully]" },
  { id: "vo30", role: "son", scene: "game", text: "Эми ойносок болот.", gap: 0.35, tag: "[excited]" },
  { id: "vo31", role: "narrator", scene: "game", text: "Атасы ноутбугун жаап, үстөл оюнун алып чыкты.", gap: 0.45 },
  { id: "vo32", role: "narrator", scene: "cta", text: "BalaGo — Бишкектеги мектеп окуучулары үчүн жол жүрүү кызматы.", spoken: "Балаго — Бишкектеги мектеп окуучулары үчүн жол жүрүү кызматы.", accent: "BalaGo" },
  { id: "vo33", role: "narrator", scene: "cta", text: "Үйдөн мектепке, мектептен үйгө.", gap: 0.4 },
  { id: "vo34", role: "narrator", scene: "cta", text: "Каттамды талкуулоо үчүн алдын ала өтүнмө калтырыңыз.", gap: 0.45 },
  { id: "vo35", role: "narrator", scene: "cta", text: "BalaGo менен жолго чыгалы!", spoken: "Балаго менен жолго чыгалы!", gap: 0.5, tag: "[warmly]" },
  // По просьбе заказчика в самом конце — ссылка в профиле и WhatsApp с номером
  // (прежняя «Шилтеме профилдин башында» вошла в эту фразу). Номер в озвучке
  // словами, как диктуют номера в Бишкеке; WhatsApp звучит «Ватсап».
  {
    id: "vo36",
    role: "narrator",
    scene: "cta",
    text: "Профилдин башындагы шилтемеге өтүңүз же WhatsApp аркылуу жазыңыз: 0998 08 38 28.",
    spoken: "Профилдин башындагы шилтемеге өтүңүз же Ватсап аркылуу жазыңыз: нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз.",
    spokenWords: [1, 1, 1, 1, 1, 1, 1, 1, 5, 2, 2, 2],
    accent: "0998 08 38 28",
    gap: 0.6,
    seed: 950,
    takes: 6,
  },
];

export const lineById = (id: string) => {
  const l = PHT_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Данные расписания (одни и те же во всех кадрах) ----------
// Утром папа везёт сына к 07:40; после уроков забирают в 13:20.
// В среду уроки заканчиваются позже — 14:10 (одно и то же в сообщении
// школы и в календаре).
export const PHT_TIME = {
  morning: "07:40",
  pickup: "13:20",
  wednesdayPickup: "14:10",
  dadMeetingFrom: "11:00", // вторник: встреча папы была в 11:00…
  dadMeetingTo: "13:00", // …и перенесена на 13:00 (пересекается с 13:20)
  momMeeting: "13:00", // вторник: встреча мамы, которую она переносит
  momMeetingNew: "15:00",
  urgent: "13:00", // четверг: шашылыш жолугушуу
} as const;

// Кто забирает после уроков (до изменений недели).
export const PHT_WEEK = [
  { id: "mon", short: "Дш", label: "ДҮЙШӨМБҮ", pickupBy: "Апа" },
  { id: "tue", short: "Шш", label: "ШЕЙШЕМБИ", pickupBy: "Ата" },
  { id: "wed", short: "Шр", label: "ШАРШЕМБИ", pickupBy: "Ата" },
  { id: "thu", short: "Бш", label: "БЕЙШЕМБИ", pickupBy: "Апа" },
  { id: "fri", short: "Жм", label: "ЖУМА", pickupBy: "Апа" },
] as const;

// ---------- Экранные надписи (кыргызча) ----------
export const PHT_TEXT = {
  hookTitle: "Колдонмо даяр. Маселе калды.",
  roles: { father: "Программист", mother: "Долбоор жетекчиси" },
  sunday: "ЖЕКШЕМБИ",
  app: {
    title: "Үй-бүлөнүн күн тартиби",
    toSchool: "Мектепке жеткирүү",
    fromSchool: "Мектептен алып келүү",
    dad: "Ата",
    mom: "Апа",
    keys: "Ачкычты алууну унутпа",
    updated: "Убакыт жаңыртылды",
    saved: "Өзгөртүү сакталды",
    meeting: "Жолугушуу",
    tomorrow: "Эртең",
    today: "Бүгүн",
    reminder: "Эскертүү",
  },
  work: {
    file: "family-schedule.ts",
    report: "Апталык отчёт",
    reportLine: "3-бөлүм: жыйынтыктар",
    project: "Долбоор: жаңы кызмат",
    calendar: "Календарь",
    colleagueAsk: "Жолугушууну 15:00гө жылдырсак болобу?",
    colleagueOk: "Макул",
    colleague: "Кесиптеш",
  },
  school: {
    from: "Мектеп",
    title: "Сабактын убактысы өзгөрдү",
  },
  urgent: "Шашылыш жолугушуу",
  accents: { exact: "Күн тартиби так", road: "Жолго убакыт керек" },
  page: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    lead: "Мектеп окуучулары үчүн жол жүрүү кызматы",
  },
  form: {
    title: "Алдын ала өтүнмө",
    fields: ["Мектеп", "Дарек", "Убакыт"],
    time: "07:40 · 13:20",
    send: "Алдын ала өтүнмө",
    sent: "Өтүнмө жөнөтүлдү",
    next: "Каттамды талкуулайбыз",
  },
  tasks: {
    title: "Үй-бүлөнүн иштери",
    item: "Мектепке барып-келүүнү тактоо",
  },
  game: "Оюн",
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "БИШКЕК",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    button: "Баланы каттоо",
    link: "Шилтеме профилдин башында",
    // контакт в самом конце — по просьбе заказчика
    whatsapp: "WhatsApp",
    phone: "0998 08 38 28",
  },
} as const;
