// Рисованные предметы фильма «Атомные привычки» (SVG): термометр и кубик льда,
// банки и скрепки, холодильник и бутылки, яблоки, велотренажёр, телевизор, шланг,
// домино, чайка, весы, сундук, роутер, договор, кошка, карточки и фишки.
// Простые формы, мягкие цвета, контур — в одном стиле с src/lesson-habits/visuals/draw.
import React from "react";
import { C, FONT } from "../theme";
import type { HostSpot } from "../types";
import { OL } from "./draw";
import { Txt, clamp01 } from "./kit";

// центр области схемы в зависимости от места банана
export const zoneX = (host: unknown) => {
  const h = host as HostSpot;
  return h === "left" ? 1170 : h === "right" ? 760 : h === "corner" ? 1080 : h === "peek" ? 720 : 960;
};

// белая карточка с заголовком
export const Card: React.FC<{ x: number; y: number; w: number; h: number; title?: string; color?: string; fill?: string; children?: React.ReactNode; size?: number }> = ({
  x,
  y,
  w,
  h,
  title,
  color = C.yellow,
  fill = C.white,
  children,
  size = 34,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={28} fill="#24324a" opacity={0.1} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={fill} stroke={OL} strokeWidth={4} />
    {title && (
      <g>
        <rect x={-w / 2} y={-h / 2} width={w} height={size * 1.7} rx={28} fill={color} stroke={OL} strokeWidth={4} />
        <rect x={-w / 2 + 2} y={-h / 2 + size * 1.7 - 26} width={w - 4} height={24} fill={color} />
        <Txt x={0} y={-h / 2 + size * 1.15} size={size} weight={900}>
          {title}
        </Txt>
      </g>
    )}
    {children}
  </g>
);

// фишка-пилюля с текстом, ширина по тексту
export const Chip: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; textColor?: string; k?: number }> = ({ x, y, text, color = C.white, size = 34, textColor = C.ink, k = 1 }) => {
  if (k <= 0.001) return null;
  const w = text.length * size * 0.55 + size * 1.3;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * clamp01(k)})`} opacity={clamp01(k * 1.4)}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.8} fill={color} stroke={OL} strokeWidth={3} />
      <Txt x={0} y={size * 0.12} size={size} color={textColor}>
        {text}
      </Txt>
    </g>
  );
};

// термометр: level 0…1
export const Thermometer: React.FC<{ x: number; y: number; s?: number; level: number; hot?: number }> = ({ x, y, s = 1, level, hot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-34} y={-330} width={68} height={340} rx={34} fill="#fff" stroke={OL} strokeWidth={6} />
    <circle cx={0} cy={40} r={62} fill={hot > 0.5 ? C.red : C.skyDeep} stroke={OL} strokeWidth={6} />
    <rect x={-16} y={20 - 320 * level} width={32} height={320 * level + 20} rx={16} fill={hot > 0.5 ? C.red : C.skyDeep} />
    {Array.from({ length: 9 }).map((_, i) => (
      <line key={i} x1={34} y1={-290 + i * 34} x2={i % 2 ? 52 : 64} y2={-290 + i * 34} stroke={OL} strokeWidth={4} />
    ))}
  </g>
);

// кубик льда, melt 0…1 → лужица
export const IceCube: React.FC<{ x: number; y: number; s?: number; melt: number; t?: number }> = ({ x, y, s = 1, melt, t = 0 }) => {
  const m = clamp01(melt);
  const h = 220 * (1 - m * 0.85);
  const w = 220 * (1 + m * 0.15);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={140 + m * 160} ry={18 + m * 14} fill="#9fd8f6" opacity={0.35 + 0.4 * m} />
      <rect x={-w / 2} y={-h} width={w} height={h} rx={34 + m * 40} fill="#dff4ff" stroke={OL} strokeWidth={5} opacity={0.95} />
      <path d={`M ${-w / 2 + 30} ${-h + 30} L ${-w / 2 + 80} ${-h + 30}`} stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={0.9 * (1 - m)} />
      <path d={`M ${w / 2 - 40} ${-h + 50} L ${w / 2 - 40} ${-h + 110}`} stroke="#b5e3fb" strokeWidth={10} strokeLinecap="round" opacity={1 - m} />
      {m > 0.05 &&
        [0, 1, 2].map((i) => {
          const ph = (t * 0.9 + i * 0.33) % 1;
          return <ellipse key={i} cx={-60 + i * 60} cy={-h * (1 - ph) + 10} rx={9} ry={13} fill="#7fd1f5" opacity={(1 - ph) * m} />;
        })}
    </g>
  );
};

// банка (стеклянная), fill 0…1
export const Jar: React.FC<{ x: number; y: number; s?: number; fill?: number; label?: string; color?: string }> = ({ x, y, s = 1, fill = 0, label, color = C.yellow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-250} width={220} height={260} rx={36} fill="#eef8ff" stroke={OL} strokeWidth={6} opacity={0.95} />
    {fill > 0 && <rect x={-98} y={-2 - 236 * clamp01(fill)} width={196} height={236 * clamp01(fill)} rx={26} fill={color} opacity={0.85} />}
    <rect x={-90} y={-284} width={180} height={40} rx={12} fill={C.wood} stroke={OL} strokeWidth={5} />
    <path d="M -76 -220 L -76 -60" stroke="#fff" strokeWidth={12} strokeLinecap="round" opacity={0.7} />
    {label && (
      <g>
        <rect x={-96} y={-150} width={192} height={64} rx={12} fill="#fff" stroke={OL} strokeWidth={3} />
        <text x={0} y={-108} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={label.length > 10 ? 22 : 28} fill={C.ink}>
          {label}
        </text>
      </g>
    )}
  </g>
);

// канцелярская скрепка
export const Clip: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string }> = ({ x, y, s = 1, rot = 0, color = "#8a94a8" }) => (
  <path
    transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
    d="M -6 30 L -6 -22 Q -6 -36 6 -36 Q 18 -36 18 -22 L 18 22 Q 18 40 0 40 Q -18 40 -18 22 L -18 -14"
    fill="none"
    stroke={color}
    strokeWidth={6}
    strokeLinecap="round"
  />
);

// бутылка: вода (голубая) или газировка (красная)
export const Bottle: React.FC<{ x: number; y: number; s?: number; kind: "water" | "soda" }> = ({ x, y, s = 1, kind }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -16 -96 L 16 -96 L 16 -74 Q 34 -60 34 -36 L 34 30 Q 34 40 24 40 L -24 40 Q -34 40 -34 30 L -34 -36 Q -34 -60 -16 -74 Z" fill={kind === "water" ? "#bfe6fb" : C.red} stroke={OL} strokeWidth={4} />
    <rect x={-18} y={-110} width={36} height={18} rx={4} fill={kind === "water" ? C.skyDeep : "#7a1f22"} stroke={OL} strokeWidth={3} />
    <rect x={-34} y={-20} width={68} height={30} fill={kind === "water" ? "#fff" : "#fff3d6"} opacity={0.85} />
    {kind === "water" && <path d="M -10 -46 Q -14 -30 -4 -26" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />}
  </g>
);

// холодильник-витрина с полками; children — содержимое
export const Fridge: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode; open?: number }> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-130} y={-420} width={260} height={440} rx={22} fill="#e9eef5" stroke={OL} strokeWidth={6} />
    <rect x={-112} y={-400} width={224} height={400} rx={12} fill="#f7fbff" stroke={OL} strokeWidth={3} />
    {[0, 1, 2].map((i) => (
      <line key={i} x1={-112} y1={-270 + i * 130} x2={112} y2={-270 + i * 130} stroke={OL} strokeWidth={4} />
    ))}
    {children}
  </g>
);

// яблоко
export const Apple: React.FC<{ x: number; y: number; s?: number; color?: string; rot?: number }> = ({ x, y, s = 1, color = C.red, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 -26 C -30 -42 -46 -10 -36 14 C -28 34 -10 40 0 32 C 10 40 28 34 36 14 C 46 -10 30 -42 0 -26 Z" fill={color} stroke={OL} strokeWidth={4} />
    <path d="M 0 -26 Q 2 -40 8 -46" stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />
    <ellipse cx={14} cy={-40} rx={10} ry={5} fill={C.green} transform="rotate(-30 14 -40)" />
    <ellipse cx={-14} cy={-6} rx={6} ry={10} fill="#fff" opacity={0.4} />
  </g>
);

// телевизор / экран; on 0…1 — картинка
export const TV: React.FC<{ x: number; y: number; s?: number; on: number; t?: number; label?: string }> = ({ x, y, s = 1, on, t = 0, label }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-180} y={-130} width={360} height={230} rx={18} fill="#2b3a67" stroke={OL} strokeWidth={6} />
    <rect x={-160} y={-112} width={320} height={192} rx={10} fill={on > 0.5 ? "#6cc5f0" : "#1d2540"} />
    {on > 0.5 && (
      <g>
        <circle cx={-60 + Math.sin(t * 2) * 30} cy={-20} r={34} fill={C.yellow} />
        <path d={`M -160 60 Q -60 ${10 + Math.sin(t * 3) * 10} 40 40 T 160 30 L 160 80 L -160 80 Z`} fill={C.green} />
        {label && (
          <text x={70} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">
            {label}
          </text>
        )}
      </g>
    )}
    <rect x={-40} y={100} width={80} height={24} fill="#2b3a67" stroke={OL} strokeWidth={4} />
    <rect x={-90} y={122} width={180} height={16} rx={8} fill="#2b3a67" stroke={OL} strokeWidth={4} />
  </g>
);

// велотренажёр; spin — угол педалей
export const ExerciseBike: React.FC<{ x: number; y: number; s?: number; spin: number }> = ({ x, y, s = 1, spin }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -150 40 L 150 40" stroke={OL} strokeWidth={14} strokeLinecap="round" />
    <path d="M -110 40 L -40 -110 L 70 -110 L 100 40 M 70 -110 L 90 -200 M -40 -110 L -60 -160" stroke="#4a5874" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x={-100} y={-180} width={90} height={26} rx={12} fill={OL} />
    <path d="M 60 -210 L 120 -210" stroke={OL} strokeWidth={12} strokeLinecap="round" />
    <circle cx={10} cy={-30} r={56} fill="#dfe3ea" stroke={OL} strokeWidth={6} />
    <g transform={`translate(10 -30) rotate(${spin})`}>
      <line x1={-48} y1={0} x2={48} y2={0} stroke={OL} strokeWidth={8} />
      <line x1={0} y1={-48} x2={0} y2={48} stroke={OL} strokeWidth={8} />
    </g>
  </g>
);

// садовый шланг от крана: kink 1 — перегнут, 0 — прямой; flow 0…1
export const Hose: React.FC<{ x: number; y: number; s?: number; kink: number; flow: number; t: number }> = ({ x, y, s = 1, kink, flow, t }) => {
  const k = clamp01(kink);
  const mid = `Q 120 ${-40 - k * 140} 200 ${0 - k * 10} Q 240 ${k * 110} 300 ${-10 + k * 20}`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* кран */}
      <rect x={-130} y={-80} width={40} height={140} rx={10} fill="#9aa5b8" stroke={OL} strokeWidth={5} />
      <rect x={-96} y={-30} width={60} height={34} rx={8} fill="#9aa5b8" stroke={OL} strokeWidth={5} />
      <circle cx={-110} cy={-100} r={30} fill={C.red} stroke={OL} strokeWidth={5} />
      <path d={`M -40 -14 Q 40 -14 60 -10 ${mid} L 520 -10`} fill="none" stroke={C.green} strokeWidth={30} strokeLinecap="round" />
      <path d={`M -40 -14 Q 40 -14 60 -10 ${mid} L 520 -10`} fill="none" stroke="#7cd6a5" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
      {/* струя */}
      {Array.from({ length: 14 }).map((_, i) => {
        const ph = (t * 1.4 + i / 14) % 1;
        const len = 40 + flow * 360;
        const px = 540 + ph * len;
        const py = -10 + ph * ph * (200 - flow * 120);
        return <circle key={i} cx={px} cy={py} r={7 + flow * 5} fill="#6cc5f0" opacity={(0.25 + 0.75 * flow) * (1 - ph * 0.6)} />;
      })}
    </g>
  );
};

// костяшка домино с подписью; fall 0…1
export const Domino: React.FC<{ x: number; y: number; s?: number; fall: number; label: string; color?: string }> = ({ x, y, s = 1, fall, label, color = C.white }) => (
  <g transform={`translate(${x} ${y}) rotate(${clamp01(fall) * 62}) scale(${s})`}>
    <rect x={-46} y={-220} width={92} height={220} rx={14} fill={color} stroke={OL} strokeWidth={5} />
    <line x1={-34} y1={-110} x2={34} y2={-110} stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={-165} r={9} fill={OL} />
    <circle cx={-18} cy={-55} r={8} fill={OL} />
    <circle cx={18} cy={-55} r={8} fill={OL} />
    <text x={0} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink} transform={`rotate(${-clamp01(fall) * 62} 0 30)`}>
      {label}
    </text>
  </g>
);

// голова чайки с клювом; dots — сколько красных пятен
export const GullHead: React.FC<{ x: number; y: number; s?: number; dots: number; card?: boolean }> = ({ x, y, s = 1, dots, card }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {card ? (
      <rect x={-110} y={-90} width={150} height={150} rx={16} fill="#d8c3a1" stroke={OL} strokeWidth={5} />
    ) : (
      <g>
        <path d="M -40 60 Q -120 120 -110 220 L 40 220 Q 30 120 20 70 Z" fill="#eef1f5" stroke={OL} strokeWidth={5} />
        <circle cx={-30} cy={-10} r={80} fill="#f7f8fa" stroke={OL} strokeWidth={5} />
      </g>
    )}
    <circle cx={-40} cy={-30} r={11} fill={OL} />
    <path d="M 30 -16 L 190 4 L 190 22 L 30 30 Z" fill="#ffd23f" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    {Array.from({ length: dots }).map((_, i) => (
      <circle key={i} cx={150 - i * 40} cy={15} r={dots > 1 ? 15 : 11} fill={C.red} stroke={OL} strokeWidth={2} />
    ))}
  </g>
);

// птенец; peck 0…1 — наклон к клюву
export const Chick: React.FC<{ x: number; y: number; s?: number; peck: number; excited?: number }> = ({ x, y, s = 1, peck, excited = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={70} ry={56} fill="#d9c9a8" stroke={OL} strokeWidth={5} />
    <g transform={`rotate(${-peck * 30} 20 -40)`}>
      <circle cx={30} cy={-60} r={38} fill="#e4d6ba" stroke={OL} strokeWidth={5} />
      <circle cx={42} cy={-68} r={7} fill={OL} />
      <path d="M 60 -58 L 92 -50 L 60 -42 Z" fill="#c9a24a" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    </g>
    {excited > 0 &&
      [0, 1, 2].map((i) => (
        <path key={i} d={`M ${-70 + i * 30} ${-90 - i * 10} l 8 -24`} stroke={C.orange} strokeWidth={6} strokeLinecap="round" opacity={excited} />
      ))}
  </g>
);

// весы-коромысло: tilt > 0 — правая чаша ниже
export const Scale: React.FC<{ x: number; y: number; s?: number; tilt: number; left?: React.ReactNode; right?: React.ReactNode }> = ({ x, y, s = 1, tilt, left, right }) => {
  const a = tilt * 16;
  const r = (a * Math.PI) / 180;
  const lx = -260 * Math.cos(r);
  const ly = -260 * Math.sin(r);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -40 260 L 40 260 L 14 -10 L -14 -10 Z" fill={C.wood} stroke={OL} strokeWidth={5} />
      <g transform={`rotate(${a})`}>
        <rect x={-280} y={-12} width={560} height={24} rx={12} fill="#b07a45" stroke={OL} strokeWidth={5} />
      </g>
      <circle r={20} fill={C.yellowDeep} stroke={OL} strokeWidth={5} />
      {[
        [lx, ly, left],
        [-lx, -ly, right],
      ].map(([px, py, ch], i) => (
        <g key={i} transform={`translate(${px as number} ${py as number})`}>
          <path d="M 0 0 L -90 120 M 0 0 L 90 120" stroke={OL} strokeWidth={4} />
          <path d="M -120 120 L 120 120 Q 100 170 0 170 Q -100 170 -120 120 Z" fill="#e8c96a" stroke={OL} strokeWidth={5} />
          <g transform="translate(0 110)">{ch as React.ReactNode}</g>
        </g>
      ))}
    </g>
  );
};

// кошка (опыт Торндайка)
export const Cat: React.FC<{ x: number; y: number; s?: number; t?: number; happy?: boolean }> = ({ x, y, s = 1, t = 0, happy }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M 60 -20 Q ${110 + Math.sin(t * 4) * 14} -60 ${90 + Math.sin(t * 4) * 10} -110`} stroke={OL} strokeWidth={12} fill="none" strokeLinecap="round" />
    <path d={`M 60 -20 Q ${110 + Math.sin(t * 4) * 14} -60 ${90 + Math.sin(t * 4) * 10} -110`} stroke="#f4a259" strokeWidth={6} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={-30} rx={70} ry={46} fill="#f4a259" stroke={OL} strokeWidth={5} />
    <circle cx={-56} cy={-90} r={42} fill="#f4a259" stroke={OL} strokeWidth={5} />
    <path d="M -92 -110 L -86 -150 L -66 -124 Z M -46 -126 L -26 -150 L -24 -110 Z" fill="#f4a259" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={-70} cy={-94} r={5} fill={OL} />
    <circle cx={-44} cy={-94} r={5} fill={OL} />
    <path d={happy ? "M -66 -76 Q -57 -68 -48 -76" : "M -66 -72 L -48 -72"} stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />
    <path d="M -40 10 L -40 20 M 30 10 L 30 20" stroke={OL} strokeWidth={10} strokeLinecap="round" />
  </g>
);

