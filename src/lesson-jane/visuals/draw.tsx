// Рисованные персонажи и предметы фильма BM-032 «Джейн Эйр» — собственный
// 2D-стиль BanaMind (книжная иллюстрация из простых форм, мода эпохи условная).
// Без кадров экранизаций, актёрских лиц и обложек изданий. Персонажи романа —
// литературные герои, а не реальные люди.
import React from "react";
import { C, FONT, SERIF } from "../theme";

export const OL = "#24283a"; // контур
const SKIN = "#f3d6bd";
const SKIN_SH = "#e2b996";

export type Who =
  | "jane" | "janeKid" | "rochester" | "mrsReed" | "johnReed" | "eliza" | "georgiana" | "bessie" | "brocklehurst"
  | "helen" | "temple" | "girl" | "adele" | "fairfax" | "blanche" | "mason" | "stjohn" | "diana" | "maryR"
  | "hannah" | "rosamond" | "guest" | "lady" | "grace" | "gypsy";

type Look = {
  coat: string; coat2: string; hair: string; dress?: boolean; hat?: "top" | "bonnet" | "cap" | "turban";
  hatColor?: string; sash?: string; vest?: string; h?: number; w?: number; bald?: boolean; glasses?: boolean; curls?: boolean;
};

// Джейн — в простом тёмно-сером платье с белым воротничком (так она описывает
// себя гувернанткой); остальные — условная мода 1840-х, без экранизаций.
export const LOOKS: Record<Who, Look> = {
  jane: { coat: "#5d6478", coat2: "#474d5f", hair: "#4a3022", dress: true, sash: "#ffffff", h: 0.94 },
  janeKid: { coat: "#7b8296", coat2: "#60667a", hair: "#4a3022", dress: true, sash: "#ffffff", h: 0.66, w: 0.82 },
  rochester: { coat: "#33384a", coat2: "#262a38", hair: "#1c1a1f", vest: "#b8664a", h: 1.06, w: 1.16 },
  mrsReed: { coat: "#6e4a7a", coat2: "#573a61", hair: "#8a6a50", dress: true, sash: "#e8d8ec", h: 1.0, w: 1.12, hat: "cap", hatColor: "#ffffff" },
  johnReed: { coat: "#a8503a", coat2: "#8a3e2c", hair: "#7a4a2a", vest: "#f1e2b8", h: 0.74, w: 1.18 },
  eliza: { coat: "#9a9aae", coat2: "#7f7f94", hair: "#6a4a30", dress: true, sash: "#fff", h: 0.72, w: 0.85 },
  georgiana: { coat: "#f2a6b8", coat2: "#d98aa0", hair: "#e0b45a", dress: true, sash: "#fff", h: 0.7, w: 0.85, curls: true },
  bessie: { coat: "#5f8fb8", coat2: "#4a76a0", hair: "#7a4a2a", dress: true, sash: "#ffffff", h: 0.96, hat: "cap", hatColor: "#ffffff" },
  brocklehurst: { coat: "#26262e", coat2: "#1a1a20", hair: "#5a5050", vest: "#26262e", h: 1.24, w: 0.86 },
  helen: { coat: "#6f86a6", coat2: "#58708f", hair: "#7a5236", dress: true, sash: "#e8eef6", h: 0.74, w: 0.82 },
  temple: { coat: "#7a68a8", coat2: "#62528c", hair: "#5a3a26", dress: true, sash: "#f2eefa", h: 1.0, curls: true },
  girl: { coat: "#6f86a6", coat2: "#58708f", hair: "#5a3a26", dress: true, sash: "#e8eef6", h: 0.7, w: 0.82 },
  adele: { coat: "#f4a3b4", coat2: "#dc8699", hair: "#8a5a2a", dress: true, sash: "#fff3f6", h: 0.6, w: 0.8, curls: true },
  fairfax: { coat: "#3e3e4c", coat2: "#30303c", hair: "#c9c4b8", dress: true, sash: "#ffffff", h: 0.94, w: 1.08, hat: "cap", hatColor: "#ffffff", glasses: true },
  blanche: { coat: "#e8c25a", coat2: "#caa23e", hair: "#1f1a1a", dress: true, sash: "#ffffff", h: 1.06, curls: true },
  mason: { coat: "#c9b48a", coat2: "#ad986e", hair: "#8a6a4a", vest: "#f4ead2", h: 1.0, w: 0.95 },
  stjohn: { coat: "#2f3a4e", coat2: "#232c3c", hair: "#e6c46a", vest: "#ffffff", h: 1.12, w: 0.92 },
  diana: { coat: "#5f9a6a", coat2: "#4a7d54", hair: "#4a3022", dress: true, sash: "#eef5e8", h: 0.98, curls: true },
  maryR: { coat: "#8aa86a", coat2: "#6f8c52", hair: "#5a3a26", dress: true, sash: "#f2f6e8", h: 0.96 },
  hannah: { coat: "#7a6a5a", coat2: "#615446", hair: "#c9c4b8", dress: true, sash: "#ffffff", h: 0.94, w: 1.06, hat: "cap", hatColor: "#ffffff" },
  rosamond: { coat: "#f0c0d0", coat2: "#d8a2b6", hair: "#e6c46a", dress: true, sash: "#ffffff", h: 0.98, curls: true, hat: "bonnet", hatColor: "#fff3d6" },
  guest: { coat: "#6a7f9e", coat2: "#53667f", hair: "#4a4040", vest: "#efe2c6", h: 1.0 },
  lady: { coat: "#c9a0b8", coat2: "#ad839c", hair: "#4a3a30", dress: true, sash: "#fff", h: 0.96 },
  gypsy: { coat: "#b8443a", coat2: "#96352d", hair: "#1c1a1f", dress: true, sash: "#e3a93a", h: 0.98, w: 1.1, hat: "cap", hatColor: "#c94a4a" },
  grace: { coat: "#6a5a4a", coat2: "#54473a", hair: "#7a5a3a", dress: true, sash: "#ffffff", h: 0.95, w: 1.1, hat: "cap", hatColor: "#ffffff" },
};

