import * as THREE from "three";
import { useShotTime, useSpeech } from "../context";
import { drawChat } from "../screens";
import { Backpack, readPhoneR, usePhoneHold } from "../three/actions";
import { Character, heldWorld, useCharacter } from "../three/character";
import { face } from "../three/face";
import { armsDown, at, crouch, dims, ease, mix, place, stand, standTurn, walk } from "../three/poses";
import { Phone, useFontReady, useScreenTexture } from "../three/props";
import { bonePos, curlFingers, ik2, lookAt, orientHand, turn, X, type Rig } from "../three/rig";
import { SchoolYard } from "../three/sets2";
import { CameraRig, camPath, Stage, type Cam } from "../three/stage";
import { MeetingView } from "./Office";

// Школьный двор: вход в здание — (0, 0, 0), двор — к +z, ворота — z = 6.
// Сын ждёт у входа рядом с учительницей; одноклассницу забирает папа.
const SON = new THREE.Vector3(0.4, 0, 3.3);
const TEACHER = new THREE.Vector3(1.05, 0, 3.5);
const GIRL = new THREE.Vector3(-0.55, 0, 3.55);
const MOM = new THREE.Vector3(0.4, 0, 3.88);

const yawTo = (from: THREE.Vector3, to: THREE.Vector3) => Math.atan2(to.x - from.x, to.z - from.z);

// Руки сложены впереди (ожидание).
const handsClasped = (rig: Rig) => {
  const y = bonePos(rig, "upperleg01.L").y + 0.04;
  const c = at(rig, 0, y, 0.2);
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    ik2(rig, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, c.clone().add(new THREE.Vector3(sx * 0.03, 0, 0).applyQuaternion(rig.root.quaternion)), at(rig, sx * 0.45, 1.0, -0.2));
    orientHand(rig, side, new THREE.Vector3(-sx, -0.5, 0.4).applyQuaternion(rig.root.quaternion).normalize(), new THREE.Vector3(0, 0, 1).applyQuaternion(rig.root.quaternion));
    curlFingers(rig, side, 0.35);
  }
};

export type SchoolCam = (t: number, h: { son: Rig; teacher: Rig; mom: Rig; phone: THREE.Vector3 }) => Cam;

// Набор «Апа, сабак бүттү.» на экране сына, затем — отправлено.
const typedAt = (t: number, from: number) => {
  const full = "Апа, сабак бүттү.";
  const a = Math.min(35.4, from - 0.2);
  const k = Math.max(0, Math.min(1, (t - a) / 1.2));
  return { text: t > a + 1.35 ? "" : full.slice(0, Math.round(full.length * k)), sent: t > a + 1.35 };
};

