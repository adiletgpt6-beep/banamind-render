import React, { useLayoutEffect, useRef } from "react";
import { rng } from "../engines/math";
import { ANCHOR_FOREST_TREE, WorldView } from "../engines/NestedWorldEngine";
import { CX, CY } from "../engines/InfiniteCameraEngine";

const lowRes = (blur: number) => blur > 4;
import { coniferSprite, crownSprite } from "./sprites";

// Forest canopy seen from above (world F). ~4000 crowns from sprites, culled to the frame.
type Tree = { x: number; y: number; r: number; kind: 0 | 1; v: number };
const TREES: Tree[] = (() => {
  const R = rng(4242), out: Tree[] = [];
  const step = 62;
  for (let gy = -2600; gy <= 2600; gy += step) for (let gx = -1500; gx <= 1500; gx += step) {
    const x = gx + (R() - 0.5) * step * 0.9, y = gy + (R() - 0.5) * step * 0.9;
    if (Math.hypot(x - ANCHOR_FOREST_TREE.x, y - ANCHOR_FOREST_TREE.y) < 95) continue;
    // a winding stream keeps a gap in the canopy
    const sx = 520 * Math.sin(y / 700) - 380;
    if (Math.abs(x - sx) < 38) continue;
    out.push({ x, y, r: 30 + R() * 14, kind: R() < 0.45 ? 1 : 0, v: Math.floor(R() * 4) });
  }
  return out.sort((a, b) => a.y - b.y);
})();

export const ForestCanvas: React.FC<{ v: WorldView; opacity: number; blur: number }> = ({ v, opacity, blur }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!, g = c.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, c.width, c.height);
    if (opacity <= 0) return;
    const q = c.width / 1080; // reduced backing store while out of focus (blur hides it, renders 4–16× faster)
    g.setTransform(v.m * q, 0, 0, v.m * q, (CX - v.c.x * v.m) * q, (CY - v.c.y * v.m) * q);
    // forest floor
    g.fillStyle = "#1b3a27";
    g.fillRect(-1700, -2800, 3400, 5600);
    // stream
    g.lineCap = "round";
    g.beginPath();
    for (let y = -2800; y <= 2800; y += 40) {
      const x = 520 * Math.sin(y / 700) - 380;
      if (y === -2800) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.strokeStyle = "#2a5a52"; g.lineWidth = 64; g.stroke();
    g.strokeStyle = "#4f9ea0"; g.lineWidth = 30; g.stroke();
    g.strokeStyle = "rgba(200,240,245,0.35)"; g.lineWidth = 6; g.stroke();
    const x0 = v.c.x - (CX + 200) / v.m, x1 = v.c.x + (CX + 200) / v.m;
    const y0 = v.c.y - (CY + 200) / v.m, y1 = v.c.y + (CY + 200) / v.m;
    for (const t of TREES) {
      if (t.x < x0 || t.x > x1 || t.y < y0 || t.y > y1) continue;
      const sp = t.kind ? coniferSprite(t.v) : crownSprite(t.v);
      const s = (t.r * 2) / (sp.width * (t.kind ? 0.68 : 0.72));
      g.drawImage(sp, t.x - (sp.width * s) / 2, t.y - (sp.height * s) / 2, sp.width * s, sp.height * s);
    }
    // the hero tree — a broadleaf crown, a little brighter
    const hs = crownSprite(0, true), hr = 72, s = (hr * 2) / (hs.width * 0.72);
    g.drawImage(hs, ANCHOR_FOREST_TREE.x - (hs.width * s) / 2, ANCHOR_FOREST_TREE.y - (hs.height * s) / 2, hs.width * s, hs.height * s);
    // soften the far edges of the generated patch
    g.setTransform(1, 0, 0, 1, 0, 0);
  });
  return (
    <canvas ref={ref} width={lowRes(blur) ? 270 : 1080} height={lowRes(blur) ? 480 : 1920}
      style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity, filter: blur > 0.2 ? `blur(${lowRes(blur) ? Math.max(0.5, blur - 3) : blur}px)` : undefined }} />
  );
};
