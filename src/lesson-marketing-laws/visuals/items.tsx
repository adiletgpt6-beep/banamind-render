// Рисованные предметы фильма BM-011 (SVG): пекарня «Рассвет», хлеб, часы,
// голова-«память», лестница, лошадка, компьютеры разных эпох, телефон,
// бутылка, батарейка, газета, палатка, шкаф, воздушный шар эго, волна,
// кукла, бак с топливом, курьер на велосипеде. Логотипы реальных компаний
// не рисуются — только подписи текстом.
import React from "react";
import { C, FONT, Z } from "../theme";
import { OL } from "./draw";

type P = { x: number; y: number; s?: number };

// пекарня «Рассвет» (вымышленная) — домик с солнцем на вывеске
export const Bakery: React.FC<P & { t?: number; sign?: string; glow?: number; color?: string; awning?: string }> = ({ x, y, s = 1, t = 0, sign = "Рассвет", glow = 0, color = "#fff4dc", awning = Z.orange }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <circle cx={0} cy={-150} r={230} fill={C.yellow} opacity={0.32 * glow} />}
    <rect x={-150} y={-230} width={300} height={230} rx={10} fill={color} stroke={OL} strokeWidth={5} />
    <path d="M -170 -230 L 170 -230 L 156 -280 L -156 -280 Z" fill={awning} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    {[-120, -60, 0, 60, 120].map((sx, i) => (
      <path key={i} d={`M ${sx - 30} -230 q 30 36 60 0`} fill={i % 2 ? "#fff" : awning} stroke={OL} strokeWidth={4} />
    ))}
    <rect x={-120} y={-330} width={240} height={56} rx={14} fill={C.ink} stroke={OL} strokeWidth={4} />
    <circle cx={-86} cy={-302} r={16 + Math.sin(t * 2) * 2} fill={C.yellow} />
    <text x={14} y={-290} fontFamily={FONT} fontWeight={900} fontSize={34} textAnchor="middle" fill={C.yellow}>
      {sign}
    </text>
    <rect x={-120} y={-170} width={130} height={100} rx={8} fill={Z.tealSoft} stroke={OL} strokeWidth={4} />
    {[0, 1, 2].map((i) => (
      <Loaf key={i} x={-90 + i * 36} y={-92} s={0.32} />
    ))}
    <rect x={40} y={-170} width={80} height={170} rx={8} fill="#c98b4a" stroke={OL} strokeWidth={4} />
    <circle cx={104} cy={-84} r={7} fill={C.yellow} stroke={OL} strokeWidth={3} />
    {[0, 1].map((i) => {
      const k = (t * 0.6 + i * 0.5) % 1;
      return <path key={i} d={`M ${-150 + 20} ${-330 - k * 70} q 12 -16 0 -32`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.7 * (1 - k)} transform="translate(-10 0)" />;
    })}
  </g>
);

export const Loaf: React.FC<P & { color?: string; steam?: number; t?: number }> = ({ x, y, s = 1, color = "#e2a35a", steam = 0, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {steam > 0 &&
      [-40, 0, 40].map((sx, i) => {
        const k = (t * 0.8 + i * 0.33) % 1;
        return <path key={i} d={`M ${sx} ${-70 - k * 60} q 14 -18 0 -36 q -14 -18 0 -36`} stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" opacity={steam * (1 - k)} />;
      })}
    <path d="M -90 0 Q -100 -70 0 -76 Q 100 -70 90 0 Z" fill={color} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    {[-40, 0, 40].map((sx) => (
      <path key={sx} d={`M ${sx - 16} -30 L ${sx + 16} -54`} stroke="#a8692e" strokeWidth={7} strokeLinecap="round" />
    ))}
  </g>
);

export const Clock: React.FC<P & { h?: number; m?: number; color?: string }> = ({ x, y, s = 1, h = 7, m = 0, color = "#fff" }) => {
  const ha = ((h % 12) / 12) * 360 + (m / 60) * 30;
  const ma = (m / 60) * 360;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={80} fill={color} stroke={OL} strokeWidth={6} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={0} y1={-66} x2={0} y2={-58} stroke={OL} strokeWidth={5} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={0} x2={0} y2={-40} stroke={OL} strokeWidth={9} strokeLinecap="round" transform={`rotate(${ha})`} />
      <line x1={0} y1={0} x2={0} y2={-60} stroke={C.coral} strokeWidth={6} strokeLinecap="round" transform={`rotate(${ma})`} />
      <circle r={8} fill={OL} />
    </g>
  );
};

