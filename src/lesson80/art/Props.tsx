// Реквизит 80-1-14: личные стаканы, кувшин, струя воды, пенал.
// Вода в прозрачной посуде всегда горизонтальна относительно силы тяжести:
// посуда поворачивается, а поверхность воды — нет.
import React from "react";

export const CUP = { h: 44, top: 32, bottom: 25 } as const;

// (x, y) — центр дна стакана; tilt — поворот вокруг центра дна (градусы).
export const Cup: React.FC<{
  x: number;
  y: number;
  level: number; // 0 … 1
  tilt?: number;
  mark: string;
  uid: string;
  scale?: number;
  shadow?: boolean;
}> = ({ x, y, level, tilt = 0, mark, uid, scale = 1, shadow = true }) => {
  const { h, top, bottom } = CUP;
  const body = `M ${-bottom / 2} 0 L ${-top / 2} ${-h} L ${top / 2} ${-h} L ${bottom / 2} 0 Z`;
  const inner = `M ${-bottom / 2 + 2.5} -3 L ${-top / 2 + 2.5} ${-h + 1} L ${top / 2 - 2.5} ${-h + 1} L ${bottom / 2 - 2.5} -3 Z`;
  const lv = Math.max(0, Math.min(1, level));
  // уровень в «вертикальном» стакане: высота воды над дном
  const wh = (h - 5) * lv;
  const th = (tilt * Math.PI) / 180;
  // при наклоне поверхность горизонтальна; площадь сохраняется приближённо:
  // центр поверхности остаётся на оси стакана на высоте wh
  const cx = -Math.sin(th) * (3 + wh) * 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {shadow ? <ellipse cx={3} cy={1} rx={bottom * 0.75} ry={4} fill="rgba(60,40,25,0.22)" /> : null}
      <g transform={`rotate(${tilt})`}>
        <clipPath id={`cupin-${uid}`}>
          <path d={inner} />
        </clipPath>
        <path d={body} fill="rgba(222,238,245,0.55)" stroke="rgba(120,150,165,0.9)" strokeWidth={1.4} strokeLinejoin="round" />
        {lv > 0.005 ? (
          <g clipPath={`url(#cupin-${uid})`}>
            {/* поверхность горизонтальна: прямоугольник воды повёрнут обратно */}
            <g transform={`translate(${cx} ${-3 - wh}) rotate(${-tilt})`}>
              <rect x={-60} y={0} width={120} height={120} fill="rgba(120,190,230,0.62)" />
              <rect x={-60} y={0} width={120} height={2.2} fill="rgba(235,248,255,0.95)" />
            </g>
          </g>
        ) : null}
        {/* дно и блик */}
        <ellipse cx={0} cy={-2} rx={bottom / 2 - 1} ry={2.6} fill="rgba(160,190,205,0.55)" />
        <path d={`M ${-top / 2 + 5} ${-h + 5} L ${-bottom / 2 + 5} -7`} stroke="rgba(255,255,255,0.9)" strokeWidth={2.6} strokeLinecap="round" />
        <ellipse cx={0} cy={-h} rx={top / 2} ry={3.2} fill="rgba(240,248,252,0.6)" stroke="rgba(120,150,165,0.9)" strokeWidth={1.2} />
        {/* личная цветная отметка — силиконовое колечко у дна */}
        <path d={`M ${-bottom / 2 - 0.6} -6 L ${bottom / 2 + 0.6} -6 L ${bottom / 2 + 1.2} -11 L ${-bottom / 2 - 1.2} -11 Z`} fill={mark} opacity={0.95} />
      </g>
    </g>
  );
};

// Стеклянный кувшин: носик слева, ручка справа. (x, y) — центр дна;
// tilt < 0 — наклон носиком влево (к стакану).
export const JUG = { h: 96, w: 58 } as const;
export const jugSpout = (x: number, y: number, tilt: number) => {
  // носик в локальных координатах (−JUG.w/2 − 9, −JUG.h + 4), поворот вокруг дна
  const lx = -JUG.w / 2 - 9;
  const ly = -JUG.h + 4;
  const t = (tilt * Math.PI) / 180;
  return { x: x + lx * Math.cos(t) - ly * Math.sin(t), y: y + lx * Math.sin(t) + ly * Math.cos(t) };
};

