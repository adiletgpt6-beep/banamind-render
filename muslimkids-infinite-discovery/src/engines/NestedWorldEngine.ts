// NestedWorldEngine — multi-scale scene graph.
//
// Every "world" (forest, tree crown, leaf, leaf surface, leaf section, cell) has its own
// local coordinate system. A child world sits at `anchor` inside its parent and is `1/ratio`
// of the parent's unit. Given the journey depth J we compute, for every world at once,
// its on-screen scale m = 2^(J - base) and its camera centre C (in local units), keeping
// the invariant  C_parent = anchor + C_child / ratio  so all visible worlds stay glued
// together while one cross-fades into the next (Level of Detail).
//
// The leaf surface → leaf cross-section step cannot be a zoom (top view vs. side view), so it
// is a "flip": inside that J range the scale freezes and the block-diagram rotates.
import { clamp, easeInOutSine, lerpV, smootherstep, smoothstep, v2, Vec2, window4 } from "./math";
import { CX, CY } from "./InfiniteCameraEngine";

export type WorldId = "F" | "T" | "L" | "S" | "X" | "C";

type World = {
  id: WorldId;
  base: number; // J at which the world is drawn at scale 1
  parent?: WorldId;
  anchor?: Vec2; // origin of this world in parent coordinates
  ratio?: number; // parent unit / child unit
  /** camera centre while this world "drives" the camera, as function of J */
  drive?: [number, number, (J: number) => Vec2];
};

// ---- the story's worlds (units: 1 unit = 1 px at scale 1) ----
export const ANCHOR_FOREST_TREE = v2(60, -40);
export const ANCHOR_TREE_LEAF = v2(120, -150);
export const ANCHOR_LEAF_DROP = v2(70, -40);
export const DROP_RADIUS_LEAF = 80; // drop radius in leaf units
/** cut point on the leaf surface (where the section is taken), in surface units */
export const SURFACE_CUT = v2(36, -135);
/** direction of the secondary vein that runs under the drop (leaf + surface coordinates) */
export const VEIN_DIR = v2(0.26, -0.965);
export const SECTION_MID_Y = 190;
export const ANCHOR_SECTION_CELL = v2(-187, 105);

export const FLIP_J0 = 20.2;
export const FLIP_J1 = 22.2;

const ease = (a: number, b: number, J: number) => easeInOutSine(clamp((J - a) / (b - a)));

const WORLDS: World[] = [
  { id: "F", base: 10.0, drive: [-Infinity, 13.0, (J) => lerpV(v2(0, 0), ANCHOR_FOREST_TREE, ease(9.6, 13.0, J))] },
  { id: "T", base: 13.0, parent: "F", anchor: ANCHOR_FOREST_TREE, ratio: 8,
    drive: [13.0, 16.32, (J) => lerpV(v2(0, 0), ANCHOR_TREE_LEAF, ease(13.0, 16.32, J))] },
  { id: "L", base: 16.32, parent: "T", anchor: ANCHOR_TREE_LEAF, ratio: 10,
    drive: [16.32, 19.32, (J) => lerpV(v2(0, 0), ANCHOR_LEAF_DROP, ease(16.32, 19.0, J))] },
  { id: "S", base: 19.32, parent: "L", anchor: ANCHOR_LEAF_DROP, ratio: 8,
    drive: [19.32, Infinity, (J) => lerpV(v2(0, 0), SURFACE_CUT, ease(19.5, FLIP_J0, J))] },
  // second chain (side view)
  { id: "X", base: 21.32, drive: [-Infinity, 24.64, (J) => lerpV(v2(0, SECTION_MID_Y), v2(ANCHOR_SECTION_CELL.x, ANCHOR_SECTION_CELL.y - 17), ease(22.3, 24.3, J))] },
  { id: "C", base: 24.64, parent: "X", anchor: ANCHOR_SECTION_CELL, ratio: 10,
    drive: [24.64, Infinity, () => v2(0, 0)] },
];
const byId = Object.fromEntries(WORLDS.map((w) => [w.id, w])) as Record<WorldId, World>;
const CHAINS: WorldId[][] = [["F", "T", "L", "S"], ["X", "C"]];

export type WorldView = { m: number; c: Vec2 };
export type WorldState = Record<WorldId, WorldView> & {
  J: number;
  flip: number; // 0 = surface view, 1 = section view
  /** world opacities (LOD cross-fades) */
  alpha: Record<WorldId | "earth" | "clouds", number>;
};

const chainState = (chain: WorldId[], J: number) => {
  const out = {} as Record<WorldId, WorldView>;
  // find driver
  let di = 0;
  chain.forEach((id, i) => {
    const d = byId[id].drive!;
    if (J >= d[0] && J < d[1]) di = i;
  });
  const drv = byId[chain[di]];
  out[drv.id] = { m: Math.pow(2, J - drv.base), c: drv.drive![2](J) };
  for (let i = di - 1; i >= 0; i--) {
    const child = byId[chain[i + 1]], w = byId[chain[i]];
    const cc = out[child.id].c;
    out[w.id] = { m: Math.pow(2, J - w.base), c: v2(child.anchor!.x + cc.x / child.ratio!, child.anchor!.y + cc.y / child.ratio!) };
  }
  for (let i = di + 1; i < chain.length; i++) {
    const w = byId[chain[i]], pc = out[chain[i - 1]].c;
    out[w.id] = { m: Math.pow(2, J - w.base), c: v2((pc.x - w.anchor!.x) * w.ratio!, (pc.y - w.anchor!.y) * w.ratio!) };
  }
  return out;
};

export const worldState = (J: number): WorldState => {
  const flip = smootherstep(FLIP_J0, FLIP_J1, J);
  const a = chainState(CHAINS[0], Math.min(J, FLIP_J0));
  const xJ = Math.max(J, FLIP_J1);
  const b = chainState(CHAINS[1], xJ);
  if (J < FLIP_J1) {
    // during the flip the section keeps the surface's scale; camera pans down to the section middle
    b.X = { m: a.S.m, c: v2(0, SECTION_MID_Y * flip) };
  }
  const alpha = {
    earth: 1 - smoothstep(9.3, 10.0, J),
    clouds: window4(4.2, 5.2, 9.0, 9.6, J),
    F: window4(8.5, 9.5, 17.6, 18.5, J),
    T: window4(11.4, 12.4, 17.6, 18.6, J),
    L: window4(14.6, 15.4, 19.3, 19.8, J),
    S: J < FLIP_J1 ? 1 : 0,
    X: J > FLIP_J0 ? 1 : 0,
    C: smoothstep(23.2, 23.9, J),
  };
  return { ...a, ...b, J, flip, alpha };
};

/** world → screen */
export const toScreen = (v: WorldView, p: Vec2): Vec2 => ({ x: (p.x - v.c.x) * v.m + CX, y: (p.y - v.c.y) * v.m + CY });
export const svgTransform = (v: WorldView) =>
  `translate(${CX} ${CY}) scale(${v.m}) translate(${-v.c.x} ${-v.c.y})`;
