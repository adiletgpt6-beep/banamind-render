// Мальчик ~8 лет у озера: стилизованная фигура из простых объёмов, скромная
// повседневная одежда (рубашка с длинным рукавом, брюки). Смотрит на небо,
// затем переводит взгляд на воду. Остаётся на втором плане.
import { useMemo } from "react";
import * as THREE from "three";

const mat = (color: string, rough = 0.85) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });

export const Boy: React.FC<{ position: [number, number, number]; yaw: number; headPitch: number; headYaw?: number; scale?: number }> = ({
  position,
  yaw,
  headPitch,
  headYaw = 0,
  scale = 1,
}) => {
  const m = useMemo(
    () => ({
      shirt: mat("#3E6E8E"),
      pants: mat("#2B3442"),
      skin: mat("#C99A78", 0.7),
      hair: mat("#1E1714", 0.9),
      shoe: mat("#1B1F27"),
    }),
    [],
  );
  return (
    <group position={position} rotation={[0, yaw, 0]} scale={scale}>
      {/* ноги */}
      {[-0.075, 0.075].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh material={m.pants} position={[0, 0.34, 0]}>
            <capsuleGeometry args={[0.058, 0.52, 6, 12]} />
          </mesh>
          <mesh material={m.shoe} position={[0, 0.035, 0.03]} scale={[1, 0.6, 1.5]}>
            <sphereGeometry args={[0.065, 16, 10]} />
          </mesh>
        </group>
      ))}
      {/* туловище */}
      <mesh material={m.shirt} position={[0, 0.86, 0]} scale={[1, 1, 0.72]}>
        <capsuleGeometry args={[0.15, 0.32, 8, 16]} />
      </mesh>
      {/* руки */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={m.shirt} position={[s * 0.2, 0.84, 0.01]} rotation={[0.05, 0, s * 0.1]}>
          <capsuleGeometry args={[0.045, 0.38, 6, 10]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`h${s}`} material={m.skin} position={[s * 0.218, 0.6, 0.02]}>
          <sphereGeometry args={[0.042, 12, 10]} />
        </mesh>
      ))}
      {/* шея и голова */}
      <mesh material={m.skin} position={[0, 1.13, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.08, 12]} />
      </mesh>
      <group position={[0, 1.17, 0]} rotation={[headPitch, headYaw, 0]}>
        <mesh material={m.skin} position={[0, 0.11, 0]} scale={[0.95, 1.05, 1]}>
          <sphereGeometry args={[0.115, 24, 18]} />
        </mesh>
        <mesh material={m.hair} position={[0, 0.145, -0.012]} scale={[1.0, 0.82, 1.0]}>
          <sphereGeometry args={[0.122, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} material={m.skin} position={[s * 0.112, 0.1, 0]} scale={[0.5, 1, 0.8]}>
            <sphereGeometry args={[0.03, 10, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
