// Сцены о состояниях Я, трансакциях и игре «Почему бы вам не… — Да, но».
// Схемы двух собеседников — собственные диаграммы фильма по словесному
// описанию автора (изображения схем в источнике отсутствуют).
import React from "react";
import { C, DISPLAY, EGO, EGOS, FONT, type EgoId } from "../theme";
import { Bubble, EgoStack, egoPos, Plate, textW, TransArrow, type LaneColor, type Tone } from "./core";
import { dotsOf, Morph, SH, Swarm, word } from "./dots";
import { OL, Person, type Who } from "./draw";
import { area, at, Check, clamp01, Cross, Drift, ease, pop, ramp, type VisualProps } from "./kit";

type HostP = { host?: string };

// ── Значки состояний (крупно, в центре внимания) ──
const EgoIcon: React.FC<{ e: EgoId; t: number }> = ({ e, t }) => {
  if (e === "P")
    return (
      <g>
        {/* открытая книга правил и сердце заботы */}
        <path d="M -120 -40 Q -60 -70 0 -40 L 0 80 Q -60 50 -120 80 Z" fill="#fff" stroke={OL} strokeWidth={6} />
        <path d="M 120 -40 Q 60 -70 0 -40 L 0 80 Q 60 50 120 80 Z" fill="#fff" stroke={OL} strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <line x1={-100} y1={-14 + i * 26} x2={-24} y2={-24 + i * 26} stroke={EGO.P.deep} strokeWidth={6} strokeLinecap="round" />
            <line x1={24} y1={-24 + i * 26} x2={100} y2={-14 + i * 26} stroke={EGO.P.deep} strokeWidth={6} strokeLinecap="round" />
          </g>
        ))}
        <path d="M 0 -96 C -20 -130 -66 -110 -40 -76 L 0 -44 L 40 -76 C 66 -110 20 -130 0 -96 Z" transform={`scale(${1 + 0.05 * Math.sin(t * 3)})`} fill="#ff6b9a" stroke={OL} strokeWidth={5} />
      </g>
    );
  if (e === "A")
    return (
      <g>
        {/* весы оценки и стрелка-индикатор */}
        <rect x={-130} y={-90} width={260} height={180} rx={26} fill="#fff" stroke={OL} strokeWidth={6} />
        <path d="M -90 50 A 90 90 0 0 1 90 50" fill="none" stroke={EGO.A.light} strokeWidth={22} />
        <path d="M -90 50 A 90 90 0 0 1 20 -38" fill="none" stroke={EGO.A.color} strokeWidth={22} />
        <line x1={0} y1={50} x2={70 * Math.cos(-Math.PI / 2 + 0.6 * Math.sin(t * 1.2))} y2={50 + 70 * Math.sin(-Math.PI / 2 + 0.6 * Math.sin(t * 1.2))} stroke={OL} strokeWidth={8} strokeLinecap="round" />
        <circle cx={0} cy={50} r={12} fill={OL} />
      </g>
    );
  return (
    <g>
      {/* воздушный змей и звёздочки — радость и творчество */}
      <g transform={`rotate(${8 * Math.sin(t * 1.5)})`}>
        <path d="M 0 -120 L 80 -20 L 0 60 L -80 -20 Z" fill={EGO.C.color} stroke={OL} strokeWidth={6} />
        <path d="M 0 -120 L 0 60 M -80 -20 L 80 -20" stroke={OL} strokeWidth={4} />
        <path d={`M 0 60 q 20 30 0 50 q -20 20 0 50`} fill="none" stroke={OL} strokeWidth={4} />
      </g>
      {[[-130, -90], [130, -70], [120, 70]].map(([x, y], i) => (
        <path key={i} d="M 0 -20 L 6 -6 L 20 0 L 6 6 L 0 20 L -6 6 L -20 0 L -6 -6 Z" transform={`translate(${x} ${y}) scale(${1.2 + 0.3 * Math.sin(t * 3 + i)})`} fill={C.yellow} stroke={OL} strokeWidth={3} />
      ))}
    </g>
  );
};

