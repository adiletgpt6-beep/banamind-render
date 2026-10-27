// «Честные метрики» и «Вираж»: шары тщеславия, шестерни действенных показателей, пантомима успеха,
// когорты, сплит-тест, три проверки, три шага учёта инноваций; компас виража, пустая комната,
// большая цифра, взлётная полоса из виражей, три тормоза, встреча «вираж или прежний курс», каталог.
import React from "react";
import { interpolate } from "remotion";
import { C, HEAVY } from "../theme";
import { Balloon, Capsule, Card, Compass, Gear, OL, Person, Pill } from "./draw";
import { Arrow, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";
import { Badge, Header, Icon, IconCard, cxOf, spread, type P } from "./parts";

// ── показатели тщеславия: огромные пустые шары и «хоккейная клюшка» ──
export const VanityBalloons: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const names = ["регистрации", "просмотры", "скачивания"];
  const stick = ramp(t, at(c, 1.4), 1.2);
  const why = pop(t, at(c, 1.8));
  return (
    <g>
      <Pop t={t} at={at(c, 0.6)} x={cx} y={150}>
        <Pill x={0} y={0} text="«показатели тщеславия»" fill={C.pinkLight} color={C.coralDeep} stroke={C.pink} size={44} />
      </Pop>
      {names.map((n, i) => {
        const k = ramp(t, spread(c, 1, i, 3, 0.05, 0.5), 0.8);
        if (k <= 0) return null;
        const r = 100 + 30 * k + i * 10;
        return <Balloon key={n} x={cx - 380 + i * 300} y={480 - k * 60 - i * 15} r={r} text={n} color={[C.pink, "#ff9fc5", "#ffb3a6"][i]} t={t} size={30} seed={i} />;
      })}
      {stick > 0 && (
        <g transform={`translate(${cx + 410} 680)`}>
          <rect x={-150} y={-150} width={300} height={260} rx={20} fill="#fff" stroke={OL} strokeWidth={5} />
          <path d={`M -110 70 L 20 60 Q 70 50 ${20 + 90 * stick} ${60 - 170 * stick}`} stroke={C.pink} strokeWidth={10} fill="none" strokeLinecap="round" />
          <Txt x={0} y={150} size={26} color={C.inkSoft}>
            «хоккейная клюшка»
          </Txt>
        </g>
      )}
      {why > 0 && (
        <g transform={`translate(${cx - 120} 860) scale(${why})`}>
          <Pill x={0} y={0} text="растут, но не объясняют почему" fill={C.yellow} size={34} />
        </g>
      )}
    </g>
  );
};

// ── действенные показатели: шестерни крутят механизм (действие → поведение) ──
export const ActionGears: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, at(c, 0.3));
  const turn = ramp(t, at(c, 1.1), 0.6);
  const rot = (t - at(c, 1.1)) * 60 * turn;
  return (
    <g>
      <Pop t={t} at={at(c, 0.4)} x={cx} y={160}>
        <Pill x={0} y={0} text="действенные показатели" fill={C.goldLight} color={C.goldDeep} stroke={C.gold} size={44} />
      </Pop>
      {k > 0 && (
        <g transform={`scale(${k})`} style={{ transformOrigin: `${cx}px 520px` }}>
          <Gear x={cx - 300} y={520} r={90} rot={rot} label="мы изменили" size={28} />
          <Gear x={cx - 82} y={455} r={60} teeth={8} rot={-rot * 1.5 + 11} color={C.goldLight} />
          <Gear x={cx + 110} y={520} r={90} rot={rot} color={C.teal} label="поведение людей" size={28} />
          <Arrow x1={cx + 230} y1={520} x2={cx + 380} y2={520} k={turn} w={10} color={C.tealDeep} />
          <g transform={`translate(${cx + 470} 520)`} opacity={turn}>
            <rect x={-80} y={-110} width={160} height={220} rx={16} fill="#fff" stroke={OL} strokeWidth={5} />
            <rect x={-50} y={60 - 140 * turn} width={100} height={140 * turn} rx={8} fill={C.teal} />
            <Txt x={0} y={150} size={26}>
              результат
            </Txt>
          </g>
        </g>
      )}
      <Pop t={t} at={at(c, 1.5)} x={cx} y={830}>
        <Pill x={0} y={0} text="причина → следствие" fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={36} />
      </Pop>
    </g>
  );
};

