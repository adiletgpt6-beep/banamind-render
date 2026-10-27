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
  readonly soles?: string; // кроссовки: белая подошва и шнурки
  readonly brow: string;
  readonly lips: string;
  readonly earrings?: boolean;
  readonly watch?: boolean; // часы на левой руке
  readonly stubble?: boolean;
  readonly bows?: boolean;
  readonly backpack?: string;
  readonly glasses?: boolean; // очки в тонкой оправе
};

export const LOOKS = {
  // Мама с чертежами (35–40): волосы собраны в пучок, очки, жакет цвета
  // морской волны, белая блузка, тёмно-синие брюки; часы и серьги.
  momWork: {
    build: ADULT,
    skin: "#E2B08A",
    skinShade: "#CD9873",
    hair: "#2B211E",
    hairStyle: "bun",
    top: "jacket",
    topColor: "#2F6F8F",
    topShade: "#255A75",
    inner: "#FFFFFF",
    bottom: "#2E3550",
    shoes: "#2A2A30",
    brow: "#2B211E",
    lips: "#B0625C",
    earrings: true,
    watch: true,
    glasses: true,
  },
  // Папа (35–40): короткая стрижка, лёгкая щетина, серо-синий свитер.
  dad: {
    build: { ...ADULT, shoulderHalf: 96, waistHalf: 68, hipHalf: 72, headRx: 62, headRy: 74, limb: 44, leg: 56 },
    skin: "#DCAA84",
    skinShade: "#C5906B",
    hair: "#1F1A19",
    hairStyle: "dadShort",
    top: "sweater",
    topColor: "#6D7FA3",
    topShade: "#59698B",
    inner: "#E9E4DA",
    bottom: "#45495A",
    shoes: "#3B2E28",
    brow: "#1F1A19",
    lips: "#A9675E",
    watch: true,
    stubble: true,
  },
  // Сын (8–9): короткая стрижка, домашняя синяя футболка, серые брюки.
  son: {
    build: { ...CHILD, headRx: 72, headRy: 82 },
    skin: "#E8B48D",
    skinShade: "#D29A73",
    hair: "#221B19",
    hairStyle: "boyShort",
    top: "tee",
    topColor: "#3E86C8",
    topShade: "#316EA6",
    inner: "#3E86C8",
    bottom: "#4A5163",
    shoes: "#2E3440",
    brow: "#221B19",
    lips: "#B86A62",
  },
  // Предпринимательница (30–35): длинный хвост, карамельный кардиган,
  // кремовая блузка; мастерская войлочных изделий.
  momMaker: {
    build: ADULT,
    skin: "#D9A27C",
    skinShade: "#C28A65",
    hair: "#3A2620",
    hairStyle: "longTail",
    top: "cardigan",
    topColor: "#C9825B",
    topShade: "#AE6B47",
    inner: "#FFF6E8",
    bottom: "#3A3F58",
    shoes: "#2C2C30",
    brow: "#3A2620",
    lips: "#B35F57",
    earrings: true,
  },
  // Четвёртая мама (30–35): волосы до плеч, кардиган цвета морской волны,
  // кремовая блузка, тёмно-синие брюки.
  momSeeker: {
    build: ADULT,
    skin: "#E6B590",
    skinShade: "#D29B74",
    hair: "#2A201D",
    hairStyle: "momBob",
    top: "cardigan",
    topColor: "#5E9A93",
    topShade: "#4A7F79",
    inner: "#F5EADB",
    bottom: "#33405F",
    shoes: "#2A2A30",
    brow: "#2A201D",
    lips: "#B5655F",
    earrings: true,
    watch: true,
  },
  // Дочь четвёртой мамы (8): косички с бантами, розовая домашняя кофта.
  daughter: {
    build: CHILD,
    skin: "#EBBE9A",
    skinShade: "#D8A57F",
    hair: "#2A1F1C",
    hairStyle: "girlBraids",
    top: "sweater",
    topColor: "#E99AAE",
    topShade: "#D17F94",
    inner: "#FFFFFF",
    bottom: "#3B4A78",
    shoes: "#2A2A30",
    brow: "#2A1F1C",
    lips: "#C46E6A",
    bows: true,
  },
} as const satisfies Record<string, Look>;

export type LookId = keyof typeof LOOKS;
