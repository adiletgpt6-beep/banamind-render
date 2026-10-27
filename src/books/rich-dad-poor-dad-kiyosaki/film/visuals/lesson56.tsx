// Уроки 5 и 6: две телепередачи, «больше вариантов» (развилки и светофоры), сделки автора
// с оговорками, два типа инвесторов, посев; блокнот журналистки, стопка навыков,
// вопрос про гамбургер, опыт без частой смены работы, «отдай — и получишь».
import React from "react";
import { C } from "../theme";
import { cxOf } from "./intro";
import { Bubble, Card, Coin, Flow, House, OL, Person, Pill, RiskMeter, Spark, Stamp } from "./draw";
import { Check, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

type P = { host?: string; [k: string]: unknown };

const Tv: React.FC<{ x: number; y: number; k: number; children: React.ReactNode; label: string; col: string }> = ({ x, y, k, children, label, col }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-250} y={-180} width={500} height={340} rx={30} fill="#2b3a67" stroke={OL} strokeWidth={7} />
    <rect x={-220} y={-150} width={440} height={260} rx={16} fill="#eef6ff" />
    {children}
    <line x1={-80} y1={160} x2={-120} y2={210} stroke={OL} strokeWidth={8} />
    <line x1={80} y1={160} x2={120} y2={210} stroke={OL} strokeWidth={8} />
    <Pill x={0} y={-215} text={label} fill="#fff" stroke={col} size={28} />
  </g>
);

// ── две телепередачи: патент Белла и сокращённый менеджер ──
export const TwoScreens: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const a = pop(t, at(c, 0.1));
  const b = pop(t, at(c, 1));
  const msg = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      {a > 0 && (
        <Tv x={cx - 290} y={400} k={a} label="передача 1" col={C.mint}>
          {/* старый телефон и патент, смех */}
          <g transform="translate(-90 0)">
            <rect x={-50} y={-20} width={100} height={80} rx={10} fill="#5a3a22" stroke={OL} strokeWidth={4} />
            <path d="M -60 -30 Q 0 -80 60 -30" stroke={OL} strokeWidth={14} fill="none" strokeLinecap="round" />
          </g>
          <g transform={`translate(90 -10) rotate(${wob(t, 1, 4)})`}>
            <rect x={-60} y={-70} width={120} height={150} rx={6} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-30} size={22} weight={900}>
              патент
            </Txt>
            <Txt x={0} y={30} size={30} weight={900} color={C.coralDeep}>
              ха-ха
            </Txt>
          </g>
        </Tv>
      )}
      {b > 0 && (
        <Tv x={cx + 290} y={400} k={b} label="передача 2" col={C.coral}>
          <rect x={-200} y={-130} width={140} height={220} fill="#c9d0de" stroke={OL} strokeWidth={4} />
          <Txt x={-130} y={-90} size={20} weight={900}>
            ЗАВОД
          </Txt>
          <Person kind="man" x={40} y={95} s={0.6} t={t} mood="sad" arm="out" />
          <Person kind="worker" x={150} y={95} s={0.6} t={t} mood="calm" color="#3b4566" />
        </Tv>
      )}
      {msg > 0 && (
        <g opacity={msg}>
          <Pill x={cx} y={760} text="перемены приходят ко всем" fill={C.yellow} size={38} />
          <Pill x={cx - 260} y={850} text="страх" fill={C.coralLight} color={C.coralDeep} stroke={C.coral} size={30} />
          <Pill x={cx + 260} y={850} text="готовность учиться" fill={C.mintLight} color={C.mintDeep} stroke={C.mint} size={30} />
        </g>
      )}
    </g>
  );
};

