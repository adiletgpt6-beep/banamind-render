// Слой «личный выбор»: дома, предметы, жесты героев — собственные рисунки
// BanaMind (силуэты эпохи, без портретов актёров и кадров экранизаций).
// Насилие, смерть и болезнь — только через символы: свеча, дверь, пустое место.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT, SERIF } from "../theme";
import { Candle, Cloud, Coin, Domes, DotNet, Figure, Hive, Label, makeDots, Manor, Oak, OL, Paper, rnd, Stars, Window, wrap, type Who } from "./draw";
import { Appear, area, at, clamp01, Drift, Fit, ramp, Txt, wob, type VisualProps } from "./kit";

type P = { host?: string; mode?: string; text?: string; labels?: string[]; items?: string[] };

const Floor: React.FC<{ y?: number; color?: string }> = ({ y = 900, color = "#fff" }) => <rect x={0} y={y} width={1920} height={1080 - y} fill={color} opacity={0.14} />;

// ── Дома и семьи: rostov | marya | meet | epilogue | nikolenka ──
export const Family: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const mode = p.mode ?? "rostov";
  if (mode === "marya") {
    return (
      <Drift t={t} dur={dur} cx={cx} cy={600}>
        <Manor x={cx} y={760} s={1.1} lit={0.6} />
        <Floor y={760} />
        <Figure who="oldPrince" x={cx - 180} y={900} s={0.85} pose={ramp(t, at(ctx, 1)) > 0.5 ? "reach" : "point"} t={t} />
        <Figure who="marya" x={cx + 120} y={900} s={0.85} flip pose={ramp(t, at(ctx, 1)) > 0.5 ? "kneel" : "stand"} t={t} rim={C.yellow} />
        <Appear t={t} at={at(ctx, 0.5)} x={cx + 160} y={330}>
          <Label x={0} y={0} text="«любовь и самоотвержение»" size={30} bg={C.yellow} />
        </Appear>
        <Appear t={t} at={at(ctx, 1.2)} x={cx - 220} y={460}>
          <Label x={0} y={0} text="«спасибо… прости»" size={30} serif />
        </Appear>
      </Drift>
    );
  }
  if (mode === "meet") {
    const k = ramp(t, at(ctx, 0.3), 1.6);
    return (
      <Drift t={t} dur={dur} cx={cx} cy={600}>
        <Manor x={cx + 320} y={760} s={0.7} lit={0.4} />
        {Array.from({ length: 9 }).map((_, i) => (
          <Figure key={i} who="peasant" x={cx + 120 + (i % 5) * 70} y={900 + Math.floor(i / 5) * 30} s={0.5} t={t + i} flip />
        ))}
        <Figure who="marya" x={cx - 60} y={900} s={0.75} t={t} pose="look" rim={C.yellow} />
        <g transform={`translate(${-600 * (1 - k)} 0)`}>
          <Figure who="nikolai" x={cx - 300} y={905} s={0.78} pose="walk" t={t} rim={C.yellow} />
        </g>
        <Appear t={t} at={at(ctx, 0.6)} x={cx - 200} y={420}>
          <Label x={0} y={0} text="случайная встреча" size={32} bg={C.yellow} />
        </Appear>
      </Drift>
    );
  }
  if (mode === "epilogue" || mode === "nikolenka") {
    const kids: Who[] = ["child", "child", "child", "nikolenka"];
    return (
      <Drift t={t} dur={dur} cx={cx} cy={620}>
        <Manor x={cx} y={760} s={1.2} lit={1} />
        <rect x={0} y={760} width={1920} height={320} fill="#eef4ff" opacity={0.5} />
        {Array.from({ length: 18 }).map((_, i) => (
          <circle key={i} cx={(rnd(i) * 1920 + t * 10) % 1920} cy={(rnd(i + 5) * 760 + t * 30) % 760} r={4} fill="#fff" opacity={0.8} />
        ))}
        {mode === "epilogue" && (
          <g>
            <Figure who="pierre" x={cx - 460} y={930} s={0.7} t={t} />
            <Figure who="natasha" x={cx - 360} y={930} s={0.7} t={t} flip rim={C.yellow} />
            <Figure who="nikolai" x={cx + 360} y={930} s={0.7} t={t} />
            <Figure who="marya" x={cx + 460} y={930} s={0.7} t={t} flip rim={C.yellow} />
            {kids.slice(0, 3).map((k, i) => (
              <Figure key={i} who={k} x={cx - 120 + i * 120} y={940} s={0.6} t={t + i} pose={i === 1 ? "dance" : "stand"} />
            ))}
            <Appear t={t} at={at(ctx, 0.2)} x={cx} y={300}>
              <Label x={0} y={0} text="Лысые Горы, 1820" size={34} bg={C.yellow} />
            </Appear>
          </g>
        )}
        {mode === "nikolenka" && (
          <g>
            <Figure who="pierre" x={cx - 260} y={930} s={0.8} t={t} pose="point" />
            <Figure who="nikolai" x={cx + 280} y={930} s={0.8} t={t} flip pose="arms" />
            <Figure who="nikolenka" x={cx} y={940} s={0.75} t={t} pose="look" rim={C.yellow} />
            <Appear t={t} at={at(ctx, 1)} x={cx} y={380}>
              <Label x={0} y={0} text="«Я думаю, что да»" size={34} serif />
            </Appear>
            <Appear t={t} at={at(ctx, 2)} x={cx} y={250}>
              <g>
                <DotNet dots={makeDots(18, 0, 0, 300, 70, 71)} t={t} k={ramp(t, at(ctx, 2), 1.4)} links={1} />
              </g>
            </Appear>
          </g>
        )}
      </Drift>
    );
  }
  // Ростовы: тёплая гостиная, танец, Наташа
  return (
    <Drift t={t} dur={dur} cx={cx} cy={620}>
      <rect x={cx - 760} y={240} width={1520} height={680} rx={30} fill="#f0d9a8" opacity={0.92} />
      {[0, 1, 2].map((i) => (
        <Window key={i} x={cx - 480 + i * 480} y={430} w={220} h={260} glow="#ffe9b0" />
      ))}
      <rect x={cx - 760} y={840} width={1520} height={80} fill="#c9a06a" />
      <Figure who="countR" x={cx - 380} y={880} s={0.75} pose="dance" t={t} />
      <Figure who="countessR" x={cx - 230} y={880} s={0.72} t={t} flip />
      <g transform={`translate(${Math.sin(t * 1.3) * 30} 0)`}>
        <Figure who="natasha" x={cx + 120} y={880} s={0.66} pose="dance" t={t} rim={C.yellow} />
      </g>
      <Figure who="sonya" x={cx + 300} y={880} s={0.64} t={t} />
      <Figure who="nikolai" x={cx + 450} y={880} s={0.72} t={t} flip />
      <Appear t={t} at={at(ctx, 0.4)} x={cx + 120} y={330}>
        <Label x={0} y={0} text="«Мама! какое пирожное будет?»" size={30} bg={C.yellow} />
      </Appear>
      {ramp(t, at(ctx, 1)) > 0 &&
        [0, 1, 2, 3].map((i) => {
          const k = ramp(t, at(ctx, 1) + i * 0.2);
          return <Coin key={i} x={cx - 600 + i * 50} y={300 + k * 500} r={22} spin={t * 3 + i} />;
        })}
    </Drift>
  );
};

