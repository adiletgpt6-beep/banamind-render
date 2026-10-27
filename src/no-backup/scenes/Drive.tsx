import { useMemo } from "react";
import * as THREE from "three";
import { handOnShoulder, phoneMatrix, phoneRead } from "../acts";
import { useShotTime, useSpeech } from "../context";
import { drawLock } from "../screens";
import { Belt, Entrance, MomBagHanging, MomCar, REAR_SEAT, RearSeat } from "../sets";
import { Backpack, gripPoint } from "../three/actions";
import { Character, useCharacter } from "../three/character";
import { face } from "../three/face";
import { armsDown, at, dims, ease, mix, place, sit, standTurn, walk } from "../three/poses";
import { Phone, useFontReady, useScreenTexture } from "../three/props";
import { bonePos, curlFingers, ik2, lookAt, orientHand, turn, X, type Rig } from "../three/rig";
import { Car, CarInterior, SchoolYard, Street } from "../three/sets2";
import { overShoulder, single, twoShot } from "../cams";
import { CameraRig, camPath, Stage, type Cam } from "../three/stage";

// Дорога и школа (61–80 с):
//  A 61.0–63.2  выход из подъезда, идут к машине;
//  B 63.2–64.5  мама открывает заднюю дверь;
//  C 64.5–66.6  дочка сзади пристёгивается;
//  D 66.6–69.2  мама за рулём, смотрит на дорогу;
//  E 69.2–72.0  машина в потоке (снаружи);
//  F 72.0–80.0  у школы: прощание, дочка уходит, мама смотрит время и спешит.
const yawTo = (a: THREE.Vector3, b: THREE.Vector3) => Math.atan2(b.x - a.x, b.z - a.z);

const DaylightLights: React.FC = () => (
  <>
    <hemisphereLight args={["#EAF4FF", "#9C9486", 1.0]} />
    <directionalLight position={[6, 9, 9]} intensity={2.4} color="#FFF3DE" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
  </>
);

// ---------------------------------------------------------------- A, B
// Подъезд в (0, 0, 0); машина мамы у бордюра, перёд — к −x, правый борт —
// к дому. Задняя правая дверь: петля (1.8, 3.53), дверь — к +x.
const CAR = new THREE.Vector3(1.6, 0, 4.4);
const HINGE = new THREE.Vector3(1.8, 0, 3.53);
const MOM_AT_DOOR = new THREE.Vector3(2.62, 0, 2.98);
const GIRL_WAIT = new THREE.Vector3(3.15, 0, 2.55);
const doorAngle = (t: number) => ease(t, 63.5, 64.3) * 1.1;
// ручка задней двери (снаружи) при угле a
const rearHandle = (a: number) => {
  const along = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
  const out = new THREE.Vector3(-Math.sin(a), 0, -Math.cos(a));
  return HINGE.clone().add(along.multiplyScalar(0.8)).add(out.multiplyScalar(0.04)).setY(0.82);
};

