// Голова персонажа: лицо с поворотом (черты смещаются к стороне взгляда,
// дальний глаз уже), глаза с веками и морганием, брови, нос, рот по
// фонемам речи, уши, причёска (с запаздыванием прядей и кос).
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
const HeadBack: React.FC<HeadProps> = ({ look, cx, cy, turn, hairSway }) => {
  const b = look.build;
  const rx = b.headRx;
  const ry = b.headRy;
  const hair = look.hair;
  const shift = -turn * rx * 0.12;
  const els: React.ReactNode[] = [];
  if (look.hairStyle === "momBob") {
    // волосы до плеч, лежат за головой; чуть отстают при движении
    const sw = hairSway * 0.6;
    els.push(
      <path
        key="bob"
        d={`M ${cx - rx * 1.12 + shift} ${cy - ry * 0.2} C ${cx - rx * 1.3 + shift} ${cy - ry * 1.5} ${cx + rx * 1.3 + shift} ${cy - ry * 1.5} ${cx + rx * 1.12 + shift} ${cy - ry * 0.2} L ${cx + rx * 1.18 + shift + sw} ${cy + ry * 1.38} Q ${cx + shift + sw} ${cy + ry * 1.55} ${cx - rx * 1.18 + shift + sw} ${cy + ry * 1.38} Z`}
        fill={hair}
      />,
    );
  } else if (look.hairStyle === "longTail") {
    // высокий хвост: крепится у затылка, качается с запаздыванием;
    // жёлтая резинка видна в повороте и в профиль
    const a = 10 + hairSway;
    const px = cx - turn * rx * 0.95;
    const py = cy - ry * 0.62;
    els.push(<ellipse key="cap" cx={cx + shift} cy={cy - ry * 0.25} rx={rx * 1.06} ry={ry * 0.95} fill={hair} />);
    els.push(
      <g key="tail" transform={`rotate(${a} ${px} ${py})`}>
        <path d={`M ${px - rx * 0.26} ${py} Q ${px - rx * 0.46} ${py + ry * 0.9} ${px - rx * 0.05} ${py + ry * 1.75} Q ${px + rx * 0.3} ${py + ry * 0.95} ${px + rx * 0.26} ${py} Z`} fill={hair} />
        {look.tie ? <ellipse cx={px} cy={py + ry * 0.04} rx={rx * 0.3} ry={ry * 0.12} fill={look.tie} /> : null}
      </g>,
    );
  } else if (look.hairStyle === "bun") {
    const bx = cx - turn * rx * 0.55;
    const by = cy - ry * 0.98;
    els.push(<circle key="bunb" cx={bx} cy={by} r={rx * 0.42} fill={hair} />);
    if (look.hairStreak) {
      els.push(<path key="bunst" d={`M ${bx - rx * 0.28} ${by - rx * 0.1} Q ${bx} ${by - rx * 0.38} ${bx + rx * 0.3} ${by - rx * 0.05}`} stroke={look.hairStreak} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.85} />);
    }
    els.push(<ellipse key="cap" cx={cx + shift} cy={cy - ry * 0.25} rx={rx * 1.05} ry={ry * 0.95} fill={hair} />);
  } else if (look.hairStyle === "toddlerTufts") {
    // два маленьких хвостика по бокам головы (выше ушей) с резинками;
    // кисточки смотрят в стороны и вниз, качаются с запаздыванием
    for (const side of [-1, 1] as const) {
      const far = Math.max(0, side * turn);
      const px = cx + side * rx * (0.9 - far * 0.35) - turn * rx * 0.15;
      const py = cy - ry * 0.52;
      const ang = side * 62 + hairSway * 0.9;
      els.push(
        <g key={`tuft${side}`} transform={`rotate(${ang} ${px} ${py})`} opacity={1 - far * 0.6}>
          <path d={`M ${px - rx * 0.12} ${py} C ${px - rx * 0.26} ${py - ry * 0.22} ${px - rx * 0.12} ${py - ry * 0.42} ${px + rx * 0.02} ${py - ry * 0.4} C ${px + rx * 0.18} ${py - ry * 0.36} ${px + rx * 0.2} ${py - ry * 0.16} ${px + rx * 0.12} ${py} Z`} fill={hair} />
          <ellipse cx={px} cy={py - ry * 0.02} rx={rx * 0.11} ry={ry * 0.06} fill={look.tie ?? "#F2A2B0"} />
        </g>,
      );
    }
    els.push(<ellipse key="cap" cx={cx + shift} cy={cy - ry * 0.28} rx={rx * 1.03} ry={ry * 0.9} fill={hair} />);
  } else {
    els.push(<ellipse key="cap" cx={cx + shift} cy={cy - ry * 0.22} rx={rx * 1.05} ry={ry * 0.98} fill={hair} />);
  }
  if (look.hairStyle === "girlBraids") {
    // две косы за ушами: качаются с запаздыванием, банты у основания
    for (const side of [-1, 1] as const) {
      const px = cx + side * rx * (0.9 - Math.max(0, side * turn) * 0.35) - turn * rx * 0.12;
      const py = cy + ry * 0.12;
      const ang = side * 10 + hairSway * (side * turn > 0.3 ? 0.6 : 1);
      els.push(
        <g key={`braid${side}`} transform={`rotate(${ang} ${px} ${py})`}>
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx={px} cy={py + ry * (0.28 + i * 0.27)} rx={rx * (0.2 - i * 0.015)} ry={ry * 0.18} fill={hair} />
          ))}
          <path d={`M ${px - rx * 0.1} ${py + ry * 1.12} L ${px} ${py + ry * 1.38} L ${px + rx * 0.1} ${py + ry * 1.12} Z`} fill={hair} />
          <circle cx={px} cy={py + ry * 1.1} r={rx * 0.08} fill="#FFFFFF" />
        </g>,
      );
    }
  }
  // уши (дальнее уходит за лицо при повороте)
  for (const side of [-1, 1] as const) {
    const ex = cx + side * rx * 0.97 - turn * rx * 0.32;
    els.push(<ellipse key={`ear${side}`} cx={ex} cy={cy + ry * 0.1} rx={rx * 0.17} ry={ry * 0.22} fill={look.skin} />);
    els.push(<ellipse key={`earin${side}`} cx={ex + side * 2} cy={cy + ry * 0.12} rx={rx * 0.07} ry={ry * 0.12} fill={look.skinShade} />);
    if (look.earrings) els.push(<circle key={`ering${side}`} cx={ex} cy={cy + ry * 0.36} r={4} fill="#E2B653" />);
  }
  return <>{els}</>;
};