// ── больше вариантов: один путь → много дорог; светофоры ──
export const OptionsLens: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const q = pop(t, 0.2);
  const one = ramp(t, at(c, 1), 0.6);
  const many = ramp(t, at(c, 1.6), 1);
  const lights = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      {q > 0 && (
        <g transform={`translate(${cx} 160) scale(${q})`}>
          <Card x={0} y={0} w={980} h={150} fill="#fff">
            <Txt x={0} y={-6} size={36} weight={900}>
              {"«Финансовый интеллект – это просто\nумение видеть больше разных вариантов»"}
            </Txt>
          </Card>
        </g>
      )}
      {one > 0 && (
        <g opacity={one * (1 - lights * 0.8)}>
          <Coin x={cx - 420} y={480} r={46} spin={t * 3} face />
          <Flow pts={[[cx - 360, 480], [cx + 420, 480]]} t={t} color={C.grey} w={12} n={3} />
          <Pill x={cx + 40} y={420} text="работать · копить · кредит" fill="#fff" stroke={C.grey} size={28} />
          {many > 0 &&
            [-2, -1, 1, 2].map((j, i) => (
              <Flow key={j} pts={[[cx - 300, 480], [cx - 100, 480 + j * 90], [cx + 420, 480 + j * 90]]} t={t} k={clamp01(many * 1.5 - i * 0.15)} color={[C.mint, C.sky, C.violet, C.orange][i]} w={10} n={3} />
            ))}
        </g>
      )}
      {lights > 0 && (
        <g opacity={lights}>
          {/* дорога со светофорами вдаль */}
          <path d={`M ${cx - 520} 820 L ${cx - 40} 560 L ${cx + 40} 560 L ${cx + 520} 820 Z`} fill="#d7d9de" />
          {[0, 1, 2, 3, 4].map((i) => {
            const s = 1 - i * 0.17;
            const x = cx + 300 * s - 40;
            const y = 800 - i * 52;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
                <rect x={-4} y={-150} width={8} height={150} fill={OL} />
                <rect x={-26} y={-230} width={52} height={110} rx={10} fill="#2b2b2b" />
                <circle cx={0} cy={-210} r={13} fill={(t * 2 + i) % 3 < 1 ? C.red : "#553"} />
                <circle cx={0} cy={-175} r={13} fill={(t * 2 + i) % 3 >= 1 && (t * 2 + i) % 3 < 2 ? C.yellow : "#553"} />
                <circle cx={0} cy={-140} r={13} fill={(t * 2 + i) % 3 >= 2 ? C.green : "#353"} />
              </g>
            );
          })}
          <g transform={`translate(${cx - 230} 790)`}>
            <path d="M -90 -20 L -70 -60 L 60 -60 L 90 -20 L 90 10 L -90 10 Z" fill={C.sky} stroke={OL} strokeWidth={5} />
            <circle cx={-50} cy={12} r={18} fill="#3b4566" />
            <circle cx={50} cy={12} r={18} fill="#3b4566" />
          </g>
          <Pill x={cx - 230} y={670} text="ждать все зелёные?" fill="#fff" size={28} />
        </g>
      )}
    </g>
  );
};

// ── сделки автора с оговорками: вся картина ──
export const DealCaution: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const house = pop(t, 0.2);
  const parts = ["займы", "долговые расписки", "чужие тяжёлые обстоятельства", "рынок изменился"];
  const quote = pop(t, at(c, 2));
  const idea = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      <g transform={`translate(${cx - 330} 600) scale(${house})`}>
        <House x={0} y={0} label="Финикс, начало 90-х" />
        <g transform="translate(140 -260)">
          <rect x={-70} y={-30} width={140} height={60} rx={8} fill={C.coralLight} stroke={C.coral} strokeWidth={4} />
          <Txt x={0} y={10} size={24} weight={900} color={C.coralDeep}>
            банкротство
          </Txt>
        </g>
      </g>
      {parts.map((s, i) => (
        <Pop key={s} t={t} at={at(c, 1) + i * 0.3} x={cx + 250} y={250 + i * 90}>
          <Pill x={0} y={0} text={s} fill={i === 3 ? C.orangeLight : "#fff"} stroke={C.orange} color={OL} size={28} />
        </Pop>
      ))}
      <RiskMeter x={cx + 250} y={690} level={0.85} k={ramp(t, at(c, 1.5), 0.6)} s={0.9} />
      {quote > 0 && (
        <g transform={`translate(${cx} 160) scale(${quote})`}>
          <Card x={0} y={0} w={920} h={110} fill={C.yellow}>
            <Txt x={0} y={14} size={34} weight={900}>
              «Я никому не советую заниматься тем, чем занимаюсь я»
            </Txt>
          </Card>
        </g>
      )}
      {idea > 0 && <Stamp x={cx - 300} y={830} text="ИЛЛЮСТРАЦИЯ, НЕ РЕЦЕПТ" k={idea} color={C.skyDeep} size={30} rot={-4} />}
    </g>
  );
};

