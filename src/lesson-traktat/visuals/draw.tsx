// Рисованные предметы урока (SVG): баночки, цветы, муха, солнце, капли, книга,
// человечки, деревья, дворец и т. д. Простые формы, мягкие цвета, контур.
import React from "react";
import { C } from "../theme";

export const OL = "#3b2a10";

export const Jar: React.FC<{ x: number; y: number; color: string; level?: number; s?: number; tilt?: number }> = ({ x, y, color, level = 0.7, s = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <rect x={-26} y={-78} width={52} height={14} rx={5} fill="#c98b4a" stroke={OL} strokeWidth={4} />
    <path d="M -30 -64 L 30 -64 L 34 -50 Q 40 -40 40 -20 L 40 0 Q 40 8 32 8 L -32 8 Q -40 8 -40 0 L -40 -20 Q -40 -40 -34 -50 Z" fill="#eaf6ff" stroke={OL} strokeWidth={4} />
    <path d={`M -36 ${4 - 56 * level} L 36 ${4 - 56 * level} L 36 2 Q 36 4 32 4 L -32 4 Q -36 4 -36 2 Z`} fill={color} opacity={0.9} />
    <rect x={-22} y={-36} width={44} height={20} rx={4} fill="#fff" opacity={0.9} />
    <path d="M -28 -48 Q -32 -30 -28 -10" stroke="#fff" strokeWidth={5} opacity={0.7} fill="none" strokeLinecap="round" />
  </g>
);

export const Flower: React.FC<{ x: number; y: number; color: string; s?: number; stem?: number; kind?: number; t?: number }> = ({ x, y, color, s = 1, stem = 120, kind = 0, t = 0 }) => {
  const sway = Math.sin(t * 1.6 + x * 0.01) * 4;
  const petals = kind === 1 ? 8 : kind === 2 ? 5 : 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M 0 0 Q ${sway} ${-stem / 2} ${sway * 1.5} ${-stem}`} stroke={C.greenDeep} strokeWidth={8} fill="none" strokeLinecap="round" />
      <ellipse cx={14} cy={-stem * 0.45} rx={22} ry={10} fill={C.green} transform={`rotate(-30 14 ${-stem * 0.45})`} />
      <g transform={`translate(${sway * 1.5} ${-stem}) rotate(${t * 6})`}>
        {Array.from({ length: petals }).map((_, i) => (
          <ellipse key={i} cx={0} cy={kind === 2 ? -26 : -22} rx={kind === 1 ? 10 : 16} ry={kind === 2 ? 26 : 22} fill={color} stroke={OL} strokeWidth={3} transform={`rotate(${(360 / petals) * i})`} />
        ))}
        <circle r={14} fill={C.yellow} stroke={OL} strokeWidth={3} />
      </g>
    </g>
  );
};

export const Fly: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const flap = Math.sin(t * 40) * 12;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={-28} cy={-34} rx={34} ry={18} fill="#d8f0ff" stroke={OL} strokeWidth={3} opacity={0.85} transform={`rotate(${-30 + flap} -10 -20)`} />
      <ellipse cx={28} cy={-34} rx={34} ry={18} fill="#d8f0ff" stroke={OL} strokeWidth={3} opacity={0.85} transform={`rotate(${30 - flap} 10 -20)`} />
      <ellipse cx={0} cy={6} rx={22} ry={34} fill="#4b5563" stroke={OL} strokeWidth={3} />
      <path d="M -18 0 L 18 0 M -18 14 L 18 14" stroke="#6b7280" strokeWidth={4} />
      <circle cx={0} cy={-34} r={20} fill="#4b5563" stroke={OL} strokeWidth={3} />
      <circle cx={-12} cy={-40} r={11} fill="#b91c1c" stroke={OL} strokeWidth={2} />
      <circle cx={12} cy={-40} r={11} fill="#b91c1c" stroke={OL} strokeWidth={2} />
      <circle cx={-9} cy={-43} r={3} fill="#fff" />
      <circle cx={15} cy={-43} r={3} fill="#fff" />
      {[-1, 1].map((d) => (
        <g key={d} stroke={OL} strokeWidth={3} fill="none">
          <path d={`M ${d * 18} 0 L ${d * 38} 18 L ${d * 42} 40`} />
          <path d={`M ${d * 16} 18 L ${d * 32} 40 L ${d * 34} 58`} />
        </g>
      ))}
    </g>
  );
};

export const Sun: React.FC<{ x: number; y: number; r?: number; t: number; face?: boolean }> = ({ x, y, r = 80, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <g transform={`rotate(${t * 10})`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d={`M ${-r * 0.16} ${-r * 1.12} L 0 ${-r * 1.5} L ${r * 0.16} ${-r * 1.12} Z`} fill={C.yellowDeep} transform={`rotate(${i * 30})`} />
      ))}
    </g>
    <circle r={r} fill={C.yellow} stroke={C.yellowDeep} strokeWidth={6} />
    <circle cx={-r * 0.3} cy={-r * 0.3} r={r * 0.25} fill="#fff" opacity={0.35} />
  </g>
);

export const Book: React.FC<{ x: number; y: number; s?: number; color?: string; title?: string; open?: number }> = ({ x, y, s = 1, color = C.skyDeep, title }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-150} width={220} height={300} rx={14} fill={color} stroke={OL} strokeWidth={5} />
    <rect x={-96} y={-150} width={12} height={300} fill="#000" opacity={0.15} />
    <rect x={-70} y={-110} width={150} height={90} rx={10} fill="#fff" opacity={0.92} />
    {title &&
      title.split("\n").map((l, i) => (
        <text key={i} x={5} y={-78 + i * 32} textAnchor="middle" fontFamily="Nunito" fontWeight={900} fontSize={26} fill={C.ink}>
          {l}
        </text>
      ))}
    <path d="M -60 40 L 70 40 M -60 70 L 70 70 M -60 100 L 40 100" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
  </g>
);

// простой человечек (без конкретной личности), вид спереди
export const Person: React.FC<{ x: number; y: number; s?: number; color?: string; hat?: boolean; t?: number; arms?: number; skin?: string; sad?: boolean }> = ({
  x,
  y,
  s = 1,
  color = C.coral,
  hat,
  t = 0,
  arms = 0,
  skin = "#f2c79b",
  sad,
}) => {
  const bob = Math.sin(t * 3 + x) * 2;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <path d="M -14 -10 L -18 30 M 14 -10 L 18 30" stroke={OL} strokeWidth={9} strokeLinecap="round" />
      <path d={`M -26 -60 L ${-50} ${-30 - arms * 40} M 26 -60 L 50 ${-30 - arms * 40}`} stroke={OL} strokeWidth={9} strokeLinecap="round" />
      <rect x={-30} y={-80} width={60} height={76} rx={22} fill={color} stroke={OL} strokeWidth={4} />
      <circle cx={0} cy={-110} r={30} fill={skin} stroke={OL} strokeWidth={4} />
      <circle cx={-10} cy={-114} r={4} fill={OL} />
      <circle cx={10} cy={-114} r={4} fill={OL} />
      <path d={sad ? "M -10 -96 Q 0 -104 10 -96" : "M -10 -100 Q 0 -92 10 -100"} stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />
      {hat && <path d="M -40 -128 L 40 -128 L 26 -136 Q 0 -170 -26 -136 Z" fill="#b5893f" stroke={OL} strokeWidth={4} />}
    </g>
  );
};

export const Tree: React.FC<{ x: number; y: number; s?: number; t?: number; fruits?: number; grow?: number; pine?: boolean }> = ({ x, y, s = 1, t = 0, fruits = 0, grow = 1, pine }) => {
  const g = Math.max(0.001, grow);
  if (pine)
    return (
      <g transform={`translate(${x} ${y}) scale(${s * g})`}>
        <rect x={-14} y={-60} width={28} height={60} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${-120 + i * 22} ${-50 - i * 70} L 0 ${-170 - i * 70} L ${120 - i * 22} ${-50 - i * 70} Z`} fill={i % 2 ? "#2f9e6a" : "#23895a"} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        ))}
      </g>
    );
  const sway = Math.sin(t * 1.2) * 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * g})`}>
      <path d="M -18 0 Q -10 -80 -14 -150 L 14 -150 Q 10 -80 18 0 Z" fill="#8a5a2b" stroke={OL} strokeWidth={4} />
      <g transform={`rotate(${sway} 0 -150)`}>
        <circle cx={-70} cy={-190} r={70} fill="#3fb67c" stroke={OL} strokeWidth={4} />
        <circle cx={70} cy={-190} r={70} fill="#3fb67c" stroke={OL} strokeWidth={4} />
        <circle cx={0} cy={-250} r={85} fill="#4cc489" stroke={OL} strokeWidth={4} />
        {Array.from({ length: fruits }).map((_, i) => {
          const a = (i * 137.5 * Math.PI) / 180;
          const rr = 30 + ((i * 41) % 90);
          return <circle key={i} cx={Math.cos(a) * rr * 1.2} cy={-210 + Math.sin(a) * rr * 0.75} r={13} fill={C.red} stroke={OL} strokeWidth={3} />;
        })}
      </g>
    </g>
  );
};

export const Drop: React.FC<{ x: number; y: number; s?: number; glint?: number }> = ({ x, y, s = 1, glint = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -40 Q 30 0 26 18 Q 20 40 0 40 Q -20 40 -26 18 Q -30 0 0 -40 Z" fill="#9ad8ff" stroke={C.skyDeep} strokeWidth={4} />
    <circle cx={4} cy={14} r={9 * glint} fill={C.yellow} />
    <circle cx={4} cy={14} r={15 * glint} fill={C.yellow} opacity={0.3} />
  </g>
);

export const Shard: React.FC<{ x: number; y: number; s?: number; rot?: number; glint?: number }> = ({ x, y, s = 1, rot = 0, glint = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -34 -10 L -6 -30 L 32 -14 L 22 22 L -24 26 Z" fill="#dff3ff" stroke="#7fb3d6" strokeWidth={4} />
    <circle cx={2} cy={-2} r={8 * glint} fill={C.yellow} />
    <circle cx={2} cy={-2} r={14 * glint} fill={C.yellow} opacity={0.3} />
  </g>
);

export const Seed: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse rx={18} ry={11} fill="#a0743a" stroke={OL} strokeWidth={3} />
    <path d="M 18 0 Q 50 -10 70 4 Q 50 8 18 0 Z" fill="#d9b77a" stroke={OL} strokeWidth={3} />
  </g>
);

export const Factory: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -60 0 L -60 -60 L -30 -40 L -30 -60 L 0 -40 L 0 -60 L 30 -40 L 30 -100 L 50 -100 L 50 -40 L 60 -40 L 60 0 Z" fill="#b8c4d6" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-46} y={-26} width={16} height={14} fill={C.yellow} />
    <rect x={-14} y={-26} width={16} height={14} fill={C.yellow} />
    <rect x={18} y={-26} width={16} height={14} fill={C.yellow} />
    <circle cx={40 + Math.sin(t * 2) * 6} cy={-120 - ((t * 20) % 30)} r={12} fill="#e5e7eb" opacity={0.8} />
  </g>
);

export const Soldier: React.FC<{ x: number; y: number; s?: number; t?: number; squat?: number; color?: string }> = ({ x, y, s = 1, squat = 0, color = "#3d6bd6" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g transform={`translate(0 ${squat * 26}) scale(1 ${1 - squat * 0.2})`}>
      <path d="M -10 -4 L -12 26 M 10 -4 L 12 26" stroke={OL} strokeWidth={8} strokeLinecap="round" />
      <rect x={-22} y={-60} width={44} height={58} rx={12} fill={color} stroke={OL} strokeWidth={4} />
      <path d="M -22 -50 L -34 -14 M 22 -50 L 34 -14" stroke={OL} strokeWidth={8} strokeLinecap="round" />
      <circle cx={0} cy={-80} r={20} fill="#f2c79b" stroke={OL} strokeWidth={4} />
      <path d="M -22 -88 L 22 -88 L 18 -106 L -18 -106 Z" fill="#2a4aa0" stroke={OL} strokeWidth={4} />
      <circle cx={-7} cy={-80} r={3} fill={OL} />
      <circle cx={7} cy={-80} r={3} fill={OL} />
    </g>
  </g>
);

export const Palace: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-220} y={-160} width={440} height={160} fill="#fff1d6" stroke={OL} strokeWidth={5} />
    {[-160, -80, 0, 80, 160].map((cx, i) => (
      <g key={i}>
        <rect x={cx - 18} y={-120} width={36} height={60} rx={18} fill={C.skyDeep} opacity={0.8} />
      </g>
    ))}
    <rect x={-40} y={-80} width={80} height={80} rx={40} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
    <path d="M -100 -160 Q -100 -260 0 -280 Q 100 -260 100 -160 Z" fill={C.yellow} stroke={OL} strokeWidth={5} />
    <path d="M -220 -160 Q -220 -220 -170 -230 Q -120 -220 -120 -160 Z" fill={C.coral} stroke={OL} strokeWidth={5} />
    <path d="M 120 -160 Q 120 -220 170 -230 Q 220 -220 220 -160 Z" fill={C.coral} stroke={OL} strokeWidth={5} />
    <path d="M 0 -280 L 0 -320" stroke={OL} strokeWidth={5} />
    <circle cx={0} cy={-326} r={8} fill={C.yellowDeep} />
  </g>
);

export const Heart: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = C.coral }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 18 C -40 -10 -30 -40 -12 -40 C -4 -40 0 -32 0 -28 C 0 -32 4 -40 12 -40 C 30 -40 40 -10 0 18 Z" fill={color} stroke={OL} strokeWidth={3} />
);

export const Bubble: React.FC<{ x: number; y: number; w: number; h: number; tail?: [number, number]; fill?: string }> = ({ x, y, w, h, tail, fill = "#fff" }) => (
  <g>
    {tail && <path d={`M ${x + w * 0.3} ${y + h - 4} L ${tail[0]} ${tail[1]} L ${x + w * 0.5} ${y + h - 4} Z`} fill={fill} stroke={OL} strokeWidth={4} strokeLinejoin="round" />}
    <rect x={x} y={y} width={w} height={h} rx={h * 0.35} fill={fill} stroke={OL} strokeWidth={4} />
    {tail && <rect x={x + w * 0.3 + 3} y={y + h - 10} width={w * 0.2 - 6} height={10} fill={fill} />}
  </g>
);
