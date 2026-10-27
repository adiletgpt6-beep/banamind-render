// Рисованный мир фильма BM-005: люди двора (король, министр, придворный, дама,
// солдат, купец, учёный, художник, современный человек), их позы и эмоции,
// и предметы власти — корона, трон, замок, шахматные фигуры, свиток, монеты,
// маска, прожектор. Простые формы, мягкие цвета, контур — как у банана.
// Это условные персонажи-иллюстрации, а не портреты исторических людей.
import React from "react";
import { C, FONT, SERIF } from "../theme";
import { OL } from "./draw";
import { clamp01, Txt } from "./kit";

export type Role = "king" | "queen" | "minister" | "courtier" | "lady" | "soldier" | "merchant" | "scholar" | "artist" | "modern" | "peasant" | "boss" | "general";
export type Mood = "happy" | "proud" | "sad" | "angry" | "shock" | "sly" | "neutral" | "worried" | "talk" | "sleep";

const SKIN = ["#f2c79b", "#e7b48a", "#d9a074", "#f5d2b0", "#c98d63"];

type Look = { body: string; trim: string; hair: string; skin: string; cape?: string; crown?: boolean; hat?: "wig" | "helmet" | "beret" | "cap" | "bun" | "tricorn" | "none"; long?: boolean };

const LOOKS: Record<Role, Look> = {
  king: { body: C.purple, trim: C.gold, hair: "#6b4a1e", skin: SKIN[0], cape: C.velvet, crown: true, hat: "none", long: true },
  queen: { body: C.velvet, trim: C.gold, hair: "#3b2a10", skin: SKIN[3], crown: true, hat: "bun", long: true },
  minister: { body: "#2f6f8f", trim: C.gold, hair: "#e9e2d0", skin: SKIN[1], hat: "wig", long: true },
  courtier: { body: "#3fb67c", trim: "#ffe39a", hair: "#efe6d2", skin: SKIN[0], hat: "wig" },
  lady: { body: "#ff9ec0", trim: "#fff3d6", hair: "#a0522d", skin: SKIN[3], hat: "bun", long: true },
  soldier: { body: "#3d6bd6", trim: C.gold, hair: "#3b2a10", skin: SKIN[2], hat: "helmet" },
  merchant: { body: "#c98a0b", trim: "#fff3d6", hair: "#3b2a10", skin: SKIN[1], hat: "beret" },
  scholar: { body: "#5a4a8a", trim: "#d9ccfb", hair: "#ddd", skin: SKIN[0], hat: "cap", long: true },
  artist: { body: "#e5484d", trim: "#ffe39a", hair: "#5b3a1a", skin: SKIN[4], hat: "beret" },
  modern: { body: "#6cc5f0", trim: "#ffffff", hair: "#3b2a10", skin: SKIN[3], hat: "none" },
  peasant: { body: "#9c7a4a", trim: "#e9dcc0", hair: "#6b4a1e", skin: SKIN[2], hat: "none" },
  boss: { body: "#24324a", trim: "#e5484d", hair: "#4a3a2a", skin: SKIN[1], hat: "none" },
  general: { body: "#2e5c3a", trim: C.gold, hair: "#3b2a10", skin: SKIN[1], hat: "tricorn" },
};

export const Crown: React.FC<{ x: number; y: number; s?: number; rot?: number; glow?: number; tilt?: number }> = ({ x, y, s = 1, rot = 0, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {glow > 0 && <circle cy={-20} r={90} fill={C.goldLight} opacity={0.5 * glow} />}
    <path d="M -60 10 L -66 -46 L -34 -18 L 0 -60 L 34 -18 L 66 -46 L 60 10 Z" fill={C.gold} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-62} y={4} width={124} height={22} rx={6} fill={C.goldDeep} stroke={OL} strokeWidth={5} />
    <circle cx={0} cy={15} r={7} fill={C.velvet} />
    <circle cx={-34} cy={15} r={6} fill={C.skyDeep} />
    <circle cx={34} cy={15} r={6} fill={C.green} />
    {[-66, 0, 66].map((cx, i) => (
      <circle key={i} cx={cx} cy={i === 1 ? -62 : -48} r={8} fill="#fff6c8" stroke={OL} strokeWidth={4} />
    ))}
    <path d="M -40 -6 L -30 -2" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.6} />
  </g>
);

