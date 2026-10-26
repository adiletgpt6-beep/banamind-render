// GeometryCameraController — камера движется только по смыслу.
//
// Камера задаётся ключевыми кадрами (позиция, точка взгляда, угол обзора);
// между ними — плавная интерполяция (smoother-step, без рывков), плюс
// необязательный медленный облёт (orbit) и мягкий параллакс (drift).
// Никаких случайных зумов: все значения детерминированы временем.
import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three";
import { makeTrack, sample, type EaseName, type Track, type Vec3 } from "./GeometryWondersEngine";

export type CameraKey = { t: number; pos: Vec3; target: Vec3; fov?: number; ease?: EaseName };

export type CameraPlan = {
  pos: Track<Vec3>;
  target: Track<Vec3>;
  fov: Track<number>;
};

export function cameraPlan(keys: CameraKey[]): CameraPlan {
  let lastFov = 35;
  return {
    pos: makeTrack(keys.map((k) => ({ t: k.t, v: k.pos, ease: k.ease }))),
    target: makeTrack(keys.map((k) => ({ t: k.t, v: k.target, ease: k.ease }))),
    fov: makeTrack(
      keys.map((k) => {
        lastFov = k.fov ?? lastFov;
        return { t: k.t, v: lastFov, ease: k.ease };
      }),
    ),
  };
}

export function cameraAt(plan: CameraPlan, t: number) {
  return { pos: sample(plan.pos, t), target: sample(plan.target, t), fov: sample(plan.fov, t) };
}

/** Ставит камеру сцены по плану в момент t (секунды ролика). */
export const GeometryCamera: React.FC<{ plan: CameraPlan; t: number; drift?: number }> = ({ plan, t, drift = 0 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const { pos, target, fov } = cameraAt(plan, t);
  useLayoutEffect(() => {
    // Мягкий параллакс: очень медленное «дыхание» камеры.
    const dx = Math.sin(t * 0.35) * drift;
    const dy = Math.sin(t * 0.27 + 1) * drift * 0.6;
    camera.position.set(pos[0] + dx, pos[1] + dy, pos[2]);
    camera.fov = fov;
    camera.near = 0.05;
    camera.far = 400;
    camera.up.set(0, 1, 0);
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateProjectionMatrix();
  });
  return null;
};
