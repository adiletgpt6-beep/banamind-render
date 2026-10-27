// Рисунки «Лаборатории гипотез» — собственные простые формы BanaMind (не иллюстрации издания):
// монета, человечки (основатель, клиенты, команда), карточки, печати-оговорки, поток точек,
// а также лабораторные предметы фильма: капсула-гипотеза, капля сигнала, воздушный шар
// «метрики тщеславия», шестерня полезной метрики, бумажный прототип, экран приложения,
// колба, конвейер, компас курса. Чёткая обводка, плоские светлые цвета — читаемо на телефоне.
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
export type PersonKind = "poorDad" | "richDad" | "kid" | "kid2" | "girl" | "man" | "woman" | "old" | "worker" | "founder" | "boss";
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
  founder: { h: 285, shirt: "#27b4e6", skin: "#e6b48a", hair: "#2b2b2b" },
  boss: { h: 295, shirt: "#5a6b8c", skin: "#f0c39b", hair: "#8a8a8a" },
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

// ══════════════════ предметы «Лаборатории гипотез» ══════════════════

// капсула-гипотеза: прозрачная колба-таблетка, внутри загорается текст гипотезы
export const Capsule: React.FC<{ x: number; y: number; w?: number; h?: number; text?: string; glow?: number; color?: string; rot?: number; size?: number; crack?: number }> = ({
  x,
  y,
  w = 360,
  h = 150,
  text,
  glow = 0,
  color = C.cyan,
  rot = 0,
  size = 34,
  crack = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {glow > 0 && <rect x={-w / 2 - 22} y={-h / 2 - 22} width={w + 44} height={h + 44} rx={(h + 44) / 2} fill={color} opacity={0.18 * glow} />}
    <rect x={-w / 2 + 5} y={-h / 2 + 9} width={w} height={h} rx={h / 2} fill={OL} opacity={0.1} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={C.glass} fillOpacity={0.55} stroke={OL} strokeWidth={5} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={color} fillOpacity={0.1 + 0.18 * glow} />
    {!text && <line x1={0} y1={-h / 2 + 4} x2={0} y2={h / 2 - 4} stroke={OL} strokeWidth={3} opacity={0.35} />}
    <path d={`M ${-w / 2 + h * 0.35} ${-h * 0.28} Q ${-w / 4} ${-h * 0.4} ${w / 6} ${-h * 0.32}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.85} />
    {crack > 0 && <path d={`M ${w * 0.18} ${-h / 2} l -18 ${h * 0.3 * crack} l 22 ${h * 0.18 * crack} l -14 ${h * 0.3 * crack}`} stroke={C.coralDeep} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    {text && (
      <FitWidth.Provider value={w - h * 0.5}>
        <Txt x={0} y={size * 0.35 - (text.split("\n").length - 1) * size * 0.6} size={size} color={glow > 0.4 ? OL : C.inkSoft}>
          {text}
        </Txt>
      </FitWidth.Provider>
    )}
  </g>
);

// капля достоверного сигнала клиента
export const Drop: React.FC<{ x: number; y: number; s?: number; color?: string; shine?: boolean }> = ({ x, y, s = 1, color = C.teal, shine = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -42 C 16 -18 30 -2 30 14 A 30 30 0 0 1 -30 14 C -30 -2 -16 -18 0 -42 Z" fill={color} stroke={OL} strokeWidth={4} />
    {shine && <path d="M -14 6 Q -16 18 -6 26" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.85} />}
  </g>
);

// воздушный шар «метрики тщеславия»: огромный, красивый — и пустой внутри
export const Balloon: React.FC<{ x: number; y: number; r?: number; text?: string; color?: string; t?: number; pop?: number; size?: number; seed?: number }> = ({
  x,
  y,
  r = 120,
  text,
  color = C.pink,
  t = 0,
  pop: p = 0,
  size = 46,
  seed = 0,
}) => {
  const sway = Math.sin(t * 1.3 + seed) * 6;
  if (p >= 1) {
    // лопнул: обрывки и звёздочка
    return (
      <g transform={`translate(${x} ${y})`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d="M 0 0 l 18 -6 l -4 16 z" fill={color} stroke={OL} strokeWidth={3} transform={`rotate(${i * 60 + seed * 7}) translate(${r * 0.6} 0)`} />
        ))}
        <path d="M 0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" fill={C.yellow} stroke={OL} strokeWidth={3} />
      </g>
    );
  }
  const sc = 1 + p * 0.18;
  return (
    <g transform={`translate(${x + sway} ${y}) rotate(${sway * 0.5}) scale(${sc})`}>
      <path d={`M 0 ${r * 1.05} Q ${-14 + sway} ${r * 1.5} ${6} ${r * 2.1}`} stroke={OL} strokeWidth={3} fill="none" />
      <path d={`M -10 ${r * 1.02} L 10 ${r * 1.02} L 0 ${r * 0.94} Z`} fill={color} stroke={OL} strokeWidth={3} />
      <ellipse cx={0} cy={0} rx={r * 0.92} ry={r} fill={color} stroke={OL} strokeWidth={5} />
      <ellipse cx={-r * 0.38} cy={-r * 0.42} rx={r * 0.16} ry={r * 0.28} fill="#fff" opacity={0.6} transform={`rotate(-25 ${-r * 0.38} ${-r * 0.42})`} />
      {text && (
        <FitWidth.Provider value={r * 1.6}>
          <Txt x={0} y={size * 0.35} size={size} color={OL} weight={900}>
            {text}
          </Txt>
        </FitWidth.Provider>
      )}
    </g>
  );
};

// шестерня полезной метрики: маленькая, измеримая, реально поворачивает механизм
export const Gear: React.FC<{ x: number; y: number; r?: number; teeth?: number; rot?: number; color?: string; label?: string; size?: number }> = ({ x, y, r = 70, teeth = 10, rot = 0, color = C.gold, label, size = 26 }) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a0 = (i / (teeth * 2)) * Math.PI * 2;
    const a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
    const R = i % 2 ? r : r * 1.2;
    pts.push(`${(Math.cos(a0) * R).toFixed(1)} ${(Math.sin(a0) * R).toFixed(1)}`, `${(Math.cos(a1) * R).toFixed(1)} ${(Math.sin(a1) * R).toFixed(1)}`);
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform={`rotate(${rot})`}>
        <path d={`M ${pts.join(" L ")} Z`} fill={color} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        <circle r={r * 0.62} fill="#fff" fillOpacity={0.45} stroke={OL} strokeWidth={3} />
        <circle r={r * 0.16} fill={OL} />
      </g>
      {label && (
        <Txt x={0} y={r * 1.2 + size * 1.25} size={size} color={OL}>
          {label}
        </Txt>
      )}
    </g>
  );
};

// бумажный прототип: лист с наброском экрана; k — насколько «ожил» (0 → карандаш, 1 → цвет)
export const Paper: React.FC<{ x: number; y: number; s?: number; rot?: number; k?: number; title?: string }> = ({ x, y, s = 1, rot = 0, k = 0, title }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-150 + 6} y={-200 + 10} width={300} height={400} rx={8} fill={OL} opacity={0.1} />
    <path d="M -150 -200 L 110 -200 L 150 -160 L 150 200 L -150 200 Z" fill={C.cream} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 110 -200 L 110 -160 L 150 -160" fill="#f3e3bd" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    {/* набросок «экрана» */}
    <rect x={-110} y={-150} width={220} height={60} rx={10} fill={k > 0.5 ? C.cyan : "none"} stroke={C.inkSoft} strokeWidth={4} strokeDasharray={k > 0.5 ? "0" : "10 8"} />
    <rect x={-110} y={-70} width={150} height={20} rx={10} fill={k > 0.5 ? C.greyLight : "none"} stroke={C.inkSoft} strokeWidth={3} />
    <rect x={-110} y={-36} width={190} height={20} rx={10} fill={k > 0.5 ? C.greyLight : "none"} stroke={C.inkSoft} strokeWidth={3} />
    <circle cx={-60} cy={50} r={40} fill={k > 0.5 ? C.goldLight : "none"} stroke={C.inkSoft} strokeWidth={4} />
    <circle cx={60} cy={50} r={40} fill={k > 0.5 ? C.tealLight : "none"} stroke={C.inkSoft} strokeWidth={4} />
    <rect x={-80} y={120} width={160} height={50} rx={25} fill={k > 0.5 ? C.teal : "none"} stroke={C.inkSoft} strokeWidth={4} />
    {title && (
      <Txt x={0} y={-160} size={26} color={C.inkSoft}>
        {title}
      </Txt>
    )}
  </g>
);

// экран приложения / сайта (рамка телефона), внутри — свои дети
export const Phone: React.FC<{ x: number; y: number; s?: number; rot?: number; screen?: string; children?: React.ReactNode }> = ({ x, y, s = 1, rot = 0, screen = "#fff", children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-125 + 6} y={-230 + 10} width={250} height={460} rx={38} fill={OL} opacity={0.12} />
    <rect x={-125} y={-230} width={250} height={460} rx={38} fill="#2b3550" stroke={OL} strokeWidth={5} />
    <rect x={-108} y={-200} width={216} height={400} rx={18} fill={screen} />
    <rect x={-30} y={-219} width={60} height={9} rx={4.5} fill="#55607c" />
    {children}
  </g>
);

// колба / лабораторный стакан с жидкостью
export const Flask: React.FC<{ x: number; y: number; s?: number; level?: number; color?: string; t?: number; bubbles?: boolean }> = ({ x, y, s = 1, level = 0.5, color = C.teal, t = 0, bubbles = true }) => {
  const top = 60 - 120 * clamp01(level);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id={`flask${Math.round(x)}${Math.round(y)}`}>
          <path d="M -26 -110 L 26 -110 L 26 -40 L 80 70 Q 86 86 70 86 L -70 86 Q -86 86 -80 70 L -26 -40 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#flask${Math.round(x)}${Math.round(y)})`}>
        <rect x={-100} y={top} width={200} height={200} fill={color} opacity={0.8} />
        {bubbles &&
          [0, 1, 2, 3].map((i) => {
            const by = 80 - ((t * 60 + i * 37) % 130);
            return by > top ? <circle key={i} cx={-30 + i * 20} cy={by} r={5 + (i % 2) * 3} fill="#fff" opacity={0.7} /> : null;
          })}
      </g>
      <path d="M -26 -110 L 26 -110 L 26 -40 L 80 70 Q 86 86 70 86 L -70 86 Q -86 86 -80 70 L -26 -40 Z" fill="none" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-34} y={-122} width={68} height={16} rx={8} fill="#fff" stroke={OL} strokeWidth={4} />
      <path d="M -12 -90 L -12 -46" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
    </g>
  );
};

