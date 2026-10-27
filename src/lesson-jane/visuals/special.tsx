// Особые сцены BM-032: холодный старт (четыре двери с условиями), вопрос
// фильма, карта пути, «счёт» выбора, два портрета, драгоценности, сердце
// романа, наследство на четверых, зов через расстояние, финал.
import React from "react";
import { C, FONT, HEAVY, SERIF } from "../theme";
import { BookObj, Label, OL, Person } from "./draw";
import { Appear, area, Arrow, at, clamp01, Drift, ease, Panel, pop, ramp, Txt, wob, type VisualProps } from "./kit";
import { Particles } from "./particles";
import { Bubble, Door, PriceTag, QuoteBox } from "./scenery";
import { SETS } from "./sets";
import { DotPath, JourneyMap, Sparks, STOPS, VoiceFlame } from "./voice";

type P = { mode?: string; host?: string; [k: string]: unknown };

const BgSet: React.FC<{ name: string; t: number }> = ({ name, t }) => {
  const S = SETS[name];
  return <S t={t} p={{}} />;
};

// j01 — девочка-силуэт из точек с огоньком голоса; вокруг закрываются четыре двери.
export const VoiceHook: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const doors = [
    { x: 180, label: "ДОМ", cond: "молчи", col: C.red, a: 0.3 },
    { x: 420, label: "ШКОЛА", cond: "терпи", col: C.slate, a: 1.2 },
    { x: 900, label: "ЛЮБОВЬ", cond: "уступи", col: C.amber, a: b1 + 0.3 },
    { x: 1140, label: "ДОЛГ", cond: "служи", col: C.ice, a: b1 + 1.6 },
  ];
  return (
    <Drift t={t} dur={dur} cx={660} amount={0.05}>
      {doors.map((d, i) => {
        const k = ramp(t, d.a, 0.6);
        if (k <= 0) return null;
        return (
          <g key={d.label} opacity={k} transform={`translate(0 ${(1 - k) * 40})`}>
            <Door x={d.x} y={900} s={0.95} open={1 - ramp(t, d.a + 0.6, 0.8) * 0.85} color={d.col} label={d.label} />
            <g transform={`translate(${d.x} 400) rotate(${i % 2 ? 6 : -6})`}>
              <rect x={-90} y={-30} width={180} height={60} rx={30} fill={C.white} stroke={OL} strokeWidth={4} />
              <text y={12} fontFamily={FONT} fontWeight={900} fontSize={34} fill={d.col} textAnchor="middle">
                {d.cond}
              </text>
            </g>
          </g>
        );
      })}
      <Particles shape="girl" t={t} at={0.1} dur={2} x={660} y={640} s={0.62} r={6} step={14} spread={700} />
      <VoiceFlame x={660} y={560} t={t} s={0.55} size={0.5 + 0.8 * ramp(t, b2 + 1.2, 0.8)} />
      <Sparks x={660} y={560} t={t} at={b2 + 1.6} n={30} spread={360} />
      <Appear t={t} at={b2 + 2.2} x={660} y={150}>
        <rect x={-300} y={-46} width={600} height={92} rx={46} fill={C.yellow} stroke={OL} strokeWidth={5} />
        <text y={18} fontFamily={HEAVY} fontWeight={900} fontSize={50} fill={C.ink} textAnchor="middle">
          ЦЕНА ГОЛОСА?
        </text>
      </Appear>
    </Drift>
  );
};

// j02 — собственная «обложка» книги (не издательская) и вопрос фильма.
export const BigQuestion: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const b1 = at(ctx, 1);
  return (
    <Drift t={t} dur={dur} cx={1250}>
      <Appear t={t} at={0.15} x={900} y={500}>
        <g transform={`rotate(${wob(t, 1, 2)})`}>
          <BookObj x={0} y={0} s={1.5} label={"Джейн\nЭйр"} color="#7a3a52" />
        </g>
        <Txt x={0} y={260} size={38} color={C.inkSoft}>
          Шарлотта Бронте · 1847
        </Txt>
      </Appear>
      <Appear t={t} at={b1} x={1450} y={300}>
        <Panel x={-330} y={-120} w={660} h={420} fill={C.white} />
        <Txt x={0} y={-30} size={46} weight={900}>{"Сколько стоит"}</Txt>
        <Txt x={0} y={32} size={46} weight={900} color={C.goldDeep}>{"собственный голос"}</Txt>
        <Txt x={0} y={94} size={46} weight={900}>{"и кто платит"}</Txt>
        <Txt x={0} y={156} size={46} weight={900}>{"эту цену?"}</Txt>
        <g transform={`translate(0 ${236})`}>
          <VoiceFlame x={0} y={0} t={t} s={0.42 * pop(t, b1 + 1.2)} />
        </g>
      </Appear>
    </Drift>
  );
};

