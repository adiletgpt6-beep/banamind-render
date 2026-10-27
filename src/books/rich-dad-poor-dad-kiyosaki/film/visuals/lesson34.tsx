// Уроки 3 и 4: земля под бургерной, профессия и бизнес, активы с индикатором риска,
// «не бросайте основную работу», роскошь в последнюю очередь; история налога (версия автора),
// корабль-корпорация, порядок шагов с оговоркой и четыре области финансового интеллекта.
import React from "react";
import { C, HEAVY, SERIF } from "../theme";
import { cxOf } from "./intro";
import { Apartment, Bubble, Car, Card, Coin, Flow, OL, Person, Pill, RiskMeter, Spark, Stamp } from "./draw";
import { Cross, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

type P = { host?: string; [k: string]: unknown };

// ── бургерная поднимается — под ней участок земли ──
export const BurgerLand: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.1);
  const ask = pop(t, at(c, 0.4));
  const lift = ramp(t, at(c, 1.5), 1.1);
  const land = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      {ask > 0 && (
        <g transform={`translate(${cx - 330} 430) scale(${ask})`} opacity={1 - lift}>
          <Bubble x={0} y={0} w={480} h={120} text="Каким бизнесом я занимаюсь?" size={30} fill="#fff" />
        </g>
      )}
      {/* участок */}
      <g opacity={0.4 + 0.6 * land}>
        <path d={`M ${cx - 380} 720 L ${cx + 380} 720 L ${cx + 300} 860 L ${cx - 460} 860 Z`} fill="#bfe3a6" stroke={OL} strokeWidth={5} />
        {land > 0 && (
          <g opacity={land}>
            <path d={`M ${cx - 380} 720 L ${cx + 380} 720 L ${cx + 300} 860 L ${cx - 460} 860 Z`} fill="none" stroke={C.gold} strokeWidth={10} strokeDasharray="26 16" strokeDashoffset={-t * 40} />
            <Pill x={cx - 80} y={800} text="НЕДВИЖИМОСТЬ" fill={C.gold} color={OL} size={40} />
          </g>
        )}
      </g>
      {/* бургерная */}
      <g transform={`translate(${cx + 40} ${700 - lift * 260}) scale(${k})`}>
        <rect x={-210} y={-200} width={420} height={200} rx={14} fill="#fff4e0" stroke={OL} strokeWidth={6} />
        <rect x={-230} y={-250} width={460} height={60} rx={14} fill={C.coral} stroke={OL} strokeWidth={6} />
        {/* бургер-вывеска */}
        <g transform="translate(0 -300)">
          <path d="M -70 0 Q 0 -70 70 0 Z" fill="#e8a54b" stroke={OL} strokeWidth={5} />
          <rect x={-74} y={0} width={148} height={14} rx={6} fill={C.green} stroke={OL} strokeWidth={3} />
          <rect x={-72} y={14} width={144} height={18} rx={8} fill="#7a4524" stroke={OL} strokeWidth={4} />
          <path d="M -70 34 L 70 34 Q 60 60 0 60 Q -60 60 -70 34 Z" fill="#e8a54b" stroke={OL} strokeWidth={5} />
        </g>
        <rect x={-170} y={-170} width={120} height={90} rx={8} fill={C.skyLight} stroke={OL} strokeWidth={4} />
        <rect x={50} y={-170} width={120} height={90} rx={8} fill={C.skyLight} stroke={OL} strokeWidth={4} />
        <rect x={-40} y={-120} width={80} height={120} rx={6} fill="#b97a45" stroke={OL} strokeWidth={4} />
        {lift > 0.1 && (
          <g opacity={lift}>
            {[-1, 1].map((s) => (
              <path key={s} d={`M ${s * 180} 10 l ${s * 10} 40 l ${-s * 20} 0 z`} fill={C.skyLight} />
            ))}
          </g>
        )}
      </g>
      {lift > 0.3 && (
        <g transform={`translate(${cx + 440} 280)`} opacity={lift}>
          <Cross x={0} y={0} s={70} k={ramp(t, at(c, 1.7), 0.4)} />
          <Txt x={0} y={80} size={30} color={C.coralDeep}>
            не гамбургеры
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── профессия и бизнес ──
export const ProfessionBusiness: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const d1 = pop(t, at(c, 1.1));
  const d2 = pop(t, at(c, 1.4));
  const d3 = pop(t, at(c, 1.7));
  const split = ramp(t, at(c, 2), 0.7);
  return (
    <g>
      <Person kind="man" x={cx - 380} y={720} s={1} t={t} mood="happy" />
      <g opacity={1 - split * 0.85}>
        {d1 > 0 && (
          <g transform={`translate(${cx - 220} 230) scale(${d1})`}>
            <Bubble x={0} y={0} w={300} h={100} text="Я банкир" size={36} fill="#fff" tail="left" />
          </g>
        )}
        {d2 > 0 && (
          <g transform={`translate(${cx + 230} 360) scale(${d2})`}>
            <Bubble x={0} y={0} w={380} h={100} text="У вас свой банк?" size={34} fill={C.goldLight} tail="left" />
          </g>
        )}
        {d3 > 0 && (
          <g transform={`translate(${cx - 120} 500) scale(${d3})`}>
            <Bubble x={0} y={0} w={460} h={100} text="Нет, я работаю в банке" size={32} fill="#fff" tail="left" />
          </g>
        )}
      </g>
      {split > 0 && (
        <g opacity={split}>
          <Card x={cx - 30} y={430} w={420} h={330} fill={C.skyLight} stroke={C.skyDeep}>
            <Txt x={0} y={-100} size={38} weight={900} color={C.skyDeep}>
              профессия
            </Txt>
            <Txt x={0} y={-20} size={28} color={OL}>
              {"кем вы работаете:\nдоход от вашего труда"}
            </Txt>
          </Card>
          <Card x={cx + 430} y={430} w={420} h={330} fill={C.mintLight} stroke={C.mintDeep}>
            <Txt x={0} y={-100} size={38} weight={900} color={C.mintDeep}>
              «бизнес»
            </Txt>
            <Txt x={0} y={-20} size={28} color={OL}>
              {"колонка активов,\nкоторая растёт"}
            </Txt>
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={-120 + i * 64} y={110 - (i + 1) * 22 * ramp(t, at(c, 2.3), 1)} width={48} height={(i + 1) * 22 * ramp(t, at(c, 2.3), 1)} rx={6} fill={C.mint} />
            ))}
          </Card>
        </g>
      )}
    </g>
  );
};

