// Персонаж BG-042 на общем 2D-риге проекта (Figure/looks/motion/pose из
// src/two-schedules-2d/rig — только чтение, как в BG-016). Персонажи этого
// ролика не ходят: сидят за столом (ведущий, мама) или стоят в кадре
// монитора (репортёр), поэтому стопы неподвижны.
// Поворот цепочкой: глаза сразу, голова ≈ 2 кадра, корпус ≈ 6 кадров;
// моргание по расписанию и на резком повороте головы; дыхание; губы — по
// фактической речи роли (буквы + громкость файла).
import React from "react";
import { Figure, type FigureLayer } from "../../two-schedules-2d/rig/Figure";
import { LOOKS, type Look } from "../../two-schedules-2d/rig/looks";
import { blinkAt, clamp, smoothstep, soften, type Vec } from "../../two-schedules-2d/rig/motion";
import { EXPR, REST, type ArmState, type ExprId, type Expression, type Pose } from "../../two-schedules-2d/rig/pose";
import { CLOSED, lipsOf, useTimeline } from "./context";
import type { Bg42Role } from "./script";

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
  readonly sit?: number;
  readonly seat?: number; // высота сиденья, мировые px от точки персонажа
  readonly shoulders?: number;
  readonly exhale?: number;
  readonly turnBody?: number;
};

const ADULT_MALE = { ...LOOKS.dad.build };

// Внешность героев BG-042.
export const BG42_LOOKS = {
  // Ведущий шуточных новостей: тёмно-синий пиджак, белая рубашка, жёлтый
  // галстук (рисуется поверх корпуса, см. SuitDecor), аккуратная стрижка.
  anchor: {
    build: { ...ADULT_MALE, shoulderHalf: 98, waistHalf: 70 },
    skin: "#D9A47C",
    skinShade: "#C38C65",
    hair: "#1E1A18",
    hairStyle: "dadShort",
    top: "jacket",
    topColor: "#22345F",
    topShade: "#18264A",
    inner: "#FFFFFF",
    bottom: "#2B3350",
    shoes: "#24242A",
    brow: "#1E1A18",
    lips: "#A9675E",
    watch: true,
  },
  // Мини-репортёр «на выезде»: жёлтая куртка, белая футболка.
  reporter: {
    build: { ...ADULT_MALE, shoulderHalf: 88, waistHalf: 62, headRx: 60, headRy: 72 },
    skin: "#E3B48E",
    skinShade: "#CD9A72",
    hair: "#3A2A22",
    hairStyle: "dadShort",
    top: "jacket",
    topColor: "#F5B915",
    topShade: "#D99E00",
    inner: "#FFFFFF",
    bottom: "#3A4256",
    shoes: "#2A2A30",
    brow: "#3A2A22",
    lips: "#B0675E",
  },
  // Офисная мама: каре, бирюзовый кардиган, кремовая блузка, серьги, часы.
  mom: {
    ...LOOKS.mom,
    topColor: "#4F9C93",
    topShade: "#3F837B",
  },
} as const satisfies Record<string, Look>;

export type Bg42LookId = keyof typeof BG42_LOOKS;

type Props = {
  readonly uid: string;
  readonly look: Bg42LookId;
  readonly f: number; // кадр сцены
  readonly abs: number; // кадр ролика (губы)
  readonly place: Place;
  readonly face?: (t: number) => number; // −1…1 куда смотрит
  readonly pose?: (t: number) => PoseIn;
  readonly role?: Bg42Role;
  readonly seed?: number;
  readonly opacity?: number;
  readonly layer?: FigureLayer;
  readonly suit?: boolean; // лацканы, рубашка и галстук ведущего
};

// Поза для рисования (то же, что считает Figure; повторно используется для
// деталей поверх корпуса).
const buildPose = (p: Props, look: Look, tl: ReturnType<typeof useTimeline>): Pose => {
  const P = p.place;
  const k = P.h / 1000;
  const b = look.build;
  const faceFn = p.face ?? (() => 0);
  const pin: PoseIn = p.pose ? p.pose(p.f) : {};
  const headAt = (t: number) => soften(faceFn, t - 2, 2);
  const headTurn = clamp(headAt(p.f), -0.9, 0.9);
  const bodyTurn = clamp(soften(faceFn, p.f - 6, 4) * (pin.turnBody ?? 0.55), -0.85, 0.85);
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
  return {
    bodyTurn,
    headTurn,
    lookX,
    lookY: pin.lookY ?? 0,
    headTilt: pin.headTilt ?? 0,
    nod: pin.nod ?? 0,
    lean: pin.lean ?? 0,
    sit: pin.sit ?? 0,
    seat: (pin.seat ?? 0) / k,
    crouch: 0,
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
    strapTug: 0,
    exhale: pin.exhale ?? 0,
    feet: [stand(-1), stand(1)],
  };
};

