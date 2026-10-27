import { staticFile } from "remotion";
import * as THREE from "three";
import { useShotTime, useSpeech } from "../context";
import { drawBalaGoPage, drawForm, drawMissed, drawMonitor } from "../screens";
import { blendM, usePhoneHold } from "../three/actions";
import { Character, heldWorld, useCharacter } from "../three/character";
import { face } from "../three/face";
import { armsDown, at, dims, ease, mix, mixYaw, place, sit, standTurn, walk } from "../three/poses";
import { Phone, useFontReady, useScreenTexture } from "../three/props";
import { bonePos, curlFingers, ik2, lookAt, orientHand, turn, X, Y, type Rig } from "../three/rig";
import { Chair, Kitchen } from "../three/sets2";
import { CameraRig, camPath, Stage, type Cam } from "../three/stage";
import { MOM_SEAT, OfficeLights, OfficeSet, SEAT_Y, seatedTyping } from "./Office";

// Телефон в правой руке на заданной точке; экран — к точке look.
const holdPhoneAt = (rig: Rig, target: THREE.Vector3, look: THREE.Vector3, k = 1) => {
  const from = bonePos(rig, "wrist.R");
  const p = from.clone().lerp(target, k);
  ik2(rig, "upperarm01.R", "lowerarm01.R", "wrist.R", p, at(rig, -0.5, bonePos(rig, "spine01").y - 0.2, -0.1));
  const toLook = look.clone().sub(p).normalize();
  const fingerUp = new THREE.Vector3(0, 1, 0).add(toLook.clone().multiplyScalar(-0.6)).normalize();
  orientHand(rig, "R", fingerUp, toLook, k);
  // пальцы — за корпусом телефона, большой палец — на боковой грани
  curlFingers(rig, "R", 0.2, 0.3);
};

