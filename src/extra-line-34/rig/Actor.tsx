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
import { useContext, useMemo } from "react";
import { CLOSED, lipAt, SceneContext, useCues } from "../context";
import { type ElRole } from "../script";
import { Figure, type FigureLayer } from "./Figure";
import { LOOKS, type LookId } from "./looks";
import { blinkAt, clamp, lerp, soften, type Vec } from "./motion";
import { amountAt, dirAt, footWorld, trackOf } from "./gait";
import { EXPR, REST, type ArmState, type ExprId, type Expression, type FootLocal, type Pose } from "./pose";

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
  readonly legSwing?: number; // свисающие ноги сидящего ребёнка: −1…1
};

type ActorProps = {
  readonly uid: string;
  readonly look: LookId;
  readonly f: number; // кадр сцены
  readonly place: (t: number) => Place;
  readonly face?: (t: number) => number;
  readonly pose?: (t: number) => PoseIn;
  readonly role?: ElRole; // губы по речи этой роли
  readonly walkFrom?: number; // с какого кадра считать шаги
  readonly seed?: number;
  readonly blinks?: readonly number[];
  // Сдвиг расписания моргания (кадры): разводит фазы моргания персонажей
  // в одном кадре. Детерминированно.
  readonly blinkShift?: number;
  readonly opacity?: number;
  readonly layer?: FigureLayer;
};

export const Actor: React.FC<ActorProps> = (props) => {
  const cues = useCues();
  const scene = useContext(SceneContext);
  const sceneFrom = scene.from;
  const { look: lookId, f, place, uid } = props;
  const look = LOOKS[lookId];
  const b = look.build;
  const P = place(f);
  const k = P.h / 1000;
  const faceFn = props.face ?? (() => 0);
  const poseFn: (t: number) => PoseIn = props.pose ?? (() => ({}));

  // шаг: фаза по пройденному пути, стопы ставятся в мире (gait.ts)
  const from = props.walkFrom ?? 0;
  const sceneEnd = scene.to - scene.from;
  const track = useMemo(() => trackOf(place, from, sceneEnd, b.stride), [place, from, sceneEnd, b.stride]);
  const phase = track.phase[Math.max(0, f - from)] ?? 0;
  const amtAt = (t: number) => amountAt(place, t);
  const dirFn = (t: number) => dirAt(place, t);
  const walkAmt = soften(amtAt, f, 2);
  const walkDir = soften(dirFn, f, 3);
  const stand = (side: -1 | 1) => ({ x: side * (b.hipJointX + 8) * 0.85, y: -14 });
  const feet = ([-1, 1] as const).map((side) => {
    const w = footWorld(place, track, f, side, b.stride, stand);
    return { x: (w.x - P.x) / k, y: (w.y - P.y - w.lift) / k, roll: w.roll };
  }) as unknown as readonly [FootLocal, FootLocal];

  const pin = poseFn(f);
  const turnBody = pin.turnBody ?? 0.8;
  // куда смотрит персонаж: при ходьбе — по направлению шага
  const faceEff = (t: number) => {
    const a = amtAt(t);
    return lerp(faceFn(t), dirFn(t) * 0.85, a);
  };
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
  const shift = props.blinkShift ?? 0;
  // по абсолютному кадру фильма: после монтажной склейки герои не моргают
  // все разом в одни и те же кадры сцены
  const blink = blinkAt(f + sceneFrom + shift, props.seed ?? 1, extra.map((e) => e + sceneFrom + shift));

  // запаздывание волос и рюкзака
  const X = (t: number) => place(t).x / (place(t).h / 1000);
  const vLag = X(f - 2) - X(f - 6);
  const turnLag = headAt(f - 2) - headAt(f - 6);
  const TAU = Math.PI * 2;
  const hairSway = clamp(-vLag * 0.5 - turnLag * 24, -16, 16) + walkAmt * 2.2 * Math.sin(2 * TAU * phase + 0.6);
  const packSway = clamp(-vLag * 0.25, -6, 6) + walkAmt * 1.6 * Math.sin(2 * TAU * phase + 0.9);

  const toLocal = (arm?: WorldArm): ArmState => {
    if (!arm) return REST;
    return { ...arm, target: arm.target ? { x: (arm.target.x - P.x) / k, y: (arm.target.y - P.y) / k } : null };
  };
  const expr: Expression = typeof pin.expr === "string" ? EXPR[pin.expr] : pin.expr ?? EXPR.neutral;
  const mouth = props.role ? lipAt(cues, props.role, f + sceneFrom) : CLOSED;
  const pose: Pose = {
    bodyTurn,
    headTurn,
    lookX,
    lookY: pin.lookY ?? 0,
    headTilt: pin.headTilt ?? 0,
    nod: pin.nod ?? 0,
    lean: pin.lean ?? 0,
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
    // дыхание: у каждого персонажа свой период и фаза (без общего такта)
    breath: Math.sin((f + (props.seed ?? 1) * 17) / (22 + ((props.seed ?? 1) % 5) * 3)),
    hairSway,
    packSway,
    bagOnShoulder: pin.bagOnShoulder ?? 0,
    strapTug: pin.strapTug ?? 0,
    exhale: pin.exhale ?? 0,
    feet,
    packOff: pin.packOff,
    legSwing: pin.legSwing,
  };
  return (
    <svg
      width={1}
      height={1}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: props.opacity ?? 1 }}
    >
      <g transform={`translate(${P.x} ${P.y}) scale(${k})`}>
        <Figure uid={uid} look={look} pose={pose} layer={props.layer} />
      </g>
    </svg>
  );
};

// Мировая точка кисти по смещению от точки персонажа (в единицах рисунка).
export const atBody = (p: Place, dx: number, dy: number): Vec => ({ x: p.x + (dx * p.h) / 1000, y: p.y + (dy * p.h) / 1000 });
