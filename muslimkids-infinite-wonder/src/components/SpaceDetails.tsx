// Капля краски, космический фон и наглядная ось вращения Земли.
import { useMemo } from "react";
import { BackSide, Color, Quaternion, Vector3 } from "three";
import { shader } from "../materials";
import { dirVertex, spaceFragment } from "../shaders/nature";
import { PALETTE, SPACE_SUN } from "../engines/LightingSystem";
import { EARTH_TILT } from "../engines/InfiniteJourneyEngine";
import type { DirectorState } from "../engines/InfiniteWonderDirector";

/** Капля синей краски падает на бумагу и растекается. */
export const PaintDrop: React.FC<{ st: DirectorState }> = ({ st }) => {
  const p = st.paint;
  if (p.dropVisible <= 0.001) return null;
  const r = 0.042;
  const sx = 1 + p.splash * 1.8;
  const sz = 1 - p.splash * 0.92;
  return (
    <mesh position={[0, 0, p.dropZ + r * sz]} scale={[sx, sx, sz]}>
      <sphereGeometry args={[r, 48, 32]} />
      <meshPhysicalMaterial
        color={PALETTE.sapphire}
        roughness={0.06}
        clearcoat={1}
        clearcoatRoughness={0.05}
        transparent
        opacity={p.dropVisible}
      />
    </mesh>
  );
};

export const SpaceBackdrop: React.FC<{ st: DirectorState }> = ({ st }) => {
  const mat = useMemo(
    () =>
      shader({
        vertexShader: dirVertex,
        fragmentShader: spaceFragment,
        side: BackSide,
        depthWrite: false,
        uniforms: { uSun: { value: SPACE_SUN.clone() } },
      }),
    [],
  );
  if (st.paint.paperFade <= 0.001) return null;
  return (
    <mesh material={mat} renderOrder={-10}>
      <sphereGeometry args={[400, 64, 32]} />
    </mesh>
  );
};

/** Ось вращения и стрелка направления: день и ночь — от вращения Земли. */
export const DayNightGuide: React.FC<{ st: DirectorState }> = ({ st }) => {
  const k = st.labels.axis;
  const tilt = useMemo(() => new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), EARTH_TILT), []);
  if (k <= 0.001) return null;
  const gold = new Color(PALETTE.gold);
  // Дуга-стрелка у северного полюса по направлению вращения.
  const arc = Math.PI * 1.35 * Math.min(1, k * 1.3);
  return (
    <group position={[0, 0, st.earth.lift]} quaternion={tilt}>
      <mesh>
        <cylinderGeometry args={[0.008, 0.008, 2.9, 12]} />
        <meshBasicMaterial color={gold} transparent opacity={0.85 * k} depthWrite={false} />
      </mesh>
      <group position={[0, 1.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh rotation={[0, 0, -0.4]}>
          <torusGeometry args={[0.3, 0.012, 12, 64, arc]} />
          <meshBasicMaterial color={gold} transparent opacity={0.95 * k} depthWrite={false} />
        </mesh>
        <mesh position={[0.3 * Math.cos(arc - 0.4), 0.3 * Math.sin(arc - 0.4), 0]} rotation={[0, 0, arc - 0.4]}>
          <coneGeometry args={[0.035, 0.08, 16]} />
          <meshBasicMaterial color={gold} transparent opacity={0.95 * k} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};
