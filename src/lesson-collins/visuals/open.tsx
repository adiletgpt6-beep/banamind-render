// Открытие и сквозная рамка BM-037: два маховика (холодный старт), большой вопрос,
// «двигатель прорыва» из трёх узлов — люди, ясность, последовательность.
// Это авторская метафора фильма; мастерские условные, не исторические компании.
import React from "react";
import { interpolate } from "remotion";
import { C, DISPLAY, FONT, NODES, type Node } from "../theme";
import { dotsOf, SH, Swarm } from "./dots";
import { OL } from "./draw";
import { Appear, area, at, clamp01, Drift, ramp, type VisualProps } from "./kit";
import { Belt, Flywheel, Gear, PushMark, Spill, spin, type Push } from "./machine";
import { SHAPES } from "./shapes";

export const Chip: React.FC<{ x: number; y: number; text: string; bg?: string; color?: string; size?: number; opacity?: number; border?: string }> = ({ x, y, text, bg = C.white, color = C.ink, size = 32, opacity = 1, border = OL }) => {
  const w = text.length * size * 0.56 + size * 1.4;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect x={-w / 2 + 4} y={-size * 0.95 + 6} width={w} height={size * 1.7} rx={size * 0.85} fill="#000" opacity={0.12} />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.7} rx={size * 0.85} fill={bg} stroke={border} strokeWidth={4} />
      <text x={0} y={size * 0.2} fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

// Заголовок сцены тёмным по светлому фону (не больше двух строк).
export const SceneTitle: React.FC<{ x: number; y: number; text: string; size?: number; opacity?: number; color?: string }> = ({ x, y, text, size = 52, opacity = 1, color = C.ink }) => (
  <text x={x} y={y} fontFamily={DISPLAY} fontWeight={800} fontSize={size} fill={color} textAnchor="middle" opacity={opacity} stroke="#fff" strokeWidth={10} paintOrder="stroke" strokeLinejoin="round">
    {text.split("\n").map((l, i) => (
      <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.15}>
        {l}
      </tspan>
    ))}
  </text>
);

const pushesOf = (from: number, every: number, n: number, alternate: boolean, power = 40): Push[] =>
  Array.from({ length: n }, (_, i) => ({ at: from + i * every, dir: (alternate && i % 2 ? -1 : 1) as 1 | -1, power }));

// ── холодный старт: два одинаковых маховика, одинаковое усилие ──
type TwoP = { host?: string; stage?: number };
export const TwoWheels: React.FC<VisualProps<TwoP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const stage = p.stage ?? 0;
  const lx = ar.cx - 380;
  const rx = ar.cx + 380;
  const y = 450;
  const r = 190;
  // стадия 0: оба получают одинаковые толчки в одну сторону; стадия 1: левый каждый раз в новую сторону
  const n = Math.ceil((dur + 2) / 1.6);
  const left = pushesOf(0.8, 1.6, n, stage >= 1);
  const right = pushesOf(0.8, 1.6, n, false);
  const L = spin(t, left);
  const R = spin(t, right);
  const lastLeft = left.filter((q) => q.at <= t).pop();
  const sinceLeft = lastLeft ? t - lastLeft.at : 0;
  const trailL = stage >= 1 ? clamp01(0.05 + sinceLeft * 0.08) : clamp01(L.count / 12);
  const trailR = clamp01(R.count / 12);
  const dirL = (L.v >= 0 ? 1 : -1) as 1 | -1;
  const chipK = ramp(t, at(ctx, stage >= 1 ? 0.3 : 1), 0.5);
  return (
    <Drift t={t} dur={dur} cx={ar.cx} cy={520} amount={0.03}>
      <Flywheel x={lx} y={y} r={r} angle={L.angle} trail={trailL} trailDir={dirL} label="Мастерская А" />
      <Flywheel x={rx} y={y} r={r} angle={R.angle} trail={trailR} label="Мастерская Б" />
      {left.map((q, i) => (
        <PushMark key={`l${i}`} x={lx} y={y} r={r} t={t} push={q} />
      ))}
      {right.map((q, i) => (
        <PushMark key={`r${i}`} x={rx} y={y} r={r} t={t} push={q} />
      ))}
      {stage >= 1 && left.filter((q, i) => i > 0 && q.dir !== left[i - 1].dir).map((q, i) => <Spill key={`s${i}`} x={lx} y={y - r} t={t} at={q.at} seed={i} />)}
      {stage >= 1 && (
        <>
          <Chip x={lx} y={155} text="толчок — и снова в другую сторону" size={30} bg={C.coralLight} opacity={chipK} />
          <Chip x={rx} y={155} text="толчки в одну сторону" size={30} bg={C.tealLight} opacity={chipK} />
        </>
      )}
      {stage === 0 && <Chip x={ar.cx} y={155} text="одинаковые маховики · одинаковая сила толчка" size={32} opacity={chipK} />}
    </Drift>
  );
};

