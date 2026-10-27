// Голова персонажа: череп и лицо с поворотом (лицо смещается к стороне
// взгляда, затылок — в обратную; ближнее ухо остаётся между ними), глаза
// с веками, бликами и морганием, брови, нос, рот по фонемам речи, щёки,
// уши, причёска (с запаздыванием прядей), очки и седина.
//
// Стиль (№31): контур — тёмный оттенок своей заливки, одна толщина `line`
// (Figure передаёт её из Actor). Объём — тень на дальней стороне лица и
// мягкий румянец (радиальный градиент), без фильтров.
//
// Две части: "back" — затылок, волосы за головой, уши (рисуется до
// корпуса), "front" — лицо и передние пряди (после воротника). Обе части
// в одной системе: центр головы (cx, cy), поворот turn −1…1.
import type { Viseme } from "../context";
import { lightOf, lineOf, mixHex, type Look } from "./looks";
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
  readonly line?: number;
};

const INK = "#1E1B26";
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Миндалевидный глаз: внешний уголок чуть выше внутреннего.
const eyePath = (x: number, y: number, w: number, h: number, outer: number) => {
  const l = x - w / 2;
  const r = x + w / 2;
  const lo = outer < 0 ? -h * 0.18 : 0; // внешний угол слева
  const ro = outer > 0 ? -h * 0.18 : 0;
  return `M ${l} ${y + lo} C ${l + w * 0.2} ${y - h * 1.05} ${r - w * 0.25} ${y - h * 1.1} ${r} ${y + ro} C ${r - w * 0.22} ${y + h * 0.95} ${l + w * 0.22} ${y + h * 0.95} ${l} ${y + lo} Z`;
};

// Геометрия головы при повороте (общая для обеих частей).
export const headGeom = (look: Look, cx: number, turn: number) => {
  const b = look.build;
  const rx = b.headRx;
  const at = Math.abs(turn);
  const skullX = cx - turn * rx * 0.12; // затылок — в обратную сторону
  const faceX = cx + turn * rx * 0.2; // маска лица — к стороне взгляда
  const faceRx = rx * (1 - 0.06 * at);
  const fx = cx + turn * rx * 0.42; // черты лица
  const left = Math.min(faceX - faceRx, skullX - rx * 0.99);
  const right = Math.max(faceX + faceRx, skullX + rx * 0.99);
  return { rx, ry: b.headRy, at, skullX, faceX, faceRx, fx, left, right };
};

export const Head: React.FC<HeadProps> = (p) => (p.part === "back" ? <HeadBack {...p} /> : <HeadFront {...p} />);

const hasEars = (look: Look) => look.hairStyle !== "bob" && look.hairStyle !== "momBob";

