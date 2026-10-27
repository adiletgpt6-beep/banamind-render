// Слой «историческая перспектива»: образы из рассуждений Толстого (яблоко,
// паровоз, рука, бесконечно малые) и итоговые выводы фильма. Яркие точки —
// чёткие, без размытия; движение детерминированное.
import React from "react";
import { C, FONT, SERIF } from "../theme";
import { BigArrow, DotNet, Figure, Label, makeDots, OL, rnd } from "./draw";
import { Appear, area, at, clamp01, Drift, Fit, ramp, Txt, wob, type VisualProps } from "./kit";

type P = { host?: string; mode?: string; text?: string; labels?: string[]; items?: string[] };

// ── Яблоко: «Ничто не причина» ──
export const Apple: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx - 60;
  const fall = ramp(t, at(ctx, 2.6), 0.9);
  const labels = p.labels ?? [];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560}>
      <rect x={0} y={860} width={1920} height={220} fill="#8fbf4f" opacity={0.6} />
      {/* дерево */}
      <path d={`M ${cx - 30} 870 Q ${cx - 20} 650 ${cx - 40} 470 L ${cx + 30} 470 Q ${cx + 20} 650 ${cx + 40} 870 Z`} fill="#6a4a2a" />
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={cx - 260 + rnd(i) * 520} cy={300 + rnd(i + 7) * 200} r={70 + rnd(i + 2) * 40} fill={i % 2 ? C.oak : "#7faf4f"} />
      ))}
      {/* яблоко */}
      <g transform={`translate(${cx + 120} ${420 + fall * 430}) rotate(${fall * 180})`}>
        <circle r={34} fill={C.red} />
        <rect x={-3} y={-46} width={6} height={16} fill="#5a3a1a" />
        <ellipse cx={14} cy={-44} rx={14} ry={7} fill={C.oak} />
      </g>
      <Figure who="child" x={cx + 300} y={900} s={0.6} pose="reach" t={t} flip />
      {labels.map((l, i) => {
        const pos = [[-430, 300], [-470, 470], [420, 300], [460, 470]][i % 4];
        return (
          <Appear key={l} t={t} at={at(ctx, 2 + i * 0.15)} x={cx + pos[0]} y={pos[1]}>
            <Label x={0} y={0} text={l} size={28} />
          </Appear>
        );
      })}
      <Appear t={t} at={at(ctx, 2.8)} x={cx + 120} y={960}>
        <Label x={0} y={0} text="«Ничто не причина»" size={36} bg={C.yellow} />
      </Appear>
      {ctx.beats.length > 1 && (
        <Appear t={t} at={at(ctx, 1.4)} x={a.x0 + 260} y={180}>
          <Label x={0} y={0} text="«Царь — есть раб истории»" size={30} serif />
        </Appear>
      )}
    </Drift>
  );
};

// ── Паровоз: что его движет? ──
export const Locomotive: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const x = cx - 200 + ((t * 30) % 120);
  const labels = p.labels ?? [];
  const wheel = t * 140;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600}>
      <rect x={0} y={860} width={1920} height={20} fill="#5a4a3a" />
      {Array.from({ length: 24 }).map((_, i) => (
        <rect key={i} x={i * 90 - ((t * 120) % 90)} y={870} width={40} height={14} fill="#7a6a5a" />
      ))}
      <g transform={`translate(${x} 0)`}>
        <rect x={-260} y={660} width={380} height={160} rx={20} fill="#2f3f6a" />
        <rect x={120} y={600} width={150} height={220} rx={14} fill="#3a4a7a" />
        <rect x={-210} y={560} width={60} height={110} fill="#2a3560" />
        <rect x={150} y={630} width={90} height={70} rx={8} fill="#ffe39a" />
        {[-180, -40, 100, 220].map((wx, i) => (
          <g key={i} transform={`translate(${wx} 840) rotate(${wheel})`}>
            <circle r={44} fill="none" stroke={OL} strokeWidth={12} />
            <line x1={-40} x2={40} y1={0} y2={0} stroke={OL} strokeWidth={8} />
            <line x1={0} x2={0} y1={-40} y2={40} stroke={OL} strokeWidth={8} />
          </g>
        ))}
        {/* дым относит ветром назад */}
        {Array.from({ length: 6 }).map((_, i) => {
          const ph = (t * 0.5 + i / 6) % 1;
          return <circle key={i} cx={-180 - ph * 520} cy={540 - ph * 160} r={30 + ph * 50} fill="#e9ecf4" opacity={0.9 * (1 - ph)} />;
        })}
      </g>
      {labels.map((l, i) => (
        <Appear key={l} t={t} at={at(ctx, 1 + i * 0.25)} x={cx - 540 + i * 360} y={260 + (i % 2) * 90}>
          <Label x={0} y={0} text={l} size={32} bg={i === labels.length - 1 ? C.yellow : C.paper} />
        </Appear>
      ))}
      <Appear t={t} at={at(ctx, 0.3)} x={cx} y={150}>
        <Label x={0} y={0} text="«Какая сила движет народами?»" size={34} serif />
      </Appear>
    </Drift>
  );
};

