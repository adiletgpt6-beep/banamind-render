// Реквизит мини-историй BM-025 — чистый вектор с ровным контуром (без растров и
// размытия): каска, самолёт, канистра, кровать, свинья, монеты, розы, рыба, удочка,
// лист бумаги, ящик стола, телефон, костёр, баночки, мел, карточки.
import React from "react";
import { C, DISPLAY, FONT } from "../theme";
import { LOOKS, OL, type Who } from "./draw";

// верх головы персонажа Person (локальная опора — ступни) для его масштаба s
export const headTop = (who: Who, s: number) => {
  const H = LOOKS[who].h ?? 1;
  return -(150 * H + 175 * H + 42 + 50) * s * 1.15;
};

export const Helmet: React.FC<{ x: number; y: number; s?: number; color?: string; rot?: number }> = ({ x, y, s = 1, color = C.yellow, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -54 6 Q -54 -52 0 -54 Q 54 -52 54 6 Z" fill={color} stroke={OL} strokeWidth={5} />
    <rect x={-66} y={0} width={132} height={14} rx={7} fill={color} stroke={OL} strokeWidth={5} />
    <path d="M 0 -54 L 0 0" stroke={OL} strokeWidth={4} opacity={0.5} />
  </g>
);

export const Plane: React.FC<{ x: number; y: number; s?: number; rot?: number; dent?: number }> = ({ x, y, s = 1, rot = 0, dent = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={60} rx={230} ry={18} fill="#000" opacity={0.15} />
    <path d="M -220 0 Q -200 -40 -120 -42 L 160 -38 Q 230 -30 236 0 Q 230 26 160 30 L -120 34 Q -200 32 -220 0 Z" fill="#c9d4e6" stroke={OL} strokeWidth={5} />
    <path d="M -40 -36 L 10 -140 L 70 -140 L 50 -36 Z" fill="#9fb2d0" stroke={OL} strokeWidth={5} />
    <path d="M -40 28 L 20 110 L 70 110 L 40 28 Z" fill="#9fb2d0" stroke={OL} strokeWidth={5} />
    <path d="M -210 -6 L -250 -70 L -200 -70 L -170 -14 Z" fill="#9fb2d0" stroke={OL} strokeWidth={5} />
    <path d="M 110 -40 Q 130 -64 170 -50 L 180 -30 Z" fill="#bfe3ff" stroke={OL} strokeWidth={4} />
    <circle cx={240} cy={0} r={12} fill={OL} />
    <rect x={238} y={-56} width={8} height={112} rx={4} fill="#5a6070" />
    {dent > 0 && <path d="M -60 30 l 20 -18 l 16 14 l 22 -16" stroke={OL} strokeWidth={4} fill="none" opacity={dent} />}
  </g>
);

export const Can: React.FC<{ x: number; y: number; s?: number; color?: string; label?: string }> = ({ x, y, s = 1, color = "#e5484d", label }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-50} y={-120} width={100} height={120} rx={12} fill={color} stroke={OL} strokeWidth={5} />
    <rect x={10} y={-140} width={30} height={24} rx={6} fill="#5a6070" stroke={OL} strokeWidth={4} />
    <path d="M -50 -96 L 50 -96" stroke={OL} strokeWidth={4} opacity={0.4} />
    {label && (
      <text x={0} y={-48} fontFamily={FONT} fontWeight={900} fontSize={22} fill="#fff" textAnchor="middle">
        {label}
      </text>
    )}
  </g>
);

export const Bed: React.FC<{ x: number; y: number; s?: number; sleeper?: boolean; t?: number }> = ({ x, y, s = 1, sleeper = true, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-200} y={-140} width={30} height={140} rx={10} fill={C.wood} stroke={OL} strokeWidth={5} />
    <rect x={170} y={-90} width={30} height={90} rx={10} fill={C.wood} stroke={OL} strokeWidth={5} />
    <rect x={-190} y={-70} width={380} height={50} rx={16} fill="#f4f0ff" stroke={OL} strokeWidth={5} />
    {sleeper && (
      <g>
        <circle cx={-120} cy={-86} r={34} fill={C.skin} stroke={OL} strokeWidth={4} />
        <path d="M -150 -100 Q -120 -136 -90 -100 Q -120 -112 -150 -100 Z" fill="#6a4428" stroke={OL} strokeWidth={3} />
        <path d="M -134 -84 q 6 4 12 0 M -112 -84 q 6 4 12 0" stroke={OL} strokeWidth={3} fill="none" />
        <path d={`M -90 -96 Q 40 ${-130 + Math.sin(t * 1.2) * 4} 180 -86 L 180 -64 L -90 -64 Z`} fill="#8fb3ff" stroke={OL} strokeWidth={5} />
        <text x={-60} y={-150} fontFamily={DISPLAY} fontWeight={800} fontSize={34} fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 2)}>
          z
        </text>
      </g>
    )}
  </g>
);

