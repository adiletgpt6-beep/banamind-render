// Залы 3–4: Совет у Элронда, цепь вместо кольца, слепое пятно врага, доброволец,
// девять путников без клятвы, мешок Сэма, повязки для всех, мост, испытание Галадриэли.
import React from "react";
import { interpolate } from "remotion";
import { C, SERIF } from "../theme";
import { cxOf } from "./common";
import { Figure, Label, OL, Ring, type FigureKind } from "./figures";
import { Arrow, Check, Cross, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

type P = { host?: string; [k: string]: unknown };

// ── круглый Совет: фигуры вокруг стола, реплика Боромира ──
export const Council: React.FC<VisualProps<P & { speaker: string; bubble: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const seats: { kind: FigureKind; color?: string; label: string }[] = [
    { kind: "elf", label: "эльфы", color: "#6fa8c9" },
    { kind: "dwarf", label: "гномы" },
    { kind: "man", label: "Боромир", color: "#a8443c" },
    { kind: "hobbit", label: "хоббиты" },
    { kind: "wizard", label: "маг" },
  ];
  const speak = ramp(t, at(c, 1), 0.5);
  return (
    <g>
      <ellipse cx={cx} cy={800} rx={560} ry={110} fill="#e6dcc8" stroke={OL} strokeWidth={5} />
      <Ring x={cx} y={790} r={34} glow={0.8} t={t} />
      {seats.map((s, i) => {
        const a = pop(t, 0.1 + i * 0.12);
        const x = cx - 500 + i * 250;
        const big = s.label === p.speaker ? 1 + 0.06 * speak : 1;
        return (
          <g key={i} opacity={clamp01(a * 1.4)} transform={`translate(0 ${(1 - a) * 30})`}>
            <Figure kind={s.kind} x={x} y={740} s={0.78 * big} t={t} color={s.color} mood={s.label === p.speaker && speak > 0 ? "angry" : "calm"} arm={s.label === p.speaker && speak > 0 ? "up" : "down"} />
            <Txt x={x} y={890} size={28} weight={900} color={C.inkSoft}>
              {s.label}
            </Txt>
          </g>
        );
      })}
      {speak > 0 && (
        <g transform={`translate(${cx} 200) scale(${pop(t, at(c, 1))})`}>
          <rect x={-380} y={-80} width={760} height={150} rx={40} fill="#fff" stroke={C.red} strokeWidth={6} />
          <path d="M 0 70 L 30 120 L 50 70 Z" fill="#fff" stroke={C.red} strokeWidth={6} strokeLinejoin="round" />
          {p.bubble.split("\n").map((l, i) => (
            <Txt key={i} x={0} y={-12 + i * 54} size={46} weight={900} color={C.red}>
              {l}
            </Txt>
          ))}
        </g>
      )}
    </g>
  );
};

// ── кольцо превращается в цепь ──
export const Chain: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const grow = ramp(t, 0.4, 2.4);
  const n = 7;
  const shadow = ramp(t, at(c, 1), 1);
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const k = clamp01(grow * n - i);
        const x = cx - 540 + i * 180;
        return (
          <g key={i} transform={`translate(${x} ${480 + Math.sin(i + t) * 10}) rotate(${i % 2 ? 90 : 0})`} opacity={k}>
            <ellipse rx={90} ry={50} fill="none" stroke={OL} strokeWidth={30} />
            <ellipse rx={90} ry={50} fill="none" stroke={i === 0 ? C.gold : interpolate(i, [0, n - 1], [0, 1]) > 0.5 ? "#8a8a92" : "#c9a85a"} strokeWidth={22} />
          </g>
        );
      })}
      <Pop t={t} at={at(c, 0.3)} x={cx - 540} y={260}>
        <Label x={0} y={0} text="победа с Кольцом" size={34} bg={C.goldLight} />
      </Pop>
      <Pop t={t} at={at(c, 0.8)} x={cx + 540} y={260}>
        <Label x={0} y={0} text="новый Тёмный Властелин" size={34} bg="#fff4ec" />
      </Pop>
      <g opacity={shadow}>
        <Txt x={cx} y={760} size={48} weight={900} color={C.inkSoft}>
          «даже в Сауроне вначале не было зла»
        </Txt>
      </g>
    </g>
  );
};

