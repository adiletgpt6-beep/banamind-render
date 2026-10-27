// Персонажи ролика: пропорции и внешность. Одинаковы во всех сценах.
// Единицы рисунка: высота взрослого ≈ 1000 (ступни в y = 0, вверх — минус).

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
export type Top = "cardigan" | "shirt" | "pinafore" | "jacket" | "sweater" | "tee" | "blazer";

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

// Семья фильма №35 — та же, что в 2D-роликах серии (лица, причёски,
// пропорции из ролика №12), одежда по сценарию: папа-программист в
// тёмно-синем джемпере, мама — руководитель проектов в светлой блузе и
// спокойном серо-синем жакете, сын 7–8 лет (дома — джемпер, в школе —
// школьный пиджак и рюкзак).
const DAD_BUILD: Build = { ...ADULT, shoulderHalf: 96, waistHalf: 68, hipHalf: 72, headRx: 62, headRy: 74, limb: 44, leg: 56 };
const SON_BUILD: Build = { ...CHILD, headRx: 72, headRy: 82 };

const DAD = {
  build: DAD_BUILD,
  skin: "#DCAA84",
  skinShade: "#C5906B",
  hair: "#1F1A19",
  hairStyle: "dadShort",
  top: "sweater",
  topColor: "#22385C",
  topShade: "#182A47",
  inner: "#E9E4DA",
  bottom: "#4A4E5C",
  shoes: "#3B2E28",
  brow: "#1F1A19",
  lips: "#A9675E",
  watch: true,
  stubble: true,
} as const satisfies Look;

const MOM = {
  build: ADULT,
  skin: "#E6B590",
  skinShade: "#D29B74",
  hair: "#2A201D",
  hairStyle: "momBob",
  top: "blazer",
  topColor: "#7F90A8",
  topShade: "#6A7A91",
  inner: "#F7F0E4",
  bottom: "#2F3B57",
  shoes: "#2A2A30",
  brow: "#2A201D",
  lips: "#B5655F",
  earrings: true,
  watch: true,
} as const satisfies Look;

const SON_HOME = {
  build: SON_BUILD,
  skin: "#E8B48D",
  skinShade: "#D29A73",
  hair: "#221B19",
  hairStyle: "boyShort",
  top: "sweater",
  topColor: "#5E9E86",
  topShade: "#4C836F",
  inner: "#FFFFFF",
  bottom: "#4A5163",
  shoes: "#222228",
  brow: "#221B19",
  lips: "#B86A62",
} as const satisfies Look;

export const LOOKS = {
  dad: DAD,
  mom: MOM,
  // мама на улице: та же одежда, сумка на плече (bagOnShoulder в позе)
  son: SON_HOME,
  // сын в школе: школьный пиджак, белая рубашка, рюкзак
  sonSchool: { ...SON_HOME, top: "jacket", topColor: "#2F4A7A", topShade: "#243B63", backpack: "#E0A73A" },
  // коллеги в офисах (второй план)
  colleagueA: {
    build: { ...ADULT, shoulderHalf: 92, waistHalf: 70 },
    skin: "#D9A67E",
    skinShade: "#C38E66",
    hair: "#2A2420",
    hairStyle: "dadShort",
    top: "shirt",
    topColor: "#C9D3E0",
    topShade: "#AEB9C9",
    inner: "#EDEDED",
    bottom: "#3A3E48",
    shoes: "#2C2420",
    brow: "#2A2420",
    lips: "#A06058",
  },
  colleagueB: {
    build: ADULT,
    skin: "#E0AF8B",
    skinShade: "#CA9772",
    hair: "#3A2C26",
    hairStyle: "bun",
    top: "cardigan",
    topColor: "#B98B6E",
    topShade: "#9E735A",
    inner: "#F4F1EA",
    bottom: "#353A48",
    shoes: "#2C2C30",
    brow: "#3A2C26",
    lips: "#AE5F5A",
    earrings: true,
  },
  // учительница у школы
  teacher: {
    build: ADULT,
    skin: "#E0AF8B",
    skinShade: "#CA9772",
    hair: "#3A2C26",
    hairStyle: "bun",
    top: "jacket",
    topColor: "#8E3B46",
    topShade: "#76303A",
    inner: "#F4F1EA",
    bottom: "#353A48",
    shoes: "#2C2C30",
    brow: "#3A2C26",
    lips: "#AE5F5A",
    earrings: true,
  },
  kidA: {
    build: CHILD,
    skin: "#E3B08A",
    skinShade: "#CF9873",
    hair: "#3B2B24",
    hairStyle: "girlBraids",
    top: "pinafore",
    topColor: "#26386A",
    topShade: "#1C2B55",
    inner: "#FFFFFF",
    bottom: "#26386A",
    skirt: true,
    legColor: "#EDEAE4",
    shoes: "#2A2A30",
    brow: "#3B2B24",
    lips: "#C46E6A",
    bows: true,
    backpack: "#7A6BC4",
  },
} as const satisfies Record<string, Look>;

export type LookId = keyof typeof LOOKS;
