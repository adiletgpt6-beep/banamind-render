// LayerCameraController — virtual camera driven only by time. Keyframes are
// orbit coordinates around a target (azimuth, elevation, distance), so
// interpolating them produces arcs and fly-arounds instead of straight
// dolly lines. Channels use monotone cubic (Fritsch–Carlson) interpolation:
// continuous velocity, no overshoot, holds where keyframes repeat.
import * as THREE from "three";

export interface CameraKey {
  t: number;
  target: THREE.Vector3;
  az: number;
  el: number;
  dist: number;
  fov: number;
}
export interface CameraPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

const monotone = (ts: number[], ys: number[]) => {
  const n = ts.length;
  const d: number[] = [];
  const m: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (ts[i + 1] - ts[i]));
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  // ease in / out at both ends of a track
  m[0] = 0;
  m[n - 1] = 0;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i], b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      m[i] = tau * a * d[i];
      m[i + 1] = tau * b * d[i];
    }
  }
  return (t: number) => {
    if (t <= ts[0]) return ys[0];
    if (t >= ts[n - 1]) return ys[n - 1];
    let i = 0;
    while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i];
    const x = (t - ts[i]) / h;
    const x2 = x * x, x3 = x2 * x;
    return (
      (2 * x3 - 3 * x2 + 1) * ys[i] +
      (x3 - 2 * x2 + x) * h * m[i] +
      (-2 * x3 + 3 * x2) * ys[i + 1] +
      (x3 - x2) * h * m[i + 1]
    );
  };
};

export class CameraTrack {
  private ch: ((t: number) => number)[];
  constructor(public readonly keys: CameraKey[]) {
    const ts = keys.map((k) => k.t);
    const get = (f: (k: CameraKey) => number) => monotone(ts, keys.map(f));
    this.ch = [
      get((k) => k.target.x), get((k) => k.target.y), get((k) => k.target.z),
      get((k) => k.az), get((k) => k.el), get((k) => k.dist), get((k) => k.fov),
    ];
  }
  get start() { return this.keys[0].t; }
  get end() { return this.keys[this.keys.length - 1].t; }
  at(t: number): CameraPose {
    const [tx, ty, tz, az, el, dist, fov] = this.ch.map((f) => f(t));
    const target = new THREE.Vector3(tx, ty, tz);
    const position = new THREE.Vector3(
      Math.sin(az) * Math.cos(el),
      Math.sin(el),
      Math.cos(az) * Math.cos(el),
    ).multiplyScalar(dist).add(target);
    return { position, target, fov };
  }
}

export const key = (
  t: number, target: THREE.Vector3, az: number, el: number, dist: number, fov = 30,
): CameraKey => ({ t, target: target.clone(), az, el, dist, fov });

/** Orbit angles of a direction (for "look along this normal" shots). */
export const anglesOf = (dir: THREE.Vector3) => {
  const d = dir.clone().normalize();
  return { az: Math.atan2(d.x, d.z), el: Math.asin(d.y) };
};

/** A THREE camera matching a pose (also used to project 2D labels). */
export const makeCamera = (pose: CameraPose, aspect: number) => {
  const cam = new THREE.PerspectiveCamera(pose.fov, aspect, 0.05, 200);
  cam.position.copy(pose.position);
  cam.lookAt(pose.target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
};
