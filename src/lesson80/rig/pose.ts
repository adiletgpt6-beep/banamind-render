// Поза персонажа в кадре: все управляемые части по отдельности.
// Координаты позы — единицы рисунка (см. looks.ts): ступни в y = 0,
// x вправо, y вниз. Сцена задаёт цели кистей в координатах мира, Actor
// переводит их в единицы рисунка.
import type { Viseme } from "../core/context";
import type { Vec } from "./motion";

// "grip" — пальцы обхватывают край (поднос, тарелка сбоку/снизу), "palmUp" —
// раскрытая ладонь вверх (поддерживает тарелку или поднос снизу). Обе формы
// рисуются полноценно в стиле рук rigStyle 2 (looks.ts); в старом стиле —
// как "fist" и "open".
export type HandShape = "relax" | "open" | "fist" | "point" | "pinch" | "grip" | "palmUp";
// Предметы в руке: лист бумаги (поделка) и книга.
export type ItemKind = "none" | "paper" | "book";

export type ArmState = {
  // Цель запястья (единицы рисунка). null — рука свободно опущена.
  readonly target: Vec | null;
  // Куда смотрит локоть: "out" — наружу (по умолчанию), "down" — вниз
  // (рука перед собой, на плече соседа), "in" — к телу, "hang" — плечо
  // опущено вдоль тела, предплечье идёт к цели «к зрителю» (держит лямку
  // или телефон у груди).
  readonly elbow?: "out" | "down" | "in" | "hang";
  readonly shape?: HandShape;
  // Доп. поворот кисти, градусы.
  readonly wrist?: number;
  readonly item?: ItemKind;
  // Цвет предмета, если отличается от обычного.
  readonly itemColor?: string;
  // Состояние бумажной поделки 0…1 (сколько сгибов сделано).
  readonly flat?: number;
  // Наклон предмета в руке (градусы).
  readonly itemTilt?: number;
  // Рука за корпусом (true) или перед ним (false). По умолчанию — по повороту.
  readonly behind?: boolean;
  // К чему относится target: "wrist" — запястье (по умолчанию), "grip" —
  // точка захвата в кисти (где предмет: щепоть, обхват, середина ладони).
  // С "grip" кисть подводится так, что предмет оказывается ровно в цели
  // (например, долька яблока у рта по actorAnchors().mouth).
  readonly aim?: "wrist" | "grip";
  // Проекция предплечья 0,3…1 (по умолчанию 1): предплечье направлено к
  // зрителю — кисти перед животом при опущенных к бокам локтях (несёт
  // поднос или коробку).
  readonly fore?: number;
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
};

export const EXPR = {
  neutral: { browIn: 0, browOut: 0, lid: 0.08, smile: 0.1 },
  smile: { browIn: 2, browOut: 3, lid: 0.15, smile: 0.8 },
  softSmile: { browIn: 2, browOut: 1, lid: 0.12, smile: 0.45 },
  worried: { browIn: 8, browOut: -3, lid: 0.05, smile: -0.25 },
  thinking: { browIn: -1, browOut: 2.5, lid: 0.2, smile: -0.02 },
  curious: { browIn: 4, browOut: 4, lid: 0.02, smile: 0.2 },
  listening: { browIn: 1, browOut: 2, lid: 0.1, smile: 0.18 },
  focused: { browIn: -0.5, browOut: 1.5, lid: 0.16, smile: 0.08 },
  tired: { browIn: 3, browOut: -2, lid: 0.42, smile: -0.15 },
  sad: { browIn: 7, browOut: -4, lid: 0.25, smile: -0.45 },
  calm: { browIn: 1, browOut: 1, lid: 0.12, smile: 0.25 },
  surprised: { browIn: 7, browOut: 6, lid: 0, smile: 0 },
  apologetic: { browIn: 6, browOut: -1, lid: 0.12, smile: 0.1 },
} as const satisfies Record<string, Expression>;

export type ExprId = keyof typeof EXPR;

export const mixExpr = (a: Expression, b: Expression, t: number): Expression => ({
  browIn: a.browIn + (b.browIn - a.browIn) * t,
  browOut: a.browOut + (b.browOut - a.browOut) * t,
  lid: a.lid + (b.lid - a.lid) * t,
  smile: a.smile + (b.smile - a.smile) * t,
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
  readonly sit: number; // 0 — стоит, 1 — сидит (на стуле/подушке)
  readonly seat: number; // высота сиденья (единицы, от пола)
  readonly floorSit: number; // 0…1 — сидит на полу, скрестив ноги
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
  readonly exhale: number; // 0…1 выдох (плечи опускаются)
  // Стопы (единицы рисунка, от точки персонажа): из расчёта походки.
  readonly feet?: readonly [FootLocal, FootLocal];
  // ---- необязательные расширения (80-1-9); без них рисунок прежний ----
  readonly chew?: number; // 0…1 жуёт: рот закрыт, челюсть ходит вверх-вниз
  readonly chewPhase?: number; // фаза жевания (циклы), от номера кадра
  readonly mouthFull?: number; // 0…1 щёки чуть полнее (еда во рту)
  readonly kneel?: number; // 0…1 опускается на одно колено (из стойки)
  readonly kneelSide?: -1 | 1; // какое колено на полу (сторона экрана)
};

export type FootLocal = { readonly x: number; readonly y: number; readonly roll: number };
