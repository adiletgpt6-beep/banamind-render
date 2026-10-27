// Детский рисунок дочки — ЕДИНЫЙ ассет для всех кадров (в руках дочки,
// крупный план, рядом с монитором): та же бумага, те же неровные линии.
// Мама за большим столом (каре и бирюзовый кардиган, как у Айжан),
// рядом несколько людей, на нарисованной двери — имя «Айжан» (из
// UL2_LETTER.heroine). Линии восковых мелков с детерминированной
// неровностью: детали не перерисовываются между кадрами.
import { fontFamily } from "../../fonts";
import { hash01 } from "../rig/motion";
import { UL2_LETTER } from "../script";

export const DRAWING_W = 600;
export const DRAWING_H = 440;

// Неровная линия мелка через точки (детерминированный «дрожащий» путь).
const wob = (pts: readonly (readonly [number, number])[], seed: number, amp = 3, closed = false) => {
  const out: string[] = [];
  const all = closed ? [...pts, pts[0]] : pts;
  for (let i = 0; i < all.length; i++) {
    const [x, y] = all[i];
    const jx = (hash01(seed * 7.1 + i * 3.3) - 0.5) * amp * 2;
    const jy = (hash01(seed * 5.7 + i * 9.1) - 0.5) * amp * 2;
    if (i === 0) out.push(`M ${x + jx} ${y + jy}`);
    else {
      const [px, py] = all[i - 1];
      const mx = (px + x) / 2 + (hash01(seed * 2.9 + i * 1.7) - 0.5) * amp * 3;
      const my = (py + y) / 2 + (hash01(seed * 4.3 + i * 2.1) - 0.5) * amp * 3;
      out.push(`Q ${mx} ${my} ${x + jx} ${y + jy}`);
    }
  }
  return out.join(" ");
};
// Неровный круг.
const blob = (cx: number, cy: number, r: number, seed: number, n = 9) =>
  wob(
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (0.94 + 0.12 * hash01(seed + i * 1.37));
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as const;
    }),
    seed,
    1.5,
    true,
  );
// Штриховка мелком внутри прямоугольника (зигзаг).
const scribble = (x: number, y: number, w: number, h: number, seed: number, step = 11) => {
  const pts: [number, number][] = [];
  for (let i = 0, yy = y; yy <= y + h; i++, yy += step) pts.push(i % 2 ? [x + w, yy + 4] : [x, yy]);
  return wob(pts, seed, 2.5);
};

const Person: React.FC<{ x: number; y: number; s: number; shirt: string; hair: string; seed: number; arm?: number }> = ({ x, y, s, shirt, hair, seed, arm = 0 }) => (
  <g>
    {/* тело-трапеция */}
    <path d={wob([[x - 26 * s, y + 92 * s], [x - 16 * s, y + 30 * s], [x + 16 * s, y + 30 * s], [x + 26 * s, y + 92 * s]], seed, 2, true)} fill={shirt} fillOpacity={0.55} stroke={shirt} strokeWidth={5} strokeLinejoin="round" />
    {/* руки */}
    <path d={wob([[x - 16 * s, y + 40 * s], [x - 40 * s, y + (58 - arm * 30) * s]], seed + 1, 2)} stroke={shirt} strokeWidth={5} fill="none" strokeLinecap="round" />
    <path d={wob([[x + 16 * s, y + 40 * s], [x + 40 * s, y + 58 * s]], seed + 2, 2)} stroke={shirt} strokeWidth={5} fill="none" strokeLinecap="round" />
    {/* ноги */}
    <path d={wob([[x - 10 * s, y + 92 * s], [x - 12 * s, y + 128 * s]], seed + 3, 1.5)} stroke="#4A4E69" strokeWidth={5} fill="none" strokeLinecap="round" />
    <path d={wob([[x + 10 * s, y + 92 * s], [x + 12 * s, y + 128 * s]], seed + 4, 1.5)} stroke="#4A4E69" strokeWidth={5} fill="none" strokeLinecap="round" />
    {/* голова */}
    <path d={blob(x, y + 4 * s, 22 * s, seed + 5)} fill="#F6CFA9" stroke="#C98F62" strokeWidth={3.5} />
    <path d={wob([[x - 20 * s, y - 2 * s], [x - 8 * s, y - 20 * s], [x + 10 * s, y - 20 * s], [x + 21 * s, y - 2 * s]], seed + 6, 2)} stroke={hair} strokeWidth={7} fill="none" strokeLinecap="round" />
    <circle cx={x - 7 * s} cy={y + 2 * s} r={2.6} fill="#2A2A2A" />
    <circle cx={x + 7 * s} cy={y + 2 * s} r={2.6} fill="#2A2A2A" />
    <path d={`M ${x - 8 * s} ${y + 12 * s} Q ${x} ${y + 19 * s} ${x + 8 * s} ${y + 12 * s}`} stroke="#C2453C" strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);

