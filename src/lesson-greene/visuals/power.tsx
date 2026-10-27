// Часть «Игра власти» и памятки: двор, Янус, король-солнце, Галилей, астролог,
// шкала «такт — угодничество», осторожные типы, три вопроса, пять признаков.
// Все появления привязаны к репликам через at(c, n); абсолютных секунд нет.
import React from "react";
import { C, FONT, SERIF } from "../theme";
import { Bubble, OL } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";
import { Coin, CoinStack, Crown, Figure, Mask, Ribbon, Scroll, Throne, type Mood, type Role } from "./court";

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rnd = (i: number, k = 0) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

// ───────────── общие мелочи ─────────────

// текст с мягким ореолом (читается на любом фоне)
const T: React.FC<{
  x: number;
  y: number;
  children: string;
  size?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  weight?: number;
  serif?: boolean;
  halo?: string;
  opacity?: number;
}> = ({ x, y, children, size = 36, color = C.ink, anchor = "middle", weight = 800, serif, halo, opacity = 1 }) => (
  <text
    x={x}
    y={y}
    fontFamily={serif ? SERIF : FONT}
    fontWeight={weight}
    fontSize={size}
    fill={color}
    textAnchor={anchor}
    opacity={opacity}
    stroke={halo}
    strokeWidth={halo ? size * 0.2 : 0}
    strokeLinejoin="round"
    paintOrder="stroke"
  >
    {children.split("\n").map((l, i) => (
      <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.18}>
        {l}
      </tspan>
    ))}
  </text>
);

const Stars: React.FC<{ t: number; x: number; y: number; w: number; h: number; n?: number; seed?: number }> = ({ t, x, y, w, h, n = 40, seed = 1 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const sx = x + rnd(i, seed) * w;
      const sy = y + rnd(i, seed + 3) * h;
      const r = 2 + rnd(i, seed + 7) * 3.5;
      const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * (1.2 + rnd(i, seed + 9) * 1.8) + i));
      return <circle key={i} cx={sx} cy={sy} r={r} fill="#fff8d8" opacity={tw} />;
    })}
  </g>
);

const Cloud: React.FC<{ x: number; y: number; s?: number; fill?: string; opacity?: number }> = ({ x, y, s = 1, fill = "#fff", opacity = 1 }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M -86 24 Q -100 -8 -66 -14 Q -58 -52 -16 -44 Q 6 -72 44 -48 Q 84 -52 84 -12 Q 108 2 86 24 Z"
    fill={fill}
    opacity={opacity}
    stroke={OL}
    strokeWidth={4}
    strokeOpacity={0.25}
  />
);

const StarShape: React.FC<{ x: number; y: number; r: number; fill?: string; rot?: number; points?: number; inner?: number; stroke?: string }> = ({
  x,
  y,
  r,
  fill = C.gold,
  rot = 0,
  points = 5,
  inner = 0.45,
  stroke = OL,
}) => {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * inner : r;
    pts.push(`${Math.cos(a) * rr},${Math.sin(a) * rr}`);
  }
  return <polygon transform={`translate(${x} ${y}) rotate(${rot})`} points={pts.join(" ")} fill={fill} stroke={stroke} strokeWidth={4} strokeLinejoin="round" />;
};

// центр головы фигуры с учётом поклона (для масок и предметов у лица)
const headPos = (x: number, y: number, s: number, bow: number, t: number, flip = false) => {
  const th = (bow * 28 * Math.PI) / 180;
  const bob = Math.sin(t * 2.6 + x * 0.01) * 2;
  return [x + 158 * Math.sin(th) * (flip ? -1 : 1) * s, y + bob + (-70 - 158 * Math.cos(th)) * s, bow * 28 * (flip ? -1 : 1)] as const;
};

// ═════════════════════ g05 · двор ═════════════════════

const IronFist: React.FC<{ fill: string; cuff?: boolean }> = ({ fill, cuff }) => (
  <g>
    <rect x={-36} y={10} width={72} height={cuff ? 72 : 130} rx={14} fill={fill} stroke={OL} strokeWidth={5} />
    <rect x={-56} y={-64} width={112} height={92} rx={26} fill={fill} stroke={OL} strokeWidth={5} />
    {[-39, -13, 13, 39].map((d) => (
      <rect key={d} x={d - 13} y={-80} width={26} height={34} rx={12} fill={fill} stroke={OL} strokeWidth={4} />
    ))}
    <path d="M -56 -20 Q -78 -10 -60 18" fill={fill} stroke={OL} strokeWidth={5} />
    {cuff ? (
      <rect x={-42} y={56} width={84} height={26} rx={8} fill={C.gold} stroke={OL} strokeWidth={4} />
    ) : (
      [-30, 0, 30].map((d) => <circle key={d} cx={d} cy={-4} r={5} fill="#6e7a8c" />)
    )}
  </g>
);

const CityTower: React.FC<{ x: number; w: number; top: number; base: number; color: string; t: number; seed: number; throne?: boolean }> = ({ x, w, top, base, color, t, seed, throne }) => {
  const cols = Math.max(2, Math.floor((w - 20) / 40));
  const rows = Math.max(2, Math.floor((base - top - 40) / 54));
  return (
    <g>
      <rect x={x} y={top} width={w} height={base - top} fill={color} stroke={OL} strokeWidth={4} />
      {Array.from({ length: rows * cols }).map((_, i) => {
        const r = Math.floor(i / cols);
        const cc = i % cols;
        const lit = rnd(i, seed) > 0.35 ? 0.75 + 0.25 * Math.sin(t * 1.5 + i) : 0.15;
        return <rect key={i} x={x + 14 + cc * ((w - 28) / cols) + 4} y={top + 24 + r * 54} width={(w - 28) / cols - 8} height={30} rx={4} fill={C.goldLight} opacity={lit} />;
      })}
      {throne && <Throne x={x + w / 2} y={top} s={0.2} glow={0.6 + 0.4 * Math.sin(t * 2 + seed)} />}
    </g>
  );
};

