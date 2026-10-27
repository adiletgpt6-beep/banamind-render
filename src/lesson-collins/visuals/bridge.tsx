// Главная метафора фильма — «Мастерская разговора»: две стороны разговора на
// своих площадках и небольшой деревянный мост между ними. Обвинение обрывает
// доски, внимательный вопрос кладёт новую, признанная ошибка восстанавливает
// путь. Это авторская объясняющая метафора BanaMind, не сюжет и не схема Карнеги.
//   Bridge       — площадки, канаты и доски (каждая доска со своим состоянием);
//   PhraseBurst  — фраза в облачке рассыпается чёткими точками и собирается в форму;
//   Bubble       — облачко реплики (вектор, ровный текст).
import React from "react";
import { C, DISPLAY, FONT } from "../theme";
import { dotsOf, hash, Morph, paint, sample, type Pt } from "./dots";
import { OL } from "./draw";
import { clamp01, ease } from "./kit";
import { SHAPES, type ShapeName } from "./shapes";

// ── площадка-утёс одной стороны разговора ──
export const Ledge: React.FC<{ x: number; y: number; w?: number; side: -1 | 1; color?: string; top?: string; label?: string }> = ({ x, y, w = 420, side, color = C.cliff, top = C.cliffTop, label }) => {
  const h = 1080 - y + 40;
  const edge = side < 0 ? x + w / 2 : x - w / 2; // край к мосту
  const far = side < 0 ? x - w / 2 : x + w / 2;
  return (
    <g>
      <path d={`M ${far} ${y + h} L ${far} ${y + 10} Q ${far} ${y - 14} ${far - side * -20} ${y - 14} L ${edge + side * 30} ${y - 14} Q ${edge} ${y - 14} ${edge} ${y + 16} L ${edge - side * 40} ${y + h} Z`} fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${far} ${y + 4} L ${far} ${y - 2} Q ${far} ${y - 14} ${far - side * -20} ${y - 14} L ${edge + side * 30} ${y - 14} Q ${edge} ${y - 14} ${edge} ${y + 4} Z`} fill={top} />
      {/* слоистые полосы породы — чёткие линии, без текстур */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${far + (side < 0 ? 30 : -30)} ${y + 90 + i * 110} q ${(edge - far) * 0.3} ${-18} ${(edge - far) * 0.62} 0`} stroke={OL} strokeOpacity={0.25} strokeWidth={4} fill="none" strokeLinecap="round" />
      ))}
      {label && (
        <text x={x} y={y + 80} fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={7} paintOrder="stroke">
          {label}
        </text>
      )}
    </g>
  );
};

export type PlankState = { k: number; fall?: number; glow?: number; color?: string };

