// Рисованные персонажи и предметы фильма BM-025 (основа — набор BM-021) — собственный 2D-стиль BanaMind
// (чистый вектор: плотные заливки, ровный контур, без размытия и растров).
// Люди в мини-историях — вымышленные обобщённые герои фильма, не реальные лица
// и не иллюстрации издания.
import React from "react";
import { C, DISPLAY, FONT } from "../theme";

export const OL = "#1f2240"; // контур

export type Who =
  | "anna" | "timur" | "seller" | "friend" | "expert" | "doctor" | "kid" | "grandma" | "guest" | "officer" | "student" | "neighbor" | "crowd" | "boss";

type Look = {
  top: string; top2: string; legs: string; hair: string; skirt?: boolean; h?: number; w?: number;
  bald?: boolean; glasses?: boolean; coat?: boolean; tie?: string; cap?: string; long?: boolean; beard?: string; badge?: boolean;
};

export const LOOKS: Record<Who, Look> = {
  anna: { top: "#3fa7c9", top2: "#2b86a6", legs: "#33406a", hair: "#5a3a2a", long: true, h: 0.98, w: 0.92 },
  timur: { top: "#e0794a", top2: "#c25e33", legs: "#2f3a5a", hair: "#2a1e18", h: 1.05, w: 1.05 },
  seller: { top: "#f2f2f2", top2: "#d9d9e0", legs: "#2c3350", hair: "#3b2a22", tie: "#e5484d", h: 1.02 },
  friend: { top: "#8b6bd6", top2: "#6c4fb8", legs: "#383a5a", hair: "#e0b25a", long: true, h: 0.95, w: 0.92 },
  expert: { top: "#ffffff", top2: "#dfe4ee", legs: "#3a4060", hair: "#9a9aa6", coat: true, glasses: true, h: 1.0 },
  doctor: { top: "#ffffff", top2: "#dfe4ee", legs: "#3a5a70", hair: "#3a2a22", coat: true, h: 1.0, w: 1.0 },
  kid: { top: "#ffb03b", top2: "#e08f1a", legs: "#3d6fd0", hair: "#6a4428", h: 0.62, w: 0.8 },
  grandma: { top: "#b07aa8", top2: "#8f5f88", legs: "#5a4a6a", hair: "#d9d9de", skirt: true, glasses: true, h: 0.9 },
  guest: { top: "#5fbf8a", top2: "#3f9a68", legs: "#2f3a5a", hair: "#1f1a18", h: 1.0 },
  officer: { top: "#2f4f8a", top2: "#223a6a", legs: "#223a6a", hair: "#2a201a", cap: "#223a6a", badge: true, h: 1.04 },
  student: { top: "#4fb3e8", top2: "#3592c4", legs: "#3a3f5a", hair: "#2b1f18", glasses: true, h: 0.98 },
  neighbor: { top: "#d4a24a", top2: "#b0822e", legs: "#4a4a5a", hair: "#7a5a3a", beard: "#7a5a3a", h: 1.02, w: 1.1 },
  crowd: { top: "#8a93c0", top2: "#6c75a2", legs: "#4a5070", hair: "#4a4040", h: 1.0 },
  boss: { top: "#2f3550", top2: "#22273c", legs: "#22273c", hair: "#c9c4b8", tie: "#3d8bff", h: 1.03, w: 1.08 },
};

export type FigMood = "neutral" | "smile" | "kind" | "think" | "doubt" | "tense" | "shock" | "happy";
export type FigPose = "stand" | "walk" | "give" | "take" | "point" | "phone" | "think" | "wave" | "shrug" | "stop" | "hold" | "arms";

