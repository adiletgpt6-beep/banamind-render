// Общие детали фильма BM-038: реплика-«пузырь», крупная плашка-подпись и значки.
// Чистый вектор, позиции детерминированы — без мерцания.
import React from "react";
import { C, DISPLAY, FONT } from "../theme";
import { OL } from "./draw";
import { clamp01 } from "./kit";

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

export const EyeIcon: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -60 0 Q 0 -50 60 0 Q 0 50 -60 0 Z" fill="#fff" stroke={OL} strokeWidth={5} />
    <circle r={20} fill={C.teal} stroke={OL} strokeWidth={4} />
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
