import React from "react";
import { GOLD } from "../engines/LivingLineEngine";
import { toPathD } from "../engines/ShapeMorphEngine";
import { LINE } from "../content/lineProgram";
import { smoothstep } from "../engines/math";

/** Renders the golden line: persistent strokes, a tapering comet tail and a soft glowing head. */
export const LivingLine: React.FC<{ t: number; opacity?: number }> = ({ t, opacity = 1 }) => {
  const strokes = LINE.strokes(t);
  const tail = LINE.tail(t);
  const h = tail[0];
  const speed = Math.hypot(tail[0].x - tail[3].x, tail[0].y - tail[3].y);
  const breathe = 1 + 0.08 * Math.sin(t * 3.1);
  const endFade = 1 - smoothstep(59.3, 59.95, t) * 0.65;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: opacity }}>
      <defs>
        <radialGradient id="lineHead">
          <stop offset="0" stopColor="#FFF6DD" stopOpacity={1} />
          <stop offset="0.18" stopColor={GOLD} stopOpacity={0.85} />
          <stop offset="0.5" stopColor={GOLD} stopOpacity={0.18} />
          <stop offset="1" stopColor={GOLD} stopOpacity={0} />
        </radialGradient>
      </defs>
      {strokes.map((s, i) => {
        const d = toPathD(s.pts);
        return (
          <g key={i} opacity={s.alpha} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} stroke={s.color} strokeOpacity={0.14} strokeWidth={s.width * 4.2} />
            <path d={d} stroke={s.color} strokeOpacity={0.3} strokeWidth={s.width * 2} />
            <path d={d} stroke={s.color} strokeWidth={s.width} />
          </g>
        );
      })}
      <g fill="none" strokeLinecap="round">
        {tail.slice(0, -1).map((p, k) => {
          const q = tail[k + 1];
          const u = k / (tail.length - 1);
          return (
            <line key={k} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={GOLD}
              strokeOpacity={(1 - u) * 0.9 * endFade} strokeWidth={Math.max(0.6, 5 * (1 - u))} />
          );
        })}
      </g>
      <g opacity={endFade}>
        <circle cx={h.x} cy={h.y} r={(34 + Math.min(14, speed * 0.3)) * breathe} fill="url(#lineHead)" />
        <circle cx={h.x} cy={h.y} r={4.2} fill="#FFF8E6" />
      </g>
    </svg>
  );
};
