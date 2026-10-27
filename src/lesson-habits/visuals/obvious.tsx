// Закон 1 «Сделайте очевидным»: «показывай и называй» и карточка привычек,
// намерение «когда и где», наложение привычек, окружение (вода в кафе, ваза с яблоками),
// одно место — одно дело, обратный закон — убрать сигнал с глаз.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../theme";
import { OL, Phone, Worker } from "./draw";
import { Arrow, Check, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";
import { Apple, Bottle, Card, Chip, Domino, Formula, Fridge, Icon, TV, zoneX } from "./parts";

export const PointCall: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const train = pop(t, at(c, 1) - 0.2);
  const point = ramp(t, at(c, 1.3), 0.4);
  const card = ramp(t, at(c, 2), 0.6);
  const items = ["проснуться", "проверить телефон", "почистить зубы", "сладкое к чаю", "прогулка"];
  const marks = ["=", "–", "+", "–", "+"];
  const calm = ramp(t, at(c, 4), 0.5);
  const first = 1 - card;
  return (
    <g>
      {/* автопилот: размытые повторяющиеся действия */}
      {first > 0 && (
        <g opacity={first}>
          {t < at(c, 1) &&
            [0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${cx - 300 + i * 300} 420)`} opacity={0.35 + 0.2 * Math.sin(t * 2 + i)}>
                <circle r={100} fill="#fff" />
                <Icon name={["coffee", "page", "clock"][i] as "coffee"} x={0} y={0} s={1.4} />
              </g>
            ))}
          {train > 0 && (
            <g transform={`translate(${cx} 560) scale(${train})`}>
              {/* кабина поезда */}
              <rect x={-420} y={-220} width={560} height={380} rx={40} fill={C.skyDeep} stroke={OL} strokeWidth={6} />
              <rect x={-380} y={-180} width={260} height={170} rx={20} fill="#bfe6fb" stroke={OL} strokeWidth={5} />
              <rect x={-420} y={120} width={560} height={40} fill={OL} />
              <Worker x={-250} y={60} s={1.1} role="clerk" t={t} arms={point * 1.2} />
              {/* сигнал */}
              <g transform="translate(330 -60)">
                <rect x={-10} y={0} width={20} height={240} fill="#4a5874" />
                <rect x={-50} y={-160} width={100} height={170} rx={20} fill={OL} />
                <circle cx={0} cy={-115} r={30} fill="#55606f" />
                <circle cx={0} cy={-40} r={30} fill={C.green} />
                <circle cx={0} cy={-40} r={50} fill={C.green} opacity={0.25 + 0.15 * Math.sin(t * 5)} />
              </g>
              <Arrow x1={-150} y1={-80} x2={250} y2={-100} k={point} color={C.yellowDeep} w={8} />
              {point > 0.6 && (
                <g transform="translate(40 -300)">
                  <rect x={-170} y={-50} width={340} height={100} rx={40} fill="#fff" stroke={OL} strokeWidth={4} />
                  <Txt x={0} y={16} size={46} weight={900} color={C.greenDeep}>
                    «Зелёный!»
                  </Txt>
                </g>
              )}
              <Chip x={-120} y={260} text="показывай и называй" size={32} color={C.yellow} k={pop(t, at(c, 1.6))} />
            </g>
          )}
        </g>
      )}
      {card > 0 && (
        <g opacity={card} transform={`translate(${cx} 470)`}>
          <Card x={0} y={0} w={760} h={600} title="карточка привычек" color={C.sky}>
            {items.map((it, i) => {
              const k = pop(t, at(c, 2.2) + i * 0.35);
              const mk = ramp(t, at(c, 3.1) + i * 0.25, 0.3);
              const m = marks[i];
              return (
                <g key={i} transform={`translate(0 ${-150 + i * 88})`} opacity={clamp01(k * 1.5)}>
                  <circle cx={-310} cy={0} r={9} fill={C.inkSoft} />
                  <text x={-280} y={12} fontFamily={FONT} fontWeight={800} fontSize={36} fill={C.ink}>
                    {it}
                  </text>
                  {mk > 0 && (
                    <g transform={`translate(300 0) scale(${mk})`}>
                      <circle r={34} fill={m === "+" ? C.green : m === "–" ? C.coral : "#c7cdd8"} stroke={OL} strokeWidth={3} />
                      <Txt x={0} y={14} size={44} weight={900} color="#fff">
                        {m}
                      </Txt>
                    </g>
                  )}
                </g>
              );
            })}
          </Card>
          {calm > 0 && (
            <g transform={`translate(0 380) scale(${calm})`}>
              <Tag x={0} y={0} text="только наблюдать, без упрёков" size={34} color="#fff" />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export const Intention: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const groups = [
    { label: "отмечали", v: 0.35, col: "#c7cdd8", at: 0.4 },
    { label: "+ читали о пользе", v: 0.38, col: "#c7cdd8", at: 1.3 },
    { label: "+ план: когда и где", v: 0.91, col: C.green, at: 1.65 },
  ];
  const grow = ramp(t, at(c, 2), 1.2);
  const formula = ramp(t, at(c, 3), 0.6);
  const fill = ramp(t, at(c, 4.2), 0.6);
  const chartOp = 1 - formula;
  return (
    <g>
      <g opacity={chartOp} transform={`translate(0 ${-formula * 120})`}>
        <line x1={cx - 470} y1={700} x2={cx + 470} y2={700} stroke={OL} strokeWidth={6} />
        {groups.map((g, i) => {
          const k = pop(t, at(c, g.at));
          const h = 420 * g.v * grow;
          const x = cx - 300 + i * 300;
          return (
            <g key={i} opacity={clamp01(k * 2)}>
              <rect x={x - 90} y={700 - h} width={180} height={h} rx={14} fill={g.col} stroke={OL} strokeWidth={4} />
              {grow > 0.9 && (
                <Txt x={x} y={680 - h} size={44} weight={900} color={i === 2 ? C.greenDeep : C.inkSoft}>
                  {`${Math.round(g.v * 100)}%`}
                </Txt>
              )}
              {[0, 1, 2].map((p) => (
                <Worker key={p} x={x - 50 + p * 50} y={790} s={0.42} role="plain" color={[C.coral, C.sky, C.violet][p]} t={t + i} />
              ))}
              <Txt x={x} y={850} size={26} color={C.inkSoft}>
                {g.label}
              </Txt>
            </g>
          );
        })}
      </g>
      {formula > 0 && (
        <g opacity={formula} transform={`translate(0 ${(1 - formula) * 40})`}>
          <rect x={cx - 620} y={540} width={1240} height={180} rx={40} fill="#fff" stroke={OL} strokeWidth={5} />
          <Formula
            x={cx}
            y={630}
            size={40}
            parts={[
              { text: "Я буду" },
              { text: "ДЕЙСТВИЕ", slot: true, fill: "медитировать 1 мин", k: fill },
              { text: "в" },
              { text: "ВРЕМЯ", slot: true, fill: "7 утра", k: ramp(t, at(c, 4.4), 0.5) },
              { text: "в" },
              { text: "МЕСТО", slot: true, fill: "на кухне", k: ramp(t, at(c, 4.6), 0.5) },
            ]}
          />
          <Chip x={cx} y={790} text="не мотивация, а ясность" size={34} color={C.yellow} k={pop(t, at(c, 3.6))} />
        </g>
      )}
    </g>
  );
};

export const Stacking: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const chain = ["кофе", "медитация", "список дел", "первое дело"];
  const formula = pop(t, at(c, 1) - 0.1);
  const topple = ramp(t, at(c, 2), 1.4);
  const vague = ramp(t, at(c, 3), 0.5);
  const crisp = ramp(t, at(c, 3.6), 0.5);
  const top = 1 - vague;
  return (
    <g>
      <g opacity={top}>
        {formula > 0 && (
          <g transform={`translate(${cx} 210) scale(${formula})`}>
            <rect x={-560} y={-60} width={1120} height={120} rx={36} fill="#fff" stroke={OL} strokeWidth={5} />
            <Formula
              x={0}
              y={0}
              size={36}
              parts={[
                { text: "После" },
                { text: "ПРИВЫЧНОЕ ДЕЛО", slot: true, fill: "утренний кофе", k: ramp(t, at(c, 1.4), 0.4) },
                { text: "я сделаю" },
                { text: "НОВОЕ", slot: true, fill: "1 мин медитации", k: ramp(t, at(c, 1.6), 0.4) },
              ]}
            />
          </g>
        )}
        {chain.map((l, i) => {
          const k = pop(t, at(c, 1.2) + i * 0.25);
          const f = clamp01(topple * chain.length - i);
          return (
            <g key={i} opacity={clamp01(k * 2)}>
              <Domino x={cx - 420 + i * 260} y={680} s={1.1} fall={f} label={l} color={i === 0 ? "#fff3d6" : "#fff"} />
            </g>
          );
        })}
      </g>
      {vague > 0 && (
        <g>
          <g transform={`translate(${cx - 290} 520) scale(${vague})`}>
            <rect x={-260} y={-140} width={520} height={280} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-50} size={36} color={C.inkSoft}>
              «в обед сделаю
            </Txt>
            <Txt x={0} y={0} size={36} color={C.inkSoft}>
              отжимания»
            </Txt>
            <Txt x={0} y={80} size={30} color={C.red}>
              до обеда? после? где?
            </Txt>
            <g opacity={0.5 + 0.2 * Math.sin(t * 3)}>
              <Txt x={210} y={-90} size={60} weight={900} color={C.red}>
                ?
              </Txt>
            </g>
          </g>
          {crisp > 0 && (
            <g transform={`translate(${cx + 290} 520) scale(${crisp})`}>
              <rect x={-260} y={-140} width={520} height={280} rx={30} fill="#d9f5e5" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={-60} size={32}>
                «Когда закрою ноутбук
              </Txt>
              <Txt x={0} y={-16} size={32}>
                перед обедом —
              </Txt>
              <Txt x={0} y={28} size={32}>
                10 отжиманий у стола»
              </Txt>
              <Check x={0} y={90} s={40} k={ramp(t, at(c, 3.9), 0.5)} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export const Environment: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const cafe = pop(t, at(c, 0) + 0.2);
  const water = ramp(t, at(c, 1), 1.2);
  const bars = ramp(t, at(c, 2), 1);
  const apples = ramp(t, at(c, 3), 0.5);
  const bowl = ramp(t, at(c, 3.5), 0.8);
  const arch = ramp(t, at(c, 4), 0.6);
  const first = 1 - apples;
  return (
    <g>
      {first > 0 && (
        <g opacity={first * clamp01(cafe * 2)}>
          {[0, 1].map((f) => (
            <Fridge key={f} x={cx - 420 + f * 300} y={780} s={0.95}>
              {[0, 1, 2].map((row) =>
                [0, 1, 2].map((col) => {
                  const isWater = (row + col + f) % 3 === 0 ? water > (row * 3 + col) / 9 : false;
                  return <Bottle key={`${row}-${col}`} x={-70 + col * 70} y={-300 + row * 130} s={0.62} kind={isWater ? "water" : "soda"} />;
                }),
              )}
            </Fridge>
          ))}
          {/* корзина с водой у еды */}
          <g transform={`translate(${cx + 60} 700) scale(${water})`}>
            <path d="M -110 -40 L 110 -40 L 90 60 L -90 60 Z" fill={C.wood} stroke={OL} strokeWidth={5} />
            {[0, 1, 2, 3].map((i) => (
              <Bottle key={i} x={-75 + i * 50} y={-40} s={0.5} kind="water" />
            ))}
          </g>
          {bars > 0 && (
            <g transform={`translate(${cx + 380} 640)`}>
              {[
                { label: "газировка", v: -0.114, col: C.red },
                { label: "вода", v: 0.258, col: C.skyDeep },
              ].map((b, i) => {
                const h = Math.abs(b.v) * 900 * bars;
                return (
                  <g key={i} transform={`translate(${i * 170 - 85} 0)`}>
                    <rect x={-55} y={b.v > 0 ? -h : 0} width={110} height={h} rx={10} fill={b.col} stroke={OL} strokeWidth={4} />
                    <Txt x={0} y={b.v > 0 ? -h - 20 : h + 50} size={36} weight={900} color={b.col}>
                      {b.v > 0 ? "↑" : "↓"}
                    </Txt>
                    <Txt x={0} y={b.v > 0 ? 50 : -24} size={28}>
                      {b.label}
                    </Txt>
                  </g>
                );
              })}
              <line x1={-170} y1={0} x2={170} y2={0} stroke={OL} strokeWidth={5} />
            </g>
          )}
        </g>
      )}
      {apples > 0 && (
        <g opacity={apples}>
          {/* холодильник с ящиком: яблоки спрятаны */}
          <g transform={`translate(${cx - 330} 760)`} opacity={1 - bowl * 0.6}>
            <rect x={-150} y={-460} width={300} height={480} rx={26} fill="#f3f6fa" stroke={OL} strokeWidth={6} />
            <rect x={-130} y={-130} width={260} height={120} rx={12} fill="#dfe8f2" stroke={OL} strokeWidth={4} />
            {[0, 1, 2].map((i) => (
              <Apple key={i} x={-60 + i * 60} y={-60} s={0.7} />
            ))}
            <Txt x={0} y={-180} size={30} color={C.inkSoft}>
              не видно — не ем
            </Txt>
          </g>
          {bowl > 0 && (
            <g transform={`translate(${cx + 260} 700)`}>
              <rect x={-330} y={40} width={660} height={30} rx={10} fill={C.wood} stroke={OL} strokeWidth={5} />
              <path d="M -150 -10 Q -140 60 0 64 Q 140 60 150 -10 Z" fill="#fff" stroke={OL} strokeWidth={5} />
              {[0, 1, 2, 3, 4].map((i) => {
                const k = clamp01(bowl * 5 - i);
                return <Apple key={i} x={-100 + i * 50} y={-20 - (i % 2) * 34 - (1 - k) * 300} s={0.9} rot={wob(t, i, 6)} color={i % 2 ? C.red : "#e5484d"} />;
              })}
              <Txt x={0} y={130} size={30} color={C.greenDeep}>
                на виду — ем каждый день
              </Txt>
            </g>
          )}
          {arch > 0 && (
            <g transform={`translate(${cx} 210) scale(${arch})`}>
              <Tag x={0} y={0} text="не жертва окружения, а его архитектор" size={36} color={C.yellow} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export const Context: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const sofa = pop(t, 0.2);
  const bed = ramp(t, at(c, 1), 0.5);
  const zones = ramp(t, at(c, 2), 0.5);
  const phone = ramp(t, at(c, 3), 0.5);
  const Sofa: React.FC<{ x: number; y: number }> = ({ x, y }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-200} y={-120} width={400} height={110} rx={30} fill={C.violet} stroke={OL} strokeWidth={5} />
      <rect x={-230} y={-40} width={460} height={90} rx={26} fill="#a78bfa" stroke={OL} strokeWidth={5} />
      <rect x={-200} y={50} width={20} height={30} fill={OL} />
      <rect x={180} y={50} width={20} height={30} fill={OL} />
    </g>
  );
  const show1 = 1 - bed;
  const show2 = bed * (1 - zones);
  const show3 = zones * (1 - phone);
  return (
    <g>
      {show1 > 0 && (
        <g opacity={show1 * clamp01(sofa * 2)}>
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${cx - 290 + i * 580} 0)`}>
              <Sofa x={0} y={640} />
              <Worker x={0} y={600} s={1} role="plain" color={i ? C.coral : C.sky} t={t} />
              {i === 0 && <Icon name="book" x={60} y={520} s={1.1} />}
              {i === 1 && <TV x={0} y={300} s={0.8} on={1} t={t} />}
              {i === 0 && <Icon name="bulb" x={0} y={320} s={1.4} />}
              <Txt x={0} y={820} size={32}>
                {i === 0 ? "здесь читают" : "здесь сериалы"}
              </Txt>
            </g>
          ))}
        </g>
      )}
      {show2 > 0 && (
        <g opacity={show2} transform={`translate(${cx} 600)`}>
          <rect x={-320} y={-60} width={640} height={120} rx={20} fill="#fff" stroke={OL} strokeWidth={5} />
          <rect x={-320} y={-160} width={90} height={220} rx={20} fill={C.wood} stroke={OL} strokeWidth={5} />
          <rect x={-220} y={-110} width={150} height={60} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
          <rect x={-100} y={-70} width={400} height={50} rx={20} fill={C.sky} stroke={OL} strokeWidth={4} />
          <Icon name="moon" x={240} y={-260} s={2} />
          {[0, 1, 2].map((i) => (
            <text key={i} x={120 + i * 50} y={-180 - i * 30 - ((t * 20) % 30)} fontFamily={FONT} fontWeight={900} fontSize={40 + i * 8} fill={C.inkSoft} opacity={0.7}>
              z
            </text>
          ))}
          <Txt x={0} y={150} size={34}>
            кровать — только для сна
          </Txt>
        </g>
      )}
      {show3 > 0 && (
        <g opacity={show3}>
          <rect x={cx - 560} y={250} width={1120} height={560} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
          <line x1={cx} y1={250} x2={cx} y2={810} stroke={OL} strokeWidth={4} strokeDasharray="16 12" />
          <g transform={`translate(${cx - 280} 620)`}>
            <rect x={-110} y={-150} width={220} height={190} rx={40} fill={C.coral} stroke={OL} strokeWidth={5} />
            <rect x={-140} y={-20} width={280} height={80} rx={26} fill={C.coral} stroke={OL} strokeWidth={5} />
            <Icon name="book" x={0} y={-220} s={1.4} />
            <Txt x={0} y={150} size={32}>
              кресло — чтение
            </Txt>
          </g>
          <g transform={`translate(${cx + 280} 620)`}>
            <rect x={-200} y={-30} width={400} height={30} rx={8} fill={C.wood} stroke={OL} strokeWidth={5} />
            <rect x={-180} y={0} width={20} height={100} fill={C.wood} stroke={OL} strokeWidth={4} />
            <rect x={160} y={0} width={20} height={100} fill={C.wood} stroke={OL} strokeWidth={4} />
            <rect x={-80} y={-150} width={160} height={110} rx={10} fill="#2b3a67" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={150} size={32}>
              стол — работа
            </Txt>
          </g>
          <Chip x={cx} y={200} text="одно пространство — одно занятие" size={36} color={C.yellow} k={pop(t, at(c, 2.3))} />
        </g>
      )}
      {phone > 0 && (
        <g opacity={phone}>
          <Phone x={cx} y={480} s={1.4} />
          {["page", "star", "heart", "clock", "book", "eye", "coffee", "pin"].map((n, i) => {
            const a = (i / 8) * Math.PI * 2 + t * 0.8;
            const r = 280 + Math.sin(t * 2 + i) * 30;
            return (
              <g key={i} transform={`translate(${cx + Math.cos(a) * r} ${480 + Math.sin(a) * r * 0.8})`}>
                <circle r={50} fill="#fff" stroke={OL} strokeWidth={4} />
                <Icon name={n as "page"} x={0} y={0} s={0.8} />
              </g>
            );
          })}
          <Chip x={cx} y={800} text="всё сразу — сбивает с курса" size={34} color="#ffe0d9" k={pop(t, at(c, 3.3))} />
        </g>
      )}
    </g>
  );
};

