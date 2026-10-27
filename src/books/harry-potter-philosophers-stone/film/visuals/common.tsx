// Общие предметы «Мастерской решений» BM-031:
//   Compass — латунный компас фильма с четырьмя сторонами (наша метафора, не предмет романа);
//   Token   — фишка-участник: точечный силуэт-кружок и имя на ярлыке. Персонажи книги
//             в кадре только так — без лиц, костюмов, очков, шрамов и прочих примет;
//   Sticker — ярлык, который «прилипает» к фишке и может отклеиться;
//   Envelope, OwnBook — простые собственные предметы.
import React from "react";
import { C, DIRS, DISPLAY, FONT, type Dir } from "../theme";
import { dotsOf, SH, Swarm } from "./dots";
import { OL } from "./draw";
import { clamp01, ease, ramp, wob } from "./kit";

const ORDER: Dir[] = ["origin", "expect", "fear", "act"];

// угол стрелки (градусы, 0 — вверх, по часовой) к стороне
export const angleOf = (d: Dir) => DIRS[d].angle;
// плавный поворот по кратчайшей дуге
export const turn = (a: number, b: number, k: number) => {
  let d = ((b - a + 540) % 360) - 180;
  if (Math.abs(d) < 0.001) d = 0;
  return a + d * ease(clamp01(k));
};

