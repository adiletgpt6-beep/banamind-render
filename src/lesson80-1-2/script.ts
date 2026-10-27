// lesson-80 · ролик 80-1-2.
// «Урок 1. Аллах — наш Создатель. Анимация 2: Что спрятано в яблоке?»
// Композиция Lesson80-1-2-WhatIsInsideApple — 1920×1080, 30 к/с, ≈4:20.
//
// Данные сценария: 8 сцен, 43 реплики (тексты — дословно из авторского
// сценария), две обязательные паузы для ответа зрителя. Файл без
// зависимостей от Remotion: его читают Node-скрипты озвучки, шкалы и SRT.
//
// Памятка преподавателю, замечания к постановке и источники не
// озвучиваются и в ролик не входят.

export const A2_VIDEO = {
  id: "Lesson80-1-2-WhatIsInsideApple",
  code: "80-1-2",
  output: "lesson-80-1-2-what-is-inside-apple-16x9",
  width: 1920,
  height: 1080,
  fps: 30,
  voiceDir: "audio/lesson80-1-2",
} as const;

export type A2SceneId = "apple" | "seed" | "roots" | "leaves" | "gather" | "creator" | "viewer" | "notice";

export const A2_SCENES: readonly { readonly id: A2SceneId; readonly n: number; readonly title: string }[] = [
  { id: "apple", n: 1, title: "Яблоко с вопросом" },
  { id: "seed", n: 2, title: "Маленькое семечко, большое дерево" },
  { id: "roots", n: 3, title: "То, чего мы не видим" },
  { id: "leaves", n: 4, title: "Листья, цветы и пчела" },
  { id: "gather", n: 5, title: "Соберём то, что заметили" },
  { id: "creator", n: 6, title: "Как растёт — и кто создал" },
  { id: "viewer", n: 7, title: "Ответ для зрителя" },
  { id: "notice", n: 8, title: "Теперь я замечаю" },
];

export type A2Role = "teacher" | "yusuf" | "amir" | "bilal" | "kids";

export const A2_ROLE_NAMES: Record<A2Role, string> = {
  teacher: "Мухаммад",
  yusuf: "Юсуф",
  amir: "Амир",
  bilal: "Билал",
  kids: "Дети",
};

export type A2Line = {
  readonly id: string; // 80-1-2-001 … 80-1-2-043
  readonly scene: A2SceneId;
  readonly role: A2Role;
  readonly text: string; // дословно из сценария (субтитры, проверка)
  readonly spoken?: string; // что уходит в синтез, если отличается (только пунктуация)
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number;
};

const L = (n: number) => `80-1-2-${String(n).padStart(3, "0")}`;

