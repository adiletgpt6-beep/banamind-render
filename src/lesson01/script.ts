// «Урок 1. Аллах — наш Создатель. Анимация 1: Кто построил домик?»
// Композиция Lesson01WhoBuiltTheHouse — 1920×1080, 30 к/с, ≈4:40.
//
// Данные сценария: 8 сцен, 40 реплик (тексты — дословно из авторского
// сценария), обязательные паузы для ответа зрителя и постановочные «такты».
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.
//
// Памятка преподавателю, заметки к постановке и раздел источников не
// озвучиваются и в ролик не входят.

export const L1_VIDEO = {
  id: "Lesson01WhoBuiltTheHouse",
  output: "lesson-01-who-built-the-house-16x9",
  width: 1920,
  height: 1080,
  fps: 30,
  voiceDir: "audio/lesson01",
} as const;

export type L1SceneId = "riddle" | "self" | "builder" | "world" | "question" | "parents" | "whoAllah" | "answer";

export const L1_SCENES: readonly { readonly id: L1SceneId; readonly n: number; readonly title: string }[] = [
  { id: "riddle", n: 1, title: "Загадка на столе" },
  { id: "self", n: 2, title: "Может ли домик построить себя?" },
  { id: "builder", n: 3, title: "Нашёлся строитель" },
  { id: "world", n: 4, title: "А откуда взялся настоящий мир?" },
  { id: "question", n: 5, title: "Главный вопрос" },
  { id: "parents", n: 6, title: "А мама и папа?" },
  { id: "whoAllah", n: 7, title: "Кто создал Аллаха?" },
  { id: "answer", n: 8, title: "Ответ, который мы поняли" },
];

export type L1Role = "teacher" | "yusuf" | "amir" | "bilal" | "kids";

export const L1_ROLE_NAMES: Record<L1Role, string> = {
  teacher: "Мухаммад",
  yusuf: "Юсуф",
  amir: "Амир",
  bilal: "Билал",
  kids: "Дети",
};

export type L1Line = {
  readonly id: string;
  readonly scene: L1SceneId;
  readonly role: L1Role;
  readonly text: string; // дословно из сценария (субтитры, проверка)
  readonly spoken?: string; // что уходит в синтез, если отличается (ударения, паузы)
  readonly tag?: string; // аудиотег eleven_v3 (интонация), не звучит
  readonly seed?: number;
  // Реплика, разделённая выдержанной паузой (сцена 7: «Он был всегда.» →
  // пауза → «Никто Его не создавал.»). Части — отдельные файлы.
  readonly parts?: readonly { readonly text: string; readonly spoken?: string }[];
  readonly partGap?: number; // секунды тишины между частями
};