// Карта пути: stop −1 — весь маршрут пунктиром, точки бегут от начала до конца.
export const Journey: React.FC<VisualProps<P & { stop?: number; cond?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const stop = p.stop ?? 0;
  if (stop < 0) {
    const k = ease(clamp01((t - 0.4) / Math.max(2, at(ctx, 1) - 0.4)));
    return (
      <Drift t={t} dur={dur} amount={0.03}>
        <JourneyMap t={t} stop={0} at={-10} />
        <DotPath pts={STOPS.map((s) => [s.x, s.y] as [number, number])} k={k} n={90} r={10} t={t} />
        {STOPS.map((s, i) => (
          <Appear key={s.id} t={t} at={0.4 + i * 0.35} x={s.x} y={s.y}>
            <circle r={36} fill={s.color} stroke={OL} strokeWidth={5} />
          </Appear>
        ))}
      </Drift>
    );
  }
  return (
    <Drift t={t} dur={dur} cx={STOPS[stop].x} cy={STOPS[stop].y} amount={0.07}>
      <JourneyMap t={t} stop={stop} at={0.3} cond={p.cond} />
    </Drift>
  );
};

// «Счёт»: две колонки (что можно отдать / что нельзя), монеты жалованья.
type Col = { title: string; items: string[]; color: string };
export const Ledger: React.FC<VisualProps<P & { left: Col; right: Col; money?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cols = [p.left, p.right];
  const w = (A.x1 - A.x0 - 80) / 2;
  return (
    <Drift t={t} dur={dur} cx={A.cx}>
      {cols.map((c, ci) => {
        const x = A.x0 + 20 + ci * (w + 40);
        return (
          <Appear key={ci} t={t} at={ci === 0 ? 0.2 : at(ctx, 1)} x={x} y={200}>
            <Panel x={0} y={0} w={w} h={620} fill={C.white} />
            <rect x={0} y={0} width={w} height={100} rx={36} fill={c.color} stroke={OL} strokeWidth={4} />
            <text x={w / 2} y={66} fontFamily={HEAVY} fontWeight={900} fontSize={46} fill={C.ink} textAnchor="middle">
              {c.title}
            </text>
            {c.items.map((it, i) => {
              const a = (ci === 0 ? 0.6 : at(ctx, 1) + 0.4) + i * 0.5;
              const k = ramp(t, a, 0.4);
              return (
                <g key={it} opacity={k} transform={`translate(${(1 - k) * 30} 0)`}>
                  <circle cx={56} cy={170 + i * 110} r={16} fill={c.color} stroke={OL} strokeWidth={3} />
                  <text x={96} y={184 + i * 110} fontFamily={FONT} fontWeight={800} fontSize={44} fill={C.ink}>
                    {it}
                  </text>
                </g>
              );
            })}
          </Appear>
        );
      })}
      {p.money && <PriceTag x={A.x0 + 20 + w / 2} y={115} title="ЖАЛОВАНЬЕ" text={p.money} k={ramp(t, 0.6, 0.5)} color={C.sageSoft} s={0.85} />}
      {cols[1].items.length === 1 && (
        <VoiceFlame x={A.x0 + 60 + w * 1.5} y={600} t={t} s={0.9 * ramp(t, at(ctx, 1) + 0.8, 0.6)} />
      )}
      <Appear t={t} at={at(ctx, ctx.beats.length - 1) + 0.5} x={A.x0 + 60 + w * 1.5} y={115}>
        <Label x={0} y={0} text="цена голоса" bg={C.yellow} size={40} rot={-3} />
      </Appear>
    </Drift>
  );
};

