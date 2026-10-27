// «Малые партии», «Двигатели роста», «Адаптация»: конверты, андон, иммунная система, снежный ком,
// работа по запросу гипотезы; источники роста, три механизма, один механизм, рынок вытягивает,
// механизм «Утреннего хлеба»; пять почему, цепочка опоздания, соразмерность, обучение, пять обвинений.
import React from "react";
import { C, HEAVY } from "../theme";
import { Belt, Box, Capsule, Card, Gear, OL, Person, Pill, Stamp } from "./draw";
import { Arrow, Check, Cross, Pop, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Badge, Icon, IconCard, cxOf, spread, type P } from "./parts";

// ── конверты: партиями или по одному ──
export const Envelopes: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const go = ramp(t, at(c, 1), 3);
  const oops = pop(t, at(c, 2.3));
  const N = 6;
  const stage = (u: number) => Math.min(3, Math.floor(u * 4));
  return (
    <g>
      <Pop t={t} at={at(c, 0.3)} x={cx} y={160}>
        <g>
          {["надписать", "вложить", "запечатать"].map((w, i) => (
            <Pill key={w} x={-320 + i * 320} y={0} text={w} fill="#fff" size={32} />
          ))}
        </g>
      </Pop>
      {/* партиями: каждый шаг по всей стопке */}
      <g transform={`translate(${cx - 300} 470)`}>
        <Txt x={0} y={-150} size={32} color={C.violetDeep}>
          партиями
        </Txt>
        {Array.from({ length: N }).map((_, i) => {
          const st = stage(go * 0.75);
          return (
            <g key={i} transform={`translate(${-150 + (i % 3) * 150} ${-40 + Math.floor(i / 3) * 130})`}>
              <rect x={-60} y={-40} width={120} height={80} rx={8} fill="#fff" stroke={OL} strokeWidth={4} />
              {st >= 1 && <rect x={-40} y={-20} width={60} height={10} rx={5} fill={C.inkSoft} />}
              {st >= 2 && <rect x={-10} y={-34} width={44} height={50} rx={4} fill={C.cream} stroke={OL} strokeWidth={2} opacity={0.9} />}
              {st >= 3 && <path d="M -60 -40 L 0 0 L 60 -40" fill="none" stroke={OL} strokeWidth={4} />}
            </g>
          );
        })}
      </g>
      {/* по одному: готовые конверты появляются сразу */}
      <g transform={`translate(${cx + 300} 470)`}>
        <Txt x={0} y={-150} size={32} color={C.tealDeep}>
          по одному
        </Txt>
        {Array.from({ length: N }).map((_, i) => {
          const done = clamp01(go * N * 0.9 - i);
          return (
            <g key={i} transform={`translate(${-150 + (i % 3) * 150} ${-40 + Math.floor(i / 3) * 130})`} opacity={0.25 + 0.75 * done}>
              <rect x={-60} y={-40} width={120} height={80} rx={8} fill="#fff" stroke={OL} strokeWidth={4} />
              <rect x={-40} y={-20} width={60} height={10} rx={5} fill={C.inkSoft} />
              <path d="M -60 -40 L 0 0 L 60 -40" fill="none" stroke={OL} strokeWidth={4} />
              {done >= 1 && <Check x={40} y={20} s={26} k={1} />}
            </g>
          );
        })}
      </g>
      {oops > 0 && (
        <g transform={`translate(${cx} 830) scale(${oops})`}>
          <Card x={0} y={0} w={900} h={140} fill={C.coralLight} stroke={C.coralDeep}>
            <Txt x={0} y={-8} size={32} color={C.coralDeep}>
              письмо не влезает в конверт?
            </Txt>
            <Txt x={0} y={40} size={30}>
              «мы узнаем об этом только в конце»
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── Toyota: малые партии и андон ──
export const AndonLine: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const pull = ramp(t, at(c, 0.6), 0.4);
  const stopped = pull > 0.5 && t < at(c, 1.3);
  const lt = stopped ? at(c, 0.6) + 0.2 : t;
  return (
    <g>
      <Badge x={cx} y={140} kind="history" t={t} />
      <Belt x1={cx - 560} x2={cx + 560} y={560} t={lt} />
      {Array.from({ length: 6 }).map((_, i) => {
        const x = cx - 520 + ((lt * 90 + i * 200) % 1060);
        const bad = i === 3;
        return <Box key={i} x={x} y={560} s={1} color={bad ? C.coralLight : C.kraft} bad={bad && pull > 0.5} />;
      })}
      {/* андон: лампа над линией */}
      <g transform={`translate(${cx} 300)`}>
        <rect x={-6} y={-40} width={12} height={160} fill={OL} />
        <rect x={-90} y={-110} width={180} height={80} rx={16} fill={pull > 0.5 ? (Math.sin(t * 10) > 0 ? C.yellow : C.orange) : "#fff"} stroke={OL} strokeWidth={5} />
        <Txt x={0} y={-58} size={30}>
          андон
        </Txt>
        <line x1={120} y1={-70} x2={120} y2={60 + pull * 40} stroke={C.coral} strokeWidth={6} />
        <circle cx={120} cy={70 + pull * 40} r={14} fill={C.coral} stroke={OL} strokeWidth={4} />
      </g>
      <Person kind="worker" x={cx + 230} y={760} s={0.7} t={t} mood={pull > 0.5 ? "calm" : "happy"} arm={pull > 0.5 && stopped ? "up" : "down"} />
      <Pop t={t} at={at(c, 0.7)} x={cx - 330} y={780}>
        <Pill x={0} y={0} text="позвать помощь · остановить линию" fill="#fff" size={30} />
      </Pop>
      <Pop t={t} at={at(c, 1.5)} x={cx - 330} y={870}>
        <Pill x={0} y={0} text="проблемы видны сразу" fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={32} />
      </Pop>
    </g>
  );
};

// ── непрерывное развертывание: поток мелких изменений через «иммунную систему» ──
export const ImmuneSystem: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const shield = pop(t, at(c, 0.55));
  const debate = pop(t, at(c, 1.3));
  return (
    <g>
      <Badge x={cx} y={140} kind="history" t={t} />
      <Pop t={t} at={at(c, 0.3)} x={cx} y={250}>
        <Pill x={0} y={0} text="около 50 изменений в день" fill={C.cyanLight} color={C.cyanDeep} stroke={C.cyan} size={36} />
      </Pop>
      {/* поток капсул-изменений */}
      {Array.from({ length: 9 }).map((_, i) => {
        const u = (t * 0.35 + i / 9) % 1;
        const x = cx - 560 + u * 1120;
        const bad = i % 4 === 2;
        const atShield = x > cx - 40;
        if (bad && atShield && shield > 0) {
          return (
            <g key={i} transform={`translate(${cx - 60} ${560 + (x - cx) * 0.9})`} opacity={clamp01(1 - (x - cx) / 300)}>
              <circle r={22} fill={C.coral} stroke={OL} strokeWidth={3} />
              <Cross x={0} y={0} s={24} k={1} />
            </g>
          );
        }
        return <circle key={i} cx={x} cy={560 + Math.sin(u * 8) * 10} r={22} fill={bad ? C.coral : C.teal} stroke={OL} strokeWidth={3} />;
      })}
      {shield > 0 && (
        <g transform={`translate(${cx} 560) scale(${shield})`}>
          <path d="M 0 -140 L 90 -100 Q 90 60 0 140 Q -90 60 -90 -100 Z" fill={C.cyan} fillOpacity={0.25} stroke={C.cyanDeep} strokeWidth={6} />
          <Icon name="shield" x={0} y={0} s={1.2} color={C.cyan} />
          <Txt x={0} y={200} size={28}>
            «иммунная система продукта»
          </Txt>
        </g>
      )}
      {debate > 0 && (
        <g transform={`translate(${cx} 870) scale(${debate})`}>
          <Pill x={0} y={0} text="автор: на момент книги — спорный метод" fill="#fff" color={C.inkSoft} stroke={C.grey} size={30} />
        </g>
      )}
    </g>
  );
};

// ── снежный ком больших партий ──
export const Snowball: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const roll = ramp(t, 0.3, Math.max(2, at(c, 1.5)));
  const r = 50 + 190 * roll;
  const x = cx - 480 + 760 * roll;
  return (
    <g>
      <path d={`M ${cx - 620} 380 L ${cx + 620} 820`} stroke="#dfe8f4" strokeWidth={60} strokeLinecap="round" />
      <g transform={`translate(${x} ${380 + (x - (cx - 620)) * (440 / 1240) - r * 0.6}) rotate(${roll * 720})`}>
        <circle r={r} fill="#fff" stroke={OL} strokeWidth={6} />
        {["переделки", "задержки", "страх"].map((w, i) =>
          roll > 0.25 + i * 0.2 ? (
            <g key={w} transform={`rotate(${i * 120}) translate(0 ${-r * 0.45})`}>
              <Box x={0} y={30} s={0.6 + roll * 0.4} />
            </g>
          ) : null,
        )}
      </g>
      {["переделки", "задержки", "страшнее выпускать"].map((w, i) => (
        <Pop key={w} t={t} at={spread(c, 0, i, 3, 0.4, 0.95)} x={cx - 360 + i * 360} y={200}>
          <Pill x={0} y={0} text={w} fill={C.skyLight} color={C.skyDeep} stroke={C.sky} size={30} />
        </Pop>
      ))}
    </g>
  );
};

