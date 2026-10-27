// Персонаж целиком по рассчитанной позе (единицы рисунка, ступни в y = 0).
// Части: ноги (бедро, голень, стопа) с коленом, корпус с одеждой, шея,
// голова, руки (плечо, предплечье, кисть) с предметами. Поворот корпуса
// сужает силуэт, дальняя рука уходит за корпус. Посадка на полу — ноги
// скрещены перед корпусом (учебная комната мечети: сидят на ковре).
import { Head } from "./Head";
import { Hand } from "./Hand";
import { shadeOf, type Look } from "./looks";
import { clamp, deg, lerp, smoothstep, type Vec } from "./motion";
import { REST, type ArmState, type Pose } from "./pose";

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

// Слой рисования: "all" — целиком; "body" — без передних рук; "arms" —
// только передние руки (поверх предметов перед персонажем).
export type FigureLayer = "all" | "body" | "arms";

type FigureProps = {
  readonly uid: string;
  readonly look: Look;
  readonly pose: Pose;
  readonly layer?: FigureLayer;
};

export const Figure: React.FC<FigureProps> = ({ uid, look, pose, layer = "all" }) => {
  const b = look.build;
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

  // ---------- посадка / присед / на полу ----------
  const sitE = smoothstep(pose.sit);
  const floorE = smoothstep(pose.floorSit);
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
  const drop = lerp(standDrop, hipFloorY - b.hipJointY, floorE);
  const leanY = (1 - at) * pose.lean * 1.6;
  const dy = drop + bob;

  // ---------- ноги ----------
  const hipY = b.hipJointY + dy;
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
  // ---------- сидя на полу: бёдра в стороны, голени скрещены впереди ----------
  const lap = (() => {
    if (floorE < 0.01) return null;
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
  const shy = -pose.shoulders * 12 + pose.exhale * 7 - pose.breath * 1.5;
  const sy = b.shoulderY + dy + leanY + shy;
  const wy = b.waistY + dy + leanY * 0.5;
  const hy = b.hipY + dy;
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
  const swing = (side: -1 | 1) => {
    const q = Math.cos(TAU * ph) * (side < 0 ? 1 : -1);
    return { x: q * amt * 34 * pose.walkDir * Math.max(0.4, at), y: -Math.abs(q) * amt * 6 };
  };
  const arm = (side: -1 | 1, st: ArmState) => {
    const S = { x: ox + side * (b.shoulderHalf - b.limb * 0.45) * ws + bt * 6, y: sy + b.limb * 0.45 };
    const sw0 = swing(side);
    const target = st.target ?? {
      x: S.x + side * 16 * (1 - at) + sw0.x,
      y: S.y + b.upperArm + b.forearm - 16 + sw0.y,
    };
    const pref = st.elbow === "down" ? { x: side * 0.5, y: 1 } : st.elbow === "in" ? { x: -side, y: 0.4 } : { x: side, y: 0.35 };
    const { mid: E, end: W } =
      st.elbow === "hang" ? { mid: { x: S.x + side * b.limb * 0.35, y: S.y + b.upperArm * 0.92 }, end: target } : twoBone(S, target, b.upperArm, b.forearm, pref);
    const foreAng = deg(Math.atan2(W.y - E.y, W.x - E.x)) - 90;
    const sleeve = look.top === "vest" ? look.inner : look.topColor;
    const cuff = mixV(E, W, 0.82);
    const shape = st.shape ?? "relax";
    return {
      side,
      el: (
        <g key={`arm${side}`}>
          <path d={`M ${S.x} ${S.y} L ${E.x} ${E.y}`} stroke={sleeve} strokeWidth={b.limb} strokeLinecap="round" />
          <path d={`M ${E.x} ${E.y} L ${cuff.x} ${cuff.y}`} stroke={sleeve} strokeWidth={b.limb * 0.92} strokeLinecap="round" />
          <path d={`M ${cuff.x} ${cuff.y} L ${W.x} ${W.y}`} stroke={look.skin} strokeWidth={b.limb * 0.66} strokeLinecap="round" />
          <Hand x={W.x} y={W.y} angle={foreAng + (st.wrist ?? 0)} side={side} len={b.hand} skin={look.skin} shade={look.skinShade} shape={shape} item={st.item ?? "none"} itemColor={st.itemColor} fold={st.flat ?? 0} itemTilt={st.itemTilt ?? 0} part="back" />
          <Hand x={W.x} y={W.y} angle={foreAng + (st.wrist ?? 0)} side={side} len={b.hand} skin={look.skin} shade={look.skinShade} shape={shape} item={st.item ?? "none"} itemColor={st.itemColor} fold={st.flat ?? 0} itemTilt={st.itemTilt ?? 0} part="front" />
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
  const neckX = ox + bt * 8;
  const headCx = neckX + bt * 4;
  const headCy = b.headY + dy + leanY * 1.15 + shy * 0.8 + pose.nod * 0.6;
  const headRot = pose.headTilt + sgn * at * pose.lean * 0.2;
  const neckTop = b.neckTop + dy + leanY + shy * 0.8;
  const headProps = { uid, look, cx: headCx, cy: headCy, turn: pose.headTurn, lookX: pose.lookX, lookY: pose.lookY, nod: pose.nod, expr: pose.expr, mouth: pose.mouth, blink: pose.blink, hairSway: pose.hairSway };

  const frontArms = arms.map((a) => {
    const k = a.side < 0 ? behindL : behindR;
    return k < 0.99 ? (
      <g key={`f${a.side}`} opacity={1 - k}>
        {a.el}
      </g>
    ) : null;
  });
  if (layer === "arms") return <g>{frontArms}</g>;
  return (
    <g>
      <clipPath id={tid}>
        <path d={torso} />
      </clipPath>
      {/* мягкая тень на полу */}
      <ellipse cx={ox * 0.5} cy={4} rx={b.shoulderHalf * (1.25 + 0.3 * floorE - 0.2 * sitE)} ry={16 + 8 * floorE} fill="rgba(60,40,20,0.14)" />
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
      {floorE < 0.99 ? <g opacity={1 - floorE}>{legsOrdered.map((l) => legEl(l, l.side === farLegSide))}</g> : null}
      {pelvis}
      {lap}
      <g transform={pose.lean && at > 0.05 ? `rotate(${sgn * at * pose.lean} ${ox} ${hy})` : undefined}>
        {clothes}
        <rect x={neckX - b.headRx * 0.27} y={neckTop - 10} width={b.headRx * 0.54} height={sy - neckTop + 18} rx={10} fill={look.skin} />
        <ellipse cx={neckX} cy={neckTop + 4} rx={b.headRx * 0.3} ry={9} fill={look.skinShade} opacity={0.5} />
      </g>
      <g transform={`rotate(${headRot} ${neckX} ${neckTop})`}>
        <Head {...headProps} part="front" />
      </g>
      {layer === "all" ? frontArms : null}
    </g>
  );
};
