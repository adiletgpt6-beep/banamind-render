import * as THREE from "three";
import { handOnShoulder, phoneMatrix, phoneRead, phoneToEar, posOf, strapsHands } from "../acts";
import { useShotTime, useSpeech } from "../context";
import { drawCall, drawDadMsg, drawFriendChat, drawVoiceMsg } from "../screens";
import { Apartment, doorHandle, KEYS_POS, MOM_BAG_POS, MomBagHanging } from "../sets";
import { Backpack, backpackStrapFront, gripPoint } from "../three/actions";
import { Character, useCharacter } from "../three/character";
import { face } from "../three/face";
import { armsDown, at, crouch, dims, ease, mix, place, stand, standTurn, walk } from "../three/poses";
import { Phone, useFontReady, useScreenTexture } from "../three/props";
import { bonePos, curlFingers, ik2, lookAt, orientHand, turn, X, type Rig } from "../three/rig";
import { WallClock } from "../three/sets2";
import { overShoulder } from "../cams";
import { CameraRig, camPath, Stage, type Cam } from "../three/stage";
import { GrannyView } from "./Granny";

// Квартира утром (0–61 с). Прихожая у правой стены: дочка в рюкзаке (G),
// папа у стола (D), мама у обувной тумбы складывает сумку (M0). Позы —
// функции времени t (секунды ролика), поэтому сцены режутся без скачков.
const G = new THREE.Vector3(1.65, 0, 0.95);
const D = new THREE.Vector3(0.85, 0, 0.65);
const M0 = new THREE.Vector3(1.93, 0, -0.62);
const M2 = new THREE.Vector3(1.13, 0, 1.03); // рядом с дочкой (звонок)
const KEYS_STAND = new THREE.Vector3(1.97, 0, -0.04);
const DOOR_STAND = new THREE.Vector3(2.12, 0, 0.3);
const OUT_G = new THREE.Vector3(3.7, 0, 0.75);
const OUT_M = new THREE.Vector3(3.6, 0, 0.45);
const CLOCK_POS: [number, number, number] = [2.28, 2.02, -1.71];

const yawTo = (a: THREE.Vector3, b: THREE.Vector3) => Math.atan2(b.x - a.x, b.z - a.z);
const clockMin = (t: number) => 7 * 60 + 36 + t / 6; // утро: 07:36 → ~07:44
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// «Дрожание» телефона при вибрации (двигается только телефон).
const buzz = (m: THREE.Matrix4, t: number, a: number, b: number) => {
  if (t < a || t > b) return m;
  const k = Math.sin(t * 190) * 0.0022;
  return m.clone().multiply(new THREE.Matrix4().makeTranslation(k, -k * 0.6, 0));
};

export const MorningLights: React.FC = () => (
  <>
    <hemisphereLight args={["#F3F6FF", "#B49C84", 0.95]} />
    <directionalLight position={[1.4, 3.2, -4.5]} intensity={1.9} color="#FFF1DA" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} shadow-normalBias={0.02} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} />
    <directionalLight position={[-1, 2.4, 4]} intensity={0.9} color="#E8EEFF" />
    <pointLight position={[1.2, 2.5, 1.4]} intensity={0.7} distance={6} color="#FFE9D0" />
  </>
);

// ---------------------------------------------------------------- позы
// Дочка стоит в рюкзаке, поворачивается к собеседнику.
const poseGirl = (girl: Rig, t: number, look: THREE.Vector3, yawAt: (tt: number) => number) => {
  standTurn(girl, G.x, G.z, yawAt, t, 7);
  armsDown(girl, t, { bend: 0.05 });
  curlFingers(girl, "L", 0.3);
  curlFingers(girl, "R", 0.3);
  lookAt(girl, look, 0.85);
};

// Дочка поправляет лямки рюкзака (0–2 с): тянет обе лямки вниз.
const strapsAt = (girl: Rig, t: number) => {
  const k = ease(t, 0.0, 0.4) * (1 - ease(t, 1.9, 2.4));
  const pull = Math.max(0, Math.sin(Math.min(1, t / 1.6) * Math.PI)) * 0.9;
  strapsHands(girl, k, pull, (s) => backpackStrapFront(girl, s));
  if (k > 0) turn(girl, "spine05", X, -0.03 * pull);
};

