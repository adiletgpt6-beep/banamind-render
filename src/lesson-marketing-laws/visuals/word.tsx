// Часть «Одно слово» (законы 4–6): Honda в США и Японии, вкусовые тесты,
// весы «восприятие и реальность», слова-владения (FedEx, Volvo, BMW, Heinz),
// ловушка слова «качество», слово «утро» для «Рассвета», занятые слова
// (Volvo, Duracell), Burger King и «быстро».
import React from "react";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, Z } from "../theme";
import { Car, OL } from "./draw";
import { Bakery, Battery, Bottle, Clock, Head, Loaf } from "./items";
import { AX } from "./parts";

type VP = VisualProps<{ host?: string }>;

const Moto: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-70, 70].map((wx) => (
      <g key={wx} transform={`translate(${wx} -36) rotate(${t * 240})`}>
        <circle r={36} fill={C.ink} stroke={OL} strokeWidth={5} />
        <circle r={12} fill={Z.grey} />
      </g>
    ))}
    <path d="M -70 -36 L -20 -90 L 50 -90 L 70 -36 Z" fill={C.coral} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 40 -90 L 60 -130 L 84 -130" stroke={OL} strokeWidth={7} fill="none" strokeLinecap="round" />
    <rect x={-40} y={-112} width={60} height={20} rx={8} fill={C.ink} />
  </g>
);

