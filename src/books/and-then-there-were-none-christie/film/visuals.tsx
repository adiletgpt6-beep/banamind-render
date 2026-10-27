// Визуалы сцен BM-017 (1920×1080, внутри общего <svg>). Каждая сцена получает
// t — время от начала сцены, beats/ends — начало/конец реплик (с), p — параметры.
// Банан стоит поверх (Host), поэтому важное держим в стороне от его места.
import React from "react";
import { Easing, interpolate } from "remotion";
import { DinnerTable, Figurine, Lamp, OL, PAL, ROLES, Scales, Thread } from "../draw";

type VP = { t: number; dur: number; beats: number[]; ends: number[]; p: Record<string, unknown> };
const ease = Easing.bezier(0.45, 0, 0.25, 1);
const k01 = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

// медленный «наезд камеры» вокруг точки (cx, cy)
const Push: React.FC<{ t: number; dur: number; cx: number; cy: number; from?: number; to?: number; children: React.ReactNode }> = ({ t, dur, cx, cy, from = 1, to = 1.07, children }) => {
  const s = from + (to - from) * k01(t, 0, dur);
  return <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>;
};

const Wall: React.FC<{ warm?: number }> = ({ warm = 1 }) => (
  <g>
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a2433" />
        <stop offset="1" stopColor="#14121a" />
      </linearGradient>
      <radialGradient id="lampLight" cx="0.5" cy="0.35" r="0.6">
        <stop offset="0" stopColor="#fff1c4" stopOpacity={0.55 * warm} />
        <stop offset="1" stopColor="#fff1c4" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#wall)" />
    {Array.from({ length: 13 }).map((_, i) => (
      <rect key={i} x={i * 160} y={0} width={4} height={640} fill="#000" opacity={0.18} />
    ))}
    <rect x={0} y={640} width={1920} height={440} fill="#1b1410" />
    <rect width={1920} height={1080} fill="url(#lampLight)" />
  </g>
);

// Рамка со считалкой — только намёк строками (текст не воспроизводится).
const RhymeFrame: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    <rect x={-110} y={-140} width={220} height={280} rx={6} fill="#6b4a2a" stroke={OL} strokeWidth={5} />
    <rect x={-90} y={-120} width={180} height={240} fill={PAL.paper} />
    {Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x={-70} y={-100 + i * 22} width={i % 3 === 2 ? 90 : 140} height={7} rx={3} fill="#b9ad94" />
    ))}
  </g>
);

// ── p1: ужин и десять фигурок ──
const Dinner: React.FC<VP> = ({ t, dur, beats }) => {
  const b1 = beats[1] ?? dur * 0.4;
  return (
    <Push t={t} dur={dur} cx={760} cy={560}>
      <Wall />
      <RhymeFrame x={330} y={300} k={k01(t, b1 + 3.2, b1 + 4)} />
      <Lamp x={760} y={170} s={1.1} />
      <DinnerTable x={760} y={780} s={1.15} chairs={5} />
      {ROLES.map((r, i) => {
        const appear = k01(t, b1 + 0.15 * i, b1 + 0.15 * i + 0.5);
        const x = 760 + (i - 4.5) * 62;
        const y = 760;
        return (
          <g key={r} opacity={appear} transform={`translate(0 ${(1 - appear) * -40})`}>
            <Figurine x={x} y={y} s={0.42} />
          </g>
        );
      })}
    </Push>
  );
};

// Граммофон.
const Gramophone: React.FC<{ x: number; y: number; s?: number; spin: number }> = ({ x, y, s = 1, spin }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={OL} strokeWidth={6} strokeLinejoin="round">
    <rect x={-150} y={-60} width={300} height={120} rx={14} fill="#6b4430" />
    <ellipse cx={0} cy={-64} rx={140} ry={26} fill="#1a1a1a" />
    <g transform={`translate(0 -64) scale(1 0.19) rotate(${spin})`}>
      <path d="M 0 -120 L 0 120" stroke="#444" strokeWidth={10} />
      <circle r={36} fill="#c9533f" />
    </g>
    <path d="M 90 -70 Q 110 -170 60 -230" fill="none" strokeWidth={12} stroke="#c9a54a" />
    <path d="M 60 -230 L -40 -420 Q 120 -470 230 -360 Z" fill="#e0bb57" />
    <path d="M 60 -230 L 10 -400 M 60 -230 L 120 -420 M 60 -230 L 190 -380" stroke="#a8862d" strokeWidth={4} />
  </g>
);

