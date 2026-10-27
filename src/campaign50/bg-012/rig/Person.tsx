// Герой целиком (вид спереди): ноги (сидя/стоя), туловище с одеждой,
// руки с двухзвенной кинематикой (локоть вычисляется по положению кисти —
// без «ломаных» суставов), кисти разных жестов, голова с мимикой.
// Начало координат — основание шеи; y вниз.
import { Head, type Face } from "./Head";
import { LOOKS, type LookId } from "./looks";

export type HandKind = "rest" | "hold" | "open" | "point" | "flat";
export type HandPose = {
  readonly x: number;
  readonly y: number;
  readonly kind?: HandKind;
  // рука перед туловищем (по умолчанию) или за ним
  readonly behind?: boolean;
  // локоть наружу (по умолчанию) или прижат внутрь
  readonly elbowIn?: boolean;
};

export type PersonPose = {
  readonly lean?: number; // наклон корпуса, град
  readonly tilt?: number; // наклон головы, град
  readonly nod?: number; // кивок, px вниз
  readonly breathe?: number; // 0…1
  readonly shrug?: number; // 0…1
  readonly l: HandPose; // левая рука на экране
  readonly r: HandPose; // правая рука на экране
  readonly legs?: "sit" | "stand" | "none";
};

const f1 = (n: number) => n.toFixed(1);

// Локоть по положению плеча S и кисти H (длины a, b).
const elbow = (sx: number, sy: number, hx: number, hy: number, a: number, b: number, side: number, inward: boolean) => {
  let dx = hx - sx;
  let dy = hy - sy;
  let d = Math.hypot(dx, dy);
  const max = (a + b) * 0.995;
  if (d > max) {
    dx *= max / d;
    dy *= max / d;
    d = max;
  }
  d = Math.max(d, Math.abs(a - b) + 1);
  const ang = Math.atan2(dy, dx);
  const cosA = Math.min(1, Math.max(-1, (a * a + d * d - b * b) / (2 * a * d)));
  const off = Math.acos(cosA);
  const c1 = { x: sx + a * Math.cos(ang + off), y: sy + a * Math.sin(ang + off) };
  const c2 = { x: sx + a * Math.cos(ang - off), y: sy + a * Math.sin(ang - off) };
  // по умолчанию локоть наружу (дальше от середины корпуса); elbowIn —
  // локоть прижат к корпусу
  const pick = inward ? (side * c1.x < side * c2.x ? c1 : c2) : side * c1.x > side * c2.x ? c1 : c2;
  return { e: pick, h: { x: sx + dx, y: sy + dy } };
};

