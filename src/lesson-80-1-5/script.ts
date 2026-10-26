// Урок 1 «Аллах — наш Создатель», мини-фильм 5: «А лодочку сделал я!»
// (композиция Lesson80_1_5, 1920×1080, 30 fps, 4:05–5:00).
//
// Амир заканчивает бумажную лодочку и опускает её в воду. Юсуф спрашивает:
// «Ты говорил, что всё создал Аллах. А лодочку сделал Амир!» Учитель
// Мухаммад спокойно разбирает: Амир изменил форму готового листа; бумагу
// изготовили люди из древесины; дерево выросло в природе, которую создал
// Аллах. Амир вправе сказать «я сделал лодочку» — это его труд. В финале
// Юсуф учится первому сгибу рядом с Амиром.
//
// Файл без зависимостей от Remotion: его читают Node-скрипты озвучки,
// субтитров и тестов. Здесь только данные: формат, роли, 48 реплик,
// четыре обязательные паузы, порядок событий (биты), 25 учеников и предметы.

export const L815_VIDEO = {
  id: "Lesson80-1-5",
  output: "lesson-80-1-5",
  title: "А лодочку сделал я!",
  lesson: "Урок 1. Аллах — наш Создатель",
  episode: "80-1-5",
  width: 1920,
  height: 1080,
  fps: 30,
  // ориентир 4:30, допустимо 4:05–5:00
  targetSec: 270,
  minSec: 245,
  maxSec: 300,
  voiceDir: "audio/lesson-80-1-5",
} as const;

export const L815_FPS = L815_VIDEO.fps;

// ---------- Роли ----------
export type L815Role = "teacher" | "yusuf" | "amir" | "bilal" | "kids";

export const L815_ROLE_NAMES: Record<L815Role, string> = {
  teacher: "Мухаммад",
  yusuf: "Юсуф",
  amir: "Амир",
  bilal: "Билал",
  kids: "Дети",
};

// ---------- Сцены ----------
export type L815SceneId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8";

export const L815_SCENE_TITLES: Record<L815SceneId, string> = {
  s1: "1. Что получится?",
  s2: "2. А лодочку сделал Амир!",
  s3: "3. Что изменил Амир?",
  s4: "4. Откуда взялась бумага?",
  s5: "5. А природа?",
  s6: "6. Это твоя работа",
  s7: "7. Три коротких вопроса",
  s8: "8. Давай вместе",
};

// ---------- Реплики ----------
export type L815Line = {
  readonly id: string; // l01 … l48
  readonly n: number; // номер в сценарии
  readonly role: L815Role;
  readonly scene: L815SceneId;
  readonly text: string; // как в сценарии (субтитры, проверка)
  readonly spoken?: string; // вход TTS, если отличается (ударения, произношение)
  // Обязательная пауза для ответа зрителей после конца речи (с).
  readonly pauseAfter?: number;
  // Кто отвечает после паузы (реплика-ответ).
  readonly answer?: string;
  // Минимальный зазор перед началом речи после предыдущего события (с).
  readonly lead?: number;
};

const L = (n: number, role: L815Role, scene: L815SceneId, text: string, extra: Partial<L815Line> = {}): L815Line => ({
  id: `l${String(n).padStart(2, "0")}`,
  n,
  role,
  scene,
  text,
  ...extra,
});

