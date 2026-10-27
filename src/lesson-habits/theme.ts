// Палитра и шрифт фильма BanaMind «Атомные привычки» (банан-ведущий, 16:9).
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
};

// Фон каждой части — свой мягкий цвет, чтобы зритель чувствовал смену темы.
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#fff6da", "#ffe3a3"],
  basics: ["#fff0e6", "#ffd6bd"],
  obvious: ["#e6f4ff", "#bfe0fb"],
  attractive: ["#fdeef5", "#f9cfe1"],
  easy: ["#e8faf1", "#c2eed7"],
  satisfying: ["#fffbe0", "#ffe9a0"],
  master: ["#f1ecff", "#d6cbfb"],
  end: ["#fff1e8", "#ffd9c2"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
