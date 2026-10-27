// Мягкий световой луч между отражающими поверхностями (аддитивный, без вспышек).
import { useMemo } from "react";
import * as THREE from "three";

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const frag = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uTime;
uniform float uPhase;
varying vec2 vUv;
void main() {
  float a = (vUv.y - 0.5) / 0.16;
  float across = exp(-a * a);
  float ends = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
  float f = fract(vUv.x * 0.6 - uTime * 0.12 + uPhase) - 0.5;
  float travel = 0.65 + 0.35 * exp(-f * f / 0.02);
  gl_FragColor = vec4(uColor * across * ends * travel * uIntensity, 1.0);
}
`;

export const LightBeam: React.FC<{ from: THREE.Vector3; to: THREE.Vector3; width?: number; color: string; intensity: number; time: number; phase?: number }> = ({
  from,
  to,
  width = 0.16,
  color,
  intensity,
  time,
  phase = 0,
}) => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uColor: { value: new THREE.Color() }, uIntensity: { value: 0 }, uTime: { value: 0 }, uPhase: { value: 0 } },
      }),
    [],
  );
  material.uniforms.uColor.value.set(color);
  material.uniforms.uIntensity.value = intensity;
  material.uniforms.uTime.value = time;
  material.uniforms.uPhase.value = phase;
  if (intensity <= 0.001) return null;
  const mid = from.clone().add(to).multiplyScalar(0.5);
  const dir = to.clone().sub(from);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir.normalize());
  return (
    <mesh position={mid} quaternion={q} material={material} renderOrder={5}>
      <planeGeometry args={[len, width]} />
    </mesh>
  );
};
