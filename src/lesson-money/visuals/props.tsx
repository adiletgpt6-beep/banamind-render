// Рисованные предметы фильма «Психология денег» (SVG): монеты и купюры, банка
// сбережений, весы, машина, дом, снежный ком, щит, мост, ключ, кошелёк, график,
// костяшки домино, газета, кубик и т. д. Простые формы, мягкие цвета, контур OL.
// Люди и общие предметы — из draw.tsx (общий стиль фильмов BanaMind).
import React from "react";
import { C, FONT } from "../theme";
import { OL } from "./draw";

export const Coin: React.FC<{ x: number; y: number; s?: number; rot?: number; label?: string; spin?: number }> = ({ x, y, s = 1, rot = 0, label, spin = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * Math.max(0.08, Math.abs(spin))} ${s})`}>
    <circle r={40} fill={C.gold} stroke={OL} strokeWidth={4} />
    <circle r={29} fill="none" stroke="#c9952a" strokeWidth={4} />
    {Math.abs(spin) > 0.4 && (
      <text y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={label ? 26 : 36} fill="#9a6c12">
        {label ?? "$"}
      </text>
    )}
  </g>
);

// стопка монет (n штук), растёт снизу вверх
export const CoinStack: React.FC<{ x: number; y: number; n: number; s?: number; color?: string }> = ({ x, y, n, s = 1, color = C.gold }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: Math.max(0, Math.floor(n)) }).map((_, i) => (
      <g key={i} transform={`translate(${(i % 2) * 3 - 1.5} ${-i * 14})`}>
        <ellipse cx={0} cy={6} rx={40} ry={12} fill="#c9952a" stroke={OL} strokeWidth={3} />
        <ellipse cx={0} cy={0} rx={40} ry={12} fill={color} stroke={OL} strokeWidth={3} />
      </g>
    ))}
  </g>
);

export const Bill: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string }> = ({ x, y, s = 1, rot = 0, color = "#8fd3a3" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-70} y={-36} width={140} height={72} rx={8} fill={color} stroke={OL} strokeWidth={4} />
    <rect x={-58} y={-25} width={116} height={50} rx={6} fill="none" stroke={C.moneyDeep} strokeWidth={3} opacity={0.6} />
    <circle r={17} fill="#e7f6ea" stroke={C.moneyDeep} strokeWidth={3} />
    <text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={C.moneyDeep}>
      $
    </text>
  </g>
);

// пачка купюр («кирпич» денег)
export const Wad: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {[4, 3, 2, 1, 0].map((i) => (
      <rect key={i} x={-70 + i * 2} y={-30 - i * 7} width={140} height={60} rx={6} fill={i ? "#7cc893" : "#8fd3a3"} stroke={OL} strokeWidth={3} />
    ))}
    <rect x={-14} y={-66} width={28} height={68} fill="#f6e7a8" stroke={OL} strokeWidth={3} />
  </g>
);

// стеклянная банка сбережений с уровнем 0…1
export const Jar: React.FC<{ x: number; y: number; s?: number; level: number; label?: string; t?: number }> = ({ x, y, s = 1, level, label, t = 0 }) => {
  const h = 230;
  const lv = Math.max(0, Math.min(1, level));
  const top = 100 - lv * (h - 20);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id={`jar-${Math.round(x)}-${Math.round(y)}`}>
          <path d="M -90 -120 Q -100 -110 -100 -90 L -100 100 Q -100 120 -80 120 L 80 120 Q 100 120 100 100 L 100 -90 Q 100 -110 90 -120 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#jar-${Math.round(x)}-${Math.round(y)})`}>
        <rect x={-110} y={-130} width={220} height={260} fill="#eaf7ff" />
        <path d={`M -110 ${top} Q -50 ${top - 8 + Math.sin(t * 2) * 4} 0 ${top} T 110 ${top} L 110 130 L -110 130 Z`} fill={C.gold} />
        {lv > 0.05 &&
          Array.from({ length: 8 }).map((_, i) => (
            <ellipse key={i} cx={-70 + (i % 4) * 46} cy={Math.max(top + 18, 100 - Math.floor(i / 4) * 30)} rx={20} ry={7} fill="#c9952a" opacity={0.6} />
          ))}
      </g>
      <path d="M -90 -120 Q -100 -110 -100 -90 L -100 100 Q -100 120 -80 120 L 80 120 Q 100 120 100 100 L 100 -90 Q 100 -110 90 -120 Z" fill="none" stroke={OL} strokeWidth={5} />
      <rect x={-96} y={-148} width={192} height={34} rx={10} fill={C.wood} stroke={OL} strokeWidth={5} />
      <path d="M -70 -90 L -70 60" stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.5} />
      {label && (
        <g transform="translate(0 20)">
          <rect x={-74} y={-24} width={148} height={46} rx={10} fill="#fff" stroke={OL} strokeWidth={3} />
          <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

// весы: tilt −1…1 (положительный — правая чаша ниже)
export const Scales: React.FC<{ x: number; y: number; s?: number; tilt: number; left?: React.ReactNode; right?: React.ReactNode }> = ({ x, y, s = 1, tilt, left, right }) => {
  const a = tilt * 14;
  const r = (a * Math.PI) / 180;
  const lx = -230 * Math.cos(r);
  const ly = -230 * Math.sin(r);
  const rx = 230 * Math.cos(r);
  const ry = 230 * Math.sin(r);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -90 240 L 90 240 L 40 210 L -40 210 Z" fill={C.wood} stroke={OL} strokeWidth={5} />
      <rect x={-12} y={-10} width={24} height={225} fill={C.wood} stroke={OL} strokeWidth={5} />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={OL} strokeWidth={14} strokeLinecap="round" />
      <circle r={20} fill={C.gold} stroke={OL} strokeWidth={5} />
      {[
        { px: lx, py: ly, c: left },
        { px: rx, py: ry, c: right },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.px} ${p.py})`}>
          <path d="M 0 0 L -80 120 M 0 0 L 80 120" stroke={OL} strokeWidth={4} />
          <path d="M -110 120 Q 0 175 110 120 Z" fill="#fff" stroke={OL} strokeWidth={5} />
          <g transform="translate(0 112)">{p.c}</g>
        </g>
      ))}
    </g>
  );
};

// машина (вид сбоку); shine — блеск «роскоши»
export const Car: React.FC<{ x: number; y: number; s?: number; color?: string; shine?: number; t?: number; flip?: boolean }> = ({ x, y, s = 1, color = C.red, shine = 0, t = 0, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M -200 20 L -190 -30 Q -180 -50 -150 -54 L -90 -60 L -40 -110 Q -20 -124 20 -124 L 90 -124 Q 120 -124 140 -100 L 175 -60 Q 205 -54 210 -30 L 214 20 Z" fill={color} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -60 -62 L -28 -102 Q -14 -112 6 -112 L 40 -112 L 40 -62 Z" fill="#bfe6ff" stroke={OL} strokeWidth={4} />
    <path d="M 56 -62 L 56 -112 L 88 -112 Q 110 -112 124 -96 L 150 -62 Z" fill="#bfe6ff" stroke={OL} strokeWidth={4} />
    <rect x={190} y={-40} width={22} height={14} rx={5} fill="#fff6c2" stroke={OL} strokeWidth={3} />
    {[-120, 130].map((wx) => (
      <g key={wx} transform={`translate(${wx} 22) rotate(${t * 220})`}>
        <circle r={44} fill="#2b2b3a" stroke={OL} strokeWidth={5} />
        <circle r={18} fill="#c9d3e0" />
        <rect x={-3} y={-40} width={6} height={22} fill="#c9d3e0" />
      </g>
    ))}
    {shine > 0.01 &&
      [
        [-150, -80],
        [70, -140],
        [200, -70],
      ].map(([sx, sy], i) => (
        <path
          key={i}
          transform={`translate(${sx} ${sy}) scale(${shine * (0.8 + 0.3 * Math.sin(t * 5 + i * 2))})`}
          d="M 0 -26 L 6 -6 L 26 0 L 6 6 L 0 26 L -6 6 L -26 0 L -6 -6 Z"
          fill="#fff"
          stroke={C.gold}
          strokeWidth={3}
        />
      ))}
  </g>
);

// большой дом / особняк
export const Mansion: React.FC<{ x: number; y: number; s?: number; crack?: number; sold?: number }> = ({ x, y, s = 1, crack = 0, sold = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-220} y={-170} width={440} height={170} fill="#f6efe0" stroke={OL} strokeWidth={5} />
    <path d="M -250 -170 L 0 -290 L 250 -170 Z" fill="#c4644a" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    {[-160, -80, 80, 160].map((wx) => (
      <rect key={wx} x={wx - 24} y={-140} width={48} height={52} rx={4} fill="#bfe6ff" stroke={OL} strokeWidth={4} />
    ))}
    <rect x={-34} y={-90} width={68} height={90} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} />
    {[-200, 200].map((cx) => (
      <rect key={cx} x={cx - 14} y={-170} width={28} height={170} fill="#fff" stroke={OL} strokeWidth={3} opacity={0.8} />
    ))}
    {crack > 0 && (
      <path d="M 60 -290 L 40 -230 L 70 -190 L 30 -130 L 60 -70 L 30 0" fill="none" stroke={OL} strokeWidth={5} strokeDasharray={400} strokeDashoffset={400 * (1 - crack)} />
    )}
    {sold > 0.01 && (
      <g transform={`translate(150 -40) rotate(-12) scale(${sold})`}>
        <rect x={-90} y={-34} width={180} height={64} rx={8} fill={C.red} stroke={OL} strokeWidth={4} />
        <text y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff">
          ПРОДАН
        </text>
      </g>
    )}
  </g>
);

// маленький скромный домик
export const Cottage: React.FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <circle cx={0} cy={-90} r={170} fill={C.yellow} opacity={0.25 * glow} />}
    <rect x={-110} y={-120} width={220} height={120} fill="#fff3d6" stroke={OL} strokeWidth={5} />
    <path d="M -135 -120 L 0 -215 L 135 -120 Z" fill="#7a9e7e" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-70} y={-92} width={46} height={44} rx={4} fill={glow > 0.3 ? "#ffe58a" : "#bfe6ff"} stroke={OL} strokeWidth={4} />
    <rect x={20} y={-70} width={50} height={70} rx={5} fill={C.wood} stroke={OL} strokeWidth={4} />
    <rect x={60} y={-200} width={26} height={50} fill="#c4644a" stroke={OL} strokeWidth={4} />
  </g>
);

// снежный ком (накопление): r — радиус
export const Snowball: React.FC<{ x: number; y: number; r: number; rot?: number }> = ({ x, y, r, rot = 0 }) => (
  <g transform={`translate(${x} ${y - r}) rotate(${rot})`}>
    <circle r={r} fill="#f4fbff" stroke={OL} strokeWidth={5} />
    <path d={`M ${-r * 0.5} ${-r * 0.3} q ${r * 0.2} ${r * 0.1} ${r * 0.4} 0 M ${r * 0.1} ${r * 0.4} q ${r * 0.2} ${-r * 0.1} ${r * 0.35} ${r * 0.05} M ${-r * 0.6} ${r * 0.3} q ${r * 0.1} ${r * 0.1} ${r * 0.25} 0`} stroke="#b9d6ea" strokeWidth={Math.max(3, r * 0.06)} fill="none" strokeLinecap="round" />
    <circle cx={-r * 0.35} cy={-r * 0.45} r={r * 0.14} fill="#fff" />
  </g>
);

// щит (запас прочности)
export const Shield: React.FC<{ x: number; y: number; s?: number; color?: string; label?: string }> = ({ x, y, s = 1, color = C.skyDeep, label }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -120 L 100 -84 Q 104 30 0 120 Q -104 30 -100 -84 Z" fill={color} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 0 -96 L 78 -68 Q 80 22 0 94 Z" fill="#fff" opacity={0.22} />
    {label && (
      <text y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff">
        {label}
      </text>
    )}
  </g>
);

// ключ (свобода, контроль над временем)
export const Key: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string }> = ({ x, y, s = 1, rot = 0, color = C.gold }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle cx={-80} cy={0} r={46} fill={color} stroke={OL} strokeWidth={6} />
    <circle cx={-80} cy={0} r={18} fill="#fff" stroke={OL} strokeWidth={4} />
    <rect x={-36} y={-12} width={150} height={24} rx={6} fill={color} stroke={OL} strokeWidth={5} />
    <rect x={70} y={10} width={18} height={30} fill={color} stroke={OL} strokeWidth={4} />
    <rect x={96} y={10} width={18} height={22} fill={color} stroke={OL} strokeWidth={4} />
  </g>
);

// кошелёк
export const Wallet: React.FC<{ x: number; y: number; s?: number; open?: number }> = ({ x, y, s = 1, open = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-70} width={220} height={140} rx={18} fill="#8a5a2b" stroke={OL} strokeWidth={6} />
    <path d={`M -110 ${-70 + open * -50} L 110 ${-70 + open * -50} L 110 -20 L -110 -20 Z`} fill="#a86d36" stroke={OL} strokeWidth={5} />
    <rect x={50} y={-12} width={74} height={44} rx={12} fill="#c98a4b" stroke={OL} strokeWidth={4} />
    <circle cx={86} cy={10} r={8} fill={C.gold} stroke={OL} strokeWidth={3} />
  </g>
);

// газета с заголовком
export const Newspaper: React.FC<{ x: number; y: number; s?: number; rot?: number; head: string; sub?: string }> = ({ x, y, s = 1, rot = 0, head, sub }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-210} y={-150} width={420} height={300} rx={6} fill="#f7f3ea" stroke={OL} strokeWidth={5} />
    <rect x={-190} y={-132} width={380} height={34} fill="#2b2b3a" />
    <text x={0} y={-106} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill="#fff">
      НОВОСТИ
    </text>
    <text x={0} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={head.length > 16 ? 34 : 44} fill={C.ink}>
      {head}
    </text>
    {sub && (
      <text x={0} y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={24} fill={C.inkSoft}>
        {sub}
      </text>
    )}
    {[20, 50, 80, 110].map((ly) => (
      <rect key={ly} x={-190} y={ly} width={ly === 110 ? 220 : 380} height={12} rx={6} fill="#d8d2c4" />
    ))}
  </g>
);

// игральный кубик (удача) — грань 1…6
export const Die: React.FC<{ x: number; y: number; s?: number; rot?: number; face: number }> = ({ x, y, s = 1, rot = 0, face }) => {
  const P: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [[-22, -22], [22, 22]],
    3: [[-22, -22], [0, 0], [22, 22]],
    4: [[-22, -22], [22, -22], [-22, 22], [22, 22]],
    5: [[-22, -22], [22, -22], [0, 0], [-22, 22], [22, 22]],
    6: [[-22, -24], [22, -24], [-22, 0], [22, 0], [-22, 24], [22, 24]],
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-50} y={-50} width={100} height={100} rx={18} fill="#fff" stroke={OL} strokeWidth={5} />
      {(P[Math.max(1, Math.min(6, Math.round(face)))] ?? []).map(([dx, dy], i) => (
        <circle key={i} cx={dx} cy={dy} r={9} fill={OL} />
      ))}
    </g>
  );
};

// ростомер-«лестница» соседей (сравнение): столбик-человек
export const Pillar: React.FC<{ x: number; y: number; h: number; w?: number; color?: string; label?: string }> = ({ x, y, h, w = 90, color = C.sky, label }) => (
  <g>
    <rect x={x - w / 2} y={y - h} width={w} height={h} rx={12} fill={color} stroke={OL} strokeWidth={4} />
    {label && (
      <text x={x} y={y + 40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.ink}>
        {label}
      </text>
    )}
  </g>
);

// мост с запасом прочности: load — вес груза, k — доля «запаса» (толщина опор)
export const Bridge: React.FC<{ x: number; y: number; s?: number; k: number; sag?: number }> = ({ x, y, s = 1, k, sag = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -420 120 L -420 40 L 420 40 L 420 120" fill="none" stroke="#7aa0c4" strokeWidth={4} />
    <rect x={-460} y={60} width={920} height={120} fill="#bfe0fb" opacity={0.6} />
    {[-300, 0, 300].map((px) => (
      <rect key={px} x={px - 14 - k * 20} y={0} width={28 + k * 40} height={150} fill="#9aa5b8" stroke={OL} strokeWidth={4} />
    ))}
    <path d={`M -440 0 Q 0 ${sag * 40} 440 0 L 440 -26 Q 0 ${sag * 40 - 26} -440 -26 Z`} fill={C.wood} stroke={OL} strokeWidth={5} />
  </g>
);

// простой график-линия: points в координатах (0…1, 0…1), рисуется до k
export const LineChart: React.FC<{ x: number; y: number; w: number; h: number; pts: [number, number][]; k: number; color?: string; axis?: boolean; width?: number }> = ({ x, y, w, h, pts, k, color = C.moneyDeep, axis = true, width = 8 }) => {
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"} ${x + px * w} ${y + h - py * h}`).join(" ");
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot((pts[i][0] - pts[i - 1][0]) * w, (pts[i][1] - pts[i - 1][1]) * h);
  return (
    <g>
      {axis && <path d={`M ${x} ${y} L ${x} ${y + h} L ${x + w} ${y + h}`} stroke={C.inkSoft} strokeWidth={5} fill="none" strokeLinecap="round" />}
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - Math.max(0, Math.min(1, k)))} />
    </g>
  );
};