// Задний план головы: затылок, волосы за головой, косы, хвост, уши.
const HeadBack: React.FC<HeadProps> = ({ look, cx, cy, turn, hairSway, line = 3.6 }) => {
  const g = headGeom(look, cx, turn);
  const { rx, ry, skullX } = g;
  const hair = look.hair;
  const hl = lineOf(hair);
  const sl = lineOf(look.skin);
  const ol = line;
  const els: React.ReactNode[] = [];
  // затылок (кожа) — виден между лицом и волосами при повороте
  els.push(<ellipse key="skull" cx={skullX} cy={cy - ry * 0.1} rx={rx * 0.99} ry={ry * 0.9} fill={look.skin} stroke={sl} strokeWidth={ol} />);
  const cap = (k: string, sx = 1.05, sy = 0.95, dy = -0.24) => (
    <ellipse key={k} cx={skullX} cy={cy + ry * dy} rx={rx * sx} ry={ry * sy} fill={hair} stroke={hl} strokeWidth={ol} />
  );
  switch (look.hairStyle) {
    case "momBob": {
      const sw = hairSway * 0.6;
      els.push(
        <path
          key="bob"
          d={`M ${cx - rx * 1.12} ${cy - ry * 0.2} C ${cx - rx * 1.3} ${cy - ry * 1.5} ${cx + rx * 1.3} ${cy - ry * 1.5} ${cx + rx * 1.12} ${cy - ry * 0.2} L ${cx + rx * 1.18 + sw} ${cy + ry * 1.38} Q ${cx + sw} ${cy + ry * 1.55} ${cx - rx * 1.18 + sw} ${cy + ry * 1.38} Z`}
          fill={hair}
          stroke={hl}
          strokeWidth={ol}
        />,
      );
      break;
    }
    case "bob": {
      // каре до линии челюсти: объём шире лица, ровный срез с лёгким
      // загибом внутрь; отстаёт при движении
      const sw = hairSway * 0.5;
      const L = g.left - rx * 0.14;
      const R = g.right + rx * 0.14;
      const bot = cy + ry * 0.98;
      els.push(
        <path
          key="bob"
          d={`M ${L + rx * 0.06} ${cy - ry * 0.3} C ${L - rx * 0.08} ${cy - ry * 1.45} ${R + rx * 0.08} ${cy - ry * 1.45} ${R - rx * 0.06} ${cy - ry * 0.3} C ${R + rx * 0.02} ${cy + ry * 0.35} ${R + sw} ${bot - ry * 0.25} ${R - rx * 0.1 + sw} ${bot} Q ${skullX + sw} ${bot + ry * 0.12} ${L + rx * 0.1 + sw} ${bot} C ${L + sw} ${bot - ry * 0.25} ${L - rx * 0.02} ${cy + ry * 0.35} ${L + rx * 0.06} ${cy - ry * 0.3} Z`}
          fill={hair}
          stroke={hl}
          strokeWidth={ol}
          strokeLinejoin="round"
        />,
      );
      break;
    }
    case "longTail": {
      const a = 8 + hairSway;
      const px = skullX - turn * rx * 0.75;
      const py = cy - ry * 0.55;
      els.push(
        <g key="tail" transform={`rotate(${a} ${px} ${py})`}>
          <path
            d={`M ${px - rx * 0.26} ${py} C ${px - rx * 0.5} ${py + ry * 0.7} ${px - rx * 0.2} ${py + ry * 1.5} ${px + rx * 0.02} ${py + ry * 1.95} C ${px + rx * 0.3} ${py + ry * 1.4} ${px + rx * 0.42} ${py + ry * 0.6} ${px + rx * 0.26} ${py} Z`}
            fill={hair}
            stroke={hl}
            strokeWidth={ol}
            strokeLinejoin="round"
          />
          <path d={`M ${px - rx * 0.04} ${py + ry * 0.3} Q ${px - rx * 0.12} ${py + ry * 1.0} ${px} ${py + ry * 1.6}`} stroke={hl} strokeWidth={ol * 0.7} fill="none" opacity={0.6} strokeLinecap="round" />
        </g>,
      );
      els.push(cap("cap"));
      break;
    }
    case "bun": {
      // аккуратный пучок на затылке, чуть выше макушки
      const bx = skullX - turn * rx * 0.45;
      const by = cy - ry * 1.0;
      const r = rx * 0.4;
      els.push(cap("cap"));
      els.push(
        <g key="bun">
          <circle cx={bx} cy={by} r={r} fill={hair} stroke={hl} strokeWidth={ol} />
          <path d={`M ${bx - r * 0.6} ${by - r * 0.2} Q ${bx} ${by - r * 0.75} ${bx + r * 0.62} ${by - r * 0.1}`} stroke={hl} strokeWidth={ol * 0.7} fill="none" opacity={0.7} strokeLinecap="round" />
          <path d={`M ${bx - r * 0.5} ${by + r * 0.35} Q ${bx + r * 0.1} ${by + r * 0.05} ${bx + r * 0.55} ${by + r * 0.42}`} stroke={hl} strokeWidth={ol * 0.7} fill="none" opacity={0.55} strokeLinecap="round" />
          <circle cx={bx - r * 0.25} cy={by - r * 0.35} r={r * 0.22} fill="#FFFFFF" opacity={0.12} />
        </g>,
      );
      break;
    }
    default:
      els.push(cap("cap"));
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
            <ellipse key={i} cx={px} cy={py + ry * (0.28 + i * 0.27)} rx={rx * (0.2 - i * 0.015)} ry={ry * 0.18} fill={hair} stroke={hl} strokeWidth={ol * 0.7} />
          ))}
          <path d={`M ${px - rx * 0.1} ${py + ry * 1.12} L ${px} ${py + ry * 1.38} L ${px + rx * 0.1} ${py + ry * 1.12} Z`} fill={hair} />
          <circle cx={px} cy={py + ry * 1.1} r={rx * 0.08} fill="#FFFFFF" />
        </g>,
      );
    }
  }
  // уши: на границе затылка и лица; ближнее при повороте уходит к центру
  // головы (поверх затылка), дальнее — за маску лица
  if (hasEars(look)) {
    for (const side of [-1, 1] as const) {
      const near = side * turn <= 0;
      // ближнее ухо — посередине между краем лица и краем затылка
      const faceEdge = g.faceX + side * g.faceRx;
      const skullEdge = skullX + side * rx * 0.99;
      const ex = near ? (faceEdge + skullEdge) / 2 - side * rx * 0.02 : cx + side * rx * 0.97 - turn * rx * 0.45;
      const ey = cy + ry * 0.1;
      const erx = rx * 0.17 * (near ? 1 - 0.15 * g.at : 1);
      const ery = ry * 0.23;
      els.push(
        <g key={`ear${side}`}>
          <ellipse cx={ex} cy={ey} rx={erx} ry={ery} fill={look.skin} stroke={sl} strokeWidth={ol} />
          <path d={`M ${ex + side * erx * 0.3} ${ey - ery * 0.55} Q ${ex - side * erx * 0.35} ${ey - ery * 0.2} ${ex + side * erx * 0.05} ${ey + ery * 0.45}`} stroke={look.skinShade} strokeWidth={ol * 1.1} fill="none" strokeLinecap="round" />
          {look.earrings ? <circle cx={ex} cy={ey + ery * 0.95} r={rx * 0.06} fill="#E2B653" stroke="#A8822E" strokeWidth={ol * 0.5} /> : null}
        </g>,
      );
    }
  }
  return <>{els}</>;
};

