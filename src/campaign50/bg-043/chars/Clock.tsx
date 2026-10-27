// Говорящий будильник — главный герой BG-043. Векторный персонаж:
// циферблат-лицо (глаза с веками и бликами, брови, щёки, рот с губами по
// фактической речи), стрелки показывают время, два звонка с молоточком
// (звонят и дрожат), «резиновые» руки в белых перчатках, короткие ножки
// с шагом, сквош-стретч, наклон, шестерёнка сбоку.
//
// Локальные единицы рисунка: радиус циферблата R = 100, начало координат —
// точка на полу между ступнями (y вверх — минус). Компонент рисует
// персонажа в мировых px: x, y — точка опоры, size — радиус циферблата.
// Всё детерминированно по номеру кадра f.
import { CLOSED, type Viseme } from "../context";
import { clamp, lerp } from "../rig/motion";
import { C, CLOCK_COLORS, type ClockKind } from "../palette";

export type ClockExpr = {
  // брови: подъём внутреннего и внешнего края (единицы рисунка, + вверх)
  readonly browIn: number;
  readonly browOut: number;
  // верхнее веко 0 — открыто, 1 — закрыто
  readonly lid: number;
  // уголки рта −1 … 1
  readonly smile: number;
  // нижнее веко (улыбка глазами) 0…1
  readonly squint?: number;
};

export const CEXPR = {
  neutral: { browIn: 0, browOut: 0, lid: 0.06, smile: 0.2 },
  proud: { browIn: -5, browOut: 7, lid: 0.38, smile: 0.55 },
  excited: { browIn: 7, browOut: 9, lid: 0, smile: 0.95 },
  angry: { browIn: -12, browOut: 6, lid: 0.22, smile: -0.5 },
  stubborn: { browIn: -9, browOut: 4, lid: 0.3, smile: -0.15 },
  sheepish: { browIn: 9, browOut: -3, lid: 0.22, smile: 0.2, squint: 0.2 },
  surprised: { browIn: 11, browOut: 11, lid: 0, smile: 0 },
  happy: { browIn: 5, browOut: 5, lid: 0.08, smile: 1, squint: 0.45 },
  worried: { browIn: 11, browOut: -5, lid: 0.08, smile: -0.3 },
  curious: { browIn: 3, browOut: 9, lid: 0, smile: 0.3 },
  soft: { browIn: 5, browOut: 2, lid: 0.18, smile: 0.5, squint: 0.25 },
} as const satisfies Record<string, ClockExpr>;
export type ClockExprId = keyof typeof CEXPR;

export const mixClockExpr = (a: ClockExpr, b: ClockExpr, t: number): ClockExpr => ({
  browIn: lerp(a.browIn, b.browIn, t),
  browOut: lerp(a.browOut, b.browOut, t),
  lid: lerp(a.lid, b.lid, t),
  smile: lerp(a.smile, b.smile, t),
  squint: lerp(a.squint ?? 0, b.squint ?? 0, t),
});

export type ClockHand = "relax" | "open" | "point" | "fist" | "wave" | "thumb";
// Цель кисти — в локальных единицах (R = 100, от точки опоры).
export type ClockArm = { readonly x: number; readonly y: number; readonly shape?: ClockHand } | null;

export type ClockProps = {
  readonly kind: ClockKind;
  readonly f: number;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  // углы стрелок, градусы по часовой от 12
  readonly hourDeg: number;
  readonly minDeg: number;
  readonly expr?: ClockExpr | ClockExprId;
  readonly mouth?: Viseme;
  readonly blink?: number;
  readonly lookX?: number;
  readonly lookY?: number;
  readonly ring?: number;
  readonly tilt?: number;
  readonly squash?: number;
  readonly lift?: number;
  readonly armL?: ClockArm;
  readonly armR?: ClockArm;
  readonly step?: number;
  readonly stepAmt?: number;
  readonly gear?: number;
  readonly gearSpin?: number;
  readonly face?: number;
  readonly opacity?: number;
  readonly shadow?: boolean;
  readonly flip?: boolean;
};

export const timeToDeg = (h: number, m: number) => ({ hourDeg: ((h % 12) + m / 60) * 30, minDeg: m * 6 });

const DC = { x: 0, y: -160 }; // центр циферблата
const R = 100;
const SH = 96; // плечи: x = ±SH, y = −150
const REACH = 150;
const OUT = C.navy;

