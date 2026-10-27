// Урок 80-1 «Аллах — наш Создатель», мини-фильм 11 «А если я ошибусь?»
// (композиция Lesson80-1-11, 1920×1080, 30 к/с, ориентир 4:00).
//
// Другой день в знакомой комнате. Амир входит, кладёт вещи на своё место и,
// не подходя к ростку, на вопрос Билала отвечает, что земля ещё влажная.
// Билал спокойно замечает, что Амир к ростку не подходил; Амир сам признаётся
// друзьям, затем — учителю Мухаммаду. Учитель говорит о милости и прощении
// Аллаха (краткий фрагмент смысла аята 39:53), о просьбе прощения своими
// словами и об исправлении; Амир извиняется перед Билалом, вместе с учителем
// проверяет землю и сам поливает росток, Билал делает карточку-напоминание
// «Проверить росток». Три вопроса зрителю — паузы ровно по 5 с.
// Аллах не изображается и не озвучивается. Музыки, рекламы и призывов нет.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки, тесты
// и проверки. Общая библиотека серии (риг, класс, персонажи) — src/lesson80/.

import type { L80Role } from "../core/roles.ts";
export type { L80Role } from "../core/roles.ts";

export const FILM = {
  // Remotion не допускает «_» в идентификаторе композиции: Lesson80_1_11 → дефисы.
  id: "Lesson80-1-11",
  productionId: "80-1-11",
  lesson: "Урок 1 «Аллах — наш Создатель»",
  title: "А если я ошибусь?",
  number: 11,
  output: "lesson-80-1-11-if-i-make-a-mistake",
  voiceDir: "lesson-80-1-11/audio",
  width: 1920,
  height: 1080,
  fps: 30,
  // допустимая длительность 3:40–4:20 (6600–7800 кадров), ориентир 4:00
  minSec: 220,
  targetSec: 240,
  maxSec: 260,
} as const;

// Говорящие роли фильма (групповой реплики «kids» в этом фильме нет).
export type L80Speaker = Exclude<L80Role, "kids">;

export const L80_TTS = {
  modelId: "eleven_v3",
  languageCode: "ru",
  seed: 8111,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
  // версия хэша реплики для провайдеров без seed (OpenAI, RHVoice, Piper)
  version: 1,
} as const;

// Голоса по ролям — тот же набор, что в последней дорожке серии (80-1-9):
// голоса из лаборатории 80-1-7, упорядоченные по возрасту и высоте тона:
// учитель — Eric (≈ 160 Гц), Юсуф (4) — KG-son, самый светлый (≈ 300 Гц),
// Амир (8) — Alice (≈ 240 Гц), Билал (11) — Jessica (≈ 186 Гц): ниже Амира,
// но без взрослого баритона. Ни один провайдер не меняет высоту тона и не
// ускоряет речь. RHVoice — резервная офлайн-дорожка (честно помечается).
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
    openai: { voice: "nova", instructions: `Мальчик восьми лет: сначала немного смущённо, потом спокойнее и увереннее, тот же тембр. ${RU}` },
    rhvoice: { voice: "Elena", pitch: 0, rate: -0.06 },
    piper: { voice: "denis", speed: 0.78 },
  },
  bilal: {
    elevenlabs: { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9" },
    openai: { voice: "sage", instructions: `Дружелюбный спокойный мальчик одиннадцати лет: голос старшего ребёнка, ещё не взрослый, без нажима. ${RU}` },
    rhvoice: { voice: "Arina", pitch: 0, rate: -0.04 },
    piper: { voice: "ruslan", speed: 0.78 },
  },
};

// ---------- Сцены ----------
export type L80SceneId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8";

export const L80_SCENES: readonly { readonly id: L80SceneId; readonly title: string }[] = [
  { id: "s1", title: "1. Обещание" },
  { id: "s2", title: "2. Сказать, как было" },
  { id: "s3", title: "3. Можно признать ошибку" },
  { id: "s4", title: "4. Не терять надежду" },
  { id: "s5", title: "5. Своими словами" },
  { id: "s6", title: "6. Вернуться к делу" },
  { id: "s7", title: "7. Чтобы не забыть" },
  { id: "s8", title: "8. Можно исправиться" },
];

