// Рисунки фильма «Краткая история времени»: сцена схемы рядом с бананом, часы,
// фотон, зеркала, планета, звезда, галактика, телескоп, световой конус, сетка
// пространства-времени, спектр, чёрная дыра, космонавт, чашка, ракета.
// Всё — оригинальные простые векторные формы (не иллюстрации книги и не снимки
// телескопов); космические объекты — художественные схемы, подписи об этом — в сценах.
import React from "react";
import { C, FONT } from "../theme";
import { clamp01, wob } from "./kit";

// Где рисовать схему, чтобы не закрывать банана: смещение панели 1280 px по X.
export const panelX = (host: unknown) => {
  if (host === "left") return 600;
  if (host === "right" || host === "peek") return 40;
  return 320;
};

export const Stage: React.FC<{ host: unknown; children: React.ReactNode; y?: number }> = ({ host, children, y = 0 }) => (
  <g transform={`translate(${panelX(host)} ${y})`}>{children}</g>
);

let uid = 0;
// уникальные id градиентов в пределах кадра (компоненты рисуются заново каждый кадр)
export const useId = (name: string) => React.useMemo(() => `${name}-${uid++}`, [name]);

// ── часы со стрелкой: phase — оборотов секундной стрелки ──
export const Clock: React.FC<{ x: number; y: number; r?: number; phase: number; color?: string; label?: string; glow?: number }> = ({ x, y, r = 90, phase, color = C.sky, label, glow = 0 }) => {
  const a = phase * Math.PI * 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      {glow > 0 && <circle r={r * 1.35} fill={color} opacity={0.18 * glow} />}
      <circle r={r} fill={C.night} stroke={color} strokeWidth={r * 0.09} />
      {Array.from({ length: 12 }).map((_, i) => {
        const q = (i / 12) * Math.PI * 2;
        const l = i % 3 === 0 ? 0.2 : 0.11;
        return <line key={i} x1={Math.sin(q) * r * (0.86 - l)} y1={-Math.cos(q) * r * (0.86 - l)} x2={Math.sin(q) * r * 0.86} y2={-Math.cos(q) * r * 0.86} stroke={C.dim} strokeWidth={r * 0.035} strokeLinecap="round" />;
      })}
      <line x1={0} y1={0} x2={Math.sin(a / 60) * r * 0.45} y2={-Math.cos(a / 60) * r * 0.45} stroke={C.text} strokeWidth={r * 0.07} strokeLinecap="round" />
      <line x1={0} y1={r * 0.12} x2={Math.sin(a) * r * 0.74} y2={-Math.cos(a) * r * 0.74} stroke={color} strokeWidth={r * 0.04} strokeLinecap="round" />
      <circle r={r * 0.07} fill={color} />
      {label && (
        <text y={r + 48} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={Math.max(26, r * 0.32)} fill={C.text}>
          {label}
        </text>
      )}
    </g>
  );
};

// ── фотон: светящаяся точка с хвостом ──
export const Photon: React.FC<{ x: number; y: number; r?: number; color?: string; tail?: [number, number] }> = ({ x, y, r = 12, color = C.yellow, tail }) => (
  <g>
    {tail && <line x1={x} y1={y} x2={x - tail[0]} y2={y - tail[1]} stroke={color} strokeWidth={r * 0.8} strokeLinecap="round" opacity={0.35} />}
    <circle cx={x} cy={y} r={r * 2.2} fill={color} opacity={0.22} />
    <circle cx={x} cy={y} r={r} fill={C.white} />
    <circle cx={x} cy={y} r={r * 0.65} fill={color} />
  </g>
);

export const Mirror: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 160 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-7} width={w} height={14} rx={5} fill={C.sky} />
    <rect x={-w / 2} y={-7} width={w} height={5} rx={3} fill={C.white} opacity={0.7} />
  </g>
);

