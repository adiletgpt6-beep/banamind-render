// Сцены исследования и глав 1–4 BM-037: книга и рамка времени, критерий отбора,
// фильтр 1435 → 126 → 19 → 11, пары сравнения, объём работы, пирамида 5 уровня,
// окно и зеркало, эстафета преемника, автобус «сначала кто», «гений с 1000 помощников»,
// четыре механизма климата правды, парадокс Стокдейла, границы выводов, цитаты, вопросы.
import React from "react";
import { C, DISPLAY, FONT, NODES } from "../theme";
import { dotsOf, SH, Swarm } from "./dots";
import { OL, Person, type Who } from "./draw";
import { Lines } from "./engine";
import { SourceChip, type SrcKind } from "./generic";
import { Appear, area, at, Check, clamp01, Cross, Drift, ramp, wob, type VisualProps } from "./kit";
import { Chip, SceneTitle } from "./open";

// ── книга и время: собственная условная книга фильма (не обложка издания) ──
type BookP = { host?: string; facts?: string[]; title?: string };
export const BookCard: React.FC<VisualProps<BookP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const bx = ar.cx - 260;
  const k = ramp(t, 0.1, 0.8);
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.025}>
      <g transform={`translate(${bx} ${560 + (1 - k) * 40}) rotate(${-4 + wob(t, 1, 0.6)})`} opacity={k}>
        <rect x={-190} y={-250} width={380} height={500} rx={22} fill={C.coral} stroke={OL} strokeWidth={7} />
        <rect x={-160} y={-250} width={20} height={500} fill={C.coralDeep} />
        <circle cx={10} cy={-60} r={95} fill={C.paper} stroke={OL} strokeWidth={6} />
        <path d="M -40 -60 A 50 50 0 1 1 60 -60" fill="none" stroke={C.teal} strokeWidth={14} strokeLinecap="round" />
        <path d="M 60 -60 l -22 -8 l 14 26 Z" fill={C.teal} />
        <text x={10} y={110} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={C.white} textAnchor="middle">
          Хорошее
        </text>
        <text x={10} y={160} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={C.white} textAnchor="middle">
          → великое
        </text>
      </g>
      {(p.facts ?? []).map((f, i) => (
        <Appear key={i} t={t} at={at(ctx, 0.4 + i * 0.6)} x={ar.cx + 260} y={360 + i * 130}>
          <Chip x={0} y={0} text={f} size={32} bg={[C.yellow, C.tealLight, C.coralLight, C.white][i % 4]} />
        </Appear>
      ))}
      {p.title && (
        <Appear t={t} at={0} x={ar.cx} y={160}>
          <SceneTitle x={0} y={0} text={p.title} size={46} />
        </Appear>
      )}
    </Drift>
  );
};

// ── критерий отбора: две «ступени» без придуманной кривой ──
export const Criteria: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur } = ctx;
  const ar = area(ctx.p.host);
  const x0 = ar.x0 + 80;
  const x1 = ar.x1 - 60;
  const mid = (x0 + x1) / 2;
  const base = 780;
  const k1 = ramp(t, at(ctx, 0.3), 0.8);
  const k2 = ramp(t, at(ctx, 1), 0.8);
  const tk = ramp(t, at(ctx, 1.6), 0.6);
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      <line x1={x0} y1={base} x2={x1} y2={base} stroke={OL} strokeWidth={6} />
      <line x1={mid} y1={base + 20} x2={mid} y2={250} stroke={C.coral} strokeWidth={6} strokeDasharray="16 12" opacity={k1} />
      <Chip x={mid} y={230} text="точка перехода" size={28} bg={C.coralLight} opacity={k1} />
      <g opacity={k1}>
        <rect x={x0 + 20} y={base - 120} width={mid - x0 - 40} height={120} rx={18} fill={C.steelLight} stroke={OL} strokeWidth={4} />
        <Lines x={(x0 + mid) / 2} y={base - 60} text="15 лет: не выше 1,25 раза к рынку" n={22} size={30} />
      </g>
      <g opacity={k2}>
        <rect x={mid + 20} y={base - 380 * k2} width={x1 - mid - 40} height={380 * k2} rx={18} fill={C.yellow} stroke={OL} strokeWidth={4} />
        <Lines x={(mid + x1) / 2} y={base - 190} text="15 лет: не меньше 3 раз к рынку" n={18} size={34} />
      </g>
      <text x={(x0 + mid) / 2} y={base + 50} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.inkSoft} textAnchor="middle">
        до перехода
      </text>
      <text x={(mid + x1) / 2} y={base + 50} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.inkSoft} textAnchor="middle">
        после перехода
      </text>
      <Chip x={ar.cx} y={170} text="совокупная доходность акций к рынку · схема критерия, не график" size={26} bg={C.paper} opacity={tk} />
    </Drift>
  );
};

