// Палитра фильма BM-004 «Думай медленно… решай быстро» (банан-ведущий, 16:9).
// Система 1 — тёплый оранжевый (быстрая), Система 2 — спокойный синий (медленная).
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
  intro: ["#fff6da", "#ffe6a3"],
  sys: ["#eaf4ff", "#c9e2fb"],
  traps: ["#fff0e6", "#ffd6bf"],
  conf: ["#f1eeff", "#d9d0fb"],
  choice: ["#e9fbf1", "#c2eed6"],
  selves: ["#fdeef6", "#f6cde2"],
  end: ["#fff6da", "#ffe0a8"],
};

// персонажи-метафоры книги
export const S1 = { main: "#ff9a3d", deep: "#e0701a", light: "#ffd2a6" };
export const S2 = { main: "#4f8fe8", deep: "#2c63b8", light: "#cfe1fb" };

export const FONT = "Nunito, 'Segoe UI', sans-serif";
