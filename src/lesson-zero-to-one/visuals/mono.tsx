// Части «Монополия» и «Долгий бизнес»: авиакомпании и Google, две модели рынка,
// как компании описывают рынок, «две равно уважаемых семьи», гонка считывателей,
// слияние в кафе, строка Толстого, будущие деньги, четыре опоры, «в 10 раз лучше»,
// маленький рынок, рост кругами, последний ход.
import React from "react";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, Z } from "../theme";
import { Book, ChessKing, Coin, Dot, Laptop, Magnifier, OL, Pawn, Plane, Shop } from "./draw";
import { AX, BigLabel, Swords } from "./parts";

type VP = VisualProps<{ host?: string }>;

// ── Польза ≠ прибыль: авиакомпании и Google (данные книги, 2012) ──
export const ProfitBars: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const a = ramp(t, at(c, 1), 0.8);
  const cents = pop(t, at(c, 2));
  const g = ramp(t, at(c, 3), 0.8);
  const gp = ramp(t, at(c, 3.5), 0.8);
  const base = 780;
  return (
    <g>
      <g opacity={1 - ramp(t, at(c, 4), 0.4)}>
        <Pop t={t} at={0.1} x={cx} y={170}>
          <Txt x={0} y={0} size={48} weight={900}>
            польза ≠ прибыль
          </Txt>
        </Pop>
      </g>
      <Tag x={cx + 420} y={300} text="данные 2012 г." size={26} color={C.white} />
      {/* авиакомпании */}
      <g opacity={clamp01(a * 2)}>
        <Plane x={cx - 280 + Math.sin(t) * 10} y={300} s={0.9} rot={-6} />
        <rect x={cx - 380} y={base - 380 * a} width={200} height={380 * a} rx={12} fill={Z.teal} stroke={OL} strokeWidth={5} />
        <Txt x={cx - 280} y={base + 50} size={32} weight={900}>
          авиакомпании
        </Txt>
        <Txt x={cx - 280} y={base - 380 * a - 20} size={30} color={C.inkSoft}>
          выручка
        </Txt>
        {cents > 0 && (
          <g>
            <rect x={cx - 170} y={base - 6} width={60} height={6} fill={C.green} />
            <g transform={`translate(${cx - 70} ${base - 60}) scale(${cents})`}>
              <Coin x={0} y={0} s={0.7} label="¢" />
              <Txt x={90} y={10} size={34} weight={900} color={C.red} anchor="start">
                ≈ 37 центов
              </Txt>
              <Txt x={90} y={50} size={26} color={C.inkSoft} anchor="start">
                прибыль с пассажира
              </Txt>
            </g>
          </g>
        )}
      </g>
      {/* Google */}
      {g > 0 && (
        <g>
          <Magnifier x={cx + 400} y={420} s={0.8} rot={wob(t, 1, 4)} />
          <rect x={cx + 310} y={base - 120 * g} width={200} height={120 * g} rx={12} fill={Z.greySoft} stroke={OL} strokeWidth={5} />
          <rect x={cx + 310} y={base - 120 * g} width={200} height={25 * gp} rx={12} fill={C.green} stroke={OL} strokeWidth={4} />
          <Txt x={cx + 410} y={base + 50} size={32} weight={900}>
            Google
          </Txt>
          {gp > 0 && (
            <Pop t={t} at={at(c, 3.55)} x={cx + 380} y={base - 190}>
              <Tag x={0} y={0} text="≈ 1/5 — чистая прибыль" size={30} color={C.yellow} />
            </Pop>
          )}
        </g>
      )}
      <Pop t={t} at={at(c, 4)} x={cx} y={175}>
        <Tag x={0} y={0} text="создать ценность + сохранить её часть" size={36} color={C.yellow} />
      </Pop>
    </g>
  );
};

