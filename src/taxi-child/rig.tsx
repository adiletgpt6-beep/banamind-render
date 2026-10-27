// Персонажи ролика BalaGo «Сабак бүттү» на 2D-риге ролика №12 (two-schedules-2d/rig):
// та же фигура, походка по пройденному пути, повороты «глаза → голова →
// корпус», моргание и запаздывание волос/рюкзака. Отличия: внешность
// передаётся своим списком (водитель, бабушка, коллеги, дети группы),
// длина сцены — из шкалы этого ролика. Диктор за кадром, поэтому губы
// персонажей под речь не двигаются (мимика — выражением лица).
import { useMemo } from "react";
import { Figure, type FigureLayer } from "../two-schedules-2d/rig/Figure";
import {
  amountAt,
  dirAt,
  footWorld,
  trackOf,
} from "../two-schedules-2d/rig/gait";
import { LOOKS, type Look } from "../two-schedules-2d/rig/looks";
import {
  blinkAt,
  clamp,
  lerp,
  soften,
  type Vec,
} from "../two-schedules-2d/rig/motion";
import {
  EXPR,
  REST,
  type ArmState,
  type ExprId,
  type Expression,
  type FootLocal,
  type Pose,
} from "../two-schedules-2d/rig/pose";
import { CLOSED } from "../two-schedules-2d/context";

export type Place = {
  readonly x: number;
  readonly y: number;
  readonly h: number;
};
export type WorldArm = Omit<ArmState, "target"> & {
  readonly target: Vec | null;
};

export type PoseIn = {
  readonly armL?: WorldArm;
  readonly armR?: WorldArm;
  readonly expr?: ExprId | Expression;
  readonly lookX?: number;
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
  readonly turnBody?: number;
  readonly packOff?: boolean;
};

// ---------- Внешность ----------
const ADULT = LOOKS.mom.build;
const CHILD = LOOKS.son.build;

export const TC_LOOKS = {
  // мама — та же героиня, что и в роликах проекта
  mom: LOOKS.mom,
  // ребёнок (7–8 лет): школьный пиджак, зелёный рюкзак
  kid: LOOKS.son,
  // девочка из группы (косички, бантики)
  kidGirl: LOOKS.kidA,
  // мальчик из группы: тёплый свитер, синий рюкзак
  kidBoy: {
    ...LOOKS.son,
    build: { ...CHILD, headRx: 70, headRy: 80 },
    skin: "#DDA983",
    skinShade: "#C8916B",
    hair: "#3A2A22",
    top: "sweater",
    topColor: "#D9823F",
    topShade: "#BC6C2F",
    inner: "#F3F0EA",
    bottom: "#3E4A63",
    backpack: "#3A6EA5",
  },
  // водитель (35–45): спокойный, аккуратный — тёмно-бирюзовая куртка,
  // светлая рубашка; без бейджей и надписей
  driver: {
    build: {
      ...ADULT,
      shoulderHalf: 94,
      waistHalf: 68,
      hipHalf: 72,
      headRx: 62,
      headRy: 74,
      limb: 44,
      leg: 56,
    },
    skin: "#D6A27C",
    skinShade: "#C08A64",
    hair: "#2B2421",
    hairStyle: "dadShort",
    top: "jacket",
    topColor: "#2F5D62",
    topShade: "#244A4F",
    inner: "#EEF1F4",
    bottom: "#3A3E48",
    shoes: "#2C2420",
    brow: "#2B2421",
    lips: "#A4655B",
    watch: true,
  },
  // бабушка — заранее согласованный взрослый: седая короткая стрижка,
  // сливовый кардиган, юбка
  grandma: {
    build: {
      ...ADULT,
      headY: -872,
      neckTop: -808,
      shoulderY: -766,
      waistHalf: 70,
      hipHalf: 80,
    },
    skin: "#E2B18D",
    skinShade: "#CB9874",
    hair: "#C9C4BE",
    hairStyle: "shortGrey",
    top: "cardigan",
    topColor: "#8E5C7E",
    topShade: "#764A68",
    inner: "#F3EADF",
    bottom: "#4A4458",
    skirt: true,
    legColor: "#9A8F84",
    shoes: "#3A3236",
    brow: "#9C948C",
    lips: "#B0675F",
    earrings: true,
  },
  // коллеги на рабочей встрече
  colleagueM: LOOKS.parentA,
  colleagueF: { ...LOOKS.teacher, topColor: "#4F6D9A", topShade: "#3F5A82" },
} as const satisfies Record<string, Look>;