// Лацканы, рубашка и галстук поверх корпуса (единицы рисунка). Координаты
// груди считаются так же, как в Figure (посадка, наклон, дыхание, поворот).
const SuitDecor: React.FC<{ readonly look: Look; readonly pose: Pose }> = ({ look, pose }) => {
  const b = look.build;
  const bt = pose.bodyTurn;
  const at = Math.abs(bt);
  const sgn = bt >= 0 ? 1 : -1;
  const ws = 1 - 0.36 * at;
  const sitE = smoothstep(pose.sit);
  const hipSitY = -pose.seat + 6;
  const legReach = b.thigh + b.shin - 4;
  const stanceDrop = Math.max(
    14,
    ...([-1, 1] as const).map((side) => {
      const foot = pose.feet?.[side < 0 ? 0 : 1];
      if (!foot) return 14;
      const hipX = side * b.hipJointX * (1 - 0.55 * at);
      const dx = Math.min(legReach - 1, Math.abs(foot.x - hipX));
      return foot.y - Math.sqrt(legReach * legReach - dx * dx) - b.hipJointY;
    }),
  );
  const drop = (hipSitY - b.hipJointY) * sitE + stanceDrop * (1 - sitE);
  const leanY = (1 - at) * pose.lean * 1.6;
  const shy = -pose.shoulders * 12 + pose.exhale * 7 - pose.breath * 1.5;
  const sy = b.shoulderY + drop + leanY + shy;
  const hy = b.hipY + drop;
  const cx = bt * b.shoulderHalf * ws * 0.45;
  const vw = 34 * (1 - 0.3 * at);
  const vBottom = sy + (hy - sy) * 0.46;
  const tieW = 15 * (1 - 0.25 * at);
  return (
    <g transform={pose.lean && at > 0.05 ? `rotate(${sgn * at * pose.lean} 0 ${hy})` : undefined}>
      {/* рубашка в вырезе пиджака */}
      <path d={`M ${cx - vw} ${sy - 6} L ${cx + vw} ${sy - 6} L ${cx} ${vBottom} Z`} fill={look.inner} />
      {/* воротник рубашки */}
      <path d={`M ${cx - 26} ${sy - 10} L ${cx - 3} ${sy + 14} L ${cx - 30} ${sy + 12} Z`} fill="#E9EDF5" />
      <path d={`M ${cx + 26} ${sy - 10} L ${cx + 3} ${sy + 14} L ${cx + 30} ${sy + 12} Z`} fill="#E9EDF5" />
      {/* галстук */}
      <path d={`M ${cx - tieW * 0.75} ${sy + 4} L ${cx + tieW * 0.75} ${sy + 4} L ${cx + tieW * 0.5} ${sy + 20} L ${cx - tieW * 0.5} ${sy + 20} Z`} fill="#E8A800" />
      <path
        d={`M ${cx - tieW * 0.55} ${sy + 19} L ${cx + tieW * 0.55} ${sy + 19} L ${cx + tieW} ${vBottom - 6} L ${cx} ${vBottom + 14} L ${cx - tieW} ${vBottom - 6} Z`}
        fill="#FFC90E"
      />
      {/* лацканы */}
      <path d={`M ${cx - vw - 4} ${sy - 8} L ${cx - 6} ${vBottom + 6} L ${cx - vw - 18} ${sy + 60} Z`} fill={look.topShade} />
      <path d={`M ${cx + vw + 4} ${sy - 8} L ${cx + 6} ${vBottom + 6} L ${cx + vw + 18} ${sy + 60} Z`} fill={look.topShade} />
      {/* карманный платок и пуговица */}
      <path d={`M ${cx + 40} ${sy + 92} l 22 -4 l -4 12 Z`} fill="#FFC90E" opacity={0.9 * (1 - at)} />
      <circle cx={cx} cy={vBottom + 34} r={5} fill={look.topShade} />
    </g>
  );
};

export const Actor: React.FC<Props> = (p) => {
  const tl = useTimeline();
  const look: Look = BG42_LOOKS[p.look];
  const pose = buildPose(p, look, tl);
  const P = p.place;
  const k = P.h / 1000;
  const layer = p.layer ?? "all";
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: p.opacity ?? 1 }}>
      <g transform={`translate(${P.x} ${P.y}) scale(${k})`}>
        {layer === "arms" ? (
          <Figure uid={p.uid} look={look} pose={pose} layer="arms" />
        ) : (
          <>
            <Figure uid={p.uid} look={look} pose={pose} layer="body" />
            {p.suit ? <SuitDecor look={look} pose={pose} /> : null}
            {layer === "all" ? <Figure uid={`${p.uid}-a`} look={look} pose={pose} layer="arms" /> : null}
          </>
        )}
      </g>
    </svg>
  );
};

// Мировая точка по смещению от точки персонажа (единицы рисунка).
export const atBody = (p: Place, dx: number, dy: number): Vec => ({ x: p.x + (dx * p.h) / 1000, y: p.y + (dy * p.h) / 1000 });

// Высота сиденья взрослого (мировые px), как в 2D-роликах проекта.
export const seatOf = (p: Place) => 0.27 * p.h;
