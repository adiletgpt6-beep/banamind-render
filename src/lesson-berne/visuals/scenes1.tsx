// Сцены вступления и первых частей BM-034: холодный старт, монтажный стол,
// книга, поглаживания, диалоги, лестница способов провести время, операция и
// игра, цепочка ходов, петля «слова меняются — итог возвращается».
import React from "react";
import { C, DISPLAY, EGO, FONT } from "../theme";
import { Bubble, MontageDesk, Plate, textW, type Chip, type Tone } from "./core";
import { dotsOf, Morph, SH, Swarm, word } from "./dots";
import { BookObj, OL, Person, type FigMood, type FigPose, type Who } from "./draw";
import { area, at, clamp01, Drift, pop, ramp, type VisualProps } from "./kit";

type HostP = { host?: string };

// ── Холодный старт: советы, «да, но», знакомый финал и вопрос ──
export const Hook: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const lx = A.x0 + 260;
  const rx = A.x1 - 260;
  const rounds = [
    { adv: "Попробуйте так!", re: "Не подойдёт…", a: 0.05, b: 0.45 },
    { adv: "А может, вот так?", re: "Тоже нет…", a: 0.65, b: 0.95 },
    { adv: "Ну тогда…", re: "Да, но…", a: 1.05, b: 1.3 },
  ];
  const cur = rounds.filter((r) => t >= at(ctx, r.a)).length - 1;
  const irritated = t >= at(ctx, 1.35);
  const mood: FigMood = irritated ? "tense" : "think";
  const qk = ramp(t, at(ctx, 2.05), 1.2);
  const qPts = dotsOf("hook-q", word("?", 300, 30), A.cx, 430, [C.yellow, C.outcome, EGO.A.color, EGO.P.color, EGO.C.color], 13, 260);
  const fade = 1 - ramp(t, at(ctx, 2.0), 0.6) * 0.75;
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
      <g opacity={fade}>
        <Person who="friend" x={lx} y={830} s={0.9} mood={irritated ? "tense" : "smile"} pose={irritated ? "arms" : "give"} t={t} />
        <Person who="anna" x={rx} y={830} s={0.9} mood={mood} pose={irritated ? "arms" : "shrug"} t={t} flip seed={2} />
        {rounds.map((r, i) =>
          i === cur || i === cur - 1 ? (
            <g key={i} opacity={i === cur ? 1 : 0.4}>
              <Bubble x={lx + 120} y={i === cur ? 250 : 130} text={r.adv} k={pop(t, at(ctx, r.a))} tail="b" maxW={460} />
              <Bubble x={rx - 120} y={i === cur ? 330 : 210} text={r.re} k={pop(t, at(ctx, r.b))} tail="b" tone={i === 2 ? "hot" : "said"} maxW={460} />
            </g>
          ) : null,
        )}
        {irritated && (
          <g opacity={ramp(t, at(ctx, 1.35), 0.5)}>
            {[lx, rx].map((x, i) => (
              <path key={i} d={`M ${x - 40} ${310} q 12 -24 24 0 q 12 24 24 0 q 12 -24 24 0`} transform={`translate(0 ${-Math.sin(t * 6 + i) * 6})`} fill="none" stroke={C.outcome} strokeWidth={8} strokeLinecap="round" />
            ))}
          </g>
        )}
      </g>
      {qk > 0 && (
        <g>
          <Swarm pts={qPts} k={qk} t={t} r={6.5} from="scatter" spread={700} />
          <Plate x={A.cx} y={760} text="манипулятор?" k={ramp(t, at(ctx, 2.3), 0.5)} bg="#ffffff" size={44} />
        </g>
      )}
    </Drift>
  );
};

