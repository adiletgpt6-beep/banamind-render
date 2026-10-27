// Палитра фильма BM-035 «Сила привычки» (Чарлз Дахигг; банан-ведущий, 16:9).
// «Лаборатория невидимых кнопок» — светлый город, над которым можно открыть
// прозрачный слой петли: яркая точка СИГНАЛ (оранжевая), плавная траектория
// ДЕЙСТВИЕ (лазурная), мягкое свечение НАГРАДА (золотая), ТЯГА — фиолетовая.
// Кадр всегда светлый: без тумана, тёмных сцен и натуралистичных подробностей.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1f2a3d",
  inkSoft: "#4a5670",
  paper: "#fbf6ec",
  paperDark: "#ece2cf",
  cream: "#fff9ee",
  // три цвета петли привычки
  cue: "#ff7a3d", // СИГНАЛ
  cueSoft: "#ffd9c4",
  routine: "#2f8fd8", // ДЕЙСТВИЕ
  routineSoft: "#cfe5f7",
  reward: "#f2b01e", // НАГРАДА
  rewardSoft: "#fde9b3",
  crave: "#8a63d2", // ТЯГА / предвкушение
  craveSoft: "#e2d6f6",
  // остальное
  amber: "#e39a2d",
  amberSoft: "#f8d9a6",
  gold: "#e3a93a",
  yellow: "#ffd23f",
  teal: "#1f9a9a",
  tealDeep: "#167a7a",
  tealSoft: "#bfe6e2",
  coral: "#e8735f",
  coralSoft: "#f8cfc5",
  plum: "#7b5ea7",
  plumSoft: "#ddd2ee",
  sage: "#6c9a6e",
  sageSoft: "#d3e6cc",
  sky: "#8fc3e6",
  skySoft: "#d8ecf7",
  brick: "#d98c6a",
  brickSoft: "#f3d6c6",
  stone: "#9aa3b5",
  stoneSoft: "#e3e7ef",
  glass: "#eef6fb",
  red: "#cc4646", // только для зачёркиваний
  green: "#3f9b5a",
  white: "#ffffff",
};

// Фон каждой части фильма — своя светлая гамма (без чёрного и тёмных кадров).
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#fdf3e6", "#f4dcc6"],
  what: ["#f1f5fb", "#d9e4f2"],
  brain: ["#eef3fb", "#d3dff0"],
  loop: ["#fdf5ea", "#f3e1c8"],
  craving: ["#f5f0fb", "#e1d6f1"],
  test: ["#eef7f3", "#d1e8de"],
  change: ["#f2f7ec", "#dbe9cc"],
  keystone: ["#fbf3e3", "#efdcb4"],
  teams: ["#eef4f8", "#d2e2ee"],
  crisis: ["#fbf0ec", "#f0d9cf"],
  society: ["#f3f1f8", "#dcd8ec"],
  choice: ["#f4f1ee", "#e3dcd4"],
  protocol: ["#fff7e6", "#f7e2b8"],
  end: ["#fff6e4", "#f7dfb2"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
export const HEAVY = "Rubik, Nunito, sans-serif";