// ── работу запрашивает гипотеза; одна улица вместо города ──
export const PullHypothesis: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const q = pop(t, at(c, 0.6));
  const pullK = ramp(t, at(c, 0.8), 1);
  const street = pop(t, at(c, 1.2));
  return (
    <g>
      {q > 0 && (
        <g transform={`translate(${cx - 330} 420) scale(${q})`}>
          <Capsule x={0} y={0} w={420} h={140} text="гипотеза о клиенте" glow={0.6 + 0.3 * Math.sin(t * 3)} color={C.violet} size={34} />
        </g>
      )}
      {pullK > 0 && (
        <g>
          <path d={`M ${cx - 110} 420 L ${cx + 120} 420`} stroke={C.violet} strokeWidth={8} strokeDasharray="14 10" strokeDashoffset={-t * 60} />
          <g transform={`translate(${cx + 260 - 60 * pullK} 420)`}>
            <Box x={0} y={50} s={1.2} label="опыт" />
          </g>
          <Txt x={cx} y={370} size={28} color={C.violetDeep}>
            «по запросу»
          </Txt>
        </g>
      )}
      {street > 0 && (
        <g transform={`translate(${cx} 730) scale(${street})`}>
          <rect x={-460} y={-110} width={920} height={220} rx={24} fill="#fff" stroke={OL} strokeWidth={5} />
          {/* город блеклый, одна улица яркая */}
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={i} x={-420 + i * 95} y={-80} width={70} height={110} rx={6} fill={i === 4 ? C.goldLight : "#e9edf3"} stroke={OL} strokeWidth={3} opacity={i === 4 ? 1 : 0.6} />
          ))}
          <rect x={-60} y={40} width={120} height={30} rx={8} fill={C.gold} />
          <Txt x={0} y={95} size={26} color={C.inkSoft}>
            одна улица и один вопрос
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── источники устойчивого роста ──
export const GrowthSources: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = [
    { icon: "chat" as const, label: "сарафанное\nрадио", color: C.pink },
    { icon: "eye" as const, label: "продукт\nна виду", color: C.cyan },
    { icon: "megaphone" as const, label: "реклама\nиз доходов", color: C.gold },
    { icon: "loop" as const, label: "повторные\nпокупки", color: C.teal },
  ];
  const chain = ramp(t, 0.3, 2);
  return (
    <g>
      {/* старые клиенты приводят новых */}
      <g transform={`translate(${cx} 330)`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const k = clamp01(chain * 5 - i);
          return (
            <g key={i} opacity={k}>
              <Icon name="person" x={-400 + i * 200} y={0} s={1} color={i === 0 ? C.gold : C.teal} />
              {i > 0 && <Arrow x1={-400 + (i - 1) * 200 + 50} y1={0} x2={-400 + i * 200 - 50} y2={0} k={k} w={6} />}
            </g>
          );
        })}
        <Txt x={0} y={-90} size={30} color={C.inkSoft}>
          новые приходят благодаря прежним
        </Txt>
      </g>
      {items.map((it, i) => (
        <IconCard key={i} x={cx - 465 + i * 310} y={640} w={280} h={250} icon={it.icon} label={it.label} k={pop(t, spread(c, 1, i, 4, 0.05, 0.85))} color={it.color} size={30} />
      ))}
    </g>
  );
};

