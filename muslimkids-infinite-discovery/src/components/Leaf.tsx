import React from "react";
import { Delaunay } from "d3-delaunay";
import { rng } from "../engines/math";
import { halfWidth, leafOutline, LEAF_U, LEAF_V, SECONDARY_A0, secondaryVein } from "../engines/LeafGeometry";

// World L — the hero leaf in macro (units: leaf length 900). Midrib, pinnate secondary veins
// (one of them passes exactly under the drop and continues as the vein of world S),
// a reticulate tertiary network and a waxy sheen.
const OUT = leafOutline(160, 5);
const OUT_D = "M" + OUT.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L") + "Z";

const VEINS = (() => {
  const sec: string[] = [];
  for (const a0 of SECONDARY_A0) for (const sd of [1, -1] as const) {
    const v = secondaryVein(a0, sd);
    if (v.length > 1) sec.push("M" + v.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L"));
  }
  const R = rng(31), pts: [number, number][] = [];
  for (let a = -450; a <= 450; a += 45) for (let b = -320; b <= 320; b += 45) {
    const x = a + (R() - 0.5) * 40, y = b + (R() - 0.5) * 40;
    if (Math.abs(y) < halfWidth(x) - 4) pts.push([x, y]);
  }
  const vor = Delaunay.from(pts).voronoi([-460, -330, 460, 330]);
  let tert = "";
  for (let i = 0; i < pts.length; i++) {
    const poly = vor.cellPolygon(i);
    if (poly) tert += "M" + poly.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L") + "Z";
  }
  return { sec, tert };
})();

const M = `matrix(${LEAF_U.x} ${LEAF_U.y} ${LEAF_V.x} ${LEAF_V.y} 0 0)`;

export const LeafBody: React.FC<{ shadow?: boolean }> = ({ shadow = true }) => (
  <g>
    <defs>
      <linearGradient id="leafFill" x1="0" y1="-1" x2="0.25" y2="1">
        <stop offset="0" stopColor="#8fd56e" />
        <stop offset="0.45" stopColor="#4fae5c" />
        <stop offset="1" stopColor="#24683c" />
      </linearGradient>
      <radialGradient id="leafSheen" cx="0.3" cy="0.25" r="0.6">
        <stop offset="0" stopColor="#F8F7F3" stopOpacity={0.28} />
        <stop offset="1" stopColor="#F8F7F3" stopOpacity={0} />
      </radialGradient>
      <clipPath id="leafClip"><path d={OUT_D} transform={M} /></clipPath>
      <filter id="leafShadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18" /></filter>
    </defs>
    {/* cast shadow on the out-of-focus foliage below */}
    {shadow && <path d={OUT_D} transform={`translate(40 34) ${M}`} fill="#04140c" opacity={0.55} filter="url(#leafShadow)" />}
    {/* petiole */}
    <path d="M -450 0 L -560 -8" transform={M} stroke="#5f9a4a" strokeWidth={22} strokeLinecap="round" />
    <path d={OUT_D} transform={M} fill="url(#leafFill)" />
    <g clipPath="url(#leafClip)">
      <path d={VEINS.tert} transform={M} fill="none" stroke="#c7ef9f" strokeOpacity={0.22} strokeWidth={2.2} />
      <path d={VEINS.tert} transform={`translate(0.8 1.2) ${M}`} fill="none" stroke="#123d24" strokeOpacity={0.18} strokeWidth={1.4} />
      {VEINS.sec.map((d, i) => (
        <g key={i}>
          <path d={d} transform={M} fill="none" stroke="#1d5532" strokeOpacity={0.35} strokeWidth={11} strokeLinecap="round" />
          <path d={d} transform={M} fill="none" stroke="#cdeca0" strokeOpacity={0.85} strokeWidth={6.5} strokeLinecap="round" />
        </g>
      ))}
      <path d="M -470 0 L 445 0" transform={M} stroke="#1d5532" strokeOpacity={0.4} strokeWidth={22} strokeLinecap="round" />
      <path d="M -470 0 L 445 0" transform={M} stroke="#d9f2a8" strokeWidth={13} strokeLinecap="round" />
      <path d="M -470 -3 L 445 -1" transform={M} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} />
      <rect x={-500} y={-500} width={1000} height={1000} fill="url(#leafSheen)" />
    </g>
    <path d={OUT_D} transform={M} fill="none" stroke="#c9f0a2" strokeOpacity={0.5} strokeWidth={2.5} />
  </g>
);
