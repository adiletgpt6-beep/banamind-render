// Общая тема живых роликов BalaGo (живая съёмка + motion-графика).
// Фирменные цвета: белый, яркий жёлтый, тёмно-синий. Файл без импортов
// Remotion — его могут читать и Node-скрипты.

export const LIVE_COLORS = {
  yellow: "#FFC90E",
  yellowHot: "#FFD83D",
  yellowDeep: "#F2A900",
  navy: "#14285A",
  navyDeep: "#0A1636",
  navyInk: "#060E26",
  blueGlow: "#4F8BFF",
  white: "#FFFFFF",
  paper: "#F5F8FF",
  muted: "#A9B6D6",
  red: "#FF4D5E",
  green: "#2BD38B",
  glass: "rgba(10, 22, 54, 0.62)",
  glassLight: "rgba(255, 255, 255, 0.86)",
  shadow: "rgba(6, 14, 38, 0.38)",
} as const;

// Безопасная зона Reels/Shorts (пиксели кадра 1080×1920).
export const LIVE_SAFE = { top: 230, bottom: 400, left: 70, right: 150 } as const;
