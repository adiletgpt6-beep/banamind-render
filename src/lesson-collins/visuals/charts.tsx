// Числовые схемы BM-037. Правило: только значения, напечатанные в книге
// (итог графика, число из текста). Промежуточных точек кривых не рисуем —
// вместо «придуманной» линии показываем столбцы итоговых значений с периодом
// и единицей измерения, как они подписаны в источнике.
import React from "react";
import { C, DISPLAY, FONT } from "../theme";
import { OL } from "./draw";
import { Appear, area, at, clamp01, Drift, ramp, type VisualProps } from "./kit";
import { Chip, SceneTitle } from "./open";

// ── столбцы итоговых значений ──
type Bar = { label: string; value: number; text: string; color?: string; at?: number };
type BarsP = { host?: string; title: string; note?: string; bars: Bar[]; log?: boolean; unit?: string; noteAt?: number };
export const EndBars: React.FC<VisualProps<BarsP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const n = p.bars.length;
  const w = Math.min(1180, ar.x1 - ar.x0 - 60);
  const x0 = ar.cx - w / 2;
  const base = 790;
  const maxH = 440;
  const max = Math.max(...p.bars.map((b) => b.value));
  const scale = (v: number) => (p.log ? (Math.log10(1 + v) / Math.log10(1 + max)) * maxH : (v / max) * maxH);
  const slot = w / n;
  const bw = Math.min(170, slot * 0.6);
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      <Appear t={t} at={at(ctx, 0) - 0.2} x={ar.cx} y={160}>
        <SceneTitle x={0} y={0} text={p.title} size={44} />
      </Appear>
      <line x1={x0 - 20} y1={base} x2={x0 + w + 20} y2={base} stroke={OL} strokeWidth={6} strokeLinecap="round" />
      {p.bars.map((b, i) => {
        const k = ramp(t, at(ctx, b.at ?? 0.3 + i * 0.25), 0.9);
        const h = Math.max(6, scale(b.value) * k);
        const cx = x0 + slot * (i + 0.5);
        return (
          <g key={i}>
            <rect x={cx - bw / 2 + 6} y={base - h + 8} width={bw} height={h} rx={14} fill="#000" opacity={0.1} />
            <rect x={cx - bw / 2} y={base - h} width={bw} height={h} rx={14} fill={b.color ?? C.teal} stroke={OL} strokeWidth={5} />
            <text x={cx} y={base - h - 22} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={C.ink} textAnchor="middle" opacity={clamp01(k * 2 - 1)}>
              {b.text}
            </text>
            <text x={cx} y={base + 52} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink} textAnchor="middle">
              {b.label}
            </text>
          </g>
        );
      })}
      {p.note && <Chip x={ar.cx} y={236} text={p.note} size={26} bg={C.paper} opacity={ramp(t, at(ctx, p.noteAt ?? 0.5), 0.5)} />}
    </Drift>
  );
};

// ── сетка точек «N из M» (например, 2 из 84 интервью) ──
type GridP = { host?: string; total: number; groups: { n: number; color: string; label: string; at?: number }[]; title?: string; cols?: number; note?: string };
export const DotGrid: React.FC<VisualProps<GridP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cols = p.cols ?? 14;
  const rows = Math.ceil(p.total / cols);
  const step = 58;
  const x0 = ar.cx - ((cols - 1) * step) / 2;
  const y0 = 300;
  const owner: { color: string; at: number }[] = [];
  let i = 0;
  for (const g of p.groups) for (let k = 0; k < g.n; k++) owner[i++] = { color: g.color, at: at(ctx, g.at ?? 0.5) };
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      {p.title && (
        <Appear t={t} at={at(ctx, 0) - 0.2} x={ar.cx} y={170}>
          <SceneTitle x={0} y={0} text={p.title} size={44} />
        </Appear>
      )}
      {Array.from({ length: p.total }, (_, j) => {
        const cx = x0 + (j % cols) * step;
        const cy = y0 + Math.floor(j / cols) * step;
        const appear = ramp(t, 0.1 + j * 0.012, 0.3);
        const o = owner[j];
        const ck = o ? ramp(t, o.at + (j % 7) * 0.03, 0.4) : 0;
        return <circle key={j} cx={cx} cy={cy} r={20 * appear} fill={ck > 0.5 ? o.color : C.steelLight} stroke={OL} strokeWidth={3} />;
      })}
      {p.groups.map((g, k) => (
        <Chip key={k} x={ar.cx + (k - (p.groups.length - 1) / 2) * 430} y={y0 + rows * step + 60} text={g.label} size={30} bg={g.color} opacity={ramp(t, at(ctx, g.at ?? 0.5) + 0.3, 0.5)} />
      ))}
      {p.note && <Chip x={ar.cx} y={y0 + rows * step + 150} text={p.note} size={26} bg={C.paper} opacity={ramp(t, at(ctx, 1), 0.5)} />}
    </Drift>
  );
};

