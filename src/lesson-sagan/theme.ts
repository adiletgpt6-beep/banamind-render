// Палитра фильма «Космос» (BanaMind, банан-ведущий, 16:9): тёмно-синий космос
// за окном обсерватории, тёплая латунь рамы окна, чистые светлые точки звёзд.
// Чёрный не используется как фон: глубокий синий, чтобы герой и подписи читались.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  night: "#0b1230", // самый тёмный космос, текст на светлых ярлыках
  space: "#121a40",
  deep: "#1c2656",
  glass: "rgba(20, 30, 70, 0.84)", // полупрозрачная панель схемы
  glassLine: "rgba(170, 196, 255, 0.4)",
  text: "#f1f5ff", // основной текст на космосе
  dim: "#b4c2e8", // вторичный текст
  faint: "#66759f",
  ink: "#0b1230",
  inkSoft: "#93a6da", // стрелки и линии по умолчанию
  white: "#ffffff",
  yellow: "#ffd23f",
  yellowDeep: "#f5b700",
  amber: "#ffb347",
  orange: "#ff8a3d",
  red: "#ff5a5f",
  coral: "#ff8a7a",
  green: "#4fdc94",
  greenDeep: "#23a96b",
  sky: "#86d6ff",
  skyDeep: "#3b9cff",
  cyan: "#62efe4",
  violet: "#ad92ff",
  violetDeep: "#7a5cf0",
  pink: "#ff83d3",
  steel: "#8c99b8",
  blue: "#4f7dff",
  brass: "#c9a15a", // рама окна обсерватории
  brassDark: "#7d6230",
  earth: "#3f8cff",
  land: "#46c37b",
  mars: "#e0703f",
  venus: "#f0c674",
};

// Фон каждой части — свой оттенок неба за окном.
export const PART_BG: Record<string, [string, string, string]> = {
  // верх, низ, цвет мягкого свечения
  intro: ["#0e1534", "#1c2654", "#3b4fb8"],
  measure: ["#13224a", "#2a3d6e", "#e6a24a"],
  models: ["#111733", "#272250", "#b0884f"],
  planets: ["#160f2c", "#3a1f3a", "#e0703f"],
  travel: ["#0d1532", "#1b2e5c", "#5fa8ff"],
  light: ["#0c1235", "#1a2a62", "#86d6ff"],
  stars: ["#140f30", "#33204e", "#ffb347"],
  galaxies: ["#0d0f2e", "#241b52", "#ad92ff"],
  life: ["#0b1a30", "#123e4a", "#4fdc94"],
  search: ["#0d1236", "#1d2a63", "#62efe4"],
  earth: ["#0c1838", "#173e66", "#3f8cff"],
  end: ["#111737", "#2c2a58", "#ffd23f"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
