// Персонаж BG-016 на общем 2D-риге проекта (Figure/looks из
// src/two-schedules-2d/rig — только чтение). Персонажи в этом ролике не
// ходят: стоят за столом или рядом, поэтому стопы неподвижны.
// Поворот цепочкой: глаза сразу, голова ≈ 2 кадра, корпус ≈ 6 кадров;
// моргание по расписанию и на резком повороте головы; дыхание.
import { useTimeline, lipsOf, CLOSED } from "./context";
import { Figure } from "../../two-schedules-2d/rig/Figure";
import { LOOKS, type Look } from "../../two-schedules-2d/rig/looks";
import { blinkAt, clamp, soften, type Vec } from "../../two-schedules-2d/rig/motion";
import { EXPR, REST, type ArmState, type ExprId, type Expression, type Pose } from "../../two-schedules-2d/rig/pose";
import type { Bg016Role } from "./script";

export type Place = { readonly x: number; readonly y: number; readonly h: number };
export type WorldArm = Omit<ArmState, "target"> & { readonly target: Vec | null };

export type PoseIn = {
  readonly armL?: WorldArm;
  readonly armR?: WorldArm;
  readonly expr?: ExprId | Expression;
  readonly lookX?: number;
  readonly lookY?: number;
  readonly headTilt?: number;
  readonly nod?: number;
  readonly lean?: number;
  readonly crouch?: number;
  readonly shoulders?: number;
  readonly exhale?: number;
  readonly strapTug?: number;
  readonly turnBody?: number;
};

// Внешность семьи BG-016: мама с пучком в тёплом свитере, папа, сын-школьник.
export const BG016_LOOKS = {
  mom: {
    ...LOOKS.mom,
    hairStyle: "bun",
    top: "sweater",
    topColor: "#E9A15B",
    topShade: "#D2884A",
    inner: "#FFF6E8",
    bottom: "#33405F",
  },
  dad: LOOKS.dad,
  son: LOOKS.son,
} as const satisfies Record<string, Look>;

export type Bg016LookId = keyof typeof BG016_LOOKS;

type Props = {
  readonly uid: string;
  readonly look: Bg016LookId;
  readonly f: number; // кадр сцены
  readonly abs: number; // кадр ролика (для губ)
  readonly place: Place;
  readonly face?: (t: number) => number; // −1…1 куда смотрит
  readonly pose?: (t: number) => PoseIn;
  readonly role?: Bg016Role;
  readonly seed?: number;
  readonly opacity?: number;
};

export const Actor: React.FC<Props> = (p) => {
  const tl = useTimeline();
  const look = BG016_LOOKS[p.look];
  const b = look.build;
  const P = p.place;
  const k = P.h / 1000;
  const faceFn = p.face ?? (() => 0);
  const pin: PoseIn = p.pose ? p.pose(p.f) : {};

  const headAt = (t: number) => soften(faceFn, t - 2, 2);
  const headTurn = clamp(headAt(p.f), -0.9, 0.9);
  const bodyTurn = clamp(soften(faceFn, p.f - 6, 4) * (pin.turnBody ?? 0.6), -0.85, 0.85);
  const lookX = clamp((faceFn(p.f) - headTurn) * 2.4 + (pin.lookX ?? 0), -1, 1);

  const extra: number[] = [];
  for (let t = p.f - 6; t <= p.f; t++) {
    const s0 = Math.abs(headAt(t - 1) - headAt(t - 5));
    const s1 = Math.abs(headAt(t) - headAt(t - 4));
    if (s1 > 0.3 && s0 <= 0.3) extra.push(t);
  }
  const blink = blinkAt(p.f, p.seed ?? 1, extra);
  const turnLag = headAt(p.f - 2) - headAt(p.f - 6);

  const toLocal = (arm?: WorldArm): ArmState => {
    if (!arm) return REST;
    return { ...arm, target: arm.target ? { x: (arm.target.x - P.x) / k, y: (arm.target.y - P.y) / k } : null };
  };
  const expr: Expression = typeof pin.expr === "string" ? EXPR[pin.expr] : pin.expr ?? EXPR.neutral;
  const stand = (side: -1 | 1) => ({ x: side * (b.hipJointX + 8) * 0.85, y: 0, roll: 0 });
  const pose: Pose = {
    bodyTurn,
    headTurn,
    lookX,
    lookY: pin.lookY ?? 0,
    headTilt: pin.headTilt ?? 0,
    nod: pin.nod ?? 0,
    lean: pin.lean ?? 0,
    sit: 0,
    seat: 0,
    crouch: pin.crouch ?? 0,
    walkPhase: 0,
    walkAmt: 0,
    walkDir: 0,
    armL: toLocal(pin.armL),
    armR: toLocal(pin.armR),
    expr,
    mouth: p.role ? lipsOf(tl, p.role, p.abs) : CLOSED,
    blink,
    shoulders: pin.shoulders ?? 0,
    breath: Math.sin((p.f + (p.seed ?? 1) * 17) / 26),
    hairSway: clamp(-turnLag * 24, -10, 10),
    packSway: 0,
    bagOnShoulder: 0,
    strapTug: pin.strapTug ?? 0,
    exhale: pin.exhale ?? 0,
    feet: [stand(-1), stand(1)],
  };
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: p.opacity ?? 1 }}>
      <g transform={`translate(${P.x} ${P.y}) scale(${k})`}>
        <Figure uid={p.uid} look={look} pose={pose} />
      </g>
    </svg>
  );
};

// Мировая точка по смещению от точки персонажа (единицы рисунка).
export const atBody = (p: Place, dx: number, dy: number): Vec => ({ x: p.x + (dx * p.h) / 1000, y: p.y + (dy * p.h) / 1000 });
