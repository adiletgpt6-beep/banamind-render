// Часть «Шум и ресурсы» (законы 20–22): шумиха против спроса, первая
// и последняя полоса газеты, волна и прилив, куклы и Барби, топливо идеи,
// наполнитель и деньги, «радужный хлеб» и прилив «Рассвета».
import React from "react";
import { Arrow, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, Z } from "../theme";
import { Cat, Coin, Megaphone, OL, Rocket } from "./draw";
import { Bakery, Bike, Bottle, Doll, FuelTank, Loaf, Newspaper, Phone } from "./items";
import { AX } from "./parts";

type VP = VisualProps<{ host?: string }>;

const Sea: React.FC<{ cx: number; t: number; level: number; wave: number }> = ({ cx, t, level, wave }) => {
  const y0 = 760 - level;
  const pts = Array.from({ length: 41 }).map((_, i) => {
    const x = cx - 560 + i * 28;
    const bump = wave * 220 * Math.exp(-(((x - (cx - 200 + Math.sin(t * 0.6) * 60)) / 90) ** 2));
    return `${x} ${y0 - bump + Math.sin(t * 2 + i * 0.6) * 8}`;
  });
  return <path d={`M ${cx - 560} 860 L ${pts.join(" L ")} L ${cx + 560} 860 Z`} fill={C.sky} stroke={OL} strokeWidth={4} opacity={0.85} />;
};