// ── слепое пятно: тень видит только жажду власти ──
export const BlindSpot: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.1);
  const thoughts = ["занять трон", "взять Кольцо", "стать сильнее"];
  const missing = ramp(t, at(c, 1), 0.8);
  return (
    <g>
      <g transform={`translate(${cx - 300} 0) scale(${k})`} style={{ transformOrigin: `${cx - 300}px 600px` }}>
        <Figure kind="shadow" x={0} y={880} s={1.5} t={t} />
      </g>
      {thoughts.map((w, i) => (
        <Pop key={w} t={t} at={at(c, 0.2 + i * 0.15)} x={cx + 250} y={260 + i * 120}>
          <Label x={0} y={0} text={w} size={36} bg="#fff" />
          <Check x={210} y={-8} s={30} k={1} color={C.inkSoft} />
        </Pop>
      ))}
      {missing > 0 && (
        <g opacity={missing} transform={`translate(${cx + 250} 660)`}>
          <rect x={-240} y={-56} width={480} height={100} rx={20} fill="none" stroke={C.goldDeep} strokeWidth={5} strokeDasharray="16 12" />
          <Txt x={0} y={12} size={40} weight={900} color={C.goldDeep}>
            уничтожить?
          </Txt>
          <Txt x={0} y={110} size={32} weight={800} color={C.inkSoft}>
            не приходит в голову
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── самый маленький поднимается ──
export const Volunteer: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const stand = ramp(t, at(c, 0.4), 0.8);
  const tall: FigureKind[] = ["elf", "man", "wizard", "dwarf", "man"];
  return (
    <g>
      {tall.map((k, i) => (
        <Figure key={i} kind={k} x={cx - 560 + i * 190 + (i > 2 ? 380 : 0)} y={860} s={0.9} t={t} mood="sad" opacity={0.75} color={i === 4 ? "#a8443c" : undefined} />
      ))}
      <g transform={`translate(0 ${(1 - stand) * 40})`}>
        <Figure kind="hobbit" x={cx + 20} y={860} s={1.1 + 0.08 * stand} t={t} mood="calm" label="Фродо" arm={stand > 0.5 ? "up" : "down"} />
      </g>
      {stand > 0 && <circle cx={cx + 20} cy={560} r={200} fill={C.goldLight} opacity={0.25 * stand} />}
      <Pop t={t} at={at(c, 0.6)} x={cx} y={200}>
        <rect x={-470} y={-62} width={940} height={112} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
        <text x={0} y={14} fontFamily={SERIF} fontWeight={700} fontSize={42} fill={C.ink} textAnchor="middle">
          «Я готов отнести Кольцо»
        </text>
      </Pop>
      <Pop t={t} at={at(c, 1.2)} x={cx} y={340}>
        <Label x={0} y={0} text="слабые руки меняют мир" size={34} bg={C.goldLight} />
      </Pop>
    </g>
  );
};

// ── девять путников без клятвы ──
export const Fellowship: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const nine: { kind: FigureKind; label: string; color?: string }[] = [
    { kind: "wizard", label: "Гэндальф" },
    { kind: "man", label: "Арагорн", color: "#4f6b55" },
    { kind: "man", label: "Боромир", color: "#a8443c" },
    { kind: "elf", label: "Леголас" },
    { kind: "dwarf", label: "Гимли" },
    { kind: "hobbit", label: "Фродо" },
    { kind: "sam", label: "Сэм" },
    { kind: "hobbit", label: "Мерри", color: "#c98a3a" },
    { kind: "hobbit", label: "Пин", color: "#5a7fc4" },
  ];
  const free = ramp(t, at(c, 1), 0.8);
  return (
    <g>
      {nine.map((f, i) => {
        const a = pop(t, at(c, 0.1 + i * 0.07));
        const x = cx - 720 + i * 180;
        return (
          <g key={i} opacity={clamp01(a * 1.4)}>
            <Figure kind={f.kind} x={x} y={800} s={0.62} t={t + i} color={f.color} mood="calm" />
            <Txt x={x} y={850} size={26} weight={900} color={C.inkSoft}>
              {f.label}
            </Txt>
          </g>
        );
      })}
      <Pop t={t} at={at(c, 0.6)} x={cx} y={200}>
        <Label x={0} y={0} text="9 путников против 9 Всадников" size={40} bg={C.goldLight} />
      </Pop>
      {free > 0 && (
        <g opacity={free} transform={`translate(${cx} 330)`}>
          <Txt x={0} y={0} size={42} weight={900} color={C.greenDeep}>
            никто не связан клятвой
          </Txt>
          <Cross x={-380} y={-14} s={44} k={free} />
        </g>
      )}
    </g>
  );
};

// ── мешок Сэма: соль, верёвка, еда ──
export const SamPack: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = ["соль", "верёвка", "котелок", "еда"];
  return (
    <g>
      <Figure kind="sam" x={cx - 260} y={860} s={1.4} t={t} mood="happy" label="Сэм" />
      <g transform={`translate(${cx - 140} 600) rotate(${wob(t, 1, 3)})`}>
        <path d="M -60 -90 Q 0 -120 60 -90 L 80 90 Q 0 120 -80 90 Z" fill="#a2783a" stroke={OL} strokeWidth={5} />
        <rect x={-40} y={-30} width={80} height={50} rx={10} fill="#c99a5a" stroke={OL} strokeWidth={4} />
      </g>
      {items.map((w, i) => (
        <Pop key={w} t={t} at={at(c, 1 + i * 0.15)} x={cx + 260 + (i % 2) * 220} y={330 + Math.floor(i / 2) * 150}>
          <Label x={0} y={0} text={w} size={36} bg={i === 0 ? C.goldLight : "#fff"} />
        </Pop>
      ))}
      <Pop t={t} at={at(c, 0.3)} x={cx + 360} y={200}>
        <Txt x={0} y={0} size={40} weight={900} color={C.greenDeep}>
          «Я за двоих понесу»
        </Txt>
      </Pop>
    </g>
  );
};