// ---------- Реплики (канонический текст, ровно 45) ----------
// text — точный текст задания (субтитры, SRT, проверка манифеста); в звук
// попадает только он. tag — аудиотег eleven_v3 для интонации (не звучит;
// если синтезатор его произнёс, скрипт озвучки повторяет дубль без тега).
// note — короткая инструкция по интонации для производства (не озвучивается).
// takes — сколько дублей синтезировать (лучший — по распознаванию MMS),
// seed — свой seed реплики.
export type L80Line = {
  readonly id: number; // 1 … 45 (только для производства, не озвучивается)
  readonly role: L80Speaker;
  readonly scene: L80SceneId;
  readonly text: string;
  readonly tag?: string;
  readonly note?: string;
  readonly seed?: number;
  readonly takes?: number;
  readonly pick?: number; // выбранный при прослушивании дубль (seed)
};

type Extra = { tag?: string; note?: string; seed?: number; takes?: number; pick?: number };
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
});

export const L80_LINES: readonly L80Line[] = [
  // Сцена 1 — «Обещание»
  L(1, "yusuf", "s1", "У нашего ростка зелёные листочки!", { tag: "[happy]", note: "радостное наблюдение малыша" }),
  L(2, "bilal", "s1", "Амир, ты обещал проверить росток. Посмотрел, нужна ли ему вода?", { note: "обычный дружелюбный вопрос, без проверки и нажима" }),
  L(3, "amir", "s1", "Да. Земля ещё влажная.", { tag: "[hesitant]", note: "чуть поспешно и осторожно; сознательно сказанная неправда, без карикатуры", takes: 2 }),
  // Сцена 2 — «Сказать, как было»
  L(4, "bilal", "s2", "Ты ведь ещё не подходил к ростку.", { tag: "[gently]", note: "спокойное наблюдение, не обвинение" }),
  L(5, "amir", "s2", "Я забыл проверить. А потом сказал, что проверил.", { tag: "[embarrassed]", note: "тише, честно; небольшая остановка между предложениями", takes: 2 }),
  L(6, "yusuf", "s2", "Почему?", { tag: "[curious]", note: "любопытство, не обвинение", takes: 3 }),
  L(7, "amir", "s2", "Мне было неловко признаться.", { tag: "[quietly]", note: "тихо, но полностью разборчиво", takes: 2 }),
  L(8, "bilal", "s2", "Что Амир может сделать теперь?", { tag: "[thoughtful]", note: "вопрос к зрителю, спокойно" }),
  L(9, "yusuf", "s2", "Сказать, как было. А я пойду с тобой.", { tag: "[warmly]", note: "просто и тепло" }),
  L(10, "bilal", "s2", "Пойдём.", { tag: "[gently]", takes: 3 }),
  // Сцена 3 — «Можно признать ошибку»
  L(11, "amir", "s3", "Мухаммад, простите. Я не проверил росток. Я сказал неправду.", { tag: "[sincere]", note: "от себя, честно, без плача", takes: 2 }),
  L(12, "muhammad", "s3", "Спасибо, что рассказал. Что хочешь исправить?", { tag: "[warmly]", note: "поддержка честности; вопрос — предложение подумать" }),
  L(13, "amir", "s3", "Сказать правду. Проверить росток. И извиниться перед Билалом.", { note: "постепенно увереннее" }),
  L(14, "yusuf", "s3", "А если я ошибусь?", { tag: "[curious]", note: "главный вопрос фильма, просто" }),
  L(15, "muhammad", "s3", "Ошибиться может каждый. Аллах — наш Создатель. Он Милостивый и Прощающий.", { tag: "[warmly]", note: "спокойно, без торжественности" }),
  // Сцена 4 — «Не терять надежду»
  L(16, "amir", "s4", "А можно попросить Аллаха прощения?", { tag: "[hopeful]" }),
  L(17, "muhammad", "s4", "Да. В Коране сказано: «Не отчаивайтесь в милости Аллаха».", { note: "обычный тёплый голос учителя, без особой интонации и эффектов" }),
  L(18, "yusuf", "s4", "Как это — не отчаиваться?", { tag: "[curious]" }),
  L(19, "muhammad", "s4", "Не терять надежду на Его прощение. Можно попросить прощения и стараться исправиться.", { note: "просто, словами для детей" }),
  L(20, "bilal", "s4", "Что значит исправиться?", { tag: "[curious]" }),
  L(21, "muhammad", "s4", "Пожалеть о плохом поступке, перестать так делать и решить больше его не повторять."),
  L(22, "bilal", "s4", "А если человек снова поступил плохо?", { tag: "[thoughtful]", note: "желание понять" }),
  L(23, "muhammad", "s4", "Снова попросить прощения и исправиться. Надежду терять не нужно.", { tag: "[warmly]", note: "тепло и серьёзно, не «ничего страшного»" }),
  // Сцена 5 — «Своими словами»
  L(24, "muhammad", "s5", "Какими словами можно попросить Аллаха прощения?", { note: "вопрос к зрителю, спокойно" }),
  L(25, "amir", "s5", "Аллах, прости меня. Помоги мне говорить правду.", { tag: "[sincere]", note: "естественно и тихо, не шёпотом", takes: 2 }),
  L(26, "muhammad", "s5", "Просить можно своими словами. Важно поступать честно."),
  L(27, "yusuf", "s5", "А Билалу что сказать?", { tag: "[curious]" }),
  L(28, "muhammad", "s5", "Перед ним тоже нужно извиниться и вернуться к обещанному делу."),
  // Сцена 6 — «Вернуться к делу»
  L(29, "amir", "s6", "Билал, прости, что сказал неправду.", { tag: "[sincere]", note: "увереннее, без театральности", takes: 2 }),
  L(30, "bilal", "s6", "Я прощаю тебя. Давай проверим вместе.", { tag: "[warmly]", note: "искреннее личное решение" }),
  L(31, "muhammad", "s6", "Что можно сделать сейчас?", { note: "вопрос к зрителю" }),
  L(32, "amir", "s6", "Посмотреть, нужна ли ростку вода."),
  // «Верно.» тем же голосом и seed, что дали чистый дубль в 80-1-8
  L(33, "muhammad", "s6", "Верно.", { seed: 851, takes: 3 }),
  L(34, "muhammad", "s6", "Земля подсохла. Росток можно немного полить."),
  L(35, "amir", "s6", "Сейчас медленно полью.", { note: "спокойно, уверенно" }),
  // Сцена 7 — «Чтобы не забыть»
  L(36, "yusuf", "s7", "А как теперь не забыть?", { tag: "[curious]" }),
  L(37, "bilal", "s7", "Сделаем напоминание."),
  L(38, "amir", "s7", "Напиши: «Проверить росток».", { takes: 2 }),
  L(39, "bilal", "s7", "Готово.", { takes: 3 }),
  L(40, "muhammad", "s7", "Проверять будем вместе. Поливать — когда нужно."),
  L(41, "amir", "s7", "А если забуду, скажу честно.", { note: "уверенно, без клятвы «никогда»" }),
  // Сцена 8 — «Можно исправиться»
  L(42, "muhammad", "s8", "Ты смог сказать правду и вернуться к делу.", { tag: "[warmly]" }),
  L(43, "yusuf", "s8", "Если я ошибусь, я тоже смогу исправиться.", { tag: "[happy]", note: "простая уверенность" }),
  L(44, "muhammad", "s8", "Да. У Аллаха можно просить прощения. А за помощью приходи к нам.", { tag: "[warmly]", note: "спокойное приглашение" }),
  L(45, "amir", "s8", "Спасибо, что пошли со мной.", { tag: "[warmly]" }),
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
  folder: ["Наши", "вопросы"],
  card: "Проверить росток",
} as const;