export const Invisible: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const willK = pop(t, 0.2);
  const horse = ramp(t, at(c, 1), 0.5);
  const remove = ramp(t, at(c, 2), 0.5);
  const move = ramp(t, at(c, 2.4), 1.4);
  const sliders = ramp(t, at(c, 3), 0.5);
  const s1 = 1 - horse;
  const s2 = horse * (1 - remove);
  const s3 = remove * (1 - sliders);
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1 * clamp01(willK * 2)}>
          {/* человек против соблазна — тяжело; человек убрал соблазн — легко */}
          <g transform={`translate(${cx - 280} 640)`}>
            <Worker x={0} y={0} s={1.3} role="plain" color={C.coral} t={t} mood="flat" arms={0.8} />
            <g transform={`translate(160 -60) rotate(${wob(t, 1, 8)})`}>
              <rect x={-60} y={-40} width={120} height={80} rx={14} fill={C.pink} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={12} size={26} weight={900}>
                соблазн
              </Txt>
            </g>
            <Txt x={0} y={150} size={30} color={C.red}>
              бороться каждый день
            </Txt>
          </g>
          <g transform={`translate(${cx + 280} 640)`}>
            <Worker x={0} y={0} s={1.3} role="plain" color={C.green} t={t} />
            <g transform="translate(150 -100)">
              <rect x={-80} y={-110} width={160} height={220} rx={10} fill={C.wood} stroke={OL} strokeWidth={5} />
              <circle cx={50} cy={0} r={10} fill={C.yellowDeep} stroke={OL} strokeWidth={3} />
            </g>
            <Txt x={0} y={150} size={30} color={C.greenDeep}>
              устроить так, чтобы не бороться
            </Txt>
          </g>
        </g>
      )}
      {s2 > 0 && (
        <g opacity={s2}>
          {/* лошадь и всплывшее желание */}
          <g transform={`translate(${cx - 120} 640)`}>
            <path d="M -180 -40 Q -150 -150 40 -140 Q 140 -140 170 -220 L 230 -200 Q 210 -120 160 -70 L 150 60 L 120 60 L 110 -30 L -110 -30 L -120 60 L -150 60 Z" fill="#b07a45" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
            <circle cx={200} cy={-196} r={8} fill={OL} />
            <path d="M 170 -222 L 160 -258 L 186 -232" fill="#b07a45" stroke={OL} strokeWidth={4} />
            <Worker x={-10} y={-90} s={0.9} role="plain" color={C.sky} t={t} />
          </g>
          <g transform={`translate(${cx + 330} 330) scale(${pop(t, at(c, 1.4))})`}>
            <rect x={-230} y={-80} width={460} height={160} rx={60} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-12} size={34}>
              «ой, захотелось
            </Txt>
            <Txt x={0} y={34} size={34}>
              сигарету…»
            </Txt>
          </g>
          <Chip x={cx} y={830} text="привычку можно бросить, но не забыть" size={32} color="#fff" k={pop(t, at(c, 1.7))} />
        </g>
      )}
      {s3 > 0 && (
        <g opacity={s3}>
          {/* стена между комнатами; телефон и телевизор уходят за дверь */}
          <rect x={cx + 120} y={220} width={30} height={600} fill={OL} opacity={0.75} />
          <rect x={cx + 115} y={430} width={40} height={220} fill="#fff" stroke={OL} strokeWidth={3} />
          <Txt x={cx + 380} y={260} size={30} color={C.inkSoft}>
            другая комната
          </Txt>
          <Txt x={cx - 300} y={260} size={30} color={C.inkSoft}>
            рабочее место
          </Txt>
          <rect x={cx - 520} y={640} width={420} height={26} rx={8} fill={C.wood} stroke={OL} strokeWidth={4} />
          <Worker x={cx - 310} y={630} s={1.1} role="clerk" t={t} />
          <g transform={`translate(${interpolate(move, [0, 1], [cx - 160, cx + 380])} ${interpolate(move, [0, 0.5, 1], [600, 520, 600])})`}>
            <Phone x={0} y={0} s={0.5} />
          </g>
          <g transform={`translate(${interpolate(clamp01(move * 1.3 - 0.3), [0, 1], [cx - 160, cx + 400])} 420)`}>
            <TV x={0} y={0} s={0.45} on={0} t={t} />
          </g>
          {move > 0.9 && <Check x={cx - 310} y={420} s={44} k={ramp(t, at(c, 2.8), 0.4)} />}
        </g>
      )}
      {sliders > 0 && (
        <g opacity={sliders}>
          {[
            { label: "полезное", good: true },
            { label: "вредное", good: false },
          ].map((s, i) => {
            const k = ramp(t, at(c, 3.2) + i * 0.4, 0.8);
            const pos = s.good ? k : 1 - k;
            return (
              <g key={i} transform={`translate(${cx} ${380 + i * 230})`}>
                <Txt x={-470} y={14} size={38} anchor="start">
                  {s.label}
                </Txt>
                <rect x={-180} y={-24} width={520} height={48} rx={24} fill="#fff" stroke={OL} strokeWidth={4} />
                <Txt x={-140} y={-50} size={24} color={C.inkSoft}>
                  не видно
                </Txt>
                <Txt x={300} y={-50} size={24} color={C.inkSoft}>
                  на виду
                </Txt>
                <circle cx={-150 + pos * 460} cy={0} r={40} fill={s.good ? C.green : C.coral} stroke={OL} strokeWidth={5} />
                <Icon name="eye" x={-150 + pos * 460} y={0} s={0.55} />
              </g>
            );
          })}
          <Chip x={cx} y={190} text="самоконтроль — на короткой дистанции" size={32} color={C.yellow} k={pop(t, at(c, 3.5))} />
        </g>
      )}
    </g>
  );
};
