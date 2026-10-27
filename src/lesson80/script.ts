// Проект lesson-80. Урок 1 «Аллах — наш Создатель».
// Мини-фильм 14 «Можно ли посчитать дары?» — обозначение 80-1-14,
// композиция Lesson80_1_14 (1920 × 1080, 30 к/с, ≈ 220 с).
//
// Сценарий — единственный источник текста реплик: 41 реплика, один раз,
// в исходном порядке. Номера реплик — технические ID, в кадре не показываются.
//
// Методическая основа (только для документации автора, не для кадра):
// Коран 16:18 — неисчислимость милостей (реплика 22 — изложение смысла,
// не дословный перевод); Коран 1:2 — «Хвала Аллаху»; «Сахих Муслим», 2734a —
// хвала после еды или питья; «Джами ат-Тирмизи», 1954 — благодарность людям.
// История со стаканом и рисунками — авторская педагогическая постановка.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки.

export const L80_VIDEO = {
  id: "Lesson80-1-14",
  code: "80-1-14",
  title: "Можно ли посчитать дары?",
  lesson: "Урок 1 «Аллах — наш Создатель»",
  output: "lesson-80-1-14-can-we-count-the-gifts",
  width: 1920,
  height: 1080,
  fps: 30,
  voiceDir: "audio/lesson80-1-14",
} as const;

export type L80Role = "teacher" | "yusuf" | "amir" | "bilal";

export type L80SceneId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8";

export type L80Line = {
  readonly id: string; // "01" … "41"
  readonly scene: L80SceneId;
  readonly role: L80Role;
  readonly text: string; // точный текст сценария (субтитры)
  // текст для синтеза, если произношению нужна подсказка; на экран не идёт
  readonly spoken?: string;
  // интонационная подсказка модели (аудиотег eleven_v3, не звучит)
  readonly tag?: string;
  readonly seed?: number;
  // реплика берётся из произнесения другой реплики (первые words слов)
  readonly derive?: { readonly from: string; readonly words: number };
};