const EntranceView: React.FC<{ t: number }> = ({ t }) => {
  const mom = useCharacter("mom_out");
  const girl = useCharacter("girl");
  // дочка выходит первой и ждёт у машины
  const gw = walk(girl, { from: new THREE.Vector3(0.15, 0, 0.55), to: GIRL_WAIT, t0: 60.9, speed: 1.15 }, t, 7);
  if (gw.done) standTurn(girl, GIRL_WAIT.x, GIRL_WAIT.z, (tt) => mix(gw.yaw, yawTo(GIRL_WAIT, MOM_AT_DOOR), ease(tt, 64.0, 64.5)), t, 7);
  armsDown(girl, t, { swingL: -gw.swing, swingR: gw.swing, bend: 0.06 });
  curlFingers(girl, "L", 0.35);
  curlFingers(girl, "R", 0.35);
  // мама — следом, с сумкой; открывает заднюю дверь левой рукой
  const mw = walk(mom, { from: new THREE.Vector3(-0.1, 0, 0.1), to: MOM_AT_DOOR, t0: 61.0, speed: 1.45 }, t, 1);
  if (mw.done) standTurn(mom, MOM_AT_DOOR.x, MOM_AT_DOOR.z, (tt) => mix(mw.yaw, yawTo(MOM_AT_DOOR, rearHandle(0.5)), ease(tt, 63.0, 63.4)), t, 1);
  armsDown(mom, t, { swingL: -mw.swing, swingR: mw.swing * 0.3, bend: 0.06 });
  const a = doorAngle(t);
  const hk = ease(t, 63.2, 63.55) * (1 - ease(t, 64.4, 64.8));
  if (hk > 0) {
    const hp = rearHandle(a);
    const out = new THREE.Vector3(-Math.sin(a), 0, -Math.cos(a));
    ik2(mom, "upperarm01.L", "lowerarm01.L", "wrist.L", bonePos(mom, "wrist.L").lerp(hp.clone().add(out.clone().multiplyScalar(0.06)).add(new THREE.Vector3(0, 0.0, 0)), hk), at(mom, 0.55, 0.8, -0.3));
    orientHand(mom, "L", new THREE.Vector3(Math.cos(a), -0.2, -Math.sin(a)).normalize().negate(), out.clone().negate());
    curlFingers(mom, "L", 0.7, 0.5);
  } else curlFingers(mom, "L", 0.25);
  curlFingers(mom, "R", 0.7, 0.4);
  lookAt(mom, t < 63 ? at(mom, 0, 1.4, 2) : rearHandle(a), 0.8);
  lookAt(girl, t < 64 ? at(girl, 0, 1.1, 2) : bonePos(mom, "head"), 0.8);
  face(mom, t, [], { worry: 0.3 }, 1);
  face(girl, t, [], { smile: 0.15 }, 7);
  const entrDoor = t < 61.4 ? 1.2 : 1.2 * (1 - ease(t, 61.8, 63.0));
  let cam: Cam;
  if (t < 63.2) cam = camPath([{ t: 61, pos: [5.6, 1.7, 1.2], target: [1.2, 1.0, 1.0], fov: 44 }, { t: 63.2, pos: [5.4, 1.65, 1.0], target: [2.0, 1.0, 2.2], fov: 44 }], t);
  else cam = single(bonePos(mom, "head").lerp(rearHandle(0.6), 0.45), new THREE.Vector3(-0.2, 0, -1), 2.1, 40, 0.2);
  return (
    <>
      <CameraRig cam={cam} />
      <DaylightLights />
      <Entrance doorOpen={entrDoor} />
      <MomCar pos={[CAR.x, 0, CAR.z]} rotY={-Math.PI / 2} rearDoor={a / 1.1} />
      <Car pos={[-6.5, 0, 4.6]} rotY={-Math.PI / 2} color="#E4E4E2" />
      <Character rig={mom} />
      <Character rig={girl} />
      <Backpack rig={girl} color="#2F5DA8" />
      <group position={gripPoint(mom, "R")} rotation={[0, mom.root.rotation.y + Math.PI / 2, 0]}>
        <MomBagHanging />
      </group>
    </>
  );
};

