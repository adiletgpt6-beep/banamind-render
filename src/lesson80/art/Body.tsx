// Тела персонажей 80-1-14: дети сидят на ковре (скрестив ноги), учитель —
// на подушке или стоя. Руки — двухзвенный IK (плечо → локоть → кисть):
// кисть всегда соединена с предплечьем и попадает в заданную точку.
import React from "react";
import { Head, MOUTH_REST, shade, type MouthState } from "./Head";
import { kidDims, type Kid } from "../cast";

export type HandType = "rest" | "grip" | "point" | "pencil" | "flat" | "pinch" | "marker";
export type HandTarget = {
  readonly x: number; // локальные координаты фигуры (0,0 — точка посадки на полу)
  readonly y: number;
  readonly type: HandType;
  readonly angle?: number; // градусы, направление пальцев/карандаша
  readonly pencilColor?: string;
};

export type FacePose = {
  turn: number;
  gazeX: number;
  gazeY: number;
  blink: number;
  brow: number;
  mouth: MouthState;
  tilt: number; // наклон головы, градусы
};

export const FACE_REST: FacePose = { turn: 0, gazeX: 0, gazeY: 0, blink: 0, brow: 0, mouth: MOUTH_REST, tilt: 0 };

export type BodyPose = {
  readonly face: FacePose;
  readonly lean: number; // наклон корпуса вперёд/в сторону: смещение плеч по x (лок. ед.)
  readonly dip: number; // опускание корпуса (наклон к столу), лок. ед.
  readonly breath: number; // −1 … 1
  readonly handL?: HandTarget; // рука с левой стороны кадра
  readonly handR?: HandTarget;
};

const LINE = "#5A3B2A";

// ---------- IK ----------
export const solveArm = (sx: number, sy: number, tx: number, ty: number, a: number, b: number, bendOut: number) => {
  let dx = tx - sx;
  let dy = ty - sy;
  let d = Math.hypot(dx, dy);
  const max = (a + b) * 0.995;
  const min = Math.abs(a - b) + 1;
  if (d > max) {
    dx *= max / d;
    dy *= max / d;
    d = max;
  }
  if (d < min) {
    const k = min / Math.max(d, 0.001);
    dx *= k;
    dy *= k;
    d = min;
  }
  const base = Math.atan2(dy, dx);
  const cosA = (a * a + d * d - b * b) / (2 * a * d);
  const ang = Math.acos(Math.max(-1, Math.min(1, cosA)));
  // bendOut: +1 — локоть в сторону +x/вниз; выбирается решение с локтем ниже
  const e1 = { x: sx + a * Math.cos(base + ang), y: sy + a * Math.sin(base + ang) };
  const e2 = { x: sx + a * Math.cos(base - ang), y: sy + a * Math.sin(base - ang) };
  const score = (e: { x: number; y: number }) => e.y + bendOut * (e.x - sx) * 0.25;
  const elbow = score(e1) > score(e2) ? e1 : e2;
  return { elbow, hand: { x: sx + dx, y: sy + dy } };
};