// ── Совершенная конкуренция и «монополия» в смысле книги ──
export const TwoModels: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const left = ramp(t, 0.1, 0.6);
  const price = ramp(t, at(c, 0.5), at(c, 1.9) - at(c, 0.5));
  const right = ramp(t, at(c, 2), 0.6);
  const notThis = ramp(t, at(c, 3), 0.6);
  const unique = pop(t, at(c, 4.3));
  const adds = ramp(t, at(c, 5), 0.8);
  return (
    <g>
      <g opacity={left}>
        <Panel x={cx - 580} y={150} w={540} h={640} fill="#ffffffcc" />
        <Txt x={cx - 310} y={220} size={36} weight={900}>
          совершенная конкуренция
        </Txt>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Shop key={i} x={cx - 460 + (i % 3) * 150} y={420 + Math.floor(i / 3) * 180} s={0.6} awning={Z.grey} />
        ))}
        <Txt x={cx - 310} y={720} size={36} color={C.inkSoft}>
          цена →
        </Txt>
        <rect x={cx - 210} y={700} width={140 * (1 - price * 0.92)} height={26} rx={13} fill={C.red} />
      </g>
      {right > 0 && (
        <g opacity={right}>
          <Panel x={cx + 40} y={150} w={540} h={640} fill="#ffffffee" stroke={unique > 0 ? C.yellowDeep : undefined} />
          <Txt x={cx + 310} y={220} size={36} weight={900}>
            «монополия» по Тилю
          </Txt>
          <g opacity={1 - unique}>
            {["нарушать закон", "давить нечестно", "привилегии"].map((s, i) => (
              <g key={s} opacity={ramp(t, at(c, 3.1 + i * 0.2), 0.4)}>
                <Txt x={cx + 310} y={320 + i * 90} size={36} color={C.inkSoft}>
                  {s}
                </Txt>
                <line x1={cx + 140} x2={cx + 480} y1={308 + i * 90} y2={308 + i * 90} stroke={C.red} strokeWidth={8 * notThis} strokeLinecap="round" />
              </g>
            ))}
            <Cross x={cx + 310} y={620} s={110} k={ramp(t, at(c, 3.6), 0.5)} />
          </g>
          {unique > 0 && (
            <g transform={`translate(${cx + 310} 470) scale(${unique})`}>
              <circle r={150} fill={C.yellow} opacity={0.35} />
              <Shop x={0} y={60} s={1.1} awning={C.yellowDeep} glow={1} />
              <Txt x={0} y={170} size={34} weight={900}>
                нет ничего сравнимого
              </Txt>
            </g>
          )}
          {adds > 0 && (
            <Pop t={t} at={at(c, 5.05)} x={cx + 310} y={740}>
              <Tag x={0} y={0} text="+ новый выбор" size={36} color={C.green} textColor={C.white} />
            </Pop>
          )}
        </g>
      )}
    </g>
  );
};

