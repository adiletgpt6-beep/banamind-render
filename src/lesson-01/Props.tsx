// Предметы 3D-урока: низкий стол, игрушечный домик, ящик с ростком.
import type { V3 } from "./motion";

const WOOD = "#b97a3f";
const WOOD_DARK = "#8f5a2a";

export const Table: React.FC<{ readonly position?: V3 }> = ({ position = [0, 0, 0] }) => (
  <group position={position}>
    <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.35, 0.06, 0.7]} />
      <meshStandardMaterial color={WOOD} roughness={0.75} />
    </mesh>
    <mesh position={[0, 0.3, 0]} castShadow>
      <boxGeometry args={[1.25, 0.04, 0.6]} />
      <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
    </mesh>
    {([-0.58, 0.58] as const).map((x) =>
      ([-0.26, 0.26] as const).map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.16, z]} castShadow receiveShadow>
          <cylinderGeometry args={[0.035, 0.03, 0.32, 12]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
        </mesh>
      )),
    )}
  </group>
);

const Window: React.FC<{ readonly position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[0.24, 0.24, 0.02]} />
      <meshStandardMaterial color="#f6f0e2" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0, 0.005]}>
      <boxGeometry args={[0.19, 0.19, 0.02]} />
      <meshStandardMaterial color="#9ed3f7" roughness={0.2} metalness={0.1} emissive="#4a8fc0" emissiveIntensity={0.25} />
    </mesh>
    <mesh position={[0, 0, 0.018]}>
      <boxGeometry args={[0.19, 0.018, 0.01]} />
      <meshStandardMaterial color="#f6f0e2" />
    </mesh>
    <mesh position={[0, 0, 0.018]}>
      <boxGeometry args={[0.018, 0.19, 0.01]} />
      <meshStandardMaterial color="#f6f0e2" />
    </mesh>
  </group>
);

/** Домик-макет: корпус 1×0.7×0.8, двускатная крыша, окна, дверь, труба. */
export const ToyHouse: React.FC<{ readonly position: V3; readonly scale?: number; readonly rotationY?: number }> = ({ position, scale = 0.42, rotationY = 0 }) => (
  <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
    <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
      <boxGeometry args={[1, 0.7, 0.8]} />
      <meshStandardMaterial color="#dcae72" roughness={0.85} />
    </mesh>
    {/* тёмная полоса между этажами и цоколь */}
    <mesh position={[0, 0.36, 0]}>
      <boxGeometry args={[1.02, 0.025, 0.82]} />
      <meshStandardMaterial color="#8c5a2b" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.02, 0]} receiveShadow>
      <boxGeometry args={[1.04, 0.04, 0.84]} />
      <meshStandardMaterial color="#8c5a2b" roughness={0.9} />
    </mesh>
    {/* крыша: треугольная призма (цилиндр с тремя гранями) */}
    <mesh position={[0, 0.7 + 0.33 * 0.72, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 0.72]} castShadow receiveShadow>
      <cylinderGeometry args={[0.66, 0.66, 0.98, 3, 1]} />
      <meshStandardMaterial color="#d8573e" roughness={0.7} />
    </mesh>
    <mesh position={[0, 0.69, 0]}>
      <boxGeometry args={[1.14, 0.03, 1.0]} />
      <meshStandardMaterial color="#b2412c" roughness={0.8} />
    </mesh>
    <mesh position={[0.28, 1.12, -0.15]} castShadow>
      <boxGeometry args={[0.13, 0.32, 0.13]} />
      <meshStandardMaterial color="#b2412c" roughness={0.8} />
    </mesh>
    {/* круглое чердачное окно */}
    <mesh position={[0, 0.92, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 0.02, 24]} />
      <meshStandardMaterial color="#f6f0e2" />
    </mesh>
    <mesh position={[0, 0.92, 0.51]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 0.02, 24]} />
      <meshStandardMaterial color="#9ed3f7" emissive="#4a8fc0" emissiveIntensity={0.25} />
    </mesh>
    <Window position={[-0.3, 0.5, 0.4]} />
    <Window position={[0.3, 0.5, 0.4]} />
    {/* дверь с арочным верхом */}
    <mesh position={[0, 0.17, 0.4]}>
      <boxGeometry args={[0.2, 0.3, 0.02]} />
      <meshStandardMaterial color="#5a3418" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.32, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 0.02, 20]} />
      <meshStandardMaterial color="#5a3418" roughness={0.9} />
    </mesh>
    <mesh position={[0.06, 0.17, 0.415]}>
      <sphereGeometry args={[0.012, 10, 8]} />
      <meshStandardMaterial color="#e8c15a" metalness={0.5} roughness={0.4} />
    </mesh>
  </group>
);

/** Деревянный ящик с ростком — стоит перед девочкой. */
export const PlantBox: React.FC<{ readonly position: V3; readonly rotationY?: number }> = ({ position, rotationY = 0 }) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.24, 0.14, 0.17]} />
      <meshStandardMaterial color="#a86a35" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.135, 0]}>
      <boxGeometry args={[0.2, 0.012, 0.13]} />
      <meshStandardMaterial color="#4a3324" roughness={1} />
    </mesh>
    <mesh position={[0, 0.2, 0]} castShadow>
      <cylinderGeometry args={[0.008, 0.01, 0.14, 8]} />
      <meshStandardMaterial color="#5a7a2e" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.3, 0]} scale={[1, 1.25, 0.55]} castShadow>
      <sphereGeometry args={[0.05, 16, 12]} />
      <meshStandardMaterial color="#6fae4a" roughness={0.8} />
    </mesh>
    <mesh position={[0.045, 0.23, 0]} rotation={[0, 0, -0.9]} scale={[1, 1.4, 0.5]} castShadow>
      <sphereGeometry args={[0.03, 16, 12]} />
      <meshStandardMaterial color="#79b94f" roughness={0.8} />
    </mesh>
  </group>
);
