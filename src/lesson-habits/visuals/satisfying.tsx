// Закон 4 «Сделайте приятным»: мыло с пеной и главное правило, «сейчас» против «потом»,
// видимый отказ (копилка «Путешествие»), скрепки и трекер, «не пропускайте дважды»,
// закон Гудхарта, обратный закон — договор и партнёр.
import React from "react";
import { interpolate } from "remotion";
import { C } from "../theme";
import { Heart, OL, Worker } from "./draw";
import { Arrow, Check, Cross, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";
import { Chip, Clip, Contract, Icon, Jar, Scale, WeekStrip, XMark, zoneX } from "./parts";

export const Soap: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const knew = ramp(t, at(c, 1), 0.5);
  const soap = ramp(t, at(c, 2), 0.6);
  const rule = ramp(t, at(c, 3), 0.6);
  const s1 = 1 - rule;
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1}>
          {/* умывальник */}
          <g transform={`translate(${cx - 220} 640)`}>
            <path d="M -200 0 L 200 0 Q 180 120 0 130 Q -180 120 -200 0 Z" fill="#fff" stroke={OL} strokeWidth={6} />
            <rect x={-20} y={-160} width={40} height={140} rx={10} fill="#9aa5b8" stroke={OL} strokeWidth={4} />
            <path d="M -20 -160 L -100 -160 L -100 -120" stroke="#9aa5b8" strokeWidth={30} fill="none" strokeLinecap="round" />
            {/* руки */}
            <g transform={`translate(0 -30) rotate(${Math.sin(t * 6) * 8})`}>
              <ellipse cx={-30} cy={0} rx={50} ry={30} fill="#f2c79b" stroke={OL} strokeWidth={4} />
              <ellipse cx={30} cy={6} rx={50} ry={30} fill="#f2c79b" stroke={OL} strokeWidth={4} />
            </g>
            {/* пена */}
            {soap > 0 &&
              Array.from({ length: 14 }).map((_, i) => {
                const ph = (t * 0.5 + i / 14) % 1;
                return <circle key={i} cx={Math.sin(i * 2.3) * 90 + Math.sin(t + i) * 10} cy={-40 - ph * 260} r={10 + (i % 4) * 6} fill="#fff" stroke="#9fd8f6" strokeWidth={3} opacity={soap * (1 - ph)} />;
              })}
          </g>
          {knew > 0 && soap < 1 && (
            <g transform={`translate(${cx + 300} 330)`} opacity={knew * (1 - soap * 0.6)}>
              <rect x={-230} y={-90} width={460} height={180} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={-20} size={32}>
                знали: важно
              </Txt>
              <Txt x={0} y={36} size={32} color={C.red}>
                делали: редко
              </Txt>
            </g>
          )}
          {soap > 0 && (
            <g transform={`translate(${cx + 300} 380)`} opacity={soap}>
              <rect x={-200} y={-60} width={400} height={120} rx={50} fill={C.pink} stroke={OL} strokeWidth={5} />
              <Txt x={0} y={14} size={40} weight={900}>
                приятное мыло
              </Txt>
              {["пенится", "пахнет"].map((l, i) => (
                <Chip key={i} x={-90 + i * 180} y={130} text={l} size={30} color="#fff" k={pop(t, at(c, 2.3) + i * 0.3)} />
              ))}
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${-120 + i * 120} ${290 + wob(t, i, 6)}) scale(${pop(t, at(c, 2.8) + i * 0.3)})`}>
                  <Heart x={0} y={0} s={1.6} color={C.green} />
                </g>
              ))}
              <Txt x={0} y={380} size={28} color={C.greenDeep}>
                дети болеют меньше (по автору)
              </Txt>
            </g>
          )}
        </g>
      )}
      {rule > 0 && (
        <g opacity={rule}>
          <circle cx={cx} cy={480} r={230} fill="none" stroke="#fff" strokeWidth={40} />
          {[
            { label: "действие", col: C.sky, a: -Math.PI / 2 },
            { label: "награда", col: C.yellow, a: Math.PI / 6 },
            { label: "повтор", col: C.green, a: (5 * Math.PI) / 6 },
          ].map((n, i) => (
            <g key={i} transform={`translate(${cx + Math.cos(n.a) * 230} ${480 + Math.sin(n.a) * 230}) scale(${pop(t, at(c, 3.1) + i * 0.4)})`}>
              <circle r={90} fill={n.col} stroke={OL} strokeWidth={5} />
              <Txt x={0} y={12} size={30} weight={900}>
                {n.label}
              </Txt>
            </g>
          ))}
          <Txt x={cx} y={480} size={30} color={C.inkSoft}>
            главное правило
          </Txt>
          <Txt x={cx} y={790} size={34}>
            что вознаграждается — повторяется
          </Txt>
        </g>
      )}
    </g>
  );
};

export const Delayed: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const now = pop(t, 0.2);
  const pairs = ramp(t, at(c, 1), 0.6);
  const fix = ramp(t, at(c, 3), 0.6);
  const sweet = (
    <g>
      <circle r={36} fill={C.pink} stroke={OL} strokeWidth={4} />
      <circle r={12} fill="#fff" opacity={0.6} />
    </g>
  );
  return (
    <g>
      {/* мозг выбирает «сейчас» */}
      <g opacity={1 - pairs}>
        <Scale x={cx} y={460} s={1.1 * now} tilt={-0.9} left={<Txt x={0} y={-10} size={36} weight={900}>сейчас</Txt>} right={<Txt x={0} y={-10} size={30} color={C.inkSoft}>потом</Txt>} />
      </g>
      {pairs > 0 && (
        <g opacity={pairs}>
          {[
            { title: "вредная привычка", now: "удовольствие", later: "расплата", good: false },
            { title: "полезная привычка", now: "усилие", later: "награда", good: true },
          ].map((p, i) => {
            const k = pop(t, at(c, 1.1) + i * 0.7);
            return (
              <g key={i} transform={`translate(${cx} ${330 + i * 250}) scale(${k})`}>
                <Txt x={-470} y={12} size={32} anchor="start" weight={900} color={p.good ? C.greenDeep : C.red}>
                  {p.title}
                </Txt>
                <g transform="translate(40 0)">
                  <rect x={-90} y={-60} width={220} height={120} rx={26} fill={p.good ? "#ffe0d9" : "#d9f5e5"} stroke={OL} strokeWidth={4} />
                  <Txt x={20} y={-16} size={22} color={C.inkSoft}>
                    сейчас
                  </Txt>
                  <Txt x={20} y={26} size={28}>
                    {p.now}
                  </Txt>
                </g>
                <Arrow x1={180} y1={0} x2={250} y2={0} k={ramp(t, at(c, 1.3) + i * 0.7, 0.4)} color={C.inkSoft} w={7} />
                <g transform="translate(380 0)">
                  <rect x={-110} y={-60} width={220} height={120} rx={26} fill={p.good ? "#d9f5e5" : "#ffe0d9"} stroke={OL} strokeWidth={4} />
                  <Txt x={0} y={-16} size={22} color={C.inkSoft}>
                    потом
                  </Txt>
                  <Txt x={0} y={26} size={28}>
                    {p.later}
                  </Txt>
                </g>
                {!p.good && <g transform="translate(-90 -70)">{sweet}</g>}
              </g>
            );
          })}
          {fix > 0 && (
            <g transform={`translate(${cx} 800)`}>
              <Tag x={0} y={0} text="полезному — немного удовольствия сразу" size={32} color={C.yellow} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export const Savings: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const empty = pop(t, 0.2);
  const jar = ramp(t, at(c, 1), 0.5);
  const fill = ramp(t, at(c, 1.2), Math.max(1, at(c, 1.9) - at(c, 1.2)));
  const match = ramp(t, at(c, 2), 0.6);
  const s0 = 1 - jar;
  const s1 = jar * (1 - match);
  return (
    <g>
      {s0 > 0 && (
        <g opacity={s0 * clamp01(empty * 2)}>
          <g transform={`translate(${cx} 480)`}>
            <rect x={-200} y={-150} width={400} height={300} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
            <path d="M -120 -60 L 120 -60 L 100 90 L -100 90 Z" fill={C.coral} stroke={OL} strokeWidth={4} opacity={0.5} />
            <Cross x={0} y={10} s={180} k={ramp(t, at(c, 0.3), 0.5)} />
            <Txt x={0} y={220} size={32} color={C.inkSoft}>
              не купил лишнего — и ничего не случилось
            </Txt>
          </g>
        </g>
      )}
      {s1 > 0 && (
        <g opacity={s1}>
          {[0, 1, 2, 3, 4].map((i) => {
            const k = clamp01(fill * 5 - i);
            return (
              <g key={i} transform={`translate(${cx - 460} ${280 + i * 110})`} opacity={clamp01(k * 3)}>
                <rect x={-110} y={-40} width={220} height={80} rx={20} fill="#fff" stroke={OL} strokeWidth={3} />
                <Txt x={0} y={12} size={28} color={C.inkSoft}>
                  ресторан
                </Txt>
                <line x1={-90} y1={0} x2={90} y2={0} stroke={C.red} strokeWidth={6} opacity={k} />
              </g>
            );
          })}
          {Array.from({ length: 5 }).map((_, i) => {
            const k = clamp01((fill * 5 - i) * 1.2);
            if (k <= 0 || k >= 1) return null;
            const x = interpolate(k, [0, 1], [cx - 330, cx + 60]);
            const y = interpolate(k, [0, 0.5, 1], [280 + i * 110, 230, 520]);
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <circle r={26} fill={C.yellow} stroke={OL} strokeWidth={4} />
              </g>
            );
          })}
          <Jar x={cx + 60} y={760} s={1.3} fill={fill * 0.9} label="Путешествие" color={C.yellow} />
          {fill > 0.95 && (
            <g transform={`translate(${cx + 380} 380) scale(${pop(t, at(c, 1.85))}) rotate(${wob(t, 1, 3)})`}>
              <path d="M -100 0 L 90 -30 Q 120 -30 110 -6 L -100 20 Z" fill="#fff" stroke={OL} strokeWidth={4} />
              <path d="M 0 -10 L -40 -70 L -20 -70 L 30 -14 Z" fill={C.skyDeep} stroke={OL} strokeWidth={3} />
              <Txt x={0} y={80} size={30}>
                в путь!
              </Txt>
            </g>
          )}
        </g>
      )}
      {match > 0 && (
        <g opacity={match}>
          <Txt x={cx} y={220} size={38} weight={900}>
            награда за тренировку
          </Txt>
          <g transform={`translate(${cx - 270} 520) scale(${pop(t, at(c, 2.3))})`}>
            <rect x={-220} y={-190} width={440} height={380} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
            <path d="M -60 -20 L 60 -20 L 0 140 Z" fill="#e8b27a" stroke={OL} strokeWidth={5} />
            <circle cx={-30} cy={-50} r={50} fill={C.pink} stroke={OL} strokeWidth={4} />
            <circle cx={30} cy={-70} r={50} fill="#fff3d6" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={170} size={30} color={C.red}>
              тянет в другую сторону
            </Txt>
            <Cross x={150} y={-130} s={70} k={ramp(t, at(c, 2.5), 0.4)} />
          </g>
          <g transform={`translate(${cx + 270} 520) scale(${pop(t, at(c, 2.7))})`}>
            <rect x={-220} y={-190} width={440} height={380} rx={30} fill="#d9f5e5" stroke={OL} strokeWidth={4} />
            <Worker x={0} y={60} s={1.2} role="masseur" t={t} />
            <Heart x={110} y={-110} s={1.6} color={C.green} />
            <Txt x={0} y={170} size={30} color={C.greenDeep}>
              забота о том же теле
            </Txt>
            <Check x={-150} y={-130} s={40} k={ramp(t, at(c, 2.9), 0.4)} />
          </g>
        </g>
      )}
    </g>
  );
};

export const Paperclips: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const jars = pop(t, 0.2);
  const move = ramp(t, at(c, 1), Math.max(1.2, at(c, 1.95) - at(c, 1)));
  const tracker = ramp(t, at(c, 2), 0.6);
  const after = ramp(t, at(c, 3), 0.5);
  const N = 24;
  const moved = Math.floor(move * N);
  const s0 = 1 - tracker;
  return (
    <g>
      {s0 > 0 && (
        <g opacity={s0 * clamp01(jars * 2)}>
          <rect x={cx - 560} y={720} width={1120} height={30} rx={10} fill={C.wood} stroke={OL} strokeWidth={5} />
          <Jar x={cx - 280} y={720} s={1.2} />
          <Jar x={cx + 280} y={720} s={1.2} />
          {Array.from({ length: N }).map((_, i) => {
            const done = i < moved;
            const jx = done ? cx + 280 : cx - 280;
            const idx = done ? i : N - 1 - (i - moved);
            const px = jx - 90 + (idx % 6) * 36;
            const py = 690 - Math.floor(idx / 6) * 50;
            return <Clip key={i} x={px} y={py} s={0.8} rot={(i * 47) % 60 - 30} color={done ? C.skyDeep : "#8a94a8"} />;
          })}
          {/* скрепка в полёте */}
          {move > 0 && move < 1 && (() => {
            const f = (move * N) % 1;
            const x = interpolate(f, [0, 1], [cx - 280, cx + 280]);
            const y = 480 - Math.sin(f * Math.PI) * 160;
            return <Clip x={x} y={y} s={1.2} rot={f * 360} color={C.skyDeep} />;
          })()}
          <Txt x={cx - 280} y={820} size={30}>
            120 скрепок
          </Txt>
          <Txt x={cx + 280} y={820} size={30}>
            звонок → скрепка
          </Txt>
        </g>
      )}
      {tracker > 0 && (
        <g opacity={tracker}>
          <g transform={`translate(${cx} 470)`}>
            <rect x={-520} y={-250} width={1040} height={500} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
            <rect x={-520} y={-250} width={1040} height={70} rx={30} fill={C.coral} stroke={OL} strokeWidth={5} />
            <rect x={-518} y={-200} width={1036} height={22} fill={C.coral} />
            <Txt x={0} y={-200} size={36} color="#fff" weight={900}>
              трекер привычки
            </Txt>
            {Array.from({ length: 21 }).map((_, i) => {
              const col = i % 7;
              const row = Math.floor(i / 7);
              const x = -420 + col * 140;
              const y = -100 + row * 120;
              const k = ramp(t, at(c, 2.2) + i * 0.12, 0.3);
              return (
                <g key={i}>
                  <rect x={x - 54} y={y - 46} width={108} height={92} rx={14} fill="#fffaf0" stroke={OL} strokeWidth={3} />
                  <XMark x={x} y={y} s={1.3} k={k} color={C.green} />
                </g>
              );
            })}
          </g>
          {["напоминает", "мотивирует", "радует"].map((w, i) => (
            <Chip key={i} x={cx - 360 + i * 360} y={800} text={w} size={32} color={[C.sky, C.pink, C.yellow][i]} k={pop(t, at(c, 2.6) + i * 0.35) * (1 - after)} />
          ))}
          {after > 0 && (
            <g transform={`translate(${cx} 800) scale(${after})`}>
              <Tag x={0} y={0} text="отметить сразу после дела" size={34} color={C.yellow} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export const NeverTwice: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const strip = ramp(t, 0.2, 1.4);
  const rule = ramp(t, at(c, 1), 0.6);
  const all = ramp(t, at(c, 2), 0.6);
  const bad = ramp(t, at(c, 3), 0.6);
  // неделя: 1 пропуск — восстановились; 2 подряд — новая привычка
  const missOne = [true, true, true, false, true, true, true];
  const missTwo = [true, true, false, false, false, false, false];
  const s0 = 1 - all;
  return (
    <g>
      {s0 > 0 && (
        <g opacity={s0}>
          <g transform="translate(0 0)">
            <WeekStrip x={cx} y={330} cell={120} shown={strip * 7} done={missOne} />
            {missOne.map((d, i) => (
              <g key={i}>
                {d ? (
                  <XMark x={cx + (i - 3) * 134} y={350} s={1.1} k={clamp01(strip * 7 - i)} />
                ) : (
                  <circle cx={cx + (i - 3) * 134} cy={350} r={26} fill={C.yellow} stroke={OL} strokeWidth={3} opacity={clamp01(strip * 7 - i)} />
                )}
              </g>
            ))}
            <Txt x={cx} y={460} size={30} color={C.greenDeep} opacity={rule}>
              один пропуск — случайность
            </Txt>
          </g>
          {rule > 0 && (
            <g opacity={rule}>
              <WeekStrip x={cx} y={620} cell={120} shown={7} done={missTwo} />
              {missTwo.map((d, i) => (
                <g key={i}>{d ? <XMark x={cx + (i - 3) * 134} y={640} s={1.1} k={1} /> : <circle cx={cx + (i - 3) * 134} cy={640} r={26} fill={i < 4 ? C.coral : "#dfe3ea"} stroke={OL} strokeWidth={3} />}</g>
              ))}
              <Txt x={cx} y={750} size={30} color={C.red}>
                два подряд — начало новой привычки
              </Txt>
              <g transform={`translate(${cx} 180) scale(${pop(t, at(c, 1.3))})`}>
                <rect x={-420} y={-56} width={840} height={112} rx={56} fill={C.yellow} stroke={OL} strokeWidth={5} />
                <Txt x={0} y={16} size={46} weight={900}>
                  не пропускайте дважды
                </Txt>
              </g>
            </g>
          )}
        </g>
      )}
      {all > 0 && (
        <g opacity={all}>
          <g transform={`translate(${cx - 280} 480)`}>
            <rect x={-230} y={-200} width={460} height={400} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-120} size={34} color={C.inkSoft}>
              «всё или ничего»
            </Txt>
            <Txt x={0} y={20} size={90} weight={900} color={C.red}>
              0
            </Txt>
            <Cross x={0} y={-10} s={160} k={ramp(t, at(c, 2.6), 0.4)} />
          </g>
          <g transform={`translate(${cx + 280} 480) scale(${pop(t, at(c, 2.5))})`}>
            <rect x={-230} y={-200} width={460} height={400} rx={30} fill="#d9f5e5" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-120} size={34} color={C.greenDeep}>
              хоть немного
            </Txt>
            <Worker x={0} y={80 + Math.abs(Math.sin(t * 3)) * 30} s={1.1} role="plain" color={C.green} t={t} arms={0.8} />
            <Txt x={0} y={175} size={28}>
              10 приседаний
            </Txt>
          </g>
          {bad > 0 && (
            <g transform={`translate(${cx} 800) scale(${bad})`}>
              <Tag x={0} y={0} text="«плохой» день сохраняет, кем вы становитесь" size={30} color="#fff" />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export const Goodhart: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const num = pop(t, 0.2);
  const law = ramp(t, at(c, 1), 0.6);
  const signs = ramp(t, at(c, 2), 0.6);
  const s0 = 1 - signs;
  return (
    <g>
      {s0 > 0 && (
        <g opacity={s0}>
          <g transform={`translate(${cx - 220} 520) scale(${num})`}>
            <rect x={-150} y={-150} width={300} height={300} rx={40} fill="#fff" stroke={OL} strokeWidth={6} />
            <Txt x={0} y={26} size={78} weight={900} color={C.violet}>
              10 000
            </Txt>
            <Txt x={0} y={100} size={30} color={C.inkSoft}>
              шагов
            </Txt>
          </g>
          {/* бегущий за цифрой */}
          <g transform={`translate(${cx + 120 + Math.sin(t * 2) * 20} 640)`}>
            <Worker x={0} y={0} s={1.1} role="plain" color={C.coral} t={t * 3} arms={0.8} />
          </g>
          {law > 0 && (
            <g transform={`translate(${cx + 230} 300) scale(${law})`}>
              <rect x={-330} y={-100} width={660} height={200} rx={30} fill={C.yellow} stroke={OL} strokeWidth={5} />
              <Txt x={0} y={-30} size={32} weight={900}>
                закон Гудхарта
              </Txt>
              <Txt x={0} y={20} size={28}>
                показатель стал целью —
              </Txt>
              <Txt x={0} y={60} size={28}>
                перестал быть хорошим показателем
              </Txt>
            </g>
          )}
        </g>
      )}
      {signs > 0 && (
        <g opacity={signs}>
          <g transform={`translate(${cx} 300)`}>
            <rect x={-150} y={-80} width={300} height={160} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
            <path d={`M -80 40 A 80 80 0 0 1 80 40`} stroke={C.grey} strokeWidth={10} fill="none" />
            <line x1={0} y1={40} x2={0} y2={-30} stroke={C.red} strokeWidth={8} strokeLinecap="round" />
            <Txt x={0} y={120} size={28} color={C.inkSoft}>
              весы стоят
            </Txt>
          </g>
          {[
            { icon: "bulb", label: "больше сил" },
            { icon: "moon", label: "лучше сон" },
            { icon: "shoe", label: "легче по лестнице" },
          ].map((s, i) => (
            <g key={i} transform={`translate(${cx - 380 + i * 380} 640) scale(${pop(t, at(c, 2.3) + i * 0.5)})`}>
              <circle r={90} fill="#d9f5e5" stroke={OL} strokeWidth={5} />
              <Icon name={s.icon as "bulb"} x={0} y={0} s={1.5} />
              <Txt x={0} y={140} size={30}>
                {s.label}
              </Txt>
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

export const ContractScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const intro = pop(t, 0.2);
  const contract = ramp(t, at(c, 1), 0.6);
  const sign = ramp(t, at(c, 1.4), 1.6);
  const partner = ramp(t, at(c, 2), 0.6);
  const s0 = 1 - contract;
  return (
    <g>
      {s0 > 0 && (
        <g opacity={s0 * clamp01(intro * 2)}>
          {[
            { label: "неудобство когда-нибудь", sub: "почти не действует", far: true },
            { label: "неудобство сразу", sub: "действует", far: false },
          ].map((b, i) => (
            <g key={i} transform={`translate(${cx - 270 + i * 540} 500) scale(${pop(t, 0.3 + i * 0.6)})`}>
              <rect x={-240} y={-160} width={480} height={320} rx={30} fill={b.far ? "#fff" : "#ffe0d9"} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={-80} size={30} weight={900}>
                {b.label}
              </Txt>
              <Icon name="clock" x={b.far ? 0 : -60} y={30} s={1.4} />
              {!b.far && (
                <g transform="translate(70 30)">
                  <circle r={40} fill={C.red} stroke={OL} strokeWidth={4} />
                  <Txt x={0} y={16} size={44} weight={900} color="#fff">
                    !
                  </Txt>
                </g>
              )}
              <Txt x={0} y={130} size={28} color={b.far ? C.inkSoft : C.red}>
                {b.sub}
              </Txt>
            </g>
          ))}
        </g>
      )}
      {contract > 0 && (
        <g opacity={contract * (1 - partner)}>
          <Contract x={cx - 220} y={500} s={1.05} sign={sign} title="ДОГОВОР" />
          <g transform={`translate(${cx + 280} 600)`}>
            <Worker x={-120} y={0} s={1} role="plain" color={C.sky} t={t} />
            <Worker x={0} y={0} s={1} role="plain" color={C.pink} t={t} />
            <Worker x={120} y={0} s={1} role="skier" color={C.coral} t={t} />
            <Txt x={0} y={90} size={28}>
              я · жена · тренер
            </Txt>
          </g>
          <g transform={`translate(${cx + 280} 280) scale(${pop(t, at(c, 1.7))})`}>
            <Tag x={0} y={0} text="за срыв — неприятные последствия" size={28} color="#ffe0d9" />
          </g>
        </g>
      )}
      {partner > 0 && (
        <g opacity={partner}>
          <g transform={`translate(${cx} 560)`}>
            <Worker x={-150} y={0} s={1.4} role="plain" color={C.green} t={t} arms={0.7} />
            <Worker x={150} y={0} s={1.4} role="plain" color={C.violet} t={t} arms={0.7} flip />
            <g transform={`translate(0 -150) scale(${pop(t, at(c, 2.3))})`}>
              <circle r={36} fill={C.yellow} stroke={OL} strokeWidth={4} />
              <path d="M -12 -4 L -2 8 L 16 -14" stroke={OL} strokeWidth={6} fill="none" strokeLinecap="round" />
            </g>
            <Txt x={0} y={110} size={32}>
              партнёр по привычке
            </Txt>
          </g>
          <Chip x={cx} y={250} text="обещание, о котором знают, держится крепче" size={32} color={C.yellow} k={pop(t, at(c, 2.5))} />
        </g>
      )}
    </g>
  );
};