const Face: React.FC<{ mood: FigMood; look: number; blink: number }> = ({ mood, look, blink }) => {
  const brow = { neutral: 0, smile: -0.1, kind: -0.25, think: 0.45, doubt: 0.6, tense: 0.8, shock: -1, happy: -0.3 }[mood];
  const by = mood === "shock" ? -6 : 0;
  const eyeH = Math.max(0.6, (mood === "shock" ? 7 : 5.6) * (1 - blink));
  const mouth =
    mood === "smile" || mood === "kind" || mood === "happy"
      ? mood === "happy"
        ? "M -13 20 Q 0 36 13 20 Z"
        : "M -12 22 Q 0 31 12 22"
      : mood === "doubt"
        ? "M -11 25 Q 0 21 11 27"
        : mood === "shock"
          ? "M -6 24 Q 0 34 6 24 Q 0 20 -6 24"
          : mood === "tense"
            ? "M -11 25 L 11 24"
            : mood === "think"
              ? "M -8 25 Q 2 23 10 26"
              : "M -10 24 Q 0 27 10 24";
  return (
    <g transform={`translate(${look * 6} 0)`}>
      {[-1, 1].map((d) => (
        <g key={d}>
          <ellipse cx={d * 17} cy={2} rx={4.8} ry={eyeH} fill={OL} />
          <circle cx={d * 17 + 1.6} cy={0} r={1.4} fill="#fff" opacity={eyeH > 2 ? 0.9 : 0} />
          <path d={`M ${d * 26} ${-12 + by - brow * 2 * (mood === "doubt" && d > 0 ? -1 : 1)} L ${d * 8} ${-12 + by + brow * 4}`} stroke={OL} strokeWidth={3.6} strokeLinecap="round" />
        </g>
      ))}
      <path d={mouth} stroke={OL} strokeWidth={3.2} fill={mood === "shock" ? "#7a3b3b" : mood === "happy" ? "#fff" : "none"} strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={-26} cy={14} rx={7} ry={4} fill="#ee9a90" opacity={0.4} />
      <ellipse cx={26} cy={14} rx={7} ry={4} fill="#ee9a90" opacity={0.4} />
    </g>
  );
};

