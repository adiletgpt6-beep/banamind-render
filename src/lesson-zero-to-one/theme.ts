// Палитра фильма BM-010 «От нуля к единице» (банан-ведущий, 16:9).
// Цвета схем — общие с «Трактатом» (C из lesson-traktat), фоны частей — свои:
// «стартаповые» холодные оттенки с тёплым жёлтым акцентом BanaMind.
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
  zero: ["#e8f4ff", "#c4e2fb"],
  mono: ["#eefbf4", "#c8f0da"],
  long: ["#f1efff", "#d9d2ff"],
  plan: ["#fff1e6", "#ffd8bd"],
  secret: ["#eaf7f7", "#bfe8e6"],
  team: ["#fdf0f6", "#f8cfe2"],
  sales: ["#f2f8e6", "#d8ecb3"],
  future: ["#eef2fb", "#cfd9f0"],
  end: ["#fff6da", "#ffe0a6"],
};