// ── Два вида неправды о рынке: пересечение и объединение ──
export const MarketLies: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const lx = cx - 300;
  const rx = cx + 300;
  const narrow = ramp(t, at(c, 1), 0.8);
  const real = ramp(t, at(c, 2), 0.8);
  const wide = ramp(t, at(c, 3), 0.8);
  const honest = pop(t, at(c, 4));
  const circles = [
    { dx: -70, dy: -40, label: "британская кухня", color: "#ffd0c7" },
    { dx: 70, dy: -40, label: "ресторан", color: "#cfe9ff" },
    { dx: 0, dy: 70, label: "Пало-Альто", color: "#d5f5df" },
  ];
  return (
    <g>
      <g opacity={narrow}>
        <Txt x={lx} y={190} size={34} weight={900}>
          конкурент сужает рынок
        </Txt>
        {circles.map((ci, i) => (
          <circle key={i} cx={lx + ci.dx * (1 - real * 0.5)} cy={460 + ci.dy * (1 - real * 0.5)} r={110 * (1 + real * 0.45)} fill={ci.color} fillOpacity={0.55} stroke={OL} strokeWidth={4} opacity={i < 2 || real < 0.5 ? 1 : 0.6} />
        ))}
        {real < 0.5 &&
          circles.map((ci, i) => (
            <Txt key={i} x={lx + ci.dx * 1.6} y={460 + ci.dy * 1.9 + (i === 2 ? 60 : 0)} size={24} color={C.inkSoft}>
              {ci.label}
            </Txt>
          ))}
        <circle cx={lx} cy={460} r={14 + 6 * Math.sin(t * 5)} fill={C.coral} stroke={OL} strokeWidth={4} />
        <Txt x={lx} y={420} size={30} weight={900} color={C.coral} opacity={1 - real}>
          «мы первые!»
        </Txt>
        {real > 0 && (
          <Txt x={lx} y={740} size={30} weight={900} opacity={real}>
            на деле — все рестораны города
          </Txt>
        )}
      </g>
      {wide > 0 && (
        <g opacity={wide}>
          <Txt x={rx} y={190} size={34} weight={900}>
            лидер «расширяет» рынок
          </Txt>
          <rect x={rx - 220} y={260} width={440} height={420} rx={200} fill="#cfe9ff" stroke={OL} strokeWidth={4} />
          {Array.from({ length: 5 }).map((_, i) => (
            <path key={i} d={`M ${rx - 150 + i * 70} ${520 + Math.sin(t * 2 + i) * 20} q 20 -20 40 0 q -20 20 -40 0`} fill={Z.grey} opacity={0.6} />
          ))}
          <g transform={`translate(${rx + Math.sin(t) * 30} 420)`}>
            <path d="M -30 0 q 30 -26 60 0 q -30 26 -60 0 Z M 30 0 l 18 -14 l 0 28 Z" fill={C.yellowDeep} stroke={OL} strokeWidth={3} />
          </g>
          <Txt x={rx} y={720} size={30} weight={900}>
            «мы маленькая рыбка»
          </Txt>
        </g>
      )}
      {honest > 0 && (
        <g transform={`translate(${cx} 820) scale(${honest})`}>
          <Tag x={0} y={0} text="определяйте рынок честно" size={42} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── «Две равно уважаемых семьи…»: соперники копируют друг друга ──
const Castle: React.FC<{ x: number; y: number; color: string; s?: number }> = ({ x, y, color, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-90} y={-160} width={180} height={160} fill={color} stroke={OL} strokeWidth={5} />
    {[-90, -30, 30].map((bx, i) => (
      <rect key={i} x={bx} y={-190} width={60} height={34} fill={color} stroke={OL} strokeWidth={5} />
    ))}
    <rect x={-24} y={-70} width={48} height={70} rx={24} fill="#c98b4a" stroke={OL} strokeWidth={4} />
  </g>
);
export const Rivals: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const fight = ramp(t, at(c, 1), 0.6);
  const fronts = ramp(t, at(c, 2), 0.6);
  const apple = pop(t, at(c, 3) + 0.3);
  const sway = Math.sin(t * 5) * 8 * fight * (1 - apple * 0.8);
  return (
    <g>
      <Pop t={t} at={0.1} x={cx} y={190}>
        <Txt x={0} y={0} size={44} weight={900}>
          «Две равно уважаемых семьи…»
        </Txt>
      </Pop>
      <Castle x={cx - 340 + sway} y={560} color="#cfe9ff" />
      <Castle x={cx + 340 - sway} y={560} color="#cfe9ff" />
      {fight > 0 && <Swords x={cx} y={480} s={0.9 * fight} t={t} />}
      {fronts > 0 &&
        ["поиск", "браузеры", "офис"].map((s, i) => (
          <Pop key={s} t={t} at={at(c, 2.2 + i * 0.15)} x={cx - 260 + i * 260} y={280}>
            <Tag x={0} y={0} text={s} size={30} color={C.white} />
          </Pop>
        ))}
      <Txt x={cx - 340} y={620} size={32} weight={900} opacity={fronts}>
        Microsoft
      </Txt>
      <Txt x={cx + 340} y={620} size={32} weight={900} opacity={fronts}>
        Google
      </Txt>
      {apple > 0 && (
        <g transform={`translate(${cx} 740) scale(${apple})`}>
          <rect x={-300} y={-60} width={600} height={120} rx={30} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={-6} size={34} weight={900}>
            январь 2013: Apple дороже,
          </Txt>
          <Txt x={0} y={38} size={34} weight={900}>
            чем Microsoft + Google
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── Гонка считывателей: квадрат → полумесяц → цилиндр → треугольник ──
export const Copycats: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const shapes = [
    { d: "M -45 -45 L 45 -45 L 45 45 L -45 45 Z", label: "квадрат", at: at(c, 0.6) },
    { d: "M -50 30 A 60 60 0 0 1 50 30 A 44 44 0 0 0 -50 30 Z", label: "полумесяц", at: at(c, 1.1) },
    { d: "M -30 -50 L 30 -50 Q 44 0 30 50 L -30 50 Q -44 0 -30 -50 Z", label: "цилиндр", at: at(c, 1.4) },
    { d: "M 0 -55 L 55 45 L -55 45 Z", label: "треугольник", at: at(c, 1.75) },
  ];
  const same = pop(t, at(c, 2));
  return (
    <g>
      {shapes.map((sh, i) => {
        const k = pop(t, sh.at);
        if (k <= 0) return null;
        const x = cx - 420 + i * 280;
        return (
          <g key={i} transform={`translate(${x} 430) scale(${k})`}>
            <rect x={-70} y={-200} width={140} height={260} rx={24} fill={C.ink} stroke={OL} strokeWidth={5} />
            <rect x={-58} y={-186} width={116} height={220} rx={12} fill={Z.tealSoft} />
            <g transform={`translate(0 120) rotate(${wob(t, i, 5)})`}>
              <path d={sh.d} fill={i === 0 ? "#fff" : Z.grey} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
            </g>
            <Txt x={0} y={240} size={30} weight={900}>
              {sh.label}
            </Txt>
            {i > 0 && <Arrow x1={-230} y1={120} x2={-120} y2={120} k={ramp(t, sh.at, 0.4)} color={Z.grey} w={7} />}
          </g>
        );
      })}
      <Pop t={t} at={0.1} x={cx - 420} y={190}>
        <Tag x={0} y={0} text="Square, 2010" size={32} color={C.yellow} />
      </Pop>
      {same > 0 && (
        <g transform={`translate(${cx} 770) scale(${same})`}>
          <Tag x={0} y={0} text="форма новая — суть та же" size={42} color={C.coral} textColor={C.white} />
        </g>
      )}
    </g>
  );
};

// ── PayPal и X.com: война → кафе → слияние ──
export const Merge: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const war = ramp(t, at(c, 1), 0.6);
  const meet = ramp(t, at(c, 2), at(c, 2.6) - at(c, 2));
  const one = pop(t, at(c, 2.7));
  const lx = cx - 380 + meet * 290;
  const rx = cx + 380 - meet * 290;
  return (
    <g>
      <line x1={cx - 560} y1={640} x2={cx + 560} y2={640} stroke={Z.grey} strokeWidth={8} strokeDasharray="30 20" />
      <Txt x={cx} y={700} size={28} color={C.inkSoft} opacity={1 - meet}>
        4 квартала
      </Txt>
      <g opacity={1 - one}>
        <Shop x={lx} y={600} s={1} awning={Z.teal} label="PayPal" />
        <Shop x={rx} y={600} s={1} awning={Z.purple} label="X.com" />
      </g>
      {war > 0 && meet < 0.5 && (
        <g opacity={war * (1 - meet * 2)}>
          <Swords x={cx} y={430} s={1} t={t} />
          <Tag x={cx} y={250} text="100 часов в неделю" size={36} color="#ffd9d6" />
        </g>
      )}
      {meet > 0 && one <= 0 && (
        <g transform={`translate(${cx} 300)`} opacity={meet}>
          <path d="M -40 -20 L 40 -20 L 32 40 Q 0 52 -32 40 Z" fill="#fff" stroke={OL} strokeWidth={5} />
          <path d="M 40 -6 q 26 0 22 22 q -4 16 -24 14" fill="none" stroke={OL} strokeWidth={5} />
          {[0, 1].map((i) => (
            <path key={i} d={`M ${-14 + i * 24} -34 q 8 -14 0 -28`} stroke={Z.grey} strokeWidth={5} fill="none" opacity={0.5 + 0.5 * Math.sin(t * 3 + i)} />
          ))}
          <Txt x={0} y={110} size={32} weight={900}>
            встреча в кафе
          </Txt>
        </g>
      )}
      {one > 0 && (
        <g transform={`translate(${cx} 600) scale(${one})`}>
          <circle cx={0} cy={-80} r={190} fill={C.yellow} opacity={0.3} />
          <Shop x={0} y={0} s={1.4} awning={C.yellowDeep} label="вместе" />
          <Check x={0} y={90} s={44} k={ramp(t, at(c, 2.9), 0.5)} />
        </g>
      )}
      <Pop t={t} at={at(c, 3.2)} x={cx} y={200}>
        <Tag x={0} y={0} text="конкуренция — не доблесть" size={42} color={C.white} />
      </Pop>
    </g>
  );
};

// ── Строка Толстого, перевёрнутая Тилем ──
export const Tolstoy: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const happy = ramp(t, 0.3, 0.6);
  const sad = ramp(t, at(c, 1), 0.6);
  const colors = [C.coral, Z.teal, C.yellowDeep, Z.purple, C.skyDeep];
  const shapes = ["M 0 -50 L 47 -15 L 29 40 L -29 40 L -47 -15 Z", "M -45 -45 L 45 -45 L 45 45 L -45 45 Z", "M 0 -55 L 55 45 L -55 45 Z", "M 0 -50 A 50 50 0 1 1 -0.1 -50 Z", "M -50 0 L 0 -50 L 50 0 L 0 50 Z"];
  return (
    <g>
      <g opacity={happy}>
        <Txt x={cx} y={190} size={42} weight={900}>
          счастливые компании — каждая по-своему
        </Txt>
        {shapes.map((d, i) => (
          <g key={i} transform={`translate(${cx - 440 + i * 220} ${330 + Math.sin(t * 2 + i) * 10}) scale(${pop(t, 0.3 + i * 0.15)})`}>
            <path d={d} fill={colors[i]} stroke={OL} strokeWidth={5} />
          </g>
        ))}
      </g>
      {sad > 0 && (
        <g opacity={sad}>
          <Txt x={cx} y={540} size={42} weight={900} color={C.inkSoft}>
            неудачные — одинаково
          </Txt>
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i} transform={`translate(${cx - 440 + i * 220} 680) scale(${pop(t, at(c, 1.1) + i * 0.1)})`}>
              <rect x={-45} y={-45} width={90} height={90} rx={8} fill={Z.grey} stroke={OL} strokeWidth={5} />
            </g>
          ))}
          <Swords x={cx} y={800} s={0.45} t={t} />
        </g>
      )}
    </g>
  );
};

