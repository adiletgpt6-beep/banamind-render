// Сцены вступления, рамки и финала BM-025:
//   coldArgue  — холодный старт: доводы складываются в стену, доски моста обрываются, кубок;
//   bigQuestion — главный вопрос фильма из точек;
//   bookIntro  — собственная условная обложка книги (не издательская), курсы Карнеги;
//   bookParts  — четыре части / тридцать глав и как фильм обращается с историями;
//   workshop   — «Мастерская разговора»: инструменты, починка, мост целиком;
//   partTitle  — заставка части книги;
//   finale     — три вывода фильма; practice — практика одного разговора; outro — финал.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { BOOK_PARTS, C, DISPLAY, FONT } from "../theme";
import { Bridge, Headline, Ledge, PhraseBurst, planksOf, type PlankState } from "./bridge";
import { dotsOf, Morph, Swarm } from "./dots";
import { Card, Label, OL, Person } from "./draw";
import { SourceChip } from "./generic";
import { Appear, area, at, Check, clamp01, Cross, Drift, ramp, Txt, type VisualProps } from "./kit";
import { SHAPES } from "./shapes";

const PARTS = [1, 2, 3, 4] as const;
const ALL = PARTS.map((n) => BOOK_PARTS[n].color);

// общая раскладка мастерской в области кадра
const layout = (host: unknown) => {
  const a = area(host);
  const L = a.x0 + 200;
  const R = a.x1 - 200;
  return { a, lx: L, rx: R, x0: L + 180, x1: R - 180, y: 700 };
};

// ── Холодный старт ──
export const ColdArgue: React.FC<VisualProps<{ host?: string; stage?: number }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const g = layout(p.host);
  const mid = (g.x0 + g.x1) / 2;
  const stage = p.stage ?? 0;
  const n = 8;
  let planks: PlankState[];
  let rope = 1;
  if (stage === 0) {
    const f = ramp(t, at(ctx, 1.4), 1.6);
    planks = planksOf(n, 8, { fallFrom: 2, fallTo: 6, fall: f });
    rope = 1 - ramp(t, at(ctx, 1.5), 0.8);
  } else {
    planks = planksOf(n, 8, { fallFrom: 2, fallTo: 6, fall: 1 });
    rope = 0;
  }
  // собеседник отворачивается и отходит
  const away = stage === 0 ? ramp(t, at(ctx, 2.2), 1.2) : 1 + ramp(t, at(ctx, 1), 2) * 0.6;
  return (
    <Drift t={t} dur={dur} cx={mid} cy={560} amount={0.04}>
      <Ledge x={g.lx} y={g.y} w={360} side={-1} />
      <Ledge x={g.rx} y={g.y} w={360} side={1} />
      <Bridge x0={g.x0} x1={g.x1} y={g.y - 12} planks={planks} rope={rope} t={t} />
      <Person who="guest" x={g.lx + 20} y={g.y - 14} s={0.62} mood={stage ? "happy" : "tense"} pose={stage ? "wave" : "point"} t={t} look={0.8} />
      <Person who="friend" x={g.rx - 20 + away * 90} y={g.y - 14} s={0.62} mood={away > 0.3 ? "doubt" : "think"} pose={away > 0.3 ? "arms" : "stand"} t={t} flip={away < 0.5} look={away > 0.5 ? 0 : 0.8} opacity={1 - clamp01((away - 1.2) / 0.4) * 0.6} />
      {stage === 0 && (
        <>
          <PhraseBurst t={t} at={at(ctx, 0.55)} appear={at(ctx, 0.05)} text={"Сильный довод!"} bx={g.lx + 210} by={330} shape="wall" sx={mid} sy={470} colors={["#ff7a59", "#d4512f", "#ffd6c7", "#ffffff"]} scale={0.62} size={38} tail={-1} step={12} r={4.8} />
          <PhraseBurst t={t} at={at(ctx, 1.45)} appear={at(ctx, 1.0)} text={"Вот где вы\nошиблись!"} bx={g.lx + 210} by={300} shape="shield" sx={g.rx - 30} sy={450} colors={["#e5484d", "#ff9f8a", "#ffffff"]} scale={0.55} size={36} tail={-1} step={12} r={4.6} />
        </>
      )}
      {stage === 1 && (
        <>
          <PhraseBurst t={t} at={at(ctx, 0.2)} appear={at(ctx, 0) - 0.2} text={"Я прав!"} bx={g.lx + 200} by={320} shape="trophy" sx={g.lx + 10} sy={360} colors={[C.yellow, C.gold, "#fff1c2", "#ffffff"]} scale={0.55} size={40} tail={-1} step={12} r={4.8} />
          <Appear t={t} at={at(ctx, 1)} x={mid} y={300}>
            <Headline x={0} y={0} text="Спор выигран." size={58} />
          </Appear>
          <Appear t={t} at={at(ctx, 1.4)} x={mid} y={380}>
            <Headline x={0} y={0} text="А человек?" size={58} color={C.yellow} />
          </Appear>
        </>
      )}
    </Drift>
  );
};