export const A2_LINES: readonly A2Line[] = [
  // 1. Яблоко с вопросом
  { id: L(1), scene: "apple", role: "yusuf", text: "Ого, яблоко!", tag: "[curious]" },
  { id: L(2), scene: "apple", role: "teacher", text: "А что у него внутри?", tag: "[warmly]" },
  { id: L(3), scene: "apple", role: "amir", text: "Семечки!", tag: "[curious]" },
  { id: L(4), scene: "apple", role: "teacher", text: "Давайте посмотрим.", tag: "[warmly]" },
  { id: L(5), scene: "apple", role: "yusuf", text: "Вот они. Совсем маленькие.", tag: "[curious]" },
  { id: L(6), scene: "apple", role: "teacher", text: "А теперь вопрос: как эти маленькие семечки связаны с большим деревом?", tag: "[thoughtful]" },
  // 2. Маленькое семечко, большое дерево
  { id: L(7), scene: "seed", role: "bilal", text: "Из семечка может вырасти яблоня.", tag: "[thoughtful]" },
  { id: L(8), scene: "seed", role: "yusuf", text: "Такая большая?", tag: "[surprised]" },
  { id: L(9), scene: "seed", role: "teacher", text: "Да. Но не сразу. Для этого нужны подходящие условия и время. До первых яблок проходят годы.", tag: "[warmly]" },
  { id: L(10), scene: "seed", role: "amir", text: "А что помогает дереву расти?", tag: "[curious]" },
  { id: L(11), scene: "seed", role: "teacher", text: "Посмотрим внимательнее.", tag: "[warmly]" },
  // 3. То, чего мы не видим
  { id: L(12), scene: "roots", role: "teacher", text: "Посмотрите под дерево. Что там?" },
  { id: L(13), scene: "roots", role: "amir", text: "Корни." },
  { id: L(14), scene: "roots", role: "teacher", text: "Они удерживают дерево в земле и впитывают воду. Вода нужна ему для жизни." },
  { id: L(15), scene: "roots", role: "yusuf", text: "А дождик поливает землю!", tag: "[excited]" },
  { id: L(16), scene: "roots", role: "teacher", text: "Верно. И люди могут поливать дерево, когда дождя не хватает.", tag: "[warmly]" },
  // 4. Листья, цветы и пчела
  { id: L(17), scene: "leaves", role: "bilal", text: "Дереву ещё нужен солнечный свет." },
  { id: L(18), scene: "leaves", role: "teacher", text: "Да. Листья используют воду, солнечный свет и то, что получают из воздуха, чтобы делать питание для дерева." },
  { id: L(19), scene: "leaves", role: "yusuf", text: "А пчела зачем прилетела?", tag: "[curious]" },
  { id: L(20), scene: "leaves", role: "teacher", text: "Она переносит пыльцу с цветка на цветок. Это помогает яблоне завязать плоды." },
  { id: L(21), scene: "leaves", role: "amir", text: "Получается, и вода нужна, и свет. Даже пчела помогает!", tag: "[excited]" },
  { id: L(22), scene: "leaves", role: "teacher", text: "Мы взяли одно яблоко, а увидели, как много всего связано.", tag: "[warmly]" },
  // 5. Соберём то, что заметили
  { id: L(23), scene: "gather", role: "teacher", text: "Ребята, назовите что-нибудь, что помогает яблоне расти.", tag: "[warmly]" },
  { id: L(24), scene: "gather", role: "yusuf", text: "Вода!", tag: "[excited]" },
  { id: L(25), scene: "gather", role: "amir", text: "Свет и воздух." },
  { id: L(26), scene: "gather", role: "bilal", text: "А корни берут воду из земли." },
  { id: L(27), scene: "gather", role: "teacher", text: "Верно. Мы уже не просто смотрим на дерево. Мы замечаем, как оно устроено.", tag: "[warmly]" },
  // 6. Как растёт — и кто создал
  { id: L(28), scene: "creator", role: "amir", text: "Но дерево ведь выросло из семечка.", tag: "[thoughtful]" },
  { id: L(29), scene: "creator", role: "teacher", text: "Да. Мы узнаём, как оно растёт. А кто создал сами растения, воду, солнце и воздух?", tag: "[warmly]" },
  { id: L(30), scene: "creator", role: "bilal", text: "Аллах." },
  { id: L(31), scene: "creator", role: "teacher", text: "В Коране говорится о воде, которую Аллах ниспосылает, и о растениях и плодах, которые благодаря ей растут. Нам предлагается размышлять об этом.", tag: "[thoughtful]" },
  { id: L(32), scene: "creator", role: "yusuf", text: "Даже об яблоке?", tag: "[curious]" },
  { id: L(33), scene: "creator", role: "teacher", text: "Да. Через знакомое яблоко мы можем замечать мудрость Аллаха в Его творениях.", tag: "[warmly]" },
  // 7. Ответ для зрителя
  { id: L(34), scene: "viewer", role: "teacher", text: "Кто создал растения и всё, что помогает им жить?" },
  { id: L(35), scene: "viewer", role: "kids", text: "Аллах!", seed: 501 },
  { id: L(36), scene: "viewer", role: "teacher", text: "А что мы сегодня заметили в природе?", tag: "[warmly]" },
  { id: L(37), scene: "viewer", role: "bilal", text: "Что многое связано друг с другом.", tag: "[thoughtful]" },
  { id: L(38), scene: "viewer", role: "teacher", text: "Верно. Мы изучаем природу и размышляем о её Создателе.", tag: "[warmly]" },
  // 8. Теперь я замечаю
  { id: L(39), scene: "notice", role: "yusuf", text: "А я думал: просто яблоко.", tag: "[thoughtful]" },
  { id: L(40), scene: "notice", role: "amir", text: "Теперь я буду внимательнее смотреть на деревья.", tag: "[thoughtful]" },
  { id: L(41), scene: "notice", role: "teacher", text: "Смотреть, узнавать и задавать вопросы — это хорошо. Когда замечаем творения Аллаха, у нас появляется больше поводов благодарить Его.", tag: "[warmly]" },
  { id: L(42), scene: "notice", role: "yusuf", text: "И за яблоко тоже!", tag: "[warmly]" },
  { id: L(43), scene: "notice", role: "teacher", text: "Да. За воду, за растения и за пищу. Замечайте мир вокруг, размышляйте и благодарите Аллаха.", tag: "[warmly]" },
];

// Обязательные паузы для ответа зрителя: от конца произнесённого вопроса
// до начала следующего ответа (секунды; при 30 к/с — 120 и 150 кадров).
export const A2_VIEWER_PAUSES: readonly { readonly q: string; readonly a: string; readonly sec: number }[] = [
  { q: L(23), a: L(24), sec: 4 },
  { q: L(34), a: L(35), sec: 5 },
];

// Экранные надписи (русский текст).
export const A2_TEXT = {
  title: "Что спрятано в яблоке?",
  years: "Проходят годы",
  final: ["Замечай.", "Размышляй.", "Благодари Аллаха"],
} as const;

export const a2Line = (id: string): A2Line => {
  const l = A2_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};
