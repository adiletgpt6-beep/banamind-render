// Стол сверху (крупные планы листа, рук, макета): тёплое дерево с
// досками и волокнами, свет из окна слева сверху — мягкий градиент.
import { C } from "../kit";

export const Desk: React.FC<{ readonly w?: number; readonly h?: number; readonly evening?: number }> = ({ w = 1080, h = 1920, evening = 0 }) => (
  <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
    <defs>
      <linearGradient id="desk-light" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={evening ? "#C9935E" : "#D7A570"} />
        <stop offset="100%" stopColor={evening ? "#9E6D43" : "#B9824F"} />
      </linearGradient>
    </defs>
    <rect width={w} height={h} fill="url(#desk-light)" />
    {Array.from({ length: Math.ceil(w / 230) + 1 }, (_, i) => (
      <g key={i}>
        <rect x={i * 230 - 2} y={0} width={4} height={h} fill={C.woodDark} opacity={0.35} />
        {Array.from({ length: 7 }, (_, k) => (
          <path
            key={k}
            d={`M ${i * 230 + 30 + k * 28} 0 C ${i * 230 + 50 + k * 28} ${h * 0.3} ${i * 230 + 10 + k * 28} ${h * 0.6} ${i * 230 + 34 + k * 28} ${h}`}
            stroke={C.woodDark}
            strokeOpacity={0.08 + (k % 3) * 0.03}
            strokeWidth={2}
            fill="none"
          />
        ))}
      </g>
    ))}
    <rect width={w} height={h} fill="url(#desk-vig)" />
    <radialGradient id="desk-vig" cx="40%" cy="35%" r="80%">
      <stop offset="0%" stopColor="rgba(255,240,210,0.18)" />
      <stop offset="100%" stopColor="rgba(40,20,10,0.25)" />
    </radialGradient>
  </svg>
);
