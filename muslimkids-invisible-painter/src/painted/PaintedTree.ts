// Росток → дерево. Рост — последовательное появление мазков:
// стебель-мазок поднимается и утолщается в ствол, от него по очереди
// «вырисовываются» ветви (каждая — мазок кисти со щетинками), на концах
// растекаются акварельные пятна листвы трёх тонов (тень, средний, свет).
// Никакого масштабирования готовой картинки: каждая часть рождается своим мазком.
// ALIVE: ветви качаются иерархически (ствол неподвижен), листья трепещут.

import { drawStroke, strokeGeom, type StrokeSpec } from "../engines/BrushStrokeEngine";
import { circle, drawWash, type Pt, type WashSpec } from "../engines/WatercolorSimulationEngine";
import { mix, PALETTE } from "../engines/PainterlyLightingSystem";
import { clamp01, lerp, mulberry32, noise3, smooth } from "../utils/noise";

export const ROOT = { x: 300, y: 1590 };
export const TREE_CROWN = { x: 330, y: 700, rx: 400, ry: 430 };

type Branch = {
  id: string;
  spec: StrokeSpec;
  base: Pt;
  tip: Pt;
  depth: number;
  t0: number;
  t1: number;
  parent: number;
  ph: number;
};
type Cluster = { id: string; x: number; y: number; r: number; branch: number; t: number; tone: 0 | 1 | 2 };
type Leaf = { x: number; y: number; a: number; s: number; branch: number; t: number; ph: number };

let TREE: { branches: Branch[]; clusters: Cluster[]; leaves: Leaf[] } | null = null;

const tree = () => {
  if (TREE) return TREE;
  const rng = mulberry32(1234);
  const branches: Branch[] = [];
  const clusters: Cluster[] = [];
  const leaves: Leaf[] = [];
  const trunkPts = [ROOT, { x: 296, y: 1450 }, { x: 308, y: 1300 }, { x: 322, y: 1170 }, { x: 332, y: 1060 }];
  branches.push({
    id: "trunk",
    spec: { id: "tr-trunk", pts: trunkPts, width: 64, color: "#7A5538", color2: PALETTE.brown, bristles: 16, dry: 0.25, opacity: 0.95, taper: [0.02, 0.35], mode: "source-over" },
    base: ROOT,
    tip: trunkPts[4],
    depth: 0,
    t0: 0,
    t1: 0.36,
    parent: -1,
    ph: 0,
  });
  const grow = (parent: number, from: Pt, ang: number, len: number, width: number, depth: number, t0: number) => {
    const n = 4;
    const pts: Pt[] = [from];
    let a = ang, x = from.x, y = from.y;
    for (let i = 1; i < n; i++) {
      a += (rng() - 0.5) * 0.35;
      x += Math.cos(a) * (len / (n - 1));
      y += Math.sin(a) * (len / (n - 1));
      pts.push({ x, y });
    }
    const dur = 0.1 + len / 2600;
    const idx = branches.length;
    branches.push({
      id: `b${idx}`,
      spec: { id: `tr-b${idx}`, pts, width, color: depth > 2 ? "#8A6446" : "#7A5538", color2: PALETTE.brown, bristles: Math.max(5, 12 - depth * 2), dry: 0.3, opacity: 0.92, taper: [0.03, 0.55], mode: "source-over" },
      base: from,
      tip: { x, y },
      depth,
      t0,
      t1: t0 + dur,
      parent,
      ph: rng() * 6,
    });
    const tEnd = t0 + dur;
    if (depth < 3) {
      const kids = depth === 0 ? 3 : 2 + (rng() < 0.5 ? 1 : 0);
      for (let k = 0; k < kids; k++) {
        const along = 0.55 + rng() * 0.4;
        const pi = Math.min(n - 1, Math.round(along * (n - 1)));
        const spread = depth === 0 ? 0.75 : 0.6;
        const na = a + (k - (kids - 1) / 2) * spread + (rng() - 0.5) * 0.3;
        grow(idx, pts[pi], na, len * (0.62 + rng() * 0.15), width * 0.6, depth + 1, t0 + dur * along);
      }
    }
    if (depth >= 1) {
      const cnt = depth === 3 ? 2 : 1;
      for (let c = 0; c < cnt; c++) {
        clusters.push({ id: `cl${clusters.length}`, x: x + (rng() - 0.5) * 70, y: y + (rng() - 0.5) * 60, r: 70 + rng() * 55, branch: idx, t: tEnd + rng() * 0.05, tone: 1 });
      }
      for (let l = 0; l < 3; l++) {
        leaves.push({ x: x + (rng() - 0.5) * 150, y: y + (rng() - 0.5) * 110, a: rng() * 6, s: 12 + rng() * 8, branch: idx, t: tEnd + 0.04 + rng() * 0.06, ph: rng() * 6 });
      }
    }
  };
  const top = trunkPts[4];
  grow(0, trunkPts[2], -Math.PI / 2 - 0.85, 330, 30, 1, 0.17);
  grow(0, trunkPts[3], -Math.PI / 2 + 0.75, 340, 30, 1, 0.23);
  grow(0, top, -Math.PI / 2 - 0.1, 300, 34, 1, 0.3);
  // тени (задние) и светлые (передние) тона кроны
  const base = [...clusters];
  base.forEach((c, i) => {
    clusters.push({ id: `${c.id}-back`, x: c.x + 26, y: c.y + 30, r: c.r * 1.05, branch: c.branch, t: c.t - 0.01, tone: 0 });
    if (i % 2 === 0) clusters.push({ id: `${c.id}-front`, x: c.x - 22, y: c.y - 26, r: c.r * 0.6, branch: c.branch, t: c.t + 0.04, tone: 2 });
  });
  clusters.sort((a, b) => a.tone - b.tone);
  TREE = { branches, clusters, leaves };
  return TREE;
};

