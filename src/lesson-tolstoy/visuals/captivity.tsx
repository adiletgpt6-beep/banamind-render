// Пьер в Москве и в плену: провал плана, взгляд Даву и безличный «порядок»,
// Каратаев, «бессмертная душа», граница свободы, глобус из капель, рассвет.
import React from "react";
import { C, HERO } from "../theme";
import { DotNet, Flame, Hero, Label, Note, Person, Stage, Stars } from "./draw";
import { Cross, at, pop, ramp, wob, type VisualProps } from "./kit";

// ── c01: план убить Наполеона — и что случилось на деле ──
export const PierrePlan: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fail = ramp(t, at(c, 1), 0.8);
  const save = ramp(t, at(c, 1) + 2.4, 1);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(160 200)">
        <rect width={460} height={300} rx={14} fill={C.paper} />
        <text x={230} y={60} textAnchor="middle" fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={32} fill={C.inkBrown}>
          План Пьера
        </text>
        <text x={40} y={130} fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={28} fill={C.inkBrown}>
          1. остаться в Москве
        </text>
        <text x={40} y={190} fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={28} fill={C.inkBrown}>
          2. встретить Наполеона
        </text>
        <Cross x={230} y={170} s={220} k={fail} />
      </g>
      <Hero id="pierre" x={420} y={820} s={0.8} hat="none" />
      <g opacity={save}>
        <Flame x={860} y={560} s={1.2} t={t} />
        <Flame x={1000} y={560} s={0.9} t={t} seed={2} />
        <Person x={760} y={820} s={0.45} color={C.paper} dress="child" />
        <Label x={900} y={300} text="спас девочку — арестован" color={C.amber} size={28} />
      </g>
    </Stage>
  );
};

// ── c02: два взгляда — и безличный порядок ──
export const TwoLooks: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const look = ramp(t, at(c, 0) + 1.5, 1);
  const order = ramp(t, at(c, 1), 1);
  return (
    <Stage host={c.p.host}>
      <Hero id="pierre" x={360} y={620} s={0.85} label={false} />
      <Person x={920} y={620} s={0.85} color="#5b6fa8" dress="uniform" label="Даву" labelColor="#8fa6e8" flip />
      <line x1={420} y1={460} x2={420 + 440 * look} y2={460} stroke={C.gold} strokeWidth={6} strokeDasharray="14 10" />
      <line x1={860} y1={480} x2={860 - 440 * look} y2={480} stroke={C.gold} strokeWidth={6} strokeDasharray="14 10" />
      <Label x={640} y={360} text="взгляд человека" color={C.gold} size={30} k={pop(t, at(c, 0) + 2.6)} />
      {order > 0 && (
        <g opacity={order}>
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i} transform={`translate(${280 + i * 180} 200) rotate(${t * 30 * (i % 2 ? 1 : -1)})`}>
              <circle r={44} fill="none" stroke={C.steel} strokeWidth={10} />
              {Array.from({ length: 8 }).map((_, j) => (
                <rect key={j} x={-5} y={-58} width={10} height={16} fill={C.steel} transform={`rotate(${j * 45})`} />
              ))}
            </g>
          ))}
          <Label x={640} y={800} text="«порядок, склад обстоятельств»" color={C.steel} size={30} dark />
        </g>
      )}
    </Stage>
  );
};

// ── c03: Каратаев — круглый, тёплый, рядом ──
export const RoundKarataev: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const rebuild = ramp(t, at(c, 1) + 2, 3);
  return (
    <Stage host={c.p.host}>
      <rect x={160} y={220} width={960} height={600} rx={20} fill="#2e2a24" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={180 + i * 80} y1={220} x2={180 + i * 80} y2={820} stroke="#4a4236" strokeWidth={8} />
      ))}
      <circle cx={760} cy={600} r={170 + Math.sin(t * 1.5) * 4} fill={HERO.karataev} opacity={0.14} />
      <Hero id="karataev" x={760} y={780} s={0.95} />
      <Hero id="pierre" x={430} y={780} s={0.9} />
      <g transform="translate(600 690)">
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={i * 26} cy={0} rx={16} ry={11} fill="#c9a06a" />
        ))}
      </g>
      <Label x={640} y={180 + 80} text="«час терпеть, а век жить!»" color={HERO.karataev} size={32} k={pop(t, at(c, 0) + 3)} />
      <DotNet x={260} y={300} w={760} h={180} n={40} seed={61} k={rebuild} align={0.6} dir={0} r={6} />
      <Note x={640} y={842} text="не волшебный наставник — простой человек рядом" o={ramp(t, at(c, 1), 0.6)} />
    </Stage>
  );
};

// ── c04: решётка и звёзды — «бессмертная душа» ──
export const BarsStars: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const wide = ramp(t, at(c, 2), 2);
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={140} width={1160} height={720} rx={28} fill="#0b1430" />
      <Stars x={80} y={160} w={1120} h={680} n={110} seed={77} />
      <g opacity={1 - wide * 0.85}>
        {Array.from({ length: 11 }).map((_, i) => (
          <rect key={i} x={110 + i * 106} y={140} width={18} height={720} fill="#566078" />
        ))}
      </g>
      <g transform={`translate(${640 + wob(t, 2, 4)} 0)`}>
        <Hero id="pierre" x={0} y={820} s={0.95} arm={ramp(t, at(c, 1), 0.6)} />
      </g>
      <Label x={640} y={260} text="«Меня — мою бессмертную душу!»" color={HERO.pierre} size={34} k={pop(t, at(c, 1) + 2)} />
      <Label x={640} y={400} text="всё это — во мне" color={C.white} size={30} k={pop(t, at(c, 2) + 1)} />
    </Stage>
  );
};

