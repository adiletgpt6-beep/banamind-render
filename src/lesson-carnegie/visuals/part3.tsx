// Сцены третьей части книги (главы 10–21) BM-025: спор, сотрудничество, мотивы.
//   banquet — цитата на банкете; rex — Рекс и полицейский; sunWind — басня о Солнце и Ветре;
//   yesSteps — цепочка общих фактов (моторы); sketches — незаконченные эскизы;
//   bonfire — костры в парке; jars — баночки крема; chalk — цифра мелом на полу.
import React from "react";
import { BOOK_PARTS, C, DISPLAY, FONT } from "../theme";
import { Bubble, Headline } from "./bridge";
import { Card, Label, OL, Person } from "./draw";
import { SourceChip } from "./generic";
import { Appear, area, Arrow, at, Check, Drift, ramp, type VisualProps } from "./kit";
import { Campfire, JarCream, Paper } from "./props";
import { Setting } from "./settings";

const FLOOR = 840;
const Y = BOOK_PARTS[3];
type P = { host?: string; part?: string };

const Say: React.FC<{ t: number; from: number; to?: number; x: number; y: number; text: string; tail?: -1 | 0 | 1; size?: number }> = ({ t, from, to = 1e9, x, y, text, tail = 0, size = 36 }) => {
  const k = ramp(t, from, 0.35) * (1 - ramp(t, to, 0.3));
  if (k <= 0.01) return null;
  return <Bubble x={x} y={y} text={text} size={size} tail={tail} opacity={k} scale={0.9 + 0.1 * k} />;
};

// ── Банкет ──
export const Banquet: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const kick = ramp(t, at(ctx, 2.1), 0.25) * (1 - ramp(t, at(ctx, 2.5), 0.3));
  const home = ramp(t, at(ctx, 3), 0.8);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="banquet" cx={cx} floor={FLOOR} w={1300} />
      <Person who="neighbor" x={cx - 420} y={FLOOR} s={0.78} mood={t > at(ctx, 1.4) ? "doubt" : "happy"} pose={t < at(ctx, 1.3) ? "point" : "arms"} t={t} look={0.8} />
      <Person who="boss" x={cx - 60 + kick * 10} y={FLOOR} s={0.78} mood={kick > 0.2 ? "shock" : home > 0.5 ? "think" : "smile"} pose={t > at(ctx, 1.2) && t < at(ctx, 2) ? "point" : "stand"} t={t} look={home > 0.5 ? 0.8 : -0.6} />
      <Person who="expert" x={cx + 340} y={FLOOR} s={0.78} mood={home > 0.5 ? "kind" : "smile"} pose={home > 0.5 ? "give" : "stand"} t={t} flip look={0.8} />
      <Say t={t} from={at(ctx, 1.05)} to={at(ctx, 1.4)} x={cx - 300} y={300} text={"Это из Библии!"} tail={-1} />
      <Say t={t} from={at(ctx, 1.4)} to={at(ctx, 2.05)} x={cx - 40} y={290} text={"Нет, это Шекспир!"} tail={-1} />
      <Say t={t} from={at(ctx, 2.1)} to={at(ctx, 3)} x={cx + 300} y={290} text={"Дейл, вы не правы"} tail={1} />
      {kick > 0.05 && (
        <g opacity={kick}>
          <path d={`M ${cx + 200} ${FLOOR - 40} L ${cx + 30} ${FLOOR - 60}`} stroke={C.red} strokeWidth={8} strokeLinecap="round" strokeDasharray="14 12" />
          <text x={cx + 110} y={FLOOR - 80} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={C.red} textAnchor="middle" stroke="#fff" strokeWidth={6} paintOrder="stroke">
            тук!
          </text>
        </g>
      )}
      <Say t={t} from={at(ctx, 3.05)} x={cx + 300} y={280} text={"Почему не дать ему\nсохранить лицо?"} tail={1} size={32} />
      <g opacity={ramp(t, at(ctx, 0.2), 0.5)}>
        <SourceChip kind="self" x={cx} y={150} />
      </g>
    </Drift>
  );
};

