// Глава 2 «Десятая монета»: писец Аркад, «платишь всем, кроме себя», корзина, девять из
// десяти, ошибка с Азмуром, к кому за советом, камешек каждый день, дерево из семечка.
import React from "react";
import { C, ZONES } from "../theme";
import { Bubble, Fade, Hero, Item, Mark } from "./common";
import { Dots } from "./dots";
import { Arrow, at, clamp01, Coin, cxOf, ease, Label, pop, ramp, Txt, type VisualProps } from "./kit";

type P = { host?: string };

export const Scribe: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k0 = at(ctx, 0.5);
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  const leaks = ["еда", "одежда", "мелочи"];
  return (
    <g>
      <Dots shape="tablet" x={430} y={440} size={340} t={t} at={0.1} sp={10} />
      <Hero t={t} at={0.3} x={760} y={440} size={250} a={C.sky} b={C.gold} name="писец Аркад" />
      {leaks.map((s, i) => {
        const s0 = k0 + i * 0.35;
        const kk = clamp01((t - s0) / 0.8);
        return (
          <g key={s}>
            {t > s0 && kk < 1 && <Coin x={820 + 260 * ease(kk)} y={560 - 320 * ease(kk) + i * 90 * ease(kk)} r={18} />}
            <Label x={1130} y={260 + i * 100} text={s} k={pop(t, s0 + 0.6) * (1 - ramp(t, k1 - 0.2, 0.4))} color={C.spendDeep} bg={C.spendLight} size={32} />
          </g>
        );
      })}
      <Hero t={t} at={k1} kind="elder" x={1130} y={430} size={250} a={C.debt} b={C.gold} name="Альгамиш" />
      <Bubble x={940} y={170} text={"ночь работы ⇄ совет"} k={pop(t, at(ctx, 1.5))} bg={C.goldLight} />
      {/* рассвет */}
      <g opacity={ramp(t, k2, 0.8)}>
        <Dots shape="sun" x={430} y={160} size={150} t={t} at={k2} sp={7} />
      </g>
      <Label x={430} y={760} text="к рассвету — готово" k={pop(t, k2 + 0.4)} color={C.incomeDeep} bg={C.incomeLight} size={34} />
    </g>
  );
};

export const PayAll: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const k1 = at(ctx, 1);
  const who = [
    { text: "портной", col: C.spend },
    { text: "обувщик", col: C.orange },
    { text: "еда", col: C.rose },
    { text: "себе", col: C.keep },
  ];
  return (
    <g>
      <Label x={cx} y={190} text={"«Часть всего, что ты заработал,\nпринадлежит тебе»"} k={pop(t, 0.3)} color={C.ink} bg={C.goldLight} size={48} />
      <Dots shape="wallet" x={cx} y={490} size={240} t={t} at={0.2} sp={9} />
      {who.map((w, i) => {
        const x = cx - 480 + i * 320;
        const y = 760;
        const self = w.text === "себе";
        const s0 = k1 + 0.4 + i * 0.4;
        const kk = clamp01((t - s0) / 0.7);
        return (
          <g key={w.text}>
            <Label x={x} y={y} text={w.text} k={pop(t, k1 + i * 0.25)} color={C.white} bg={w.col} size={36} />
            {!self && t > s0 && <Coin x={cx + (x - cx) * ease(kk)} y={460 + (y - 110 - 460) * ease(kk) - Math.sin(kk * Math.PI) * 80} r={22} />}
            {self && <Txt x={x} y={y - 80} size={64} weight={900} color={C.keepDeep} opacity={ramp(t, s0, 0.4)}>{"0"}</Txt>}
            {self && <Mark x={x + 90} y={y - 100} ok={false} k={ramp(t, s0 + 0.3, 0.5)} s={34} />}
          </g>
        );
      })}
    </g>
  );
};

