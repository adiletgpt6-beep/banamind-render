// Голова: лицо с поворотом (черты смещаются к стороне взгляда, дальний глаз
// уже), глаза с веками и морганием, брови, нос, рот по фонемам, уши,
// причёски мальчиков, тюбетейка и аккуратная борода учителя.
import type { Viseme } from "../context";
import type { Look } from "./looks";
import type { Expression } from "./pose";

type HeadProps = {
  readonly uid: string;
  readonly look: Look;
  readonly cx: number;
  readonly cy: number;
  readonly turn: number;
  readonly lookX: number;
  readonly lookY: number;
  readonly nod: number;
  readonly expr: Expression;
  readonly mouth: Viseme;
  readonly blink: number;
  readonly part: "back" | "front";
};

const INK = "#231F2B";

const eyePath = (x: number, y: number, w: number, h: number, outer: number) => {
  const l = x - w / 2;
  const r = x + w / 2;
  const lo = outer < 0 ? -h * 0.18 : 0;
  const ro = outer > 0 ? -h * 0.18 : 0;
  return `M ${l} ${y + lo} C ${l + w * 0.2} ${y - h * 1.05} ${r - w * 0.25} ${y - h * 1.1} ${r} ${y + ro} C ${r - w * 0.22} ${y + h * 0.95} ${l + w * 0.22} ${y + h * 0.95} ${l} ${y + lo} Z`;
};

export const Head: React.FC<HeadProps> = (p) => (p.part === "back" ? <HeadBack {...p} /> : <HeadFront {...p} />);

const HeadBack: React.FC<HeadProps> = ({ look, cx, cy, turn }) => {
  const b = look.build;
  const rx = b.headRx;
  const ry = b.headRy;
  const shift = -turn * rx * 0.12;
  const els: React.ReactNode[] = [];
  const capRy = look.hairStyle === "buzz" ? ry * 0.96 : ry * 0.99;
  els.push(<ellipse key="cap" cx={cx + shift} cy={cy - ry * 0.22} rx={rx * (look.hairStyle === "curly" ? 1.12 : 1.05)} ry={capRy} fill={look.hair} />);
  if (look.hairStyle === "curly") {
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (0.1 + (0.8 * i) / 6);
      els.push(<circle key={`c${i}`} cx={cx + shift - Math.cos(a) * rx * 1.02} cy={cy - ry * 0.3 - Math.sin(a) * ry * 0.92} r={rx * 0.2} fill={look.hair} />);
    }
  }
  // уши (дальнее уходит за лицо при повороте)
  for (const side of [-1, 1] as const) {
    const ex = cx + side * rx * 0.97 - turn * rx * 0.32;
    els.push(<ellipse key={`ear${side}`} cx={ex} cy={cy + ry * 0.1} rx={rx * 0.17} ry={ry * 0.22} fill={look.skin} />);
    els.push(<ellipse key={`earin${side}`} cx={ex + side * 2} cy={cy + ry * 0.12} rx={rx * 0.07} ry={ry * 0.12} fill={look.skinShade} />);
  }
  return <>{els}</>;
};

