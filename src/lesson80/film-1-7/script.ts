// Урок 80-1 «Аллах — наш Создатель», мини-фильм 7 «Почему приходит утро?»
// (композиция Lesson80_1_7, 1920×1080, 30 к/с, ≈ 4:30).
//
// Юсуф (4) приносит два рисунка дома — днём и ночью — и спрашивает, не уходит
// ли Солнце спать. Учитель Мухаммад ставит на столик глобус и лампу: лампа
// изображает солнечный свет, глобус — Землю. Дети следят за меткой условного
// города: она уходит в тень, после зрительской паузы возвращается к свету,
// потом класс видит обе стороны сразу. Учитель своими словами передаёт смысл
// аята 3:190, задаёт три вопроса зрителю (с паузами), и Юсуф рисует Землю
// рядом со своим домом. Без музыки, рекламы и призывов подписаться.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.
// Общая библиотека серии (риг, класс, персонажи) — src/lesson80/.

import type { L80Role } from "../core/roles.ts";
export type { L80Role } from "../core/roles.ts";

export const FILM = {
  // Remotion не допускает «_» в идентификаторе композиции, поэтому
  // рабочее название Lesson80_1_7 записано через дефисы (как у 80-1-6).
  id: "Lesson80-1-7",
  productionId: "80-1-7",
  title: "Почему приходит утро?",
  output: "lesson-80-1-7",
  voiceDir: "lesson-80-1-7/audio",
  width: 1920,
  height: 1080,
  fps: 30,
  // допустимая длительность 4:10–5:00, ориентир 4:30
  minSec: 250,
  targetSec: 270,
  maxSec: 300,
} as const;

// Говорящие роли фильма (без групповой реплики).
export type L80Speaker = Exclude<L80Role, "kids">;

export const L80_TTS = {
  modelId: "eleven_v3",
  languageCode: "ru",
  seed: 807,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
  // версия хэша реплики для провайдеров без seed (OpenAI, RHVoice)
  version: 1,
} as const;

// Голоса по ролям для каждого провайдера. Провайдер выбирается скриптом
// озвучки по доступным ключам: ElevenLabs → OpenAI → RHVoice (офлайн).
// Ни один провайдер не меняет высоту тона и не ускоряет речь: возраст
// передаётся выбором тембра и манерой речи.
//   • ElevenLabs — набор по голосовой лаборатории
//     (voice-samples/lesson-80-1-7/report.json, замер основного тона и
//     разборчивости MMS): учитель — George, тёплый разговорный мужской голос
//     (≈ 134 Гц); Юсуф — готовый светлый детский голос проекта KG-son
//     (≈ 308 Гц, самый высокий); Амир — Sarah (≈ 232 Гц); Билал — Jessica
//     (≈ 190 Гц): голос старшего мальчика до ломки голоса, выше учителя и
//     ниже младших. Мужские голоса библиотеки (Liam, Will, Chris ≈ 120–130 Гц)
//     звучат ниже учителя и для одиннадцатилетнего не подходят. Первая
//     дорожка (Eric / Jessica / Alice / Liam) осталась в истории ветки.
//   • RHVoice: те же голоса, что в 80-1-6 (Aleksandr-hq, Anna, Elena,
//     Arina), но без сдвига тона (pitch 0): по замеру Anna ≈ 232 Гц,
//     Elena ≈ 225 Гц, Arina ≈ 198 Гц, Aleksandr-hq ≈ 152 Гц.
export type VoiceSpec = {
  readonly elevenlabs: { readonly name: string; readonly voiceId: string };
  readonly openai: { readonly voice: string; readonly instructions: string };
  readonly rhvoice: { readonly voice: string; readonly pitch: number; readonly rate: number };
};

const RU = "Говорит по-русски естественно, без акцента, ровным темпом. Только текст реплики.";

