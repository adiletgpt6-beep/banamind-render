// «Проверенное знание» и «Прыжки веры»: оправдание-печать, капли сигнала, нескачанное дополнение,
// действия клиентов, занятость против знания, обувь на фото, две капсулы-гипотезы, прачечная в пикапе,
// предел планирования, обрыв прыжка веры, кампус, аналоги, дорога инженера, архетип, две ловушки.
import React from "react";
import { C, HEAVY } from "../theme";
import { Capsule, Card, Drop, Flask, OL, Paper, Person, Phone, Pill, Spark, Stamp } from "./draw";
import { Arrow, Check, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";
import { Badge, Icon, IconCard, cxOf, type P } from "./parts";

// ── «зато мы многому научились» → печать «чем доказано?» ──
export const ExcuseStamp: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.2);
  const stamp = ramp(t, at(c, 1.25), 0.45);
  const q = pop(t, at(c, 1.7));
  return (
    <g>
      {k > 0 && (
        <g transform={`translate(${cx} 380) scale(${k})`}>
          <Card x={0} y={0} w={880} h={250} fill="#fff">
            <Icon name="chat" x={-340} y={-10} s={1.4} color={C.pinkLight} />
            <Txt x={60} y={-10} size={50}>
              «Зато мы многому
            </Txt>
            <Txt x={60} y={56} size={50}>
              научились!»
            </Txt>
          </Card>
        </g>
      )}
      <Stamp x={cx + 260} y={520} text="ОПРАВДАНИЕ?" k={stamp} size={52} rot={-10} />
      {q > 0 && (
        <g transform={`translate(${cx} 720) scale(${q})`}>
          <Pill x={-260} y={0} text="что именно?" fill={C.yellow} size={40} />
          <Pill x={250} y={0} text="чем доказано?" fill={C.yellow} size={40} />
        </g>
      )}
    </g>
  );
};

// ── подтверждение фактами: капли сигнала наполняют колбу ──
export const ProofDrops: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const term = pop(t, at(c, 0.1));
  const vs = pop(t, at(c, 0.55));
  const drops = ramp(t, at(c, 1), 3);
  return (
    <g>
      {term > 0 && (
        <g transform={`translate(${cx} 180) scale(${term})`}>
          <Pill x={0} y={0} text="«подтверждение фактами»" fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={48} />
        </g>
      )}
      {vs > 0 && (
        <g opacity={clamp01(vs * 1.4)}>
          <IconCard x={cx - 380} y={480} w={330} h={280} icon="chat" label={"красивый\nрассказ"} k={vs} color={C.pinkLight} mark="cross" markK={ramp(t, at(c, 0.8), 0.4)} size={32} />
          <IconCard x={cx + 380} y={480} w={330} h={280} icon="people" label={"поведение\nклиентов"} k={vs} color={C.teal} mark="check" markK={ramp(t, at(c, 0.85), 0.4)} size={32} />
        </g>
      )}
      <Flask x={cx} y={560} s={1.5} level={0.12 + 0.6 * drops} t={t} />
      {drops > 0 &&
        drops < 1 &&
        [0, 1, 2].map((i) => {
          const ph = (t * 0.9 + i / 3) % 1;
          return <Drop key={i} x={cx - 30 + i * 30} y={260 + ph * 220} s={0.8} />;
        })}
      <Pop t={t} at={at(c, 1.5)} x={cx} y={820}>
        <Pill x={0} y={0} text="капля = что люди сделали" fill="#fff" size={34} />
      </Pop>
    </g>
  );
};