// ── планета Земля (условная) ──
export const Earth: React.FC<{ x: number; y: number; r?: number; t?: number }> = ({ x, y, r = 120, t = 0 }) => {
  const id = useId("earth");
  const sh = (t * 8) % (r * 2);
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={id}>
          <circle r={r} />
        </clipPath>
      </defs>
      <circle r={r * 1.08} fill={C.sky} opacity={0.18} />
      <circle r={r} fill="#2f6fd6" />
      <g clipPath={`url(#${id})`}>
        {[-1, 0, 1].map((k) => (
          <g key={k} transform={`translate(${k * r * 2 - sh} 0)`}>
            <path d={`M ${-r * 0.7} ${-r * 0.4} Q ${-r * 0.3} ${-r * 0.8} ${r * 0.1} ${-r * 0.45} Q ${r * 0.25} ${-r * 0.1} ${-r * 0.1} ${r * 0.1} Q ${-r * 0.5} ${r * 0.05} ${-r * 0.7} ${-r * 0.4} Z`} fill="#46c27a" />
            <path d={`M ${r * 0.3} ${r * 0.15} Q ${r * 0.7} ${r * 0.05} ${r * 0.75} ${r * 0.45} Q ${r * 0.5} ${r * 0.8} ${r * 0.25} ${r * 0.55} Z`} fill="#46c27a" />
          </g>
        ))}
        <circle cx={r * 0.35} cy={0} r={r * 1.05} fill="#000" opacity={0.25} />
      </g>
      <circle r={r} fill="none" stroke="#9fd3ff" strokeWidth={3} opacity={0.6} />
    </g>
  );
};

// ── звезда-солнце со свечением ──
export const Sun: React.FC<{ x: number; y: number; r?: number; t?: number; color?: string }> = ({ x, y, r = 80, t = 0, color = C.amber }) => {
  const id = useId("sun");
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor="#fff6d8" />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={r * (2.1 + 0.06 * Math.sin(t * 2))} fill={`url(#${id})`} opacity={0.55} />
      <circle r={r} fill={color} />
      <circle r={r * 0.75} fill="#ffe08a" opacity={0.75} />
    </g>
  );
};

