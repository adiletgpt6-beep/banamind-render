// Начало, миф и «стартап — это эксперимент»: идеальное приложение без пользователей, три вопроса,
// книга, лаборатория с четырьмя дверями, формула-миф, дождь, ракета и машина, сырой продукт,
// тезис, определение, копия против неизвестного, остров свободы, пять принципов, большой эксперимент.
import React from "react";
import { interpolate } from "remotion";
import { C, DISPLAY, HEAVY } from "../theme";
import { BookCover, Capsule, Card, OL, Person, Phone, Pill, Spark, Stamp } from "./draw";
import { Arrow, Cross, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";
import { Badge, Header, Icon, IconCard, QuoteCard, cxOf, spread, type P } from "./parts";

// ── хук: идеальное приложение, которым никто не пользуется ──
export const PerfectApp: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const build = ramp(t, 0.2, 2.6);
  const empty = ramp(t, at(c, 1), 0.8);
  const q = pop(t, at(c, 2.2));
  const feats = ["дизайн", "функции", "без ошибок"];
  return (
    <g>
      <Phone x={cx - 180} y={500} s={1.1} rot={wob(t, 1, 1.5)}>
        {/* экран собирается слоями */}
        <rect x={-96} y={-186} width={192} height={70 * clamp01(build * 3)} rx={14} fill={C.cyan} opacity={1 - empty * 0.5} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-96 + (i % 2) * 100} y={-100 + Math.floor(i / 2) * 100} width={92} height={88 * clamp01(build * 3 - 1 - i * 0.2)} rx={14} fill={[C.goldLight, C.tealLight, C.pinkLight, C.violetLight][i]} opacity={1 - empty * 0.5} />
        ))}
        <rect x={-70} y={120} width={140 * clamp01(build * 3 - 2)} height={44} rx={22} fill={C.teal} opacity={1 - empty * 0.5} />
        {build > 0.95 && empty < 0.5 && [0, 1, 2].map((i) => <Spark key={i} x={-80 + i * 80} y={-150 + ((t * 40 + i * 60) % 300)} s={0.6} opacity={0.8} />)}
      </Phone>
      {feats.map((f, i) => (
        <Pop key={f} t={t} at={at(c, 0.35 + i * 0.18)} x={cx + 260} y={260 + i * 100}>
          <Pill x={0} y={0} text={`✓ ${f}`} fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={38} />
        </Pop>
      ))}
      <Pop t={t} at={at(c, 0.15)} x={cx - 180} y={180}>
        <Pill x={0} y={0} text="целый год работы" fill={C.goldLight} color={C.goldDeep} stroke={C.gold} size={34} />
      </Pop>
      {/* пусто: пользователи */}
      {empty > 0 && (
        <g opacity={empty} transform={`translate(${cx + 260} 690)`}>
          <Card x={0} y={0} w={420} h={170} fill="#fff">
            <Icon name="people" x={-130} y={0} s={1.1} color={C.grey} />
            <text x={40} y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={84} fill={C.coralDeep}>
              0
            </text>
            <Txt x={120} y={60} size={26} color={C.inkSoft} anchor="middle">
              пользователей
            </Txt>
          </Card>
          {/* паутинка */}
          <path d="M 150 -85 Q 170 -60 210 -60 M 150 -85 Q 175 -50 190 -20 M 150 -85 L 210 -30" stroke={C.grey} strokeWidth={3} fill="none" opacity={0.8} />
        </g>
      )}
      {q > 0 && (
        <g transform={`translate(${cx - 170} 860) scale(${q})`}>
          <Capsule x={0} y={0} w={480} h={110} text={"главное не проверено"} glow={0.4 + 0.3 * Math.sin(t * 3)} color={C.coral} size={34} />
        </g>
      )}
    </g>
  );
};

