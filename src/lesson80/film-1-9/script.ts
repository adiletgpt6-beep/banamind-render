// Урок 80-1 «Аллах — наш Создатель», мини-фильм 9 «Кому сказать спасибо?»
// (композиция Lesson80-1-9, 1920×1080, 30 к/с, ориентир 3:50).
//
// Учитель Мухаммад угощает класс вымытыми и нарезанными яблоками. Юсуф (4)
// благодарит его и спрашивает, кого же благодарить, если яблоко выросло на
// дереве, которое создал Аллах. Прямой ответ звучит сразу: мы благодарим
// Аллаха за Его дары и людей — за их заботу. Дальше дети узнают значение
// «Альхамдулиллях» («Хвала Аллаху»), что Коран учит благодарить за милости
// (часть смысла аята 16:114), благодарят Билала за салфетки, и Юсуф сам
// отдаёт Билалу последнюю салфетку: благодарность показывают и делами.
// Три вопроса зрителю (паузы 5, 5 и 6 с), «Бисмиллях» перед едой и
// «Альхамдулиллях» после, спасибо учителю.
// Аллах не изображается и не озвучивается. Музыки, рекламы и призывов нет.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки, тесты
// и проверки. Общая библиотека серии (риг, класс, персонажи) — src/lesson80/.

import type { L80Role } from "../core/roles.ts";
export type { L80Role } from "../core/roles.ts";

export const FILM = {
  // Remotion не допускает «_» в идентификаторе композиции: Lesson80_1_9 → дефисы.
  id: "Lesson80-1-9",
  productionId: "80-1-9",
  title: "Кому сказать спасибо?",
  output: "lesson-80-1-9",
  voiceDir: "lesson-80-1-9/audio",
  width: 1920,
  height: 1080,
  fps: 30,
  // допустимая длительность 3:30–4:20, ориентир 3:50
  minSec: 210,
  targetSec: 230,
  maxSec: 260,
} as const;

// Говорящие роли фильма (групповой реплики «kids» в этом фильме нет).
export type L80Speaker = Exclude<L80Role, "kids">;

export const L80_TTS = {
  modelId: "eleven_v3",
  languageCode: "ru",
  seed: 819,
  voiceSettings: { stability: 0.5, similarity_boost: 0.8 },
  // версия хэша реплики для провайдеров без seed (OpenAI, RHVoice, Piper)
  version: 1,
} as const;

// Голоса по ролям для каждого провайдера. Ни один провайдер не меняет высоту
// тона и не ускоряет речь.
//   • ElevenLabs — голоса из лаборатории 80-1-7 (voice-samples/lesson-80-1-7,
//     замер основного тона и разборчивости MMS), упорядоченные по возрасту:
//     учитель — Eric (как в 80-1-7, ≈ 168 Гц), Юсуф (4) — KG-son, самый светлый
//     голос (≈ 308 Гц), Амир (8) — Alice (как в 80-1-7, ≈ 232 Гц), Билал (11) —
//     Jessica (≈ 190 Гц): ниже Амира, но без взрослого баритона. Голос Liam
//     (≈ 121 Гц, ниже учителя) для одиннадцатилетнего не используется.
//   • RHVoice — резервная офлайн-дорожка с теми же голосами, что в 80-1-8.
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
    openai: { voice: "coral", instructions: `Любознательный мальчик четырёх лет: маленький мягкий голос, короткие живые интонации, без писка и карикатуры. ${RU}` },
    rhvoice: { voice: "Anna", pitch: 0, rate: -0.12 },
    piper: { voice: "irina", speed: 0.74 },
  },
  amir: {
    elevenlabs: { name: "Alice", voiceId: "Xb7hH8MSUJpSbSDYk0k2" },
    openai: { voice: "nova", instructions: `Ясный собранный мальчик восьми лет, задаёт уточнения и замечает связь с привычной жизнью. ${RU}` },
    rhvoice: { voice: "Elena", pitch: 0, rate: -0.06 },
    piper: { voice: "denis", speed: 0.78 },
  },
  bilal: {
    elevenlabs: { name: "Jessica", voiceId: "cgSgspJ2msm6clMCkdW9" },
    openai: { voice: "sage", instructions: `Дружелюбный спокойный мальчик одиннадцати лет: голос старшего ребёнка, ещё не взрослый. ${RU}` },
    rhvoice: { voice: "Arina", pitch: 0, rate: -0.04 },
    piper: { voice: "ruslan", speed: 0.78 },
  },
};

