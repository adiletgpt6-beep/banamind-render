// Князь Андрей: мечта о «Тулоне», батарея Тушина, башенные часы истории,
// диспозиция и туман, высокое небо, маленький Наполеон, свеча, случайный орден, дуб.
import React from "react";
import { C, HERO } from "../theme";
import { Big, BigArrow, Candle, Chip, DotNet, Flame, Hero, HighSky as SkyArt, Label, Note, Oak, PaperMap, Person, QuoteCard, Smoke, Stage, Stars } from "./draw";
import { at, pop, ramp, wob, type VisualProps } from "./kit";

// ── a01: мечта о своём Тулоне — луч прожектора на одну фигуру ──
export const ToulonDream: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const beam = ramp(t, 0.3, 1);
  return (
    <Stage host={c.p.host}>
      <Stars x={60} y={140} w={1160} h={420} n={36} seed={3} o={0.7} />
      <path d={`M 560 120 L 720 120 L ${900} 820 L ${380} 820 Z`} fill={C.gold} opacity={0.2 * beam} />
      {Array.from({ length: 16 }).map((_, i) => (
        <Person key={i} x={120 + i * 70 + (i > 7 ? 260 : 0)} y={820} s={0.42} color="#4c5677" dress="uniform" o={0.8} />
      ))}
      <g transform={`translate(0 ${-ramp(t, 0.6, 1.4) * 40})`}>
        <Hero id="andrei" x={640} y={800} s={1.05} arm={ramp(t, 1, 0.8)} />
      </g>
      <Big x={640} y={240} text="«свой Тулон»" size={70} color={C.gold} k={pop(t, 0.9)} serif />
      <Label x={640} y={360} text="«…как только славу, любовь людскую»" color={C.paper} size={28} k={pop(t, at(c, 1) + 0.6)} />
    </Stage>
  );
};

// ── a02: Шёнграбен — забытая батарея из четырёх пушек ──
const Cannon: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-10} y={-30} width={110} height={30} rx={14} fill="#3b3f52" transform="rotate(-12)" />
    <circle cx={0} cy={6} r={30} fill="none" stroke="#6b4a2f" strokeWidth={10} />
    <circle cx={0} cy={6} r={6} fill="#6b4a2f" />
  </g>
);

export const TushinBattery: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const credit = ramp(t, at(c, 2), 0.8);
  const truth = ramp(t, at(c, 3), 0.8);
  return (
    <Stage host={c.p.host}>
      <PaperMap x={60} y={150} w={1160} h={380} seed={9} river={false}>
        <Chip x={580} y={50} text="ШЁНГРАБЕН · 1805" />
        {[0, 1, 2, 3].map((i) => (
          <Cannon key={i} x={460 + i * 90} y={250} s={0.8} />
        ))}
        <Smoke x={300} y={260} t={t} seed={2} s={0.8} />
        <Flame x={180} y={300} s={0.7} t={t} />
        <Label x={590} y={340} text="4 пушки держат центр" color={C.amber} size={26} />
      </PaperMap>
      {/* сцена в избе: кто получил похвалу */}
      <g opacity={ramp(t, at(c, 1), 0.7)}>
        <Person x={240} y={830} s={0.7} color="#8c99b8" dress="uniform" />
        <Person x={380} y={830} s={0.7} color="#8c99b8" dress="uniform" />
        <Label x={310} y={600} text="красивый рапорт" color={C.paper} size={26} />
        <Person x={760} y={830} s={0.62} color={C.amber} dress="uniform" label="Тушин" labelColor={C.amber} lean={8} />
      </g>
      {credit > 0 && <BigArrow x1={1060} y1={720} x2={830} y2={720} k={credit} w={18} color={HERO.andrei} />}
      <g opacity={credit}>
        <Hero id="andrei" x={1120} y={830} s={0.62} label={false} />
      </g>
      <Label x={940} y={600} text="«непохоже на то, чего он надеялся»" color={HERO.andrei} size={24} k={truth} />
    </Stage>
  );
};

