// Доска ролика 80-1-2 — та же доска первого фильма (рамка, полочка, мел),
// на ней спокойные иллюстрации в стиле сада:
//   слева — «семечко → росток → (смена сезонов, «Проходят годы») → яблоня»;
//   справа — одна схема связей: яблоня, корни под землёй, вода у корней,
//   солнце и воздух у листьев, пчела у цветка. Стрелки и мягкие акценты
//   появляются только когда о них говорят (и никогда — во время пауз для
//   ответа зрителя).
import React from "react";
import { fontFamily } from "../../fonts";
import { BOARD } from "../../lesson01/layout";
import { OUTLINE } from "../../lesson01/rig/looks";
import { Board as Board1 } from "../../lesson01/sets/Board";
import { Bee } from "./nature";
import { AppleFlower, AppleTree, Roots, SoilSeed, Sprout } from "./tree";

const f = (n: number) => n.toFixed(1);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const INK = "#234467";

export type BoardState = {
  t: number;
  seed: number; // появление карточек 0…1
  sprout: number;
  years: number;
  tree: number;
  diagram: number;
  arrowWater: number; // стрелка «вода → корни»
  arrowLight: number; // стрелка «свет → листья»
  hi: { tree: number; water: number; sun: number; air: number }; // мягкие акценты
};

export const BOARD0: BoardState = { t: 0, seed: 0, sprout: 0, years: 0, tree: 0, diagram: 0, arrowWater: 0, arrowLight: 0, hi: { tree: 0, water: 0, sun: 0, air: 0 } };

