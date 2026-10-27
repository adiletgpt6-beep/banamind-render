// Сцены глав 5–8 BM-037: ёж и лиса, три круга, «прибыль на X», свобода в рамках,
// список «перестать делать», тиран против культуры, ускоритель, «ползти-идти-бежать»,
// цикл маховика и порочного круга. Подписи — по тексту книги; формы — метафоры фильма.
import React from "react";
import { interpolate } from "remotion";
import { C, DISPLAY, FONT } from "../theme";
import { dotsOf, hash, SH, Swarm } from "./dots";
import { OL } from "./draw";
import { Appear, area, at, Check, clamp01, Cross, Drift, ramp, wob, type VisualProps } from "./kit";
import { Flywheel, PushMark, Spill, spin, type Push } from "./machine";
import { Chip, SceneTitle } from "./open";

// перенос текста по числу знаков
export const wrap = (s: string, n: number) => {
  const out: string[] = [];
  let cur = "";
  for (const w of s.split(" ")) {
    if ((cur + " " + w).trim().length > n) {
      out.push(cur.trim());
      cur = w;
    } else cur += " " + w;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};
export const Lines: React.FC<{ x: number; y: number; text: string; n: number; size: number; color?: string; anchor?: "middle" | "start"; weight?: number }> = ({ x, y, text, n, size, color = C.ink, anchor = "middle", weight = 900 }) => {
  const ls = text.split("\n").flatMap((s) => wrap(s, n));
  return (
    <text x={x} y={y - ((ls.length - 1) * size * 1.15) / 2} fontFamily={FONT} fontWeight={weight} fontSize={size} fill={color} textAnchor={anchor}>
      {ls.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.15}>
          {l}
        </tspan>
      ))}
    </text>
  );
};