// ---------- Зрительские паузы (после реплики, до следующей), секунды ----------
export type PauseId = "P1" | "P2" | "P3";
export const L80_PAUSES: readonly { readonly id: PauseId; readonly after: number; readonly sec: number }[] = [
  { id: "P1", after: 8, sec: 5 },
  { id: "P2", after: 24, sec: 5 },
  { id: "P3", after: 31, sec: 5 },
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
  // Сцена 1 — вход Амира, вещи, росток, обещание
  { kind: "hold", sec: 0.9, label: "комната", scene: "s1" },
  { kind: "hold", sec: 1.6, label: "дверь открывается" },
  { kind: "hold", sec: 2.6, label: "Амир идёт на место" },
  { kind: "hold", sec: 2.0, label: "Амир кладёт вещи" },
  { kind: "hold", sec: 1.6, label: "Амир садится" },
  { kind: "hold", sec: 2.1, label: "Юсуф смотрит на листья" },
  { kind: "line", id: 1, gapAfter: 0.7 },
  { kind: "line", id: 2, gapAfter: 0.5 },
  { kind: "line", id: 3, gapAfter: 0.4 },
  { kind: "hold", sec: 1.4, label: "неловкость" },
  // Сцена 2 — Билал садится рядом; признание друзьям; вопрос зрителю
  { kind: "hold", sec: 2.8, label: "Билал садится рядом", scene: "s2" },
  { kind: "line", id: 4, gapAfter: 1.0 },
  { kind: "line", id: 5, gapAfter: 0.8 },
  { kind: "line", id: 6, gapAfter: 0.6 },
  { kind: "line", id: 7, gapAfter: 1.0 },
  { kind: "line", id: 8, gapAfter: 0 },
  { kind: "pause", id: "P1" },
  { kind: "line", id: 9, gapAfter: 0.6 },
  { kind: "line", id: 10, gapAfter: 0.3 },
  { kind: "hold", sec: 1.8, label: "мальчики встают" },
  // Сцена 3 — к учителю; признание; «А если я ошибусь?»
  { kind: "hold", sec: 5.8, label: "идут к учителю", scene: "s3" },
  { kind: "hold", sec: 1.4, label: "учитель садится" },
  { kind: "line", id: 11, gapAfter: 0.9 },
  { kind: "line", id: 12, gapAfter: 0.8 },
  { kind: "line", id: 13, gapAfter: 0.5 },
  { kind: "hold", sec: 2.2, label: "мальчики садятся у столика" },
  { kind: "line", id: 14, gapAfter: 0.8 },
  { kind: "line", id: 15, gapAfter: 1.0 },
  // Сцена 4 — надежда, прощение, исправление
  { kind: "line", id: 16, gapAfter: 0.8 },
  { kind: "line", id: 17, gapAfter: 1.2 },
  { kind: "line", id: 18, gapAfter: 0.8 },
  { kind: "line", id: 19, gapAfter: 1.0 },
  { kind: "line", id: 20, gapAfter: 0.8 },
  { kind: "line", id: 21, gapAfter: 1.0 },
  { kind: "line", id: 22, gapAfter: 0.8 },
  { kind: "line", id: 23, gapAfter: 0.6 },
  { kind: "hold", sec: 1.4, label: "дети думают" },
  // Сцена 5 — своими словами
  { kind: "line", id: 24, gapAfter: 0 },
  { kind: "pause", id: "P2" },
  { kind: "line", id: 25, gapAfter: 1.2 },
  { kind: "line", id: 26, gapAfter: 0.9 },
  { kind: "line", id: 27, gapAfter: 0.7 },
  { kind: "line", id: 28, gapAfter: 0.6 },
  { kind: "hold", sec: 1.2, label: "Амир поворачивается к Билалу" },
  // Сцена 6 — извинение, к ростку, проверка, полив
  { kind: "line", id: 29, gapAfter: 0.8 },
  { kind: "line", id: 30, gapAfter: 0.3 },
  { kind: "hold", sec: 4.4, label: "к ростку", scene: "s6" },
  { kind: "line", id: 31, gapAfter: 0 },
  { kind: "pause", id: "P3" },
  { kind: "line", id: 32, gapAfter: 0.6 },
  { kind: "line", id: 33, gapAfter: 0.3 },
  { kind: "hold", sec: 3.6, label: "проверка земли" },
  { kind: "line", id: 34, gapAfter: 0.3 },
  { kind: "hold", sec: 3.5, label: "вода в чашку" },
  { kind: "hold", sec: 2.0, label: "передача чашки" },
  { kind: "line", id: 35, gapAfter: 0.3 },
  { kind: "hold", sec: 5.4, label: "полив" },
  { kind: "hold", sec: 0.8, label: "чашка выпрямлена" },
  // Сцена 7 — чашка на столе, карточка-напоминание
  { kind: "hold", sec: 1.8, label: "чашка на столе", scene: "s7" },
  { kind: "line", id: 36, gapAfter: 0.6 },
  { kind: "line", id: 37, gapAfter: 0.3 },
  { kind: "hold", sec: 3.4, label: "к низкому столику" },
  { kind: "hold", sec: 1.4, label: "карточка и карандаш" },
  { kind: "line", id: 38, gapAfter: 0.3 },
  { kind: "hold", sec: 2.8, label: "листик" },
  { kind: "hold", sec: 2.0, label: "Юсуф смотрит" },
  { kind: "hold", sec: 3.0, label: "надпись" },
  { kind: "line", id: 39, gapAfter: 0.3 },
  { kind: "hold", sec: 2.0, label: "Билал показывает карточку" },
  { kind: "hold", sec: 3.6, label: "карточку к ростку" },
  { kind: "hold", sec: 2.0, label: "карточка у горшка" },
  { kind: "line", id: 40, gapAfter: 0.7 },
  { kind: "line", id: 41, gapAfter: 0.8 },
  // Сцена 8 — правда, исправление, поддержка; возвращение на места
  { kind: "line", id: 42, gapAfter: 0.8 },
  { kind: "line", id: 43, gapAfter: 0.8 },
  { kind: "line", id: 44, gapAfter: 0.8 },
  { kind: "line", id: 45, gapAfter: 0.2 },
  { kind: "hold", sec: 1.8, label: "Юсуф касается плеча" },
  { kind: "hold", sec: 7.6, label: "возвращение на места" },
  { kind: "hold", sec: 4.5, label: "финал: класс" },
];
