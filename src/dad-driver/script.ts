// BalaGo №32 — «Атам — айдоочу» («Папа — водитель»), композиция
// BalaGo32DadDriver. Вертикальная 2D-история ≈ 2–2,5 мин.
//
// Сын написал в анкете «Атам — айдоочу»: чаще всего он видит папу за
// рулём. Папа-инженер принимает ответ с теплом, показывает макет, чертежи
// и офис. Родители смотрят расписание следующей недели и оставляют
// ПРЕДВАРИТЕЛЬНУЮ заявку BalaGo, чтобы обсудить маршрут и время. Сын
// дописывает в анкету «инженер» и ещё одно предложение о папе.
//
// Без цен, гарантий, лицензий, статистики, подтверждённых поездок BalaGo.
//
// Длина ролика не задаётся заранее: монтаж строится по фактическим
// длительностям реплик (timing.ts) — сцена длится от своего начала до
// конца последней реплики плюс выдержка.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const DD_VIDEO = {
  id: "BalaGo32DadDriver",
  output: "balago-32-dad-driver",
  width: 1080,
  height: 1920,
  fps: 30,
  voiceDir: "audio/dad-driver",
  // ориентир длины (с): история серии ≈ 2 мин; до 155 с, если этого
  // требуют естественная речь и паузы
  targetMin: 128,
  targetMax: 155,
} as const;

// ---------- Сцены ----------
export type DdSceneId =
  | "hook"
  | "task"
  | "ask"
  | "why"
  | "reply"
  | "model"
  | "blueprint"
  | "office"
  | "question"
  | "week"
  | "apply"
  | "rewrite"
  | "read"
  | "cta";

// Переход в сцену (длится trans кадров ДО начала сцены, поверх прошлой):
//   cut   — склейка; push — сдвиг кадра в сторону dir; zoom — наезд в
//   точку (ox, oy) с растворением; iris — круг раскрывается из точки;
//   fade — мягкое растворение (эмоциональные переходы).
export type DdTransition =
  | { readonly kind: "cut" }
  | { readonly kind: "push"; readonly dir: "left" | "right" | "up" | "down"; readonly frames: number }
  | { readonly kind: "zoom"; readonly ox: number; readonly oy: number; readonly frames: number }
  | { readonly kind: "iris"; readonly ox: number; readonly oy: number; readonly frames: number }
  | { readonly kind: "fade"; readonly frames: number };

export type DdScene = {
  readonly id: DdSceneId;
  readonly title: string;
  // выдержка после последней реплики сцены (с)
  readonly tail: number;
  // минимальная длина сцены (с) — для действий без речи
  readonly minSec?: number;
  readonly enter: DdTransition;
};

export const DD_SCENES: readonly DdScene[] = [
  { id: "hook", title: "1. Анкета", tail: 0.8, enter: { kind: "cut" } },
  { id: "task", title: "2. Тапшырма", tail: 2.6, enter: { kind: "push", dir: "left", frames: 9 } },
  { id: "ask", title: "3. Атасынын суроосу", tail: 0.25, enter: { kind: "cut" } },
  { id: "why", title: "4. Эмне үчүн айдоочу", tail: 0.6, enter: { kind: "zoom", ox: 540, oy: 1000, frames: 9 } },
  { id: "reply", title: "5. Жылуу жооп", tail: 1.6, enter: { kind: "fade", frames: 10 } },
  { id: "model", title: "6. Макет", tail: 0.6, enter: { kind: "cut" } },
  { id: "blueprint", title: "7. Чийме → макет → жабдуу", tail: 1.6, enter: { kind: "zoom", ox: 560, oy: 1040, frames: 9 } },
  { id: "office", title: "8. Кеңседе", tail: 0.8, enter: { kind: "push", dir: "left", frames: 10 } },
  { id: "question", title: "9. Уулунун суроосу", tail: 1.3, enter: { kind: "cut" } },
  { id: "week", title: "10. Кийинки жума", tail: 0.8, enter: { kind: "fade", frames: 10 } },
  { id: "apply", title: "11. BalaGo: алдын ала өтүнмө", tail: 1.4, enter: { kind: "push", dir: "up", frames: 9 } },
  { id: "rewrite", title: "12. Жаңы сап", tail: 0.8, enter: { kind: "push", dir: "right", frames: 9 } },
  { id: "read", title: "13. Атасы окуду", tail: 2.0, enter: { kind: "cut" } },
  // финальный кадр держится ≥ 1,3 с после последнего слова
  { id: "cta", title: "14. BalaGo", tail: 2.6, enter: { kind: "iris", ox: 540, oy: 1060, frames: 10 } },
];