// ── мост из n досок между x0 и x1 на высоте y ──
export const Bridge: React.FC<{
  x0: number;
  x1: number;
  y: number;
  planks: PlankState[];
  rope?: number; // 0…1 — натянут ли канат (0 — оборван посередине)
  t?: number;
  sway?: number;
}> = ({ x0, x1, y, planks, rope = 1, t = 0, sway = 1 }) => {
  const n = planks.length;
  const span = x1 - x0;
  const pw = span / n;
  const sag = 34;
  const yAt = (x: number) => y + Math.sin(((x - x0) / span) * Math.PI) * sag + Math.sin(t * 1.3) * 2 * sway;
  const ropeY = (x: number) => yAt(x) - 120 + Math.sin(((x - x0) / span) * Math.PI) * 26;
  const ropePath = (from: number, to: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 20; i++) {
      const x = from + ((to - from) * i) / 20;
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ropeY(x).toFixed(1)}`);
    }
    return pts.join(" ");
  };
  const mid = (x0 + x1) / 2;
  const cut = 1 - clamp01(rope);
  return (
    <g>
      {/* стойки */}
      {[x0, x1].map((x, i) => (
        <g key={i}>
          <rect x={x - 12} y={y - 150} width={24} height={150} rx={8} fill={C.woodDark} stroke={OL} strokeWidth={4} />
          <circle cx={x} cy={y - 154} r={16} fill={C.wood} stroke={OL} strokeWidth={4} />
        </g>
      ))}
      {/* канат-перила: целый или оборванный (концы провисают) */}
      {cut <= 0.001 ? (
        <path d={ropePath(x0, x1)} stroke={OL} strokeWidth={11} fill="none" strokeLinecap="round" />
      ) : (
        <g>
          <path d={`M ${x0} ${ropeY(x0)} Q ${x0 + span * 0.25} ${ropeY(x0 + span * 0.25) + 40 * cut} ${mid - 40 - 60 * cut} ${ropeY(mid) + 160 * cut}`} stroke={OL} strokeWidth={11} fill="none" strokeLinecap="round" />
          <path d={`M ${x1} ${ropeY(x1)} Q ${x1 - span * 0.25} ${ropeY(x1 - span * 0.25) + 40 * cut} ${mid + 40 + 60 * cut} ${ropeY(mid) + 160 * cut}`} stroke={OL} strokeWidth={11} fill="none" strokeLinecap="round" />
        </g>
      )}
      {cut <= 0.001 ? (
        <path d={ropePath(x0, x1)} stroke={C.rope} strokeWidth={6} fill="none" strokeLinecap="round" />
      ) : (
        <g>
          <path d={`M ${x0} ${ropeY(x0)} Q ${x0 + span * 0.25} ${ropeY(x0 + span * 0.25) + 40 * cut} ${mid - 40 - 60 * cut} ${ropeY(mid) + 160 * cut}`} stroke={C.rope} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={`M ${x1} ${ropeY(x1)} Q ${x1 - span * 0.25} ${ropeY(x1 - span * 0.25) + 40 * cut} ${mid + 40 + 60 * cut} ${ropeY(mid) + 160 * cut}`} stroke={C.rope} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* доски */}
      {planks.map((p, i) => {
        const cx = x0 + pw * (i + 0.5);
        const k = ease(clamp01(p.k));
        if (k <= 0.001) return null;
        const fall = ease(clamp01(p.fall ?? 0));
        const dy = (1 - k) * -90 + fall * 520;
        const rot = fall * (hash(i, 5) - 0.5) * 120;
        const op = k * (1 - clamp01((fall - 0.7) / 0.3));
        if (op <= 0.01) return null;
        const yy = yAt(cx);
        return (
          <g key={i} transform={`translate(${cx} ${yy + dy}) rotate(${rot})`} opacity={op}>
            {p.glow ? <rect x={-pw / 2 - 6} y={-22} width={pw + 12} height={44} rx={12} fill={C.yellow} opacity={0.5 * p.glow} /> : null}
            <rect x={-pw / 2 + 5} y={-16} width={pw - 10} height={32} rx={7} fill={p.color ?? C.woodLight} stroke={OL} strokeWidth={4} />
            <line x1={-pw / 2 + 18} y1={-4} x2={pw / 2 - 26} y2={-4} stroke={C.woodDark} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
            <circle cx={-pw / 2 + 14} cy={6} r={3.5} fill={OL} />
            <circle cx={pw / 2 - 14} cy={6} r={3.5} fill={OL} />
          </g>
        );
      })}
    </g>
  );
};

// состояние n досок: первые `have` целы, доски в диапазоне [a, b) падают с прогрессом fall
export const planksOf = (n: number, have: number, opts: { fallFrom?: number; fallTo?: number; fall?: number; glowAt?: number; glow?: number } = {}): PlankState[] =>
  Array.from({ length: n }, (_, i) => {
    const k = clamp01(have - i);
    const inFall = opts.fallFrom !== undefined && i >= opts.fallFrom && i < (opts.fallTo ?? n);
    return { k, fall: inFall ? clamp01((opts.fall ?? 0) * 1.6 - (hash(i, 7) * 0.6)) : 0, glow: opts.glowAt === i ? opts.glow ?? 0 : 0 };
  });

// ── облачко реплики ──
export const Bubble: React.FC<{ x: number; y: number; text: string; size?: number; tail?: -1 | 0 | 1; fill?: string; color?: string; opacity?: number; scale?: number; w?: number }> = ({
  x, y, text, size = 46, tail = 0, fill = C.paper, color = C.ink, opacity = 1, scale = 1, w: w0,
}) => {
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((l) => l.length));
  const w = w0 ?? Math.max(220, longest * size * 0.56 + size * 1.4);
  const h = lines.length * size * 1.22 + size * 0.9;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={h * 0.32} fill="#000" opacity={0.15} />
      {tail !== 0 && <path d={`M ${tail * w * 0.18} ${h / 2 - 6} L ${tail * w * 0.34} ${h / 2 + 46} L ${tail * w * 0.02} ${h / 2 - 6} Z`} fill={fill} stroke={OL} strokeWidth={4} strokeLinejoin="round" />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.32} fill={fill} stroke={OL} strokeWidth={4} />
      {tail !== 0 && <path d={`M ${tail * w * 0.17} ${h / 2 - 8} L ${tail * w * 0.03} ${h / 2 - 8}`} stroke={fill} strokeWidth={8} />}
      <text x={0} y={-((lines.length - 1) * size * 1.22) / 2 + size * 0.36} fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} textAnchor="middle">
        {lines.map((l, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : size * 1.22}>
            {l}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// ── фраза → точки → предметная форма ──
// До момента at фраза видна в облачке; затем облачко гаснет, а его точки (та же
// площадь, чёткая шестиугольная сетка) летят по дугам и собираются в форму shape
// в точке (sx, sy). Движение детерминировано — без мерцания между кадрами.
export const PhraseBurst: React.FC<{
  t: number;
  at: number;
  text: string;
  bx: number;
  by: number;
  shape: ShapeName;
  sx: number;
  sy: number;
  colors: string[];
  scale?: number; // масштаб формы
  dur?: number;
  size?: number;
  step?: number;
  r?: number;
  appear?: number; // когда появляется облачко
  tail?: -1 | 0 | 1;
  keepText?: boolean;
  mode?: "mix" | "rows" | "radial";
}> = ({ t, at, text, bx, by, shape, sx, sy, colors, scale = 1, dur = 1.6, size = 44, step = 14, r = 5.4, appear, tail = 0, keepText = false, mode = "mix" }) => {
  const a0 = appear ?? at - 1.2;
  if (t < a0) return null;
  const inK = ease(clamp01((t - a0) / 0.45));
  const k = clamp01((t - at) / dur);
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((l) => l.length));
  const w = Math.max(220, longest * size * 0.56 + size * 1.4);
  const h = lines.length * size * 1.22 + size * 0.9;
  const box = Math.max(w, h) / 2 + 10;
  const rectPts = sample(`bubble-${w.toFixed(0)}x${h.toFixed(0)}-${step}`, (x, y) => Math.abs(x) <= w / 2 - 8 && Math.abs(y) <= h / 2 - 8, box, step);
  const from: Pt[] = paint(rectPts, bx, by, colors, mode);
  const f = SHAPES[shape];
  const to: Pt[] = dotsOf(`shape-${shape}-${scale}-${step}`, (x, y) => f(x / scale, y / scale), sx, sy, colors, step, 260 * scale + 40, mode);
  const textOp = keepText ? 1 - 0.65 * clamp01(k * 3) : 1 - clamp01(k * 4);
  return (
    <g>
      {k < 0.02 || keepText ? <Bubble x={bx} y={by} text={text} size={size} tail={tail} opacity={inK * (keepText ? textOp : 1)} scale={0.9 + 0.1 * inK} /> : null}
      {k >= 0.02 && k < 0.3 && !keepText && <Bubble x={bx} y={by} text={text} size={size} tail={tail} opacity={textOp} />}
      {k > 0 && <Morph a={from} b={to} k={k} t={t} r={r} stagger={0.4} breathe={0.8} arc={120} />}
    </g>
  );
};

// крупная надпись-ярлык над сценой
export const Headline: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; opacity?: number }> = ({ x, y, text, size = 58, color = "#fff", opacity = 1 }) => (
  <text x={x} y={y} fontFamily={DISPLAY} fontWeight={800} fontSize={size} fill={color} textAnchor="middle" stroke={OL} strokeWidth={size * 0.16} paintOrder="stroke" opacity={opacity}>
    {text}
  </text>
);
