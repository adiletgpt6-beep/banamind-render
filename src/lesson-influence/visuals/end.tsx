// Финальная часть: вымышленная история «семь фильтров в одном визите»,
// вывод по одному признаку, перегрузка, честный сигнал против поддельного,
// «последний телевизор», набор защиты и три вывода.
import React from "react";
import { interpolate } from "remotion";
import { C, DISPLAY, FC, FILTERS, FONT, type FilterId } from "../theme";
import { Badge, Card, FilterIcon, Gift, Label, OL, Person, Phone, PriceTag, QMark } from "./draw";
import { dotsOf, hash, SH, Swarm, word } from "./dots";
import { Appear, area, at, Check, clamp01, Cross, Drift, ease, ramp, Txt, wob, type VisualProps } from "./kit";

// ── История Анны в фитнес-клубе (вымышленная) ──
type PS = { host?: string; step?: number };
// когда загорается фильтр: [шаг сцены, реплика]
const EVENTS: Record<FilterId, [number, number]> = {
  recip: [0, 1],
  liking: [0, 2],
  social: [1, 0],
  authority: [1, 1],
  scarcity: [1, 2],
  commit: [2, 0],
  unity: [2, 1],
};
export const Story: React.FC<VisualProps<PS>> = (ctx) => {
  const { t, dur, p } = ctx;
  const step = p.step ?? 0;
  const a = area(p.host);
  const cx = a.cx;
  const litK = (id: FilterId) => {
    const [s, b] = EVENTS[id];
    if (s < step) return 1;
    if (s > step) return 0;
    return ramp(t, at(ctx, b + 0.15), 0.5);
  };
  const pause = step === 3 ? ramp(t, at(ctx, 0) - 0.2, 0.6) : 0;
  const qs = step === 3 ? ramp(t, at(ctx, 2), 0.6) : 0;
  const choice = step === 3 ? ramp(t, at(ctx, 3), 0.6) : 0;
  const enter = step === 0 ? interpolate(t, [at(ctx, 0), at(ctx, 0) + 2.5], [a.x0 + 80, cx - 260], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }) : cx - 260;
  // плёнка из семи кадров вверху
  const strip = (
    <g>
      <rect x={cx - 560} y={150} width={1120} height={150} rx={18} fill="#22263a" stroke={OL} strokeWidth={4} />
      {Array.from({ length: 16 }).map((_, i) => (
        <g key={i}>
          <rect x={cx - 548 + i * 70} y={158} width={30} height={14} rx={3} fill="#fff" opacity={0.6} />
          <rect x={cx - 548 + i * 70} y={278} width={30} height={14} rx={3} fill="#fff" opacity={0.6} />
        </g>
      ))}
      {FILTERS.map((f, i) => {
        const k = litK(f.id);
        const x = cx - 480 + i * 160;
        return (
          <g key={f.id}>
            <rect x={x - 66} y={182} width={132} height={86} rx={10} fill={k > 0 ? f.color : "#3a3f5a"} fillOpacity={0.25 + 0.75 * k} stroke={k > 0.5 ? "#fff" : "#5a5f80"} strokeWidth={3} />
            <g opacity={0.35 + 0.65 * k}>
              <FilterIcon id={f.id} x={x} y={225} s={0.55} color="#fff" t={t} />
            </g>
            {k > 0 && k < 1 && <rect x={x - 66} y={182} width={132} height={86} rx={10} fill="none" stroke={C.yellow} strokeWidth={8} opacity={1 - k} />}
          </g>
        );
      })}
    </g>
  );
  const room = (
    <g>
      {/* стена клуба и пол */}
      <rect x={a.x0 + 20} y={330} width={a.x1 - a.x0 - 40} height={600} rx={30} fill="#eef2ff" fillOpacity={0.9} stroke="#fff" strokeWidth={5} />
      <rect x={a.x0 + 20} y={860} width={a.x1 - a.x0 - 40} height={70} rx={20} fill="#c9b08a" />
      {/* гантели и коврик — фон клуба */}
      <g transform={`translate(${cx + 470} 830)`}>
        <rect x={-60} y={-10} width={120} height={14} rx={6} fill="#5a5f80" />
        <rect x={-74} y={-30} width={22} height={54} rx={6} fill={OL} />
        <rect x={52} y={-30} width={22} height={54} rx={6} fill={OL} />
      </g>
      {/* социальное доказательство: экран с точками-людьми */}
      {litK("social") > 0 && (
        <g opacity={litK("social")} transform={`translate(${cx - 20} 470)`}>
          <rect x={-200} y={-110} width={400} height={220} rx={16} fill="#22263a" stroke={OL} strokeWidth={4} />
          <Swarm pts={dotsOf("story-crowd", SH.rect(340, 120), 0, -10, [FC.social.color, FC.social.light, "#fff"], 17, 200)} k={step === 1 ? clamp01((t - at(ctx, 0)) / 1.5) : 1} t={t} r={6} from="center" />
          <text x={0} y={92} fontFamily={FONT} fontWeight={900} fontSize={24} fill="#fff" textAnchor="middle">
            к нам присоединились сотни!
          </text>
        </g>
      )}
      {/* авторитет: дипломы и медаль */}
      {litK("authority") > 0 && (
        <g opacity={litK("authority")}>
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${cx + 300 + i * 130} ${420 + i * 20})`}>
              <rect x={-52} y={-64} width={104} height={128} rx={6} fill="#fff8e6" stroke="#c9a46a" strokeWidth={8} />
              <rect x={-30} y={-30} width={60} height={8} fill="#d6dbe8" />
              <rect x={-30} y={-10} width={60} height={8} fill="#d6dbe8" />
            </g>
          ))}
          <Badge x={cx + 370} y={600} s={0.5} />
        </g>
      )}
      {/* тренер и Анна */}
      <Person who="officer" x={cx + 200} y={900} s={0.7} mood="happy" pose={step === 0 ? "give" : step === 2 ? "point" : "wave"} t={t} flip color={FC.liking.color} item={step === 0 && litK("recip") > 0 ? <Gift x={0} y={-6} s={0.45} /> : undefined} />
      <Person who="anna" x={enter} y={900} s={0.7} mood={pause > 0.5 ? "think" : "smile"} pose={step === 0 && enter < cx - 270 ? "walk" : pause > 0.5 ? "think" : "stand"} t={t} />
      {/* сигналы-подписи */}
      {litK("recip") > 0 && step === 0 && <Label x={cx + 40} y={390} text="бесплатная пробная" size={28} bg={FC.recip.light} border={FC.recip.deep} opacity={litK("recip")} />}
      {litK("liking") > 0 && step === 0 && (
        <g opacity={litK("liking")}>
          <Label x={cx + 260} y={470} text="«я тоже оттуда!»" size={28} bg={FC.liking.light} border={FC.liking.deep} />
          {[0, 1, 2].map((i) => (
            <path key={i} d="M 0 12 C -26 -6 -14 -28 0 -12 C 14 -28 26 -6 0 12 Z" transform={`translate(${cx + i * 50 - 20} ${560 - ((t * 30 + i * 20) % 60)})`} fill={FC.liking.color} stroke={OL} strokeWidth={2} />
          ))}
        </g>
      )}
      {litK("scarcity") > 0 && step === 1 && (
        <g opacity={litK("scarcity")} transform={`translate(${cx - 360} 470) rotate(-4)`}>
          <PriceTag x={0} y={0} text="−30 %" s={1} color={FC.scarcity.color} />
          <Label x={0} y={80} text="только до вечера" size={28} bg={FC.scarcity.light} border={FC.scarcity.deep} />
        </g>
      )}
      {litK("commit") > 0 && step === 2 && (
        <g opacity={litK("commit")}>
          <Label x={cx - 330} y={410} text="«вы же сами сказали…»" size={30} bg={FC.commit.light} border={FC.commit.deep} />
          <path d={`M ${cx - 260} 560 C ${cx - 200} 640 ${cx - 40} 480 ${cx + 150} 600`} stroke={FC.commit.color} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - litK("commit"))} />
        </g>
      )}
      {litK("unity") > 0 && step === 2 && (
        <g opacity={litK("unity")}>
          <circle cx={cx - 300} cy={640} r={150} fill={FC.unity.color} fillOpacity={0.15} stroke={FC.unity.color} strokeWidth={6} />
          <circle cx={cx + 160} cy={640} r={200} fill={FC.unity.color} fillOpacity={0.15} stroke={FC.unity.color} strokeWidth={6} />
          <Label x={cx + 300} y={390} text="«мы — одна семья»" size={30} bg={FC.unity.light} border={FC.unity.deep} />
        </g>
      )}
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.02}>
      {strip}
      <g>{room}</g>
      {pause > 0 && (
        <g opacity={pause}>
          <rect x={a.x0 + 20} y={330} width={a.x1 - a.x0 - 40} height={600} rx={30} fill="#1d2340" opacity={0.45} />
          <g transform={`translate(${a.x1 - 120} 400)`}>
            <rect x={-40} y={-50} width={26} height={100} rx={6} fill="#fff" />
            <rect x={14} y={-50} width={26} height={100} rx={6} fill="#fff" />
          </g>
          {qs > 0 && (
            <g opacity={qs}>
              <Card x={cx - 250} y={560} w={440} h={120} lines={["Что я знаю?"]} size={44} fill="#fff" edge={C.inkSoft} />
              <Card x={cx + 250} y={560} w={440} h={120} lines={["Что я хочу?"]} size={44} fill={C.yellow} edge={C.gold} />
            </g>
          )}
          {choice > 0 && (
            <g opacity={choice}>
              <Label x={cx} y={760} text="решение — её, а не кнопки" size={34} bg="#fff" />
            </g>
          )}
        </g>
      )}
    </Drift>
  );
};

// ── Вывод по одному признаку: волосы → «девушка»? нога → «стол»? ──
export const Zappa: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const k2 = ramp(t, at(ctx, 1), 0.6);
  const k3 = ramp(t, at(ctx, 2), 0.6);
  const eq = (y: number, left: React.ReactNode, right: string, k: number, bad: boolean) => (
    <g opacity={k} transform={`translate(${cx} ${y + (1 - k) * 30})`}>
      <circle cx={-300} cy={0} r={90} fill="#fff" stroke={OL} strokeWidth={5} />
      <g transform="translate(-300 0)">{left}</g>
      <text x={-100} y={22} fontFamily={DISPLAY} fontWeight={800} fontSize={70} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={8} paintOrder="stroke">
        →
      </text>
      <Card x={200} y={0} w={380} h={120} lines={[right]} size={48} fill={bad ? "#ffe1dc" : C.yellow} />
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {eq(290, <path d="M -40 -50 Q -70 20 -50 70 M 40 -50 Q 70 20 50 70 M -40 -50 Q 0 -80 40 -50" stroke="#7a5a3a" strokeWidth={14} fill="none" strokeLinecap="round" />, "девушка?", ramp(t, at(ctx, 0.4)), true)}
      {eq(540, <g><rect x={-60} y={-20} width={120} height={20} rx={6} fill="#a8724c" stroke={OL} strokeWidth={4} /><rect x={-50} y={0} width={14} height={60} fill="#8a5a3c" /><rect x={36} y={0} width={14} height={60} fill="#8a5a3c" /></g>, "стол?", k2, true)}
      {k3 > 0 && (
        <g opacity={k3} transform={`translate(${cx} 800)`}>
          <Card x={0} y={0} w={760} h={110} lines={["один признак — ещё не вывод"]} size={42} fill="#fff" edge={C.yellow} />
        </g>
      )}
    </Drift>
  );
};

// ── Перегрузка: поток уведомлений, «индюшка» внутри, шесть условий автопилота ──
const CONDS = ["спешим", "напряжены", "не уверены", "безразличны", "рассеянны", "устали"];
export const Overload: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const flood = ramp(t, at(ctx, 0.3), 1.5);
  const conds = at(ctx, ctx.beats.length >= 4 ? 2 : 1);
  const phoneK = ramp(t, at(ctx, ctx.beats.length >= 4 ? 3 : 2), 0.6);
  const info = ramp(t, at(ctx, 1), 0.6);
  const n = 22;
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {/* поток карточек-уведомлений */}
      {Array.from({ length: n }).map((_, i) => {
        const k = clamp01(flood * n - i);
        if (k <= 0) return null;
        const ph = ((t * 0.12 + hash(i, 1)) % 1);
        const x = a.x0 + 60 + hash(i, 2) * (a.x1 - a.x0 - 120);
        const y = 160 + ph * 760;
        const c = FILTERS[i % 7].color;
        return (
          <g key={i} opacity={k * 0.85 * (1 - info * 0.5)} transform={`translate(${x} ${y}) rotate(${(hash(i, 3) - 0.5) * 16})`}>
            <rect x={-80} y={-26} width={160} height={52} rx={14} fill="#fff" stroke={OL} strokeWidth={3} />
            <circle cx={-56} cy={0} r={12} fill={c} />
            <rect x={-36} y={-10} width={96} height={8} rx={4} fill="#c9cfe0" />
            <rect x={-36} y={4} width={64} height={8} rx={4} fill="#c9cfe0" />
          </g>
        );
      })}
      {info > 0 && (
        <g opacity={info * (1 - ramp(t, conds, 0.5))} transform={`translate(${cx} 540)`}>
          <Card x={-260} y={0} w={460} h={130} lines={["информация"]} size={48} fill="#fff" />
          <Card x={260} y={0} w={460} h={130} lines={["знание?"]} size={48} fill={C.yellow} />
          <text x={0} y={18} fontFamily={DISPLAY} fontWeight={800} fontSize={60} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={8} paintOrder="stroke">
            ≠
          </text>
        </g>
      )}
      {CONDS.map((c, i) => {
        const k = ramp(t, conds + i * 0.35, 0.4);
        if (k <= 0) return null;
        const x = cx - 420 + (i % 3) * 420;
        const y = 420 + Math.floor(i / 3) * 190;
        return (
          <g key={c} opacity={k * (1 - phoneK * 0.5)} transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * k})`}>
            <rect x={-180} y={-60} width={360} height={120} rx={30} fill={FILTERS[i].light} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={16} size={46}>
              {c}
            </Txt>
          </g>
        );
      })}
      {phoneK > 0 && (
        <g opacity={phoneK}>
          <Phone x={cx} y={560} s={0.9 + 0.1 * phoneK} rot={wob(t, 2, 2)}>
            {[0, 1, 2, 3].map((i) => (
              <g key={i} transform={`translate(0 ${-140 + i * 80})`}>
                <rect x={-86} y={-28} width={172} height={56} rx={12} fill={FILTERS[(i * 2) % 7].light} />
                <circle cx={-60} cy={0} r={12} fill={FILTERS[(i * 2) % 7].color} />
              </g>
            ))}
          </Phone>
        </g>
      )}
    </Drift>
  );
};

