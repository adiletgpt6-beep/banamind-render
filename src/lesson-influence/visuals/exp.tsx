// Опыты и истории из книги в цифрах. Числа — только те, что приводит автор
// (они же в репликах и проверяются тестом сценария). Каждая полоса — ряд чётких
// цветных точек, которые зажигаются по одной: доля видна без графиков-«палок».
//   experiment — 1–4 условия опыта, точечные полосы и подпись «по данным автора»;
//   history    — два народа и два дара в разные годы (туда и обратно);
//   cola       — эксперимент Ригана: бутылка колы → билеты ×2;
//   candy      — конфета на входе в кондитерскую.
import React from "react";
import { interpolate } from "remotion";
import { C, DISPLAY, FC, FONT } from "../theme";
import { Card, Gift, Label, OL, Person } from "./draw";
import { hash } from "./dots";
import { Appear, area, Arrow, at, clamp01, Drift, ease, ramp, Txt, type VisualProps } from "./kit";

type Bar = { label: string; value: number; of?: number; beat?: number };
type PE = { host?: string; title?: string; bars?: Bar[]; unit?: string; note?: string; per?: number };

const ROW_COLORS = ["#8fb6ff", "#ff9fbf", "#7be0a4", "#ffd23f"];

const fmt = (v: number, unit: string) => {
  const s = Number.isInteger(v) ? String(Math.round(v)) : v.toFixed(v < 10 && String(v).split(".")[1]?.length === 2 ? 2 : 1).replace(".", ",");
  if (unit === "%") return `${s} %`;
  if (unit === "×") return `×${s}`;
  return `${s} ${unit}`;
};

export const Experiment: React.FC<VisualProps<PE>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const bars = p.bars ?? [];
  const unit = p.unit ?? "%";
  const max = Math.max(...bars.map((b) => b.value));
  const n = bars.length;
  const w = Math.min(1560, a.x1 - a.x0 - 40);
  const x0 = a.cx - w / 2;
  const labelW = n === 1 ? 0 : Math.min(500, w * 0.36);
  const valueW = 210;
  const trackW = w - labelW - valueW - 20;
  const rowH = n === 1 ? 300 : Math.min(140, 470 / n);
  const top = 360;
  const first = at(ctx, 0.25);
  const last = at(ctx, Math.max(0.6, ctx.beats.length - 0.55));
  const winner = bars.findIndex((b) => b.value === max);
  // цена одной точки: «из N» — одна точка = один человек; «%» — 4 %, а при малых долях — мельче; «×» — четверть
  const per = p.per ?? (unit === "%" ? (max <= 20 ? max / 20 : 4) : unit === "×" ? 0.25 : 1);
  return (
    <Drift t={t} dur={dur} cx={a.cx} amount={0.025}>
      <Appear t={t} at={at(ctx, 0) - 0.2} x={a.cx} y={190}>
        <rect x={-w / 2} y={-58} width={w} height={100} rx={30} fill={C.paper} stroke={OL} strokeWidth={4} />
        <text x={0} y={12} fontFamily={FONT} fontWeight={900} fontSize={Math.min(46, (w - 60) / ((p.title ?? "").length * 0.56))} fill={C.ink} textAnchor="middle">
          {p.title}
        </text>
      </Appear>
      {p.note && (
        <Appear t={t} at={first + 0.6} x={a.cx} y={278}>
          <Txt x={0} y={0} size={28} color="#eef1ff" weight={700}>
            {p.note}
          </Txt>
        </Appear>
      )}
      {bars.map((b, i) => {
        const appear = b.beat !== undefined ? at(ctx, b.beat) : n === 1 ? first : first + ((last - first) * i) / Math.max(1, n - 1);
        const k = ramp(t, appear, 0.5);
        if (k <= 0) return null;
        const total = b.of ?? Math.ceil((unit === "%" && max > 20 ? 100 : max) / per);
        const filledF = b.of ? b.value : b.value / per;
        const perRow = total > 45 ? Math.ceil(total / Math.ceil(total / 42)) : total;
        const rows = Math.ceil(total / perRow);
        const span = n === 1 ? w - 80 : trackW;
        const gap = Math.min(span / perRow, 44);
        const r = Math.min(15, gap * 0.4);
        const y = top + rowH * (i + 0.5) + (n === 1 ? 20 : 0);
        const fillK = clamp01((t - appear - 0.2) / 1.6);
        const lit = filledF * ease(fillK);
        const color = ROW_COLORS[i % ROW_COLORS.length];
        const isWin = i === winner && n > 1;
        const shown = b.value * ease(fillK);
        const left = n === 1 ? a.cx - (perRow * gap) / 2 : x0 + labelW + 10;
        return (
          <g key={i} opacity={k} transform={`translate(0 ${(1 - k) * 30})`}>
            {n > 1 && (
              <text x={x0 + labelW - 10} y={y + 13} fontFamily={FONT} fontWeight={800} fontSize={Math.min(38, (labelW - 10) / (b.label.length * 0.55))} fill="#fff" textAnchor="end" stroke={OL} strokeWidth={6} paintOrder="stroke">
                {b.label}
              </text>
            )}
            {n === 1 && (
              <text x={a.cx} y={y - (rows * gap) / 2 - 30} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
                {b.label}
              </text>
            )}
            {Array.from({ length: total }).map((_, d) => {
              const col = d % perRow;
              const row = Math.floor(d / perRow);
              const cx = left + gap / 2 + col * gap;
              const cy = y + (row - (rows - 1) / 2) * gap;
              const on = clamp01(lit - d);
              return (
                <g key={d}>
                  <circle cx={cx} cy={cy} r={r} fill="#ffffff" fillOpacity={0.14} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={2} />
                  {on > 0 && <circle cx={cx} cy={cy} r={r * (0.35 + 0.65 * on)} fill={isWin || n === 1 ? C.yellow : color} stroke={OL} strokeOpacity={0.55} strokeWidth={1.8} />}
                </g>
              );
            })}
            <text
              x={n === 1 ? a.cx : left + perRow * gap + 24}
              y={n === 1 ? y + (rows * gap) / 2 + 66 : y + 17}
              fontFamily={DISPLAY}
              fontWeight={800}
              fontSize={n === 1 ? 64 : 50}
              fill={isWin ? C.yellow : "#fff"}
              textAnchor={n === 1 ? "middle" : "start"}
              stroke={OL}
              strokeWidth={7}
              paintOrder="stroke"
            >
              {fmt(Number.isInteger(b.value) ? Math.round(shown) : +shown.toFixed(2), unit)}
            </text>
          </g>
        );
      })}
    </Drift>
  );
};

