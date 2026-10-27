// Общие детали фильма BM-034: реплика-«пузырь», три состояния Я одного человека,
// стрелка-трансакция между состояниями двух людей и «монтажный стол» с тремя
// дорожками (видимые реплики · интерпретация Берна · итог). Чистый вектор,
// позиции детерминированы — без мерцания.
import React from "react";
import { C, DISPLAY, EGO, EGOS, FONT, type EgoId } from "../theme";
import { OL } from "./draw";
import { clamp01, ease, pop, ramp } from "./kit";

// ширина строки текста (оценка для Rubik/Nunito 800–900)
export const textW = (s: string, size: number) => [...s].length * size * 0.56;

export type Tone = "said" | "hot" | "soft" | "hidden" | "fresh";
const TONE: Record<Tone, { bg: string; fg: string; edge: string; dash?: string }> = {
  said: { bg: "#ffffff", fg: C.ink, edge: OL },
  hot: { bg: "#ffe1d8", fg: "#8a2a1a", edge: OL },
  soft: { bg: "#eef6ff", fg: C.ink, edge: OL },
  hidden: { bg: "#efe9ff", fg: "#4a3a8a", edge: "#7a66d6", dash: "14 10" },
  fresh: { bg: "#e3fbef", fg: "#14603a", edge: OL },
};

