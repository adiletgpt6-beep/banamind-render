// Поза сидящего персонажа. Координаты — единицы рисунка (looks.ts):
// место на ковре в y = 0, x вправо, y вниз.
import type { Viseme } from "../context";
import type { Vec } from "./motion";

export type HandShape = "relax" | "open" | "pinch" | "grip" | "point" | "press" | "rest";

export type ArmState = {
  readonly target: Vec | null; // цель запястья; null — рука лежит на коленях
  readonly elbow?: "out" | "down" | "in";
  readonly shape?: HandShape;
  readonly wrist?: number; // доп. поворот кисти, градусы
  readonly spread?: number; // 0…1 — пальцы раскрыты (open/press)
};
export const REST: ArmState = { target: null, shape: "rest" };

export type Expression = {
  readonly browIn: number;
  readonly browOut: number;
  readonly lid: number; // 0 — открыто, 1 — закрыто
  readonly smile: number; // −1 … 1
};

export const EXPR = {
  neutral: { browIn: 0, browOut: 0, lid: 0.08, smile: 0.12 },
  calm: { browIn: 1, browOut: 1, lid: 0.12, smile: 0.28 },
  softSmile: { browIn: 2, browOut: 1, lid: 0.12, smile: 0.5 },
  smile: { browIn: 2, browOut: 3, lid: 0.16, smile: 0.85 },
  joy: { browIn: 3, browOut: 4, lid: 0.22, smile: 1 },
  curious: { browIn: 4, browOut: 5, lid: 0, smile: 0.2 },
  thinking: { browIn: -2, browOut: 2, lid: 0.18, smile: -0.02 },
  focused: { browIn: -3, browOut: 0, lid: 0.22, smile: 0.08 },
  surprised: { browIn: 6, browOut: 6, lid: 0, smile: 0.1 },
  listening: { browIn: 1, browOut: 2, lid: 0.1, smile: 0.2 },
} as const satisfies Record<string, Expression>;
export type ExprId = keyof typeof EXPR;

export const mixExpr = (a: Expression, b: Expression, t: number): Expression => ({
  browIn: a.browIn + (b.browIn - a.browIn) * t,
  browOut: a.browOut + (b.browOut - a.browOut) * t,
  lid: a.lid + (b.lid - a.lid) * t,
  smile: a.smile + (b.smile - a.smile) * t,
});

export type Pose = {
  readonly bodyTurn: number; // −1 … 1
  readonly headTurn: number;
  readonly lookX: number;
  readonly lookY: number;
  readonly headTilt: number; // градусы
  readonly nod: number; // градусы (вниз)
  readonly lean: number; // наклон корпуса вперёд, градусы (плечи ниже и ближе)
  readonly armL: ArmState;
  readonly armR: ArmState;
  readonly expr: Expression;
  readonly mouth: Viseme;
  readonly blink: number;
  readonly breath: number; // −1 … 1
  readonly shoulders: number; // 0…1 плечи приподняты
  readonly sway: number; // смещение корпуса по x (единицы)
};
