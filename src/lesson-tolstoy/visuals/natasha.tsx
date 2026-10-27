// Наташа: первый бал, год ожидания, пляска, опера-«картон», чужой сценарий,
// срыв побега, комета, «выбор не равен готовности»; семьи и долг.
import React from "react";
import { C, HERO } from "../theme";
import { Chip, Hero, House, Label, Person, QuoteCard, Stage, Stars, rnd } from "./draw";
import { at, pop, ramp, type VisualProps } from "./kit";

// ── n01: первый бал — одна пара закружилась ──
export const BallWaltz: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const spin = ramp(t, at(c, 1) + 1.5, 0.8);
  return (
    <Stage host={c.p.host}>
      <Chip x={640} y={170} text="КАНУН 1810 ГОДА" k={pop(t, 0.2)} />
      <ellipse cx={640} cy={720} rx={560} ry={120} fill="#3a2f55" opacity={0.6} />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + t * 0.5;
        return (
          <g key={i} transform={`translate(${640 + Math.cos(a) * 430} ${700 + Math.sin(a) * 90})`} opacity={0.7}>
            <Person x={-22} y={0} s={0.42} color="#7a83a6" dress="uniform" />
            <Person x={22} y={0} s={0.42} color="#b9a0d8" dress="dress" />
          </g>
        );
      })}
      <g transform={`translate(${640 + Math.cos(t * 1.4) * 60 * spin} ${640 + Math.sin(t * 1.4) * 20 * spin})`}>
        <Hero id="andrei" x={-50} y={0} s={0.85} label={spin > 0 ? "Андрей" : false} />
        <Hero id="natasha" x={50} y={0} s={0.85} />
      </g>
      <Label x={360} y={330} text="никто не приглашает" color={C.dim} size={26} k={pop(t, 0.9) * (1 - spin)} />
      <Label x={940} y={330} text="Пьер просит Андрея" color={HERO.pierre} size={26} k={pop(t, at(c, 1) + 0.3)} />
      <Label x={640} y={260} text="ожил и помолодел" color={HERO.andrei} size={30} k={pop(t, at(c, 1) + 2.2)} />
    </Stage>
  );
};

// ── n02: год ожидания — тяжёлая гиря на весах ──
export const YearScale: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const w = ramp(t, at(c, 0) + 2, 1);
  const tilt = 14 * w;
  return (
    <Stage host={c.p.host}>
      <g transform={`translate(640 330) rotate(${tilt})`}>
        <line x1={-380} y1={0} x2={380} y2={0} stroke={C.paperDark} strokeWidth={12} strokeLinecap="round" />
        <g transform="translate(-380 0)">
          <line y2={110} stroke={C.paperDark} strokeWidth={4} />
          <Hero id="andrei" x={-60} y={240} s={0.55} label={false} />
          <Hero id="natasha" x={60} y={240} s={0.55} label={false} />
        </g>
        <g transform="translate(380 0)">
          <line y2={110} stroke={C.paperDark} strokeWidth={4} />
          {w > 0 && (
            <g transform={`translate(0 ${170}) scale(${w})`}>
              <path d="M -80 60 L -60 -40 L 60 -40 L 80 60 Z" fill="#3b3f52" />
              <circle cy={-60} r={22} fill="none" stroke="#3b3f52" strokeWidth={10} />
              <text y={38} textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight={900} fontSize={44} fill={C.white}>
                ГОД
              </text>
            </g>
          )}
        </g>
      </g>
      <line x1={640} y1={330} x2={640} y2={760} stroke={C.paperDark} strokeWidth={14} />
      <Hero id="oldPrince" x={1080} y={800} s={0.7} arm={0.6} />
      <Label x={640} y={812} text="«Я умру, дожидаясь года»" color={HERO.natasha} size={30} k={pop(t, at(c, 1) + 2)} />
    </Stage>
  );
};