// ---------- Кисть ----------
export const Hand: React.FC<{ x: number; y: number; r: number; type: HandType; angle: number; skin: string; pencilColor?: string; flip?: boolean }> = ({
  x,
  y,
  r,
  type,
  angle,
  skin,
  pencilColor,
  flip,
}) => {
  const dark = shade(skin, 0.8);
  const f = flip ? -1 : 1;
  if (type === "pencil" || type === "marker") {
    // кончик в (x, y); карандаш идёт вверх-назад под углом angle
    const a = ((angle ?? -110) * Math.PI) / 180;
    const len = r * (type === "marker" ? 4.2 : 4.6);
    const ex = x + Math.cos(a) * len;
    const ey = y + Math.sin(a) * len;
    const hx = x + Math.cos(a) * r * 1.6;
    const hy = y + Math.sin(a) * r * 1.6;
    const pw = r * (type === "marker" ? 0.62 : 0.36);
    const col = pencilColor ?? "#3A6FB5";
    return (
      <g>
        <line x1={x + Math.cos(a) * r * 0.45} y1={y + Math.sin(a) * r * 0.45} x2={ex} y2={ey} stroke={type === "marker" ? "#2E3440" : col} strokeWidth={pw} strokeLinecap="round" />
        {type === "pencil" ? (
          <>
            <line x1={x} y1={y} x2={x + Math.cos(a) * r * 0.75} y2={y + Math.sin(a) * r * 0.75} stroke="#E9C896" strokeWidth={pw * 0.9} strokeLinecap="round" />
            <circle cx={x} cy={y} r={pw * 0.32} fill={col} />
          </>
        ) : (
          <circle cx={x} cy={y} r={pw * 0.4} fill="#1E2430" />
        )}
        <ellipse cx={hx} cy={hy} rx={r * 1.0} ry={r * 0.82} fill={skin} transform={`rotate(${(a * 180) / Math.PI} ${hx} ${hy})`} />
        <ellipse cx={hx + Math.cos(a + 1.6) * r * 0.55} cy={hy + Math.sin(a + 1.6) * r * 0.55} rx={r * 0.42} ry={r * 0.3} fill={dark} opacity={0.5} />
      </g>
    );
  }
  if (type === "point") {
    const a = ((angle ?? 0) * Math.PI) / 180;
    // (x, y) — кончик указательного пальца
    const bx = x - Math.cos(a) * r * 1.5;
    const by = y - Math.sin(a) * r * 1.5;
    return (
      <g>
        <line x1={bx} y1={by} x2={x} y2={y} stroke={skin} strokeWidth={r * 0.55} strokeLinecap="round" />
        <circle cx={bx - Math.cos(a) * r * 0.45} cy={by - Math.sin(a) * r * 0.45} r={r * 0.85} fill={skin} />
        <path d={`M ${bx - Math.cos(a) * r * 0.2} ${by - Math.sin(a) * r * 0.2} l ${Math.cos(a + 1.57) * r * 0.5} ${Math.sin(a + 1.57) * r * 0.5}`} stroke={dark} strokeWidth={r * 0.12} strokeLinecap="round" />
      </g>
    );
  }
  if (type === "grip") {
    // кисть обхватывает сбоку вертикальный предмет; (x, y) — центр ладони
    return (
      <g>
        <rect x={x - r * 0.85} y={y - r * 0.95} width={r * 1.7} height={r * 1.75} rx={r * 0.75} fill={skin} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${x - r * 0.6 * f} ${y - r * 0.45 + i * r * 0.48} h ${r * 1.0 * f}`} stroke={dark} strokeWidth={r * 0.1} strokeLinecap="round" opacity={0.7} />
        ))}
        <ellipse cx={x - r * 0.75 * f} cy={y - r * 0.55} rx={r * 0.32} ry={r * 0.45} fill={skin} stroke={dark} strokeWidth={r * 0.06} />
      </g>
    );
  }
  if (type === "pinch") {
    return (
      <g>
        <ellipse cx={x} cy={y} rx={r * 0.95} ry={r * 0.8} fill={skin} />
        <ellipse cx={x + r * 0.55 * f} cy={y - r * 0.5} rx={r * 0.4} ry={r * 0.28} fill={skin} stroke={dark} strokeWidth={r * 0.06} />
      </g>
    );
  }
  if (type === "flat") {
    const a = ((angle ?? -90) * Math.PI) / 180;
    return (
      <g transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`}>
        <rect x={x - r * 0.8} y={y - r * 1.25} width={r * 1.6} height={r * 1.9} rx={r * 0.7} fill={skin} />
        <ellipse cx={x - r * 0.85 * f} cy={y + r * 0.1} rx={r * 0.3} ry={r * 0.55} fill={skin} transform={`rotate(${-25 * f} ${x - r * 0.85 * f} ${y + r * 0.1})`} />
        <path d={`M ${x - r * 0.25} ${y - r * 1.0} v ${r * 0.6} M ${x + r * 0.25} ${y - r * 1.0} v ${r * 0.6}`} stroke={dark} strokeWidth={r * 0.08} opacity={0.6} />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r * 1.0} ry={r * 0.85} fill={skin} />
      <ellipse cx={x + r * 0.5 * f} cy={y - r * 0.35} rx={r * 0.35} ry={r * 0.28} fill={dark} opacity={0.35} />
    </g>
  );
};

