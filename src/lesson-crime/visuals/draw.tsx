// Рисованные персонажи и предметы фильма BM-016 — собственный 2D-стиль BanaMind
// (книжная иллюстрация из простых форм), без кадров экранизаций и чужих рисунков.
// Персонажи романа — литературные герои, а не реальные люди.
import React from "react";
import { C, FONT, SERIF } from "../theme";

export const OL = "#2a2540"; // контур
const SKIN = "#f2d5bb";
const SKIN_SH = "#e2b996";

export type Who =
  | "rask" | "sonya" | "razum" | "dunya" | "mother" | "porfiry" | "luzhin" | "svid"
  | "marm" | "katerina" | "lizaveta" | "alena" | "nikolay" | "zametov" | "student" | "officer" | "child" | "crowd" | "convict" | "girl";

type Look = {
  coat: string; coat2: string; hair: string; skirt?: boolean; hat?: "top" | "round" | "bonnet" | "cap" | "kerchief";
  hatColor?: string; shawl?: string; beard?: string; h?: number; w?: number; bald?: boolean; glasses?: boolean;
};

export const LOOKS: Record<Who, Look> = {
  rask: { coat: "#55597a", coat2: "#3f4362", hair: "#3a2a22", hat: "round", hatColor: "#3b3550", h: 1.06 },
  sonya: { coat: "#8a7aa8", coat2: "#6d5f8c", hair: "#e3c88f", skirt: true, shawl: C.green, h: 0.9, w: 0.9 },
  razum: { coat: "#9a6a44", coat2: "#7c5233", hair: "#2b1f18", h: 1.08, w: 1.18 },
  dunya: { coat: "#3d4b72", coat2: "#2c385a", hair: "#3b2a22", skirt: true, h: 1.0 },
  mother: { coat: "#6e6a86", coat2: "#57536e", hair: "#9a9aa6", skirt: true, hat: "bonnet", hatColor: "#e8e1d0", shawl: "#b9a989", h: 0.94 },
  porfiry: { coat: "#c9b48c", coat2: "#a8946c", hair: "#d8c79a", bald: true, h: 0.92, w: 1.22 },
  luzhin: { coat: "#2f3a4f", coat2: "#222b3c", hair: "#5a4a3a", hat: "top", hatColor: "#1f2433", h: 1.0, w: 1.05 },
  svid: { coat: "#e6e0cf", coat2: "#c9c1aa", hair: "#e8d9a8", beard: "#e8d9a8", hat: "round", hatColor: "#b7ae96", h: 1.08 },
  marm: { coat: "#5b5446", coat2: "#463f33", hair: "#8d8d8d", bald: true, h: 0.98 },
  katerina: { coat: "#7d6a62", coat2: "#634f48", hair: "#6b4a34", skirt: true, shawl: "#b36b5e", h: 0.98, w: 0.88 },
  lizaveta: { coat: "#9b8a6e", coat2: "#7d6d54", hair: "#5a4630", skirt: true, hat: "kerchief", hatColor: "#c98a5a", h: 1.08 },
  alena: { coat: "#6b5d72", coat2: "#53475a", hair: "#c9c4b8", skirt: true, hat: "kerchief", hatColor: "#8f7f96", h: 0.78, w: 0.86 },
  nikolay: { coat: "#c2b9a5", coat2: "#a59c88", hair: "#c9a46a", hat: "cap", hatColor: "#5c5a6a", h: 1.0 },
  zametov: { coat: "#4d6a6a", coat2: "#3b5555", hair: "#2f2a26", h: 0.98 },
  student: { coat: "#6a6f8f", coat2: "#53587a", hair: "#4a3628", hat: "cap", hatColor: "#3a3f5a", h: 1.0 },
  officer: { coat: "#3f6a5a", coat2: "#2f5245", hair: "#2a201a", h: 1.02 },
  child: { coat: "#c98a8a", coat2: "#a86f6f", hair: "#e3c88f", skirt: true, h: 0.6, w: 0.75 },
  crowd: { coat: "#7a7f9e", coat2: "#62677f", hair: "#4a4040", hat: "cap", hatColor: "#55597a", h: 1.0 },
  convict: { coat: "#8d8578", coat2: "#726b60", hair: "#6a6a6a", bald: true, h: 1.0 },
  girl: { coat: "#d8a0a8", coat2: "#b98089", hair: "#e3c88f", skirt: true, h: 0.85, w: 0.85 },
};