const HeadFront: React.FC<HeadProps> = ({ uid, look, cx, cy, turn, lookX, lookY, nod, expr, mouth, blink }) => {
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
  const lid = Math.max(expr.lid, blink);
  const eyes = ([-1, 1] as const).map((side) => {
    const far = Math.max(0, side * turn);
    const sx = 1 - 0.45 * far + 0.06 * Math.max(0, -side * turn);
    const ex = fx + side * gap * (1 - 0.25 * far);
    const w = ew * sx;
    const id = `${uid}-eye${side}`;
    const ix = ex + lookX * w * 0.24;
    const iy = eyeY + lookY * eh * 0.22;
    const ir = eh * 0.78;
    // веко: кожа сверху, опускается до lid (1 — глаз закрыт)
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
        {/* очки: круглая оправа вокруг глаза, дужка к уху */}
        {look.glasses ? (
          <g>
            <ellipse cx={ex} cy={eyeY} rx={w * 0.66} ry={eh * 1.25} fill="rgba(255,255,255,0.12)" stroke={look.glasses} strokeWidth={ew * 0.11} />
            {side === -1 ? <path d={`M ${fx - gap * 0.36} ${eyeY - eh * 0.25} Q ${fx} ${eyeY - eh * 0.7} ${fx + gap * 0.36} ${eyeY - eh * 0.25}`} stroke={look.glasses} strokeWidth={ew * 0.1} fill="none" /> : null}
          </g>
        ) : null}
        {/* румянец */}
        <ellipse cx={ex + side * w * 0.15} cy={eyeY + eh * 2.6} rx={w * 0.5} ry={eh * 0.75} fill="#E8826F" opacity={child ? 0.28 : 0.16} />
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
  return (
    <>
      <path d={face} fill={look.skin} />
      {/* лёгкая тень на дальней стороне лица */}
      <clipPath id={`${uid}-face`}>
        <path d={face} />
      </clipPath>
      <g clipPath={`url(#${uid}-face)`}>
        <path d={face} fill={look.skinShade} opacity={0.18 + at * 0.12} transform={`translate(${(turn >= 0 ? 1 : -1) * rx * (1.62 - at * 0.45)} 0)`} />
      </g>
      {look.stubble ? (
        <path
          d={`M ${cx - rx * 0.85} ${cy + ry * 0.35} C ${cx - rx * 0.7} ${cy + ry * 1.0} ${cx + rx * 0.7} ${cy + ry * 1.0} ${cx + rx * 0.85} ${cy + ry * 0.35} L ${chinX + rx * 0.4} ${cy + ry * 0.55} Q ${chinX} ${cy + ry * 0.5} ${chinX - rx * 0.4} ${cy + ry * 0.55} Z`}
          fill="#5B4A44"
          opacity={0.13}
          clipPath={`url(#${uid}-face)`}
        />
      ) : null}
      {eyes}
      {nose}
      {look.age ? (
        // тонкие морщинки у внешних уголков глаз и мягкие носогубные складки
        <g stroke={look.skinShade} strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.75 * look.age}>
          {([-1, 1] as const).map((side) => {
            const far = Math.max(0, side * turn);
            const ex = fx + side * rx * 0.43 * (1 - 0.12 * at) * (1 - 0.25 * far) + side * rx * 0.39 * 0.5 * (1 - 0.45 * far);
            const ey = cy + ry * 0.02 + ny;
            return (
              <g key={side} opacity={1 - far * 0.8}>
                <path d={`M ${ex + side * 6} ${ey - 4} Q ${ex + side * 13} ${ey - 2} ${ex + side * 17} ${ey - 7}`} />
                <path d={`M ${ex + side * 6} ${ey + 3} Q ${ex + side * 13} ${ey + 5} ${ex + side * 16} ${ey + 10}`} />
                <path d={`M ${nx + side * rx * 0.2} ${nyy + 2} Q ${nx + side * rx * 0.34} ${nyy + ry * 0.16} ${mx + side * mw * 0.62} ${my + ry * 0.03}`} />
              </g>
            );
          })}
        </g>
      ) : null}
      {mouthEl}
      <HairFront look={look} cx={cx} cy={cy} turn={turn} />
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
    case "momBob": {
      // косой пробор, пряди обрамляют лицо
      const part = cx - rx * 0.3 + s;
      return (
        <g>
          <path
            d={`M ${cx - rx * 1.06} ${cy + ry * 0.55} C ${cx - rx * 1.16} ${cy - ry * 0.6} ${cx - rx * 0.8} ${top} ${cx} ${top} C ${cx + rx * 0.85} ${top} ${cx + rx * 1.16} ${cy - ry * 0.6} ${cx + rx * 1.06} ${cy + ry * 0.55} L ${cx + rx * 0.9} ${cy + ry * 0.4} C ${cx + rx * 0.95} ${cy - ry * 0.2} ${part + rx * 0.6} ${cy - ry * 0.72} ${part} ${cy - ry * 0.78} C ${part - rx * 0.25} ${cy - ry * 0.5} ${cx - rx * 0.75} ${cy - ry * 0.35} ${cx - rx * 0.88} ${cy + ry * 0.4} Z`}
            fill={hair}
          />
          <path d={`M ${part + rx * 0.1} ${cy - ry * 0.95} Q ${cx + rx * 0.5 + s} ${cy - ry * 1.02} ${cx + rx * 0.8} ${cy - ry * 0.55}`} stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      );
    }
    case "girlBraids":
      // ровная чёлка
      return (
        <g>
          <path
            d={`M ${cx - rx * 1.04} ${cy + ry * 0.15} C ${cx - rx * 1.12} ${cy - ry * 0.9} ${cx - rx * 0.6} ${top} ${cx} ${top} C ${cx + rx * 0.6} ${top} ${cx + rx * 1.12} ${cy - ry * 0.9} ${cx + rx * 1.04} ${cy + ry * 0.15} L ${cx + rx * 0.86} ${cy - ry * 0.2} Q ${cx + rx * 0.5 + s} ${cy - ry * 0.32} ${cx + s} ${cy - ry * 0.34} Q ${cx - rx * 0.5 + s} ${cy - ry * 0.32} ${cx - rx * 0.86} ${cy - ry * 0.2} Z`}
            fill={hair}
          />
          <path d={`M ${cx - rx * 0.5 + s} ${cy - ry * 0.95} Q ${cx + s} ${cy - ry * 1.05} ${cx + rx * 0.5 + s} ${cy - ry * 0.95}`} stroke="#FFFFFF" strokeOpacity={0.14} strokeWidth={6} fill="none" strokeLinecap="round" />
          {look.bows
            ? ([-1, 1] as const).map((side) => {
                const bx = cx + side * rx * (0.82 - Math.max(0, side * turn) * 0.3) - turn * rx * 0.1;
                const by = cy - ry * 0.55;
                return (
                  <g key={side} opacity={side * turn > 0.55 ? 0 : 1}>
                    <ellipse cx={bx - rx * 0.16} cy={by} rx={rx * 0.2} ry={rx * 0.13} fill="#FFFFFF" transform={`rotate(-20 ${bx} ${by})`} />
                    <ellipse cx={bx + rx * 0.16} cy={by} rx={rx * 0.2} ry={rx * 0.13} fill="#FFFFFF" transform={`rotate(20 ${bx} ${by})`} />
                    <circle cx={bx} cy={by} r={rx * 0.07} fill="#EDEDED" />
                  </g>
                );
              })
            : null}
        </g>
      );
    case "boyTuft": {
      // короткая стрижка с непослушным хохолком надо лбом (Аян): хохолок
      // смещается с поворотом головы и узнаётся в любом плане
      const tx = cx + rx * 0.18 + s * 1.1;
      return (
        <g>
          <path
            d={`M ${cx - rx * 1.03} ${cy - ry * 0.02} C ${cx - rx * 1.12} ${cy - ry * 0.95} ${cx - rx * 0.55} ${top - 8} ${cx + s * 0.5} ${top - 10} C ${cx + rx * 0.62} ${top - 8} ${cx + rx * 1.12} ${cy - ry * 0.95} ${cx + rx * 1.03} ${cy - ry * 0.02} L ${cx + rx * 0.9} ${cy - ry * 0.28} C ${cx + rx * 0.72} ${cy - ry * 0.5} ${cx + rx * 0.2 + s} ${cy - ry * 0.42} ${cx - rx * 0.05 + s} ${cy - ry * 0.56} C ${cx - rx * 0.35 + s} ${cy - ry * 0.4} ${cx - rx * 0.8} ${cy - ry * 0.52} ${cx - rx * 0.92} ${cy - ry * 0.22} Z`}
            fill={hair}
          />
          <path d={`M ${tx - rx * 0.28} ${top + ry * 0.02} Q ${tx - rx * 0.05} ${top - ry * 0.36} ${tx + rx * 0.26} ${top - ry * 0.26} Q ${tx + rx * 0.02} ${top - ry * 0.1} ${tx + rx * 0.12} ${top + ry * 0.06} Z`} fill={hair} />
          <path d={`M ${cx - rx * 0.55 + s} ${top + ry * 0.12} Q ${cx + s} ${top - ry * 0.02} ${cx + rx * 0.45 + s} ${top + ry * 0.14}`} stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      );
    }
    case "dadShort":
    case "shortGrey":
    case "boyShort": {
      const boy = look.hairStyle === "boyShort";
      return (
        <path
          d={`M ${cx - rx * 1.02} ${cy - ry * 0.05} C ${cx - rx * 1.1} ${cy - ry * 0.9} ${cx - rx * 0.55} ${top - 6} ${cx + s * 0.5} ${top - 8} C ${cx + rx * 0.6} ${top - 6} ${cx + rx * 1.1} ${cy - ry * 0.9} ${cx + rx * 1.02} ${cy - ry * 0.05} L ${cx + rx * 0.9} ${cy - ry * 0.3} C ${cx + rx * 0.7} ${cy - ry * (boy ? 0.45 : 0.62)} ${cx + s} ${cy - ry * (boy ? 0.5 : 0.7)} ${cx - rx * 0.3 + s} ${cy - ry * (boy ? 0.48 : 0.66)} C ${cx - rx * 0.7} ${cy - ry * 0.6} ${cx - rx * 0.9} ${cy - ry * 0.4} ${cx - rx * 0.92} ${cy - ry * 0.25} Z`}
          fill={hair}
        />
      );
    }
    case "toddlerTufts":
      // мягкая детская чёлка
      return (
        <path
          d={`M ${cx - rx * 1.0} ${cy - ry * 0.05} C ${cx - rx * 1.06} ${cy - ry * 0.85} ${cx - rx * 0.6} ${top + ry * 0.04} ${cx} ${top + ry * 0.04} C ${cx + rx * 0.6} ${top + ry * 0.04} ${cx + rx * 1.06} ${cy - ry * 0.85} ${cx + rx * 1.0} ${cy - ry * 0.05} L ${cx + rx * 0.86} ${cy - ry * 0.38} Q ${cx + rx * 0.45 + s} ${cy - ry * 0.5} ${cx + s} ${cy - ry * 0.46} Q ${cx - rx * 0.45 + s} ${cy - ry * 0.52} ${cx - rx * 0.86} ${cy - ry * 0.38} Z`}
          fill={hair}
        />
      );
    case "bun":
      return (
        <g>
          <path
            d={`M ${cx - rx * 1.02} ${cy + ry * 0.05} C ${cx - rx * 1.1} ${cy - ry * 0.9} ${cx - rx * 0.6} ${top} ${cx} ${top} C ${cx + rx * 0.6} ${top} ${cx + rx * 1.1} ${cy - ry * 0.9} ${cx + rx * 1.02} ${cy + ry * 0.05} L ${cx + rx * 0.9} ${cy - ry * 0.25} C ${cx + rx * 0.7} ${cy - ry * 0.7} ${cx + s} ${cy - ry * 0.8} ${cx + s} ${cy - ry * 0.78} C ${cx - rx * 0.4 + s} ${cy - ry * 0.75} ${cx - rx * 0.85} ${cy - ry * 0.6} ${cx - rx * 0.92} ${cy - ry * 0.25} Z`}
            fill={hair}
          />
          {look.hairStreak ? (
            <g stroke={look.hairStreak} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8}>
              <path d={`M ${cx - rx * 0.15 + s} ${top + ry * 0.06} Q ${cx - rx * 0.6 + s} ${cy - ry * 0.85} ${cx - rx * 0.85} ${cy - ry * 0.3}`} />
              <path d={`M ${cx + rx * 0.2 + s} ${top + ry * 0.08} Q ${cx + rx * 0.6 + s} ${cy - ry * 0.8} ${cx + rx * 0.82} ${cy - ry * 0.32}`} />
              <path d={`M ${cx + s * 0.6} ${top + ry * 0.02} Q ${cx + rx * 0.15 + s} ${cy - ry * 0.95} ${cx + rx * 0.35 + s} ${cy - ry * 0.74}`} opacity={0.7} />
            </g>
          ) : null}
        </g>
      );
    case "longTail":
      return (
        <path
          d={`M ${cx - rx * 1.02} ${cy + ry * 0.05} C ${cx - rx * 1.1} ${cy - ry * 0.9} ${cx - rx * 0.6} ${top} ${cx} ${top} C ${cx + rx * 0.6} ${top} ${cx + rx * 1.1} ${cy - ry * 0.9} ${cx + rx * 1.02} ${cy + ry * 0.05} L ${cx + rx * 0.9} ${cy - ry * 0.25} C ${cx + rx * 0.7} ${cy - ry * 0.7} ${cx + s} ${cy - ry * 0.8} ${cx + s} ${cy - ry * 0.78} C ${cx - rx * 0.4 + s} ${cy - ry * 0.75} ${cx - rx * 0.85} ${cy - ry * 0.6} ${cx - rx * 0.92} ${cy - ry * 0.25} Z`}
          fill={hair}
        />
      );
    default:
      return null;
  }
};