// ── Закон надувательства ──
export const HypeMeter: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const meter = ramp(t, at(c, 1), 0.5);
  const coke = ramp(t, at(c, 2), 0.5);
  const vphone = ramp(t, at(c, 3), 0.5);
  const back = ramp(t, at(c, 4), 0.5);
  return (
    <g>
      <g opacity={1 - meter}>
        <Megaphone x={cx - 250} y={480} s={1.4} t={t} />
        <Newspaper x={cx + 250} y={480} s={1} head="ПРОРЫВ ВЕКА!" rot={4} />
        <Pop t={t} at={at(c, 0.4)} x={cx} y={780}>
          <Tag x={0} y={0} text="пресса ≠ рынок" size={44} color={C.yellow} />
        </Pop>
      </g>
      {meter > 0 && (
        <g opacity={meter * (1 - coke)}>
          {[0, 1].map((i) => {
            const v = i === 0 ? 0.15 : 0.9;
            const a = -Math.PI + Math.PI * v * ramp(t, at(c, 1.2), 0.8) + Math.sin(t * 5) * 0.04;
            return (
              <g key={i} transform={`translate(${cx - 270 + i * 540} 560)`}>
                <path d="M -180 0 A 180 180 0 0 1 180 0" fill="none" stroke={Z.greySoft} strokeWidth={36} />
                <path d="M -180 0 A 180 180 0 0 1 180 0" fill="none" stroke={i ? C.red : C.green} strokeWidth={36} strokeDasharray={565} strokeDashoffset={565 * (1 - v)} opacity={0.8} />
                <line x1={0} y1={0} x2={Math.cos(a) * 150} y2={Math.sin(a) * 150} stroke={OL} strokeWidth={10} strokeLinecap="round" />
                <circle r={16} fill={OL} />
                <Txt x={0} y={80} size={32} weight={900}>
                  {i ? "дела плохи" : "дела хороши"}
                </Txt>
                <Txt x={0} y={-220} size={30} color={C.inkSoft}>
                  {i ? "шумиха нужна срочно" : "шумиха не нужна"}
                </Txt>
              </g>
            );
          })}
        </g>
      )}
      {coke > 0 && (
        <g opacity={coke * (1 - vphone)}>
          <g transform={`translate(${cx - 270} 0)`}>
            {[0, 1, 2, 3].map((i) => (
              <Newspaper key={i} x={(i - 1.5) * 30} y={420 + i * 26} s={0.6} head="НОВАЯ КОЛА" rot={-8 + i * 5} />
            ))}
            <Tag x={0} y={680} text="> 1 млрд $ бесплатной рекламы" size={26} color={C.white} />
          </g>
          <g transform={`translate(${cx + 270} 0)`}>
            <Bottle x={0} y={640} s={1.2} color="#7a3b22" label="Classic" />
            <Pop t={t} at={at(c, 2.5)} x={0} y={290}>
              <Tag x={0} y={0} text="< 60 дней — назад" size={32} color={C.yellow} />
            </Pop>
          </g>
        </g>
      )}
      {vphone > 0 && (
        <g opacity={vphone * (1 - back)}>
          <Txt x={cx} y={200} size={40} weight={900}>
            видеотелефон: с 1964 года на первых полосах
          </Txt>
          <g transform={`translate(${cx - 250} 520)`}>
            <rect x={-130} y={-170} width={260} height={200} rx={16} fill={C.ink} stroke={OL} strokeWidth={5} />
            <rect x={-110} y={-150} width={220} height={150} rx={8} fill={Z.tealSoft} />
            <circle cx={0} cy={-80} r={34} fill="#ffe1c4" stroke={OL} strokeWidth={4} />
            <Phone x={0} y={130} s={0.7} t={t} />
          </g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${cx + 150 + i * 130} ${420 + wob(t, i, 4)}) scale(${pop(t, at(c, 3.2 + i * 0.15))})`}>
              <circle r={50} fill="#fff" stroke={OL} strokeWidth={5} />
              <Txt x={0} y={16} size={40} weight={900}>
                {String(i + 1)}
              </Txt>
              <Cross x={0} y={0} s={60} k={ramp(t, at(c, 3.3 + i * 0.15), 0.3)} />
            </g>
          ))}
          <Pop t={t} at={at(c, 3.7)} x={cx + 280} y={620}>
            <Tag x={0} y={0} text="шумиха ≠ спрос" size={40} color={C.yellow} />
          </Pop>
        </g>
      )}
      {back > 0 && (
        <g opacity={back}>
          <g transform={`translate(${cx - 230} 500)`}>
            <Newspaper x={0} y={0} s={1.2} head="ПЕРВАЯ ПОЛОСА" rot={-3} />
            <Cross x={0} y={0} s={150} k={ramp(t, at(c, 4.2), 0.4)} />
          </g>
          <g transform={`translate(${cx + 280} 500)`}>
            <Newspaper x={0} y={0} s={1.2} head="последняя стр." rot={3} small="заметка" />
            <circle cx={110} cy={100} r={60 + 6 * Math.sin(t * 3)} fill="none" stroke={C.coral} strokeWidth={8} />
          </g>
          <Pop t={t} at={at(c, 4.6)} x={cx} y={800}>
            <Tag x={0} y={0} text="настоящие революции приходят тихо" size={32} color={C.white} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── Закон ускорения: волна (причуда) и прилив (тренд) ──
export const WaveTide: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const showSea = ramp(t, at(c, 1), 0.5);
  const waveK = ramp(t, at(c, 1.1), 0.8) * (1 - ramp(t, at(c, 1.45), 0.8));
  const tide = ramp(t, at(c, 1.5), Math.max(1, at(c, 1.95) - at(c, 1.5)));
  const dolls = ramp(t, at(c, 2), 0.5);
  const crash = ramp(t, at(c, 2.6), 0.6);
  const barbie = ramp(t, at(c, 3), 0.5);
  return (
    <g>
      <g opacity={1 - dolls}>
        <Pop t={t} at={0.2} x={cx} y={200}>
          <Txt x={0} y={0} size={46} weight={900}>
            не причуды, а тренды
          </Txt>
        </Pop>
        {showSea > 0 && (
          <g opacity={showSea}>
            <Sea cx={cx} t={t} level={80 + 220 * tide} wave={waveK} />
            <Pop t={t} at={at(c, 1.2)} x={cx - 200} y={330}>
              <Tag x={0} y={0} text="причуда = волна" size={32} color={C.coral} textColor="#fff" />
            </Pop>
            <Pop t={t} at={at(c, 1.6)} x={cx + 280} y={330}>
              <Tag x={0} y={0} text="тренд = прилив" size={32} color={C.yellow} />
            </Pop>
          </g>
        )}
      </g>
      {dolls > 0 && (
        <g opacity={dolls * (1 - barbie)}>
          <Txt x={cx} y={200} size={40} weight={900}>
            Coleco: «выжать всё»
          </Txt>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i} transform={`translate(${cx - 400 + i * 160} ${640 + crash * (200 + i * 30)}) rotate(${crash * (i % 2 ? 40 : -40)})`} opacity={1 - crash * 0.7}>
              {i === 0 ? <Doll x={0} y={0} s={0.9} t={t} /> : <rect x={-50} y={-150} width={100} height={150} rx={12} fill={[Z.pink, Z.purple, Z.teal, C.coral, Z.orange][i - 1]} stroke={OL} strokeWidth={4} />}
            </g>
          ))}
          <path d={`M ${cx - 480} 700 L ${cx - 100} ${700 - 300 * clamp01(ramp(t, at(c, 2.1), 0.6))} L ${cx + 480} ${700 - 300 * (1 - crash)}`} stroke={C.coral} strokeWidth={10} fill="none" opacity={0.8} />
          <Pop t={t} at={at(c, 2.7)} x={cx} y={300}>
            <Tag x={0} y={0} text="…и всё рухнуло" size={36} color={C.red} textColor="#fff" />
          </Pop>
        </g>
      )}
      {barbie > 0 && (
        <g opacity={barbie}>
          <g transform={`translate(${cx - 250} 0)`}>
            <Doll x={0} y={680} s={1.4} t={t} color={Z.pink} />
            <Txt x={0} y={260} size={36} weight={900}>
              Барби
            </Txt>
            <path d={`M -160 760 L 160 ${760 - 120 * ramp(t, at(c, 3.2), 1)}`} stroke={C.green} strokeWidth={10} strokeLinecap="round" />
          </g>
          <g transform={`translate(${cx + 260} 0)`}>
            <Panel x={-230} y={330} w={460} h={300} fill={C.yellow} />
            <Txt x={0} y={440} size={36} weight={900}>
              причуду —
            </Txt>
            <Txt x={0} y={500} size={36} weight={900}>
              приглушать
            </Txt>
            <Txt x={0} y={570} size={28} color={C.inkSoft}>
              чтобы длилась дольше
            </Txt>
          </g>
        </g>
      )}
    </g>
  );
};

// ── Закон ресурсов ──
export const Fuel: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const fill = ramp(t, at(c, 1.4), 1.2);
  const apple = ramp(t, at(c, 1), 0.5);
  const cat = ramp(t, at(c, 2), 0.5);
  const note = ramp(t, at(c, 3), 0.5);
  return (
    <g>
      <g opacity={1 - cat}>
        <g transform={`translate(${cx - 280} 0)`}>
          <Rocket x={0} y={620 - 220 * clamp01(fill * 1.2 - 0.2)} s={1.4} t={t} flame={fill} />
          <Txt x={0} y={260} size={34} weight={900}>
            отличная идея
          </Txt>
        </g>
        <g transform={`translate(${cx + 230} 0)`}>
          <FuelTank x={0} y={760} s={1.3} level={0.08 + 0.8 * fill} />
          <Txt x={0} y={340} size={34} weight={900}>
            ресурсы
          </Txt>
        </g>
        {apple > 0 && (
          <Pop t={t} at={at(c, 1.5)} x={cx} y={180}>
            <Tag x={0} y={0} text="Apple: 91 000 $ Майка Марккулы" size={34} color={C.yellow} />
          </Pop>
        )}
        {[0, 1, 2].map((i) => {
          const k = clamp01(fill * 3 - i);
          return k > 0 ? <Coin key={i} x={cx + 230 + Math.sin(i) * 20} y={300 + 400 * k} s={0.9} /> : null;
        })}
      </g>
      {cat > 0 && (
        <g opacity={cat * (1 - note)}>
          <Txt x={cx} y={200} size={40} weight={900}>
            комкующийся наполнитель
          </Txt>
          <g transform={`translate(${cx - 280} 0)`}>
            <rect x={-110} y={420} width={220} height={260} rx={16} fill={Z.tealSoft} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={560} size={30} weight={900}>
              Scoop Away
            </Txt>
            <Cat x={0} y={400} s={0.7} t={t} />
            <Txt x={0} y={730} size={26} color={C.inkSoft}>
              маленькая компания
            </Txt>
          </g>
          <g transform={`translate(${cx + 280} 0)`}>
            <rect x={-150} y={380} width={300} height={300} rx={16} fill="#ffe0c2" stroke={OL} strokeWidth={5} />
            <Txt x={0} y={540} size={30} weight={900}>
              Tidy Scoop
            </Txt>
            {[0, 1, 2, 3].map((i) => (
              <Coin key={i} x={-90 + i * 60} y={340 - (i % 2) * 20} s={0.8} />
            ))}
            <Txt x={0} y={730} size={26} color={C.inkSoft}>
              крупный конкурент
            </Txt>
          </g>
          <Arrow x1={cx - 140} y1={480} x2={cx + 110} y2={480} k={ramp(t, at(c, 2.4), 0.5)} color={C.coral} w={10} />
          <Pop t={t} at={at(c, 2.7)} x={cx} y={820}>
            <Tag x={0} y={0} text="победителя, скорее всего, определят деньги" size={28} color={C.white} />
          </Pop>
        </g>
      )}
      {note > 0 && (
        <g transform={`translate(${cx} 480) scale(${note})`}>
          <rect x={-460} y={-140} width={920} height={280} rx={30} fill="#fff" stroke={C.coral} strokeWidth={8} />
          <Txt x={0} y={-50} size={40} weight={900} color={C.coral}>
            не финансовый совет
          </Txt>
          <Txt x={0} y={20} size={34} weight={900}>
            оцените ресурсы до того,
          </Txt>
          <Txt x={0} y={70} size={34} weight={900}>
            как обещать большой запуск
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── «Рассвет»: радужный хлеб (волна) и утренние покупатели (прилив) ──
export const BakeryHype: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const tide = ramp(t, at(c, 0.55), 0.8);
  const need = ramp(t, at(c, 1), 0.5);
  return (
    <g>
      <g opacity={1 - need}>
        <g transform={`translate(${cx - 270} 0)`}>
          <Phone x={0} y={300} s={0.5} t={t} ring={1} />
          <g transform={`translate(0 ${560 - 80 * Math.abs(Math.sin(t * 2))})`}>
            {[C.red, Z.orange, C.yellow, C.green, C.skyDeep, Z.purple].map((col, i) => (
              <path key={i} d={`M ${-100 + i * 6} ${-i * 10} Q 0 ${-90 - i * 10} ${100 - i * 6} ${-i * 10}`} stroke={col} strokeWidth={12} fill="none" />
            ))}
            <Loaf x={0} y={60} s={0.9} color="#f2c27a" />
          </g>
          <Tag x={0} y={760} text="«радужный хлеб» — волна" size={30} color={C.coral} textColor="#fff" />
        </g>
        <g transform={`translate(${cx + 280} 0)`} opacity={tide}>
          {Array.from({ length: 9 }).map((_, i) => (
            <g key={i} transform={`translate(${-160 + (i % 3) * 160} ${380 + Math.floor(i / 3) * 120})`}>
              <circle r={36} fill={[Z.teal, C.coral, Z.purple][i % 3]} stroke={OL} strokeWidth={4} />
              <Loaf x={0} y={14} s={0.25} />
            </g>
          ))}
          <Tag x={0} y={760} text="каждое утро — прилив" size={30} color={C.yellow} />
        </g>
      </g>
      {need > 0 && (
        <g opacity={need}>
          <Bakery x={cx - 280} y={760} s={0.75} t={t} />
          {[
            { k: "печи", at: at(c, 1.1) },
            { k: "курьеры", at: at(c, 1.3) },
            { k: "терпение", at: at(c, 1.5) },
          ].map((it, i) => (
            <Pop key={it.k} t={t} at={it.at} x={cx + 250} y={300 + i * 130}>
              <rect x={-200} y={-50} width={400} height={100} rx={50} fill={C.yellow} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={14} size={40} weight={900}>
                {it.k}
              </Txt>
            </Pop>
          ))}
          <Bike x={cx + 250} y={780} s={0.55} t={t} />
        </g>
      )}
    </g>
  );
};