const Hand: React.FC<{ x: number; y: number; ang: number; r: number; kind: HandKind; skin: string; shade: string; side: number }> = ({
  x,
  y,
  ang,
  r,
  kind,
  skin,
  shade,
  side,
}) => {
  const deg = (ang * 180) / Math.PI;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(deg)})`}>
      {kind === "point" ? (
        <>
          <rect x={r * 0.4} y={-r * 0.32} width={r * 1.55} height={r * 0.62} rx={r * 0.31} fill={skin} />
          <ellipse cx={r * 0.1} cy={0} rx={r * 0.95} ry={r * 0.82} fill={skin} />
          <ellipse cx={r * 0.25} cy={side * -r * 0.7} rx={r * 0.48} ry={r * 0.3} fill={skin} />
        </>
      ) : kind === "open" || kind === "flat" ? (
        <>
          <ellipse cx={r * 0.35} cy={0} rx={r * 1.15} ry={r * (kind === "flat" ? 0.7 : 0.88)} fill={skin} />
          {[-0.45, -0.15, 0.15, 0.45].map((k) => (
            <rect key={k} x={r * 0.9} y={r * k * 1.3 - r * 0.17} width={r * 0.9} height={r * 0.34} rx={r * 0.17} fill={skin} />
          ))}
          <ellipse cx={r * 0.2} cy={side * -r * 0.85} rx={r * 0.5} ry={r * 0.3} fill={skin} transform={`rotate(${side * -25} ${r * 0.2} ${side * -r * 0.85})`} />
        </>
      ) : (
        <>
          <ellipse cx={r * 0.2} cy={0} rx={r * 1.0} ry={r * 0.92} fill={skin} />
          <path d={`M ${f1(r * 0.55)} ${f1(-r * 0.5)} Q ${f1(r * 1.05)} 0 ${f1(r * 0.55)} ${f1(r * 0.5)}`} stroke={shade} strokeWidth={2.5} fill="none" opacity={0.6} />
          <ellipse cx={r * 0.5} cy={side * -r * 0.62} rx={r * 0.46} ry={r * 0.3} fill={skin} />
        </>
      )}
    </g>
  );
};

export const Person: React.FC<{
  readonly uid: string;
  readonly look: LookId;
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly pose: PersonPose;
  readonly face: Face;
  // предмет в руках: рисуется перед туловищем, но за кистями
  readonly prop?: React.ReactNode;
  // предмет поверх кистей
  readonly propFront?: React.ReactNode;
}> = ({ uid, look: lookId, x, y, scale = 1, pose, face, prop, propFront }) => {
  const look = LOOKS[lookId];
  const b = look.build;
  const br = (pose.breathe ?? 0.5) - 0.5;
  const shrug = pose.shrug ?? 0;
  const up = br * 3 + shrug * 10;
  const T = b.torso;
  const sh = b.shoulder;
  const hp = b.hip;
  const lean = pose.lean ?? 0;
  const legs = pose.legs ?? "sit";

  const torsoD = `M ${f1(-sh + 20)} ${f1(-4 - up)} C ${f1(-sh - 8)} ${f1(-2 - up)} ${f1(-sh - 6)} ${f1(30 - up)} ${f1(-sh - 2)} ${f1(46)} L ${f1(-hp - 4)} ${f1(T - 12)} Q ${f1(-hp)} ${f1(T + 6)} ${f1(-hp + 18)} ${f1(T + 8)} L ${f1(hp - 18)} ${f1(T + 8)} Q ${f1(hp)} ${f1(T + 6)} ${f1(hp + 4)} ${f1(T - 12)} L ${f1(sh + 2)} ${f1(46)} C ${f1(sh + 6)} ${f1(30 - up)} ${f1(sh + 8)} ${f1(-2 - up)} ${f1(sh - 20)} ${f1(-4 - up)} Q 0 ${f1(-14 - up)} ${f1(-sh + 20)} ${f1(-4 - up)} Z`;

  const arm = (side: -1 | 1, hand: HandPose) => {
    const sx = side * (sh - 14);
    const sy = 18 - up;
    const { e, h } = elbow(sx, sy, hand.x, hand.y, b.upper, b.fore, side, Boolean(hand.elbowIn));
    const ang = Math.atan2(h.y - e.y, h.x - e.x);
    const sleeveEnd = look.child ? 0.55 : 1;
    const sx2 = sx + (e.x - sx) * sleeveEnd;
    const sy2 = sy + (e.y - sy) * sleeveEnd;
    // запястье немного не доходит до центра кисти
    const wx = h.x - Math.cos(ang) * b.hand * 0.4;
    const wy = h.y - Math.sin(ang) * b.hand * 0.4;
    const kind = hand.kind ?? "rest";
    return (
      <g key={side}>
        {look.child ? (
          <path d={`M ${f1(sx)} ${f1(sy)} L ${f1(e.x)} ${f1(e.y)} L ${f1(wx)} ${f1(wy)}`} stroke={look.skin} strokeWidth={b.arm * 0.78} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
        <path
          d={look.child ? `M ${f1(sx)} ${f1(sy)} L ${f1(sx2)} ${f1(sy2)}` : `M ${f1(sx)} ${f1(sy)} L ${f1(e.x)} ${f1(e.y)} L ${f1(wx)} ${f1(wy)}`}
          stroke={look.top}
          strokeWidth={b.arm}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {!look.child ? (
          <path
            d={`M ${f1(wx - Math.cos(ang) * 10)} ${f1(wy - Math.sin(ang) * 10)} L ${f1(wx)} ${f1(wy)}`}
            stroke={look.topShade}
            strokeWidth={b.arm * 0.96}
            strokeLinecap="round"
          />
        ) : null}
        <Hand x={h.x} y={h.y} ang={ang} r={b.hand} kind={kind} skin={look.skin} shade={look.skinShade} side={side} />
      </g>
    );
  };

  const legEls: React.ReactNode[] = [];
  if (legs === "sit") {
    // вид спереди: бёдра направлены к зрителю — видны колени и голени
    const ky = T + 34;
    legEls.push(<rect key="lap" x={-hp - 6} y={T - 24} width={hp * 2 + 12} height={ky - T + 40} rx={30} fill={look.pants} />);
    for (const side of [-1, 1] as const) {
      const lx = side * hp * 0.5;
      legEls.push(
        <g key={side}>
          <rect x={lx - b.leg / 2 + side * 4} y={ky} width={b.leg} height={b.shin} rx={b.leg / 2.2} fill={look.pants} />
          <ellipse cx={lx + side * 4} cy={ky + 8} rx={b.leg * 0.62} ry={b.leg * 0.5} fill={look.pants} />
          <ellipse cx={lx + side * 4} cy={ky + 2} rx={b.leg * 0.4} ry={b.leg * 0.22} fill="#FFFFFF" opacity={0.08} />
          <ellipse cx={lx + side * 12} cy={ky + b.shin + 4} rx={b.leg * 0.75} ry={b.leg * 0.36} fill={look.shoe} />
        </g>,
      );
    }
  } else if (legs === "stand") {
    for (const side of [-1, 1] as const) {
      const lx = side * hp * 0.45;
      legEls.push(
        <g key={side}>
          <rect x={lx - b.leg / 2} y={T - 10} width={b.leg} height={b.thigh + b.shin + 10} rx={b.leg / 2.4} fill={look.pants} />
          <path
            d={`M ${f1(lx - b.leg * 0.62)} ${f1(T + b.thigh + b.shin + 12)} Q ${f1(lx - b.leg * 0.6)} ${f1(T + b.thigh + b.shin - 10)} ${f1(lx)} ${f1(T + b.thigh + b.shin - 8)} Q ${f1(lx + b.leg * 0.75 + side * 6)} ${f1(T + b.thigh + b.shin - 6)} ${f1(lx + b.leg * 0.8 + side * 6)} ${f1(T + b.thigh + b.shin + 12)} Z`}
            fill={look.shoe}
            stroke="#C9CED8"
            strokeWidth={3}
          />
        </g>,
      );
    }
  }

  // детали одежды
  const clothes: React.ReactNode[] = [];
  if (lookId === "mom") {
    clothes.push(
      <path key="tee" d={`M ${f1(-30)} ${f1(-8 - up)} L 30 ${f1(-8 - up)} L 18 ${f1(T * 0.72)} L -18 ${f1(T * 0.72)} Z`} fill={look.topAccent} />,
      <path key="edgeL" d={`M -30 ${f1(-8 - up)} L -16 ${f1(T + 6)}`} stroke={look.topShade} strokeWidth={6} strokeLinecap="round" />,
      <path key="edgeR" d={`M 30 ${f1(-8 - up)} L 16 ${f1(T + 6)}`} stroke={look.topShade} strokeWidth={6} strokeLinecap="round" />,
      <path key="hem" d={`M ${f1(-hp + 6)} ${f1(T - 4)} L ${f1(hp - 6)} ${f1(T - 4)}`} stroke={look.topShade} strokeWidth={8} opacity={0.7} />,
    );
  } else if (lookId === "dad") {
    clothes.push(
      <path key="collar" d={`M -30 ${f1(-6 - up)} Q 0 ${f1(26 - up)} 30 ${f1(-6 - up)}`} stroke={look.topAccent} strokeWidth={10} fill="none" strokeLinecap="round" />,
      <path key="rib" d={`M ${f1(-hp + 4)} ${f1(T - 6)} L ${f1(hp - 4)} ${f1(T - 6)}`} stroke={look.topShade} strokeWidth={12} />,
    );
  } else {
    clothes.push(
      <rect key="stripe" x={-sh - 2} y={T * 0.42} width={sh * 2 + 4} height={22} fill={look.topAccent} />,
      <path key="neck" d={`M -20 ${f1(-6 - up)} Q 0 ${f1(12 - up)} 20 ${f1(-6 - up)}`} stroke={look.topShade} strokeWidth={6} fill="none" strokeLinecap="round" />,
    );
  }

  const headY = -b.neck - b.headRy * 0.9 - up + (pose.nod ?? 0);
  const tilt = pose.tilt ?? 0;
  const back = ([-1, 1] as const).filter((s) => (s === -1 ? pose.l : pose.r).behind);
  const front = ([-1, 1] as const).filter((s) => !(s === -1 ? pose.l : pose.r).behind);

  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${scale})`}>
      {legEls}
      <g transform={`rotate(${f1(lean)} 0 ${T})`}>
        {back.map((s) => arm(s, s === -1 ? pose.l : pose.r))}
        <rect x={-b.neckW / 2} y={-b.neck - 14 - up} width={b.neckW} height={b.neck + 24} rx={b.neckW / 3} fill={look.skin} />
        <ellipse cx={0} cy={-6 - up} rx={b.neckW * 0.55} ry={8} fill={look.skinShade} opacity={0.5} />
        <path d={torsoD} fill={look.top} />
        {clothes}
        <g transform={`rotate(${f1(tilt)} 0 ${f1(-b.neck * 0.4 - up)}) translate(0 ${f1(headY)})`}>
          <Head uid={uid} look={look} face={face} />
        </g>
        {prop}
        {front.map((s) => arm(s, s === -1 ? pose.l : pose.r))}
        {propFront}
      </g>
    </g>
  );
};

// Мировая точка → локальные координаты руки героя (с учётом наклона
// корпуса lean вокруг бёдер), чтобы кисть точно попала в предмет мира.
export const toLocal = (wx: number, wy: number, x: number, y: number, scale: number, lean: number, look: LookId) => {
  const T = LOOKS[look].build.torso;
  const lx = (wx - x) / scale;
  const ly = (wy - y) / scale;
  const a = (-lean * Math.PI) / 180;
  const dy = ly - T;
  return { x: lx * Math.cos(a) - dy * Math.sin(a), y: lx * Math.sin(a) + dy * Math.cos(a) + T };
};
