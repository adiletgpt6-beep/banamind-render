// Вид за окном и природные планы: дерево, камень у дерева, горы, небо.
// Один и тот же пейзаж — в окне комнаты и в отдельных иллюстрациях, поэтому
// дерево и горы узнаваемы. Движение — только природное и спокойное: ветер
// в кроне, медленное облако, птица вдалеке. Никакого «сотворения» на экране.
import React from "react";
import { OUTLINE } from "../rig/looks";

const f = (n: number) => n.toFixed(1);

export type SkyMode = "day" | "sun" | "night";

// Кроны дерева: группы кругов, слегка качаются от ветра.
export const TreeCrown: React.FC<{ x: number; y: number; s: number; t: number; tone?: number }> = ({ x, y, s, t, tone = 0 }) => {
  // крона поднята над стволом: виден ствол и развилка ветвей
  const blobs: [number, number, number][] = [
    [0, -400, 120],
    [-130, -340, 100],
    [130, -345, 105],
    [-70, -470, 95],
    [80, -480, 92],
    [-190, -260, 78],
    [190, -265, 80],
    [0, -290, 110],
    [-90, -230, 70],
    [100, -230, 68],
  ];
  const sway = Math.sin(t * 0.9) * 4 + Math.sin(t * 2.1 + 1) * 1.6;
  const greens = tone === 1 ? ["#3f6e4c", "#4f8259", "#5f9466"] : ["#4f8a5b", "#62a06b", "#79b47d"];
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${s})`}>
      {/* ствол и ветви */}
      <path d="M -34 0 C -26 -90 -22 -170 -40 -270 L -14 -276 C -4 -210 2 -150 8 -90 C 24 -160 52 -210 92 -250 L 106 -238 C 66 -196 40 -130 34 0 Z" fill="#7a5238" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M -60 0 Q 0 -10 60 0" stroke="#5d3e29" strokeWidth={6} fill="none" />
      <g transform={`rotate(${f(sway * 0.3)} 0 -200)`}>
        {blobs.map(([bx, by, r], i) => (
          <circle key={`o${i}`} cx={bx} cy={by} r={r + 3} fill={OUTLINE} />
        ))}
        {blobs.map(([bx, by, r], i) => (
          <circle key={`a${i}`} cx={bx} cy={by} r={r} fill={greens[i % 2]} />
        ))}
        {blobs.slice(0, 7).map(([bx, by, r], i) => (
          <circle key={`h${i}`} cx={bx - r * 0.25 + Math.sin(t * 1.3 + i) * 2} cy={by - r * 0.3} r={r * 0.5} fill={greens[2]} opacity={0.75} />
        ))}
      </g>
    </g>
  );
};

export const Stone: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${f(x)} ${f(y)}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={120} ry={16} fill="#3b5a3a" opacity={0.25} />
    <path d="M -110 4 C -118 -40 -80 -78 -30 -86 C 20 -96 78 -74 104 -38 C 118 -16 112 4 100 6 Z" fill="#9a958c" stroke={OUTLINE} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -70 -50 C -40 -70 0 -76 30 -70" fill="none" stroke="#bdb8ae" strokeWidth={10} strokeLinecap="round" />
    <path d="M 40 -20 C 60 -30 80 -24 90 -10" fill="none" stroke="#827d74" strokeWidth={5} strokeLinecap="round" />
  </g>
);

const Mountains: React.FC<{ w: number; base: number; night?: boolean }> = ({ w, base, night }) => (
  <g>
    <path
      d={`M 0 ${base} L 0 ${base - 210} L ${w * 0.12} ${base - 330} L ${w * 0.22} ${base - 260} L ${w * 0.36} ${base - 420} L ${w * 0.5} ${base - 290} L ${w * 0.62} ${base - 360} L ${w * 0.78} ${base - 250} L ${w * 0.9} ${base - 320} L ${w} ${base - 230} L ${w} ${base} Z`}
      fill={night ? "#2f3d5c" : "#9fb5c9"}
    />
    {!night ? (
      <path
        d={`M ${w * 0.33} ${base - 392} L ${w * 0.36} ${base - 420} L ${w * 0.395} ${base - 386} L ${w * 0.375} ${base - 380} L ${w * 0.36} ${base - 392} L ${w * 0.345} ${base - 378} Z M ${w * 0.6} ${base - 345} L ${w * 0.62} ${base - 360} L ${w * 0.645} ${base - 342} L ${w * 0.62} ${base - 338} Z`}
        fill="#f4f6f8"
      />
    ) : null}
    <path
      d={`M 0 ${base} L 0 ${base - 120} L ${w * 0.18} ${base - 190} L ${w * 0.32} ${base - 140} L ${w * 0.47} ${base - 210} L ${w * 0.66} ${base - 130} L ${w * 0.82} ${base - 180} L ${w} ${base - 120} L ${w} ${base} Z`}
      fill={night ? "#253250" : "#7f9db3"}
    />
  </g>
);

// Полный пейзаж в системе 1920×1080. camera: смещение/масштаб для разных планов.
export const Landscape: React.FC<{ t: number; mode?: SkyMode; showBird?: boolean }> = ({ t, mode = "day", showBird = true }) => {
  const night = mode === "night";
  const W = 1920;
  const H = 1080;
  const horizon = 760;
  const cloudX = ((t * 9) % 2600) - 400;
  const stars = Array.from({ length: 90 }, (_, i) => {
    const x = (i * 211.3) % W;
    const y = (i * 97.7) % (horizon - 330);
    const r = 1.2 + ((i * 37) % 10) / 6;
    const tw = 0.55 + 0.45 * Math.sin(t * 1.4 + i * 1.7);
    return <circle key={i} cx={f(x)} cy={f(y + 20)} r={f(r)} fill="#fff8e0" opacity={f(tw)} />;
  });
  return (
    <g>
      <defs>
        <linearGradient id="sky-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ec3e6" />
          <stop offset="1" stopColor="#d9eef7" />
        </linearGradient>
        <linearGradient id="sky-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141d3a" />
          <stop offset="1" stopColor="#2c3b66" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={night ? "url(#sky-night)" : "url(#sky-day)"} />
      {night ? stars : null}
      {mode === "sun" ? (
        <g>
          <circle cx={1450} cy={230} r={150} fill="#fff6d6" opacity={0.35} />
          <circle cx={1450} cy={230} r={92} fill="#ffd977" stroke="#f0b84a" strokeWidth={4} />
        </g>
      ) : null}
      {!night ? (
        <g opacity={0.95}>
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${f(cloudX + k * 1300)} ${150 + k * 120})`}>
              <ellipse cx={0} cy={0} rx={130} ry={42} fill="#ffffff" />
              <ellipse cx={-60} cy={-20} rx={70} ry={45} fill="#ffffff" />
              <ellipse cx={50} cy={-28} rx={80} ry={50} fill="#ffffff" />
            </g>
          ))}
        </g>
      ) : null}
      <Mountains w={W} base={horizon} night={night} />
      {/* луг */}
      <path d={`M 0 ${horizon - 30} Q ${W * 0.4} ${horizon - 70} ${W} ${horizon - 20} L ${W} ${H} L 0 ${H} Z`} fill={night ? "#22362e" : "#9cc47e"} />
      <path d={`M 0 ${horizon + 60} Q ${W * 0.5} ${horizon + 10} ${W} ${horizon + 70} L ${W} ${H} L 0 ${H} Z`} fill={night ? "#1d2f28" : "#86b56b"} />
      <TreeCrown x={640} y={horizon + 150} s={1.05} t={t} tone={night ? 1 : 0} />
      <Stone x={900} y={horizon + 165} s={0.85} />
      {showBird && !night ? (
        <path
          d={`M ${f(((t * 60) % 2600) - 300)} ${f(300 + Math.sin(t * 2) * 10)} q 14 -12 28 0 q 14 -12 28 0`}
          fill="none"
          stroke="#3b4a5a"
          strokeWidth={4}
          strokeLinecap="round"
        />
      ) : null}
      {night ? <rect x={0} y={0} width={W} height={H} fill="#0c1430" opacity={0.18} /> : null}
    </g>
  );
};
