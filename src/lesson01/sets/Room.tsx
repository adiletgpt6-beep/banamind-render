// Учебная комната при мечети (по референсу): светлые стены с арками,
// бирюзово-синие геометрические изразцы, книжный шкаф, светильники, синий
// ковёр с узором, доска, арочное окно с деревом и горами. Арабских надписей
// нет — только геометрический орнамент.
import React from "react";
import { BOARD, CABINET, FLOOR_Y, SHELF, WINDOW, WORLD } from "../layout";
import { OUTLINE } from "../rig/looks";
import { Landscape } from "./Landscape";

const f = (n: number) => n.toFixed(1);
const OL = 3;

// Звёздчатый геометрический орнамент изразцов (без надписей).
const TilePattern: React.FC<{ id: string; size: number }> = ({ id, size }) => (
  <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
    <rect width={size} height={size} fill="#3f78a8" />
    <path
      d={`M ${size / 2} ${size * 0.08} L ${size * 0.62} ${size * 0.38} L ${size * 0.92} ${size / 2} L ${size * 0.62} ${size * 0.62} L ${size / 2} ${size * 0.92} L ${size * 0.38} ${size * 0.62} L ${size * 0.08} ${size / 2} L ${size * 0.38} ${size * 0.38} Z`}
      fill="#e9f0f4"
    />
    <circle cx={size / 2} cy={size / 2} r={size * 0.1} fill="#d9a441" />
    <path d={`M 0 0 L ${size * 0.18} 0 L 0 ${size * 0.18} Z M ${size} 0 L ${size * 0.82} 0 L ${size} ${size * 0.18} Z M 0 ${size} L ${size * 0.18} ${size} L 0 ${size * 0.82} Z M ${size} ${size} L ${size * 0.82} ${size} L ${size} ${size * 0.82} Z`} fill="#8fc0dd" />
  </pattern>
);

const CarpetPattern: React.FC<{ id: string }> = ({ id }) => (
  <pattern id={id} width={160} height={90} patternUnits="userSpaceOnUse">
    <rect width={160} height={90} fill="#3e74a3" />
    <path d="M 0 45 L 20 30 L 40 45 L 20 60 Z M 80 45 L 100 30 L 120 45 L 100 60 Z" fill="#4c84b3" />
    <path d="M 40 45 L 60 35 L 80 45 L 60 55 Z M 120 45 L 140 35 L 160 45 L 140 55 Z" fill="#5a91be" opacity={0.6} />
    <circle cx={20} cy={45} r={4} fill="#e1c88f" opacity={0.7} />
    <circle cx={100} cy={45} r={4} fill="#e1c88f" opacity={0.7} />
  </pattern>
);

const Books: React.FC<{ x: number; y: number; w: number; h: number; seed: number }> = ({ x, y, w, h, seed }) => {
  const colors = ["#2f5d4a", "#8b3a3a", "#2c4a7a", "#b07a3a", "#3f6e5a", "#6d3b52", "#c9a35c", "#4a5a7a"];
  const out: React.ReactNode[] = [];
  let cx = x + 6;
  let i = 0;
  while (cx < x + w - 24) {
    const bw = 20 + ((seed * 7 + i * 13) % 14);
    const bh = h * (0.72 + (((seed + i * 5) % 7) / 7) * 0.25);
    const c = colors[(seed + i * 3) % colors.length];
    out.push(
      <g key={i}>
        <rect x={f(cx)} y={f(y + h - bh)} width={f(bw)} height={f(bh)} fill={c} stroke={OUTLINE} strokeWidth={2} rx={2} />
        <rect x={f(cx + 3)} y={f(y + h - bh + bh * 0.15)} width={f(bw - 6)} height={5} fill="#e7cf8f" opacity={0.75} />
        <rect x={f(cx + 3)} y={f(y + h - bh + bh * 0.75)} width={f(bw - 6)} height={4} fill="#e7cf8f" opacity={0.6} />
      </g>,
    );
    cx += bw + 2;
    i++;
    if (i % 9 === 4) cx += 26;
  }
  return <g>{out}</g>;
};

