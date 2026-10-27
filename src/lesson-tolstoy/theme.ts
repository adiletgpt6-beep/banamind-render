// Палитра фильма «Война и мир» (BanaMind, банан-ведущий, 16:9): глубокий
// чернильно-синий стол картографа, тёплое золото личных историй, холодная сталь
// войны и яркие цветные точки людей — слой исторической перспективы.
// Чёрный не используется как фон: глубокий синий, чтобы герой и подписи читались.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  night: "#0c1428", // самый тёмный фон, текст на светлых ярлыках
  space: "#121c38",
  deep: "#1a2748",
  glass: "rgba(18, 28, 60, 0.86)", // полупрозрачная панель схемы
  glassLine: "rgba(170, 196, 255, 0.38)",
  paper: "#f3ead8", // бумага карты и страницы книги
  paperDark: "#d9c9a6",
  inkBrown: "#4a3826",
  text: "#f3f6ff",
  dim: "#b7c3e3",
  faint: "#6d7aa0",
  ink: "#0c1428",
  inkSoft: "#94a6d6", // стрелки и линии по умолчанию
  white: "#ffffff",
  yellow: "#ffd23f",
  yellowDeep: "#f5b700",
  gold: "#e8b860", // слой личного выбора
  amber: "#ffb347",
  orange: "#ff8a3d",
  red: "#ff5a5f",
  coral: "#ff8a7a",
  green: "#4fdc94",
  greenDeep: "#23a96b",
  sky: "#86d6ff",
  skyDeep: "#3b9cff",
  cyan: "#62efe4",
  violet: "#ad92ff",
  violetDeep: "#7a5cf0",
  pink: "#ff83d3",
  steel: "#8c99b8", // слой войны
  blue: "#4f7dff",
  french: "#5b8cff", // условный цвет французской армии на схемах
  russian: "#ff6b6b", // условный цвет русской армии на схемах
  snow: "#e9f1ff",
};

// Цвета героев — одинаковые во всех сценах (силуэт, точка, подпись).
export const HERO = {
  pierre: "#4fdc94",
  andrei: "#86d6ff",
  natasha: "#ff83d3",
  marya: "#ad92ff",
  nikolai: "#ffb347",
  sonya: "#f0c9a0",
  karataev: "#e8d27a",
  kutuzov: "#ff8a7a",
  napoleon: "#5b8cff",
  helene: "#c7a8ff",
  anatole: "#9aa7c7",
  petya: "#ffd23f",
  oldPrince: "#b7c3e3",
  vasily: "#8c99b8",
  dolokhov: "#7f8db3",
};

// Фон каждой части — свой оттенок «стола карты».
export const PART_BG: Record<string, [string, string, string]> = {
  // верх, низ, цвет мягкого свечения
  intro: ["#0f1830", "#1c2a52", "#5f7cff"],
  society: ["#1a1630", "#352646", "#e8b860"],
  andrei: ["#0f1b36", "#22406e", "#86d6ff"],
  pierre: ["#0f1d2c", "#1b3f45", "#4fdc94"],
  natasha: ["#1b1430", "#40244a", "#ff83d3"],
  family: ["#1b1626", "#3f2c2a", "#ffb347"],
  borodino: ["#151826", "#363a4a", "#ff8a3d"],
  moscow: ["#1d1420", "#4a2a26", "#ff8a3d"],
  captivity: ["#0d1530", "#1d2a5e", "#e9f1ff"],
  generals: ["#111830", "#2b2f55", "#5b8cff"],
  recovery: ["#121c2c", "#24423e", "#4fdc94"],
  epilogue: ["#121530", "#2c2a58", "#ad92ff"],
  end: ["#111737", "#2c2a58", "#ffd23f"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