// ── Главный вопрос ──
export const BigQuestion: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const pts = dotsOf("bigq", (x, y) => SHAPES.question(x / 1.35, y / 1.35), cx, 480, ALL.concat([C.yellow, "#fff"]), 12, 360);
  const k = clamp01((t - 0.1) / 2.2);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.05}>
      <Swarm pts={pts} k={k} t={t} r={5.4} />
      <Appear t={t} at={at(ctx, 0.15)} x={cx} y={170}>
        <Headline x={0} y={0} text="Выиграть спор — и потерять человека?" size={50} />
      </Appear>
      <Appear t={t} at={at(ctx, 1.2)} x={cx} y={790}>
        <Headline x={0} y={0} text="Как быть услышанным — без давления и лести?" size={46} color={C.yellow} />
      </Appear>
    </Drift>
  );
};

// собственная условная обложка: мост из цветных точек, без издательского дизайна
export const OwnBook: React.FC<{ x: number; y: number; s?: number; rot?: number; t?: number }> = ({ x, y, s = 1, rot = 0, t = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-112} y={-148} width={230} height={300} rx={12} fill="#000" opacity={0.18} />
    <rect x={-120} y={-156} width={230} height={300} rx={12} fill="#7a3f52" stroke={OL} strokeWidth={5} />
    <rect x={-120} y={-156} width={24} height={300} rx={6} fill="#5e2e40" />
    <text x={8} y={-112} fontFamily={FONT} fontWeight={800} fontSize={20} fill={C.yellow} textAnchor="middle">
      Дейл Карнеги
    </text>
    <text x={8} y={-74} fontFamily={FONT} fontWeight={900} fontSize={24} fill="#fff" textAnchor="middle">
      <tspan x={8}>Как завоёвывать</tspan>
      <tspan x={8} dy={28}>друзей…</tspan>
    </text>
    {/* мост из точек */}
    {Array.from({ length: 9 }).map((_, i) => (
      <circle key={i} cx={-62 + i * 17} cy={60 + Math.sin((i / 8) * Math.PI) * 10 + Math.sin(t * 2 + i) * 0.6} r={6} fill={ALL[i % 4]} stroke="#fff" strokeWidth={2} />
    ))}
    <rect x={-92} y={36} width={22} height={70} rx={6} fill="#c9a0b0" />
    <rect x={86} y={36} width={22} height={70} rx={6} fill="#c9a0b0" />
  </g>
);

export const BookIntro: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const talk = ramp(t, at(ctx, 1.4), 1.6);
  const podium = dotsOf("podium", (x, y) => SHAPES.steps(x / 0.95, y / 0.95), cx + 280, 500, ["#ffb02e", "#ff7a59", "#fff"], 11, 300);
  const pair = dotsOf("pair", (x, y) => SHAPES.link(x / 1.0, y / 1.0), cx + 280, 500, ALL.concat(["#fff"]), 11, 300);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.035}>
      <Appear t={t} at={0.1} x={cx - 260} y={520} dy={60}>
        <OwnBook x={0} y={0} s={1.45} rot={-4} t={t} />
      </Appear>
      <Appear t={t} at={at(ctx, 0.6)} x={cx - 260} y={770}>
        <Label x={0} y={0} text="пересмотренная редакция · 1981" size={26} />
      </Appear>
      {t >= at(ctx, 1) - 0.4 && <Morph a={podium} b={pair} k={talk} t={t} r={5} />}
      <Appear t={t} at={at(ctx, 1)} x={cx + 280} y={220}>
        <Txt x={0} y={0} size={40} color="#fff">
          {talk < 0.5 ? "курсы ораторского искусства" : "искусство общаться друг с другом"}
        </Txt>
      </Appear>
      <Appear t={t} at={at(ctx, 2)} x={cx + 300} y={740}>
        <Card x={0} y={0} w={560} h={150} lines={["«как часто мне не хватало", "такта и понимания»"]} size={34} title="Карнеги о себе" />
      </Appear>
    </Drift>
  );
};

