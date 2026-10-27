// Персонажи-метафоры книги: Система 1 (быстрая «искра», оранжевая) и Система 2
// (медленный «счётчик» в очках, синий). Это способ объяснения, а не части мозга —
// подпись в кадре и реплики банана это подчёркивают. Плюс общие детали схем фильма.
import React from "react";
import { C, FONT, S1, S2 } from "../theme";
import { OL } from "./draw";
import { clamp01, Txt } from "./kit";

export type CharMood = "happy" | "think" | "shock" | "sleepy" | "proud" | "sad";

const Eyes: React.FC<{ x: number; y: number; gap: number; r: number; mood: CharMood; t: number; look?: number }> = ({ x, y, gap, r, mood, t, look = 0 }) => {
  const blink = (t * 0.7) % 4 < 0.12 ? 0.15 : 1;
  const open = mood === "sleepy" ? 0.35 : mood === "shock" ? 1.25 : 1;
  const ry = r * open * blink;
  return (
    <g>
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${x + sd * gap} ${y})`}>
          <ellipse rx={r} ry={Math.max(1.5, ry)} fill="#fff" stroke={OL} strokeWidth={4} />
          {ry > 3 && <circle cx={look * r * 0.35} cy={mood === "think" ? -r * 0.3 : 0} r={r * 0.5} fill={OL} />}
          {ry > 3 && <circle cx={look * r * 0.35 + r * 0.18} cy={(mood === "think" ? -r * 0.3 : 0) - r * 0.2} r={r * 0.16} fill="#fff" />}
        </g>
      ))}
    </g>
  );
};

const Mouth: React.FC<{ x: number; y: number; w: number; mood: CharMood; talk: number; t: number }> = ({ x, y, w, mood, talk, t }) => {
  const o = talk > 0 ? (0.5 + 0.5 * Math.sin(t * 18)) * talk : 0;
  if (mood === "shock") return <ellipse cx={x} cy={y + 4} rx={w * 0.3} ry={w * 0.36} fill="#7a2e1e" stroke={OL} strokeWidth={4} />;
  if (o > 0.1) return <ellipse cx={x} cy={y + 2} rx={w * 0.4} ry={w * 0.12 + o * w * 0.25} fill="#7a2e1e" stroke={OL} strokeWidth={4} />;
  const c = mood === "sad" ? -0.35 : mood === "think" || mood === "sleepy" ? 0.05 : mood === "proud" ? 0.6 : 0.5;
  return <path d={`M ${x - w / 2} ${y} Q ${x} ${y + w * c} ${x + w / 2} ${y}`} stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round" />;
};

// Система 1 — быстрая «искра»: круглая, с молнией на груди и линиями скорости.
export const SystemOne: React.FC<{ x: number; y: number; s?: number; t: number; mood?: CharMood; talk?: number; run?: number; label?: boolean; look?: number }> = ({
  x,
  y,
  s = 1,
  t,
  mood = "happy",
  talk = 0,
  run = 0,
  label = true,
  look = 0,
}) => {
  const bounce = Math.abs(Math.sin(t * (4 + run * 8))) * (6 + run * 10);
  return (
    <g transform={`translate(${x} ${y - bounce}) scale(${s})`}>
      {run > 0 &&
        [0, 1, 2].map((i) => (
          <path key={i} d={`M ${-150 - i * 10} ${-110 + i * 40} L ${-230 - i * 30} ${-110 + i * 40}`} stroke={S1.deep} strokeWidth={10} strokeLinecap="round" opacity={0.5 * run} />
        ))}
      <ellipse cx={0} cy={bounce / s + 4} rx={86} ry={14} fill="#000" opacity={0.08} />
      <path d="M -36 -30 L -44 0 M 36 -30 L 44 0" stroke={OL} strokeWidth={12} strokeLinecap="round" />
      <ellipse cx={-48} cy={2} rx={26} ry={12} fill="#2b2b2b" />
      <ellipse cx={48} cy={2} rx={26} ry={12} fill="#2b2b2b" />
      <circle cx={0} cy={-120} r={100} fill={S1.main} stroke={OL} strokeWidth={6} />
      <circle cx={-36} cy={-166} r={26} fill="#fff" opacity={0.25} />
      {/* хохолок-искра */}
      <path d="M -10 -218 L 18 -262 L 8 -232 L 34 -246 L 10 -208 Z" fill={C.yellow} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -12 -70 L 12 -70 L 2 -48 L 20 -48 L -10 -10 L -2 -36 L -20 -36 Z" fill={C.yellow} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <Eyes x={0} y={-140} gap={36} r={22} mood={mood} t={t} look={look} />
      <Mouth x={0} y={-96} w={44} mood={mood} talk={talk} t={t} />
      {label && (
        <g transform="translate(0 52)">
          <rect x={-110} y={-26} width={220} height={48} rx={24} fill={S1.deep} />
          <text x={0} y={9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">
            Система 1
          </text>
        </g>
      )}
    </g>
  );
};

// Система 2 — медленный «счётчик»: высокий, в очках, с блокнотом и карандашом.
export const SystemTwo: React.FC<{ x: number; y: number; s?: number; t: number; mood?: CharMood; talk?: number; write?: number; label?: boolean; look?: number }> = ({
  x,
  y,
  s = 1,
  t,
  mood = "think",
  talk = 0,
  write = 0,
  label = true,
  look = 0,
}) => {
  const sway = Math.sin(t * 1.1) * 2;
  const pen = write > 0 ? Math.sin(t * 9) * 8 * write : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sway})`}>
      <ellipse cx={0} cy={4} rx={90} ry={14} fill="#000" opacity={0.08} />
      <path d="M -34 -30 L -36 0 M 34 -30 L 36 0" stroke={OL} strokeWidth={12} strokeLinecap="round" />
      <ellipse cx={-42} cy={2} rx={26} ry={12} fill="#2b2b2b" />
      <ellipse cx={42} cy={2} rx={26} ry={12} fill="#2b2b2b" />
      <rect x={-88} y={-300} width={176} height={276} rx={60} fill={S2.main} stroke={OL} strokeWidth={6} />
      <rect x={-66} y={-280} width={30} height={120} rx={15} fill="#fff" opacity={0.2} />
      {/* блокнот и карандаш */}
      <g transform="translate(40 -120) rotate(-8)">
        <rect x={-38} y={-48} width={76} height={96} rx={8} fill="#fffdf4" stroke={OL} strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M -24 ${-26 + i * 20} L ${10 + ((i * 13) % 14)} ${-26 + i * 20}`} stroke={S2.deep} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
        ))}
        <g transform={`translate(${30 + pen} ${-10}) rotate(35)`}>
          <rect x={-6} y={-46} width={12} height={60} rx={3} fill={C.yellow} stroke={OL} strokeWidth={3} />
          <path d="M -6 14 L 0 28 L 6 14 Z" fill="#f2c79b" stroke={OL} strokeWidth={3} />
        </g>
      </g>
      <Eyes x={0} y={-226} gap={34} r={20} mood={mood} t={t + 1.7} look={look} />
      {/* очки */}
      <g fill="none" stroke={OL} strokeWidth={5}>
        <circle cx={-34} cy={-226} r={30} />
        <circle cx={34} cy={-226} r={30} />
        <path d="M -4 -228 L 4 -228" />
      </g>
      <Mouth x={0} y={-176} w={40} mood={mood} talk={talk} t={t} />
      {label && (
        <g transform="translate(0 52)">
          <rect x={-110} y={-26} width={220} height={48} rx={24} fill={S2.deep} />
          <text x={0} y={9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">
            Система 2
          </text>
        </g>
      )}
    </g>
  );
};

// подпись «метафора, а не отдел мозга»
export const MetaphorNote: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y})`} opacity={clamp01(k)}>
      <rect x={-250} y={-26} width={500} height={44} rx={22} fill="#fff" opacity={0.9} />
      <Txt x={0} y={6} size={24} weight={700} color={C.inkSoft}>
        персонажи-метафоры, а не отделы мозга
      </Txt>
    </g>
  );
};

