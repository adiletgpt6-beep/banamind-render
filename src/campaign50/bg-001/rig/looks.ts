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
  readonly brow: string;
  readonly lips: string;
  readonly earrings?: boolean;
  readonly watch?: boolean; // часы на левой руке
  readonly stubble?: boolean;
  readonly bows?: boolean;
  readonly backpack?: string;
};

export const LOOKS = {
  // Мама (30–35), менеджер в офисе: тёмные волосы до плеч, тёмно-синий
  // жакет, светлая блузка, серые брюки; серьги и часы на левой руке.
  mom: {
    build: ADULT,
    skin: "#E6B590",
    skinShade: "#D29B74",
    hair: "#2A201D",
    hairStyle: "momBob",
    top: "jacket",
    topColor: "#2E4170",
    topShade: "#23345C",
    inner: "#FBF3E4",
    bottom: "#4A4F5E",
    shoes: "#2A2A30",
    brow: "#2A201D",
    lips: "#B5655F",
    earrings: true,
    watch: true,
  },
  // Сын (8–10): короткая стрижка, дома — в школьной рубашке и жилете
  // (свитер без рукавов), тёмные брюки; рюкзак жёлтый, как акцент BalaGo.
  son: {
    build: { ...CHILD, headY: -846, headRx: 70, headRy: 80, thigh: 228, shin: 218, upperArm: 154, forearm: 136 },
    skin: "#E8B48D",
    skinShade: "#D29A73",
    hair: "#221B19",
    hairStyle: "boyShort",
    top: "sweater",
    topColor: "#3D5A8C",
    topShade: "#304A76",
    inner: "#FFFFFF",
    bottom: "#3F4656",
    shoes: "#222228",
    brow: "#221B19",
    lips: "#B86A62",
    backpack: "#F2B705",
  },
} as const satisfies Record<string, Look>;

export type LookId = keyof typeof LOOKS;