// ── Наследство: портфель (борьба) | rich (лесть вокруг Пьера) ──
export const Inheritance: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  if (p.mode === "rich") {
    const bows: Who[] = ["annaP", "boris", "lady", "officer", "helene", "anatole"];
    return (
      <Drift t={t} dur={dur} cx={cx} cy={600}>
        <Floor />
        <Figure who="pierre" x={cx} y={900} s={0.95} t={t} pose="look" rim={C.yellow} />
        {bows.map((w, i) => {
          const ang = (i / bows.length) * Math.PI - Math.PI;
          const x = cx + Math.cos(ang) * 520;
          return <Figure key={w} who={w} x={x} y={900 - Math.sin(-ang) * 40} s={0.62} pose="bow" t={t + i} flip={x > cx} opacity={ramp(t, at(ctx, 0.1 + i * 0.12))} />;
        })}
        {Array.from({ length: 10 }).map((_, i) => (
          <Coin key={i} x={cx - 300 + i * 66} y={330 + Math.sin(t * 2 + i) * 20} r={20} spin={t * 2 + i} />
        ))}
        <Appear t={t} at={at(ctx, 0.5)} x={cx} y={240}>
          <Label x={0} y={0} text="«любовь» вокруг богатства" size={32} bg={C.yellow} />
        </Appear>
      </Drift>
    );
  }
  const tug = Math.sin(t * 2.2) * 30;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600}>
      <Floor />
      {/* мозаиковый портфель, который тянут в обе стороны */}
      <g transform={`translate(${cx + tug} 560)`}>
        <rect x={-110} y={-80} width={220} height={160} rx={14} fill="#7a4a2a" stroke={C.gold} strokeWidth={8} />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={-90 + (i % 4) * 46} y={-60 + Math.floor(i / 4) * 42} width={36} height={32} rx={4} fill={C.dots[i % 8]} opacity={0.85} />
        ))}
      </g>
      <Figure who="lady" x={cx - 300 + tug} y={900} s={0.8} pose="reach" t={t} flip />
      <Figure who="annaP" x={cx + 300 + tug} y={900} s={0.8} pose="reach" t={t} />
      <Appear t={t} at={at(ctx, 1)} x={0} y={0}>
        <Figure who="pierre" x={cx + 640} y={900} s={0.85} pose="stand" t={0} rim={C.yellow} />
        <Label x={cx + 640} y={520} text="«египетская статуя»" size={28} />
      </Appear>
      <Appear t={t} at={at(ctx, 0.3)} x={cx} y={300}>
        <Label x={0} y={0} text="завещание" size={34} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Дуэль в снегу: без крови; выстрел — вспышка, пауза, пустое поле ──
export const Duel: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const shot = ramp(t, at(ctx, 1.3), 0.4);
  const fall = ramp(t, at(ctx, 1.6), 0.8);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600}>
      <rect x={0} y={700} width={1920} height={380} fill={C.snow} opacity={0.85} />
      {Array.from({ length: 40 }).map((_, i) => (
        <circle key={i} cx={(rnd(i) * 1920 + Math.sin(t + i) * 20) % 1920} cy={(rnd(i + 9) * 1080 + t * 40) % 1080} r={3 + (i % 3)} fill="#fff" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={cx - 400 + i * 260 + Math.sin(t * 0.3 + i) * 40} cy={720} rx={260} ry={40} fill="#fff" opacity={0.5} />
      ))}
      <Figure who="pierre" x={cx - 340} y={880} s={0.85} pose="point" t={t} rim={C.yellow} />
      <g transform={`rotate(${fall * -60} ${cx + 340} 880)`}>
        <Figure who="dolokhov" x={cx + 340} y={880} s={0.85} pose={fall > 0.3 ? "kneel" : "point"} flip t={t} />
      </g>
      <g opacity={shot * (1 - ramp(t, at(ctx, 1.3) + 0.4, 0.3))} transform={`translate(${cx - 200} 640)`}>
        <polygon points="0,-30 9,-9 30,0 9,9 0,30 -9,9 -30,0 -9,-9" fill={C.yellow} />
      </g>
      <Appear t={t} at={at(ctx, 2)} x={cx} y={300}>
        <Label x={0} y={0} text="«Кто прав, кто виноват? Никто.»" size={34} serif />
      </Appear>
    </Drift>
  );
};