// Папа: читает сообщение (правая рука), опускает телефон, идёт за ключами.
const posePapa = (dad: Rig, t: number, girlHead: THREE.Vector3) => {
  const toG = yawTo(D, G);
  if (t < 12.0) {
    standTurn(dad, D.x, D.z, (tt) => mix(toG - 0.6, toG, ease(tt, 4.8, 5.5)), t, 9);
    armsDown(dad, t, { bend: 0.05 });
    const read = 1 - ease(t, 4.7, 5.5);
    phoneRead(dad, "R", Math.max(read, 0.3), 0.06 + (1 - read) * 0.32, 0.25 - 0.08 * (1 - read));
    curlFingers(dad, "L", 0.25);
    lookAt(dad, t < 5.0 ? posOf(phoneMatrix(dad, "R")) : girlHead, 0.85);
    return;
  }
  const w = walk(dad, { from: D, to: KEYS_STAND, t0: 12.0, speed: 1.4 }, t, 9);
  if (w.done) standTurn(dad, KEYS_STAND.x, KEYS_STAND.z, (tt) => mix(w.yaw, Math.PI / 2, ease(tt, 13.0, 13.4)), t, 9);
  armsDown(dad, t, { swingL: -w.swing, swingR: w.swing * 0.3, bend: 0.06 });
  phoneRead(dad, "R", 0.3, 0.38, 0.17);
  // левая рука берёт ключи (13.3–13.9)
  const reach = ease(t, 13.3, 13.65) * (1 - ease(t, 13.8, 14.2) * 0.6);
  if (reach > 0) {
    ik2(dad, "upperarm01.L", "lowerarm01.L", "wrist.L", bonePos(dad, "wrist.L").lerp(KEYS_POS.clone().add(V(-0.05, 0.07, 0.0)), reach), at(dad, 0.5, 0.8, -0.2));
    orientHand(dad, "L", V(0.6, -0.8, 0).normalize(), V(0, -1, 0));
  }
  curlFingers(dad, "L", t > 13.75 ? 0.7 : 0.2);
  lookAt(dad, t > 13.0 ? KEYS_POS : at(dad, 0, 1.4, 2), 0.8);
};

// Мама у тумбы: складывает вещи в сумку; к своей реплике поворачивается.
const poseMamaMorning = (mom: Rig, t: number, look: THREE.Vector3) => {
  const yawAt = (tt: number) => mix(Math.PI / 2, -0.55, ease(tt, 9.3, 10.1));
  standTurn(mom, M0.x, M0.z, yawAt, t, 1);
  const pack = 1 - ease(t, 9.1, 9.6);
  armsDown(mom, t, { bend: 0.05 });
  if (pack > 0) {
    const work = Math.sin(t * 2.4) * 0.03;
    for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
      const p = MOM_BAG_POS.clone().add(V(-0.06, 0.25 + (side === "L" ? work : -work), sx * 0.08));
      ik2(mom, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, bonePos(mom, `wrist.${side}`).lerp(p, pack), at(mom, sx * 0.5, 0.8, -0.2));
      orientHand(mom, side, V(0.5, -0.85, 0).normalize(), V(0, 0, -sx).normalize());
      curlFingers(mom, side, 0.45);
    }
  } else {
    curlFingers(mom, "L", 0.25);
    curlFingers(mom, "R", 0.25);
  }
  lookAt(mom, t < 9.3 ? MOM_BAG_POS.clone().add(V(0, 0.15, 0)) : look, 0.85);
};