// ── большой вопрос из точек ──
export const BigQuestion: React.FC<VisualProps<{ host?: string; text?: string; sub?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const pts = dotsOf("bigq", SHAPES.question, ar.cx, 380, [C.teal, C.coral, C.yellow, C.indigo], 13, 300);
  const k = clamp01(interpolate(t, [0.1, 2], [0, 1]));
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.04}>
      <Swarm pts={pts} k={k} t={t} r={6} />
      {p.text && (
        <Appear t={t} at={at(ctx, 0.4)} x={ar.cx} y={660}>
          <SceneTitle x={0} y={0} text={p.text} size={50} />
        </Appear>
      )}
      {p.sub && (
        <Appear t={t} at={at(ctx, 1.1)} x={ar.cx} y={680 + (p.text?.split("\n").length ?? 1) * 62}>
          <Chip x={0} y={0} text={p.sub} size={32} bg={C.yellow} />
        </Appear>
      )}
    </Drift>
  );
};

// ── «двигатель прорыва»: три узла и маховик ──
const NODE_ORDER: Node[] = ["people", "clarity", "action"];
type EngineP = { host?: string; show?: number[]; focus?: Node; spinAt?: number; caption?: string; wrong?: boolean; labels?: string[] };
export const Engine: React.FC<VisualProps<EngineP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const show = p.show ?? [0, 0.6, 1.2];
  const spinT = at(ctx, p.spinAt ?? 2);
  const run = Math.max(0, t - spinT);
  const speed = Math.min(1, run / 3);
  const base = run * 22 * speed;
  const gx = [cx - 540, cx - 250, cx + 40];
  const gy = [410, 610, 410];
  const fx = cx + 470;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520} amount={0.03}>
      {NODE_ORDER.map((n, i) => {
        const a = at(ctx, show[i] ?? 0);
        const k = ramp(t, a, 0.7);
        const pts = dotsOf(`node-${n}`, SH.circle(118), gx[i], gy[i], [NODES[n].color, NODES[n].deep, "#fff"], 13, 140);
        const focus = p.focus ? (p.focus === n ? 1 : 0.35) : 1;
        return (
          <g key={n} opacity={focus}>
            {k < 1 && <Swarm pts={pts} k={k} t={t} r={5} seed={i} />}
            {k > 0.6 && <Gear x={gx[i]} y={gy[i]} r={125} angle={(i % 2 ? -1 : 1) * base * (i === 1 ? 1.1 : 1)} color={NODES[n].color} opacity={clamp01((k - 0.6) / 0.4)} />}
            {k > 0.6 && <Chip x={gx[i]} y={gy[i] + (i === 1 ? 175 : -175)} text={p.labels?.[i] ?? NODES[n].name} size={30} bg={NODES[n].light} opacity={clamp01((k - 0.6) / 0.4)} />}
          </g>
        );
      })}
      <Belt x1={gx[2] + 120} y1={gy[2]} x2={fx - 230} y2={460} k={ramp(t, spinT - 0.4, 0.8)} t={t * speed} color={p.wrong ? C.red : C.inkSoft} />
      <g opacity={ramp(t, at(ctx, show[2] ?? 1.2) + 0.4, 0.6)}>
        <Flywheel x={fx} y={460} r={210} angle={base * 0.6 * (p.wrong ? -1 : 1)} trail={clamp01(run / 14)} trailDir={p.wrong ? -1 : 1} label={p.wrong ? "неверное направление" : "маховик"} dim={p.wrong ? 0.5 : 0} />
      </g>
      {p.caption && (
        <Appear t={t} at={at(ctx, 0.2)} x={cx} y={150}>
          <SceneTitle x={0} y={0} text={p.caption} size={48} />
        </Appear>
      )}
    </Drift>
  );
};
