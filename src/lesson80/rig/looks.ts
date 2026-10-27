// Пропорции и внешность персонажей серии LESSON-80. Единицы рисунка: высота
// фигуры ≈ 1000 (ступни в y = 0, вверх — минус); рост в мире задаёт сцена.
// Возрастные пропорции: у 4-летнего голова ≈ 1/4.5 роста, у 8-летнего ≈ 1/6,
// у 11-летнего ≈ 1/6.6, у взрослого ≈ 1/7.3.

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
  readonly child: boolean; // детские черты лица (глаза крупнее, щёки)
};

export const ADULT: Build = {
  headY: -884,
  headRx: 60,
  headRy: 72,
  neckTop: -820,
  shoulderY: -778,
  shoulderHalf: 92,
  waistY: -575,
  waistHalf: 64,
  hipY: -520,
  hipHalf: 72,
  hipJointY: -478,
  hipJointX: 38,
  thigh: 240,
  shin: 222,
  upperArm: 160,
  forearm: 146,
  hand: 50,
  limb: 42,
  leg: 54,
  foot: 92,
  stride: 240,
  child: false,
};

// 11–12 лет: голова чуть крупнее взрослой относительно роста, плечи уже.
export const KID11: Build = {
  headY: -862,
  headRx: 66,
  headRy: 78,
  neckTop: -786,
  shoulderY: -750,
  shoulderHalf: 76,
  waistY: -562,
  waistHalf: 56,
  hipY: -512,
  hipHalf: 64,
  hipJointY: -468,
  hipJointX: 33,
  thigh: 232,
  shin: 218,
  upperArm: 154,
  forearm: 138,
  hand: 46,
  limb: 36,
  leg: 46,
  foot: 84,
  stride: 220,
  child: true,
};

// 7–9 лет: голова крупнее, конечности короче.
export const KID8: Build = {
  headY: -836,
  headRx: 76,
  headRy: 86,
  neckTop: -748,
  shoulderY: -714,
  shoulderHalf: 72,
  waistY: -545,
  waistHalf: 58,
  hipY: -500,
  hipHalf: 64,
  hipJointY: -448,
  hipJointX: 31,
  thigh: 220,
  shin: 210,
  upperArm: 146,
  forearm: 128,
  hand: 44,
  limb: 36,
  leg: 46,
  foot: 78,
  stride: 180,
  child: true,
};

// 4–5 лет: крупная круглая голова, короткая шея, короткие руки и ноги,
// мягкие пропорции — не уменьшенный восьмилетний.
export const KID4: Build = {
  headY: -806,
  headRx: 94,
  headRy: 100,
  neckTop: -700,
  shoulderY: -672,
  shoulderHalf: 70,
  waistY: -520,
  waistHalf: 60,
  hipY: -476,
  hipHalf: 66,
  hipJointY: -430,
  hipJointX: 30,
  thigh: 212,
  shin: 200,
  upperArm: 132,
  forearm: 116,
  hand: 42,
  limb: 38,
  leg: 48,
  foot: 70,
  stride: 150,
  child: true,
};

// Пропорции по возрасту (4…12): плавная смесь трёх детских опорных построений.
export const buildForAge = (age: number): Build => {
  const mix = (a: Build, b: Build, t: number): Build => {
    const o: Record<string, number | boolean> = {};
    for (const k of Object.keys(a) as (keyof Build)[]) {
      const va = a[k];
      const vb = b[k];
      o[k] = typeof va === "number" && typeof vb === "number" ? va + (vb - va) * t : va;
    }
    return o as unknown as Build;
  };
  if (age <= 4) return KID4;
  if (age <= 8) return mix(KID4, KID8, (age - 4) / 4);
  if (age <= 11) return mix(KID8, KID11, (age - 8) / 3);
  return mix(KID11, ADULT, Math.min(1, (age - 11) / 6) * 0.35);
};

export type HairStyle = "boyShort" | "boyCrop" | "boyCurly" | "boySide" | "manShort";
export type Top = "suit" | "shirt" | "tee" | "sweater" | "hoodie" | "vest" | "jacket";

export type Look = {
  readonly build: Build;
  readonly skin: string;
  readonly skinShade: string;
  readonly hair: string;
  readonly hairStyle: HairStyle;
  readonly top: Top;
  readonly topColor: string;
  readonly topShade: string;
  readonly inner: string; // рубашка под пиджаком/жилетом, воротник
  readonly bottom: string; // брюки
  readonly socks?: string; // в комнате без уличной обуви: носки
  readonly brow: string;
  readonly lips: string;
  readonly beard?: string; // цвет аккуратной бороды
  readonly cap?: "tubeteika"; // белая тюбетейка
  readonly stripe?: string; // полоска на футболке/кофте
};

// Чуть темнее цвета.
export const shadeOf = (hex: string, k = 0.86) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};
