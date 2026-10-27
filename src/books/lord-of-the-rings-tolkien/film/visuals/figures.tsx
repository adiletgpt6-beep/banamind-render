// Персонажи «Музея искушений» — собственные простые фигурки BanaMind (не образы фильмов
// и не иллюстрации изданий): узнаваемы по росту, силуэту и цвету. Точка опоры — между
// ступнями (0, 0). Кольцо — золотой круг со свечением. Постамент музея и табличка экспоната.
import React from "react";
import { C, FONT } from "../theme";
import { Txt, wob } from "./kit";

export const OL = "#2b2438"; // обводка

export type FigureKind = "hobbit" | "sam" | "wizard" | "whiteWizard" | "elf" | "lady" | "dwarf" | "man" | "gollum" | "ent" | "shadow";
export type FigureMood = "calm" | "happy" | "sad" | "angry" | "scared" | "wild";

type FigProps = {
  kind: FigureKind;
  x: number;
  y: number;
  s?: number;
  color?: string; // основной цвет одежды
  label?: string;
  mood?: FigureMood;
  t?: number;
  arm?: "down" | "out" | "up" | "push" | "hold";
  flip?: boolean;
  eyes?: string; // цвет глаз (зелёный огонь Горлума)
  opacity?: number;
  bob?: boolean; // лёгкое покачивание «дыхание»
};

const SIZE: Record<FigureKind, { h: number; w: number }> = {
  hobbit: { h: 170, w: 86 },
  sam: { h: 172, w: 92 },
  gollum: { h: 130, w: 70 },
  dwarf: { h: 200, w: 110 },
  man: { h: 300, w: 96 },
  wizard: { h: 320, w: 104 },
  whiteWizard: { h: 320, w: 104 },
  elf: { h: 310, w: 84 },
  lady: { h: 320, w: 100 },
  ent: { h: 380, w: 130 },
  shadow: { h: 330, w: 150 },
};

const DEF_COLOR: Record<FigureKind, string> = {
  hobbit: "#3f8f5a",
  sam: "#a2783a",
  gollum: "#9fb09a",
  dwarf: "#b45a3c",
  man: "#5a6e8f",
  wizard: "#8d93a3",
  whiteWizard: "#f4f4f8",
  elf: "#5fae9e",
  lady: "#dfe8f4",
  ent: "#7b5a3a",
  shadow: "#3a3445",
};

const Face: React.FC<{ r: number; mood: FigureMood; eyes?: string; big?: boolean; skin?: string }> = ({ r, mood, eyes = OL, big, skin = "#ffd9b8" }) => {
  const er = r * (big ? 0.2 : 0.12);
  const ex = r * 0.38;
  const ey = -r * 0.08;
  const mouth =
    mood === "happy" ? `M ${-r * 0.3} ${r * 0.3} Q 0 ${r * 0.58} ${r * 0.3} ${r * 0.3}` :
    mood === "sad" ? `M ${-r * 0.28} ${r * 0.45} Q 0 ${r * 0.25} ${r * 0.28} ${r * 0.45}` :
    mood === "angry" || mood === "wild" ? `M ${-r * 0.28} ${r * 0.42} L ${r * 0.28} ${r * 0.36}` :
    mood === "scared" ? `M ${-r * 0.12} ${r * 0.42} a ${r * 0.12} ${r * 0.14} 0 1 0 ${r * 0.24} 0 a ${r * 0.12} ${r * 0.14} 0 1 0 ${-r * 0.24} 0` :
    `M ${-r * 0.24} ${r * 0.36} Q 0 ${r * 0.46} ${r * 0.24} ${r * 0.36}`;
  return (
    <g>
      <circle r={r} fill={skin} stroke={OL} strokeWidth={5} />
      <circle cx={-ex} cy={ey} r={er} fill={eyes} />
      <circle cx={ex} cy={ey} r={er} fill={eyes} />
      {big && <circle cx={-ex + er * 0.3} cy={ey - er * 0.3} r={er * 0.35} fill="#fff" />}
      {big && <circle cx={ex + er * 0.3} cy={ey - er * 0.3} r={er * 0.35} fill="#fff" />}
      {(mood === "angry" || mood === "wild") && (
        <path d={`M ${-ex - er * 1.6} ${ey - er * 2.4} L ${-ex + er * 1.4} ${ey - er * 1.3} M ${ex + er * 1.6} ${ey - er * 2.4} L ${ex - er * 1.4} ${ey - er * 1.3}`} stroke={OL} strokeWidth={5} strokeLinecap="round" />
      )}
      {mood === "sad" && <path d={`M ${-ex - er * 1.5} ${ey - er * 1.4} L ${-ex + er * 1.2} ${ey - er * 2.3} M ${ex + er * 1.5} ${ey - er * 1.4} L ${ex - er * 1.2} ${ey - er * 2.3}`} stroke={OL} strokeWidth={4} strokeLinecap="round" />}
      <path d={mouth} fill={mood === "scared" ? OL : "none"} stroke={OL} strokeWidth={4.5} strokeLinecap="round" />
    </g>
  );
};