// ── липкий механизм: ведро с притоком и утечкой ──
export const StickyEngine: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const leak = ramp(t, at(c, 1), 0.6);
  const level = 0.35 + 0.35 * ramp(t, at(c, 0.4), 1.5) - 0.3 * leak * ramp(t, at(c, 1.3), 1.5);
  return (
    <g>
      <Pop t={t} at={0.2} x={cx} y={160}>
        <Pill x={0} y={0} text="«липкий» механизм" fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={44} />
      </Pop>
      <g transform={`translate(${cx} 560)`}>
        {/* приток */}
        {Array.from({ length: 4 }).map((_, i) => {
          const y = -330 + ((t * 160 + i * 50) % 180);
          return <Icon key={i} name="person" x={-30 + (i % 2) * 60} y={y} s={0.45} color={C.cyan} />;
        })}
        <path d="M -200 -150 L 200 -150 L 160 200 L -160 200 Z" fill="#fff" stroke={OL} strokeWidth={6} />
        <path d={`M ${-200 + 40 * (1 - level)} ${200 - 350 * level} L ${200 - 40 * (1 - level)} ${200 - 350 * level} L 160 200 L -160 200 Z`} fill={C.teal} opacity={0.7} />
        {/* утечка */}
        {leak > 0 &&
          Array.from({ length: 4 }).map((_, i) => {
            const u = (t * 0.8 + i / 4) % 1;
            return <Icon key={i} name="person" x={180 + u * 160} y={160 + u * 120} s={0.4} color={C.coral} />;
          })}
        {leak > 0 && <circle cx={160} cy={160} r={14} fill={OL} />}
        <Txt x={-330} y={-200} size={28} color={C.cyanDeep}>
          привлечение
        </Txt>
        <Txt x={360} y={320} size={28} color={C.coralDeep}>
          коэффициент потери
        </Txt>
      </g>
      <Pop t={t} at={at(c, 1.6)} x={cx} y={940}>
        <Pill x={0} y={0} text="рост = приток больше утечки" fill={C.yellow} size={32} />
      </Pop>
    </g>
  );
};

