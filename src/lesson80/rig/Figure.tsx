// Персонаж целиком по рассчитанной позе (единицы рисунка, ступни в y = 0).
// Части: ноги (бедро, голень, стопа) с коленом, корпус с одеждой, шея,
// голова, руки (плечо, предплечье, кисть) с предметами. Поворот корпуса
// сужает силуэт, дальняя рука уходит за корпус. Посадка на полу — ноги
// скрещены перед корпусом (учебная комната мечети: сидят на ковре).
//
// Расширения 80-1-9 (все по выбору, без них рисунок прежний байт в байт):
//   • look.rigStyle 2 — руки сужающимися формами, кисти стиля 2, у детей
//     шея короче (голова ниже на 13 % её высоты);
//   • pose.kneel — опускается на одно колено; вместе с floorSit — путь
//     «стоит → на колене → сидит на полу», стопы при этом не скользят;
//   • pose.chew / mouthFull — жевание (Head.tsx);
//   • arm.aim "grip" — цель задаёт точку захвата в кисти, а не запястье;
//   • figureAnchors — опорные точки ровно так, как их рисует Figure.
import { Head, headGeom } from "./Head";
import { Hand, hand2Grip } from "./Hand";
import { shadeOf, type Look } from "./looks";
import { clamp, deg, lerp, rad, smoothstep, type Vec } from "./motion";
import { REST, type ArmState, type HandShape, type Pose } from "./pose";

// Две кости (плечо–предплечье, бедро–голень) до цели. Сторона сгиба
// выбирается непрерывно: у границы выбора сустав проходит «к зрителю»
// (кость в проекции короче), а не перескакивает. Кисть/стопа всегда в цели.
export const twoBone = (root: Vec, target: Vec, l1: number, l2: number, pref: Vec, width = 0.14) => {
  let dx = target.x - root.x;
  let dy = target.y - root.y;
  let d = Math.hypot(dx, dy);
  const maxD = l1 + l2 - 1;
  if (d > maxD) {
    dx *= maxD / d;
    dy *= maxD / d;
    d = maxD;
  }
  const ux = d > 1e-6 ? dx / d : 0;
  const uy = d > 1e-6 ? dy / d : 1;
  d = Math.max(d, Math.abs(l1 - l2) + 2);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const sinA = Math.sqrt(1 - cosA * cosA);
  const bias = pref.x * uy - pref.y * ux;
  const bend = clamp(bias / width, -1, 1);
  const mid = {
    x: root.x + l1 * cosA * ux + bend * l1 * sinA * uy,
    y: root.y + l1 * cosA * uy - bend * l1 * sinA * ux,
  };
  return { mid, end: { x: root.x + ux * d, y: root.y + uy * d } };
};

const mixV = (a: Vec, b: Vec, t: number): Vec => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

// Поворот точки вокруг центра (градусы, как SVG rotate).
const rotAbout = (p: Vec, c: Vec, a: number): Vec => {
  if (!a) return p;
  const r = rad(a);
  const cs = Math.cos(r);
  const sn = Math.sin(r);
  return { x: c.x + (p.x - c.x) * cs - (p.y - c.y) * sn, y: c.y + (p.x - c.x) * sn + (p.y - c.y) * cs };
};

// Угол к диапазону (−180, 180].
const wrap180 = (a: number) => a - 360 * Math.ceil((a - 180) / 360);

// Смесь двух цветов #rrggbb.
const mixHex = (a: string, b: string, t: number) => {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const na = parseInt(a.slice(1), 16);
  const nb = parseInt(b.slice(1), 16);
  const ch = (sh: number) => Math.round(lerp((na >> sh) & 255, (nb >> sh) & 255, t));
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
};

// Сужающаяся форма между двумя кругами (r1 у A, r2 у B): касательные и дуги.
const taper = (A: Vec, B: Vec, r1: number, r2: number) => {
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const d = Math.max(1e-3, Math.hypot(dx, dy));
  const ux = dx / d;
  const uy = dy / d;
  const nx = -uy;
  const ny = ux;
  const s = clamp((r1 - r2) / d, -0.95, 0.95);
  const c = Math.sqrt(1 - s * s);
  const v = (sg: number) => ({ x: ux * s + nx * c * sg, y: uy * s + ny * c * sg });
  const vp = v(1);
  const vm = v(-1);
  const P = (o: Vec, r: number, w: Vec) => `${o.x + w.x * r} ${o.y + w.y * r}`;
  return `M ${P(A, r1, vp)} L ${P(B, r2, vp)} A ${r2} ${r2} 0 ${s < 0 ? 1 : 0} 0 ${P(B, r2, vm)} L ${P(A, r1, vm)} A ${r1} ${r1} 0 ${s > 0 ? 1 : 0} 0 ${P(A, r1, vp)} Z`;
};

// Длина кисти: стиль 2 — кисть крупнее (у детей ещё чуть крупнее к предплечью).
const handLen = (look: Look) => (look.rigStyle === 2 ? look.build.hand * (look.build.child ? 1.5 : 1.38) : look.build.hand);