export type FigMood = "neutral" | "sad" | "tense" | "kind" | "angry" | "smile" | "shock" | "closed";
export type FigPose = "stand" | "walk" | "kneel" | "sit" | "read" | "reach" | "bow" | "cover" | "point" | "hold";

// Лицо: глаза, брови, рот — простые линии, эмоция без гротеска.
const Face: React.FC<{ mood: FigMood; look: number; blink: number }> = ({ mood, look, blink }) => {
  const brow = { neutral: 0, sad: -0.6, tense: 0.7, kind: -0.2, angry: 1, smile: -0.1, shock: -1, closed: 0 }[mood];
  const by = mood === "shock" ? -6 : 0;
  const eyeH = mood === "closed" ? 0.5 : Math.max(0.6, (mood === "shock" ? 7 : 5.5) * (1 - blink));
  const mouth =
    mood === "smile" || mood === "kind"
      ? "M -12 22 Q 0 31 12 22"
      : mood === "sad"
        ? "M -11 27 Q 0 20 11 27"
        : mood === "shock"
          ? "M -6 24 Q 0 34 6 24 Q 0 20 -6 24"
          : mood === "angry" || mood === "tense"
            ? "M -11 25 L 11 24"
            : "M -10 24 Q 0 27 10 24";
  return (
    <g transform={`translate(${look * 6} 0)`}>
      {[-1, 1].map((d) => (
        <g key={d}>
          {mood === "closed" ? (
            <path d={`M ${d * 17 - 7} 2 Q ${d * 17} 7 ${d * 17 + 7} 2`} stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />
          ) : (
            <ellipse cx={d * 17} cy={2} rx={4.6} ry={eyeH} fill={OL} />
          )}
          <path d={`M ${d * 26} ${-12 + by - brow * 2} L ${d * 8} ${-12 + by + brow * 4}`} stroke={OL} strokeWidth={3.6} strokeLinecap="round" />
        </g>
      ))}
      <path d={mouth} stroke={OL} strokeWidth={3.2} fill={mood === "shock" ? "#7a3b3b" : "none"} strokeLinecap="round" />
      <ellipse cx={-26} cy={14} rx={7} ry={4} fill="#e8a39a" opacity={0.35} />
      <ellipse cx={26} cy={14} rx={7} ry={4} fill="#e8a39a" opacity={0.35} />
    </g>
  );
};

