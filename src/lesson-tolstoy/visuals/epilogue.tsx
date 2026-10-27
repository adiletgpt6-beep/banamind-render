// Эпилог: семьи 1813–1820, дом и Соня, спор и сон Николеньки; эпилог II —
// какая сила движет народами, конус власти, свобода и необходимость,
// дифференциал истории, Коперник; три вывода и прощание.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { C, HERO } from "../theme";
import { BigArrow, Big, Chip, DotNet, Hero, House, Label, Note, Person, QuoteCard, Stage, Stars, rnd } from "./draw";
import { at, pop, ramp, type VisualProps } from "./kit";

// ── e01: две свадьбы, Лысые Горы 1820 ──
export const FamilyTree: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k2 = ramp(t, at(c, 1), 0.8);
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - k2 * 0.7}>
        <Chip x={360} y={190} text="1813" />
        <Hero id="pierre" x={280} y={520} s={0.7} />
        <Hero id="natasha" x={440} y={520} s={0.7} />
        <Chip x={920} y={190} text="ОСЕНЬ 1814" />
        <Hero id="nikolai" x={840} y={520} s={0.7} />
        <Hero id="marya" x={1000} y={520} s={0.7} />
      </g>
      {k2 > 0 && (
        <g opacity={k2}>
          <Chip x={640} y={620} text="ЛЫСЫЕ ГОРЫ · ДЕКАБРЬ 1820" />
          <House x={640} y={860} s={1.1} light={1} color="#4a3550" />
          {Array.from({ length: 7 }).map((_, i) => (
            <circle key={i} cx={420 + i * 74} cy={700 + Math.sin(t * 2 + i) * 4} r={12} fill={[C.pink, C.green, C.yellow, C.sky][i % 4]} />
          ))}
          <g transform="translate(1000 760) rotate(-6)">
            <rect x={-80} y={-60} width={160} height={110} rx={8} fill={C.paper} />
            <text y={4} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={20} fill={C.inkBrown}>
              дневник Марьи
            </text>
          </g>
        </g>
      )}
    </Stage>
  );
};

// ── e02: дом, где мир держится на семье; Соня за самоваром ──
export const HomeCircle: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const sonya = ramp(t, at(c, 3), 0.8);
  return (
    <Stage host={c.p.host}>
      <circle cx={520} cy={520} r={280} fill={C.amber} opacity={0.08} />
      <Hero id="natasha" x={460} y={760} s={0.85} />
      <Hero id="pierre" x={640} y={760} s={0.85} />
      {[0, 1, 2, 3].map((i) => (
        <Person key={i} x={300 + i * 90} y={840} s={0.32} color={[C.pink, C.green, C.yellow, C.sky][i]} dress="child" />
      ))}
      <Label x={540} y={300} text="мир сосредоточился на семье" color={HERO.natasha} size={26} k={pop(t, at(c, 1) + 0.4)} />
      <Label x={540} y={400} text="Каратаев одобрил бы — семью" color={HERO.karataev} size={24} k={pop(t, at(c, 2) + 1)} />
      <g opacity={0.35 + sonya * 0.65}>
        <g transform="translate(1020 640)">
          <path d="M -50 0 L -40 -110 L 40 -110 L 50 0 Z" fill="#b78f5a" />
          <circle cy={-130} r={26} fill="#b78f5a" />
        </g>
        <Hero id="sonya" x={1020} y={800} s={0.7} label={false} />
      </g>
      <Label x={1020} y={430} text="«пустоцвет» — слова Наташи" color={HERO.sonya} size={22} k={sonya} />
    </Stage>
  );
};

// ── e03: спор за столом и сон Николеньки ──
export const BoyDream: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const dream = ramp(t, at(c, 1), 1.2);
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - dream * 0.85}>
        <rect x={260} y={560} width={760} height={40} rx={10} fill="#6b4a2f" />
        <Hero id="pierre" x={400} y={760} s={0.8} arm={0.6} />
        <Hero id="nikolai" x={880} y={760} s={0.8} arm={0.3} />
        <Label x={400} y={390} text="«независимость и деятельность»" color={HERO.pierre} size={22} />
        <Label x={880} y={390} text="«прикажут — пойду»" color={HERO.nikolai} size={22} />
      </g>
      {dream > 0 && (
        <g opacity={dream}>
          <Stars x={80} y={160} w={1120} h={300} n={30} seed={11} />
          {Array.from({ length: 40 }).map((_, i) => (
            <path key={i} d={`M ${200 + i * 22} 700 Q ${260 + i * 22} ${560 + Math.sin(t + i) * 30} ${320 + i * 22} 420`} stroke="#e8e0f5" strokeWidth={2} fill="none" opacity={0.6} />
          ))}
          <Person x={520} y={820} s={0.7} color={HERO.andrei} dress="child" arm={1} label="Николенька" labelColor={HERO.andrei} />
          <Hero id="pierre" x={700} y={820} s={0.75} label={false} />
        </g>
      )}
      <Label x={640} y={200} text="новый «Тулон»?" color={C.gold} size={34} k={pop(t, at(c, 2))} />
    </Stage>
  );
};