export type FigMood = "neutral" | "sad" | "tense" | "kind" | "angry" | "smile" | "shock" | "closed" | "proud";
export type FigPose = "stand" | "walk" | "sit" | "read" | "reach" | "bow" | "cover" | "point" | "hold" | "cross" | "dance";

// Лицо: глаза, брови, рот — простые линии, эмоция без гротеска.
const Face: React.FC<{ mood: FigMood; look: number; blink: number }> = ({ mood, look, blink }) => {
  const brow = { neutral: 0, sad: -0.6, tense: 0.7, kind: -0.2, angry: 1, smile: -0.1, shock: -1, closed: 0, proud: 0.35 }[mood];
  const by = mood === "shock" ? -6 : 0;
  const eyeH = mood === "closed" ? 0.5 : mood === "proud" ? 3.2 : Math.max(0.6, (mood === "shock" ? 7 : 5.5) * (1 - blink));
  const mouth =
    mood === "smile" || mood === "kind"
      ? "M -12 22 Q 0 31 12 22"
      : mood === "sad"
        ? "M -11 27 Q 0 20 11 27"
        : mood === "shock"
          ? "M -6 24 Q 0 34 6 24 Q 0 20 -6 24"
          : mood === "angry" || mood === "tense"
            ? "M -11 25 L 11 24"
            : mood === "proud"
              ? "M -10 25 Q 2 22 12 21"
              : "M -10 24 Q 0 27 10 24";
  return (
    <g transform={`translate(${look * 6} ${mood === "proud" ? -3 : 0})`}>
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
      <ellipse cx={-26} cy={14} rx={7} ry={4} fill="#e8a39a" opacity={0.4} />
      <ellipse cx={26} cy={14} rx={7} ry={4} fill="#e8a39a" opacity={0.4} />
    </g>
  );
};

