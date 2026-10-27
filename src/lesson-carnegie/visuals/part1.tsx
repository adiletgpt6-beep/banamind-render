// Сцены первой части книги (главы 1–3) BM-025. Персонажи — условные фигуры
// фильма с подписью «кто это в книге», не портреты реальных людей.
//   helmets — каски: приказ и вопрос; letter — неотправленное письмо Линкольна;
//   hoover — лётчик и механик; fatherForgets — пересказ «Отец забывает»;
//   ribbons — голубые значки отца Карнеги; coins — признание и лесть;
//   roses — шесть роз; fishing — земляника и черви; hotel — листок «плюсы и минусы».
import React from "react";
import { C, FONT } from "../theme";
import { Bubble, Headline, PhraseBurst } from "./bridge";
import { Card, Label, OL, Person } from "./draw";
import { SourceChip } from "./generic";
import { Appear, area, Arrow, at, clamp01, Cross, Drift, ramp, type VisualProps } from "./kit";
import { Bed, Can, Coin, Drawer, Fish, headTop, Helmet, Paper, Pig, Plane, Ribbon, Rose, Stamp, Strawberry, Worm } from "./props";
import { Setting } from "./settings";

const FLOOR = 840;
type P = { host?: string; part?: string };

// облачко над головой, с появлением и уходом по репликам
const Say: React.FC<{ t: number; from: number; to?: number; x: number; y: number; text: string; tail?: -1 | 0 | 1; size?: number }> = ({ t, from, to = 1e9, x, y, text, tail = 0, size = 36 }) => {
  const k = ramp(t, from, 0.35) * (1 - ramp(t, to, 0.3));
  if (k <= 0.01) return null;
  return <Bubble x={x} y={y} text={text} size={size} tail={tail} opacity={k} scale={0.9 + 0.1 * k} />;
};

// ── Каски ──
export const Helmets: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const bossX0 = cx - 420;
  // начальник уходит (1.6…2) и возвращается (2)
  const leave = ramp(t, at(ctx, 1.55), 0.9) * (1 - ramp(t, at(ctx, 2), 0.8));
  const bossX = bossX0 - leave * 520;
  const workers = [cx + 140, cx + 420];
  const off1 = ramp(t, at(ctx, 1.75), 0.5) * (1 - ramp(t, at(ctx, 2.6), 0.6)); // каски сняты, пока его нет
  const on0 = ramp(t, at(ctx, 1.1), 0.5); // надели по приказу
  const phase2 = t >= at(ctx, 2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="factory" cx={cx} floor={FLOOR} w={1300} />
      <Person who="boss" x={bossX} y={FLOOR} s={0.78} mood={phase2 ? "kind" : "tense"} pose={leave > 0.05 && leave < 0.95 ? "walk" : phase2 ? "give" : t > at(ctx, 1) ? "point" : "stand"} t={t} look={0.8} />
      {workers.map((x, i) => {
        const on = on0 * (1 - off1);
        const top = headTop("neighbor", 0.78);
        const helmetY = FLOOR + top + 34;
        const mood = phase2 ? (t > at(ctx, 2.6) ? "smile" : "think") : t > at(ctx, 1.1) ? "tense" : "neutral";
        return (
          <g key={i}>
            <Person who={i ? "neighbor" : "timur"} x={x} y={FLOOR} s={0.78} mood={mood} pose={off1 > 0.5 && i === 0 ? "hold" : "stand"} t={t} flip seed={i + 3} look={0.6} />
            <Helmet x={x + (1 - on) * (i ? 70 : -70)} y={helmetY + (1 - on) * 230} s={0.82} rot={(1 - on) * (i ? 30 : -30)} />
          </g>
        );
      })}
      <Say t={t} from={at(ctx, 1)} to={at(ctx, 1.6)} x={bossX0 + 130} y={360} text={"Наденьте каску!\nЭто приказ!"} tail={-1} />
      <Say t={t} from={at(ctx, 2.05)} to={at(ctx, 2.55)} x={bossX0 + 160} y={360} text={"Каска удобная?\nХорошо сидит?"} tail={-1} />
      <Say t={t} from={at(ctx, 2.55)} x={bossX0 + 160} y={360} text={"Она бережёт\nвас от травм"} tail={-1} />
      <g opacity={ramp(t, at(ctx, 0.3), 0.5)}>
        <SourceChip kind="student" x={cx} y={170} />
      </g>
      <Appear t={t} at={at(ctx, 3.1)} x={cx} y={250}>
        <Headline x={0} y={0} text="Правило то же. Тон — другой" size={46} color={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Неотправленное письмо ──
export const Letter: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const ink = ramp(t, at(ctx, 0.4), 2.4);
  const into = ramp(t, at(ctx, 1.55), 0.9);
  const open = ramp(t, at(ctx, 1.4), 0.4) * (1 - ramp(t, at(ctx, 1.95), 0.4));
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560} amount={0.03}>
      <Appear t={t} at={0.1} x={0} y={0}>
        <Drawer x={cx - 120} y={680} w={520} open={open} />
      </Appear>
      <g transform={`translate(0 ${into * 330}) scale(${1 - 0.35 * into})`} style={{ transformOrigin: `${cx - 120}px 400px` }} opacity={1 - clamp01((into - 0.8) / 0.2)}>
        <Paper x={cx - 120} y={400} w={360} h={440} rot={-3} ink={ink} color="#b23f3f" title="Генералу Миду" />
      </g>
      <Appear t={t} at={at(ctx, 0.3)} x={cx - 120} y={140}>
        <SourceChip kind="history" x={0} y={0} />
      </Appear>
      <Stamp x={cx - 120} y={540} text="НЕ ОТПРАВЛЕНО" k={ramp(t, at(ctx, 1.9), 0.4)} />
      {/* предположение: Мид бы защищался — щит из точек */}
      <PhraseBurst t={t} at={at(ctx, 2.35)} appear={at(ctx, 2.0)} text={"Я не виноват!"} bx={cx + 380} by={300} shape="shield" sx={cx + 380} sy={470} colors={["#e5484d", "#ff9f8a", "#fff"]} scale={0.6} size={36} step={12} r={4.6} />
      <Appear t={t} at={at(ctx, 2.2)} x={cx + 380} y={700}>
        <Label x={0} y={0} text="предположение Карнеги" size={28} />
      </Appear>
    </Drift>
  );
};

