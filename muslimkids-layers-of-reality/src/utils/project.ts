// Projects world points through a track's camera to 1080×1920 pixels, so 2D
// labels stay locked to 3D anchors.
import * as THREE from "three";
import { makeCamera } from "../engines/LayerCameraController";
import { TRACKS, TrackId } from "../compositions/shots";

export const W = 1080, H = 1920;
export const project = (p: THREE.Vector3, track: TrackId, t: number) => {
  const cam = makeCamera(TRACKS[track].at(t), W / H);
  const v = p.clone().project(cam);
  return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H, behind: v.z > 1 };
};
/** Projected radius (px) of a sphere — for screen-space layout. */
export const projectedRadius = (c: THREE.Vector3, r: number, track: TrackId, t: number) => {
  const pose = TRACKS[track].at(t);
  const d = pose.position.distanceTo(c);
  return ((r / d) / Math.tan(THREE.MathUtils.degToRad(pose.fov / 2))) * (H / 2);
};