// Персонаж романа. Точка опоры — между ступнями (0, 0), рост ≈ 430 · s.
export const Person: React.FC<{
  who: Who; x: number; y: number; s?: number; mood?: FigMood; pose?: FigPose; t?: number; flip?: boolean; look?: number; opacity?: number; tint?: number; seed?: number;
}> = ({ who, x, y, s: s0 = 1, mood = "neutral", pose = "stand", t = 0, flip = false, look = 0, opacity = 1, tint = 0, seed = 0 }) => {
  const s = s0 * 1.18; // персонажи крупнее для телефона
  const L = LOOKS[who];
  const H = L.h ?? 1;
  const Wd = L.w ?? 1;
  const breathe = 1 + Math.sin(t * 1.7 + seed) * 0.008;
  const walk = pose === "walk" ? Math.sin(t * 6 + seed) : 0;
  const blinkPhase = (t * 0.37 + seed * 0.21) % 1;
  const blink = blinkPhase > 0.965 ? 1 : 0;
  const kneel = pose === "kneel" ? 1 : 0;
  const sit = pose === "sit" ? 1 : 0;
  const bow = pose === "bow" ? 1 : 0;
  const legH = 150 * H * (1 - kneel * 0.55 - sit * 0.45);
  const bodyH = 175 * H;
  const bw = 62 * Wd;
  const top = -legH - bodyH;
  const headY = top - 42;
  const coat = L.coat;
  const coat2 = L.coat2;
  // руки: угол плеча (0 — вниз), локоть
  const arms: Record<FigPose, [number, number, number, number]> = {
    stand: [8, 6, 8, 6],
    walk: [8 + walk * 14, 4, 8 - walk * 14, 4],
    kneel: [30, -40, 30, -40],
    sit: [20, -50, 20, -50],
    read: [35, -95, 35, -95],
    reach: [10, 8, 75, 5],
    bow: [10, 0, 10, 0],
    cover: [20, -150, 20, -150],
    point: [8, 6, 85, 0],
    hold: [25, -70, 25, -70],
  };
  const [la, le, ra, re] = arms[pose];
  const arm = (side: -1 | 1, a: number, e: number) => {
    const d2r = Math.PI / 180;
    const sx = side * (bw - 8);
    const sy = top + 22;
    const ex = sx + side * Math.sin(a * d2r) * 70 * H;
    const ey = sy + Math.cos(a * d2r) * 70 * H;
    const hx = ex + side * Math.sin((a + e) * d2r) * 64 * H;
    const hy = ey + Math.cos((a + e) * d2r) * 64 * H;
    return (
      <g key={side}>
        <path d={`M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`} stroke={OL} strokeWidth={26 * Math.min(1.1, Wd) + 7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`} stroke={coat2} strokeWidth={26 * Math.min(1.1, Wd)} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={hx} cy={hy} r={11} fill={SKIN} stroke={OL} strokeWidth={3} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`} opacity={opacity}>
      <ellipse cx={0} cy={2} rx={bw * 1.3} ry={12} fill="#000" opacity={0.12} />
      <g>
        {/* ноги */}
        {L.skirt ? (
          <path d={`M ${-bw * 0.95} ${-legH - 6} L ${-bw * 1.15 - kneel * 10} -6 Q 0 6 ${bw * 1.15 + kneel * 10} -6 L ${bw * 0.95} ${-legH - 6} Z`} fill={coat2} stroke={OL} strokeWidth={4} />
        ) : kneel ? (
          <g>
            <path d={`M -26 ${-legH} L -40 -4 L 10 -4`} stroke="#3a3650" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d={`M 22 ${-legH} L 40 -4`} stroke="#3a3650" strokeWidth={30} strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <g>
            <rect x={-30 + walk * 8} y={-legH} width={26} height={legH - 6} rx={10} fill="#3a3650" transform={`rotate(${walk * 8} -17 ${-legH})`} />
            <rect x={4 - walk * 8} y={-legH} width={26} height={legH - 6} rx={10} fill="#3a3650" transform={`rotate(${-walk * 8} 17 ${-legH})`} />
            <ellipse cx={-20 + walk * 18} cy={-6} rx={22} ry={11} fill="#2a2638" />
            <ellipse cx={20 - walk * 18} cy={-6} rx={22} ry={11} fill="#2a2638" />
          </g>
        )}
        {/* тело */}
        <g transform={`rotate(${bow * 24} 0 ${-legH}) translate(0 ${-legH}) scale(1 ${breathe}) translate(0 ${legH})`}>
          <path
            d={`M ${-bw} ${top + 30} Q ${-bw} ${top} ${-bw * 0.55} ${top} L ${bw * 0.55} ${top} Q ${bw} ${top} ${bw} ${top + 30} L ${bw * 1.08} ${-legH + 4} Q 0 ${-legH + 18} ${-bw * 1.08} ${-legH + 4} Z`}
            fill={coat}
            stroke={OL}
            strokeWidth={4}
          />
          <path d={`M 0 ${top + 6} L 0 ${-legH + 10}`} stroke={coat2} strokeWidth={4} />
          {L.shawl && (
            <path d={`M ${-bw * 1.02} ${top + 20} Q 0 ${top + 92} ${bw * 1.02} ${top + 20} L ${bw * 0.7} ${top - 4} Q 0 ${top + 30} ${-bw * 0.7} ${top - 4} Z`} fill={L.shawl} stroke={OL} strokeWidth={3.5} />
          )}
          {arm(-1, la, le)}
          {arm(1, ra, re)}
          {/* голова */}
          <g transform={`translate(0 ${headY})`}>
            <rect x={-12} y={34} width={24} height={16} fill={SKIN_SH} />
            <ellipse cx={0} cy={0} rx={44} ry={48} fill={SKIN} stroke={OL} strokeWidth={4} />
            {!L.bald && <path d="M -44 -6 Q -46 -52 0 -52 Q 46 -52 44 -6 Q 30 -30 0 -34 Q -30 -30 -44 -6 Z" fill={L.hair} stroke={OL} strokeWidth={3} />}
            {L.bald && <path d="M -44 0 Q -46 -24 -34 -30 M 44 0 Q 46 -24 34 -30" stroke={L.hair} strokeWidth={9} fill="none" strokeLinecap="round" />}
            {L.skirt && !L.hat && <circle cx={0} cy={-50} r={16} fill={L.hair} stroke={OL} strokeWidth={3} />}
            {L.beard && <path d="M -36 14 Q -30 62 0 66 Q 30 62 36 14 Q 20 36 0 36 Q -20 36 -36 14 Z" fill={L.beard} stroke={OL} strokeWidth={3} />}
            <Face mood={mood} look={look} blink={blink} />
            {L.hat === "top" && (
              <g>
                <rect x={-34} y={-118} width={68} height={74} rx={6} fill={L.hatColor} stroke={OL} strokeWidth={4} />
                <rect x={-54} y={-50} width={108} height={12} rx={6} fill={L.hatColor} stroke={OL} strokeWidth={4} />
              </g>
            )}
            {L.hat === "round" && (
              <g>
                <path d="M -40 -40 Q -38 -92 0 -94 Q 38 -92 40 -40 Z" fill={L.hatColor} stroke={OL} strokeWidth={4} />
                <ellipse cx={0} cy={-40} rx={58} ry={11} fill={L.hatColor} stroke={OL} strokeWidth={4} />
              </g>
            )}
            {L.hat === "cap" && <path d="M -44 -24 Q -40 -62 0 -62 Q 40 -62 44 -24 L 62 -18 L -44 -18 Z" fill={L.hatColor} stroke={OL} strokeWidth={4} />}
            {L.hat === "bonnet" && <path d="M -54 18 Q -60 -60 0 -62 Q 60 -60 54 18 Q 44 -34 0 -38 Q -44 -34 -54 18 Z" fill={L.hatColor} stroke={OL} strokeWidth={4} />}
            {L.hat === "kerchief" && <path d="M -50 22 Q -56 -62 0 -60 Q 56 -62 50 22 Q 40 -30 0 -34 Q -40 -30 -50 22 Z" fill={L.hatColor} stroke={OL} strokeWidth={4} />}
          </g>
          {pose === "read" && (
            <g transform={`translate(0 ${top + 70})`}>
              <path d="M -50 0 L 0 8 L 50 0 L 50 44 L 0 52 L -50 44 Z" fill={C.paper} stroke={OL} strokeWidth={4} />
              <path d="M 0 8 L 0 52" stroke={OL} strokeWidth={3} />
            </g>
          )}
        </g>
      </g>
      {tint > 0 && <ellipse cx={0} cy={top} rx={bw * 2} ry={bodyH * 1.3} fill={C.dusk} opacity={tint} />}
    </g>
  );
};

// Силуэт (без лица) — для толпы, теней, «расчётных единиц».
export const Silhouette: React.FC<{ x: number; y: number; s?: number; color?: string; opacity?: number }> = ({ x, y, s = 1, color = C.night, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <circle cx={0} cy={-150} r={30} fill={color} />
    <path d="M -42 -112 Q 0 -126 42 -112 L 50 -10 Q 0 4 -50 -10 Z" fill={color} />
  </g>
);

// Условный петербургский дом: фасад, окна, свет в некоторых окнах.
export const House: React.FC<{ x: number; y: number; w: number; h: number; color: string; t?: number; floors?: number; seed?: number; lit?: number }> = ({ x, y, w, h, color, t = 0, floors = 5, seed = 0, lit = 0.3 }) => {
  const cols = Math.max(2, Math.floor(w / 70));
  const fh = h / floors;
  const wins = [];
  for (let f = 0; f < floors; f++)
    for (let c = 0; c < cols; c++) {
      const r = Math.abs(Math.sin(seed * 12.9 + f * 7.3 + c * 3.1));
      const on = r < lit;
      const flick = on ? 0.75 + 0.25 * Math.sin(t * 0.8 + r * 20) : 1;
      wins.push(
        <rect key={`${f}-${c}`} x={x + (w / cols) * (c + 0.3)} y={y - h + fh * (f + 0.28)} width={(w / cols) * 0.4} height={fh * 0.46} rx={3} fill={on ? C.gold : "#2f3456"} opacity={on ? flick : 0.55} />,
      );
    }
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={color} stroke={OL} strokeWidth={3} />
      <rect x={x - 6} y={y - h - 14} width={w + 12} height={16} fill={color} stroke={OL} strokeWidth={3} />
      {wins}
    </g>
  );
};

export const Candle: React.FC<{ x: number; y: number; s?: number; t: number; glow?: number }> = ({ x, y, s = 1, t, glow = 1 }) => {
  const f = 1 + Math.sin(t * 9) * 0.06 + Math.sin(t * 13.7) * 0.04;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-90} r={150 * glow} fill={C.gold} opacity={0.16} />
      <circle cx={0} cy={-90} r={70 * glow} fill={C.yellow} opacity={0.18} />
      <rect x={-16} y={-74} width={32} height={74} rx={4} fill={C.paper} stroke={OL} strokeWidth={3} />
      <path d={`M 0 ${-78} Q ${-12 * f} ${-96} 0 ${-118 * f} Q ${12 * f} ${-96} 0 ${-78} Z`} fill={C.yellow} stroke={C.goldDeep} strokeWidth={2} />
      <ellipse cx={0} cy={-2} rx={34} ry={8} fill={C.steel} stroke={OL} strokeWidth={3} />
    </g>
  );
};

