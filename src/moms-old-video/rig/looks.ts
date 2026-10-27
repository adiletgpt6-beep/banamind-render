// Персонажи фильма №33: пропорции и внешность. Пропорции одинаковы во всех
// сценах; меняется только одежда (офис, дом, танцы). Молодая мама на старой
// записи — та же голова, тот же цвет волос и родинка под глазом, но длинный
// хвост и сценический костюм.
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
  shoulderHalf: 86,
  waistY: -575,
  waistHalf: 58,
  hipY: -520,
  hipHalf: 70,
  hipJointY: -478,
  hipJointX: 38,
  thigh: 240,
  shin: 222,
  upperArm: 160,
  forearm: 146,
  hand: 52,
  limb: 42,
  leg: 58,
  foot: 92,
  stride: 240,
};

const MAN: Build = { ...ADULT, shoulderHalf: 96, waistHalf: 68, hipHalf: 72, headRx: 62, headRy: 74, limb: 48, leg: 64, hand: 56 };

// Мальчик 8 лет: голова крупнее, ноги и руки короче (рост в кадре — H.son).
const CHILD: Build = {
  headY: -838,
  headRx: 72,
  headRy: 82,
  neckTop: -756,
  shoulderY: -720,
  shoulderHalf: 76,
  waistY: -545,
  waistHalf: 60,
  hipY: -500,
  hipHalf: 66,
  hipJointY: -450,
  hipJointX: 32,
  thigh: 222,
  shin: 212,
  upperArm: 150,
  forearm: 132,
  hand: 46,
  limb: 39,
  leg: 52,
  foot: 80,
  stride: 180,
};

export type HairStyle = "momBob" | "longTail" | "dadShort" | "boyShort" | "bun" | "shortBob";
export type Top = "cardigan" | "blazer" | "jacket" | "sweater" | "tee" | "shirt";

export type Look = {
  readonly build: Build;
  readonly skin: string;
  readonly skinShade: string;
  readonly hair: string;
  readonly hairStyle: HairStyle;
  readonly hairLen?: number; // длина хвоста (1 — до лопаток)
  readonly top: Top;
  readonly topColor: string;
  readonly topShade: string;
  readonly inner: string; // блузка под жакетом, воротник
  readonly bottom: string; // брюки/юбка
  readonly skirt?: boolean;
  readonly legColor?: string; // колготки / ноги под юбкой
  readonly shoes: string;
  readonly brow: string;
  readonly lips: string;
  readonly earrings?: boolean;
  readonly watch?: boolean; // часы на левой руке
  readonly stubble?: boolean;
  readonly mole?: boolean; // родинка под левым глазом (мама — молодая и сейчас)
  readonly backpack?: string;
  readonly sleeve?: "long" | "short";
};

// Мама: одна внешность (лицо, кожа, волосы, родинка) — разная одежда.
const MOM_FACE = {
  build: ADULT,
  skin: "#E6B590",
  skinShade: "#D29B74",
  hair: "#3A2520",
  brow: "#2E1E1A",
  lips: "#B5655F",
  earrings: true,
  mole: true,
} as const;