// ---------- Голоса ----------
export type DdRole = "narrator" | "father" | "son";

export const DD_TTS = {
  modelId: "eleven_v3",
  languageCode: "ky",
  seed: 3201,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
} as const;

type Voice = { readonly name: string; readonly voiceId: string; readonly note: string };

// Готовые кыргызские голоса проекта (ElevenLabs Voice Design, проверены в
// роликах серии: src/two-schedules-2d/script.ts, TS2_VOICES). Новые
// голоса не создаются; тон и темп механически не меняются.
export const DD_VOICE_POOL = {
  husband: { name: "KG-husband", voiceId: "NVEGeFqcDqc5o29VoAQm", note: "спокойный доброжелательный мужской, ≈110 Гц" },
  son: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM", note: "самый светлый и звонкий голос проекта, ≈280 Гц" },
  teacher: { name: "KG-teacher", voiceId: "EBOfpUWl9G5ltD2PkFgy", note: "спокойный тёплый женский" },
  mother: { name: "KG-mother", voiceId: "5Xx0r0RX4XWEq5vEdv8p", note: "тёплый мягкий женский" },
} as const satisfies Record<string, Voice>;

// Голос роли (один на весь ролик). Рассказчик выбран по пробам
// (voice-samples/dad-driver/report.json): KG-mother распознаётся MMS без
// ошибок на «ата-энесинин кесиби», «чиймелерин» и почти без ошибок на
// финале (CER 0,012), KG-teacher — хуже («чеймелерин», «жолбочыкалы»).
// У мамы в этом ролике нет реплик, поэтому голоса не путаются.
export const DD_VOICES: Record<DdRole, Voice> = {
  narrator: DD_VOICE_POOL.mother,
  father: DD_VOICE_POOL.husband,
  son: DD_VOICE_POOL.son,
};

// Этап озвучки: "samples" — только короткие пробы голосов
// (voice-samples/dad-driver/), "full" — все реплики ролика.
export const DD_VOICE_STAGE: "samples" | "full" = "full";

// ---------- Реплики ----------
export type DdLine = {
  readonly id: string;
  readonly vo: string; // номер по сценарию (VO01…VO19)
  readonly role: DdRole;
  readonly scene: DdSceneId;
  readonly text: string; // как в сценарии: субтитры и проверка
  readonly spoken?: string; // что отправляется в TTS, если отличается
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number;
  // темп подачи ElevenLabs (voice_settings.speed, 0,7…1,2) — только если
  // голос торопится; запись после синтеза не ускоряется и не замедляется
  readonly speed?: number;
  readonly takes?: number; // число дублей (по умолчанию 3)
  // Начала слов, которые распознавание обязано услышать в дубле (смысловые:
  // «балдар», а не «малдар»). Дубль без них не выбирается.
  readonly mustHear?: readonly string[];
  // пауза перед речью (с): от конца прошлой реплики, а у первой реплики
  // сцены — от начала сцены
  readonly pre: number;
};

