import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Continuous ridges replace isolated geometric cones. Vertex colours blend
// blue atmospheric haze, rock and an irregular snow line over actual relief.
export const AlaToo: React.FC<{ evening?: number }> = ({ evening = 0 }) => {
  const geometry = useMemo(() => {
    const positions: number[] = [], colors: number[] = [], indices: number[] = [];
    const nx = 128, nz = 8;
    const rock = new THREE.Color(evening ? "#9A91A8" : "#AFC3D5");
    const snow = new THREE.Color(evening ? "#F4D8CB" : "#F6F5EF");
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const x = -430 + i / nx * 860, depth = j / nz;
      const peaks = 19 + Math.sin(x * 0.033) * 6 + Math.sin(x * 0.071 + 1.8) * 4 + Math.cos(x * 0.122) * 2.0;
      const y = -13 + Math.sin(depth * Math.PI) ** 0.78 * peaks;
      positions.push(x, y, 215 + depth * 47);
      const line = 2.5 + Math.sin(x * 0.11 + 0.3) * 2.0 + Math.cos(x * 0.047) * 1.3;
      const whiteness = THREE.MathUtils.smoothstep(y, line, line + 2.0);
      const c = rock.clone().lerp(snow, whiteness); colors.push(c.r,c.g,c.b);
    }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i, b = a + nx + 1;
      indices.push(a,b,a+1,a+1,b,b+1);
    }
    const g = new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
    g.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
  },[evening]);
  return <mesh geometry={geometry}><meshStandardMaterial vertexColors roughness={1} side={THREE.DoubleSide} /></mesh>;
};

// A single merged crown per tree keeps the film inexpensive to render.
const crownGeometry = () => {
  const geometries: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 26; i++) {
    const angle = i * 2.399963, h = (i % 7) / 7;
    const r = 0.55 * Math.sqrt(1 - h * 0.65);
    const g = new THREE.SphereGeometry(1,12,8);
    g.scale(0.36 + (i % 3) * 0.035,0.43 + (i % 4) * 0.025,0.36);
    g.translate(Math.cos(angle) * r, 2.30 + h * 1.5,Math.sin(angle) * r);
    geometries.push(g);
  }
  return mergeGeometries(geometries)!;
};
export const CityTree: React.FC<{ pos: [number,number,number]; scale?: number; poplar?: boolean }> = ({pos,scale=1,poplar=false}) => {
  const crown = useMemo(crownGeometry,[]);
  return <group position={pos} scale={scale}>
    <mesh position={[0,1.15,0]} castShadow><cylinderGeometry args={[0.065,0.115,2.3,16]} /><meshStandardMaterial color="#987A5F" roughness={0.94} /></mesh>
    {[-1,1].map(s=><mesh key={s} position={[s * 0.18,1.85,0]} rotation={[0,0,s * -0.38]} castShadow><cylinderGeometry args={[0.023,0.044,0.8,10]} /><meshStandardMaterial color="#987A5F" roughness={0.94} /></mesh>)}
    <mesh geometry={crown} scale={poplar ? [0.70,1.20,0.70] : [1,1,1]} castShadow><meshStandardMaterial color={poplar ? "#90AF76" : "#94B97B"} roughness={0.91} /></mesh>
  </group>;
};
