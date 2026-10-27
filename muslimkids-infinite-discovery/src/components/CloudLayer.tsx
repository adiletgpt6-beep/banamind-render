import React, { useLayoutEffect, useRef } from "react";
import { layerAlpha, layerScale } from "../engines/DepthComposer";
import { rng } from "../engines/math";
import { CX, CY } from "../engines/InfiniteCameraEngine";

// Fly-through clouds: two altitudes of soft puffs that the camera dives through,
// hiding the hand-over from the planet shader to the forest.
type Puff = { x: number; y: number; r: number; parts: { dx: number; dy: number; r: number }[] };
const makeLayer = (seed: number, n: number, spreadX: number, spreadY: number, rMin: number, rMax: number, hole: number) => {
  const R = rng(seed);
  const out: Puff[] = [];
  while (out.length < n) {
    const x = (R() * 2 - 1) * spreadX, y = (R() * 2 - 1) * spreadY;
    if (Math.hypot(x, y * 0.6) < hole) continue;
    const r = rMin + R() * (rMax - rMin);
    const parts = Array.from({ length: 6 + Math.floor(R() * 5) }, () => ({ dx: (R() * 2 - 1) * r * 0.9, dy: (R() * 2 - 1) * r * 0.45, r: r * (0.45 + R() * 0.5) }));
    out.push({ x, y, r, parts });
  }
  return out;
};
const LAYERS = [
  { pass: 7.4, k: 260, puffs: makeLayer(11, 70, 5.5, 9.0, 0.3, 0.8, 0.9) },
  { pass: 9.35, k: 260, puffs: makeLayer(23, 60, 4.0, 7.0, 0.25, 0.7, 0.0) },
];

let sprite: HTMLCanvasElement | null = null;
const puffSprite = () => {
  if (sprite) return sprite;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(118, 112, 4, 128, 128, 128);
  gr.addColorStop(0, "rgba(255,255,255,0.95)");
  gr.addColorStop(0.45, "rgba(246,249,252,0.75)");
  gr.addColorStop(0.75, "rgba(214,230,240,0.28)");
  gr.addColorStop(1, "rgba(200,220,235,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  sprite = c;
  return c;
};

export const CloudLayer: React.FC<{ J: number; opacity: number }> = ({ J, opacity }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!, g = c.getContext("2d")!;
    g.clearRect(0, 0, c.width, c.height);
    if (opacity <= 0) return;
    const sp = puffSprite();
    for (const L of LAYERS) {
      const a = layerAlpha(J, L.pass) * opacity;
      const s = layerScale(J, L.pass, L.k);
      if (a <= 0.003 || !isFinite(s)) continue;
      for (const p of L.puffs) {
        const px = CX + p.x * s, py = CY + p.y * s;
        const rr = p.r * s * 1.6;
        if (px + rr < 0 || px - rr > 1080 || py + rr < 0 || py - rr > 1920) continue;
        for (const q of p.parts) {
          const r = q.r * s * 1.5;
          g.globalAlpha = a * 0.55;
          g.drawImage(sp, px + q.dx * s - r, py + q.dy * s - r, r * 2, r * 2);
        }
      }
    }
    g.globalAlpha = 1;
  });
  return <canvas ref={ref} width={1080} height={1920} style={{ position: "absolute", inset: 0 }} />;
};