const REST_L: { x: number; y: number; shape?: ClockHand } = { x: -128, y: -72 };
const REST_R: { x: number; y: number; shape?: ClockHand } = { x: 128, y: -72 };

// Контур шестерёнки: n зубцов, внешний r1, внутренний r0.
export const gearPath = (n: number, r0: number, r1: number) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = (Math.PI * 2) / n;
    const seq = [
      [a - w * 0.5, r0],
      [a - w * 0.22, r0],
      [a - w * 0.14, r1],
      [a + w * 0.14, r1],
      [a + w * 0.22, r0],
    ] as const;
    for (const [ang, r] of seq) pts.push(`${(Math.sin(ang) * r).toFixed(1)} ${(-Math.cos(ang) * r).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
};

const Glove: React.FC<{ x: number; y: number; ang: number; shape: ClockHand }> = ({ x, y, ang, shape }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang})`}>
    {shape === "point" ? (
      <>
        <rect x={6} y={-5} width={26} height={10} rx={5} fill="#FFFFFF" stroke={OUT} strokeWidth={3} />
        <circle cx={0} cy={0} r={13} fill="#FFFFFF" stroke={OUT} strokeWidth={3} />
        <ellipse cx={2} cy={-11} rx={6} ry={4} fill="#FFFFFF" stroke={OUT} strokeWidth={2.5} />
      </>
    ) : shape === "wave" || shape === "open" ? (
      <>
        {[-28, -9, 10, 29].map((a, i) => (
          <rect key={i} x={6} y={-4} width={20} height={8} rx={4} fill="#FFFFFF" stroke={OUT} strokeWidth={2.6} transform={`rotate(${a})`} />
        ))}
        <circle cx={0} cy={0} r={13} fill="#FFFFFF" stroke={OUT} strokeWidth={3} />
        <ellipse cx={-3} cy={-13} rx={7} ry={4.5} fill="#FFFFFF" stroke={OUT} strokeWidth={2.5} transform="rotate(-30 -3 -13)" />
      </>
    ) : shape === "thumb" ? (
      <>
        <circle cx={0} cy={0} r={13} fill="#FFFFFF" stroke={OUT} strokeWidth={3} />
        <rect x={-4} y={-30} width={9} height={20} rx={4.5} fill="#FFFFFF" stroke={OUT} strokeWidth={2.6} transform="rotate(90)" />
      </>
    ) : (
      <>
        <circle cx={0} cy={0} r={shape === "fist" ? 12 : 13} fill="#FFFFFF" stroke={OUT} strokeWidth={3} />
        <path d="M 4 -6 Q 10 0 4 6" fill="none" stroke={OUT} strokeWidth={2} strokeLinecap="round" />
      </>
    )}
  </g>
);