// j31 — два портрета: «гувернантка» (точки, честно) и воображаемая красавица.
export const Portraits: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  return (
    <Drift t={t} dur={dur} cx={1100}>
      <BgSet name="library" t={t} />
      <rect x={0} y={0} width={1920} height={1080} fill="#fff8ec" opacity={0.55} />
      <Appear t={t} at={0.2} x={620} y={500}>
        <Person who="jane" x={0} y={400} s={0.9} mood="closed" pose="hold" t={t} />
      </Appear>
      {[
        { x: 1000, shape: "woman", label: "Портрет гувернантки", sub: "безродной, бедной, некрасивой", at: b1, col: C.inkSoft, frame: "#8a8a9a" },
        { x: 1500, shape: "woman2", label: "Бланш Ингрэм", sub: "воображаемый портрет", at: b1 + 1.6, col: C.goldDeep, frame: C.gold },
      ].map((f, i) => (
        <g key={i}>
          <Appear t={t} at={f.at} x={f.x} y={470}>
            <rect x={-220} y={-290} width={440} height={560} rx={16} fill={C.cream} stroke={OL} strokeWidth={6} />
            <rect x={-200} y={-270} width={400} height={520} rx={10} fill="none" stroke={f.frame} strokeWidth={6} />
          </Appear>
          <Particles shape={f.shape} t={t} at={f.at + 0.2} dur={2} x={f.x} y={450} s={0.6} r={5} step={12} mono={i === 0 ? "#6a7286" : undefined} spread={600} />
          <Appear t={t} at={f.at + 1.4} x={f.x} y={830}>
            <Label x={0} y={0} text={f.label} bg={i === 0 ? C.white : C.yellow} size={30} />
            <Txt x={0} y={64} size={28} color={f.col}>
              {f.sub}
            </Txt>
          </Appear>
        </g>
      ))}
      <Appear t={t} at={b2 + 0.5} x={1250} y={140}>
        <Label x={0} y={0} text="лестница сословий — внутри" bg={C.roseSoft} size={32} rot={-2} />
      </Appear>
    </Drift>
  );
};

// j39 — драгоценности и шелка летят к Джейн; она отводит их рукой; огонёк растёт.
export const Jewels: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const items = Array.from({ length: 14 });
  return (
    <Drift t={t} dur={dur} cx={1000}>
      <BgSet name="library" t={t} />
      <Person who="rochester" x={1450} y={900} mood="smile" pose="reach" t={t} flip />
      <Person who="jane" x={760} y={900} mood={t > b1 ? "proud" : "tense"} pose={t > 0.8 ? "point" : "stand"} t={t} />
      {items.map((_, i) => {
        const a = 0.3 + i * 0.12;
        const k = ease(clamp01((t - a) / 1.2));
        const back = ramp(t, b1 + 0.3, 1);
        const x = 1360 - (1360 - 900) * k + back * (300 + (i % 4) * 60);
        const y = 420 + Math.sin(i * 1.7) * 140 - Math.sin(k * Math.PI) * 80 + back * (i % 3) * 30;
        const op = k * (1 - back * 0.7);
        if (op <= 0.02) return null;
        return i % 3 === 0 ? (
          <path key={i} d={`M ${x} ${y - 22} L ${x + 18} ${y} L ${x} ${y + 22} L ${x - 18} ${y} Z`} fill={C.sky} stroke={OL} strokeWidth={3} opacity={op} />
        ) : i % 3 === 1 ? (
          <circle key={i} cx={x} cy={y} r={14} fill={C.gold} stroke={OL} strokeWidth={3} opacity={op} />
        ) : (
          <path key={i} d={`M ${x - 40} ${y} q 20 -30 40 0 q 20 30 40 0`} stroke={C.rose} strokeWidth={10} fill="none" opacity={op} strokeLinecap="round" />
        );
      })}
      <VoiceFlame x={760} y={330} t={t} s={0.6} size={0.5 + 0.7 * ramp(t, b1, 0.8)} />
      <Appear t={t} at={b1 + 0.2} x={760} y={160}>
        <Bubble x={0} y={0} text="я буду сама собой" size={40} />
      </Appear>
      <Appear t={t} at={b2 + 0.4} x={1200} y={170}>
        <Label x={0} y={0} text="«ощущение уступчивости»" bg={C.roseSoft} size={30} rot={3} />
      </Appear>
      <Appear t={t} at={b2 + 2} x={520} y={440}>
        <Label x={0} y={0} text="не Даная" bg={C.yellow} size={36} rot={-4} />
      </Appear>
    </Drift>
  );
};

