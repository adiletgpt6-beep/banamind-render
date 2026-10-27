// Рисованные предметы фильма «Атомные привычки» (SVG): бейдж и табличка должности,
// выключатель, работники с атрибутами профессий, горы и лыжник, стена, витраж,
// батарейка, мачта, дом, часы, пруд, грядка и т. д. Простые формы, мягкие цвета, контур.
// Общие человечки, деревья, цветы, сердечки, облачка — из src/lesson-traktat/visuals/draw.
import React from "react";
import { C, FONT } from "../theme";

export { Book, Flower, Heart, Person, Sun, Tree } from "../../lesson-traktat/visuals/draw";

// облачко реплики с центром в (x, y) и хвостиком вниз
export const Bubble: React.FC<{ x: number; y: number; w: number; h: number; fill?: string }> = ({ x, y, w, h, fill = "#fff" }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M ${-w * 0.18} ${h / 2 - 4} L ${-w * 0.26} ${h / 2 + 26} L ${-w * 0.04} ${h / 2 - 4} Z`} fill={fill} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={Math.min(h * 0.4, 40)} fill={fill} stroke={OL} strokeWidth={4} />
    <rect x={-w * 0.18 + 3} y={h / 2 - 8} width={w * 0.14 - 6} height={8} fill={fill} />
  </g>
);

export const OL = "#2e2410";

// работник: тело-капсула, голова, атрибут профессии
export type Role = "maid" | "skier" | "gardener" | "masseur" | "clerk" | "boss" | "nurse" | "cashier" | "barista" | "janitor" | "plain";
const ROLE_COLOR: Record<Role, string> = {
  maid: "#2b2b3a",
  skier: "#e5484d",
  gardener: "#3fb67c",
  masseur: "#8e6cf0",
  clerk: "#2f8fd0",
  boss: "#4a5874",
  nurse: "#6cc5f0",
  cashier: "#ff9f43",
  barista: "#8a5a2b",
  janitor: "#1fa59a",
  plain: "#ff7a6b",
};

export const Worker: React.FC<{ x: number; y: number; s?: number; role?: Role; t?: number; arms?: number; mood?: "smile" | "sad" | "flat"; skin?: string; color?: string; flip?: boolean }> = ({
  x,
  y,
  s = 1,
  role = "plain",
  t = 0,
  arms = 0,
  mood = "smile",
  skin = "#f2c79b",
  color,
  flip,
}) => {
  const bob = Math.sin(t * 2.6 + x * 0.01) * 2;
  const body = color ?? ROLE_COLOR[role];
  const mouth = mood === "sad" ? "M -10 -96 Q 0 -104 10 -96" : mood === "flat" ? "M -9 -98 L 9 -98" : "M -10 -100 Q 0 -91 10 -100";
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -s : s} ${s})`}>
      <path d="M -14 -10 L -18 30 M 14 -10 L 18 30" stroke={OL} strokeWidth={9} strokeLinecap="round" />
      <path d={`M -26 -60 L -50 ${-30 - arms * 40} M 26 -60 L 50 ${-30 - arms * 40}`} stroke={OL} strokeWidth={9} strokeLinecap="round" />
      <rect x={-30} y={-80} width={60} height={76} rx={22} fill={body} stroke={OL} strokeWidth={4} />
      {role === "maid" && <path d="M -20 -60 L 20 -60 L 24 -8 L -24 -8 Z" fill="#fff" stroke={OL} strokeWidth={3} />}
      {role === "barista" && <path d="M -20 -62 L 20 -62 L 22 -8 L -22 -8 Z" fill="#f3e2c7" stroke={OL} strokeWidth={3} />}
      {role === "nurse" && <path d="M -6 -56 L 6 -56 L 6 -46 L 16 -46 L 16 -34 L 6 -34 L 6 -24 L -6 -24 L -6 -34 L -16 -34 L -16 -46 L -6 -46 Z" fill="#fff" />}
      {role === "boss" && <path d="M 0 -78 L -7 -60 L 0 -26 L 7 -60 Z" fill={C.red} stroke={OL} strokeWidth={2} />}
      {role === "clerk" && <rect x={-16} y={-60} width={32} height={18} rx={4} fill="#fff" stroke={OL} strokeWidth={2} />}
      <circle cx={0} cy={-110} r={30} fill={skin} stroke={OL} strokeWidth={4} />
      <circle cx={-10} cy={-114} r={4} fill={OL} />
      <circle cx={10} cy={-114} r={4} fill={OL} />
      <path d={mouth} stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />
      {role === "maid" && <circle cx={18} cy={-134} r={9} fill="#fff" stroke={OL} strokeWidth={2} />}
      {role === "skier" && <path d="M -30 -122 Q 0 -160 30 -122 Z" fill={C.red} stroke={OL} strokeWidth={3} />}
      {role === "skier" && <rect x={-26} y={-126} width={52} height={14} rx={6} fill="#ffd23f" stroke={OL} strokeWidth={3} />}
      {role === "gardener" && <path d="M -44 -128 L 44 -128 Q 30 -150 0 -152 Q -30 -150 -44 -128 Z" fill="#e8c96a" stroke={OL} strokeWidth={3} />}
      {role === "janitor" && <path d="M -32 -126 L 32 -126 L 26 -146 L -26 -146 Z" fill={C.teal} stroke={OL} strokeWidth={3} />}
      {role === "masseur" && <path d="M -30 -130 Q 0 -146 30 -130" stroke="#fff" strokeWidth={6} fill="none" />}
    </g>
  );
};