// ---------- Рука целиком ----------
export const Arm: React.FC<{
  sx: number;
  sy: number;
  target: HandTarget;
  upper: number;
  fore: number;
  hand: number;
  widthU: number;
  widthF: number;
  sleeve: string;
  sleeveLen: "short" | "long" | "suit";
  skin: string;
  bendOut: number;
  cuff?: string;
}> = ({ sx, sy, target, upper, fore, hand, widthU, widthF, sleeve, sleeveLen, skin, bendOut, cuff }) => {
  // точка запястья: для карандаша/указки кисть стоит позади кончика
  let wx = target.x;
  let wy = target.y;
  if (target.type === "pencil" || target.type === "marker") {
    const a = ((target.angle ?? -110) * Math.PI) / 180;
    wx += Math.cos(a) * hand * 2.6;
    wy += Math.sin(a) * hand * 2.6;
  } else if (target.type === "point") {
    const a = ((target.angle ?? 0) * Math.PI) / 180;
    wx -= Math.cos(a) * hand * 2.3;
    wy -= Math.sin(a) * hand * 2.3;
  }
  const { elbow, hand: w } = solveArm(sx, sy, wx, wy, upper, fore, bendOut);
  // если кисть не дотянулась, сдвигаем и рисованную точку
  const offX = w.x - wx;
  const offY = w.y - wy;
  const tx = target.x + offX;
  const ty = target.y + offY;
  const sleeveCol = sleeve;
  const foreCol = sleeveLen === "short" ? skin : sleeveCol;
  const midU = { x: sx + (elbow.x - sx) * 0.62, y: sy + (elbow.y - sy) * 0.62 };
  const handX = target.type === "pencil" || target.type === "marker" || target.type === "point" ? tx : w.x;
  const handY = target.type === "pencil" || target.type === "marker" || target.type === "point" ? ty : w.y;
  return (
    <g>
      {sleeveLen === "short" ? (
        <>
          <line x1={sx} y1={sy} x2={elbow.x} y2={elbow.y} stroke={skin} strokeWidth={widthU * 0.82} strokeLinecap="round" />
          <line x1={sx} y1={sy} x2={midU.x} y2={midU.y} stroke={sleeveCol} strokeWidth={widthU * 1.08} strokeLinecap="round" />
        </>
      ) : (
        <line x1={sx} y1={sy} x2={elbow.x} y2={elbow.y} stroke={sleeveCol} strokeWidth={widthU} strokeLinecap="round" />
      )}
      <line x1={elbow.x} y1={elbow.y} x2={w.x} y2={w.y} stroke={foreCol} strokeWidth={widthF} strokeLinecap="round" />
      {cuff ? (
        <line
          x1={w.x + (elbow.x - w.x) * 0.12}
          y1={w.y + (elbow.y - w.y) * 0.12}
          x2={w.x + (elbow.x - w.x) * 0.02}
          y2={w.y + (elbow.y - w.y) * 0.02}
          stroke={cuff}
          strokeWidth={widthF * 0.95}
          strokeLinecap="butt"
        />
      ) : null}
      <Hand x={handX} y={handY} r={hand} type={target.type} angle={target.angle ?? (target.type === "pencil" ? -110 : 0)} skin={skin} pencilColor={target.pencilColor} flip={bendOut < 0} />
    </g>
  );
};

// ---------- Ребёнок ----------
export const kidGeometry = (k: Kid) => {
  const d = kidDims(k.age);
  const legH = d.seated * 0.16;
  const shoulderY = -(d.seated - d.headH * 0.92);
  const headCY = -(d.seated - d.headH / 2);
  return { ...d, legH, shoulderY, headCY };
};

// Точки плеч в локальных координатах (с учётом наклона корпуса).
export const kidShoulders = (k: Kid, pose: BodyPose) => {
  const g = kidGeometry(k);
  const sy = g.shoulderY + g.headH * 0.12 + pose.dip;
  return {
    L: { x: -g.shoulderW / 2 + pose.lean + g.shoulderW * 0.1, y: sy },
    R: { x: g.shoulderW / 2 + pose.lean - g.shoulderW * 0.1, y: sy },
  };
};

export const kidRestHands = (k: Kid): { L: HandTarget; R: HandTarget } => {
  const g = kidGeometry(k);
  return {
    L: { x: -g.shoulderW * 0.46, y: -g.legH * 0.62, type: "rest" },
    R: { x: g.shoulderW * 0.46, y: -g.legH * 0.62, type: "rest" },
  };
};

