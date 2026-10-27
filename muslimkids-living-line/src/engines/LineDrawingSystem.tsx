// LineDrawingSystem — renders the journey for one frame.
//
// Three passes keep the look premium but cheap:
//   1. glow  — wide, soft copies of the visible strokes, blurred ONCE in
//              screen space (one filter for the whole line);
//   2. core  — the crisp contour, with a brighter "fresh ink" segment right
//              behind the head of every stroke that is being drawn;
//   3. tip   — the bright leading point with a speed-stretched streak.

import React from "react";
import { cameraTransform, type Camera } from "./CameraController.ts";
import {
  at,
  tipAt,
  visibleRange,
  worldWidth,
  type Stroke,
  type TipState,
} from "./LivingLineEngine.ts";
import { samplePath } from "./PathSampler.ts";
import { PALETTE } from "../styles/palette.ts";

export type LineStyle = {
  /** Extra opacity multiplier per stroke (scene fades, final dimming…). */
  fade?: (s: Stroke, f: number) => number;
};

type Visible = {
  s: Stroke;
  d: string;
  r0: number;
  r1: number;
  L: number;
  w: number;
  color: string;
  op: number;
  drawing: boolean;
};

const collect = (journey: Stroke[], f: number, cam: Camera, style: LineStyle): Visible[] => {
  const out: Visible[] = [];
  for (const s of journey) {
    if (f < s.from) continue;
    const op = at(s.opacity ?? 1, f) * (style.fade ? style.fade(s, f) : 1);
    if (op <= 0.004) continue;
    const range = visibleRange(s, f);
    if (!range) continue;
    const d = at(s.d, f);
    const L = samplePath(d).length;
    out.push({
      s,
      d,
      r0: range[0],
      r1: range[1],
      L,
      w: worldWidth(s, cam.zoom),
      color: at(s.color ?? PALETTE.gold, f),
      op,
      drawing: (f <= s.to && f >= s.from) || s.kind === "travel",
    });
  }
  return out;
};

const dash = (v: Visible, a: number, b: number): React.SVGProps<SVGPathElement> => {
  const full = a <= 0.01 && b >= v.L - 0.01;
  if (full) return {};
  return { strokeDasharray: `${Math.max(0.001, b - a)} ${v.L * 2 + 10}`, strokeDashoffset: -a };
};

const common = (v: Visible): React.SVGProps<SVGPathElement> => ({
  d: v.d,
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  clipPath: v.s.clip ? `url(#${v.s.clip})` : undefined,
  mask: v.s.mask ? `url(#${v.s.mask})` : undefined,
});

export const LivingLine: React.FC<{
  journey: Stroke[];
  f: number;
  cam: Camera;
  style?: LineStyle;
  tipOpacity?: number;
}> = ({ journey, f, cam, style = {}, tipOpacity = 1 }) => {
  const vis = collect(journey, f, cam, style);
  const tip = tipAt(journey, f);
  const tf = cameraTransform(cam);
  return (
    <>
      {/* 1 — glow (screen-space blur) */}
      <g filter="url(#line-glow)">
        <g transform={tf}>
          {vis.map((v) => (
            <path
              key={`g-${v.s.id}`}
              {...common(v)}
              {...dash(v, v.r0, v.r1)}
              stroke={v.color}
              strokeWidth={v.w * 3.4}
              opacity={v.op * (v.s.glow ?? 0.5) * 0.55}
            />
          ))}
        </g>
      </g>
      {/* 2 — crisp contour + fresh-ink head */}
      <g transform={tf}>
        {vis.map((v) => (
          <path key={`c-${v.s.id}`} {...common(v)} {...dash(v, v.r0, v.r1)} stroke={v.color} strokeWidth={v.w} opacity={v.op} />
        ))}
        {vis
          .filter((v) => v.drawing && v.r1 - v.r0 > 0.5)
          .map((v) => {
            const head = 70 / cam.zoom;
            const a = Math.max(v.r0, v.r1 - head);
            const a2 = Math.max(v.r0, v.r1 - head * 0.35);
            return (
              <g key={`h-${v.s.id}`} opacity={v.op}>
                <path {...common(v)} {...dash(v, a, v.r1)} stroke={PALETTE.goldHot} strokeWidth={v.w * 1.12} opacity={0.75} />
                <path {...common(v)} {...dash(v, a2, v.r1)} stroke={PALETTE.white} strokeWidth={v.w * 0.9} opacity={0.8} />
              </g>
            );
          })}
        <Tip tip={tip} f={f} zoom={cam.zoom} opacity={tipOpacity} />
      </g>
    </>
  );
};

const Tip: React.FC<{ tip: TipState; f: number; zoom: number; opacity: number }> = ({ tip, f, zoom, opacity }) => {
  if (opacity <= 0.01) return null;
  const breathe = tip.idle ? 0.82 + 0.18 * Math.sin(f / 7) : 1;
  const z = 1 / zoom;
  const ang = (Math.atan2(tip.dir.y, tip.dir.x) * 180) / Math.PI;
  const cool = tip.color.toLowerCase() === PALETTE.moon.toLowerCase() || tip.color.toLowerCase() === PALETTE.blue.toLowerCase();
  const streak = (12 + 34 * tip.speed) * z;
  return (
    <g opacity={opacity} transform={`translate(${tip.p.x} ${tip.p.y})`}>
      <circle r={40 * z * breathe} fill={cool ? "url(#tip-halo-cool)" : "url(#tip-halo)"} />
      <g transform={`rotate(${ang})`}>
        <ellipse cx={-streak * 0.55} cy={0} rx={streak} ry={4.2 * z} fill={cool ? PALETTE.moon : PALETTE.goldHot} opacity={0.55 + 0.3 * tip.speed} />
      </g>
      <circle r={6.2 * z} fill={cool ? PALETTE.moon : PALETTE.goldHot} />
      <circle r={3.6 * z * breathe} fill={PALETTE.white} />
    </g>
  );
};
