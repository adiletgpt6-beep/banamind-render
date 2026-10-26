// Персонаж в мире сцены. Сцена задаёт функции от кадра:
//   place(t) — точка между ступнями (мировые px) и рост h;
//   face(t)  — куда персонаж хочет смотреть (−1…1);
//   pose(t)  — руки (цели кистей в мировых px), мимика, посадка и т. д.
// Отсюда считаются:
//   • шаг по фактически пройденному пути (стопы не скользят);
//   • поворот цепочкой: глаза сразу, голова с задержкой ≈ 2 кадра, корпус
//     ≈ 6 кадров; на быстром повороте головы — моргание;
//   • моргание по детерминированному расписанию (seed), без общего ритма.
// Всё детерминированно по номеру кадра.
import { useContext, useMemo } from "react";
import { CLOSED, lipAt, SceneContext, TimelineContext } from "../core/context";
import type { L80Role } from "../core/roles";
import { Figure, figureAnchors, type FigureAnchors, type FigureLayer } from "./Figure";
import type { Look } from "./looks";
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
  readonly floorSit?: number;
  readonly crouch?: number;
  readonly shoulders?: number;
  readonly exhale?: number;
  readonly turnBody?: number; // доля поворота корпуса (по умолчанию 0,8)
  // ---- по выбору (80-1-9) ----
  // Жуёт 0…1: рот закрыт (речь с жеванием не смешивается), челюсть ходит
  // ≈ 2 раза в секунду (фаза — от номера кадра); mouthFull 0…1 — щёки полнее.
  readonly chew?: number;
  readonly mouthFull?: number;
  // На одно колено 0…1 (из стойки; вместе с floorSit — «колено → сидя на
  // полу»); kneelSide — какое колено на полу (сторона экрана, по умолчанию
  // противоположная повороту корпуса).
  readonly kneel?: number;
  readonly kneelSide?: -1 | 1;
  // Откусить 0…1: рот приоткрыт (поверх речи); при chew > 0 не действует.
  readonly bite?: number;
};

// Фаза жевания (циклы): 2 цикла в секунду при 30 кадрах/с.
export const chewPhaseAt = (fAbs: number) => fAbs / 15;
// Дыхание (плечи и голова чуть ходят): то же выражение, что в Actor.
export const breathAt = (fAbs: number, seed = 1) => Math.sin((fAbs + seed * 17) / 26);

// Перевод цели руки из мира в единицы рисунка.
const armToLocal = (P: Place, arm?: WorldArm): ArmState => {
  if (!arm) return REST;
  const k = P.h / 1000;
  return { ...arm, target: arm.target ? { x: (arm.target.x - P.x) / k, y: (arm.target.y - P.y) / k } : null };
};

// Поля позы из PoseIn: общие для Actor и actorAnchors.
const poseFields = (P: Place, pin: PoseIn) => {
  const k = P.h / 1000;
  const expr: Expression = typeof pin.expr === "string" ? EXPR[pin.expr] : pin.expr ?? EXPR.neutral;
  const extra: { chew?: number; mouthFull?: number; kneel?: number; kneelSide?: -1 | 1 } = {};
  if (pin.chew !== undefined) extra.chew = pin.chew;
  if (pin.mouthFull !== undefined) extra.mouthFull = pin.mouthFull;
  if (pin.kneel !== undefined) extra.kneel = pin.kneel;
  if (pin.kneelSide !== undefined) extra.kneelSide = pin.kneelSide;
  return {
    lookY: pin.lookY ?? 0,
    headTilt: pin.headTilt ?? 0,
    nod: pin.nod ?? 0,
    lean: pin.lean ?? 0,
    sit: pin.sit ?? 0,
    seat: (pin.seat ?? 0) / k,
    floorSit: pin.floorSit ?? 0,
    crouch: pin.crouch ?? 0,
    armL: armToLocal(P, pin.armL),
    armR: armToLocal(P, pin.armR),
    expr,
    shoulders: pin.shoulders ?? 0,
    exhale: pin.exhale ?? 0,
    ...extra,
  };
};

export type ActorAnchors = FigureAnchors;