export const VOICES: Record<L80Speaker, VoiceSpec> = {
  muhammad: {
    elevenlabs: { name: "George", voiceId: "JBFqnCBsd6RMkjVDRZzb" },
    openai: { voice: "ash", instructions: `Тёплый, спокойный голос доброго учителя 30–35 лет, разговаривающего с детьми; без дикторского нажима. ${RU}` },
    rhvoice: { voice: "Aleksandr-hq", pitch: 0, rate: -0.1 },
  },
  yusuf: {
    elevenlabs: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
    openai: { voice: "coral", instructions: `Любознательный мальчик четырёх лет: маленький мягкий голос, короткие фразы, искренность, без писка и карикатуры. ${RU}` },
    rhvoice: { voice: "Anna", pitch: 0, rate: -0.12 },
  },
  amir: {
    elevenlabs: { name: "Sarah", voiceId: "EXAVITQu4vr4xnSDxMaL" },
    openai: { voice: "nova", instructions: `Спокойный наблюдательный мальчик восьми лет, чуть увереннее младшего, без соревнования. ${RU}` },
    rhvoice: { voice: "Elena", pitch: 0, rate: -0.06 },
  },
  bilal: {
    elevenlabs: { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9" },
    openai: { voice: "sage", instructions: `Внимательный думающий мальчик одиннадцати лет: голос старшего ребёнка, ещё не взрослый, без лекционного тона. ${RU}` },
    rhvoice: { voice: "Arina", pitch: 0, rate: -0.04 },
  },
};

// Предпочтительный набор ElevenLabs по замерам лаборатории (основной тон
// убывает с возрастом: Юсуф ≈ 308 Гц, Амир ≈ 232 Гц, Билал ≈ 190 Гц,
// учитель ≈ 134 Гц). Применить при пополненной квоте.
export const L80_PREFERRED_VOICES: Record<L80Speaker, { readonly name: string; readonly voiceId: string }> = {
  muhammad: { name: "George", voiceId: "JBFqnCBsd6RMkjVDRZzb" },
  yusuf: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
  amir: { name: "Sarah", voiceId: "EXAVITQu4vr4xnSDxMaL" },
  bilal: { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9" },
};

// Кандидаты голосовой лаборатории (премейд-голоса ElevenLabs и готовые
// голоса проекта); образцы синтезируются в CI и прикладываются артефактом.
export const L80_LAB_CANDIDATES: readonly { readonly name: string; readonly voiceId: string; readonly forRole: L80Speaker }[] = [
  { name: "Eric", voiceId: "cjVigY5qzO86Huf0OWal", forRole: "muhammad" },
  { name: "George", voiceId: "JBFqnCBsd6RMkjVDRZzb", forRole: "muhammad" },
  { name: "Brian", voiceId: "nPczCjzI2devNBz1zQrb", forRole: "muhammad" },
  { name: "Daniel", voiceId: "onwK4e9ZLuTAKqWW03F9", forRole: "muhammad" },
  { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9", forRole: "yusuf" },
  { name: "Lily", voiceId: "pFZP5JQG7iQjIQuC4Bku", forRole: "yusuf" },
  { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM", forRole: "yusuf" },
  { name: "Alice", voiceId: "Xb7hH8MSUJpSbSDYk0k2", forRole: "amir" },
  { name: "Laura", voiceId: "FGY2WhTYpPnrIDTdsKH5", forRole: "amir" },
  { name: "Sarah", voiceId: "EXAVITQu4vr4xnSDxMaL", forRole: "amir" },
  { name: "Liam", voiceId: "TX3LPaxmHKxFdv7VOQHJ", forRole: "bilal" },
  { name: "Will", voiceId: "bIHbv24MWmeRgasZH58o", forRole: "bilal" },
  { name: "Chris", voiceId: "iP95p4xoKVk53GoZ742B", forRole: "bilal" },
];

// Образцы для лаборатории: по одной характерной реплике роли.
export const L80_LAB_SAMPLE: Record<L80Speaker, string> = {
  muhammad: "Это глобус — маленькая модель Земли. Её свет будет изображать солнечный свет.",
  yusuf: "Ночью Солнце уходит спать? А утром просыпается?",
  amir: "Она снова попадёт на свет! А стрелкой покажем, как она вращается.",
  bilal: "Значит, Земля вращается, а Солнце каждую ночь не гаснет.",
};

// ---------- Сцены ----------
export type L80SceneId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8";

export const L80_SCENES: readonly { readonly id: L80SceneId; readonly title: string }[] = [
  { id: "s1", title: "1. Солнце уходит спать?" },
  { id: "s2", title: "2. Глобус и лампа" },
  { id: "s3", title: "3. Как наступает ночь" },
  { id: "s4", title: "4. Утро возвращается" },
  { id: "s5", title: "5. Где-то день, где-то ночь" },
  { id: "s6", title: "6. О чём напоминает Коран" },
  { id: "s7", title: "7. Проверим вместе" },
  { id: "s8", title: "8. Рисунок стал понятнее" },
];

// ---------- Реплики (утверждённый текст, ровно 44) ----------
export type L80Line = {
  readonly id: number; // 1 … 44 (только для производства, не озвучивается)
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
  L(1, "yusuf", "s1", "Это наш дом днём. А это — ночью."),
  L(2, "muhammad", "s1", "Что тебе хочется узнать?", "[warmly]"),
  L(3, "yusuf", "s1", "Ночью Солнце уходит спать? А утром просыпается?", "[curious]"),
  L(4, "amir", "s1", "А куда оно исчезает?", "[curious]"),
  L(5, "muhammad", "s1", "Давайте посмотрим, почему у нас сменяются день и ночь."),
  L(6, "muhammad", "s2", "Это глобус — маленькая модель Земли."),
  L(7, "yusuf", "s2", "Здесь наш дом?", "[curious]"),
  L(8, "muhammad", "s2", "Наш город отмечен точкой. Дом слишком маленький, чтобы его увидеть."),
  L(9, "bilal", "s2", "А для чего лампа?"),
  L(10, "muhammad", "s2", "Её свет будет изображать солнечный свет. Модель помогает нам разобраться."),
  L(11, "muhammad", "s3", "Посмотрите на точку: сюда сейчас падает свет."),
  L(12, "yusuf", "s3", "В нашем городе день!", "[happy]"),
  L(13, "muhammad", "s3", "Теперь я медленно поверну глобус."),
  L(14, "amir", "s3", "Точка оказалась на другой стороне. Теперь здесь ночь."),
  L(15, "yusuf", "s3", "Но лампа всё ещё светит!", "[surprised]"),
  L(16, "muhammad", "s3", "Верно. Когда наша часть Земли поворачивается от Солнца, у нас наступает ночь."),
  L(17, "muhammad", "s4", "Земля продолжает вращаться. Что случится с нашей точкой, если я поверну глобус дальше?"),
  L(18, "amir", "s4", "Она снова попадёт на свет!"),
  L(19, "yusuf", "s4", "Вот оно, утро!", "[happy]"),
  L(20, "muhammad", "s4", "Да. Когда наше место поворачивается к Солнцу, у нас начинается утро."),
  L(21, "bilal", "s4", "Значит, Земля вращается, а Солнце каждую ночь не гаснет."),
  L(22, "muhammad", "s4", "Правильно."),
  L(23, "bilal", "s5", "А везде на Земле ночь наступает одновременно?", "[curious]"),
  L(24, "muhammad", "s5", "Нет. Посмотрите: одна сторона освещена, другая — нет."),
  L(25, "amir", "s5", "Значит, у нас ночь, а где-то сейчас день?"),
  L(26, "muhammad", "s5", "Да. Пока Земля вращается, разные места по очереди оказываются на свету."),
  L(27, "muhammad", "s6", "Теперь мы знаем, как день сменяется ночью."),
  L(28, "bilal", "s6", "А как это связано с нашим уроком о Создателе?"),
  L(29, "muhammad", "s6", "Коран учит замечать в сотворении небес и Земли и смене ночи и дня знамения для размышляющих людей."),
  L(30, "yusuf", "s6", "А что такое знамения?", "[curious]"),
  L(31, "muhammad", "s6", "То, что помогает задуматься о Создателе. Аллах создал Землю и Солнце. Мы можем узнавать, как устроен Его мир."),
  L(32, "amir", "s6", "И задавать вопросы?"),
  L(33, "muhammad", "s6", "Да. Внимательно смотреть, спрашивать и размышлять.", "[warmly]"),
  L(34, "muhammad", "s7", "Почему у нас наступает ночь?"),
  L(35, "bilal", "s7", "Наше место на Земле поворачивается от Солнца."),
  L(36, "muhammad", "s7", "Солнце каждую ночь перестаёт светить?"),
  L(37, "yusuf", "s7", "Нет! Оно продолжает светить."),
  L(38, "muhammad", "s7", "Кто создал Землю и Солнце?"),
  L(39, "amir", "s7", "Аллах."),
  L(40, "muhammad", "s7", "Хорошо. Мы заметили смену дня и ночи и узнали, как она происходит.", "[warmly]"),
  L(41, "yusuf", "s8", "Я нарисую рядом Землю. Вот наш город на свету."),
  L(42, "amir", "s8", "А стрелкой покажем, как она вращается."),
  L(43, "yusuf", "s8", "Теперь понятно: Солнце светит, а Земля поворачивается!", "[happy]"),
  L(44, "muhammad", "s8", "Вы внимательно посмотрели и нашли ответ. Альхамдулиллях!", "[warmly]"),
];

export const lineById = (id: number): L80Line => {
  const l = L80_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

export const lineFile = (id: number) => `l${String(id).padStart(2, "0")}.mp3`;

// ---------- Зрительские паузы (после реплики, до следующей), секунды ----------
export type PauseId = "P1" | "P2" | "P3" | "P4";
export const L80_PAUSES: readonly { readonly id: PauseId; readonly after: number; readonly sec: number }[] = [
  { id: "P1", after: 17, sec: 6 },
  { id: "P2", after: 34, sec: 5 },
  { id: "P3", after: 36, sec: 5 },
  { id: "P4", after: 38, sec: 6 },
];

// ---------- Монтажная последовательность ----------
// Фильм собирается как цепочка «ударов»: реплика (её длительность — из
// файла озвучки) и действия с фиксированной длительностью. Абсолютные
// времена вычисляются в timeline.ts по измеренному аудио.
export type L80Beat =
  | { readonly kind: "line"; readonly id: number; readonly gapAfter?: number }
  | { readonly kind: "hold"; readonly sec: number; readonly label: string; readonly scene?: L80SceneId }
  // поворот глобуса: угол метки (градусы, азимут от направления на лампу)
  | { readonly kind: "spin"; readonly sec: number; readonly to: number; readonly label: string; readonly view: "side" | "top" }
  // поворот, конец которого привязан к репликe: метка пересекает `cross`
  // ровно в начале реплики `syncLine`; поворот продолжается до `to`
  | { readonly kind: "spinSync"; readonly sec: number; readonly to: number; readonly cross: number; readonly syncLine: number; readonly label: string }
  | { readonly kind: "pause"; readonly id: PauseId };

// Азимут метки φ (градусы): 0° — полдень (точка смотрит на лампу),
// 90° — вечерняя граница света (закат), 180° — полночь, 270° — утренняя
// граница (восход). Увеличение φ — вращение с запада на восток.
export const L80_PHI = {
  start: 315, // сцены 2–3: метка освещена, правее центра кадра
  night1: 480, // 120°: ясно в тени (конец сцены 3, пауза P1)
  sunrise: 630, // 270°: вход в прямой свет («Вот оно, утро!»)
  morning: 662, // остановка после восхода (реплики 20–22)
  night2: 945, // 225°: ночная метка для сцен 5–7
} as const;

export const L80_BEATS: readonly L80Beat[] = [
  // Сцена 1
  { kind: "hold", sec: 4.8, label: "два рисунка", scene: "s1" },
  { kind: "line", id: 1, gapAfter: 0.7 },
  { kind: "line", id: 2, gapAfter: 0.6 },
  { kind: "line", id: 3, gapAfter: 0.8 },
  { kind: "line", id: 4, gapAfter: 0.6 },
  { kind: "line", id: 5, gapAfter: 0.4 },
  { kind: "hold", sec: 2.6, label: "жест к столику" },
  // Сцена 2
  { kind: "hold", sec: 6.0, label: "учитель ставит глобус", scene: "s2" },
  { kind: "line", id: 6, gapAfter: 0.7 },
  { kind: "line", id: 7, gapAfter: 0.6 },
  { kind: "line", id: 8, gapAfter: 1.0 },
  { kind: "line", id: 9, gapAfter: 0.6 },
  { kind: "line", id: 10, gapAfter: 0.8 },
  { kind: "hold", sec: 1.6, label: "рука к выключателю" },
  { kind: "hold", sec: 3.6, label: "лампа включена" },
  { kind: "hold", sec: 3.8, label: "Амир прикрывает занавеску" },
  { kind: "hold", sec: 5.2, label: "наблюдение модели" },
  // Сцена 3
  { kind: "line", id: 11, gapAfter: 0.6 },
  { kind: "line", id: 12, gapAfter: 0.7 },
  { kind: "line", id: 13, gapAfter: 0.4 },
  { kind: "hold", sec: 0.9, label: "рука к глобусу", scene: "s3" },
  { kind: "spin", sec: 9.6, to: 480, label: "метка уходит в ночь", view: "top" },
  { kind: "hold", sec: 1.2, label: "метка в тени" },
  { kind: "line", id: 14, gapAfter: 0.7 },
  { kind: "line", id: 15, gapAfter: 0.7 },
  { kind: "line", id: 16, gapAfter: 0.6 },
  { kind: "hold", sec: 3.0, label: "ночная метка" },
  // Сцена 4
  { kind: "line", id: 17, gapAfter: 0 },
  { kind: "pause", id: "P1" },
  { kind: "line", id: 18, gapAfter: 0.5 },
  { kind: "spinSync", sec: 7.8, to: 662, cross: 630, syncLine: 19, label: "метка возвращается к свету" },
  { kind: "line", id: 20, gapAfter: 0.5 },
  { kind: "hold", sec: 3.2, label: "метка на свету" },
  { kind: "line", id: 21, gapAfter: 0.6 },
  { kind: "line", id: 22, gapAfter: 0.4 },
  { kind: "hold", sec: 1.0, label: "рука к глобусу" },
  { kind: "spin", sec: 10.4, to: 945, label: "ещё поворот до ночи", view: "top" },
  { kind: "hold", sec: 3.0, label: "модель остановлена" },
  // Сцена 5
  { kind: "line", id: 23, gapAfter: 0.6 },
  { kind: "line", id: 24, gapAfter: 1.6 },
  { kind: "line", id: 25, gapAfter: 0.6 },
  { kind: "line", id: 26, gapAfter: 0.6 },
  { kind: "hold", sec: 5.2, label: "две стороны" },
  // Сцена 6
  { kind: "hold", sec: 3.0, label: "Амир открывает занавеску", scene: "s6" },
  { kind: "line", id: 27, gapAfter: 0.6 },
  { kind: "line", id: 28, gapAfter: 0.8 },
  { kind: "line", id: 29, gapAfter: 1.1 },
  { kind: "line", id: 30, gapAfter: 0.6 },
  { kind: "line", id: 31, gapAfter: 0.9 },
  { kind: "line", id: 32, gapAfter: 0.5 },
  { kind: "line", id: 33, gapAfter: 0.6 },
  { kind: "hold", sec: 3.6, label: "класс слушает" },
  // Сцена 7
  { kind: "hold", sec: 1.2, label: "учитель к классу", scene: "s7" },
  { kind: "line", id: 34, gapAfter: 0 },
  { kind: "pause", id: "P2" },
  { kind: "line", id: 35, gapAfter: 0.9 },
  { kind: "line", id: 36, gapAfter: 0 },
  { kind: "pause", id: "P3" },
  { kind: "line", id: 37, gapAfter: 0.9 },
  { kind: "line", id: 38, gapAfter: 0 },
  { kind: "pause", id: "P4" },
  { kind: "line", id: 39, gapAfter: 0.7 },
  { kind: "line", id: 40, gapAfter: 0.6 },
  { kind: "hold", sec: 2.6, label: "Юсуф берёт лист" },
  // Сцена 8
  { kind: "hold", sec: 4.2, label: "первый круг", scene: "s8" },
  { kind: "line", id: 41, gapAfter: 0.9 },
  { kind: "line", id: 42, gapAfter: 0.9 },
  { kind: "line", id: 43, gapAfter: 0.8 },
  { kind: "line", id: 44, gapAfter: 0 },
  { kind: "hold", sec: 4.8, label: "финал: рисунки и класс" },
];
