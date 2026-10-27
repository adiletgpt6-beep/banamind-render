// Слой 1 — личный выбор: салон-«прядильня», наследство, мечта о славе, дуэль, паром,
// дуб, окно в Отрадном, бал, сцена-обман, семейные счета, сеть семей, свеча в Мытищах.
// Все сцены — собственные условные композиции BanaMind (силуэты, предметы, жесты).
import React from "react";
import { interpolate } from "remotion";
import { rnd } from "../components/Background";
import { C, SERIF } from "../theme";
import { Card, cxOf, dark, ink, Label, type P } from "./common";
import { NameTag, Person, type Who } from "./figures";
import { Arrow, at, clamp01, Cross, pop, Pop, ramp, Txt, wob, type VisualProps } from "./kit";

// ── салон как прядильная мастерская: хозяйка поправляет «веретёна» разговоров ──
export const Salon: React.FC<VisualProps<P & { words?: string[] }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const groups = [
    { x: cx - 460, y: 700, who: ["man", "lady"] as Who[] },
    { x: cx, y: 640, who: ["pierre", "man"] as Who[] },
    { x: cx + 460, y: 700, who: ["helene", "anatole"] as Who[] },
  ];
  const stop = ramp(t, at(c, 1.2), 0.4) * (1 - ramp(t, at(c, 1.7), 0.5));
  const hostX = interpolate(ramp(t, at(c, 0.6), 1.2) + ramp(t, at(c, 1.6), 1.2), [0, 1, 2], [cx - 460, cx - 80, cx + 380]);
  return (
    <g>
      {/* люстра */}
      <g transform={`translate(${cx} 120)`}>
        <line x1={0} y1={-120} x2={0} y2={0} stroke={C.ink} strokeWidth={4} />
        <path d="M -150 0 Q 0 80 150 0" stroke={C.goldDeep} strokeWidth={8} fill="none" />
        {[-150, -75, 0, 75, 150].map((x, i) => (
          <g key={i}>
            <rect x={x - 6} y={-30 + Math.abs(x) * 0.1} width={12} height={34} fill="#fff" stroke={C.ink} strokeWidth={2} />
            <path d={`M ${x} ${-44 + Math.abs(x) * 0.1} q 8 -14 0 -26 q -8 12 0 26`} fill={C.gold} />
          </g>
        ))}
      </g>
      {groups.map((g, i) => {
        const spin = t * (stop > 0.5 && i === 1 ? 0.2 : 2.4) + i;
        return (
          <g key={i}>
            {/* «веретено» разговора над кружком */}
            <g transform={`translate(${g.x} ${g.y - 360})`}>
              <ellipse rx={70} ry={22} fill="none" stroke={i === 1 && stop > 0.3 ? C.red : C.goldDeep} strokeWidth={6} transform={`rotate(${(spin * 57) % 360})`} />
              <ellipse rx={22} ry={70} fill="none" stroke={C.goldDeep} strokeWidth={4} opacity={0.6} transform={`rotate(${(spin * 40) % 360})`} />
              <circle r={10} fill={C.gold} />
            </g>
            {g.who.map((w, j) => (
              <Person key={j} who={w} x={g.x - 70 + j * 140} y={g.y} s={0.8} t={t} flip={j === 1} arm={j === 0 ? "open" : "down"} />
            ))}
          </g>
        );
      })}
      <Person who="lady" x={hostX} y={820} s={0.75} t={t} arm="point" label="хозяйка" />
      {(p.words ?? []).map((w, i) => (
        <Pop key={i} t={t} at={at(c, 0.4 + i * 0.5)} x={cx - 420 + i * 420} y={900}>
          <Label x={0} y={0} text={w} size={30} bg="#fff" />
        </Pop>
      ))}
    </g>
  );
};

