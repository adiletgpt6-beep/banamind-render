// Главный образ фильма: «собственный голос» Джейн — золотой огонёк из чётких
// точек, и путь решения — золотые точки, которые ложатся одна за другой.
// Это метафора фильма, а не предмет романа. Точки крупные, без размытия;
// положение каждой зависит только от номера и времени (без мерцания).
import React from "react";
import { C, FONT, HEAVY } from "../theme";
import { OL } from "./draw";
import { clamp01, ease } from "./kit";
import { rnd } from "./particles";

// Огонёк голоса: кольца точек вокруг яркого ядра; size 0…1 — сила голоса.
export const VoiceFlame: React.FC<{ x: number; y: number; t: number; size?: number; s?: number; dim?: number }> = ({ x, y, t, size = 1, s = 1, dim = 0 }) => {
  const rings = [
    { n: 8, r: 34 },
    { n: 14, r: 62 },
    { n: 20, r: 92 },
  ];
  const col = dim > 0.5 ? "#c9b48a" : C.gold;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.45 + 0.55 * clamp01(size))})`}>
      <circle r={120} fill={C.yellow} opacity={0.16 * (1 - dim)} />
      {rings.map((rg, ri) =>
        Array.from({ length: rg.n }).map((_, i) => {
          const a = (i / rg.n) * Math.PI * 2 + t * (0.25 + ri * 0.12) * (ri % 2 ? -1 : 1);
          const wob = 1 + Math.sin(t * 2.2 + i + ri) * 0.06;
          const rr = rg.r * wob * (ri < 2 ? 1 : 0.6 + 0.4 * clamp01(size));
          return <circle key={`${ri}-${i}`} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr * 1.12 - ri * 6} r={10 - ri * 2} fill={ri === 0 ? C.yellow : col} stroke={OL} strokeWidth={1.5} strokeOpacity={0.4} />;
        }),
      )}
      <path d="M 0 -46 Q 26 -6 0 28 Q -26 -6 0 -46 Z" fill="#fff6c8" stroke={OL} strokeWidth={3} />
    </g>
  );
};

type Pt = [number, number];

// точка на ломаной по доле длины
const along = (pts: Pt[], f: number): Pt => {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(d);
    total += d;
  }
  let target = clamp01(f) * total;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i]) {
      const k = seg[i] ? target / seg[i] : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
    }
    target -= seg[i];
  }
  return pts[pts.length - 1];
};

// Путь решения: точки ложатся вдоль ломаной от 0 до k (0…1).
export const DotPath: React.FC<{ pts: Pt[]; k: number; n?: number; r?: number; color?: string; t?: number; from?: number }> = ({ pts, k, n = 40, r = 9, color = C.gold, t = 0, from = 0 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const f = i / (n - 1);
      if (f < from || f > k) return null;
      const [px, py] = along(pts, f);
      const lead = clamp01((k - f) * n * 0.5);
      const pulse = 1 + Math.sin(t * 3 - i * 0.5) * 0.08;
      return <circle key={i} cx={px} cy={py} r={r * (0.4 + 0.6 * lead) * pulse} fill={color} stroke={OL} strokeWidth={2} strokeOpacity={0.45} />;
    })}
  </g>
);

// Места пути Джейн на карте (координаты кадра 1920×1080).
export const STOPS = [
  { id: "gateshead", name: "Гейтсхед", x: 250, y: 300, color: C.red },
  { id: "lowood", name: "Ловуд", x: 560, y: 660, color: C.slate },
  { id: "thornfield", name: "Тернфилд", x: 930, y: 330, color: C.amber },
  { id: "moor", name: "Пустошь", x: 1240, y: 700, color: C.heather },
  { id: "rivers", name: "Мур-Хаус", x: 1480, y: 380, color: C.sage },
  { id: "ferndean", name: "Ферндин", x: 1720, y: 720, color: C.gold },
] as const;

// Карта пути: точки-маршрут доходят до остановки stop; на остановке — условие.
export const JourneyMap: React.FC<{ t: number; stop: number; at?: number; cond?: string; host?: unknown }> = ({ t, stop, at = 0.3, cond }) => {
  const pts = STOPS.map((s) => [s.x, s.y] as Pt);
  const prevK = Math.max(0, stop - 1) / (STOPS.length - 1);
  const k = prevK + (stop / (STOPS.length - 1) - prevK) * ease(clamp01((t - at) / 2.2));
  const cur = STOPS[stop];
  return (
    <g>
      {/* бумажная карта */}
      <rect x={110} y={150} width={1700} height={720} rx={40} fill={C.cream} stroke={OL} strokeWidth={5} />
      {Array.from({ length: 22 }).map((_, i) => (
        <path key={i} d={`M ${150 + ((i * 97) % 1600)} ${210 + ((i * 53) % 600)} q 20 -18 40 0 q 20 18 40 0`} stroke={C.steel} strokeWidth={3} fill="none" opacity={0.35} />
      ))}
      <path d={`M ${pts.map((p) => p.join(" ")).join(" L ")}`} stroke={C.steel} strokeWidth={4} strokeDasharray="4 16" strokeLinecap="round" fill="none" opacity={0.6} />
      <DotPath pts={pts} k={k} n={90} r={10} t={t} />
      {STOPS.map((s, i) => {
        const on = i <= stop;
        const here = i === stop;
        const pulse = here ? 1 + Math.sin(t * 3) * 0.08 : 1;
        return (
          <g key={s.id} transform={`translate(${s.x} ${s.y})`}>
            <circle r={here ? 46 * pulse : 34} fill={on ? s.color : C.paperDark} stroke={OL} strokeWidth={5} />
            <text y={here ? -70 : -56} fontFamily={HEAVY} fontWeight={800} fontSize={here ? 46 : 34} fill={on ? C.ink : C.steel} textAnchor="middle">
              {s.name}
            </text>
          </g>
        );
      })}
      {cond && (
        <g transform={`translate(${Math.min(1700 - cond.length * 13, Math.max(220 + cond.length * 13, cur.x))} ${cur.y + 120}) scale(${ease(clamp01((t - at - 1.6) / 0.6))})`}>
          <rect x={-cond.length * 13 - 40} y={-36} width={cond.length * 26 + 80} height={72} rx={36} fill={C.white} stroke={OL} strokeWidth={4} />
          <text y={13} fontFamily={FONT} fontWeight={800} fontSize={36} fill={C.ink} textAnchor="middle">
            {cond}
          </text>
        </g>
      )}
    </g>
  );
};

// Разлёт искр голоса (когда Джейн говорит вслух).
export const Sparks: React.FC<{ x: number; y: number; t: number; at: number; n?: number; color?: string; spread?: number }> = ({ x, y, t, at, n = 26, color = C.gold, spread = 260 }) => {
  const k = clamp01((t - at) / 1.2);
  if (k <= 0 || k >= 1) return null;
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }).map((_, i) => {
        const a = rnd(i, 11) * Math.PI * 2;
        const d = (0.4 + rnd(i, 12) * 0.6) * spread * ease(k);
        return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d * 0.8} r={9 * (1 - k) + 2} fill={color} stroke={OL} strokeWidth={1.5} strokeOpacity={0.4} />;
      })}
    </g>
  );
};
