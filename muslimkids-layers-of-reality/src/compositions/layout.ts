// World layout: every model lives in one shared 3D world, so the camera can
// travel between them and the grand composition reveals them side by side.
import * as THREE from "three";

export const EARTH = {
  position: new THREE.Vector3(0.85, 1.95, -1.5),
  tilt: THREE.MathUtils.degToRad(-23.4),
  radius: 1,
};
export const MOUNTAIN = {
  position: new THREE.Vector3(0.25, -3.05, -1.1),
  scale: 0.7,
  rotationY: 0.38,
};
export const TREE = {
  position: new THREE.Vector3(-1.6, -3.4, 0.55),
  scale: 0.62,
};
export const LEAF = {
  position: new THREE.Vector3(-0.1, -0.35, 0.55),
  rotation: new THREE.Euler(-0.95, 0.0, 0.42),
  scale: 0.95,
};
/** Magnified tissue block, placed beside the leaf (brief: "Увеличенная схема"). */
export const CELLS = {
  position: new THREE.Vector3(0.62, 1.12, 1.55),
  rotation: new THREE.Euler(0.42, -0.62, 0.0),
  scale: 0.52,
};
/** Direction of sunlight (world). */
export const SUN_DIR = new THREE.Vector3(-0.78, 0.38, 0.5).normalize();
