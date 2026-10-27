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

// Девочка 11–12 лет: между ребёнком и взрослым — голова меньше детской,
// шея и ноги длиннее, плечи уже взрослых.
const TEEN: Build = {
  headY: -868,
  headRx: 64,
  headRy: 76,
  neckTop: -794,
  shoulderY: -756,
  shoulderHalf: 76,
  waistY: -566,
  waistHalf: 56,
  hipY: -516,
  hipHalf: 64,
  hipJointY: -472,
  hipJointX: 33,
  thigh: 236,
  shin: 222,
  upperArm: 156,
  forearm: 140,
  hand: 46,
  limb: 36,
  leg: 46,
  foot: 86,
  stride: 220,
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
  // Мама (30–35): тёмные волосы до плеч, кардиган цвета морской волны,
  // кремовая блузка, тёмно-синие брюки; серьги и часы.
  mom: {
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
  // Папа (30–40): короткая стрижка, лёгкая щетина, серо-синий свитер.
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
  // Сын (7–8): короткая стрижка, тёмно-синий школьный пиджак, белая
  // рубашка, серые брюки, зелёный рюкзак.
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
    backpack: "#3E9C6B",
  },
  // №20. Сын (9 лет): короткая стрижка, тёмно-синий школьный пиджак,
  // белая рубашка, серые брюки, зелёный рюкзак. Чуть старше и выше «son»,
  // голова пропорционально меньше (школьник, не малыш). Один облик во всех
  // сценах (дома — без пиджака, в голубом свитере: «boyHome»).
  boy: {
    build: { ...CHILD, headRx: 66, headRy: 76 },
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
  boyHome: {
    build: { ...CHILD, headRx: 66, headRy: 76 },
    skin: "#E8B48D",
    skinShade: "#D29A73",
    hair: "#221B19",
    hairStyle: "boyShort",
    top: "sweater",
    topColor: "#5D8FC2",
    topShade: "#4C79A8",
    inner: "#FFFFFF",
    bottom: "#4A5163",
    shoes: "#3A4A5E",
    brow: "#221B19",
    lips: "#B86A62",
  },
  // №20. Отец — руководитель отдела продаж: тёмно-синий пиджак поверх
  // светлой рубашки (будни); дома — тот же человек в свитере («dad»).
  salesDad: {
    build: { ...ADULT, shoulderHalf: 96, waistHalf: 68, hipHalf: 72, headRx: 62, headRy: 74, limb: 44, leg: 56 },
    skin: "#DCAA84",
    skinShade: "#C5906B",
    hair: "#1F1A19",
    hairStyle: "dadShort",
    top: "jacket",
    topColor: "#2E3D5C",
    topShade: "#24314B",
    inner: "#EEF2F7",
    bottom: "#2E3446",
    shoes: "#2A221E",
    brow: "#1F1A19",
    lips: "#A9675E",
    watch: true,
    stubble: true,
  },
  // Дочь (11–12): хвост, тёмно-синий школьный кардиган и юбка, белая
  // блузка, тёмные колготки, коралловый рюкзак.
  daughter: {
    build: TEEN,
    skin: "#EBBE9A",
    skinShade: "#D8A57F",
    hair: "#2A1F1C",
    hairStyle: "longTail",
    top: "cardigan",
    topColor: "#26386A",
    topShade: "#1C2B55",
    inner: "#FBFBF8",
    bottom: "#26386A",
    skirt: true,
    legColor: "#3B3F55",
    shoes: "#24242A",
    brow: "#2A1F1C",
    lips: "#C46E6A",
    earrings: true,
    backpack: "#E5677A",
  },
  // Учительница: волосы собраны в пучок, бордовый жакет.
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
  // Дочка (8–9 лет): косички с белыми бантами, тёмно-синий школьный
  // жакет и юбка, жёлтый рюкзак. Один облик во всех сценах.
  girl: {
    build: { ...CHILD, headRx: 72, headRy: 82 },
    skin: "#EBBE9A",
    skinShade: "#D8A57F",
    hair: "#2A1F1C",
    hairStyle: "girlBraids",
    top: "jacket",
    topColor: "#2F4A7A",
    topShade: "#243B63",
    inner: "#FFFFFF",
    bottom: "#2F4A7A",
    skirt: true,
    legColor: "#E9E6E0",
    shoes: "#24242A",
    brow: "#2A1F1C",
    lips: "#C46E6A",
    bows: true,
    backpack: "#FFC93D",
  },
  // Бабушка: седые волосы в пучке, тёплый коричневый кардиган.
  grandma: {
    build: { ...ADULT, shoulderHalf: 90, waistHalf: 70, hipHalf: 78 },
    skin: "#E0AE8A",
    skinShade: "#C99572",
    hair: "#B9B3AE",
    hairStyle: "bun",
    top: "cardigan",
    topColor: "#8A5A44",
    topShade: "#734836",
    inner: "#EFE6D8",
    bottom: "#4A4450",
    skirt: true,
    legColor: "#6B5B55",
    shoes: "#3A3030",
    brow: "#8E8782",
    lips: "#A9675E",
  },
  // Второстепенные: дети и родители у школы.
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
  parentA: {
    build: { ...ADULT, shoulderHalf: 94, waistHalf: 70 },
    skin: "#D9A67E",
    skinShade: "#C38E66",
    hair: "#2A2420",
    hairStyle: "dadShort",
    top: "jacket",
    topColor: "#5E7A6B",
    topShade: "#4C6558",
    inner: "#EDEDED",
    bottom: "#3A3E48",
    shoes: "#2C2420",
    brow: "#2A2420",
    lips: "#A06058",
  },
} as const satisfies Record<string, Look>;

export type LookId = keyof typeof LOOKS;