// ── h01: какая сила движет народами? паровоз и дым ──
export const ForceQuestion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const loco = ramp(t, at(c, 1) + 2, 1);
  return (
    <Stage host={c.p.host}>
      <Big x={640} y={260} text="Какая сила движет народами?" size={56} color={C.white} k={pop(t, 0.6)} />
      <g opacity={ramp(t, at(c, 1), 0.6)}>
        {["воля героев", "идеи", "власть"].map((s, i) => (
          <Label key={s} x={300 + i * 340} y={380} text={s} color={[C.french, C.violet, C.coral][i]} size={28} dark={i !== 0} />
        ))}
      </g>
      <g transform={`translate(${200 + loco * 120} 30)`} opacity={loco}>
        <rect x={0} y={560} width={420} height={160} rx={20} fill="#3b3f52" />
        <rect x={300} y={480} width={60} height={90} fill="#3b3f52" />
        {[60, 200, 340].map((x) => (
          <circle key={x} cx={x} cy={740} r={40} fill="none" stroke={C.steel} strokeWidth={12} />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <circle key={i} cx={330 - i * 40 - ((t * 60) % 40)} cy={440 - i * 26} r={22 + i * 6} fill="#cfd5e2" opacity={0.7 - i * 0.1} />
        ))}
        <Label x={-90} y={620} text="«отчего движется?»" color={C.paper} size={24} />
      </g>
      <Note x={640} y={842} text="Эпилог, часть II — трактат Толстого" o={ramp(t, 0.8, 0.6)} />
    </Stage>
  );
};

// ── h02: конус власти ──
export const PowerCone: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cone = ramp(t, at(c, 1), 1.2);
  const N = 70;
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - cone}>
        <Hero id="napoleon" x={300} y={600} s={0.7} arm={1} label={false} />
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i} transform={`translate(${520 + i * 100} 500)`}>
            <rect x={-36} y={-24} width={72} height={48} rx={6} fill={C.paper} opacity={i % 2 ? 0.35 : 1} />
            <text y={8} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={16} fill={C.inkBrown}>
              {i % 2 ? "—" : "исполнен"}
            </text>
          </g>
        ))}
        <Note x={760} y={580} text="исполняются приказы, совпавшие с ходом событий" o={ramp(t, 2, 0.6)} />
      </g>
      {cone > 0 && (
        <g opacity={cone}>
          <path d="M 640 200 L 1000 800 L 280 800 Z" fill="rgba(98,239,228,0.08)" stroke={C.cyan} strokeWidth={5} />
          <circle cx={640} cy={230} r={14} fill={HERO.napoleon} />
          <Label x={640} y={170} text="приказывает больше всех" color={HERO.napoleon} size={24} dark={false} />
          {Array.from({ length: N }).map((_, i) => {
            const row = Math.floor(Math.sqrt(i * 2));
            const y = 300 + row * 48;
            const half = ((y - 200) / 600) * 360;
            const x = 640 + (rnd(i + 3) - 0.5) * 2 * half * 0.9;
            return y < 790 ? <circle key={i} cx={x} cy={y} r={7} fill={[C.yellow, C.sky, C.pink, C.green][i % 4]} /> : null;
          })}
          <Label x={640} y={812} text="действуют — внизу" color={C.yellow} size={26} />
        </g>
      )}
    </Stage>
  );
};

// ── h03: свобода и необходимость — бегунок ──
export const FreedomSlider: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const hand = Math.max(0, Math.sin(t * 2)) * (1 - ramp(t, at(c, 1), 0.6));
  const v = 0.5 + Math.sin(t * 0.7) * 0.32 * ramp(t, at(c, 1), 0.6);
  return (
    <Stage host={c.p.host}>
      <Person x={640} y={560} s={1.1} color={C.text} dress="frock" arm={hand} />
      <Label x={640} y={190} text="«А я поднял и опустил руку»" color={C.white} size={30} k={pop(t, 1)} />
      <g transform="translate(200 700)" opacity={ramp(t, at(c, 1), 0.6)}>
        <rect width={880} height={56} rx={28} fill={C.steel} />
        <rect width={880 * v} height={56} rx={28} fill={C.green} />
        <circle cx={880 * v} cy={28} r={38} fill={C.white} stroke={C.night} strokeWidth={6} />
        <text x={0} y={-24} fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={30} fill={C.green}>
          свобода
        </text>
        <text x={880} y={-24} textAnchor="end" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={30} fill={C.steel}>
          необходимость
        </text>
        <text x={440} y={120} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={26} fill={C.dim} fontStyle="italic">
          никогда не 0 и не 100
        </text>
      </g>
    </Stage>
  );
};