// ── n03: пляска у дядюшки — волна из точек ──
export const FolkDance: React.FC<VisualProps> = (c) => {
  const { t } = c;
  return (
    <Stage host={c.p.host}>
      <rect x={200} y={300} width={880} height={480} rx={24} fill="#3f2c2a" opacity={0.7} />
      {Array.from({ length: 26 }).map((_, i) => {
        const x = 240 + i * 32;
        const y = 330 + Math.sin(t * 4 + i * 0.5) * 30;
        return <circle key={i} cx={x} cy={y} r={7} fill={[C.pink, C.yellow, C.coral, C.green][i % 4]} />;
      })}
      <g transform={`translate(640 ${760 - Math.abs(Math.sin(t * 4)) * 16}) rotate(${Math.sin(t * 4) * 6})`}>
        <Hero id="natasha" x={0} y={0} s={1} arm={0.8} />
      </g>
      <Person x={330} y={760} s={0.7} color="#c7a98a" dress="frock" label="дядюшка" labelColor="#c7a98a" />
      <QuoteCard x={760} y={420} w={420} text={"«воспитанная\nэмигранткой-\nфранцуженкой»"} who="т. II, ч. IV, гл. 7" k={ramp(t, at(c, 1), 0.7)} size={30} />
    </Stage>
  );
};

// ── n04: опера — луна как «дыра в полотне» ──
export const OperaStage: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const drift = ramp(t, at(c, 1), 2);
  return (
    <Stage host={c.p.host}>
      <rect x={160} y={180} width={960} height={460} rx={10} fill="#e9dcc0" />
      <path d="M 160 180 Q 300 300 240 640 L 160 640 Z M 1120 180 Q 980 300 1040 640 L 1120 640 Z" fill="#9b2c3b" />
      <rect x={160} y={640} width={960} height={30} fill="#6b4a2f" />
      <circle cx={900} cy={300} r={60} fill="#1a2748" />
      <Label x={900} y={410} text="«дыра в полотне»" color={C.paper} size={26} k={pop(t, at(c, 0) + 2.5)} />
      <path d="M 260 520 Q 400 420 560 520 T 860 520" fill="none" stroke="#b9a57e" strokeWidth={12} />
      {/* ложа: Наташа, Элен, Анатоль */}
      <g transform={`translate(0 ${-drift * 10})`}>
        <rect x={200} y={720} width={880} height={130} rx={16} fill="#3a1e2c" />
        <Hero id="natasha" x={460} y={830} s={0.6} />
        <g opacity={ramp(t, at(c, 1), 0.7)}>
          <Hero id="helene" x={640} y={830} s={0.6} />
          <Hero id="anatole" x={820} y={830} s={0.6} />
        </g>
      </g>
      <Label x={640} y={250} text="где игра, а где правда?" color={C.pink} size={30} k={pop(t, at(c, 1) + 2)} />
    </Stage>
  );
};

// ── n05: чужой сценарий — нити от рук Долохова и Элен ──
export const PuppetStrings: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const reveal = ramp(t, at(c, 1), 0.8);
  return (
    <Stage host={c.p.host}>
      <Hero id="dolokhov" x={300} y={420} s={0.75} arm={1} />
      <Hero id="helene" x={980} y={420} s={0.75} arm={1} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={i === 1 ? 980 : 300} y1={260} x2={600 + i * 40} y2={560 + Math.sin(t * 2 + i) * 6} stroke={C.dim} strokeWidth={3} strokeDasharray="8 8" opacity={ramp(t, 0.5 + i * 0.4, 0.6)} />
      ))}
      <Hero id="anatole" x={640} y={760} s={0.85} />
      <g transform="translate(860 640) rotate(-8)" opacity={ramp(t, 1.2, 0.6)}>
        <rect x={-150} y={-70} width={300} height={140} rx={8} fill={C.paper} />
        <path d="M -150 -70 L 0 10 L 150 -70" fill="none" stroke={C.paperDark} strokeWidth={4} />
        <text y={52} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={22} fill={C.inkBrown}>
          письмо сочинил Долохов
        </text>
      </g>
      {reveal > 0 && (
        <g opacity={reveal}>
          <rect x={360} y={170} width={560} height={90} rx={20} fill={C.red} />
          <text x={640} y={228} textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight={900} fontSize={40} fill={C.white}>
            АНАТОЛЬ ТАЙНО ЖЕНАТ
          </text>
        </g>
      )}
    </Stage>
  );
};

// ── n06: срыв побега и отказ Андрея — разорванная нить ──
export const BrokenEngagement: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cut = ramp(t, at(c, 1), 0.8);
  return (
    <Stage host={c.p.host}>
      <Hero id="pierre" x={300} y={760} s={0.85} arm={0.7} />
      <Person x={160 - ramp(t, 1.5, 1.5) * 200} y={760} s={0.75} color={HERO.anatole} dress="uniform" o={1 - ramp(t, 1.5, 1.5)} flip />
      <Hero id="natasha" x={640} y={760} s={0.8} lean={-6} />
      <Hero id="andrei" x={1000} y={760} s={0.85} />
      <path d={`M 690 520 Q 820 ${470 + cut * 60} ${950 - cut * 60} 520`} stroke={C.gold} strokeWidth={8} fill="none" strokeDasharray={cut > 0.5 ? "30 40" : "none"} />
      <QuoteCard x={260} y={170} w={760} text={"«Я не говорил, что я могу простить.\nЯ не могу»."} who="князь Андрей · т. II, ч. V, гл. 21" k={ramp(t, at(c, 1) + 0.6, 0.7)} size={34} />
    </Stage>
  );
};

