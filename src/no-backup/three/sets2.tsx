import { useMemo } from "react";
import * as THREE from "three";
import { fontFamily } from "../../fonts";
import { BishkekView, Box, OfficeChair } from "./sets";

// Декорации: переговорная, школа, улица и машина, кухня. Метры, пол y = 0.

const rnd = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Текстура с подписью/рисунком (рисуется один раз).
export const useCanvas = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, deps: readonly unknown[] = []) =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d")!);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

// Настенные часы: стрелки по времени (минуты от полуночи).
export const WallClock: React.FC<{ pos: [number, number, number]; rotY?: number; minutes: number; r?: number }> = ({ pos, rotY = 0, minutes, r = 0.16 }) => {
  const face = useCanvas(256, 256, (g) => {
    g.fillStyle = "#FFFFFF";
    g.beginPath();
    g.arc(128, 128, 126, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#1E2A44";
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.save();
      g.translate(128 + Math.sin(a) * 104, 128 - Math.cos(a) * 104);
      g.rotate(a);
      g.fillRect(-3, -12, 6, i % 3 === 0 ? 24 : 14);
      g.restore();
    }
  });
  const h = ((minutes / 60) % 12) / 12;
  const m = (minutes % 60) / 60;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r * 1.08, r * 1.08, 0.04, 40]} />
        <meshStandardMaterial color="#2B3346" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.021]}>
        <circleGeometry args={[r, 40]} />
        <meshStandardMaterial map={face} roughness={0.6} />
      </mesh>
      <group position={[0, 0, 0.026]} rotation={[0, 0, -h * Math.PI * 2]}>
        <mesh position={[0, r * 0.27, 0]}>
          <boxGeometry args={[r * 0.07, r * 0.55, 0.004]} />
          <meshStandardMaterial color="#1E2A44" />
        </mesh>
      </group>
      <group position={[0, 0, 0.03]} rotation={[0, 0, -m * Math.PI * 2]}>
        <mesh position={[0, r * 0.38, 0]}>
          <boxGeometry args={[r * 0.045, r * 0.8, 0.004]} />
          <meshStandardMaterial color="#1E2A44" />
        </mesh>
      </group>
    </group>
  );
};