// ── Благодарность через годы: дар идёт от одного к другому, потом обратно ──
// steps: [[направление "ab"|"ba", год], …] — по одной реплике на шаг
type PH = { host?: string; a?: string; b?: string; steps?: string[][] };
export const History: React.FC<VisualProps<PH>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const L = cx - 420;
  const R = cx + 420;
  const steps = p.steps ?? [];
  const place = (x: number, name: string, color: string) => (
    <g transform={`translate(${x} 560)`}>
      <ellipse cx={0} cy={120} rx={220} ry={40} fill="#000" opacity={0.12} />
      <path d="M -200 120 Q -210 -40 -60 -80 Q 40 -140 160 -60 Q 230 0 200 120 Z" fill={color} stroke={OL} strokeWidth={5} />
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={-140 + (i % 7) * 46} cy={20 + Math.floor(i / 7) * 46} r={10} fill="#fff" opacity={0.75} />
      ))}
      <Txt x={0} y={210} size={44} color="#fff">
        {name}
      </Txt>
    </g>
  );
  const arcY = (k: number) => 380 - Math.sin(k * Math.PI) * 160;
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {place(L, p.a ?? "", FC.recip.color)}
      {place(R, p.b ?? "", FC.unity.color)}
      {steps.map(([dir, year, label], i) => {
        const k = interpolate(t, [at(ctx, i + 0.25), at(ctx, i + 0.85)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        if (k <= 0) return null;
        const from = dir === "ab" ? L : R;
        const to = dir === "ab" ? R : L;
        const x = from + (to - from) * k;
        return (
          <g key={i}>
            <path d={`M ${from} 400 Q ${cx} 160 ${to} 400`} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={6} strokeDasharray="14 14" />
            <Gift x={x} y={arcY(k)} s={0.9} color={i === 0 ? FC.recip.color : FC.unity.color} />
            <text x={cx} y={i === 0 ? 230 : 300} fontFamily={DISPLAY} fontWeight={800} fontSize={52} fill={C.yellow} textAnchor="middle" stroke={OL} strokeWidth={7} paintOrder="stroke" opacity={ramp(t, at(ctx, i + 0.2))}>
              {year}: {label ?? (dir === "ab" ? `${p.a} → ${p.b}` : `${p.b} → ${p.a}`)}
            </text>
          </g>
        );
      })}
    </Drift>
  );
};

