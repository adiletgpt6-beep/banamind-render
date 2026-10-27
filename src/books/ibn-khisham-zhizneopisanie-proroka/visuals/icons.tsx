// Простые иконки для карточек (без изображений людей): предметы, знаки, природа.
// Размер — в единицах «r» (радиус круга-подложки), центр — (0, 0).
import React from "react";
import { C } from "../theme";
import { Camel, Lantern, OL, Star8 } from "./draw";

export type IconName =
  | "sheep" | "shield" | "scale" | "camel" | "heart" | "star" | "house" | "lamp" | "coin" | "crown" | "flask"
  | "tears" | "crowd" | "family" | "scroll" | "book" | "link" | "moon" | "talk" | "door" | "mosque" | "water" | "key";

const sw = 5;

export const Sheep: React.FC<{ x: number; y: number; s?: number; t?: number; seed?: number }> = ({ x, y, s = 1, t = 0, seed = 0 }) => {
  const bob = Math.sin(t * 3 + seed) * 2;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {[-26, -10, 12, 28].map((lx, i) => (
        <path key={i} d={`M ${lx} -10 L ${lx} 18`} stroke={OL} strokeWidth={7} strokeLinecap="round" />
      ))}
      {[[-24, -30, 22], [0, -38, 26], [24, -30, 22], [-10, -18, 22], [14, -18, 22]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#fbf6ea" stroke={OL} strokeWidth={4} />
      ))}
      <ellipse cx={46} cy={-34} rx={16} ry={12} fill="#5b4636" stroke={OL} strokeWidth={3} />
      <circle cx={50} cy={-36} r={2.5} fill="#fff" />
    </g>
  );
};

