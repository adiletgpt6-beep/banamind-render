// Сцены второй части книги (главы 4–9) BM-025: интерес, имя, слушание.
//   nurse — медсестра в праздник; nameStory — полное имя клиента; nameTrick — имя без внимания;
//   dinner — ботаник за ужином; coat — пальто с дыркой; listenEar — слушать, чтобы понять;
//   boats — разговор о кораблях; postOffice — почтовый клерк.
import React from "react";
import { BOOK_PARTS, C, DISPLAY } from "../theme";
import { Bubble, Headline, PhraseBurst } from "./bridge";
import { dotsOf, Morph, Swarm } from "./dots";
import { Card, Label, OL, Person } from "./draw";
import { SourceChip } from "./generic";
import { Appear, area, at, Check, clamp01, Cross, Drift, ramp, type VisualProps } from "./kit";
import { Bed } from "./props";
import { Setting } from "./settings";
import { SHAPES } from "./shapes";

const FLOOR = 840;
const G = BOOK_PARTS[2];
type P = { host?: string; part?: string };

const Say: React.FC<{ t: number; from: number; to?: number; x: number; y: number; text: string; tail?: -1 | 0 | 1; size?: number }> = ({ t, from, to = 1e9, x, y, text, tail = 0, size = 36 }) => {
  const k = ramp(t, from, 0.35) * (1 - ramp(t, to, 0.3));
  if (k <= 0.01) return null;
  return <Bubble x={x} y={y} text={text} size={size} tail={tail} opacity={k} scale={0.9 + 0.1 * k} />;
};

const Tray: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-12} width={140} height={20} rx={8} fill="#c9d4e6" stroke={OL} strokeWidth={4} />
    <ellipse cx={-20} cy={-26} rx={36} ry={14} fill="#fff" stroke={OL} strokeWidth={3} />
    <path d="M -40 -32 q 20 -16 40 0" fill="#e0a060" stroke={OL} strokeWidth={3} />
    <rect x={28} y={-48} width={22} height={36} rx={6} fill="#ffd27a" stroke={OL} strokeWidth={3} />
  </g>
);

// ── Медсестра в праздник ──
export const Nurse: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const come = ramp(t, at(ctx, 1), 1.2);
  const nx = cx + 520 - come * 260;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="hospital" cx={cx} floor={FLOOR} w={1300} />
      <Bed x={cx - 120} y={FLOOR - 40} s={1.05} sleeper={false} />
      {/* мальчик сидит в кровати */}
      <g transform={`translate(${cx - 230} ${FLOOR - 120})`}>
        <circle cx={0} cy={-60} r={40} fill={C.skin} stroke={OL} strokeWidth={4} />
        <path d="M -40 -70 Q 0 -120 40 -70 Q 0 -86 -40 -70 Z" fill="#6a4428" stroke={OL} strokeWidth={3} />
        <circle cx={-13} cy={-60} r={4.5} fill={OL} />
        <circle cx={13} cy={-60} r={4.5} fill={OL} />
        <path d={t > at(ctx, 1.8) ? "M -12 -40 Q 0 -30 12 -40" : "M -10 -36 Q 0 -44 10 -36"} stroke={OL} strokeWidth={3} fill="none" />
        {t < at(ctx, 1.6) && <path d={`M -18 -50 q -4 ${14 + Math.sin(t * 3) * 4} 0 24`} stroke="#5fb3ff" strokeWidth={5} fill="none" strokeLinecap="round" />}
        <rect x={-36} y={-20} width={72} height={40} rx={14} fill="#a8d0ff" stroke={OL} strokeWidth={4} />
      </g>
      <Person who="doctor" x={nx} y={FLOOR} s={0.8} mood="kind" pose={come > 0.95 ? "give" : "walk"} t={t} flip look={0.6} item={<Tray x={0} y={0} s={0.7} />} />
      {come > 0.9 && <Tray x={cx - 110} y={FLOOR - 140} s={0.8} />}
      <Appear t={t} at={at(ctx, 2)} x={cx + 260} y={300}>
        <Label x={0} y={0} text="ей это ничего не приносило" size={30} />
      </Appear>
      <PhraseBurst t={t} at={at(ctx, 2.3)} appear={at(ctx, 2.3) - 0.01} text="" bx={cx} by={300} shape="heart" sx={cx - 230} sy={360} colors={[G.color, G.light, "#ff9fb8", "#fff"]} scale={0.42} step={10} r={4.2} />
      <g opacity={ramp(t, at(ctx, 0.2), 0.5)}>
        <SourceChip kind="student" x={cx} y={160} />
      </g>
    </Drift>
  );
};