// ── дополнение к мессенджерам: прогресс загрузок = ноль ──
export const AddonFail: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const plan = pop(t, at(c, 0.2));
  const launch = ramp(t, at(c, 0.85), 0.6);
  const zero = pop(t, at(c, 1.25));
  return (
    <g>
      <Badge x={cx} y={150} kind="history" t={t} />
      {plan > 0 && (
        <g transform={`translate(${cx - 260} 470) scale(${plan})`}>
          <Card x={0} y={0} w={480} h={380} fill="#fff">
            <Txt x={0} y={-140} size={32}>
              анализ рынка
            </Txt>
            {[0.4, 0.62, 0.8].map((v, i) => (
              <rect key={i} x={-150 + i * 110} y={110 - 200 * v} width={80} height={200 * v} rx={10} fill={C.cyan} stroke={OL} strokeWidth={4} />
            ))}
            <path d="M -170 130 L 170 130" stroke={OL} strokeWidth={4} />
            <Icon name="check" x={170} y={-140} s={0.6} />
          </Card>
        </g>
      )}
      <Arrow x1={cx - 10} y1={470} x2={cx + 80} y2={470} k={launch} w={10} />
      {launch > 0 && (
        <g transform={`translate(${cx + 290} 470)`} opacity={launch}>
          <Card x={0} y={0} w={460} h={380} fill="#fff">
            <Txt x={0} y={-140} size={32}>
              дополнение · загрузки
            </Txt>
            <rect x={-180} y={-40} width={360} height={60} rx={30} fill={C.greyLight} stroke={OL} strokeWidth={4} />
            <rect x={-176} y={-36} width={6} height={52} rx={3} fill={C.coral} />
            {zero > 0 && (
              <text x={0} y={140} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={110 * zero} fill={C.coralDeep}>
                0
              </text>
            )}
          </Card>
        </g>
      )}
      {zero > 0 && (
        <g transform={`translate(${cx} 800) scale(${zero})`}>
          <Pill x={0} y={0} text="«Его не загрузил ни один человек»" fill={C.coralLight} color={C.coralDeep} stroke={C.coral} size={36} />
        </g>
      )}
    </g>
  );
};

