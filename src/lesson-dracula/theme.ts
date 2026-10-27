// Палитра фильма BM-033 «Дракула» (банан-ведущий, 16:9) — «Бюро невозможных
// доказательств»: тёплый янтарный свет рукописи против холодной синей ночи.
// Ночные части — глубокий синий, но не чёрный: банан, схемы и титры всегда
// контрастны. Кровавых цветов нет: тревога передаётся холодом и тенью,
// а не красным; «вишнёвый» — только для редких зачёркиваний и угрозы.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1d2333",
  inkSoft: "#4b5470",
  paper: "#f8eedb", // лист рукописи
  paperDark: "#e9d6b0",
  cream: "#fff8ea",
  amber: "#f0a640", // свет лампы, свидетельство
  amberSoft: "#fbdcaa",
  gold: "#e9b44c",
  yellow: "#ffd23f",
  night: "#18213d", // ночь
  nightMid: "#24335c",
  nightSoft: "#3b4f86",
  frost: "#9fc3f0", // холодный свет луны, сомнение
  frostSoft: "#d6e6fa",
  glass: "#eef5fb", // стенки прозрачных колб и листов
  teal: "#2aa39a", // проверено, общее знание
  tealDeep: "#1b7c74",
  tealSoft: "#c4ece7",
  plum: "#7d63b0", // догадка
  plumSoft: "#ddd3f0",
  wine: "#b4415a", // угроза, зачёркивание (не кровь)
  wineSoft: "#f2ccd4",
  coral: "#e8775f",
  coralSoft: "#f8d2c8",
  stone: "#8a8fa6", // камень замка
  stoneDark: "#5d6380",
  green: "#3f9b5a",
  red: "#c4424f",
  white: "#ffffff",
};

// Тон части: «night» — ночные сцены (замок, угроза), «paper» — сцены Бюро.
export const PART_TONE: Record<string, "night" | "paper"> = {
  intro: "night",
  harker: "paper",
  castle: "night",
  england: "paper",
  friends: "paper",
  seward: "paper",
  lucy: "night",
  helsing: "paper",
  editor: "paper",
  tech: "paper",
  threat: "night",
  pursuit: "night",
  lessons: "paper",
  end: "paper",
};

// Фон каждой части: верх и низ градиента.
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#1b2747", "#2c3d6c"],
  harker: ["#f8ecd3", "#ecd2a3"],
  castle: ["#17223f", "#2a3a68"],
  england: ["#f5efe2", "#e2d6bd"],
  friends: ["#f8eee0", "#ecd6bb"],
  seward: ["#eef1f3", "#d7dfe6"],
  lucy: ["#1d2a4c", "#33467a"],
  helsing: ["#f6efdf", "#e8d8b4"],
  editor: ["#fbf1dc", "#f1d9a6"],
  tech: ["#f0f2ec", "#dcdfd0"],
  threat: ["#1a2546", "#2f4173"],
  pursuit: ["#1e2b4f", "#3a4f86"],
  lessons: ["#f8eedb", "#ecd5ab"],
  end: ["#fbf1dc", "#f1d9a6"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
export const HEAVY = "Rubik, Nunito, sans-serif";
