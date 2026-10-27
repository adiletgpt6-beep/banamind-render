import React from "react";
import { rng } from "../engines/math";

// A few calm stars (no particle storms): ~90 small + 10 brighter with a slow twinkle.
const STARS = (() => {
  const R = rng(2024);
  return Array.from({ length: 100 }, (_, i) => ({ x: R() * 1080, y: R() * 1920, r: i < 10 ? 2.2 + R() : 0.8 + R() * 1.1, p: R() * 6.28, b: i < 10 }));
})();

export const Starfield: React.FC<{ t: number; opacity: number; zoom: number }> = ({ t, opacity, zoom }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity }}>
    <g transform={`translate(540 960) scale(${zoom}) translate(-540 -960)`}>
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.b ? "#F8F7F3" : "#A9E5F2"}
          opacity={(s.b ? 0.75 : 0.5) + 0.25 * Math.sin(t * 1.3 + s.p)} />
      ))}
    </g>
  </svg>
);