// ── наследство: портфель с завещанием, тянут в разные стороны; Пьер посередине ──
export const Inheritance: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const tug = Math.sin(t * 3) * 18 * (1 - ramp(t, at(c, 2), 0.6));
  const coins = ramp(t, at(c, 2), 2);
  return (
    <g>
      {/* портфель-мозаика */}
      <g transform={`translate(${cx + tug} 470) rotate(${tug * 0.2})`}>
        <rect x={-120} y={-80} width={240} height={160} rx={18} fill="#c97a3a" stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={-100 + (i % 4) * 50} y={-60 + Math.floor(i / 4) * 44} width={40} height={36} rx={6} fill={C.dots[i % 8]} opacity={0.9} />
        ))}
        <rect x={-40} y={-100} width={80} height={26} rx={10} fill="none" stroke={C.ink} strokeWidth={6} />
      </g>
      <Person who="lady" x={cx - 330} y={760} s={0.9} t={t} arm="reach" label="княжна" />
      <Person who="man" x={cx + 330} y={760} s={0.95} t={t} arm="reach" flip label="князь Василий" />
      <Pop t={t} at={at(c, 1)} x={cx} y={900}>
        <g>
          <Person who="pierre" x={0} y={0} s={0.7} t={t} />
          <NameTag x={0} y={46} text="Пьер" />
        </g>
      </Pop>
      {coins > 0 &&
        Array.from({ length: 40 }).map((_, i) => {
          const y = 120 + ((t * 120 + i * 53) % 700) * coins;
          return <circle key={i} cx={cx - 600 + rnd(i, 4) * 1200} cy={y} r={14} fill={C.gold} stroke={C.ink} strokeWidth={3} opacity={coins} />;
        })}
      <Pop t={t} at={at(c, 2.3)} x={cx} y={180}>
        <Label x={0} y={0} text="богатейший человек — и не знает, кто он" size={34} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── мечта о славе: «мой Тулон» — прожектор, знамя, золотой орден ──
export const Glory: React.FC<VisualProps<P & { text?: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const beam = ramp(t, 0.2, 1);
  const medal = pop(t, at(c, 1));
  return (
    <g>
      <path d={`M ${cx - 80} 0 L ${cx + 80} 0 L ${cx + 360} 900 L ${cx - 360} 900 Z`} fill="#fff3c4" opacity={0.6 * beam} />
      <Person who="andrei" x={cx} y={860} s={1.25} t={t} arm="up" label="князь Андрей" />
      <g transform={`translate(${cx + 30} ${560 - 40 * ramp(t, 0.3, 1)})`}>
        <line x1={0} y1={0} x2={0} y2={-300} stroke={C.ink} strokeWidth={8} />
        <path d={`M 0 -300 q 120 ${-30 + wob(t, 1, 14)} 220 0 q -100 30 -220 80 Z`} fill={C.red} stroke={C.ink} strokeWidth={4} opacity={beam} />
      </g>
      {medal > 0 && (
        <g transform={`translate(${cx + 430} 330) scale(${medal}) rotate(${wob(t, 2, 6)})`}>
          <path d="M -40 -140 L 0 -60 L 40 -140 Z" fill={C.red} />
          <circle r={86} fill={C.gold} stroke={C.ink} strokeWidth={6} />
          <path d="M 0 -50 L 14 -14 L 52 -14 L 22 8 L 32 46 L 0 24 L -32 46 L -22 8 L -52 -14 L -14 -14 Z" fill={C.goldLight} />
        </g>
      )}
      {p.text && (
        <Pop t={t} at={at(c, 0.5)} x={cx - 430} y={260}>
          <Label x={0} y={0} text={p.text} size={40} bg="#fff" />
        </Pop>
      )}
    </g>
  );
};