// Каркас позы: все опорные величины, общие для рисунка и figureAnchors —
// один источник истины. Выражения — те же, что рисует Figure.
const frameOf = (look: Look, pose: Pose) => {
  const b = look.build;
  const style2 = look.rigStyle === 2;
  const bt = pose.bodyTurn;
  const at = Math.abs(bt);
  const sgn = bt >= 0 ? 1 : -1;
  const ws = 1 - 0.36 * at;

  // ---------- шаг ----------
  const amt = pose.walkAmt;
  const ph = pose.walkPhase;
  const TAU = Math.PI * 2;
  const bob = amt * b.stride * 0.018 * Math.cos(2 * TAU * ph);
  const sway = amt * 3 * Math.sin(TAU * ph) * (1 - at);
  const ox = sway;

  // ---------- на колене (по выбору) ----------
  // Явное pose.kneel, либо у стиля 2 при посадке на пол без явного колена —
  // неявный путь через колено: первые 40 % — опускается на колено, затем
  // садится, скрестив ноги.
  const implicitKneel = pose.kneel === undefined && style2 && pose.floorSit > 0 && pose.floorSit < 1;
  const kneelRaw = implicitKneel ? smoothstep(pose.floorSit / 0.4) : clamp(pose.kneel ?? 0);
  const floorRaw = implicitKneel ? clamp((pose.floorSit - 0.35) / 0.65) : pose.floorSit;
  const kneelOn = kneelRaw > 0;
  const kneelSide: -1 | 1 = pose.kneelSide ?? (sgn > 0 ? -1 : 1);

  // ---------- посадка / присед / на полу ----------
  const sitE = smoothstep(pose.sit);
  const floorE = smoothstep(floorRaw);
  // с колена садятся на пол: пока идёт посадка, основа — поза на колене,
  // даже если kneel уже убывает (kneel + floorSit ≈ 1 в хореографии)
  const kE = kneelOn ? smoothstep(kneelRaw) + (1 - smoothstep(kneelRaw)) * Math.min(1, floorE * 4) : 0;
  const hipSitY = -pose.seat + 6;
  // сидя на полу таз чуть выше пола (на подушке ковра)
  const hipFloorY = -b.leg * 1.3 - 6;
  const crouchDrop = pose.crouch * b.thigh * 1.05;
  const legReach = b.thigh + b.shin - 4;
  const stanceDrop = Math.max(14, ...([-1, 1] as const).map((side) => {
    const foot = pose.feet?.[side < 0 ? 0 : 1];
    if (!foot) return 14;
    const hipX = ox + side * b.hipJointX * (1 - 0.55 * at);
    const dx = Math.min(legReach - 1, Math.abs(foot.x - hipX));
    return foot.y - Math.sqrt(legReach * legReach - dx * dx) - b.hipJointY;
  }));
  const standDrop = (stanceDrop + crouchDrop) * (1 - sitE) + (hipSitY - b.hipJointY) * sitE;
  // на колене: бедро опорной ноги почти вертикально, колено на полу
  const hipKneelY = -(b.thigh * 0.97 + b.leg * 0.45);
  const drop = kneelOn ? lerp(lerp(standDrop, hipKneelY - b.hipJointY, kE), hipFloorY - b.hipJointY, floorE) : lerp(standDrop, hipFloorY - b.hipJointY, floorE);
  const leanY = (1 - at) * pose.lean * 1.6;
  const dy = drop + bob;
  const hipY = b.hipJointY + dy;

  // ---------- корпус ----------
  const shy = -pose.shoulders * 12 + pose.exhale * 7 - pose.breath * 1.5;
  const sy = b.shoulderY + dy + leanY + shy;
  const wy = b.waistY + dy + leanY * 0.5;
  const hy = b.hipY + dy;

  // ---------- голова ----------
  // стиль 2: у детей видимая шея короче — голова чуть ниже (шея не рвётся:
  // её прямоугольник идёт от neckTop до ворота)
  const neckLift = style2 && b.child ? b.headRy * 0.13 : 0;
  const neckX = ox + bt * 8;
  const headCx = neckX + bt * 4;
  const headCy = b.headY + dy + leanY * 1.15 + shy * 0.8 + pose.nod * 0.6 + neckLift;
  const headRot = pose.headTilt + sgn * at * pose.lean * 0.2;
  const neckTop = b.neckTop + dy + leanY + shy * 0.8 + neckLift;

  // ---------- руки ----------
  const swing = (side: -1 | 1) => {
    const q = Math.cos(TAU * ph) * (side < 0 ? 1 : -1);
    return { x: q * amt * 34 * pose.walkDir * Math.max(0.4, at), y: -Math.abs(q) * amt * 6 };
  };
  const L = handLen(look);
  // Кисть стиля 2: угол и сторона большого пальца (T). "palmUp" и "grip"
  // держат кисть почти горизонтально, пальцами внутрь (к предмету в руках).
  const hand2 = (side: -1 | 1, shape: HandShape, foreAng: number, wrist: number) => {
    const level = side * 90;
    const k = shape === "palmUp" ? 0.15 : shape === "grip" ? 0.35 : 1;
    const ang = (k < 1 ? level + k * wrap180(foreAng - level) : foreAng) + wrist;
    // большой палец: внутрь-вверх; у раскрытой ладони — наружу-вверх;
    // ладонь вверх и обхват — вверх
    const pref = shape === "open" ? { x: side, y: -0.4 } : shape === "palmUp" || shape === "grip" ? { x: 0, y: -1 } : { x: -side, y: -0.5 };
    const pn = Math.hypot(pref.x, pref.y);
    const r = rad(ang);
    const T = clamp(((Math.cos(r) * pref.x + Math.sin(r) * pref.y) / pn) * 2.2, -1, 1);
    return { ang, T };
  };
  const arm = (side: -1 | 1, st: ArmState) => {
    const S = { x: ox + side * (b.shoulderHalf - b.limb * 0.45) * ws + bt * 6, y: sy + b.limb * 0.45 };
    const sw0 = swing(side);
    const target = st.target ?? {
      x: S.x + side * 16 * (1 - at) + sw0.x,
      y: S.y + b.upperArm + b.forearm - 16 + sw0.y,
    };
    const pref = st.elbow === "down" ? { x: side * 0.5, y: 1 } : st.elbow === "in" ? { x: -side, y: 0.4 } : { x: side, y: 0.35 };
    const shape = st.shape ?? "relax";
    // предплечье к зрителю (st.fore < 1) — в проекции короче
    const fore = st.fore === undefined ? b.forearm : b.forearm * clamp(st.fore, 0.3, 1);
    const solve = (tg: Vec) =>
      st.elbow === "hang" ? { mid: { x: S.x + side * b.limb * 0.35, y: S.y + b.upperArm * 0.92 }, end: tg } : twoBone(S, tg, b.upperArm, fore, pref);
    // точка захвата в мире по запястью и углу кисти
    const gripOf = (E: Vec, W: Vec) => {
      const foreAng = deg(Math.atan2(W.y - E.y, W.x - E.x)) - 90;
      const h = style2 ? hand2(side, shape, foreAng, st.wrist ?? 0) : { ang: foreAng + (st.wrist ?? 0), T: side };
      const g = style2 ? hand2Grip(shape, L, h.T) : { x: 0, y: L * 0.5 };
      const r = rad(h.ang);
      return { foreAng, h, at: { x: W.x + g.x * Math.cos(r) - g.y * Math.sin(r), y: W.y + g.x * Math.sin(r) + g.y * Math.cos(r) } };
    };
    let ik = solve(target);
    if (st.aim === "grip" && st.target) {
      // цель — точка захвата: запястье сдвигается навстречу (3 уточнения)
      let w = target;
      for (let i = 0; i < 3; i++) {
        const gr = gripOf(ik.mid, ik.end);
        w = { x: w.x + target.x - gr.at.x, y: w.y + target.y - gr.at.y };
        ik = solve(w);
      }
    }
    const { mid: E, end: W } = ik;
    const foreAng = deg(Math.atan2(W.y - E.y, W.x - E.x)) - 90;
    const gr = gripOf(E, W);
    return { S, E, W, foreAng, shape, hand: gr.h, grip: gr.at };
  };

  return { b, style2, bt, at, sgn, ws, bob, ox, kneelOn, kE, kneelSide, sitE, floorE, standDrop, hipY, sy, wy, hy, neckX, headCx, headCy, headRot, neckTop, L, arm };
};