// ── p2: голос с пластинки — красные нити обвинений ко всем десяти ──
const Voice: React.FC<VP> = ({ t, dur, beats, ends }) => {
  const s0 = beats[0] ?? 0.5;
  const e0 = ends[0] ?? dur - 1;
  const span = Math.max(1, e0 - s0);
  const horn: [number, number] = [520, 370];
  return (
    <Push t={t} dur={dur} cx={700} cy={540} from={1.04} to={1.0}>
      <Wall warm={0.45} />
      <Gramophone x={430} y={780} s={1.05} spin={t * 200} />
      {[0, 1, 2].map((i) => {
        const ph = (t * 0.9 + i / 3) % 1;
        return <circle key={i} cx={horn[0]} cy={horn[1]} r={60 + ph * 260} fill="none" stroke="#ffd166" strokeWidth={5} opacity={(1 - ph) * 0.5 * k01(t, s0, s0 + 0.4)} />;
      })}
      {ROLES.map((r, i) => {
        const x = 700 + (i % 5) * 120 + Math.floor(i / 5) * 40;
        const y = 560 + Math.floor(i / 5) * 230;
        const at = s0 + span * 0.3 + (span * 0.65 * i) / 10;
        const k = k01(t, at, at + 0.6);
        return (
          <g key={r}>
            <Thread a={horn} b={[x, y - 105]} dashed progress={k} sag={40} />
            <Figurine x={x} y={y} s={0.75} role={r} glow={k > 0 && k < 1} />
          </g>
        );
      })}
    </Push>
  );
};

// ── p3: весы — «голос» не перевешивает «доказательство» ──
const Plate: React.FC<{ x: number; y: number; label: string; k: number; color: string }> = ({ x, y, label, k, color }) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    <rect x={-170} y={-36} width={340} height={64} rx={32} fill={color} stroke={OL} strokeWidth={4} />
    <text x={0} y={12} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={34} fill={OL} letterSpacing={2}>
      {label}
    </text>
  </g>
);

const ScalesScene: React.FC<VP> = ({ t, dur, beats }) => {
  const b1 = beats[1] ?? dur * 0.3;
  const b2 = beats[2] ?? dur * 0.6;
  // чаша «голоса» дрожит, но не опускается: громкость ≠ вес
  const wob = Math.sin(t * 5) * 3 * k01(t, 0.5, 1.2) * (1 - k01(t, b2, b2 + 1));
  const card = k01(t, b2 + 1.2, b2 + 1.8);
  return (
    <Push t={t} dur={dur} cx={1150} cy={560} from={1.0} to={1.06}>
      <rect width={1920} height={1080} fill="#121a2b" />
      <circle cx={1150} cy={460} r={520} fill="#ffd166" opacity={0.08} />
      <Scales x={1150} y={800} s={1.15} tilt={wob} />
      <Plate x={1150 - 219} y={560} label="ГОЛОС" k={k01(t, 0.4, 1)} color="#ffd166" />
      <Plate x={1150 + 219} y={560} label="ДОКАЗАТЕЛЬСТВА" k={k01(t, b1, b1 + 0.6)} color={PAL.paper} />
      <g opacity={card} transform={`translate(1150 ${150 + (1 - card) * 30}) rotate(-2)`}>
        <rect x={-330} y={-60} width={660} height={120} rx={12} fill={PAL.paper} stroke={OL} strokeWidth={5} />
        <circle cx={0} cy={-58} r={12} fill={PAL.thread} stroke={OL} strokeWidth={3} />
        <text x={0} y={-8} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={30} fill={PAL.thread} letterSpacing={3}>
          ВЫВОД №1
        </text>
        <text x={0} y={38} textAnchor="middle" fontFamily="Rubik" fontWeight={800} fontSize={40} fill={OL}>
          обвинение ≠ доказательство
        </text>
      </g>
    </Push>
  );
};

export const VISUALS: Record<string, React.FC<VP>> = { dinner: Dinner, voice: Voice, scales: ScalesScene };