// ── Бульдог ──
const Bulldog: React.FC<{ x: number; y: number; s?: number; t?: number; flip?: boolean }> = ({ x, y, s = 1, t = 0, flip }) => (
  <g transform={`translate(${x} ${y + Math.abs(Math.sin(t * 6)) * -4}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <ellipse cx={0} cy={4} rx={90} ry={12} fill="#000" opacity={0.14} />
    {[-50, -20, 30, 56].map((dx, i) => (
      <rect key={i} x={dx - 11} y={-40} width={22} height={44} rx={9} fill="#e8d2b0" stroke={OL} strokeWidth={4} />
    ))}
    <ellipse cx={0} cy={-62} rx={78} ry={42} fill="#f2e2c8" stroke={OL} strokeWidth={5} />
    <circle cx={72} cy={-92} r={42} fill="#f2e2c8" stroke={OL} strokeWidth={5} />
    <ellipse cx={94} cy={-78} rx={22} ry={16} fill="#d9bf98" stroke={OL} strokeWidth={4} />
    <circle cx={100} cy={-84} r={5} fill={OL} />
    <circle cx={64} cy={-100} r={5} fill={OL} />
    <path d="M 46 -124 l -12 -20 l 26 6 Z M 88 -128 l 6 -22 l 14 18 Z" fill="#c9a87a" stroke={OL} strokeWidth={3} />
    <path d={`M -76 -70 q -20 ${-6 + Math.sin(t * 8) * 8} -26 -26`} stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round" />
    <circle cx={-30} cy={-70} r={14} fill="#8a6a4a" opacity={0.6} />
  </g>
);

const Horse: React.FC<{ x: number; y: number; s?: number; flip?: boolean }> = ({ x, y, s = 1, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {[-90, -60, 60, 90].map((dx, i) => (
      <rect key={i} x={dx - 12} y={-150} width={24} height={150} rx={10} fill="#8a5532" stroke={OL} strokeWidth={4} />
    ))}
    <ellipse cx={0} cy={-190} rx={130} ry={64} fill="#a8683e" stroke={OL} strokeWidth={5} />
    <path d="M 100 -220 L 150 -320 L 200 -300 L 170 -200 Z" fill="#a8683e" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 150 -320 L 200 -300 L 230 -260 L 210 -250 L 180 -280 Z" fill="#a8683e" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={176} cy={-300} r={5} fill={OL} />
    <path d="M 140 -320 q -40 30 -40 90" stroke="#4a2a1a" strokeWidth={14} fill="none" strokeLinecap="round" />
    <path d="M -130 -200 q -50 20 -40 90" stroke="#4a2a1a" strokeWidth={14} fill="none" strokeLinecap="round" />
  </g>
);

export const Rex: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const second = t > at(ctx, 1.4);
  const soft = ramp(t, at(ctx, 2), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="park" cx={cx - 120} floor={FLOOR} w={1300} />
      <Person who="boss" x={cx - 380} y={FLOOR} s={0.8} mood={second ? "kind" : "doubt"} pose={second && !soft ? "give" : "stand"} t={t} look={0.8} />
      <Bulldog x={cx - 150 + Math.sin(t * 0.8) * 30} y={FLOOR} s={0.75} t={t} />
      <Horse x={cx + 380} y={FLOOR} s={0.9} flip />
      <Person who="officer" x={cx + 360} y={FLOOR - 210} s={0.62} mood={soft > 0.5 ? "smile" : "tense"} pose={soft > 0.5 ? "wave" : "point"} t={t} flip look={0.6} />
      <Say t={t} from={at(ctx, 1)} to={at(ctx, 1.4)} x={cx + 220} y={250} text={"Без намордника?\nНарушение!"} tail={1} />
      <Say t={t} from={at(ctx, 1.5)} to={at(ctx, 2)} x={cx - 250} y={300} text={"Я виноват.\nЯ нарушил правило"} tail={-1} />
      <Say t={t} from={at(ctx, 2.05)} to={at(ctx, 3)} x={cx + 200} y={250} text={"Ну, когда рядом\nникого нет…"} tail={1} />
      <Appear t={t} at={at(ctx, 3)} x={cx} y={250}>
        <Label x={0} y={0} text="признание снимает оборону" size={36} bg={C.yellow} />
      </Appear>
      <Appear t={t} at={at(ctx, 3.3)} x={cx} y={330}>
        <Label x={0} y={0} text="но правило остаётся правилом" size={30} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="self" x={cx} y={150} />
      </g>
    </Drift>
  );
};

// ── Солнце и Ветер ──
export const SunWind: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const wind = ramp(t, at(ctx, 1.2), 0.6) * (1 - ramp(t, at(ctx, 2), 0.5));
  const sun = ramp(t, at(ctx, 2), 1);
  const coatOff = ramp(t, at(ctx, 2.4), 1);
  const walkerX = cx + 60 + Math.sin(t * 0.6) * 10;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="street" cx={cx + 400} floor={FLOOR} w={900} />
      {/* солнце */}
      <g transform={`translate(${cx + 420} ${230}) scale(${0.7 + 0.4 * sun})`} opacity={0.4 + 0.6 * sun}>
        {Array.from({ length: 12 }).map((_, i) => {
          const an = (i / 12) * Math.PI * 2 + t * 0.2;
          return <line key={i} x1={Math.cos(an) * 90} y1={Math.sin(an) * 90} x2={Math.cos(an) * 130} y2={Math.sin(an) * 130} stroke={C.yellow} strokeWidth={12} strokeLinecap="round" />;
        })}
        <circle r={80} fill={C.yellow} stroke={OL} strokeWidth={5} />
        <path d="M -30 10 Q 0 34 30 10" stroke={OL} strokeWidth={5} fill="none" />
        <circle cx={-26} cy={-14} r={7} fill={OL} />
        <circle cx={26} cy={-14} r={7} fill={OL} />
      </g>
      {/* ветер-облако */}
      <g transform={`translate(${cx - 360} ${250})`} opacity={0.35 + 0.65 * (1 - sun)}>
        <path d="M -120 20 Q -130 -40 -70 -40 Q -50 -90 10 -70 Q 70 -100 100 -40 Q 150 -30 130 20 Z" fill="#dfe6f5" stroke={OL} strokeWidth={5} />
        <circle cx={-20} cy={-20} r={7} fill={OL} />
        <circle cx={30} cy={-24} r={7} fill={OL} />
        <ellipse cx={70} cy={0} rx={18} ry={14} fill={OL} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${150 + ((t * 300 + i * 120) % 360)} ${-20 + i * 40} q 40 -12 80 0`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={wind} />
        ))}
      </g>
      <Person who="neighbor" x={walkerX} y={FLOOR} s={0.82} mood={wind > 0.3 ? "tense" : sun > 0.6 ? "happy" : "neutral"} pose={wind > 0.3 ? "hold" : coatOff > 0.5 ? "give" : "walk"} t={t} color={coatOff > 0.5 ? "#7ccf80" : "#5a4a7a"} item={coatOff > 0.5 ? <rect x={-30} y={0} width={60} height={90} rx={10} fill="#5a4a7a" stroke={OL} strokeWidth={4} /> : undefined} />
      <Appear t={t} at={at(ctx, 1.3)} x={cx - 360} y={420}>
        <Label x={0} y={0} text="сила" size={34} bg="#dfe6f5" />
      </Appear>
      <Appear t={t} at={at(ctx, 2.1)} x={cx + 420} y={420}>
        <Label x={0} y={0} text="тепло" size={34} bg={C.yellow} />
      </Appear>
      <Appear t={t} at={at(ctx, 2.6)} x={cx} y={150}>
        <Headline x={0} y={0} text="«Начинайте с дружеского тона»" size={48} color={C.yellow} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 1), 0.5) * (1 - ramp(t, at(ctx, 2.6), 0.4))}>
        <SourceChip kind="parable" x={cx} y={150} />
      </g>
    </Drift>
  );
};

