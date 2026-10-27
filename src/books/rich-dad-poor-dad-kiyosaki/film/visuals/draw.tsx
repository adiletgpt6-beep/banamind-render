// Рисунки «Пути одной монеты» — собственные простые формы BanaMind (не иллюстрации издания):
// монета, человечки (два папы, мальчики, горожане), дом, машина, здания, карточки,
// печати-оговорки, денежный поток из ярких точек вдоль цветных линий. Чёткая обводка,
// плоские светлые цвета, никакого размытия — читаемо и на телефоне.
import React from "react";
import { C, FONT, HEAVY } from "../theme";
import { FitWidth, Txt, clamp01, wob } from "./kit";

export const OL = "#1f2a44"; // обводка

// ── монета ──
export const Coin: React.FC<{ x: number; y: number; r?: number; spin?: number; label?: string; dim?: boolean; face?: boolean }> = ({ x, y, r = 40, spin = 0, label = "¤", dim, face }) => {
  const sx = Math.max(0.12, Math.abs(Math.cos(spin)));
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} 1)`}>
      <circle r={r} fill={dim ? "#d9dde6" : C.gold} stroke={dim ? C.grey : C.goldDeep} strokeWidth={r * 0.12} />
      <circle r={r * 0.72} fill="none" stroke={dim ? "#c4c9d4" : C.goldLight} strokeWidth={r * 0.08} />
      {face ? (
        <g>
          <circle cx={-r * 0.25} cy={-r * 0.12} r={r * 0.09} fill={OL} />
          <circle cx={r * 0.25} cy={-r * 0.12} r={r * 0.09} fill={OL} />
          <path d={`M ${-r * 0.25} ${r * 0.18} Q 0 ${r * 0.38} ${r * 0.25} ${r * 0.18}`} stroke={OL} strokeWidth={r * 0.08} fill="none" strokeLinecap="round" />
        </g>
      ) : (
        sx > 0.4 && (
          <text x={0} y={r * 0.32} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={r * 0.95} fill={dim ? C.grey : C.goldDeep}>
            {label}
          </text>
        )
      )}
    </g>
  );
};

// ── денежный поток: яркие точки бегут вдоль ломаной ──
export const Flow: React.FC<{ pts: [number, number][]; t: number; k?: number; color?: string; speed?: number; n?: number; w?: number; dots?: boolean; dash?: boolean }> = ({
  pts,
  t,
  k = 1,
  color = C.mint,
  speed = 160,
  n = 6,
  w = 10,
  dots = true,
  dash = false,
}) => {
  if (k <= 0) return null;
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const pointAt = (d: number): [number, number] => {
    let s = Math.max(0, Math.min(total, d));
    for (let i = 0; i < seg.length; i++) {
      if (s <= seg[i] || i === seg.length - 1) {
        const f = seg[i] ? s / seg[i] : 0;
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
      }
      s -= seg[i];
    }
    return pts[pts.length - 1];
  };
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const shown = total * clamp01(k);
  const end = pointAt(shown);
  const prev = pointAt(shown - 1);
  const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  const hs = w * 2.4;
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeOpacity={0.28} strokeWidth={w * 2.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={total} strokeDashoffset={total - shown} />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? `${w * 1.6} ${w * 1.6}` : `${total}`} strokeDashoffset={dash ? 0 : total - shown} opacity={dash ? clamp01(k * 2) : 1} />
      {k >= 0.98 && <path d={`M ${end[0]} ${end[1]} L ${end[0] - hs * Math.cos(ang - 0.5)} ${end[1] - hs * Math.sin(ang - 0.5)} M ${end[0]} ${end[1]} L ${end[0] - hs * Math.cos(ang + 0.5)} ${end[1] - hs * Math.sin(ang + 0.5)}`} stroke={color} strokeWidth={w} strokeLinecap="round" />}
      {dots &&
        k >= 0.98 &&
        Array.from({ length: n }).map((_, i) => {
          const pos = ((t * speed + (i * total) / n) % total + total) % total;
          const [x, y] = pointAt(pos);
          return <circle key={i} cx={x} cy={y} r={w * 0.85} fill="#fff" stroke={color} strokeWidth={w * 0.45} />;
        })}
    </g>
  );
};

// ── человечки ──
export type PersonKind = "poorDad" | "richDad" | "kid" | "kid2" | "girl" | "man" | "woman" | "old" | "worker";
const PERSON: Record<PersonKind, { h: number; shirt: string; skin: string; hair: string }> = {
  poorDad: { h: 300, shirt: "#5b7bd5", skin: "#f3c9a2", hair: "#4a3a2c" },
  richDad: { h: 285, shirt: "#e0884a", skin: "#d9a67a", hair: "#2b2b2b" },
  kid: { h: 180, shirt: "#ff6b5e", skin: "#f3c9a2", hair: "#3a2a1c" },
  kid2: { h: 180, shirt: "#2fbf8f", skin: "#e6b48a", hair: "#1e1e1e" },
  girl: { h: 170, shirt: "#a77bf3", skin: "#f3c9a2", hair: "#6b3d1e" },
  man: { h: 290, shirt: "#47a8f0", skin: "#f0c39b", hair: "#3b2d22" },
  woman: { h: 275, shirt: "#ff8fa3", skin: "#f3c9a2", hair: "#7a4524" },
  old: { h: 270, shirt: "#9aa3b5", skin: "#f0c8a6", hair: "#d8d8d8" },
  worker: { h: 285, shirt: "#ffb347", skin: "#d9a67a", hair: "#2b2b2b" },
};
export type PersonMood = "calm" | "happy" | "sad" | "angry" | "shock";

export const Person: React.FC<{
  kind: PersonKind;
  x: number;
  y: number;
  s?: number;
  mood?: PersonMood;
  arm?: "down" | "up" | "out" | "hold" | "point";
  t?: number;
  flip?: boolean;
  label?: string;
  color?: string;
  dim?: boolean;
}> = ({ kind, x, y, s = 1, mood = "calm", arm = "down", t = 0, flip, label, color, dim }) => {
  const P = PERSON[kind];
  const h = P.h;
  const head = h * 0.17;
  const bodyH = h * 0.38;
  const legH = h * 0.32;
  const bw = h * 0.27;
  const shirt = dim ? "#c9ced8" : color ?? P.shirt;
  const breathe = wob(t, x * 0.01, 2);
  const hy = -legH - bodyH - head * 0.9 + breathe * 0.3;
  const armA: Record<string, [number, number]> = { down: [10, 10], up: [150, 150], out: [70, 70], hold: [45, 45], point: [10, 85] };
  const [al, ar] = armA[arm];
  const sh = -legH - bodyH * 0.85;
  const armLen = h * 0.3;
  const armEnd = (side: -1 | 1, a: number) => [side * (bw / 2) + side * Math.sin((a * Math.PI) / 180) * armLen, sh + Math.cos((a * Math.PI) / 180) * armLen];
  const [lx, ly] = armEnd(-1, al);
  const [rx, ry] = armEnd(1, ar);
  const mouth =
    mood === "happy" ? `M ${-head * 0.32} ${head * 0.2} Q 0 ${head * 0.55} ${head * 0.32} ${head * 0.2}` : mood === "sad" ? `M ${-head * 0.3} ${head * 0.42} Q 0 ${head * 0.15} ${head * 0.3} ${head * 0.42}` : mood === "angry" ? `M ${-head * 0.3} ${head * 0.35} L ${head * 0.3} ${head * 0.3}` : mood === "shock" ? "" : `M ${-head * 0.25} ${head * 0.3} L ${head * 0.25} ${head * 0.3}`;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={dim ? 0.7 : 1}>
      <ellipse cx={0} cy={4} rx={bw * 0.8} ry={10} fill="#000" opacity={0.08} />
      {/* ноги */}
      <rect x={-bw * 0.36} y={-legH} width={bw * 0.28} height={legH} rx={bw * 0.12} fill="#3b4566" stroke={OL} strokeWidth={4} />
      <rect x={bw * 0.08} y={-legH} width={bw * 0.28} height={legH} rx={bw * 0.12} fill="#3b4566" stroke={OL} strokeWidth={4} />
      {/* руки */}
      <line x1={-bw / 2 + 6} y1={sh} x2={lx} y2={ly} stroke={shirt} strokeWidth={h * 0.07} strokeLinecap="round" />
      <line x1={bw / 2 - 6} y1={sh} x2={rx} y2={ry} stroke={shirt} strokeWidth={h * 0.07} strokeLinecap="round" />
      <circle cx={lx} cy={ly} r={h * 0.04} fill={P.skin} stroke={OL} strokeWidth={3} />
      <circle cx={rx} cy={ry} r={h * 0.04} fill={P.skin} stroke={OL} strokeWidth={3} />
      {/* тело */}
      <rect x={-bw / 2} y={-legH - bodyH} width={bw} height={bodyH + 6} rx={bw * 0.32} fill={shirt} stroke={OL} strokeWidth={5} />
      {kind === "poorDad" && <path d={`M 0 ${-legH - bodyH + 6} l -9 14 l 9 ${bodyH * 0.55} l 9 ${-bodyH * 0.55} z`} fill="#c0392b" stroke={OL} strokeWidth={3} />}
      {kind === "richDad" && <rect x={-bw / 2 + 8} y={-legH - bodyH * 0.45} width={bw - 16} height={bodyH * 0.18} rx={6} fill="#b8652e" />}
      {/* голова */}
      <g transform={`translate(0 ${hy})`}>
        <circle r={head} fill={P.skin} stroke={OL} strokeWidth={5} />
        {kind === "richDad" ? (
          <path d={`M ${-head * 1.05} ${-head * 0.2} Q ${-head} ${-head * 1.15} 0 ${-head * 1.1} Q ${head} ${-head * 1.15} ${head * 1.05} ${-head * 0.2} L ${head * 1.45} ${-head * 0.1} L ${head * 1.4} ${-head * 0.3} Z`} fill="#3d6fd6" stroke={OL} strokeWidth={4} />
        ) : kind === "girl" || kind === "woman" ? (
          <path d={`M ${-head * 1.05} ${head * 0.5} Q ${-head * 1.2} ${-head * 1.2} 0 ${-head * 1.05} Q ${head * 1.2} ${-head * 1.2} ${head * 1.05} ${head * 0.5} L ${head * 0.8} ${-head * 0.3} Q 0 ${-head * 0.7} ${-head * 0.8} ${-head * 0.3} Z`} fill={P.hair} stroke={OL} strokeWidth={4} />
        ) : (
          <path d={`M ${-head * 0.98} ${-head * 0.15} Q ${-head} ${-head * 1.1} 0 ${-head * 1.05} Q ${head} ${-head * 1.1} ${head * 0.98} ${-head * 0.15} Q ${head * 0.5} ${-head * 0.6} 0 ${-head * 0.55} Q ${-head * 0.5} ${-head * 0.6} ${-head * 0.98} ${-head * 0.15} Z`} fill={P.hair} stroke={OL} strokeWidth={4} />
        )}
        <circle cx={-head * 0.35} cy={-head * 0.05} r={head * (mood === "shock" ? 0.16 : 0.11)} fill={OL} />
        <circle cx={head * 0.35} cy={-head * 0.05} r={head * (mood === "shock" ? 0.16 : 0.11)} fill={OL} />
        {kind === "poorDad" && (
          <g fill="none" stroke={OL} strokeWidth={4}>
            <circle cx={-head * 0.35} cy={-head * 0.05} r={head * 0.28} />
            <circle cx={head * 0.35} cy={-head * 0.05} r={head * 0.28} />
            <line x1={-head * 0.07} y1={-head * 0.05} x2={head * 0.07} y2={-head * 0.05} />
          </g>
        )}
        {mood === "angry" && <path d={`M ${-head * 0.55} ${-head * 0.38} L ${-head * 0.15} ${-head * 0.22} M ${head * 0.55} ${-head * 0.38} L ${head * 0.15} ${-head * 0.22}`} stroke={OL} strokeWidth={4} strokeLinecap="round" />}
        {mood === "shock" ? <ellipse cx={0} cy={head * 0.38} rx={head * 0.16} ry={head * 0.22} fill={OL} /> : <path d={mouth} stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />}
        {mood === "happy" && (
          <>
            <circle cx={-head * 0.62} cy={head * 0.2} r={head * 0.13} fill="#ff8fa3" opacity={0.6} />
            <circle cx={head * 0.62} cy={head * 0.2} r={head * 0.13} fill="#ff8fa3" opacity={0.6} />
          </>
        )}
      </g>
      {label && (
        <g transform={`scale(${flip ? -1 : 1} 1)`}>
          <Txt x={0} y={46} size={34 / s} color={C.ink}>
            {label}
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── дом / многоквартирный дом / магазин ──
export const House: React.FC<{ x: number; y: number; s?: number; color?: string; roof?: string; label?: string; big?: boolean }> = ({ x, y, s = 1, color = "#fff4e0", roof = C.coral, label, big }) => {
  const w = big ? 260 : 200;
  const h = big ? 170 : 140;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={8} fill={color} stroke={OL} strokeWidth={6} />
      <path d={`M ${-w / 2 - 22} ${-h + 4} L 0 ${-h - 110} L ${w / 2 + 22} ${-h + 4} Z`} fill={roof} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-26} y={-78} width={52} height={78} rx={6} fill="#b97a45" stroke={OL} strokeWidth={5} />
      <rect x={-w / 2 + 22} y={-h + 30} width={46} height={42} rx={6} fill={C.skyLight} stroke={OL} strokeWidth={5} />
      <rect x={w / 2 - 68} y={-h + 30} width={46} height={42} rx={6} fill={C.skyLight} stroke={OL} strokeWidth={5} />
      {label && (
        <Txt x={0} y={52} size={34}>
          {label}
        </Txt>
      )}
    </g>
  );
};

export const Apartment: React.FC<{ x: number; y: number; s?: number; color?: string; floors?: number }> = ({ x, y, s = 1, color = "#dfeaff", floors = 4 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-floors * 70 - 20} width={220} height={floors * 70 + 20} rx={10} fill={color} stroke={OL} strokeWidth={6} />
    {Array.from({ length: floors * 3 }).map((_, i) => (
      <rect key={i} x={-82 + (i % 3) * 60} y={-floors * 70 + Math.floor(i / 3) * 70} width={44} height={40} rx={5} fill={i % 4 === 1 ? C.goldLight : C.skyLight} stroke={OL} strokeWidth={4} />
    ))}
  </g>
);

export const Car: React.FC<{ x: number; y: number; s?: number; color?: string; shiny?: boolean }> = ({ x, y, s = 1, color = C.sky, shiny }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -130 -30 L -110 -80 Q -100 -100 -70 -100 L 60 -100 Q 90 -100 105 -75 L 130 -40 L 130 -10 L -130 -10 Z" fill={color} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -90 -82 L 40 -82 L 62 -48 L -100 -48 Z" fill="#e8f5ff" stroke={OL} strokeWidth={4} />
    <circle cx={-75} cy={-8} r={28} fill="#3b4566" stroke={OL} strokeWidth={5} />
    <circle cx={80} cy={-8} r={28} fill="#3b4566" stroke={OL} strokeWidth={5} />
    <circle cx={-75} cy={-8} r={10} fill="#c9d0de" />
    <circle cx={80} cy={-8} r={10} fill="#c9d0de" />
    {shiny && <path d="M 120 -120 l 6 14 l 14 6 l -14 6 l -6 14 l -6 -14 l -14 -6 l 14 -6 z" fill={C.gold} />}
  </g>
);

// ── карточки, ярлыки, печати ──
export const Card: React.FC<{ x: number; y: number; w: number; h: number; fill?: string; stroke?: string; r?: number; children?: React.ReactNode }> = ({ x, y, w, h, fill = C.white, stroke = OL, r = 26, children }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={r} fill={OL} opacity={0.12} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth={5} />
    <FitWidth.Provider value={w - 48}>{children}</FitWidth.Provider>
  </g>
);

// плашка-подпись с крупным текстом, ширина по тексту
export const Pill: React.FC<{ x: number; y: number; text: string; fill?: string; color?: string; size?: number; stroke?: string }> = ({ x, y, text, fill = C.white, color = C.ink, size = 36, stroke = OL }) => {
  const w = text.length * size * (text === text.toUpperCase() ? 0.74 : 0.6) + size * 1.3;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.65} rx={size * 0.82} fill={fill} stroke={stroke} strokeWidth={4} />
      <text x={0} y={size * 0.2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );
};

// печать-оговорка (наклонная рамка)
export const Stamp: React.FC<{ x: number; y: number; text: string; k: number; color?: string; size?: number; rot?: number }> = ({ x, y, text, k, color = C.coralDeep, size = 34, rot = -8 }) => {
  if (k <= 0) return null;
  const w = text.length * size * 0.74 + size * 1.4;
  const sc = 1.6 - 0.6 * clamp01(k);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={clamp01(k * 1.5)}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.7} rx={12} fill="#fff" fillOpacity={0.92} stroke={color} strokeWidth={6} />
      <rect x={-w / 2 + 8} y={-size * 0.95 + 8} width={w - 16} height={size * 1.7 - 16} rx={8} fill="none" stroke={color} strokeWidth={2.5} />
      <text x={0} y={size * 0.25} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={size} fill={color} letterSpacing={1}>
        {text}
      </text>
    </g>
  );
};

// облачко реплики
export const Bubble: React.FC<{ x: number; y: number; w: number; h: number; text: string; size?: number; fill?: string; color?: string; tail?: "left" | "right" | "down" | "none" }> = ({ x, y, w, h, text, size = 38, fill = C.white, color = C.ink, tail = "down" }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 + 5} y={-h / 2 + 8} width={w} height={h} rx={h * 0.3} fill={OL} opacity={0.1} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.3} fill={fill} stroke={OL} strokeWidth={5} />
    {tail === "down" && <path d={`M -20 ${h / 2 - 3} L 0 ${h / 2 + 34} L 22 ${h / 2 - 3}`} fill={fill} stroke={OL} strokeWidth={5} strokeLinejoin="round" />}
    {tail === "left" && <path d={`M ${-w / 2 + 3} -14 L ${-w / 2 - 34} 10 L ${-w / 2 + 3} 18`} fill={fill} stroke={OL} strokeWidth={5} strokeLinejoin="round" />}
    {tail === "right" && <path d={`M ${w / 2 - 3} -14 L ${w / 2 + 34} 10 L ${w / 2 - 3} 18`} fill={fill} stroke={OL} strokeWidth={5} strokeLinejoin="round" />}
    <Txt x={0} y={size * 0.35 - (text.split("\n").length - 1) * size * 0.6} size={size} color={color} w={w - 40}>
      {text}
    </Txt>
  </g>
);

// искорка
export const Spark: React.FC<{ x: number; y: number; s?: number; color?: string; opacity?: number }> = ({ x, y, s = 1, color = C.gold, opacity = 1 }) => (
  <path d="M 0 -24 L 6 -6 L 24 0 L 6 6 L 0 24 L -6 6 L -24 0 L -6 -6 Z" fill={color} transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} />
);

// индикатор риска: шкала с цветными сегментами и стрелкой
export const RiskMeter: React.FC<{ x: number; y: number; level: number; k?: number; s?: number; label?: string }> = ({ x, y, level, k = 1, s = 1, label = "риск" }) => {
  const segs = [C.mint, C.yellow, C.orange, C.coral];
  const a = -180 + 180 * clamp01(level) * clamp01(k);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {segs.map((col, i) => {
        const a0 = (Math.PI * (180 + i * 45)) / 180;
        const a1 = (Math.PI * (180 + (i + 1) * 45)) / 180;
        const R = 80;
        return <path key={i} d={`M ${R * Math.cos(a0)} ${R * Math.sin(a0)} A ${R} ${R} 0 0 1 ${R * Math.cos(a1)} ${R * Math.sin(a1)}`} stroke={col} strokeWidth={22} fill="none" />;
      })}
      <line x1={0} y1={0} x2={62 * Math.cos((a * Math.PI) / 180)} y2={62 * Math.sin((a * Math.PI) / 180)} stroke={OL} strokeWidth={8} strokeLinecap="round" />
      <circle r={12} fill={OL} />
      <Txt x={0} y={46} size={30} color={C.inkSoft}>
        {label}
      </Txt>
    </g>
  );
};

// книга (обложка BanaMind, не издательская)
export const BookCover: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-150} y={-200} width={300} height={400} rx={14} fill="#2b3a67" stroke={OL} strokeWidth={6} />
    <rect x={-150} y={-200} width={30} height={400} rx={8} fill="#1f2a44" />
    <rect x={-100} y={-150} width={210} height={300} rx={10} fill="none" stroke={C.gold} strokeWidth={4} />
    <circle cx={5} cy={-70} r={46} fill={C.gold} stroke={C.goldDeep} strokeWidth={6} />
    <text x={5} y={-56} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill={C.goldDeep}>
      ¤
    </text>
    <Txt x={5} y={30} size={30} color="#fff">
      {"Богатый папа,\nбедный папа"}
    </Txt>
    <Txt x={5} y={118} size={22} color={C.goldLight} weight={700}>
      Р. Кийосаки
    </Txt>
  </g>
);

// две колонки (активы / пассивы) — универсальная «полка» со стопками монет
export const Column: React.FC<{ x: number; y: number; w?: number; h?: number; title: string; color: string; fill: number; light: string }> = ({ x, y, w = 240, h = 230, title, color, fill, light }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} rx={18} fill={light} stroke={color} strokeWidth={6} />
    <rect x={-w / 2 + 12} y={-12 - (h - 70) * clamp01(fill)} width={w - 24} height={(h - 70) * clamp01(fill)} rx={10} fill={color} opacity={0.85} />
    <Txt x={0} y={-h + 46} size={34} color={color}>
      {title}
    </Txt>
  </g>
);