export type FigureAnchors = {
  readonly head: Vec; // центр головы (с наклоном головы)
  readonly mouth: Vec; // середина рта
  readonly chin: Vec; // низ подбородка (с челюстью при жевании)
  readonly neck: Vec; // основание шеи (у ворота)
  readonly neckTop: Vec; // ось наклона головы
  readonly shoulderL: Vec; // плечевые суставы: откуда растут руки (слева на экране)
  readonly shoulderR: Vec;
  readonly wristL: Vec; // запястья при текущих целях рук
  readonly wristR: Vec;
  readonly gripL: Vec; // точки захвата в кистях (щепоть, обхват, ладонь)
  readonly gripR: Vec;
  readonly hip: Vec; // середина между тазобедренными суставами
};

// Опорные точки персонажа в единицах рисунка — ровно так, как их рисует
// Figure (тот же каркас frameOf и те же точки лица headGeom).
export const figureAnchors = (look: Look, pose: Pose): FigureAnchors => {
  const F = frameOf(look, pose);
  const g = headGeom(look, F.headCx, F.headCy, pose.headTurn, pose.nod, pose.chew ?? 0, pose.chewPhase ?? 0);
  const pivot = { x: F.neckX, y: F.neckTop };
  const head = (p: Vec) => rotAbout(p, pivot, F.headRot);
  const leanA = pose.lean && F.at > 0.05 ? F.sgn * F.at * pose.lean : 0;
  const aL = F.arm(-1, pose.armL ?? REST);
  const aR = F.arm(1, pose.armR ?? REST);
  return {
    head: head({ x: F.headCx, y: F.headCy }),
    mouth: head({ x: g.mx, y: g.my }),
    chin: head(g.chin),
    neck: rotAbout({ x: F.neckX, y: F.sy - 4 }, { x: F.ox, y: F.hy }, leanA),
    neckTop: pivot,
    shoulderL: aL.S,
    shoulderR: aR.S,
    wristL: aL.W,
    wristR: aR.W,
    gripL: aL.grip,
    gripR: aR.grip,
    hip: { x: F.ox, y: F.hipY },
  };
};

// Слой рисования: "all" — целиком; "body" — без передних рук; "arms" —
// только передние руки (поверх предметов перед персонажем); "armsBack" —
// передние руки без пальцев (рука и ладонь), "fingers" — только пальцы
// передних рук: предмет снаружи можно положить между ладонью и пальцами.
export type FigureLayer = "all" | "body" | "arms" | "armsBack" | "fingers";

type FigureProps = {
  readonly uid: string;
  readonly look: Look;
  readonly pose: Pose;
  readonly layer?: FigureLayer;
};

