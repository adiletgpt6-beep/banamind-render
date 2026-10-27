// lesson-80 · ролик 80-1-3.
// Урок 1 «Аллах — наш Создатель» · мини-фильм 3 «А если я не вижу?»
// (продолжает «Кто построил домик?» и «Что спрятано в яблоке?»).
// Композиция Lesson80-1-3-WhatIfICantSee — 1920×1080, 30 к/с, ≈4:05.
//
// Данные сценария: 8 сцен, 42 реплики (тексты — дословно из авторского
// сценария), три обязательные паузы для ответа зрителя и невербальный
// выдох Юсуфа. Файл без зависимостей от Remotion: его читают Node-скрипты
// озвучки, шкалы, проверок и SRT.
//
// Реплики — авторское объяснение для детей, а не цитаты аятов или хадисов.
// Говорят только Мухаммад, Юсуф, Амир и Билал. Заголовки, номера реплик и
// указания режиссёру не озвучиваются.

export const A3_VIDEO = {
  id: "Lesson80-1-3-WhatIfICantSee",
  code: "80-1-3",
  output: "lesson-80-1-3-what-if-i-cant-see-16x9",
  width: 1920,
  height: 1080,
  fps: 30,
  voiceDir: "audio/lesson80-1-3",
} as const;

export type A3SceneId = "spin" | "blow" | "senses" | "question" | "creation" | "invisible" | "two" | "ask";

export const A3_SCENES: readonly { readonly id: A3SceneId; readonly n: number; readonly title: string }[] = [
  { id: "spin", n: 1, title: "Крутится сама?" },
  { id: "blow", n: 2, title: "Подуть — и проверить" },
  { id: "senses", n: 3, title: "Не только глазами" },
  { id: "question", n: 4, title: "Вопрос Юсуфа" },
  { id: "creation", n: 5, title: "Воздух — творение" },
  { id: "invisible", n: 6, title: "Любая невидимая вещь?" },
  { id: "two", n: 7, title: "Два вопроса" },
  { id: "ask", n: 8, title: "Можно спрашивать" },
];

export type A3Role = "teacher" | "yusuf" | "amir" | "bilal";

export const A3_ROLE_NAMES: Record<A3Role, string> = {
  teacher: "Мухаммад",
  yusuf: "Юсуф",
  amir: "Амир",
  bilal: "Билал",
};

export type A3Line = {
  readonly id: string; // 80-1-3-001 … 80-1-3-042
  readonly n: number; // номер реплики 1…42
  readonly scene: A3SceneId;
  readonly role: A3Role;
  readonly text: string; // дословно из сценария (субтитры, проверка)
  readonly spoken?: string; // что уходит в синтез, если отличается (только пунктуация)
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly lead?: string; // вводное слово для синтеза (вырезается при сборке, не звучит)
  readonly seed?: number;
  readonly toViewer?: boolean; // обращение к детям и зрителям
};

const L = (n: number) => `80-1-3-${String(n).padStart(3, "0")}`;
const line = (n: number, scene: A3SceneId, role: A3Role, text: string, extra: Partial<A3Line> = {}): A3Line => ({ id: L(n), n, scene, role, text, ...extra });

