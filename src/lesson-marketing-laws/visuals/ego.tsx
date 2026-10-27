// Часть «Эго и ошибки» (законы 17–19): прогноз погоды и рынка, OfficeVision,
// исследование копира, направление вместо плана, шар эго, «увидеть самому»,
// раннее признание неудачи, Wal-Mart и 3M, эксперимент «Рассвета».
import React from "react";
import { Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, Z } from "../theme";
import { Car, Dot, OL, Shop } from "./draw";
import { Bakery, Balloon, Computer, Mainframe, MiniPC } from "./items";
import { AX } from "./parts";

type VP = VisualProps<{ host?: string }>;

const Cloud: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = "#fff" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -90 30 Q -120 30 -120 0 Q -120 -34 -84 -34 Q -76 -80 -26 -76 Q 10 -110 54 -76 Q 110 -80 110 -30 Q 140 -20 130 14 Q 124 30 100 30 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

// ── Закон непредсказуемости: погода на 3 дня и рынок на 3 года; OfficeVision ──
export const Forecast: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const weather = ramp(t, at(c, 1), 0.5);
  const ov = ramp(t, at(c, 2), 0.5);
  const rivals = ramp(t, at(c, 2.5), 0.8);
  return (
    <g>
      <g opacity={1 - weather}>
        <Pop t={t} at={0.2} x={cx} y={260}>
          <Txt x={0} y={0} size={50} weight={900}>
            будущее не предсказать,
          </Txt>
          <Txt x={0} y={70} size={50} weight={900} color={C.coral}>
            не зная планов конкурентов
          </Txt>
        </Pop>
        <g transform={`translate(${cx} 600)`}>
          <circle r={110} fill="#eaf6ff" fillOpacity={0.7} stroke={OL} strokeWidth={8} />
          <Txt x={0} y={30} size={90} weight={900} color={Z.grey}>
            ?
          </Txt>
        </g>
      </g>
      {weather > 0 && (
        <g opacity={weather * (1 - ov)}>
          <g transform={`translate(${cx - 270} 0)`}>
            <Cloud x={0} y={420 + wob(t, 1, 6)} s={1.2} />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={-60 + i * 40} x2={-70 + i * 40} y1={480 + ((t * 120 + i * 30) % 80)} y2={500 + ((t * 120 + i * 30) % 80)} stroke={C.skyDeep} strokeWidth={6} strokeLinecap="round" />
            ))}
            <Tag x={0} y={680} text="погода на 3 дня" size={34} color={Z.tealSoft} />
          </g>
          <g transform={`translate(${cx + 270} 0)`}>
            <Panel x={-200} y={300} w={400} h={280} fill="#fff" />
            <path d={`M -170 520 L -90 ${460 + Math.sin(t * 2) * 30} L -10 ${500 + Math.cos(t * 3) * 40} L 70 ${400 + Math.sin(t * 2.5) * 50} L 160 ${450 + Math.cos(t * 1.7) * 60}`} stroke={C.coral} strokeWidth={8} fill="none" />
            <Txt x={0} y={360} size={30} weight={900}>
              рынок на 3 года?
            </Txt>
            <Tag x={0} y={680} text="тем более" size={34} color={C.yellow} />
          </g>
        </g>
      )}
      {ov > 0 && (
        <g opacity={ov}>
          <Txt x={cx} y={200} size={42} weight={900}>
            план OfficeVision
          </Txt>
          <Mainframe x={cx} y={560} s={1} t={t} color={C.sky} />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = Math.PI + (i / 4) * Math.PI;
            const x = cx + Math.cos(a) * 380;
            const y = 520 + Math.sin(a) * -1 * 0 + (i % 2) * 120 + 60;
            return (
              <g key={i}>
                <line x1={cx} y1={420} x2={x} y2={y - 60} stroke={Z.grey} strokeWidth={4} strokeDasharray="10 8" opacity={1 - rivals * 0.6} />
                <Computer x={x} y={y} s={0.4} t={t} />
              </g>
            );
          })}
          {rivals > 0 && (
            <g opacity={rivals}>
              {[0, 1].map((i) => (
                <g key={i} transform={`translate(${cx - 360 + i * 720} ${300 + wob(t, i, 6)})`}>
                  <circle r={60} fill={C.coral} stroke={OL} strokeWidth={5} />
                  <Txt x={0} y={14} size={30} weight={900} color="#fff">
                    конк.
                  </Txt>
                </g>
              ))}
              <Pop t={t} at={at(c, 2.7)} x={cx} y={790}>
                <Tag x={0} y={0} text="предвидел всё, кроме конкурентов" size={32} color={C.yellow} />
              </Pop>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ── Исследование копира: 5 центов против полутора; направление и Domino's ──
export const XeroxResearch: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const ignore = ramp(t, at(c, 1), 0.5);
  const dir = ramp(t, at(c, 2), 0.5);
  const grow = ramp(t, at(c, 2.4), Math.max(1, at(c, 2.95) - at(c, 2.4)));
  return (
    <g>
      <g opacity={1 - dir}>
        <g transform={`translate(${cx - 250} 0)`}>
          <rect x={-180} y={240} width={360} height={460} rx={14} fill="#fff" stroke={OL} strokeWidth={5} />
          <Txt x={0} y={300} size={30} weight={900}>
            исследование
          </Txt>
          <Txt x={0} y={400} size={40} weight={900} color={C.coral}>
            5 ¢ — никто
          </Txt>
          <Txt x={0} y={460} size={32} color={C.inkSoft}>
            если есть 1,5 ¢
          </Txt>
          <Cross x={0} y={580} s={110} k={ramp(t, at(c, 1.2), 0.4)} />
          {ignore > 0 && (
            <g transform={`translate(0 470) rotate(${ignore * 25})`} opacity={1 - ignore * 0.5}>
              <rect x={-190} y={-6} width={380} height={12} fill="none" />
            </g>
          )}
        </g>
        <g transform={`translate(${cx + 270} 0)`} opacity={ignore}>
          <rect x={-150} y={380} width={300} height={170} rx={14} fill={Z.greySoft} stroke={OL} strokeWidth={5} />
          <rect x={-110} y={360 - 30 * Math.abs(Math.sin(t * 3))} width={220} height={26} fill="#fff" stroke={OL} strokeWidth={3} />
          <Txt x={0} y={490} size={32} weight={900}>
            Xerox
          </Txt>
          <Tag x={0} y={640} text="…и всё стало историей" size={30} color={C.yellow} />
        </g>
      </g>
      {dir > 0 && (
        <g opacity={dir}>
          <g transform={`translate(${cx - 300} 0)`}>
            <rect x={-180} y={250} width={360} height={260} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={-150} y={280 + i * 36} width={300 - (i % 3) * 40} height={14} rx={7} fill={Z.greySoft} />
            ))}
            <Txt x={0} y={560} size={30} weight={900} color={C.inkSoft}>
              жёсткий план на 10 лет
            </Txt>
            <Cross x={0} y={380} s={140} k={ramp(t, at(c, 2.1), 0.4)} />
          </g>
          <g transform={`translate(${cx + 260} 0)`}>
            {/* компас — направление */}
            <g transform="translate(0 360)">
              <circle r={100} fill="#fff" stroke={OL} strokeWidth={6} />
              <g transform={`rotate(${30 + Math.sin(t * 1.5) * 6})`}>
                <path d="M 0 -80 L 18 0 L 0 80 L -18 0 Z" fill={C.coral} stroke={OL} strokeWidth={4} />
                <path d="M 0 0 L 18 0 L 0 80 L -18 0 Z" fill={Z.greySoft} stroke={OL} strokeWidth={4} />
              </g>
            </g>
            <Txt x={0} y={520} size={30} weight={900}>
              направление · тренды · гибкость
            </Txt>
            {/* Domino's: сеть доставки растёт */}
            {Array.from({ length: 7 }).map((_, i) => {
              const k = clamp01(grow * 7 - i);
              return (
                <g key={i} opacity={k} transform={`translate(${-240 + i * 80} ${700 + (i % 2) * 40}) scale(${0.35 * k})`}>
                  <Shop x={0} y={0} s={1} awning={C.coral} />
                </g>
              );
            })}
            <Txt x={0} y={800} size={26} color={C.inkSoft}>
              Domino's: доставка на дом
            </Txt>
          </g>
        </g>
      )}
    </g>
  );
};

