import { useMemo } from "react";
import * as THREE from "three";
import { useShotTime, useSpeech } from "../context";
import { drawCall, drawChat, drawMonitor, drawReminder } from "../screens";
import { Character, handHold, heldWorld, useCharacter } from "../three/character";
import { face } from "../three/face";
import { armsDown, at, ease, mixYaw, place, sit, standTurn, walk } from "../three/poses";
import { Phone, useFontReady, useScreenTexture } from "../three/props";
import { bonePos, curlFingers, ik2, lookAt, orientHand, turn, X, Y, type Rig } from "../three/rig";
import { BishkekView, Desk, OfficeChair, OfficeRoom } from "../three/sets";
import { MeetingRoom, WallClock } from "../three/sets2";
import { blendM, gripPoint, Hanging, HandBag, Mug, readPhoneR, usePhoneHold } from "../three/actions";
import { CameraRig, camPath, Stage, type Cam } from "../three/stage";

// Офис: стол мамы (0, 0, 0), она сидит лицом к −z; стол руководителя у окна
// (2.2, 0, 1.4), он сидит спиной к окну (лицом к −z).
const BOSS_DESK: [number, number, number] = [2.2, 0, 1.25];
const BOSS_SEAT = { x: 2.2, z: 1.9 };
export const MOM_SEAT = { x: 0, z: 0.58 };
export const SEAT_Y = 0.53;

export const OfficeLights: React.FC<{ warm?: number }> = ({ warm = 0 }) => (
  <>
    <hemisphereLight args={[warm ? "#FFF0DF" : "#F1F6FF", "#C5B5A4", 1.3]} />
    <directionalLight
      position={[1.5, 3.5, 5]}
      intensity={1.35}
      color={warm ? "#FFD9A8" : "#FFF4E2"}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-radius={4}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-camera-left={-4}
      shadow-camera-right={4}
      shadow-camera-top={4}
      shadow-camera-bottom={-4}
    />
    <directionalLight position={[-2, 2.5, -3]} intensity={0.75} color="#EAF2FF" />
    <pointLight position={[0.8, 2.6, 0.4]} intensity={0.35} distance={6} color="#FFEEDC" />
  </>
);

export const OfficeSet: React.FC<{ monitor?: THREE.Texture | null; clockMin: number; chairZ?: number }> = ({ monitor, clockMin, chairZ = MOM_SEAT.z }) => (
  <>
    <OfficeRoom />
    <BishkekView z={2.6} />
    <Desk pos={[0, 0, 0]} screen={monitor} />
    <OfficeChair pos={[MOM_SEAT.x, 0, chairZ + 0.04]} rotY={Math.PI} />
    <Desk pos={BOSS_DESK} />
    <OfficeChair pos={[BOSS_SEAT.x, 0, BOSS_SEAT.z + 0.04]} rotY={Math.PI} />
    <Desk pos={[-1.7, 0, -0.2]} rotY={0.1} />
    <OfficeChair pos={[-1.7, 0, 0.45]} rotY={Math.PI + 0.3} />
    <Desk pos={[-0.3, 0, -2.6]} rotY={Math.PI} />
    <WallClock pos={[-3.28, 2.1, 0.6]} rotY={Math.PI / 2} minutes={clockMin} />
  </>
);

// Сидит за столом и печатает (кисти на клавиатуре).
export const seatedTyping = (rig: Rig, t: number, seat: { x: number; z: number }, typing = 1, skipR = false) => {
  place(rig, seat.x, seat.z, Math.PI);
  sit(rig, SEAT_Y, 0.48, 0.1);
  turn(rig, "spine02", X, 0.05);
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    if (side === "R" && skipR) continue;
    const tap = Math.max(0, Math.sin(t * 27 + sx * 1.3)) * 0.012 * typing;
    const target = at(rig, sx * 0.11, 0.795 + tap, 0.5);
    ik2(rig, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, target, at(rig, sx * 0.45, 0.75, 0.0));
    const fwd = new THREE.Vector3(0, -0.25, 1).applyQuaternion(rig.root.quaternion).normalize();
    orientHand(rig, side, fwd, new THREE.Vector3(0, -1, 0));
    curlFingers(rig, side, 0.25);
  }
};