const HeadFront: React.FC<HeadProps> = ({ uid, look, cx, cy, turn, lookX, lookY, nod, expr, mouth, blink, line = 3.6 }) => {
  const b = look.build;
  const g = headGeom(look, cx, turn);
  const { rx, ry, at, faceX, faceRx, fx } = g;
  const child = b.headRx > 70 || !!b.kid;
  const ol = line;
  const sl = lineOf(look.skin);
  const chinX = faceX + turn * rx * 0.14;
  const male = !child && !look.lashes;
  const jaw = child ? 0.72 : male ? 0.64 : 0.55;
  const chinW = male ? 0.56 : 0.5;
  // лицо: овал, подбородок смещается к стороне поворота
  const face = `M ${faceX - faceRx} ${cy} C ${faceX - faceRx} ${cy - ry * 1.34} ${faceX + faceRx} ${cy - ry * 1.34} ${faceX + faceRx} ${cy} C ${faceX + faceRx} ${cy + ry * jaw} ${chinX + rx * chinW} ${cy + ry * 0.99} ${chinX} ${cy + ry} C ${chinX - rx * chinW} ${cy + ry * 0.99} ${faceX - faceRx} ${cy + ry * jaw} ${faceX - faceRx} ${cy} Z`;
  const ny = nod * 0.5; // при кивке черты лица чуть ниже
  const eyeY = cy + ry * (child ? 0.1 : 0.04) + ny;
  const ew = rx * (child ? 0.37 : 0.35);
  const eh = ew * (child ? 0.68 : 0.58);
  const gap = rx * (child ? 0.42 : 0.41) * (1 - 0.12 * at);
  // взгляд вниз прикрывает верхнее веко (читается «смотрит в планшет»)
  const lid = Math.max(expr.lid, blink, Math.max(0, lookY) * 0.38);
  const lash = mixHex(look.brow, INK, 0.5);
  const fid = `${uid}-face`;
  const eyes = ([-1, 1] as const).map((side) => {
    const far = Math.max(0, side * turn);
    const sx = 1 - 0.45 * far + 0.06 * Math.max(0, -side * turn);
    const ex = fx + side * gap * (1 - 0.25 * far);
    const w = ew * sx;
    const id = `${uid}-eye${side}`;
    const ix = ex + lookX * w * 0.24;
    const iy = eyeY + eh * 0.08 + lookY * eh * 0.22;
    const ir = eh * 0.8;
    // веко: кожа сверху, опускается до lid (1 — глаз закрыт)
    const lidY = eyeY - eh * 1.05 + eh * 2.1 * lid;
    const lo = side < 0 ? -eh * 0.18 : 0;
    const ro = side > 0 ? -eh * 0.18 : 0;
    const lashW = ew * (child ? 0.15 : 0.14);
    const closed = lid > 0.92;
    // линия ресниц по краю века: при закрытом глазе — дуга вниз
    const lashD = closed
      ? `M ${ex - w / 2} ${eyeY + eh * 0.15} Q ${ex} ${eyeY + eh * 0.6} ${ex + w / 2} ${eyeY + (side > 0 ? -eh * 0.05 : eh * 0.15)}`
      : `M ${ex - w / 2 - 1} ${eyeY + lo} Q ${ex} ${Math.min(lidY, eyeY + eh * 0.6) - eh * 0.28 * (1 - lid)} ${ex + w / 2 + 1} ${eyeY + ro}`;
    const outerX = ex + side * (w / 2 + 1);
    const outerY = eyeY + (side < 0 ? lo : ro);
    const by = eyeY - eh * 2.0;
    return (
      <g key={side}>
        <clipPath id={id}>
          <path d={eyePath(ex, eyeY, w, eh, side)} />
        </clipPath>
        {closed ? null : (
          <>
            <path d={eyePath(ex, eyeY, w, eh, side)} fill="#FCFAF6" />
            <g clipPath={`url(#${id})`}>
              <circle cx={ix} cy={iy} r={ir} fill="#5A3B28" />
              <circle cx={ix} cy={iy + ir * 0.25} r={ir * 0.82} fill="#3E281C" />
              <circle cx={ix} cy={iy} r={ir * 0.5} fill="#130E10" />
              <circle cx={ix + ir * 0.34} cy={iy - ir * 0.38} r={ir * 0.3} fill="#FFFFFF" />
              <circle cx={ix - ir * 0.32} cy={iy + ir * 0.36} r={ir * 0.13} fill="#FFFFFF" opacity={0.85} />
              {/* тень века на белке */}
              <path d={`M ${ex - w} ${eyeY - eh * 0.75} Q ${ex} ${eyeY - eh * 0.2} ${ex + w} ${eyeY - eh * 0.75} L ${ex + w} ${eyeY - eh * 2} L ${ex - w} ${eyeY - eh * 2} Z`} fill={INK} opacity={0.12} />
              <rect x={ex - w} y={eyeY - eh * 2} width={w * 2} height={Math.max(0, lidY - (eyeY - eh * 2))} fill={look.skin} />
            </g>
            <path d={`M ${ex - w * 0.38} ${eyeY + eh * 0.72} Q ${ex} ${eyeY + eh * 0.98} ${ex + w * 0.38} ${eyeY + eh * 0.72}`} stroke={sl} strokeWidth={ol * 0.55} fill="none" strokeLinecap="round" opacity={0.6} />
          </>
        )}
        <path d={lashD} stroke={lash} strokeWidth={lashW} fill="none" strokeLinecap="round" />
        {look.lashes && !closed ? (
          <path d={`M ${outerX - side * 2} ${outerY} q ${side * w * 0.16} ${-eh * 0.12} ${side * w * 0.22} ${-eh * 0.5}`} stroke={lash} strokeWidth={lashW * 0.75} fill="none" strokeLinecap="round" />
        ) : null}
        {/* брови: подъём внутреннего/внешнего края */}
        <path
          d={`M ${ex - side * w * 0.55} ${by - expr.browIn} Q ${ex + side * w * 0.05} ${by - eh * 0.55 - (expr.browIn + expr.browOut) * 0.6} ${ex + side * w * 0.62} ${by + eh * 0.1 - expr.browOut}`}
          stroke={look.brow}
          strokeWidth={ew * (child ? 0.19 : look.lashes ? 0.17 : 0.23)}
          fill="none"
          strokeLinecap="round"
        />
      </g>
    );
  });
  // щёки: мягкий румянец
  const cheeks = ([-1, 1] as const).map((side) => {
    const far = Math.max(0, side * turn);
    const ex = fx + side * gap * (1 - 0.25 * far) + side * ew * 0.15;
    return <ellipse key={side} cx={ex} cy={eyeY + eh * (child ? 2.3 : 2.5)} rx={ew * 0.62 * (1 - 0.4 * far)} ry={eh * 0.85} fill={`url(#${uid}-blush)`} />;
  });
  // нос: мягкая тень и кончик, смещается к стороне поворота
  const nx = fx + turn * rx * 0.22;
  const nyy = cy + ry * (child ? 0.4 : 0.36) + ny;
  const nose = (
    <g>
      <path d={`M ${nx - 1 + turn * 3} ${nyy - ry * 0.13} Q ${nx + turn * 10 + (turn >= 0 ? 4 : -4)} ${nyy - 2} ${nx - 5 * Math.sign(turn || 1) + turn * 8} ${nyy + 4}`} stroke={sl} strokeWidth={ol * 0.85} fill="none" strokeLinecap="round" opacity={0.75} />
      <ellipse cx={nx + turn * 2} cy={nyy + 3} rx={rx * 0.11} ry={ry * 0.045} fill={look.skinShade} opacity={0.55 * (1 - Math.min(1, at * 1.4))} />
    </g>
  );
  // рот: форма по фонеме (раскрытие/округление/растяжение) и улыбке
  const mx = fx + turn * rx * 0.12;
  const my = cy + ry * (child ? 0.63 : 0.6) + ny;
  const mw = rx * (child ? 0.42 : 0.44) * (1 - 0.25 * at);
  const sm = expr.smile;
  const lipLine = mixHex(look.lips, INK, 0.35);
  let mouthEl: React.ReactNode;
  if (mouth.open < 0.05 && sm >= 0.62) {
    // широкая улыбка: приоткрытый рот, верхние зубы
    const w = mw * (1.05 + 0.15 * sm);
    const h = 6 + 9 * sm;
    const d = `M ${mx - w / 2} ${my - 3} Q ${mx} ${my + 1} ${mx + w / 2} ${my - 3} Q ${mx + w * 0.3} ${my + h} ${mx} ${my + h} Q ${mx - w * 0.3} ${my + h} ${mx - w / 2} ${my - 3} Z`;
    const id = `${uid}-smile`;
    mouthEl = (
      <g>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
        <path d={d} fill="#6A2A2E" />
        <g clipPath={`url(#${id})`}>
          <rect x={mx - w / 2} y={my - 6} width={w} height={h * 0.42 + 5} fill="#FBF7F2" />
          <ellipse cx={mx} cy={my + h} rx={w * 0.26} ry={h * 0.35} fill="#C9575E" />
        </g>
        <path d={d} fill="none" stroke={lipLine} strokeWidth={ol * 0.75} strokeLinejoin="round" />
      </g>
    );
  } else if (mouth.open < 0.05) {
    const w = mw * (1 + 0.15 * sm) * (1 - 0.25 * mouth.round);
    mouthEl = (
      <g>
        <path d={`M ${mx - w / 2} ${my - sm * 3} Q ${mx} ${my + sm * 7 + 2} ${mx + w / 2} ${my - sm * 3}`} stroke={lipLine} strokeWidth={ol * (child ? 1.15 : 1.05)} fill="none" strokeLinecap="round" />
        {/* нижняя губа — лёгкая тень */}
        <path d={`M ${mx - w * 0.2} ${my + sm * 4 + 6} Q ${mx} ${my + sm * 4 + 9} ${mx + w * 0.2} ${my + sm * 4 + 6}`} stroke={look.skinShade} strokeWidth={ol * 0.9} fill="none" strokeLinecap="round" opacity={0.7} />
      </g>
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
        <path d={d} fill="none" stroke={lipLine} strokeWidth={ol * 0.75} strokeLinejoin="round" />
      </g>
    );
  }
  // очки: оправа вокруг глаз, перемычка, дужка к ближнему уху
  const glasses = look.glasses
    ? (() => {
        const gc = look.glasses;
        const lens = ([-1, 1] as const).map((side) => {
          const far = Math.max(0, side * turn);
          const sx = 1 - 0.45 * far + 0.06 * Math.max(0, -side * turn);
          const ex = fx + side * gap * (1 - 0.25 * far);
          const w = ew * sx * 1.5;
          const h = eh * 2.3;
          return { side, ex, w, h, x0: ex - w / 2, x1: ex + w / 2 };
        });
        const [L, R] = lens;
        const yy = eyeY + eh * 0.1;
        const nearSide = turn > 0.15 ? -1 : turn < -0.15 ? 1 : 0;
        const nearLens = nearSide ? lens.find((q) => q.side === nearSide) : null;
        const earX = nearSide ? g.skullX + nearSide * rx * (0.95 - 0.3 * at) : 0;
        return (
          <g>
            {lens.map((q) => (
              <rect key={q.side} x={q.x0} y={yy - q.h / 2} width={q.w} height={q.h} rx={q.h * 0.32} fill="#FFFFFF" fillOpacity={0.14} stroke={gc} strokeWidth={ol * 1.05} />
            ))}
            <path d={`M ${L.x1} ${yy - eh * 0.25} Q ${(L.x1 + R.x0) / 2} ${yy - eh * 0.6} ${R.x0} ${yy - eh * 0.25}`} stroke={gc} strokeWidth={ol * 1.05} fill="none" />
            {nearLens ? <path d={`M ${nearSide > 0 ? nearLens.x1 : nearLens.x0} ${yy - eh * 0.4} L ${earX} ${yy - eh * 0.1}`} stroke={gc} strokeWidth={ol * 1.05} strokeLinecap="round" /> : null}
            <path d={`M ${L.x0 + L.w * 0.18} ${yy - L.h * 0.22} l ${L.w * 0.16} ${-L.h * 0.1}`} stroke="#FFFFFF" strokeWidth={ol * 0.8} strokeLinecap="round" opacity={0.6} />
          </g>
        );
      })()
    : null;
  return (
    <>
      <defs>
        {/* тень на дальней стороне лица (свет слева сверху + поворот) */}
        <linearGradient id={`${uid}-fshade`} x1={turn >= 0 ? 0 : 1} y1={0} x2={turn >= 0 ? 1 : 0} y2={0.15}>
          <stop offset={0.5 - at * 0.15} stopColor={look.skinShade} stopOpacity={0} />
          <stop offset={1} stopColor={look.skinShade} stopOpacity={0.55 + at * 0.25} />
        </linearGradient>
        {/* мягкая тень под линией волос */}
        <radialGradient id={`${uid}-hshade`}>
          <stop offset={0.35} stopColor={look.skinShade} stopOpacity={0.45} />
          <stop offset={1} stopColor={look.skinShade} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${uid}-flight`}>
          <stop offset={0} stopColor={lightOf(look.skin, 0.5)} stopOpacity={0.35} />
          <stop offset={1} stopColor={lightOf(look.skin, 0.5)} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${uid}-blush`}>
          <stop offset="0" stopColor="#EC7E6A" stopOpacity={child ? 0.42 : 0.3} />
          <stop offset="1" stopColor="#EC7E6A" stopOpacity={0} />
        </radialGradient>
        <clipPath id={fid}>
          <path d={face} />
        </clipPath>
        <clipPath id={`${uid}-farhalf`}>
          <rect x={turn >= 0 ? chinX - rx * 0.05 : faceX - rx * 2} y={cy - ry * 2} width={rx * 2} height={ry * 4} />
        </clipPath>
      </defs>
      <path d={face} fill={look.skin} />
      {/* контур лица: со стороны затылка при повороте гаснет (там силуэт
          даёт затылок), с дальней стороны — всегда */}
      <path d={face} fill="none" stroke={sl} strokeWidth={ol} strokeLinejoin="round" opacity={clamp01(1 - at * 1.6)} />
      <g clipPath={`url(#${uid}-farhalf)`}>
        <path d={face} fill="none" stroke={sl} strokeWidth={ol} strokeLinejoin="round" />
      </g>
      {/* тень на дальней стороне лица и под линией волос */}
      <g clipPath={`url(#${fid})`}>
        <path d={face} fill={`url(#${uid}-fshade)`} />
        <ellipse cx={faceX} cy={cy - ry * 0.7} rx={faceRx * 1.15} ry={ry * 0.36} fill={`url(#${uid}-hshade)`} />
        <ellipse cx={faceX - (turn >= 0 ? 1 : -1) * rx * 0.3} cy={cy - ry * 0.3} rx={rx * 0.55} ry={ry * 0.45} fill={`url(#${uid}-flight)`} />
      </g>
      {look.stubble ? (
        <path
          d={`M ${cx - rx * 0.85} ${cy + ry * 0.35} C ${cx - rx * 0.7} ${cy + ry * 1.0} ${cx + rx * 0.7} ${cy + ry * 1.0} ${cx + rx * 0.85} ${cy + ry * 0.35} L ${chinX + rx * 0.4} ${cy + ry * 0.55} Q ${chinX} ${cy + ry * 0.5} ${chinX - rx * 0.4} ${cy + ry * 0.55} Z`}
          fill="#5B4A44"
          opacity={0.13}
          clipPath={`url(#${fid})`}
        />
      ) : null}
      {cheeks}
      {eyes}
      {nose}
      {mouthEl}
      <HairFront uid={uid} look={look} cx={cx} cy={cy} turn={turn} line={ol} />
      {glasses}
    </>
  );
};

