// Сцены четвёртой части книги (главы 22–30) BM-025: как говорить об ошибке.
//   butAnd — «но» → «и»; josephine — сначала свои промахи; questions — вопросы вместо приказа;
//   faceSave — две истории о совещании; cards — карточки и время, которое становится лучше.
import React from "react";
import { BOOK_PARTS, C, DISPLAY, FONT } from "../theme";
import { Bubble, Headline, PhraseBurst } from "./bridge";
import { Card, Label, OL, Person } from "./draw";
import { SourceChip } from "./generic";
import { Appear, area, at, Check, Cross, Drift, ramp, type VisualProps } from "./kit";
import { FlashCard } from "./props";
import { Setting } from "./settings";

const FLOOR = 840;
const R = BOOK_PARTS[4];
type P = { host?: string; part?: string };

const Say: React.FC<{ t: number; from: number; to?: number; x: number; y: number; text: string; tail?: -1 | 0 | 1; size?: number }> = ({ t, from, to = 1e9, x, y, text, tail = 0, size = 36 }) => {
  const k = ramp(t, from, 0.35) * (1 - ramp(t, to, 0.3));
  if (k <= 0.01) return null;
  return <Bubble x={x} y={y} text={text} size={size} tail={tail} opacity={k} scale={0.9 + 0.1 * k} />;
};

// ── «но» → «и» ──
export const ButAnd: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const swap = ramp(t, at(ctx, 1.3), 0.7);
  const word = swap < 0.5 ? "НО" : "И";
  const wk = Math.abs(swap - 0.5) * 2;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={540} amount={0.03}>
      <Appear t={t} at={at(ctx, 0.1)} x={cx} y={300}>
        <Card x={0} y={0} w={880} h={130} lines={["Мы гордимся твоими успехами"]} size={42} edge={C.green} />
      </Appear>
      <Appear t={t} at={at(ctx, 0.5)} x={cx} y={470}>
        <g transform={`scale(${0.6 + 0.4 * wk})`} opacity={wk}>
          <circle r={86} fill={swap < 0.5 ? C.red : C.green} stroke={OL} strokeWidth={6} />
          <text y={word.length > 1 ? 24 : 30} fontFamily={DISPLAY} fontWeight={800} fontSize={word.length > 1 ? 72 : 90} fill="#fff" textAnchor="middle">
            {word}
          </text>
        </g>
      </Appear>
      <Appear t={t} at={at(ctx, 0.6)} x={cx} y={640}>
        <Card x={0} y={0} w={880} h={130} lines={swap < 0.5 ? ["…подтяни алгебру"] : ["поработаешь над алгеброй —", "будет ещё лучше"]} size={38} edge={swap < 0.5 ? C.red : C.green} />
      </Appear>
      <Appear t={t} at={at(ctx, 0.7)} x={cx + 330} y={470}>
        <Label x={0} y={0} text={swap < 0.5 ? "похвала = вступление" : "просьба = продолжение"} size={28} bg={swap < 0.5 ? "#ffd6d6" : R.light} />
      </Appear>
      <Appear t={t} at={at(ctx, 2.3)} x={cx} y={170}>
        <Headline x={0} y={0} text="просьба не исчезла" size={46} color={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Сначала свои промахи ──
export const Josephine: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const think = ramp(t, at(ctx, 1), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="office" cx={cx} floor={FLOOR} w={1200} />
      <Person who="boss" x={cx - 300} y={FLOOR} s={0.8} mood={think > 0.5 ? "think" : "tense"} pose={think > 0.5 && t < at(ctx, 2) ? "think" : t > at(ctx, 2) ? "give" : "point"} t={t} look={0.8} />
      <Person who="friend" x={cx + 300} y={FLOOR} s={0.78} mood={t > at(ctx, 2.2) ? "smile" : "tense"} pose="hold" t={t} flip look={0.8} />
      {/* мысленное облачко: он сам в 19 лет */}
      <g opacity={think * (1 - ramp(t, at(ctx, 2), 0.5))}>
        <circle cx={cx - 220} cy={420} r={14} fill="#fff" stroke={OL} strokeWidth={3} />
        <circle cx={cx - 190} cy={380} r={20} fill="#fff" stroke={OL} strokeWidth={3} />
        <rect x={cx - 380} y={160} width={380} height={200} rx={90} fill="#fff" stroke={OL} strokeWidth={4} />
        <Person who="student" x={cx - 190} y={350} s={0.36} mood="shock" pose="shrug" t={t} />
        <text x={cx - 300} y={230} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={R.deep} textAnchor="middle">
          19
        </text>
      </g>
      <Say t={t} from={at(ctx, 2.05)} x={cx - 140} y={290} text={"Я сам ошибался\nкуда больше"} tail={-1} />
      <Appear t={t} at={at(ctx, 2.3)} x={cx + 260} y={240}>
        <Label x={0} y={0} text="«Экспертами не рождаются»" size={32} bg={C.yellow} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="self" x={cx} y={130} />
      </g>
    </Drift>
  );
};