// ── Монтажный стол (общий вид для нескольких сцен) ──
type PDesk = HostP & {
  said: Chip[];
  hidden: Chip[];
  outcome?: { text: string; at: number; fresh?: boolean };
  oldOutcome?: string;
  loops?: number;
  notes?: { lane: "said" | "hidden"; text: string; at: number }[];
  count?: { text: string; at: number };
  scale?: { small: string; big: string; at: number };
};
export const DeskScene: React.FC<VisualProps<PDesk>> = (ctx) => {
  const { t, p } = ctx;
  const A = area(p.host);
  const x0 = A.x0 + 10;
  const x1 = A.x1 - 10;
  const said = p.said.map((c) => ({ ...c, atS: at(ctx, c.at) }));
  const hidden = p.hidden.map((c) => ({ ...c, atS: at(ctx, c.at) }));
  const outcome = p.outcome ? { ...p.outcome, atS: at(ctx, p.outcome.at) } : undefined;
  const first = Math.min(...said.map((c) => c.atS), outcome?.atS ?? 1e9);
  const last = outcome?.atS ?? Math.max(...said.map((c) => c.atS));
  // бегунок: проходит стол (и повторяет проход loops раз — финал возвращается)
  const loops = p.loops ?? 1;
  const span = Math.max(1, last - first);
  const ph = (t - first + 0.3) / span;
  const play = ph < 0 ? 0 : loops > 1 && ph > 1 ? (ph % 1) : Math.min(1, ph);
  const sk = p.scale ? ramp(t, at(ctx, p.scale.at), 0.8) : 0;
  return (
    <Drift t={t} dur={ctx.dur} cx={(x0 + x1) / 2} cy={460} amount={0.025}>
      <MontageDesk t={t} x0={x0} x1={x1} y={470} k={ramp(t, 0, 0.6)} said={said} hidden={hidden} outcome={outcome} oldOutcome={p.oldOutcome} play={play} notes={(p.notes ?? []).map((n) => ({ ...n, atS: at(ctx, n.at) }))} />
      {p.count && <Plate x={(x0 + x1) / 2 - 120} y={790} text={p.count.text} k={ramp(t, at(ctx, p.count.at), 0.5)} size={38} />}
      {p.scale && sk > 0 && (
        <g transform={`translate(${(x0 + x1) / 2 - 140} 800)`} opacity={sk}>
          <line x1={-260} y1={0} x2={260} y2={-60 * sk} stroke="#fff" strokeWidth={10} strokeLinecap="round" />
          <path d="M -20 70 L 0 0 L 20 70 Z" fill="#fff" stroke={OL} strokeWidth={4} />
          <circle cx={-260} cy={-22} r={24} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <text x={-260} y={-60} fontFamily={DISPLAY} fontWeight={800} fontSize={36} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
            {p.scale.small}
          </text>
          <circle cx={260} cy={-60 * sk - 64} r={64 + 30 * sk} fill={C.outcome} stroke={OL} strokeWidth={5} />
          <text x={260} y={-60 * sk - 52} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
            {p.scale.big}
          </text>
        </g>
      )}
    </Drift>
  );
};

// ── Книга: собственная обложка + три части ──
export const BookIntro: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const bk = pop(t, 0.2);
  const parts = [
    { n: "I", t: "язык анализа", c: EGO.A.color, at: 1.35 },
    { n: "II", t: "каталог игр", c: EGO.C.color, at: 1.55 },
    { n: "III", t: "за пределами игр", c: EGO.P.color, at: 1.75 },
  ];
  const warn = ramp(t, at(ctx, 2.1), 0.6);
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
      <g transform={`translate(${A.x0 + 250} 460) scale(${1.45 * Math.min(1, bk)})`}>
        <BookObj x={0} y={0} rot={-4} />
      </g>
      {parts.map((p, i) => {
        const k = ramp(t, at(ctx, p.at), 0.55);
        const y = 260 + i * 170;
        return (
          <g key={i} transform={`translate(${A.x0 + 560 + (1 - k) * 60} ${y})`} opacity={k}>
            <rect x={0} y={-62} width={600} height={124} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
            <rect x={0} y={-62} width={120} height={124} rx={30} fill={p.c} stroke={OL} strokeWidth={5} />
            <text x={60} y={20} fontFamily={DISPLAY} fontWeight={800} fontSize={54} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={5} paintOrder="stroke">
              {p.n}
            </text>
            <text x={150} y={16} fontFamily={FONT} fontWeight={900} fontSize={46} fill={C.ink}>
              {p.t}
            </text>
          </g>
        );
      })}
      <Plate x={A.cx + 80} y={790} text="разбор модели автора — не тест и не диагноз" k={warn} bg="#ffffff" size={36} />
    </Drift>
  );
};