// Переговорная: стол, стулья, телевизор с видеозвонком (экран — текстура).
export const MeetingRoom: React.FC<{ tv: THREE.Texture | null; clockMin: number }> = ({ tv, clockMin }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#9E9A93" roughness={0.85} />
    </mesh>
    <Box size={[8, 3.1, 0.15]} pos={[0, 1.55, -1.9]} color="#E9E6E1" radius={0} />
    <Box size={[0.15, 3.1, 6]} pos={[-2.6, 1.55, 0]} color="#DCD7CF" radius={0} />
    {/* стеклянная стена справа с видом на офис */}
    <mesh position={[2.6, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[6, 3]} />
      <meshPhysicalMaterial color="#DDEAF3" transparent opacity={0.25} roughness={0.1} />
    </mesh>
    <Box size={[0.06, 3, 0.06]} pos={[2.6, 1.5, -1.2]} color="#8D96A5" metal={0.5} rough={0.4} radius={0.01} />
    <Box size={[0.06, 3, 0.06]} pos={[2.6, 1.5, 1.2]} color="#8D96A5" metal={0.5} rough={0.4} radius={0.01} />
    <mesh position={[0, 3.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#F2F0EC" side={THREE.DoubleSide} />
    </mesh>
    {/* стол */}
    <Box size={[2.2, 0.04, 1.1]} pos={[0, 0.74, 0]} color="#8A6A4E" rough={0.55} radius={0.015} />
    <Box size={[0.08, 0.72, 0.6]} pos={[-0.8, 0.36, 0]} color="#3C4250" radius={0.01} />
    <Box size={[0.08, 0.72, 0.6]} pos={[0.8, 0.36, 0]} color="#3C4250" radius={0.01} />
    {/* телевизор на стене */}
    <Box size={[1.5, 0.88, 0.05]} pos={[0, 1.55, -1.8]} color="#111318" rough={0.3} radius={0.01} />
    <mesh position={[0, 1.55, -1.77]}>
      <planeGeometry args={[1.44, 0.82]} />
      {tv ? <meshBasicMaterial map={tv} toneMapped={false} /> : <meshStandardMaterial color="#222" />}
    </mesh>
    <WallClock pos={[-2.5, 2.2, -0.6]} rotY={Math.PI / 2} minutes={clockMin} />
    {/* ноутбук и бумаги */}
    <group position={[0.42, 0.76, 0.12]} rotation={[0, 0.25, 0]}>
      <Box size={[0.34, 0.015, 0.24]} pos={[0, 0.008, 0]} color="#C4C8CF" metal={0.4} rough={0.4} radius={0.006} />
      <Box size={[0.34, 0.22, 0.01]} pos={[0, 0.12, -0.12]} rot={[-0.2, 0, 0]} color="#C4C8CF" metal={0.4} rough={0.4} radius={0.006} />
    </group>
    <Box size={[0.21, 0.006, 0.297]} pos={[-0.35, 0.763, 0.2]} rot={[0, -0.15, 0]} color="#FAFAF7" radius={0.002} />
    <OfficeChair pos={[-1.6, 0, 0.9]} rotY={2.6} />
    <mesh position={[1.6, 0.2, -1.4]} castShadow>
      <cylinderGeometry args={[0.16, 0.13, 0.4, 16]} />
      <meshStandardMaterial color="#E9E6E1" />
    </mesh>
    {[0, 1, 2, 3, 4, 5, 6].map((k) => (
      <mesh key={k} position={[1.6 + Math.cos(k) * 0.1, 0.55 + (k % 3) * 0.12, -1.4 + Math.sin(k) * 0.1]} castShadow>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshStandardMaterial color={k % 2 ? "#5E8F4E" : "#78A865"} roughness={0.9} />
      </mesh>
    ))}
    {[-0.6, 0.6].map((x) => (
      <Box key={x} size={[0.9, 0.04, 0.3]} pos={[x, 3.06, 0]} color="#FFFFFF" emissive="#FFF6E6" emissiveIntensity={0.8} radius={0.01} />
    ))}
  </group>
);

// Окна многоэтажки (текстура фасада).
export const useFacade = (seed: number, floors: number, cols: number, wall: string, lit = 0) =>
  useCanvas(512, 512, (g) => {
    const r = rnd(seed);
    g.fillStyle = wall;
    g.fillRect(0, 0, 512, 512);
    const fw = 512 / cols;
    const fh = 512 / floors;
    for (let y = 0; y < floors; y++)
      for (let x = 0; x < cols; x++) {
        const on = r() < lit;
        g.fillStyle = on ? "#FFD9A0" : r() < 0.5 ? "#7F95AE" : "#90A6BE";
        g.fillRect(x * fw + fw * 0.2, y * fh + fh * 0.22, fw * 0.6, fh * 0.56);
        g.fillStyle = "rgba(255,255,255,0.35)";
        g.fillRect(x * fw + fw * 0.2, y * fh + fh * 0.22, fw * 0.6, fh * 0.06);
      }
  });

// Школа: трёхэтажное здание, вход с козырьком, вывеска, забор с воротами,
// деревья, скамейка. Вход — в точке (0, 0, 0), двор — к +z.
export const SchoolYard: React.FC = () => {
  const facade = useFacade(3, 3, 8, "#E8D9C0");
  const facadeA = useFacade(41, 6, 5, "#DCD3C4");
  const facadeB = useFacade(42, 6, 5, "#D3DBE3");
  const sign = useCanvas(1024, 192, (g) => {
    g.fillStyle = "#1F3B73";
    g.fillRect(0, 0, 1024, 192);
    g.fillStyle = "#FFFFFF";
    g.font = `900 92px ${fontFamily}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("№ 61 мектеп", 512, 100);
  });
  const trees = useMemo(() => {
    const r = rnd(21);
    return Array.from({ length: 9 }, (_, i) => ({ x: i < 5 ? -7 + i * 1.6 + r() : 3 + (i - 5) * 1.7 + r(), z: 1.0 + r() * 0.6, s: 0.8 + r() * 0.4 }));
  }, []);
  return (
    <group>
      {/* асфальт двора и газон */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 6]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#A9A7A2" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 1.8]} receiveShadow>
        <planeGeometry args={[3.2, 2.6]} />
        <meshStandardMaterial color="#C9BFAF" roughness={0.9} />
      </mesh>
      {/* здание */}
      <mesh position={[0, 5, -3]} castShadow receiveShadow>
        <boxGeometry args={[22, 10, 6]} />
        <meshStandardMaterial attach="material-0" color="#E2D2B8" />
        <meshStandardMaterial attach="material-1" color="#E2D2B8" />
        <meshStandardMaterial attach="material-2" color="#B8A890" />
        <meshStandardMaterial attach="material-3" color="#E2D2B8" />
        <meshStandardMaterial attach="material-4" map={facade} roughness={0.9} />
        <meshStandardMaterial attach="material-5" color="#E2D2B8" />
      </mesh>
      {/* вход */}
      <Box size={[2.6, 3.0, 0.3]} pos={[0, 1.5, 0.05]} color="#D8C7AB" radius={0.02} />
      <Box size={[1.6, 2.3, 0.06]} pos={[0, 1.15, 0.22]} color="#5C6E86" metal={0.2} rough={0.35} radius={0.01} />
      <Box size={[0.04, 2.3, 0.08]} pos={[0, 1.15, 0.25]} color="#3B4656" radius={0.005} />
      <Box size={[3.2, 0.12, 1.6]} pos={[0, 2.9, 0.9]} color="#C9B595" radius={0.02} />
      {[-1.45, 1.45].map((x) => (
        <Box key={x} size={[0.1, 2.85, 0.1]} pos={[x, 1.43, 1.55]} color="#B9A889" radius={0.01} />
      ))}
      <mesh position={[0, 3.25, 0.22]}>
        <planeGeometry args={[2.4, 0.45]} />
        <meshStandardMaterial map={sign} roughness={0.6} />
      </mesh>
      {/* забор с воротами (z = 6), ворота в центре */}
      {Array.from({ length: 40 }, (_, i) => -10 + i * 0.5)
        .filter((x) => Math.abs(x) > 1.2)
        .map((x) => (
          <Box key={x} size={[0.04, 1.4, 0.04]} pos={[x, 0.7, 6]} color="#2F4A3A" metal={0.4} rough={0.5} radius={0.01} cast={false} />
        ))}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box size={[8.8, 0.05, 0.05]} pos={[s * 5.6, 1.3, 6]} color="#2F4A3A" metal={0.4} rough={0.5} radius={0.01} />
          <Box size={[8.8, 0.05, 0.05]} pos={[s * 5.6, 0.2, 6]} color="#2F4A3A" metal={0.4} rough={0.5} radius={0.01} />
          <Box size={[0.14, 1.8, 0.14]} pos={[s * 1.2, 0.9, 6]} color="#2F4A3A" metal={0.4} rough={0.5} radius={0.01} />
        </group>
      ))}
      {/* деревья и скамейка */}
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 2.2, 10]} />
            <meshStandardMaterial color="#6B5443" roughness={1} />
          </mesh>
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} position={[Math.cos(k * 1.7) * 0.4, 2.5 + (k % 2) * 0.4, Math.sin(k * 1.7) * 0.4]} castShadow>
              <icosahedronGeometry args={[0.75, 1]} />
              <meshStandardMaterial color={k % 2 ? "#6E9B57" : "#7FAE63"} roughness={1} flatShading />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[2.6, 0, 2.2]} rotation={[0, -0.3, 0]}>
        <Box size={[1.5, 0.05, 0.4]} pos={[0, 0.45, 0]} color="#9C6E48" radius={0.01} />
        <Box size={[1.5, 0.3, 0.05]} pos={[0, 0.65, -0.18]} color="#9C6E48" radius={0.01} />
        {[-0.65, 0.65].map((x) => (
          <Box key={x} size={[0.06, 0.45, 0.36]} pos={[x, 0.225, 0]} color="#3D3F45" radius={0.01} />
        ))}
      </group>
      {/* улица за забором */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 9.5]} receiveShadow>
        <planeGeometry args={[60, 5]} />
        <meshStandardMaterial color="#55585E" roughness={0.9} />
      </mesh>
      <BishkekView z={-40} rotY={Math.PI} />
      {/* дома через дорогу и тротуар */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 13.5]} receiveShadow>
        <planeGeometry args={[60, 3]} />
        <meshStandardMaterial color="#B5B0A6" roughness={0.95} />
      </mesh>
      {[-14, -2, 10].map((x, i) => (
        <mesh key={x} position={[x, 9, 22]} castShadow>
          <boxGeometry args={[11, 18, 8]} />
          <meshStandardMaterial attach="material-0" color="#D9D2C6" />
          <meshStandardMaterial attach="material-1" color="#D9D2C6" />
          <meshStandardMaterial attach="material-2" color="#9C9A96" />
          <meshStandardMaterial attach="material-3" color="#9C9A96" />
          <meshStandardMaterial attach="material-4" color="#D9D2C6" />
          <meshStandardMaterial attach="material-5" map={i % 2 ? facadeB : facadeA} />
        </mesh>
      ))}
      {[-9, -4, 3, 8, 14].map((x) => (
        <group key={x} position={[x, 0, 13.2]}>
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.1, 0.14, 2.6, 8]} />
            <meshStandardMaterial color="#6B5443" roughness={1} />
          </mesh>
          <mesh position={[0, 3.3, 0]}>
            <icosahedronGeometry args={[1.4, 1]} />
            <meshStandardMaterial color="#7FAE63" roughness={1} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Легковая машина (фон, поток): кузов, кабина со стёклами, колёса, фары.
export const Car: React.FC<{ pos: [number, number, number]; rotY?: number; color: string; brake?: number }> = ({ pos, rotY = 0, color, brake = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Box size={[1.74, 0.55, 4.1]} pos={[0, 0.58, 0]} color={color} rough={0.35} metal={0.3} radius={0.16} />
    <Box size={[1.56, 0.52, 2.2]} pos={[0, 1.08, -0.15]} color="#1D2633" rough={0.15} metal={0.4} radius={0.18} />
    <Box size={[1.5, 0.06, 1.8]} pos={[0, 1.33, -0.2]} color={color} rough={0.35} metal={0.3} radius={0.03} />
    {[
      [-0.82, 1.32],
      [0.82, 1.32],
      [-0.82, -1.32],
      [0.82, -1.32],
    ].map(([x, z]) => (
      <mesh key={`${x}${z}`} position={[x, 0.32, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.22, 20]} />
        <meshStandardMaterial color="#1A1B1F" roughness={0.8} />
      </mesh>
    ))}
    {[-0.6, 0.6].map((x) => (
      <group key={x}>
        <Box size={[0.32, 0.1, 0.04]} pos={[x, 0.68, 2.05]} color="#F4F6F8" emissive="#FFFFFF" emissiveIntensity={0.3} radius={0.02} cast={false} />
        <Box size={[0.34, 0.1, 0.04]} pos={[x, 0.72, -2.05]} color="#B3282D" emissive="#FF2A2A" emissiveIntensity={0.4 + brake * 2.2} radius={0.02} cast={false} />
      </group>
    ))}
  </group>
);

// Светофор: state 0 — зелёный, 1 — жёлтый, 2 — красный.
export const TrafficLight: React.FC<{ pos: [number, number, number]; rotY?: number; state: number }> = ({ pos, rotY = 0, state }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Box size={[0.12, 4.2, 0.12]} pos={[0, 2.1, 0]} color="#3A3D44" metal={0.5} rough={0.5} radius={0.02} />
    <Box size={[0.36, 1.0, 0.3]} pos={[0, 4.4, 0]} color="#22252B" radius={0.04} />
    {[
      ["#FF3B30", 2, 4.72],
      ["#FFC400", 1, 4.4],
      ["#33D17A", 0, 4.08],
    ].map(([c, s, y]) => (
      <mesh key={String(s)} position={[0, y as number, 0.16]}>
        <circleGeometry args={[0.11, 24]} />
        <meshStandardMaterial color={state === s ? (c as string) : "#2E3138"} emissive={state === s ? (c as string) : "#000000"} emissiveIntensity={state === s ? 2.5 : 0} />
      </mesh>
    ))}
  </group>
);

// Улица Бишкека: дорога вдоль z, тротуары, деревья, дома (повторяется по
// длине — для движения машины). offset — сдвиг мира (м).
export const Street: React.FC<{ offset: number; evening?: number }> = ({ offset }) => {
  const facades = [useFacade(5, 9, 6, "#E6E1D8"), useFacade(8, 5, 5, "#D8CBB8"), useFacade(13, 9, 6, "#D4DCE4")];
  const blocks = useMemo(() => {
    const r = rnd(33);
    return Array.from({ length: 14 }, (_, i) => ({ side: i % 2 ? 1 : -1, z: Math.floor(i / 2) * 26 - 60 + r() * 6, w: 14 + r() * 8, h: 15 + r() * 14, f: Math.floor(r() * 3) }));
  }, []);
  const trees = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ side: i % 2 ? 1 : -1, z: Math.floor(i / 2) * 9 - 60 })), []);
  const period = 182;
  const off = ((offset % period) + period) % period;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 600]} />
        <meshStandardMaterial color="#4B4E54" roughness={0.92} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * 10, 0.08, 0]} receiveShadow>
          <planeGeometry args={[6, 600]} />
          <meshStandardMaterial color="#B5B0A6" roughness={0.95} />
        </mesh>
      ))}
      {[0, 1].map((rep) => (
        <group key={rep} position={[0, 0, -off + rep * period - period / 2]}>
          {Array.from({ length: 46 }, (_, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, -90 + i * 4]}>
              <planeGeometry args={[0.14, 2]} />
              <meshStandardMaterial color="#E8E6E0" roughness={0.8} />
            </mesh>
          ))}
          {trees.map((t, i) => (
            <group key={i} position={[t.side * 8.2, 0, t.z]}>
              <mesh position={[0, 1.4, 0]}>
                <cylinderGeometry args={[0.12, 0.16, 2.8, 8]} />
                <meshStandardMaterial color="#6B5443" roughness={1} />
              </mesh>
              <mesh position={[0, 3.6, 0]}>
                <icosahedronGeometry args={[1.5, 1]} />
                <meshStandardMaterial color={i % 3 ? "#6E9B57" : "#7FAE63"} roughness={1} flatShading />
              </mesh>
            </group>
          ))}
          {blocks.map((b, i) => (
            <mesh key={i} position={[b.side * (14 + b.w / 2), b.h / 2, b.z]}>
              <boxGeometry args={[b.w, b.h, 12]} />
              <meshStandardMaterial attach="material-0" map={facades[b.f]} />
              <meshStandardMaterial attach="material-1" map={facades[b.f]} />
              <meshStandardMaterial attach="material-2" color="#9C9A96" />
              <meshStandardMaterial attach="material-3" color="#9C9A96" />
              <meshStandardMaterial attach="material-4" map={facades[b.f]} />
              <meshStandardMaterial attach="material-5" map={facades[b.f]} />
            </mesh>
          ))}
        </group>
      ))}
      <BishkekView z={-220} rotY={Math.PI} />
    </group>
  );
};

// Салон машины мамы (руль слева). Начало координат — центр сиденья водителя
// на уровне пола салона; вперёд — +z. phoneScreen — экран в держателе.
export const CarInterior: React.FC<{ phone: React.ReactNode; wheelTurn?: number }> = ({ phone, wheelTurn = 0 }) => (
  <group>
    {/* сиденья */}
    <Box size={[0.52, 0.12, 0.5]} pos={[0, 0.3, 0]} color="#3B3F48" radius={0.05} />
    <Box size={[0.5, 0.7, 0.12]} pos={[0, 0.68, -0.28]} rot={[-0.2, 0, 0]} color="#3B3F48" radius={0.05} />
    <Box size={[0.26, 0.2, 0.1]} pos={[0, 1.13, -0.38]} rot={[-0.15, 0, 0]} color="#3B3F48" radius={0.04} />
    <Box size={[0.52, 0.12, 0.5]} pos={[-0.75, 0.3, 0]} color="#3B3F48" radius={0.05} />
    <Box size={[0.5, 0.7, 0.12]} pos={[-0.75, 0.68, -0.28]} rot={[-0.2, 0, 0]} color="#3B3F48" radius={0.05} />
    {/* пол и центральная консоль */}
    <Box size={[1.5, 0.05, 1.8]} pos={[-0.37, 0.0, 0.3]} color="#2A2C31" radius={0.01} />
    <Box size={[0.2, 0.25, 0.6]} pos={[-0.37, 0.3, 0.25]} color="#2D3036" radius={0.04} />
    {/* приборная панель */}
    <Box size={[1.55, 0.3, 0.45]} pos={[-0.37, 0.82, 0.78]} color="#2D3036" rough={0.7} radius={0.08} />
    <Box size={[1.55, 0.06, 0.25]} pos={[-0.37, 0.98, 0.9]} color="#262930" rough={0.8} radius={0.03} />
    {/* руль */}
    <group position={[0, 0.86, 0.5]} rotation={[-1.15, 0, 0]}>
      <group rotation={[0, wheelTurn, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.018, 12, 40]} />
          <meshStandardMaterial color="#1C1E22" roughness={0.6} />
        </mesh>
        <Box size={[0.3, 0.03, 0.06]} pos={[0, 0, 0]} color="#1C1E22" radius={0.01} />
        <mesh position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 20]} />
          <meshStandardMaterial color="#25282E" />
        </mesh>
      </group>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.22, 10]} />
        <meshStandardMaterial color="#1C1E22" />
      </mesh>
    </group>
    {/* держатель телефона у панели (справа от руля) */}
    <group position={[-0.32, 1.06, 0.72]} rotation={[-0.25, 0.35, 0]}>
      <Box size={[0.09, 0.02, 0.03]} pos={[0, -0.085, -0.01]} color="#15171A" radius={0.005} />
      {phone}
    </group>
    {/* стойки, крыша, дверь */}
    <Box size={[0.06, 0.75, 0.06]} pos={[0.42, 1.25, 0.95]} rot={[-0.6, 0, -0.05]} color="#3B3F48" radius={0.02} />
    <Box size={[0.06, 0.75, 0.06]} pos={[-1.16, 1.25, 0.95]} rot={[-0.6, 0, 0.05]} color="#3B3F48" radius={0.02} />
    <Box size={[1.62, 0.05, 1.5]} pos={[-0.37, 1.55, 0.05]} color="#C9C5BE" radius={0.02} />
    <Box size={[0.08, 0.55, 1.3]} pos={[0.44, 0.65, 0.2]} color="#3B3F48" radius={0.03} />
    <Box size={[0.08, 0.06, 1.3]} pos={[0.44, 0.95, 0.2]} color="#2D3036" radius={0.02} />
    {/* зеркало */}
    <Box size={[0.24, 0.07, 0.03]} pos={[-0.37, 1.42, 0.82]} color="#1E2024" radius={0.015} />
  </group>
);

// Кухня вечером: стол, стулья, шкафы, окно на вечерний город, лампа.
export const Kitchen: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#B08B66" roughness={0.75} />
    </mesh>
    {/* задняя стена с проёмом окна (x 0.45…1.95, y 0.95…2.25) */}
    <Box size={[4.45, 2.8, 0.15]} pos={[-1.775, 1.4, -1.8]} color="#EADFCF" radius={0} />
    <Box size={[2.05, 2.8, 0.15]} pos={[2.975, 1.4, -1.8]} color="#EADFCF" radius={0} />
    <Box size={[1.5, 0.95, 0.15]} pos={[1.2, 0.475, -1.8]} color="#EADFCF" radius={0} />
    <Box size={[1.5, 0.55, 0.15]} pos={[1.2, 2.525, -1.8]} color="#EADFCF" radius={0} />
    <Box size={[0.15, 2.8, 6]} pos={[-2.4, 1.4, 0]} color="#E5D6C2" radius={0} />
    {/* окно на задней стене */}
    <group position={[1.2, 0, -1.72]}>
      <Box size={[1.5, 0.08, 0.12]} pos={[0, 0.95, 0]} color="#F4F1EC" radius={0.01} />
      <Box size={[1.5, 0.08, 0.12]} pos={[0, 2.25, 0]} color="#F4F1EC" radius={0.01} />
      {[-0.75, 0, 0.75].map((x) => (
        <Box key={x} size={[0.07, 1.36, 0.12]} pos={[x, 1.6, 0]} color="#F4F1EC" radius={0.01} />
      ))}
    </group>
    {/* шкафы и столешница слева */}
    <Box size={[1.9, 0.86, 0.6]} pos={[-1.1, 0.43, -1.45]} color="#F2EDE4" radius={0.02} />
    <Box size={[1.95, 0.04, 0.64]} pos={[-1.1, 0.88, -1.45]} color="#6E5A4B" radius={0.01} />
    <Box size={[1.9, 0.7, 0.35]} pos={[-1.1, 1.95, -1.6]} color="#F2EDE4" radius={0.02} />
    <mesh position={[-1.5, 0.98, -1.45]} castShadow>
      <cylinderGeometry args={[0.08, 0.1, 0.18, 20]} />
      <meshStandardMaterial color="#C9CCD2" metalness={0.6} roughness={0.3} />
    </mesh>
    {/* стол со скатертью и стулья */}
    <Box size={[1.4, 0.04, 0.9]} pos={[0.2, 0.74, 0]} color="#F3EEE6" rough={0.9} radius={0.01} />
    <Box size={[1.3, 0.7, 0.8]} pos={[0.2, 0.36, 0]} color="#D9CDBD" rough={0.9} radius={0.02} />
    {/* чайник, пиалы, тетрадь сына */}
    <mesh position={[-0.38, 0.83, 0.22]} castShadow>
      <sphereGeometry args={[0.09, 20, 14]} />
      <meshStandardMaterial color="#3E6F9E" roughness={0.35} />
    </mesh>
    {[-0.12, 0.55].map((x) => (
      <mesh key={x} position={[x, 0.79, -0.22]} castShadow>
        <cylinderGeometry args={[0.045, 0.03, 0.05, 20]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
    ))}
    {/* лампа над столом */}
    <mesh position={[0.2, 2.0, 0]}>
      <coneGeometry args={[0.22, 0.18, 24, 1, true]} />
      <meshStandardMaterial color="#E9A75B" side={THREE.DoubleSide} emissive="#FFB766" emissiveIntensity={0.6} />
    </mesh>
    <mesh position={[0.2, 2.45, 0]}>
      <cylinderGeometry args={[0.006, 0.006, 0.8, 6]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <mesh position={[0, 2.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#F4EEE6" side={THREE.DoubleSide} />
    </mesh>
    <BishkekView z={-1.9} evening={1} rotY={Math.PI} />
  </group>
);

export const Chair: React.FC<{ pos: [number, number, number]; rotY?: number }> = ({ pos, rotY = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Box size={[0.44, 0.05, 0.42]} pos={[0, 0.45, 0]} color="#8A6446" radius={0.015} />
    <Box size={[0.42, 0.45, 0.04]} pos={[0, 0.72, -0.2]} color="#8A6446" radius={0.015} />
    {[
      [-0.19, -0.18],
      [0.19, -0.18],
      [-0.19, 0.18],
      [0.19, 0.18],
    ].map(([x, z]) => (
      <Box key={`${x}${z}`} size={[0.035, 0.45, 0.035]} pos={[x, 0.225, z]} color="#6E4F37" radius={0.008} />
    ))}
  </group>
);