// ── Вопросы вместо приказа ──
const QS = ["Можем ли мы что-то сделать?", "Есть ли идеи?", "Поможет ли другой график?"];
export const Questions: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const ideas = ramp(t, at(ctx, 2), 1);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="factory" cx={cx} floor={FLOOR} w={1300} />
      <Person who="boss" x={cx - 450} y={FLOOR} s={0.8} mood="kind" pose={t > at(ctx, 1) ? "give" : "stand"} t={t} look={0.8} />
      {[0, 1, 2].map((i) => (
        <Person key={i} who={(["timur", "neighbor", "anna"] as const)[i]} x={cx + 60 + i * 210} y={FLOOR} s={0.74} mood={ideas > 0.3 ? "happy" : "think"} pose={ideas > 0.4 && i === 1 ? "wave" : ideas > 0.6 && i === 0 ? "point" : "stand"} t={t} flip seed={i + 2} look={0.6} />
      ))}
      <g opacity={1 - ramp(t, at(ctx, 2.95), 0.4)}>
        {QS.map((q, i) => (
          <Appear key={i} t={t} at={at(ctx, 1.15) + i * 0.25} x={cx - 300} y={230 + i * 92}>
            <Bubble x={0} y={0} text={q} size={30} />
          </Appear>
        ))}
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={ideas} transform={`translate(${cx + 60 + i * 210} ${360 - ideas * 20})`}>
          <circle r={34} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <path d="M -10 30 L 10 30 M -8 40 L 8 40" stroke={OL} strokeWidth={4} />
          <path d="M -8 -6 Q 0 -20 8 -6" stroke={OL} strokeWidth={3} fill="none" />
        </g>
      ))}
      <Appear t={t} at={at(ctx, 2.4)} x={cx + 270} y={220}>
        <Label x={0} y={0} text="заказ сдан вовремя" size={30} bg={R.light} />
      </Appear>
      <Appear t={t} at={at(ctx, 3.05)} x={cx} y={150}>
        <Headline x={0} y={0} text="ответ ещё не решён за человека" size={44} color={C.yellow} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 0.1), 0.5) * (1 - ramp(t, at(ctx, 3), 0.3))}>
        <SourceChip kind="student" x={cx} y={150} />
      </g>
    </Drift>
  );
};

// ── Сохранить лицо ──
const Meeting: React.FC<{ t: number; x: number; good: boolean; k: number; label: string }> = ({ t, x, good, k, label }) => (
  <g opacity={k}>
    <rect x={x - 330} y={260} width={660} height={560} rx={36} fill="rgba(255,255,255,0.16)" stroke="#fff" strokeOpacity={0.6} strokeWidth={4} />
    <rect x={x - 230} y={650} width={460} height={26} rx={10} fill={C.woodLight} stroke={OL} strokeWidth={4} />
    {[-150, 0, 150].map((dx, i) => (
      <Person key={i} who={(["crowd", "guest", "crowd"] as const)[i]} x={x + dx} y={650} s={0.42} mood={good ? "smile" : "doubt"} t={t} seed={i} flip={dx > 0} look={0.3} />
    ))}
    <Person who="boss" x={x - 210} y={800} s={0.52} mood={good ? "kind" : "tense"} pose={good ? "give" : "point"} t={t} look={0.8} />
    <Person who={good ? "anna" : "timur"} x={x + 210} y={800} s={0.52} mood={good ? "happy" : "shock"} pose="stand" t={t} flip look={0.8} />
    <Label x={x} y={300} text={label} size={28} bg={good ? R.light : "#ffd6d6"} />
  </g>
);