// Персонаж мини-истории. Точка опоры — между ступнями (0, 0), рост ≈ 430 · s.
// item — то, что в правой руке (подарок, телефон, листок…).
export const Person: React.FC<{
  who: Who; x: number; y: number; s?: number; mood?: FigMood; pose?: FigPose; t?: number; flip?: boolean; look?: number; opacity?: number; seed?: number; item?: React.ReactNode; color?: string;
}> = ({ who, x, y, s: s0 = 1, mood = "neutral", pose = "stand", t = 0, flip = false, look = 0, opacity = 1, seed = 0, item, color }) => {
  const s = s0 * 1.15;
  const L = LOOKS[who];
  const H = L.h ?? 1;
  const Wd = L.w ?? 1;
  const top0 = color ?? L.top;
  const breathe = 1 + Math.sin(t * 1.7 + seed) * 0.009;
  const walk = pose === "walk" ? Math.sin(t * 6 + seed) : 0;
  const blink = (t * 0.37 + seed * 0.21) % 1 > 0.965 ? 1 : 0;
  const legH = 150 * H;
  const bodyH = 175 * H;
  const bw = 62 * Wd;
  const top = -legH - bodyH;
  const headY = top - 42;
  const wave = pose === "wave" ? Math.sin(t * 7 + seed) * 18 : 0;
  // руки: угол плеча (0 — вниз), локоть; левая и правая
  const arms: Record<FigPose, [number, number, number, number]> = {
    stand: [8, 6, 8, 6],
    walk: [8 + walk * 14, 4, 8 - walk * 14, 4],
    give: [10, 6, 70, 20],
    take: [10, 6, 62, 30],
    point: [8, 6, 88, 0],
    phone: [8, 6, 30, -120],
    think: [30, -60, 25, -140],
    wave: [8, 6, 150 + wave, 20],
    shrug: [60, -110, 60, -110],
    stop: [8, 6, 80, -80],
    hold: [28, -70, 28, -70],
    arms: [40, -100, 40, -100],
  };
  const [la, le, ra, re] = arms[pose];
  let hand: { x: number; y: number } = { x: 0, y: 0 };
  const arm = (side: -1 | 1, a: number, e: number) => {
    const d2r = Math.PI / 180;
    const sx = side * (bw - 8);
    const sy = top + 22;
    const ex = sx + side * Math.sin(a * d2r) * 70 * H;
    const ey = sy + Math.cos(a * d2r) * 70 * H;
    const hx = ex + side * Math.sin((a + e) * d2r) * 64 * H;
    const hy = ey + Math.cos((a + e) * d2r) * 64 * H;
    if (side === 1) hand = { x: hx, y: hy };
    const sleeve = L.coat ? "#ffffff" : L.top2;
    return (
      <g key={side}>
        <path d={`M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`} stroke={OL} strokeWidth={26 * Math.min(1.1, Wd) + 7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`} stroke={sleeve} strokeWidth={26 * Math.min(1.1, Wd)} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={hx} cy={hy} r={12} fill={C.skin} stroke={OL} strokeWidth={3} />
      </g>
    );
  };
  const leftArm = arm(-1, la, le);
  const rightArm = arm(1, ra, re);
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`} opacity={opacity}>
      <ellipse cx={0} cy={2} rx={bw * 1.3} ry={12} fill="#000" opacity={0.14} />
      {/* ноги */}
      {L.skirt ? (
        <g>
          <rect x={-26} y={-legH * 0.45} width={20} height={legH * 0.45 - 6} rx={8} fill={C.skin} stroke={OL} strokeWidth={3} />
          <rect x={6} y={-legH * 0.45} width={20} height={legH * 0.45 - 6} rx={8} fill={C.skin} stroke={OL} strokeWidth={3} />
          <path d={`M ${-bw * 0.95} ${-legH - 6} L ${-bw * 1.15} ${-legH * 0.4} Q 0 ${-legH * 0.3} ${bw * 1.15} ${-legH * 0.4} L ${bw * 0.95} ${-legH - 6} Z`} fill={L.legs} stroke={OL} strokeWidth={4} />
          <ellipse cx={-16} cy={-6} rx={20} ry={10} fill="#2a2638" />
          <ellipse cx={16} cy={-6} rx={20} ry={10} fill="#2a2638" />
        </g>
      ) : (
        <g>
          <rect x={-30 + walk * 8} y={-legH} width={27} height={legH - 6} rx={11} fill={L.legs} stroke={OL} strokeWidth={3} transform={`rotate(${walk * 8} -17 ${-legH})`} />
          <rect x={3 - walk * 8} y={-legH} width={27} height={legH - 6} rx={11} fill={L.legs} stroke={OL} strokeWidth={3} transform={`rotate(${-walk * 8} 17 ${-legH})`} />
          <ellipse cx={-20 + walk * 18} cy={-6} rx={23} ry={11} fill="#2a2638" />
          <ellipse cx={20 - walk * 18} cy={-6} rx={23} ry={11} fill="#2a2638" />
        </g>
      )}
      {/* тело */}
      <g transform={`translate(0 ${-legH}) scale(1 ${breathe}) translate(0 ${legH})`}>
        {pose !== "give" && pose !== "take" && pose !== "point" && pose !== "phone" && pose !== "wave" && pose !== "stop" ? null : null}
        {leftArm}
        <path
          d={`M ${-bw} ${top + 30} Q ${-bw} ${top} ${-bw * 0.55} ${top} L ${bw * 0.55} ${top} Q ${bw} ${top} ${bw} ${top + 30} L ${bw * 1.06} ${-legH + 4} Q 0 ${-legH + 16} ${-bw * 1.06} ${-legH + 4} Z`}
          fill={L.coat ? "#ffffff" : top0}
          stroke={OL}
          strokeWidth={4}
        />
        {L.coat && <path d={`M ${-bw * 0.35} ${top + 2} L 0 ${top + 70} L ${bw * 0.35} ${top + 2} Z`} fill={color ?? "#7aa7d8"} stroke={OL} strokeWidth={3} />}
        {L.coat && <path d={`M 0 ${top + 70} L 0 ${-legH + 10}`} stroke="#c9d0dc" strokeWidth={4} />}
        {!L.coat && <path d={`M ${-bw * 0.3} ${top + 2} Q 0 ${top + 26} ${bw * 0.3} ${top + 2}`} fill="none" stroke={L.top2} strokeWidth={5} />}
        {L.tie && <path d={`M 0 ${top + 8} L -9 ${top + 24} L 0 ${top + 92} L 9 ${top + 24} Z`} fill={L.tie} stroke={OL} strokeWidth={3} />}
        {L.badge && <path d={`M ${bw * 0.35} ${top + 40} l 14 6 l -2 16 l -12 8 l -12 -8 l -2 -16 Z`} fill={C.yellow} stroke={OL} strokeWidth={3} />}
        {L.coat && L.glasses && <rect x={bw * 0.3} y={top + 50} width={24} height={30} rx={4} fill="#cfe2ff" stroke={OL} strokeWidth={2.5} />}
        {/* голова */}
        <g transform={`translate(0 ${headY})`}>
          <rect x={-12} y={34} width={24} height={16} fill={C.skinShade} />
          {L.long && <path d="M -48 -10 Q -60 60 -40 80 L 40 80 Q 60 60 48 -10 Z" fill={L.hair} stroke={OL} strokeWidth={3} />}
          <ellipse cx={0} cy={0} rx={44} ry={48} fill={C.skin} stroke={OL} strokeWidth={4} />
          {!L.bald && <path d="M -45 -4 Q -48 -54 0 -54 Q 48 -54 45 -4 Q 32 -32 0 -34 Q -24 -32 -45 -4 Z" fill={L.hair} stroke={OL} strokeWidth={3} />}
          {L.skirt && <circle cx={0} cy={-52} r={17} fill={L.hair} stroke={OL} strokeWidth={3} />}
          {L.beard && <path d="M -36 14 Q -30 60 0 62 Q 30 60 36 14 Q 20 34 0 34 Q -20 34 -36 14 Z" fill={L.beard} stroke={OL} strokeWidth={3} />}
          <Face mood={mood} look={look} blink={blink} />
          {L.glasses && (
            <g fill="none" stroke={OL} strokeWidth={3}>
              <circle cx={-17} cy={2} r={12} fill="#fff" fillOpacity={0.18} />
              <circle cx={17} cy={2} r={12} fill="#fff" fillOpacity={0.18} />
              <path d="M -5 2 L 5 2" />
            </g>
          )}
          {L.cap && (
            <g>
              <path d="M -46 -22 Q -44 -66 0 -66 Q 44 -66 46 -22 Z" fill={L.cap} stroke={OL} strokeWidth={4} />
              <path d="M -50 -22 L 66 -22 Q 60 -10 -46 -12 Z" fill={L.cap} stroke={OL} strokeWidth={4} />
              <circle cx={0} cy={-46} r={9} fill={C.yellow} stroke={OL} strokeWidth={2.5} />
            </g>
          )}
        </g>
        {rightArm}
        {item && <g transform={`translate(${hand.x} ${hand.y - 18})`}>{item}</g>}
      </g>
    </g>
  );
};

// ── Подпись-ярлык ──
export const Label: React.FC<{ x: number; y: number; text: string; size?: number; bg?: string; color?: string; opacity?: number; border?: string }> = ({ x, y, text, size: s0 = 34, bg = C.paper, color = C.ink, opacity = 1, border = OL }) => {
  const size = s0 * 1.1;
  const w = text.length * size * 0.56 + size * 1.1;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect x={-w / 2 + 4} y={-size * 0.95 + 6} width={w} height={size * 1.6} rx={size * 0.5} fill="#000" opacity={0.16} />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.5} fill={bg} stroke={border} strokeWidth={3} />
      <text x={0} y={size * 0.12} fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

// ── Карточка с текстом (несколько строк) ──
export const Card: React.FC<{ x: number; y: number; w: number; h: number; lines: string[]; size?: number; fill?: string; color?: string; edge?: string; title?: string; titleColor?: string; rot?: number }> = ({
  x, y, w, h, lines, size = 40, fill = C.paper, color = C.ink, edge, title, titleColor = C.inkSoft, rot = 0,
}) => {
  // текст всегда помещается в карточку: размер уменьшается по самой длинной строке
  const longest = Math.max(...lines.map((l) => l.length));
  size = Math.min(size, (w - 56) / (longest * 0.56), ((h - (title ? 50 : 24)) / (lines.length * 1.18)) * 0.95);
  return (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={28} fill="#000" opacity={0.16} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={fill} stroke={OL} strokeWidth={4} />
    {edge && <rect x={-w / 2} y={-h / 2} width={18} height={h} rx={9} fill={edge} />}
    {title && (
      <text x={0} y={-h / 2 + 40} fontFamily={FONT} fontWeight={800} fontSize={26} fill={titleColor} textAnchor="middle">
        {title}
      </text>
    )}
    <text x={0} y={(title ? size * 0.5 : 0) - ((lines.length - 1) * size * 1.18) / 2 + size * 0.35} fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} textAnchor="middle">
      {lines.map((l, i) => (
        <tspan key={i} x={0} dy={i === 0 ? 0 : size * 1.18}>
          {l}
        </tspan>
      ))}
    </text>
  </g>
  );
};