// ── n07: комета 1812 года ──
export const Comet: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k = ramp(t, at(c, 1), 1.6);
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={140} width={1160} height={720} rx={28} fill="#0b1430" />
      <Stars x={80} y={160} w={1120} h={600} n={70} seed={14} />
      {k > 0 && (
        <g transform={`translate(${760 + (1 - k) * 200} ${320 - (1 - k) * 60})`} opacity={k}>
          {Array.from({ length: 18 }).map((_, i) => (
            <circle key={i} cx={-i * 22} cy={i * 9} r={18 - i * 0.8} fill={i < 3 ? "#fff8d8" : C.amber} opacity={1 - i / 20} />
          ))}
        </g>
      )}
      <Hero id="pierre" x={420} y={820} s={0.9} />
      <Label x={420} y={540} text="«если бы я был свободен…»" color={HERO.pierre} size={26} k={pop(t, 1) * (1 - k * 0.6)} />
      <Label x={760} y={480} text="знак новой жизни" color={C.amber} size={30} k={pop(t, at(c, 1) + 2)} />
    </Stage>
  );
};

// ── n08: выбор ≠ готовность — две шкалы ──
export const ChoiceReady: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const bar = (y: number, label: string, v: number, color: string) => (
    <g transform={`translate(260 ${y})`}>
      <text x={0} y={-20} fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={34} fill={color}>
        {label}
      </text>
      <rect width={760} height={44} rx={22} fill="rgba(255,255,255,0.1)" stroke={color} strokeWidth={3} />
      <rect width={760 * v} height={44} rx={22} fill={color} />
    </g>
  );
  return (
    <Stage host={c.p.host}>
      {bar(300, "выбор сделан", ramp(t, 0.5, 1.2), C.pink)}
      {bar(460, "готовность", ramp(t, 1.4, 1.2) * 0.25, C.sky)}
      <g opacity={ramp(t, at(c, 0) + 3, 0.6)}>
        {["одна, без жениха", "сознательный обман", "чужой сценарий"].map((s, i) => (
          <Label key={s} x={300 + i * 340} y={620} text={s} color={C.coral} size={24} />
        ))}
      </g>
      <Label x={640} y={780} text="ошибка — начало взросления" color={C.green} size={32} k={pop(t, at(c, 1) + 1)} />
    </Stage>
  );
};

// ── f01: долги Ростовых — растущая стопка векселей ──
export const DebtStack: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const n = Math.floor(ramp(t, 0.3, 4) * 14);
  return (
    <Stage host={c.p.host}>
      <House x={320} y={720} s={1.1} light={0.7} color="#4a3550" />
      {Array.from({ length: n }).map((_, i) => (
        <g key={i} transform={`translate(${760 + (rnd(i) - 0.5) * 30} ${760 - i * 34}) rotate(${(rnd(i + 5) - 0.5) * 10})`}>
          <rect x={-140} y={-16} width={280} height={32} rx={4} fill={C.paper} stroke={C.paperDark} strokeWidth={3} />
          <text y={9} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={18} fill={C.inkBrown}>
            вексель · заклад
          </text>
        </g>
      ))}
      <Label x={760} y={220} text="43 000 — проигрыш Николая" color={C.coral} size={30} k={pop(t, at(c, 1) + 0.5)} />
      <Label x={320} y={300} text="«Папенька!»" color={HERO.nikolai} size={30} k={pop(t, at(c, 1) + 3)} />
    </Stage>
  );
};

