// Mirror: «настоящее» зеркало — объёмная металлическая рама с фаской,
// тонкий золотой кант, тёмная стеклянная задняя панель и отражающая поверхность.
import { useMemo } from "react";
import * as THREE from "three";
import { createBackPanelGeometry, createFrameGeometry } from "../geometry/frame";
import { PALETTE } from "../engines/MirrorLightingSystem";
import { MorphState } from "../engines/ReflectionMorphEngine";
import { MirrorSurface, ReflectSource } from "./MirrorSurface";

export type MirrorStyle = { border?: number; radius?: number; depth?: number; metal?: string; accent?: string };

export const Mirror: React.FC<{
  size: [number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  morph: MorphState;
  time: number;
  reflectA: ReflectSource;
  reflectB?: ReflectSource;
  envMap: THREE.Texture | null;
  frameOpacity?: number;
  style?: MirrorStyle;
  priority?: number;
  surfaceRef?: React.RefObject<THREE.Mesh | null>;
  manual?: boolean;
}> = ({ size, position, rotation, scale = 1, morph, time, reflectA, reflectB, envMap, frameOpacity = 1, style, priority, surfaceRef, manual }) => {
  const border = style?.border ?? 0.07;
  const radius = style?.radius ?? 0.12;
  const depth = style?.depth ?? 0.09;
  const geo = useMemo(
    () => ({
      frame: createFrameGeometry(size[0], size[1], border, radius, depth),
      accent: createFrameGeometry(size[0] + 0.004, size[1] + 0.004, 0.012, radius, depth * 0.4),
      back: createBackPanelGeometry(size[0] + border * 1.6, size[1] + border * 1.6, radius + border, depth * 0.6),
    }),
    [size[0], size[1], border, radius, depth],
  );
  const mats = useMemo(
    () => ({
      metal: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(style?.metal ?? PALETTE.silver),
        metalness: 1,
        roughness: 0.26,
        clearcoat: 0.6,
        clearcoatRoughness: 0.18,
        envMapIntensity: 1.3,
        transparent: true,
      }),
      accent: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(style?.accent ?? PALETTE.gold),
        metalness: 1,
        roughness: 0.3,
        envMapIntensity: 1.4,
        transparent: true,
      }),
      back: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(PALETTE.navy),
        metalness: 0.4,
        roughness: 0.22,
        clearcoat: 1,
        envMapIntensity: 0.8,
        transparent: true,
      }),
    }),
    [style?.metal, style?.accent],
  );
  for (const m of Object.values(mats)) {
    m.envMap = envMap;
    m.opacity = frameOpacity;
    m.depthWrite = frameOpacity > 0.98;
  }
  const showFrame = frameOpacity > 0.002;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {showFrame ? (
        <>
          <mesh geometry={geo.frame} material={mats.metal} />
          <mesh geometry={geo.accent} material={mats.accent} position={[0, 0, depth * 0.32]} />
          {/* задняя панель убирается, когда поверхность изгибается/волнуется (иначе перекрыла бы её) */}
          {morph.bend + morph.wave + morph.swell < 0.0005 ? <mesh geometry={geo.back} material={mats.back} position={[0, 0, -depth * 0.15]} /> : null}
        </>
      ) : null}
      <group position={[0, 0, 0.004]}>
        <MirrorSurface
          size={size}
          morph={morph}
          time={time}
          reflectA={reflectA}
          reflectB={reflectB}
          priority={priority}
          surfaceRef={surfaceRef}
          manual={manual}
        />
      </group>
    </group>
  );
};