// Координаты элементов на доске (мир комнаты) — для камеры и взглядов.
export const BOARD_PTS = {
  seed: { x: BOARD.x + 115, y: BOARD.y + 150 },
  sprout: { x: BOARD.x + 315, y: BOARD.y + 150 },
  years: { x: BOARD.x + 478, y: BOARD.y + 150 },
  tree: { x: BOARD.x + 660, y: BOARD.y + 150 },
  treeApple: { x: BOARD.x + 660 - 11, y: BOARD.y + 160 },
  diagram: { x: BOARD.x + 985, y: BOARD.y + 330 },
  diagramApple: { x: BOARD.x + 985 + 0.27 * 40 + 0, y: BOARD.y + 380 - 0.27 * 470 },
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; k: number; children: React.ReactNode }> = ({ x, y, w, h, k, children }) => {
  if (k <= 0.001) return null;
  const e = 1 - Math.pow(1 - clamp(k), 3);
  return (
    <g opacity={f(clamp(k * 1.6))} transform={`translate(${f(x)} ${f(y + (1 - e) * 20)})`}>
      <rect x={5} y={7} width={w} height={h} rx={10} fill="#000" opacity={0.08} />
      <rect x={0} y={0} width={w} height={h} rx={10} fill="#fffdf7" stroke={OUTLINE} strokeWidth={2.5} />
      <circle cx={w / 2} cy={13} r={8} fill="#c65c49" stroke={OUTLINE} strokeWidth={2} />
      {children}
    </g>
  );
};

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; color: string }> = ({ x1, y1, x2, y2, k, color }) => {
  if (k <= 0.001) return null;
  const e = clamp(k);
  const ex = x1 + (x2 - x1) * e;
  const ey = y1 + (y2 - y1) * e;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = (d: number, s: number) => ex - Math.cos(a + s) * d;
  const hy = (d: number, s: number) => ey - Math.sin(a + s) * d;
  return (
    <g>
      <path d={`M ${f(x1)} ${f(y1)} L ${f(ex)} ${f(ey)}`} stroke="#ffffff" strokeWidth={11} strokeLinecap="round" />
      <path d={`M ${f(x1)} ${f(y1)} L ${f(ex)} ${f(ey)}`} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <path d={`M ${f(hx(16, 0.5))} ${f(hy(16, 0.5))} L ${f(ex)} ${f(ey)} L ${f(hx(16, -0.5))} ${f(hy(16, -0.5))}`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

const Glow: React.FC<{ x: number; y: number; r: number; k: number }> = ({ x, y, r, k }) =>
  k > 0.001 ? <circle cx={f(x)} cy={f(y)} r={f(r * (0.92 + 0.08 * k))} fill="#ffe28a" opacity={0.55 * clamp(k)} /> : null;

// Маленькие значки сезонов (одно и то же дерево).
const SeasonIcon: React.FC<{ x: number; y: number; kind: "spring" | "summer" | "autumn" | "winter" }> = ({ x, y, kind }) => {
  const crown = kind === "summer" ? "#62a06b" : kind === "autumn" ? "#e0a63c" : kind === "spring" ? "#9fd08f" : null;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-2.5} y={-18} width={5} height={18} fill="#7a5238" />
      {crown ? <circle cx={0} cy={-26} r={14} fill={crown} stroke={OUTLINE} strokeWidth={1.6} /> : <path d="M 0 -18 L -9 -34 M 0 -22 L 9 -36 M 0 -18 L 0 -38" stroke="#7a5238" strokeWidth={2.4} strokeLinecap="round" />}
      {kind === "spring" ? [-6, 5, 0].map((dx, i) => <circle key={i} cx={dx} cy={-28 + i * 5} r={3} fill="#fbf2f4" stroke="#c9a3ab" strokeWidth={0.8} />) : null}
      {kind === "winter" ? <rect x={-16} y={-1} width={32} height={4} rx={2} fill="#ffffff" stroke="#c8d3da" strokeWidth={1} /> : null}
    </g>
  );
};

export const LessonBoard: React.FC<{ b: BoardState }> = ({ b }) => {
  const X = BOARD.x;
  const Y = BOARD.y;
  const { t } = b;
  // схема: координаты внутри карточки
  const DX = 785;
  const DY = 28;
  const DW = 390;
  const DH = 600;
  const ground = 380; // линия земли в карточке схемы
  const treeX = DW / 2 + 10;
  return (
    <g>
      <Board1 cards={{}} captions={{}} />
      <g transform={`translate(${X} ${Y})`}>
        {/* 1. семечко */}
        <Card x={30} y={40} w={170} h={220} k={b.seed}>
          <rect x={14} y={150} width={142} height={46} rx={6} fill="#9b6b43" opacity={0.9} />
          <path d="M 14 150 L 156 150" stroke="#6f9a52" strokeWidth={6} strokeLinecap="round" />
          <g transform="translate(85 112) scale(3.4)">
            <g transform={`translate(0 ${-40})`}>
              <SoilSeed />
            </g>
          </g>
        </Card>
        <Arrow x1={208} y1={150} x2={224} y2={150} k={b.sprout} color="#9aa3ad" />
        {/* 2. росток */}
        <Card x={230} y={40} w={170} h={220} k={b.sprout}>
          <rect x={14} y={150} width={142} height={46} rx={6} fill="#9b6b43" opacity={0.9} />
          <path d="M 14 150 L 156 150" stroke="#6f9a52" strokeWidth={6} strokeLinecap="round" />
          <g transform="translate(85 150) scale(1.15)">
            <Sprout g={1} t={t} />
          </g>
        </Card>
        {/* 3. смена сезонов — проходят годы */}
        {b.years > 0.001 ? (
          <g opacity={clamp(b.years * 1.5)}>
            <Arrow x1={406} y1={150} x2={548} y2={150} k={b.years} color="#9aa3ad" />
            <SeasonIcon x={438} y={118} kind="spring" />
            <SeasonIcon x={476} y={118} kind="summer" />
            <SeasonIcon x={514} y={118} kind="autumn" />
            <SeasonIcon x={476} y={214} kind="winter" />
            <text x={477} y={186} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={21} fill={INK}>
              Проходят годы
            </text>
          </g>
        ) : null}
        {/* 4. взрослая яблоня */}
        <Card x={555} y={30} w={210} h={250} k={b.tree}>
          <rect x={12} y={208} width={186} height={10} rx={5} fill="#86b56b" />
          <g transform="translate(105 212)">
            <AppleTree x={0} y={0} s={0.2} t={t} st={{ season: "summer", fruit: 1, fruitCount: 8 }} />
          </g>
        </Card>
        {/* 5. схема связей */}
        <Card x={DX} y={DY} w={DW} h={DH} k={b.diagram}>
          {/* небо и земля в разрезе */}
          <rect x={12} y={30} width={DW - 24} height={ground - 30} rx={6} fill="#e7f3fa" />
          <rect x={12} y={ground} width={DW - 24} height={DH - ground - 14} rx={6} fill="#a87b52" />
          <path d={`M 12 ${ground} L ${DW - 12} ${ground}`} stroke="#6f9a52" strokeWidth={8} />
          {/* корни и вода у корней */}
          <g transform={`translate(${treeX} ${ground}) scale(0.42)`}>
            <Roots reveal={1} />
          </g>
          <Glow x={60} y={ground + 120} r={44} k={b.hi.water} />
          {[
            [44, ground + 98],
            [70, ground + 140],
            [36, ground + 160],
            [DW - 52, ground + 110],
            [DW - 78, ground + 150],
          ].map(([x, y], i) => (
            <path key={i} d={`M ${x} ${y - 12} q 8 12 0 17 q -8 -5 0 -17 Z`} fill="#5fa4d6" stroke="#2f6f9f" strokeWidth={1.6} />
          ))}
          {/* солнце */}
          <Glow x={56} y={76} r={48} k={b.hi.sun} />
          <g transform="translate(56 76)">
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2 + t * 0.15;
              return <line key={i} x1={f(Math.cos(a) * 30)} y1={f(Math.sin(a) * 30)} x2={f(Math.cos(a) * 40)} y2={f(Math.sin(a) * 40)} stroke="#f0b84a" strokeWidth={4} strokeLinecap="round" />;
            })}
            <circle r={22} fill="#ffd977" stroke="#e0a63c" strokeWidth={3} />
          </g>
          {/* воздух — спокойный завиток у кроны */}
          <Glow x={DW - 58} y={130} r={42} k={b.hi.air} />
          <g transform={`translate(${DW - 58} 130)`}>
            <path d="M 28 -12 C 6 -24 -14 -8 -24 -16 C -36 -24 -30 -40 -18 -36" fill="none" stroke="#8fb3cc" strokeWidth={5} strokeLinecap="round" />
            <path d="M 30 10 C 8 -2 -10 14 -26 6" fill="none" stroke="#8fb3cc" strokeWidth={5} strokeLinecap="round" />
          </g>
          {/* яблоня */}
          <Glow x={treeX} y={ground - 150} r={120} k={b.hi.tree} />
          <g transform={`translate(${treeX} ${ground})`}>
            <AppleTree x={0} y={0} s={0.27} t={t} st={{ season: "summer", fruit: 1, fruitCount: 6 }} />
          </g>
          {/* веточка с цветком и пчела */}
          <g transform={`translate(${DW - 70} ${ground - 40})`}>
            <path d="M -40 30 Q -10 10 6 -6" fill="none" stroke="#7a5238" strokeWidth={6} strokeLinecap="round" />
            <AppleFlower x={8} y={-10} r={20} />
            <Bee x={-14} y={-46} s={0.42} dir={1} tilt={6} fly={1} pollen={1} t={t} seed={9} />
          </g>
          {/* стрелки: вода → корни, свет → листья */}
          <Arrow x1={78} y1={ground + 130} x2={treeX - 52} y2={ground + 60} k={b.arrowWater} color="#2f86d0" />
          <Arrow x1={84} y1={98} x2={treeX - 70} y2={ground - 200} k={b.arrowLight} color="#e0a020" />
        </Card>
      </g>
    </g>
  );
};