// ── ёж и лиса ──
export const HedgeFox: React.FC<VisualProps<{ host?: string; foxText?: string; hogText?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  // лиса бегает по петляющей траектории в разные стороны
  const ft = t * 1.3;
  const fx = cx - 260 + Math.sin(ft) * 240 + Math.sin(ft * 2.3) * 60;
  const fy = 560 + Math.cos(ft * 1.7) * 120;
  const dir = Math.cos(ft) >= 0 ? 1 : -1;
  const curl = ramp(t, at(ctx, 0.6), 0.8);
  const hx = cx + 330;
  const trail = Array.from({ length: 26 }, (_, i) => {
    const tt = ft - i * 0.09;
    return { x: cx - 260 + Math.sin(tt) * 240 + Math.sin(tt * 2.3) * 60, y: 560 + Math.cos(tt * 1.7) * 120 + 40 };
  });
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {trail.map((q, i) => (
        <circle key={i} cx={q.x} cy={q.y} r={7 - i * 0.2} fill={C.coral} opacity={0.5 - i * 0.018} />
      ))}
      {/* лиса */}
      <g transform={`translate(${fx} ${fy}) scale(${dir} 1)`}>
        <path d="M -70 0 Q -130 -40 -150 10 Q -110 0 -70 20 Z" fill={C.coral} stroke={OL} strokeWidth={5} />
        <ellipse cx={0} cy={0} rx={80} ry={40} fill={C.coral} stroke={OL} strokeWidth={5} />
        <path d="M 60 -20 L 120 -10 L 70 30 Z" fill={C.coral} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 70 -22 L 80 -60 L 95 -18 Z" fill={C.coralDeep} stroke={OL} strokeWidth={4} />
        <circle cx={92} cy={-6} r={6} fill={OL} />
        <path d="M -40 36 L -46 70 M 40 36 L 46 70" stroke={OL} strokeWidth={10} strokeLinecap="round" />
      </g>
      {/* ёж: сворачивается в колючий шар */}
      <g transform={`translate(${hx} 600)`}>
        {Array.from({ length: 30 }, (_, i) => {
          const a = Math.PI + (i / 29) * Math.PI * (1 + curl);
          const r0 = 90 - curl * 10;
          const r1 = r0 + 55;
          return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke={C.steelDark} strokeWidth={9} strokeLinecap="round" />;
        })}
        <ellipse cx={0} cy={0} rx={100 - curl * 10} ry={80 - curl * 4} fill={C.wood} stroke={OL} strokeWidth={6} />
        <g opacity={1 - curl}>
          <ellipse cx={95} cy={20} rx={40} ry={26} fill={C.skin} stroke={OL} strokeWidth={5} />
          <circle cx={128} cy={14} r={8} fill={OL} />
          <circle cx={100} cy={8} r={6} fill={OL} />
        </g>
      </g>
      <Appear t={t} at={at(ctx, 0)} x={cx - 260} y={260}>
        <Chip x={0} y={0} text={p.foxText ?? "лиса знает много разного"} size={32} bg={C.coralLight} />
      </Appear>
      <Appear t={t} at={at(ctx, 0.5)} x={hx} y={340}>
        <Chip x={0} y={0} text={p.hogText ?? "ёж знает одно, но важное"} size={32} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── три круга ──
const CIRCLES = [
  { key: "best", text: "В чём вы можете быть\nлучшими в мире", color: C.teal, dx: -150, dy: 95 },
  { key: "engine", text: "На чём основана ваша\nэкономическая модель", color: C.coral, dx: 150, dy: 95 },
  { key: "passion", text: "Что вас\nдействительно волнует", color: C.yellow, dx: 0, dy: -165 },
];
type CircP = { host?: string; show?: number[]; core?: number; missing?: string; labels?: string[]; title?: string; coreText?: string };
export const ThreeCircles: React.FC<VisualProps<CircP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const cy = 560;
  const R = 210;
  const show = p.show ?? [0, 0.4, 0.8];
  const coreK = p.core !== undefined ? ramp(t, at(ctx, p.core), 0.8) : 0;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={cy} amount={0.03}>
      {p.title && (
        <Appear t={t} at={at(ctx, 0) - 0.2} x={cx} y={150}>
          <SceneTitle x={0} y={0} text={p.title} size={44} />
        </Appear>
      )}
      {CIRCLES.map((c, i) => {
        const a = at(ctx, show[i] ?? 0);
        const k = ramp(t, a, 1.1);
        const miss = p.missing === c.key;
        const pts = dotsOf(`circ-${c.key}`, SH.ring(R - 22, R), cx + c.dx, cy + c.dy, [c.color, c.color, "#ffffff"], 12, R + 10);
        const lx = cx + c.dx * 2.75;
        const ly = cy + c.dy * (c.dy > 0 ? 2.55 : 2.15);
        return (
          <g key={c.key} opacity={miss ? 0.25 : 1}>
            <circle cx={cx + c.dx} cy={cy + c.dy} r={R} fill={c.color} opacity={0.18 * clamp01(k * 1.5 - 0.5)} />
            <Swarm pts={pts} k={k} t={t} r={5.2} seed={i * 3} />
            <g opacity={clamp01(k * 2 - 1)}>
              <Lines x={lx} y={ly} text={p.labels?.[i] ?? c.text} n={24} size={30} />
            </g>
            {miss && <Cross x={cx + c.dx} y={cy + c.dy} s={110} k={ramp(t, a + 0.6, 0.5)} />}
          </g>
        );
      })}
      {coreK > 0 && (
        <g transform={`translate(${cx} ${cy + 10}) scale(${0.6 + 0.4 * coreK})`} opacity={coreK}>
          <circle r={62 + Math.sin(t * 3) * 4} fill={C.white} stroke={OL} strokeWidth={6} />
          <text y={12} fontFamily={DISPLAY} fontWeight={800} fontSize={p.coreText && p.coreText.length > 4 ? 26 : 36} fill={C.ink} textAnchor="middle">
            {p.coreText ?? "ёж"}
          </text>
        </g>
      )}
    </Drift>
  );
};

// ── «прибыль на X»: знаменатель меняется ──
type DenP = { host?: string; items: { company: string; x: string; from?: string; at?: number }[]; title?: string };
export const Denominator: React.FC<VisualProps<DenP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  let cur = -1;
  p.items.forEach((it, i) => {
    if (t >= at(ctx, it.at ?? i)) cur = i;
  });
  const it = cur >= 0 ? p.items[cur] : null;
  const k = it ? ramp(t, at(ctx, it.at ?? cur), 0.5) : 0;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.02}>
      {p.title && (
        <Appear t={t} at={0} x={cx} y={160}>
          <SceneTitle x={0} y={0} text={p.title} size={44} />
        </Appear>
      )}
      <Appear t={t} at={0.2} x={cx} y={430}>
        <text x={0} y={0} fontFamily={DISPLAY} fontWeight={800} fontSize={96} fill={C.ink} textAnchor="middle">
          прибыль
        </text>
        <line x1={-420} y1={50} x2={420} y2={50} stroke={OL} strokeWidth={12} strokeLinecap="round" />
      </Appear>
      {it && (
        <g transform={`translate(${cx} ${600 + (1 - k) * 40})`} opacity={k}>
          <rect x={-440} y={-70} width={880} height={130} rx={36} fill={C.yellow} stroke={OL} strokeWidth={6} />
          <text x={0} y={18} fontFamily={DISPLAY} fontWeight={800} fontSize={it.x.length > 26 ? 40 : 54} fill={C.ink} textAnchor="middle">
            {it.x}
          </text>
          <text x={0} y={140} fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.inkSoft} textAnchor="middle">
            {it.company}
          </text>
          {it.from && (
            <g>
              <text x={0} y={210} fontFamily={FONT} fontWeight={800} fontSize={32} fill={C.inkSoft} textAnchor="middle" textDecoration="line-through">
                {`раньше: ${it.from}`}
              </text>
            </g>
          )}
        </g>
      )}
    </Drift>
  );
};

