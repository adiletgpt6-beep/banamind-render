// Сцены-схемы «Масштаба выбора»: трёхслойная карта, распад стрелы полководца
// на сеть решений, салон как «прядильная мастерская», доска семей, ось лет,
// вопрос фильма, карточка-цитата, заставка части.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT, SERIF } from "../theme";
import { BigArrow, BookObj, DotNet, Figure, Label, makeDots, OL, QuoteCardObj, rnd, SmallArrow, type Who } from "./draw";
import { Appear, area, at, clamp01, Drift, ease, Fit, ramp, Txt, wob, type VisualProps } from "./kit";

type P = { host?: string; mode?: string; text?: string; who?: string; title?: string; sub?: string; labels?: string[]; focus?: number; items?: string[] };

// Проекция «лежащей» плоскости карты: x' = x + 0.55y, y' = 0.42y
const plane = (x: number, y: number) => `matrix(1 0 0.55 0.42 ${x} ${y})`;

const Plane: React.FC<{ x: number; y: number; w: number; h: number; fill: string; k: number; hi: boolean; children?: React.ReactNode }> = ({ x, y, w, h, fill, k, hi, children }) => (
  <g opacity={k} transform={`translate(0 ${(1 - k) * 60})`}>
    <g transform={plane(x, y)}>
      <rect x={-w / 2 + 10} y={-h / 2 + 18} width={w} height={h} rx={26} fill={OL} opacity={0.25} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill={fill} stroke={hi ? C.yellow : "#fff"} strokeWidth={hi ? 10 : 4} />
      {children}
    </g>
  </g>
);