// ── три вопроса фильма: карточки въезжают и уменьшаются в ряд ──
export const ThreeQuestions: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const cards = [
    { title: "1000 комплиментов\nили 10 оплат?", icon: "heart" as const, color: C.pink },
    { title: "рост регистраций —\nа вдруг провал?", icon: "chart" as const, color: C.cyan },
    { title: "вечные тесты\nвместо бизнеса?", icon: "flask" as const, color: C.teal },
  ];
  return (
    <g>
      {cards.map((cd, i) => {
        const k = pop(t, at(c, i) - 0.1);
        const small = i < 2 ? ramp(t, at(c, i + 1) - 0.25, 0.5) : 0;
        if (k <= 0) return null;
        const bx = interpolate(k, [0, 1], [2300, cx]);
        const x = interpolate(small, [0, 1], [bx, cx - 320 + i * 320]);
        const y = interpolate(small, [0, 1], [520, 200]);
        const s = interpolate(small, [0, 1], [1, 0.42]);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s}) rotate(${(1 - k) * 8})`}>
            <Card x={0} y={0} w={760} h={520} fill="#fff">
              <rect x={-380} y={-260} width={760} height={150} rx={26} fill={cd.color} opacity={0.25} />
              <Icon name={cd.icon} x={0} y={-150} s={1.8} color={cd.color} />
              <Txt x={0} y={40} size={66} weight={900}>
                {cd.title}
              </Txt>
            </Card>
            <g transform="translate(330 -230)">
              <circle r={56} fill={C.yellow} stroke={OL} strokeWidth={5} />
              <text x={0} y={28} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={78} fill={OL}>
                ?
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
};

// ── книга и честная рамка ──
export const BookIntro: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  // книга появляется, когда ведущий уже перешёл на своё место (без наложения)
  const k = pop(t, 1.3);
  const terms = pop(t, at(c, 0.45));
  const frame = pop(t, at(c, 1.05));
  return (
    <g>
      <g opacity={clamp01(k * 1.5)}>
        <BookCover x={cx - 280} y={470} s={1.05 * k} rot={-4 + wob(t, 1, 1)} />
      </g>
      {terms > 0 && (
        <g transform={`translate(${cx + 230} 330) scale(${terms})`}>
          <Pill x={0} y={-70} text="Lean Startup" fill="#fff" size={40} />
          <Arrow x1={0} y1={-20} x2={0} y2={40} k={1} color={C.inkSoft} w={8} />
          <Pill x={0} y={100} text="«экономичный стартап»" fill={C.cyanLight} color={C.cyanDeep} stroke={C.cyan} size={40} />
        </g>
      )}
      {frame > 0 && (
        <g transform={`translate(${cx + 230} 680) scale(${frame})`}>
          <Card x={0} y={0} w={520} h={190} fill="#fff">
            <Icon name="cross" x={-190} y={-36} s={0.7} />
            <Txt x={30} y={-24} size={34} anchor="middle">
              не пересказ
            </Txt>
            <Icon name="check" x={-190} y={44} s={0.7} />
            <Txt x={30} y={56} size={34} anchor="middle">
              проверка идей
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── лаборатория: четыре двери ──
export const LabDoors: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const doors = [
    { label: "предположение", color: C.cyan, icon: "bulb" as const },
    { label: "эксперимент", color: C.teal, icon: "flask" as const },
    { label: "честная\nметрика", color: C.gold, icon: "gear" as const },
    { label: "решение", color: C.violet, icon: "flag" as const },
  ];
  const caps = pop(t, at(c, 1.15));
  return (
    <g>
      <Header x={cx} y={150} text="Лаборатория гипотез BanaMind" t={t} size={56} />
      {doors.map((d, i) => {
        const k = pop(t, spread(c, 0, i, 4, 0.35, 0.95));
        const x = cx - 465 + i * 310;
        const open = ramp(t, spread(c, 0, i, 4, 0.4, 1.0), 0.5);
        if (k <= 0) return null;
        return (
          <g key={i} transform={`translate(${x} ${500 + (1 - k) * 60})`} opacity={clamp01(k * 1.5)}>
            <rect x={-120} y={-230} width={240} height={360} rx={18} fill="#fff" stroke={OL} strokeWidth={6} />
            <rect x={-100} y={-210} width={200} height={320} rx={10} fill={d.color} opacity={0.25} />
            {/* створка открывается */}
            <path d={`M -100 -210 L ${-100 + 200 * (1 - open * 0.65)} ${-210 + open * 20} L ${-100 + 200 * (1 - open * 0.65)} ${110 - open * 20} L -100 110 Z`} fill={d.color} stroke={OL} strokeWidth={5} />
            <Icon name={d.icon} x={0} y={-60} s={1} color="#fff" />
            <rect x={-118} y={150} width={236} height={78} rx={20} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={d.label.includes("\n") ? 182 : 200} size={30} w={210}>
              {d.label}
            </Txt>
            {i < 3 && <Arrow x1={130} y1={-60} x2={180} y2={-60} k={ramp(t, spread(c, 0, i + 1, 4, 0.35, 0.95), 0.3)} w={7} />}
          </g>
        );
      })}
      {caps > 0 && (
        <g transform={`translate(${cx} 840) scale(${caps})`}>
          <Capsule x={0} y={0} w={560} h={110} text="идея = догадка, пока не проверена" glow={0.3 + 0.2 * Math.sin(t * 3)} size={30} />
        </g>
      )}
    </g>
  );
};

// ── миф: формула успеха из журналов ──
export const MythFormula: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const parts = ["настойчивость", "талант", "момент", "продукт"];
  const myth = ramp(t, at(c, 1.5), 0.5);
  const fail = pop(t, at(c, 2.2));
  return (
    <g>
      {/* журнал */}
      <Pop t={t} at={0.1} x={cx} y={330}>
        <g transform={`rotate(${-2 + wob(t, 2, 0.8)})`}>
          <rect x={-560} y={-170} width={1120} height={300} rx={18} fill="#fff" stroke={OL} strokeWidth={6} />
          <rect x={-560} y={-170} width={1120} height={70} rx={18} fill={C.coral} />
          <text x={0} y={-118} textAnchor="middle" fontFamily={DISPLAY} fontSize={40} fill="#fff">
            ФОРМУЛА УСПЕХА
          </text>
          {parts.map((p, i) => {
            const k = pop(t, spread(c, 0, i, 4, 0.2, 0.8));
            const x = -420 + i * 280;
            return (
              <g key={p} opacity={clamp01(k * 1.5)} transform={`translate(${x} 20) scale(${0.6 + 0.4 * k})`}>
                <rect x={-120} y={-44} width={240} height={88} rx={44} fill={C.goldLight} stroke={OL} strokeWidth={4} />
                <Txt x={0} y={12} size={30} w={220}>
                  {p}
                </Txt>
                {i < 3 && (
                  <text x={140} y={18} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill={OL}>
                    +
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </Pop>
      <Pop t={t} at={at(c, 0.85)} x={cx} y={560}>
        <Pill x={0} y={0} text="= успех неизбежен?" fill={C.yellow} size={46} />
      </Pop>
      <Stamp x={cx + 380} y={580} text="МИФ" k={myth} size={70} rot={-12} />
      {fail > 0 && (
        <g transform={`translate(${cx} 760) scale(${fail})`}>
          <Card x={0} y={0} w={760} h={150} fill={C.coralLight} stroke={C.coralDeep}>
            <Txt x={0} y={-6} size={40} color={C.coralDeep}>
              «почти все стартапы обречены на провал»
            </Txt>
            <Txt x={0} y={46} size={28} color={C.inkSoft} weight={700}>
              наблюдение автора — без процентов и статистики
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── первый провал автора: дождь, двое расходятся; затем шестерня процесса ──
export const RainSplit: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const split = ramp(t, at(c, 0.6), 1.6);
  const proc = pop(t, at(c, 1));
  const learn = pop(t, at(c, 1.7));
  return (
    <g>
      {/* дождь */}
      <g opacity={1 - proc * 0.7}>
        {Array.from({ length: 34 }).map((_, i) => {
          const x = cx - 520 + ((i * 97) % 1040);
          const y = 160 + ((t * 520 + i * 61) % 560);
          return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 34} stroke={C.skyDeep} strokeWidth={4} strokeLinecap="round" opacity={0.55} />;
        })}
        <path d={`M ${cx - 420} 230 Q ${cx - 300} 150 ${cx - 160} 220 Q ${cx} 140 ${cx + 160} 220 Q ${cx + 320} 150 ${cx + 420} 230 Z`} fill="#c9d3e6" stroke={OL} strokeWidth={5} />
        <Person kind="founder" x={cx - 60 - split * 260} y={720} s={0.95} t={t} mood="sad" flip />
        <Person kind="man" x={cx + 60 + split * 260} y={720} s={0.95} t={t} mood="sad" />
        {["идея", "команда", "технология"].map((w, i) => (
          <Pop key={w} t={t} at={at(c, 0.2 + i * 0.15)} x={cx - 300 + i * 300} y={330}>
            <Pill x={0} y={0} text={`✓ ${w}`} fill="#fff" size={32} />
          </Pop>
        ))}
        <Cross x={cx} y={520} s={150} k={ramp(t, at(c, 0.85), 0.5)} />
      </g>
      {proc > 0 && (
        <g transform={`translate(${cx} 520) scale(${proc})`}>
          <Card x={0} y={0} w={760} h={330} fill="#fff">
            <g transform={`translate(-250 -20) rotate(${t * 50})`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <rect key={i} x={-12} y={-80} width={24} height={34} rx={5} fill={C.gold} stroke={OL} strokeWidth={4} transform={`rotate(${i * 45})`} />
              ))}
              <circle r={56} fill={C.gold} stroke={OL} strokeWidth={5} />
              <circle r={18} fill="#fff" stroke={OL} strokeWidth={4} />
            </g>
            <Txt x={110} y={-50} size={42}>
              {"скучные подробности\n= процесс"}
            </Txt>
            {learn > 0 && (
              <g transform={`translate(110 100) scale(${learn})`}>
                <Pill x={0} y={0} text="«успеху можно научиться»" fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={34} />
              </g>
            )}
          </Card>
        </g>
      )}
    </g>
  );
};

// ── ракета против машины ──
export const RocketCar: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const fly = ramp(t, at(c, 0.3), 1.6);
  const boom = ramp(t, at(c, 0.8), 0.4);
  const car = ramp(t, at(c, 1), 0.5);
  const loop = pop(t, at(c, 2.1));
  const rx = cx - 300;
  return (
    <g>
      {/* ракета: заранее рассчитанная траектория уходит в сторону */}
      <g>
        <Card x={rx} y={480} w={520} h={560} fill="#f4f7fb">
          <Txt x={0} y={-226} size={34}>
            ракета: всё рассчитали
          </Txt>
          <path d="M -180 230 Q -40 -40 180 -200" stroke={C.grey} strokeWidth={5} strokeDasharray="14 12" fill="none" />
          <path d={`M -180 230 Q ${-40 + boom * 120} ${-40 + boom * 160} ${180 - boom * 30} ${-200 + boom * 240}`} stroke={C.coral} strokeWidth={6} fill="none" opacity={fly > 0 ? 1 : 0} strokeDasharray="900" strokeDashoffset={900 * (1 - fly)} />
          {boom < 1 ? (
            <g transform={`translate(${-180 + 330 * fly} ${230 - 380 * fly + boom * 200}) rotate(${40 + boom * 70})`}>
              <Icon name="rocket" x={0} y={0} s={1.2} color={C.sky} />
            </g>
          ) : (
            <g transform={`translate(${150} ${110})`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={i} x1={0} y1={0} x2={Math.cos(i) * 60} y2={Math.sin(i) * 60} stroke={C.orange} strokeWidth={10} strokeLinecap="round" />
              ))}
              <circle r={30} fill={C.coral} stroke={OL} strokeWidth={4} />
            </g>
          )}
        </Card>
      </g>
      {/* машина: дорога петляет, руль поправляют */}
      {car > 0 && (
        <g opacity={car}>
          <Card x={cx + 300} y={480} w={520} h={560} fill="#f4fbf6">
            <Txt x={0} y={-226} size={34}>
              машина: правим руль
            </Txt>
            <g transform="translate(0 30) scale(0.82)">
              <path d="M -40 260 C -160 120 160 60 20 -60 C -100 -160 120 -180 60 -260" stroke="#9aa3b5" strokeWidth={70} fill="none" strokeLinecap="round" />
              <path d="M -40 260 C -160 120 160 60 20 -60 C -100 -160 120 -180 60 -260" stroke="#fff" strokeWidth={6} strokeDasharray="20 20" fill="none" />
            </g>
            {(() => {
              const u = clamp01((t - at(c, 1)) / 6) % 1;
              const pts = [
                [-40, 260],
                [0, 140],
                [60, 60],
                [20, -60],
                [-20, -150],
                [60, -260],
              ];
              const f = u * (pts.length - 1);
              const i = Math.min(pts.length - 2, Math.floor(f));
              const r = f - i;
              const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r;
              const y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r;
              const ang = (Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]) * 180) / Math.PI;
              return (
                <g transform={`translate(${x * 0.82} ${y * 0.82 + 30}) rotate(${ang})`}>
                  <Icon name="car" x={0} y={0} s={0.9} color={C.teal} />
                </g>
              );
            })()}
          </Card>
        </g>
      )}
      {loop > 0 && (
        <g transform={`translate(${cx} 860) scale(${loop})`}>
          <Pill x={0} y={0} text="«создать-оценить-научиться»" fill={C.cyanLight} color={C.cyanDeep} stroke={C.cyan} size={40} />
        </g>
      )}
    </g>
  );
};

// ── сырой продукт IMVU: баги, деньги, версии по 10 раз на дню ──
export const RawProduct: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const bugs = ramp(t, at(c, 1), 0.6);
  const money = pop(t, at(c, 1.35));
  const ver = ramp(t, at(c, 1.6), 0.4);
  return (
    <g>
      <Badge x={cx} y={150} kind="history" t={t} at={0.2} />
      <Pop t={t} at={0.3} x={cx - 300} y={500}>
        <g>
          <rect x={-230} y={-170} width={460} height={320} rx={22} fill="#2b3550" stroke={OL} strokeWidth={6} />
          <rect x={-210} y={-150} width={420} height={260} rx={10} fill="#eaf6ff" />
          {/* три аватара */}
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${-120 + i * 120} ${-10 + Math.sin(t * 3 + i) * 6})`}>
              <circle cy={-40} r={26} fill={[C.pink, C.teal, C.gold][i]} stroke={OL} strokeWidth={4} />
              <rect x={-24} y={-14} width={48} height={70} rx={18} fill={[C.pink, C.teal, C.gold][i]} stroke={OL} strokeWidth={4} />
            </g>
          ))}
          <rect x={-40} y={150} width={80} height={40} fill="#59647f" />
          <rect x={-120} y={186} width={240} height={18} rx={9} fill="#59647f" />
          {/* баги */}
          {bugs > 0 &&
            [0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${-170 + ((i * 97 + t * 60) % 340)} ${-120 + ((i * 71) % 220)}) scale(${bugs})`}>
                <ellipse rx={16} ry={11} fill={C.coral} stroke={OL} strokeWidth={3} />
                <path d="M -14 -8 L -22 -16 M 14 -8 L 22 -16 M -16 4 L -26 6 M 16 4 L 26 6" stroke={OL} strokeWidth={3} />
              </g>
            ))}
          <Txt x={0} y={-180} size={28} color={C.inkSoft}>
            трёхмерные аватары
          </Txt>
        </g>
      </Pop>
      {money > 0 && (
        <g transform={`translate(${cx + 230} 360) scale(${money})`}>
          <Icon name="money" x={0} y={0} s={1.4} />
          <Txt x={0} y={90} size={32}>
            брали деньги сразу
          </Txt>
        </g>
      )}
      {ver > 0 && (
        <g transform={`translate(${cx + 230} 640)`} opacity={ver}>
          {Array.from({ length: 10 }).map((_, i) => {
            const k = ramp(t, at(c, 1.6) + i * 0.12, 0.25);
            return <rect key={i} x={-230 + i * 46} y={-40 - k * 20} width={36} height={60} rx={8} fill={C.cyan} stroke={OL} strokeWidth={3} opacity={k} />;
          })}
          <Txt x={0} y={90} size={34}>
            версии «по 10 раз на дню»
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── крупный тезис книги ──
export const BigThesis: React.FC<VisualProps<P & { text?: string }>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, at(c, 0.1));
  const no = pop(t, at(c, 1));
  return (
    <g>
      <QuoteCard x={cx} y={420} w={1040} h={360} text={(c.p.text as string) ?? ""} by="Эрик Рис, «Бизнес с нуля»" k={k} size={62} />
      {no > 0 && (
        <g transform={`translate(${cx} 760) scale(${no})`}>
          <Pill x={-300} y={0} text="не бюрократия" fill={C.coralLight} color={C.coralDeep} stroke={C.coral} size={34} />
          <Pill x={250} y={0} text="управление неизвестным" fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={34} />
        </g>
      )}
    </g>
  );
};

// ── определение стартапа: три части ──
export const Definition: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const parts = [
    { icon: "people" as const, label: "новая\nорганизация", color: C.gold },
    { icon: "bulb" as const, label: "новый продукт\nили услуга", color: C.cyan },
    { icon: "question" as const, label: "чрезвычайная\nнеопределённость", color: C.violet },
  ];
  const where = pop(t, at(c, 1.2));
  return (
    <g>
      <Header x={cx} y={160} text="Стартап — это…" t={t} />
      {parts.map((p, i) => (
        <IconCard key={i} x={cx - 360 + i * 360} y={430} w={320} h={300} icon={p.icon} label={p.label} k={pop(t, spread(c, 0, i, 3, 0.3, 0.9))} color={p.color} size={32} />
      ))}
      {where > 0 && (
        <g transform={`translate(${cx} 720) scale(${where})`}>
          {["гараж", "корпорация", "госорганизация"].map((w, i) => (
            <Pill key={w} x={-360 + i * 360} y={0} text={w} fill={i === 0 ? "#fff" : C.cyanLight} size={34} />
          ))}
        </g>
      )}
    </g>
  );
};

// ── копия понятного бизнеса против настоящей неизвестности ──
export const CopyVsUnknown: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k1 = pop(t, 0.2);
  const k2 = pop(t, at(c, 1));
  return (
    <g>
      {k1 > 0 && (
        <g opacity={clamp01(k1 * 1.5)} transform={`translate(${cx - 290} 470) scale(${k1})`}>
          <Card x={0} y={0} w={500} h={460} fill="#f4f7fb">
            <Txt x={0} y={-180} size={34}>
              копия по готовой схеме
            </Txt>
            {[0, 1].map((i) => (
              <g key={i} transform={`translate(${-110 + i * 220} -10)`}>
                <rect x={-80} y={-70} width={160} height={150} rx={10} fill={C.goldLight} stroke={OL} strokeWidth={4} />
                <path d="M -90 -70 L 0 -120 L 90 -70 Z" fill={C.coral} stroke={OL} strokeWidth={4} />
                <rect x={-24} y={20} width={48} height={60} rx={6} fill="#fff" stroke={OL} strokeWidth={3} />
              </g>
            ))}
            <Txt x={0} y={150} size={30} color={C.inkSoft} weight={700}>
              неизвестного мало
            </Txt>
          </Card>
        </g>
      )}
      {k2 > 0 && (
        <g opacity={clamp01(k2 * 1.5)} transform={`translate(${cx + 290} 470) scale(${k2})`}>
          <Card x={0} y={0} w={500} h={460} fill={C.violetLight}>
            <Txt x={0} y={-180} size={34}>
              стартап
            </Txt>
            {[
              ["нужен ли людям?", -40],
              ["как узнают?", 60],
            ].map(([q, y], i) => (
              <g key={i} transform={`translate(0 ${y as number})`}>
                <Capsule x={0} y={0} w={400} h={80} text={q as string} glow={0.5 + 0.3 * Math.sin(t * 3 + i)} color={C.violet} size={30} />
              </g>
            ))}
            <Icon name="question" x={180} y={-150} s={0.7} color={C.yellow} />
          </Card>
        </g>
      )}
    </g>
  );
};

// ── остров свободы: маленькая команда внутри огромной компании ──
export const IslandTeam: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const corp = pop(t, 0.2);
  const phone = pop(t, at(c, 0.5));
  const isl = ramp(t, at(c, 1.2), 0.8);
  return (
    <g>
      <Badge x={cx} y={140} kind="history" t={t} />
      {corp > 0 && (
        <g opacity={clamp01(corp * 1.4)}>
          {/* большая корпорация: этажи */}
          <rect x={cx - 560} y={220} width={1120} height={560} rx={24} fill="#e4e9f2" stroke={OL} strokeWidth={6} />
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={i} x={cx - 520 + (i % 8) * 132} y={260 + Math.floor(i / 8) * 90} width={100} height={60} rx={8} fill="#fff" stroke="#b9c2d4" strokeWidth={3} />
          ))}
          <Pill x={cx + 380} y={222} text="большая компания" fill="#fff" size={28} />
        </g>
      )}
      {/* остров */}
      {isl > 0 && (
        <g transform={`translate(${cx + 230} 640)`}>
          <ellipse rx={300 * isl} ry={110 * isl} fill={C.cyanLight} stroke={C.cyan} strokeWidth={6} />
          <ellipse rx={200 * isl} ry={60 * isl} fill="#f6e3b4" stroke={OL} strokeWidth={4} />
          {isl > 0.6 &&
            [0, 1, 2, 3, 4].map((i) => <Person key={i} kind={(["founder", "woman", "man", "girl", "worker"] as const)[i]} x={-140 + i * 70} y={20} s={0.36} t={t + i} mood="happy" />)}
          {isl > 0.8 && <Pill x={0} y={110} text="«остров свободы»" fill="#fff" size={32} />}
        </g>
      )}
      {phone > 0 && (
        <g transform={`translate(${cx - 300} 520) scale(${phone * 0.75})`}>
          <Phone x={0} y={0}>
            <rect x={-80} y={-150} width={160} height={210} rx={8} fill="#fff" stroke={C.inkSoft} strokeWidth={4} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={-60} y={-120 + i * 40} width={i % 2 ? 90 : 120} height={14} rx={7} fill={C.greyLight} />
            ))}
            <circle cx={0} cy={140} r={30} fill={C.teal} stroke={OL} strokeWidth={4} />
          </Phone>
          <Txt x={0} y={290} size={40}>
            декларация по фото
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── пять принципов ──
export const FivePrinciples: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = [
    { icon: "people" as const, label: "предприниматели\nповсюду", color: C.gold },
    { icon: "gear" as const, label: "это\nменеджмент", color: C.sky },
    { icon: "check" as const, label: "подтверждение\nфактами", color: C.teal },
    { icon: "loop" as const, label: "создать ·\nоценить ·\nнаучиться", color: C.cyan },
    { icon: "chart" as const, label: "учёт\nинноваций", color: C.violet },
  ];
  const beatsAt = [at(c, 0.2), at(c, 0.45), at(c, 0.75), at(c, 1.05), at(c, 1.35)];
  const alive = ramp(t, at(c, 1.6), 0.6);
  return (
    <g>
      <Header x={cx} y={170} text="Пять принципов" t={t} />
      {items.map((it, i) => {
        const k = pop(t, beatsAt[i]);
        const x = cx - 520 + i * 260;
        const y = 480 + (i % 2) * 60 - alive * Math.sin(t * 3 + i) * 10;
        return <IconCard key={i} x={x} y={y} w={245} h={310} icon={it.icon} label={it.label} k={k} color={it.color} size={30} />;
      })}
      {alive > 0 &&
        [0, 1, 2, 3, 4, 5].map((i) => <Spark key={i} x={cx - 560 + i * 220} y={300 + Math.sin(t * 2 + i) * 30} s={0.7} opacity={alive * (0.5 + 0.5 * Math.sin(t * 4 + i))} />)}
    </g>
  );
};

// ── стартап — один большой эксперимент: продукт в колбе ──
export const BigExperiment: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.2);
  const q1 = pop(t, at(c, 1.25));
  const q2 = pop(t, at(c, 1.6));
  return (
    <g>
      {k > 0 && (
        <g transform={`translate(${cx - 230} 520) scale(${k})`}>
          {/* огромная колба, внутри — «стартап» */}
          <path d="M -70 -300 L 70 -300 L 70 -120 L 220 180 Q 236 220 196 220 L -196 220 Q -236 220 -220 180 L -70 -120 Z" fill={C.cyanLight} stroke={OL} strokeWidth={8} strokeLinejoin="round" />
          <path d="M -150 60 L 150 60 L 210 180 Q 216 206 190 206 L -190 206 Q -216 206 -210 180 Z" fill={C.teal} opacity={0.75} />
          {[0, 1, 2, 3, 4].map((i) => {
            const by = 190 - ((t * 70 + i * 50) % 260);
            return <circle key={i} cx={-100 + i * 50} cy={by} r={8 + (i % 2) * 5} fill="#fff" opacity={0.75} />;
          })}
          <Icon name="rocket" x={0} y={-30} s={1.2} color={C.gold} />
          <rect x={-90} y={-326} width={180} height={34} rx={14} fill="#fff" stroke={OL} strokeWidth={5} />
        </g>
      )}
      <Pop t={t} at={at(c, 0.5)} x={cx + 270} y={330}>
        <Card x={0} y={0} w={460} h={170} fill="#fff">
          <Txt x={0} y={-12} size={34}>
            любой стартап
          </Txt>
          <Txt x={0} y={38} size={34} color={C.tealDeep}>
            = эксперимент
          </Txt>
        </Card>
      </Pop>
      {q1 > 0 && (
        <g transform={`translate(${cx + 270} 580) scale(${q1})`} opacity={1 - q2 * 0.45}>
          <Pill x={0} y={0} text="можем ли построить?" fill="#f1f3f7" color={C.inkSoft} stroke={C.grey} size={32} />
          <line x1={-180} y1={0} x2={180} y2={0} stroke={C.coral} strokeWidth={6} opacity={q2} />
        </g>
      )}
      {q2 > 0 && (
        <g transform={`translate(${cx + 270} 720) scale(${q2})`}>
          <Pill x={0} y={0} text="следует ли создавать?" fill={C.yellow} size={38} />
        </g>
      )}
    </g>
  );
};

