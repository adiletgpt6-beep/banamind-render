// Палитра фильма BM-021 «Психология влияния» (банан-ведущий, 16:9).
// «Студия решений»: светлые сине-лиловые фоны, стеклянная модель решения и семь
// цветных фильтров согласия. У каждого фильтра свой чистый цвет — по нему зритель
// узнаёт принцип в любой сцене. Кадр никогда не уходит в чёрное.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1d2340",
  inkSoft: "#4a5378",
  navy: "#27306a",
  indigo: "#3a4690",
  fog: "#d7dcf2",
  paper: "#f7f3ea",
  paperDark: "#e6dcc6",
  glass: "#e9f1ff",
  glassEdge: "#ffffff",
  yellow: "#ffd23f",
  gold: "#f2b636",
  red: "#e5484d", // только зачёркивания и «стоп», без драматизма
  green: "#2fb36a",
  white: "#ffffff",
  skin: "#f2d5bb",
  skinShade: "#e0b896",
  desk: "#8a5a3c",
  deskTop: "#a8724c",
};

// Семь фильтров согласия (порядок глав книги 2–8) — цвет, имя, короткая подпись.
export type FilterId = "recip" | "liking" | "social" | "authority" | "scarcity" | "commit" | "unity";
export const FILTERS: { id: FilterId; n: number; name: string; short: string; color: string; deep: string; light: string }[] = [
  { id: "recip", n: 1, name: "Взаимность", short: "подарок → долг?", color: "#16c2a3", deep: "#0b8f78", light: "#b9f3e6" },
  { id: "liking", n: 2, name: "Симпатия", short: "нравится → верю?", color: "#ff6b9a", deep: "#d0416f", light: "#ffd2e1" },
  { id: "social", n: 3, name: "Социальное доказательство", short: "все → значит, верно?", color: "#3d8bff", deep: "#1f5fcc", light: "#cfe2ff" },
  { id: "authority", n: 4, name: "Авторитет", short: "форма → знание?", color: "#9a6bff", deep: "#6c3fd6", light: "#e3d6ff" },
  { id: "scarcity", n: 5, name: "Дефицит", short: "мало → ценно?", color: "#ff9a2e", deep: "#d86d00", light: "#ffe0bd" },
  { id: "commit", n: 6, name: "Последовательность", short: "сказал «да» → должен?", color: "#45c35a", deep: "#2a8f3c", light: "#d2f5d7" },
  { id: "unity", n: 7, name: "Единство", short: "свой → прав?", color: "#ffc233", deep: "#d99400", light: "#fff0c2" },
];
export const FC = Object.fromEntries(FILTERS.map((f) => [f.id, f])) as Record<FilterId, (typeof FILTERS)[number]>;

// Фон каждой части фильма — освещённая гамма; части фильтров подкрашены их цветом.
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#2f3a7c", "#6a63b8"],
  auto: ["#2d4a86", "#5e86c8"],
  recip: ["#1f5a72", "#3f9aa0"],
  liking: ["#5a3a78", "#b46a9a"],
  social: ["#23407e", "#4f7fd0"],
  authority: ["#3a2f7a", "#7a62c4"],
  scarcity: ["#6a3a4a", "#c8805a"],
  commit: ["#24584a", "#5aa27a"],
  unity: ["#5e4a2a", "#c09a4a"],
  story: ["#33407e", "#8a7ab8"],
  defense: ["#2a4f7a", "#6fa4c8"],
  end: ["#4a5aa0", "#e0b48a"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const DISPLAY = "Rubik, Nunito, 'Segoe UI', sans-serif";