// ── пантомима успеха: сцена, маски, конфетти — а клиентов не понимают ──
export const Theater: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.2);
  const tricks = ["скидки в последний момент", "шумные кампании"];
  const real = pop(t, at(c, 1.2));
  return (
    <g>
      {k > 0 && (
        <g transform={`translate(${cx} 480) scale(${k})`}>
          <rect x={-520} y={-280} width={1040} height={500} rx={20} fill="#3a2a4a" stroke={OL} strokeWidth={6} />
          <path d="M -520 -280 Q -380 -120 -520 220 Z" fill="#b03a48" stroke={OL} strokeWidth={4} />
          <path d="M 520 -280 Q 380 -120 520 220 Z" fill="#b03a48" stroke={OL} strokeWidth={4} />
          <ellipse cx={0} cy={180} rx={420} ry={40} fill="#f6d68a" opacity={0.35} />
          {/* луч прожектора */}
          <path d={`M ${-60 + Math.sin(t) * 40} -280 L ${-200 + Math.sin(t) * 120} 200 L ${200 + Math.sin(t) * 120} 200 L ${60 + Math.sin(t) * 40} -280 Z`} fill="#fff6c8" opacity={0.18} />
          {/* растущий график-картонка */}
          <g transform={`translate(0 20) rotate(${wob(t, 2, 2)})`}>
            <rect x={-150} y={-130} width={300} height={220} rx={10} fill="#fff" stroke={OL} strokeWidth={5} />
            <polyline points="-110,60 -40,30 30,-10 110,-90" stroke={C.pink} strokeWidth={10} fill="none" strokeLinecap="round" />
            <rect x={-12} y={90} width={24} height={110} fill="#8a6a3a" />
          </g>
          {Array.from({ length: 16 }).map((_, i) => (
            <rect key={i} x={-480 + ((i * 67) % 960)} y={-260 + ((t * 120 + i * 47) % 440)} width={14} height={8} fill={[C.yellow, C.pink, C.cyan][i % 3]} transform={`rotate(${t * 90 + i * 30} ${-480 + ((i * 67) % 960)} ${-260 + ((t * 120 + i * 47) % 440)})`} />
          ))}
          <Txt x={0} y={-220} size={40} color="#fff">
            «пантомима успеха»
          </Txt>
        </g>
      )}
      {tricks.map((tr, i) => (
        <Pop key={tr} t={t} at={spread(c, 0, i, 2, 0.35, 0.6)} x={cx - 260 + i * 520} y={800}>
          <Pill x={0} y={0} text={tr} fill={C.pinkLight} color={C.coralDeep} stroke={C.pink} size={30} />
        </Pop>
      ))}
      {real > 0 && (
        <g transform={`translate(${cx} 900) scale(${real})`}>
          <Pill x={0} y={0} text="а клиентов так и не поняли" fill={C.yellow} size={32} />
        </g>
      )}
    </g>
  );
};