export const Pig: React.FC<{ x: number; y: number; s?: number; t?: number; flip?: boolean }> = ({ x, y, s = 1, t = 0, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <ellipse cx={0} cy={6} rx={140} ry={16} fill="#000" opacity={0.14} />
    {[-80, -40, 40, 80].map((dx, i) => (
      <rect key={i} x={dx - 14} y={-50} width={28} height={56} rx={10} fill="#f2a7b5" stroke={OL} strokeWidth={4} />
    ))}
    <ellipse cx={0} cy={-90} rx={120} ry={74} fill="#f7b8c4" stroke={OL} strokeWidth={5} />
    <circle cx={110} cy={-110} r={52} fill="#f7b8c4" stroke={OL} strokeWidth={5} />
    <ellipse cx={150} cy={-104} rx={22} ry={18} fill="#f29aab" stroke={OL} strokeWidth={4} />
    <circle cx={144} cy={-104} r={4} fill={OL} />
    <circle cx={156} cy={-104} r={4} fill={OL} />
    <path d="M 100 -126 q 8 -4 16 0" stroke={OL} strokeWidth={4} fill="none" opacity={0.9} />
    <path d="M 84 -158 l -10 -30 l 26 16 Z" fill="#f29aab" stroke={OL} strokeWidth={4} />
    <path d={`M -120 -100 q -24 ${-10 + Math.sin(t * 3) * 6} -14 -30`} stroke={OL} strokeWidth={4} fill="none" />
  </g>
);

export const Ribbon: React.FC<{ x: number; y: number; s?: number; color?: string; label?: string }> = ({ x, y, s = 1, color = "#3d6fd0", label = "1" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -22 20 L -36 90 L -10 76 L 0 100 L 8 30 Z" fill={color} stroke={OL} strokeWidth={3} />
    <path d="M 22 20 L 36 90 L 10 76 L 0 100 L -8 30 Z" fill={color} stroke={OL} strokeWidth={3} />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <circle key={i} cx={Math.cos(a) * 40} cy={Math.sin(a) * 40} r={14} fill={color} stroke={OL} strokeWidth={3} />;
    })}
    <circle r={36} fill="#fff" stroke={OL} strokeWidth={4} />
    <text y={14} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={color} textAnchor="middle">
      {label}
    </text>
  </g>
);

export const Coin: React.FC<{ x: number; y: number; r?: number; fake?: number; label?: string; rot?: number }> = ({ x, y, r = 150, fake = 0, label, rot = 0 }) => {
  const gold = fake > 0.5 ? "#c9c2b0" : C.yellow;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx={8} cy={14} rx={r} ry={r} fill="#000" opacity={0.18} />
      <circle r={r} fill={fake > 0 ? "#d9cfa0" : gold} stroke={OL} strokeWidth={6} />
      <circle r={r * 0.8} fill="none" stroke={OL} strokeOpacity={0.35} strokeWidth={5} />
      {label && (
        <text y={r * 0.12} fontFamily={DISPLAY} fontWeight={800} fontSize={r * 0.28} fill={OL} textAnchor="middle">
          {label}
        </text>
      )}
      {fake > 0 && (
        <path
          d={`M ${-r * 0.1} ${-r} L ${r * 0.05} ${-r * 0.4} L ${-r * 0.2} ${-r * 0.05} L ${r * 0.1} ${r * 0.4} L ${-r * 0.05} ${r}`}
          stroke={OL}
          strokeWidth={8}
          fill="none"
          strokeLinejoin="round"
          strokeDasharray={r * 2.4}
          strokeDashoffset={r * 2.4 * (1 - Math.min(1, fake))}
        />
      )}
    </g>
  );
};