// ── Лётчик и механик ──
export const Hoover: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const land = ramp(t, 0.2, 2.6);
  const planeX = cx + 560 + (1 - land) * 600;
  const planeY = 560 - (1 - land) * 260;
  const hand = ramp(t, at(ctx, 2), 0.6);
  const pilotX = cx - 160 + hand * 120;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="airfield" cx={cx} floor={FLOOR} w={1400} />
      <Plane x={planeX} y={planeY} s={0.7} rot={-6 * (1 - land) + 3 * land} dent={land} />
      <Appear t={t} at={at(ctx, 0.5)} x={0} y={0}>
        <Can x={cx + 40} y={FLOOR} s={0.9} color="#3d8bff" label="реакт." />
      </Appear>
      <Cross x={cx + 40} y={FLOOR - 70} s={80} k={ramp(t, at(ctx, 0.75), 0.5)} />
      <Person who="officer" x={pilotX} y={FLOOR} s={0.8} mood={t > at(ctx, 2) ? "kind" : "think"} pose={hand > 0.5 ? "give" : "stand"} t={t} look={0.8} />
      <Person who="student" x={cx + 130 - (1 - land) * 0} y={FLOOR} s={0.74} mood={t < at(ctx, 2.1) ? "shock" : "doubt"} pose={t < at(ctx, 2.6) ? "hold" : "stand"} t={t} flip look={0.6} />
      <Say t={t} from={at(ctx, 2.15)} to={at(ctx, 3)} x={cx - 230} y={330} text={"Я верю, что вы\nбольше так не сделаете"} tail={-1} size={34} />
      <Say t={t} from={at(ctx, 3)} x={cx - 230} y={330} text={"Завтра обслужите\nмой самолёт"} tail={-1} size={34} />
      <PhraseBurst t={t} at={at(ctx, 3.5)} appear={at(ctx, 3.5) - 0.01} text="" bx={cx + 130} by={380} shape="star" sx={cx + 380} sy={300} colors={[C.yellow, C.gold, "#fff"]} scale={0.4} step={10} r={4} />
      <g opacity={ramp(t, at(ctx, 0.2), 0.5)}>
        <SourceChip kind="history" x={cx} y={150} />
      </g>
    </Drift>
  );
};

