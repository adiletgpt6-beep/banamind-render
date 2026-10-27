import React from "react";
import { rng } from "../engines/math";
import { ANCHOR_SECTION_CELL } from "../engines/NestedWorldEngine";

// World X — simplified botanical cross-section of a leaf (units = surface units, top at y = 0):
// cuticle · upper epidermis · palisade mesophyll (columnar cells rich in chloroplasts) ·
// vascular bundle (xylem above, phloem below, bundle sheath) · spongy mesophyll with air spaces ·
// lower epidermis with a stoma and guard cells · cuticle.
export const SECTION_H = 380;
const XMIN = -1100, XMAX = 1100;
const WALL = "#A9E5F2";
const BUNDLE = { x: 0, y: 252, r: 66 };
const STOMA_X = 300;

const G = (() => {
  const R = rng(808);
  const epiU: { x: number; w: number }[] = [];
  for (let x = XMIN; x < XMAX;) { const w = 78 + R() * 22; epiU.push({ x, w }); x += w; }
  const epiL: { x: number; w: number }[] = [];
  for (let x = XMIN; x < XMAX;) {
    let w = 64 + R() * 24;
    if (x < STOMA_X - 30 && x + w > STOMA_X - 30) w = STOMA_X - 30 - x;
    if (x === STOMA_X - 30) { x = STOMA_X + 30; continue; }
    epiL.push({ x, w }); x += w;
  }
  const pal: { x: number; h: number; chl: { x: number; y: number; a: number }[] }[] = [];
  for (let k = -16; k <= 16; k++) {
    const x = ANCHOR_SECTION_CELL.x + 55 * k;
    if (x < XMIN || x > XMAX) continue;
    const h = k === 0 ? 150 : 138 + R() * 14;
    const chl = [];
    for (let i = 0; i < 7; i++) {
      chl.push({ x: x - 15, y: 48 + i * 19 + R() * 4, a: 90 });
      chl.push({ x: x + 15, y: 54 + i * 19 + R() * 4, a: 90 });
    }
    pal.push({ x, h, chl });
  }
  const spongy: { x: number; y: number; rx: number; ry: number; a: number }[] = [];
  let tries = 0;
  while (tries++ < 4000) {
    const x = XMIN + R() * (XMAX - XMIN), y = 205 + R() * 125;
    const rx = 18 + R() * 12, ry = 13 + R() * 8;
    if (Math.hypot(x - BUNDLE.x, y - BUNDLE.y) < BUNDLE.r + 30) continue;
    if (Math.abs(x - STOMA_X) < 45 && y > 290) continue;
    if (spongy.some((s) => Math.hypot(s.x - x, (s.y - y) * 1.3) < s.rx + rx + 6)) continue;
    spongy.push({ x, y, rx, ry, a: R() * 180 });
  }
  const sheath = Array.from({ length: 15 }, (_, i) => {
    const a = (i / 15) * Math.PI * 2;
    return { x: BUNDLE.x + Math.cos(a) * (BUNDLE.r - 12), y: BUNDLE.y + Math.sin(a) * (BUNDLE.r - 14) };
  });
  const xylem = [[-22, -22, 12], [0, -28, 13], [22, -20, 11], [-10, -4, 9], [12, -4, 9]];
  const phloem = Array.from({ length: 9 }, (_, i) => [-24 + (i % 5) * 12, 18 + Math.floor(i / 5) * 12, 5.5]);
  return { epiU, epiL, pal, spongy, sheath, xylem, phloem };
})();

const Chloroplast: React.FC<{ x: number; y: number; a: number; s?: number }> = ({ x, y, a, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s * 0.72})`}>
    <ellipse rx={7.5} ry={4.6} fill="#4EBB84" stroke="#2c8a59" strokeWidth={1} />
    <path d="M -4 -1.5 h3 M 1 -1.5 h3 M -4 1.5 h3 M 1 1.5 h3" stroke="#1f6a42" strokeWidth={1} />
  </g>
);

export const LeafSectionContent: React.FC<{ hideTarget?: number }> = ({ hideTarget = 0 }) => (
  <g>
    <defs>
      <linearGradient id="secBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0f2b40" />
        <stop offset="1" stopColor="#0a1c30" />
      </linearGradient>
    </defs>
    <rect x={XMIN} y={-6} width={XMAX - XMIN} height={SECTION_H + 12} fill="url(#secBg)" />
    {/* cuticles */}
    <rect x={XMIN} y={-6} width={XMAX - XMIN} height={6} fill="#A9E5F2" opacity={0.55} />
    <rect x={XMIN} y={SECTION_H} width={XMAX - XMIN} height={6} fill="#A9E5F2" opacity={0.45} />
    {/* upper epidermis */}
    {G.epiU.map((c, i) => (
      <rect key={i} x={c.x + 1.5} y={2} width={c.w - 3} height={30} rx={8} fill={WALL} fillOpacity={0.08} stroke={WALL} strokeWidth={2.4} />
    ))}
    {/* palisade mesophyll */}
    {G.pal.map((c, i) => (
      <g key={i} opacity={Math.abs(c.x - ANCHOR_SECTION_CELL.x) < 1 ? 1 - hideTarget : 1}>
        <rect x={c.x - 24} y={36} width={48} height={c.h} rx={18} fill="#4EBB84" fillOpacity={0.14} stroke={WALL} strokeWidth={2.4} />
        {c.chl.filter((p) => p.y < 30 + c.h).map((p, j) => <Chloroplast key={j} {...p} />)}
      </g>
    ))}
    {/* spongy mesophyll */}
    {G.spongy.map((s, i) => (
      <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.a})`}>
        <ellipse rx={s.rx} ry={s.ry} fill="#4EBB84" fillOpacity={0.12} stroke={WALL} strokeWidth={2.2} />
        <Chloroplast x={-s.rx * 0.45} y={0} a={90} s={0.8} />
        <Chloroplast x={s.rx * 0.45} y={2} a={80} s={0.8} />
      </g>
    ))}
    {/* vascular bundle */}
    <circle cx={BUNDLE.x} cy={BUNDLE.y} r={BUNDLE.r} fill="#0a1c30" stroke={WALL} strokeOpacity={0.6} strokeWidth={2} />
    {G.sheath.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={11} fill="#4EBB84" fillOpacity={0.12} stroke={WALL} strokeWidth={2} />)}
    {G.xylem.map(([x, y, r], i) => <circle key={i} cx={BUNDLE.x + x} cy={BUNDLE.y + y} r={r} fill="#F4C66A" fillOpacity={0.12} stroke="#F4C66A" strokeOpacity={0.8} strokeWidth={3} />)}
    {G.phloem.map(([x, y, r], i) => <circle key={i} cx={BUNDLE.x + x} cy={BUNDLE.y + y} r={r} fill="#58D6DB" fillOpacity={0.12} stroke="#58D6DB" strokeWidth={1.6} />)}
    {/* lower epidermis + stoma */}
    {G.epiL.map((c, i) => (
      <rect key={i} x={c.x + 1.5} y={SECTION_H - 28} width={c.w - 3} height={26} rx={8} fill={WALL} fillOpacity={0.08} stroke={WALL} strokeWidth={2.4} />
    ))}
    <ellipse cx={STOMA_X - 15} cy={SECTION_H - 14} rx={13} ry={11} fill="#4EBB84" fillOpacity={0.3} stroke={WALL} strokeWidth={2.4} />
    <ellipse cx={STOMA_X + 15} cy={SECTION_H - 14} rx={13} ry={11} fill="#4EBB84" fillOpacity={0.3} stroke={WALL} strokeWidth={2.4} />
  </g>
);
