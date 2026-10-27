// Цвета, шрифты и безопасные поля BalaGoNineYearOldEmployee2D.
// Графический язык: тёплый бумажный фон с редкой точечной сеткой, почти
// чёрный текст, яркие поля для коротких графических вставок (оранжевый,
// синий, жёлтый, розовый), картон корабля. В одной сцене — 2–3 основных
// цвета; разговоры идут на спокойном фоне.
export const C = {
  paper: "#F1EBDD",
  paperDeep: "#E6DDCA",
  ink: "#111111",
  inkSoft: "#3A3733",
  orange: "#FF4B20",
  blue: "#2439F5",
  blueSoft: "#C9CFF7",
  yellow: "#FFD33D",
  pink: "#F0ACC5",
  cardboard: "#BE9362",
  cardboardDark: "#9E7548",
  cardboardLight: "#D6B286",
  white: "#FFFFFF",
  // спокойные интерьеры
  wall: "#EFE6D3",
  wallBlue: "#DCE1EE",
  floor: "#D9CBB2",
  wood: "#C99A68",
  woodDark: "#A67A4D",
  glass: "#BFD3E6",
  evening: "#F6D9A4",
} as const;

// Шрифты (public/fonts, OFL): Inter Tight Black — короткие тяжёлые акценты;
// Onest — субтитры, подписи, интерфейс. Оба содержат Ү ү, Ө ө, Ң ң.
export const F = {
  display: "NY2 Inter Tight",
  text: "NY2 Onest",
} as const;

// Безопасные поля кадра 1080×1920: по бокам ≈ 80 px, сверху ≈ 150 px,
// снизу ≈ 220 px (интерфейс соцсетей). Субтитры — над нижним полем.
export const SAFE = { side: 80, top: 150, bottom: 220 } as const;
export const SUB = { x: 80, w: 920, bottomY: 1680, topY: 170 } as const;
