// Персонаж в мире сцены. Сцена задаёт функции от кадра:
//   place(t) — точка между ступнями (мировые px) и рост h;
//   face(t)  — куда персонаж хочет смотреть (−1…1);
//   pose(t)  — руки (цели кистей в мировых px), мимика, посадка и т. д.
// Отсюда считаются:
//   • шаг по фактически пройденному пути (стопы не скользят), направление
//     и размах шага плавно меняются при старте и остановке;
//   • поворот цепочкой: глаза сразу, голова с задержкой ≈ 2 кадра, корпус
//     ≈ 6 кадров; на быстром повороте головы — моргание;
//   • запаздывание волос, кос и рюкзака по скорости движения.
// Всё детерминированно по номеру кадра.
import { useContext } from "react";
import { CLOSED, CuesContext, lipAt, SceneContext } from "../context";
import type { Nb2Role } from "../script";
import { Figure } from "./Figure";
import { LOOKS, type LookId } from "./looks";
import { blinkAt, clamp, soften, type Vec } from "./motion";
import { walkAt } from "./walk";
import { EXPR, REST, type ArmState, type ExprId, type Expression, type Pose } from "./pose";

// Ремень в мировых координатах (см. BeltLocal), ширина — мировые px.
export type WorldBelt = { readonly anchor: Vec; readonly shoulder?: Vec; readonly tongue: Vec; readonly lap?: Vec; readonly buckle?: Vec; readonly width: number };

export type Place = { readonly x: number; readonly y: number; readonly h: number };

export type WorldArm = Omit<ArmState, "target"> & { readonly target: Vec | null };

export type PoseIn = {
  readonly armL?: WorldArm;
  readonly armR?: WorldArm;
  readonly expr?: ExprId | Expression;
  readonly lookX?: number; // добавка к взгляду
  readonly lookY?: number;
  readonly headTilt?: number;
  readonly nod?: number;
  readonly lean?: number;
  readonly sit?: number;
  readonly seat?: number; // высота сиденья, мировые px от пола
  readonly crouch?: number;
  readonly shoulders?: number;
  readonly exhale?: number;
  readonly bagOnShoulder?: number;
  readonly strapTug?: number;
  readonly turnBody?: number; // доля поворота корпуса (по умолчанию 0,8)
  readonly packOff?: boolean;
  readonly belt?: WorldBelt;
  readonly armOnly?: "L" | "R";
  readonly hideArm?: "L" | "R";
};

type ActorProps = {
  readonly uid: string;
  readonly look: LookId;
  readonly f: number; // кадр сцены
  readonly speechFrame?: number; // реальное время сцены при изменении шкалы движения
  readonly place: (t: number) => Place;
  readonly face?: (t: number) => number;
  readonly pose?: (t: number) => PoseIn;
  readonly role?: Nb2Role; // губы по речи этой роли
  readonly walkFrom?: number; // с какого кадра считать шаги
  readonly seed?: number;
  readonly blinks?: readonly number[];
  readonly opacity?: number;
};

