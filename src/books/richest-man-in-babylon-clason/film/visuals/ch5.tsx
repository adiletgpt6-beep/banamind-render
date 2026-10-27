// Глава 5 «Возможность без чудес»: найденный кошелёк — редкость, понятное общее дело и новые
// наряды, канительщик и первый телёнок, ночное стадо (поспешность — тоже ошибка), порядок
// «понять — спросить — решить».
import React from "react";
import { C, HEAVY } from "../theme";
import { Bubble, Card, Fade, Hero, Item, Mark } from "./common";
import { Dots } from "./dots";
import { Arrow, at, clamp01, Coin, cxOf, ease, Label, pop, ramp, Txt, type VisualProps } from "./kit";

type P = { host?: string };

export const FoundPurse: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  return (
    <g>
      <Hero t={t} at={0.1} x={520} y={420} size={230} a={C.lapis} b={C.gold} name="ткач" />
      <Dots shape="walletFull" x={760} y={560} size={170} t={t} at={0.5} sp={7} />
      <Bubble x={560} y={170} text="как привлечь удачу?" k={pop(t, at(ctx, 0.4))} size={34} />
      {/* зал: никто больше не находил */}
      <g opacity={ramp(t, k1, 0.4) * (1 - ramp(t, k2 - 0.2, 0.4))}>
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i}>
            <circle cx={980 + (i % 6) * 70} cy={340 + Math.floor(i / 6) * 100} r={20} fill="#e9b183" />
            <rect x={962 + (i % 6) * 70} y={362 + Math.floor(i / 6) * 100} width={36} height={40} rx={12} fill={[C.spend, C.income, C.debt][i % 3]} />
          </g>
        ))}
        <Label x={1155} y={580} text="кто ещё находил? — никто" k={pop(t, k1 + 0.6)} color={C.spendDeep} bg={C.spendLight} size={32} />
      </g>
      <Dots shape="door" x={1150} y={430} size={300} t={t} at={k2} sp={10} />
      <Label x={1150} y={640} text="упущенные возможности" k={pop(t, k2 + 0.4)} color={C.white} bg={C.ink} size={34} />
    </g>
  );
};

export const Delay: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const k1 = at(ctx, 1);
  // двенадцать участников: каждый вносит десятую часть
  const people = Array.from({ length: 12 }).map((_, i) => {
    const a = Math.PI * (0.05 + (0.9 * i) / 11);
    const x = cx + Math.cos(a) * 470;
    const y = 640 - Math.sin(a) * 300;
    const s = at(ctx, 0.35) + i * 0.08;
    const kk = clamp01((t - s - 0.4) / 0.8);
    return (
      <g key={i} opacity={ramp(t, s, 0.3)}>
        <circle cx={x} cy={y - 18} r={17} fill="#e9b183" />
        <rect x={x - 17} y={y} width={34} height={36} rx={11} fill={i === 11 ? C.spend : [C.lapis, C.income, C.debt, C.orange][i % 4]} />
        {i !== 11 && t > s + 0.4 && kk < 1 && <Coin x={x + (cx - x) * ease(kk)} y={y + (560 - y) * ease(kk)} r={14} />}
      </g>
    );
  });
  const pull = ramp(t, k1 + 0.4, 1);
  return (
    <g>
      <Dots shape="canal" x={cx} y={560} size={360} t={t} at={0.2} sp={10} />
      <Label x={cx} y={790} text="вода на сухую землю" k={pop(t, at(ctx, 0.5))} color={C.incomeDeep} bg={C.incomeLight} size={32} />
      {people}
      {/* новые наряды уводят решение */}
      <g transform={`translate(${-260 * pull} 0)`}>
        <Dots shape="tunic" x={cx - 600} y={240} size={170} t={t} at={k1} sp={7} />
      </g>
      <Label x={cx - 640} y={420} text="«потом»" k={pop(t, k1 + 0.5)} color={C.spendDeep} bg={C.spendLight} size={36} />
      <Label x={cx} y={150} text="понятный план — и отложенное решение" k={pop(t, at(ctx, 1.6))} color={C.white} bg={C.ink} size={34} />
    </g>
  );
};

