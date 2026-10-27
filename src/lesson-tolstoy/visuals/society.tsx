// Свет 1805 года: салон как прядильная мастерская, двое чужих, борьба за
// наследство, Ростовы без денег, две валюты эпохи, «обстоятельства сильнее нас».
import React from "react";
import { C, HERO } from "../theme";
import { Big, Chip, Hero, House, Label, Note, Person, Stage, rnd } from "./draw";
import { at, pop, ramp, wob, type VisualProps } from "./kit";

// ── s01: салон Шерер — веретёна разговора ──
export const SalonSpindles: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const groups = [
    { x: 300, y: 430, c: C.violet },
    { x: 640, y: 330, c: C.sky },
    { x: 980, y: 430, c: C.pink },
  ];
  const sp = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      <Chip x={640} y={170} text="ПЕТЕРБУРГ · ИЮЛЬ 1805" k={pop(t, 0.2)} />
      {groups.map((g, i) => (
        <g key={i} opacity={ramp(t, 0.3 + i * 0.3, 0.6)}>
          <ellipse cx={g.x} cy={g.y + 150} rx={170} ry={36} fill={g.c} opacity={0.15} />
          {[0, 1, 2].map((j) => (
            <Person key={j} x={g.x - 90 + j * 90} y={g.y + 150} s={0.62} color={g.c} dress={j === 1 ? "dress" : "frock"} />
          ))}
          {/* веретено над группой — крутится ровно */}
          {sp > 0 && (
            <g transform={`translate(${g.x} ${g.y - 40})`} opacity={sp}>
              <ellipse rx={18} ry={60} fill={C.paper} transform={`rotate(${t * 90 + i * 30})`} />
              <line y1={-80} y2={80} stroke={C.paperDark} strokeWidth={6} />
            </g>
          )}
        </g>
      ))}
      <Person x={640} y={780} s={0.8} color={C.gold} dress="dress" label="Анна Павловна" labelColor={C.gold} />
      <g opacity={ramp(t, at(c, 1), 0.6)}>
        <rect x={190} y={600} width={900} height={70} rx={20} fill={C.paper} />
        <text x={640} y={646} textAnchor="middle" fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={30} fill={C.inkBrown}>
          «Ну, князь, Генуя и Лукка — поместья фамилии Бонапарте»
        </text>
      </g>
      <Note x={640} y={842} text="перевод из примечаний издания" o={ramp(t, at(c, 1) + 0.4, 0.6)} />
    </Stage>
  );
};

// ── s02: двое чужих — Пьер и Андрей ──
export const TwoOutsiders: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const crowd = Array.from({ length: 10 }).map((_, i) => ({ x: 120 + i * 112, s: 0.5 }));
  const kA = ramp(t, at(c, 1), 0.7);
  return (
    <Stage host={c.p.host}>
      {crowd.map((p, i) => (
        <Person key={i} x={p.x} y={420} s={p.s} color="#56607f" dress={i % 3 === 0 ? "dress" : "frock"} o={0.8} />
      ))}
      <g transform={`translate(0 ${wob(t, 1, 3)})`}>
        <Hero id="pierre" x={420} y={760} s={1} />
        <Label x={420} y={480} text="защищает Наполеона" color={HERO.pierre} size={28} k={pop(t, 0.8)} />
      </g>
      <g opacity={kA}>
        <Hero id="andrei" x={860} y={760} s={1} />
        <Label x={860} y={480} text="«эта жизнь — не по мне!»" color={HERO.andrei} size={28} k={pop(t, at(c, 1) + 1.2)} />
        <path d={`M 940 640 L ${940 + 260 * ramp(t, at(c, 1) + 1.6, 1)} 640`} stroke={HERO.andrei} strokeWidth={10} strokeLinecap="round" strokeDasharray="20 14" />
      </g>
    </Stage>
  );
};

// ── s03: мозаиковый портфель — тянут в две стороны ──
export const PortfolioTug: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const tug = Math.sin(t * 5) * 18 * ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 2), 0.5));
  const won = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      <Big x={640} y={230} text="«Сорок тысяч душ и миллионы»" size={52} color={C.gold} k={pop(t, 0.4)} serif />
      <Person x={330 + tug} y={760} s={0.95} color={C.violet} dress="dress" lean={-12} />
      <Person x={950 + tug} y={760} s={0.95} color={C.coral} dress="dress" lean={12} flip />
      <g transform={`translate(${640 + tug} ${560})`}>
        <rect x={-110} y={-70} width={220} height={140} rx={14} fill="#7a4e2a" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={-90 + (i % 6) * 30} y={-50 + Math.floor(i / 6) * 50} width={24} height={40} rx={4} fill={[C.gold, C.sky, C.coral, C.green][i % 4]} opacity={0.85} />
        ))}
        <line x1={-110} y1={0} x2={-250} y2={30} stroke="#b9a57e" strokeWidth={8} />
        <line x1={110} y1={0} x2={250} y2={30} stroke="#b9a57e" strokeWidth={8} />
      </g>
      {won > 0 && (
        <g opacity={won}>
          <Hero id="pierre" x={640} y={850} s={0.7} label="Пьер — наследник" />
        </g>
      )}
    </Stage>
  );
};

