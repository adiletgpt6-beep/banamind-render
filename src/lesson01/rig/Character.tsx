export { solveRig, type Rig } from "./solve";
// Персонаж-риг: корпус, шея, голова, руки (плечо → локоть → кисть) и ноги
// (бедро → колено → стопа). Суставы — точки вращения; длины звеньев
// постоянны. solveRig() отдаёт мировые координаты суставов — по ним предметы
// «прикрепляются» к кисти, а камера и тени знают, где персонаж.
import React from "react";
import { type P, along, clamp, rad } from "./geom";
import { solveRig } from "./solve";
import { HandGlyph } from "./Hand";
import { Head } from "./Head";
import { headMetrics } from "./headMetrics";
import { type Look, OUTLINE, OUTLINE_W } from "./looks";
import type { Face, LegPose, Pose } from "./pose";

const f = (n: number) => n.toFixed(2);

const seg = (a: P, b: P, w: number, color: string, key?: string) => (
  <g key={key}>
    <line x1={f(a.x)} y1={f(a.y)} x2={f(b.x)} y2={f(b.y)} stroke={OUTLINE} strokeWidth={f(w + OUTLINE_W * 2)} strokeLinecap="round" />
    <line x1={f(a.x)} y1={f(a.y)} x2={f(b.x)} y2={f(b.y)} stroke={color} strokeWidth={f(w)} strokeLinecap="round" />
  </g>
);
const fillSeg = (a: P, b: P, w: number, color: string) => (
  <line x1={f(a.x)} y1={f(a.y)} x2={f(b.x)} y2={f(b.y)} stroke={color} strokeWidth={f(w)} strokeLinecap="round" />
);

type Props = {
  look: Look;
  pose: Pose;
  face: Face;
  x: number;
  y: number;
  scale: number;
  uid: string;
  shadow?: boolean;
  // предметы в руке рисуются под пальцами кисти
  holdL?: React.ReactNode;
  holdR?: React.ReactNode;
  opacity?: number;
  // Слои (ролик 80-1-4): "body" — всё, кроме рук из layerArms; "arms" — только
  // эти руки (рисуются отдельным слоем поверх стола и предметов). По умолчанию
  // персонаж рисуется целиком, как в первых фильмах.
  layer?: "all" | "body" | "arms";
  layerArms?: ("L" | "R")[];
  // (ролик 80-1-4) детали на груди (пуговицы, лацканы, принт) наклоняются вместе
  // с корпусом при pose.lean, боковая тень не выходит за силуэт. По умолчанию
  // выключено — первые фильмы не меняются.
  chestLean?: boolean;
};

