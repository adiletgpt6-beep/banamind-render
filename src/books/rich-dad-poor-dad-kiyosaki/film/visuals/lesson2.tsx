// Урок 2 «Зачем нужна финансовая грамотность?»: небоскрёб на тонком фундаменте,
// карман (актив/пассив), три схемы денежного потока, молодая пара, три руки у зарплаты,
// деньги-усилитель, рентген дома (две правды) и богатство в днях.
import React from "react";
import { C, HEAVY } from "../theme";
import { cxOf } from "./intro";
import { Apartment, Bubble, Car, Card, Coin, Flow, House, OL, Person, Pill, Stamp } from "./draw";
import { Check, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

type P = { host?: string; [k: string]: unknown };

// ── небоскрёб: тонкий фундамент кренится, глубокий — держит ──
export const Foundation: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const lotto = pop(t, 0.2);
  const build = ramp(t, at(c, 1), 1.4);
  const tilt = ramp(t, at(c, 1.5), 1.2) * 9;
  const deep = ramp(t, at(c, 2), 1);
  const Tower: React.FC<{ x: number; h: number; rot: number; col: string }> = ({ x, h, rot, col }) => (
    <g transform={`translate(${x} 760) rotate(${rot})`}>
      <rect x={-80} y={-h} width={160} height={h} rx={8} fill={col} stroke={OL} strokeWidth={6} />
      {Array.from({ length: Math.floor(h / 60) }).map((_, i) => (
        <g key={i}>
          <rect x={-56} y={-h + 20 + i * 60} width={40} height={30} rx={4} fill="#fff" opacity={0.85} />
          <rect x={16} y={-h + 20 + i * 60} width={40} height={30} rx={4} fill="#fff" opacity={0.85} />
        </g>
      ))}
    </g>
  );
  return (
    <g>
      {/* лотерея и гонорар — монеты появляются и улетают */}
      {lotto > 0 && (
        <g opacity={1 - build}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Coin key={i} x={cx - 200 + i * 100} y={360 - ramp(t, at(c, 0.6), 1.2) * 300 + wob(t, i, 8)} r={44} spin={t * 3 + i} />
          ))}
          <Pill x={cx - 200} y={560} text="выигрыш" fill={C.goldLight} size={34} />
          <Pill x={cx + 200} y={560} text="гонорар" fill={C.goldLight} size={34} />
        </g>
      )}
      {build > 0 && (
        <g opacity={build}>
          <rect x={cx - 560} y={760} width={1120} height={14} fill="#a88a63" />
          {/* тонкий фундамент */}
          <rect x={cx - 360} y={760} width={220} height={16} fill="#8d8d8d" stroke={OL} strokeWidth={4} />
          <Tower x={cx - 250} h={560 * build} rot={tilt} col="#c9d6ec" />
          <Pill x={cx - 250} y={840} text="15 см" fill={C.coralLight} color={C.coralDeep} stroke={C.coral} size={30} />
          {/* глубокий фундамент */}
          {deep > 0 && (
            <g opacity={deep}>
              <rect x={cx + 140} y={760} width={220} height={100 * deep} fill="#8d8d8d" stroke={OL} strokeWidth={4} />
              <Tower x={cx + 250} h={560 * build} rot={0} col="#d8f0e4" />
              <Pill x={cx + 250} y={900} text="грамотность" fill={C.mintLight} color={C.mintDeep} stroke={C.mint} size={30} />
              <Check x={cx + 380} y={250} s={50} k={ramp(t, at(c, 2.3), 0.5)} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ── карман: актив кладёт деньги, пассив вынимает ──
const Pocket: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -150 -120 L 150 -120 L 130 90 Q 0 150 -130 90 Z" fill="#4c6db8" stroke={OL} strokeWidth={7} />
    <path d="M -150 -120 L 150 -120" stroke="#2f4a8a" strokeWidth={16} />
    <path d="M -120 -80 L 120 -80" stroke="#fff" strokeWidth={4} strokeDasharray="14 12" opacity={0.6} />
    <Txt x={0} y={30} size={38} color="#fff">
      мой карман
    </Txt>
  </g>
);

export const PocketVisual: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const rule = pop(t, at(c, 0.2));
  const asset = ramp(t, at(c, 1), 0.6);
  const liab = ramp(t, at(c, 2), 0.6);
  const doubt = ramp(t, at(c, 3), 0.5);
  const inY = (i: number) => ((t * 120 + i * 70) % 210);
  return (
    <g>
      {rule > 0 && (
        <g transform={`translate(${cx} 150) scale(${rule})`}>
          <Pill x={0} y={0} text="Правило № 1: покупать активы" fill={C.yellow} size={40} />
        </g>
      )}
      <Pocket x={cx} y={560} />
      {asset > 0 && (
        <g opacity={asset}>
          <g transform={`translate(${cx - 360} 380)`}>
            <Apartment x={0} y={60} s={0.7} color={C.mintLight} floors={3} />
            <Pill x={0} y={110} text="АКТИВ" fill={C.mint} color="#fff" stroke={C.mintDeep} size={36} />
          </g>
          <Flow pts={[[cx - 280, 300], [cx - 60, 300], [cx - 60, 420]]} t={t} color={C.mint} w={12} n={4} />
          {[0, 1, 2].map((i) => (
            <Coin key={i} x={cx - 60} y={330 + inY(i) * 0.4} r={22} spin={t * 4 + i} />
          ))}
        </g>
      )}
      {liab > 0 && (
        <g opacity={liab}>
          <g transform={`translate(${cx + 380} 400)`}>
            <Car x={0} y={20} s={0.8} color={C.coral} />
            <Pill x={0} y={80} text="ПАССИВ" fill={C.coral} color="#fff" stroke={C.coralDeep} size={36} />
          </g>
          <Flow pts={[[cx + 60, 420], [cx + 60, 300], [cx + 260, 300]]} t={t} color={C.coral} w={12} n={4} />
        </g>
      )}
      {doubt > 0 && <Stamp x={cx} y={830} text="БУХГАЛТЕРЫ НЕ СОГЛАСЯТСЯ" k={doubt} color={C.skyDeep} size={30} rot={-3} />}
    </g>
  );
};

// ── схема денежного потока: отчёт о доходах сверху, баланс снизу ──
export const Cashflow: React.FC<VisualProps<P & { who: "poor" | "middle" | "rich" }>> = (c) => {
  const { t, p } = c;
  const who = p.who;
  const cx = cxOf(p);
  const k = pop(t, 0.1);
  const flow = ramp(t, who === "poor" ? at(c, 1) : at(c, 0.25), 1.2);
  const title = { poor: "Схема 1 · «бедный»", middle: "Схема 2 · «средний класс»", rich: "Схема 3 · «богатый»" }[who];
  const L = cx - 270;
  const R = cx + 270;
  const top = 300;
  const bot = 650;
  const W = 460;
  return (
    <g>
      <Pill x={cx} y={130} text={title} fill={C.yellow} size={38} />
      <g transform={`translate(0 0) scale(1)`} opacity={clamp01(k * 1.5)}>
        {/* отчёт о доходах */}
        <rect x={cx - 520} y={top - 110} width={1040} height={240} rx={22} fill="#fff" stroke={OL} strokeWidth={5} />
        <Txt x={cx - 500} y={top - 70} size={24} color={C.inkSoft} anchor="start">
          ОТЧЁТ О ДОХОДАХ
        </Txt>
        <rect x={L - W / 2} y={top - 50} width={W} height={150} rx={16} fill={C.skyLight} stroke={C.sky} strokeWidth={4} />
        <Txt x={L} y={top - 10} size={32} color={C.skyDeep}>
          Доходы
        </Txt>
        <rect x={R - W / 2} y={top - 50} width={W} height={150} rx={16} fill={C.coralLight} stroke={C.coral} strokeWidth={4} />
        <Txt x={R} y={top - 10} size={32} color={C.coralDeep}>
          Расходы
        </Txt>
        {/* баланс */}
        <rect x={cx - 520} y={bot - 120} width={1040} height={300} rx={22} fill="#fff" stroke={OL} strokeWidth={5} />
        <Txt x={cx - 500} y={bot - 80} size={24} color={C.inkSoft} anchor="start">
          БАЛАНС
        </Txt>
        <rect x={L - W / 2} y={bot - 60} width={W} height={210} rx={16} fill={C.mintLight} stroke={C.mint} strokeWidth={4} />
        <Txt x={L} y={bot - 18} size={32} color={C.mintDeep}>
          Активы
        </Txt>
        <rect x={R - W / 2} y={bot - 60} width={W} height={210} rx={16} fill="#ffeede" stroke={C.orange} strokeWidth={4} />
        <Txt x={R} y={bot - 18} size={32} color="#b45f06">
          Пассивы
        </Txt>
      </g>
      {/* содержимое */}
      {who === "poor" && (
        <g>
          <Pill x={L} y={top + 50} text="зарплата" fill="#fff" stroke={C.sky} size={28} />
          <Flow pts={[[L + 100, top + 50], [R - 110, top + 50]]} t={t} k={flow} color={C.sky} w={12} />
          <Pill x={R} y={top + 50} text="еда · жильё · одежда" fill="#fff" stroke={C.coral} size={26} />
          <Flow pts={[[R, top + 90], [R, top + 150], [R + 400, top + 150]]} t={t} k={ramp(t, at(c, 1.4), 0.8)} color={C.coral} w={10} />
          <Txt x={L} y={bot + 80} size={30} color={C.grey}>
            пусто
          </Txt>
          <Txt x={R} y={bot + 80} size={30} color={C.grey}>
            пусто
          </Txt>
        </g>
      )}
      {who === "middle" && (
        <g>
          <Pill x={L} y={top + 50} text="зарплата" fill="#fff" stroke={C.sky} size={28} />
          <Flow pts={[[L + 100, top + 50], [R - 110, top + 50]]} t={t} k={flow} color={C.sky} w={12} />
          <Pill x={R} y={top + 50} text="платежи" fill="#fff" stroke={C.coral} size={28} />
          {["ипотека", "кредит за машину", "кредитные карты"].map((s, i) => (
            <Pop key={s} t={t} at={at(c, 0.5) + i * 0.25} x={R} y={bot + 30 + i * 46}>
              <Pill x={0} y={0} text={s} fill="#fff" stroke={C.orange} size={24} />
            </Pop>
          ))}
          <Flow pts={[[R + 150, bot + 30], [R + 240, bot + 30], [R + 240, top + 50], [R + 120, top + 50]]} t={t} k={ramp(t, at(c, 1.2), 1)} color={C.orange} w={10} />
          <Txt x={L} y={bot + 80} size={30} color={C.grey}>
            «это же актив?»
          </Txt>
        </g>
      )}
      {who === "rich" && (
        <g>
          {["бизнес", "акции", "аренда"].map((s, i) => (
            <Pop key={s} t={t} at={0.4 + i * 0.2} x={L} y={bot + 30 + i * 46}>
              <Pill x={0} y={0} text={s} fill="#fff" stroke={C.mint} size={26} />
            </Pop>
          ))}
          <Flow pts={[[L - 160, bot + 40], [L - 240, bot + 40], [L - 240, top + 50], [L - 120, top + 50]]} t={t} k={flow} color={C.mint} w={12} />
          <Pill x={L} y={top + 50} text="доход от активов" fill="#fff" stroke={C.mint} size={26} />
          <Flow pts={[[L + 130, top + 30], [R - 110, top + 30]]} t={t} k={ramp(t, at(c, 0.6), 0.8)} color={C.sky} w={10} />
          <Pill x={R} y={top + 50} text="расходы" fill="#fff" stroke={C.coral} size={26} />
          <Flow pts={[[L + 60, top + 90], [L + 60, bot + 100]]} t={t} k={ramp(t, at(c, 0.9), 0.8)} color={C.gold} w={10} />
          <Pill x={L + 230} y={480} text="излишек → в активы" fill={C.goldLight} size={26} />
          <Stamp x={R} y={bot + 80} text="СИЛЬНО УПРОЩЕНО" k={ramp(t, at(c, 1.1), 0.4)} color={C.skyDeep} size={28} rot={-4} />
        </g>
      )}
    </g>
  );
};

// ── молодая пара: доход ×2, расходы ×2, колонка долгов, лопата ──
export const CoupleStory: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.1);
  const inc = ramp(t, at(c, 0.4), 1);
  const items = ["дом", "машина", "мебель", "карты", "кредит на 30 лет"];
  const debt = ramp(t, at(c, 1), Math.max(1, at(c, 1.9) - at(c, 1)));
  const shovel = ramp(t, at(c, 2), 0.5);
  return (
    <g>
      <g opacity={clamp01(k * 1.5)}>
        <Person kind="man" x={cx - 470} y={760} s={0.85} t={t} mood={debt > 0.7 ? "sad" : "happy"} />
        <Person kind="woman" x={cx - 330} y={760} s={0.85} t={t} mood={debt > 0.7 ? "sad" : "happy"} />
      </g>
      {/* доходы и расходы */}
      <g transform={`translate(${cx - 120} 300)`}>
        <rect x={-30} y={-200 * (0.5 + inc * 0.5)} width={60} height={200 * (0.5 + inc * 0.5)} rx={10} fill={C.sky} stroke={OL} strokeWidth={4} transform="translate(0 200)" />
        <rect x={50} y={-190 * (0.5 + inc * 0.5)} width={60} height={190 * (0.5 + inc * 0.5)} rx={10} fill={C.coral} stroke={OL} strokeWidth={4} transform="translate(0 200)" />
        <Txt x={0} y={240} size={26} color={C.skyDeep}>
          доход
        </Txt>
        <Txt x={80} y={270} size={26} color={C.coralDeep}>
          расход
        </Txt>
        {inc > 0.5 && (
          <Txt x={40} y={-60} size={36} weight={900} color={OL}>
            ×2
          </Txt>
        )}
      </g>
      {/* колонка пассивов растёт */}
      <g transform={`translate(${cx + 260} 820)`}>
        <rect x={-170} y={-600} width={340} height={600} rx={20} fill="#ffeede" stroke={C.orange} strokeWidth={5} />
        <Txt x={0} y={-560} size={30} color="#b45f06">
          пассивы
        </Txt>
        {items.map((s, i) => {
          const on = debt * items.length > i;
          return on ? (
            <g key={s} transform={`translate(0 ${-50 - i * 96})`}>
              <rect x={-150} y={-40} width={300} height={80} rx={14} fill={i === 4 ? C.coral : "#fff"} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={12} size={i === 4 ? 26 : 32} weight={900} color={i === 4 ? "#fff" : OL}>
                {s}
              </Txt>
            </g>
          ) : null;
        })}
      </g>
      {shovel > 0 && (
        <g opacity={shovel}>
          {/* яма и лопата */}
          <ellipse cx={cx - 400} cy={850} rx={180} ry={40} fill="#6b4a2b" />
          <g transform={`translate(${cx - 260} ${720 + Math.sin(t * 5) * 10}) rotate(30)`}>
            <rect x={-8} y={-140} width={16} height={150} rx={6} fill="#8a5a2b" />
            <path d="M -36 10 L 36 10 L 26 70 Q 0 90 -26 70 Z" fill="#9aa3b5" stroke={OL} strokeWidth={4} />
          </g>
          <g transform={`translate(${cx - 120} 560)`}>
            <Bubble x={0} y={0} w={420} h={110} text="…перестань копать" size={34} fill={C.yellow} />
          </g>
        </g>
      )}
    </g>
  );
};

