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


export type HairStyle = "momBob" | "dadShort" | "girlBraids" | "longTail" | "shortGrey" | "boyShort" | "bun" | "boyTuft";
// suit — расстёгнутый пиджак поверх рубашки (лацканы, воротник рубашки).
export type Top = "cardigan" | "shirt" | "pinafore" | "jacket" | "sweater" | "tee" | "suit";

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
  readonly tie?: string; // резинка для волос (хвост)
  readonly glasses?: string; // оправа очков (Эмир)
  readonly backpack?: string;
};


const DAD_BUILD: Build = { ...ADULT, shoulderHalf: 96, waistHalf: 68, hipHalf: 72, headRx: 62, headRy: 74, limb: 44, leg: 56 };

const DAD_FACE = {
  skin: "#DCAA84",
  skinShade: "#C5906B",
  hair: "#1F1A19",
  hairStyle: "dadShort",
  brow: "#1F1A19",
  lips: "#A9675E",
  watch: true,
} as const;

const MOM_FACE = {
  skin: "#E6B590",
  skinShade: "#D29B74",
  hair: "#2A201D",
  hairStyle: "momBob",
  brow: "#2A201D",
  lips: "#B5655F",
  earrings: true,
} as const;

// Сын (7–9 лет): между первоклассником и девятилетним — голова чуть
// крупнее взрослой пропорционально, но без «гигантских» глаз и головы.
const SON: Build = { ...CHILD, headY: -842, headRx: 69, headRy: 80, neckTop: -762, shoulderY: -726, shoulderHalf: 75, thigh: 222, shin: 214, upperArm: 150, forearm: 134, stride: 188 };

const SON_FACE = {
  skin: "#E8B48D",
  skinShade: "#D29A73",
  hair: "#231A17",
  hairStyle: "boyShort",
  brow: "#231A17",
  lips: "#B86A62",
} as const;

const GRANDMA_FACE = {
  skin: "#DDAA88",
  skinShade: "#C4916F",
  hair: "#B9B4AE",
  hairStyle: "shortGrey",
  brow: "#8E8A86",
  lips: "#A9675E",
} as const;

// ---------- №36 «Чемодан у двери» ----------
// Одна причёска и один силуэт у каждого героя во всех сценах; меняется
// только одежда (дом / работа / выступление / школа).
export const LOOKS = {
  // Мама (32–38): тёмное каре до плеч, серьги. Дома — мягкий шалфейный
  // кардиган поверх кремовой блузки, тёмно-синие брюки.
  momHome: {
    build: ADULT,
    ...MOM_FACE,
    top: "cardigan",
    topColor: "#8FA58A",
    topShade: "#76906F",
    inner: "#F6EEDF",
    bottom: "#34405C",
    shoes: "#3A3236",
  },
  // Мама на выступлении и в дороге: синий жакет и светлая блузка.
  momTalk: {
    build: ADULT,
    ...MOM_FACE,
    top: "suit",
    topColor: "#2F5FA8",
    topShade: "#244C88",
    inner: "#FBF6EC",
    bottom: "#2B344C",
    shoes: "#2A2A30",
    watch: true,
  },
  // Папа (34–42): короткая стрижка, лёгкая щетина. На работе — светло-
  // голубая рубашка и серые брюки, часы.
  dadWork: {
    build: DAD_BUILD,
    ...DAD_FACE,
    stubble: true,
    top: "shirt",
    topColor: "#CFE0EE",
    topShade: "#A9C3DA",
    inner: "#EEF4F9",
    bottom: "#4A4F5E",
    shoes: "#3B2E28",
  },
  // Папа дома: серо-зелёный джемпер.
  dadHome: {
    build: DAD_BUILD,
    ...DAD_FACE,
    stubble: true,
    top: "sweater",
    topColor: "#7D8C9B",
    topShade: "#66768A",
    inner: "#E9E4DA",
    bottom: "#45495A",
    shoes: "#3B2E28",
  },
  // Сын в школе: тёмно-синий школьный пиджак, белая рубашка, серые брюки,
  // небольшой бирюзовый рюкзак (не путается с охристой папкой мамы).
  sonSchool: {
    build: SON,
    ...SON_FACE,
    top: "jacket",
    topColor: "#2F4A7A",
    topShade: "#243B63",
    inner: "#FFFFFF",
    bottom: "#5A6070",
    shoes: "#222228",
    backpack: "#4F9A92",
  },
  // Сын дома: спокойная футболка цвета морской волны.
  sonHome: {
    build: SON,
    ...SON_FACE,
    top: "tee",
    topColor: "#78AFC2",
    topShade: "#5F95A9",
    inner: "#FFFFFF",
    bottom: "#4E5A74",
    shoes: "#E8E4DC",
  },
  // Бабушка: седая короткая стрижка, сливовый кардиган, юбка.
  grandma: {
    build: { ...ADULT, shoulderHalf: 84, waistHalf: 70, hipHalf: 80 },
    ...GRANDMA_FACE,
    top: "cardigan",
    topColor: "#9C6B7E",
    topShade: "#835A6A",
    inner: "#F3ECE2",
    bottom: "#5A5060",
    skirt: true,
    legColor: "#D9B79A",
    shoes: "#3A3236",
    earrings: true,
  },
  // Коллеги и слушатели (дальний план).
  colleague: {
    build: { ...ADULT, shoulderHalf: 92, waistHalf: 70 },
    skin: "#D9A67E",
    skinShade: "#C38E66",
    hair: "#2A2420",
    hairStyle: "dadShort",
    top: "jacket",
    topColor: "#6F7F8E",
    topShade: "#5C6B79",
    inner: "#EDEDED",
    bottom: "#3A3E48",
    shoes: "#2C2420",
    brow: "#2A2420",
    lips: "#A06058",
  },
  listenerA: {
    build: ADULT,
    skin: "#E0AF8B",
    skinShade: "#CA9772",
    hair: "#3A2C26",
    hairStyle: "bun",
    top: "cardigan",
    topColor: "#C98B6B",
    topShade: "#B07758",
    inner: "#F4F1EA",
    bottom: "#353A48",
    shoes: "#2C2C30",
    brow: "#3A2C26",
    lips: "#AE5F5A",
  },
} as const satisfies Record<string, Look>;

export type LookId = keyof typeof LOOKS;