// Персонаж романа. Точка опоры — между ступнями (0, 0), рост ≈ 470 · s.
export const Person: React.FC<{
  who: Who; x: number; y: number; s?: number; mood?: FigMood; pose?: FigPose; t?: number; flip?: boolean; look?: number; opacity?: number; seed?: number; hold?: "letter" | "book" | "fan";
}> = ({ who, x, y, s: s0 = 1, mood = "neutral", pose = "stand", t = 0, flip = false, look = 0, opacity = 1, seed = 0, hold }) => {
  const s = s0 * 1.18; // персонажи крупнее для телефона
  const L = LOOKS[who];
  const H = L.h ?? 1;
  const Wd = L.w ?? 1;
  const breathe = 1 + Math.sin(t * 1.7 + seed) * 0.008;
  const walk = pose === "walk" ? Math.sin(t * 6 + seed) : 0;
  const dance = pose === "dance" ? Math.sin(t * 3 + seed) : 0;
  const blinkPhase = (t * 0.37 + seed * 0.21) % 1;
  const blink = blinkPhase > 0.965 ? 1 : 0;
  const sit = pose === "sit" ? 1 : 0;
  const bow = pose === "bow" ? 1 : 0;
  const legH = 150 * H * (1 - sit * 0.45);
  const bodyH = 175 * H;
  const bw = 58 * Wd;
  const top = -legH - bodyH;
  const headY = top - 42;
  const coat = L.coat;
  const coat2 = L.coat2;
  const arms: Record<FigPose, [number, number, number, number]> = {
    stand: [8, 6, 8, 6],
    walk: [8 + walk * 14, 4, 8 - walk * 14, 4],
    sit: [20, -50, 20, -50],
    read: [35, -95, 35, -95],
    reach: [10, 8, 75, 5],
    bow: [10, 0, 10, 0],
    cover: [20, -150, 20, -150],
    point: [8, 6, 85, 0],
    hold: [25, -70, 25, -70],
    cross: [30, -120, 30, -120],
    dance: [60 + dance * 10, 40, 100 - dance * 10, 30],
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
    const sleeve = L.dress ? SKIN : coat2;
    return (
      <g key={side}>
        <path d={`M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`} stroke={OL} strokeWidth={(L.dress ? 18 : 24) * Math.min(1.1, Wd) + 7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`} stroke={sleeve} strokeWidth={(L.dress ? 18 : 24) * Math.min(1.1, Wd)} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {L.dress && <circle cx={sx} cy={sy + 6} r={17} fill={coat} stroke={OL} strokeWidth={3.5} />}
        <circle cx={hx} cy={hy} r={11} fill={L.dress ? SKIN : "#ffffff"} stroke={OL} strokeWidth={3} />
      </g>
    );
  };
  const waist = top + 52; // высокая талия платья
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`} opacity={opacity}>
      <ellipse cx={0} cy={2} rx={bw * 1.4} ry={12} fill="#000" opacity={0.12} />
      <g transform={`rotate(${dance * 3} 0 0)`}>
        {/* ноги / юбка */}
        {L.dress ? (
          <path
            d={`M ${-bw * 0.85} ${waist} L ${-bw * 1.25 - walk * 6} -4 Q 0 10 ${bw * 1.25 + walk * 6} -4 L ${bw * 0.85} ${waist} Z`}
            fill={coat}
            stroke={OL}
            strokeWidth={4}
          />
        ) : (
          <g>
            <rect x={-28 + walk * 8} y={-legH} width={24} height={legH - 6} rx={10} fill="#efe2c6" stroke={OL} strokeWidth={3} transform={`rotate(${walk * 8} -16 ${-legH})`} />
            <rect x={4 - walk * 8} y={-legH} width={24} height={legH - 6} rx={10} fill="#efe2c6" stroke={OL} strokeWidth={3} transform={`rotate(${-walk * 8} 16 ${-legH})`} />
            <path d={`M ${-30 + walk * 8} ${-legH * 0.42} L ${-4 + walk * 8} ${-legH * 0.42} L ${-6 + walk * 8} -8 L ${-28 + walk * 8} -8 Z`} fill="#2a2638" />
            <path d={`M ${4 - walk * 8} ${-legH * 0.42} L ${28 - walk * 8} ${-legH * 0.42} L ${26 - walk * 8} -8 L ${6 - walk * 8} -8 Z`} fill="#2a2638" />
            <ellipse cx={-18 + walk * 18} cy={-6} rx={22} ry={10} fill="#2a2638" />
            <ellipse cx={18 - walk * 18} cy={-6} rx={22} ry={10} fill="#2a2638" />
          </g>
        )}
        {/* тело */}
        <g transform={`rotate(${bow * 22} 0 ${-legH}) translate(0 ${-legH}) scale(1 ${breathe}) translate(0 ${legH})`}>
          {L.dress ? (
            <g>
              <path d={`M ${-bw * 0.8} ${top + 26} Q ${-bw * 0.8} ${top} ${-bw * 0.45} ${top} L ${bw * 0.45} ${top} Q ${bw * 0.8} ${top} ${bw * 0.8} ${top + 26} L ${bw * 0.88} ${waist} L ${-bw * 0.88} ${waist} Z`} fill={coat} stroke={OL} strokeWidth={4} />
              <path d={`M ${-bw * 0.45} ${top} Q 0 ${top + 26} ${bw * 0.45} ${top}`} fill={SKIN} stroke={OL} strokeWidth={3} />
              {L.sash && <rect x={-bw * 0.92} y={waist - 8} width={bw * 1.84} height={14} rx={6} fill={L.sash} stroke={OL} strokeWidth={3} />}
            </g>
          ) : (
            <g>
              {/* фрак: полы сзади, жилет, белый шейный платок */}
              <path d={`M ${-bw * 0.9} ${-legH + 10} L ${-bw * 0.7} ${-legH + 120 * H} L ${-bw * 0.2} ${-legH + 6} Z`} fill={coat2} stroke={OL} strokeWidth={3.5} />
              <path d={`M ${bw * 0.9} ${-legH + 10} L ${bw * 0.7} ${-legH + 120 * H} L ${bw * 0.2} ${-legH + 6} Z`} fill={coat2} stroke={OL} strokeWidth={3.5} />
              <path d={`M ${-bw} ${top + 30} Q ${-bw} ${top} ${-bw * 0.55} ${top} L ${bw * 0.55} ${top} Q ${bw} ${top} ${bw} ${top + 30} L ${bw * 0.95} ${-legH + 14} L ${-bw * 0.95} ${-legH + 14} Z`} fill={coat} stroke={OL} strokeWidth={4} />
              <path d={`M ${-bw * 0.35} ${top + 6} L 0 ${-legH + 8} L ${bw * 0.35} ${top + 6} Z`} fill={L.vest ?? "#efe2c6"} stroke={OL} strokeWidth={3} />
              <path d={`M -22 ${top - 4} Q 0 ${top + 30} 22 ${top - 4} Z`} fill="#ffffff" stroke={OL} strokeWidth={3} />
              {[0, 1, 2].map((i) => (
                <circle key={i} cx={0} cy={top + 44 + i * 26 * H} r={3.5} fill={OL} />
              ))}
            </g>
          )}
          {arm(-1, la, le)}
          {arm(1, ra, re)}
          {hold === "letter" && (
            <g transform={`translate(${bw * 0.15} ${top + 70}) rotate(-6)`}>
              <rect x={-46} y={-30} width={92} height={62} rx={4} fill={C.cream} stroke={OL} strokeWidth={3.5} />
              {[0, 1, 2].map((i) => <line key={i} x1={-32} x2={32} y1={-14 + i * 14} y2={-14 + i * 14} stroke={C.inkSoft} strokeWidth={3} opacity={0.6} />)}
            </g>
          )}
          {(pose === "read" || hold === "book") && (
            <g transform={`translate(0 ${top + 70})`}>
              <path d="M -50 0 L 0 8 L 50 0 L 50 44 L 0 52 L -50 44 Z" fill={C.cream} stroke={OL} strokeWidth={4} />
              <path d="M 0 8 L 0 52" stroke={OL} strokeWidth={3} />
            </g>
          )}
          {/* голова */}
          <g transform={`translate(0 ${headY})`}>
            <rect x={-12} y={34} width={24} height={16} fill={SKIN_SH} />
            <ellipse cx={0} cy={0} rx={42} ry={47} fill={SKIN} stroke={OL} strokeWidth={4} />
            {!L.bald && !L.dress && <path d="M -42 -6 Q -46 -54 0 -54 Q 46 -54 42 -6 Q 34 -24 18 -30 Q 0 -22 -16 -32 Q -32 -24 -42 -6 Z" fill={L.hair} stroke={OL} strokeWidth={3} />}
            {!L.dress && <path d="M -42 -4 L -44 22 M 42 -4 L 44 22" stroke={L.hair} strokeWidth={8} strokeLinecap="round" />}
            {L.dress && (
              <g>
                <path d="M -44 4 Q -48 -52 0 -52 Q 48 -52 44 4 Q 36 -28 0 -32 Q -36 -28 -44 4 Z" fill={L.hair} stroke={OL} strokeWidth={3} />
                {!L.hat && <circle cx={0} cy={-54} r={20} fill={L.hair} stroke={OL} strokeWidth={3} />}
                {L.curls && [-1, 1].map((d) => <circle key={d} cx={d * 44} cy={4} r={10} fill={L.hair} stroke={OL} strokeWidth={2.5} />)}
              </g>
            )}
            <Face mood={mood} look={look} blink={blink} />
            {L.glasses && (
              <g stroke={OL} strokeWidth={2.6} fill="none">
                <circle cx={-17} cy={2} r={11} />
                <circle cx={17} cy={2} r={11} />
                <line x1={-6} y1={2} x2={6} y2={2} />
              </g>
            )}
            {L.hat === "top" && (
              <g>
                <rect x={-32} y={-120} width={64} height={76} rx={6} fill={L.hatColor} stroke={OL} strokeWidth={4} />
                <rect x={-52} y={-50} width={104} height={12} rx={6} fill={L.hatColor} stroke={OL} strokeWidth={4} />
              </g>
            )}
            {L.hat === "bonnet" && (
              <g>
                <path d="M -56 22 Q -64 -70 0 -72 Q 64 -70 56 22 Q 46 -36 0 -40 Q -46 -36 -56 22 Z" fill={L.hatColor} stroke={OL} strokeWidth={4} />
                <path d="M -40 30 Q 0 52 40 30" stroke={C.rose} strokeWidth={5} fill="none" strokeLinecap="round" />
              </g>
            )}
            {L.hat === "cap" && <path d="M -48 -4 Q -54 -66 0 -66 Q 54 -66 48 -4 Q 40 -36 0 -40 Q -40 -36 -48 -4 Z" fill={L.hatColor} stroke={OL} strokeWidth={3.5} />}
            {L.hat === "turban" && (
              <g>
                <path d="M -50 -14 Q -58 -92 0 -94 Q 58 -92 50 -14 Q 30 -40 0 -40 Q -30 -40 -50 -14 Z" fill={L.hatColor} stroke={OL} strokeWidth={4} />
                <path d="M 18 -88 Q 40 -130 60 -112" stroke={C.gold} strokeWidth={7} fill="none" strokeLinecap="round" />
              </g>
            )}
          </g>
        </g>
      </g>
    </g>
  );
};

// Дом с колоннами (Пемберли) или скромный (Лонгборн): фасад, окна, свет.
export const Manor: React.FC<{ x: number; y: number; s?: number; grand?: boolean; t?: number; color?: string }> = ({ x, y, s = 1, grand = false, t = 0, color }) => {
  const w = grand ? 820 : 560;
  const h = grand ? 330 : 280;
  const fill = color ?? (grand ? "#e9dcc0" : "#d9b48c");
  const cols = grand ? 9 : 5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={fill} stroke={OL} strokeWidth={5} />
      <path d={`M ${-w / 2 - 24} ${-h} L 0 ${-h - (grand ? 120 : 150)} L ${w / 2 + 24} ${-h} Z`} fill={grand ? "#c9b48c" : C.brick} stroke={OL} strokeWidth={5} />
      {grand &&
        [-3, -1, 1, 3].map((i) => <rect key={i} x={i * 60 - 14} y={-h + 20} width={28} height={h - 20} fill="#fbf5e8" stroke={OL} strokeWidth={3.5} />)}
      {Array.from({ length: cols }).map((_, c) =>
        [0, 1].map((r) => {
          const cx = -w / 2 + (w / cols) * (c + 0.5);
          if (grand && Math.abs(cx) < 200) return null;
          const lit = 0.75 + 0.25 * Math.sin(t * 0.7 + c + r * 2);
          return <rect key={`${c}-${r}`} x={cx - 22} y={-h + 40 + r * 130} width={44} height={74} rx={4} fill={C.yellow} opacity={0.5 * lit + 0.2} stroke={OL} strokeWidth={3} />;
        }),
      )}
      <rect x={-36} y={-110} width={72} height={110} rx={30} fill="#6b4a3a" stroke={OL} strokeWidth={4} />
      <rect x={-w / 2 - 40} y={-6} width={w + 80} height={12} rx={6} fill="#9a8a6a" stroke={OL} strokeWidth={3} />
    </g>
  );
};