// ── клиенты показывают действиями: следы шагов к «новым друзьям» ──
export const ActionsSpeak: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const steps = ramp(t, at(c, 0.4), 2.2);
  const friends = pop(t, at(c, 1.05));
  const up = ramp(t, at(c, 1.6), 1.2);
  return (
    <g>
      {/* старая дверь «дополнение» — мимо */}
      <g transform={`translate(${cx - 360} 470)`} opacity={0.6}>
        <rect x={-110} y={-170} width={220} height={300} rx={16} fill="#e4e9f2" stroke={OL} strokeWidth={5} />
        <Txt x={0} y={-10} size={30} color={C.inkSoft}>
          дополнение
        </Txt>
      </g>
      {/* следы к новым друзьям */}
      {Array.from({ length: 9 }).map((_, i) => {
        const k = clamp01(steps * 9 - i);
        const x = cx - 300 + i * 70;
        const y = 700 - Math.sin(i * 0.5) * 80 - i * 18;
        return k > 0 ? <ellipse key={i} cx={x} cy={y + (i % 2) * 26} rx={16} ry={26} fill={C.teal} opacity={0.75 * k} transform={`rotate(70 ${x} ${y + (i % 2) * 26})`} /> : null;
      })}
      {friends > 0 && (
        <g transform={`translate(${cx + 330} 450) scale(${friends})`}>
          <circle r={190} fill={C.tealLight} stroke={C.teal} strokeWidth={6} />
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 + t * 0.4;
            return <Person key={i} kind={(["woman", "man", "girl", "kid2"] as const)[i]} x={Math.cos(a) * 95} y={Math.sin(a) * 60 + 70} s={0.33} t={t} mood="happy" />;
          })}
          <Icon name="heart" x={0} y={-90} s={0.8} color={C.pink} />
          <Txt x={0} y={250} size={34}>
            «Они хотели заводить новых друзей»
          </Txt>
        </g>
      )}
      {up > 0 && (
        <g transform={`translate(${cx - 60} 230)`} opacity={up}>
          <polyline points={`-120,40 -40,20 40,-10 ${40 + 80 * up},${-10 - 70 * up}`} fill="none" stroke={C.teal} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
          <Txt x={0} y={100} size={28} color={C.tealDeep}>
            после поворота
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── занятость против знания: гора задач и одна капля знания ──
export const BusyVsLearn: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const pile = ramp(t, 0.2, 2);
  const waste = ramp(t, at(c, 0.6), 0.5);
  const scale = pop(t, at(c, 1.1));
  return (
    <g>
      {/* гора выполненных задач */}
      <g transform={`translate(${cx - 300} 760)`}>
        {Array.from({ length: 14 }).map((_, i) => {
          const k = clamp01(pile * 14 - i);
          const row = Math.floor(i / 4);
          return <rect key={i} x={-200 + (i % 4) * 100 + row * 20} y={-row * 70 - 70} width={92} height={62} rx={8} fill={waste > 0.5 ? "#dfe3ea" : C.goldLight} stroke={OL} strokeWidth={3} opacity={k} />;
        })}
        <Txt x={0} y={60} size={30} color={C.inkSoft}>
          задачи, ночи, функции
        </Txt>
        <Stamp x={0} y={-180} text="ПОТЕРИ" k={waste} size={46} />
      </g>
      {scale > 0 && (
        <g transform={`translate(${cx + 300} 520) scale(${scale})`}>
          <Card x={0} y={0} w={480} h={420} fill="#fff">
            <Txt x={0} y={-160} size={34}>
              производительность =
            </Txt>
            <Flask x={0} y={20} s={1.1} level={0.55} t={t} />
            <Txt x={0} y={170} size={34} color={C.tealDeep}>
              знания, а не часы
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── Zappos: фото обуви вместо склада ──
export const ShoeTest: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const shop = pop(t, at(c, 1));
  const snap = ramp(t, at(c, 1.3), 0.3);
  const order = pop(t, at(c, 1.6));
  const learn = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <Badge x={cx} y={150} kind="history" t={t} />
      <Pop t={t} at={at(c, 0.4)} x={cx} y={270}>
        <Capsule x={0} y={0} w={760} h={110} text="готовы ли люди покупать обувь онлайн?" glow={0.5} size={34} />
      </Pop>
      {shop > 0 && (
        <g transform={`translate(${cx - 400} 560) scale(${shop})`}>
          <rect x={-150} y={-140} width={300} height={260} rx={14} fill="#fff4e0" stroke={OL} strokeWidth={5} />
          <path d="M -170 -140 L 0 -200 L 170 -140 Z" fill={C.coral} stroke={OL} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <Icon key={i} name="shoe" x={-90 + i * 90} y={-40 + (i % 2) * 70} s={0.7} color={[C.sky, C.pink, C.gold][i]} />
          ))}
          <Txt x={0} y={170} size={28} color={C.inkSoft}>
            местный магазин
          </Txt>
          {/* вспышка фотоаппарата */}
          {snap > 0 && snap < 1 && <circle r={220 * snap} fill="#fff" opacity={0.8 * (1 - snap)} />}
        </g>
      )}
      {shop > 0 && <Arrow x1={cx - 220} y1={560} x2={cx - 100} y2={560} k={ramp(t, at(c, 1.35), 0.4)} w={9} />}
      {snap > 0 && (
        <g transform={`translate(${cx + 30} 580)`}>
          <Phone x={0} y={0} s={0.75}>
            <Icon name="shoe" x={0} y={-70} s={1.4} color={C.sky} />
            <rect x={-70} y={40} width={140} height={46} rx={23} fill={order > 0 ? C.teal : C.greyLight} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={74} size={26} color="#fff">
              заказ
            </Txt>
          </Phone>
        </g>
      )}
      {order > 0 && (
        <g transform={`translate(${cx + 380} 560) scale(${order})`}>
          <Icon name="truck" x={0} y={0} s={1.5} color={C.gold} />
          <Txt x={0} y={90} size={28}>
            купил по обычной цене
          </Txt>
        </g>
      )}
      {learn > 0 && (
        <g opacity={learn} transform={`translate(${cx} 840)`}>
          {["оплата", "доставка", "возвраты"].map((w, i) => (
            <Pill key={w} x={-320 + i * 320} y={0} text={w} fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={32} />
          ))}
        </g>
      )}
    </g>
  );
};

