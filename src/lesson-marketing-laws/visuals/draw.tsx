// Рисованные предметы фильма BM-011 (SVG): магазин, пишущая машинка, ноутбук,
// глобус, лампочка, самолёт, монета, лупа, дом, шахматы, билет, гора, дверь,
// автобус, рупор, ракета, машина, кошка, сеть людей. Простые формы, мягкие цвета,
// единый контур. Логотипы реальных компаний не рисуются — только подписи.
import React from "react";
import { OL } from "../../lesson-traktat/visuals/draw";
import { C, FONT, Z } from "../theme";

export { OL };
export { Book, Bubble, Heart, Person } from "../../lesson-traktat/visuals/draw";

type P = { x: number; y: number; s?: number };

export const Shop: React.FC<P & { color?: string; awning?: string; label?: string; glow?: number }> = ({ x, y, s = 1, color = "#fff", awning = C.coral, label, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <circle cx={0} cy={-60} r={110} fill={C.yellow} opacity={0.35 * glow} />}
    <rect x={-60} y={-110} width={120} height={110} rx={8} fill={color} stroke={OL} strokeWidth={5} />
    <path d="M -70 -110 L 70 -110 L 62 -140 L -62 -140 Z" fill={awning} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    {[-44, -14, 16, 46].map((sx, i) => (
      <path key={i} d={`M ${sx - 14} -110 q 14 22 28 0`} fill={i % 2 ? "#fff" : awning} stroke={OL} strokeWidth={4} />
    ))}
    <rect x={-46} y={-80} width={44} height={36} rx={4} fill={Z.tealSoft} stroke={OL} strokeWidth={4} />
    <rect x={10} y={-80} width={36} height={80} rx={4} fill="#c98b4a" stroke={OL} strokeWidth={4} />
    {label && (
      <text x={0} y={-150} fontFamily={FONT} fontWeight={900} fontSize={26} textAnchor="middle" fill={C.ink}>
        {label}
      </text>
    )}
  </g>
);

export const Typewriter: React.FC<P & { color?: string; t?: number }> = ({ x, y, s = 1, color = Z.grey, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-40} y={-118 + Math.sin(t * 3) * 2} width={80} height={44} fill="#fff" stroke={OL} strokeWidth={4} />
    {[0, 1, 2].map((i) => (
      <line key={i} x1={-28} x2={20 - i * 8} y1={-106 + i * 11} y2={-106 + i * 11} stroke={Z.grey} strokeWidth={3} />
    ))}
    <rect x={-80} y={-82} width={160} height={22} rx={10} fill={C.ink} stroke={OL} strokeWidth={4} />
    <path d="M -90 -60 L 90 -60 L 104 0 L -104 0 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    {Array.from({ length: 3 }).map((_, r) =>
      Array.from({ length: 6 }).map((_, k) => <circle key={`${r}-${k}`} cx={-62 + k * 25 - r * 4 + 6} cy={-44 + r * 15} r={6} fill="#fff" stroke={OL} strokeWidth={2.5} />),
    )}
  </g>
);

export const Laptop: React.FC<P & { t?: number; screen?: string }> = ({ x, y, s = 1, t = 0, screen = "#eaf6ff" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-170} width={220} height={140} rx={12} fill={C.ink} stroke={OL} strokeWidth={5} />
    <rect x={-96} y={-158} width={192} height={116} rx={6} fill={screen} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-80} y={-144 + i * 24} width={(i === 3 ? 60 : 150) * Math.min(1, Math.max(0, t * 1.5 - i * 0.4))} height={10} rx={5} fill={i === 0 ? Z.teal : Z.grey} />
    ))}
    <rect x={-80 + 150 * Math.min(1, t)} y={-147} width={4} height={18} fill={C.coral} opacity={Math.sin(t * 8) > 0 ? 1 : 0} />
    <path d="M -140 -30 L 140 -30 L 160 0 L -160 0 Z" fill={Z.greySoft} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

export const Globe: React.FC<P & { t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={100} fill={C.sky} stroke={OL} strokeWidth={5} />
    <clipPath id="globeClip">
      <circle r={97} />
    </clipPath>
    <g clipPath="url(#globeClip)">
      {[0, 1].map((k) => (
        <g key={k} transform={`translate(${((t * 30 + k * 260) % 520) - 260} 0)`}>
          <path d="M -60 -50 q 30 -30 60 -10 q 20 30 -10 50 q -40 10 -50 -40 Z" fill={C.green} stroke={OL} strokeWidth={3} />
          <path d="M 40 10 q 40 -10 50 30 q -10 40 -40 30 q -30 -20 -10 -60 Z" fill={C.green} stroke={OL} strokeWidth={3} />
          <path d="M -120 40 q 30 -10 40 20 q -20 30 -40 10 Z" fill={C.green} stroke={OL} strokeWidth={3} />
        </g>
      ))}
    </g>
    <ellipse rx={100} ry={36} fill="none" stroke="#fff" strokeWidth={3} opacity={0.5} />
    <line x1={0} y1={-100} x2={0} y2={100} stroke="#fff" strokeWidth={3} opacity={0.5} />
  </g>
);