// ── спиральная галактика (условная схема) ──
export const Galaxy: React.FC<{ x: number; y: number; s?: number; t?: number; color?: string; tilt?: number }> = ({ x, y, s = 1, t = 0, color = C.violet, tilt = 0.45 }) => {
  const rot = t * 4;
  const dots: React.ReactNode[] = [];
  for (let arm = 0; arm < 2; arm++) {
    for (let i = 0; i < 26; i++) {
      const q = i / 26;
      const ang = arm * Math.PI + q * Math.PI * 2.2;
      const rr = 12 + q * 110;
      dots.push(<circle key={`${arm}-${i}`} cx={Math.cos(ang) * rr} cy={Math.sin(ang) * rr} r={(1 - q) * 5 + 2} fill={i % 4 ? color : C.white} opacity={0.9 - q * 0.5} />);
    }
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s} ${s * tilt})`}>
      <g transform={`rotate(${rot})`}>{dots}</g>
      <circle r={26} fill="#fff1d0" opacity={0.85} />
      <circle r={48} fill={color} opacity={0.25} />
    </g>
  );
};

// ── телескоп-рефрактор ──
export const Telescope: React.FC<{ x: number; y: number; s?: number; ang?: number }> = ({ x, y, s = 1, ang = -28 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={0} y1={0} x2={-50} y2={110} stroke={C.steel} strokeWidth={10} strokeLinecap="round" />
    <line x1={0} y1={0} x2={50} y2={110} stroke={C.steel} strokeWidth={10} strokeLinecap="round" />
    <line x1={0} y1={0} x2={0} y2={115} stroke={C.steel} strokeWidth={10} strokeLinecap="round" />
    <g transform={`rotate(${ang})`}>
      <rect x={-110} y={-24} width={230} height={48} rx={14} fill={C.dim} />
      <rect x={110} y={-30} width={36} height={60} rx={10} fill={C.text} />
      <rect x={-140} y={-12} width={34} height={24} rx={6} fill={C.steel} />
    </g>
  </g>
);

// ── световой конус (будущее вверх, прошлое вниз) ──
export const LightCone: React.FC<{ x: number; y: number; h?: number; k?: number; tilt?: number; narrow?: number; color?: string; labels?: boolean }> = ({ x, y, h = 260, k = 1, tilt = 0, narrow = 1, color = C.yellow, labels = true }) => {
  const w = h * narrow;
  const hh = h * k;
  const ww = w * k;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <path d={`M 0 0 L ${-ww} ${-hh} L ${ww} ${-hh} Z`} fill={color} opacity={0.22} />
      <path d={`M 0 0 L ${-ww} ${hh} L ${ww} ${hh} Z`} fill={C.sky} opacity={0.18} />
      <path d={`M ${-ww} ${-hh} L ${ww} ${hh} M ${ww} ${-hh} L ${-ww} ${hh}`} stroke={color} strokeWidth={5} />
      <ellipse cx={0} cy={-hh} rx={ww} ry={ww * 0.18} fill="none" stroke={color} strokeWidth={4} opacity={0.8} />
      <ellipse cx={0} cy={hh} rx={ww} ry={ww * 0.18} fill="none" stroke={C.sky} strokeWidth={4} opacity={0.7} />
      <circle r={11} fill={C.white} />
      {labels && k > 0.85 && (
        <g fontFamily={FONT} fontWeight={800} fontSize={30} textAnchor="middle">
          <text y={-hh * 0.45} fill={C.text}>будущее</text>
          <text y={hh * 0.55} fill={C.text}>прошлое</text>
        </g>
      )}
    </g>
  );
};

// ── сетка пространства-времени, прогнутая массой (только наглядная схема) ──
export const Grid: React.FC<{ x: number; y: number; w?: number; h?: number; depth: number; mx?: number; color?: string; n?: number }> = ({ x, y, w = 900, h = 420, depth, mx = 0, color = C.sky, n = 14 }) => {
  const sag = (px: number, py: number) => {
    const dx = px - mx;
    const dy = (py - h / 2) * 1.6;
    return (depth * 9000) / (dx * dx + dy * dy + 9000);
  };
  const rows: React.ReactNode[] = [];
  for (let i = 0; i <= n; i++) {
    const py = (h * i) / n;
    let d = "";
    for (let j = 0; j <= 40; j++) {
      const px = -w / 2 + (w * j) / 40;
      d += `${j ? "L" : "M"} ${px} ${py * 0.45 + sag(px, py)} `;
    }
    rows.push(<path key={`r${i}`} d={d} fill="none" stroke={color} strokeWidth={2} opacity={0.55} />);
  }
  for (let j = 0; j <= n * 2; j++) {
    const px = -w / 2 + (w * j) / (n * 2);
    let d = "";
    for (let i = 0; i <= 30; i++) {
      const py = (h * i) / 30;
      d += `${i ? "L" : "M"} ${px} ${py * 0.45 + sag(px, py)} `;
    }
    rows.push(<path key={`c${j}`} d={d} fill="none" stroke={color} strokeWidth={2} opacity={0.4} />);
  }
  return <g transform={`translate(${x} ${y})`}>{rows}</g>;
};

// ── спектр: радуга и тёмные линии поглощения со сдвигом z (0…1 — доля сдвига) ──
export const Spectrum: React.FC<{ x: number; y: number; w?: number; h?: number; shift?: number; lines?: number[] }> = ({ x, y, w = 820, h = 90, shift = 0, lines = [0.22, 0.38, 0.55, 0.71] }) => {
  const id = useId("spec");
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0%" stopColor="#7a3cff" />
          <stop offset="18%" stopColor="#3b6bff" />
          <stop offset="36%" stopColor="#35d0ff" />
          <stop offset="52%" stopColor="#46e07a" />
          <stop offset="68%" stopColor="#ffe14a" />
          <stop offset="84%" stopColor="#ff8a2a" />
          <stop offset="100%" stopColor="#ff3030" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={w} height={h} rx={10} fill={`url(#${id})`} />
      {lines.map((l, i) => (
        <rect key={i} x={w * (l + shift * 0.16) - 4} y={0} width={8} height={h} fill={C.night} opacity={0.88} />
      ))}
      <rect x={0} y={0} width={w} height={h} rx={10} fill="none" stroke={C.white} strokeWidth={3} opacity={0.6} />
    </g>
  );
};