// бейдж на ленте
export const Badge: React.FC<{ x: number; y: number; s?: number; text: string; sub?: string; color?: string; rot?: number }> = ({ x, y, s = 1, text, sub, color = C.white, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -60 -170 L -20 -70 M 60 -170 L 20 -70" stroke={C.skyDeep} strokeWidth={12} strokeLinecap="round" />
    <rect x={-150} y={-80} width={300} height={170} rx={20} fill={color} stroke={OL} strokeWidth={5} />
    <rect x={-150} y={-80} width={300} height={42} rx={20} fill={C.skyDeep} />
    <rect x={-150} y={-56} width={300} height={18} fill={C.skyDeep} />
    {sub && (
      <text x={0} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill="#fff">
        {sub}
      </text>
    )}
    <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={text.length > 9 ? 40 : 52} fill={C.ink}>
      {text}
    </text>
  </g>
);

// табличка на двери / на столе
export const Plate: React.FC<{ x: number; y: number; s?: number; text: string; rot?: number; color?: string }> = ({ x, y, s = 1, text, rot = 0, color = "#e8c96a" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-170} y={-46} width={340} height={92} rx={12} fill={color} stroke={OL} strokeWidth={5} />
    <rect x={-158} y={-34} width={316} height={68} rx={8} fill="none" stroke="#fff" strokeWidth={3} opacity={0.6} />
    <circle cx={-150} cy={0} r={5} fill={OL} />
    <circle cx={150} cy={0} r={5} fill={OL} />
    <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.ink}>
      {text}
    </text>
  </g>
);

export const Desk: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-20} width={520} height={34} rx={8} fill={C.wood} stroke={OL} strokeWidth={5} />
    <rect x={-240} y={14} width={24} height={150} fill={C.wood} stroke={OL} strokeWidth={4} />
    <rect x={216} y={14} width={24} height={150} fill={C.wood} stroke={OL} strokeWidth={4} />
    <rect x={40} y={14} width={170} height={100} rx={6} fill="#c99060" stroke={OL} strokeWidth={4} />
    <circle cx={125} cy={64} r={7} fill={OL} />
  </g>
);

export const Chair: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-220} width={140} height={170} rx={30} fill="#5a3d7a" stroke={OL} strokeWidth={5} />
    <rect x={-80} y={-60} width={160} height={40} rx={14} fill="#6b4a8e" stroke={OL} strokeWidth={5} />
    <path d="M 0 -20 L 0 40 M -50 60 L 50 60 M 0 40 L -50 60 M 0 40 L 50 60" stroke={OL} strokeWidth={8} strokeLinecap="round" />
  </g>
);

// настенный выключатель: k = 0 — «жертва» (вниз), 1 — «лидер» (вверх)
export const Switch: React.FC<{ x: number; y: number; s?: number; k: number }> = ({ x, y, s = 1, k }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-180} width={240} height={360} rx={30} fill="#fff" stroke={OL} strokeWidth={6} />
    <rect x={-60} y={-110} width={120} height={220} rx={20} fill="#e9eef5" stroke={OL} strokeWidth={5} />
    <g transform={`translate(0 ${(1 - k) * 50 - k * 50})`}>
      <rect x={-46} y={-60} width={92} height={120} rx={18} fill={k > 0.5 ? C.yellow : "#b9c3d3"} stroke={OL} strokeWidth={5} />
    </g>
  </g>
);

