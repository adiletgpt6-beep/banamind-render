// Урок 80-1 «Аллах — наш Создатель», мини-фильм 10 «Наш общий плакат»
// (композиция Lesson80-1-10, 1920×1080, 30 к/с, ориентир 4:00).
//
// Учитель Мухаммад и 25 мальчиков делают общий плакат: каждый рисует свою
// карточку (Юсуф — яблоко, Амир — дерево, Билал — новую Землю, ещё 22 —
// природу). Три спокойных вопроса вспоминают мысли урока: Аллах — наш
// Создатель, Он Един, у Него нет начала (зрительские паузы по 5 с). У
// бумажной лодочки Амира разгибается один уголок: Юсуф волнуется, Амир
// спокойно помогает восстановить прежний сгиб (четвёртая пауза — «Как можно
// помочь?»). Лодочку дорисовывают на карточке Амира с подписью «Лодочку
// сложил Амир», класс собирает плакат, учитель закрепляет его на доске.
// Аллах не изображается и не озвучивается. Музыки, рекламы и призывов нет.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки, тесты
// и проверки. Общая библиотека серии (риг, класс, персонажи) — src/lesson80/.

import type { L80Role } from "../core/roles.ts";
export type { L80Role } from "../core/roles.ts";

export const FILM = {
  // Remotion не допускает «_» в идентификаторе композиции: Lesson80_1_10 → дефисы.
  id: "Lesson80-1-10",
  // идентификатор композиции в Remotion (в задании — Lesson80_1_10_OurCommonPoster;
  // Remotion допускает только дефисы)
  composition: "Lesson80-1-10-OurCommonPoster",
  productionId: "80-1-10",
  title: "Наш общий плакат",
  output: "lesson-80-1-10-our-common-poster",
  voiceDir: "lesson-80-1-10/audio",
  width: 1920,
  height: 1080,
  fps: 30,
  // допустимая длительность 3:40–4:20, ориентир 4:00
  minSec: 220,
  targetSec: 240,
  maxSec: 260,
} as const;

// Говорящие роли фильма: четыре голоса, групповых реплик нет.
export type L80Speaker = Exclude<L80Role, "kids">;

export const L80_TTS = {
  modelId: "eleven_v3",
  languageCode: "ru",
  seed: 820,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
  // версия хэша реплики для провайдеров без seed (OpenAI, RHVoice, Piper)
  version: 1,
} as const;

// Голоса по ролям — тот же набор, что в 80-1-9 (лаборатория голосов 80-1-7,
// упорядочены по возрасту по основному тону): учитель — Eric, Юсуф (4) —
// KG-son, Амир (8) — Alice, Билал (11) — Jessica (ниже Амира, но не взрослый
// баритон). Ни один провайдер не меняет высоту тона и не ускоряет речь.
// RHVoice — только резервная офлайн-дорожка (с пометкой в манифесте).
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
    openai: { voice: "ash", instructions: `Тёплый, спокойный голос доброго учителя 30–35 лет, разговаривающего с детьми в небольшой комнате; без дикторского нажима. ${RU}` },
    rhvoice: { voice: "Aleksandr-hq", pitch: 0, rate: -0.1 },
    piper: { voice: "dmitri", speed: 0.76 },
  },
  yusuf: {
    elevenlabs: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
    openai: { voice: "coral", instructions: `Мальчик четырёх лет: маленький мягкий голос, простые живые интонации, без писка и карикатуры. ${RU}` },
    rhvoice: { voice: "Anna", pitch: 0, rate: -0.12 },
    piper: { voice: "irina", speed: 0.74 },
  },
  amir: {
    elevenlabs: { name: "Alice", voiceId: "Xb7hH8MSUJpSbSDYk0k2" },
    openai: { voice: "nova", instructions: `Уверенный дружелюбный мальчик восьми лет, помогает младшему спокойно, без превосходства. ${RU}` },
    rhvoice: { voice: "Elena", pitch: 0, rate: -0.06 },
    piper: { voice: "denis", speed: 0.78 },
  },
  bilal: {
    elevenlabs: { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9" },
    openai: { voice: "sage", instructions: `Спокойный вдумчивый мальчик одиннадцати лет: голос старшего ребёнка, ещё не взрослый, без лекционного тона. ${RU}` },
    rhvoice: { voice: "Arina", pitch: 0, rate: -0.04 },
    piper: { voice: "ruslan", speed: 0.78 },
  },
};

// ---------- Сцены ----------
export type L80SceneId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8";

export const L80_SCENES: readonly { readonly id: L80SceneId; readonly title: string }[] = [
  { id: "s1", title: "1. Каждый добавит свой рисунок" },
  { id: "s2", title: "2. Кто наш Создатель?" },
  { id: "s3", title: "3. Один Создатель" },
  { id: "s4", title: "4. Вопрос, который мы уже обсуждали" },
  { id: "s5", title: "5. Лодочка и человеческий труд" },
  { id: "s6", title: "6. Можно помочь" },
  { id: "s7", title: "7. Общий плакат" },
  { id: "s8", title: "8. Теперь готово!" },
];

