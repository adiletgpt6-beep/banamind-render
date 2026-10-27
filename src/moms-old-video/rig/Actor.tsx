// Персонаж в мире сцены. Сцена задаёт функции от кадра:
//   place(t) — точка между ступнями (мировые px) и рост h;
//   face(t)  — куда персонаж хочет смотреть (−1…1);
//   pose(t)  — руки (цели кистей в мировых px или углы FK), мимика,
//              посадка, а в танце — стопы, таз и корпус.
// Отсюда считаются:
//   • шаг по фактически пройденному пути (стопы не скользят), направление
//     и размах шага плавно меняются при старте и остановке;
//   • поворот цепочкой: глаза сразу, голова с задержкой ≈ 2 кадра, корпус
//     ≈ 6 кадров (в танце наоборот: ведёт корпус, голова догоняет);
//   • запаздывание волос по скорости движения.
// Всё детерминированно по номеру кадра.
import { useContext, useMemo } from "react";
import { CLOSED, CuesContext, lipAt, SceneContext } from "../context";
import { MOV_FRAMES, MOV_SCENES, MOV_VIDEO, type MovRole } from "../script";
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
  readonly turnBody?: number; // доля поворота корпуса (по умолчанию 0,8)
  // Танец (единицы рисунка): стопы, таз, корпус, подол, волосы.
  readonly feet?: readonly [FootLocal, FootLocal];
  // 0…1: доля заданных стоп против стоп походки — плавный переход от
  // ходьбы/стойки к танцевальной стойке (без скачка стоп)
  readonly feetMix?: number;
  readonly hipShift?: number;
  readonly hipTilt?: number;
  readonly torsoTilt?: number;
  readonly hemSway?: number;
  readonly hairSway?: number;
  readonly belt?: number;
};

type ActorProps = {
  readonly uid: string;
  readonly look: LookId;
  readonly f: number; // кадр сцены
  readonly place: (t: number) => Place;
  readonly face?: (t: number) => number;
  readonly pose?: (t: number) => PoseIn;
  readonly role?: MovRole; // губы по речи этой роли
  readonly walkFrom?: number; // с какого кадра считать шаги
  readonly seed?: number;
  readonly blinks?: readonly number[];
  readonly opacity?: number;
  readonly layer?: FigureLayer;
  // "body": ведёт корпус (танец), голова догоняет с задержкой
  readonly lead?: "head" | "body";
  // вид со спины (в зеркальной студии)
  readonly back?: boolean;
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
  const pin = poseFn(f);

  // шаг: фаза по пройденному пути, стопы ставятся в мире (gait.ts)
  const from = props.walkFrom ?? 0;
  const scene = MOV_SCENES.find((s) => Math.round(s.from * MOV_VIDEO.fps) === sceneFrom);
  const sceneEnd = scene ? Math.round((scene.to - scene.from) * MOV_VIDEO.fps) : MOV_FRAMES;
  const track = useMemo(() => trackOf(place, from, sceneEnd, b.stride), [place, from, sceneEnd, b.stride]);
  const phase = track.phase[Math.max(0, f - from)] ?? 0;
  const amtAt = (t: number) => amountAt(place, t);
  const dirFn = (t: number) => dirAt(place, t);
  const mixF = pin.feet ? clamp(pin.feetMix ?? 1) : 0;
  const walkAmt = soften(amtAt, f, 2) * (1 - mixF);
  const walkDir = soften(dirFn, f, 3);
  const turnBody = pin.turnBody ?? 0.8;
  // стойка: в анфас стопы под бёдрами, в повороте — ближе друг к другу
  // и чуть вразнобой (как у Figure), чтобы ноги не расходились «иксом»
  const bodyAt = (t: number) => clamp(soften(faceFn, t - 6, 4) * turnBody, -0.85, 0.85);
  const stand = (side: -1 | 1, t: number) => {
    const bt0 = bodyAt(t);
    const a0 = Math.abs(bt0);
    return { x: side * (b.hipJointX + 8) * 0.85 * (1 - 0.5 * a0) + side * Math.sign(bt0) * 10 * a0, y: -14 };
  };
  const gaitFeet = () =>
    ([-1, 1] as const).map((side) => {
      const w = footWorld(place, track, f, side, b.stride, stand);
      return { x: (w.x - P.x) / k, y: (w.y - P.y - w.lift) / k, roll: w.roll };
    }) as unknown as readonly [FootLocal, FootLocal];
  const feet: readonly [FootLocal, FootLocal] = !pin.feet
    ? gaitFeet()
    : mixF >= 1
      ? pin.feet
      : (() => {
          const g = gaitFeet();
          const d = pin.feet;
          const mix = (a: FootLocal, c: FootLocal): FootLocal => ({ x: lerp(a.x, c.x, mixF), y: lerp(a.y, c.y, mixF), roll: lerp(a.roll, c.roll, mixF) });
          return [mix(g[0], d[0]), mix(g[1], d[1])] as const;
        })();

  // куда смотрит персонаж: при ходьбе — по направлению шага
  const faceEff = (t: number) => {
    const a = amtAt(t);
    return lerp(faceFn(t), dirFn(t) * 0.85, a);
  };
  const bodyLead = props.lead === "body";
  const headAt = (t: number) => (bodyLead ? soften(faceEff, t - 3, 2) : soften(faceEff, t - 2, 2));
  const headTurn = clamp(headAt(f), -0.9, 0.9);
  const bodyTurn = clamp((bodyLead ? soften(faceEff, f, 1) : soften(faceEff, f - 6, 4)) * turnBody, -0.85, 0.85);
  const lookX = clamp((faceEff(f) - headTurn) * 2.4 + (pin.lookX ?? 0), -1, 1);

  // моргание: по расписанию + при резком повороте головы
  const extra: number[] = [...(props.blinks ?? [])];
  for (let t = f - 6; t <= f; t++) {
    const s0 = Math.abs(headAt(t - 1) - headAt(t - 5));
    const s1 = Math.abs(headAt(t) - headAt(t - 4));
    if (s1 > 0.3 && s0 <= 0.3) extra.push(t);
  }
  const blink = blinkAt(f, props.seed ?? 1, extra);

  // запаздывание волос
  const X = (t: number) => place(t).x / (place(t).h / 1000);
  const vLag = X(f - 2) - X(f - 6);
  const turnLag = headAt(f - 2) - headAt(f - 6);
  const TAU = Math.PI * 2;
  const hairSway = clamp(-vLag * 0.5 - turnLag * 24, -16, 16) + walkAmt * 2.2 * Math.sin(2 * TAU * phase + 0.6) + (pin.hairSway ?? 0);

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
    breath: Math.sin((f + (props.seed ?? 1) * 17) / 26),
    hairSway,
    bagOnShoulder: pin.bagOnShoulder ?? 0,
    exhale: pin.exhale ?? 0,
    hipShift: pin.hipShift ?? 0,
    hipTilt: pin.hipTilt ?? 0,
    torsoTilt: pin.torsoTilt ?? 0,
    hemSway: pin.hemSway ?? 0,
    feet,
    belt: pin.belt,
    back: props.back,
  };
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: props.opacity ?? 1 }}>
      <g transform={`translate(${P.x} ${P.y}) scale(${k})`}>
        <Figure uid={uid} look={look} pose={pose} layer={props.layer} />
      </g>
    </svg>
  );
};

// Мировая точка по смещению от точки персонажа (в единицах рисунка).
export const atBody = (p: Place, dx: number, dy: number): Vec => ({ x: p.x + (dx * p.h) / 1000, y: p.y + (dy * p.h) / 1000 });