// ── «Поднял и опустил руку»: шкала свобода ↔ необходимость ──
export const Freedom: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const hand = Math.sin(clamp01((t - at(ctx, 0.5)) / 2.4) * Math.PI);
  const slide = ramp(t, at(ctx, 1.2), 1.6);
  const pos = 0.5 + Math.sin(t * 0.6) * 0.32 * slide;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560}>
      <Fit a={a} w={1380} c={cx + 180}>
      {/* фигура поднимает руку */}
      <g transform={`translate(${cx - 380} 0)`}>
        <Figure who="pierre" x={0} y={880} s={1} pose={hand > 0.5 ? "reach" : "stand"} t={t} rim={C.yellow} />
      </g>
      <Appear t={t} at={at(ctx, 0.4)} x={cx - 380} y={250}>
        <Label x={0} y={0} text="«я поднял и опустил руку»" size={30} serif />
      </Appear>
      {/* шкала */}
      <g opacity={slide}>
        <rect x={cx + 20} y={540} width={720} height={30} rx={15} fill={C.paper} />
        <rect x={cx + 20} y={540} width={720 * pos} height={30} rx={15} fill={C.yellow} />
        <circle cx={cx + 20 + 720 * pos} cy={555} r={30} fill="#fff" stroke={OL} strokeWidth={6} />
        <Txt x={cx + 20} y={500} size={34} anchor="start" color={C.paper}>
          свобода
        </Txt>
        <Txt x={cx + 740} y={500} size={34} anchor="end" color={C.paper}>
          необходимость
        </Txt>
        {["связь с миром", "время", "знание причин"].map((l, i) => (
          <Appear key={l} t={t} at={at(ctx, 1.4 + i * 0.2)} x={cx + 380} y={680 + i * 90}>
            <Label x={0} y={0} text={l} size={28} />
          </Appear>
        ))}
      </g>
      </Fit>
    </Drift>
  );
};

// ── Бесконечно малые: точки-решения складываются в кривую движения ──
export const Calculus: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const k = ramp(t, at(ctx, 0.2), 4);
  const N = 120;
  const x0 = cx - 620;
  const x1 = cx + 620;
  const curve = (u: number) => 760 - 380 * (u * u * (3 - 2 * u)) - Math.sin(u * 9) * 30;
  const last = ramp(t, at(ctx, 1.1), 1.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560}>
      <line x1={x0} y1={800} x2={x1} y2={800} stroke={C.paper} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
      {Array.from({ length: N }).map((_, i) => {
        const u = i / (N - 1);
        const kk = clamp01(k * 1.3 - u * 0.3);
        if (kk <= 0) return null;
        const sx = x0 + rnd(i) * (x1 - x0);
        const sy = 200 + rnd(i + 3) * 500;
        const tx = x0 + u * (x1 - x0);
        const ty = curve(u) + wob(t, i, 3);
        return (
          <g key={i}>
            <circle cx={sx + (tx - sx) * kk} cy={sy + (ty - sy) * kk} r={9} fill="#fff" />
            <circle cx={sx + (tx - sx) * kk} cy={sy + (ty - sy) * kk} r={6.5} fill={C.dots[i % 8]} />
          </g>
        );
      })}
      <text x={x0} y={200} fontFamily={SERIF} fontStyle="italic" fontWeight={700} fontSize={64} fill={C.paper} opacity={ramp(t, at(ctx, 0.4))}>
        Σ dx
      </text>
      <Appear t={t} at={at(ctx, 0.6)} x={cx + 300} y={180}>
        <Label x={0} y={0} text="«бесчисленное количество людских произволов»" size={26} bg={C.yellow} />
      </Appear>
      <g opacity={last}>
        <Label x={cx} y={960} text="«признать неощущаемую нами зависимость»" size={30} serif />
      </g>
    </Drift>
  );
};