// ---------- Реплики (канонический текст, ровно 44) ----------
export type L80Line = {
  readonly id: number; // 1 … 44 (только для производства, не озвучивается)
  readonly role: L80Speaker;
  readonly scene: L80SceneId;
  readonly text: string; // канонический текст (субтитры, проверка манифеста)
  readonly tag?: string; // аудиотег eleven_v3 (интонация), в звук не попадает
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
  readonly takes?: number; // сколько дублей синтезировать (лучший — по распознаванию MMS)
};

const L = (id: number, role: L80Speaker, scene: L80SceneId, text: string, tag?: string, takes = 2, seed?: number): L80Line => ({
  id,
  role,
  scene,
  text,
  ...(tag ? { tag } : {}),
  ...(seed ? { seed } : {}),
  takes,
});

// Дубли: по умолчанию два на реплику (лучший — по распознаванию MMS); три и
// свой seed — для коротких реплик и реплик с ключевыми словами урока
// («Аллах», «Создатель», «Единый», «Первым», «Альхамдулиллях»): у коротких
// реплик и арабских слов первый дубль чаще звучит неразборчиво.
export const L80_LINES: readonly L80Line[] = [
  // Сцена 1 — «Каждый добавит свой рисунок»
  L(1, "muhammad", "s1", "Сегодня сделаем общий плакат. Каждый добавит свой рисунок.", "[warmly]"),
  L(2, "yusuf", "s1", "Я нарисую яблоко!", "[happy]", 3, 1002),
  L(3, "amir", "s1", "А я — дерево.", undefined, 3, 1003),
  L(4, "bilal", "s1", "У меня будет Земля."),
  L(5, "muhammad", "s1", "Хорошо. Расскажем рисунками о том, что узнали.", "[warmly]"),
  // Сцена 2 — «Кто наш Создатель?»
  L(6, "muhammad", "s2", "Посмотрите на Землю, дерево, яблоко. Кто создал природу и нас с вами?"),
  L(7, "yusuf", "s2", "Аллах!", undefined, 3, 1007),
  L(8, "muhammad", "s2", "Да. В Коране говорится: «Аллах — Творец всякой вещи».", undefined, 3, 1008),
  L(9, "amir", "s2", "И нас тоже создал Аллах."),
  L(10, "muhammad", "s2", "Поэтому назовём плакат: «Аллах — наш Создатель».", undefined, 3, 1010),
  // Сцена 3 — «Один Создатель»
  L(11, "bilal", "s3", "Земля, птица, человек — такие разные!"),
  L(12, "muhammad", "s3", "А сколько у них Создателей? Подумайте и ответьте."),
  L(13, "amir", "s3", "Один!", undefined, 3, 1013),
  L(14, "muhammad", "s3", "Верно. Аллах Един. В Коране сказано: «Он — Аллах Единый».", undefined, 3, 1014),
  // Сцена 4 — «Вопрос, который мы уже обсуждали»
  L(15, "yusuf", "s4", "Я помню ещё один вопрос!", "[happy]"),
  L(16, "muhammad", "s4", "Хочешь напомнить его нам?", "[warmly]"),
  L(17, "yusuf", "s4", "А кто создал Аллаха?", "[curious]", 3, 1017),
  L(18, "muhammad", "s4", "Вы тоже вспомните ответ.", "[warmly]"),
  L(19, "yusuf", "s4", "Аллаха никто не создал. Он существовал всегда.", undefined, 3, 1019),
  L(20, "muhammad", "s4", "Правильно. У Аллаха нет начала. В Коране Он назван Первым.", undefined, 3, 1020),
  L(21, "bilal", "s4", "Значит, до Него ничего не было."),
  L(22, "muhammad", "s4", "Да.", undefined, 3, 1022),
  // Сцена 5 — «Лодочка и человеческий труд»
  L(23, "yusuf", "s5", "Лодочку тоже нарисуем?", "[curious]"),
  L(24, "amir", "s5", "Конечно! Я её сложил.", "[happy]"),
  L(25, "yusuf", "s5", "А ты тоже Создатель?", "[curious]", 3, 1025),
  L(26, "muhammad", "s5", "Амир сделал лодочку из готовой бумаги. Люди делают вещи из уже существующих материалов."),
  L(27, "bilal", "s5", "А нас и всё, из чего мы делаем вещи, создал Аллах."),
  L(28, "amir", "s5", "На рисунке подпишем: «Лодочку сложил Амир»."),
  // Сцена 6 — «Можно помочь»
  L(29, "yusuf", "s6", "Ой, уголок разогнулся! Я испортил лодочку?"),
  L(30, "amir", "s6", "Сейчас посмотрим.", undefined, 3, 1030),
  L(31, "muhammad", "s6", "Как можно помочь Юсуфу?"),
  L(32, "amir", "s6", "Вот этот край нужно снова согнуть. Держи лодочку, а я поправлю."),
  L(33, "yusuf", "s6", "Вот так?", "[curious]", 3, 1033),
  L(34, "amir", "s6", "Да. Теперь она снова держит форму."),
  // Сцена 7 — «Общий плакат»
  L(35, "yusuf", "s7", "Спасибо, Амир!", "[happy]", 3, 1035),
  L(36, "amir", "s7", "Теперь вместе нарисуем её рядом с деревом."),
  L(37, "bilal", "s7", "Рисунки готовы. Можно собирать плакат."),
  L(38, "muhammad", "s7", "Вы внимательно смотрели, вспоминали и помогали друг другу.", "[warmly]"),
  L(39, "yusuf", "s7", "Альхамдулиллях! Это значит: «Хвала Аллаху».", undefined, 3, 1039),
  // Сцена 8 — «Теперь готово!»
  L(40, "muhammad", "s8", "Смотрите, каждый добавил что-то своё.", "[warmly]"),
  L(41, "yusuf", "s8", "Рисунки сделали мы. А наш Создатель — Аллах.", undefined, 3, 1041),
  L(42, "amir", "s8", "Он Един.", undefined, 3, 1042),
  L(43, "bilal", "s8", "У Него нет начала.", undefined, 3, 1043),
  L(44, "yusuf", "s8", "Вот теперь плакат готов!", "[happy]"),
];

