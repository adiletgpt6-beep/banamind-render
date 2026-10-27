// Рисунки учебного острова фильма «Sapiens»: море, остров, пальмы, условные жители,
// хижины, поле, амбар, глиняные таблички, монеты, ракушки, свитки, шестерёнки,
// фабрика, часы, карта. Всё — оригинальные простые векторные формы; жители —
// условные фигурки модели, а не исторические или религиозные персонажи.
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

export const Sea: React.FC<{ t: number; y?: number; w?: number; x?: number; color?: string }> = ({ t, y = 640, w = 1280, x = 0, color = C.sea }) => (
  <g>
    <rect x={x} y={y} width={w} height={300} rx={40} fill={color} opacity={0.55} />
    {[0, 1, 2].map((i) => {
      const yy = y + 40 + i * 60;
      const ph = t * (0.8 + i * 0.2) + i;
      let d = `M ${x + 20} ${yy}`;
      for (let k = 0; k <= 12; k++) {
        const xx = x + 20 + ((w - 40) * k) / 12;
        d += ` Q ${xx - (w - 40) / 24} ${yy + Math.sin(ph + k) * 8 - 10} ${xx} ${yy}`;
      }
      return <path key={i} d={d} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.55 - i * 0.12} />;
    })}
  </g>
);

export const Palm: React.FC<{ x: number; y: number; s?: number; t: number; seed?: number }> = ({ x, y, s = 1, t, seed = 0 }) => {
  const sway = wob(t * 0.6, seed, 4);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M 0 0 Q ${-8 + sway * 0.5} -80 ${10 + sway} -170`} stroke={C.wood} strokeWidth={16} fill="none" strokeLinecap="round" />
      <g transform={`translate(${10 + sway} -170) rotate(${sway})`}>
        {[-150, -110, -60, -20, 25, 70].map((a, i) => (
          <path
            key={i}
            d="M 0 0 Q 40 -30 86 6 Q 44 -6 0 0 Z"
            fill={i % 2 ? C.palm : C.palmDeep}
            transform={`rotate(${a + Math.sin(t * 1.2 + i + seed) * 4})`}
          />
        ))}
        <circle cx={-6} cy={8} r={9} fill={C.woodDark} />
        <circle cx={8} cy={10} r={9} fill={C.woodDark} />
      </g>
    </g>
  );
};

export const Island: React.FC<{ x: number; y: number; w?: number; t: number; palms?: boolean }> = ({ x, y, w = 760, t, palms = true }) => (
  <g>
    <ellipse cx={x} cy={y + 18} rx={w / 2 + 40} ry={w * 0.09} fill={C.seaDeep} opacity={0.18} />
    <ellipse cx={x} cy={y} rx={w / 2} ry={w * 0.12} fill={C.sandDeep} />
    <ellipse cx={x} cy={y - 12} rx={w / 2 - 20} ry={w * 0.1} fill={C.sand} />
    <ellipse cx={x - w * 0.12} cy={y - 26} rx={w * 0.18} ry={w * 0.03} fill="#fff" opacity={0.3} />
    {palms && (
      <>
        <Palm x={x - w * 0.36} y={y - 8} s={0.9} t={t} seed={1} />
        <Palm x={x + w * 0.38} y={y - 4} s={0.75} t={t} seed={2} />
      </>
    )}
  </g>
);

const SKIN = ["#f1c7a0", "#d9a47a", "#b07a52", "#8a5a3b", "#f6d6b8"];
const SHIRT = [C.coral, C.skyDeep, C.green, C.violet, C.yellowDeep, C.clay, C.seaDeep];

// условный житель модели: круглая голова, точки-глаза, туловище-капля
export const Person: React.FC<{
  x: number;
  y: number;
  s?: number;
  i?: number; // номер — цвет одежды/кожи
  t?: number;
  bend?: number; // 0…1 — согнулся над работой
  arm?: number; // −1…1 — поднятая рука
  sad?: boolean;
  look?: number;
}> = ({ x, y, s = 1, i = 0, t = 0, bend = 0, arm = 0, sad = false, look = 0 }) => {
  const bob = Math.sin(t * 2 + i * 1.3) * 2;
  const skin = SKIN[i % SKIN.length];
  const shirt = SHIRT[(i * 3) % SHIRT.length];
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={22} ry={5} fill="#000" opacity={0.1} />
      <g transform={`rotate(${bend * 28})`}>
        <path d="M -20 0 Q -24 -52 0 -60 Q 24 -52 20 0 Z" fill={shirt} />
        <path d={`M 16 -44 Q ${30 + arm * 6} ${-50 - arm * 28} ${32 + arm * 4} ${-34 - arm * 36}`} stroke={shirt} strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M -16 -44 Q -28 -30 -26 -14" stroke={shirt} strokeWidth={8} fill="none" strokeLinecap="round" />
        <circle cx={0} cy={-80} r={20} fill={skin} />
        <circle cx={-7 + look * 3} cy={-82} r={2.6} fill={C.ink} />
        <circle cx={7 + look * 3} cy={-82} r={2.6} fill={C.ink} />
        <path d={sad ? "M -6 -70 Q 0 -75 6 -70" : "M -6 -73 Q 0 -68 6 -73"} stroke={C.ink} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

// толпа: n жителей рядами, k — доля появившихся
export const Crowd: React.FC<{ x: number; y: number; cols: number; rows: number; gap?: number; s?: number; k?: number; t: number; seed?: number }> = ({
  x,
  y,
  cols,
  rows,
  gap = 54,
  s = 0.6,
  k = 1,
  t,
  seed = 0,
}) => {
  const n = cols * rows;
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const kk = clamp01(k * n - idx);
      if (kk <= 0) continue;
      out.push(
        <g key={idx} opacity={kk}>
          <Person x={x + c * gap + (r % 2) * gap * 0.5} y={y + r * gap * 0.62} s={s} i={idx + seed} t={t} />
        </g>,
      );
    }
  return <g>{out}</g>;
};

export const Hut: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-50} y={-60} width={100} height={60} rx={6} fill={C.clay} />
    <path d="M -66 -56 L 0 -112 L 66 -56 Z" fill={C.wheat} stroke={C.wood} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-14} y={-38} width={28} height={38} rx={5} fill={C.woodDark} />
  </g>
);

export const Wheat: React.FC<{ x: number; y: number; h?: number; t: number; k?: number; seed?: number }> = ({ x, y, h = 90, t, k = 1, seed = 0 }) => {
  const hh = h * clamp01(k);
  if (hh < 2) return null;
  const sway = Math.sin(t * 1.5 + seed) * 5;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M 0 0 Q ${sway * 0.4} ${-hh / 2} ${sway} ${-hh}`} stroke="#c99a2a" strokeWidth={4} fill="none" />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={sway + (i % 2 ? 6 : -6)} cy={-hh + 8 + i * 9} rx={5} ry={9} fill={C.wheat} transform={`rotate(${i % 2 ? 25 : -25} ${sway + (i % 2 ? 6 : -6)} ${-hh + 8 + i * 9})`} />
      ))}
      <ellipse cx={sway} cy={-hh - 4} rx={4.5} ry={9} fill={C.wheat} />
    </g>
  );
};

