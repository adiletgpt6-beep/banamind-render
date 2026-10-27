// Начало и «Два папы»: первая зарплата, одинаковый доход, книга, анонс, приветствие,
// два отца, пары советов, дуэль фраз, развилка, титул главы.
import React from "react";
import { BRAND } from "../../../../banamind/brand";
import { C, DISPLAY, HEAVY } from "../theme";
import { BookCover, Bubble, Card, Coin, Flow, OL, Person, Pill, Spark, Stamp } from "./draw";
import { Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

type P = { host?: string; [k: string]: unknown };

// центр сцены — в стороне от ведущего
export const cxOf = (p: { host?: unknown }) => (p.host === "right" ? 800 : p.host === "left" ? 1120 : p.host === "corner" ? 1040 : 960);

// ── первая зарплата: конверт раскрывается, монета взлетает, два голоса ──
export const FirstSalary: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const env = pop(t, 0.1);
  const open = ramp(t, 0.9, 0.6);
  const rise = ramp(t, 1.3, 0.9);
  const v1 = pop(t, at(c, 1.05));
  const v2 = pop(t, at(c, 1.5));
  const coinY = 520 - rise * 190;
  return (
    <g>
      {/* лучи */}
      {rise > 0 &&
        Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2 + t * 0.3;
          return <line key={i} x1={cx + Math.cos(a) * 110} y1={coinY + Math.sin(a) * 110} x2={cx + Math.cos(a) * (170 + 20 * Math.sin(t * 3 + i))} y2={coinY + Math.sin(a) * (170 + 20 * Math.sin(t * 3 + i))} stroke={C.gold} strokeWidth={10} strokeLinecap="round" opacity={0.55 * rise} />;
        })}
      {/* конверт */}
      <g transform={`translate(${cx} 620) scale(${env})`}>
        {/* клапан конверта откидывается вверх, из конверта выглядывает расчётный листок */}
        {open > 0.5 && <path d={`M -220 -120 L 0 ${-120 - (open - 0.5) * 2 * 150} L 220 -120 Z`} fill="#ffe7b0" stroke={OL} strokeWidth={6} strokeLinejoin="round" />}
        <rect x={-170} y={-120 - open * 70} width={340} height={180} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-130} y={-90 - open * 70 + i * 34} width={i === 2 ? 140 : 260} height={14} rx={7} fill={i === 0 ? C.sky : C.greyLight} />
        ))}
        <rect x={-220} y={-120} width={440} height={260} rx={22} fill="#fff7e2" stroke={OL} strokeWidth={6} />
        <path d="M -220 -120 L 0 30 L 220 -120" fill="none" stroke={OL} strokeWidth={4} opacity={0.35} />
        {open <= 0.5 && <path d={`M -220 -120 L 0 ${20 - open * 2 * 140} L 220 -120 Z`} fill="#ffe7b0" stroke={OL} strokeWidth={6} strokeLinejoin="round" />}
        <Txt x={0} y={100} size={36} color={C.inkSoft}>
          зарплата
        </Txt>
      </g>
      {rise > 0 && <Coin x={cx} y={coinY} r={95} spin={t * 2.2 * (1 - rise) + 0.0001} face />}
      {/* два голоса */}
      {v1 > 0 && (
        <g transform={`translate(${cx - 330} 240) scale(${v1})`}>
          <Bubble x={0} y={0} w={420} h={150} text={"Купи что-нибудь\nприятное!"} size={36} fill={C.coralLight} tail="right" />
        </g>
      )}
      {v2 > 0 && (
        <g transform={`translate(${cx + 330} 240) scale(${v2})`}>
          <Bubble x={0} y={0} w={420} h={150} text={"Подожди.\nСначала подумай"} size={36} fill={C.mintLight} tail="left" />
        </g>
      )}
    </g>
  );
};

