// Глава 1 «Мастер с пустым кошельком»: Бансир и колесница, два пустых кошелька, сон, поток,
// «заработать ≠ сохранить», друзья у Аркада.
import React from "react";
import { C, ZONES } from "../theme";
import { Bubble, Fade, Hero, Mark } from "./common";
import { Dots } from "./dots";
import { at, clamp01, Coin, cxOf, ease, Label, pop, ramp, Txt, type VisualProps } from "./kit";

type P = { host?: string };

export const Bansir: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const tags = [
    { text: "Мастерство", ok: true },
    { text: "Работа", ok: true },
    { text: "Деньги", ok: false },
  ];
  return (
    <g>
      <Dots shape="chariot" x={560} y={500} size={420} t={t} at={0.1} sp={12} />
      <Label x={560} y={760} text="недоделанная колесница" k={pop(t, at(ctx, 1.2))} color={C.clayDeep} size={30} />
      <Dots shape="wall" x={1060} y={640} size={300} t={t} at={0.3} sp={10} dim={0.3} />
      <Hero t={t} at={0.5} x={1060} y={400} size={250} a={C.spend} b={C.goldDeep} name="Бансир" />
      <Dots shape="wallet" x={1220} y={520} size={130} t={t} at={k1} sp={7} />
      {tags.map((g, i) => {
        const k = pop(t, k1 + 0.6 + i * 0.5);
        return (
          <g key={g.text}>
            <Label x={420 + i * 330} y={170} text={g.text} k={k} size={40} color={g.ok ? C.incomeDeep : C.spendDeep} bg={g.ok ? C.incomeLight : C.spendLight} />
            <Mark x={540 + i * 330 + (g.text.length - 6) * 12} y={156} ok={g.ok} k={ramp(t, k1 + 0.9 + i * 0.5, 0.5)} s={34} />
          </g>
        );
      })}
    </g>
  );
};

export const TwoPurses: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const kx = 870;
  const bx = 1380;
  return (
    <g>
      <Hero t={t} at={0.1} x={kx} y={420} size={250} a={C.lapis} b={C.gold} name="Кобби" />
      <Hero t={t} at={0.3} x={bx} y={420} size={250} a={C.spend} b={C.goldDeep} name="Бансир" />
      <Bubble x={kx + 40} y={180} text="Одолжи два шекеля?" k={pop(t, at(ctx, 0.4))} tail="down" />
      <Bubble x={bx - 20} y={180} text="Это всё моё состояние" k={pop(t, at(ctx, 1.3))} tail="down" bg={C.spendLight} />
      {/* мечта о большой лире */}
      <Fade k={pop(t, at(ctx, 2.2))}>
        <circle cx={kx - 250} cy={360} r={150} fill={C.white} opacity={0.7} />
        <circle cx={kx - 120} cy={470} r={14} fill={C.white} opacity={0.7} />
        <circle cx={kx - 90} cy={500} r={8} fill={C.white} opacity={0.7} />
      </Fade>
      <Dots shape="lyre" x={kx - 250} y={360} size={230} t={t} at={at(ctx, 2.2)} sp={8} />
      {[kx, bx].map((x, i) => (
        <g key={i}>
          <Dots shape="wallet" x={x + 150} y={600} size={130} t={t} at={at(ctx, 3) - 0.2 + i * 0.2} sp={7} />
          <Label x={x + 150} y={720} text="пусто" k={pop(t, at(ctx, 3.3) + i * 0.2)} color={C.spendDeep} size={30} />
        </g>
      ))}
    </g>
  );
};

export const Dream: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const cx = 760;
  const wake = at(ctx, 0.55);
  const dreamOp = 1 - ramp(t, wake, 0.5);
  return (
    <g>
      <g opacity={dreamOp}>
        <ellipse cx={cx} cy={420} rx={330} ry={260} fill={C.white} opacity={0.75} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={cx + Math.cos(i) * 300} cy={420 + Math.sin(i * 1.3) * 220} r={70} fill={C.white} opacity={0.6} />
        ))}
      </g>
      {t < wake + 0.2 ? (
        <Dots shape="walletFull" x={cx} y={430} size={440} t={t} at={0.1} sp={12} out={wake} outMode="fade" />
      ) : (
        <Dots shape="wallet" x={cx} y={430} size={440} t={t} at={wake} sp={12} />
      )}
      <Label x={cx} y={130} text={t < wake ? "Сон" : "Утро"} k={pop(t, 0.3)} color={C.inkSoft} size={40} />
      {/* сыновья */}
      <Hero t={t} at={at(ctx, 1)} x={330} y={560} size={170} a={C.spend} b={C.gold} />
      <Hero t={t} at={at(ctx, 1) + 0.2} x={1180} y={560} size={170} a={C.spend} b={C.gold} />
      <Label x={330} y={760} text="сыновья?" k={pop(t, at(ctx, 1.3))} size={30} />
      <Label x={1180} y={760} text="та же дорога?" k={pop(t, at(ctx, 1.4))} size={30} />
      <Label x={cx} y={820} text="Почему ничего не остаётся?" k={pop(t, at(ctx, 2.2))} color={C.white} bg={C.ink} size={42} />
    </g>
  );
};

