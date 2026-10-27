// Рисованные персонажи и предметы фильма BM-022 — собственный 2D-стиль BanaMind
// (плоская книжная иллюстрация из простых форм, чёткий контур, мягкие тени).
// Марат, Лейла, Тимур, Дина — вымышленные герои фильма, не люди из книги.
import React from "react";
import { C, FONT } from "../theme";

export const OL = "#1d2a44"; // контур

export type Who = "marat" | "leila" | "timur" | "dina" | "boss" | "man" | "woman" | "elder" | "kid" | "worker" | "doctor";

type Look = {
  top: string; top2: string; pants: string; hair: string; skin: string;
  style: "short" | "long" | "bun" | "bald" | "curly" | "scarf";
  scarf?: string; h?: number; w?: number; glasses?: boolean; beard?: boolean; skirt?: boolean; tie?: string; badge?: string;
};

export const LOOKS: Record<Who, Look> = {
  marat: { top: "#f4f6fb", top2: "#d7dcea", pants: "#33415f", hair: "#2a1f1a", skin: "#e9c19c", style: "short", tie: C.teal, h: 1.05 },
  leila: { top: "#c3426a", top2: "#9e2f53", pants: "#3b3b5c", hair: "#3a2418", skin: "#efcfb0", style: "scarf", scarf: "#8e7cc3", skirt: true, h: 0.98 },
  timur: { top: "#ff9a3d", top2: "#e07a1f", pants: "#2f4d7a", hair: "#2b1e18", skin: "#e9c19c", style: "curly", h: 0.88, w: 0.92 },
  dina: { top: "#6a5ad6", top2: "#5244b0", pants: "#2c3352", hair: "#5a3626", skin: "#f1d2b6", style: "bun", glasses: true, h: 0.98 },
  boss: { top: "#3d4b6e", top2: "#2c3858", pants: "#26304a", hair: "#9aa0ad", skin: "#e2b996", style: "bald", tie: C.coral, h: 1.04, w: 1.15 },
  man: { top: "#4f9a78", top2: "#3a7a5d", pants: "#38405a", hair: "#3a2a22", skin: "#d9a982", style: "short", beard: true },
  woman: { top: "#e8a33d", top2: "#c9821f", pants: "#3b3f5c", hair: "#1f1a18", skin: "#c99572", style: "long", skirt: true },
  elder: { top: "#8a7fb0", top2: "#6d6290", pants: "#404058", hair: "#d8d8de", skin: "#efcfb0", style: "scarf", scarf: "#d8d2ea", skirt: true, h: 0.92 },
  kid: { top: "#4fb3e8", top2: "#2f8fc4", pants: "#3a4a6a", hair: "#3a2a22", skin: "#efcfb0", style: "short", h: 0.66, w: 0.8 },
  worker: { top: "#7cb342", top2: "#5d8f2c", pants: "#4a4030", hair: "#3a2a22", skin: "#d9a982", style: "short", h: 1.02 },
  doctor: { top: "#ffffff", top2: "#dfe6f2", pants: "#4a5a7a", hair: "#6a5040", skin: "#efcfb0", style: "short", glasses: true, badge: C.teal },
};

export type FigMood = "neutral" | "happy" | "sad" | "tense" | "angry" | "calm" | "shock" | "think" | "closed";
export type FigPose = "stand" | "walk" | "run" | "sit" | "phone" | "point" | "open" | "cross" | "hold" | "wave" | "think" | "hug" | "cover" | "write";

