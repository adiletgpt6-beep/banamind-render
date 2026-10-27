// Горный мир: рельеф (ближняя детальная + дальняя сетка), река, небо,
// солнце, рассеянный свет неба и воздушная перспектива (туман).
import { useMemo } from "react";
import { BackSide, DoubleSide, FogExp2, MeshStandardMaterial, Vector3 } from "three";
import { useThree } from "@react-three/fiber";
import { shader } from "../materials";
import { buildRiver, buildTerrain, TREE_SPOT } from "../geometry/terrain";
import { dirVertex, skyFragment, waterFragment, waterVertex } from "../shaders/nature";
import { NATURE_LIGHT, NATURE_SUN } from "../engines/LightingSystem";
import { posePosition } from "../engines/CameraTransitionEngine";
import type { DirectorState } from "../engines/InfiniteWonderDirector";

const NEAR_HALF = 900;

export const MountainWorld: React.FC<{ st: DirectorState }> = ({ st }) => {
  const scene = useThree((s) => s.scene);
  const data = useMemo(() => {
    const near = buildTerrain(NEAR_HALF * 2, 300, TREE_SPOT.x, TREE_SPOT.z);
    const far = buildTerrain(14000, 260, TREE_SPOT.x, TREE_SPOT.z, NEAR_HALF - 40);
    const ground = new MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0 });
    const river = buildRiver(TREE_SPOT.x - 3000, TREE_SPOT.x + 3000, 900);
    const water = shader({
      vertexShader: waterVertex,
      fragmentShader: waterFragment,
      fog: true,
      side: DoubleSide,
      uniforms: { uSun: { value: NATURE_SUN.clone() }, uTime: { value: 0 } },
    });
    const sky = shader({
      vertexShader: dirVertex,
      fragmentShader: skyFragment,
      side: BackSide,
      depthTest: false,
      depthWrite: false,
      uniforms: { uSun: { value: NATURE_SUN.clone() } },
    });
    const fog = new FogExp2(NATURE_LIGHT.fogColor.getHex(), NATURE_LIGHT.fogDensity);
    return { near, far, ground, river, water, sky, fog };
  }, []);

  scene.fog = data.fog;
  data.water.uniforms.uTime.value = st.t;
  const cam = posePosition(st.pose);
  const skyR = Math.max(10, st.pose.dist * 2e4);
  const sunPos = new Vector3().copy(NATURE_SUN).multiplyScalar(100);
  return (
    <>
      <mesh material={data.sky} position={cam} scale={skyR} renderOrder={-100} frustumCulled={false}>
        <sphereGeometry args={[1, 48, 24]} />
      </mesh>
      <directionalLight position={sunPos} intensity={NATURE_LIGHT.sunIntensity} color={NATURE_LIGHT.sunColor} />
      <hemisphereLight args={[NATURE_LIGHT.skyColor, NATURE_LIGHT.groundColor, NATURE_LIGHT.hemiIntensity]} />
      <mesh geometry={data.near} material={data.ground} />
      <mesh geometry={data.far} material={data.ground} />
      <mesh geometry={data.river} material={data.water} />
    </>
  );
};