export const DD_LINES: readonly DdLine[] = [
  {
    id: "vo01",
    vo: "VO01",
    role: "narrator",
    scene: "hook",
    pre: 0.55,
    text: "Уулу анкетага: «Атам — айдоочу», — деп жазды. Атасы болсо он жылдан бери инженер болуп иштейт.",
    spoken: "Уулу анкетага: «Атам — айдоочу» деп жазды. Атасы болсо он жылдан бери инженер болуп иштейт.",
  },
  {
    id: "vo02",
    vo: "VO02",
    role: "narrator",
    scene: "task",
    pre: 0.3,
    text: "Биринчи класстын окуучуларына ата-энесинин кесиби жөнүндө айтып келүү тапшырмасы берилген. Апасы уулунун жазгандарын текшерип жатып, атасын чакырды.",
  },
  { id: "vo03", vo: "VO03", role: "father", scene: "ask", pre: 0.45, text: "Эмне үчүн ушинтип жаздың? Айтып бересиңби?", tag: "[warmly]" },
  // Перечисление сына — четыре коротких фразы с дыханием между ними,
  // каждая совпадает со своим эпизодом графики.
  { id: "vo04a", vo: "VO04", role: "son", scene: "why", pre: 0.35, text: "Эртең менен мени мектепке жеткиресиң." },
  { id: "vo04b", vo: "VO04", role: "son", scene: "why", pre: 0.7, text: "Анан жумушка кетесиң." },
  { id: "vo04c", vo: "VO04", role: "son", scene: "why", pre: 0.75, text: "Сабак бүткөндө кайра келип, мени алып кетесиң." },
  { id: "vo04d", vo: "VO04", role: "son", scene: "why", pre: 0.75, text: "Апамдын машинасы оңдоодо болгондо, аны да жеткиресиң." },
  { id: "vo05", vo: "VO05", role: "father", scene: "reply", pre: 0.55, text: "Туура, сен мени көбүнчө рулда көрөсүң.", tag: "[warmly]" },
  { id: "vo06", vo: "VO06", role: "son", scene: "reply", pre: 0.7, text: "Сен машинаны жакшы айдайсың. Сени менен барган мага жагат." },
  { id: "vo07", vo: "VO07", role: "narrator", scene: "model", pre: 0.3, text: "Атасы уулунун ийнинен сылап, текчеден кичинекей макет алып келди." },
  // Дубли читались торопливо (17–18 букв/с), «эмне кыларымды» сливалось
  // (CER 0,11–0,17) — мягкая подача, более спокойный темп ElevenLabs.
  { id: "vo08", vo: "VO08", role: "father", scene: "model", pre: 1.2, text: "Жумушта эмне кыларымды көргүң келеби?", tag: "[gently]", seed: 3301, speed: 0.85, takes: 5 },
  {
    id: "vo09",
    vo: "VO09",
    role: "narrator",
    scene: "blueprint",
    pre: 0.4,
    text: "Алар макетти чогуу карашты. Атасы чиймелерин көрсөтүп, кагаздагы сүрөт кантип чыныгы жабдууга айланарын түшүндүрдү.",
  },
  {
    id: "vo10",
    vo: "VO10",
    role: "narrator",
    scene: "office",
    pre: 1.0,
    text: "Дем алыш күнү уулун кеңсесине алып барды. Иштеген жерин көрсөтүп, жаңы долбоорду чогуу даярдап жаткан кесиптеши менен тааныштырды.",
  },
  { id: "vo11", vo: "VO11", role: "son", scene: "question", pre: 1.0, text: "Мени мектептен алып кеткенден кийин, кайра ушул жакка келесиңби?" },
  { id: "vo12", vo: "VO12", role: "father", scene: "question", pre: 0.7, text: "Ооба, көбүнчө кайра келем." },
  {
    id: "vo13",
    vo: "VO13",
    role: "narrator",
    scene: "week",
    pre: 0.9,
    text: "Кечинде ата-энеси кийинки жуманын графигин карашты. Атасында узак жумуш талкуулары, апасында кардарлар менен жолугушуулар бар. Баланы үйдөн чоң энеси тосуп ала алат.",
  },
  {
    id: "vo14",
    vo: "VO14",
    role: "narrator",
    scene: "apply",
    pre: 0.4,
    text: "Алар мектепке барып-келүүгө жардам издей башташты. BalaGo тууралуу окуп, маршрут менен убакытты сүйлөшүү үчүн алдын ала өтүнмө калтырышты.",
    spoken: "Алар мектепке барып-келүүгө жардам издей башташты. Балаго тууралуу окуп, маршрут менен убакытты сүйлөшүү үчүн алдын ала өтүнмө калтырышты.",
  },
  { id: "vo15", vo: "VO15", role: "son", scene: "rewrite", pre: 1.1, text: "Апа, «инженер» деген сөздү жазганга жардам берчи.", spoken: "Апа, инженер деген сөздү жазганга жардам берчи." },
  { id: "vo16", vo: "VO16", role: "narrator", scene: "rewrite", pre: 2.4, text: "Анкетаны кайра толтуруп, дагы бир сүйлөм кошту." },
  // Сын читает свою запись — две строки листа, с паузой между ними.
  { id: "vo17a", vo: "VO17", role: "son", scene: "read", pre: 1.0, text: "Атам машинаны жакшы айдайт." },
  { id: "vo17b", vo: "VO17", role: "son", scene: "read", pre: 0.5, text: "Татаал нерселерди да түшүнүктүү айтып берет." },
  { id: "vo18", vo: "VO18", role: "narrator", scene: "read", pre: 0.75, text: "Атасы окуп, жылмайды." },
  {
    id: "vo19",
    vo: "VO19",
    role: "narrator",
    scene: "cta",
    pre: 0.5,
    // Призыв в конце — по просьбе заказчика (ссылка в шапке профиля или
    // WhatsApp); формулировка — как в его прежних роликах. Номер — на экране.
    text: "BalaGo — Бишкекте балдар үчүн такси. Үйдөн мектепке, мектептен үйгө. BalaGo менен жолго чыгалы! Профилдин башындагы шилтемеге өтүңүз же экрандагы номерге вотсаптан жазыңыз.",
    spoken: "Балаго — Бишкекте балдар үчүн такси. Үйдөн мектепке, мектептен үйгө. Балаго менен жолго чыгалы! Профилдин башындагы шилтемеге өтүңүз же экрандагы номерге вотсаптан жазыңыз.",
    tag: "[warmly]",
    // в дубле seed 3212 «балдар» распознано как «малдар», в 3423 «номерге» —
    // как «момирге»: дубль выбирается только с «балдар» и «ном…» (начала слов)
    seed: 3401,
    takes: 5,
    mustHear: ["балдар", "ном"],
  },
];