// ── Честный сигнал и подделка: «самая популярная паста» ✓, актёры / набитая банка / нанятая очередь ✗ ──
export const HonestFake: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const fake = ramp(t, at(ctx, 1), 0.6);
  const punish = ramp(t, at(ctx, 2), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Appear t={t} at={at(ctx, 0.2)} x={cx - 380} y={480}>
        <rect x={-230} y={-260} width={460} height={520} rx={36} fill={FC.recip.light} stroke={OL} strokeWidth={5} />
        <g transform="translate(0 -60) rotate(-20)">
          <rect x={-130} y={-34} width={240} height={68} rx={20} fill="#fff" stroke={OL} strokeWidth={4} />
          <rect x={-130} y={-34} width={90} height={68} rx={20} fill={FC.social.color} stroke={OL} strokeWidth={4} />
          <rect x={110} y={-20} width={36} height={40} rx={6} fill="#c9d3e6" stroke={OL} strokeWidth={3} />
        </g>
        <Txt x={0} y={110} size={38}>
          правда популярна
        </Txt>
        <Check x={0} y={190} s={50} k={ramp(t, at(ctx, 0.6))} />
      </Appear>
      {fake > 0 && (
        <g opacity={fake} transform={`translate(${cx + 260} 480)`}>
          <rect x={-330} y={-260} width={660} height={520} rx={36} fill="#ffe6e0" stroke={OL} strokeWidth={5} />
          {/* актёр «покупатель» с табличкой */}
          <Person who="guest" x={-200} y={140} s={0.45} mood="happy" pose="hold" t={t} item={<rect x={-40} y={-30} width={80} height={50} rx={6} fill="#fff" stroke={OL} strokeWidth={3} />} />
          <Label x={-200} y={-200} text="актёр" size={26} bg="#fff" />
          {/* банка с «засеянными» купюрами */}
          <g transform="translate(20 60)">
            <rect x={-60} y={-100} width={120} height={140} rx={24} fill="#e8f4ff" fillOpacity={0.6} stroke={OL} strokeWidth={4} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={-44 + (i % 2) * 40} y={-20 - Math.floor(i / 2) * 34} width={44} height={24} rx={4} fill="#9fd89a" stroke={OL} strokeWidth={2} transform={`rotate(${(hash(i) - 0.5) * 40})`} />
            ))}
            <Label x={0} y={-150} text="набита заранее" size={24} bg="#fff" />
          </g>
          {/* нанятая очередь */}
          <g transform="translate(220 110)">
            {[0, 1, 2, 3].map((i) => (
              <g key={i} transform={`translate(${i * 26 - 40} ${-i * 8})`}>
                <circle cy={-90} r={18} fill="#c9a7ff" stroke={OL} strokeWidth={3} />
                <rect x={-18} y={-72} width={36} height={60} rx={12} fill="#c9a7ff" stroke={OL} strokeWidth={3} />
              </g>
            ))}
            <Label x={0} y={-180} text="нанятая очередь" size={24} bg="#fff" />
          </g>
          <Cross x={260} y={-200} s={70} k={ramp(t, at(ctx, 1.5))} />
        </g>
      )}
      {punish > 0 && (
        <g opacity={punish} transform={`translate(${cx} 830)`}>
          <Card x={0} y={0} w={840} h={100} lines={["не покупать — и рассказать другим"]} size={40} fill={C.yellow} />
        </g>
      )}
    </Drift>
  );
};