export const LOOKS = {
  // Офис: тёмно-синий жакет, кремовая блузка, графитовые брюки; часы.
  momOffice: {
    ...MOM_FACE,
    hairStyle: "momBob",
    top: "blazer",
    topColor: "#2C3D6B",
    topShade: "#223158",
    inner: "#F5EADB",
    bottom: "#3A3F4F",
    shoes: "#2A2A30",
    watch: true,
  },
  // Дом: тёплый терракотовый свитер, светлые брюки, домашние носки.
  momHome: {
    ...MOM_FACE,
    hairStyle: "momBob",
    top: "sweater",
    topColor: "#C47A62",
    topShade: "#A9654F",
    inner: "#F5EADB",
    bottom: "#5A6478",
    shoes: "#E9E4DC",
    watch: true,
  },
  // Танцы: свободная футболка, тёмные спортивные брюки, белые кроссовки,
  // волосы собраны в хвост.
  momDance: {
    ...MOM_FACE,
    hairStyle: "longTail",
    hairLen: 0.62,
    top: "tee",
    topColor: "#EDF2FA",
    topShade: "#C9D3E4",
    inner: "#EDF2FA",
    bottom: "#2B3A63",
    shoes: "#F7F7F7",
    sleeve: "short",
  },
  // Молодая мама на сцене (запись 2014 года): длинный хвост, синий топ и
  // летящая юбка, светлые балетки.
  youngMom: {
    ...MOM_FACE,
    hairStyle: "longTail",
    hairLen: 1,
    top: "tee",
    topColor: "#24407A",
    topShade: "#1A3163",
    inner: "#24407A",
    bottom: "#3E6FB8",
    skirt: true,
    legColor: "#E6B590",
    shoes: "#EADBC8",
    lips: "#C46868",
    sleeve: "short",
  },
  // Молодая мама на репетиции в студии (воспоминание).
  youngMomStudio: {
    ...MOM_FACE,
    hairStyle: "longTail",
    hairLen: 1,
    top: "tee",
    topColor: "#F2C9C4",
    topShade: "#DDAFA9",
    inner: "#F2C9C4",
    bottom: "#2E3550",
    shoes: "#F2F2F2",
    lips: "#C46868",
    sleeve: "short",
  },
  // Папа (37): короткая стрижка, лёгкая щетина, серо-синий свитер.
  dad: {
    build: MAN,
    skin: "#DCAA84",
    skinShade: "#C5906B",
    hair: "#1F1A19",
    hairStyle: "dadShort",
    top: "sweater",
    topColor: "#5E7396",
    topShade: "#4D5F7F",
    inner: "#E9E4DA",
    bottom: "#45495A",
    shoes: "#DCD8D0",
    brow: "#1F1A19",
    lips: "#A9675E",
    watch: true,
    stubble: true,
  },
  // Сын (8) дома: мятная футболка, джинсы, носки.
  son: {
    build: CHILD,
    skin: "#E8B48D",
    skinShade: "#D29A73",
    hair: "#2A1F1C",
    hairStyle: "boyShort",
    top: "tee",
    topColor: "#78BFA2",
    topShade: "#5FA387",
    inner: "#78BFA2",
    bottom: "#3F5A82",
    shoes: "#E1E5EC",
    brow: "#2A1F1C",
    lips: "#B86A62",
    sleeve: "short",
  },
  // Сын после школы: тёмно-синий пиджак, белая рубашка, рюкзак.
  sonSchool: {
    build: CHILD,
    skin: "#E8B48D",
    skinShade: "#D29A73",
    hair: "#2A1F1C",
    hairStyle: "boyShort",
    top: "jacket",
    topColor: "#2F4A7A",
    topShade: "#243B63",
    inner: "#FFFFFF",
    bottom: "#4A5163",
    shoes: "#222228",
    brow: "#2A1F1C",
    lips: "#B86A62",
    backpack: "#3E9C6B",
  },
  // Коллеги в офисе.
  colleagueA: {
    build: MAN,
    skin: "#D9A67E",
    skinShade: "#C38E66",
    hair: "#2A2420",
    hairStyle: "dadShort",
    top: "shirt",
    topColor: "#DCE6F2",
    topShade: "#BFCBDC",
    inner: "#DCE6F2",
    bottom: "#3A3E48",
    shoes: "#2C2420",
    brow: "#2A2420",
    lips: "#A06058",
  },
  colleagueB: {
    build: ADULT,
    skin: "#EDC4A0",
    skinShade: "#D9AB85",
    hair: "#6B4636",
    hairStyle: "shortBob",
    top: "cardigan",
    topColor: "#7E9C8A",
    topShade: "#688676",
    inner: "#FBF7EF",
    bottom: "#38405A",
    shoes: "#2C2C30",
    brow: "#5A3A2C",
    lips: "#B8685F",
    earrings: true,
  },
  // Подруги по студии (воспоминание) и тренер на пробном занятии.
  friendA: {
    build: ADULT,
    skin: "#E3B08A",
    skinShade: "#CF9873",
    hair: "#24191A",
    hairStyle: "bun",
    top: "tee",
    topColor: "#B9D5EC",
    topShade: "#9DBCD8",
    inner: "#B9D5EC",
    bottom: "#323A55",
    shoes: "#F2F2F2",
    brow: "#24191A",
    lips: "#C46E6A",
    sleeve: "short",
  },
  friendB: {
    build: ADULT,
    skin: "#EBBE9A",
    skinShade: "#D8A57F",
    hair: "#5A3B2E",
    hairStyle: "shortBob",
    top: "tee",
    topColor: "#F6E3A8",
    topShade: "#E2CB86",
    inner: "#F6E3A8",
    bottom: "#3B3F55",
    shoes: "#F2F2F2",
    brow: "#4A3024",
    lips: "#C46E6A",
    sleeve: "short",
  },
  coach: {
    build: ADULT,
    skin: "#DDA984",
    skinShade: "#C8916C",
    hair: "#1E1718",
    hairStyle: "bun",
    top: "tee",
    topColor: "#2E4A86",
    topShade: "#243C70",
    inner: "#2E4A86",
    bottom: "#1F2840",
    shoes: "#F2F2F2",
    brow: "#1E1718",
    lips: "#B5655F",
    earrings: true,
    sleeve: "short",
  },
} as const satisfies Record<string, Look>;

export type LookId = keyof typeof LOOKS;

// Рост персонажей в кадре (px мира на «нормальной» глубине). Отношение
// сына к маме — как у восьмилетнего мальчика (≈ 0,75) — одинаково во всех
// сценах; меняется только масштаб плана.
export const H = { mom: 760, dad: 800, son: 568, adult: 760 } as const;