// ── вирусный механизм: каждое письмо несёт приглашение ──
export const ViralEngine: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const gen = ramp(t, at(c, 2), 2.2);
  const levels = [1, 2, 4, 8];
  return (
    <g>
      <Pop t={t} at={0.2} x={cx} y={160}>
        <Pill x={0} y={0} text="вирусный механизм" fill={C.pinkLight} color={C.coralDeep} stroke={C.pink} size={44} />
      </Pop>
      <Pop t={t} at={at(c, 1.2)} x={cx - 260} y={430}>
        <g>
          <rect x={-240} y={-140} width={480} height={280} rx={16} fill="#fff" stroke={OL} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-200} y={-100 + i * 36} width={i === 2 ? 220 : 380} height={18} rx={9} fill={C.greyLight} />
          ))}
          <rect x={-210} y={30} width={420} height={80} rx={10} fill={C.yellow} stroke={OL} strokeWidth={3} />
          <Txt x={0} y={64} size={22}>
            Заведите бесплатную электронную
          </Txt>
          <Txt x={0} y={94} size={22}>
            почту на Hotmail
          </Txt>
        </g>
      </Pop>
      <Badge x={cx - 260} y={630} kind="history" t={t} at={at(c, 1.1)} />
      {/* дерево приглашений */}
      <g transform={`translate(${cx + 330} 300)`}>
        {levels.map((n, li) => {
          const k = clamp01(gen * 4 - li);
          return Array.from({ length: n }).map((_, j) => {
            const pos = (lv: number, idx: number) => (idx - (2 ** lv - 1) / 2) * (520 / 2 ** lv);
            const x = pos(li, j);
            const y = li * 150;
            const px = li > 0 ? pos(li - 1, Math.floor(j / 2)) : 0;
            return (
              <g key={`${li}-${j}`} opacity={k}>
                {li > 0 && <line x1={px} y1={y - 150 + 30} x2={x} y2={y - 30} stroke={C.pink} strokeWidth={4} />}
                <Icon name="person" x={x} y={y} s={0.6} color={li === 0 ? C.gold : C.pink} />
              </g>
            );
          });
        })}
      </g>
      <Pop t={t} at={at(c, 2.6)} x={cx + 330} y={880}>
        <Pill x={0} y={0} text="больше одного нового на клиента" fill={C.yellow} size={30} />
      </Pop>
    </g>
  );
};