// ---------------- 82–95 с: снова в офисе ----------------
// Проходит к столу; стул отодвинут — садится и подкатывается к столу;
// на телефоне — пропущенные звонки, на мониторе — незаконченная задача.
const AfternoonInner: React.FC = () => {
  const t = useShotTime("afternoon");
  const mom = useCharacter("mom");
  useFontReady();
  const progress = 0.45 + ease(t, 89.5, 95) * 0.04;
  const monitor = useScreenTexture(drawMonitor({ time: t < 90 ? "13:24" : "13:25", progress, overdue: true }), `${t < 90}${Math.round(progress * 100)}`, 960, 560);
  const missed = useScreenTexture(drawMissed("13:24"), "missed");
  const seatK = ease(t, 84.6, 85.6);
  const rollK = ease(t, 85.7, 86.4);
  const chairZ = MOM_SEAT.z + 0.3 * (1 - rollK);

  if (t < 84.5) {
    // She stops in front of the pulled-back chair, not inside it.
    const w = walk(mom, { from: new THREE.Vector3(1.65, 0, -1.0), to: new THREE.Vector3(MOM_SEAT.x, 0, MOM_SEAT.z), t0: 82.0, speed: 1.65, stepLen: 0.6 }, t, 1);
    if (w.done) {
      standTurn(mom, MOM_SEAT.x, MOM_SEAT.z, (tt) => mixYaw(w.yaw, Math.PI, ease(tt, 83.7, 84.5)), t, 1);
    }
    armsDown(mom, t, { swingL: -w.swing, swingR: w.swing, bend: 0.06 });
    lookAt(mom, at(mom, 0, 1.3, 2), 0.7);
  } else if (rollK < 1 || t < 86.5) {
    // посадка: из стойки у отодвинутого стула — на сиденье
    // The hips travel back onto the seat as she lowers, then the chair rolls in.
    const k = seatK;
    place(mom, MOM_SEAT.x, mix(MOM_SEAT.z, chairZ, ease(k, 0, 0.85)), Math.PI);
    const d = dims(mom);
    sit(mom, mix(d.hip - 0.012, SEAT_Y, k), mix(0.08, 0.48, k), mix(0, 0.1, k));
    turn(mom, "spine04", X, Math.sin(Math.PI * k) * 0.35);
    armsDown(mom, t, { bend: 0.05 + 0.25 * k });
    lookAt(mom, new THREE.Vector3(0, 1.0, -0.2), 0.6);
  } else {
    seatedTyping(mom, t, MOM_SEAT, ease(t, 90.2, 90.8) * (1 - ease(t, 92.0, 92.4)) + ease(t, 94.05, 94.45));
    // лоб — рукой (усталость), 92.2–93.6
    const rub = ease(t, 92.75, 93.15) * (1 - ease(t, 93.7, 94.15));
    if (rub > 0) {
      // Rest the fingertips at the left temple, leaving both eyes visible.
      const w = bonePos(mom, "head").add(new THREE.Vector3(-0.20, -0.015, -0.035));
      ik2(mom, "upperarm01.L", "lowerarm01.L", "wrist.L", bonePos(mom, "wrist.L").lerp(w, rub), at(mom, 0.4, 0.9, 0.3));
      orientHand(mom, "L", new THREE.Vector3(0.10, 0.94, -0.32).normalize(), new THREE.Vector3(1, 0, 0), rub);
      curlFingers(mom, "L", 0.12);
    }
    const phoneP = new THREE.Vector3(0.46, 0.76, 0.2);
    const mon = new THREE.Vector3(0, 1.02, -0.2);
    const clock = new THREE.Vector3(-3.28, 2.1, 0.6);
    let look = phoneP.clone();
    if (t > 88.2) look = phoneP.clone().lerp(mon, ease(t, 88.2, 88.6));
    if (t > 91.0) {
      // Interpolate bounded gaze angles. Blending world points across the head
      // made the old window glance rotate almost immediately to its limit.
      const head = bonePos(mom, "head");
      const rootQ = mom.root.getWorldQuaternion(new THREE.Quaternion());
      const inverse = rootQ.clone().invert();
      const angles = (target: THREE.Vector3) => {
        const d = target.clone().sub(head).applyQuaternion(inverse);
        return {
          yaw: THREE.MathUtils.clamp(Math.atan2(d.x, d.z), -1.1, 1.1),
          pitch: THREE.MathUtils.clamp(Math.atan2(-d.y, Math.hypot(d.x, d.z)), -0.5, 0.7),
        };
      };
      const a = angles(mon), b = angles(clock);
      const glance = ease(t, 91.0, 91.9) * (1 - ease(t, 92.0, 92.8));
      const yaw = mix(a.yaw, b.yaw, glance), pitch = mix(a.pitch, b.pitch, glance);
      const direction = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).applyQuaternion(rootQ);
      look = head.clone().addScaledVector(direction, 2);
    }
    lookAt(mom, look);
  }
  face(mom, t, [], { worry: 0.55, squint: 0.4 * ease(t, 92.65, 93.1) * (1 - ease(t, 94.0, 94.35)) }, 1);

  const phoneM = new THREE.Matrix4().compose(new THREE.Vector3(0.46, 0.7595, 0.2), new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0.3)), new THREE.Vector3(1, 1, 1));
  let cam: Cam;
  if (t < 84.5) cam = camPath([{ t: 82, pos: [-1.2, 1.6, 2.1], target: [1.4, 1.0, -0.2], fov: 44 }, { t: 84.5, pos: [-1.2, 1.58, 2.05], target: [0.35, 1.0, 0.4], fov: 44 }], t);
  else if (t < 86.6) cam = { pos: new THREE.Vector3(1.7, 1.6, -0.35), target: new THREE.Vector3(0.0, 0.97, 0.75), fov: 43 };
  else if (t < 88.2) cam = { pos: new THREE.Vector3(0.52, 1.22, 0.32), target: new THREE.Vector3(0.46, 0.76, 0.2), fov: 36 };
  else if (t < 90.8) {
    // A clear insert of the overdue task; the large head is outside the lens.
    cam = { pos: new THREE.Vector3(0.9, 1.31, 1.1), target: new THREE.Vector3(0.0, 1.035, -0.235), fov: 42 };
  } else {
    const head = bonePos(mom, "head");
    cam = camPath([{ t: 90.8, pos: [head.x - 1.15, head.y + 0.15, head.z - 1.0], target: [head.x, head.y, head.z - 0.05], fov: 40 }, { t: 95, pos: [head.x - 1.12, head.y + 0.15, head.z - 0.97], target: [head.x, head.y, head.z - 0.05], fov: 39 }], t);
  }
  return (
    <>
      <CameraRig cam={cam} />
      <OfficeLights warm={1} />
      <OfficeSet monitor={monitor} clockMin={13 * 60 + 24 + (t - 82) / 12} chairZ={chairZ} />
      <Character rig={mom} />
      <Phone screen={t > 85.9 ? missed : null} matrix={phoneM} glow={0.95} />
    </>
  );
};