// гора с тропой
export const Mountain: React.FC<{ x: number; y: number; s?: number; snow?: boolean; color?: string }> = ({ x, y, s = 1, snow = true, color = "#8aa6c8" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -360 0 L -60 -420 L 30 -300 L 120 -380 L 380 0 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    {snow && <path d="M -60 -420 L -120 -336 L -80 -350 L -40 -320 L 0 -356 Z M 120 -380 L 76 -318 L 110 -330 L 150 -316 Z" fill="#fff" stroke={OL} strokeWidth={3} strokeLinejoin="round" />}
  </g>
);

// лыжник на склоне: lean > 0 — вперёд, < 0 — назад
export const Skier: React.FC<{ x: number; y: number; s?: number; lean: number; slope?: number; t?: number; fall?: number }> = ({ x, y, s = 1, lean, slope = 28, t = 0, fall = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${slope + fall * 70}) scale(${s})`}>
    <path d="M -110 30 L 120 30 Q 140 30 146 18" stroke={OL} strokeWidth={10} strokeLinecap="round" fill="none" />
    <g transform={`rotate(${lean * 22})`}>
      <path d="M -14 26 L -24 -20 M 14 26 L 10 -20" stroke={OL} strokeWidth={10} strokeLinecap="round" />
      <rect x={-34} y={-96} width={60} height={80} rx={22} fill={C.red} stroke={OL} strokeWidth={4} />
      <circle cx={-4} cy={-126} r={28} fill="#f2c79b" stroke={OL} strokeWidth={4} />
      <rect x={-30} y={-142} width={52} height={14} rx={6} fill={C.yellow} stroke={OL} strokeWidth={3} />
      <path d="M -32 -146 Q -4 -176 26 -146 Z" fill={C.red} stroke={OL} strokeWidth={3} />
      <path d={`M -24 -80 L ${-60 - lean * 10} ${-30 + Math.sin(t * 3) * 3} M 20 -80 L ${60 + lean * 10} -40`} stroke={OL} strokeWidth={8} strokeLinecap="round" />
      <path d={`M ${-60 - lean * 10} -30 L ${-80 - lean * 10} 30 M ${60 + lean * 10} -40 L ${50 + lean * 10} 30`} stroke="#555" strokeWidth={5} strokeLinecap="round" />
    </g>
  </g>
);

// кирпич
export const Brick: React.FC<{ x: number; y: number; w?: number; h?: number; color?: string; label?: string; rot?: number }> = ({ x, y, w = 120, h = 54, color = "#d9774f", label, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill={color} stroke={OL} strokeWidth={4} />
    <path d={`M ${-w / 2 + 8} ${-h / 2 + 10} L ${w / 2 - 20} ${-h / 2 + 10}`} stroke="#fff" strokeWidth={3} opacity={0.35} strokeLinecap="round" />
    {label && (
      <text x={0} y={9} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill="#fff">
        {label}
      </text>
    )}
  </g>
);

// батарейка: level 0…1
export const Battery: React.FC<{ x: number; y: number; s?: number; level: number; color?: string }> = ({ x, y, s = 1, level, color }) => {
  const c = color ?? (level < 0.25 ? C.red : level < 0.6 ? C.orange : C.green);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-70} y={-140} width={140} height={260} rx={22} fill="#fff" stroke={OL} strokeWidth={6} />
      <rect x={-30} y={-162} width={60} height={24} rx={6} fill={OL} />
      <rect x={-54} y={104 - 228 * level} width={108} height={228 * level} rx={12} fill={c} />
      {level > 0.95 && <path d="M 8 -90 L -26 6 L 0 6 L -10 80 L 28 -20 L 2 -20 Z" fill="#fff" opacity={0.9} />}
    </g>
  );
};

// телефон
export const Phone: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode; rot?: number }> = ({ x, y, s = 1, children, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-80} y={-150} width={160} height={300} rx={26} fill="#2b3a67" stroke={OL} strokeWidth={5} />
    <rect x={-66} y={-124} width={132} height={242} rx={12} fill="#eaf4ff" />
    <rect x={-20} y={-140} width={40} height={8} rx={4} fill="#58658a" />
    {children}
  </g>
);

// часы-будильник со стрелками
export const Clock: React.FC<{ x: number; y: number; s?: number; h: number; m: number }> = ({ x, y, s = 1, h, m }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={-62} cy={-80} r={26} fill={C.red} stroke={OL} strokeWidth={5} />
    <circle cx={62} cy={-80} r={26} fill={C.red} stroke={OL} strokeWidth={5} />
    <circle r={100} fill="#fff" stroke={OL} strokeWidth={7} />
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={i} x1={0} y1={-84} x2={0} y2={-72} stroke={OL} strokeWidth={5} transform={`rotate(${i * 30})`} />
    ))}
    <line x1={0} y1={0} x2={0} y2={-48} stroke={OL} strokeWidth={9} strokeLinecap="round" transform={`rotate(${(h % 12) * 30 + m * 0.5})`} />
    <line x1={0} y1={0} x2={0} y2={-70} stroke={C.skyDeep} strokeWidth={6} strokeLinecap="round" transform={`rotate(${m * 6})`} />
    <circle r={8} fill={OL} />
  </g>
);

// дом
export const House: React.FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-140} y={-170} width={280} height={170} fill="#fff3d6" stroke={OL} strokeWidth={5} />
    <path d="M -170 -160 L 0 -290 L 170 -160 Z" fill={C.coral} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-40} y={-100} width={70} height={100} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} />
    <rect x={60} y={-130} width={60} height={56} rx={4} fill={glow > 0 ? "#ffe680" : "#bfe6fb"} stroke={OL} strokeWidth={4} />
    <rect x={-120} y={-130} width={60} height={56} rx={4} fill={glow > 0 ? "#ffe680" : "#bfe6fb"} stroke={OL} strokeWidth={4} />
    {glow > 0 && <circle cx={0} cy={-120} r={230} fill="#ffe680" opacity={0.18 * glow} />}
  </g>
);

// кораблик с мачтой; broken — мачта сломана
export const Ship: React.FC<{ x: number; y: number; s?: number; t?: number; broken?: number }> = ({ x, y, s = 1, t = 0, broken = 0 }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 1.5) * 6}) rotate(${Math.sin(t * 1.2) * 3}) scale(${s})`}>
    <path d="M -200 0 L 200 0 L 150 80 L -150 80 Z" fill={C.wood} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <g transform={`rotate(${broken * 62} 0 -150)`}>
      <rect x={-8} y={-330} width={16} height={180} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
      <path d="M 10 -320 Q 140 -250 10 -170 Z" fill="#fff" stroke={OL} strokeWidth={4} opacity={1 - broken * 0.4} />
    </g>
    <rect x={-8} y={-150} width={16} height={150} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
  </g>
);