export const BookParts: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const counts = { 1: 3, 2: 6, 3: 12, 4: 9 } as const;
  const w = Math.min(250, (a.x1 - a.x0 - 160) / 4);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {PARTS.map((n, i) => {
        const x = cx + (i - 1.5) * (w + 24);
        const k = ramp(t, at(ctx, 0.1) + i * 0.35, 0.5);
        const bp = BOOK_PARTS[n];
        return (
          <g key={n} opacity={k} transform={`translate(${x} ${330 + (1 - k) * 40})`}>
            <rect x={-w / 2} y={-110} width={w} height={220} rx={24} fill={bp.color} stroke={OL} strokeWidth={5} />
            <text x={0} y={-50} fontFamily={DISPLAY} fontWeight={800} fontSize={36} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
              {`Часть ${n}`}
            </text>
            {Array.from({ length: counts[n] }).map((_, j) => (
              <circle key={j} cx={-((Math.min(counts[n], 6) - 1) * 26) / 2 + (j % 6) * 26} cy={10 + Math.floor(j / 6) * 28} r={9} fill="#fff" stroke={OL} strokeWidth={2.5} opacity={ramp(t, at(ctx, 0.3) + i * 0.35 + j * 0.05, 0.3)} />
            ))}
            <text x={0} y={92} fontFamily={FONT} fontWeight={900} fontSize={26} fill={OL} textAnchor="middle">
              {`${counts[n]} ${counts[n] < 5 ? "главы" : "глав"}`}
            </text>
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, 1)} x={cx - 270} y={620}>
        <Card x={0} y={0} w={500} h={160} lines={["рассказы автора,", "слушателей, биографии"]} size={34} edge={C.green} />
      </Appear>
      <Appear t={t} at={at(ctx, 1.4)} x={cx + 270} y={620}>
        <Card x={0} y={0} w={480} h={160} lines={["проверенные", "научные опыты"]} size={34} edge={C.red} />
      </Appear>
      <Cross x={cx + 270} y={620} s={110} k={ramp(t, at(ctx, 1.6), 0.5)} />
      <g opacity={ramp(t, at(ctx, 2), 0.5)}>
        <SourceChip kind="history" x={cx - 250} y={790} />
        <SourceChip kind="film" x={cx + 290} y={790} />
      </g>
    </Drift>
  );
};

// ── Мастерская: инструменты / починка / мост целиком ──
const TOOLS = [
  { text: "обвинение", color: C.red, icon: "shield" as const },
  { text: "вопрос", color: "#3d8bff", icon: "key" as const },
  { text: "признанная ошибка", color: C.green, icon: "plank" as const },
];
const REPAIR = ["правда о сильной стороне", "ясно названная ошибка", "ваши промахи", "вопрос, а не приказ", "общий следующий шаг"];

