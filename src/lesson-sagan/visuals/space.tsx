// Рисунки фильма «Космос»: место схемы рядом с бананом, подписи, планеты, Земля,
// звезда, галактика из чётких точек, телескоп, зонд, радиоантенна, палочка-гномон,
// окно обсерватории. Всё — оригинальные простые векторные формы, не иллюстрации
// книги, не кадры телесериала и не снимки миссий; условность масштаба
// подписывается в самих сценах.
import React from "react";
import { C, FONT } from "../theme";
import { clamp01 } from "./kit";

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

export const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// подпись-оговорка курсивом («условный масштаб», «не снимок» и т. п.)
export const Note: React.FC<{ x: number; y: number; text: string; o?: number; anchor?: "start" | "middle" | "end"; size?: number; color?: string }> = ({ x, y, text, o = 1, anchor = "middle", size = 26, color = C.dim }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight={700} fontSize={size} fill={color} opacity={o} fontStyle="italic">
    {text}
  </text>
);

// ── планета: диск с мягкой тенью терминатора и полосами ──
export const Planet: React.FC<{ x: number; y: number; r: number; color: string; bands?: string; ring?: boolean; shade?: number; label?: string; labelColor?: string }> = ({ x, y, r, color, bands, ring, shade = 0.45, label, labelColor = C.text }) => {
  const id = useId("pl");
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={id} cx="35%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="45%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={shade} />
        </radialGradient>
        <clipPath id={`${id}-c`}>
          <circle r={r} />
        </clipPath>
      </defs>
      {ring && <ellipse rx={r * 1.9} ry={r * 0.42} fill="none" stroke="#e8d6a8" strokeWidth={r * 0.16} opacity={0.75} transform="rotate(-14)" />}
      <circle r={r} fill={color} />
      {bands && (
        <g clipPath={`url(#${id}-c)`}>
          {[-0.55, -0.2, 0.18, 0.5].map((b, i) => (
            <rect key={i} x={-r} y={b * r} width={r * 2} height={r * (0.1 + (i % 2) * 0.06)} fill={bands} opacity={0.55} />
          ))}
        </g>
      )}
      <circle r={r} fill={`url(#${id})`} />
      {ring && <path d={`M ${-r * 1.84} ${r * 0.47} A ${r * 1.9} ${r * 0.42} 0 0 0 ${r * 1.84} ${-r * 0.47}`} fill="none" stroke="#e8d6a8" strokeWidth={r * 0.16} opacity={0.75} transform="rotate(-14)" />}
      {label && (
        <text y={r + Math.max(34, r * 0.32)} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={Math.max(26, Math.min(40, r * 0.3))} fill={labelColor}>
          {label}
        </text>
      )}
    </g>
  );
};

// ── Земля: океан и условные материки (не карта) ──
export const Earth: React.FC<{ x: number; y: number; r: number; spin?: number; label?: string }> = ({ x, y, r, spin = 0, label }) => {
  const id = useId("earth");
  const sx = ((spin * r * 2) % (r * 4)) - r * 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={id}>
          <circle r={r} />
        </clipPath>
        <radialGradient id={`${id}-g`} cx="35%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.3} />
          <stop offset="50%" stopColor="#fff" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.5} />
        </radialGradient>
      </defs>
      <circle r={r * 1.06} fill="#7fc4ff" opacity={0.25} />
      <circle r={r} fill={C.earth} />
      <g clipPath={`url(#${id})`}>
        {[0, r * 4].map((off) => (
          <g key={off} transform={`translate(${sx - off} 0)`}>
            <path d={`M ${-r * 0.6} ${-r * 0.5} q ${r * 0.3} ${-r * 0.3} ${r * 0.6} ${-r * 0.05} q ${r * 0.1} ${r * 0.4} ${-r * 0.2} ${r * 0.55} q ${-r * 0.35} ${r * 0.1} ${-r * 0.4} ${-r * 0.5} Z`} fill={C.land} />
            <path d={`M ${r * 0.25} ${r * 0.05} q ${r * 0.35} ${-r * 0.1} ${r * 0.5} ${r * 0.25} q ${-r * 0.05} ${r * 0.4} ${-r * 0.35} ${r * 0.45} q ${-r * 0.25} ${-r * 0.25} ${-r * 0.15} ${-r * 0.7} Z`} fill={C.land} />
            <path d={`M ${r * 1.3} ${-r * 0.4} q ${r * 0.4} ${-r * 0.1} ${r * 0.55} ${r * 0.3} q ${-r * 0.3} ${r * 0.35} ${-r * 0.55} ${r * 0.05} Z`} fill={C.land} />
          </g>
        ))}
        <ellipse cx={-r * 0.2} cy={-r * 0.15} rx={r * 0.5} ry={r * 0.08} fill="#fff" opacity={0.35} />
      </g>
      <circle r={r} fill={`url(#${id}-g)`} />
      {label && (
        <text y={r + 42} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={Math.max(26, Math.min(40, r * 0.32))} fill={C.text}>
          {label}
        </text>
      )}
    </g>
  );
};