// ── когорты IMVU: активность растёт, платящие стоят ──
export const Cohorts: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const groups = pop(t, at(c, 0.5));
  const grow = ramp(t, at(c, 1.1), 1.6);
  const flat = ramp(t, at(c, 1.6), 0.8);
  const talk = pop(t, at(c, 2.5));
  const months = 6;
  return (
    <g>
      <Badge x={cx} y={140} kind="history" t={t} />
      {groups > 0 && (
        <g transform={`translate(${cx} 480) scale(${groups})`}>
          <rect x={-520} y={-250} width={1040} height={470} rx={22} fill="#fff" stroke={OL} strokeWidth={5} />
          <line x1={-450} y1={170} x2={480} y2={170} stroke={C.grey} strokeWidth={4} />
          {Array.from({ length: months }).map((_, i) => {
            const x = -380 + i * 160;
            const act = 0.05 + (0.15 * i * grow) / (months - 1);
            const pay = 0.01;
            return (
              <g key={i}>
                <rect x={x - 40} y={170 - act * 1600} width={44} height={act * 1600} rx={6} fill={C.teal} stroke={OL} strokeWidth={3} />
                <rect x={x + 8} y={170 - pay * 1600 * flat} width={44} height={pay * 1600 * flat + 0.01} rx={6} fill={C.gold} stroke={OL} strokeWidth={3} />
                <g transform={`translate(${x + 6} 205)`}>
                  <Icon name="people" x={0} y={0} s={0.4} color={C.cyan} />
                </g>
              </g>
            );
          })}
          <g transform="translate(-300 -200)">
            <rect x={-14} y={-14} width={28} height={28} rx={6} fill={C.teal} stroke={OL} strokeWidth={3} />
            <Txt x={20} y={10} size={26} anchor="start">
              {"пользовались ≥ 5 раз: < 5 % → почти 20 %"}
            </Txt>
            <rect x={-14} y={30} width={28} height={28} rx={6} fill={C.gold} stroke={OL} strokeWidth={3} />
            <Txt x={20} y={54} size={26} anchor="start">
              платили: около 1 %
            </Txt>
          </g>
          <Txt x={0} y={265} size={24} color={C.inkSoft} weight={700}>
            когорты по месяцам · схема BanaMind по описанию в книге
          </Txt>
        </g>
      )}
      {talk > 0 && (
        <g transform={`translate(${cx} 860) scale(${talk})`}>
          <Pill x={0} y={0} text="пошёл разговаривать с пользователями" fill={C.yellow} size={34} />
        </g>
      )}
    </g>
  );
};

// ── сплит-тест: две версии регистрации, одинаковый результат ──
export const SplitTest: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const flow = ramp(t, at(c, 0.6), 1.4);
  const res = ramp(t, at(c, 1.05), 0.8);
  const lesson = pop(t, at(c, 1.5));
  return (
    <g>
      <Badge x={cx} y={140} kind="history" t={t} />
      {/* поток людей делится надвое */}
      <g transform={`translate(${cx - 470} 460)`}>
        <Icon name="people" x={0} y={0} s={1.6} color={C.cyan} />
        <Txt x={0} y={100} size={28}>
          посетители
        </Txt>
      </g>
      {flow > 0 &&
        [-1, 1].map((d) =>
          Array.from({ length: 5 }).map((_, i) => {
            const u = ((t * 0.6 + i / 5) % 1) * flow;
            const x = cx - 380 + u * 330;
            const y = 460 + d * u * 160;
            return <circle key={`${d}${i}`} cx={x} cy={y} r={10} fill={d < 0 ? C.violet : C.teal} opacity={0.85} />;
          }),
        )}
      {[
        { y: 300, name: "А: сразу регистрация", color: C.violet },
        { y: 620, name: "В: «ленивая регистрация»", color: C.teal },
      ].map((v, i) => (
        <Pop key={i} t={t} at={at(c, 0.45 + i * 0.2)} x={cx + 120} y={v.y}>
          <Card x={0} y={0} w={520} h={200} fill="#fff" stroke={v.color}>
            <Txt x={0} y={-50} size={30} color={v.color}>
              {v.name}
            </Txt>
            <rect x={-200} y={0} width={400} height={44} rx={22} fill={C.greyLight} stroke={OL} strokeWidth={3} />
            <rect x={-200} y={0} width={240 * res} height={44} rx={22} fill={v.color} />
          </Card>
        </Pop>
      ))}
      {res > 0.8 && (
        <g transform={`translate(${cx + 470} 460)`}>
          <text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={110} fill={OL}>
            =
          </text>
          <Txt x={0} y={100} size={26}>
            разницы нет
          </Txt>
        </g>
      )}
      {lesson > 0 && (
        <g transform={`translate(${cx} 870) scale(${lesson})`}>
          <Pill x={0} y={0} text="«лучшую практику» — тоже проверять" fill={C.yellow} size={34} />
        </g>
      )}
    </g>
  );
};