// ── f02: Соня на весах между любовью и расчётом ──
export const SonyaScales: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const sway = Math.sin(t * 1.1) * 10;
  return (
    <Stage host={c.p.host}>
      <g transform={`translate(640 330) rotate(${sway})`}>
        <line x1={-380} y1={0} x2={380} y2={0} stroke={C.paperDark} strokeWidth={12} strokeLinecap="round" />
        <g transform="translate(-380 0)">
          <line y2={90} stroke={C.paperDark} strokeWidth={4} />
          <Label x={0} y={130} text="любовь" color={C.pink} size={30} />
        </g>
        <g transform="translate(380 0)">
          <line y2={90} stroke={C.paperDark} strokeWidth={4} />
          <Label x={0} y={130} text="богатая невеста" color={C.yellow} size={30} />
        </g>
      </g>
      <line x1={640} y1={330} x2={640} y2={620} stroke={C.paperDark} strokeWidth={14} />
      <Hero id="sonya" x={640} y={820} s={0.85} />
      <Hero id="nikolai" x={330} y={820} s={0.75} />
      <Person x={960} y={820} s={0.75} color="#c7a98a" dress="dress" label="графиня" labelColor="#c7a98a" />
      <Label x={640} y={190} text="ни святая, ни виноватая" color={C.cyan} size={28} k={pop(t, at(c, 1) + 1.5)} />
    </Stage>
  );
};

// ── f03: княжна Марья — комната долга ──
export const MaryaRoom: React.FC<VisualProps> = (c) => {
  const { t } = c;
  return (
    <Stage host={c.p.host}>
      <Chip x={640} y={170} text="ЛЫСЫЕ ГОРЫ" k={pop(t, 0.2)} />
      <rect x={220} y={240} width={840} height={520} rx={18} fill="#2b2440" stroke="#5c4a6e" strokeWidth={8} />
      {/* геометрия на доске — уроки отца */}
      <g opacity={0.7}>
        <path d="M 300 330 L 420 330 L 360 430 Z" fill="none" stroke={C.paper} strokeWidth={4} />
        <circle cx={520} cy={380} r={50} fill="none" stroke={C.paper} strokeWidth={4} />
      </g>
      <Hero id="oldPrince" x={380} y={740} s={0.8} arm={0.5} />
      <Hero id="marya" x={760} y={740} s={0.85} />
      <Label x={760} y={300} text="«никогда не буду женой вашего сына»" color={HERO.marya} size={24} k={pop(t, at(c, 0) + 4)} />
      <Label x={640} y={812} text="долг — тоже выбор" color={C.gold} size={30} k={pop(t, at(c, 1) + 1)} />
    </Stage>
  );
};

// ── f04: Богучарово — дорога встречи ──
export const RoadMeeting: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const ride = ramp(t, at(c, 1), 1.6);
  return (
    <Stage host={c.p.host}>
      <Chip x={640} y={170} text="БОГУЧАРОВО · АВГУСТ 1812" k={pop(t, 0.2)} />
      <path d="M 60 760 Q 400 640 640 700 T 1220 600" fill="none" stroke="#b9a57e" strokeWidth={60} strokeLinecap="round" opacity={0.6} />
      {Array.from({ length: 9 }).map((_, i) => (
        <Person key={i} x={680 + (i % 5) * 80} y={650 + Math.floor(i / 5) * 60} s={0.5} color="#9aa7c7" dress="peasant" o={1 - ride * 0.8} />
      ))}
      <Hero id="marya" x={380} y={720} s={0.8} />
      <g transform={`translate(${1220 - ride * 620} 0)`}>
        <Hero id="nikolai" x={0} y={700} s={0.8} />
      </g>
      <g opacity={ramp(t, at(c, 1) + 2, 0.6)}>
        <Label x={360} y={330} text="деньги" color={C.yellow} size={28} />
        <Label x={920} y={330} text="слово, данное Соне" color={HERO.sonya} size={28} />
      </g>
    </Stage>
  );
};

// ── n09: Андрей — от канцелярии к «надо жить» ──
export const LiveAgain: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const song = ramp(t, at(c, 1), 1);
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - song * 0.8}>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={200 + (i % 4) * 230} y={240 + Math.floor(i / 4) * 170} width={190} height={130} rx={8} fill={C.paper} opacity={0.85} />
        ))}
        <Label x={640} y={600} text="«…счастливее и лучше?»" color={C.dim} size={28} />
      </g>
      <Hero id="andrei" x={420} y={820} s={0.85} />
      <g opacity={song}>
        <Hero id="natasha" x={860} y={820} s={0.85} />
        {Array.from({ length: 16 }).map((_, i) => (
          <circle key={i} cx={860 - i * 24} cy={520 - Math.sin(t * 3 + i * 0.5) * 40 - i * 6} r={8} fill={[C.pink, C.yellow, C.sky][i % 3]} />
        ))}
        <Label x={640} y={250} text="«пока жив, надо жить и быть счастливым»" color={HERO.andrei} size={28} />
      </g>
    </Stage>
  );
};
