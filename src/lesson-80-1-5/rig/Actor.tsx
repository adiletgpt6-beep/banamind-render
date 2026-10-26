// Персонаж в мире сцены. Сцена задаёт: place — место на ковре (мировые
// px) и рост стоя h; face(t) — куда смотрит (−1…1); pose(t) — руки (цели
// кистей в мировых px), мимика, наклон. Поворот цепочкой: глаза сразу,
// голова с задержкой ≈ 2 кадра, корпус ≈ 6 кадров; на быстром повороте —
// моргание. Губы — по таймингам речи роли. Всё детерминированно по кадру.
import { useContext } from "react";
import { CLOSED, lipAt, SceneContext, TimelineContext } from "../context";
import type { L815Role } from "../script";
import { Figure, type FigureLayer } from "./Figure";
import { lookOf } from "./looks";
import { blinkAt, clamp, soften, type Vec } from "./motion";
import { EXPR, REST, type ArmState, type ExprId, type Expression, type Pose } from "./pose";

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
  readonly shoulders?: number;
  readonly sway?: number;
  readonly turnBody?: number; // доля поворота корпуса (по умолчанию 0,7)
};

type ActorProps = {
  readonly uid: string;
  readonly look: string; // id персонажа (p01 … p25, teacher)
  readonly f: number; // кадр сцены
  readonly place: Place;
  readonly face?: (t: number) => number;
  readonly pose?: (t: number) => PoseIn;
  readonly role?: L815Role | readonly L815Role[];
  readonly seed?: number;
  readonly blinks?: readonly number[];
  readonly layer?: FigureLayer;
  readonly opacity?: number;
};

export const Actor: React.FC<ActorProps> = (props) => {
  const tl = useContext(TimelineContext);
  const sceneFrom = useContext(SceneContext);
  const { f, place: P, uid } = props;
  const look = lookOf(props.look);
  const k = P.h / 1000;
  const faceFn = props.face ?? (() => 0);
  const poseFn: (t: number) => PoseIn = props.pose ?? (() => ({}));
  const pin = poseFn(f);
  const turnBody = pin.turnBody ?? 0.7;
  const headAt = (t: number) => soften(faceFn, t - 2, 2);
  const headTurn = clamp(headAt(f), -0.9, 0.9);
  const bodyTurn = clamp(soften(faceFn, f - 6, 4) * turnBody, -0.85, 0.85);
  const lookX = clamp((faceFn(f) - headTurn) * 2.4 + (pin.lookX ?? 0), -1, 1);
  const extra: number[] = [...(props.blinks ?? [])];
  for (let t = f - 6; t <= f; t++) {
    const s0 = Math.abs(headAt(t - 1) - headAt(t - 5));
    const s1 = Math.abs(headAt(t) - headAt(t - 4));
    if (s1 > 0.3 && s0 <= 0.3) extra.push(t);
  }
  const seed = props.seed ?? 1;
  const blink = blinkAt(f + sceneFrom, seed, extra);
  const toLocal = (arm?: WorldArm): ArmState => {
    if (!arm) return REST;
    return { ...arm, target: arm.target ? { x: (arm.target.x - P.x) / k, y: (arm.target.y - P.y) / k } : null };
  };
  const expr: Expression = typeof pin.expr === "string" ? EXPR[pin.expr] : (pin.expr ?? EXPR.neutral);
  const roles = props.role ? (Array.isArray(props.role) ? props.role : [props.role as L815Role]) : [];
  let mouth = CLOSED;
  for (const r of roles) {
    const m = lipAt(tl.cues, r, f + sceneFrom);
    if (m.open > mouth.open) mouth = m;
  }
  const pose: Pose = {
    bodyTurn,
    headTurn,
    lookX,
    lookY: pin.lookY ?? 0,
    headTilt: pin.headTilt ?? 0,
    nod: pin.nod ?? 0,
    lean: pin.lean ?? 0,
    armL: toLocal(pin.armL),
    armR: toLocal(pin.armR),
    expr,
    mouth,
    blink,
    breath: Math.sin((f + sceneFrom + seed * 17) / 28),
    shoulders: pin.shoulders ?? 0,
    sway: (pin.sway ?? 0) / k,
  };
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: props.opacity ?? 1 }}>
      <g transform={`translate(${P.x} ${P.y}) scale(${k})`}>
        <Figure uid={uid} look={look} pose={pose} layer={props.layer} />
      </g>
    </svg>
  );
};

// Мировая точка по смещению от места персонажа (в единицах рисунка).
export const atBody = (p: Place, dx: number, dy: number): Vec => ({ x: p.x + (dx * p.h) / 1000, y: p.y + (dy * p.h) / 1000 });
