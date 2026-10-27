// Палитра фильма BM-032 «Джейн Эйр» (банан-ведущий, 16:9).
// «Мастерская голоса»: светлая бумага, чёткие тёмные контуры, золото
// собственного голоса Джейн (точки пути решения), у каждого места — своя
// освещённая гамма: красная комната, сине-серый Ловуд, тёплый Тернфилд,
// сиреневая пустошь, зелёный Мур-Хаус. Кадр всегда светлый и читаемый.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1f2a3d",
  inkSoft: "#4a5670",
  paper: "#fbf5e8",
  paperDark: "#efe2c6",
  cream: "#fff9ee",
  gold: "#f0a92e", // голос Джейн, путь решения
  goldDeep: "#c27f12",
  yellow: "#ffd23f",
  red: "#cf3f4b", // красная комната, давление
  redSoft: "#f6c4c4",
  rose: "#e0697a",
  roseSoft: "#f6c3c7",
  slate: "#5f7fa6", // Ловуд
  slateSoft: "#cdd9e8",
  teal: "#2f8f9d",
  tealSoft: "#b8dfe3",
  amber: "#d98b3a", // Тернфилд, свечи
  amberSoft: "#f6d9b0",
  heather: "#8b6bb0", // пустошь
  heatherSoft: "#ddd0ec",
  sage: "#5f9a6a", // Мур-Хаус, Риверсы
  sageSoft: "#cfe3c4",
  ice: "#6aa9d8", // долг Сент-Джона
  iceSoft: "#d3e8f6",
  plum: "#7d4f86",
  plumSoft: "#dcc6e2",
  sky: "#9cc6e8",
  brick: "#b8664a",
  green: "#3f9b5a",
  steel: "#8892ab",
  white: "#ffffff",
};

// Фон каждой части фильма — своя освещённая гамма (без чёрного и тёмных кадров).
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#fff6e6", "#f6dfbf"],
  gateshead: ["#fdeeea", "#f3cfc8"],
  lowood: ["#eef3f8", "#d2deea"],
  thornfield: ["#fdf2e2", "#f1d8b4"],
  proposal: ["#f5f1e2", "#dfe6c8"],
  wedding: ["#f6eef3", "#e2cfdc"],
  moor: ["#f3eef8", "#ddd2ea"],
  rivers: ["#eef6ea", "#d2e5c8"],
  stjohn: ["#eef5fa", "#cfe2f0"],
  return: ["#fdf3e6", "#f0dcc0"],
  end: ["#fff6e2", "#f9e0ac"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
export const HEAVY = "Rubik, Nunito, sans-serif";