// ── две капсулы: ценность и рост ──
export const TwoCapsules: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const vision = pop(t, 0.2);
  const split = ramp(t, at(c, 0.5), 0.8);
  const v = ramp(t, at(c, 1.05), 0.5);
  const g = ramp(t, at(c, 1.55), 0.5);
  return (
    <g>
      {vision > 0 && (
        <g transform={`translate(${cx} ${330 - split * 80}) scale(${vision * (1 - split * 0.3)})`}>
          <circle r={110} fill={C.goldLight} stroke={OL} strokeWidth={6} />
          <Icon name="eye" x={0} y={-10} s={1.4} color={C.gold} />
          <Txt x={0} y={80} size={30}>
            видение
          </Txt>
        </g>
      )}
      {split > 0 && (
        <g opacity={split}>
          <Arrow x1={cx - 60} y1={360} x2={cx - 260} y2={460} k={split} w={8} />
          <Arrow x1={cx + 60} y1={360} x2={cx + 260} y2={460} k={split} w={8} />
          <Capsule x={cx - 300} y={560} w={480} h={160} text="гипотеза ценности" glow={v} color={C.teal} size={38} />
          <Capsule x={cx + 300} y={560} w={480} h={160} text="гипотеза роста" glow={g} color={C.cyan} size={38} />
        </g>
      )}
      {v > 0 && (
        <g opacity={v} transform={`translate(${cx - 300} 740)`}>
          <Txt x={0} y={0} size={30} color={C.tealDeep}>
            {"увидят ли пользу,\nкогда начнут пользоваться?"}
          </Txt>
        </g>
      )}
      {g > 0 && (
        <g opacity={g} transform={`translate(${cx + 300} 740)`}>
          <Txt x={0} y={0} size={30} color={C.cyanDeep}>
            {"как узнают\nновые клиенты?"}
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── прачечная: стиральная машина в кузове пикапа ──
export const LaundryTruck: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const drive = ramp(t, 0.3, 1.6);
  const ad = pop(t, at(c, 1.1));
  const q = pop(t, at(c, 1.55));
  const x = cx - 700 + 600 * drive;
  return (
    <g>
      <Badge x={cx} y={150} kind="history" t={t} />
      {/* улица */}
      <rect x={cx - 640} y={700} width={1280} height={90} rx={20} fill="#c9cfdd" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={cx - 600 + i * 160} y={738} width={80} height={12} rx={6} fill="#fff" />
      ))}
      {/* пикап */}
      <g transform={`translate(${x} 640)`}>
        <rect x={-210} y={-60} width={250} height={90} rx={10} fill={C.sky} stroke={OL} strokeWidth={5} />
        <path d="M 40 -60 L 120 -60 L 170 0 L 170 30 L 40 30 Z" fill={C.sky} stroke={OL} strokeWidth={5} />
        <rect x={70} y={-48} width={56} height={40} rx={6} fill="#fff" stroke={OL} strokeWidth={4} />
        <circle cx={-140} cy={36} r={30} fill={OL} />
        <circle cx={110} cy={36} r={30} fill={OL} />
        {/* стиральная машина */}
        <g transform="translate(-90 -130)">
          <rect x={-70} y={-70} width={140} height={140} rx={14} fill="#fff" stroke={OL} strokeWidth={5} />
          <circle r={44} fill={C.cyanLight} stroke={OL} strokeWidth={5} />
          <path d={`M -30 0 Q 0 ${-20 + Math.sin(t * 6) * 10} 30 0`} stroke={C.cyan} strokeWidth={6} fill="none" />
        </g>
      </g>
      {ad > 0 && (
        <g transform={`translate(${x - 90} 380) scale(${ad}) rotate(${wob(t, 2, 3)})`}>
          <Icon name="megaphone" x={0} y={0} s={1.1} color={C.gold} />
          <Pill x={0} y={-90} text="это реклама, не прачечная" fill={C.goldLight} color={C.goldDeep} stroke={C.gold} size={30} />
        </g>
      )}
      {q > 0 && (
        <g transform={`translate(${cx + 330} 420) scale(${q})`}>
          <Capsule x={0} y={0} w={460} h={150} text={"сдадут ли бельё\nи заплатят ли?"} glow={0.5 + 0.3 * Math.sin(t * 3)} size={32} />
        </g>
      )}
    </g>
  );
};