export const Tree: React.FC<{ x: number; y: number; s?: number; t?: number; color?: string }> = ({ x, y, s = 1, t = 0, color = C.sage }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t * 0.8 + x) * 1.2})`}>
    <rect x={-14} y={-120} width={28} height={120} fill="#7a5a3a" stroke={OL} strokeWidth={3.5} />
    <circle cx={0} cy={-190} r={90} fill={color} stroke={OL} strokeWidth={4} />
    <circle cx={-60} cy={-140} r={56} fill={color} stroke={OL} strokeWidth={4} />
    <circle cx={60} cy={-140} r={56} fill={color} stroke={OL} strokeWidth={4} />
  </g>
);

export const BookObj: React.FC<{ x: number; y: number; s?: number; label?: string; color?: string; rot?: number }> = ({ x, y, s = 1, label, color = "#7a3a4a", rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-96} y={-126} width={192} height={252} rx={10} fill="#5a2a36" stroke={OL} strokeWidth={5} />
    <rect x={-90} y={-126} width={180} height={246} rx={10} fill={color} stroke={OL} strokeWidth={5} />
    <rect x={-74} y={-108} width={148} height={210} rx={6} fill="none" stroke={C.gold} strokeWidth={3} />
    <circle cx={0} cy={54} r={18} fill="none" stroke={C.gold} strokeWidth={3} />
    <circle cx={0} cy={54} r={6} fill={C.gold} />
    {label && (
      <text x={0} y={-30} fontFamily={SERIF} fontWeight={700} fontSize={24} fill={C.cream} textAnchor="middle">
        {label.split("\n").map((l, i) => (
          <tspan key={i} x={0} dy={i === 0 ? -10 : 30}>
            {l}
          </tspan>
        ))}
      </text>
    )}
  </g>
);

// Письмо: лист с проявляющимися строками; k — сколько строк проявилось (0…1).
export const LetterSheet: React.FC<{ x: number; y: number; s?: number; k?: number; rot?: number; title?: string; lines?: number; highlight?: number[] }> = ({ x, y, s = 1, k = 1, rot = 0, title, lines = 9, highlight = [] }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-236} y={-306} width={480} height={620} rx={8} fill="#000" opacity={0.12} />
    <rect x={-240} y={-310} width={480} height={620} rx={8} fill={C.cream} stroke={OL} strokeWidth={5} />
    {title && (
      <text x={-196} y={-246} fontFamily={SERIF} fontWeight={700} fontSize={34} fill={C.ink}>
        {title}
      </text>
    )}
    {Array.from({ length: lines }).map((_, i) => {
      const kk = Math.max(0, Math.min(1, k * lines - i));
      const w = 380 - ((i * 37) % 90);
      const yy = -190 + i * 52;
      return (
        <g key={i}>
          {highlight.includes(i) && kk > 0.5 && <rect x={-206} y={yy - 18} width={w + 12} height={30} rx={6} fill={C.yellow} opacity={0.55} />}
          <line x1={-200} y1={yy} x2={-200 + w * kk} y2={yy} stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    })}
  </g>
);

// Бумажная карточка-ярлык (подписи предметов).
export const Label: React.FC<{ x: number; y: number; text: string; size?: number; bg?: string; color?: string; opacity?: number; serif?: boolean; rot?: number }> = ({ x, y, text, size: s0 = 34, bg = C.cream, color = C.ink, opacity = 1, serif = false, rot = 0 }) => {
  const size = s0 * 1.15; // крупнее для телефона
  const w = text.length * size * 0.56 + size * 1.1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={opacity}>
      <rect x={-w / 2 + 4} y={-size * 0.95 + 6} width={w} height={size * 1.6} rx={size * 0.4} fill="#000" opacity={0.13} />
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

// Карета (для отъездов и поездок): кузов, колёса крутятся со временем.
export const Carriage: React.FC<{ x: number; y: number; s?: number; t?: number; color?: string; flip?: boolean }> = ({ x, y, s = 1, t = 0, color = "#3d5a78", flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <path d="M -160 -60 Q -170 -190 -40 -200 L 110 -200 Q 170 -190 160 -60 Z" fill={color} stroke={OL} strokeWidth={5} />
    <rect x={-100} y={-170} width={80} height={70} rx={8} fill={C.sky} stroke={OL} strokeWidth={4} />
    <rect x={20} y={-170} width={80} height={70} rx={8} fill={C.sky} stroke={OL} strokeWidth={4} />
    {[-100, 100].map((cx) => (
      <g key={cx} transform={`translate(${cx} -40) rotate(${(t * 220) % 360})`}>
        <circle r={46} fill="none" stroke={OL} strokeWidth={8} />
        {[0, 60, 120].map((a) => <line key={a} x1={-44} y1={0} x2={44} y2={0} stroke={OL} strokeWidth={5} transform={`rotate(${a})`} />)}
      </g>
    ))}
  </g>
);

// Стол кабинета наблюдения с бумагами (передний план для банана).
export const Desk: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 900 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={0} width={w} height={34} rx={10} fill="#a8744a" stroke={OL} strokeWidth={5} />
    <rect x={-w / 2 + 40} y={34} width={30} height={120} fill="#8a5c38" stroke={OL} strokeWidth={4} />
    <rect x={w / 2 - 70} y={34} width={30} height={120} fill="#8a5c38" stroke={OL} strokeWidth={4} />
  </g>
);

export { FONT };