// ── Полное имя клиента ──
export const NameStory: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const full = ramp(t, at(ctx, 1.2), 0.9);
  const shortPts = dotsOf("name-nik", (x, y) => Math.abs(x) <= 160 && Math.abs(y) <= 50, cx, 300, ["#c9c2b0", "#fff"], 13, 200);
  const fullPts = dotsOf("name-full", (x, y) => Math.abs(x) <= 360 && Math.abs(y) <= 56, cx, 300, [G.color, G.deep, C.yellow, "#fff"], 13, 400);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="shop" cx={cx} floor={FLOOR} w={1300} />
      <Person who="seller" x={cx - 380} y={FLOOR} s={0.8} mood="smile" pose={t > at(ctx, 1.3) ? "wave" : "stand"} t={t} look={0.8} />
      <Person who="neighbor" x={cx + 380} y={FLOOR} s={0.8} mood={t > at(ctx, 2.1) ? "happy" : "neutral"} pose={t > at(ctx, 2.1) ? "hold" : "stand"} t={t} flip look={0.8} />
      {t > at(ctx, 0.3) && (
        <g opacity={1 - ramp(t, at(ctx, 1.2) + 1.1, 0.5)}>
          <Morph a={shortPts} b={fullPts} k={full} t={t} r={4.6} />
        </g>
      )}
      <rect x={cx - 380} y={240} width={760} height={120} rx={60} fill={G.color} stroke={OL} strokeWidth={5} opacity={ramp(t, at(ctx, 1.2) + 1.0, 0.5)} />
      <g opacity={ramp(t, at(ctx, 0.4), 0.4) * (1 - full)}>
        <text x={cx} y={316} fontFamily={DISPLAY} fontWeight={800} fontSize={60} fill={OL} textAnchor="middle">
          Ник
        </text>
      </g>
      <g opacity={full}>
        <text x={cx} y={318} fontFamily={DISPLAY} fontWeight={800} fontSize={56} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={9} paintOrder="stroke">
          Никодемус Пападоулас
        </text>
      </g>
      <Appear t={t} at={at(ctx, 2.2)} x={cx} y={440}>
        <Label x={0} y={0} text="за пятнадцать лет — впервые" size={32} bg={C.yellow} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="student" x={cx} y={160} />
      </g>
    </Drift>
  );
};

// ── Имя без внимания ──
export const NameTrick: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const spam = ["Анна, отличный выбор!", "Анна, послушайте, Анна…", "Анна, только сегодня, Анна!"];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560} amount={0.03}>
      <Appear t={t} at={at(ctx, 0)} x={cx} y={190}>
        <Card x={0} y={0} w={900} h={150} lines={["«самый сладостный и важный", "для него звук»"]} size={40} title="Правило Карнеги · глава 6" />
      </Appear>
      {spam.map((s, i) => (
        <Appear key={i} t={t} at={at(ctx, 1) + i * 0.25} x={cx - 300 + i * 40} y={390 + i * 90}>
          <Bubble x={0} y={0} text={s} size={30} fill="#f1eef8" />
        </Appear>
      ))}
      <Cross x={cx - 260} y={480} s={150} k={ramp(t, at(ctx, 1.7), 0.5)} />
      <Appear t={t} at={at(ctx, 1.4)} x={cx - 260} y={720}>
        <Label x={0} y={0} text="приём по скрипту" size={30} />
      </Appear>
      <PhraseBurst t={t} at={at(ctx, 2.2)} appear={at(ctx, 2.0)} text={"время\nи внимание"} bx={cx + 320} by={400} shape="nameTag" sx={cx + 320} sy={470} colors={[G.color, G.deep, C.yellow, "#fff"]} scale={0.7} size={38} step={12} r={4.8} />
      <Appear t={t} at={at(ctx, 2.5)} x={cx + 320} y={680}>
        <Label x={0} y={0} text="время и внимание" size={34} bg={C.yellow} />
      </Appear>
      <Check x={cx + 520} y={470} s={50} k={ramp(t, at(ctx, 2.6), 0.5)} />
    </Drift>
  );
};

