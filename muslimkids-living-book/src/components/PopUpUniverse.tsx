import { useMemo } from "react";
import * as THREE from "three";
import { BOOK, type BookState } from "../engines/LivingBookEngine";
import { elementState, seq, tuckIntoGutter, worldVisible } from "../engines/PopUpWorldEngine";
import { planarUV } from "../engines/PaperFoldEngine";
import { paper } from "../materials/PaperMaterial";
import { nightPaperTexture } from "../materials/textures";
import { TL } from "../story/timeline";
import { PALETTE as C } from "../styles/palette";
import { clamp, ease } from "../utils/math";
import { PaperPlanet, PaperSun, SmallEarth, Strut, paperStar } from "./PaperParts";

const P = TL.popups.universe;
const ARCH_Z = -0.62;
const SUN = new THREE.Vector3(0, 0.5, -0.12);
const ORBITS = [0.3, 0.5];
const TILT = 0.3;
const N = 7;

const archGeometry = () => {
  const s = new THREE.Shape();
  const Ro = 0.98;
  const Ri = 0.74;
  s.moveTo(Ro, 0);
  s.absarc(0, 0, Ro, 0, Math.PI, false);
  s.lineTo(-Ri, 0);
  s.absarc(0, 0, Ri, Math.PI, 0, true);
  s.lineTo(Ro, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false, curveSegments: 48 }).translate(0, 0, -0.012);
  return planarUV(g, "x", "y");
};

/** Бумажная полоса-орбита, которая «обматывается» вокруг Солнца. */
const OrbitBand = ({ r, sweep }: { r: number; sweep: number }) => {
  const q = Math.max(1, Math.round(sweep * 48));
  const g = useMemo(() => new THREE.CylinderGeometry(r, r, 0.014, 96, 1, true, -Math.PI / 2, (q / 48) * Math.PI * 2), [r, q]);
  if (sweep <= 0.01) return null;
  return <mesh geometry={g} material={paper(C.gold, { metalness: 0.25, roughness: 0.5 })} castShadow receiveShadow />;
};

const ARCH_STARS = Array.from({ length: 9 }, (_, i) => {
  const a = 0.18 + (i / 8) * (Math.PI - 0.36);
  return { a, depth: 0.02 + ((i * 37) % 5) * 0.014, size: 0.035 + ((i * 13) % 3) * 0.01, gold: i % 2 === 0 };
});

const FRONT_STARS = [
  { x: -0.78, z: 0.22, h: 0.42, s: 0.05 },
  { x: 0.8, z: 0.18, h: 0.5, s: 0.055 },
  { x: -0.55, z: 0.42, h: 0.28, s: 0.04 },
  { x: 0.6, z: 0.45, h: 0.32, s: 0.042 },
];

const ringPoint = (r: number, a: number) => new THREE.Vector3(Math.cos(a) * r, 0, -Math.sin(a) * r);

/** Положение маленькой Земли на орбите (локально, относительно Солнца). */
const earthAngle = (t: number) => -0.95 + (t - P.earth[0]) * 0.04;

/**
 * Pop-up «Небо»: на тёмно-синем развороте поднимается арка ночного неба
 * (FOLD UP), Солнце на колонне, бумажные орбиты обматываются вокруг него
 * (ORBITAL STRUCTURE) со спицами (RADIAL EXPANSION), Земля с днём и ночью,
 * планеты на разной глубине и звёзды на откидных язычках.
 */