// ── Стол ведущего ──
export const Desk: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <g>
    <rect x={x - w / 2 + 8} y={y + 10} width={w} height={40} rx={14} fill="#000" opacity={0.15} />
    <rect x={x - w / 2} y={y} width={w} height={36} rx={14} fill={C.woodLight} stroke={OL} strokeWidth={4} />
    <rect x={x - w / 2 + 40} y={y + 36} width={w - 80} height={60} fill={C.wood} stroke={OL} strokeWidth={4} />
  </g>
);

// ── Подарочная коробка ──
export const Gift: React.FC<{ x: number; y: number; s?: number; color?: string; ribbon?: string; open?: number }> = ({ x, y, s = 1, color = "#2fbf9b", ribbon = C.yellow, open = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-50} y={-20} width={100} height={70} rx={8} fill={color} stroke={OL} strokeWidth={4} />
    <rect x={-10} y={-20} width={20} height={70} fill={ribbon} stroke={OL} strokeWidth={3} />
    <g transform={`translate(0 ${-open * 40}) rotate(${-open * 20})`}>
      <rect x={-58} y={-44} width={116} height={26} rx={6} fill={color} stroke={OL} strokeWidth={4} />
      <rect x={-10} y={-44} width={20} height={26} fill={ribbon} stroke={OL} strokeWidth={3} />
      <path d="M 0 -44 C -40 -80 -46 -44 0 -44 C 46 -44 40 -80 0 -44" fill={ribbon} stroke={OL} strokeWidth={3} />
    </g>
  </g>
);