export const Field: React.FC<{ x: number; y: number; w: number; rows?: number; t: number; k?: number }> = ({ x, y, w, rows = 3, t, k = 1 }) => {
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    out.push(<rect key={`r${r}`} x={x} y={y + r * 34 - 4} width={w} height={10} rx={5} fill={C.woodDark} opacity={0.25} />);
    for (let i = 0; i * 28 < w; i++) out.push(<Wheat key={`${r}-${i}`} x={x + 14 + i * 28 + (r % 2) * 12} y={y + r * 34} h={70} t={t} k={k * 1.4 - (i / (w / 28)) * 0.4} seed={i + r * 3} />);
  }
  return <g>{out}</g>;
};

export const Granary: React.FC<{ x: number; y: number; s?: number; fill?: number }> = ({ x, y, s = 1, fill = 0.6 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-150} width={140} height={150} rx={20} fill={C.clay} />
    <rect x={-56} y={-136} width={112} height={122} rx={12} fill={C.clayDark} />
    <rect x={-56} y={-14 - 122 * clamp01(fill)} width={112} height={122 * clamp01(fill)} rx={10} fill={C.wheat} />
    <path d="M -86 -146 Q 0 -210 86 -146 Z" fill={C.woodDark} />
  </g>
);

// глиняная табличка со штрихами-знаками
export const Tablet: React.FC<{ x: number; y: number; s?: number; k?: number; rot?: number; marks?: number }> = ({ x, y, s = 1, k = 1, rot = 0, marks = 12 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-80} y={-100} width={160} height={200} rx={26} fill={C.clayDark} />
    <rect x={-74} y={-96} width={148} height={186} rx={22} fill={C.clay} />
    {Array.from({ length: marks }).map((_, i) => {
      const r = Math.floor(i / 3);
      const c = i % 3;
      const show = clamp01(k * marks - i);
      if (show <= 0) return null;
      return (
        <g key={i} transform={`translate(${-44 + c * 44} ${-62 + r * 42})`} opacity={show}>
          <path d="M -12 -8 L 12 -8 L 0 10 Z" fill={C.clayDark} />
          {i % 2 === 0 && <line x1={-14} y1={14} x2={14} y2={14} stroke={C.clayDark} strokeWidth={5} strokeLinecap="round" />}
        </g>
      );
    })}
  </g>
);