export const Court: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kIn = ramp(t, 0, 0.6);
  const kZoom = ramp(t, at(c, 2.02), 1.8);
  const sc = lerp(1, 0.44, kZoom);
  const cy = lerp(475, 470, kZoom);
  const kMask = ramp(t, at(c, 1.42), 0.8);
  const kGlove = ramp(t, at(c, 1.8), 1.2);
  const kRoomLabels = 1 - kZoom;
  const kingGlow = 0.5 * ramp(t, at(c, 0.9), 1) + 0.15 * Math.sin(t * 1.6);
  const courtiers: { x: number; role: Role; flip?: boolean; body?: string; ph: number }[] = [
    { x: 300, role: "courtier", ph: 0 },
    { x: 465, role: "lady", ph: 1.3 },
    { x: 935, role: "minister", flip: true, ph: 2.1 },
    { x: 1100, role: "courtier", flip: true, body: "#5a8fd6", ph: 0.7 },
  ];
  const Y0 = 775;
  const S0 = 0.85;
  return (
    <g>
      {/* мир-двор (за залом) */}
      {kZoom > 0 && (
        <g opacity={kZoom}>
          <defs>
            <linearGradient id="pw-court-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#cfe8ff" />
              <stop offset="1" stopColor="#fff1dc" />
            </linearGradient>
          </defs>
          <rect x={80} y={110} width={1240} height={730} rx={36} fill="url(#pw-court-sky)" />
          <Cloud x={260 + ((t * 8) % 200)} y={190} s={0.8} />
          <Cloud x={1120 - ((t * 6) % 160)} y={240} s={0.6} />
          <CityTower x={100} w={150} top={350} base={700} color="#b9a6e8" t={t} seed={1} throne />
          <CityTower x={262} w={118} top={440} base={700} color="#f2c9a0" t={t} seed={2} />
          <CityTower x={1030} w={130} top={410} base={700} color="#9fd0c0" t={t} seed={3} throne />
          <CityTower x={1172} w={136} top={320} base={700} color="#c9b6f2" t={t} seed={4} throne />
          {/* фасад дворца вокруг зала */}
          <path d="M 380 700 L 380 300 L 700 220 L 1020 300 L 1020 700 Z" fill="#f6e2b8" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <rect x={80} y={700} width={1240} height={140} fill="#cdbb9c" />
          <path d="M 80 700 L 1320 700" stroke={OL} strokeWidth={4} opacity={0.4} />
          {[0, 1, 2].map((i) => {
            const px = 120 + (((t * 40 + i * 420) % 1100) as number);
            return <Figure key={i} x={px} y={800} s={0.36} t={t} role={(["modern", "merchant", "lady"] as Role[])[i]} walk={1} mood="happy" />;
          })}
          <Ribbon x={700} y={180} text="весь мир — двор" size={42} color={C.purple} k={pop(t, at(c, 2.12))} />
          <Pop t={t} at={at(c, 2.72)} x={0} y={0}>
            <Bubble x={980} y={548} w={300} h={86} tail={[1130, 650]} />
            <T x={1130} y={604} size={34}>
              Я не играю!
            </T>
          </Pop>
          {t > at(c, 2.68) && <Figure x={1150} y={815} s={0.55} t={t} role="modern" mood="proud" arms={[35, 35]} look={-0.5} />}
          <Pop t={t} at={at(c, 2.9)} x={1252} y={826}>
            <circle cy={-50} r={50} fill={C.goldLight} opacity={0.5 + 0.2 * Math.sin(t * 3)} />
            <g transform="scale(0.5)">
              <path d="M -20 -50 Q -12 -80 -10 -96 L 10 -96 Q 12 -80 20 -50 Z" fill="#fbf4e2" stroke={OL} strokeWidth={8} />
              <circle cy={-116} r={26} fill="#fbf4e2" stroke={OL} strokeWidth={8} />
              <path d="M -38 -20 Q -30 -40 -36 -50 L 36 -50 Q 30 -40 38 -20 Z" fill="#fbf4e2" stroke={OL} strokeWidth={8} />
              <rect x={-50} y={-20} width={100} height={20} rx={6} fill="#fbf4e2" stroke={OL} strokeWidth={8} />
            </g>
          </Pop>
        </g>
      )}

      {/* тронный зал */}
      <g transform={`translate(700 ${cy}) scale(${sc}) translate(-700 -475)`} opacity={kIn}>
        <defs>
          <clipPath id="pw-court-room">
            <rect x={80} y={110} width={1240} height={730} rx={36} />
          </clipPath>
          <linearGradient id="pw-court-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbeedc" />
            <stop offset="1" stopColor="#f3dcc0" />
          </linearGradient>
        </defs>
        <g clipPath="url(#pw-court-room)">
          <rect x={80} y={110} width={1240} height={730} fill="url(#pw-court-wall)" />
          {/* окна-арки */}
          {[420, 980].map((wx) => (
            <g key={wx}>
              <path d={`M ${wx - 60} 420 L ${wx - 60} 230 Q ${wx} 160 ${wx + 60} 230 L ${wx + 60} 420 Z`} fill="#cfe8ff" stroke={OL} strokeWidth={5} />
              <path d={`M ${wx} 175 L ${wx} 420 M ${wx - 60} 300 L ${wx + 60} 300`} stroke={OL} strokeWidth={4} />
              <circle cx={wx - 26} cy={250} r={14} fill="#fff" opacity={0.6} />
            </g>
          ))}
          {/* колонны */}
          {[200, 1200].map((cx) => (
            <g key={cx}>
              <rect x={cx - 34} y={150} width={68} height={560} fill="#fff6e6" stroke={OL} strokeWidth={5} />
              <rect x={cx - 48} y={130} width={96} height={30} rx={6} fill={C.goldLight} stroke={OL} strokeWidth={4} />
              {[-14, 0, 14].map((d) => (
                <path key={d} d={`M ${cx + d} 170 L ${cx + d} 700`} stroke={C.stoneDeep} strokeWidth={3} opacity={0.5} />
              ))}
            </g>
          ))}
          {/* занавесы */}
          {[-1, 1].map((d) => (
            <path
              key={d}
              d={d < 0 ? `M 80 110 L 260 110 Q 200 300 ${150 + wob(t, 1, 4)} 560 L 80 560 Z` : `M 1320 110 L 1140 110 Q 1200 300 ${1250 + wob(t, 2, 4)} 560 L 1320 560 Z`}
              fill={C.velvet}
              stroke={OL}
              strokeWidth={5}
            />
          ))}
          {/* пол и ковёр */}
          <rect x={80} y={700} width={1240} height={140} fill="#d9b98a" />
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d={`M ${80 + i * 110} 700 L ${40 + i * 120} 840`} stroke="#c49e6c" strokeWidth={4} />
          ))}
          <path d="M 640 700 L 760 700 L 860 840 L 540 840 Z" fill={C.velvet} stroke={OL} strokeWidth={4} />
          <path d="M 652 700 L 748 700 L 836 840 L 564 840 Z" fill="none" stroke={C.gold} strokeWidth={4} />
          <path d="M 80 700 L 1320 700" stroke={OL} strokeWidth={4} opacity={0.5} />
          {/* трон и король */}
          <Pop t={t} at={at(c, 0.02)} x={0} y={0}>
            <Throne x={700} y={705} s={0.88} glow={kingGlow} />
            <Figure x={700} y={712} s={0.95} t={t} role="king" mood="proud" arms={[18, 18]} />
          </Pop>
          {/* придворные */}
          {courtiers.map((q, i) => {
            const a = at(c, 0.28 + i * 0.07);
            if (t < a) return null;
            const k = pop(t, a);
            const bow = (0.3 + 0.22 * (0.5 + 0.5 * Math.sin(t * 1.4 + q.ph))) * clamp01(k);
            const [hx, hy, rot] = headPos(q.x, Y0, S0, bow, t, q.flip);
            return (
              <g key={i} opacity={clamp01(k * 1.5)}>
                <Figure x={q.x} y={Y0} s={S0} t={t} role={q.role} body={q.body} flip={q.flip} bow={bow} mood={kMask > 0.5 ? "sly" : "happy"} arms={[14, 28]} look={q.flip ? 0.6 : -0.6} />
                {kMask > 0 && (
                  <g opacity={kMask}>
                    <Mask x={hx + (q.flip ? 10 : -10)} y={hy + 2 + (1 - kMask) * 30} s={0.44} rot={rot} />
                  </g>
                )}
              </g>
            );
          })}
          {/* учтивая война */}
          <g opacity={kRoomLabels}>
            <Ribbon x={700} y={168} text="учтивая война" size={40} k={pop(t, at(c, 1.66))} />
            {kGlove > 0 && (
              <g opacity={clamp01(kGlove * 3)}>
                <circle cx={1060} cy={300} r={124} fill="#fff8ea" stroke={C.gold} strokeWidth={10} />
                <circle cx={1060} cy={300} r={124} fill="none" stroke={OL} strokeWidth={4} />
                <clipPath id="pw-court-glove">
                  <circle cx={1060} cy={300} r={118} />
                </clipPath>
                <g clipPath="url(#pw-court-glove)">
                  <g transform={`translate(1060 ${318 + wob(t, 3, 3)}) scale(0.9)`}>
                    <IronFist fill="#aab5c6" />
                    <g transform={`translate(0 ${lerp(-260, 0, kGlove)}) scale(1.07)`}>
                      <IronFist fill={C.velvet} cuff />
                      <path d="M -40 -50 Q -20 -60 0 -54" stroke="#fff" strokeWidth={6} opacity={0.4} fill="none" strokeLinecap="round" />
                    </g>
                  </g>
                </g>
                <T x={1060} y={474} size={32} halo="#fbeedc">
                  бархат на железе
                </T>
              </g>
            )}
          </g>
        </g>
        <rect x={80} y={110} width={1240} height={730} rx={36} fill="none" stroke={OL} strokeWidth={6} opacity={0.8} />
      </g>
    </g>
  );
};

// ═════════════════════ g06 · навыки игрока ═════════════════════

const Badge: React.FC<{ x: number; y: number; n: string; color?: string }> = ({ x, y, n, color = C.purple }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={30} fill={color} stroke={OL} strokeWidth={4} />
    <T x={0} y={12} size={34} color="#fff" weight={900}>
      {n}
    </T>
  </g>
);

const JanusHead: React.FC<{ t: number; kF: number; kB: number }> = ({ t, kF, kB }) => {
  const prof = "M 0 -112 Q 58 -114 72 -74 L 74 -44 L 104 -8 L 80 2 L 84 16 L 76 24 L 82 36 L 70 46 Q 76 74 50 98 Q 22 112 0 112 Z";
  const face = (d: 1 | -1, fill: string, k: number) => (
    <g transform={`scale(${d} 1)`}>
      <path d={prof} fill={fill} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 70 46 Q 76 74 50 98 Q 22 112 0 112 L 0 60 Q 40 66 70 46 Z" fill="#d8ccb4" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 40 -44 Q 54 -54 66 -44 Q 54 -36 40 -44 Z" fill={OL} />
      <circle cx={58 + k * 4} cy={-45} r={3} fill="#fff" />
      <path d="M 34 -60 Q 52 -70 70 -60" stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M 66 24 L 80 22" stroke={OL} strokeWidth={4} strokeLinecap="round" />
      <path d="M 10 -20 Q 24 -6 14 8" stroke={OL} strokeWidth={4} fill="none" opacity={0.35} />
    </g>
  );
  return (
    <g transform={`rotate(${Math.sin(t * 0.9) * 2})`}>
      <path d="M -80 96 Q -120 116 -130 160 L 130 160 Q 120 116 80 96 Z" fill="#cfc3ab" stroke={OL} strokeWidth={5} />
      {kF > 0 && <path d={`M 108 -8 L ${108 + 90 * kF} -44 L ${108 + 90 * kF} 28 Z`} fill={C.goldLight} opacity={0.7 * kF} />}
      {kB > 0 && <path d={`M -108 -8 L ${-108 - 90 * kB} -44 L ${-108 - 90 * kB} 28 Z`} fill={C.sky} opacity={0.45 * kB} />}
      {face(-1, "#e6e9f0", -kB)}
      {face(1, "#f3e6c9", kF)}
      <path d="M 0 -110 L 0 60" stroke={OL} strokeWidth={3} opacity={0.4} />
      {Array.from({ length: 9 }).map((_, i) => {
        const a = Math.PI + 0.15 + (i / 8) * (Math.PI - 0.3);
        const lx = Math.cos(a) * 74;
        const ly = -70 + Math.sin(a) * 50;
        return <ellipse key={i} cx={lx} cy={ly} rx={17} ry={8} fill={i % 2 ? C.green : C.greenDeep} stroke={OL} strokeWidth={3} transform={`rotate(${(a * 180) / Math.PI + 90} ${lx} ${ly})`} />;
      })}
    </g>
  );
};

