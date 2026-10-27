import { useMemo } from "react";
import * as THREE from "three";
import { BOOK, type BookState } from "../engines/LivingBookEngine";
import { elementState, tuckIntoGutter, worldVisible } from "../engines/PopUpWorldEngine";
import { pyramidNet, setTriangles } from "../engines/PaperFoldEngine";
import { paper } from "../materials/PaperMaterial";
import { TL } from "../story/timeline";
import { PALETTE as C } from "../styles/palette";
import { clamp, ease } from "../utils/math";
import { PaperGlobe, PaperPlanet, PaperSun, VStand } from "./PaperParts";

const P = TL.popups.earth;
export const EARTH_R = 0.34;
const GLOBE_Z = 0.12;
const SUN_POS = new THREE.Vector3(0.7, 0.5, -0.08);
const STAND_H = 0.15;
const N = 7;

/** Все фазы мира «Земля» в момент t (общие для 3D и подписей). */
export const earthPhases = (t: number) => {
  const c = P.collapse;
  const spinT = clamp((t - P.spinStart) / (c[0] - P.spinStart));
  return {
    tab: elementState(t, P.fold, c, 0, N),
    rise: elementState(t, P.rise, c, 0, N),
    stand: elementState(t, P.stand, c, 1, N),
    fan: elementState(t, P.expand, c, 2, N, ease.inOutSine),
    tilt: elementState(t, P.orbits, c, 3, N),
    orbits: elementState(t, P.orbits, c, 4, N),
    sun: elementState(t, P.sun, c, 5, N, (x) => ease.outBack(x, 0.9)),
    beam: elementState(t, P.beam, c, 6, N),
    // Ровно один оборот вокруг своей оси с плавным разгоном и остановкой.
    spin: Math.PI * 2 * ease.inOutSine(spinT),
    tuck: tuckIntoGutter(t, c),
  };
};

const bookOffset = (book: BookState) => -(BOOK.W / 2) * (1 - book.openness);

/** Мировые точки для подписей «ДЕНЬ» / «НОЧЬ». */
export const earthAnchors = (t: number, book: BookState) => {
  const ph = earthPhases(t);
  const cy = book.gutterY + STAND_H * ph.stand + EARTH_R;
  const ox = bookOffset(book);
  return {
    day: new THREE.Vector3(ox + EARTH_R * 0.95, cy + EARTH_R * 0.95, GLOBE_Z + 0.05),
    night: new THREE.Vector3(ox - EARTH_R * 0.55, cy + EARTH_R * 1.25, GLOBE_Z + 0.05),
  };
};

/** Тонкая бумажная дуга с растущей длиной (ORBITAL STRUCTURE). */
const Arc = ({ r, tube, arc, color }: { r: number; tube: number; arc: number; color: string }) => {
  const q = Math.max(1, Math.round(arc * 40));
  const g = useMemo(() => new THREE.TorusGeometry(r, tube, 5, 64, (q / 40) * Math.PI * 2), [r, tube, q]);
  if (arc <= 0.01) return null;
  return <mesh geometry={g} material={paper(color, { flat: true, metalness: 0.15, roughness: 0.6 })} castShadow />;
};

/** Подставка-усечённая пирамида: четыре стенки, складные по рёбрам основания. */
const Pedestal = ({ fold, h }: { fold: number; h: number }) => {
  const g = useMemo(() => new THREE.BufferGeometry(), []);
  const s = 0.62;
  const r = pyramidNet(
    [
      [-0.15, -0.15],
      [0.15, -0.15],
      [0.15, 0.15],
      [-0.15, 0.15],
    ],
    [0, h / s, 0],
    fold,
    s,
  );
  setTriangles(g, r.slope);
  return <mesh geometry={g} material={paper(C.gold, { flat: true, metalness: 0.2, roughness: 0.55 })} castShadow receiveShadow />;
};

/**
 * Pop-up «Земля»: сгиб → полукруг поднимается (FOLD UP) → дольки
 * раскрываются в шар (RADIAL EXPANSION) на складной подставке →
 * меридиан и орбита Луны (ORBITAL STRUCTURE) → Солнце на V-стойке.
 * Вращение — вокруг собственной оси, Солнце неподвижно.
 */
