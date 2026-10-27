// Палитра и шрифт фильма BanaMind «Психология денег» (банан-ведущий, 16:9).
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1f2a44",
  inkSoft: "#4a5874",
  paper: "#fffaf0",
  cream: "#fff3d6",
  yellow: "#ffd23f",
  yellowDeep: "#f5b700",
  orange: "#ff9f43",
  green: "#3fb67c",
  greenDeep: "#23895a",
  sky: "#6cc5f0",
  skyDeep: "#2f8fd0",
  teal: "#1fa59a",
  coral: "#ff7a6b",
  red: "#e5484d",
  violet: "#8e6cf0",
  pink: "#ff8fb1",
  navy: "#2b3a67",
  wood: "#b07a45",
  grey: "#9aa5b8",
  white: "#ffffff",
  money: "#4caf6e",
  moneyDeep: "#2e7d4f",
  gold: "#f2c14e",
};

// Фон каждой части — свой мягкий цвет, чтобы зритель чувствовал смену темы.
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#fff6da", "#ffe3a3"],
  luck: ["#eef4ff", "#cfe0fb"],
  enough: ["#fff0e6", "#ffd6bd"],
  time: ["#e9f8ef", "#c4ebd3"],
  freedom: ["#e6f6ff", "#bde6fb"],
  risk: ["#f3eeff", "#d9cdfb"],
  mind: ["#fff1f4", "#ffd2dc"],
  end: ["#fffbe0", "#ffe9a0"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