// Папка с документами (в руке коллеги): начало координат — центр.
const Folder: React.FC<{ matrix: THREE.Matrix4 }> = ({ matrix }) => {
  const g = useMemo(() => new THREE.Group(), []);
  g.matrixAutoUpdate = false;
  g.matrix.copy(matrix);
  return (
    <primitive object={g}>
      <mesh position={[0, 0.06, 0.008]} castShadow>
        <boxGeometry args={[0.23, 0.31, 0.012]} />
        <meshStandardMaterial color="#2F6FDB" roughness={0.6} />
      </mesh>
    </primitive>
  );
};

// ---------------- 0–12 с: утро в офисе ----------------
// Мама приходит с сумкой, ставит её на стол, включает монитор. Подходит
// руководитель с кружкой; она негромко предупреждает, он спокойно согласен.
const MOM_STOP = new THREE.Vector3(0.52, 0, 0.5);
const BOSS_STOP = new THREE.Vector3(1.28, 0, 0.22);
const OfficeInner: React.FC = () => {
  const t = useShotTime("office");
  const mom = useCharacter("mom");
  useFontReady();
  const boss = useCharacter("boss");
  const sp = useSpeech(["m01", "b01"]);
  const on = t > 3.45;
  const monitor = useScreenTexture(on ? drawMonitor({ time: "09:02", progress: 0.1 }) : (g, w, h) => {
    g.fillStyle = "#0B0E14";
    g.fillRect(0, 0, w, h);
  }, on ? "on" : "off", 960, 560);

  // мама: проходит к своему столу
  const w = walk(mom, { from: new THREE.Vector3(1.85, 0, -0.75), to: MOM_STOP, t0: 0 }, t, 1);
  const toBoss = Math.atan2(BOSS_STOP.x - MOM_STOP.x, BOSS_STOP.z - MOM_STOP.z);
  if (w.done) {
    const yawAt = (tt: number) => mixYaw(mixYaw(w.yaw, Math.PI, ease(tt, 2.1, 3.05)), toBoss, ease(tt, 3.55, 4.4));
    standTurn(mom, MOM_STOP.x, MOM_STOP.z, yawAt, t, 1);
  }
  const talking = t > sp.m01.from - 0.2 && t < sp.m01.to + 0.2;
  armsDown(mom, t, { swingL: -w.swing, swingR: w.swing * 0.5, bend: 0.06 });
  // правая рука: сумка на стол (2.4–3.0), кнопка монитора (3.0–3.5)
  const tBag = ease(t, 2.35, 2.95);
  const tBtn = ease(t, 2.95, 3.3) * (1 - ease(t, 3.45, 3.85));
  const bagDesk = new THREE.Vector3(0.52, 0.79, 0.08);
  const btn = new THREE.Vector3(0.25, 0.95, -0.17);
  if (tBag > 0 && t < 3.9) {
    const rest = bonePos(mom, "wrist.R");
    let target = rest.clone().lerp(bagDesk.clone().add(new THREE.Vector3(0, 0.1, 0.05)), tBag * (1 - ease(t, 2.95, 3.1)));
    target = target.lerp(btn.clone().add(new THREE.Vector3(0.02, -0.02, 0.09)), tBtn);
    ik2(mom, "upperarm01.R", "lowerarm01.R", "wrist.R", target, at(mom, -0.5, 0.8, -0.3));
    const fwd = new THREE.Vector3(0, -0.4, 1).applyQuaternion(mom.root.quaternion).normalize();
    orientHand(mom, "R", fwd, new THREE.Vector3(0, -1, 0).lerp(new THREE.Vector3(0, 0, 1).applyQuaternion(mom.root.quaternion), tBtn).normalize());
    curlFingers(mom, "R", 0.5 * (1 - tBtn) + 0.15);
  } else curlFingers(mom, "R", t < 2.35 ? 0.6 : 0.2);
  // жест во время реплики: левая ладонь чуть вперёд
  if (talking) {
    const g = ease(t, sp.m01.from + 1.6, sp.m01.from + 2.2) * (1 - ease(t, sp.m01.to - 1.4, sp.m01.to - 0.6));
    const base = bonePos(mom, "wrist.L");
    const tgt = at(mom, 0.16, bonePos(mom, "upperleg01.L").y + 0.12, 0.26);
    ik2(mom, "upperarm01.L", "lowerarm01.L", "wrist.L", base.lerp(tgt, g), at(mom, 0.5, 0.9, -0.4));
    if (g > 0) orientHand(mom, "L", new THREE.Vector3(0, -0.2, 1).applyQuaternion(mom.root.quaternion).normalize(), new THREE.Vector3(-0.6, 0.6, 0).applyQuaternion(mom.root.quaternion).normalize(), g);
  }
  curlFingers(mom, "L", 0.22);
  // Do not read another character's pose before that pose has been set for
  // this frame. A previous rendered frame must never influence the gaze.
  const bossHead = new THREE.Vector3(BOSS_STOP.x, boss.proportions.scale * 1.5, BOSS_STOP.z);
  let look = at(mom, 0, 1.4, 1.5).lerp(bagDesk, ease(t, 2.1, 2.5));
  look = look.lerp(btn, ease(t, 2.85, 3.2)).lerp(bossHead, ease(t, 3.4, 4.1));
  lookAt(mom, look, 0.85);
  face(mom, t, sp.m01.words, { smile: 0.12 + (t > sp.b01.to ? 0.3 : 0), worry: talking ? 0.2 : 0 }, 1);

  // руководитель: идёт с кружкой, останавливается, слушает, кивает
  const bw = walk(boss, { from: new THREE.Vector3(2.25, 0, -1.6), to: BOSS_STOP, t0: 1.2 }, t, 3);
  const toMom = Math.atan2(MOM_STOP.x - BOSS_STOP.x, MOM_STOP.z - BOSS_STOP.z);
  if (bw.done) {
    standTurn(boss, BOSS_STOP.x, BOSS_STOP.z, (tt) => mixYaw(bw.yaw, toMom, ease(tt, 3.4, 4.25)), t, 3);
  }
  armsDown(boss, t, { swingL: -bw.swing, swingR: bw.swing * 0.3, bend: 0.05 });
  // кружка в правой руке у пояса
  ik2(boss, "upperarm01.R", "lowerarm01.R", "wrist.R", at(boss, -0.17, bonePos(boss, "upperleg01.R").y + 0.12, 0.2), at(boss, -0.5, 0.9, -0.4));
  orientHand(boss, "R", new THREE.Vector3(0, 0, 1).applyQuaternion(boss.root.quaternion), new THREE.Vector3(1, 0, 0).applyQuaternion(boss.root.quaternion));
  curlFingers(boss, "R", 0.65, 0.4);
  curlFingers(boss, "L", 0.2);
  const momHead = bonePos(mom, "head");
  lookAt(boss, bw.done ? momHead : at(boss, 0, 1.6, 1.5), 0.8);
  const nod = t > sp.b01.from - 0.3 && t < sp.b01.from + 0.7 ? Math.sin(((t - sp.b01.from + 0.3) / 1.0) * Math.PI) * 0.12 : 0;
  const listenNod = t > sp.m01.to - 0.6 && t < sp.m01.to + 0.2 ? Math.sin(((t - sp.m01.to + 0.6) / 0.8) * Math.PI) * 0.06 : 0;
  turn(boss, "head", X, nod + listenNod);
  face(boss, t, sp.b01.words, { smile: t > sp.m01.to - 0.5 ? 0.35 : 0.1 }, 4);

  // сумка: в руке → на столе
  const bagHand = gripPoint(mom, "R");
  const bagSet = ease(t, 2.55, 2.95);
  const bagPos = bagHand.clone().lerp(bagDesk.clone().add(new THREE.Vector3(0, 0.2, 0)), bagSet);
  const bagYaw = mixYaw(mom.root.rotation.y, Math.PI + 0.3, bagSet);
  const mugPos = gripPoint(boss, "R").add(new THREE.Vector3(0, 0.03, 0));

  let cam: Cam;
  if (t < 3.6) {
    cam = camPath(
      [
        { t: 0, pos: [-1.0, 1.75, -2.8], target: [1.85, 1.03, -0.65], fov: 46 },
        { t: 3.6, pos: [-1.2, 1.8, -1.85], target: [0.75, 1.08, 0.46], fov: 44 },
      ],
      t,
    );
    cam.target.set(mom.root.position.x + 0.08, 1.05, mom.root.position.z + 0.08);
  } else if (t < sp.b01.from - 0.25) {
    cam = camPath(
      [
        { t: 3.6, pos: [1.90, 1.78, -1.75], target: [0.54, 1.53, 0.47], fov: 37 },
        { t: 10, pos: [1.85, 1.76, -1.70], target: [0.54, 1.54, 0.47], fov: 36 },
      ],
      t,
    );
  } else {
    cam = camPath(
      [
        { t: 9.5, pos: [-0.40, 1.78, -1.15], target: [1.25, 1.54, 0.24], fov: 40 },
        { t: 12, pos: [-0.35, 1.76, -1.10], target: [1.25, 1.54, 0.24], fov: 39 },
      ],
      t,
    );
  }
  return (
    <>
      <CameraRig cam={cam} />
      <OfficeLights />
      <OfficeSet monitor={monitor} clockMin={9 * 60 + 2} />
      <Character rig={mom} />
      {t >= 3.6 ? <Character rig={boss} /> : null}
      <Hanging at={bagPos} yaw={bagYaw}>
        <HandBag />
      </Hanging>
      {t >= 3.6 ? <Hanging at={mugPos} yaw={boss.root.rotation.y}>
        <Mug />
      </Hanging> : null}
    </>
  );
};