const Hair: React.FC<{ lk: Look; mood: Mood }> = ({ lk }) => {
  switch (lk.hat) {
    case "wig":
      return (
        <g>
          {[-1, 1].map((d) => (
            <g key={d}>
              <circle cx={d * 36} cy={-108} r={16} fill={lk.hair} stroke={OL} strokeWidth={3} />
              <circle cx={d * 38} cy={-84} r={15} fill={lk.hair} stroke={OL} strokeWidth={3} />
              <circle cx={d * 36} cy={-62} r={13} fill={lk.hair} stroke={OL} strokeWidth={3} />
            </g>
          ))}
          <path d="M -36 -126 Q 0 -160 36 -126 Q 20 -140 0 -140 Q -20 -140 -36 -126 Z" fill={lk.hair} stroke={OL} strokeWidth={3} />
        </g>
      );
    case "helmet":
      return (
        <g>
          <path d="M -38 -112 Q -36 -156 0 -158 Q 36 -156 38 -112 Z" fill="#b8c4d6" stroke={OL} strokeWidth={4} />
          <path d="M 0 -158 Q 10 -180 30 -176" stroke={C.velvet} strokeWidth={10} fill="none" strokeLinecap="round" />
          <rect x={-42} y={-116} width={84} height={10} rx={5} fill="#8e9bb0" stroke={OL} strokeWidth={3} />
        </g>
      );
    case "beret":
      return <path d="M -40 -118 Q -30 -154 10 -150 Q 48 -146 44 -122 Q 0 -112 -40 -118 Z" fill={lk.body === "#e5484d" ? "#24324a" : C.velvet} stroke={OL} strokeWidth={4} />;
    case "cap":
      return (
        <g>
          <path d="M -50 -128 L 0 -148 L 50 -128 L 0 -110 Z" fill="#24324a" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 40 -126 L 44 -98" stroke={C.gold} strokeWidth={4} />
          <circle cx={44} cy={-96} r={5} fill={C.gold} />
        </g>
      );
    case "bun":
      return (
        <g>
          <circle cx={0} cy={-150} r={20} fill={lk.hair} stroke={OL} strokeWidth={3} />
          <path d="M -36 -100 Q -40 -146 0 -146 Q 40 -146 36 -100 Q 30 -126 0 -128 Q -30 -126 -36 -100 Z" fill={lk.hair} stroke={OL} strokeWidth={3} />
        </g>
      );
    case "tricorn":
      return <path d="M -54 -120 Q 0 -100 54 -120 L 40 -136 Q 0 -168 -40 -136 Z" fill="#1f2a3a" stroke={OL} strokeWidth={4} strokeLinejoin="round" />;
    default:
      return <path d="M -34 -104 Q -36 -146 0 -146 Q 36 -146 34 -104 Q 26 -128 0 -130 Q -22 -128 -34 -104 Z" fill={lk.hair} stroke={OL} strokeWidth={3} />;
  }
};

