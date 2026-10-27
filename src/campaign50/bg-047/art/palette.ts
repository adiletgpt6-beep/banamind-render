// Цвета BalaGoBG047: белая бумага, фирменный жёлтый и тёмно-синий.
export const C = {
  yellow: "#FFC90E",
  yellowEdge: "#E3A600",
  yellowSoft: "#FFF1B8",
  navy: "#14285A",
  navySoft: "#3A4F80",
  ink: "#24375F",
  paper: "#FFFDF6",
  paperWarm: "#F8F1DF",
  paperEdge: "#E6DCC4",
  fold: "rgba(120, 100, 60, 0.10)",
  street: "#FFFFFF",
  streetLine: "#E3D9C2",
  block: "#EFE6D0",
  park: "#CFE8C2",
  parkDark: "#9CCB8C",
  water: "#BFE0F2",
  sky: "#EAF3FC",
  table: "#E9EEF5",
  tableDark: "#D6DEEA",
  green: "#25A35A",
  greenSoft: "#EAF7EE",
  check: "#2FA866",
  soft: "#8A96B2",
  shadow: "rgba(20, 40, 90, 0.20)",
  skin: "#F1C29C",
  skinEdge: "#D99B72",
  nail: "#F9DCC6",
  sleeve: "#7C6FD8",
  sleeveDark: "#5E52B8",
  cuff: "#FFFFFF",
  white: "#FFFFFF",
} as const;

// Другие бумажные точки (дети-попутчики в примере).
export const DOT_COLORS = {
  yellow: { fill: "#FFC90E", edge: "#E3A600" },
  blue: { fill: "#6EA8FF", edge: "#3F7FD6" },
  coral: { fill: "#FF9A76", edge: "#E0704F" },
  mint: { fill: "#5FD3B3", edge: "#2FA585" },
  violet: { fill: "#B59BFF", edge: "#8466E6" },
} as const;
export type DotColor = keyof typeof DOT_COLORS;
