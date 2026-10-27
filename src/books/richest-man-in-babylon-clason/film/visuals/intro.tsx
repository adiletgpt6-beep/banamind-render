// Вступление, карточки глав и финал BM-036: кошелёк из точек, монеты-векторы, литературный
// Вавилон, шесть вопросов фильма, возвращение к первому кадру.
import React from "react";
import { BRAND } from "../../../../banamind/brand";
import { C, DISPLAY, FONT, HEAVY, ZONES } from "../theme";
import { Dots } from "./dots";
import { at, clamp01, Coin, cxOf, ease, Label, pop, ramp, Txt, type VisualProps } from "./kit";

// монета летит из (x1,y1) в (x2,y2) по дуге, начиная в момент t0
const flight = (t: number, t0: number, x1: number, y1: number, x2: number, y2: number, d = 0.7, lift = 90) => {
  const k = clamp01((t - t0) / d);
  const e = ease(k);
  return { x: x1 + (x2 - x1) * e, y: y1 + (y2 - y1) * e - Math.sin(k * Math.PI) * lift, k };
};

// ── холодный старт: заработали — и всё раздали ──
export const ColdOpen: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t } = ctx;
  const cx = 780;
  const wy = 470;
  const tPay = at(ctx, 0) + 0.3;
  const tFull = tPay + 1.2;
  const tLeave = at(ctx, 1.25);
  const dests = [
    { x: 330, y: 230, text: "Аренда", col: ZONES.spend.color, n: 3 },
    { x: 330, y: 700, text: "Еда", col: C.orange, n: 3 },
    { x: 1240, y: 230, text: "Долг другу", col: ZONES.debt.color, n: 2 },
    { x: 1240, y: 700, text: "Лавка", col: C.rose, n: 2 },
  ];
  const coins: React.ReactNode[] = [];
  // десять монет падают в кошелёк
  for (let i = 0; i < 10; i++) {
    const t0 = tPay + i * 0.11;
    if (t < t0 || t > t0 + 0.8) continue;
    const f = flight(t, t0, cx - 160 + i * 34, 90, cx + (i - 4.5) * 8, wy - 120, 0.6, -40);
    coins.push(<Coin key={`in${i}`} x={f.x} y={f.y} r={24} op={1 - clamp01((f.k - 0.85) * 7)} />);
  }
  // и разлетаются к тем, кому должны
  let idx = 0;
  dests.forEach((d, di) =>
    Array.from({ length: d.n }).forEach((_, j) => {
      const t0 = tLeave + idx * 0.16;
      idx++;
      if (t < t0) return;
      const f = flight(t, t0, cx + (di - 1.5) * 20, wy - 110, d.x + (j - (d.n - 1) / 2) * 34, d.y + 50, 0.75, 120);
      coins.push(<Coin key={`out${di}-${j}`} x={f.x} y={f.y} r={20} op={f.k < 1 ? 1 : 1} />);
    }),
  );
  const q = pop(t, at(ctx, 2));
  return (
    <g>
      {t < tLeave + 0.3 ? (
        <Dots shape="wallet" x={cx} y={wy} size={520} t={t} at={0.05} sp={13} morph={{ shape: "walletFull", at: tFull - 0.5 }} />
      ) : (
        <Dots shape="walletFull" x={cx} y={wy} size={520} t={t} at={-10} sp={13} morph={{ shape: "wallet", at: tLeave + 0.9 }} />
      )}
      {dests.map((d, i) => (
        <Label key={d.text} x={d.x} y={d.y} text={d.text} k={pop(t, tLeave - 0.3 + i * 0.12)} color={C.white} bg={d.col} size={40} />
      ))}
      {coins}
      <Label x={cx} y={150} text={"Заплатили…"} k={pop(t, tPay + 0.2) * (1 - ramp(t, tLeave, 0.4))} bg={C.incomeLight} color={C.incomeDeep} size={44} />
      {q > 0 && (
        <g transform={`translate(${cx + 250} ${wy - 160}) scale(${q})`}>
          <circle r={70} fill={C.gold} />
          <text y={30} fontFamily={DISPLAY} fontSize={96} fill={C.ink} textAnchor="middle">
            ?
          </text>
        </g>
      )}
    </g>
  );
};

