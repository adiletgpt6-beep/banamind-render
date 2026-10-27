// Предметы: низкий столик, деревянные кубики, красная крыша, домик,
// ящик с игрушками, деревянное деревце. Один и тот же домик — на столе,
// в воспоминании и на картинках доски: те же цвета, детали и пропорции.
import React from "react";
import { OUTLINE } from "../rig/looks";

const f = (n: number) => n.toFixed(2);
export const CUBE = 34; // ребро кубика (ед. мира при масштабе 1)
const DX = 0.34; // косоугольная проекция: глубина вправо-вверх
const DY = -0.3;

export const WOOD = ["#cf9c69", "#bd8b5f", "#c9925f", "#b98252", "#d3a675", "#c08a58"];
export const ROOF = { front: "#c65c49", left: "#d26f5a", right: "#a94a3a", trim: "#8e3b2e" };

export type CubeDeco = "door" | "window" | "plain" | "dots";

// Кубик: x, y — нижний левый угол передней грани.
export const Cube: React.FC<{ x: number; y: number; c?: number; color: string; deco: CubeDeco; rot?: number }> = ({ x, y, c = CUBE, color, deco, rot = 0 }) => {
  const dx = c * DX;
  const dy = c * DY;
  const ol = c * 0.055;
  const front = `M ${f(x)} ${f(y)} h ${f(c)} v ${f(-c)} h ${f(-c)} Z`;
  const top = `M ${f(x)} ${f(y - c)} l ${f(dx)} ${f(dy)} h ${f(c)} l ${f(-dx)} ${f(-dy)} Z`;
  const side = `M ${f(x + c)} ${f(y)} l ${f(dx)} ${f(dy)} v ${f(-c)} l ${f(-dx)} ${f(-dy)} Z`;
  return (
    <g transform={rot ? `rotate(${f(rot)} ${f(x + c / 2)} ${f(y - c / 2)})` : undefined}>
      <path d={side} fill={color} stroke={OUTLINE} strokeWidth={ol} strokeLinejoin="round" />
      <path d={side} fill="#000" opacity={0.16} />
      <path d={top} fill={color} stroke={OUTLINE} strokeWidth={ol} strokeLinejoin="round" />
      <path d={top} fill="#fff" opacity={0.18} />
      <path d={front} fill={color} stroke={OUTLINE} strokeWidth={ol} strokeLinejoin="round" />
      {/* волокна дерева */}
      <path d={`M ${f(x + c * 0.15)} ${f(y - c * 0.3)} q ${f(c * 0.35)} ${f(-c * 0.08)} ${f(c * 0.7)} 0`} fill="none" stroke="#8d5f3a" strokeOpacity={0.35} strokeWidth={c * 0.03} />
      {deco === "door" ? <path d={`M ${f(x + c * 0.3)} ${f(y)} v ${f(-c * 0.5)} a ${f(c * 0.2)} ${f(c * 0.2)} 0 0 1 ${f(c * 0.4)} 0 v ${f(c * 0.5)} Z`} fill="#6e4528" stroke={OUTLINE} strokeWidth={ol * 0.8} /> : null}
      {deco === "window" ? (
        <g>
          <rect x={f(x + c * 0.25)} y={f(y - c * 0.75)} width={f(c * 0.5)} height={f(c * 0.5)} fill="#8fc6e3" stroke={OUTLINE} strokeWidth={ol * 0.8} />
          <path d={`M ${f(x + c * 0.5)} ${f(y - c * 0.75)} v ${f(c * 0.5)} M ${f(x + c * 0.25)} ${f(y - c * 0.5)} h ${f(c * 0.5)}`} stroke="#f3e6cf" strokeWidth={c * 0.06} />
        </g>
      ) : null}
      {deco === "dots" ? <circle cx={f(x + c * 0.5)} cy={f(y - c * 0.5)} r={f(c * 0.14)} fill="#7da9c9" stroke={OUTLINE} strokeWidth={ol * 0.6} /> : null}
    </g>
  );
};