// ── аптеки на углах улиц (Walgreens): сетка кварталов, точки на перекрёстках ──
export const CornerMap: React.FC<VisualProps<{ host?: string; note?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const cols = 6;
  const rows = 4;
  const s = 125;
  const x0 = cx - (cols * s) / 2;
  const y0 = 300;
  const corners: [number, number][] = [
    [1, 1], [3, 1], [5, 1], [2, 2], [4, 2], [1, 3], [3, 3], [5, 3], [0, 2],
  ];
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => <rect key={`${r}-${c}`} x={x0 + c * s + 18} y={y0 + r * s + 18} width={s - 36} height={s - 36} rx={14} fill={C.steelLight} stroke={C.steel} strokeWidth={3} />),
      )}
      {corners.map(([c, r], i) => {
        const k = ramp(t, at(ctx, 0.3) + i * 0.35, 0.4);
        const x = x0 + c * s + 9;
        const y = y0 + r * s + 9;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
            <circle r={26} fill={C.teal} stroke={OL} strokeWidth={4} />
            <path d="M -10 0 L 10 0 M 0 -10 L 0 10" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
          </g>
        );
      })}
      {p.note && <Chip x={cx} y={236} text={p.note} size={30} bg={C.yellow} opacity={ramp(t, at(ctx, 1), 0.5)} />}
    </Drift>
  );
};

// ── свобода в рамках: точка свободно движется внутри прочной рамки ──
export const FreeFrame: React.FC<VisualProps<{ host?: string; frame?: string; inside?: string; title?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const k = ramp(t, at(ctx, 0), 0.8);
  const w = 760;
  const h = 400;
  const y = 540;
  const movers = Array.from({ length: 7 }, (_, i) => {
    const sp = 0.5 + hash(i, 2) * 0.7;
    return {
      x: cx + Math.sin(t * sp + i * 1.3) * (w / 2 - 70) * (0.5 + 0.5 * hash(i, 4)),
      y: y + Math.cos(t * sp * 1.3 + i) * (h / 2 - 70) * (0.5 + 0.5 * hash(i, 5)),
      c: [C.teal, C.coral, C.yellow][i % 3],
    };
  });
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.02}>
      {p.title && (
        <Appear t={t} at={0} x={cx} y={180}>
          <SceneTitle x={0} y={0} text={p.title} size={44} />
        </Appear>
      )}
      <rect x={cx - w / 2} y={y - h / 2} width={w} height={h} rx={40} fill={C.white} opacity={0.7 * k} />
      <rect x={cx - w / 2} y={y - h / 2} width={w} height={h} rx={40} fill="none" stroke={OL} strokeWidth={14} strokeDasharray={2 * (w + h)} strokeDashoffset={2 * (w + h) * (1 - k)} />
      {movers.map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r={26} fill={m.c} stroke={OL} strokeWidth={4} opacity={ramp(t, at(ctx, 0.5) + i * 0.1, 0.4)} />
      ))}
      <Chip x={cx} y={y - h / 2 - 2} text={p.frame ?? "рамки системы"} size={30} bg={C.steelLight} opacity={k} />
      <Chip x={cx} y={y + h / 2 + 70} text={p.inside ?? "свобода и ответственность внутри"} size={30} bg={C.yellow} opacity={ramp(t, at(ctx, 1), 0.5)} />
    </Drift>
  );
};

