// Shot list: three continuous camera tracks through one shared world.
// Track changes are match-dissolves (Earth surface → mountain massif,
// tree leaf → magnified leaf model), everything else is one camera move.
import * as THREE from "three";
import { anglesOf, CameraTrack, key } from "../engines/LayerCameraController";
import {
  DIVE_TIME, DIVE_VIEW, EARTH_BISECTOR, EARTH_QUAT, TIAN_SHAN, earthSurfacePoint,
} from "../engines/ExplodedViewController";
import { CELLS, EARTH, LEAF, MOUNTAIN, TREE } from "./layout";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const E = EARTH.position;
const bisector = EARTH_BISECTOR.clone().applyQuaternion(EARTH_QUAT);
const earthMid = E.clone().addScaledVector(bisector, 0.8);
const ts = earthSurfacePoint(TIAN_SHAN.lon, TIAN_SHAN.lat, DIVE_TIME);
const dive = anglesOf(DIVE_VIEW);

export const mountainToWorld = (x: number, y: number, z: number) =>
  V(x, y, z)
    .multiplyScalar(MOUNTAIN.scale)
    .applyAxisAngle(V(0, 1, 0), MOUNTAIN.rotationY)
    .add(MOUNTAIN.position);
const M = mountainToWorld(0, 0.2, 0);
const peak = mountainToWorld(0.12, 0.85, 0.3);
const chunk = mountainToWorld(0, 0.6, 1.25);
const treeCrown = TREE.position.clone().add(V(0, 1.15 * TREE.scale, 0));
/** The leaf on the tree the camera singles out (tree-local, see GrowingTree). */
export const TREE_HERO_LEAF_LOCAL = V(0.42, 1.28, 0.62);
const treeLeaf = TREE.position.clone().add(TREE_HERO_LEAF_LOCAL.clone().multiplyScalar(TREE.scale));
const L = LEAF.position;
const leafN = V(0, 0, 1).applyEuler(LEAF.rotation);
const C = CELLS.position;
const G = V(0.12, 0.45, -0.4);
const ending = V(0.2, 1.8, -0.4);

export const TRACKS = {
  earth: new CameraTrack([
    key(0, E, 0.32, 0.2, 13.5),
    key(3.8, E, 0.12, 0.1, 8.7),
    key(5.6, E, 0.05, 0.1, 8.1),
    key(6.8, E, -0.06, 0.08, 8.7),
    key(9.5, E, -0.16, 0.1, 8.9),
    key(11.3, earthMid, -0.04, 0.06, 10.6),
    key(12.9, earthMid, 0.1, 0.1, 10.3),
    key(14.05, E, dive.az, dive.el - 0.04, 7.2),
    key(15.0, ts, dive.az, dive.el, 1.7),
    key(15.9, ts, dive.az, dive.el, 0.62),
  ]),
  mountains: new CameraTrack([
    key(15.0, M, 0.42, 1.28, 3.3, 32),
    key(16.8, M, 0.45, 0.62, 5.6, 32),
    key(18.6, peak, 0.62, 0.3, 3.7, 32),
    key(19.7, M.clone().add(V(0, 0.15, 0.2)), 0.82, 0.3, 5.3, 32),
    key(21.1, chunk, 1.05, 0.22, 6.0, 32),
    key(22.6, chunk, 1.16, 0.26, 5.8, 32),
    key(24.0, M, 0.35, 0.34, 5.6, 32),
    key(25.5, treeCrown, -0.22, 0.14, 2.9, 32),
    key(26.6, treeLeaf, -0.2, 0.12, 1.15, 32),
    key(27.2, treeLeaf, -0.2, 0.12, 0.95, 32),
  ]),
  leaf: new CameraTrack([
    key(26.3, L, -0.15, 0.42, 4.6),
    key(27.7, L, 0.02, 0.5, 6.3),
    key(29.3, L, -0.1, 0.36, 6.5),
    key(30.8, L.clone().addScaledVector(leafN, 0.1).add(V(-0.2, 0, 0)), -0.45, 0.16, 7.6),
    key(31.9, L.clone().lerp(C, 0.5), -0.42, 0.2, 6.6),
    key(33.3, C, -0.22, 0.26, 4.7),
    key(34.5, C, -0.12, 0.26, 4.8),
    key(35.6, L, -0.25, 0.22, 7.0),
    key(37.6, G, 0.14, 0.12, 13.0, 36),
    key(40.2, G, -0.12, 0.1, 13.4, 36),
    key(42.9, G.clone().add(V(0, 1.75, 0)), -0.05, 0.08, 17.0, 36),
    key(44.8, G.clone().add(V(0, 1.8, 0)), 0.0, 0.08, 17.2, 36),
    key(53.0, G.clone().add(V(0, 1.8, 0)), 0.04, 0.08, 17.5, 36),
    key(54.6, ending, 0.3, -0.06, 9.4, 34),
    key(57.4, ending, 0.22, -0.04, 10.2, 34),
    key(60.0, ending, 0.18, -0.03, 11.0, 34),
  ]),
};
export type TrackId = keyof typeof TRACKS;

/** Which tracks are on screen and with what opacity (match-dissolves). */
export const activeTracks = (t: number): { id: TrackId; opacity: number }[] => {
  const out: { id: TrackId; opacity: number }[] = [];
  const x1 = THREE.MathUtils.smoothstep(t, 15.05, 15.85);
  const x2 = THREE.MathUtils.smoothstep(t, 26.35, 27.15);
  if (t < 15.9) out.push({ id: "earth", opacity: 1 });
  if (t >= 15.0 && t < 27.2) out.push({ id: "mountains", opacity: t < 15.9 ? x1 : 1 });
  if (t >= 26.3) out.push({ id: "leaf", opacity: t < 27.2 ? x2 : 1 });
  return out;
};

export interface Visibility {
  earth: boolean; mountain: boolean; tree: boolean; leaf: boolean; cells: boolean;
}
export const visibility = (track: TrackId, t: number): Visibility => {
  if (track === "earth") return { earth: true, mountain: false, tree: false, leaf: false, cells: false };
  if (track === "mountains") return { earth: false, mountain: true, tree: true, leaf: false, cells: false };
  const grand = t > 34.8;
  return { earth: grand, mountain: grand, tree: grand, leaf: true, cells: t > 31.0 && t < 35.8 };
};