// ── активы по автору — у каждого свой индикатор риска ──
export const AssetCards: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = [
    { s: "бизнес под\nуправлением других", risk: 0.75 },
    { s: "акции", risk: 0.7 },
    { s: "облигации", risk: 0.35 },
    { s: "доходная\nнедвижимость", risk: 0.5 },
    { s: "права на музыку,\nкниги, изобретения", risk: 0.55 },
  ];
  const riskOn = ramp(t, at(c, 1), 0.6);
  const note = ramp(t, at(c, 1.6), 0.4);
  return (
    <g>
      {items.map((it, i) => {
        const k = pop(t, at(c, 0.1 + i * 0.13));
        const x = cx - 440 + i * 220;
        return (
          <g key={i} transform={`translate(${x} 430) scale(${k})`}>
            <Card x={0} y={0} w={200} h={320} fill="#fff" stroke={C.mint}>
              <Coin x={0} y={-100} r={40} spin={t * 2 + i} />
              <Txt x={0} y={-10} size={i === 0 || i === 4 ? 22 : 26} weight={900}>
                {it.s}
              </Txt>
              {riskOn > 0 && <RiskMeter x={0} y={110} level={it.risk} k={riskOn} s={0.6} />}
            </Card>
          </g>
        );
      })}
      {riskOn > 0 && (
        <g opacity={riskOn}>
          {["акция может упасть", "арендатор — съехать", "бизнес — закрыться"].map((s, i) => (
            <Pill key={s} x={cx - 340 + i * 340} y={680} text={s} fill={C.orangeLight} color="#8a4b12" stroke={C.orange} size={26} />
          ))}
        </g>
      )}
      <Stamp x={cx} y={810} text="АКТИВ НЕ ОБЯЗАН ПРИНОСИТЬ ДОХОД" k={note} color={C.coralDeep} size={28} rot={-3} />
    </g>
  );
};