// ------------- 12–25.4 с: напоминание, просьба коллеги -------------
const DeskInner: React.FC = () => {
  const t = useShotTime("desk");
  const mom = useCharacter("mom");
  useFontReady();
  const col = useCharacter("colleague");
  const sp = useSpeech(["c01", "m02"]);
  const monitor = useScreenTexture(drawMonitor({ time: "12:15", progress: 0.42 }), "m");
  const remindTime = t < 22 ? "12:15" : "12:16";
  const reminder = useScreenTexture(drawReminder(remindTime), remindTime);
  const hold = usePhoneHold(mom);
  const folderHold = useMemo(() => handHold(col, "L", 0.06, 0.03, -0.04), [col]);

  // мама: печатает → телефон вибрирует → берёт → читает → смотрит на коллегу
  const tReach = ease(t, 13.35, 13.85);
  const tDown = ease(t, 13.85, 14.05);
  const tLift = ease(t, 14.1, 14.6);
  const tLower = ease(t, 17.0, 17.6);
  seatedTyping(mom, t, MOM_SEAT, 1 - ease(t, 12.9, 13.3), true);
  turn(mom, "spine03", Y, -0.18 * ease(t, 16.3, 17.0));
  const deskPhone = new THREE.Vector3(0.46, 0.759, 0.2);
  const kbR = at(mom, -0.11, 0.795, 0.5);
  let rT = kbR.clone().lerp(deskPhone.clone().add(new THREE.Vector3(0.02, 0.06, 0.05)), tReach);
  rT = rT.lerp(deskPhone.clone().add(new THREE.Vector3(0.02, 0.03, 0.05)), tDown);
  if (tLift > 0) readPhoneR(mom, tLift * (1 - tLower * 0.6), rT, tLower * 0.12);
  else {
    ik2(mom, "upperarm01.R", "lowerarm01.R", "wrist.R", rT, at(mom, -0.45, 0.75, 0.0));
    orientHand(mom, "R", new THREE.Vector3(0, -0.25, 1).applyQuaternion(mom.root.quaternion).normalize(), new THREE.Vector3(0, -1, 0));
    curlFingers(mom, "R", 0.3 + 0.35 * tDown, 0.1);
  }
  // коллега подходит и стоит слева от мамы (её правая сторона — к окну)
  const colFrom = new THREE.Vector3(-1.6, 0, 1.6);
  const colTo = new THREE.Vector3(-0.62, 0, 0.95);
  const cw = walk(col, { from: colFrom, to: colTo, t0: 15.0 }, t, 2);
  const momHead = bonePos(mom, "head");
  if (cw.done) {
    const face2 = Math.atan2(momHead.x - colTo.x, momHead.z - colTo.z);
    standTurn(col, colTo.x, colTo.z, (tt) => mixYaw(cw.yaw, face2, ease(tt, 16.4, 17.1)), t, 2);
  }
  // в левой руке у коллеги папка (опущена вдоль бедра)
  armsDown(col, t, { swingL: -cw.swing * 0.3, swingR: cw.swing, bend: 0.06 });
  curlFingers(col, "L", 0.55, 0.3);
  const folderM = heldWorld(col, "L", folderHold);
  const colTalk = t > sp.c01.from - 0.2 && t < sp.c01.to + 0.2;
  const colHead = bonePos(col, "head");
  lookAt(col, t > 16.2 ? momHead : col.root.position.clone().add(new THREE.Vector3(Math.sin(cw.yaw), 1.6, Math.cos(cw.yaw))), 0.85);
  face(col, t, sp.c01.words, { smile: colTalk ? 0.3 : 0.15, worry: colTalk ? 0.15 : 0 }, 5);

  // взгляд мамы: монитор → телефон → коллега → часы → коллега
  const monitorP = new THREE.Vector3(0, 1.02, -0.2);
  const phoneP = bonePos(mom, "wrist.R").add(new THREE.Vector3(0, 0.08, 0));
  const clockP = new THREE.Vector3(-3.28, 2.1, 0.6);
  let look = monitorP.clone().lerp(new THREE.Vector3(0.46, 0.76, 0.2), ease(t, 12.7, 13.1));
  look = look.lerp(phoneP, ease(t, 14.1, 14.6));
  if (t > 16.3) look = phoneP.clone().lerp(colHead, ease(t, 16.3, 16.8));
  if (t > 22.3) look = colHead.clone().lerp(clockP, ease(t, 22.3, 22.7) * (1 - ease(t, 23.6, 24.0)));
  lookAt(mom, look);
  const worry = ease(t, 14.6, 15.2) * 0.6 + ease(t, 22.4, 23.0) * 0.3;
  face(mom, t, sp.m02.words, { worry: Math.min(0.85, worry), smile: t > sp.m02.from ? 0.12 : 0 }, 1);

  // телефон: лежит на столе (вибрирует) → в руке
  const vib = t >= 12.35 && t < 13.3 && Math.floor(t * 30) % 8 < 5 ? 1 : 0;
  const deskM = new THREE.Matrix4().compose(
    deskPhone.clone().add(new THREE.Vector3(Math.sin(t * 93) * 0.0018 * vib, 0.0045, Math.cos(t * 69) * 0.0015 * vib)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0.3)),
    new THREE.Vector3(1, 1, 1),
  );
  // позиция следует за рукой с момента хвата; ориентация (экраном к лицу)
  // меняется позже — пока кисть поворачивается при подъёме
  const handM = heldWorld(mom, "R", hold);
  const posM = blendM(deskM, handM, ease(t, 13.9, 14.15));
  const qDesk = new THREE.Quaternion().setFromRotationMatrix(deskM);
  const qHand = new THREE.Quaternion().setFromRotationMatrix(handM);
  const phoneM = new THREE.Matrix4().compose(new THREE.Vector3().setFromMatrixPosition(posM), qDesk.slerp(qHand, ease(t, 14.15, 14.6)), new THREE.Vector3(1, 1, 1));
  const phonePos = new THREE.Vector3().setFromMatrixPosition(phoneM);

  let cam: Cam;
  if (t < 14.6) {
    cam = camPath(
      [
        { t: 12, pos: [1.25, 1.36, -0.55], target: [0.2, 0.92, 0.38], fov: 40 },
        { t: 14.6, pos: [1.12, 1.32, -0.45], target: [0.2, 0.95, 0.4], fov: 38 },
      ],
      t,
    );
  } else if (t < 16.2) {
    // через плечо: экран читается
    cam = { pos: phonePos.clone().add(new THREE.Vector3(0.38, 0.3, 0.35)), target: phonePos, fov: 36 };
  } else if (t < 22.3) {
    cam = camPath(
      [
        { t: 16.2, pos: [0.35, 1.8, -2.25], target: [-0.3, 1.3, 0.8], fov: 46 },
        { t: 22.3, pos: [0.3, 1.78, -2.2], target: [-0.3, 1.3, 0.8], fov: 44 },
      ],
      t,
    );
    cam.target.copy(momHead.clone().lerp(colHead, 0.5));
  } else if (t < 23.1) {
    cam = { pos: new THREE.Vector3(-2.3, 1.95, 0.55), target: new THREE.Vector3(-3.28, 2.1, 0.6), fov: 30 };
  } else {
    cam = { pos: new THREE.Vector3(1.8, 1.62, -1.7), target: new THREE.Vector3(-0.28, 1.2, 0.8), fov: 40 };
  }
  const clockMin = 12 * 60 + 15 + ease(t, 12, 25) * 1.5;
  return (
    <>
      <CameraRig cam={cam} />
      <OfficeLights />
      <OfficeSet monitor={monitor} clockMin={clockMin} />
      <Character rig={mom} />
      {t > 14.6 ? <Character rig={col} /> : null}
      {t > 14.6 ? <Folder matrix={folderM} /> : null}
      <Phone screen={t >= 12.35 ? reminder : null} matrix={phoneM} glow={0.95} />
    </>
  );
};