// грядка с ростками; grow 0…1
export const Sprout: React.FC<{ x: number; y: number; s?: number; grow: number; color?: string; t?: number }> = ({ x, y, s = 1, grow, color = C.pink, t = 0 }) => {
  const g = Math.max(0, Math.min(1, grow));
  const sway = Math.sin(t * 1.8 + x * 0.02) * 4 * g;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={44} ry={12} fill="#8a5a2b" opacity={0.6} />
      {g > 0.02 && <path d={`M 0 0 Q ${sway} ${-60 * g} ${sway * 1.5} ${-120 * g}`} stroke={C.greenDeep} strokeWidth={7} fill="none" strokeLinecap="round" />}
      {g > 0.3 && <ellipse cx={14} cy={-50 * g} rx={20 * g} ry={9 * g} fill={C.green} transform={`rotate(-30 14 ${-50 * g})`} />}
      {g > 0.3 && <ellipse cx={-14} cy={-70 * g} rx={20 * g} ry={9 * g} fill={C.green} transform={`rotate(30 -14 ${-70 * g})`} />}
      {g > 0.75 &&
        Array.from({ length: 6 }).map((_, i) => (
          <ellipse key={i} cx={sway * 1.5} cy={-120 * g - 18} rx={10} ry={18} fill={color} stroke={OL} strokeWidth={2} transform={`rotate(${i * 60} ${sway * 1.5} ${-120 * g})`} opacity={(g - 0.75) * 4} />
        ))}
      {g > 0.75 && <circle cx={sway * 1.5} cy={-120 * g} r={10} fill={C.yellow} stroke={OL} strokeWidth={2} opacity={(g - 0.75) * 4} />}
    </g>
  );
};

// лейка
export const WateringCan: React.FC<{ x: number; y: number; s?: number; rot?: number; pour?: number }> = ({ x, y, s = 1, rot = 0, pour = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-60} y={-50} width={110} height={90} rx={14} fill={C.skyDeep} stroke={OL} strokeWidth={5} />
    <path d="M 50 -20 L 120 -70 L 130 -58 L 60 0 Z" fill={C.skyDeep} stroke={OL} strokeWidth={4} />
    <path d="M -60 -30 Q -110 -30 -100 20 Q -96 34 -60 26" fill="none" stroke={OL} strokeWidth={8} />
    {pour > 0 && [0, 1, 2, 3].map((i) => <circle key={i} cx={130 + i * 6} cy={-50 + ((i * 23 + pour * 200) % 90)} r={5} fill="#7fd1f5" />)}
  </g>
);