// ── Ценность бизнеса — в будущих деньгах ──
export const FutureCash: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const grow = ramp(t, at(c, 1), at(c, 1.9) - at(c, 1));
  const q = pop(t, at(c, 2));
  const years = ["сегодня", "+2", "+4", "+6", "+8", "+10"];
  return (
    <g>
      <Pop t={t} at={0.1} x={cx} y={200}>
        <Txt x={0} y={0} size={52} weight={900}>
          надолго ли?
        </Txt>
      </Pop>
      <line x1={cx - 500} y1={720} x2={cx + 500} y2={720} stroke={C.ink} strokeWidth={5} />
      {years.map((y, i) => {
        const h = 60 + i * 55;
        const k = clamp01(grow * 6 - i);
        return (
          <g key={y}>
            <rect x={cx - 470 + i * 170} y={720 - h * k} width={110} height={h * k} rx={10} fill={i === 0 ? Z.grey : Z.teal} stroke={OL} strokeWidth={4} />
            {k > 0.8 && <Coin x={cx - 415 + i * 170} y={690 - h - 10 * Math.sin(t * 3 + i)} s={0.55} />}
            <Txt x={cx - 415 + i * 170} y={770} size={28} color={C.inkSoft}>
              {i === 0 ? y : `${y} лет`}
            </Txt>
          </g>
        );
      })}
      {q > 0 && (
        <g transform={`translate(${cx} 300) scale(${q})`}>
          <Tag x={0} y={0} text="нужен ли бизнес через 10 лет?" size={42} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Четыре опоры долгого бизнеса ──
export const FourPillars: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const items = [
    { label: "технология", color: Z.tealSoft },
    { label: "сетевой эффект", color: "#ffe7c2" },
    { label: "масштаб", color: "#e6e1ff" },
    { label: "бренд", color: "#ffd9e4" },
  ];
  const brandWarn = ramp(t, at(c, 4.45), 0.5);
  return (
    <g>
      <rect x={cx - 520} y={180} width={1040} height={60} rx={20} fill={C.yellow} stroke={OL} strokeWidth={5} opacity={ramp(t, 0.2, 0.5)} />
      <Txt x={cx} y={224} size={36} weight={900} opacity={ramp(t, 0.2, 0.5)}>
        долгий бизнес
      </Txt>
      {items.map((it, i) => {
        const k = pop(t, at(c, i + 1) - 0.1);
        if (k <= 0) return null;
        const x = cx - 390 + i * 260;
        return (
          <g key={i} transform={`translate(${x} 760) scale(1 ${k})`}>
            <rect x={-110} y={-500} width={220} height={500} rx={16} fill={it.color} stroke={OL} strokeWidth={5} />
            <g transform="translate(0 -380)">
              {i === 0 && <Laptop x={0} y={60} s={0.55} t={t} />}
              {i === 1 &&
                [0, 1, 2, 3, 4].map((n) => {
                  const a = (n / 5) * Math.PI * 2 + t * 0.5;
                  return (
                    <g key={n}>
                      <line x1={0} y1={0} x2={Math.cos(a) * 60} y2={Math.sin(a) * 60} stroke={Z.grey} strokeWidth={4} />
                      <Dot x={Math.cos(a) * 60} y={Math.sin(a) * 60 + 10} s={0.55} color={Z.teal} />
                    </g>
                  );
                })}
              {i === 2 &&
                [0, 1, 2].map((n) => <rect key={n} x={-50 + n * 12} y={-30 + n * 12} width={70} height={50} rx={6} fill="#fff" stroke={OL} strokeWidth={3} />)}
              {i === 3 && <path d="M 0 -50 L 14 -16 L 50 -14 L 22 10 L 32 46 L 0 26 L -32 46 L -22 10 L -50 -14 L -14 -16 Z" fill={C.yellow} stroke={OL} strokeWidth={4} />}
            </g>
            <Txt x={0} y={-220} size={30} weight={900}>
              {it.label.replace(" ", "\n")}
            </Txt>
          </g>
        );
      })}
      {brandWarn > 0 && (
        <Pop t={t} at={at(c, 4.5)} x={cx + 390} y={830}>
          <Tag x={0} y={0} text="без продукта — обёртка" size={28} color="#ffd9d6" />
        </Pop>
      )}
    </g>
  );
};

// ── «В 10 раз лучше»: чек по почте против мгновенной оплаты; книжный ──
export const TenX: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const meter = ramp(t, 0.3, at(c, 0.9));
  const cheque = ramp(t, at(c, 1), 0.6);
  const instant = pop(t, at(c, 1.55));
  const books = ramp(t, at(c, 2), 0.6);
  const note = pop(t, at(c, 3.4));
  return (
    <g>
      <g opacity={1 - note}>
        <Txt x={cx} y={190} size={46} weight={900}>
          лучше по главному параметру
        </Txt>
        <rect x={cx - 450} y={250} width={900} height={60} rx={30} fill={Z.greySoft} stroke={OL} strokeWidth={4} />
        <rect x={cx - 450} y={250} width={90} height={60} rx={30} fill={Z.grey} />
        <rect x={cx - 450} y={250} width={900 * meter} height={60} rx={30} fill={C.green} opacity={0.85} />
        <BigLabel x={cx + 380} y={410} text={`×${Math.max(1, Math.round(meter * 10))}`} color={C.coral} size={96} />
      </g>
      {cheque > 0 && (
        <g opacity={cheque * (1 - books)}>
          <g transform={`translate(${cx - 300} 600)`}>
            <rect x={-130} y={-80} width={260} height={160} rx={10} fill="#fff" stroke={OL} strokeWidth={5} />
            <path d="M -130 -80 L 0 10 L 130 -80" stroke={OL} strokeWidth={5} fill="none" />
            <Txt x={0} y={140} size={30} weight={900}>
              чек по почте: неделя+
            </Txt>
          </g>
          {instant > 0 && (
            <g transform={`translate(${cx + 280} 600) scale(${instant})`}>
              <circle r={110} fill={C.yellow} opacity={0.4} />
              <path d="M -20 -90 L 30 -10 L 0 -10 L 20 90 L -40 -10 L -10 -10 Z" fill={C.yellowDeep} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
              <Txt x={0} y={150} size={30} weight={900}>
                PayPal: сразу
              </Txt>
            </g>
          )}
        </g>
      )}
      {books > 0 && (
        <g opacity={books}>
          <g transform={`translate(${cx - 300} 600)`}>
            {[0, 1, 2].map((i) => (
              <Book key={i} x={-60 + i * 60} y={0} s={0.45} color={Z.grey} />
            ))}
            <Txt x={0} y={150} size={30} weight={900}>
              обычный книжный
            </Txt>
          </g>
          <g transform={`translate(${cx + 280} 600)`}>
            {Array.from({ length: 15 }).map((_, i) => (
              <Book key={i} x={-160 + (i % 5) * 80} y={-60 + Math.floor(i / 5) * 60} s={0.32} color={[C.coral, Z.teal, C.skyDeep][i % 3]} />
            ))}
            <Txt x={0} y={150} size={30} weight={900}>
              Amazon
            </Txt>
          </g>
        </g>
      )}
      {note > 0 && (
        <g transform={`translate(${cx} 260) scale(${note})`}>
          <Tag x={0} y={0} text="ориентир автора, не закон" size={40} color={C.white} />
        </g>
      )}
    </g>
  );
};

// ── Маленький рынок: разрозненные PalmPilot против плотной группы продавцов eBay ──
export const SmallMarket: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const scatter = ramp(t, at(c, 1), 0.6);
  const fail = ramp(t, at(c, 1.8), 0.5);
  const group = ramp(t, at(c, 2), 0.6);
  const quarter = ramp(t, at(c, 3), 0.9);
  const def = pop(t, at(c, 4.1));
  const pts = Array.from({ length: 22 }).map((_, i) => [((i * 263) % 520) - 260, ((i * 151) % 440) - 220] as const);
  return (
    <g>
      <Pop t={t} at={0.1} x={cx} y={180}>
        <Tag x={0} y={0} text="начинайте с маленького рынка" size={40} color={C.yellow} />
      </Pop>
      {scatter > 0 && (
        <g transform={`translate(${cx - 300} 500)`} opacity={scatter * (1 - group * 0.35)}>
          <circle r={240} fill="#fff" opacity={0.5} />
          {pts.map(([x, y], i) => (
            <g key={i} transform={`translate(${x * 0.8} ${y * 0.8})`}>
              <rect x={-12} y={-18} width={24} height={34} rx={4} fill={Z.grey} stroke={OL} strokeWidth={2.5} />
            </g>
          ))}
          <Txt x={0} y={290} size={30} weight={900}>
            PalmPilot: по всему миру
          </Txt>
          <Cross x={0} y={0} s={160} k={fail} />
        </g>
      )}
      {group > 0 && (
        <g transform={`translate(${cx + 300} 520)`} opacity={group}>
          <circle r={190} fill={C.yellow} opacity={0.25} />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r = 60 + (i % 2) * 55;
            return <Dot key={i} x={Math.cos(a) * r} y={Math.sin(a) * r + 10} s={0.75} color={i % 4 === 0 && quarter > 0.3 ? Z.teal : Z.grey} ring={i % 4 === 0 && quarter > 0.6 ? C.yellowDeep : undefined} />;
          })}
          <Txt x={0} y={260} size={30} weight={900}>
            активные продавцы eBay
          </Txt>
          {quarter > 0.5 && (
            <Pop t={t} at={at(c, 3.3)} x={0} y={-250}>
              <Tag x={0} y={0} text="через 3 месяца — каждый 4-й" size={32} color={Z.tealSoft} />
            </Pop>
          )}
        </g>
      )}
      {def > 0 && t < at(c, 5) && (
        <g transform={`translate(${cx - 300} 265) scale(${def})`}>
          <Tag x={0} y={0} text="маленький ≠ несуществующий" size={36} color={C.white} />
        </g>
      )}
    </g>
  );
};