// ── «Не бросайте основную работу»: работа + маленький росток ──
export const DayJob: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const q = pop(t, 0.2);
  const warn = ramp(t, at(c, 1), 0.5);
  const grow = ramp(t, at(c, 2), Math.max(1.5, c.dur - at(c, 2) - 1));
  return (
    <g>
      {q > 0 && (
        <g transform={`translate(${cx} 170) scale(${q})`}>
          <Card x={0} y={0} w={760} h={110} fill={C.yellow}>
            <Txt x={0} y={16} size={44} weight={900}>
              «Не бросайте основную работу»
            </Txt>
          </Card>
        </g>
      )}
      {/* офис */}
      <g transform={`translate(${cx - 260} 760)`}>
        <rect x={-180} y={-330} width={360} height={330} rx={16} fill="#e6eefc" stroke={OL} strokeWidth={6} />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={-140 + (i % 3) * 100} y={-290 + Math.floor(i / 3) * 110} width={70} height={70} rx={8} fill={C.skyLight} stroke={OL} strokeWidth={4} />
        ))}
        <Pill x={0} y={50} text="работа" fill="#fff" stroke={C.sky} size={32} />
        <Flow pts={[[180, -120], [380, -120]]} t={t} color={C.sky} w={10} n={3} />
      </g>
      {/* росток своего дела, растущий шаг за шагом */}
      <g transform={`translate(${cx + 260} 760)`}>
        <ellipse cx={0} cy={0} rx={140} ry={30} fill="#a88a63" />
        <path d={`M 0 0 L 0 ${-60 - 200 * grow}`} stroke={C.green} strokeWidth={14} strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) =>
          grow > i * 0.25 ? (
            <g key={i} transform={`translate(0 ${-60 - i * 55}) scale(${clamp01((grow - i * 0.25) * 4)})`}>
              <path d={`M 0 0 Q ${i % 2 ? 70 : -70} -40 ${i % 2 ? 100 : -100} 0 Q ${i % 2 ? 50 : -50} 20 0 0`} fill={C.mint} stroke={OL} strokeWidth={4} />
            </g>
          ) : null,
        )}
        {grow > 0.85 && <Coin x={0} y={-60 - 200 * grow - 30} r={34} spin={t * 3} />}
        <Pill x={0} y={50} text="своё — шаг за шагом" fill="#fff" stroke={C.mint} size={30} />
      </g>
      {warn > 0 && <Stamp x={cx} y={330} text="ТОЛЬКО ПРИ СИЛЬНОМ ЖЕЛАНИИ" k={warn} color={C.skyDeep} size={28} rot={-4} />}
    </g>
  );
};

// ── роскошь в последнюю очередь: дом с арендой «покупает» машину ──
export const LuxuryLast: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const good = ramp(t, at(c, 1), 0.6);
  const flow = ramp(t, at(c, 1.4), 1.2);
  const car = pop(t, at(c, 1.9));
  const bad = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <Pill x={cx} y={140} text="роскошь — в последнюю очередь" fill={C.yellow} size={38} />
      {good > 0 && (
        <g opacity={good}>
          <Apartment x={cx - 400} y={560} s={0.9} color={C.mintLight} floors={4} />
          <Flow pts={[[cx - 280, 430], [cx - 80, 430]]} t={t} k={flow} color={C.mint} w={12} n={4} />
          {car > 0 && (
            <g transform={`translate(${cx + 80} 480) scale(${car})`}>
              <Car x={0} y={0} s={0.9} color={C.violet} shiny />
            </g>
          )}
          <Txt x={cx - 160} y={620} size={28} color={C.mintDeep} weight={900}>
            доход оплачивает машину
          </Txt>
        </g>
      )}
      {bad > 0 && (
        <g opacity={bad} transform="translate(0 0)">
          <Card x={cx + 320} y={720} w={480} h={200} fill={C.coralLight} stroke={C.coral}>
            <Car x={-160} y={30} s={0.45} color={C.coral} />
            <Txt x={70} y={-10} size={28} w={300} weight={900} color={C.coralDeep}>
              {"сначала в кредит,\nпотом годы платить"}
            </Txt>
          </Card>
          <Cross x={cx + 540} y={640} s={50} k={ramp(t, at(c, 2.3), 0.4)} />
        </g>
      )}
    </g>
  );
};