export type TreeState = {
  /** рост 0..1 (0 — росток) */
  grow: number;
  sprout: number;
  awaken: number;
  alive: number;
  f: number;
  /** ночь: крона темнеет мягче (для силуэта) */
  dim?: number;
};

const swayOf = (b: Branch, s: TreeState) =>
  b.depth === 0 ? 0 : s.alive * (0.012 + 0.01 * b.depth) * (Math.sin(s.f * 0.055 + b.ph) + 0.5 * noise3(b.ph, s.f * 0.02, 1));

// листва — кроющая гуашь поверх неба и моря (source-over), три тона глубины
const TONES = [
  { colors: ["#2F7462", "#357E66"], op: 0.8 },
  { colors: ["#4E9C5E", "#5AA668", "#459463"], op: 0.8 },
  { colors: ["#A8CC66", "#BCD670"], op: 0.7 },
];

export function drawTree(ctx: CanvasRenderingContext2D, s: TreeState) {
  const T = tree();
  if (s.grow <= 0 && s.sprout <= 0) return;
  const G = s.grow;
  // Росток: тонкий стебель и две семядоли, раскрываются до роста ствола
  const trunk = T.branches[0];
  const stemP = lerp(0.16 * s.sprout, 1, smooth(G / 0.36)) * (G > 0 || s.sprout > 0 ? 1 : 0);
  const thick = lerp(0.1, 1, smooth((G - 0.04) / 0.45));
  // children by parent
  const kids = new Map<number, number[]>();
  T.branches.forEach((b, i) => {
    if (b.parent >= 0) kids.set(b.parent, [...(kids.get(b.parent) ?? []), i]);
  });
  const clByBranch = new Map<number, Cluster[]>();
  T.clusters.forEach((c) => clByBranch.set(c.branch, [...(clByBranch.get(c.branch) ?? []), c]));
  const lvByBranch = new Map<number, Leaf[]>();
  T.leaves.forEach((l) => lvByBranch.set(l.branch, [...(lvByBranch.get(l.branch) ?? []), l]));

  const drawBranch = (i: number) => {
    const b = T.branches[i];
    const p = i === 0 ? stemP : smooth((G - b.t0) / (b.t1 - b.t0));
    if (p <= 0) return;
    ctx.save();
    const sw = swayOf(b, s);
    ctx.translate(b.base.x, b.base.y);
    ctx.rotate(sw);
    ctx.translate(-b.base.x, -b.base.y);
    const wm = i === 0 ? thick : lerp(0.4, 1, smooth((G - b.t0) / 0.4));
    // молодой стебель зелёный, одревесневая — коричневеет
    const wood = smooth((G - (i === 0 ? 0.05 : b.t0)) / 0.3);
    const spec = wood >= 1 ? b.spec : { ...b.spec, color: mix("#5FA070", b.spec.color, wood), color2: mix("#8CB860", PALETTE.brown, wood) };
    drawStroke(ctx, spec, p, { widthMul: wm });
    if (s.awaken > 0 && b.depth < 3) {
      // свет слева — тёплый блик; тень справа
      const off = b.spec.width * wm * 0.22;
      drawStroke(ctx, { ...b.spec, id: `${b.spec.id}-hl`, width: b.spec.width * 0.35, color: "#D9B07A", color2: undefined, bristles: 5, opacity: 0.55 }, p, { dx: -off, alpha: s.awaken, widthMul: wm });
      drawStroke(ctx, { ...b.spec, id: `${b.spec.id}-sh`, width: b.spec.width * 0.4, color: "#4A3A44", color2: undefined, bristles: 5, opacity: 0.5 }, p, { dx: off, alpha: s.awaken, widthMul: wm });
    }
    (kids.get(i) ?? []).forEach(drawBranch);
    const lsway = s.alive;
    (clByBranch.get(i) ?? []).forEach((c) => {
      const cp = smooth((G - c.t) / 0.12);
      if (cp <= 0) return;
      const tone = TONES[c.tone];
      const spec: WashSpec = { id: `tc-${c.id}`, shape: circle(c.x, c.y, c.r, 11, 1.1, 0.92), colors: tone.colors, layers: 9, opacity: tone.op, edge: c.tone === 2 ? 0.1 : 0.35, deform: 0.9, mode: "source-over" };
      const br = 1 + 0.03 * Math.sin(s.f * 0.08 + c.x) * lsway;
      drawWash(ctx, spec, cp, { time: s.f * 0.02, wobble: 0.05, scaleX: br, scaleY: br, alpha: c.tone === 2 ? 0.5 + 0.5 * s.awaken : 1 });
    });
    (lvByBranch.get(i) ?? []).forEach((l) => {
      const lp = smooth((G - l.t) / 0.1);
      if (lp <= 0) return;
      // отдельные листья трепещут на ветру
      const flutter = Math.sin(s.f * 0.21 + l.ph) * 0.45 * lsway;
      drawLeaf(ctx, l.x, l.y, l.s * lp, l.a + flutter, "#4E9C5E", 0.75);
    });
    ctx.restore();
  };
  drawBranch(0);
  // семядоли ростка: раскрываются, затем растворяются в кроне
  const coty = s.sprout * (1 - smooth((G - 0.18) / 0.15));
  if (coty > 0.01) {
    const g = strokeGeom(trunk.spec);
    const head = g.len * stemP;
    let j = 0;
    while (j < g.s.length - 1 && g.s[j] < head) j++;
    const tx = g.xs[j], ty = g.ys[j];
    const open = smooth((s.sprout - 0.35) / 0.5);
    drawLeaf(ctx, tx, ty, 26 * coty, -Math.PI / 2 - 0.25 - open * 0.75, "#5FA070", 0.85);
    drawLeaf(ctx, tx, ty, 24 * coty, -Math.PI / 2 + 0.25 + open * 0.75, "#4E9C5E", 0.85);
  }
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, ang: number, color: string, alpha: number) {
  if (size <= 0.5) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const p = new Path2D();
  p.moveTo(0, 0);
  p.quadraticCurveTo(size * 0.5, -size * 0.42, size * 1.6, 0);
  p.quadraticCurveTo(size * 0.5, size * 0.42, 0, 0);
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fill(p);
  ctx.globalAlpha = alpha * 0.6;
  ctx.strokeStyle = "#2F7E62";
  ctx.lineWidth = Math.max(1, size * 0.07);
  ctx.stroke(p);
  ctx.beginPath();
  ctx.moveTo(size * 0.1, 0);
  ctx.lineTo(size * 1.3, 0);
  ctx.stroke();
  ctx.restore();
}

export const treeTopY = () => Math.min(...tree().clusters.map((c) => c.y - c.r));
void clamp01;
