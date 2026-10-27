// Окно снаружи: Мухаммад и три героя смотрят на дерево и горы (камера —
// со стороны сада, поэтому видны лица). Рама — та же арка, что в комнате.
import React from "react";
import { Character } from "../rig/Character";
import { OUTLINE } from "../rig/looks";

const f = (n: number) => n.toFixed(1);
export const EXT_WIN = { x: 430, y: 40, w: 1060, sill: 800 } as const;

export type ExtChar = { id: string; node: React.ComponentProps<typeof Character> };

export const ExteriorSet: React.FC<{ chars: React.ComponentProps<typeof Character>[]; t: number }> = ({ chars, t }) => {
  const { x, y, w, sill } = EXT_WIN;
  const r = w / 2;
  const arch = `M ${f(x)} ${f(sill)} L ${f(x)} ${f(y + r)} A ${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)} L ${f(x + w)} ${f(sill)} Z`;
  const sway = Math.sin(t * 0.8) * 3;
  return (
    <g>
      <defs>
        <clipPath id="ext-win">
          <path d={arch} />
        </clipPath>
        <linearGradient id="ext-inside" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9dcc4" />
          <stop offset="1" stopColor="#d8c7a8" />
        </linearGradient>
      </defs>
      {/* наружная стена */}
      <rect x={0} y={0} width={1920} height={1080} fill="#efe3cf" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M 0 ${120 * i + 40} H 1920`} stroke="#e6d7bf" strokeWidth={3} />
      ))}
      {/* комната за стеклом */}
      <g clipPath="url(#ext-win)">
        <rect x={x} y={y} width={w} height={sill - y} fill="url(#ext-inside)" />
        <rect x={x + 60} y={y + 380} width={64} height={420} fill="#3f78a8" opacity={0.5} />
        <rect x={x + w - 330} y={y + 300} width={260} height={500} fill="#a87a50" opacity={0.55} />
        <ellipse cx={x + 220} cy={y + 300} rx={90} ry={120} fill="#ffe2a0" opacity={0.25} />
        {chars.map((c) => (
          <Character key={c.uid} {...c} shadow={false} />
        ))}
        {/* стекло: лёгкий холодный оттенок и отражения */}
        <rect x={x} y={y} width={w} height={sill - y} fill="#cfe6f2" opacity={0.12} />
        <path d={`M ${x + 80} ${sill} L ${x + 380} ${y + 120} L ${x + 440} ${y + 120} L ${x + 140} ${sill} Z`} fill="#ffffff" opacity={0.08} />
        <path d={`M ${x + 600} ${sill} L ${x + 860} ${y + 220} L ${x + 890} ${y + 220} L ${x + 630} ${sill} Z`} fill="#ffffff" opacity={0.06} />
      </g>
      {/* рама */}
      <path d={arch} fill="none" stroke="#c9a676" strokeWidth={34} />
      <path d={arch} fill="none" stroke={OUTLINE} strokeWidth={3} />
      <line x1={f(x + w / 2)} y1={f(y + 24)} x2={f(x + w / 2)} y2={f(sill)} stroke="#c9a676" strokeWidth={14} opacity={0.0} />
      {/* наружный откос и подоконник */}
      <rect x={x - 60} y={sill} width={w + 120} height={46} rx={8} fill="#e2c799" stroke={OUTLINE} strokeWidth={3} />
      <rect x={0} y={sill + 46} width={1920} height={1080 - sill - 46} fill="#e9dcc6" />
      <rect x={0} y={sill + 46} width={1920} height={16} fill="#d8c6a6" />
      {/* куст под окном */}
      <g transform={`translate(0 ${f(sway * 0.3)})`}>
        {[
          [200, 1000, 150],
          [360, 980, 130],
          [1560, 990, 160],
          [1740, 1010, 140],
          [1000, 1060, 120],
          [820, 1070, 110],
        ].map(([cx, cy, rr], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={rr + 3} fill={OUTLINE} />
            <circle cx={cx} cy={cy} r={rr} fill={i % 2 ? "#5f9466" : "#4f8a5b"} />
            <circle cx={cx - rr * 0.3} cy={cy - rr * 0.35} r={rr * 0.45} fill="#79b47d" opacity={0.7} />
          </g>
        ))}
      </g>
    </g>
  );
};
