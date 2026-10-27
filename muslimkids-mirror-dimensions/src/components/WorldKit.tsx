// Общие элементы миров: слой-группа, световая схема, студийное окружение.
import { useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { LightRig, createStudioEnvironment } from "../engines/MirrorLightingSystem";
import { setLayer } from "../engines/MirrorReflectionEngine";

/** Группа, все потомки которой (включая свет) живут на одном слое. */
export const WorldLayer: React.FC<{ layer: number; children: React.ReactNode; position?: [number, number, number]; rotation?: [number, number, number] | THREE.Euler; scale?: number }> = ({
  layer,
  children,
  ...rest
}) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    if (ref.current) setLayer(ref.current, layer);
  });
  return (
    <group ref={ref} {...rest}>
      {children}
    </group>
  );
};

/** Key / Fill / Rim + мягкий заполняющий свет неба. */
export const LightRigView: React.FC<{ rig: LightRig; scale?: number; intensity?: number }> = ({ rig, scale = 1, intensity = 1 }) => (
  <>
    <directionalLight color={rig.key.color} intensity={rig.key.intensity * intensity} position={rig.key.pos.map((v) => v * scale) as [number, number, number]} />
    <directionalLight color={rig.fill.color} intensity={rig.fill.intensity * intensity} position={rig.fill.pos.map((v) => v * scale) as [number, number, number]} />
    <directionalLight color={rig.rim.color} intensity={rig.rim.intensity * intensity} position={rig.rim.pos.map((v) => v * scale) as [number, number, number]} />
    <hemisphereLight color={rig.ambient.color} groundColor="#05080F" intensity={rig.ambient.intensity * intensity} />
  </>
);

/** Окружение для металла (один раз на холст). */
export const useStudioEnv = (warmth = 1) => {
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => createStudioEnvironment(gl, warmth), [gl, warmth]);
  useEffect(() => () => env.dispose(), [env]);
  return env;
};
