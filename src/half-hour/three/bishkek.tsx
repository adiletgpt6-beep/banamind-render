import { useMemo } from "react";
import * as THREE from "three";
import { fontFamily } from "../../fonts";
import { Box } from "./sets";
import { CityTree } from "./landscape";

// Small everyday details, rather than tourist landmarks: a shaded yard,
// irrigation channel, a bus stop and a modest textile pattern at home.
const useDetailTexture = (kind: "stop" | "textile" | "school") => useMemo(() => {
  const c = document.createElement("canvas"); c.width = 768; c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = kind === "textile" ? "#F4EDE1" : "#F5F3EB";
  g.fillRect(0, 0, c.width, c.height);
  if (kind === "textile") {
    g.strokeStyle = "#AA6450"; g.lineWidth = 6;
    for (let x = 32; x < 768; x += 64) {
      g.save(); g.translate(x, 128);
      for (const s of [-1, 1]) {
        g.beginPath(); g.moveTo(0, 56); g.bezierCurveTo(s * 10, 20, s * 38, 30, s * 24, 0);
        g.bezierCurveTo(s * 6, -32, -s * 5, -5, s * 14, 1); g.stroke();
      }
      g.restore();
    }
    g.fillStyle = "#D6B098"; g.fillRect(0, 22, 768, 5); g.fillRect(0, 228, 768, 5);
  } else {
    g.fillStyle = "#243F4A"; g.font = `700 72px ${fontFamily}`;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(kind === "stop" ? "Бишкек" : "Билим — келечек", 384, 116);
    g.fillStyle = "#B9CBAE"; g.fillRect(54, 198, 660, 8);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4; return t;
}, [kind]);

export const Aryk: React.FC<{ x: number; z?: number; length?: number }> = ({ x, z = 0, length = 70 }) => (
  <group position={[x, 0, z]}>
    <Box size={[0.44, 0.015, length]} pos={[0, -0.035, 0]} color="#57727A" radius={0} cast={false} />
    {[-1, 1].map((s) => <Box key={s} size={[0.075, 0.11, length]} pos={[s * 0.245, 0.015, 0]} color="#C4C1B5" radius={0.008} cast={false} />)}
  </group>
);

export const Poplar: React.FC<{ pos: [number, number, number] }> = ({ pos }) => <CityTree pos={pos} poplar />;

export const CourtyardDetails: React.FC = () => {
  const sign = useDetailTexture("school");
  return <>
    <Aryk x={-4.5} z={4.5} length={9} />
    <Poplar pos={[-3.6, 0, 3.0]} /><Poplar pos={[4.3, 0, 3.1]} />
    <Box size={[0.7, 0.035, 0.7]} pos={[-4.5, 0.095, 4.2]} color="#C8C4B8" radius={0.015} />
    <mesh position={[-2.8, 1.75, 0.025]}><planeGeometry args={[2.5, 0.83]} /><meshStandardMaterial map={sign} roughness={0.95} /></mesh>
    {[-1, 1].map((s) => <group key={s} position={[s * 2.0, 0, 1.15]}>
      <Box size={[0.85, 0.24, 0.45]} pos={[0, 0.12, 0]} color="#BCAB91" radius={0.035} />
      {[0, 1, 2, 3, 4].map((k) => <mesh key={k} position={[-0.3 + k * 0.15, 0.29, Math.sin(k) * 0.1]}><sphereGeometry args={[0.1, 10, 8]} /><meshStandardMaterial color={k % 2 ? "#8DAD76" : "#9AB885"} roughness={1} /></mesh>)}
    </group>)}
  </>;
};

export const BishkekStop: React.FC = () => {
  const sign = useDetailTexture("stop");
  return <group position={[-10.7, 0.08, 26]} rotation={[0, Math.PI / 2, 0]}>
    <Box size={[3.2, 0.12, 1.35]} pos={[0, 2.3, 0]} color="#49676A" radius={0.035} />
    {[-1.5, 1.5].map((x) => <Box key={x} size={[0.07, 2.3, 0.07]} pos={[x, 1.15, -0.55]} color="#49676A" radius={0.01} />)}
    <Box size={[2.5, 0.08, 0.38]} pos={[0, 0.48, -0.25]} color="#B3916E" radius={0.025} />
    <mesh position={[0, 1.65, -0.55]}><planeGeometry args={[2.7, 0.9]} /><meshStandardMaterial map={sign} side={THREE.DoubleSide} roughness={0.9} /></mesh>
  </group>;
};

export const TableRunner: React.FC = () => {
  const texture = useDetailTexture("textile");
  return <mesh position={[0.2, 0.763, 0.21]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[1.35, 0.21]} /><meshStandardMaterial map={texture} roughness={1} />
  </mesh>;
};

export const Piala: React.FC<{ x: number }> = ({ x }) => {
  const shape = useMemo(() => new THREE.LatheGeometry([
    new THREE.Vector2(0, 0), new THREE.Vector2(0.026, 0), new THREE.Vector2(0.041, 0.028),
    new THREE.Vector2(0.047, 0.042), new THREE.Vector2(0.043, 0.044),
    new THREE.Vector2(0.036, 0.029), new THREE.Vector2(0.021, 0.008), new THREE.Vector2(0, 0.008),
  ], 24), []);
  return <group position={[x, 0.766, -0.22]}>
    <mesh geometry={shape} castShadow><meshStandardMaterial color="#FCF8F0" roughness={0.4} /></mesh>
    <mesh position={[0, 0.031, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.037, 24]} /><meshStandardMaterial color="#A16938" roughness={0.3} /></mesh>
    <mesh position={[0, 0.039, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.044, 0.002, 6, 24]} /><meshStandardMaterial color="#54778B" roughness={0.4} /></mesh>
  </group>;
};