// ── три руки у зарплаты: компания, государство, банк ──
export const ThreeHands: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.1);
  const hands = [pop(t, at(c, 1.05)), pop(t, at(c, 1.35)), pop(t, at(c, 1.65))];
  const you = ramp(t, at(c, 2.2), 0.6);
  const labels = [
    { s: "компания", col: C.sky },
    { s: "государство", col: C.violet },
    { s: "банк", col: C.orange },
  ];
  return (
    <g>
      <g transform={`translate(${cx} 520) scale(${k})`}>
        <rect x={-150} y={-90} width={300} height={180} rx={18} fill="#e9fbe9" stroke={OL} strokeWidth={6} />
        <circle r={56} fill="none" stroke={C.green} strokeWidth={6} />
        <Txt x={0} y={14} size={36} weight={900} color={C.greenDeep}>
          зарплата
        </Txt>
      </g>
      {labels.map((l, i) => {
        if (hands[i] <= 0) return null;
        const a = -Math.PI / 2 + (i - 1) * 1.1;
        const hx = cx + Math.cos(a) * 380;
        const hy = 520 + Math.sin(a) * 300;
        const reach = 0.55 + 0.1 * Math.sin(t * 3 + i);
        return (
          <g key={l.s} opacity={hands[i]}>
            <line x1={hx} y1={hy} x2={hx + (cx - hx) * reach} y2={hy + (520 - hy) * reach} stroke={l.col} strokeWidth={34} strokeLinecap="round" />
            <circle cx={hx + (cx - hx) * reach} cy={hy + (520 - hy) * reach} r={30} fill="#fff" stroke={OL} strokeWidth={5} />
            <Pill x={hx} y={hy - 50} text={l.s} fill="#fff" stroke={l.col} size={34} />
          </g>
        );
      })}
      {you > 0 && (
        <g opacity={you}>
          <Flow pts={[[cx, 620], [cx, 800]]} t={t} color={C.mint} w={12} n={2} />
          <Pill x={cx} y={860} text="что работает на вас и семью?" fill={C.mintLight} color={C.mintDeep} stroke={C.mint} size={32} />
        </g>
      )}
    </g>
  );
};