// ── Трёхслойная карта ──
// mode: intro (слои появляются), focus (подсвечен слой focus 0/1/2), final (нити между слоями)
export const Layers: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const mode = p.mode ?? "intro";
  const cx = a.cx - 120;
  const labels = p.labels ?? ["личный выбор", "переживание войны", "историческая перспектива"];
  const ys = [820, 560, 300];
  const k = mode === "intro" ? [ramp(t, at(ctx, 0.2)), ramp(t, at(ctx, 1)), ramp(t, at(ctx, 2))] : [1, 1, 1];
  const focus = mode === "focus" ? p.focus ?? 0 : -1;
  const dots = makeDots(46, 0, 0, 380, 300, 7);
  const thread = mode === "final" ? ramp(t, at(ctx, 0.5), 1.4) : 0;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560} amount={0.03}>
      <Fit a={a} w={1760} c={cx + 140}>
      {/* слой 3: история — сеть точек */}
      <Plane x={cx} y={ys[2]} w={900} h={640} fill="#2a3a6e" k={k[2]} hi={focus === 2}>
        <DotNet dots={dots} t={t} k={k[2]} links={2} drift={10} />
      </Plane>
      {/* слой 2: война — карта со стрелками */}
      <Plane x={cx} y={ys[1]} w={900} h={640} fill={C.paperDark} k={k[1]} hi={focus === 1}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M -420 ${-260 + i * 120} Q 0 ${-300 + i * 120 + Math.sin(i) * 60} 420 ${-250 + i * 120}`} stroke={C.sepia} strokeWidth={5} fill="none" opacity={0.6} />
        ))}
        <BigArrow x1={-330} y1={160} x2={260} y2={-120} w={46} grow={k[1]} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={-200 + i * 190} cy={-60 + (i % 2) * 140} r={22} fill={C.ink} />
        ))}
      </Plane>
      {/* слой 1: личный выбор — тёплая плоскость */}
      <Plane x={cx} y={ys[0]} w={900} h={640} fill="#f0d9a8" k={k[0]} hi={focus === 0}>
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={-280 + i * 190} cy={60 - (i % 2) * 120} r={70} fill="#fff" opacity={0.35} />
        ))}
      </Plane>
      {/* силуэты стоят на первом слое (не искажены проекцией) */}
      <g opacity={k[0]}>
        {(["pierre", "natasha", "andrei"] as Who[]).map((w, i) => (
          <Figure key={w} who={w} x={cx - 260 + i * 230 + 0.55 * (40 - i * 50) * 0.42} y={ys[0] + 60 - i * 26} s={0.62} pose={i === 1 ? "look" : "stand"} t={t} flip={i === 2} />
        ))}
      </g>
      {/* нити света между слоями */}
      {thread > 0 &&
        [-260, -30, 200].map((dx, i) => (
          <g key={i}>
            <line x1={cx + dx} y1={ys[0] - 160} x2={cx + dx + 40} y2={ys[0] - 160 - (ys[0] - ys[2]) * thread} stroke={C.yellow} strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" />
            <circle cx={cx + dx + 40 * thread} cy={ys[0] - 160 - (ys[0] - ys[2]) * thread} r={12} fill={C.yellow} stroke="#fff" strokeWidth={4} />
          </g>
        ))}
      {/* подписи слоёв справа */}
      {labels.map((l, i) => (
        <g key={l} opacity={k[i]}>
          <Label x={cx + 640} y={ys[i] + 10} text={l} size={focus === i ? 40 : 32} bg={focus === i ? C.yellow : C.paper} />
        </g>
      ))}
      </Fit>
    </Drift>
  );
};

// ── Стрела полководца распадается на тысячи решений ──
// mode: break (одна стрела → много), many (сразу много), map (стрелы по карте с подписью)
export const ArrowBreak: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const mode = p.mode ?? "break";
  const cx = a.cx;
  const brk = mode === "many" ? 1 : ramp(t, at(ctx, mode === "break" ? 1 : 0.6), 1.6);
  const grow = mode === "many" ? 0 : ramp(t, at(ctx, 0), 1.2);
  const N = 70;
  const arrows = Array.from({ length: N }).map((_, i) => {
    const sx = cx - 520 + rnd(i) * 1040;
    const sy = 300 + rnd(i + 40) * 520;
    const ang = -25 + (rnd(i + 80) - 0.5) * 120;
    return { sx, sy, ang, c: C.dots[i % C.dots.length], d: rnd(i + 120) };
  });
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560} amount={0.035}>
      <Fit a={a} w={1340} c={cx}>
      {/* условная карта */}
      <rect x={cx - 640} y={200} width={1280} height={720} rx={30} fill={C.paper} opacity={0.94} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M ${cx - 620} ${260 + i * 120} Q ${cx} ${230 + i * 120 + Math.sin(i * 2) * 50} ${cx + 620} ${270 + i * 120}`} stroke={C.sepia} strokeOpacity={0.45} strokeWidth={4} fill="none" />
      ))}
      <text x={cx - 610} y={250} fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.inkSoft}>
        художественная схема BanaMind
      </text>
      {mode !== "many" && <BigArrow x1={cx - 500} y1={760} x2={cx + 460} y2={360} w={80} grow={grow} opacity={1 - brk} />}
      {arrows.map((ar, i) => {
        const k = clamp01(brk * 1.6 - ar.d * 0.6);
        if (k <= 0) return null;
        const along = 1 - k;
        const x = ar.sx * k + (cx - 500 + (960 * (i / N))) * along;
        const y = ar.sy * k + (760 - 400 * (i / N)) * along;
        return <SmallArrow key={i} x={x} y={y + wob(t, i, 3)} ang={ar.ang} color={ar.c} k={k} len={40 + ar.d * 30} />;
      })}
      {p.labels?.map((l, i) => (
        <Appear key={l} t={t} at={at(ctx, 1 + i * 0.5)} x={cx + (i - (p.labels!.length - 1) / 2) * 360} y={160}>
          <Label x={0} y={0} text={l} size={34} bg={i === 0 ? C.paper : C.yellow} />
        </Appear>
      ))}
      </Fit>
    </Drift>
  );
};