export const Coin: React.FC<{ x: number; y: number; r?: number; label?: string; color?: string; spin?: number }> = ({ x, y, r = 60, label = "", color = C.yellow, spin = 0 }) => {
  const sx = Math.abs(Math.cos(spin)) * 0.8 + 0.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} 1)`}>
      <circle r={r} fill={C.yellowDeep} />
      <circle r={r * 0.86} fill={color} />
      <circle r={r * 0.7} fill="none" stroke={C.yellowDeep} strokeWidth={r * 0.06} />
      {label && (
        <text y={r * 0.2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.6} fill={C.woodDark}>
          {label}
        </text>
      )}
    </g>
  );
};

export const Shell: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse rx={30} ry={42} fill="#fff4e4" stroke={C.clay} strokeWidth={4} />
    <path d="M 0 -34 L 0 34" stroke={C.clay} strokeWidth={5} />
    {[-24, -12, 0, 12, 24].map((yy) => (
      <g key={yy}>
        <line x1={-7} y1={yy} x2={-2} y2={yy} stroke={C.clay} strokeWidth={3} />
        <line x1={2} y1={yy} x2={7} y2={yy} stroke={C.clay} strokeWidth={3} />
      </g>
    ))}
  </g>
);

export const Sack: React.FC<{ x: number; y: number; s?: number; label?: string }> = ({ x, y, s = 1, label }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -46 0 Q -60 -70 -26 -96 L 26 -96 Q 60 -70 46 0 Z" fill="#d8b47a" stroke={C.wood} strokeWidth={4} />
    <path d="M -26 -96 Q 0 -112 26 -96" stroke={C.wood} strokeWidth={6} fill="none" />
    {label && (
      <text y={-38} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.woodDark}>
        {label}
      </text>
    )}
  </g>
);

export const Scroll: React.FC<{ x: number; y: number; w?: number; h?: number; title?: string; rows?: number; k?: number; color?: string }> = ({
  x,
  y,
  w = 300,
  h = 380,
  title,
  rows = 6,
  k = 1,
  color = C.paper,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={color} stroke={C.sandDeep} strokeWidth={5} />
    <rect x={-w / 2 - 16} y={-h / 2 - 16} width={w + 32} height={30} rx={15} fill={C.wood} />
    <rect x={-w / 2 - 16} y={h / 2 - 14} width={w + 32} height={30} rx={15} fill={C.wood} />
    {title && (
      <text y={-h / 2 + 62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink}>
        {title}
      </text>
    )}
    {Array.from({ length: rows }).map((_, i) => (
      <rect key={i} x={-w / 2 + 34} y={-h / 2 + 96 + i * 40} width={(w - 68) * clamp01(k * rows - i) * (i % 3 === 2 ? 0.7 : 1)} height={10} rx={5} fill={C.inkSoft} opacity={0.45} />
    ))}
  </g>
);

export const Bubble: React.FC<{ x: number; y: number; text: string; size?: number; k?: number; tail?: -1 | 1; color?: string }> = ({ x, y, text, size = 34, k = 1, tail = 1, color = C.white }) => {
  if (k <= 0.01) return null;
  const lines = text.split("\n");
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.56 + size * 1.4;
  const h = lines.length * size * 1.2 + size * 0.9;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k})`} opacity={clamp01(k * 1.4)}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={h / 2.6} fill={color} stroke={C.ink} strokeOpacity={0.12} strokeWidth={3} />
      <path d={`M ${tail * 10} -2 L ${tail * 26} 22 L ${tail * 34} -4 Z`} fill={color} />
      {lines.map((l, i) => (
        <text key={i} x={0} y={-h + size * 1.15 + i * size * 1.2} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={C.ink}>
          {l}
        </text>
      ))}
    </g>
  );
};

export const Gear: React.FC<{ x: number; y: number; r: number; teeth?: number; rot?: number; color?: string }> = ({ x, y, r, teeth = 10, rot = 0, color = C.steel }) => {
  let d = "";
  for (let i = 0; i < teeth * 2; i++) {
    const a = (Math.PI * i) / teeth;
    const rr = i % 2 ? r : r * 1.18;
    const a2 = a + Math.PI / teeth;
    d += `${i ? "L" : "M"} ${Math.cos(a) * rr} ${Math.sin(a) * rr} L ${Math.cos(a2 - 0.08) * rr} ${Math.sin(a2 - 0.08) * rr} `;
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={d + "Z"} fill={color} />
      <circle r={r * 0.38} fill={C.white} opacity={0.85} />
    </g>
  );
};