// лист договора с подписями; sign 0…1
export const Contract: React.FC<{ x: number; y: number; s?: number; sign: number; title?: string }> = ({ x, y, s = 1, sign, title = "ДОГОВОР" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-170} y={-230} width={340} height={460} rx={14} fill="#fffaf0" stroke={OL} strokeWidth={5} />
    <text x={0} y={-170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={C.ink}>
      {title}
    </text>
    {[0, 1, 2, 3, 4].map((i) => (
      <line key={i} x1={-130} y1={-110 + i * 40} x2={i === 4 ? 40 : 130} y2={-110 + i * 40} stroke="#c7cdd8" strokeWidth={8} strokeLinecap="round" />
    ))}
    {[-90, 0, 90].map((dx, i) => {
      const k = clamp01(sign * 3 - i);
      return (
        <g key={i}>
          <line x1={dx - 38} y1={170} x2={dx + 38} y2={170} stroke={OL} strokeWidth={3} />
          <path d={`M ${dx - 34} 160 q 14 -30 22 0 t 22 0 t 22 -6`} fill="none" stroke={C.skyDeep} strokeWidth={4} strokeDasharray={90} strokeDashoffset={90 * (1 - k)} strokeLinecap="round" />
        </g>
      );
    })}
  </g>
);

// роутер Wi-Fi; on — сигнал
export const Router: React.FC<{ x: number; y: number; s?: number; on: number }> = ({ x, y, s = 1, on }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-40} width={240} height={70} rx={16} fill="#4a5874" stroke={OL} strokeWidth={5} />
    <path d="M -80 -40 L -100 -130 M 80 -40 L 100 -130" stroke={OL} strokeWidth={10} strokeLinecap="round" />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={-70 + i * 40} cy={-5} r={8} fill={on > 0.5 ? C.green : "#7b8496"} />
    ))}
    {on > 0.05 &&
      [1, 2, 3].map((i) => <path key={i} d={`M ${-40 * i} ${-70 - i * 22} Q 0 ${-110 - i * 40} ${40 * i} ${-70 - i * 22}`} stroke={C.skyDeep} strokeWidth={9} fill="none" strokeLinecap="round" opacity={on} />)}
  </g>
);