// ---------------------------------------------------------------- C, D
// Салон: сиденье водителя — (0, 0, 0), перёд — +z; дочка — сзади справа.
const driver = (rig: Rig, t: number) => {
  place(rig, 0, 0, 0);
  sit(rig, 0.43, 0.6, -0.06);
  const c = new THREE.Vector3(0, 0.86, 0.5);
  const up = new THREE.Vector3(0, 0.91, 0.41);
  const right = new THREE.Vector3(1, 0, 0);
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    const grip = c.clone().add(right.clone().multiplyScalar(sx * 0.165)).add(up.clone().multiplyScalar(0.08));
    const fingers = up.clone().multiplyScalar(0.6).add(right.clone().multiplyScalar(-sx * 0.6)).add(new THREE.Vector3(0, 0, 0.3)).normalize();
    const wrist = grip.clone().sub(fingers.clone().multiplyScalar(0.07)).add(new THREE.Vector3(0, 0, -0.02));
    ik2(rig, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, wrist, at(rig, sx * 0.45, 0.6, 0.1));
    orientHand(rig, side, fingers, new THREE.Vector3(-sx * 0.4, -0.3, 0.8).normalize());
    curlFingers(rig, side, 0.75, 0.45);
  }
  // взгляд — только на дорогу (на миг — в зеркало)
  const mirror = ease(t, 67.6, 67.9) * (1 - ease(t, 68.3, 68.6));
  const road = new THREE.Vector3(Math.sin(t * 0.4) * 0.3, 1.2, 8);
  lookAt(rig, road.lerp(new THREE.Vector3(-0.37, 1.42, 0.82), mirror * 0.8), 1);
};

const BUCKLE = new THREE.Vector3(-0.47, 0.44, -0.86);
const ANCHOR = new THREE.Vector3(-1.08, 1.04, -1.1);
const LAP_ANCHOR = new THREE.Vector3(-1.06, 0.42, -0.8);