export const Rose: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 0 L 0 160" stroke="#2f8a4a" strokeWidth={8} strokeLinecap="round" />
    <path d="M 0 80 Q 30 60 46 80 Q 24 96 0 86" fill="#3fb36a" stroke={OL} strokeWidth={3} />
    <circle r={34} fill="#e5484d" stroke={OL} strokeWidth={4} />
    <path d="M -18 -4 Q 0 -26 18 -4 Q 0 14 -18 -4 Z" fill="#c22f3a" stroke={OL} strokeWidth={3} />
    <path d="M -26 8 Q 0 30 26 8" stroke={OL} strokeWidth={3} fill="none" />
  </g>
);

export const Fish: React.FC<{ x: number; y: number; s?: number; flip?: boolean; t?: number; color?: string }> = ({ x, y, s = 1, flip, t = 0, color = "#ff9f6e" }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 2) * 6}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <path d="M -90 0 Q -20 -70 70 0 Q -20 70 -90 0 Z" fill={color} stroke={OL} strokeWidth={5} />
    <path d={`M 64 0 L 120 ${-40 + Math.sin(t * 6) * 8} L 120 ${40 + Math.sin(t * 6) * 8} Z`} fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={-50} cy={-10} r={10} fill="#fff" stroke={OL} strokeWidth={3} />
    <circle cx={-52} cy={-10} r={4} fill={OL} />
    <path d="M -20 -30 Q 0 0 -20 30" stroke={OL} strokeWidth={3} fill="none" opacity={0.6} />
  </g>
);