const Face: React.FC<{ mood: FigMood; look: number; blink: number }> = ({ mood, look, blink }) => {
  const brow = { neutral: 0, happy: -0.2, sad: -0.7, tense: 0.6, angry: 1, calm: -0.15, shock: -1, think: 0.3, closed: 0 }[mood];
  const by = mood === "shock" ? -6 : 0;
  const eyeH = mood === "closed" ? 0.5 : Math.max(0.6, (mood === "shock" ? 7.5 : 6) * (1 - blink));
  const mouth =
    mood === "happy" || mood === "calm"
      ? mood === "happy"
        ? "M -13 20 Q 0 34 13 20 Z"
        : "M -11 22 Q 0 30 11 22"
      : mood === "sad"
        ? "M -11 28 Q 0 20 11 28"
        : mood === "shock"
          ? "M -7 22 Q 0 36 7 22 Q 0 17 -7 22"
          : mood === "angry" || mood === "tense"
            ? "M -11 25 Q 0 21 11 25"
            : mood === "think"
              ? "M -8 25 Q 4 23 11 20"
              : "M -10 24 Q 0 27 10 24";
  const filled = mood === "happy" || mood === "shock";
  return (
    <g transform={`translate(${look * 6} 0)`}>
      {[-1, 1].map((d) => (
        <g key={d}>
          {mood === "closed" ? (
            <path d={`M ${d * 17 - 7} 2 Q ${d * 17} 7 ${d * 17 + 7} 2`} stroke={OL} strokeWidth={3.2} fill="none" strokeLinecap="round" />
          ) : (
            <g>
              <ellipse cx={d * 17} cy={2} rx={5} ry={eyeH} fill={OL} />
              <circle cx={d * 17 + 1.6} cy={-0.5} r={1.5} fill="#fff" opacity={eyeH > 3 ? 0.9 : 0} />
            </g>
          )}
          <path d={`M ${d * 26} ${-13 + by - brow * 2} Q ${d * 17} ${-17 + by} ${d * 8} ${-13 + by + brow * 4}`} stroke={OL} strokeWidth={3.8} strokeLinecap="round" fill="none" />
        </g>
      ))}
      <path d={mouth} stroke={OL} strokeWidth={3.2} fill={filled ? "#8a3a3a" : "none"} strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={-27} cy={14} rx={7} ry={4} fill="#f08d8d" opacity={0.3} />
      <ellipse cx={27} cy={14} rx={7} ry={4} fill="#f08d8d" opacity={0.3} />
    </g>
  );
};

