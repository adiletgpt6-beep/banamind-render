// Палитра фильма «Sapiens» (BanaMind, банан-ведущий, 16:9): тёплый песок острова,
// морская бирюза, глина первых табличек и холодный синий научной эпохи.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#22304a",
  inkSoft: "#4c5b78",
  paper: "#fffaf0",
  cream: "#fff3d6",
  sand: "#f4dca4",
  sandDeep: "#e2bd72",
  sea: "#4fc0d6",
  seaDeep: "#1f8aa8",
  palm: "#3a9b5c",
  palmDeep: "#256f41",
  wood: "#9a6a3a",
  woodDark: "#6b4522",
  clay: "#c98a5a",
  clayDark: "#9c6239",
  wheat: "#e8b63d",
  yellow: "#ffd23f",
  yellowDeep: "#f5b700",
  green: "#3fb67c",
  greenDeep: "#23895a",
  sky: "#6cc5f0",
  skyDeep: "#2f8fd0",
  coral: "#ff7a6b",
  red: "#e5484d",
  violet: "#8e6cf0",
  steel: "#6f7f99",
  white: "#ffffff",
};

// Фон каждой части — свой мягкий цвет, чтобы зритель чувствовал смену эпохи.
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#fff4d8", "#ffe2a6"],
  cognitive: ["#e5f7fb", "#bfe8f2"],
  agrarian: ["#fff6e0", "#f6deb0"],
  order: ["#fbefe6", "#f1d3bf"],
  unity: ["#eef3ff", "#d3defb"],
  science: ["#e9f0fb", "#c9d8f2"],
  future: ["#f3edff", "#dccffd"],
  end: ["#fff1e8", "#ffd9c2"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
