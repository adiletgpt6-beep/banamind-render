// Фирменные цвета BG-043: белый и светлый фон, ярко-жёлтый, тёмно-синий.
// Офис — тёплый светлый; «Жумуш сааты» — тёмно-синий, «Мектеп сааты» —
// фирменный жёлтый. Зелёный — только для WhatsApp и «подходит».
export const C = {
  white: "#FFFFFF",
  paper: "#FFFDF7",
  cream: "#FFF8EA",
  wall: "#FBF3E4",
  wallShade: "#F3E7D2",
  sky: "#EAF3FC",
  skyDeep: "#CFE3F7",
  line: "#DCE6F2",
  navy: "#14285A",
  ink: "#24365F",
  muted: "#6A7AA0",
  yellow: "#FFC90E",
  yellowSoft: "#FFF4C2",
  yellowDeep: "#E9A900",
  green: "#2F9A62",
  greenSoft: "#E3F5EA",
  coral: "#E8735A",
  wood: "#D9B48A",
  woodShade: "#C49A6C",
  woodDark: "#A87F55",
  desk: "#E9D3B4",
  deskEdge: "#D4B78F",
  metal: "#C9D3E6",
  metalShade: "#A9B6CF",
  blush: "#F6A5A0",
  mountain: "#B9CBE3",
  mountainFar: "#D3E0F0",
  snow: "#FFFFFF",
} as const;

// Палитры двух будильников.
export type ClockKind = "work" | "school";
export const CLOCK_COLORS: Record<
  ClockKind,
  {
    readonly body: string;
    readonly bodyShade: string;
    readonly bell: string;
    readonly bellShade: string;
    readonly hand: string;
    readonly foot: string;
    readonly accent: string;
    readonly gear: string;
  }
> = {
  work: {
    body: "#2B4C8F",
    bodyShade: "#1E3A73",
    bell: "#D5DDEC",
    bellShade: "#AEBBD3",
    hand: "#14285A",
    foot: "#14285A",
    accent: "#FFC90E",
    gear: "#9FB0CF",
  },
  school: {
    body: "#FFC90E",
    bodyShade: "#E9A900",
    bell: "#FFE07A",
    bellShade: "#F2C230",
    hand: "#14285A",
    foot: "#14285A",
    accent: "#2B4C8F",
    gear: "#F2C230",
  },
};