// Персонаж фильма. Точка опоры — между ступнями (0, 0), рост ≈ 440 · s.
export const Person: React.FC<{
  who: Who; x: number; y: number; s?: number; mood?: FigMood; pose?: FigPose; t?: number; flip?: boolean; look?: number; opacity?: number; seed?: number; accent?: string;
}> = ({ who, x, y, s: s0 = 1, mood = "neutral", pose = "stand", t = 0, flip = false, look = 0, opacity = 1, seed = 0, accent }) => {
  const s = s0 * 1.12;
  const L = LOOKS[who];
  const H = L.h ?? 1;
  const Wd = L.w ?? 1;
  const breathe = 1 + Math.sin(t * 1.7 + seed) * 0.009;
  const gait = pose === "walk" ? Math.sin(t * 6 + seed) : pose === "run" ? Math.sin(t * 10 + seed) * 1.5 : 0;
  const bob = pose === "walk" ? Math.abs(Math.sin(t * 6 + seed)) * 4 : pose === "run" ? Math.abs(Math.sin(t * 10 + seed)) * 9 : 0;
  const blink = (t * 0.37 + seed * 0.21) % 1 > 0.965 ? 1 : 0;
  const sit = pose === "sit" ? 1 : 0;
  const legH = 150 * H * (1 - sit * 0.5);
  const bodyH = 168 * H;
  const bw = 60 * Wd;
  const top = -legH - bodyH;
  const headY = top - 44;
  const wave = Math.sin(t * 7 + seed) * 14;
  // руки: [угол плеча, локоть] левой и правой (0 — вниз, + — от тела)
  const arms: Record<FigPose, [number, number, number, number]> = {
    stand: [8, 6, 8, 6],
    walk: [8 + gait * 16, 4, 8 - gait * 16, 4],
    run: [20 + gait * 22, 60, 20 - gait * 22, 60],
    sit: [24, -60, 24, -60],
    phone: [8, 6, 30, -150],
    point: [8, 6, 88, 0],
    open: [60, 30, 60, 30],
    cross: [30, -115, 30, -115],
    hold: [28, -75, 28, -75],
    wave: [8, 6, 150 + wave * 0.4, 25 + wave],
    think: [20, -60, 32, -160],
    hug: [70, -80, 70, -80],
    cover: [22, -150, 22, -150],
    write: [10, 6, 40, -80],
  };
  const [la, le, ra, re] = arms[pose];
  const d2r = Math.PI / 180;
  const arm = (side: -1 | 1, a: number, e: number) => {
    const sx = side * (bw - 8);
    const sy = top + 22;
    const ex = sx + side * Math.sin(a * d2r) * 68 * H;
    const ey = sy + Math.cos(a * d2r) * 68 * H;
    const hx = ex + side * Math.sin((a + e) * d2r) * 62 * H;
    const hy = ey + Math.cos((a + e) * d2r) * 62 * H;
    const sw = 24 * Math.min(1.1, Wd);
    return (
      <g key={side}>
        <path d={`M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`} stroke={OL} strokeWidth={sw + 7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`} stroke={L.top2} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={hx} cy={hy} r={11} fill={L.skin} stroke={OL} strokeWidth={3} />
        {side === 1 && pose === "phone" && (
          <g transform={`translate(${hx - 4} ${hy - 14}) rotate(-12)`}>
            <rect x={-12} y={-22} width={24} height={40} rx={5} fill="#2b3550" stroke={OL} strokeWidth={3} />
            <rect x={-8} y={-17} width={16} height={28} rx={2} fill={C.sky} />
          </g>
        )}
      </g>
    );
  };
  const hair = () => {
    switch (L.style) {
      case "short":
        return <path d="M -44 -4 Q -48 -54 0 -54 Q 46 -54 44 -6 Q 36 -30 8 -34 Q -20 -40 -44 -4 Z" fill={L.hair} stroke={OL} strokeWidth={3} />;
      case "curly":
        return (
          <g fill={L.hair} stroke={OL} strokeWidth={3}>
            {[-34, -16, 2, 20, 36].map((cx, i) => (
              <circle key={i} cx={cx} cy={-40 - (i % 2) * 8} r={17} />
            ))}
          </g>
        );
      case "long":
        return <path d="M -46 40 Q -54 -54 0 -54 Q 54 -54 46 40 L 30 40 Q 38 -10 20 -30 Q -10 -40 -30 -20 Q -38 0 -30 40 Z" fill={L.hair} stroke={OL} strokeWidth={3} />;
      case "bun":
        return (
          <g fill={L.hair} stroke={OL} strokeWidth={3}>
            <circle cx={0} cy={-60} r={18} />
            <path d="M -45 -2 Q -48 -54 0 -54 Q 48 -54 45 -2 Q 30 -36 0 -36 Q -30 -36 -45 -2 Z" />
          </g>
        );
      case "scarf":
        return <path d="M -56 30 Q -62 -62 0 -62 Q 62 -62 56 30 Q 50 52 30 56 L 36 20 Q 44 -30 0 -36 Q -44 -30 -36 20 L -30 56 Q -50 52 -56 30 Z" fill={L.scarf} stroke={OL} strokeWidth={3.5} />;
      case "bald":
        return <path d="M -44 0 Q -46 -22 -36 -30 M 44 0 Q 46 -22 36 -30" stroke={L.hair} strokeWidth={9} fill="none" strokeLinecap="round" />;
    }
  };
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${(flip ? -1 : 1) * s} ${s})`} opacity={opacity}>
      <ellipse cx={0} cy={2 + bob / s} rx={bw * 1.3} ry={11} fill="#000" opacity={0.12} />
      {L.skirt ? (
        <path d={`M ${-bw * 0.95} ${-legH - 6} L ${-bw * 1.12} -8 Q 0 4 ${bw * 1.12} -8 L ${bw * 0.95} ${-legH - 6} Z`} fill={L.pants} stroke={OL} strokeWidth={4} />
      ) : sit ? (
        <g>
          <path d={`M -24 ${-legH} L 46 ${-legH} L 46 -6`} stroke={L.pants} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d={`M -24 ${-legH} L 46 ${-legH} L 46 -6`} stroke={OL} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.25} />
        </g>
      ) : (
        <g>
          <rect x={-30} y={-legH} width={26} height={legH - 6} rx={11} fill={L.pants} stroke={OL} strokeWidth={3} transform={`rotate(${gait * 10} -17 ${-legH})`} />
          <rect x={4} y={-legH} width={26} height={legH - 6} rx={11} fill={L.pants} stroke={OL} strokeWidth={3} transform={`rotate(${-gait * 10} 17 ${-legH})`} />
        </g>
      )}
      <ellipse cx={-20 + gait * 20} cy={-6} rx={22} ry={11} fill="#2a2f45" />
      <ellipse cx={20 - gait * 20} cy={-6} rx={22} ry={11} fill="#2a2f45" />
      <g transform={`translate(0 ${-legH}) scale(1 ${breathe}) translate(0 ${legH})`}>
        <path
          d={`M ${-bw} ${top + 30} Q ${-bw} ${top} ${-bw * 0.55} ${top} L ${bw * 0.55} ${top} Q ${bw} ${top} ${bw} ${top + 30} L ${bw * 1.04} ${-legH + 6} Q 0 ${-legH + 16} ${-bw * 1.04} ${-legH + 6} Z`}
          fill={L.top}
          stroke={OL}
          strokeWidth={4}
        />
        {(L.tie || accent) && <path d={`M -9 ${top + 6} L 9 ${top + 6} L 6 ${top + 22} L 12 ${top + 92} L 0 ${top + 106} L -12 ${top + 92} L -6 ${top + 22} Z`} fill={accent ?? L.tie} stroke={OL} strokeWidth={2.5} />}
        {L.badge && <rect x={bw * 0.25} y={top + 34} width={26} height={16} rx={3} fill={L.badge} stroke={OL} strokeWidth={2} />}
        {arm(-1, la, le)}
        {arm(1, ra, re)}
        <g transform={`translate(0 ${headY})`}>
          <rect x={-12} y={34} width={24} height={16} fill={L.skin} stroke={OL} strokeWidth={2} />
          {L.style === "scarf" && hair()}
          <ellipse cx={0} cy={0} rx={43} ry={47} fill={L.skin} stroke={OL} strokeWidth={4} />
          {L.style !== "scarf" && hair()}
          {L.beard && <path d="M -36 14 Q -30 56 0 58 Q 30 56 36 14 Q 20 32 0 32 Q -20 32 -36 14 Z" fill={L.hair} stroke={OL} strokeWidth={3} />}
          <Face mood={mood} look={look} blink={blink} />
          {L.glasses && (
            <g fill="none" stroke={OL} strokeWidth={3}>
              <circle cx={-17} cy={2} r={12} />
              <circle cx={17} cy={2} r={12} />
              <path d="M -5 2 L 5 2" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

// Речевой пузырь с текстом (до трёх строк). Хвостик — к говорящему.
export const Bubble: React.FC<{ x: number; y: number; text: string; w?: number; size?: number; tail?: "left" | "right" | "down" | "none"; bg?: string; color?: string; k?: number; think?: boolean; border?: string }> = ({
  x, y, text, w = 420, size = 34, tail = "down", bg = C.white, color = C.ink, k = 1, think = false, border = OL,
}) => {
  if (k <= 0.001) return null;
  const lines = text.split("\n");
  const h = lines.length * size * 1.22 + size * 0.95;
  const sc = 0.7 + 0.3 * Math.min(1, k);
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={Math.min(1, k * 1.6)}>
      <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={size * 0.8} fill="#000" opacity={0.12} />
      {think ? (
        <g>
          <circle cx={-w * 0.22} cy={h / 2 + 22} r={12} fill={bg} stroke={border} strokeWidth={3} />
          <circle cx={-w * 0.28} cy={h / 2 + 46} r={7} fill={bg} stroke={border} strokeWidth={3} />
        </g>
      ) : tail === "down" ? (
        <path d={`M -24 ${h / 2 - 4} L 0 ${h / 2 + 34} L 22 ${h / 2 - 4} Z`} fill={bg} stroke={border} strokeWidth={4} strokeLinejoin="round" />
      ) : tail === "left" ? (
        <path d={`M ${-w / 2 + 4} -16 L ${-w / 2 - 34} 18 L ${-w / 2 + 4} 14 Z`} fill={bg} stroke={border} strokeWidth={4} strokeLinejoin="round" />
      ) : tail === "right" ? (
        <path d={`M ${w / 2 - 4} -16 L ${w / 2 + 34} 18 L ${w / 2 - 4} 14 Z`} fill={bg} stroke={border} strokeWidth={4} strokeLinejoin="round" />
      ) : null}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={size * 0.8} fill={bg} stroke={border} strokeWidth={4} />
      {!think && tail === "down" && <path d={`M -20 ${h / 2 - 2} L 18 ${h / 2 - 2}`} stroke={bg} strokeWidth={6} />}
      <text x={0} y={-((lines.length - 1) * size * 1.22) / 2 + size * 0.36} fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} textAnchor="middle">
        {lines.map((l, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : size * 1.22}>
            {l}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// Смартфон с уведомлениями.
export const Phone: React.FC<{ x: number; y: number; s?: number; t: number; ring?: number; count?: number; rot?: number }> = ({ x, y, s = 1, t, ring = 0, count = 0, rot = 0 }) => {
  const shake = ring > 0 ? Math.sin(t * 46) * 5 * ring : 0;
  return (
    <g transform={`translate(${x + shake} ${y}) rotate(${rot + shake * 0.6}) scale(${s})`}>
      {ring > 0 && [0, 1].map((i) => <path key={i} d={`M ${70 + i * 22} -50 Q ${92 + i * 22} 0 ${70 + i * 22} 50 M ${-70 - i * 22} -50 Q ${-92 - i * 22} 0 ${-70 - i * 22} 50`} stroke={C.coral} strokeWidth={7} fill="none" strokeLinecap="round" opacity={ring * (0.6 + 0.4 * Math.sin(t * 12 + i))} />)}
      <rect x={-56} y={-104} width={112} height={208} rx={22} fill="#2b3550" stroke={OL} strokeWidth={5} />
      <rect x={-46} y={-88} width={92} height={172} rx={10} fill="#eaf4ff" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-38} y={-76 + i * 40} width={76} height={30} rx={8} fill={i === 0 ? C.coralSoft : "#ffffff"} stroke="#c8d3e6" strokeWidth={2} />
      ))}
      {count > 0 && (
        <g transform="translate(50 -96)">
          <circle r={26} fill={C.coral} stroke={OL} strokeWidth={4} />
          <text y={11} fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff" textAnchor="middle">
            {count}
          </text>
        </g>
      )}
    </g>
  );
};

export const Laptop: React.FC<{ x: number; y: number; s?: number; screen?: string; open?: number }> = ({ x, y, s = 1, screen = C.sky, open = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g transform={`scale(1 ${Math.max(0.05, open)})`} style={{ transformOrigin: "0px 0px" }}>
      <rect x={-120} y={-160} width={240} height={160} rx={12} fill="#2b3550" stroke={OL} strokeWidth={5} />
      <rect x={-106} y={-146} width={212} height={132} rx={6} fill={screen} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-90} y={-130 + i * 34} width={i === 2 ? 110 : 170} height={18} rx={6} fill="#ffffff" opacity={0.75} />
      ))}
    </g>
    <path d="M -150 0 L 150 0 L 130 22 L -130 22 Z" fill="#9aa6c4" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