// ── Лестница поисков Пьера: ступени загораются и зачёркиваются ──
export const Ladder: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const items = p.items ?? [];
  const n = items.length;
  const paper = p.mode === "paper";
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560}>
      {items.map((it, i) => {
        const k = ramp(t, at(ctx, (i * Math.max(1, ctx.beats.length - 0.3)) / n));
        const x = cx - 420 + i * (840 / Math.max(1, n - 1));
        const y = 860 - i * (paper ? 0 : 120);
        const crossed = !paper && i < n - 1 && ramp(t, at(ctx, ((i + 1) * Math.max(1, ctx.beats.length - 0.3)) / n)) > 0.5;
        return (
          <g key={i} opacity={k} transform={`translate(0 ${(1 - k) * 30})`}>
            {paper ? (
              <g transform={`translate(${x} 560) rotate(${-4 + i * 3})`}>
                <rect x={-150} y={-190} width={300} height={380} rx={14} fill={C.paper} />
                <rect x={-120} y={-40} width={240} height={150} rx={8} fill={i === n - 1 ? C.red : C.steel} opacity={0.35} />
                <text y={-110} fontFamily={SERIF} fontWeight={700} fontSize={36} fill={C.ink} textAnchor="middle">
                  {it}
                </text>
                {i === n - 1 && (
                  <text y={60} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.red} textAnchor="middle">
                    на бумаге
                  </text>
                )}
              </g>
            ) : (
              <g>
                <rect x={x - 150} y={y - 20} width={300} height={40} rx={20} fill={i === n - 1 ? C.yellow : C.paper} />
                <text x={x} y={y - 40} fontFamily={FONT} fontWeight={900} fontSize={i === n - 1 ? 70 : 34} fill={C.paper} textAnchor="middle" stroke={OL} strokeWidth={1.5} paintOrder="stroke">
                  {it}
                </text>
                {crossed && <line x1={x - 120} y1={y - 52} x2={x + 120} y2={y - 52} stroke={C.red} strokeWidth={8} strokeLinecap="round" />}
              </g>
            )}
          </g>
        );
      })}
      {!paper && (
        <g transform={`translate(${cx - 420 + Math.min(n - 1, Math.floor(clamp01(t / Math.max(1, dur)) * n)) * (840 / Math.max(1, n - 1))} 0)`}>
          <Figure who="pierre" x={0} y={850 - Math.min(n - 1, Math.floor(clamp01(t / Math.max(1, dur)) * n)) * 120} s={0.45} pose="walk" t={t} rim={C.yellow} />
        </g>
      )}
    </Drift>
  );
};

// ── Паром: река, два друга, небо снова высокое ──
export const Ferry: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const sky = ramp(t, at(ctx, 1), 2);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={700} fill={C.sky} opacity={0.25 + 0.55 * sky} />
      {[0, 1, 2].map((i) => (
        <Cloud key={i} x={((rnd(i) * 1920 + t * 10) % 2200) - 150} y={160 + i * 110} s={0.8} opacity={0.6 + 0.3 * sky} />
      ))}
      <Drift t={t} dur={dur} cx={cx} cy={700}>
        <rect x={0} y={700} width={1920} height={380} fill="#5f8fd0" opacity={0.85} />
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d={`M ${((i * 190 + t * 25) % 2100) - 100} ${760 + (i % 3) * 70} q 40 -16 80 0`} stroke="#d8e8ff" strokeWidth={5} fill="none" />
        ))}
        <g transform={`translate(${cx + Math.sin(t * 0.4) * 20} 0)`}>
          <rect x={-380} y={740} width={760} height={50} rx={10} fill="#8a6a44" />
          <Figure who="pierre" x={-120} y={745} s={0.72} t={t} pose="arms" />
          <Figure who="andrei" x={130} y={745} s={0.72} t={t} flip pose="look" rim={C.yellow} />
        </g>
        <Appear t={t} at={at(ctx, 0.5)} x={cx - 120} y={340}>
          <Label x={0} y={0} text="«Надо жить, надо любить, надо верить»" size={32} bg={C.yellow} />
        </Appear>
      </Drift>
    </g>
  );
};

// ── Дуб: bare (корявый, без листьев) | bloom (молодая листва) ──
export const OakScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const bloom = p.mode === "bloom";
  const leaf = bloom ? 0.25 + 0.75 * ramp(t, 0.3, 2.4) : 0;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={640}>
      <rect x={0} y={760} width={1920} height={320} fill={bloom ? "#8fbf4f" : "#a9a68a"} opacity={0.7} />
      {Array.from({ length: 10 }).map((_, i) => (
        <g key={i} transform={`translate(${a.x0 + i * ((a.x1 - a.x0) / 9)} 780)`}>
          <rect x={-6} y={-150} width={12} height={150} fill="#e9e6dc" />
          <ellipse cx={0} cy={-170} rx={44} ry={70} fill={bloom ? "#9fd36a" : "#d9e6c0"} opacity={0.9} />
        </g>
      ))}
      <Oak x={cx + 60} y={820} s={1.35} leaf={leaf} t={t} />
      <g transform={`translate(${cx - 520 + t * 25} 0)`}>
        <rect x={-110} y={760} width={200} height={80} rx={20} fill="#5a4a3a" />
        <circle cx={-70} cy={850} r={28} fill="none" stroke={OL} strokeWidth={8} />
        <circle cx={60} cy={850} r={28} fill="none" stroke={OL} strokeWidth={8} />
        <Figure who="andrei" x={-10} y={790} s={0.42} pose="sit" t={t} />
      </g>
      <Appear t={t} at={at(ctx, 0.3)} x={cx + 60} y={200}>
        <Label x={0} y={0} text={bloom ? "«жизнь не кончена»" : "«ни весны, ни солнца, ни счастья»"} size={32} bg={bloom ? C.yellow : C.paper} />
      </Appear>
    </Drift>
  );
};

