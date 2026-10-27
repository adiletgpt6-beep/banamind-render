import { useMemo } from "react";
import * as THREE from "three";
import { cloudShape, luneGeometry, pyramidNet, setTriangles, starShape, type V2, type V3 } from "../engines/PaperFoldEngine";
import { createEarthMaterial } from "../materials/EarthMaterial";
import { paper } from "../materials/PaperMaterial";
import { earthTexture } from "../materials/textures";
import { PALETTE as C } from "../styles/palette";
import { clamp } from "../utils/math";

// Повторно используемые бумажные детали pop-up миров.

const LUNES = 16;
const SEPTA = [C.sky, C.riverDeep, C.navyInk, C.river];

/**
 * Бумажный глобус-«соты» (RADIAL EXPANSION): 16 долек от полюса до полюса,
 * у каждой — полудиск-перегородка. Сложенные дольки образуют плоский
 * полукруг; раскрываясь веером на 360°, они собираются в шар.
 */
export const PaperGlobe = ({
  R,
  fan,
  spin,
  dayNight,
  sunWorld,
}: {
  R: number;
  fan: number;
  spin: number;
  dayNight: number;
  sunWorld: THREE.Vector3;
}) => {
  const dLon = (Math.PI * 2) / LUNES;
  const lunes = useMemo(
    () => Array.from({ length: LUNES }, (_, k) => luneGeometry(R * (1 - k * 0.0016), k * dLon, dLon * 1.02, 26, 4)),
    [R, dLon],
  );
  const septum = useMemo(() => new THREE.CircleGeometry(R * 0.985, 40, -Math.PI / 2, Math.PI), [R]);
  const mat = useMemo(() => createEarthMaterial(earthTexture(), C.milk), []);
  mat.uniforms.dayNight.value = dayNight;
  (mat.uniforms.sunPos.value as THREE.Vector3).copy(sunWorld);
  return (
    <group>
      {lunes.map((g, k) => {
        const a = k * dLon * fan + k * 0.0045 * (1 - fan) + spin;
        return (
          <group key={k} rotation={[0, a, 0]}>
            <mesh geometry={g} material={mat} castShadow />
            {fan < 0.999 ? <mesh geometry={septum} material={paper(SEPTA[k % SEPTA.length])} castShadow /> : null}
          </group>
        );
      })}
    </group>
  );
};

/** Простой бумажный шарик-планета (гранёный, как склеенный из бумаги). */
export const PaperPlanet = ({ r, color, detail = 1 }: { r: number; color: string; detail?: number }) => {
  const g = useMemo(() => new THREE.IcosahedronGeometry(r, detail), [r, detail]);
  return <mesh geometry={g} material={paper(color, { flat: true, side: THREE.FrontSide })} castShadow receiveShadow />;
};

/** Маленькая Земля с днём и ночью (для космической диорамы). */
export const SmallEarth = ({ r, spin, sunWorld }: { r: number; spin: number; sunWorld: THREE.Vector3 }) => {
  const g = useMemo(() => new THREE.SphereGeometry(r, 32, 20), [r]);
  const mat = useMemo(() => createEarthMaterial(earthTexture(), C.milk), []);
  mat.uniforms.dayNight.value = 1;
  (mat.uniforms.sunPos.value as THREE.Vector3).copy(sunWorld);
  return <mesh geometry={g} material={mat} rotation={[0, spin, 0]} castShadow />;
};

/** Бумажное Солнце: гранёное ядро и два слоя лучей-звёзд. */
export const PaperSun = ({ r, rot }: { r: number; rot: number }) => {
  const core = useMemo(() => new THREE.IcosahedronGeometry(r, 1), [r]);
  const rays = useMemo(() => {
    const a = new THREE.ExtrudeGeometry(starShape(r * 1.9, r * 1.15, 12), { depth: 0.006, bevelEnabled: false });
    const b = new THREE.ExtrudeGeometry(starShape(r * 1.55, r * 1.05, 12, Math.PI / 12), { depth: 0.006, bevelEnabled: false });
    return [a, b];
  }, [r]);
  return (
    <group>
      <mesh geometry={core} material={paper(C.sunCore, { flat: true, emissive: "#f6b94a", emissiveIntensity: 0.55, side: THREE.FrontSide })} castShadow />
      <mesh geometry={rays[0]} material={paper(C.sunRay, { emissive: "#e48a2a", emissiveIntensity: 0.35 })} position={[0, 0, -0.03]} rotation={[0, 0, rot]} castShadow />
      <mesh geometry={rays[1]} material={paper(C.sunGold, { emissive: "#f0a640", emissiveIntensity: 0.4 })} position={[0, 0, -0.015]} rotation={[0, 0, -rot * 0.7]} castShadow />
    </group>
  );
};