// ── оплаченный механизм: ценность клиента против стоимости привлечения ──
export const PaidEngine: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, at(c, 0.4));
  const tilt = ramp(t, at(c, 0.7), 0.8);
  const rise = ramp(t, at(c, 1.2), 1.5);
  const ang = -10 * tilt + 18 * rise;
  return (
    <g>
      <Pop t={t} at={0.2} x={cx} y={160}>
        <Pill x={0} y={0} text="оплаченный механизм" fill={C.goldLight} color={C.goldDeep} stroke={C.gold} size={44} />
      </Pop>
      {k > 0 && (
        <g transform={`translate(${cx} 560) scale(${k})`}>
          <path d="M -40 280 L 40 280 L 14 -20 L -14 -20 Z" fill={C.grey} stroke={OL} strokeWidth={5} />
          <g transform={`rotate(${ang})`}>
            <rect x={-400} y={-40} width={800} height={20} rx={10} fill={OL} />
            <g transform="translate(-360 -30)">
              <path d="M -120 120 Q 0 180 120 120 Z" fill={C.mintLight} stroke={OL} strokeWidth={5} />
              <path d="M 0 0 L -50 120 M 0 0 L 50 120" stroke={OL} strokeWidth={4} />
              <Icon name="person" x={0} y={80} s={0.8} color={C.mint} />
              <Txt x={0} y={230} size={26} color={C.mintDeep}>
                ценность клиента
              </Txt>
            </g>
            <g transform="translate(360 -30)">
              <path d="M -120 120 Q 0 180 120 120 Z" fill={C.coralLight} stroke={OL} strokeWidth={5} />
              <path d="M 0 0 L -50 120 M 0 0 L 50 120" stroke={OL} strokeWidth={4} />
              <Icon name="megaphone" x={0} y={80} s={0.8} color={C.coral} />
              <Txt x={0} y={230} size={26} color={C.coralDeep}>
                стоимость привлечения
              </Txt>
            </g>
          </g>
          <circle cy={-30} r={18} fill={C.gold} stroke={OL} strokeWidth={4} />
        </g>
      )}
      {rise > 0 && (
        <g transform={`translate(${cx + 300} 300)`} opacity={rise}>
          {[0, 1, 2].map((i) => (
            <Icon key={i} name="megaphone" x={i * 70 - 70} y={-((t * 30 + i * 20) % 40)} s={0.5} color={C.orange} />
          ))}
          <Txt x={0} y={80} size={26} color={C.coralDeep}>
            конкуренты тоже платят
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── один механизм — и он устаёт ──
export const OneEngine: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const tired = ramp(t, at(c, 1.1), 1.2);
  const engines = [
    { label: "липкий", color: C.teal },
    { label: "вирусный", color: C.pink },
    { label: "оплаченный", color: C.gold },
  ];
  return (
    <g>
      {engines.map((e, i) => {
        const focus = i === 0;
        const k = pop(t, 0.2 + i * 0.15);
        const rot = focus ? t * 60 * (1 - tired * 0.85) : 0;
        return (
          <g key={e.label} opacity={clamp01(k * 1.4) * (focus ? 1 : 0.35)} transform={`translate(${cx - 360 + i * 360} ${focus ? 470 : 500}) scale(${focus ? 1.2 : 0.8})`}>
            <Gear x={0} y={0} r={90} rot={rot} color={e.color} />
            <Txt x={0} y={170} size={32}>
              {e.label}
            </Txt>
          </g>
        );
      })}
      <Pop t={t} at={at(c, 0.4)} x={cx} y={180}>
        <Pill x={0} y={0} text="фокус на одном механизме" fill={C.yellow} size={40} />
      </Pop>
      {tired > 0 && (
        <g opacity={tired}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={cx - 360 + 60 + i * 30} cy={330 - ((t * 40 + i * 20) % 80)} r={10 + i * 4} fill={C.grey} opacity={0.5} />
          ))}
          <Pill x={cx} y={830} text="рано или поздно выдыхается → учиться дальше" fill="#fff" color={C.inkSoft} stroke={C.grey} size={30} />
        </g>
      )}
    </g>
  );
};