// ---------------- 95–114 с: вечер дома, заявка BalaGo ----------------
// Кухня: мама и муж сидят рядом лицом к камере (+z), за ними — окно на
// вечерний город; сын за торцом стола делает уроки.
const MOM_K = new THREE.Vector3(-0.12, 0, -0.68);
const HUS_K = new THREE.Vector3(0.55, 0, -0.68);
const SON_K = new THREE.Vector3(1.12, 0, -0.05);

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

const KitchenView: React.FC<{ t: number }> = ({ t }) => {
  const mom = useCharacter("mom");
  useFontReady();
  const hus = useCharacter("husband");
  const son = useCharacter("son");
  const logo = useLogo();
  const sp = useSpeech(["m06", "h01", "h02", "m07"]);
  const page = useScreenTexture(drawBalaGoPage(logo), "page");
  // форма: поля заполняются 109.4–112.2, нажатие 112.6, отправлено 113.0
  const k = Math.max(0, Math.min(3, ((t - 109.4) / 2.8) * 3));
  const sent = t > 113.0;
  const pressed = t > 112.6 && !sent;
  const form = useScreenTexture(drawForm(k, sent, pressed), `${Math.round(k * 20)}|${sent}|${pressed}`);
  const husHold = usePhoneHold(hus);
  const momHold = usePhoneHold(mom);

  // мама
  place(mom, MOM_K.x, MOM_K.z, 0);
  sit(mom, 0.5, 0.45, 0.08);
  const lean = ease(t, 103.6, 104.3) * (1 - ease(t, 108.6, 109.2));
  turn(mom, "spine03", Y, -0.3 * lean);
  turn(mom, "spine04", X, 0.08 * lean);
  // руки: обе у пиалы на столе → правая берёт телефон у мужа (108–109)
  // ладони обхватывают пиалу перед собой
  const cup = new THREE.Vector3(MOM_K.x, 0.79, -0.22);
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    ik2(mom, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, cup.clone().add(new THREE.Vector3(sx * 0.1, 0.0, -0.07)), at(mom, sx * 0.5, 0.6, -0.1));
    orientHand(mom, side, new THREE.Vector3(-sx * 0.7, -0.1, 0.7).normalize(), new THREE.Vector3(-sx * 0.8, -0.5, 0).normalize());
    curlFingers(mom, side, 0.35);
  }
  const takeK = ease(t, 107.9, 108.7);
  const reach = ease(t, 107.6, 108.0);
  const momHead = bonePos(mom, "head");
  if (reach > 0) {
    // берёт со стола (рука сначала к телефону, затем к себе для чтения)
    const readP = at(mom, -0.05, momHead.y - 0.32, 0.3);
    const grabP = new THREE.Vector3(0.22, 0.81, -0.37);
    const target = grabP.clone().lerp(readP, takeK);
    holdPhoneAt(mom, target, momHead, Math.max(reach, takeK));
  }
  // муж
  place(hus, HUS_K.x, HUS_K.z, 0);
  sit(hus, 0.5, 0.48, 0.06);
  const husHead = bonePos(hus, "head");
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    ik2(hus, `upperarm01.${side}`, `lowerarm01.${side}`, `wrist.${side}`, at(hus, sx * 0.16, 0.79, 0.4), at(hus, sx * 0.5, 0.6, -0.1));
    orientHand(hus, side, new THREE.Vector3(-sx * 0.3, -0.1, 1).normalize(), new THREE.Vector3(0, -1, 0));
    curlFingers(hus, side, 0.3);
  }
  // телефон мужа: со стола → в руке, читает (101.6–102.3) → кладёт на стол
  // между ними, оба смотрят (103.4–104.0), он нажимает «Баланы каттоо»
  // (104.5) → мама берёт телефон и заполняет заявку (107.9–108.7)
  const pickK = ease(t, 101.6, 102.3);
  const putK = ease(t, 103.4, 104.0);
  const tableP = new THREE.Vector3(0.22, 0.766, -0.27);
  const tableM = new THREE.Matrix4().compose(tableP, new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, Math.PI)), new THREE.Vector3(1, 1, 1));
  const release = ease(t, 103.8, 104.4);
  if (pickK > 0 && release < 1) {
    const readP = at(hus, -0.04, husHead.y - 0.33, 0.3);
    const downP = tableP.clone().add(new THREE.Vector3(0.02, 0.05, -0.1));
    holdPhoneAt(hus, readP.clone().lerp(downP, putK), husHead.clone().lerp(tableP.clone().add(new THREE.Vector3(0, -1, 0)), putK * 0.8), pickK * (1 - release));
  } else if (release >= 1) {
    // указательным пальцем — по кнопке на экране (104.4–105.0)
    const tap = ease(t, 104.3, 104.6) * (1 - ease(t, 104.8, 105.2));
    const restP = at(hus, -0.16, 0.79, 0.4);
    const tapP = tableP.clone().add(new THREE.Vector3(0.0, 0.035, -0.11));
    ik2(hus, "upperarm01.R", "lowerarm01.R", "wrist.R", restP.lerp(tapP, tap), at(hus, -0.5, 0.6, -0.1));
    orientHand(hus, "R", new THREE.Vector3(-0.3, -0.5, 1).normalize(), new THREE.Vector3(0, -1, 0));
    curlFingers(hus, "R", 0.3 + 0.2 * tap, 0.3);
  }
  const deskPhone = new THREE.Matrix4().compose(new THREE.Vector3(0.3, 0.765, -0.22), new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, -0.2)), new THREE.Vector3(1, 1, 1));
  let phoneM = blendM(deskPhone, heldWorld(hus, "R", husHold), ease(t, 101.9, 102.2));
  phoneM = blendM(phoneM, tableM, ease(t, 103.75, 104.0));
  phoneM = blendM(phoneM, heldWorld(mom, "R", momHold), ease(t, 108.0, 108.4));
  const phoneP = new THREE.Vector3().setFromMatrixPosition(phoneM);

  // взгляды
  const mLook = cup.clone().lerp(husHead, ease(t, sp.m06.from + 0.8, sp.m06.from + 1.6)).lerp(phoneP, ease(t, 103.5, 104.2));
  lookAt(mom, mLook, 0.85);
  let hLook = momHead.clone().lerp(phoneP, ease(t, 101.7, 102.4));
  const share = ease(t, sp.h02.from + 0.4, sp.h02.from + 1.0) * (1 - ease(t, sp.h02.to - 1.4, sp.h02.to - 0.7));
  hLook = hLook.lerp(momHead, share * 0.65).lerp(phoneP, ease(t, 107.4, 108.0));
  lookAt(hus, hLook, 0.85);
  const nod = t > sp.h01.from - 0.2 && t < sp.h01.from + 0.7 ? Math.sin(((t - sp.h01.from + 0.2) / 0.9) * Math.PI) * 0.08 : 0;
  turn(hus, "head", X, nod);
  face(mom, t, [...sp.m06.words, ...sp.m07.words], { worry: t < 103 ? 0.5 : 0.15, smile: t > 106 ? 0.3 : 0 }, 1);
  face(hus, t, [...sp.h01.words, ...sp.h02.words], { smile: t > 101 ? 0.3 : 0.1, worry: t < 100.5 ? 0.25 : 0 }, 9);

  // сын: делает уроки (пишет), иногда смотрит на родителей
  place(son, SON_K.x, SON_K.z, -Math.PI / 2);
  sit(son, 0.5, 0.4, 0.18);
  const write = Math.sin(t * 7) * 0.012;
  ik2(son, "upperarm01.R", "lowerarm01.R", "wrist.R", at(son, -0.08 + write, 0.8, 0.36), at(son, -0.5, 0.6, 0));
  orientHand(son, "R", new THREE.Vector3(0, -0.4, 1).applyQuaternion(son.root.quaternion).normalize(), new THREE.Vector3(0, -1, 0));
  curlFingers(son, "R", 0.6);
  ik2(son, "upperarm01.L", "lowerarm01.L", "wrist.L", at(son, 0.14, 0.785, 0.32), at(son, 0.5, 0.6, 0));
  orientHand(son, "L", new THREE.Vector3(-0.3, -0.1, 1).applyQuaternion(son.root.quaternion).normalize(), new THREE.Vector3(0, -1, 0));
  curlFingers(son, "L", 0.3);
  const listen = ease(t, 100.3, 100.9) * (1 - ease(t, 102.0, 102.7));
  lookAt(son, at(son, 0, 0.78, 0.35).lerp(momHead, listen), 0.85);
  face(son, t, [], {}, 2);

  const pen = at(son, -0.08 + write, 0.8, 0.42);
  let cam: Cam;
  if (t < 99.8) cam = camPath([{ t: 95, pos: [0.22, 1.35, 2.2], target: [0.22, 1.02, -0.68], fov: 40 }, { t: 99.8, pos: [0.22, 1.33, 1.95], target: [0.22, 1.05, -0.68], fov: 38 }], t);
  else if (t < 104.2) cam = camPath([{ t: 99.8, pos: [-0.75, 1.3, 0.75], target: [0.45, 1.1, -0.65], fov: 36 }, { t: 104.2, pos: [-0.7, 1.28, 0.7], target: [0.45, 1.1, -0.65], fov: 34 }], t);
  else if (t < 106.8) cam = { pos: momHead.clone().lerp(husHead, 0.5).add(new THREE.Vector3(0, 0.18, -0.05)), target: new THREE.Vector3(0.22, 0.766, -0.25), fov: 32 };
  else if (t < 109) cam = camPath([{ t: 106.8, pos: [0.22, 1.33, 1.95], target: [0.22, 1.05, -0.68], fov: 38 }, { t: 109, pos: [0.22, 1.32, 1.8], target: [0.22, 1.05, -0.68], fov: 36 }], t);
  else cam = { pos: phoneP.clone().add(new THREE.Vector3(-0.32, 0.28, -0.35)), target: phoneP, fov: 36 };
  return (
    <>
      <CameraRig cam={cam} />
      <hemisphereLight args={["#FFF0DF", "#AD9582", 1.2]} />
      <pointLight position={[0.2, 2.3, 0.8]} intensity={1.15} distance={5} decay={1.6} color="#FFE4C3" />
      <directionalLight position={[1.5, 2.5, -4]} intensity={0.6} color="#F4CAA6" />
      <directionalLight position={[-1, 2.8, 3]} intensity={0.9} color="#FFF3E2" castShadow shadow-mapSize={[1024, 1024]} shadow-radius={4} shadow-bias={-0.0005} />
      <Kitchen />
      <Chair pos={[MOM_K.x, 0, MOM_K.z - 0.06]} />
      <Chair pos={[HUS_K.x, 0, HUS_K.z - 0.06]} />
      <Chair pos={[SON_K.x + 0.06, 0, SON_K.z]} rotY={-Math.PI / 2} />
      {/* тетрадь и ручка сына */}
      <mesh position={[0.78, 0.765, -0.02]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <planeGeometry args={[0.2, 0.28]} />
        <meshStandardMaterial color="#FBFAF5" />
      </mesh>
      <mesh position={pen} rotation={[0, 0, 1.2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.13, 8]} />
        <meshStandardMaterial color="#2F6FDB" />
      </mesh>
      <Character rig={mom} />
      <Character rig={hus} />
      <Character rig={son} />
      <Phone screen={t < 101.8 ? null : t < 109 ? page : form} matrix={phoneM} glow={0.95} />
    </>
  );
};

const AfternoonScene0: React.FC = () => <AfternoonInner />;
const HomeInner: React.FC = () => <KitchenView t={useShotTime("home")} />;
const FormInner: React.FC = () => <KitchenView t={useShotTime("form")} />;

export const AfternoonScene: React.FC = () => (
  <Stage>
    <AfternoonScene0 />
  </Stage>
);
export const HomeScene: React.FC = () => (
  <Stage bg="#2B2233">
    <HomeInner />
  </Stage>
);
export const FormScene: React.FC = () => (
  <Stage bg="#2B2233">
    <FormInner />
  </Stage>
);
