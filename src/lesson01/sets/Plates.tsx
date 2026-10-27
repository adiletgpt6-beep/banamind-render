// Отдельные иллюстративные планы природы (существующий мир, без «сотворения»):
// дерево, камень у дерева, горы и небо, Земля, дневное небо с солнцем,
// ночное небо со звёздами. Один художественный стиль с окном комнаты.
import React from "react";
import type { PlateKind } from "../direction";
import { OUTLINE } from "../rig/looks";
import { Landscape, type SkyMode } from "./Landscape";

const crop: Record<Exclude<PlateKind, "earth">, { cx: number; cy: number; w: number; dw: number; mode: SkyMode }> = {
  tree: { cx: 650, cy: 560, w: 1000, dw: -40, mode: "day" },
  treeStone: { cx: 780, cy: 640, w: 1150, dw: -40, mode: "day" },
  sky: { cx: 960, cy: 520, w: 1900, dw: -60, mode: "day" },
  sun: { cx: 1260, cy: 400, w: 1250, dw: -40, mode: "sun" },
  night: { cx: 960, cy: 520, w: 1900, dw: -50, mode: "night" },
  finalTree: { cx: 720, cy: 540, w: 1300, dw: -70, mode: "day" },
};

const EarthPlate: React.FC<{ u: number }> = ({ u }) => {
  const s = 1 + u * 0.03;
  return (
    <g>
      <rect width={1920} height={1080} fill="#f3ead9" />
      <rect x={560} y={130} width={800} height={820} rx={24} fill="#fffdf7" stroke={OUTLINE} strokeWidth={3} />
      <g transform={`translate(960 540) scale(${2.9 * s})`}>
        <circle r={92} fill="#4a8cc4" stroke={OUTLINE} strokeWidth={2} />
        <path d="M -60 -50 C -30 -70 0 -60 10 -40 C 20 -20 -10 -10 -20 10 C -30 30 -60 20 -70 0 C -80 -20 -75 -40 -60 -50 Z" fill="#79b47d" />
        <path d="M 30 -10 C 50 -20 75 -5 70 20 C 66 45 40 60 25 45 C 12 30 15 0 30 -10 Z" fill="#79b47d" />
        <path d="M -30 50 C -10 45 10 60 0 75 C -20 85 -40 70 -30 50 Z" fill="#9cc47e" />
        <path d="M -80 -10 C -40 -20 20 -25 80 -15" fill="none" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={6} strokeLinecap="round" />
        <circle r={92} fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={8} transform="translate(-6 -6) scale(0.9)" />
      </g>
    </g>
  );
};

export const Plate: React.FC<{ kind: PlateKind; t: number; u: number }> = ({ kind, t, u }) => {
  if (kind === "earth") return <EarthPlate u={u} />;
  const c = crop[kind];
  const w = c.w + c.dw * u;
  const h = (w * 9) / 16;
  return (
    <svg x={0} y={0} width={1920} height={1080} viewBox={`${c.cx - w / 2} ${c.cy - h / 2} ${w} ${h}`}>
      <Landscape t={t} mode={c.mode} showBird={kind !== "night"} />
    </svg>
  );
};