export const Janus: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = [795, 1215, 1635];
  const calm = ramp(t, at(c, 0.73), 1.2);
  const anger = ramp(t, at(c, 0.48), 0.5) * (1 - calm);
  const dome = ramp(t, at(c, 0.38), 0.8);
  const kF = ramp(t, at(c, 1.22), 0.6);
  const kB = ramp(t, at(c, 1.41), 0.6);
  const grow = ramp(t, at(c, 1.78), 3.5);
  const stamp = pop(t, at(c, 2.08));
  const flick = Math.sin(t * 9) * 0.5 + Math.sin(t * 13.7) * 0.5;
  const fl = 1 + anger * 0.9 + flick * (0.06 + anger * 0.12);
  return (
    <g>
      {/* 1 — владеть эмоциями */}
      <Pop t={t} at={at(c, 0.05)} x={0} y={0} from={0.6}>
        <g transform={`translate(0 ${wob(t, 0, 3)})`}>
          <Panel x={600} y={150} w={390} h={480} />
          <Badge x={cx[0]} y={152} n="1" />
          <T x={cx[0]} y={226} size={34}>
            владеть эмоциями
          </T>
          <ellipse cx={cx[0]} cy={540} rx={130} ry={20} fill="#d8cbb0" stroke={OL} strokeWidth={4} />
          {/* пламя-сердце */}
          <g transform={`translate(${cx[0]} 520)`}>
            <circle cy={-70} r={60 + anger * 40} fill={anger > 0.2 ? C.coral : C.goldLight} opacity={0.35} />
            <g transform={`scale(${(1 - 0.25 * calm) * (0.9 + 0.1 * fl)} ${fl * (1 - 0.25 * calm)})`}>
              <path d="M 0 0 Q -56 -6 -50 -60 Q -44 -100 -10 -140 Q -6 -100 14 -96 Q 30 -120 26 -150 Q 60 -110 54 -56 Q 54 -4 0 0 Z" fill={anger > 0.3 ? C.red : C.gold} stroke={OL} strokeWidth={4} />
              <path d="M 0 -8 Q -26 -12 -22 -44 Q -18 -70 0 -86 Q 6 -64 18 -62 Q 30 -40 22 -22 Q 16 -8 0 -8 Z" fill={anger > 0.3 ? C.yellow : "#fff3c0"} />
            </g>
            {anger > 0.05 &&
              [0, 1, 2, 3].map((i) => {
                const p = (t * 1.6 + i * 0.25) % 1;
                return <circle key={i} cx={Math.sin(i * 2.3) * 60 * p} cy={-60 - p * 120} r={6} fill={C.red} opacity={anger * (1 - p)} />;
              })}
          </g>
          {/* стеклянный колпак */}
          {dome > 0 && (
            <g transform={`translate(${cx[0]} ${540 - (1 - dome) * 200})`} opacity={dome}>
              <path d="M -120 0 L -120 -120 Q -120 -250 0 -255 Q 120 -250 120 -120 L 120 0 Z" fill="#dff1ff" opacity={0.45} stroke="#7fb3d6" strokeWidth={6} />
              <circle cy={-268} r={16} fill="#bfe1f7" stroke="#7fb3d6" strokeWidth={5} />
              <path d="M -86 -150 Q -84 -210 -40 -228" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />
            </g>
          )}
          <Pop t={t} at={at(c, 0.86)} x={cx[0]} y={598}>
            <T x={0} y={0} size={32} color={C.greenDeep}>
              видит ходы
            </T>
          </Pop>
        </g>
      </Pop>

      {/* 2 — лицо Януса */}
      <Pop t={t} at={at(c, 1.02)} x={0} y={0} from={0.6}>
        <g transform={`translate(0 ${wob(t, 1.5, 3)})`}>
          <Panel x={1020} y={150} w={390} h={480} />
          <Badge x={cx[1]} y={152} n="2" />
          <T x={cx[1]} y={226} size={34}>
            лицо Януса
          </T>
          <g transform={`translate(${cx[1]} 392) scale(0.92)`}>
            <JanusHead t={t} kF={kF} kB={kB} />
          </g>
          {kF > 0 && (
            <T x={cx[1] + 128} y={478} size={30} opacity={kF} color={C.goldDeep} halo="#fff">
              вперёд
            </T>
          )}
          {kB > 0 && (
            <T x={cx[1] - 128} y={478} size={30} opacity={kB} color={C.skyDeep} halo="#fff">
              назад
            </T>
          )}
          <Pop t={t} at={at(c, 1.62)} x={cx[1]} y={600}>
            <T x={0} y={0} size={30}>
              не попадаться дважды
            </T>
          </Pop>
        </g>
      </Pop>

      {/* 3 — терпение */}
      <Pop t={t} at={at(c, 1.7)} x={0} y={0} from={0.6}>
        <g transform={`translate(0 ${wob(t, 3, 3)})`}>
          <Panel x={1440} y={150} w={390} h={480} />
          <Badge x={cx[2]} y={152} n="3" />
          <T x={cx[2]} y={226} size={34}>
            терпение
          </T>
          <g transform={`translate(${cx[2] + 110} ${300 - 10 * Math.sin(t * 0.5)})`}>
            <circle r={38} fill={C.yellow} stroke={C.yellowDeep} strokeWidth={5} />
            <g transform={`rotate(${t * 12})`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <path key={i} d="M -6 -48 L 0 -62 L 6 -48 Z" fill={C.yellowDeep} transform={`rotate(${i * 45})`} />
              ))}
            </g>
          </g>
          <path d={`M ${cx[2] - 160} 540 Q ${cx[2]} 520 ${cx[2] + 160} 540 L ${cx[2] + 160} 560 L ${cx[2] - 160} 560 Z`} fill="#a77b4a" stroke={OL} strokeWidth={4} />
          {Array.from({ length: 13 }).map((_, i) => {
            const gx = cx[2] - 144 + i * 24;
            const hgt = 16 + (50 + rnd(i, 4) * 50) * grow;
            const sway = Math.sin(t * 1.8 + i) * 6 * grow;
            return <path key={i} d={`M ${gx - 11} 536 Q ${gx - 8 + sway * 0.5} ${536 - hgt * 0.7} ${gx + sway} ${536 - hgt} Q ${gx + 8 + sway * 0.5} ${536 - hgt * 0.7} ${gx + 11} 536 Z`} fill={i % 2 ? "#5fcf8f" : C.green} stroke={OL} strokeWidth={3} strokeLinejoin="round" />;
          })}
          {grow > 0.85 &&
            [0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${cx[2] - 90 + i * 90} ${450 + rnd(i, 8) * 20}) scale(${ramp(t, at(c, 1.78) + 3 + i * 0.3, 0.6)})`}>
                {[0, 1, 2, 3, 4].map((k) => (
                  <circle key={k} cx={Math.cos((k / 5) * Math.PI * 2) * 9} cy={Math.sin((k / 5) * Math.PI * 2) * 9} r={7} fill={["#fff", C.coral, C.violet][i]} stroke={OL} strokeWidth={2} />
                ))}
                <circle r={6} fill={C.yellow} stroke={OL} strokeWidth={2} />
              </g>
            ))}
          <Pop t={t} at={at(c, 1.86)} x={cx[2]} y={600}>
            <T x={0} y={0} size={30}>
              трава вырастет снова
            </T>
          </Pop>
        </g>
      </Pop>

      {/* печать */}
      {stamp > 0.001 && (
        <g transform={`translate(1220 738) rotate(-4) scale(${lerp(1.7, 1, clamp01(stamp))})`} opacity={clamp01(stamp * 1.6)}>
          <rect x={-330} y={-74} width={660} height={148} rx={18} fill="#fff4f2" opacity={0.92} />
          <rect x={-330} y={-74} width={660} height={148} rx={18} fill="none" stroke={C.red} strokeWidth={8} />
          <rect x={-316} y={-60} width={632} height={120} rx={12} fill="none" stroke={C.red} strokeWidth={3} />
          <T x={0} y={-8} size={46} color={C.red} weight={900}>
            СПОРНЫЙ ТЕЗИС
          </T>
          <T x={0} y={44} size={36} color={C.red}>
            «власть аморальна»
          </T>
          <Pop t={t} at={at(c, 2.75)} x={300} y={-66}>
            <circle r={18} fill={C.red} stroke={OL} strokeWidth={4} />
            <path d="M 0 18 L 0 40" stroke={OL} strokeWidth={5} strokeLinecap="round" />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ═════════════════════ g07 · одно солнце ═════════════════════

const KingSun: React.FC<{ x: number; y: number; r: number; t: number; frown: number; dim: number }> = ({ x, y, r, t, frown, dim }) => {
  const mouth = lerp(r * 0.16, -r * 0.1, frown);
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 1.7} fill={C.goldLight} opacity={0.45 * (1 - dim * 0.7) + 0.08 * Math.sin(t * 2)} />
      <g transform={`rotate(${t * 6})`}>
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M ${-r * 0.14} ${-r * 1.1} L 0 ${-r * (1.48 - dim * 0.18)} L ${r * 0.14} ${-r * 1.1} Z`} fill={C.yellowDeep} stroke={OL} strokeWidth={3} transform={`rotate(${i * (360 / 14)})`} />
        ))}
      </g>
      <circle r={r} fill={C.yellow} stroke={OL} strokeWidth={5} />
      <circle r={r} fill="#b9a98a" opacity={dim * 0.45} />
      <circle cx={-r * 0.35} cy={-r * 0.4} r={r * 0.2} fill="#fff" opacity={0.4} />
      {/* лицо */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <ellipse cx={d * r * 0.32} cy={-r * 0.08} rx={r * 0.07} ry={r * 0.1} fill={OL} />
          <path d={`M ${d * r * 0.46} ${-r * (0.3 + frown * 0.02)} L ${d * r * 0.18} ${-r * (0.3 - frown * 0.12)}`} stroke={OL} strokeWidth={6} strokeLinecap="round" />
          <circle cx={d * r * 0.55} cy={r * 0.16} r={r * 0.1} fill="#ff8a6b" opacity={0.45 * (1 - frown)} />
        </g>
      ))}
      <path d={`M ${-r * 0.3} ${r * 0.34} Q 0 ${r * 0.34 + mouth} ${r * 0.3} ${r * 0.34}`} stroke={OL} strokeWidth={7} fill="none" strokeLinecap="round" />
      <Crown x={0} y={-r * 1.02} s={r / 120} />
    </g>
  );
};