// ── деньги как усилитель привычки ──
export const Amplifier: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.1);
  const boost = ramp(t, at(c, 1), 1.2);
  const speed = 140 + boost * 360;
  return (
    <g>
      <g transform={`translate(${cx} 470) scale(${k})`}>
        {/* усилитель */}
        <rect x={-130} y={-110} width={260} height={220} rx={20} fill="#2b3a67" stroke={OL} strokeWidth={6} />
        <circle cx={0} cy={0} r={70} fill="#1f2a44" stroke={C.gold} strokeWidth={6} />
        <circle cx={0} cy={0} r={30 + 6 * Math.sin(t * 10) * boost} fill={C.gold} />
        <Txt x={0} y={160} size={30} color={C.inkSoft}>
          деньги
        </Txt>
      </g>
      <Pill x={cx - 380} y={300} text="привычка" fill="#fff" size={34} />
      <Txt x={cx - 380} y={380} size={30} color={C.inkSoft}>
        получил → потратил
      </Txt>
      <Flow pts={[[cx - 380, 470], [cx - 140, 470]]} t={t} color={C.coral} w={10} speed={140} n={3} />
      <Flow pts={[[cx + 140, 470], [cx + 480, 470]]} t={t} color={C.coral} w={10 + boost * 8} speed={speed} n={6} />
      {boost > 0.3 && (
        <g opacity={boost}>
          <Pill x={cx + 320} y={360} text="быстрее и громче" fill={C.coralLight} color={C.coralDeep} stroke={C.coral} size={30} />
          <Coin x={cx + 300} y={620} r={40} spin={t * 8} dim />
          <Coin x={cx + 400} y={640} r={34} spin={t * 9} dim />
        </g>
      )}
    </g>
  );
};