// ── Поглаживания: точки складываются в ладонь, затем в «Привет!»-пузырь и сердце ──
export const Strokes: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx;
  const palette = [C.yellow, EGO.C.color, "#ffb3c7", "#ffffff"];
  // ладонь: прямоугольник + пальцы
  const hand = SH.union(SH.rect(150, 160, 40), SH.move(SH.rect(30, 120, 15), -55, -120), SH.move(SH.rect(30, 140, 15), -18, -135), SH.move(SH.rect(30, 140, 15), 18, -132), SH.move(SH.rect(30, 120, 15), 54, -118), SH.move(SH.rect(30, 90, 15), -100, -20));
  const handPts = dotsOf("stroke-hand", hand, cx, 470, palette, 13, 260);
  const heartPts = dotsOf("stroke-heart", SH.heart(150), cx, 470, ["#ff6b9a", "#ff9fb8", C.yellow, "#ffffff"], 13, 260);
  const k1 = ramp(t, 0.1, 1.4);
  const morph = ramp(t, at(ctx, 1.6), 1.4);
  const labels = [
    { text: "прикосновение", at: 1.05, x: cx - 380, y: 260 },
    { text: "кивок", at: 1.35, x: cx + 380, y: 300 },
    { text: "«Привет!»", at: 1.55, x: cx - 360, y: 640 },
  ];
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.035}>
      {morph <= 0 ? <Swarm pts={handPts} k={k1} t={t} r={6} from="scatter" /> : <Morph a={handPts} b={heartPts} k={morph} t={t} r={6} />}
      {labels.map((l, i) => (
        <Plate key={i} x={l.x} y={l.y} text={l.text} k={ramp(t, at(ctx, l.at), 0.5)} bg="#ffffff" size={40} />
      ))}
      <Plate x={cx} y={790} text="трансакция — единица общения" k={ramp(t, at(ctx, 2.15), 0.5)} size={40} />
    </Drift>
  );
};

// ── Диалог людей с репликами-пузырями ──
type PPerson = { who: Who; x: number; mood?: FigMood; pose?: FigPose; flip?: boolean; moodAt?: { at: number; mood: FigMood }[] };
type PBubble = { p: number; text: string; at: number; tone?: Tone; until?: number };
type PDialog = HostP & { people: PPerson[]; bubbles: PBubble[]; tag?: { text: string; at: number; hidden?: boolean; warn?: boolean } };
export const Dialog: React.FC<VisualProps<PDialog>> = (ctx) => {
  const { t, p } = ctx;
  const A = area(p.host);
  // координаты людей задаются для полного кадра и сжимаются в область без банана
  const xs = p.people.map((pp) => pp.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const mapX = (x: number) => (maxX === minX ? A.cx : A.x0 + 200 + ((x - minX) / (maxX - minX)) * (A.x1 - A.x0 - 400));
  const shown = p.bubbles.map((b, i) => ({ ...b, i, s: at(ctx, b.at), e: b.until !== undefined ? at(ctx, b.until) : 1e9 })).filter((b) => t >= b.s && t < b.e + 0.4);
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
      {p.people.map((pp, i) => {
        const x = mapX(pp.x);
        let mood = pp.mood ?? "neutral";
        for (const m of pp.moodAt ?? []) if (t >= at(ctx, m.at)) mood = m.mood;
        const speaking = shown.some((b) => b.p === i && t - b.s < 1.6);
        return <Person key={i} who={pp.who} x={x} y={830} s={pp.who.startsWith("kid") ? 0.95 : 0.85} mood={speaking && mood === "neutral" ? "smile" : mood} pose={pp.pose ?? (speaking ? "give" : "stand")} t={t} flip={pp.flip} seed={i * 3} />;
      })}
      {p.people.map((pp, i) => {
        const mine = shown.filter((b) => b.p === i);
        const x = mapX(pp.x);
        return mine.slice(-1).map((b) => {
          const newest = true;
          const k = pop(t, b.s) * (b.e < 1e8 ? 1 - ramp(t, b.e, 0.4) : 1);
          const w = Math.min(640, Math.max(...b.text.split("\n").map((r) => textW(r, 38))) + 60);
          const bx = Math.max(A.x0 + w / 2 + 10, Math.min(A.x1 - w / 2 - 10, x));
          const kid = pp.who.startsWith("kid");
          const baseY = kid ? 470 : 330;
          return (
            <g key={b.i}>
              <Bubble x={bx} y={newest ? baseY : baseY - 150} text={b.text} k={k} tone={b.tone ?? "said"} tail={newest ? "b" : "none"} maxW={640} />
            </g>
          );
        });
      })}
      {p.tag && <Plate x={A.cx} y={130} text={p.tag.text} k={ramp(t, at(ctx, p.tag.at), 0.5)} bg={p.tag.hidden ? "#efe9ff" : p.tag.warn ? "#ffe1d8" : C.yellow} dash={p.tag.hidden} size={36} />}
    </Drift>
  );
};

