// Цвета и безопасные поля BalaGo36SuitcaseByTheDoor2D.
// По видеореференсу: светлый кремовый фон с широкими мягкими диагоналями и
// лёгкой бумажной фактурой, тонкий тёмный слегка неровный контур, спокойные
// заливки с карандашной штриховкой в тени, короткие тёмно-синие
// схемы-вставки со светлыми линиями. Акцент — жёлтый BalaGo.
export const C = {
  bg: "#FFF9ED", // основной фон
  paper: "#FFFDF7", // бумага, панели
  stripeA: "#F4E6C8", // диагонали (низкий контраст)
  stripeB: "#E6EBE6",
  ink: "#24324A", // контур и основной текст
  inkSoft: "#4A5872",
  navy: "#172744", // фон схем
  line: "#B8C7D8", // светлые линии на синем
  lineDim: "rgba(184,199,216,0.35)",
  yellow: "#F5C642", // жёлтый BalaGo
  yellowSoft: "#FBE7A6",
  yellowDeep: "#E0A92A",
  green: "#A7B89A", // второстепенный спокойный зелёный
  greenDeep: "#7E9472",
  white: "#FFFFFF",
  // папка выступления — охристо-жёлтая (отличается от чемодана и рюкзака)
  folder: "#E3A73B",
  folderShade: "#C88B26",
  folderInside: "#F3D9A4",
  // чемодан — серо-синий
  suitcase: "#4E6584",
  suitcaseShade: "#3D5170",
  suitcaseLight: "#6D84A3",
  suitcaseInside: "#C9D2DC",
  // бейдж: светлая карточка на синем шнурке
  badge: "#FFFDF5",
  lanyard: "#2F5FA8",
  // интерьеры
  wall: "#F6EEDC",
  wallWarm: "#F4E3C4",
  wallEvening: "#E9D6B4",
  wallOffice: "#E7ECEC",
  floor: "#E3CFAA",
  floorShade: "#D2BB93",
  wood: "#C9965F",
  woodLight: "#DDB07A",
  woodDark: "#A9774A",
  door: "#D9C29A",
  glass: "#D4E2EA",
  sky: "#DCE9EE",
  mountain: "#C6D2D4",
  tree: "#A7B89A",
  treeDark: "#8BA07F",
  brick: "#E7C9A6",
  road: "#CBC6BC",
  carGrey: "#9AA3AD", // семейная машина — нейтральная серая
  carGreyShade: "#7E8893",
  shadow: "rgba(36,50,74,0.16)",
  hatch: "rgba(36,50,74,0.16)",
  warmLight: "rgba(255,196,120,0.14)",
  coolLight: "rgba(150,180,215,0.10)",
} as const;

// Толщина контура в итоговом кадре (px): персонажи и главные предметы —
// 4 px, второстепенные детали — 2,5 px. Сцены пересчитывают её в единицы
// своего масштаба (kit.tsx: useInk).
export const INK_PX = { main: 4, detail: 2.5 } as const;

// Безопасные поля кадра 1080×1920: смысл и лица — x 90…930, y 150…1560;
// субтитры обычно в полосе y 1360…1560 (нижний край — 1560).
export const SAFE = { left: 90, right: 930, top: 150, bottom: 1560 } as const;
export const SUB = { x: 90, w: 900, bottomY: 1560, topY: 190 } as const;