// ── одинаковая зарплата → через десять лет разные картины ──
export const SameSalary: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const later = ramp(t, at(c, 0.45), 1.2);
  const q = pop(t, at(c, 1));
  const xs = [cx - 270, cx + 270];
  return (
    <g>
      {xs.map((x, i) => {
        const good = i === 1;
        const k = pop(t, 0.2 + i * 0.2);
        return (
          <g key={i} opacity={clamp01(k * 1.5)}>
            <Card x={x} y={470} w={460} h={560} fill="#fff" />
            <Person kind={good ? "woman" : "man"} x={x} y={640} s={0.95} t={t} mood={later > 0.5 ? (good ? "happy" : "sad") : "calm"} arm={later > 0.5 && good ? "up" : "down"} />
            {/* одинаковая зарплата */}
            <g transform={`translate(${x} 250)`}>
              <rect x={-170} y={-34} width={340} height={68} rx={34} fill={C.skyLight} stroke={C.skyDeep} strokeWidth={4} />
              <rect x={-160} y={-24} width={320 * clamp01(k)} height={48} rx={24} fill={C.sky} />
              <Txt x={0} y={13} size={30} color="#fff">
                зарплата
              </Txt>
            </g>
            {/* через десять лет */}
            {later > 0 && (
              <g opacity={later}>
                {good ? (
                  <>
                    {[0, 1, 2, 3].map((j) => (
                      <Coin key={j} x={x + 110} y={560 - j * 34} r={34} spin={0} />
                    ))}
                    <Pill x={x} y={720} text="запас и выбор" fill={C.mintLight} color={C.mintDeep} stroke={C.mint} size={32} />
                  </>
                ) : (
                  <>
                    {[0, 1, 2].map((j) => (
                      <g key={j} transform={`translate(${x + 120 + wob(t, j, 3)} ${430 + j * 70}) rotate(${-8 + j * 8})`}>
                        <rect x={-60} y={-26} width={120} height={52} rx={8} fill="#fff" stroke={C.coral} strokeWidth={4} />
                        <Txt x={0} y={10} size={24} color={C.coralDeep}>
                          счёт
                        </Txt>
                      </g>
                    ))}
                    <Pill x={x} y={720} text="долги и усталость" fill={C.coralLight} color={C.coralDeep} stroke={C.coral} size={32} />
                  </>
                )}
              </g>
            )}
          </g>
        );
      })}
      {later > 0 && <Pill x={cx} y={150} text="через 10 лет" fill={C.yellow} size={36} />}
      {q > 0 && (
        <g transform={`translate(${cx} 470) scale(${q})`}>
          <circle r={70} fill={C.gold} stroke={OL} strokeWidth={6} />
          <text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={90} fill={OL}>
            ?
          </text>
        </g>
      )}
    </g>
  );
};

// ── книга и честная рамка ──
export const BookIntro: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.1);
  const dads = pop(t, at(c, 1.1));
  const stamp = ramp(t, at(c, 1.6), 0.45);
  return (
    <g>
      <g opacity={clamp01(k * 1.5)}>
        <BookCover x={cx - 230} y={450} s={0.95 * k} rot={-4 + wob(t, 1, 1)} />
      </g>
      <Pop t={t} at={0.5} x={cx + 210} y={260}>
        <g>
          <Txt x={0} y={0} size={52} weight={900}>
            Роберт Кийосаки
          </Txt>
          <Txt x={0} y={52} size={30} color={C.inkSoft} weight={700}>
            перевод О. Г. Белошеева
          </Txt>
        </g>
      </Pop>
      {dads > 0 && (
        <g opacity={clamp01(dads * 1.5)}>
          <Person kind="poorDad" x={cx + 110} y={720} s={0.9 * dads} t={t} mood="calm" />
          <Person kind="richDad" x={cx + 330} y={720} s={0.9 * dads} t={t} mood="happy" />
          <Pill x={cx + 110} y={790} text="родной отец" size={26} />
          <Pill x={cx + 330} y={790} text="отец друга" size={26} />
        </g>
      )}
      <Stamp x={cx - 230} y={720} text="ВОСПОМИНАНИЯ АВТОРА" k={stamp} color={C.skyDeep} size={30} rot={-5} />
    </g>
  );
};

