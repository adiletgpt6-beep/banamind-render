// Цвета, шрифты и безопасные поля BalaGoInvitationWithoutName2D.
// Графический язык референса: светлый бумажный фон, почти чёрные заголовки
// и контуры, тёмно-синий для одежды и школьных деталей, насыщенный синий
// для чертежей, фирменный жёлтый (тепло, игрушечная машинка, BalaGo) и
// приглушённый коралловый для небольших акцентов. В одной сцене — два-три
// главных цвета; разговоры идут на спокойном фоне, вечером он теплее.
export const C = {
  paper: "#F7F7F3",
  paperWarm: "#F5EEDF",
  sheet: "#FFFEFA", // лист приглашения и бумага моста
  sheetEdge: "#D9D3C4",
  ink: "#171717",
  inkSoft: "#3B3A37",
  pencil: "#4A4E5A", // карандаш (имя «Азамат», список, подпись)
  navy: "#182A49",
  navySoft: "#2C406A",
  blue: "#3430E8",
  blueSoft: "#D9D8FB",
  yellow: "#FFD43B",
  yellowDeep: "#E9B91A",
  coral: "#F2634D",
  coralSoft: "#F8C3B8",
  white: "#FFFFFF",
  // интерьеры (спокойные, низкий контраст)
  wall: "#EEEDE6",
  wallWarm: "#F2E6CF",
  corridor: "#E8E9E4",
  floor: "#D8D2C4",
  floorWarm: "#D3C2A2",
  wood: "#C9A16E",
  woodDark: "#A87E4F",
  glass: "#C9D8E6",
  night: "#26304A",
  green: "#6E9E78",
} as const;

// Шрифты (public/fonts, OFL): Inter Tight Black — короткие тяжёлые акценты;
// Onest — субтитры, подписи, интерфейс, текст приглашения. Оба содержат
// Ү ү, Ө ө, Ң ң (проверено по таблице cmap).
export const F = {
  display: "IW2 Inter Tight",
  text: "IW2 Onest",
} as const;

// Безопасные поля кадра 1080×1920: по бокам ≈ 80 px, сверху ≈ 150 px,
// снизу ≈ 220 px (интерфейс соцсетей). Субтитры — над нижним полем.
export const SAFE = { side: 80, top: 150, bottom: 220 } as const;
export const SUB = { x: 80, w: 920, bottomY: 1680, topY: 170 } as const;