// ── h04: дифференциал истории — маленькие стрелки совпадают ──
export const IntegralDots: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const al = ramp(t, at(c, 1), 3);
  return (
    <Stage host={c.p.host}>
      <DotNet x={120} y={200} w={1040} h={560} n={220} seed={91} k={ramp(t, 0.3, 1.5)} align={al} dir={-0.2} r={6} drift={al * 60} links={0.4} />
      <text x={170} y={180} fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={64} fill={C.gold}>
        ∫ dx
      </text>
      <Label x={820} y={180} text="«дифференциал истории»" color={C.gold} size={28} k={pop(t, 0.8)} />
      {al > 0.8 && <BigArrow x1={300} y1={840} x2={980} y2={720} k={ramp(t, at(c, 1) + 3, 1)} w={20} color={C.cyan} />}
    </Stage>
  );
};

// ── h05: Коперник — Земля движется, хоть мы этого не чувствуем ──
export const Copernicus: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const helio = ramp(t, at(c, 0) + 2, 2);
  const a = t * 0.6;
  return (
    <Stage host={c.p.host}>
      <Stars x={80} y={160} w={1120} h={680} n={60} seed={33} o={0.7} />
      <g transform="translate(640 400)">
        <circle r={220} fill="none" stroke={C.steel} strokeWidth={3} strokeDasharray="10 10" opacity={helio} />
        <g transform={`translate(${-helio * 0} 0)`}>
          <circle cx={helio * 0} cy={0} r={70} fill={C.yellow} opacity={helio} />
        </g>
        <g transform={`translate(${Math.cos(a) * 220 * helio} ${Math.sin(a) * 220 * helio})`}>
          <circle r={46} fill="#3f8cff" />
          <path d="M -20 -20 Q 0 -30 18 -14 Q 6 0 -10 6 Z" fill="#46c37b" />
        </g>
        {helio < 1 && <circle cx={-260 * (1 - helio)} cy={-200 * (1 - helio)} r={50} fill={C.yellow} opacity={1 - helio} />}
      </g>
      <QuoteCard x={170} y={680} w={940} text={"«…признать неощущаемую нами зависимость»"} who="последние слова романа · Эпилог, часть II" k={ramp(t, at(c, 1) + 2.5, 0.7)} size={34} />
    </Stage>
  );
};

// ── z01–z03: три вывода ──
export const Conclusion: React.FC<VisualProps<{ n: number; host: string }>> = (c) => {
  const { t, p } = c;
  const n = p.n;
  const items = ["не одна стрела", "свобода ≠ контроль", "мир — это жизнь"];
  return (
    <Stage host={c.p.host}>
      {items.map((s, i) => {
        const active = i + 1 === n;
        const done = i + 1 < n;
        const k = active ? pop(t, 0.3) : done || active ? 1 : 0;
        if (k <= 0) return null;
        return (
          <g key={s} transform={`translate(640 ${260 + i * 150})`} opacity={active ? 1 : 0.45}>
            <rect x={-440} y={-56} width={880} height={112} rx={56} fill={active ? C.gold : "rgba(12,20,40,0.85)"} stroke={C.gold} strokeWidth={3} />
            <circle cx={-370} r={38} fill={active ? C.night : C.gold} />
            <text x={-370} y={14} textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight={900} fontSize={40} fill={active ? C.gold : C.night}>
              {i + 1}
            </text>
            <text x={30} y={16} textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight={900} fontSize={46} fill={active ? C.night : C.text}>
              {s}
            </text>
          </g>
        );
      })}
      {n === 1 && <DotNet x={160} y={720} w={960} h={120} n={60} seed={5} k={ramp(t, 1, 1)} align={ramp(t, 2, 2) * 0.8} dir={0} r={6} />}
      {n === 2 && (
        <g opacity={ramp(t, 1, 0.8)}>
          <Hero id="pierre" x={520} y={860} s={0.55} label={false} />
          <Hero id="karataev" x={760} y={860} s={0.55} label={false} />
        </g>
      )}
      {n === 3 && (
        <g opacity={ramp(t, 1, 0.8)}>
          <House x={640} y={870} s={0.6} light={1} />
        </g>
      )}
    </Stage>
  );
};

// ── z04: прощание BanaMind ──
export const Outro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k = ramp(t, 0.2, 1.5);
  return (
    <g>
      <DotNet x={70} y={330} w={560} h={520} n={110} seed={99} k={k} align={0.85} dir={0} r={6} drift={ramp(t, 0.5, 4) * 30} />
      <DotNet x={1290} y={330} w={560} h={520} n={110} seed={98} k={k} align={0.85} dir={0} r={6} drift={ramp(t, 0.5, 4) * 30} />
      <text x={960} y={190} textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight={900} fontSize={120} opacity={ramp(t, 0.6, 0.8)} stroke={C.night} strokeWidth={10} paintOrder="stroke">
        <tspan fill={C.white}>{BRAND.wordmark[0]}</tspan>
        <tspan fill={BRAND.yellow}>{BRAND.wordmark[1]}</tspan>
      </text>
      <text x={960} y={262} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={42} fill={C.dim} opacity={ramp(t, 1, 0.8)}>
        {BRAND.slogan}
      </text>
    </g>
  );
};
