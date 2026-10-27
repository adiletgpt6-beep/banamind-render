// Пьер: круг льстецов и брак, дуэль на снегу, «свернулся винт», реформы с
// парадного крыльца, паром и небо, замкнутый круг отставного камергера.
import React from "react";
import { C, HERO } from "../theme";
import { Chip, Hero, HighSky as SkyArt, Label, Person, QuoteCard, Stage, rnd } from "./draw";
import { at, pop, ramp, wob, type VisualProps } from "./kit";

// ── p01: богатый Пьер в кольце льстецов, брак без предложения ──
export const Flatterers: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const ring = ramp(t, 0.2, 1.4);
  const n = 10;
  const wed = ramp(t, at(c, 1), 0.8);
  return (
    <Stage host={c.p.host}>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + t * 0.15;
        const r = 360 - ring * 80;
        return <Person key={i} x={640 + Math.cos(a) * r} y={560 + Math.sin(a) * r * 0.45 + 100} s={0.5} color="#7a83a6" dress={i % 2 ? "frock" : "dress"} o={0.85} />;
      })}
      <Hero id="pierre" x={wed > 0 ? 560 : 640} y={740} s={0.95} />
      {wed > 0 && (
        <g opacity={wed}>
          <Hero id="helene" x={740} y={740} s={0.95} />
          <Hero id="vasily" x={960} y={740} s={0.8} arm={1} />
          <Label x={960} y={470} text="«Жена мне все сказала!»" color={HERO.vasily} size={24} k={pop(t, at(c, 1) + 0.6)} dark={false} />
        </g>
      )}
      <Label x={640} y={190} text="«Я вас люблю» — по-французски" color={C.paper} size={30} k={pop(t, at(c, 1) + 1.8)} />
    </Stage>
  );
};

// ── p02: дуэль на снегу, вопрос «кто прав?» ──
export const DuelSnow: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const shot = ramp(t, at(c, 0) + 2.2, 0.3);
  const q = ramp(t, at(c, 1), 0.7);
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={560} width={1160} height={300} rx={24} fill={C.snow} opacity={0.9} />
      {Array.from({ length: 30 }).map((_, i) => (
        <circle key={i} cx={80 + rnd(i) * 1120} cy={(150 + rnd(i + 9) * 700 + t * 30 * (0.5 + rnd(i + 3))) % 720 + 140} r={4} fill="#fff" opacity={0.85} />
      ))}
      <Hero id="pierre" x={300} y={760} s={0.9} arm={0.35} />
      <Person x={980} y={760} s={0.9} color={HERO.dolokhov} dress="uniform" lean={shot * 25} label="Долохов" labelColor={HERO.dolokhov} flip />
      {shot > 0 && shot < 1 && <circle cx={420} cy={600} r={30 * shot} fill={C.amber} opacity={1 - shot} />}
      <QuoteCard x={250} y={190} w={780} text={"«Кто прав, кто виноват? Никто»"} who="мысль Пьера после дуэли · т. II, ч. I" k={q} size={40} />
    </Stage>
  );
};

// ── p03: «свернулся главный винт» — вопросы вращаются ──
export const LooseScrew: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const qs = ["что дурно?", "что хорошо?", "зачем жить?", "какая сила\nуправляет всем?"];
  const lodge = ramp(t, at(c, 1), 0.8);
  return (
    <Stage host={c.p.host}>
      <Chip x={640} y={170} text="СТАНЦИЯ ТОРЖОК" k={pop(t, 0.2)} />
      <g transform={`translate(640 470) rotate(${t * 40 * (1 - lodge * 0.8)})`}>
        <rect x={-30} y={-150} width={60} height={300} rx={10} fill={C.steel} />
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={-34} y1={-130 + i * 32} x2={34} y2={-116 + i * 32} stroke={C.night} strokeWidth={6} />
        ))}
        <rect x={-80} y={-170} width={160} height={36} rx={10} fill={C.steel} />
      </g>
      {qs.map((q, i) => {
        const a = (i / qs.length) * Math.PI * 2 + t * 0.3;
        return <Label key={q} x={640 + Math.cos(a) * 400} y={470 + Math.sin(a) * 230} text={q} color={[C.coral, C.green, C.sky, C.yellow][i]} size={28} k={pop(t, 0.6 + i * 0.5)} />;
      })}
      <g opacity={lodge}>
        <rect x={340} y={720} width={600} height={110} rx={20} fill="rgba(12,20,40,0.9)" stroke={C.violet} strokeWidth={3} />
        <text x={640} y={770} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={30} fill={C.violet}>
          поиск нравственной опоры
        </text>
        <text x={640} y={808} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={700} fontSize={24} fill={C.dim} fontStyle="italic">
          масонство в романе — литературный факт, не ответ
        </text>
      </g>
    </Stage>
  );
};