export const Procrastinator: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  const later = ["потом", "в другой раз", "не сейчас", "после праздника", "когда-нибудь"];
  return (
    <g>
      <g transform={`translate(560 220) scale(${pop(t, 0.2)})`}>
        <rect x={-300} y={-70} width={600} height={120} rx={60} fill={C.white} />
        <text y={20} fontFamily={HEAVY} fontWeight={800} fontSize={64} fill={C.ink} textAnchor="middle">
          канительщик
        </text>
      </g>
      {later.map((s, i) => (
        <g key={s} opacity={(1 - ramp(t, k1 + 0.6, 0.5)) * ramp(t, at(ctx, 0.5) + i * 0.15, 0.3)} transform={`translate(${400 + (i % 2) * 200} ${380 + i * 70}) rotate(${(i % 2 ? 1 : -1) * 4})`}>
          <rect x={-120} y={-30} width={240} height={56} rx={14} fill={C.goldLight} />
          <text y={10} fontFamily={HEAVY} fontWeight={800} fontSize={28} fill={C.goldDeep} textAnchor="middle">
            {s}
          </text>
        </g>
      ))}
      <Mark x={500} y={520} ok={false} k={ramp(t, k1 + 0.2, 0.5)} s={140} />
      <Label x={500} y={780} text="враг — привычка медлить" k={pop(t, k1 + 0.4)} color={C.white} bg={C.ink} size={34} />
      {/* первый телёнок → стадо */}
      <Dots shape="ox" x={1070} y={420} size={160} t={t} at={k2} sp={7} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Dots key={i} shape="ox" x={940 + (i % 3) * 130} y={600 + Math.floor(i / 3) * 110} size={110} t={t} at={k2 + 1.2 + i * 0.2} sp={6} />
      ))}
      <Label x={1070} y={290} text="первый шаг" k={pop(t, k2 + 0.4)} color={C.incomeDeep} bg={C.incomeLight} size={32} />
    </g>
  );
};

export const SheepNight: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  const lx = cx - 330;
  const rx = cx + 330;
  return (
    <g>
      {/* ночь — врезка, кадр остаётся светлым */}
      <Card x={lx - 300} y={130} w={600} h={460} k={pop(t, 0.1)} fill="#2c3570">
        <circle cx={lx + 200} cy={200} r={36} fill={C.goldLight} />
        <Txt x={lx} y={200} size={34} color={C.white}>
          {"ночь у ворот"}
        </Txt>
      </Card>
      {[0, 1, 2].map((i) => (
        <Dots key={i} shape="sheep" x={lx - 160 + i * 160} y={410 + (i % 2) * 40} size={170} t={t} at={0.4 + i * 0.2} sp={7} />
      ))}
      <Label x={lx} y={540} text="сколько их? не пересчитать" k={pop(t, at(ctx, 0.6))} color={C.ink} size={28} />
      {/* утро — цена почти втрое выше */}
      <Card x={rx - 300} y={130} w={600} h={460} k={pop(t, k1)} fill={C.goldLight}>
        <Txt x={rx} y={200} size={34} color={C.goldDeep}>
          {"утро"}
        </Txt>
      </Card>
      {[0, 1, 2].map((i) => (
        <Coin key={i} x={rx - 90 + i * 90} y={380} r={42} op={ramp(t, k1 + 0.5 + i * 0.3, 0.3)} />
      ))}
      <Label x={rx} y={520} text="почти втрое дороже" k={pop(t, k1 + 1.2)} color={C.goldDeep} size={30} />
      {/* весы: поспешность ≠ решительность */}
      <Fade k={pop(t, k2)}>
        <Label x={cx - 270} y={760} text="поспешность" k={1} color={C.spendDeep} bg={C.spendLight} size={36} />
        <Txt x={cx} y={772} size={56} weight={900} color={C.inkSoft}>
          {"≠"}
        </Txt>
        <Label x={cx + 280} y={760} text="решительность" k={1} color={C.incomeDeep} bg={C.incomeLight} size={36} />
      </Fade>
    </g>
  );
};

export const Decide: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const steps = [
    { s: "1. Понять", shape: "magnifier", col: C.lapis, beat: 0.2 },
    { s: "2. Спросить знающего", shape: "elder", col: C.debt, beat: 0.45 },
    { s: "3. Решить вовремя", shape: "plan", col: C.income, beat: 0.75 },
  ];
  const k1 = at(ctx, 1);
  return (
    <g>
      {steps.map((st, i) => {
        const x = 330 + i * 420;
        const s = at(ctx, st.beat);
        return (
          <g key={st.s}>
            <Dots shape={st.shape} x={x} y={330} size={210} t={t} at={s} sp={8} colors={{ a: C.debt, b: C.gold }} />
            <Label x={x} y={520} text={st.s} k={pop(t, s + 0.3)} color={C.white} bg={st.col} size={32} />
            {i < 2 && <Arrow x1={x + 140} y1={330} x2={x + 280} y2={330} k={ramp(t, s + 0.6, 0.4)} color={C.inkSoft} w={9} />}
          </g>
        );
      })}
      <Item x={300} y={700} text="возможность — не обещание чуда" k={pop(t, k1 + 0.6)} mark={{ ok: false, k: 0 }} size={38} w={800} />
      <Item x={300} y={780} text="а понятное дело, к которому вы готовы" k={pop(t, k1 + 1.4)} mark={{ ok: true, k: ramp(t, k1 + 1.6, 0.4) }} size={38} w={800} />
    </g>
  );
};
