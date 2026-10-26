// Урок 80-1 «Аллах — наш Создатель», мини-фильм 8 «А кто создал Аллаха?»
// (композиция Lesson80-1-8, 1920×1080, 30 к/с, ориентир 4:10).
//
// Юсуф (4) придвигает лодочку Амира и кладёт рядом свой рисунок Земли и
// спрашивает: «А кто создал Аллаха?» Учитель Мухаммад спокойно отвечает сразу:
// Аллаха никто не создал, Он существовал всегда. Дальше класс различает
// созданную лодочку и несотворённого Создателя, исключает «создал Себя Сам»,
// узнаёт из Корана смысл имени «Первый» (57:3) и части смысла суры «Аль-Ихляс»
// (112:3–4), отвечает на три вопроса учителя (зрительские паузы 5, 5 и 6 с),
// и Амир записывает на карточку ответ, который Юсуф сам формулирует.
// Аллах не изображается и не озвучивается. Музыки, рекламы и призывов нет.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки, тесты
// и проверки. Общая библиотека серии (риг, класс, персонажи) — src/lesson80/.

import type { L80Role } from "../core/roles.ts";
export type { L80Role } from "../core/roles.ts";

export const FILM = {
  // Remotion не допускает «_» в идентификаторе композиции: Lesson80_1_8 → дефисы.
  id: "Lesson80-1-8",
  productionId: "80-1-8",
  title: "А кто создал Аллаха?",
  output: "lesson-80-1-8",
  voiceDir: "lesson-80-1-8/audio",
  width: 1920,
  height: 1080,
  fps: 30,
  // допустимая длительность 3:40–4:40, ориентир 4:10
  minSec: 220,
  targetSec: 250,
  maxSec: 280,
} as const;

// Говорящие роли фильма (групповой реплики «kids» в этом фильме нет).
export type L80Speaker = Exclude<L80Role, "kids">;

export const L80_TTS = {
  modelId: "eleven_v3",
  languageCode: "ru",
  seed: 818,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
  // версия хэша реплики для провайдеров без seed (OpenAI, RHVoice, Piper)
  version: 1,
} as const;

// Голоса по ролям для каждого провайдера. Провайдер выбирается скриптом
// озвучки по доступным ключам: ElevenLabs → OpenAI → RHVoice → Piper (офлайн,
// только черновая дорожка для местной проверки монтажа).
// Ни один провайдер не меняет высоту тона и не ускоряет речь.
//   • ElevenLabs — тот же набор, что в готовой дорожке 80-1-7 (преемственность
//     голосов серии): учитель — Eric, Юсуф — Jessica, Амир — Alice, Билал — Liam.
//     Известное слабое место (см. заметку 80-1-7): Liam ниже голоса учителя и
//     звучит старше одиннадцати лет; замена требует новой лаборатории голосов.
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
    openai: { voice: "ash", instructions: `Тёплый, спокойный голос доброго учителя 30–35 лет, разговаривающего с детьми; без дикторского нажима. ${RU}` },
    rhvoice: { voice: "Aleksandr-hq", pitch: 0, rate: -0.1 },
    piper: { voice: "dmitri", speed: 0.76 },
  },
  yusuf: {
    elevenlabs: { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9" },
    openai: { voice: "coral", instructions: `Любознательный мальчик четырёх лет: маленький мягкий голос, короткие фразы, искренность, без писка и карикатуры. ${RU}` },
    rhvoice: { voice: "Anna", pitch: 0, rate: -0.12 },
    piper: { voice: "irina", speed: 0.74 },
  },
  amir: {
    elevenlabs: { name: "Alice", voiceId: "Xb7hH8MSUJpSbSDYk0k2" },
    openai: { voice: "nova", instructions: `Спокойный наблюдательный мальчик восьми лет, чуть увереннее младшего, без соревнования. ${RU}` },
    rhvoice: { voice: "Elena", pitch: 0, rate: -0.06 },
    piper: { voice: "denis", speed: 0.78 },
  },
  bilal: {
    elevenlabs: { name: "Liam", voiceId: "TX3LPaxmHKxFdv7VOQHJ" },
    openai: { voice: "sage", instructions: `Внимательный думающий мальчик одиннадцати лет: голос старшего ребёнка, ещё не взрослый, без лекционного тона. ${RU}` },
    rhvoice: { voice: "Arina", pitch: 0, rate: -0.04 },
    piper: { voice: "ruslan", speed: 0.78 },
  },
};

