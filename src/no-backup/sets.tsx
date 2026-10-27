import { useMemo } from "react";
import * as THREE from "three";
import { BishkekView, Box } from "./three/sets";
import { useCanvas, useFacade } from "./three/sets2";

// Декорации ролика «Бүгүн жеткире турган киши жок» (метры, пол y = 0).

// ---------------------------------------------------------------- квартира
// Одна квартира утром и вечером: стол (0.2, 0, 0), окно на задней стене
// (z = −1.8), кухня слева сзади, входная дверь на правой стене (x = 2.6,
// проём z 0.25…1.15), у двери — обувная тумба с ключами и крючки.
export const DOOR = { x: 2.6, z0: 0.25, z1: 1.15 } as const;
export const CABINET = { x: 2.33, z: -0.45, top: 0.52 } as const;
export const KEYS_POS = new THREE.Vector3(2.3, CABINET.top + 0.012, -0.1);
export const MOM_BAG_POS = new THREE.Vector3(2.3, CABINET.top, -0.68);

const Rug: React.FC = () => {
  const tex = useCanvas(512, 256, (g) => {
    g.fillStyle = "#B4483C";
    g.fillRect(0, 0, 512, 256);
    g.strokeStyle = "#F1D7A6";
    g.lineWidth = 10;
    g.strokeRect(18, 18, 476, 220);
    g.fillStyle = "#2E4E7E";
    for (let i = 0; i < 4; i++) {
      const cx = 96 + i * 106;
      g.beginPath();
      g.moveTo(cx, 70);
      g.lineTo(cx + 40, 128);
      g.lineTo(cx, 186);
      g.lineTo(cx - 40, 128);
      g.closePath();
      g.fill();
    }
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.9, 0.004, 1.1]} receiveShadow>
      <planeGeometry args={[2.2, 1.1]} />
      <meshStandardMaterial map={tex} roughness={0.95} />
    </mesh>
  );
};

export const Door: React.FC<{ hinge: [number, number, number]; open: number; width?: number; color?: string; rotY?: number }> = ({ hinge, open, width = 0.9, color = "#7A5A44", rotY = 0 }) => (
  <group position={hinge} rotation={[0, rotY - open, 0]}>
    <Box size={[0.05, 2.05, width]} pos={[0, 1.025, -width / 2]} color={color} rough={0.55} radius={0.01} />
    <Box size={[0.03, 0.03, 0.14]} pos={[-0.045, 1.0, -width + 0.1]} color="#C9CCD2" metal={0.7} rough={0.3} radius={0.01} />
    <Box size={[0.03, 0.03, 0.14]} pos={[0.045, 1.0, -width + 0.1]} color="#C9CCD2" metal={0.7} rough={0.3} radius={0.01} />
  </group>
);

// Точка ручки двери квартиры (изнутри) при угле open.
export const doorHandle = (open: number) =>
  new THREE.Vector3(-0.05, 1.0, -0.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), -open).add(new THREE.Vector3(DOOR.x + 0.02, 0, DOOR.z1));