// флажок-ярлык на шесте
export const Flag: React.FC<{ x: number; y: number; s?: number; text: string; color?: string; wave?: number }> = ({ x, y, s = 1, text, color = C.coral, wave = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-4} y={-170} width={8} height={170} fill={OL} />
    <path d={`M 4 -168 Q ${90 + wave * 8} ${-180 + wave * 6} 180 -160 L 180 -100 Q ${90 + wave * 8} ${-118 + wave * 6} 4 -108 Z`} fill={color} stroke={OL} strokeWidth={4} />
    <text x={92} y={-124} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">
      {text}
    </text>
  </g>
);

// часы-циферблат без цифр (время жизни) — без отсчёта; h/m — стрелки
export const Watch: React.FC<{ x: number; y: number; s?: number; a: number }> = ({ x, y, s = 1, a }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={90} fill="#fff" stroke={OL} strokeWidth={7} />
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={-3} y={-82} width={6} height={14} fill={C.inkSoft} transform={`rotate(${i * 30})`} />
    ))}
    <rect x={-5} y={-50} width={10} height={54} rx={5} fill={OL} transform={`rotate(${a})`} />
    <rect x={-4} y={-70} width={8} height={74} rx={4} fill={C.coral} transform={`rotate(${a * 12})`} />
    <circle r={9} fill={OL} />
  </g>
);

// стрелка-указатель «дорожный знак»
export const Sign: React.FC<{ x: number; y: number; s?: number; text: string; color?: string; dir?: 1 | -1 }> = ({ x, y, s = 1, text, color = C.green, dir = 1 }) => {
  const w = Math.max(200, text.length * 21 + 70);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-6} y={-20} width={12} height={200} fill={C.wood} stroke={OL} strokeWidth={3} />
      <path
        d={dir === 1 ? `M ${-w / 2} -70 L ${w / 2 - 30} -70 L ${w / 2} -35 L ${w / 2 - 30} 0 L ${-w / 2} 0 Z` : `M ${w / 2} -70 L ${-w / 2 + 30} -70 L ${-w / 2} -35 L ${-w / 2 + 30} 0 L ${w / 2} 0 Z`}
        fill={color}
        stroke={OL}
        strokeWidth={4}
      />
      <text y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff">
        {text}
      </text>
    </g>
  );
};
