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

export type HairStyle = "momBob" | "dadShort" | "girlBraids" | "longTail" | "shortGrey" | "boyShort" | "bun" | "boyTuft" | "toddlerTufts";
// suit — расстёгнутый пиджак поверх рубашки (лацканы, воротник рубашки).
// vest — жилет с V-вырезом поверх рубашки (рукава — цвета рубашки inner).
export type Top = "cardigan" | "shirt" | "pinafore" | "jacket" | "sweater" | "tee" | "suit" | "vest";

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
  // №34: короткий рукав (футболка малышки) — предплечья открыты
  readonly shortSleeve?: boolean;
  // длина юбки: доля бедра+голени от пояса (0,52 — до колена, 0,85 — миди)
  readonly skirtLen?: number;
  // возраст лица 0…1: тонкие морщинки у глаз и мягкие носогубные складки
  readonly age?: number;
  // пряди седины (цвет) в причёске
  readonly hairStreak?: string;
  // воротник рубашки под свитером (цвет)
  readonly collar?: string;
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

const AYAN_FACE = {
  skin: "#E8B48D",
  skinShade: "#D29A73",
  hair: "#231A17",
  hairStyle: "boyTuft",
  brow: "#231A17",
  lips: "#B86A62",
} as const;

// ---------- №34 «Жарыядагы ашыкча сап» ----------
// Первичный набор героев (облик уточняется в rig/; ID постоянные — ими
// пользуются сцены и рабочие листы).
// Малышка 2–3 лет: голова ≈ ¼ роста, короткие ручки и ножки.
export const TODDLER: Build = {
  ...CHILD,
  headY: -772,
  headRx: 112,
  headRy: 118,
  neckTop: -660,
  shoulderY: -640,
  shoulderHalf: 92,
  waistY: -470,
  waistHalf: 92,
  hipY: -432,
  hipHalf: 90,
  hipJointY: -392,
  hipJointX: 38,
  thigh: 196,
  shin: 186,
  upperArm: 150,
  forearm: 126,
  hand: 54,
  limb: 56,
  leg: 70,
  foot: 92,
  stride: 140,
};

export const LOOKS = {
  // Мама (30–35): каре, светлый серо-голубой жакет поверх кремовой блузки,
  // тёмно-синие брюки; серьги, часы.
  mom: {
    build: ADULT,
    ...MOM_FACE,
    top: "suit",
    topColor: "#9DB3C6",
    topShade: "#8399AE",
    inner: "#F6EEDF",
    bottom: "#2F3B58",
    shoes: "#2A2A30",
    watch: true,
  },
  // Папа (33–40): короткая стрижка, тёмно-синий джемпер, серые брюки.
  dad: {
    build: DAD_BUILD,
    ...DAD_FACE,
    stubble: true,
    collar: "#D9DFC8",
    top: "sweater",
    topColor: "#3F5577",
    topShade: "#334766",
    inner: "#D9DFC8",
    bottom: "#55596A",
    shoes: "#2A221E",
  },
  // Сын (7–8): хохолок, белая рубашка, тёмно-синий жилет, серые брюки.
  son: {
    build: { ...CHILD, headRx: 72, headRy: 82 },
    ...AYAN_FACE,
    top: "vest",
    topColor: "#2E4570",
    topShade: "#24385C",
    inner: "#FFFFFF",
    bottom: "#5A6274",
    shoes: "#24242A",
    backpack: "#6E9C7E",
  },
  // Дочка (2–3): персиковый сарафан поверх белой футболки, светлые колготки.
  toddler: {
    build: TODDLER,
    skin: "#EDC1A0",
    skinShade: "#DCA986",
    hair: "#2E221E",
    hairStyle: "toddlerTufts",
    tie: "#F2A2B0",
    shortSleeve: true,
    skirtLen: 0.42,
    top: "pinafore",
    topColor: "#F2A98C",
    topShade: "#E0917A",
    inner: "#FFFFFF",
    bottom: "#F2A98C",
    skirt: true,
    legColor: "#F4EEE6",
    shoes: "#C98B73",
    brow: "#2E221E",
    lips: "#D07A72",
  },
  // Воспитатель (45–55): волосы с проседью в пучке, очки, кардиган цвета
  // пыльной сливы, длинная тёмная юбка.
  caregiver: {
    build: ADULT,
    skin: "#DFAE8A",
    skinShade: "#C99672",
    hair: "#4B423E",
    hairStreak: "#B8B0AA",
    hairStyle: "bun",
    age: 0.8,
    skirtLen: 0.8,
    top: "cardigan",
    topColor: "#8E6A7E",
    topShade: "#785769",
    inner: "#F3EEE6",
    bottom: "#3A3C4C",
    skirt: true,
    legColor: "#4A4A58",
    shoes: "#3A302C",
    brow: "#4E4642",
    lips: "#A9665F",
    glasses: "#5A4A44",
  },
  // Кандидаты — только портреты в карточках.
  cand1: {
    build: { ...ADULT, shoulderHalf: 94, waistHalf: 70 },
    skin: "#D6A27C",
    skinShade: "#BF8C66",
    hair: "#262120",
    hairStyle: "dadShort",
    top: "jacket",
    topColor: "#465063",
    topShade: "#384051",
    inner: "#E4E1D8",
    bottom: "#33373F",
    shoes: "#2C2420",
    brow: "#262120",
    lips: "#A06058",
  },
  cand2: {
    build: ADULT,
    skin: "#E9BC98",
    skinShade: "#D6A47F",
    hair: "#3A2A24",
    hairStyle: "longTail",
    top: "sweater",
    topColor: "#C9B58E",
    topShade: "#B39F78",
    inner: "#F4F1EA",
    bottom: "#3A3E4E",
    shoes: "#2C2C30",
    brow: "#3A2A24",
    lips: "#B86A64",
    earrings: true,
  },
  // Коллеги на совещании и в офисе (фон, без реплик).
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
