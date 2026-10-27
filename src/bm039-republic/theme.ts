// Палитра фильма BM-039 «Государство» (Платон): тёмная «ночная агора»,
// по которой собираются яркие цветные точки. Банан-ведущий — общий для канала.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

// цвета точек: хорошо различимы на тёмном фоне
export const DOT = {
  gold: "#ffd23f",
  amber: "#ffb13b",
  coral: "#ff7a6b",
  red: "#ff5466",
  pink: "#ff7ac6",
  violet: "#a98bff",
  sky: "#5cc8ff",
  cyan: "#4fe3e0",
  mint: "#6ee7a8",
  lime: "#c4f25a",
  white: "#f4f6ff",
  silver: "#c9d4ea",
  bronze: "#e0915a",
  dim: "#8a95c4",
  shadow: "#3a4470",
};

export const C = {
  ink: "#0f1530",
  text: "#f4f6ff",
  soft: "#b9c2e6",
  yellow: "#ffd23f",
  card: "rgba(255,255,255,0.08)",
  cardLine: "rgba(255,255,255,0.18)",
};

// фон частей: верх и низ градиента (у каждой книги «Государства» свой оттенок ночи)
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#141a3d", "#262055"],
  b1: ["#151c42", "#2a1f4a"],
  b23: ["#0f2340", "#163b52"],
  b4: ["#1b1a45", "#2c2a66"],
  b5: ["#22183d", "#3a1f4f"],
  b67: ["#0b0f24", "#1a1a3a"],
  b89: ["#24132e", "#3d1a35"],
  b10: ["#101a3a", "#1d2f5c"],
  end: ["#152040", "#2e2a5a"],
};

export const FONT = "Rubik, Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