// ── p04: реформы — парадный фасад и задний двор ──
export const ReformFacade: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const turn = ramp(t, at(c, 0) + 3.2, 1.2);
  return (
    <Stage host={c.p.host}>
      <g transform={`translate(0 0)`}>
        {/* парадная сторона */}
        <g opacity={1 - turn}>
          <rect x={200} y={260} width={880} height={420} rx={16} fill="#e8dcc0" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={250 + i * 170} y={300} width={60} height={380} fill="#fff6e4" stroke="#c9b48a" strokeWidth={4} />
          ))}
          <path d="M 180 270 L 640 150 L 1100 270 Z" fill="#d9c9a6" />
          {[0, 1, 2].map((i) => (
            <Person key={i} x={420 + i * 220} y={820} s={0.6} color={C.gold} dress="peasant" arm={0.5} />
          ))}
          <Label x={640} y={220} text="хлеб-соль, благодарности" color={C.paper} size={28} k={pop(t, 0.8)} />
        </g>
        {/* настоящая сторона */}
        <g opacity={turn}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Person key={i} x={260 + i * 190} y={760} s={0.66} color="#9aa7c7" dress="peasant" lean={18} />
          ))}
          <path d="M 200 790 L 1080 790" stroke="#6b4a2f" strokeWidth={10} />
          <Label x={640} y={360} text="работы на деле больше" color={C.coral} size={34} />
        </g>
      </g>
      <Hero id="pierre" x={1160} y={820} s={0.6} label={false} />
      <Label x={640} y={812} text="намерение ≠ изменение" color={C.cyan} size={28} k={pop(t, at(c, 1) + 0.4)} />
    </Stage>
  );
};

// ── p05: паром — спор и небо ──
export const FerryRaft: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const sky = ramp(t, at(c, 1), 1.6);
  return (
    <Stage host={c.p.host}>
      <g opacity={sky}>
        <SkyArt x={60} y={140} w={1160} h={420} t={t} />
      </g>
      <rect x={60} y={560} width={1160} height={300} rx={24} fill="#2c5f8f" />
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M ${100 + i * 140 + Math.sin(t + i) * 10} ${620 + (i % 3) * 70} q 30 -14 60 0`} stroke="#7fb3e0" strokeWidth={5} fill="none" />
      ))}
      <g transform={`translate(0 ${wob(t, 3, 4)})`}>
        <rect x={340} y={680} width={600} height={50} rx={10} fill="#8a6d45" />
        <Hero id="pierre" x={500} y={680} s={0.75} arm={0.6} />
        <Hero id="andrei" x={780} y={680} s={0.75} />
      </g>
      <Label x={500} y={220} text="жить для других" color={HERO.pierre} size={28} k={pop(t, 0.9) * (1 - sky)} />
      <Label x={780} y={300} text="«Я жил для славы»" color={HERO.andrei} size={28} k={pop(t, 0.4) * (1 - sky)} />
      <Label x={640} y={250} text="«в первый раз после Аустерлица»" color={C.white} size={30} k={pop(t, at(c, 1) + 1)} />
    </Stage>
  );
};

// ── p06: замкнутый круг — болото и клуб ──
export const CircleLoop: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const stops = ["ложа", "клуб", "обеды", "книги", "свет"];
  const a = t * 0.8;
  return (
    <Stage host={c.p.host}>
      <circle cx={640} cy={490} r={270} fill="none" stroke={C.steel} strokeWidth={10} strokeDasharray="22 16" />
      {stops.map((s, i) => {
        const ang = (i / stops.length) * Math.PI * 2 - Math.PI / 2;
        return <Label key={s} x={640 + Math.cos(ang) * 270} y={490 + Math.sin(ang) * 270} text={s} color={C.paper} size={26} k={pop(t, 0.3 + i * 0.3)} />;
      })}
      <g transform={`translate(${640 + Math.cos(a) * 270} ${490 + Math.sin(a) * 270})`}>
        <circle r={22} fill={HERO.pierre} stroke={C.night} strokeWidth={4} />
      </g>
      <Hero id="pierre" x={640} y={620} s={0.6} label={false} />
      <Label x={640} y={360} text="«камергер в отставке»" color={HERO.pierre} size={26} k={pop(t, 1.6)} />
      <Label x={640} y={812} text="свобода выбора есть — смысла нет" color={C.cyan} size={28} k={pop(t, at(c, 1))} />
    </Stage>
  );
};
