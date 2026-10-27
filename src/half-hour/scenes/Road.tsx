import { useMemo } from "react";
import * as THREE from "three";
import { useShotTime } from "../context";
import { drawCarClock } from "../screens";
import { Character, useCharacter } from "../three/character";
import { face } from "../three/face";
import { at, ease, place, sit } from "../three/poses";
import { Phone, useFontReady, useScreenTexture } from "../three/props";
import { curlFingers, ik2, lookAt, orientHand, type Rig } from "../three/rig";
import { Car, CarInterior, Street, TrafficLight } from "../three/sets2";
import { CameraRig, Stage, type Cam } from "../three/stage";
import { SchoolYardView, type SchoolCam } from "./School";

// Дорога: машина мамы стоит в начале координат (салон: сиденье водителя —
// (0, 0, 0), вперёд +z), мир движется навстречу. Скорость: медленный поток
// 3 м/с → торможение к красному (54–55.8 с) → стоянка → зелёный (61.8 с).
const V0 = 3.0;
const T_BRAKE = 54;
const T_STOP = 55.8;
const T_GREEN = 61.8;
const ACC = 1.2;
const dist = (t: number) => {
  let s = Math.max(0, Math.min(t, T_BRAKE) - 45) * V0;
  if (t > T_BRAKE) {
    const u = Math.min(t, T_STOP) - T_BRAKE;
    const dec = V0 / (T_STOP - T_BRAKE);
    s += V0 * u - 0.5 * dec * u * u;
  }
  if (t > T_GREEN) {
    const u = t - T_GREEN;
    s += 0.5 * ACC * u * u;
  }
  return s;
};
const STOP_S = dist(T_STOP);
const LANE_X = -2.0; // правая полоса (ось дороги — x = 0 мира улицы)
const HOLDER = new THREE.Vector3(-0.32, 1.06, 0.72);

// Водитель: сидит, руки на руле (10 и 2 часа), взгляд — на дорогу.
const driver = (rig: Rig, t: number, glance: number) => {
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
  const road = new THREE.Vector3(Math.sin(t * 0.4) * 0.3, 1.2, 8);
  lookAt(rig, road.clone().lerp(HOLDER, glance), 1);
};

const RoadInner: React.FC = () => {
  const t = useShotTime("road");
  const mom = useCharacter("mom");
  useFontReady();
  const clockText = t < 50 ? "12:47" : t < 57.2 ? "12:53" : "12:54";
  const clock = useScreenTexture(drawCarClock(clockText), clockText);
  const s = dist(t);
  // взгляд на часы — только когда машина стоит (56.6–58.0 с)
  const glance = ease(t, 56.6, 57.0) * (1 - ease(t, 57.7, 58.1));
  driver(mom, t, glance);
  face(mom, t, [], { worry: 0.55 + glance * 0.2 }, 1);

  const brake = t > T_BRAKE - 0.4 && t < T_GREEN + 0.4 ? 1 : 0;
  const lightZ = STOP_S + 13.5 - s;
  const light = t < T_GREEN ? 2 : 0;
  // поток: впереди машины едут с той же скоростью; встречные — навстречу
  const lead = 7.5 + (t > T_GREEN ? 0.5 * 0.4 * (t - T_GREEN) ** 2 : 0);
  const oncoming = useMemo(() => [0, 1, 2, 3, 4, 5].map((i) => ({ z0: 30 + i * 24, c: ["#C8CDD4", "#2E3440", "#8C1C2B", "#F2F2F2", "#3E5C76", "#7A7F87"][i] })), []);

  let cam: Cam;
  let exterior = false;
  if (t < 50) {
    cam = { pos: new THREE.Vector3(-0.80, 1.25, 0.85 - (t - 45) * 0.01), target: new THREE.Vector3(0.0, 1.02, 0.08), fov: 48 };
  } else if (t < 56.6) {
    exterior = true;
    // камера стоит у обочины позади (в мире улицы): машина тормозит,
    // впереди — красный свет
    const z = STOP_S - 7 - s;
    cam = { pos: new THREE.Vector3(-3.6, 1.55, z), target: new THREE.Vector3(-2.2, 2.2, lightZ), fov: 44 };
  } else if (t < 57.3 || (t >= 58.0 && t < 59)) {
    // Same comfortable distance as the opening drive: the face is not pressed
    // against the frame edge.
    cam = { pos: new THREE.Vector3(-0.80, 1.22, 0.95), target: new THREE.Vector3(-0.02, 1.08, 0.05), fov: 46 };
  } else if (t < 58.0) {
    cam = { pos: HOLDER.clone().add(new THREE.Vector3(-0.26, 0.18, -0.22)), target: HOLDER, fov: 34 };
  } else {
    exterior = true;
    // камера на тротуаре впереди: машина трогается и едет к ней
    cam = { pos: new THREE.Vector3(-5.0, 1.45, STOP_S + 21 - s), target: new THREE.Vector3(-0.4, 0.9, 0.4), fov: 32 };
  }
  return (
    <>
      <CameraRig cam={cam} />
      <hemisphereLight args={["#F0F6FF", "#BEB3A4", 1.3]} />
      <directionalLight position={[8, 12, 6]} intensity={1.65} color="#FFF3DE" castShadow shadow-mapSize={[1024, 1024]} shadow-radius={4} shadow-bias={-0.0004} shadow-normalBias={0.025} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
      <group position={[-LANE_X, -0.25, 0]}>
        <Street offset={s} />
      </group>
      <Car pos={[-0.37, -0.25, lead]} color="#5D6B7A" brake={brake} />
      <Car pos={[-0.37, -0.25, lead + 6.5]} color="#E4E4E2" brake={brake} />
      {oncoming.map((o, i) => (
        <Car key={i} pos={[3.6, -0.25, ((((o.z0 - s - t * 6) % 160) + 160) % 160) - 40]} rotY={Math.PI} color={o.c} />
      ))}
      <TrafficLight pos={[-6.2, -0.17, lightZ]} rotY={Math.PI} state={light} />
      <TrafficLight pos={[5.6, -0.17, lightZ + 18]} rotY={Math.PI} state={light} />
      {exterior ? (
        <Car pos={[-0.37, -0.25, 0.2]} color="#A8AFB8" brake={brake} />
      ) : (
        <>
          <CarInterior
            phone={
              <group rotation={[0, Math.PI, 0]}>
                <Phone screen={clock} glow={0.9} />
              </group>
            }
          />
          <Character rig={mom} />
        </>
      )}
    </>
  );
};

// Школьный двор в перебивках (50–54 и 59–62 с).
const yardCam: SchoolCam = (t) => {
  // Wide enough that the walking adults keep their heads in frame.
  if (t < 54) return { pos: new THREE.Vector3(-3.5, 1.62, 2.3), target: new THREE.Vector3(-0.4, 1.2, 4.8), fov: 42 };
  return { pos: new THREE.Vector3(0.15, 1.6, 9.0), target: new THREE.Vector3(0.65, 0.95, 3.4), fov: 26 };
};

const RoadOrYard: React.FC = () => {
  const t = useShotTime("road");
  if ((t >= 50 && t < 54) || (t >= 59 && t < 62)) return <SchoolYardView t={t} cam={yardCam} />;
  return <RoadInner />;
};

export const RoadScene: React.FC = () => (
  <Stage>
    <RoadOrYard />
  </Stage>
);