// ── c05: граница страданий и граница свободы ──
export const FreedomBorder: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k = ramp(t, at(c, 1), 1.2);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(160 260)">
        <rect width={960} height={120} rx={60} fill="rgba(255,255,255,0.08)" stroke={C.steel} strokeWidth={3} />
        <rect width={480 - k * 60} height={120} rx={60} fill={C.coral} opacity={0.8} />
        <rect x={420 + k * 60 - 0} width={540 - k * 60} height={120} rx={60} fill={C.green} opacity={0.8} />
        <text x={160} y={76} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={34} fill={C.night}>
          страдание
        </text>
        <text x={800} y={76} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={34} fill={C.night}>
          свобода
        </text>
        <line x1={450 + k * 0} y1={-30} x2={450} y2={150} stroke={C.white} strokeWidth={6} strokeDasharray="10 8" />
      </g>
      <Label x={640} y={480} text="граница очень близка" color={C.white} size={30} k={pop(t, at(c, 1) + 1)} />
      <g opacity={ramp(t, 0.5, 0.8)}>
        <g transform="translate(320 820)">
          <rect x={-160} y={-260} width={320} height={260} rx={16} fill="#3a2f4a" />
          <Hero id="pierre" x={0} y={0} s={0.6} label={false} />
          <text y={-275} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={26} fill={C.dim}>
            богатый дом
          </text>
        </g>
        <g transform="translate(960 820)">
          <Stars x={-160} y={-260} w={320} h={200} n={14} seed={5} />
          <Hero id="pierre" x={0} y={0} s={0.6} label={false} />
          <text y={-275} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={26} fill={C.green}>
            плен
          </text>
        </g>
      </g>
    </Stage>
  );
};

// ── c06: глобус из капель ──
export const DropGlobe: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const dream = ramp(t, at(c, 1), 1.2);
  const N = 140;
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - dream}>
        <path d="M 60 760 L 1220 700" stroke="#b9a57e" strokeWidth={40} opacity={0.5} />
        <g transform="translate(900 0)">
          <path d="M 0 760 L 0 420" stroke="#e8e0cc" strokeWidth={22} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M 0 ${480 + i * 60} l ${i % 2 ? 50 : -50} -30`} stroke="#e8e0cc" strokeWidth={8} />
          ))}
          <Hero id="karataev" x={-80} y={760} s={0.6} label={false} />
        </g>
        <Hero id="pierre" x={420} y={740} s={0.7} label={false} />
      </g>
      {dream > 0 && (
        <g transform="translate(640 500)" opacity={dream}>
          <circle r={300} fill="#1a2a5a" opacity={0.5} />
          {Array.from({ length: N }).map((_, i) => {
            const a = i * 2.39996;
            const r = 290 * Math.sqrt((i + 0.5) / N);
            const merge = 0.5 + 0.5 * Math.sin(t * 0.9 + i * 0.3);
            const x = Math.cos(a + t * 0.12) * r;
            const y = Math.sin(a + t * 0.12) * r;
            return <circle key={i} cx={x} cy={y} r={7 + merge * 7} fill={[C.sky, C.cyan, C.yellow, C.pink, C.green][i % 5]} opacity={0.95} />;
          })}
          {/* «капля» Каратаева разливается */}
          <circle cx={120} cy={-60} r={22 + ramp(t, at(c, 1) + 3, 2) * 40} fill={HERO.karataev} opacity={1 - ramp(t, at(c, 1) + 3, 2) * 0.8} />
        </g>
      )}
      <Label x={640} y={180} text="«вот разлился и исчез»" color={HERO.karataev} size={30} k={pop(t, at(c, 1) + 3.5)} />
    </Stage>
  );
};

// ── c07: ночь Пети, рассвет освобождения ──
export const DawnForest: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const dawn = ramp(t, at(c, 1), 1.4);
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={140} width={1160} height={720} rx={28} fill={dawn > 0.5 ? "#3a4a6a" : "#0d1530"} />
      <rect x={60} y={140} width={1160} height={720} rx={28} fill="#ffb347" opacity={0.18 * dawn} />
      {Array.from({ length: 16 }).map((_, i) => (
        <path key={i} d={`M ${90 + i * 74} 760 l 34 -${150 + (i % 4) * 40} l 34 ${150 + (i % 4) * 40} Z`} fill="#1f3a2c" />
      ))}
      <g opacity={1 - dawn}>
        <Stars x={80} y={160} w={1120} h={300} n={40} seed={88} />
        <Hero id="petya" x={400} y={820} s={1} />
        {/* «музыка» — бегущие ноты-точки */}
        {Array.from({ length: 18 }).map((_, i) => (
          <circle key={i} cx={460 + i * 40} cy={480 + Math.sin(t * 3 + i * 0.6) * 60} r={8} fill={[C.yellow, C.sky, C.pink][i % 3]} />
        ))}
        <Label x={760} y={360} text="«Ожиг, жиг, ожиг, жиг…»" color={HERO.petya} size={28} />
      </g>
      <g opacity={dawn}>
        <Hero id="pierre" x={640} y={820} s={0.9} arm={1} />
        <Label x={640} y={330} text="Пьер свободен" color={HERO.pierre} size={34} k={dawn} />
        <circle cx={1000} cy={560} r={12} fill={HERO.petya} opacity={1 - ramp(t, at(c, 2), 1)} />
      </g>
    </Stage>
  );
};
