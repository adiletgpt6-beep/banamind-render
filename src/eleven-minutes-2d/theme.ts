// Цвета и раскладка кадра «Он бир мүнөт»: тёмная графитовая подача.
export const C = {
  bg: "#080C13",
  panel: "#111A26",
  panel2: "#0D141F",
  line: "#22324A",
  lineSoft: "#1A2738",
  street: "#2A3B52",
  text: "#FFFFFF",
  dim: "#8FA3BD",
  yellow: "#FFD33D",
  coral: "#E8806B",
  teal: "#4FD1C5",
  warm: "#FFC46B",
} as const;

// Раскладка 1080×1920 с запасом от краёв: 70 по бокам, 120 сверху,
// 200 снизу. Основное действие → субтитры → маленький рассказчик.
export const LAYOUT = {
  side: 70,
  stage: { x: 70, y: 120, w: 940, h: 1090 },
  subtitleTop: 1250,
  narrator: { cx: 540, cy: 1600, w: 200, h: 160 },
} as const;
