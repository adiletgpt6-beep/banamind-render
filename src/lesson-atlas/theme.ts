// Палитра и шрифт фильма BM-006 «Атлант расправил плечи» (разбор ознакомительного
// фрагмента первой части). Тот же банан-ведущий; фон — светлый «индустриальный»:
// небо, сталь, рельсы и сине-зелёный металл из романа. Кадр не затемняется.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1f2a3d",
  inkSoft: "#4c5a72",
  paper: "#fbf8f1",
  cream: "#fff3d6",
  yellow: "#ffd23f",
  yellowDeep: "#f5b700",
  banana: "#ffe066",
  steel: "#8796ab",
  steelDark: "#56647a",
  steelLight: "#c9d3df",
  rail: "#6e5a48",
  metal: "#3fb6a8", // «сине-зелёный» риарден-металл
  metalDeep: "#23867c",
  fire: "#ff8a3d",
  fireDeep: "#e4572e",
  sky: "#7cc4ec",
  skyDeep: "#2f86c4",
  green: "#3fb67c",
  greenDeep: "#23895a",
  coral: "#ff7a6b",
  red: "#e5484d",
  violet: "#8e6cf0",
  gold: "#e9b949",
  white: "#ffffff",
};

// Фон каждой части — свой мягкий цвет, кадр всегда светлый.
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#eef3fa", "#d6e3f3"],
  world: ["#f4efe6", "#e6dccb"],
  dagny: ["#e8f4fb", "#c6e3f4"],
  rearden: ["#e9f7f5", "#c5ebe5"],
  rules: ["#f6eef2", "#ead6df"],
  choice: ["#f2effb", "#ddd5f6"],
  end: ["#fff4e6", "#ffdcb8"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
