// Реестр отражающих поверхностей сцены: во время отражённого прохода одного
// зеркала остальные скрываются, чтобы не показывать «вчерашний» кадр
// (взаимные отражения строит только InfiniteReflectionEngine — явно и детерминированно).
import * as THREE from "three";

const KEY = "__mirrorSurfaces";

export const registerSurface = (scene: THREE.Scene, obj: THREE.Object3D) => {
  const set: Set<THREE.Object3D> = (scene.userData[KEY] ??= new Set());
  set.add(obj);
  return () => set.delete(obj);
};

export const allSurfaces = (scene: THREE.Scene): THREE.Object3D[] => [...((scene.userData[KEY] as Set<THREE.Object3D>) ?? [])];