// ── матрица 2×2 (матрица креативной дисциплины) ──
type MatP = { host?: string; xAxis: string; yAxis: string; cells: [string, string, string, string]; win: number; title?: string };
export const Matrix: React.FC<VisualProps<MatP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx + 40;
  const cy = 500;
  const s = 240;
  // cells: [верх-лево, верх-право, низ-лево, низ-право]
  const pos = [
    [-1, -1], [1, -1], [-1, 1], [1, 1],
  ];
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.02}>
      {p.title && (
        <Appear t={t} at={0} x={ar.cx} y={150}>
          <SceneTitle x={0} y={0} text={p.title} size={42} />
        </Appear>
      )}
      {pos.map(([dx, dy], i) => {
        const k = ramp(t, at(ctx, 0.2) + i * 0.3, 0.5);
        const win = i === p.win;
        const wk = win ? ramp(t, at(ctx, 1), 0.6) : 0;
        return (
          <g key={i} opacity={k}>
            <rect x={cx + (dx < 0 ? -s : 0) + 6} y={cy + (dy < 0 ? -s : 0) + 6} width={s - 12} height={s - 12} rx={26} fill={win ? (wk > 0.5 ? C.yellow : C.white) : C.white} stroke={OL} strokeWidth={win ? 8 * (0.6 + 0.4 * wk) : 4} />
            <Lines x={cx + dx * s * 0.5} y={cy + dy * s * 0.5} text={p.cells[i]} n={13} size={32} />
          </g>
        );
      })}
      <line x1={cx - s - 30} y1={cy + s + 30} x2={cx + s + 40} y2={cy + s + 30} stroke={OL} strokeWidth={8} strokeLinecap="round" />
      <path d={`M ${cx + s + 50} ${cy + s + 30} l -26 -18 l 0 36 Z`} fill={OL} />
      <line x1={cx - s - 30} y1={cy + s + 30} x2={cx - s - 30} y2={cy - s - 40} stroke={OL} strokeWidth={8} strokeLinecap="round" />
      <path d={`M ${cx - s - 30} ${cy - s - 50} l -18 26 l 36 0 Z`} fill={OL} />
      <text x={cx} y={cy + s + 84} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink} textAnchor="middle">
        {p.xAxis}
      </text>
      <text x={0} y={0} transform={`translate(${cx - s - 66} ${cy}) rotate(-90)`} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink} textAnchor="middle">
        {p.yAxis}
      </text>
    </Drift>
  );
};

// ── два списка: «сделать» и «перестать делать» ──
type ListsP = { host?: string; left: string[]; right: string[]; lTitle: string; rTitle: string; strikeLeft?: boolean; rightAt?: number };
export const TwoLists: React.FC<VisualProps<ListsP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const w = Math.min(560, (ar.x1 - ar.x0 - 100) / 2);
  const ra = at(ctx, p.rightAt ?? 1);
  const col = (x: number, title: string, items: string[], a: number, accent: string, strike: boolean) => (
    <g>
      <g opacity={ramp(t, a, 0.5)}>
        <rect x={x - w / 2} y={250} width={w} height={110 + items.length * 92} rx={30} fill={C.white} stroke={OL} strokeWidth={5} />
        <rect x={x - w / 2} y={250} width={w} height={84} rx={30} fill={accent} stroke={OL} strokeWidth={5} />
        <text x={x} y={306} fontFamily={DISPLAY} fontWeight={800} fontSize={38} fill={C.ink} textAnchor="middle">
          {title}
        </text>
      </g>
      {items.map((it, i) => {
        const ia = a + 0.4 + i * 0.5;
        const k = ramp(t, ia, 0.4);
        const sk = strike ? ramp(t, ia + 0.5, 0.4) : 0;
        const ly = 390 + i * 92;
        return (
          <g key={i} opacity={k}>
            <text x={x - w / 2 + 40} y={ly} fontFamily={FONT} fontWeight={800} fontSize={Math.min(32, (w - 70) / (it.length * 0.56 + 1.2))} fill={C.ink}>
              {`• ${it}`}
            </text>
            {sk > 0 && <line x1={x - w / 2 + 34} y1={ly - 11} x2={x - w / 2 + 34 + (w - 70) * sk} y2={ly - 11} stroke={C.red} strokeWidth={6} strokeLinecap="round" />}
          </g>
        );
      })}
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.02}>
      {col(cx - w / 2 - 30, p.lTitle, p.left, at(ctx, 0), C.tealLight, false)}
      {col(cx + w / 2 + 30, p.rTitle, p.right, ra, C.coralLight, p.strikeLeft ?? true)}
    </Drift>
  );
};