// ── повязки для всех ──
export const Blindfold: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const all = ramp(t, at(c, 1), 1.2);
  const row: { kind: FigureKind; label: string; color?: string }[] = [
    { kind: "dwarf", label: "Гимли" },
    { kind: "man", label: "Арагорн", color: "#4f6b55" },
    { kind: "elf", label: "Леголас" },
    { kind: "hobbit", label: "Фродо" },
  ];
  return (
    <g>
      {row.map((f, i) => {
        const x = cx - 450 + i * 300;
        const on = i === 0 ? 1 : clamp01(all * row.length - i + 1);
        const h = f.kind === "dwarf" ? 200 : f.kind === "hobbit" ? 170 : 300;
        return (
          <g key={i}>
            <Figure kind={f.kind} x={x} y={860} s={1} t={t} color={f.color} label={f.label} mood={i === 0 && all < 0.3 ? "sad" : "calm"} />
            {on > 0 && <rect x={x - 46} y={860 - h + (f.kind === "hobbit" ? 30 : 24)} width={92} height={22} rx={8} fill={C.violet} stroke={OL} strokeWidth={3} opacity={on} />}
          </g>
        );
      })}
      <Pop t={t} at={at(c, 1.1)} x={cx} y={220}>
        <Label x={0} y={0} text="неудобство — поровну" size={40} bg={C.goldLight} />
      </Pop>
    </g>
  );
};