// ── два типа инвесторов: компьютер с полки vs из деталей ──
export const InvestorTypes: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const a = pop(t, at(c, 0.1));
  const b = pop(t, at(c, 1));
  const assemble = ramp(t, at(c, 1.2), 1.4);
  const advice = ramp(t, at(c, 2), 0.5);
  const q = pop(t, at(c, 3));
  const Pc: React.FC<{ s?: number }> = ({ s = 1 }) => (
    <g transform={`scale(${s})`}>
      <rect x={-90} y={-80} width={180} height={120} rx={10} fill="#2b3a67" stroke={OL} strokeWidth={5} />
      <rect x={-76} y={-66} width={152} height={92} rx={6} fill={C.skyLight} />
      <rect x={-20} y={40} width={40} height={30} fill="#9aa3b5" />
      <rect x={-60} y={70} width={120} height={12} rx={6} fill="#9aa3b5" />
    </g>
  );
  return (
    <g>
      {a > 0 && (
        <g transform={`translate(${cx - 280} 430) scale(${a})`}>
          <Card x={0} y={0} w={440} h={420} fill="#fff" stroke={C.sky}>
            <rect x={-170} y={60} width={340} height={14} fill="#c98b4a" />
            <g transform="translate(0 -20)">
              <rect x={-120} y={-100} width={240} height={180} rx={12} fill="#e8eef9" stroke={OL} strokeWidth={4} />
              <Pc s={0.9} />
            </g>
            <Txt x={0} y={130} size={30} weight={900} color={C.skyDeep}>
              1 · готовый продукт
            </Txt>
          </Card>
          {advice > 0 && <Check x={170} y={-170} s={50} k={advice} />}
        </g>
      )}
      {b > 0 && (
        <g transform={`translate(${cx + 280} 430) scale(${b})`}>
          <Card x={0} y={0} w={440} h={420} fill="#fff" stroke={C.violet}>
            <g transform="translate(0 -30)">
              {[
                [-120, -110],
                [110, -100],
                [-110, 60],
                [120, 70],
              ].map(([x, y], i) => (
                <rect key={i} x={x * (1 - assemble) - 24} y={y * (1 - assemble) - 18} width={48} height={36} rx={6} fill={[C.mint, C.orange, C.sky, C.coral][i]} stroke={OL} strokeWidth={3} transform={`rotate(${(1 - assemble) * (i * 40 - 60)} ${x * (1 - assemble)} ${y * (1 - assemble)})`} />
              ))}
              {assemble > 0.95 && <Pc s={0.9} />}
            </g>
            <Txt x={0} y={130} size={30} weight={900} color={C.violet}>
              2 · сборка сделки
            </Txt>
          </Card>
          <RiskMeter x={150} y={-140} level={0.85} k={assemble} s={0.6} />
        </g>
      )}
      {q > 0 && (
        <g transform={`translate(${cx} 780) scale(${q})`}>
          <Card x={0} y={0} w={900} h={110} fill={C.yellow}>
            <Txt x={0} y={14} size={34} weight={900}>
              «то, чего вы не знаете, – это ваш самый большой риск»
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── посев: одни прорастают, другие нет; падения ──
export const Seeds: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const grow = ramp(t, at(c, 0.4), 2);
  const fall = ramp(t, at(c, 1), 0.6);
  const sprout = [1, 0, 1, 1, 0, 0, 1];
  return (
    <g>
      <rect x={cx - 520} y={620} width={1040} height={90} rx={30} fill="#a88a63" stroke={OL} strokeWidth={5} />
      {sprout.map((ok, i) => {
        const x = cx - 450 + i * 150;
        const h = ok ? 40 + 180 * grow * (0.7 + 0.3 * ((i * 7) % 3) / 2) : 0;
        return (
          <g key={i}>
            <ellipse cx={x} cy={630} rx={16} ry={10} fill="#5a3a22" />
            {ok ? (
              <g>
                <path d={`M ${x} 630 L ${x} ${630 - h}`} stroke={C.green} strokeWidth={10} strokeLinecap="round" />
                <path d={`M ${x} ${640 - h * 0.6} q -50 -30 -70 0 q 30 20 70 0`} fill={C.mint} stroke={OL} strokeWidth={3} opacity={grow} />
                {grow > 0.7 && <Coin x={x} y={612 - h} r={26} spin={t * 3 + i} />}
              </g>
            ) : (
              grow > 0.6 && <Txt x={x} y={600} size={30} color={C.grey}>
                ·
              </Txt>
            )}
          </g>
        );
      })}
      <Pill x={cx} y={190} text="«Одни из них прорастают, другие нет»" fill="#fff" size={34} />
      {fall > 0 && (
        <g opacity={fall}>
          <Card x={cx} y={830} w={980} h={110} fill={C.mintLight} stroke={C.mint}>
            <Txt x={0} y={14} size={32} weight={900} color={C.mintDeep}>
              «Люди, избегающие неудач, избегают и успехов»
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── блокнот журналистки: «автор бестселлеров» ──
export const Notebook: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.1);
  const offended = ramp(t, at(c, 1), 0.5);
  const note = pop(t, at(c, 2.2));
  const skill = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      <Person kind="woman" x={cx - 380} y={760} s={1} t={t} mood={offended > 0.5 && note < 0.5 ? "angry" : note > 0.5 ? "shock" : "calm"} />
      {offended > 0 && note <= 0 && (
        <g transform={`translate(${cx - 220} 330) scale(${offended})`}>
          <Bubble x={0} y={0} w={420} h={110} text="Я магистр литературы!" size={30} fill={C.coralLight} tail="left" />
        </g>
      )}
      {/* блокнот */}
      <g transform={`translate(${cx + 170} 470) rotate(${-4 + wob(t, 2, 1)}) scale(${k})`}>
        <rect x={-260} y={-230} width={520} height={460} rx={16} fill="#fffbe6" stroke={OL} strokeWidth={6} />
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1={-230} y1={-150 + i * 50} x2={230} y2={-150 + i * 50} stroke={C.skyLight} strokeWidth={4} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <circle key={i} cx={-200 + i * 80} cy={-228} r={12} fill="none" stroke={OL} strokeWidth={5} />
        ))}
        <Txt x={0} y={-110} size={34} weight={900} color={C.inkSoft}>
          Р. Кийосаки —
        </Txt>
        {note > 0 && (
          <g transform={`scale(${note})`}>
            <rect x={-220} y={-60} width={440} height={80} rx={12} fill={C.yellow} opacity={0.7} />
            <Txt x={0} y={-6} size={42} weight={900}>
              автор бестселлеров
            </Txt>
            <Txt x={0} y={90} size={32} color={C.grey}>
              не «лучший писатель»
            </Txt>
          </g>
        )}
      </g>
      {skill > 0 && (
        <g opacity={skill}>
          <Pill x={cx + 170} y={810} text="+1 навык: продажи" fill={C.mintLight} color={C.mintDeep} stroke={C.mint} size={36} />
        </g>
      )}
    </g>
  );
};