const HeadFront: React.FC<HeadProps> = ({ uid, look, cx, cy, turn, lookX, lookY, nod, expr, mouth, blink }) => {
  const b = look.build;
  const rx = b.headRx;
  const ry = b.headRy;
  const child = look.child;
  const at = Math.abs(turn);
  const chinX = cx + turn * rx * 0.24;
  const jaw = child ? 0.72 : 0.56;
  const face = `M ${cx - rx} ${cy} C ${cx - rx} ${cy - ry * 1.34} ${cx + rx} ${cy - ry * 1.34} ${cx + rx} ${cy} C ${cx + rx} ${cy + ry * jaw} ${chinX + rx * 0.48} ${cy + ry * 0.99} ${chinX} ${cy + ry} C ${chinX - rx * 0.48} ${cy + ry * 0.99} ${cx - rx} ${cy + ry * jaw} ${cx - rx} ${cy} Z`;
  const fx = cx + turn * rx * 0.42;
  const ny = nod * 0.5;
  const eyeY = cy + ry * (child ? 0.1 : 0.02) + ny;
  const ew = rx * (child ? 0.4 : 0.38);
  const eh = ew * (child ? 0.68 : 0.54);
  const gap = rx * 0.43 * (1 - 0.12 * at);
  const lid = Math.max(expr.lid, blink);
  const eyes = ([-1, 1] as const).map((side) => {
    const far = Math.max(0, side * turn);
    const sx = 1 - 0.45 * far + 0.06 * Math.max(0, -side * turn);
    const ex = fx + side * gap * (1 - 0.25 * far);
    const w = ew * sx;
    const id = `${uid}-e${side < 0 ? "l" : "r"}`;
    const ix = ex + lookX * w * 0.24;
    const iy = eyeY + lookY * eh * 0.22;
    const ir = eh * 0.78;
    const lidY = eyeY - eh * 1.05 + eh * 2.1 * lid;
    return (
      <g key={side}>
        <clipPath id={id}>
          <path d={eyePath(ex, eyeY, w, eh, side)} />
        </clipPath>
        <path d={eyePath(ex, eyeY, w, eh, side)} fill="#FBF8F4" />
        <g clipPath={`url(#${id})`}>
          <circle cx={ix} cy={iy} r={ir} fill="#3B2A22" />
          <circle cx={ix} cy={iy} r={ir * 0.55} fill="#120E10" />
          <circle cx={ix + ir * 0.35} cy={iy - ir * 0.4} r={ir * 0.25} fill="#FFFFFF" opacity={0.9} />
          <rect x={ex - w} y={eyeY - eh * 2} width={w * 2} height={lidY - (eyeY - eh * 2)} fill={look.skin} />
        </g>
        <path
          d={lid > 0.92 ? `M ${ex - w / 2} ${eyeY + eh * 0.15} Q ${ex} ${eyeY + eh * 0.55} ${ex + w / 2} ${eyeY + (side > 0 ? -eh * 0.05 : eh * 0.15)}` : `M ${ex - w / 2 - 1} ${eyeY + (side < 0 ? -eh * 0.18 : 0)} Q ${ex} ${Math.min(lidY, eyeY + eh * 0.6) - eh * 0.25 * (1 - lid)} ${ex + w / 2 + 1} ${eyeY + (side > 0 ? -eh * 0.18 : 0)}`}
          stroke={INK}
          strokeWidth={ew * 0.15}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${ex - side * w * 0.55} ${eyeY - eh * 2.0 - expr.browIn} Q ${ex + side * w * 0.05} ${eyeY - eh * 2.55 - (expr.browIn + expr.browOut) * 0.6} ${ex + side * w * 0.62} ${eyeY - eh * 1.9 - expr.browOut}`}
          stroke={look.brow}
          strokeWidth={ew * (child ? 0.19 : 0.24)}
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx={ex + side * w * 0.15} cy={eyeY + eh * 2.6} rx={w * 0.5} ry={eh * 0.75} fill="#E8826F" opacity={child ? 0.26 : 0.14} />
      </g>
    );
  });
  const nx = fx + turn * rx * 0.2;
  const nyy = cy + ry * (child ? 0.4 : 0.34) + ny;
  const nose = (
    <g>
      <path d={`M ${nx - 2 + turn * 4} ${nyy - ry * 0.2} Q ${nx + turn * 9} ${nyy} ${nx - 4 + turn * 6} ${nyy + 4}`} stroke={look.skinShade} strokeWidth={3} fill="none" strokeLinecap="round" />
      <ellipse cx={nx + turn * 3} cy={nyy + 3} rx={rx * 0.1} ry={ry * 0.04} fill={look.skinShade} opacity={0.6} />
    </g>
  );
  const mx = fx + turn * rx * 0.1;
  const my = cy + ry * (child ? 0.64 : 0.6) + ny;
  const mw = rx * (child ? 0.42 : 0.46) * (1 - 0.25 * at);
  const sm = expr.smile;
  let mouthEl: React.ReactNode;
  if (mouth.open < 0.05) {
    const w = mw * (1 + 0.15 * sm) * (1 - 0.25 * mouth.round);
    mouthEl = <path d={`M ${mx - w / 2} ${my - sm * 3} Q ${mx} ${my + sm * 7 + 2} ${mx + w / 2} ${my - sm * 3}`} stroke={look.lips} strokeWidth={child ? 4.5 : 4} fill="none" strokeLinecap="round" />;
  } else {
    const w = mw * (0.82 + 0.38 * mouth.wide - 0.42 * mouth.round + 0.12 * sm);
    const h = (3 + 24 * mouth.open) * (1 + 0.2 * mouth.round) * (child ? 0.95 : 1);
    const top = my - h * 0.3 - sm * 2;
    const bot = my + h * 0.75;
    const d = `M ${mx - w / 2} ${my - sm * 2} C ${mx - w * 0.3} ${top} ${mx + w * 0.3} ${top} ${mx + w / 2} ${my - sm * 2} C ${mx + w * 0.42} ${bot} ${mx - w * 0.42} ${bot} ${mx - w / 2} ${my - sm * 2} Z`;
    const id = `${uid}-m`;
    mouthEl = (
      <g>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
        <path d={d} fill="#5E2427" />
        <g clipPath={`url(#${id})`}>
          {mouth.round < 0.6 && mouth.open > 0.2 ? <rect x={mx - w / 2} y={top - 4} width={w} height={h * 0.28 + 4} fill="#F7F3EE" /> : null}
          {mouth.open > 0.35 ? <ellipse cx={mx} cy={bot - h * 0.05} rx={w * 0.32} ry={h * 0.3} fill="#C9575E" /> : null}
        </g>
        <path d={d} fill="none" stroke={look.lips} strokeWidth={2.5} />
      </g>
    );
  }
  // борода учителя: вдоль нижней челюсти и подбородка, рот поверх
  const beard = look.beard ? (
    <g clipPath={`url(#${uid}-f`}>
      <path
        d={`M ${cx - rx * 0.98} ${cy + ry * 0.22} C ${cx - rx * 0.9} ${cy + ry * 0.95} ${cx + rx * 0.9} ${cy + ry * 0.95} ${cx + rx * 0.98} ${cy + ry * 0.22} L ${cx + rx * 1.1} ${cy + ry * 1.2} L ${cx - rx * 1.1} ${cy + ry * 1.2} Z`}
        fill={look.beard}
      />
      {/* верхняя граница бороды: кожа щёк над ней */}
      <path d={`M ${cx - rx * 0.98} ${cy + ry * 0.22} C ${cx - rx * 0.85} ${cy + ry * 0.75} ${mx - rx * 0.36} ${cy + ry * 0.74} ${mx - rx * 0.32} ${my - 4} L ${mx + rx * 0.32} ${my - 4} C ${mx + rx * 0.36} ${cy + ry * 0.74} ${cx + rx * 0.85} ${cy + ry * 0.75} ${cx + rx * 0.98} ${cy + ry * 0.22} Z`} fill={look.skin} />
      {/* аккуратные усы */}
      <path d={`M ${mx - rx * 0.3} ${my - 6} Q ${mx} ${my - 14} ${mx + rx * 0.3} ${my - 6}`} stroke={look.beard} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  ) : null;
  return (
    <>
      <path d={face} fill={look.skin} />
      <clipPath id={`${uid}-f`}>
        <path d={face} />
      </clipPath>
      <g clipPath={`url(#${uid}-f)`}>
        <path d={face} fill={look.skinShade} opacity={0.16 + at * 0.12} transform={`translate(${(turn >= 0 ? 1 : -1) * rx * (1.62 - at * 0.45)} 0)`} />
      </g>
      {beard}
      {eyes}
      {nose}
      {mouthEl}
      <HairFront look={look} cx={cx} cy={cy} turn={turn} />
      {look.cap ? <Cap look={look} cx={cx} cy={cy} turn={turn} /> : null}
    </>
  );
};

// Тюбетейка: невысокая шапочка с плоским верхом и узором по околышу.
const Cap: React.FC<{ look: Look; cx: number; cy: number; turn: number }> = ({ look, cx, cy, turn }) => {
  const rx = look.build.headRx;
  const ry = look.build.headRy;
  const s = turn * rx * 0.22;
  const top = cy - ry * 1.3;
  const band = cy - ry * 0.78;
  return (
    <g>
      <path d={`M ${cx - rx * 1.02 + s * 0.3} ${band} C ${cx - rx * 1.04 + s * 0.5} ${top + ry * 0.05} ${cx - rx * 0.7 + s} ${top - 4} ${cx + s} ${top - 5} C ${cx + rx * 0.7 + s} ${top - 4} ${cx + rx * 1.04 + s * 0.5} ${top + ry * 0.05} ${cx + rx * 1.02 + s * 0.3} ${band} Z`} fill={look.cap} />
      <path d={`M ${cx - rx * 1.02 + s * 0.3} ${band} Q ${cx + s * 0.4} ${band + ry * 0.16} ${cx + rx * 1.02 + s * 0.3} ${band}`} stroke="#F1E3B8" strokeWidth={5} fill="none" />
      {[-0.6, -0.2, 0.2, 0.6].map((k) => (
        <path key={k} d={`M ${cx + k * rx + s * 0.4 - 7} ${band - 10} L ${cx + k * rx + s * 0.4} ${band - 22} L ${cx + k * rx + s * 0.4 + 7} ${band - 10} Z`} fill="#F1E3B8" opacity={0.9} />
      ))}
    </g>
  );
};

// Передние пряди и линия роста волос.
const HairFront: React.FC<{ look: Look; cx: number; cy: number; turn: number }> = ({ look, cx, cy, turn }) => {
  const b = look.build;
  const rx = b.headRx;
  const ry = b.headRy;
  const hair = look.hair;
  const s = turn * rx * 0.28;
  const top = cy - ry * 1.12;
  switch (look.hairStyle) {
    case "short":
    case "teacher":
      return (
        <path
          d={`M ${cx - rx * 1.02} ${cy - ry * 0.05} C ${cx - rx * 1.1} ${cy - ry * 0.9} ${cx - rx * 0.55} ${top - 6} ${cx + s * 0.5} ${top - 8} C ${cx + rx * 0.6} ${top - 6} ${cx + rx * 1.1} ${cy - ry * 0.9} ${cx + rx * 1.02} ${cy - ry * 0.05} L ${cx + rx * 0.9} ${cy - ry * 0.3} C ${cx + rx * 0.7} ${cy - ry * 0.5} ${cx + s} ${cy - ry * 0.56} ${cx - rx * 0.3 + s} ${cy - ry * 0.52} C ${cx - rx * 0.7} ${cy - ry * 0.6} ${cx - rx * 0.9} ${cy - ry * 0.4} ${cx - rx * 0.92} ${cy - ry * 0.25} Z`}
          fill={hair}
        />
      );
    case "buzz":
      return (
        <path
          d={`M ${cx - rx * 1.0} ${cy - ry * 0.3} C ${cx - rx * 1.05} ${cy - ry * 0.95} ${cx - rx * 0.5} ${top} ${cx + s * 0.5} ${top - 2} C ${cx + rx * 0.5} ${top} ${cx + rx * 1.05} ${cy - ry * 0.95} ${cx + rx * 1.0} ${cy - ry * 0.3} L ${cx + rx * 0.92} ${cy - ry * 0.45} C ${cx + rx * 0.6} ${cy - ry * 0.7} ${cx - rx * 0.6 + s} ${cy - ry * 0.7} ${cx - rx * 0.92} ${cy - ry * 0.45} Z`}
          fill={hair}
          opacity={0.92}
        />
      );
    case "fringe":
      return (
        <path
          d={`M ${cx - rx * 1.04} ${cy + ry * 0.05} C ${cx - rx * 1.12} ${cy - ry * 0.9} ${cx - rx * 0.6} ${top} ${cx} ${top} C ${cx + rx * 0.6} ${top} ${cx + rx * 1.12} ${cy - ry * 0.9} ${cx + rx * 1.04} ${cy + ry * 0.05} L ${cx + rx * 0.9} ${cy - ry * 0.25} Q ${cx + rx * 0.5 + s} ${cy - ry * 0.36} ${cx + s} ${cy - ry * 0.3} Q ${cx - rx * 0.5 + s} ${cy - ry * 0.36} ${cx - rx * 0.9} ${cy - ry * 0.25} Z`}
          fill={hair}
        />
      );
    case "sidePart": {
      const part = cx - rx * 0.35 + s;
      return (
        <path
          d={`M ${cx - rx * 1.02} ${cy - ry * 0.05} C ${cx - rx * 1.1} ${cy - ry * 0.9} ${cx - rx * 0.55} ${top - 6} ${cx + s * 0.5} ${top - 8} C ${cx + rx * 0.6} ${top - 6} ${cx + rx * 1.1} ${cy - ry * 0.9} ${cx + rx * 1.02} ${cy - ry * 0.05} L ${cx + rx * 0.92} ${cy - ry * 0.2} C ${cx + rx * 0.8} ${cy - ry * 0.62} ${part + rx * 0.5} ${cy - ry * 0.8} ${part} ${cy - ry * 0.86} C ${part - rx * 0.15} ${cy - ry * 0.6} ${cx - rx * 0.75} ${cy - ry * 0.5} ${cx - rx * 0.92} ${cy - ry * 0.25} Z`}
          fill={hair}
        />
      );
    }
    case "wavy":
      return (
        <path
          d={`M ${cx - rx * 1.04} ${cy - ry * 0.02} C ${cx - rx * 1.12} ${cy - ry * 0.95} ${cx - rx * 0.6} ${top - 8} ${cx + s * 0.4} ${top - 10} C ${cx + rx * 0.6} ${top - 8} ${cx + rx * 1.12} ${cy - ry * 0.95} ${cx + rx * 1.04} ${cy - ry * 0.02} Q ${cx + rx * 0.86} ${cy - ry * 0.3} ${cx + rx * 0.7} ${cy - ry * 0.45} Q ${cx + rx * 0.4 + s} ${cy - ry * 0.75} ${cx + rx * 0.1 + s} ${cy - ry * 0.5} Q ${cx - rx * 0.25 + s} ${cy - ry * 0.78} ${cx - rx * 0.5} ${cy - ry * 0.5} Q ${cx - rx * 0.8} ${cy - ry * 0.72} ${cx - rx * 0.94} ${cy - ry * 0.3} Z`}
          fill={hair}
        />
      );
    case "curly":
      return (
        <g>
          <path
            d={`M ${cx - rx * 1.06} ${cy - ry * 0.1} C ${cx - rx * 1.15} ${cy - ry * 1.0} ${cx - rx * 0.6} ${top - 10} ${cx + s * 0.4} ${top - 12} C ${cx + rx * 0.6} ${top - 10} ${cx + rx * 1.15} ${cy - ry * 1.0} ${cx + rx * 1.06} ${cy - ry * 0.1} L ${cx + rx * 0.95} ${cy - ry * 0.4} C ${cx + rx * 0.5} ${cy - ry * 0.62} ${cx - rx * 0.5 + s} ${cy - ry * 0.62} ${cx - rx * 0.95} ${cy - ry * 0.4} Z`}
            fill={hair}
          />
          {[-0.75, -0.45, -0.15, 0.15, 0.45, 0.75].map((k) => (
            <circle key={k} cx={cx + k * rx + s * 0.5} cy={cy - ry * (0.5 + 0.12 * Math.cos(k * 2))} r={rx * 0.17} fill={hair} />
          ))}
        </g>
      );
    default:
      return null;
  }
};
