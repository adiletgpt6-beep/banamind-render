// Рисунки фильма BM-015 «Стив Джобс»: условные фигуры людей (не портреты — у каждой
// только табличка с именем), обобщённые устройства без логотипов и фирменной графики,
// мастерская, гараж, плата, окошки интерфейса, пульт кнопок, дверь, витрина.
// Всё — оригинальные простые векторные формы фильма.
import React from "react";
import { C, FONT } from "../theme";
import { clamp01, Txt, wob } from "./kit";

export const OL = C.ink; // контур

// Где рисовать схему, чтобы не закрывать банана: смещение панели 1280 px по X.
export const panelX = (host: unknown) => {
  if (host === "left") return 600;
  if (host === "right" || host === "peek") return 40;
  return 320;
};

export const Stage: React.FC<{ host: unknown; children: React.ReactNode; y?: number }> = ({ host, children, y = 0 }) => (
  <g transform={`translate(${panelX(host)} ${y})`}>{children}</g>
);

// ── условная фигура человека: круг-голова, корпус, руки; табличка с именем ──
export type Gesture = "stand" | "point" | "arms" | "think" | "sad" | "cheer" | "hold";
export const Person: React.FC<{
  x: number;
  y: number;
  s?: number;
  color?: string;
  name?: string;
  t?: number;
  seed?: number;
  gesture?: Gesture;
  flip?: boolean;
  opacity?: number;
  tagColor?: string;
}> = ({ x, y, s = 1, color = C.steel, name, t = 0, seed = 0, gesture = "stand", flip = false, opacity = 1, tagColor = C.white }) => {
  const bob = wob(t * 0.8, seed, 3);
  const arm = (side: 1 | -1) => {
    // углы рук для жестов (side: 1 — правая)
    let a = 12;
    let e = 10;
    if (gesture === "point" && side === 1) [a, e] = [80, 0];
    if (gesture === "arms") [a, e] = [55, 30];
    if (gesture === "think" && side === 1) [a, e] = [30, -150];
    if (gesture === "sad") [a, e] = [6, 4];
    if (gesture === "cheer") [a, e] = [150, 10];
    if (gesture === "hold") [a, e] = [40, -70];
    const r1 = (a * Math.PI) / 180;
    const ex = side * Math.sin(r1) * 52;
    const ey = Math.cos(r1) * 52;
    const r2 = ((a + e) * Math.PI) / 180;
    const hx = ex + side * Math.sin(r2) * 48;
    const hy = ey + Math.cos(r2) * 48;
    return (
      <g transform={`translate(${side * 46} -150)`}>
        <path d={`M 0 0 L ${ex} ${ey} L ${hx} ${hy}`} stroke={color} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={hx} cy={hy} r={13} fill="#f1d3b5" stroke={OL} strokeWidth={3} />
      </g>
    );
  };
  const headY = gesture === "sad" ? -228 : -238;
  const k = s * 1.45; // фигуры крупнее: читаются на телефоне
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -k : k} ${k})`} opacity={opacity}>
      <ellipse cx={0} cy={4} rx={70} ry={12} fill="#000" opacity={0.08} />
      <rect x={-34} y={-70} width={26} height={70} rx={12} fill={C.steelDark} />
      <rect x={8} y={-70} width={26} height={70} rx={12} fill={C.steelDark} />
      {arm(-1)}
      {arm(1)}
      <path d="M -54 -60 Q -60 -170 -40 -182 L 40 -182 Q 60 -170 54 -60 Z" fill={color} stroke={OL} strokeWidth={4} />
      <circle cx={0} cy={headY} r={46} fill="#f1d3b5" stroke={OL} strokeWidth={4} />
      <circle cx={-15} cy={headY - 4} r={5} fill={OL} />
      <circle cx={15} cy={headY - 4} r={5} fill={OL} />
      <path d={gesture === "sad" ? `M -14 ${headY + 22} Q 0 ${headY + 12} 14 ${headY + 22}` : `M -14 ${headY + 15} Q 0 ${headY + 25} 14 ${headY + 15}`} stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />
      {name && (
        <g transform={`scale(${flip ? -1 : 1} 1)`}>
          <rect x={-name.length * 13 - 18} y={-124} width={name.length * 26 + 36} height={50} rx={25} fill={tagColor} stroke={OL} strokeWidth={3} />
          <text x={0} y={-89} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={31} fill={OL}>
            {name}
          </text>
        </g>
      )}
    </g>
  );
};

// ── плата с микросхемами (инженерная работа) ──
export const Board: React.FC<{ x: number; y: number; s?: number; t?: number; glow?: number }> = ({ x, y, s = 1, t = 0, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-170} y={-110} width={340} height={220} rx={14} fill={C.board} stroke={OL} strokeWidth={5} />
    {Array.from({ length: 9 }).map((_, i) => (
      <path key={i} d={`M ${-150 + i * 36} -96 L ${-150 + i * 36} ${-40 + (i % 3) * 30} L ${-120 + i * 30} ${90}`} stroke={C.copper} strokeWidth={3} fill="none" opacity={0.75} />
    ))}
    {[
      [-100, -40, 80, 44],
      [10, -60, 110, 50],
      [-60, 30, 60, 40],
      [40, 30, 90, 46],
    ].map(([cx, cy, w, h], i) => (
      <g key={i}>
        <rect x={cx} y={cy} width={w} height={h} rx={5} fill="#1b2232" />
        {Array.from({ length: Math.floor(w / 14) }).map((_, j) => (
          <rect key={j} x={cx + 6 + j * 14} y={cy - 6} width={5} height={6} fill="#cfd6e0" />
        ))}
      </g>
    ))}
    <circle cx={140} cy={-80} r={10} fill={glow > 0 ? C.yellow : "#7a2a2a"} opacity={0.6 + 0.4 * glow * (0.6 + 0.4 * Math.sin(t * 8))} />
  </g>
);

// ── экран с «окошками» (графический интерфейс, обобщённо) ──
export const Windows: React.FC<{ x: number; y: number; w: number; h: number; k: number; t?: number; dark?: boolean }> = ({ x, y, w, h, k, t = 0, dark = false }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={0} width={w} height={h} rx={8} fill={dark ? C.screen : "#f4f7fb"} />
    {k > 0 &&
      [0, 1, 2].map((i) => {
        const kk = clamp01(k * 3 - i);
        if (kk <= 0) return null;
        const ww = w * 0.48;
        const hh = h * 0.42;
        const wx = w * 0.06 + i * w * 0.2;
        const wy = h * 0.12 + i * h * 0.16;
        return (
          <g key={i} opacity={kk} transform={`translate(${wx} ${wy + (1 - kk) * 20})`}>
            <rect width={ww} height={hh} rx={5} fill={C.white} stroke={OL} strokeWidth={3} />
            <rect width={ww} height={hh * 0.18} rx={5} fill={[C.sky, C.coral, C.green][i]} />
            <rect x={ww * 0.08} y={hh * 0.34} width={ww * 0.6} height={6} rx={3} fill={C.concreteDark} />
            <rect x={ww * 0.08} y={hh * 0.52} width={ww * 0.4} height={6} rx={3} fill={C.concreteDark} />
          </g>
        );
      })}
    {k > 0.6 && (
      <path
        transform={`translate(${w * 0.7 + Math.sin(t * 1.3) * w * 0.12} ${h * 0.62 + Math.cos(t * 1.1) * h * 0.1})`}
        d="M 0 0 L 0 26 L 7 20 L 12 31 L 17 29 L 12 18 L 21 18 Z"
        fill={C.white}
        stroke={OL}
        strokeWidth={2.5}
      />
    )}
  </g>
);

// ── обобщённые устройства (без логотипов) ──
export const Kit: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-160} y={-30} width={320} height={70} rx={8} fill={C.wood} stroke={OL} strokeWidth={5} />
    <rect x={-130} y={-80} width={260} height={56} rx={6} fill={C.board} stroke={OL} strokeWidth={4} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-110 + i * 60} y={-70} width={40} height={20} rx={3} fill="#1b2232" />
    ))}
  </g>
);

export const BeigeBox: React.FC<{ x: number; y: number; s?: number; t?: number; on?: number }> = ({ x, y, s = 1, t = 0, on = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* монитор */}
    <rect x={-120} y={-260} width={240} height={180} rx={18} fill={C.beige} stroke={OL} strokeWidth={5} />
    <rect x={-96} y={-238} width={192} height={134} rx={10} fill={C.screen} />
    {on > 0 &&
      [0, 1, 2, 3].map((i) => (
        <rect key={i} x={-80} y={-222 + i * 26} width={(60 + ((i * 47) % 90)) * clamp01(on * 4 - i)} height={10} rx={3} fill={C.green} opacity={0.9} />
      ))}
    {on > 0 && <rect x={-80 + ((t * 2) % 1 > 0.5 ? 0 : 0)} y={-118} width={14} height={10} fill={C.green} opacity={Math.sin(t * 6) > 0 ? 1 : 0} />}
    {/* корпус с клавиатурой */}
    <path d="M -190 -40 L 190 -40 L 210 40 L -210 40 Z" fill={C.beige} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-150} y={-70} width={300} height={34} rx={6} fill={C.beigeDark} stroke={OL} strokeWidth={4} />
    {Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x={-160 + i * 32} y={-14} width={26} height={16} rx={3} fill={C.beigeDark} />
    ))}
    {Array.from({ length: 9 }).map((_, i) => (
      <rect key={i} x={-145 + i * 32} y={10} width={26} height={16} rx={3} fill={C.beigeDark} />
    ))}
  </g>
);

// компактный «всё-в-одном» с маленьким экраном и ручкой-нишей сверху
export const Compact: React.FC<{ x: number; y: number; s?: number; t?: number; k?: number; face?: boolean }> = ({ x, y, s = 1, t = 0, k = 1, face = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -120 -330 L 120 -330 Q 136 -330 136 -314 L 136 -20 L 120 0 L -120 0 L -136 -20 L -136 -314 Q -136 -330 -120 -330 Z" fill={C.beige} stroke={OL} strokeWidth={5} />
    <rect x={-96} y={-300} width={192} height={150} rx={12} fill={C.screen} />
    <rect x={-70} y={-326} width={140} height={10} rx={5} fill={C.beigeDark} />
    {face && k > 0 && (
      <g transform={`translate(0 -225) scale(${k})`}>
        <rect x={-34} y={-42} width={68} height={84} rx={12} fill="#f4f7fb" />
        <circle cx={-12} cy={-12} r={4} fill={OL} />
        <circle cx={12} cy={-12} r={4} fill={OL} />
        <path d={`M -14 14 Q 0 ${24 + Math.sin(t * 3) * 3} 14 14`} stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    )}
    <rect x={30} y={-90} width={70} height={10} rx={5} fill={C.beigeDark} />
    <rect x={-100} y={-60} width={50} height={6} rx={3} fill={C.beigeDark} />
  </g>
);

export const Cube: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -110 -60 L 0 -120 L 110 -60 L 0 0 Z" fill="#3a3f4c" stroke={OL} strokeWidth={4} />
    <path d="M -110 -60 L 0 0 L 0 130 L -110 70 Z" fill="#1d212b" stroke={OL} strokeWidth={4} />
    <path d="M 110 -60 L 0 0 L 0 130 L 110 70 Z" fill="#2a2f3b" stroke={OL} strokeWidth={4} />
  </g>
);

// яркий полупрозрачный «всё-в-одном» (цвет задаётся)
export const ColorPod: React.FC<{ x: number; y: number; s?: number; color?: string; t?: number }> = ({ x, y, s = 1, color = C.teal, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -150 -10 Q -170 -300 0 -310 Q 170 -300 150 -10 Q 0 30 -150 -10 Z" fill={color} opacity={0.55} stroke={OL} strokeWidth={5} />
    <path d="M -120 -40 Q -135 -270 0 -280 Q 135 -270 120 -40 Z" fill={color} opacity={0.35} />
    <rect x={-100} y={-260} width={200} height={150} rx={14} fill={C.screen} stroke={OL} strokeWidth={4} />
    <rect x={-80} y={-240} width={160} height={14} rx={7} fill={C.screenGlow} opacity={0.4 + 0.3 * Math.sin(t * 2)} />
    <path d="M -50 -300 Q 0 -340 50 -300" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
    <rect x={-70} y={-12} width={140} height={22} rx={10} fill={color} stroke={OL} strokeWidth={4} />
  </g>
);

export const Player: React.FC<{ x: number; y: number; s?: number; t?: number; spin?: number }> = ({ x, y, s = 1, t = 0, spin = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-120} width={140} height={240} rx={22} fill={C.white} stroke={OL} strokeWidth={5} />
    <rect x={-52} y={-102} width={104} height={80} rx={8} fill={C.screen} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-42} y={-92 + i * 22} width={70 - i * 12} height={8} rx={4} fill={C.screenGlow} opacity={0.7} />
    ))}
    <circle cx={0} cy={50} r={48} fill="#eef1f5" stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={50} r={16} fill={C.white} stroke={OL} strokeWidth={3} />
    {spin > 0 && <circle cx={Math.cos(t * 3) * 32} cy={50 + Math.sin(t * 3) * 32} r={8} fill={C.yellowDeep} opacity={spin} />}
  </g>
);

export const Phone: React.FC<{ x: number; y: number; s?: number; t?: number; k?: number; keys?: number }> = ({ x, y, s = 1, t = 0, k = 1, keys = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-90} y={-180} width={180} height={360} rx={30} fill="#1d212b" stroke={OL} strokeWidth={5} />
    <rect x={-76} y={-150} width={152} height={290} rx={10} fill={C.screen} />
    {keys > 0 &&
      Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-60 + (i % 3) * 44} y={-10 + Math.floor(i / 3) * 34} width={36} height={26} rx={6} fill={C.concreteDark} opacity={keys} />
      ))}
    {k > 0 &&
      Array.from({ length: 12 }).map((_, i) => {
        const kk = clamp01(k * 12 - i);
        return <rect key={i} x={-62 + (i % 3) * 46} y={-136 + Math.floor(i / 3) * 52} width={34} height={34} rx={9} fill={[C.coral, C.sky, C.green, C.yellow, C.violet, C.teal][i % 6]} opacity={kk * (1 - keys)} transform={`scale(${0.6 + 0.4 * kk})`} />;
      })}
    <circle cx={0} cy={160} r={10} fill="none" stroke={C.concreteDark} strokeWidth={3} />
    {k > 0.9 && <circle cx={20 + Math.sin(t * 2) * 30} cy={40 + Math.cos(t * 1.7) * 40} r={16} fill={C.white} opacity={0.35} />}
  </g>
);

export const Tablet: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-160} y={-210} width={320} height={420} rx={28} fill="#1d212b" stroke={OL} strokeWidth={5} />
    <rect x={-140} y={-188} width={280} height={360} rx={8} fill={C.screen} />
    <rect x={-120} y={-168} width={240} height={150} rx={8} fill={C.sky} opacity={0.6} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-120} y={0 + i * 36} width={240 - i * 40} height={14} rx={7} fill={C.screenGlow} opacity={0.5} />
    ))}
    <circle cx={60 + Math.sin(t) * 30} cy={-100} r={18} fill={C.yellow} opacity={0.5} />
    <circle cx={0} cy={192} r={9} fill="none" stroke={C.concreteDark} strokeWidth={3} />
  </g>
);

// ── мастерская: забор/шкаф с лицевой и обратной стороной ──
export const Fence: React.FC<{ x: number; y: number; s?: number; back?: number; good?: number }> = ({ x, y, s = 1, back = 0, good = 1 }) => {
  // back 0 → видна лицевая сторона, 1 → забор «повернулся», видна изнанка
  const sx = Math.cos(back * Math.PI);
  const showBack = back > 0.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * Math.max(0.04, Math.abs(sx))} ${s})`}>
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={`M ${-300 + i * 86} -10 L ${-300 + i * 86} -250 L ${-257 + i * 86} -290 L ${-214 + i * 86} -250 L ${-214 + i * 86} -10 Z`} fill={showBack ? C.woodLight : C.wood} stroke={OL} strokeWidth={4} />
      ))}
      {showBack &&
        [-200, -100].map((yy, i) => (
          <rect key={i} x={-310} y={yy} width={616} height={26} rx={6} fill={good > 0.5 ? C.wood : "#8a6a4a"} stroke={OL} strokeWidth={4} transform={good > 0.5 ? "" : `rotate(${i ? 3 : -4})`} />
        ))}
      {showBack &&
        good > 0.5 &&
        [-187, -87].map((yy) =>
          [-250, -80, 90, 250].map((xx) => <circle key={`${yy}${xx}`} cx={xx} cy={yy} r={5} fill={C.steelDark} />),
        )}
    </g>
  );
};