// ── три проверки хорошего показателя + люди за цифрами ──
export const ThreeChecks: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = [
    { icon: "gear" as const, label: "действенный", color: C.gold },
    { icon: "eye" as const, label: "просто\nизложен", color: C.cyan },
    { icon: "check" as const, label: "можно\nпроверить", color: C.teal },
  ];
  const people = ramp(t, at(c, 1.1), 1);
  return (
    <g>
      {items.map((it, i) => {
        const k = pop(t, spread(c, 0, i, 3, 0.4, 0.95));
        return <IconCard key={i} x={cx - 360 + i * 360} y={360} w={320} h={260} icon={it.icon} label={it.label} k={k} color={it.color} size={32} mark="check" markK={ramp(t, spread(c, 0, i, 3, 0.5, 1), 0.3)} />;
      })}
      {people > 0 && (
        <g transform={`translate(${cx} 700)`} opacity={people}>
          <rect x={-480} y={-90} width={960} height={180} rx={24} fill="#fff" stroke={OL} strokeWidth={5} />
          <text x={-330} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={84} fill={C.cyanDeep}>
            1 024
          </text>
          <Arrow x1={-190} y1={0} x2={-90} y2={0} k={people} w={8} />
          {Array.from({ length: 7 }).map((_, i) => (
            <Person key={i} kind={(["woman", "man", "girl", "old", "worker", "kid", "kid2"] as const)[i]} x={-20 + i * 70} y={60} s={0.3} t={t + i} mood="happy" />
          ))}
          <Txt x={0} y={150} size={30}>
            «за любыми показателями стоят люди»
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── учёт инноваций: три шага ──
export const ThreeSteps: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const steps = [
    { n: "1", title: "базовые\nпоказатели", note: "через MVP", color: C.cyan },
    { n: "2", title: "настройка\nмеханизма", note: "к идеальным", color: C.gold },
    { n: "3", title: "вираж или\nпрежний курс", note: "решение", color: C.violet },
  ];
  const times = [at(c, 0.5), at(c, 1.1), at(c, 1.6)];
  return (
    <g>
      <Header x={cx} y={160} text="Учёт инноваций" t={t} />
      {steps.map((s, i) => {
        const k = pop(t, times[i]);
        const x = cx - 380 + i * 380;
        const y = 560 - i * 70;
        if (k <= 0) return null;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
            {/* ступень */}
            <rect x={-170} y={-10} width={340} height={300 + i * 70} rx={18} fill={s.color} opacity={0.22} stroke={OL} strokeWidth={4} />
            <circle cx={0} cy={-80} r={54} fill={s.color} stroke={OL} strokeWidth={5} />
            <text x={0} y={-58} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={60} fill="#fff">
              {s.n}
            </text>
            <Txt x={0} y={70} size={34}>
              {s.title}
            </Txt>
            <Txt x={0} y={180} size={28} color={C.inkSoft} weight={700}>
              {s.note}
            </Txt>
            {i < 2 && <Arrow x1={150} y1={-80} x2={230} y2={-140} k={ramp(t, times[i + 1] - 0.2, 0.4)} w={8} />}
          </g>
        );
      })}
    </g>
  );
};

// ── компас виража: видение — та же звезда, меняется дорога ──
export const CompassTurn: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const turn = ramp(t, at(c, 0.7), 1);
  const roads = ramp(t, at(c, 1.1), 0.8);
  return (
    <g>
      <Pop t={t} at={at(c, 0.6)} x={cx} y={160}>
        <Pill x={0} y={0} text="«структурированное изменение курса»" fill={C.violetLight} color={C.violetDeep} stroke={C.violet} size={40} />
      </Pop>
      <Pop t={t} at={0.3} x={cx - 300} y={540}>
        <Compass x={0} y={0} r={150} angle={interpolate(turn, [0, 1], [0, 62]) + Math.sin(t * 2) * 2} />
      </Pop>
      {/* звезда-видение и две дороги */}
      <g transform={`translate(${cx + 280} 540)`}>
        <g transform={`translate(0 -260) rotate(${t * 20})`}>
          <Icon name="star" x={0} y={0} s={1.3} color={C.gold} />
        </g>
        <Txt x={0} y={-180} size={28}>
          видение
        </Txt>
        <path d="M -200 260 Q -220 40 -20 -140" stroke={C.grey} strokeWidth={14} fill="none" strokeDasharray="20 16" opacity={0.6} />
        {roads > 0 && <path d="M -200 260 Q 120 120 -20 -140" stroke={C.violet} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray="700" strokeDashoffset={700 * (1 - roads)} />}
        <g transform="translate(-200 260)">
          <circle r={34} fill={C.teal} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={74} size={26}>
            уже узнали
          </Txt>
        </g>
      </g>
    </g>
  );
};

