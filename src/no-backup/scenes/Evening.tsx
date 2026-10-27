import { staticFile } from "remotion";
import * as THREE from "three";
import { phoneHold } from "../acts";
import { useShotTime, useSpeech } from "../context";
import { drawBalaGoPage, drawDrawing, drawForm } from "../screens";
import { Apartment } from "../sets";
import { blendM } from "../three/actions";
import { Character, heldWorld, useCharacter } from "../three/character";
import { face } from "../three/face";
import { at, ease, place, sit } from "../three/poses";
import { Phone, useFontReady, useScreenTexture } from "../three/props";
import { bonePos, curlFingers, ik2, lookAt, orientHand, turn, X, Y, type Rig } from "../three/rig";
import { Chair } from "../three/sets2";
import { twoShot } from "../cams";
import { CameraRig, Stage, type Cam } from "../three/stage";

// Вечер (94–114 с): та же квартира. Мама и папа сидят рядом за столом лицом
// к камере, дочка за торцом стола рисует. Папа показывает страницу BalaGo,
// мама заполняет предварительную заявку. Подтверждённой поездки нет.
const MOM_K = new THREE.Vector3(-0.12, 0, -0.68);
const DAD_K = new THREE.Vector3(0.55, 0, -0.68);
const GIRL_K = new THREE.Vector3(1.12, 0, -0.05);
const TABLE_PHONE = new THREE.Vector3(0.24, 0.766, -0.25);

// Телефон в правой руке на точке target, экран — к точке look.
const holdPhoneAt = (rig: Rig, target: THREE.Vector3, look: THREE.Vector3, k = 1) => {
  const from = bonePos(rig, "wrist.R");
  const p = from.clone().lerp(target, k);
  ik2(rig, "upperarm01.R", "lowerarm01.R", "wrist.R", p, at(rig, -0.5, bonePos(rig, "spine01").y - 0.2, -0.1));
  const toLook = look.clone().sub(p).normalize();
  const fingerUp = new THREE.Vector3(0, 1, 0).add(toLook.clone().multiplyScalar(-0.6)).normalize();
  orientHand(rig, "R", fingerUp, toLook);
  curlFingers(rig, "R", 0.2, 0.3);
};

// Логотип для экрана телефона: кадр ждёт загрузки (Suspense).
let logoImg: HTMLImageElement | null = null;
let logoPromise: Promise<void> | null = null;
let logoDone = false;
const useLogo = () => {
  if (logoDone) return logoImg;
  if (!logoPromise)
    logoPromise = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        logoImg = img;
        logoDone = true;
        resolve();
      };
      img.onerror = () => {
        logoDone = true;
        resolve();
      };
      img.src = staticFile("assets/logo.png");
    });
  throw logoPromise;
};

