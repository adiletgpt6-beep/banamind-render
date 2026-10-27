// Цвета, шрифты и безопасные поля BalaGoChessTournament2D.
// Светлый тёплый фон (#F7F4EE), тёмно-синий для контуров, деталей и текста
// (#172A46), фирменный жёлтый (#FFD43B) — девочка и BalaGo; спокойный
// голубой — дневные школьные и офисные планы; янтарный свет лампы вечером;
// приглушённый коралл — редкие акценты. Рабочие расписания холоднее,
// шахматный стол и домашний финал теплее. Без тревожного красного.
export const C = {
  paper: "#F7F4EE",
  paperDeep: "#EBE5D8",
  ink: "#172A46",
  navy: "#172A46",
  inkSoft: "#4A5670",
  yellow: "#FFD43B",
  yellowDeep: "#F0B90F",
  blue: "#5B8DD6",
  blueSoft: "#D6E4F5",
  blueDay: "#E4EEF8",
  coral: "#E08A78",
  coralSoft: "#F3C7BC",
  amber: "#F6B656",
  amberGlow: "rgba(255,190,90,0.42)",
  green: "#4FA36B",
  white: "#FFFFFF",
  // интерьеры
  wall: "#EFE8DA",
  wallNight: "#E2C9A2",
  wallDay: "#E3ECF5",
  floor: "#D9CBB2",
  floorNight: "#B79E7C",
  wood: "#C99A68",
  woodDark: "#A67A4D",
  glass: "#BFD3E6",
  night: "#24304E",
  // шахматы
  boardLight: "#F0DDBA",
  boardDark: "#B98157",
  boardEdge: "#7A5236",
  pieceWhite: "#F7F1E3",
  pieceWhiteShade: "#D9CDB4",
  pieceBlack: "#2E2C36",
  pieceBlackShade: "#1A1920",
} as const;

// Шрифты (public/fonts, OFL): Inter Tight Black — короткие тяжёлые акценты;
// Onest — субтитры, подписи, интерфейс. Оба содержат Ү ү, Ө ө, Ң ң.
export const F = {
  display: "CH2 Inter Tight",
  text: "CH2 Onest",
} as const;

// Безопасные поля кадра 1080×1920: по бокам ≈ 80 px, сверху ≈ 150 px,
// снизу ≈ 220 px (интерфейс соцсетей). Субтитры — над нижним полем.
export const SAFE = { side: 80, top: 150, bottom: 220 } as const;
export const SUB = { x: 80, w: 920, bottomY: 1690, topY: 160 } as const;
