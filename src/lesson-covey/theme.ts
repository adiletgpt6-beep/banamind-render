// Палитра фильма BM-022 «7 навыков высокоэффективных людей» (банан-ведущий, 16:9).
// «Семь развилок одного дня»: дневной светлый мир — небо, бирюза дорожки «выбор»,
// коралловая дорожка «автопилот», солнечное золото. Кадр никогда не уходит в чёрное.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1d2a44",
  inkSoft: "#46557a",
  white: "#ffffff",
  paper: "#fffaf0",
  paperDark: "#f1e6cf",
  sky: "#8fd0ff",
  skyDeep: "#3f86d6",
  sun: "#ffc93c",
  sunDeep: "#f2a516",
  yellow: "#ffd23f",
  teal: "#16b3a2", // дорожка «выбор»
  tealDeep: "#0d8478",
  tealSoft: "#bff0e8",
  coral: "#f2735f", // дорожка «автопилот»
  coralDeep: "#c9503e",
  coralSoft: "#ffd6cd",
  grass: "#7cc86b",
  grassDeep: "#4e9a43",
  violet: "#7d6bd6",
  violetSoft: "#d9d1ff",
  rose: "#ff8fa8",
  steel: "#9aa6c4",
  fog: "#e7ecf7",
  wood: "#b98055",
  woodDeep: "#8a5a36",
  green: "#2fbf71",
  red: "#e24b4b", // только зачёркивания
  gold: "#ffcf4a",
  goldDeep: "#d79a1a",
};

// Цвета семи навыков — сквозная кодировка развилок.
export const HABIT: Record<number, { color: string; soft: string; name: string; short: string }> = {
  1: { color: "#ff8a3d", soft: "#ffe0c9", name: "Будьте проактивны", short: "Выбор ответа" },
  2: { color: "#3d8bff", soft: "#d6e6ff", name: "Начинайте, представляя конечную цель", short: "Образ цели" },
  3: { color: "#ff5a7a", soft: "#ffd6df", name: "Сначала делайте то, что необходимо делать сначала", short: "Сначала главное" },
  4: { color: "#2fbf71", soft: "#d3f3e1", name: "Думайте в духе Выиграл/Выиграл", short: "Выигрыш обоих" },
  5: { color: "#9b6bff", soft: "#e7dcff", name: "Сначала стремитесь понять, потом — быть понятым", short: "Сначала понять" },
  6: { color: "#f2b200", soft: "#fff0c2", name: "Достигайте синергии", short: "Третье решение" },
  7: { color: "#19b6c9", soft: "#cdf2f7", name: "Затачивайте пилу", short: "Восстановление" },
};

// Фон каждой части фильма — светлая дневная гамма (банан хорошо виден на холодных тонах).
export const PART_BG: Record<string, [string, string]> = {
  cold: ["#5a7fd8", "#a7cdf6"],
  frame: ["#4b83c9", "#a9dbe8"],
  h1: ["#3f78cf", "#8fc8f1"],
  h2: ["#2f6db3", "#86d2cb"],
  h3: ["#5662c6", "#a7acf0"],
  bridge: ["#2a8a9a", "#9fe0d0"],
  h4: ["#2b8f69", "#a9e0b6"],
  h5: ["#6656c4", "#bdaef2"],
  h6: ["#3a6cc0", "#e9b9a8"],
  h7: ["#2689ab", "#b2e5d6"],
  system: ["#4a74cf", "#ffd8a0"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const DISPLAY = "Rubik, Nunito, 'Segoe UI', sans-serif";