const Face: React.FC<{ mood: Mood; t: number; look: number; talk: number; skin: string }> = ({ mood, t, look, talk }) => {
  const blink = (t * 0.8 + look * 3) % 3.6 < 0.12 || mood === "sleep" ? 0.12 : 1;
  const eyeY = -100;
  const ry = (mood === "shock" ? 8 : mood === "sly" ? 3.5 : 6) * blink;
  const lx = look * 4;
  const brow =
    mood === "angry"
      ? ["M -22 -116 L -6 -110", "M 22 -116 L 6 -110"]
      : mood === "worried" || mood === "sad"
        ? ["M -22 -110 L -6 -116", "M 22 -110 L 6 -116"]
        : mood === "shock"
          ? ["M -22 -120 Q -14 -126 -6 -120", "M 22 -120 Q 14 -126 6 -120"]
          : mood === "sly"
            ? ["M -22 -112 L -6 -114", "M 22 -118 L 6 -112"]
            : ["M -22 -114 Q -14 -118 -6 -114", "M 22 -114 Q 14 -118 6 -114"];
  const o = talk > 0 ? (0.5 + 0.5 * Math.sin(t * 17)) * talk : 0;
  let mouth: React.ReactNode;
  if (mood === "shock") mouth = <ellipse cx={0} cy={-76} rx={7} ry={9} fill="#7a2e1e" stroke={OL} strokeWidth={3} />;
  else if (o > 0.12 || mood === "talk") mouth = <ellipse cx={0} cy={-77} rx={9} ry={3 + o * 7 + (mood === "talk" ? 2 : 0)} fill="#7a2e1e" stroke={OL} strokeWidth={3} />;
  else {
    const c = mood === "sad" ? -8 : mood === "worried" ? -4 : mood === "angry" ? -5 : mood === "neutral" || mood === "sleep" ? 1 : mood === "proud" ? 6 : mood === "sly" ? 5 : 9;
    mouth = mood === "sly" ? <path d="M -10 -78 Q 4 -72 14 -82" stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" /> : <path d={`M -12 -79 Q 0 ${-79 + c} 12 -79`} stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />;
  }
  return (
    <g>
      {[-1, 1].map((d) => (
        <g key={d}>
          <ellipse cx={d * 13 + lx} cy={eyeY} rx={5.5} ry={Math.max(1.2, ry)} fill={OL} />
          {ry > 3 && <circle cx={d * 13 + lx + 2} cy={eyeY - 2} r={1.8} fill="#fff" />}
        </g>
      ))}
      {brow.map((d, i) => (
        <path key={i} d={d} stroke={OL} strokeWidth={4} strokeLinecap="round" fill="none" />
      ))}
      <circle cx={-22} cy={-86} r={6} fill="#ff8a8a" opacity={mood === "proud" || mood === "happy" ? 0.45 : 0.2} />
      <circle cx={22} cy={-86} r={6} fill="#ff8a8a" opacity={mood === "proud" || mood === "happy" ? 0.45 : 0.2} />
      {mouth}
      {mood === "sleep" && (
        <Txt x={46} y={-130} size={26} weight={900} color={C.inkSoft}>
          z
        </Txt>
      )}
      {mood === "worried" && <path d="M 32 -120 Q 36 -110 32 -104 Q 28 -110 32 -120 Z" fill="#9ad8ff" stroke={C.skyDeep} strokeWidth={2} />}
    </g>
  );
};

