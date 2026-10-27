import * as THREE from "three";
import { bonePos, ik2, orientHand, resetPose, turn, X, Y, Z, type Rig } from "./rig";

// Позы персонажей — чистые функции времени (секунды сцены). Порядок вызова
// в кадре: place → (stand | walk | sit | crouch) → руки → взгляд → лицо.

const sstep = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
};
export const ease = (t: number, a: number, b: number) => sstep((t - a) / (b - a));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
// Angles interpolate along the shorter arc without a numeric wrap at ±π.
export const mixYaw = (a: number, b: number, t: number) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;

// Поставить персонажа: позиция на полу и поворот (yaw: 0 — лицом к +z).
export const place = (rig: Rig, x: number, z: number, yaw: number, y = 0) => {
  rig.root.position.set(x, y, z);
  rig.root.rotation.set(0, yaw, 0);
  resetPose(rig);
};

// Точка в осях персонажа (x — его левая сторона, y — абсолютная высота над
// полом, z — вперёд).
export const at = (rig: Rig, x: number, y: number, z: number) => {
  const q = rig.root.quaternion;
  return new THREE.Vector3(x, 0, z).applyQuaternion(q).add(new THREE.Vector3(rig.root.position.x, y, rig.root.position.z));
};

// Стопа горизонтально (как в исходной позе), с поворотом yaw вокруг
// вертикали и наклоном носка pitch (+ — носок вниз).
const footFlat = (rig: Rig, side: "L" | "R", restRel: THREE.Quaternion, yaw = 0, pitch = 0) => {
  const b = rig.bones[`foot${side}`];
  const rq = rig.root.getWorldQuaternion(new THREE.Quaternion());
  const want = rq.clone();
  if (yaw) want.multiply(new THREE.Quaternion().setFromAxisAngle(Y, yaw));
  if (pitch) want.multiply(new THREE.Quaternion().setFromAxisAngle(X, pitch));
  want.multiply(restRel);
  const parentQ = b.parent!.getWorldQuaternion(new THREE.Quaternion());
  b.quaternion.copy(parentQ.invert().multiply(want));
  b.updateMatrixWorld(true);
};

const restFootRel = (rig: Rig, side: "L" | "R") => {
  const rq = rig.root.getWorldQuaternion(new THREE.Quaternion()).invert();
  return rq.multiply(rig.bones[`foot${side}`].getWorldQuaternion(new THREE.Quaternion()));
};

// Размеры персонажа в исходной позе (после place).
export const dims = (rig: Rig) => {
  const hip = bonePos(rig, "upperleg01.L").y;
  const ankle = bonePos(rig, "foot.L").y;
  const shoulder = bonePos(rig, "upperarm01.L").y;
  const head = bonePos(rig, "head").y;
  const { hipW, scale } = rig.proportions;
  return { hip, ankle, shoulder, head, hipW, scale };
};

// Ноги: стопы в заданных мировых точках (уровень щиколотки), колени — вперёд.
const legsTo = (rig: Rig, fl: THREE.Vector3, fr: THREE.Vector3, relL: THREE.Quaternion, relR: THREE.Quaternion, yawL = 0, yawR = 0, pitchL = 0, pitchR = 0) => {
  for (const [side, tgt, rel, yaw, pitch] of [
    ["L", fl, relL, yawL, pitchL],
    ["R", fr, relR, yawR, pitchR],
  ] as const) {
    const knee = tgt.clone().add(new THREE.Vector3(0, 0.45, 0)).add(new THREE.Vector3(0, 0, 1).applyQuaternion(rig.root.quaternion).multiplyScalar(0.8));
    ik2(rig, `upperleg01.${side}`, `lowerleg01.${side}`, `foot.${side}`, tgt, knee);
    footFlat(rig, side, rel, yaw, pitch);
  }
};

// Руки свободно вдоль тела; swing — мах (+ вперёд), bend — сгиб локтя.
export const armsDown = (rig: Rig, t: number, opts: { swingL?: number; swingR?: number; bend?: number; skipL?: boolean; skipR?: boolean } = {}) => {
  const d = dims(rig);
  const breathe = Math.sin(t * 1.7) * 0.004;
  for (const [side, sx, sw, skip] of [
    ["L", 1, opts.swingL ?? 0, opts.skipL],
    ["R", -1, opts.swingR ?? 0, opts.skipR],
  ] as const) {
    if (skip) continue;
    const bend = opts.bend ?? 0.04;
    const y = d.hip - 0.06 * d.scale + Math.abs(sw) * 0.05 + bend * 0.6 + breathe;
    const z = 0.03 + sw * 0.13 * d.scale + bend;
    const wrist = at(rig, sx * (d.hipW + 0.085 * d.scale), y, z);
    const elbow = at(rig, sx * 0.3, d.shoulder - 0.25, -0.5);
    ik2(rig, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, wrist, elbow);
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(rig.root.quaternion);
    const finger = new THREE.Vector3(0, -1, 0).add(fwd.clone().multiplyScalar(0.15 + sw * 0.4)).normalize();
    const palm = new THREE.Vector3(-sx, 0, 0).applyQuaternion(rig.root.quaternion);
    orientHand(rig, side, finger, palm);
  }
};

