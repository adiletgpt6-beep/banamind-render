// Лабораторный набор BM-038: прозрачная камера принципа, идея-искра, сеть
// разговоров (цепная реакция), столбики данных, крупная цифра и лампа «сбой
// гипотезы». Всё — чистый вектор, детерминированно по времени сцены.
import React from "react";
import { C, CELL, DISPLAY, FONT, type CellId } from "../theme";
import { hash } from "./dots";
import { OL } from "./draw";
import { clamp01, ease, Txt } from "./kit";

// ── идея-искра: ядро, чёткие кольца и лучи (без размытия) ──
export const Spark: React.FC<{ x: number; y: number; r?: number; t: number; k?: number; color?: string; dim?: number }> = ({ x, y, r = 34, t, k = 1, color = C.spark, dim = 0 }) => {
  if (k <= 0.001) return null;
  const pulse = 1 + Math.sin(t * 3.2) * 0.06 * (1 - dim);
  const col = dim > 0.5 ? C.grey : color;
  return (
    <g transform={`translate(${x} ${y}) scale(${k * pulse})`}>
      {[2.3, 1.75].map((m, i) => (
        <circle key={i} r={r * m} fill={col} opacity={(0.1 + i * 0.08) * (1 - dim)} />
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + t * 0.6;
        const l1 = r * 1.25;
        const l2 = r * (1.7 + 0.15 * Math.sin(t * 4 + i));
        return <line key={i} x1={Math.cos(a) * l1} y1={Math.sin(a) * l1} x2={Math.cos(a) * l2} y2={Math.sin(a) * l2} stroke={col} strokeWidth={r * 0.16} strokeLinecap="round" opacity={1 - dim * 0.8} />;
      })}
      <circle r={r} fill={col} stroke={OL} strokeWidth={4} />
      <circle r={r * 0.45} cx={-r * 0.28} cy={-r * 0.3} fill="#fff" opacity={0.55 * (1 - dim)} />
    </g>
  );
};

// ── прозрачная камера принципа ──
export const Chamber: React.FC<{ cell: CellId; x: number; y: number; w: number; h: number; k?: number; label?: boolean; glow?: number; children?: React.ReactNode; small?: boolean }> = ({ cell, x, y, w, h, k = 1, label = true, glow = 0, children, small = false }) => {
  if (k <= 0.001) return null;
  const c = CELL[cell];
  const id = `ch-${cell}-${Math.round(x)}-${Math.round(y)}-${Math.round(w)}`;
  const capH = small ? 46 : 70;
  return (
    <g opacity={clamp01(k * 1.4)} transform={`translate(${x + w / 2} ${y + h}) scale(${0.85 + 0.15 * ease(clamp01(k))}) translate(${-x - w / 2} ${-y - h})`}>
      <defs>
        <clipPath id={id}>
          <rect x={x + 6} y={y + capH} width={w - 12} height={h - capH - 6} rx={20} />
        </clipPath>
      </defs>
      {glow > 0 && <rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} rx={44} fill={c.color} opacity={0.18 * glow} />}
      <rect x={x + 8} y={y + 12} width={w} height={h} rx={30} fill="#1d2340" opacity={0.1} />
      <rect x={x} y={y} width={w} height={h} rx={30} fill={c.light} stroke={c.deep} strokeWidth={6} />
      <rect x={x + 6} y={y + capH} width={w - 12} height={h - capH - 6} rx={20} fill="#ffffff" opacity={0.62} />
      <g clipPath={`url(#${id})`}>
        {children}
        <path d={`M ${x + w * 0.12} ${y + capH} L ${x + w * 0.24} ${y + capH} L ${x + w * 0.08} ${y + h} L ${x - w * 0.04} ${y + h} Z`} fill="#fff" opacity={0.35} />
      </g>
      <rect x={x} y={y} width={w} height={capH} rx={30} fill={c.color} stroke={c.deep} strokeWidth={6} />
      <rect x={x + 3} y={y + capH - 24} width={w - 6} height={22} fill={c.color} />
      {label && (
        <g>
          <circle cx={x + capH * 0.62} cy={y + capH / 2} r={capH * 0.36} fill="#fff" stroke={c.deep} strokeWidth={4} />
          <text x={x + capH * 0.62} y={y + capH / 2 + capH * 0.17} fontFamily={DISPLAY} fontWeight={800} fontSize={capH * 0.46} fill={c.deep} textAnchor="middle">
            {c.n}
          </text>
          <text x={x + capH * 1.15} y={y + capH / 2 + capH * 0.15} fontFamily={FONT} fontWeight={900} fontSize={Math.min(capH * 0.42, (w - capH * 1.4) / Math.max(4, c.name.length * 0.56))} fill="#fff">
            {small ? c.short : c.name}
          </text>
        </g>
      )}
    </g>
  );
};

