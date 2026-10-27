// Руки мамы сверху (план стола): рукав кардигана из-за нижнего края кадра,
// кисть с пальцами. Простая стилизация в духе персонажей ролика.
import { C } from "../palette";

export const TopHand: React.FC<{
  readonly x: number; // кончики пальцев
  readonly y: number;
  readonly angle: number; // градусы: 0 — пальцы смотрят вверх
  readonly side?: -1 | 1; // -1 — левая рука, 1 — правая
  readonly s?: number;
  readonly pinch?: number; // 0…1 — пальцы сжаты (держит предмет)
}> = ({ x, y, angle, side = 1, s = 1, pinch = 0 }) => {
  const fingers = [-27, -9, 9, 26];
  const len = [62, 74, 70, 56];
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s * side} ${s})`}>
      {/* рукав до края кадра */}
      <path d="M-58 150 L58 150 Q72 600 96 1500 L-96 1500 Q-72 600 -58 150 Z" fill={C.momTop} />
      <path d="M-30 200 Q-40 700 -56 1500" stroke={C.momTopShade} strokeWidth={10} fill="none" opacity={0.6} />
      <rect x={-64} y={140} width={128} height={40} rx={16} fill={C.momTopShade} />
      {/* ладонь */}
      <path d="M-52 60 Q-58 140 -40 168 L40 168 Q58 140 54 58 Q30 30 0 30 Q-30 30 -52 60 Z" fill={C.skin} />
      {fingers.map((fx, i) => (
        <rect key={i} x={fx - 10} y={70 - len[i] * (1 - pinch * 0.35)} width={20} height={len[i] * (1 - pinch * 0.35) + 10} rx={10} fill={C.skin} />
      ))}
      {/* большой палец */}
      <rect x={-78} y={86} width={20} height={64} rx={10} fill={C.skinShade} transform={`rotate(${-38 + pinch * 24} -62 140)`} />
      <path d="M-40 150 Q0 160 40 150" stroke={C.skinShade} strokeWidth={4} fill="none" opacity={0.6} />
    </g>
  );
};
