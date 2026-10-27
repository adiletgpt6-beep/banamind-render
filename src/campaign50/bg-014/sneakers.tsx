// Красные кроссовки крупно (мотив ролика). Пара кроссовок сбоку, носами
// вправо: белая подошва, белый мысок, ярко-красный верх, люверсы и шнурки.
// Шнурки двигаются «стоп-моушн»: состояние меняется шагами (по 3 кадра
// на шаг = 10 поз в секунду) с лёгким дрожанием каждой позы, как у
// покадровой съёмки настоящих шнурков.
//   tie   0…1 — 0: концы шнурков лежат на полу, 1: аккуратный бант;
//   pull  0…1 — концы бантика вытягиваются вверх-вправо (из них в
//               сцене маршрута вырастают жёлтые линии);
//   laceColor — цвет шнурков (белый; в сцене маршрута — жёлтый).
// Точка (x, y) — низ подошвы переднего кроссовка у пятки (px кадра).
import { C } from "./palette";
import { clamp, easeInOut, hash01, lerp, type Vec } from "./rig/motion";

export const STOP_STEP = 3;
// Кадр «стоп-моушн»: время идёт ступеньками.
export const stopFrame = (f: number, step = STOP_STEP) => Math.floor(f / step) * step;

// Люверсы вдоль подъёма (локальные координаты кроссовка, y вверх отрицательный).
const EYE: readonly Vec[] = Array.from({ length: 5 }, (_, i) => ({ x: lerp(222, 392, i / 4), y: lerp(-176, -112, i / 4) }));
// Узел банта — над верхним люверсом.
export const KNOT: Vec = { x: 214, y: -196 };

const UPPER =
  "M 16 -46 C 4 -110 26 -168 76 -192 L 150 -200 C 172 -176 204 -170 228 -184 L 298 -218 C 318 -226 338 -210 332 -192 L 418 -116 C 470 -86 522 -76 524 -46 Z";
const HEEL = "M 16 -46 C 4 -110 26 -168 76 -192 L 96 -190 C 66 -160 56 -110 66 -46 Z";
const SOLE = "M 2 -14 Q 0 -48 30 -50 L 478 -50 Q 528 -50 534 -22 Q 536 0 506 0 L 22 0 Q 2 0 2 -14 Z";
const TOE = "M 430 -50 C 444 -92 506 -86 532 -48 Z";

type LaceState = { readonly tie: number; readonly pull: number; readonly color: string; readonly jx: number; readonly jy: number; readonly jr: number };

const Laces: React.FC<LaceState & { readonly side: number }> = ({ tie, pull, color, jx, jy, jr, side }) => {
  // крест-накрест между люверсами
  const segs: React.ReactNode[] = [];
  for (let i = 0; i < EYE.length - 1; i++) {
    const a = EYE[i];
    const b = EYE[i + 1];
    segs.push(<line key={`a${i}`} x1={a.x - 8} y1={a.y - 12} x2={b.x + 8} y2={b.y + 6} />);
    segs.push(<line key={`b${i}`} x1={a.x + 8} y1={a.y + 6} x2={b.x - 8} y2={b.y - 12} />);
  }
  const k = KNOT;
  // петли банта растут с tie; концы: с пола (tie 0) — коротко у узла (tie 1)
  const loop = clamp((tie - 0.35) / 0.65);
  const endL = { x: lerp(-90, k.x - 40, tie), y: lerp(10, k.y + 70, tie) };
  const endR = { x: lerp(300, k.x + 40, tie), y: lerp(14, k.y + 74, tie) };
  // вытягивание концов (сцена маршрута)
  const pl = { x: lerp(endL.x, k.x - 70, pull), y: lerp(endL.y, k.y - 160, pull) };
  const pr = { x: lerp(endR.x, k.x + 120, pull), y: lerp(endR.y, k.y - 150, pull) };
  const sag = (1 - tie) * 60 * (1 - pull);
  return (
    <g transform={`translate(${jx} ${jy}) rotate(${jr} ${k.x} ${k.y})`} stroke={color} strokeWidth={9} strokeLinecap="round" fill="none">
      {segs}
      {/* концы шнурков */}
      <path d={`M ${k.x - 4} ${k.y + 4} Q ${lerp(k.x - 60, pl.x, 0.5)} ${lerp(k.y + 20, pl.y, 0.5) + sag} ${pl.x} ${pl.y}`} />
      <path d={`M ${k.x + 4} ${k.y + 4} Q ${lerp(k.x + 80, pr.x, 0.5) + side * 6} ${lerp(k.y + 30, pr.y, 0.5) + sag} ${pr.x} ${pr.y}`} />
      {/* петли банта */}
      {loop > 0.01 ? (
        <>
          <ellipse cx={k.x - 34 * loop} cy={k.y - 14 * loop} rx={36 * loop} ry={18 * loop} transform={`rotate(-24 ${k.x - 34 * loop} ${k.y - 14 * loop})`} />
          <ellipse cx={k.x + 34 * loop} cy={k.y - 12 * loop} rx={36 * loop} ry={18 * loop} transform={`rotate(20 ${k.x + 34 * loop} ${k.y - 12 * loop})`} />
        </>
      ) : null}
      <circle cx={k.x} cy={k.y} r={9} fill={color} stroke="none" />
    </g>
  );
};

