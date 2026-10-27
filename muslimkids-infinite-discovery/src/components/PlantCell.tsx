import React from "react";
import { rng } from "../engines/math";

// World C — one palisade cell, enlarged schematic (units: 500 × 1500, centred).
// Cell wall + membrane, thin cytoplasm with chloroplasts (with grana), large central vacuole,
// nucleus with nucleolus, a few mitochondria. Shapes follow the textbook model.
export const CELL_W = 500, CELL_H = 1500, CELL_R = 170;

const G = (() => {
  const R = rng(1201);
  const chl: { x: number; y: number; a: number }[] = [];
  // along the long walls
  for (let y = -560; y <= 690; y += 78) {
    chl.push({ x: -CELL_W / 2 + 46, y: y + R() * 16, a: 90 + (R() - 0.5) * 16 });
    chl.push({ x: CELL_W / 2 - 46, y: y + 30 + R() * 16, a: 90 + (R() - 0.5) * 16 });
  }
  // bottom end
  for (const x of [-120, 0, 120]) chl.push({ x, y: CELL_H / 2 - 48, a: (R() - 0.5) * 20 });
  const mito = [{ x: -150, y: -660, a: 30 }, { x: 160, y: -560, a: -60 }, { x: -170, y: 360, a: 80 }, { x: 175, y: 140, a: 100 }, { x: 60, y: 690, a: 10 }];
  return { chl, mito };
})();

const Chloroplast: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <ellipse rx={50} ry={25} fill="url(#chlFill)" stroke="#2c8a59" strokeWidth={3} />
    <ellipse rx={44} ry={19} fill="none" stroke="#c9f5d6" strokeOpacity={0.35} strokeWidth={1.5} />
    {[-26, -9, 8, 25].map((gx, i) => (
      <g key={i} transform={`translate(${gx} ${i % 2 ? 3 : -3})`}>
        {[-7, -2.5, 2, 6.5].map((gy, j) => <rect key={j} x={-6} y={gy} width={12} height={3.2} rx={1.5} fill="#1f6a42" />)}
      </g>
    ))}
    <path d="M -36 0 L 36 0" stroke="#1f6a42" strokeWidth={1.4} strokeOpacity={0.7} />
  </g>
);

export const PlantCellContent: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="chlFill" cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#8fe0a6" />
        <stop offset="1" stopColor="#3aa36a" />
      </radialGradient>
      <radialGradient id="cytoGlow" cx="0.5" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#4EBB84" stopOpacity={0.24} />
        <stop offset="1" stopColor="#4EBB84" stopOpacity={0.12} />
      </radialGradient>
      <linearGradient id="vacFill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#A9E5F2" stopOpacity={0.2} />
        <stop offset="1" stopColor="#58D6DB" stopOpacity={0.1} />
      </linearGradient>
      <radialGradient id="nucFill" cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#b9a6f0" stopOpacity={0.55} />
        <stop offset="1" stopColor="#6c5bbf" stopOpacity={0.4} />
      </radialGradient>
    </defs>
    {/* cell wall (thick) and plasma membrane */}
    <rect x={-CELL_W / 2} y={-CELL_H / 2} width={CELL_W} height={CELL_H} rx={CELL_R} fill="url(#cytoGlow)" stroke="#A9E5F2" strokeWidth={24} />
    <rect x={-CELL_W / 2 + 18} y={-CELL_H / 2 + 18} width={CELL_W - 36} height={CELL_H - 36} rx={CELL_R - 18} fill="none" stroke="#58D6DB" strokeOpacity={0.75} strokeWidth={4} />
    {/* central vacuole */}
    <rect x={-CELL_W / 2 + 84} y={-560} width={CELL_W - 168} height={1230} rx={120} fill="url(#vacFill)" stroke="#A9E5F2" strokeOpacity={0.55} strokeWidth={4} strokeDasharray="1 0" />
    {/* nucleus */}
    <g transform="translate(0 -655)">
      <ellipse rx={98} ry={66} fill="url(#nucFill)" stroke="#d6ccff" strokeOpacity={0.8} strokeWidth={4} />
      <ellipse rx={88} ry={56} fill="none" stroke="#d6ccff" strokeOpacity={0.4} strokeWidth={2} strokeDasharray="14 8" />
      <circle cx={18} cy={-6} r={24} fill="#4b3c99" fillOpacity={0.8} />
    </g>
    {G.mito.map((m, i) => (
      <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${m.a})`}>
        <rect x={-24} y={-11} width={48} height={22} rx={11} fill="#F4C66A" fillOpacity={0.45} stroke="#F4C66A" strokeWidth={2.5} />
        <path d="M -16 0 q 4 -8 8 0 t 8 0 t 8 0 t 8 0" fill="none" stroke="#b0812a" strokeWidth={2} />
      </g>
    ))}
    {G.chl.map((c, i) => <Chloroplast key={i} {...c} />)}
  </g>
);

export const CELL_PARTS = {
  nucleus: { x: 0, y: -655 },
  chloroplast: { x: CELL_W / 2 - 46, y: -2 },
  wall: { x: -CELL_W / 2, y: 260 },
  vacuole: { x: 0, y: 150 },
};