// ── «Последний» телевизор: покупка, утренняя проверка витрины, благодарный отзыв ──
export const LastTv: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const morning = ramp(t, at(ctx, 1), 0.6);
  const ok = ramp(t, at(ctx, 1.5), 0.6);
  const rule = ramp(t, at(ctx, 2), 0.6);
  const tv = (x: number, y: number, s: number, last: boolean) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-200} y={-130} width={400} height={240} rx={16} fill="#22263a" stroke={OL} strokeWidth={5} />
      <rect x={-184} y={-114} width={368} height={208} rx={8} fill="#5fa8e8" />
      <path d="M -184 60 L -100 0 L -20 50 L 80 -30 L 184 40 L 184 94 L -184 94 Z" fill="#7be0a4" />
      <rect x={-30} y={110} width={60} height={30} fill="#3a3f5a" />
      {last && <Label x={0} y={-180} text="последний!" size={30} bg={FC.scarcity.light} border={FC.scarcity.deep} />}
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <g opacity={1 - morning}>
        {tv(cx - 120, 520, 1.1, true)}
        <Person who="seller" x={cx + 300} y={940} s={0.7} mood="smile" pose="point" t={t} flip />
        <Appear t={t} at={at(ctx, 0.6)} x={cx - 470} y={300}>
          <Txt x={0} y={0} size={48} color="#fff">
            20 минут — и куплен
          </Txt>
        </Appear>
      </g>
      {morning > 0 && (
        <g opacity={morning}>
          {/* утро: витрина, на месте телевизора пусто */}
          <rect x={cx - 520} y={300} width={760} height={420} rx={24} fill="#eef2ff" stroke={OL} strokeWidth={5} />
          <rect x={cx - 300} y={430} width={320} height={190} rx={12} fill="none" stroke={OL} strokeWidth={4} strokeDasharray="16 12" />
          <Txt x={cx - 140} y={540} size={36} color={C.inkSoft}>
            такого нет
          </Txt>
          <circle cx={cx + 380} cy={260} r={60} fill="#ffd57a" />
          <Person who="boss" x={cx + 380} y={940} s={0.7} mood={ok > 0.5 ? "happy" : "think"} pose={ok > 0.5 ? "hold" : "think"} t={t} flip item={ok > 0.5 ? <rect x={-30} y={-40} width={60} height={80} rx={6} fill="#fff" stroke={OL} strokeWidth={3} /> : undefined} />
          {ok > 0 && (
            <g opacity={ok}>
              <Check x={cx - 140} y={380} s={50} k={ok} />
              <Label x={cx + 380} y={420} text="благодарный отзыв" size={30} bg={C.yellow} />
            </g>
          )}
        </g>
      )}
      {rule > 0 && (
        <g opacity={rule} transform={`translate(${cx} 810)`}>
          <Card x={-250} y={0} w={460} h={100} lines={["честно → поощрить"]} size={38} fill={FC.commit.light} edge={FC.commit.color} />
          <Card x={250} y={0} w={460} h={100} lines={["обман → не поощрять"]} size={38} fill="#ffe1dc" edge={C.red} />
        </g>
      )}
    </Drift>
  );
};