export const PopUpUniverse = ({ t, book }: { t: number; book: BookState }) => {
  const arch = useMemo(archGeometry, []);
  const starG = useMemo(() => paperStar(1, 8), []);
  const ringG = useMemo(() => new THREE.RingGeometry(0.075, 0.115, 40), []);
  const archMats = useMemo(
    () => [new THREE.MeshStandardMaterial({ map: nightPaperTexture(), roughness: 0.85 }), paper(C.navyDeep)],
    [],
  );
  if (!worldVisible(t, P.arch[0], P.collapse)) return null;
  const c = P.collapse;
  const arc = elementState(t, P.arch, c, 0, N);
  const sun = elementState(t, P.sun, c, 1, N);
  const orbits = elementState(t, P.orbits, c, 2, N, ease.inOutSine);
  const earth = elementState(t, P.earth, c, 3, N, (x) => ease.outBack(x, 1.2));
  const planets = elementState(t, P.planets, c, 4, N, ease.linear);
  const stars = elementState(t, P.stars, c, 5, N, ease.linear);
  const tuck = tuckIntoGutter(t, c);
  const gy = book.gutterY;
  const ox = -(BOOK.W / 2) * (1 - book.openness);
  const sunLocal = new THREE.Vector3(0, gy + SUN.y * sun, SUN.z);
  const ea = earthAngle(t);
  // мировая позиция Солнца для освещения Земли
  const sunWorld = sunLocal.clone().add(new THREE.Vector3(ox, 0, 0));
  const sq = 1 - 0.5 * tuck;
  const planetList = [
    { r: ORBITS[1], a: 2.55, size: 0.058, color: "#E39A57", k: 0 },
    { r: ORBITS[1], a: 0.55, size: 0.04, color: "#C8664A", k: 1 },
  ];
  return (
    <group scale={[sq, 1, sq]}>
      {/* арка ночного неба */}
      <group position={[0, gy + 0.001, ARCH_Z]} rotation={[(Math.PI / 2) * (1 - arc), 0, 0]}>
        <mesh geometry={arch} material={archMats} castShadow receiveShadow />
        {ARCH_STARS.map((s, i) => {
          const p = ease.outBack(seq(stars, i, ARCH_STARS.length + 4, 0.5), 1.4);
          if (p <= 0.01) return null;
          return (
            <group key={i} position={[Math.cos(s.a) * 0.86, Math.sin(s.a) * 0.86, 0]}>
              <mesh position={[0, 0, (s.depth * p) / 2]} scale={[0.003, 0.003, s.depth * p]}>
                <boxGeometry args={[1, 1, 1]} />
                <primitive object={paper(C.goldLight)} attach="material" />
              </mesh>
              <mesh
                geometry={starG}
                material={paper(s.gold ? C.gold : C.milk, { metalness: s.gold ? 0.3 : 0, roughness: 0.55 })}
                position={[0, 0, s.depth * p]}
                rotation={[0, (Math.PI / 2) * (1 - p), i * 0.4]}
                scale={s.size}
                castShadow
              />
            </group>
          );
        })}
        {/* окольцованная планета на нити из внутреннего края арки */}
        {planets > 0.01 ? (
          <group position={[-0.47, 0.57, 0.08]}>
            <mesh position={[0, -0.06, 0]} scale={[0.003, 0.12 * clamp(planets * 2), 0.003]}>
              <boxGeometry args={[1, 1, 1]} />
              <primitive object={paper(C.goldLight)} attach="material" />
            </mesh>
            <group position={[0, -0.12 - 0.05, 0]} scale={ease.outBack(seq(planets, 2, 3, 0.4), 1.3)}>
              <PaperPlanet r={0.05} color="#D9C08A" />
              <mesh geometry={ringG} material={paper(C.goldLight)} rotation={[-1.2, 0.3, 0]} castShadow />
            </group>
          </group>
        ) : null}
      </group>
      {/* звёзды на стойках у переднего края */}
      {FRONT_STARS.map((s, i) => {
        const p = seq(stars, ARCH_STARS.length + i, ARCH_STARS.length + 4, 0.5);
        if (p <= 0.01) return null;
        const h = s.h * ease.inOutCubic(clamp(p * 1.4));
        return (
          <group key={i} position={[s.x, gy, s.z]}>
            <Strut h={h} w={0.008} color={C.goldLight} />
            <mesh
              geometry={starG}
              material={paper(i % 2 ? C.gold : C.milk, { metalness: 0.2, roughness: 0.6 })}
              position={[0, h + s.s * 0.6, 0.004]}
              rotation={[0, 0, t * 0.2 + i]}
              scale={s.s * ease.outBack(clamp(p * 1.6 - 0.5), 1.3)}
              castShadow
            />
          </group>
        );
      })}
      {/* колонна Солнца поднимается из сгиба */}
      <group position={[0, gy, SUN.z]} rotation={[(Math.PI / 2) * (1 - sun), 0, 0]}>
        {sun > 0.001 ? (
          <>
            <mesh position={[0, (SUN.y - 0.1) / 2, 0]} castShadow>
              <cylinderGeometry args={[0.014, 0.02, SUN.y - 0.1, 8]} />
              <primitive object={paper(C.goldDeep, { flat: true })} attach="material" />
            </mesh>
            <group position={[0, SUN.y, 0]} scale={0.4 + 0.6 * ease.outBack(sun, 1.1)}>
              <PaperSun r={0.11} rot={t * 0.12} />
            </group>
            <pointLight color="#ffd59a" intensity={0.55 * sun} distance={2.5} position={[0, SUN.y, 0.15]} />
          </>
        ) : null}
      </group>
      {/* орбиты, спицы, Земля и планеты — в наклонной плоскости вокруг Солнца */}
      {sun > 0.95 || orbits > 0 ? (
        <group position={sunLocal} rotation={[TILT, 0, 0]}>
          {ORBITS.map((r, i) => (
            <OrbitBand key={i} r={r} sweep={clamp(orbits * 1.3 - i * 0.3)} />
          ))}
          {[0.6, 2.2, 3.75, 5.3].map((a, i) => {
            const len = ORBITS[1] * ease.outCubic(clamp(orbits * 1.4 - 0.2));
            if (len < 0.01) return null;
            return (
              <mesh key={i} rotation={[0, a, 0]} position={[Math.cos(a) * (len / 2 + 0.06), 0, -Math.sin(a) * (len / 2 + 0.06)]}>
                <boxGeometry args={[Math.max(len - 0.12, 0.001), 0.002, 0.012]} />
                <primitive object={paper(C.goldLight)} attach="material" />
              </mesh>
            );
          })}
          {earth > 0.01 ? (
            <group position={ringPoint(ORBITS[0], ea)} rotation={[-TILT, 0, 0]} scale={earth}>
              <SmallEarth r={0.068} spin={(t - P.earth[0]) * 0.9} sunWorld={sunWorld} />
            </group>
          ) : null}
          {planetList.map((pl) =>
            planets > 0.01 ? (
              <group key={pl.k} position={ringPoint(pl.r, pl.a)} scale={ease.outBack(seq(planets, pl.k, 3, 0.4), 1.3)}>
                <PaperPlanet r={pl.size} color={pl.color} />
              </group>
            ) : null,
          )}
        </group>
      ) : null}
    </group>
  );
};

/** Мировые позиции для подписей (центр композиции). */
export const universeAnchor = (book: BookState) =>
  new THREE.Vector3(-(BOOK.W / 2) * (1 - book.openness), book.gutterY + 1.1, ARCH_Z);
