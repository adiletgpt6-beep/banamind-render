// Цвета, шрифты и безопасные поля BalaGoMeeting1320 («13:20дагы жолугушуу»).
// Светлая основа, тёмно-синий текст, жёлтые акценты BalaGo. Офис —
// спокойные голубые и нейтральные оттенки; школа и дорога — естественный
// дневной свет; вечер дома — мягкий тёплый свет. Начало — без вспышки и
// слепящего белого экрана.
export const C = {
  paper: "#F6F3EE", // тёплая светлая основа
  paperDeep: "#E6E1D8",
  ink: "#141821",
  inkSoft: "#3A3F4A",
  navy: "#172A46",
  navySoft: "#3A4A7A",
  line: "#2B2F3A", // контур персонажей и предметов
  yellow: "#FFD43B", // BalaGo
  yellowDeep: "#F2B705",
  orange: "#F26A21",
  orangeSoft: "#F9B48A",
  blue: "#2F5BD3",
  blueSoft: "#C9D3F2",
  white: "#FFFFFF",
  card: "#FFFFFF",
  shadow: "rgba(20,24,40,0.16)",
  // офис: голубые и нейтральные
  wallOffice: "#E3E9F0",
  wallOfficeDeep: "#CDD7E3",
  floorOffice: "#C3CBD6",
  glass: "#CFE0EE",
  glassEdge: "#9FB4C8",
  deskWhite: "#F1F2F4",
  deskWood: "#D9C3A5",
  officeTeal: "#5E9A93",
  // улица и школа: дневной свет
  sky: "#CFE6F5",
  skyDeep: "#A9D0EC",
  tree: "#6FAF6A",
  treeDeep: "#4E8C55",
  asphalt: "#8E96A3",
  sidewalk: "#D8D4CC",
  schoolWall: "#F1E3C8",
  schoolTrim: "#C9785A",
  // дом вечером: тёплый свет
  wallHome: "#F2DFC6",
  wallHomeDeep: "#E2C7A6",
  floorHome: "#C9A47A",
  wood: "#C99A68",
  woodDark: "#A67A4D",
  woodLight: "#DDB88A",
  lamp: "#FFD9A0",
  night: "#2E3550",
  green: "#6FAF6A",
  // детский рисунок (фломастеры)
  kidRed: "#E2574C",
  kidBlue: "#2F6FD6",
  kidGreen: "#3E9C5A",
  kidPurple: "#8A5BC7",
  kidOrange: "#F08A24",
  kidGrey: "#7D8593",
  kidPink: "#E36A9A",
  kidTeal: "#1E9A9A",
} as const;

// Тонкий тон света: прохладнее в обычные будни, теплее в среду и за общим
// столом (полупрозрачный слой поверх сцены).
export const TINT = {
  cool: "rgba(150,175,215,0.10)",
  day: "rgba(255,240,210,0.06)",
  warm: "rgba(255,190,110,0.14)",
  night: "rgba(255,170,90,0.18)",
} as const;

// Шрифты (public/fonts, OFL): Inter Tight Black — короткие акценты;
// Onest — субтитры и интерфейс; Nunito — детские надписи календаря. Все
// три содержат Ү ү, Ө ө, Ң ң.
export const F = {
  display: "M13 Inter Tight",
  text: "M13 Onest",
  kid: "M13 Nunito",
} as const;

// Безопасная зона важного содержимого 1080×1920 (интерфейс Reels: кнопки
// справа, подпись снизу): x ≈ 90–900, y ≈ 140–1580. Лица, ключевые
// предметы, надписи и CTA — внутри неё. Субтитры — над нижней границей
// зоны (низ плашки y = 1580) или вверху (верх y = 150) в планах, где низ
// кадра занят действием (ремень, рисунок, руки).
export const SAFE = { left: 90, right: 900, top: 140, bottom: 1580 } as const;
export const SUB = { x: 90, w: 810, bottomY: 1580, topY: 150 } as const;