// ── дуэль в снегу: неумелый стрелок, барьер, попадание наугад ──
export const Duel: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const walk = ramp(t, at(c, 0.3), 2);
  const shot = ramp(t, at(c, 1.3), 0.25);
  return (
    <g>
      <rect x={0} y={760} width={1920} height={320} fill="#f4f7fb" />
      {Array.from({ length: 60 }).map((_, i) => (
        <circle key={i} cx={rnd(i, 8) * 1920} cy={(rnd(i, 9) * 900 + t * 40) % 900} r={4} fill="#fff" stroke="#c9d6e3" strokeWidth={1} />
      ))}
      {[-1, 1].map((s) => (
        <g key={s}>
          <line x1={cx + s * 120} y1={740} x2={cx + s * 120} y2={800} stroke={C.ink} strokeWidth={6} />
          <path d={`M ${cx + s * 120} 760 l ${s * 30} -10 l 0 20 Z`} fill={C.red} />
        </g>
      ))}
      <Person who="pierre" x={cx - 520 + walk * 260} y={800} s={1} t={t} arm="point" label="Пьер" />
      <Person who="dolokhov" x={cx + 520 - walk * 220} y={800} s={1} t={t} flip label="Долохов" />
      {shot > 0 && <circle cx={cx - 260 + walk * 260 + 80} cy={560} r={26 * shot} fill="#fff" stroke={C.ink} strokeWidth={3} opacity={1 - shot * 0.5} />}
      <Pop t={t} at={at(c, 1.5)} x={cx} y={250}>
        <Label x={0} y={0} text="стреляет впервые в жизни — и попадает" size={34} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── паром: двое на плоту посреди реки, небо отражается в воде ──
export const Ferry: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const sky = ramp(t, at(c, 1), 1.6);
  return (
    <g>
      <rect x={0} y={560} width={1920} height={520} fill="#bcd9ec" />
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d={`M ${(i * 180 + t * 30) % 2100 - 100} ${640 + (i % 4) * 90} q 40 -14 80 0`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.7} />
      ))}
      <rect x={cx - 380} y={720} width={760} height={46} rx={10} fill="#a07a4a" stroke={C.ink} strokeWidth={5} transform={`rotate(${wob(t, 1, 0.8)} ${cx} 740)`} />
      <line x1={0} y1={600} x2={1920} y2={560} stroke={C.ink} strokeWidth={4} opacity={0.5} />
      <Person who="pierre" x={cx - 140} y={724} s={0.95} t={t} arm="up" label="Пьер" />
      <Person who="andrei" x={cx + 150} y={724} s={0.95} t={t} flip label="Андрей" />
      {sky > 0 && (
        <g opacity={sky}>
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={cx - 300 + i * 320 + Math.sin(t * 0.3 + i) * 30} cy={170 + i * 30} rx={150} ry={42} fill="#fff" opacity={0.9} />
          ))}
          <Label x={cx} y={300} text="впервые после Аустерлица — снова небо" size={34} bg="#fff" />
        </g>
      )}
    </g>
  );
};

// ── дуб: сухой зимний / в молодой листве ──
export const Oak: React.FC<VisualProps<P & { mode: "dead" | "green" | "both" }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const greenK = p.mode === "green" ? ramp(t, 0.3, 1.5) : p.mode === "both" ? ramp(t, at(c, 1), 2) : 0;
  const leaves = Array.from({ length: 70 }).map((_, i) => ({ a: rnd(i, 12) * Math.PI * 2, r: 60 + rnd(i, 13) * 260, s: 20 + rnd(i, 14) * 16 }));
  return (
    <g>
      <rect x={0} y={840} width={1920} height={240} fill={greenK > 0.5 ? "#cfe8b4" : "#e8e3d6"} />
      <g transform={`translate(${cx} 840)`}>
        <path d="M -60 0 L -40 -330 Q -150 -420 -300 -470 M -40 -330 Q 30 -480 -20 -620 M -30 -300 L 40 -360 Q 160 -420 280 -520 M 40 -360 Q 90 -470 170 -560 M 60 0 L 30 -300" stroke="#5a4232" strokeWidth={46} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M -40 -330 Q -150 -420 -300 -470 M 40 -360 Q 160 -420 280 -520" stroke="#5a4232" strokeWidth={20} fill="none" strokeLinecap="round" />
        {leaves.map((l, i) => {
          const k = clamp01(greenK * 1.4 - (i / leaves.length) * 0.4);
          return k > 0 ? <circle key={i} cx={Math.cos(l.a) * l.r} cy={-450 + Math.sin(l.a) * l.r * 0.55} r={l.s * k} fill={i % 3 ? "#3fae6a" : "#7cc46a"} stroke="#2b7d4c" strokeWidth={2} /> : null;
        })}
      </g>
      <Pop t={t} at={at(c, 0.4)} x={cx - 520} y={250}>
        <Label x={0} y={0} text={greenK > 0.5 ? "тот же дуб — в листве" : "старый дуб: «весны нет»"} size={34} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── окно в Отрадном: лунная ночь, голос сверху, слушатель внизу ──
export const Window: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const notes = ramp(t, at(c, 0.6), 1);
  return (
    <g>
      <rect x={cx - 640} y={100} width={1280} height={760} rx={20} fill="#1d2a5a" />
      <circle cx={cx + 380} cy={250} r={80} fill="#fff6d8" />
      {Array.from({ length: 30 }).map((_, i) => (
        <circle key={i} cx={cx - 620 + rnd(i, 15) * 1240} cy={120 + rnd(i, 16) * 300} r={3} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t + i)} />
      ))}
      {/* окно верхнего этажа */}
      <rect x={cx - 420} y={260} width={300} height={260} rx={10} fill="#ffe9a8" stroke={C.ink} strokeWidth={8} />
      <line x1={cx - 270} y1={260} x2={cx - 270} y2={520} stroke={C.ink} strokeWidth={6} />
      <Person who="natasha" x={cx - 270} y={520} s={0.62} t={t} arm="up" />
      {notes > 0 &&
        [0, 1, 2, 3].map((i) => (
          <text key={i} x={cx - 120 + i * 90 + Math.sin(t * 2 + i) * 10} y={300 + i * 40 - ((t * 30) % 60)} fontSize={60} fill="#ffe9a8" opacity={notes}>
            ♪
          </text>
        ))}
      {/* нижнее окно: Андрей не спит */}
      <rect x={cx + 60} y={600} width={260} height={220} rx={10} fill="#e9d48a" stroke={C.ink} strokeWidth={8} />
      <Person who="andrei" x={cx + 190} y={820} s={0.6} t={t} />
      <Pop t={t} at={at(c, 1.2)} x={cx + 190} y={900}>
        <Label x={0} y={0} text="случайно услышал" size={30} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── бал: пары кружатся; одна фигура у стены ждёт приглашения ──
