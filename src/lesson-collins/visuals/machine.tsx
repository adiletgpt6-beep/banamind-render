// Механика «двигателя прорыва»: маховик на станине, толчки, след накопленного
// движения из цветных точек, шестерни и соединительные ремни. Это визуальная
// метафора фильма, а не изображение из книги. Всё зависит только от времени.
import React from "react";
import { gearPath } from "../components/Background";
import { C, FONT } from "../theme";
import { hash } from "./dots";
import { clamp01 } from "./kit";

export const OL2 = "#1f2240";
const RIM = [C.teal, C.coral, C.yellow];

// Угол и скорость маховика по списку толчков: каждый толчок меняет скорость на dir·power,
// трение медленно её гасит. Возвращает {angle (град), v (град/с), pushes до t}.
export type Push = { at: number; dir: 1 | -1; power?: number };
export const spin = (t: number, pushes: Push[], opts: { friction?: number; v0?: number; dt?: number } = {}) => {
  const friction = opts.friction ?? 0.18;
  const dt = opts.dt ?? 1 / 30;
  let v = opts.v0 ?? 0;
  let a = 0;
  let i = 0;
  const sorted = [...pushes].sort((p, q) => p.at - q.at);
  for (let x = 0; x < t; x += dt) {
    while (i < sorted.length && sorted[i].at <= x) {
      v += sorted[i].dir * (sorted[i].power ?? 40);
      i++;
    }
    v *= 1 - friction * dt;
    a += v * dt;
  }
  return { angle: a, v, count: i };
};