export const Apartment: React.FC<{ evening?: boolean; doorOpen?: number; keys?: boolean; bag?: boolean }> = ({ evening = false, doorOpen = 0, keys = true, bag = true }) => {
  const wall = evening ? "#E8DCCB" : "#EFE7DB";
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#B08B66" roughness={0.75} />
      </mesh>
      <Rug />
      {/* задняя стена с окном (x 0.45…1.95, y 0.95…2.25) */}
      <Box size={[4.45, 2.8, 0.15]} pos={[-1.775, 1.4, -1.8]} color={wall} radius={0} />
      <Box size={[0.65, 2.8, 0.15]} pos={[2.275, 1.4, -1.8]} color={wall} radius={0} />
      <Box size={[1.5, 0.95, 0.15]} pos={[1.2, 0.475, -1.8]} color={wall} radius={0} />
      <Box size={[1.5, 0.55, 0.15]} pos={[1.2, 2.525, -1.8]} color={wall} radius={0} />
      <group position={[1.2, 0, -1.72]}>
        <Box size={[1.5, 0.08, 0.12]} pos={[0, 0.95, 0]} color="#F4F1EC" radius={0.01} />
        <Box size={[1.5, 0.08, 0.12]} pos={[0, 2.25, 0]} color="#F4F1EC" radius={0.01} />
        {[-0.75, 0, 0.75].map((x) => (
          <Box key={x} size={[0.07, 1.36, 0.12]} pos={[x, 1.6, 0]} color="#F4F1EC" radius={0.01} />
        ))}
      </group>
      {/* левая стена */}
      <Box size={[0.15, 2.8, 7]} pos={[-2.4, 1.4, 1.5]} color={evening ? "#E2D2BD" : "#E9DFD0"} radius={0} />
      {/* правая стена с проёмом входной двери (z 0.25…1.15) */}
      <Box size={[0.15, 2.8, 2.05]} pos={[DOOR.x + 0.075, 1.4, -0.775]} color={wall} radius={0} />
      <Box size={[0.15, 2.8, 2.8]} pos={[DOOR.x + 0.075, 1.4, 2.55]} color={wall} radius={0} />
      <Box size={[0.15, 0.75, 0.9]} pos={[DOOR.x + 0.075, 2.425, 0.7]} color={wall} radius={0} />
      <Box size={[0.08, 2.1, 0.06]} pos={[DOOR.x - 0.02, 1.05, DOOR.z0 - 0.03]} color="#F4F1EC" radius={0.01} />
      <Box size={[0.08, 2.1, 0.06]} pos={[DOOR.x - 0.02, 1.05, DOOR.z1 + 0.03]} color="#F4F1EC" radius={0.01} />
      <Box size={[0.08, 0.06, 1.0]} pos={[DOOR.x - 0.02, 2.08, 0.7]} color="#F4F1EC" radius={0.01} />
      {/* лестничная площадка за дверью */}
      <Box size={[0.05, 2.8, 2]} pos={[DOOR.x + 1.6, 1.4, 0.7]} color="#C9C3B6" radius={0} cast={false} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[DOOR.x + 0.8, 0.002, 0.7]}>
        <planeGeometry args={[1.6, 2]} />
        <meshStandardMaterial color="#9A948A" roughness={0.9} />
      </mesh>
      <Door hinge={[DOOR.x + 0.02, 0, DOOR.z1]} open={doorOpen} />
      {/* обувная тумба, ключи, сумка мамы, крючки с одеждой */}
      <Box size={[0.36, CABINET.top, 0.9]} pos={[CABINET.x, CABINET.top / 2, CABINET.z]} color="#F3EEE6" radius={0.015} />
      {keys ? (
        <group position={KEYS_POS}>
          <mesh rotation={[-Math.PI / 2, 0, 0.4]}>
            <torusGeometry args={[0.018, 0.003, 6, 16]} />
            <meshStandardMaterial color="#C9CCD2" metalness={0.8} roughness={0.3} />
          </mesh>
          <Box size={[0.012, 0.004, 0.05]} pos={[0.02, 0, 0.03]} rot={[0, 0.5, 0]} color="#B9BCC2" metal={0.8} rough={0.3} radius={0.001} />
        </group>
      ) : null}
      <mesh position={[2.3, CABINET.top + 0.01, -0.1]}>
        <cylinderGeometry args={[0.07, 0.05, 0.02, 20]} />
        <meshStandardMaterial color="#C9A57E" roughness={0.6} />
      </mesh>
      {bag ? (
        <group position={MOM_BAG_POS} rotation={[0, Math.PI / 2, 0]}>
          <MomBag />
        </group>
      ) : null}
      <Box size={[0.04, 0.04, 0.9]} pos={[DOOR.x - 0.03, 1.72, CABINET.z]} color="#8A6446" radius={0.01} />
      {[-0.25, 0.25].map((dz) => (
        <group key={dz} position={[DOOR.x - 0.12, 1.66, CABINET.z + dz]}>
          <Box size={[0.12, 0.62, 0.36]} pos={[0, -0.3, 0]} color={dz < 0 ? "#3B4150" : "#6B7A8F"} rough={0.9} radius={0.05} />
        </group>
      ))}
      {/* кухня слева сзади */}
      <Box size={[1.9, 0.86, 0.6]} pos={[-1.1, 0.43, -1.45]} color="#F2EDE4" radius={0.02} />
      <Box size={[1.95, 0.04, 0.64]} pos={[-1.1, 0.88, -1.45]} color="#6E5A4B" radius={0.01} />
      <Box size={[1.9, 0.7, 0.35]} pos={[-1.1, 1.95, -1.6]} color="#F2EDE4" radius={0.02} />
      <mesh position={[-1.5, 0.98, -1.45]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.18, 20]} />
        <meshStandardMaterial color="#C9CCD2" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* стол и скатерть */}
      <Box size={[1.4, 0.04, 0.9]} pos={[0.2, 0.74, 0]} color="#F3EEE6" rough={0.9} radius={0.01} />
      <Box size={[1.3, 0.7, 0.8]} pos={[0.2, 0.36, 0]} color="#D9CDBD" rough={0.9} radius={0.02} />
      <mesh position={[-0.38, 0.83, 0.22]} castShadow>
        <sphereGeometry args={[0.09, 20, 14]} />
        <meshStandardMaterial color="#3E6F9E" roughness={0.35} />
      </mesh>
      {/* лампа над столом */}
      <mesh position={[0.2, 2.0, 0]}>
        <coneGeometry args={[0.22, 0.18, 24, 1, true]} />
        <meshStandardMaterial color="#E9A75B" side={THREE.DoubleSide} emissive="#FFB766" emissiveIntensity={evening ? 0.7 : 0.05} />
      </mesh>
      <mesh position={[0.2, 2.45, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.8, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* фото в рамке и полка на левой стене */}
      <Box size={[0.04, 0.42, 0.56]} pos={[-2.31, 1.6, 0.6]} color="#8A6446" radius={0.01} />
      <Box size={[0.02, 0.34, 0.48]} pos={[-2.29, 1.6, 0.6]} color="#D8E4EE" radius={0.005} />
      <mesh position={[0, 2.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#F4EEE6" side={THREE.DoubleSide} />
      </mesh>
      <BishkekView z={-1.9} evening={evening ? 1 : 0} rotY={Math.PI} />
    </group>
  );
};

export const MomBag: React.FC = () => (
  <group>
    <Box size={[0.32, 0.22, 0.12]} pos={[0, 0.11, 0]} color="#7A4E36" rough={0.55} radius={0.03} />
    <mesh position={[0, 0.22, 0]} castShadow>
      <torusGeometry args={[0.07, 0.009, 8, 24, Math.PI]} />
      <meshStandardMaterial color="#5E3B28" roughness={0.6} />
    </mesh>
  </group>
);

// Сумка, висящая в руке: начало координат — точка хвата (верх ручки).
export const MomBagHanging: React.FC = () => (
  <group position={[0, -0.3, 0]}>
    <MomBag />
  </group>
);

// ---------------------------------------------------------------- бабушка
// Комната бабушки: ковёр-шырдак на стене, диван, столик с чаем, окно.
// Диван у задней стены (z = −1), бабушка сидит в (0, 0, −0.55).
export const GrannyRoom: React.FC = () => {
  const shyrdak = useCanvas(512, 384, (g) => {
    g.fillStyle = "#9C2F2F";
    g.fillRect(0, 0, 512, 384);
    g.strokeStyle = "#F0C35A";
    g.lineWidth = 12;
    g.strokeRect(20, 20, 472, 344);
    g.fillStyle = "#F0C35A";
    const horn = (cx: number, cy: number, s: number) => {
      g.beginPath();
      g.moveTo(cx, cy + s);
      g.bezierCurveTo(cx - s * 1.4, cy + s * 0.2, cx - s * 1.2, cy - s, cx - s * 0.3, cy - s * 0.6);
      g.bezierCurveTo(cx - s * 0.7, cy - s * 0.1, cx - s * 0.2, cy + s * 0.2, cx, cy + s * 0.5);
      g.bezierCurveTo(cx + s * 0.2, cy + s * 0.2, cx + s * 0.7, cy - s * 0.1, cx + s * 0.3, cy - s * 0.6);
      g.bezierCurveTo(cx + s * 1.2, cy - s, cx + s * 1.4, cy + s * 0.2, cx, cy + s);
      g.fill();
    };
    horn(256, 190, 70);
    horn(110, 110, 34);
    horn(402, 110, 34);
    horn(110, 280, 34);
    horn(402, 280, 34);
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#A07C5B" roughness={0.8} />
      </mesh>
      <Box size={[6, 2.8, 0.15]} pos={[0, 1.4, -1.3]} color="#E9E0CF" radius={0} />
      <Box size={[0.15, 2.8, 5]} pos={[-1.9, 1.4, 0.5]} color="#E3D8C5" radius={0} />
      <mesh position={[0, 1.62, -1.21]}>
        <planeGeometry args={[1.9, 1.3]} />
        <meshStandardMaterial map={shyrdak} roughness={0.95} />
      </mesh>
      {/* диван */}
      <Box size={[1.8, 0.42, 0.75]} pos={[0, 0.21, -0.75]} color="#6F5B7E" rough={0.9} radius={0.06} />
      <Box size={[1.8, 0.5, 0.2]} pos={[0, 0.62, -1.08]} color="#6F5B7E" rough={0.9} radius={0.06} />
      {[-0.95, 0.95].map((x) => (
        <Box key={x} size={[0.18, 0.62, 0.75]} pos={[x, 0.31, -0.75]} color="#5F4C6E" rough={0.9} radius={0.06} />
      ))}
      {/* подушка */}
      <Box size={[0.4, 0.34, 0.12]} pos={[-0.62, 0.6, -0.92]} rot={[-0.3, 0.2, 0.1]} color="#E3B14D" rough={0.9} radius={0.05} />
      {/* столик с чайником и пиалой */}
      <Box size={[0.9, 0.04, 0.5]} pos={[0.1, 0.48, 0.1]} color="#8A6446" rough={0.6} radius={0.01} />
      {[
        [-0.3, -0.12],
        [0.5, -0.12],
        [-0.3, 0.32],
        [0.5, 0.32],
      ].map(([x, z]) => (
        <Box key={`${x}${z}`} size={[0.04, 0.46, 0.04]} pos={[x, 0.23, z]} color="#6E4F37" radius={0.008} />
      ))}
      <mesh position={[0.3, 0.57, 0.08]} castShadow>
        <sphereGeometry args={[0.08, 20, 14]} />
        <meshStandardMaterial color="#F2F2F0" roughness={0.3} />
      </mesh>
      <mesh position={[0.36, 0.6, 0.08]} rotation={[0, 0, -0.9]} castShadow>
        <cylinderGeometry args={[0.012, 0.016, 0.1, 10]} />
        <meshStandardMaterial color="#F2F2F0" roughness={0.3} />
      </mesh>
      <mesh position={[0.02, 0.525, 0.16]} castShadow>
        <cylinderGeometry args={[0.042, 0.028, 0.045, 20]} />
        <meshStandardMaterial color="#2F6FA8" roughness={0.3} />
      </mesh>
      {/* папка с медкартой и сумка — бабушка собирается к врачу */}
      <Box size={[0.22, 0.012, 0.3]} pos={[-0.18, 0.506, 0.12]} rot={[0, 0.25, 0]} color="#4E8F6E" radius={0.003} />
      <group position={[0.62, 0.42, -0.8]} rotation={[0, -0.3, 0]}>
        <Box size={[0.26, 0.2, 0.1]} pos={[0, 0.1, 0]} color="#3E2E28" rough={0.55} radius={0.03} />
      </group>
      {/* окно справа */}
      <Box size={[0.15, 2.8, 5]} pos={[1.9, 1.4, 0.5]} color="#E3D8C5" radius={0} />
      <mesh position={[1.82, 1.55, 0.1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 1.2]} />
        <meshBasicMaterial color="#D9ECFA" toneMapped={false} />
      </mesh>
      <Box size={[0.06, 1.3, 0.06]} pos={[1.8, 1.55, 0.1]} color="#F4F1EC" radius={0.01} />
      <mesh position={[0, 2.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#F4EEE6" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- машина
// Машина мамы (серо-голубой хэтчбек, обычный личный автомобиль). Начало
// координат — центр машины на земле, перёд — +z, левый борт — +x.
// rearDoor — открытие задней правой двери (0…1).
export const MOM_CAR_COLOR = "#8C9CB0";
export const MomCar: React.FC<{ pos: [number, number, number]; rotY?: number; rearDoor?: number; brake?: number }> = ({ pos, rotY = 0, rearDoor = 0, brake = 0 }) => {
  const c = MOM_CAR_COLOR;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <Box size={[1.74, 0.55, 4.0]} pos={[0, 0.6, 0]} color={c} rough={0.3} metal={0.35} radius={0.16} />
      <Box size={[1.62, 0.5, 2.3]} pos={[0, 1.08, -0.25]} color="#1D2633" rough={0.12} metal={0.4} radius={0.17} />
      <Box size={[1.52, 0.06, 2.0]} pos={[0, 1.33, -0.3]} color={c} rough={0.3} metal={0.35} radius={0.03} />
      {/* стойки */}
      {[-1, 1].map((s) => (
        <Box key={s} size={[0.04, 0.48, 0.07]} pos={[s * 0.8, 1.08, -0.25]} color={c} rough={0.3} metal={0.35} radius={0.01} />
      ))}
      {[
        [-0.82, 1.3],
        [0.82, 1.3],
        [-0.82, -1.3],
        [0.82, -1.3],
      ].map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0.32, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.22, 24]} />
            <meshStandardMaterial color="#1A1B1F" roughness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[x > 0 ? 0.112 : -0.112, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.01, 20]} />
            <meshStandardMaterial color="#B9BEC6" metalness={0.7} roughness={0.35} />
          </mesh>
        </group>
      ))}
      {[-0.6, 0.6].map((x) => (
        <group key={x}>
          <Box size={[0.34, 0.1, 0.04]} pos={[x, 0.7, 2.0]} color="#F4F6F8" emissive="#FFFFFF" emissiveIntensity={0.3} radius={0.02} cast={false} />
          <Box size={[0.34, 0.1, 0.04]} pos={[x, 0.74, -2.0]} color="#B3282D" emissive="#FF2A2A" emissiveIntensity={0.4 + brake * 2.2} radius={0.02} cast={false} />
        </group>
      ))}
      {/* номер (без надписей) */}
      <Box size={[0.5, 0.11, 0.02]} pos={[0, 0.5, 2.01]} color="#F4F4F2" radius={0.01} cast={false} />
      <Box size={[0.5, 0.11, 0.02]} pos={[0, 0.55, -2.01]} color="#F4F4F2" radius={0.01} cast={false} />
      {/* ручки дверей */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box size={[0.03, 0.03, 0.14]} pos={[s * 0.875, 0.82, 0.35]} color="#C9CCD2" metal={0.7} rough={0.3} radius={0.01} />
          {s > 0 ? <Box size={[0.03, 0.03, 0.14]} pos={[s * 0.875, 0.82, -0.75]} color="#C9CCD2" metal={0.7} rough={0.3} radius={0.01} /> : null}
        </group>
      ))}
      {/* задняя правая дверь: петля у переднего края (z = −0.2) */}
      <group position={[-0.87, 0, -0.2]} rotation={[0, -rearDoor * 1.1, 0]}>
        <Box size={[0.05, 0.6, 0.95]} pos={[0, 0.66, -0.475]} color={c} rough={0.3} metal={0.35} radius={0.02} />
        <Box size={[0.03, 0.42, 0.85]} pos={[0, 1.13, -0.45]} color="#1D2633" rough={0.12} metal={0.4} radius={0.02} />
        <Box size={[0.03, 0.03, 0.14]} pos={[-0.03, 0.82, -0.8]} color="#C9CCD2" metal={0.7} rough={0.3} radius={0.01} />
        <Box size={[0.03, 0.55, 0.9]} pos={[0.03, 0.75, -0.47]} color="#3B3F48" rough={0.9} radius={0.02} />
      </group>
      {rearDoor > 0.02 ? (
        <>
          {/* проём: видно заднее сиденье */}
          <Box size={[0.02, 0.56, 0.9]} pos={[-0.86, 0.72, -0.65]} color="#2A2D33" rough={0.9} radius={0.01} cast={false} />
          <Box size={[0.6, 0.12, 0.5]} pos={[-0.5, 0.52, -0.7]} color="#3B3F48" radius={0.04} />
        </>
      ) : null}
    </group>
  );
};