export const ChildDrawing: React.FC<{ readonly width: number; readonly style?: React.CSSProperties; readonly shadow?: boolean }> = ({ width, style, shadow = true }) => {
  const k = width / DRAWING_W;
  return (
    <svg width={width} height={DRAWING_H * k} viewBox={`0 0 ${DRAWING_W} ${DRAWING_H}`} style={{ overflow: "visible", ...style }}>
      {shadow ? <rect x={6} y={9} width={DRAWING_W} height={DRAWING_H} rx={6} fill="rgba(30,20,10,0.22)" /> : null}
      {/* бумага */}
      <rect x={0} y={0} width={DRAWING_W} height={DRAWING_H} rx={6} fill="#FFFDF5" />
      <rect x={0} y={0} width={DRAWING_W} height={DRAWING_H} rx={6} fill="none" stroke="#EDE6D3" strokeWidth={3} />
      {/* солнце */}
      <path d={blob(62, 58, 30, 3)} fill="#FFD33D" fillOpacity={0.8} stroke="#F2B705" strokeWidth={4} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <path key={i} d={wob([[62 + Math.cos(a) * 40, 58 + Math.sin(a) * 40], [62 + Math.cos(a) * 54, 58 + Math.sin(a) * 54]], 20 + i, 1.5)} stroke="#F2B705" strokeWidth={4} strokeLinecap="round" />;
      })}
      {/* дверь с именем */}
      <path d={wob([[488, 392], [488, 116], [584, 116], [584, 392]], 41, 2.5)} fill="#C98B5A" fillOpacity={0.5} stroke="#8A5A36" strokeWidth={5} strokeLinejoin="round" />
      <circle cx={570} cy={270} r={5} fill="#8A5A36" />
      <path d={wob([[494, 140], [578, 138], [579, 178], [495, 180]], 43, 1.5, true)} fill="#FFFFFF" stroke="#C2453C" strokeWidth={3.5} />
      <text x={536} y={168} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={25} fill="#C2453C" transform="rotate(-3 536 160)">
        {UL2_LETTER.heroine}
      </text>
      {/* люди рядом */}
      <Person x={70} y={210} s={1} shirt="#F08A3C" hair="#5A3A2A" seed={51} arm={1} />
      <Person x={168} y={150} s={0.86} shirt="#4F8FE0" hair="#2A2A2A" seed={61} />
      <Person x={436} y={196} s={0.96} shirt="#9B6BD6" hair="#3A2A1A" seed={71} />
      {/* мама за большим столом: каре, бирюзовый кардиган */}
      <path d={wob([[236, 280], [248, 196], [312, 196], [324, 280]], 81, 2, true)} fill="#2F9C93" fillOpacity={0.6} stroke="#24817A" strokeWidth={6} strokeLinejoin="round" />
      <path d={wob([[250, 206], [214, 240]], 82, 2)} stroke="#24817A" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={wob([[310, 206], [350, 232]], 83, 2)} stroke="#24817A" strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* каре до плеч */}
      <path d={wob([[244, 192], [240, 150], [256, 124], [304, 124], [320, 150], [316, 192]], 84, 2)} fill="#2A201D" stroke="#2A201D" strokeWidth={6} strokeLinejoin="round" />
      <path d={blob(280, 160, 27, 85)} fill="#F6CFA9" stroke="#C98F62" strokeWidth={3.5} />
      <path d={wob([[254, 146], [270, 132], [298, 132], [308, 146]], 86, 1.5)} stroke="#2A201D" strokeWidth={9} fill="none" strokeLinecap="round" />
      <circle cx={271} cy={160} r={3} fill="#2A2A2A" />
      <circle cx={290} cy={160} r={3} fill="#2A2A2A" />
      <path d={`M 268 172 Q 280 182 293 172`} stroke="#C2453C" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      {/* большой стол */}
      <path d={scribble(128, 272, 300, 26, 91, 9)} stroke="#B07A45" strokeWidth={4} fill="none" opacity={0.7} />
      <path d={wob([[118, 270], [440, 268], [436, 300], [122, 302]], 92, 2.5, true)} fill="none" stroke="#8A5A36" strokeWidth={6} strokeLinejoin="round" />
      <path d={wob([[140, 302], [138, 380]], 93, 2)} stroke="#8A5A36" strokeWidth={6} strokeLinecap="round" />
      <path d={wob([[418, 300], [420, 380]], 94, 2)} stroke="#8A5A36" strokeWidth={6} strokeLinecap="round" />
      {/* бумаги на столе */}
      <path d={wob([[300, 262], [340, 258], [342, 270], [302, 272]], 95, 1.2, true)} fill="#FFFFFF" stroke="#7FB8F0" strokeWidth={3} />
      {/* земля */}
      <path d={wob([[16, 396], [150, 392], [300, 398], [450, 392], [586, 396]], 99, 2.5)} stroke="#6BBF59" strokeWidth={6} fill="none" strokeLinecap="round" />
    </svg>
  );
};