// ── предел планирования: план годится для долгой и стабильной истории ──
export const PlanLimit: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.2);
  const fog = ramp(t, at(c, 0.6), 0.8);
  const guess = pop(t, at(c, 1.4));
  return (
    <g>
      {k > 0 && (
        <g transform={`translate(${cx - 270} 480) scale(${k})`}>
          <Card x={0} y={0} w={480} h={430} fill="#fff">
            <Txt x={0} y={-160} size={32}>
              долгая история
            </Txt>
            <polyline points="-180,120 -120,90 -60,70 0,40 60,20 120,-10 180,-30" fill="none" stroke={C.teal} strokeWidth={10} strokeLinecap="round" />
            <path d="M 180 -30 L 220 -50" stroke={C.teal} strokeWidth={10} strokeDasharray="12 10" />
            <Check x={150} y={-140} s={50} k={ramp(t, at(c, 0.5), 0.4)} />
            <Txt x={0} y={180} size={28} color={C.tealDeep}>
              прогноз работает
            </Txt>
          </Card>
        </g>
      )}
      {k > 0 && (
        <g transform={`translate(${cx + 270} 480) scale(${k})`}>
          <Card x={0} y={0} w={480} h={430} fill="#fff">
            <Txt x={0} y={-160} size={32}>
              новый продукт
            </Txt>
            <polyline points="-180,120 -140,100" fill="none" stroke={C.cyan} strokeWidth={10} strokeLinecap="round" />
            {/* туман неизвестности */}
            {[0, 1, 2, 3].map((i) => (
              <ellipse key={i} cx={-60 + i * 70 + Math.sin(t + i) * 10} cy={20 - i * 20} rx={110} ry={60} fill="#dfe6f2" opacity={0.85 * fog} />
            ))}
            {fog > 0.5 && <Icon name="question" x={60} y={0} s={0.9} color={C.yellow} />}
            <Txt x={0} y={180} size={28} color={C.coralDeep}>
              прогноз = догадка
            </Txt>
          </Card>
        </g>
      )}
      {guess > 0 && (
        <g transform={`translate(${cx} 820) scale(${guess})`}>
          <Pill x={0} y={0} text="план — не вместо проверки" fill={C.yellow} size={38} />
        </g>
      )}
    </g>
  );
};

