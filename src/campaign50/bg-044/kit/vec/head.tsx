// Голова персонажа в плоском 2D-стиле: овал лица с поворотом turn
// (−1…1, 0 — анфас, +0,6 — сильные 3/4 вправо), глаза-«бобы» с бликом,
// брови, нос, рот (выражения + липсинк), уши, причёски. Рисуется в двух
// частях: back (волосы за головой, пучок, хвостики) и front (лицо).
import { INK, P, pt, type Pt } from "./core";

export type HairStyle = "momBun" | "boyShort" | "girlPigtails" | "boyNeat" | "manShort";
export type Expr = "smile" | "neutral" | "thoughtful" | "happy" | "joy";

export type HeadLook = {
  readonly rx: number;
  readonly ry: number;
  readonly skin: string;
  readonly skinShade: string;
  readonly hair: string;
  readonly hairShade: string;
  readonly style: HairStyle;
  readonly child: boolean;
  readonly lips: string;
  readonly glasses?: boolean;
  readonly tie?: string;
  readonly greyTemples?: boolean;
  readonly stubble?: boolean;
  readonly blush?: number;
  readonly lashes?: boolean;
};

export type HeadProps = {
  readonly look: HeadLook;
  readonly turn: number;
  readonly gaze: Pt; // −1…1 по x (вправо) и y (вниз)
  readonly expr: Expr;
  readonly mouth: number; // 0…1 липсинк
  readonly blink: number; // 0…1
  readonly sway: number; // покачивание хвостиков (градусы)
  readonly part: "back" | "front";
};

const EYE = "#2A211F";
const MOUTH_IN = "#7C2F2F";
const TONGUE = "#D96A69";

export const Head: React.FC<HeadProps> = (p) => (p.part === "back" ? <HeadBack {...p} /> : <HeadFront {...p} />);

// ---------- задняя часть: волосы за головой, пучок, хвостики ----------
const HeadBack: React.FC<HeadProps> = ({ look, turn, sway }) => {
  const { rx, ry, hair, hairShade } = look;
  const t = turn;
  const els: React.ReactNode[] = [];
  const bx = -t * rx * 0.2;
  if (look.style === "momBun") {
    // волосы гладко назад, низкий пучок на затылке
    const bunX = -rx * (0.1 + 0.95 * Math.max(0, t)) + rx * 0.95 * Math.max(0, -t);
    const bunY = ry * 0.36;
    const br = rx * 0.4;
    els.push(<ellipse key="cap" cx={bx} cy={-ry * 0.16} rx={rx * 1.07} ry={ry * 1.02} fill={hair} stroke={INK} strokeWidth={3} />);
    els.push(
      <g key="bun">
        <ellipse cx={bunX} cy={bunY} rx={br} ry={br * 0.92} fill={hair} stroke={INK} strokeWidth={3} />
        <path d={`M ${bunX - br * 0.55} ${bunY - br * 0.35} Q ${bunX} ${bunY - br * 0.85} ${bunX + br * 0.55} ${bunY - br * 0.2}`} stroke={hairShade} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <path d={`M ${bunX - br * 0.6} ${bunY + br * 0.15} Q ${bunX} ${bunY - br * 0.15} ${bunX + br * 0.62} ${bunY + br * 0.3}`} stroke={hairShade} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <path d={`M ${bunX - br * 0.45} ${bunY - br * 0.62} Q ${bunX - br * 0.1} ${bunY - br * 0.82} ${bunX + br * 0.25} ${bunY - br * 0.72}`} stroke="#FFFFFF" strokeOpacity={0.22} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      </g>,
    );
  } else if (look.style === "girlPigtails") {
    els.push(<ellipse key="cap" cx={bx} cy={-ry * 0.16} rx={rx * 1.06} ry={ry * 1.02} fill={hair} stroke={INK} strokeWidth={3} />);
    for (const side of [-1, 1] as const) {
      // дальний хвостик при повороте прячется глубже за голову
      const far = Math.max(0, side * t);
      const tx = side * rx * (0.98 - far * 0.38) - t * rx * 0.18;
      const ty = -ry * 0.22;
      const a = side * (28 - far * 10) + sway * (1 - far * 0.4);
      els.push(
        <g key={`pig${side}`} transform={`rotate(${a} ${tx} ${ty})`}>
          <path
            d={`M ${tx - rx * 0.16} ${ty} C ${tx - rx * 0.34} ${ty + ry * 0.45} ${tx - rx * 0.2} ${ty + ry * 0.95} ${tx} ${ty + ry * 1.12} C ${tx + rx * 0.2} ${ty + ry * 0.95} ${tx + rx * 0.34} ${ty + ry * 0.45} ${tx + rx * 0.16} ${ty} Z`}
            fill={hair}
            stroke={INK}
            strokeWidth={3}
          />
          <path d={`M ${tx - rx * 0.05} ${ty + ry * 0.25} Q ${tx + rx * 0.08} ${ty + ry * 0.6} ${tx} ${ty + ry * 0.9}`} stroke={hairShade} strokeWidth={3} fill="none" strokeLinecap="round" />
          <ellipse cx={tx} cy={ty + ry * 0.04} rx={rx * 0.17} ry={rx * 0.11} fill={look.tie ?? "#E8735A"} stroke={INK} strokeWidth={2.5} />
        </g>,
      );
    }
  } else {
    els.push(<ellipse key="cap" cx={bx} cy={-ry * (look.style === "manShort" ? 0.2 : 0.18)} rx={rx * 1.05} ry={ry * 0.99} fill={hair} stroke={INK} strokeWidth={3} />);
  }
  return <>{els}</>;
};