// ---------------------------------------------------------------- 0–14 с
const MorningInner: React.FC = () => {
  const t = useShotTime("morning");
  const mom = useCharacter("mom");
  useFontReady();
  const dad = useCharacter("husband");
  const girl = useCharacter("girl");
  const sp = useSpeech(["d01", "f01", "m01"]);
  const dadScreen = useScreenTexture(drawDadMsg(), "dad");

  poseGirl(girl, t, V(0, 1.4, 0), () => yawTo(G, D));
  const girlHead0 = bonePos(girl, "head");
  posePapa(dad, t, girlHead0);
  const dadHead = bonePos(dad, "head");
  poseMamaMorning(mom, t, mix(0, 1, ease(t, 9.3, 10)) > 0.5 ? girlHead0 : dadHead);
  const momHead = bonePos(mom, "head");
  // дочка: смотрит на папу; к реплике мамы — на маму; провожает папу
  const gLook = t < 9.8 ? dadHead : t < 12.4 ? momHead : dadHead;
  poseGirl(girl, t, gLook, (tt) => mix(yawTo(G, D), yawTo(G, M0) * 0.5 + yawTo(G, D) * 0.5, ease(tt, 9.8, 10.5)));
  strapsAt(girl, t);
  face(girl, t, sp.d01.words, { smile: t < 5.5 ? 0.25 : 0, worry: t > sp.f01.from + 1 ? 0.35 : 0 }, 7);
  face(dad, t, sp.f01.words, { worry: t > 5 && t < 12 ? 0.45 : 0.1, smile: t > 12.5 ? 0.2 : 0 }, 9);
  face(mom, t, sp.m01.words, { smile: t > sp.m01.from - 0.3 ? 0.25 : 0.1 }, 1);
  turn(dad, "head", X, t > sp.f01.to - 0.9 && t < sp.f01.to + 0.3 ? Math.sin(((t - sp.f01.to + 0.9) / 1.2) * Math.PI) * 0.08 : 0);

  const dadPhone = buzz(phoneMatrix(dad, "R"), t, 0.5, 1.15);
  const keysInHand = t > 13.75;
  const keysM = gripPoint(dad, "L");
  const girlHead = bonePos(girl, "head");

  let cam: Cam;
  if (t < sp.d01.from - 0.1) cam = camPath([{ t: 0, pos: [-0.25, 1.72, 3.45], target: [1.45, 0.95, 0.2], fov: 46 }, { t: 2.2, pos: [-0.15, 1.68, 3.3], target: [1.45, 0.95, 0.25], fov: 45 }], t);
  else if (t < sp.f01.from - 0.25) cam = overShoulder(bonePos(dad, "head"), girlHead.clone().add(V(0, -0.05, 0)), "R", 0.55, 0.24, 0.0, 34);
  else if (t < sp.m01.from - 0.5) cam = overShoulder(bonePos(girl, "head"), dadHead.clone().add(V(0, -0.06, 0)), "L", 0.45, 0.22, -0.02, 36);
  else if (t < 12.3) {
    const f = V(Math.sin(-0.55), 0, Math.cos(-0.55));
    cam = { pos: momHead.clone().add(f.multiplyScalar(1.35)).add(V(0.15, -0.05, 0)), target: momHead.clone().add(V(0, -0.12, 0)), fov: 34 };
  } else cam = camPath([{ t: 12.3, pos: [0.15, 1.62, 2.8], target: [1.9, 1.0, -0.15], fov: 44 }, { t: 14, pos: [0.3, 1.6, 2.7], target: [1.95, 1.0, -0.15], fov: 42 }], t);
  return (
    <>
      <CameraRig cam={cam} />
      <MorningLights />
      <Apartment keys={!keysInHand} />
      <WallClock pos={CLOCK_POS} minutes={clockMin(t)} r={0.13} />
      <Character rig={mom} />
      <Character rig={dad} />
      <Character rig={girl} />
      <Backpack rig={girl} color="#2F5DA8" />
      <Phone screen={t > 0.5 ? dadScreen : null} matrix={dadPhone} glow={0.95} />
      {keysInHand ? (
        <mesh position={keysM} rotation={[0.4, 0, 0.3]}>
          <torusGeometry args={[0.018, 0.003, 6, 16]} />
          <meshStandardMaterial color="#C9CCD2" metalness={0.8} roughness={0.3} />
        </mesh>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- 14–47 с
// Мама подходит к дочке, звонит бабушке (телефон у левого уха) и правой
// рукой застёгивает дочке жилет; затем голосовое брата, сообщение подруги,
// взгляд на часы и на дочку.
const zipK = (t: number) => ease(t, 21.8, 28.6);
const girlYaw = (tt: number) => mix(yawTo(G, D), yawTo(G, M2), ease(tt, 14.3, 15.2));

const MomGirl: React.FC<{ t: number }> = ({ t }) => {
  const mom = useCharacter("mom");
  useFontReady();
  const girl = useCharacter("girl");
  const sp = useSpeech(["m02", "m03", "b01"]);

  const callStatus = t < 16.1 ? "Чалуу…" : `00:${String(Math.max(0, Math.floor(t - 16.1))).padStart(2, "0")}`;
  const call = useScreenTexture(drawCall(callStatus), callStatus);
  const vProg = Math.max(0, Math.min(1, (t - sp.b01.from + 0.1) / Math.max(1, sp.b01.to - sp.b01.from + 0.2)));
  const voice = useScreenTexture(drawVoiceMsg(t < 33.4 ? 0 : vProg), `v${Math.round(vProg * 26)}|${t < 33.4}`);
  const friendShown = t > 39.1;
  const friend = useScreenTexture(drawFriendChat(friendShown), `f${friendShown}`);

  // мама: от тумбы к дочке (14.0–15.6), набирает номер, телефон к уху
  // (15.7–16.2), приседает (17.0–17.8), застёгивает (21.8–28.6), встаёт
  const w = walk(mom, { from: M0, to: M2, t0: 14.0, speed: 1.3 }, t, 1);
  const toG = yawTo(M2, G);
  const sq = ease(t, 17.0, 17.8) * (1 - ease(t, 29.6, 30.6));
  if (w.done) {
    place(mom, M2.x, M2.z, mix(w.yaw, toG, ease(t, 15.3, 15.8)));
    if (sq > 0) crouch(mom, sq * 0.8);
    else stand(mom, t, 1);
  }
  armsDown(mom, t, { swingL: -w.swing * 0.4, swingR: w.swing, bend: 0.05 + sq * 0.2 });
  const ear = ease(t, 15.7, 16.2) * (1 - ease(t, 28.7, 29.3));
  const read = t < 16 ? ease(t, 13.8, 14.4) : ease(t, 32.3, 32.9) * (1 - ease(t, 42.0, 42.8));
  if (ear > 0) phoneToEar(mom, "L", ear);
  else if (read > 0) phoneRead(mom, "L", read, 0.02, 0.3);
  else curlFingers(mom, "L", 0.45, 0.3);
  // правая рука — бегунок замка на жилете дочки (21.3–29.0)
  const zipHand = ease(t, 21.3, 21.9) * (1 - ease(t, 28.7, 29.3));
  const gd = dims(girl);
  const zipY = mix(gd.hip + 0.08, gd.shoulder - 0.1, zipK(t));
  const zipP = at(girl, 0, 0, 0.115 * gd.scale).setY(zipY);
  if (zipHand > 0) {
    const towardMom = bonePos(mom, "spine03").sub(zipP).setY(0).normalize();
    const wT = zipP.clone().add(towardMom.clone().multiplyScalar(0.05)).add(V(0, -0.05, 0));
    ik2(mom, "upperarm01.R", "lowerarm01.R", "wrist.R", bonePos(mom, "wrist.R").lerp(wT, zipHand), at(mom, -0.5, 0.4, -0.1));
    orientHand(mom, "R", V(0, 1, 0).add(towardMom.clone().multiplyScalar(-0.3)).normalize(), towardMom.clone().negate());
    curlFingers(mom, "R", 0.55, 0.6);
  } else curlFingers(mom, "R", 0.25);
  // правая рука нажимает «воспроизвести» (33.0–33.7)
  const tap = ease(t, 33.0, 33.3) * (1 - ease(t, 33.45, 33.8));
  if (tap > 0) {
    const pm = posOf(phoneMatrix(mom, "L"));
    ik2(mom, "upperarm01.R", "lowerarm01.R", "wrist.R", bonePos(mom, "wrist.R").lerp(pm.clone().add(at(mom, -0.03, 0, 0.03).sub(at(mom, 0, 0, 0))).add(V(0, -0.07, 0)), tap), at(mom, -0.5, 0.6, -0.2));
    orientHand(mom, "R", V(0, 1, 0).add(at(mom, 0.3, 0, 0).sub(at(mom, 0, 0, 0))).normalize(), at(mom, 0, 0, -1).sub(at(mom, 0, 0, 0)).setY(0).normalize());
  }
  const momHead = bonePos(mom, "head");

  // дочка: поворачивается к маме; пока мама застёгивает, стоит смирно
  standTurn(girl, G.x, G.z, girlYaw, t, 7);
  armsDown(girl, t, { bend: 0.06 });
  curlFingers(girl, "L", 0.35);
  curlFingers(girl, "R", 0.35);
  const gLook = t > 21.8 && t < 28.6 ? zipP.clone().lerp(momHead, 0.6) : momHead;
  lookAt(girl, gLook, 0.85);
  face(girl, t, [], { worry: t > 32 ? 0.35 : 0.15, smile: t > 26 && t < 31 ? 0.15 : 0 }, 7);

  const phoneM = phoneMatrix(mom, "L");
  const phoneP = posOf(phoneM);
  const clock = V(...CLOCK_POS);
  const girlHead = bonePos(girl, "head");
  let mLook = t < 15.6 ? phoneP : girlHead;
  if (t > 21.8 && t < 28.6) mLook = zipP;
  if (t > 32.4 && t < 42.4) mLook = phoneP;
  if (t > 43.4 && t < 45.4) mLook = clock;
  if (t > 45.4) mLook = girlHead;
  lookAt(mom, mLook, 0.9);
  const sigh = t > 42.2 && t < 43.4 ? Math.sin(((t - 42.2) / 1.2) * Math.PI) : 0;
  turn(mom, "spine04", X, sigh * 0.05);
  face(mom, t, [...sp.m02.words, ...sp.m03.words], { smile: t > sp.m03.from - 0.3 && t < 31 ? 0.25 : 0.05, worry: t > 33.6 ? 0.5 : t > 29 ? 0.25 : 0.1, squint: sigh * 0.6 }, 1);

  const screen = t < 30 ? call : t < 38.4 ? voice : friend;
  const zipMarker = at(girl, 0, 0, 0.118 * gd.scale).setY(zipY);
  const momF = at(mom, 0, 0, 1).sub(at(mom, 0, 0, 0)).setY(0).normalize();
  const momR = V(-momF.z, 0, momF.x);

  let cam: Cam;
  if (t < 16.2) cam = camPath([{ t: 14, pos: [1.35, 1.4, 3.35], target: [1.45, 1.02, 0.6], fov: 42 }, { t: 16.2, pos: [1.38, 1.35, 3.15], target: [1.4, 1.0, 0.9], fov: 40 }], t);
  else if (t < 21.2) cam = overShoulder(bonePos(girl, "head"), momHead.clone().add(V(0, -0.05, 0)), "L", 0.42, 0.2, 0.02, 36);
  else if (t < 30.0) cam = camPath([{ t: 21.2, pos: [1.4, 1.05, 2.55], target: [1.4, 0.88, 0.95], fov: 40 }, { t: 30, pos: [1.4, 1.1, 2.45], target: [1.4, 0.92, 0.95], fov: 38 }], t);
  else if (t < 32.0) cam = overShoulder(bonePos(girl, "head"), momHead.clone().add(V(0, -0.06, 0)), "L", 0.42, 0.2, 0.02, 36);
  else if (t < 33.6 || (t >= 36.2 && t < 38.4) || (t >= 42.2 && t < 43.4))
    cam = { pos: momHead.clone().add(momF.clone().multiplyScalar(1.05)).add(momR.clone().multiplyScalar(0.3)).add(V(0, -0.06, 0)), target: momHead.clone().add(V(0, -0.14, 0)), fov: 34 };
  else if (t < 43.4) {
    const n = V(0, 0, 1).applyMatrix4(new THREE.Matrix4().extractRotation(phoneM));
    cam = { pos: phoneP.clone().add(n.clone().multiplyScalar(0.3)).add(V(0, 0.02, 0)), target: phoneP, fov: 34 };
  } else if (t < 45.4) cam = camPath([{ t: 43.4, pos: [1.95, 1.95, -0.95], target: CLOCK_POS, fov: 30 }, { t: 45.4, pos: [1.98, 1.97, -1.05], target: CLOCK_POS, fov: 28 }], t);
  else cam = overShoulder(bonePos(mom, "head"), girlHead.clone().add(V(0, -0.06, 0)), "R", 0.5, 0.22, 0.04, 36);

  return (
    <>
      <CameraRig cam={cam} />
      <MorningLights />
      <Apartment keys={false} />
      <WallClock pos={CLOCK_POS} minutes={clockMin(t)} r={0.13} />
      <Character rig={mom} />
      <Character rig={girl} />
      <Backpack rig={girl} color="#2F5DA8" />
      {/* бегунок замка жилета */}
      <mesh position={zipMarker} rotation={[0, girl.root.rotation.y, 0]}>
        <boxGeometry args={[0.014, 0.03, 0.006]} />
        <meshStandardMaterial color="#C9CCD2" metalness={0.8} roughness={0.3} />
      </mesh>
      <Phone screen={t < 15.7 || (t > 29 && t < 30) || t > 32.4 ? screen : null} matrix={buzz(phoneM, t, 32.3, 32.7)} glow={0.95} />
    </>
  );
};

const CallInner: React.FC = () => {
  const t = useShotTime("call");
  // 20.6–25.8 — бабушка у себя дома
  if (t >= 20.6 && t < 25.8) return <GrannyView t={t} />;
  return <MomGirl t={t} />;
};
const TriesInner: React.FC = () => <MomGirl t={useShotTime("tries")} />;

// ---------------------------------------------------------------- 47–61 с
// Дочка тихо спрашивает; мама присаживается рядом, кладёт руку на плечо и
// спокойно отвечает; берёт сумку с тумбы, открывает дверь, они выходят.
const DecideInner: React.FC = () => {
  const t = useShotTime("decide");
  const mom = useCharacter("mom");
  useFontReady();
  const girl = useCharacter("girl");
  const sp = useSpeech(["d02", "m04"]);

  const toG = yawTo(M2, G);
  const sq = ease(t, 50.0, 51.0) * (1 - ease(t, 55.0, 55.9));
  const w1 = walk(mom, { from: M2, to: M0, t0: 55.8, speed: 1.25 }, t, 1);
  const w2 = walk(mom, { from: M0, to: DOOR_STAND, t0: 57.5, speed: 1.2 }, t, 1);
  const w3 = walk(mom, { from: DOOR_STAND, to: OUT_M, t0: 60.1, speed: 1.25 }, t, 1);
  if (t < 55.8) {
    place(mom, M2.x, M2.z, toG);
    if (sq > 0) crouch(mom, sq * 0.8);
    else stand(mom, t, 1);
  } else if (t < 57.5) {
    if (w1.done) standTurn(mom, M0.x, M0.z, (tt) => mix(w1.yaw, Math.PI / 2, ease(tt, 56.6, 56.95)), t, 1);
  } else if (t < 60.1) {
    if (w2.done) standTurn(mom, DOOR_STAND.x, DOOR_STAND.z, (tt) => mix(w2.yaw, Math.PI / 2, ease(tt, 58.3, 58.6)), t, 1);
  }
  const sw = t < 55.8 ? 0 : t < 57.5 ? w1.swing : t < 60.1 ? w2.swing : w3.swing;
  armsDown(mom, t, { swingL: -sw * 0.5, swingR: sw * 0.3, bend: 0.05 + sq * 0.25 });
  // левая рука: на плече дочки (51.2–55.4), ручка двери (58.35–59.8)
  handOnShoulder(mom, "L", girl, "R", ease(t, 51.2, 51.8) * (1 - ease(t, 54.9, 55.4)));
  const doorK = ease(t, 58.6, 59.3);
  const hk = ease(t, 58.35, 58.65) * (1 - ease(t, 59.4, 59.8));
  if (hk > 0) {
    const hp = doorHandle(doorK * 1.25);
    ik2(mom, "upperarm01.L", "lowerarm01.L", "wrist.L", bonePos(mom, "wrist.L").lerp(hp.clone().add(V(-0.08, 0, 0)), hk), at(mom, 0.6, 0.8, -0.3));
    orientHand(mom, "L", V(1, -0.1, 0).normalize(), V(0, 0, -1));
    curlFingers(mom, "L", 0.7, 0.5);
  } else if (t > 55.4) curlFingers(mom, "L", 0.25);
  // правая рука: берёт сумку (56.75–57.15) и несёт
  const reachBag = ease(t, 56.75, 57.0);
  if (t < 57.3 && reachBag > 0) {
    ik2(mom, "upperarm01.R", "lowerarm01.R", "wrist.R", bonePos(mom, "wrist.R").lerp(MOM_BAG_POS.clone().add(V(-0.02, 0.27, 0)), reachBag), at(mom, -0.5, 0.8, -0.2));
    orientHand(mom, "R", V(0.3, -1, 0).normalize(), V(0, 0, -1));
  }
  curlFingers(mom, "R", t > 57.0 ? 0.7 : 0.25, 0.4);
  const hasBag = t > 57.15;
  const bagP = gripPoint(mom, "R");

  // дочка: стоит; после ответа идёт к двери и выходит (59.2–61)
  const gw = walk(girl, { from: G, to: OUT_G, t0: 59.2, speed: 1.0 }, t, 7);
  if (t < 59.2) standTurn(girl, G.x, G.z, (tt) => mix(yawTo(G, M2), yawTo(G, OUT_G), ease(tt, 58.2, 58.9)), t, 7);
  armsDown(girl, t, { swingL: -gw.swing, swingR: gw.swing, bend: 0.06 });
  curlFingers(girl, "L", 0.35);
  curlFingers(girl, "R", 0.35);
  const momHead = bonePos(mom, "head");
  const girlHead = bonePos(girl, "head");
  lookAt(girl, t < 57.6 ? momHead : at(girl, 0, 1.0, 2), 0.85);
  face(girl, t, sp.d02.words, { worry: t < sp.m04.from + 0.6 ? 0.45 : 0, smile: t > sp.m04.to - 0.4 ? 0.35 : 0 }, 7);
  lookAt(mom, t < 55.6 ? girlHead : t < 57.2 ? MOM_BAG_POS : t < 58.4 ? doorHandle(0) : at(mom, 0, 1.4, 2), 0.85);
  face(mom, t, sp.m04.words, { smile: t > sp.m04.from - 0.4 ? 0.4 : 0.1, worry: t < sp.m04.from - 0.4 ? 0.3 : 0 }, 1);

  let cam: Cam;
  if (t < 50.4) cam = overShoulder(bonePos(mom, "head"), girlHead.clone().add(V(0, -0.05, 0)), "R", 0.5, 0.22, 0.0, 34);
  else if (t < 55.4) cam = camPath([{ t: 50.4, pos: [1.4, 1.0, 2.6], target: [1.4, 0.9, 0.98], fov: 38 }, { t: 55.4, pos: [1.4, 1.0, 2.45], target: [1.4, 0.9, 0.98], fov: 36 }], t);
  else if (t < 58.2) cam = camPath([{ t: 55.4, pos: [0.35, 1.55, 2.6], target: [1.9, 1.0, -0.3], fov: 44 }, { t: 58.2, pos: [0.45, 1.55, 2.5], target: [2.0, 1.0, 0.0], fov: 44 }], t);
  else cam = camPath([{ t: 58.2, pos: [0.55, 1.5, 1.7], target: [2.7, 1.05, 0.6], fov: 46 }, { t: 61, pos: [0.75, 1.5, 1.55], target: [2.9, 1.05, 0.6], fov: 46 }], t);
  return (
    <>
      <CameraRig cam={cam} />
      <MorningLights />
      <Apartment keys={false} bag={!hasBag} doorOpen={doorK * 1.25} />
      <WallClock pos={CLOCK_POS} minutes={clockMin(t)} r={0.13} />
      <Character rig={mom} />
      <Character rig={girl} />
      <Backpack rig={girl} color="#2F5DA8" />
      {hasBag ? (
        <group position={bagP} rotation={[0, mom.root.rotation.y + Math.PI / 2, 0]}>
          <MomBagHanging />
        </group>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- экспорт
export const MorningScene: React.FC = () => (
  <Stage>
    <MorningInner />
  </Stage>
);
export const CallScene: React.FC = () => (
  <Stage>
    <CallInner />
  </Stage>
);
export const TriesScene: React.FC = () => (
  <Stage>
    <TriesInner />
  </Stage>
);
export const DecideScene: React.FC = () => (
  <Stage>
    <DecideInner />
  </Stage>
);