export const Factory: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-160} y={-120} width={320} height={120} fill={C.steel} />
    <path d="M -160 -120 L -100 -170 L -100 -120 L -40 -170 L -40 -120 L 20 -170 L 20 -120 Z" fill="#8494ad" />
    <rect x={70} y={-240} width={40} height={120} fill="#5b6a82" />
    {[0, 1, 2].map((i) => {
      const ph = (t * 0.5 + i / 3) % 1;
      return <circle key={i} cx={90 + ph * 40} cy={-250 - ph * 120} r={18 + ph * 26} fill="#c7cfdb" opacity={0.7 * (1 - ph)} />;
    })}
    {[-120, -60, 0].map((xx) => (
      <rect key={xx} x={xx} y={-80} width={40} height={36} rx={4} fill={C.yellow} opacity={0.85} />
    ))}
  </g>
);

export const Clock: React.FC<{ x: number; y: number; r?: number; t: number; speed?: number }> = ({ x, y, r = 90, t, speed = 1 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={C.white} stroke={C.ink} strokeWidth={r * 0.08} />
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={i} x1={0} y1={-r * 0.78} x2={0} y2={-r * 0.66} stroke={C.ink} strokeWidth={r * 0.05} transform={`rotate(${i * 30})`} strokeLinecap="round" />
    ))}
    <line x1={0} y1={0} x2={0} y2={-r * 0.45} stroke={C.ink} strokeWidth={r * 0.07} strokeLinecap="round" transform={`rotate(${t * 6 * speed})`} />
    <line x1={0} y1={0} x2={0} y2={-r * 0.66} stroke={C.coral} strokeWidth={r * 0.04} strokeLinecap="round" transform={`rotate(${t * 72 * speed})`} />
    <circle r={r * 0.07} fill={C.ink} />
  </g>
);

// узлы и связи «невидимой сети» договорённостей
export const Net: React.FC<{ pts: [number, number][]; k: number; t: number; color?: string; links?: [number, number][] }> = ({ pts, k, t, color = C.yellowDeep, links }) => {
  const ls = links ?? pts.flatMap((_, i) => pts.map((__, j) => [i, j] as [number, number]).filter(([a, b]) => a < b && (b - a) % 3 === 1));
  return (
    <g>
      {ls.map(([a, b], i) => {
        const kk = clamp01(k * ls.length - i);
        if (kk <= 0) return null;
        const [x1, y1] = pts[a];
        const [x2, y2] = pts[b];
        return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * kk} y2={y1 + (y2 - y1) * kk} stroke={color} strokeWidth={4} strokeDasharray="10 10" strokeDashoffset={-t * 30} opacity={0.75} />;
      })}
    </g>
  );
};

export const Ship: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 1.6) * 5}) rotate(${Math.sin(t * 1.3) * 3}) scale(${s})`}>
    <path d="M -110 0 L 110 0 L 80 50 L -80 50 Z" fill={C.woodDark} />
    <line x1={0} y1={0} x2={0} y2={-170} stroke={C.wood} strokeWidth={8} />
    <path d="M 6 -160 Q 90 -100 6 -30 Z" fill={C.white} />
    <path d="M -6 -150 Q -70 -100 -6 -40 Z" fill="#f2efe6" />
  </g>
);

// условное крупное животное (мегафауна), силуэт без деталей
export const BigBeast: React.FC<{ x: number; y: number; s?: number; t: number; k?: number }> = ({ x, y, s = 1, t, k = 1 }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 1.4) * 2}) scale(${s})`} opacity={clamp01(k)}>
    <ellipse cx={0} cy={-80} rx={120} ry={74} fill="#8b6b4a" />
    <circle cx={110} cy={-110} r={46} fill="#8b6b4a" />
    <path d="M 140 -96 Q 180 -40 150 0" stroke="#8b6b4a" strokeWidth={18} fill="none" strokeLinecap="round" />
    <path d="M 120 -80 Q 170 -70 176 -110" stroke="#fff4e4" strokeWidth={8} fill="none" strokeLinecap="round" />
    {[-80, -30, 40, 80].map((xx) => (
      <rect key={xx} x={xx - 14} y={-30} width={28} height={30} rx={8} fill="#7a5c3e" />
    ))}
    <circle cx={118} cy={-120} r={5} fill={C.ink} />
  </g>
);

export const Label: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; k?: number; anchor?: "start" | "middle" | "end" }> = ({
  x,
  y,
  text,
  size = 38,
  color = C.ink,
  k = 1,
  anchor = "middle",
}) => (
  <text x={x} y={y + (1 - clamp01(k)) * 14} textAnchor={anchor} fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} opacity={clamp01(k)}>
    {text.split("\n").map((l, i) => (
      <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.18}>
        {l}
      </tspan>
    ))}
  </text>
);