// ── a08: башенные часы истории ──
export const TowerClock: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const gears = [
    { x: 330, y: 380, r: 90, n: 12, sp: 0.6 },
    { x: 470, y: 520, r: 60, n: 9, sp: -0.9 },
    { x: 300, y: 620, r: 70, n: 10, sp: 0.8 },
    { x: 520, y: 330, r: 50, n: 8, sp: -1.1 },
    { x: 420, y: 720, r: 45, n: 8, sp: 1.2 },
  ];
  const hand = ramp(t, at(c, 1), 6) * 0.5;
  return (
    <Stage host={c.p.host}>
      {gears.map((g, i) => (
        <g key={i} transform={`translate(${g.x} ${g.y}) rotate(${(t * g.sp * 40) % 360})`} opacity={ramp(t, 0.2 + i * 0.2, 0.5)}>
          <circle r={g.r} fill="none" stroke={C.steel} strokeWidth={14} />
          {Array.from({ length: g.n }).map((_, j) => (
            <rect key={j} x={-7} y={-g.r - 22} width={14} height={22} fill={C.steel} transform={`rotate(${(j * 360) / g.n})`} />
          ))}
          <circle r={10} fill={C.steel} />
        </g>
      ))}
      <DotNet x={170} y={170} w={440} h={640} n={60} seed={12} k={ramp(t, 0.8, 1.6)} r={5} arrows={0.8} />
      <g transform="translate(920 470)">
        <circle r={230} fill={C.paper} stroke={C.gold} strokeWidth={14} />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={-4} y={-210} width={8} height={30} fill={C.inkBrown} transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-180} stroke={C.inkBrown} strokeWidth={12} strokeLinecap="round" transform={`rotate(${hand * 30 + 10})`} />
        <circle r={14} fill={C.inkBrown} />
      </g>
      <Label x={920} y={780} text="160 000 людей → одна стрелка" color={C.gold} size={28} k={pop(t, at(c, 1) + 1)} />
    </Stage>
  );
};

// ── a03: диспозиция по-немецки, спящий Кутузов, туман ──
export const DispositionFog: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fog = ramp(t, at(c, 3), 1.6);
  const scroll = ramp(t, 0.2, 1.2);
  return (
    <Stage host={c.p.host}>
      <Chip x={640} y={170} text="АУСТЕРЛИЦ · НОЯБРЬ 1805" k={pop(t, 0.2)} />
      <g transform={`translate(160 ${220})`}>
        <rect width={560} height={480 * scroll} rx={14} fill={C.paper} />
        {scroll > 0.9 &&
          Array.from({ length: 11 }).map((_, i) => (
            <text key={i} x={30} y={56 + i * 38} fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={24} fill={C.inkBrown} opacity={0.85}>
              {["Die erste Kolonne marschiert…", "Die zweite Kolonne marschiert…", "Die dritte Kolonne marschiert…"][i % 3]}
            </text>
          ))}
      </g>
      <g opacity={ramp(t, at(c, 1), 0.6)}>
        <Hero id="kutuzov" x={940} y={720} s={0.95} lean={14} />
        {[0, 1, 2].map((i) => (
          <text key={i} x={1010 + i * 34} y={420 - i * 40 - ((t * 20) % 30)} fontFamily="Rubik, sans-serif" fontWeight={900} fontSize={34 + i * 8} fill={C.sky} opacity={0.85}>
            z
          </text>
        ))}
      </g>
      <Label x={940} y={810} text="«сражение будет проиграно»" color={HERO.kutuzov} size={24} k={pop(t, at(c, 1) + 1.4)} />
      <Label x={640} y={300} text="«не на Царицыном Лугу»" color={C.paper} size={30} k={pop(t, at(c, 2) + 1) * (1 - fog)} />
      {fog > 0 && (
        <g opacity={fog * 0.9}>
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse key={i} cx={100 + i * 140 + Math.sin(t * 0.5 + i) * 20} cy={560 + (i % 3) * 70} rx={220} ry={60} fill="#dfe6f2" opacity={0.75} />
          ))}
        </g>
      )}
    </Stage>
  );
};

// ── a04: высокое небо ──
export const HighSky: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const look = ramp(t, at(c, 1), 1.4);
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - look * 0.8}>
        <Smoke x={300} y={700} t={t} seed={4} />
        <Smoke x={900} y={720} t={t} seed={8} />
        <Hero id="andrei" x={640} y={800} s={0.9} arm={1} label={false} />
        <g transform={`translate(720 ${560})`}>
          <line x1={0} y1={0} x2={0} y2={-220} stroke="#6b4a2f" strokeWidth={8} />
          <path d={`M 0 -220 L ${120 + wob(t, 2, 6)} -190 L 0 -150 Z`} fill={C.russian} />
        </g>
      </g>
      <g opacity={look}>
        <SkyArt x={60} y={140} w={1160} h={720} t={t} />
      </g>
      <QuoteCard x={170} y={560} w={940} text={"«Как же я не видал прежде\nэтого высокого неба?»"} who="князь Андрей · т. I, ч. III, гл. 16" k={ramp(t, at(c, 1) + 0.6, 0.7)} size={40} />
      <Label x={640} y={180} text="не ясное, но неизмеримо высокое" color={C.white} size={28} k={pop(t, at(c, 2) + 0.4)} />
    </Stage>
  );
};