// Миндалевидный/круглый глаз.
const eyeEl = (key: string, x: number, y: number, w: number, h: number, look: HeadLook, blink: number, joy: boolean, lid: number, side: number) => {
  if (joy) {
    return <path key={key} d={`M ${x - w * 1.05} ${y + h * 0.35} Q ${x} ${y - h * 1.05} ${x + w * 1.05} ${y + h * 0.35}`} stroke={EYE} strokeWidth={Math.max(3, w * 0.42)} fill="none" strokeLinecap="round" />;
  }
  if (blink > 0.55) {
    return <path key={key} d={`M ${x - w * 1.05} ${y} Q ${x} ${y + h * 0.75} ${x + w * 1.05} ${y}`} stroke={EYE} strokeWidth={Math.max(3, w * 0.4)} fill="none" strokeLinecap="round" />;
  }
  const sy = 1 - blink * 0.7;
  const hh = h * sy;
  const lidY = y - hh + hh * 2 * lid;
  return (
    <g key={key}>
      <ellipse cx={x} cy={y} rx={w} ry={hh} fill={EYE} />
      <ellipse cx={x + w * 0.32} cy={y - hh * 0.38} rx={w * 0.34} ry={w * 0.34} fill="#FFFFFF" opacity={0.95} />
      <circle cx={x - w * 0.3} cy={y + hh * 0.42} r={w * 0.15} fill="#FFFFFF" opacity={0.55} />
      {lid > 0.02 ? (
        <>
          <rect x={x - w * 1.5} y={y - hh * 1.6} width={w * 3} height={Math.max(0, lidY - (y - hh * 1.6))} fill={look.skin} />
          <path d={`M ${x - w * 1.1} ${lidY + 1} Q ${x} ${lidY - 2.5} ${x + w * 1.1} ${lidY + 1}`} stroke={EYE} strokeWidth={Math.max(2.5, w * 0.32)} fill="none" strokeLinecap="round" />
        </>
      ) : look.lashes ? (
        // ресничная линия у мамы: чуть длиннее к внешнему уголку
        <path
          d={`M ${x - w * 1.05 - (side < 0 ? 2 : 0)} ${y - hh * 0.35} Q ${x - w * 0.2} ${y - hh * 1.35} ${x + w * 1.1 + (side > 0 ? 3 : 0)} ${y - hh * 0.55}`}
          stroke={EYE}
          strokeWidth={Math.max(2.4, w * 0.3)}
          fill="none"
          strokeLinecap="round"
        />
      ) : null}
    </g>
  );
};