// ── анонс: карточки глав выстраиваются в путь монеты ──
export const Teaser: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = [
    { label: "6 уроков", col: C.sky },
    { label: "препятствия", col: C.coral },
    { label: "шаги", col: C.mint },
  ];
  const lens = pop(t, at(c, 1.1));
  const coinK = ramp(t, at(c, 2), 2.2);
  const path: [number, number][] = [
    [cx - 470, 640],
    [cx - 160, 640],
    [cx + 160, 640],
    [cx + 470, 640],
  ];
  return (
    <g>
      <Flow pts={path} t={t} k={ramp(t, at(c, 0.3), 1.2)} color={C.gold} dots={false} w={12} />
      {items.map((it, i) => {
        const k = pop(t, at(c, 0.15 + i * 0.25));
        const x = cx - 320 + i * 320;
        return (
          <g key={i} transform={`translate(${x} 430) scale(${k})`}>
            <Card x={0} y={0} w={270} h={200} fill="#fff" stroke={it.col}>
              <Txt x={0} y={14} size={40} weight={900} color={OL}>
                {it.label}
              </Txt>
            </Card>
          </g>
        );
      })}
      {/* «схема автора: где помогает, где нельзя буквально» */}
      {lens > 0 && (
        <g transform={`translate(${cx} 210) scale(${lens})`}>
          <Pill x={-180} y={0} text="помогает думать" fill={C.mintLight} color={C.mintDeep} stroke={C.mint} size={30} />
          <Pill x={200} y={0} text="не буквально" fill={C.orangeLight} color="#b45f06" stroke={C.orange} size={30} />
        </g>
      )}
      {coinK > 0 && <Coin x={path[0][0] + (path[3][0] - path[0][0]) * coinK} y={640 - Math.abs(Math.sin(coinK * Math.PI * 3)) * 40} r={44} spin={t * 4} face />}
    </g>
  );
};

