import * as THREE from "three";

// Риг персонажа MakeHuman (скелет default, 163 кости) — позы как чистая
// функция кадра. Каждый кадр: сброс в исходную позу → операции в мировых
// координатах (наклоны, взгляд, IK рук и ног, пальцы). Локальные оси костей
// не важны: повороты задаются в мире и пересчитываются в локальные.

export type Rig = {
  readonly root: THREE.Object3D; // объект персонажа (позиция/поворот в сцене)
  readonly bones: Record<string, THREE.Bone>;
  readonly rest: Record<string, THREE.Quaternion>;
  readonly meshes: THREE.Mesh[];
  // локальные оси кисти: направление пальцев и нормаль ладони (в осях кости)
  readonly hand: Record<"L" | "R", { finger: THREE.Vector3; palm: THREE.Vector3 }>;
  // направление взгляда глазного яблока в осях кости глаза (исходная поза)
  readonly eyeFwd: Record<string, THREE.Vector3>;
  // These proportions are measured once in the bind pose. They must not
  // shrink when a character sits, or change when the root turns sideways.
  readonly proportions: { hipW: number; scale: number };
  readonly gaze: { x: number; y: number };
  expression?: (values: Record<string, number>) => void;
};

const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const q1 = new THREE.Quaternion();
const q2 = new THREE.Quaternion();
const q3 = new THREE.Quaternion();

// GLTFLoader убирает из имён узлов точки и др. символы: «upperarm01.L» →
// «upperarm01L». Все обращения к костям идут через san().
const san = (n: string) => n.replace(/[[\].:/]/g, "");

export const makeRig = (root: THREE.Object3D): Rig => {
  const bones: Record<string, THREE.Bone> = {};
  const rest: Record<string, THREE.Quaternion> = {};
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => {
    if ((o as THREE.Bone).isBone) {
      bones[san(o.name)] = o as THREE.Bone;
      rest[san(o.name)] = o.quaternion.clone();
    }
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
  });
  root.updateMatrixWorld(true);
  const hand = { L: handAxes(bones, "L"), R: handAxes(bones, "R") };
  const eyeFwd: Record<string, THREE.Vector3> = {};
  const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion()));
  for (const n of ["eyeL", "eyeR"]) {
    const b = bones[n];
    if (b) eyeFwd[n] = fwd.clone().applyQuaternion(b.getWorldQuaternion(new THREE.Quaternion()).invert()).normalize();
  }
  const toRoot = (name: string) => root.worldToLocal(new THREE.Vector3().setFromMatrixPosition(bones[name].matrixWorld));
  const hipW = toRoot("upperleg01L").distanceTo(toRoot("upperleg01R")) / 2;
  const proportions = { hipW, scale: toRoot("head").y / 1.5 };
  return { root, bones, rest, meshes, hand, eyeFwd, proportions, gaze: { x: 0, y: 0 } };
};

// Оси кисти в исходной позе: пальцы — от запястья к основанию среднего
// пальца; ладонь — нормаль к плоскости (указательный–мизинец × пальцы),
// направленная внутрь ладони. Переводятся в локальные оси кости запястья.
function handAxes(bones: Record<string, THREE.Bone>, side: "L" | "R") {
  const w = bones[`wrist${side}`];
  const p = (n: string) => new THREE.Vector3().setFromMatrixPosition(bones[n].matrixWorld);
  const finger = p(`finger3-1${side}`).sub(p(`wrist${side}`)).normalize();
  const across = p(`finger5-1${side}`).sub(p(`finger2-1${side}`)).normalize();
  // руки зеркальны: для правой порядок множителей обратный
  let palm = side === "R" ? new THREE.Vector3().crossVectors(finger, across) : new THREE.Vector3().crossVectors(across, finger);
  palm = palm.normalize();
  const inv = w.getWorldQuaternion(new THREE.Quaternion()).invert();
  return { finger: finger.applyQuaternion(inv).normalize(), palm: palm.applyQuaternion(inv).normalize() };
}