// ── «Отец забывает» — пересказ ──
const REMARKS = ["не так умылся!", "не так ешь!", "не бегай!", "сядь прямо!", "опять шумишь!"];
export const FatherForgets: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const night = ramp(t, at(ctx, 1.45), 1);
  const fall = ramp(t, at(ctx, 1.7), 1.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <g opacity={night}>
        <circle cx={cx - 40} cy={FLOOR - 560} r={34} fill="#fff6c8" stroke={OL} strokeWidth={4} />
        <circle cx={cx - 22} cy={FLOOR - 572} r={30} fill="#ffe9c4" />
      </g>
      <Setting name="home" cx={cx} floor={FLOOR} w={1200} />
      <Bed x={cx + 200} y={FLOOR} s={1} sleeper t={t} />
      <Person who="neighbor" x={cx - 300} y={FLOOR} s={0.8} mood={night > 0.5 ? "think" : "tense"} pose={night > 0.5 ? "think" : "point"} t={t} look={0.8} />
      {REMARKS.map((r, i) => {
        const k = ramp(t, at(ctx, 1.05) + i * 0.35, 0.3);
        if (k <= 0) return null;
        const x = cx - 80 + (i % 3) * 260 - 140;
        const y = 260 + Math.floor(i / 3) * 110 + fall * (420 + i * 30);
        return (
          <g key={i} opacity={k * (1 - clamp01((fall - 0.6) / 0.4))} transform={`rotate(${fall * (i % 2 ? 18 : -14)} ${x} ${y})`}>
            <Label x={x} y={y} text={r} size={30} bg="#ffd6d6" border="#b23f3f" />
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, 0.2)} x={cx} y={125}>
        <SourceChip kind="quote" x={0} y={0} />
      </Appear>
      <Appear t={t} at={at(ctx, 2.1)} x={cx} y={300}>
        <Card x={0} y={0} w={880} h={150} lines={["«Не критикуйте,", "воздерживайтесь от осуждения»"]} size={40} title="Правило Карнеги · глава 1" />
      </Appear>
      <Appear t={t} at={at(ctx, 2.6)} x={cx} y={445}>
        <Label x={0} y={0} text="фильм: не унижать — но говорить о проблеме" size={30} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Голубые значки ──
export const Ribbons: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="farm" cx={cx} floor={FLOOR} w={1300} />
      <Appear t={t} at={at(ctx, 1)} x={0} y={0}>
        <rect x={cx - 120} y={260} width={480} height={290} rx={18} fill={C.woodLight} stroke={OL} strokeWidth={5} />
      </Appear>
      {[0, 1, 2, 3, 4].map((i) => (
        <Appear key={i} t={t} at={at(ctx, 2) + i * 0.25} x={0} y={0}>
          <Ribbon x={cx - 40 + (i % 3) * 140 + (i > 2 ? 70 : 0)} y={325 + (i > 2 ? 120 : 0)} s={0.62} color={i % 2 ? "#3d6fd0" : "#2c5ab8"} label="1" />
        </Appear>
      ))}
      <Pig x={cx + 120} y={FLOOR} s={0.9} t={t} />
      <Person who="neighbor" x={cx - 340} y={FLOOR} s={0.82} mood={t > at(ctx, 2.2) ? "happy" : "smile"} pose={t > at(ctx, 2.2) ? "point" : "stand"} t={t} look={0.8} />
      <Appear t={t} at={at(ctx, 2.5)} x={cx + 300} y={560}>
        <Label x={0} y={0} text="свинье — всё равно" size={30} />
      </Appear>
      <Appear t={t} at={at(ctx, 2.75)} x={cx - 340} y={300}>
        <Label x={0} y={0} text="отцу — нет" size={34} bg={C.yellow} />
      </Appear>
      <Appear t={t} at={at(ctx, 1.2)} x={cx} y={150}>
        <Headline x={0} y={0} text="«желание быть значительным»" size={46} color={C.yellow} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 2), 0.5)}>
        <SourceChip kind="self" x={cx} y={215} />
      </g>
    </Drift>
  );
};

