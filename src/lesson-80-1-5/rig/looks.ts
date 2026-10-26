// Пропорции и внешность сидящих персонажей. Единицы рисунка: рост
// стоящего персонажа = 1000 (как в 2D-риге проекта); точка персонажа —
// место на ковре (y = 0), вверх — минус. Фигура сидит по-турецки.
import { L815_PUPILS, mainPupil, type HairStyle, type Pupil, type TopKind } from "../script";

export type Build = {
  readonly headY: number; // центр головы
  readonly headRx: number;
  readonly headRy: number;
  readonly neckTop: number;
  readonly shoulderY: number;
  readonly shoulderHalf: number;
  readonly waistY: number;
  readonly waistHalf: number;
  readonly hipY: number; // пояс
  readonly hipHalf: number;
  readonly thigh: number; // в посадке — вынос колена в сторону
  readonly shin: number;
  readonly upperArm: number;
  readonly forearm: number;
  readonly hand: number;
  readonly limb: number;
  readonly leg: number;
};

// Взрослый (учитель): сидя — плечи ≈ 400 единиц над ковром.
export const ADULT: Build = {
  headY: -492,
  headRx: 60,
  headRy: 72,
  neckTop: -428,
  shoulderY: -392,
  shoulderHalf: 92,
  waistY: -210,
  waistHalf: 70,
  hipY: -70,
  hipHalf: 84,
  thigh: 200,
  shin: 190,
  upperArm: 190,
  forearm: 172,
  hand: 54,
  limb: 42,
  leg: 56,
};
// 11–12 лет: вытянутые пропорции, голова меньше детской.
export const TEEN: Build = {
  headY: -452,
  headRx: 64,
  headRy: 75,
  neckTop: -386,
  shoulderY: -352,
  shoulderHalf: 76,
  waistY: -186,
  waistHalf: 60,
  hipY: -62,
  hipHalf: 72,
  thigh: 180,
  shin: 172,
  upperArm: 186,
  forearm: 170,
  hand: 48,
  limb: 36,
  leg: 48,
};
// 7–9 лет: голова крупнее, руки короче.
export const CHILD: Build = {
  headY: -420,
  headRx: 72,
  headRy: 82,
  neckTop: -344,
  shoulderY: -316,
  shoulderHalf: 72,
  waistY: -168,
  waistHalf: 58,
  hipY: -56,
  hipHalf: 68,
  thigh: 160,
  shin: 150,
  upperArm: 180,
  forearm: 164,
  hand: 46,
  limb: 36,
  leg: 46,
};
// 4–5 лет: самый маленький, детские пропорции, короткие руки.
export const SMALL: Build = {
  headY: -372,
  headRx: 80,
  headRy: 88,
  neckTop: -294,
  shoulderY: -268,
  shoulderHalf: 64,
  waistY: -146,
  waistHalf: 54,
  hipY: -50,
  hipHalf: 62,
  thigh: 140,
  shin: 130,
  upperArm: 160,
  forearm: 146,
  hand: 42,
  limb: 34,
  leg: 44,
};

export type Look = {
  readonly id: string;
  readonly build: Build;
  readonly child: boolean;
  readonly skin: string;
  readonly skinShade: string;
  readonly hair: string;
  readonly hairStyle: HairStyle | "teacher";
  readonly top: TopKind | "suit";
  readonly topColor: string;
  readonly topShade: string;
  readonly inner: string;
  readonly bottom: string;
  readonly socks: string;
  readonly brow: string;
  readonly lips: string;
  readonly beard?: string;
  readonly cap?: string;
  // рост стоя (px мира) — задаёт масштаб
  readonly height: number;
};

const skinShade = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number, k: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `#${((1 << 24) | (f((n >> 16) & 255, 0.86) << 16) | (f((n >> 8) & 255, 0.78) << 8) | f(n & 255, 0.72)).toString(16).slice(1)}`;
};
const topShade = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * 0.8)));
  return `#${((1 << 24) | (f((n >> 16) & 255) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1)}`;
};

// Рост стоя по возрасту (px мира на линии столика).
export const heightOfAge = (age: number) => 400 + (age - 4) * 26;
const buildOfAge = (age: number): Build => (age <= 5 ? SMALL : age <= 9 ? CHILD : TEEN);

const SOCKS = ["#F2EFE8", "#D9DEE8", "#E8E2D0", "#CFD8D0", "#E9D9D9"];

export const lookOfPupil = (p: Pupil): Look => ({
  id: p.id,
  build: buildOfAge(p.age),
  child: true,
  skin: p.skin,
  skinShade: skinShade(p.skin),
  hair: p.hair,
  hairStyle: p.hairStyle,
  top: p.top,
  topColor: p.topColor,
  topShade: topShade(p.topColor),
  inner: "#FFFFFF",
  bottom: p.bottom,
  socks: SOCKS[p.seed % SOCKS.length],
  brow: p.hair,
  lips: "#B86A62",
  height: heightOfAge(p.age),
});

// Мухаммад: 30–35 лет, синий костюм, белая рубашка, тюбетейка, борода.
export const TEACHER: Look = {
  id: "teacher",
  build: ADULT,
  child: false,
  skin: "#E2B08A",
  skinShade: skinShade("#E2B08A"),
  hair: "#2A1F1B",
  hairStyle: "teacher",
  top: "suit",
  topColor: "#2E4A7F",
  topShade: topShade("#2E4A7F"),
  inner: "#FFFFFF",
  bottom: "#2A4274",
  socks: "#2F3341",
  brow: "#2A1F1B",
  lips: "#A9675E",
  beard: "#2A1F1B",
  cap: "#1E2A4A",
  height: 700,
};

export const LOOKS: Record<string, Look> = Object.fromEntries([...L815_PUPILS.map((p) => [p.id, lookOfPupil(p)]), ["teacher", TEACHER]]);
export const lookOf = (id: string): Look => {
  const l = LOOKS[id];
  if (!l) throw new Error(`Нет персонажа ${id}`);
  return l;
};
export const MAIN = { yusuf: mainPupil("yusuf").id, amir: mainPupil("amir").id, bilal: mainPupil("bilal").id } as const;
