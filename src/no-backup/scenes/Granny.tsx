import * as THREE from "three";
import { phoneMatrix, phoneToEar } from "../acts";
import { useSpeech } from "../context";
import { GrannyRoom } from "../sets";
import { Character, useCharacter } from "../three/character";
import { face } from "../three/face";
import { at, ease, place, sit } from "../three/poses";
import { Phone } from "../three/props";
import { bonePos, curlFingers, ik2, lookAt, orientHand, turn, X, Y } from "../three/rig";
import { CameraRig, camPath, type Cam } from "../three/stage";

// Бабушка у себя дома (20.6–25.8 с): сидит на диване, телефон у правого уха,
// рядом сумка и папка — собирается к врачу. Отвечает тепло, с лёгким кивком.
const SEAT = new THREE.Vector3(-0.15, 0, -0.62);

export const GrannyView: React.FC<{ t: number }> = ({ t }) => {
  const gm = useCharacter("grandma");
  const sp = useSpeech(["g01", "m02"]);
  place(gm, SEAT.x, SEAT.z, 0.12);
  sit(gm, 0.43, 0.46, 0.04);
  phoneToEar(gm, "R", 1);
  // левая рука лежит на колене; во время реплики — мягкий жест ладонью
  const g = ease(t, sp.g01.from + 0.8, sp.g01.from + 1.4) * (1 - ease(t, sp.g01.to - 0.6, sp.g01.to + 0.1));
  const knee = at(gm, 0.12, 0.55, 0.32);
  const lift = at(gm, 0.16, 0.74, 0.34);
  ik2(gm, "upperarm01.L", "lowerarm01.L", "wrist.L", knee.lerp(lift, g * 0.8), at(gm, 0.5, 0.6, -0.1));
  const fwd = new THREE.Vector3(0, -0.2, 1).applyQuaternion(gm.root.quaternion).normalize();
  const palmDown = new THREE.Vector3(0, -1, 0);
  const palmUp = new THREE.Vector3(-0.5, 0.8, 0.2).applyQuaternion(gm.root.quaternion).normalize();
  orientHand(gm, "L", fwd, palmDown.lerp(palmUp, g).normalize());
  curlFingers(gm, "L", 0.3 - g * 0.15);
  // взгляд немного в сторону (слушает), голова чуть наклонена
  lookAt(gm, at(gm, -0.35, 1.0, 1.6), 0.7);
  turn(gm, "head", Y, Math.sin(t * 0.6) * 0.02);
  const nod = t > sp.g01.to - 0.2 && t < sp.g01.to + 0.9 ? Math.sin(((t - sp.g01.to + 0.2) / 1.1) * Math.PI) * 0.07 : 0;
  turn(gm, "head", X, nod);
  face(gm, t, sp.g01.words, { smile: 0.35, worry: t > sp.g01.from + 0.4 && t < sp.g01.to ? 0.3 : 0.1 }, 12);
  const head = bonePos(gm, "head");
  const cam: Cam = camPath(
    [
      { t: 20.6, pos: [head.x + 0.75, head.y + 0.02, head.z + 1.55], target: [head.x + 0.05, head.y - 0.28, head.z], fov: 32 },
      { t: 25.8, pos: [head.x + 0.62, head.y + 0.02, head.z + 1.35], target: [head.x + 0.03, head.y - 0.24, head.z], fov: 30 },
    ],
    t,
  );
  return (
    <>
      <CameraRig cam={cam} />
      <hemisphereLight args={["#FFF4E6", "#9C7C62", 0.9]} />
      <directionalLight position={[3, 2.6, 1.2]} intensity={1.8} color="#FFF1DA" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} shadow-normalBias={0.02} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
      <directionalLight position={[-1.5, 2, 3]} intensity={0.6} color="#FFE6CC" />
      <pointLight position={[0.6, 1.4, 1.2]} intensity={0.9} distance={4} color="#FFF0E0" />
      <GrannyRoom />
      <Character rig={gm} />
      <Phone screen={null} matrix={phoneMatrix(gm, "R")} />
    </>
  );
};