export const Icon: React.FC<{ name: string; r?: number; t?: number; color?: string }> = ({ name, r = 60, t = 0, color = C.goldSoft }) => {
  const k = r / 60;
  const body = (() => {
    switch (name as IconName) {
      case "sheep":
        return <Sheep x={-8} y={18} s={0.95} t={t} />;
      case "shield":
        return <path d="M 0 -40 L 34 -26 Q 34 18 0 40 Q -34 18 -34 -26 Z" fill="#7fd0c8" stroke={OL} strokeWidth={sw} />;
      case "scale":
        return (
          <g stroke={OL} strokeWidth={sw} fill="none" strokeLinecap="round">
            <path d="M 0 -38 L 0 34 M -26 34 L 26 34 M -36 -26 L 36 -26" />
            <path d="M -36 -26 L -48 6 L -24 6 Z M 36 -26 L 24 6 L 48 6 Z" fill="#ffe08a" />
          </g>
        );
      case "camel":
        return <Camel x={-14} y={36} s={0.38} walk={t * 5} />;
      case "heart":
        return <path d="M 0 34 C -50 0 -36 -40 0 -18 C 36 -40 50 0 0 34 Z" fill="#ff8a7a" stroke={OL} strokeWidth={sw} />;
      case "star":
        return <Star8 x={0} y={0} r={38} fill={C.gold} stroke={OL} rot={t * 20} />;
      case "house":
        return (
          <g stroke={OL} strokeWidth={sw}>
            <rect x={-34} y={-20} width={68} height={52} fill="#e7c08a" />
            <rect x={-40} y={-30} width={80} height={12} fill="#c9935a" />
            <path d="M -10 32 L -10 4 Q 0 -6 10 4 L 10 32 Z" fill="#7a4b2a" />
          </g>
        );
      case "lamp":
        return <Lantern x={0} y={10} s={0.5} t={t} glow={0.6} />;
      case "coin":
        return (
          <g stroke={OL} strokeWidth={sw}>
            <ellipse cx={-8} cy={10} rx={30} ry={30} fill="#f2b632" />
            <ellipse cx={10} cy={-8} rx={30} ry={30} fill="#ffd25e" />
            <text x={10} y={4} textAnchor="middle" fontSize={34} fontWeight={900} fill={OL} stroke="none">
              ✦
            </text>
          </g>
        );
      case "crown":
        return <path d="M -38 26 L -38 -22 L -18 2 L 0 -32 L 18 2 L 38 -22 L 38 26 Z" fill="#ffd25e" stroke={OL} strokeWidth={sw} strokeLinejoin="round" />;
      case "flask":
        return (
          <g stroke={OL} strokeWidth={sw}>
            <path d="M -12 -38 L 12 -38 L 12 -12 L 34 30 Q 36 38 26 38 L -26 38 Q -36 38 -34 30 L -12 -12 Z" fill="#cdeaff" />
            <path d="M -24 18 L 24 18 L 30 30 Q 30 34 26 34 L -26 34 Q -30 34 -30 30 Z" fill="#7fd0c8" stroke="none" />
          </g>
        );
      case "tears":
        return (
          <g stroke={OL} strokeWidth={sw}>
            <path d="M -14 -36 Q -34 0 -14 14 Q 6 0 -14 -36 Z" fill="#8fd0f0" />
            <path d="M 18 -10 Q 0 22 18 34 Q 36 22 18 -10 Z" fill="#8fd0f0" />
          </g>
        );
      case "crowd":
        return (
          <g>
            {Array.from({ length: 12 }).map((_, i) => (
              <circle key={i} cx={-36 + (i % 4) * 24} cy={-24 + Math.floor(i / 4) * 24} r={9} fill={i % 3 ? "#c8643b" : "#3d9a62"} stroke={OL} strokeWidth={3} />
            ))}
          </g>
        );
      case "family":
        return (
          <g stroke={OL} strokeWidth={sw}>
            <Tent x={0} y={30} />
            <circle cx={0} cy={-34} r={8} fill={C.gold} stroke="none" />
          </g>
        );
      case "scroll":
        return (
          <g stroke={OL} strokeWidth={sw}>
            <rect x={-30} y={-34} width={60} height={68} fill={C.parchment} />
            <rect x={-38} y={-42} width={76} height={14} rx={7} fill="#b8864b" />
            <rect x={-38} y={28} width={76} height={14} rx={7} fill="#b8864b" />
            <path d="M -18 -12 L 18 -12 M -18 2 L 18 2 M -18 16 L 8 16" strokeWidth={4} />
          </g>
        );
      case "book":
        return (
          <g stroke={OL} strokeWidth={sw}>
            <path d="M 0 -26 Q -22 -36 -44 -26 L -44 30 Q -22 20 0 30 Z" fill={C.paper} />
            <path d="M 0 -26 Q 22 -36 44 -26 L 44 30 Q 22 20 0 30 Z" fill="#fffaf0" />
          </g>
        );
      case "link":
        return (
          <g stroke={OL} strokeWidth={sw} fill="none">
            <ellipse cx={-16} cy={0} rx={24} ry={16} stroke={C.gold} strokeWidth={10} />
            <ellipse cx={16} cy={0} rx={24} ry={16} stroke="#7fd0c8" strokeWidth={10} />
          </g>
        );
      case "moon":
        return <path d="M 6 -38 A 38 38 0 1 0 6 38 A 30 30 0 1 1 6 -38 Z" fill="#fff4c4" stroke={OL} strokeWidth={sw} />;
      case "talk":
        return (
          <g stroke={OL} strokeWidth={sw}>
            <path d="M -40 -30 L 10 -30 Q 18 -30 18 -22 L 18 0 Q 18 8 10 8 L -16 8 L -28 22 L -26 8 L -40 8 Q -48 8 -48 0 L -48 -22 Q -48 -30 -40 -30 Z" fill="#fff" />
            <path d="M 0 -6 L 40 -6 Q 48 -6 48 2 L 48 24 Q 48 32 40 32 L 34 32 L 36 44 L 24 32 L 0 32 Q -8 32 -8 24 L -8 2 Q -8 -6 0 -6 Z" fill="#ffe08a" />
          </g>
        );
      case "door":
        return (
          <g stroke={OL} strokeWidth={sw}>
            <path d="M -26 38 L -26 -18 Q 0 -44 26 -18 L 26 38 Z" fill="#a9693f" />
            <circle cx={14} cy={6} r={4} fill={C.gold} stroke="none" />
          </g>
        );
      case "mosque":
        return (
          <g stroke={OL} strokeWidth={sw}>
            <rect x={-40} y={-4} width={80} height={40} fill="#efd6a8" />
            <path d="M -24 -4 Q 0 -44 24 -4 Z" fill="#7fd0c8" />
            <path d="M -8 36 L -8 14 Q 0 6 8 14 L 8 36 Z" fill="#7a4b2a" />
          </g>
        );
      case "water":
        return <path d="M 0 -40 Q -34 6 -26 20 Q -16 40 0 40 Q 16 40 26 20 Q 34 6 0 -40 Z" fill="#8fd0f0" stroke={OL} strokeWidth={sw} />;
      case "key":
        return (
          <g stroke={OL} strokeWidth={sw} fill="#ffd25e">
            <circle cx={-20} cy={0} r={16} />
            <path d="M -4 -6 L 40 -6 L 40 6 L 32 6 L 32 18 L 22 18 L 22 6 L -4 6 Z" />
          </g>
        );
      default:
        return <Star8 x={0} y={0} r={34} fill={C.gold} stroke={OL} />;
    }
  })();
  return (
    <g transform={`scale(${k})`}>
      <circle r={60} fill={color} stroke={OL} strokeWidth={4} />
      {body}
    </g>
  );
};

const Tent: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -44 0 L 0 -50 L 44 0 Z" fill="#f2e6cf" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -10 0 L 0 -22 L 10 0 Z" fill="#ffcf6a" />
  </g>
);