export const PopUpEarth = ({ t, book }: { t: number; book: BookState }) => {
  if (!worldVisible(t, P.fold[0], P.collapse)) return null;
  const ph = earthPhases(t);
  const gy = book.gutterY;
  const standH = STAND_H * ph.stand;
  const ox = bookOffset(book);
  const sunLocal = new THREE.Vector3(SUN_POS.x, gy + SUN_POS.y * ph.sun, SUN_POS.z);
  const sunWorld = sunLocal.clone().add(new THREE.Vector3(ox, 0, 0));
  const globeCenter = new THREE.Vector3(0, gy + standH + EARTH_R, GLOBE_Z);
  const squash = 1 - 0.55 * ph.tuck;
  const beamLen = globeCenter.distanceTo(sunLocal) - EARTH_R * 0.6;
  const beamDir = globeCenter.clone().sub(sunLocal).normalize();
  const beamQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), beamDir);
  const moonA = 0.6 + (t - P.orbits[0]) * 0.35;
  return (
    <group scale={[squash, 1, squash]}>
      {/* маленький сгиб в центре — начало конструкции */}
      <group position={[0, gy, GLOBE_Z]}>
        <mesh position={[0, 0.0, 0]} rotation={[0.9 * ph.tab - Math.PI / 2, 0, 0]} castShadow>
          <planeGeometry args={[0.32, 0.06]} />
          <primitive object={paper(C.goldLight)} attach="material" />
        </mesh>
      </group>
      {/* складная подставка */}
      <group position={[0, gy + 0.001, GLOBE_Z]}>
        <Pedestal fold={ph.stand} h={Math.max(standH, 0.001)} />
      </group>
      {/* глобус: поднимается вокруг южного полюса */}
      <group position={[0, gy + standH, GLOBE_Z]} rotation={[-(Math.PI / 2) * (1 - ph.rise), 0, 0]}>
        <group position={[0, EARTH_R, 0]}>
          <group rotation={[0, 0, 0.36 * ph.tilt]}>
            <PaperGlobe R={EARTH_R} fan={ph.fan} spin={ph.spin} dayNight={ph.sun} sunWorld={sunWorld} />
            {/* золотой меридиан-держатель */}
            <group rotation={[0, 0, -Math.PI / 2]}>
              <Arc r={EARTH_R + 0.035} tube={0.007} arc={0.5 * ph.orbits} color={C.gold} />
            </group>
          </group>
          {/* орбита Луны: тонкая бумажная дуга */}
          <group rotation={[0.42, 0, 0.12]}>
            <group rotation={[Math.PI / 2, 0, 0]}>
              <Arc r={EARTH_R + 0.2} tube={0.005} arc={ph.orbits} color={C.sky} />
            </group>
            {ph.orbits > 0.95 ? (
              <group position={[Math.cos(moonA) * (EARTH_R + 0.2), 0, -Math.sin(moonA) * (EARTH_R + 0.2)]}>
                <PaperPlanet r={0.035 * clamp((ph.orbits - 0.95) * 20)} color={C.milk} />
              </group>
            ) : null}
          </group>
        </group>
      </group>
      {/* Солнце на V-стойке: поднимается из сгиба правой страницы */}
      {ph.sun > 0.001 ? (
        <group position={[SUN_POS.x, gy, SUN_POS.z]} rotation={[-(Math.PI / 2) * (1 - ph.sun), 0, 0]}>
          <VStand h={SUN_POS.y - 0.1} w={0.07} open={ph.sun} />
          <group position={[0, SUN_POS.y, 0]} rotation={[0, -0.55, 0]}>
            <PaperSun r={0.085} rot={t * 0.15} />
          </group>
          <pointLight color="#ffd9a0" intensity={0.35 * ph.sun} distance={2.2} position={[0, SUN_POS.y, 0.1]} />
        </group>
      ) : null}
      {/* символический луч света от Солнца к Земле (калька) */}
      {ph.beam > 0.01 ? (
        <group position={sunLocal} quaternion={beamQ}>
          <mesh position={[0, -(beamLen * ph.beam) / 2, 0]}>
            <coneGeometry args={[0.28 * ph.beam, beamLen * ph.beam, 32, 1, true]} />
            <meshBasicMaterial color="#ffd27a" transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};
