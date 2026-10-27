// Рисунки фильма: небо, барханы, горы, Кааба, дома, пальмы, верблюды, свиток,
// фонарь, дерево, письмо, корабль, шатры. Правило фильма: никаких людей и
// человеческих силуэтов — история рассказывается местами, вещами, картами и словами.
import React from "react";
import { C, SERIF } from "../theme";
import { clamp01 } from "./kit";

export const OL = "#3b2a1a";

export type SkyMode = "day" | "dusk" | "night" | "dawn";

const SKY: Record<SkyMode, [string, string, string]> = {
  day: ["#7cc6ef", "#bfe5f7", "#fff3d6"],
  dusk: ["#3b3f78", "#c56f6f", "#f6c27a"],
  night: ["#0d1630", "#1c2c58", "#3a4a7a"],
  dawn: ["#40518f", "#e5a3a0", "#ffe2b0"],
};

// небо: градиент, солнце/луна, звёзды (мерцают), лёгкие облака
export const Sky: React.FC<{ mode: SkyMode; t: number; id: string; sunX?: number; sunY?: number; stars?: number; moon?: boolean }> = ({ mode, t, id, sunX = 1450, sunY = 250, stars = 70, moon }) => {
  const [a, b, c] = SKY[mode];
  const dark = mode === "night" || mode === "dusk";
  return (
    <g>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="60%" stopColor={b} />
          <stop offset="100%" stopColor={c} />
        </linearGradient>
        <radialGradient id={`glow-${id}`}>
          <stop offset="0%" stopColor="#fff6c8" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#fff6c8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={1080} fill={`url(#sky-${id})`} />
      {(mode === "night" || mode === "dawn") &&
        Array.from({ length: stars }).map((_, i) => {
          const x = (i * 337 + 91) % 1920;
          const y = (i * 173 + 37) % 620;
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.9 + i * 1.7));
          return <circle key={i} cx={x} cy={y} r={i % 7 === 0 ? 3.2 : 1.8} fill="#fff" opacity={tw * (mode === "dawn" ? 0.4 : 1)} />;
        })}
      {(mode === "day" || mode === "dawn") && !moon && (
        <g>
          <circle cx={sunX} cy={sunY} r={210} fill={`url(#glow-${id})`} />
          <circle cx={sunX} cy={sunY} r={70} fill="#fff1a8" />
        </g>
      )}
      {(moon || mode === "night") && (
        <g transform={`translate(${sunX} ${sunY})`}>
          <circle r={160} fill={`url(#glow-${id})`} opacity={0.5} />
          <path d="M 0 -62 A 62 62 0 1 0 0 62 A 48 48 0 1 1 0 -62 Z" fill="#fff4c4" transform="rotate(-20)" />
        </g>
      )}
      {mode === "day" &&
        [0, 1, 2].map((i) => {
          const x = ((t * 14 + i * 700) % 2400) - 300;
          return (
            <g key={i} transform={`translate(${x} ${120 + i * 70})`} opacity={0.85}>
              <ellipse cx={0} cy={0} rx={110} ry={30} fill="#fff" />
              <ellipse cx={50} cy={-18} rx={60} ry={30} fill="#fff" />
            </g>
          );
        })}
      {dark && <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={0.05} />}
    </g>
  );
};

// барханы в несколько планов с медленным параллаксом
export const Dunes: React.FC<{ t: number; tone?: "day" | "night" | "dusk"; y?: number; pan?: number }> = ({ t, tone = "day", y = 760, pan = 8 }) => {
  const cols =
    tone === "night" ? ["#3a3f66", "#2c3155", "#1f2443"] : tone === "dusk" ? ["#c98a5a", "#a96a45", "#8a5235"] : [C.sandDeep, C.dune, C.duneDeep];
  return (
    <g>
      {cols.map((col, i) => {
        const off = ((t * pan * (i + 1)) % 960) * (i % 2 ? -1 : 1);
        const yy = y + i * 90;
        const amp = 60 - i * 12;
        return (
          <path
            key={i}
            transform={`translate(${off - 480} 0)`}
            d={`M 0 ${yy} Q 240 ${yy - amp} 480 ${yy} T 960 ${yy} T 1440 ${yy} T 1920 ${yy} T 2400 ${yy} T 2880 ${yy} L 2880 1080 L 0 1080 Z`}
            fill={col}
          />
        );
      })}
    </g>
  );
};

// скалистые горы Хиджаза
export const Mountains: React.FC<{ y?: number; color?: string; seed?: number; scale?: number }> = ({ y = 760, color = "#9a6e4f", seed = 0, scale = 1 }) => {
  const peaks = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const x = i * 320 - 100 + ((seed * 97) % 120);
    const h = (180 + ((i * 131 + seed * 53) % 170)) * scale;
    return `L ${x} ${y - h} L ${x + 120} ${y - h * 0.62} L ${x + 180} ${y - h * 0.78}`;
  });
  return <path d={`M -100 ${y} ${peaks.join(" ")} L 2020 ${y} Z`} fill={color} />;
};

