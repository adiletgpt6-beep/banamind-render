// Палитра фильма BM-011 «22 непреложных закона маркетинга» (банан-ведущий, 16:9).
// Цвета схем — общие с «Трактатом» (C из lesson-traktat), фоны частей — свои:
// мягкие «магазинные» оттенки с тёплым жёлтым акцентом BanaMind.
export { C, FONT, FPS, H, W } from "../lesson-traktat/theme";

export const Z = {
  navy: "#1f2a44",
  teal: "#16a3a3",
  tealSoft: "#c9f1ee",
  mint: "#7ee8b0",
  orange: "#ff9f43",
  grey: "#9aa6b8",
  greySoft: "#dfe5ee",
  gold: "#ffcf3f",
  purple: "#7b61ff",
  pink: "#ff6f91",
};

export const PART_BG: Record<string, [string, string]> = {
  intro: ["#fff6da", "#ffe6a0"],
  first: ["#e8f4ff", "#c4e2fb"],
  word: ["#eefbf4", "#c8f0da"],
  ladder: ["#f1efff", "#d9d2ff"],
  focus: ["#fff1e6", "#ffd8bd"],
  time: ["#eaf7f7", "#bfe8e6"],
  ego: ["#fdf0f6", "#f8cfe2"],
  hype: ["#f2f8e6", "#d8ecb3"],
  end: ["#fff6da", "#ffe0a6"],
};