export const Basket: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host) - 150;
  const s0 = at(ctx, 0.6);
  const cyc = 1.8;
  const n = t > s0 ? Math.floor((t - s0) / cyc) : -1;
  const ph = t > s0 ? ((t - s0) % cyc) / cyc : 0;
  const kept = Math.max(0, Math.min(12, n + (ph > 0.75 ? 1 : 0)));
  return (
    <g>
      <Dots shape="basket" x={cx} y={470} size={420} t={t} at={0.1} sp={12} />
      {/* утро: +10, вечер: −9 */}
      {t > s0 && (
        <g>
          <Label x={cx - 300} y={190} text="утром +10" k={ph < 0.5 ? pop(t, s0 + Math.max(0, n) * cyc) : 1 - ramp(ph, 0.5, 0.15)} color={C.incomeDeep} bg={C.incomeLight} size={38} />
          <Label x={cx + 300} y={190} text="вечером −9" k={ph >= 0.45 ? 1 : 0} color={C.spendDeep} bg={C.spendLight} size={38} />
        </g>
      )}
      {/* остаток: по яйцу за круг */}
      <g>
        {Array.from({ length: kept }).map((_, i) => (
          <ellipse key={i} cx={cx + 330 + (i % 4) * 50} cy={720 - Math.floor(i / 4) * 64} rx={20} ry={26} fill={C.white} stroke="#e2d6c2" strokeWidth={4} />
        ))}
        <Label x={cx + 405} y={500} text="остаётся" k={kept > 0 ? 1 : 0} color={C.keepDeep} bg={C.keepLight} size={32} />
      </g>
      <Label x={cx} y={820} text="+1 каждый раз" k={pop(t, at(ctx, 1.4))} color={C.white} bg={C.ink} size={38} />
    </g>
  );
};

export const NineTen: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k0 = at(ctx, 0.4);
  const k1 = at(ctx, 1);
  // ряд из десяти монет: одна уходит в запас
  const row = Array.from({ length: 10 }).map((_, i) => {
    const moving = i === 9;
    const kk = moving ? clamp01((t - k0) / 0.7) : 0;
    const x = 260 + i * 66 + (moving ? (850 - 854) * ease(kk) : 0);
    const y = 320 + (moving ? 420 * ease(kk) - Math.sin(kk * Math.PI) * 120 : 0);
    if (moving && kk >= 1) return null;
    return <Coin key={i} x={x} y={y} r={26} op={ramp(t, 0.1 + i * 0.05, 0.3)} />;
  });
  // запас растёт: по монете за каждый «заработок»
  const stack = t > k1 ? Math.min(12, 1 + Math.floor((t - k1) / 0.35)) : t > k0 + 0.7 ? 1 : 0;
  return (
    <g>
      <Label x={560} y={200} text="на жизнь: 9 из 10" k={pop(t, 0.3)} color={C.spendDeep} bg={C.spendLight} size={40} />
      {row}
      <Label x={560} y={470} text="почти незаметно" k={pop(t, at(ctx, 1.4))} color={C.inkSoft} size={34} />
      <rect x={760} y={430} width={300} height={360} rx={30} fill={ZONES.keep.light} stroke={ZONES.keep.color} strokeWidth={7} opacity={ramp(t, k0 - 0.2, 0.4)} />
      <Txt x={910} y={410} size={40} weight={900} color={C.keepDeep} opacity={ramp(t, k0 - 0.2, 0.4)}>
        {"Запас"}
      </Txt>
      {Array.from({ length: stack }).map((_, i) => (
        <Coin key={i} x={850 + (i % 3) * 60} y={740 - Math.floor(i / 3) * 56} r={24} />
      ))}
      <Label x={910} y={860} text="очень заметно" k={pop(t, at(ctx, 1.6))} color={C.keepDeep} bg={C.keepLight} size={34} />
    </g>
  );
};

export const Azmur: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k0 = at(ctx, 0.6);
  const k1 = at(ctx, 1);
  const sail = clamp01((t - k0) / 2.2);
  return (
    <g>
      <Hero t={t} at={0.1} x={700} y={460} size={230} a={C.sky} b={C.gold} name="Аркад" />
      <Hero t={t} at={0.3} x={960} y={460} size={230} a={C.clayDeep} b={C.clay} name="кирпичник Азмур" />
      <Dots shape="bag" x={830} y={640} size={120} t={t} at={0.5} sp={7} out={k0} outMode="fade" />
      <g transform={`translate(${1260 + 280 * ease(sail)} ${300 - 30 * Math.sin(sail * 3)})`} opacity={1 - ramp(t, k1 - 0.3, 0.3)}>
        <Dots shape="ship" x={0} y={0} size={240} t={t} at={k0} sp={9} />
      </g>
      <Bubble x={1360} y={170} text="драгоценные камни?" k={pop(t, k0 + 0.6) * (1 - ramp(t, k1 - 0.2, 0.3))} />
      <Dots shape="gem" x={1400} y={420} size={240} t={t} at={k1 - 0.1} sp={9} morph={{ shape: "shards", at: at(ctx, 1.35) }} />
      <Label x={1400} y={640} text={t < at(ctx, 1.4) ? "камни?" : "стекло"} k={pop(t, k1 + 0.2)} color={C.spendDeep} bg={C.spendLight} size={40} />
      <Label x={830} y={190} text="запас пропал целиком" k={pop(t, at(ctx, 1.7))} color={C.white} bg={C.red} size={40} />
    </g>
  );
};