// ── приветствие: логотип BanaMind и слоган ──
export const Hello: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const k = pop(t, 0.15);
  const s2 = pop(t, 0.6);
  return (
    <g>
      <g transform={`translate(960 190) scale(${k})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={DISPLAY} fontSize={110} fill={OL}>
          {BRAND.wordmark[0]}
          <tspan fill={C.goldDeep}>{BRAND.wordmark[1]}</tspan>
        </text>
      </g>
      <g transform={`translate(960 270) scale(${s2})`}>
        <Txt x={0} y={0} size={42} color={C.inkSoft}>
          Большие идеи. Простыми словами.
        </Txt>
      </g>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + t * 0.4;
        return <Coin key={i} x={960 + Math.cos(a) * 560} y={620 + Math.sin(a) * 200} r={34} spin={t * 2 + i} />;
      })}
    </g>
  );
};

// ── два отца: сплит-экран ──
export const TwoDads: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const a = pop(t, at(c, 0));
  const b = pop(t, at(c, 1));
  const both = ramp(t, at(c, 2), 0.6);
  const L = cx - 260;
  const R = cx + 260;
  return (
    <g>
      <rect x={cx - 3} y={150} width={6} height={680} fill={OL} opacity={0.15 * both + 0.1} />
      {a > 0 && (
        <g opacity={clamp01(a * 1.5)}>
          <Card x={L} y={470} w={460} h={600} fill="#eef3ff" stroke={C.skyDeep} />
          <Person kind="poorDad" x={L} y={640} s={1.05 * a} t={t} mood={both > 0.5 ? "sad" : "calm"} arm="hold" />
          {/* диплом */}
          <g transform={`translate(${L + 120} 470) rotate(${-10 + wob(t, 2, 2)})`}>
            <rect x={-56} y={-38} width={112} height={76} rx={8} fill="#fff" stroke={OL} strokeWidth={4} />
            <circle cx={30} cy={18} r={12} fill={C.coral} />
            <line x1={-40} y1={-14} x2={30} y2={-14} stroke={C.grey} strokeWidth={5} />
            <line x1={-40} y1={4} x2={10} y2={4} stroke={C.grey} strokeWidth={5} />
          </g>
          <Pill x={L} y={230} text="бедный папа" fill={C.skyLight} color={C.skyDeep} stroke={C.skyDeep} size={36} />
          <Txt x={L} y={720} size={28} color={C.inkSoft}>
            {"доктор наук · учитель"}
          </Txt>
        </g>
      )}
      {b > 0 && (
        <g opacity={clamp01(b * 1.5)}>
          <Card x={R} y={470} w={460} h={600} fill="#fff3e6" stroke="#c2671f" />
          <Person kind="richDad" x={R} y={640} s={1.05 * b} t={t} mood="happy" arm="out" />
          {/* магазин, ресторан, склад — значки */}
          {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${R - 110 + i * 110} ${320 + Math.sin(t * 2 + i) * 4})`}>
                <rect x={-40} y={-36} width={80} height={60} rx={10} fill={[C.mintLight, C.goldLight, C.violetLight][i]} stroke={OL} strokeWidth={4} />
                <path d={`M -40 -36 L 0 -62 L 40 -36`} fill={[C.mint, C.gold, C.violet][i]} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
              </g>
            ))}
          <Pill x={R} y={230} text="богатый папа" fill={C.goldLight} color="#8a4b12" stroke="#c2671f" size={36} />
          <Txt x={R} y={720} size={28} color={C.inkSoft}>
            {"8 классов · своё дело"}
          </Txt>
        </g>
      )}
      {both > 0 && (
        <g opacity={both}>
          <Flow pts={[[L - 120, 800], [L + 120, 800]]} t={t} color={C.coral} w={8} n={3} />
          <Flow pts={[[R - 120, 800], [R + 120, 800]]} t={t} color={C.mint} w={8} n={3} />
        </g>
      )}
    </g>
  );
};