export const Ball: React.FC<VisualProps<P & { folk?: boolean }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const invite = ramp(t, at(c, 1), 1);
  return (
    <g>
      <rect x={cx - 700} y={760} width={1400} height={120} fill="#e8d4a8" opacity={0.6} />
      {Array.from({ length: 4 }).map((_, i) => {
        const a = t * 0.8 + (i * Math.PI) / 2;
        const x = cx + Math.cos(a) * 420;
        const y = 700 + Math.sin(a) * 60;
        return (
          <g key={i} opacity={0.75}>
            <Person who="lady" x={x - 40} y={y} s={0.62} t={t} arm="out" />
            <Person who="man" x={x + 40} y={y} s={0.66} t={t} arm="out" flip />
          </g>
        );
      })}
      <Person who="natasha" x={cx - 120 + invite * 120} y={840} s={0.95} t={t} arm={invite > 0.5 ? "out" : "down"} label="Наташа" glow={invite} />
      <Person who="andrei" x={cx + 230 - invite * 100} y={840} s={1} t={t} arm={invite > 0.3 ? "reach" : "down"} flip label="Андрей" />
    </g>
  );
};

// ── сцена-обман: картонная декорация театра, «увлекательный» соблазнитель, разорванное письмо ──
export const Stage: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const fake = ramp(t, at(c, 0.5), 1);
  const plan = ramp(t, at(c, 1.5), 1.2);
  const stop = ramp(t, at(c, 2.3), 0.5);
  return (
    <g>
      {/* картонная сцена: плоские деревья и луна на палке */}
      <rect x={cx - 640} y={140} width={1280} height={560} fill="#f3e0c0" stroke={C.ink} strokeWidth={6} />
      <path d={`M ${cx - 640} 140 Q ${cx - 520} 360 ${cx - 640} 700 Z M ${cx + 640} 140 Q ${cx + 520} 360 ${cx + 640} 700 Z`} fill={C.red} />
      <g opacity={fake}>
        <path d={`M ${cx - 420} 600 l 60 -220 l 60 220 Z M ${cx + 300} 600 l 60 -260 l 60 260 Z`} fill="#6fae6a" stroke={C.ink} strokeWidth={4} />
        <line x1={cx + 150} y1={140} x2={cx + 150} y2={250} stroke={C.ink} strokeWidth={3} />
        <circle cx={cx + 150} cy={270} r={34} fill="#fff6d8" stroke={C.ink} strokeWidth={3} />
        <Label x={cx - 60} y={220} text="картон и краска" size={28} bg="#fff" />
      </g>
      <Person who="natasha" x={cx - 140} y={860} s={0.95} t={t} label="Наташа" />
      <Person who="anatole" x={cx + 120} y={860} s={0.95} t={t} arm="reach" flip label="Анатоль" />
      {plan > 0 && <Arrow x1={cx + 60} y1={930} x2={cx + 680} y2={930} k={plan * (1 - stop * 0.3)} color={C.red} w={10} />}
      {stop > 0 && (
        <g>
          <Cross x={cx + 560} y={930} s={90} k={stop} />
          <Label x={cx + 560} y={830} text="побег сорван" size={30} bg="#fff" />
        </g>
      )}
    </g>
  );
};