// Заднее сиденье (к салону CarInterior): сиденье водителя — (0, 0, 0),
// заднее правое место — (−0.72, 0, −0.85).
export const REAR_SEAT = new THREE.Vector3(-0.72, 0, -0.88);
export const RearSeat: React.FC = () => (
  <group>
    <Box size={[1.4, 0.13, 0.5]} pos={[-0.37, 0.32, -0.88]} color="#3B3F48" radius={0.05} />
    <Box size={[1.4, 0.65, 0.12]} pos={[-0.37, 0.7, -1.18]} rot={[-0.18, 0, 0]} color="#3B3F48" radius={0.05} />
    {[-0.72, 0.0].map((x) => (
      <Box key={x} size={[0.24, 0.18, 0.1]} pos={[x, 1.12, -1.27]} rot={[-0.15, 0, 0]} color="#3B3F48" radius={0.04} />
    ))}
    <Box size={[0.08, 0.55, 1.0]} pos={[-1.12, 0.66, -0.75]} color="#3B3F48" radius={0.03} />
    <Box size={[1.62, 0.05, 1.4]} pos={[-0.37, 1.55, -0.8]} color="#C9C5BE" radius={0.02} />
    {/* замок ремня */}
    <Box size={[0.035, 0.07, 0.03]} pos={[-0.47, 0.42, -0.86]} color="#1C1E22" radius={0.008} />
  </group>
);

