// Цвета, шрифт и безопасные поля BalaGoBG025 (выпуск №26).
// Бренд: белый и светлый фон, ярко-жёлтые акценты, тёмно-синие надписи.
// Бумажная лента — тёплая белая бумага с мягкой тенью сгибов.
// Без тревожного красного: «не подходит» — приглушённый серо-голубой.
import { fontFamily } from "../../fonts";

export const C = {
  white: "#FFFFFF",
  paper: "#FFFDF7",
  paperWarm: "#FBF5E6",
  paperShade: "#EFE6D2",
  paperFold: "#E3D7BE",
  bg: "#F6F8FC",
  sky: "#EAF3FC",
  skyDeep: "#CFE3F6",
  line: "#DCE6F2",
  navy: "#14285A",
  ink: "#1C2F5E",
  inkSoft: "#5A6B90",
  muted: "#8D9AB6",
  yellow: "#FFC90E",
  yellowDeep: "#E9B000",
  yellowSoft: "#FFF3C4",
  blue: "#4F86D9",
  blueSoft: "#DCE8F8",
  green: "#2F9A62",
  greenSoft: "#E3F5EA",
  coral: "#E08A78",
  amberGlow: "rgba(255,200,90,0.35)",
  // WhatsApp-подобный чат (без логотипов приложения)
  chatBg: "#EFE7DD",
  chatTop: "#1F6E5C",
  bubbleOut: "#DCF7C5",
  bubbleIn: "#FFFFFF",
  // город
  mountain: "#B9CBE3",
  mountainFar: "#D5E2F2",
  snow: "#FFFFFF",
  poplar: "#6DAA6A",
  poplarDark: "#4F8C55",
  road: "#D8DEE8",
  roadLine: "#FFFFFF",
  brick: "#E7D3B8",
  // интерьер
  wall: "#EEF2F8",
  wood: "#C99A68",
  woodDark: "#A67A4D",
} as const;

// Один фирменный шрифт проекта: Nunito (OFL, есть Ү ү, Ө ө, Ң ң).
export const F = { text: fontFamily, display: fontFamily } as const;

// Безопасные поля 1080×1920 (интерфейс Reels): сверху ≈ 250 px,
// снизу ≈ 400 px, справа ≈ 150 px (кнопки), слева ≈ 70 px.
export const SAFE = { top: 250, bottom: 400, right: 150, left: 70 } as const;