export const Figure: React.FC<FigureProps> = ({ uid, look, pose, layer = "all" }) => {
  const Fr = frameOf(look, pose);
  const { b, style2, bt, at, sgn, ws, ox, kneelOn, kE, sitE, floorE, hipY, sy, wy, hy, neckX, headCx, headCy, headRot, neckTop } = Fr;

  // ---------- ноги ----------
  const legs = ([-1, 1] as const).map((side) => {
    const hip = { x: ox + side * b.hipJointX * (1 - 0.55 * at), y: hipY };
    const stand = { x: side * (b.hipJointX + 8) * (1 - 0.5 * at) + side * sgn * 10 * at, y: -14 };
    const ft = pose.feet?.[side < 0 ? 0 : 1];
    const ankleStand = ft ? { x: ft.x, y: ft.y } : stand;
    const roll = ft ? ft.roll : 0;
    const kneeSit = { x: hip.x + sgn * at * b.thigh * 0.92 + side * 6 * (1 - at), y: hip.y + lerp(34, 6, at) };
    const ankleSit = { x: kneeSit.x + sgn * at * 10, y: -14 };
    const ankle = mixV(ankleStand, ankleSit, sitE);
    const pref = { x: (sgn * at + side * 0.08 * (1 - at)) * 1, y: 0.15 };
    const ik = twoBone(hip, ankle, b.thigh, b.shin, pref, 0.3);
    const knee = mixV(ik.mid, kneeSit, sitE);
    // на полу: колено наружу и вперёд, голень к центру (ноги скрещены)
    const kneeFloor = { x: hip.x + side * (b.hipJointX * 0.4 + b.thigh * 0.62) * (1 - 0.35 * at) + sgn * at * b.thigh * 0.3, y: hip.y + b.leg * 0.55 };
    const ankleFloor = { x: hip.x - side * b.thigh * 0.18 * (1 - at) + sgn * at * b.thigh * 0.45, y: -b.leg * 0.42 };
    return {
      side,
      hip,
      knee: mixV(knee, kneeFloor, floorE),
      ankle: mixV(mixV(ik.end, ankle, sitE), ankleFloor, floorE),
      roll: roll * (1 - sitE) * (1 - floorE),
    };
  });
  const legColor = look.bottom;
  const shoe = (l: (typeof legs)[number], far: boolean) => {
    const len = lerp(b.leg * 1.05, b.foot, at);
    const toe = sgn * at * b.foot * 0.45;
    const cx = l.ankle.x + toe * 0.5 + l.side * 4 * (1 - at);
    const color = look.socks ?? "#2A2A30";
    if (floorE > 0.5) {
      // стопы в носках, лежат боком под голенью другой ноги
      return <ellipse cx={l.ankle.x - l.side * b.leg * 0.25} cy={l.ankle.y + b.leg * 0.18} rx={b.leg * 0.62} ry={b.leg * 0.34} fill={color} opacity={far ? 0.9 : 1} />;
    }
    return (
      <g transform={`rotate(${l.roll} ${l.ankle.x} ${l.ankle.y})`}>
        <ellipse cx={cx} cy={l.ankle.y + 6} rx={len * 0.55} ry={b.leg * 0.32} fill={color} opacity={far ? 0.92 : 1} />
        <ellipse cx={cx + toe * 0.35} cy={l.ankle.y + 1} rx={len * 0.3} ry={b.leg * 0.16} fill="#FFFFFF" opacity={0.08} />
      </g>
    );
  };
  const legEl = (l: (typeof legs)[number], far: boolean) => (
    <g key={`leg${l.side}`} opacity={far ? 0.97 : 1}>
      <path
        d={`M ${l.hip.x} ${l.hip.y} L ${l.knee.x} ${l.knee.y} L ${l.ankle.x} ${l.ankle.y}`}
        stroke={far ? shadeOf(legColor) : legColor}
        strokeWidth={b.leg}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {(sitE > 0.3 || floorE > 0.3) && at < 0.6 ? <ellipse cx={l.knee.x} cy={l.knee.y} rx={b.leg * 0.62} ry={b.leg * 0.5 * Math.max(sitE, floorE)} fill={far ? shadeOf(legColor) : legColor} /> : null}
      {shoe(l, far)}
    </g>
  );
  const farLegSide = at > 0.12 ? sgn : 0;
  const legsOrdered = farLegSide > 0 ? [legs[1], legs[0]] : legs;
  // на колене → на полу: свой рисунок ног (до полной посадки, затем — lap)
  const kneelLegs = kneelOn && floorE < 0.999 ? <KneelLegs look={look} pose={pose} fr={Fr} /> : null;
  // ---------- сидя на полу: бёдра в стороны, голени скрещены впереди ----------
  const lap = (() => {
    if (floorE < 0.01 || kneelLegs) return null;
    const hx = b.hipJointX * (1 - 0.55 * at);
    const kx = (b.hipJointX * 0.4 + b.thigh * 0.74) * (1 - 0.3 * at);
    const shiftX = sgn * at * b.thigh * 0.25;
    const kneeY = -b.leg * 0.62;
    const lw = b.leg * 0.95;
    const sock = look.socks ?? "#2A2A30";
    const shade = shadeOf(legColor, 0.82);
    // бедро: от тазобедренного сустава наружу-вперёд к колену
    const thigh = (side: number) => `M ${ox + side * hx} ${hipY + 4} Q ${ox + side * kx * 0.55 + shiftX} ${hipY + b.leg * 0.2} ${ox + side * kx + shiftX} ${kneeY}`;
    // голень: от колена к противоположной стороне, лодыжка под другим коленом
    const shin = (side: number) => `M ${ox + side * kx + shiftX} ${kneeY} Q ${ox + side * kx * 0.35 + shiftX} ${-4} ${ox - side * kx * 0.38 + shiftX} ${-b.leg * 0.34}`;
    return (
      <g opacity={floorE}>
        {/* дальняя (нижняя) голень и её стопа */}
        <path d={shin(1)} stroke={shade} strokeWidth={lw * 0.92} fill="none" strokeLinecap="round" />
        <ellipse cx={ox - kx * 0.5 + shiftX} cy={-b.leg * 0.3} rx={b.leg * 0.5} ry={b.leg * 0.32} fill={sock} opacity={0.9} />
        {/* бёдра */}
        <path d={thigh(-1)} stroke={legColor} strokeWidth={lw * 1.12} fill="none" strokeLinecap="round" />
        <path d={thigh(1)} stroke={legColor} strokeWidth={lw * 1.12} fill="none" strokeLinecap="round" />
        {/* ближняя (верхняя) голень и стопа */}
        <path d={shin(-1)} stroke={legColor} strokeWidth={lw} fill="none" strokeLinecap="round" />
        <ellipse cx={ox + kx * 0.46 + shiftX} cy={-b.leg * 0.28} rx={b.leg * 0.52} ry={b.leg * 0.34} fill={sock} />
        {/* колени */}
        <circle cx={ox - kx + shiftX} cy={kneeY} r={lw * 0.56} fill={legColor} />
        <circle cx={ox + kx + shiftX} cy={kneeY} r={lw * 0.56} fill={legColor} />
      </g>
    );
  })();

  // ---------- корпус ----------
  const sw = b.shoulderHalf * ws;
  const waw = b.waistHalf * ws;
  const hw = b.hipHalf * ws;
  const cxl = ox + bt * b.shoulderHalf * ws * 0.45; // середина груди
  const torso = `M ${ox - 18} ${sy - 4} Q ${ox - sw * 0.75} ${sy - 6} ${ox - sw} ${sy + 20} Q ${ox - sw - 4} ${sy + 64} ${ox - sw * 0.92} ${sy + 112} L ${ox - waw} ${wy} Q ${ox - hw * 1.04} ${(wy + hy) / 2} ${ox - hw} ${hy + 6} L ${ox + hw} ${hy + 6} Q ${ox + hw * 1.04} ${(wy + hy) / 2} ${ox + waw} ${wy} L ${ox + sw * 0.92} ${sy + 112} Q ${ox + sw + 4} ${sy + 64} ${ox + sw} ${sy + 20} Q ${ox + sw * 0.75} ${sy - 6} ${ox + 18} ${sy - 4} Z`;
  const tid = `${uid}-torso`;
  const pelvis = (
    <path d={`M ${ox - hw} ${hy - 4} L ${ox + hw} ${hy - 4} L ${ox + hw * 0.95} ${hipY + 30} Q ${ox} ${hipY + 46} ${ox - hw * 0.95} ${hipY + 30} Z`} fill={look.bottom} />
  );

  const clothes = (() => {
    const els: React.ReactNode[] = [];
    if (look.top === "suit" || look.top === "vest") {
      // рубашка под пиджаком/жилетом; борта расходятся на груди
      els.push(<path key="base" d={torso} fill={look.inner} />);
      const gapX = (look.top === "suit" ? 22 : 26) * (1 - 0.3 * at);
      const openY = look.top === "suit" ? sy + 86 : sy + 46;
      const meet = look.top === "suit" ? 2 : 10;
      els.push(
        <g key="lapels" clipPath={`url(#${tid})`}>
          <path d={`M ${ox - sw - 20} ${sy - 30} L ${cxl - gapX * 0.5} ${sy - 6} L ${cxl - meet} ${openY} L ${cxl - meet} ${hy + 40} L ${ox - sw - 20} ${hy + 40} Z`} fill={look.topColor} />
          <path d={`M ${ox + sw + 20} ${sy - 30} L ${cxl + gapX * 0.5} ${sy - 6} L ${cxl + meet} ${openY} L ${cxl + meet} ${hy + 40} L ${ox + sw + 20} ${hy + 40} Z`} fill={look.topColor} />
          {look.top === "suit" ? (
            <>
              <path d={`M ${cxl - gapX * 0.5} ${sy - 6} L ${cxl - gapX * 2.0} ${sy + 34} L ${cxl - meet} ${openY} Z`} fill={look.topShade} />
              <path d={`M ${cxl + gapX * 0.5} ${sy - 6} L ${cxl + gapX * 2.0} ${sy + 34} L ${cxl + meet} ${openY} Z`} fill={look.topShade} />
              <circle cx={cxl} cy={openY + 14} r={4} fill={look.topShade} />
              <circle cx={cxl} cy={openY + 44} r={4} fill={look.topShade} />
              <line x1={cxl} y1={openY} x2={cxl} y2={hy + 40} stroke={look.topShade} strokeWidth={2} opacity={0.6} />
            </>
          ) : null}
        </g>,
      );
      // воротник рубашки
      els.push(
        <g key="collar">
          <path d={`M ${cxl - 22} ${sy - 10} L ${cxl - 2} ${sy + 20} L ${cxl - 28} ${sy + 12} Z`} fill="#FFFFFF" />
          <path d={`M ${cxl + 22} ${sy - 10} L ${cxl + 2} ${sy + 20} L ${cxl + 28} ${sy + 12} Z`} fill="#FFFFFF" />
        </g>,
      );
    } else {
      els.push(<path key="base" d={torso} fill={look.topColor} />);
    }
    // тень на стороне от окна (свет справа сверху — окно справа)
    els.push(<rect key="shade" x={ox - sw * 1.6 + bt * 10} y={sy - 40} width={sw * 1.2} height={hy - sy + 80} fill={look.topShade} opacity={0.3} clipPath={`url(#${tid})`} />);
    if (look.top === "shirt") {
      els.push(
        <g key="collar">
          <path d={`M ${cxl - 24} ${sy - 8} L ${cxl - 4} ${sy + 22} L ${cxl - 30} ${sy + 16} Z`} fill="#FFFFFF" opacity={0.6} />
          <path d={`M ${cxl + 24} ${sy - 8} L ${cxl + 4} ${sy + 22} L ${cxl + 30} ${sy + 16} Z`} fill="#FFFFFF" opacity={0.6} />
          <line x1={cxl} y1={sy + 18} x2={cxl - bt * 6} y2={hy} stroke={look.topShade} strokeWidth={3} />
          {[0.3, 0.55, 0.8].map((k) => (
            <circle key={k} cx={cxl - bt * 6 * k} cy={sy + 18 + (hy - sy - 18) * k} r={3.5} fill="#FFFFFF" opacity={0.8} />
          ))}
        </g>,
      );
    } else if (look.top === "tee") {
      els.push(<path key="neck" d={`M ${cxl - 20} ${sy - 4} Q ${cxl} ${sy + 14} ${cxl + 20} ${sy - 4}`} stroke={look.topShade} strokeWidth={6} fill="none" />);
      if (look.stripe) els.push(<rect key="stripe" x={ox - sw - 10} y={sy + 50} width={sw * 2 + 20} height={18} fill={look.stripe} clipPath={`url(#${tid})`} />);
    } else if (look.top === "sweater") {
      els.push(<path key="neck" d={`M ${cxl - 24} ${sy - 4} Q ${cxl} ${sy + 18} ${cxl + 24} ${sy - 4}`} stroke={look.topShade} strokeWidth={7} fill="none" />);
      els.push(<rect key="rib" x={ox - hw} y={hy + 2} width={hw * 2} height={14} fill={look.topShade} clipPath={`url(#${tid})`} />);
      if (look.stripe) els.push(<rect key="stripe" x={ox - sw - 10} y={sy + 44} width={sw * 2 + 20} height={14} fill={look.stripe} clipPath={`url(#${tid})`} />);
    } else if (look.top === "hoodie") {
      els.push(<path key="hood" d={`M ${cxl - 34} ${sy - 2} Q ${cxl} ${sy + 26} ${cxl + 34} ${sy - 2} Q ${cxl} ${sy - 16} ${cxl - 34} ${sy - 2} Z`} fill={look.topShade} />);
      els.push(<rect key="pocket" x={cxl - hw * 0.7} y={wy + 10} width={hw * 1.4} height={(hy - wy) * 0.8} rx={8} fill={look.topShade} opacity={0.6} clipPath={`url(#${tid})`} />);
    } else if (look.top === "jacket") {
      els.push(<line key="zip" x1={cxl} y1={sy + 4} x2={cxl - bt * 6} y2={hy + 20} stroke={look.topShade} strokeWidth={4} />);
      els.push(<path key="col" d={`M ${cxl - 26} ${sy - 6} Q ${cxl} ${sy + 18} ${cxl + 26} ${sy - 6}`} stroke={look.topShade} strokeWidth={8} fill="none" />);
    }
    return els;
  })();

  // ---------- руки ----------
  const arm = (side: -1 | 1, st: ArmState) => {
    const A = Fr.arm(side, st);
    const { S, E, W, foreAng, shape } = A;
    const sleeve = look.top === "vest" ? look.inner : look.topColor;
    if (style2) {
      const hp = { side, len: Fr.L, skin: look.skin, shade: look.skinShade, shape, item: st.item ?? "none", itemColor: st.itemColor, fold: st.flat ?? 0, itemTilt: st.itemTilt ?? 0, style: 2 as const, thumb: A.hand.T, x: W.x, y: W.y, angle: A.hand.ang };
      const back = (
        <g key={`armb${side}`}>
          <Arm2 uid={`${uid}-a${side}`} look={look} sleeve={sleeve} S={S} E={E} W={W} />
          <Hand {...hp} part="back" />
        </g>
      );
      const front = <Hand key={`armf${side}`} {...hp} part="front" />;
      return {
        side,
        back,
        front,
        el: (
          <g key={`arm${side}`}>
            {back}
            {front}
          </g>
        ),
      };
    }
    const cuff = mixV(E, W, 0.82);
    const segs = (
      <>
        <path d={`M ${S.x} ${S.y} L ${E.x} ${E.y}`} stroke={sleeve} strokeWidth={b.limb} strokeLinecap="round" />
        <path d={`M ${E.x} ${E.y} L ${cuff.x} ${cuff.y}`} stroke={sleeve} strokeWidth={b.limb * 0.92} strokeLinecap="round" />
        <path d={`M ${cuff.x} ${cuff.y} L ${W.x} ${W.y}`} stroke={look.skin} strokeWidth={b.limb * 0.66} strokeLinecap="round" />
      </>
    );
    const handBack = <Hand x={W.x} y={W.y} angle={foreAng + (st.wrist ?? 0)} side={side} len={b.hand} skin={look.skin} shade={look.skinShade} shape={shape} item={st.item ?? "none"} itemColor={st.itemColor} fold={st.flat ?? 0} itemTilt={st.itemTilt ?? 0} part="back" />;
    const handFront = <Hand x={W.x} y={W.y} angle={foreAng + (st.wrist ?? 0)} side={side} len={b.hand} skin={look.skin} shade={look.skinShade} shape={shape} item={st.item ?? "none"} itemColor={st.itemColor} fold={st.flat ?? 0} itemTilt={st.itemTilt ?? 0} part="front" />;
    return {
      side,
      back: (
        <g key={`armb${side}`}>
          {segs}
          {handBack}
        </g>
      ),
      front: <g key={`armf${side}`}>{handFront}</g>,
      el: (
        <g key={`arm${side}`}>
          {segs}
          {handBack}
          {handFront}
        </g>
      ),
    };
  };
  const arms = [arm(-1, pose.armL ?? REST), arm(1, pose.armR ?? REST)];
  const behindK = smoothstep((at - 0.38) / 0.18);
  const isBehind = (side: -1 | 1, st: ArmState) => (st.behind !== undefined ? (st.behind ? 1 : 0) : side === sgn ? behindK : 0);
  const behindL = isBehind(-1, pose.armL ?? REST);
  const behindR = isBehind(1, pose.armR ?? REST);

  // ---------- голова ----------
  const headProps = { uid, look, cx: headCx, cy: headCy, turn: pose.headTurn, lookX: pose.lookX, lookY: pose.lookY, nod: pose.nod, expr: pose.expr, mouth: pose.mouth, blink: pose.blink, hairSway: pose.hairSway };
  const chewProps = pose.chew || pose.mouthFull ? { chew: pose.chew, chewPhase: pose.chewPhase, mouthFull: pose.mouthFull } : null;

  const frontPart = (pick: "el" | "back" | "front") =>
    arms.map((a) => {
      const k = a.side < 0 ? behindL : behindR;
      return k < 0.99 ? (
        <g key={`f${a.side}`} opacity={1 - k}>
          {a[pick]}
        </g>
      ) : null;
    });
  if (layer === "arms") return <g>{frontPart("el")}</g>;
  if (layer === "armsBack") return <g>{frontPart("back")}</g>;
  if (layer === "fingers") return <g>{frontPart("front")}</g>;
  const frontArms = frontPart("el");
  return (
    <g>
      <clipPath id={tid}>
        <path d={torso} />
      </clipPath>
      {/* мягкая тень на полу */}
      <ellipse cx={ox * 0.5} cy={4} rx={b.shoulderHalf * (1.25 + 0.3 * floorE - 0.2 * sitE + (kneelOn ? 0.15 * kE * (1 - floorE) : 0))} ry={16 + 8 * floorE} fill="rgba(60,40,20,0.14)" />
      <g transform={`rotate(${headRot} ${neckX} ${neckTop})`}>
        <Head {...headProps} part="back" />
      </g>
      {arms.map((a) => {
        const k = a.side < 0 ? behindL : behindR;
        return k > 0.01 ? (
          <g key={`b${a.side}`} opacity={k}>
            {a.el}
          </g>
        ) : null;
      })}
      {kneelLegs ? null : floorE < 0.99 ? <g opacity={1 - floorE}>{legsOrdered.map((l) => legEl(l, l.side === farLegSide))}</g> : null}
      {pelvis}
      {kneelLegs}
      {lap}
      <g transform={pose.lean && at > 0.05 ? `rotate(${sgn * at * pose.lean} ${ox} ${hy})` : undefined}>
        {clothes}
        <rect x={neckX - b.headRx * 0.27} y={neckTop - 10} width={b.headRx * 0.54} height={sy - neckTop + 18} rx={10} fill={look.skin} />
        <ellipse cx={neckX} cy={neckTop + 4} rx={b.headRx * 0.3} ry={9} fill={look.skinShade} opacity={0.5} />
      </g>
      <g transform={`rotate(${headRot} ${neckX} ${neckTop})`}>
        {chewProps ? <Head {...headProps} {...chewProps} part="front" /> : <Head {...headProps} part="front" />}
      </g>
      {layer === "all" ? frontArms : null}
    </g>
  );
};