// ── Признание и лесть ──
export const Coins: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const lx = cx - 260;
  const rx = cx + 260;
  const crack = ramp(t, at(ctx, 2.2), 0.9);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520} amount={0.03}>
      <Appear t={t} at={at(ctx, 1)} x={0} y={0}>
        <Coin x={lx} y={480} r={170} label="признание" />
      </Appear>
      <Appear t={t} at={at(ctx, 1.2)} x={0} y={0}>
        <Coin x={rx} y={480} r={170} label="лесть" fake={crack} rot={crack * 6} />
      </Appear>
      <PhraseBurst t={t} at={at(ctx, 1.5)} appear={at(ctx, 1.5) - 0.01} text="" bx={lx} by={480} shape="heart" sx={lx - 230} sy={300} colors={["#e5484d", "#ff9fb8", "#fff"]} scale={0.32} step={9} r={3.8} />
      <Appear t={t} at={at(ctx, 1.4)} x={lx} y={720}>
        <Label x={0} y={0} text="от сердца" size={34} />
      </Appear>
      <Appear t={t} at={at(ctx, 1.7)} x={rx} y={720}>
        <Label x={0} y={0} text="только из уст" size={34} />
      </Appear>
      <Appear t={t} at={at(ctx, 2.4)} x={rx + 120} y={290}>
        <Label x={0} y={0} text="фальшивка" size={34} bg="#ffd6d6" border="#b23f3f" />
      </Appear>
      <Appear t={t} at={at(ctx, 0.2)} x={cx} y={160}>
        <Headline x={0} y={0} text="Хвалить всех подряд?" size={50} />
      </Appear>
      <Cross x={cx + 330} y={140} s={60} k={ramp(t, at(ctx, 0.6), 0.5)} />
    </Drift>
  );
};

// ── Шесть роз ──
export const Roses: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const list = ramp(t, at(ctx, 1), 1.2);
  const crumple = ramp(t, at(ctx, 1.85), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="home" cx={cx} floor={FLOOR} w={1300} />
      <Person who="timur" x={cx - 380} y={FLOOR} s={0.8} mood={t > at(ctx, 2) ? "kind" : "think"} pose={t > at(ctx, 2) ? "give" : "think"} t={t} look={0.8} />
      <Person who="anna" x={cx + 380} y={FLOOR} s={0.78} mood={t > at(ctx, 2.6) ? "happy" : t > at(ctx, 0.5) ? "think" : "smile"} pose={t > at(ctx, 2.6) ? "hold" : "stand"} t={t} flip look={0.8} />
      <g opacity={1 - crumple} transform={`translate(${cx - 60} ${420}) scale(${1 - 0.7 * crumple}) rotate(${crumple * 40})`}>
        <Paper x={0} y={0} w={280} h={320} title="6 недостатков?" size={28} ink={list} color="#b23f3f" />
      </g>
      {Array.from({ length: 6 }).map((_, i) => {
        const k = ramp(t, at(ctx, 2) + i * 0.12, 0.4);
        if (k <= 0) return null;
        return (
          <g key={i} opacity={k} transform={`translate(${(1 - k) * -60} ${(1 - k) * 40})`}>
            <Rose x={cx + 60 + (i % 3) * 60 - 60 + (i > 2 ? 30 : 0)} y={370 + (i > 2 ? -60 : 0)} s={0.8} rot={(i - 2.5) * 8} />
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, 2.4)} x={cx + 40} y={640}>
        <Label x={0} y={0} text="шесть роз вместо списка" size={30} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 0.2), 0.5)}>
        <SourceChip kind="student" x={cx} y={160} />
      </g>
    </Drift>
  );
};