// ── a05: маленький Наполеон под огромным небом ──
export const SmallNapoleon: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const shrink = ramp(t, at(c, 1), 2);
  return (
    <Stage host={c.p.host}>
      <SkyArt x={60} y={140} w={1160} h={560} t={t} />
      <rect x={60} y={660} width={1160} height={180} rx={20} fill="#3c5a3a" />
      <g transform={`translate(760 ${780}) scale(${1.1 - shrink * 0.65})`}>
        <Hero id="napoleon" x={0} y={0} s={1} label={false} />
      </g>
      <Hero id="andrei" x={420} y={800} s={0.75} lean={-80} label={false} />
      <Label x={760} y={260} text="«Вот прекрасная смерть»" color={C.paper} size={34} k={pop(t, 0.8) * (1 - shrink * 0.6)} />
      <Note x={760} y={320} text="перевод из примечаний" color={C.night} o={ramp(t, 1.2, 0.5) * (1 - shrink * 0.6)} />
      <Label x={640} y={440} text="маленький, ничтожный человек" color={HERO.andrei} size={32} k={pop(t, at(c, 1) + 1.6)} />
    </Stage>
  );
};

// ── a06: свеча в окне — ночь родов ──
export const CandleWindow: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const out = ramp(t, at(c, 0) + 2.6, 1.2);
  return (
    <Stage host={c.p.host}>
      <rect x={300} y={180} width={680} height={560} rx={24} fill="#16203f" stroke="#6b5a3e" strokeWidth={16} />
      <line x1={640} y1={180} x2={640} y2={740} stroke="#6b5a3e" strokeWidth={12} />
      <line x1={300} y1={460} x2={980} y2={460} stroke="#6b5a3e" strokeWidth={12} />
      <Stars x={320} y={200} w={640} h={240} n={18} seed={21} o={0.8} />
      <Candle x={520} y={720} t={t} lit={1} />
      <Candle x={760} y={720} t={t} lit={1 - out} />
      <Label x={640} y={808} text="«что вы со мной сделали?»" color={C.paper} size={30} k={pop(t, at(c, 1) + 0.6)} />
    </Stage>
  );
};

// ── a09: Тильзит — орден по случайности строя ──
export const RandomMedal: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const pick = ramp(t, at(c, 0) + 3, 0.8);
  return (
    <Stage host={c.p.host}>
      <Chip x={640} y={170} text="ТИЛЬЗИТ · 1807" k={pop(t, 0.2)} />
      {Array.from({ length: 9 }).map((_, i) => (
        <g key={i} transform={`translate(${180 + i * 115} ${640 - (i === 0 ? pick * 40 : 0)})`}>
          <Person x={0} y={0} s={0.66} color={i === 0 ? C.amber : "#7e8db4"} dress="uniform" hat="shako" label={i === 0 ? "первый по ранжиру" : undefined} labelColor={C.amber} />
        </g>
      ))}
      {pick > 0 && (
        <g transform={`translate(180 ${410 - pick * 20}) scale(${pick})`}>
          <path d="M 0 -50 L 14 -16 L 50 -16 L 22 6 L 32 42 L 0 20 L -32 42 L -22 6 L -50 -16 L -14 -16 Z" fill={C.white} stroke={C.gold} strokeWidth={6} />
        </g>
      )}
      <QuoteCard x={430} y={300} w={800} text={"«Для чего же оторванные руки,\nноги, убитые люди?»"} who="мысль Николая Ростова · т. II, ч. II" k={ramp(t, at(c, 1) + 1.4, 0.7)} size={34} />
    </Stage>
  );
};

// ── a07: дуб голый → в листве ──
export const OakSeasons: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const night = ramp(t, at(c, 1), 0.6) * (1 - ramp(t, at(c, 2), 0.6));
  const green = ramp(t, at(c, 2), 2.2);
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={140} width={1160} height={720} rx={28} fill={night > 0.5 ? "#101a3a" : green > 0 ? "#bfe3c7" : "#c9cdd6"} opacity={0.35} />
      {night > 0 && (
        <g opacity={night}>
          <Stars x={80} y={160} w={1120} h={300} n={30} seed={8} />
          <circle cx={1040} cy={250} r={60} fill="#fff6d8" />
          <rect x={160} y={360} width={260} height={300} rx={14} fill="#2a2440" stroke={C.amber} strokeWidth={6} />
          <rect x={190} y={390} width={200} height={240} rx={8} fill={C.amber} opacity={0.5} />
          <Hero id="natasha" x={290} y={640} s={0.6} label={false} />
          <Label x={290} y={320} text="«…никогда не бывало»" color={HERO.natasha} size={24} />
        </g>
      )}
      <g opacity={1 - night * 0.7}>
        <Oak x={720} y={820} s={1.15} green={green} />
      </g>
      <Label x={720} y={200} text="«жизнь кончена»" color="#9aa3b5" size={30} k={pop(t, 0.6) * (1 - green)} />
      <Label x={720} y={200} text="«Нет, жизнь не кончена в тридцать один год»" color={C.green} size={30} k={pop(t, at(c, 2) + 1.2)} />
    </Stage>
  );
};