export const BookObj: React.FC<{ x: number; y: number; s?: number; open?: number; label?: string; color?: string; rot?: number }> = ({ x, y, s = 1, open = 0, label, color = "#7a4a3a", rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {open > 0.5 ? (
      <g>
        <path d="M -150 -10 Q -75 -30 0 -10 L 0 90 Q -75 70 -150 90 Z" fill={C.paper} stroke={OL} strokeWidth={4} />
        <path d="M 150 -10 Q 75 -30 0 -10 L 0 90 Q 75 70 150 90 Z" fill={C.paper} stroke={OL} strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} stroke={C.inkSoft} strokeWidth={3} opacity={0.5}>
            <line x1={-130} y1={12 + i * 18} x2={-20} y2={12 + i * 18} />
            <line x1={20} y1={12 + i * 18} x2={130} y2={12 + i * 18} />
          </g>
        ))}
      </g>
    ) : (
      <g>
        <rect x={-90} y={-120} width={180} height={240} rx={10} fill={color} stroke={OL} strokeWidth={5} />
        <rect x={-74} y={-104} width={148} height={208} rx={6} fill="none" stroke={C.gold} strokeWidth={3} />
        {label && (
          <text x={0} y={0} fontFamily={SERIF} fontWeight={700} fontSize={26} fill={C.gold} textAnchor="middle">
            {label.split("\n").map((l, i) => (
              <tspan key={i} x={0} dy={i === 0 ? -10 : 32}>
                {l}
              </tspan>
            ))}
          </text>
        )}
      </g>
    )}
  </g>
);

