// Глава 3 «Нужды и желания»: класс из ста учеников, расходы растут вместе с доходом, сорняки
// желаний, табличка расходов, вьючный осёл и свет в пещере.
import React from "react";
import { C, HEAVY, ZONES } from "../theme";
import { Bubble, Card, Fade, Hero, Item } from "./common";
import { Dots, hash } from "./dots";
import { at, clamp01, Coin, cxOf, Label, pop, ramp, Txt, type VisualProps } from "./kit";

type P = { host?: string };

export const Classroom: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const cx = 760;
  const k1 = at(ctx, 1);
  // сто учеников полукругом (по четыре ряда)
  const kids: React.ReactNode[] = [];
  let i = 0;
  for (let row = 0; row < 4; row++) {
    const n = 19 + row * 4;
    const R = 300 + row * 70;
    for (let j = 0; j < n && i < 100; j++, i++) {
      const a = Math.PI * (0.06 + (0.88 * j) / (n - 1));
      const x = cx + Math.cos(a) * R * 1.25;
      const y = 300 + Math.sin(a) * R * 0.8;
      const k = ramp(t, k1 + 0.1 + hash(i, 2) * 1.2, 0.4);
      const col = [C.spend, C.lapis, C.income, C.orange, C.debt, C.keep][i % 6];
      kids.push(
        <g key={i} opacity={k}>
          <circle cx={x} cy={y - 16} r={11} fill="#e9b183" />
          <rect x={x - 12} y={y - 4} width={24} height={26} rx={8} fill={col} />
        </g>,
      );
    }
  }
  return (
    <g>
      {/* золото у немногих */}
      <Fade k={pop(t, 0.2) * (1 - ramp(t, k1 - 0.2, 0.4))}>
        {Array.from({ length: 14 }).map((_, j) => (
          <Coin key={j} x={330 + (j % 5) * 46} y={560 - Math.floor(j / 5) * 40} r={22} />
        ))}
        <Label x={420} y={680} text="у немногих" k={1} color={C.goldDeep} bg={C.goldLight} size={34} />
        {[0, 1, 2, 3].map((j) => (
          <g key={j}>
            <Dots shape="wallet" x={760 + j * 150} y={540} size={110} t={t} at={0.4 + j * 0.1} sp={6} />
          </g>
        ))}
        <Label x={985} y={680} text="у большинства — пусто" k={1} color={C.spendDeep} bg={C.spendLight} size={34} />
      </Fade>
      {kids}
      <Hero t={t} at={k1} kind="elder" x={cx} y={330} size={230} a={C.debt} b={C.gold} name="Аркад" />
      {Array.from({ length: 7 }).map((_, j) => {
        const k = pop(t, at(ctx, 1.5) + j * 0.15);
        return (
          <g key={j} transform={`translate(${cx - 390 + j * 130} 130) scale(${k})`} opacity={clamp01(k * 1.5)}>
            <rect x={-46} y={-36} width={92} height={72} rx={14} fill={C.clay} />
            <text y={16} fontFamily={HEAVY} fontWeight={800} fontSize={44} fill={C.white} textAnchor="middle">
              {j + 1}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const GrowingNeeds: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const k1 = at(ctx, 1);
  const grow = ramp(t, at(ctx, 1.5), 1.6);
  const people = [
    { inc: 8, col: C.spend },
    { inc: 12, col: C.lapis },
    { inc: 16, col: C.income },
  ];
  return (
    <g>
      {people.map((pp, i) => {
        const x = cx - 360 + i * 400;
        const inc = pp.inc * (1 + 0.5 * grow);
        const h = (v: number) => v * 18;
        const k = ramp(t, 0.2 + i * 0.25, 0.6);
        return (
          <g key={i}>
            <Hero t={t} at={0.1 + i * 0.2} x={x} y={260} size={170} a={pp.col} b={C.gold} />
            {/* доход и расходы — одинаковой высоты */}
            <rect x={x - 90} y={780 - h(inc) * k} width={80} height={h(inc) * k} rx={12} fill={ZONES.income.color} />
            <rect x={x + 10} y={780 - h(inc) * k} width={80} height={h(inc) * k} rx={12} fill={ZONES.spend.color} />
            <Txt x={x - 50} y={815} size={26} color={C.incomeDeep}>
              {"доход"}
            </Txt>
            <Txt x={x + 50} y={815} size={26} color={C.spendDeep}>
              {"расходы"}
            </Txt>
            <Label x={x} y={880} text="кошелёк: 0" k={pop(t, k1 + i * 0.2)} color={C.spendDeep} size={28} />
          </g>
        );
      })}
      <Label x={cx} y={130} text="доход растёт — расходы следом" k={pop(t, at(ctx, 1.5))} color={C.white} bg={C.ink} size={38} />
    </g>
  );
};

export const Weeds: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const wishes = ["наряды", "украшения", "пир", "диковинки", "ещё наряд", "лошадь", "ковры", "ещё…"];
  return (
    <g>
      <Dots shape="wallet" x={330} y={420} size={260} t={t} at={0.1} sp={9} />
      {Array.from({ length: 5 }).map((_, i) => (
        <Coin key={i} x={240 + i * 46} y={600} r={20} op={ramp(t, 0.5 + i * 0.1, 0.3)} />
      ))}
      <Label x={330} y={700} text="денег — столько" k={pop(t, 0.6)} color={C.incomeDeep} bg={C.incomeLight} size={30} />
      {wishes.map((w, i) => {
        const a = (i / wishes.length) * Math.PI * 2;
        const x = 900 + Math.cos(a) * 300;
        const y = 380 + Math.sin(a) * 200;
        return <Bubble key={w} x={x} y={y} text={w} k={pop(t, at(ctx, 0.3) + i * 0.18)} size={30} bg={C.spendLight} color={C.spendDeep} />;
      })}
      <Label x={900} y={380} text="желания" k={pop(t, at(ctx, 0.25))} color={C.white} bg={C.spend} size={38} />
      {/* поле: сорняки растут там, где для них оставили место */}
      <rect x={160} y={780} width={1220} height={70} rx={20} fill="#c98a46" opacity={ramp(t, k1, 0.5)} />
      {Array.from({ length: 9 }).map((_, i) => (
        <Dots key={i} shape="sprout" x={230 + i * 135} y={760} size={110} t={t} at={k1 + 0.3 + i * 0.22} sp={6} />
      ))}
    </g>
  );
};

export const WishList: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const items = [
    { s: "хлеб и еда", ok: true },
    { s: "крыша над головой", ok: true },
    { s: "одежда", ok: true },
    { s: "новая туника — в пределах девяти", ok: true },
    { s: "пир каждую неделю", ok: false },
    { s: "ещё украшения", ok: false },
  ];
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  return (
    <g>
      <Card x={cx - 420} y={120} w={840} h={620} k={pop(t, 0.1)} fill={C.clayLight} stroke={C.clay} title="Табличка расходов" titleColor={C.clayDeep}>
        {items.map((it, i) => (
          <Item
            key={it.s}
            x={cx - 300}
            y={260 + i * 72}
            text={it.s}
            k={pop(t, at(ctx, 0.3) + i * 0.15)}
            mark={{ ok: it.ok, k: ramp(t, k1 + 0.2 + i * 0.25, 0.4) }}
            strike={it.ok ? 0 : ramp(t, k1 + 0.4 + i * 0.25, 0.5)}
            size={36}
            w={680}
          />
        ))}
      </Card>
      {/* десятая часть — не трогается */}
      <g opacity={ramp(t, k2, 0.5)}>
        <Coin x={cx + 330} y={690} r={36} glow={0.8} />
        <Label x={cx + 330} y={820} text="1/10 — не трогать" k={pop(t, k2 + 0.2)} color={C.keepDeep} bg={C.keepLight} size={34} />
      </g>
    </g>
  );
};

export const DonkeyLoad: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  const wrong = ["ковры", "слитки золота", "драгоценности"];
  const right = ["сено", "зерно", "вода"];
  return (
    <g>
      <Bubble x={560} y={170} text="Я не раб планов!" k={pop(t, 0.3) * (1 - ramp(t, k1, 0.3))} bg={C.spendLight} />
      <Dots shape="donkey" x={600} y={520} size={420} t={t} at={0.2} sp={11} />
      {wrong.map((w, i) => (
        <Item key={w} x={980} y={230 + i * 70} text={w} k={pop(t, k1 + 0.3 + i * 0.15)} mark={{ ok: false, k: ramp(t, k1 + 0.9, 0.4) }} strike={ramp(t, k1 + 1, 0.5)} size={36} w={360} />
      ))}
      {right.map((w, i) => (
        <Item key={w} x={980} y={490 + i * 70} text={w} k={pop(t, at(ctx, 1.6) + i * 0.15)} mark={{ ok: true, k: ramp(t, at(ctx, 1.7) + i * 0.15, 0.4) }} size={36} w={360} />
      ))}
      {/* свет в пещере: показывает, где кошелёк протекает */}
      <Fade k={pop(t, k2)}>
        <path d="M 250 160 L 120 760 L 420 760 Z" fill={C.goldLight} opacity={0.5} />
      </Fade>
      <Dots shape="lamp" x={250} y={170} size={150} t={t} at={k2} sp={7} />
      <Label x={270} y={840} text="видно утечки" k={pop(t, k2 + 0.5)} color={C.goldDeep} bg={C.goldLight} size={32} />
    </g>
  );
};