export const lineById = (id: number): L80Line => {
  const l = L80_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

export const lineFile = (id: number) => `l${String(id).padStart(2, "0")}.mp3`;

// ---------- Надписи плаката (точный текст) ----------
export const POSTER_TEXT = {
  title: "Аллах — наш Создатель",
  one: "Аллах Един",
  noBeginning: "У Аллаха нет начала",
  boatCaption: "Лодочку сложил Амир",
} as const;

// Небольшое название фильма поверх вводного общего плана.
// Небольшое название поверх первого общего плана. Заголовок плаката
// («Аллах — наш Создатель») здесь не показывается: это ответ паузы 1.
export const FILM_TITLE_CARD = { title: "Наш общий плакат", sub: "Мини-фильм 10 · 80-1-10" } as const;

// ---------- Зрительские паузы (после реплики, до следующей), секунды ----------
// Ровно четыре паузы по 5 с (150 кадров): от кадра полного окончания звука
// вопроса до кадра первого звука ответа.
export type PauseId = "pause01" | "pause02" | "pause03" | "pause04";
export const L80_PAUSES: readonly { readonly id: PauseId; readonly after: number; readonly sec: number }[] = [
  { id: "pause01", after: 6, sec: 5 },
  { id: "pause02", after: 12, sec: 5 },
  { id: "pause03", after: 18, sec: 5 },
  { id: "pause04", after: 31, sec: 5 },
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
  // Сцена 1 — учитель расправляет большой лист, раздаёт карточки, дети берут карандаши и рисуют
  { kind: "hold", sec: 4.2, label: "общий план: лист", scene: "s1" },
  { kind: "line", id: 1, gapAfter: 0.4 },
  { kind: "hold", sec: 3.4, label: "карточки каждому" },
  { kind: "line", id: 2, gapAfter: 0.4 },
  { kind: "line", id: 3, gapAfter: 0.4 },
  { kind: "line", id: 4, gapAfter: 0.5 },
  { kind: "line", id: 5, gapAfter: 0.4 },
  { kind: "hold", sec: 2.0, label: "рисует Юсуф" },
  { kind: "hold", sec: 1.8, label: "рисует Амир" },
  { kind: "hold", sec: 1.8, label: "рисует Билал" },
  { kind: "hold", sec: 2.2, label: "класс рисует" },
  // Сцена 2 — три рисунка на листе; вопрос; заголовок
  { kind: "hold", sec: 2.0, label: "рисунки готовы", scene: "s2" },
  { kind: "hold", sec: 3.4, label: "три рисунка на лист" },
  { kind: "line", id: 6, gapAfter: 0 },
  { kind: "pause", id: "pause01" },
  { kind: "line", id: 7, gapAfter: 0.6 },
  { kind: "line", id: 8, gapAfter: 0.6 },
  { kind: "line", id: 9, gapAfter: 0.5 },
  { kind: "line", id: 10, gapAfter: 0.2 },
  { kind: "hold", sec: 2.8, label: "заголовок пишется" },
  { kind: "hold", sec: 2.6, label: "заголовок готов" },
  // Сцена 3 — птица от ученика; сколько Создателей; карточка «Аллах Един»
  { kind: "hold", sec: 3.4, label: "птица от ученика", scene: "s3" },
  { kind: "line", id: 11, gapAfter: 0.6 },
  { kind: "line", id: 12, gapAfter: 0 },
  { kind: "pause", id: "pause02" },
  { kind: "line", id: 13, gapAfter: 0.5 },
  { kind: "line", id: 14, gapAfter: 0.3 },
  { kind: "hold", sec: 3.6, label: "карточка «Аллах Един»" },
  { kind: "hold", sec: 1.4, label: "рассматривают рисунки" },
  // Сцена 4 — закрытая папка «Наши вопросы»; карточка «У Аллаха нет начала»
  { kind: "hold", sec: 3.0, label: "Юсуф и папка", scene: "s4" },
  { kind: "line", id: 15, gapAfter: 0.5 },
  { kind: "line", id: 16, gapAfter: 0.4 },
  { kind: "line", id: 17, gapAfter: 0.6 },
  { kind: "line", id: 18, gapAfter: 0 },
  { kind: "pause", id: "pause03" },
  { kind: "line", id: 19, gapAfter: 0.6 },
  { kind: "line", id: 20, gapAfter: 0.6 },
  { kind: "line", id: 21, gapAfter: 0.4 },
  { kind: "line", id: 22, gapAfter: 0.3 },
  { kind: "hold", sec: 3.8, label: "карточка «У Аллаха нет начала»" },
  // Сцена 5 — лодочка Амира рядом с карточкой дерева
  { kind: "hold", sec: 3.2, label: "лодочка к карточке", scene: "s5" },
  { kind: "line", id: 23, gapAfter: 0.4 },
  { kind: "line", id: 24, gapAfter: 0.5 },
  { kind: "line", id: 25, gapAfter: 0.6 },
  { kind: "line", id: 26, gapAfter: 0.6 },
  { kind: "line", id: 27, gapAfter: 0.6 },
  { kind: "line", id: 28, gapAfter: 0.4 },
  { kind: "hold", sec: 2.0, label: "свободное место на карточке" },
  // Сцена 6 — уголок разогнулся; пауза; непрерывное исправление сгиба
  { kind: "hold", sec: 3.6, label: "Юсуф берёт лодочку", scene: "s6" },
  { kind: "line", id: 29, gapAfter: 0.4 },
  { kind: "hold", sec: 1.2, label: "Амир садится рядом" },
  { kind: "line", id: 30, gapAfter: 0.4 },
  { kind: "line", id: 31, gapAfter: 0 },
  { kind: "pause", id: "pause04" },
  { kind: "line", id: 32, gapAfter: 0.4 },
  { kind: "line", id: 33, gapAfter: 0.3 },
  { kind: "hold", sec: 2.4, label: "Амир возвращает уголок" },
  { kind: "line", id: 34, gapAfter: 0.3 },
  { kind: "hold", sec: 1.8, label: "лодочка держит форму" },
  { kind: "hold", sec: 1.6, label: "спокойные лица" },
  // Сцена 7 — благодарность; лодочка на карточке Амира; сборка плаката
  { kind: "line", id: 35, gapAfter: 0.3 },
  { kind: "hold", sec: 0.8, label: "Амир улыбается" },
  { kind: "line", id: 36, gapAfter: 0.3 },
  { kind: "hold", sec: 5.0, label: "рисуем лодочку" },
  { kind: "hold", sec: 3.2, label: "подпись под лодочкой" },
  { kind: "hold", sec: 1.5, label: "карточка Амира" },
  { kind: "line", id: 37, gapAfter: 0.4 },
  { kind: "hold", sec: 6.6, label: "сборка: карточки передают" },
  { kind: "line", id: 38, gapAfter: 0.3 },
  { kind: "hold", sec: 3.2, label: "сборка: крепления" },
  { kind: "hold", sec: 1.4, label: "сетка готова" },
  { kind: "line", id: 39, gapAfter: 0.6 },
  { kind: "hold", sec: 1.0, label: "плакат на столе" },
  // Сцена 8 — плакат на доске; итог; финальный общий план
  { kind: "hold", sec: 2.8, label: "учитель поднимает лист", scene: "s8" },
  { kind: "hold", sec: 4.0, label: "к доске" },
  { kind: "hold", sec: 4.0, label: "крепит на доске" },
  { kind: "line", id: 40, gapAfter: 0.5 },
  { kind: "line", id: 41, gapAfter: 0.5 },
  { kind: "line", id: 42, gapAfter: 0.4 },
  { kind: "line", id: 43, gapAfter: 0.5 },
  { kind: "line", id: 44, gapAfter: 0 },
  { kind: "hold", sec: 4.6, label: "финал: общий план" },
];