// Неделя/календарь без часов и цифр времени: столбцы дней, заполняемые блоками.
export const WeekGrid: React.FC<{ x: number; y: number; w: number; h: number; blocks: { day: number; row: number; color: string; label?: string; k: number }[]; days?: string[] }> = ({
  x, y, w, h, blocks, days = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"],
}) => {
  const cw = w / days.length;
  const rows = 6;
  const rh = (h - 54) / rows;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={6} y={10} width={w} height={h} rx={26} fill="#000" opacity={0.1} />
      <rect x={0} y={0} width={w} height={h} rx={26} fill={C.white} stroke={OL} strokeWidth={5} />
      {days.map((d, i) => (
        <g key={d}>
          {i > 0 && <line x1={i * cw} y1={50} x2={i * cw} y2={h - 10} stroke="#dfe5f0" strokeWidth={3} />}
          <text x={i * cw + cw / 2} y={38} fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.inkSoft} textAnchor="middle">
            {d}
          </text>
        </g>
      ))}
      <line x1={10} y1={50} x2={w - 10} y2={50} stroke="#dfe5f0" strokeWidth={3} />
      {blocks.map((b, i) => {
        if (b.k <= 0.001) return null;
        const bx = b.day * cw + 8;
        const by = 58 + b.row * rh + 4;
        return (
          <g key={i} transform={`translate(${bx + (cw - 16) / 2} ${by + (rh - 8) / 2}) scale(${0.5 + 0.5 * Math.min(1, b.k)})`} opacity={Math.min(1, b.k * 1.5)}>
            <rect x={-(cw - 16) / 2} y={-(rh - 8) / 2} width={cw - 16} height={rh - 8} rx={10} fill={b.color} stroke={OL} strokeWidth={2.5} />
            {b.label && (
              <text y={9} fontFamily={FONT} fontWeight={900} fontSize={Math.min(24, rh * 0.42)} fill={C.ink} textAnchor="middle">
                {b.label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

export const Sun: React.FC<{ x: number; y: number; r?: number; t: number; color?: string }> = ({ x, y, r = 60, t, color = C.sun }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * 2.1} fill={color} opacity={0.16} />
    <g transform={`rotate(${t * 12})`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d={`M 0 ${-r * 1.25} L 0 ${-r * 1.6}`} transform={`rotate(${i * 30})`} stroke={C.sunDeep} strokeWidth={r * 0.13} strokeLinecap="round" />
      ))}
    </g>
    <circle r={r} fill={color} stroke={C.sunDeep} strokeWidth={4} />
  </g>
);

export const Cloud: React.FC<{ x: number; y: number; s?: number; color?: string; rain?: number; t?: number }> = ({ x, y, s = 1, color = "#9aa6c4", rain = 0, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {rain > 0 &&
      Array.from({ length: 9 }).map((_, i) => {
        const yy = ((t * 260 + i * 53) % 160) + 40;
        return <line key={i} x1={-90 + i * 22} y1={yy} x2={-96 + i * 22} y2={yy + 26} stroke="#6aa9e8" strokeWidth={5} strokeLinecap="round" opacity={rain} />;
      })}
    <path d="M -110 30 Q -130 -20 -80 -30 Q -70 -80 -10 -70 Q 30 -100 70 -60 Q 125 -60 115 -10 Q 140 30 100 40 Z" fill={color} stroke={OL} strokeWidth={4} />
  </g>
);

export const Tree: React.FC<{ x: number; y: number; s?: number; t?: number; color?: string }> = ({ x, y, s = 1, t = 0, color = C.grass }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t * 0.9 + x) * 1.2})`}>
    <rect x={-14} y={-150} width={28} height={150} rx={8} fill={C.wood} stroke={OL} strokeWidth={4} />
    <circle cx={-50} cy={-170} r={66} fill={color} stroke={OL} strokeWidth={4} />
    <circle cx={50} cy={-175} r={62} fill={color} stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={-230} r={74} fill={color} stroke={OL} strokeWidth={4} />
  </g>
);

export const House: React.FC<{ x: number; y: number; s?: number; color?: string; lit?: boolean; roof?: string }> = ({ x, y, s = 1, color = C.paper, lit = false, roof = C.coral }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-190} width={240} height={190} fill={color} stroke={OL} strokeWidth={5} />
    <path d="M -150 -186 L 0 -300 L 150 -186 Z" fill={roof} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-30} y={-110} width={60} height={110} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} />
    {[-80, 80].map((wx) => (
      <rect key={wx} x={wx - 26} y={-160} width={52} height={46} rx={6} fill={lit ? C.sun : C.sky} stroke={OL} strokeWidth={4} />
    ))}
  </g>
);

// Иконки-значки (простые и узнаваемые на телефоне).
export const Icon: React.FC<{ name: "mail" | "bell" | "heart" | "star" | "book" | "run" | "moon" | "chat" | "coin" | "target" | "people" | "leaf" | "compass" | "key" | "clip" | "plane"; x: number; y: number; s?: number; color?: string }> = ({ name, x, y, s = 1, color = C.ink }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
    {name === "mail" && <g><rect x={-34} y={-24} width={68} height={48} rx={6} /><path d="M -34 -20 L 0 6 L 34 -20" /></g>}
    {name === "bell" && <g><path d="M -26 16 Q -26 -30 0 -32 Q 26 -30 26 16 L 34 24 L -34 24 Z" /><path d="M -8 32 Q 0 40 8 32" /></g>}
    {name === "heart" && <path d="M 0 30 Q -40 0 -32 -18 Q -22 -38 0 -18 Q 22 -38 32 -18 Q 40 0 0 30 Z" fill={color} stroke={OL} strokeWidth={4} />}
    {name === "star" && <path d="M 0 -34 L 10 -10 L 34 -10 L 15 6 L 22 30 L 0 16 L -22 30 L -15 6 L -34 -10 L -10 -10 Z" fill={color} stroke={OL} strokeWidth={4} />}
    {name === "book" && <g><path d="M -34 -24 Q -16 -32 0 -22 Q 16 -32 34 -24 L 34 26 Q 16 18 0 28 Q -16 18 -34 26 Z" /><path d="M 0 -22 L 0 28" /></g>}
    {name === "run" && <g><circle cx={8} cy={-28} r={8} /><path d="M 4 -16 L -6 8 L 10 18 L 6 36 M -6 8 L -22 22 M 2 -10 L 20 0 M 0 -10 L -18 -4" /></g>}
    {name === "moon" && <path d="M 10 -32 Q -30 -26 -26 6 Q -18 34 18 28 Q -10 10 10 -32 Z" fill={color} stroke={OL} strokeWidth={4} />}
    {name === "chat" && <g><rect x={-34} y={-26} width={68} height={42} rx={12} /><path d="M -14 16 L -20 32 L 4 16" /></g>}
    {name === "coin" && <g><circle r={28} fill={C.gold} stroke={OL} strokeWidth={4} /><circle r={17} stroke={C.goldDeep} strokeWidth={4} /></g>}
    {name === "target" && <g><circle r={30} /><circle r={16} /><circle r={4} fill={color} /></g>}
    {name === "people" && <g><circle cx={-14} cy={-16} r={10} /><circle cx={16} cy={-16} r={10} /><path d="M -34 24 Q -14 -6 4 24 M -4 24 Q 16 -6 36 24" /></g>}
    {name === "leaf" && <g><path d="M -26 26 Q -30 -30 30 -30 Q 30 24 -26 26 Z" fill={C.grass} stroke={OL} strokeWidth={4} /><path d="M -22 22 L 16 -16" stroke={OL} strokeWidth={4} /></g>}
    {name === "compass" && <g><circle r={32} /><path d="M 0 -22 L 8 0 L 0 22 L -8 0 Z" fill={C.coral} stroke={OL} strokeWidth={3} /></g>}
    {name === "key" && <g><circle cx={-16} cy={0} r={13} /><path d="M -3 0 L 32 0 M 22 0 L 22 12 M 30 0 L 30 10" /></g>}
    {name === "clip" && <g><rect x={-26} y={-30} width={52} height={62} rx={6} /><path d="M -14 -12 L 14 -12 M -14 2 L 14 2 M -14 16 L 6 16" /></g>}
    {name === "plane" && <path d="M -34 6 L 34 -20 L 10 30 L 2 8 Z" fill={color} stroke={OL} strokeWidth={4} />}
  </g>
);

// Карточка с заголовком и строками (схемы, таблицы).
export const Card: React.FC<{ x: number; y: number; w: number; h: number; title?: string; lines?: string[]; color?: string; fill?: string; size?: number; titleSize?: number; icon?: React.ReactNode; align?: "start" | "middle" }> = ({
  x, y, w, h, title, lines = [], color = C.teal, fill = C.white, size = 30, titleSize = 36, icon, align = "middle",
}) => {
  const tx = align === "middle" ? 0 : -w / 2 + 28;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={28} fill="#000" opacity={0.12} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={fill} stroke={OL} strokeWidth={4.5} />
      <rect x={-w / 2} y={-h / 2} width={w} height={16} rx={8} fill={color} />
      {icon}
      {title && (
        <text x={tx} y={-h / 2 + 30 + titleSize} fontFamily={FONT} fontWeight={900} fontSize={titleSize} fill={C.ink} textAnchor={align}>
          {title}
        </text>
      )}
      {lines.map((l, i) => (
        <text key={i} x={tx} y={-h / 2 + (title ? 54 + titleSize : 34) + size * 1.3 * i + size * 0.6} fontFamily={FONT} fontWeight={800} fontSize={size} fill={C.inkSoft} textAnchor={align}>
          {l}
        </text>
      ))}
    </g>
  );
};

// Ярлык-плашка (подписи на схемах).
export const Label: React.FC<{ x: number; y: number; text: string; size?: number; bg?: string; color?: string; opacity?: number; rot?: number }> = ({ x, y, text, size: s0 = 34, bg = C.paper, color = C.ink, opacity = 1, rot = 0 }) => {
  const size = s0 * 1.1;
  const w = text.length * size * 0.56 + size * 1.1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={opacity}>
      <rect x={-w / 2 + 4} y={-size * 0.95 + 6} width={w} height={size * 1.6} rx={size * 0.5} fill="#000" opacity={0.14} />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.5} fill={bg} stroke={OL} strokeWidth={3} />
      <text x={0} y={size * 0.12} fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

// Светящаяся точка решения: выбор → линия действия → результат.
export const Dot: React.FC<{ x: number; y: number; r?: number; color?: string; t?: number; glow?: number }> = ({ x, y, r = 16, color = C.teal, t = 0, glow = 1 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * (2.2 + 0.25 * Math.sin(t * 3))} fill={color} opacity={0.18 * glow} />
    <circle r={r} fill={color} stroke={C.white} strokeWidth={r * 0.35} />
  </g>
);