// Стоя: лёгкое дыхание и перенос веса (колени чуть согнуты — не «замок»).
// yawAt — поворот корпуса во времени (если персонаж поворачивается на месте):
// стопы переступают по очереди (левая раньше, правая позже, с подъёмом), а
// не проворачиваются вместе с телом.
export const stand = (rig: Rig, t: number, seed = 0, yawAt?: (tt: number) => number) => {
  const relL = restFootRel(rig, "L");
  const relR = restFootRel(rig, "R");
  const d = dims(rig);
  const shift = Math.sin(t * 0.45 + seed) * 0.012;
  const p = rig.root.position;
  const base = p.clone();
  const rootYaw = rig.root.rotation.y;
  const foot = (sx: number, z: number, lead: number) => {
    const yaw = yawAt ? yawAt(t + lead) : rootYaw;
    const rate = yawAt ? Math.abs(yawAt(t + lead + 0.03) - yawAt(t + lead - 0.03)) / 0.06 : 0;
    const lift = Math.min(0.045, rate * 0.03) * d.scale;
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const pos = new THREE.Vector3(sx * (d.hipW + 0.01), 0, z).applyQuaternion(q).add(new THREE.Vector3(base.x, d.ankle + lift, base.z));
    return { pos, yaw: yaw - rootYaw };
  };
  const fl = foot(1, 0.0, 0.12);
  const fr = foot(-1, 0.01, -0.12);
  // The planted foot carries the weight while the other adjusts its angle.
  if (yawAt) {
    const phase = Math.sin(t * Math.PI * 3);
    fl.pos.y = d.ankle + (fl.pos.y - d.ankle) * Math.max(0, phase) ** 2;
    fr.pos.y = d.ankle + (fr.pos.y - d.ankle) * Math.max(0, -phase) ** 2;
  }
  p.y = base.y - 0.012;
  p.add(new THREE.Vector3(shift, 0, 0).applyQuaternion(rig.root.quaternion));
  rig.root.updateMatrixWorld(true);
  turn(rig, "spine05", Z, -shift * 1.2);
  turn(rig, "spine03", X, Math.sin(t * 1.7 + seed) * 0.008);
  legsTo(rig, fl.pos, fr.pos, relL, relR, 0.08 + fl.yaw, -0.08 + fr.yaw);
};

// Стоять в точке (x, z), поворачиваясь по yawAt(t) — с переступанием.
export const standTurn = (rig: Rig, x: number, z: number, yawAt: (tt: number) => number, t: number, seed = 0) => {
  place(rig, x, z, yawAt(t));
  stand(rig, t, seed, yawAt);
};

// Ходьба по прямой from → to с постоянной скоростью; стопы стоят на месте,
// пока на них опора (без скольжения). t — время от начала шага; до начала и
// после конца — стойка. Возвращает долю пройденного пути и фазу.
export type Walk = { from: THREE.Vector3; to: THREE.Vector3; t0: number; speed?: number; stepLen?: number };