// ── Улица: машины едут, пешеход оценивает и переходит (пример Взрослого) ──
const Street: React.FC<{ t: number; x: number; y: number; k: number; go: number }> = ({ t, x, y, k, go }) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    <rect x={-330} y={-70} width={660} height={140} rx={20} fill="#4a5070" stroke={OL} strokeWidth={5} />
    {[-240, -120, 0, 120, 240].map((dx) => (
      <rect key={dx} x={dx - 30} y={-6} width={60} height={12} rx={6} fill="#fff" />
    ))}
    {[0, 1].map((i) => {
      const cx = (((t * 260 + i * 330) % 900) - 450) * (1 - go * 0.999);
      return (
        <g key={i} transform={`translate(${go > 0.5 ? (i ? 400 : -420) : cx} ${i ? 34 : -34})`} opacity={go > 0.5 ? 0 : 1}>
          <rect x={-60} y={-24} width={120} height={48} rx={14} fill={i ? EGO.C.color : EGO.P.color} stroke={OL} strokeWidth={4} />
          <circle cx={-34} cy={26} r={12} fill={OL} />
          <circle cx={34} cy={26} r={12} fill={OL} />
        </g>
      );
    })}
    <g transform={`translate(${-20} ${110 - go * 200})`}>
      <circle r={22} fill={C.skin} stroke={OL} strokeWidth={4} />
      <rect x={-18} y={22} width={36} height={50} rx={14} fill={EGO.A.color} stroke={OL} strokeWidth={4} />
    </g>
  </g>
);

