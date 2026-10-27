// Урок 1 «Богатые не работают за деньги»: монетки из тюбиков, пыль на консервах,
// «жизнь толкает», круг «крысиных бегов» с осликом, проверка ценой, оговорка о работе
// по найму, библиотека комиксов и сквозная «дорожка монеты».
import React from "react";
import { C, HEAVY } from "../theme";
import { cxOf } from "./intro";
import { Bubble, Card, Coin, Flow, OL, Person, Pill, RiskMeter, Spark, Stamp } from "./draw";
import { Check, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

type P = { host?: string; [k: string]: unknown };

// ── монетки из тюбиков: тюбики → ковш → форма → монетка; печать «незаконно» ──
export const CoinMold: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const kids = pop(t, 0.2);
  const tubes = ramp(t, at(c, 1), 1.4);
  const melt = ramp(t, at(c, 1.5), 1.2);
  const coin = pop(t, at(c, 1.8));
  const stamp = ramp(t, at(c, 2.2), 0.45);
  const go = ramp(t, at(c, 2.7), 1);
  return (
    <g>
      {/* обида: машина уезжает без них */}
      <g opacity={1 - ramp(t, at(c, 0.9), 0.6)}>
        <g transform={`translate(${cx + 360 + ramp(t, 0.6, 3) * 300} 520)`}>
          <path d="M -150 -30 L -120 -90 L 110 -90 L 150 -30 L 150 0 L -150 0 Z" fill="#fff" stroke={OL} strokeWidth={6} />
          <rect x={-140} y={-40} width={290} height={30} fill="#e8eef9" />
          <circle cx={-90} cy={4} r={26} fill="#3b4566" stroke={OL} strokeWidth={5} />
          <circle cx={90} cy={4} r={26} fill="#3b4566" stroke={OL} strokeWidth={5} />
        </g>
        <Pill x={cx + 360} y={260} text="без нас…" size={34} />
      </g>
      <g opacity={clamp01(kids * 1.5)}>
        <Person kind="kid" x={cx - 420} y={720} s={kids} t={t} mood={coin > 0.5 ? "happy" : "sad"} arm={coin > 0.5 ? "up" : "down"} />
        <Person kind="kid2" x={cx - 250} y={720} s={kids} t={t} mood={coin > 0.5 ? "happy" : "sad"} />
        <Pill x={cx - 420} y={790} text="Роберт" size={26} />
        <Pill x={cx - 250} y={790} text="Майк" size={26} />
      </g>
      {/* тюбики летят в ковш */}
      {tubes > 0 &&
        [0, 1, 2, 3, 4].map((i) => {
          const k = clamp01(tubes * 1.6 - i * 0.15);
          const x0 = cx - 120 + i * 50;
          const x = x0 + (cx + 150 - x0) * k;
          const y = 300 - Math.sin(k * Math.PI) * 120 + k * 160;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${k * 200 + i * 20})`} opacity={1 - melt}>
              <rect x={-14} y={-50} width={28} height={84} rx={8} fill={["#e8f2ff", "#fff", "#ffe8e8", "#eaffef", "#fff6d8"][i]} stroke={OL} strokeWidth={4} />
              <rect x={-9} y={34} width={18} height={14} rx={3} fill={C.grey} stroke={OL} strokeWidth={3} />
            </g>
          );
        })}
      {tubes > 0 && (
        <g transform={`translate(${cx + 150} 520)`}>
          <path d="M -110 -40 L 110 -40 L 90 60 Q 0 90 -90 60 Z" fill="#5a5f6e" stroke={OL} strokeWidth={6} />
          <ellipse cx={0} cy={-40} rx={110} ry={24} fill={melt > 0 ? "#c8ccd6" : "#3b4566"} stroke={OL} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-40 + i * 40} 120 q 10 -30 0 -50 q -10 -20 0 -40`} stroke={C.coral} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(t * 8 + i)} />
          ))}
          <Txt x={0} y={150} size={28} color={C.inkSoft}>
            свинец
          </Txt>
        </g>
      )}
      {coin > 0 && (
        <g transform={`translate(${cx + 360} 470) scale(${coin})`}>
          <rect x={-80} y={-60} width={160} height={120} rx={14} fill="#f4f1ea" stroke={OL} strokeWidth={5} />
          <Coin x={0} y={0} r={46} dim />
          <Spark x={70} y={-70} s={0.8} />
        </g>
      )}
      <Stamp x={cx + 260} y={300} text="ПОДДЕЛКА — НЕЗАКОННО" k={stamp} color={C.coralDeep} size={34} rot={-6} />
      {go > 0 && (
        <g opacity={go}>
          <Flow pts={[[cx - 330, 870], [cx + 260, 870]]} t={t} k={go} color={C.gold} w={10} n={4} />
          <Pill x={cx + 400} y={870} text="к отцу Майка" fill={C.goldLight} size={30} />
        </g>
      )}
    </g>
  );
};