// ── чёрная дыра: тень + светящийся диск (художественная схема, не снимок) ──
export const BlackHole: React.FC<{ x: number; y: number; r?: number; t?: number; disk?: number; tilt?: number }> = ({ x, y, r = 110, t = 0, disk = 1, tilt = 0.28 }) => {
  const id = useId("bh");
  const flick = 0.85 + 0.15 * Math.sin(t * 3);
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={id}>
          <stop offset="55%" stopColor="#ffb347" stopOpacity={0} />
          <stop offset="68%" stopColor="#ffd58a" stopOpacity={0.95} />
          <stop offset="80%" stopColor="#ff7b3a" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#ff3d1f" stopOpacity={0} />
        </radialGradient>
      </defs>
      {disk > 0 && (
        <g opacity={disk * flick}>
          {/* задняя половина диска, приподнятая над тенью (схема линзирования) */}
          <ellipse cx={0} cy={-r * 0.1} rx={r * 1.55} ry={r * 1.05} fill={`url(#${id})`} opacity={0.55} />
          <ellipse cx={0} cy={0} rx={r * 2.6} ry={r * 2.6 * tilt} fill="none" stroke="#ffb347" strokeWidth={r * 0.32} opacity={0.75} />
          <ellipse cx={0} cy={0} rx={r * 2.15} ry={r * 2.15 * tilt} fill="none" stroke="#fff1c4" strokeWidth={r * 0.1} opacity={0.8} />
        </g>
      )}
      <circle r={r} fill="#000" />
      <circle r={r * 1.03} fill="none" stroke="#ffd58a" strokeWidth={4} opacity={0.6 * disk} />
      {disk > 0 && (
        <path d={`M ${-r * 2.6} 0 A ${r * 2.6} ${r * 2.6 * tilt} 0 0 0 ${r * 2.6} 0`} fill="none" stroke="#ffb347" strokeWidth={r * 0.34} opacity={0.85 * disk * flick} />
      )}
    </g>
  );
};

// ── условный космонавт (скафандр, без лица — стекло шлема) ──
export const Astronaut: React.FC<{ x: number; y: number; s?: number; t?: number; stretch?: number; color?: string }> = ({ x, y, s = 1, t = 0, stretch = 1, color = C.white }) => (
  <g transform={`translate(${x} ${y + wob(t, 3, 4)}) scale(${s / Math.sqrt(stretch)} ${s * stretch})`}>
    <rect x={-26} y={-10} width={52} height={64} rx={20} fill={color} />
    <rect x={-40} y={0} width={18} height={44} rx={9} fill={color} />
    <rect x={22} y={0} width={18} height={44} rx={9} fill={color} />
    <rect x={-22} y={48} width={18} height={40} rx={9} fill={color} />
    <rect x={4} y={48} width={18} height={40} rx={9} fill={color} />
    <circle cy={-36} r={30} fill={color} />
    <ellipse cx={4} cy={-36} rx={20} ry={16} fill={C.deep} />
    <ellipse cx={10} cy={-42} rx={6} ry={4} fill={C.sky} opacity={0.8} />
    <rect x={-14} y={8} width={28} height={16} rx={4} fill={C.amber} />
  </g>
);