// ── прыжок веры: мостик из капсул над обрывом ──
export const LeapCliff: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const jump = ramp(t, at(c, 0.3), 1.2);
  const blind = ramp(t, at(c, 1.1), 0.6);
  const px = cx - 420 + 600 * jump;
  const py = 520 - Math.sin(jump * Math.PI) * 220;
  return (
    <g>
      {/* два утёса */}
      <path d={`M ${cx - 640} 600 L ${cx - 320} 600 L ${cx - 260} 1000 L ${cx - 640} 1000 Z`} fill="#b7a07a" stroke={OL} strokeWidth={6} />
      <path d={`M ${cx + 240} 600 L ${cx + 640} 600 L ${cx + 640} 1000 L ${cx + 180} 1000 Z`} fill="#b7a07a" stroke={OL} strokeWidth={6} />
      <rect x={cx - 640} y={590} width={320} height={24} fill={C.mint} />
      <rect x={cx + 240} y={590} width={400} height={24} fill={C.mint} />
      <Pill x={cx - 480} y={680} text="план" fill="#fff" size={32} />
      <Pill x={cx + 440} y={680} text="успех" fill="#fff" size={32} />
      {/* прыгающая капсула */}
      <g transform={`translate(${px} ${py}) rotate(${jump * 360})`}>
        <Capsule x={0} y={0} w={220} h={90} text="допущение" glow={0.6} color={C.violet} size={28} />
      </g>
      <Pop t={t} at={at(c, 0.45)} x={cx} y={220}>
        <Pill x={0} y={0} text="«прыжки веры»" fill={C.violetLight} color={C.violetDeep} stroke={C.violet} size={50} />
      </Pop>
      {blind > 0 && (
        <g opacity={blind} transform={`translate(${cx} 380)`}>
          <Icon name="eye" x={0} y={0} s={1.2} color={C.grey} />
          <line x1={-50} y1={-40} x2={50} y2={40} stroke={C.coralDeep} strokeWidth={10} strokeLinecap="round" />
          <Txt x={0} y={90} size={32} color={C.coralDeep}>
            «очевидное» не проверяют
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── ранний Facebook: ежедневные визиты и охват кампуса ──
export const CampusGrowth: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const daily = ramp(t, at(c, 1), 0.9);
  const fill = ramp(t, at(c, 1.45), 1.4);
  return (
    <g>
      <Badge x={cx} y={150} kind="history" t={t} />
      {/* ценность: половина заходит каждый день */}
      <Pop t={t} at={at(c, 0.8)} x={cx - 300} y={500}>
        <Card x={0} y={0} w={480} h={460} fill="#fff">
          <Txt x={0} y={-180} size={30} color={C.tealDeep}>
            сигнал ценности
          </Txt>
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={i} transform={`translate(${-160 + (i % 5) * 80} ${-60 + Math.floor(i / 5) * 110})`}>
              <Icon name="person" x={0} y={0} s={0.8} color={i < 5 && daily > i / 5 ? C.teal : C.greyLight} />
            </g>
          ))}
          <Txt x={0} y={160} size={30}>
            {"больше половины —\nкаждый день"}
          </Txt>
        </Card>
      </Pop>
      {/* рост: кампус заполняется */}
      <Pop t={t} at={at(c, 1.3)} x={cx + 300} y={500}>
        <Card x={0} y={0} w={480} h={460} fill="#fff">
          <Txt x={0} y={-180} size={30} color={C.cyanDeep}>
            сигнал роста
          </Txt>
          <circle cx={0} cy={-10} r={120} fill={C.greyLight} stroke={OL} strokeWidth={5} />
          <path d={`M 0 -10 L 0 -130 A 120 120 0 ${fill > 0.66 ? 1 : 0} 1 ${120 * Math.sin(fill * 0.75 * 2 * Math.PI)} ${-10 - 120 * Math.cos(fill * 0.75 * 2 * Math.PI)} Z`} fill={C.cyan} stroke={OL} strokeWidth={4} />
          <Txt x={0} y={160} size={28}>
            {"«почти три четверти\nстудентов Гарварда»"}
          </Txt>
        </Card>
      </Pop>
      <Pop t={t} at={at(c, 1.85)} x={cx + 300} y={810}>
        <Pill x={0} y={0} text="без затрат на рекламу" fill={C.yellow} size={30} />
      </Pop>
    </g>
  );
};

// ── аналоги и антианалоги: плеер, загрузки, вопрос оплаты ──
export const Analogs: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const a = pop(t, at(c, 1.1));
  const b = pop(t, at(c, 1.55));
  const leap = pop(t, at(c, 2.1));
  return (
    <g>
      <Pop t={t} at={at(c, 0.3)} x={cx} y={190}>
        <g>
          <Pill x={-230} y={0} text="«аналоги»" fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={44} />
          <Pill x={230} y={0} text="«антианалоги»" fill={C.coralLight} color={C.coralDeep} stroke={C.coral} size={44} />
        </g>
      </Pop>
      {a > 0 && (
        <g transform={`translate(${cx - 330} 470) scale(${a})`}>
          <Card x={0} y={0} w={460} h={340} fill="#fff">
            <rect x={-80} y={-110} width={160} height={110} rx={14} fill={C.tealLight} stroke={OL} strokeWidth={4} />
            <circle cx={-30} cy={-55} r={26} fill="#fff" stroke={OL} strokeWidth={4} />
            <circle cx={30} cy={-55} r={26} fill="#fff" stroke={OL} strokeWidth={4} />
            <path d="M -120 -60 Q -120 -170 0 -170 Q 120 -170 120 -60" stroke={OL} strokeWidth={8} fill="none" />
            <Txt x={0} y={70} size={30}>
              Walkman
            </Txt>
            <Txt x={0} y={120} size={26} color={C.tealDeep} weight={700}>
              слушают на ходу ✓
            </Txt>
          </Card>
        </g>
      )}
      {b > 0 && (
        <g transform={`translate(${cx + 330} 470) scale(${b})`}>
          <Card x={0} y={0} w={460} h={340} fill="#fff">
            <path d="M 0 -150 L 0 -40 M -40 -80 L 0 -40 L 40 -80" stroke={C.coral} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <rect x={-70} y={-30} width={140} height={20} rx={10} fill={OL} />
            <Txt x={0} y={70} size={30}>
              Napster
            </Txt>
            <Txt x={0} y={120} size={26} color={C.coralDeep} weight={700}>
              скачивают, не платят ✗
            </Txt>
          </Card>
        </g>
      )}
      {leap > 0 && (
        <g transform={`translate(${cx} 790) scale(${leap})`}>
          <Capsule x={0} y={0} w={760} h={120} text="«люди станут платить за музыку»" glow={0.5 + 0.3 * Math.sin(t * 3)} color={C.violet} size={36} />
        </g>
      )}
    </g>
  );
};