export type TcLookId = keyof typeof TC_LOOKS;

type ActorProps = {
  readonly uid: string;
  readonly look: TcLookId;
  readonly f: number; // кадр сцены
  readonly span: number; // длина сцены (кадры) — план шага на всю сцену
  readonly place: (t: number) => Place;
  readonly face?: (t: number) => number;
  readonly pose?: (t: number) => PoseIn;
  readonly walkFrom?: number;
  readonly seed?: number;
  readonly blinks?: readonly number[];
  readonly opacity?: number;
  readonly layer?: FigureLayer;
};

export const Actor: React.FC<ActorProps> = (props) => {
  const { f, place, uid, span } = props;
  const look: Look = TC_LOOKS[props.look];
  const b = look.build;
  const P = place(f);
  const k = P.h / 1000;
  const faceFn = props.face ?? (() => 0);
  const pin: PoseIn = props.pose ? props.pose(f) : {};

  const from = props.walkFrom ?? 0;
  const track = useMemo(
    () => trackOf(place, from, Math.max(from + 1, span), b.stride),
    [place, from, span, b.stride],
  );
  const phase =
    track.phase[Math.max(0, Math.min(track.phase.length - 1, f - from))] ?? 0;
  const amtAt = (t: number) => amountAt(place, t);
  const dirFn = (t: number) => dirAt(place, t);
  const walkAmt = soften(amtAt, f, 2);
  const walkDir = soften(dirFn, f, 3);
  const stand = (side: -1 | 1) => ({
    x: side * (b.hipJointX + 8) * 0.85,
    y: -14,
  });
  const feet = ([-1, 1] as const).map((side) => {
    const w = footWorld(place, track, f, side, b.stride, stand);
    return { x: (w.x - P.x) / k, y: (w.y - P.y - w.lift) / k, roll: w.roll };
  }) as unknown as readonly [FootLocal, FootLocal];

  const faceEff = (t: number) => lerp(faceFn(t), dirFn(t) * 0.85, amtAt(t));
  const headAt = (t: number) => soften(faceEff, t - 2, 2);
  const headTurn = clamp(headAt(f), -0.9, 0.9);
  const bodyTurn = clamp(
    soften(faceEff, f - 6, 4) * (pin.turnBody ?? 0.8),
    -0.85,
    0.85,
  );
  const lookX = clamp((faceEff(f) - headTurn) * 2.4 + (pin.lookX ?? 0), -1, 1);

  const extra: number[] = [...(props.blinks ?? [])];
  for (let t = f - 6; t <= f; t++) {
    const s0 = Math.abs(headAt(t - 1) - headAt(t - 5));
    const s1 = Math.abs(headAt(t) - headAt(t - 4));
    if (s1 > 0.3 && s0 <= 0.3) extra.push(t);
  }
  const blink = blinkAt(f, props.seed ?? 1, extra);

  const X = (t: number) => place(t).x / (place(t).h / 1000);
  const vLag = X(f - 2) - X(f - 6);
  const turnLag = headAt(f - 2) - headAt(f - 6);
  const TAU = Math.PI * 2;
  const hairSway =
    clamp(-vLag * 0.5 - turnLag * 24, -16, 16) +
    walkAmt * 2.2 * Math.sin(2 * TAU * phase + 0.6);
  const packSway =
    clamp(-vLag * 0.25, -6, 6) +
    walkAmt * 1.6 * Math.sin(2 * TAU * phase + 0.9);

  const toLocal = (arm?: WorldArm): ArmState => {
    if (!arm) return REST;
    return {
      ...arm,
      target: arm.target
        ? { x: (arm.target.x - P.x) / k, y: (arm.target.y - P.y) / k }
        : null,
    };
  };
  const expr: Expression =
    typeof pin.expr === "string" ? EXPR[pin.expr] : (pin.expr ?? EXPR.neutral);
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
    mouth: CLOSED,
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
  };
  return (
    <svg
      width={1}
      height={1}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        overflow: "visible",
        opacity: props.opacity ?? 1,
      }}
    >
      <g transform={`translate(${P.x} ${P.y}) scale(${k})`}>
        <Figure uid={uid} look={look} pose={pose} layer={props.layer} />
      </g>
    </svg>
  );
};

// Мировая точка по долям роста от точки персонажа (ступни).
export const atBody = (p: Place, dx: number, dy: number): Vec => ({
  x: p.x + dx * p.h,
  y: p.y + dy * p.h,
});