// Крыша: x — центр основания (передний край), y — линия основания.
export const Roof: React.FC<{ x: number; y: number; c?: number; rot?: number }> = ({ x, y, c = CUBE, rot = 0 }) => {
  const half = c * 1.5 + c * 0.22;
  const hgt = c * 1.15;
  const dx = c * 3 * DX * 0.36;
  const dy = c * 3 * DY * 0.36;
  const ol = c * 0.055;
  const eL = { x: x - half, y };
  const eR = { x: x + half, y };
  const ap = { x, y: y - hgt };
  const sh = (p: { x: number; y: number }) => ({ x: p.x + dx * 2.6, y: p.y + dy * 2.6 });
  const P = (p: { x: number; y: number }) => `${f(p.x)} ${f(p.y)}`;
  return (
    <g transform={rot ? `rotate(${f(rot)} ${f(x)} ${f(y - hgt / 2)})` : undefined}>
      <path d={`M ${P(eL)} L ${P(ap)} L ${P(sh(ap))} L ${P(sh(eL))} Z`} fill={ROOF.left} stroke={OUTLINE} strokeWidth={ol} strokeLinejoin="round" />
      <path d={`M ${P(ap)} L ${P(eR)} L ${P(sh(eR))} L ${P(sh(ap))} Z`} fill={ROOF.right} stroke={OUTLINE} strokeWidth={ol} strokeLinejoin="round" />
      <path d={`M ${P(eL)} L ${P(ap)} L ${P(eR)} Z`} fill={ROOF.front} stroke={OUTLINE} strokeWidth={ol} strokeLinejoin="round" />
      <circle cx={f(x)} cy={f(y - hgt * 0.38)} r={f(c * 0.18)} fill="#f4e3c3" stroke={OUTLINE} strokeWidth={ol * 0.8} />
      <path d={`M ${P(eL)} L ${P(eR)}`} stroke={ROOF.trim} strokeWidth={c * 0.08} strokeLinecap="round" />
    </g>
  );
};

// Детали домика: 6 кубиков и крыша. Позиции — в координатах домика
// (0,0) — центр переднего нижнего ребра основания.
export type HousePart = { id: string; kind: "cube" | "roof"; color?: string; deco?: CubeDeco; at: { x: number; y: number } };
export const HOUSE_PARTS: HousePart[] = [
  { id: "c0", kind: "cube", color: WOOD[0], deco: "plain", at: { x: -1.5 * CUBE, y: 0 } },
  { id: "c1", kind: "cube", color: WOOD[1], deco: "door", at: { x: -0.5 * CUBE, y: 0 } },
  { id: "c2", kind: "cube", color: WOOD[2], deco: "plain", at: { x: 0.5 * CUBE, y: 0 } },
  { id: "c3", kind: "cube", color: WOOD[3], deco: "window", at: { x: -1.5 * CUBE, y: -CUBE } },
  { id: "c4", kind: "cube", color: WOOD[4], deco: "dots", at: { x: -0.5 * CUBE, y: -CUBE } },
  { id: "c5", kind: "cube", color: WOOD[5], deco: "window", at: { x: 0.5 * CUBE, y: -CUBE } },
  { id: "roof", kind: "roof", at: { x: 0, y: -2 * CUBE } },
];

// Состояние детали: собственная позиция (в координатах домика) или «в руке»
// (позицию задаёт родитель через override).
export type PartState = { x: number; y: number; rot?: number; hidden?: boolean };

export const HousePiece: React.FC<{ part: HousePart; x: number; y: number; rot?: number }> = ({ part, x, y, rot }) =>
  part.kind === "roof" ? <Roof x={x} y={y} rot={rot} /> : <Cube x={x} y={y} color={part.color!} deco={part.deco!} rot={rot} />;

// Домик; states — переопределения позиций отдельных деталей.
export const House: React.FC<{ x: number; y: number; s: number; states?: Record<string, PartState | undefined>; shadow?: boolean }> = ({ x, y, s, states = {}, shadow = true }) => {
  const order = ["c0", "c1", "c2", "c3", "c4", "c5", "roof"];
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
      {shadow ? <ellipse cx={f(CUBE * 0.4)} cy={f(-CUBE * 0.08)} rx={f(CUBE * 2.1)} ry={f(CUBE * 0.32)} fill="#3b2418" opacity={0.25} /> : null}
      {order.map((id) => {
        const part = HOUSE_PARTS.find((p) => p.id === id)!;
        const st = states[id];
        if (st?.hidden) return null;
        const px = st ? st.x : part.at.x;
        const py = st ? st.y : part.at.y;
        return <HousePiece key={id} part={part} x={px} y={py} rot={st?.rot} />;
      })}
    </g>
  );
};

