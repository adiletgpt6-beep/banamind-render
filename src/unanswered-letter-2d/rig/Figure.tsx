// Персонаж целиком по рассчитанной позе (единицы рисунка, ступни в y = 0).
// Части: ноги (бедро, голень, стопа) с коленом, корпус с одеждой, шея,
// голова, руки (плечо, предплечье, кисть) с предметами, рюкзак/сумка.
// Поворот корпуса сужает силуэт, дальняя рука уходит за корпус.
import { Head } from "./Head";
import { Hand } from "./Hand";
import type { Look } from "./looks";
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

// Слой рисования: "all" — целиком; "body" — без передних рук (за столом:
// тело рисуется до столешницы); "arms" — только передние руки (поверх
// столешницы и предметов на ней).
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

  // ---------- посадка / присед ----------
  const sitE = smoothstep(pose.sit);
  const hipSitY = -pose.seat + 6;
  const crouchDrop = pose.crouch * b.thigh * 1.05;
  // Перенос веса опускает таз ровно настолько, чтобы обе стопы были
  // достижимы. Иначе IK обрезает длину ноги и обувь скользит над полом.
  const legReach = b.thigh + b.shin - 4;
  const stanceDrop = Math.max(14, ...([-1, 1] as const).map((side) => {
    const foot = pose.feet?.[side < 0 ? 0 : 1];
    if (!foot) return 14;
    const hipX = ox + side * b.hipJointX * (1 - 0.55 * at);
    const dx = Math.min(legReach - 1, Math.abs(foot.x - hipX));
    return foot.y - Math.sqrt(legReach * legReach - dx * dx) - b.hipJointY;
  }));
  const drop = (hipSitY - b.hipJointY) * sitE + (stanceDrop + crouchDrop) * (1 - sitE);
  const leanY = (1 - at) * pose.lean * 1.6;
  const dy = drop + bob;

  // ---------- ноги ----------
  const hipY = b.hipJointY + dy;
  const legs = ([-1, 1] as const).map((side) => {
    const hip = { x: ox + side * b.hipJointX * (1 - 0.55 * at), y: hipY };
    // стоя: стопы под бёдрами; в профиль — чуть вразнобой
    const stand = { x: side * (b.hipJointX + 8) * (1 - 0.5 * at) + side * sgn * 10 * at, y: -14 };
    // шаг: стопы из расчёта походки (опорная стоит в мире на месте)
    const ft = pose.feet?.[side < 0 ? 0 : 1];
    const ankleStand = ft ? { x: ft.x, y: ft.y } : stand;
    const roll = ft ? ft.roll : 0;
    // сидя: бедро к зрителю (в анфас — коротко), голень вниз
    const kneeSit = { x: hip.x + sgn * at * b.thigh * 0.92 + side * 6 * (1 - at), y: hip.y + lerp(34, 6, at) };
    const ankleSit = { x: kneeSit.x + sgn * at * 10, y: -14 };
    const ankle = mixV(ankleStand, ankleSit, sitE);
    const pref = { x: (sgn * at + side * 0.08 * (1 - at)) * 1, y: 0.15 };
    const ik = twoBone(hip, ankle, b.thigh, b.shin, pref, 0.3);
    const knee = mixV(ik.mid, kneeSit, sitE);
    return { side, hip, knee, ankle: mixV(ik.end, ankle, sitE), roll: roll * (1 - sitE) };
  });
  const legColor = look.skirt ? look.legColor ?? look.skin : look.bottom;
  const shoe = (l: (typeof legs)[number], far: boolean) => {
    const len = lerp(b.leg * 1.05, b.foot, at);
    const toe = sgn * at * b.foot * 0.45;
    const cx = l.ankle.x + toe * 0.5 + l.side * 4 * (1 - at);
    return (
      <g transform={`rotate(${l.roll} ${l.ankle.x} ${l.ankle.y})`}>
        <ellipse cx={cx} cy={l.ankle.y + 6} rx={len * 0.55} ry={b.leg * 0.32} fill={look.shoes} opacity={far ? 0.92 : 1} />
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
      {sitE > 0.3 && at < 0.6 ? <ellipse cx={l.knee.x} cy={l.knee.y} rx={b.leg * 0.62} ry={b.leg * 0.5 * sitE} fill={far ? shadeOf(legColor) : legColor} /> : null}
      {shoe(l, far)}
    </g>
  );
  const farLegSide = at > 0.12 ? sgn : 0;
  const legsOrdered = farLegSide > 0 ? [legs[1], legs[0]] : legs;

  // ---------- корпус ----------
  const shy = -pose.shoulders * 12 + pose.exhale * 7 - pose.breath * 1.5;
  const sy = b.shoulderY + dy + leanY + shy;
  const wy = b.waistY + dy + leanY * 0.5;
  const hy = b.hipY + dy;
  const sw = b.shoulderHalf * ws;
  const waw = b.waistHalf * ws;
  const hw = b.hipHalf * ws;
  const cxl = ox + bt * b.shoulderHalf * ws * 0.45; // середина груди (пуговицы, воротник)
  const torso = `M ${ox - 18} ${sy - 4} Q ${ox - sw * 0.75} ${sy - 6} ${ox - sw} ${sy + 20} Q ${ox - sw - 4} ${sy + 64} ${ox - sw * 0.92} ${sy + 112} L ${ox - waw} ${wy} Q ${ox - hw * 1.04} ${(wy + hy) / 2} ${ox - hw} ${hy + 6} L ${ox + hw} ${hy + 6} Q ${ox + hw * 1.04} ${(wy + hy) / 2} ${ox + waw} ${wy} L ${ox + sw * 0.92} ${sy + 112} Q ${ox + sw + 4} ${sy + 64} ${ox + sw} ${sy + 20} Q ${ox + sw * 0.75} ${sy - 6} ${ox + 18} ${sy - 4} Z`;
  const tid = `${uid}-torso`;
  const pelvis = (
    <path
      d={`M ${ox - hw} ${hy - 4} L ${ox + hw} ${hy - 4} L ${ox + hw * 0.95} ${hipY + 30} Q ${ox} ${hipY + 46} ${ox - hw * 0.95} ${hipY + 30} Z`}
      fill={look.skirt ? look.bottom : look.bottom}
    />
  );
  const skirt = look.skirt ? (
    (() => {
      const hemY = b.hipJointY + dy + b.thigh * 0.52 * (1 - 0.4 * sitE);
      const flare = hw * 1.42 + 8 * amt * Math.sin(TAU * ph);
      const swingX = -sgn * at * 6 * amt;
      return (
        <path
          d={`M ${ox - hw} ${hy - 6} L ${ox + hw} ${hy - 6} L ${ox + flare + swingX} ${hemY} Q ${ox + swingX} ${hemY + 12} ${ox - flare + swingX} ${hemY} Z`}
          fill={look.bottom}
        />
      );
    })()
  ) : null;

  const clothes = (() => {
    const els: React.ReactNode[] = [];
    if (look.top === "cardigan") {
      els.push(<path key="base" d={torso} fill={look.inner} />);
      const gapX = 16 * (1 - 0.3 * at);
      els.push(
        <g key="card" clipPath={`url(#${tid})`}>
          <path d={`M ${ox - sw - 20} ${sy - 30} L ${cxl - gapX} ${sy - 4} L ${cxl - gapX * 0.7} ${hy + 40} L ${ox - sw - 20} ${hy + 40} Z`} fill={look.topColor} />
          <path d={`M ${ox + sw + 20} ${sy - 30} L ${cxl + gapX} ${sy - 4} L ${cxl + gapX * 0.7} ${hy + 40} L ${ox + sw + 20} ${hy + 40} Z`} fill={look.topColor} />
        </g>,
      );
    } else if (look.top === "pinafore") {
      els.push(<path key="base" d={torso} fill={look.inner} />);
      const bibY = sy + 46;
      const bw = sw * 0.62;
      els.push(
        <g key="pin" clipPath={`url(#${tid})`}>
          <path d={`M ${cxl - bw} ${bibY} L ${cxl + bw} ${bibY} L ${ox + waw + 4} ${wy} L ${ox + hw + 6} ${hy + 10} L ${ox - hw - 6} ${hy + 10} L ${ox - waw - 4} ${wy} Z`} fill={look.topColor} />
          <rect x={cxl - bw} y={sy} width={14} height={bibY - sy + 2} fill={look.topColor} />
          <rect x={cxl + bw - 14} y={sy} width={14} height={bibY - sy + 2} fill={look.topColor} />
        </g>,
      );
    } else {
      els.push(<path key="base" d={torso} fill={look.topColor} />);
    }
    // тень на правой стороне (свет слева сверху)
    els.push(
      <rect key="shade" x={ox + sw * 0.42 + bt * 10} y={sy - 40} width={sw * 1.2} height={hy - sy + 80} fill={look.topShade} opacity={0.35} clipPath={`url(#${tid})`} />,
    );
    // воротник/детали
    if (look.top === "shirt") {
      els.push(
        <g key="collar">
          <path d={`M ${cxl - 24} ${sy - 8} L ${cxl - 4} ${sy + 22} L ${cxl - 30} ${sy + 16} Z`} fill="#FFFFFF" opacity={0.55} />
          <path d={`M ${cxl + 24} ${sy - 8} L ${cxl + 4} ${sy + 22} L ${cxl + 30} ${sy + 16} Z`} fill="#FFFFFF" opacity={0.55} />
          <line x1={cxl} y1={sy + 18} x2={cxl - bt * 6} y2={hy} stroke={look.topShade} strokeWidth={3} />
          {[0.25, 0.5, 0.75].map((k) => (
            <circle key={k} cx={cxl - bt * 6 * k} cy={sy + 18 + (hy - sy - 18) * k} r={3.5} fill="#FFFFFF" opacity={0.8} />
          ))}
          <rect x={ox - hw} y={hy - 8} width={hw * 2} height={12} fill="#2E2A2A" />
        </g>,
      );
    } else if (look.top === "pinafore") {
      // круглый белый воротничок
      els.push(
        <g key="collar">
          <ellipse cx={cxl - 15} cy={sy + 6} rx={20} ry={12} fill="#FFFFFF" />
          <ellipse cx={cxl + 15} cy={sy + 6} rx={20} ry={12} fill="#FFFFFF" />
        </g>,
      );
    } else if (look.top === "cardigan") {
      els.push(
        <g key="buttons">
          {[0.35, 0.6].map((k) => (
            <circle key={k} cx={cxl - 14 * (1 - 0.3 * at) - 6} cy={sy + (hy - sy) * k} r={4} fill={look.topShade} />
          ))}
        </g>,
      );
    } else if (look.top === "jacket") {
      els.push(<line key="zip" x1={cxl} y1={sy + 4} x2={cxl - bt * 6} y2={hy + 20} stroke={look.topShade} strokeWidth={4} />);
      els.push(<path key="col" d={`M ${cxl - 26} ${sy - 6} Q ${cxl} ${sy + 18} ${cxl + 26} ${sy - 6}`} stroke={look.topShade} strokeWidth={8} fill="none" />);
    } else if (look.top === "sweater") {
      els.push(<path key="neck" d={`M ${cxl - 24} ${sy - 4} Q ${cxl} ${sy + 18} ${cxl + 24} ${sy - 4}`} stroke={look.topShade} strokeWidth={7} fill="none" />);
      els.push(<rect key="rib" x={ox - hw} y={hy + 2} width={hw * 2} height={14} fill={look.topShade} clipPath={`url(#${tid})`} />);
    }
    return els;
  })();

  // ---------- рюкзак (дочка) ----------
  const pack = pose.packOff ? undefined : look.backpack;
  const packX = ox - sgn * at * sw * 0.9;
  const packEl = pack ? (
    <g transform={`rotate(${pose.packSway} ${packX} ${sy})`}>
      <rect x={packX - sw * 0.88} y={sy - 18} width={sw * 1.76} height={(hy - sy) * 1.02 + 10} rx={sw * 0.36} fill={pack} />
      <rect x={packX - sw * 0.6} y={sy + (hy - sy) * 0.55} width={sw * 1.2} height={(hy - sy) * 0.36} rx={16} fill={shadeOf(pack)} />
      <rect x={packX - sw * 0.34} y={sy - 30} width={sw * 0.68} height={16} rx={8} fill="#14285A" />
    </g>
  ) : null;
  const straps = pack ? (
    <g>
      {([-1, 1] as const).map((side) => {
        const tug = side === 1 ? pose.strapTug * 10 : 0;
        const top = { x: ox + side * sw * 0.55, y: sy - 4 };
        const bot = { x: ox + side * sw * 0.72, y: wy + 6 + tug };
        const visible = 1 - smoothstep((side * -sgn * at - 0.35) / 0.3);
        return visible > 0.01 ? (
          <path key={side} d={`M ${top.x} ${top.y} Q ${top.x + side * 4} ${(top.y + bot.y) / 2} ${bot.x} ${bot.y}`} stroke="#14285A" strokeWidth={13} fill="none" strokeLinecap="round" opacity={visible} />
        ) : null;
      })}
    </g>
  ) : null;

  // ---------- сумка на плече (мама) ----------
  const bag = pose.bagOnShoulder > 0.01 ? (
    <g opacity={smoothstep(pose.bagOnShoulder * 1.5)}>
      <path d={`M ${ox + sw * 0.62} ${sy + 2} Q ${ox + sw * 1.12} ${(sy + hy) / 2} ${ox + sw * 1.02} ${hy + 6}`} stroke="#5E3F31" strokeWidth={7} fill="none" />
      <rect x={ox + sw * 0.72} y={hy - 4} width={b.shoulderHalf * 0.82} height={b.shoulderHalf * 0.64} rx={16} fill="#8A5A44" />
      <rect x={ox + sw * 0.72} y={hy - 4} width={b.shoulderHalf * 0.82} height={16} rx={8} fill="#7A4E3B" />
    </g>
  ) : null;

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
    const pref =
      // «вниз» — вниз и чуть наружу: устойчиво и для кисти прямо под плечом
      st.elbow === "down" ? { x: side * 0.5, y: 1 } : st.elbow === "in" ? { x: -side, y: 0.4 } : { x: side, y: 0.35 };
    // "hang": плечо вдоль тела, предплечье к цели (в проекции короче)
    const { mid: E, end: W } =
      st.elbow === "hang"
        ? { mid: { x: S.x + side * b.limb * 0.35, y: S.y + b.upperArm * 0.92 }, end: target }
        : twoBone(S, target, b.upperArm, b.forearm, pref);
    const foreAng = deg(Math.atan2(W.y - E.y, W.x - E.x)) - 90;
    const sleeve = look.top === "pinafore" ? look.inner : look.top === "tee" ? look.topColor : look.top === "cardigan" ? look.topColor : look.topColor;
    const cuff = mixV(E, W, 0.82);
    const watch = look.watch && side === 1;
    const wp = mixV(E, W, 0.9);
    const shape = st.shape ?? (st.target ? "relax" : "relax");
    return {
      side,
      el: (
        <g key={`arm${side}`}>
          <path d={`M ${S.x} ${S.y} L ${E.x} ${E.y}`} stroke={sleeve} strokeWidth={b.limb} strokeLinecap="round" />
          <path d={`M ${E.x} ${E.y} L ${cuff.x} ${cuff.y}`} stroke={sleeve} strokeWidth={b.limb * 0.92} strokeLinecap="round" />
          <path d={`M ${cuff.x} ${cuff.y} L ${W.x} ${W.y}`} stroke={look.skin} strokeWidth={b.limb * 0.66} strokeLinecap="round" />
          {watch ? (
            <g transform={`rotate(${foreAng} ${wp.x} ${wp.y})`}>
              <rect x={wp.x - b.limb * 0.36} y={wp.y - 5} width={b.limb * 0.72} height={10} rx={3} fill="#2A2A34" />
              <rect x={wp.x - 7} y={wp.y - 7} width={14} height={14} rx={4} fill="#E6C15A" />
            </g>
          ) : null}
          <Hand
            x={W.x}
            y={W.y}
            angle={foreAng + (st.wrist ?? 0)}
            side={side}
            len={b.hand}
            skin={look.skin}
            shade={look.skinShade}
            shape={shape}
            item={st.item ?? "none"}
            itemColor={st.itemColor}
            flat={st.flat ?? 0}
            itemTilt={st.itemTilt ?? 0}
            glow={st.glow ?? 0}
            shake={st.shake ?? 0}
            tap={st.tap ?? -1}
            part="back"
          />
          <Hand
            x={W.x}
            y={W.y}
            angle={foreAng + (st.wrist ?? 0)}
            side={side}
            len={b.hand}
            skin={look.skin}
            shade={look.skinShade}
            shape={shape}
            item={st.item ?? "none"}
            itemColor={st.itemColor}
            flat={st.flat ?? 0}
            itemTilt={st.itemTilt ?? 0}
            glow={0}
            shake={st.shake ?? 0}
            tap={st.tap ?? -1}
            part="front"
          />
        </g>
      ),
    };
  };
  const arms = [arm(-1, pose.armL ?? REST), arm(1, pose.armR ?? REST)];
  // дальняя рука за корпусом при повороте (плавно, через прозрачность)
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
  const headProps = {
    uid,
    look,
    cx: headCx,
    cy: headCy,
    turn: pose.headTurn,
    lookX: pose.lookX,
    lookY: pose.lookY,
    nod: pose.nod,
    expr: pose.expr,
    mouth: pose.mouth,
    blink: pose.blink,
    hairSway: pose.hairSway,
  };

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
      {/* тень на полу */}
      <ellipse cx={ox * 0.5} cy={4} rx={b.shoulderHalf * (1.25 - 0.2 * sitE)} ry={18} fill="rgba(25,30,60,0.16)" />
      {packEl}
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
      {legsOrdered.map((l) => legEl(l, l.side === farLegSide))}
      {pelvis}
      {skirt}
      <g transform={pose.lean && at > 0.05 ? `rotate(${sgn * at * pose.lean} ${ox} ${hy})` : undefined}>
        {clothes}
        {straps}
        {bag}
        {/* шея и тень под подбородком */}
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

// Чуть темнее цвета (дальняя нога).
const shadeOf = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * 0.86);
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const bl = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
};
