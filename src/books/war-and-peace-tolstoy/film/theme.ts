// Палитра фильма BM-030 «Война и мир» (банан-ведущий, 16:9).
// Визуальная концепция «Масштаб выбора»: трёхслойная карта — личный выбор
// (силуэты, предметы, жесты), переживание войны (карты, геометрия событий),
// историческая перспектива (сеть ярких точек-решений). Кадр всегда освещён:
// глубокий синий, бумага старой карты, золото и чистые яркие точки без размытия.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1d2340",
  inkSoft: "#4a5276",
  night: "#22325c",
  indigo: "#2f4378",
  steel: "#8d9ab8",
  fog: "#cdd6ec",
  paper: "#f5ecd8",
  paperDark: "#e4d4b0",
  sepia: "#b89a6a",
  gold: "#f2b33d",
  goldDeep: "#c98a1c",
  yellow: "#ffd23f",
  amber: "#ff9f43",
  ember: "#ff7a3d", // зарево пожара, без крови
  sky: "#9cc7f0",
  skyDeep: "#5f8fd0",
  snow: "#eef4ff",
  green: "#5fa86a",
  greenDeep: "#3c7a4c",
  oak: "#6d8f3e",
  rose: "#f3a6b5",
  red: "#d9534f", // только для зачёркиваний и стрелок планов
  white: "#ffffff",
  // сеть точек — отдельные человеческие решения (чистые, насыщенные цвета)
  dots: ["#3fd6ff", "#ffd23f", "#ff8fc7", "#9be15d", "#b18cff", "#ff9f43", "#5cf2c8", "#ff6b6b"],
};

// Фон каждой части фильма — своя освещённая гамма (без чёрного).
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#26386a", "#4f6aa8"],
  society: ["#3b3a6e", "#a57e8e"],
  austerlitz: ["#4f78b8", "#c9dcf2"],
  pierre: ["#3a4a72", "#8f8fae"],
  natasha: ["#2f4d7a", "#b9a6c9"],
  families: ["#4a5a7a", "#d8b98c"],
  plan: ["#3d4d6e", "#a7a08a"],
  moscow: ["#4a3f6a", "#d9875a"],
  captivity: ["#2d3f6a", "#7d8fb8"],
  generals: ["#34406a", "#9a8f7a"],
  recovery: ["#5a7aa8", "#f0d2a0"],
  theory: ["#22325c", "#5a6fb0"],
  end: ["#5f7fc0", "#ffe0b0"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