// «Резиновая» рука: квадратичная кривая от плеча к кисти с провисанием.
const Arm: React.FC<{ side: -1 | 1; target: ClockArm; color: string }> = ({ side, target, color }) => {
  const S = { x: side * SH, y: -150 };
  const t = target ?? (side < 0 ? REST_L : REST_R);
  let dx = t.x - S.x;
  let dy = t.y - S.y;
  const d = Math.hypot(dx, dy) || 1;
  if (d > REACH) {
    dx = (dx / d) * REACH;
    dy = (dy / d) * REACH;
  }
  const T = { x: S.x + dx, y: S.y + dy };
  const dist = Math.min(d, REACH);
  // нормаль — вниз/наружу (локоть «висит»)
  let nx = -dy / dist;
  let ny = dx / dist;
  if (ny < 0 || (Math.abs(ny) < 0.2 && nx * side < 0)) {
    nx = -nx;
    ny = -ny;
  }
  const sag = 12 + 0.32 * (REACH - dist);
  const Q = { x: (S.x + T.x) / 2 + nx * sag, y: (S.y + T.y) / 2 + ny * sag };
  const ang = (Math.atan2(T.y - Q.y, T.x - Q.x) * 180) / Math.PI;
  return (
    <>
      <path d={`M ${S.x} ${S.y} Q ${Q.x} ${Q.y} ${T.x} ${T.y}`} fill="none" stroke={OUT} strokeWidth={13} strokeLinecap="round" />
      <path d={`M ${S.x} ${S.y} Q ${Q.x} ${Q.y} ${T.x} ${T.y}`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />
      <Glove x={T.x} y={T.y} ang={ang} shape={t.shape ?? "relax"} />
    </>
  );
};

const Bell: React.FC<{ side: -1 | 1; rot: number; fill: string; shade: string }> = ({ side, rot, fill, shade }) => {
  const bx = side * 66;
  const by = DC.y - 78;
  return (
    <g transform={`translate(${bx} ${by}) rotate(${side * 36 + rot})`}>
      <rect x={-5} y={0} width={10} height={20} fill={shade} stroke={OUT} strokeWidth={3} />
      <path d="M -36 2 Q -36 -42 0 -44 Q 36 -42 36 2 Z" fill={fill} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -24 -6 Q -22 -30 -4 -34" fill="none" stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={5} strokeLinecap="round" />
      <rect x={-40} y={-2} width={80} height={9} rx={4.5} fill={shade} stroke={OUT} strokeWidth={3} />
      <circle cx={0} cy={-46} r={6} fill={shade} stroke={OUT} strokeWidth={3} />
    </g>
  );
};

export const Clock: React.FC<ClockProps> = (p) => {
  const col = CLOCK_COLORS[p.kind];
  const f = p.f;
  const k = p.size / R;
  const ring = clamp(p.ring ?? 0);
  const expr: ClockExpr = typeof p.expr === "string" ? CEXPR[p.expr] : (p.expr ?? CEXPR.neutral);
  const mouth = p.mouth ?? CLOSED;
  const lift = p.lift ?? 0;
  const sq = p.squash ?? 0;
  const stepAmt = clamp(p.stepAmt ?? 0);
  const ph = (p.step ?? 0) * Math.PI * 2;
  // звон: дрожь корпуса, качание звонков, молоточек
  const jx = ring * 3.2 * Math.sin(f * 5.3);
  const jr = ring * 2.2 * Math.sin(f * 4.7 + 1);
  const bellRot = ring * 11 * Math.sin(f * 2.9);
  const hammer = ring * 11 * Math.sin(f * 3.4 + 0.5);
  // ходьба: ступни поочерёдно приподнимаются, корпус слегка подпрыгивает
  const footL = stepAmt * Math.max(0, Math.sin(ph)) * 16;
  const footR = stepAmt * Math.max(0, Math.sin(ph + Math.PI)) * 16;
  const bob = stepAmt * Math.abs(Math.sin(ph)) * 7;
  const breath = Math.sin(f / 21 + (p.kind === "work" ? 0 : 2)) * 0.012;
  const sx = 1 + sq * 0.13 - breath * 0.5;
  const sy = 1 - sq * 0.13 + breath;
  const tilt = (p.tilt ?? 0) + jr;
  const fx = clamp(p.face ?? 0, -1, 1) * 16;
  const lid = clamp(expr.lid + (p.blink ?? 0));
  const squint = clamp(expr.squint ?? 0);
  const lookX = clamp(p.lookX ?? 0, -1, 1) * 6.5;
  const lookY = clamp(p.lookY ?? 0, -1, 1) * 6.5;
  const gearOut = clamp(p.gear ?? 0);
  const gearSide = p.kind === "work" ? -1 : 1;
  const shadowK = 1 / (1 + lift / 160);
  const uid = `${p.kind}-${Math.round(p.x)}-${Math.round(p.y)}`;

  // рот по речи: раскрытие, округление, растяжение; уголки — по улыбке
  const w = 36 * (1 + 0.34 * mouth.wide - 0.42 * mouth.round) * (1 + 0.15 * Math.max(0, expr.smile));
  const open = mouth.open;
  const y0 = -expr.smile * 7;
  const up = -open * 5 + Math.max(0, expr.smile) * 2.5;
  const low = open * 38 + Math.max(0, expr.smile) * 9 + 2 + Math.min(0, expr.smile) * 5;
  const mouthPath = `M ${-w / 2} ${y0} Q 0 ${up} ${w / 2} ${y0} Q 0 ${low} ${-w / 2} ${y0} Z`;

  const eye = (side: -1 | 1) => {
    const ex = side * 33 + fx;
    const ey = -24;
    const inner = -side; // направление к переносице
    const browY = ey - 41;
    return (
      <g key={side}>
        <clipPath id={`eye-${uid}-${side}`}>
          <ellipse cx={ex} cy={ey} rx={20} ry={26} />
        </clipPath>
        <ellipse cx={ex} cy={ey} rx={20} ry={26} fill="#FFFFFF" />
        <g clipPath={`url(#eye-${uid}-${side})`}>
          <circle cx={ex + lookX} cy={ey + 3 + lookY} r={10} fill={OUT} />
          <circle cx={ex + lookX - 3.5} cy={ey - 1 + lookY} r={3.6} fill="#FFFFFF" />
          {/* верхнее веко */}
          <rect x={ex - 22} y={ey - 26} width={44} height={50 * lid + 1} fill={C.cream} />
          <path d={`M ${ex - 20} ${ey - 24 + 48 * lid} Q ${ex} ${ey - 28 + 52 * lid} ${ex + 20} ${ey - 24 + 48 * lid}`} fill="none" stroke={OUT} strokeWidth={lid > 0.04 ? 3 : 0} />
          {/* нижнее веко (улыбка глазами) */}
          <path d={`M ${ex - 22} ${ey + 26} L ${ex - 22} ${ey + 26 - 30 * squint} Q ${ex} ${ey + 14 - 40 * squint} ${ex + 22} ${ey + 26 - 30 * squint} L ${ex + 22} ${ey + 26} Z`} fill={C.cream} />
        </g>
        <ellipse cx={ex} cy={ey} rx={20} ry={26} fill="none" stroke={OUT} strokeWidth={3.4} />
        {/* бровь */}
        <path
          d={`M ${ex + inner * 16} ${browY - expr.browIn * 1.35} Q ${ex} ${browY - 6 - ((expr.browIn + expr.browOut) / 2) * 1.35} ${ex - inner * 18} ${browY - expr.browOut * 1.35}`}
          fill="none"
          stroke={OUT}
          strokeWidth={7.5}
          strokeLinecap="round"
        />
      </g>
    );
  };

  const hand = (deg: number, len: number, width: number, tail: number) => (
    <g transform={`rotate(${deg})`}>
      <rect x={-width / 2} y={-len} width={width} height={len + tail} rx={width / 2} fill={col.hand} />
    </g>
  );

  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: p.opacity ?? 1 }}>
      <g transform={`translate(${p.x + jx} ${p.y}) scale(${(p.flip ? -1 : 1) * k} ${k})`}>
        {p.shadow !== false ? <ellipse cx={0} cy={3} rx={78 * shadowK} ry={11 * shadowK} fill={OUT} opacity={0.13 * shadowK} /> : null}
        <g transform={`translate(0 ${-lift - bob}) rotate(${tilt}) scale(${sx} ${sy})`}>
          {/* шестерёнка сбоку (за корпусом) */}
          {gearOut > 0.01 ? (
            <g transform={`translate(${gearSide * (60 + gearOut * 62)} ${DC.y + 34}) rotate(${p.gearSpin ?? f * 3 * gearSide})`}>
              <path d={gearPath(10, 30, 41)} fill={col.gear} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
              <circle r={12} fill={C.cream} stroke={OUT} strokeWidth={4} />
            </g>
          ) : null}
          {/* ножки */}
          {([-1, 1] as const).map((s) => {
            const fl = s < 0 ? footL : footR;
            return (
              <g key={s}>
                <path d={`M ${s * 36} ${DC.y + 88} L ${s * 40} ${-14 - fl}`} stroke={OUT} strokeWidth={11} strokeLinecap="round" />
                <ellipse cx={s * 44} cy={-10 - fl} rx={27} ry={12} fill={col.foot} />
                <ellipse cx={s * 38} cy={-15 - fl} rx={10} ry={4} fill="#FFFFFF" opacity={0.25} />
              </g>
            );
          })}
          {/* звонки и молоточек (за корпусом) */}
          <g transform={`translate(${hammer} 0)`}>
            <path d={`M 0 ${DC.y - 92} L 0 ${DC.y - 122}`} stroke={OUT} strokeWidth={7} strokeLinecap="round" />
            <circle cx={0} cy={DC.y - 126} r={10} fill={col.bellShade} stroke={OUT} strokeWidth={3.5} />
          </g>
          <Bell side={-1} rot={bellRot} fill={col.bell} shade={col.bellShade} />
          <Bell side={1} rot={-bellRot} fill={col.bell} shade={col.bellShade} />
          {/* школьные часы: карандаш за правым звонком */}
          {p.kind === "school" ? (
            <g transform={`translate(${78} ${DC.y - 128}) rotate(38)`}>
              <rect x={-7} y={-42} width={14} height={66} fill="#F7B6C2" stroke={OUT} strokeWidth={3} />
              <rect x={-7} y={-26} width={14} height={50} fill={C.navy} stroke={OUT} strokeWidth={3} />
              <path d="M -7 24 L 0 40 L 7 24 Z" fill="#F3D6A6" stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
            </g>
          ) : null}
          {/* корпус */}
          <circle cx={DC.x} cy={DC.y} r={R} fill={col.body} stroke={OUT} strokeWidth={5} />
          <path d={`M ${-R + 14} ${DC.y + 20} A ${R - 14} ${R - 14} 0 0 0 ${R - 14} ${DC.y + 20}`} fill="none" stroke={col.bodyShade} strokeWidth={14} strokeLinecap="round" opacity={0.55} />
          <circle cx={DC.x} cy={DC.y} r={82} fill={C.cream} stroke={OUT} strokeWidth={4} />
          <g transform={`translate(${DC.x} ${DC.y})`}>
            {/* деления */}
            {Array.from({ length: 12 }, (_, i) => {
              const big = i % 3 === 0;
              return <rect key={i} x={big ? -3 : -2} y={-77} width={big ? 6 : 4} height={big ? 12 : 8} rx={2} fill={big ? col.hand : C.muted} opacity={big ? 0.85 : 0.55} transform={`rotate(${i * 30})`} />;
            })}
            {/* стрелки — за лицом */}
            {hand(p.hourDeg, 44, 9, 8)}
            {hand(p.minDeg, 62, 6, 10)}
            <circle r={7} fill={col.accent} stroke={OUT} strokeWidth={3} />
            {/* щёки */}
            <circle cx={-54 + fx} cy={14} r={11} fill={C.blush} opacity={0.5} />
            <circle cx={54 + fx} cy={14} r={11} fill={C.blush} opacity={0.5} />
            {eye(-1)}
            {eye(1)}
            {/* рот */}
            <g transform={`translate(${fx * 0.8} 36)`}>
              <clipPath id={`mouth-${uid}`}>
                <path d={mouthPath} />
              </clipPath>
              <path d={mouthPath} fill="#6B2433" />
              <g clipPath={`url(#mouth-${uid})`}>
                <ellipse cx={0} cy={low * 0.62 + 6} rx={w * 0.32} ry={10} fill="#E77B83" />
                <rect x={-w / 2} y={y0 - 12 + up * 0.5} width={w} height={8 + open * 3} fill="#FFFFFF" opacity={open > 0.25 ? 0.9 : 0} />
              </g>
              <path d={mouthPath} fill="none" stroke={OUT} strokeWidth={3.6} strokeLinejoin="round" />
            </g>
            {/* блик стекла */}
            <path d="M -60 -34 A 66 66 0 0 1 -30 -62" fill="none" stroke="#FFFFFF" strokeOpacity={0.75} strokeWidth={7} strokeLinecap="round" />
          </g>
          {/* деловые часы: галстук под циферблатом */}
          {p.kind === "work" ? (
            <g transform={`translate(0 ${DC.y + 94})`}>
              <path d="M -10 -4 L 10 -4 L 7 8 L -7 8 Z" fill={C.yellow} stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
              <path d="M -7 8 L 7 8 L 12 44 L 0 56 L -12 44 Z" fill={C.yellow} stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
              <path d="M -9 24 L 10 18 M -11 38 L 12 31" stroke={col.body} strokeWidth={3} />
            </g>
          ) : null}
          {/* звон: дуги у звонков */}
          {ring > 0.25
            ? ([-1, 1] as const).map((s) => (
                <g key={`rl${s}`} opacity={clamp((ring - 0.25) * 2)} stroke={OUT} strokeWidth={5} strokeLinecap="round" fill="none">
                  <path d={`M ${s * 118} ${DC.y - 140} q ${s * 16} 18 0 36`} transform={`translate(${s * (Math.sin(f * 1.7) * 3)} 0)`} />
                  <path d={`M ${s * 136} ${DC.y - 152} q ${s * 22} 28 0 58`} transform={`translate(${s * (Math.sin(f * 1.7 + 1) * 3)} 0)`} />
                </g>
              ))
            : null}
          {/* руки — перед корпусом */}
          <Arm side={-1} target={p.armL ?? null} color={col.body} />
          <Arm side={1} target={p.armR ?? null} color={col.body} />
        </g>
      </g>
    </svg>
  );
};