// ── рентген денег: дом — две правды ──
export const HouseXray: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.1);
  const scan = ramp(t, at(c, 1), 0.9);
  const acct = ramp(t, at(c, 2), 0.6);
  const two = ramp(t, at(c, 3), 0.5);
  const model = ramp(t, at(c, 4), 0.5);
  const sx = cx - 260 + scan * 520;
  return (
    <g>
      {/* дом */}
      <g transform={`translate(${cx} 640) scale(${1.35 * k})`}>
        <House x={0} y={0} big roof={C.coral} />
      </g>
      {/* рентген: голубой экран с потоками расходов */}
      {scan > 0 && (
        <g>
          <defs>
            <clipPath id="xr">
              <rect x={cx - 280} y={240} width={Math.max(1, sx - (cx - 280))} height={440} />
            </clipPath>
          </defs>
          <g clipPath="url(#xr)">
            <rect x={cx - 280} y={240} width={560} height={440} rx={20} fill="#0f2a4a" opacity={0.88} />
            <g transform={`translate(${cx} 640) scale(1.35)`} opacity={0.6}>
              <path d="M -152 -166 L 0 -280 L 152 -166 M -130 -170 L -130 0 L 130 0 L 130 -170" stroke="#7fe3ff" strokeWidth={4} fill="none" />
            </g>
            {["платежи", "налоги", "ремонт"].map((s, i) => (
              <g key={s}>
                <Flow pts={[[cx - 120 + i * 120, 520], [cx - 120 + i * 120, 330]]} t={t} color={C.coral} w={9} n={3} />
                <Txt x={cx - 120 + i * 120} y={560} size={26} color="#fff">
                  {s}
                </Txt>
              </g>
            ))}
          </g>
          <rect x={sx - 4} y={230} width={8} height={460} fill="#7fe3ff" opacity={scan < 1 ? 1 : 0} />
          <Pill x={cx - 420} y={250} text="взгляд автора:" fill={C.coralLight} color={C.coralDeep} stroke={C.coral} size={28} />
          <Txt x={cx - 420} y={320} size={30} color={C.coralDeep} weight={900}>
            «пассив»
          </Txt>
        </g>
      )}
      {acct > 0 && (
        <g opacity={acct}>
          <Pill x={cx + 420} y={250} text="бухгалтерия:" fill={C.mintLight} color={C.mintDeep} stroke={C.mint} size={28} />
          <Txt x={cx + 420} y={320} size={30} color={C.mintDeep} weight={900}>
            актив в балансе
          </Txt>
          {["крыша над головой", "безопасность", "спокойствие семьи"].map((s, i) => (
            <Pop key={s} t={t} at={at(c, 2.4) + i * 0.25} x={cx + 420} y={420 + i * 70}>
              <Pill x={0} y={0} text={s} fill="#fff" stroke={C.sky} size={26} />
            </Pop>
          ))}
        </g>
      )}
      {two > 0 && (
        <g transform={`translate(${cx} 160) scale(${two})`}>
          <Pill x={0} y={0} text="две правды сразу" fill={C.yellow} size={40} />
        </g>
      )}
      {model > 0 && <Stamp x={cx - 420} y={560} text="МОДЕЛЬ, НЕ БУХУЧЁТ" k={model} color={C.skyDeep} size={28} rot={-6} />}
    </g>
  );
};