// ── Лунная ночь в Отрадном: окно сверху, Андрей внизу слушает ──
export const WindowScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#1f2d5c" opacity={0.55} />
      <Stars t={t} n={70} y1={700} />
      <g transform={`translate(${a.x1 - 260} 200)`}>
        <circle r={86} fill="#fff6d0" />
        <circle r={130} fill="#fff6d0" opacity={0.18} />
      </g>
      <Drift t={t} dur={dur} cx={cx} cy={560}>
        <Fit a={a} w={1300} c={cx + 140}>
        <rect x={cx - 420} y={180} width={840} height={900} fill="#6a5a7a" />
        <Window x={cx} y={330} w={300} h={260} glow="#cfe0ff">
          <Figure who="natasha" x={-50} y={120} s={0.42} t={t} pose="look" rim={C.yellow} />
          <Figure who="sonya" x={70} y={125} s={0.4} t={t} flip />
        </Window>
        <Window x={cx} y={760} w={300} h={240} glow="#ffe39a">
          <Figure who="andrei" x={0} y={110} s={0.42} t={t} pose="look" />
        </Window>
        <Appear t={t} at={at(ctx, 0.4)} x={cx + 520} y={330}>
          <Label x={0} y={0} text="«прелестной ночи…»" size={30} bg={C.yellow} />
        </Appear>
        <Appear t={t} at={at(ctx, 1.1)} x={cx + 520} y={760}>
          <Label x={0} y={0} text="надежда" size={30} />
        </Appear>
        </Fit>
      </Drift>
    </g>
  );
};

// ── Первый бал: пары кружатся, Наташа у стены → вальс ──
export const Ball: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const waltz = ramp(t, at(ctx, 0.55), 1);
  const pairs = 6;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600}>
      <rect x={cx - 800} y={760} width={1600} height={180} fill="#f3e3c0" opacity={0.6} />
      {[-500, 0, 500].map((dx) => (
        <g key={dx} transform={`translate(${cx + dx} 130)`}>
          <circle r={18} fill={C.yellow} />
          <circle r={44} fill={C.yellow} opacity={0.2} />
        </g>
      ))}
      {Array.from({ length: pairs }).map((_, i) => {
        const ang = t * 0.7 + (i / pairs) * Math.PI * 2;
        const x = cx + 120 + Math.cos(ang) * 380;
        const y = 860 + Math.sin(ang) * 50;
        return (
          <g key={i} opacity={0.75}>
            <Figure who="officer" x={x - 30} y={y} s={0.5} pose="dance" t={t} />
            <Figure who="lady" x={x + 30} y={y} s={0.5} pose="dance" t={t} flip />
          </g>
        );
      })}
      {/* Наташа: у стены → в вальсе с Андреем */}
      <g transform={`translate(${(1 - waltz) * -560 + waltz * 120 + Math.cos(t * 1.4) * 60 * waltz} ${Math.sin(t * 1.4) * 20 * waltz})`}>
        <Figure who="natasha" x={cx + 20} y={890} s={0.62} pose={waltz > 0.5 ? "dance" : "stand"} t={t} rim={C.yellow} />
        <g opacity={waltz}>
          <Figure who="andrei" x={cx - 60} y={890} s={0.66} pose="dance" t={t} rim={C.yellow} />
        </g>
      </g>
      <Figure who="pierre" x={cx + 640} y={890} s={0.68} t={t} pose="point" flip />
      <Appear t={t} at={at(ctx, 0.75)} x={cx} y={300}>
        <Label x={0} y={0} text="«вино ее прелести»" size={32} bg={C.yellow} />
      </Appear>
      <Appear t={t} at={at(ctx, 1.4)} x={cx} y={420}>
        <Label x={0} y={0} text="отсрочка: один год" size={30} />
      </Appear>
    </Drift>
  );
};