// ---------- Сцены ----------
export type L80SceneId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8";

export const L80_SCENES: readonly { readonly id: L80SceneId; readonly title: string }[] = [
  { id: "s1", title: "1. А кто создал Аллаха?" },
  { id: "s2", title: "2. Прямой ответ" },
  { id: "s3", title: "3. Создатель и творения" },
  { id: "s4", title: "4. Он создал Самого Себя?" },
  { id: "s5", title: "5. Почему Аллах назван Первым" },
  { id: "s6", title: "6. Не как человек" },
  { id: "s7", title: "7. Проверим вместе" },
  { id: "s8", title: "8. Ответ на карточке" },
];

// ---------- Реплики (канонический текст, ровно 42) ----------
export type L80Line = {
  readonly id: number; // 1 … 42 (только для производства, не озвучивается)
  readonly role: L80Speaker;
  readonly scene: L80SceneId;
  readonly text: string;
  readonly tag?: string; // аудиотег eleven_v3 (интонация), в звук не попадает
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
};

const L = (id: number, role: L80Speaker, scene: L80SceneId, text: string, tag?: string): L80Line => ({
  id,
  role,
  scene,
  text,
  ...(tag ? { tag } : {}),
});

export const L80_LINES: readonly L80Line[] = [
  // Сцена 1 — «А кто создал Аллаха?»
  L(1, "yusuf", "s1", "Лодочку сделал Амир. А Землю и Солнце создал Аллах."),
  L(2, "amir", "s1", "Да."),
  L(3, "yusuf", "s1", "А кто создал Аллаха?", "[curious]"),
  L(4, "muhammad", "s1", "Ты можешь спрашивать о том, что тебе непонятно. Давай разберёмся.", "[warmly]"),
  // Сцена 2 — «Прямой ответ»
  L(5, "muhammad", "s2", "Аллаха никто не создал. Он существовал всегда."),
  L(6, "yusuf", "s2", "Ещё до того, как появился наш дом?", "[curious]"),
  L(7, "muhammad", "s2", "Да. И до Земли, и до Солнца. У Аллаха нет начала."),
  L(8, "bilal", "s2", "То есть Он не появился в какой-то день?"),
  L(9, "muhammad", "s2", "Верно."),
  // Сцена 3 — «Создатель и творения»
  L(10, "amir", "s3", "Сначала у нас был лист бумаги. Потом я сложил лодочку."),
  L(11, "muhammad", "s3", "Да. У лодочки есть начало: ты её сложил."),
  L(12, "yusuf", "s3", "А у Аллаха тоже есть такое начало?", "[curious]"),
  L(13, "muhammad", "s3", "Нет. Аллах — Создатель. Он не является творением."),
  L(14, "bilal", "s3", "Творения — это то, что создал Аллах?"),
  L(15, "muhammad", "s3", "Да."),
  // Сцена 4 — «Он создал Самого Себя?»
  L(16, "amir", "s4", "Если Его никто не создал... Он создал Себя Сам?"),
  L(17, "muhammad", "s4", "Нет. Аллах не создавал Самого Себя. Он не начинал существовать."),
  L(18, "yusuf", "s4", "Он не появился, а был всегда?", "[curious]"),
  L(19, "muhammad", "s4", "Да. Он всегда существовал."),
  L(20, "bilal", "s4", "Значит, слова «Его никто не создал» не означают «Он Сам Себя сделал»."),
  L(21, "muhammad", "s4", "Верно."),
  // Сцена 5 — «Почему Аллах назван Первым»
  L(22, "bilal", "s5", "А откуда мы знаем, что у Аллаха нет начала?", "[curious]"),
  L(23, "muhammad", "s5", "Мы узнаём об Аллахе из Корана. В нём Он назван Первым."),
  L(24, "yusuf", "s5", "Первым... как я первым сел на ковёр?", "[curious]"),
  L(25, "muhammad", "s5", "В этом аяте слово «Первый» означает: до Аллаха ничего не было. У Него нет начала."),
  L(26, "amir", "s5", "А всё, что Он создал, — Его творения?"),
  L(27, "muhammad", "s5", "Да. Аллах не похож на Свои творения."),
  // Сцена 6 — «Не как человек»
  L(28, "yusuf", "s6", "А Аллах когда-нибудь был маленьким?", "[curious]"),
  L(29, "muhammad", "s6", "В суре «Аль-Ихляс» говорится, что Аллах не был рождён и нет никого равного Ему."),
  L(30, "amir", "s6", "Значит, Он не был ребёнком и не вырос, как мы?"),
  L(31, "muhammad", "s6", "Да. Аллах не похож на людей, птиц и растения. Мы узнаём о Нём то, чему учит Коран.", "[warmly]"),
  // Сцена 7 — «Проверим вместе»
  L(32, "muhammad", "s7", "Аллах — Создатель или творение?"),
  L(33, "amir", "s7", "Создатель."),
  L(34, "muhammad", "s7", "Аллах создал Самого Себя?"),
  L(35, "bilal", "s7", "Нет. Он не начинал существовать."),
  L(36, "muhammad", "s7", "Кто создал Аллаха?"),
  L(37, "yusuf", "s7", "Никто. Аллах существовал всегда."),
  L(38, "muhammad", "s7", "Верно. У Аллаха нет начала.", "[warmly]"),
  // Сцена 8 — «Ответ на карточке»
  L(39, "yusuf", "s8", "Амир, помоги записать: «Аллаха никто не создал. Он существовал всегда»."),
  L(40, "amir", "s8", "Готово."),
  L(41, "yusuf", "s8", "Теперь я знаю ответ на мой вопрос.", "[happy]"),
  L(42, "muhammad", "s8", "Мы можем спрашивать и вместе разбираться в том, чему учит Коран.", "[warmly]"),
];