// j47 — сердце романа: огонёк растёт, главные фразы одна под другой (ведущий слева).
export const Core: React.FC<VisualProps<P>> = (ctx) => {
  const { t } = ctx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const b3 = at(ctx, 3);
  const b3b = b3 + (ctx.ends[3] - b3) * 0.55;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#fff4dc" opacity={0.6} />
      {Array.from({ length: 28 }).map((_, i) => {
        const a = (i / 28) * Math.PI * 2 + t * 0.05;
        return <circle key={i} cx={1250 + Math.cos(a) * 640} cy={500 + Math.sin(a) * 420} r={8} fill={C.gold} opacity={0.3 * ramp(t, 0.3, 1)} />;
      })}
      <VoiceFlame x={1250} y={150} t={t} s={0.6} size={0.6 + 0.8 * ramp(t, b1, 1.2)} />
      <Appear t={t} at={b1} x={0} y={0}>
        <QuoteBox x={1250} y={345} w={1180} who="Джейн" text="Чем больше мое одиночество без друзей и поддержки, тем больше я хочу уважать себя." refText="гл. 27" size={42} />
      </Appear>
      <Appear t={t} at={b2} x={0} y={0}>
        <QuoteBox x={1250} y={570} w={1180} who="Джейн" text="Я не нарушу закона, данного Богом, подтвержденного людьми." refText="гл. 27" size={42} color={C.slate} />
      </Appear>
      <g opacity={1 - ramp(t, b3b, 0.4)}>
        <Appear t={t} at={b3} x={0} y={0}>
          <QuoteBox x={1250} y={800} w={1000} who="рассказчица" text="однако я все еще владела своей душой" refText="гл. 27" size={38} color={C.sage} />
        </Appear>
      </g>
      <Appear t={t} at={b3b} x={0} y={0}>
        <QuoteBox x={1250} y={800} w={1000} who="Рочестер" text="Схваченная против воли, ты ускользнешь" refText="гл. 27" size={38} color={C.amber} />
      </Appear>
    </g>
  );
};

// j55 — 20 000 фунтов: стопка монет делится на четыре равные части; ветви родства.
export const Inherit: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const b3 = at(ctx, 3);
  const split = ease(clamp01((t - b2 - 0.6) / 1.6));
  const people = [
    { who: "jane" as const, x: 220 },
    { who: "stjohn" as const, x: 520 },
    { who: "diana" as const, x: 820 },
    { who: "maryR" as const, x: 1120 },
  ];
  return (
    <Drift t={t} dur={dur} cx={660}>
      <BgSet name="moorHouse" t={t} />
      <rect x={0} y={0} width={1920} height={1080} fill="#fbfff4" opacity={0.45} />
      <Appear t={t} at={0.3} x={670} y={180}>
        <rect x={-260} y={-60} width={520} height={120} rx={24} fill={C.white} stroke={OL} strokeWidth={5} />
        <text y={20} fontFamily={HEAVY} fontWeight={900} fontSize={60} fill={C.goldDeep} textAnchor="middle">
          20 000 фунтов
        </text>
      </Appear>
      {/* родство: линии от общего корня «Эйр» */}
      {t > b1 && (
        <g opacity={ramp(t, b1, 0.8)}>
          <Label x={670} y={330} text="семья Эйр" bg={C.sageSoft} size={30} />
          {people.map((pp) => (
            <Arrow key={pp.x} x1={670} y1={360} x2={pp.x} y2={470} k={ramp(t, b1 + 0.4, 0.8)} color={C.sage} w={6} bend={0} />
          ))}
        </g>
      )}
      {people.map((pp, i) => (
        <Appear key={pp.who} t={t} at={i === 0 ? 0.2 : b1 + 0.2 + i * 0.2} x={0} y={0}>
          <Person who={pp.who} x={pp.x} y={940} s={0.8} mood={t > b3 ? "smile" : "neutral"} pose="stand" t={t} seed={i} />
        </Appear>
      ))}
      {/* монеты: из общей стопки — в четыре равные */}
      {Array.from({ length: 20 }).map((_, i) => {
        const g = i % 4;
        const k = ramp(t, 0.6 + i * 0.04, 0.4);
        if (k <= 0) return null;
        const sx = 670 + ((i % 5) - 2) * 26;
        const sy = 290 - Math.floor(i / 5) * 18;
        const tx = people[g].x;
        const ty = 470 - Math.floor(i / 4) * 16;
        const x = sx + (tx - sx) * split;
        const y = sy + (ty - sy) * split - Math.sin(split * Math.PI) * 60;
        return <circle key={i} cx={x} cy={y} r={20} fill={C.gold} stroke={OL} strokeWidth={3} opacity={k} />;
      })}
      {split > 0.95 &&
        people.map((pp) => (
          <Appear key={pp.x} t={t} at={b2 + 2.2} x={pp.x} y={420}>
            <Label x={0} y={-130} text="5000" bg={C.yellow} size={30} />
          </Appear>
        ))}
      <Appear t={t} at={b3 + 0.4} x={1250} y={170}>
        <Label x={0} y={0} text="независимость, а не роскошь" bg={C.white} size={30} rot={-2} />
      </Appear>
    </Drift>
  );
};