// ── Ботаник за ужином ──
export const Dinner: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const talkK = clamp01((t - at(ctx, 0.5)) / Math.max(1, at(ctx, 2) - at(ctx, 0.5)));
  const leaves = Array.from({ length: 7 }).map((_, i) => ({ x: cx + 140 + Math.cos(i * 0.9 + t * 0.4) * 160, y: 320 + Math.sin(i * 1.3 + t * 0.5) * 70 }));
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="banquet" cx={cx} floor={FLOOR} w={1300} />
      <Person who="boss" x={cx - 340} y={FLOOR} s={0.8} mood={t > at(ctx, 1.4) ? "smile" : "kind"} pose={t > at(ctx, 2.2) ? "shrug" : "stand"} t={t} look={0.8} />
      <Person who="expert" x={cx + 340} y={FLOOR} s={0.8} mood="happy" pose={t < at(ctx, 1.4) ? "point" : "wave"} t={t} flip look={0.8} />
      {leaves.map((l, i) => (
        <g key={i} opacity={clamp01(talkK * 3 - i * 0.3)} transform={`translate(${l.x} ${l.y}) rotate(${i * 50 + t * 20})`}>
          <path d="M 0 -26 Q 22 0 0 26 Q -22 0 0 -26 Z" fill={i % 2 ? "#5aae62" : "#7ccf80"} stroke={OL} strokeWidth={3} />
          <line x1={0} y1={-20} x2={0} y2={20} stroke={OL} strokeWidth={2} opacity={0.5} />
        </g>
      ))}
      <PhraseBurst t={t} at={at(ctx, 0.6)} appear={at(ctx, 0.2)} text={"Расскажите\nещё!"} bx={cx - 250} by={320} shape="ear" sx={cx - 250} sy={330} colors={[G.color, G.deep, "#fff"]} scale={0.48} size={34} tail={-1} step={11} r={4.4} />
      <Say t={t} from={at(ctx, 1.2)} to={at(ctx, 2)} x={cx + 280} y={250} text={"Исключительно интересный\nсобеседник!"} tail={1} size={32} />
      <Appear t={t} at={at(ctx, 2)} x={cx} y={180}>
        <Headline x={0} y={0} text="хороший слушатель" size={48} color={C.yellow} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="self" x={cx} y={110} />
      </g>
    </Drift>
  );
};

// ── Пальто с дыркой ──
const Coat: React.FC<{ x: number; y: number; s?: number; hole?: boolean }> = ({ x, y, s = 1, hole = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -70 -110 L -30 -130 L 0 -100 L 30 -130 L 70 -110 L 110 40 L 70 50 L 66 120 L -66 120 L -70 50 L -110 40 Z" fill="#c27a4a" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 0 -100 L 0 120" stroke={OL} strokeWidth={4} />
    {[-50, -10, 30, 70].map((y) => <circle key={y} cx={14} cy={y} r={6} fill={C.yellow} stroke={OL} strokeWidth={2} />)}
    {hole && <ellipse cx={-40} cy={60} rx={14} ry={10} fill="#3a2a2a" stroke={OL} strokeWidth={3} />}
  </g>
);

export const CoatShop: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const second = t > at(ctx, 2);
  const swap = ramp(t, at(ctx, 2), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="shop" cx={cx + 120} floor={FLOOR} w={1300} />
      <Person who="anna" x={cx - 380} y={FLOOR} s={0.8} mood={second ? "smile" : t > at(ctx, 1.1) ? "doubt" : "think"} pose="stand" t={t} look={0.8} />
      <Coat x={cx - 100} y={560} s={0.9} />
      <g opacity={1 - swap}>
        <Person who="seller" x={cx + 360} y={FLOOR} s={0.8} mood="tense" pose={t > at(ctx, 1.05) ? "stop" : "stand"} t={t} flip look={0.6} />
      </g>
      <g opacity={swap}>
        <Person who="friend" x={cx + 360} y={FLOOR} s={0.8} mood="kind" pose={t > at(ctx, 2.6) ? "give" : "stand"} t={t} flip look={0.6} />
      </g>
      <Say t={t} from={at(ctx, 1.05)} to={at(ctx, 1.95)} x={cx + 200} y={300} text={"Распродажа —\nвозврата нет!"} tail={1} />
      <Say t={t} from={at(ctx, 0.6)} to={at(ctx, 1.1)} x={cx - 240} y={300} text={"Здесь дырка…"} tail={-1} />
      {["починить", "заменить", "вернуть деньги"].map((o, i) => (
        <Appear key={o} t={t} at={at(ctx, 2.45) + i * 0.2} x={cx + 600} y={300 + i * 80}>
          <Label x={0} y={0} text={o} size={30} bg={G.light} />
        </Appear>
      ))}
      <Appear t={t} at={at(ctx, 2.1)} x={cx + 360} y={200}>
        <Label x={0} y={0} text="сначала выслушала" size={30} bg={C.yellow} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="student" x={cx} y={130} />
      </g>
    </Drift>
  );
};