// Ориентировать кисть: пальцы — по fingerDir, ладонь — по palmDir (векторы
// в мире). Остальное (запястье/предплечье) — через IK.
export const orientHand = (rig: Rig, side: "L" | "R", fingerDir: THREE.Vector3, palmDir: THREE.Vector3, amount = 1) => {
  if (amount <= 0 || fingerDir.lengthSq() < 1e-8 || palmDir.lengthSq() < 1e-8) return;
  const ax = rig.hand[side];
  const f = fingerDir.clone().normalize();
  const pl = palmDir.clone().sub(f.clone().multiplyScalar(palmDir.dot(f))).normalize();
  // базис локальный (finger, palm, finger×palm) → мировой (f, pl, f×pl)
  const lb = new THREE.Matrix4().makeBasis(ax.finger, ax.palm.clone().sub(ax.finger.clone().multiplyScalar(ax.palm.dot(ax.finger))).normalize(), new THREE.Vector3().crossVectors(ax.finger, ax.palm).normalize());
  const wb = new THREE.Matrix4().makeBasis(f, pl, new THREE.Vector3().crossVectors(f, pl).normalize());
  const q = new THREE.Quaternion().setFromRotationMatrix(wb.multiply(lb.clone().transpose()));
  const b = rig.bones[`wrist${side}`];
  b.updateMatrixWorld(true);
  const parentQ = b.parent!.getWorldQuaternion(new THREE.Quaternion());
  b.quaternion.slerp(parentQ.invert().multiply(q), Math.min(1, amount));
  b.updateMatrixWorld(true);
};

export const resetPose = (rig: Rig) => {
  rig.gaze.x = 0; rig.gaze.y = 0;
  for (const [n, b] of Object.entries(rig.bones)) b.quaternion.copy(rig.rest[n]);
  rig.root.updateMatrixWorld(true);
};

const worldPos = (b: THREE.Object3D, out = new THREE.Vector3()) =>
  out.setFromMatrixPosition(b.matrixWorld);

// Поворот кости дельтой, заданной в мировых координатах.
export const rotateWorld = (rig: Rig, name: string, delta: THREE.Quaternion) => {
  const b = rig.bones[san(name)];
  if (!b) return;
  b.updateMatrixWorld(true);
  const parentQ = b.parent ? b.parent.getWorldQuaternion(q2) : q2.identity();
  const boneQ = b.getWorldQuaternion(q3);
  // новая мировая = delta * boneQ  →  локальная = parent^-1 * новая
  const newWorld = q1.copy(delta).multiply(boneQ);
  b.quaternion.copy(parentQ.clone().invert().multiply(newWorld));
  b.updateMatrixWorld(true);
};

// Наклон/поворот вокруг мировой оси на угол (рад), осью в осях персонажа:
// axis задаётся в локальных осях root (x — вправо от персонажа, y — вверх,
// z — вперёд), чтобы позы не зависели от поворота персонажа в сцене.
export const turn = (rig: Rig, name: string, axis: THREE.Vector3, angle: number) => {
  if (!angle) return;
  const rq = rig.root.getWorldQuaternion(new THREE.Quaternion());
  const ax = axis.clone().applyQuaternion(rq).normalize();
  rotateWorld(rig, name, new THREE.Quaternion().setFromAxisAngle(ax, angle));
};

export const X = new THREE.Vector3(1, 0, 0);
export const Y = new THREE.Vector3(0, 1, 0);
export const Z = new THREE.Vector3(0, 0, 1);

// Направить кость (от её начала к началу дочерней кости child) на точку.
export const aimChain = (
  rig: Rig,
  name: string,
  childName: string,
  target: THREE.Vector3,
  amount = 1,
) => {
  const b = rig.bones[san(name)];
  const c = rig.bones[san(childName)];
  if (!b || !c) return;
  rig.root.updateMatrixWorld(true);
  const from = worldPos(b, new THREE.Vector3());
  const cur = worldPos(c, new THREE.Vector3()).sub(from).normalize();
  const want = target.clone().sub(from).normalize();
  const d = new THREE.Quaternion().setFromUnitVectors(cur, want);
  if (amount < 1) d.slerp(new THREE.Quaternion(), 1 - amount);
  rotateWorld(rig, name, d);
};