// сундук; lock 0…1 — крышка закрыта и заперта
export const Trunk: React.FC<{ x: number; y: number; s?: number; lock: number }> = ({ x, y, s = 1, lock }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-170} y={-120} width={340} height={170} rx={18} fill="#8a5a2b" stroke={OL} strokeWidth={6} />
    <g transform={`rotate(${-(1 - clamp01(lock)) * 60} -170 -120)`}>
      <path d="M -170 -120 L -170 -170 Q 0 -240 170 -170 L 170 -120 Z" fill="#a8734a" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    </g>
    <rect x={-176} y={-40} width={352} height={20} fill="#e8c96a" stroke={OL} strokeWidth={4} />
    {lock > 0.7 && (
      <g transform="translate(0 -70)" opacity={(lock - 0.7) / 0.3}>
        <path d="M -24 0 L -24 -24 Q -24 -50 0 -50 Q 24 -50 24 -24 L 24 0" stroke={OL} strokeWidth={8} fill="none" />
        <rect x={-36} y={-4} width={72} height={60} rx={10} fill={C.yellowDeep} stroke={OL} strokeWidth={5} />
      </g>
    )}
  </g>
);

// развилка дороги (две ветки)
export const Fork: React.FC<{ x: number; y: number; s?: number; k: number; pick?: number }> = ({ x, y, s = 1, k, pick = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={clamp01(k * 2)}>
    <path d="M 0 260 L 0 60 Q 0 0 -160 -140 M 0 60 Q 0 0 160 -140" stroke="#fff" strokeWidth={70} strokeLinecap="round" fill="none" />
    <path d="M 0 260 L 0 60 Q 0 0 -160 -140" stroke={pick < 0 ? C.green : "#dfe3ea"} strokeWidth={12} strokeDasharray="26 20" fill="none" />
    <path d="M 0 60 Q 0 0 160 -140" stroke={pick > 0 ? C.red : "#dfe3ea"} strokeWidth={12} strokeDasharray="26 20" fill="none" />
  </g>
);

// календарь недели (7 столбцов); marks — функция для содержимого клетки
export const WeekStrip: React.FC<{ x: number; y: number; cell?: number; shown: number; done?: boolean[] }> = ({ x, y, cell = 130, shown, done = [] }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 7 }).map((_, i) => {
      const k = clamp01(shown - i);
      if (k <= 0) return null;
      return (
        <g key={i} transform={`translate(${(i - 3) * (cell + 14)} 0) scale(${0.7 + 0.3 * k})`} opacity={k}>
          <rect x={-cell / 2} y={-cell / 2} width={cell} height={cell} rx={20} fill={done[i] ? "#d9f5e5" : "#fff"} stroke={OL} strokeWidth={4} />
          <rect x={-cell / 2} y={-cell / 2} width={cell} height={34} rx={16} fill={C.coral} />
          <rect x={-cell / 2} y={-cell / 2 + 18} width={cell} height={16} fill={C.coral} />
          <text x={0} y={-cell / 2 + 26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#fff">
            {`день ${i + 1}`}
          </text>
        </g>
      );
    })}
  </g>
);