const Versailles: React.FC<{ x: number; y: number; k: number; t: number }> = ({ x, y, k, t }) => {
  if (k <= 0) return null;
  const win = (wx: number, wy: number, i: number) => <rect key={`${wx}-${wy}`} x={wx - 9} y={wy} width={18} height={30} rx={9} fill={C.goldLight} opacity={0.7 + 0.3 * Math.sin(t * 2 + i)} />;
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${k})`}>
      <path d="M -340 0 L -340 -120 L -250 -120 L -250 -160 L -130 -160 L -130 -190 L -60 -190 Q -60 -260 0 -270 Q 60 -260 60 -190 L 130 -190 L 130 -160 L 250 -160 L 250 -120 L 340 -120 L 340 0 Z" fill="#8a72d8" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 0 -270 L 0 -300" stroke={OL} strokeWidth={5} />
      <circle cy={-306} r={9} fill={C.gold} stroke={OL} strokeWidth={3} />
      {[-310, -280].map((wx, i) => win(wx, -90, i))}
      {[280, 310].map((wx, i) => win(wx, -90, i + 2))}
      {[-220, -180, -100, 100, 180, 220].map((wx, i) => win(wx, -130, i + 4))}
      {[-220, -180, -100, 100, 180, 220].map((wx, i) => win(wx, -70, i + 10))}
      {[-30, 0, 30].map((wx, i) => win(wx, -160, i + 16))}
      <path d="M -36 0 L -36 -60 Q 0 -86 36 -60 L 36 0 Z" fill={C.goldDeep} stroke={OL} strokeWidth={4} />
    </g>
  );
};

export const SunKing: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const starIn = pop(t, at(c, 0.6));
  const grow = ramp(t, at(c, 1.1), (c.ends[1] - c.beats[1]) * 0.55);
  const starOut = ramp(t, at(c, 2.25), 1.2);
  const frown = clamp01(grow * 1.4 - 0.3) * (1 - starOut);
  const dim = grow * 0.9 * (1 - starOut);
  const palace = ramp(t, at(c, 2.2), 2.2);
  const guests = ramp(t, at(c, 1.02), 0.8) * (1 - ramp(t, at(c, 2.05), 0.8));
  const sx = 1040;
  const sy = 330;
  const sS = lerp(0.35, 1.25, grow) * (1 - starOut) * clamp01(starIn);
  const sunS = lerp(1, 0.86, dim) + starOut * 0.08;
  const loyal = ramp(t, at(c, 1.8), 0.5);
  const flipK = ramp(t, at(c, 1.92), 0.5);
  return (
    <g>
      <defs>
        <linearGradient id="pw-sun-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe2ff" />
          <stop offset="0.75" stopColor="#ffe9cc" />
          <stop offset="1" stopColor="#ffd9b0" />
        </linearGradient>
        <clipPath id="pw-sun-clip">
          <rect x={80} y={110} width={1240} height={730} rx={36} />
        </clipPath>
      </defs>
      <g clipPath="url(#pw-sun-clip)" opacity={ramp(t, 0, 0.6)}>
        <rect x={80} y={110} width={1240} height={730} fill="url(#pw-sun-sky)" />
        <Cloud x={160 + ((t * 10) % 300)} y={700} s={0.9} opacity={0.9} />
        <Cloud x={1250 - ((t * 7) % 260)} y={180} s={0.7} opacity={0.9} />
        <Cloud x={760 + Math.sin(t * 0.3) * 40} y={640} s={0.6} opacity={0.8} />
        <Versailles x={940} y={790} k={palace} t={t} />
        <path d="M 80 790 Q 700 770 1320 790 L 1320 840 L 80 840 Z" fill="#b9d98a" stroke={OL} strokeWidth={4} />
        {/* король-солнце */}
        <KingSun x={440} y={430} r={140 * sunS} t={t} frown={frown} dim={dim} />
        <g opacity={clamp01(ramp(t, at(c, 0.1), 0.6))}>
          <Tag x={440} y={680} text="король" color={C.goldLight} size={34} />
        </g>
        {/* звезда «Фуке» */}
        {sS > 0.01 && (
          <g transform={`translate(${sx} ${sy})`}>
            <circle r={150 * sS} fill="#fffbe0" opacity={0.55 + 0.15 * Math.sin(t * 4)} />
            <circle r={230 * sS * grow} fill="#fff7c0" opacity={0.35 * grow} />
            {Array.from({ length: 8 }).map((_, i) => (
              <path key={i} d={`M -8 0 L 0 ${-190 * sS * (0.8 + 0.2 * Math.sin(t * 3 + i))} L 8 0 Z`} fill="#fff3b0" opacity={0.8} transform={`rotate(${i * 45 + t * 8})`} />
            ))}
            <StarShape x={0} y={0} r={96 * sS} points={4} inner={0.38} fill="#fff6c8" rot={Math.sin(t * 1.3) * 6} />
            <StarShape x={0} y={0} r={50 * sS} points={4} inner={0.4} fill={C.gold} rot={45} stroke="none" />
          </g>
        )}
        {starIn > 0.01 && starOut < 1 && (
          <g opacity={(1 - starOut) * clamp01(starIn)}>
            <Tag x={sx} y={sy + 80 + 110 * Math.max(sS, 0.35)} text="Фуке" color="#fff" size={34} />
            {loyal > 0 && (
              <g transform={`translate(${sx} 628) scale(1 ${Math.abs(Math.cos(flipK * Math.PI))})`} opacity={loyal}>
                {flipK < 0.5 ? <Tag x={0} y={0} text="преданность" color={C.green} textColor="#fff" size={32} /> : <Tag x={0} y={0} text="превосходство" color={C.red} textColor="#fff" size={32} />}
              </g>
            )}
          </g>
        )}
        {/* гости любуются звездой */}
        {guests > 0 && (
          <g opacity={guests}>
            {[640, 760, 880, 1000, 1120, 1240].map((gx, i) => (
              <Figure key={i} x={gx} y={828} s={0.42} t={t + i} role={(["courtier", "lady", "merchant", "lady", "courtier", "artist"] as Role[])[i]} mood="happy" arms={i % 2 ? [20, 150] : [140, 20]} look={gx < sx ? 0.8 : -0.8} />
            ))}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const p = (t * 0.35 + i * 0.143) % 1;
              const gx = 640 + (i % 6) * 120;
              const hx = lerp(gx, sx + Math.sin(i) * 60, p);
              const hy = lerp(700, sy + 140, p) - Math.sin(p * Math.PI) * 50;
              return <path key={i} transform={`translate(${hx} ${hy}) scale(${0.7 + 0.3 * p})`} d="M 0 18 C -40 -10 -30 -40 -12 -40 C -4 -40 0 -32 0 -28 C 0 -32 4 -40 12 -40 C 30 -40 40 -10 0 18 Z" fill={C.coral} stroke={OL} strokeWidth={3} opacity={Math.sin(p * Math.PI)} />;
            })}
          </g>
        )}
        {palace > 0.4 && (
          <g opacity={clamp01((palace - 0.4) * 3)}>
            <Tag x={1170} y={575} text="Версаль" color="#fff" size={34} />
          </g>
        )}
      </g>
      <rect x={80} y={110} width={1240} height={730} rx={36} fill="none" stroke={OL} strokeWidth={6} opacity={0.8 * ramp(t, 0, 0.6)} />
      <g opacity={1 - ramp(t, at(c, 1.0), 0.6)}>
        <Ribbon x={860} y={172} text="закон 1" size={38} color={C.purple} k={pop(t, at(c, 0.25))} />
      </g>
      {/* табличка */}
      <Pop t={t} at={at(c, 2.82)} x={760} y={170}>
        <rect x={-300} y={-44} width={600} height={78} rx={16} fill={C.night} stroke={C.gold} strokeWidth={5} />
        <T x={0} y={10} size={42} serif weight={700} color={C.goldLight}>
          На небе одно солнце
        </T>
      </Pop>
    </g>
  );
};

// ═════════════════════ g08 · Галилей ═════════════════════

const MediciShield: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -80 -96 L 80 -96 L 80 10 Q 80 80 0 104 Q -80 80 -80 10 Z" fill={C.gold} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -64 -80 L 64 -80 L 64 8 Q 64 64 0 86 Q -64 64 -64 8 Z" fill="none" stroke={C.goldDeep} strokeWidth={3} />
    {[
      [0, -52, true],
      [-34, -18, false],
      [34, -18, false],
      [-38, 22, false],
      [38, 22, false],
      [0, 54, false],
    ].map(([bx, by, blue], i) => (
      <g key={i}>
        <circle cx={bx as number} cy={by as number} r={17} fill={blue ? C.skyDeep : C.velvet} stroke={OL} strokeWidth={3.5} />
        <circle cx={(bx as number) - 5} cy={(by as number) - 5} r={5} fill="#fff" opacity={0.5} />
      </g>
    ))}
  </g>
);

const Telescope: React.FC<{ x: number; y: number; ground: number; ang: number }> = ({ x, y, ground, ang }) => (
  <g>
    <path d={`M ${x} ${y} L ${x - 64} ${ground} M ${x} ${y} L ${x + 60} ${ground} M ${x} ${y} L ${x + 8} ${ground}`} stroke="#7a5530" strokeWidth={9} strokeLinecap="round" />
    <g transform={`translate(${x} ${y}) rotate(${ang})`}>
      <path d="M -160 -13 L 200 -24 L 200 24 L -160 13 Z" fill="#c98a3b" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      {[-110, 10, 130].map((d) => (
        <rect key={d} x={d} y={-24} width={16} height={48} rx={5} fill={C.gold} stroke={OL} strokeWidth={3.5} />
      ))}
      <rect x={196} y={-30} width={22} height={60} rx={6} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
      <rect x={-176} y={-10} width={20} height={20} rx={4} fill={C.goldDeep} stroke={OL} strokeWidth={3.5} />
    </g>
    <circle cx={x} cy={y} r={11} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
  </g>
);

export const Galileo: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const J = { x: 1390, y: 330 };
  const moonsDX = [-300, -165, 165, 300];
  const shine = ramp(t, at(c, 2.85), 1.2);
  const coinsN = ramp(t, at(c, 2.18), 2.5) * 7;
  const glow = 0.35 + 0.1 * Math.sin(t * 2) + shine * 0.5;
  const happy = t > at(c, 2.05);
  return (
    <g>
      <defs>
        <linearGradient id="pw-gal-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#262a5c" />
          <stop offset="1" stopColor="#5a4aa6" />
        </linearGradient>
        <clipPath id="pw-gal-clip">
          <rect x={600} y={110} width={1240} height={730} rx={36} />
        </clipPath>
      </defs>
      <g clipPath="url(#pw-gal-clip)" opacity={ramp(t, 0, 0.6)}>
        <rect x={600} y={110} width={1240} height={730} fill="url(#pw-gal-sky)" />
        <Stars t={t} x={610} y={120} w={1220} h={560} n={70} seed={5} />
        <path d="M 600 760 Q 900 700 1250 750 Q 1550 790 1840 740 L 1840 840 L 600 840 Z" fill="#3a2f72" stroke={OL} strokeWidth={4} />
        {/* Юпитер */}
        <g transform={`translate(${J.x} ${J.y})`}>
          <circle r={150} fill={C.goldLight} opacity={glow * 0.6} />
          <circle r={110} fill={C.goldLight} opacity={glow * 0.5} />
          <circle r={84} fill="#e8b98a" stroke={OL} strokeWidth={5} />
          <clipPath id="pw-gal-jup">
            <circle r={82} />
          </clipPath>
          <g clipPath="url(#pw-gal-jup)">
            {[-50, -22, 8, 36, 62].map((by, i) => (
              <path key={i} d={`M -100 ${by} Q ${-40 + Math.sin(t + i) * 10} ${by - 8} 0 ${by} T 100 ${by}`} stroke={i % 2 ? "#c9875a" : "#f4d6b0"} strokeWidth={i % 2 ? 12 : 9} fill="none" />
            ))}
            <ellipse cx={30 + Math.sin(t * 0.4) * 6} cy={22} rx={18} ry={10} fill="#c0603a" stroke={OL} strokeWidth={3} />
          </g>
          <circle cx={-30} cy={-34} r={16} fill="#fff" opacity={0.3} />
        </g>
        {/* четыре луны — в одну линию, как видел Галилей */}
        {moonsDX.map((dx, i) => {
          const a = at(c, 0.7 + i * 0.06);
          const k = pop(t, a);
          if (k <= 0.001) return null;
          const mx = J.x + dx + Math.sin(t * (0.6 + i * 0.15) + i) * 12;
          const my = J.y + Math.sin(t * 0.5 + i) * 4;
          const kl = ramp(t, at(c, 1.73 + i * 0.05), 0.5);
          return (
            <g key={i} opacity={clamp01(k * 1.5)}>
              <circle cx={mx} cy={my} r={34 * k} fill="#fff7cf" opacity={0.25 + 0.1 * Math.sin(t * 3 + i)} />
              <circle cx={mx} cy={my} r={17 * k} fill="#f4f0ff" stroke={OL} strokeWidth={4} />
              {kl > 0 && (
                <T x={mx} y={my + 64} size={30} color="#fff" opacity={kl}>
                  {i === 0 ? "Козимо II" : "брат"}
                </T>
              )}
            </g>
          );
        })}
        {/* Галилей у телескопа */}
        <Telescope x={905} y={525} ground={790} ang={-30} />
        <Figure x={700} y={800} s={1.02} t={t} role="scholar" mood={happy ? "happy" : "neutral"} arms={happy ? [150, 70] : [20, 70]} look={0.8} />
        {/* монеты жалованья */}
        {coinsN > 0.05 && <CoinStack x={1700} y={792} n={Math.ceil(coinsN)} r={42} />}
        {coinsN > 0.05 && coinsN < 7 && <Coin x={1700} y={lerp(380, 792 - Math.ceil(coinsN) * 14, (coinsN % 1) ** 2)} r={30} rot={t * 6} />}
        <Pop t={t} at={at(c, 2.38)} x={0} y={0}>
          <Scroll x={1240} y={652} w={420} h={170} lines={["придворный", "математик"]} size={38} open={ramp(t, at(c, 2.38), 0.8)} rot={wob(t, 2, 1)} />
        </Pop>
      </g>
      <rect x={600} y={110} width={1240} height={730} rx={36} fill="none" stroke={OL} strokeWidth={6} opacity={0.8 * ramp(t, 0, 0.6)} />
      <Pop t={t} at={at(c, 0.22)} x={760} y={176}>
        <rect x={-90} y={-38} width={180} height={64} rx={14} fill={C.goldLight} stroke={OL} strokeWidth={4} />
        <T x={0} y={8} size={40} weight={900} color={C.night}>
          1610
        </T>
      </Pop>
      {/* герб Медичи */}
      <Pop t={t} at={at(c, 1.5)} x={760} y={340}>
        <g transform={`rotate(${wob(t, 1, 2)})`}>
          <MediciShield x={0} y={0} s={0.95} />
        </g>
        <T x={0} y={140} size={32} color="#fff">
          Медичи
        </T>
      </Pop>
      <Arrow x1={860} y1={300} x2={1290} y2={262} k={ramp(t, at(c, 1.62), 0.9)} color={C.goldLight} w={7} bend={-0.18} />
      <Ribbon x={1390} y={172} text="Юпитер и 4 звезды" size={38} color={C.purple} k={pop(t, at(c, 1.88))} />
    </g>
  );
};

// ═════════════════════ g08b · астролог ═════════════════════

export const Astrologer: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const ready = ramp(t, at(c, 1.02), 0.6);
  const stand = ramp(t, at(c, 1.86), 0.8);
  const armUp = ready * (1 - stand);
  const qB = pop(t, at(c, 1.36)) * (1 - ramp(t, at(c, 2.0), 0.5));
  const aB = pop(t, at(c, 1.57)) * (1 - ramp(t, at(c, 2.0), 0.5));
  const tagOut = 1 - ramp(t, at(c, 1.0), 0.5);
  const tagK = ramp(t, at(c, 0.5), 0.5) * tagOut;
  const tagA = ramp(t, at(c, 0.78), 0.5) * tagOut;
  const cards = t > at(c, 2.0);
  const kingMood: Mood = t < at(c, 0.45) ? "neutral" : t < at(c, 1.55) ? "sly" : t < at(c, 1.85) ? "shock" : "worried";
  const astroMood: Mood = t < at(c, 1.5) ? "worried" : "sly";
  return (
    <g>
      <defs>
        <clipPath id="pw-astro-room">
          <rect x={80} y={110} width={1240} height={730} rx={36} />
        </clipPath>
        <linearGradient id="pw-astro-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2f6b" />
          <stop offset="1" stopColor="#6a59b8" />
        </linearGradient>
      </defs>
      <g clipPath="url(#pw-astro-room)" opacity={ramp(t, 0, 0.6)}>
        <rect x={80} y={110} width={1240} height={730} fill="#ebe2d2" />
        {Array.from({ length: 9 }).map((_, r) =>
          Array.from({ length: 9 }).map((__, k) => (
            <rect key={`${r}-${k}`} x={80 + k * 150 - (r % 2) * 75} y={110 + r * 70} width={150} height={70} fill="none" stroke={C.stoneDeep} strokeWidth={3} opacity={0.35} />
          )),
        )}
        {/* окно башни */}
        <path d="M 170 600 L 170 290 Q 170 190 300 180 Q 430 190 430 290 L 430 600 Z" fill="url(#pw-astro-night)" stroke={OL} strokeWidth={6} />
        <Stars t={t} x={185} y={200} w={230} h={380} n={18} seed={11} />
        <circle cx={360} cy={280} r={34} fill="#fff6d0" />
        <circle cx={376} cy={270} r={30} fill="#3a3a7a" />
        <path d="M 300 182 L 300 600 M 170 400 L 430 400" stroke={OL} strokeWidth={5} />
        <rect x={150} y={596} width={300} height={24} rx={6} fill={C.stone} stroke={OL} strokeWidth={4} />
        {/* звёздная карта на стене */}
        <g transform={`translate(1150 250) rotate(${wob(t, 4, 1.5)})`}>
          <rect x={-90} y={-70} width={180} height={140} rx={8} fill="#2f3570" stroke={C.goldDeep} strokeWidth={8} />
          <circle r={48} fill="none" stroke={C.goldLight} strokeWidth={3} opacity={0.7} />
          {[0, 1, 2, 3, 4].map((i) => (
            <StarShape key={i} x={Math.cos(i * 1.3 + t * 0.2) * 40} y={Math.sin(i * 1.3 + t * 0.2) * 34} r={9} fill={C.goldLight} stroke="none" />
          ))}
        </g>
        <rect x={80} y={760} width={1240} height={80} fill="#bca98a" />
        <path d="M 80 760 L 1320 760" stroke={OL} strokeWidth={4} opacity={0.5} />
        {/* свеча */}
        <g transform="translate(830 760)">
          <rect x={-60} y={-150} width={120} height={150} fill="#9a6b3e" stroke={OL} strokeWidth={4} />
          <rect x={-74} y={-164} width={148} height={20} rx={5} fill="#b9824c" stroke={OL} strokeWidth={4} />
          <rect x={-10} y={-224} width={20} height={60} rx={4} fill="#fff6e6" stroke={OL} strokeWidth={3} />
          <path d={`M 0 ${-260 + Math.sin(t * 8) * 3} Q 12 -236 0 -226 Q -12 -236 0 ${-260 + Math.sin(t * 8) * 3} Z`} fill={C.yellowDeep} />
          <circle cy={-240} r={36} fill={C.goldLight} opacity={0.35 + 0.1 * Math.sin(t * 6)} />
        </g>
        {/* слуги у окна */}
        {[250, 380].map((sx, i) => (
          <Pop key={i} t={t} at={at(c, 0.98 + i * 0.02)} x={0} y={0}>
            <Figure x={sx} y={790} s={0.88} t={t + i} role="soldier" mood={stand > 0.5 ? (t < at(c, 2.0) ? "shock" : "neutral") : ready > 0.5 ? "sly" : "neutral"} arms={[lerp(14, 50, armUp), lerp(14, 80, armUp)]} look={0.8} walk={0} />
          </Pop>
        ))}
        {/* астролог */}
        <Pop t={t} at={at(c, 0.74)} x={0} y={0}>
          <Figure x={590} y={792} s={0.95} t={t} role="scholar" body="#34407a" mood={astroMood} arms={[16, aB > 0.3 ? 60 : 30]} talk={aB > 0.3 && t < at(c, 1.8) ? 1 : 0} look={0.6} />
        </Pop>
        {/* король */}
        <Pop t={t} at={at(c, 0.45)} x={0} y={0}>
          <Figure x={1040} y={795} s={1} t={t} role="king" mood={kingMood} arms={[14, lerp(20, 120, armUp)]} talk={qB > 0.3 && t < at(c, 1.55) ? 1 : 0} look={-0.8} />
        </Pop>
        {tagK > 0 && (
          <g opacity={tagK}>
            <Tag x={1040} y={430} text="Людовик XI" color={C.goldLight} size={34} />
          </g>
        )}
        {tagA > 0 && (
          <g opacity={tagA}>
            <Tag x={590} y={470} text="астролог" color="#fff" size={34} />
          </g>
        )}
        {/* реплики */}
        {qB > 0.01 && (
          <g opacity={clamp01(qB * 1.5)} transform={`translate(0 ${(1 - clamp01(qB)) * 20})`}>
            <Bubble x={720} y={176} w={540} h={104} tail={[1000, 470]} />
            <T x={990} y={242} size={38}>
              Когда умрёшь ты сам?
            </T>
          </g>
        )}
        {aB > 0.01 && (
          <g opacity={clamp01(aB * 1.5)} transform={`translate(0 ${(1 - clamp01(aB)) * 20})`}>
            <Bubble x={250} y={300} w={560} h={150} tail={[570, 500]} fill="#fff8e0" />
            <T x={530} y={362} size={38}>
              {"За три дня\nдо Вашего Величества"}
            </T>
          </g>
        )}
      </g>
      <rect x={80} y={110} width={1240} height={730} rx={36} fill="none" stroke={OL} strokeWidth={6} opacity={0.8 * ramp(t, 0, 0.6)} />
      {cards && (
        <g>
          <Pop t={t} at={at(c, 2.2)} x={395} y={210} from={0.5}>
            <Panel x={-285} y={-80} w={570} h={160} stroke={C.green} r={28} />
            <circle cx={-205} cy={0} r={46} fill="#e3f6ec" />
            <Check x={-205} y={2} s={46} k={ramp(t, at(c, 2.3), 0.5)} />
            <T x={40} y={-8} size={38}>
              {"незаменимый\nспециалист"}
            </T>
          </Pop>
          <Pop t={t} at={at(c, 2.62)} x={1005} y={210} from={0.5}>
            <Panel x={-285} y={-80} w={570} h={160} stroke={C.red} r={28} />
            <circle cx={-205} cy={0} r={46} fill="#fde7e7" />
            <Cross x={-205} y={0} s={52} k={ramp(t, at(c, 2.72), 0.5)} />
            <T x={40} y={-8} size={38}>
              {"нарочно делать\nзависимыми"}
            </T>
          </Pop>
        </g>
      )}
    </g>
  );
};

// ═════════════════════ g09 · такт или угодничество ═════════════════════

export const TactScale: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const X0 = 200;
  const X1 = 1200;
  const TY = 400;
  const marks = [
    { x: 330, text: "делиться успехом", up: true, a: at(c, 0.35), col: C.greenDeep },
    { x: 560, text: "благодарить команду", up: false, a: at(c, 0.5), col: C.greenDeep },
    { x: 850, text: "изображать наивность", up: true, a: at(c, 1.3), col: C.red },
    { x: 1080, text: "отдавать свои идеи", up: false, a: at(c, 1.62), col: C.red },
  ];
  // ползунок едет по отметкам
  let kx = lerp(X0 + 20, marks[0].x, ramp(t, marks[0].a, 0.8));
  for (let i = 1; i < marks.length; i++) kx = lerp(kx, marks[i].x, ramp(t, marks[i].a, 0.9));
  kx = lerp(kx, 700, ramp(t, at(c, 3.0), 1.4));
  const q = ramp(t, at(c, 3.0), 0.8);
  const knobCol = kx < 700 ? C.green : kx < 900 ? C.yellowDeep : C.red;
  return (
    <g>
      <defs>
        <linearGradient id="pw-tact-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.green} />
          <stop offset="0.45" stopColor="#9fd86a" />
          <stop offset="0.55" stopColor={C.yellow} />
          <stop offset="1" stopColor={C.red} />
        </linearGradient>
      </defs>
      <Pop t={t} at={at(c, 0.02)} x={0} y={0} from={0.8}>
        <Panel x={90} y={110} w={1230} h={480} />
        {/* концы шкалы */}
        <T x={140} y={200} size={54} weight={900} color={C.greenDeep} anchor="start">
          такт
        </T>
        <T x={1270} y={200} size={54} weight={900} color={C.red} anchor="end">
          угодничество
        </T>
        <path d="M 300 184 L 880 184" stroke={C.inkSoft} strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" opacity={1 - q} />
        {/* зоны */}
        <rect x={X0 - 30} y={TY - 70} width={530} height={140} rx={30} fill={C.green} opacity={0.08} />
        <rect x={700} y={TY - 70} width={530} height={140} rx={30} fill={C.red} opacity={0.08} />
        {q > 0 && <rect x={630} y={TY - 56} width={140} height={112} rx={36} fill={C.yellow} opacity={q * (0.3 + 0.15 * Math.sin(t * 2.5))} />}
        <rect x={X0} y={TY - 20} width={X1 - X0} height={40} rx={20} fill="url(#pw-tact-grad)" stroke={OL} strokeWidth={5} />
        {marks.map((m, i) => {
          const k = pop(t, m.a);
          if (k <= 0.001) return null;
          const py = m.up ? TY - 92 : TY + 98;
          const w = m.text.length * 17.5 + 44;
          return (
            <g key={i} opacity={clamp01(k * 1.5)}>
              <path d={`M ${m.x} ${m.up ? TY - 22 : TY + 22} L ${m.x} ${m.up ? py + 26 : py - 30}`} stroke={m.col} strokeWidth={5} />
              <circle cx={m.x} cy={TY} r={10} fill="#fff" stroke={m.col} strokeWidth={5} />
              <g transform={`translate(${m.x} ${py + wob(t, i, 2)}) scale(${0.6 + 0.4 * k})`}>
                <rect x={-w / 2} y={-30} width={w} height={56} rx={28} fill="#fff" stroke={m.col} strokeWidth={5} />
                <T x={0} y={9} size={30} color={m.col}>
                  {m.text}
                </T>
              </g>
            </g>
          );
        })}
        {/* ползунок */}
        <g transform={`translate(${kx} ${TY})`}>
          <circle r={38} fill="#fff" stroke={OL} strokeWidth={5} />
          <circle r={24} fill={knobCol} />
          <circle cx={-8} cy={-8} r={7} fill="#fff" opacity={0.6} />
        </g>
      </Pop>
      {/* риск: ревнивый начальник */}
      <Pop t={t} at={at(c, 2.3)} x={0} y={0}>
        <Figure x={250} y={835} s={0.72} t={t} role="boss" mood="angry" arms={[30, 20]} look={0.8} />
        <g transform={`translate(${250 + wob(t, 2, 6)} 618)`}>
          <Cloud x={0} y={0} s={0.62} fill="#8d9bb0" />
          {Math.sin(t * 3) > 0.6 && <path d="M 4 10 L -12 40 L 4 40 L -6 66 L 22 30 L 6 30 L 16 10 Z" fill={C.yellow} stroke={OL} strokeWidth={3} />}
        </g>
      </Pop>
      <Pop t={t} at={at(c, 2.42)} x={0} y={0}>
        <Figure x={440} y={835} s={0.66} t={t} role="modern" mood="happy" arms={[20, 150]} look={-0.5} />
        <StarShape x={460} y={620 + wob(t, 5, 5)} r={30} fill={C.gold} rot={t * 20} />
      </Pop>
      <Pop t={t} at={at(c, 2.7)} x={860} y={700}>
        <Tag x={0} y={0} text="риск: ревнивый начальник" color={C.red} textColor="#fff" size={40} />
      </Pop>
      <Pop t={t} at={at(c, 2.6)} x={860} y={790}>
        <T x={0} y={0} size={32} color={C.inkSoft} weight={700} halo="#f3eeff">
          не ваш недостаток
        </T>
      </Pop>
      {q > 0 && (
        <g opacity={q}>
          <path d={`M 700 222 L 700 ${TY + 60}`} stroke={C.ink} strokeWidth={4} strokeDasharray="10 10" />
        </g>
      )}
      <Pop t={t} at={at(c, 3.02)} x={700} y={200}>
        <T x={0} y={0} size={44} weight={900} halo="#fff">
          где граница?
        </T>
      </Pop>
    </g>
  );
};

// ═════════════════════ g19 · с кем осторожнее ═════════════════════

export const FiveTypes: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const types: { label: string; role: Role; mood: Mood; arms: [number, number]; look: number; a: number; tint: string; icon: "crown" | "drop" | "eye" | "note" }[] = [
    { label: "гордый", role: "courtier", mood: "proud", arms: [40, 40], look: -0.4, a: at(c, 0.4), tint: "#f3e9ff", icon: "crown" },
    { label: "неуверенный", role: "lady", mood: "worried", arms: [24, 24], look: 0.3, a: at(c, 0.72), tint: "#e8f4ff", icon: "drop" },
    { label: "подозрительный", role: "minister", mood: "sly", arms: [16, 60], look: 1, a: at(c, 0.81), tint: "#fff3dc", icon: "eye" },
    { label: "злопамятный", role: "merchant", mood: "angry", arms: [20, 70], look: -0.6, a: at(c, 0.91), tint: "#ffe9e6", icon: "note" },
  ];
  const joke = pop(t, at(c, 1.26));
  const laugh = t > at(c, 1.38);
  const hurt = ramp(t, at(c, 1.5), 0.6);
  return (
    <g>
      {types.map((ty, i) => {
        const x = 95 + i * 305;
        return (
          <Pop key={i} t={t} at={ty.a} x={x + 145} y={330} from={0.5}>
            <g transform={`translate(${-x - 145} ${-330 + wob(t, i, 3)})`}>
              <Panel x={x} y={125} w={290} h={410} fill={ty.tint} r={30} />
              <Figure x={x + 145} y={455} s={0.92} t={t + i} role={ty.role} mood={ty.mood} arms={ty.arms} look={ty.look} hold={ty.icon === "note" ? <rect x={-12} y={-30} width={30} height={40} rx={4} fill="#fff" stroke={OL} strokeWidth={3} /> : undefined} />
              {ty.icon === "eye" && (
                <g transform={`translate(${x + 230} 175)`}>
                  <path d="M -26 0 Q 0 -22 26 0 Q 0 22 -26 0 Z" fill="#fff" stroke={OL} strokeWidth={3.5} />
                  <circle cx={Math.sin(t * 1.5) * 8} r={8} fill={OL} />
                </g>
              )}
              {ty.icon === "crown" && <Crown x={x + 228} y={182} s={0.3} rot={wob(t, 2, 6)} />}
              {ty.icon === "drop" && <path transform={`translate(${x + 228} ${172 + ((t * 10) % 12)})`} d="M 0 -18 Q 14 0 12 8 Q 8 18 0 18 Q -8 18 -12 8 Q -14 0 0 -18 Z" fill="#9ad8ff" stroke={C.skyDeep} strokeWidth={3} />}
              {ty.icon === "note" && (
                <g transform={`translate(${x + 228} 178)`}>
                  <rect x={-20} y={-24} width={40} height={48} rx={5} fill="#fff" stroke={OL} strokeWidth={3} />
                  {[-10, 0, 10].map((d) => (
                    <path key={d} d={`M -11 ${d} L 11 ${d}`} stroke={C.red} strokeWidth={3} />
                  ))}
                </g>
              )}
              <T x={x + 145} y={508} size={30}>
                {ty.label}
              </T>
            </g>
          </Pop>
        );
      })}
      {/* шутка: один смеётся, другой обижен */}
      {joke > 0.001 && (
        <g opacity={clamp01(joke * 1.5)}>
          <g transform={`translate(360 600) scale(${0.6 + 0.4 * clamp01(joke)})`}>
            <Bubble x={-110} y={-44} w={220} h={70} />
            <T x={0} y={4} size={34}>
              Шутка!
            </T>
          </g>
          <Figure x={210} y={838} s={0.62} t={t} role="modern" mood={laugh ? "happy" : "neutral"} talk={laugh ? 0.8 : 0} arms={laugh ? [130, 130] : [14, 14]} look={0.5} />
          {laugh &&
            [0, 1].map((i) => {
              const p = (t * 0.7 + i * 0.5) % 1;
              return (
                <T key={i} x={i ? 300 : 120} y={(i ? 670 : 690) - p * 50} size={30} color={C.greenDeep} opacity={Math.sin(p * Math.PI)}>
                  ха-ха
                </T>
              );
            })}
          <Figure x={505} y={838} s={0.62} t={t + 2} role="courtier" body="#b9a6e8" mood={hurt > 0.5 ? "sad" : "neutral"} arms={[14, 14]} look={-0.5} />
          {hurt > 0 && (
            <g opacity={hurt} transform={`translate(${590 + wob(t, 3, 4)} 650)`}>
              <Cloud x={0} y={0} s={0.42} fill="#9aa6b8" />
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M ${-20 + i * 20} ${18 + ((t * 40 + i * 13) % 30)} l -4 10`} stroke={C.skyDeep} strokeWidth={4} strokeLinecap="round" />
              ))}
            </g>
          )}
        </g>
      )}
      {/* цитата Честерфилда */}
      <Pop t={t} at={at(c, 1.7)} x={0} y={0}>
        <g transform={`rotate(${wob(t, 4, 0.6)} 1000 690)`}>
          <Scroll x={1000} y={690} w={580} h={210} lines={["Ошибки прощают,", "пренебрежение — никогда"]} size={36} open={ramp(t, at(c, 1.7), 0.8)} />
          {t > at(c, 1.76) && (
            <T x={1000} y={768} size={30} color={C.inkSoft} weight={700} serif opacity={ramp(t, at(c, 1.76), 0.6)}>
              — лорд Честерфилд
            </T>
          )}
        </g>
      </Pop>
    </g>
  );
};