// голова в профиль — «сознание покупателя»; внутри можно рисовать содержимое
export const Head: React.FC<P & { color?: string; children?: React.ReactNode; flip?: boolean }> = ({ x, y, s = 1, color = "#ffe1c4", children, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M -150 140 L -150 60 Q -190 -40 -150 -120 Q -90 -220 30 -200 Q 150 -180 160 -60 Q 166 -20 190 20 Q 196 34 172 40 L 168 80 Q 166 110 130 110 L 90 112 L 90 140 Z" fill={color} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <g transform={flip ? "scale(-1 1)" : undefined}>{children}</g>
  </g>
);

export const LadderShape: React.FC<P & { steps?: number; h?: number; w?: number }> = ({ x, y, s = 1, steps = 5, h = 600, w = 260 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-w / 2 - 14} y={-h} width={20} height={h + 20} rx={8} fill="#c98b4a" stroke={OL} strokeWidth={5} />
    <rect x={w / 2 - 6} y={-h} width={20} height={h + 20} rx={8} fill="#c98b4a" stroke={OL} strokeWidth={5} />
    {Array.from({ length: steps }).map((_, i) => (
      <rect key={i} x={-w / 2} y={-h + 40 + (i * (h - 60)) / Math.max(1, steps - 1) - 9} width={w} height={18} rx={6} fill="#e0a868" stroke={OL} strokeWidth={4} />
    ))}
  </g>
);

export const Horse: React.FC<P & { color?: string; t?: number; num?: string }> = ({ x, y, s = 1, color = "#c98b4a", t = 0, num }) => {
  const g = Math.sin(t * 9);
  return (
    <g transform={`translate(${x} ${y - Math.abs(g) * 10}) scale(${s})`}>
      <rect x={-40} y={-30} width={14} height={60} rx={6} fill={color} stroke={OL} strokeWidth={4} transform={`rotate(${g * 22} -33 -30)`} />
      <rect x={30} y={-30} width={14} height={60} rx={6} fill={color} stroke={OL} strokeWidth={4} transform={`rotate(${-g * 22} 37 -30)`} />
      <ellipse cx={0} cy={-50} rx={78} ry={40} fill={color} stroke={OL} strokeWidth={5} />
      <path d="M 50 -70 L 90 -130 Q 110 -140 120 -120 L 96 -66 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 66 -110 Q 70 -140 92 -136" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
      <circle cx={106} cy={-120} r={4} fill={OL} />
      <path d={`M -76 -56 Q -110 ${-40 + g * 10} -100 -10`} stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
      {num && (
        <g>
          <rect x={-30} y={-72} width={60} height={42} rx={8} fill="#fff" stroke={OL} strokeWidth={3} />
          <text x={0} y={-41} fontFamily={FONT} fontWeight={900} fontSize={30} textAnchor="middle" fill={C.ink}>
            {num}
          </text>
        </g>
      )}
    </g>
  );
};

// компьютеры: шкаф-мейнфрейм, мини, персональный
export const Mainframe: React.FC<P & { t?: number; color?: string }> = ({ x, y, s = 1, t = 0, color = Z.greySoft }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-90} y={-260} width={180} height={260} rx={10} fill={color} stroke={OL} strokeWidth={5} />
    {[0, 1].map((i) => (
      <g key={i}>
        <circle cx={-40 + i * 80} cy={-190} r={30} fill="#fff" stroke={OL} strokeWidth={4} />
        <line x1={-40 + i * 80} y1={-190} x2={-40 + i * 80 + Math.cos(t * 3 + i) * 24} y2={-190 + Math.sin(t * 3 + i) * 24} stroke={OL} strokeWidth={4} />
      </g>
    ))}
    {Array.from({ length: 6 }).map((_, i) => (
      <circle key={i} cx={-60 + i * 24} cy={-110} r={7} fill={(Math.floor(t * 4) + i) % 3 === 0 ? C.coral : Z.teal} />
    ))}
    <rect x={-70} y={-80} width={140} height={14} rx={6} fill={Z.grey} />
    <rect x={-70} y={-50} width={140} height={14} rx={6} fill={Z.grey} />
  </g>
);

export const MiniPC: React.FC<P & { t?: number; color?: string }> = ({ x, y, s = 1, t = 0, color = "#fff" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-120} width={160} height={120} rx={10} fill={color} stroke={OL} strokeWidth={5} />
    <rect x={-60} y={-100} width={70} height={46} rx={6} fill={Z.tealSoft} stroke={OL} strokeWidth={3} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={34 + (i % 2) * 22} cy={-92 + i * 18} r={6} fill={(Math.floor(t * 3) + i) % 2 ? C.green : Z.grey} />
    ))}
    <rect x={-60} y={-36} width={120} height={12} rx={6} fill={Z.grey} />
  </g>
);

