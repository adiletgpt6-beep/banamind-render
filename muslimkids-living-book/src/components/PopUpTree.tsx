import { useMemo } from "react";
import * as THREE from "three";
import type { BookState } from "../engines/LivingBookEngine";
import { elementState, seq, tuckIntoGutter, worldVisible } from "../engines/PopUpWorldEngine";
import { foldedLeaf, setTriangles } from "../engines/PaperFoldEngine";
import { paper } from "../materials/PaperMaterial";
import { TL } from "../story/timeline";
import { PALETTE as C } from "../styles/palette";
import { clamp, ease, openClose, rng } from "../utils/math";
import { PaperCloud, Strut } from "./PaperParts";

const P = TL.popups.tree;
const TREE_X = 0.1;
const TREE_Z = 0.06;
const TRUNK_H = 0.62;

type Branch = { at: number; az: number; elev: number; len: number };
const BRANCHES: Branch[] = [
  { at: 0.42, az: 0.3, elev: 0.95, len: 0.26 },
  { at: 0.52, az: 2.4, elev: 0.9, len: 0.27 },
  { at: 0.6, az: 4.3, elev: 0.85, len: 0.25 },
  { at: 0.7, az: 1.3, elev: 0.75, len: 0.22 },
  { at: 0.77, az: 3.4, elev: 0.72, len: 0.21 },
  { at: 0.85, az: 5.4, elev: 0.68, len: 0.18 },
];

const LEAF_COLORS = [C.leaf, C.leafLight, C.emeraldLight, C.leafDeep];

/** Направления листьев в кластере (равномерно по полусфере вверх-наружу). */
const leafDirs = (n: number, seed: number) => {
  const r = rng(seed);
  return Array.from({ length: n }, (_, k) => {
    const y = 1 - (k + 0.5) / n;
    const rad = Math.sqrt(1 - y * y);
    const a = k * 2.399963 + r() * 0.4;
    return new THREE.Vector3(Math.cos(a) * rad, y * 0.9 + 0.1, Math.sin(a) * rad).normalize();
  });
};

/** Лист кроны: ромб со сгибом, раскрывающийся по средней жилке. */
const Leaf = ({ dir, open, color, len }: { dir: THREE.Vector3; open: number; color: string; len: number }) => {
  const g = useMemo(() => new THREE.BufferGeometry(), []);
  setTriangles(g, foldedLeaf(len, len * 0.42, ease.outBack(open, 1.0)));
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir), [dir]);
  if (open <= 0.01) return null;
  const s = 0.25 + 0.75 * clamp(open * 1.4);
  return <mesh geometry={g} material={paper(color, { flat: true })} quaternion={q} scale={s} castShadow />;
};

/** Кластер кроны (PAPER BLOOM): гранёное ядро + листья по очереди. */
const Cluster = ({ bloom, size, seed }: { bloom: number; size: number; seed: number }) => {
  const dirs = useMemo(() => leafDirs(9, seed), [seed]);
  const core = useMemo(() => new THREE.IcosahedronGeometry(size, 0), [size]);
  const core2 = useMemo(() => new THREE.IcosahedronGeometry(size * 0.8, 0), [size]);
  if (bloom <= 0.001) return null;
  const s = ease.outBack(clamp(bloom * 1.6), 1.1);
  return (
    <group>
      <mesh geometry={core} material={paper(C.leafDeep, { flat: true })} scale={s} rotation={[seed, seed * 2, 0]} castShadow receiveShadow />
      <mesh
        geometry={core2}
        material={paper(C.leaf, { flat: true })}
        scale={s}
        position={[size * 0.25, size * 0.35, size * 0.2]}
        rotation={[seed * 3, seed, 1]}
        castShadow
      />
      {dirs.map((d, k) => (
        <group key={k} position={d.clone().multiplyScalar(size * 0.75 * s)}>
          <Leaf dir={d} open={seq(bloom, k, dirs.length, 0.55)} color={LEAF_COLORS[(k + seed) % 4]} len={size * 0.95} />
        </group>
      ))}
    </group>
  );
};