// ---------------- переговорная (25.4–30 и 37.6–41.4 с) ----------------
// Мама и коллега сидят за столом лицом к телевизору (−z): видеозвонок.
export const MeetingView: React.FC<{ t: number; clockMin: number; chat?: { typed: string; sent: boolean; inShown: boolean } }> = ({ t, clockMin, chat }) => {
  const mom = useCharacter("mom");
  useFontReady();
  const col = useCharacter("colleague");
  const talk = Math.max(0, Math.sin(t * 9)) * (Math.sin(t * 1.3) > -0.3 ? 1 : 0);
  const tv = useScreenTexture(drawCall(talk), `call${Math.round(talk * 6)}`, 960, 540);
  const chatKey = chat ? `${chat.typed}|${chat.sent}|${chat.inShown}` : "none";
  const screen = useScreenTexture(
    chat ? drawChat({ side: "mom", time: "12:31", inShown: chat.inShown, typed: chat.typed, sent: chat.sent }) : drawReminder("12:24"),
    chatKey,
  );
  const hold = usePhoneHold(mom);

  // посадка: мама (−0.35, 0.75), коллега (0.45, 0.75), лицом к −z
  place(mom, -0.35, 0.78, Math.PI);
  sit(mom, SEAT_Y, 0.45, 0.04);
  place(col, 0.45, 0.82, Math.PI - 0.08);
  sit(col, SEAT_Y + 0.02, 0.46, 0.0);
  const tvP = new THREE.Vector3(0, 1.55, -1.8);
  // коллега: рука в жесте к экрану; кивает
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    const gest = side === "R" ? Math.max(0, Math.sin(t * 0.9)) * 0.08 : 0;
    ik2(col, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, at(col, sx * 0.16, 0.8 + gest, 0.42 + gest), at(col, sx * 0.5, 0.7, 0));
    orientHand(col, side, new THREE.Vector3(-sx * 0.3, -0.1, 1).applyQuaternion(col.root.quaternion).normalize(), new THREE.Vector3(0, -1, 0));
    curlFingers(col, side, 0.3);
  }
  lookAt(col, tvP, 0.9);
  turn(col, "head", X, Math.sin(t * 2.1) * 0.03);
  face(col, t, [], { smile: 0.2 }, 5);

  // мама: левая рука на столе, правая держит телефон низко (у края стола)
  ik2(mom, "upperarm01.L", "lowerarm01.L", "wrist.L", at(mom, 0.15, 0.8, 0.42), at(mom, 0.5, 0.7, 0));
  orientHand(mom, "L", new THREE.Vector3(0.3, -0.1, 1).applyQuaternion(mom.root.quaternion).normalize(), new THREE.Vector3(0, -1, 0));
  curlFingers(mom, "L", 0.3);
  const phoneUp = chat ? ease(t, 38.0, 38.5) : 0;
  const rest = at(mom, -0.12, 0.8, 0.4);
  if (phoneUp > 0) readPhoneR(mom, phoneUp * 0.8, rest, 0.1);
  else {
    ik2(mom, "upperarm01.R", "lowerarm01.R", "wrist.R", rest, at(mom, -0.5, 0.7, 0));
    orientHand(mom, "R", new THREE.Vector3(-0.3, -0.1, 1).applyQuaternion(mom.root.quaternion).normalize(), new THREE.Vector3(0, -1, 0));
    curlFingers(mom, "R", 0.3);
  }
  const tablePhone = new THREE.Matrix4().compose(new THREE.Vector3(-0.47, 0.765, 0.25), new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0.2)), new THREE.Vector3(1, 1, 1));
  const phoneM = blendM(tablePhone, heldWorld(mom, "R", hold), ease(t, 38.0, 38.5));
  const colHead = bonePos(col, "head");
  const clockP = new THREE.Vector3(-2.5, 2.2, -0.6);
  let look = tvP.clone();
  if (!chat) look = tvP.clone().lerp(clockP, ease(t, 27.2, 27.7) * (1 - ease(t, 28.8, 29.3)));
  else {
    const phoneP = new THREE.Vector3().setFromMatrixPosition(phoneM);
    look = tvP.clone().lerp(phoneP, ease(t, 37.75, 38.1));
    // неловкая пауза: взгляд на коллегу, он не замечает
    look = look.lerp(colHead, ease(t, 40.1, 40.4) * (1 - ease(t, 40.9, 41.2)));
  }
  lookAt(mom, look);
  face(mom, t, [], { worry: 0.55 + (chat ? 0.2 : 0) }, 1);

  let cam: Cam;
  if (!chat) {
    cam = camPath(
      [
        { t: 25.4, pos: [1.5, 1.38, -0.95], target: [0.05, 1.12, 0.8], fov: 42 },
        { t: 27.3, pos: [1.4, 1.36, -0.85], target: [0.05, 1.12, 0.8], fov: 40 },
        { t: 27.31, pos: [-1.6, 1.95, -0.2], target: [-2.5, 2.2, -0.6], fov: 32 },
        { t: 28.7, pos: [-1.6, 1.95, -0.2], target: [-2.5, 2.2, -0.6], fov: 30 },
        { t: 28.71, pos: [-0.9, 1.25, -0.4], target: [-0.35, 1.15, 0.75], fov: 34 },
        { t: 30, pos: [-0.85, 1.25, -0.35], target: [-0.35, 1.15, 0.75], fov: 32 },
      ],
      t,
    );
  } else if (t > 40.0) {
    // The awkward glance at the colleague: a frontal two-shot, so both faces
    // are visible instead of the back of the mother's turning head.
    cam = camPath(
      [
        { t: 40.0, pos: [0.05, 1.42, -1.5], target: [0.05, 1.1, 0.8], fov: 44 },
        { t: 41.4, pos: [0.05, 1.40, -1.4], target: [0.05, 1.1, 0.8], fov: 43 },
      ],
      t,
    );
  } else if (t < 38.6) {
    cam = camPath(
      [
        { t: 37.6, pos: [-1.0, 1.2, -0.3], target: [-0.1, 1.08, 0.8], fov: 34 },
        { t: 41.4, pos: [-0.9, 1.2, -0.2], target: [-0.1, 1.08, 0.8], fov: 32 },
      ],
      t,
    );
  } else {
    const phoneP = new THREE.Vector3().setFromMatrixPosition(phoneM);
    cam = { pos: phoneP.clone().add(new THREE.Vector3(0.4, 0.3, 0.35)), target: phoneP, fov: 36 };
  }
  return (
    <>
      <CameraRig cam={cam} />
      <hemisphereLight args={["#F2F6FF", "#BBB5AD", 1.25]} />
      <directionalLight position={[2.5, 3, 2]} intensity={1.25} castShadow shadow-mapSize={[1024, 1024]} shadow-radius={4} shadow-bias={-0.0004} shadow-normalBias={0.02} />
      <pointLight position={[0, 2.6, 0]} intensity={0.8} distance={5} color="#FFF1DE" />
      <MeetingRoom tv={tv} clockMin={clockMin} />
      <OfficeChair pos={[-0.35, 0, 0.82]} rotY={Math.PI} />
      <OfficeChair pos={[0.45, 0, 0.86]} rotY={Math.PI - 0.08} />
      <Character rig={mom} />
      <Character rig={col} />
      <Phone screen={chat ? screen : null} matrix={phoneM} glow={0.95} />
    </>
  );
};

const MeetingInner: React.FC = () => {
  const t = useShotTime("meeting");
  // время на часах «бежит»: 12:24 → 12:41 за 4,6 с — встреча затягивается
  const clockMin = 12 * 60 + 24 + ease(t, 27.3, 28.7) * 17;
  return <MeetingView t={t} clockMin={clockMin} />;
};

export const OfficeScene: React.FC = () => (
  <Stage>
    <OfficeInner />
  </Stage>
);
export const DeskScene: React.FC = () => (
  <Stage>
    <DeskInner />
  </Stage>
);
export const MeetingScene: React.FC = () => (
  <Stage>
    <MeetingInner />
  </Stage>
);