// ── s04: дом Ростовых: тепло, но деньги утекают ──
export const RostovHouse: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const coins = Array.from({ length: 10 }).map((_, i) => {
    const life = (t * 0.35 + rnd(i + 4)) % 1;
    return { x: 520 + rnd(i) * 240, y: 520 + life * 300, o: 1 - life };
  });
  const kids = ramp(t, at(c, 1), 0.6);
  return (
    <Stage host={c.p.host}>
      <House x={640} y={520} s={1.6} light={1} color="#4a3550" />
      {coins.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={14} fill={C.yellow} stroke={C.yellowDeep} strokeWidth={4} opacity={p.o * ramp(t, 0.6, 0.6)} />
      ))}
      <Label x={640} y={180} text="«Ах, деньги, граф, деньги…»" color={C.paper} size={32} k={pop(t, 1)} />
      <g opacity={kids}>
        <Hero id="natasha" x={250} y={800} s={0.7} />
        <Hero id="nikolai" x={1030} y={800} s={0.7} />
        <Hero id="sonya" x={1170} y={800} s={0.7} label="Соня" />
        <Label x={1170} y={600} text="бесприданница" color={HERO.sonya} size={24} k={pop(t, at(c, 1) + 1.8)} />
      </g>
    </Stage>
  );
};

// ── s05: две валюты — слава и деньги ──
export const TwoCurrencies: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k1 = pop(t, 0.3);
  const k2 = pop(t, 0.9);
  const tilt = Math.sin(t * 1.2) * 6;
  return (
    <Stage host={c.p.host}>
      <g transform={`translate(640 300) rotate(${tilt})`}>
        <line x1={-360} y1={0} x2={360} y2={0} stroke={C.paperDark} strokeWidth={12} strokeLinecap="round" />
        <circle r={16} fill={C.paperDark} />
      </g>
      <line x1={640} y1={300} x2={640} y2={760} stroke={C.paperDark} strokeWidth={14} />
      <g transform={`translate(${280} ${330 - tilt * 6}) scale(${k1})`}>
        <circle r={110} fill={C.gold} stroke={C.yellowDeep} strokeWidth={10} />
        <path d="M 0 -60 L 16 -18 L 60 -18 L 24 10 L 38 54 L 0 28 L -38 54 L -24 10 L -60 -18 L -16 -18 Z" fill={C.white} />
        <text y={170} textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight={900} fontSize={48} fill={C.gold}>
          СЛАВА
        </text>
      </g>
      <g transform={`translate(${1000} ${330 + tilt * 6}) scale(${k2})`}>
        <circle r={110} fill={C.yellow} stroke={C.amber} strokeWidth={10} />
        <text y={34} textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight={900} fontSize={96} fill={C.night}>
          ₽
        </text>
        <text y={170} textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight={900} fontSize={48} fill={C.yellow}>
          ДЕНЬГИ
        </text>
      </g>
      <Label x={640} y={808} text="чего они стоят?" color={C.cyan} size={34} k={pop(t, at(c, 1) + 1)} />
    </Stage>
  );
};

// ── s06: смотр под Браунау — разбитые сапоги и бумажный план ──
export const BootsReview: React.FC<VisualProps> = (c) => {
  const { t } = c;
  return (
    <Stage host={c.p.host}>
      <Chip x={640} y={170} text="АВСТРИЯ · ОСЕНЬ 1805" k={pop(t, 0.2)} />
      {Array.from({ length: 7 }).map((_, i) => (
        <g key={i} transform={`translate(${200 + i * 140} 560)`} opacity={ramp(t, 0.3 + i * 0.12, 0.5)}>
          <Person x={0} y={0} s={0.7} color="#7e8db4" dress="uniform" hat="shako" />
          {/* сапог с дырой */}
          <path d="M -26 10 L 4 10 L 18 24 L -26 24 Z" fill="#4a3826" />
          <circle cx={-6} cy={18} r={5} fill={C.paper} />
        </g>
      ))}
      <Hero id="kutuzov" x={640} y={830} s={0.75} />
      <g opacity={ramp(t, at(c, 1), 0.6)}>
        <rect x={180} y={220} width={920} height={110} rx={20} fill={C.paper} />
        <text x={640} y={290} textAnchor="middle" fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={40} fill={C.inkBrown}>
          «обстоятельства бывают сильнее нас»
        </text>
      </g>
      <Note x={640} y={842} text="Кутузов — австрийскому генералу (т. I, ч. II, гл. 3)" o={ramp(t, at(c, 1) + 0.4, 0.6)} />
    </Stage>
  );
};