// ── фильтр исследователей 1435 → 126 → 19 → 11 ──
type LadderP = { host?: string; steps: { n: string; label: string }[]; note?: string };
export const Ladder: React.FC<VisualProps<LadderP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const n = p.steps.length;
  const w = ar.x1 - ar.x0 - 100;
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      {p.steps.map((s, i) => {
        const k = ramp(t, at(ctx, 0.2 + i * 0.6), 0.6);
        const x = ar.x0 + 50 + (w * (i + 0.5)) / n;
        const r = 150 - i * 22;
        const dots = Math.max(6, Math.round(110 / (i + 1) ** 1.2));
        return (
          <g key={i} opacity={k}>
            {Array.from({ length: dots }, (_, j) => {
              const a = (j / dots) * Math.PI * 2 + i;
              const rr = r * (0.35 + 0.6 * ((j * 37) % 11) / 11);
              return <circle key={j} cx={x + Math.cos(a) * rr} cy={500 + Math.sin(a) * rr * 0.8} r={9} fill={[C.teal, C.coral, C.yellow, C.indigo][(j + i) % 4]} stroke={OL} strokeOpacity={0.4} strokeWidth={1.5} />;
            })}
            <text x={x} y={735} fontFamily={DISPLAY} fontWeight={800} fontSize={76} fill={C.ink} textAnchor="middle">
              {s.n}
            </text>
            <Lines x={x} y={810} text={s.label} n={18} size={26} color={C.inkSoft} />
            {i < n - 1 && (
              <path d={`M ${x + 150} 500 L ${x + w / n - 160} 500`} stroke={OL} strokeWidth={8} strokeLinecap="round" opacity={ramp(t, at(ctx, 0.5 + i * 0.6), 0.4)} />
            )}
          </g>
        );
      })}
      {p.note && <Chip x={ar.cx} y={180} text={p.note} size={30} bg={C.yellow} opacity={ramp(t, at(ctx, 0.1), 0.5)} />}
    </Drift>
  );
};

// ── пары сравнения (таблица 1.2) ──
type PairsP = { host?: string; pairs: [string, string][]; extra?: string[]; title?: string; highlight?: number[] };
export const Pairs: React.FC<VisualProps<PairsP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const rowH = 54;
  const y0 = 250;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.02}>
      {p.title && (
        <Appear t={t} at={0} x={cx} y={180}>
          <SceneTitle x={0} y={0} text={p.title} size={40} />
        </Appear>
      )}
      <Chip x={cx - 330} y={y0} text="совершили переход · 11" size={26} bg={C.tealLight} opacity={ramp(t, 0.2, 0.4)} />
      <Chip x={cx + 120} y={y0} text="прямое сравнение · 11" size={26} bg={C.coralLight} opacity={ramp(t, at(ctx, 0.5), 0.4)} />
      {p.pairs.map(([a, b], i) => {
        const y = y0 + 70 + i * rowH;
        const k = ramp(t, 0.3 + i * 0.12, 0.3);
        const kb = ramp(t, at(ctx, 0.5) + i * 0.1, 0.3);
        const hl = p.highlight?.includes(i);
        return (
          <g key={i}>
            {hl && <rect x={cx - 520} y={y - 36} width={790} height={50} rx={16} fill={C.yellow} opacity={0.55 * kb} />}
            <text x={cx - 330} y={y} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink} textAnchor="middle" opacity={k}>
              {a}
            </text>
            <text x={cx - 105} y={y} fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.inkSoft} textAnchor="middle" opacity={kb}>
              ↔
            </text>
            <text x={cx + 120} y={y} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink} textAnchor="middle" opacity={kb}>
              {b}
            </text>
          </g>
        );
      })}
      {p.extra && (
        <g opacity={ramp(t, at(ctx, 1), 0.5)}>
          <Chip x={cx + 520} y={y0} text="не удержали · 6" size={26} bg="#fff0bf" />
          {p.extra.map((e, i) => (
            <text key={i} x={cx + 520} y={y0 + 70 + i * rowH} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink} textAnchor="middle">
              {e}
            </text>
          ))}
        </g>
      )}
    </Drift>
  );
};

