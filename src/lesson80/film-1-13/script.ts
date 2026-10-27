// Урок 80-1 «Аллах — наш Создатель», мини-фильм 13 «А Аллах видел?»
// (композиция Lesson80-1-13, 1920×1080, 30 к/с, ориентир 3:40).
//
// Знакомая учебная комната мечети после занятия с картинкой. Амир убирает
// шесть деревянных деталей в коробку и ставит её на низкую полку. Учитель
// Мухаммад у доски готовит задание и не видит, как Юсуф (4 года) поднимает
// с ковра светло-зелёную книжку и ставит её на полку. Юсуф спрашивает, видел
// ли это Аллах; Билал и учитель отвечают по Корану; разговор о пользе малого
// добра, о намерении и о благодарности. В конце Юсуф сам помогает Амиру:
// переносит красную книжку к двум, которые принёс Амир. Три вопроса зрителю —
// паузы ровно по 5 с. Аллах не изображается и не озвучивается. Музыки,
// рекламы и призывов нет.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки, тесты
// и проверки. Общая библиотека серии (риг, класс, персонажи) — src/lesson80/.

import type { L80Role } from "../core/roles.ts";
export type { L80Role } from "../core/roles.ts";

export const FILM = {
  // Remotion не допускает «_» в идентификаторе композиции: Lesson80_1_13 → дефисы.
  id: "Lesson80-1-13",
  productionId: "80-1-13",
  lesson: "Урок 1 «Аллах — наш Создатель»",
  title: "А Аллах видел?",
  number: 13,
  output: "lesson-80-1-13-allah-saw",
  voiceDir: "lesson-80-1-13/audio",
  width: 1920,
  height: 1080,
  fps: 30,
  // допустимая длительность 3:20–4:00 (6000–7200 кадров), ориентир 3:40
  minSec: 200,
  targetSec: 220,
  maxSec: 240,
} as const;

export type L80Speaker = Exclude<L80Role, "kids">;

export const L80_TTS = {
  modelId: "eleven_v3",
  languageCode: "ru",
  seed: 8131,
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
  { id: "s1", title: "1. Незаметная помощь" },
  { id: "s2", title: "2. А Аллах видел?" },
  { id: "s3", title: "3. Добро приносит пользу" },
  { id: "s4", title: "4. Даже маленькое добро" },
  { id: "s5", title: "5. Что мы можем сделать?" },
  { id: "s6", title: "6. Можно радоваться благодарности" },
  { id: "s7", title: "7. Помочь ещё раз" },
  { id: "s8", title: "8. Добро имеет значение" },
];

// ---------- Реплики (канонический текст задания, ровно 35) ----------
// text — точный текст задания (субтитры, SRT, проверка манифеста); в звук
// попадает только он. tag — аудиотег eleven_v3 для интонации (не звучит;
// если синтезатор его произнёс, скрипт озвучки повторяет дубль без тега).
// note — инструкция по интонации для производства (не озвучивается).
// takes — сколько дублей синтезировать (лучший — по распознаванию MMS),
// seed — свой seed реплики, pick — выбранный при прослушивании дубль.
// source — источник формулировки (только авторские данные, не озвучивается).
export type L80Line = {
  readonly id: number; // 1 … 35 (только для производства, не озвучивается)
  readonly role: L80Speaker;
  readonly scene: L80SceneId;
  readonly text: string;
  readonly tag?: string;
  readonly note?: string;
  readonly seed?: number;
  readonly takes?: number;
  readonly pick?: number;
  readonly quiet?: boolean;
  readonly source?: string;
};

type Extra = { tag?: string; note?: string; seed?: number; takes?: number; pick?: number; quiet?: boolean; source?: string };
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
  ...(extra.source ? { source: extra.source } : {}),
});