export const Stream: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host) - 120;
  const wy = 500;
  const s0 = at(ctx, 1);
  // постоянный поток: каждая монета идёт по каналу в кошелёк
  const coins: React.ReactNode[] = [];
  if (t > s0) {
    const n = Math.floor((t - s0) / 0.45);
    for (let i = Math.max(0, n - 6); i <= n; i++) {
      const k = clamp01((t - s0 - i * 0.45) / 1.6);
      if (k <= 0 || k >= 1) continue;
      const e = ease(k);
      coins.push(<Coin key={i} x={cx - 520 + 520 * e} y={200 + (wy - 140 - 200) * e - Math.sin(e * Math.PI) * 40} r={20} op={1 - clamp01((k - 0.85) * 7)} />);
    }
  }
  return (
    <g>
      <path d={`M ${cx - 560} 200 Q ${cx - 260} 150 ${cx} ${wy - 150}`} fill="none" stroke={ZONES.income.color} strokeWidth={34} strokeLinecap="round" opacity={0.25 * ramp(t, s0 - 0.3, 0.6)} />
      {coins}
      <Dots shape="wallet" x={cx} y={wy} size={360} t={t} at={0.1} sp={11} />
      <Hero t={t} at={0.3} kind="elder" x={1560} y={420} size={240} a={C.debt} b={C.gold} name="Аркад" />
      <Label x={cx - 420} y={130} text="что приходит" k={pop(t, at(ctx, 2))} color={C.incomeDeep} bg={C.incomeLight} size={38} />
      <Label x={cx} y={790} text="что остаётся" k={pop(t, at(ctx, 2.4))} color={C.keepDeep} bg={C.keepLight} size={38} />
    </g>
  );
};

export const EarnKeep: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const lx = 470;
  const rx = 1110;
  const k1 = at(ctx, 1);
  return (
    <g>
      <rect x={lx - 270} y={150} width={540} height={620} rx={40} fill={C.white} opacity={0.75 * ramp(t, 0.1, 0.5)} />
      <rect x={rx - 270} y={150} width={540} height={620} rx={40} fill={C.white} opacity={0.75 * ramp(t, k1, 0.5)} />
      <Txt x={lx} y={230} size={52} weight={900} color={C.incomeDeep} opacity={ramp(t, 0.2, 0.4)}>
        {"Заработать"}
      </Txt>
      <Dots shape="chariot" x={lx - 110} y={440} size={220} t={t} at={0.3} sp={8} />
      <Dots shape="lyre" x={lx + 120} y={440} size={210} t={t} at={0.6} sp={8} />
      <Mark x={lx} y={660} ok k={ramp(t, at(ctx, 0.6), 0.5)} s={70} />
      <Txt x={rx} y={230} size={52} weight={900} color={C.keepDeep} opacity={ramp(t, k1, 0.4)}>
        {"Сохранить"}
      </Txt>
      <Dots shape="wallet" x={rx} y={450} size={260} t={t} at={k1 + 0.1} sp={9} />
      <g transform={`translate(${rx} 660) scale(${pop(t, at(ctx, 1.5))})`}>
        <circle r={48} fill={C.gold} />
        <Txt x={0} y={22} size={64} weight={900}>
          {"?"}
        </Txt>
      </g>
      <Label x={(lx + rx) / 2} y={850} text="два разных умения" k={pop(t, at(ctx, 1.7))} color={C.white} bg={C.ink} size={40} />
    </g>
  );
};

export const Friends: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const ax = 1500;
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <Hero key={i} t={t} at={0.1 + i * 0.15} x={720 + i * 170} y={440} size={220} a={[C.spend, C.lapis, C.income][i]} b={C.gold} />
      ))}
      <Label x={890} y={640} text="друзья юности" k={pop(t, 0.8)} size={30} />
      <Bubble x={890} y={190} text="Почему тебе повезло?" k={pop(t, at(ctx, 0.5))} />
      <Hero t={t} at={0.4} kind="elder" x={ax} y={420} size={250} a={C.debt} b={C.gold} name="Аркад" />
      {/* что делает внезапное богатство */}
      <Fade k={pop(t, k1 + 0.8)}>
        <Label x={720} y={760} text="транжиры" k={1} color={C.spendDeep} bg={C.spendLight} size={34} />
      </Fade>
      {[0, 1, 2].map((i) => {
        const s = k1 + 1 + i * 0.25;
        const kk = clamp01((t - s) / 0.9);
        return t > s ? <Coin key={i} x={640 + 60 * i + 140 * kk} y={700 - 160 * ease(kk)} r={18} op={1 - kk} /> : null;
      })}
      <Fade k={pop(t, k1 + 1.4)}>
        <Label x={1060} y={760} text="скряги" k={1} color={C.debtDeep} bg={C.debtLight} size={34} />
      </Fade>
      <Dots shape="chest" x={1060} y={690} size={90} t={t} at={k1 + 1.4} sp={6} />
      <Dots shape="tablet" x={ax} y={180} size={150} t={t} at={k2} sp={7} />
      <Label x={ax - 40} y={300} text="правила можно выучить" k={pop(t, k2 + 0.4)} color={C.incomeDeep} bg={C.incomeLight} size={30} />
    </g>
  );
};