// ── Закон успеха: шар эго раздувается ──
export const EgoBalloon: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const inflate = ramp(t, 0.2, Math.max(1, at(c, 0.9) - 0.2));
  const moves = ramp(t, at(c, 1), 0.5);
  const dec = ramp(t, at(c, 2), 0.5);
  return (
    <g>
      <g opacity={1 - moves}>
        <Balloon x={cx} y={760} r={90 + 170 * inflate} color={C.coral} label="ЭГО" t={t} />
        <Pop t={t} at={at(c, 0.5)} x={cx} y={180}>
          <Tag x={0} y={0} text="успех → высокомерие → провал" size={36} color={C.white} />
        </Pop>
      </g>
      {moves > 0 && (
        <g opacity={moves * (1 - dec)}>
          <g transform={`translate(${cx - 300} 0)`}>
            <Tag x={0} y={300} text="«всё дело в имени»" size={34} color={Z.greySoft} />
            <Cross x={0} y={300} s={90} k={ramp(t, at(c, 1.3), 0.4)} />
          </g>
          <g transform={`translate(${cx + 200} 0)`}>
            {["первыми вошли в сознание", "сузили фокус", "заняли сильный атрибут"].map((w, i) => (
              <Pop key={w} t={t} at={at(c, 1.5 + i * 0.15)} x={0} y={440 + i * 120}>
                <rect x={-280} y={-46} width={560} height={92} rx={46} fill={C.yellow} stroke={OL} strokeWidth={4} />
                <Txt x={0} y={13} size={32} weight={900}>
                  {w}
                </Txt>
              </Pop>
            ))}
          </g>
        </g>
      )}
      {dec > 0 && (
        <g opacity={dec}>
          <Txt x={cx} y={210} size={40} weight={900}>
            Digital Equipment, Кеннет Олсен
          </Txt>
          <MiniPC x={cx - 260} y={600} s={1.3} t={t} />
          <g transform={`translate(${cx + 280} ${560 - 60 * ramp(t, at(c, 2.3), 1)})`} opacity={0.4 + 0.6 * ramp(t, at(c, 2.3), 0.5)}>
            <Computer x={0} y={0} s={0.9} t={t} label="ПК" />
          </g>
          <Pop t={t} at={at(c, 2.6)} x={cx + 280} y={760}>
            <Tag x={0} y={0} text="пропустил перемены" size={30} color={C.coral} textColor="#fff" />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── Объективность: Перо у дилеров; «лучше один раз увидеть» ──
export const Frontline: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const walk = ramp(t, at(c, 0.4), Math.max(1, at(c, 0.95) - at(c, 0.4)));
  const quote = ramp(t, at(c, 1), 0.5);
  return (
    <g>
      <g opacity={1 - quote}>
        <Mainframe x={cx - 420} y={640} s={0.9} t={t} color={Z.greySoft} />
        <Txt x={cx - 420} y={700} size={26} weight={900}>
          совет директоров
        </Txt>
        <Shop x={cx + 380} y={640} s={1.5} label="дилер" awning={C.coral} />
        <Car x={cx + 380} y={740} s={0.5} t={0} color={Z.teal} />
        <g transform={`translate(${cx - 300 + 600 * walk} ${640 - Math.abs(Math.sin(t * 8)) * 10 * (walk < 1 ? 1 : 0)})`}>
          <Dot x={0} y={0} s={2} color={Z.navy} />
        </g>
        <Pop t={t} at={at(c, 0.2)} x={cx} y={250}>
          <Tag x={0} y={0} text="смотреть глазами покупателя" size={36} color={C.yellow} />
        </Pop>
      </g>
      {quote > 0 && (
        <g transform={`translate(${cx} 470) scale(${quote})`}>
          <rect x={-440} y={-130} width={880} height={260} rx={40} fill="#fff" stroke={OL} strokeWidth={6} />
          <g transform="translate(-340 0)">
            <ellipse rx={56} ry={36} fill="#fff" stroke={OL} strokeWidth={6} />
            <circle r={20} fill={C.ink} />
            <circle cx={6} cy={-6} r={6} fill="#fff" />
          </g>
          <Txt x={60} y={-14} size={46} weight={900}>
            лучше один раз увидеть,
          </Txt>
          <Txt x={60} y={50} size={46} weight={900} color={C.coral}>
            чем сто раз услышать
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── Закон неудачи: признать рано; «мы»; Wal-Mart; 3M ──
export const FailFast: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const g = ramp(t, 0.3, Math.max(1, at(c, 0.9) - 0.3));
  const we = ramp(t, at(c, 1), 0.5);
  const wm = ramp(t, at(c, 2), 0.5);
  const mmm = ramp(t, at(c, 3), 0.5);
  return (
    <g>
      <g opacity={1 - we}>
        <rect x={cx - 450} y={720} width={900} height={4} fill={OL} />
        <path d={`M ${cx - 450} 520 L ${cx - 450 + 900 * g} ${520 + 190 * g}`} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
        <path d={`M ${cx - 450} 520 L ${cx - 200} ${590}`} stroke={C.green} strokeWidth={10} strokeLinecap="round" opacity={g} />
        <g opacity={g}>
          <circle cx={cx - 200} cy={590} r={18} fill={C.green} stroke={OL} strokeWidth={4} />
          <Tag x={cx - 200} y={500} text="признать рано" size={30} color={Z.mint} />
          <Tag x={cx + 330} y={640} text="годами «спасать»" size={30} color={Z.greySoft} />
        </g>
        <Pop t={t} at={0.2} x={cx} y={250}>
          <Txt x={0} y={0} size={44} weight={900}>
            неудачу нужно ожидать и принимать
          </Txt>
        </Pop>
      </g>
      {we > 0 && (
        <g opacity={we * (1 - wm)}>
          <g transform={`translate(${cx - 270} 0)`}>
            <Panel x={-220} y={300} w={440} h={240} r={50} fill={C.yellow} />
            <Txt x={0} y={440} size={44} weight={900}>
              «Мы все ошиблись»
            </Txt>
            <Check x={0} y={620} s={50} k={ramp(t, at(c, 1.3), 0.4)} />
          </g>
          <g transform={`translate(${cx + 270} 0)`}>
            <Panel x={-220} y={300} w={440} h={240} r={50} fill={Z.greySoft} />
            <Txt x={0} y={440} size={44} weight={900} color={C.inkSoft}>
              «Я был неправ»
            </Txt>
            <Txt x={0} y={620} size={30} color={C.inkSoft}>
              больно для эго
            </Txt>
          </g>
        </g>
      )}
      {wm > 0 && (
        <g opacity={wm * (1 - mmm)}>
          <Txt x={cx} y={220} size={40} weight={900}>
            Wal-Mart
          </Txt>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${cx - 320 + i * 320} 450) scale(${pop(t, at(c, 2.1 + i * 0.15))})`}>
              <circle r={80} fill="#fff" stroke={OL} strokeWidth={5} />
              <circle r={50} fill={i === 1 ? C.coral : Z.greySoft} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={140} size={28} weight={900}>
                {["эксперимент", "не наказывают", "но не дважды"][i]}
              </Txt>
            </g>
          ))}
          <Cross x={cx + 320} y={450} s={80} k={ramp(t, at(c, 2.6), 0.4)} />
        </g>
      )}
      {mmm > 0 && (
        <g opacity={mmm}>
          <Txt x={cx} y={220} size={40} weight={900}>
            3M: у идеи есть «чемпион»
          </Txt>
          <Dot x={cx - 250} y={560} s={3} color={Z.teal} ring={C.yellowDeep} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${cx + 150 + (i % 2) * 150} ${400 + Math.floor(i / 2) * 180}) rotate(${-6 + i * 4 + wob(t, i, 2)}) scale(${pop(t, at(c, 3.3 + i * 0.12))})`}>
              <rect x={-60} y={-60} width={120} height={120} fill={C.yellow} stroke={OL} strokeWidth={4} />
              <rect x={-60} y={-60} width={120} height={22} fill={C.yellowDeep} />
            </g>
          ))}
          <Pop t={t} at={at(c, 3.6)} x={cx} y={800}>
            <Tag x={0} y={0} text="Post-it: почти дюжина лет" size={32} color={C.white} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── «Рассвет» закрывает эксперимент «ужины» ──
export const BakeryFail: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const months = ramp(t, at(c, 0.25), Math.max(1, at(c, 0.6) - at(c, 0.25)));
  const close = ramp(t, at(c, 0.7), 0.5);
  const save = ramp(t, at(c, 1), 0.5);
  return (
    <g>
      <g transform={`translate(${cx - 270} 0)`}>
        <rect x={-200} y={300} width={400} height={380} rx={20} fill="#2a2f45" stroke={OL} strokeWidth={5} />
        <circle cx={120} cy={360} r={28} fill="#f3f0d0" />
        <Txt x={0} y={460} size={40} weight={900} color="#fff">
          «Рассвет-ужин»
        </Txt>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-160 + i * 120} y={600 - 120 * Math.max(0.15, 1 - months * (0.6 + i * 0.15))} width={80} height={120 * Math.max(0.15, 1 - months * (0.6 + i * 0.15))} rx={8} fill={C.coral} />
        ))}
        <Txt x={0} y={720} size={26} color={C.inkSoft}>
          3 месяца: не идёт
        </Txt>
        {close > 0 && (
          <g transform={`translate(0 460) rotate(-10) scale(${close})`}>
            <rect x={-170} y={-44} width={340} height={88} rx={14} fill="#fff" stroke={C.red} strokeWidth={8} />
            <Txt x={0} y={16} size={42} weight={900} color={C.red}>
              ЗАКРЫТО
            </Txt>
          </g>
        )}
      </g>
      <g transform={`translate(${cx + 270} 0)`}>
        <Pop t={t} at={at(c, 0.8)} x={0} y={260}>
          <rect x={-240} y={-60} width={480} height={120} rx={50} fill="#fff" stroke={OL} strokeWidth={5} />
          <Txt x={0} y={14} size={32} weight={900}>
            «Мы проверили и ошиблись»
          </Txt>
        </Pop>
        {save > 0 && (
          <g opacity={save}>
            <Bakery x={0} y={720} s={0.75} t={t} glow={save} />
            <Tag x={0} y={420} text="силы — для утра" size={34} color={C.yellow} />
          </g>
        )}
      </g>
    </g>
  );
};

