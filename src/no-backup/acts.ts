import * as THREE from "three";
import { handHold, heldWorld } from "./three/character";
import { at, dims } from "./three/poses";
import { bonePos, curlFingers, ik2, orientHand, type Rig } from "./three/rig";

// Действия персонажей ролика (поверх поз из three/poses): телефон у уха,
// чтение телефона любой рукой, рука на плече, ладонь к ладони.

type Side = "L" | "R";
const sgn = (s: Side) => (s === "L" ? 1 : -1);
const dirL = (rig: Rig, x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(rig.root.quaternion).normalize();

// Телефон в руке: локальная поза (как usePhoneHold в three/actions, но для
// любой руки).
export const phoneHold = (rig: Rig, side: Side) => handHold(rig, side, 0.1, 0.02, side === "R" ? 0.014 : -0.014);
export const phoneMatrix = (rig: Rig, side: Side) => heldWorld(rig, side, phoneHold(rig, side));

// Телефон у уха (k 0..1 — подъём от текущего положения кисти). Экран к щеке,
// пальцы вверх-вперёд, локоть вниз-в сторону.
export const phoneToEar = (rig: Rig, side: Side, k: number) => {
  if (k <= 0) return;
  const sx = sgn(side);
  const head = bonePos(rig, "head");
  const d = dims(rig);
  const ear = at(rig, sx * 0.082 * d.scale, head.y + 0.02 * d.scale, 0.01);
  const finger = dirL(rig, -sx * 0.15, 0.85, 0.5);
  const palm = dirL(rig, -sx, 0, -0.1);
  const wrist = ear.clone().sub(finger.clone().multiplyScalar(0.1)).sub(palm.clone().multiplyScalar(0.03));
  const from = bonePos(rig, `wrist.${side}`);
  ik2(rig, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, from.lerp(wrist, k), at(rig, sx * 0.55, head.y - 0.55, -0.15));
  const down = dirL(rig, 0, -1, 0.15);
  const side0 = dirL(rig, -sx, 0, 0);
  orientHand(rig, side, down.lerp(finger, k).normalize(), side0.lerp(palm, k).normalize());
  curlFingers(rig, side, 0.25 + 0.2 * k, 0.25);
};

// Телефон перед собой (чтение): side — рука; low — ниже на столько метров.
export const phoneRead = (rig: Rig, side: Side, k: number, low = 0, out = 0.3) => {
  if (k <= 0) return;
  const sx = sgn(side);
  const head = bonePos(rig, "head");
  const readPos = at(rig, sx * 0.05, head.y - 0.32 - low, out);
  const from = bonePos(rig, `wrist.${side}`);
  ik2(rig, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, from.lerp(readPos, k), at(rig, sx * 0.5, head.y - 0.6, -0.1));
  const toFace = head.clone().sub(readPos).normalize();
  const fingerUp = new THREE.Vector3(0, 1, 0).add(toFace.clone().multiplyScalar(-0.5)).normalize();
  const fwd = dirL(rig, 0, -0.25, 1);
  orientHand(rig, side, fwd.lerp(fingerUp, k).normalize(), new THREE.Vector3(0, -1, 0).lerp(toFace, k).normalize());
  curlFingers(rig, side, 0.12 * k, 0.35 * k);
};

// Кисть на плече другого персонажа (сверху). k 0..1.
export const handOnShoulder = (rig: Rig, side: Side, other: Rig, otherSide: Side, k: number) => {
  if (k <= 0) return;
  const od = dims(other);
  const sh = at(other, sgn(otherSide) * 0.13 * od.scale, od.shoulder + 0.035, -0.01);
  const w0 = bonePos(rig, `wrist.${side}`);
  const toward = sh.clone().sub(bonePos(rig, "spine03")).setY(0).normalize();
  const wT = sh.clone().sub(toward.clone().multiplyScalar(0.075)).add(new THREE.Vector3(0, 0.015, 0));
  ik2(rig, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, w0.lerp(wT, k), at(rig, sgn(side) * 0.5, 0.5, -0.2));
  const fdir = sh.clone().sub(bonePos(rig, `wrist.${side}`)).setY(-0.04).normalize();
  orientHand(rig, side, fdir, new THREE.Vector3(0, -1, 0));
  curlFingers(rig, side, 0.4 * k, 0.25);
};

// Два персонажа держатся за руки: обе кисти — в общей точке p (мир).
export const holdHandAt = (rig: Rig, side: Side, p: THREE.Vector3, k: number) => {
  if (k <= 0) return;
  const sx = sgn(side);
  const w0 = bonePos(rig, `wrist.${side}`);
  const wT = p.clone().add(new THREE.Vector3(0, 0.05, 0));
  ik2(rig, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, w0.lerp(wT, k), at(rig, sx * 0.4, 0.3, -0.4));
  const to = p.clone().sub(bonePos(rig, `upperarm01.${side}`)).setY(0).normalize();
  orientHand(rig, side, new THREE.Vector3(0, -1, 0).lerp(to, 0.35).normalize(), dirL(rig, -sx, 0, 0));
  curlFingers(rig, side, 0.55 * k, 0.4);
};

// Пальцы девочки на лямках рюкзака (поправляет). pull 0..1 — тянет вниз.
export const strapsHands = (rig: Rig, k: number, pull: number, strap: (s: Side) => THREE.Vector3) => {
  if (k <= 0) return;
  for (const side of ["L", "R"] as const) {
    const sx = sgn(side);
    const p = strap(side).add(new THREE.Vector3(0, -0.05 - pull * 0.04, 0)).add(dirL(rig, 0, 0, 0.03));
    const w0 = bonePos(rig, `wrist.${side}`);
    ik2(rig, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, w0.lerp(p.clone().add(new THREE.Vector3(0, -0.06, 0)), k), at(rig, sx * 0.45, 0.6, -0.1));
    orientHand(rig, side, new THREE.Vector3(0, 1, 0).lerp(dirL(rig, -sx * 0.3, 0.8, 0.2), k).normalize(), dirL(rig, 0, 0, -1));
    curlFingers(rig, side, 0.75 * k, 0.4);
  }
};

// Мировая матрица → позиция.
export const posOf = (m: THREE.Matrix4) => new THREE.Vector3().setFromMatrixPosition(m);