// ── звезда: ровный диск с короной (без вспышек и мерцания) ──
export const Star: React.FC<{ x: number; y: number; r: number; color?: string; label?: string; glow?: number }> = ({ x, y, r, color = C.amber, label, glow = 1 }) => {
  const id = useId("star");
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={color} stopOpacity={0.45 * glow} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={r * 1.7} fill={`url(#${id})`} />
      <circle r={r} fill={color} />
      <circle r={r * 0.62} cx={-r * 0.12} cy={-r * 0.12} fill="#fff" opacity={0.35} />
      {label && (
        <text y={r * 1.7 + 30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.text}>
          {label}
        </text>
      )}
    </g>
  );
};

// ── точка-звезда с четырьмя короткими лучами (чёткая, для «точки на небе») ──
export const Twinkle: React.FC<{ x: number; y: number; s?: number; color?: string; o?: number }> = ({ x, y, s = 1, color = "#fff", o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M 0 -22 L 3 -3 L 22 0 L 3 3 L 0 22 L -3 3 L -22 0 L -3 -3 Z" fill={color} />
    <circle r={5} fill={color} />
  </g>
);

// ── спиральная галактика из детерминированных чётких точек ──
export const Galaxy: React.FC<{ x: number; y: number; s?: number; rot?: number; tilt?: number; color?: string; n?: number; dot?: number }> = ({ x, y, s = 1, rot = 0, tilt = 0.5, color = C.violet, n = 260, dot = 2.4 }) => {
  const pts = React.useMemo(
    () =>
      Array.from({ length: n }).map((_, i) => {
        const arm = i % 2;
        const u = rnd(i + 3) ** 0.8;
        const a = u * 4.2 + arm * Math.PI + (rnd(i + 77) - 0.5) * 0.55;
        const rr = 18 + u * 190;
        return { a, rr, b: rnd(i + 151), warm: u < 0.25 };
      }),
    [n],
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s} ${s * tilt})`}>
      <circle r={60} fill={C.amber} opacity={0.18} />
      <circle r={30} fill="#fff1d0" opacity={0.85} />
      {pts.map((p, i) => (
        <circle key={i} cx={Math.cos(p.a + rot) * p.rr} cy={Math.sin(p.a + rot) * p.rr} r={dot * (0.75 + p.b * 0.6)} fill={p.warm ? "#ffe2b0" : color} opacity={0.55 + p.b * 0.4} />
      ))}
    </g>
  );
};

// ── телескоп-рефрактор на треноге ──
export const Telescope: React.FC<{ x: number; y: number; s?: number; angle?: number }> = ({ x, y, s = 1, angle = -30 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 0 L -60 150 M 0 0 L 60 150 M 0 0 L 0 160" stroke={C.steel} strokeWidth={10} strokeLinecap="round" />
    <g transform={`rotate(${angle})`}>
      <rect x={-40} y={-26} width={230} height={52} rx={12} fill={C.deep} stroke={C.brass} strokeWidth={5} />
      <rect x={185} y={-32} width={30} height={64} rx={8} fill={C.brass} />
      <rect x={-80} y={-14} width={44} height={28} rx={6} fill={C.steel} />
    </g>
    <circle r={14} fill={C.brass} />
  </g>
);

// ── межпланетный зонд (обобщённая собственная схема, не чертёж конкретного аппарата) ──
export const Probe: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <line x1={0} y1={0} x2={-120} y2={40} stroke={C.steel} strokeWidth={5} />
    <line x1={0} y1={0} x2={110} y2={-30} stroke={C.steel} strokeWidth={5} />
    <circle cx={-120} cy={40} r={9} fill={C.dim} />
    <rect x={-26} y={-18} width={52} height={36} rx={6} fill={C.brass} />
    <path d="M -60 -30 A 70 70 0 0 1 60 -30 Z" fill="#e8eefc" stroke={C.dim} strokeWidth={3} transform="translate(0 -22)" />
    <line x1={0} y1={-52} x2={0} y2={-80} stroke={C.dim} strokeWidth={4} />
  </g>
);

// ── радиоантенна-«тарелка» ──
export const Dish: React.FC<{ x: number; y: number; s?: number; tilt?: number }> = ({ x, y, s = 1, tilt = -25 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -50 120 L 0 20 L 50 120 Z" fill={C.deep} stroke={C.steel} strokeWidth={6} strokeLinejoin="round" />
    <g transform={`rotate(${tilt})`}>
      <path d="M -110 -10 Q 0 90 110 -10 Z" fill="#e8eefc" stroke={C.dim} strokeWidth={5} />
      <line x1={0} y1={40} x2={0} y2={-70} stroke={C.dim} strokeWidth={5} />
      <circle cy={-74} r={9} fill={C.yellow} />
    </g>
  </g>
);

// ── палочка (гномон) с тенью: angle — угол солнечных лучей от вертикали, °; len — длина палочки ──
export const Stick: React.FC<{ x: number; y: number; len?: number; angle: number; label?: string; shadowColor?: string }> = ({ x, y, len = 120, angle, label, shadowColor = "#000" }) => {
  const sh = Math.tan((angle * Math.PI) / 180) * len;
  return (
    <g transform={`translate(${x} ${y})`}>
      {sh > 0.5 && <path d={`M 0 0 L ${sh} 0 L 0 ${-len} Z`} fill={shadowColor} opacity={0.18} />}
      {sh > 0.5 && <line x1={0} y1={0} x2={sh} y2={0} stroke="#000" strokeWidth={10} strokeLinecap="round" opacity={0.55} />}
      <line x1={0} y1={0} x2={0} y2={-len} stroke={C.brass} strokeWidth={10} strokeLinecap="round" />
      {label && (
        <text y={52} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.text}>
          {label}
        </text>
      )}
    </g>
  );
};

// ── параллельные солнечные лучи ──
export const Rays: React.FC<{ x: number; y: number; w: number; h: number; angle: number; k: number; n?: number }> = ({ x, y, w, h, angle, k, n = 6 }) => {
  const dx = Math.tan((angle * Math.PI) / 180) * h;
  return (
    <g opacity={clamp01(k)}>
      {Array.from({ length: n }).map((_, i) => {
        const x0 = x + (i * w) / (n - 1);
        return <line key={i} x1={x0 - dx} y1={y} x2={x0 - dx + dx * k} y2={y + h * k} stroke={C.yellow} strokeWidth={4} strokeDasharray="14 10" opacity={0.85} />;
      })}
    </g>
  );
};

// ── «окно доказательств» в миниатюре: арочная рама с четырьмя секторами слоёв ──
export const MiniWindow: React.FC<{ x: number; y: number; s?: number; active?: number; children?: React.ReactNode }> = ({ x, y, s = 1, active = -1, children }) => {
  const id = useId("mw");
  const cols = [C.sky, C.violet, C.green, C.amber];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id={id}>
          <path d="M -200 160 L -200 -40 A 200 200 0 0 1 200 -40 L 200 160 Z" />
        </clipPath>
      </defs>
      <path d="M -200 160 L -200 -40 A 200 200 0 0 1 200 -40 L 200 160 Z" fill={C.night} />
      <g clipPath={`url(#${id})`}>{children}</g>
      <path d="M -200 160 L -200 -40 A 200 200 0 0 1 200 -40 L 200 160 Z" fill="none" stroke={C.brass} strokeWidth={12} />
      {cols.map((c, i) => (
        <rect key={i} x={-200 + i * 100 + 6} y={176} width={88} height={16} rx={8} fill={c} opacity={i === active ? 1 : 0.3} />
      ))}
    </g>
  );
};