// Передние пряди и линия роста волос. Внешний край — по силуэту головы
// (объединение лица и затылка), линия роста и пробор — вместе с чертами.
const HairFront: React.FC<{ uid: string; look: Look; cx: number; cy: number; turn: number; line: number }> = ({ uid, look, cx, cy, turn, line }) => {
  const g = headGeom(look, cx, turn);
  const { rx, ry, fx } = g;
  const hair = look.hair;
  const hl = lineOf(hair);
  const ol = line;
  const L = g.left - rx * 0.03;
  const R = g.right + rx * 0.03;
  const mid = (L + R) / 2;
  const top = cy - ry * 1.14;
  const s = turn * rx * 0.28;
  const shine = (d: string) => <path d={d} stroke="#FFFFFF" strokeOpacity={0.16} strokeWidth={ol * 2.2} fill="none" strokeLinecap="round" />;
  // купол: от левого виска через макушку к правому
  const dome = (yl: number, yr: number, lift = 0) =>
    `M ${L} ${cy + ry * yl} C ${L - rx * 0.06} ${cy - ry * 0.95} ${mid - rx * 0.62} ${top - lift} ${mid + s * 0.4} ${top - lift} C ${mid + rx * 0.62} ${top - lift} ${R + rx * 0.06} ${cy - ry * 0.95} ${R} ${cy + ry * yr}`;
  const path = (d: string, key?: string) => <path key={key} d={d} fill={hair} stroke={hl} strokeWidth={ol} strokeLinejoin="round" />;
  switch (look.hairStyle) {
    case "momBob": {
      // косой пробор, пряди обрамляют лицо
      const part = cx - rx * 0.3 + s;
      return (
        <g>
          {path(`M ${cx - rx * 1.06} ${cy + ry * 0.55} C ${cx - rx * 1.16} ${cy - ry * 0.6} ${cx - rx * 0.8} ${top} ${cx} ${top} C ${cx + rx * 0.85} ${top} ${cx + rx * 1.16} ${cy - ry * 0.6} ${cx + rx * 1.06} ${cy + ry * 0.55} L ${cx + rx * 0.9} ${cy + ry * 0.4} C ${cx + rx * 0.95} ${cy - ry * 0.2} ${part + rx * 0.6} ${cy - ry * 0.72} ${part} ${cy - ry * 0.78} C ${part - rx * 0.25} ${cy - ry * 0.5} ${cx - rx * 0.75} ${cy - ry * 0.35} ${cx - rx * 0.88} ${cy + ry * 0.4} Z`)}
          {shine(`M ${part + rx * 0.1} ${cy - ry * 0.95} Q ${cx + rx * 0.5 + s} ${cy - ry * 1.02} ${cx + rx * 0.8} ${cy - ry * 0.55}`)}
        </g>
      );
    }
    case "bob": {
      // каре: косой пробор слева, длинная прядь справа закрывает висок
      const part = fx - rx * 0.32;
      const fl = Math.max(L, g.faceX - g.faceRx - rx * 0.06);
      const fr = Math.min(R, g.faceX + g.faceRx + rx * 0.06);
      return (
        <g>
          {path(
            `${dome(0.7, 0.7, rx * 0.04)} L ${fr - rx * 0.12} ${cy + ry * 0.62} C ${fr - rx * 0.1} ${cy - ry * 0.15} ${part + rx * 0.55} ${cy - ry * 0.62} ${part} ${cy - ry * 0.74} C ${part - rx * 0.2} ${cy - ry * 0.5} ${fl + rx * 0.12} ${cy - ry * 0.25} ${fl + rx * 0.1} ${cy + ry * 0.62} Z`,
          )}
          <path d={`M ${part} ${cy - ry * 0.76} Q ${part + rx * 0.05} ${cy - ry * 0.98} ${part + rx * 0.02} ${top + ry * 0.1}`} stroke={hl} strokeWidth={ol * 0.8} fill="none" strokeLinecap="round" opacity={0.8} />
          {shine(`M ${part + rx * 0.22} ${cy - ry * 0.98} Q ${fr - rx * 0.4} ${cy - ry * 0.95} ${fr - rx * 0.22} ${cy - ry * 0.45}`)}
        </g>
      );
    }
    case "girlBraids":
      // ровная чёлка
      return (
        <g>
          {path(
            `M ${cx - rx * 1.04} ${cy + ry * 0.15} C ${cx - rx * 1.12} ${cy - ry * 0.9} ${cx - rx * 0.6} ${top} ${cx} ${top} C ${cx + rx * 0.6} ${top} ${cx + rx * 1.12} ${cy - ry * 0.9} ${cx + rx * 1.04} ${cy + ry * 0.15} L ${cx + rx * 0.86} ${cy - ry * 0.2} Q ${cx + rx * 0.5 + s} ${cy - ry * 0.32} ${cx + s} ${cy - ry * 0.34} Q ${cx - rx * 0.5 + s} ${cy - ry * 0.32} ${cx - rx * 0.86} ${cy - ry * 0.2} Z`,
          )}
          {shine(`M ${cx - rx * 0.5 + s} ${cy - ry * 0.95} Q ${cx + s} ${cy - ry * 1.05} ${cx + rx * 0.5 + s} ${cy - ry * 0.95}`)}
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
    case "boyShort": {
      // чёлка: неровные пряди над бровями, чуть сдвинуты к стороне взгляда
      const fy = cy - ry * 0.4;
      const tips = [-0.62, -0.3, 0.02, 0.34, 0.62].map((u, i) => ({ x: fx + u * rx * 0.95 - turn * rx * 0.08, y: fy + (i % 2 ? -ry * 0.05 : ry * 0.04) + Math.abs(u) * ry * 0.12 }));
      const rev = tips.slice().reverse();
      const scallops = rev
        .slice(1)
        .map((p, i) => `Q ${(p.x + rev[i].x) / 2} ${Math.min(p.y, rev[i].y) - ry * 0.16} ${p.x} ${p.y}`)
        .join(" ");
      return (
        <g>
          {path(
            `${dome(-0.16, -0.16, rx * 0.06)} L ${R - rx * 0.1} ${cy - ry * 0.26} Q ${rev[0].x + rx * 0.2} ${cy - ry * 0.45} ${rev[0].x} ${rev[0].y} ${scallops} Q ${tips[0].x - rx * 0.22} ${cy - ry * 0.45} ${L + rx * 0.1} ${cy - ry * 0.26} Z`,
          )}
          {shine(`M ${mid - rx * 0.45 + s * 0.4} ${cy - ry * 0.98} Q ${mid + s * 0.4} ${top + ry * 0.04} ${mid + rx * 0.4 + s * 0.4} ${cy - ry * 0.95}`)}
        </g>
      );
    }
    case "dadShort":
    case "shortGrey": {
      // короткая аккуратная стрижка: пробор слева, прядь уложена вправо
      const grey = look.hairStyle === "shortGrey";
      const part = fx - rx * 0.38;
      const id = `${uid}-hair`;
      // линия роста: виски с лёгкими «углами», пробор слева, чёлка уложена вправо
      const tR = Math.min(R - rx * 0.16, fx + rx * 0.62);
      const tL = Math.max(L + rx * 0.16, fx - rx * 0.66);
      const d = `${dome(-0.16, -0.16, rx * (grey ? 0.03 : 0.07))} L ${R - rx * 0.06} ${cy - ry * 0.3} Q ${R - rx * 0.08} ${cy - ry * 0.56} ${tR} ${cy - ry * 0.6} C ${fx + rx * 0.4} ${cy - ry * 0.74} ${fx + rx * 0.15} ${cy - ry * 0.7} ${fx - rx * 0.05} ${cy - ry * 0.66} C ${part + rx * 0.12} ${cy - ry * 0.7} ${part + rx * 0.04} ${cy - ry * 0.78} ${part} ${cy - ry * 0.78} C ${part - rx * 0.12} ${cy - ry * 0.74} ${tL + rx * 0.1} ${cy - ry * 0.66} ${tL} ${cy - ry * 0.58} Q ${L + rx * 0.08} ${cy - ry * 0.54} ${L + rx * 0.06} ${cy - ry * 0.3} Z`;
      return (
        <g>
          <clipPath id={id}>
            <path d={d} />
          </clipPath>
          {path(d)}
          {/* пробор и уложенная прядь */}
          <path d={`M ${part} ${cy - ry * 0.8} Q ${part + rx * 0.02} ${cy - ry * 0.95} ${part + rx * 0.1} ${top + ry * 0.12}`} stroke={hl} strokeWidth={ol * 0.8} fill="none" strokeLinecap="round" />
          <path d={`M ${part + rx * 0.14} ${cy - ry * 0.8} Q ${fx + rx * 0.3} ${cy - ry * 0.98} ${tR - rx * 0.05} ${cy - ry * 0.66}`} stroke={hl} strokeWidth={ol * 0.6} fill="none" strokeLinecap="round" opacity={0.6} />
          {shine(`M ${part + rx * 0.2} ${cy - ry * 0.92} Q ${fx + rx * 0.3} ${top + ry * 0.04} ${R - rx * 0.3} ${cy - ry * 0.8}`)}
          {look.temples ? (
            <g clipPath={`url(#${id})`}>
              <ellipse cx={L + rx * 0.08} cy={cy - ry * 0.28} rx={rx * 0.2} ry={ry * 0.32} fill={look.temples} opacity={0.9} />
              <ellipse cx={R - rx * 0.08} cy={cy - ry * 0.28} rx={rx * 0.2} ry={ry * 0.32} fill={look.temples} opacity={0.9} />
              <path d={`M ${part + rx * 0.3} ${cy - ry * 0.8} Q ${fx + rx * 0.4} ${cy - ry * 0.98} ${R - rx * 0.3} ${cy - ry * 0.7}`} stroke={look.temples} strokeWidth={ol * 1.2} fill="none" opacity={0.6} />
            </g>
          ) : null}
        </g>
      );
    }
    case "longTail":
    case "bun": {
      // гладко зачёсаны назад: мягкий пробор, пряди к затылку
      const part = fx - rx * 0.2;
      return (
        <g>
          {path(
            `${dome(-0.14, -0.14, rx * 0.02)} L ${R - rx * 0.08} ${cy - ry * 0.3} C ${R - rx * 0.2} ${cy - ry * 0.68} ${part + rx * 0.4} ${cy - ry * 0.8} ${part} ${cy - ry * 0.76} C ${part - rx * 0.4} ${cy - ry * 0.74} ${L + rx * 0.2} ${cy - ry * 0.62} ${L + rx * 0.08} ${cy - ry * 0.3} Z`,
          )}
          <path d={`M ${part} ${cy - ry * 0.78} Q ${part - rx * 0.05} ${cy - ry * 0.98} ${part + rx * 0.05} ${top + ry * 0.08}`} stroke={hl} strokeWidth={ol * 0.7} fill="none" strokeLinecap="round" opacity={0.7} />
          <path d={`M ${part + rx * 0.15} ${cy - ry * 0.8} Q ${R - rx * 0.35} ${cy - ry * 0.85} ${R - rx * 0.12} ${cy - ry * 0.35}`} stroke={hl} strokeWidth={ol * 0.6} fill="none" strokeLinecap="round" opacity={0.5} />
          {shine(`M ${part + rx * 0.2} ${cy - ry * 0.96} Q ${mid + rx * 0.3} ${top + ry * 0.05} ${R - rx * 0.28} ${cy - ry * 0.75}`)}
        </g>
      );
    }
    default:
      return null;
  }
};