// ═════════════════════ g24 · три вопроса ═════════════════════

const Domino: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const fall = clamp01(Math.sin(t * 1.2) * 1.4 - i * 0.25);
      return (
        <g key={i} transform={`translate(${-26 + i * 24} 24) rotate(${fall * 32})`}>
          <rect x={-8} y={-50} width={16} height={50} rx={3} fill="#fff" stroke={OL} strokeWidth={3} />
          <circle cx={0} cy={-36} r={2.5} fill={OL} />
          <circle cx={0} cy={-14} r={2.5} fill={OL} />
        </g>
      );
    })}
  </g>
);

const Rival: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M -32 30 Q -32 -2 0 -4 Q 32 -2 32 30 Z" fill="#4a4f6b" stroke={OL} strokeWidth={3} />
    <circle cy={-22} r={18} fill="#4a4f6b" stroke={OL} strokeWidth={3} />
    <path d={`M -10 -24 L -3 -21 M 10 -24 L 3 -21`} stroke="#ffd23f" strokeWidth={4} strokeLinecap="round" opacity={0.7 + 0.3 * Math.sin(t * 3)} />
  </g>
);

const Winner: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <CoinStack x={-14} y={26} n={3} r={18} />
    <circle cx={22} cy={-14 + Math.sin(t * 2) * 3} r={12} fill={C.sky} stroke={OL} strokeWidth={3} />
    <path d={`M 10 28 Q 10 0 22 0 Q 34 0 34 28 Z`} fill={C.sky} stroke={OL} strokeWidth={3} />
  </g>
);

