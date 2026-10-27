// Плюшевый зайчик дочки (одна игрушка на весь фильм): в руке (rig/Hand.tsx,
// предмет "bunny") и как предмет в мире (лежит на ковре/диване).
import { box } from "../kit";
import { BUNNY } from "./bookStyle";

// Зайчик в SVG-координатах: центр (0, 0), высота ≈ 100·s (с ушами).
export const BunnyArt: React.FC<{ readonly s: number }> = ({ s }) => (
  <g transform={`scale(${s})`}>
    {/* уши */}
    <g transform="rotate(-12 -10 -22)">
      <ellipse cx={-12} cy={-44} rx={8} ry={22} fill={BUNNY.body} />
      <ellipse cx={-12} cy={-44} rx={4} ry={16} fill={BUNNY.ear} />
    </g>
    <g transform="rotate(14 10 -22)">
      <ellipse cx={12} cy={-42} rx={8} ry={21} fill={BUNNY.body} />
      <ellipse cx={12} cy={-42} rx={4} ry={15} fill={BUNNY.ear} />
    </g>
    {/* туловище и лапки */}
    <ellipse cx={0} cy={26} rx={22} ry={24} fill={BUNNY.body} />
    <ellipse cx={8} cy={30} rx={14} ry={18} fill={BUNNY.shade} opacity={0.45} />
    <ellipse cx={-13} cy={46} rx={9} ry={6} fill={BUNNY.body} />
    <ellipse cx={13} cy={46} rx={9} ry={6} fill={BUNNY.body} />
    <ellipse cx={-20} cy={20} rx={6} ry={10} fill={BUNNY.body} transform="rotate(20 -20 20)" />
    <ellipse cx={20} cy={20} rx={6} ry={10} fill={BUNNY.body} transform="rotate(-20 20 20)" />
    {/* голова */}
    <circle cx={0} cy={-6} r={20} fill={BUNNY.body} />
    <ellipse cx={6} cy={-2} rx={12} ry={14} fill={BUNNY.shade} opacity={0.3} />
    <circle cx={-7} cy={-9} r={2.4} fill={BUNNY.eye} />
    <circle cx={7} cy={-9} r={2.4} fill={BUNNY.eye} />
    <ellipse cx={0} cy={-2} rx={3} ry={2.2} fill={BUNNY.nose} />
    <path d="M -4 2 Q 0 6 4 2" stroke={BUNNY.nose} strokeWidth={1.4} fill="none" strokeLinecap="round" />
    <ellipse cx={-12} cy={0} rx={4} ry={2.6} fill={BUNNY.ear} opacity={0.6} />
    <ellipse cx={12} cy={0} rx={4} ry={2.6} fill={BUNNY.ear} opacity={0.6} />
  </g>
);

// Зайчик в мире (px мира): лежит или сидит на поверхности; y — точка опоры.
export const BunnyProp: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${y - 52 * s}) rotate(${rot})`}>
      <ellipse cx={0} cy={52 * s} rx={26 * s} ry={6 * s} fill="rgba(40,30,30,0.14)" />
      <BunnyArt s={s} />
    </g>
  </svg>
);
