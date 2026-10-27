// Общие детали анимированных экспонатов (как в BM-023 и lesson-traktat): появление «пружинкой»,
// стрелки, зачёркивание, галочки, подписи. Всё зависит только от времени сцены.
import React from "react";
import { Easing, interpolate, spring } from "remotion";
import { C, FONT, FPS } from "../theme";

export type VisualCtx = {
  t: number; // секунды от начала сцены
  dur: number; // длительность сцены
  beats: number[]; // начало каждой реплики сцены (с от начала сцены)
  ends: number[]; // конец речи каждой реплики
};

export type VisualProps<P = Record<string, unknown>> = VisualCtx & { p: P };

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = Easing.bezier(0.45, 0, 0.25, 1);
export const ramp = (t: number, a: number, d = 0.6) => clamp01(interpolate(t, [a, a + d], [0, 1], { easing: ease }));
export const pop = (t: number, at: number) => (t < at ? 0 : spring({ frame: Math.round((t - at) * FPS), fps: FPS, config: { damping: 11, stiffness: 140 } }));

// время появления: номер реплики (целое) или реплика + доля её речи (2.5)
export const at = (ctx: VisualCtx, beat: number) => {
  const i = Math.floor(beat);
  const frac = beat - i;
  const b = ctx.beats[Math.min(i, ctx.beats.length - 1)] ?? 0;
  const e = ctx.ends[Math.min(i, ctx.ends.length - 1)] ?? b;
  return b + (e - b) * frac;
};

export const Pop: React.FC<{ t: number; at: number; x: number; y: number; children: React.ReactNode; from?: number }> = ({ t, at: a, x, y, children, from = 0 }) => {
  const k = pop(t, a);
  if (k <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${from + (1 - from) * k})`} opacity={clamp01(k * 1.5)}>
      {children}
    </g>
  );
};

export const Panel: React.FC<{ x: number; y: number; w: number; h: number; fill?: string; r?: number; stroke?: string }> = ({ x, y, w, h, fill = C.white, r = 36, stroke }) => (
  <g>
    <rect x={x + 6} y={y + 10} width={w} height={h} rx={r} fill="#24324a" opacity={0.1} />
    <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth={stroke ? 6 : 0} />
  </g>
);

// Ширина, в которую должен поместиться текст (её задаёт карточка/облачко): длинная строка
// уменьшает шрифт, а не вылезает за рамку.
export const FitWidth = React.createContext<number | null>(null);

export const Txt: React.FC<{
  x: number;
  y: number;
  size?: number;
  w?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  weight?: number;
  children: string;
  opacity?: number;
}> = ({ x, y, size = 48, w, color = C.ink, anchor = "middle", weight = 800, children, opacity = 1 }) => {
  const ctx = React.useContext(FitWidth);
  const max = w ?? ctx;
  const lines = children.split("\n");
  const longest = Math.max(...lines.map((l) => l.length));
  const est = longest * size * (weight >= 800 ? 0.6 : 0.56);
  const fs = max && est > max ? size * (max / est) : size;
  return (
    <text x={x} y={y} fontFamily={FONT} fontWeight={weight} fontSize={fs} fill={color} textAnchor={anchor} opacity={opacity}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : fs * 1.18}>
          {l}
        </tspan>
      ))}
    </text>
  );
};

// красный крест, рисуется штрихами
export const Cross: React.FC<{ x: number; y: number; s?: number; k: number }> = ({ x, y, s = 120, k }) => {
  if (k <= 0) return null;
  const a = clamp01(k * 2);
  const b = clamp01(k * 2 - 1);
  return (
    <g transform={`translate(${x} ${y})`} stroke={C.red} strokeWidth={s * 0.16} strokeLinecap="round">
      <line x1={-s / 2} y1={-s / 2} x2={-s / 2 + s * a} y2={-s / 2 + s * a} />
      {b > 0 && <line x1={s / 2} y1={-s / 2} x2={s / 2 - s * b} y2={-s / 2 + s * b} />}
    </g>
  );
};

export const Check: React.FC<{ x: number; y: number; s?: number; k: number; color?: string }> = ({ x, y, s = 60, k, color = C.greenDeep }) => {
  if (k <= 0) return null;
  const L = s * 2.2;
  return (
    <path
      d={`M ${x - s * 0.5} ${y} L ${x - s * 0.1} ${y + s * 0.4} L ${x + s * 0.6} ${y - s * 0.45}`}
      fill="none"
      stroke={color}
      strokeWidth={s * 0.22}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={L}
      strokeDashoffset={L * (1 - clamp01(k))}
    />
  );
};

export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; color?: string; w?: number; bend?: number }> = ({ x1, y1, x2, y2, k, color = C.inkSoft, w = 10, bend = 0 }) => {
  if (k <= 0) return null;
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend;
  const my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const len = Math.hypot(x2 - x1, y2 - y1) * (1 + Math.abs(bend));
  const ang = Math.atan2(y2 - my, x2 - mx);
  const hs = w * 2.6;
  return (
    <g>
      <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - clamp01(k))} />
      {k > 0.95 && (
        <path
          d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(ang - 0.45)} ${y2 - hs * Math.sin(ang - 0.45)} M ${x2} ${y2} L ${x2 - hs * Math.cos(ang + 0.45)} ${y2 - hs * Math.sin(ang + 0.45)}`}
          stroke={color}
          strokeWidth={w}
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

