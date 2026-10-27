// Облачка и точечная сборка фраз BM-031:
//   PhraseBurst  — фраза в облачке рассыпается чёткими точками и собирается в форму;
//   Bubble       — облачко реплики (вектор, ровный текст);
//   Headline     — крупная надпись с обводкой.
import React from "react";
import { C, DISPLAY, FONT } from "../theme";
import { dotsOf, Morph, paint, sample, type Pt } from "./dots";
import { OL } from "./draw";
import { clamp01, ease } from "./kit";
import { SHAPES, type ShapeName } from "./shapes";

// ── облачко реплики ──
export const Bubble: React.FC<{ x: number; y: number; text: string; size?: number; tail?: -1 | 0 | 1; fill?: string; color?: string; opacity?: number; scale?: number; w?: number }> = ({
  x, y, text, size = 46, tail = 0, fill = C.paper, color = C.ink, opacity = 1, scale = 1, w: w0,
}) => {
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((l) => l.length));
  const w = w0 ?? Math.max(220, longest * size * 0.56 + size * 1.4);
  const h = lines.length * size * 1.22 + size * 0.9;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={h * 0.32} fill="#000" opacity={0.15} />
      {tail !== 0 && <path d={`M ${tail * w * 0.18} ${h / 2 - 6} L ${tail * w * 0.34} ${h / 2 + 46} L ${tail * w * 0.02} ${h / 2 - 6} Z`} fill={fill} stroke={OL} strokeWidth={4} strokeLinejoin="round" />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.32} fill={fill} stroke={OL} strokeWidth={4} />
      {tail !== 0 && <path d={`M ${tail * w * 0.17} ${h / 2 - 8} L ${tail * w * 0.03} ${h / 2 - 8}`} stroke={fill} strokeWidth={8} />}
      <text x={0} y={-((lines.length - 1) * size * 1.22) / 2 + size * 0.36} fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} textAnchor="middle">
        {lines.map((l, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : size * 1.22}>
            {l}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// ── фраза → точки → предметная форма ──
// До момента at фраза видна в облачке; затем облачко гаснет, а его точки (та же
// площадь, чёткая шестиугольная сетка) летят по дугам и собираются в форму shape
// в точке (sx, sy). Движение детерминировано — без мерцания между кадрами.
export const PhraseBurst: React.FC<{
  t: number;
  at: number;
  text: string;
  bx: number;
  by: number;
  shape: ShapeName;
  sx: number;
  sy: number;
  colors: string[];
  scale?: number; // масштаб формы
  dur?: number;
  size?: number;
  step?: number;
  r?: number;
  appear?: number; // когда появляется облачко
  tail?: -1 | 0 | 1;
  keepText?: boolean;
  mode?: "mix" | "rows" | "radial";
}> = ({ t, at, text, bx, by, shape, sx, sy, colors, scale = 1, dur = 1.6, size = 44, step = 14, r = 5.4, appear, tail = 0, keepText = false, mode = "mix" }) => {
  const a0 = appear ?? at - 1.2;
  if (t < a0) return null;
  const inK = ease(clamp01((t - a0) / 0.45));
  const k = clamp01((t - at) / dur);
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((l) => l.length));
  const w = Math.max(220, longest * size * 0.56 + size * 1.4);
  const h = lines.length * size * 1.22 + size * 0.9;
  const box = Math.max(w, h) / 2 + 10;
  const rectPts = sample(`bubble-${w.toFixed(0)}x${h.toFixed(0)}-${step}`, (x, y) => Math.abs(x) <= w / 2 - 8 && Math.abs(y) <= h / 2 - 8, box, step);
  const from: Pt[] = paint(rectPts, bx, by, colors, mode);
  const f = SHAPES[shape];
  const to: Pt[] = dotsOf(`shape-${shape}-${scale}-${step}`, (x, y) => f(x / scale, y / scale), sx, sy, colors, step, 260 * scale + 40, mode);
  const textOp = keepText ? 1 - 0.65 * clamp01(k * 3) : 1 - clamp01(k * 4);
  return (
    <g>
      {k < 0.02 || keepText ? <Bubble x={bx} y={by} text={text} size={size} tail={tail} opacity={inK * (keepText ? textOp : 1)} scale={0.9 + 0.1 * inK} /> : null}
      {k >= 0.02 && k < 0.3 && !keepText && <Bubble x={bx} y={by} text={text} size={size} tail={tail} opacity={textOp} />}
      {k > 0 && <Morph a={from} b={to} k={k} t={t} r={r} stagger={0.4} breathe={0.8} arc={120} />}
    </g>
  );
};

// крупная надпись-ярлык над сценой
export const Headline: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; opacity?: number }> = ({ x, y, text, size = 58, color = "#fff", opacity = 1 }) => (
  <text x={x} y={y} fontFamily={DISPLAY} fontWeight={800} fontSize={size} fill={color} textAnchor="middle" stroke={OL} strokeWidth={size * 0.16} paintOrder="stroke" opacity={opacity}>
    {text}
  </text>
);