// рука: от плеча к кисти, белая «варежка»
const Arm: React.FC<{ sx: number; sy: number; pose: FigProps["arm"]; side: 1 | -1; len: number; color: string }> = ({ sx, sy, pose = "down", side, len, color }) => {
  const ang = pose === "up" ? 160 : pose === "out" ? 80 : pose === "push" ? 95 : pose === "hold" ? 50 : 18;
  const a = (ang * Math.PI) / 180;
  const hx = sx + side * Math.sin(a) * len;
  const hy = sy + Math.cos(a) * len;
  return (
    <g>
      <line x1={sx} y1={sy} x2={hx} y2={hy} stroke={OL} strokeWidth={len * 0.28 + 9} strokeLinecap="round" />
      <line x1={sx} y1={sy} x2={hx} y2={hy} stroke={color} strokeWidth={len * 0.28} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={len * 0.17} fill="#ffe3c9" stroke={OL} strokeWidth={4} />
    </g>
  );
};

export const Figure: React.FC<FigProps> = ({ kind, x, y, s = 1, color, label, mood = "calm", t = 0, arm = "down", flip, eyes, opacity = 1, bob = true }) => {
  const { h, w } = SIZE[kind];
  const col = color ?? DEF_COLOR[kind];
  const breathe = bob ? Math.sin(t * 2 + x * 0.01) * 3 : 0;
  const headR = kind === "hobbit" || kind === "sam" ? 40 : kind === "gollum" ? 38 : kind === "dwarf" ? 38 : 34;
  const bodyTop = -h + headR * 2;
  const bodyH = h - headR * 2 - (kind === "hobbit" || kind === "sam" ? 24 : 18);
  const body = (() => {
    switch (kind) {
      case "wizard":
      case "whiteWizard":
      case "lady":
        // длинная мантия-трапеция
        return <path d={`M ${-w * 0.32} ${bodyTop} L ${w * 0.32} ${bodyTop} L ${w * 0.62} -14 Q 0 6 ${-w * 0.62} -14 Z`} fill={col} stroke={OL} strokeWidth={5} strokeLinejoin="round" />;
      case "elf":
        return <path d={`M ${-w * 0.3} ${bodyTop} L ${w * 0.3} ${bodyTop} L ${w * 0.42} -16 L ${-w * 0.42} -16 Z`} fill={col} stroke={OL} strokeWidth={5} strokeLinejoin="round" />;
      case "ent":
        return (
          <g>
            <path d={`M ${-w * 0.36} ${bodyTop - 40} Q ${-w * 0.5} ${-h * 0.5} ${-w * 0.42} -8 L ${w * 0.42} -8 Q ${w * 0.5} ${-h * 0.5} ${w * 0.36} ${bodyTop - 40} Z`} fill={col} stroke={OL} strokeWidth={5} />
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${-w * 0.2 + i * w * 0.2} ${bodyTop} q 6 ${bodyH * 0.4} -4 ${bodyH * 0.8}`} stroke="#5c4128" strokeWidth={5} fill="none" />
            ))}
          </g>
        );
      case "shadow":
        return <path d={`M 0 ${-h} C ${w * 0.8} ${-h * 0.8} ${w * 0.7} -40 ${w * 0.5} 0 L ${-w * 0.5} 0 C ${-w * 0.7} -40 ${-w * 0.8} ${-h * 0.8} 0 ${-h} Z`} fill={col} opacity={0.9} />;
      default:
        return <rect x={-w / 2} y={bodyTop} width={w} height={bodyH} rx={w * 0.4} fill={col} stroke={OL} strokeWidth={5} />;
    }
  })();
  const headY = -h + headR;
  const feet =
    kind === "hobbit" || kind === "sam" ? (
      <g>
        <ellipse cx={-20} cy={-8} rx={22} ry={12} fill="#c98a52" stroke={OL} strokeWidth={4} />
        <ellipse cx={20} cy={-8} rx={22} ry={12} fill="#c98a52" stroke={OL} strokeWidth={4} />
      </g>
    ) : kind === "gollum" ? (
      <g>
        <ellipse cx={-18} cy={-6} rx={20} ry={8} fill="#b9c7b2" stroke={OL} strokeWidth={4} />
        <ellipse cx={18} cy={-6} rx={20} ry={8} fill="#b9c7b2" stroke={OL} strokeWidth={4} />
      </g>
    ) : kind === "ent" ? (
      <g>
        <path d="M -50 -8 l -26 8 M -30 -8 l -10 8 M 50 -8 l 26 8 M 30 -8 l 10 8" stroke="#5c4128" strokeWidth={7} strokeLinecap="round" />
      </g>
    ) : kind === "shadow" ? null : (
      <g>
        <rect x={-30} y={-18} width={24} height={18} rx={6} fill="#3d3340" />
        <rect x={6} y={-18} width={24} height={18} rx={6} fill="#3d3340" />
      </g>
    );
  const skin = kind === "gollum" ? "#d8e2cf" : kind === "ent" ? "#a07c55" : "#ffd9b8";
  const shoulderY = bodyTop + 26;
  const armLen = kind === "hobbit" || kind === "sam" || kind === "gollum" ? 62 : 92;
  return (
    <g transform={`translate(${x} ${y + breathe * 0.3}) scale(${flip ? -s : s} ${s})`} opacity={opacity}>
      <ellipse cx={0} cy={0} rx={w * 0.7} ry={12} fill="#000" opacity={0.08} />
      {feet}
      {kind !== "shadow" && <Arm sx={-w * 0.42} sy={shoulderY} pose="down" side={-1} len={armLen} color={col} />}
      {body}
      {kind !== "shadow" && <Arm sx={w * 0.42} sy={shoulderY} pose={arm} side={1} len={armLen} color={col} />}
      {/* голова и детали */}
      {kind === "shadow" ? (
        <g>
          <circle cx={-20} cy={-h * 0.7} r={9} fill={C.ember} />
          <circle cx={20} cy={-h * 0.7} r={9} fill={C.ember} />
        </g>
      ) : (
        <g transform={`translate(0 ${headY + breathe})`}>
          {(kind === "lady" || kind === "elf") && <path d={`M ${-headR * 1.05} ${-headR * 0.2} Q ${-headR * 1.3} ${headR * 2.4} ${-headR * 0.4} ${headR * 2.6} L ${headR * 0.4} ${headR * 2.6} Q ${headR * 1.3} ${headR * 2.4} ${headR * 1.05} ${-headR * 0.2} Z`} fill={kind === "lady" ? "#f2d27a" : "#e9d9a8"} stroke={OL} strokeWidth={4} />}
          <Face r={headR} mood={mood} eyes={eyes} big={kind === "gollum"} skin={skin} />
          {(kind === "hobbit" || kind === "sam") &&
            [-0.8, -0.4, 0, 0.4, 0.8].map((k, i) => <circle key={i} cx={k * headR} cy={-headR * 0.85 + Math.abs(k) * 12} r={headR * 0.3} fill={kind === "sam" ? "#8a5a2b" : "#5b3a22"} stroke={OL} strokeWidth={3} />)}
          {(kind === "wizard" || kind === "whiteWizard") && (
            <g>
              <path d={`M ${-headR * 0.8} ${headR * 0.3} Q 0 ${headR * 2.6} ${headR * 0.8} ${headR * 0.3} Z`} fill={kind === "whiteWizard" ? "#ffffff" : "#e6e6ea"} stroke={OL} strokeWidth={4} />
              {kind === "wizard" && <path d={`M ${-headR * 1.5} ${-headR * 0.55} L ${headR * 1.5} ${-headR * 0.55} L ${headR * 0.2} ${-headR * 2.9} Z`} fill={col} stroke={OL} strokeWidth={5} strokeLinejoin="round" />}
            </g>
          )}
          {kind === "dwarf" && (
            <g>
              <path d={`M ${-headR * 0.9} ${headR * 0.25} Q 0 ${headR * 2.8} ${headR * 0.9} ${headR * 0.25} Z`} fill="#b5652f" stroke={OL} strokeWidth={4} />
              <path d={`M ${-headR} ${-headR * 0.35} Q 0 ${-headR * 1.7} ${headR} ${-headR * 0.35} Z`} fill="#9aa3ad" stroke={OL} strokeWidth={4} />
            </g>
          )}
          {kind === "man" && <path d={`M ${-headR * 0.95} ${-headR * 0.3} Q 0 ${-headR * 1.5} ${headR * 0.95} ${-headR * 0.3} Q ${headR * 0.6} ${-headR * 0.75} 0 ${-headR * 0.8} Q ${-headR * 0.6} ${-headR * 0.75} ${-headR * 0.95} ${-headR * 0.3} Z`} fill="#4a3526" />}
          {kind === "gollum" && <path d={`M ${-headR * 0.5} ${-headR * 0.9} q 4 -14 8 0 M ${headR * 0.2} ${-headR * 0.95} q 4 -14 8 0`} stroke={OL} strokeWidth={3} fill="none" />}
          {kind === "ent" && <path d={`M ${-headR} ${-headR * 0.6} q -30 -50 -10 -80 M ${headR} ${-headR * 0.6} q 30 -50 10 -80 M 0 ${-headR} q 0 -40 10 -70`} stroke="#5c4128" strokeWidth={7} fill="none" strokeLinecap="round" />}
          {kind === "ent" && <circle cx={headR * 0.7} cy={-headR * 1.6 + wob(t, 3, 4)} r={18} fill={C.moss} />}
        </g>
      )}
      {label && (
        <g transform={`scale(${flip ? -1 : 1} 1)`}>
          <Txt x={0} y={44} size={32} weight={900} color={C.ink}>
            {label}
          </Txt>
        </g>
      )}
    </g>
  );
};

// Кольцо: золотой круг с бликом и свечением (без надписей и шрифтов из экранизаций)
export const Ring: React.FC<{ x: number; y: number; r?: number; glow?: number; t?: number; dim?: number; rot?: number }> = ({ x, y, r = 60, glow = 0.6, t = 0, dim = 0, rot = 0 }) => {
  const g = glow * (0.75 + 0.25 * Math.sin(t * 2.2));
  const id = `ringG${Math.round(r)}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <defs>
        <radialGradient id={`${id}glow`}>
          <stop offset="0%" stopColor="#ffe9a0" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#ffe9a0" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}band`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={dim > 0.5 ? "#b9ad93" : "#fff2b8"} />
          <stop offset="45%" stopColor={dim > 0.5 ? "#9c8f74" : "#f2b630"} />
          <stop offset="100%" stopColor={dim > 0.5 ? "#7a705c" : "#b77a0a"} />
        </linearGradient>
      </defs>
      {g > 0 && <circle r={r * 2.4} fill={`url(#${id}glow)`} opacity={g * (1 - dim)} />}
      <circle r={r} fill="none" stroke={OL} strokeWidth={r * 0.36 + 8} />
      <circle r={r} fill="none" stroke={`url(#${id}band)`} strokeWidth={r * 0.36} />
      <path d={`M ${-r * 0.75} ${-r * 0.55} A ${r} ${r} 0 0 1 ${r * 0.2} ${-r * 0.98}`} stroke="#fff" strokeWidth={r * 0.09} fill="none" strokeLinecap="round" opacity={0.85 * (1 - dim)} />
    </g>
  );
};

// постамент экспоната
export const Plinth: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 300, h = 220 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 - 20} y={-18} width={w + 40} height={26} rx={8} fill="#e8dcc3" stroke={OL} strokeWidth={4} />
    <rect x={-w / 2} y={8} width={w} height={h} fill="#f6efdf" stroke={OL} strokeWidth={4} />
    <rect x={-w / 2 - 26} y={h + 8} width={w + 52} height={24} rx={8} fill="#e8dcc3" stroke={OL} strokeWidth={4} />
    <line x1={-w / 2 + 30} y1={30} x2={-w / 2 + 30} y2={h - 10} stroke="#dccfb2" strokeWidth={8} />
    <line x1={w / 2 - 30} y1={30} x2={w / 2 - 30} y2={h - 10} stroke="#dccfb2" strokeWidth={8} />
  </g>
);

// табличка экспоната: «Книга IV, гл. 1» и т. п.
export const Label: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; bg?: string }> = ({ x, y, text, size = 30, color = C.ink, bg = "#fff" }) => {
  const w = text.length * size * 0.55 + size * 1.4;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 + 4} y={-size * 0.95 + 6} width={w} height={size * 1.6} rx={10} fill="#000" opacity={0.08} />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={10} fill={bg} stroke={OL} strokeWidth={3} />
      <text x={0} y={size * 0.12} fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};