// ── крупные числа-карточки (объём работы) ──
type StatsP = { host?: string; items: { n: string; label: string; at?: number; color?: string }[]; title?: string; note?: string; cols?: number };
export const Stats: React.FC<VisualProps<StatsP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cols = p.cols ?? Math.min(3, p.items.length);
  const rows = Math.ceil(p.items.length / cols);
  const w = Math.min(380, (ar.x1 - ar.x0 - 80) / cols - 30);
  const h = 230;
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      {p.title && (
        <Appear t={t} at={0} x={ar.cx} y={170}>
          <SceneTitle x={0} y={0} text={p.title} size={44} />
        </Appear>
      )}
      {p.items.map((it, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const x = ar.cx + (c - (cols - 1) / 2) * (w + 40);
        const y = 540 + (r - (rows - 1) / 2) * (h + 40);
        const k = ramp(t, at(ctx, it.at ?? 0.2 + i * 0.4), 0.5);
        return (
          <g key={i} transform={`translate(${x} ${y + (1 - k) * 30})`} opacity={k}>
            <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={30} fill="#000" opacity={0.1} />
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} fill={it.color ?? C.white} stroke={OL} strokeWidth={5} />
            <text x={0} y={-6} fontFamily={DISPLAY} fontWeight={800} fontSize={it.n.length > 7 ? 54 : 72} fill={C.ink} textAnchor="middle">
              {it.n}
            </text>
            <Lines x={0} y={64} text={it.label} n={Math.round(w / 17)} size={28} color={C.inkSoft} />
          </g>
        );
      })}
      {p.note && <Chip x={ar.cx} y={Math.min(840, 540 + (rows / 2) * (h + 40) + 40)} text={p.note} size={26} bg={C.paper} opacity={ramp(t, at(ctx, 1), 0.5)} />}
    </Drift>
  );
};

// ── пирамида пяти уровней (рис. «5 уровней иерархии»), не лестница по порядку ──
const LEVELS = ["Высокопрофессиональный сотрудник", "Ценный член команды", "Компетентный менеджер", "Эффективный руководитель", "Руководитель 5 уровня"];
export const Pyramid: React.FC<VisualProps<{ host?: string; note?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.02}>
      {LEVELS.map((l, i) => {
        const y = 830 - i * 120;
        const w = 980 - i * 150;
        const k = ramp(t, at(ctx, 0.1) + i * 0.35, 0.5);
        const top = i === 4;
        return (
          <g key={i} opacity={k} transform={`translate(0 ${(1 - k) * 20})`}>
            <rect x={cx - w / 2} y={y - 50} width={w} height={100} rx={20} fill={top ? C.yellow : [C.steelLight, C.tealLight, C.coralLight, C.indigoLight][i]} stroke={OL} strokeWidth={top ? 7 : 4} />
            <circle cx={cx - w / 2 - 50} cy={y} r={34} fill={top ? C.yellow : C.white} stroke={OL} strokeWidth={4} />
            <text x={cx - w / 2 - 50} y={y + 14} fontFamily={DISPLAY} fontWeight={800} fontSize={38} fill={C.ink} textAnchor="middle">
              {String(i + 1)}
            </text>
            <text x={cx} y={y + 12} fontFamily={FONT} fontWeight={900} fontSize={i > 2 ? 30 : 34} fill={C.ink} textAnchor="middle">
              {l}
            </text>
          </g>
        );
      })}
      {p.note && <Chip x={cx} y={190} text={p.note} size={30} bg={C.white} opacity={ramp(t, at(ctx, 1), 0.5)} />}
    </Drift>
  );
};