// ── Салон как прядильная мастерская: веретёна разговоров ──
export const Salon: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const groups = [-420, 0, 420];
  const pierreK = ramp(t, at(ctx, 1));
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600}>
      {/* люстра и тёплые окна */}
      <g transform={`translate(${cx} 150)`}>
        <line x1={0} y1={-150} x2={0} y2={-40} stroke={C.gold} strokeWidth={6} />
        {[-120, -60, 0, 60, 120].map((dx, i) => (
          <g key={i}>
            <circle cx={dx} cy={-10 + Math.abs(dx) * 0.2} r={16} fill={C.yellow} />
            <circle cx={dx} cy={-10 + Math.abs(dx) * 0.2} r={30} fill={C.yellow} opacity={0.18} />
          </g>
        ))}
        <path d="M -150 0 Q 0 70 150 0" stroke={C.gold} strokeWidth={8} fill="none" />
      </g>
      <rect x={cx - 900} y={880} width={1800} height={14} rx={7} fill="#fff" opacity={0.25} />
      {groups.map((gx, gi) => {
        const rot = t * (40 + gi * 12);
        return (
          <g key={gi}>
            {/* «веретено» беседы */}
            <g transform={`translate(${cx + gx} 420) rotate(${rot})`}>
              <ellipse rx={70} ry={18} fill={C.gold} opacity={0.8} />
              <line x1={-90} x2={90} y1={0} y2={0} stroke={C.goldDeep} strokeWidth={6} />
            </g>
            <Label x={cx + gx} y={340} text={(p.labels ?? ["«Eh bien…»", "политика", "«charmant!»"])[gi]} size={28} serif />
            <Figure who={gi === 1 ? "annaP" : gi === 0 ? "helene" : "lady"} x={cx + gx - 70} y={880} s={0.75} pose={gi === 1 ? "point" : "stand"} t={t} />
            <Figure who={gi === 1 ? "boris" : gi === 0 ? "officer" : "anatole"} x={cx + gx + 70} y={880} s={0.75} flip pose="bow" t={t} />
          </g>
        );
      })}
      {/* Пьер — слишком большой и живой для этой гостиной */}
      <g opacity={pierreK} transform={`translate(0 ${(1 - pierreK) * 40})`}>
        <Figure who="pierre" x={cx + 230} y={900} s={0.95} pose="look" t={t} rim={C.yellow} />
        <Label x={cx + 230} y={520} text={p.text ?? "Пьер"} size={34} bg={C.yellow} />
      </g>
    </Drift>
  );
};