export const L1_LINES: readonly L1Line[] = [
  // 1. Загадка на столе
  { id: "L01", scene: "riddle", role: "yusuf", text: "Ого! А кто построил этот домик?", tag: "[curious]" },
  { id: "L02", scene: "riddle", role: "amir", text: "Когда мы пришли, он уже стоял." },
  { id: "L03", scene: "riddle", role: "teacher", text: "Вот с этого вопроса и начнём. Ассаляму алейкум, ребята!", tag: "[warmly]" },
  { id: "L04", scene: "riddle", role: "kids", text: "Ва алейкум ассалям!" },
  { id: "L05", scene: "riddle", role: "teacher", text: "Сегодня будем думать и искать ответы. Кто же построил наш домик?" },
  // 2. Может ли домик построить себя?
  { id: "L06", scene: "self", role: "yusuf", text: "Может… он построил себя?", spoken: "Может... он построил себя?", tag: "[thoughtful]" },
  { id: "L07", scene: "self", role: "teacher", text: "Давайте проверим эту мысль. Вот время, когда домика ещё не было. Были только кубики." },
  { id: "L08", scene: "self", role: "bilal", text: "Если домика не было, он ничего не мог делать." },
  { id: "L09", scene: "self", role: "teacher", text: "Верно. То, чего ещё нет, не может само себя сделать." },
  { id: "L10", scene: "self", role: "amir", text: "Значит, домик построил кто-то другой!", tag: "[excited]" },
  { id: "L11", scene: "self", role: "teacher", text: "Да. И мы можем узнать, кто это был." },
  // 3. Нашёлся строитель
  { id: "L12", scene: "builder", role: "teacher", text: "Сегодня я пришёл раньше и построил домик для вас.", tag: "[warmly]" },
  { id: "L13", scene: "builder", role: "yusuf", text: "А мы этого не видели!", tag: "[surprised]" },
  { id: "L14", scene: "builder", role: "teacher", text: "Не видели. Но увидели домик и стали искать, откуда он взялся." },
  { id: "L15", scene: "builder", role: "bilal", text: "Получается, важно не просто смотреть. Важно ещё подумать.", tag: "[thoughtful]" },
  { id: "L16", scene: "builder", role: "teacher", text: "И задавать вопросы." },
  // 4. А откуда взялся настоящий мир?
  { id: "L17", scene: "world", role: "teacher", text: "Теперь посмотрите в окно. Что вы видите?" },
  { id: "L18", scene: "world", role: "yusuf", text: "Дерево!", tag: "[excited]" },
  { id: "L19", scene: "world", role: "amir", text: "Горы и небо." },
  {
    id: "L20",
    scene: "world",
    role: "teacher",
    text: "Мы умеем строить дома из дерева и камня. Но откуда взялись сами деревья и камни? А Земля, солнце, звёзды?",
  },
  { id: "L21", scene: "world", role: "bilal", text: "Мы ведь их не делали.", tag: "[thoughtful]" },
  { id: "L22", scene: "world", role: "teacher", text: "Да. Люди появились в мире, который уже был. Значит, весь мир создали не люди." },
  // 5. Главный вопрос
  { id: "L23", scene: "question", role: "amir", text: "А мир мог сделать сам себя?", tag: "[curious]" },
  {
    id: "L24",
    scene: "question",
    role: "teacher",
    text: "Вспомним наш домик. Если его ещё нет, он не может себя построить. Мир тоже не мог создать себя, когда его ещё не было.",
  },
  {
    id: "L25",
    scene: "question",
    role: "teacher",
    text: "Коран предлагает нам задуматься: неужели люди появились без Создателя? Или сами себя создали?",
    tag: "[thoughtful]",
  },
  { id: "L26", scene: "question", role: "yusuf", text: "Я себя не создавал.", tag: "[thoughtful]" },
  { id: "L27", scene: "question", role: "teacher", text: "Верно. Мы не создали себя и весь этот мир. Наш Создатель — Аллах.", tag: "[warmly]" },
  // 6. А мама и папа?
  { id: "L28", scene: "parents", role: "amir", text: "А мама и папа?", tag: "[curious]" },
  {
    id: "L29",
    scene: "parents",
    role: "teacher",
    text: "Конечно, ты родился у мамы и папы. А кто создал первых людей? И мир, в котором мы живём?",
    tag: "[warmly]",
  },
  { id: "L30", scene: "parents", role: "bilal", text: "Аллах." },
  { id: "L31", scene: "parents", role: "teacher", text: "Да. Аллах — Создатель. Он создал нас и всё, что нам нужно для жизни." },
  // 7. Кто создал Аллаха?
  { id: "L32", scene: "whoAllah", role: "bilal", text: "А Аллаха кто создал?", tag: "[curious]" },
  {
    id: "L33",
    scene: "whoAllah",
    role: "teacher",
    text: "Хороший вопрос. Никто. Аллах не появился однажды, как мы или наш домик. Он был всегда. Никто Его не создавал.",
    tag: "[warmly]",
    parts: [
      { text: "Хороший вопрос. Никто. Аллах не появился однажды, как мы или наш домик. Он был всегда." },
      { text: "Никто Его не создавал." },
    ],
    partGap: 1.5,
  },
  { id: "L34", scene: "whoAllah", role: "yusuf", text: "Значит, Аллах не такой, как мы?", tag: "[curious]" },
  { id: "L35", scene: "whoAllah", role: "teacher", text: "Да. Аллах не похож на то, что Он создал. Мы нуждаемся в Нём. А Он ни в ком не нуждается.", tag: "[gently]" },
  // 8. Ответ, который мы поняли
  { id: "L36", scene: "answer", role: "teacher", text: "Кто создал нас и весь мир?" },
  { id: "L37", scene: "answer", role: "kids", text: "Аллах!" },
  // синтез без тире произносит «сделает»; тире только для интонации
  { id: "L38", scene: "answer", role: "teacher", text: "А может созданный мир сделать сам себя?", spoken: "А может созданный мир — сделать сам себя?", seed: 300 },
  { id: "L39", scene: "answer", role: "amir", text: "Нет. То, чего ещё нет, не может себя создать." },
  {
    id: "L40",
    scene: "answer",
    role: "teacher",
    text: "Верно. Сегодня мы научились смотреть на мир и задумываться о его Создателе. Мир не создал себя. Его Создатель — Аллах.",
    tag: "[warmly]",
  },
];

// Обязательные паузы для ответа зрителя: от конца произнесённого вопроса
// до начала следующего ответа (секунды; при 30 к/с — 120, 150, 120 кадров).
export const L1_VIEWER_PAUSES: Readonly<Record<string, number>> = {
  L25: 4,
  L36: 5,
  L38: 4,
};

// Экранные надписи (русский текст).
export const L1_TEXT = {
  lesson: "Урок 1",
  title: "Кто построил домик?",
  morning: "Утром",
  cardBefore: "Домика ещё нет",
  cardAfter: "Домик построен",
  final: "Создатель мира — Аллах",
} as const;

export const lineById = (id: string): L1Line => {
  const l = L1_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};
