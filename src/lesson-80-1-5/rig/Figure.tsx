// Сидящий персонаж по рассчитанной позе (единицы рисунка, место на ковре
// в y = 0). Части: ноги по-турецки (бёдра, голени, носки), таз, корпус с
// одеждой, шея, голова, руки (плечо, предплечье, кисть). Слои: "all";
// "body" — без рук (за столиком тело рисуется до столешницы); "armsBack"
// — ладони и большие пальцы (под бумагой); "armsFront" — руки и пальцы
// поверх; "arms" — обе части рук.
import { Head } from "./Head";
import { Hand } from "./Hand";
import type { Look } from "./looks";
import { deg, lerp, shade, twoBone, type Vec } from "./motion";
import { REST, type ArmState, type Pose } from "./pose";

export type FigureLayer = "all" | "body" | "arms" | "armsBack" | "armsFront";

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
  const ws = 1 - 0.3 * at;
  const ox = pose.sway;
  // наклон вперёд: плечи опускаются и чуть выдвигаются к зрителю
  const leanY = pose.lean * 1.5;
  const shy = -pose.shoulders * 10 - pose.breath * 1.6;
  const sy = b.shoulderY + leanY + shy;
  const wy = b.waistY + leanY * 0.45;
  const hy = b.hipY;
  const sw = b.shoulderHalf * ws;
  const waw = b.waistHalf * ws;
  const hw = b.hipHalf * ws;
  const cxl = ox + bt * sw * 0.45;

  // ---------- ноги по-турецки ----------
  const legs = (() => {
    const els: React.ReactNode[] = [];
    const legC = look.bottom;
    const farC = shade(legC, 0.88);
    for (const side of [-1, 1] as const) {
      const far = side === sgn && at > 0.2;
      const hip = { x: ox + side * hw * 0.5 + bt * 8, y: hy + 14 };
      const knee = { x: ox + side * (hw + b.thigh * 0.42) * (1 - 0.25 * at) + bt * 12, y: hy + 36 };
      const foot = { x: ox - side * b.leg * 0.5 + bt * 10, y: hy + 62 };
      els.push(
        <g key={`leg${side}`}>
          <path d={`M ${hip.x} ${hip.y} L ${knee.x} ${knee.y}`} stroke={far ? farC : legC} strokeWidth={b.leg * 1.2} strokeLinecap="round" fill="none" />
          <path d={`M ${knee.x} ${knee.y} L ${foot.x} ${foot.y}`} stroke={far ? farC : legC} strokeWidth={b.leg * 1.02} strokeLinecap="round" fill="none" />
          <ellipse cx={foot.x + side * b.leg * 0.12} cy={foot.y + 6} rx={b.leg * 0.5} ry={b.leg * 0.3} fill={look.socks} transform={`rotate(${side * 18} ${foot.x} ${foot.y})`} />
        </g>,
      );
    }
    return els;
  })();
  const pelvis = <path d={`M ${ox - hw - 6} ${hy - 6} L ${ox + hw + 6} ${hy - 6} Q ${ox + hw + 10} ${hy + 40} ${ox} ${hy + 46} Q ${ox - hw - 10} ${hy + 40} ${ox - hw - 6} ${hy - 6} Z`} fill={look.bottom} />;

  // ---------- корпус ----------
  const torso = `M ${ox - 18} ${sy - 4} Q ${ox - sw * 0.75} ${sy - 6} ${ox - sw} ${sy + 18} Q ${ox - sw - 4} ${sy + 60} ${ox - sw * 0.92} ${sy + 100} L ${ox - waw} ${wy} Q ${ox - hw * 1.04} ${(wy + hy) / 2} ${ox - hw} ${hy + 4} L ${ox + hw} ${hy + 4} Q ${ox + hw * 1.04} ${(wy + hy) / 2} ${ox + waw} ${wy} L ${ox + sw * 0.92} ${sy + 100} Q ${ox + sw + 4} ${sy + 60} ${ox + sw} ${sy + 18} Q ${ox + sw * 0.75} ${sy - 6} ${ox + 18} ${sy - 4} Z`;
  const tid = `${uid}-t`;
  const clothes = (() => {
    const els: React.ReactNode[] = [];
    const base = look.top === "vest" || look.top === "suit" ? look.inner : look.topColor;
    els.push(<path key="base" d={torso} fill={base} />);
    if (look.top === "vest") {
      // жилет поверх рубашки
      els.push(
        <g key="vest" clipPath={`url(#${tid})`}>
          <path d={`M ${ox - sw - 20} ${sy - 10} L ${cxl - 14} ${sy + 18} L ${cxl - 10} ${hy + 30} L ${ox - sw - 20} ${hy + 30} Z`} fill={look.topColor} />
          <path d={`M ${ox + sw + 20} ${sy - 10} L ${cxl + 14} ${sy + 18} L ${cxl + 10} ${hy + 30} L ${ox + sw + 20} ${hy + 30} Z`} fill={look.topColor} />
        </g>,
      );
    } else if (look.top === "suit") {
      // пиджак с лацканами над белой рубашкой
      const gap = 22 * (1 - 0.3 * at);
      els.push(
        <g key="suit" clipPath={`url(#${tid})`}>
          <path d={`M ${ox - sw - 20} ${sy - 30} L ${cxl - gap} ${sy + 4} L ${cxl - gap * 0.35} ${sy + 92} L ${cxl - 4} ${hy + 40} L ${ox - sw - 20} ${hy + 40} Z`} fill={look.topColor} />
          <path d={`M ${ox + sw + 20} ${sy - 30} L ${cxl + gap} ${sy + 4} L ${cxl + gap * 0.35} ${sy + 92} L ${cxl + 4} ${hy + 40} L ${ox + sw + 20} ${hy + 40} Z`} fill={look.topColor} />
          <path d={`M ${cxl - gap} ${sy + 4} L ${cxl - gap * 1.6} ${sy + 36} L ${cxl - gap * 0.35} ${sy + 92} Z`} fill={look.topShade} />
          <path d={`M ${cxl + gap} ${sy + 4} L ${cxl + gap * 1.6} ${sy + 36} L ${cxl + gap * 0.35} ${sy + 92} Z`} fill={look.topShade} />
          <circle cx={cxl + 2} cy={sy + 96} r={4} fill={look.topShade} />
        </g>,
      );
    }
    els.push(<rect key="shade" x={ox + sw * 0.42 + bt * 10} y={sy - 40} width={sw * 1.2} height={hy - sy + 80} fill="#000000" opacity={0.08} clipPath={`url(#${tid})`} />);
    if (look.top === "shirt" || look.top === "vest" || look.top === "suit") {
      const c = look.top === "shirt" ? look.topShade : "#D8D8D8";
      els.push(
        <g key="collar">
          <path d={`M ${cxl - 22} ${sy - 8} L ${cxl - 2} ${sy + 20} L ${cxl - 28} ${sy + 14} Z`} fill={look.top === "shirt" ? look.topColor : "#FFFFFF"} stroke={c} strokeWidth={1.5} />
          <path d={`M ${cxl + 22} ${sy - 8} L ${cxl + 2} ${sy + 20} L ${cxl + 28} ${sy + 14} Z`} fill={look.top === "shirt" ? look.topColor : "#FFFFFF"} stroke={c} strokeWidth={1.5} />
          {look.top === "shirt"
            ? [0.3, 0.55, 0.8].map((k) => <circle key={k} cx={cxl - bt * 5 * k} cy={sy + 20 + (hy - sy - 20) * k} r={3} fill="#FFFFFF" opacity={0.85} />)
            : null}
        </g>,
      );
    } else if (look.top === "sweater") {
      els.push(<path key="neck" d={`M ${cxl - 22} ${sy - 4} Q ${cxl} ${sy + 16} ${cxl + 22} ${sy - 4}`} stroke={look.topShade} strokeWidth={7} fill="none" />);
      els.push(<rect key="rib" x={ox - hw} y={hy - 4} width={hw * 2} height={12} fill={look.topShade} clipPath={`url(#${tid})`} />);
    } else if (look.top === "hoodie") {
      els.push(<path key="hood" d={`M ${cxl - sw * 0.5} ${sy + 2} Q ${cxl} ${sy + 30} ${cxl + sw * 0.5} ${sy + 2} Q ${cxl + sw * 0.62} ${sy - 18} ${cxl} ${sy - 22} Q ${cxl - sw * 0.62} ${sy - 18} ${cxl - sw * 0.5} ${sy + 2} Z`} fill={look.topShade} />);
      els.push(<rect key="pocket" x={cxl - sw * 0.55} y={wy - 10} width={sw * 1.1} height={(hy - wy) * 0.9} rx={10} fill={look.topShade} opacity={0.7} clipPath={`url(#${tid})`} />);
      els.push(<line key="str1" x1={cxl - 8} y1={sy + 10} x2={cxl - 10} y2={sy + 50} stroke="#FFFFFF" strokeWidth={3} opacity={0.7} />);
      els.push(<line key="str2" x1={cxl + 8} y1={sy + 10} x2={cxl + 10} y2={sy + 50} stroke="#FFFFFF" strokeWidth={3} opacity={0.7} />);
    } else if (look.top === "tee") {
      els.push(<path key="neck" d={`M ${cxl - 20} ${sy - 4} Q ${cxl} ${sy + 12} ${cxl + 20} ${sy - 4}`} stroke={look.topShade} strokeWidth={5} fill="none" />);
    }
    return els;
  })();

  // ---------- руки ----------
  const arm = (side: -1 | 1, st: ArmState) => {
    const S = { x: ox + side * (b.shoulderHalf - b.limb * 0.45) * ws + bt * 6, y: sy + b.limb * 0.45 };
    const target = st.target ?? { x: ox + side * (hw + b.thigh * 0.3) + bt * 10, y: hy + 44 };
    const pref = !st.target ? { x: side * 0.25, y: 1 } : st.elbow === "down" ? { x: side * 0.5, y: 1 } : st.elbow === "in" ? { x: -side, y: 0.4 } : { x: side, y: 0.35 };
    const { mid: E, end: W } = twoBone(S, target, b.upperArm, b.forearm, pref);
    const foreAng = deg(Math.atan2(W.y - E.y, W.x - E.x)) - 90;
    const shortSleeve = look.top === "tee";
    const sleeve = look.top === "vest" ? look.inner : look.top === "suit" ? look.topColor : look.topColor;
    const cuff = shortSleeve ? mixV(S, E, 0.75) : mixV(E, W, 0.84);
    const shape = st.shape ?? (st.target ? "relax" : "rest");
    const hand = (part: "back" | "front") => (
      <Hand x={W.x} y={W.y} angle={foreAng + (st.wrist ?? 0)} side={side} len={b.hand} skin={look.skin} shade={look.skinShade} shape={shape} spread={st.spread ?? 0} part={part} />
    );
    const limbs = (
      <g>
        {shortSleeve ? (
          <>
            <path d={`M ${S.x} ${S.y} L ${cuff.x} ${cuff.y}`} stroke={sleeve} strokeWidth={b.limb * 1.08} strokeLinecap="round" />
            <path d={`M ${cuff.x} ${cuff.y} L ${E.x} ${E.y} L ${W.x} ${W.y}`} stroke={look.skin} strokeWidth={b.limb * 0.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        ) : (
          <>
            <path d={`M ${S.x} ${S.y} L ${E.x} ${E.y}`} stroke={sleeve} strokeWidth={b.limb} strokeLinecap="round" />
            <path d={`M ${E.x} ${E.y} L ${cuff.x} ${cuff.y}`} stroke={sleeve} strokeWidth={b.limb * 0.92} strokeLinecap="round" />
            {look.top === "suit" ? <circle cx={cuff.x} cy={cuff.y} r={b.limb * 0.42} fill="#FFFFFF" /> : null}
            <path d={`M ${cuff.x} ${cuff.y} L ${W.x} ${W.y}`} stroke={look.skin} strokeWidth={b.limb * 0.66} strokeLinecap="round" />
          </>
        )}
      </g>
    );
    return { side, limbs, back: hand("back"), front: hand("front") };
  };
  const arms = [arm(-1, pose.armL ?? REST), arm(1, pose.armR ?? REST)];
  // ближняя к камере рука рисуется последней
  const ordered = sgn > 0 ? [arms[0], arms[1]] : [arms[1], arms[0]];
  const armsBack = ordered.map((a) => <g key={`ab${a.side}`}>{a.back}</g>);
  const armsFront = ordered.map((a) => (
    <g key={`af${a.side}`}>
      {a.limbs}
      {a.front}
    </g>
  ));
  if (layer === "armsBack") return <g>{armsBack}</g>;
  if (layer === "armsFront") return <g>{armsFront}</g>;
  if (layer === "arms")
    return (
      <g>
        {armsBack}
        {armsFront}
      </g>
    );

  // ---------- голова ----------
  const neckX = ox + bt * 8;
  const neckTop = b.neckTop + leanY + shy * 0.8;
  const headCx = neckX + bt * 4;
  const headCy = b.headY + leanY * 1.15 + shy * 0.8 + pose.nod * 0.6;
  const headRot = pose.headTilt + sgn * at * pose.lean * 0.15;
  const headProps = { uid, look, cx: headCx, cy: headCy, turn: pose.headTurn, lookX: pose.lookX, lookY: pose.lookY, nod: pose.nod, expr: pose.expr, mouth: pose.mouth, blink: pose.blink };
  return (
    <g>
      <clipPath id={tid}>
        <path d={torso} />
      </clipPath>
      <ellipse cx={ox} cy={hy + 70} rx={hw + b.thigh * 0.5} ry={b.leg * 0.45} fill="rgba(40,35,60,0.12)" />
      {legs}
      {pelvis}
      <g transform={`rotate(${headRot} ${neckX} ${neckTop})`}>
        <Head {...headProps} part="back" />
      </g>
      {clothes}
      <rect x={neckX - b.headRx * 0.27} y={neckTop - 10} width={b.headRx * 0.54} height={sy - neckTop + 16} rx={10} fill={look.skin} />
      <ellipse cx={neckX} cy={neckTop + 4} rx={b.headRx * 0.3} ry={9} fill={look.skinShade} opacity={0.5} />
      <g transform={`rotate(${headRot} ${neckX} ${neckTop})`}>
        <Head {...headProps} part="front" />
      </g>
      {layer === "all" ? (
        <>
          {armsBack}
          {armsFront}
        </>
      ) : null}
    </g>
  );
};

const mixV = (a: Vec, b: Vec, t: number): Vec => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
