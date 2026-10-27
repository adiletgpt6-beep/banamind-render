// Объёмная Земля: наклон оси 23,4°, вращение вокруг собственной оси,
// неподвижное направление на Солнце — правильная модель смены дня и ночи.
import { useMemo } from "react";
import * as THREE from "three";
import { atmosphereFragment, cloudsFragment, earthFragment, earthVertex } from "../shaders/earth";
import { useTexture } from "../utils/textures";

const AXIAL_TILT = (23.44 * Math.PI) / 180;

export const MirrorEarth: React.FC<{
  position: [number, number, number];
  radius: number;
  /** угол поворота вокруг оси, радианы */
  spin: number;
  sunDir: [number, number, number];
  exposure?: number;
  segments?: number;
}> = ({ position, radius, spin, sunDir, exposure = 1, segments = 96 }) => {
  const day = useTexture("earth_atmos_2048.jpg");
  const night = useTexture("earth_lights_2048.png");
  const spec = useTexture("earth_specular_2048.jpg");
  const normal = useTexture("earth_normal_2048.jpg");
  const clouds = useTexture("earth_clouds_alpha.png");

  const mats = useMemo(() => {
    const earth = new THREE.ShaderMaterial({
      vertexShader: earthVertex,
      clipping: true,
      fragmentShader: earthFragment,
      uniforms: {
        tDay: { value: null },
        tNight: { value: null },
        tSpec: { value: null },
        tNormal: { value: null },
        uSun: { value: new THREE.Vector3(1, 0, 0) },
        uNightLights: { value: 1 },
        uExposure: { value: 1 },
      },
    });
    const cloud = new THREE.ShaderMaterial({
      vertexShader: earthVertex,
      clipping: true,
      fragmentShader: cloudsFragment,
      transparent: true,
      depthWrite: false,
      uniforms: { tClouds: { value: null }, uSun: { value: new THREE.Vector3(1, 0, 0) }, uOpacity: { value: 0.85 } },
    });
    const atmo = new THREE.ShaderMaterial({
      vertexShader: earthVertex,
      clipping: true,
      fragmentShader: atmosphereFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: { uSun: { value: new THREE.Vector3(1, 0, 0) } },
    });
    return { earth, cloud, atmo };
  }, []);

  mats.earth.uniforms.tDay.value = day;
  mats.earth.uniforms.tNight.value = night;
  mats.earth.uniforms.tSpec.value = spec;
  mats.earth.uniforms.tNormal.value = normal;
  mats.earth.uniforms.uExposure.value = exposure;
  mats.cloud.uniforms.tClouds.value = clouds;
  for (const m of [mats.earth, mats.cloud, mats.atmo]) m.uniforms.uSun.value.set(...sunDir);

  return (
    <group position={position} rotation={[0, 0, AXIAL_TILT]}>
      <mesh material={mats.earth} rotation={[0, spin, 0]}>
        <sphereGeometry args={[radius, segments, segments / 2]} />
      </mesh>
      <mesh material={mats.cloud} rotation={[0, spin * 1.08 + 0.3, 0]}>
        <sphereGeometry args={[radius * 1.012, segments, segments / 2]} />
      </mesh>
      <mesh material={mats.atmo} scale={1.06}>
        <sphereGeometry args={[radius, 64, 32]} />
      </mesh>
    </group>
  );
};