export const walk = (rig: Rig, w: Walk, t: number, seed = 0) => {
  const dir = w.to.clone().sub(w.from);
  dir.y = 0;
  const total = dir.length();
  dir.normalize();
  const yaw = Math.atan2(dir.x, dir.z);
  const side = new THREE.Vector3(dir.z, 0, -dir.x); // левая сторона персонажа
  rig.root.position.set(w.from.x, 0, w.from.z);
  rig.root.rotation.set(0, yaw, 0);
  resetPose(rig);
  const d = dims(rig);
  const relL = restFootRel(rig, "L");
  const relR = restFootRel(rig, "R");
  const Ls = w.stepLen ?? 0.62 * d.scale;
  const v = w.speed ?? 1.15 * d.scale;
  const Ts = Ls / v;
  const nSteps = Math.max(1, Math.round(total / Ls));
  const L = total / nSteps; // точная длина шага, чтобы прийти ровно в to
  const tl = t - w.t0;
  const footAt = (k: number) => Math.min(total, Math.max(0, k * L));
  // шаг i (1..nSteps) — нога i%2 (1 → левая); последний шаг (nSteps+1)
  // приставляет вторую ногу. Перенос ноги — последние 80 % интервала шага.
  const footPos = (isLeft: boolean) => {
    let from = 0;
    let to = 0;
    let u = 1;
    for (let i = 1; i <= nSteps + 1; i++) {
      if ((i % 2 === 1) !== isLeft) continue;
      const target = i <= nSteps ? footAt(i) : total;
      const s0 = (i - 1) * Ts + 0.2 * Ts;
      const s1 = i * Ts;
      if (tl < s0) {
        u = 0;
        to = target;
        break;
      }
      from = target;
      to = target;
      if (tl < s1) {
        u = (tl - s0) / (s1 - s0);
        to = target;
        // начало переноса — с предыдущего места этой ноги
        let prev = 0;
        for (let j = i - 2; j >= 1; j -= 2) {
          prev = footAt(j);
          break;
        }
        from = prev;
        break;
      }
      u = 1;
    }
    const uu = sstep(u);
    const dist = mix(from, to, uu);
    const lift = Math.sin(Math.PI * u) * 0.07 * d.scale * (from === to ? 0 : 1);
    const pitch = from === to ? 0 : Math.sin(Math.PI * u) * 0.35 - 0.15 * Math.sin(Math.PI * Math.min(1, u * 2));
    return { dist, lift, pitch, moving: from !== to && u > 0 && u < 1 };
  };
  const fL = footPos(true);
  const fR = footPos(false);
  const doneAt = (nSteps + 1) * Ts;
  // таз: посередине между стопами, чуть впереди опорной
  // Continuous pelvis motion with acceleration/deceleration. Deriving it
  // from the two swinging feet introduced a lurch at every footfall.
  const ramp = Math.min(Ts, doneAt / 2);
  const integral = (u: number) => u ** 4 * (u * (u - 3) + 2.5);
  const elapsed = Math.max(0, Math.min(doneAt, tl));
  const travelled = elapsed < ramp
    ? ramp * integral(elapsed / ramp)
    : elapsed > doneAt - ramp
      ? doneAt - ramp - ramp * integral((doneAt - elapsed) / ramp)
      : elapsed - ramp / 2;
  const sBody = total * travelled / (doneAt - ramp);
  const progress = total > 0 ? sBody / total : 1;
  const phase = (tl / Ts) * Math.PI;
  const walking = tl > 0 && tl < doneAt;
  const amp = walking ? Math.min(sstep(tl / Ts), sstep((doneAt - tl) / Ts)) : 0;
  const bob = -0.012 - (1 - Math.cos(phase * 2)) * 0.004 * d.scale * amp;
  const hipSway = Math.sin(phase) * 0.015 * amp;
  const pos = w.from.clone().add(dir.clone().multiplyScalar(sBody)).add(side.clone().multiplyScalar(hipSway));
  rig.root.position.set(pos.x, bob, pos.z);
  rig.root.updateMatrixWorld(true);
  turn(rig, "spine05", Z, -hipSway * 2);
  turn(rig, "spine05", Y, Math.sin(phase) * 0.06 * amp);
  turn(rig, "spine03", Y, -Math.sin(phase) * 0.08 * amp);
  turn(rig, "spine03", X, 0.04 * amp + Math.sin(seed + tl * 1.7) * 0.006);
  const base = (dist: number, s: number, lift: number) =>
    w.from.clone().add(dir.clone().multiplyScalar(dist)).add(side.clone().multiplyScalar(s * (d.hipW + 0.005))).setY(d.ankle + lift);
  legsTo(rig, base(fL.dist, 1, fL.lift), base(fR.dist, -1, fR.lift), relL, relR, 0.05, -0.05, fL.pitch, fR.pitch);
  return { progress, phase, amp, yaw, done: tl >= doneAt, swing: Math.sin(phase) * amp };
};

// Присесть на корточки (amount 0..1), стопы на месте, корпус прямой.
export const crouch = (rig: Rig, amount: number) => {
  const relL = restFootRel(rig, "L");
  const relR = restFootRel(rig, "R");
  const d = dims(rig);
  const fl = at(rig, d.hipW + 0.04, d.ankle, -0.02);
  const fr = at(rig, -d.hipW - 0.04, d.ankle, 0.12 * amount);
  const drop = amount * (d.hip - d.ankle) * 0.62;
  rig.root.position.y -= drop + 0.012;
  rig.root.position.add(new THREE.Vector3(0, 0, -0.08 * amount).applyQuaternion(rig.root.quaternion));
  rig.root.updateMatrixWorld(true);
  turn(rig, "spine05", X, 0.35 * amount);
  turn(rig, "spine03", X, -0.18 * amount);
  turn(rig, "neck01", X, -0.15 * amount);
  legsTo(rig, fl, fr, relL, relR, 0.15, -0.1);
};