export const L815_LINES: readonly L815Line[] = [
  // Сцена 1. «Что получится?»
  L(1, "yusuf", "s1", "Что ты делаешь?"),
  L(2, "amir", "s1", "Сейчас увидишь."),
  L(3, "teacher", "s1", "Давайте посмотрим на Амира."),
  L(4, "amir", "s1", "Вот! Лодочка!"),
  L(5, "yusuf", "s1", "Настоящая?"),
  L(6, "amir", "s1", "Бумажная. Но она может плавать."),
  // Сцена 2. «А лодочку сделал Амир!»
  L(7, "yusuf", "s2", "Подожди… Ты говорил, что всё создал Аллах."),
  L(8, "teacher", "s2", "Да. Аллах — Создатель всего мира."),
  L(9, "yusuf", "s2", "А лодочку сделал Амир!"),
  L(10, "amir", "s2", "Я сам её сложил. Смотри, даже складки видны."),
  L(11, "bilal", "s2", "Получается, надо понять, что сделал Амир, а откуда взялась бумага."),
  L(12, "teacher", "s2", "Именно. Сегодня в этом разберёмся."),
  // Сцена 3. «Что изменил Амир?»
  L(13, "teacher", "s3", "Ребята, из чего Амир сделал лодочку?", { pauseAfter: 4, answer: "l14" }),
  L(14, "yusuf", "s3", "Из бумаги!"),
  L(15, "amir", "s3", "Был лист. Я согнул его и получил лодочку."),
  L(16, "teacher", "s3", "Верно. Ты изменил форму листа. Сама бумага существовала до того, как ты приступил к работе."),
  L(17, "bilal", "s3", "Он взял готовый лист."),
  L(18, "teacher", "s3", "Да. А ещё умел его аккуратно сгибать."),
  // Сцена 4. «Откуда взялась бумага?»
  L(19, "yusuf", "s4", "А бумагу кто сделал?"),
  L(20, "teacher", "s4", "Её изготовили люди. Такую бумагу можно делать из древесины деревьев."),
  L(21, "amir", "s4", "Из дерева? Но оно же твёрдое!"),
  L(22, "teacher", "s4", "Древесину обрабатывают, получают массу из маленьких волокон. Из неё формируют и сушат тонкие листы."),
  L(23, "bilal", "s4", "Значит, лист в класс принесли готовым. А материал для бумаги взяли в природе."),
  L(24, "teacher", "s4", "Верно."),
  // Сцена 5. «А природа?»
  L(25, "teacher", "s5", "А древесина откуда?"),
  L(26, "yusuf", "s5", "Из деревьев!"),
  L(27, "teacher", "s5", "Садовник может посадить дерево и полить его. Как мы ухаживаем за нашим ростком."),
  L(28, "bilal", "s5", "Но садовник не сделал солнце и воду."),
  L(29, "teacher", "s5", "Верно. Аллах создал мир и нас. Он даровал нам зрение, слух и возможность учиться. В Коране говорится, что Аллах — Создатель всего."),
  L(30, "yusuf", "s5", "Значит, для лодочки понадобилось то, что Он создал?"),
  L(31, "teacher", "s5", "Да."),
  // Сцена 6. «Это твоя работа»
  L(32, "amir", "s6", "Тогда можно говорить: “Я сделал лодочку”?"),
  L(33, "teacher", "s6", "Конечно. Ты сам складывал бумагу, старался и получил результат."),
  L(34, "bilal", "s6", "Как пекарь печёт хлеб из муки?"),
  L(35, "teacher", "s6", "Да. Или плотник делает стол из древесины. Люди учатся, трудятся и делают полезные вещи, используя то, что Аллах создал."),
  L(36, "yusuf", "s6", "Амир, красивая лодочка!"),
  L(37, "amir", "s6", "Спасибо!"),
  // Сцена 7. «Три коротких вопроса»
  L(38, "teacher", "s7", "Из чего Амир сделал лодочку?", { pauseAfter: 4, answer: "l39" }),
  L(39, "yusuf", "s7", "Из готовой бумаги."),
  L(40, "teacher", "s7", "Можно ли Амиру сказать: “Я сделал эту игрушку”?", { pauseAfter: 5, answer: "l41" }),
  L(41, "bilal", "s7", "Да. Он потрудился."),
  L(42, "teacher", "s7", "А кто Создатель всего мира, в том числе и нас?", { pauseAfter: 5, answer: "l43" }),
  L(43, "kids", "s7", "Аллах!"),
  // Сцена 8. «Давай вместе»
  L(44, "yusuf", "s8", "Покажешь, как сложить такую?"),
  L(45, "amir", "s8", "Покажу. Держи лист."),
  L(46, "teacher", "s8", "Мы благодарим Аллаха за Его дары. Учимся, трудимся и делимся добром."),
  L(47, "yusuf", "s8", "Спасибо, Амир!"),
  L(48, "amir", "s8", "Давай вместе."),
];

export const L815_PAUSES = L815_LINES.filter((l) => l.pauseAfter).map((l) => ({ question: l.id, answer: l.answer!, sec: l.pauseAfter! }));