const Kitchen: React.FC<{ t: number }> = ({ t }) => {
  const mom = useCharacter("mom");
  useFontReady();
  const dad = useCharacter("husband");
  const girl = useCharacter("girl");
  const logo = useLogo();
  const sp = useSpeech(["m07", "f02"]);
  const page = useScreenTexture(drawBalaGoPage(logo), "page");
  // форма: поля 108.4–111.2, нажатие 111.6, отправлено 111.95
  const k = Math.max(0, Math.min(4, ((t - 108.4) / 2.8) * 4));
  const sent = t > 111.95;
  const pressed = t > 111.55 && !sent;
  const form = useScreenTexture(drawForm(k, pressed, sent), `${Math.round(k * 20)}|${sent}|${pressed}`, 720, 1520);
  const drawing = useScreenTexture(drawDrawing(Math.min(1, Math.max(0, (t - 94) / 12))), `d${Math.round(Math.min(1, Math.max(0, (t - 94) / 12)) * 20)}`, 512, 720);

  // мама: руки у пиалы; берёт телефон у папы (105.6–106.4) и заполняет форму
  place(mom, MOM_K.x, MOM_K.z, 0);
  sit(mom, 0.5, 0.45, 0.08);
  const lean = ease(t, 101.6, 102.3) * (1 - ease(t, 113.0, 113.6));
  turn(mom, "spine03", Y, -0.25 * lean);
  const cup = new THREE.Vector3(MOM_K.x, 0.79, -0.22);
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    ik2(mom, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, cup.clone().add(new THREE.Vector3(sx * 0.1, 0.0, -0.07)), at(mom, sx * 0.5, 0.6, -0.1));
    orientHand(mom, side, new THREE.Vector3(-sx * 0.7, -0.1, 0.7).normalize(), new THREE.Vector3(-sx * 0.8, -0.5, 0).normalize());
    curlFingers(mom, side, 0.35);
  }
  const momHead = bonePos(mom, "head");
  const takeK = ease(t, 105.6, 106.4) * (1 - ease(t, 113.2, 113.8));
  const readP = at(mom, -0.06, momHead.y - 0.32, 0.3);
  if (takeK > 0) holdPhoneAt(mom, readP, momHead, takeK);
  // папа: телефон со стола → читает (99.8–100.6) → показывает маме (101.4–105.6)
  place(dad, DAD_K.x, DAD_K.z, 0);
  sit(dad, 0.5, 0.48, 0.06);
  const dadHead = bonePos(dad, "head");
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    ik2(dad, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, at(dad, sx * 0.16, 0.79, 0.4), at(dad, sx * 0.5, 0.6, -0.1));
    orientHand(dad, side, new THREE.Vector3(-sx * 0.3, -0.1, 1).normalize(), new THREE.Vector3(0, -1, 0));
    curlFingers(dad, side, 0.3);
  }
  const pickK = ease(t, 99.8, 100.5);
  const showK = ease(t, 101.3, 102.0);
  const giveK = ease(t, 105.6, 106.2);
  const dadHold = phoneHold(dad, "R");
  const momHold = phoneHold(mom, "R");
  if (pickK > 0 && giveK < 1) {
    const read = at(dad, -0.04, dadHead.y - 0.33, 0.3);
    const show = momHead.clone().lerp(dadHead, 0.5).add(new THREE.Vector3(0, -0.3, 0.32));
    const give = readP.clone().add(new THREE.Vector3(0.1, 0, 0));
    const tgt = read.clone().lerp(show, showK).lerp(give, giveK);
    const lookTo = dadHead.clone().lerp(momHead, showK);
    holdPhoneAt(dad, tgt, lookTo, pickK * (1 - giveK * 0.999));
  }
  const startM = new THREE.Matrix4().compose(TABLE_PHONE, new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, -0.2)), new THREE.Vector3(1, 1, 1));
  let phoneM = blendM(startM, heldWorld(dad, "R", dadHold), ease(t, 100.0, 100.3));
  phoneM = blendM(phoneM, heldWorld(mom, "R", momHold), ease(t, 105.9, 106.3));
  const backM = new THREE.Matrix4().compose(new THREE.Vector3(-0.02, 0.766, -0.3), new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0.2)), new THREE.Vector3(1, 1, 1));
  phoneM = blendM(phoneM, backM, ease(t, 113.5, 113.8));
  const phoneP = new THREE.Vector3().setFromMatrixPosition(phoneM);

  // взгляды и лица
  let mLook = cup.clone();
  if (t > sp.m07.from - 0.2) mLook = dadHead;
  if (t > 101.8) mLook = phoneP;
  if (t > 112.3 && t < 113.4) mLook = dadHead;
  lookAt(mom, mLook, 0.85);
  let dLook = momHead.clone();
  if (pickK > 0.5 && t < 101.6) dLook = phoneP;
  if (t > 101.6 && t < 105.4) dLook = t < sp.f02.to ? momHead.clone().lerp(phoneP, 0.4) : phoneP;
  if (t > 106.2) dLook = phoneP;
  if (t > 112.3 && t < 113.6) dLook = momHead;
  lookAt(dad, dLook, 0.85);
  const nod = t > sp.m07.to - 0.1 && t < sp.m07.to + 0.8 ? Math.sin(((t - sp.m07.to + 0.1) / 0.9) * Math.PI) * 0.08 : 0;
  turn(dad, "head", X, nod);
  face(mom, t, sp.m07.words, { worry: t < 101 ? 0.45 : 0.1, smile: t > 103 ? 0.25 + (t > 112.3 ? 0.2 : 0) : 0 }, 1);
  face(dad, t, sp.f02.words, { smile: t > 100.6 ? 0.3 + (t > 112.3 ? 0.15 : 0) : 0.1, worry: t < 99.6 ? 0.3 : 0 }, 9);

  // дочка рисует, иногда смотрит на родителей
  place(girl, GIRL_K.x, GIRL_K.z, -Math.PI / 2);
  sit(girl, 0.5, 0.4, 0.18);
  const write = Math.sin(t * 6) * 0.012;
  ik2(girl, "upperarm01.R", "lowerarm01.R", "wrist.R", at(girl, -0.08 + write, 0.8, 0.36), at(girl, -0.5, 0.6, 0));
  orientHand(girl, "R", new THREE.Vector3(0, -0.4, 1).applyQuaternion(girl.root.quaternion).normalize(), new THREE.Vector3(0, -1, 0));
  curlFingers(girl, "R", 0.6);
  ik2(girl, "upperarm01.L", "lowerarm01.L", "wrist.L", at(girl, 0.14, 0.785, 0.32), at(girl, 0.5, 0.6, 0));
  orientHand(girl, "L", new THREE.Vector3(-0.3, -0.1, 1).applyQuaternion(girl.root.quaternion).normalize(), new THREE.Vector3(0, -1, 0));
  curlFingers(girl, "L", 0.3);
  lookAt(girl, (t > 102.6 && t < 104.0) || t > 112.6 ? momHead : at(girl, 0, 0.78, 0.35), 0.9);
  face(girl, t, [], { smile: 0.2 }, 7);
  const pen = at(girl, -0.08 + write, 0.8, 0.42);
  const girlHead = bonePos(girl, "head");

  let cam: Cam;
  const front = new THREE.Vector3(0.3, 1.2, 3);
  if (t < 99.6) cam = twoShot(momHead, girlHead, front, 40, 0.32 + 0.04 * ease(t, 94, 99.6), 0.25);
  else if (t < 102.6) cam = twoShot(momHead, dadHead, new THREE.Vector3(-0.6, 1.2, 2.5), 36, 0.28, 0.2);
  else if (t < 105.0 || (t >= 108.0 && t < 112.4)) {
    const n = new THREE.Vector3(0, 0, 1).applyMatrix4(new THREE.Matrix4().extractRotation(phoneM));
    cam = { pos: phoneP.clone().add(n.clone().multiplyScalar(t < 105 ? 0.34 : 0.25)), target: phoneP, fov: t < 105 ? 34 : 36 };
  } else if (t < 108.0) cam = twoShot(momHead, dadHead, front, 38, 0.3, 0.22);
  else cam = twoShot(momHead, dadHead, new THREE.Vector3(0.2, 1.2, 3), 36, 0.26, 0.15);
  return (
    <>
      <CameraRig cam={cam} />
      <hemisphereLight args={["#FFE3C4", "#7A5E48", 0.7]} />
      <pointLight position={[0.2, 1.85, 0]} intensity={2.4} distance={5} decay={1.6} color="#FFC98A" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
      <directionalLight position={[1.5, 2.5, -4]} intensity={0.7} color="#F5A86B" />
      <directionalLight position={[-1, 2.2, 3]} intensity={0.5} color="#FFE6C8" />
      <Apartment evening keys bag={false} />
      <Chair pos={[MOM_K.x, 0, MOM_K.z - 0.06]} />
      <Chair pos={[DAD_K.x, 0, DAD_K.z - 0.06]} />
      <Chair pos={[GIRL_K.x + 0.06, 0, GIRL_K.z]} rotY={-Math.PI / 2} />
      {[-0.12, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.79, -0.22]} castShadow>
          <cylinderGeometry args={[0.045, 0.03, 0.05, 20]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
      ))}
      {/* рисунок дочки и карандаш */}
      <mesh position={[0.74, 0.763, -0.02]} rotation={[-Math.PI / 2, 0, -Math.PI / 2 + 0.1]}>
        <planeGeometry args={[0.21, 0.297]} />
        <meshStandardMaterial map={drawing} roughness={0.9} />
      </mesh>
      <mesh position={pen} rotation={[0, 0, 1.2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.13, 8]} />
        <meshStandardMaterial color="#E0533D" />
      </mesh>
      <Character rig={mom} />
      <Character rig={dad} />
      <Character rig={girl} />
      <Phone screen={t < 100.2 ? null : t < 108.0 ? page : form} matrix={phoneM} glow={0.95} />
    </>
  );
};

const EveningInner: React.FC = () => <Kitchen t={useShotTime("evening")} />;
const FormInner: React.FC = () => <Kitchen t={useShotTime("form")} />;

export const EveningScene: React.FC = () => (
  <Stage bg="#2B2233">
    <EveningInner />
  </Stage>
);
export const FormScene: React.FC = () => (
  <Stage bg="#2B2233">
    <FormInner />
  </Stage>
);