export const lineById = (id: string) => {
  const l = DD_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Пробы голосов (этап "samples") ----------
// Короткие отрывки из сценария: проверка до синтеза всего текста.
export const DD_SAMPLES: readonly { readonly id: string; readonly voice: keyof typeof DD_VOICE_POOL; readonly text: string; readonly spoken?: string; readonly tag?: string }[] = [
  { id: "a-father-vo03", voice: "husband", text: "Эмне үчүн ушинтип жаздың? Айтып бересиңби?", tag: "[warmly]" },
  { id: "b-son-vo04", voice: "son", text: "Эртең менен мени мектепке жеткиресиң. Анан жумушка кетесиң." },
  {
    id: "c-narrator-teacher",
    voice: "teacher",
    text: "Биринчи класстын окуучуларына ата-энесинин кесиби жөнүндө айтып келүү тапшырмасы берилген. Атасы чиймелерин көрсөтүп берди.",
  },
  {
    id: "c-narrator-mother",
    voice: "mother",
    text: "Биринчи класстын окуучуларына ата-энесинин кесиби жөнүндө айтып келүү тапшырмасы берилген. Атасы чиймелерин көрсөтүп берди.",
  },
  {
    id: "d-final-teacher",
    voice: "teacher",
    text: "BalaGo — Бишкекте балдар үчүн такси. Шилтеме профилдин башында. BalaGo менен жолго чыгалы!",
    spoken: "Балаго — Бишкекте балдар үчүн такси. Шилтеме профилдин башында. Балаго менен жолго чыгалы!",
    tag: "[warmly]",
  },
  {
    id: "d-final-mother",
    voice: "mother",
    text: "BalaGo — Бишкекте балдар үчүн такси. Шилтеме профилдин башында. BalaGo менен жолго чыгалы!",
    spoken: "Балаго — Бишкекте балдар үчүн такси. Шилтеме профилдин башында. Балаго менен жолго чыгалы!",
    tag: "[warmly]",
  },
];

// ---------- Экранные надписи (кыргызча) ----------
export const DD_TEXT = {
  form: {
    title: "АНКЕТА",
    klass: "1-класс",
    heading: "Ата-энемдин кесиби",
    momLabel: "Апамдын кесиби:",
    momValue: "кардарлар менен иштейт",
    dadLabel: "Атамдын кесиби:",
    dadValue: "айдоочу",
    dadNew: "инженер",
    extraLabel: "Кошумча:",
    extra: ["Атам машинаны жакшы айдайт.", "Татаал нерселерди да түшүнүктүү айтып берет."],
    // перенос второго предложения на листе (две линованные строки)
    extraWrap: ["Татаал нерселерди да", "түшүнүктүү айтып берет."],
  },
  hook: { a: "АТАМ — ", b: "АЙДООЧУ", years: "10 ЖЫЛ", engineer: "ИНЖЕНЕР" },
  task: { card: "АТА-ЭНЕМДИН КЕСИБИ", klass: "1-КЛАСС", label: "ТАПШЫРМА" },
  why: {
    morning: "ЭРТЕҢ МЕНЕН",
    afterSchool: "САБАКТАН КИЙИН",
    home: "ҮЙ",
    school: "МЕКТЕП",
    work: "ЖУМУШ",
    repair: "ОҢДООДО",
    routeA: ["ҮЙ", "МЕКТЕП", "ЖУМУШ"],
    routeB: ["ЖУМУШ", "МЕКТЕП", "ҮЙ", "ЖУМУШ"],
  },
  reply: { accent: "СЕНИ МЕНЕН" },
  blueprint: {
    steps: ["ЧИЙМЕ", "МАКЕТ", "ЖАБДУУ"],
    title: "РОЛИКТҮҮ КОНВЕЙЕР",
    parts: { roller: "ролик", belt: "тасма", frame: "рама", motor: "кыймылдаткыч" },
  },
  office: { weekend: "ДЕМ АЛЫШ КҮНҮ", project: "ЖАҢЫ ДОЛБООР", sign: "Инженердик бөлүм" },
  question: { route: ["МЕКТЕП", "ҮЙ", "ЖУМУШ"] },
  week: {
    title: "КИЙИНКИ ЖУМА",
    days: ["Дүй", "Шей", "Шар", "Бей", "Жума"],
    dad: "ЖУМУШ ТАЛКУУСУ",
    mom: "КАРДАР МЕНЕН ЖОЛУГУШУУ",
    pickup: "МЕКТЕПТЕН АЛУУ",
    grandma: "ҮЙДӨ ЧОҢ ЭНЕСИ ТОСОТ",
    dadWho: "Атасы",
    momWho: "Апасы",
  },
  apply: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    button: "Баланы каттоо",
    fields: ["Аты-жөнү", "Дарек", "Мектеп", "Убакыт"],
    sent: "Өтүнмө жөнөтүлдү",
    note: "Маршрут жана убакыт талкууланат",
    headline: "АЛДЫН АЛА ӨТҮНМӨ",
  },
  rewrite: { headline: "ИНЖЕНЕР" },
  school: "МЕКТЕП",
  cta: {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    city: "Бишкек",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    button: "Баланы каттоо",
    link: "Шилтеме профилдин башында",
    whatsappLabel: "WhatsApp",
    whatsappNumber: "0998 08 38 28",
  },
} as const;