// ── стопка навыков ──
export const SkillsStack: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const skills = [
    { s: "учёт", col: C.sky },
    { s: "продажи", col: C.coral },
    { s: "управление", col: C.violet },
    { s: "переговоры", col: C.orange },
  ];
  const door = ramp(t, at(c, 1), 0.6);
  const knocks = Math.floor(clamp01(ramp(t, at(c, 1.2), 2.5)) * 5);
  const mgmt = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      {skills.map((sk, i) => {
        const k = pop(t, at(c, 0.2) + i * 0.3);
        return (
          <g key={sk.s} transform={`translate(${cx - 330} ${760 - i * 110}) scale(${k})`}>
            <rect x={-170} y={-50} width={340} height={100} rx={18} fill={sk.col} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={14} size={38} weight={900} color="#fff">
              {sk.s}
            </Txt>
          </g>
        );
      })}
      {door > 0 && (
        <g opacity={door * (1 - mgmt)} transform={`translate(${cx + 230} 0)`}>
          <rect x={-110} y={330} width={220} height={400} rx={12} fill="#b97a45" stroke={OL} strokeWidth={6} />
          <circle cx={70} cy={540} r={12} fill={C.gold} />
          <Person kind="man" x={-220} y={730} s={0.9} t={t} mood={knocks > 3 ? "happy" : "calm"} arm="point" />
          {Array.from({ length: knocks }).map((_, i) => (
            <Txt key={i} x={-40 + (i % 2) * 40} y={380 + i * 40} size={26} color={C.inkSoft} weight={900}>
              тук
            </Txt>
          ))}
          <Pill x={0} y={290} text="Xerox · продажи" fill="#fff" size={28} />
        </g>
      )}
      {mgmt > 0 && (
        <g opacity={mgmt}>
          {["денежный поток", "системы", "люди"].map((s, i) => (
            <Pill key={s} x={cx + 230} y={300 + i * 90} text={s} fill="#fff" stroke={C.violet} size={32} />
          ))}
          <Pill x={cx + 230} y={600} text="важнее всего: продажи и общение" fill={C.yellow} size={28} />
        </g>
      )}
    </g>
  );
};

