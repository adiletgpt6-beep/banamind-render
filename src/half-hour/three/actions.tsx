import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { handHold, heldWorld } from "./character";
import { at } from "./poses";
import { bonePos, curlFingers, ik2, orientHand, type Rig } from "./rig";

// Общие действия с предметами: телефон в руке, сумка, кружка, рюкзак.

// Телефон в правой руке: локальная поза относительно запястья.
export const usePhoneHold = (rig: Rig) => useMemo(() => handHold(rig, "R", 0.1, 0.02, 0.014), [rig]);

export const blendM = (a: THREE.Matrix4, b: THREE.Matrix4, k: number) => {
  if (k <= 0) return a;
  if (k >= 1) return b;
  const p1 = new THREE.Vector3(), q1 = new THREE.Quaternion(), s1 = new THREE.Vector3();
  const p2 = new THREE.Vector3(), q2 = new THREE.Quaternion(), s2 = new THREE.Vector3();
  a.decompose(p1, q1, s1);
  b.decompose(p2, q2, s2);
  return new THREE.Matrix4().compose(p1.lerp(p2, k), q1.slerp(q2, k), new THREE.Vector3(1, 1, 1));
};

// Правая рука держит телефон для чтения: ладонь к лицу, пальцы вверх.
export const readPhoneR = (rig: Rig, k: number, from: THREE.Vector3, low = 0) => {
  const head = bonePos(rig, "head");
  const readPos = at(rig, -0.05, head.y - 0.32 - low, 0.3);
  const target = from.clone().lerp(readPos, k);
  ik2(rig, "upperarm01.R", "lowerarm01.R", "wrist.R", target, at(rig, -0.5, head.y - 0.6, -0.1));
  const toFace = head.clone().sub(readPos).normalize();
  const fingerUp = new THREE.Vector3(0, 1, 0).add(toFace.clone().multiplyScalar(-0.5)).normalize();
  const fwd = new THREE.Vector3(0, -0.25, 1).applyQuaternion(rig.root.quaternion).normalize();
  orientHand(rig, "R", fwd.clone().lerp(fingerUp, k).normalize(), new THREE.Vector3(0, -1, 0).lerp(toFace, k).normalize());
  curlFingers(rig, "R", 0.3 + 0.35 * k, 0.1);
  return readPos;
};

// Предмет, висящий на руке (сумка, кружка): начало координат — точка хвата,
// предмет всегда вертикален (висит), повёрнут по направлению персонажа.
export const Hanging: React.FC<{ at: THREE.Vector3; yaw: number; children: React.ReactNode }> = ({ at: p, yaw, children }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    {children}
  </group>
);

export const HandBag: React.FC = () => (
  <group>
    <mesh position={[0, -0.16, 0]} castShadow>
      <boxGeometry args={[0.3, 0.2, 0.11]} />
      <meshStandardMaterial color="#7A4E36" roughness={0.55} />
    </mesh>
    <mesh position={[0, -0.04, 0]} rotation={[0, 0, 0]} castShadow>
      <torusGeometry args={[0.065, 0.008, 8, 24, Math.PI]} />
      <meshStandardMaterial color="#5E3B28" roughness={0.6} />
    </mesh>
  </group>
);

export const Mug: React.FC = () => (
  <mesh position={[0, -0.01, 0]} castShadow>
    <cylinderGeometry args={[0.04, 0.036, 0.1, 20]} />
    <meshStandardMaterial color="#F2F2F2" roughness={0.35} />
  </mesh>
);

// Точка хвата правой/левой кисти (середина ладони) в мире.
export const gripPoint = (rig: Rig, side: "L" | "R") => {
  const m = heldWorld(rig, side, handHold(rig, side, 0.07, 0.02));
  return new THREE.Vector3().setFromMatrixPosition(m);
};

// Отрезок (лямка) между двумя точками: плоская лента.
export const Strap: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; w?: number; color: string }> = ({ a, b, w = 0.035, color }) => {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const len = a.distanceTo(b);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return (
    <mesh position={mid} quaternion={q} castShadow>
      <boxGeometry args={[w, len, 0.008]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
};

// Рюкзак на спине (по костям позвоночника и ключиц), лямки через плечи.
// Возвращает и точку левой лямки на груди — за неё держится рука.
export const backpackStrapFront = (rig: Rig, side: "L" | "R") => {
  const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(rig.root.quaternion);
  const sh = bonePos(rig, `clavicle.${side}`).lerp(bonePos(rig, `upperarm01.${side}`), 0.45);
  return sh.add(fwd.multiplyScalar(0.075)).add(new THREE.Vector3(0, -0.12, 0));
};

export const Backpack: React.FC<{ rig: Rig; color?: string; trim?: string }> = ({ rig, color = "#2F5DA8", trim = "#FFC90E" }) => {
  const bagGeometry = useMemo(() => new RoundedBoxGeometry(0.28, 0.34, 0.14, 5, 0.035), []);
  const pocketGeometry = useMemo(() => new RoundedBoxGeometry(0.22, 0.14, 0.04, 4, 0.016), []);
  const q = rig.root.quaternion;
  const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  const up = new THREE.Vector3(0, 1, 0);
  const s3 = bonePos(rig, "spine03");
  const s5 = bonePos(rig, "spine05");
  const center = s3.clone().lerp(s5, 0.35).add(fwd.clone().multiplyScalar(-0.16)).add(up.clone().multiplyScalar(0.02));
  const lean = -Math.atan2(s3.clone().sub(s5).dot(fwd), s3.y - s5.y);
  const straps: React.ReactNode[] = [];
  for (const side of ["L", "R"] as const) {
    const sh = bonePos(rig, `clavicle.${side}`).lerp(bonePos(rig, `upperarm01.${side}`), 0.45);
    const top = sh.clone().add(up.clone().multiplyScalar(0.04));
    const back = top.clone().add(fwd.clone().multiplyScalar(-0.1)).add(up.clone().multiplyScalar(-0.03));
    const topF = top.clone().add(fwd.clone().multiplyScalar(0.03));
    const front = sh.clone().add(fwd.clone().multiplyScalar(0.075)).add(up.clone().multiplyScalar(-0.06));
    const low = front.clone().add(up.clone().multiplyScalar(-0.15)).add(fwd.clone().multiplyScalar(-0.01));
    straps.push(<Strap key={`${side}1`} a={back} b={topF} color="#1F2F55" />);
    straps.push(<Strap key={`${side}2`} a={topF} b={front} color="#1F2F55" />);
    straps.push(<Strap key={`${side}3`} a={front} b={low} color="#1F2F55" />);
  }
  return (
    <>
      <group position={center} rotation={[lean, rig.root.rotation.y, 0]}>
        <mesh geometry={bagGeometry} castShadow>
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        <mesh geometry={pocketGeometry} position={[0, -0.06, -0.08]} castShadow>
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.05, -0.068]}>
          <boxGeometry args={[0.26, 0.025, 0.005]} />
          <meshStandardMaterial color={trim} roughness={0.5} />
        </mesh>
      </group>
      {straps}
    </>
  );
};
