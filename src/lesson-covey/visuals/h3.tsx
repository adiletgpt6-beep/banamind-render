// Навык 3 «Сначала делайте то, что необходимо делать сначала»: матрица срочного и
// важного (в переводе — «квадраты»), волна первого квадрата, сердце — второй квадрат,
// вежливое «нет» ради большого «да», неделя вместо списка, делегирование результатов.
import React from "react";
import { C, DISPLAY, FONT, HABIT } from "../theme";
import { Bubble, Card, Icon, Label, OL, Person, Phone, WeekGrid } from "./draw";
import { Appear, area, Arrow, at, Check, clamp01, Drift, Pop, ramp, Txt, wob, type VisualProps } from "./kit";

const H3 = HABIT[3].color;

const Q = [
  { n: "I", title: "срочно и важно", items: ["кризисы · авралы", "горящие сроки"], color: "#ff7a6b" },
  { n: "II", title: "важно, не срочно", items: ["отношения · подготовка", "план · здоровье"], color: "#2fbf71" },
  { n: "III", title: "срочно, не важно", items: ["многие звонки · письма", "чужие просьбы"], color: "#ffb84a" },
  { n: "IV", title: "не срочно и не важно", items: ["бегство", "пустая лента"], color: "#9aa6c4" },
];

type MatrixP = { host?: string; mode: "build" | "quadrants" };
export const Matrix: React.FC<VisualProps<MatrixP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const cy = 470;
  const cw = p.mode === "build" ? 300 : 420;
  const ch = p.mode === "build" ? 220 : 270;
  // расположение как у Кови: столбцы — срочно / не срочно, строки — важно / не важно
  const pos = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  if (p.mode === "build") {
    const b1 = at(ctx, 1);
    const b2 = at(ctx, 2);
    const gridK = ramp(t, 0.4, 0.8);
    return (
      <Drift t={t} dur={dur} cx={cx} cy={cy}>
        {pos.map(([dx, dy], i) => (
          <g key={i} opacity={gridK} transform={`translate(${cx + 60 + dx * (cw / 2 + 6)} ${cy + dy * (ch / 2 + 6)})`}>
            <rect x={-cw / 2} y={-ch / 2} width={cw} height={ch} rx={22} fill={C.white} stroke={OL} strokeWidth={5} opacity={0.94} />
            <text y={30} fontFamily={DISPLAY} fontWeight={800} fontSize={90} fill={Q[i].color} textAnchor="middle" opacity={0.85}>
              {Q[i].n}
            </text>
          </g>
        ))}
        <Appear t={t} at={b1} x={0} y={0}>
          <Arrow x1={cx + 60 - cw - 10} y1={cy - ch - 50} x2={cx + 60 + cw + 10} y2={cy - ch - 50} k={ramp(t, b1, 0.8)} color={C.white} w={10} />
          <Txt x={cx + 60 - cw / 2} y={cy - ch - 75} size={32} color={C.white} weight={900}>
            срочно
          </Txt>
          <Txt x={cx + 60 + cw / 2} y={cy - ch - 75} size={32} color={C.white} weight={900}>
            не срочно
          </Txt>
          <Phone x={cx + 60 - cw - 130} y={cy - ch + 40} s={0.5} t={t} ring={0.8} />
        </Appear>
        <Appear t={t} at={b1 + 1.4} x={0} y={0}>
          <Arrow x1={cx + 60 - cw - 50} y1={cy - ch} x2={cx + 60 - cw - 50} y2={cy + ch} k={ramp(t, b1 + 1.4, 0.8)} color={C.white} w={10} />
          <g transform={`translate(${cx + 60 - cw - 90} ${cy - ch / 2}) rotate(-90)`}>
            <Txt x={0} y={0} size={32} color={C.white} weight={900}>
              важно
            </Txt>
          </g>
          <g transform={`translate(${cx + 60 - cw - 90} ${cy + ch / 2}) rotate(-90)`}>
            <Txt x={0} y={0} size={32} color={C.white} weight={900}>
              не важно
            </Txt>
          </g>
        </Appear>
        <Appear t={t} at={b2} x={cx + 60} y={cy + ch + 80}>
          <Label x={-230} y={0} text="срочное: реагируем" size={28} bg={C.coralSoft} />
          <Label x={230} y={0} text="важное: выбираем" size={28} bg={C.tealSoft} />
        </Appear>
      </Drift>
    );
  }
  const beats = [0, 1, 2, 3].map((i) => at(ctx, i));
  const focus = t < beats[1] ? 0 : t < beats[2] ? 2 : t < beats[3] ? 3 : 1;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={cy} amount={0.02}>
      {pos.map(([dx, dy], i) => {
        const on = focus === i;
        const k = ramp(t, 0.2 + i * 0.15, 0.5);
        const glow = on ? 1 : 0.55;
        const scale = on ? 1.04 + 0.01 * Math.sin(t * 3) : 0.97;
        return (
          <g key={i} opacity={k * (0.45 + 0.55 * glow)} transform={`translate(${cx + dx * (cw / 2 + 8)} ${cy + dy * (ch / 2 + 8)}) scale(${scale})`}>
            <rect x={-cw / 2} y={-ch / 2} width={cw} height={ch} rx={26} fill={on ? Q[i].color : C.white} stroke={OL} strokeWidth={on ? 7 : 4} />
            <text x={-cw / 2 + 30} y={-ch / 2 + 74} fontFamily={DISPLAY} fontWeight={800} fontSize={64} fill={on ? C.white : Q[i].color}>
              {Q[i].n}
            </text>
            <text x={-cw / 2 + 30} y={-ch / 2 + 130} fontFamily={FONT} fontWeight={900} fontSize={34} fill={on ? C.white : C.ink}>
              {Q[i].title}
            </text>
            {Q[i].items.map((it, j) => (
              <text key={j} x={-cw / 2 + 30} y={-ch / 2 + 176 + j * 32} fontFamily={FONT} fontWeight={800} fontSize={25} fill={on ? C.white : C.inkSoft}>
                {it}
              </text>
            ))}
            {i === 0 && on && (
              <g>
                {[0, 1].map((w) => {
                  const ph = (t * 0.7 + w * 0.5) % 1;
                  return <path key={w} d={`M ${-cw / 2 + 20} ${ch / 2 - 20 - ph * 30} q 60 -60 120 0 t 120 0 t 120 0`} stroke={C.white} strokeWidth={10} fill="none" strokeLinecap="round" opacity={1 - ph} />;
                })}
              </g>
            )}
            {i === 2 && on && [0, 1, 2].map((m) => <Icon key={m} name="mail" x={cw / 2 - 80 + Math.sin(t * 3 + m) * 20} y={-30 + m * 40 + wob(t, m, 6)} s={0.6} color={C.white} />)}
            {i === 1 && on && <Icon name="heart" x={cw / 2 - 70} y={-ch / 2 + 70} s={1.2} color={C.white} />}
          </g>
        );
      })}
      {focus === 1 && (
        <Appear t={t} at={beats[3] + 1.5} x={cx} y={cy + ch + 60 > 880 ? 880 : cy + ch + 60}>
          <Label x={0} y={0} text="сердце управления собой — второй квадрат" size={28} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ───────────── нет ради большого да ─────────────
export const YesNo: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const story = ramp(t, b1, 0.6) - ramp(t, b2, 0.6);
  const final = ramp(t, b2, 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <g opacity={1 - Math.max(story, final)}>
        <Appear t={t} at={0.3} x={cx} y={300}>
          <Card x={0} y={0} w={560} h={190} color={C.green} title="время для II" lines={["берём из III и IV"]} size={34} titleSize={44} />
        </Appear>
        {["III", "IV"].map((n, i) => (
          <Pop key={n} t={t} at={0.9 + i * 0.4} x={cx - 180 + i * 360} y={600}>
            <circle r={70} fill={i ? "#9aa6c4" : "#ffb84a"} stroke={OL} strokeWidth={5} />
            <text y={18} fontFamily={DISPLAY} fontWeight={800} fontSize={56} fill={C.white} textAnchor="middle">
              {n}
            </text>
          </Pop>
        ))}
      </g>
      {story > 0 && (
        <g opacity={story}>
          <Person who="elder" x={cx - 260} y={860} s={0.75} t={t} pose="hold" mood="happy" />
          <Person who="woman" x={cx + 260} y={860} s={0.75} t={t} pose="open" mood="calm" flip />
          <Bubble x={cx - 230} y={330} text={"Возглавите\nкомитет?"} w={300} size={30} tail="right" />
          <Pop t={t} at={b1 + 1} x={cx + 230} y={330}>
            <Bubble x={0} y={0} text={"Спасибо за доверие,\nно я откажусь"} w={380} size={28} tail="left" bg={C.tealSoft} />
          </Pop>
        </g>
      )}
      {final > 0 && (
        <g opacity={final}>
          <g transform={`translate(${cx} 360) scale(${0.9 + 0.1 * Math.sin(t * 2)})`}>
            <circle r={150} fill={C.sun} opacity={0.3} />
            <circle r={110} fill={C.sun} stroke={OL} strokeWidth={6} />
            <text y={30} fontFamily={DISPLAY} fontWeight={800} fontSize={96} fill={C.ink} textAnchor="middle">
              ДА
            </text>
          </g>
          <Label x={cx} y={560} text="ваша цель горит внутри" size={30} bg={C.white} />
          <Label x={cx - 230} y={700} text="хорошее" size={32} bg={C.white} />
          <Txt x={cx} y={712} size={40} color={C.white} weight={900}>
            — враг —
          </Txt>
          <Label x={cx + 230} y={700} text="лучшего" size={32} bg={HABIT[3].soft} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── неделя ─────────────
export const Week: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const steps = ["роли", "2–3 цели", "время заранее", "утром — сверка"];
  const plan = [
    { day: 0, row: 0, label: "сын" },
    { day: 2, row: 1, label: "спорт" },
    { day: 3, row: 3, label: "проект" },
    { day: 5, row: 0, label: "семья" },
    { day: 6, row: 2, label: "книга" },
    { day: 1, row: 4, label: "мама" },
  ];
  const blocks: { day: number; row: number; color: string; label?: string; k: number }[] = plan.map((b, i) => ({ ...b, color: "#7fe0c4", k: ramp(t, 1.2 + i * 0.5, 0.4) }));
  for (let d = 0; d < 7; d++)
    for (let r = 0; r < 6; r++) {
      if (plan.some((b) => b.day === d && b.row === r)) continue;
      if ((d * 5 + r * 3) % 4 === 0) blocks.push({ day: d, row: r, color: C.coralSoft, k: ramp(t, b1 + 1 + (d * 6 + r) * 0.03, 0.3) });
    }
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      {steps.map((s, i) => (
        <Appear key={s} t={t} at={0.3 + i * 0.7} x={A.x0 + 120 + i * ((A.x1 - A.x0 - 240) / 3)} y={170}>
          <g>
            <circle cx={-90} cy={-4} r={24} fill={H3} stroke={OL} strokeWidth={3} />
            <text x={-90} y={6} fontFamily={DISPLAY} fontWeight={800} fontSize={26} fill={C.white} textAnchor="middle">
              {i + 1}
            </text>
            <Label x={50} y={0} text={s} size={24} bg={C.white} />
          </g>
        </Appear>
      ))}
      <WeekGrid x={A.x0 + 60} y={260} w={A.x1 - A.x0 - 120} h={560} blocks={blocks} />
      <Appear t={t} at={b1 + 2.4} x={cx} y={870}>
        <Label x={0} y={0} text="сначала своё важное — потом остальное" size={28} bg={HABIT[3].soft} />
      </Appear>
    </Drift>
  );
};

// ───────────── люди и вещи; делегирование ─────────────
export const Delegate: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const ski = ramp(t, b1 - 0.2, 0.5) - ramp(t, b2 - 0.2, 0.5);
  const lawn = ramp(t, b2 - 0.2, 0.6);
  const people = 1 - ramp(t, b1 - 0.2, 0.5);
  const shout = Math.floor(t * 1.6) % 2 === 0;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      {people > 0 && (
        <g opacity={people}>
          <rect x={cx - 420} y={220} width={300} height={110} rx={20} fill="#7fe0c4" stroke={OL} strokeWidth={4} transform={`translate(0 ${ramp(t, 1, 1) * -40}) rotate(${-ramp(t, 1, 1) * 8} ${cx - 270} 275)`} />
          <Txt x={cx - 270} y={290 - ramp(t, 1, 1) * 40} size={32}>
            план
          </Txt>
          <Person who="marat" x={cx - 120} y={860} s={0.72} t={t} pose="hug" mood="calm" accent={C.teal} />
          <Person who="timur" x={cx + 80} y={860} s={0.72} t={t} pose="stand" mood="happy" flip />
          <Card x={cx + 260} y={330} w={480} h={200} color={H3} title="с людьми —" lines={["эффективность;", "с вещами — производительность"]} size={28} titleSize={36} />
        </g>
      )}
      {ski > 0 && (
        <g opacity={ski}>
          <rect x={A.x0 + 40} y={560} width={A.x1 - A.x0 - 80} height={280} rx={40} fill="#5aa9e6" stroke={OL} strokeWidth={5} />
          {[0, 1, 2].map((i) => <path key={i} d={`M ${A.x0 + 80 + ((t * 120 + i * 300) % (A.x1 - A.x0 - 200))} ${640 + i * 60} q 30 -16 60 0`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.7} />)}
          <g transform={`translate(${cx + 230} 680)`}>
            <path d="M -120 0 L 120 0 L 90 50 L -90 50 Z" fill={C.coral} stroke={OL} strokeWidth={5} />
            <Person who="marat" x={-40} y={10} s={0.42} t={t} pose="point" mood="tense" accent={C.coral} flip />
            <Person who="leila" x={60} y={10} s={0.42} t={t} pose="hold" mood="tense" flip />
          </g>
          <Person who="man" x={cx - 260 + Math.sin(t) * 30} y={760} s={0.42} t={t} pose="open" mood="happy" />
          <Pop t={t} at={b1 + 0.4} x={cx + 120} y={400}>
            <Bubble x={0} y={0} text={shout ? "Снимай!" : "Не снимай!"} w={280} size={40} bg={C.coralSoft} />
          </Pop>
          <Label x={cx} y={250} text="делегирование исполнения" size={30} bg={C.white} />
        </g>
      )}
      {lawn > 0 && (
        <g opacity={lawn}>
          <rect x={A.x0 + 40} y={600} width={A.x1 - A.x0 - 80} height={240} rx={30} fill={interpolateGreen(ramp(t, b2 + 0.8, 3))} stroke={OL} strokeWidth={5} />
          {Array.from({ length: 22 }).map((_, i) => <path key={i} d={`M ${A.x0 + 70 + i * ((A.x1 - A.x0 - 140) / 21)} 640 l 6 -20 l 6 20`} stroke={C.grassDeep} strokeWidth={4} fill="none" />)}
          <Person who="kid" x={cx - 120} y={800} s={0.75} t={t} pose="hold" mood="happy" />
          <Person who="marat" x={cx + 220} y={800} s={0.62} t={t} pose="cross" mood="calm" accent={C.teal} flip />
          <Label x={cx - 250} y={300} text="результат: «зелено и чисто»" size={28} bg={C.tealSoft} />
          <Label x={cx - 250} y={400} text="способ выбирает сын" size={28} bg={C.white} />
          <Pop t={t} at={b2 + 2.6} x={cx + 300} y={350}>
            <Card x={0} y={0} w={400} h={170} color={C.green} title="доверие —" lines={["высшая форма мотивации"]} size={28} titleSize={36} />
          </Pop>
          <Check x={cx - 360} y={520} s={50} k={ramp(t, b2 + 1.6, 0.6)} />
        </g>
      )}
    </Drift>
  );
};

const interpolateGreen = (k: number) => {
  const a = [196, 186, 120];
  const b = [124, 200, 107];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * clamp01(k)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};