const Torso: React.FC<{ k: Kid; pose: BodyPose }> = ({ k, pose }) => {
  const g = kidGeometry(k);
  const sw = g.shoulderW;
  const hipY = -g.legH * 0.55;
  const shY = g.shoulderY + g.headH * 0.05 + pose.dip;
  const lx = pose.lean;
  const br = 1 + pose.breath * 0.012;
  const d = `M ${-sw * 0.46} ${hipY}
    C ${-sw * 0.52} ${(hipY + shY) / 2} ${-sw * 0.56 + lx} ${shY + g.headH * 0.2} ${-sw * 0.44 + lx} ${shY + g.headH * 0.06}
    Q ${-sw * 0.3 + lx} ${shY - g.headH * 0.02} ${lx} ${shY - g.headH * 0.03}
    Q ${sw * 0.3 + lx} ${shY - g.headH * 0.02} ${sw * 0.44 + lx} ${shY + g.headH * 0.06}
    C ${sw * 0.56 + lx} ${shY + g.headH * 0.2} ${sw * 0.52} ${(hipY + shY) / 2} ${sw * 0.46} ${hipY} Z`;
  const clip = `torso-${k.id}`;
  const neckW = g.headW * 0.26;
  return (
    <g transform={`translate(0 ${hipY}) scale(1 ${br}) translate(0 ${-hipY})`}>
      <clipPath id={clip}>
        <path d={d} />
      </clipPath>
      {k.topStyle === "hoodie" ? <ellipse cx={lx} cy={shY + g.headH * 0.02} rx={sw * 0.3} ry={g.headH * 0.14} fill={shade(k.top, 0.82)} /> : null}
      <path d={d} fill={k.top} />
      <g clipPath={`url(#${clip})`}>
        {/* свет из окна слева: правая сторона в мягкой тени */}
        <ellipse cx={sw * 0.5 + lx} cy={(shY + hipY) / 2} rx={sw * 0.36} ry={(hipY - shY) * 0.75} fill={shade(k.top, 0.78)} opacity={0.32} />
        {k.topStyle === "stripes"
          ? Array.from({ length: 7 }, (_, i) => (
              <rect key={i} x={-sw} y={shY + g.headH * 0.18 + i * (-(shY - hipY) / 7)} width={sw * 2} height={(-(shY - hipY) / 7) * 0.42} fill={k.topAccent} opacity={0.85} />
            ))
          : null}
        {k.topStyle === "hoodie" ? (
          <>
            <path d={`M ${-sw * 0.22} ${hipY + 2} q ${sw * 0.22} ${-g.headH * 0.32} ${sw * 0.44} 0`} fill={k.topAccent} opacity={0.7} />
            <line x1={lx - sw * 0.07} y1={shY + g.headH * 0.06} x2={lx - sw * 0.08} y2={shY + g.headH * 0.36} stroke="#F2F2F2" strokeWidth={sw * 0.018} strokeLinecap="round" />
            <line x1={lx + sw * 0.07} y1={shY + g.headH * 0.06} x2={lx + sw * 0.08} y2={shY + g.headH * 0.36} stroke="#F2F2F2" strokeWidth={sw * 0.018} strokeLinecap="round" />
          </>
        ) : null}
        {k.topStyle === "vest" ? (
          <>
            <path d={`M ${lx - sw * 0.16} ${shY} L ${lx} ${shY + g.headH * 0.45} L ${lx + sw * 0.16} ${shY} Z`} fill={k.topAccent} />
            <rect x={lx - sw * 0.04} y={shY} width={sw * 0.08} height={-(shY - hipY)} fill={k.topAccent} opacity={0.5} />
          </>
        ) : null}
        {k.topStyle === "shirt" || k.topStyle === "polo" ? (
          <>
            <line x1={lx} y1={shY + g.headH * 0.08} x2={lx * 0.5} y2={hipY} stroke={k.topAccent} strokeWidth={sw * 0.02} />
            {[0, 1, 2].slice(0, k.topStyle === "polo" ? 2 : 3).map((i) => (
              <circle key={i} cx={lx * (1 - i * 0.15)} cy={shY + g.headH * (0.16 + i * 0.22)} r={sw * 0.018} fill="#F7F3EA" />
            ))}
          </>
        ) : null}
      </g>
      {/* шея */}
      <rect x={lx - neckW / 2} y={shY - g.headH * 0.16} width={neckW} height={g.headH * 0.2} rx={neckW * 0.3} fill={shade(k.skin, 0.9)} />
      {k.topStyle === "shirt" || k.topStyle === "polo" ? (
        <>
          <path d={`M ${lx - neckW * 0.75} ${shY - g.headH * 0.03} L ${lx} ${shY + g.headH * 0.1} L ${lx - neckW * 1.4} ${shY + g.headH * 0.1} Z`} fill={k.topAccent} />
          <path d={`M ${lx + neckW * 0.75} ${shY - g.headH * 0.03} L ${lx} ${shY + g.headH * 0.1} L ${lx + neckW * 1.4} ${shY + g.headH * 0.1} Z`} fill={k.topAccent} />
        </>
      ) : (
        <path d={`M ${lx - neckW * 0.75} ${shY - g.headH * 0.02} Q ${lx} ${shY + g.headH * 0.08} ${lx + neckW * 0.75} ${shY - g.headH * 0.02}`} stroke={k.topAccent} strokeWidth={sw * 0.03} fill="none" />
      )}
    </g>
  );
};