// ── семейная бухгалтерия: долги растут, выбор сужается ──
export const Ledger: React.FC<VisualProps<P & { rows: string[]; note?: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const k = pop(t, 0.1);
  return (
    <g>
      <g transform={`translate(${cx} 470) scale(${k}) rotate(-2)`}>
        <Card x={-520} y={-330} w={1040} h={620} fill="#fffaf0" />
        <line x1={0} y1={-310} x2={0} y2={270} stroke={C.ink} strokeOpacity={0.25} strokeWidth={3} />
        <Txt x={-260} y={-250} size={36} weight={900} color={C.inkSoft}>
          ПРИХОД
        </Txt>
        <Txt x={260} y={-250} size={36} weight={900} color={C.red}>
          ДОЛГИ
        </Txt>
        {p.rows.map((r, i) => {
          const kk = ramp(t, at(c, Math.min(i * 0.6 + 0.4, c.beats.length - 0.1)), 0.5);
          const h = 30 + i * 46;
          return (
            <g key={i} opacity={kk}>
              <rect x={60} y={-170 + i * 100} width={h * 4 * kk} height={44} rx={10} fill={C.red} opacity={0.8} />
              <Txt x={-480} y={-136 + i * 100} size={34} anchor="start" weight={800}>
                {r}
              </Txt>
            </g>
          );
        })}
      </g>
      {p.note && (
        <Pop t={t} at={at(c, c.beats.length - 0.5)} x={cx} y={900}>
          <Label x={0} y={0} text={p.note} size={34} bg="#fff" />
        </Pop>
      )}
    </g>
  );
};

// ── сеть семей: дома-узлы и нити связей (браки, долги, обещания) ──
export const Families: React.FC<VisualProps<P & { nodes: { id: string; name: string; who: Who; x: number; y: number }[]; links: { a: string; b: string; t: string; c?: string }[] }>> = (c) => {
  const { t, p } = c;
  const by = new Map(p.nodes.map((n) => [n.id, n]));
  return (
    <g>
      {p.links.map((l, i) => {
        const a = by.get(l.a)!;
        const b = by.get(l.b)!;
        const k = ramp(t, at(c, Math.min(0.5 + i * 0.45, c.beats.length - 0.2)), 0.8);
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - 60;
        return (
          <g key={i} opacity={k > 0 ? 1 : 0}>
            <path d={`M ${a.x} ${a.y - 120} Q ${mx} ${my - 120} ${a.x + (b.x - a.x) * k} ${a.y - 120 + (b.y - a.y) * k}`} stroke={l.c ?? C.goldDeep} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={l.c === C.red ? "16 12" : undefined} />
            {k > 0.9 && <Label x={mx} y={my - 130} text={l.t} size={26} bg="#fff" />}
          </g>
        );
      })}
      {p.nodes.map((n, i) => (
        <Pop key={n.id} t={t} at={0.2 + i * 0.18} x={n.x} y={n.y}>
          <g>
            <Person who={n.who} x={0} y={0} s={0.62} t={t} />
            <NameTag x={0} y={40} text={n.name} s={0.85} />
          </g>
        </Pop>
      ))}
    </g>
  );
};

// ── свеча у постели раненого: прощение и тишина ──
export const Candle: React.FC<VisualProps<P & { a?: Who; b?: Who; la?: string; lb?: string; text?: string; aStand?: boolean; bLie?: boolean }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const light = 0.75 + 0.08 * Math.sin(t * 5) + 0.05 * Math.sin(t * 13);
  return (
    <g>
      <circle cx={cx} cy={520} r={430} fill="#ffe7a3" opacity={0.35 * light} />
      <circle cx={cx} cy={520} r={260} fill="#ffe7a3" opacity={0.35 * light} />
      <rect x={cx - 16} y={460} width={32} height={110} rx={6} fill="#fff" stroke={C.ink} strokeWidth={4} />
      <path d={`M ${cx} 400 q 22 30 0 60 q -22 -30 0 -60`} fill={C.gold} stroke={C.goldDeep} strokeWidth={3} transform={`rotate(${wob(t * 2, 1, 4)} ${cx} 460)`} />
      <rect x={cx - 120} y={570} width={240} height={20} rx={8} fill="#8a6a4a" />
      <Person who={p.a ?? "andrei"} x={cx + 380} y={p.aStand ? 820 : 760} s={1} t={t} lie={!p.aStand} flip={p.aStand} label={p.la ?? "Андрей"} />
      <Person who={p.b ?? "natasha"} x={cx - 380} y={p.bLie ? 760 : 800} s={0.95} t={t} arm="reach" lie={p.bLie} label={p.lb ?? "Наташа"} />
      {p.text && (
        <Pop t={t} at={at(c, 1)} x={cx} y={220}>
          <Label x={0} y={0} text={p.text} size={34} bg="#fff" />
        </Pop>
      )}
    </g>
  );
};