// Маховик: станина, обод с цветными «болтами», спицы, ступица, след движения.
export const Flywheel: React.FC<{
  x: number;
  y: number;
  r: number;
  angle: number;
  trail?: number; // 0…1 — длина следа накопленного движения (доля окружности)
  trailDir?: 1 | -1;
  colors?: string[];
  label?: string;
  dim?: number; // 0…1 — приглушить (неверное направление)
  stand?: boolean;
  crack?: number; // 0…1 — трещины «порочного круга»
}> = ({ x, y, r, angle, trail = 0, trailDir = 1, colors = RIM, label, dim = 0, stand = true, crack = 0 }) => {
  const bolts = 18;
  const trailN = Math.round(46 * clamp01(trail));
  return (
    <g transform={`translate(${x} ${y})`}>
      {stand && (
        <g>
          <path d={`M ${-r * 0.62} ${r + 70} L ${-r * 0.12} 0 L ${r * 0.12} 0 L ${r * 0.62} ${r + 70} Z`} fill={C.steelDark} stroke={OL2} strokeWidth={6} strokeLinejoin="round" />
          <rect x={-r * 0.85} y={r + 62} width={r * 1.7} height={26} rx={10} fill={C.steel} stroke={OL2} strokeWidth={6} />
        </g>
      )}
      {/* след движения: точки за ободом, яркие у текущего угла и гаснущие к хвосту */}
      {Array.from({ length: trailN }, (_, i) => {
        const k = i / Math.max(1, 46);
        const a = ((angle - trailDir * k * 360 * 0.98) * Math.PI) / 180;
        const rr = r * 1.17 + Math.sin(i * 1.7) * 4;
        return <circle key={`tr${i}`} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={9 * (1 - k * 0.55)} fill={colors[i % colors.length]} stroke={OL2} strokeOpacity={0.35} strokeWidth={1.5} opacity={1 - k * 0.75} />;
      })}
      <g transform={`rotate(${angle})`} opacity={1 - dim * 0.45}>
        <circle r={r} fill={C.steelLight} stroke={OL2} strokeWidth={8} />
        <circle r={r * 0.82} fill={C.paper} stroke={OL2} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i * Math.PI) / 3;
          return <line key={`s${i}`} x1={Math.cos(a) * r * 0.16} y1={Math.sin(a) * r * 0.16} x2={Math.cos(a) * r * 0.8} y2={Math.sin(a) * r * 0.8} stroke={C.steelDark} strokeWidth={r * 0.07} strokeLinecap="round" />;
        })}
        {Array.from({ length: bolts }, (_, i) => {
          const a = (i / bolts) * Math.PI * 2;
          return <circle key={`b${i}`} cx={Math.cos(a) * r * 0.91} cy={Math.sin(a) * r * 0.91} r={r * 0.055} fill={colors[i % colors.length]} stroke={OL2} strokeWidth={2.5} />;
        })}
        <circle r={r * 0.2} fill={C.yellow} stroke={OL2} strokeWidth={6} />
        <circle r={r * 0.07} fill={OL2} />
        {crack > 0 &&
          [0, 1, 2].map((i) => {
            const a = i * 2.1 + 0.4;
            const L = r * 0.5 * clamp01(crack * 1.5 - i * 0.25);
            if (L <= 0) return null;
            const x0 = Math.cos(a) * r * 0.4;
            const y0 = Math.sin(a) * r * 0.4;
            return <path key={`c${i}`} d={`M ${x0} ${y0} l ${Math.cos(a) * L * 0.4} ${Math.sin(a) * L * 0.4 + 10} l ${Math.cos(a + 0.5) * L * 0.4} ${Math.sin(a + 0.5) * L * 0.4} l ${Math.cos(a - 0.3) * L * 0.3} ${Math.sin(a - 0.3) * L * 0.3}`} stroke={C.red} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
          })}
      </g>
      {label && (
        <g transform={`translate(0 ${r + 140})`}>
          <rect x={-label.length * 13 - 30} y={-34} width={label.length * 26 + 60} height={56} rx={28} fill={C.white} stroke={OL2} strokeWidth={4} />
          <text x={0} y={4} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink} textAnchor="middle">
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

// Толчок: стрелка по касательной к ободу в верхней точке, вспышка в момент толчка.
export const PushMark: React.FC<{ x: number; y: number; r: number; t: number; push: Push; color?: string }> = ({ x, y, r, t, push, color }) => {
  const dtp = t - push.at;
  if (dtp < -0.25 || dtp > 0.9) return null;
  const k = clamp01((dtp + 0.25) / 0.25);
  const fade = 1 - clamp01((dtp - 0.35) / 0.55);
  const col = color ?? (push.dir > 0 ? C.teal : C.coral);
  const len = 150;
  const y0 = y - r - 46;
  const x0 = x - (push.dir * len) / 2;
  const x1 = x0 + push.dir * len * k;
  return (
    <g opacity={fade}>
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={col} strokeWidth={20} strokeLinecap="round" />
      <path d={`M ${x1} ${y0} l ${-push.dir * 34} -26 l 0 52 Z`} fill={col} stroke={OL2} strokeWidth={4} strokeLinejoin="round" />
      {dtp >= 0 && dtp < 0.4 && <circle cx={x} cy={y - r} r={20 + dtp * 120} fill="none" stroke={col} strokeWidth={6} opacity={1 - dtp / 0.4} />}
    </g>
  );
};

// Разлетающиеся точки «потраченного усилия» (при смене направления).
export const Spill: React.FC<{ x: number; y: number; t: number; at: number; n?: number; colors?: string[]; seed?: number }> = ({ x, y, t, at, n = 16, colors = RIM, seed = 0 }) => {
  const d = t - at;
  if (d < 0 || d > 1.6) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = hash(i, seed + 3) * Math.PI * 2;
        const sp = 120 + hash(i, seed + 5) * 220;
        const px = x + Math.cos(a) * sp * d;
        const py = y + Math.sin(a) * sp * d + 260 * d * d;
        return <circle key={i} cx={px} cy={py} r={7} fill={colors[i % colors.length]} stroke={OL2} strokeOpacity={0.4} strokeWidth={1.5} opacity={1 - d / 1.6} />;
      })}
    </g>
  );
};

// Шестерня с подписью (узлы механизма).
export const Gear: React.FC<{ x: number; y: number; r: number; angle: number; color: string; teeth?: number; label?: string; labelSize?: number; opacity?: number }> = ({ x, y, r, angle, color, teeth = 12, label, labelSize = 34, opacity = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <g transform={`rotate(${angle})`}>
      <path d={gearPath(r, teeth, 0.16)} fill={color} stroke={OL2} strokeWidth={6} strokeLinejoin="round" />
      <circle r={r * 0.58} fill={C.white} stroke={OL2} strokeWidth={5} />
      <circle r={r * 0.12} fill={OL2} />
    </g>
    {label && (
      <text x={0} y={labelSize * 0.35} fontFamily={FONT} fontWeight={900} fontSize={labelSize} fill={C.ink} textAnchor="middle">
        {label}
      </text>
    )}
  </g>
);

// Ремень между двумя точками (дуга-стрелка движения).
export const Belt: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; t: number; color?: string }> = ({ x1, y1, x2, y2, k, t, color = C.inkSoft }) => {
  if (k <= 0) return null;
  const len = Math.hypot(x2 - x1, y2 - y1);
  return <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * k} y2={y1 + (y2 - y1) * k} stroke={color} strokeWidth={12} strokeLinecap="round" strokeDasharray="26 18" strokeDashoffset={-t * 60} opacity={0.9} data-len={len} />;
};