// Опорные точки персонажа в мировых px для данного места и позы — те же,
// что нарисует Actor (голова, рот, подбородок, шея, плечи, запястья,
// точки захвата в кистях). bodyTurn/headTurn — фактические повороты
// (у Actor они запаздывают за face(t)); breath — дыхание (breathAt), сдвигает
// плечи и голову на ≤ 1,5 ед.; chewPhase — фаза жевания (chewPhaseAt).
// Стоит на месте (стопы в спокойной стойке), без шага.
export const actorAnchors = (a: {
  readonly look: Look;
  readonly place: Place;
  readonly pose: PoseIn;
  readonly bodyTurn: number;
  readonly headTurn: number;
  readonly lookX?: number;
  readonly breath?: number;
  readonly chewPhase?: number;
}): ActorAnchors => {
  const { look, place: P } = a;
  const b = look.build;
  const k = P.h / 1000;
  const stand = (side: -1 | 1): FootLocal => ({ x: side * (b.hipJointX + 8) * 0.85, y: -14, roll: 0 });
  const pose: Pose = {
    ...poseFields(P, a.pose),
    bodyTurn: a.bodyTurn,
    headTurn: a.headTurn,
    lookX: a.lookX ?? 0,
    walkPhase: 0,
    walkAmt: 0,
    walkDir: 0,
    mouth: CLOSED,
    blink: 0,
    breath: a.breath ?? 0,
    hairSway: 0,
    feet: [stand(-1), stand(1)],
    chewPhase: a.chewPhase ?? 0,
  };
  const A = figureAnchors(look, pose);
  const W = (v: Vec): Vec => ({ x: P.x + v.x * k, y: P.y + v.y * k });
  return {
    head: W(A.head),
    mouth: W(A.mouth),
    chin: W(A.chin),
    neck: W(A.neck),
    neckTop: W(A.neckTop),
    shoulderL: W(A.shoulderL),
    shoulderR: W(A.shoulderR),
    wristL: W(A.wristL),
    wristR: W(A.wristR),
    gripL: W(A.gripL),
    gripR: W(A.gripR),
    hip: W(A.hip),
  };
};

type ActorProps = {
  readonly uid: string;
  readonly look: Look;
  readonly f: number; // кадр сцены
  readonly place: (t: number) => Place;
  readonly face?: (t: number) => number;
  readonly pose?: (t: number) => PoseIn;
  readonly role?: L80Role; // губы по речи этой роли
  readonly chorus?: boolean; // участвует в групповой реплике детей
  readonly walkFrom?: number; // с какого кадра считать шаги
  readonly seed?: number;
  readonly blinks?: readonly number[];
  readonly opacity?: number;
  readonly layer?: FigureLayer;
};

export const Actor: React.FC<ActorProps> = (props) => {
  const { cues } = useContext(TimelineContext);
  const scene = useContext(SceneContext);
  const { look, f, place, uid } = props;
  const b = look.build;
  const P = place(f);
  const k = P.h / 1000;
  const faceFn = props.face ?? (() => 0);
  const poseFn: (t: number) => PoseIn = props.pose ?? (() => ({}));

  const from = props.walkFrom ?? 0;
  const track = useMemo(() => trackOf(place, from, scene.len, b.stride), [place, from, scene.len, b.stride]);
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
  const faceEff = (t: number) => {
    const a = amtAt(t);
    return lerp(faceFn(t), dirFn(t) * 0.85, a);
  };
  const headAt = (t: number) => soften(faceEff, t - 2, 2);
  const headTurn = clamp(headAt(f), -0.9, 0.9);
  const bodyTurn = clamp(soften(faceEff, f - 6, 4) * turnBody, -0.85, 0.85);
  const lookX = clamp((faceEff(f) - headTurn) * 2.4 + (pin.lookX ?? 0), -1, 1);

  const extra: number[] = [...(props.blinks ?? [])];
  for (let t = f - 6; t <= f; t++) {
    const s0 = Math.abs(headAt(t - 1) - headAt(t - 5));
    const s1 = Math.abs(headAt(t) - headAt(t - 4));
    if (s1 > 0.3 && s0 <= 0.3) extra.push(t);
  }
  const blink = blinkAt(f + scene.from, props.seed ?? 1, extra);

  const X = (t: number) => place(t).x / (place(t).h / 1000);
  const vLag = X(f - 2) - X(f - 6);
  const turnLag = headAt(f - 2) - headAt(f - 6);
  const TAU = Math.PI * 2;
  const hairSway = clamp(-vLag * 0.5 - turnLag * 24, -16, 16) + walkAmt * 2.2 * Math.sin(2 * TAU * phase + 0.6);

  // жуёт — губы сомкнуты, фонемы речи не накладываются
  const chewing = (pin.chew ?? 0) > 0;
  const bite = chewing ? 0 : clamp(pin.bite ?? 0);
  const speech = props.role && !chewing ? lipAt(cues, props.role, f + scene.from, props.chorus) : CLOSED;
  const mouth = bite > 0 ? { open: Math.max(speech.open, 0.42 * bite), round: 0.25 * bite, wide: 0.15 * bite } : speech;
  const pose: Pose = {
    ...poseFields(P, pin),
    bodyTurn,
    headTurn,
    lookX,
    walkPhase: phase,
    walkAmt,
    walkDir,
    mouth,
    blink,
    breath: breathAt(f + scene.from, props.seed ?? 1),
    hairSway,
    feet,
    ...(chewing ? { chewPhase: chewPhaseAt(f + scene.from) } : {}),
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