// ── окно и зеркало ──
type WMP = { host?: string; win?: string; mirror?: string };
export const WindowMirror: React.FC<VisualProps<WMP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const lx = ar.cx - 300;
  const rx = ar.cx + 300;
  const wk = ramp(t, at(ctx, 0.2), 0.6);
  const mk = ramp(t, at(ctx, 1), 0.6);
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.025}>
      <g opacity={wk} transform={`translate(${lx} 470)`}>
        <rect x={-200} y={-220} width={400} height={400} rx={18} fill="#bfe8ff" stroke={OL} strokeWidth={8} />
        <line x1={0} y1={-220} x2={0} y2={180} stroke={OL} strokeWidth={8} />
        <line x1={-200} y1={-20} x2={200} y2={-20} stroke={OL} strokeWidth={8} />
        <circle cx={110} cy={-130} r={40} fill={C.yellow} />
        {[-120, -40, 60, 130].map((x, i) => (
          <g key={i} transform={`translate(${x} ${120 + Math.sin(t * 3 + i) * 4})`}>
            <circle cy={-40} r={18} fill={[C.teal, C.coral, C.indigo, C.gold][i]} stroke={OL} strokeWidth={3} />
            <rect x={-18} y={-22} width={36} height={50} rx={14} fill={[C.teal, C.coral, C.indigo, C.gold][i]} stroke={OL} strokeWidth={3} />
          </g>
        ))}
      </g>
      <g opacity={mk} transform={`translate(${rx} 470)`}>
        <ellipse cx={0} cy={-20} rx={180} ry={220} fill={C.steelLight} stroke={OL} strokeWidth={8} />
        <ellipse cx={0} cy={-20} rx={150} ry={190} fill="#e9f4ff" />
        <path d="M -90 -150 L -20 -200 M -110 -90 L 20 -190" stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={0.8} />
        <rect x={-14} y={200} width={28} height={70} fill={C.wood} stroke={OL} strokeWidth={4} />
      </g>
      <Chip x={lx} y={760} text={p.win ?? "успех → заслуга других"} size={30} bg={C.tealLight} opacity={wk} />
      <Chip x={rx} y={760} text={p.mirror ?? "неудача → своя ответственность"} size={30} bg={C.coralLight} opacity={mk} />
      <SceneTitle x={ar.cx} y={170} text="Окно и зеркало" size={50} opacity={ramp(t, 0.1, 0.5)} />
    </Drift>
  );
};

// ── эстафета: преемник получает работающую компанию или проваливается ──
type RelayP = { host?: string; good?: string; bad?: string };
export const Relay: React.FC<VisualProps<RelayP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const run = (y: number, good: boolean, a: number) => {
    const k = ramp(t, a, 2.2);
    const x1 = ar.x0 + 140 + k * 260;
    const x2 = ar.x0 + 520 + k * (good ? 520 : 140);
    return (
      <g opacity={ramp(t, a - 0.3, 0.4)}>
        <line x1={ar.x0 + 60} y1={y + 6} x2={ar.x1 - 60} y2={y + 6} stroke={C.steel} strokeWidth={5} strokeDasharray="18 12" />
        <Person who="boss" x={x1} y={y} s={0.5} pose="give" mood={good ? "kind" : "tense"} t={t} />
        <Person who={good ? "anna" : "timur"} x={x2} y={y} s={0.5} pose={good ? "walk" : "shrug"} mood={good ? "smile" : "doubt"} t={t} />
        <circle cx={x1 + 60} cy={y - 190} r={18} fill={good ? C.yellow : C.red} stroke={OL} strokeWidth={4} opacity={good ? 1 : 1 - ramp(t, a + 1.6, 0.5)} />
        {good ? <Check x={ar.x1 - 120} y={y - 150} s={60} k={ramp(t, a + 2, 0.5)} /> : <Cross x={ar.x1 - 120} y={y - 150} s={90} k={ramp(t, a + 2, 0.5)} />}
        <Chip x={ar.cx + 120} y={y - 300} text={good ? p.good ?? "растит сильного преемника" : p.bad ?? "«после меня — хоть потоп»"} size={28} bg={good ? C.tealLight : C.coralLight} />
      </g>
    );
  };
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      {run(460, true, at(ctx, 0.1))}
      {run(820, false, at(ctx, 1))}
    </Drift>
  );
};

