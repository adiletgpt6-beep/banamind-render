// Горная долина — переиспользуемый мир. Основной вид (сцены 3–4, финал) и
// уменьшенная «гостевая» копия, которую отражают зеркала (сцены 1–3, 5).
import * as THREE from "three";
import { GrowingTree } from "../components/GrowingTree";
import { MirrorMountains, TerrainLight } from "../components/MirrorMountains";
import { ReflectiveLake } from "../components/ReflectiveLake";
import { SkyDome, SkyState } from "../components/SkyDome";
import { SPROUT_SPOT, TREE_SPOT, heightAt } from "../geometry/terrain";
import { MorphState } from "../engines/ReflectionMorphEngine";

export const TREE_POS: [number, number, number] = [TREE_SPOT.x, heightAt(TREE_SPOT.x, TREE_SPOT.z) - 0.15, TREE_SPOT.z];
export const SPROUT_POS: [number, number, number] = [SPROUT_SPOT.x, heightAt(SPROUT_SPOT.x, SPROUT_SPOT.z) - 0.05, SPROUT_SPOT.z];

export type ValleyProps = {
  time: number;
  light: TerrainLight;
  sky: SkyState;
  worldScale?: number;
  /** основной вид — настоящее отражающее озеро; гость — простая водная гладь */
  lake?: "reflective" | "flat" | "none";
  lakeMorph?: Partial<MorphState>;
  lakeLayers?: number[];
  treeGrowth?: number;
  sproutGrowth?: number;
  leafTint?: number;
  children?: React.ReactNode;
};

const flatWater = new THREE.MeshBasicMaterial({ color: new THREE.Color("#3F6E96") });

export const ValleyWorld: React.FC<ValleyProps> = ({
  time,
  light,
  sky,
  worldScale = 1,
  lake = "reflective",
  lakeMorph,
  lakeLayers,
  treeGrowth = 1,
  sproutGrowth = 0,
  leafTint = 1,
  children,
}) => {
  const sunCol = new THREE.Color(light.sunColor);
  return (
    <group scale={worldScale}>
      <SkyDome radius={720} state={sky} time={time} />
      <MirrorMountains light={light} worldScale={worldScale} />
      {lake === "reflective" ? <ReflectiveLake time={time} morph={lakeMorph} layers={lakeLayers} /> : null}
      {lake === "flat" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} material={flatWater}>
          <planeGeometry args={[900, 900]} />
        </mesh>
      ) : null}
      <GrowingTree seed={21} growth={treeGrowth} position={TREE_POS} time={time} trunk={3.4} leafTint={leafTint} />
      {sproutGrowth > 0 ? <GrowingTree seed={5} growth={sproutGrowth} position={SPROUT_POS} time={time} trunk={1.7} leafTint={leafTint} /> : null}
      <directionalLight color={sunCol} intensity={2.4 * light.exposure} position={light.sunDir.map((v) => v * 100) as [number, number, number]} />
      <hemisphereLight color={light.sky} groundColor={light.ground} intensity={1.1} />
      {children}
    </group>
  );
};