// Человек двора. arms: углы рук от «вниз» (0) до «вверх» (170), [левая, правая];
// look −1…1 — куда смотрит; s — масштаб (рост ≈ 260 при s = 1); flip — отразить.
export const Figure: React.FC<{
  x: number;
  y: number;
  s?: number;
  t?: number;
  role?: Role;
  mood?: Mood;
  arms?: [number, number];
  look?: number;
  talk?: number;
  flip?: boolean;
  body?: string; // перекрасить одежду
  bow?: number; // поклон 0…1
  walk?: number; // шаг (анимация ног) 0…1
  hold?: React.ReactNode; // предмет в правой руке
  opacity?: number;
}> = ({ x, y, s = 1, t = 0, role = "courtier", mood = "happy", arms = [12, 12], look = 0, talk = 0, flip, body, bow = 0, walk = 0, hold, opacity = 1 }) => {
  const lk = { ...LOOKS[role], ...(body ? { body } : {}) };
  const bob = Math.sin(t * 2.6 + x * 0.01) * 2 + (walk ? Math.abs(Math.sin(t * 7)) * -6 * walk : 0);
  const step = walk ? Math.sin(t * 7) * 12 * walk : 0;
  const arm = (side: -1 | 1, a: number) => {
    const rad = (a * Math.PI) / 180;
    const sx = side * 30;
    const sy = -170 + 0;
    const ex = sx + side * Math.sin(rad) * 44;
    const ey = sy + Math.cos(rad) * 44;
    const hx = ex + side * Math.sin(rad * 1.04) * 40;
    const hy = ey + Math.cos(rad * 1.04) * 40;
    return { sx, sy, ex, ey, hx, hy };
  };
  const L = arm(-1, arms[0]);
  const R = arm(1, arms[1]);
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -s : s} ${s})`} opacity={opacity}>
      <ellipse cx={0} cy={4} rx={56} ry={10} fill="#000" opacity={0.08} />
      {/* ноги */}
      <path d={`M -14 -60 L ${-16 + step} 0 M 14 -60 L ${16 - step} 0`} stroke={OL} strokeWidth={11} strokeLinecap="round" />
      <ellipse cx={-20 + step} cy={2} rx={16} ry={7} fill="#2b2b2b" />
      <ellipse cx={20 - step} cy={2} rx={16} ry={7} fill="#2b2b2b" />
      <g transform={`rotate(${bow * 28} 0 -70)`}>
        {lk.cape && <path d="M -36 -180 Q -70 -70 -60 -40 L 60 -40 Q 70 -70 36 -180 Z" fill={lk.cape} stroke={OL} strokeWidth={4} />}
        {lk.cape && <path d="M -60 -44 L 60 -44 L 60 -36 L -60 -36 Z" fill="#fff" stroke={OL} strokeWidth={3} />}
        {/* туловище */}
        <path
          d={lk.long ? "M -32 -184 Q -44 -100 -48 -46 L 48 -46 Q 44 -100 32 -184 Q 0 -194 -32 -184 Z" : "M -32 -184 Q -40 -120 -36 -60 L 36 -60 Q 40 -120 32 -184 Q 0 -194 -32 -184 Z"}
          fill={lk.body}
          stroke={OL}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <path d={lk.long ? "M 0 -184 L 0 -48" : "M 0 -184 L 0 -62"} stroke={lk.trim} strokeWidth={6} opacity={0.9} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={0} cy={-162 + i * 30} r={4} fill={lk.trim} stroke={OL} strokeWidth={2} />
        ))}
        {role === "modern" || role === "boss" ? <path d="M -10 -184 L 0 -164 L 10 -184" fill="#fff" stroke={OL} strokeWidth={3} /> : <path d="M -22 -186 Q 0 -170 22 -186" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />}
        {role === "boss" && <path d="M -4 -168 L 4 -168 L 6 -130 L 0 -122 L -6 -130 Z" fill={lk.trim} stroke={OL} strokeWidth={2} />}
        {/* руки */}
        {[L, R].map((A, i) => (
          <g key={i}>
            <path d={`M ${A.sx} ${A.sy} L ${A.ex} ${A.ey} L ${A.hx} ${A.hy}`} stroke={lk.body} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx={A.hx} cy={A.hy} r={10} fill={lk.skin} stroke={OL} strokeWidth={3} />
          </g>
        ))}
        {hold && <g transform={`translate(${R.hx} ${R.hy})`}>{hold}</g>}
        {/* голова */}
        <rect x={-9} y={-200} width={18} height={18} fill={lk.skin} stroke={OL} strokeWidth={3} />
        <g transform="translate(0 -132)">
          <circle cx={0} cy={-96} r={36} fill={lk.skin} stroke={OL} strokeWidth={4} />
          <Hair lk={lk} mood={mood} />
          <Face mood={mood} t={t} look={look} talk={talk} skin={lk.skin} />
        </g>
        {lk.crown && <Crown x={0} y={role === "queen" ? -296 : -276} s={role === "queen" ? 0.36 : 0.44} />}
      </g>
    </g>
  );
};

// трон с бархатной спинкой
export const Throne: React.FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <ellipse cx={0} cy={-160} rx={170} ry={200} fill={C.goldLight} opacity={0.45 * glow} />}
    <path d="M -90 0 L -90 -230 Q -90 -300 0 -320 Q 90 -300 90 -230 L 90 0 Z" fill={C.goldDeep} stroke={OL} strokeWidth={5} />
    <path d="M -64 -110 L -64 -230 Q -64 -280 0 -292 Q 64 -280 64 -230 L 64 -110 Z" fill={C.velvet} stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={-322} r={14} fill={C.gold} stroke={OL} strokeWidth={4} />
    <rect x={-110} y={-112} width={220} height={40} rx={10} fill={C.gold} stroke={OL} strokeWidth={5} />
    <rect x={-100} y={-74} width={30} height={74} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
    <rect x={70} y={-74} width={30} height={74} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
  </g>
);

// замок / крепость
export const Castle: React.FC<{ x: number; y: number; s?: number; walls?: number; color?: string; flag?: string; t?: number }> = ({ x, y, s = 1, walls = 1, color = C.stone, flag = C.velvet, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-150, 150].map((cx, i) => (
      <g key={i}>
        <rect x={cx - 50} y={-300} width={100} height={300} fill={color} stroke={OL} strokeWidth={5} />
        {[-36, -12, 12, 36].map((d, j) => (
          <rect key={j} x={cx + d - 9} y={-322} width={18} height={24} fill={color} stroke={OL} strokeWidth={4} />
        ))}
        <rect x={cx - 12} y={-240} width={24} height={40} rx={12} fill={C.night} />
      </g>
    ))}
    <rect x={-100} y={-220 * walls} width={200} height={220 * walls} fill={color} stroke={OL} strokeWidth={5} />
    {walls > 0.9 && [-80, -40, 0, 40, 80].map((d, j) => <rect key={j} x={d - 12} y={-240} width={24} height={22} fill={color} stroke={OL} strokeWidth={4} />)}
    <path d="M -40 0 L -40 -80 Q 0 -120 40 -80 L 40 0 Z" fill="#7a5530" stroke={OL} strokeWidth={5} />
    <path d="M 150 -322 L 150 -400" stroke={OL} strokeWidth={5} />
    <path d={`M 150 -400 Q ${190 + Math.sin(t * 3) * 6} ${-392 + Math.cos(t * 3) * 4} 230 -386 L 150 -370 Z`} fill={flag} stroke={OL} strokeWidth={3} />
  </g>
);

// шахматные фигуры
export const Chess: React.FC<{ x: number; y: number; s?: number; kind: "king" | "queen" | "pawn" | "knight" | "rook"; dark?: boolean; rot?: number }> = ({ x, y, s = 1, kind, dark, rot = 0 }) => {
  const f = dark ? "#3a3550" : "#fbf4e2";
  const st = dark ? "#16131f" : OL;
  const base = (
    <g>
      <rect x={-50} y={-20} width={100} height={20} rx={6} fill={f} stroke={st} strokeWidth={5} />
      <path d="M -38 -20 Q -30 -40 -36 -50 L 36 -50 Q 30 -40 38 -20 Z" fill={f} stroke={st} strokeWidth={5} />
    </g>
  );
  let top: React.ReactNode = null;
  if (kind === "pawn")
    top = (
      <g>
        <path d="M -20 -50 Q -12 -80 -10 -96 L 10 -96 Q 12 -80 20 -50 Z" fill={f} stroke={st} strokeWidth={5} />
        <circle cy={-116} r={26} fill={f} stroke={st} strokeWidth={5} />
      </g>
    );
  if (kind === "king" || kind === "queen")
    top = (
      <g>
        <path d="M -26 -50 Q -16 -120 -22 -150 L 22 -150 Q 16 -120 26 -50 Z" fill={f} stroke={st} strokeWidth={5} />
        <ellipse cy={-156} rx={34} ry={10} fill={f} stroke={st} strokeWidth={5} />
        {kind === "king" ? (
          <path d="M -6 -166 L -6 -184 L -18 -184 L -18 -196 L -6 -196 L -6 -208 L 6 -208 L 6 -196 L 18 -196 L 18 -184 L 6 -184 L 6 -166 Z" fill={f} stroke={st} strokeWidth={4} />
        ) : (
          <g>
            <path d="M -28 -164 L -20 -196 L -8 -172 L 0 -204 L 8 -172 L 20 -196 L 28 -164 Z" fill={f} stroke={st} strokeWidth={4} strokeLinejoin="round" />
          </g>
        )}
      </g>
    );
  if (kind === "knight")
    top = <path d="M -28 -50 L -24 -100 Q -40 -110 -30 -130 Q -10 -170 16 -168 Q 40 -150 34 -110 L 30 -50 Z M -30 -130 L -50 -112 L -36 -104" fill={f} stroke={st} strokeWidth={5} strokeLinejoin="round" />;
  if (kind === "rook")
    top = (
      <g>
        <rect x={-28} y={-130} width={56} height={80} fill={f} stroke={st} strokeWidth={5} />
        <path d="M -36 -130 L -36 -160 L -20 -160 L -20 -146 L -6 -146 L -6 -160 L 6 -160 L 6 -146 L 20 -146 L 20 -160 L 36 -160 L 36 -130 Z" fill={f} stroke={st} strokeWidth={5} />
      </g>
    );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cy={4} rx={56} ry={10} fill="#000" opacity={0.12} />
      {base}
      {top}
    </g>
  );
};

// шахматная доска в перспективе (вид сверху-спереди)
export const Board: React.FC<{ x: number; y: number; w?: number; n?: number; k?: number }> = ({ x, y, w = 760, n = 8, k = 1 }) => {
  const cells: React.ReactNode[] = [];
  const h = w * 0.42;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const p = (rr: number, cc: number) => {
        const yy = y - h + (h * rr) / n;
        const shrink = 0.72 + 0.28 * (rr / n);
        const xx = x + (cc / n - 0.5) * w * shrink;
        return `${xx},${yy}`;
      };
      cells.push(<polygon key={`${r}-${c}`} points={`${p(r, c)} ${p(r, c + 1)} ${p(r + 1, c + 1)} ${p(r + 1, c)}`} fill={(r + c) % 2 ? "#7a5530" : "#f3e1bd"} opacity={clamp01(k * 3 - (r / n) * 2)} />);
    }
  }
  return (
    <g>
      <path d={`M ${x - w * 0.36 - 16} ${y - h - 12} L ${x + w * 0.36 + 16} ${y - h - 12} L ${x + w / 2 + 20} ${y + 16} L ${x - w / 2 - 20} ${y + 16} Z`} fill="#5a3a1c" stroke={OL} strokeWidth={5} opacity={clamp01(k * 2)} />
      {cells}
    </g>
  );
};

// свиток с текстом
export const Scroll: React.FC<{ x: number; y: number; w?: number; h?: number; lines?: string[]; size?: number; open?: number; rot?: number }> = ({ x, y, w = 420, h = 300, lines = [], size = 36, open = 1, rot = 0 }) => {
  const hh = h * clamp01(open);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-hh / 2} width={w} height={hh} fill="#fbf0d4" stroke={OL} strokeWidth={4} />
      {open > 0.6 &&
        lines.map((l, i) => (
          <text key={i} x={0} y={-hh / 2 + 70 + i * size * 1.35} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={size} fill={C.ink} opacity={clamp01((open - 0.6) * 3)}>
            {l}
          </text>
        ))}
      {[-1, 1].map((d) => (
        <g key={d}>
          <rect x={-w / 2 - 20} y={d * hh / 2 - 18} width={w + 40} height={36} rx={18} fill="#e8d3a2" stroke={OL} strokeWidth={4} />
          <circle cx={-w / 2 - 20} cy={d * hh / 2} r={14} fill="#c9a96a" stroke={OL} strokeWidth={3} />
          <circle cx={w / 2 + 20} cy={d * hh / 2} r={14} fill="#c9a96a" stroke={OL} strokeWidth={3} />
        </g>
      ))}
    </g>
  );
};

export const Coin: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 34, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(0.15, Math.abs(Math.cos(rot)))} 1)`}>
    <circle r={r} fill={C.gold} stroke={OL} strokeWidth={4} />
    <circle r={r * 0.7} fill="none" stroke={C.goldDeep} strokeWidth={3} />
    <circle cx={-r * 0.3} cy={-r * 0.3} r={r * 0.18} fill="#fff" opacity={0.5} />
  </g>
);