export const Character: React.FC<Props> = ({ look, pose, face, x, y, scale, uid, shadow = true, holdL, holdR, opacity = 1, layer = "all", layerArms = [], chestLean = false }) => {
  const b = look.body;
  const r = solveRig(look, pose);
  const yaw = pose.bodyYaw;
  const longSleeve = look.top !== "tshirt";

  // ---------- Ноги ----------
  const footEl = (side: "L" | "R", l: LegPose) => {
    const A = r.legs[side].A;
    const len = b.foot * l.footF;
    const tip = along(A, l.footA, len);
    return (
      <g key={`foot${side}`}>
        {seg(A, tip, b.legW * 0.78, look.socks)}
      </g>
    );
  };
  const legEl = (side: "L" | "R") => {
    const l = side === "L" ? pose.legL : pose.legR;
    const g = r.legs[side];
    return (
      <g key={`leg${side}`}>
        {footEl(side, l)}
        {seg(g.K, g.A, b.legW * 0.9, look.pants)}
        {seg(g.H, g.K, b.legW, look.pants)}
        {fillSeg(g.K, g.A, b.legW * 0.9, look.pants)}
        <circle cx={f(g.K.x)} cy={f(g.K.y)} r={f(b.legW * 0.47)} fill={look.pants} />
      </g>
    );
  };
  const legs = pose.legOrder === "LR" ? [legEl("L"), legEl("R")] : [legEl("R"), legEl("L")];

  // ---------- Корпус ----------
  const { hip, shoulderC, shoulderL, shoulderR } = r;
  const hipW = b.hipW * 0.5 * (1 - 0.2 * Math.abs(yaw));
  const perp = { x: Math.cos(rad(pose.lean)), y: -Math.sin(rad(pose.lean)) };
  const hipL = { x: hip.x - perp.x * hipW, y: hip.y - perp.y * hipW };
  const hipR = { x: hip.x + perp.x * hipW, y: hip.y + perp.y * hipW };
  const isDress = look.top === "dress";
  const hemDrop = isDress ? b.thigh * 0.95 : b.limbW * 0.35;
  const hemL = { x: hipL.x - (isDress ? b.hipW * 0.12 : 0), y: hipL.y + hemDrop };
  const hemR = { x: hipR.x + (isDress ? b.hipW * 0.12 : 0), y: hipR.y + hemDrop };
  const shL = { x: shoulderL.x - b.limbW * 0.15, y: shoulderL.y - b.limbW * 0.35 };
  const shR = { x: shoulderR.x + b.limbW * 0.15, y: shoulderR.y - b.limbW * 0.35 };
  const waistIn = b.child * 0 + 0.04 * b.shoulderW;
  const torsoD = [
    `M ${f(hemL.x)} ${f(hemL.y)}`,
    `C ${f(hemL.x - waistIn * 0.2)} ${f((hemL.y + shL.y) / 2)} ${f(shL.x - b.limbW * 0.1)} ${f(shL.y + b.torso * 0.25)} ${f(shL.x)} ${f(shL.y + b.limbW * 0.3)}`,
    `Q ${f(shL.x + b.limbW * 0.1)} ${f(shL.y - b.limbW * 0.05)} ${f(shL.x + b.limbW * 0.6)} ${f(shL.y - b.limbW * 0.12)}`,
    `L ${f(shR.x - b.limbW * 0.6)} ${f(shR.y - b.limbW * 0.12)}`,
    `Q ${f(shR.x - b.limbW * 0.1)} ${f(shR.y - b.limbW * 0.05)} ${f(shR.x)} ${f(shR.y + b.limbW * 0.3)}`,
    `C ${f(shR.x + b.limbW * 0.1)} ${f(shR.y + b.torso * 0.25)} ${f(hemR.x + waistIn * 0.2)} ${f((hemR.y + shR.y) / 2)} ${f(hemR.x)} ${f(hemR.y)}`,
    `Q ${f(hip.x)} ${f(Math.max(hemL.y, hemR.y) + b.limbW * 0.12)} ${f(hemL.x)} ${f(hemL.y)}`,
    "Z",
  ].join(" ");
  const cx = shoulderC.x + yaw * b.shoulderW * 0.14;
  const neckW = b.neckW;
  const collarY = shoulderC.y - b.limbW * 0.1;
  const nt = r.neckTop;

  const neck = (
    <g>
      <path
        d={`M ${f(nt.x - neckW / 2)} ${f(nt.y - b.neck * 0.3)} L ${f(cx - neckW * 0.55)} ${f(collarY + b.limbW * 0.3)} L ${f(cx + neckW * 0.55)} ${f(collarY + b.limbW * 0.3)} L ${f(nt.x + neckW / 2)} ${f(nt.y - b.neck * 0.3)} Z`}
        fill={look.skin}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W}
        strokeLinejoin="round"
      />
      {/* тень под подбородком */}
      <path d={`M ${f(nt.x - neckW / 2)} ${f(nt.y - b.neck * 0.25)} Q ${f(nt.x)} ${f(nt.y + b.neck * 0.45)} ${f(nt.x + neckW / 2)} ${f(nt.y - b.neck * 0.25)} Z`} fill={look.skinShade} opacity={0.75} />
    </g>
  );

  // детали одежды на груди
  const chest: React.ReactNode[] = [];
  const shade = (
    <path
      key="shade"
      d={`M ${f(yaw > 0 ? hemL.x : hemR.x)} ${f(hemL.y)} Q ${f(yaw > 0 ? shL.x + b.limbW * 0.2 : shR.x - b.limbW * 0.2)} ${f((hemL.y + shL.y) / 2)} ${f(yaw > 0 ? shL.x + b.limbW * 0.3 : shR.x - b.limbW * 0.3)} ${f(shL.y + b.limbW * 0.6)} L ${f(cx + (yaw > 0 ? -1 : 1) * b.shoulderW * 0.22)} ${f(shL.y + b.limbW * 0.6)} Q ${f(cx + (yaw > 0 ? -1 : 1) * b.shoulderW * 0.3)} ${f(hip.y - b.torso * 0.4)} ${f(hip.x + (yaw > 0 ? -1 : 1) * hipW * 0.5)} ${f(hemL.y)} Z`}
      fill={look.topShade}
      opacity={0.55 * clamp(Math.abs(yaw) * 2 + 0.25)}
    />
  );
  chest.push(shade);
  if (look.top === "jacket" && look.coat) {
    // куртка на молнии, распахнута: под ней виден свитшот
    const v = b.torso * 0.95;
    chest.push(
      <path
        key="under"
        d={`M ${f(cx - neckW * 0.7)} ${f(collarY - 2)} L ${f(cx - neckW * 0.45)} ${f(collarY + v)} L ${f(cx + neckW * 0.45)} ${f(collarY + v)} L ${f(cx + neckW * 0.7)} ${f(collarY - 2)} Z`}
        fill={look.undershirt}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W}
        strokeLinejoin="round"
      />,
      <path key="zipL" d={`M ${f(cx - neckW * 0.62)} ${f(collarY)} L ${f(cx - neckW * 0.45)} ${f(hemL.y - 6)}`} stroke={look.topShade} strokeWidth={OUTLINE_W * 1.6} />,
      <path key="zipR" d={`M ${f(cx + neckW * 0.62)} ${f(collarY)} L ${f(cx + neckW * 0.45)} ${f(hemR.y - 6)}`} stroke={look.topShade} strokeWidth={OUTLINE_W * 1.6} />,
      <path
        key="collar"
        d={`M ${f(cx - neckW * 1.1)} ${f(collarY + 2)} Q ${f(cx)} ${f(collarY - b.limbW * 0.75)} ${f(cx + neckW * 1.1)} ${f(collarY + 2)} L ${f(cx + neckW * 0.7)} ${f(collarY + b.limbW * 0.25)} Q ${f(cx)} ${f(collarY - b.limbW * 0.25)} ${f(cx - neckW * 0.7)} ${f(collarY + b.limbW * 0.25)} Z`}
        fill={look.topShade}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W}
        strokeLinejoin="round"
      />,
    );
  } else if (look.top === "jacket") {
    // пиджак: белая рубашка, галстук, лацканы, две пуговицы
    const v = b.torso * 0.5;
    chest.push(
      <path
        key="shirt"
        d={`M ${f(cx - neckW * 0.8)} ${f(collarY - 2)} L ${f(cx)} ${f(collarY + v)} L ${f(cx + neckW * 0.8)} ${f(collarY - 2)} Z`}
        fill={look.undershirt}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W}
        strokeLinejoin="round"
      />,
      <path
        key="tie"
        d={`M ${f(cx - neckW * 0.12)} ${f(collarY + b.limbW * 0.35)} L ${f(cx + neckW * 0.12)} ${f(collarY + b.limbW * 0.35)} L ${f(cx + neckW * 0.2)} ${f(collarY + v * 0.92)} L ${f(cx)} ${f(collarY + v * 1.02)} L ${f(cx - neckW * 0.2)} ${f(collarY + v * 0.92)} Z`}
        fill={look.topAccent}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W * 0.8}
        strokeLinejoin="round"
      />,
      <path
        key="knot"
        d={`M ${f(cx - neckW * 0.17)} ${f(collarY + 2)} L ${f(cx + neckW * 0.17)} ${f(collarY + 2)} L ${f(cx + neckW * 0.11)} ${f(collarY + b.limbW * 0.42)} L ${f(cx - neckW * 0.11)} ${f(collarY + b.limbW * 0.42)} Z`}
        fill={look.topAccent}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W * 0.8}
        strokeLinejoin="round"
      />,
      <path
        key="lapL"
        d={`M ${f(cx - neckW * 0.8)} ${f(collarY - 3)} L ${f(cx - neckW * 0.05)} ${f(collarY + v * 1.12)} L ${f(cx - neckW * 0.62)} ${f(collarY + v * 0.62)} L ${f(cx - neckW * 1.22)} ${f(collarY + v * 0.42)} L ${f(cx - neckW * 0.98)} ${f(collarY + v * 0.28)} Z`}
        fill={look.topShade}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W}
        strokeLinejoin="round"
      />,
      <path
        key="lapR"
        d={`M ${f(cx + neckW * 0.8)} ${f(collarY - 3)} L ${f(cx + neckW * 0.05)} ${f(collarY + v * 1.12)} L ${f(cx + neckW * 0.62)} ${f(collarY + v * 0.62)} L ${f(cx + neckW * 1.22)} ${f(collarY + v * 0.42)} L ${f(cx + neckW * 0.98)} ${f(collarY + v * 0.28)} Z`}
        fill={look.topShade}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W}
        strokeLinejoin="round"
      />,
      <path key="front" d={`M ${f(cx)} ${f(collarY + v * 1.1)} L ${f(cx + yaw * 4 - 4)} ${f(hemL.y - 3)}`} stroke={OUTLINE} strokeWidth={OUTLINE_W} />,
      ...[0.68, 0.86].map((k) => <circle key={`btn${k}`} cx={f(cx + 8 + yaw * 4)} cy={f(collarY + b.torso * k)} r={4.5} fill="#1b2d52" stroke={OUTLINE} strokeWidth={1.2} />),
      <path
        key="pocket"
        d={`M ${f(cx + b.shoulderW * 0.2 + yaw * 6)} ${f(collarY + b.torso * 0.3)} l ${f(b.shoulderW * 0.15)} -2`}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W * 0.8}
        strokeLinecap="round"
      />,
      ...[-1, 1].map((sd) => (
        <path
          key={`flap${sd}`}
          d={`M ${f(cx + sd * b.shoulderW * 0.2 - (sd < 0 ? b.shoulderW * 0.15 : 0))} ${f(collarY + b.torso * 0.78)} l ${f(b.shoulderW * 0.15)} 0`}
          stroke={OUTLINE}
          strokeWidth={OUTLINE_W * 0.8}
          strokeLinecap="round"
        />
      )),
      <path
        key="collar"
        d={`M ${f(cx - neckW * 0.6)} ${f(collarY - 4)} L ${f(cx - neckW * 0.18)} ${f(collarY + b.limbW * 0.55)} L ${f(cx)} ${f(collarY + 2)} L ${f(cx + neckW * 0.18)} ${f(collarY + b.limbW * 0.55)} L ${f(cx + neckW * 0.6)} ${f(collarY - 4)} Z`}
        fill={look.undershirt}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W * 0.9}
        strokeLinejoin="round"
      />,
    );
  } else if (look.top === "shirt") {
    chest.push(
      <path key="placket" d={`M ${f(cx)} ${f(collarY + b.limbW * 0.4)} L ${f(cx + yaw * 3)} ${f(hemL.y - 3)}`} stroke={look.topShade} strokeWidth={OUTLINE_W * 1.2} />,
      ...[0.25, 0.45, 0.65, 0.85].map((k) => <circle key={`b${k}`} cx={f(cx + 5 + yaw * 3)} cy={f(collarY + b.torso * k)} r={3.4} fill={look.topAccent ?? "#eee"} stroke={OUTLINE} strokeWidth={1} />),
      <path
        key="collar"
        d={`M ${f(cx - neckW * 0.75)} ${f(collarY - 6)} L ${f(cx - neckW * 0.1)} ${f(collarY + b.limbW * 0.8)} L ${f(cx)} ${f(collarY + 4)} L ${f(cx + neckW * 0.1)} ${f(collarY + b.limbW * 0.8)} L ${f(cx + neckW * 0.75)} ${f(collarY - 6)} Z`}
        fill={look.topColor}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W}
        strokeLinejoin="round"
      />,

    );
  } else {
    // круглый ворот: футболка, свитшот, лонгслив, худи, платье
    const rib = look.top === "sweatshirt" || look.top === "hoodie" ? (look.topAccent ?? look.topShade) : look.top === "tshirt" ? (look.topAccent ?? look.topShade) : look.topShade;
    if (look.top === "hoodie") {
      chest.push(
        <path
          key="hood"
          d={`M ${f(cx - neckW * 1.2)} ${f(collarY + 4)} Q ${f(cx)} ${f(collarY - b.limbW * 0.9)} ${f(cx + neckW * 1.2)} ${f(collarY + 4)} Q ${f(cx)} ${f(collarY + b.limbW * 0.8)} ${f(cx - neckW * 1.2)} ${f(collarY + 4)} Z`}
          fill={look.topShade}
          stroke={OUTLINE}
          strokeWidth={OUTLINE_W}
        />,
        <path key="str" d={`M ${f(cx - 8)} ${f(collarY + 10)} v ${f(b.torso * 0.25)} M ${f(cx + 8)} ${f(collarY + 10)} v ${f(b.torso * 0.22)}`} stroke="#eee" strokeWidth={3} strokeLinecap="round" />,
      );
    }
    chest.push(
      <path
        key="neckline"
        d={`M ${f(cx - neckW * 0.72)} ${f(collarY - 2)} Q ${f(cx)} ${f(collarY + b.limbW * 0.75)} ${f(cx + neckW * 0.72)} ${f(collarY - 2)}`}
        fill="none"
        stroke={rib}
        strokeWidth={b.limbW * 0.22}
        strokeLinecap="round"
      />,
    );
    if (look.top === "sweatshirt") {
      chest.push(<path key="hem" d={`M ${f(hemL.x + 4)} ${f(hemL.y - b.limbW * 0.3)} Q ${f(hip.x)} ${f(hemL.y - b.limbW * 0.18)} ${f(hemR.x - 4)} ${f(hemR.y - b.limbW * 0.3)}`} fill="none" stroke={look.topShade} strokeWidth={OUTLINE_W * 1.2} />);
    }
    if (look.top === "tshirt" && look.key === "yusuf") {
      // простая аппликация — оранжевое солнышко без надписей
      const px = cx - b.shoulderW * 0.1;
      const py = collarY + b.torso * 0.42;
      chest.push(
        <g key="print">
          <circle cx={f(px)} cy={f(py)} r={b.torso * 0.09} fill="#e48a3c" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const r1 = b.torso * 0.13;
            const r2 = b.torso * 0.17;
            return <line key={i} x1={f(px + Math.cos(a) * r1)} y1={f(py + Math.sin(a) * r1)} x2={f(px + Math.cos(a) * r2)} y2={f(py + Math.sin(a) * r2)} stroke="#e48a3c" strokeWidth={4} strokeLinecap="round" />;
          })}
        </g>,
      );
    } else if (look.topAccent && look.top === "longsleeve") {
      chest.push(<path key="stripe" d={`M ${f(shL.x + 6)} ${f(collarY + b.torso * 0.35)} L ${f(shR.x - 6)} ${f(collarY + b.torso * 0.35)}`} stroke={look.topAccent} strokeWidth={b.torso * 0.08} />);
    }
  }

  // ---------- Руки ----------
  const armEl = (side: "L" | "R") => {
    const a = side === "L" ? pose.armL : pose.armR;
    const g = r.arms[side];
    const sleeveColor = look.topColor;
    const w1 = b.limbW;
    const w2 = b.limbW * 0.86;
    // большой палец: смотрит к корпусу при опущенной руке
    const thumb = (side === "L" ? 1 : -1) * (a.palm ? -1 : 1);
    const handRot = a.handAbs !== undefined ? a.handAbs : g.a2 + a.handRot;
    const parts: React.ReactNode[] = [];
    if (longSleeve) {
      parts.push(seg(g.E, g.W, w2 * 1.04, sleeveColor, "fore"), seg(g.S, g.E, w1 * 1.05, sleeveColor, "upper"), fillSeg(g.E, g.W, w2 * 1.04, sleeveColor));
      const cuffA = along(g.W, g.a2 + 180, b.foreArm * 0.12);
      parts.push(
        <line key="cuff" x1={f(cuffA.x)} y1={f(cuffA.y)} x2={f(g.W.x)} y2={f(g.W.y)} stroke={look.top === "jacket" ? look.undershirt : (look.topAccent ?? look.topShade)} strokeWidth={f(w2 * 0.98)} />,
      );
    } else {
      const sleeveEnd = along(g.S, g.a1, b.upperArm * 0.55);
      parts.push(seg(g.E, g.W, w2 * 0.92, look.skin, "fore"), seg(g.S, g.E, w1 * 0.92, look.skin, "upper"), fillSeg(g.E, g.W, w2 * 0.92, look.skin));
      parts.push(seg(g.S, sleeveEnd, w1 * 1.3, sleeveColor, "sleeve"));
      const band = along(g.S, g.a1, b.upperArm * 0.47);
      parts.push(<line key="band" x1={f(band.x)} y1={f(band.y)} x2={f(sleeveEnd.x)} y2={f(sleeveEnd.y)} stroke={look.topAccent ?? look.topShade} strokeWidth={f(w1 * 1.3)} />);
    }
    // плечо скруглено тканью
    parts.push(<circle key="sh" cx={f(g.S.x)} cy={f(g.S.y + w1 * 0.08)} r={f(w1 * 0.52)} fill={sleeveColor} />);
    const hold = side === "L" ? holdL : holdR;
    return (
      <g key={`arm${side}`}>
        {parts}
        {hold ? <g transform={`translate(${f(g.W.x)} ${f(g.W.y)})`}>{hold}</g> : null}
        <g transform={`translate(${f(g.W.x)} ${f(g.W.y)}) rotate(${f(-handRot)})`}>
          <HandGlyph shape={a.hand} L={b.hand} skin={look.skin} shade={look.skinShade} thumb={thumb} />
        </g>
      </g>
    );
  };

  // какая рука ближе к зрителю
  const nearSide: "L" | "R" = yaw >= 0 ? "L" : "R";
  const farSide: "L" | "R" = nearSide === "L" ? "R" : "L";
  const armInFront = (s: "L" | "R") => (s === "L" ? pose.armL.front : pose.armR.front) ?? s === nearSide;
  const behind = (["L", "R"] as const).filter((s) => !armInFront(s)).sort((a) => (a === farSide ? -1 : 1));
  const inFront = (["L", "R"] as const).filter((s) => armInFront(s)).sort((a) => (a === farSide ? -1 : 1));

  const hm = headMetrics(look);
  const sx = scale;
  if (layer === "arms") {
    const order = [...behind, ...inFront].filter((s) => layerArms.includes(s));
    return (
      <g transform={`translate(${f(x)} ${f(y)}) scale(${f(sx)})`} opacity={opacity}>
        {order.map((s) => armEl(s))}
      </g>
    );
  }
  const shown = (s: "L" | "R") => layer !== "body" || !layerArms.includes(s);
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(sx)})`} opacity={opacity}>
      {shadow ? (
        <ellipse
          cx={f(hip.x)}
          cy={0}
          rx={f(pose.legsFront ? b.thigh * 1.25 : b.hipW * 0.8)}
          ry={f(pose.legsFront ? b.thigh * 0.22 : b.hipW * 0.14)}
          fill="#5a3b2c"
          opacity={0.2}
        />
      ) : null}
      {!pose.legsFront ? legs : null}
      {behind.filter(shown).map((s) => armEl(s))}
      {neck}
      <path d={torsoD} fill={look.topColor} stroke={OUTLINE} strokeWidth={OUTLINE_W} strokeLinejoin="round" />
      {chestLean ? (
        <>
          {/* боковая тень — только в пределах силуэта корпуса */}
          <clipPath id={`${uid}-torso`}>
            <path d={torsoD} />
          </clipPath>
          <g clipPath={`url(#${uid}-torso)`}>{chest[0]}</g>
          <g transform={Math.abs(pose.lean) > 0.01 ? `rotate(${f(-pose.lean)} ${f(cx)} ${f(collarY)})` : undefined}>{chest.slice(1)}</g>
        </>
      ) : (
        chest
      )}
      {pose.legsFront ? legs : null}
      <g transform={`translate(${f(r.headC.x)} ${f(r.headC.y)}) rotate(${f(-pose.headTilt)} 0 ${f(hm.neckY)})`}>
        <Head look={look} yaw={pose.headYaw} pitch={pose.headPitch} face={face} uid={uid} />
      </g>
      {inFront.filter(shown).map((s) => armEl(s))}
    </g>
  );
};