export const Bulb: React.FC<P & { on?: number; t?: number }> = ({ x, y, s = 1, on = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {on > 0 &&
      Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + t * 0.4;
        return <line key={i} x1={Math.cos(a) * 92} y1={-60 + Math.sin(a) * 92} x2={Math.cos(a) * (112 + 8 * Math.sin(t * 4 + i))} y2={-60 + Math.sin(a) * (112 + 8 * Math.sin(t * 4 + i))} stroke={C.yellowDeep} strokeWidth={8} strokeLinecap="round" opacity={on} />;
      })}
    <circle cx={0} cy={-60} r={78} fill={C.yellow} opacity={0.25 * on} />
    <path d="M -50 -60 A 50 50 0 1 1 50 -60 Q 46 -30 28 -10 L 28 10 L -28 10 L -28 -10 Q -46 -30 -50 -60 Z" fill={on > 0.5 ? C.yellow : "#fff"} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-26} y={14} width={52} height={14} rx={4} fill={Z.grey} stroke={OL} strokeWidth={4} />
    <rect x={-20} y={30} width={40} height={12} rx={4} fill={Z.grey} stroke={OL} strokeWidth={4} />
  </g>
);

export const Plane: React.FC<P & { color?: string; rot?: number }> = ({ x, y, s = 1, color = "#fff", rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -90 0 Q -90 -16 -60 -16 L 70 -16 Q 100 -16 108 0 Q 100 16 70 16 L -60 16 Q -90 16 -90 0 Z" fill={color} stroke={OL} strokeWidth={4} />
    <path d="M -10 -14 L -40 -70 L -18 -70 L 30 -14 Z" fill={Z.teal} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -10 14 L -40 70 L -18 70 L 30 14 Z" fill={Z.teal} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -80 -12 L -96 -44 L -78 -44 L -60 -12 Z" fill={Z.teal} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={-40 + i * 22} cy={-3} r={5} fill={C.skyDeep} />
    ))}
  </g>
);

export const Coin: React.FC<P & { label?: string; color?: string }> = ({ x, y, s = 1, label = "$", color = C.yellow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={34} fill={color} stroke={OL} strokeWidth={4} />
    <circle r={24} fill="none" stroke={C.yellowDeep} strokeWidth={4} />
    <text y={12} fontFamily={FONT} fontWeight={900} fontSize={32} textAnchor="middle" fill={C.brown}>
      {label}
    </text>
  </g>
);

export const Magnifier: React.FC<P & { rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <line x1={42} y1={42} x2={100} y2={100} stroke={C.brown} strokeWidth={22} strokeLinecap="round" />
    <circle r={60} fill="#eaf6ff" fillOpacity={0.6} stroke={OL} strokeWidth={10} />
    <path d="M -34 -20 A 38 38 0 0 1 -6 -40" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);

export const House: React.FC<P & { color?: string; crack?: number; base?: string }> = ({ x, y, s = 1, color = Z.tealSoft, crack = 0, base = "#b9a07a" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-140} y={-6} width={280} height={40} rx={6} fill={base} stroke={OL} strokeWidth={5} />
    <rect x={-110} y={-170} width={220} height={164} fill={color} stroke={OL} strokeWidth={5} />
    <path d="M -140 -164 L 0 -270 L 140 -164 Z" fill={C.coral} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-80} y={-130} width={54} height={50} fill="#fff" stroke={OL} strokeWidth={4} />
    <rect x={26} y={-130} width={54} height={50} fill="#fff" stroke={OL} strokeWidth={4} />
    <rect x={-26} y={-76} width={52} height={70} fill="#c98b4a" stroke={OL} strokeWidth={4} />
    {crack > 0 && <path d={`M -60 ${-6} l 14 14 l -10 10 l 16 ${16 * crack}`} stroke={OL} strokeWidth={4} fill="none" />}
  </g>
);

