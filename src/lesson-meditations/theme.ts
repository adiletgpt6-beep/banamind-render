// Палитра фильма BM-012 «Наедине с собой» (банан-ведущий, 16:9).
// Цвета схем — общие с «Трактатом» (C из lesson-traktat), фоны частей — свои:
// тёплый мрамор, терракота, оливковый и ночной синий римского лагеря.
export { C, FONT, FPS, H, W } from "../lesson-traktat/theme";

export const R = {
  night: "#1e2a4a",
  nightSoft: "#33456e",
  marble: "#f4efe6",
  marbleShade: "#ddd3c2",
  terracotta: "#c8643c",
  terracottaSoft: "#f2c3a8",
  olive: "#7d8c3c",
  oliveSoft: "#dfe6b8",
  gold: "#e6b422",
  purple: "#6d3b8c",
  wax: "#d9a441",
  parchment: "#f6e7c4",
  stone: "#a9a197",
  teal: "#16a3a3",
  tealSoft: "#c9f1ee",
  grey: "#9aa6b8",
  greySoft: "#dfe5ee",
  rain: "#7fa7d8",
};

export const PART_BG: Record<string, [string, string]> = {
  intro: ["#fff6da", "#ffe2a6"],
  diary: ["#f6efe2", "#e8d6b8"],
  control: ["#e8f4ff", "#c4e2fb"],
  anger: ["#fff0ea", "#ffd3c2"],
  service: ["#eef7e2", "#d3e9b3"],
  fame: ["#f4edff", "#dccff8"],
  obstacle: ["#eaf7f7", "#bfe8e6"],
  time: ["#fdf3e3", "#f6d9a8"],
  end: ["#fff6da", "#ffe0a6"],
};
