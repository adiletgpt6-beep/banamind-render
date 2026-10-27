// Урок 80-1 «Аллах — наш Создатель», мини-фильм 12 «Аллах слышит меня?»
// (композиция Lesson80-1-12, 1920×1080, 30 к/с, ориентир 4:00).
//
// Знакомая учебная комната мечети. Юсуф (4 года) собирает деревянную
// картинку из шести деталей: три уже соединены, следующая не подходит. Он
// тихо, почти про себя, просит: «Аллах, помоги мне собрать картинку». Амир
// слышит, Юсуф спрашивает учителя Мухаммада, слышит ли его Аллах. Учитель
// садится рядом: Аллах слышит даже тихую просьбу; такая просьба называется
// дуа; просить можно о хорошем; дуа не отменяет собственных стараний.
// Амир подсказывает, куда смотреть, — Юсуф сам поворачивает деталь с
// листиком, затем сам ставит пятую и шестую. Три вопроса зрителю — паузы
// ровно по 5 с. Аллах не изображается и не озвучивается; картинка не
// складывается «сама». Музыки, рекламы и призывов нет.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки, тесты
// и проверки. Общая библиотека серии (риг, класс, персонажи) — src/lesson80/.

import type { L80Role } from "../core/roles.ts";
export type { L80Role } from "../core/roles.ts";

export const FILM = {
  // Remotion не допускает «_» в идентификаторе композиции: Lesson80_1_12 → дефисы.
  id: "Lesson80-1-12",
  productionId: "80-1-12",
  lesson: "Урок 1 «Аллах — наш Создатель»",
  title: "Аллах слышит меня?",
  number: 12,
  output: "lesson-80-1-12-allah-hears-me",
  voiceDir: "lesson-80-1-12/audio",
  width: 1920,
  height: 1080,
  fps: 30,
  // допустимая длительность 3:45–4:15 (6750–7650 кадров), ориентир 4:00
  minSec: 225,
  targetSec: 240,
  maxSec: 255,
} as const;

// Говорящие роли фильма (групповой реплики «kids» в этом фильме нет).
export type L80Speaker = Exclude<L80Role, "kids">;

export const L80_TTS = {
  modelId: "eleven_v3",
  languageCode: "ru",
  seed: 8121,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
  // версия хэша реплики для провайдеров без seed (OpenAI, RHVoice, Piper)
  version: 1,
} as const;

// Голоса по ролям — тот же набор, что в последних дорожках серии (80-1-9,
// 80-1-10, 80-1-11): голоса из лаборатории 80-1-7, упорядоченные по возрасту
// и высоте тона: учитель — Eric (≈ 160 Гц), Юсуф (4) — KG-son, самый светлый
// (≈ 300 Гц), Амир (8) — Alice (≈ 240 Гц), Билал (11) — Jessica (≈ 186 Гц):
// ниже Амира, но без взрослого баритона. Ни один провайдер не меняет высоту
// тона и не ускоряет речь. RHVoice — только резервная офлайн-дорожка.
export type VoiceSpec = {
  readonly elevenlabs: { readonly name: string; readonly voiceId: string };
  readonly openai: { readonly voice: string; readonly instructions: string };
  readonly rhvoice: { readonly voice: string; readonly pitch: number; readonly rate: number };
  readonly piper: { readonly voice: string; readonly speed: number };
};

const RU = "Говорит по-русски естественно, без акцента, ровным темпом. Только текст реплики.";