// компас курса (смена направления — вираж; стрелка поворачивается на angle градусов)
export const Compass: React.FC<{ x: number; y: number; r?: number; angle?: number }> = ({ x, y, r = 90, angle = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 8} fill={OL} opacity={0.1} transform="translate(5 8)" />
    <circle r={r} fill="#fff" stroke={OL} strokeWidth={6} />
    <circle r={r * 0.8} fill="none" stroke={C.violetLight} strokeWidth={6} />
    {[0, 90, 180, 270].map((a) => (
      <line key={a} x1={0} y1={-r * 0.92} x2={0} y2={-r * 0.74} stroke={OL} strokeWidth={5} transform={`rotate(${a})`} />
    ))}
    <g transform={`rotate(${angle})`}>
      <path d={`M 0 ${-r * 0.7} L ${r * 0.16} 0 L 0 ${r * 0.7} L ${-r * 0.16} 0 Z`} fill={C.violet} stroke={OL} strokeWidth={4} />
      <path d={`M 0 ${-r * 0.7} L ${r * 0.16} 0 L ${-r * 0.16} 0 Z`} fill={C.coral} stroke={OL} strokeWidth={4} />
    </g>
    <circle r={r * 0.09} fill={OL} />
  </g>
);

// коробка-деталь на конвейере
export const Box: React.FC<{ x: number; y: number; s?: number; color?: string; label?: string; bad?: boolean }> = ({ x, y, s = 1, color = C.kraft, label, bad }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-40} y={-80} width={80} height={80} rx={8} fill={color} stroke={OL} strokeWidth={4} />
    <path d="M -40 -56 L 40 -56" stroke={OL} strokeWidth={3} opacity={0.35} />
    {label && (
      <Txt x={0} y={-28} size={26} color={OL}>
        {label}
      </Txt>
    )}
    {bad && (
      <g stroke={C.red} strokeWidth={7} strokeLinecap="round">
        <line x1={-20} y1={-60} x2={20} y2={-20} />
        <line x1={20} y1={-60} x2={-20} y2={-20} />
      </g>
    )}
  </g>
);

