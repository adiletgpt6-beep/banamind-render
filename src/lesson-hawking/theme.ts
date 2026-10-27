// Палитра фильма «Краткая история времени» (BanaMind, банан-ведущий, 16:9):
// глубокий космос, звёздный свет, тёплый янтарь звёзд и горячего газа,
// холодный голубой света и пространства-времени. Текст на космосе — светлый,
// на жёлтых ярлыках — тёмный.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  night: "#0b1026", // самый тёмный космос, текст на светлых ярлыках
  space: "#141b3d",
  deep: "#1d2752",
  glass: "rgba(22, 30, 66, 0.78)", // полупрозрачная панель схемы
  glassLine: "rgba(160, 190, 255, 0.35)",
  text: "#eef3ff", // основной текст на космосе
  dim: "#a9b8e0", // вторичный текст
  faint: "#5d6c9c",
  ink: "#0b1026",
  inkSoft: "#8fa2d6", // стрелки и линии по умолчанию
  white: "#ffffff",
  yellow: "#ffd23f",
  yellowDeep: "#f5b700",
  amber: "#ffad42",
  orange: "#ff7b3a",
  red: "#ff5a5f",
  coral: "#ff8a7a",
  green: "#47d68f",
  greenDeep: "#23a96b",
  sky: "#7fd3ff",
  skyDeep: "#3b9cff",
  cyan: "#5ff0e6",
  violet: "#a98bff",
  violetDeep: "#7a5cf0",
  pink: "#ff7fd1",
  steel: "#8c99b8",
  blue: "#4f7dff",
};

// Фон каждой части — свой оттенок космоса, чтобы зритель чувствовал смену темы.
export const PART_BG: Record<string, [string, string, string]> = {
  // верх, низ, цвет туманности
  intro: ["#0d1330", "#1b2350", "#3b4fb8"],
  models: ["#10152f", "#26214a", "#a8734a"],
  light: ["#0c1233", "#1a2a5e", "#3b9cff"],
  expand: ["#0a1430", "#123a52", "#2fb5b0"],
  quantum: ["#120f33", "#2a1b55", "#a98bff"],
  holes: ["#07080f", "#1a1222", "#ff7b3a"],
  arrows: ["#0e1030", "#2d1a46", "#ff7fd1"],
  unity: ["#0b1430", "#1a2d55", "#5ff0e6"],
  end: ["#101634", "#2e2a55", "#ffad42"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