export const lineById = (id: string): L815Line => {
  const l = L815_LINES.find((x) => x.id === id);
  if (!l) throw new Error(`Нет реплики ${id}`);
  return l;
};

// ---------- Биты: порядок событий на шкале ----------
// Шкала собирается из фактической длительности озвучки: реплики идут
// друг за другом с естественными зазорами, содержательные действия (сгибы,
// опускание лодочки, наблюдение, схема на доске) имеют свою длительность,
// четыре обязательные паузы отсчитываются от конца речи вопроса.
export type L815Beat =
  | { readonly kind: "scene"; readonly id: L815SceneId }
  | { readonly kind: "line"; readonly id: string }
  // действие без речи: id (для сцены и звука) и длительность (с)
  | { readonly kind: "action"; readonly id: string; readonly sec: number };

const A = (id: string, sec: number): L815Beat => ({ kind: "action", id, sec });
const S = (id: L815SceneId): L815Beat => ({ kind: "scene", id });
const Ln = (n: number): L815Beat => ({ kind: "line", id: `l${String(n).padStart(2, "0")}` });

export const L815_BEATS: readonly L815Beat[] = [
  S("s1"),
  A("s1-hands", 3.0), // руки Амира и заготовка крупно
  Ln(1),
  Ln(2),
  Ln(3),
  A("s1-open", 10.0), // последние сгибы: раскрытие корпуса, борт
  Ln(4),
  A("s1-lift", 1.2), // показывает лодочку
  A("s1-water", 4.6), // опускает на воду
  Ln(5),
  Ln(6),
  A("s1-float", 9.0), // лодочка держится, рябь затухает

  S("s2"),
  A("s2-turn", 3.6), // Юсуф улыбается, задумывается, поворачивается к учителю
  Ln(7),
  Ln(8),
  Ln(9),
  A("s2-sample", 1.4), // Амир берёт сухой образец
  Ln(10),
  Ln(11),
  Ln(12),
  A("s2-end", 2.0),

  S("s3"),
  A("s3-sheet", 4.6), // учитель кладёт лист рядом с сухой лодочкой
  Ln(13), // пауза 4 с
  Ln(14),
  Ln(15),
  A("s3-creases", 5.0), // Амир показывает две линии сгиба
  Ln(16),
  Ln(17),
  Ln(18),
  A("s3-end", 2.2),

  S("s4"),
  A("s4-edge", 3.8), // Юсуф рассматривает край чистого листа
  Ln(19),
  Ln(20),
  Ln(21),
  Ln(22),
  A("s4-board", 6.5), // досматриваем схему: тонкий слой → сухой лист
  Ln(23),
  Ln(24),
  A("s4-end", 2.0),

  S("s5"),
  A("s5-window", 3.4), // возвращаемся в комнату, окно и росток
  Ln(25),
  Ln(26),
  Ln(27),
  A("s5-sprout", 4.4), // росток у окна, воспоминание о поливе
  Ln(28),
  Ln(29),
  Ln(30),
  Ln(31),
  A("s5-end", 1.6),

  S("s6"),
  A("s6-lift", 3.2), // Амир приподнимает сухую лодочку
  Ln(32),
  Ln(33),
  Ln(34),
  Ln(35),
  Ln(36),
  Ln(37),
  A("s6-return", 3.8), // образец возвращается на стол видимым движением

  S("s7"),
  A("s7-start", 3.2),
  Ln(38), // пауза 4 с
  Ln(39),
  Ln(40), // пауза 5 с
  Ln(41),
  Ln(42), // пауза 5 с
  Ln(43),
  A("s7-end", 1.8),

  S("s8"),
  A("s8-take", 2.6), // Юсуф берёт новый лист из стопки
  Ln(44),
  Ln(45),
  A("s8-show", 6.4), // Амир показывает первый сгиб
  Ln(46),
  Ln(47),
  Ln(48),
  A("s8-fold", 9.0), // Юсуф прижимает первый сгиб; итоговая фраза
];

// Зазор перед репликой по умолчанию (с): смена говорящего читается.
export const L815_LEAD = 0.42;
// Ответ после обязательной паузы начинается сразу по её окончании
// (с запасом в один кадр — не раньше).
export const L815_ANSWER_LEAD = 0.12;

