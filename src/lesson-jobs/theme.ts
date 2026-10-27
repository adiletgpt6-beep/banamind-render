// Палитра фильма BM-015 «Стив Джобс» (BanaMind, банан-ведущий, 16:9): тёплое дерево
// мастерской, холодный бетон гаража, белая студия дизайна, неоновая кинолаборатория,
// «цифровой город» и тёплая гостиная финала. Никаких логотипов и фирменных цветов Apple.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#20283c",
  inkSoft: "#4d5a76",
  paper: "#fffaf2",
  cream: "#fff2d8",
  wood: "#b97a45",
  woodLight: "#dba56f",
  woodDark: "#7a4a24",
  concrete: "#c9cfd8",
  concreteDark: "#8e98a8",
  steel: "#6f7f99",
  steelDark: "#45526a",
  board: "#2f8f6a",
  boardDark: "#1d634a",
  copper: "#e0a34a",
  beige: "#eadfc8",
  beigeDark: "#cbbd9f",
  screen: "#1f2a44",
  screenGlow: "#9fe3ff",
  neon: "#a77bff",
  neonPink: "#ff6fb4",
  teal: "#3cc6c0",
  yellow: "#ffd23f",
  yellowDeep: "#f5b700",
  green: "#3fb67c",
  greenDeep: "#23895a",
  sky: "#6cc5f0",
  skyDeep: "#2f8fd0",
  coral: "#ff7a6b",
  red: "#e5484d",
  violet: "#8e6cf0",
  white: "#ffffff",
};

// Фон каждой части — своё «пространство» фильма (TASK §5): мастерская, гараж,
// лабиринт окошек, сцена конфликта, кинолаборатория, стол кнопок, цифровой город, гостиная.
export const PART_BG: Record<string, [string, string]> = {
  intro: ["#f3f4f8", "#dfe3ec"],
  roots: ["#fff3e2", "#f2d6b3"],
  garage: ["#eef1f5", "#cfd6e0"],
  mac: ["#f6f4ff", "#ddd6fb"],
  exile: ["#f0eef6", "#cfc8de"],
  return: ["#f5fbff", "#d6ebf7"],
  system: ["#eefaf6", "#c7eadf"],
  iphone: ["#f2f5fb", "#d3dcef"],
  price: ["#fff2ea", "#f0d4c4"],
  end: ["#fff6e6", "#f7dfb8"],
};

export const FONT = "Nunito, 'Segoe UI', sans-serif";
