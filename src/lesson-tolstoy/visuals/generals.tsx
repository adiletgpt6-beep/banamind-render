// Кутузов и Наполеон у Толстого, дубина народной войны, «тоже люди», роман и
// учебник; потери и возвращение к жизни: две свечи, заржавелая дверь, письмо Сони.
import React from "react";
import { C, HERO } from "../theme";
import { BigArrow, Candle, Hero, Label, Note, Person, QuoteCard, Stage, rnd } from "./draw";
import { at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ── g01: ребёнок держится за тесёмочки внутри кареты ──
export const CarriageChild: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const inside = ramp(t, at(c, 1), 1);
  const roll = t * 60;
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - inside * 0.85}>
        <Hero id="napoleon" x={640} y={760} s={1.3} arm={0.8} />
        <Label x={640} y={260} text="«гений» управляет событиями?" color={C.paper} size={32} />
      </g>
      {inside > 0 && (
        <g opacity={inside} transform={`translate(0 ${wob(t, 1, 4)})`}>
          <rect x={300} y={330} width={680} height={340} rx={40} fill="#5a3a5c" />
          <rect x={360} y={380} width={300} height={200} rx={20} fill="#2a1d36" />
          {[460, 820].map((x) => (
            <g key={x} transform={`translate(${x} 700) rotate(${roll})`}>
              <circle r={70} fill="none" stroke="#3a2e20" strokeWidth={16} />
              {[0, 1, 2, 3].map((j) => (
                <line key={j} x1={0} y1={0} x2={0} y2={-66} stroke="#3a2e20" strokeWidth={8} transform={`rotate(${j * 90})`} />
              ))}
            </g>
          ))}
          <Person x={510} y={580} s={0.55} color={HERO.napoleon} dress="child" hat="bicorne" arm={1} />
          <line x1={540} y1={480} x2={600} y2={390} stroke={C.gold} strokeWidth={4} />
          <line x1={548} y1={490} x2={640} y2={390} stroke={C.gold} strokeWidth={4} />
          <BigArrow x1={1020} y1={500} x2={1180} y2={500} k={1} w={24} color={C.cyan} />
          <Label x={1080} y={410} text="движут другие силы" color={C.cyan} size={22} />
        </g>
      )}
      <Label x={640} y={808} text="«нет величия там, где нет простоты, добра и правды»" color={C.gold} size={26} k={pop(t, at(c, 2) + 0.6)} />
    </Stage>
  );
};

// ── g02: терпение и время — яблоко зреет само ──
export const PatienceTime: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const ripe = ramp(t, 0.5, 8);
  return (
    <Stage host={c.p.host}>
      <Hero id="kutuzov" x={380} y={800} s={1.05} />
      <Label x={380} y={430} text="«Терпение и время»" color={HERO.kutuzov} size={32} k={pop(t, 0.8)} />
      <g transform="translate(900 0)">
        <path d="M -200 260 Q 0 200 200 260" stroke="#6b4a2f" strokeWidth={18} fill="none" />
        <path d="M 0 230 L 0 820" stroke="#6b4a2f" strokeWidth={30} />
        <circle cx={0} cy={330} r={56} fill={ripe < 0.7 ? C.green : C.red} opacity={0.4 + ripe * 0.6} />
        <rect x={-4} y={260} width={8} height={20} fill="#6b4a2f" />
        <Label x={0} y={480} text={ripe < 0.7 ? "не срывать, пока зелено" : "упадёт само"} color={C.paper} size={26} k={pop(t, at(c, 1) + 1)} />
      </g>
      <Note x={640} y={842} text="трактовка Толстого, не вывод военной истории" o={ramp(t, at(c, 1), 0.6)} />
    </Stage>
  );
};

// ── g03: шпага против дубины ──
export const RapierClub: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const club = ramp(t, at(c, 0) + 3, 0.8);
  const x = ramp(t, at(c, 1) + 2.5, 1);
  return (
    <Stage host={c.p.host}>
      <Person x={380} y={780} s={0.95} color={C.french} dress="uniform" arm={0.5} label="по правилам" labelColor={C.french} />
      <line x1={420} y1={640} x2={600} y2={560} stroke="#dfe6f2" strokeWidth={6} />
      <Person x={900} y={780} s={1.05} color="#c8a46a" dress="peasant" arm={club} label="без правил" labelColor="#c8a46a" flip />
      {club > 0 && <path d={`M 860 ${650 - club * 120} L 780 ${520 - club * 100}`} stroke="#6b4a2f" strokeWidth={26} strokeLinecap="round" />}
      <Label x={640} y={220} text="«дубина народной войны поднялась»" color={C.amber} size={30} k={pop(t, at(c, 1) + 0.4)} />
      <g opacity={x}>
        <rect x={420} y={300} width={440} height={110} rx={20} fill="rgba(12,20,40,0.9)" stroke={C.cyan} strokeWidth={3} />
        <text x={640} y={372} textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight={900} fontSize={48} fill={C.cyan}>
          сила = масса × x
        </text>
      </g>
      <Note x={640} y={445} text="x — дух войска" o={x} />
    </Stage>
  );
};