// ── сеть разговоров: от искры расходятся поколения людей-точек ──
export type NetNode = { x: number; y: number; g: number; parent: number; dead: boolean; c: string };
const netCache = new Map<string, NetNode[]>();
export const buildNet = (key: string, cx: number, cy: number, opts: { gens: number; fan: number; step: number; spread?: number; dir?: number; dead?: number; colors: string[]; jitter?: number }): NetNode[] => {
  const ck = `${key}|${cx}|${cy}|${JSON.stringify(opts)}`;
  const hit = netCache.get(ck);
  if (hit) return hit;
  const { gens, fan, step, spread = Math.PI * 2, dir = -Math.PI / 2, dead = 0, colors, jitter = 0.35 } = opts;
  const nodes: NetNode[] = [{ x: cx, y: cy, g: 0, parent: -1, dead: false, c: colors[0] }];
  let frontier = [{ i: 0, a0: dir - spread / 2, a1: dir + spread / 2 }];
  let n = 1;
  for (let g = 1; g <= gens; g++) {
    const next: typeof frontier = [];
    for (const f of frontier) {
      const p = nodes[f.i];
      if (p.dead) continue;
      const kids = g === 1 ? Math.max(3, fan + 1) : Math.max(1, Math.round(fan - 0.6 + hash(n, 11) * 1.4));
      for (let j = 0; j < kids; j++) {
        const a = f.a0 + ((j + 0.5) / kids) * (f.a1 - f.a0) + (hash(n, 13) - 0.5) * jitter * ((f.a1 - f.a0) / kids);
        const rr = step * (0.85 + hash(n, 17) * 0.3);
        const x = p.x + Math.cos(a) * rr;
        const y = p.y + Math.sin(a) * rr * 0.82;
        const isDead = g > 1 && hash(n, 19) < dead;
        nodes.push({ x, y, g, parent: f.i, dead: isDead, c: colors[(g + j) % colors.length] });
        const w = (f.a1 - f.a0) / kids;
        next.push({ i: nodes.length - 1, a0: a - w * 0.62, a1: a + w * 0.62 });
        n++;
      }
    }
    frontier = next;
  }
  netCache.set(ck, nodes);
  return nodes;
};

// k — прогресс в поколениях (0…gens); узлы и связи появляются волной
export const Net: React.FC<{ nodes: NetNode[]; k: number; t: number; r?: number; people?: boolean; fade?: number; edge?: string }> = ({ nodes, k, t, r = 13, people = true, fade = 0, edge }) => (
  <g opacity={1 - fade}>
    {nodes.map((nd, i) => {
      if (nd.parent < 0) return null;
      const p = nodes[nd.parent];
      const e = clamp01(k - (nd.g - 1));
      if (e <= 0) return null;
      const x2 = p.x + (nd.x - p.x) * ease(e);
      const y2 = p.y + (nd.y - p.y) * ease(e);
      return <line key={`e${i}`} x1={p.x} y1={p.y} x2={x2} y2={y2} stroke={edge ?? (nd.dead ? C.grey : nd.c)} strokeWidth={r * 0.36} strokeLinecap="round" opacity={nd.dead ? 0.6 : 0.85} />;
    })}
    {nodes.map((nd, i) => {
      if (nd.parent < 0) return null;
      const e = clamp01((k - (nd.g - 1) - 0.65) / 0.35);
      if (e <= 0) return null;
      const s = ease(e) * (1 + 0.05 * Math.sin(t * 2 + i));
      const col = nd.dead ? C.grey : nd.c;
      return (
        <g key={`n${i}`} transform={`translate(${nd.x} ${nd.y}) scale(${s})`}>
          {people ? (
            <g>
              <path d={`M ${-r * 1.05} ${r * 1.5} Q ${-r * 1.05} ${r * 0.25} 0 ${r * 0.25} Q ${r * 1.05} ${r * 0.25} ${r * 1.05} ${r * 1.5} Z`} fill={col} stroke={OL} strokeWidth={2.5} />
              <circle cy={-r * 0.45} r={r * 0.62} fill={col} stroke={OL} strokeWidth={2.5} />
            </g>
          ) : (
            <circle r={r} fill={col} stroke={OL} strokeWidth={2.5} />
          )}
        </g>
      );
    })}
  </g>
);