export const lineById = (id: number): L80Line => {
  const l = L80_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

export const lineFile = (id: number) => `l${String(id).padStart(2, "0")}.mp3`;

// Точный текст карточки (две строки; точка после первого предложения, без точки в конце).
export const CARD_LINES: readonly [string, string] = ["Аллаха никто не создал.", "Он существовал всегда"];
export const CARD_TEXT = CARD_LINES.join(" ");

// Неброские подписи источников (одна строка, только в нужных сценах).
export const CAPTIONS = { first: "Смысл аята 57:3", ikhlas: "Смысл аятов 112:3–4" } as const;

// ---------- Зрительские паузы (после реплики, до следующей), секунды ----------
export type PauseId = "P1" | "P2" | "P3";
export const L80_PAUSES: readonly { readonly id: PauseId; readonly after: number; readonly sec: number }[] = [
  { id: "P1", after: 32, sec: 5 },
  { id: "P2", after: 34, sec: 5 },
  { id: "P3", after: 36, sec: 6 },
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
  // Сцена 1 — Юсуф придвигает лодочку, кладёт рядом рисунок Земли
  { kind: "hold", sec: 7.0, label: "лодочка и рисунок", scene: "s1" },
  { kind: "line", id: 1, gapAfter: 0.7 },
  { kind: "line", id: 2, gapAfter: 0.8 },
  { kind: "line", id: 3, gapAfter: 1.1 },
  { kind: "line", id: 4, gapAfter: 0.5 },
  { kind: "hold", sec: 2.2, label: "учитель наклоняется к Юсуфу" },
  // Сцена 2 — прямой ответ
  { kind: "line", id: 5, gapAfter: 1.3 },
  { kind: "line", id: 6, gapAfter: 0.7 },
  { kind: "line", id: 7, gapAfter: 1.0 },
  { kind: "line", id: 8, gapAfter: 0.6 },
  { kind: "line", id: 9, gapAfter: 0.4 },
  { kind: "hold", sec: 2.2, label: "Юсуф кивает" },
  // Сцена 3 — отдельный лист рядом с готовой лодочкой
  { kind: "hold", sec: 4.2, label: "Амир берёт лист", scene: "s3" },
  { kind: "line", id: 10, gapAfter: 0.7 },
  { kind: "line", id: 11, gapAfter: 0.9 },
  { kind: "line", id: 12, gapAfter: 0.7 },
  { kind: "line", id: 13, gapAfter: 0.8 },
  { kind: "hold", sec: 3.2, label: "росток и рисунок" },
  { kind: "line", id: 14, gapAfter: 0.6 },
  { kind: "line", id: 15, gapAfter: 0.5 },
  { kind: "hold", sec: 2.4, label: "класс слушает" },
  // Сцена 4 — «Он создал Себя Сам?»
  { kind: "hold", sec: 2.4, label: "Амир поднимает руку", scene: "s4" },
  { kind: "line", id: 16, gapAfter: 0.6 },
  { kind: "line", id: 17, gapAfter: 1.0 },
  { kind: "line", id: 18, gapAfter: 0.7 },
  { kind: "line", id: 19, gapAfter: 0.8 },
  { kind: "line", id: 20, gapAfter: 0.7 },
  { kind: "line", id: 21, gapAfter: 0.4 },
  { kind: "hold", sec: 2.4, label: "Юсуф слушает" },
  // Сцена 5 — книга на подставке, имя «Первый»
  { kind: "line", id: 22, gapAfter: 0.7 },
  { kind: "hold", sec: 6.8, label: "учитель берёт Коран" },
  { kind: "line", id: 23, gapAfter: 0.9 },
  { kind: "line", id: 24, gapAfter: 0.7 },
  { kind: "line", id: 25, gapAfter: 0.5 },
  { kind: "hold", sec: 2.0, label: "подпись: смысл аята" },
  { kind: "line", id: 26, gapAfter: 0.7 },
  { kind: "line", id: 27, gapAfter: 0.5 },
  { kind: "hold", sec: 2.2, label: "Билал смотрит на книгу" },
  // Сцена 6 — «Не как человек»
  { kind: "line", id: 28, gapAfter: 0.8 },
  { kind: "line", id: 29, gapAfter: 0.5 },
  { kind: "hold", sec: 2.0, label: "подпись: смысл аятов" },
  { kind: "line", id: 30, gapAfter: 0.8 },
  { kind: "line", id: 31, gapAfter: 0.5 },
  { kind: "hold", sec: 3.4, label: "дети слушают" },
  // Сцена 7 — три вопроса зрителю
  { kind: "hold", sec: 2.0, label: "учитель к классу", scene: "s7" },
  { kind: "line", id: 32, gapAfter: 0 },
  { kind: "pause", id: "P1" },
  { kind: "line", id: 33, gapAfter: 1.2 },
  { kind: "line", id: 34, gapAfter: 0 },
  { kind: "pause", id: "P2" },
  { kind: "line", id: 35, gapAfter: 1.2 },
  { kind: "line", id: 36, gapAfter: 0 },
  { kind: "pause", id: "P3" },
  { kind: "line", id: 37, gapAfter: 0.9 },
  { kind: "line", id: 38, gapAfter: 0.6 },
  { kind: "hold", sec: 3.0, label: "Юсуф придвигает карточку" },
  // Сцена 8 — ответ на карточке
  { kind: "line", id: 39, gapAfter: 0.4 },
  { kind: "hold", sec: 5.0, label: "письмо: начало" },
  { kind: "hold", sec: 3.4, label: "Юсуф смотрит, как пишет Амир" },
  { kind: "hold", sec: 3.2, label: "письмо: конец" },
  { kind: "line", id: 40, gapAfter: 0.5 },
  { kind: "hold", sec: 5.0, label: "готовая карточка" },
  { kind: "line", id: 41, gapAfter: 0.6 },
  { kind: "line", id: 42, gapAfter: 0.3 },
  { kind: "hold", sec: 4.6, label: "карточка в папку" },
  { kind: "hold", sec: 3.6, label: "финал: класс" },
];
