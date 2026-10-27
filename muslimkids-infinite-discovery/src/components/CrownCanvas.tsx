import React, { useLayoutEffect, useRef } from "react";
import { rng } from "../engines/math";
import { ANCHOR_TREE_LEAF, WorldView } from "../engines/NestedWorldEngine";
import { CX, CY } from "../engines/InfiniteCameraEngine";

const lowRes = (blur: number) => blur > 4;
import { LEAF_U } from "../engines/LeafGeometry";
import { leafSprite } from "./sprites";

// One tree crown seen from above (world T, radius 576 = the hero crown of the forest × 8).
// Branches radiate from the trunk; leaves sit in clusters, darker in the deeper layers.
const CROWN_R = 576;
type Leaf = { x: number; y: number; a: number; len: number; shade: number };
type Branch = { pts: { x: number; y: number }[]; w: number };

const { LEAVES, BRANCHES } = (() => {
  const R = rng(777);
  const branches: Branch[] = [];
  const leaves: Leaf[] = [];
  const grow = (x: number, y: number, a: number, len: number, w: number, depth: number) => {
    const pts = [{ x, y }];
    let cx = x, cy = y, ca = a;
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      ca += (R() - 0.5) * 0.35;
      cx += Math.cos(ca) * (len / steps); cy += Math.sin(ca) * (len / steps);
      pts.push({ x: cx, y: cy });
      if (depth < 2 && i > 0 && R() < 0.55) grow(cx, cy, ca + (R() < 0.5 ? -1 : 1) * (0.5 + R() * 0.5), len * 0.55, w * 0.55, depth + 1);
      if (depth >= 1 || i > 0) {
        const nLeaves = depth === 2 ? 5 : depth === 1 ? 4 : 3;
        for (let k = 0; k < nLeaves; k++) {
          const la = ca + (R() - 0.5) * 2.2;
          const off = 25 + R() * 55;
          leaves.push({ x: cx + Math.cos(la) * off, y: cy + Math.sin(la) * off, a: la, len: 80 + R() * 25, shade: depth === 0 ? 2 : R() < 0.35 ? 1 : 0 });
        }
      }
    }
    branches.push({ pts, w });
  };
  for (let i = 0; i < 11; i++) grow(0, 0, (i / 11) * Math.PI * 2 + R() * 0.3, CROWN_R * (0.82 + R() * 0.12), 16, 0);
  // keep the hero leaf's neighbourhood free so it reads clearly
  const free = leaves.filter((l) => Math.hypot(l.x - ANCHOR_TREE_LEAF.x, l.y - ANCHOR_TREE_LEAF.y) > 70 && Math.hypot(l.x, l.y) < CROWN_R);
  free.sort((p, q) => q.shade - p.shade);
  return { LEAVES: free, BRANCHES: branches };
})();

export const CrownCanvas: React.FC<{ v: WorldView; opacity: number; blur: number }> = ({ v, opacity, blur }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!, g = c.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, c.width, c.height);
    if (opacity <= 0) return;
    const q = c.width / 1080; // reduced backing store while out of focus (blur hides it, renders 4–16× faster)
    g.setTransform(v.m * q, 0, 0, v.m * q, (CX - v.c.x * v.m) * q, (CY - v.c.y * v.m) * q);
    // soft inner shade of the crown
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, CROWN_R);
    gr.addColorStop(0, "rgba(12,36,22,0.95)"); gr.addColorStop(0.85, "rgba(16,44,28,0.85)"); gr.addColorStop(1, "rgba(16,44,28,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, CROWN_R, 0, Math.PI * 2); g.fill();
    g.lineCap = "round"; g.lineJoin = "round";
    g.save(); g.beginPath(); g.arc(0, 0, CROWN_R * 0.97, 0, Math.PI * 2); g.clip();
    for (const b of BRANCHES) {
      g.beginPath(); b.pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
      g.strokeStyle = "#4a3426"; g.lineWidth = b.w; g.stroke();
      g.strokeStyle = "rgba(160,120,90,0.35)"; g.lineWidth = b.w * 0.35; g.stroke();
    }
    g.restore();
    const x0 = v.c.x - (CX + 150) / v.m, x1 = v.c.x + (CX + 150) / v.m, y0 = v.c.y - (CY + 150) / v.m, y1 = v.c.y + (CY + 150) / v.m;
    const draw = (l: Leaf, sp: HTMLCanvasElement) => {
      if (l.x < x0 || l.x > x1 || l.y < y0 || l.y > y1) return;
      const s = l.len / (sp.width * 0.94);
      g.save(); g.translate(l.x, l.y); g.rotate(l.a); g.scale(s, s);
      g.drawImage(sp, -sp.width / 2, -sp.height / 2);
      g.restore();
    };
    for (const l of LEAVES) draw(l, leafSprite(l.shade));
    // hero leaf (exactly the leaf of world L: length 90, same orientation)
    draw({ x: ANCHOR_TREE_LEAF.x, y: ANCHOR_TREE_LEAF.y, a: Math.atan2(LEAF_U.y, LEAF_U.x), len: 90, shade: 0 }, leafSprite(0));
    g.setTransform(1, 0, 0, 1, 0, 0);
  });
  return (
    <canvas ref={ref} width={lowRes(blur) ? 270 : 1080} height={lowRes(blur) ? 480 : 1920}
      style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity, filter: blur > 0.2 ? `blur(${lowRes(blur) ? Math.max(0.5, blur - 3) : blur}px)` : undefined }} />
  );
};