const Lantern: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${f(x)} ${f(y)})`}>
    <ellipse cx={0} cy={60} rx={70} ry={90} fill="#ffd98a" opacity={0.12} />
    <path d="M -8 0 L 8 0 L 8 14 L -8 14 Z" fill="#9b7a3d" stroke={OUTLINE} strokeWidth={2} />
    <path d="M -22 14 L 22 14 L 26 30 L 18 92 L -18 92 L -26 30 Z" fill="#f6d27a" stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round" />
    <path d="M -10 30 L 10 30 L 8 80 L -8 80 Z" fill="#fff1c4" />
    <path d="M -26 30 L 26 30 M -18 92 L 18 92" stroke="#9b7a3d" strokeWidth={5} />
    <path d="M -10 92 L 10 92 L 0 108 Z" fill="#9b7a3d" stroke={OUTLINE} strokeWidth={2} />
  </g>
);

// ground (ролик 80-1-4): трава пейзажа продолжается до подоконника — нижние
// стёкла не остаются пустыми. По умолчанию выключено (первые фильмы без изменений).
export const ArchedWindow: React.FC<{ t: number; x: number; y: number; w: number; h: number; id: string; ground?: boolean }> = ({ t, x, y, w, h, id, ground = false }) => {
  const r = w / 2;
  const d = `M ${f(x)} ${f(y + h)} L ${f(x)} ${f(y + r)} A ${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)} L ${f(x + w)} ${f(y + h)} Z`;
  return (
    <g>
      <clipPath id={id}>
        <path d={d} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        {/* пейзаж: тот же, что на отдельных планах */}
        <svg x={x} y={y} width={w} height={h} viewBox="380 260 1160 1060" preserveAspectRatio="xMidYMid slice">
          <Landscape t={t} />
          {ground ? <rect x={380} y={1076} width={1160} height={260} fill="#86b56b" /> : null}
        </svg>
        <rect x={x} y={y} width={w} height={h} fill="#ffffff" opacity={0.06} />
      </g>
      {/* рама и переплёт */}
      <path d={d} fill="none" stroke="#c9a676" strokeWidth={26} />
      <path d={d} fill="none" stroke={OUTLINE} strokeWidth={OL} />
      <line x1={f(x + w / 2)} y1={f(y + 20)} x2={f(x + w / 2)} y2={f(y + h)} stroke="#c9a676" strokeWidth={14} />
      <line x1={f(x)} y1={f(y + h * 0.56)} x2={f(x + w)} y2={f(y + h * 0.56)} stroke="#c9a676" strokeWidth={14} />
      {/* подоконник */}
      <rect x={f(x - 40)} y={f(y + h)} width={f(w + 80)} height={34} fill="#e2c799" stroke={OUTLINE} strokeWidth={OL} rx={6} />
      <rect x={f(x - 40)} y={f(y + h + 34)} width={f(w + 80)} height={12} fill="#c4a77a" />
    </g>
  );
};

// Задний план комнаты: стена, ковёр, шкаф, окно, тумба, светильники.
// Доска и предметы рисуются отдельными слоями (Board.tsx, Props.tsx).
export const RoomBack: React.FC<{ t: number; windowGround?: boolean }> = ({ t, windowGround = false }) => {
  const W = WORLD.w;
  const H = WORLD.h;
  return (
    <g>
      <defs>
        <TilePattern id="tiles" size={64} />
        <CarpetPattern id="carpet" />
        <linearGradient id="wall-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8f3ea" />
          <stop offset="1" stopColor="#efe5d4" />
        </linearGradient>
        <linearGradient id="floor-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d3550" stopOpacity={0.28} />
          <stop offset="0.25" stopColor="#1d3550" stopOpacity={0} />
          <stop offset="1" stopColor="#1d3550" stopOpacity={0.08} />
        </linearGradient>
        <radialGradient id="window-light" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4d6" stopOpacity={0.35} />
          <stop offset="1" stopColor="#fff4d6" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* стена */}
      <rect x={0} y={0} width={W} height={FLOOR_Y} fill="url(#wall-g)" />
      {/* арки-ниши на стене */}
      {[60, 3170].map((ax, i) => (
        <path
          key={i}
          d={`M ${ax} ${FLOOR_Y - 120} L ${ax} 330 A 110 110 0 0 1 ${ax + 220} 330 L ${ax + 220} ${FLOOR_Y - 120}`}
          fill="#f1e6d3"
          stroke="#e2d3ba"
          strokeWidth={10}
          opacity={i === 1 ? 0 : 1}
        />
      ))}
      {/* пилястры с изразцами */}
      {[1560, 2200, 3170].map((px) => (
        <g key={px}>
          <rect x={px} y={60} width={56} height={FLOOR_Y - 60} fill="url(#tiles)" stroke={OUTLINE} strokeWidth={2} opacity={0.95} />
          <rect x={px - 8} y={50} width={72} height={16} fill="#e6d6b8" stroke={OUTLINE} strokeWidth={2} />
        </g>
      ))}
      {/* фриз с изразцами под потолком */}
      <rect x={0} y={0} width={W} height={48} fill="url(#tiles)" opacity={0.9} />
      <rect x={0} y={48} width={W} height={10} fill="#d9c49c" />
      {/* панель внизу стены */}
      <rect x={0} y={FLOOR_Y - 110} width={W} height={110} fill="#e6d8c0" />
      <rect x={0} y={FLOOR_Y - 116} width={W} height={10} fill="#d4bf98" />
      <rect x={0} y={FLOOR_Y - 26} width={W} height={26} fill="#b99a6c" />
      {/* светильники */}
      <Lantern x={2260} y={250} />
      <Lantern x={3420} y={300} />
      <Lantern x={150} y={420} />
      {/* ковёр */}
      <rect x={0} y={FLOOR_Y} width={W} height={H - FLOOR_Y} fill="url(#carpet)" />
      {/* бордюр ковра — линии вдоль рядов */}
      {[1300, 1540, 1820, 2120].map((y) => (
        <g key={y}>
          <rect x={0} y={y} width={W} height={14 + (y - FLOOR_Y) * 0.012} fill="#d8bf86" opacity={0.75} />
          <rect x={0} y={y + 18 + (y - FLOOR_Y) * 0.012} width={W} height={4} fill="#d8bf86" opacity={0.5} />
        </g>
      ))}
      <rect x={0} y={FLOOR_Y} width={W} height={H - FLOOR_Y} fill="url(#floor-shade)" />
      {/* мягкое пятно света от окна на ковре */}
      <ellipse cx={WINDOW.x + WINDOW.w * 0.3} cy={1500} rx={720} ry={260} fill="url(#window-light)" />
      {/* книжный шкаф */}
      <g>
        <rect x={SHELF.x} y={SHELF.y} width={SHELF.w} height={SHELF.h} fill="#a87a50" stroke={OUTLINE} strokeWidth={OL} rx={6} />
        <rect x={SHELF.x + 18} y={SHELF.y + 18} width={SHELF.w - 36} height={SHELF.h - 36} fill="#6e4a30" />
        {[0, 1, 2, 3].map((k) => {
          const sh = (SHELF.h - 36) / 4;
          const sy = SHELF.y + 18 + k * sh;
          return (
            <g key={k}>
              <Books x={SHELF.x + 18} y={sy + 10} w={SHELF.w - 36} h={sh - 26} seed={k * 3 + 1} />
              <rect x={SHELF.x + 12} y={sy + sh - 16} width={SHELF.w - 24} height={16} fill="#b8895c" stroke={OUTLINE} strokeWidth={2} />
            </g>
          );
        })}
      </g>
      {/* окно */}
      <ArchedWindow t={t} x={WINDOW.x} y={WINDOW.y} w={WINDOW.w} h={WINDOW.h} id="room-window" ground={windowGround} />
      {/* низкая тумба с книгами и растением */}
      <g>
        <rect x={CABINET.x} y={CABINET.y} width={CABINET.w} height={CABINET.h} fill="#b38658" stroke={OUTLINE} strokeWidth={OL} rx={6} />
        <rect x={CABINET.x + 20} y={CABINET.y + 26} width={CABINET.w - 40} height={CABINET.h - 50} fill="#6e4a30" />
        <Books x={CABINET.x + 20} y={CABINET.y + 40} w={CABINET.w - 40} h={CABINET.h - 70} seed={11} />
        <rect x={CABINET.x - 10} y={CABINET.y - 16} width={CABINET.w + 20} height={20} fill="#c99a68" stroke={OUTLINE} strokeWidth={2} />
        {/* подставка для книги (пустая, без надписей) */}
        <path d={`M ${CABINET.x + 90} ${CABINET.y - 16} L ${CABINET.x + 150} ${CABINET.y - 80} L ${CABINET.x + 210} ${CABINET.y - 16} M ${CABINET.x + 110} ${CABINET.y - 16} L ${CABINET.x + 190} ${CABINET.y - 70}`} stroke="#8a5b36" strokeWidth={10} fill="none" strokeLinecap="round" />
        {/* растение */}
        <g transform={`translate(${CABINET.x + 420} ${CABINET.y - 16})`}>
          <path d="M -36 0 L 36 0 L 28 -60 L -28 -60 Z" fill="#c8765a" stroke={OUTLINE} strokeWidth={2.5} />
          {[-50, -20, 10, 40, 65].map((a, i) => (
            <ellipse key={i} cx={Math.sin((a * Math.PI) / 180) * 50} cy={-90 - Math.cos((a * Math.PI) / 180) * 30} rx={16} ry={44} transform={`rotate(${a} ${Math.sin((a * Math.PI) / 180) * 50} ${-90 - Math.cos((a * Math.PI) / 180) * 30})`} fill={i % 2 ? "#5f9466" : "#4f8a5b"} stroke={OUTLINE} strokeWidth={2} />
          ))}
        </g>
      </g>
      {/* полка с подушками для сидения у стены слева */}
      <rect x={BOARD.x - 40} y={FLOOR_Y - 60} width={BOARD.w + 80} height={34} fill="#c99a68" stroke={OUTLINE} strokeWidth={2} rx={6} />
    </g>
  );
};