// ── Значок эксперта / погоны «формы» ──
export const Badge: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = "#9a6bff" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -30 30 L -44 92 L -14 76 L 0 100 L 10 40 Z" fill={C.red} stroke={OL} strokeWidth={3} />
    <path d="M 30 30 L 44 92 L 14 76 L 0 100 L -10 40 Z" fill="#3d8bff" stroke={OL} strokeWidth={3} />
    <circle r={56} fill={C.yellow} stroke={OL} strokeWidth={5} />
    <circle r={40} fill={color} stroke={OL} strokeWidth={3} />
    <path d="M 0 -24 L 7 -8 L 24 -8 L 11 3 L 16 20 L 0 10 L -16 20 L -11 3 L -24 -8 L -7 -8 Z" fill="#fff" />
  </g>
);

// ── Телефон с экраном ──
export const Phone: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode; rot?: number }> = ({ x, y, s = 1, children, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-120} y={-220} width={240} height={440} rx={34} fill="#22263a" stroke={OL} strokeWidth={5} />
    <rect x={-104} y={-196} width={208} height={392} rx={20} fill="#f4f6ff" />
    <rect x={-30} y={-210} width={60} height={8} rx={4} fill="#3a3f5a" />
    {children}
  </g>
);

// ── Нить обязательства: от точки к точке, натяжение tension 0…1 ──
export const Thread: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; w?: number; color?: string; sag?: number }> = ({ x1, y1, x2, y2, k, w = 6, color = C.rope, sag = 60 }) => {
  if (k <= 0) return null;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + sag;
  const len = Math.hypot(x2 - x1, y2 - y1) * 1.2 + sag;
  return (
    <g>
      <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} fill="none" stroke={OL} strokeWidth={w + 5} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - Math.min(1, k))} />
      <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - Math.min(1, k))} />
    </g>
  );
};

// ── Знак вопроса в круге ──
export const QMark: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = C.yellow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={60} fill={color} stroke={OL} strokeWidth={5} />
    <text y={30} fontFamily={DISPLAY} fontWeight={800} fontSize={90} fill={OL} textAnchor="middle">
      ?
    </text>
  </g>
);

// ── Ценник ──
export const PriceTag: React.FC<{ x: number; y: number; text: string; s?: number; color?: string; rot?: number; strike?: number }> = ({ x, y, text, s = 1, color = C.yellow, rot = 0, strike = 0 }) => {
  const w = text.length * 26 + 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={`M -${w / 2} -36 L ${w / 2 - 24} -36 L ${w / 2} 0 L ${w / 2 - 24} 36 L -${w / 2} 36 Z`} fill={color} stroke={OL} strokeWidth={4} />
      <circle cx={w / 2 - 26} cy={0} r={7} fill="#fff" stroke={OL} strokeWidth={3} />
      <text x={-14} y={14} fontFamily={DISPLAY} fontWeight={800} fontSize={42} fill={OL} textAnchor="middle">
        {text}
      </text>
      {strike > 0 && <line x1={-w / 2 + 10} y1={0} x2={-w / 2 + 10 + (w - 50) * Math.min(1, strike)} y2={0} stroke={C.red} strokeWidth={8} strokeLinecap="round" />}
    </g>
  );
};

// ── Круг «мы» ──
export const WeCircle: React.FC<{ x: number; y: number; r: number; color: string; label?: string; opacity?: number }> = ({ x, y, r, color, label, opacity = 1 }) => (
  <g opacity={opacity}>
    <circle cx={x} cy={y} r={r} fill={color} fillOpacity={0.28} stroke={color} strokeWidth={8} />
    {label && (
      <text x={x} y={y - r - 22} fontFamily={FONT} fontWeight={900} fontSize={36} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
        {label}
      </text>
    )}
  </g>
);