// ── вопрос про гамбургер: лес рук vs система ──
export const BurgerQuestion: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const hands = ramp(t, at(c, 0.6), 0.8);
  const sys = ramp(t, at(c, 1), 0.7);
  const quote = pop(t, at(c, 1.5));
  return (
    <g>
      {/* зал */}
      {Array.from({ length: 10 }).map((_, i) => {
        const x = cx - 470 + (i % 5) * 120 + (i >= 5 ? 60 : 0);
        const y = i >= 5 ? 800 : 700;
        return <Person key={i} kind={(["man", "woman", "worker", "kid2", "old"] as const)[i % 5]} x={x} y={y} s={0.55} t={t + i} arm={hands * 10 > i ? "up" : "down"} mood="happy" color={[C.sky, C.coral, C.mint, C.violet, C.orange][i % 5]} />;
      })}
      <g transform={`translate(${cx - 200} 300)`}>
        <path d="M -70 0 Q 0 -70 70 0 Z" fill="#e8a54b" stroke={OL} strokeWidth={5} />
        <rect x={-74} y={0} width={148} height={14} rx={6} fill={C.green} stroke={OL} strokeWidth={3} />
        <rect x={-72} y={14} width={144} height={18} rx={8} fill="#7a4524" stroke={OL} strokeWidth={4} />
        <path d="M -70 34 L 70 34 Q 60 60 0 60 Q -60 60 -70 34 Z" fill="#e8a54b" stroke={OL} strokeWidth={5} />
        <Txt x={0} y={120} size={28} weight={900}>
          вкус
        </Txt>
      </g>
      {sys > 0 && (
        <g opacity={sys}>
          <Flow pts={[[cx + 60, 200], [cx + 330, 200], [cx + 330, 420], [cx + 60, 420], [cx + 60, 230]]} t={t} color={C.mint} w={10} n={6} />
          {["продажи", "доставка", "система"].map((s, i) => (
            <Pill key={s} x={cx + [195, 330, 195][i]} y={[160, 310, 460][i]} text={s} fill="#fff" stroke={C.mint} size={28} />
          ))}
        </g>
      )}
      {quote > 0 && (
        <g transform={`translate(${cx} 570) scale(${quote})`}>
          <Card x={0} y={0} w={800} h={100} fill={C.yellow}>
            <Txt x={0} y={14} size={36} weight={900}>
              «Мир полон талантливых бедных людей»
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── опыт копится и на одном месте ──
export const GrowPath: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const no = ramp(t, at(c, 0.4), 0.5);
  const stair = ramp(t, at(c, 1), 1.4);
  const q = pop(t, at(c, 2));
  const steps = ["новые задачи", "учёба у коллег", "курсы", "своё ремесло"];
  return (
    <g>
      {/* «прыжки» между работами — зачёркнуто */}
      <g opacity={1 - stair * 0.6}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={cx - 520 + i * 110} y={300} width={80} height={80} rx={12} fill="#e8eef9" stroke={OL} strokeWidth={4} />
        ))}
        <path d={`M ${cx - 480} 290 q 55 -80 110 0 q 55 -80 110 0 q 55 -80 110 0`} fill="none" stroke={C.coral} strokeWidth={8} strokeDasharray="14 10" />
        {no > 0 && <Stamp x={cx - 320} y={340} text="НЕ ЧЕРЕЗ ПОЛГОДА" k={no} color={C.coralDeep} size={30} rot={-6} />}
      </g>
      {/* лестница роста на одном месте */}
      {steps.map((s, i) => {
        const k = clamp01(stair * 4 - i);
        return (
          <g key={s} opacity={k}>
            <rect x={cx - 60 + i * 170} y={760 - (i + 1) * 90} width={170} height={(i + 1) * 90} fill={[C.skyLight, C.mintLight, C.violetLight, C.goldLight][i]} stroke={OL} strokeWidth={4} />
            <Pill x={cx + 25 + i * 170} y={740 - (i + 1) * 90 - 26} text={s} fill="#fff" size={24} />
          </g>
        );
      })}
      <Person kind="man" x={cx - 120 + stair * 650} y={760 - stair * 360} s={0.7} t={t} mood="happy" />
      {q > 0 && (
        <g transform={`translate(${cx + 120} 860) scale(${q})`}>
          <Card x={0} y={0} w={900} h={90} fill={C.yellow}>
            <Txt x={0} y={12} size={30} weight={900}>
              «Куда ведет вас то, чем вы занимаетесь каждый день?»
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── отдай — и получишь ──
export const GiveReceive: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.2);
  const give = ramp(t, at(c, 1), 1);
  const wait = ramp(t, at(c, 1.5), 0.6);
  return (
    <g>
      <g opacity={clamp01(k * 1.5)}>
        <Person kind="richDad" x={cx - 300} y={720} s={1} t={t} mood="happy" arm="out" />
        <Person kind="poorDad" x={cx + 320} y={720} s={1} t={t} mood="calm" arm="hold" />
        {/* знания — книги-сердечки ко всем */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${cx - 300 + 140 * give + i * 30} ${430 - 60 * give - i * 50})`} opacity={give}>
            <path d="M 0 10 C -30 -20 -30 -40 0 -24 C 30 -40 30 -20 0 10 Z" fill={C.coral} stroke={OL} strokeWidth={3} transform="scale(1.6)" />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${cx + 320 - 140 * give - i * 30} ${430 - 60 * give - i * 50})`} opacity={give}>
            <path d="M 0 10 C -30 -20 -30 -40 0 -24 C 30 -40 30 -20 0 10 Z" fill={C.coral} stroke={OL} strokeWidth={3} transform="scale(1.6)" />
          </g>
        ))}
        <Pill x={cx} y={180} text="оба щедро делились знаниями" fill="#fff" size={32} />
      </g>
      {wait > 0 && (
        <g opacity={wait}>
          <g transform={`translate(${cx - 300} 820)`}>
            <Pill x={0} y={0} text="«Отдай – и получишь»" fill={C.mintLight} color={C.mintDeep} stroke={C.mint} size={30} />
          </g>
          <g transform={`translate(${cx + 320} 820)`}>
            <Pill x={0} y={0} text="«когда будут лишние…»" fill={C.greyLight} color={C.inkSoft} stroke={C.grey} size={28} />
          </g>
          <Coin x={cx - 120} y={560 + Math.sin(t * 3) * 10} r={32} spin={t * 3} />
          <Spark x={cx - 60} y={500} s={0.7} />
          <Txt x={cx + 320} y={420} size={60} weight={900} color={C.grey}>
            …
          </Txt>
        </g>
      )}
    </g>
  );
};