// крупное число / формула с «пружинкой»
export const BigNum: React.FC<{ x: number; y: number; text: string; k: number; size?: number; color?: string }> = ({ x, y, text, k, size = 120, color = C.ink }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * clamp01(k)})`} opacity={clamp01(k * 1.4)}>
      <Txt x={0} y={0} size={size} weight={900} color={color}>
        {text}
      </Txt>
    </g>
  );
};

// маленькая фигурка-«пиктограмма» для статистики (100 человек, 600 человек…)
export const Dot: React.FC<{ x: number; y: number; r?: number; color: string; k?: number }> = ({ x, y, r = 14, color, k = 1 }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${clamp01(k)})`}>
      <circle cy={-r * 1.1} r={r * 0.62} fill={color} />
      <path d={`M ${-r * 0.8} ${r * 0.7} Q ${-r * 0.8} ${-r * 0.35} 0 ${-r * 0.35} Q ${r * 0.8} ${-r * 0.35} ${r * 0.8} ${r * 0.7} Z`} fill={color} />
    </g>
  );

// шкала с подписями (проценты, деньги)
export const Bar: React.FC<{ x: number; y: number; w: number; h: number; v: number; color: string; label?: string; value?: string; k?: number }> = ({ x, y, w, h, v, color, label, value, k = 1 }) => {
  const hh = h * clamp01(v) * clamp01(k);
  return (
    <g>
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={14} fill="#fff" opacity={0.6} />
      <rect x={x - w / 2} y={y - hh} width={w} height={hh} rx={14} fill={color} stroke={OL} strokeWidth={4} />
      {label && (
        <Txt x={x} y={y + 44} size={30} weight={800} color={C.ink}>
          {label}
        </Txt>
      )}
      {value && k > 0.6 && (
        <Txt x={x} y={y - hh - 18} size={40} weight={900} color={C.ink}>
          {value}
        </Txt>
      )}
    </g>
  );
};