// лента конвейера; t двигает ролики
export const Belt: React.FC<{ x1: number; x2: number; y: number; t: number; speed?: number }> = ({ x1, x2, y, t, speed = 1 }) => (
  <g>
    <rect x={x1} y={y} width={x2 - x1} height={34} rx={17} fill="#59647f" stroke={OL} strokeWidth={4} />
    {Array.from({ length: Math.floor((x2 - x1) / 60) }).map((_, i) => {
      const off = (t * 80 * speed) % 60;
      const xx = x1 + 20 + ((i * 60 + off) % (x2 - x1 - 30));
      return <line key={i} x1={xx} y1={y + 6} x2={xx - 12} y2={y + 28} stroke="#8a95b0" strokeWidth={4} />;
    })}
    {[x1 + 17, x2 - 17].map((cx, i) => (
      <circle key={i} cx={cx} cy={y + 17} r={13} fill="#c9cfdd" stroke={OL} strokeWidth={3} />
    ))}
    <rect x={x1 + 30} y={y + 34} width={16} height={60} fill="#7a849c" />
    <rect x={x2 - 46} y={y + 34} width={16} height={60} fill="#7a849c" />
  </g>
);

// книга-предмет обсуждения (рисунок BanaMind, не издательская обложка)
export const BookCover: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-150 + 8} y={-200 + 12} width={300} height={400} rx={14} fill={OL} opacity={0.14} />
    <rect x={-150} y={-200} width={300} height={400} rx={14} fill="#f4f7fb" stroke={OL} strokeWidth={6} />
    <rect x={-150} y={-200} width={30} height={400} rx={8} fill={C.cyanDeep} />
    <g transform="translate(15 -80)">
      <path d="M -16 -40 L 16 -40 L 16 -12 L 44 36 Q 48 46 38 46 L -38 46 Q -48 46 -44 36 L -16 -12 Z" fill={C.cyanLight} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -30 22 L 30 22 L 40 40 Q 40 44 36 44 L -36 44 Q -40 44 -40 40 Z" fill={C.teal} />
    </g>
    <Txt x={15} y={40} size={36} color={OL} weight={900}>
      {"Бизнес\nс нуля"}
    </Txt>
    <Txt x={15} y={150} size={26} color={C.inkSoft} weight={800}>
      Эрик Рис
    </Txt>
  </g>
);