const Legs: React.FC<{ k: Kid }> = ({ k }) => {
  const g = kidGeometry(k);
  const lw = g.shoulderW * 0.82;
  const h = g.legH;
  return (
    <g>
      <ellipse cx={0} cy={-h * 0.08} rx={lw * 1.12} ry={h * 0.28} fill="rgba(70,45,30,0.16)" />
      <path
        d={`M ${-lw} ${-h * 0.15} C ${-lw * 1.08} ${-h * 0.8} ${-lw * 0.5} ${-h * 1.05} 0 ${-h * 0.75} C ${lw * 0.5} ${-h * 1.05} ${lw * 1.08} ${-h * 0.8} ${lw} ${-h * 0.15} C ${lw * 0.6} ${h * 0.12} ${-lw * 0.6} ${h * 0.12} ${-lw} ${-h * 0.15} Z`}
        fill={k.pants}
      />
      <path d={`M ${-lw * 0.15} ${-h * 0.62} Q 0 ${-h * 0.3} ${lw * 0.2} ${-h * 0.05}`} stroke={shade(k.pants, 0.75)} strokeWidth={lw * 0.025} fill="none" />
      {/* стопы в носках: без уличной обуви */}
      <ellipse cx={-lw * 0.33} cy={-h * 0.12} rx={lw * 0.2} ry={h * 0.17} fill={k.socks} stroke={shade(k.socks, 0.82)} strokeWidth={lw * 0.012} />
      <ellipse cx={lw * 0.36} cy={-h * 0.1} rx={lw * 0.2} ry={h * 0.17} fill={k.socks} stroke={shade(k.socks, 0.82)} strokeWidth={lw * 0.012} />
    </g>
  );
};

const sleeveOf = (k: Kid): "short" | "long" => (k.topStyle === "tee" || k.topStyle === "polo" || k.topStyle === "stripes" ? "short" : "long");

// Слои: body — ноги, корпус, голова; arms — руки поверх стола.
export const KidFigure: React.FC<{ k: Kid; pose: BodyPose; layer: "body" | "arms" | "all"; hideLegs?: boolean }> = ({ k, pose, layer, hideLegs }) => {
  const g = kidGeometry(k);
  const sh = kidShoulders(k, pose);
  const rest = kidRestHands(k);
  const hL = pose.handL ?? rest.L;
  const hR = pose.handR ?? rest.R;
  const sleeve = k.topStyle === "vest" ? "#F1ECE0" : k.top;
  const armProps = {
    upper: g.upper,
    fore: g.fore,
    hand: g.hand,
    widthU: g.shoulderW * 0.25,
    widthF: g.shoulderW * 0.21,
    sleeve,
    sleeveLen: sleeveOf(k),
    skin: k.skin,
  };
  const head = (
    <g transform={`translate(${pose.lean * 1.1 + pose.face.turn * g.headW * 0.04} ${g.headCY + pose.dip * 1.05}) rotate(${pose.face.tilt})`}>
      <Head
        w={g.headW}
        h={g.headH}
        skin={k.skin}
        hair={k.hair}
        hairStyle={k.hairStyle}
        turn={pose.face.turn}
        gazeX={pose.face.gazeX}
        gazeY={pose.face.gazeY}
        blink={pose.face.blink}
        brow={pose.face.brow}
        mouth={pose.face.mouth}
        uid={k.id}
      />
    </g>
  );
  const arms = (
    <g>
      <Arm sx={sh.L.x} sy={sh.L.y} target={hL} bendOut={-1} {...armProps} />
      <Arm sx={sh.R.x} sy={sh.R.y} target={hR} bendOut={1} {...armProps} />
    </g>
  );
  return (
    <g>
      {layer !== "arms" ? (
        <>
          {hideLegs ? null : <Legs k={k} />}
          <Torso k={k} pose={pose} />
          {head}
        </>
      ) : null}
      {layer !== "body" ? arms : null}
    </g>
  );
};

