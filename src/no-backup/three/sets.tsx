import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Декорации (метры, пол y = 0). Общие элементы: вид Бишкека за окном
// (горы Ала-Тоо со снегом, многоэтажки), офисная мебель.

const rnd = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const Box: React.FC<{
  size: [number, number, number];
  pos: [number, number, number];
  color: string;
  rough?: number;
  metal?: number;
  radius?: number;
  rot?: [number, number, number];
  emissive?: string;
  emissiveIntensity?: number;
  cast?: boolean;
}> = ({ size, pos, color, rough = 0.8, metal = 0, radius = 0.01, rot, emissive, emissiveIntensity, cast = true }) => {
  const geo = useMemo(
    () => (radius > 0 ? new RoundedBoxGeometry(size[0], size[1], size[2], 3, Math.min(radius, Math.min(...size) / 2.01)) : new THREE.BoxGeometry(...size)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size[0], size[1], size[2], radius],
  );
  return (
    <mesh geometry={geo} position={pos} rotation={rot} castShadow={cast} receiveShadow>
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} emissive={emissive ?? "#000000"} emissiveIntensity={emissiveIntensity ?? 0} />
    </mesh>
  );
};

// Вид из окна: небо, Ала-Тоо со снежными вершинами, город.
export const BishkekView: React.FC<{ z: number; evening?: number; rotY?: number }> = ({ z, evening = 0, rotY = 0 }) => {
  const sky = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 8;
    c.height = 256;
    const g = c.getContext("2d")!;
    const gr = g.createLinearGradient(0, 0, 0, 256);
    if (evening > 0) {
      gr.addColorStop(0, "#5D6FA8");
      gr.addColorStop(0.55, "#E9A27A");
      gr.addColorStop(1, "#F7D3A6");
    } else {
      gr.addColorStop(0, "#8EC3EE");
      gr.addColorStop(0.6, "#CFE6F7");
      gr.addColorStop(1, "#EEF5FA");
    }
    g.fillStyle = gr;
    g.fillRect(0, 0, 8, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [evening]);
  const mountains = useMemo(() => {
    const r = rnd(4);
    const peaks: { x: number; h: number; w: number }[] = [];
    for (let i = 0; i < 16; i++) peaks.push({ x: -360 + i * 48 + r() * 20, h: 70 + r() * 50, w: 60 + r() * 35 });
    return peaks;
  }, []);
  const blocks = useMemo(() => {
    const r = rnd(9);
    const b: { x: number; z: number; w: number; h: number; d: number; c: string }[] = [];
    for (let i = 0; i < 40; i++)
      b.push({ x: -90 + r() * 180, z: 45 + r() * 110, w: 8 + r() * 10, h: 8 + r() * 14, d: 8 + r() * 8, c: ["#D9DCE1", "#E8E1D6", "#CDD5DF", "#E2D6C8"][Math.floor(r() * 4)] });
    return b;
  }, []);
  const mtColor = evening > 0 ? "#8E86A8" : "#9CB0C9";
  return (
    <group position={[0, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 60, 320]}>
        <planeGeometry args={[1400, 400]} />
        <meshBasicMaterial map={sky} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {mountains.map((m, i) => (
        <group key={i} position={[m.x, -14, 260]}>
          <mesh position={[0, m.h / 2, 0]}>
            <coneGeometry args={[m.w, m.h, 5]} />
            <meshStandardMaterial color={mtColor} roughness={1} flatShading />
          </mesh>
          <mesh position={[0, m.h * 0.82, 0]}>
            <coneGeometry args={[m.w * 0.36, m.h * 0.36, 5]} />
            <meshStandardMaterial color="#F7F9FC" roughness={0.9} flatShading />
          </mesh>
        </group>
      ))}
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2 - 14, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.c} roughness={0.95} />
        </mesh>
      ))}
      {/* зелень (деревья вдоль улиц) */}
      {blocks.slice(0, 18).map((b, i) => (
        <mesh key={`t${i}`} position={[b.x + 3, -12, b.z - 8]}>
          <sphereGeometry args={[3.5, 8, 6]} />
          <meshStandardMaterial color="#7FA36A" roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

// Офисный стул (сиденье на высоте seat, спинка, газлифт, крестовина).
export const OfficeChair: React.FC<{ pos: [number, number, number]; rotY?: number; seat?: number }> = ({ pos, rotY = 0, seat = 0.47 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Box size={[0.48, 0.07, 0.46]} pos={[0, seat - 0.035, 0]} color="#2C3445" radius={0.03} />
    <Box size={[0.46, 0.5, 0.06]} pos={[0, seat + 0.33, -0.24]} color="#2C3445" radius={0.03} rot={[-0.12, 0, 0]} />
    <Box size={[0.04, seat - 0.1, 0.04]} pos={[0, (seat - 0.1) / 2 + 0.06, 0]} color="#8B93A3" metal={0.6} rough={0.4} radius={0.015} />
    {[0, 1, 2, 3, 4].map((k) => (
      <Box key={k} size={[0.03, 0.025, 0.3]} pos={[Math.sin((k * 2 * Math.PI) / 5) * 0.15, 0.05, Math.cos((k * 2 * Math.PI) / 5) * 0.15]} rot={[0, (k * 2 * Math.PI) / 5, 0]} color="#3A3F4A" radius={0.01} />
    ))}
  </group>
);

// Рабочий стол с монитором, клавиатурой, кружкой и растением.
export const Desk: React.FC<{
  pos: [number, number, number];
  rotY?: number;
  screen?: THREE.Texture | null;
  top?: number;
}> = ({ pos, rotY = 0, screen, top = 0.75 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Box size={[1.4, 0.035, 0.72]} pos={[0, top - 0.0175, 0]} color="#C9A57E" rough={0.6} radius={0.008} />
    {[-0.66, 0.66].map((x) => (
      <Box key={x} size={[0.04, top - 0.035, 0.66]} pos={[x, (top - 0.035) / 2, 0]} color="#E7E9ED" metal={0.2} rough={0.5} radius={0.008} />
    ))}
    {/* монитор */}
    <Box size={[0.58, 0.36, 0.025]} pos={[0, top + 0.27, -0.22]} color="#1C2230" rough={0.4} radius={0.008} />
    <mesh position={[0, top + 0.275, -0.206]}>
      <planeGeometry args={[0.55, 0.32]} />
      {screen ? <meshBasicMaterial map={screen} toneMapped={false} /> : <meshStandardMaterial color="#DCE8F5" emissive="#9FB9D6" emissiveIntensity={0.4} />}
    </mesh>
    <Box size={[0.04, 0.16, 0.04]} pos={[0, top + 0.08, -0.24]} color="#3A4150" radius={0.01} />
    <Box size={[0.2, 0.015, 0.16]} pos={[0, top + 0.008, -0.24]} color="#3A4150" radius={0.006} />
    {/* клавиатура и мышь */}
    <Box size={[0.42, 0.018, 0.14]} pos={[-0.02, top + 0.009, 0.06]} color="#E9ECF1" radius={0.006} />
    <Box size={[0.06, 0.022, 0.1]} pos={[0.3, top + 0.011, 0.07]} color="#E9ECF1" radius={0.02} />
    {/* кружка */}
    <mesh position={[-0.52, top + 0.05, -0.05]} castShadow>
      <cylinderGeometry args={[0.038, 0.034, 0.1, 20]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
    </mesh>
    {/* растение */}
    <mesh position={[0.56, top + 0.06, -0.24]} castShadow>
      <cylinderGeometry args={[0.06, 0.05, 0.12, 16]} />
      <meshStandardMaterial color="#E07A5F" roughness={0.7} />
    </mesh>
    {[0, 1, 2, 3, 4, 5].map((k) => (
      <mesh key={k} position={[0.56 + Math.cos(k) * 0.04, top + 0.17 + (k % 3) * 0.03, -0.24 + Math.sin(k) * 0.04]} rotation={[Math.cos(k) * 0.5, k, Math.sin(k) * 0.5]} castShadow>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshStandardMaterial color={k % 2 ? "#6A9E5B" : "#7FB06A"} roughness={0.8} />
      </mesh>
    ))}
    {/* бумаги */}
    <Box size={[0.21, 0.01, 0.297]} pos={[-0.38, top + 0.005, 0.12]} rot={[0, 0.2, 0]} color="#FAFAF7" radius={0.002} />
  </group>
);

// Офис: пол, стены, большое окно на город, лампы, соседние столы.
export const OfficeRoom: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial color="#B9A58C" roughness={0.7} />
    </mesh>
    {/* стена с окном за спиной мамы (z = 2.4) */}
    <group position={[0, 0, 2.4]}>
      <Box size={[14, 0.9, 0.2]} pos={[0, 0.45, 0]} color="#ECE7DF" radius={0} />
      <Box size={[14, 0.5, 0.2]} pos={[0, 2.95, 0]} color="#ECE7DF" radius={0} />
      {[-3.2, -1.6, 0, 1.6, 3.2].map((x) => (
        <Box key={x} size={[0.08, 2.0, 0.12]} pos={[x, 1.9, 0]} color="#D9DDE3" metal={0.3} rough={0.4} radius={0.01} />
      ))}
      <Box size={[14, 0.08, 0.14]} pos={[0, 0.9, 0]} color="#D9DDE3" radius={0.01} />
      <Box size={[14, 0.08, 0.14]} pos={[0, 2.7, 0]} color="#D9DDE3" radius={0.01} />
    </group>
    {/* задняя стена с дверью и правая стена */}
    <Box size={[14, 3.2, 0.2]} pos={[0, 1.6, -3.4]} color="#E6E1D8" radius={0} />
    <Box size={[0.95, 2.1, 0.06]} pos={[1.4, 1.05, -3.28]} color="#B89A78" rough={0.6} radius={0.01} />
    <Box size={[0.04, 0.04, 0.12]} pos={[1.05, 1.0, -3.22]} color="#C9CCD2" metal={0.7} rough={0.3} radius={0.01} />
    <Box size={[1.6, 0.9, 0.04]} pos={[-1.2, 1.6, -3.28]} color="#F7F7F4" radius={0.01} />
    <Box size={[0.2, 3.2, 8]} pos={[4.2, 1.6, 0]} color="#E9E4DC" radius={0} />
    {/* боковая стена с полкой */}
    <Box size={[0.2, 3.2, 8]} pos={[-3.4, 1.6, 0]} color="#E9E4DC" radius={0} />
    <Box size={[0.3, 0.03, 1.2]} pos={[-3.2, 1.5, -0.5]} color="#C9A57E" radius={0.005} />
    {["#4F8FCB", "#E07A5F", "#7FB77E", "#FFC90E", "#14285A"].map((c, i) => (
      <Box key={c} size={[0.2, 0.28, 0.06]} pos={[-3.2, 1.65, -0.95 + i * 0.1]} color={c} radius={0.006} />
    ))}
    <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial color="#F2F0EC" roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
    {[-1.5, 1.5].map((x) => (
      <Box key={x} size={[1.2, 0.04, 0.3]} pos={[x, 3.12, 0.3]} color="#FFFFFF" emissive="#FFF6E6" emissiveIntensity={0.8} radius={0.01} />
    ))}
  </group>
);