// ── соответствие продукт/рынок: рынок вытягивает продукт ──
export const MarketPull: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const pull = ramp(t, at(c, 0.6), 1.4);
  const ask = pop(t, at(c, 1.4));
  return (
    <g>
      <Pop t={t} at={at(c, 0.4)} x={cx} y={170}>
        <Pill x={0} y={0} text="«соответствие продукт/рынок»" fill={C.cyanLight} color={C.cyanDeep} stroke={C.cyan} size={42} />
      </Pop>
      {/* магнит-рынок */}
      <g transform={`translate(${cx + 330} 500)`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Icon key={i} name="person" x={-90 + (i % 4) * 60} y={-120 + Math.floor(i / 4) * 90} s={0.55} color={C.teal} />
        ))}
        <Txt x={0} y={190} size={30}>
          хороший рынок
        </Txt>
      </g>
      <g transform={`translate(${cx - 330 + 380 * pull} 500)`}>
        <Box x={0} y={60} s={1.6} />
        <Txt x={0} y={110} size={28}>
          продукт
        </Txt>
        {pull > 0 && pull < 1 && [0, 1, 2].map((i) => <line key={i} x1={80} y1={-20 + i * 30} x2={130 + i * 10} y2={-20 + i * 30} stroke={C.cyan} strokeWidth={5} />)}
      </g>
      {ask > 0 && (
        <g transform={`translate(${cx} 850) scale(${ask})`}>
          <Pill x={0} y={0} text="спрашиваете? значит, ещё нет" fill={C.yellow} size={36} />
        </g>
      )}
    </g>
  );
};