// ── Рост кругами: книги → музыка → видео → всё ──
export const Expand: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const rings = ["книги", "диски", "видео", "программы", "всё"];
  const r = ramp(t, 0.2, at(c, 0.95));
  const others = ramp(t, at(c, 1), 0.6);
  const peace = pop(t, at(c, 2.3));
  return (
    <g>
      <g transform={`translate(${cx - 120} 480)`}>
        {rings
          .map((label, i) => {
            const k = clamp01(r * 5 - i);
            const R = 66 + i * 52;
            return (
              <g key={label} opacity={k}>
                <circle r={R} fill={[C.yellow, "#ffe7c2", Z.tealSoft, "#e6e1ff", "#dff5e6"][i]} stroke={OL} strokeWidth={4} />
              </g>
            );
          })
          .reverse()}
        {rings.map((label, i) => (
          <Txt key={label} x={0} y={i === 0 ? 12 : -(66 + i * 52) + 36} size={i === 0 ? 34 : 28} weight={900} opacity={clamp01(r * 5 - i)}>
            {label}
          </Txt>
        ))}
        <Txt x={0} y={330} size={32} weight={900} opacity={r}>
          Amazon
        </Txt>
      </g>
      {others > 0 && (
        <g opacity={others}>
          <g transform={`translate(${cx + 400} 340)`}>
            <circle r={44} fill={C.yellow} stroke={OL} strokeWidth={4} />
            <circle r={100} fill="none" stroke={Z.grey} strokeWidth={4} strokeDasharray="10 10" />
            <Txt x={0} y={150} size={28} weight={900}>
              Facebook: 1 университет
            </Txt>
          </g>
          <g transform={`translate(${cx + 400} 620)`}>
            <circle r={44} fill={C.yellow} stroke={OL} strokeWidth={4} />
            <circle r={100} fill="none" stroke={Z.grey} strokeWidth={4} strokeDasharray="10 10" />
            <Txt x={0} y={150} size={28} weight={900}>
              eBay: коллекционеры
            </Txt>
          </g>
        </g>
      )}
      {peace > 0 && (
        <g transform={`translate(${cx} 150) scale(${peace})`}>
          <Tag x={0} y={0} text="расширяйте рынок, а не воюйте" size={38} color={C.white} />
        </g>
      )}
    </g>
  );
};

