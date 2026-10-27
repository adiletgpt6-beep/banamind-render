// Общие детали анимированных схем BM-040 (из BM-027): карточки, появление «пружинкой»,
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
}> = ({ x, y, size = 48, color = C.ink, anchor = "middle", weight = 800, children, opacity = 1 }) => (
  <text x={x} y={y} fontFamily={FONT} fontWeight={weight} fontSize={size} fill={color} textAnchor={anchor} opacity={opacity}>
    {children.split("\n").map((l, i) => (
      <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.18}>
        {l}
      </tspan>
    ))}
  </text>
);

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

export const Check: React.FC<{ x: number; y: number; s?: number; k: number; color?: string }> = ({ x, y, s = 60, k, color = C.green }) => {
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
export const Tag: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; textColor?: string }> = ({ x, y, text, color = C.yellow, size = 40, textColor = C.ink }) => {
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

// Область кадра для схемы в зависимости от места банана (банан не перекрывается).
export const area = (host: unknown) => {
  switch (host) {
    case "left":
      return { x0: 640, x1: 1860, cx: 1250 };
    case "right":
      return { x0: 60, x1: 1280, cx: 670 };
    case "peek":
      return { x0: 60, x1: 1200, cx: 630 };
    case "corner":
      return { x0: 360, x1: 1860, cx: 1110 };
    default:
      return { x0: 60, x1: 1860, cx: 960 };
  }
};

// Медленный «наезд камеры» на всю схему: живой кадр даже в паузах.
export const Drift: React.FC<{ t: number; dur: number; cx?: number; cy?: number; amount?: number; children: React.ReactNode }> = ({ t, dur, cx = 960, cy = 520, amount = 0.045, children }) => {
  const k = clamp01(t / Math.max(1, dur));
  const s = 1 + amount * k;
  return <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>;
};

// Появление «пружинкой» в точке (x, y) — короткая запись.
export const Appear: React.FC<{ t: number; at: number; x?: number; y?: number; children: React.ReactNode; dy?: number }> = ({ t, at: a, x = 0, y = 0, children, dy = 30 }) => {
  const k = ramp(t, a, 0.55);
  if (k <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * dy})`} opacity={k}>
      {children}
    </g>
  );
};
