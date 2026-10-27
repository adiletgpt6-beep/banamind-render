import * as THREE from "three";
import { useShotTime, useSpeech } from "../context";
import { drawMonitor, drawWorkMissed } from "../screens";
import { CoatRack, GiletHanging, MomBagHanging } from "../sets";
import { gripPoint } from "../three/actions";
import { Character, useCharacter } from "../three/character";
import { face } from "../three/face";
import { armsDown, at, dims, ease, mix, place, sit, standTurn, walk } from "../three/poses";
import { Phone, useFontReady, useScreenTexture } from "../three/props";
import { bonePos, curlFingers, ik2, lookAt, orientHand, turn, X, Y, type Rig } from "../three/rig";
import { BishkekView, Desk, OfficeChair, OfficeRoom } from "../three/sets";
import { WallClock } from "../three/sets2";
import { CameraRig, camPath, Stage, type Cam } from "../three/stage";

// Офис (80–94 с). Стол мамы — (0, 0, 0), она садится лицом к −z; коллега —
// за соседним столом слева, поворачивается к ней на стуле. Вешалка — справа.
const MOM_SEAT = { x: 0, z: 0.58 };
const SEAT_Y = 0.53;
const COL_SEAT = { x: -1.55, z: 0.5 };
const RACK = new THREE.Vector3(1.3, 0, 1.15);
const AT_RACK = new THREE.Vector3(1.22, 0, 0.62);
const HOOK_GILET = new THREE.Vector3(1.37, 1.69, 1.1);
const HOOK_BAG = new THREE.Vector3(1.23, 1.69, 1.14);
const PHONE_DESK = new THREE.Vector3(0.42, 0.7595, 0.18);

const Lights: React.FC = () => (
  <>
    <hemisphereLight args={["#EAF2FF", "#B79E86", 0.85]} />
    <directionalLight position={[1.5, 3.5, 5]} intensity={2.1} color="#FFF4E2" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} />
    <directionalLight position={[-2, 2.5, -3]} intensity={1.0} color="#DDE8FF" />
    <pointLight position={[0.8, 2.6, 0.4]} intensity={0.8} distance={6} color="#FFE7CF" />
  </>
);

// Сидит за столом и печатает (кисти на клавиатуре).
const seatedTyping = (rig: Rig, t: number, seat: { x: number; z: number }, yaw: number, typing = 1) => {
  place(rig, seat.x, seat.z, yaw);
  sit(rig, SEAT_Y, 0.48, 0.1);
  turn(rig, "spine02", X, 0.05);
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    const tap = Math.max(0, Math.sin(t * 27 + sx * 1.3)) * 0.012 * typing;
    ik2(rig, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, at(rig, sx * 0.11, 0.795 + tap, 0.5), at(rig, sx * 0.45, 0.75, 0.0));
    const fwd = new THREE.Vector3(0, -0.25, 1).applyQuaternion(rig.root.quaternion).normalize();
    orientHand(rig, side, fwd, new THREE.Vector3(0, -1, 0));
    curlFingers(rig, side, 0.25);
  }
};