// ── богатство в днях (Фуллер) ──
export const WealthDays: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const q = pop(t, at(c, 1));
  const half = ramp(t, at(c, 2), 1);
  const full = ramp(t, at(c, 2.6), 1);
  const days = Math.round(15 * half + 15 * full);
  return (
    <g>
      {q > 0 && (
        <g transform={`translate(${cx} 190) scale(${q})`}>
          <Card x={0} y={0} w={1000} h={150} fill="#fff">
            <Txt x={0} y={-6} size={36} weight={900}>
              {"«Богатство – это способность человека\nкакое-то время жить не работая»"}
            </Txt>
          </Card>
        </g>
      )}
      <g transform={`translate(${cx - 465} 430)`}>
        {Array.from({ length: 30 }).map((_, i) => {
          const on = i < days;
          return (
            <g key={i} transform={`translate(${(i % 10) * 94} ${Math.floor(i / 10) * 94})`}>
              <rect x={0} y={0} width={80} height={80} rx={14} fill={on ? (i < 15 ? C.mint : C.gold) : "#fff"} stroke={OL} strokeWidth={4} />
              <text x={40} y={52} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={32} fill={on ? "#fff" : C.grey}>
                {i + 1}
              </text>
            </g>
          );
        })}
      </g>
      {half > 0 && <Pill x={cx - 240} y={760} text="½ расходов → полмесяца" fill={C.mintLight} color={C.mintDeep} stroke={C.mint} size={30} />}
      {full > 0.3 && <Pill x={cx + 260} y={760} text="весь месяц → свобода" fill={C.goldLight} size={30} />}
    </g>
  );
};