export const Advice: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const rows = [
    { shape: "gem", who: "ювелир" },
    { shape: "sheep", who: "скотовод" },
    { shape: "star", who: "звездочёт" },
  ];
  const k1 = at(ctx, 1);
  return (
    <g>
      {rows.map((r, i) => {
        const y = 230 + i * 190;
        const s = at(ctx, 0.1 + i * 0.22);
        return (
          <g key={r.who}>
            <Dots shape={r.shape} x={330} y={y} size={160} t={t} at={s} sp={7} />
            <Arrow x1={440} y1={y} x2={700} y2={y} k={ramp(t, s + 0.4, 0.5)} color={C.inkSoft} w={8} />
            <Label x={850} y={y + 14} text={r.who} k={pop(t, s + 0.8)} color={C.incomeDeep} bg={C.incomeLight} size={40} />
          </g>
        );
      })}
      <Fade k={pop(t, at(ctx, 0.75))}>
        <Label x={1150} y={250} text={"кирпичник → камни"} k={1} color={C.spendDeep} bg={C.spendLight} size={34} />
      </Fade>
      <Mark x={1150} y={320} ok={false} k={ramp(t, at(ctx, 0.85), 0.5)} s={40} />
      {/* снова копит — и легче */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Coin key={i} x={1090 + (i % 3) * 64} y={720 - Math.floor(i / 3) * 56} r={26} op={ramp(t, k1 + 0.4 + i * 0.3, 0.3)} />
      ))}
      <Label x={1155} y={820} text="снова — и уже легче" k={pop(t, k1 + 1.2)} color={C.keepDeep} bg={C.keepLight} size={34} />
    </g>
  );
};

export const Pebbles: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const k1 = at(ctx, 1);
  const k2 = at(ctx, 2);
  // сетка из ста клеток заполняется; седьмая — пропуск, который потом закрывается
  const filled = t > k1 ? Math.min(100, Math.floor((t - k1) * 14)) : 0;
  const gapFix = at(ctx, 1.6);
  const cells = Array.from({ length: 100 }).map((_, i) => {
    const on = i < filled && (i !== 6 || t > gapFix);
    const gx = cx - 225 + (i % 10) * 50;
    const gy = 140 + Math.floor(i / 10) * 38;
    return <circle key={i} cx={gx} cy={gy} r={13} fill={on ? (i === 6 ? C.keep : C.grey) : C.white} stroke={i === 6 && t > k1 + 0.6 && t < gapFix ? C.red : "#d6d0e2"} strokeWidth={i === 6 && t > k1 + 0.6 && t < gapFix ? 5 : 3} />;
  });
  // камешек падает в реку
  const drop = t > at(ctx, 0.6) ? ((t - at(ctx, 0.6)) % 1.4) / 1.4 : -1;
  return (
    <g>
      <g opacity={ramp(t, 0.2, 0.5)}>{cells}</g>
      <Dots shape="river" x={cx} y={640} size={540} t={t} at={0.1} sp={12} />
      {drop >= 0 && <circle cx={cx - 40} cy={600 + 120 * ease(drop)} r={14} fill={C.inkSoft} opacity={1 - clamp01((drop - 0.85) * 7)} />}
      <Label x={cx + 470} y={250} text={"забыл —\nвернись и брось"} k={pop(t, gapFix - 0.2)} color={C.keepDeep} bg={C.keepLight} size={30} />
      <Label x={cx} y={880} text="маленькое, но выполнимое" k={pop(t, k2 + 0.3)} color={C.white} bg={C.ink} size={38} />
    </g>
  );
};

export const Tree: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const k0 = at(ctx, 0.6);
  const k1 = at(ctx, 1);
  return (
    <g>
      <Dots shape="sprout" x={820} y={470} size={460} t={t} at={0.1} sp={11} morph={{ shape: "tree", at: k0 }} />
      <Label x={820} y={180} text="первая монета — семя" k={pop(t, 0.6)} color={C.incomeDeep} bg={C.incomeLight} size={38} />
      <Fade k={pop(t, k1)}>
        <Label x={340} y={760} text="вырван с корнем" k={1} color={C.spendDeep} bg={C.spendLight} size={32} />
      </Fade>
      <Dots shape="tree" x={340} y={520} size={260} t={t} at={k1} sp={8} out={at(ctx, 1.5)} outMode="fall" dim={0.2} />
      <Item x={1080} y={330} text="растёт не за ночь" k={pop(t, at(ctx, 1.1))} mark={{ ok: true, k: ramp(t, at(ctx, 1.2), 0.4) }} size={34} w={360} />
    </g>
  );
};