// ── Земляника и черви ──
export const Fishing: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const swap = ramp(t, at(ctx, 1), 0.8);
  const hookX = cx + 200;
  const hookY = 640 + Math.sin(t * 1.5) * 8;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      {/* вода */}
      <rect x={a.x0 + 40} y={600} width={a.x1 - a.x0 - 80} height={300} rx={40} fill="#4f9bd0" stroke={OL} strokeWidth={5} opacity={0.9} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${a.x0 + 120 + i * 300} ${640 + i * 40} q 30 -14 60 0 t 60 0`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.6} />
      ))}
      <rect x={a.x0 + 40} y={560} width={360} height={60} rx={14} fill={C.wood} stroke={OL} strokeWidth={5} />
      <Person who="boss" x={a.x0 + 230} y={566} s={0.66} mood="happy" pose="hold" t={t} look={0.8} />
      <path d={`M ${a.x0 + 300} 360 Q ${cx} 200 ${hookX} 300`} stroke={OL} strokeWidth={6} fill="none" />
      <path d={`M ${hookX} 300 L ${hookX} ${hookY - 30}`} stroke={OL} strokeWidth={3} />
      <path d={`M ${hookX} ${hookY - 30} q 0 30 -14 30 q -14 0 -14 -14`} stroke={OL} strokeWidth={5} fill="none" />
      <g opacity={1 - swap}>
        <Strawberry x={hookX - 6} y={hookY - 20} s={0.45} />
      </g>
      <g opacity={swap}>
        <Worm x={hookX - 14} y={hookY} s={1} t={t} />
      </g>
      <Fish x={hookX + 210 - swap * 120} y={760} s={1} flip t={t} />
      <Appear t={t} at={at(ctx, 0.3)} x={a.x1 - 260} y={250}>
        <Label x={0} y={0} text="я люблю землянику" size={30} />
      </Appear>
      <Appear t={t} at={at(ctx, 1.1)} x={a.x1 - 260} y={330}>
        <Label x={0} y={0} text="рыба любит червей" size={30} bg={C.yellow} />
      </Appear>
      <Appear t={t} at={at(ctx, 2)} x={cx} y={150}>
        <Headline x={0} y={0} text="Что важно другому?" size={50} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="self" x={cx} y={225} />
      </g>
    </Drift>
  );
};

// ── Зал в отеле ──
export const Hotel: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const up = ramp(t, at(ctx, 0.4), 0.8);
  const less = ramp(t, at(ctx, 2.4), 0.8);
  const sheet = ramp(t, at(ctx, 2), 0.6);
  const h = 320 * up * (1 - 0.6 * less);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="plain" cx={cx} floor={FLOOR} w={1300} />
      <Person who="seller" x={cx + 360} y={FLOOR} s={0.78} mood={t > at(ctx, 2.4) ? "smile" : "neutral"} pose={t > at(ctx, 2.2) ? "take" : "arms"} t={t} flip look={0.6} />
      <Person who="boss" x={cx - 420} y={FLOOR} s={0.8} mood={t > at(ctx, 1) ? "kind" : "doubt"} pose={t > at(ctx, 2) ? "give" : "stand"} t={t} look={0.8} />
      {/* столбик платы */}
      <g transform={`translate(${cx - 90} 760)`}>
        <rect x={-80} y={-h} width={160} height={h} rx={10} fill={less > 0.5 ? C.green : C.red} stroke={OL} strokeWidth={4} />
        <text y={40} fontFamily={FONT} fontWeight={900} fontSize={28} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={5} paintOrder="stroke">
          плата за зал
        </text>
      </g>
      <Arrow x1={cx - 90} y1={720} x2={cx - 90} y2={760 - h - 40} k={up * (1 - less)} color={C.red} w={10} />
      <Say t={t} from={at(ctx, 1.05)} to={at(ctx, 2)} x={cx - 250} y={330} text={"На вашем месте я бы,\nнаверное, поступил так же"} tail={-1} size={32} />
      <g opacity={sheet} transform={`translate(${cx + 200} ${360 + (1 - sheet) * 40})`}>
        <Paper x={0} y={0} w={330} h={300} title="Для отеля" size={30} lines={["+  …", "+  …", "−  …", "−  …"]} ink={ramp(t, at(ctx, 2.05), 0.8)} />
      </g>
      <Appear t={t} at={at(ctx, 2.55)} x={cx + 200} y={555}>
        <Label x={0} y={0} text="решение — за управляющим" size={28} bg={C.yellow} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 0.2), 0.5)}>
        <SourceChip kind="self" x={cx} y={160} />
      </g>
    </Drift>
  );
};