export const Jug: React.FC<{ x: number; y: number; tilt?: number; level: number; uid: string; shadow?: boolean }> = ({ x, y, tilt = 0, level, uid, shadow = true }) => {
  const { h, w } = JUG;
  const outline = `M ${-w / 2 + 6} 0 C ${-w / 2 - 4} ${-h * 0.35} ${-w / 2 - 2} ${-h * 0.7} ${-w / 2 + 4} ${-h * 0.86}
    L ${-w / 2 - 9} ${-h + 4} L ${-w / 2 + 8} ${-h} L ${w / 2 - 4} ${-h}
    C ${w / 2 - 2} ${-h * 0.75} ${w / 2 + 4} ${-h * 0.35} ${w / 2 - 6} 0 Z`;
  const wh = (h - 18) * Math.max(0, Math.min(1, level));
  return (
    <g transform={`translate(${x} ${y})`}>
      {shadow ? <ellipse cx={5} cy={2} rx={w * 0.55} ry={6} fill="rgba(60,40,25,0.22)" /> : null}
      <g transform={`rotate(${tilt})`}>
        <clipPath id={`jugin-${uid}`}>
          <path d={outline} transform="translate(0 -2) scale(0.92 0.97)" />
        </clipPath>
        <path d={`M ${w / 2 - 6} ${-h * 0.82} C ${w / 2 + 30} ${-h * 0.8} ${w / 2 + 30} ${-h * 0.25} ${w / 2 - 4} ${-h * 0.25}`} stroke="rgba(140,170,185,0.95)" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d={outline} fill="rgba(222,238,245,0.5)" stroke="rgba(120,150,165,0.95)" strokeWidth={1.8} strokeLinejoin="round" />
        {wh > 0.5 ? (
          <g clipPath={`url(#jugin-${uid})`}>
            <g transform={`translate(0 ${-4 - wh}) rotate(${-tilt})`}>
              <rect x={-200} y={0} width={400} height={300} fill="rgba(120,190,230,0.6)" />
              <rect x={-200} y={0} width={400} height={2.6} fill="rgba(235,248,255,0.95)" />
            </g>
          </g>
        ) : null}
        <path d={`M ${-w / 2 + 9} ${-h * 0.8} C ${-w / 2 + 3} ${-h * 0.55} ${-w / 2 + 4} ${-h * 0.3} ${-w / 2 + 11} ${-h * 0.12}`} stroke="rgba(255,255,255,0.9)" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <ellipse cx={-2} cy={-2} rx={w / 2 - 7} ry={3.5} fill="rgba(160,190,205,0.5)" />
      </g>
    </g>
  );
};

// Струя от носика до горлышка стакана; amount 0…1 — толщина.
export const Stream: React.FC<{ x1: number; y1: number; x2: number; y2: number; amount: number; frame: number }> = ({ x1, y1, x2, y2, amount, frame }) => {
  if (amount <= 0.02) return null;
  const midX = x1 + (x2 - x1) * 0.25;
  const wob = Math.sin(frame * 0.9) * 0.6;
  const d = `M ${x1} ${y1} Q ${midX + wob} ${y1 + (y2 - y1) * 0.15} ${x2 + wob * 0.5} ${y2}`;
  return (
    <g>
      <path d={d} stroke="rgba(120,190,230,0.75)" strokeWidth={4.2 * amount + 0.8} fill="none" strokeLinecap="round" />
      <path d={d} stroke="rgba(240,250,255,0.9)" strokeWidth={1.2 * amount} fill="none" strokeLinecap="round" transform="translate(-1 0)" />
    </g>
  );
};

// Цветные карандаши Билала (порядок — места в открытом пенале).
export const PENCILS = [
  { id: "blue", color: "#3A78C2" },
  { id: "red", color: "#D2463F" },
  { id: "orange", color: "#E58A2E" },
  { id: "green", color: "#3E9A55" },
  { id: "brown", color: "#8A5A3B" },
] as const;
export type PencilId = (typeof PENCILS)[number]["id"];

// Открытый пенал на столе: карандаш, который в руке у Билала, в пенале не лежит.
export const PencilCase: React.FC<{ x: number; y: number; held: PencilId | null; sx?: number; sy?: number }> = ({ x, y, held, sx = 1, sy = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
    <rect x={-58} y={-34} width={116} height={68} rx={10} fill="#2F6C7A" />
    <rect x={-52} y={-28} width={104} height={56} rx={7} fill="#E6DCC8" />
    {PENCILS.map((p, i) =>
      p.id === held ? null : (
        <g key={p.id} transform={`translate(0 ${-20 + i * 10})`}>
          <rect x={-44} y={-3} width={80} height={6} rx={2} fill={p.color} />
          <path d="M 36 -3 L 46 0 L 36 3 Z" fill="#E9C896" />
          <circle cx={45.5} cy={0} r={1.4} fill={p.color} />
        </g>
      ),
    )}
  </g>
);
