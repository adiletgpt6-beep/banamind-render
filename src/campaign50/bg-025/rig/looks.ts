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

// Девочка 9–10 лет: между ребёнком 7–8 лет и подростком — голова
// пропорционально меньше детской, ноги длиннее; ниже взрослых в любом плане.
const GIRL: Build = {
  ...CHILD,
  headY: -846,
  headRx: 64,
  headRy: 74,
  neckTop: -768,
  shoulderY: -732,
  shoulderHalf: 74,
  thigh: 226,
  shin: 216,
  upperArm: 152,
  forearm: 136,
  stride: 196,
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

// Мальчик 9–10 лет: голова крупнее взрослой, но меньше, чем у малыша;
// ноги и руки длиннее, чем у первоклассника.
const BOY: Build = { ...GIRL, headRx: 66, headRy: 77, shoulderHalf: 76 };

const AYAN_FACE = {
  skin: "#E8B48D",
  skinShade: "#D29A73",
  hair: "#231A17",
  hairStyle: "boyTuft",
  brow: "#231A17",
  lips: "#B86A62",
} as const;

const EMIR_FACE = {
  skin: "#DDA882",
  skinShade: "#C69069",
  hair: "#4A332A",
  hairStyle: "boyShort",
  brow: "#4A332A",
  lips: "#A9675E",
  glasses: "#2E3D5C",
} as const;

// ---------- №29 «Жыйырма беш конверт» ----------
export const LOOKS = {
  // BG-025: мама — длинный хвост, синий жакет поверх светло-жёлтой блузки
  // (фирменный акцент), часы. Одна и та же во всех планах.
  apa: {
    build: ADULT,
    ...MOM_FACE,
    hairStyle: "longTail",
    tie: "#FFC90E",
    top: "suit",
    topColor: "#2F4C86",
    topShade: "#263F72",
    inner: "#FFE9A6",
    bottom: "#2B3550",
    shoes: "#2A2A30",
    watch: true,
  },
  // BG-025: постоянный водитель маршрута (условный персонаж).
  driver: {
    build: DAD_BUILD,
    ...DAD_FACE,
    top: "jacket",
    topColor: "#33476E",
    topShade: "#2A3B5C",
    inner: "#FFFFFF",
    bottom: "#2E3446",
    shoes: "#2A221E",
  },
  // Аян (9–10): хохолок надо лбом — одно лицо во всех планах. Дома —
  // тёплый жёлтый джемпер и тёмно-синие брюки; в школе — тёмно-синий
  // школьный жилет-кардиган поверх жёлтой рубашки (тот же жёлтый акцент).
  ayanHome: {
    build: BOY,
    ...AYAN_FACE,
    top: "sweater",
    topColor: "#FFD43B",
    topShade: "#E9B820",
    inner: "#FFFFFF",
    bottom: "#2F3B5C",
    shoes: "#5D6B8A",
  },
  ayanSchool: {
    build: BOY,
    ...AYAN_FACE,
    top: "cardigan",
    topColor: "#26386A",
    topShade: "#1C2B55",
    inner: "#FFD43B",
    bottom: "#2F3B5C",
    shoes: "#24242A",
    backpack: "#FFD43B",
  },
  // Эмир — друг по парте: круглые очки, каштановые волосы, зелёный жилет.
  emir: {
    build: BOY,
    ...EMIR_FACE,
    top: "cardigan",
    topColor: "#4FA36B",
    topShade: "#3E8A58",
    inner: "#FFFFFF",
    bottom: "#2F3B5C",
    shoes: "#24242A",
  },
  // Папа — офисный специалист: голубая рубашка, тёмные брюки, часы. Без
  // бороды и без полупрозрачной тени щетины.
  dad: {
    build: DAD_BUILD,
    ...DAD_FACE,
    top: "shirt",
    topColor: "#CFE0F2",
    topShade: "#A9C1DC",
    inner: "#CFE0F2",
    bottom: "#2E3446",
    shoes: "#2A221E",
  },
  // Дома вечером — тот же человек в тёмно-синем свитере.
  dadHome: {
    build: DAD_BUILD,
    ...DAD_FACE,
    top: "sweater",
    topColor: "#3E5378",
    topShade: "#324566",
    inner: "#CFE0F2",
    bottom: "#2E3446",
    shoes: "#2A221E",
  },
  // Мама: каре; на работе — серо-бирюзовый жакет, дома — приглушённый
  // коралловый кардиган.
  momWork: {
    build: ADULT,
    ...MOM_FACE,
    top: "suit",
    topColor: "#4F7480",
    topShade: "#3F5F6A",
    inner: "#F5EADB",
    bottom: "#33405F",
    shoes: "#2A2A30",
    watch: true,
  },
  momHome: {
    build: ADULT,
    ...MOM_FACE,
    top: "cardigan",
    topColor: "#C9786A",
    topShade: "#B0655A",
    inner: "#F5EADB",
    bottom: "#33405F",
    shoes: "#2A2A30",
    watch: true,
  },
  // Учительница: пучок, бордовый жакет — одна короткая сцена.
  teacher: {
    build: ADULT,
    skin: "#E0AF8B",
    skinShade: "#CA9772",
    hair: "#3A2C26",
    hairStyle: "bun",
    top: "suit",
    topColor: "#8E3B46",
    topShade: "#76303A",
    inner: "#F4F1EA",
    bottom: "#353A48",
    shoes: "#2C2C30",
    brow: "#3A2C26",
    lips: "#AE5F5A",
    earrings: true,
  },
  // Команда школьного проекта и одноклассники (без реплик).
  kidBraids: {
    build: { ...CHILD, headRx: 66, headRy: 76 },
    skin: "#E3B08A",
    skinShade: "#CF9873",
    hair: "#3B2B24",
    hairStyle: "girlBraids",
    top: "cardigan",
    topColor: "#26386A",
    topShade: "#1C2B55",
    inner: "#FFFFFF",
    bottom: "#26386A",
    skirt: true,
    legColor: "#EDEAE4",
    shoes: "#2A2A30",
    brow: "#3B2B24",
    lips: "#C46E6A",
  },
  kidTall: {
    build: { ...TEEN, headRx: 64, headRy: 74 },
    skin: "#D9A67E",
    skinShade: "#C38E66",
    hair: "#2A2420",
    hairStyle: "boyShort",
    top: "cardigan",
    topColor: "#26386A",
    topShade: "#1C2B55",
    inner: "#E06A5C",
    bottom: "#2E3550",
    shoes: "#2A2A30",
    brow: "#2A2420",
    lips: "#A06058",
  },
  // Коллеги в офисах (фон).
  colleagueW: {
    build: ADULT,
    skin: "#E0AF8B",
    skinShade: "#CA9772",
    hair: "#3A2C26",
    hairStyle: "bun",
    top: "cardigan",
    topColor: "#B9A27A",
    topShade: "#9F8A64",
    inner: "#F4F1EA",
    bottom: "#353A48",
    shoes: "#2C2C30",
    brow: "#3A2C26",
    lips: "#AE5F5A",
  },
  colleagueM: {
    build: { ...ADULT, shoulderHalf: 92, waistHalf: 68 },
    skin: "#D9A67E",
    skinShade: "#C38E66",
    hair: "#2A2420",
    hairStyle: "dadShort",
    top: "shirt",
    topColor: "#E7E2D6",
    topShade: "#CFC8B8",
    inner: "#E7E2D6",
    bottom: "#3A3E48",
    shoes: "#2C2420",
    brow: "#2A2420",
    lips: "#A06058",
  },
} as const satisfies Record<string, Look>;

export type LookId = keyof typeof LOOKS;