// простой график: линия по точкам 0…1 в рамке w×h; k — сколько нарисовано
export const MiniChart: React.FC<{ x: number; y: number; w?: number; h?: number; pts: number[]; k?: number; color?: string; label?: string; bars?: boolean }> = ({ x, y, w = 420, h = 260, pts, k = 1, color = C.teal, label, bars }) => {
  const n = pts.length;
  const px = (i: number) => -w / 2 + 40 + ((w - 80) * i) / Math.max(1, n - 1);
  const py = (v: number) => h / 2 - 30 - (h - 70) * v;
  const shown = Math.max(1, Math.round(n * clamp01(k)));
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 + 5} y={-h / 2 + 8} width={w} height={h} rx={22} fill={OL} opacity={0.1} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={22} fill="#fff" stroke={OL} strokeWidth={5} />
      <line x1={-w / 2 + 30} y1={h / 2 - 30} x2={w / 2 - 25} y2={h / 2 - 30} stroke={C.grey} strokeWidth={4} />
      <line x1={-w / 2 + 30} y1={h / 2 - 30} x2={-w / 2 + 30} y2={-h / 2 + 25} stroke={C.grey} strokeWidth={4} />
      {bars
        ? pts.slice(0, shown).map((v, i) => <rect key={i} x={px(i) - 16} y={py(v)} width={32} height={h / 2 - 30 - py(v)} rx={6} fill={color} stroke={OL} strokeWidth={3} />)
        : (
          <polyline points={pts.slice(0, shown).map((v, i) => `${px(i)},${py(v)}`).join(" ")} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        )}
      {!bars && pts.slice(0, shown).map((v, i) => <circle key={i} cx={px(i)} cy={py(v)} r={8} fill="#fff" stroke={color} strokeWidth={5} />)}
      {label && (
        <Txt x={0} y={-h / 2 - 22} size={30} color={OL}>
          {label}
        </Txt>
      )}
    </g>
  );
};