// ── пары противоположных советов: слева/справа реплики ──
export const PhrasePairs: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const pairs = [
    ["Любовь к деньгам —\nкорень зол", "Корень зол —\nв нехватке денег"],
    ["Работать в хорошей\nкомпании", "Купить хорошую\nкомпанию"],
    ["Не рискуй", "Учись управлять\nриском"],
    ["Резюме", "Бизнес-план"],
  ];
  const beats = [0, 1, 2, 3];
  let cur = 0;
  beats.forEach((b, i) => {
    if (t >= at(c, b) - 0.1) cur = i;
  });
  // ряды накапливаются: текущий крупно, прошлые — компактно выше
  return (
    <g>
      <Pill x={cx - 250} y={110} text="бедный папа" fill={C.skyLight} color={C.skyDeep} stroke={C.skyDeep} size={30} />
      <Pill x={cx + 250} y={110} text="богатый папа" fill={C.goldLight} color="#8a4b12" stroke="#c2671f" size={30} />
      {pairs.map((pr, i) => {
        const k = pop(t, at(c, beats[i]));
        if (k <= 0) return null;
        const active = i === cur;
        const y = 240 + i * 160;
        return (
          <g key={i} opacity={active ? 1 : 0.55}>
            <g transform={`translate(${cx - 250} ${y}) scale(${k})`}>
              <Bubble x={0} y={0} w={440} h={135} text={pr[0]} size={32} fill={C.skyLight} tail="none" />
            </g>
            <g transform={`translate(${cx + 250} ${y}) scale(${k})`}>
              <Bubble x={0} y={0} w={440} h={135} text={pr[1]} size={32} fill={C.goldLight} tail="none" />
            </g>
            <circle cx={cx} cy={y} r={30} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={cx} y={y + 11} size={30} weight={900}>
              vs
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ── дуэль фраз: «не могу позволить» (мозг гаснет) vs «как могу позволить?» (шестерёнки) ──
const Brain: React.FC<{ x: number; y: number; on: number; t: number }> = ({ x, y, on, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -90 10 Q -110 -60 -50 -80 Q -20 -120 30 -95 Q 90 -100 95 -40 Q 120 10 80 45 Q 60 85 0 75 Q -60 90 -80 50 Q -110 40 -90 10 Z" fill={on > 0.5 ? "#ffc2d1" : "#e3e6ee"} stroke={OL} strokeWidth={6} />
    <path d="M -40 -60 Q -10 -30 -40 0 M 20 -70 Q 40 -40 10 -10 Q -10 20 20 50" fill="none" stroke={OL} strokeWidth={4} opacity={0.5} />
    {on > 0 &&
      [0, 1].map((i) => (
        <g key={i} transform={`translate(${i ? 70 : -60} ${i ? -90 : -100}) rotate(${(i ? -1 : 1) * t * 90})`} opacity={on}>
          {Array.from({ length: 8 }).map((_, j) => (
            <rect key={j} x={-7} y={-36} width={14} height={18} rx={3} fill={C.gold} stroke={OL} strokeWidth={3} transform={`rotate(${j * 45})`} />
          ))}
          <circle r={24} fill={C.gold} stroke={OL} strokeWidth={4} />
          <circle r={8} fill="#fff" stroke={OL} strokeWidth={3} />
        </g>
      ))}
  </g>
);

export const PhraseDuel: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const a = pop(t, at(c, 0.3));
  const b = pop(t, at(c, 1));
  const think = ramp(t, at(c, 1.3), 0.6);
  const note = ramp(t, at(c, 2.6), 0.5);
  return (
    <g>
      {a > 0 && (
        <g transform={`translate(${cx - 270} 0)`}>
          <g transform={`translate(0 230) scale(${a})`}>
            <Bubble x={0} y={0} w={480} h={160} text={"«Я не могу себе\nэтого позволить»"} size={36} fill="#eef0f5" />
          </g>
          <Brain x={0} y={540} on={0} t={t} />
          {a > 0.9 && (
            <g opacity={ramp(t, at(c, 0.6), 0.5)}>
              <Txt x={0} y={680} size={34} color={C.inkSoft}>
                тема закрыта
              </Txt>
              <path d={`M -60 ${450} L 60 ${450}`} stroke={C.grey} strokeWidth={10} strokeLinecap="round" />
            </g>
          )}
        </g>
      )}
      {b > 0 && (
        <g transform={`translate(${cx + 270} 0)`}>
          <g transform={`translate(0 230) scale(${b})`}>
            <Bubble x={0} y={0} w={480} h={160} text={"«Как я могу себе\nэто позволить?»"} size={36} fill={C.mintLight} />
          </g>
          <Brain x={0} y={540} on={think} t={t} />
          {think > 0 &&
            [0, 1, 2].map((i) => (
              <Pop key={i} t={t} at={at(c, 1.4) + i * 0.25} x={-150 + i * 150} y={710}>
                <Pill x={0} y={0} text={["идея", "план", "вариант"][i]} fill={C.goldLight} size={28} />
              </Pop>
            ))}
        </g>
      )}
      {note > 0 && <Stamp x={cx} y={830} text="НЕ «ПОКУПАТЬ ВСЁ ПОДРЯД»" k={note} color={C.coralDeep} size={30} rot={-3} />}
    </g>
  );
};

// ── развилка: две дороги, выбор в девять лет, шесть уроков ──
export const ForkRoad: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf({ host: "center" });
  const roads = ramp(t, 0.2, 1);
  const kid = ramp(t, at(c, 0.4), 1.6);
  const six = ramp(t, at(c, 1), 0.4);
  const warn = ramp(t, at(c, 1.6), 0.5);
  return (
    <g>
      {/* дороги */}
      <path d={`M ${cx} 900 L ${cx} 640 Q ${cx} 560 ${cx - 260} 420 L ${cx - 420} 300`} fill="none" stroke="#d8c39a" strokeWidth={90 * roads} strokeLinecap="round" />
      <path d={`M ${cx} 640 Q ${cx} 560 ${cx + 260} 420 L ${cx + 420} 300`} fill="none" stroke="#d8c39a" strokeWidth={90 * roads} strokeLinecap="round" />
      <path d={`M ${cx} 900 L ${cx} 640`} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="24 22" opacity={roads} />
      <Pill x={cx - 420} y={230} text="работа ради денег" fill={C.skyLight} color={C.skyDeep} stroke={C.skyDeep} size={30} />
      <Pill x={cx + 420} y={230} text="учиться, как работают деньги" fill={C.goldLight} color="#8a4b12" stroke="#c2671f" size={30} />
      {/* мальчик идёт по правой дороге */}
      <Person kind="kid" x={cx + 260 * kid} y={840 - 380 * kid} s={0.75 - 0.25 * kid} t={t} mood="happy" />
      {/* шесть уроков-ступенек */}
      {six > 0 &&
        Array.from({ length: 6 }).map((_, i) => {
          const k = pop(t, at(c, 1) + i * 0.12);
          return (
            <g key={i} transform={`translate(${cx + 470 + (i % 3) * 0 - 40} ${380 + i * 60}) scale(${k})`}>
              <circle r={26} fill={C.gold} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={10} size={28} weight={900}>
                {String(i + 1)}
              </Txt>
            </g>
          );
        })}
      {warn > 0 && <Stamp x={cx - 330} y={720} text="ОДНОГО ПОЗИТИВА МАЛО" k={warn} color={C.skyDeep} size={28} rot={-6} />}
    </g>
  );
};

// ── титул главы ──
export const ChapterCard: React.FC<VisualProps<P & { n: string; name: string; note?: string; label?: string }>> = (c) => {
  const { t, p } = c;
  const k = pop(t, 0.1);
  const n2 = pop(t, 0.45);
  const line = ramp(t, 0.6, 0.8);
  const note = ramp(t, at(c, 1), 0.4);
  const name = p.name;
  const size = name.length > 34 ? 60 : name.length > 26 ? 70 : 82;
  return (
    <g>
      <g transform={`translate(1040 330) scale(${k})`}>
        <circle r={120} fill={C.gold} stroke={C.goldDeep} strokeWidth={14} />
        <circle r={92} fill="none" stroke={C.goldLight} strokeWidth={6} />
        <text x={0} y={46} textAnchor="middle" fontFamily={DISPLAY} fontSize={130} fill={OL}>
          {p.n}
        </text>
      </g>
      <Spark x={1190 + wob(t, 1, 6)} y={220} s={1.2} opacity={k} />
      <Spark x={880} y={430 + wob(t, 2, 6)} s={0.8} opacity={k} />
      <g transform={`translate(1040 520) scale(${n2})`} opacity={clamp01(n2 * 1.5)}>
        <Txt x={0} y={0} size={38} color={C.inkSoft} weight={800}>
          {(p.label ?? "Урок").toUpperCase()}
        </Txt>
        <text x={0} y={90} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={size} fill={OL}>
          {name.length > 30 ? (
            <>
              <tspan x={0} dy={0}>
                {name.split(" ").slice(0, Math.ceil(name.split(" ").length / 2)).join(" ")}
              </tspan>
              <tspan x={0} dy={size * 1.12}>
                {name.split(" ").slice(Math.ceil(name.split(" ").length / 2)).join(" ")}
              </tspan>
            </>
          ) : (
            name
          )}
        </text>
      </g>
      <rect x={1040 - 340 * line} y={name.length > 30 ? 740 : 650} width={680 * line} height={8} rx={4} fill={C.gold} />
      {p.note && <Stamp x={1040} y={830} text={String(p.note).toUpperCase()} k={note} color={C.skyDeep} size={30} rot={-3} />}
    </g>
  );
};
