// Цвета, шрифты и безопасные поля BalaGoKnowsMyName2D.
// По референсу: светлая нейтральная основа, почти чёрный и тёмно-синий для
// текста и одежды, немного тёплого оранжевого в предметах и графических
// переходах. Финал BalaGo — белый, жёлтый и тёмно-синий. До развязки свет
// чуть прохладнее (COOL), по средам и за общим столом — мягче и теплее
// (WARM); различие тонкое.
export const C = {
  paper: "#F7F4EE", // тёплая светлая основа
  paperDeep: "#E2E0DB",
  ink: "#141414",
  inkSoft: "#3A3A3F",
  navy: "#172A46",
  navySoft: "#3A4A7A",
  orange: "#F26A21",
  orangeSoft: "#F9B48A",
  yellow: "#FFD43B",
  blue: "#2F5BD3",
  blueSoft: "#C9D3F2",
  white: "#FFFFFF",
  card: "#FFFFFF",
  shadow: "rgba(20,20,30,0.14)",
  // интерьеры
  wallHome: "#F2EBDD",
  wallKitchen: "#F4E6CF",
  wallOffice: "#E6E9EE",
  floorHome: "#D8C6A6",
  floorOffice: "#C9CDD4",
  wood: "#C99A68",
  woodDark: "#A67A4D",
  woodLight: "#DDB88A",
  glass: "#C8D8E8",
  sky: "#BFD9EE",
  green: "#6FAF6A",
  // детские подписи календаря
  kidRed: "#E2574C",
  kidBlue: "#2F6FD6",
  kidGreen: "#3E9C5A",
  kidPurple: "#8A5BC7",
  kidOrange: "#F08A24",
  kidPink: "#E36A9A",
  kidTeal: "#1E9A9A",
} as const;

// Тонкий тон света: прохладнее в обычные будни, теплее в среду и за общим
// столом (полупрозрачный слой поверх сцены).
export const TINT = {
  cool: "rgba(150,175,215,0.10)",
  warm: "rgba(255,190,110,0.12)",
} as const;

// Шрифты (public/fonts, OFL): Inter Tight Black — короткие акценты;
// Onest — субтитры и интерфейс; Nunito — детские надписи календаря. Все
// три содержат Ү ү, Ө ө, Ң ң.
export const F = {
  display: "KM2 Inter Tight",
  text: "KM2 Onest",
  kid: "KM2 Nunito",
} as const;

// Безопасные поля кадра 1080×1920: по бокам ≈ 80 px, сверху ≈ 150 px,
// снизу ≈ 220 px (интерфейс соцсетей). Субтитры — над нижним полем.
export const SAFE = { side: 80, top: 150, bottom: 220 } as const;
export const SUB = { x: 80, w: 920, bottomY: 1690, topY: 170 } as const;