// ── Три вывода фильма ──
export const Conclusions: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const items = p.items ?? [];
  const w = Math.min(1100, a.x1 - a.x0 - 60);
  return (
    <Drift t={t} dur={dur} cx={a.cx} cy={540} amount={0.02}>
      {items.map((it, i) => {
        const k = ramp(t, at(ctx, i + 1));
        const y = 290 + i * 210;
        return (
          <g key={i} opacity={k} transform={`translate(${a.cx} ${y + (1 - k) * 30})`}>
            <rect x={-w / 2 + 8} y={-70} width={w} height={150} rx={30} fill={OL} opacity={0.2} />
            <rect x={-w / 2} y={-80} width={w} height={150} rx={30} fill={C.paper} />
            <circle cx={-w / 2 + 90} cy={-5} r={52} fill={C.dots[i * 2 + 1]} stroke="#fff" strokeWidth={8} />
            <text x={-w / 2 + 90} y={14} fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.ink} textAnchor="middle">
              {i + 1}
            </text>
            <text x={-w / 2 + 180} y={10} fontFamily={FONT} fontWeight={900} fontSize={46} fill={C.ink}>
              {it}
            </text>
            {i === 0 && <BigArrow x1={w / 2 - 220} y1={-5} x2={w / 2 - 60} y2={-5} w={30} grow={1 - ramp(t, at(ctx, 1.6), 1)} />}
            {i === 0 && <DotNet dots={makeDots(10, w / 2 - 140, -5, 80, 40, 91)} t={t} k={ramp(t, at(ctx, 1.6), 1)} links={1} />}
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, 0)} x={a.cx} y={130}>
        <Label x={0} y={0} text="выводы фильма — не цитаты Толстого" size={28} />
      </Appear>
    </Drift>
  );
};

// ── Притча о баране (эпилог I): стаду откармливаемый баран кажется гением ──
const Sheep: React.FC<{ x: number; y: number; s?: number; fat?: number; t: number; seed?: number }> = ({ x, y, s = 1, fat = 1, t, seed = 0 }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 2 + seed) * 2}) scale(${s})`}>
    {[-30, -12, 12, 30].map((lx) => (
      <rect key={lx} x={lx * fat - 5} y={-20} width={10} height={40} rx={4} fill="#3a3550" />
    ))}
    {Array.from({ length: 7 }).map((_, i) => (
      <circle key={i} cx={(-40 + i * 13) * fat} cy={-40 + (i % 2) * 10} r={26 * Math.sqrt(fat)} fill="#f4f1e8" stroke="#d8d2c2" strokeWidth={3} />
    ))}
    <ellipse cx={55 * fat} cy={-50} rx={18} ry={22} fill="#3a3550" />
    <circle cx={60 * fat} cy={-54} r={3} fill="#fff" />
  </g>
);
export const Ram: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const halo = ramp(t, at(ctx, 0.4), 1);
  const insight = ramp(t, at(ctx, 1.2), 1.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600}>
      <rect x={0} y={760} width={1920} height={320} fill="#8fbf4f" opacity={0.55} />
      {/* загон */}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={cx - 640 + i * 70} y={650} width={12} height={200} fill="#8a6a44" />
      ))}
      <rect x={cx - 640} y={700} width={500} height={10} fill="#8a6a44" />
      {Array.from({ length: 7 }).map((_, i) => (
        <Sheep key={i} x={cx - 560 + (i % 4) * 110} y={860 + Math.floor(i / 4) * 50} s={0.9} t={t} seed={i} />
      ))}
      {/* «гений» */}
      <circle cx={cx + 280} cy={740} r={190} fill={C.yellow} opacity={0.25 * halo * (1 - insight * 0.7)} />
      <Sheep x={cx + 260} y={860} s={1.5} fat={1.7} t={t} seed={9} />
      <Appear t={t} at={at(ctx, 0.5)} x={cx + 280} y={480}>
        <Label x={0} y={0} text="«должен казаться гением»" size={32} bg={C.yellow} />
      </Appear>
      <g opacity={insight}>
        <Label x={cx - 300} y={430} text="«случай»?" size={30} />
        <Label x={cx - 300} y={530} text="«гений»?" size={30} />
        <line x1={cx - 420} y1={480} x2={cx - 180} y2={480} stroke={C.red} strokeWidth={8} strokeLinecap="round" />
      </g>
    </Drift>
  );
};