// ---------- рука стиля 2 ----------
// Плечо шире у плечевого сустава, предплечье сужается к запястью, локоть
// круглый (касательные к кругам), рукав с тенью на стороне от окна и
// манжетой; у пиджака из рукава выглядывает манжета рубашки.
const Arm2: React.FC<{ uid: string; look: Look; sleeve: string; S: Vec; E: Vec; W: Vec }> = ({ uid, look, sleeve, S, E, W }) => {
  const w = look.build.limb;
  const cuff = mixV(E, W, 0.8);
  const upper = taper(S, E, w * 0.52, w * 0.42);
  const fore = taper(E, cuff, w * 0.42, w * 0.35);
  const shade = look.top === "vest" ? shadeOf(sleeve, 0.86) : look.topShade;
  const id = `${uid}-sl`;
  // тень: тот же рукав, сдвинутый вправо, вырезает светлую сторону
  const lit = w * 0.42;
  const knit = look.top === "sweater" || look.top === "hoodie";
  const shirtCuff = look.top === "suit";
  const skinFrom = mixV(E, W, shirtCuff ? 0.86 : 0.76);
  return (
    <g>
      <clipPath id={id}>
        <path d={upper} />
        <path d={fore} />
      </clipPath>
      <path d={taper(skinFrom, W, w * 0.27, w * 0.24)} fill={look.skin} />
      {shirtCuff ? <path d={taper(mixV(E, W, 0.76), mixV(E, W, 0.87), w * 0.36, w * 0.34)} fill={look.inner} /> : null}
      {/* тонкий контур отделяет руку от корпуса того же цвета */}
      <path d={`${upper} ${fore}`} fill="none" stroke={shadeOf(shade, 0.9)} strokeWidth={Math.max(2, w * 0.07)} strokeLinejoin="round" opacity={0.55} />
      <path d={`${upper} ${fore}`} fill={sleeve} />
      <g clipPath={`url(#${id})`}>
        <path d={`${upper} ${fore}`} fill={shade} opacity={0.32} transform={`translate(${-lit} 0)`} />
      </g>
      {/* манжета рукава */}
      <path d={taper(mixV(E, W, knit ? 0.72 : 0.75), cuff, w * 0.37, w * 0.36)} fill={shade} opacity={knit ? 0.75 : 0.45} />
    </g>
  );
};