const OfficeInner: React.FC = () => {
  const t = useShotTime("office");
  const momOut = useCharacter("mom_out");
  useFontReady();
  const mom = useCharacter("mom");
  const col = useCharacter("colleague");
  const sp = useSpeech(["c01", "m06"]);
  const monitor = useScreenTexture(drawMonitor(t < 86 ? "08:20" : "08:21"), t < 86 ? "a" : "b", 960, 560);
  const missed = useScreenTexture(drawWorkMissed(), "missed");

  // ---- мама: входит (в жилете), снимает и вешает жилет и сумку, садится
  const withGilet = t < 83.4;
  const rig = withGilet ? momOut : mom;
  const w = walk(rig, { from: new THREE.Vector3(1.45, 0, -2.9), to: AT_RACK, t0: 80.0, speed: 1.5 }, t, 1);
  const seatK = ease(t, 85.2, 86.2);
  const giletHang = ease(t, 83.5, 84.15);
  const bagHang = ease(t, 84.25, 84.9);
  if (t < 85.0) {
    if (w.done) standTurn(rig, AT_RACK.x, AT_RACK.z, (tt) => mix(w.yaw, 0.12, ease(tt, 82.3, 82.8)), t, 1);
    armsDown(rig, t, { swingL: -w.swing * 0.4, swingR: w.swing * 0.4, bend: 0.06 });
    // снимает жилет: руки к вороту (82.8–83.4)
    const collar = ease(t, 82.75, 83.3);
    if (withGilet && collar > 0) {
      const d = dims(rig);
      for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
        const p = at(rig, sx * 0.09 * d.scale, d.shoulder + 0.02, 0.1);
        ik2(rig, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, bonePos(rig, `wrist.${side}`).lerp(p.clone().add(new THREE.Vector3(0, -0.05, 0.02)), collar), at(rig, sx * 0.5, 0.8, -0.2));
        orientHand(rig, side, new THREE.Vector3(0, 1, 0), at(rig, 0, 0, -1).sub(at(rig, 0, 0, 0)));
        curlFingers(rig, side, 0.7);
      }
    }
    // вешает: правая — жилет, левая — сумку
    if (!withGilet) {
      const hk = (k: number, side: "L" | "R", hook: THREE.Vector3) => {
        if (k <= 0 || k >= 1.3) return;
        const lift = Math.sin(Math.min(1, k) * Math.PI);
        const p = bonePos(rig, `wrist.${side}`).lerp(hook.clone().add(new THREE.Vector3(0, -0.07, -0.05)), lift);
        ik2(rig, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, p, at(rig, side === "L" ? 0.5 : -0.5, 0.8, -0.3));
        orientHand(rig, side, new THREE.Vector3(0, 1, 0.2).normalize(), new THREE.Vector3(0, 0, 1));
        curlFingers(rig, side, 0.7);
      };
      hk(giletHang, "L", HOOK_GILET);
      hk(bagHang, "R", HOOK_BAG);
    }
  } else {
    // садится: из стойки у стула — на сиденье, подкатывается
    place(mom, MOM_SEAT.x, MOM_SEAT.z + 0.22 * (1 - ease(t, 86.2, 86.8)), Math.PI);
    const d = dims(mom);
    sit(mom, mix(d.hip - 0.012, SEAT_Y, seatK), mix(0.08, 0.48, seatK), mix(0, 0.1, seatK));
    turn(mom, "spine04", X, Math.sin(Math.PI * seatK) * 0.3);
    // поворачивается к коллеге во время разговора
    const toCol = ease(t, sp.c01.from + 0.2, sp.c01.from + 0.8) * (1 - ease(t, 92.0, 92.6));
    turn(mom, "spine03", Y, 0.45 * toCol);
    armsDown(mom, t, { bend: 0.05 + 0.25 * seatK });
    // руки на стол
    const onDesk = ease(t, 86.3, 86.9);
    for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
      const p = at(mom, sx * 0.14, 0.785, 0.42);
      ik2(mom, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, bonePos(mom, `wrist.${side}`).lerp(p, onDesk), at(mom, sx * 0.45, 0.6, 0));
      if (onDesk > 0.3) orientHand(mom, side, new THREE.Vector3(0, -0.25, 1).applyQuaternion(mom.root.quaternion).normalize(), new THREE.Vector3(0, -1, 0));
      curlFingers(mom, side, 0.3);
    }
  }
  const momHead = bonePos(rig, "head");

  // ---- коллега: печатает; к реплике поворачивается на стуле к маме
  const colYaw = mix(Math.PI + 0.1, Math.PI * 0.62, ease(t, sp.c01.from - 0.9, sp.c01.from - 0.2) * (1 - ease(t, 92.4, 93.2)));
  seatedTyping(col, t, COL_SEAT, colYaw, t < sp.c01.from - 1 || t > 93 ? 1 : 0);
  const colHead = bonePos(col, "head");
  lookAt(col, t > sp.c01.from - 0.9 && t < 92.8 ? momHead : at(col, 0, 1.0, 0.6), 0.85);
  face(col, t, sp.c01.words, { worry: t > sp.c01.from - 0.3 && t < sp.m06.to ? 0.25 : 0, smile: t > sp.m06.to - 0.5 ? 0.25 : 0.05 }, 5);

  // ---- взгляд мамы, лицо
  let mLook = at(rig, 0, 1.45, 2);
  if (t > 82.4 && t < 85) mLook = HOOK_GILET;
  if (t > 86.2) mLook = new THREE.Vector3(0, 1.02, -0.2);
  if (t > sp.c01.from + 0.1 && t < 92.2) mLook = colHead;
  if (t > 92.6) mLook = PHONE_DESK;
  lookAt(rig, mLook, 0.85);
  const exhale = t > 93.2 ? Math.sin(Math.min(1, (t - 93.2) / 0.8) * Math.PI) : 0;
  turn(rig, "spine04", X, exhale * 0.05);
  face(rig, t, sp.m06.words, { worry: 0.45, smile: t > sp.m06.from - 0.3 && t < sp.m06.to ? 0.12 : 0, squint: exhale * 0.7 }, 1);

  const phoneM = new THREE.Matrix4().compose(PHONE_DESK, new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0.3)), new THREE.Vector3(1, 1, 1));
  const buzz = t > 92.6 && t < 93.3 ? new THREE.Matrix4().makeTranslation(Math.sin(t * 190) * 0.0018, 0, 0) : new THREE.Matrix4();
  const phoneOn = t > 92.6;

  const giletOnRack = t > 84.1;
  const bagOnRack = t > 84.85;
  const giletPos = giletOnRack ? HOOK_GILET : gripPoint(mom, "L");
  const bagPos = bagOnRack ? HOOK_BAG.clone().add(new THREE.Vector3(0, 0.02, 0)) : gripPoint(rig, "R");

  let cam: Cam;
  if (t < 82.75) cam = camPath([{ t: 80, pos: [-1.0, 1.6, 2.05], target: [1.3, 1.1, -1.4], fov: 46 }, { t: 82.75, pos: [-0.8, 1.58, 2.0], target: [1.25, 1.15, 0.2], fov: 44 }], t);
  else if (t < 83.4) cam = { pos: new THREE.Vector3(0.55, 1.5, 2.0), target: new THREE.Vector3(1.22, 1.32, 0.62), fov: 38 };
  else if (t < 85.0) cam = camPath([{ t: 83.4, pos: [2.3, 1.5, -0.35], target: [1.25, 1.35, 0.9], fov: 40 }, { t: 85, pos: [2.25, 1.5, -0.3], target: [1.25, 1.35, 0.9], fov: 40 }], t);
  else if (t < sp.c01.from - 0.2) cam = camPath([{ t: 85, pos: [0.25, 1.3, -0.65], target: [0.0, 1.05, 0.62], fov: 42 }, { t: 86.6, pos: [0.25, 1.28, -0.6], target: [0.0, 1.0, 0.62], fov: 40 }], t);
  else if (t < sp.m06.from - 0.2) cam = { pos: new THREE.Vector3(-0.55, 1.3, -0.15), target: colHead.clone().add(new THREE.Vector3(0, -0.12, 0)), fov: 36 };
  else if (t < 92.5) cam = camPath([{ t: 88, pos: [-0.85, 1.3, 1.25], target: [momHead.x, momHead.y - 0.1, momHead.z], fov: 34 }, { t: 92.5, pos: [-0.8, 1.3, 1.15], target: [momHead.x, momHead.y - 0.1, momHead.z], fov: 32 }], t);
  else if (t < 93.3) cam = { pos: PHONE_DESK.clone().add(new THREE.Vector3(0.02, 0.32, 0.12)), target: PHONE_DESK, fov: 34 };
  else cam = { pos: momHead.clone().add(new THREE.Vector3(0.25, 0.0, -0.75)), target: momHead.clone().add(new THREE.Vector3(0, -0.08, 0)), fov: 34 };

  return (
    <>
      <CameraRig cam={cam} />
      <Lights />
      <OfficeRoom />
      <BishkekView z={2.6} />
      <Desk pos={[0, 0, 0]} screen={monitor} />
      <OfficeChair pos={[MOM_SEAT.x, 0, (t < 85 ? MOM_SEAT.z + 0.22 : MOM_SEAT.z + 0.22 * (1 - ease(t, 86.2, 86.8))) + 0.04]} rotY={Math.PI} />
      <Desk pos={[-1.55, 0, -0.1]} rotY={0} />
      <OfficeChair pos={[COL_SEAT.x, 0, COL_SEAT.z + 0.04]} rotY={colYaw} />
      <Desk pos={[-0.3, 0, -2.6]} rotY={Math.PI} />
      <WallClock pos={[-3.28, 2.1, 0.6]} rotY={Math.PI / 2} minutes={8 * 60 + 20 + (t - 80) / 10} />
      <CoatRack pos={[RACK.x, 0, RACK.z]} />
      <Character rig={rig} />
      <Character rig={col} />
      {!withGilet ? (
        <group position={giletPos} rotation={[0, giletOnRack ? Math.PI : rig.root.rotation.y, 0]}>
          <GiletHanging />
        </group>
      ) : null}
      <group position={bagPos} rotation={[0, (bagOnRack ? 0 : rig.root.rotation.y) + Math.PI / 2, 0]}>
        <MomBagHanging />
      </group>
      <Phone screen={phoneOn ? missed : null} matrix={phoneM.clone().premultiply(buzz)} glow={0.95} />
    </>
  );
};

export const OfficeScene: React.FC = () => (
  <Stage>
    <OfficeInner />
  </Stage>
);