// Кааба: тёмный куб с золотой полосой (кисва), вид в три четверти
export const Kaaba: React.FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <ellipse cx={0} cy={-110} rx={260} ry={200} fill="#ffe8a0" opacity={0.35 * glow} />}
    <ellipse cx={0} cy={6} rx={190} ry={26} fill="#000" opacity={0.15} />
    <path d="M -150 -30 L 0 10 L 0 -200 L -150 -240 Z" fill={C.kaaba} />
    <path d="M 0 10 L 130 -24 L 130 -232 L 0 -200 Z" fill="#2a2a31" />
    <path d="M -150 -240 L 0 -200 L 130 -232 L -20 -268 Z" fill="#34343c" />
    <path d="M -150 -196 L 0 -156 L 130 -190 L 130 -170 L 0 -136 L -150 -176 Z" fill={C.gold} />
    <path d="M -40 -60 L -10 -52 L -10 -122 L -40 -130 Z" fill={C.gold} opacity={0.9} />
  </g>
);

// глинобитный дом с плоской крышей
export const House: React.FC<{ x: number; y: number; w?: number; h?: number; color?: string; door?: boolean; lit?: boolean }> = ({ x, y, w = 120, h = 100, color = "#e7c08a", door = true, lit }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} fill={color} stroke={OL} strokeWidth={3} />
    <rect x={-w / 2 - 6} y={-h - 10} width={w + 12} height={12} fill="#c9935a" stroke={OL} strokeWidth={3} />
    {door && <path d={`M -14 0 L -14 -40 Q 0 -54 14 -40 L 14 0 Z`} fill="#7a4b2a" />}
    <rect x={w / 2 - 34} y={-h + 24} width={18} height={18} fill={lit ? "#ffd977" : "#6b4428"} />
  </g>
);

export const Palm: React.FC<{ x: number; y: number; s?: number; t: number; seed?: number }> = ({ x, y, s = 1, t, seed = 0 }) => {
  const sway = Math.sin(t * 1.1 + seed) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -10 0 Q -4 -120 8 -230 L 20 -230 Q 10 -120 12 0 Z" fill="#8a5a33" stroke={OL} strokeWidth={3} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = -160 + i * 64 + sway;
        return <path key={i} d="M 0 0 Q 60 -40 140 10 Q 70 -16 0 6 Z" fill={i % 2 ? C.palm : "#5f9c48"} stroke={OL} strokeWidth={2.5} transform={`translate(14 -230) rotate(${a})`} />;
      })}
    </g>
  );
};