export const Bench: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 900 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={0} width={w} height={34} rx={8} fill={C.woodDark} />
    <rect x={-w / 2 + 30} y={34} width={30} height={160} fill={C.woodDark} />
    <rect x={w / 2 - 60} y={34} width={30} height={160} fill={C.woodDark} />
  </g>
);

// ── гараж: ворота поднимаются ──
export const Garage: React.FC<{ x: number; y: number; s?: number; open: number; t?: number; children?: React.ReactNode }> = ({ x, y, s = 1, open, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -380 -360 L 0 -520 L 380 -360 Z" fill={C.concreteDark} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-360} y={-360} width={720} height={360} fill={C.concrete} stroke={OL} strokeWidth={5} />
    <rect x={-300} y={-320} width={600} height={320} fill="#3a4253" />
    <g>{children}</g>
    <g transform={`translate(0 ${-open * 300})`}>
      <clipPath id="garageDoor">
        <rect x={-300} y={-320} width={600} height={320} />
      </clipPath>
    </g>
    <rect x={-300} y={-320} width={600} height={320 * (1 - open)} fill={C.white} stroke={OL} strokeWidth={4} />
    {Array.from({ length: 5 }).map((_, i) =>
      (i + 1) * 64 < 320 * (1 - open) ? <line key={i} x1={-300} y1={-320 + (i + 1) * 64} x2={300} y2={-320 + (i + 1) * 64} stroke={C.concreteDark} strokeWidth={4} /> : null,
    )}
  </g>
);

// ── пульт: сетка кнопок, часть гаснет ──
export const ButtonGrid: React.FC<{ x: number; y: number; cols: number; rows: number; keep: (i: number) => boolean; off: number; t: number; size?: number }> = ({ x, y, cols, rows, keep, off, t, size = 46 }) => {
  const g = size * 1.3;
  return (
    <g transform={`translate(${x - (cols * g) / 2} ${y - (rows * g) / 2})`}>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const k = keep(i);
        const cx = (i % cols) * g;
        const cy = Math.floor(i / cols) * g;
        const fade = k ? 1 : 1 - clamp01(off * 1.4 - ((i * 37) % 100) / 250);
        if (fade <= 0.01) return null;
        const blink = 0.55 + 0.45 * Math.sin(t * 3 + i * 1.7);
        const col = k ? C.yellow : [C.coral, C.sky, C.green, C.violet, C.neonPink, C.teal][i % 6];
        return (
          <g key={i} opacity={fade} transform={`translate(${cx} ${cy + (1 - fade) * 30})`}>
            <rect width={size} height={size} rx={size * 0.24} fill={col} opacity={k ? 1 : 0.5 + 0.5 * blink} stroke={OL} strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );
};

// ── дверь кабинета ──
export const Door: React.FC<{ x: number; y: number; s?: number; close: number; label?: string }> = ({ x, y, s = 1, close, label }) => {
  const w = 300 * (1 - 0.82 * (1 - close));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-170} y={-500} width={340} height={500} rx={8} fill="#2b3245" />
      <rect x={-160} y={-490} width={320} height={490} fill="#ffe9b0" opacity={0.85 * (1 - close)} />
      <rect x={-150} y={-480} width={w} height={480} fill={C.woodLight} stroke={OL} strokeWidth={5} />
      <circle cx={-150 + w - 26} cy={-240} r={11} fill={C.yellowDeep} stroke={OL} strokeWidth={3} />
      {label && close > 0.8 && (
        <g>
          <rect x={-110} y={-430} width={220} height={60} rx={8} fill={C.white} stroke={OL} strokeWidth={3} />
          <text x={0} y={-390} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={OL}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

// ── карточка-цитата с подписью (короткие цитаты книги с атрибуцией) ──
export const QuoteCard: React.FC<{ x: number; y: number; w: number; text: string; who: string; k: number; dark?: boolean; size?: number }> = ({ x, y, w, text, who, k, dark = false, size = 46 }) => {
  if (k <= 0) return null;
  const lines = text.split("\n");
  const h = lines.length * size * 1.22 + 110;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 30})`} opacity={clamp01(k * 1.4)}>
      <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={30} fill="#000" opacity={0.1} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} fill={dark ? C.ink : C.white} />
      <text x={-w / 2 + 34} y={-h / 2 + 86} fontFamily="Georgia, 'PT Serif', serif" fontSize={110} fill={C.yellowDeep} opacity={0.7}>
        «
      </text>
      <Txt x={0} y={-h / 2 + 60 + size * 0.4} size={size} color={dark ? C.white : C.ink}>
        {text}
      </Txt>
      <Txt x={w / 2 - 36} y={h / 2 - 28} size={28} anchor="end" weight={800} color={dark ? C.yellow : C.inkSoft}>
        {who}
      </Txt>
    </g>
  );
};

// ── «две чаши» сравнения ──
export const Scale: React.FC<{ x: number; y: number; tilt: number; left: React.ReactNode; right: React.ReactNode }> = ({ x, y, tilt, left, right }) => {
  const a = tilt * 12;
  const r = (a * Math.PI) / 180;
  const lx = -300 * Math.cos(r);
  const ly = -300 * Math.sin(r);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M -40 300 L 40 300 L 10 0 L -10 0 Z" fill={C.steelDark} />
      <line x1={lx} y1={ly} x2={-lx} y2={-ly} stroke={C.steelDark} strokeWidth={14} strokeLinecap="round" />
      <circle r={18} fill={C.yellowDeep} stroke={OL} strokeWidth={4} />
      <g transform={`translate(${lx} ${ly})`}>
        <line x1={0} y1={0} x2={-80} y2={110} stroke={C.steel} strokeWidth={4} />
        <line x1={0} y1={0} x2={80} y2={110} stroke={C.steel} strokeWidth={4} />
        <path d="M -120 110 Q 0 170 120 110 Z" fill={C.concrete} stroke={OL} strokeWidth={4} />
        <g transform="translate(0 80)">{left}</g>
      </g>
      <g transform={`translate(${-lx} ${-ly})`}>
        <line x1={0} y1={0} x2={-80} y2={110} stroke={C.steel} strokeWidth={4} />
        <line x1={0} y1={0} x2={80} y2={110} stroke={C.steel} strokeWidth={4} />
        <path d="M -120 110 Q 0 170 120 110 Z" fill={C.concrete} stroke={OL} strokeWidth={4} />
        <g transform="translate(0 80)">{right}</g>
      </g>
    </g>
  );
};

// ── книжка Айзексона (условная обложка фильма, не обложка издательства) ──
export const BookCover: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y + wob(t, 2, 5)}) rotate(${wob(t * 0.5, 1, 1.5)}) scale(${s})`}>
    <rect x={-170} y={-230} width={340} height={460} rx={18} fill={C.white} stroke={OL} strokeWidth={5} />
    <rect x={-156} y={-230} width={14} height={460} fill="#000" opacity={0.1} />
    <text y={-120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={C.ink} letterSpacing={2}>
      СТИВ
    </text>
    <text y={-58} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={C.ink} letterSpacing={2}>
      ДЖОБС
    </text>
    <rect x={-110} y={-20} width={220} height={4} fill={C.yellowDeep} />
    <circle cy={70} r={60} fill="none" stroke={C.concreteDark} strokeWidth={4} />
    <text y={84} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.concreteDark}>
      ?
    </text>
    <text y={196} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.inkSoft}>
      Уолтер Айзексон
    </text>
  </g>
);