// Двор в момент t (секунды ролика): все персонажи — функции времени.
export const SchoolYardView: React.FC<{ t: number; cam: SchoolCam }> = ({ t, cam }) => {
  const son = useCharacter("son");
  useFontReady();
  const teacher = useCharacter("teacher");
  const girl = useCharacter("girl");
  const parent = useCharacter("parent");
  const mom = useCharacter("mom");
  const sp = useSpeech(["s01", "t01", "m03", "t02", "s02", "m04", "m05"]);
  const typed = typedAt(t, sp.s01.from);
  const chat = useScreenTexture(drawChat({ side: "son", time: "12:32", inShown: false, typed: typed.text, sent: typed.sent, outText: "Апа, сабак бүттү." }), `${typed.text}|${typed.sent}`);
  const hold = usePhoneHold(son);
  const momVisible = t > 63;

  // ---- сын: выходит из школы, встаёт рядом с учительницей
  const sw = walk(son, { from: new THREE.Vector3(0, 0, 0.45), to: SON, t0: 30.4 }, t, 2);
  if (sw.done) {
    const yawAt = (tt: number) => mix(mix(sw.yaw, 0.05, ease(tt, 33.7, 34.3)), yawTo(SON, MOM) * 0.6, momVisible ? ease(tt, 65.4, 66.0) : 0);
    standTurn(son, SON.x, SON.z, yawAt, t, 2);
  }
  armsDown(son, t, { swingL: -sw.swing, swingR: sw.swing, bend: 0.05 });
  curlFingers(son, "L", 0.3);
  // правая: телефон (читает и пишет 34.5–41, затем опускает)
  const tRead = ease(t, 34.5, 35.1) * (1 - ease(t, 41.0, 41.6));
  const rest = bonePos(son, "wrist.R");
  if (tRead > 0) readPhoneR(son, tRead, rest, -0.04);
  else curlFingers(son, "R", 0.55, 0.3);
  const phoneM = heldWorld(son, "R", hold);
  const phonePos = new THREE.Vector3().setFromMatrixPosition(phoneM);

  // ---- учительница
  const tYawAt = (tt: number) => {
    const speakToSon = ease(tt, 41.2, 41.8) * (1 - ease(tt, 44.4, 45.2));
    return mix(mix(-0.2, yawTo(TEACHER, SON), speakToSon), yawTo(TEACHER, MOM), ease(tt, 65.4, 66.3));
  };
  standTurn(teacher, TEACHER.x, TEACHER.z, tYawAt, t, 4);
  handsClasped(teacher);
  // Brief glance at a low wrist; avoid the hand-to-throat silhouette.
  const watch = ease(t, 59.3, 59.9) * (1 - ease(t, 61.0, 61.6));
  if (watch > 0) {
    const w = at(teacher, 0.05, bonePos(teacher, "upperleg01.L").y + 0.22, 0.3);
    ik2(teacher, "upperarm01.L", "lowerarm01.L", "wrist.L", bonePos(teacher, "wrist.L").lerp(w, watch), at(teacher, 0.5, 0.9, -0.2));
    orientHand(teacher, "L", new THREE.Vector3(-1, 0.2, 0.2).applyQuaternion(teacher.root.quaternion).normalize(), new THREE.Vector3(0, -0.2, -1).applyQuaternion(teacher.root.quaternion).normalize(), watch);
  }

  // ---- одноклассница и её папа (49.3–56 с)
  const girlShown = t < 56.5;
  const leaveFrom = new THREE.Vector3(-0.5, 0, 4.25);
  const leaveTo = new THREE.Vector3(-1.05, 0, 8.6);
  if (t < 52.6) {
    const pw = walk(parent, { from: new THREE.Vector3(-0.95, 0, 7.7), to: leaveFrom, t0: 49.3 }, t, 5);
    if (pw.done) {
      standTurn(parent, leaveFrom.x, leaveFrom.z, (tt) => mix(pw.yaw, yawTo(leaveFrom, GIRL), ease(tt, 51.6, 52.2)), t, 5);
    }
    armsDown(parent, t, { swingL: -pw.swing, swingR: pw.swing });
    standTurn(girl, GIRL.x, GIRL.z, (tt) => mix(0.25, yawTo(GIRL, leaveFrom), ease(tt, 51.4, 52.0)), t, 7);
    armsDown(girl, t);
  } else {
    // уходят вместе к воротам
    const gTo = leaveTo.clone().add(new THREE.Vector3(0.4, 0, 0));
    const gw = walk(girl, { from: GIRL, to: gTo, t0: 52.6, speed: 0.95 }, t, 7);
    armsDown(girl, t, { swingL: -gw.swing, swingR: gw.swing });
    const dFrom = leaveFrom.clone();
    const dw = walk(parent, { from: dFrom, to: leaveTo, t0: 52.6, speed: (0.95 * dFrom.distanceTo(leaveTo)) / GIRL.distanceTo(gTo) }, t, 5);
    armsDown(parent, t, { swingL: -dw.swing, swingR: dw.swing });
  }
  lookAt(girl, t > 51.4 ? bonePos(parent, "head") : at(girl, 0, 1.2, 2), 0.8);
  lookAt(parent, t < 52.6 ? bonePos(girl, "head") : at(parent, 0, 1.5, 3), 0.7);
  face(girl, t, [], { smile: t > 51.4 ? 0.5 : 0.1 }, 7);
  face(parent, t, [], { smile: 0.35 }, 8);

  // ---- мама (с 63 с): идёт от ворот, говорит с учительницей, присаживается
  const mw = walk(mom, { from: new THREE.Vector3(0.12, 0, 7.6), to: MOM, t0: 63.2, speed: 1.2 }, t, 1);
  const crouchK = ease(t, sp.m04.to + 0.15, sp.m04.to + 1.05);
  if (mw.done) {
    const yawAt = (tt: number) => mix(mix(mw.yaw, yawTo(MOM, TEACHER), ease(tt, 66.0, 66.6)), yawTo(MOM, SON), ease(tt, sp.s02.from - 0.2, sp.s02.from + 0.4));
    place(mom, MOM.x, MOM.z, yawAt(t));
    if (crouchK > 0) crouch(mom, crouchK * 0.065);
    else stand(mom, t, 1, yawAt);
  }
  armsDown(mom, t, { swingL: -mw.swing, swingR: mw.swing, bend: 0.05 + crouchK * 0.1 });
  // левая рука мамы — на правом плече сына (со стороны камеры)
  const touch = ease(t, sp.m05.from + 0.3, sp.m05.from + 0.9);
  if (touch > 0) {
    // правое плечо сына — по осям его тела (x < 0 — правая сторона)
    const sd = dims(son);
    const sh = bonePos(son, "upperarm01.R");
    const w0 = bonePos(mom, "wrist.L");
    // кисть лежит сверху на плече: запястье чуть ниже и ближе к маме
    const wT = sh.clone().add(new THREE.Vector3(0, -0.055, 0.07));
    ik2(mom, "upperarm01.L", "lowerarm01.L", "wrist.L", w0.clone().lerp(wT, touch), at(mom, 0.32, sd.shoulder - 0.2, 0.08));
    orientHand(mom, "L", new THREE.Vector3(0, -1, 0.1), new THREE.Vector3(0, 0, -1), touch);
    curlFingers(mom, "L", 0.12 * touch, 0.1 * touch);
  }

  // ---- взгляды и лица
  const sonHead = bonePos(son, "head");
  const momHead = bonePos(mom, "head");
  const teacherHead = bonePos(teacher, "head");
  let tLook = at(teacher, 0, 1.5, 3);
  tLook = tLook.lerp(sonHead, ease(t, 41.1, 41.7) * (1 - ease(t, 44.4, 45.2)));
  tLook = tLook.lerp(bonePos(teacher, "wrist.L"), watch);
  const arrivalLook = momHead.clone().lerp(sonHead, ease(t, sp.s02.from - 0.5, sp.s02.from + 0.2));
  tLook = tLook.lerp(arrivalLook, ease(t, 65.2, 66.0));
  lookAt(teacher, tLook, 0.85);
  face(teacher, t, [...sp.t01.words, ...sp.t02.words], { smile: 0.3 }, 6);

  let mLook = at(mom, 0, 1.4, 2).lerp(teacherHead, ease(t, 65.5, 66.4));
  mLook = mLook.lerp(sonHead, ease(t, sp.s02.from - 0.5, sp.s02.from + 0.3));
  // «Жумушта…» — пауза, взгляд в сторону
  mLook = mLook.clone().add(new THREE.Vector3(0.4, -0.2, 0).multiplyScalar(ease(t, sp.m04.to, sp.m04.to + 0.2) * (1 - ease(t, sp.m04.to + 0.5, sp.m04.to + 0.8))));
  lookAt(mom, mLook, 0.9);
  face(mom, t, [...sp.m03.words, ...sp.m04.words, ...sp.m05.words], { worry: 0.5, smile: t > sp.m03.from && t < sp.t02.to ? 0.15 : 0 }, 1);

  let sLook = at(son, 0, 1.1, 2.5).lerp(at(son, 0, 1.2, 3), ease(t, 33.3, 34.0));
  sLook = sLook.lerp(phonePos, tRead);
  sLook = sLook.lerp(teacherHead, ease(t, 41.4, 42.0) * (1 - ease(t, 43.7, 44.4)));
  sLook = sLook.lerp(bonePos(girl, "head"), ease(t, 49.6, 50.2) * (1 - ease(t, 55.5, 56.2)));
  if (momVisible) sLook = sLook.lerp(momHead, ease(t, 64.4, 65.2));
  lookAt(son, sLook, 0.9);
  if (t > 42.6 && t < 43.6) turn(son, "head", X, Math.sin(((t - 42.6) / 1.0) * Math.PI) * 0.1);
  face(son, t, [...sp.s01.words, ...sp.s02.words], { worry: t > 45 ? 0.35 : 0.1, smile: t < 37.8 ? 0.15 : 0 }, 2);

  const c = cam(t, { son, teacher, mom, phone: phonePos });
  return (
    <>
      <CameraRig cam={c} />
      <hemisphereLight args={["#F0F6FF", "#C0B5A2", 1.3]} />
      <directionalLight position={[6, 9, 9]} intensity={1.65} color="#FFF3DE" castShadow shadow-mapSize={[1024, 1024]} shadow-radius={4} shadow-bias={-0.0004} shadow-normalBias={0.025} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
      <directionalLight position={[-4, 3, -2]} intensity={0.5} color="#DDEBFA" />
      <SchoolYard />
      <Character rig={son} />
      <Backpack rig={son} />
      <Phone screen={tRead > 0.2 ? chat : null} matrix={phoneM} glow={0.95} />
      <Character rig={teacher} />
      {girlShown ? (
        <>
          <Character rig={girl} />
          <Backpack rig={girl} color="#C94F6D" trim="#FFFFFF" />
          <Character rig={parent} />
        </>
      ) : null}
      {momVisible ? <Character rig={mom} /> : null}
    </>
  );
};

