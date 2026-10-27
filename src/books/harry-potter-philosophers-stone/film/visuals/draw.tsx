// Детали собственного 2D-стиля BanaMind для BM-031 (чистый вектор, ровный контур,
// без размытия и растров): ярлыки, карточки, нити.
import React from "react";
import { C, FONT } from "../theme";

export const OL = "#1f2240"; // контур

// ── Подпись-ярлык ──
export const Label: React.FC<{ x: number; y: number; text: string; size?: number; bg?: string; color?: string; opacity?: number; border?: string }> = ({ x, y, text, size: s0 = 34, bg = C.paper, color = C.ink, opacity = 1, border = OL }) => {
  const size = s0 * 1.1;
  const w = text.length * size * 0.56 + size * 1.1;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect x={-w / 2 + 4} y={-size * 0.95 + 6} width={w} height={size * 1.6} rx={size * 0.5} fill="#000" opacity={0.16} />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.5} fill={bg} stroke={border} strokeWidth={3} />
      <text x={0} y={size * 0.12} fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

// ── Карточка с текстом (несколько строк) ──
export const Card: React.FC<{ x: number; y: number; w: number; h: number; lines: string[]; size?: number; fill?: string; color?: string; edge?: string; title?: string; titleColor?: string; rot?: number }> = ({
  x, y, w, h, lines, size = 40, fill = C.paper, color = C.ink, edge, title, titleColor = C.inkSoft, rot = 0,
}) => {
  // текст всегда помещается в карточку: размер уменьшается по самой длинной строке
  const longest = Math.max(...lines.map((l) => l.length));
  size = Math.min(size, (w - 56) / (longest * 0.56), ((h - (title ? 50 : 24)) / (lines.length * 1.18)) * 0.95);
  return (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={28} fill="#000" opacity={0.16} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={fill} stroke={OL} strokeWidth={4} />
    {edge && <rect x={-w / 2} y={-h / 2} width={18} height={h} rx={9} fill={edge} />}
    {title && (
      <text x={0} y={-h / 2 + 40} fontFamily={FONT} fontWeight={800} fontSize={26} fill={titleColor} textAnchor="middle">
        {title}
      </text>
    )}
    <text x={0} y={(title ? size * 0.5 : 0) - ((lines.length - 1) * size * 1.18) / 2 + size * 0.35} fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} textAnchor="middle">
      {lines.map((l, i) => (
        <tspan key={i} x={0} dy={i === 0 ? 0 : size * 1.18}>
          {l}
        </tspan>
      ))}
    </text>
  </g>
  );
};

export const Thread: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; w?: number; color?: string; sag?: number }> = ({ x1, y1, x2, y2, k, w = 6, color = C.brass, sag = 60 }) => {
  if (k <= 0) return null;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + sag;
  const len = Math.hypot(x2 - x1, y2 - y1) * 1.2 + sag;
  return (
    <g>
      <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} fill="none" stroke={OL} strokeWidth={w + 5} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - Math.min(1, k))} />
      <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - Math.min(1, k))} />
    </g>
  );
};

// ── Знак вопроса в круге ──