export const Workshop: React.FC<VisualProps<{ host?: string; mode?: "tools" | "repair" | "full" }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const g = layout(p.host);
  const mid = (g.x0 + g.x1) / 2;
  const mode = p.mode ?? "tools";
  const n = 8;
  let planks: PlankState[] = planksOf(n, 8);
  let rope = 1;
  let walk = 0;
  if (mode === "tools") {
    const cut = ramp(t, at(ctx, 2.15), 0.9);
    const back = ramp(t, at(ctx, 2.5), 0.8);
    planks = planksOf(n, 8).map((pl, i) => (i === 3 || i === 4 ? { ...pl, fall: cut * (1 - back), glow: back * (1 - ramp(t, at(ctx, 2.9), 0.8)) } : pl));
    rope = 1 - cut * (1 - ramp(t, at(ctx, 2.75), 0.6));
  } else if (mode === "repair") {
    planks = Array.from({ length: n }, (_, i) => {
      const order = [3, 4, 2, 5, 1].indexOf(i);
      if (order < 0) return { k: 1 };
      const back = ramp(t, at(ctx, 1 + order * 0.18), 0.6);
      return { k: 1, fall: 1 - back, glow: back * (1 - ramp(t, at(ctx, 1 + order * 0.18) + 1.2, 0.6)), color: back > 0.5 ? ["#ffd6c7", "#c4f1e3", "#ffe7bd", "#fbd3e3", "#fff1c2"][order] : undefined };
    });
    rope = ramp(t, at(ctx, 1.9), 0.8);
    walk = ramp(t, at(ctx, 2.1), 2);
  } else {
    // целиком: доски четырёх цветов частей книги собираются по очереди
    planks = Array.from({ length: n }, (_, i) => ({ k: ramp(t, 0.3 + i * 0.35, 0.6) * 1, color: [BOOK_PARTS[1].light, BOOK_PARTS[2].light, BOOK_PARTS[3].light, BOOK_PARTS[4].light][Math.floor(i / 2)], glow: clamp01(1 - (t - (0.3 + i * 0.35)) / 1.2) }));
    walk = ramp(t, at(ctx, 1.2), 3);
  }
  const lxP = g.lx + 20 + walk * (mid - 110 - g.lx);
  const rxP = g.rx - 20 - walk * (g.rx - mid - 110);
  const yP = (x: number) => (x > g.x0 && x < g.x1 ? g.y - 12 + Math.sin(((x - g.x0) / (g.x1 - g.x0)) * Math.PI) * 34 - 18 : g.y - 14);
  return (
    <Drift t={t} dur={dur} cx={mid} cy={560} amount={0.035}>
      <Ledge x={g.lx} y={g.y} w={360} side={-1} />
      <Ledge x={g.rx} y={g.y} w={360} side={1} />
      <Bridge x0={g.x0} x1={g.x1} y={g.y - 12} planks={planks} rope={rope} t={t} />
      <Person who="guest" x={lxP} y={yP(lxP)} s={0.6} mood={mode === "tools" ? "smile" : "kind"} pose={walk > 0.01 && walk < 0.99 ? "walk" : walk >= 0.99 ? "give" : "stand"} t={t} look={0.8} />
      <Person who="friend" x={rxP} y={yP(rxP)} s={0.6} mood={mode === "repair" && walk < 0.5 ? "doubt" : "smile"} pose={walk > 0.01 && walk < 0.99 ? "walk" : walk >= 0.99 ? "give" : "stand"} t={t} flip look={0.8} />
      {mode === "tools" && (
        <>
          <g opacity={ramp(t, at(ctx, 1.1), 0.5)}>
            <Label x={g.lx} y={g.y + 70} text="вы" size={34} />
            <Label x={g.rx} y={g.y + 70} text="собеседник" size={34} />
          </g>
          {TOOLS.map((tool, i) => {
            const x = mid + (i - 1) * 430;
            const lit = i === 0 ? ramp(t, at(ctx, 2.1), 0.3) * (1 - ramp(t, at(ctx, 2.45), 0.3)) : i === 1 ? ramp(t, at(ctx, 2.45), 0.3) * (1 - ramp(t, at(ctx, 2.75), 0.3)) : ramp(t, at(ctx, 2.75), 0.3);
            const pts = dotsOf(`tool-${tool.icon}`, (x0, y0) => SHAPES[tool.icon](x0 / 0.3, y0 / 0.3), x - 140, 250, [tool.color, "#fff"], 8, 110);
            return (
              <Appear key={i} t={t} at={at(ctx, 2) + i * 0.15}>
                <rect x={x - 205} y={190} width={410} height={120} rx={30} fill={C.paper} stroke={lit > 0.3 ? tool.color : OL} strokeWidth={lit > 0.3 ? 9 : 4} />
                <Swarm pts={pts} k={1} t={t} r={3.4} />
                <text x={x + 40} y={262} fontFamily={FONT} fontWeight={900} fontSize={tool.text.length > 12 ? 30 : 36} fill={OL} textAnchor="middle">
                  {tool.text}
                </text>
              </Appear>
            );
          })}
        </>
      )}
      {mode === "repair" &&
        REPAIR.map((txt, i) => {
          const k = ramp(t, at(ctx, 1 + i * 0.18), 0.5);
          if (k <= 0) return null;
          const x = mid + (i - 2) * 300;
          const y = 260 + (i % 2) * 90;
          return (
            <g key={i} opacity={k} transform={`translate(${x} ${y + (1 - k) * 30})`}>
              <Label x={0} y={0} text={txt} size={26} bg={["#ffd6c7", "#c4f1e3", "#ffe7bd", "#fbd3e3", "#fff1c2"][i]} />
            </g>
          );
        })}
      {mode === "repair" && <Check x={mid} y={470} s={60} k={ramp(t, at(ctx, 2.4), 0.6)} />}
      {mode === "full" && (
        <>
          {["уважение", "вопрос", "признание"].map((txt, i) => (
            <Appear key={i} t={t} at={at(ctx, 1.1) + i * 0.5} x={mid + (i - 1) * 320} y={300}>
              <Label x={0} y={0} text={txt} size={38} bg={[BOOK_PARTS[1].light, BOOK_PARTS[3].light, BOOK_PARTS[4].light][i]} />
            </Appear>
          ))}
        </>
      )}
    </Drift>
  );
};

