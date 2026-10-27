import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { stylizeCharacter } from "./materials";
import { makeRig, type Rig } from "./rig";

export type Who = "mom" | "mom_out" | "husband" | "girl" | "grandma" | "colleague";

// Персонаж: загружается один раз, клонируется на экземпляр компонента.
export const useCharacter = (who: Who): Rig => {
  const gltf = useLoader(GLTFLoader, staticFile(`models/${who}.glb`));
  return useMemo(() => {
    const o = clone(gltf.scene);
    stylizeCharacter(o);
    return makeRig(o);
  }, [gltf]);
};

// Предмет «в руке»: локальная поза относительно кости запястья, построенная
// по осям кисти (пальцы, ладонь). along — вдоль пальцев, out — от ладони.
export const handHold = (
  rig: Rig,
  side: "L" | "R",
  along: number,
  out: number,
  across = 0,
) => {
  const ax = rig.hand[side];
  const f = ax.finger.clone();
  const p = ax.palm.clone().sub(f.clone().multiplyScalar(ax.palm.dot(f))).normalize();
  const c = new THREE.Vector3().crossVectors(f, p).normalize();
  const pos = f.clone().multiplyScalar(along).add(p.clone().multiplyScalar(out)).add(c.clone().multiplyScalar(across));
  // предмет: +Y — вдоль пальцев, +Z (экран) — от ладони наружу (телефон
  // лежит тыльной стороной на ладони, экран смотрит туда же, куда ладонь)
  const zAxis = p.clone();
  const xAxis = new THREE.Vector3().crossVectors(f, zAxis).normalize();
  const m = new THREE.Matrix4().makeBasis(xAxis, f, zAxis);
  const quat = new THREE.Quaternion().setFromRotationMatrix(m);
  return { pos, quat };
};

// Мировая матрица предмета в руке (для плавной передачи «стол → рука»).
export const heldWorld = (rig: Rig, side: "L" | "R", hold: { pos: THREE.Vector3; quat: THREE.Quaternion }) => {
  const w = rig.bones[`wrist${side}`];
  w.updateMatrixWorld(true);
  const local = new THREE.Matrix4().compose(hold.pos, hold.quat, new THREE.Vector3(1, 1, 1));
  return w.matrixWorld.clone().multiply(local);
};

export const Character: React.FC<{ rig: Rig }> = ({ rig }) => <primitive object={rig.root} />;