// ---------- Учитель ----------
export type TeacherLook = {
  readonly skin: string;
  readonly hair: string;
  readonly beard: string;
  readonly suit: string;
  readonly suitDark: string;
  readonly shirt: string;
  readonly cap: string;
};

export const TEACHER_DIMS = {
  headW: 74,
  headH: 92,
  shoulderW: 150,
  upper: 150,
  fore: 140,
  hand: 15,
  seated: 400, // от пола до макушки (сидя на подушке)
  standing: 640,
};

export const teacherShoulders = (standing: boolean, pose: BodyPose) => {
  const D = TEACHER_DIMS;
  const top = standing ? D.standing : D.seated;
  const sy = -(top - D.headH * 1.02) + pose.dip;
  return {
    L: { x: -D.shoulderW / 2 + 10 + pose.lean, y: sy },
    R: { x: D.shoulderW / 2 - 10 + pose.lean, y: sy },
  };
};

export const TeacherFigure: React.FC<{ look: TeacherLook; pose: BodyPose; standing: boolean; layer: "body" | "arms" | "all"; step?: number }> = ({
  look,
  pose,
  standing,
  layer,
  step = 0,
}) => {
  const D = TEACHER_DIMS;
  const top = standing ? D.standing : D.seated;
  const headCY = -(top - D.headH / 2) + pose.dip * 1.05;
  const shY = -(top - D.headH * 1.02) + pose.dip;
  const hipY = standing ? -330 : -70;
  const lx = pose.lean;
  const sw = D.shoulderW;
  const sh = teacherShoulders(standing, pose);
  const br = 1 + pose.breath * 0.01;
  const rest: { L: HandTarget; R: HandTarget } = standing
    ? { L: { x: -84, y: -262, type: "rest" }, R: { x: 84, y: -262, type: "rest" } }
    : { L: { x: -sw * 0.45, y: -90, type: "rest" }, R: { x: sw * 0.5, y: -92, type: "rest" } };
  const hL = pose.handL ?? rest.L;
  const hR = pose.handR ?? rest.R;
  const jacket = `M ${-sw * 0.5} ${hipY + (standing ? 40 : 0)}
    C ${-sw * 0.56} ${(hipY + shY) / 2} ${-sw * 0.6 + lx} ${shY + 30} ${-sw * 0.47 + lx} ${shY + 6}
    Q ${-sw * 0.3 + lx} ${shY - 6} ${lx} ${shY - 6}
    Q ${sw * 0.3 + lx} ${shY - 6} ${sw * 0.47 + lx} ${shY + 6}
    C ${sw * 0.6 + lx} ${shY + 30} ${sw * 0.56} ${(hipY + shY) / 2} ${sw * 0.5} ${hipY + (standing ? 40 : 0)} Z`;
  const armProps = {
    upper: D.upper,
    fore: D.fore,
    hand: D.hand,
    widthU: 36,
    widthF: 30,
    sleeve: look.suit,
    sleeveLen: "suit" as const,
    skin: look.skin,
    cuff: look.shirt,
  };
  const legs = standing ? (
    <g>
      <ellipse cx={0} cy={0} rx={95} ry={16} fill="rgba(70,45,30,0.18)" />
      {/* ноги; step — небольшой шаг в сторону (0…1) */}
      {[-1, 1].map((sgn) => {
        const lift = sgn < 0 ? Math.sin(Math.PI * Math.min(1, step * 2)) * 14 : Math.sin(Math.PI * Math.max(0, step * 2 - 1)) * 14;
        return (
          <g key={sgn}>
            <path d={`M ${sgn * 14 - 22} ${hipY + 30} L ${sgn * 30 - 20} ${-18 - lift} L ${sgn * 30 + 18} ${-18 - lift} L ${sgn * 14 + 22} ${hipY + 30} Z`} fill={look.suitDark} />
            <ellipse cx={sgn * 32} cy={-10 - lift} rx={30} ry={13} fill="#3B3F4A" />
          </g>
        );
      })}
    </g>
  ) : (
    <g>
      {/* подушка и скрещённые ноги */}
      <ellipse cx={0} cy={-14} rx={170} ry={30} fill="#B9774F" />
      <ellipse cx={0} cy={-24} rx={160} ry={24} fill="#D08A5C" />
      <path d={`M -150 -40 C -165 -110 -70 -120 0 -95 C 70 -120 165 -110 150 -40 C 90 -12 -90 -12 -150 -40 Z`} fill={look.suitDark} />
      <path d="M -30 -92 Q 0 -60 40 -40" stroke={shade(look.suitDark, 0.8)} strokeWidth={4} fill="none" />
      <ellipse cx={-62} cy={-44} rx={30} ry={14} fill="#3B3F4A" />
      <ellipse cx={66} cy={-42} rx={30} ry={14} fill="#3B3F4A" />
    </g>
  );
  const body = (
    <g>
      {legs}
      <g transform={`translate(0 ${hipY}) scale(1 ${br}) translate(0 ${-hipY})`}>
        <clipPath id={`jacket-${standing ? "s" : "t"}`}>
          <path d={jacket} />
        </clipPath>
        <path d={jacket} fill={look.suit} />
        <g clipPath={`url(#jacket-${standing ? "s" : "t"})`}>
          <ellipse cx={sw * 0.55 + lx} cy={(shY + hipY) / 2} rx={sw * 0.42} ry={-(shY - hipY) * 0.7} fill={look.suitDark} opacity={0.3} />
        </g>
        <path d={jacket} fill="none" stroke={look.suitDark} strokeWidth={3} opacity={0.5} />
        {/* рубашка и лацканы */}
        <path d={`M ${lx - 26} ${shY - 4} L ${lx} ${shY + 92} L ${lx + 26} ${shY - 4} Z`} fill={look.shirt} />
        <path d={`M ${lx - 26} ${shY - 4} L ${lx - 4} ${shY + 96} L ${lx - 44} ${shY + 40} Z`} fill={look.suitDark} />
        <path d={`M ${lx + 26} ${shY - 4} L ${lx + 4} ${shY + 96} L ${lx + 44} ${shY + 40} Z`} fill={look.suitDark} />
        <circle cx={lx + 2} cy={shY + 120} r={4} fill="#1C2B4D" />
        <circle cx={lx + 2} cy={shY + 160} r={4} fill="#1C2B4D" />
        <rect x={lx - 13} y={shY - 22} width={26} height={24} rx={8} fill={shade(look.skin, 0.9)} />
        <path d={`M ${lx - 18} ${shY - 6} L ${lx} ${shY + 10} L ${lx + 18} ${shY - 6}`} stroke="#E6E3DA" strokeWidth={5} fill="none" />
      </g>
      <g transform={`translate(${lx * 1.1 + pose.face.turn * 3} ${headCY}) rotate(${pose.face.tilt})`}>
        <Head
          w={D.headW}
          h={D.headH}
          skin={look.skin}
          hair={look.hair}
          hairStyle="adult"
          turn={pose.face.turn}
          gazeX={pose.face.gazeX}
          gazeY={pose.face.gazeY}
          blink={pose.face.blink}
          brow={pose.face.brow}
          mouth={pose.face.mouth}
          adult
          beard={look.beard}
          cap={look.cap}
          uid="t01"
        />
      </g>
    </g>
  );
  const arms = (
    <g>
      <Arm sx={sh.L.x} sy={sh.L.y} target={hL} bendOut={-1} {...armProps} />
      <Arm sx={sh.R.x} sy={sh.R.y} target={hR} bendOut={1} {...armProps} />
    </g>
  );
  return (
    <g>
      {layer !== "arms" ? body : null}
      {layer !== "body" ? arms : null}
    </g>
  );
};

export { LINE };
export const FACE_MOUTH_REST = MOUTH_REST;