// верблюд в профиль (без всадника); walk — фаза шага
export const Camel: React.FC<{ x: number; y: number; s?: number; walk?: number; load?: boolean; dir?: 1 | -1; color?: string }> = ({ x, y, s = 1, walk = 0, load, dir = 1, color = "#c99a5e" }) => {
  const leg = (ph: number) => Math.sin(walk + ph) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
      {[[-50, 0], [-30, Math.PI], [40, Math.PI / 2], [60, Math.PI * 1.5]].map(([lx, ph], i) => (
        <path key={i} d={`M ${lx} -70 L ${lx + leg(ph as number)} -4`} stroke={i % 2 ? "#a77c48" : OL} strokeWidth={11} strokeLinecap="round" />
      ))}
      <path d="M -80 -70 Q -90 -110 -50 -118 Q -30 -170 0 -120 Q 30 -160 60 -118 Q 90 -110 85 -70 Z" fill={color} stroke={OL} strokeWidth={4} />
      <path d="M 80 -96 Q 110 -110 112 -160 Q 114 -190 138 -186 Q 156 -184 150 -168 Q 136 -160 134 -140 Q 128 -100 92 -74 Z" fill={color} stroke={OL} strokeWidth={4} />
      <circle cx={140} cy={-178} r={3.5} fill={OL} />
      <path d="M -80 -84 Q -100 -70 -96 -50" stroke={OL} strokeWidth={4} fill="none" />
      {load && (
        <g>
          <rect x={-50} y={-160} width={100} height={36} rx={10} fill="#b5523b" stroke={OL} strokeWidth={4} />
          <path d="M -50 -142 L 50 -142" stroke={C.gold} strokeWidth={5} />
          <rect x={-66} y={-134} width={26} height={48} rx={8} fill="#e4b86a" stroke={OL} strokeWidth={3} />
          <rect x={40} y={-134} width={26} height={48} rx={8} fill="#e4b86a" stroke={OL} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

// караван идёт по барханам: верблюды по цепочке
export const Caravan: React.FC<{ t: number; y: number; n?: number; speed?: number; s?: number; dir?: 1 | -1; from?: number }> = ({ t, y, n = 4, speed = 60, s = 0.8, dir = 1, from = -300 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = dir === 1 ? from + t * speed - i * 210 * s : 2200 - t * speed + i * 210 * s;
      const bob = Math.abs(Math.sin(t * 3 + i)) * 4;
      return <Camel key={i} x={x} y={y - bob} s={s} walk={t * 6 + i} load={i % 2 === 0} dir={dir} />;
    })}
  </g>
);

// пергаментный свиток (разворачивается: k 0…1)
export const Scroll: React.FC<{ x: number; y: number; w: number; h: number; k: number; children?: React.ReactNode }> = ({ x, y, w, h, k, children }) => {
  const hh = Math.max(24, h * clamp01(k));
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 + 8} y={-hh / 2 + 12} width={w} height={hh} fill="#000" opacity={0.12} rx={8} />
      <rect x={-w / 2} y={-hh / 2} width={w} height={hh} fill={C.parchment} stroke={C.parchmentDeep} strokeWidth={4} />
      <rect x={-w / 2 + 18} y={-hh / 2 + 14} width={w - 36} height={Math.max(0, hh - 28)} fill="none" stroke={C.parchmentDeep} strokeWidth={2} strokeDasharray="10 8" />
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(0 ${(sd * hh) / 2})`}>
          <rect x={-w / 2 - 26} y={-18} width={w + 52} height={36} rx={18} fill="#b8864b" stroke={OL} strokeWidth={4} />
          <circle cx={-w / 2 - 26} cy={0} r={22} fill="#8a5a33" stroke={OL} strokeWidth={4} />
          <circle cx={w / 2 + 26} cy={0} r={22} fill="#8a5a33" stroke={OL} strokeWidth={4} />
        </g>
      ))}
      {k > 0.85 && <g opacity={clamp01((k - 0.85) / 0.15)}>{children}</g>}
    </g>
  );
};

// фонарь с мягким светом
export const Lantern: React.FC<{ x: number; y: number; s?: number; t: number; glow?: number }> = ({ x, y, s = 1, t, glow = 1 }) => {
  const fl = 0.85 + 0.15 * Math.sin(t * 7) * Math.sin(t * 3.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={0} r={130} fill="#ffd977" opacity={0.22 * fl * glow} />
      <circle cx={0} cy={0} r={70} fill="#ffe7a3" opacity={0.3 * fl * glow} />
      <path d="M 0 -110 L 0 -80" stroke={OL} strokeWidth={5} />
      <path d="M -26 -80 L 26 -80 L 34 -60 L -34 -60 Z" fill={C.gold} stroke={OL} strokeWidth={4} />
      <path d="M -34 -60 L 34 -60 L 40 40 L -40 40 Z" fill="#ffe9a8" stroke={OL} strokeWidth={4} opacity={0.95} />
      <path d="M -12 -60 L -14 40 M 12 -60 L 14 40" stroke={C.gold} strokeWidth={4} />
      <ellipse cx={0} cy={6} rx={10} ry={18 * fl} fill="#ff9d2e" />
      <path d="M -44 40 L 44 40 L 30 62 L -30 62 Z" fill={C.gold} stroke={OL} strokeWidth={4} />
    </g>
  );
};

// раскидистое дерево (дерево клятвы, дерево у дороги)
export const Tree: React.FC<{ x: number; y: number; s?: number; t: number; glow?: number }> = ({ x, y, s = 1, t, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <ellipse cx={0} cy={-220} rx={330} ry={230} fill="#fff1b0" opacity={0.35 * glow} />}
    <path d="M -24 0 Q -16 -100 -40 -180 L -10 -186 Q 0 -120 10 -186 L 40 -180 Q 16 -100 24 0 Z" fill="#7a5233" stroke={OL} strokeWidth={4} />
    {[[-130, -230, 110], [0, -290, 140], [130, -230, 110], [-70, -170, 90], [80, -170, 90]].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx + Math.sin(t * 0.8 + i) * 3} cy={cy} r={r} fill={i % 2 ? "#5d9e4f" : "#6fb05c"} stroke={OL} strokeWidth={4} />
    ))}
  </g>
);

// запечатанное письмо
export const Letter: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-60} y={-40} width={120} height={80} rx={6} fill={C.paper} stroke={OL} strokeWidth={4} />
    <path d="M -60 -40 L 0 8 L 60 -40" fill="none" stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={8} r={14} fill={C.red} stroke={OL} strokeWidth={3} />
  </g>
);

// парусный корабль
export const Ship: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 2) * 6}) rotate(${Math.sin(t * 1.6) * 2}) scale(${s})`}>
    <path d="M -120 0 L 120 0 L 90 50 L -90 50 Z" fill="#8a5a33" stroke={OL} strokeWidth={4} />
    <path d="M 0 0 L 0 -170" stroke={OL} strokeWidth={6} />
    <path d="M 6 -160 Q 90 -100 6 -20 Z" fill={C.paper} stroke={OL} strokeWidth={4} />
    <path d="M -6 -140 Q -70 -90 -6 -30 Z" fill={C.paper} stroke={OL} strokeWidth={4} />
  </g>
);