// ---------- Ученики: ровно 25 мальчиков ----------
export type HairStyle = "short" | "curly" | "sidePart" | "buzz" | "wavy" | "fringe";
export type TopKind = "tee" | "shirt" | "sweater" | "hoodie" | "vest";

export type Pupil = {
  readonly id: string; // p01 … p25
  readonly name?: string;
  readonly age: number; // 4–12
  readonly main?: "yusuf" | "amir" | "bilal";
  readonly skin: string;
  readonly hair: string;
  readonly hairStyle: HairStyle;
  readonly top: TopKind;
  readonly topColor: string;
  readonly bottom: string;
  // место: ряд (0 — у столика, 1–3 — за ним) и позиция в ряду (−1 … 1)
  readonly row: 0 | 1 | 2 | 3;
  readonly slot: number;
  readonly seed: number;
};

const P = (id: string, age: number, p: Omit<Pupil, "id" | "age" | "seed">, seed: number): Pupil => ({ id, age, seed, ...p });

// Цвета кожи и волос — спокойная палитра; одежда повседневная, без
// уличной обуви (дети сидят на ковре в носках).
export const L815_PUPILS: readonly Pupil[] = [
  P("p01", 4, { name: "Юсуф", main: "yusuf", skin: "#F0C9A6", hair: "#2B211D", hairStyle: "short", top: "tee", topColor: "#F2C94C", bottom: "#4A5A7A", row: 0, slot: 0.75 }, 11),
  P("p02", 8, { name: "Амир", main: "amir", skin: "#E8B48D", hair: "#241C19", hairStyle: "sidePart", top: "sweater", topColor: "#2F5DA8", bottom: "#3F4656", row: 0, slot: 0 }, 12),
  P("p03", 11, { name: "Билал", main: "bilal", skin: "#D9A47E", hair: "#1F1A19", hairStyle: "short", top: "shirt", topColor: "#4E9C6E", bottom: "#3A3F4D", row: 0, slot: -0.72 }, 13),
  // ряд 1 (7 мальчиков)
  P("p04", 6, { skin: "#EBC19E", hair: "#3A2A22", hairStyle: "curly", top: "tee", topColor: "#D96C5A", bottom: "#4B5366", row: 1, slot: -0.9 }, 14),
  P("p05", 9, { skin: "#D8A27B", hair: "#211A18", hairStyle: "buzz", top: "hoodie", topColor: "#7A8FB3", bottom: "#373C48", row: 1, slot: -0.6 }, 15),
  P("p06", 5, { skin: "#F1CBA8", hair: "#4A3326", hairStyle: "fringe", top: "tee", topColor: "#9AC58B", bottom: "#56607A", row: 1, slot: -0.3 }, 16),
  P("p07", 10, { skin: "#E0AE88", hair: "#1E1816", hairStyle: "wavy", top: "shirt", topColor: "#E7DDC9", bottom: "#3C4252", row: 1, slot: 0 }, 17),
  P("p08", 7, { skin: "#E9B995", hair: "#2E2320", hairStyle: "short", top: "sweater", topColor: "#C96F8A", bottom: "#4A5168", row: 1, slot: 0.3 }, 18),
  P("p09", 12, { skin: "#D4A07C", hair: "#1C1715", hairStyle: "sidePart", top: "vest", topColor: "#5E6F8E", bottom: "#33384A", row: 1, slot: 0.6 }, 19),
  P("p10", 6, { skin: "#F0C6A4", hair: "#3B2B24", hairStyle: "curly", top: "tee", topColor: "#F0A35A", bottom: "#4E5A74", row: 1, slot: 0.9 }, 20),
  // ряд 2 (8 мальчиков)
  P("p11", 8, { skin: "#E3B08A", hair: "#241D1A", hairStyle: "buzz", top: "tee", topColor: "#6EA8C9", bottom: "#404656", row: 2, slot: -1.0 }, 21),
  P("p12", 5, { skin: "#F2CDAA", hair: "#43312A", hairStyle: "fringe", top: "sweater", topColor: "#D9B86A", bottom: "#4C5872", row: 2, slot: -0.71 }, 22),
  P("p13", 11, { skin: "#D7A47F", hair: "#1D1816", hairStyle: "short", top: "shirt", topColor: "#B9D2E8", bottom: "#353A49", row: 2, slot: -0.43 }, 23),
  P("p14", 9, { skin: "#E6B590", hair: "#2A1F1C", hairStyle: "wavy", top: "hoodie", topColor: "#8E7CC3", bottom: "#3B4154", row: 2, slot: -0.14 }, 24),
  P("p15", 7, { skin: "#EDBF9C", hair: "#352822", hairStyle: "curly", top: "tee", topColor: "#E8E2D4", bottom: "#4A5468", row: 2, slot: 0.14 }, 25),
  P("p16", 10, { skin: "#DBA981", hair: "#1F1917", hairStyle: "sidePart", top: "sweater", topColor: "#4F8E8B", bottom: "#394052", row: 2, slot: 0.43 }, 26),
  P("p17", 6, { skin: "#F0C7A3", hair: "#3E2C25", hairStyle: "short", top: "tee", topColor: "#F0B6A0", bottom: "#515C76", row: 2, slot: 0.71 }, 27),
  P("p18", 12, { skin: "#D2A079", hair: "#1B1614", hairStyle: "buzz", top: "shirt", topColor: "#DCE5D0", bottom: "#343A4A", row: 2, slot: 1.0 }, 28),
  // ряд 3 (7 мальчиков)
  P("p19", 8, { skin: "#E7B692", hair: "#2C2220", hairStyle: "fringe", top: "hoodie", topColor: "#A9B9D6", bottom: "#424859", row: 3, slot: -1.0 }, 29),
  P("p20", 5, { skin: "#F3CFAD", hair: "#46342B", hairStyle: "curly", top: "tee", topColor: "#F5D27A", bottom: "#4F5B78", row: 3, slot: -0.67 }, 30),
  P("p21", 10, { skin: "#DCAA84", hair: "#221B19", hairStyle: "wavy", top: "sweater", topColor: "#6D9DBE", bottom: "#394055", row: 3, slot: -0.33 }, 31),
  P("p22", 9, { skin: "#E4B38E", hair: "#2A201D", hairStyle: "short", top: "vest", topColor: "#8A9A7C", bottom: "#3E4557", row: 3, slot: 0.0 }, 32),
  P("p23", 7, { skin: "#EEC09E", hair: "#372A24", hairStyle: "sidePart", top: "tee", topColor: "#D8947E", bottom: "#4A5670", row: 3, slot: 0.33 }, 33),
  P("p24", 11, { skin: "#D6A37D", hair: "#1E1816", hairStyle: "buzz", top: "shirt", topColor: "#F0E6D2", bottom: "#353B4B", row: 3, slot: 0.67 }, 34),
  P("p25", 6, { skin: "#F1C8A6", hair: "#3F2E27", hairStyle: "fringe", top: "hoodie", topColor: "#9FC4A6", bottom: "#4D5873", row: 3, slot: 1.0 }, 35),
];

