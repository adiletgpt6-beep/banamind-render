// Значок текущего закона в правом верхнем углу: «Закон 12 · удлинения линии».
// При смене закона — мягкий «штамп» (увеличение и подсветка), без таймеров.
import React from "react";
import { interpolate, spring, useCurrentFrame } from "remotion";
import { LAWS } from "../laws";
import { C, FONT, FPS } from "../theme";
import type { Timeline } from "../timeline";
import type { Scene } from "../types";

export const LawBadge: React.FC<{ tl: Timeline; scenes: Scene[]; opacity: number }> = ({ tl, scenes, opacity }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let si = 0;
  while (si + 1 < tl.scenes.length && tl.scenes[si + 1].from <= t) si++;
  const law = scenes[si].law;
  if (!law) return null;
  let first = si;
  while (first > 0 && scenes[first - 1].law === law) first--;
  const start = tl.scenes[first].from;
  const k = spring({ frame: frame - Math.round((start + 0.2) * FPS), fps: FPS, config: { damping: 12 } });
  const stamp = interpolate(t, [start + 0.2, start + 0.5, start + 2.2], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let last = si;
  while (last + 1 < scenes.length && scenes[last + 1].law === law) last++;
  const out = interpolate(t, [tl.scenes[last].to - 0.5, tl.scenes[last].to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", right: 34, top: 22, opacity: opacity * out, transform: `scale(${(0.6 + 0.4 * k) * (1 + 0.12 * stamp)})`, transformOrigin: "100% 0%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 20px 6px 8px", borderRadius: 26, background: C.white, boxShadow: `0 6px 18px rgba(36,50,74,${0.15 + 0.25 * stamp})`, border: `4px solid ${C.yellowDeep}` }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 24, color: C.ink, background: C.yellow, borderRadius: 18, padding: "2px 12px" }}>Закон {law}</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.ink }}>{LAWS[law - 1]}</div>
      </div>
    </div>
  );
};