// ── Слушать, чтобы понять ──
export const ListenEar: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const pts = dotsOf("listen-ear", (x, y) => SHAPES.ear(x / 0.85, y / 0.85), cx - 220, 470, [G.color, G.deep, G.light, "#fff"], 12, 260);
  const k = clamp01((t - 0.3) / 2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={540} amount={0.04}>
      <Swarm pts={pts} k={k} t={t} r={5.2} />
      <Appear t={t} at={at(ctx, 0.2)} x={cx + 260} y={260}>
        <Label x={0} y={0} text="не совет, а внимание" size={34} />
      </Appear>
      <Appear t={t} at={at(ctx, 1)} x={cx + 260} y={400}>
        <Card x={0} y={0} w={520} h={170} lines={["«Чтобы быть интересным,", "будьте заинтересованным»"]} size={32} title="Карнеги · глава 7" />
      </Appear>
      <Appear t={t} at={at(ctx, 2)} x={cx + 260} y={590}>
        <Card x={0} y={0} w={520} h={120} lines={["ждать паузы, чтобы", "вставить своё"]} size={30} edge={C.red} />
      </Appear>
      <Cross x={cx + 260} y={590} s={80} k={ramp(t, at(ctx, 2.3), 0.4)} />
      <Appear t={t} at={at(ctx, 2.5)} x={cx + 260} y={740}>
        <Label x={0} y={0} text="понять, что человек говорит" size={30} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Разговор о кораблях ──
const Boat: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 1.6) * 6}) rotate(${Math.sin(t * 1.3) * 3}) scale(${s})`}>
    <path d="M -110 0 L 110 0 L 80 50 L -80 50 Z" fill="#c25e33" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 0 0 L 0 -170" stroke={OL} strokeWidth={6} />
    <path d="M 4 -160 L 90 -20 L 4 -20 Z" fill="#fff" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -4 -140 L -70 -20 L -4 -20 Z" fill="#ffe9c4" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 0 -170 L 30 -160 L 0 -150" fill={C.red} stroke={OL} strokeWidth={3} />
  </g>
);

export const Boats: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="home" cx={cx} floor={FLOOR} w={1300} />
      <Person who="guest" x={cx - 300} y={FLOOR} s={0.82} mood="happy" pose={t > at(ctx, 1) ? "point" : "stand"} t={t} look={0.8} />
      <Person who="kid" x={cx + 120} y={FLOOR} s={0.9} mood={t > at(ctx, 1) ? "happy" : "neutral"} pose={t > at(ctx, 1.2) ? "wave" : "stand"} t={t} flip look={0.8} />
      <Appear t={t} at={at(ctx, 1)} x={0} y={0}>
        <Boat x={cx - 60} y={500} s={0.9} t={t} />
      </Appear>
      <Person who="grandma" x={cx + 430} y={FLOOR} s={0.76} mood={t > at(ctx, 2) ? "kind" : "smile"} pose={t > at(ctx, 2) ? "point" : "stand"} t={t} flip look={0.6} />
      <Say t={t} from={at(ctx, 2.05)} x={cx + 360} y={280} text={"Он говорил о том,\nчто интересно тебе"} tail={1} size={30} />
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="quote" x={cx} y={150} />
      </g>
    </Drift>
  );
};

// ── Почтовый клерк ──
export const PostOffice: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const bright = ramp(t, at(ctx, 1.6), 0.8);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="post" cx={cx + 200} floor={FLOOR} w={1300} />
      <Person who="officer" x={cx + 200} y={FLOOR - 40} s={0.72} mood={bright > 0.5 ? "happy" : "tense"} pose="stand" t={t} flip look={0.4} />
      <Person who="boss" x={cx - 380} y={FLOOR} s={0.8} mood="kind" pose={t > at(ctx, 1.2) && t < at(ctx, 2) ? "give" : "stand"} t={t} look={0.8} />
      <Say t={t} from={at(ctx, 1.25)} to={at(ctx, 2)} x={cx - 160} y={300} text={"Какие у вас\nпрекрасные волосы!"} tail={-1} />
      <PhraseBurst t={t} at={at(ctx, 1.75)} appear={at(ctx, 1.75) - 0.01} text="" bx={cx} by={300} shape="star" sx={cx + 200} sy={250} colors={[C.yellow, G.color, "#fff"]} scale={0.38} step={10} r={4} />
      <Appear t={t} at={at(ctx, 2.1)} x={cx - 260} y={290}>
        <Card x={0} y={0} w={470} h={150} lines={["А что вы хотели", "получить взамен?"]} size={32} />
      </Appear>
      <Appear t={t} at={at(ctx, 2.35)} x={cx - 260} y={430}>
        <Label x={0} y={0} text="ничего" size={40} bg={C.yellow} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="self" x={cx} y={130} />
      </g>
    </Drift>
  );
};