// ── пыль на консервах: 10 центов в час, три монетки → скука и обида ──
export const DustShelf: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const shelf = pop(t, 0.1);
  const pay = ramp(t, at(c, 0.5), 0.5);
  const bored = ramp(t, at(c, 1), 0.6);
  const angry = ramp(t, at(c, 1.55), 0.5);
  const sweep = Math.sin(t * 5) * 60;
  return (
    <g>
      <g transform={`translate(${cx - 120} 460) scale(${shelf})`}>
        <rect x={-330} y={-280} width={660} height={560} rx={20} fill="#fff7ea" stroke={OL} strokeWidth={6} />
        {[0, 1, 2].map((row) => (
          <g key={row}>
            <rect x={-310} y={-120 + row * 170} width={620} height={16} rx={8} fill="#c98b4a" />
            {Array.from({ length: 6 }).map((_, i) => (
              <g key={i} transform={`translate(${-250 + i * 100} ${-160 + row * 170})`}>
                <rect x={-34} y={-40} width={68} height={80} rx={8} fill={["#ff8f70", "#7fd1ae", "#ffd166", "#9bb8ff"][(i + row) % 4]} stroke={OL} strokeWidth={4} />
                <rect x={-34} y={-14} width={68} height={26} fill="#fff" opacity={0.7} />
                {/* пыль */}
                <circle cx={-10 + ((i * 13) % 20)} cy={-46} r={4} fill="#b8a98f" opacity={0.6 * (1 - ((t * 0.5 + i * 0.13 + row * 0.3) % 1))} />
              </g>
            ))}
          </g>
        ))}
      </g>
      {/* веничек */}
      <g transform={`translate(${cx - 120 + sweep} ${290}) rotate(${sweep * 0.3})`} opacity={shelf}>
        <rect x={-6} y={-10} width={12} height={110} rx={6} fill="#8a5a2b" />
        <path d="M 0 -10 Q -60 -60 -40 -120 Q 0 -80 0 -10 Q 0 -90 40 -120 Q 60 -60 0 -10" fill="#ff9ec4" stroke={OL} strokeWidth={4} />
      </g>
      {/* оплата */}
      {pay > 0 && (
        <g transform={`translate(${cx + 360} 330)`} opacity={pay}>
          <Pill x={0} y={-130} text="10 ¢ / час" fill={C.goldLight} size={38} />
          {[0, 1, 2].map((i) => (
            <Pop key={i} t={t} at={at(c, 0.6) + i * 0.2} x={-80 + i * 80} y={0}>
              <Coin x={0} y={0} r={34} spin={t * 3 + i} label="10" />
            </Pop>
          ))}
          <Txt x={0} y={90} size={30} color={C.inkSoft}>
            3 часа по субботам
          </Txt>
        </g>
      )}
      {bored > 0 && (
        <g opacity={bored}>
          <Person kind="kid" x={cx + 360} y={800} s={0.9} t={t} mood={angry > 0.4 ? "angry" : "sad"} arm={angry > 0.4 ? "up" : "down"} />
          {angry > 0 && (
            <g transform={`translate(${cx + 360} 560) scale(${angry})`}>
              <Bubble x={0} y={0} w={330} h={110} text="Меня эксплуатируют!" size={30} fill={C.coralLight} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ── «жизнь толкает»: три реакции + «месяц × 50 лет» ──
export const LifePush: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const quote = pop(t, at(c, 0.4));
  const r = [pop(t, at(c, 1.2)), pop(t, at(c, 1.45)), pop(t, at(c, 1.7))];
  const life = ramp(t, at(c, 3), 1.5);
  const push = Math.max(0, Math.sin(t * 2.4)) * 30;
  const reactions = [
    { label: "сдаться", mood: "sad" as const, col: C.grey, light: C.greyLight },
    { label: "злиться", mood: "angry" as const, col: C.coral, light: C.coralLight },
    { label: "учиться", mood: "happy" as const, col: C.mint, light: C.mintLight },
  ];
  return (
    <g>
      {quote > 0 && (
        <g transform={`translate(${cx} 170) scale(${quote})`}>
          <Card x={0} y={0} w={760} h={120} fill="#fff">
            <Txt x={0} y={14} size={40} weight={900}>
              «жизнь – самый лучший учитель»
            </Txt>
          </Card>
        </g>
      )}
      {reactions.map((re, i) => {
        if (r[i] <= 0) return null;
        const x = cx - 360 + i * 360;
        return (
          <g key={i} transform={`translate(${x} 560) scale(${r[i]})`} opacity={1 - life}>
            <Card x={0} y={0} w={300} h={380} fill={re.light} stroke={re.col}>
              <Person kind="man" x={i === 0 ? 10 : 0} y={110} s={0.8} t={t} mood={re.mood} arm={i === 2 ? "up" : i === 1 ? "out" : "down"} />
              <Txt x={0} y={160} size={36} weight={900} color={OL}>
                {re.label}
              </Txt>
            </Card>
            {/* «рука жизни» толкает */}
            <g transform={`translate(${-190 + push} -40)`}>
              <path d="M -60 -18 L 10 -18 Q 30 -18 30 0 Q 30 18 10 18 L -60 18 Z" fill="#fff" stroke={OL} strokeWidth={4} />
            </g>
            {i === 2 && <Check x={110} y={-150} s={44} k={ramp(t, at(c, 1.9), 0.5)} />}
          </g>
        );
      })}
      {life > 0 && (
        <g opacity={life}>
          <Card x={cx} y={560} w={900} h={260} fill="#fff">
            <Txt x={0} y={-60} size={36} color={C.inkSoft}>
              «умножь этот последний месяц на пятьдесят лет»
            </Txt>
            {Array.from({ length: 50 }).map((_, i) => (
              <rect key={i} x={-400 + (i % 25) * 32} y={-10 + Math.floor(i / 25) * 40} width={24} height={30} rx={5} fill={i < life * 50 ? C.coral : C.greyLight} opacity={0.85} />
            ))}
          </Card>
        </g>
      )}
    </g>
  );
};

// ── круг «крысиных бегов» + ослик и морковка ──
export const RatRace: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const quote = pop(t, at(c, 0));
  const feel = ramp(t, at(c, 1), 0.6);
  const loop = ramp(t, at(c, 2), 0.8);
  const donkey = ramp(t, at(c, 3), 0.7);
  const speed = 0.8 + ramp(t, at(c, 2.5), 2) * 1.6;
  const stations = ["встал", "работа", "зарплата", "покупки", "счета"];
  const R = 210;
  const ccy = 560;
  const ang = t * speed;
  return (
    <g>
      {quote > 0 && (
        <g transform={`translate(${cx} 160) scale(${quote})`} opacity={1 - donkey * 0.7}>
          <Card x={0} y={0} w={1020} h={150} fill="#fff">
            <Txt x={0} y={-8} size={34} weight={900}>
              {"«Бедняки и средний класс работают за деньги.\nБогатые заставляют деньги работать на себя»"}
            </Txt>
          </Card>
        </g>
      )}
      {feel > 0 && (
        <g opacity={feel * (1 - donkey)}>
          <Pill x={cx - 420} y={360} text="страх" fill={C.coralLight} color={C.coralDeep} stroke={C.coral} size={40} />
          <Pill x={cx + 420} y={360} text="желание" fill={C.violetLight} color={C.violet} stroke={C.violet} size={40} />
        </g>
      )}
      {loop > 0 && (
        <g opacity={(1 - donkey) * loop}>
          <circle cx={cx} cy={ccy} r={R} fill="none" stroke={C.coral} strokeWidth={18} strokeDasharray="30 20" strokeDashoffset={-t * 80 * speed} />
          {stations.map((s, i) => {
            const a = (i / stations.length) * Math.PI * 2 - Math.PI / 2;
            return <Pill key={s} x={cx + Math.cos(a) * (R + 60)} y={ccy + Math.sin(a) * (R + 50)} text={s} size={28} />;
          })}
          <Coin x={cx + Math.cos(ang) * R} y={ccy + Math.sin(ang) * R} r={34} spin={t * 6} />
          <Txt x={cx} y={ccy + 12} size={38} weight={900} color={C.coralDeep}>
            {"«крысиные\nбега»"}
          </Txt>
        </g>
      )}
      {donkey > 0 && (
        <g opacity={donkey} transform={`translate(${cx} 600)`}>
          {/* ослик тянет тележку за морковкой на палке */}
          <g transform={`translate(${wob(t, 1, 6)} ${Math.abs(Math.sin(t * 4)) * -8})`}>
            <rect x={-330} y={-60} width={170} height={90} rx={12} fill="#c98b4a" stroke={OL} strokeWidth={5} />
            <circle cx={-300} cy={40} r={28} fill="#3b4566" stroke={OL} strokeWidth={4} />
            <circle cx={-190} cy={40} r={28} fill="#3b4566" stroke={OL} strokeWidth={4} />
            <line x1={-160} y1={-20} x2={-90} y2={-20} stroke={OL} strokeWidth={6} />
            <ellipse cx={-20} cy={-20} rx={90} ry={55} fill="#a9a3b5" stroke={OL} strokeWidth={5} />
            <rect x={-80} y={20} width={16} height={60} fill="#a9a3b5" stroke={OL} strokeWidth={4} />
            <rect x={30} y={20} width={16} height={60} fill="#a9a3b5" stroke={OL} strokeWidth={4} />
            <ellipse cx={90} cy={-80} rx={44} ry={36} fill="#a9a3b5" stroke={OL} strokeWidth={5} />
            <path d="M 70 -110 L 60 -170 L 86 -114 M 100 -112 L 112 -172 L 112 -110" fill="#a9a3b5" stroke={OL} strokeWidth={5} />
            <circle cx={104} cy={-86} r={6} fill={OL} />
            {/* палка с морковкой */}
            <line x1={60} y1={-120} x2={300} y2={-200} stroke="#8a5a2b" strokeWidth={8} strokeLinecap="round" />
            <line x1={300} y1={-200} x2={300} y2={-140} stroke="#8a5a2b" strokeWidth={3} />
            <g transform={`translate(300 ${-120 + Math.sin(t * 3) * 6})`}>
              <path d="M -16 -20 L 16 -20 L 0 50 Z" fill="#ff8a3d" stroke={OL} strokeWidth={4} />
              <path d="M -8 -20 L -14 -40 M 0 -20 L 0 -44 M 8 -20 L 14 -40" stroke={C.green} strokeWidth={5} strokeLinecap="round" />
            </g>
          </g>
          {["машина", "яхта", "большой дом"].map((s, i) => (
            <Pop key={s} t={t} at={at(c, 3.3) + i * 0.3} x={-260 + i * 260} y={-330}>
              <Pill x={0} y={0} text={s} fill={C.orangeLight} size={32} />
            </Pop>
          ))}
        </g>
      )}
    </g>
  );
};

// ── проверка ценой: ставки растут, мороженое тает ──
export const PriceTest: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const bids = ["25 ¢", "1 $", "2 $", "5 $"];
  const end0 = at(c, 0.95);
  const melt = ramp(t, at(c, 0.3), Math.max(1, end0 - at(c, 0.3)));
  const quote = pop(t, at(c, 1.35));
  let cur = -1;
  bids.forEach((_, i) => {
    if (t >= at(c, 0.25 + i * 0.18)) cur = i;
  });
  return (
    <g>
      <Person kind="richDad" x={cx - 360} y={840} s={0.85} t={t} mood="happy" arm="out" />
      <Person kind="kid" x={cx + 300} y={840} s={0.8} t={t} mood={cur >= 2 ? "shock" : "calm"} />
      <Person kind="kid2" x={cx + 450} y={840} s={0.8} t={t} mood={cur >= 2 ? "shock" : "calm"} />
      {/* мороженое тает */}
      <g transform={`translate(${cx + 230} 640)`}>
        <path d="M -24 0 L 24 0 L 0 70 Z" fill="#e3b26b" stroke={OL} strokeWidth={4} />
        <ellipse cx={0} cy={-6 + melt * 14} rx={32} ry={34 * (1 - melt * 0.6)} fill="#ffd1dc" stroke={OL} strokeWidth={4} />
        {melt > 0.2 && <path d={`M 10 10 q 4 ${40 * melt} -4 ${80 * melt}`} stroke="#ffd1dc" strokeWidth={10} strokeLinecap="round" fill="none" />}
      </g>
      {bids.map((b, i) => {
        if (i > cur) return null;
        const k = pop(t, at(c, 0.25 + i * 0.18));
        const active = i === cur;
        return (
          <g key={b} transform={`translate(${cx - 360 + i * 230} ${250 - i * 16}) scale(${k * (active ? 1.15 : 0.85)})`} opacity={active ? 1 : 0.5}>
            <circle r={78} fill={active ? C.gold : C.goldLight} stroke={OL} strokeWidth={5} />
            <text x={0} y={18} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill={OL}>
              {b}
            </text>
          </g>
        );
      })}
      {cur >= 0 && (
        <Txt x={cx - 20} y={410} size={30} color={C.inkSoft}>
          в час
        </Txt>
      )}
      {quote > 0 && (
        <g transform={`translate(${cx} 470) scale(${quote})`}>
          <Card x={0} y={0} w={880} h={150} fill="#fff" stroke={C.coral}>
            <Txt x={0} y={-6} size={34} weight={900}>
              {"«Большинство людей можно купить,\nесли предложить хорошую цену»"}
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── оговорка: профессии нужны; ловушка — когда решают страх и желание ──
export const BalanceNote: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const jobs = ["учитель", "врач", "повар", "пожарный", "механик", "художник"];
  const kinds = ["poorDad", "man", "worker", "kid2", "woman", "girl"] as const;
  const q = pop(t, at(c, 0.2));
  const trap = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      {q > 0 && (
        <g transform={`translate(1040 160) scale(${q})`}>
          <Card x={0} y={0} w={980} h={110} fill="#fff">
            <Txt x={0} y={14} size={36} weight={900}>
              богатый папа: «образование и работа очень важны»
            </Txt>
          </Card>
        </g>
      )}
      {jobs.map((j, i) => {
        const k = pop(t, at(c, 1) + i * 0.12);
        const x = 640 + i * 160;
        return (
          <g key={j} opacity={trap > 0.5 ? 0.45 : 1}>
            {k > 0 && <Person kind={kinds[i]} x={x} y={620} s={0.72 * k} t={t} mood="happy" color={[C.sky, C.mint, C.orange, C.coral, C.violet, C.gold][i]} />}
            {k > 0 && <Pill x={x} y={680} text={j} size={24} />}
          </g>
        );
      })}
      {trap > 0 && (
        <g opacity={trap}>
          <Card x={1040} y={800} w={900} h={120} fill={C.orangeLight} stroke={C.orange}>
            <Txt x={0} y={14} size={36} weight={900} color="#8a4b12">
              ловушка: когда решают страх и желание
            </Txt>
          </Card>
        </g>
      )}
    </g>
  );
};

// ── библиотека комиксов: доход без работы мальчиков ──
export const ComicLibrary: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const covers = ramp(t, at(c, 1), 0.8);
  const room = pop(t, at(c, 2));
  const flow = ramp(t, at(c, 3), 1);
  return (
    <g>
      {/* мусорная коробка с комиксами */}
      <g transform={`translate(${cx - 330} 460)`} opacity={1 - Math.max(room * 0.65, flow)}>
        <path d="M -120 -60 L 120 -60 L 100 100 L -100 100 Z" fill="#c9a77a" stroke={OL} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${-60 + i * 40} ${-60 - covers * (60 + i * 20)}) rotate(${-20 + i * 14})`}>
            <rect x={-36} y={-48} width={72} height={96} rx={6} fill={["#ff8f70", "#7fd1ae", "#9bb8ff", "#ffd166"][i]} stroke={OL} strokeWidth={4} />
            <path d="M -24 -30 L 24 -30 M -24 -14 L 10 -14" stroke="#fff" strokeWidth={6} />
          </g>
        ))}
        <Txt x={0} y={160} size={30} color={C.inkSoft}>
          непроданные
        </Txt>
      </g>
      {room > 0 && (
        <g transform={`translate(${cx + 170} 470) scale(${room})`}>
          <rect x={-330} y={-250} width={660} height={480} rx={20} fill="#f3ead9" stroke={OL} strokeWidth={6} />
          <rect x={-330} y={-250} width={660} height={60} rx={20} fill="#c98b4a" />
          <Txt x={0} y={-208} size={32} color="#fff">
            БИБЛИОТЕКА КОМИКСОВ
          </Txt>
          {/* полки */}
          {[0, 1].map((r) => (
            <g key={r}>
              <rect x={-300} y={-120 + r * 120} width={340} height={10} fill="#8a5a2b" />
              {Array.from({ length: 7 }).map((_, i) => (
                <rect key={i} x={-292 + i * 48} y={-190 + r * 120} width={40} height={70} rx={4} fill={["#ff8f70", "#7fd1ae", "#9bb8ff", "#ffd166", "#c79bff"][(i + r) % 5]} stroke={OL} strokeWidth={3} />
              ))}
            </g>
          ))}
          <Person kind="girl" x={190} y={200} s={0.8} t={t} mood="happy" />
          <rect x={110} y={60} width={160} height={60} rx={8} fill="#fff" stroke={OL} strokeWidth={4} />
          <Txt x={190} y={100} size={26} weight={900}>
            вход 10 ¢
          </Txt>
          {[0, 1, 2].map((i) => (
            <Person key={i} kind={i % 2 ? "kid2" : "kid"} x={-240 + i * 110} y={200} s={0.62} t={t + i} mood="happy" arm="hold" color={[C.violet, C.sky, C.orange][i]} />
          ))}
        </g>
      )}
      {flow > 0 && (
        <g>
          <Flow pts={[[cx - 160, 560], [cx - 330, 560], [cx - 330, 700]]} t={t} k={flow} color={C.mint} w={12} n={4} />
          <g transform={`translate(${cx - 380} 840)`} opacity={flow}>
            <Person kind="kid" x={-40} y={0} s={0.7} t={t} mood="happy" arm="up" />
            <Person kind="kid2" x={60} y={0} s={0.7} t={t} mood="happy" />
          </g>
          <Pill x={cx + 170} y={790} text="доход, даже когда мальчики не работают" fill={C.mintLight} color={C.mintDeep} stroke={C.mint} size={28} />
        </g>
      )}
    </g>
  );
};

// ── сквозная история: две дорожки одной монеты ──
// stage 1 — первая дорожка до нуля; 2 — резерв; 3 — навык и маленький шаг + риск; 4 — итог с оговорками
export const CoinTracks: React.FC<VisualProps<P & { stage: number }>> = (c) => {
  const { t, p } = c;
  const stage = p.stage;
  const cx = cxOf(p);
  const x0 = cx - 520;
  const yA = 330;
  const yB = 640;
  const stA = ["зарплата", "покупка", "платежи", "0"];
  const stB = ["зарплата", "резерв", "навык", "маленький шаг", "поток?"];
  const xsA = stA.map((_, i) => x0 + i * 330);
  const xsB = stB.map((_, i) => x0 + i * 260);
  const showB = stage >= 2;
  const bUpTo = stage === 2 ? 1 : stage === 3 ? 3 : 4;
  // движение монеты по дорожке A (stage 1) или B
  const runA = stage === 1 ? ramp(t, at(c, 0.15), 3.2) : 1;
  const runB = showB ? ramp(t, at(c, stage === 4 ? 0.2 : 0.1), 3) : 0;
  const posA = runA * (xsA.length - 1);
  const ia = Math.min(xsA.length - 2, Math.floor(posA));
  const coinAX = xsA[ia] + (xsA[ia + 1] - xsA[ia]) * (posA - ia);
  const posB = runB * bUpTo;
  const ib = Math.min(bUpTo - 1, Math.floor(posB));
  const coinBX = xsB[ib] + (xsB[Math.min(ib + 1, xsB.length - 1)] - xsB[ib]) * (posB - ib);
  const risk = stage >= 3 ? ramp(t, at(c, stage === 3 ? 0.7 : 0.4), 0.6) : 0;
  const notes = stage === 4 ? [pop(t, at(c, 1.4)), pop(t, at(c, 2)), pop(t, at(c, 2.5))] : [];
  return (
    <g>
      {/* дорожка A */}
      <g opacity={stage >= 2 ? 0.55 : 1}>
        <rect x={x0 - 60} y={yA - 34} width={xsA[3] - x0 + 120} height={68} rx={34} fill={C.coralLight} stroke={C.coral} strokeWidth={4} />
        {stA.map((s, i) => (
          <g key={s + i}>
            <circle cx={xsA[i]} cy={yA} r={22} fill="#fff" stroke={C.coral} strokeWidth={6} />
            <Pill x={xsA[i]} y={yA - 80} text={s} fill="#fff" color={i === 3 ? C.coralDeep : OL} stroke={C.coral} size={i === 3 ? 40 : 30} />
          </g>
        ))}
        {stage === 1 && runA > 0.66 && [0, 1, 2].map((i) => <Coin key={i} x={xsA[2] + 50 + i * 20} y={yA + 70 + i * 20 + ((t * 60) % 40)} r={14} dim />)}
        <Coin x={coinAX} y={yA} r={40} spin={t * 4} dim={posA > 2.6} face={posA < 1} />
      </g>
      {/* дорожка B */}
      {showB && (
        <g>
          <rect x={x0 - 60} y={yB - 34} width={xsB[4] - x0 + 120} height={68} rx={34} fill={C.mintLight} stroke={C.mint} strokeWidth={4} />
          {stB.map((s, i) => {
            const on = i <= bUpTo;
            return (
              <g key={s} opacity={on ? 1 : 0.3}>
                <circle cx={xsB[i]} cy={yB} r={22} fill="#fff" stroke={C.mint} strokeWidth={6} />
                <Pill x={xsB[i]} y={yB + 80} text={s} fill="#fff" color={OL} stroke={C.mint} size={28} />
              </g>
            );
          })}
          <Coin x={coinBX} y={yB} r={40} spin={t * 4} face />
          {stage >= 2 && (
            <g transform={`translate(${xsB[1]} ${yB - 90})`}>
              {[0, 1, 2].map((i) => (
                <Coin key={i} x={0} y={-i * 22} r={24} />
              ))}
            </g>
          )}
        </g>
      )}
      {risk > 0 && <RiskMeter x={xsB[3] + 30} y={yB - 140} level={stage === 3 ? 0.45 : 0.55} k={risk} s={0.9} />}
      {stage === 4 && (
        <g>
          {[
            { x: cx - 410, text: "актив ≠ доход всегда", col: C.orange },
            { x: cx, text: "дом — не только деньги", col: C.sky },
            { x: cx + 410, text: "профессия — ценность", col: C.violet },
          ].map((n, i) =>
            notes[i] > 0 ? (
              <g key={i} transform={`translate(${n.x} 860) scale(${notes[i]})`}>
                <Pill x={0} y={0} text={n.text} fill="#fff" color={OL} stroke={n.col} size={28} />
              </g>
            ) : null,
          )}
        </g>
      )}
      {stage === 1 && ramp(t, at(c, 1), 0.5) > 0 && (
        <g opacity={ramp(t, at(c, 1), 0.5)}>
          {["страх", "желание", "я сам"].map((s, i) => (
            <Pop key={s} t={t} at={at(c, 1.3) + i * 0.3} x={cx - 300 + i * 300} y={620}>
              <g>
                <Pill x={0} y={0} text={s + "?"} fill={i === 2 ? C.mintLight : "#fff"} color={OL} stroke={i === 2 ? C.mint : C.grey} size={40} />
                {i === 2 && <Check x={150} y={-20} s={36} k={ramp(t, at(c, 1.8), 0.4)} />}
              </g>
            </Pop>
          ))}
        </g>
      )}
      {stage === 2 && (
        <Txt x={cx} y={880} size={34} color={C.mintDeep} weight={900} opacity={ramp(t, at(c, 0.6), 0.5)}>
          даже небольшой резерв = свобода выбора
        </Txt>
      )}
      {stage === 3 && <Stamp x={cx + 330} y={870} text="НЕ ОБЯЗАН ЗАМЕНИТЬ ЗАРПЛАТУ" k={ramp(t, at(c, 1.1), 0.4)} color={C.skyDeep} size={26} rot={-3} />}
    </g>
  );
};