// ── «иди и посмотри сам»: маршрут через три страны ──
export const RoadTrip: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const term = pop(t, at(c, 0.2));
  const route = ramp(t, at(c, 1.1), 3.5);
  const pts: [number, number][] = [
    [-380, -120],
    [-150, -170],
    [120, -150],
    [330, -60],
    [230, 60],
    [-30, 40],
    [-200, 110],
    [-60, 190],
  ];
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  let s = route * total;
  let car: [number, number] = pts[0];
  for (let i = 0; i < seg.length; i++) {
    if (s <= seg[i]) {
      const f = s / seg[i];
      car = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
      break;
    }
    s -= seg[i];
    car = pts[i + 1];
  }
  return (
    <g>
      {term > 0 && (
        <g transform={`translate(${cx} 170) scale(${term})`}>
          <Pill x={-250} y={0} text="«генти генбуцу»" fill="#fff" size={40} />
          <Pill x={240} y={0} text="«иди и посмотри сам»" fill={C.yellow} size={40} />
        </g>
      )}
      <Pop t={t} at={at(c, 0.9)} x={cx} y={560}>
        <g>
          <rect x={-520} y={-300} width={1040} height={560} rx={40} fill="#e8f4ff" stroke={OL} strokeWidth={6} />
          {/* условные материки */}
          <path d="M -460 -230 Q -200 -290 120 -250 Q 400 -230 440 -100 Q 470 40 320 120 Q 140 200 -40 160 Q -260 250 -380 140 Q -470 40 -460 -230 Z" fill="#cfeccc" stroke={OL} strokeWidth={4} />
          <path d="M -360 -60 L 420 -60" stroke={C.grey} strokeWidth={3} strokeDasharray="10 10" />
          <path d="M -300 90 L 300 90" stroke={C.grey} strokeWidth={3} strokeDasharray="10 10" />
          <Txt x={-250} y={-100} size={26} color={C.inkSoft}>
            Канада
          </Txt>
          <Txt x={60} y={20} size={26} color={C.inkSoft}>
            США
          </Txt>
          <Txt x={-130} y={230} size={26} color={C.inkSoft}>
            Мексика
          </Txt>
          <path d={d} fill="none" stroke={C.coral} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={total} strokeDashoffset={total * (1 - route)} />
          {route > 0 && <Icon name="car" x={car[0]} y={car[1]} s={0.8} color={C.cyan} />}
        </g>
      </Pop>
      <Pop t={t} at={at(c, 1.6)} x={cx + 300} y={880}>
        <Pill x={0} y={0} text="больше 85 000 км" fill={C.goldLight} color={C.goldDeep} stroke={C.gold} size={34} />
      </Pop>
      <Badge x={cx - 300} y={880} kind="history" t={t} at={at(c, 1.05)} />
    </g>
  );
};