// j59 — зов: волны голоса от Ферндина до Мур-Хауса по карте, огонёк вспыхивает.
export const Call: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const from = STOPS[5];
  const to = STOPS[4];
  return (
    <Drift t={t} dur={dur} amount={0.04}>
      <rect x={0} y={0} width={1920} height={1080} fill="#f4f0fa" />
      <JourneyMap t={t} stop={4} at={-10} />
      {[0, 1, 2, 3, 4].map((i) => {
        const k = ((t * 0.6 + i * 0.2) % 1) * ramp(t, 0.2, 0.5);
        const x = from.x + (to.x - from.x) * k;
        const y = from.y + (to.y - from.y) * k;
        return <circle key={i} cx={x} cy={y} r={30 + k * 60} fill="none" stroke={C.gold} strokeWidth={8 * (1 - k) + 2} opacity={1 - k} />;
      })}
      <Appear t={t} at={0.3} x={1250} y={540}>
        <rect x={-360} y={-56} width={720} height={112} rx={56} fill={C.yellow} stroke={OL} strokeWidth={5} />
        <text y={20} fontFamily={HEAVY} fontWeight={900} fontSize={54} fill={C.ink} textAnchor="middle">
          Джейн! Джейн! Джейн!
        </text>
      </Appear>
      <Appear t={t} at={b1 + 0.6} x={1000} y={930}>
        <Label x={0} y={0} text="природа явления — открыта" bg={C.white} size={30} />
      </Appear>
      <VoiceFlame x={to.x} y={to.y} t={t} s={0.6} size={0.4 + 0.9 * ramp(t, b2, 1)} />
      <Sparks x={to.x} y={to.y} t={t} at={b2 + 0.4} spread={300} />
    </Drift>
  );
};

// j64 — «Читатель, я вышла за него замуж»: два огонька рядом, весы равенства.
export const Married: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const b2 = at(ctx, 2);
  const b3 = at(ctx, 3);
  const tilt = Math.sin(t * 1.3) * 6 * ramp(t, b3, 0.8);
  return (
    <Drift t={t} dur={dur} cx={640}>
      <BgSet name="ferndean" t={t} />
      <rect x={0} y={0} width={1920} height={1080} fill="#fffbee" opacity={0.4} />
      <Appear t={t} at={0.2} x={640} y={120}>
        <rect x={-500} y={-60} width={1000} height={120} rx={30} fill={C.white} stroke={OL} strokeWidth={5} />
        <text y={20} fontFamily={SERIF} fontWeight={700} fontSize={50} fill={C.ink} textAnchor="middle">
          «Читатель, я вышла за него замуж»
        </text>
      </Appear>
      <Person who="jane" x={480} y={960} mood="smile" pose="hold" t={t} />
      <Person who="rochester" x={800} y={960} mood="kind" pose="stand" t={t} flip />
      {/* весы: зрение · рука · деньги · решение */}
      <Appear t={t} at={b2} x={640} y={290}>
        <g transform={`rotate(${tilt})`}>
          <rect x={-300} y={-8} width={600} height={16} rx={8} fill={C.goldDeep} stroke={OL} strokeWidth={3} />
          <Label x={-260} y={50} text="его зрение" bg={C.white} size={26} />
          <Label x={260} y={50} text="её рука" bg={C.white} size={26} />
        </g>
        <path d="M -20 0 L 20 0 L 0 -40 Z" fill={C.goldDeep} stroke={OL} strokeWidth={3} transform="translate(0 30) rotate(180)" />
      </Appear>
      <Appear t={t} at={b3 + 0.5} x={640} y={450}>
        <Label x={0} y={0} text="равенство? — вопрос открыт" bg={C.yellow} size={30} rot={-2} />
      </Appear>
    </Drift>
  );
};

