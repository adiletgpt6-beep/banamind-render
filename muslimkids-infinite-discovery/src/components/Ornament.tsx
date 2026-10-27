import React from "react";
import { Poly } from "../engines/ShapeMorphEngine";

// Original 8-fold rosette drawn by ONE continuous line: a looped hypotrochoid star
// that ends by closing a calm outer ring. Pure geometry — a visual pause, not a symbol.
export const ORNAMENT_C = { x: 540, y: 470 };

export const ornamentPath = (): Poly => {
  const pts: Poly = [];
  const R = 1, r = 1 / 8, d = 0.34, s = 112, rot = -Math.PI / 2;
  const N = 720;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
    const c = Math.cos(rot), sn = Math.sin(rot);
    pts.push({ x: ORNAMENT_C.x + (x * c - y * sn) * s, y: ORNAMENT_C.y + (x * sn + y * c) * s });
  }
  // step out to the ring and close it
  const r0 = (R - r + d) * s, ring = 150;
  for (let i = 1; i <= 10; i++) pts.push({ x: ORNAMENT_C.x, y: ORNAMENT_C.y - (r0 + ((ring - r0) * i) / 10) });
  for (let i = 1; i <= 160; i++) {
    const a = -Math.PI / 2 + (i / 160) * Math.PI * 2;
    pts.push({ x: ORNAMENT_C.x + Math.cos(a) * ring, y: ORNAMENT_C.y + Math.sin(a) * ring });
  }
  return pts;
};

/** soft glow disc behind the ornament */
export const OrnamentGlow: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity }}>
    <defs>
      <radialGradient id="ornGlow">
        <stop offset="0" stopColor="#F4C66A" stopOpacity={0.16} />
        <stop offset="0.6" stopColor="#F4C66A" stopOpacity={0.05} />
        <stop offset="1" stopColor="#F4C66A" stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={ORNAMENT_C.x} cy={ORNAMENT_C.y} r={240} fill="url(#ornGlow)" />
  </svg>
);
