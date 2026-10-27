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
  headY: -866, headRx: 78, headRy: 88, neckTop: -800,
  shoulderY: -772, shoulderHalf: 102, waistY: -575, waistHalf: 80,
  hipY: -518, hipHalf: 87, hipJointY: -478, hipJointX: 43,
  thigh: 240, shin: 222, upperArm: 155, forearm: 148,
  hand: 47, limb: 47, leg: 65, foot: 92, stride: 210,
};
// Rounded schoolchild proportions, rather than a scaled adult silhouette.
const CHILD: Build = {
  headY: -830, headRx: 93, headRy: 102, neckTop: -751,
  shoulderY: -716, shoulderHalf: 85, waistY: -555, waistHalf: 69,
  hipY: -486, hipHalf: 75, hipJointY: -418, hipJointX: 35,
  thigh: 207, shin: 193, upperArm: 135, forearm: 123,
  hand: 40, limb: 42, leg: 55, foot: 78, stride: 170,
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
  // Мама: тёмные волосы до плеч, кардиган пыльно-розового цвета, кремовая блузка.
  mom: {
    build: ADULT,
    skin: "#E8B892",
    skinShade: "#D49D76",
    hair: "#2B211E",
    hairStyle: "momBob",
    top: "cardigan",
    topColor: "#C9786E",
    topShade: "#AE6158",
    inner: "#F5EADB",
    bottom: "#2C3A5C",
    shoes: "#2A2A30",
    brow: "#2B211E",
    lips: "#B5655F",
    earrings: true,
    watch: true,
  },
  // Папа: короткая стрижка, голубая рубашка, серые брюки, лёгкая щетина.
  dad: {
    build: { ...ADULT, shoulderHalf: 112, waistHalf: 88, hipHalf: 94, headRx: 80, headRy: 90, limb: 50, leg: 69 },
    skin: "#DFAD86",
    skinShade: "#C8936D",
    hair: "#1F1A19",
    hairStyle: "dadShort",
    top: "shirt",
    topColor: "#8FB3D9",
    topShade: "#7298C1",
    inner: "#8FB3D9",
    bottom: "#4A505E",
    shoes: "#3B2E28",
    brow: "#1F1A19",
    lips: "#A9675E",
    watch: true,
    stubble: true,
  },
  // Дочка: косички с белыми бантами, тёмно-синий сарафан, белая блузка,
  // жёлтый рюкзак.
  girl: {
    build: CHILD,
    skin: "#EDC09C",
    skinShade: "#DCA781",
    hair: "#271E1C",
    hairStyle: "girlBraids",
    top: "pinafore",
    topColor: "#26386A",
    topShade: "#1C2B55",
    inner: "#FBFBF8",
    bottom: "#26386A",
    skirt: true,
    legColor: "#F1EFEA",
    shoes: "#24242A",
    brow: "#271E1C",
    lips: "#C46E6A",
    bows: true,
    backpack: "#FFC90E",
  },
  grandma: {
    build: { ...ADULT, waistHalf: 91, hipHalf: 96 }, skin: "#E6B996", skinShade: "#CB9777",
    hair: "#66616B", hairStyle: "shortGrey", top: "cardigan", topColor: "#688F85", topShade: "#456E64", inner: "#F8EEDB",
    bottom: "#544960", shoes: "#4D4040", brow: "#726368", lips: "#AC6D69", earrings: true,
  },
  brother: {
    build: { ...ADULT, shoulderHalf: 111, waistHalf: 87 }, skin: "#DDAA83", skinShade: "#C28A68",
    hair: "#29222A", hairStyle: "boyShort", top: "sweater", topColor: "#526A8A", topShade: "#3A4D6D", inner: "#D6E1EB",
    bottom: "#404759", shoes: "#292E3B", brow: "#29222A", lips: "#A76B60",
  },
  friend: {
    build: { ...ADULT, shoulderHalf: 98 }, skin: "#EDC2A0", skinShade: "#D6A583",
    hair: "#382D27", hairStyle: "longTail", top: "sweater", topColor: "#CBA15D", topShade: "#AA8246", inner: "#F5E9D5",
    bottom: "#5D6273", shoes: "#4C3C32", brow: "#382D27", lips: "#B5706C", earrings: true,
  },
  // Второстепенные: родители и дети у школы, коллеги.
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
  parentB: {
    build: ADULT,
    skin: "#EBC2A0",
    skinShade: "#D6A884",
    hair: "#3A2A22",
    hairStyle: "longTail",
    top: "jacket",
    topColor: "#E2B04A",
    topShade: "#C8973A",
    inner: "#FFFFFF",
    bottom: "#4B5A78",
    shoes: "#3A3030",
    brow: "#3A2A22",
    lips: "#B8665F",
  },
  kidA: {
    build: { ...CHILD, headRx: 72, headRy: 82 },
    skin: "#E3B08A",
    skinShade: "#CF9873",
    hair: "#221B19",
    hairStyle: "boyShort",
    top: "jacket",
    topColor: "#26386A",
    topShade: "#1C2B55",
    inner: "#FFFFFF",
    bottom: "#2E3346",
    shoes: "#222228",
    brow: "#221B19",
    lips: "#B86A62",
    backpack: "#3E7CC0",
  },
  kidB: {
    build: CHILD,
    skin: "#EEC6A6",
    skinShade: "#DAAE8A",
    hair: "#3B2B24",
    hairStyle: "longTail",
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
    backpack: "#E5677A",
  },
  colleagueA: {
    build: ADULT,
    skin: "#E2B28E",
    skinShade: "#CC9A75",
    hair: "#2E2522",
    hairStyle: "bun",
    top: "sweater",
    topColor: "#8C9A6E",
    topShade: "#76845A",
    inner: "#F2F0EA",
    bottom: "#3B4250",
    shoes: "#2C2C30",
    brow: "#2E2522",
    lips: "#B0645E",
  },
  colleagueB: {
    build: { ...ADULT, shoulderHalf: 94 },
    skin: "#D7A27C",
    skinShade: "#C08A64",
    hair: "#5A5552",
    hairStyle: "shortGrey",
    top: "shirt",
    topColor: "#E7E2D6",
    topShade: "#CFC8B8",
    inner: "#E7E2D6",
    bottom: "#454A55",
    shoes: "#2C2420",
    brow: "#4A4542",
    lips: "#9E625A",
  },
} as const satisfies Record<string, Look>;

export type LookId = keyof typeof LOOKS;