// ── литературный Вавилон и шесть вопросов фильма ──
export const Babylon: React.FC<VisualProps<{ host?: string; tags: string[] }>> = (ctx) => {
  const { t, p } = ctx;
  const cols = [C.keep, C.spend, C.lapis, C.income, C.debt, C.orange];
  return (
    <g>
      <Dots shape="city" x={560} y={420} size={560} t={t} at={0.1} sp={12} spread={0.9} />
      <Label x={560} y={780} text="литературный Вавилон" k={pop(t, at(ctx, 0.5))} color={C.clayDeep} size={34} />
      {p.tags.map((s, i) => {
        const k = pop(t, at(ctx, 1 + 0.12 + i * 0.14));
        return (
          <g key={s} opacity={clamp01(k * 1.5)} transform={`translate(${1080 + (1 - k) * 40} ${170 + i * 96})`}>
            <rect x={-250} y={-40} width={500} height={70} rx={35} fill={C.white} />
            <circle cx={-212} cy={-5} r={22} fill={cols[i]} />
            <text x={-212} y={4} fontFamily={HEAVY} fontWeight={800} fontSize={26} fill={C.white} textAnchor="middle">
              {i + 1}
            </text>
            <Txt x={-176} y={6} size={32} anchor="start" w={410}>
              {s}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ── ведущий представляется ──
export const Hello: React.FC<VisualProps> = (ctx) => {
  const { t } = ctx;
  const k = pop(t, 0.2);
  return (
    <g>
      <g transform={`translate(960 150) scale(${0.8 + 0.2 * k})`} opacity={clamp01(k * 1.5)}>
        <text fontFamily={DISPLAY} fontSize={110} fill={C.ink} textAnchor="middle">
          {BRAND.name}
        </text>
      </g>
      <Txt x={960} y={232} size={42} color={C.inkSoft}>
        {"Большие идеи. Простыми словами."}
      </Txt>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + t * 0.4;
        return <Coin key={i} x={960 + Math.cos(a) * 520} y={600 + Math.sin(a) * 120} r={26} op={ramp(t, 0.4 + i * 0.1, 0.4)} spin={0.4 + 0.6 * Math.abs(Math.cos(t * 1.5 + i))} />;
      })}
    </g>
  );
};

// ── карточка главы: значок из точек и название ──
export const ChapterCard: React.FC<VisualProps<{ n: number; title: string; shape: string }>> = (ctx) => {
  const { t, p } = ctx;
  const k = pop(t, 0.1);
  const words = ["первая", "вторая", "третья", "четвёртая", "пятая", "шестая", "седьмая", "восьмая"];
  return (
    <g>
      <g opacity={clamp01(k * 1.4)} transform={`translate(0 ${(1 - k) * 30})`}>
        <rect x={330} y={250} width={1300} height={420} rx={60} fill={C.white} opacity={0.92} />
        <rect x={330} y={250} width={22} height={420} rx={11} fill={C.gold} />
      </g>
      <Dots shape={p.shape} x={560} y={460} size={340} t={t} at={0.2} sp={11} />
      <Txt x={760} y={390} size={40} color={C.inkSoft} anchor="start" weight={800}>
        {p.n === 8 ? "Последняя глава" : `Глава ${words[p.n - 1]}`}
      </Txt>
      <g opacity={ramp(t, 0.35, 0.5)}>
        <Txt x={760} y={500} size={76} anchor="start" w={820} weight={900}>
          {p.title}
        </Txt>
      </g>
    </g>
  );
};

// ── прощание ──
export const EndCard: React.FC<VisualProps> = (ctx) => {
  const { t } = ctx;
  const k = pop(t, 0.2);
  return (
    <g>
      <g transform={`translate(960 170) scale(${0.85 + 0.15 * k})`} opacity={clamp01(k * 1.4)}>
        <text fontFamily={DISPLAY} fontSize={120} fill={C.ink} textAnchor="middle">
          {BRAND.name}
        </text>
      </g>
      <Txt x={960} y={256} size={46} color={C.inkSoft}>
        {"Большие идеи. Простыми словами."}
      </Txt>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 + t * 0.25;
        return <Coin key={i} x={960 + Math.cos(a) * 560} y={620 + Math.sin(a) * 150} r={24} op={ramp(t, 0.5 + i * 0.08, 0.4)} spin={0.4 + 0.6 * Math.abs(Math.cos(t + i))} />;
      })}
    </g>
  );
};