// ── Цепочка общих фактов: моторы ──
export const YesSteps: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const steps = [
    { q: "Стандарт: +72 °F", at: 1.15 },
    { q: "В цехе: 75 °F", at: 1.6 },
    { q: "Итого: 147 °F", at: 2.1 },
  ];
  const ok = ramp(t, at(ctx, 2.5), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560} amount={0.03}>
      {/* мотор */}
      <Appear t={t} at={at(ctx, 0.3)} x={cx - 380} y={560}>
        <rect x={-150} y={-100} width={300} height={200} rx={30} fill="#8a96b0" stroke={OL} strokeWidth={5} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-130 + i * 70} y={-120} width={40} height={240} rx={10} fill="#a7b2c8" stroke={OL} strokeWidth={4} />
        ))}
        <circle cx={170} cy={0} r={30} fill="#5a6070" stroke={OL} strokeWidth={4} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-60 + i * 60} -140 q 14 ${-20 - Math.sin(t * 4 + i) * 6} 0 -50 q -14 -20 0 -50`} stroke={C.red} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7 * (1 - ok)} />
        ))}
      </Appear>
      {steps.map((s, i) => {
        const k = ramp(t, at(ctx, s.at), 0.5);
        if (k <= 0) return null;
        const y = 300 + i * 150;
        return (
          <g key={i} opacity={k} transform={`translate(${cx + 220 + (1 - k) * 40} ${y})`}>
            <rect x={-260} y={-52} width={520} height={104} rx={26} fill={C.paper} stroke={OL} strokeWidth={4} />
            <text x={-60} y={14} fontFamily={FONT} fontWeight={900} fontSize={40} fill={OL} textAnchor="middle">
              {s.q}
            </text>
            <g transform="translate(190 0)">
              <rect x={-52} y={-34} width={104} height={68} rx={34} fill={C.green} stroke={OL} strokeWidth={4} />
              <text y={14} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill="#fff" textAnchor="middle">
                да
              </text>
            </g>
          </g>
        );
      })}
      <Arrow x1={cx + 220} y1={352} x2={cx + 220} y2={398} k={ramp(t, at(ctx, 1.6), 0.3)} w={8} />
      <Arrow x1={cx + 220} y1={502} x2={cx + 220} y2={548} k={ramp(t, at(ctx, 2.1), 0.3)} w={8} />
      <Appear t={t} at={at(ctx, 2.5)} x={cx - 380} y={760}>
        <Label x={0} y={0} text="моторы в норме" size={36} bg={C.yellow} />
      </Appear>
      <Check x={cx - 380} y={330} s={60} k={ok} />
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="student" x={cx} y={150} />
      </g>
    </Drift>
  );
};

// ── Незаконченные эскизы ──
export const Sketches: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const second = t > at(ctx, 1);
  const refuse = Array.from({ length: 5 }).map((_, i) => ramp(t, at(ctx, 0.3) + i * 0.25, 0.3));
  const help = ramp(t, at(ctx, 1.4), 1.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="office" cx={cx} floor={FLOOR} w={1300} />
      <Person who="student" x={cx - 400} y={FLOOR} s={0.8} mood={second ? "kind" : "doubt"} pose={second ? "give" : "hold"} t={t} look={0.8} />
      <Person who="expert" x={cx + 380} y={FLOOR} s={0.8} mood={help > 0.5 ? "happy" : second ? "think" : "tense"} pose={help > 0.3 ? "point" : second ? "think" : "stop"} t={t} flip look={0.8} />
      {!second &&
        refuse.map((k, i) => (
          <g key={i} opacity={k}>
            <Label x={cx - 40 + (i % 3) * 120 - 120} y={260 + Math.floor(i / 3) * 80} text="нет" size={32} bg="#ffd6d6" border="#b23f3f" />
          </g>
        ))}
      {second && (
        <g>
          <Paper x={cx - 20} y={430} w={300} h={340} rot={-4} ink={0.4 + 0.6 * help} color="#3d6fd0" title="эскиз" size={30} />
          <Appear t={t} at={at(ctx, 1.1)} x={cx + 120} y={240}>
            <Bubble x={0} y={0} text={"Как бы вы\nдоработали?"} size={32} tail={-1} />
          </Appear>
          <Appear t={t} at={at(ctx, 2)} x={cx} y={680}>
            <Label x={0} y={0} text="«Он покупает»" size={36} bg={C.yellow} />
          </Appear>
          <Appear t={t} at={at(ctx, 2.4)} x={cx} y={760}>
            <Label x={0} y={0} text="соавторство, а не фокус" size={30} />
          </Appear>
        </g>
      )}
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="student" x={cx} y={150} />
      </g>
    </Drift>
  );
};

// ── Костры в парке ──
export const Bonfire: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const order = t > at(ctx, 1) && t < at(ctx, 2);
  const kind = t >= at(ctx, 2);
  const leave = ramp(t, at(ctx, 1.45), 0.6) * (1 - ramp(t, at(ctx, 2), 0.6));
  const fire = order ? 1 - ramp(t, at(ctx, 1.1), 0.4) * (1 - ramp(t, at(ctx, 1.6), 0.4)) : kind ? 1 - ramp(t, at(ctx, 2.7), 1) : 1;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="park" cx={cx + 380} floor={FLOOR} w={1300} />
      <Campfire x={cx + 60} y={FLOOR - 10} s={1} t={t} fire={fire} />
      <Person who="kid" x={cx + 280} y={FLOOR} s={0.88} mood={order ? "tense" : kind ? "smile" : "happy"} pose={kind && t > at(ctx, 2.7) ? "give" : "stand"} t={t} flip look={0.6} />
      <Person who="kid" x={cx + 430} y={FLOOR} s={0.84} mood={order ? "doubt" : kind ? "happy" : "happy"} pose="stand" t={t} flip seed={4} look={0.6} color="#5fbf8a" />
      <Person who="boss" x={cx - 360 - leave * 400} y={FLOOR} s={0.8} mood={order ? "tense" : "kind"} pose={order && leave < 0.1 ? "point" : leave > 0.05 && leave < 0.95 ? "walk" : kind ? "wave" : "stand"} t={t} look={0.8} />
      <Say t={t} from={at(ctx, 1.05)} to={at(ctx, 1.45)} x={cx - 160} y={300} text={"Потушить!\nИли полиция!"} tail={-1} />
      <Say t={t} from={at(ctx, 2.05)} to={at(ctx, 2.6)} x={cx - 160} y={300} text={"Привет, ребята!\nХорошо проводите время?"} tail={-1} size={32} />
      <Say t={t} from={at(ctx, 2.6)} to={at(ctx, 3.1)} x={cx - 160} y={300} text={"Я тоже любил костры.\nЗасыпьте огонь землёй?"} tail={-1} size={32} />
      <Appear t={t} at={at(ctx, 3.1)} x={cx} y={240}>
        <Label x={0} y={0} text="правило осталось — обида ушла" size={36} bg={C.yellow} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="self" x={cx} y={150} />
      </g>
    </Drift>
  );
};

// ── 32 баночки крема ──
export const Jars: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const second = t > at(ctx, 1);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="office" cx={cx} floor={FLOOR} w={1300} />
      <Person who="seller" x={cx - 420} y={FLOOR} s={0.8} mood={second ? "smile" : "tense"} pose={second ? "point" : "point"} t={t} look={0.8} />
      <Person who="boss" x={cx + 420} y={FLOOR} s={0.8} mood={second && t > at(ctx, 1.6) ? "happy" : "tense"} pose={second && t > at(ctx, 1.6) ? "point" : "arms"} t={t} flip look={0.6} />
      {!second && (
        <>
          <Bubble x={cx - 200} y={300} text={"Мой метод верен!"} size={34} tail={-1} />
          <Bubble x={cx + 220} y={380} text={"Нет, мой!"} size={34} tail={1} />
          <Appear t={t} at={at(ctx, 0.8)} x={cx} y={520}>
            <Label x={0} y={0} text="спор выигран — результата нет" size={32} bg="#ffd6d6" border="#b23f3f" />
          </Appear>
        </>
      )}
      {second && (
        <g>
          <rect x={cx - 330} y={690} width={660} height={26} rx={10} fill={C.woodLight} stroke={OL} strokeWidth={4} />
          {Array.from({ length: 32 }).map((_, i) => {
            const k = ramp(t, at(ctx, 1.1) + i * 0.035, 0.3);
            if (k <= 0) return null;
            const col = i % 8;
            const row = Math.floor(i / 8);
            return (
              <g key={i} opacity={k} transform={`translate(0 ${(1 - k) * -40})`}>
                <JarCream x={cx - 280 + col * 80} y={690 - row * 76} s={0.85} color={[Y.color, "#ff9fb8", "#9fd0ff", "#b7e3a0"][row]} label={String(10 + ((i * 7) % 89))} />
              </g>
            );
          })}
          <Appear t={t} at={at(ctx, 2)} x={cx} y={300}>
            <Headline x={0} y={0} text="те же факты — наглядно" size={48} color={C.yellow} />
          </Appear>
          <Appear t={t} at={at(ctx, 2.4)} x={cx} y={370}>
            <Label x={0} y={0} text="ярко — но только правду" size={32} />
          </Appear>
        </g>
      )}
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="student" x={cx} y={150} />
      </g>
    </Drift>
  );
};

// ── Мел на полу ──
export const Chalk: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const nums = [
    { n: "6", at: at(ctx, 1.6) },
    { n: "7", at: at(ctx, 2.25) },
    { n: "10", at: at(ctx, 2.6) },
  ];
  let cur = -1;
  nums.forEach((x, i) => {
    if (t >= x.at) cur = i;
  });
  const shout = t > at(ctx, 0.4) && t < at(ctx, 1);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600} amount={0.03}>
      <Setting name="factory" cx={cx} floor={FLOOR} w={1300} />
      {/* пол цеха — «доска» для мела */}
      <path d={`M ${cx - 420} ${FLOOR + 10} L ${cx + 420} ${FLOOR + 10} L ${cx + 300} ${FLOOR - 170} L ${cx - 300} ${FLOOR - 170} Z`} fill="#4a4652" stroke={OL} strokeWidth={5} />
      {cur >= 0 && (
        <g key={cur} opacity={ramp(t, nums[cur].at, 0.3)}>
          <text x={cx} y={FLOOR - 30} fontFamily={DISPLAY} fontWeight={800} fontSize={150} fill="#f4f4f4" textAnchor="middle" transform={`skewX(-8)`} style={{ transformOrigin: `${cx}px ${FLOOR - 60}px` }}>
            {nums[cur].n}
          </text>
        </g>
      )}
      <Person who="boss" x={cx - 520} y={FLOOR} s={0.78} mood={shout ? "tense" : "smile"} pose={shout ? "point" : t > at(ctx, 1.5) && t < at(ctx, 2) ? "give" : "stand"} t={t} look={0.8} />
      <Person who="neighbor" x={cx + 470} y={FLOOR} s={0.78} mood={cur >= 1 ? "happy" : shout ? "doubt" : "think"} pose={cur >= 2 ? "wave" : "stand"} t={t} flip look={0.4} />
      <Say t={t} from={at(ctx, 0.4)} to={at(ctx, 1)} x={cx - 360} y={290} text={"Уволю всех!"} tail={-1} />
      <Appear t={t} at={at(ctx, 2.25)} x={cx + 300} y={260}>
        <Label x={0} y={0} text="ночная смена" size={30} />
      </Appear>
      <Appear t={t} at={at(ctx, 2.6)} x={cx - 300} y={260}>
        <Label x={0} y={0} text="дневная смена" size={30} />
      </Appear>
      <Appear t={t} at={at(ctx, 3.05)} x={cx} y={360}>
        <Card x={0} y={0} w={760} h={130} lines={["вызов — свой рекорд,", "а не стыд и давление"]} size={36} edge={C.green} />
      </Appear>
      <g opacity={ramp(t, at(ctx, 0.1), 0.5)}>
        <SourceChip kind="history" x={cx} y={150} />
      </g>
    </Drift>
  );
};