// ── учебный пример: механизм «Утреннего хлеба» — возвраты, а не листовки ──
export const BreadEngine: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const flyers = pop(t, at(c, 1.05));
  const back = pop(t, at(c, 1.4));
  return (
    <g>
      <Badge x={cx} y={150} kind="study" t={t} />
      <Pop t={t} at={at(c, 0.3)} x={cx} y={330}>
        <g>
          <Gear x={-80} y={0} r={80} rot={t * 50} color={C.teal} />
          <Icon name="bread" x={110} y={0} s={1.5} />
          <Txt x={0} y={150} size={32}>
            липкий: хлеб нужен каждый день
          </Txt>
        </g>
      </Pop>
      {flyers > 0 && (
        <g transform={`translate(${cx - 300} 700) scale(${flyers})`} opacity={1 - back * 0.5}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-80 + i * 14} y={-60 - i * 10} width={130} height={100} rx={8} fill="#fff" stroke={OL} strokeWidth={3} transform={`rotate(${-8 + i * 5})`} />
          ))}
          <Txt x={0} y={100} size={28} color={C.inkSoft}>
            розданные листовки
          </Txt>
          <Cross x={40} y={-20} s={90} k={ramp(t, at(c, 1.3), 0.4)} />
        </g>
      )}
      {back > 0 && (
        <g transform={`translate(${cx + 300} 700) scale(${back})`}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${-90 + i * 90} 0)`}>
              <Icon name="person" x={0} y={-10} s={0.8} color={C.teal} />
              <path d="M -30 40 A 30 30 0 1 0 30 40" stroke={C.tealDeep} strokeWidth={5} fill="none" />
            </g>
          ))}
          <Txt x={0} y={100} size={28} color={C.tealDeep}>
            вернувшиеся покупатели
          </Txt>
          <Check x={140} y={-80} s={44} k={ramp(t, at(c, 1.5), 0.4)} />
        </g>
      )}
    </g>
  );
};

// ── пять почему: лестница вниз к причине в процессе ──
export const FiveWhys: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const steps = 5;
  return (
    <g>
      <Pop t={t} at={at(c, 0.6)} x={cx} y={160}>
        <Pill x={0} y={0} text="«Пять почему» · Тайити Оно, Toyota" fill="#fff" size={38} />
      </Pop>
      {Array.from({ length: steps }).map((_, i) => {
        const k = pop(t, spread(c, 1, i, steps, 0.15, 0.75));
        const x = cx - 440 + i * 200;
        const y = 300 + i * 105;
        return k > 0 ? (
          <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
            <rect x={-90} y={-38} width={180} height={76} rx={38} fill={i === steps - 1 ? C.teal : C.cyanLight} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={12} size={30} color={i === steps - 1 ? "#fff" : OL}>
              почему?
            </Txt>
            {i < steps - 1 && <Arrow x1={60} y1={42} x2={130} y2={74} k={1} w={6} />}
          </g>
        ) : null;
      })}
      <Pop t={t} at={at(c, 1.8)} x={cx - 250} y={760}>
        <g>
          <Pill x={0} y={-60} text="причина в процессе ✓" fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={30} />
          <Pill x={0} y={30} text="не виноватый ✗" fill={C.coralLight} color={C.coralDeep} stroke={C.coral} size={30} />
        </g>
      </Pop>
    </g>
  );
};

// ── учебная цепочка: почему хлеб опоздал ──
export const WhyChain: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const rows = [
    { q: "хлеб привезли поздно", icon: "bread" as const },
    { q: "курьер выехал поздно", icon: "truck" as const },
    { q: "заказы шли до утра", icon: "phone" as const },
    { q: "нет времени закрытия приёма", icon: "clock" as const },
  ];
  const human = pop(t, at(c, 1.4));
  return (
    <g>
      <Badge x={cx} y={140} kind="study" t={t} />
      {rows.map((r, i) => {
        const k = pop(t, spread(c, 0, i, 4, 0.05, 0.85));
        const y = 250 + i * 135;
        const root = i === 3;
        return k > 0 ? (
          <g key={i} transform={`translate(${cx - 120} ${y}) scale(${k})`}>
            <rect x={-330} y={-50} width={660} height={100} rx={24} fill={root ? C.goldLight : "#fff"} stroke={root ? C.goldDeep : OL} strokeWidth={root ? 6 : 4} />
            <Icon name={r.icon} x={-270} y={0} s={0.7} color={root ? C.gold : C.cyan} />
            <Txt x={30} y={12} size={32}>
              {r.q}
            </Txt>
            {i > 0 && (
              <text x={-370} y={14} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={32} fill={C.cyanDeep}>
                почему?
              </text>
            )}
          </g>
        ) : null;
      })}
      {human > 0 && (
        <g transform={`translate(${cx + 400} 700) scale(${human})`}>
          <Icon name="people" x={0} y={-30} s={1.4} color={C.gold} />
          <Txt x={0} y={70} size={28}>
            организация,
          </Txt>
          <Txt x={0} y={106} size={28}>
            а не «железо»
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── соразмерные инвестиции: маленькая проблема — маленький ремонт ──
export const Proportional: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const pairs = [
    { s: 0.6, label: "мелочь", fix: "мелкая правка" },
    { s: 1, label: "заметно", fix: "серьёзнее" },
    { s: 1.4, label: "серьёзно", fix: "большое вложение" },
  ];
  const gauge = ramp(t, at(c, 1), 0.8);
  return (
    <g>
      <Pop t={t} at={at(c, 0.3)} x={cx} y={160}>
        <Pill x={0} y={0} text="соразмерные инвестиции" fill={C.goldLight} color={C.goldDeep} stroke={C.gold} size={42} />
      </Pop>
      {pairs.map((p, i) => {
        const k = pop(t, spread(c, 0, i, 3, 0.45, 0.95));
        const x = cx - 380 + i * 380;
        return k > 0 ? (
          <g key={i} transform={`translate(${x} 450) scale(${k})`}>
            <Icon name="warn" x={0} y={-30} s={p.s} />
            <Txt x={0} y={90} size={28}>
              {p.label}
            </Txt>
            <Arrow x1={0} y1={120} x2={0} y2={190} k={1} w={6} />
            <g transform={`translate(0 260) scale(${p.s})`}>
              <Icon name="gear" x={0} y={0} s={0.8} color={C.teal} />
            </g>
            <Txt x={0} y={360} size={26} color={C.tealDeep}>
              {p.fix}
            </Txt>
          </g>
        ) : null;
      })}
      {gauge > 0 && (
        <g transform={`translate(${cx} 900)`} opacity={gauge}>
          <Pill x={0} y={0} text="естественный регулятор скорости" fill={C.yellow} size={32} />
        </g>
      )}
    </g>
  );
};

// ── адаптивная организация: новичок в первый день ──
export const Onboarding: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, at(c, 0.3));
  const day1 = ramp(t, at(c, 0.7), 1);
  const adapt = pop(t, at(c, 1.2));
  return (
    <g>
      <Badge x={cx} y={140} kind="history" t={t} />
      {k > 0 && (
        <g transform={`translate(${cx - 220} 520) scale(${k})`}>
          <rect x={-300} y={-200} width={600} height={380} rx={22} fill="#fff" stroke={OL} strokeWidth={5} />
          <Person kind="boss" x={-140} y={150} s={0.7} t={t} mood="happy" arm="point" />
          <Person kind="kid2" x={120} y={150} s={0.62} t={t + 1} mood={day1 > 0.6 ? "happy" : "calm"} />
          <Pill x={120} y={-140} text="первый день" fill={C.goldLight} color={C.goldDeep} stroke={C.gold} size={28} />
          {day1 > 0.5 && (
            <g transform="translate(120 -60)">
              <Box x={0} y={40} s={0.8} label="код" />
              <Check x={60} y={-10} s={30} k={ramp(t, at(c, 1), 0.3)} />
            </g>
          )}
        </g>
      )}
      {adapt > 0 && (
        <g transform={`translate(${cx + 330} 520) scale(${adapt})`}>
          <Gear x={0} y={-60} r={90} rot={t * 40} color={C.cyan} />
          <path d="M -150 -60 A 150 150 0 1 1 -110 40" stroke={C.cyanDeep} strokeWidth={8} fill="none" />
          <Txt x={0} y={170} size={28}>
            процессы сами
          </Txt>
          <Txt x={0} y={206} size={28}>
            подстраиваются
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── пять обвинений против двух правил ──
export const FiveBlames: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const blame = pop(t, at(c, 0.4));
  const rule1 = pop(t, at(c, 1.25));
  const rule2 = pop(t, at(c, 1.7));
  return (
    <g>
      {blame > 0 && (
        <g transform={`translate(${cx - 330} 450) scale(${blame})`}>
          <Card x={0} y={0} w={460} h={440} fill={C.coralLight}>
            <Txt x={0} y={-170} size={32} color={C.coralDeep}>
              «Пять обвинений»
            </Txt>
            <Person kind="man" x={0} y={150} s={0.7} t={t} mood="sad" />
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (-150 + i * 30) * (Math.PI / 180);
              return (
                <g key={i} transform={`translate(${Math.cos(a) * 190} ${40 + Math.sin(a) * 150}) rotate(${(a * 180) / Math.PI + 180})`}>
                  <path d="M 0 0 L 60 0" stroke={C.coralDeep} strokeWidth={8} strokeLinecap="round" />
                  <path d="M 60 0 L 46 -10 M 60 0 L 46 10" stroke={C.coralDeep} strokeWidth={6} strokeLinecap="round" />
                </g>
              );
            })}
            <Stamp x={0} y={-90} text="НЕТ" k={ramp(t, at(c, 0.9), 0.4)} size={44} />
          </Card>
        </g>
      )}
      {rule1 > 0 && (
        <g transform={`translate(${cx + 300} 360) scale(${rule1})`}>
          <Card x={0} y={0} w={520} h={190} fill={C.tealLight} stroke={C.teal}>
            <Txt x={0} y={-30} size={28} color={C.tealDeep}>
              «Будьте терпимы к ошибкам,
            </Txt>
            <Txt x={0} y={14} size={28} color={C.tealDeep}>
              которые возникли впервые»
            </Txt>
          </Card>
        </g>
      )}
      {rule2 > 0 && (
        <g transform={`translate(${cx + 300} 610) scale(${rule2})`}>
          <Card x={0} y={0} w={520} h={190} fill={C.goldLight} stroke={C.gold}>
            <Txt x={0} y={-30} size={28} color={C.goldDeep}>
              «Не позволяйте, чтобы одна и та же
            </Txt>
            <Txt x={0} y={14} size={28} color={C.goldDeep}>
              ошибка повторялась дважды»
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