// ── тиран против культуры: качественная схема без значений ──
export const TyrantCurve: React.FC<VisualProps<{ host?: string; who?: string; note?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const x0 = ar.x0 + 120;
  const x1 = ar.x1 - 80;
  const base = 760;
  const k = ramp(t, at(ctx, 0.2), 2.4);
  const path = `M ${x0} ${base - 60} C ${x0 + 200} ${base - 70}, ${x0 + 300} ${base - 360}, ${(x0 + x1) / 2} ${base - 400} C ${(x0 + x1) / 2 + 120} ${base - 410}, ${x1 - 260} ${base - 60}, ${x1} ${base - 20}`;
  const L = 2000;
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      <line x1={x0} y1={base} x2={x1} y2={base} stroke={OL} strokeWidth={6} />
      <path d={path} fill="none" stroke={C.coral} strokeWidth={14} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - k)} />
      <Chip x={(x0 + x1) / 2} y={base - 470} text={p.who ?? "сильный руководитель-«тиран»"} size={30} bg={C.coralLight} opacity={ramp(t, at(ctx, 0.5), 0.5)} />
      <Chip x={x1 - 200} y={base - 260} text="после его ухода" size={30} bg={C.white} opacity={ramp(t, at(ctx, 1), 0.5)} />
      <Chip x={ar.cx} y={base + 80} text={p.note ?? "условная схема: форма, а не значения графиков книги"} size={26} bg={C.paper} opacity={ramp(t, at(ctx, 0.3), 0.5)} />
    </Drift>
  );
};

// ── ускоритель: один и тот же двигатель на двух тележках с разным направлением ──
export const Booster: React.FC<VisualProps<{ host?: string; good?: string; bad?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const on = Math.max(0, t - at(ctx, 0.6));
  const dist = Math.min(300, on * on * 40);
  const cart = (y: number, dir: 1 | -1, color: string, label: string, wrong: boolean) => {
    const x = cx + dir * dist * (wrong ? 1 : 1);
    return (
      <g>
        <line x1={ar.x0 + 40} y1={y + 70} x2={ar.x1 - 40} y2={y + 70} stroke={C.steel} strokeWidth={6} strokeDasharray="20 14" />
        <g transform={`translate(${x} ${y})`}>
          <rect x={-120} y={-50} width={240} height={100} rx={24} fill={color} stroke={OL} strokeWidth={5} />
          <circle cx={-70} cy={60} r={22} fill={OL} />
          <circle cx={70} cy={60} r={22} fill={OL} />
          {/* ускоритель-ракета сзади */}
          <g transform={`translate(${-dir * 150} 0) scale(${dir} 1)`}>
            <rect x={-40} y={-26} width={80} height={52} rx={12} fill={C.steelLight} stroke={OL} strokeWidth={4} />
            {on > 0 && <path d={`M -40 -18 L ${-80 - wob(t * 3, 1, 12) - 30} 0 L -40 18 Z`} fill={C.yellow} stroke={C.coral} strokeWidth={4} />}
          </g>
          <text x={0} y={12} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink} textAnchor="middle">
            {label}
          </text>
        </g>
      </g>
    );
  };
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.02}>
      <Chip x={cx} y={190} text="тот же ускоритель" size={34} bg={C.steelLight} opacity={ramp(t, at(ctx, 0), 0.5)} />
      {cart(400, 1, C.tealLight, p.good ?? "верное направление", false)}
      {cart(700, -1, C.coralLight, p.bad ?? "ошибочное направление", true)}
      <Check x={ar.x1 - 120} y={400} s={60} k={ramp(t, at(ctx, 1.2), 0.5)} />
      <Cross x={ar.x0 + 120} y={700} s={90} k={ramp(t, at(ctx, 1.5), 0.5)} />
    </Drift>
  );
};

// ── ползти · идти · бежать ──
export const CrawlWalkRun: React.FC<VisualProps<{ host?: string; labels?: string[] }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const labels = p.labels ?? ["ползти", "идти", "бежать"];
  const w = ar.x1 - ar.x0 - 120;
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      {labels.map((l, i) => {
        const x = ar.x0 + 60 + (w * (i + 0.5)) / 3;
        const k = ramp(t, at(ctx, 0.2 + i * 0.5), 0.5);
        const h = 120 + i * 120;
        return (
          <g key={i} opacity={k}>
            <rect x={x - 110} y={800 - h} width={220} height={h} rx={20} fill={[C.tealLight, C.yellow, C.coral][i]} stroke={OL} strokeWidth={5} />
            <text x={x} y={780 - h / 2 + 10} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={C.ink} textAnchor="middle">
              {l}
            </text>
          </g>
        );
      })}
      <path d={`M ${ar.x0 + 100} 860 L ${ar.x1 - 100} 860`} stroke={OL} strokeWidth={8} strokeLinecap="round" />
    </Drift>
  );
};