export const CoinStack: React.FC<{ x: number; y: number; n: number; r?: number }> = ({ x, y, n, r = 40 }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: Math.max(0, Math.round(n)) }).map((_, i) => (
      <g key={i}>
        <ellipse cx={0} cy={-i * 14} rx={r} ry={r * 0.32} fill={C.goldDeep} stroke={OL} strokeWidth={3} />
        <ellipse cx={0} cy={-i * 14 - 5} rx={r} ry={r * 0.32} fill={C.gold} stroke={OL} strokeWidth={3} />
      </g>
    ))}
  </g>
);

// театральная маска (улыбка или грусть)
export const Mask: React.FC<{ x: number; y: number; s?: number; sad?: boolean; color?: string; rot?: number }> = ({ x, y, s = 1, sad, color = "#fff6e0", rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -70 -60 Q 0 -90 70 -60 Q 76 20 0 80 Q -76 20 -70 -60 Z" fill={color} stroke={OL} strokeWidth={5} />
    <path d="M -46 -16 Q -30 -34 -14 -16 Q -30 -6 -46 -16 Z" fill={OL} />
    <path d="M 46 -16 Q 30 -34 14 -16 Q 30 -6 46 -16 Z" fill={OL} />
    <path d={sad ? "M -30 44 Q 0 18 30 44" : "M -32 24 Q 0 56 32 24"} stroke={OL} strokeWidth={7} fill="none" strokeLinecap="round" />
  </g>
);

// луч прожектора сверху
export const Spotlight: React.FC<{ x: number; y: number; w?: number; k: number; color?: string }> = ({ x, y, w = 360, k, color = "#fff7cf" }) =>
  k <= 0 ? null : (
    <g opacity={clamp01(k) * 0.8}>
      <path d={`M ${x - 40} -20 L ${x + 40} -20 L ${x + w / 2} ${y} L ${x - w / 2} ${y} Z`} fill={color} opacity={0.55} />
      <ellipse cx={x} cy={y} rx={w / 2} ry={36} fill={color} opacity={0.8} />
    </g>
  );

// фейерверк (вспышка лучей)
export const Firework: React.FC<{ x: number; y: number; k: number; color?: string; r?: number }> = ({ x, y, k, color = C.gold, r = 90 }) => {
  if (k <= 0 || k >= 1) return null;
  const rr = r * Math.sqrt(k);
  return (
    <g transform={`translate(${x} ${y})`} opacity={1 - k}>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * rr * 0.4} y1={Math.sin(a) * rr * 0.4} x2={Math.cos(a) * rr} y2={Math.sin(a) * rr} stroke={i % 2 ? color : C.white} strokeWidth={8} strokeLinecap="round" />;
      })}
    </g>
  );
};

