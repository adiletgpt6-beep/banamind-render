// Палитра фильма BM-040 «Кого Рим считал своим?» (банан-ведущий, 16:9).
// «Мастерская городских ворот» — светлый камень-травертин, тёплая терракота
// ворот, бронза табличек, лазурь моря на условных картах, зелень Лация.
// Цвета групп людей меняются по сценам: ни один цвет не закреплён за «плохой»
// группой. Кадр всегда светлый: без тумана, bloom, тёмных сцен и натурализма.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1f2a3d",
  inkSoft: "#4a5670",
  paper: "#fbf5e8",
  paperDark: "#efe2c6",
  cream: "#fff9ee",
  stone: "#e9dfcc", // травертин ворот
  stoneDeep: "#c9b796",
  amber: "#e39a2d", // бронза табличек
  amberSoft: "#f8d9a6",
  gold: "#e3a93a",
  yellow: "#ffd23f",
  teal: "#1f9a9a", // свидетельство, документ
  tealDeep: "#167a7a",
  tealSoft: "#bfe6e2",
  coral: "#e8735f", // терракота, граница
  coralSoft: "#f8cfc5",
  plum: "#7b5ea7", // легенда, память
  plumSoft: "#ddd2ee",
  sage: "#6c9a6e", // поля Лация, условная схема
  sageSoft: "#d3e6cc",
  sky: "#8fc3e6", // море
  skySoft: "#d8ecf7",
  earth: "#d8c09a", // суша на условных картах
  earthSoft: "#efe2c9",
  glass: "#e9f4f6",
  red: "#cc4646", // только для зачёркиваний
  green: "#3f9b5a",
  steel: "#7d8aa8",
  steelSoft: "#d5dbe8",
  white: "#ffffff",
};

// Фон каждой части фильма — своя светлая гамма (без чёрного и тёмных кадров).
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#fdf3e1", "#f3dcc0"],
  cicero: ["#f6f0e6", "#e7d8c2"],
  origins: ["#f2eff7", "#ddd4ea"],
  inside: ["#eef6f4", "#cfe6e1"],
  conquest: ["#eef4f8", "#d2e2ee"],
  power: ["#f7f2e4", "#e8dcbc"],
  lives: ["#f1f6ea", "#d8e7c9"],
  provinces: ["#edf5f3", "#cfe5df"],
  end: ["#fff6e4", "#f7dfb2"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
export const HEAVY = "Rubik, Nunito, sans-serif";