// ── мелочи ──
export const Note: React.FC<{ x: number; y: number; text: string; k: number; color?: string; rot?: number; w?: number; size?: number }> = ({ x, y, text, k, color = "#fff6c4", rot = 0, w, size = 30 }) => {
  if (k <= 0) return null;
  const lines = text.split("\n");
  const ww = w ?? Math.max(...lines.map((l) => l.length)) * size * 0.56 + 50;
  const hh = lines.length * size * 1.2 + 34;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.7 + 0.3 * k})`} opacity={clamp01(k * 1.5)}>
      <rect x={-ww / 2 + 4} y={-hh / 2 + 6} width={ww} height={hh} rx={8} fill="#000" opacity={0.1} />
      <rect x={-ww / 2} y={-hh / 2} width={ww} height={hh} rx={8} fill={color} />
      <Txt x={0} y={-hh / 2 + 17 + size * 0.9} size={size} weight={800}>
        {text}
      </Txt>
    </g>
  );
};

export const Coin: React.FC<{ x: number; y: number; r?: number; label?: string }> = ({ x, y, r = 40, label = "" }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={C.yellow} stroke={OL} strokeWidth={4} />
    <circle r={r * 0.72} fill="none" stroke={C.yellowDeep} strokeWidth={4} />
    {label && (
      <text y={r * 0.22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.62} fill={OL}>
        {label}
      </text>
    )}
  </g>
);

export const Heart: React.FC<{ x: number; y: number; s?: number; color?: string; crack?: number }> = ({ x, y, s = 1, color = C.coral, crack = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 40 C -70 -10 -60 -70 -20 -70 C 0 -70 0 -50 0 -46 C 0 -50 0 -70 20 -70 C 60 -70 70 -10 0 40 Z" fill={color} stroke={OL} strokeWidth={4} />
    {crack > 0 && <path d="M 0 -46 L -8 -20 L 8 -4 L -4 18" stroke={OL} strokeWidth={4} fill="none" strokeDasharray={90} strokeDashoffset={90 * (1 - clamp01(crack))} />}
  </g>
);