// ── автобус «сначала кто»: команда садится, потом выбирается маршрут ──
type BusP = { host?: string; routeAt?: number; turnAt?: number };
export const Bus: React.FC<VisualProps<BusP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const seatK = ramp(t, at(ctx, 0.2), 2);
  const routeK = ramp(t, at(ctx, p.routeAt ?? 1.2), 1);
  const turn = p.turnAt !== undefined ? ramp(t, at(ctx, p.turnAt), 0.8) : 0;
  const bx = cx - 200 + routeK * 160;
  const people: Who[] = ["anna", "timur", "expert", "friend", "guest", "student"];
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.02}>
      {/* развилка маршрутов */}
      <path d={`M ${cx - 520} 700 L ${cx + 120} 700 Q ${cx + 300} 700 ${cx + 520} 520`} fill="none" stroke={C.steel} strokeWidth={30} strokeLinecap="round" opacity={0.5 + 0.5 * (1 - turn)} />
      <path d={`M ${cx + 120} 700 Q ${cx + 300} 700 ${cx + 520} 800`} fill="none" stroke={turn > 0 ? C.teal : C.steel} strokeWidth={30} strokeLinecap="round" opacity={0.35 + 0.65 * turn} />
      <Chip x={cx + 520} y={460} text="курс А" size={26} bg={C.white} opacity={routeK} />
      <Chip x={cx + 470} y={850} text="курс Б" size={26} bg={turn > 0 ? C.tealLight : C.white} opacity={routeK} />
      <g transform={`translate(${bx} ${560})`}>
        <rect x={-260} y={-150} width={520} height={210} rx={40} fill={C.yellow} stroke={OL} strokeWidth={7} />
        {people.map((w, i) => {
          const k = clamp01(seatK * 6 - i);
          return (
            <g key={i}>
              <rect x={-230 + i * 78} y={-125} width={62} height={80} rx={12} fill="#cfefff" stroke={OL} strokeWidth={4} />
              {k > 0 && <circle cx={-199 + i * 78} cy={-80 + (1 - k) * 30} r={20} fill={[C.teal, C.coral, C.indigo, C.gold, C.green, C.coralDeep][i]} stroke={OL} strokeWidth={3} opacity={k} />}
              {k > 0 && <title>{w}</title>}
            </g>
          );
        })}
        <circle cx={-170} cy={70} r={42} fill={OL} />
        <circle cx={170} cy={70} r={42} fill={OL} />
        <circle cx={-170} cy={70} r={16} fill={C.steelLight} />
        <circle cx={170} cy={70} r={16} fill={C.steelLight} />
      </g>
      <Chip x={cx - 200} y={270} text="сначала — кто в автобусе" size={32} bg={C.tealLight} opacity={ramp(t, at(ctx, 0), 0.5)} />
      <Chip x={cx + 260} y={340} text="затем — куда ехать" size={32} bg={C.white} opacity={routeK} />
    </Drift>
  );
};