// ── возвращение к первому кадру: та же сумма, другой порядок ──
export const Finale: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, p } = ctx;
  const cx = cxOf(p.host);
  const lx = cx - 380;
  const rx = cx + 300;
  const wy = 430;
  const t0 = at(ctx, 0) + 0.3;
  const t1 = at(ctx, 1);
  const coins: React.ReactNode[] = [];
  // «тогда»: монеты разлетаются куда попало
  for (let i = 0; i < 10; i++) {
    const s = t0 + 0.6 + i * 0.1;
    if (t < s) continue;
    const a = -Math.PI / 2 + (i - 4.5) * 0.32;
    const f = flight(t, s, lx, wy - 70, lx + Math.cos(a) * 300, wy - 70 + Math.sin(a) * 260 + 120, 0.8, 60);
    coins.push(<Coin key={`a${i}`} x={f.x} y={f.y} r={16} op={1 - clamp01((t - s - 0.8) / 0.6)} />);
  }
  // «теперь»: у каждой монеты задача
  const trays = [
    { z: "keep", label: "Запас", col: C.keep, n: 1 },
    { z: "need", label: "Нужное", col: C.spend, n: 5 },
    { z: "want", label: "Желанное", col: C.orange, n: 2 },
    { z: "debt", label: "Долги", col: C.debt, n: 2 },
  ];
  let idx = 0;
  const trayEls = trays.map((tr, ti) => {
    const tx = rx - 330 + ti * 220;
    const ty = 720;
    for (let j = 0; j < tr.n; j++) {
      const s = t1 + 0.4 + idx * 0.13;
      idx++;
      if (t < s) continue;
      const f = flight(t, s, rx, wy - 60, tx + ((j % 3) - 1) * 36, ty - 26 - Math.floor(j / 3) * 34, 0.7, 110);
      coins.push(<Coin key={`b${ti}-${j}`} x={f.x} y={f.y} r={17} />);
    }
    const k = pop(t, t1 + 0.1 + ti * 0.1);
    return (
      <g key={tr.z} opacity={clamp01(k * 1.5)}>
        <rect x={tx - 96} y={ty - 70} width={192} height={90} rx={22} fill={C.white} stroke={tr.col} strokeWidth={6} />
        <text x={tx} y={ty + 56} fontFamily={FONT} fontWeight={900} fontSize={28} fill={tr.col} textAnchor="middle">
          {tr.label}
        </text>
      </g>
    );
  });
  return (
    <g>
      <g opacity={1 - 0.45 * ramp(t, t1, 0.6)}>
        <Dots shape="wallet" x={lx} y={wy} size={380} t={t} at={0.05} sp={11} />
        <Label x={lx} y={160} text="Тогда" k={pop(t, 0.2)} color={C.inkSoft} size={40} />
      </g>
      <Dots shape="wallet" x={rx} y={wy} size={380} t={t} at={t1 - 0.4} sp={11} />
      <Label x={rx} y={160} text="Теперь" k={pop(t, t1 - 0.2)} color={C.keepDeep} bg={C.keepLight} size={40} />
      {trayEls}
      {coins}
    </g>
  );
};