// Ремень безопасности: лента из точек (по сегментам).
export const Belt: React.FC<{ pts: THREE.Vector3[]; w?: number }> = ({ pts, w = 0.045 }) => (
  <>
    {pts.slice(1).map((b, i) => {
      const a = pts[i];
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const len = a.distanceTo(b);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      return (
        <mesh key={i} position={mid} quaternion={q}>
          <boxGeometry args={[w, len, 0.006]} />
          <meshStandardMaterial color="#26282D" roughness={0.8} />
        </mesh>
      );
    })}
  </>
);

// ---------------------------------------------------------------- подъезд
// Девятиэтажка: подъезд в (0, 0, 0), фасад в плоскости z = 0, двор и
// парковка — к +z (машина мамы у бордюра, z ≈ 4.2).
export const Entrance: React.FC<{ doorOpen: number }> = ({ doorOpen }) => {
  const facade = useFacade(51, 9, 6, "#E2DDD3");
  const trees = useMemo(() => [-6.5, -3.6, 4.2, 7.0].map((x, i) => ({ x, z: 2.2 + (i % 2) * 0.5, s: 0.9 + (i % 3) * 0.15 })), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 6]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#A6A39C" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 4.8]} receiveShadow>
        <planeGeometry args={[40, 3]} />
        <meshStandardMaterial color="#5A5D63" roughness={0.9} />
      </mesh>
      {/* бордюр */}
      <Box size={[40, 0.12, 0.15]} pos={[0, 0.06, 3.25]} color="#C9C5BC" radius={0.01} />
      {/* здание */}
      <mesh position={[0, 13.5, -6]} castShadow receiveShadow>
        <boxGeometry args={[30, 27, 12]} />
        <meshStandardMaterial attach="material-0" color="#E2DDD3" />
        <meshStandardMaterial attach="material-1" color="#E2DDD3" />
        <meshStandardMaterial attach="material-2" color="#A9A59E" />
        <meshStandardMaterial attach="material-3" color="#E2DDD3" />
        <meshStandardMaterial attach="material-4" map={facade} roughness={0.9} />
        <meshStandardMaterial attach="material-5" color="#E2DDD3" />
      </mesh>
      {/* вход: тамбур, дверь, козырёк, ступень */}
      <Box size={[2.4, 2.9, 0.4]} pos={[0, 1.45, 0.15]} color="#D6CFC2" radius={0.01} />
      <Door hinge={[-0.5, 0, 0.36]} open={doorOpen} width={1.0} color="#5B6E5E" rotY={-Math.PI / 2} />
      <Box size={[3.0, 0.12, 1.6]} pos={[0, 2.95, 0.9]} color="#C2B8A6" radius={0.02} />
      <Box size={[2.2, 0.14, 1.1]} pos={[0, 0.07, 0.9]} color="#B8B2A6" radius={0.01} />
      {/* лавочка и деревья */}
      <group position={[-2.2, 0, 1.4]}>
        <Box size={[1.5, 0.05, 0.4]} pos={[0, 0.45, 0]} color="#9C6E48" radius={0.01} />
        <Box size={[1.5, 0.3, 0.05]} pos={[0, 0.65, -0.18]} color="#9C6E48" radius={0.01} />
        {[-0.65, 0.65].map((x) => (
          <Box key={x} size={[0.06, 0.45, 0.36]} pos={[x, 0.225, 0]} color="#3D3F45" radius={0.01} />
        ))}
      </group>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 2.2, 10]} />
            <meshStandardMaterial color="#6B5443" roughness={1} />
          </mesh>
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} position={[Math.cos(k * 1.7) * 0.4, 2.5 + (k % 2) * 0.4, Math.sin(k * 1.7) * 0.4]} castShadow>
              <icosahedronGeometry args={[0.75, 1]} />
              <meshStandardMaterial color={k % 2 ? "#C9A24A" : "#7FAE63"} roughness={1} flatShading />
            </mesh>
          ))}
        </group>
      ))}
      <BishkekView z={-60} rotY={Math.PI} />
    </group>
  );
};