// ── «гений с 1000 помощников» против команды ──
export const Genius: React.FC<VisualProps<{ host?: string; left?: string; right?: string; goneAt?: number }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const lx = ar.cx - 330;
  const rx = ar.cx + 330;
  const gone = p.goneAt !== undefined ? ramp(t, at(ctx, p.goneAt), 0.8) : 0;
  const helpers = Array.from({ length: 36 }, (_, i) => ({ x: lx + ((i % 9) - 4) * 52, y: 560 + Math.floor(i / 9) * 46 }));
  const team = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    return { x: rx + Math.cos(a) * 170, y: 470 + Math.sin(a) * 170 };
  });
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      <g opacity={ramp(t, at(ctx, 0), 0.5)}>
        <g opacity={1 - gone} transform={`translate(0 ${-gone * 80})`}>
          <circle cx={lx} cy={410} r={95} fill={C.coral} stroke={OL} strokeWidth={6} />
          <circle cx={lx} cy={290} r={55} fill={C.coral} stroke={OL} strokeWidth={6} />
          <path d={`M ${lx - 40} 245 L ${lx - 20} 215 L ${lx} 240 L ${lx + 20} 213 L ${lx + 40} 245`} fill={C.yellow} stroke={OL} strokeWidth={4} />
        </g>
        {helpers.map((h, i) => (
          <circle key={i} cx={h.x + (gone ? Math.sin(t * 4 + i) * 10 * gone : 0)} cy={h.y} r={17} fill={C.steelLight} stroke={OL} strokeWidth={3} />
        ))}
        <Chip x={lx} y={790} text={p.left ?? "гений с 1000 помощников"} size={28} bg={C.coralLight} />
      </g>
      <g opacity={ramp(t, at(ctx, 1), 0.5)}>
        {team.map((m, i) => (
          <line key={`l${i}`} x1={m.x} y1={m.y} x2={team[(i + 2) % 7].x} y2={team[(i + 2) % 7].y} stroke={C.tealDeep} strokeWidth={4} opacity={0.5} />
        ))}
        {team.map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r={44} fill={[C.teal, C.yellow, C.indigoLight, C.tealLight][i % 4]} stroke={OL} strokeWidth={5} />
        ))}
        <Chip x={rx} y={790} text={p.right ?? "сильная команда"} size={28} bg={C.tealLight} />
      </g>
    </Drift>
  );
};

// ── четыре механизма «климата правды» ──
type ToolsP = { host?: string; items: string[]; title?: string; focus?: number };
export const FourTools: React.FC<VisualProps<ToolsP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const icons = ["?", "⇄", "✎", "⚑"];
  const w = Math.min(380, (ar.x1 - ar.x0 - 100) / 2 - 20);
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      {p.title && (
        <Appear t={t} at={0} x={ar.cx} y={170}>
          <SceneTitle x={0} y={0} text={p.title} size={44} />
        </Appear>
      )}
      {p.items.map((s, i) => {
        const x = ar.cx + (i % 2 ? 1 : -1) * (w / 2 + 25);
        const y = 420 + Math.floor(i / 2) * 290;
        const k = ramp(t, at(ctx, 0.2 + i * 0.8), 0.5);
        const f = p.focus === undefined || p.focus === i ? 1 : 0.4;
        return (
          <g key={i} transform={`translate(${x} ${y + (1 - k) * 30})`} opacity={k * f}>
            <rect x={-w / 2} y={-115} width={w} height={230} rx={30} fill={C.white} stroke={OL} strokeWidth={5} />
            <circle cx={0} cy={-50} r={44} fill={[C.yellow, C.tealLight, C.coralLight, C.red][i]} stroke={OL} strokeWidth={4} />
            <text x={0} y={-34} fontFamily={DISPLAY} fontWeight={800} fontSize={46} fill={i === 3 ? "#fff" : C.ink} textAnchor="middle">
              {icons[i]}
            </text>
            <Lines x={0} y={50} text={s} n={Math.round(w / 17)} size={30} />
          </g>
        );
      })}
    </Drift>
  );
};