// ── Набор защиты: пауза → назвать фильтр → вопросы → «мне нужно подумать» ──
export const Toolkit: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const steps = [
    { title: "1. Пауза", body: ["спешу? устал(а)?"], c: FC.social },
    { title: "2. Назвать фильтр", body: ["подарок · толпа ·", "срок · «свои»"], c: FC.recip },
    { title: "3. Вопросы", body: ["эксперт ли? нравится", "сильнее, чем стоит?", "зачем мне это?"], c: FC.authority },
  ];
  const last = ramp(t, at(ctx, 3), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {steps.map((s, i) => {
        const k = ramp(t, at(ctx, i) - 0.1, 0.6);
        if (k <= 0) return null;
        const x = cx - 470 + i * 470;
        return (
          <g key={i} opacity={k} transform={`translate(${x} ${470 + (1 - k) * 40})`}>
            <rect x={-210} y={-230} width={420} height={460} rx={34} fill="#fff" stroke={OL} strokeWidth={5} />
            <rect x={-210} y={-230} width={420} height={90} rx={34} fill={s.c.color} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-170} size={38} color="#fff">
              {s.title}
            </Txt>
            {i === 0 && (
              <g transform="translate(0 -10)">
                <rect x={-50} y={-60} width={34} height={120} rx={8} fill={s.c.color} />
                <rect x={16} y={-60} width={34} height={120} rx={8} fill={s.c.color} />
              </g>
            )}
            {i === 1 && (
              <g transform="translate(0 -40)">
                {FILTERS.map((f, j) => (
                  <circle key={f.id} cx={-150 + j * 50} cy={0} r={20} fill={f.color} stroke={OL} strokeWidth={2.5} />
                ))}
              </g>
            )}
            {i === 2 && <QMark x={0} y={-60} s={0.7} color={s.c.light} />}
            {s.body.map((b, j) => (
              <text key={j} x={0} y={(i === 2 ? 60 : 110) + j * 44} fontFamily={FONT} fontWeight={800} fontSize={32} fill={C.ink} textAnchor="middle">
                {b}
              </text>
            ))}
          </g>
        );
      })}
      {last > 0 && (
        <g opacity={last} transform={`translate(${cx} ${820 + (1 - last) * 30})`}>
          <Card x={0} y={0} w={640} h={110} lines={["«Мне нужно подумать»"]} size={48} fill={C.yellow} />
        </g>
      )}
    </Drift>
  );
};