// ── Лестница способов провести время (от простого к сложному) ──
type PLadder = HostP & { title: string; steps: { text: string; at: number; hot?: boolean }[]; note?: { text: string; at: number } };
export const Ladder: React.FC<VisualProps<PLadder>> = (ctx) => {
  const { t, p } = ctx;
  const A = area(p.host);
  const n = p.steps.length;
  const stepW = (A.x1 - A.x0 - 120) / n;
  const colors = [EGO.P.light, "#d9f0ff", EGO.C.color, "#ffd6e4", EGO.A.light];
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
      <Plate x={A.cx} y={150} text={p.title} k={ramp(t, 0.2, 0.6)} bg="#ffffff" size={42} />
      {p.steps.map((s, i) => {
        const k = pop(t, at(ctx, s.at));
        const h = 140 + i * 80;
        const x = A.x0 + 60 + i * stepW;
        return (
          <g key={i} transform={`translate(${x} ${720 - h * Math.min(1, k)})`} opacity={clamp01(k * 1.5)}>
            <rect x={6} y={8} width={stepW - 14} height={h} rx={18} fill="#000" opacity={0.15} />
            <rect x={0} y={0} width={stepW - 14} height={h} rx={18} fill={colors[i % colors.length]} stroke={OL} strokeWidth={5} />
            <text x={(stepW - 14) / 2} y={58} fontFamily={FONT} fontWeight={900} fontSize={Math.min(40, (stepW - 40) / (Math.max(...s.text.split("\n").map((r) => [...r].length)) * 0.56))} fill={C.ink} textAnchor="middle">
              {s.text.split("\n").map((r, j) => (
                <tspan key={j} x={(stepW - 14) / 2} dy={j === 0 ? 0 : 42}>
                  {r}
                </tspan>
              ))}
            </text>
            {s.hot && (
              <g transform={`translate(${(stepW - 14) / 2} ${-46})`}>
                <circle r={34 + 4 * Math.sin(t * 4)} fill={C.yellow} stroke={OL} strokeWidth={4} />
                <text y={16} fontFamily={DISPLAY} fontWeight={800} fontSize={46} fill={OL} textAnchor="middle">
                  !
                </text>
              </g>
            )}
          </g>
        );
      })}
      {p.note && <Plate x={A.cx} y={800} text={p.note.text} k={ramp(t, at(ctx, p.note.at), 0.5)} bg="#e3fbef" size={36} />}
    </Drift>
  );
};

// ── Операция или игра: одна и та же просьба, разные финалы ──
export const OpVsGame: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const mid = A.cx;
  const colW = (A.x1 - A.x0) / 2 - 30;
  const lk = ramp(t, at(ctx, 1), 0.6);
  const rk = ramp(t, at(ctx, 2), 0.6);
  const turn = ramp(t, at(ctx, 2.55), 0.8);
  const col = (x: number, k: number, title: string, color: string, last: React.ReactNode) => (
    <g transform={`translate(${x} 0)`} opacity={k}>
      <rect x={-colW / 2} y={170} width={colW} height={620} rx={36} fill="#ffffff" fillOpacity={0.92} stroke={OL} strokeWidth={5} />
      <rect x={-colW / 2} y={170} width={colW} height={84} rx={36} fill={color} stroke={OL} strokeWidth={5} />
      <text x={0} y={228} fontFamily={DISPLAY} fontWeight={800} fontSize={48} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={5} paintOrder="stroke">
        {title}
      </text>
      <Bubble x={0} y={340} text={"Утешьте меня…"} k={k} tail="none" maxW={colW - 60} />
      <path d="M 0 400 L 0 450" stroke={OL} strokeWidth={8} strokeLinecap="round" />
      <Bubble x={0} y={510} text={"Мне очень жаль."} k={k} tail="none" tone="soft" maxW={colW - 60} />
      <path d="M 0 570 L 0 620" stroke={OL} strokeWidth={8} strokeLinecap="round" />
      {last}
    </g>
  );
  return (
    <Drift t={t} dur={ctx.dur} cx={mid} amount={0.025}>
      {col(
        mid - colW / 2 - 15,
        lk,
        "операция",
        EGO.A.color,
        <g>
          <circle cx={0} cy={700} r={56} fill={C.green} stroke={OL} strokeWidth={5} />
          <path d="M -26 700 L -6 722 L 30 680" fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
        </g>,
      )}
      {col(
        mid + colW / 2 + 15,
        rk,
        "игра",
        C.outcome,
        <g opacity={turn}>
          <Bubble x={0} y={700} text={"А толку-то от вас!"} k={turn} tail="none" tone="hot" maxW={colW - 60} />
        </g>,
      )}
    </Drift>
  );
};

