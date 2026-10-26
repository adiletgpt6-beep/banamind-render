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

export type HairStyle = "momBob" | "dadShort" | "boyShort" | "bun" | "grandmaScarf";
export type Top = "cardigan" | "shirt" | "jacket" | "sweater" | "tee" | "vest";

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
  readonly glasses?: string; // цвет оправы
  readonly wrinkles?: boolean; // мягкие морщинки (бабушка)
  readonly scarf?: string; // платок (бабушка)
  readonly backpack?: string;
};

// Ребёнок 6–7 лет: голова крупнее, ноги и руки короче (в мире — рост
// ≈ 0,68 роста папы).
const KID: Build = { ...CHILD, headRx: 72, headRy: 82 };

export const LOOKS = {
  // Папа (35–42), инженер: аккуратная короткая стрижка, очень лёгкая
  // щетина, сдержанная синяя рубашка, тёмно-серые брюки, часы.
  dad: {
    build: { ...ADULT, shoulderHalf: 96, waistHalf: 68, hipHalf: 72, headRx: 62, headRy: 74, limb: 44, leg: 56 },
    skin: "#DCAA84",
    skinShade: "#C5906B",
    hair: "#1F1A19",
    hairStyle: "dadShort",
    top: "shirt",
    topColor: "#3F6FA6",
    topShade: "#30588A",
    inner: "#5C88BC",
    bottom: "#3B4152",
    shoes: "#3B2E28",
    brow: "#1F1A19",
    lips: "#A9675E",
    watch: true,
    stubble: true,
  },
  // Мама (30–38), работает с клиентами: волосы до плеч, тёплый светлый
  // кардиган, коралловая блузка — небольшой цветовой акцент; серьги, часы.
  mom: {
    build: ADULT,
    skin: "#E6B590",
    skinShade: "#D29B74",
    hair: "#2A201D",
    hairStyle: "momBob",
    top: "cardigan",
    topColor: "#F1DCC6",
    topShade: "#DCC1A6",
    inner: "#E07A5F",
    bottom: "#2F3B57",
    shoes: "#2A2A30",
    brow: "#2A201D",
    lips: "#B5655F",
    earrings: true,
    watch: true,
  },
  // Сын (6–7) дома: короткая стрижка, тёплая горчичная толстовка, серые брюки.
  son: {
    build: KID,
    skin: "#E8B48D",
    skinShade: "#D29A73",
    hair: "#221B19",
    hairStyle: "boyShort",
    top: "sweater",
    topColor: "#E0A04A",
    topShade: "#C7863A",
    inner: "#FFFFFF",
    bottom: "#4F5668",
    shoes: "#2B2B33",
    brow: "#221B19",
    lips: "#B86A62",
  },
  // Сын в школьной форме (воспоминание): тёмно-синий пиджак, белая
  // рубашка, зелёный рюкзак.
  sonSchool: {
    build: KID,
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
    backpack: "#3E9C6B",
  },
  // Коллега папы: инженер, волосы в пучке, очки, тёмно-зелёный кардиган.
  colleague: {
    build: { ...ADULT, headRx: 59, headRy: 71 },
    skin: "#D9A47F",
    skinShade: "#C38D69",
    hair: "#3A2C26",
    hairStyle: "bun",
    top: "cardigan",
    topColor: "#3F6B5E",
    topShade: "#33584D",
    inner: "#F2EFE8",
    bottom: "#353A48",
    shoes: "#2C2C30",
    brow: "#3A2C26",
    lips: "#AE5F5A",
    glasses: "#2B2F3A",
  },
  // Бабушка: седые волосы под платком, тёплая бордовая жилетка поверх
  // светлой блузки, мягкие морщинки.
  grandma: {
    build: { ...ADULT, shoulderHalf: 90, waistHalf: 72, hipHalf: 80, headRx: 61, headRy: 72 },
    skin: "#DDAA86",
    skinShade: "#C7926D",
    hair: "#BDB7B2",
    hairStyle: "grandmaScarf",
    top: "vest",
    topColor: "#8E3B46",
    topShade: "#76303A",
    inner: "#F3EADB",
    bottom: "#4A4450",
    skirt: true,
    legColor: "#6B5E5A",
    shoes: "#3A2E2A",
    brow: "#8E8580",
    lips: "#A86A62",
    wrinkles: true,
    scarf: "#C8643F",
  },
} as const satisfies Record<string, Look>;

export type LookId = keyof typeof LOOKS;
