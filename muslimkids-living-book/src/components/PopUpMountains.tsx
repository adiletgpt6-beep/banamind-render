import { useMemo } from "react";
import * as THREE from "three";
import type { BookState } from "../engines/LivingBookEngine";
import { elementState, seq, tuckIntoGutter, worldVisible } from "../engines/PopUpWorldEngine";
import { ribbonAlong, setIndexed, type V2, type V3 } from "../engines/PaperFoldEngine";
import { paper } from "../materials/PaperMaterial";
import { TL } from "../story/timeline";
import { PALETTE as C } from "../styles/palette";
import { clamp, ease, rng } from "../utils/math";
import { PaperCloud, PaperMountain, Strut } from "./PaperParts";

const P = TL.popups.mountains;

/** Неровный многоугольник основания горы. */
const basePoly = (cx: number, cz: number, r: number, n: number, seed: number): V2[] => {
  const R = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + R() * 0.3;
    const rr = r * (0.82 + R() * 0.3);
    return [cx + Math.cos(a) * rr, cz + Math.sin(a) * rr * 0.75] as V2;
  });
};

type MountainDef = { base: V2[]; apex: V3; color: string; snow: number };

const MOUNTAINS: MountainDef[][] = [
  // каждая гора — несколько слоёв: главный пик + передний отрог
  [
    { base: basePoly(0.0, -0.36, 0.36, 6, 1), apex: [0.03, 0.8, -0.4], color: C.mountain, snow: 0.66 },
    { base: basePoly(0.08, -0.12, 0.2, 5, 2), apex: [0.06, 0.34, -0.14], color: C.mountainLight, snow: 1 },
  ],
  [
    { base: basePoly(-0.52, -0.22, 0.28, 6, 3), apex: [-0.55, 0.56, -0.25], color: C.mountainShade, snow: 0.7 },
    { base: basePoly(-0.42, 0.0, 0.16, 5, 4), apex: [-0.44, 0.24, 0.0], color: C.mountainLight, snow: 1 },
  ],
  [
    { base: basePoly(0.5, -0.28, 0.3, 6, 5), apex: [0.53, 0.64, -0.3], color: C.mountain, snow: 0.68 },
    { base: basePoly(0.38, -0.05, 0.17, 5, 6), apex: [0.4, 0.27, -0.06], color: C.mountainLight, snow: 1 },
  ],
];

/** Холм: вырезанный зелёный силуэт на шарнире у основания. */
const hillShape = (w: number, h: number, bumps: number[]) => {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  const n = bumps.length;
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    const x = -w / 2 + u * w;
    let y = 0;
    for (let k = 0; k < n; k++) y += bumps[k] * Math.exp(-(((u - (k + 0.5) / n) * n * 1.5) ** 2));
    s.lineTo(x, Math.max(0.0, y * h * (0.25 + 0.75 * Math.sin(Math.PI * u))));
  }
  s.lineTo(w / 2, 0);
  s.lineTo(-w / 2, 0);
  return s;
};

const HILLS = [
  { x: -0.56, z: 0.2, w: 0.78, h: 0.2, bumps: [0.8, 1.0, 0.7], color: C.leaf },
  { x: 0.58, z: 0.24, w: 0.74, h: 0.22, bumps: [0.9, 0.7, 1.0], color: C.emeraldLight },
  { x: -0.62, z: 0.42, w: 0.6, h: 0.13, bumps: [1.0, 0.8], color: C.leafLight },
  { x: 0.64, z: 0.44, w: 0.56, h: 0.12, bumps: [0.7, 1.0], color: C.leaf },
];

const CLOUDS = [
  { x: -0.5, y: 0.82, z: -0.5, w: 0.42, h: 0.14, seed: 0 },
  { x: 0.46, y: 0.98, z: -0.56, w: 0.36, h: 0.12, seed: 1 },
  { x: -0.05, y: 1.12, z: -0.64, w: 0.3, h: 0.1, seed: 2 },
];

// Русло реки на странице: от подножия гор к ближнему краю книги.
const riverCurve = (u: number) => {
  const pts = [
    new THREE.Vector3(0.24, 0, -0.02),
    new THREE.Vector3(0.1, 0, 0.14),
    new THREE.Vector3(-0.08, 0, 0.3),
    new THREE.Vector3(0.06, 0, 0.48),
    new THREE.Vector3(-0.04, 0, 0.66),
  ];
  return new THREE.CatmullRomCurve3(pts).getPoint(clamp(u));
};