// ── история налога: линия времени (версия автора) ──
export const TaxHistory: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const line = ramp(t, 0.2, 1);
  const eng = pop(t, at(c, 0.5));
  const shift = ramp(t, at(c, 1.2), 1.4);
  const both = pop(t, at(c, 2.4));
  return (
    <g>
      <Pill x={cx} y={130} text="как рассказывает автор" fill="#fff" stroke={C.skyDeep} color={C.skyDeep} size={32} />
      <line x1={cx - 500} y1={420} x2={cx - 500 + 1000 * line} y2={420} stroke={OL} strokeWidth={8} strokeLinecap="round" />
      {eng > 0 && (
        <g transform={`translate(${cx - 330} 420) scale(${eng})`}>
          <circle r={18} fill={C.gold} stroke={OL} strokeWidth={4} />
          <Card x={0} y={-130} w={360} h={150} fill="#fff">
            <Txt x={0} y={-24} size={30} weight={900}>
              Англия, 1799
            </Txt>
            <Txt x={0} y={24} size={26} color={C.inkSoft}>
              {"налог на войну\nс Наполеоном"}
            </Txt>
          </Card>
        </g>
      )}
      {/* кто платит: «богатые» → средний класс */}
      <g transform={`translate(${cx + 260} 640)`}>
        <Person kind="richDad" x={-170} y={120} s={0.8} t={t} mood="happy" />
        <Person kind="man" x={60} y={120} s={0.8} t={t} mood={shift > 0.6 ? "sad" : "calm"} />
        <Person kind="woman" x={190} y={120} s={0.8} t={t} mood={shift > 0.6 ? "sad" : "calm"} />
        <g transform={`translate(${-170 + 290 * shift} ${-200 + Math.sin(shift * Math.PI) * -60})`}>
          <rect x={-70} y={-40} width={140} height={80} rx={12} fill={C.violetLight} stroke={C.violet} strokeWidth={5} />
          <Txt x={0} y={12} size={32} weight={900} color={C.violet}>
            налог
          </Txt>
        </g>
        {shift > 0.6 && <Pill x={125} y={190} text="средний класс" fill="#fff" size={26} />}
      </g>
      {both > 0 && (
        <g transform={`translate(${cx - 300} 700) scale(${both})`}>
          <Card x={0} y={0} w={520} h={130} fill={C.yellow}>
            <Txt x={0} y={-6} size={32} weight={900}>
              {"«Обе стороны были\nв чем-то правы»"}
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── корабль-корпорация и «папка с бумагами» ──
export const ShipCorp: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const ship = pop(t, 0.1);
  const sink = ramp(t, at(c, 0.55), 1.4);
  const folder = pop(t, at(c, 1));
  const bob = Math.sin(t * 1.6) * 8;
  return (
    <g>
      {/* море */}
      <path d={`M ${cx - 560} 560 ${Array.from({ length: 12 }).map((_, i) => `q 50 ${i % 2 ? 18 : -18} 100 0`).join(" ")} L ${cx + 640} 760 L ${cx - 560} 760 Z`} fill="#8fd0f0" opacity={0.85} />
      <g transform={`translate(${cx - 120} ${520 + bob + sink * 120}) rotate(${sink * 14}) scale(${ship})`} opacity={1 - sink * 0.5}>
        <path d="M -200 0 L 200 0 L 150 80 L -150 80 Z" fill="#8a5a2b" stroke={OL} strokeWidth={6} />
        <line x1={0} y1={0} x2={0} y2={-260} stroke={OL} strokeWidth={10} />
        <path d="M 10 -250 Q 140 -170 10 -60 Z" fill="#fff" stroke={OL} strokeWidth={5} />
        <path d="M -10 -230 Q -120 -160 -10 -80 Z" fill="#fff" stroke={OL} strokeWidth={5} />
      </g>
      {/* вкладчик: теряет только вложенное в рейс */}
      <g transform={`translate(${cx - 430} 330)`}>
        <Person kind="old" x={0} y={160} s={0.7} t={t} mood={sink > 0.5 ? "sad" : "calm"} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Coin key={i} x={70 + (i < 1 ? sink * 280 : 0)} y={150 - i * 26 + (i < 1 ? sink * 230 : 0)} r={22} dim={i < 1 && sink > 0.5} />
        ))}
        {sink > 0.6 && (
          <Txt x={30} y={250} size={26} color={C.inkSoft} weight={900}>
            {"теряет только\nвложенное в рейс"}
          </Txt>
        )}
      </g>
      {folder > 0 && (
        <g transform={`translate(${cx + 380} 400) scale(${folder}) rotate(${wob(t, 3, 2)})`}>
          <path d="M -150 -100 L -50 -100 L -20 -70 L 150 -70 L 150 120 L -150 120 Z" fill="#ffd27a" stroke={OL} strokeWidth={6} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-120 + i * 12} y={-60 + i * 10} width={220} height={150} rx={6} fill="#fff" stroke={OL} strokeWidth={3} />
          ))}
          <Txt x={0} y={180} size={28} weight={900}>
            {"«папка с несколькими\nбумагами»"}
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── порядок шагов: сотрудник vs владелец (схема автора) + «играть по правилам» ──
export const OrderSwap: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const rowA = ["заработал", "налоги", "потратил"];
  const rowB = ["заработал", "расходы компании", "налог с остатка"];
  const a = ramp(t, at(c, 0.2), 1);
  const b = ramp(t, at(c, 1.2), 1);
  const law = ramp(t, at(c, 2), 0.6);
  const stop = ramp(t, at(c, 3), 0.5);
  const Row: React.FC<{ y: number; items: string[]; k: number; title: string; col: string }> = ({ y, items, k, title, col }) => (
    <g opacity={clamp01(k * 2)}>
      <Txt x={cx - 520} y={y - 70} size={30} color={col} weight={900} anchor="start">
        {title}
      </Txt>
      {items.map((s, i) => {
        const on = k * items.length > i;
        const x = cx - 360 + i * 360;
        return on ? (
          <g key={s}>
            <Card x={x} y={y} w={300} h={100} fill="#fff" stroke={col}>
              <Txt x={0} y={12} size={s.length > 12 ? 26 : 32} weight={900}>
                {`${i + 1}. ${s}`}
              </Txt>
            </Card>
            {i < items.length - 1 && <Flow pts={[[x + 155, y], [x + 205, y]]} t={t} color={col} w={8} n={1} dots={false} />}
          </g>
        ) : null;
      })}
    </g>
  );
  return (
    <g>
      <Row y={260} items={rowA} k={a} title="сотрудник" col={C.sky} />
      <Row y={470} items={rowB} k={b} title="владелец компании (схема автора)" col={C.violet} />
      {law > 0 && (
        <g opacity={law}>
          <Card x={cx} y={660} w={980} h={110} fill={C.mintLight} stroke={C.mint}>
            <Txt x={0} y={14} size={34} weight={900} color={C.mintDeep}>
              «Лично я советую всем играть по правилам»
            </Txt>
          </Card>
        </g>
      )}
      {stop > 0 && <Stamp x={cx} y={820} text="УКЛОНЕНИЕ ОТ НАЛОГОВ — НАРУШЕНИЕ" k={stop} color={C.coralDeep} size={28} rot={-2} />}
    </g>
  );
};