// ── Цепочка ходов: снаружи правдоподобно, внизу скрытый мотив, в конце выигрыш ──
type PChain = HostP & { steps: string[]; labels: { text: string; at: number; hidden?: boolean; outcome?: boolean }[]; foot?: { text: string; at: number } };
export const Chain: React.FC<VisualProps<PChain>> = (ctx) => {
  const { t, p } = ctx;
  const A = area(p.host);
  const n = p.steps.length;
  const gap = (A.x1 - A.x0 - 200) / (n - 1);
  const xs = p.steps.map((_, i) => A.x0 + 100 + i * gap);
  const y = 420;
  const hk = ramp(t, at(ctx, p.labels.find((l) => l.hidden)?.at ?? 1.2), 1.0);
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
      {/* скрытый слой — пунктир под ходами */}
      <path d={`M ${xs[0]} ${y + 170} L ${xs[n - 1]} ${y + 170}`} stroke={C.hidden} strokeWidth={10} strokeDasharray={`26 18`} strokeDashoffset={-t * 30} opacity={hk} strokeLinecap="round" />
      {xs.map((x, i) => {
        const k = pop(t, 0.2 + i * 0.45);
        const last = i === n - 1;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${Math.min(1, k)})`}>
            {i > 0 && <path d={`M ${-gap + 90} 0 L ${-90} 0`} stroke="#fff" strokeWidth={10} strokeLinecap="round" />}
            <circle r={last ? 92 : 78} fill={last ? C.outcome : "#ffffff"} stroke={OL} strokeWidth={6} />
            <text y={14} fontFamily={DISPLAY} fontWeight={800} fontSize={last ? 40 : 38} fill={last ? "#fff" : C.ink} textAnchor="middle" stroke={last ? OL : "none"} strokeWidth={5} paintOrder="stroke">
              {p.steps[i]}
            </text>
            <line x1={0} y1={last ? 92 : 78} x2={0} y2={170} stroke={C.hidden} strokeWidth={6} strokeDasharray="10 10" opacity={hk} />
          </g>
        );
      })}
      {p.labels.map((l, i) => {
        const k = ramp(t, at(ctx, l.at), 0.5);
        const x = l.outcome ? xs[n - 1] : l.hidden ? A.cx : (xs[0] + xs[n - 2]) / 2;
        const yy = l.hidden ? y + 250 : l.outcome ? y - 170 : y - 170;
        return <Plate key={i} x={x} y={yy} text={l.text} k={k} bg={l.hidden ? "#efe9ff" : l.outcome ? C.outcome : "#ffffff"} fg={l.outcome ? "#fff" : C.ink} dash={l.hidden} size={38} />;
      })}
      {p.foot && <Plate x={A.cx} y={800} text={p.foot.text} k={ramp(t, at(ctx, p.foot.at), 0.5)} size={36} />}
    </Drift>
  );
};

// ── Петля: разные реплики крутятся по кругу, итог возвращается в одну точку ──
export const Loop: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx;
  const cy = 450;
  const R = 270;
  const ring = dotsOf("loop-ring", SH.ring(R - 16, R + 16), cx, cy, [EGO.P.color, EGO.A.color, EGO.C.color, "#ffffff"], 12, 320, "mix");
  const k = ramp(t, 0.1, 1.4);
  const words = ["Почему бы…?", "А если так?", "Попробуйте!", "Может, вот это?", "А вы…?"];
  const spin = t * 0.5;
  const fin = 0.5 + 0.5 * Math.sin(t * 3);
  return (
    <g>
      <Swarm pts={ring} k={k} t={t} r={6} from="center" />
      {words.map((w, i) => {
        const a = spin + (i / words.length) * Math.PI * 2;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R * 0.98;
        return (
          <g key={i} opacity={k}>
            <rect x={x - textW(w, 30) / 2 - 18} y={y - 28} width={textW(w, 30) + 36} height={54} rx={24} fill="#ffffff" stroke={OL} strokeWidth={4} />
            <text x={x} y={y + 10} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink} textAnchor="middle">
              {w}
            </text>
          </g>
        );
      })}
      <g transform={`translate(${cx} ${cy})`} opacity={k}>
        <circle r={118 + fin * 8} fill={C.outcome} stroke={OL} strokeWidth={6} />
        <text y={-6} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={5} paintOrder="stroke">
          тот же
        </text>
        <text y={40} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={5} paintOrder="stroke">
          финал
        </text>
      </g>
      <Plate x={cx} y={790} text="слова меняются — итог возвращается" k={ramp(t, at(ctx, 0.4), 0.5)} size={38} />
    </g>
  );
};