// ---------- Сцены ----------
export type L80SceneId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8";

export const L80_SCENES: readonly { readonly id: L80SceneId; readonly title: string }[] = [
  { id: "s1", title: "1. Кому сказать спасибо?" },
  { id: "s2", title: "2. Аллаху и людям" },
  { id: "s3", title: "3. Что означает «Альхамдулиллях»" },
  { id: "s4", title: "4. Замечать милости" },
  { id: "s5", title: "5. Спасибо за заботу" },
  { id: "s6", title: "6. Благодарность в поступках" },
  { id: "s7", title: "7. Проверим вместе" },
  { id: "s8", title: "8. Теперь я понял" },
];

// ---------- Реплики (канонический текст, ровно 45) ----------
export type L80Line = {
  readonly id: number; // 1 … 45 (только для производства, не озвучивается)
  readonly role: L80Speaker;
  readonly scene: L80SceneId;
  readonly text: string; // канонический текст (субтитры, проверка манифеста)
  readonly tag?: string; // аудиотег eleven_v3 (интонация), в звук не попадает
  readonly seed?: number; // свой seed — перегенерировать только эту реплику
  readonly takes?: number; // сколько дублей синтезировать (лучший — по распознаванию MMS)
};

const L = (id: number, role: L80Speaker, scene: L80SceneId, text: string, tag?: string, redo?: { seed: number; takes: number }): L80Line => ({
  id,
  role,
  scene,
  text,
  ...(tag ? { tag } : {}),
  ...(redo ?? {}),
});

export const L80_LINES: readonly L80Line[] = [
  // Сцена 1 — «Кому сказать спасибо?»
  L(1, "yusuf", "s1", "Спасибо, Мухаммад!", "[happy]"),
  L(2, "muhammad", "s1", "Пожалуйста, Юсуф.", "[warmly]"),
  L(3, "yusuf", "s1", "Но ведь яблоко выросло на дереве, которое создал Аллах. Кому я должен сказать спасибо?", "[curious]"),
  // Сцена 2 — «Аллаху и людям»
  L(4, "muhammad", "s2", "Мы благодарим Аллаха за Его дары и людей — за их заботу.", "[warmly]"),
  L(5, "yusuf", "s2", "И Аллаха, и вас?", "[curious]"),
  L(6, "muhammad", "s2", "Да. Аллах создал яблони и дал им возможность расти и приносить плоды."),
  L(7, "amir", "s2", "А люди ухаживали за садом и собирали яблоки?", "[curious]"),
  L(8, "muhammad", "s2", "Да. А я купил их, помыл и нарезал."),
  // Сцена 3 — «Что означает Альхамдулиллях»
  L(9, "yusuf", "s3", "А как поблагодарить Аллаха?", "[curious]"),
  L(10, "muhammad", "s3", "Можно сказать: «Альхамдулиллях»."),
  L(11, "amir", "s3", "А что это означает?", "[curious]"),
  L(12, "muhammad", "s3", "«Хвала Аллаху». Этими словами мы можем выражать благодарность Аллаху.", undefined, { seed: 912, takes: 3 }),
  L(13, "bilal", "s3", "Мы помним, что еда — дар Аллаха?"),
  L(14, "muhammad", "s3", "Да. Мы замечаем то, что Он нам дал."),
  // Сцена 4 — «Замечать милости»
  L(15, "bilal", "s4", "А в Коране говорится о благодарности?", "[curious]"),
  L(16, "muhammad", "s4", "Да. Коран учит нас благодарить Аллаха за Его милости."),
  L(17, "yusuf", "s4", "Милости — это что?", "[curious]"),
  L(18, "muhammad", "s4", "Добро, которое Аллах нам дал. Например, еда и вода."),
  L(19, "amir", "s4", "То, что у нас бывает каждый день?"),
  L(20, "muhammad", "s4", "Да. Даже привычное добро важно замечать.", "[warmly]"),
  // Сцена 5 — «Спасибо за заботу»
  L(21, "yusuf", "s5", "Билал, спасибо, что принёс салфетки!", "[happy]"),
  L(22, "bilal", "s5", "Пожалуйста.", "[warmly]", { seed: 922, takes: 3 }),
  L(23, "yusuf", "s5", "Вот так можно?", "[curious]"),
  L(24, "muhammad", "s5", "Да. Мы благодарим людей за добро, которое они нам делают."),
  L(25, "amir", "s5", "Значит, когда мама готовит или друг помогает, мы тоже говорим спасибо."),
  L(26, "muhammad", "s5", "Верно.", "[warmly]"),
  // Сцена 6 — «Благодарность в поступках»
  L(27, "yusuf", "s6", "Билал всем раздал салфетки. А у него нет!"),
  L(28, "bilal", "s6", "Я ещё не взял себе."),
  L(29, "yusuf", "s6", "Вот тебе, Билал.", "[warmly]"),
  L(30, "bilal", "s6", "Спасибо, Юсуф.", "[warmly]", { seed: 930, takes: 3 }),
  L(31, "muhammad", "s6", "Вы заботитесь друг о друге. Это хороший поступок.", "[warmly]"),
  L(32, "amir", "s6", "Значит, благодарность — это не только слова?", "[curious]"),
  L(33, "muhammad", "s6", "Её можно показывать и делами: помогать друг другу и бережно относиться к еде."),
  // Сцена 7 — «Проверим вместе»
  L(34, "muhammad", "s7", "Что означает «Альхамдулиллях»?"),
  L(35, "amir", "s7", "Хвала Аллаху."),
  L(36, "muhammad", "s7", "Кого мы благодарим за заботу и помощь?"),
  L(37, "bilal", "s7", "Людей, которые нам помогают."),
  L(38, "muhammad", "s7", "Как можно проявить благодарность делом?"),
  L(39, "yusuf", "s7", "Помочь другому. Я принёс Билалу салфетку!", "[happy]"),
  L(40, "muhammad", "s7", "Да. Мы можем благодарить словами и добрыми поступками.", "[warmly]"),
  // Сцена 8 — «Теперь я понял»
  L(41, "yusuf", "s8", "Бисмиллях.", undefined, { seed: 941, takes: 3 }),
  L(42, "yusuf", "s8", "Альхамдулиллях.", undefined, { seed: 942, takes: 3 }),
  L(43, "yusuf", "s8", "И спасибо вам за угощение, Мухаммад!", "[happy]"),
  L(44, "muhammad", "s8", "Пожалуйста, Юсуф.", "[warmly]"),
  L(45, "yusuf", "s8", "Я благодарю Аллаха и людей, которые обо мне заботятся.", "[warmly]"),
];