// ── Три состояния Я: общий вид или одно состояние крупно ──
type PEgo = HostP & { focus: "all" | EgoId; items?: string[]; street?: boolean };
export const Ego: React.FC<VisualProps<PEgo>> = (ctx) => {
  const { t, p } = ctx;
  const A = area(p.host);
  if (p.focus === "all") {
    const cx = A.cx + 120;
    const pts = EGOS.flatMap((e, i) => dotsOf(`ego-all-${e}`, SH.circle(78), cx, 230 + i * 190, [EGO[e].color, EGO[e].light, EGO[e].deep], 12, 100));
    const k = ramp(t, at(ctx, 0.6), 1.4);
    const solid = ramp(t, at(ctx, 1.25), 0.7);
    return (
      <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
        <Person who="anna" x={A.x0 + 170} y={800} s={0.95} mood="smile" t={t} pose={t > at(ctx, 1) ? "point" : "stand"} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${A.x0 + 260} ${420} C ${A.x0 + 360} ${420} ${cx - 220} ${230 + i * 190} ${cx - 100} ${230 + i * 190}`} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="12 10" opacity={solid * 0.8} />
        ))}
        {solid < 1 && <Swarm pts={pts} k={k} t={t} r={6} from="scatter" spread={600} opacity={1 - solid} />}
        {EGOS.map((e, i) => {
          const kk = solid;
          return (
            <g key={e} opacity={kk} transform={`translate(${cx} ${230 + i * 190})`}>
              <circle r={80} fill={EGO[e].color} stroke={OL} strokeWidth={6} />
              <text y={24} fontFamily={DISPLAY} fontWeight={800} fontSize={66} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={5} paintOrder="stroke">
                {EGO[e].short}
              </text>
              <text x={120} y={18} fontFamily={FONT} fontWeight={900} fontSize={56} fill="#fff" stroke={OL} strokeWidth={8} paintOrder="stroke">
                {EGO[e].name}
              </text>
            </g>
          );
        })}
        <Plate x={cx + 160} y={800} text="три режима одного человека" k={ramp(t, at(ctx, 2.2), 0.5)} size={38} />
      </Drift>
    );
  }
  const e = p.focus;
  const cx = A.cx + 60;
  const big = pop(t, 0.25);
  const items = p.items ?? [];
  const goStreet = p.street ? ramp(t, at(ctx, 1.75), 1.2) : 0;
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
      <EgoStack x={A.x0 + 120} y={460} s={0.62} hi={[e]} t={t} />
      <g transform={`translate(${cx} ${p.street ? 330 : 400}) scale(${Math.min(1.05, big)})`}>
        <circle r={210} fill={EGO[e].color} stroke={OL} strokeWidth={7} />
        <circle r={180} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={5} />
        <g transform="scale(0.95)">
          <EgoIcon e={e} t={t} />
        </g>
      </g>
      <text x={cx} y={p.street ? 600 : 680} fontFamily={DISPLAY} fontWeight={800} fontSize={72} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={8} paintOrder="stroke" opacity={big}>
        {EGO[e].name}
      </text>
      {items.map((it, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const x = cx + side * 380 + (i === 2 ? 0 : 0);
        const y = i === 2 ? (p.street ? 120 : 140) : 220 + i * 40;
        return <Plate key={i} x={i === 2 ? cx + 360 : x} y={y} text={it} k={ramp(t, at(ctx, 0.3 + i * 0.25), 0.5)} bg="#ffffff" size={40} />;
      })}
      {p.street && <Street t={t} x={cx} y={740} k={ramp(t, at(ctx, 1), 0.6)} go={goStreet} />}
    </Drift>
  );
};

// ── Не ярлыки: три круга, режим переходит, неверные подписи зачёркнуты ──
export const NotLabels: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const wrong = [
    { text: "не возраст", at: 0.3, x: A.x0 + 260, y: 200 },
    { text: "не три человека", at: 0.55, x: A.x1 - 300, y: 200 },
    { text: "не «незрелая личность»", at: 1.3, x: A.x0 + 340, y: 700 },
    { text: "не «плохой» цвет", at: 2.2, x: A.x1 - 300, y: 700 },
  ];
  // активное состояние переходит по кругу — человек меняет режим
  const cur = EGOS[Math.floor(t / 1.6) % 3];
  const cx = A.cx;
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.03}>
      {EGOS.map((e, i) => {
        const x = cx + (i - 1) * 260;
        const on = e === cur;
        return (
          <g key={e} transform={`translate(${x} 450) scale(${on ? 1.12 + 0.03 * Math.sin(t * 5) : 0.92})`} opacity={pop(t, 0.1 + i * 0.15)}>
            <circle r={100} fill={EGO[e].color} stroke={OL} strokeWidth={6} opacity={on ? 1 : 0.6} />
            <text y={28} fontFamily={DISPLAY} fontWeight={800} fontSize={80} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={5} paintOrder="stroke">
              {EGO[e].short}
            </text>
          </g>
        );
      })}
      {wrong.map((w, i) => {
        const k = ramp(t, at(ctx, w.at), 0.5);
        const ck = ramp(t, at(ctx, w.at) + 0.6, 0.5);
        return (
          <g key={i} opacity={k}>
            <Plate x={w.x} y={w.y} text={w.text} k={k} bg="#ffffff" size={36} />
            <line x1={w.x - textW(w.text, 36) / 2 - 10} y1={w.y} x2={w.x - textW(w.text, 36) / 2 - 10 + (textW(w.text, 36) + 20) * ck} y2={w.y} stroke={C.red} strokeWidth={8} strokeLinecap="round" />
          </g>
        );
      })}
      <Plate x={cx} y={820} text="режим, а не ярлык" k={ramp(t, at(ctx, 2.4), 0.5)} size={42} />
    </Drift>
  );
};

// ── Трансакции между двумя людьми ──
type PArrow = { from: EgoId; to: EgoId; dir: "r" | "l"; at: number; color?: LaneColor; until?: number; label?: string; swap?: [string, string] };
type PTrans = HostP & {
  left: string;
  right: string;
  arrows: PArrow[];
  say?: { side: "l" | "r"; text: string; at: number; until?: number; tone?: Tone }[];
  cross?: number;
  levels?: number;
  caption?: { text: string; at: number };
  rule?: { text: string; at: number };
};
export const Trans: React.FC<VisualProps<PTrans>> = (ctx) => {
  const { t, p } = ctx;
  const A = area(p.host);
  const s = 0.92;
  const lx = A.x0 + 230;
  const rx = A.x1 - 230;
  const cy = 500;
  let names: [string, string] = [p.left, p.right];
  for (const a of p.arrows) if (a.swap && t >= at(ctx, a.at) - 0.3) names = a.swap;
  const lvl = p.levels !== undefined ? ramp(t, at(ctx, p.levels), 0.6) : 0;
  const ck = p.cross !== undefined ? pop(t, at(ctx, p.cross)) : 0;
  return (
    <Drift t={t} dur={ctx.dur} cx={(lx + rx) / 2} cy={cy} amount={0.025}>
      <EgoStack x={lx} y={cy} s={s} k={ramp(t, 0, 0.6)} t={t} label={names[0]} />
      <EgoStack x={rx} y={cy} s={s} k={ramp(t, 0.15, 0.6)} t={t} label={names[1]} />
      {lvl > 0 && (
        <g opacity={lvl}>
          <text x={(lx + rx) / 2} y={cy + 345} fontFamily={FONT} fontWeight={900} fontSize={32} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
            сплошная — социальный уровень · пунктир — психологический
          </text>
        </g>
      )}
      {p.arrows.map((a, i) => {
        const s0 = at(ctx, a.at);
        if (t < s0) return null;
        // стрелки до смены собеседников (swap) уходят перед новым примером
        const swapIdx = p.arrows.findIndex((b) => b.swap);
        const autoUntil = swapIdx > i ? at(ctx, p.arrows[swapIdx].at) - 0.5 : 1e9;
        const until = a.until !== undefined ? at(ctx, a.until) : autoUntil;
        const out = ramp(t, until, 0.4);
        if (out >= 1) return null;
        const fromX = a.dir === "r" ? lx : rx;
        const toX = a.dir === "r" ? rx : lx;
        const fp = egoPos(fromX, cy, s, a.from);
        const tp = egoPos(toX, cy, s, a.to);
        const sign = a.dir === "r" ? 1 : -1;
        const off = a.dir === "r" ? -16 : 16;
        const k = ease(clamp01((t - s0) / 0.7));
        return <TransArrow key={i} x1={fp.x + sign * (fp.r + 12)} y1={fp.y + off} x2={tp.x - sign * (tp.r + 18)} y2={tp.y + off} k={k} color={a.color ?? "said"} label={a.label} labelY={a.dir === "r" ? fp.y - 50 : fp.y + 70} opacity={1 - out} />;
      })}
      {ck > 0 && (
        <g transform={`translate(${(lx + rx) / 2} ${cy - 70}) scale(${Math.min(1.1, ck)})`}>
          <circle r={58} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <path d="M -24 -24 L 24 24 M 24 -24 L -24 24" stroke={OL} strokeWidth={10} strokeLinecap="round" />
        </g>
      )}
      {(p.say ?? []).map((b, i) => {
        const s0 = at(ctx, b.at);
        const until = b.until !== undefined ? at(ctx, b.until) : 1e9;
        if (t < s0 || t > until + 0.4) return null;
        const k = pop(t, s0) * (1 - ramp(t, until, 0.4));
        return <Bubble key={i} x={b.side === "l" ? lx + 260 : rx - 260} y={b.side === "l" ? 150 : 220} text={b.text} k={k} tone={b.tone ?? "said"} tail={b.side === "l" ? "l" : "r"} maxW={620} size={36} />;
      })}
      {p.caption && <Plate x={(lx + rx) / 2} y={cy + 170} text={p.caption.text} k={ramp(t, at(ctx, p.caption.at), 0.5)} bg="#efe9ff" dash size={34} />}
      {p.rule && <Plate x={(lx + rx) / 2} y={820} text={p.rule.text} k={ramp(t, at(ctx, p.rule.at), 0.5)} size={32} />}
    </Drift>
  );
};

// ── Две карточки: что НЕ следует и что следует (или честная помощь / игра) ──
type PCard = { title: string; wrong?: string; right?: string; lines?: string[]; good?: boolean; outcome?: string };
type PVerdict = HostP & { left: PCard; rightCard: PCard };
export const Verdict: React.FC<VisualProps<PVerdict>> = (ctx) => {
  const { t, p } = ctx;
  const A = area(p.host);
  const w = (A.x1 - A.x0) / 2 - 40;
  const h = 560;
  const rAt = ctx.beats.length >= 3 ? 2 : 1;
  const card = (c: PCard, x: number, a0: number) => {
    const k = pop(t, at(ctx, a0));
    if (k <= 0.01) return null;
    const ck = ramp(t, at(ctx, a0 + 0.25), 0.5);
    const rk = ramp(t, at(ctx, a0 + 0.45), 0.5);
    const head = c.good ? EGO.A.color : c.wrong ? "#7a86b8" : C.outcome;
    return (
      <g transform={`translate(${x} 460) scale(${0.7 + 0.3 * Math.min(1, k)})`} opacity={clamp01(k * 1.5)}>
        <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={36} fill="#000" opacity={0.16} />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={36} fill="#ffffff" stroke={OL} strokeWidth={5} />
        <rect x={-w / 2} y={-h / 2} width={w} height={100} rx={36} fill={head} stroke={OL} strokeWidth={5} />
        <text y={-h / 2 + 66} fontFamily={DISPLAY} fontWeight={800} fontSize={Math.min(46, (w - 50) / ([...c.title].length * 0.56))} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={5} paintOrder="stroke">
          {c.title}
        </text>
        {c.wrong && (
          <g>
            <text y={-40} fontFamily={FONT} fontWeight={900} fontSize={Math.min(40, (w - 60) / ([...c.wrong].length * 0.56))} fill={C.inkSoft} textAnchor="middle">
              {c.wrong}
            </text>
            <line x1={-w / 2 + 40} y1={-52} x2={-w / 2 + 40 + (w - 80) * ck} y2={-52} stroke={C.red} strokeWidth={9} strokeLinecap="round" />
          </g>
        )}
        {c.right && (
          <g opacity={rk}>
            <Check x={0} y={60} s={46} k={rk} />
            <text y={170} fontFamily={FONT} fontWeight={900} fontSize={Math.min(44, (w - 60) / ([...c.right].length * 0.56))} fill={EGO.A.deep} textAnchor="middle">
              {c.right}
            </text>
          </g>
        )}
        {c.lines && (
          <text y={-60} fontFamily={FONT} fontWeight={900} fontSize={Math.min(40, (w - 60) / (Math.max(...c.lines.map((l) => [...l].length)) * 0.56))} fill={C.ink} textAnchor="middle">
            {c.lines.map((l, i) => (
              <tspan key={i} x={0} dy={i === 0 ? 0 : 54}>
                {l}
              </tspan>
            ))}
          </text>
        )}
        {c.lines && c.good && <Check x={0} y={150} s={50} k={rk} />}
        {c.outcome && (
          <g opacity={rk}>
            <rect x={-w / 2 + 40} y={110} width={w - 80} height={110} rx={30} fill={C.outcome} stroke={OL} strokeWidth={4} />
            <text y={180} fontFamily={FONT} fontWeight={900} fontSize={Math.min(40, (w - 120) / ([...c.outcome].length * 0.56))} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={5} paintOrder="stroke">
              {c.outcome}
            </text>
          </g>
        )}
        {c.lines && !c.good && !c.outcome && <Cross x={0} y={150} s={80} k={rk} />}
      </g>
    );
  };
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.025}>
      {card(p.left, A.x0 + 20 + w / 2, 0.1)}
      {card(p.rightCard, A.x1 - 20 - w / 2, rAt + 0.1)}
    </Drift>
  );
};

// ── Заголовок главной игры: точки собираются в «ДА, НО…», затем карточка описания ──
export const YesButTitle: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx;
  const pal = [EGO.C.color, C.yellow, "#ffffff", EGO.P.color];
  const q = dotsOf("yb-q", word("?", 260, 30), cx, 400, pal, 12, 260);
  const da = dotsOf("yb-dano", word("ДА,НО", 150, 24), cx, 400, pal, 10, 440);
  const k1 = ramp(t, 0.1, 1.0);
  const m = ramp(t, at(ctx, 0.35), 1.4);
  const fields = ["тезис", "цель", "роли", "ходы", "выигрыши", "антитезис"];
  const fk = at(ctx, 2);
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.03}>
      <Plate x={cx} y={170} text="«Почему бы вам не…»" k={ramp(t, at(ctx, 0.15), 0.5)} bg="#ffffff" size={50} />
      {m <= 0 ? <Swarm pts={q} k={k1} t={t} r={6} /> : <Morph a={q} b={da} k={m} t={t} r={6} />}
      {fields.map((f, i) => {
        const k = pop(t, fk + i * 0.35);
        const x = A.x0 + 120 + i * ((A.x1 - A.x0 - 240) / 5);
        return (
          <g key={f} transform={`translate(${x} 700) scale(${Math.min(1, k)})`} opacity={clamp01(k * 1.5)}>
            <rect x={-textW(f, 34) / 2 - 22} y={-36} width={textW(f, 34) + 44} height={66} rx={20} fill={f === "антитезис" ? EGO.A.color : "#ffffff"} stroke={OL} strokeWidth={4} />
            <text y={10} fontFamily={FONT} fontWeight={900} fontSize={34} fill={f === "антитезис" ? "#fff" : C.ink} textAnchor="middle">
              {f}
            </text>
          </g>
        );
      })}
    </Drift>
  );
};

// ── Очередь советов и «Да, но…» ──
type PQueue = HostP & { opener: { text: string; at: number }; rounds: { advice: string; reply: string; at: number; re: number }[]; silence: number };
export const Queue: React.FC<VisualProps<PQueue>> = (ctx) => {
  const { t, p } = ctx;
  const A = area(p.host);
  const advisers: Who[] = ["friend", "neighbor", "student", "grandma"];
  const sil = ramp(t, at(ctx, p.silence), 0.8);
  const cur = p.rounds.filter((r) => t >= at(ctx, r.at)).length - 1;
  const herX = A.x1 - 170;
  const rejected = p.rounds.filter((r) => t >= at(ctx, r.re) + 0.5).length;
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
      {advisers.map((w, i) => {
        const x = A.x0 + 110 + i * 175;
        const active = i === cur;
        return <Person key={w} who={w} x={x} y={840} s={0.72} mood={sil > 0.5 ? "doubt" : active ? "smile" : "think"} pose={active && sil < 0.5 ? "give" : "stand"} t={t} seed={i} opacity={active || cur < 0 ? 1 : 0.75} />;
      })}
      <Person who="anna" x={herX} y={840} s={0.8} mood={sil > 0.5 ? "smile" : "doubt"} pose={cur >= 0 && sil < 0.5 ? "shrug" : "stand"} t={t} flip seed={7} />
      {cur < 0 && <Bubble x={herX - 200} y={300} text={p.opener.text} k={pop(t, at(ctx, p.opener.at))} tail="r" maxW={640} size={36} />}
      {cur >= 0 && sil < 1 && (() => {
        const r = p.rounds[cur];
        const x = A.x0 + 110 + cur * 175;
        return (
          <g opacity={1 - sil}>
            <Bubble x={Math.max(A.x0 + 260, x + 120)} y={210} text={r.advice} k={pop(t, at(ctx, r.at))} tail="b" maxW={520} size={38} />
            <Bubble x={herX - 230} y={380} text={r.reply} k={pop(t, at(ctx, r.re))} tail="r" tone="hot" maxW={560} size={38} />
          </g>
        );
      })()}
      {/* счётчик отвергнутых советов — карточки складываются стопкой */}
      {Array.from({ length: rejected }).map((_, i) => (
        <g key={i} transform={`translate(${herX - 300 + i * 14} ${600 - i * 10}) rotate(${-8 + i * 5})`} opacity={1 - sil}>
          <rect x={-70} y={-44} width={140} height={88} rx={14} fill="#ffffff" stroke={OL} strokeWidth={4} />
          <Cross x={0} y={0} s={56} k={1} />
        </g>
      ))}
      {sil > 0 && (
        <g opacity={sil}>
          {[-1, 0, 1].map((d) => (
            <circle key={d} cx={A.cx + d * 60} cy={300} r={20 + 4 * Math.sin(t * 3 + d)} fill="#fff" stroke={OL} strokeWidth={5} />
          ))}
          <Plate x={A.cx} y={150} text="итог — тишина" k={sil} bg={C.outcome} fg="#fff" size={44} />
        </g>
      )}
    </Drift>
  );
};

// ── Главная оговорка: действительно новая идея будет принята ──
export const NewIdea: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const bx = A.x0 + 300;
  const bulb = SH.union(SH.circle(110), SH.move(SH.rect(90, 70, 14), 0, 130));
  const pts = dotsOf("idea-bulb", bulb, bx, 330, [C.yellow, "#fff4b0", "#ffffff", EGO.C.color], 12, 220);
  const k = ramp(t, 0.15, 1.3);
  const ok = ramp(t, at(ctx, 0.75), 0.5);
  const reasons = ["нет денег", "нет времени", "уже пробовал"];
  const hyp = ramp(t, at(ctx, 2.3), 0.5);
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
      <circle cx={bx} cy={330} r={170} fill={C.yellow} opacity={0.18 * ok + 0.05 * Math.sin(t * 3) * ok} />
      <Swarm pts={pts} k={k} t={t} r={6} />
      <Plate x={bx} y={620} text={"действительно новая идея"} k={ramp(t, at(ctx, 0.35), 0.5)} bg="#ffffff" size={36} />
      <Plate x={bx} y={720} text={"→ примут с благодарностью"} k={ok} bg="#e3fbef" size={36} />
      <text x={A.x1 - 340} y={210} fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={7} paintOrder="stroke" opacity={ramp(t, at(ctx, 1.2), 0.5)}>
        «да, но» может значить:
      </text>
      {reasons.map((r, i) => (
        <Plate key={r} x={A.x1 - 340} y={300 + i * 110} text={r} k={ramp(t, at(ctx, 1.45 + i * 0.15), 0.5)} bg="#ffffff" size={40} />
      ))}
      <Plate x={A.x1 - 340} y={720} text={"рисунок — гипотеза,\nне приговор"} k={hyp} bg="#efe9ff" dash size={36} />
    </Drift>
  );
};

// ── Страх паузы: обмен репликами закрывает пустоту ──
export const Pause: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const gapK = ramp(t, at(ctx, 1), 0.8);
  const fill = ramp(t, at(ctx, 1.55), 1);
  const y = 430;
  const x0 = A.x0 + 60;
  const x1 = A.x1 - 60;
  const gx0 = x0 + (x1 - x0) * 0.42;
  const gx1 = x0 + (x1 - x0) * 0.72;
  const chips = Array.from({ length: 9 }).map((_, i) => ({ x: x0 + 60 + i * ((x1 - x0 - 120) / 8) }));
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
      <rect x={x0} y={y - 70} width={x1 - x0} height={140} rx={30} fill="#ffffff" fillOpacity={0.14} stroke="#fff" strokeOpacity={0.6} strokeWidth={4} />
      {chips.map((c, i) => {
        const inGap = c.x > gx0 && c.x < gx1;
        const k = inGap ? (gapK < 1 ? 1 - gapK : fill) : 1;
        const isAdvice = inGap;
        return (
          <g key={i} transform={`translate(${c.x} ${y + Math.sin(t * 2 + i) * 4})`} opacity={pop(t, 0.1 + i * 0.12) * (inGap ? k : 1)}>
            <rect x={-62} y={-38} width={124} height={76} rx={22} fill={isAdvice && fill > 0.1 ? EGO.P.light : "#ffffff"} stroke={OL} strokeWidth={4} />
            <text y={12} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink} textAnchor="middle">
              {isAdvice && fill > 0.1 ? (i % 2 ? "да, но" : "совет") : "…"}
            </text>
          </g>
        );
      })}
      {gapK > 0 && fill < 1 && (
        <g opacity={gapK * (1 - fill)}>
          <rect x={gx0} y={y - 90} width={gx1 - gx0} height={180} rx={30} fill="none" stroke={C.outcome} strokeWidth={6} strokeDasharray="18 12" />
          <text x={(gx0 + gx1) / 2} y={y + 150} fontFamily={DISPLAY} fontWeight={800} fontSize={54} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={8} paintOrder="stroke">
            пауза
          </text>
        </g>
      )}
      <Person who="anna" x={A.x0 + 160} y={860} s={0.62} mood={gapK > 0.5 && fill < 0.5 ? "shock" : "smile"} t={t} />
      <Plate x={A.cx + 80} y={760} text="игра даёт времени форму" k={ramp(t, at(ctx, 2.2), 0.5)} size={40} />
    </Drift>
  );
};