export const A3_LINES: readonly A3Line[] = [
  // 1. Крутится сама?
  line(1, "spin", "yusuf", "Ой, она крутится!", { tag: "[curious]" }),
  line(2, "spin", "amir", "Никто её не трогает.", { tag: "[curious]" }),
  line(3, "spin", "bilal", "Из окна дует ветер.", { tag: "[thoughtful]" }),
  line(4, "spin", "teacher", "Давайте посмотрим внимательнее. Что вращается, а что стоит на месте?", { tag: "[warmly]" }),
  line(5, "spin", "yusuf", "Лепестки крутятся. Палочка стоит!", { tag: "[curious]" }),
  // 2. Подуть — и проверить
  line(6, "blow", "teacher", "А теперь отойдём от окна.", { tag: "[warmly]" }),
  line(7, "blow", "yusuf", "Остановилась.", { tag: "[curious]" }),
  // вводное слово: без него синтез начинал файл сразу с «Ю» и усекал его («Юсов»)
  line(8, "blow", "teacher", "Юсуф, попробуй подуть на лепестки.", { tag: "[warmly]", lead: "Хорошо." }),
  line(9, "blow", "yusuf", "Снова крутится!", { tag: "[excited]" }),
  line(10, "blow", "teacher", "Ты направил на них воздух. Когда воздух движется, он может вращать вертушку.", { tag: "[warmly]" }),
  line(11, "blow", "amir", "Я его щекой чувствую!", { tag: "[excited]" }),
  line(12, "blow", "teacher", "Да, движение воздуха можно почувствовать кожей.", { tag: "[warmly]" }),
  // 3. Не только глазами
  line(13, "senses", "teacher", "Сам воздух здесь не виден. Но мы замечаем его движение: вертушка вращается, а кожа чувствует ветерок.", { tag: "[thoughtful]" }),
  line(14, "senses", "bilal", "Получается, можно узнать не только глазами?", { tag: "[thoughtful]" }),
  line(15, "senses", "teacher", "Да. Помогают наблюдение, ощущения и размышление.", { tag: "[warmly]" }),
  line(16, "senses", "teacher", "Ребята, как мы заметили движение воздуха?", { tag: "[warmly]", toViewer: true }),
  line(17, "senses", "yusuf", "Вертушка закрутилась!", { tag: "[excited]" }),
  line(18, "senses", "amir", "Я почувствовал его щекой."),
  // 4. Вопрос Юсуфа
  // «А» сливалось с «Аллаха» — запятая (только пунктуация) даёт короткую раздумчивую паузу
  line(19, "question", "yusuf", "А Аллаха мы тоже не видим?", { spoken: "А, Аллаха мы тоже не видим?", tag: "[curious]" }),
  line(20, "question", "teacher", "В этой жизни мы не видим Аллаха глазами.", { tag: "[warmly]" }),
  line(21, "question", "amir", "А почему тогда верим, что Он есть?", { tag: "[curious]" }),
  line(22, "question", "teacher", "Хороший вопрос. Мы узнаём об Аллахе из Корана и размышляем о мире, который Он создал.", { tag: "[warmly]" }),
  line(23, "question", "bilal", "Как о яблонях, которые мы обсуждали?", { tag: "[thoughtful]" }),
  line(24, "question", "teacher", "Да. О растениях, о нас самих, о всей природе.", { tag: "[warmly]" }),
  // 5. Воздух — творение
  line(25, "creation", "yusuf", "Значит, Аллах похож на воздух?", { tag: "[curious]" }),
  line(26, "creation", "teacher", "Нет, Юсуф. Воздух — творение. Аллах — Создатель, и Он не похож на Свои творения.", { tag: "[warmly]" }),
  line(27, "creation", "bilal", "Тогда что нам показала вертушка?", { tag: "[thoughtful]" }),
  line(28, "creation", "teacher", "Только то, что воздух может двигаться, хотя мы его не видим. А из слов «я не вижу» ещё не следует «этого нет».", { tag: "[thoughtful]" }),
  // 6. Любая невидимая вещь?
  line(29, "invisible", "amir", "Тогда всё невидимое существует?", { tag: "[curious]" }),
  line(30, "invisible", "teacher", "Нет. Одного «я не вижу» мало, чтобы сказать и «есть», и «нет». Нужно разбираться: какие у нас основания?", {
    // в пробах оба дубля теряли первое «и» — двоеточие (только пунктуация) отделяет перечисление
    spoken: "Нет. Одного «я не вижу» мало, чтобы сказать: и «есть», и «нет». Нужно разбираться: какие у нас основания?",
    tag: "[thoughtful]",
  }),
  line(31, "invisible", "bilal", "Про воздух мы узнали по тому, как двигалась вертушка.", { tag: "[thoughtful]" }),
  line(32, "invisible", "teacher", "Верно. А Коран учит верить в Аллаха и в то, чего мы не видим, но о чём Он сообщил.", { tag: "[warmly]" }),
  line(33, "invisible", "yusuf", "А если я не понял?", { tag: "[curious]" }),
  line(34, "invisible", "teacher", "Спрашивай. Мы спокойно разберёмся вместе.", { tag: "[warmly]" }),
  // 7. Два вопроса
  line(35, "two", "teacher", "Ребята, вспомните: что вращало вертушку?", { tag: "[warmly]", toViewer: true }),
  line(36, "two", "yusuf", "Движущийся воздух!", { tag: "[excited]" }),
  line(37, "two", "teacher", "А воздух — Создатель или творение?", { tag: "[warmly]", toViewer: true }),
  line(38, "two", "amir", "Творение Аллаха."),
  line(39, "two", "teacher", "Верно. Аллах не похож на Свои творения.", { tag: "[warmly]" }),
  // 8. Можно спрашивать
  line(40, "ask", "yusuf", "А если появится ещё вопрос?", { tag: "[curious]" }),
  // синтез начинал файл прямо с «С» и усекал его — вводное слово (вырезается при сборке)
  line(41, "ask", "teacher", "Спрашивай, Юсуф. Размышлять и учиться можно вместе.", { lead: "Хорошо.", seed: 211 }),
  line(42, "ask", "bilal", "Не всё можно узнать только глазами."),
];

// Обязательные паузы для ответа зрителя: от конца произнесённого вопроса
// до начала следующего ответа (секунды; при 30 к/с — 120, 120 и 150 кадров).
export const A3_VIEWER_PAUSES: readonly { readonly q: string; readonly a: string; readonly sec: number }[] = [
  { q: L(16), a: L(17), sec: 4 },
  { q: L(35), a: L(36), sec: 4 },
  { q: L(37), a: L(38), sec: 5 },
];

// Невербальный опыт сцены 2 (не пауза для зрителя): вдох, выдох Юсуфа и
// первый отклик вертушки — около 3 с без реплик между 08 и 09.
export const A3_BLOW_SEC = 3.0;

// Реплики, которые нельзя сокращать (проверяется тестом дословно).
export const A3_PROTECTED = [20, 22, 26, 28, 30, 32, 39] as const;

// Экранные надписи (русский текст).
export const A3_TEXT = {
  title: "А если я не вижу?",
  final: ["Не всё можно узнать", "только глазами"],
} as const;

export const a3Line = (id: string): A3Line => {
  const l = A3_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};