// ── Три вывода: карточки и точки, собирающиеся в «≠», «НЕТ», «✓» ──
export const Conclusions: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const items = [
    { title: "чувство ≠ факт", shape: SH.strokes([[-60, -30, 60, -30], [-60, 30, 60, 30], [40, -80, -40, 80]], 26), colors: [FC.recip.color, FC.social.color, FC.liking.color] },
    { title: "«нет» — нормально", shape: word("НЕТ", 90, 24), colors: [FC.scarcity.color, FC.authority.color, "#fff"] },
    { title: "влиять честно", shape: word("✓", 140, 30), colors: [FC.commit.color, FC.unity.color, "#fff"] },
  ];
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {items.map((it, i) => {
        const k = ramp(t, at(ctx, i) - 0.1, 0.6);
        if (k <= 0) return null;
        const step = Math.min(470, (a.x1 - a.x0) / 3);
        const x = cx - step + i * step;
        const pts = dotsOf(`concl-${i}`, it.shape, x, 450, it.colors, 12, 200);
        return (
          <g key={i} opacity={k}>
            <rect x={x - step / 2 + 14} y={260} width={step - 28} height={420} rx={40} fill="#ffffff" fillOpacity={0.12} stroke="#fff" strokeWidth={4} />
            <Swarm pts={pts} k={clamp01((t - at(ctx, i)) / 1.4)} t={t} r={6} from="scatter" spread={300} seed={i} />
            <Txt x={x} y={760} size={40} color="#fff">
              {it.title}
            </Txt>
          </g>
        );
      })}
    </Drift>
  );
};