// ── цикл из четырёх шагов (эффект маховика / порочный круг) ──
type CycleP = { host?: string; steps: string[]; title?: string; bad?: boolean; center?: string };
export const Cycle: React.FC<VisualProps<CycleP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const cy = 530;
  const R = 250;
  const n = p.steps.length;
  const rot = (t * (p.bad ? -14 : 18)) % 360;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={cy} amount={0.02}>
      {p.title && (
        <Appear t={t} at={0} x={cx} y={150}>
          <SceneTitle x={0} y={0} text={p.title} size={44} color={p.bad ? C.coralDeep : C.ink} />
        </Appear>
      )}
      <g transform={`translate(${cx} ${cy}) rotate(${rot})`} opacity={ramp(t, 0.2, 0.6)}>
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(a) * R} cy={Math.sin(a) * R} r={8} fill={p.bad ? C.coral : [C.teal, C.coral, C.yellow][i % 3]} opacity={0.75} />;
        })}
      </g>
      {p.steps.map((s, i) => {
        const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;
        const k = ramp(t, at(ctx, 0.2 + i * 0.4), 0.5);
        const zig = p.bad ? Math.sin(t * 6 + i) * 4 : 0;
        return (
          <g key={i} transform={`translate(${x + zig} ${y}) scale(${0.85 + 0.15 * k})`} opacity={k}>
            <rect x={-215} y={-62} width={430} height={124} rx={30} fill={p.bad ? C.coralLight : C.white} stroke={OL} strokeWidth={5} />
            <Lines x={0} y={8} text={s} n={22} size={31} />
          </g>
        );
      })}
      {p.center && (
        <Appear t={t} at={at(ctx, 1.2)} x={cx} y={cy}>
          <text x={0} y={14} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={p.bad ? C.coralDeep : C.ink} textAnchor="middle">
            {p.center}
          </text>
        </Appear>
      )}
    </Drift>
  );
};

// ── большой маховик: «первого толчка не было» ──
type BigWheelP = { host?: string; pushes?: number; reverse?: number[]; labels?: string[]; note?: string; caption?: string };
export const BigWheel: React.FC<VisualProps<BigWheelP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const y = 520;
  const r = 240;
  const n = p.pushes ?? Math.ceil(dur / 1.4);
  const pushes: Push[] = Array.from({ length: n }, (_, i) => ({ at: 0.6 + i * 1.4, dir: (p.reverse?.includes(i) ? -1 : 1) as 1 | -1, power: 28 }));
  const S = spin(t, pushes, { friction: 0.08 });
  const trail = clamp01(S.count / (n * 0.8));
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520} amount={0.025}>
      <Flywheel x={cx} y={y} r={r} angle={S.angle} trail={trail} trailDir={S.v >= 0 ? 1 : -1} />
      {pushes.map((q, i) => (
        <PushMark key={i} x={cx} y={y} r={r} t={t} push={q} />
      ))}
      {p.reverse?.map((i) => <Spill key={i} x={cx} y={y - r} t={t} at={pushes[i]?.at ?? 0} seed={i} />)}
      {p.labels?.map((l, i) => {
        const a = at(ctx, 0.3 + i * 0.45);
        const k = ramp(t, a, 0.4);
        const side = i % 2 ? 1 : -1;
        return <Chip key={i} x={cx + side * 520} y={300 + Math.floor(i / 2) * 120} text={l} size={30} bg={[C.tealLight, C.coralLight, "#fff0bf"][i % 3]} opacity={k} />;
      })}
      {p.caption && <Chip x={cx} y={150} text={p.caption} size={32} bg={C.yellow} opacity={ramp(t, at(ctx, 1), 0.5)} />}
      {p.note && <Chip x={cx} y={215} text={p.note} size={22} bg={C.paper} opacity={ramp(t, at(ctx, 0.2), 0.5)} />}
    </Drift>
  );
};

export const _unused = interpolate;