// ── книга фильма: собственный условный рисунок (не обложка издательства) ──
export const BookSketch: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <rect x={-150} y={-200} width={300} height={400} rx={16} fill="#18214d" stroke={C.yellow} strokeWidth={6} />
    <rect x={-150} y={-200} width={30} height={400} rx={8} fill="#10173a" />
    <circle cx={15} cy={-50} r={80} fill="none" stroke={C.brass} strokeWidth={5} />
    <circle cx={15} cy={-50} r={22} fill={C.amber} />
    <ellipse cx={15} cy={-50} rx={70} ry={20} fill="none" stroke={C.sky} strokeWidth={4} />
    <text x={15} y={95} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={C.yellow}>
      Космос
    </text>
    <text x={15} y={145} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.text}>
      Карл Саган
    </text>
  </g>
);

// ── звёздное поле в прямоугольнике (чёткие точки, постоянные) ──
export const StarField: React.FC<{ x: number; y: number; w: number; h: number; n?: number; seed?: number; o?: number; r?: number }> = ({ x, y, w, h, n = 60, seed = 0, o = 1, r = 2.2 }) => (
  <g opacity={o}>
    {Array.from({ length: n }).map((_, i) => (
      <circle key={i} cx={x + rnd(i + seed) * w} cy={y + rnd(i + seed + 333) * h} r={r * (0.75 + rnd(i + seed + 666) * 0.7)} fill={rnd(i + seed + 999) > 0.8 ? "#ffe2b0" : "#eef3ff"} opacity={0.6 + rnd(i + seed + 111) * 0.4} />
    ))}
  </g>
);