const schoolCam: SchoolCam = (t, h) => {
  if (t < 33.6)
    return camPath(
      [
        { t: 30, pos: [-3.3, 2.25, 5.8], target: [0.1, 1.0, 1.9], fov: 50 },
        { t: 33.6, pos: [-3.0, 2.05, 5.7], target: [0.35, 1.0, 2.6], fov: 48 },
      ],
      t,
    );
  if (t < 35.3)
    return camPath(
      [
        { t: 33.6, pos: [0.85, 1.2, 5.0], target: [0.4, 1.05, 3.3], fov: 34 },
        { t: 35.3, pos: [0.8, 1.18, 4.8], target: [0.4, 1.05, 3.3], fov: 32 },
      ],
      t,
    );
  if (t < 37.6) {
    // Over the boy's shoulder, between his eyes and the screen: the camera
    // stays outside his head, so the cheek and hair no longer fill the frame.
    const head = bonePos(h.son, "head");
    const toHead = head.clone().sub(h.phone);
    const side = new THREE.Vector3().crossVectors(toHead, new THREE.Vector3(0, 1, 0)).setLength(0.16);
    return { pos: h.phone.clone().addScaledVector(toHead, 0.5).add(side).add(new THREE.Vector3(0, 0.06, 0)), target: h.phone, fov: 40 };
  }
  return camPath(
    [
      { t: 41.4, pos: [-0.55, 1.3, 5.0], target: [0.72, 1.15, 3.4], fov: 36 },
      { t: 45, pos: [-0.5, 1.28, 4.85], target: [0.72, 1.15, 3.4], fov: 34 },
    ],
    t,
  );
};