// ── два пути: развилка с двумя исходами одного выбора ──
export const Fork: React.FC<VisualProps<P & { who: Who; name: string; a: string; b: string; pick?: "a" | "b"; title?: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const roadK = ramp(t, 0.2, 1);
  const pickK = ramp(t, at(c, 1.4), 1);
  const dir = p.pick === "b" ? 1 : -1;
  return (
    <g>
      <path d={`M ${cx} 960 L ${cx} 640 Q ${cx} 520 ${cx - 480} 300 M ${cx} 640 Q ${cx} 520 ${cx + 480} 300`} stroke="#d8c4a0" strokeWidth={110} fill="none" strokeLinecap="round" opacity={roadK} />
      <path d={`M ${cx} 960 L ${cx} 640 Q ${cx} 520 ${cx + dir * 480} 300`} stroke={C.gold} strokeWidth={22} fill="none" strokeLinecap="round" strokeDasharray={1200} strokeDashoffset={1200 * (1 - pickK)} />
      <Pop t={t} at={at(c, 0.4)} x={cx - 480} y={230}>
        <Label x={0} y={0} text={p.a} size={34} bg={p.pick === "a" ? C.goldLight : "#fff"} />
      </Pop>
      <Pop t={t} at={at(c, 0.9)} x={cx + 480} y={230}>
        <Label x={0} y={0} text={p.b} size={34} bg={p.pick === "b" ? C.goldLight : "#fff"} />
      </Pop>
      <Person who={p.who} x={cx + dir * 200 * pickK} y={900 - 220 * pickK} s={0.9 - 0.25 * pickK} t={t} label={p.name} />
      {p.title && (
        <Txt x={cx} y={120} size={44} weight={900} color={ink(p)}>
          {p.title}
        </Txt>
      )}
    </g>
  );
};

// ── письмо/записка: несколько строк от руки, печать ──
export const Letter: React.FC<VisualProps<P & { lines: string[]; sign?: string; torn?: boolean }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const k = pop(t, 0.1);
  const tear = p.torn ? ramp(t, at(c, c.beats.length - 0.6), 0.6) : 0;
  return (
    <g transform={`translate(${cx} 470) scale(${k}) rotate(${-3 + wob(t * 0.4, 3, 1)})`}>
      <g transform={`translate(${-tear * 60} 0) rotate(${-tear * 6})`}>
        <path d="M -460 -330 L 0 -330 L 10 -200 L -10 -60 L 12 80 L 0 330 L -460 330 Z" fill="#fffaf0" stroke={C.ink} strokeWidth={5} />
      </g>
      <g transform={`translate(${tear * 60} 0) rotate(${tear * 6})`}>
        <path d="M 460 -330 L 0 -330 L 10 -200 L -10 -60 L 12 80 L 0 330 L 460 330 Z" fill="#fffaf0" stroke={C.ink} strokeWidth={5} />
      </g>
      {p.lines.map((l, i) => (
        <text key={i} x={-400} y={-220 + i * 86} fontFamily={SERIF} fontStyle="italic" fontWeight={700} fontSize={52} fill={C.ink} opacity={ramp(t, at(c, Math.min(i * 0.5, c.beats.length - 0.2)), 0.6)}>
          {l}
        </text>
      ))}
      {p.sign && (
        <g transform="translate(300 230)">
          <circle r={56} fill={C.red} stroke={C.ink} strokeWidth={4} />
          <Txt x={0} y={14} size={40} color="#fff" weight={900}>
            {p.sign}
          </Txt>
        </g>
      )}
    </g>
  );
};

export { dark };