export const Computer: React.FC<P & { t?: number; screen?: string; label?: string }> = ({ x, y, s = 1, t = 0, screen = "#dff3ff", label }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-40} y={-30} width={80} height={30} rx={6} fill={Z.greySoft} stroke={OL} strokeWidth={4} />
    <rect x={-110} y={-200} width={220} height={170} rx={14} fill="#f4efe2" stroke={OL} strokeWidth={5} />
    <rect x={-92} y={-184} width={184} height={124} rx={8} fill={screen} stroke={OL} strokeWidth={3} />
    <rect x={-74} y={-164} width={14} height={20} fill={C.green} opacity={Math.sin(t * 6) > 0 ? 1 : 0.2} />
    {label && (
      <text x={0} y={-110} fontFamily={FONT} fontWeight={900} fontSize={label.length > 8 ? 24 : 32} textAnchor="middle" fill={C.ink}>
        {label}
      </text>
    )}
  </g>
);

export const Phone: React.FC<P & { t?: number; ring?: number }> = ({ x, y, s = 1, t = 0, ring = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${ring * Math.sin(t * 30) * 6})`}>
    <path d="M -70 0 L 70 0 L 56 -60 L -56 -60 Z" fill={C.coral} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -80 -70 Q -80 -100 -50 -100 L 50 -100 Q 80 -100 80 -70 L 60 -66 Q 40 -86 0 -86 Q -40 -86 -60 -66 Z" fill={C.coral} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <circle cy={-30} r={16} fill="#fff" stroke={OL} strokeWidth={4} />
    {ring > 0 && [0, 1].map((i) => <path key={i} d={`M ${-96 - i * 18} -110 q -10 20 0 40 M ${96 + i * 18} -110 q 10 20 0 40`} stroke={C.coral} strokeWidth={5} fill="none" opacity={ring} />)}
  </g>
);

export const Bottle: React.FC<P & { color?: string; label?: string; cap?: string }> = ({ x, y, s = 1, color = "#c4462f", label, cap = C.coral }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -22 -230 L 22 -230 L 22 -190 Q 56 -160 56 -110 L 56 -10 Q 56 0 46 0 L -46 0 Q -56 0 -56 -10 L -56 -110 Q -56 -160 -22 -190 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-26} y={-250} width={52} height={24} rx={6} fill={cap} stroke={OL} strokeWidth={4} />
    <rect x={-56} y={-120} width={112} height={60} fill="#fff" stroke={OL} strokeWidth={4} />
    {label && (
      <text x={0} y={-80} fontFamily={FONT} fontWeight={900} fontSize={label.length > 5 ? 20 : 26} textAnchor="middle" fill={C.ink}>
        {label}
      </text>
    )}
  </g>
);

export const Battery: React.FC<P & { level?: number; color?: string; label?: string }> = ({ x, y, s = 1, level = 1, color = "#3a3a3a", label }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-20} y={-232} width={40} height={20} rx={6} fill={Z.grey} stroke={OL} strokeWidth={4} />
    <rect x={-60} y={-214} width={120} height={214} rx={16} fill={color} stroke={OL} strokeWidth={5} />
    <rect x={-44} y={-196 + 178 * (1 - level)} width={88} height={178 * level} rx={10} fill={level > 0.3 ? C.green : C.red} />
    {label && (
      <text x={0} y={-100} fontFamily={FONT} fontWeight={900} fontSize={26} textAnchor="middle" fill="#fff">
        {label}
      </text>
    )}
  </g>
);

export const Newspaper: React.FC<P & { head?: string; rot?: number; small?: string }> = ({ x, y, s = 1, head = "", rot = 0, small }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-170} y={-120} width={340} height={240} rx={6} fill="#fbf8f0" stroke={OL} strokeWidth={5} />
    <text x={0} y={-62} fontFamily={FONT} fontWeight={900} fontSize={head.length > 9 ? 28 : 38} textAnchor="middle" fill={C.ink}>
      {head}
    </text>
    <line x1={-150} x2={150} y1={-44} y2={-44} stroke={OL} strokeWidth={3} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={-150} y={-28 + i * 26} width={i === 4 ? 160 : 300} height={10} rx={5} fill={Z.greySoft} />
    ))}
    {small && (
      <g>
        <rect x={40} y={60} width={110} height={50} fill={C.yellow} stroke={OL} strokeWidth={3} />
        <text x={95} y={92} fontFamily={FONT} fontWeight={900} fontSize={18} textAnchor="middle" fill={C.ink}>
          {small}
        </text>
      </g>
    )}
  </g>
);

export const Tent: React.FC<P & { w?: number; color?: string }> = ({ x, y, s = 1, w = 1, color = Z.purple }) => (
  <g transform={`translate(${x} ${y}) scale(${s * w} ${s})`}>
    <path d="M -200 0 L 0 -260 L 200 0 Z" fill={color} stroke={OL} strokeWidth={5 / w} strokeLinejoin="round" />
    <path d="M -50 0 L 0 -150 L 50 0 Z" fill="#3b2a6a" stroke={OL} strokeWidth={4 / w} strokeLinejoin="round" />
    <line x1={0} y1={-260} x2={0} y2={-300} stroke={OL} strokeWidth={6 / w} />
    <path d="M 0 -300 L 40 -288 L 0 -276 Z" fill={C.coral} stroke={OL} strokeWidth={3 / w} />
  </g>
);

export const Balloon: React.FC<P & { r?: number; color?: string; label?: string; pop?: number; t?: number }> = ({ x, y, s = 1, r = 120, color = C.coral, label, pop = 0, t = 0 }) => {
  if (pop >= 1) {
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <path key={i} d={`M ${Math.cos(a) * 30} ${-r + Math.sin(a) * 30} L ${Math.cos(a) * 90} ${-r + Math.sin(a) * 90}`} stroke={color} strokeWidth={14} strokeLinecap="round" />;
        })}
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y + Math.sin(t * 1.6) * 8}) scale(${s})`}>
      <path d={`M 0 0 Q 20 40 -10 90`} stroke={OL} strokeWidth={4} fill="none" />
      <ellipse cx={0} cy={-r} rx={r * 0.86} ry={r} fill={color} stroke={OL} strokeWidth={5} />
      <path d="M -10 0 L 10 0 L 0 -14 Z" fill={color} stroke={OL} strokeWidth={4} />
      <ellipse cx={-r * 0.35} cy={-r * 1.4} rx={r * 0.16} ry={r * 0.28} fill="#fff" opacity={0.5} />
      {label && (
        <text x={0} y={-r + 14} fontFamily={FONT} fontWeight={900} fontSize={Math.min(56, r * 0.42)} textAnchor="middle" fill="#fff">
          {label}
        </text>
      )}
    </g>
  );
};