// ── Эксперимент Ригана ──
const Bottle: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -14 -90 L 14 -90 L 14 -60 Q 34 -40 34 0 L 34 70 Q 34 84 20 84 L -20 84 Q -34 84 -34 70 L -34 0 Q -34 -40 -14 -60 Z" fill="#7a3a2a" stroke={OL} strokeWidth={4} />
    <rect x={-34} y={0} width={68} height={34} fill="#e5484d" />
    <rect x={-16} y={-100} width={32} height={14} rx={3} fill="#c0c6d6" stroke={OL} strokeWidth={3} />
    <path d="M -22 -40 Q -26 20 -22 60" stroke="#fff" strokeWidth={5} opacity={0.4} fill="none" />
  </g>
);
export const Cola: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const give = ramp(t, at(ctx, 0.4), 0.8);
  const tickets = ramp(t, at(ctx, 1.2), 1.2);
  const dislike = ramp(t, at(ctx, 2.2), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Person who="timur" x={cx - 300} y={900} s={0.95} mood={dislike > 0.5 ? "doubt" : "smile"} pose={give > 0.5 ? "take" : "stand"} t={t} />
      <Person who="student" x={cx + 300} y={900} s={0.95} mood="smile" pose={give < 1 ? "give" : "hold"} t={t} flip item={give < 0.98 ? <Bottle x={0} y={0} s={0.7} /> : undefined} />
      {give >= 0.98 && <Bottle x={cx - 170} y={560} s={0.8} rot={-10} />}
      <Label x={cx + 300} y={300} text="Джо" size={34} />
      {tickets > 0 && (
        <g>
          {Array.from({ length: 8 }).map((_, i) => {
            const k = clamp01(tickets * 8 - i);
            const fx = cx + 200;
            const tx = cx - 520 + (i % 4) * 70;
            const ty = 360 + Math.floor(i / 4) * 90;
            return (
              <g key={i} opacity={k} transform={`translate(${fx + (tx - fx) * k} ${400 + (ty - 400) * k}) rotate(${(hash(i) - 0.5) * 20})`}>
                <rect x={-30} y={-22} width={60} height={44} rx={6} fill={C.yellow} stroke={OL} strokeWidth={3} />
                <circle cx={-30} cy={0} r={8} fill={FC.recip.color} />
                <circle cx={30} cy={0} r={8} fill={FC.recip.color} />
              </g>
            );
          })}
          <Txt x={cx - 420} y={300} size={60} color={C.yellow}>
            ×2
          </Txt>
        </g>
      )}
      {dislike > 0 && (
        <g opacity={dislike} transform={`translate(${cx} 200)`}>
          <Card x={0} y={0} w={640} h={100} lines={["долг сильнее симпатии"]} size={40} fill={FC.recip.light} edge={FC.recip.color} />
        </g>
      )}
    </Drift>
  );
};

// ── Конфета на входе ──
export const Candy: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const walk = interpolate(t, [at(ctx, 0), at(ctx, 0) + 2.4], [a.x0 + 120, cx - 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const got = ramp(t, at(ctx, 0.35), 0.4);
  const shelf = ramp(t, at(ctx, 1), 0.6);
  const sweets = ["#ff6b9a", "#3d8bff", "#16c2a3", "#ff9a2e", "#9a6bff", "#ffc233"];
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {/* витрина кондитерской */}
      <rect x={cx + 40} y={360} width={520} height={420} rx={24} fill="#fff4e8" stroke={OL} strokeWidth={5} />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x={cx + 60} y={470 + r * 120} width={480} height={14} rx={6} fill="#c9a07a" />
          {Array.from({ length: 6 }).map((_, i) => {
            const take = shelf > 0 && (i + r) % 3 === 0 ? clamp01(shelf * 3 - r) : 0;
            return (
              <g key={i} transform={`translate(${cx + 100 + i * 80} ${440 + r * 120 - take * 30})`} opacity={1 - take * 0.85}>
                <circle r={24} fill={sweets[(i + r * 2) % 6]} stroke={OL} strokeWidth={3} />
                <path d="M -24 0 L -40 -12 L -40 12 Z M 24 0 L 40 -12 L 40 12 Z" fill={sweets[(i + r * 2) % 6]} stroke={OL} strokeWidth={2.5} />
              </g>
            );
          })}
        </g>
      ))}
      <Person who="grandma" x={walk} y={980} s={0.75} mood={got > 0.5 ? "happy" : "smile"} pose={walk < cx - 130 ? "walk" : "hold"} t={t} />
      <Person who="seller" x={cx - 20} y={980} s={0.75} mood="kind" pose={got < 1 ? "give" : "stand"} t={t} flip item={got < 1 ? <circle r={16} fill="#ff6b9a" stroke={OL} strokeWidth={3} /> : undefined} />
      <Appear t={t} at={at(ctx, 0.5)} x={cx - 360} y={260}>
        <Txt x={0} y={0} size={70} color={C.yellow}>
          +42 %
        </Txt>
      </Appear>
      <Appear t={t} at={at(ctx, 1.3)} x={cx + 300} y={290}>
        <Label x={0} y={0} text="покупают разное" size={32} bg={C.yellow} />
      </Appear>
      <Arrow x1={cx - 200} y1={380} x2={cx + 20} y2={420} k={ramp(t, at(ctx, 1.4))} color="#fff" />
    </Drift>
  );
};
