// Поза персонажа в кадре: все управляемые части по отдельности.
// Координаты позы — единицы рисунка (см. looks.ts): ступни в y = 0,
// x вправо, y вниз. Сцена задаёт цели кистей в координатах мира, Actor
// переводит их в единицы рисунка.
//
// Для танца поза управляет и скелетом напрямую: смещение и наклон таза
// (перенос веса на опорную ногу), наклон корпуса, стопы в заданных точках
// пола, руки через углы в плече и локте (FK).
import type { Viseme } from "../context";
import type { Vec } from "./motion";

export type HandShape = "relax" | "open" | "fist" | "phone" | "point" | "wave" | "pinch" | "soft";
export type ItemKind =
  | "none"
  | "phone"
  | "phoneSide"
  | "keys"
  | "handbag"
  | "workbag"
  | "notebook"
  | "cup"
  | "bottle"
  | "towel"
  | "card";

// Углы руки (FK, градусы): sh — плечо от вертикали вниз «наружу» своей
// стороны (0 — рука опущена, 90 — в сторону, 180 — вверх, отрицательные —
// поперёк тела); el — сгиб в локте относительно плеча (тот же смысл);
// wr — доворот кисти.
export type ArmFk = { readonly sh: number; readonly el: number; readonly wr?: number };

export type ArmState = {
  // Цель запястья (единицы рисунка). null — рука свободно опущена.
  readonly target: Vec | null;
  // Углы плеча и локтя (танец). Если заданы — target не используется.
  readonly fk?: ArmFk;
  // Куда смотрит локоть: "out" — наружу (по умолчанию), "down" — вниз
  // (рука перед собой), "in" — к телу, "hang" — плечо опущено вдоль тела,
  // предплечье идёт к цели «к зрителю» (держит телефон у груди).
  readonly elbow?: "out" | "down" | "in" | "hang";
  readonly shape?: HandShape;
  // Доп. поворот кисти, градусы.
  readonly wrist?: number;
  readonly item?: ItemKind;
  // Цвет предмета (бутылка, полотенце), если отличается от обычного.
  readonly itemColor?: string;
  // Телефон: 0 — в руке экраном к лицу/камере, 1 — лежит плашмя.
  readonly flat?: number;
  // Наклон предмета в руке (градусы; телефон держат почти вертикально).
  readonly itemTilt?: number;
  // Рука за корпусом (true) или перед ним (false). По умолчанию — по повороту.
  readonly behind?: boolean;
  // Экран телефона светится (0…1) и вибрация (смещение в единицах).
  readonly glow?: number;
  readonly shake?: number;
};

export const REST: ArmState = { target: null, shape: "relax" };

export type Expression = {
  // Брови: подъём внутреннего и внешнего края (единицы, + вверх).
  readonly browIn: number;
  readonly browOut: number;
  // Верхнее веко: 0 — открыто, 1 — закрыто (усталость, расслабленность).
  readonly lid: number;
  // Уголки губ: −1 грусть … 1 улыбка.
  readonly smile: number;
  // Смех: рот приоткрыт в улыбке, глаза прищурены (0…1).
  readonly laugh?: number;
};

export const EXPR = {
  neutral: { browIn: 0, browOut: 0, lid: 0.08, smile: 0.1 },
  smile: { browIn: 2, browOut: 3, lid: 0.15, smile: 0.8 },
  softSmile: { browIn: 2, browOut: 1, lid: 0.12, smile: 0.45 },
  focused: { browIn: -2, browOut: 1, lid: 0.16, smile: 0.12 },
  thinking: { browIn: -3, browOut: 2, lid: 0.18, smile: -0.05 },
  calm: { browIn: 1, browOut: 1, lid: 0.12, smile: 0.25 },
  surprised: { browIn: 7, browOut: 6, lid: 0, smile: 0.05 },
  amazed: { browIn: 6, browOut: 7, lid: 0, smile: 0.35 },
  curious: { browIn: 5, browOut: 3, lid: 0.04, smile: 0.2 },
  dreamy: { browIn: 3, browOut: 0, lid: 0.3, smile: 0.5 },
  oops: { browIn: 7, browOut: -1, lid: 0.05, smile: 0.15 },
  laugh: { browIn: 3, browOut: 3, lid: 0.45, smile: 0.95, laugh: 1 },
  grateful: { browIn: 4, browOut: 1, lid: 0.2, smile: 0.7 },
  proud: { browIn: 2, browOut: 2, lid: 0.18, smile: 0.75 },
} as const satisfies Record<string, Expression>;

export type ExprId = keyof typeof EXPR;

export const mixExpr = (a: Expression, b: Expression, t: number): Expression => ({
  browIn: a.browIn + (b.browIn - a.browIn) * t,
  browOut: a.browOut + (b.browOut - a.browOut) * t,
  lid: a.lid + (b.lid - a.lid) * t,
  smile: a.smile + (b.smile - a.smile) * t,
  laugh: (a.laugh ?? 0) + ((b.laugh ?? 0) - (a.laugh ?? 0)) * t,
});

// Полностью рассчитанная поза для рисования.
export type Pose = {
  readonly bodyTurn: number; // −1 … 1: повернут влево/вправо (0 — к камере)
  readonly headTurn: number; // −1 … 1 (абсолютный)
  readonly lookX: number; // взгляд относительно головы −1 … 1
  readonly lookY: number; // −1 вверх … 1 вниз
  readonly headTilt: number; // градусы
  readonly nod: number; // наклон головы вниз (градусы)
  readonly lean: number; // наклон корпуса вперёд (градусы)
  readonly sit: number; // 0 — стоит, 1 — сидит
  readonly seat: number; // высота сиденья (единицы, от пола)
  readonly crouch: number; // 0…1 — присесть (колени согнуты)
  readonly walkPhase: number; // фаза шага (циклы)
  readonly walkAmt: number; // 0…1 размах шага
  readonly walkDir: number; // −1 влево, 1 вправо, 0 — к камере/от неё
  readonly armL: ArmState; // рука слева на экране (при взгляде в камеру)
  readonly armR: ArmState;
  readonly expr: Expression;
  readonly mouth: Viseme;
  readonly blink: number;
  readonly shoulders: number; // 0…1 плечи приподняты
  readonly breath: number; // −1…1
  readonly hairSway: number; // градусы
  readonly bagOnShoulder: number; // 0…1 сумка висит на плече (мама)
  readonly exhale: number; // 0…1 выдох (плечи опускаются)
  // Танец: смещение таза по x (единицы) — вес над опорной ногой; наклон
  // таза и корпуса (градусы, по часовой стрелке); качание подола (единицы).
  readonly hipShift: number;
  readonly hipTilt: number;
  readonly torsoTilt: number;
  readonly hemSway: number;
  // Стопы (единицы рисунка, от точки персонажа): из расчёта походки или
  // заданы танцем.
  readonly feet?: readonly [FootLocal, FootLocal];
  // Ремень безопасности (сидит в машине).
  readonly belt?: number;
  // Вид со спины (персонаж смотрит от зрителя, лицо видно только в зеркале).
  readonly back?: boolean;
};

export type FootLocal = { readonly x: number; readonly y: number; readonly roll: number };
