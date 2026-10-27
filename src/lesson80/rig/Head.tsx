// Голова персонажа: лицо с поворотом (черты смещаются к стороне взгляда,
// дальний глаз уже), глаза с веками и морганием, брови, нос, рот по
// фонемам речи, уши, причёска (с запаздыванием прядей и кос).
import type { Viseme } from "../core/context";
import type { Look } from "./looks";
import type { Expression } from "./pose";
import { useRigStyle } from "./style";

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
  readonly hairSway: number;
  readonly part: "back" | "front";
};

const INK = "#1E1B26";

// Миндалевидный глаз: внешний уголок чуть выше внутреннего.
const eyePath = (x: number, y: number, w: number, h: number, outer: number) => {
  const l = x - w / 2;
  const r = x + w / 2;
  const lo = outer < 0 ? -h * 0.18 : 0; // внешний угол слева
  const ro = outer > 0 ? -h * 0.18 : 0;
  return `M ${l} ${y + lo} C ${l + w * 0.2} ${y - h * 1.05} ${r - w * 0.25} ${y - h * 1.1} ${r} ${y + ro} C ${r - w * 0.22} ${y + h * 0.95} ${l + w * 0.22} ${y + h * 0.95} ${l} ${y + lo} Z`;
};

export const Head: React.FC<HeadProps> = (p) => (p.part === "back" ? <HeadBack {...p} /> : <HeadFront {...p} />);

