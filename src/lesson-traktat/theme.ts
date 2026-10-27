// Палитра и шрифт фильма «Трактат о природе» (банан-ведущий, 16:9).
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#24324a",
  inkSoft: "#4a5874",
  paper: "#fffaf0",
  cream: "#fff3d6",
  yellow: "#ffd23f",
  yellowDeep: "#f5b700",
  banana: "#ffe066",
  bananaShade: "#f2c230",
  bananaDark: "#c9961a",
  brown: "#6b4a1e",
  green: "#3fb67c",
  greenDeep: "#23895a",
  sky: "#6cc5f0",
  skyDeep: "#2f8fd0",
  coral: "#ff7a6b",
  red: "#e5484d",
  violet: "#8e6cf0",
  white: "#ffffff",
};

// Фон каждой части урока — свой мягкий цвет, чтобы зритель чувствовал смену темы.
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#fff6da", "#ffe9a8"],
  causes: ["#e6f6ff", "#bfe6fb"],
  itself: ["#eafbef", "#c4efd2"],
  nature: ["#f3edff", "#dccffd"],
  end: ["#fff1e8", "#ffd9c2"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
