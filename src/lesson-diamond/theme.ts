// Палитра фильма BM-027 «Ружья, микробы и сталь» (Джаред Даймонд; банан-ведущий, 16:9).
// «Лаборатория развилок истории» — светлый лабораторный стол, бумага с сеткой,
// стеклянные линзы-переменные (бирюза), зерно и поля (янтарь, шалфей), океан
// (небесный), микробы (коралл), сталь (серо-синий), спорные стрелки (слива).
// Кадр всегда светлый: без тумана, bloom, тёмных сцен и натуралистичного насилия.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1f2a3d",
  inkSoft: "#4a5670",
  paper: "#fbf5e8",
  paperDark: "#efe2c6",
  cream: "#fff9ee",
  amber: "#e39a2d", // зерно, запасы еды
  amberSoft: "#f8d9a6",
  gold: "#e3a93a",
  yellow: "#ffd23f",
  teal: "#1f9a9a", // линзы-переменные, сильная стрелка Даймонда
  tealDeep: "#167a7a",
  tealSoft: "#bfe6e2",
  coral: "#e8735f", // микробы, столкновения
  coralSoft: "#f8cfc5",
  plum: "#7b5ea7", // спорная или ослабленная стрелка
  plumSoft: "#ddd2ee",
  sage: "#6c9a6e", // растения, поля
  sageSoft: "#d3e6cc",
  sky: "#8fc3e6", // океан
  skySoft: "#d8ecf7",
  earth: "#c79a63", // суша на условных картах
  earthSoft: "#ecd7b5",
  glass: "#e9f4f6",
  red: "#cc4646", // только для зачёркиваний
  green: "#3f9b5a", // подтверждено по книге
  steel: "#7d8aa8", // сталь, металл
  steelSoft: "#d5dbe8",
  white: "#ffffff",
};

// Фон каждой части фильма — своя светлая гамма (без чёрного и тёмных кадров).
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#fdf3e1", "#f3dcc0"],
  yali: ["#eef6f4", "#cfe6e1"],
  cajamarca: ["#f6f0e6", "#e7d8c2"],
  start: ["#f3f4ec", "#dfe3cf"],
  food: ["#fbf3dc", "#efdcae"],
  domestic: ["#f1f6ea", "#d8e7c9"],
  axes: ["#eef4f8", "#d2e2ee"],
  germs: ["#fdf0ec", "#f2d6cd"],
  writing: ["#f7f2e4", "#e6dcc0"],
  tech: ["#eff1f6", "#d6dbe8"],
  power: ["#f6f0e9", "#e6d6c4"],
  regions: ["#edf5f3", "#cfe5df"],
  cost: ["#f4f1ee", "#e2dcd6"],
  limits: ["#f2eff7", "#dcd4ea"],
  end: ["#fff6e4", "#f7dfb2"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
export const HEAVY = "Rubik, Nunito, sans-serif";