// монетка
export const Coin: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={30} fill={C.yellow} stroke={OL} strokeWidth={4} />
    <circle r={20} fill="none" stroke={C.yellowDeep} strokeWidth={4} />
  </g>
);

// скрипка-силуэт (оркестр)
export const Violin: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 -70 Q 34 -70 30 -40 Q 24 -22 32 -4 Q 44 26 22 50 Q 0 64 -22 50 Q -44 26 -32 -4 Q -24 -22 -30 -40 Q -34 -70 0 -70 Z" fill="#b5651d" stroke={OL} strokeWidth={4} />
    <rect x={-5} y={-140} width={10} height={80} fill={OL} />
    <path d="M -8 -10 Q -14 0 -8 10 M 8 -10 Q 14 0 8 10" stroke={OL} strokeWidth={3} fill="none" />
  </g>
);

// нота
export const Note: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = C.ink }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={16} ry={12} fill={color} transform="rotate(-20)" />
    <path d="M 14 -4 L 14 -60 Q 34 -50 38 -30" stroke={color} strokeWidth={5} fill="none" />
  </g>
);

// календарь-сетка недели/месяца: done — сколько клеток отмечено
export const CalendarGrid: React.FC<{ x: number; y: number; cols: number; rows: number; cell?: number; done: number; color?: string }> = ({ x, y, cols, rows, cell = 44, done, color = C.green }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: cols * rows }).map((_, i) => {
      const cx = (i % cols) * (cell + 8);
      const cy = Math.floor(i / cols) * (cell + 8);
      const on = i < done;
      return <rect key={i} x={cx} y={cy} width={cell} height={cell} rx={8} fill={on ? color : "#fff"} stroke={OL} strokeWidth={3} opacity={on ? 1 : 0.8} />;
    })}
  </g>
);

// очки (розовые/чёрные)
export const Glasses: React.FC<{ x: number; y: number; s?: number; color: string }> = ({ x, y, s = 1, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-130} y={-40} width={110} height={80} rx={30} fill={color} stroke={OL} strokeWidth={6} opacity={0.9} />
    <rect x={20} y={-40} width={110} height={80} rx={30} fill={color} stroke={OL} strokeWidth={6} opacity={0.9} />
    <path d="M -20 -6 Q 0 -20 20 -6" stroke={OL} strokeWidth={6} fill="none" />
  </g>
);

// рюкзак-груз
export const Backpack: React.FC<{ x: number; y: number; s?: number; labels?: string[] }> = ({ x, y, s = 1, labels = [] }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-160} width={220} height={240} rx={40} fill="#7a6a58" stroke={OL} strokeWidth={6} />
    <rect x={-80} y={-40} width={160} height={90} rx={18} fill="#8f7d68" stroke={OL} strokeWidth={4} />
    <path d="M -60 -160 Q 0 -220 60 -160" stroke={OL} strokeWidth={10} fill="none" />
    {labels.map((l, i) => (
      <text key={i} x={0} y={-104 + i * 30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill="#fff">
        {l}
      </text>
    ))}
  </g>
);

// камешек-табличка (серый камень / золото)
export const Tablet: React.FC<{ x: number; y: number; w?: number; h?: number; gold?: boolean; title: string; items: string[]; show?: number }> = ({ x, y, w = 520, h = 520, gold, title, items, show = items.length }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={34} fill="#000" opacity={0.12} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill={gold ? "#ffd86b" : "#b9bcc3"} stroke={OL} strokeWidth={6} />
    <rect x={-w / 2 + 16} y={-h / 2 + 16} width={w - 32} height={h - 32} rx={24} fill="none" stroke="#fff" strokeWidth={3} opacity={0.5} />
    <text x={0} y={-h / 2 + 70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.ink}>
      {title}
    </text>
    {items.slice(0, show).map((it, i) => (
      <g key={i}>
        <circle cx={-w / 2 + 52} cy={-h / 2 + 129 + i * 62} r={10} fill={gold ? C.green : "#6b7280"} />
        <text x={-w / 2 + 76} y={-h / 2 + 140 + i * 62} fontFamily={FONT} fontWeight={800} fontSize={32} fill={C.ink}>
          {it}
        </text>
      </g>
    ))}
  </g>
);
