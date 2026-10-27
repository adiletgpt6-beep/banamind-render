// Общие детали сцен BM-020: рабочая область рядом с ведущим, подписи,
// нити-связи, узлы-свидетели. Всё зависит только от времени сцены.
import React from "react";
import { C, FONT, SERIF } from "../theme";
import { clamp01, easeInOut, easeOut, type VisualCtx } from "./dots";

export type HostSide = "left" | "right" | "center" | "close" | "corner" | "off" | "peek";

// рабочая область 1300×760: справа от банана, слева от него или по центру
// (масштаб 1.06: 1378×806 на экране; подписи с y ≤ 780 заканчиваются выше
// двухстрочных титров, ≈ y 851 из 1080)
export const Box: React.FC<{ host?: unknown; children: React.ReactNode; y?: number }> = ({ host, children, y = 24 }) => {
  const x = host === "left" ? 500 : host === "right" ? 40 : host === "peek" ? 100 : 271;
  return <g transform={`translate(${x} ${y}) scale(1.06)`}>{children}</g>;
};
export const BW = 1300;
export const BH = 760;

export const Label: React.FC<{
  x: number;
  y: number;
  k: number;
  children: string;
  size?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  serif?: boolean;
  weight?: number;
  rise?: number;
}> = ({ x, y, k, children, size: size0 = 40, color = C.white, anchor = "middle", serif = false, weight = 800, rise = 14 }) => {
  if (k <= 0.001) return null;
  const size = size0 * 1.12; // крупнее для телефона
  const e = easeOut(clamp01(k));
  return (
    <text
      x={x}
      y={y + (1 - e) * rise}
      opacity={e}
      fontFamily={serif ? SERIF : FONT}
      fontWeight={weight}
      fontSize={size}
      fill={color}
      textAnchor={anchor}
      style={{ paintOrder: "stroke" }}
      stroke={C.ink}
      strokeWidth={size * 0.12}
      strokeLinejoin="round"
    >
      {children.split("\n").map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.18}>
          {l}
        </tspan>
      ))}
    </text>
  );
};

// нить, которая прочерчивается точками от a к b
export const Thread: React.FC<{ a: [number, number]; b: [number, number]; k: number; color?: string; gap?: number; r?: number; opacity?: number }> = ({ a, b, k, color = C.teal, gap = 14, r = 2.6, opacity = 1 }) => {
  if (k <= 0) return null;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.max(1, Math.round(len / gap));
  const m = Math.round(n * easeInOut(clamp01(k)));
  return (
    <g opacity={opacity}>
      {Array.from({ length: m + 1 }, (_, i) => (
        <circle key={i} cx={a[0] + ((b[0] - a[0]) * i) / n} cy={a[1] + ((b[1] - a[1]) * i) / n} r={r} fill={color} />
      ))}
    </g>
  );
};

// узел-свидетель: кольцо из точек и янтарная сердцевина, «загорается»
export const Node: React.FC<{ x: number; y: number; k: number; lit?: number; label?: string; r?: number; color?: string; labelDy?: number; labelSize?: number }> = ({ x, y, k, lit = 1, label, r = 26, color = C.amber, labelDy = 62, labelSize = 30 }) => {
  if (k <= 0.001) return null;
  const e = easeOut(clamp01(k));
  const n = 14;
  return (
    <g opacity={e}>
      {lit > 0 && <circle cx={x} cy={y} r={r * 2.1} fill={color} opacity={0.13 * lit} />}
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return <circle key={i} cx={x + Math.cos(a) * r * e} cy={y + Math.sin(a) * r * e} r={3.6} fill={lit > 0.5 ? color : C.dim} />;
      })}
      <circle cx={x} cy={y} r={r * 0.42} fill={lit > 0.5 ? color : C.dim} opacity={0.4 + 0.6 * lit} />
      {label && (
        <Label x={x} y={y + labelDy} k={k} size={labelSize}>
          {label}
        </Label>
      )}
    </g>
  );
};

// крупный вопрос/тезис — короткий, не конкурирует с титрами
export const Headline: React.FC<{ x: number; y: number; k: number; text: string; size?: number; color?: string }> = ({ x, y, k, text, size = 56, color = C.white }) => (
  <Label x={x} y={y} k={k} size={size} color={color} weight={900}>
    {text}
  </Label>
);

// мягкий световой круг (не размывает формы — просто подсветка фона)
export const Glow: React.FC<{ x: number; y: number; r: number; k: number; color?: string; o?: number }> = ({ x, y, r, k, color = C.teal, o = 0.12 }) =>
  k > 0 ? <circle cx={x} cy={y} r={r} fill={color} opacity={o * clamp01(k)} /> : null;

export const beat = (c: VisualCtx, b: number) => {
  const i = Math.floor(b);
  const frac = b - i;
  const s = c.beats[Math.min(i, c.beats.length - 1)] ?? 0;
  const e = c.ends[Math.min(i, c.ends.length - 1)] ?? s;
  return s + (e - s) * frac;
};
// прогресс 0…1, начиная с реплики b, длительностью d секунд
export const kAt = (c: VisualCtx, b: number, d = 1.6) => clamp01((c.t - beat(c, b)) / d);
