import React from "react";
import { Delaunay } from "d3-delaunay";
import { rng } from "../engines/math";
import { VEIN_DIR } from "../engines/NestedWorldEngine";

// World S — the leaf surface magnified (simplified botany, top view):
// pavement cells of the epidermis with wavy walls, stomata (pairs of guard cells),
// a network of minor veins enclosing areoles, and the secondary vein that runs under the drop.
const EXT = { x: 1500, y: 2000 };

const voronoiCells = (seed: number, step: number, jitter: number) => {
  const R = rng(seed), pts: [number, number][] = [];
  for (let y = -EXT.y; y <= EXT.y; y += step) for (let x = -EXT.x; x <= EXT.x; x += step)
    pts.push([x + (R() - 0.5) * step * jitter, y + (R() - 0.5) * step * jitter]);
  const v = Delaunay.from(pts).voronoi([-EXT.x, -EXT.y, EXT.x, EXT.y]);
  return { pts, v, R };
};

const GEO = (() => {
  // pavement cells: wavy (jigsaw) walls
  const { pts, v, R } = voronoiCells(91, 86, 0.8);
  // cells are bucketed into tiles so only the visible part of the surface is emitted
  const TILE = 300;
  const tiles = new Map<string, { x: number; y: number; shades: string[]; walls: string }>();
  const tileOf = (x: number, y: number) => {
    const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE), k = `${tx},${ty}`;
    if (!tiles.has(k)) tiles.set(k, { x: tx * TILE, y: ty * TILE, shades: ["", "", ""], walls: "" });
    return tiles.get(k)!;
  };
  const stomata: { x: number; y: number; a: number }[] = [];
  const veinN = { x: -VEIN_DIR.y, y: VEIN_DIR.x };
  for (let i = 0; i < pts.length; i++) {
    const poly = v.cellPolygon(i);
    if (!poly) continue;
    let d = `M${poly[0][0].toFixed(1)} ${poly[0][1].toFixed(1)}`;
    for (let k = 1; k < poly.length; k++) {
      const [x0, y0] = poly[k - 1], [x1, y1] = poly[k];
      const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      const w = Math.min(9, L * 0.16) * ((i + k) % 2 ? 1 : -1);
      d += ` C${(x0 + dx * 0.33 + nx * w).toFixed(1)} ${(y0 + dy * 0.33 + ny * w).toFixed(1)} ${(x0 + dx * 0.66 - nx * w).toFixed(1)} ${(y0 + dy * 0.66 - ny * w).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    d += "Z";
    const [px, py] = pts[i];
    const tile = tileOf(px, py);
    tile.shades[i % 3] += d;
    tile.walls += d;
    const dv = Math.abs(px * veinN.x + py * veinN.y);
    if (dv > 120 && R() < 0.1) stomata.push({ x: px + (R() - 0.5) * 30, y: py + (R() - 0.5) * 30, a: R() * 180 });
  }
  // minor veins (areoles ~360 units, matching the leaf's tertiary network seen at 1/8)
  const mv = voronoiCells(57, 360, 0.9);
  let minor = "";
  for (let i = 0; i < mv.pts.length; i++) {
    const poly = mv.v.cellPolygon(i);
    if (poly) minor += "M" + poly.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L") + "Z";
  }
  // elongated cells along the major vein
  let veinCells = "";
  const VR = rng(5);
  for (let s = -2400; s < 2400; s += 60 + VR() * 30) for (const o of [-20, 0, 20]) {
    const a = { x: VEIN_DIR.x * s + veinN.x * o, y: VEIN_DIR.y * s + veinN.y * o };
    veinCells += `M${a.x.toFixed(1)} ${a.y.toFixed(1)} l${(veinN.x * 10).toFixed(1)} ${(veinN.y * 10).toFixed(1)}`;
  }
  return { tiles: [...tiles.values()], TILE, stomata, minor, veinCells };
})();

const VEIN_ANGLE = (Math.atan2(VEIN_DIR.y, VEIN_DIR.x) * 180) / Math.PI;

export type View = { x0: number; y0: number; x1: number; y1: number };
const inView = (v: View | undefined, x0: number, y0: number, x1: number, y1: number) =>
  !v || (x1 >= v.x0 && x0 <= v.x1 && y1 >= v.y0 && y0 <= v.y1);

export const LeafSurfaceContent: React.FC<{ id: string; view?: View }> = ({ id, view }) => {
  const pad = 140;
  const tiles = GEO.tiles.filter((t) => inView(view, t.x - pad, t.y - pad, t.x + GEO.TILE + pad, t.y + GEO.TILE + pad));
  return (
  <g>
    <defs>
      <linearGradient id={`${id}bg`} x1="0" y1="-1" x2="0.4" y2="1">
        <stop offset="0" stopColor="#62bf6c" />
        <stop offset="1" stopColor="#3b8f56" />
      </linearGradient>
      <linearGradient id={`${id}vein`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2f7a45" />
        <stop offset="0.35" stopColor="#bfe39a" />
        <stop offset="0.55" stopColor="#d7f0a8" />
        <stop offset="1" stopColor="#2f7a45" />
      </linearGradient>
    </defs>
    <rect x={-EXT.x} y={-EXT.y} width={EXT.x * 2} height={EXT.y * 2} fill={`url(#${id}bg)`} />
    {tiles.map((t, i) => (
      <g key={i}>
        <path d={t.shades[0]} fill="#6cc874" fillOpacity={0.45} />
        <path d={t.shades[1]} fill="#3f9a5a" fillOpacity={0.35} />
        <path d={t.shades[2]} fill="#86d68a" fillOpacity={0.25} />
        <path d={t.walls} fill="none" stroke="#d9f5c4" strokeOpacity={0.55} strokeWidth={3.2} />
      </g>
    ))}
    {GEO.stomata.filter((s) => inView(view, s.x - 30, s.y - 30, s.x + 30, s.y + 30)).map((s, i) => (
      <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.a})`}>
        <ellipse rx={20} ry={13} fill="#2f7a45" fillOpacity={0.5} />
        <ellipse cx={-6} rx={7} ry={14} fill="#8fd38a" stroke="#e6f8d4" strokeWidth={1.6} />
        <ellipse cx={6} rx={7} ry={14} fill="#8fd38a" stroke="#e6f8d4" strokeWidth={1.6} />
        <ellipse rx={1.6} ry={9} fill="#123d24" />
      </g>
    ))}
    <path d={GEO.minor} fill="none" stroke="#2d7445" strokeOpacity={0.55} strokeWidth={30} strokeLinejoin="round" />
    <path d={GEO.minor} fill="none" stroke="#b7e295" strokeOpacity={0.75} strokeWidth={14} strokeLinejoin="round" />
    <g transform={`rotate(${VEIN_ANGLE})`}>
      <rect x={-2600} y={-36} width={5200} height={72} fill={`url(#${id}vein)`} />
      <rect x={-2600} y={-36} width={5200} height={72} fill="none" stroke="#215c36" strokeOpacity={0.5} strokeWidth={3} />
    </g>
    <path d={GEO.veinCells} stroke="#2f7a45" strokeOpacity={0.35} strokeWidth={2} />
  </g>
  );
};