// ── пустая комната: «Здесь никого нет» ──
export const EmptyRoom: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const room = pop(t, at(c, 0.4));
  const leave = ramp(t, at(c, 1.1), 1.4);
  const faster = ramp(t, at(c, 2.1), 1.2);
  return (
    <g>
      <Badge x={cx} y={140} kind="history" t={t} />
      {room > 0 && (
        <g transform={`translate(${cx - 220} 470) scale(${room})`}>
          <rect x={-300} y={-220} width={600} height={400} rx={22} fill="#f4f1ea" stroke={OL} strokeWidth={6} />
          <Txt x={0} y={-160} size={30}>
            сеть избирателей
          </Txt>
          {/* пустые стулья */}
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${-180 + i * 120} 60)`}>
              <rect x={-30} y={-40} width={60} height={60} rx={8} fill="#c9a77a" stroke={OL} strokeWidth={4} />
              <rect x={-30} y={20} width={8} height={50} fill={OL} />
              <rect x={22} y={20} width={8} height={50} fill={OL} />
            </g>
          ))}
          {/* человечек заходит и уходит */}
          <Person kind="man" x={-200 + leave * 520} y={160} s={0.5} t={t} mood="sad" flip={leave > 0.5} />
        </g>
      )}
      <Pop t={t} at={at(c, 1.35)} x={cx + 350} y={330}>
        <g transform={`rotate(${wob(t, 2, 2)})`}>
          <rect x={-190} y={-90} width={380} height={180} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
          <Txt x={0} y={-20} size={30}>
            «Здесь никого нет.
          </Txt>
          <Txt x={0} y={26} size={26}>
            Какой смысл заходить
          </Txt>
          <Txt x={0} y={62} size={26}>
            сюда снова?»
          </Txt>
        </g>
      </Pop>
      {faster > 0 && (
        <g transform={`translate(${cx} 830)`} opacity={faster}>
          {[0, 1, 2, 3].map((i) => {
            const w = 190 - i * 35;
            return (
              <g key={i} transform={`translate(${-330 + i * 220} 0)`}>
                <rect x={-w / 2} y={-30} width={w * clamp01(faster * 4 - i)} height={60} rx={30} fill={C.violet} opacity={0.4 + i * 0.15} stroke={OL} strokeWidth={3} />
                <Txt x={0} y={70} size={24} color={C.inkSoft}>
                  {`MVP ${i + 1}`}
                </Txt>
              </g>
            );
          })}
          <Txt x={0} y={-60} size={28} color={C.violetDeep}>
            каждый следующий — быстрее
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── большая цифра kaChing против семи квалифицированных ──
export const BigNumber: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const big = ramp(t, at(c, 0.6), 1.2);
  const seven = pop(t, at(c, 1.15));
  const meet = pop(t, at(c, 1.75));
  return (
    <g>
      <Badge x={cx} y={140} kind="history" t={t} />
      <g transform={`translate(${cx - 230} 420)`} opacity={1 - seven * 0.5}>
        <Balloon x={0} y={0} r={140 + 40 * big} text="450 000+" color={C.pink} t={t} size={44} />
        <Txt x={0} y={300} size={30} color={C.inkSoft}>
          игроков бесплатной игры
        </Txt>
      </g>
      {seven > 0 && (
        <g transform={`translate(${cx + 330} 460) scale(${seven})`}>
          <Card x={0} y={0} w={440} h={360} fill="#fff">
            <Txt x={0} y={-120} size={30}>
              квалифицированы:
            </Txt>
            {Array.from({ length: 7 }).map((_, i) => (
              <g key={i} transform={`translate(${-150 + (i % 4) * 100} ${-30 + Math.floor(i / 4) * 100})`}>
                <Icon name="person" x={0} y={0} s={0.8} color={C.gold} />
              </g>
            ))}
            <Txt x={0} y={150} size={32} color={C.goldDeep}>
              всего семеро
            </Txt>
          </Card>
        </g>
      )}
      {meet > 0 && (
        <g transform={`translate(${cx} 860) scale(${meet})`}>
          <Pill x={0} y={0} text="ясные гипотезы → встреча о вираже" fill={C.violetLight} color={C.violetDeep} stroke={C.violet} size={34} />
        </g>
      )}
    </g>
  );
};

// ── взлётная полоса: не месяцы денег, а число оставшихся виражей ──
export const Runway: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.2);
  const swap = ramp(t, at(c, 0.6), 0.8);
  const faster = ramp(t, at(c, 1.1), 1);
  return (
    <g>
      {k > 0 && (
        <g transform={`translate(${cx} 560) scale(${k})`}>
          <path d="M -560 180 L -300 -160 L 300 -160 L 560 180 Z" fill="#59647f" stroke={OL} strokeWidth={6} />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={-14} y={-130 + i * 52} width={28} height={30} rx={6} fill="#fff" opacity={0.8} />
          ))}
          {/* отметки: месяцы → виражи */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = 150 - i * 70;
            const xL = -480 + i * 50;
            return (
              <g key={i}>
                <g opacity={1 - swap}>
                  <rect x={xL - 30} y={y - 20} width={60} height={40} rx={8} fill={C.goldLight} stroke={OL} strokeWidth={3} />
                  <Txt x={xL} y={y + 10} size={20}>
                    мес
                  </Txt>
                </g>
                <g opacity={swap} transform={`translate(${xL} ${y})`}>
                  <Compass x={0} y={0} r={26} angle={i * 30 + t * 10} />
                </g>
              </g>
            );
          })}
          {/* самолётик-стартап */}
          <g transform={`translate(${-100 + faster * 260} ${120 - faster * 260}) rotate(${-45 * faster})`}>
            <path d="M -60 0 L 60 0 L 80 -10 L 60 -20 L -40 -20 Z M -10 -20 L 20 -60 L 30 -20 Z M -10 0 L 20 40 L 30 0 Z" fill="#fff" stroke={OL} strokeWidth={4} />
          </g>
        </g>
      )}
      <Pop t={t} at={at(c, 0.25)} x={cx - 260} y={200}>
        <Pill x={0} y={0} text="месяцы денег?" fill="#fff" color={C.inkSoft} stroke={C.grey} size={34} />
      </Pop>
      {swap > 0 && (
        <g transform={`translate(${cx + 210} 200) scale(${swap})`}>
          <Pill x={0} y={0} text="«сколько виражей осталось»" fill={C.violetLight} color={C.violetDeep} stroke={C.violet} size={34} />
        </g>
      )}
      {faster > 0 && (
        <g transform={`translate(${cx} 900)`} opacity={faster}>
          <Pill x={0} y={0} text="продлить полосу = учиться быстрее" fill={C.yellow} size={34} />
        </g>
      )}
    </g>
  );
};

// ── три тормоза поворота ──
export const ThreeBrakes: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = [
    { icon: "star" as const, label: "красивые\nпоказатели", color: C.pink },
    { icon: "question" as const, label: "расплывчатые\nгипотезы", color: C.grey },
    { icon: "warn" as const, label: "страх", color: C.coral },
  ];
  const stuck = pop(t, at(c, 1.1));
  return (
    <g>
      <Header x={cx} y={160} text="Почему откладывают поворот" t={t} size={52} />
      {items.map((it, i) => (
        <IconCard key={i} x={cx - 360 + i * 360} y={430} w={320} h={270} icon={it.icon} label={it.label} k={pop(t, spread(c, 0, i, 3, 0.45, 0.95))} color={it.color} size={32} />
      ))}
      {stuck > 0 && (
        <g transform={`translate(${cx} 770) scale(${stuck})`}>
          <rect x={-470} y={-70} width={940} height={140} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
          <Pill x={-300} y={0} text="провал" fill={C.coralLight} color={C.coralDeep} stroke={C.coral} size={30} />
          <Pill x={300} y={0} text="успех" fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={30} />
          <g transform={`translate(${Math.sin(t * 2) * 30} 0)`}>
            <circle r={40} fill={C.grey} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={10} size={26} color="#fff">
              годы
            </Txt>
          </g>
        </g>
      )}
    </g>
  );
};

// ── встреча «вираж или прежний курс»: решение по данным ──
export const PivotMeeting: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const table = pop(t, at(c, 1));
  const data = ramp(t, at(c, 1.4), 0.8);
  const mood = ramp(t, at(c, 1.5), 0.6);
  return (
    <g>
      <Pop t={t} at={at(c, 0.4)} x={cx} y={180}>
        <g>
          <Pill x={-240} y={0} text="упорство" fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={40} />
          <text x={0} y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill={OL}>
            или
          </text>
          <Pill x={230} y={0} text="упрямство" fill={C.coralLight} color={C.coralDeep} stroke={C.coral} size={40} />
        </g>
      </Pop>
      {table > 0 && (
        <g transform={`translate(${cx} 540) scale(${table})`}>
          {[-300, -100, 100, 300].map((x, i) => (
            <Person key={i} kind={(["founder", "woman", "man", "boss"] as const)[i]} x={x} y={90} s={0.55} t={t + i} mood="calm" />
          ))}
          <ellipse cx={0} cy={60} rx={420} ry={110} fill={C.kraft} stroke={OL} strokeWidth={6} />
          <g transform="translate(0 40)" opacity={data}>
            <rect x={-150} y={-50} width={300} height={100} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={-110 + i * 60} y={30 - (i + 1) * 15} width={36} height={(i + 1) * 15} rx={4} fill={C.cyan} />
            ))}
          </g>
          <Txt x={0} y={240} size={30}>
            «вираж или прежний курс»
          </Txt>
        </g>
      )}
      {mood > 0 && (
        <g transform={`translate(${cx} 860)`} opacity={mood}>
          <Pill x={-230} y={0} text="данные ✓" fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={32} />
          <Pill x={220} y={0} text="настроение ✗" fill="#f1f3f7" color={C.inkSoft} stroke={C.grey} size={32} />
        </g>
      )}
    </g>
  );
};

// ── каталог виражей: веер карточек ──
export const PivotCatalog: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const types = [
    { label: "функция →\nпродукт", icon: "star" as const },
    { label: "другие\nклиенты", icon: "people" as const },
    { label: "другая\nпотребность", icon: "heart" as const },
    { label: "канал\nпродаж", icon: "truck" as const },
    { label: "технология", icon: "gear" as const },
    { label: "механизм\nроста", icon: "chart" as const },
  ];
  const hyp = pop(t, at(c, 1.2));
  return (
    <g>
      <Header x={cx} y={150} text="Каталог виражей" t={t} size={56} />
      {types.map((ty, i) => {
        const k = pop(t, spread(c, 0, i, 6, 0.2, 0.95));
        const x = cx - 500 + i * 200;
        const rot = (i - 2.5) * 4;
        return k > 0 ? (
          <g key={i} transform={`translate(${x} ${470 + Math.abs(i - 2.5) * 18}) rotate(${rot}) scale(${k})`}>
            <rect x={-90} y={-130} width={180} height={260} rx={18} fill="#fff" stroke={OL} strokeWidth={5} />
            <rect x={-90} y={-130} width={180} height={50} rx={18} fill={C.violet} />
            <Icon name={ty.icon} x={0} y={-10} s={0.9} color={C.violetLight} />
            <Txt x={0} y={70} size={24} w={160}>
              {ty.label}
            </Txt>
          </g>
        ) : null;
      })}
      <Pop t={t} at={at(c, 0.95)} x={cx + 420} y={680}>
        <Pill x={0} y={0} text="и ещё четыре в книге" fill="#fff" color={C.inkSoft} stroke={C.grey} size={26} />
      </Pop>
      {hyp > 0 && (
        <g transform={`translate(${cx} 820) scale(${hyp})`}>
          <Capsule x={0} y={0} w={760} h={110} text="новый курс = новая гипотеза → новый MVP" glow={0.5 + 0.3 * Math.sin(t * 3)} color={C.violet} size={32} />
        </g>
      )}
    </g>
  );
};