const InteriorView: React.FC<{ t: number }> = ({ t }) => {
  const mom = useCharacter("mom_out");
  const girl = useCharacter("girl");
  driver(mom, t);
  face(mom, t, [], { worry: 0.35 }, 1);
  // дочка сидит сзади справа; правой рукой протягивает ремень к замку
  place(girl, REAR_SEAT.x, REAR_SEAT.z, 0);
  sit(girl, 0.385, 0.36, -0.04);
  const gd = dims(girl);
  const shoulderR = at(girl, -0.12 * gd.scale, gd.shoulder + 0.03, 0.05);
  const chest = at(girl, 0.02, gd.shoulder - 0.17, 0.12);
  const k = ease(t, 64.7, 65.55);
  const buckled = t > 65.6;
  const tongue = shoulderR.clone().add(new THREE.Vector3(0, -0.05, 0.08)).lerp(BUCKLE.clone().add(new THREE.Vector3(0, 0.05, 0.02)), k);
  const hand = ease(t, 64.5, 64.8) * (1 - ease(t, 65.7, 66.1));
  const restR = at(girl, -0.1, 0.5, 0.3);
  ik2(girl, "upperarm01.R", "lowerarm01.R", "wrist.R", restR.lerp(tongue.clone().add(new THREE.Vector3(0, 0.03, 0.03)), hand), at(girl, -0.45, 0.55, 0.1));
  orientHand(girl, "R", new THREE.Vector3(0, -0.4, 1).normalize().lerp(new THREE.Vector3(0.5, -0.8, 0.1).normalize(), hand).normalize(), new THREE.Vector3(0, -1, 0).lerp(new THREE.Vector3(0, 0, -1), hand).normalize());
  curlFingers(girl, "R", 0.35 + 0.35 * hand, 0.5);
  ik2(girl, "upperarm01.L", "lowerarm01.L", "wrist.L", at(girl, 0.11, 0.5, 0.3), at(girl, 0.45, 0.55, 0.1));
  orientHand(girl, "L", new THREE.Vector3(0, -0.4, 1).normalize(), new THREE.Vector3(0, -1, 0));
  curlFingers(girl, "L", 0.35);
  const gLook = t < 66.2 ? tongue.clone().lerp(BUCKLE, 0.5) : new THREE.Vector3(-2.5, 1.0, 0.5);
  lookAt(girl, gLook, 0.8);
  face(girl, t, [], { smile: buckled ? 0.25 : 0.05 }, 7);
  const belt = buckled ? [ANCHOR, shoulderR, chest, BUCKLE] : [ANCHOR, shoulderR, tongue];
  // дорога: машина трогается, мир — навстречу
  const v = mix(0, 7, ease(t, 65.8, 67.5));
  const s = Math.max(0, t - 65.8) * v * 0.6;
  let cam: Cam;
  if (t < 66.6) cam = camPath([{ t: 64.5, pos: [-0.36, 1.12, -0.05], target: [-0.7, 0.78, -0.9], fov: 56 }, { t: 66.6, pos: [-0.36, 1.12, -0.1], target: [-0.7, 0.8, -0.9], fov: 54 }], t);
  else cam = camPath([{ t: 66.6, pos: [-0.72, 1.18, 0.42], target: [-0.02, 1.15, 0.05], fov: 44 }, { t: 69.2, pos: [-0.7, 1.17, 0.38], target: [-0.02, 1.15, 0.05], fov: 42 }], t);
  return (
    <>
      <CameraRig cam={cam} />
      <DaylightLights />
      <group position={[2.0, -0.25, 0]}>
        <Street offset={s} />
      </group>
      <Car pos={[-0.37, -0.25, 14]} color="#5D6B7A" />
      <CarInterior phone={null} />
      <RearSeat />
      <Character rig={mom} />
      <Character rig={girl} />
      <Belt pts={belt} />
      {buckled ? <Belt pts={[LAP_ANCHOR, at(girl, -0.08, 0.5, 0.12), BUCKLE]} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- E
const RoadView: React.FC<{ t: number }> = ({ t }) => {
  const s = (t - 69.2) * 7;
  const oncoming = useMemo(() => [0, 1, 2, 3].map((i) => ({ z0: 25 + i * 22, c: ["#C8CDD4", "#8C1C2B", "#F2F2F2", "#3E5C76"][i] })), []);
  const cam: Cam = camPath([{ t: 69.2, pos: [-6.2, 1.7, 8.5], target: [-0.4, 0.7, 0.4], fov: 36 }, { t: 72, pos: [-6.4, 1.7, 5.0], target: [-0.4, 0.7, -0.2], fov: 36 }], t);
  return (
    <>
      <CameraRig cam={cam} />
      <DaylightLights />
      <group position={[2.0, -0.25, 0]}>
        <Street offset={s} />
      </group>
      <MomCar pos={[-0.37, -0.25, 0]} />
      <Car pos={[-0.37, -0.25, 9]} color="#E4E4E2" />
      {oncoming.map((o, i) => (
        <Car key={i} pos={[3.6, -0.25, ((((o.z0 - s - (t - 69.2) * 7) % 120) + 120) % 120) - 30]} rotY={Math.PI} color={o.c} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------- F
// У школы: вход — (0, 0, 0), ворота — z = 6; машина у бордюра за воротами.
const GIRL_S = new THREE.Vector3(0.3, 0, 6.65);
const MOM_S = new THREE.Vector3(0.88, 0, 6.85);
const SCHOOL_DOOR = new THREE.Vector3(0.05, 0, 0.9);

const SchoolView: React.FC<{ t: number }> = ({ t }) => {
  const mom = useCharacter("mom_out");
  useFontReady();
  const girl = useCharacter("girl");
  const sp = useSpeech(["d03", "m05"]);
  const lock = useScreenTexture(drawLock("08:03"), "lock");
  // дочка: прощается, уходит к школе (76.3–79.8)
  const gw = walk(girl, { from: GIRL_S, to: SCHOOL_DOOR, t0: 76.3, speed: 1.15 }, t, 7);
  if (t < 76.3) standTurn(girl, GIRL_S.x, GIRL_S.z, () => yawTo(GIRL_S, MOM_S), t, 7);
  armsDown(girl, t, { swingL: -gw.swing, swingR: gw.swing, bend: 0.06 });
  curlFingers(girl, "L", 0.35);
  curlFingers(girl, "R", 0.35);
  // мама: рука на плече дочки во время «Жакшы оку», затем смотрит время
  const mw = walk(mom, { from: MOM_S, to: new THREE.Vector3(2.4, 0, 6.8), t0: 79.4, speed: 1.6 }, t, 1);
  if (t < 79.4) standTurn(mom, MOM_S.x, MOM_S.z, (tt) => mix(yawTo(MOM_S, GIRL_S), yawTo(MOM_S, SCHOOL_DOOR) + 0.3, ease(tt, 76.6, 77.4)), t, 1);
  armsDown(mom, t, { swingL: -mw.swing, swingR: mw.swing * 0.3, bend: 0.06 });
  handOnShoulder(mom, "R", girl, "L", ease(t, sp.m05.from - 0.6, sp.m05.from - 0.1) * (1 - ease(t, sp.m05.to + 0.2, sp.m05.to + 0.7)));
  const look = ease(t, 78.2, 78.6) * (1 - ease(t, 79.3, 79.6));
  if (look > 0) phoneRead(mom, "L", look, 0.05, 0.27);
  else curlFingers(mom, "L", 0.45, 0.3);
  const phoneM = phoneMatrix(mom, "L");
  const momHead = bonePos(mom, "head");
  const girlHead = bonePos(girl, "head");
  lookAt(girl, t < 76.3 ? momHead : at(girl, 0, 1.2, 2), 0.85);
  let mLook = girlHead;
  if (look > 0.4) mLook = new THREE.Vector3().setFromMatrixPosition(phoneM);
  if (t > 79.4) mLook = at(mom, 0, 1.4, 2);
  lookAt(mom, mLook, 0.85);
  face(girl, t, sp.d03.words, { smile: 0.5 }, 7);
  face(mom, t, sp.m05.words, { smile: t < 77.5 ? 0.45 : 0.1, worry: look > 0.3 ? 0.5 : 0 }, 1);
  turn(mom, "head", X, t > sp.m05.to && t < sp.m05.to + 0.7 ? Math.sin(((t - sp.m05.to) / 0.7) * Math.PI) * 0.06 : 0);

  let cam: Cam;
  const pp = new THREE.Vector3().setFromMatrixPosition(phoneM);
  if (t < 73.2) cam = twoShot(momHead, girlHead, new THREE.Vector3(-2.5, 1, 12), 40, 0.75, 0.35);
  else if (t < 75.0) cam = overShoulder(momHead, girlHead.clone().add(new THREE.Vector3(0, -0.05, 0)), "L", 0.5, 0.22, 0.0, 34);
  else if (t < 76.6) cam = overShoulder(girlHead, momHead.clone().add(new THREE.Vector3(0, -0.06, 0)), "R", 0.45, 0.2, -0.05, 36);
  else if (t < 78.2) cam = single(momHead, new THREE.Vector3(-0.15, 0, -1), 2.6, 36, 0.3);
  else if (t < 79.4) cam = overShoulder(momHead, pp, "R", 0.32, 0.12, 0.06, 36);
  else cam = single(momHead, new THREE.Vector3(-0.4, 0, 1), 3.0, 40, 0.35);
  return (
    <>
      <CameraRig cam={cam} />
      <DaylightLights />
      <SchoolYard />
      <MomCar pos={[2.6, 0, 7.95]} rotY={-Math.PI / 2} />
      <Character rig={mom} />
      <Character rig={girl} />
      <Backpack rig={girl} color="#2F5DA8" />
      {look > 0.05 ? <Phone screen={look > 0.5 ? lock : null} matrix={phoneM} glow={0.95} /> : null}
    </>
  );
};

const DriveInner: React.FC = () => {
  const t = useShotTime("drive");
  if (t < 64.5) return <EntranceView t={t} />;
  if (t < 69.2) return <InteriorView t={t} />;
  if (t < 72.0) return <RoadView t={t} />;
  return <SchoolView t={t} />;
};

export const DriveScene: React.FC = () => (
  <Stage>
    <DriveInner />
  </Stage>
);
