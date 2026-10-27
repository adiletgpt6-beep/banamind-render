// «Посмотри на небо!» — сура «Аль-Имран», аяты 190–191. Muslim Kids, 5–12 лет.
//
// Утверждённый сценарий: текст озвучки не менять без согласования.
// Типы текста (исламские правила проекта):
//   explain — образовательное объяснение;
//   meaning — пересказ смысла аята (не цитата);
//   quote   — часть аята в переводе смысла (3:191), помечается в кадре.

export const VIDEO = {
  id: "muslim-kids-ali-imran-190-191",
  composition: "MuslimKidsAliImran190191",
  title: "Посмотри на небо!",
  voiceDir: "muslim-kids/ali-imran/voice",
  sfxDir: "muslim-kids/ali-imran/sfx",
} as const;

// Голос: ElevenLabs multilingual v2 (рабочий TTS проекта, ключ — секрет CI).
// Eric — мягкий тёплый рассказчик, уже проверен на русском детском уроке проекта.
// Темп чуть ниже обычного: ролик для детей.
export const VOICE = {
  name: "Eric (ElevenLabs, multilingual v2)",
  voiceId: "cjVigY5qzO86Huf0OWal",
  modelId: "eleven_multilingual_v2",
  seed: 190191,
  settings: {
    stability: 0.46,
    similarity_boost: 0.8,
    style: 0.3,
    use_speaker_boost: true,
    speed: 0.92,
  },
} as const;

export type LineKind = "explain" | "meaning" | "quote";
export type Line = {
  readonly id: string;
  readonly text: string;
  // произношение для синтеза, если отличается от текста
  readonly say?: string;
  // своё зерно синтеза (другой дубль), если общий дубль не прошёл проверку
  readonly seed?: number;
  readonly kind: LineKind;
  // пауза перед репликой, с (для первой — от начала сцены)
  readonly before: number;
};
export type Scene = {
  readonly id: string;
  readonly title: string;
  // утверждённая длительность сцены, с (сцена может стать длиннее под речь)
  readonly planned: number;
  // минимальный «хвост» после последнего слова, с
  readonly tail: number;
  readonly lines: readonly Line[];
};

export const SCENES: readonly Scene[] = [
  {
    id: "s1",
    title: "Почему?",
    planned: 6,
    tail: 1.3,
    lines: [
      { id: "s1a", text: "Вчера было темно.", kind: "explain", before: 0.9 },
      {
        id: "s1b",
        text: "А сегодня снова светло.",
        kind: "explain",
        before: 0.35,
      },
      {
        id: "s1c",
        text: "Ты когда-нибудь думал — почему?",
        kind: "explain",
        before: 0.4,
      },
    ],
  },
  {
    id: "s2",
    title: "Земля вращается",
    planned: 8,
    tail: 1.6,
    lines: [
      {
        id: "s2a",
        text: "Смотри: Земля вращается.",
        kind: "explain",
        before: 1.1,
      },
      {
        id: "s2b",
        text: "С одной стороны день, с другой — ночь.",
        kind: "explain",
        before: 0.45,
      },
    ],
  },
  {
    id: "s3",
    title: "Коран",
    planned: 10,
    tail: 1.9,
    lines: [
      {
        id: "s3a",
        text: "Но Коран предлагает нам не только узнать, как это происходит, но и задуматься о самом творении.",
        kind: "explain",
        before: 1.0,
      },
    ],
  },
  {
    id: "s4",
    title: "Знамения",
    planned: 10,
    tail: 1.3,
    lines: [
      {
        id: "s4a",
        text: "В суре «Аль-Имран» говорится:",
        kind: "explain",
        before: 0.5,
      },
      {
        id: "s4b",
        text: "небо, земля и смена дня и ночи — знамения для людей, которые размышляют.",
        kind: "meaning",
        before: 0.3,
      },
    ],
  },
  {
    id: "s5",
    title: "Что такое знамение",
    planned: 11,
    tail: 1.8,
    lines: [
      { id: "s5a", text: "Что такое знамение?", kind: "explain", before: 0.7 },
      {
        id: "s5b",
        text: "Это то, что помогает нам остановиться, посмотреть вокруг и задуматься об Аллахе.",
        kind: "explain",
        before: 0.6,
      },
    ],
  },
  {
    id: "s6",
    title: "Господь наш!",
    planned: 9,
    tail: 2.4,
    lines: [
      { id: "s6a", text: "Верующие говорят:", kind: "explain", before: 0.6 },
      {
        id: "s6b",
        text: "«Господь наш! Ты не сотворил это понапрасну».",
        kind: "quote",
        // ударения — чёткое «сотвори́л э́то» без слияния в «сотворила»
        say: "«Господь наш! Ты не сотвори́л э́то понапрасну».",
        before: 0.55,
      },
    ],
  },
  {
    id: "s7",
    title: "Твоя очередь",
    planned: 6,
    tail: 3.2,
    lines: [
      {
        id: "s7a",
        text: "А теперь твоя очередь.",
        kind: "explain",
        before: 0.6,
      },
      { id: "s7b", text: "Посмотри на небо.", kind: "explain", before: 0.35 },
      {
        id: "s7c",
        text: "Что удивляет тебя больше всего?",
        kind: "explain",
        before: 0.45,
      },
    ],
  },
];

export const LINES: readonly Line[] = SCENES.flatMap((s) => s.lines);

// Подписи к цитате (сцена 6): разграничение цитаты и пересказа.
export const AYAH = {
  ref: "Сура «Аль-Имран», 3:191",
  note: "Часть аята. Перевод смысла.",
  // «Раббанā мā халякта хāзā бāтылян» — часть аята 3:191, орфография Tanzil (simple, с огласовками)
  arabic: "رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا",
  surahArabic: "سُورَةُ آلِ عِمْرَانَ",
} as const;