// ── Опера: картонные декорации, ложи, взгляд Анатоля ──
export const Theatre: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const lure = ramp(t, at(ctx, 1), 1.4);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560}>
      {/* занавес */}
      <rect x={cx - 760} y={140} width={1520} height={800} fill="#6a2f3c" />
      <rect x={cx - 640} y={220} width={1280} height={640} fill="#f0d9a8" />
      {/* картонные деревья — плоские, с видимыми подпорками */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${cx - 480 + i * 320} 760)`}>
          <polygon points="-60,0 0,-260 60,0" fill="#6aa86a" />
          <rect x={-6} y={0} width={12} height={60} fill="#8a6a44" />
          <line x1={0} y1={-80} x2={60} y2={60} stroke="#8a6a44" strokeWidth={6} />
        </g>
      ))}
      <Label x={cx} y={290} text="картон и фальшь" size={30} opacity={1 - lure * 0.6} />
      {/* ложа Наташи и взгляд Анатоля */}
      <g transform={`translate(${cx - 520} 900)`}>
        <rect x={-120} y={-60} width={240} height={60} rx={12} fill="#4a2030" />
        <Figure who="natasha" x={0} y={-40} s={0.5} t={t} pose="look" rim={C.yellow} />
      </g>
      <g transform={`translate(${cx + 480} 930)`}>
        <Figure who="anatole" x={0} y={0} s={0.62} t={t} flip pose="look" />
      </g>
      <line x1={cx + 440} y1={680} x2={cx - 500} y2={740} stroke={C.rose} strokeWidth={5} strokeDasharray="10 14" opacity={lure} />
      <Appear t={t} at={at(ctx, 1.2)} x={cx} y={520}>
        <Label x={0} y={0} text="«нет той преграды стыдливости»" size={30} bg={C.rose} />
      </Appear>
    </Drift>
  );
};

// ── Комета 1812 года над Москвой ──
export const Comet: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const k = ramp(t, at(ctx, Math.max(0, ctx.beats.length - 2)), 1.6);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#1b2650" opacity={0.6} />
      <Stars t={t} n={90} y1={760} />
      <Drift t={t} dur={dur} cx={cx} cy={600}>
        <g opacity={k} transform={`translate(${cx + 260} 260) rotate(-20)`}>
          <path d="M 0 0 Q -260 40 -520 0 Q -260 -14 0 0 Z" fill="#fff2c4" opacity={0.75} />
          <path d="M 0 0 Q -200 30 -380 0 Q -200 -10 0 0 Z" fill={C.yellow} />
          <circle r={22} fill="#fff" />
        </g>
        <Domes x={cx} y={1000} s={1} color="#2a2f4a" />
        <Figure who="pierre" x={cx - 520} y={980} s={0.62} t={t} pose="look" rim={C.yellow} />
        <Appear t={t} at={at(ctx, 0.2)} x={cx - 300} y={360}>
          <Label x={0} y={0} text="«Я не могу»" size={32} serif />
        </Appear>
        <Appear t={t} at={at(ctx, Math.max(0, ctx.beats.length - 2) + 0.4)} x={cx + 200} y={480}>
          <Label x={0} y={0} text="«вся жизнь впереди»" size={32} bg={C.yellow} />
        </Appear>
      </Drift>
    </g>
  );
};

// ── Карты и долг Ростовых ──
export const Ledger: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const sum = Math.round(interpolate(t, [at(ctx, 1), at(ctx, 1.6)], [0, 43], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560}>
      <Fit a={a} w={1500} c={cx}>
      <rect x={cx - 560} y={480} width={1120} height={60} rx={20} fill="#2f6e55" />
      <rect x={cx - 600} y={540} width={1200} height={30} rx={10} fill="#5a3f22" />
      {Array.from({ length: 7 }).map((_, i) => (
        <g key={i} transform={`translate(${cx - 330 + i * 110} ${450 + wob(t, i, 3)}) rotate(${-8 + i * 3})`} opacity={ramp(t, at(ctx, 0.8 + i * 0.05))}>
          <rect x={-40} y={-60} width={80} height={120} rx={10} fill="#fff" stroke={OL} strokeWidth={3} />
          <text y={14} fontFamily={SERIF} fontWeight={700} fontSize={40} fill={i % 2 ? C.red : C.ink} textAnchor="middle">
            {["7", "♥", "Т", "К", "9", "♠", "В"][i]}
          </text>
        </g>
      ))}
      <Figure who="nikolai" x={cx - 640} y={900} s={0.8} t={t} pose="look" />
      <Figure who="dolokhov" x={cx + 640} y={900} s={0.8} t={t} flip pose="point" />
      <g opacity={ramp(t, at(ctx, 1))}>
        <text x={cx} y={300} fontFamily={SERIF} fontWeight={700} fontSize={120} fill={C.paper} textAnchor="middle" stroke={OL} strokeWidth={3} paintOrder="stroke">
          {sum} 000
        </text>
      </g>
      <Appear t={t} at={at(ctx, 2)} x={cx} y={760}>
        <Label x={0} y={0} text="долг или любовь?" size={34} bg={C.yellow} />
      </Appear>
      {Array.from({ length: 8 }).map((_, i) => {
        const k = ramp(t, at(ctx, 0.2) + i * 0.25, 1.2);
        return <Coin key={i} x={cx - 200 + i * 60} y={620 + k * 400} r={18} spin={t * 4 + i} />;
      })}
      </Fit>
    </Drift>
  );
};

// ── Письмо Сони ──
export const Letter: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const unfold = ramp(t, at(ctx, 0.5), 1.2);
  const dots = makeDots(24, cx, 520, 520, 300, 81);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={540}>
      <Fit a={a} w={1300} c={cx}>
      <g opacity={ramp(t, at(ctx, 2), 1.2)}>
        <DotNet dots={dots} t={t} k={ramp(t, at(ctx, 2), 1.5)} links={2} />
      </g>
      <g transform={`translate(${cx} 520) scale(${0.6 + 0.4 * unfold} ${0.3 + 0.7 * unfold})`}>
        <Paper x={0} y={0} w={620} h={420} rot={-2}>
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={-230} x2={230 - (i === 4 ? 160 : 0)} y1={-120 + i * 50} y2={-120 + i * 50} stroke={C.inkSoft} strokeWidth={5} strokeLinecap="round" opacity={ramp(t, at(ctx, 0.6 + i * 0.1))} />
          ))}
          <text x={180} y={160} fontFamily={SERIF} fontStyle="italic" fontWeight={700} fontSize={36} fill={C.ink} textAnchor="end">
            ваша Соня
          </text>
        </Paper>
      </g>
      <Figure who="sonya" x={cx - 520} y={900} s={0.75} t={t} pose="read" rim={C.yellow} />
      <Figure who="countessR" x={cx + 520} y={900} s={0.72} t={t} flip pose="reach" />
      <Appear t={t} at={at(ctx, 1)} x={cx} y={180}>
        <Label x={0} y={0} text="жертва? вынужденный шаг?" size={32} bg={C.yellow} />
      </Appear>
      </Fit>
    </Drift>
  );
};

// ── Подводы: вещи → раненые ──
export const Carts: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const swap = ramp(t, at(ctx, 1), 1.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600}>
      <Manor x={cx} y={700} s={1} lit={0.8} />
      <rect x={0} y={700} width={1920} height={380} fill="#c9b08a" opacity={0.6} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${cx - 520 + i * 360} 900)`}>
          <rect x={-130} y={-80} width={260} height={60} rx={10} fill="#6a4a2a" />
          <circle cx={-90} cy={-10} r={34} fill="none" stroke={OL} strokeWidth={9} />
          <circle cx={90} cy={-10} r={34} fill="none" stroke={OL} strokeWidth={9} />
          {/* сундуки уходят, раненые садятся */}
          <g opacity={1 - swap} transform={`translate(0 ${-swap * 120})`}>
            <rect x={-100} y={-170} width={90} height={90} rx={6} fill="#8a5a3a" stroke={C.gold} strokeWidth={4} />
            <rect x={0} y={-150} width={100} height={70} rx={6} fill="#a87a4a" stroke={C.gold} strokeWidth={4} />
          </g>
          <g opacity={swap}>
            <Figure who="soldier" x={-40} y={-80} s={0.42} pose="sit" t={t + i} />
            <Figure who="soldier" x={60} y={-80} s={0.42} pose="sit" t={t + i + 1} flip />
          </g>
        </g>
      ))}
      <Figure who="natasha" x={cx + 640} y={920} s={0.75} t={t} pose="point" flip rim={C.yellow} />
      <Appear t={t} at={at(ctx, 1)} x={cx + 520} y={420}>
        <Label x={0} y={0} text="«Раненые, вот кто!»" size={34} bg={C.yellow} />
      </Appear>
      <Appear t={t} at={at(ctx, 2)} x={cx - 300} y={300}>
        <circle r={14} fill={C.yellow} stroke="#fff" strokeWidth={5} />
        <Label x={0} y={-70} text="точка, которой нет на карте" size={28} />
      </Appear>
    </Drift>
  );
};