// ── «было → стало» (одно число или единица меняется) ──
type ShiftP = { host?: string; title?: string; from: string; to: string; fromLabel?: string; toLabel?: string; note?: string; toAt?: number; color?: string };
export const Shift: React.FC<VisualProps<ShiftP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const toK = ramp(t, at(ctx, p.toAt ?? 1), 0.7);
  const lx = ar.cx - 300;
  const rx = ar.cx + 300;
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      {p.title && (
        <Appear t={t} at={at(ctx, 0) - 0.2} x={ar.cx} y={190}>
          <SceneTitle x={0} y={0} text={p.title} size={46} />
        </Appear>
      )}
      <Appear t={t} at={at(ctx, 0)} x={lx} y={520}>
        <rect x={-230} y={-130} width={460} height={260} rx={36} fill={C.white} stroke={OL} strokeWidth={6} />
        <text x={0} y={22} fontFamily={DISPLAY} fontWeight={800} fontSize={Math.min(84, 400 / (p.from.length * 0.62))} fill={C.inkSoft} textAnchor="middle">
          {p.from}
        </text>
        {p.fromLabel && (
          <text x={0} y={100} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.inkSoft} textAnchor="middle">
            {p.fromLabel}
          </text>
        )}
      </Appear>
      <g opacity={toK}>
        <path d={`M ${ar.cx - 50} 520 L ${ar.cx + 40} 520`} stroke={OL} strokeWidth={14} strokeLinecap="round" />
        <path d={`M ${ar.cx + 50} 520 l -34 -28 l 0 56 Z`} fill={OL} />
      </g>
      <g transform={`translate(${rx} ${520 + (1 - toK) * 30}) scale(${0.85 + 0.15 * toK})`} opacity={toK}>
        <rect x={-230} y={-130} width={460} height={260} rx={36} fill={p.color ?? C.yellow} stroke={OL} strokeWidth={6} />
        <text x={0} y={22} fontFamily={DISPLAY} fontWeight={800} fontSize={Math.min(84, 400 / (p.to.length * 0.62))} fill={C.ink} textAnchor="middle">
          {p.to}
        </text>
        {p.toLabel && (
          <text x={0} y={100} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.ink} textAnchor="middle">
            {p.toLabel}
          </text>
        )}
      </g>
      {p.note && <Chip x={ar.cx} y={780} text={p.note} size={28} bg={C.paper} opacity={ramp(t, at(ctx, (p.toAt ?? 1) + 0.5), 0.5)} />}
    </Drift>
  );
};

// ── горизонтальная шкала лет с событиями (только даты из книги) ──
type Ev = { year: string; text: string; at?: number; color?: string; up?: boolean };
type TimelineP = { host?: string; title?: string; events: Ev[]; from?: string; to?: string; note?: string; reverse?: boolean };
export const YearLine: React.FC<VisualProps<TimelineP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const x0 = ar.x0 + 60;
  const x1 = ar.x1 - 60;
  const y = 560;
  const n = p.events.length;
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      {p.title && (
        <Appear t={t} at={at(ctx, 0) - 0.2} x={ar.cx} y={170}>
          <SceneTitle x={0} y={0} text={p.title} size={44} />
        </Appear>
      )}
      <line x1={x0} y1={y} x2={x0 + (x1 - x0) * ramp(t, 0.1, 1.2)} y2={y} stroke={OL} strokeWidth={8} strokeLinecap="round" />
      {p.events.map((e, i) => {
        const x = x0 + ((i + 0.5) / n) * (x1 - x0);
        const k = ramp(t, at(ctx, e.at ?? 0.3 + i * 0.4), 0.5);
        const up = e.up ?? i % 2 === 0;
        const ty = up ? y - 150 : y + 150;
        const lines = e.text.split("\n");
        return (
          <g key={i} opacity={k} transform={`translate(0 ${(1 - k) * (up ? 20 : -20)})`}>
            <circle cx={x} cy={y} r={20} fill={e.color ?? C.yellow} stroke={OL} strokeWidth={5} />
            <line x1={x} y1={y + (up ? -22 : 22)} x2={x} y2={ty + (up ? 50 : -60)} stroke={OL} strokeWidth={4} />
            <text x={x} y={up ? y + 66 : y - 46} fontFamily={DISPLAY} fontWeight={800} fontSize={38} fill={C.ink} textAnchor="middle">
              {e.year}
            </text>
            <g transform={`translate(${x} ${ty})`}>
              <rect x={-150} y={-48 - (lines.length - 1) * 17} width={300} height={86 + (lines.length - 1) * 34} rx={22} fill={e.color ?? C.white} stroke={OL} strokeWidth={4} />
              <text x={0} y={8 - (lines.length - 1) * 17} fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.ink} textAnchor="middle">
                {lines.map((l, j) => (
                  <tspan key={j} x={0} dy={j === 0 ? 0 : 34}>
                    {l}
                  </tspan>
                ))}
              </text>
            </g>
          </g>
        );
      })}
      {p.note && <Chip x={ar.cx} y={236} text={p.note} size={26} bg={C.paper} opacity={ramp(t, at(ctx, 1.2), 0.5)} />}
    </Drift>
  );
};