export const Worm: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -30 0 q 15 ${-18 + Math.sin(t * 5) * 4} 30 0 q 15 ${18 - Math.sin(t * 5) * 4} 30 0`} stroke="#e08a9a" strokeWidth={16} fill="none" strokeLinecap="round" />
    <path d={`M -30 0 q 15 ${-18 + Math.sin(t * 5) * 4} 30 0 q 15 ${18 - Math.sin(t * 5) * 4} 30 0`} stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.5} />
  </g>
);

export const Strawberry: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={50} rx={110} ry={30} fill="#fff" stroke={OL} strokeWidth={5} />
    <path d="M -110 50 Q 0 130 110 50" fill="#e8f0ff" stroke={OL} strokeWidth={5} />
    {[-50, 0, 50].map((dx, i) => (
      <g key={i} transform={`translate(${dx} ${20 - (i === 1 ? 20 : 0)})`}>
        <path d="M -26 -10 Q 0 50 26 -10 Q 0 -24 -26 -10 Z" fill="#e5484d" stroke={OL} strokeWidth={4} />
        <path d="M -16 -16 L 0 -26 L 16 -16" stroke="#2f8a4a" strokeWidth={6} fill="none" strokeLinecap="round" />
        <circle cx={-6} cy={4} r={2.5} fill="#ffe08a" />
        <circle cx={8} cy={12} r={2.5} fill="#ffe08a" />
      </g>
    ))}
    <ellipse cx={0} cy={14} rx={50} ry={16} fill="#fff" opacity={0.9} />
  </g>
);

// лист бумаги со строками; ink — сколько строк «написано» (0…1)
export const Paper: React.FC<{ x: number; y: number; w?: number; h?: number; rot?: number; ink?: number; color?: string; title?: string; lines?: string[]; size?: number }> = ({ x, y, w = 300, h = 380, rot = 0, ink = 1, color = "#5e4b5c", title, lines, size = 30 }) => {
  const n = Math.floor((h - 90) / 44);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} rx={10} fill="#000" opacity={0.15} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#fffdf7" stroke={OL} strokeWidth={4} />
      {title && (
        <text x={0} y={-h / 2 + 50} fontFamily={FONT} fontWeight={900} fontSize={size} fill={OL} textAnchor="middle">
          {title}
        </text>
      )}
      {lines
        ? lines.map((l, i) => (
            <text key={i} x={-w / 2 + 30} y={-h / 2 + (title ? 110 : 60) + i * size * 1.4} fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} opacity={i < ink * lines.length ? 1 : 0}>
              {l}
            </text>
          ))
        : Array.from({ length: n }).map((_, i) => {
            const len = (w - 70) * (0.6 + 0.4 * ((i * 37) % 10) / 10);
            const k = Math.max(0, Math.min(1, ink * n - i));
            return <path key={i} d={`M ${-w / 2 + 30} ${-h / 2 + (title ? 100 : 60) + i * 44} q ${len / 4} -10 ${len / 2} 0 t ${len / 2} 0`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray={len * 1.2} strokeDashoffset={len * 1.2 * (1 - k)} />;
          })}
    </g>
  );
};

export const Drawer: React.FC<{ x: number; y: number; w?: number; open?: number }> = ({ x, y, w = 420, open = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 - 20} y={-30} width={w + 40} height={40} rx={10} fill={C.woodLight} stroke={OL} strokeWidth={5} />
    <rect x={-w / 2} y={10} width={w} height={200} fill={C.wood} stroke={OL} strokeWidth={5} />
    <g transform={`translate(0 ${open * 70})`}>
      <rect x={-w / 2 + 30} y={30} width={w - 60} height={80} rx={8} fill={C.woodLight} stroke={OL} strokeWidth={5} />
      <rect x={-30} y={60} width={60} height={14} rx={7} fill={OL} />
    </g>
  </g>
);

export const Stamp: React.FC<{ x: number; y: number; text: string; k: number; color?: string; rot?: number }> = ({ x, y, text, k, color = C.red, rot = -10 }) => {
  if (k <= 0) return null;
  const s = 1.6 - 0.6 * Math.min(1, k);
  const w = text.length * 26 + 50;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <rect x={-w / 2} y={-34} width={w} height={68} rx={12} fill="#fff" fillOpacity={0.9} stroke={color} strokeWidth={7} />
      <text y={14} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={color} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

export const Campfire: React.FC<{ x: number; y: number; s?: number; t?: number; fire?: number }> = ({ x, y, s = 1, t = 0, fire = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-20} width={160} height={24} rx={12} fill={C.woodDark} stroke={OL} strokeWidth={4} transform="rotate(12)" />
    <rect x={-80} y={-20} width={160} height={24} rx={12} fill={C.wood} stroke={OL} strokeWidth={4} transform="rotate(-12)" />
    {fire > 0.02 && (
      <g transform={`scale(${fire})`} style={{ transformOrigin: "0 0" }}>
        <path d={`M -50 -10 Q -60 ${-90 + Math.sin(t * 7) * 8} -10 ${-150 + Math.sin(t * 5) * 10} Q 10 -100 30 ${-130 + Math.cos(t * 6) * 8} Q 60 -70 50 -10 Z`} fill="#ff8a3d" stroke={OL} strokeWidth={4} />
        <path d={`M -24 -12 Q -30 -60 0 ${-96 + Math.sin(t * 8) * 6} Q 24 -60 24 -12 Z`} fill={C.yellow} />
      </g>
    )}
    {fire <= 0.6 && <ellipse cx={0} cy={-14} rx={90 * (1 - fire)} ry={30 * (1 - fire)} fill="#8a6a4a" stroke={OL} strokeWidth={4} />}
  </g>
);

export const JarCream: React.FC<{ x: number; y: number; s?: number; color?: string; label?: string }> = ({ x, y, s = 1, color = "#ff9fb8", label }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-36} y={-50} width={72} height={50} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
    <rect x={-40} y={-66} width={80} height={20} rx={6} fill={color} stroke={OL} strokeWidth={4} />
    {label && (
      <g>
        <rect x={-30} y={-40} width={60} height={26} rx={5} fill="#fff8e0" stroke={OL} strokeWidth={2} />
        <text y={-21} fontFamily={FONT} fontWeight={900} fontSize={16} fill={OL} textAnchor="middle">
          {label}
        </text>
      </g>
    )}
  </g>
);

export const Phone2: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -60 -20 Q -60 -60 0 -60 Q 60 -60 60 -20 L 40 -14 Q 0 -30 -40 -14 Z" fill="#3a3f5a" stroke={OL} strokeWidth={4} />
    <rect x={-50} y={-14} width={100} height={60} rx={14} fill="#e5484d" stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={16} r={18} fill="#fff" stroke={OL} strokeWidth={3} />
  </g>
);

// таблица умножения на карточке
export const FlashCard: React.FC<{ x: number; y: number; text: string; rot?: number; s?: number; color?: string }> = ({ x, y, text, rot = 0, s = 1, color = "#fff" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-90} y={-60} width={180} height={120} rx={14} fill="#000" opacity={0.14} transform="translate(5 8)" />
    <rect x={-90} y={-60} width={180} height={120} rx={14} fill={color} stroke={OL} strokeWidth={4} />
    <text y={14} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={OL} textAnchor="middle">
      {text}
    </text>
  </g>
);
