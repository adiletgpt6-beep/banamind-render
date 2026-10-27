// Палитра фильма BM-026 «Нравственные письма к Луцилию» (банан-ведущий, 16:9).
// «Мастерская внутренней свободы» — тёплая светлая бумага, чернильные контуры,
// бирюза (выбранное, ясное), янтарь (время, внимание), умеренный коралл
// (внешнее давление). Кадр всегда светлый: без тумана, bloom и тёмных сцен.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1f2a3d",
  inkSoft: "#4a5670",
  paper: "#fbf5e8",
  paperDark: "#efe2c6",
  cream: "#fff9ee",
  amber: "#e39a2d", // время, внимание
  amberSoft: "#f8d9a6",
  gold: "#e3a93a",
  yellow: "#ffd23f",
  teal: "#1f9a9a", // выбранное, ясное, опора
  tealDeep: "#167a7a",
  tealSoft: "#bfe6e2",
  coral: "#e8735f", // внешнее давление, шум
  coralSoft: "#f8cfc5",
  plum: "#7b5ea7", // предположения, страх
  plumSoft: "#ddd2ee",
  sage: "#6c9a6e",
  sageSoft: "#d3e6cc",
  sky: "#8fc3e6",
  glass: "#e9f4f6", // стенки прозрачной коробки
  red: "#cc4646", // только для зачёркиваний
  green: "#3f9b5a", // подтверждено
  steel: "#8892ab",
  white: "#ffffff",
};

// Фон каждой части фильма — своя освещённая гамма (без чёрного и тёмных кадров).
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#fdf3e1", "#f3dcc0"],
  time: ["#fdf2df", "#f5d9ae"],
  student: ["#f3f4ec", "#dfe3cf"],
  crowd: ["#fdeee8", "#f3d3c8"],
  fear: ["#f2eff7", "#dcd4ea"],
  enough: ["#f8f1de", "#ead8b0"],
  friends: ["#ecf6f3", "#cbe5de"],
  dignity: ["#f6f0e6", "#e5d6c0"],
  noise: ["#eef3f7", "#d3e1ec"],
  precepts: ["#f7f2e4", "#e6dcc0"],
  storm: ["#eef1f4", "#d6dde6"],
  good: ["#fdf4e2", "#f4dcae"],
  end: ["#fff6e4", "#f7dfb2"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
export const HEAVY = "Rubik, Nunito, sans-serif";