const SchoolInner: React.FC = () => {
  const t = useShotTime("school");
  if (t >= 37.6 && t < 41.4) {
    // переговорная: мама читает сообщение и отвечает «Азыр чыгып жатам»
    const out = "Азыр чыгып жатам";
    const k = Math.max(0, Math.min(1, (t - 38.7) / 1.0));
    const chat = { inShown: true, typed: t < 39.8 ? out.slice(0, Math.round(out.length * k)) : "", sent: t >= 39.8 };
    return <MeetingView t={t} clockMin={12 * 60 + 41 + (t - 37.6) / 6} chat={chat} />;
  }
  return <SchoolYardView t={t} cam={schoolCam} />;
};

const pickupCam: SchoolCam = (t, h) => {
  const sonHead = bonePos(h.son, "head");
  const momHead = bonePos(h.mom, "head");
  if (t < 66.35) {
    // The elevated approach shot clears the child's large foreground head.
    return {
      pos: new THREE.Vector3(-0.7, 2.35, 1.65),
      target: momHead.clone().add(new THREE.Vector3(0, -0.2, 0)),
      fov: mix(42, 41, ease(t, 65, 66.35)),
    };
  }
  if (t < 68.2) {
    // Once she turns to the teacher, shoot from +x,+z. The child is behind
    // the mother and the teacher's projected head is outside her face.
    return {
      pos: momHead.clone().add(new THREE.Vector3(2.4, 0.26, 1.05)),
      target: momHead.clone().add(new THREE.Vector3(0, -0.035, 0)),
      fov: mix(36, 35, ease(t, 66.35, 68.2)),
    };
  }
  if (t < 72.1)
  {
    // The teacher faces (-x,+z), and the mother stands directly in front of
    // her. A camera from -x puts the mother's head over the teacher's face.
    // Shoot from the +z side: a clear three-quarter portrait with the mother
    // outside the frame. Follow the live head height, not the old model size.
    const head = bonePos(h.teacher, "head");
    const push = ease(t, 68.2, 72.1);
    return {
      pos: head.clone().add(new THREE.Vector3(-0.20, 0.22, mix(2.15, 2.10, push))),
      target: head.clone().add(new THREE.Vector3(0, 0.035, 0)),
      fov: mix(36, 35, push),
    };
  }
  if (t < 76.0) return { pos: sonHead.clone().add(new THREE.Vector3(-1.60, 0.15, 1.65)), target: sonHead.clone().add(new THREE.Vector3(0, -0.12, 0)), fov: 34 };
  if (t < 79.6) return { pos: momHead.clone().add(new THREE.Vector3(-1.65, 0.12, -1.80)), target: momHead.clone().add(new THREE.Vector3(0, -0.12, 0)), fov: 34 };
  // The apology: from beside the pair and slightly behind the boy, so the
  // mother's face is seen in three-quarter view while she hugs him.
  const mid = momHead.clone().lerp(sonHead, 0.5);
  const toSon = sonHead.clone().sub(momHead).setY(0).normalize();
  const perp = new THREE.Vector3(-toSon.z, 0, toSon.x);
  // The teacher stands on the +z side; shoot from the clear side.
  if (perp.z > 0) perp.negate();
  const drift = ease(t, 79.6, 82);
  return {
    pos: mid.clone().addScaledVector(perp, mix(2.5, 2.35, drift)).addScaledVector(toSon, 0.75).add(new THREE.Vector3(0, 0.12, 0)),
    target: mid.clone().lerp(momHead, 0.25).add(new THREE.Vector3(0, -0.12, 0)),
    fov: 33,
  };
};

const PickupInner: React.FC = () => {
  const t = useShotTime("pickup");
  return <SchoolYardView t={t} cam={pickupCam} />;
};

export const SchoolScene: React.FC = () => (
  <Stage>
    <SchoolInner />
  </Stage>
);
export const PickupScene: React.FC = () => (
  <Stage>
    <PickupInner />
  </Stage>
);
