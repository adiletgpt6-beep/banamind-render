// Общие детали схем BM-010: область кадра рядом с бананом, крупная надпись,
// объёмная карточка, скрещённые мечи (конкуренция), список с появлением по репликам.
import React from "react";
import { Panel, Txt, clamp01, pop, type VisualCtx } from "../../lesson-traktat/visuals/kit";
import { C, Z } from "../theme";
import { OL } from "./draw";

// центр свободной от банана области кадра (банан слева → схема правее, и наоборот)
export const AX = (host?: string) => (host === "right" || host === "peek" ? 690 : host === "left" ? 1240 : 960);

export const BigLabel: React.FC<{ x: number; y: number; text: string; color?: string; k?: number; size?: number }> = ({ x, y, text, color = C.ink, k = 1, size = 76 }) => (
  <text x={x} y={y} fontFamily="Rubik, Nunito" fontWeight={900} fontSize={size} textAnchor="middle" fill={color} opacity={clamp01(k)}>
    {text}
  </text>
);

export const Card3D: React.FC<{ k: number; x: number; y: number; w: number; h: number; color: string; active?: boolean; children: React.ReactNode }> = ({ k, x, y, w, h, color, active, children }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 80}) scale(${(0.8 + 0.2 * k) * (active ? 1.04 : 1)})`} opacity={clamp01(k * 1.4)}>
      <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={34} fill="#24324a" opacity={0.12} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill={color} stroke={active ? C.yellowDeep : OL} strokeWidth={active ? 8 : 5} />
      {children}
    </g>
  );
};

export const Swords: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const clash = Math.sin(t * 6) * 6;
  const sword = (rot: number) => (
    <g transform={`rotate(${rot})`}>
      <rect x={-8} y={-120} width={16} height={150} rx={6} fill={Z.greySoft} stroke={OL} strokeWidth={4} />
      <rect x={-34} y={28} width={68} height={14} rx={6} fill={C.brown} stroke={OL} strokeWidth={4} />
      <rect x={-8} y={42} width={16} height={44} rx={6} fill={C.brown} stroke={OL} strokeWidth={4} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {sword(-35 + clash)}
      {sword(35 - clash)}
      <circle cx={0} cy={-70} r={10 + 4 * Math.abs(Math.sin(t * 6))} fill={C.yellow} />
    </g>
  );
};

// вертикальный список: пункты появляются в заданные моменты сцены
export const ListBoard: React.FC<{
  ctx: VisualCtx;
  x: number;
  y: number;
  w: number;
  items: { text: string; at: number; color?: string; icon?: React.ReactNode }[];
  rowH?: number;
  size?: number;
  activeColor?: string;
}> = ({ ctx, x, y, w, items, rowH = 104, size = 38, activeColor = C.yellow }) => {
  const { t } = ctx;
  return (
    <g>
      {items.map((it, i) => {
        const k = pop(t, it.at);
        if (k <= 0) return null;
        const active = t >= it.at && (i === items.length - 1 || t < items[i + 1].at);
        return (
          <g key={i} transform={`translate(${x + (1 - k) * 60} ${y + i * rowH})`} opacity={clamp01(k * 1.5)}>
            <Panel x={0} y={0} w={w} h={rowH - 18} r={(rowH - 18) / 2} fill={active ? activeColor : it.color ?? "#ffffffdd"} />
            <g transform={`translate(${(rowH - 18) / 2} ${(rowH - 18) / 2})`}>
              <circle r={(rowH - 18) / 2 - 10} fill="#fff" stroke={OL} strokeWidth={4} />
              {it.icon ?? (
                <Txt x={0} y={size * 0.36} size={size} weight={900}>
                  {String(i + 1)}
                </Txt>
              )}
            </g>
            <Txt x={rowH} y={(rowH - 18) / 2 + size * 0.36} size={size} anchor="start">
              {it.text}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};