export const ThreeQuestions: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const rows = [
    { text: "Последствия?", a: at(c, 0.3), ck: at(c, 0.55), Icon: Domino, col: C.coral },
    { text: "Новые противники?", a: at(c, 0.58), ck: at(c, 0.75), Icon: Rival, col: C.purple },
    { text: "Кто ещё выиграет?", a: at(c, 0.77), ck: at(c, 0.97), Icon: Winner, col: C.skyDeep },
  ];
  const S = { x: 1420, y: 780 };
  const G = { x: 1740, y: 300 };
  const kPath = ramp(t, at(c, 0.1), 1.6);
  const rock = pop(t, at(c, 1.55));
  const kB = ramp(t, at(c, 1.7), 1.4);
  const flowA = -t * 40;
  const pathA = `M ${S.x} ${S.y} C ${S.x + 60} 600 ${G.x - 20} 520 ${G.x} ${G.y + 30}`;
  const pathB = `M ${S.x + 12} ${S.y - 80} C ${S.x - 110} 560 ${S.x - 40} 380 ${G.x - 30} ${G.y + 40}`;
  return (
    <g>
      <Pop t={t} at={at(c, 0.02)} x={935} y={420} from={0.7}>
        <g transform={`translate(-935 ${-420 + wob(t, 0, 2.5)})`}>
          <Panel x={600} y={130} w={670} h={555} />
          <T x={935} y={210} size={46} weight={900}>
            Перед стартом
          </T>
          <path d="M 680 240 L 1190 240" stroke={C.purpleLight} strokeWidth={5} strokeLinecap="round" />
          {rows.map((r, i) => {
            const k = pop(t, r.a);
            if (k <= 0.001) return null;
            const y = 320 + i * 140;
            const done = ramp(t, r.ck, 0.5);
            return (
              <g key={i} opacity={clamp01(k * 1.5)} transform={`translate(${(1 - clamp01(k)) * -40} 0)`}>
                <rect x={630} y={y - 55} width={610} height={110} rx={26} fill={done > 0.5 ? "#eefaf3" : "#f7f4ff"} />
                <circle cx={690} cy={y} r={44} fill="#fff" stroke={r.col} strokeWidth={5} />
                <g transform={`translate(690 ${y})`}>
                  <r.Icon t={t} />
                </g>
                <T x={752} y={y + 13} size={37} anchor="start">
                  {r.text}
                </T>
                <rect x={1166} y={y - 30} width={60} height={60} rx={12} fill="#fff" stroke={OL} strokeWidth={4} />
                <Check x={1192} y={y + 2} s={38} k={done} />
              </g>
            );
          })}
        </g>
      </Pop>
      {/* маршрут: план должен быть гибким */}
      {kPath > 0 && (
        <g>
          <circle cx={S.x} cy={S.y} r={22} fill={C.green} stroke={OL} strokeWidth={4} />
          <T x={S.x + 40} y={S.y + 12} size={30} anchor="start" halo="#f3eeff">
            старт
          </T>
          <path d={pathA} fill="none" stroke={C.inkSoft} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={`${kPath} 1`} opacity={kB > 0 ? lerp(1, 0.35, kB) : 1} />
          {kPath >= 1 && <path d={pathA} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="14 22" strokeDashoffset={flowA} opacity={kB > 0 ? lerp(0.9, 0.2, kB) : 0.9} />}
          <g opacity={clamp01(kPath * 2 - 1) * (1 - kB * 0.6)}>
            <Tag x={1610} y={705} text="план A" color="#e3e7ef" size={30} />
          </g>
          <g transform={`translate(${G.x} ${G.y + 40})`} opacity={clamp01(kPath * 2 - 1)}>
            <path d="M 0 0 L 0 -110" stroke={OL} strokeWidth={6} strokeLinecap="round" />
            <path d={`M 0 -110 Q ${40 + Math.sin(t * 3) * 6} ${-100 + Math.cos(t * 3) * 4} 80 -92 L 0 -66 Z`} fill={C.velvet} stroke={OL} strokeWidth={4} />
            <T x={0} y={44} size={30} halo="#f3eeff">
              цель
            </T>
          </g>
        </g>
      )}
      {rock > 0.001 && (
        <g transform={`translate(1636 530) scale(${clamp01(rock)})`}>
          <path d="M -54 30 L -40 -20 L -6 -44 L 36 -32 L 56 10 L 44 30 Z" fill={C.stoneDeep} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -20 -22 L 4 -30" stroke="#fff" strokeWidth={5} opacity={0.5} strokeLinecap="round" />
          <Cross x={0} y={-80} s={44} k={ramp(t, at(c, 1.62), 0.4)} />
        </g>
      )}
      {kB > 0 && (
        <g>
          <path d={pathB} fill="none" stroke={C.green} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={`${kB} 1`} />
          {kB >= 1 && <path d={pathB} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="14 22" strokeDashoffset={-t * 50} opacity={0.9} />}
          <g opacity={clamp01(kB * 2 - 0.6)}>
            <Tag x={1410} y={470} text="план B" color={C.green} textColor="#fff" size={34} />
          </g>
        </g>
      )}
      <Pop t={t} at={at(c, 1.9)} x={1590} y={168}>
        <T x={0} y={0} size={34} weight={900} color={C.greenDeep} halo="#f3eeff">
          план должен быть гибким
        </T>
      </Pop>
    </g>
  );
};