// ── парадокс Стокдейла: две половины видны одновременно ──
export const Stockdale: React.FC<VisualProps<{ host?: string; left?: string; right?: string; joinAt?: number; mode?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const cx = ar.cx;
  const lk = ramp(t, at(ctx, 0.1), 0.6);
  const rk = ramp(t, at(ctx, 0.6), 0.6);
  const jk = ramp(t, at(ctx, p.joinAt ?? 1.2), 0.7);
  const gap = 40 * (1 - jk);
  const w = Math.min(560, (ar.x1 - ar.x0 - 120) / 2);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.02}>
      <g opacity={lk} transform={`translate(${cx - w / 2 - 20 - gap} 520)`}>
        <rect x={-w / 2} y={-220} width={w} height={440} rx={34} fill={C.yellow} stroke={OL} strokeWidth={6} />
        <circle cx={0} cy={-110} r={56} fill="#fff7c9" stroke={OL} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + t * 0.4;
          return <line key={i} x1={Math.cos(a) * 70} y1={-110 + Math.sin(a) * 70} x2={Math.cos(a) * 92} y2={-110 + Math.sin(a) * 92} stroke={OL} strokeWidth={5} strokeLinecap="round" />;
        })}
        <Lines x={0} y={70} text={p.left ?? "вера, что в конце вы победите"} n={Math.round(w / 23)} size={36} />
      </g>
      <g opacity={rk} transform={`translate(${cx + w / 2 + 20 + gap} 520)`}>
        <rect x={-w / 2} y={-220} width={w} height={440} rx={34} fill={C.steelLight} stroke={OL} strokeWidth={6} />
        <circle cx={-12} cy={-118} r={46} fill="none" stroke={OL} strokeWidth={10} />
        <line x1={20} y1={-86} x2={60} y2={-46} stroke={OL} strokeWidth={14} strokeLinecap="round" />
        <Lines x={0} y={70} text={p.right ?? "трезвый взгляд на самые суровые факты"} n={Math.round(w / 23)} size={36} />
      </g>
      <g opacity={jk}>
        <circle cx={cx} cy={520} r={62} fill={C.white} stroke={OL} strokeWidth={6} />
        <text x={cx} y={540} fontFamily={DISPLAY} fontWeight={800} fontSize={56} fill={C.ink} textAnchor="middle">
          И
        </text>
        <Chip x={cx} y={800} text="одновременно — не по очереди" size={32} bg={C.white} />
      </g>
    </Drift>
  );
};

// ── границы выводов: что исследование может и чего не может ──
type LimitsP = { host?: string; can: string[]; cannot: string[]; title?: string };
export const Limits: React.FC<VisualProps<LimitsP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const items = [...p.can.map((s) => ({ s, ok: true })), ...p.cannot.map((s) => ({ s, ok: false }))];
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      {p.title && (
        <Appear t={t} at={0} x={ar.cx} y={170}>
          <SceneTitle x={0} y={0} text={p.title} size={44} />
        </Appear>
      )}
      {items.map((it, i) => {
        const y = 290 + i * 104;
        const k = ramp(t, at(ctx, 0.2 + i * 0.5), 0.5);
        const w = Math.min(1100, ar.x1 - ar.x0 - 80);
        return (
          <g key={i} opacity={k} transform={`translate(${ar.cx - w / 2} ${y})`}>
            <rect x={0} y={-40} width={w} height={84} rx={24} fill={it.ok ? C.tealLight : C.coralLight} stroke={OL} strokeWidth={4} />
            {it.ok ? <Check x={48} y={2} s={30} k={k} /> : <Cross x={48} y={2} s={40} k={k} />}
            <text x={96} y={12} fontFamily={FONT} fontWeight={900} fontSize={Math.min(31, (w - 130) / (it.s.length * 0.56))} fill={C.ink}>
              {it.s}
            </text>
          </g>
        );
      })}
    </Drift>
  );
};