// Задний план головы: волосы за головой, косы, хвост, уши.
const HeadBack: React.FC<HeadProps> = ({ look, cx, cy, turn }) => {
  const b = look.build;
  const rx = b.headRx;
  const ry = b.headRy;
  const hair = look.hair;
  const shift = -turn * rx * 0.12;
  const els: React.ReactNode[] = [];
  const curly = look.hairStyle === "boyCurly";
  els.push(<ellipse key="cap" cx={cx + shift} cy={cy - ry * 0.22} rx={rx * (curly ? 1.1 : 1.05)} ry={ry * (curly ? 1.03 : 0.98)} fill={hair} />);
  if (curly) {
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * 0.95 + (i / 6) * Math.PI * 0.9;
      els.push(<circle key={`curl${i}`} cx={cx + shift + Math.cos(a) * rx * 1.0} cy={cy - ry * 0.22 + Math.sin(a) * ry * 0.95} r={rx * 0.2} fill={hair} />);
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
  const refined = useRigStyle().refined === true;
  const b = look.build;
  const rx = b.headRx;
  const ry = b.headRy;
  const child = b.headRx > 70;
  const at = Math.abs(turn);
  const chinX = cx + turn * rx * 0.24;
  const jaw = child ? 0.7 : 0.55;
  // лицо: овал, подбородок смещается к стороне поворота
  const face = `M ${cx - rx} ${cy} C ${cx - rx} ${cy - ry * 1.34} ${cx + rx} ${cy - ry * 1.34} ${cx + rx} ${cy} C ${cx + rx} ${cy + ry * jaw} ${chinX + rx * 0.48} ${cy + ry * 0.99} ${chinX} ${cy + ry} C ${chinX - rx * 0.48} ${cy + ry * 0.99} ${cx - rx} ${cy + ry * jaw} ${cx - rx} ${cy} Z`;
  const fx = cx + turn * rx * 0.42;
  const ny = nod * 0.5; // при кивке черты лица чуть ниже
  const eyeY = cy + ry * (child ? 0.08 : 0.02) + ny;
  const ew = rx * (child ? 0.4 : 0.39);
  const eh = ew * (child ? 0.66 : 0.54);
  const gap = rx * 0.43 * (1 - 0.12 * at);
  // уточнённый стиль: при взгляде вниз верхнее веко следует за радужкой
  // (взгляд в книгу/на картинку читается как взгляд вниз, а не «в зрителя»)
  const follow = refined ? 0.3 * Math.max(0, Math.min(1, (lookY - 0.35) / 0.45)) : 0;
  const lid = Math.max(expr.lid, blink, follow);
  const eyes = ([-1, 1] as const).map((side) => {
    const far = Math.max(0, side * turn);
    const sx = 1 - 0.45 * far + 0.06 * Math.max(0, -side * turn);
    const ex = fx + side * gap * (1 - 0.25 * far);
    const w = ew * sx;
    const id = `${uid}-eye${side}`;
    // уточнённый стиль: взгляд вниз (на картинку, в книгу) и в сторону заметнее
    const ix = ex + lookX * w * (refined ? 0.28 : 0.24);
    const iy = eyeY + lookY * eh * (refined && lookY > 0 ? 0.42 : 0.22);
    const ir = eh * 0.78;
    // веко: кожа сверху, опускается до lid (1 — глаз закрыт)
    const lidY = eyeY - eh * 1.05 + eh * 2.1 * lid;
    return (
      <g key={side}>
        <clipPath id={id}>
          <path d={eyePath(ex, eyeY, w, eh, side)} />
        </clipPath>
        {refined ? (
          // белок и радужка — только ниже края века: под опущенным веком не
          // проступает светлый контур глаза
          <>
            <clipPath id={`${id}-open`}>
              <rect x={ex - w} y={lidY} width={w * 2} height={eh * 4} />
            </clipPath>
            {/* и ниже линии ресниц: над ней не выглядывает белок (серп или клин) */}
            <clipPath id={`${id}-lash`}>
              <path
                d={
                  lid > 0.92
                    ? `M ${ex - w} ${lidY} L ${ex + w} ${lidY} L ${ex + w} ${eyeY + eh * 3} L ${ex - w} ${eyeY + eh * 3} Z`
                    : `M ${ex - w} ${eyeY + (side < 0 ? -eh * 0.18 : 0) - ew * 0.07} L ${ex - w / 2 - 1} ${eyeY + (side < 0 ? -eh * 0.18 : 0) - ew * 0.07} Q ${ex} ${Math.min(lidY, eyeY + eh * 0.6) - eh * 0.25 * (1 - lid) - ew * 0.07} ${ex + w / 2 + 1} ${eyeY + (side > 0 ? -eh * 0.18 : 0) - ew * 0.07} L ${ex + w} ${eyeY + (side > 0 ? -eh * 0.18 : 0) - ew * 0.07} L ${ex + w} ${eyeY + eh * 3} L ${ex - w} ${eyeY + eh * 3} Z`
                }
              />
            </clipPath>
            {lid < 0.985 ? (
              <g clipPath={`url(#${id}-open)`}>
               <g clipPath={`url(#${id}-lash)`}>
                <path d={eyePath(ex, eyeY, w, eh, side)} fill="#FBF8F4" />
                <g clipPath={`url(#${id})`}>
                  <circle cx={ix} cy={iy} r={ir} fill="#3B2A22" />
                  <circle cx={ix} cy={iy} r={ir * 0.55} fill="#120E10" />
                  <circle cx={ix + ir * 0.35} cy={iy - ir * 0.4} r={ir * 0.25} fill="#FFFFFF" opacity={0.9} />
                </g>
               </g>
              </g>
            ) : null}
          </>
        ) : (
          <>
            <path d={eyePath(ex, eyeY, w, eh, side)} fill="#FBF8F4" />
            <g clipPath={`url(#${id})`}>
              <circle cx={ix} cy={iy} r={ir} fill="#3B2A22" />
              <circle cx={ix} cy={iy} r={ir * 0.55} fill="#120E10" />
              <circle cx={ix + ir * 0.35} cy={iy - ir * 0.4} r={ir * 0.25} fill="#FFFFFF" opacity={0.9} />
              <rect x={ex - w} y={eyeY - eh * 2} width={w * 2} height={lidY - (eyeY - eh * 2)} fill={look.skin} />
            </g>
          </>
        )}
        {/* линия ресниц по краю века */}
        <path
          d={lid > 0.92 ? `M ${ex - w / 2} ${eyeY + eh * 0.15} Q ${ex} ${eyeY + eh * 0.55} ${ex + w / 2} ${eyeY + (side > 0 ? -eh * 0.05 : eh * 0.15)}` : `M ${ex - w / 2 - 1} ${eyeY + (side < 0 ? -eh * 0.18 : 0)} Q ${ex} ${Math.min(lidY, eyeY + eh * 0.6) - eh * 0.25 * (1 - lid)} ${ex + w / 2 + 1} ${eyeY + (side > 0 ? -eh * 0.18 : 0)}`}
          stroke={INK}
          strokeWidth={ew * 0.16}
          fill="none"
          strokeLinecap="round"
        />
        {/* брови: подъём внутреннего/внешнего края */}
        <path
          d={`M ${ex - side * w * 0.55} ${eyeY - eh * 2.0 - expr.browIn} Q ${ex + side * w * 0.05} ${eyeY - eh * 2.55 - (expr.browIn + expr.browOut) * 0.6} ${ex + side * w * 0.62} ${eyeY - eh * 1.9 - expr.browOut}`}
          stroke={look.brow}
          strokeWidth={ew * (child ? 0.2 : 0.24)}
          fill="none"
          strokeLinecap="round"
        />
        {/* румянец */}
        {refined ? (
          <g clipPath={`url(#${uid}-face)`}>
            <ellipse cx={ex + side * w * 0.15 - side * far * w * 0.2} cy={eyeY + eh * 2.6} rx={w * 0.5} ry={eh * 0.75} fill="#E8826F" opacity={(child ? 0.28 : 0.16) * (1 - 0.35 * far)} />
          </g>
        ) : (
          <ellipse cx={ex + side * w * 0.15} cy={eyeY + eh * 2.6} rx={w * 0.5} ry={eh * 0.75} fill="#E8826F" opacity={child ? 0.28 : 0.16} />
        )}
      </g>
    );
  });
  // нос: мягкая тень и ноздря, смещается к стороне поворота
  const nx = fx + turn * rx * 0.2;
  const nyy = cy + ry * (child ? 0.38 : 0.34) + ny;
  const nose = (
    <g>
      <path d={`M ${nx - 2 + turn * 4} ${nyy - ry * 0.2} Q ${nx + turn * 9} ${nyy} ${nx - 4 + turn * 6} ${nyy + 4}`} stroke={look.skinShade} strokeWidth={3} fill="none" strokeLinecap="round" />
      <ellipse cx={nx + turn * 3} cy={nyy + 3} rx={rx * 0.1} ry={ry * 0.04} fill={look.skinShade} opacity={0.6} />
    </g>
  );
  // рот: форма по фонеме (раскрытие/округление/растяжение) и улыбке
  const mx = fx + turn * rx * 0.1;
  const my = cy + ry * (child ? 0.62 : 0.6) + ny;
  const mw = rx * (child ? 0.42 : 0.46) * (1 - 0.25 * at);
  const sm = expr.smile;
  let mouthEl: React.ReactNode;
  if (mouth.open < 0.05) {
    const w = mw * (1 + 0.15 * sm) * (1 - 0.25 * mouth.round);
    mouthEl = (
      <path
        d={`M ${mx - w / 2} ${my - sm * 3} Q ${mx} ${my + sm * 7 + 2} ${mx + w / 2} ${my - sm * 3}`}
        stroke={look.lips}
        strokeWidth={child ? 4.5 : 4}
        fill="none"
        strokeLinecap="round"
      />
    );
  } else {
    const w = mw * (0.82 + 0.38 * mouth.wide - 0.42 * mouth.round + 0.12 * sm);
    const h = (3 + 24 * mouth.open) * (1 + 0.2 * mouth.round) * (child ? 0.95 : 1);
    const top = my - h * 0.3 - sm * 2;
    const bot = my + h * 0.75;
    const d = `M ${mx - w / 2} ${my - sm * 2} C ${mx - w * 0.3} ${top} ${mx + w * 0.3} ${top} ${mx + w / 2} ${my - sm * 2} C ${mx + w * 0.42} ${bot} ${mx - w * 0.42} ${bot} ${mx - w / 2} ${my - sm * 2} Z`;
    const id = `${uid}-mouth`;
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
  const s = turn * rx * 0.28;
  return (
    <>
      <path d={face} fill={look.skin} />
      {/* лёгкая тень на дальней стороне лица */}
      <clipPath id={`${uid}-face`}>
        <path d={face} />
      </clipPath>
      <g clipPath={`url(#${uid}-face)`}>
        {refined ? (
          // мягкий переход к дальней стороне лица — без резкого края
          <>
            <linearGradient id={`${uid}-shade`} gradientUnits="userSpaceOnUse" x1={cx - (turn >= 0 ? 1 : -1) * rx} y1={cy} x2={cx + (turn >= 0 ? 1 : -1) * rx} y2={cy}>
              <stop offset={0} stopColor={look.skinShade} stopOpacity={0} />
              <stop offset={Math.max(0.3, 0.84 - at * 0.5)} stopColor={look.skinShade} stopOpacity={0} />
              <stop offset={1} stopColor={look.skinShade} stopOpacity={(0.18 + at * 0.12) * 1.25} />
            </linearGradient>
            <rect x={cx - rx - 4} y={cy - ry * 1.5} width={rx * 2 + 8} height={ry * 2.7} fill={`url(#${uid}-shade)`} />
          </>
        ) : (
          <path d={face} fill={look.skinShade} opacity={0.18 + at * 0.12} transform={`translate(${(turn >= 0 ? 1 : -1) * rx * (1.62 - at * 0.45)} 0)`} />
        )}
      </g>
      {look.beard ? (
        // аккуратная короткая борода: по линии челюсти, с усами над губой
        <g clipPath={`url(#${uid}-face)`}>
          <path
            d={`M ${cx - rx * 0.98} ${cy + ry * 0.1} C ${cx - rx * 0.96} ${cy + ry * 0.75} ${chinX - rx * 0.6} ${cy + ry * 1.08} ${chinX} ${cy + ry * 1.06} C ${chinX + rx * 0.6} ${cy + ry * 1.08} ${cx + rx * 0.96} ${cy + ry * 0.75} ${cx + rx * 0.98} ${cy + ry * 0.1} L ${cx + rx * 0.8} ${cy + ry * 0.28} C ${cx + rx * 0.72} ${cy + ry * 0.7} ${chinX + rx * 0.36} ${cy + ry * 0.86} ${chinX} ${cy + ry * 0.84} C ${chinX - rx * 0.36} ${cy + ry * 0.86} ${cx - rx * 0.72} ${cy + ry * 0.7} ${cx - rx * 0.8} ${cy + ry * 0.28} Z`}
            fill={look.beard}
            opacity={0.95}
          />
          <path d={`M ${mx - mw * 0.62} ${my - ry * 0.1} Q ${mx} ${my - ry * 0.2} ${mx + mw * 0.62} ${my - ry * 0.1} Q ${mx} ${my - ry * 0.02} ${mx - mw * 0.62} ${my - ry * 0.1} Z`} fill={look.beard} opacity={0.9} />
        </g>
      ) : null}
      {eyes}
      {nose}
      {mouthEl}
      <HairFront look={look} cx={cx} cy={cy} turn={turn} />
      {look.cap === "tubeteika" ? (
        // белая тюбетейка: невысокая округлая шапочка поверх волос
        <g>
          <path d={`M ${cx - rx * 1.0 + s * 0.6} ${cy - ry * 0.62} C ${cx - rx * 1.02 + s * 0.6} ${cy - ry * 1.28} ${cx + rx * 1.02 + s * 0.6} ${cy - ry * 1.28} ${cx + rx * 1.0 + s * 0.6} ${cy - ry * 0.62} Q ${cx + s * 0.6} ${cy - ry * 0.5} ${cx - rx * 1.0 + s * 0.6} ${cy - ry * 0.62} Z`} fill="#F8F6F0" />
          <path d={`M ${cx - rx * 1.0 + s * 0.6} ${cy - ry * 0.62} Q ${cx + s * 0.6} ${cy - ry * 0.5} ${cx + rx * 1.0 + s * 0.6} ${cy - ry * 0.62}`} stroke="#D9D3C4" strokeWidth={3} fill="none" />
          <path d={`M ${cx - rx * 0.55 + s * 0.6} ${cy - ry * 1.02} Q ${cx + s * 0.6} ${cy - ry * 1.14} ${cx + rx * 0.55 + s * 0.6} ${cy - ry * 1.02}`} stroke="#DCD6C8" strokeWidth={2.5} fill="none" />
        </g>
      ) : null}
    </>
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
    case "manShort":
    case "boyShort":
    case "boyCrop": {
      const boy = look.hairStyle !== "manShort";
      const crop = look.hairStyle === "boyCrop";
      const fr = crop ? 0.38 : boy ? 0.48 : 0.66;
      return (
        <path
          d={`M ${cx - rx * 1.02} ${cy - ry * 0.05} C ${cx - rx * 1.1} ${cy - ry * 0.9} ${cx - rx * 0.55} ${top - 6} ${cx + s * 0.5} ${top - 8} C ${cx + rx * 0.6} ${top - 6} ${cx + rx * 1.1} ${cy - ry * 0.9} ${cx + rx * 1.02} ${cy - ry * 0.05} L ${cx + rx * 0.9} ${cy - ry * 0.3} C ${cx + rx * 0.7} ${cy - ry * (fr - 0.03)} ${cx + s} ${cy - ry * (fr + 0.02)} ${cx - rx * 0.3 + s} ${cy - ry * fr} C ${cx - rx * 0.7} ${cy - ry * (fr + 0.12)} ${cx - rx * 0.9} ${cy - ry * 0.4} ${cx - rx * 0.92} ${cy - ry * 0.25} Z`}
          fill={hair}
        />
      );
    }
    case "boySide":
      // косой пробор, чёлка набок
      return (
        <path
          d={`M ${cx - rx * 1.02} ${cy - ry * 0.05} C ${cx - rx * 1.1} ${cy - ry * 0.9} ${cx - rx * 0.55} ${top - 6} ${cx + s * 0.5} ${top - 8} C ${cx + rx * 0.6} ${top - 6} ${cx + rx * 1.1} ${cy - ry * 0.9} ${cx + rx * 1.02} ${cy - ry * 0.05} L ${cx + rx * 0.92} ${cy - ry * 0.3} C ${cx + rx * 0.8} ${cy - ry * 0.75} ${cx + rx * 0.3 + s} ${cy - ry * 0.95} ${cx - rx * 0.2 + s} ${cy - ry * 0.66} C ${cx - rx * 0.5 + s} ${cy - ry * 0.5} ${cx - rx * 0.85} ${cy - ry * 0.55} ${cx - rx * 0.92} ${cy - ry * 0.25} Z`}
          fill={hair}
        />
      );
    case "boyCurly":
      return (
        <g>
          <path
            d={`M ${cx - rx * 1.06} ${cy - ry * 0.1} C ${cx - rx * 1.14} ${cy - ry * 0.95} ${cx - rx * 0.55} ${top - 12} ${cx + s * 0.5} ${top - 14} C ${cx + rx * 0.6} ${top - 12} ${cx + rx * 1.14} ${cy - ry * 0.95} ${cx + rx * 1.06} ${cy - ry * 0.1} L ${cx + rx * 0.9} ${cy - ry * 0.35} C ${cx + rx * 0.7} ${cy - ry * 0.5} ${cx + s} ${cy - ry * 0.56} ${cx - rx * 0.3 + s} ${cy - ry * 0.52} C ${cx - rx * 0.7} ${cy - ry * 0.62} ${cx - rx * 0.9} ${cy - ry * 0.45} ${cx - rx * 0.94} ${cy - ry * 0.3} Z`}
            fill={hair}
          />
          {[-0.75, -0.45, -0.15, 0.15, 0.45, 0.75].map((k) => (
            <circle key={k} cx={cx + k * rx + s * 0.5} cy={cy - ry * (0.58 + 0.3 * (1 - Math.abs(k)))} r={rx * 0.17} fill={hair} />
          ))}
        </g>
      );
    default:
      return null;
  }
};