// ---------------------------------------------------------------- офис
// Напольная вешалка: стойка, крючки. Начало координат — основание.
export const CoatRack: React.FC<{ pos: [number, number, number] }> = ({ pos }) => (
  <group position={pos}>
    <mesh position={[0, 0.88, 0]} castShadow>
      <cylinderGeometry args={[0.018, 0.022, 1.76, 12]} />
      <meshStandardMaterial color="#5A4636" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.02, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.22, 0.04, 24]} />
      <meshStandardMaterial color="#5A4636" roughness={0.6} />
    </mesh>
    {[0, 1, 2, 3].map((k) => (
      <mesh key={k} position={[Math.sin((k * Math.PI) / 2) * 0.07, 1.7, Math.cos((k * Math.PI) / 2) * 0.07]} rotation={[Math.cos((k * Math.PI) / 2) * 0.9, 0, -Math.sin((k * Math.PI) / 2) * 0.9]}>
        <cylinderGeometry args={[0.008, 0.008, 0.14, 8]} />
        <meshStandardMaterial color="#5A4636" roughness={0.6} />
      </mesh>
    ))}
  </group>
);

// Жилет мамы, висящий за ворот: начало координат — точка подвеса.
export const GiletHanging: React.FC = () => (
  <group>
    <Box size={[0.4, 0.58, 0.07]} pos={[0, -0.32, 0]} color="#B98A5E" rough={0.9} radius={0.03} />
    <Box size={[0.14, 0.08, 0.075]} pos={[0, -0.04, 0]} color="#A57A51" rough={0.9} radius={0.02} />
    <Box size={[0.008, 0.5, 0.075]} pos={[0, -0.33, 0.001]} color="#8E6A47" radius={0.002} />
  </group>
);