// шатёр
export const Tent: React.FC<{ x: number; y: number; s?: number; color?: string; lit?: boolean }> = ({ x, y, s = 1, color = "#f2e6cf", lit }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -80 0 L 0 -90 L 80 0 Z" fill={color} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -16 0 L 0 -40 L 16 0 Z" fill={lit ? "#ffcf6a" : "#6b4428"} />
  </g>
);

// огонь костра
export const Fire: React.FC<{ x: number; y: number; s?: number; t: number; seed?: number }> = ({ x, y, s = 1, t, seed = 0 }) => {
  const f = 0.8 + 0.2 * Math.sin(t * 9 + seed * 3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-20} r={60} fill="#ffb347" opacity={0.25 * f} />
      <path d={`M -16 0 Q -22 ${-30 * f} 0 ${-56 * f} Q 22 ${-30 * f} 16 0 Z`} fill="#ff8a2a" />
      <path d={`M -8 0 Q -10 ${-18 * f} 0 ${-32 * f} Q 10 ${-18 * f} 8 0 Z`} fill="#ffe08a" />
    </g>
  );
};

// раскрытая книга с «строками»
export const OpenBook: React.FC<{ x: number; y: number; s?: number; title?: string }> = ({ x, y, s = 1, title }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -150 Q -120 -180 -250 -150 L -250 130 Q -120 100 0 130 Z" fill={C.paper} stroke={OL} strokeWidth={5} />
    <path d="M 0 -150 Q 120 -180 250 -150 L 250 130 Q 120 100 0 130 Z" fill="#fffaf0" stroke={OL} strokeWidth={5} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i}>
        <path d={`M -210 ${-100 + i * 36} L -40 ${-96 + i * 36}`} stroke="#c9b48a" strokeWidth={6} strokeLinecap="round" />
        <path d={`M 40 ${-96 + i * 36} L 210 ${-100 + i * 36}`} stroke="#c9b48a" strokeWidth={6} strokeLinecap="round" />
      </g>
    ))}
    {title && (
      <text x={0} y={190} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={40} fill={C.ink}>
        {title}
      </text>
    )}
  </g>
);

// восьмиконечная звезда — элемент орнамента
export const Star8: React.FC<{ x: number; y: number; r: number; fill?: string; stroke?: string; rot?: number; opacity?: number }> = ({ x, y, r, fill = C.gold, stroke, rot = 0, opacity = 1 }) => {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.72 : r;
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return <path d={`M ${pts.join(" L ")} Z`} transform={`translate(${x} ${y}) rotate(${rot})`} fill={fill} stroke={stroke} strokeWidth={stroke ? 4 : 0} opacity={opacity} />;
};

// арка-орнамент (рамка заголовков и цитат)
export const Arch: React.FC<{ x: number; y: number; w: number; h: number; fill?: string; stroke?: string }> = ({ x, y, w, h, fill = C.paper, stroke = C.gold }) => (
  <path
    d={`M ${x - w / 2} ${y + h / 2} L ${x - w / 2} ${y - h / 2 + w * 0.32} Q ${x - w / 2} ${y - h / 2} ${x} ${y - h / 2 - w * 0.08} Q ${x + w / 2} ${y - h / 2} ${x + w / 2} ${y - h / 2 + w * 0.32} L ${x + w / 2} ${y + h / 2} Z`}
    fill={fill}
    stroke={stroke}
    strokeWidth={8}
  />
);

// стая птиц (взмахи крыльями)
export const Birds: React.FC<{ t: number; x: number; y: number; n?: number; spread?: number; s?: number }> = ({ t, x, y, n = 9, spread = 300, s = 1 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const bx = x + ((i * 97) % spread) - spread / 2 + Math.sin(t * 1.3 + i) * 14;
      const by = y + ((i * 53) % (spread * 0.4)) - spread * 0.2 + Math.cos(t * 1.7 + i) * 8;
      const flap = Math.sin(t * 10 + i) * 10;
      return <path key={i} d={`M ${-22 * s} ${flap * s} Q ${-10 * s} ${-8 * s} 0 0 Q ${10 * s} ${-8 * s} ${22 * s} ${flap * s}`} transform={`translate(${bx} ${by})`} fill="none" stroke="#2b2b35" strokeWidth={4 * s} strokeLinecap="round" />;
    })}
  </g>
);