// ── столбики данных (подписи крупные, значения точкой) ──
export type BarItem = { label: string; value: number; color: string; text?: string; at: number };
export const Bars: React.FC<{ items: BarItem[]; x0: number; x1: number; base: number; hMax: number; max: number; t: number; size?: number }> = ({ items, x0, x1, base, hMax, max, t, size = 34 }) => {
  const w = (x1 - x0) / items.length;
  return (
    <g>
      <line x1={x0 - 10} y1={base} x2={x1 + 10} y2={base} stroke={OL} strokeWidth={5} strokeLinecap="round" />
      {items.map((it, i) => {
        const k = ease(clamp01((t - it.at) / 0.9));
        const h = (Math.abs(it.value) / max) * hMax * k;
        const neg = it.value < 0;
        const cx = x0 + w * (i + 0.5);
        const bw = Math.min(160, w * 0.56);
        return (
          <g key={i} opacity={clamp01((t - it.at + 0.3) * 3)}>
            <rect x={cx - bw / 2} y={neg ? base : base - h} width={bw} height={h} rx={14} fill={it.color} stroke={OL} strokeWidth={4} />
            <Txt x={cx} y={neg ? base + h + size * 1.25 : base - h - 18} size={size * 1.15} weight={900}>
              {k > 0.6 ? it.text ?? `${it.value}` : " "}
            </Txt>
            <Txt x={cx} y={neg ? base - 22 : base + size * 1.3} size={size} color={C.inkSoft} weight={800}>
              {it.label}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ── крупная цифра с подписью ──
export const BigNum: React.FC<{ x: number; y: number; text: string; sub?: string; k: number; color?: string; size?: number }> = ({ x, y, text, sub, k, color = C.ink, size = 120 }) => {
  if (k <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * ease(clamp01(k))})`} opacity={clamp01(k * 1.6)}>
      <text x={0} y={0} fontFamily={DISPLAY} fontWeight={800} fontSize={size} fill={color} textAnchor="middle" stroke="#fff" strokeWidth={size * 0.06} paintOrder="stroke">
        {text}
      </text>
      {sub && (
        <Txt x={0} y={size * 0.55} size={size * 0.3} color={C.inkSoft} weight={800}>
          {sub}
        </Txt>
      )}
    </g>
  );
};

// ── лампа «сбой гипотезы» ──
export const Lamp: React.FC<{ x: number; y: number; t: number; k: number; color?: string; s?: number }> = ({ x, y, t, k, color = C.red, s = 1 }) => {
  if (k <= 0.001) return null;
  const on = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 5));
  return (
    <g transform={`translate(${x} ${y}) scale(${s * ease(clamp01(k))})`}>
      <circle r={70} fill={color} opacity={0.15 * on} />
      <circle r={52} fill={color} opacity={0.22 * on} />
      <path d="M -34 6 A 34 34 0 0 1 34 6 L 34 30 L -34 30 Z" fill={color} stroke={OL} strokeWidth={5} opacity={0.6 + 0.4 * on} />
      <rect x={-46} y={30} width={92} height={22} rx={8} fill="#4a5378" stroke={OL} strokeWidth={5} />
      <circle cx={-12} cy={-6} r={8} fill="#fff" opacity={0.6} />
    </g>
  );
};

// детерминированные «точки-пыль» внутри камеры (живое, но не хаотичное)
export const Motes: React.FC<{ x: number; y: number; w: number; h: number; t: number; color: string; n?: number; seed?: number }> = ({ x, y, w, h, t, color, n = 26, seed = 0 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const px = x + hash(i, seed + 1) * w;
      const py = y + h - ((hash(i, seed + 2) * h + t * (16 + hash(i, seed + 3) * 18)) % h);
      return <circle key={i} cx={px + Math.sin(t + i) * 6} cy={py} r={3 + hash(i, seed + 4) * 3} fill={color} opacity={0.35} />;
    })}
  </g>
);