const HeadFront: React.FC<HeadProps> = ({ look, turn, gaze, expr, mouth, blink }) => {
  const { rx, ry, skin, skinShade } = look;
  const t = Math.max(-0.75, Math.min(0.75, turn));
  const at = Math.abs(t);
  const child = look.child;
  const male = look.style === "manShort";
  const els: React.ReactNode[] = [];

  // уши: ближнее (сторона, противоположная повороту) видно, дальнее — пока поворот мал
  for (const side of [-1, 1] as const) {
    const far = side * t; // >0 — ухо уходит за голову
    if (far > 0.3) continue;
    const ex = side * rx * (0.96 - Math.max(0, -far) * 0.22) - t * rx * 0.05;
    const ey = ry * (child ? 0.16 : 0.08);
    const erx = rx * (child ? 0.19 : 0.16) * (1 - Math.max(0, far) * 1.2);
    const ery = ry * (child ? 0.22 : 0.21);
    els.push(
      <g key={`ear${side}`}>
        <ellipse cx={ex} cy={ey} rx={Math.max(2, erx)} ry={ery} fill={skin} stroke={INK} strokeWidth={3} />
        <path d={`M ${ex + side * erx * 0.1} ${ey - ery * 0.45} Q ${ex - side * erx * 0.45} ${ey} ${ex + side * erx * 0.05} ${ey + ery * 0.45}`} stroke={skinShade} strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>,
    );
  }

  // лицо
  const chinX = t * rx * 0.3;
  const jaw = male ? 0.72 : child ? 0.66 : 0.58;
  const chinW = male ? 0.62 : 0.5;
  const face = `M ${-rx} ${-ry * 0.08} C ${-rx} ${-ry * 1.36} ${rx} ${-ry * 1.36} ${rx} ${-ry * 0.08} C ${rx} ${ry * jaw} ${chinX + rx * chinW} ${ry * 1.0} ${chinX} ${ry * 1.0} C ${chinX - rx * chinW} ${ry * 1.0} ${-rx} ${ry * jaw} ${-rx} ${-ry * 0.08} Z`;
  els.push(<path key="face" d={face} fill={skin} stroke={INK} strokeWidth={3} strokeLinejoin="round" />);
  // мягкая тень по дальней щеке (одна тень), чуть ниже — под волосами
  const sx = t >= 0 ? 1 : -1;
  els.push(
    <path
      key="faceShade"
      d={`M ${sx * rx * 0.97} ${-ry * 0.25} C ${sx * rx * 0.99} ${ry * 0.3} ${chinX + sx * rx * 0.5} ${ry * 0.94} ${chinX + sx * rx * 0.08} ${ry * 0.985} C ${chinX + sx * rx * 0.42} ${ry * 0.72} ${sx * rx * 0.8} ${ry * 0.3} ${sx * rx * 0.97} ${-ry * 0.25} Z`}
      fill={skinShade}
      opacity={0.38 + at * 0.2}
    />,
  );
  if (look.stubble) {
    els.push(
      <path
        key="stubble"
        d={`M ${-rx * 0.86} ${ry * 0.3} C ${-rx * 0.7} ${ry * 0.92} ${rx * 0.7} ${ry * 0.92} ${rx * 0.86} ${ry * 0.3} C ${rx * 0.55} ${ry * 0.62} ${chinX + rx * 0.3} ${ry * 0.55} ${chinX} ${ry * 0.6} C ${chinX - rx * 0.3} ${ry * 0.55} ${-rx * 0.55} ${ry * 0.62} ${-rx * 0.86} ${ry * 0.3} Z`}
        fill="#4E4441"
        opacity={0.12}
      />,
    );
  }

  // черты лица
  const fx = t * rx * 0.46;
  const eyeY = ry * (child ? 0.14 : 0.04);
  const ew = rx * (child ? 0.115 : 0.095);
  const eh = rx * (child ? 0.15 : 0.12);
  const gap = rx * (child ? 0.42 : 0.4) * (1 - 0.16 * at);
  const joy = expr === "joy";
  const lid = expr === "thoughtful" ? 0.12 : gaze.y > 0.45 ? 0.38 * Math.min(1, (gaze.y - 0.45) / 0.4) : 0;
  const gx = gaze.x * ew * 0.45;
  const gy = gaze.y * eh * 0.3;
  const eyePos: { x: number; y: number; w: number; side: number }[] = [];
  for (const side of [-1, 1] as const) {
    const far = Math.max(0, side * t);
    const ex = fx + side * gap * (1 - far * 0.12);
    const w = ew * (1 - far * 0.38);
    eyePos.push({ x: ex + gx, y: eyeY + gy, w, side });
  }
  // румянец
  const blush = look.blush ?? (child ? 0.34 : 0.18);
  if (blush > 0) {
    for (const e of eyePos) {
      els.push(<ellipse key={`bl${e.side}`} cx={e.x - gx + e.side * ew * 0.4} cy={eyeY + eh * 2.1} rx={e.w * 1.5} ry={eh * 0.62} fill="#F07F6C" opacity={blush} />);
    }
  }
  for (const e of eyePos) els.push(eyeEl(`eye${e.side}`, e.x, e.y, e.w, eh, look, blink, joy, lid, e.side));

  // брови
  const browUp = expr === "happy" || joy ? 2.5 : 0;
  for (const e of eyePos) {
    const raise = expr === "thoughtful" && e.side > 0 ? 4 : 0;
    const inner = expr === "thoughtful" && e.side < 0 ? -1.5 : 0;
    const by = eyeY - eh - (child ? 9 : 8) - browUp - raise;
    const bw = e.w * 1.25;
    els.push(
      <path
        key={`brow${e.side}`}
        d={`M ${e.x - gx - bw} ${by + 1.5 - (e.side > 0 ? inner : 0)} Q ${e.x - gx} ${by - 3.5} ${e.x - gx + bw} ${by + 1.5 - (e.side < 0 ? inner : 0)}`}
        stroke={look.hair}
        strokeWidth={male ? 4.6 : child ? 3.8 : 3.2}
        fill="none"
        strokeLinecap="round"
      />,
    );
  }

  // нос
  const nx = fx + t * rx * 0.2;
  const ny = eyeY + ry * (child ? 0.27 : 0.32);
  if (at > 0.12) {
    els.push(
      <path
        key="nose"
        d={`M ${nx - sx * 1} ${ny - ry * 0.16} Q ${nx + sx * rx * 0.13} ${ny + 1} ${nx - sx * 1.5} ${ny + 3}`}
        stroke={skinShade}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />,
    );
  } else {
    els.push(<ellipse key="nose" cx={nx} cy={ny} rx={rx * 0.07} ry={ry * 0.045} fill={skinShade} />);
  }

  // рот
  const mx = fx + t * rx * 0.06;
  const my = ry * (child ? 0.6 : 0.58);
  const mw = rx * (child ? 0.36 : 0.38) * (1 - 0.22 * at);
  const lips = look.lips;
  if (mouth > 0.06) {
    const smile = expr === "smile" || expr === "happy" || joy ? 1 : 0;
    const w = mw * (0.82 + 0.12 * smile + 0.1 * mouth);
    const h = 3 + rx * 0.3 * mouth;
    const d = `M ${mx - w / 2} ${my - smile * 1.5} C ${mx - w * 0.3} ${my - h * 0.35} ${mx + w * 0.3} ${my - h * 0.35} ${mx + w / 2} ${my - smile * 1.5} C ${mx + w * 0.45} ${my + h * 0.95} ${mx - w * 0.45} ${my + h * 0.95} ${mx - w / 2} ${my - smile * 1.5} Z`;
    els.push(
      <g key="mouth">
        <path d={d} fill={MOUTH_IN} stroke={lips} strokeWidth={2.4} strokeLinejoin="round" />
        {mouth > 0.3 ? <path d={`M ${mx - w * 0.36} ${my - h * 0.12} Q ${mx} ${my - h * 0.3} ${mx + w * 0.36} ${my - h * 0.12} L ${mx + w * 0.3} ${my + h * 0.06} Q ${mx} ${my - h * 0.02} ${mx - w * 0.3} ${my + h * 0.06} Z`} fill="#FFFFFF" /> : null}
        {mouth > 0.4 ? <ellipse cx={mx} cy={my + h * 0.55} rx={w * 0.26} ry={h * 0.17} fill={TONGUE} /> : null}
      </g>,
    );
  } else if (expr === "happy" || joy) {
    const w = mw * 1.12;
    const h = rx * 0.2;
    const d = `M ${mx - w / 2} ${my - 2} Q ${mx} ${my + 0.5} ${mx + w / 2} ${my - 2} Q ${mx + w * 0.42} ${my + h} ${mx} ${my + h} Q ${mx - w * 0.42} ${my + h} ${mx - w / 2} ${my - 2} Z`;
    els.push(
      <g key="mouth">
        <path d={d} fill={MOUTH_IN} stroke={lips} strokeWidth={2.4} strokeLinejoin="round" />
        <path d={`M ${mx - w * 0.38} ${my - 0.8} Q ${mx} ${my + 1.8} ${mx + w * 0.38} ${my - 0.8} L ${mx + w * 0.32} ${my + h * 0.3} Q ${mx} ${my + h * 0.38} ${mx - w * 0.32} ${my + h * 0.3} Z`} fill="#FFFFFF" />
        <ellipse cx={mx} cy={my + h * 0.74} rx={w * 0.22} ry={h * 0.16} fill={TONGUE} />
      </g>,
    );
  } else if (expr === "smile") {
    els.push(<path key="mouth" d={`M ${mx - mw / 2} ${my - 2} Q ${mx} ${my + rx * 0.16} ${mx + mw / 2} ${my - 2}`} stroke={lips} strokeWidth={3.4} fill="none" strokeLinecap="round" />);
  } else if (expr === "thoughtful") {
    els.push(<path key="mouth" d={`M ${mx - mw * 0.32} ${my + 1.5} Q ${mx + mw * 0.05} ${my + 3} ${mx + mw * 0.36} ${my - 2}`} stroke={lips} strokeWidth={3.2} fill="none" strokeLinecap="round" />);
  } else {
    els.push(<path key="mouth" d={`M ${mx - mw * 0.34} ${my + 0.5} Q ${mx} ${my + 3} ${mx + mw * 0.34} ${my + 0.5}`} stroke={lips} strokeWidth={3.2} fill="none" strokeLinecap="round" />);
  }

  els.push(<HairFront key="hairF" look={look} t={t} />);

  if (look.glasses) {
    const [a, b] = eyePos;
    const gr = ew * 2.05;
    els.push(
      <g key="glasses" fill="none" stroke={INK} strokeWidth={3.2}>
        <ellipse cx={a.x - gx} cy={eyeY + 1} rx={gr * (a.w / ew)} ry={gr * 0.92} fill="#FFFFFF" fillOpacity={0.12} />
        <ellipse cx={b.x - gx} cy={eyeY + 1} rx={gr * (b.w / ew)} ry={gr * 0.92} fill="#FFFFFF" fillOpacity={0.12} />
        <path d={`M ${a.x - gx + gr * (a.w / ew)} ${eyeY - 1} Q ${(a.x + b.x) / 2 - gx} ${eyeY - 5} ${b.x - gx - gr * (b.w / ew)} ${eyeY - 1}`} />
        <path d={`M ${a.x - gx - gr * (a.w / ew)} ${eyeY - 1} L ${-rx * (0.94 - Math.max(0, t) * 0.2)} ${eyeY - 3}`} />
      </g>,
    );
  }
  return <>{els}</>;
};