// Двухзвенная IK: плечо (a) → локоть (b) → кисть (c). pole — точка, в
// сторону которой сгибается сустав (локоть/колено).
export const ik2 = (
  rig: Rig,
  a: string,
  b: string,
  c: string,
  target: THREE.Vector3,
  pole: THREE.Vector3,
) => {
  const A = rig.bones[san(a)];
  const B = rig.bones[san(b)];
  const C = rig.bones[san(c)];
  if (!A || !B || !C) return;
  rig.root.updateMatrixWorld(true);
  const pa = worldPos(A, new THREE.Vector3());
  const pb = worldPos(B, new THREE.Vector3());
  const pc = worldPos(C, new THREE.Vector3());
  const l1 = pa.distanceTo(pb);
  const l2 = pb.distanceTo(pc);
  const t = target.clone();
  let d = t.distanceTo(pa);
  const maxD = (l1 + l2) * 0.999;
  if (d > maxD) {
    t.sub(pa).setLength(maxD).add(pa);
    d = maxD;
  }
  d = Math.max(d, Math.abs(l1 - l2) + 1e-4);
  // положение «локтя»: по теореме косинусов в плоскости (a, target, pole)
  const dir = t.clone().sub(pa).normalize();
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const ang = Math.acos(Math.min(1, Math.max(-1, cosA)));
  const poleDir = pole.clone().sub(pa);
  poleDir.sub(dir.clone().multiplyScalar(poleDir.dot(dir))).normalize();
  const elbow = pa
    .clone()
    .add(dir.clone().multiplyScalar(Math.cos(ang) * l1))
    .add(poleDir.multiplyScalar(Math.sin(ang) * l1));
  aimChain(rig, a, b, elbow);
  aimChain(rig, b, c, t);
};

// Мировая ориентация кости (например, кисти — чтобы телефон смотрел экраном
// на лицо): задаём кватернион в осях персонажа.
export const setWorldRotation = (rig: Rig, name: string, q: THREE.Quaternion) => {
  const b = rig.bones[san(name)];
  if (!b) return;
  b.updateMatrixWorld(true);
  const rq = rig.root.getWorldQuaternion(new THREE.Quaternion());
  const want = rq.clone().multiply(q);
  const parentQ = b.parent ? b.parent.getWorldQuaternion(new THREE.Quaternion()) : new THREE.Quaternion();
  b.quaternion.copy(parentQ.invert().multiply(want));
  b.updateMatrixWorld(true);
};

export const bonePos = (rig: Rig, name: string) => {
  rig.root.updateMatrixWorld(true);
  return worldPos(rig.bones[san(name)], new THREE.Vector3());
};

// Точка в осях персонажа (x — его право/лево, y — вверх, z — вперёд) → мир.
export const local = (rig: Rig, x: number, y: number, z: number) =>
  rig.root.localToWorld(new THREE.Vector3(x, y, z));

// Сгиб пальцев: 0 — прямые, 1 — кулак.
export const curlFingers = (rig: Rig, side: "L" | "R", amount: number, thumb = amount * 0.6) => {
  if (!amount && !thumb) return;
  for (let f = 2; f <= 5; f++) {
    for (let k = 1; k <= 3; k++) {
      const n = `finger${f}-${k}.${side}`;
      const b = rig.bones[san(n)];
      if (!b) continue;
      // сгиб вокруг локальной оси X кости (оси пальцев MakeHuman согласованы)
      b.quaternion.multiply(q1.setFromAxisAngle(X, amount * (k === 1 ? 1.1 : 1.3)));
    }
  }
  for (let k = 2; k <= 3; k++) {
    const b = rig.bones[san(`finger1-${k}.${side}`)];
    if (b) b.quaternion.multiply(q1.setFromAxisAngle(X, thumb * 0.8));
  }
  rig.root.updateMatrixWorld(true);
};

