import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { designCharacter } from "./design";
import { makeRig, type Rig } from "./rig";

export type Who = "mom" | "son" | "husband" | "colleague" | "teacher" | "boss" | "girl" | "parent";

// The boy's source skeleton has teenage leg proportions. Shorten the thigh,
// shin and foot chain and lower the whole skeleton by the same amount so the
// feet stay on the floor; recompute the bind inverses for the new rest pose.
// Returns the design scale measured before the change, so the head and body
// keep their size.
const shortenLegs = (o: THREE.Object3D, k: number) => {
  o.updateMatrixWorld(true);
  const bone = (n: string) => o.getObjectByName(n) as THREE.Bone;
  const local = (n: string) => o.worldToLocal(bone(n).getWorldPosition(new THREE.Vector3()));
  const scale = local("head").y / 1.5;
  const before = local("footL").y;
  for (const side of ["L", "R"]) for (const n of ["upperleg02", "lowerleg01", "lowerleg02", "foot"]) bone(n + side).position.multiplyScalar(k);
  o.updateMatrixWorld(true);
  const delta = local("footL").y - before;
  const root = bone("root");
  const w = root.getWorldPosition(new THREE.Vector3());
  w.y -= delta * o.getWorldScale(new THREE.Vector3()).y;
  root.position.copy(root.parent!.worldToLocal(w));
  o.updateMatrixWorld(true);
  o.traverse((m) => { if ((m as THREE.SkinnedMesh).isSkinnedMesh) (m as THREE.SkinnedMesh).skeleton.calculateInverses(); });
  return scale;
};

// Персонаж: загружается один раз, клонируется на экземпляр компонента.
export const useCharacter = (who: Who): Rig => {
  const gltf = useLoader(GLTFLoader, staticFile(`models/${who}.glb`), (loader) => {
    // Only the skeleton is reused. The hidden source meshes' embedded texture
    // images are irrelevant to our procedural materials and need no decoding.
    loader.register(() => ({
      name: "BalaGo-rig-only",
      loadTexture: () => Promise.resolve(new THREE.Texture()),
    }));
  });
  return useMemo(() => {
    console.log(`3D rig ready: ${who}`);
    const o = clone(gltf.scene);
    const scale = who === "son" ? shortenLegs(o, 0.8) : undefined;
    const rig = makeRig(o, { scale });
    designCharacter(rig, who);
    return rig;
  }, [gltf, who]);
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