// ── чашка с чаем (целая или разбитая, k — доля «разбитости») ──
export const Cup: React.FC<{ x: number; y: number; s?: number; k?: number }> = ({ x, y, s = 1, k = 0 }) => {
  const sp = clamp01(k) * 70;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {k <= 0 ? (
        <g>
          <path d="M -70 -60 L 70 -60 L 56 50 Q 0 70 -56 50 Z" fill={C.text} />
          <path d="M 70 -40 Q 115 -30 104 6 Q 94 34 60 26" fill="none" stroke={C.text} strokeWidth={14} />
          <ellipse cx={0} cy={-60} rx={70} ry={14} fill="#b8743c" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-30 + i * 30} -84 Q ${-40 + i * 30} -110 ${-28 + i * 30} -134`} fill="none" stroke={C.dim} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
          ))}
        </g>
      ) : (
        <g>
          <ellipse cx={0} cy={66} rx={140 * clamp01(k)} ry={22 * clamp01(k)} fill="#b8743c" opacity={0.8} />
          <path d={`M ${-70 - sp} 20 L ${-20 - sp} 10 L ${-36 - sp} 60 Z`} fill={C.text} />
          <path d={`M ${-10} 30 L ${40} 22 L ${26} 64 L ${-14} 62 Z`} fill={C.text} transform={`rotate(${k * 20})`} />
          <path d={`M ${30 + sp} 34 L ${76 + sp} 26 L ${66 + sp} 62 Z`} fill={C.text} />
          <path d={`M ${70 + sp * 1.4} 10 Q ${110 + sp * 1.4} 18 ${100 + sp * 1.4} 46`} fill="none" stroke={C.text} strokeWidth={14} />
        </g>
      )}
    </g>
  );
};

// ── ракета ──
export const Rocket: React.FC<{ x: number; y: number; s?: number; ang?: number; t?: number; flame?: number }> = ({ x, y, s = 1, ang = 0, t = 0, flame = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${s})`}>
    {flame > 0 && <path d={`M -16 60 Q 0 ${110 + Math.sin(t * 20) * 12} 16 60 Z`} fill={C.orange} opacity={flame} />}
    <path d="M 0 -90 Q 34 -50 30 50 L -30 50 Q -34 -50 0 -90 Z" fill={C.text} />
    <circle cy={-20} r={14} fill={C.sky} stroke={C.steel} strokeWidth={4} />
    <path d="M -30 20 L -52 64 L -30 54 Z M 30 20 L 52 64 L 30 54 Z" fill={C.red} />
  </g>
);

// ── волна (синусоида) для света/частиц ──
export const Wave: React.FC<{ x: number; y: number; w: number; amp: number; len: number; phase: number; color?: string; sw?: number }> = ({ x, y, w, amp, len, phase, color = C.sky, sw = 5 }) => {
  let d = "";
  for (let i = 0; i <= 120; i++) {
    const px = (w * i) / 120;
    d += `${i ? "L" : "M"} ${x + px} ${y + Math.sin((px / len) * Math.PI * 2 - phase) * amp} `;
  }
  return <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />;
};

// ── звёздочка-искра ──
export const Spark: React.FC<{ x: number; y: number; r?: number; color?: string; o?: number }> = ({ x, y, r = 10, color = C.white, o = 1 }) => (
  <path transform={`translate(${x} ${y})`} d={`M 0 ${-r} L ${r * 0.22} ${-r * 0.22} L ${r} 0 L ${r * 0.22} ${r * 0.22} L 0 ${r} L ${-r * 0.22} ${r * 0.22} L ${-r} 0 L ${-r * 0.22} ${-r * 0.22} Z`} fill={color} opacity={o} />
);

// ── подпись-оговорка мелким шрифтом («схема, не снимок») ──
export const Note: React.FC<{ x: number; y: number; text: string; o?: number; anchor?: "start" | "middle" | "end" }> = ({ x, y, text, o = 1, anchor = "middle" }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight={700} fontSize={24} fill={C.dim} opacity={o} fontStyle="italic">
    {text}
  </text>
);
