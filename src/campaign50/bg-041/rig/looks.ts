// Персонажи BG-041 (мама, папа, сын): пропорции и внешность (копия рига 2D-роликов проекта,
// изолирована в src/campaign50/bg-041). Одинаковы во всех сценах.

export type Build = {
  readonly headY: number; // центр головы
  readonly headRx: number;
  readonly headRy: number;
  readonly neckTop: number;
  readonly shoulderY: number;
  readonly shoulderHalf: number;
  readonly waistY: number;
  readonly waistHalf: number;
  readonly hipY: number; // верх бёдер (пояс)
  readonly hipHalf: number;
  readonly hipJointY: number;
  readonly hipJointX: number;
  readonly thigh: number;
  readonly shin: number;
  readonly upperArm: number;
  readonly forearm: number;
  readonly hand: number;
  readonly limb: number; // толщина руки
  readonly leg: number; // толщина ноги
  readonly foot: number; // длина стопы (в профиль)
  readonly stride: number; // длина шага
};

const ADULT: Build = {
  headY: -884,
  headRx: 60,
  headRy: 72,
  neckTop: -820,
  shoulderY: -778,
  shoulderHalf: 88,
  waistY: -575,
  waistHalf: 62,
  hipY: -520,
  hipHalf: 72,
  hipJointY: -478,
  hipJointX: 38,
  thigh: 240,
  shin: 222,
  upperArm: 160,
  forearm: 146,
  hand: 50,
  limb: 40,
  leg: 52,
  foot: 92,
  stride: 240,
};

// Ребёнок 7–8 лет: голова крупнее, ноги и руки короче.
const CHILD: Build = {
  headY: -836,
  headRx: 74,
  headRy: 84,
  neckTop: -752,
  shoulderY: -718,
  shoulderHalf: 76,
  waistY: -545,
  waistHalf: 60,
  hipY: -500,
  hipHalf: 66,
  hipJointY: -448,
  hipJointX: 32,
  thigh: 220,
  shin: 212,
  upperArm: 150,
  forearm: 132,
  hand: 44,
  limb: 36,
  leg: 46,
  foot: 80,
  stride: 180,
};

export type HairStyle = "momBob" | "dadShort" | "girlBraids" | "longTail" | "shortGrey" | "boyShort" | "bun";
export type Top = "cardigan" | "shirt" | "pinafore" | "jacket" | "sweater" | "tee";

export type Look = {
  readonly build: Build;
  readonly skin: string;
  readonly skinShade: string;
  readonly hair: string;
  readonly hairStyle: HairStyle;
  readonly top: Top;
  readonly topColor: string;
  readonly topShade: string;
  readonly inner: string; // рубашка/блузка под верхом, воротник
  readonly bottom: string; // брюки/юбка
  readonly skirt?: boolean;
  readonly legColor?: string; // колготки
  readonly shoes: string;
  readonly brow: string;
  readonly lips: string;
  readonly earrings?: boolean;
  readonly watch?: boolean; // часы на левой руке
  readonly stubble?: boolean;
  readonly bows?: boolean;
  readonly backpack?: string;
};

export const LOOKS = {
  // Мама (30–35): волосы собраны в пучок, терракотовый офисный жакет,
  // белая блузка, тёмно-синие брюки; серьги и часы.
  mom: {
    build: ADULT,
    skin: "#E4B28C",
    skinShade: "#CF9A73",
    hair: "#2B201C",
    hairStyle: "bun",
    top: "jacket",
    topColor: "#C4614F",
    topShade: "#A84F40",
    inner: "#FAF6EF",
    bottom: "#2F3D5E",
    shoes: "#2A2A30",
    brow: "#2B201C",
    lips: "#B5655F",
    earrings: true,
    watch: true,
  },
  // Мама дома вечером: тот же облик, мягкий свитер вместо жакета.
  momHome: {
    build: ADULT,
    skin: "#E4B28C",
    skinShade: "#CF9A73",
    hair: "#2B201C",
    hairStyle: "bun",
    top: "sweater",
    topColor: "#E9A23B",
    topShade: "#D08E2E",
    inner: "#FAF6EF",
    bottom: "#2F3D5E",
    shoes: "#2A2A30",
    brow: "#2B201C",
    lips: "#B5655F",
    earrings: true,
  },
  // Папа (32–40): короткая стрижка, голубая рубашка, серые брюки, часы.
  dad: {
    build: { ...ADULT, shoulderHalf: 96, waistHalf: 68, hipHalf: 72, headRx: 62, headRy: 74, limb: 44, leg: 56 },
    skin: "#D9A680",
    skinShade: "#C28E68",
    hair: "#1F1A19",
    hairStyle: "dadShort",
    top: "shirt",
    topColor: "#8DB3DE",
    topShade: "#769CC8",
    inner: "#8DB3DE",
    bottom: "#4A4F60",
    shoes: "#3B2E28",
    brow: "#1F1A19",
    lips: "#A9675E",
    watch: true,
  },
  // Сын (8): короткая стрижка, школьный пиджак, жёлтый рюкзак.
  son: {
    build: { ...CHILD, headRx: 72, headRy: 82 },
    skin: "#E8B48D",
    skinShade: "#D29A73",
    hair: "#221B19",
    hairStyle: "boyShort",
    top: "jacket",
    topColor: "#2F4A7A",
    topShade: "#243B63",
    inner: "#FFFFFF",
    bottom: "#4A5163",
    shoes: "#222228",
    brow: "#221B19",
    lips: "#B86A62",
    backpack: "#F2B630",
  },
  // Коллега на планёрке.
  colleague: {
    build: ADULT,
    skin: "#E0AF8B",
    skinShade: "#CA9772",
    hair: "#3A2C26",
    hairStyle: "momBob",
    top: "cardigan",
    topColor: "#6A8F6E",
    topShade: "#57775B",
    inner: "#F4F1EA",
    bottom: "#353A48",
    shoes: "#2C2C30",
    brow: "#3A2C26",
    lips: "#AE5F5A",
    earrings: true,
  },
  // Клиент на встрече.
  client: {
    build: { ...ADULT, shoulderHalf: 94, waistHalf: 70 },
    skin: "#D9A67E",
    skinShade: "#C38E66",
    hair: "#4A4642",
    hairStyle: "shortGrey",
    top: "jacket",
    topColor: "#3F4A63",
    topShade: "#323C52",
    inner: "#EDEDED",
    bottom: "#3A3E48",
    shoes: "#2C2420",
    brow: "#4A4642",
    lips: "#A06058",
  },
} as const satisfies Record<string, Look>;

export type LookId = keyof typeof LOOKS;