export const Compass: React.FC<{ x: number; y: number; r?: number; angle: number; t: number; hi?: Dir | null; dim?: Dir[]; labels?: boolean; glow?: number }> = ({ x, y, r = 250, angle, t, hi = null, dim = [], labels = true, glow = 0 }) => {
  const ticks = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const big = i % 12 === 0;
    const r1 = r * (big ? 0.78 : 0.84);
    ticks.push(<line key={i} x1={Math.sin(a) * r1} y1={-Math.cos(a) * r1} x2={Math.sin(a) * r * 0.9} y2={-Math.cos(a) * r * 0.9} stroke={OL} strokeOpacity={big ? 0.75 : 0.35} strokeWidth={big ? 5 : 3} strokeLinecap="round" />);
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 1.06} cy={14} fill="#000" opacity={0.16} />
      {glow > 0 && <circle r={r * 1.18} fill={C.yellow} opacity={0.25 * glow} />}
      <circle r={r * 1.04} fill={C.brass} stroke={OL} strokeWidth={6} />
      <circle r={r * 0.96} fill={C.brassDark} opacity={0.35} />
      <circle r={r * 0.92} fill={C.paper} stroke={OL} strokeWidth={4} />
      {ORDER.map((d) => {
        const a = (DIRS[d].angle * Math.PI) / 180;
        const on = hi === d;
        const off = dim.includes(d);
        return (
          <path
            key={d}
            d={`M 0 0 L ${Math.sin(a - 0.38) * r * 0.9} ${-Math.cos(a - 0.38) * r * 0.9} A ${r * 0.9} ${r * 0.9} 0 0 1 ${Math.sin(a + 0.38) * r * 0.9} ${-Math.cos(a + 0.38) * r * 0.9} Z`}
            fill={DIRS[d].color}
            opacity={off ? 0.12 : on ? 0.6 : 0.28}
          />
        );
      })}
      {ticks}
      {labels &&
        ORDER.map((d) => {
          // подписи сторон — цветные плашки снаружи кольца: стрелка их не закрывает
          const on = hi === d;
          const size = Math.max(28, r * 0.125) * (on ? 1.08 : 1);
          const w = DIRS[d].name.length * size * 0.58 + size * 1.2;
          const vert = DIRS[d].angle % 180 === 0;
          const off = r * 1.04 + 12;
          const lx = vert ? 0 : (DIRS[d].angle === 90 ? 1 : -1) * (off + w / 2);
          const ly = vert ? (DIRS[d].angle === 0 ? -1 : 1) * (off + size * 0.9) : 0;
          return (
            <g key={d} transform={`translate(${lx} ${ly}) scale(${on ? 1.06 : 1})`} opacity={dim.includes(d) ? 0.4 : 1}>
              <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={size * 0.85} fill={on ? DIRS[d].color : DIRS[d].light} stroke={OL} strokeWidth={4} />
              <text y={size * 0.34} fontFamily={FONT} fontWeight={900} fontSize={size} fill={on ? "#fff" : OL} textAnchor="middle" stroke={on ? OL : "none"} strokeWidth={on ? 5 : 0} paintOrder="stroke">
                {DIRS[d].name}
              </text>
            </g>
          );
        })}
      <g transform={`rotate(${angle})`}>
        <path d={`M 0 ${-r * 0.8} L ${r * 0.085} 0 L 0 ${r * 0.16} L ${-r * 0.085} 0 Z`} fill={C.red} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M 0 ${r * 0.16} L ${r * 0.06} 0 L 0 ${r * 0.42} L ${-r * 0.06} 0 Z`} fill="#c9cbe0" stroke={OL} strokeWidth={3} strokeLinejoin="round" />
      </g>
      <circle r={r * 0.07} fill={C.brass} stroke={OL} strokeWidth={4} />
      <circle r={r * 0.025} fill={OL} />
      {/* блик стекла */}
      <path d={`M ${-r * 0.62} ${-r * 0.38} A ${r * 0.74} ${r * 0.74} 0 0 1 ${-r * 0.2} ${-r * 0.7}`} stroke="#fff" strokeOpacity={0.55} strokeWidth={r * 0.05} fill="none" strokeLinecap="round" />
      <circle cx={Math.sin(t * 0.4) * 0} r={0} />
    </g>
  );
};

// фишка-участник: точечный силуэт и имя
export const Token: React.FC<{
  x: number;
  y: number;
  name: string;
  color: string;
  t: number;
  k?: number; // сборка 0…1
  s?: number;
  ghost?: boolean;
  frozen?: number;
  seed?: number;
  hideName?: boolean;
  dim?: number;
}> = ({ x, y, name, color, t, k = 1, s = 1, ghost = false, frozen = 0, seed = 0, hideName = false, dim = 0 }) => {
  const step = 11;
  const f = SH.person(150);
  const pts = dotsOf(`tok-${step}`, f, 0, 0, ["#000"], step, 200);
  const shade = [color, color, "#ffffff"];
  const painted = pts.map((p, i) => ({ x: p.x, y: p.y, c: frozen > 0.5 ? (i % 3 === 0 ? "#ffffff" : "#9fd3ff") : shade[i % 7 === 0 ? 2 : 0] }));
  const bob = ghost ? 0 : wob(t, seed, 3);
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`} opacity={(ghost ? 0.38 : 1) * (1 - dim * 0.55)}>
      <ellipse cx={0} cy={124} rx={86} ry={14} fill="#000" opacity={0.14} />
      {ghost ? (
        <path d={`M 0 -142 a 45 45 0 1 0 0.1 0 M -72 -36 L 72 -36 L 72 112 L -72 112 Z`} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="14 12" />
      ) : (
        <Swarm pts={painted} k={k} t={t} r={4.9} from="below" spread={400} stagger={0.4} breathe={0.8} seed={seed} />
      )}
      {frozen > 0 && <rect x={-90} y={-160} width={180} height={290} rx={40} fill="#cfe9ff" opacity={0.28 * frozen} stroke="#fff" strokeWidth={4} strokeOpacity={0.6 * frozen} />}
      {!hideName && (
        <g transform="translate(0 168)" opacity={clamp01(k * 2)}>
          <rect x={-(name.length * 15 + 34)} y={-28} width={name.length * 30 + 68} height={52} rx={26} fill={C.paper} stroke={OL} strokeWidth={4} />
          <circle cx={-(name.length * 15 + 34) + 24} cy={-2} r={9} fill={color} stroke={OL} strokeWidth={2} />
          <text x={10} y={10} fontFamily={FONT} fontWeight={900} fontSize={30} fill={OL} textAnchor="middle">
            {name}
          </text>
        </g>
      )}
    </g>
  );
};