// ── Закон восприятия: одна и та же Honda — разные места в двух странах ──
export const HondaTwo: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const split = ramp(t, at(c, 1), 0.6);
  const moto = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <g opacity={1 - split}>
        <Pop t={t} at={0.2} x={cx} y={300}>
          <Txt x={0} y={0} size={58} weight={900}>
            битва восприятия,
          </Txt>
          <Txt x={0} y={74} size={58} weight={900} color={C.inkSoft}>
            а не продуктов
          </Txt>
        </Pop>
        <Pop t={t} at={at(c, 0.4)} x={cx} y={620}>
          <Car x={0} y={0} s={1} t={t} color={Z.teal} />
        </Pop>
      </g>
      {split > 0 && (
        <g opacity={split}>
          {[0, 1].map((i) => {
            const x = cx - 280 + i * 560;
            return (
              <g key={i}>
                <Panel x={x - 250} y={160} w={500} h={680} fill="#ffffffdd" />
                <Txt x={x} y={230} size={40} weight={900}>
                  {i === 0 ? "США" : "Япония"}
                </Txt>
                <g opacity={i === 1 ? 1 - moto : 1}>
                <Car x={x} y={460} s={0.9} t={t} color={Z.teal} />
                <Txt x={x} y={510} size={32} color={C.inkSoft}>
                  та же Honda
                </Txt>
                </g>
                <g transform={`translate(${x} 610) scale(${pop(t, at(c, 1.4 + i * 0.3))})`} opacity={i === 1 ? 1 - moto : 1}>
                  <circle r={52} fill={i === 0 ? C.yellow : Z.greySoft} stroke={OL} strokeWidth={5} />
                  <Txt x={0} y={20} size={52} weight={900}>
                    {i === 0 ? "№1" : "№3"}
                  </Txt>
                </g>
                <Txt x={x} y={720} size={28} color={C.inkSoft}>
                  {i === 0 ? "«один из лидеров»" : "по данным книги"}
                </Txt>
              </g>
            );
          })}
          {moto > 0 && (
            <g opacity={moto}>
              <Head x={cx + 280} y={540} s={0.75}>
                <Moto x={10} y={20} s={0.75} t={t} />
              </Head>
              <g transform={`translate(${cx + 280} 680)`}>
                <rect x={-200} y={-50} width={400} height={100} rx={40} fill="#fff" stroke={OL} strokeWidth={5} />
                <Txt x={0} y={14} size={34} weight={900}>
                  «Какой мотоцикл?»
                </Txt>
              </g>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ── 200 000 вкусовых тестов против рынка ──
export const TasteTest: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const tests = ramp(t, 0.4, Math.max(1, at(c, 0.8) - 0.4));
  const market = ramp(t, at(c, 1), 0.6);
  const n = Math.round(tests * 200000);
  return (
    <g>
      <g transform={`translate(${cx - 270} 0)`}>
        <Txt x={0} y={200} size={40} weight={900}>
          вкусовые тесты
        </Txt>
        <Txt x={0} y={290} size={64} weight={900} color={C.coral}>
          {n.toLocaleString("ru-RU")}
        </Txt>
        <Bottle x={-90} y={700} s={1} color="#7a3b22" label="новая" />
        <Bottle x={90} y={700} s={0.8} color="#7a3b22" label="старая" />
        <g transform={`translate(-90 360) scale(${pop(t, at(c, 0.7))})`}>
          <Tag x={0} y={0} text="вкуснее!" size={34} color={C.yellow} />
        </g>
      </g>
      {market > 0 && (
        <g opacity={market} transform={`translate(${cx + 280} 0)`}>
          <Txt x={0} y={200} size={40} weight={900}>
            рынок
          </Txt>
          <rect x={-170} y={760 - 380 * ramp(t, at(c, 1.2), 0.8)} width={140} height={380 * ramp(t, at(c, 1.2), 0.8)} rx={12} fill={C.coral} stroke={OL} strokeWidth={5} />
          <rect x={30} y={760 - 120 * ramp(t, at(c, 1.2), 0.8)} width={140} height={120 * ramp(t, at(c, 1.2), 0.8)} rx={12} fill={Z.greySoft} stroke={OL} strokeWidth={5} />
          <Txt x={-100} y={810} size={26} weight={900}>
            Classic
          </Txt>
          <Txt x={100} y={810} size={26} weight={900}>
            новая
          </Txt>
          <Pop t={t} at={at(c, 1.6)} x={0} y={300}>
            <Tag x={0} y={0} text="пробуем то, что ожидаем" size={30} color={C.white} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── Оговорка BanaMind: восприятие важно, но реальность (качество, честность) есть ──
export const RealityScale: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const stamp = pop(t, at(c, 0.6));
  const scale = ramp(t, at(c, 1), 0.6);
  const tilt = Math.sin(t * 1.2) * 4 * (1 - ramp(t, at(c, 1.4), 1));
  return (
    <g>
      <g opacity={1 - scale}>
        <Panel x={cx - 380} y={220} w={760} h={220} fill="#fff" />
        <Txt x={cx} y={310} size={40} color={C.inkSoft}>
          «объективной реальности
        </Txt>
        <Txt x={cx} y={370} size={40} color={C.inkSoft}>
          не существует»
        </Txt>
        {stamp > 0 && (
          <g transform={`translate(${cx + 200} 460) rotate(-12) scale(${stamp})`}>
            <rect x={-200} y={-46} width={400} height={92} rx={14} fill="none" stroke={C.red} strokeWidth={8} />
            <Txt x={0} y={16} size={40} weight={900} color={C.red}>
              ПРЕУВЕЛИЧЕНИЕ
            </Txt>
          </g>
        )}
      </g>
      {scale > 0 && (
        <g opacity={scale}>
          <rect x={cx - 14} y={380} width={28} height={420} fill={C.brown} stroke={OL} strokeWidth={4} />
          <rect x={cx - 140} y={790} width={280} height={30} rx={10} fill={C.brown} stroke={OL} strokeWidth={4} />
          <g transform={`rotate(${tilt} ${cx} 400)`}>
            <rect x={cx - 420} y={392} width={840} height={16} rx={8} fill={C.brown} stroke={OL} strokeWidth={4} />
            {[0, 1].map((i) => {
              const x = cx - 380 + i * 760;
              return (
                <g key={i}>
                  <line x1={x} x2={x - 80} y1={408} y2={540} stroke={OL} strokeWidth={4} />
                  <line x1={x} x2={x + 80} y1={408} y2={540} stroke={OL} strokeWidth={4} />
                  <path d={`M ${x - 120} 540 L ${x + 120} 540 Q ${x} 600 ${x - 120} 540 Z`} fill={Z.greySoft} stroke={OL} strokeWidth={4} />
                  {i === 0 ? (
                    <g transform={`translate(${x} 500) scale(${pop(t, at(c, 1.1))})`}>
                      <Head x={0} y={0} s={0.3} />
                      <Txt x={0} y={120} size={30} weight={900}>
                        восприятие
                      </Txt>
                    </g>
                  ) : (
                    <g>
                      {["качество", "безопасность", "честность"].map((w, j) => (
                        <Pop key={w} t={t} at={at(c, 1.3 + j * 0.15)} x={x} y={300 - j * 66}>
                          <Tag x={0} y={0} text={w} size={28} color={[Z.mint, Z.tealSoft, C.yellow][j]} />
                        </Pop>
                      ))}
                      <Check x={x} y={500} s={40} k={ramp(t, at(c, 1.7), 0.4)} />
                    </g>
                  )}
                </g>
              );
            })}
          </g>
          <Pop t={t} at={at(c, 1.8)} x={cx} y={150}>
            <Tag x={0} y={0} text="обман дорого обходится" size={34} color={C.coral} textColor="#fff" />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── Закон фокуса: одна марка — одно слово ──
export const OneWord: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const rows: { brand: string; word: string; at: number; icon: React.ReactNode }[] = [
    { brand: "Federal Express", word: "за ночь", at: at(c, 1.2), icon: <Clock x={0} y={0} s={0.34} h={23} m={50} /> },
    { brand: "Volvo", word: "безопасность", at: at(c, 2), icon: <path d="M 0 -26 L 22 -16 Q 22 14 0 26 Q -22 14 -22 -16 Z" fill={Z.teal} stroke={OL} strokeWidth={4} /> },
    { brand: "BMW", word: "вождение", at: at(c, 2.3), icon: <circle r={22} fill="none" stroke={OL} strokeWidth={8} /> },
    { brand: "Heinz", word: "медленный", at: at(c, 2.6), icon: <path d="M -10 -28 L 10 -28 L 16 26 L -16 26 Z" fill={C.red} stroke={OL} strokeWidth={4} /> },
  ];
  const final = ramp(t, at(c, 3), 0.5);
  return (
    <g>
      <Pop t={t} at={0.2} x={cx} y={180}>
        <Txt x={0} y={0} size={52} weight={900}>
          одна марка → одно слово
        </Txt>
      </Pop>
      {rows.map((r, i) => {
        const k = pop(t, r.at);
        if (k <= 0) return null;
        const wk = ramp(t, r.at + 0.35, 0.5);
        const y = 300 + i * 120;
        return (
          <g key={r.brand} opacity={clamp01(k * 1.5) * (1 - final * 0.5)} transform={`translate(${(1 - k) * 60} 0)`}>
            <Panel x={cx - 520} y={y - 45} w={420} h={90} r={45} fill="#fff" />
            <g transform={`translate(${cx - 470} ${y})`}>{r.icon}</g>
            <Txt x={cx - 420} y={y + 13} size={34} weight={900} anchor="start">
              {r.brand}
            </Txt>
            <Arrow x1={cx - 80} y1={y} x2={cx + 40} y2={y} k={wk} color={C.coral} w={10} />
            <g opacity={wk}>
              <Panel x={cx + 70} y={y - 45} w={440} h={90} r={45} fill={C.yellow} />
              <Txt x={cx + 290} y={y + 14} size={40} weight={900}>
                {`«${r.word}»`}
              </Txt>
            </g>
          </g>
        );
      })}
      {final > 0 && (
        <g transform={`translate(${cx} 800) scale(${final})`}>
          <Tag x={0} y={0} text="простое слово о пользе > 3–4 обещания" size={34} color={C.white} />
        </g>
      )}
    </g>
  );
};

// ── «Качество» — у всех, значит ни у кого; BMW теряет и возвращает фокус ──
export const QualityEveryone: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const alt = ramp(t, at(c, 1), 0.5);
  const bmw = ramp(t, at(c, 2), 0.5);
  const back = ramp(t, at(c, 2.6), 0.6);
  return (
    <g>
      <g opacity={1 - alt}>
        {Array.from({ length: 6 }).map((_, i) => {
          const k = pop(t, 0.3 + i * 0.25);
          const x = cx - 420 + (i % 3) * 420;
          const y = 300 + Math.floor(i / 3) * 260;
          return (
            <g key={i} transform={`translate(${x} ${y + wob(t, i, 6)}) scale(${k})`}>
              <rect x={-150} y={-60} width={300} height={120} rx={50} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={14} size={36} weight={900} color={[C.coral, Z.purple, Z.teal, C.green, Z.orange, C.skyDeep][i]}>
                «качество!»
              </Txt>
            </g>
          );
        })}
        <Pop t={t} at={at(c, 0.6)} x={cx} y={760}>
          <Tag x={0} y={0} text="у всех — значит ни у кого" size={40} color={C.yellow} />
        </Pop>
      </g>
      {alt > 0 && (
        <g opacity={alt * (1 - bmw)}>
          <Txt x={cx} y={220} size={44} weight={900}>
            у сильного слова есть альтернатива
          </Txt>
          {["быстрый", "надёжный", "густой"].map((w, i) => (
            <Pop key={w} t={t} at={at(c, 1.2 + i * 0.2)} x={cx - 360 + i * 360} y={420}>
              <Tag x={0} y={0} text={w} size={44} color={[Z.tealSoft, Z.mint, "#ffe0c2"][i]} />
            </Pop>
          ))}
          <Txt x={cx} y={560} size={34} color={C.inkSoft}>
            не просто «хороший»
          </Txt>
        </g>
      )}
      {bmw > 0 && (
        <g opacity={bmw}>
          <Txt x={cx} y={200} size={44} weight={900}>
            BMW: «вождение»
          </Txt>
          <Car x={cx - 250} y={520} s={1 - 0.3 * back} t={t} color={Z.navy} />
          <g opacity={1 - back}>
            <rect x={cx + 60} y={380} width={420} height={140} rx={30} fill="#5b6475" stroke={OL} strokeWidth={5} />
            <Txt x={cx + 270} y={466} size={32} weight={900} color="#fff">
              большой седан
            </Txt>
            <Cross x={cx + 270} y={450} s={120} k={ramp(t, at(c, 2.3), 0.4)} />
          </g>
          {back > 0 && (
            <g transform={`translate(${cx + 260} 470) scale(${back})`}>
              <Tag x={0} y={0} text="снова «вождение»" size={40} color={C.yellow} />
              <Check x={0} y={110} s={50} k={back} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ── «Рассвет»: слово «утро» ──
export const BakeryWord: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const words = ["вкусный", "полезный", "лучший"];
  const pick = ramp(t, at(c, 0.6), 0.6);
  const head = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <g opacity={1 - head}>
        {words.map((w, i) => (
          <g key={w} opacity={1 - pick * 0.7}>
            <Pop t={t} at={0.3 + i * 0.25} x={cx - 380 + i * 380} y={300}>
              <Tag x={0} y={0} text={w} size={40} color={Z.greySoft} />
              <line x1={-100} x2={100} y1={-10} y2={-10} stroke={C.red} strokeWidth={7 * pick} strokeLinecap="round" />
            </Pop>
          </g>
        ))}
        {pick > 0 && (
          <g transform={`translate(${cx} 560) scale(${0.7 + 0.3 * pick})`}>
            <circle r={170} fill={C.yellow} opacity={0.35 + 0.1 * Math.sin(t * 2)} />
            <Txt x={0} y={30} size={110} weight={900} color={C.yellowDeep}>
              утро
            </Txt>
            <Loaf x={0} y={140} s={0.8} steam={1} t={t} />
          </g>
        )}
      </g>
      {head > 0 && (
        <g opacity={head}>
          <Head x={cx - 160} y={600} s={1.2}>
            <g transform="translate(0 -40)">
              <Bakery x={0} y={60} s={0.38} t={t} />
            </g>
          </Head>
          <g transform={`translate(${cx + 300} 300)`}>
            <rect x={-230} y={-60} width={460} height={120} rx={50} fill="#fff" stroke={OL} strokeWidth={5} />
            <Txt x={0} y={14} size={32} weight={900}>
              «свежий хлеб к завтраку»
            </Txt>
          </g>
          <Arrow x1={cx + 160} y1={380} x2={cx + 20} y2={470} k={ramp(t, at(c, 1.3), 0.5)} color={C.coral} w={10} />
        </g>
      )}
    </g>
  );
};

// ── Закон исключительности: слово уже занято ──
export const WordTaken: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const volvo = ramp(t, at(c, 1), 0.5);
  const dura = ramp(t, at(c, 2), 0.5);
  const tug = Math.sin(t * 4) * 12;
  return (
    <g>
      <g opacity={1 - volvo}>
        <Pop t={t} at={0.2} x={cx} y={340}>
          <Txt x={0} y={0} size={56} weight={900}>
            одно слово — один владелец
          </Txt>
        </Pop>
        <Pop t={t} at={at(c, 0.5)} x={cx} y={520}>
          <Tag x={0} y={0} text="«слово»" size={60} color={C.yellow} />
        </Pop>
        {[0, 1].map((i) => (
          <Pop key={i} t={t} at={at(c, 0.6) + i * 0.2} x={cx - 330 + i * 660} y={660}>
            <circle r={50} fill={i ? Z.purple : Z.teal} stroke={OL} strokeWidth={5} />
          </Pop>
        ))}
      </g>
      {volvo > 0 && (
        <g opacity={volvo * (1 - dura)}>
          <Txt x={cx} y={200} size={46} weight={900}>
            «безопасность»
          </Txt>
          <g transform={`translate(${cx} 470)`}>
            <path d="M 0 -150 L 120 -100 Q 120 60 0 150 Q -120 60 -120 -100 Z" fill={Z.teal} stroke={OL} strokeWidth={6} />
            <Txt x={0} y={20} size={44} weight={900} color="#fff">
              Volvo
            </Txt>
          </g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${cx - 420 + i * 420 + (i === 1 ? 0 : 0)} ${760})`} opacity={i === 1 ? 0 : 1}>
              <Car x={0} y={0} s={0.55} t={t} color={[Z.grey, Z.grey, C.coral][i]} />
              <Cross x={0} y={-150} s={60} k={ramp(t, at(c, 1.5 + i * 0.1), 0.4)} />
            </g>
          ))}
        </g>
      )}
      {dura > 0 && (
        <g opacity={dura}>
          <Txt x={cx} y={200} size={46} weight={900}>
            «долговечность»
          </Txt>
          <Battery x={cx - 260 + tug * 0.3} y={640} s={1.3} color="#3a3a3a" label="Duracell" />
          <Battery x={cx + 260 + tug * 0.3} y={640} s={1.1} color={Z.pink} label="Energizer" />
          <rect x={cx - 180} y={420 + Math.sin(t * 4) * 4} width={360} height={14} rx={7} fill={C.brown} />
          <Pop t={t} at={at(c, 2.6)} x={cx - 260} y={300}>
            <Tag x={0} y={0} text="«дюра» — уже в имени" size={30} color={C.yellow} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── Burger King пытается занять «быстро» ──
export const BurgerFast: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const research = ramp(t, 0.3, 0.6);
  const taken = ramp(t, at(c, 1), 0.5);
  const moral = ramp(t, at(c, 2), 0.5);
  return (
    <g>
      <g opacity={1 - moral}>
        <g transform={`translate(${cx - 300} 470)`} opacity={research}>
          <rect x={-160} y={-220} width={320} height={420} rx={16} fill="#fff" stroke={OL} strokeWidth={5} />
          <Txt x={0} y={-160} size={30} weight={900}>
            исследование
          </Txt>
          {["быстро", "вкусно", "дёшево"].map((w, i) => (
            <g key={w}>
              <rect x={-120} y={-110 + i * 90} width={240 * [1, 0.6, 0.45][i] * ramp(t, 0.6 + i * 0.2, 0.6)} height={50} rx={10} fill={i === 0 ? C.coral : Z.greySoft} />
              <Txt x={-110} y={-74 + i * 90} size={28} weight={900} anchor="start">
                {w}
              </Txt>
            </g>
          ))}
        </g>
        <g transform={`translate(${cx + 260} 470)`}>
          <Pop t={t} at={at(c, 0.7)} x={0} y={-160}>
            <Tag x={0} y={0} text="Burger King: «мы быстрые!»" size={30} color={C.white} />
          </Pop>
          {taken > 0 && (
            <g opacity={taken}>
              <rect x={-170} y={-60} width={340} height={130} rx={30} fill={C.yellow} stroke={OL} strokeWidth={5} />
              <Txt x={0} y={0} size={36} weight={900}>
                «быстро»
              </Txt>
              <Txt x={0} y={44} size={28} color={C.inkSoft}>
                уже у McDonald's
              </Txt>
              <g transform={`translate(0 160) rotate(${-8 + wob(t, 2, 3)})`}>
                <rect x={-150} y={-36} width={300} height={72} rx={12} fill="none" stroke={C.red} strokeWidth={7} />
                <Txt x={0} y={14} size={36} weight={900} color={C.red}>
                  ЗАНЯТО
                </Txt>
              </g>
            </g>
          )}
        </g>
      </g>
      {moral > 0 && (
        <g opacity={moral}>
          <Panel x={cx - 500} y={260} w={1000} h={400} fill="#fff" />
          <Txt x={cx} y={370} size={42} weight={900}>
            опрос покажет, чего хотят
          </Txt>
          <Check x={cx - 380} y={358} s={40} k={ramp(t, at(c, 2.2), 0.4)} />
          <Txt x={cx} y={520} size={42} weight={900} color={C.coral}>
            но не скажет, что слово занято
          </Txt>
          <Cross x={cx - 430} y={505} s={56} k={ramp(t, at(c, 2.5), 0.4)} />
        </g>
      )}
    </g>
  );
};