// ── g04: Красное — «тоже и они люди» ──
export const KutuzovSpeech: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const end = ramp(t, at(c, 1) + 3, 2);
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={560} width={1160} height={300} rx={24} fill={C.snow} opacity={0.85} />
      {Array.from({ length: 8 }).map((_, i) => (
        <Person key={i} x={180 + i * 130} y={800} s={0.5} color="#8c99b8" dress="uniform" hat="shako" o={0.9} />
      ))}
      <Hero id="kutuzov" x={640} y={640} s={0.9} label={false} o={1 - end * 0.8} />
      <QuoteCard x={260} y={190} w={760} text={"«Тоже и они люди.\nТак, ребята?»"} who="Кутузов под Красным · т. IV, ч. IV" k={ramp(t, 0.6, 0.7) * (1 - end)} size={40} />
      <Label x={640} y={300} text="«И он умер»" color={HERO.kutuzov} size={36} k={end} />
    </Stage>
  );
};

// ── g05: две линзы — роман и учебник ──
export const TwoLenses: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k2 = ramp(t, at(c, 1), 0.8);
  const lens = (x: number, title: string, color: string, rows: string[], k: number) => (
    <g transform={`translate(${x} 480)`} opacity={clamp01(k * 1.4)}>
      <circle r={240} fill="rgba(12,20,40,0.85)" stroke={color} strokeWidth={10} />
      <text y={-150} textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight={900} fontSize={36} fill={color}>
        {title}
      </text>
      {rows.map((r, i) => (
        <text key={r} y={-70 + i * 56} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={30} fill={C.text}>
          {r}
        </text>
      ))}
    </g>
  );
  return (
    <Stage host={c.p.host}>
      {lens(360, "ФАКТЫ", C.green, ["Неман: 12.06.1812", "Бородино: 26.08", "Москва оставлена", "(старый стиль)"], ramp(t, 0.3, 0.8))}
      {lens(920, "ТРАКТОВКА", C.coral, ["Наполеон —", "«ребёнок в карете»", "Кутузов —", "«терпение и время»"], k2)}
      <Note x={640} y={830} text="роман не заменяет исторического исследования" o={ramp(t, at(c, 1) + 2, 0.6)} />
    </Stage>
  );
};

// ── r01: две свечи — горе и проснувшаяся жизнь ──
export const TwoCandles: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const wake = ramp(t, at(c, 1) + 3, 2);
  return (
    <Stage host={c.p.host}>
      <rect x={160} y={200} width={960} height={620} rx={20} fill="#1b1626" />
      <Candle x={420} y={640} t={t} lit={0.25 + wake * 0.75} />
      <Candle x={860} y={640} t={t} lit={0.6} />
      <Hero id="natasha" x={520} y={800} s={0.7} label={false} />
      <Person x={760} y={800} s={0.7} color="#c7a98a" dress="dress" lean={10} />
      <Label x={640} y={270} text="«…на ту сторону жизни»" color={C.dim} size={28} k={pop(t, 0.6) * (1 - wake)} />
      <Label x={640} y={270} text="«Проснулась любовь, и проснулась жизнь»" color={HERO.natasha} size={28} k={wake} />
    </Stage>
  );
};

// ── r02: заржавелая дверь ──
export const RustyDoor: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const open = ramp(t, at(c, 1), 2.2);
  return (
    <Stage host={c.p.host}>
      <rect x={480} y={200} width={320} height={560} rx={10} fill="#fff1c9" />
      <g transform={`translate(480 200) scale(${1 - open * 0.8} 1)`}>
        <rect width={320} height={560} rx={10} fill="#7a5a3a" stroke="#5a3f28" strokeWidth={8} />
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={i} cx={30 + rnd(i) * 260} cy={40 + rnd(i + 4) * 480} r={8 + rnd(i + 9) * 10} fill="#b5642b" opacity={0.7 * (1 - open)} />
        ))}
      </g>
      <Hero id="pierre" x={260} y={800} s={0.85} />
      <Hero id="natasha" x={1020} y={800} s={0.8} />
      <Label x={640} y={170} text="«как отворяется заржавелая дверь»" color={C.gold} size={28} k={pop(t, at(c, 1) + 0.6)} />
      <Label x={640} y={812} text="«Пока есть жизнь, есть и счастье»" color={HERO.pierre} size={28} k={pop(t, at(c, 1) + 3.5)} />
    </Stage>
  );
};

// ── r03: письмо Сони возвращает слово ──
export const LetterRelease: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fly = ramp(t, at(c, 1) + 0.5, 2);
  return (
    <Stage host={c.p.host}>
      <Hero id="nikolai" x={300} y={800} s={0.85} />
      <Hero id="marya" x={540} y={800} s={0.85} />
      <Hero id="sonya" x={1060} y={800} s={0.85} />
      <g opacity={1 - fly}>
        <path d="M 360 520 Q 420 420 500 520" stroke={C.yellow} strokeWidth={6} fill="none" strokeDasharray="14 10" />
        <Label x={420} y={420} text="деньги · слово" color={C.yellow} size={24} />
      </g>
      <g transform={`translate(${1000 - fly * 640} ${560 - Math.sin(fly * Math.PI) * 200}) rotate(${-10 + fly * 20})`} opacity={ramp(t, at(c, 1), 0.5)}>
        <rect x={-80} y={-55} width={160} height={110} rx={8} fill={C.paper} />
        <path d="M -80 -55 L 0 10 L 80 -55" fill="none" stroke={C.paperDark} strokeWidth={4} />
      </g>
      <Label x={640} y={230} text="великодушие и расчёт" color={HERO.sonya} size={30} k={pop(t, at(c, 1) + 3)} />
    </Stage>
  );
};
