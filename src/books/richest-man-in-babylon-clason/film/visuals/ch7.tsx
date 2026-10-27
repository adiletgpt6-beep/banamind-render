// Глава 7 «Работа и свобода»: караван и юноша в кольцах, тайна Шарру Нады, Мегиддо, пекарня,
// честная арифметика пряника (½ · ¼ · ¼ — считает код), Арад Гула, удар судьбы без гарантий,
// табличка рассыпается в пыль, кольца сняты, седьмое лекарство. Итог: шесть правил, границы.
import React from "react";
import { C, HEAVY } from "../theme";
import { Bubble, Card, Fade, Hero, Item, Mark } from "./common";
import { Dots } from "./dots";
import { Arrow, at, clamp01, Coin, cxOf, Label, pop, ramp, Txt, type VisualProps } from "./kit";

type P = { host?: string };

export const Caravan: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const walk = (t * 22) % 60;
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${-walk * 0.3} ${Math.abs(Math.sin(t * 2 + i)) * -6})`}>
          <Dots shape="camel" x={300 + i * 230} y={520} size={220} t={t} at={0.1 + i * 0.2} sp={8} />
        </g>
      ))}
      <Hero t={t} at={0.5} kind="elder" x={900} y={420} size={240} a={C.lapis} b={C.gold} name="Шарру Нада" />
      <Hero t={t} at={0.7} x={1160} y={430} size={230} a={C.rose} b={C.gold} name="Хадан Гула" />
      {/* кольца и серьги */}
      {[0, 1, 2].map((i) => (
        <Dots key={i} shape="ring" x={1080 + i * 80} y={640} size={70} t={t} at={at(ctx, 1) + i * 0.15} sp={5} />
      ))}
      <Bubble x={1170} y={170} text="«Работа создана для рабов»" k={pop(t, at(ctx, 1.5))} bg={C.spendLight} size={34} />
      <rect x={120} y={660} width={760} height={18} rx={9} fill="#e5c48a" opacity={ramp(t, 0.2, 0.4)} />
      <Label x={500} y={190} text="караван идёт к городу" k={pop(t, 0.4) * (1 - ramp(t, k1, 0.4))} color={C.inkSoft} size={32} />
    </g>
  );
};

export const ChainField: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  const chain = (x1: number, x2: number, y: number, k: number) =>
    Array.from({ length: Math.floor((x2 - x1) / 34) }).map((_, i) => <ellipse key={i} cx={x1 + i * 34} cy={y} rx={18} ry={11} fill="none" stroke={C.inkSoft} strokeWidth={6} opacity={k} />);
  return (
    <g>
      <Dots shape="field" x={cx} y={250} size={460} t={t} at={0.1} sp={11} dim={0.15} />
      <Label x={cx} y={120} text="то же поле, сорок лет назад" k={pop(t, 0.5)} color={C.inkSoft} size={32} />
      {[0, 1, 2, 3].map((i) => (
        <Hero key={i} t={t} at={at(ctx, 0.5) + i * 0.15} x={cx - 330 + i * 220} y={520} size={180} a={i === 1 ? C.lapis : C.grey} b={C.inkSoft} />
      ))}
      {chain(cx - 330, cx + 330, 470, ramp(t, at(ctx, 0.7), 0.5))}
      <Fade k={pop(t, k1 + 0.2)}>
        <Label x={cx - 300} y={760} text="брат совершил преступление" k={1} color={C.white} bg={C.debt} size={28} />
        <Arrow x1={cx - 70} y1={750} x2={cx + 20} y2={750} k={1} color={C.inkSoft} w={7} />
        <Label x={cx + 240} y={760} text="отец отдал сына в залог" k={1} color={C.white} bg={C.debt} size={28} />
      </Fade>
      <Label x={cx} y={860} text="не вина, а беда — и сохранённое достоинство" k={pop(t, k2 + 0.4)} color={C.keepDeep} bg={C.keepLight} size={32} />
    </g>
  );
};

export const Megiddo: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  const three = [
    { name: "Мегиддо", col: C.income, s: "работа — друг", ok: true },
    { name: "второй", col: C.grey, s: "отлынивать", ok: false },
    { name: "третий", col: C.red, s: "ярость", ok: false },
  ];
  return (
    <g>
      {three.map((h, i) => {
        const x = 330 + i * 330;
        const s = i === 0 ? 0.2 : at(ctx, 1) + (i - 1) * 0.4;
        return (
          <g key={h.name}>
            <Hero t={t} at={s} x={x} y={380} size={220} a={h.col} b={C.gold} name={h.name} />
            <Label x={x} y={620} text={h.s} k={pop(t, s + 0.4)} color={C.white} bg={h.col} size={30} />
            <Mark x={x} y={700} ok={h.ok} k={ramp(t, i === 0 ? k1 + 1.4 : at(ctx, 1.6) + i * 0.2, 0.4)} s={44} />
          </g>
        );
      })}
      {/* дом, который строишь */}
      <Dots shape="house" x={1250} y={500} size={260} t={t} at={k2} sp={9} />
      <Label x={1290} y={800} text="думай о доме, а не о брёвнах" k={pop(t, k2 + 0.6)} color={C.incomeDeep} bg={C.incomeLight} size={28} />
    </g>
  );
};

export const Bakery: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const k1 = at(ctx, 1);
  const steps = ["молоть зерно", "печь хлеб", "медовые пряники", "вся выпечка"];
  return (
    <g>
      <Hero t={t} at={0.1} x={cx - 300} y={400} size={230} a={C.spend} b={C.gold} name="юноша" />
      <Hero t={t} at={0.3} kind="elder" x={cx + 300} y={400} size={230} a={C.orange} b={C.white} name="пекарь" flip />
      <Bubble x={cx - 230} y={170} text="научи меня!" k={pop(t, at(ctx, 0.3))} />
      {steps.map((s, i) => {
        const x = cx - 470 + i * 330;
        const k = pop(t, k1 + i * 0.5);
        return (
          <g key={s}>
            <Label x={x} y={720} text={s} k={k} color={C.white} bg={[C.clay, C.clayDeep, C.orange, C.income][i]} size={28} />
            {i < 3 && <Arrow x1={x + 135} y1={710} x2={x + 190} y2={710} k={ramp(t, k1 + i * 0.5 + 0.3, 0.3)} color={C.inkSoft} w={7} />}
          </g>
        );
      })}
      <Dots shape="cake" x={cx} y={430} size={180} t={t} at={k1 + 1} sp={7} />
    </g>
  );
};

export const HoneyCake: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  // монета делится: ½ — мука, мёд и дрова; остаток пополам: ¼ хозяину, ¼ ему
  const parts = [
    { v: 1 / 2, col: C.clay, s: "мука, мёд, дрова — ½", at: at(ctx, 1.35) },
    { v: 1 / 4, col: C.orange, s: "хозяину — ¼", at: at(ctx, 1.6) },
    { v: 1 / 4, col: C.keep, s: "ему — ¼", at: at(ctx, 1.85) },
  ];
  const px = 560;
  const py = 470;
  const R = 230;
  let a0 = -Math.PI / 2;
  const wedges = parts.map((pt, i) => {
    const k = ramp(t, pt.at, 0.5);
    const a1 = a0 + pt.v * Math.PI * 2 * k;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const d = `M ${px} ${py} L ${px + R * Math.cos(a0)} ${py + R * Math.sin(a0)} A ${R} ${R} 0 ${large} 1 ${px + R * Math.cos(a1)} ${py + R * Math.sin(a1)} Z`;
    const mid = a0 + (pt.v * Math.PI * 2) / 2;
    a0 += pt.v * Math.PI * 2;
    return (
      <g key={i}>
        {k > 0 && <path d={d} fill={pt.col} stroke={C.white} strokeWidth={6} />}
        <Label x={px + Math.cos(mid) * (R + 230)} y={py + Math.sin(mid) * (R + 60) + 10} text={pt.s} k={pop(t, pt.at + 0.3)} color={C.white} bg={pt.col} size={30} />
      </g>
    );
  });
  return (
    <g>
      <g opacity={1 - ramp(t, k1 + 0.3, 0.4)}>
        <Dots shape="cake" x={430} y={420} size={190} t={t} at={0.1} sp={8} />
        <Dots shape="cake" x={640} y={420} size={190} t={t} at={0.3} sp={8} />
        <Label x={535} y={640} text="улицы после полудня" k={pop(t, 0.6)} color={C.inkSoft} size={30} />
      </g>
      <g opacity={ramp(t, k1, 0.4)}>
        <circle cx={px} cy={py} r={R} fill={C.goldLight} stroke={C.goldDeep} strokeWidth={8} />
        <Txt x={px} y={py - R - 30} size={34} weight={900} color={C.goldDeep}>
          {"1 медная монета = 2 пряника"}
        </Txt>
      </g>
      {wedges}
      <Label x={1080} y={800} text="первые свои деньги" k={pop(t, k2 + 0.3)} color={C.white} bg={C.ink} size={34} />
    </g>
  );
};

export const AradGula: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  return (
    <g>
      <Hero t={t} at={0.1} kind="traveler" x={cx - 320} y={430} size={240} a={C.debt} b={C.gold} c={C.spend} name="Арад Гула" />
      <Hero t={t} at={0.3} x={cx + 300} y={430} size={230} a={C.spend} b={C.gold} name="юноша" flip />
      <Bubble x={cx - 300} y={170} text="мне нравится твоя предприимчивость" k={pop(t, at(ctx, 0.4)) * (1 - ramp(t, k1, 0.3))} size={30} />
      <Bubble x={cx - 300} y={170} text="а вдруг без хозяина не выйдет?" k={pop(t, k1 + 0.2) * (1 - ramp(t, at(ctx, 1.5), 0.3))} size={30} bg={C.greyLight} />
      <Bubble x={cx + 300} y={170} text={"поступай как свободный:\nреши — и иди"} k={pop(t, at(ctx, 1.5))} size={30} bg={C.keepLight} tail="right" />
      <Dots shape="key" x={cx} y={660} size={200} t={t} at={k2} sp={8} />
      <Label x={cx} y={800} text="выкупил свободу — торговля растёт" k={pop(t, k2 + 0.4)} color={C.incomeDeep} bg={C.incomeLight} size={32} />
    </g>
  );
};

export const Canal: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  return (
    <g>
      <Dots shape="canal" x={640} y={430} size={520} t={t} at={0.1} sp={12} />
      <Label x={640} y={180} text="хозяин проигрался и задолжал" k={pop(t, at(ctx, 0.4))} color={C.white} bg={C.red} size={32} />
      <Bubble x={1040} y={330} text="почему мой труд не принёс успеха?" k={pop(t, k1)} size={30} bg={C.greyLight} />
      <Card x={300} y={680} w={780} h={150} k={pop(t, k2)} fill={C.white} stroke={C.ink}>
        <Txt x={690} y={745} size={36} weight={900}>
          {"труд не даёт гарантий"}
        </Txt>
        <Txt x={690} y={800} size={30} color={C.keepDeep}>
          {"но надёжность остаётся выбором"}
        </Txt>
      </Card>
    </g>
  );
};

export const Freedom: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const smash = at(ctx, 0.75);
  const k1 = at(ctx, 1);
  return (
    <g>
      <Dots shape="tablet" x={cx} y={420} size={360} t={t} at={0.1} sp={11} out={smash} outMode="explode" />
      <Label x={cx} y={150} text="табличка о праве собственности" k={pop(t, 0.5) * (1 - ramp(t, smash + 0.6, 0.4))} color={C.clayDeep} bg={C.clayLight} size={32} />
      {/* пыль */}
      {t > smash &&
        Array.from({ length: 30 }).map((_, i) => {
          const k = clamp01((t - smash - 0.5) / 1.5);
          return <circle key={i} cx={cx - 200 + i * 14} cy={760 + Math.sin(i) * 10} r={4} fill={C.clay} opacity={0.6 * (1 - k)} />;
        })}
      <Hero t={t} at={k1} kind="traveler" x={cx - 140} y={520} size={220} a={C.debt} b={C.gold} c={C.spend} />
      <Hero t={t} at={k1 + 0.2} x={cx + 140} y={520} size={210} a={C.spend} b={C.gold} />
      <Label x={cx} y={780} text="партнёры" k={pop(t, k1 + 0.6)} color={C.white} bg={C.income} size={40} />
    </g>
  );
};

export const Rings: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const off = at(ctx, 1.4);
  const k2 = at(ctx, 2);
  return (
    <g>
      <Hero t={t} at={0.1} x={560} y={420} size={250} a={C.rose} b={C.gold} name="Хадан Гула" />
      {[0, 1, 2].map((i) => (
        <Dots key={i} shape="ring" x={460 + i * 100} y={640} size={80} t={t} at={0.4 + i * 0.1} sp={5} out={off + i * 0.15} outMode="fall" />
      ))}
      <Item x={900} y={260} text="дело" k={pop(t, at(ctx, 0.5))} mark={{ ok: true, k: ramp(t, at(ctx, 0.6), 0.4) }} size={40} w={360} />
      <Item x={900} y={340} text="репутация" k={pop(t, at(ctx, 0.65))} mark={{ ok: true, k: ramp(t, at(ctx, 0.75), 0.4) }} size={40} w={360} />
      <Item x={900} y={420} text="надёжность" k={pop(t, at(ctx, 0.8))} mark={{ ok: true, k: ramp(t, at(ctx, 0.9), 0.4) }} size={40} w={360} />
      <Label x={560} y={800} text="начать скромно" k={pop(t, off + 0.6)} color={C.incomeDeep} bg={C.incomeLight} size={34} />
      <Fade k={pop(t, k2 + 0.5)}>
        <Label x={1080} y={600} text={"мастерство отнять труднее,\nчем кошелёк"} k={1} color={C.white} bg={C.ink} size={34} />
      </Fade>
    </g>
  );
};

export const Skill: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  const grow = ramp(t, k1 + 0.6, 2.2);
  const bars = [
    { s: "другие писцы", v: 6, col: C.grey },
    { s: "Аркад", v: 4 + 6 * grow, col: C.keep },
  ];
  const stairs = ["5", "10", "20"];
  return (
    <g>
      <g opacity={1 - 0.6 * ramp(t, k2, 0.4)}>
        {bars.map((b, i) => (
          <g key={b.s}>
            <Txt x={cx - 420} y={250 + i * 140} size={32} anchor="start" weight={900} color={C.inkSoft}>
              {b.s}
            </Txt>
            {Array.from({ length: Math.round(b.v) }).map((_, j) => (
              <rect key={j} x={cx - 420 + j * 74} y={270 + i * 140} width={62} height={54} rx={10} fill={b.col} opacity={ramp(t, k1 + j * 0.1, 0.2)} />
            ))}
          </g>
        ))}
        <Txt x={cx} y={150} size={34} weight={900} color={C.keepDeep} opacity={ramp(t, k1 + 1, 0.4)}>
          {"интерес · сосредоточенность · настойчивость"}
        </Txt>
      </g>
      {/* определённые желания: 5 → 10 → 20 золотых */}
      {stairs.map((s, i) => {
        const k = pop(t, k2 + 0.4 + i * 0.4);
        return (
          <g key={s} opacity={clamp01(k * 1.5)}>
            <rect x={cx - 360 + i * 250} y={760 - i * 90} width={230} height={90 + i * 90} rx={16} fill={C.goldLight} stroke={C.goldDeep} strokeWidth={5} />
            <Coin x={cx - 245 + i * 250} y={720 - i * 90} r={30} />
            <text x={cx - 245 + i * 250} y={820 - i * 45} fontFamily={HEAVY} fontWeight={800} fontSize={40} fill={C.goldDeep} textAnchor="middle">
              {s}
            </text>
          </g>
        );
      })}
      <Label x={cx + 230} y={420} text="«хочу пять золотых»" k={pop(t, k2 + 0.2)} color={C.ink} bg={C.goldLight} size={34} />
    </g>
  );
};

// ── итог ──
export const SixRules: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const rules = [
    { s: "Оставить часть себе", shape: "coin", beat: 0.3 },
    { s: "Отличать нужду от желания", shape: "plan", beat: 0.55 },
    { s: "Советоваться со знающими", shape: "elder", beat: 0.8 },
    { s: "Беречь и помогать с умом", shape: "chest", beat: 1.1 },
    { s: "Не откладывать понятное", shape: "door", beat: 1.4 },
    { s: "Растить мастерство", shape: "key", beat: 1.7 },
  ];
  return (
    <g>
      {rules.map((r, i) => {
        const x = cx - 400 + (i % 3) * 400;
        const y = 270 + Math.floor(i / 3) * 330;
        const s = at(ctx, r.beat);
        const k = pop(t, s);
        return (
          <g key={r.s}>
            <g opacity={clamp01(k * 1.5)} transform={`translate(${x} ${y}) scale(${0.9 + 0.1 * k})`}>
              <rect x={-180} y={-130} width={360} height={280} rx={36} fill={C.white} />
              <text x={-150} y={-90} fontFamily={HEAVY} fontWeight={800} fontSize={34} fill={C.goldDeep}>
                {i + 1}
              </text>
            </g>
            <Dots shape={r.shape} x={x} y={y - 30} size={150} t={t} at={s + 0.1} sp={6} colors={{ a: C.debt, b: C.gold }} />
            <Txt x={x} y={y + 110} size={28} w={330} opacity={ramp(t, s + 0.2, 0.3)}>
              {r.s}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

export const Limits: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k1 = at(ctx, 1);
  const cards = [
    { s: "литературные притчи,\nа не исследование", col: C.clay, at: at(ctx, 0.3) },
    { s: "не личная финансовая\nконсультация", col: C.lapis, at: at(ctx, 0.6) },
    { s: "монеты не появляются\nиз воздуха", col: C.spend, at: k1 + 0.2 },
  ];
  return (
    <g>
      {cards.map((c, i) => {
        const x = 300 + i * 470;
        const k = pop(t, c.at);
        return (
          <g key={i} opacity={clamp01(k * 1.5)} transform={`translate(${x} 400) scale(${0.9 + 0.1 * k})`}>
            <rect x={-220} y={-160} width={440} height={320} rx={40} fill={c.col} />
            <Txt x={0} y={-10} size={38} color={C.white} w={400}>
              {c.s}
            </Txt>
          </g>
        );
      })}
      {/* монета не возникает из ничего */}
      {t > k1 + 0.6 && <Coin x={1240} y={640} r={40} op={ramp(t, k1 + 0.6, 0.3)} />}
      {t > k1 + 0.9 && <Mark x={1240} y={640} ok={false} k={ramp(t, k1 + 0.9, 0.4)} s={70} />}
      <Label x={760} y={800} text="план показывает, куда уходит каждая монета" k={pop(t, at(ctx, 1.6))} color={C.white} bg={C.ink} size={34} />
    </g>
  );
};