// ── мост над бездной ──
export const Bridge: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const brk = ramp(t, at(c, 0.6), 1);
  const fall = ramp(t, at(c, 0.8), 1.4);
  return (
    <g>
      <rect x={cx - 760} y={560} width={1520} height={360} fill="#3e3a46" opacity={0.85} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${cx - 700 + i * 320} 920 q 30 -60 60 0`} fill={C.ember} opacity={0.4 + 0.3 * Math.sin(t * 3 + i)} />
      ))}
      <rect x={cx - 760} y={540} width={360} height={40} fill="#8a8191" stroke={OL} strokeWidth={4} />
      <rect x={cx + 400} y={540} width={360} height={40} fill="#8a8191" stroke={OL} strokeWidth={4} />
      <g transform={`translate(${cx} ${560 + brk * 300}) rotate(${brk * 18})`} opacity={1 - brk * 0.8}>
        <rect x={-400} y={-20} width={800} height={26} fill="#8a8191" stroke={OL} strokeWidth={4} />
      </g>
      <g transform={`translate(0 ${fall * 360})`} opacity={1 - fall}>
        <Figure kind="wizard" x={cx} y={540} s={0.9} t={t} mood="angry" arm="up" />
      </g>
      <g transform={`translate(${cx - 620} 540)`}>
        <Figure kind="hobbit" x={0} y={0} s={0.55} t={t} mood="scared" />
        <Figure kind="man" x={90} y={0} s={0.55} t={t} color="#4f6b55" mood="sad" />
      </g>
      <Pop t={t} at={at(c, 1.3)} x={cx} y={250}>
        <Label x={0} y={0} text="«и без надежды»" size={42} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── испытание Галадриэли: становится выше — и снова «меньше» ──
export const Galadriel: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const offer = ramp(t, 0.2, 1);
  const grow = ramp(t, at(c, 1), 1) * (1 - ramp(t, at(c, 2), 1.2));
  const pass = ramp(t, at(c, 2.2), 0.8);
  return (
    <g>
      {/* чаша Зеркала */}
      <ellipse cx={cx + 260} cy={850} rx={180} ry={40} fill="#cfd8e2" stroke={OL} strokeWidth={4} />
      <Figure kind="hobbit" x={cx - 420} y={870} s={1} t={t} label="Фродо" arm="out" />
      <Ring x={cx - 300 + offer * 200} y={620} r={32} glow={0.9} t={t} />
      <g transform={`translate(${cx + 120} 870) scale(${1 + grow * 0.55})`}>
        <Figure kind="lady" x={0} y={0} s={1} t={t} mood={grow > 0.3 ? "angry" : "calm"} color={grow > 0.3 ? "#cfdcf0" : undefined} />
      </g>
      {grow > 0.05 && <circle cx={cx + 120} cy={870 - 330 * (1 + grow * 0.55) * 0.6} r={260 * grow} fill="#e8f0ff" opacity={0.35 * grow} />}
      <Txt x={cx + 120} y={920} size={30} weight={900} color={C.inkSoft}>
        Галадриэль
      </Txt>
      <Pop t={t} at={at(c, 1.1)} x={cx + 380} y={220}>
        <Label x={0} y={0} text="«прекрасная и грозная»" size={34} bg="#fff4ec" />
      </Pop>
      {pass > 0 && (
        <g opacity={pass} transform={`translate(${cx - 300} 300)`}>
          <Check x={-200} y={0} s={40} k={pass} />
          <text x={-150} y={14} fontFamily={SERIF} fontWeight={700} fontSize={44} fill={C.greenDeep}>
            «Я прошла испытание»
          </text>
        </g>
      )}
      {pass > 0.5 && <Arrow x1={cx + 300} y1={560} x2={cx + 600} y2={460} k={pass} color={C.sea} w={8} />}
      {pass > 0.5 && (
        <Txt x={cx + 620} y={430} size={30} weight={900} color={C.sea} anchor="start">
          за Море
        </Txt>
      )}
    </g>
  );
};