export const Actor: React.FC<ActorProps> = (props) => {
  const cues = useContext(CuesContext);
  const sceneFrom = useContext(SceneContext);
  const { look: lookId, f, place, uid } = props;
  const look = LOOKS[lookId];
  const b = look.build;
  const P = place(f);
  const k = P.h / 1000;
  const faceFn = props.face ?? (() => 0);
  const poseFn: (t: number) => PoseIn = props.pose ?? (() => ({}));

  const from = props.walkFrom ?? 0;
  const { phase, walkAmt, walkDir, feet, faceEff } = walkAt(place, from, f, b, faceFn);
  const pin = poseFn(f);
  const turnBody = pin.turnBody ?? 0.8;
  const headAt = (t: number) => soften(faceEff, t - 2, 2);
  const headTurn = clamp(headAt(f), -0.9, 0.9);
  const bodyTurn = clamp(soften(faceEff, f - 6, 4) * turnBody, -0.85, 0.85);
  const lookX = clamp((faceEff(f) - headTurn) * 2.4 + (pin.lookX ?? 0), -1, 1);

  // моргание: по расписанию + при резком повороте головы
  const extra: number[] = [...(props.blinks ?? [])];
  for (let t = f - 6; t <= f; t++) {
    const s0 = Math.abs(headAt(t - 1) - headAt(t - 5));
    const s1 = Math.abs(headAt(t) - headAt(t - 4));
    if (s1 > 0.3 && s0 <= 0.3) extra.push(t);
  }
  const blink = blinkAt(f, props.seed ?? 1, extra);

  // запаздывание волос и рюкзака
  const vLag = (place(f - 2).x - place(f - 6).x) / k;
  const turnLag = headAt(f - 2) - headAt(f - 6);
  const TAU = Math.PI * 2;
  const hairSway = clamp(-vLag * 0.2 - turnLag * 12, -8, 8) + walkAmt * 1.3 * Math.sin(2 * TAU * phase + 0.6);
  const packSway = clamp(-vLag * 0.12, -4, 4) + walkAmt * 0.8 * Math.sin(2 * TAU * phase + 0.9);

  const toLocal = (arm?: WorldArm): ArmState => {
    if (!arm) return REST;
    return { ...arm, target: arm.target ? { x: (arm.target.x - P.x) / k, y: (arm.target.y - P.y) / k } : null };
  };
  const loc = (v: Vec): Vec => ({ x: (v.x - P.x) / k, y: (v.y - P.y) / k });
  const belt = pin.belt
    ? {
        anchor: loc(pin.belt.anchor),
        shoulder: pin.belt.shoulder && loc(pin.belt.shoulder),
        tongue: loc(pin.belt.tongue),
        lap: pin.belt.lap && loc(pin.belt.lap),
        buckle: pin.belt.buckle && loc(pin.belt.buckle),
        width: pin.belt.width / k,
      }
    : undefined;
  const expr: Expression = typeof pin.expr === "string" ? EXPR[pin.expr] : pin.expr ?? EXPR.neutral;
  const mouth = props.role ? lipAt(cues, props.role, (props.speechFrame ?? f) + sceneFrom) : CLOSED;
  const pose: Pose = {
    bodyTurn,
    headTurn,
    lookX,
    lookY: pin.lookY ?? 0,
    headTilt: pin.headTilt ?? 0,
    nod: pin.nod ?? 0,
    // при ходьбе корпус чуть подаётся вперёд
    lean: (pin.lean ?? 0) + 3 * walkAmt,
    sit: pin.sit ?? 0,
    seat: (pin.seat ?? 0) / k,
    crouch: pin.crouch ?? 0,
    walkPhase: phase,
    walkAmt,
    walkDir,
    armL: toLocal(pin.armL),
    armR: toLocal(pin.armR),
    expr,
    mouth,
    blink,
    shoulders: pin.shoulders ?? 0,
    breath: Math.sin((f + (props.seed ?? 1) * 17) / 26),
    hairSway,
    packSway,
    bagOnShoulder: pin.bagOnShoulder ?? 0,
    strapTug: pin.strapTug ?? 0,
    exhale: pin.exhale ?? 0,
    feet,
    packOff: pin.packOff,
    belt,
    armOnly: pin.armOnly,
    hideArm: pin.hideArm,
  };
  return (
    <svg
      width={1}
      height={1}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: props.opacity ?? 1 }}
    >
      <g transform={`translate(${P.x} ${P.y}) scale(${k})`}>
        <Figure uid={uid} look={look} pose={pose} />
      </g>
    </svg>
  );
};

// Мировая точка кисти по смещению от точки персонажа (в единицах рисунка).
export const atBody = (p: Place, dx: number, dy: number): Vec => ({ x: p.x + (dx * p.h) / 1000, y: p.y + (dy * p.h) / 1000 });
