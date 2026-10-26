// Земля: гладкая сфера с картой материков, облака, атмосфера (шейдер
// Френеля), грани исходного узора (те же треугольники) и тонкая сетка их
// рёбер — связь с узором, из которого появилась планета.
import { useMemo } from "react";
import * as THREE from "three";
import { earthGeometry, getEarth } from "../systems/earthTexture";
import { EARTH, facetGeometry } from "./RosetteSphere";

const atmosphereShader = {
  uniforms: { color: { value: new THREE.Color("#7fc6ee") }, strength: { value: 1 } },
  vertexShader: /* glsl */ `
    varying vec3 vN; varying vec3 vV;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vN = normalize(normalMatrix * normal);
      vV = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 color; uniform float strength;
    varying vec3 vN; varying vec3 vV;
    void main() {
      float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.6);
      gl_FragColor = vec4(color, f * 0.85 * strength);
    }`,
};

export type EarthLook = {
  smooth: number; // 0…1 гладкая карта
  facets: number; // 0…1 грани узора
  edges: number; // 0…1 сетка рёбер узора
  clouds: number;
  atmosphere: number;
  spin: number; // градусы вращения вокруг оси (на восток)
  tilt?: number; // наклон оси к зрителю, градусы
};

export const GeometryEarth: React.FC<{ look: EarthLook; position?: [number, number, number]; scale?: number }> = ({
  look,
  position = [0, 0, 0],
  scale = 1,
}) => {
  const R = EARTH.radius;
  const earth = getEarth();
  const sphere = useMemo(() => earthGeometry(R * 1.002, 160), [R]);
  const cloudGeo = useMemo(() => earthGeometry(R * 1.016, 96), [R]);
  const atmoGeo = useMemo(() => new THREE.SphereGeometry(R * 1.06, 96, 64), [R]);
  const { faces, edges } = useMemo(() => facetGeometry(R * 0.999), [R]);
  const atmoMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...atmosphereShader,
        uniforms: THREE.UniformsUtils.clone(atmosphereShader.uniforms),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  atmoMat.uniforms.strength.value = look.atmosphere;
  const D = Math.PI / 180;
  return (
    <group position={position} scale={scale}>
      <mesh geometry={atmoGeo} material={atmoMat} visible={look.atmosphere > 0.01} renderOrder={5} />
      <group rotation={[(look.tilt ?? EARTH.lat0) * D, 0, 0]}>
        <group rotation={[0, (-EARTH.lon0 + look.spin) * D, 0]}>
          <mesh geometry={faces} visible={look.facets > 0.001} renderOrder={1}>
            <meshStandardMaterial
              vertexColors
              flatShading
              roughness={0.55}
              metalness={0.08}
              side={THREE.DoubleSide}
              transparent={look.facets < 1}
              opacity={look.facets}
            />
          </mesh>
          <mesh geometry={sphere} visible={look.smooth > 0.001} renderOrder={2}>
            <meshStandardMaterial map={earth.texture} roughness={0.78} metalness={0.02} transparent={look.smooth < 1} opacity={look.smooth} />
          </mesh>
          <mesh geometry={cloudGeo} visible={look.clouds > 0.001} renderOrder={3}>
            <meshStandardMaterial map={earth.clouds} transparent opacity={look.clouds * 0.8} depthWrite={false} roughness={1} />
          </mesh>
          <lineSegments geometry={edges} visible={look.edges > 0.001} renderOrder={4}>
            <lineBasicMaterial color="#E8BB65" transparent opacity={look.edges} depthWrite={false} />
          </lineSegments>
        </group>
      </group>
    </group>
  );
};