// ── Пустой улей ──
export const HiveScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const empty = ramp(t, at(ctx, 0.4), 2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600}>
      <Domes x={cx + 200} y={940} s={0.9} color="#5a5f8a" opacity={0.6} />
      <Hive x={cx - 260} y={880} s={1.2} bees={1 - empty} t={t} />
      <Appear t={t} at={at(ctx, 0.5)} x={cx - 260} y={300}>
        <Label x={0} y={0} text="«пуста… обезматочивший улей»" size={30} bg={C.yellow} />
      </Appear>
      <Appear t={t} at={at(ctx, 1)} x={cx + 420} y={420}>
        <Figure who="napoleon" x={0} y={240} s={0.6} t={t} pose="look" flip />
        <Label x={0} y={-120} text="театральный эффект?" size={28} />
      </Appear>
    </Drift>
  );
};

// ── Пожар: условное зарево, купола, Пьер выносит ребёнка ──
export const Fire: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const k2 = ramp(t, at(ctx, 1), 1);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill={C.ember} opacity={0.22} />
      <Drift t={t} dur={dur} cx={cx} cy={600}>
        {Array.from({ length: 9 }).map((_, i) => {
          const x = a.x0 + 60 + i * ((a.x1 - a.x0 - 120) / 8);
          const h = 120 + rnd(i) * 140 + Math.sin(t * 3 + i) * 16;
          return (
            <g key={i} transform={`translate(${x} 780)`}>
              <path d={`M -60 0 Q -40 ${-h * 0.6} 0 ${-h} Q 40 ${-h * 0.6} 60 0 Z`} fill={C.amber} opacity={0.85} />
              <path d={`M -30 0 Q -20 ${-h * 0.4} 0 ${-h * 0.6} Q 20 ${-h * 0.4} 30 0 Z`} fill={C.yellow} />
            </g>
          );
        })}
        <Domes x={cx} y={860} s={0.95} color="#3a2f4a" />
        <rect x={0} y={860} width={1920} height={220} fill="#4a3a4a" />
        <g opacity={k2}>
          <Figure who="pierre" x={cx + 200} y={1000} s={0.75} t={t} pose="walk" rim={C.yellow} />
          <Figure who="child" x={cx + 250} y={830} s={0.36} t={t} pose="sit" />
          <Label x={cx + 200} y={560} text="девочка из сада у горящего дома" size={30} bg={C.yellow} />
        </g>
        <Appear t={t} at={at(ctx, 0.3)} x={cx - 300} y={200}>
          <Label x={0} y={0} text="«необходимо должен был сгореть»" size={30} />
        </Appear>
      </Drift>
    </g>
  );
};