// ── Заставка части книги ──
export const PartTitle: React.FC<VisualProps<{ host?: string; n: 1 | 2 | 3 | 4 }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const bp = BOOK_PARTS[p.n];
  const shape = p.n === 2 ? SHAPES.heart : p.n === 4 ? SHAPES.steps : p.n === 3 ? SHAPES.door : SHAPES.shield;
  const pts = dotsOf(`part-${p.n}`, (x, y) => shape(x / 0.95, y / 0.95), cx, 560, [bp.color, bp.deep, bp.light, "#fff"], 12, 260);
  const k = clamp01((t - 0.4) / 2.2);
  const title = p.n === 4 ? "Быть руководителем" : bp.name;
  const sub = p.n === 4 ? "как изменять людей, не нанося им обиды" : "";
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.04}>
      <Appear t={t} at={0} x={cx} y={180}>
        <rect x={-150} y={-46} width={300} height={74} rx={37} fill={bp.color} stroke={OL} strokeWidth={5} />
        <text x={0} y={8} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
          {`Часть ${p.n}`}
        </text>
      </Appear>
      <Appear t={t} at={0.3} x={cx} y={280}>
        <Headline x={0} y={0} text={title} size={Math.min(58, 1500 / (title.length * 0.6))} />
      </Appear>
      {sub && (
        <Appear t={t} at={at(ctx, 0.4)} x={cx} y={340}>
          <Txt x={0} y={0} size={36} color="#fff">
            {sub}
          </Txt>
        </Appear>
      )}
      <Swarm pts={pts} k={k} t={t} r={5.6} from="below" />
    </Drift>
  );
};

// ── Три вывода фильма ──
const FIN = [
  { text: ["Сначала", "поймите другого"], shape: "ear" as const, n: 2 as const },
  { text: ["Оценивайте искренне", "и конкретно"], shape: "heart" as const, n: 1 as const },
  { text: ["Общий следующий шаг —", "и право сказать «нет»"], shape: "steps" as const, n: 4 as const },
];
export const Finale: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const w = Math.min(380, (a.x1 - a.x0 - 80) / 3 - 20);
  const when = [at(ctx, 1), at(ctx, 1.5), at(ctx, 2)];
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.025}>
      <Appear t={t} at={at(ctx, 0.2)} x={cx} y={170}>
        <Headline x={0} y={0} text="Выводы фильма" size={56} />
      </Appear>
      <Appear t={t} at={at(ctx, 0.5)} x={cx} y={235}>
        <Txt x={0} y={0} size={30} color="#fff">
          наши формулировки, а не правила Карнеги
        </Txt>
      </Appear>
      {FIN.map((f, i) => {
        const x = cx + (i - 1) * (w + 30);
        const bp = BOOK_PARTS[f.n];
        const pts = dotsOf(`fin-${f.shape}`, (x0, y0) => SHAPES[f.shape](x0 / 0.55, y0 / 0.55), x, 450, [bp.color, bp.deep, "#fff"], 10, 170);
        const k = clamp01((t - when[i]) / 1.4);
        return (
          <g key={i}>
            <Appear t={t} at={when[i] - 0.2} dy={40}>
              <rect x={x - w / 2} y={300} width={w} height={460} rx={34} fill={C.paper} stroke={OL} strokeWidth={5} />
              <rect x={x - w / 2} y={300} width={w} height={22} rx={11} fill={bp.color} />
              <text x={x} y={660} fontFamily={FONT} fontWeight={900} fontSize={Math.min(34, (w - 50) / (Math.max(...f.text.map((l) => l.length)) * 0.6))} fill={OL} textAnchor="middle">
                {f.text.map((l, j) => (
                  <tspan key={j} x={x} dy={j === 0 ? 0 : 44}>
                    {l}
                  </tspan>
                ))}
              </text>
              <circle cx={x - w / 2 + 40} cy={350} r={24} fill={bp.color} stroke={OL} strokeWidth={4} />
              <text x={x - w / 2 + 40} y={362} fontFamily={DISPLAY} fontWeight={800} fontSize={32} fill="#fff" textAnchor="middle">
                {i + 1}
              </text>
            </Appear>
            <Swarm pts={pts} k={k} t={t} r={4.4} />
          </g>
        );
      })}
    </Drift>
  );
};