// мягкое покачивание для «оживших» предметов
export const wob = (t: number, seed = 0, amp = 4) => Math.sin(t * 2.1 + seed * 1.7) * amp;

// стикер-ярлык с текстом
export const Tag: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; textColor?: string }> = ({ x, y, text, color = C.gold, size = 40, textColor = C.ink }) => {
  const w = text.length * size * 0.56 + size * 1.2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.8} fill={color} />
      <Txt x={0} y={size * 0.12} size={size} color={textColor}>
        {text}
      </Txt>
    </g>
  );
};

// центр содержимого схемы: сдвигаем от банана (он стоит слева или справа)
export const cxOf = (host: unknown) => (host === "left" ? 1110 : host === "right" ? 800 : 960);

// монета — чёткий вектор (не точки): обод, грань, знак, блик
export const Coin: React.FC<{ x: number; y: number; r?: number; op?: number; glow?: number; label?: string; spin?: number }> = ({ x, y, r = 24, op = 1, glow = 0, label, spin = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={op}>
    {glow > 0 && <circle r={r * (1.35 + 0.15 * glow)} fill={C.keep} opacity={0.28 * glow} />}
    <ellipse rx={r * spin} ry={r} fill={C.goldDeep} />
    <ellipse rx={r * 0.84 * spin} ry={r * 0.84} fill={C.gold} />
    <ellipse rx={r * 0.62 * spin} ry={r * 0.62} fill="none" stroke={C.goldDeep} strokeWidth={r * 0.1} />
    <rect x={-r * 0.12 * spin} y={-r * 0.36} width={r * 0.24 * spin} height={r * 0.72} rx={r * 0.08} fill={C.goldDeep} />
    <ellipse cx={-r * 0.38 * spin} cy={-r * 0.36} rx={r * 0.12 * spin} ry={r * 0.22} fill={C.goldLight} />
    {label && (
      <text y={r + 26} fontFamily={FONT} fontWeight={900} fontSize={22} fill={C.ink} textAnchor="middle">
        {label}
      </text>
    )}
  </g>
);

// подпись-плашка с текстом (по центру x, y — базовая линия)
export const Label: React.FC<{ x: number; y: number; text: string; k: number; color?: string; bg?: string; size?: number; w?: number }> = ({ x, y, text, k, color = C.ink, bg = C.white, size = 40, w }) => {
  if (k <= 0) return null;
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((s) => s.length));
  const bw = w ?? longest * size * 0.58 + size * 1.3;
  const bh = lines.length * size * 1.2 + size * 0.6;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * k})`} opacity={clamp01(k * 1.6)}>
      <rect x={-bw / 2 + 4} y={-size * 1.05 + 6} width={bw} height={bh} rx={size * 0.55} fill="#2a2140" opacity={0.1} />
      <rect x={-bw / 2} y={-size * 1.05} width={bw} height={bh} rx={size * 0.55} fill={bg} />
      <Txt x={0} y={0} size={size} color={color} w={bw - size * 0.8}>
        {text}
      </Txt>
    </g>
  );
};

// имя героя под фигурой из точек
export const Name: React.FC<{ x: number; y: number; text: string; k: number; color?: string }> = ({ x, y, text, k, color = C.ink }) => <Label x={x} y={y} text={text} k={k} color={color} size={32} />;
