import * as THREE from "three";
import { clamp } from "../utils/math";

/**
 * BookCameraController — плавная кинематографичная камера.
 *
 * Ключи (время, позиция, точка взгляда, fov) интерполируются кубическим
 * сплайном Эрмита с касательными Катмулла–Рома по НЕравномерному времени:
 * скорость непрерывна, камера не останавливается рывками на ключах.
 * На первом и последнем ключе скорость нулевая (мягкий старт/финиш).
 */

export type CamKey = {
  t: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov?: number;
  roll?: number;
};

export type CamPose = { pos: THREE.Vector3; look: THREE.Vector3; fov: number; roll: number };

const vec = (k: CamKey, f: "pos" | "look") => new THREE.Vector3(...k[f]);

const hermite = (p0: number, m0: number, p1: number, m1: number, u: number, dt: number) => {
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * dt * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * dt * m1
  );
};

export const createCameraController = (keys: CamKey[], defaultFov = 34) => {
  const K = [...keys].sort((a, b) => a.t - b.t);
  const scalar = (k: CamKey, ch: string): number => {
    const [f, i] = ch.split(".");
    if (f === "fov") return k.fov ?? defaultFov;
    if (f === "roll") return k.roll ?? 0;
    return (f === "pos" ? k.pos : k.look)[Number(i)];
  };
  const tangent = (i: number, ch: string) => {
    if (i === 0 || i === K.length - 1) return 0;
    return (scalar(K[i + 1], ch) - scalar(K[i - 1], ch)) / (K[i + 1].t - K[i - 1].t);
  };
  const channels = ["pos.0", "pos.1", "pos.2", "look.0", "look.1", "look.2", "fov", "roll"];

  return (t: number): CamPose => {
    if (t <= K[0].t) return { pos: vec(K[0], "pos"), look: vec(K[0], "look"), fov: K[0].fov ?? defaultFov, roll: 0 };
    const last = K[K.length - 1];
    if (t >= last.t) return { pos: vec(last, "pos"), look: vec(last, "look"), fov: last.fov ?? defaultFov, roll: 0 };
    let i = 0;
    while (K[i + 1].t < t) i++;
    const dt = K[i + 1].t - K[i].t;
    const u = clamp((t - K[i].t) / dt);
    const v = channels.map((ch) => hermite(scalar(K[i], ch), tangent(i, ch), scalar(K[i + 1], ch), tangent(i + 1, ch), u, dt));
    return {
      pos: new THREE.Vector3(v[0], v[1], v[2]),
      look: new THREE.Vector3(v[3], v[4], v[5]),
      fov: v[6],
      roll: v[7],
    };
  };
};

/** Камера Three.js в позе — используется и в 3D, и для привязки подписей. */
export const applyPose = (cam: THREE.PerspectiveCamera, pose: CamPose, aspect: number) => {
  cam.position.copy(pose.pos);
  cam.up.set(Math.sin(pose.roll), Math.cos(pose.roll), 0);
  cam.lookAt(pose.look);
  cam.fov = pose.fov;
  cam.aspect = aspect;
  cam.near = 0.05;
  cam.far = 60;
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
};

/** Проекция мировой точки в пиксели кадра (для HTML-подписей). */
export const projectToScreen = (pose: CamPose, p: THREE.Vector3, w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera();
  applyPose(cam, pose, w / h);
  const v = p.clone().project(cam);
  return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, visible: v.z < 1 };
};