// ═════════════════════ g35 · пять признаков ═════════════════════

const SignIcon: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  if (i === 0)
    return (
      <g transform={`rotate(${Math.sin(t * 2) * 4})`}>
        <rect x={-44} y={-20} width={88} height={64} rx={8} fill={C.coral} stroke={OL} strokeWidth={4} />
        <rect x={-50} y={-38} width={100} height={22} rx={6} fill="#ff9e92" stroke={OL} strokeWidth={4} />
        <rect x={-8} y={-38} width={16} height={82} fill={C.gold} stroke={OL} strokeWidth={3} />
        <path d="M 0 -38 Q -36 -70 -30 -44 Q -26 -34 0 -38 Q 36 -70 30 -44 Q 26 -34 0 -38 Z" fill={C.gold} stroke={OL} strokeWidth={3} />
      </g>
    );
  if (i === 1)
    return (
      <g>
        {[C.red, C.yellow, C.green, C.skyDeep].map((col, k) => (
          <path key={k} d={`M ${-52 + k * 9} 30 A ${52 - k * 9} ${52 - k * 9} 0 0 1 ${52 - k * 9} 30`} fill="none" stroke={col} strokeWidth={9} />
        ))}
        <StarShape x={0} y={-30} r={22 + Math.sin(t * 3) * 3} fill={C.gold} rot={t * 30} />
      </g>
    );
  if (i === 2)
    return (
      <g>
        <path d="M -24 -8 L -24 -30 Q -24 -56 0 -56 Q 24 -56 24 -30 L 24 -8" fill="none" stroke={OL} strokeWidth={9} />
        <rect x={-38} y={-10} width={76} height={60} rx={10} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
        <circle cy={14} r={8} fill={OL} />
        <path d="M 0 14 L 0 32" stroke={OL} strokeWidth={6} />
        <path d="M 44 -54 L 30 -24 L 44 -24 L 32 6 L 62 -32 L 48 -32 L 58 -54 Z" fill={C.yellow} stroke={OL} strokeWidth={3} strokeLinejoin="round" opacity={0.75 + 0.25 * Math.sin(t * 6)} />
      </g>
    );
  if (i === 3) {
    const sw = Math.sin(t * 2.4) * 8;
    return (
      <g>
        <g transform={`rotate(${sw / 2} 0 -44)`}>
          <rect x={-44} y={-52} width={88} height={14} rx={6} fill="#a8733c" stroke={OL} strokeWidth={3.5} />
          <rect x={-7} y={-62} width={14} height={36} rx={5} fill="#a8733c" stroke={OL} strokeWidth={3} />
        </g>
        {[-36, 0, 36].map((d, k) => (
          <path key={k} d={`M ${d} -40 L ${d * 0.5 + sw * 0.4} 20`} stroke={C.inkSoft} strokeWidth={2.5} />
        ))}
        <path transform={`translate(${sw * 0.4} 36) scale(1.1)`} d="M 0 18 C -40 -10 -30 -40 -12 -40 C -4 -40 0 -32 0 -28 C 0 -32 4 -40 12 -40 C 30 -40 40 -10 0 18 Z" fill={C.coral} stroke={OL} strokeWidth={3} />
      </g>
    );
  }
  return (
    <g>
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 2 }).map((__, k) => <rect key={`${r}-${k}`} x={-22 + k * 22 - (r % 2) * 11} y={-50 + r * 24} width={22} height={24} fill="#d9785a" stroke={OL} strokeWidth={2.5} />),
      )}
      <rect x={-22} y={-50} width={44} height={96} fill="none" stroke={OL} strokeWidth={4} />
      <circle cx={-46} cy={-6} r={11} fill={C.sky} stroke={OL} strokeWidth={3} />
      <path d="M -60 40 Q -60 10 -46 10 Q -32 10 -32 40 Z" fill={C.sky} stroke={OL} strokeWidth={3} />
      {[36, 56].map((px, k) => (
        <g key={k} opacity={0.75}>
          <circle cx={px} cy={-10 + k * 6} r={9} fill={C.inkSoft} />
          <path d={`M ${px - 12} ${40} Q ${px - 12} ${6 + k * 6} ${px} ${6 + k * 6} Q ${px + 12} ${6 + k * 6} ${px + 12} 40 Z`} fill={C.inkSoft} />
        </g>
      ))}
    </g>
  );
};

