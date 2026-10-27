// Кисть: локальные координаты — запястье в (0,0), кисть вытянута вдоль +y.
// thumb: +1 — большой палец справа от оси кисти, -1 — слева.
import React from "react";
import { OUTLINE, OUTLINE_W } from "./looks";
import type { HandShape } from "./pose";

const f = (n: number) => n.toFixed(2);

export const HandGlyph: React.FC<{ shape: HandShape; L: number; skin: string; shade: string; thumb: number }> = ({ shape, L, skin, shade, thumb }) => {
  const W = L * 0.78;
  const t = thumb;
  const stroke = { stroke: OUTLINE, strokeWidth: OUTLINE_W, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const crease = (d: string) => <path d={d} fill="none" stroke={shade} strokeWidth={OUTLINE_W * 0.8} strokeLinecap="round" />;
  const palm = `M ${f(-W * 0.38)} 0 L ${f(W * 0.38)} 0 L ${f(W * 0.5)} ${f(L * 0.5)} L ${f(-W * 0.5)} ${f(L * 0.5)} Z`;

  if (shape === "open" || shape === "flat" || shape === "palmUp") {
    // ладонь с сомкнутыми пальцами и отведённым большим пальцем
    const fingers = `M ${f(-W * 0.5)} ${f(L * 0.42)} C ${f(-W * 0.55)} ${f(L * 0.8)} ${f(-W * 0.42)} ${f(L * 1.02)} ${f(-W * 0.12)} ${f(L * 1.04)} C ${f(W * 0.15)} ${f(L * 1.06)} ${f(W * 0.48)} ${f(L * 0.98)} ${f(W * 0.52)} ${f(L * 0.72)} L ${f(W * 0.5)} ${f(L * 0.38)} Z`;
    const thumbD = `M ${f(t * W * 0.36)} ${f(L * 0.12)} C ${f(t * W * 0.75)} ${f(L * 0.18)} ${f(t * W * 0.95)} ${f(L * 0.42)} ${f(t * W * 0.85)} ${f(L * 0.55)} C ${f(t * W * 0.72)} ${f(L * 0.62)} ${f(t * W * 0.52)} ${f(L * 0.45)} ${f(t * W * 0.38)} ${f(L * 0.4)} Z`;
    return (
      <g>
        <path d={thumbD} fill={skin} {...stroke} />
        <path d={palm} fill={skin} {...stroke} />
        <path d={fingers} fill={skin} {...stroke} />
        <path d={palm} fill={skin} stroke="none" transform={`translate(0 ${f(-L * 0.02)}) scale(0.92)`} />
        {crease(`M ${f(-W * 0.18)} ${f(L * 0.62)} L ${f(-W * 0.2)} ${f(L * 0.95)}`)}
        {crease(`M ${f(W * 0.1)} ${f(L * 0.62)} L ${f(W * 0.1)} ${f(L * 0.98)}`)}
        {crease(`M ${f(W * 0.34)} ${f(L * 0.6)} L ${f(W * 0.36)} ${f(L * 0.88)}`)}
        {shape === "palmUp" ? crease(`M ${f(-W * 0.3)} ${f(L * 0.35)} Q 0 ${f(L * 0.45)} ${f(W * 0.3)} ${f(L * 0.3)}`) : null}
      </g>
    );
  }
  if (shape === "point") {
    const fist = `M ${f(-W * 0.45)} ${f(L * 0.05)} C ${f(-W * 0.6)} ${f(L * 0.5)} ${f(-W * 0.45)} ${f(L * 0.72)} ${f(-W * 0.05)} ${f(L * 0.72)} C ${f(W * 0.35)} ${f(L * 0.72)} ${f(W * 0.55)} ${f(L * 0.55)} ${f(W * 0.48)} ${f(L * 0.05)} Z`;
    const index = `M ${f(-t * W * 0.05)} ${f(L * 0.55)} L ${f(-t * W * 0.08)} ${f(L * 1.18)} C ${f(-t * W * 0.1)} ${f(L * 1.3)} ${f(t * W * 0.22)} ${f(L * 1.3)} ${f(t * W * 0.2)} ${f(L * 1.16)} L ${f(t * W * 0.22)} ${f(L * 0.55)} Z`;
    return (
      <g>
        <path d={fist} fill={skin} {...stroke} />
        <path d={index} fill={skin} {...stroke} />
        {crease(`M ${f(-W * 0.4)} ${f(L * 0.45)} Q ${f(-W * 0.2)} ${f(L * 0.55)} ${f(-W * 0.05)} ${f(L * 0.5)}`)}
        <path d={`M ${f(t * W * 0.42)} ${f(L * 0.15)} Q ${f(t * W * 0.62)} ${f(L * 0.4)} ${f(t * W * 0.3)} ${f(L * 0.48)}`} fill={skin} {...stroke} />
      </g>
    );
  }
  if (shape === "grip") {
    // полусогнутые пальцы, захват сверху
    const back = `M ${f(-W * 0.42)} 0 L ${f(W * 0.42)} 0 C ${f(W * 0.6)} ${f(L * 0.35)} ${f(W * 0.58)} ${f(L * 0.72)} ${f(W * 0.35)} ${f(L * 0.92)} C ${f(W * 0.1)} ${f(L * 1.02)} ${f(-W * 0.2)} ${f(L * 1.0)} ${f(-W * 0.4)} ${f(L * 0.88)} C ${f(-W * 0.58)} ${f(L * 0.7)} ${f(-W * 0.6)} ${f(L * 0.35)} ${f(-W * 0.42)} 0 Z`;
    return (
      <g>
        <path d={back} fill={skin} {...stroke} />
        {crease(`M ${f(-W * 0.38)} ${f(L * 0.62)} Q 0 ${f(L * 0.74)} ${f(W * 0.4)} ${f(L * 0.62)}`)}
        {crease(`M ${f(-W * 0.1)} ${f(L * 0.72)} L ${f(-W * 0.1)} ${f(L * 0.95)}`)}
        {crease(`M ${f(W * 0.15)} ${f(L * 0.72)} L ${f(W * 0.16)} ${f(L * 0.94)}`)}
        <path d={`M ${f(t * W * 0.45)} ${f(L * 0.15)} C ${f(t * W * 0.75)} ${f(L * 0.35)} ${f(t * W * 0.7)} ${f(L * 0.62)} ${f(t * W * 0.5)} ${f(L * 0.78)}`} fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_W} strokeLinecap="round" />
      </g>
    );
  }
  if (shape === "pinch") {
    // щепоть (ролик 80-1-2): большой и указательный пальцы сведены у точки
    // (0, 1.12·L) — там лежит мелкий предмет; остальные пальцы поджаты
    const back = `M ${f(-W * 0.42)} 0 L ${f(W * 0.42)} 0 C ${f(W * 0.58)} ${f(L * 0.3)} ${f(W * 0.55)} ${f(L * 0.62)} ${f(W * 0.3)} ${f(L * 0.74)} C ${f(W * 0.05)} ${f(L * 0.82)} ${f(-W * 0.3)} ${f(L * 0.8)} ${f(-W * 0.48)} ${f(L * 0.6)} C ${f(-W * 0.6)} ${f(L * 0.35)} ${f(-W * 0.55)} ${f(L * 0.12)} ${f(-W * 0.42)} 0 Z`;
    const index = `M ${f(-t * W * 0.3)} ${f(L * 0.6)} C ${f(-t * W * 0.32)} ${f(L * 0.9)} ${f(-t * W * 0.16)} ${f(L * 1.12)} ${f(t * W * 0.02)} ${f(L * 1.14)} C ${f(t * W * 0.1)} ${f(L * 1.1)} ${f(-t * W * 0.04)} ${f(L * 0.85)} ${f(t * W * 0.02)} ${f(L * 0.66)} Z`;
    const thumbD = `M ${f(t * W * 0.4)} ${f(L * 0.18)} C ${f(t * W * 0.62)} ${f(L * 0.5)} ${f(t * W * 0.42)} ${f(L * 0.98)} ${f(t * W * 0.06)} ${f(L * 1.1)} C ${f(t * W * 0.02)} ${f(L * 1.0)} ${f(t * W * 0.2)} ${f(L * 0.62)} ${f(t * W * 0.16)} ${f(L * 0.4)} Z`;
    return (
      <g>
        <path d={back} fill={skin} {...stroke} />
        <path d={index} fill={skin} {...stroke} />
        <path d={thumbD} fill={skin} {...stroke} />
        {crease(`M ${f(-W * 0.36)} ${f(L * 0.5)} Q 0 ${f(L * 0.6)} ${f(W * 0.36)} ${f(L * 0.48)}`)}
      </g>
    );
  }
  if (shape === "fist") {
    const d = `M ${f(-W * 0.45)} 0 L ${f(W * 0.45)} 0 C ${f(W * 0.62)} ${f(L * 0.3)} ${f(W * 0.6)} ${f(L * 0.7)} ${f(W * 0.3)} ${f(L * 0.78)} C ${f(0)} ${f(L * 0.84)} ${f(-W * 0.35)} ${f(L * 0.8)} ${f(-W * 0.55)} ${f(L * 0.62)} C ${f(-W * 0.62)} ${f(L * 0.35)} ${f(-W * 0.55)} ${f(L * 0.1)} ${f(-W * 0.45)} 0 Z`;
    return (
      <g>
        <path d={d} fill={skin} {...stroke} />
        {crease(`M ${f(-W * 0.3)} ${f(L * 0.55)} Q 0 ${f(L * 0.65)} ${f(W * 0.35)} ${f(L * 0.52)}`)}
      </g>
    );
  }
  // relaxed: слегка согнутые пальцы
  const d = `M ${f(-W * 0.4)} 0 L ${f(W * 0.4)} 0 C ${f(W * 0.55)} ${f(L * 0.35)} ${f(W * 0.55)} ${f(L * 0.75)} ${f(W * 0.3)} ${f(L * 0.92)} C ${f(W * 0.1)} ${f(L * 1.02)} ${f(-W * 0.25)} ${f(L * 0.98)} ${f(-W * 0.42)} ${f(L * 0.8)} C ${f(-W * 0.56)} ${f(L * 0.55)} ${f(-W * 0.52)} ${f(L * 0.25)} ${f(-W * 0.4)} 0 Z`;
  return (
    <g>
      <path d={`M ${f(t * W * 0.35)} ${f(L * 0.1)} C ${f(t * W * 0.7)} ${f(L * 0.25)} ${f(t * W * 0.68)} ${f(L * 0.5)} ${f(t * W * 0.45)} ${f(L * 0.6)} Z`} fill={skin} {...stroke} />
      <path d={d} fill={skin} {...stroke} />
      {crease(`M ${f(-W * 0.12)} ${f(L * 0.6)} Q ${f(-W * 0.14)} ${f(L * 0.8)} ${f(-W * 0.1)} ${f(L * 0.92)}`)}
      {crease(`M ${f(W * 0.15)} ${f(L * 0.6)} Q ${f(W * 0.16)} ${f(L * 0.78)} ${f(W * 0.14)} ${f(L * 0.88)}`)}
    </g>
  );
};