// ── Свеча: встреча / утрата Пети / ночь у матери ──
export const CandleScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const mode = p.mode ?? "meet";
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#1f2a50" opacity={0.45} />
      <Drift t={t} dur={dur} cx={cx} cy={600}>
        <circle cx={cx} cy={560} r={360} fill={C.yellow} opacity={0.12} />
        <Candle x={cx} y={720} s={1.6} t={t} />
        {mode === "meet" && (
          <g>
            <Figure who="andrei" x={cx - 300} y={880} s={0.8} pose="lie" t={0} />
            <Figure who="natasha" x={cx + 260} y={900} s={0.75} pose="kneel" t={t} flip rim={C.yellow} />
            <Appear t={t} at={at(ctx, 0.3)} x={cx} y={250}>
              <Label x={0} y={0} text="«Простите меня!»" size={34} serif />
            </Appear>
          </g>
        )}
        {mode === "petya" && (
          <g>
            {/* пустое место у костра, изюм */}
            <circle cx={cx - 300} cy={860} r={60} fill={C.amber} opacity={0.5} />
            <Figure who="denisov" x={cx + 300} y={900} s={0.8} pose="look" t={t} flip />
            {Array.from({ length: 9 }).map((_, i) => (
              <ellipse key={i} cx={cx - 340 + (i % 3) * 30} cy={930 + Math.floor(i / 3) * 16} rx={10} ry={7} fill="#5a3a5a" />
            ))}
            <Appear t={t} at={at(ctx, 1)} x={cx} y={260}>
              <Label x={0} y={0} text="«Отличный изюм, берите весь»" size={32} serif />
            </Appear>
          </g>
        )}
        {mode === "mother" && (
          <g>
            <Figure who="countessR" x={cx - 260} y={900} s={0.78} pose="sit" t={t} />
            <Figure who="natasha" x={cx + 220} y={900} s={0.74} pose="kneel" t={t} flip rim={C.yellow} />
            <Appear t={t} at={at(ctx, 1)} x={cx} y={260}>
              <Label x={0} y={0} text="«Проснулась любовь, и проснулась жизнь»" size={30} bg={C.yellow} />
            </Appear>
            <Appear t={t} at={at(ctx, 2)} x={0} y={0}>
              <Figure who="marya" x={cx + 520} y={900} s={0.74} pose="stand" t={t} flip />
            </Appear>
          </g>
        )}
      </Drift>
    </g>
  );
};

// ── Каратаев: барак, картошка с солью, собака ──
export const Karataev: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600}>
      <rect x={cx - 760} y={260} width={1520} height={660} rx={20} fill="#a08a68" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={cx - 760 + i * 130} y={260} width={10} height={660} fill="#7d6a4e" />
      ))}
      <circle cx={cx} cy={640} r={360} fill={C.yellow} opacity={0.22} />
      <Figure who="karataev" x={cx - 160} y={840} s={0.9} pose="reach" t={t} rim={C.yellow} />
      <Figure who="pierre" x={cx + 200} y={840} s={0.92} pose="sit" t={t} flip rim="#cfd8ff" />
      {/* картошка с солью */}
      <g transform={`translate(${cx + 20} ${640 + wob(t, 2, 4)})`} opacity={ramp(t, at(ctx, 0.3))}>
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={-30 + i * 30} cy={0} rx={22} ry={16} fill="#c9a06a" stroke={OL} strokeWidth={3} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={-40 + i * 11} cy={-18 - (i % 2) * 6} r={2.5} fill="#fff" />
        ))}
      </g>
      {/* собачка */}
      <g transform={`translate(${cx - 420} 900)`}>
        <ellipse cx={0} cy={-40} rx={60} ry={30} fill="#8a6a4a" />
        <circle cx={58} cy={-62} r={24} fill="#8a6a4a" />
        <path d={`M -58 -50 Q -86 ${-80 + Math.sin(t * 8) * 10} -96 -70`} stroke="#8a6a4a" strokeWidth={10} fill="none" strokeLinecap="round" />
        {[-40, -10, 20, 45].map((x) => (
          <rect key={x} x={x} y={-20} width={10} height={22} rx={4} fill="#8a6a4a" />
        ))}
      </g>
      <Appear t={t} at={at(ctx, 0.5)} x={cx} y={330}>
        <Label x={0} y={0} text="«час терпеть, а век жить»" size={32} bg={C.yellow} />
      </Appear>
      <Appear t={t} at={at(ctx, 1.4)} x={cx} y={440}>
        <Label x={0} y={0} text="«простота и правда»" size={28} />
      </Appear>
    </Drift>
  );
};

// ── Звёзды над колонной пленных: «и все это я» ──
export const StarsScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const k = ramp(t, at(ctx, 1.4), 1.6);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#16224a" opacity={0.6} />
      <Stars t={t} n={60 + Math.round(120 * k)} y1={760} seed={5} />
      <Drift t={t} dur={dur} cx={cx} cy={700}>
        <rect x={0} y={860} width={1920} height={220} fill="#2f3f6a" />
        {Array.from({ length: 10 }).map((_, i) => (
          <Figure key={i} who="peasant" x={((i * 170 + t * 14) % 1900) + 10} y={900} s={0.38} pose="walk" t={t + i} fill="#3a4568" />
        ))}
        <Figure who="pierre" x={cx - 60} y={880} s={0.85} t={t} pose="arms" rim={C.yellow} fill="#4a5a9a" />
        <Appear t={t} at={at(ctx, 0.4)} x={cx - 60} y={460}>
          <Label x={0} y={0} text="«совершенная внутренняя свобода»" size={30} />
        </Appear>
        <Appear t={t} at={at(ctx, 1.5)} x={cx - 60} y={330}>
          <Label x={0} y={0} text="«и все это я!»" size={38} bg={C.yellow} />
        </Appear>
      </Drift>
    </g>
  );
};

