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

// A single merged crown per tree keeps the film inexpensive to render. Three
// seeded variants (clump layout, lopsidedness, height) avoid identical trees.
const crownGeometry = (variant: number, poplar: boolean) => {
  const geometries: THREE.BufferGeometry[] = [];
  const count = poplar ? 22 : 30;
  for (let i = 0; i < count; i++) {
    const angle = i * 2.399963 + variant * 0.9, h = ((i * (3 + variant)) % 9) / 9;
    const spread = poplar ? 0.32 : 0.62 + variant * 0.06;
    const r = spread * Math.sqrt(1 - h * (poplar ? 0.4 : 0.6)) * (0.8 + ((i * 7 + variant) % 5) * 0.06);
    const g = new THREE.SphereGeometry(1, 12, 8);
    const k = poplar ? 0.3 : 0.38 + ((i + variant) % 3) * 0.04;
    g.scale(k, k * (poplar ? 1.5 : 1.12), k);
    const lean = variant === 2 ? 0.18 * h : variant === 1 ? -0.1 * h : 0;
    g.translate(Math.cos(angle) * r + lean, (poplar ? 2.2 : 2.35) + h * (poplar ? 3.6 : 1.6), Math.sin(angle) * r);
    geometries.push(g);
  }
  return mergeGeometries(geometries)!;
};
const LEAF = ["#8DAE73", "#97B97C", "#86A86E"];
export const CityTree: React.FC<{ pos: [number,number,number]; scale?: number; poplar?: boolean; variant?: number; rotY?: number }> = ({pos,scale=1,poplar=false,variant=0,rotY=0}) => {
  const crown = useMemo(() => crownGeometry(variant % 3, poplar),[variant, poplar]);
  return <group position={pos} scale={scale} rotation={[0, rotY, 0]}>
    <mesh position={[0,1.15,0]} castShadow><cylinderGeometry args={[0.065,0.115,2.3,16]} /><meshStandardMaterial color="#8E7259" roughness={0.94} /></mesh>
    {[-1,1].map(s=><mesh key={s} position={[s * 0.18,1.85,0]} rotation={[0,0,s * -0.38]} castShadow><cylinderGeometry args={[0.023,0.044,0.8,10]} /><meshStandardMaterial color="#8E7259" roughness={0.94} /></mesh>)}
    <mesh geometry={crown} castShadow><meshStandardMaterial color={poplar ? "#83A56C" : LEAF[variant % 3]} roughness={0.91} /></mesh>
  </group>;
};