const CLOUD_LAYERS = ["#FFFFFF", "#F4F1EA", "#E2EEF5"];

/**
 * Многослойное облако (LAYERED POP-UP): три вырезанных слоя бумаги
 * разного размера; spread раздвигает слои по глубине.
 */
export const PaperCloud = ({ w, h, spread, seed = 0 }: { w: number; h: number; spread: number; seed?: number }) => {
  const geoms = useMemo(() => {
    const variants = [
      [0.55, 0.9, 1.0, 0.7],
      [0.7, 1.0, 0.8],
      [0.6, 0.85, 0.95, 0.75, 0.5],
    ];
    return CLOUD_LAYERS.map((_, i) => {
      const b = variants[(i + seed) % variants.length];
      const g = new THREE.ExtrudeGeometry(cloudShape(w * (1 - i * 0.16), h * (1 - i * 0.12), b), {
        depth: 0.008,
        bevelEnabled: true,
        bevelThickness: 0.002,
        bevelSize: 0.003,
        bevelSegments: 1,
        curveSegments: 10,
      });
      return g;
    });
  }, [w, h, seed]);
  return (
    <group>
      {geoms.map((g, i) => (
        <mesh
          key={i}
          geometry={g}
          material={paper(CLOUD_LAYERS[i])}
          position={[(i - 1) * w * 0.06, i * h * 0.04, -i * 0.05 * spread - 0.001 * i]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
};

/** Гора из развёртки пирамиды (FOLD UP) со снежной шапкой отдельным слоем. */
export const PaperMountain = ({
  base,
  apex,
  fold,
  color,
  snow = 0.68,
  mode = "lift",
}: {
  base: V2[];
  apex: V3;
  fold: number;
  color: string;
  snow?: number;
  mode?: "net" | "lift";
}) => {
  const slope = useMemo(() => new THREE.BufferGeometry(), []);
  const cap = useMemo(() => new THREE.BufferGeometry(), []);
  const r = pyramidNet(base, apex, fold, snow, mode);
  setTriangles(slope, r.slope);
  setTriangles(cap, r.cap);
  const capVisible = snow < 0.99 && fold > 0.05;
  return (
    <group>
      <mesh geometry={slope} material={paper(color, { flat: true })} castShadow receiveShadow />
      {capVisible ? <mesh geometry={cap} material={paper(C.snow, { flat: true })} castShadow receiveShadow /> : null}
    </group>
  );
};

/** Тонкая бумажная стойка-крепление (показывает связь объекта со страницей). */
export const Strut = ({ h, w = 0.022, color = C.paperWarm }: { h: number; w?: number; color?: string }) => {
  const g = useMemo(() => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), []);
  if (h <= 0.001) return null;
  return <mesh geometry={g} material={paper(color)} scale={[w, h, 0.004]} castShadow receiveShadow />;
};

/** Объёмная стойка-«домик» из двух сложенных полос (V-сгиб). */
export const VStand = ({ h, w = 0.06, open }: { h: number; w?: number; open: number }) => {
  const g = useMemo(() => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), []);
  const a = 0.35 * clamp(open);
  return (
    <group>
      <mesh geometry={g} material={paper(C.paperWarm)} scale={[w, h, 0.004]} position={[0, 0, 0.012]} rotation={[a, 0, 0]} castShadow />
      <mesh geometry={g} material={paper(C.paperShadow)} scale={[w, h, 0.004]} position={[0, 0, -0.012]} rotation={[-a, 0, 0]} castShadow />
    </group>
  );
};

export const paperStar = (R: number, points = 8) =>
  new THREE.ExtrudeGeometry(starShape(R, R * 0.45, points), {
    depth: 0.006,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 1,
  });