export const FaceSave: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const lx = cx - 360;
  const rx = cx + 360;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560} amount={0.025}>
      <Meeting t={t} x={lx} good={false} k={ramp(t, at(ctx, 0.2), 0.5)} label="при всех — обвинение" />
      <Say t={t} from={at(ctx, 0.5)} to={at(ctx, 1)} x={lx - 60} y={420} text={"Вы нас подвели!"} tail={1} size={30} />
      <Appear t={t} at={at(ctx, 0.8)} x={lx} y={380}>
        <Label x={0} y={0} text="ушёл к конкурентам" size={26} bg="#ffd6d6" border="#b23f3f" />
      </Appear>
      <Meeting t={t} x={rx} good k={ramp(t, at(ctx, 1), 0.5)} label="при всех — поддержка" />
      <Say t={t} from={at(ctx, 2.05)} x={rx - 40} y={480} text={"Спасибо за работу.\nПовторный тест будет точным"} tail={-1} size={26} />
      <Appear t={t} at={at(ctx, 3)} x={rx} y={380}>
        <Label x={0} y={0} text="тест переделали" size={28} bg={C.yellow} />
      </Appear>
      <Cross x={lx + 270} y={290} s={56} k={ramp(t, at(ctx, 0.9), 0.4)} />
      <Check x={rx + 270} y={290} s={44} k={ramp(t, at(ctx, 2.6), 0.4)} />
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="student" x={cx} y={180} />
      </g>
    </Drift>
  );
};

// ── Карточки: каждый шаг лучше ──
const TIMES = ["52", "48", "45", "44", "41"]; // минуты по книге (part-05:244)
export const Cards: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="home" cx={cx} floor={FLOOR} w={1300} />
      <Person who="neighbor" x={cx - 420} y={FLOOR} s={0.8} mood={t > at(ctx, 1.4) ? "happy" : "kind"} pose={t > at(ctx, 1.4) ? "point" : "stand"} t={t} look={0.8} />
      <Person who="kid" x={cx - 160} y={FLOOR} s={0.9} mood={t > at(ctx, 1.4) ? "happy" : "think"} pose={t > at(ctx, 1.6) ? "wave" : "hold"} t={t} flip look={0.6} />
      {["7 × 8", "6 × 9", "4 × 7"].map((q, i) => (
        <Appear key={q} t={t} at={at(ctx, 1) + i * 0.15} x={0} y={0}>
          <FlashCard x={cx + 160 + i * 40} y={320 + i * 20} text={q} rot={(i - 1) * 6} />
        </Appear>
      ))}
      {/* шкала: время уменьшается — каждая отметка отмечена галочкой */}
      <g transform={`translate(${cx + 220} 560)`}>
        {TIMES.map((tm, i) => {
          const k = ramp(t, at(ctx, 1.25) + i * 0.22, 0.4);
          const h = 200 * (Number(tm) / 52);
          return (
            <g key={i} opacity={k} transform={`translate(${(i - 2) * 90} 0)`}>
              <rect x={-30} y={150 - h} width={60} height={h} rx={10} fill={i === TIMES.length - 1 ? R.color : R.light} stroke={OL} strokeWidth={4} />
              <Check x={0} y={150 - h - 26} s={20} k={ramp(t, at(ctx, 1.25) + i * 0.22 + 0.3, 0.3)} />
            </g>
          );
        })}
        <text x={0} y={200} fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke" opacity={ramp(t, at(ctx, 1.3), 0.5)}>
          минуты на все карточки: 52 → 41
        </text>
      </g>
      <PhraseBurst t={t} at={at(ctx, 2.3)} appear={at(ctx, 2.0)} text={"один выполнимый шаг"} bx={cx + 220} by={190} shape="steps" sx={cx + 520} sy={300} colors={[R.color, R.deep, C.yellow, "#fff"]} scale={0.4} size={32} step={10} r={4} />
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="student" x={cx - 300} y={150} />
      </g>
    </Drift>
  );
};
