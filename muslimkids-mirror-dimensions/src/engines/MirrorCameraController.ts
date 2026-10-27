// MirrorCameraController: кинематографическая камера по ключевым точкам.
// Позиция и точка взгляда интерполируются кубическими кривыми Эрмита с
// касательными по времени (C1-непрерывная скорость, без рывков на ключах);
// на первом и последнем ключе скорость гасится до нуля. FOV и «крен» —
// плавно. В зеркальных сценах движение камеры напрямую меняет отражения,
// поэтому путь задаётся явно и детерминированно.
import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three";
import { V3, clamp } from "../utils/math";

export type CameraKey = {
  t: number; // секунды
  pos: V3;
  look: V3;
  fov?: number;
  roll?: number; // радианы
};

export type CameraPose = { pos: V3; look: V3; fov: number; roll: number };

const hermite = (p0: number, p1: number, m0: number, m1: number, u: number, dt: number) => {
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * dt * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * dt * m1;
};

const track = (keys: CameraKey[], get: (k: CameraKey) => number, t: number) => {
  const n = keys.length;
  if (t <= keys[0].t) return get(keys[0]);
  if (t >= keys[n - 1].t) return get(keys[n - 1]);
  let i = 0;
  while (i < n - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1];
  const tangent = (j: number) => {
    if (j === 0 || j === n - 1) return 0;
    const p = keys[j - 1], q = keys[j + 1];
    // касательная ограничивается, чтобы не было «перелётов» на неравных отрезках
    const m = (get(q) - get(p)) / (q.t - p.t);
    const s1 = (get(keys[j]) - get(p)) / (keys[j].t - p.t);
    const s2 = (get(q) - get(keys[j])) / (q.t - keys[j].t);
    if (s1 * s2 <= 0) return 0; // экстремум — останавливаемся мягко
    const lim = 3 * Math.min(Math.abs(s1), Math.abs(s2));
    return Math.sign(m) * Math.min(Math.abs(m), lim);
  };
  const dt = b.t - a.t;
  return hermite(get(a), get(b), tangent(i), tangent(i + 1), (t - a.t) / dt, dt);
};

export const sampleCamera = (keys: CameraKey[], t: number): CameraPose => ({
  pos: [0, 1, 2].map((c) => track(keys, (k) => k.pos[c], t)) as V3,
  look: [0, 1, 2].map((c) => track(keys, (k) => k.look[c], t)) as V3,
  fov: track(keys, (k) => k.fov ?? 40, t),
  roll: track(keys, (k) => k.roll ?? 0, t),
});

/** Мягкое «дыхание» ручной камеры — очень малое, детерминированное. */
export const breathe = (t: number, amp = 0.012): V3 => [
  Math.sin(t * 0.61) * amp,
  Math.sin(t * 0.43 + 1.3) * amp * 0.7,
  Math.sin(t * 0.37 + 2.1) * amp * 0.5,
];

export const applyPose = (camera: THREE.PerspectiveCamera, pose: CameraPose, scale = 1) => {
  camera.position.set(pose.pos[0] * scale, pose.pos[1] * scale, pose.pos[2] * scale);
  camera.up.set(Math.sin(pose.roll), Math.cos(pose.roll), 0);
  camera.lookAt(pose.look[0] * scale, pose.look[1] * scale, pose.look[2] * scale);
  camera.fov = clamp(pose.fov, 5, 120);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
};

/** Хук: ставит активную камеру холста в позу на текущий кадр. */
export const useCameraPose = (pose: CameraPose, near = 0.05, far = 800, scale = 1) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.near = near;
    camera.far = far;
    applyPose(camera, pose, scale);
  });
  return camera;
};