export const L815_PUPIL_COUNT = 25;
export const mainPupil = (who: "yusuf" | "amir" | "bilal"): Pupil => L815_PUPILS.find((p) => p.main === who)!;

// ---------- Предметы со стабильными идентификаторами ----------
export const L815_PROPS = {
  boatFloating: "boat-floating", // лодочка Амира из сцены 1, остаётся в ёмкости
  boatDry: "boat-dry", // сухой готовый образец для показа сгибов
  sheetFinal: "sheet-final", // лист Юсуфа в финале: остаётся на стадии первого сгиба
  sheetDemo: "sheet-demo", // обычный лист рядом с образцом (сцена 3, 4)
  stack: "paper-stack",
  basin: "water-basin",
  towel: "towel",
  sprout: "sprout-pot", // росток из фильма 4: тот же горшок, тот же размер
} as const;

// ---------- Экранные надписи ----------
export const L815_TEXT = {
  title: "А лодочку сделал я!",
  final: "Мы мастерим из того, что создал Аллах",
  finalLines: ["Мы мастерим из того,", "что создал Аллах"],
  board: {
    tree: "дерево",
    wood: "древесина",
    pulp: "масса волокон",
    sheet: "лист бумаги",
    baker: "пекарь",
    carpenter: "плотник",
  },
} as const;