// ── Практика: субботний разбор одного разговора ──
const QS = ["Какие ошибки я совершил?", "Что сделал правильно —", "и что можно лучше?", "Какие уроки извлёк?"];
export const Practice: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const nx = cx - 120;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      <Appear t={t} at={0.1} x={nx} y={500} dy={50}>
        <rect x={-330} y={-300} width={660} height={600} rx={26} fill="#000" opacity={0.16} transform="translate(8 12)" />
        <rect x={-330} y={-300} width={660} height={600} rx={26} fill={C.paper} stroke={OL} strokeWidth={5} />
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={-280} y1={-180 + i * 56} x2={280} y2={-180 + i * 56} stroke="#e6cfae" strokeWidth={3} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <circle key={i} cx={-330} cy={-240 + i * 96} r={14} fill={C.wood} stroke={OL} strokeWidth={4} />
        ))}
        <text x={0} y={-226} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={OL} textAnchor="middle">
          Суббота · разбор недели
        </text>
      </Appear>
      {[0, 1, 2].map((i) => {
        const k = ramp(t, at(ctx, 1.05 + i * 0.28), 0.5);
        const lines = i === 1 ? [QS[1], QS[2]] : [QS[i === 0 ? 0 : 3]];
        const y = 330 + [0, 120, 290][i];
        return (
          <g key={i} opacity={k}>
            <rect x={nx - 280} y={y - 34} width={44} height={44} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
            <Check x={nx - 258} y={y - 12} s={22} k={ramp(t, at(ctx, 1.05 + i * 0.28) + 0.6, 0.4)} />
            {lines.map((l, j) => (
              <text key={j} x={nx - 216} y={y + j * 52} fontFamily={FONT} fontWeight={900} fontSize={38} fill={OL}>
                {l}
              </text>
            ))}
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, 2.1)} x={nx + 470} y={420}>
        <circle r={110} fill={C.yellow} stroke={OL} strokeWidth={5} />
        <text y={-10} fontFamily={DISPLAY} fontWeight={800} fontSize={64} fill={OL} textAnchor="middle">
          1
        </text>
        <text y={40} fontFamily={FONT} fontWeight={900} fontSize={30} fill={OL} textAnchor="middle">
          разговор
        </text>
      </Appear>
      <Appear t={t} at={at(ctx, 2.3)} x={nx + 470} y={640}>
        <Label x={0} y={0} text="не все сразу" size={30} />
      </Appear>
    </Drift>
  );
};

// ── Финал: мост и знак канала ──
export const Outro: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur } = ctx;
  const planks = planksOf(8, 8).map((pl, i) => ({ ...pl, color: [BOOK_PARTS[1].light, BOOK_PARTS[2].light, BOOK_PARTS[3].light, BOOK_PARTS[4].light][Math.floor(i / 2)] }));
  const wk = ramp(t, at(ctx, 1), 0.8);
  return (
    <Drift t={t} dur={dur} cx={960} amount={0.03}>
      <g opacity={1 - 0.35 * wk}>
        <Ledge x={330} y={560} w={300} side={-1} />
        <Ledge x={1590} y={560} w={300} side={1} />
        <Bridge x0={480} x1={1440} y={548} planks={planks} rope={1} t={t} />
      </g>
      <g opacity={wk} transform={`translate(960 ${300 - (1 - wk) * 20})`}>
        <text x={0} y={0} fontFamily={DISPLAY} fontWeight={800} fontSize={110} textAnchor="middle" stroke={OL} strokeWidth={14} paintOrder="stroke">
          <tspan fill="#fff">{BRAND.wordmark[0]}</tspan>
          <tspan fill={BRAND.yellow}>{BRAND.wordmark[1]}</tspan>
        </text>
        <text x={0} y={70} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
          {BRAND.slogan}
        </text>
      </g>
    </Drift>
  );
};