// Реплика-пузырь. (x, y) — центр; tail — куда смотрит хвостик.
export const Bubble: React.FC<{ x: number; y: number; text: string; k: number; tone?: Tone; tail?: "l" | "r" | "b" | "none"; size?: number; maxW?: number }> = ({ x, y, text, k, tone = "said", tail = "b", size = 38, maxW = 760 }) => {
  if (k <= 0.001) return null;
  const rows = text.split("\n");
  const longest = Math.max(...rows.map((r) => textW(r, size)));
  const fs = longest + 60 > maxW ? (size * (maxW - 60)) / longest : size;
  const w = Math.max(...rows.map((r) => textW(r, fs))) + 60;
  const h = rows.length * fs * 1.2 + 34;
  const st = TONE[tone];
  const sc = 0.7 + 0.3 * k;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={clamp01(k * 1.6)}>
      <rect x={-w / 2 + 5} y={-h / 2 + 8} width={w} height={h} rx={26} fill="#000" opacity={0.15} />
      {tail === "b" && <path d={`M -18 ${h / 2 - 4} L 0 ${h / 2 + 30} L 22 ${h / 2 - 4} Z`} fill={st.bg} stroke={st.edge} strokeWidth={4} strokeLinejoin="round" />}
      {tail === "l" && <path d={`M ${-w / 2 + 6} ${-10} L ${-w / 2 - 30} ${16} L ${-w / 2 + 6} ${22} Z`} fill={st.bg} stroke={st.edge} strokeWidth={4} strokeLinejoin="round" />}
      {tail === "r" && <path d={`M ${w / 2 - 6} ${-10} L ${w / 2 + 30} ${16} L ${w / 2 - 6} ${22} Z`} fill={st.bg} stroke={st.edge} strokeWidth={4} strokeLinejoin="round" />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill={st.bg} stroke={st.edge} strokeWidth={4} strokeDasharray={st.dash} />
      <text x={0} y={-((rows.length - 1) * fs * 1.2) / 2 + fs * 0.36} fontFamily={FONT} fontWeight={900} fontSize={fs} fill={st.fg} textAnchor="middle">
        {rows.map((r, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : fs * 1.2}>
            {r}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// Положение кружка состояния в стопке (центр стопки x, y; масштаб s).
export const egoPos = (x: number, y: number, s: number, e: EgoId) => ({ x, y: y + (EGOS.indexOf(e) - 1) * 150 * s, r: 60 * s });

// Три состояния Я одного человека: Р / В / Ре — равные круги разных цветов.
export const EgoStack: React.FC<{ x: number; y: number; s?: number; k?: number; hi?: EgoId[]; names?: boolean; label?: string; t?: number; side?: "l" | "r" }> = ({ x, y, s = 1, k = 1, hi, names = false, label, t = 0, side = "l" }) => {
  if (k <= 0.001) return null;
  return (
    <g opacity={clamp01(k * 1.4)}>
      <rect x={x - 92 * s} y={y - 240 * s} width={184 * s} height={480 * s} rx={92 * s} fill="#ffffff" fillOpacity={0.16} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={3} />
      {EGOS.map((e, i) => {
        const p = egoPos(x, y, s, e);
        const on = !hi || hi.includes(e);
        const kk = ease(clamp01(k * 3 - i * 0.6));
        const breathe = on && hi ? 1 + 0.04 * Math.sin(t * 3 + i) : 1;
        return (
          <g key={e} transform={`translate(${p.x} ${p.y}) scale(${kk * breathe})`} opacity={on ? 1 : 0.35}>
            <circle r={p.r} fill={EGO[e].color} stroke={OL} strokeWidth={5} />
            <circle r={p.r * 0.72} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={3} />
            <text y={p.r * 0.3} fontFamily={DISPLAY} fontWeight={800} fontSize={p.r * 0.86} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={4} paintOrder="stroke">
              {EGO[e].short}
            </text>
            {names && (
              <text x={(side === "l" ? -1 : 1) * (p.r + 22)} y={12} fontFamily={FONT} fontWeight={900} fontSize={36 * Math.max(0.8, s)} fill="#fff" textAnchor={side === "l" ? "end" : "start"} stroke={OL} strokeWidth={6} paintOrder="stroke">
                {EGO[e].name}
              </text>
            )}
          </g>
        );
      })}
      {label && (
        <text x={x} y={y + 290 * s} fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={7} paintOrder="stroke">
          {label}
        </text>
      )}
    </g>
  );
};

// Стрелка-трансакция между двумя стопками. lane: said — сплошная белая,
// hidden — пунктир (интерпретация Берна), outcome — коралловая.
export const LANE_COLOR = { said: "#ffffff", hidden: C.hidden, outcome: C.outcome } as const;
export type LaneColor = keyof typeof LANE_COLOR;
export const TransArrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; color?: LaneColor; w?: number; label?: string; labelY?: number; opacity?: number }> = ({ x1, y1, x2, y2, k, color = "said", w = 12, label, labelY, opacity = 1 }) => {
  if (k <= 0.001) return null;
  const col = LANE_COLOR[color];
  const len = Math.hypot(x2 - x1, y2 - y1);
  const kk = clamp01(k);
  const ex = x1 + (x2 - x1) * kk;
  const ey = y1 + (y2 - y1) * kk;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hs = w * 2.8;
  const dash = color === "hidden" ? "26 16" : undefined;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={OL} strokeWidth={w + 8} strokeLinecap="round" strokeDasharray={dash} />
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={col} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
      {kk > 0.9 && (
        <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(ang - 0.42)} ${y2 - hs * Math.sin(ang - 0.42)} L ${x2 - hs * Math.cos(ang + 0.42)} ${y2 - hs * Math.sin(ang + 0.42)} Z`} fill={col} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      )}
      {label && kk > 0.6 && (
        <g opacity={clamp01((kk - 0.6) * 3)}>
          <rect x={(x1 + x2) / 2 - textW(label, 32) / 2 - 18} y={(labelY ?? (y1 + y2) / 2 - 34) - 30} width={textW(label, 32) + 36} height={48} rx={22} fill={color === "hidden" ? "#efe9ff" : "#ffffff"} stroke={OL} strokeWidth={3} />
          <text x={(x1 + x2) / 2} y={(labelY ?? (y1 + y2) / 2 - 34) + 6} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink} textAnchor="middle">
            {label}
          </text>
        </g>
      )}
      {len < 0 && null}
    </g>
  );
};

// Подпись-плашка (крупная, читается на телефоне)
export const Plate: React.FC<{ x: number; y: number; text: string; k: number; bg?: string; fg?: string; size?: number; dash?: boolean; edge?: string }> = ({ x, y, text, k, bg = C.yellow, fg = C.ink, size = 36, dash = false, edge = OL }) => {
  if (k <= 0.001) return null;
  const rows = text.split("\n");
  const w = Math.max(...rows.map((r) => textW(r, size))) + 52;
  const h = rows.length * size * 1.2 + 26;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 24})`} opacity={clamp01(k * 1.5)}>
      <rect x={-w / 2 + 4} y={-h / 2 + 7} width={w} height={h} rx={Math.min(h / 2.4, 30)} fill="#000" opacity={0.16} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={Math.min(h / 2.4, 30)} fill={bg} stroke={edge} strokeWidth={4} strokeDasharray={dash ? "14 10" : undefined} />
      <text x={0} y={-((rows.length - 1) * size * 1.2) / 2 + size * 0.36} fontFamily={FONT} fontWeight={900} fontSize={size} fill={fg} textAnchor="middle">
        {rows.map((r, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : size * 1.2}>
            {r}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// текст фишки: одна строка, а если не помещается крупно — две (по пробелу ближе к середине)
const chipRows = (text: string, w: number) => {
  const one = Math.min(34, (w - 26) / Math.max(1, [...text].length * 0.56));
  if (one >= 30 || !text.includes(" ")) return { lines: [text], size: one };
  const sp = [...text.matchAll(/ /g)].map((m) => m.index ?? 0);
  const cut = sp.reduce((b, i) => (Math.abs(i - text.length / 2) < Math.abs(b - text.length / 2) ? i : b), sp[0]);
  const lines = [text.slice(0, cut), text.slice(cut + 1)];
  const size = Math.min(34, (w - 26) / (Math.max(...lines.map((l) => [...l].length)) * 0.56));
  return { lines, size };
};

// ── Монтажный стол ──
// x0…x1 — ширина стола; верхняя дорожка «сказано вслух», нижняя «интерпретация
// Берна» (пунктир), справа окно «итог». Бегунок проходит по дорожкам.
export type Chip = { text: string; at: number; fresh?: boolean };
export const MontageDesk: React.FC<{
  t: number;
  x0: number;
  x1: number;
  y: number;
  k: number;
  said: (Chip & { atS: number })[];
  hidden: (Chip & { atS: number })[];
  outcome?: { text: string; atS: number; fresh?: boolean };
  oldOutcome?: string;
  play?: number; // 0…1 положение бегунка
  notes?: { lane: "said" | "hidden"; text: string; atS: number }[];
}> = ({ t, x0, x1, y, k, said, hidden, outcome, oldOutcome, play, notes = [] }) => {
  if (k <= 0.001) return null;
  const W = x1 - x0;
  const outW = Math.min(360, W * 0.27);
  const laneX0 = x0 + 40;
  const laneX1 = x1 - outW - 40;
  const laneW = laneX1 - laneX0;
  const ySaid = y - 90;
  const yHid = y + 110;
  const lift = (1 - ease(clamp01(k))) * 60;
  const chipW = (n: number) => Math.min(380, (laneW - 20) / Math.max(1, n) - 14);
  const place = (list: { atS: number }[], i: number) => laneX0 + 10 + (laneW - 20) * ((i + 0.5) / Math.max(1, list.length));
  return (
    <g transform={`translate(0 ${lift})`} opacity={clamp01(k * 1.4)}>
      {/* корпус стола */}
      <rect x={x0 + 8} y={y - 230 + 12} width={W} height={470} rx={40} fill="#000" opacity={0.2} />
      <rect x={x0} y={y - 230} width={W} height={470} rx={40} fill={C.film} stroke={OL} strokeWidth={6} />
      {/* дорожка «сказано вслух» */}
      <text x={laneX0} y={ySaid - 78} fontFamily={FONT} fontWeight={900} fontSize={30} fill="#ffffff">
        сказано вслух
      </text>
      <rect x={laneX0} y={ySaid - 58} width={laneW} height={116} rx={20} fill="#ffffff" fillOpacity={0.1} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={3} />
      {/* дорожка интерпретации */}
      <text x={laneX0} y={yHid - 78} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.hidden}>
        интерпретация Берна
      </text>
      <rect x={laneX0} y={yHid - 58} width={laneW} height={116} rx={20} fill={C.hidden} fillOpacity={0.12} stroke={C.hidden} strokeWidth={3} strokeDasharray="16 12" />
      {/* окно итога */}
      <text x={x1 - outW / 2 - 24} y={ySaid - 78} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.outcome} textAnchor="middle">
        итог
      </text>
      <rect x={x1 - outW - 24} y={ySaid - 58} width={outW} height={yHid + 58 - (ySaid - 58)} rx={26} fill={C.outcome} fillOpacity={0.14} stroke={C.outcome} strokeWidth={4} />
      {/* реплики */}
      {said.map((c, i) => {
        const kk = pop(t, c.atS);
        if (kk <= 0.01) return null;
        const cx = place(said, i);
        const w = chipW(said.length);
        const rows = chipRows(c.text, w);
        return (
          <g key={`s${i}`} transform={`translate(${cx} ${ySaid}) scale(${0.6 + 0.4 * Math.min(1, kk)})`} opacity={clamp01(kk * 1.6)}>
            <rect x={-w / 2} y={-50} width={w} height={100} rx={18} fill={c.fresh ? "#e3fbef" : "#ffffff"} stroke={OL} strokeWidth={4} />
            <text y={rows.lines.length > 1 ? -6 : 12} fontFamily={FONT} fontWeight={900} fontSize={rows.size} fill={c.fresh ? "#14603a" : C.ink} textAnchor="middle">
              {rows.lines.map((l, j) => (
                <tspan key={j} x={0} dy={j === 0 ? 0 : rows.size * 1.1}>
                  {l}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
      {hidden.map((c, i) => {
        const kk = ramp(t, c.atS, 0.7);
        if (kk <= 0.01) return null;
        const cx = place(hidden, i);
        const w = Math.min(laneW - 30, chipW(hidden.length) * (hidden.length === 1 ? 2.4 : 1));
        return (
          <g key={`h${i}`} transform={`translate(${cx} ${yHid + (1 - kk) * 20})`} opacity={kk}>
            <rect x={-w / 2} y={-40} width={w} height={80} rx={18} fill="#efe9ff" stroke="#7a66d6" strokeWidth={4} strokeDasharray="14 10" />
            <text y={12} fontFamily={FONT} fontWeight={900} fontSize={Math.min(32, (w - 30) / Math.max(1, [...c.text].length * 0.55))} fill="#4a3a8a" textAnchor="middle">
              {c.text}
            </text>
          </g>
        );
      })}
      {/* итог */}
      {oldOutcome && outcome && (
        <g opacity={1 - ramp(t, outcome.atS - 0.4, 0.5)}>
          <text x={x1 - outW / 2 - 24} y={y + 20} fontFamily={DISPLAY} fontWeight={800} fontSize={42} fill="#ffffff" textAnchor="middle">
            {oldOutcome}
          </text>
        </g>
      )}
      {outcome && (() => {
        const kk = pop(t, outcome.atS);
        if (kk <= 0.01) return null;
        const rows = outcome.text.split(" ");
        const lines: string[] = [];
        for (const w of rows) {
          const last = lines[lines.length - 1];
          if (last && textW(`${last} ${w}`, 42) < outW - 40) lines[lines.length - 1] = `${last} ${w}`;
          else lines.push(w);
        }
        return (
          <g transform={`translate(${x1 - outW / 2 - 24} ${y + 10}) scale(${Math.min(1.08, kk)})`}>
            <circle r={outW * 0.42} fill={outcome.fresh ? C.green : C.outcome} opacity={0.25 + 0.1 * Math.sin(t * 3)} />
            <text y={-((lines.length - 1) * 50) / 2 + 14} fontFamily={DISPLAY} fontWeight={800} fontSize={42} fill="#ffffff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
              {lines.map((l, i) => (
                <tspan key={i} x={0} dy={i === 0 ? 0 : 50}>
                  {l}
                </tspan>
              ))}
            </text>
          </g>
        );
      })()}
      {/* пометки на дорожках */}
      {notes.map((n, i) => {
        const kk = ramp(t, n.atS, 0.5);
        if (kk <= 0.01) return null;
        const ny = n.lane === "said" ? ySaid - 78 : yHid - 78;
        return (
          <g key={`n${i}`} opacity={kk}>
            <rect x={laneX1 - textW(n.text, 26) - 40} y={ny - 30} width={textW(n.text, 26) + 32} height={42} rx={20} fill={n.lane === "said" ? C.yellow : C.hidden} stroke={OL} strokeWidth={3} />
            <text x={laneX1 - 24} y={ny} fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink} textAnchor="end">
              {n.text}
            </text>
          </g>
        );
      })}
      {/* бегунок */}
      {play !== undefined && (
        <g transform={`translate(${laneX0 + laneW * clamp01(play)} 0)`}>
          <line x1={0} y1={ySaid - 66} x2={0} y2={yHid + 66} stroke={C.yellow} strokeWidth={5} />
          <path d={`M -14 ${ySaid - 80} L 14 ${ySaid - 80} L 0 ${ySaid - 62} Z`} fill={C.yellow} stroke={OL} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

// маленький значок-«глаз» (наблюдение) и «облачко» (догадка)
export const EyeIcon: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -60 0 Q 0 -50 60 0 Q 0 50 -60 0 Z" fill="#fff" stroke={OL} strokeWidth={5} />
    <circle r={20} fill={EGO.A.color} stroke={OL} strokeWidth={4} />
    <circle r={8} fill={OL} />
  </g>
);
export const CloudIcon: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -60 20 Q -76 -14 -40 -22 Q -34 -56 0 -48 Q 30 -66 46 -34 Q 80 -30 64 10 Q 70 34 40 32 L -44 32 Q -70 34 -60 20 Z" fill="#efe9ff" stroke="#7a66d6" strokeWidth={5} strokeDasharray="12 8" />
    <text y={16} fontFamily={DISPLAY} fontWeight={800} fontSize={48} fill="#4a3a8a" textAnchor="middle">
      ?
    </text>
  </g>
);