// ── четыре области финансового интеллекта ──
export const IqFour: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = [
    { s: "бухгалтерия", d: "читать цифры", col: C.sky, icon: "123" },
    { s: "инвестирование", d: "деньги делают деньги", col: C.mint, icon: "%" },
    { s: "рынки", d: "спрос и предложение", col: C.orange, icon: "↗" },
    { s: "законы", d: "правила игры", col: C.violet, icon: "§" },
  ];
  const center = pop(t, 0.3);
  return (
    <g>
      <g transform={`translate(${cx} 480) scale(${center})`}>
        <circle r={110} fill={C.gold} stroke={OL} strokeWidth={6} />
        <Txt x={0} y={-6} size={30} weight={900}>
          {"финансовый\nинтеллект"}
        </Txt>
      </g>
      {items.map((it, i) => {
        const k = pop(t, at(c, 1) + i * 0.35);
        const x = cx + (i % 2 ? 330 : -330);
        const y = 300 + Math.floor(i / 2) * 360;
        return (
          <g key={it.s}>
            {k > 0 && <line x1={cx + (i % 2 ? 100 : -100)} y1={480 + (i < 2 ? -60 : 60)} x2={x + (i % 2 ? -160 : 160)} y2={y} stroke={it.col} strokeWidth={8} opacity={k} />}
            <g transform={`translate(${x} ${y}) scale(${k})`}>
              <Card x={0} y={0} w={340} h={180} fill="#fff" stroke={it.col}>
                <circle cx={-110} cy={-20} r={40} fill={it.col} />
                <text x={-110} y={-6} textAnchor="middle" fontFamily={it.icon === "§" ? SERIF : HEAVY} fontWeight={900} fontSize={it.icon.length > 1 ? 30 : 46} fill="#fff">
                  {it.icon}
                </text>
                <Txt x={40} y={-24} size={30} weight={900}>
                  {it.s}
                </Txt>
                <Txt x={0} y={50} size={24} color={C.inkSoft}>
                  {it.d}
                </Txt>
              </Card>
            </g>
          </g>
        );
      })}
      {ramp(t, at(c, 1.8), 0.5) > 0 && <Spark x={cx + 90} y={380} s={1} />}
    </g>
  );
};