/** Капля дождя: маленькая бумажная капелька. */
const dropGeom = () =>
  new THREE.LatheGeometry(
    [
      new THREE.Vector2(0, -1),
      new THREE.Vector2(0.55, -0.65),
      new THREE.Vector2(0.6, -0.2),
      new THREE.Vector2(0.32, 0.45),
      new THREE.Vector2(0, 1.1),
    ].map((v) => v.multiplyScalar(0.018)),
    7,
  );

const RAIN = Array.from({ length: 14 }, (_, i) => {
  const r = rng(100 + i);
  return {
    t0: i / 14,
    x0: (r() - 0.5) * 0.32,
    z0: -0.24 + r() * 0.06,
    x1: (r() - 0.5) * 0.14,
    z1: TREE_Z - 0.03 + r() * 0.06,
  };
});

/**
 * Pop-up «Семечко → дерево»: основание-холмик из слоёв бумаги, семечко,
 * облако на стойке с дождём, росток (стебель + два листочка), рост
 * ствола, ветви выходят из сгибов, листья кроны раскрываются по одному.
 */
export const PopUpTree = ({ t, book }: { t: number; book: BookState }) => {
  const drop = useMemo(dropGeom, []);
  const trunkG = useMemo(() => new THREE.CylinderGeometry(0.03, 0.052, 1, 6, 3).translate(0, 0.5, 0), []);
  const branchG = useMemo(() => new THREE.CylinderGeometry(0.009, 0.02, 1, 5, 1).translate(0, 0.5, 0), []);
  const seedHalf = useMemo(() => new THREE.SphereGeometry(1, 10, 7, 0, Math.PI), []);
  const cotyledon = useMemo(() => new THREE.BufferGeometry(), []);
  if (!worldVisible(t, P.seed[0] - 1.3, P.collapse)) return null;
  const c = P.collapse;
  const seedP = elementState(t, P.seed, c, 0, 4, (x) => ease.outBack(x, 1.2));
  const sprout = elementState(t, P.sprout, c, 1, 4);
  const grow = elementState(t, P.grow, c, 2, 4, ease.linear);
  const cloud = openClose(t, P.cloud, [28.95, 29.8]);
  const tuck = tuckIntoGutter(t, c);
  const y0 = book.surfaceY(TREE_X) + 0.0015;

  const g = ease.inOutSine(grow);
  const stemH = 0.12 * ease.outCubic(sprout);
  const trunkH = stemH + (TRUNK_H - 0.12) * g;
  const trunkR = 0.2 + 0.8 * g;
  const coty = clamp(sprout * 1.6 - 0.5) * (1 - clamp(g * 3));
  setTriangles(cotyledon, foldedLeaf(0.075, 0.034, ease.outBack(coty, 1.2)));
  const sq = 1 - 0.5 * tuck;
  return (
    <group position={[TREE_X, y0, TREE_Z]} scale={[sq, 1, sq]}>
      {/* основание: слои бумаги-земли (LAYERED) */}
      {[0.2, 0.15, 0.1].map((r, i) => (
        <mesh
          key={i}
          position={[0, 0.004 + i * 0.008 * seedP, 0]}
          scale={[r * (0.6 + 0.4 * seedP), 1, r * 0.8 * (0.6 + 0.4 * seedP)]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[1, 1, 0.008, 12]} />
          <primitive object={paper([C.brown, "#9a7356", C.leafDeep][i], { flat: true })} attach="material" />
        </mesh>
      ))}
      {/* семечко: две половинки оболочки раскрываются при прорастании */}
      <group position={[0, 0.03, 0]} scale={[0.048, 0.03 * (0.08 + 0.92 * seedP), 0.03]} rotation={[0, 0.5, 0]}>
        {[1, -1].map((sgn) => (
          <mesh
            key={sgn}
            geometry={seedHalf}
            rotation={[sgn > 0 ? 0 : Math.PI, 0, sgn * 1.1 * clamp(sprout * 2) * (1 - clamp(g * 2))]}
            material={paper("#8a5a35", { flat: true })}
            castShadow
          />
        ))}
      </group>
      {/* ствол (росток превращается в ствол) */}
      {trunkH > 0.002 ? (
        <mesh
          geometry={trunkG}
          material={paper(g > 0.15 ? C.brown : C.leaf, { flat: true })}
          position={[0, 0.03, 0]}
          scale={[trunkR, trunkH, trunkR]}
          castShadow
          receiveShadow
        />
      ) : null}
      {/* два первых листочка */}
      {coty > 0.01
        ? [1, -1].map((sgn) => (
            <mesh
              key={sgn}
              geometry={cotyledon}
              material={paper(C.leafLight, { flat: true })}
              position={[0, 0.03 + trunkH, 0]}
              rotation={[0, sgn > 0 ? 0.4 : 0.4 + Math.PI, sgn * -1.05]}
              castShadow
            />
          ))
        : null}
      {/* ветви поднимаются из сгибов и несут кластеры кроны */}
      {BRANCHES.map((b, i) => {
        const bp = clamp((g - b.at * 0.7) / 0.28);
        if (bp <= 0) return null;
        const bloom = clamp((g - b.at * 0.7 - 0.12) / 0.35);
        const len = b.len * (0.3 + 0.7 * ease.outCubic(bp));
        const elev = b.elev * ease.outBack(bp, 0.9);
        return (
          <group key={i} position={[0, 0.03 + b.at * trunkH, 0]} rotation={[0, b.az, 0]}>
            <group rotation={[0, 0, -elev]}>
              <mesh geometry={branchG} material={paper(C.brown, { flat: true })} scale={[1, len, 1]} castShadow />
              <group position={[0, len, 0]}>
                <Cluster bloom={bloom} size={0.085 + 0.012 * (i % 3)} seed={i + 1} />
              </group>
            </group>
          </group>
        );
      })}
      <group position={[0, 0.03 + trunkH, 0]}>
        <Cluster bloom={clamp((g - 0.62) / 0.38)} size={0.12} seed={9} />
      </group>
      {/* облако на стойке и дождь */}
      {cloud > 0.001 ? (
        <group position={[-0.02, 0, -0.32]}>
          <Strut h={0.6 * ease.inOutCubic(cloud)} w={0.016} />
          <group position={[0, 0.6 * ease.inOutCubic(cloud), 0.008]} rotation={[-(Math.PI / 2) * (1 - ease.outBack(cloud, 0.6)), 0, 0]}>
            <group scale={0.45 + 0.55 * cloud}>
              <PaperCloud w={0.44} h={0.14} spread={cloud} seed={1} />
            </group>
          </group>
        </group>
      ) : null}
      {RAIN.map((d, i) => {
        const span = P.rain[1] - P.rain[0] - 0.55;
        const s0 = P.rain[0] + d.t0 * span;
        const f = clamp((t - s0) / 0.55);
        if (f <= 0 || f >= 1) return null;
        const fy = f * f;
        // от нижнего края облака к основанию дерева (ускорение — f²)
        const x = d.x0 - 0.02 + (d.x1 + 0.02 - d.x0) * f;
        const z = d.z0 - 0.06 + (d.z1 - TREE_Z - d.z0 + 0.06) * f;
        const y = 0.56 - (0.56 - 0.04) * fy;
        const sc = f > 0.85 ? 1 - (f - 0.85) / 0.15 : 1;
        return (
          <mesh
            key={i}
            geometry={drop}
            material={paper(C.riverLight, { flat: true, roughness: 0.5 })}
            position={[x, y, z]}
            scale={sc}
            castShadow
          />
        );
      })}
    </group>
  );
};