export const Doll: React.FC<P & { t?: number; color?: string }> = ({ x, y, s = 1, t = 0, color = Z.pink }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t * 2) * 4})`}>
    <path d="M -50 0 L 50 0 L 34 -120 L -34 -120 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <circle cy={-160} r={46} fill="#ffe1c4" stroke={OL} strokeWidth={5} />
    <path d="M -50 -170 Q -40 -220 0 -214 Q 44 -220 52 -168 Q 30 -196 0 -192 Q -30 -196 -50 -170 Z" fill="#8a5a2b" stroke={OL} strokeWidth={4} />
    <circle cx={-16} cy={-160} r={5} fill={OL} />
    <circle cx={16} cy={-160} r={5} fill={OL} />
    <path d="M -12 -138 q 12 10 24 0" stroke={OL} strokeWidth={4} fill="none" />
  </g>
);

export const Bike: React.FC<P & { t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-70, 70].map((wx) => (
      <g key={wx} transform={`translate(${wx} -40) rotate(${t * 300})`}>
        <circle r={40} fill="none" stroke={OL} strokeWidth={7} />
        <line x1={-40} x2={40} stroke={OL} strokeWidth={3} />
        <line y1={-40} y2={40} stroke={OL} strokeWidth={3} />
      </g>
    ))}
    <path d="M -70 -40 L -10 -40 L 30 -100 L -40 -100 Z M 30 -100 L 70 -40" stroke={C.coral} strokeWidth={9} fill="none" strokeLinejoin="round" />
    <rect x={-120} y={-150} width={80} height={60} rx={8} fill={Z.orange} stroke={OL} strokeWidth={4} />
    <circle cx={-80} cy={-120} r={10} fill={C.yellow} />
    <circle cx={10} cy={-190} r={24} fill="#ffe1c4" stroke={OL} strokeWidth={4} />
    <path d="M 0 -166 L -20 -104 L 30 -100" stroke={Z.teal} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

// бак-«топливо» для закона ресурсов
export const FuelTank: React.FC<P & { level?: number }> = ({ x, y, s = 1, level = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-260} width={160} height={260} rx={24} fill="#fff" stroke={OL} strokeWidth={6} />
    <clipPath id="tankClip">
      <rect x={-74} y={-254} width={148} height={248} rx={20} />
    </clipPath>
    <rect x={-80} y={-260 + 260 * (1 - level)} width={160} height={260 * level} fill={C.yellow} clipPath="url(#tankClip)" />
    <rect x={-30} y={-290} width={60} height={34} rx={8} fill={Z.grey} stroke={OL} strokeWidth={5} />
    {[0.25, 0.5, 0.75].map((k) => (
      <line key={k} x1={50} x2={74} y1={-260 * k} y2={-260 * k} stroke={OL} strokeWidth={4} />
    ))}
  </g>
);