// ── выйти на улицу: портрет клиента из кабинета — только гипотеза ──
export const Archetype: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const out = pop(t, at(c, 0.3));
  const doc = pop(t, at(c, 1));
  const stamp = ramp(t, at(c, 1.55), 0.4);
  return (
    <g>
      {out > 0 && (
        <g transform={`translate(${cx - 330} 500) scale(${out})`}>
          <rect x={-180} y={-220} width={360} height={420} rx={20} fill="#e4e9f2" stroke={OL} strokeWidth={6} />
          <rect x={-110} y={-120} width={220} height={320} rx={10} fill="#fff8e6" stroke={OL} strokeWidth={5} />
          <path d={`M -110 -120 L ${-110 + 160} ${-100} L ${-110 + 160} 220 L -110 200 Z`} fill={C.cyan} stroke={OL} strokeWidth={5} transform={`rotate(${-20 * ramp(t, at(c, 0.5), 0.6)} -110 40)`} />
          <Txt x={0} y={-160} size={30}>
            «выйти на улицу»
          </Txt>
          {[0, 1, 2].map((i) => (
            <Person key={i} kind={(["woman", "old", "man"] as const)[i]} x={240 + i * 80} y={190} s={0.4} t={t + i} mood="happy" />
          ))}
        </g>
      )}
      {doc > 0 && (
        <g transform={`translate(${cx + 280} 470) scale(${doc})`}>
          <Paper x={0} y={0} s={0.95} rot={4} title="портрет клиента" />
          <Stamp x={0} y={40} text="ГИПОТЕЗА" k={stamp} size={52} color={C.violetDeep} rot={-14} />
        </g>
      )}
      {stamp > 0 && (
        <g transform={`translate(${cx + 280} 860)`} opacity={stamp}>
          <Pill x={0} y={0} text="а не факт" fill={C.violetLight} color={C.violetDeep} stroke={C.violet} size={34} />
        </g>
      )}
    </g>
  );
};

// ── две ловушки: прыжок вслепую и паралич анализа ──
export const TwoTraps: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const a = pop(t, at(c, 0.15));
  const b = pop(t, at(c, 0.55));
  const mid = pop(t, at(c, 1.5));
  return (
    <g>
      {a > 0 && (
        <g transform={`translate(${cx - 330} 450) scale(${a})`}>
          <Card x={0} y={0} w={470} h={430} fill={C.coralLight}>
            <Txt x={0} y={-160} size={34} color={C.coralDeep}>
              «просто сделай это»
            </Txt>
            <Icon name="rocket" x={0} y={-10} s={1.6} color={C.coral} />
            <Txt x={0} y={150} size={28} color={C.inkSoft}>
              запустить и надеяться
            </Txt>
          </Card>
        </g>
      )}
      {b > 0 && (
        <g transform={`translate(${cx + 330} 450) scale(${b})`}>
          <Card x={0} y={0} w={470} h={430} fill={C.skyLight}>
            <Txt x={0} y={-160} size={34} color={C.skyDeep}>
              «аналитический паралич»
            </Txt>
            {Array.from({ length: 7 }).map((_, i) => (
              <rect key={i} x={-110 + (i % 3) * 20} y={60 - i * 26} width={200} height={22} rx={4} fill="#fff" stroke={OL} strokeWidth={3} transform={`rotate(${(i % 2 ? 3 : -3) + wob(t, i, 1)})`} />
            ))}
            <Person kind="founder" x={150} y={100} s={0.45} t={t} mood="sad" />
            <Txt x={0} y={150} size={28} color={C.inkSoft}>
              изучать без конца
            </Txt>
          </Card>
        </g>
      )}
      {mid > 0 && (
        <g transform={`translate(${cx} 800) scale(${mid})`}>
          <Capsule x={0} y={0} w={680} h={120} text="короткий опыт с понятным вопросом" glow={0.6} color={C.teal} size={32} />
        </g>
      )}
      {mid > 0 && <Spark x={cx + 360} y={760} s={0.9} opacity={0.5 + 0.5 * Math.sin(t * 5)} />}
    </g>
  );
};