export const ChessKing: React.FC<P & { color?: string }> = ({ x, y, s = 1, color = "#fff" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -50 0 L 50 0 L 42 -24 L -42 -24 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -34 -24 Q -40 -80 -26 -110 L 26 -110 Q 40 -80 34 -24 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -34 -110 L 34 -110 L 24 -134 L -24 -134 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -7 -134 L -7 -150 L -20 -150 L -20 -164 L -7 -164 L -7 -178 L 7 -178 L 7 -164 L 20 -164 L 20 -150 L 7 -150 L 7 -134 Z" fill={color} stroke={OL} strokeWidth={4} />
  </g>
);

export const Pawn: React.FC<P & { color?: string }> = ({ x, y, s = 1, color = "#fff" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 0 L 40 0 L 32 -20 L -32 -20 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -24 -20 Q -24 -60 -12 -70 L 12 -70 Q 24 -60 24 -20 Z" fill={color} stroke={OL} strokeWidth={5} />
    <circle cy={-88} r={22} fill={color} stroke={OL} strokeWidth={5} />
  </g>
);

export const Ticket: React.FC<P & { rot?: number; text?: string }> = ({ x, y, s = 1, rot = 0, text = "ЛОТО" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -130 -70 L 130 -70 L 130 -18 A 18 18 0 0 0 130 18 L 130 70 L -130 70 L -130 18 A 18 18 0 0 0 -130 -18 Z" fill={C.coral} stroke={OL} strokeWidth={5} />
    <line x1={60} y1={-62} x2={60} y2={62} stroke="#fff" strokeWidth={4} strokeDasharray="10 8" />
    <text x={-30} y={14} fontFamily={FONT} fontWeight={900} fontSize={44} textAnchor="middle" fill="#fff">
      {text}
    </text>
    <text x={96} y={14} fontFamily={FONT} fontWeight={900} fontSize={40} textAnchor="middle" fill="#fff">
      ?
    </text>
  </g>
);

export const Blueprint: React.FC<P & { k?: number }> = ({ x, y, s = 1, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-110} width={300} height={220} rx={10} fill="#2f6fd0" stroke={OL} strokeWidth={5} />
    {Array.from({ length: 7 }).map((_, i) => (
      <line key={i} x1={-150 + i * 50} x2={-150 + i * 50} y1={-110} y2={110} stroke="#fff" strokeWidth={1.5} opacity={0.25} />
    ))}
    <path d="M -100 60 L -100 -20 L 0 -80 L 100 -20 L 100 60 Z" fill="none" stroke="#fff" strokeWidth={5} strokeDasharray={700} strokeDashoffset={700 * (1 - k)} strokeLinejoin="round" />
    <path d="M -30 60 L -30 10 L 30 10 L 30 60" fill="none" stroke="#fff" strokeWidth={4} strokeDasharray={200} strokeDashoffset={200 * (1 - Math.max(0, k * 2 - 1))} />
    <line x1={-120} y1={90} x2={120} y2={90} stroke="#fff" strokeWidth={3} />
  </g>
);

export const Door: React.FC<P & { color: string; open?: number; label?: string; glow?: number }> = ({ x, y, s = 1, color, open = 0, label, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <rect x={-90} y={-290} width={180} height={300} rx={20} fill={C.yellow} opacity={0.4 * glow} />}
    <rect x={-80} y={-280} width={160} height={280} rx={12} fill={C.ink} stroke={OL} strokeWidth={5} />
    {open > 0 && <rect x={-72} y={-272} width={144} height={272} fill={C.yellow} opacity={0.85} />}
    <g transform={`translate(-72 0) scale(${1 - 0.75 * open} 1)`}>
      <rect x={0} y={-272} width={144} height={272} rx={8} fill={color} stroke={OL} strokeWidth={5} />
      <circle cx={118} cy={-136} r={10} fill={C.yellow} stroke={OL} strokeWidth={3} />
    </g>
    {label && (
      <text x={0} y={52} fontFamily={FONT} fontWeight={900} fontSize={34} textAnchor="middle" fill={C.ink}>
        {label}
      </text>
    )}
  </g>
);

export const Bus: React.FC<P & { t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-170} y={-130} width={340} height={110} rx={22} fill={C.yellow} stroke={OL} strokeWidth={5} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-150 + i * 72} y={-112} width={56} height={44} rx={6} fill={Z.tealSoft} stroke={OL} strokeWidth={4} />
    ))}
    {[-100, 110].map((wx, i) => (
      <g key={i} transform={`translate(${wx} -20) rotate(${t * 200})`}>
        <circle r={26} fill={C.ink} stroke={OL} strokeWidth={4} />
        <line x1={-14} x2={14} stroke="#fff" strokeWidth={4} />
      </g>
    ))}
  </g>
);