// Весы: наклон −1…1 (+ — правая чаша ниже).
export const Scales: React.FC<{ x: number; y: number; s?: number; tilt: number; left?: React.ReactNode; right?: React.ReactNode; color?: string }> = ({ x, y, s = 1, tilt, left, right, color = C.gold }) => {
  const a = tilt * 14;
  const r = (a * Math.PI) / 180;
  const lx = -300 * Math.cos(r);
  const ly = -300 * Math.sin(r);
  const rx = 300 * Math.cos(r);
  const ry = 300 * Math.sin(r);
  const pan = (px: number, py: number, content: React.ReactNode) => (
    <g transform={`translate(${px} ${py})`}>
      <path d="M 0 0 L -110 170 M 0 0 L 110 170" stroke={C.goldDeep} strokeWidth={4} />
      <path d="M -140 170 Q 0 240 140 170 Z" fill={color} stroke={OL} strokeWidth={5} />
      <g transform="translate(0 168)">{content}</g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-14} y={0} width={28} height={420} fill={C.goldDeep} stroke={OL} strokeWidth={5} />
      <path d="M -120 440 Q 0 400 120 440 L 140 470 L -140 470 Z" fill={color} stroke={OL} strokeWidth={5} />
      <circle cx={0} cy={-6} r={26} fill={color} stroke={OL} strokeWidth={5} />
      <path d="M 0 -60 L -16 -20 L 16 -20 Z" fill={color} stroke={OL} strokeWidth={4} />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={C.goldDeep} strokeWidth={18} strokeLinecap="round" />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={OL} strokeWidth={4} strokeLinecap="round" opacity={0.4} />
      {pan(lx, ly, left)}
      {pan(rx, ry, right)}
    </g>
  );
};