export const FiveSigns: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const signs = [
    { label: "внезапная\nщедрость", a: at(c, 0.28), col: C.coral },
    { label: "обещание\nчуда", a: at(c, 0.72), col: C.violet },
    { label: "срочно\nи секретно", a: at(c, 1.03), col: C.goldDeep },
    { label: "игра на\nслабостях", a: at(c, 1.46), col: C.velvet },
    { label: "отрезают от\nсоветчиков", a: at(c, 2.06), col: C.skyDeep },
  ];
  const two = ramp(t, at(c, 2.64), 0.6);
  const q = t > at(c, 3.0);
  const cyc = q ? Math.floor(((t - at(c, 3.0)) * 1.2) % 5) : -1;
  return (
    <g>
      <Pop t={t} at={at(c, 0.02)} x={700} y={170}>
        <T x={0} y={0} size={52} weight={900}>
          5 признаков манипуляции
        </T>
        <path d="M -300 28 L 300 28" stroke={C.purple} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
      </Pop>
      {signs.map((s, i) => {
        const x = 190 + i * 260;
        const k = pop(t, s.a);
        if (k <= 0.001) return null;
        const hl = (two > 0 && (i === 0 || i === 2) ? two : 0) + (cyc === i ? 1 : 0);
        const y = 370 + wob(t, i, 4) - (cyc === i ? 10 : 0);
        return (
          <g key={i} opacity={clamp01(k * 1.5)}>
            <g transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * k})`}>
              {hl > 0 && <path d="M 0 -128 L 112 -94 Q 118 46 0 128 Q -118 46 -112 -94 Z" fill={i === 0 || i === 2 ? C.red : C.yellow} opacity={0.3 * Math.min(1, hl) + 0.08 * Math.sin(t * 4)} />}
              <path d="M 0 -112 L 98 -82 Q 102 40 0 112 Q -102 40 -98 -82 Z" fill="#fff" stroke={s.col} strokeWidth={8} strokeLinejoin="round" />
              <path d="M 0 -96 L 82 -70 Q 86 34 0 96 Q -86 34 -82 -70 Z" fill="none" stroke={s.col} strokeWidth={2.5} opacity={0.4} />
              <SignIcon i={i} t={t} />
              <circle cx={0} cy={-112} r={26} fill={s.col} stroke={OL} strokeWidth={4} />
              <T x={0} y={-101} size={30} color="#fff" weight={900}>
                {String(i + 1)}
              </T>
            </g>
            <T x={x} y={540} size={32} color={C.ink}>
              {s.label}
            </T>
          </g>
        );
      })}
      {two > 0 && (
        <g opacity={two}>
          <path d="M 190 592 Q 450 650 710 592" fill="none" stroke={C.red} strokeWidth={6} strokeDasharray="14 12" strokeDashoffset={-t * 30} strokeLinecap="round" pathLength={1000} />
          <circle cx={190} cy={592} r={9} fill={C.red} />
          <circle cx={710} cy={592} r={9} fill={C.red} />
        </g>
      )}
      <Pop t={t} at={at(c, 2.66)} x={470} y={725}>
        <g transform={`rotate(${wob(t, 2, 3)})`}>
          <polygon
            points={Array.from({ length: 8 })
              .map((_, i) => {
                const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
                return `${Math.cos(a) * 86},${Math.sin(a) * 86}`;
              })
              .join(" ")}
            fill={C.red}
            stroke={OL}
            strokeWidth={5}
          />
          <polygon
            points={Array.from({ length: 8 })
              .map((_, i) => {
                const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
                return `${Math.cos(a) * 72},${Math.sin(a) * 72}`;
              })
              .join(" ")}
            fill="none"
            stroke="#fff"
            strokeWidth={5}
          />
          <T x={0} y={14} size={40} weight={900} color="#fff">
            STOP
          </T>
        </g>
      </Pop>
      <Pop t={t} at={at(c, 2.72)} x={880} y={725}>
        <Tag x={0} y={0} text="2 совпадения — стоп!" color={C.red} textColor="#fff" size={42} />
      </Pop>
    </g>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POWER_VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  court: Court,
  janus: Janus,
  sunKing: SunKing,
  galileo: Galileo,
  astrologer: Astrologer,
  tactScale: TactScale,
  fiveTypes: FiveTypes,
  threeQuestions: ThreeQuestions,
  fiveSigns: FiveSigns,
};