// ярлык, который прилетает и прилипает; peel 0…1 — отклеивается и падает
export const Sticker: React.FC<{ x: number; y: number; text: string; k: number; peel?: number; rot?: number; color?: string; from?: [number, number]; size?: number }> = ({ x, y, text, k, peel = 0, rot = -6, color = C.yellow, from = [0, -500], size = 38 }) => {
  if (k <= 0.001) return null;
  const e = ease(clamp01(k));
  const px = from[0] + (x - from[0]) * e;
  const py = from[1] + (y - from[1]) * e;
  const slap = 1 + 0.18 * Math.sin(clamp01((k - 0.7) / 0.3) * Math.PI);
  const w = text.length * size * 0.56 + size * 1.3;
  const fall = ease(clamp01(peel));
  return (
    <g transform={`translate(${px + fall * 60} ${py + fall * 420}) rotate(${rot + fall * 38}) scale(${slap})`} opacity={1 - clamp01(peel * 1.3 - 0.3)}>
      <rect x={-w / 2 + 5} y={-size * 0.9 + 8} width={w} height={size * 1.7} rx={10} fill="#000" opacity={0.18} />
      <rect x={-w / 2} y={-size * 0.9} width={w} height={size * 1.7} rx={10} fill={color} stroke={OL} strokeWidth={4} />
      <path d={`M ${w / 2 - 26} ${-size * 0.9} L ${w / 2} ${-size * 0.9 + 26}`} stroke={OL} strokeWidth={3} opacity={0.4} />
      <text x={0} y={size * 0.28} fontFamily={FONT} fontWeight={900} fontSize={size} fill={OL} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

// конверт с адресом (наш простой рисунок)
export const Envelope: React.FC<{ x: number; y: number; s?: number; rot?: number; text?: string; open?: number }> = ({ x, y, s = 1, rot = 0, text, open = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-150} y={-95} width={300} height={190} rx={14} fill="#000" opacity={0.15} transform="translate(6 10)" />
    <rect x={-150} y={-95} width={300} height={190} rx={14} fill="#fff6e3" stroke={OL} strokeWidth={5} />
    <path d={`M -150 -95 L 0 ${-95 + 110 * (1 - open * 2)} L 150 -95`} fill="none" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={0} cy={18} r={22} fill={C.red} stroke={OL} strokeWidth={4} opacity={1 - open} />
    {text && (
      <text x={0} y={70} fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.inkSoft} textAnchor="middle">
        {text}
      </text>
    )}
  </g>
);

// своя условная книга (не издательская обложка): простой том с названием текстом
export const OwnBook: React.FC<{ x: number; y: number; s?: number; rot?: number; title: string[]; author: string }> = ({ x, y, s = 1, rot = 0, title, author }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-190} y={-260} width={380} height={520} rx={18} fill="#000" opacity={0.18} transform="translate(12 16)" />
    <rect x={-190} y={-260} width={380} height={520} rx={18} fill="#3a4a8c" stroke={OL} strokeWidth={6} />
    <rect x={-190} y={-260} width={46} height={520} rx={12} fill="#2c3a72" stroke={OL} strokeWidth={4} />
    <rect x={-130} y={-200} width={300} height={300} rx={14} fill={C.paper} stroke={OL} strokeWidth={4} />
    <text x={20} y={-120} fontFamily={DISPLAY} fontWeight={800} fontSize={32} fill={OL} textAnchor="middle">
      {title.map((l, i) => (
        <tspan key={i} x={20} dy={i === 0 ? 0 : 46}>
          {l}
        </tspan>
      ))}
    </text>
    <text x={20} y={170} fontFamily={FONT} fontWeight={800} fontSize={30} fill="#fff" textAnchor="middle">
      {author}
    </text>
    <circle cx={20} cy={220} r={10} fill={C.yellow} />
  </g>
);

// облачко точек страха вокруг фишки (фиолетовые точки, не исчезают — живут рядом)
export const FearCloud: React.FC<{ x: number; y: number; t: number; k: number; n?: number; r?: number }> = ({ x, y, t, k, n = 46, r = 150 }) => {
  if (k <= 0.01) return null;
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t * 0.35 * (i % 2 ? 1 : -1);
    const rr = r * (0.8 + 0.25 * Math.sin(i * 2.3 + t * 1.2));
    out.push(<circle key={i} cx={x + Math.cos(a) * rr} cy={y + Math.sin(a) * rr * 0.9} r={5 + (i % 3)} fill={i % 4 === 0 ? DIRS.fear.light : DIRS.fear.color} stroke={OL} strokeOpacity={0.3} strokeWidth={1.2} opacity={k} />);
  }
  return <g>{out}</g>;
};

export { ramp };