export const L80_LINES: readonly L80Line[] = [
  // Сцена 1 — «Незаметная помощь»
  L(1, "muhammad", "s1", "Спасибо, Амир, что убрал детали.", { tag: "[warmly]", note: "спокойно, от доски, не оборачиваясь к полке" }),
  L(2, "amir", "s1", "Коробка уже на месте.", { note: "просто и дружелюбно, после того как поставил коробку", takes: 2 }),
  // Сцена 2 — «А Аллах видел?»
  L(3, "yusuf", "s2", "Мухаммад, вы видели, как я поднял книгу?", { tag: "[curious]", note: "желание поделиться своим действием, без хвастовства", takes: 3 }),
  L(4, "muhammad", "s2", "Нет, я готовил задание у доски.", { tag: "[warmly]", note: "честно и спокойно" }),
  L(5, "yusuf", "s2", "А Аллах видел?", { tag: "[curious]", note: "искренний короткий вопрос, без страха; «А» и конечное «л» должны быть слышны", seed: 8231, takes: 4 }),
  L(6, "muhammad", "s2", "Как вы считаете, ребята?", { tag: "[warmly]", note: "вопрос к зрителю: доброжелательная заинтересованность" }),
  L(7, "bilal", "s2", "Да. Аллах видит наши поступки.", { note: "уверенно и спокойно, без пафоса", takes: 2 }),
  L(8, "muhammad", "s2", "В Коране говорится: «Аллах видит все, что вы совершаете».", { note: "обычным голосом; цитата чуть яснее, без торжественности", source: "Коран 57:4" }),
  // Сцена 3 — «Добро приносит пользу»
  L(9, "yusuf", "s3", "Даже если люди не заметили?", { tag: "[curious]", note: "спокойное уточнение", takes: 2 }),
  L(10, "muhammad", "s3", "Да. Аллах — наш Создатель. В Коране Он назван Видящим.", { tag: "[warmly]", note: "мягко, просто", source: "Коран 42:11" }),
  L(11, "amir", "s3", "Теперь книга на полке. Её легко найти.", { tag: "[warmly]", note: "практично, дружелюбно", takes: 2 }),
  L(12, "muhammad", "s3", "Вот какую пользу принесла помощь Юсуфа. Спасибо, что позаботился.", { tag: "[warmly]", note: "тепло, благодарит" }),
  // Сцена 4 — «Даже маленькое добро»
  L(13, "yusuf", "s4", "Но я только поднял книжку.", { tag: "[thoughtful]", note: "задумчиво о небольшом деле, без обиды", takes: 2 }),
  L(14, "muhammad", "s4", "Маленькое добро тоже важно. В Коране сказано: «Тот, кто сделал добро весом в мельчайшую частицу, увидит его».", { note: "спокойно, понятно, без декламации; цитата обычным голосом", source: "Коран 99:7", takes: 2 }),
  L(15, "yusuf", "s4", "Совсем маленькое?", { tag: "[curious]", note: "интерес, без чрезмерного удивления", takes: 3 }),
  L(16, "muhammad", "s4", "Да. Даже маленькое добро не проходит напрасно.", { tag: "[warmly]" }),
  L(17, "bilal", "s4", "Значит, помочь может каждый из нас.", { tag: "[thoughtful]", note: "вывод, слегка к группе, без назидания" }),
  // Сцена 5 — «Что мы можем сделать?»
  L(18, "muhammad", "s5", "Какое доброе дело можно сделать в нашей комнате?", { tag: "[curious]", note: "вопрос к зрителю, спокойно" }),
  L(19, "amir", "s5", "Помочь убрать карандаши.", { note: "просто, дружелюбно", takes: 2 }),
  L(20, "bilal", "s5", "Спросить, нужна ли помощь.", { note: "спокойно", takes: 2 }),
  L(21, "yusuf", "s5", "Улыбнуться другу!", { tag: "[happy]", note: "лёгкая дружелюбная радость", takes: 3 }),
  L(22, "muhammad", "s5", "Да. Даже добрая улыбка — добро.", { tag: "[warmly]", note: "с улыбкой", source: "Сахих Муслим, 2626" }),
  // Сцена 6 — «Можно радоваться благодарности»
  L(23, "yusuf", "s6", "А если меня похвалят, это плохо?", { tag: "[curious]", note: "любопытство, без испуга и чувства вины", takes: 3 }),
  L(24, "muhammad", "s6", "Похвала может радовать. Можно сказать «спасибо». Мы стараемся делать добро ради Аллаха и помогать людям.", { tag: "[warmly]", note: "тепло, спокойно; без строгости на «ради Аллаха»", source: "Сахих Муслим, 2642a", takes: 2 }),
  L(25, "bilal", "s6", "Главное — зачем мы его делаем?", { tag: "[thoughtful]", note: "спокойное уточнение" }),
  L(26, "muhammad", "s6", "Да. Важно доброе намерение.", { tag: "[warmly]", source: "Сахих аль-Бухари, 1" }),
  L(27, "yusuf", "s6", "Я хочу, чтобы другу было легче.", { tag: "[sincere]", note: "ясная собственная цель помочь", takes: 2 }),
  // Сцена 7 — «Помочь ещё раз»
  L(28, "muhammad", "s7", "Как Юсуф может помочь Амиру?", { tag: "[curious]", note: "вопрос к зрителю" }),
  L(29, "yusuf", "s7", "Я отнесу эту книжку.", { note: "самостоятельное решение, уверенно", takes: 2 }),
  L(30, "amir", "s7", "Спасибо. Положи её рядом с моими.", { tag: "[warmly]", note: "естественная благодарность", takes: 2 }),
  // Сцена 8 — «Добро имеет значение»
  L(31, "amir", "s8", "Вместе легче.", { tag: "[warmly]", takes: 2 }),
  L(32, "yusuf", "s8", "Я помогал, чтобы тебе было легче.", { tag: "[sincere]", note: "другу, тепло", takes: 2 }),
  L(33, "muhammad", "s8", "Аллах видит наши добрые поступки.", { tag: "[warmly]", note: "спокойно, коротко" }),
  L(34, "bilal", "s8", "И маленькое добро тоже важно."),
  L(35, "yusuf", "s8", "Теперь всё на месте!", { tag: "[happy]", note: "удовлетворение от порядка, без торжественности", takes: 2 }),
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
  { id: "P1", after: 6, sec: 5 },
  { id: "P2", after: 18, sec: 5 },
  { id: "P3", after: 28, sec: 5 },
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
  // Сцена 1 — Амир убирает детали и ставит коробку; Юсуф ставит книжку на полку
  { kind: "hold", sec: 3.4, label: "комната", scene: "s1" },
  { kind: "hold", sec: 8.4, label: "Амир кладёт детали" },
  { kind: "hold", sec: 1.8, label: "Амир закрывает коробку" },
  { kind: "line", id: 1, gapAfter: 0.5 },
  { kind: "hold", sec: 1.6, label: "Амир встаёт" },
  { kind: "hold", sec: 3.8, label: "Амир несёт коробку" },
  { kind: "hold", sec: 1.4, label: "Амир ставит коробку" },
  { kind: "line", id: 2, gapAfter: 0.7 },
  { kind: "hold", sec: 1.6, label: "Юсуф замечает книжку" },
  { kind: "hold", sec: 1.5, label: "Юсуф подходит к книжке" },
  { kind: "hold", sec: 2.4, label: "Юсуф поднимает книжку" },
  { kind: "hold", sec: 1.2, label: "Юсуф несёт книжку" },
  { kind: "hold", sec: 2.2, label: "Юсуф ставит книжку" },
  // Сцена 2 — Юсуф подходит к учителю; вопрос; пауза P1; ответ
  { kind: "hold", sec: 4.6, label: "Юсуф идёт к учителю", scene: "s2" },
  { kind: "hold", sec: 1.2, label: "учитель поворачивается" },
  { kind: "hold", sec: 2.4, label: "учитель садится" },
  { kind: "line", id: 3, gapAfter: 0.7 },
  { kind: "line", id: 4, gapAfter: 0.8 },
  { kind: "line", id: 5, gapAfter: 0.8 },
  { kind: "line", id: 6, gapAfter: 0 },
  { kind: "pause", id: "P1" },
  { kind: "line", id: 7, gapAfter: 0.8 },
  { kind: "line", id: 8, gapAfter: 1.2 },
  // Сцена 3 — польза: книжка на полке
  { kind: "hold", sec: 1.4, label: "Юсуф смотрит на полку", scene: "s3" },
  { kind: "line", id: 9, gapAfter: 0.7 },
  { kind: "line", id: 10, gapAfter: 0.9 },
  { kind: "hold", sec: 1.0, label: "Амир смотрит на полку" },
  { kind: "line", id: 11, gapAfter: 0.4 },
  { kind: "hold", sec: 2.2, label: "книжка на полке" },
  { kind: "line", id: 12, gapAfter: 0.6 },
  { kind: "hold", sec: 1.6, label: "Юсуф улыбается" },
  // Сцена 4 — даже маленькое добро
  { kind: "hold", sec: 2.4, label: "Юсуф смотрит на книжку и коробку", scene: "s4" },
  { kind: "line", id: 13, gapAfter: 0.7 },
  { kind: "line", id: 14, gapAfter: 1.4 },
  { kind: "line", id: 15, gapAfter: 0.6 },
  { kind: "line", id: 16, gapAfter: 0.8 },
  { kind: "line", id: 17, gapAfter: 0.6 },
  { kind: "hold", sec: 1.4, label: "дети думают" },
  // Сцена 5 — что мы можем сделать
  { kind: "hold", sec: 1.2, label: "учитель показывает комнату", scene: "s5" },
  { kind: "line", id: 18, gapAfter: 0 },
  { kind: "pause", id: "P2" },
  { kind: "line", id: 19, gapAfter: 0.4 },
  { kind: "hold", sec: 1.4, label: "карандаши" },
  { kind: "line", id: 20, gapAfter: 0.6 },
  { kind: "line", id: 21, gapAfter: 0.4 },
  { kind: "hold", sec: 1.2, label: "Амир улыбается" },
  { kind: "line", id: 22, gapAfter: 0.6 },
  { kind: "hold", sec: 1.4, label: "улыбки" },
  // Сцена 6 — благодарность и намерение
  { kind: "line", id: 23, gapAfter: 0.8 },
  { kind: "line", id: 24, gapAfter: 1.2 },
  { kind: "line", id: 25, gapAfter: 0.6 },
  { kind: "line", id: 26, gapAfter: 1.0 },
  { kind: "line", id: 27, gapAfter: 0.6 },
  { kind: "hold", sec: 3.6, label: "Амир идёт к столику" },
  // Сцена 7 — помочь ещё раз
  { kind: "hold", sec: 2.2, label: "Амир берёт две книжки", scene: "s7" },
  { kind: "hold", sec: 1.4, label: "Амир несёт книжки" },
  { kind: "hold", sec: 1.8, label: "Амир ставит книжки" },
  { kind: "hold", sec: 0.8, label: "все смотрят на столик" },
  { kind: "line", id: 28, gapAfter: 0 },
  { kind: "pause", id: "P3" },
  { kind: "line", id: 29, gapAfter: 0.5 },
  { kind: "line", id: 30, gapAfter: 0.3 },
  { kind: "hold", sec: 3.4, label: "Юсуф идёт к столику" },
  { kind: "hold", sec: 1.8, label: "Юсуф берёт красную книжку" },
  { kind: "hold", sec: 1.2, label: "Юсуф несёт красную книжку" },
  { kind: "hold", sec: 2.2, label: "Юсуф ставит красную книжку" },
  { kind: "hold", sec: 1.2, label: "мальчики смотрят друг на друга" },
  // Сцена 8 — добро имеет значение
  { kind: "line", id: 31, gapAfter: 0.6 },
  { kind: "line", id: 32, gapAfter: 0.8 },
  { kind: "line", id: 33, gapAfter: 0.7 },
  { kind: "line", id: 34, gapAfter: 0.6 },
  { kind: "line", id: 35, gapAfter: 0.6 },
  { kind: "hold", sec: 5.8, label: "дети возвращаются" },
  { kind: "hold", sec: 1.8, label: "камера отходит" },
  { kind: "hold", sec: 4.6, label: "финал: класс" },
];