// Передние пряди / линия роста волос.
const HairFront: React.FC<{ readonly look: HeadLook; readonly t: number }> = ({ look, t }) => {
  const { rx, ry, hair, hairShade } = look;
  const top = -ry * 1.2;
  const hi = (
    <path
      d={`M ${-rx * 0.5 + t * rx * 0.1} ${-ry * 0.98} Q ${t * rx * 0.2} ${-ry * 1.12} ${rx * 0.45 + t * rx * 0.1} ${-ry * 0.98}`}
      stroke="#FFFFFF"
      strokeOpacity={0.2}
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
    />
  );
  switch (look.style) {
    case "momBun": {
      // боковой пробор, гладко зачёсано назад, мягкая прядь над правым виском
      const part = -rx * 0.22 + t * rx * 0.34;
      const lx = -rx * (0.9 - Math.max(0, t) * 0.08);
      const d = [
        `M ${-rx * 1.04} ${ry * 0.1}`,
        `C ${-rx * 1.12} ${-ry * 0.95} ${-rx * 0.52} ${top - 2} ${t * rx * 0.18} ${top}`,
        `C ${rx * 0.78} ${top + 1} ${rx * 1.1} ${-ry * 0.78} ${rx * 1.01} ${-ry * 0.1}`,
        `C ${rx * 0.96} ${ry * 0.02} ${rx * 0.9} ${ry * 0.02} ${rx * 0.86} ${-ry * 0.12}`,
        `C ${rx * 0.8} ${-ry * 0.58} ${part + rx * 0.55} ${-ry * 0.8} ${part} ${-ry * 0.86}`,
        `C ${part - rx * 0.28} ${-ry * 0.74} ${lx + rx * 0.22} ${-ry * 0.6} ${lx} ${-ry * 0.08}`,
        `L ${lx - rx * 0.02} ${ry * 0.1}`,
        "Z",
      ].join(" ");
      return (
        <g>
          <path d={d} fill={hair} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <path d={`M ${part + rx * 0.08} ${-ry * 0.84} Q ${rx * 0.55} ${-ry * 0.82} ${rx * 0.78} ${-ry * 0.3}`} stroke={hairShade} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d={`M ${part - rx * 0.1} ${-ry * 0.82} Q ${-rx * 0.45} ${-ry * 0.7} ${lx + rx * 0.06} ${-ry * 0.25}`} stroke={hairShade} strokeWidth={3} fill="none" strokeLinecap="round" />
          {hi}
        </g>
      );
    }
    case "boyShort": {
      // короткая стрижка с мягкой «рваной» чёлкой
      const s = t * rx * 0.3;
      const tips: Pt[] = [];
      const n = 5;
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        const x = rx * 0.9 - u * rx * 1.78 + s * (1 - Math.abs(u - 0.5) * 1.2);
        const y = i % 2 === 0 ? -ry * 0.62 + Math.abs(u - 0.5) * ry * 0.5 : -ry * 0.42 + Math.abs(u - 0.5) * ry * 0.3;
        tips.push(pt(x, y));
      }
      let fringe = "";
      for (let i = 1; i < tips.length; i++) {
        const a = tips[i - 1];
        const b = tips[i];
        fringe += ` Q ${(a.x + b.x) / 2 + 2} ${Math.max(a.y, b.y) + 6} ${P(b)}`;
      }
      const d = `M ${-rx * 1.03} ${ry * 0.02} C ${-rx * 1.1} ${-ry * 0.95} ${-rx * 0.45} ${top - 4} ${t * rx * 0.1} ${top - 4} C ${rx * 0.65} ${top - 4} ${rx * 1.1} ${-ry * 0.92} ${rx * 1.02} ${-ry * 0.12} L ${rx * 0.9} ${-ry * 0.2} L ${P(tips[0])}${fringe} L ${-rx * 0.92} ${-ry * 0.1} L ${-rx * 0.94} ${ry * 0.02} Z`;
      return (
        <g>
          <path d={d} fill={hair} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          {hi}
        </g>
      );
    }
    case "girlPigtails": {
      const s = t * rx * 0.25;
      const d = `M ${-rx * 1.03} ${ry * 0.05} C ${-rx * 1.12} ${-ry * 0.95} ${-rx * 0.5} ${top - 2} ${t * rx * 0.12} ${top - 2} C ${rx * 0.7} ${top - 2} ${rx * 1.12} ${-ry * 0.9} ${rx * 1.03} ${ry * 0.05} L ${rx * 0.9} ${-ry * 0.08} C ${rx * 0.88} ${-ry * 0.32} ${rx * 0.6 + s} ${-ry * 0.4} ${s} ${-ry * 0.4} C ${-rx * 0.6 + s} ${-ry * 0.4} ${-rx * 0.88} ${-ry * 0.32} ${-rx * 0.9} ${-ry * 0.08} Z`;
      return (
        <g>
          <path d={d} fill={hair} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <path d={`M ${-rx * 0.35 + s} ${-ry * 0.43} L ${-rx * 0.3 + s} ${-ry * 0.62} M ${rx * 0.3 + s} ${-ry * 0.43} L ${rx * 0.25 + s} ${-ry * 0.62}`} stroke={hairShade} strokeWidth={3} strokeLinecap="round" />
          {hi}
        </g>
      );
    }
    case "boyNeat": {
      const part = -rx * 0.35 + t * rx * 0.3;
      const d = `M ${-rx * 1.03} ${ry * 0.02} C ${-rx * 1.1} ${-ry * 0.95} ${-rx * 0.45} ${top - 3} ${t * rx * 0.1} ${top - 3} C ${rx * 0.7} ${top - 3} ${rx * 1.1} ${-ry * 0.9} ${rx * 1.02} ${-ry * 0.1} L ${rx * 0.9} ${-ry * 0.2} C ${rx * 0.75} ${-ry * 0.55} ${part + rx * 0.4} ${-ry * 0.62} ${part} ${-ry * 0.74} C ${part - rx * 0.25} ${-ry * 0.58} ${-rx * 0.8} ${-ry * 0.45} ${-rx * 0.92} ${-ry * 0.1} L ${-rx * 0.94} ${ry * 0.02} Z`;
      return (
        <g>
          <path d={d} fill={hair} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <path d={`M ${part + rx * 0.05} ${-ry * 0.8} Q ${rx * 0.4} ${-ry * 0.95} ${rx * 0.8} ${-ry * 0.45}`} stroke={hairShade} strokeWidth={3} fill="none" strokeLinecap="round" />
          {hi}
        </g>
      );
    }
    case "manShort": {
      const s = t * rx * 0.28;
      const d = `M ${-rx * 1.02} ${-ry * 0.02} C ${-rx * 1.08} ${-ry * 0.95} ${-rx * 0.45} ${top - 5} ${t * rx * 0.1} ${top - 5} C ${rx * 0.65} ${top - 5} ${rx * 1.08} ${-ry * 0.95} ${rx * 1.0} ${-ry * 0.2} L ${rx * 0.88} ${-ry * 0.3} C ${rx * 0.8} ${-ry * 0.62} ${rx * 0.45 + s} ${-ry * 0.72} ${s} ${-ry * 0.7} C ${-rx * 0.45 + s} ${-ry * 0.7} ${-rx * 0.82} ${-ry * 0.58} ${-rx * 0.9} ${-ry * 0.25} L ${-rx * 0.93} ${-ry * 0.02} Z`;
      return (
        <g>
          <path d={d} fill={hair} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          {look.greyTemples ? (
            <>
              <path d={`M ${-rx * 0.97} ${-ry * 0.05} Q ${-rx * 0.96} ${-ry * 0.32} ${-rx * 0.86} ${-ry * 0.42}`} stroke="#9AA0AA" strokeWidth={6} fill="none" strokeLinecap="round" />
              {t < 0.35 ? <path d={`M ${rx * 0.95} ${-ry * 0.22} Q ${rx * 0.93} ${-ry * 0.4} ${rx * 0.85} ${-ry * 0.48}`} stroke="#9AA0AA" strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
            </>
          ) : null}
          {hi}
        </g>
      );
    }
    default:
      return null;
  }
};