const Shoe: React.FC<LaceState & { readonly legs?: string; readonly dim?: number; readonly side: number }> = ({ legs, dim = 0, ...lace }) => (
  <g>
    {legs ? (
      <g>
        {/* штанина и белый носок над кроссовком */}
        <rect x={86} y={-900} width={120} height={720} fill={legs} />
        <rect x={86} y={-900} width={30} height={720} fill="rgba(0,0,0,0.08)" />
        <rect x={92} y={-214} width={108} height={30} rx={10} fill="#F4F5F8" />
      </g>
    ) : null}
    <path d={SOLE} fill={C.sole} stroke="#D3D9E2" strokeWidth={4} />
    <path d="M 14 -24 L 528 -24" stroke="#E3E7EE" strokeWidth={5} />
    <path d={UPPER} fill={C.sneaker} />
    <path d={HEEL} fill={C.sneakerShade} />
    <path d={TOE} fill={C.sole} stroke="#D3D9E2" strokeWidth={3} />
    {/* язычок, кант воротника, белая полоска сбоку (без чужих логотипов) */}
    <path d="M 228 -184 L 298 -218 C 318 -226 338 -210 332 -192 L 300 -168 Z" fill={C.sneakerShade} opacity={0.55} />
    <path d="M 76 -192 L 150 -200 C 172 -176 204 -170 228 -184" stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.85} />
    <path d="M 120 -86 C 220 -96 320 -80 420 -66" stroke="#FFFFFF" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.9} />
    {EYE.map((e, i) => (
      <circle key={i} cx={e.x} cy={e.y} r={9} fill="#7E1015" stroke="#F3F3F3" strokeWidth={4} />
    ))}
    <Laces {...lace} />
    {/* блик */}
    <path d="M 330 -176 C 380 -140 430 -110 480 -96" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.28} />
    {dim > 0 ? <path d={UPPER} fill="#000" opacity={dim} /> : null}
  </g>
);

export const Sneakers: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s: number;
  readonly f: number;
  readonly tie: number;
  readonly pull?: number;
  readonly laceColor?: string;
  readonly legs?: string;
  readonly jitter?: number; // сила дрожания стоп-моушн (0 — без)
  readonly bounce?: number; // подскок пары (px кадра)
}> = ({ x, y, s, f, tie, pull = 0, laceColor = "#FFFFFF", legs, jitter = 1, bounce = 0 }) => {
  const sf = stopFrame(f);
  const n = sf / STOP_STEP;
  const j = (k: number) => (hash01(n * 3.1 + k) - 0.5) * 2 * jitter;
  const lace = (seed: number): LaceState => ({ tie, pull, color: laceColor, jx: j(seed) * 3, jy: j(seed + 1) * 3, jr: j(seed + 2) * 1.2 });
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <g transform={`translate(${x} ${y - bounce}) scale(${s})`}>
        <ellipse cx={330} cy={6} rx={380} ry={26} fill="rgba(20,30,60,0.16)" />
        <g transform="translate(150 -40) scale(0.94)">
          <Shoe {...lace(7)} legs={legs} dim={0.12} side={-1} />
        </g>
        <Shoe {...lace(1)} legs={legs} side={1} />
      </g>
    </svg>
  );
};

// Точка узла банта переднего кроссовка в координатах кадра.
export const knotAt = (x: number, y: number, s: number): Vec => ({ x: x + KNOT.x * s, y: y + KNOT.y * s });
// Концы вытянутых шнурков (pull = 1) в координатах кадра.
export const laceTips = (x: number, y: number, s: number) => ({
  l: { x: x + (KNOT.x - 70) * s, y: y + (KNOT.y - 160) * s },
  r: { x: x + (KNOT.x + 120) * s, y: y + (KNOT.y - 150) * s },
});

// Плавное «стоп-моушн» значение: ступеньки по STOP_STEP кадров.
export const stopKeys = (f: number, a: number, b: number) => easeInOut(clamp((stopFrame(f) - a) / Math.max(1, b - a)));
