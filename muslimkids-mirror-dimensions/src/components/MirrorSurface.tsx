// Отражающая поверхность: планарное отражение (MirrorReflectionEngine) +
// морф-шейдер (ReflectionMorphEngine). Может одновременно держать два
// отражения (A и B — разные наборы слоёв) и смешивать их.
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PlanarReflection } from "../engines/MirrorReflectionEngine";
import { MorphState, applyMorph, createMirrorSurfaceMaterial } from "../engines/ReflectionMorphEngine";
import { allSurfaces, registerSurface } from "../engines/mirrorRegistry";
import { useTexture } from "../utils/textures";

export type ReflectSource = { layers: number[]; resolution?: number; clearColor?: string };

export const MirrorSurface: React.FC<{
  size: [number, number];
  morph: MorphState;
  time: number;
  reflectA: ReflectSource;
  reflectB?: ReflectSource;
  segments?: [number, number];
  /** порядок прохода (меньше — раньше) */
  priority?: number;
  extraHide?: React.RefObject<THREE.Object3D | null>[];
  layer?: number;
  /** внешний контроль отражений (InfiniteReflectionEngine) */
  manual?: boolean;
  surfaceRef?: React.RefObject<THREE.Mesh | null>;
}> = ({ size, morph, time, reflectA, reflectB, segments = [96, 128], priority = -1, extraHide, layer = 0, manual, surfaceRef }) => {
  const own = useRef<THREE.Mesh>(null);
  const ref = surfaceRef ?? own;
  const waterNormal = useTexture("waternormals.jpg");
  const { scene, camera, gl, size: view } = useThree();
  const material = useMemo(() => createMirrorSurfaceMaterial(new THREE.Texture(), size), [size[0], size[1]]);
  material.uniforms.tWaterNormal.value = waterNormal;
  applyMorph(material, morph, time);

  const aspect = view.width / view.height;
  const resA = reflectA.resolution ?? 1280;
  const resB = reflectB?.resolution ?? 1024;
  const reflA = useMemo(() => new PlanarReflection(Math.round(resA * aspect), resA), [resA, aspect]);
  const reflB = useMemo(() => new PlanarReflection(Math.round(resB * aspect), resB), [resB, aspect]);
  useEffect(() => () => { reflA.dispose(); reflB.dispose(); }, [reflA, reflB]);
  useEffect(() => {
    if (!ref.current) return;
    const off = registerSurface(scene, ref.current);
    return () => {
      off();
    };
  }, [scene, ref]);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh || manual || !mesh.visible || morph.opacity <= 0.001) return;
    let o: THREE.Object3D | null = mesh;
    while (o) { if (!o.visible) return; o = o.parent; }
    const hide = [mesh, ...allSurfaces(scene), ...(extraHide ?? []).map((r) => r.current).filter(Boolean)] as THREE.Object3D[];
    if (morph.blend < 0.999) {
      reflA.render(gl, scene, mesh, camera, { layers: reflectA.layers, hide, clearColor: reflectA.clearColor });
      material.uniforms.tReflA.value = reflA.rt.texture;
      material.uniforms.uTexMatA.value.copy(reflA.textureMatrix);
    }
    if (reflectB && morph.blend > 0.001) {
      reflB.render(gl, scene, mesh, camera, { layers: reflectB.layers, hide, clearColor: reflectB.clearColor });
      material.uniforms.tReflB.value = reflB.rt.texture;
      material.uniforms.uTexMatB.value.copy(reflB.textureMatrix);
    }
  }, priority);

  useEffect(() => {
    ref.current?.layers.set(layer);
  }, [layer, ref]);

  return (
    <mesh ref={ref} material={material} renderOrder={2}>
      <planeGeometry args={[size[0], size[1], segments[0], segments[1]]} />
    </mesh>
  );
};