const TAG_AT: [number, number][] = [[470, 215], [700, 800], [1150, 200], [1490, 230], [1500, 830]];

// Финал: map — путь с ценниками; flame — огонёк и вывод; end — книга, бренд.
export const Finale: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  if (p.mode === "map") {
    const tags = [
      { s: 0, title: "ДОМ: молчи", text: "сказала правду", at: 0.6 },
      { s: 1, title: "ШКОЛА: терпи", text: "говорить без крика", at: at(ctx, 1) },
      { s: 2, title: "ЛЮБОВЬ: уступи", text: "ушла", at: at(ctx, 1) + (ctx.ends[1] - at(ctx, 1)) * 0.6 },
      { s: 4, title: "ДОЛГ: служи", text: "отказалась", at: at(ctx, 2) },
      { s: 5, title: "РАВНЫЕ УСЛОВИЯ", text: "«да»", at: at(ctx, 2) + (ctx.ends[2] - at(ctx, 2)) * 0.6 },
    ];
    return (
      <Drift t={t} dur={dur} amount={0.03}>
        <JourneyMap t={t} stop={5} at={0.2} />
        {tags.map((g, i) => (
          <PriceTag key={i} x={TAG_AT[i][0]} y={TAG_AT[i][1]} title={g.title} text={g.text} k={ramp(t, g.at, 0.5)} color={g.s === 5 ? C.yellow : C.white} rot={i % 2 ? 5 : -5} s={0.8} />
        ))}
      </Drift>
    );
  }
  if (p.mode === "flame") {
    const A = area(p.host);
    const b1 = at(ctx, 1);
    return (
      <Drift t={t} dur={dur} cx={A.cx}>
        <VoiceFlame x={A.cx} y={260} t={t} s={1.1} size={1} />
        <Appear t={t} at={0.4} x={A.cx} y={500}>
          <Label x={0} y={0} text="голос = кто решает" bg={C.yellow} size={46} />
        </Appear>
        {["одиночество", "бедность", "разрыв"].map((w, i) => (
          <Appear key={w} t={t} at={b1 + 0.6 + i * 0.5} x={A.cx - 380 + i * 380} y={680}>
            <PriceTag x={0} y={0} title="ЦЕНА" text={w} k={1} color={C.roseSoft} rot={i % 2 ? 4 : -4} />
          </Appear>
        ))}
      </Drift>
    );
  }
  // end
  return (
    <Drift t={t} dur={dur} amount={0.03}>
      <Appear t={t} at={0.2} x={960} y={520}>
        <BookObj x={-430} y={0} s={1.1} label={"Джейн\nЭйр"} color="#7a3a52" rot={-6} />
        <VoiceFlame x={430} y={0} t={t} s={0.8} />
      </Appear>
      <Appear t={t} at={at(ctx, 1)} x={960} y={150}>
        <text x={0} y={0} fontFamily={HEAVY} fontWeight={900} fontSize={84} textAnchor="middle" fill={C.ink}>
          Bana<tspan fill={C.goldDeep}>Mind</tspan>
        </text>
        <text x={0} y={60} fontFamily={FONT} fontWeight={800} fontSize={40} textAnchor="middle" fill={C.inkSoft}>
          Большие идеи. Простыми словами.
        </text>
      </Appear>
    </Drift>
  );
};