// ---------- ноги «на колене» ----------
// Из стойки: опорное колено (kneelSide) опускается на пол перед своей
// стопой (голень уходит назад — в проекции короткая, стопа за коленом),
// другая стопа стоит на месте, колено поднято (бедро вперёд — в проекции
// короткое). Стопы во время kneel не скользят: лодыжки стоят там же, где
// в стойке. С floorSit колени расходятся в стороны и опускаются, таз
// садится, затем голени скрещиваются — к рисунку «сидя на полу» (lap).
type Frame = ReturnType<typeof frameOf>;

const KneelLegs: React.FC<{ look: Look; pose: Pose; fr: Frame }> = ({ look, pose, fr }) => {
  const { b, at, bt, sgn, ox, kE, kneelSide, floorE, standDrop, bob, hipY } = fr;
  const F = floorE;
  const legColor = look.bottom;
  const sock = look.socks ?? "#2A2A30";
  // на полу (как в lap)
  const hx = b.hipJointX * (1 - 0.55 * at);
  const kx = (b.hipJointX * 0.4 + b.thigh * 0.74) * (1 - 0.3 * at);
  const shiftX = sgn * at * b.thigh * 0.25;
  const kneeYF = -b.leg * 0.62;
  const lw = b.leg * 0.95;
  // посадка с колена в два этапа: сначала опускается и второе колено
  // (на обоих коленях, таз садится к пяткам), затем колени расходятся
  // в стороны, таз опускается на пол и голени скрещиваются
  const both = smoothstep(F / 0.45);
  const spread = smoothstep((F - 0.4) / 0.6);
  const cross = smoothstep((F - 0.45) / 0.55);
  const hip0Y = b.hipJointY + standDrop + bob;
  const farSide = at > 0.12 ? sgn : 0;
  const legs = ([-1, 1] as const).map((side) => {
    const down = side === kneelSide;
    const hip = { x: ox + side * hx, y: hipY + 4 * F };
    const stand = { x: side * (b.hipJointX + 8) * (1 - 0.5 * at) + side * sgn * 10 * at, y: -14 };
    const ft = pose.feet?.[side < 0 ? 0 : 1];
    const A = ft ? { x: ft.x, y: ft.y } : stand;
    const prefS = { x: sgn * at + side * 0.08 * (1 - at), y: 0.15 };
    const k0 = twoBone({ x: hip.x, y: hip0Y }, A, b.thigh, b.shin, prefS, 0.3).mid;
    // на колене: опорное колено на полу под тазом (голень уходит назад,
    // стопа на носке выглядывает сбоку за коленом); другое колено поднято
    // над своей стопой (бедро вперёд — в проекции короткое)
    const kneeK = down ? { x: A.x + b.shin * 0.25 * bt - side * b.leg * 0.1, y: -b.leg * 0.45 } : { x: A.x + side * b.leg * 0.2 + b.thigh * 0.2 * bt, y: A.y - b.shin * 0.92 };
    const kneeL = { x: ox + side * kx + shiftX, y: kneeYF };
    const kneeTwo = down ? kneeK : { x: A.x + side * b.leg * 0.1 + b.shin * 0.25 * bt, y: -b.leg * 0.45 };
    const knee = mixV(mixV(mixV(k0, kneeK, kE), kneeTwo, both), kneeL, spread);
    const ankleL = { x: ox - side * kx * 0.38 + shiftX, y: -b.leg * 0.34 };
    const ankle = mixV(A, ankleL, cross);
    // стопа: плоско (стоит) или на носке пяткой вверх (за коленом)
    const flat = (down ? 1 - kE : 1) * (1 - smoothstep(F / 0.35));
    const sockL = side < 0 ? { x: ox + kx * 0.46 + shiftX, y: -b.leg * 0.28 } : { x: ox - kx * 0.5 + shiftX, y: -b.leg * 0.3 };
    const len = lerp(b.leg * 1.05, b.foot, at);
    const toe = sgn * at * b.foot * 0.45;
    const flatC = { x: A.x + toe * 0.5 + side * 4 * (1 - at), y: A.y + 6 };
    const tuckC = { x: A.x + side * b.leg * 0.3 - b.leg * 0.4 * bt, y: A.y - b.leg * 0.3 };
    const sockC = mixV(mixV(tuckC, flatC, flat), sockL, cross);
    const sockR = { x: lerp(lerp(b.leg * 0.32, len * 0.55, flat), b.leg * 0.51, cross), y: lerp(lerp(b.leg * 0.44, b.leg * 0.32, flat), b.leg * 0.32, cross) };
    const tc = mixV(mixV(hip, knee, 0.5), { x: ox + side * kx * 0.55 + shiftX, y: hipY + b.leg * 0.2 }, F);
    const sc = mixV(mixV(knee, ankle, 0.5), { x: ox + side * kx * 0.35 + shiftX, y: -4 }, cross);
    // цвет: из стойки (дальняя нога в тени) → на колене (опорная чуть темнее)
    // → на полу (правая голень — дальняя, в тени)
    const c0 = side === farSide ? shadeOf(legColor) : legColor;
    const cK = mixHex(c0, down ? shadeOf(legColor, 0.92) : legColor, kE);
    const shinColor = mixHex(cK, side > 0 ? shadeOf(legColor, 0.82) : legColor, cross);
    const thighColor = mixHex(cK, legColor, F);
    const raise = down ? 0 : kE * (1 - both); // поднятое колено (к зрителю)
    return { side, down, hip, knee, ankle, tc, sc, sockC, sockR, shinColor, thighColor, raise, flat };
  });
  const thighW = lerp(b.leg, lw * 1.12, F);
  const shinW = (side: number) => lerp(b.leg * 0.96, side > 0 ? lw * 0.92 : lw, cross);
  // колено: в стойке — не толще ноги (без «шишки»), на колене — крупнее
  const kneeR = (l: (typeof legs)[number]) => ({ x: lerp(lerp(b.leg * 0.5, b.leg * (0.6 + 0.06 * l.raise), kE), lw * 0.56, F), y: lerp(lerp(b.leg * 0.5, b.leg * (0.47 + 0.13 * l.raise), kE), lw * 0.56, F) });
  const sockEl = (l: (typeof legs)[number]) => <ellipse key={`s${l.side}`} cx={l.sockC.x} cy={l.sockC.y} rx={l.sockR.x} ry={l.sockR.y} fill={sock} opacity={l.side > 0 ? lerp(1, 0.9, F) : 1} />;
  const shinEl = (l: (typeof legs)[number]) => <path key={`sh${l.side}`} d={`M ${l.knee.x} ${l.knee.y} Q ${l.sc.x} ${l.sc.y} ${l.ankle.x} ${l.ankle.y}`} stroke={l.shinColor} strokeWidth={shinW(l.side)} fill="none" strokeLinecap="round" />;
  const thighEl = (l: (typeof legs)[number]) => <path key={`th${l.side}`} d={`M ${l.hip.x} ${l.hip.y} Q ${l.tc.x} ${l.tc.y} ${l.knee.x} ${l.knee.y}`} stroke={l.thighColor} strokeWidth={thighW} fill="none" strokeLinecap="round" />;
  const kneeEl = (l: (typeof legs)[number]) => {
    const r = kneeR(l);
    return (
      <g key={`k${l.side}`}>
        {/* под поднятым коленом — тень на голени */}
        {l.raise > 0.05 ? <ellipse cx={l.knee.x} cy={l.knee.y + r.y * 0.7} rx={r.x * 0.86} ry={r.y * 0.62} fill={shadeOf(legColor, 0.78)} opacity={0.55 * l.raise} /> : null}
        <ellipse cx={l.knee.x} cy={l.knee.y} rx={r.x} ry={r.y} fill={l.thighColor} />
        {l.raise > 0.05 ? <ellipse cx={l.knee.x + r.x * 0.22} cy={l.knee.y - r.y * 0.3} rx={r.x * 0.5} ry={r.y * 0.34} fill="#FFFFFF" opacity={0.09 * l.raise} /> : null}
      </g>
    );
  };
  const flatShoe = (l: (typeof legs)[number]) =>
    l.flat > 0.02 ? <ellipse key={`hl${l.side}`} cx={l.sockC.x + sgn * at * b.foot * 0.16} cy={l.sockC.y - 5} rx={l.sockR.x * 0.55} ry={b.leg * 0.16} fill="#FFFFFF" opacity={0.08 * l.flat} /> : null;
  const legEl = (l: (typeof legs)[number]) => (
    <g key={`l${l.side}`}>
      {sockEl(l)}
      {flatShoe(l)}
      {shinEl(l)}
      {thighEl(l)}
      {kneeEl(l)}
    </g>
  );
  const dn = legs.find((l) => l.down)!;
  const up = legs.find((l) => !l.down)!;
  // на колене: сначала нога с поднятым коленом, затем опорная (её колено
  // в повороте выходит вперёд); ближе к посадке — порядок как в lap
  if (F < 0.5) return <g>{[legEl(up), legEl(dn)]}</g>;
  const [L, R] = legs;
  return (
    <g>
      {shinEl(R)}
      {sockEl(R)}
      {thighEl(L)}
      {thighEl(R)}
      {shinEl(L)}
      {sockEl(L)}
      {kneeEl(L)}
      {kneeEl(R)}
    </g>
  );
};