// ── Первый ход и последний ход: эндшпиль ──
export const LastMove: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const board = ramp(t, 0.2, 0.6);
  const first = pop(t, 0.6);
  const last = pop(t, at(c, 1.2));
  const end = pop(t, at(c, 2.3));
  const cell = 80;
  const bx = cx - 4 * cell;
  const by = 220;
  return (
    <g opacity={board}>
      {Array.from({ length: 64 }).map((_, i) => {
        const r = Math.floor(i / 8);
        const k = i % 8;
        return <rect key={i} x={bx + k * cell} y={by + r * cell} width={cell} height={cell} fill={(r + k) % 2 ? "#c99b6a" : "#f6e3c5"} />;
      })}
      <rect x={bx} y={by} width={cell * 8} height={cell * 8} fill="none" stroke={OL} strokeWidth={6} />
      {first > 0 && (
        <g opacity={1 - last * 0.5}>
          <Pawn x={bx + cell * 1.5} y={by + cell * (5 - first * 1)} s={0.55} />
          <Tag x={bx - 140} y={by + cell * 4} text="первый ход" size={30} color={C.white} />
        </g>
      )}
      {last > 0 && (
        <g>
          <circle cx={bx + cell * 5.5} cy={by + cell * 1.5} r={70 * last} fill={C.yellow} opacity={0.5} />
          <ChessKing x={bx + cell * 5.5} y={by + cell * 2} s={0.55 * last} color={C.yellow} />
          <Tag x={bx + cell * 8 + 140} y={by + cell * 1.5} text="последний ход" size={30} color={C.yellow} />
        </g>
      )}
      {end > 0 && (
        <g transform={`translate(${cx} 165) scale(${end})`}>
          <Tag x={0} y={0} text="учитесь играть эндшпиль" size={40} color={C.coral} textColor={C.white} />
        </g>
      )}
    </g>
  );
};