// Сидя: таз на высоте seatY, стопы на полу на расстоянии footZ впереди.
export const sit = (rig: Rig, seatY: number, footZ = 0.42, lean = 0.06) => {
  const relL = restFootRel(rig, "L");
  const relR = restFootRel(rig, "R");
  const d = dims(rig);
  rig.root.position.y -= d.hip - seatY;
  rig.root.updateMatrixWorld(true);
  turn(rig, "spine04", X, lean);
  const yFoot = d.ankle;
  legsTo(rig, at(rig, d.hipW + 0.03, yFoot, footZ), at(rig, -d.hipW - 0.03, yFoot, footZ + 0.03), relL, relR, 0.1, -0.1);
};

// Губы по таймингам слов: открытие челюсти и формы рта по гласным.
export type Word = { text: string; start: number; end: number };
const VOWEL_OPEN: Record<string, number> = { а: 1, о: 0.8, ө: 0.7, у: 0.5, ү: 0.5, ы: 0.55, э: 0.8, е: 0.7, и: 0.45, я: 0.9, ю: 0.5 };
const ROUND = new Set(["о", "ө", "у", "ү", "ю"]);
const WIDE = new Set(["и", "е", "э", "ы"]);
const LABIAL = new Set(["м", "б", "п"]);

const mouthSample = (words: readonly Word[], t: number) => {
  for (const w of words) {
    if (t < w.start - 0.03 || t > w.end + 0.05) continue;
    const letters = [...w.text.toLowerCase()].filter((c) => /\p{L}/u.test(c));
    if (!letters.length) continue;
    const u = Math.min(0.999, Math.max(0, (t - w.start) / Math.max(0.05, w.end - w.start)));
    const fi = u * letters.length;
    const i = Math.floor(fi);
    const c = letters[i];
    const nx = letters[Math.min(letters.length - 1, i + 1)];
    const frac = fi - i;
    const val = (ch: string) => VOWEL_OPEN[ch] ?? (LABIAL.has(ch) ? -0.3 : 0.18);
    const o = mix(val(c), val(nx), sstep(frac));
    const env = Math.min(1, (t - w.start + 0.03) / 0.06, (w.end + 0.05 - t) / 0.08);
    const blend = sstep(frac);
    const shape = (set: ReadonlySet<string>, a: number, b = 0) => mix(set.has(c) ? a : b, set.has(nx) ? a : b, blend) * env;
    const open = Math.max(0, o) * Math.max(0, env);
    return {
      jaw: open * 0.105,
      jawOpen: open * 0.14,
      pucker: shape(ROUND, 0.24),
      wide: shape(WIDE, 0.2, 0.035),
      press: shape(LABIAL, 0.35),
    };
  }
  return { jaw: 0, jawOpen: 0, pucker: 0, wide: 0, press: 0 };
};

export const mouthAt = (words: readonly Word[], t: number) => {
  const a = mouthSample(words, t - 0.025), b = mouthSample(words, t), c = mouthSample(words, t + 0.025);
  return { jaw: (a.jaw + b.jaw * 2 + c.jaw) / 4, jawOpen: (a.jawOpen + b.jawOpen * 2 + c.jawOpen) / 4,
    pucker: (a.pucker + b.pucker * 2 + c.pucker) / 4, wide: (a.wide + b.wide * 2 + c.wide) / 4,
    press: (a.press + b.press * 2 + c.press) / 4 };
};

// Оценочные тайминги слов (пока нет озвучки): равномерно по слогам.
export const estimateWords = (text: string, start: number, dur: number): Word[] => {
  const ws = text.split(/\s+/).filter((w) => /\p{L}/u.test(w));
  const syl = ws.map((w) => Math.max(1, [...w.toLowerCase()].filter((c) => c in VOWEL_OPEN).length));
  const tot = syl.reduce((a, b) => a + b, 0) + ws.length * 0.3;
  let t = start;
  return ws.map((w, i) => {
    const d = ((syl[i] + 0.3) / tot) * dur;
    const out = { text: w, start: t, end: t + d * 0.9 };
    t += d;
    return out;
  });
};