// подпись-лента (как на гербе)
export const Ribbon: React.FC<{ x: number; y: number; text: string; w?: number; size?: number; color?: string; k?: number }> = ({ x, y, text, w, size = 40, color = C.velvet, k = 1 }) => {
  if (k <= 0) return null;
  const ww = w ?? text.length * size * 0.58 + size * 1.6;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * clamp01(k)})`} opacity={clamp01(k * 1.5)}>
      <path d={`M ${-ww / 2 - 40} ${-size * 0.4} L ${-ww / 2} ${-size * 0.4} L ${-ww / 2} ${size * 0.9} L ${-ww / 2 - 40} ${size * 0.9} L ${-ww / 2 - 22} ${size * 0.25} Z`} fill={C.velvetDeep} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${ww / 2 + 40} ${-size * 0.4} L ${ww / 2} ${-size * 0.4} L ${ww / 2} ${size * 0.9} L ${ww / 2 + 40} ${size * 0.9} L ${ww / 2 + 22} ${size * 0.25} Z`} fill={C.velvetDeep} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-ww / 2} y={-size * 0.95} width={ww} height={size * 1.6} rx={8} fill={color} stroke={OL} strokeWidth={4} />
      <text x={0} y={size * 0.2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill="#fff">
        {text}
      </text>
    </g>
  );
};

// крупное число / слово с «пружинкой»
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

// подпись «так трактует автор» — честная пометка для исторических историй книги
export const BookNote: React.FC<{ x: number; y: number; k: number; text?: string }> = ({ x, y, k, text = "история и толкование — по книге Р. Грина" }) => {
  if (k <= 0) return null;
  const w = text.length * 13 + 60;
  return (
    <g transform={`translate(${x} ${y})`} opacity={clamp01(k)}>
      <rect x={-w / 2} y={-24} width={w} height={40} rx={20} fill="#fff" opacity={0.88} />
      <Txt x={0} y={5} size={22} weight={700} color={C.inkSoft}>
        {text}
      </Txt>
    </g>
  );
};

// надпись-год на «табличке»
export const Year: React.FC<{ x: number; y: number; text: string; k: number }> = ({ x, y, text, k }) => {
  if (k <= 0) return null;
  const w = text.length * 26 + 50;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * clamp01(k)})`} opacity={clamp01(k * 1.5)}>
      <rect x={-w / 2} y={-34} width={w} height={56} rx={12} fill={C.night} />
      <Txt x={0} y={8} size={36} weight={900} color={C.goldLight}>
        {text}
      </Txt>
    </g>
  );
};
