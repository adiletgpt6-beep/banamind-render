// Модели персонажей: пропорции (в единицах мира, 5 ед. ≈ 1 см при масштабе 1)
// и внешний вид. Возраст читается прежде всего по пропорциям: размер головы
// относительно роста, длина ног и рук, ширина плеч.
import { hash01 } from "./geom.ts";

export type HairStyle = "fringe" | "wavy" | "sidepart" | "short" | "buzz" | "curly" | "spiky" | "covered";
export type Top = "tshirt" | "sweatshirt" | "shirt" | "jacket" | "longsleeve" | "hoodie" | "dress";

export type Body = {
  height: number;
  headW: number; // ширина черепа
  headH: number; // от макушки до подбородка
  neck: number;
  neckW: number;
  torso: number; // от плечевой линии до таза
  shoulderW: number;
  hipW: number;
  upperArm: number;
  foreArm: number;
  hand: number;
  limbW: number; // толщина рук
  thigh: number;
  shin: number;
  legW: number;
  foot: number;
  child: number; // 0 — взрослый, 1 — малыш: глаза крупнее и ниже, щёки, маленький нос
};

export type Look = {
  key: string;
  body: Body;
  skin: string;
  skinShade: string;
  hair: string;
  hairStyle: HairStyle;
  top: Top;
  topColor: string;
  topShade: string;
  topAccent?: string; // полоса, принт, воротник
  undershirt?: string; // рубашка под пиджаком / свитшот под курткой
  coat?: boolean; // куртка на молнии (бытовая вставка)
  pants: string;
  pantsShade: string;
  socks: string;
  beard?: string;
  kufi?: string;
  scarf?: string; // платок (мама)
  iris: string;
  brow: string;
  faceShape: number; // -1 — круглое, +1 — вытянутое
  noseSize: number;
  earSize: number;
  browThick: number;
};

export const OUTLINE = "#3b2c26";
export const OUTLINE_W = 2.6;

const kidBody = (age: number, k = 1): Body => {
  // интерполяция между 4 и 12 годами
  const t = Math.max(0, Math.min(1, (age - 4) / 8));
  const height = (510 + t * (760 - 510)) * k;
  const headH = 132 + t * 10;
  const headW = 118 + t * 4;
  const legs = height * (0.36 + t * 0.07);
  return {
    height,
    headW,
    headH,
    neck: 14 + t * 14,
    neckW: 30 + t * 6,
    torso: height * (0.29 + t * 0.005),
    shoulderW: 92 + t * 56,
    hipW: 78 + t * 30,
    upperArm: height * (0.15 + t * 0.02),
    foreArm: height * (0.13 + t * 0.015),
    hand: 30 + t * 12,
    limbW: 25 + t * 6,
    thigh: legs * 0.5,
    shin: legs * 0.46,
    legW: 32 + t * 8,
    foot: 46 + t * 22,
    child: 1 - t * 0.75,
  };
};

const adultBody = (height: number, female = false): Body => ({
  height,
  headW: female ? 112 : 118,
  headH: female ? 136 : 140,
  neck: 36,
  neckW: female ? 36 : 44,
  torso: height * 0.3,
  shoulderW: female ? 150 : 186,
  hipW: female ? 140 : 132,
  upperArm: height * 0.168,
  foreArm: height * 0.148,
  hand: 48,
  limbW: female ? 32 : 37,
  thigh: height * 0.245,
  shin: height * 0.235,
  legW: female ? 44 : 50,
  foot: 92,
  child: 0,
});

// Учитель по референсу: тёмно-синий костюм, белая рубашка, синий галстук,
// белая тюбетейка с узором, короткая аккуратная борода. На ковре — в носках.
export const TEACHER: Look = {
  key: "teacher",
  body: adultBody(900),
  skin: "#e0ab84",
  skinShade: "#c8906b",
  hair: "#231915",
  hairStyle: "short",
  top: "jacket",
  topColor: "#2b4a86",
  topShade: "#223c6f",
  topAccent: "#3f62a8", // галстук
  undershirt: "#f7f7f3",
  pants: "#263c6b",
  pantsShade: "#1f3159",
  socks: "#2d2f38",
  beard: "#2a1e19",
  kufi: "#fbfaf6",
  iris: "#3e281d",
  brow: "#231915",
  faceShape: 0.5,
  noseSize: 0.95,
  earSize: 1,
  browThick: 1.15,
};

export const YUSUF: Look = {
  key: "yusuf",
  body: kidBody(4),
  skin: "#efc09b",
  skinShade: "#dca27f",
  hair: "#4a3022",
  hairStyle: "fringe",
  top: "tshirt",
  topColor: "#f2c230",
  topShade: "#d9a71c",
  topAccent: "#e48a3c",
  pants: "#8a6a4f",
  pantsShade: "#735740",
  socks: "#f4efe6",
  iris: "#5a3a26",
  brow: "#4a3022",
  faceShape: -1,
  noseSize: 0.7,
  earSize: 1,
  browThick: 0.8,
};

export const AMIR: Look = {
  key: "amir",
  body: kidBody(8),
  skin: "#dba67e",
  skinShade: "#c48d66",
  hair: "#1f1a18",
  hairStyle: "wavy",
  top: "sweatshirt",
  topColor: "#8ec5e8",
  topShade: "#6fa9d0",
  topAccent: "#5b93bd",
  pants: "#3e5675",
  pantsShade: "#32475f",
  socks: "#5d6470",
  iris: "#3b261b",
  brow: "#1f1a18",
  faceShape: -0.2,
  noseSize: 0.85,
  earSize: 1,
  browThick: 1,
};