const River = ({ grow, t, layer }: { grow: number; t: number; layer: number }) => {
  const g = useMemo(() => new THREE.BufferGeometry(), []);
  const widths = [0.13, 0.085, 0.032];
  const colors = [C.riverDeep, C.river, C.riverLight];
  const lift = 0.003 + layer * 0.004;
  const curve = (u: number) => {
    const p = riverCurve(u);
    // лёгкие волны бумажной ленты — «течение воды»
    p.y = lift + (0.006 + layer * 0.004) * Math.max(0, Math.sin(u * 22 - t * 3.2 + layer)) * grow;
    p.x += layer * 0.006 * Math.sin(u * 9 + t * 1.5);
    return p;
  };
  const r = ribbonAlong(curve, (u) => widths[layer] * (0.75 + 0.35 * u), () => new THREE.Vector3(0, 1, 0), 0, Math.max(grow, 0.002), 70);
  setIndexed(g, r);
  if (grow <= 0.002) return null;
  return <mesh geometry={g} material={paper(colors[layer], { roughness: 0.55 })} receiveShadow castShadow />;
};

const Hill = ({ def, up }: { def: (typeof HILLS)[number]; up: number }) => {
  const geom = useMemo(
    () =>
      new THREE.ExtrudeGeometry(hillShape(def.w, def.h, def.bumps), { depth: 0.006, bevelEnabled: false, curveSegments: 4 }).translate(
        0,
        0,
        -0.006,
      ),
    [def],
  );
  // Холм лежит на странице «лицом вниз» вперёд и поднимается на шарнире.
  return (
    <group position={[def.x, 0.001, def.z]} rotation={[(Math.PI / 2) * (1 - up), 0, 0]}>
      <mesh geometry={geom} material={paper(def.color)} castShadow receiveShadow />
      {/* опорный треугольник-упор за холмом */}
      <mesh position={[0, 0, -0.03 * up]} rotation={[0, Math.PI / 2, 0]} scale={[up, up, 1]} castShadow>
        <shapeGeometry args={[new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0.06, 0), new THREE.Vector2(0, def.h * 0.7)])]} />
        <primitive object={paper(C.paperShadow)} attach="material" />
      </mesh>
    </group>
  );
};

/**
 * Pop-up «Горы, облака и реки»: на плоской иллюстрации поднимаются три
 * горы (развёртки пирамид, FOLD UP), затем слоями холмы (LAYERED), облака
 * на стойках (LAYERED) и река из бумажных лент. Складывается обратно.
 */
export const PopUpMountains = ({ t, book }: { t: number; book: BookState }) => {
  if (!worldVisible(t, P.rise[0], P.collapse)) return null;
  const c = P.collapse;
  const rise = elementState(t, P.rise, c, 0, 4, ease.linear);
  const hills = elementState(t, P.hills, c, 1, 4, ease.linear);
  const clouds = elementState(t, P.clouds, c, 2, 4, ease.linear);
  const river = elementState(t, P.river, c, 3, 4, ease.inOutSine);
  const tuck = tuckIntoGutter(t, c);
  const gy = book.gutterY;
  const sq = 1 - 0.5 * tuck;
  return (
    <group position={[0, gy + 0.0015, 0]} scale={[sq, 1, sq]}>
      {MOUNTAINS.map((layers, i) => {
        const p = ease.inOutCubic(seq(rise, i, 3, 0.45));
        return layers.map((m, j) => (
          <PaperMountain
            key={`${i}-${j}`}
            base={m.base}
            apex={m.apex}
            color={m.color}
            snow={m.snow}
            fold={ease.inOutCubic(clamp(p * 1.25 - j * 0.25))}
          />
        ));
      })}
      {HILLS.map((h, i) => (
        <Hill key={i} def={h} up={ease.outBack(seq(hills, i, HILLS.length, 0.5), 0.8)} />
      ))}
      {[0, 1, 2].map((l) => (
        <River key={l} layer={l} t={t} grow={clamp(river * 1.15 - l * 0.075)} />
      ))}
      {CLOUDS.map((cl, i) => {
        const p = seq(clouds, i, CLOUDS.length, 0.45);
        // Стойка выдвигается из страницы, облако на ней откидывается вверх,
        // затем слои облака расходятся по глубине.
        const lift = ease.inOutCubic(clamp(p * 1.5));
        const flip = ease.outBack(clamp(p * 1.6 - 0.35), 0.7);
        const spread = ease.outCubic(clamp(p * 1.4 - 0.4));
        const h = (cl.y - cl.h * 0.25) * lift;
        return (
          <group key={i} position={[cl.x, 0, cl.z]}>
            <Strut h={h} w={0.016} />
            <group position={[0, h, 0.006]} rotation={[-(Math.PI / 2) * (1 - flip), 0, Math.sin(t * 0.7 + i) * 0.03 * spread]}>
              <group scale={0.4 + 0.6 * lift}>
                <PaperCloud w={cl.w} h={cl.h} spread={spread} seed={cl.seed} />
              </group>
            </group>
          </group>
        );
      })}
    </group>
  );
};