// Бумажная карточка-ярлык (подписи предметов).
export const Label: React.FC<{ x: number; y: number; text: string; size?: number; bg?: string; color?: string; opacity?: number; serif?: boolean }> = ({ x, y, text, size: s0 = 34, bg = C.paper, color = C.ink, opacity = 1, serif = false }) => {
  const size = s0 * 1.15; // крупнее для телефона
  const w = text.length * size * 0.56 + size * 1.1;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect x={-w / 2 + 4} y={-size * 0.95 + 6} width={w} height={size * 1.6} rx={size * 0.4} fill="#000" opacity={0.15} />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.4} fill={bg} stroke={OL} strokeWidth={3} />
      <text x={0} y={size * 0.12} fontFamily={serif ? SERIF : FONT} fontWeight={800} fontSize={size} fill={color} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

export const Coin: React.FC<{ x: number; y: number; r?: number; spin?: number }> = ({ x, y, r = 22, spin = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(0.15, Math.abs(Math.cos(spin)))} 1)`}>
    <circle r={r} fill={C.gold} stroke={OL} strokeWidth={3} />
    <circle r={r * 0.65} fill="none" stroke={C.goldDeep} strokeWidth={2.5} />
  </g>
);

export const Note: React.FC<{ x: number; y: number; s?: number; value: string; rot?: number; color?: string }> = ({ x, y, s = 1, value, rot = 0, color = "#cfe3c8" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-110} y={-56} width={220} height={112} rx={8} fill={color} stroke={OL} strokeWidth={4} />
    <rect x={-96} y={-42} width={192} height={84} rx={6} fill="none" stroke="#6f9a68" strokeWidth={3} />
    <text x={0} y={16} fontFamily={SERIF} fontWeight={700} fontSize={46} fill="#3d5a38" textAnchor="middle">
      {value}
    </text>
  </g>
);

export const Door: React.FC<{ x: number; y: number; s?: number; open?: number; color?: string }> = ({ x, y, s = 1, open = 0, color = "#8a6a4a" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-330} width={220} height={330} fill="#2f2a3e" stroke={OL} strokeWidth={5} />
    <g transform={`scale(${1 - open * 0.75} 1)`} style={{ transformOrigin: "-110px 0px" }}>
      <rect x={-104} y={-324} width={208} height={322} fill={color} stroke={OL} strokeWidth={4} />
      <rect x={-84} y={-300} width={168} height={120} rx={6} fill="none" stroke={OL} strokeWidth={3} opacity={0.5} />
      <rect x={-84} y={-160} width={168} height={130} rx={6} fill="none" stroke={OL} strokeWidth={3} opacity={0.5} />
      <circle cx={74} cy={-160} r={10} fill={C.gold} stroke={OL} strokeWidth={3} />
    </g>
  </g>
);