// Деревянное деревце-игрушка: x, y — центр подставки.
export const ToyTree: React.FC<{ x: number; y: number; s: number; rot?: number; shadow?: boolean }> = ({ x, y, s, rot = 0, shadow = true }) => {
  const c = CUBE;
  const ol = c * 0.055;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)}) rotate(${f(rot)})`}>
      {shadow ? <ellipse cx={4} cy={-1} rx={c * 0.7} ry={c * 0.16} fill="#3b2418" opacity={0.25} /> : null}
      <ellipse cx={0} cy={-c * 0.08} rx={c * 0.55} ry={c * 0.18} fill="#b98252" stroke={OUTLINE} strokeWidth={ol} />
      <rect x={-c * 0.13} y={-c * 1.05} width={c * 0.26} height={c * 0.97} fill="#8d5f3a" stroke={OUTLINE} strokeWidth={ol} />
      <path d={`M 0 ${-c * 2.6} C ${c * 0.75} ${-c * 2.55} ${c * 0.85} ${-c * 1.35} ${c * 0.1} ${-c * 1.0} L ${-c * 0.1} ${-c * 1.0} C ${-c * 0.85} ${-c * 1.35} ${-c * 0.75} ${-c * 2.55} 0 ${-c * 2.6} Z`} fill="#5f9e6e" stroke={OUTLINE} strokeWidth={ol} strokeLinejoin="round" />
      <path d={`M ${-c * 0.3} ${-c * 2.15} q ${c * 0.1} ${-c * 0.25} ${c * 0.3} ${-c * 0.3}`} fill="none" stroke="#a9d4a8" strokeWidth={c * 0.08} strokeLinecap="round" />
    </g>
  );
};

// Низкий столик: x — центр, floorY — линия пола, s — масштаб.
export const Table: React.FC<{ x: number; floorY: number; s: number; w: number; legH: number; topD: number }> = ({ x, floorY, s, w, legH, topD }) => {
  const hw = (w * s) / 2;
  const top = floorY - legH * s;
  const th = 18 * s;
  const dx = topD * s * 0.55;
  const dy = -topD * s;
  const ol = 3;
  return (
    <g>
      <ellipse cx={f(x + dx * 0.4)} cy={f(floorY)} rx={f(hw * 1.08)} ry={f(26 * s)} fill="#16304a" opacity={0.22} />
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={f(x + sd * (hw - 30 * s) - 13 * s + dx * 0.85)} y={f(top + dy * 0.85)} width={f(26 * s)} height={f(legH * s - dy * 0.1)} fill="#8a5b36" stroke={OUTLINE} strokeWidth={ol} />
        </g>
      ))}
      {[-1, 1].map((sd) => (
        <rect key={`f${sd}`} x={f(x + sd * (hw - 30 * s) - 14 * s)} y={f(top)} width={f(28 * s)} height={f(legH * s)} fill="#9c6a40" stroke={OUTLINE} strokeWidth={ol} />
      ))}
      <path d={`M ${f(x - hw)} ${f(top)} L ${f(x - hw + dx)} ${f(top + dy)} L ${f(x + hw + dx)} ${f(top + dy)} L ${f(x + hw)} ${f(top)} Z`} fill="#c9925f" stroke={OUTLINE} strokeWidth={ol} strokeLinejoin="round" />
      <path d={`M ${f(x - hw + 40 * s)} ${f(top + dy * 0.35)} L ${f(x + hw - 60 * s)} ${f(top + dy * 0.35)}`} stroke="#b07a4c" strokeWidth={3 * s} opacity={0.6} />
      <path d={`M ${f(x - hw)} ${f(top)} L ${f(x + hw)} ${f(top)} L ${f(x + hw)} ${f(top + th)} L ${f(x - hw)} ${f(top + th)} Z`} fill="#a87347" stroke={OUTLINE} strokeWidth={ol} />
      <path d={`M ${f(x + hw)} ${f(top)} L ${f(x + hw + dx)} ${f(top + dy)} L ${f(x + hw + dx)} ${f(top + dy + th)} L ${f(x + hw)} ${f(top + th)} Z`} fill="#8a5b36" stroke={OUTLINE} strokeWidth={ol} />
    </g>
  );
};

// Открытый ящик для игрушек: x — центр, y — линия пола.
export const ToyBox: React.FC<{ x: number; y: number; s: number; children?: React.ReactNode }> = ({ x, y, s, children }) => {
  const w = 120;
  const h = 62;
  const d = 40;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
      <ellipse cx={10} cy={0} rx={w * 0.62} ry={12} fill="#16304a" opacity={0.22} />
      <path d={`M ${-w / 2} ${-h} l ${d * 0.6} ${-d * 0.55} h ${w} l ${-d * 0.6} ${d * 0.55} Z`} fill="#5c3b24" stroke={OUTLINE} strokeWidth={3} />
      {children}
      <path d={`M ${w / 2} 0 l ${d * 0.6} ${-d * 0.55} v ${-h} l ${-d * 0.6} ${d * 0.55} Z`} fill="#8a5b36" stroke={OUTLINE} strokeWidth={3} />
      <rect x={-w / 2} y={-h} width={w} height={h} fill="#a87347" stroke={OUTLINE} strokeWidth={3} />
      <path d={`M ${-w / 2 + 10} ${-h / 2} h ${w - 20}`} stroke="#8a5b36" strokeWidth={3} />
    </g>
  );
};