export const L80_LINES: readonly L80Line[] = [
  // 01 — то же произнесение «Альхамдулиллях», что и в реплике 41
  { id: "01", scene: "s1", role: "yusuf", text: "Альхамдулиллях!", derive: { from: "41", words: 1 } },
  { id: "02", scene: "s1", role: "teacher", text: "Хвала Аллаху.", tag: "[warmly]", seed: 314 },
  { id: "03", scene: "s1", role: "yusuf", text: "Вода такая обычная. А без неё хочется пить.", tag: "[curious]" },
  { id: "04", scene: "s1", role: "teacher", text: "Мы часто привыкаем к тому, что нам помогает.", tag: "[calm]" },

  { id: "05", scene: "s2", role: "yusuf", text: "А сколько всего Аллах нам дал?", tag: "[curious]" },
  { id: "06", scene: "s2", role: "amir", text: "Давай посчитаем!", seed: 320 },
  { id: "07", scene: "s2", role: "bilal", text: "Я буду записывать." },
  { id: "08", scene: "s2", role: "teacher", text: "Назовите один дар, который вы замечаете сейчас.", tag: "[warmly]" },
  { id: "09", scene: "s2", role: "yusuf", text: "Вода!" },
  { id: "10", scene: "s2", role: "amir", text: "Еда.", seed: 320 },
  { id: "11", scene: "s2", role: "bilal", text: "Люди, которые о нас заботятся.", seed: 313 },

  { id: "12", scene: "s3", role: "yusuf", text: "А деревья?", tag: "[curious]" },
  { id: "13", scene: "s3", role: "amir", text: "И воздух, которым мы дышим.", seed: 320 },
  { id: "14", scene: "s3", role: "bilal", text: "И возможность учиться." },
  { id: "15", scene: "s3", role: "yusuf", text: "И друзья, которые помогают!", tag: "[happy]" },
  { id: "16", scene: "s3", role: "bilal", text: "Уже семь примеров." },
  { id: "17", scene: "s3", role: "yusuf", text: "А я ещё придумал!" },
  { id: "18", scene: "s3", role: "teacher", text: "Видите, мы замечаем всё больше даров.", tag: "[warmly]" },

  { id: "19", scene: "s4", role: "yusuf", text: "Если взять очень большой лист, всё поместится?", tag: "[curious]" },
  { id: "20", scene: "s4", role: "teacher", text: "Как вы считаете: можем ли мы перечислить все дары Аллаха?", tag: "[calm]" },
  { id: "21", scene: "s4", role: "amir", text: "Наверное, мы ещё многого не замечаем.", seed: 320 },
  {
    id: "22",
    scene: "s4",
    role: "teacher",
    text: "Да. В Коране говорится: если считать милости Аллаха, всех их не пересчитать.",
    tag: "[calm]",
  },
  { id: "23", scene: "s4", role: "bilal", text: "Но некоторые мы можем назвать и поблагодарить за них." },
  { id: "24", scene: "s4", role: "teacher", text: "Верно.", tag: "[warmly]" },

  { id: "25", scene: "s5", role: "yusuf", text: "А воду вы приготовили?", tag: "[curious]" },
  { id: "26", scene: "s5", role: "teacher", text: "Да. Люди позаботились, чтобы она была чистой и пригодной для питья.", tag: "[calm]", seed: 312 },
  { id: "27", scene: "s5", role: "bilal", text: "Мы благодарим Аллаха за Его дары и людей за заботу." },
  { id: "28", scene: "s5", role: "yusuf", text: "Спасибо, Мухаммад!", spoken: "Спасибо, Муха́ммад!", tag: "[happy]" },

  { id: "29", scene: "s6", role: "amir", text: "Можно мне тоже воды?", seed: 320 },
  { id: "30", scene: "s6", role: "teacher", text: "Конечно.", tag: "[warmly]" },
  { id: "31", scene: "s6", role: "teacher", text: "Как Юсуф может помочь другу?", tag: "[curious]" },
  { id: "32", scene: "s6", role: "yusuf", text: "Я подам чистый стакан.", tag: "[happy]" },
  { id: "33", scene: "s6", role: "amir", text: "Спасибо!", seed: 320 },

  { id: "34", scene: "s7", role: "yusuf", text: "Вот это — когда мы помогаем друг другу." },
  { id: "35", scene: "s7", role: "amir", text: "Ты помог мне получить воду.", seed: 320 },
  { id: "36", scene: "s7", role: "bilal", text: "Мы записали несколько примеров. Все дары на листе не перечислены." },
  { id: "37", scene: "s7", role: "teacher", text: "Зато вы научились замечать их и благодарить.", tag: "[warmly]" },

  { id: "38", scene: "s8", role: "yusuf", text: "Теперь я буду внимательнее смотреть." },
  { id: "39", scene: "s8", role: "amir", text: "И замечать, за что благодарен.", seed: 320 },
  { id: "40", scene: "s8", role: "bilal", text: "И помогать другим.", seed: 315 },
  { id: "41", scene: "s8", role: "yusuf", text: "Альхамдулиллях — Хвала Аллаху!", spoken: "Альхамдулилля́х — Хвала́ Алла́ху!", tag: "[happy]", seed: 311 },
];

export const L80_SCENES: readonly { readonly id: L80SceneId; readonly title: string }[] = [
  { id: "s1", title: "1. Стакан воды" },
  { id: "s2", title: "2. Начнём считать" },
  { id: "s3", title: "3. Список растёт" },
  { id: "s4", title: "4. Можно ли перечислить всё?" },
  { id: "s5", title: "5. Люди тоже трудились" },
  { id: "s6", title: "6. Благодарность в поступке" },
  { id: "s7", title: "7. Наши примеры" },
  { id: "s8", title: "8. Обычное и ценное" },
];

// Три интерактивные паузы: ровно 5 с (150 кадров) после полного окончания
// реплики-вопроса, до начала ответа.
export const L80_PAUSES = [
  { after: "08", before: "09" },
  { after: "20", before: "21" },
  { after: "31", before: "32" },
] as const;
export const L80_PAUSE_FRAMES = 150;
