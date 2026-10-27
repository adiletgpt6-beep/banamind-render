// Цвета, шрифты и безопасные поля BalaGoThirdBMeeting2D.
// Основные сцены — светлая аккуратная 2D-графика с тёплым дневным светом:
// молочно-белый, тёмно-синий, фирменный жёлтый BalaGo, тёплый янтарный
// (свет лампы и карандаш), спокойный зелёный (школа и образцы материалов).
// В одном кадре — два-три ведущих цвета. Тёмный фон со светящимся
// янтарным контуром — только в коротких предметных переходах.
export const C = {
  paper: "#F6F2EA",
  paperDeep: "#ECE5D8",
  navy: "#182638",
  navySoft: "#34465E",
  ink: "#182638",
  inkSoft: "#4A5568",
  yellow: "#FFD447",
  amber: "#EA974B",
  amberDeep: "#C9732F",
  green: "#718B7A",
  greenSoft: "#B9C9BD",
  white: "#FFFFFF",
  night: "#14161C",
  // интерьеры
  wall: "#F1E9DB",
  studioWall: "#EFE8DC",
  floor: "#D8C8AE",
  wood: "#C99A68",
  woodDark: "#A67A4D",
  glass: "#C3D6E6",
  sky: "#D7E6F1",
  evening: "#F6D9A4",
  cabin: "#3D4350",
  // «БУЛАК» — бирюзовая вода и терракота (варианты вывески кафе)
  bulakA: "#2F8F8A",
  bulakB: "#C8553D",
} as const;

// Шрифты (public/fonts, OFL): Inter Tight Black — короткие тяжёлые надписи;
// Onest — субтитры, подписи, интерфейс. Оба содержат Ү ү, Ө ө, Ң ң.
export const F = {
  display: "T3B Inter Tight",
  text: "T3B Onest",
} as const;

// Безопасные поля кадра 1080×1920: по бокам ≈ 80 px, сверху ≈ 150 px,
// снизу ≈ 220 px (интерфейс соцсетей). Субтитры — над нижним полем или
// вверху, когда центр занят рисунком.
export const SAFE = { side: 80, top: 150, bottom: 220 } as const;
export const SUB = { x: 80, w: 920, bottomY: 1680, topY: 170 } as const;