export const Megaphone: React.FC<P & { t?: number; rot?: number }> = ({ x, y, s = 1, t = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -60 -24 L 40 -70 L 40 70 L -60 24 Z" fill={C.coral} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-84} y={-26} width={28} height={52} rx={6} fill={Z.grey} stroke={OL} strokeWidth={4} />
    {[0, 1, 2].map((i) => {
      const r = 30 + ((t * 60 + i * 30) % 90);
      return <path key={i} d={`M ${60 + r * 0.3} ${-r} A ${r} ${r} 0 0 1 ${60 + r * 0.3} ${r}`} fill="none" stroke={C.coral} strokeWidth={6} opacity={1 - r / 120} />;
    })}
  </g>
);

export const Rocket: React.FC<P & { t?: number; flame?: number }> = ({ x, y, s = 1, t = 0, flame = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {flame > 0 && <path d={`M -18 40 Q 0 ${90 + Math.sin(t * 30) * 12} 18 40 Z`} fill={Z.orange} stroke={OL} strokeWidth={3} opacity={flame} />}
    <path d="M 0 -110 Q 40 -60 34 40 L -34 40 Q -40 -60 0 -110 Z" fill="#fff" stroke={OL} strokeWidth={5} />
    <circle cy={-40} r={16} fill={C.sky} stroke={OL} strokeWidth={4} />
    <path d="M -34 0 L -60 50 L -30 40 Z" fill={C.coral} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 34 0 L 60 50 L 30 40 Z" fill={C.coral} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

export const Car: React.FC<P & { color?: string; t?: number; plug?: boolean }> = ({ x, y, s = 1, color = C.coral, t = 0, plug }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -150 -20 Q -150 -60 -110 -64 L -70 -66 Q -40 -110 20 -110 Q 70 -110 96 -66 L 130 -60 Q 154 -54 154 -24 L 154 -10 L -150 -10 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -54 -68 Q -30 -98 12 -98 L 12 -68 Z" fill={Z.tealSoft} stroke={OL} strokeWidth={4} />
    <path d="M 26 -98 Q 62 -96 80 -68 L 26 -68 Z" fill={Z.tealSoft} stroke={OL} strokeWidth={4} />
    {[-90, 96].map((wx, i) => (
      <g key={i} transform={`translate(${wx} -8) rotate(${t * 240})`}>
        <circle r={30} fill={C.ink} stroke={OL} strokeWidth={4} />
        <circle r={12} fill={Z.grey} />
        <line x1={-12} x2={12} stroke="#fff" strokeWidth={3} />
      </g>
    ))}
    {plug && <path d="M 154 -40 q 40 0 40 40 q 0 30 30 30" stroke={C.ink} strokeWidth={6} fill="none" />}
  </g>
);

export const Cat: React.FC<P & { t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M 50 -10 Q 100 ${-30 + Math.sin(t * 3) * 14} 90 -80`} stroke={OL} strokeWidth={10} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={-30} rx={60} ry={42} fill={Z.orange} stroke={OL} strokeWidth={5} />
    <circle cx={-34} cy={-90} r={40} fill={Z.orange} stroke={OL} strokeWidth={5} />
    <path d="M -70 -110 L -66 -150 L -44 -122 Z M -10 -112 L -6 -150 L -28 -124 Z" fill={Z.orange} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={-48} cy={-94} r={5} fill={OL} />
    <circle cx={-22} cy={-94} r={5} fill={OL} />
    <path d="M -40 -78 q 6 6 12 0" stroke={OL} strokeWidth={3} fill="none" />
  </g>
);

// человечек-«значок» (голова + плечи), цвет — роль
export const Dot: React.FC<P & { color?: string; ring?: string }> = ({ x, y, s = 1, color = Z.teal, ring }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {ring && <circle cy={-14} r={40} fill="none" stroke={ring} strokeWidth={6} />}
    <path d="M -26 16 Q -26 -12 0 -12 Q 26 -12 26 16 Z" fill={color} stroke={OL} strokeWidth={3.5} />
    <circle cy={-28} r={15} fill="#ffd9b0" stroke={OL} strokeWidth={3.5} />
  </g>
);

// простая «пустая» книга BanaMind (не обложка издания)
export const ZeroBook: React.FC<P & { t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t * 0.8) * 2})`}>
    <rect x={-150} y={-210} width={300} height={420} rx={16} fill="#24324a" opacity={0.15} transform="translate(12 14)" />
    <rect x={-150} y={-210} width={300} height={420} rx={16} fill="#fdfbf5" stroke={OL} strokeWidth={6} />
    <rect x={-150} y={-210} width={34} height={420} rx={10} fill={Z.teal} stroke={OL} strokeWidth={6} />
    <text x={18} y={-40} fontFamily={FONT} fontWeight={900} fontSize={170} textAnchor="middle" fill={C.ink}>
      0
    </text>
    <path d="M -40 10 L 70 10" stroke={C.coral} strokeWidth={10} strokeLinecap="round" />
    <path d="M 56 -4 L 74 10 L 56 24" stroke={C.coral} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <text x={18} y={170} fontFamily={FONT} fontWeight={900} fontSize={170} textAnchor="middle" fill={C.yellowDeep}>
      1
    </text>
  </g>
);