export const lineById = (id: number): L80Line => {
  const l = L80_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

export const lineFile = (id: number) => `l${String(id).padStart(2, "0")}.mp3`;

// Поясняющие надписи (одна строка, только в нужных местах).
export const CAPTIONS = { meaning: "Альхамдулиллях — Хвала Аллаху", ayah: "Смысл аята 16:114" } as const;

// ---------- Зрительские паузы (после реплики, до следующей), секунды ----------
// Только эти три паузы: остальные вопросы — обычный разговор.
export type PauseId = "P1" | "P2" | "P3";
export const L80_PAUSES: readonly { readonly id: PauseId; readonly after: number; readonly sec: number }[] = [
  { id: "P1", after: 34, sec: 5 },
  { id: "P2", after: 36, sec: 5 },
  { id: "P3", after: 38, sec: 6 },
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
  // Сцена 1 — угощение готово; учитель ставит тарелку перед Юсуфом
  { kind: "hold", sec: 4.6, label: "общий план: угощение", scene: "s1" },
  { kind: "hold", sec: 4.4, label: "тарелка Юсуфу" },
  { kind: "line", id: 1, gapAfter: 0.7 },
  { kind: "line", id: 2, gapAfter: 1.0 },
  { kind: "hold", sec: 2.8, label: "Юсуф смотрит на яблоко" },
  { kind: "line", id: 3, gapAfter: 0.8 },
  // Сцена 2 — прямой ответ; сад; труд людей
  { kind: "hold", sec: 2.2, label: "учитель присаживается", scene: "s2" },
  { kind: "line", id: 4, gapAfter: 1.3 },
  { kind: "line", id: 5, gapAfter: 0.8 },
  { kind: "line", id: 6, gapAfter: 0.3 },
  // вставка сада: яблоня с плодами (с конца реплики 06) и работник сада
  { kind: "hold", sec: 1.0, label: "сад: яблоня" },
  { kind: "hold", sec: 3.0, label: "сад: работник" },
  { kind: "hold", sec: 0.6, label: "снова в классе" },
  { kind: "line", id: 7, gapAfter: 0.8 },
  { kind: "line", id: 8, gapAfter: 1.0 },
  { kind: "hold", sec: 2.6, label: "Юсуф смотрит на угощение" },
  // Сцена 3 — «Альхамдулиллях»; Билал заканчивает раздачу
  { kind: "line", id: 9, gapAfter: 0.9 },
  { kind: "line", id: 10, gapAfter: 1.1 },
  { kind: "line", id: 11, gapAfter: 0.8 },
  { kind: "line", id: 12, gapAfter: 0.5 },
  { kind: "hold", sec: 3.4, label: "надпись: значение" },
  { kind: "hold", sec: 3.4, label: "Билал возвращается" },
  { kind: "line", id: 13, gapAfter: 0.8 },
  { kind: "line", id: 14, gapAfter: 1.4 },
  // Сцена 4 — Коран и милости
  { kind: "line", id: 15, gapAfter: 0.9 },
  { kind: "line", id: 16, gapAfter: 0.5 },
  { kind: "hold", sec: 2.8, label: "подпись: смысл аята" },
  { kind: "line", id: 17, gapAfter: 0.8 },
  { kind: "line", id: 18, gapAfter: 0.9 },
  { kind: "line", id: 19, gapAfter: 0.7 },
  { kind: "line", id: 20, gapAfter: 0.6 },
  { kind: "hold", sec: 2.8, label: "Юсуф смотрит на тарелку" },
  // Сцена 5 — салфетка для Юсуфа; спасибо Билалу
  { kind: "hold", sec: 4.6, label: "салфетка Юсуфу", scene: "s5" },
  { kind: "line", id: 21, gapAfter: 0.7 },
  { kind: "line", id: 22, gapAfter: 0.9 },
  { kind: "line", id: 23, gapAfter: 0.7 },
  { kind: "line", id: 24, gapAfter: 0.8 },
  { kind: "line", id: 25, gapAfter: 0.7 },
  { kind: "line", id: 26, gapAfter: 1.3 },
  // Сцена 6 — Юсуф замечает и отдаёт последнюю салфетку
  { kind: "hold", sec: 4.2, label: "Юсуф замечает", scene: "s6" },
  { kind: "line", id: 27, gapAfter: 0.8 },
  { kind: "line", id: 28, gapAfter: 0.6 },
  { kind: "hold", sec: 2.0, label: "Юсуф берёт салфетку" },
  { kind: "line", id: 29, gapAfter: 0.2 },
  { kind: "hold", sec: 1.7, label: "Билал принимает" },
  { kind: "line", id: 30, gapAfter: 1.0 },
  { kind: "line", id: 31, gapAfter: 0.8 },
  { kind: "line", id: 32, gapAfter: 0.8 },
  { kind: "line", id: 33, gapAfter: 1.3 },
  { kind: "hold", sec: 2.6, label: "класс слушает" },
  // Сцена 7 — три вопроса зрителю
  { kind: "hold", sec: 2.4, label: "учитель к классу", scene: "s7" },
  { kind: "line", id: 34, gapAfter: 0 },
  { kind: "pause", id: "P1" },
  { kind: "line", id: 35, gapAfter: 1.4 },
  { kind: "line", id: 36, gapAfter: 0 },
  { kind: "pause", id: "P2" },
  { kind: "line", id: 37, gapAfter: 1.4 },
  { kind: "line", id: 38, gapAfter: 0 },
  { kind: "pause", id: "P3" },
  { kind: "line", id: 39, gapAfter: 1.0 },
  { kind: "line", id: 40, gapAfter: 1.6 },
  // Сцена 8 — «Бисмиллях», еда, «Альхамдулиллях», спасибо учителю
  { kind: "hold", sec: 2.4, label: "Юсуф к тарелке", scene: "s8" },
  { kind: "line", id: 41, gapAfter: 0.5 },
  { kind: "hold", sec: 7.8, label: "еда" },
  { kind: "line", id: 42, gapAfter: 0.8 },
  { kind: "line", id: 43, gapAfter: 0.7 },
  { kind: "line", id: 44, gapAfter: 0.9 },
  { kind: "line", id: 45, gapAfter: 0.9 },
  { kind: "hold", sec: 4.0, label: "финал: класс" },
];
