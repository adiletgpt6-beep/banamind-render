// Палитра фильма BM-005 «48 законов власти» (банан-ведущий, 16:9).
// Мир книги — королевский двор: золото короны, пурпур мантий, красный бархат,
// спокойный синий для «защиты» и зелёный для честных выводов BanaMind.
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
  // двор
  gold: "#f2b81d",
  goldDeep: "#c98a0b",
  goldLight: "#ffe39a",
  purple: "#6d4bc4",
  purpleDeep: "#4a2f8f",
  purpleLight: "#d9ccfb",
  velvet: "#c23b4e",
  velvetDeep: "#8e2337",
  stone: "#cfc6b8",
  stoneDeep: "#9c917f",
  night: "#2b2f55",
};

// Фон каждой части фильма — свой мягкий цвет, чтобы зритель чувствовал смену темы.
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#fff6da", "#ffe3a0"],
  power: ["#f3eeff", "#dcd0fb"],
  words: ["#eaf4ff", "#c9e2fb"],
  people: ["#fff0e6", "#ffd6bf"],
  strategy: ["#e9fbf1", "#c2eed6"],
  flex: ["#fdeef6", "#f6cde2"],
  end: ["#fff6da", "#ffe0a8"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