export const VOICES: Record<L80Speaker, VoiceSpec> = {
  muhammad: {
    elevenlabs: { name: "Eric", voiceId: "cjVigY5qzO86Huf0OWal" },
    openai: { voice: "ash", instructions: `Тёплый, спокойный голос доброго учителя 30–35 лет, разговаривающего с детьми в небольшой комнате; без проповеднического пафоса и без нажима. ${RU}` },
    rhvoice: { voice: "Aleksandr-hq", pitch: 0, rate: -0.1 },
    piper: { voice: "dmitri", speed: 0.76 },
  },
  yusuf: {
    elevenlabs: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
    openai: { voice: "coral", instructions: `Любознательный мальчик четырёх лет: маленький мягкий голос, короткие живые интонации, без писка и карикатуры. ${RU}` },
    rhvoice: { voice: "Anna", pitch: 0, rate: -0.12 },
    piper: { voice: "irina", speed: 0.74 },
  },
  amir: {
    elevenlabs: { name: "Alice", voiceId: "Xb7hH8MSUJpSbSDYk0k2" },
    openai: { voice: "nova", instructions: `Дружелюбный практичный мальчик восьми лет, помогает младшему спокойно, без превосходства. ${RU}` },
    rhvoice: { voice: "Elena", pitch: 0, rate: -0.06 },
    piper: { voice: "denis", speed: 0.78 },
  },
  bilal: {
    elevenlabs: { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9" },
    openai: { voice: "sage", instructions: `Спокойный рассудительный мальчик одиннадцати лет: голос старшего ребёнка, ещё не взрослый, без назидательности. ${RU}` },
    rhvoice: { voice: "Arina", pitch: 0, rate: -0.04 },
    piper: { voice: "ruslan", speed: 0.78 },
  },
};

// ---------- Сцены ----------
export type L80SceneId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8";

export const L80_SCENES: readonly { readonly id: L80SceneId; readonly title: string }[] = [
  { id: "s1", title: "1. Тихая просьба" },
  { id: "s2", title: "2. Аллах слышит" },
  { id: "s3", title: "3. Что такое дуа?" },
  { id: "s4", title: "4. Простые слова" },
  { id: "s5", title: "5. Просить и стараться" },
  { id: "s6", title: "6. Попробуем вместе" },
  { id: "s7", title: "7. Получилось" },
  { id: "s8", title: "8. Я могу обращаться к Аллаху" },
];

// ---------- Реплики (канонический текст задания, ровно 37) ----------
// text — точный текст задания (субтитры, SRT, проверка манифеста); в звук
// попадает только он. tag — аудиотег eleven_v3 для интонации (не звучит;
// если синтезатор его произнёс, скрипт озвучки повторяет дубль без тега).
// note — инструкция по интонации для производства (не озвучивается).
// takes — сколько дублей синтезировать (лучший — по распознаванию MMS),
// seed — свой seed реплики, pick — выбранный при прослушивании дубль.
// quiet — реплика звучит тише остальных (сведение: тише, но разборчиво).
export type L80Line = {
  readonly id: number; // 1 … 37 (только для производства, не озвучивается)
  readonly role: L80Speaker;
  readonly scene: L80SceneId;
  readonly text: string;
  readonly tag?: string;
  readonly note?: string;
  readonly seed?: number;
  readonly takes?: number;
  readonly pick?: number;
  readonly quiet?: boolean;
};

type Extra = { tag?: string; note?: string; seed?: number; takes?: number; pick?: number; quiet?: boolean };
const L = (id: number, role: L80Speaker, scene: L80SceneId, text: string, extra: Extra = {}): L80Line => ({
  id,
  role,
  scene,
  text,
  ...(extra.tag ? { tag: extra.tag } : {}),
  ...(extra.note ? { note: extra.note } : {}),
  ...(extra.seed ? { seed: extra.seed } : {}),
  ...(extra.takes ? { takes: extra.takes } : {}),
  ...(extra.pick ? { pick: extra.pick } : {}),
  ...(extra.quiet ? { quiet: true } : {}),
});

export const L80_LINES: readonly L80Line[] = [
  // Сцена 1 — «Тихая просьба»
  L(1, "yusuf", "s1", "Аллах, помоги мне собрать картинку.", { tag: "[softly]", note: "очень тихо, почти для себя, искренне; каждое слово разборчиво", takes: 3, quiet: true }),
  L(2, "amir", "s1", "Ты что-то сказал?", { tag: "[curious]", note: "дружелюбно, чуть удивлённо", takes: 2 }),
  L(3, "yusuf", "s1", "Я попросил Аллаха помочь. Но очень тихо.", { tag: "[sincere]", note: "честно, немного смущённо; вторая фраза тише", takes: 2 }),
  L(4, "yusuf", "s1", "Мухаммад, а Аллах меня слышит?", { tag: "[curious]", note: "искреннее любопытство, без тревоги", takes: 2 }),
  // Сцена 2 — «Аллах слышит»
  L(5, "muhammad", "s2", "Как вы считаете, ребята?", { tag: "[warmly]", note: "вопрос к зрителю: доброжелательная заинтересованность" }),
  L(6, "bilal", "s2", "Да. Аллах слышит.", { note: "уверенно и спокойно", takes: 2 }),
  L(7, "muhammad", "s2", "Верно. В Коране Аллах назван Слышащим. Тебе не нужно кричать, чтобы Аллах услышал твою просьбу.", { tag: "[warmly]", note: "мягко соглашается, объясняет просто" }),
  L(8, "yusuf", "s2", "Даже тихо-тихо?", { tag: "[surprised]", note: "искреннее удивление", takes: 3 }),
  L(9, "muhammad", "s2", "Да.", { tag: "[warmly]", note: "коротко, спокойно, уверенно, с улыбкой", takes: 3 }),
  // Сцена 3 — «Что такое дуа?»
  L(10, "muhammad", "s3", "Такую просьбу к Аллаху называют дуа.", { note: "слово «дуа» — понятно и естественно" }),
  L(11, "yusuf", "s3", "Значит, я уже сделал дуа?", { tag: "[happy]", note: "приятное удивление", takes: 2 }),
  L(12, "muhammad", "s3", "Да. Ты попросил Аллаха помочь. В Коране говорится, что Он отвечает на обращение того, кто Его просит.", { tag: "[warmly]" }),
  L(13, "bilal", "s3", "О чём можно просить?", { tag: "[curious]" }),
  L(14, "muhammad", "s3", "О хорошем: об учении, здоровье, помощи себе и другим.", { note: "спокойно, перечисление без спешки" }),
  // Сцена 4 — «Простые слова»
  L(15, "muhammad", "s4", "Какими словами Юсуф может попросить помощи в учёбе?", { tag: "[thoughtful]", note: "вопрос к зрителю, спокойно" }),
  L(16, "yusuf", "s4", "Аллах, помоги мне понять и научиться.", { tag: "[sincere]", note: "просто и искренне, без торжественности", takes: 2 }),
  L(17, "amir", "s4", "А я попрошу: «Аллах, помоги мне быть хорошим другом».", { tag: "[warmly]", note: "тепло и спокойно", takes: 2 }),
  L(18, "muhammad", "s4", "Хорошие просьбы.", { tag: "[warmly]", note: "с улыбкой", takes: 2 }),
  // Сцена 5 — «Просить и стараться»
  L(19, "yusuf", "s5", "Я попросил. А почему картинка ещё не собралась?", { tag: "[curious]", note: "удивление и желание разобраться, не обида" }),
  L(20, "muhammad", "s5", "Мы просим Аллаха помощи и сами стараемся. Дуа не означает, что всё сразу получится.", { note: "очень важная реплика: спокойно, понятно, без спешки" }),
  L(21, "bilal", "s5", "Аллах слышит, даже если мы ещё не видим результата?", { tag: "[thoughtful]" }),
  L(22, "muhammad", "s5", "Да. Продолжай обращаться к Аллаху и делать то, что зависит от тебя.", { tag: "[warmly]" }),
  // Сцена 6 — «Попробуем вместе»
  L(23, "muhammad", "s6", "Что поможет Юсуфу собрать картинку?", { note: "вопрос к зрителю" }),
  L(24, "amir", "s6", "Посмотреть на рисунок и подобрать края. Я покажу.", { tag: "[warmly]", note: "практично, дружелюбно" }),
  L(25, "yusuf", "s6", "Вот эта, с зелёным листиком?", { tag: "[curious]", takes: 2 }),
  L(26, "amir", "s6", "Поверни её. Видишь, веточка продолжается.", { tag: "[gently]", note: "подсказка, не приказ" }),
  L(27, "yusuf", "s6", "Подошла!", { tag: "[happy]", note: "небольшая настоящая радость маленького ребёнка", takes: 3 }),
  L(28, "bilal", "s6", "Теперь попробуй следующую сам.", { tag: "[warmly]", note: "ободряюще" }),
  // Сцена 7 — «Получилось»
  L(29, "yusuf", "s7", "Я собрал!", { tag: "[happy]", note: "радостно, но без крика", takes: 3 }),
  L(30, "amir", "s7", "Ты внимательно смотрел и пробовал.", { tag: "[warmly]", note: "тепло, как настоящий друг" }),
  L(31, "yusuf", "s7", "Спасибо, Амир! И тебе, Билал!", { tag: "[happy]", takes: 2 }),
  L(32, "muhammad", "s7", "Ты учился и принимал помощь друзей.", { tag: "[warmly]", note: "одобрение без чрезмерного восторга" }),
  // Сцена 8 — «Я могу обращаться к Аллаху»
  L(33, "muhammad", "s8", "Теперь ты знаешь, как можно попросить помощи.", { tag: "[warmly]" }),
  L(34, "yusuf", "s8", "Аллах слышит меня, даже если я говорю тихо.", { note: "уверенно и спокойно", takes: 2 }),
  L(35, "bilal", "s8", "А дуа — это просьба к Аллаху."),
  L(36, "amir", "s8", "Просим помощи и стараемся."),
  L(37, "yusuf", "s8", "И можно помочь другу!", { tag: "[happy]", note: "тепло и естественно", takes: 2 }),
];

export const lineById = (id: number): L80Line => {
  const l = L80_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

export const lineFile = (id: number) => `l${String(id).padStart(2, "0")}.mp3`;

// Точные надписи реквизита (рендерятся шрифтом с кириллицей отдельным слоем).
export const TEXTS = {
  poster: "Аллах — наш Создатель",
  card: "Проверить росток",
  folder: ["Наши", "вопросы"],
} as const;

// ---------- Зрительские паузы (после реплики, до следующей), секунды ----------
export type PauseId = "P1" | "P2" | "P3";
export const L80_PAUSES: readonly { readonly id: PauseId; readonly after: number; readonly sec: number }[] = [
  { id: "P1", after: 5, sec: 5 },
  { id: "P2", after: 15, sec: 5 },
  { id: "P3", after: 23, sec: 5 },
];

// ---------- Монтажная последовательность ----------
// Фильм собирается как цепочка «ударов»: реплика (её длительность — из файла
// озвучки) и действия с фиксированной длительностью. Абсолютные времена
// вычисляются в timeline.ts по измеренному аудио; хореография и планы берут
// отрезки по подписям (label), поэтому при перезаписи озвучки всё
// пересчитывается само.
export type L80Beat =
  | { readonly kind: "line"; readonly id: number; readonly gapAfter?: number }
  | { readonly kind: "hold"; readonly sec: number; readonly label: string; readonly scene?: L80SceneId }
  | { readonly kind: "pause"; readonly id: PauseId };

export const L80_BEATS: readonly L80Beat[] = [
  // Сцена 1 — картинка, неудачная попытка, тихая просьба, вопрос учителю
  { kind: "hold", sec: 3.6, label: "комната", scene: "s1" },
  { kind: "hold", sec: 2.6, label: "Юсуф рассматривает картинку" },
  { kind: "hold", sec: 1.3, label: "Юсуф берёт деталь" },
  { kind: "hold", sec: 3.6, label: "попытка: не подходит" },
  { kind: "hold", sec: 1.5, label: "Юсуф откладывает деталь" },
  { kind: "hold", sec: 1.7, label: "Юсуф смотрит на картинку" },
  { kind: "line", id: 1, gapAfter: 0.5 },
  { kind: "hold", sec: 0.9, label: "Амир поднимает голову" },
  { kind: "line", id: 2, gapAfter: 0.6 },
  { kind: "line", id: 3, gapAfter: 0.5 },
  { kind: "hold", sec: 1.1, label: "Юсуф поворачивается к учителю" },
  { kind: "line", id: 4, gapAfter: 0.8 },
  // Сцена 2 — учитель подходит и садится рядом; вопрос зрителю; ответ
  { kind: "hold", sec: 3.6, label: "учитель подходит", scene: "s2" },
  { kind: "hold", sec: 2.6, label: "учитель садится" },
  { kind: "hold", sec: 1.4, label: "Билал откладывает книгу" },
  { kind: "line", id: 5, gapAfter: 0 },
  { kind: "pause", id: "P1" },
  { kind: "line", id: 6, gapAfter: 0.9 },
  { kind: "line", id: 7, gapAfter: 1.1 },
  { kind: "line", id: 8, gapAfter: 0.6 },
  { kind: "line", id: 9, gapAfter: 0.4 },
  { kind: "hold", sec: 3.0, label: "Юсуф успокаивается" },
  // Сцена 3 — дуа
  { kind: "line", id: 10, gapAfter: 0.9 },
  { kind: "line", id: 11, gapAfter: 0.9 },
  { kind: "line", id: 12, gapAfter: 1.4 },
  { kind: "line", id: 13, gapAfter: 0.9 },
  { kind: "line", id: 14, gapAfter: 0.6 },
  { kind: "hold", sec: 1.8, label: "дети слушают" },
  { kind: "hold", sec: 3.2, label: "Амир придвигается" },
  // Сцена 4 — простые слова
  { kind: "hold", sec: 1.6, label: "учитель смотрит на детей", scene: "s4" },
  { kind: "line", id: 15, gapAfter: 0 },
  { kind: "pause", id: "P2" },
  { kind: "line", id: 16, gapAfter: 1.3 },
  { kind: "line", id: 17, gapAfter: 0.4 },
  { kind: "hold", sec: 1.2, label: "Амир смотрит на Юсуфа" },
  { kind: "line", id: 18, gapAfter: 0.4 },
  { kind: "hold", sec: 2.8, label: "согласие" },
  { kind: "hold", sec: 1.6, label: "Юсуф снова смотрит на картинку" },
  // Сцена 5 — просить и стараться
  { kind: "hold", sec: 3.0, label: "картинка не собрана", scene: "s5" },
  { kind: "hold", sec: 1.6, label: "Юсуф поднимает голову" },
  { kind: "line", id: 19, gapAfter: 1.3 },
  { kind: "line", id: 20, gapAfter: 1.6 },
  { kind: "line", id: 21, gapAfter: 0.9 },
  { kind: "line", id: 22, gapAfter: 0.9 },
  { kind: "hold", sec: 1.4, label: "Юсуф поворачивается к картинке" },
  { kind: "hold", sec: 2.2, label: "Юсуф берёт деталь с листиком" },
  { kind: "hold", sec: 3.2, label: "Юсуф рассматривает листик" },
  // Сцена 6 — попробуем вместе
  { kind: "line", id: 23, gapAfter: 0 },
  { kind: "pause", id: "P3" },
  { kind: "line", id: 24, gapAfter: 0.3 },
  { kind: "hold", sec: 1.6, label: "Амир наклоняется к Юсуфу" },
  { kind: "line", id: 25, gapAfter: 0.5 },
  { kind: "hold", sec: 1.2, label: "Амир смотрит на ветку" },
  { kind: "line", id: 26, gapAfter: 0.3 },
  { kind: "hold", sec: 7.6, label: "поворот и соединение" },
  { kind: "line", id: 27, gapAfter: 1.1 },
  { kind: "line", id: 28, gapAfter: 0.6 },
  { kind: "hold", sec: 2.2, label: "учитель наблюдает" },
  // Сцена 7 — получилось
  { kind: "hold", sec: 1.8, label: "две детали", scene: "s7" },
  { kind: "hold", sec: 4.4, label: "пятая деталь" },
  { kind: "hold", sec: 5.0, label: "шестая деталь" },
  { kind: "hold", sec: 2.6, label: "картинка собрана" },
  { kind: "line", id: 29, gapAfter: 1.1 },
  { kind: "line", id: 30, gapAfter: 0.7 },
  { kind: "line", id: 31, gapAfter: 0.8 },
  { kind: "line", id: 32, gapAfter: 0.6 },
  { kind: "hold", sec: 4.2, label: "палец вдоль края" },
  // Сцена 8 — итог разговора, коробка, общий план
  { kind: "line", id: 33, gapAfter: 0.8 },
  { kind: "line", id: 34, gapAfter: 0.8 },
  { kind: "line", id: 35, gapAfter: 0.6 },
  { kind: "line", id: 36, gapAfter: 0.6 },
  { kind: "line", id: 37, gapAfter: 0.8 },
  { kind: "hold", sec: 4.6, label: "коробка" },
  { kind: "hold", sec: 3.4, label: "камера отходит" },
  { kind: "hold", sec: 4.6, label: "финал: класс" },
];