// ── Сон о глобусе из капель (у Толстого) ↔ сеть точек (схема фильма) ──
export const Globe: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const R = 300;
  const n = 90;
  const merge = ramp(t, at(ctx, 1), 2);
  const gone = ramp(t, at(ctx, 1.6), 1.2);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#1b2a5a" opacity={0.5} />
      <Drift t={t} dur={dur} cx={cx} cy={540} amount={0.05}>
        <circle cx={cx} cy={540} r={R + 14} fill="#fff" opacity={0.08} />
        {Array.from({ length: n }).map((_, i) => {
          // точки на сфере (проекция), медленное вращение
          const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
          const th = Math.PI * (1 + Math.sqrt(5)) * i + t * 0.25;
          const x = Math.sin(phi) * Math.cos(th);
          const y = Math.cos(phi);
          const z = Math.sin(phi) * Math.sin(th);
          const r = (9 + 6 * (z + 1)) * (1 + merge * 0.5 * Math.sin(t * 1.3 + i) ** 2);
          const isK = i === 17;
          const op = isK ? 1 - gone : 0.55 + 0.45 * ((z + 1) / 2);
          return (
            <g key={i} opacity={op}>
              <circle cx={cx + x * R} cy={540 + y * R} r={r + 2.5} fill="#fff" />
              <circle cx={cx + x * R} cy={540 + y * R} r={r} fill={isK ? C.yellow : C.dots[i % 8]} />
            </g>
          );
        })}
        <Appear t={t} at={at(ctx, 1.2)} x={cx} y={150}>
          <Label x={0} y={-10} text="«разлился и исчез»" size={34} serif />
        </Appear>
        <Appear t={t} at={at(ctx, 2)} x={cx} y={250}>
          <Label x={0} y={0} text="сон Пьера ≈ сеть точек" size={30} bg={C.yellow} />
        </Appear>
      </Drift>
    </g>
  );
};

// ── Дверь: сон Андрея (без изображения смерти — только свет за дверью) ──
export const Door: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const open = ramp(t, at(ctx, 1.2), 2.2);
  const push = Math.sin(t * 3) * 0.04 * (1 - open);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#2a2f5a" opacity={0.4} />
      <Drift t={t} dur={dur} cx={cx} cy={540}>
        <rect x={cx - 200} y={220} width={400} height={680} fill="#fff6d8" />
        <rect x={cx - 200} y={220} width={400} height={680} fill={C.yellow} opacity={0.35 * open} />
        <g transform={`translate(${cx - 200} 220) scale(${Math.max(0.05, 1 - open * 0.9 - push)} 1)`}>
          <rect x={0} y={0} width={400} height={680} fill="#6a4a3a" stroke={OL} strokeWidth={6} />
          <rect x={40} y={40} width={320} height={260} rx={10} fill="none" stroke="#8a6a54" strokeWidth={8} />
          <rect x={40} y={360} width={320} height={260} rx={10} fill="none" stroke="#8a6a54" strokeWidth={8} />
          <circle cx={360} cy={350} r={14} fill={C.gold} />
        </g>
        <Figure who="andrei" x={cx - 330} y={900} s={0.8} pose="reach" t={t} />
        <Appear t={t} at={at(ctx, 0.3)} x={cx + 480} y={340}>
          <Label x={0} y={0} text="«я слишком люблю вас»" size={30} serif />
        </Appear>
        <Appear t={t} at={at(ctx, 1.6)} x={cx + 480} y={460}>
          <Label x={0} y={0} text="«смерть — пробуждение»" size={30} bg={C.yellow} />
        </Appear>
      </Drift>
    </g>
  );
};

// ── Встреча Пьера и Наташи: улыбка, «заржавелая дверь» ──
export const Reunion: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const smile = ramp(t, at(ctx, 0.6), 1.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600}>
      <rect x={cx - 700} y={260} width={1400} height={660} rx={30} fill="#efe1c8" opacity={0.9} />
      <circle cx={cx + 140} cy={560} r={200 + 120 * smile} fill={C.yellow} opacity={0.18 * smile} />
      <Figure who="pierre" x={cx - 240} y={900} s={0.95} t={t} pose="look" />
      <Figure who="natasha" x={cx + 160} y={900} s={0.85} t={t} flip fill={smile > 0.5 ? undefined : "#2a2a3a"} rim={smile > 0.5 ? C.yellow : "#8a8aa0"} />
      <Figure who="marya" x={cx + 420} y={900} s={0.82} t={t} flip fill="#2f3446" />
      <Appear t={t} at={at(ctx, 0.6)} x={cx + 160} y={330}>
        <Label x={0} y={0} text="«как отворяется заржавелая дверь»" size={28} serif />
      </Appear>
      <Appear t={t} at={at(ctx, 1.2)} x={cx - 240} y={440}>
        <Label x={0} y={0} text="«Пока есть жизнь, есть и счастье»" size={28} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Дождь над полем: тихий вопрос ──
export const Rain: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#5a6a8a" opacity={0.45} />
      {Array.from({ length: 120 }).map((_, i) => {
        const x = (rnd(i) * 2100 + t * 30) % 2000;
        const y = (rnd(i + 3) * 1080 + t * (500 + (i % 5) * 60)) % 1100;
        return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 34} stroke="#e6eefc" strokeWidth={3} strokeLinecap="round" opacity={0.7} />;
      })}
      <Drift t={t} dur={dur} cx={cx} cy={700}>
        <rect x={0} y={860} width={1920} height={220} fill="#6a7a5a" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Figure key={i} who={i % 2 ? "frenchman" : "soldier"} x={cx - 600 + i * 240} y={900} s={0.5} pose="look" t={t + i} flip={i % 2 === 1} fill="#3a4258" />
        ))}
        <Appear t={t} at={at(ctx, 0.3)} x={cx} y={300}>
          <Label x={0} y={0} text="«Опомнитесь. Что вы делаете?»" size={34} serif />
        </Appear>
      </Drift>
    </g>
  );
};

// служебная: подпись ключевого слова (используется в итоговых сценах)
export const Caption: React.FC<{ x: number; y: number; text: string; size?: number }> = ({ x, y, text, size = 40 }) => (
  <g>
    {wrap(text, 30).map((l, i) => (
      <Txt key={i} x={x} y={y + i * size * 1.2} size={size} color={C.paper}>
        {l}
      </Txt>
    ))}
  </g>
);