// Морфы лица по имени.
export const setMorphs = (rig: Rig, values: Record<string, number>) => {
  rig.expression?.(values);
  for (const m of rig.meshes) {
    const dict = m.morphTargetDictionary;
    const inf = m.morphTargetInfluences;
    if (!dict || !inf) continue;
    inf.fill(0);
    for (const [k, v] of Object.entries(values)) {
      const i = dict[k];
      if (i !== undefined) inf[i] = Math.max(0, Math.min(1, v));
    }
  }
};

// Повернуть кость так, чтобы её ось +Y (от начала к концу) смотрела на
// точку (глаза, голова). amount < 1 — частично.
export const aimY = (rig: Rig, name: string, target: THREE.Vector3, amount = 1) => {
  const b = rig.bones[san(name)];
  if (!b) return;
  rig.root.updateMatrixWorld(true);
  const from = worldPos(b, v1.clone());
  const cur = v2.set(0, 1, 0).applyQuaternion(b.getWorldQuaternion(q1)).clone().normalize();
  const want = target.clone().sub(from).normalize();
  const d = new THREE.Quaternion().setFromUnitVectors(cur, want);
  if (amount < 1) d.slerp(new THREE.Quaternion(), 1 - amount);
  rotateWorld(rig, name, d);
};

// Взгляд: голова и шея поворачиваются к точке (частично), глаза — точно.
export const lookAt = (rig: Rig, target: THREE.Vector3, amount = 1, eyes = true) => {
  rig.root.updateMatrixWorld(true);
  const head = bonePos(rig, "head");
  const inv = rig.root.getWorldQuaternion(new THREE.Quaternion()).invert();
  const d = target.clone().sub(head).applyQuaternion(inv);
  const yaw = Math.atan2(d.x, d.z);
  const pitch = Math.atan2(-d.y, Math.hypot(d.x, d.z));
  const cy = Math.max(-1.1, Math.min(1.1, yaw)) * amount;
  const cp = Math.max(-0.5, Math.min(0.7, pitch)) * amount;
  turn(rig, "neck01", Y, cy * 0.3);
  turn(rig, "neck02", X, cp * 0.35);
  turn(rig, "head", Y, cy * 0.55);
  turn(rig, "head", X, cp * 0.5);
  rig.gaze.x = Math.max(-1, Math.min(1, (yaw - cy * 0.85) * 1.6));
  rig.gaze.y = Math.max(-1, Math.min(1, -(pitch - cp * 0.85) * 1.6));
  if (eyes) {
    for (const n of ["eyeL", "eyeR"]) {
      const b = rig.bones[n];
      const ax = rig.eyeFwd[n];
      if (!b || !ax) continue;
      b.updateMatrixWorld(true);
      const from = worldPos(b, new THREE.Vector3());
      const cur = ax.clone().applyQuaternion(b.getWorldQuaternion(new THREE.Quaternion())).normalize();
      const want = target.clone().sub(from).normalize();
      // глаза поворачиваются не более чем на ~35°
      const d = new THREE.Quaternion().setFromUnitVectors(cur, want);
      const ang = 2 * Math.acos(Math.min(1, Math.abs(d.w)));
      const eyeLimit = 0.32 * Math.min(1, amount);
      if (ang > eyeLimit) d.slerp(new THREE.Quaternion(), 1 - eyeLimit / ang);
      rotateWorld(rig, n, d);
    }
  }
};

// Мигание: короткое (4 кадра) — по «расписанию» персонажа.
export const blinkAt = (frame: number, seed = 0) => {
  const period = 84 + (seed % 5) * 11;
  const p = ((frame + seed * 31) % period + period) % period;
  if (p >= 7) return 0;
  const u = p < 2.5 ? p / 2.5 : (7 - p) / 4.5;
  return u * u * (3 - 2 * u);
};
