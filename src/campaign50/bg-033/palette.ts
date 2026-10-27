// Фирменные цвета ролика: белый и светлый фон, ярко-жёлтые акценты
// (контур квадрата-чекбокса, маршрут, стрелка), тёмно-синие надписи.
// Машина — белая легковая (не жёлтое такси). Свет — светлый и тёплый,
// без затемнения кадра.
export const C = {
  paper: "#FFFDF7",
  white: "#FFFFFF",
  navy: "#14285A",
  ink: "#24365F",
  muted: "#5B6B8C",
  line: "#D9DEE8",
  yellow: "#FFC90E",
  yellowDeep: "#F2B200",
  yellowSoft: "#FFF4C2",
  sky: "#EAF3FC",
  skyDeep: "#CFE3F7",
  dusk: "#F6E7D2", // тёплые сумерки (светлые, не тёмные)
  green: "#2E8B57",
  greenSoft: "#E8F6EC",
  // интерьер вечерней кухни
  wall: "#FBF3E6",
  wallShade: "#F1E4CF",
  table: "#E9C99A",
  tableEdge: "#D2AB76",
  lamp: "#FFE9A8",
  // город
  mountain: "#C9D6E8",
  mountainSnow: "#FFFFFF",
  building: "#EEF1F6",
  buildingShade: "#DCE2EC",
  window: "#FFE7A0",
  tree: "#9CC79A",
  treeDark: "#7FB07E",
  road: "#FFFFFF",
  roadEdge: "#DCD6CA",
  car: "#FBFBFA",
  // люди
  skin: "#F2C9A5",
  skinShade: "#E2AE86",
  hair: "#2B2120",
  red: "#E2574C",
} as const;

// Безопасная зона Reels/Shorts (px кадра 1080×1920): контакты, надписи и
// субтитры не заходят в эти поля.
export const SAFE = { left: 90, right: 150, top: 220, bottom: 400 } as const;