// крестик в клетке трекера
export const XMark: React.FC<{ x: number; y: number; s?: number; k: number; color?: string }> = ({ x, y, s = 1, k, color = C.green }) => {
  if (k <= 0) return null;
  const a = clamp01(k * 2);
  const b = clamp01(k * 2 - 1);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={10} strokeLinecap="round">
      <line x1={-18} y1={-18} x2={-18 + 36 * a} y2={-18 + 36 * a} />
      {b > 0 && <line x1={18} y1={-18} x2={18 - 36 * b} y2={-18 + 36 * b} />}
    </g>
  );
};

// подпись-формула в рамке: части с «дырками» [ ... ]
export const Formula: React.FC<{ x: number; y: number; parts: { text: string; slot?: boolean; fill?: string; k?: number }[]; size?: number }> = ({ x, y, parts, size = 40 }) => {
  const widths = parts.map((p) => (p.slot ? Math.max(p.text.length, (p.fill ?? "").length) * size * 0.56 + size : p.text.length * size * 0.62 + 24));
  const total = widths.reduce((a, b) => a + b, 0);
  let cx = -total / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      {parts.map((p, i) => {
        const w = widths[i];
        const mid = cx + w / 2;
        cx += w;
        if (!p.slot)
          return (
            <Txt key={i} x={mid} y={size * 0.35} size={size} weight={800}>
              {p.text}
            </Txt>
          );
        const k = clamp01(p.k ?? 0);
        return (
          <g key={i}>
            <rect x={mid - w / 2 + 4} y={-size * 0.8} width={w - 8} height={size * 1.6} rx={14} fill={k > 0.5 ? "#d9f5e5" : "#fff3d6"} stroke={OL} strokeWidth={3} strokeDasharray={k > 0.5 ? undefined : "10 8"} />
            <Txt x={mid} y={size * 0.33} size={size * 0.82} weight={900} color={k > 0.5 ? C.greenDeep : C.inkSoft}>
              {k > 0.5 && p.fill ? p.fill : p.text}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// простые иконки (без эмодзи — шрифты эмодзи в CI не гарантированы)
export type IconName = "moon" | "broom" | "book" | "dumbbell" | "snow" | "star" | "coffee" | "shoe" | "mat" | "page" | "pen" | "water" | "bulb" | "eye" | "heart" | "clock" | "pin";
export const Icon: React.FC<{ name: IconName; x: number; y: number; s?: number; color?: string }> = ({ name, x, y, s = 1, color }) => {
  const st = { stroke: OL, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  let el: React.ReactNode = null;
  switch (name) {
    case "moon":
      el = <path d="M 14 -34 A 36 36 0 1 0 30 20 A 28 28 0 1 1 14 -34 Z" fill={color ?? C.yellow} {...st} />;
      break;
    case "broom":
      el = (
        <g>
          <path d="M 26 -40 L -4 10" {...st} strokeWidth={8} />
          <path d="M -24 4 L 14 22 L 0 44 Q -30 44 -40 30 Z" fill={color ?? C.yellowDeep} {...st} />
        </g>
      );
      break;
    case "book":
      el = (
        <g>
          <path d="M -40 -26 Q -20 -36 0 -26 Q 20 -36 40 -26 L 40 30 Q 20 20 0 30 Q -20 20 -40 30 Z" fill={color ?? C.sky} {...st} />
          <path d="M 0 -26 L 0 30" {...st} />
        </g>
      );
      break;
    case "dumbbell":
      el = (
        <g>
          <rect x={-30} y={-5} width={60} height={10} fill="#4a5874" {...st} />
          <rect x={-46} y={-24} width={16} height={48} rx={4} fill={color ?? C.coral} {...st} />
          <rect x={30} y={-24} width={16} height={48} rx={4} fill={color ?? C.coral} {...st} />
        </g>
      );
      break;
    case "snow":
      el = (
        <g stroke="#fff" strokeWidth={5} strokeLinecap="round">
          {[0, 60, 120].map((r) => (
            <line key={r} x1={0} y1={-22} x2={0} y2={22} transform={`rotate(${r})`} />
          ))}
        </g>
      );
      break;
    case "star":
      el = <path d="M 0 -36 L 10 -12 L 36 -10 L 16 8 L 22 34 L 0 20 L -22 34 L -16 8 L -36 -10 L -10 -12 Z" fill={color ?? C.yellow} {...st} />;
      break;
    case "coffee":
      el = (
        <g>
          <path d="M -30 -20 L 26 -20 L 20 30 L -24 30 Z" fill={color ?? "#fff"} {...st} />
          <path d="M 24 -10 Q 44 -8 40 8 Q 36 18 22 16" fill="none" {...st} />
          <path d="M -10 -30 Q -16 -40 -8 -48 M 6 -30 Q 0 -40 8 -48" fill="none" stroke={C.inkSoft} strokeWidth={4} strokeLinecap="round" />
        </g>
      );
      break;
    case "shoe":
      el = <path d="M -40 10 L -36 -24 L -10 -24 Q 0 -6 20 -4 Q 40 0 42 18 L -40 18 Z" fill={color ?? C.coral} {...st} />;
      break;
    case "mat":
      el = (
        <g>
          <rect x={-42} y={-10} width={70} height={30} rx={6} fill={color ?? C.violet} {...st} />
          <circle cx={34} cy={5} r={15} fill={color ?? C.violet} {...st} />
        </g>
      );
      break;
    case "page":
      el = (
        <g>
          <path d="M -26 -36 L 14 -36 L 28 -22 L 28 36 L -26 36 Z" fill={color ?? "#fff"} {...st} />
          <path d="M -14 -14 L 16 -14 M -14 2 L 16 2 M -14 18 L 6 18" stroke={C.grey} strokeWidth={4} strokeLinecap="round" />
        </g>
      );
      break;
    case "pen":
      el = <path d="M -30 30 L -24 10 L 20 -34 L 34 -20 L -10 24 Z" fill={color ?? C.yellow} {...st} />;
      break;
    case "water":
      el = <path d="M 0 -38 Q 30 0 26 14 Q 22 36 0 36 Q -22 36 -26 14 Q -30 0 0 -38 Z" fill={color ?? "#7fd1f5"} {...st} />;
      break;
    case "bulb":
      el = (
        <g>
          <path d="M -24 -6 A 26 26 0 1 1 24 -6 Q 20 8 12 16 L 12 26 L -12 26 L -12 16 Q -20 8 -24 -6 Z" fill={color ?? C.yellow} {...st} />
          <rect x={-10} y={28} width={20} height={8} rx={3} fill={C.inkSoft} />
        </g>
      );
      break;
    case "eye":
      el = (
        <g>
          <path d="M -40 0 Q 0 -34 40 0 Q 0 34 -40 0 Z" fill="#fff" {...st} />
          <circle r={13} fill={color ?? C.skyDeep} stroke={OL} strokeWidth={3} />
        </g>
      );
      break;
    case "heart":
      el = <path d="M 0 26 C -46 -6 -34 -40 -12 -40 C -4 -40 0 -32 0 -28 C 0 -32 4 -40 12 -40 C 34 -40 46 -6 0 26 Z" fill={color ?? C.coral} {...st} />;
      break;
    case "clock":
      el = (
        <g>
          <circle r={34} fill={color ?? "#fff"} {...st} />
          <path d="M 0 0 L 0 -20 M 0 0 L 14 8" {...st} />
        </g>
      );
      break;
    case "pin":
      el = (
        <g>
          <path d="M 0 40 Q -32 0 -32 -12 A 32 32 0 1 1 32 -12 Q 32 0 0 40 Z" fill={color ?? C.red} {...st} />
          <circle cx={0} cy={-12} r={11} fill="#fff" stroke={OL} strokeWidth={3} />
        </g>
      );
      break;
  }
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{el}</g>;
};

// плитка с иконкой
export const IconTile: React.FC<{ name: IconName; x: number; y: number; s?: number; k?: number; fill?: string; label?: string }> = ({ name, x, y, s = 1, k = 1, fill = "#fff", label }) => {
  if (k <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * k})`}>
      <rect x={-64} y={-64} width={128} height={128} rx={28} fill={fill} stroke={OL} strokeWidth={4} />
      <Icon name={name} x={0} y={0} s={1.25} />
      {label && (
        <text x={0} y={104} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.ink}>
          {label}
        </text>
      )}
    </g>
  );
};