// ── Доска героев: четыре дома и исторические фигуры ──
type House = { name: string; members: Who[]; names: string[] };
const HOUSES: House[] = [
  { name: "Ростовы", members: ["countR", "countessR", "nikolai", "natasha", "petya", "sonya"], names: ["граф", "графиня", "Николай", "Наташа", "Петя", "Соня"] },
  { name: "Болконские", members: ["oldPrince", "andrei", "marya", "lise"], names: ["ст. князь", "Андрей", "Марья", "Лиза"] },
  { name: "Безуховы", members: ["pierre"], names: ["Пьер"] },
  { name: "Курагины", members: ["helene", "anatole"], names: ["Элен", "Анатоль"] },
];
export const CastBoard: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const w = Math.min(1700, a.x1 - a.x0);
  const colW = w / 4;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560} amount={0.02}>
      {HOUSES.map((h, i) => {
        const x = cx - w / 2 + colW * (i + 0.5);
        const k = ramp(t, at(ctx, Math.min(i * 0.35, ctx.beats.length - 1)));
        const n = h.members.length;
        return (
          <g key={h.name} opacity={k} transform={`translate(0 ${(1 - k) * 40})`}>
            <rect x={x - colW / 2 + 12} y={260} width={colW - 24} height={640} rx={26} fill={C.paper} opacity={0.92} />
            <text x={x} y={320} fontFamily={SERIF} fontWeight={700} fontSize={40} fill={C.ink} textAnchor="middle">
              {h.name}
            </text>
            {h.members.map((m, j) => {
              const cols = n > 3 ? 3 : n;
              const row = Math.floor(j / cols);
              const col = j % cols;
              const fx = x + (col - (Math.min(cols, n - row * cols) - 1) / 2) * (colW / 3.3);
              const fy = 590 + row * 280;
              return (
                <g key={m}>
                  <Figure who={m} x={fx} y={fy} s={n > 3 ? 0.62 : 0.8} t={t} />
                  <text x={fx} y={fy + 34} fontFamily={FONT} fontWeight={800} fontSize={18} fill={C.ink} textAnchor="middle">
                    {h.names[j]}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, Math.max(0, ctx.beats.length - 1))} x={cx} y={190}>
        <Label x={0} y={0} text={p.text ?? "плюс исторические лица: Наполеон, Кутузов, Александр I"} size={30} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Ось лет романа (историческая шкала, не таймер) ──
export const YearsAxis: React.FC<VisualProps<P & { marks?: { y: string; l: string }[] }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const marks = p.marks ?? [];
  const x0 = a.x0 + 80;
  const x1 = a.x1 - 80;
  const line = ramp(t, at(ctx, 0), 1.4);
  return (
    <Drift t={t} dur={dur} cx={a.cx} cy={540} amount={0.02}>
      <line x1={x0} y1={560} x2={x0 + (x1 - x0) * line} y2={560} stroke={C.paper} strokeWidth={12} strokeLinecap="round" />
      {marks.map((m, i) => {
        const x = x0 + ((x1 - x0) * (i + 0.5)) / marks.length;
        const k = ramp(t, at(ctx, 0.3 + (i * (Math.max(1, ctx.beats.length) - 0.3)) / marks.length));
        const up = i % 2 === 0;
        return (
          <g key={i} opacity={k} transform={`translate(${x} 560) scale(${0.85 + 0.15 * k})`}>
            <circle r={22} fill={C.dots[i % 8]} stroke="#fff" strokeWidth={6} />
            <text y={up ? -60 : 90} fontFamily={SERIF} fontWeight={700} fontSize={50} fill={C.paper} textAnchor="middle">
              {m.y}
            </text>
            <g transform={`translate(0 ${up ? -150 : 170})`}>
              <Label x={0} y={0} text={m.l} size={28} />
            </g>
          </g>
        );
      })}
    </Drift>
  );
};

// ── Книга и главный вопрос фильма ──
export const BigQuestion: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const items = p.items ?? [];
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      <Appear t={t} at={at(ctx, 0)} x={a.cx - 360} y={520}>
        <BookObj x={0} y={0} s={1.05} rot={wob(t, 1, 1.5)} />
      </Appear>
      {items.map((it, i) => (
        <Appear key={i} t={t} at={at(ctx, 0.5 + i * 0.6)} x={a.cx + 230} y={330 + i * 150}>
          <rect x={-380} y={-56} width={760} height={112} rx={26} fill={i === items.length - 1 ? C.yellow : C.paper} />
          <Txt x={0} y={14} size={38}>
            {it}
          </Txt>
        </Appear>
      ))}
      <text x={a.cx + 560} y={300} fontFamily={FONT} fontWeight={900} fontSize={220} fill={C.yellow} opacity={0.3} textAnchor="middle">
        ?
      </text>
    </Drift>
  );
};

// ── Карточка-цитата ──
export const QuoteScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const k = ramp(t, at(ctx, 0.15), 0.7);
  return (
    <Drift t={t} dur={dur} cx={a.cx} cy={500} amount={0.03}>
      <g opacity={k} transform={`translate(0 ${(1 - k) * 40})`}>
        <QuoteCardObj x={a.cx} y={470} w={Math.min(1240, a.x1 - a.x0 - 40)} text={p.text ?? ""} who={p.who ?? ""} size={p.text && p.text.length > 120 ? 40 : 48} />
      </g>
    </Drift>
  );
};

// ── Заставка части: крупная типографика (быстро, 1–2 реплики) ──
export const PartTitle: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const k = ramp(t, 0.1, 0.8);
  const k2 = ramp(t, 0.6, 0.8);
  const dots = makeDots(26, a.cx, 520, 640, 300, 19);
  return (
    <Drift t={t} dur={dur} cx={a.cx} cy={520} amount={0.05}>
      <g opacity={0.6}>
        <DotNet dots={dots} t={t} k={k} links={1} drift={14} />
      </g>
      <g opacity={k} transform={`translate(${a.cx} ${470 + (1 - k) * 30})`}>
        <text fontFamily={SERIF} fontWeight={700} fontSize={110} fill={C.paper} textAnchor="middle" stroke={OL} strokeWidth={2} paintOrder="stroke">
          {p.title ?? ""}
        </text>
      </g>
      <g opacity={k2} transform={`translate(${a.cx} 580)`}>
        <rect x={-((p.sub ?? "").length * 15 + 40)} y={-44} width={(p.sub ?? "").length * 30 + 80} height={70} rx={35} fill={C.yellow} />
        <text y={4} fontFamily={FONT} fontWeight={900} fontSize={42} fill={C.ink} textAnchor="middle">
          {p.sub ?? ""}
        </text>
      </g>
      {interpolate(t, [0, 1], [0, 1], { extrapolateRight: "clamp", easing: ease }) > 2 && null}
    </Drift>
  );
};