export const BILAL: Look = {
  key: "bilal",
  body: kidBody(11),
  skin: "#c98f68",
  skinShade: "#b07854",
  hair: "#1c1715",
  hairStyle: "sidepart",
  top: "shirt",
  topColor: "#5f9e6e",
  topShade: "#4b8459",
  topAccent: "#e9efe6",
  pants: "#5f636d",
  pantsShade: "#4d5059",
  socks: "#2f3440",
  iris: "#36241a",
  brow: "#1c1715",
  faceShape: 0.5,
  noseSize: 1,
  earSize: 1,
  browThick: 1.05,
};

export const MOTHER: Look = {
  key: "mother",
  body: adultBody(830, true),
  skin: "#dfae88",
  skinShade: "#c99472",
  hair: "#2a1d18",
  hairStyle: "covered",
  top: "dress",
  topColor: "#9c6b8e",
  topShade: "#845a78",
  scarf: "#e6d6c3",
  pants: "#7d5670",
  pantsShade: "#6a485f",
  socks: "#3a3a3f",
  iris: "#4a2f22",
  brow: "#2a1d18",
  faceShape: 0.2,
  noseSize: 0.85,
  earSize: 0.9,
  browThick: 0.85,
};

export const FATHER: Look = {
  key: "father",
  body: adultBody(905),
  skin: "#cf9a72",
  skinShade: "#b7825d",
  hair: "#211915",
  hairStyle: "short",
  top: "longsleeve",
  topColor: "#8a7f72",
  topShade: "#746a5f",
  pants: "#3d434f",
  pantsShade: "#323743",
  socks: "#2d2f36",
  beard: "#2a1f1a",
  iris: "#3b261b",
  brow: "#211915",
  faceShape: 0.7,
  noseSize: 1.05,
  earSize: 1,
  browThick: 1.15,
};

// ---------- 22 фоновых ученика ----------
// Разные возраст (4–12), рост, причёски, лица и повседневная одежда.
// Цвета одежды приглушённые: жёлтый, голубой и зелёный оставлены главным героям.
const KID_TOPS: Top[] = ["tshirt", "sweatshirt", "shirt", "longsleeve", "hoodie"];
const KID_COLORS: [string, string][] = [
  ["#b9665a", "#9e5348"],
  ["#7c6ca8", "#665890"],
  ["#9aa0a8", "#81878f"],
  ["#d38b55", "#b87543"],
  ["#4f6d91", "#405a79"],
  ["#a65e7c", "#8c4d68"],
  ["#c9b89c", "#b0a084"],
  ["#8b5f40", "#744e34"],
  ["#e7e2d9", "#cfc8bc"],
  ["#5c5c70", "#4b4b5d"],
  ["#c97a70", "#ad665d"],
  ["#6f5a82", "#5c4a6c"],
  ["#d8a46d", "#bd8c59"],
  ["#3f4f63", "#334152"],
];
const SKINS: [string, string][] = [
  ["#f0c5a0", "#ddab86"],
  ["#e3b18b", "#cf9a73"],
  ["#d5a07a", "#bf8763"],
  ["#c58d66", "#ad7652"],
  ["#b67d58", "#9c6646"],
  ["#ecc09a", "#d8a581"],
];
const HAIRS = ["#1d1816", "#2b1f19", "#3d2a1f", "#4c3424", "#181412", "#5a3e2a"];
const STYLES: HairStyle[] = ["short", "buzz", "curly", "spiky", "wavy", "sidepart", "fringe"];
const PANTS: [string, string][] = [
  ["#3e4a5e", "#323c4d"],
  ["#5b5148", "#4a423a"],
  ["#2f3038", "#25262c"],
  ["#6b6f78", "#585b63"],
  ["#4a5a72", "#3c4a5e"],
];

export type ExtraKid = { look: Look; age: number };

// Возраст фоновых учеников: вместе с героями (4, 8, 11) — все 4–12 лет.
const EXTRA_AGES = [5, 6, 4, 7, 9, 10, 12, 6, 8, 11, 5, 9, 12, 7, 10, 6, 8, 11, 4, 9, 7, 10];

export const EXTRA_KIDS: ExtraKid[] = EXTRA_AGES.map((age, i) => {
  const r = (n: number) => hash01(1000 + i * 37 + n);
  const [topColor, topShade] = KID_COLORS[(i * 5 + 3) % KID_COLORS.length];
  const [skin, skinShade] = SKINS[Math.floor(r(1) * SKINS.length)];
  const [pants, pantsShade] = PANTS[(i * 3 + 1) % PANTS.length];
  const style = STYLES[(i * 3 + Math.floor(r(2) * 3)) % STYLES.length];
  const hair = HAIRS[Math.floor(r(3) * HAIRS.length)];
  const body = kidBody(age, 0.95 + r(4) * 0.1);
  body.headW *= 0.96 + r(5) * 0.08;
  body.headH *= 0.96 + r(6) * 0.08;
  return {
    age,
    look: {
      key: `kid${i + 1}`,
      body,
      skin,
      skinShade,
      hair,
      hairStyle: style,
      top: KID_TOPS[(i * 7 + Math.floor(r(7) * 2)) % KID_TOPS.length],
      topColor,
      topShade,
      topAccent: r(8) > 0.55 ? KID_COLORS[(i * 11) % KID_COLORS.length][1] : undefined,
      pants,
      pantsShade,
      socks: ["#f1ece4", "#4a4f5a", "#8a8f99", "#2f2f35"][i % 4],
      iris: ["#3b261b", "#4a2f22", "#2c1d15", "#5a3a26"][i % 4],
      brow: hair,
      faceShape: -1 + r(9) * 2,
      noseSize: 0.75 + r(10) * 0.35,
      earSize: 0.9 + r(11) * 0.2,
      browThick: 0.8 + r(12) * 0.4,
    },
  };
});