// ── цитаты из книги стопкой (таблица 8.1 и др.), с ярлыком источника ──
type QuotesP = { host?: string; quotes: { text: string; who: string; at?: number }[]; src?: SrcKind; title?: string };
export const QuoteStack: React.FC<VisualProps<QuotesP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const w = Math.min(1100, ar.x1 - ar.x0 - 80);
  let cur = 0;
  p.quotes.forEach((q, i) => {
    if (t >= at(ctx, q.at ?? i)) cur = i;
  });
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      {p.title && (
        <Appear t={t} at={0} x={ar.cx} y={170}>
          <SceneTitle x={0} y={0} text={p.title} size={44} />
        </Appear>
      )}
      {p.quotes.map((q, i) => {
        const a = at(ctx, q.at ?? i);
        const k = ramp(t, a, 0.5);
        if (k <= 0) return null;
        const depth = cur - i;
        const y = 540 - depth * 40;
        const s = 1 - depth * 0.06;
        return (
          <g key={i} transform={`translate(${ar.cx} ${y + (1 - k) * 40}) scale(${s}) rotate(${(i % 2 ? 1 : -1) * 1.5})`} opacity={depth > 2 ? 0 : k * (depth > 0 ? 0.55 : 1)}>
            <rect x={-w / 2 + 8} y={-170 + 10} width={w} height={340} rx={30} fill="#000" opacity={0.1} />
            <rect x={-w / 2} y={-170} width={w} height={340} rx={30} fill={C.paper} stroke={OL} strokeWidth={5} />
            <text x={-w / 2 + 40} y={-80} fontFamily={DISPLAY} fontWeight={800} fontSize={120} fill={C.coral} opacity={0.6}>
              «
            </text>
            <Lines x={0} y={-10} text={q.text} n={Math.round(w / 25)} size={38} />
            <text x={w / 2 - 40} y={135} fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.inkSoft} textAnchor="end">
              {`— ${q.who}`}
            </text>
          </g>
        );
      })}
      {p.src && <SourceChip kind={p.src} x={ar.cx} y={830} opacity={ramp(t, 0.3, 0.5)} />}
    </Drift>
  );
};

// ── финальные вопросы: три узла, каждый со своим вопросом ──
type QsP = { host?: string; items: { node: keyof typeof NODES; text: string; at?: number }[] };
export const ThreeQuestions: React.FC<VisualProps<QsP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.02}>
      {p.items.map((it, i) => {
        const k = ramp(t, at(ctx, it.at ?? i), 0.5);
        const y = 300 + i * 200;
        const nd = NODES[it.node];
        const w = Math.min(1150, ar.x1 - ar.x0 - 60);
        return (
          <g key={i} opacity={k} transform={`translate(${ar.cx - w / 2 + (1 - k) * 40} ${y})`}>
            <rect x={0} y={-70} width={w} height={140} rx={34} fill={C.white} stroke={OL} strokeWidth={5} />
            <circle cx={70} cy={0} r={46} fill={nd.color} stroke={OL} strokeWidth={4} />
            <text x={70} y={16} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={C.ink} textAnchor="middle">
              {String(i + 1)}
            </text>
            <Lines x={140} y={10} text={it.text} n={Math.round((w - 180) / 18)} size={34} anchor="start" />
          </g>
        );
      })}
    </Drift>
  );
};

// ── финал: логотип из точек ──
export const Outro: React.FC<VisualProps<{ host?: string; line?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const ar = area(p.host);
  const pts = dotsOf("outro-ring", SH.ring(150, 200), ar.cx, 430, [C.teal, C.coral, C.yellow], 12, 220);
  const k = clamp01((t - 0.2) / 2);
  return (
    <Drift t={t} dur={dur} cx={ar.cx} amount={0.03}>
      <g transform={`rotate(${t * 20} ${ar.cx} 430)`}>
        <Swarm pts={pts} k={k} t={t} r={6} />
      </g>
      <text x={ar.cx} y={455} fontFamily={DISPLAY} fontWeight={800} fontSize={64} textAnchor="middle" opacity={ramp(t, 1.2, 0.6)}>
        <tspan fill={C.ink}>Bana</tspan>
        <tspan fill="#e09a00">Mind</tspan>
      </text>
      {p.line && (
        <Appear t={t} at={at(ctx, 0.4)} x={ar.cx} y={760}>
          <SceneTitle x={0} y={0} text={p.line} size={46} />
        </Appear>
      )}
    </Drift>
  );
};
