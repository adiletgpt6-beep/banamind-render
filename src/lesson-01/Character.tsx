// Персонажи 3D-урока: ребёнок, сидящий по-турецки, и учитель (стоит, идёт,
// садится на колени). Стиль — мягкие игрушечные формы: капсулы и сферы.
import type { V3 } from "./motion";

type Face = {
  readonly skin: string;
  readonly hair: string;
  readonly mouth: number; // 0..1 — открыт рот
  readonly blink: number; // 0..1 — закрыты глаза
  readonly yaw: number;
  readonly pitch: number;
  readonly radius: number;
  readonly girl?: boolean;
  readonly beard?: boolean;
  readonly cap?: boolean;
};

const Eye: React.FC<{ readonly x: number; readonly y: number; readonly z: number; readonly r: number; readonly blink: number }> = ({ x, y, z, r, blink }) => (
  <group position={[x, y, z]} scale={[1, Math.max(0.08, 1 - 0.95 * blink), 1]}>
    <mesh>
      <sphereGeometry args={[r, 20, 14]} />
      <meshStandardMaterial color="#ffffff" roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, r * 0.7]}>
      <sphereGeometry args={[r * 0.55, 16, 12]} />
      <meshStandardMaterial color="#2a1c12" roughness={0.3} />
    </mesh>
    <mesh position={[r * 0.2, r * 0.25, r * 1.15]}>
      <sphereGeometry args={[r * 0.17, 8, 6]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
    </mesh>
  </group>
);

/** Голова с лицом; центр группы — центр головы. */
const Head: React.FC<Face> = ({ skin, hair, mouth, blink, yaw, pitch, radius: r, girl, beard, cap }) => {
  const nod = -0.07 * mouth;
  return (
    <group rotation={[pitch + nod, yaw, 0]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[r, 40, 28]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      {/* уши */}
      {([-1, 1] as const).map((sx) => (
        <mesh key={sx} position={[sx * r * 0.97, 0, 0]} castShadow>
          <sphereGeometry args={[r * 0.19, 14, 10]} />
          <meshStandardMaterial color={skin} roughness={0.75} />
        </mesh>
      ))}
      {/* волосы: чёлка-шапочка и затылок */}
      <mesh position={[0, r * 0.12, -r * 0.05]} castShadow>
        <sphereGeometry args={[r * 1.06, 40, 20, 0, Math.PI * 2, 0, girl ? 1.2 : 1.1]} />
        <meshStandardMaterial color={hair} roughness={0.9} />
      </mesh>
      <mesh position={[0, -r * 0.08, -r * (girl ? 0.42 : 0.4)]} castShadow>
        <sphereGeometry args={[r * (girl ? 0.96 : 0.9), 32, 20]} />
        <meshStandardMaterial color={hair} roughness={0.9} />
      </mesh>
      {girl ? (
        <mesh position={[r * 0.55, r * 0.85, r * 0.3]} castShadow>
          <sphereGeometry args={[r * 0.17, 14, 10]} />
          <meshStandardMaterial color="#f06a8a" roughness={0.6} />
        </mesh>
      ) : null}
      {cap ? (
        <group position={[0, r * 0.78, -r * 0.1]}>
          <mesh castShadow>
            <cylinderGeometry args={[r * 0.86, r * 0.9, r * 0.42, 32]} />
            <meshStandardMaterial color="#f7f3ea" roughness={0.85} />
          </mesh>
          <mesh position={[0, r * 0.21, 0]}>
            <cylinderGeometry args={[r * 0.86, r * 0.86, 0.01, 32]} />
            <meshStandardMaterial color="#efe9db" roughness={0.9} />
          </mesh>
        </group>
      ) : null}
      {/* глаза, брови, щёки */}
      <Eye x={-r * 0.38} y={r * 0.17} z={r * 0.86} r={r * 0.19} blink={blink} />
      <Eye x={r * 0.38} y={r * 0.17} z={r * 0.86} r={r * 0.19} blink={blink} />
      {([-1, 1] as const).map((sx) => (
        <mesh key={sx} position={[sx * r * 0.38, r * 0.45, r * 0.9]} rotation={[0, 0, sx * 0.12]}>
          <boxGeometry args={[r * 0.3, r * 0.055, r * 0.05]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
      ))}
      {!beard
        ? ([-1, 1] as const).map((sx) => (
            <mesh key={sx} position={[sx * r * 0.6, -r * 0.18, r * 0.72]}>
              <sphereGeometry args={[r * 0.14, 12, 8]} />
              <meshStandardMaterial color="#f29aa0" transparent opacity={0.55} roughness={1} />
            </mesh>
          ))
        : null}
      {/* нос */}
      <mesh position={[0, -r * 0.05, r * 0.98]}>
        <sphereGeometry args={[r * 0.1, 12, 8]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      {beard ? (
        <>
          <mesh position={[0, -r * 0.56, r * 0.42]} scale={[1, 0.6, 0.85]} castShadow>
            <sphereGeometry args={[r * 0.72, 24, 16]} />
            <meshStandardMaterial color="#3a2a1f" roughness={0.95} />
          </mesh>
          <mesh position={[0, -r * 0.3, r * 0.96]}>
            <boxGeometry args={[r * 0.46, r * 0.09, r * 0.1]} />
            <meshStandardMaterial color="#3a2a1f" roughness={0.95} />
          </mesh>
        </>
      ) : null}
      {/* рот: сплющенная сфера, раскрывается по уровню речи */}
      <mesh position={[0, -r * (beard ? 0.46 : 0.4), r * (beard ? 0.99 : 0.93)]} scale={[1 + 0.35 * mouth, 0.17 + 0.95 * mouth, 0.5]}>
        <sphereGeometry args={[r * 0.15, 16, 12]} />
        <meshStandardMaterial color="#8e3137" roughness={0.6} />
      </mesh>
    </group>
  );
};

export type KidProps = {
  readonly position: V3;
  readonly rotationY: number;
  readonly skin: string;
  readonly hair: string;
  readonly shirt: string;
  readonly pants: string;
  readonly girl?: boolean;
  readonly mouth: number;
  readonly blink: number;
  readonly yaw: number;
  readonly pitch: number;
  readonly idle: number; // фаза дыхания
};

/** Ребёнок, сидящий по-турецки лицом к +z (до поворота rotationY). */
export const Kid: React.FC<KidProps> = ({ position, rotationY, skin, hair, shirt, pants, girl, mouth, blink, yaw, pitch, idle }) => {
  const breath = 1 + 0.012 * Math.sin(idle);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* колени и скрещённые голени */}
      <mesh position={[0, 0.1, 0.02]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <capsuleGeometry args={[0.095, 0.24, 6, 14]} />
        <meshStandardMaterial color={pants} roughness={0.95} />
      </mesh>
      {([-1, 1] as const).map((sx) => (
        <mesh key={sx} position={[sx * 0.07, 0.08, 0.14]} rotation={[0, sx * 0.55, Math.PI / 2]} castShadow receiveShadow>
          <capsuleGeometry args={[0.068, 0.3, 6, 14]} />
          <meshStandardMaterial color={pants} roughness={0.95} />
        </mesh>
      ))}
      {([-1, 1] as const).map((sx) => (
        <mesh key={sx} position={[sx * 0.24, 0.065, 0.2]} castShadow>
          <sphereGeometry args={[0.048, 14, 10]} />
          <meshStandardMaterial color={skin} roughness={0.8} />
        </mesh>
      ))}
      {/* корпус */}
      <group scale={[1, breath, 1]}>
        <mesh position={[0, 0.4, 0]} scale={[1, 1, 0.82]} castShadow receiveShadow>
          <capsuleGeometry args={[0.15, 0.22, 8, 20]} />
          <meshStandardMaterial color={shirt} roughness={0.9} />
        </mesh>
        {/* руки на коленях */}
        {([-1, 1] as const).map((sx) => (
          <group key={sx} position={[sx * 0.165, 0.55, 0.02]} rotation={[-0.75, 0, -sx * 0.3]}>
            <mesh position={[0, -0.14, 0]} castShadow>
              <capsuleGeometry args={[0.045, 0.22, 6, 12]} />
              <meshStandardMaterial color={shirt} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.3, 0]} castShadow>
              <sphereGeometry args={[0.05, 14, 10]} />
              <meshStandardMaterial color={skin} roughness={0.8} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.67, 0]}>
          <cylinderGeometry args={[0.05, 0.055, 0.08, 12]} />
          <meshStandardMaterial color={skin} roughness={0.8} />
        </mesh>
        <group position={[0, 0.8, 0]}>
          <Head skin={skin} hair={hair} mouth={mouth} blink={blink} yaw={yaw} pitch={pitch} radius={0.165} girl={girl} />
        </group>
      </group>
    </group>
  );
};

export type TeacherProps = {
  readonly position: V3;
  readonly rotationY: number;
  readonly stand: number; // 1 — стоит, 0 — на коленях
  readonly walk: number; // фаза шага 0..1 (0 — стоит)
  readonly gesture: number; // 0..1 — правая рука указывает на домик
  readonly mouth: number;
  readonly blink: number;
  readonly yaw: number;
  readonly pitch: number;
  readonly idle: number;
};

const SUIT = "#2f4f9e";
const SUIT_DARK = "#263f80";
const SKIN = "#e9b98f";

/** Учитель: синий костюм, белая тюбетейка, борода. Лицом к +z до поворота. */
export const Teacher: React.FC<TeacherProps> = ({ position, rotationY, stand, walk, gesture, mouth, blink, yaw, pitch, idle }) => {
  const root = 0.3 + 0.55 * stand; // высота таза
  const step = walk > 0 && walk < 1 ? Math.sin(walk * Math.PI * 4) : 0;
  const bob = walk > 0 && walk < 1 ? 0.02 * Math.abs(Math.sin(walk * Math.PI * 4)) : 0;
  const breath = 1 + 0.01 * Math.sin(idle);
  const kneel = 1 - stand;
  return (
    <group position={[position[0], position[1] + bob, position[2]]} rotation={[0, rotationY, 0]}>
      {/* ноги стоя (при посадке складываются) */}
      {([-1, 1] as const).map((sx) => (
        <group key={sx} position={[sx * 0.11, root, 0]} rotation={[sx * 0.4 * step, 0, 0]} scale={[1, Math.max(0.02, stand), 1]}>
          <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.085, 0.6, 6, 14]} />
            <meshStandardMaterial color={SUIT_DARK} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.78, 0.04]} castShadow>
            <boxGeometry args={[0.13, 0.07, 0.24]} />
            <meshStandardMaterial color="#1e1a17" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* ноги на коленях: бёдра и ступни позади */}
      <group scale={[1, Math.max(0.02, kneel), 1]}>
        <mesh position={[0, 0.12, 0.1]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <capsuleGeometry args={[0.12, 0.26, 6, 16]} />
          <meshStandardMaterial color={SUIT_DARK} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.09, -0.24]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <capsuleGeometry args={[0.09, 0.26, 6, 16]} />
          <meshStandardMaterial color={SUIT_DARK} roughness={0.9} />
        </mesh>
        {([-1, 1] as const).map((sx) => (
          <mesh key={sx} position={[sx * 0.13, 0.06, -0.42]} castShadow>
            <boxGeometry args={[0.12, 0.08, 0.22]} />
            <meshStandardMaterial color="#1e1a17" roughness={0.6} />
          </mesh>
        ))}
      </group>
      <group position={[0, root, 0]} scale={[1, breath, 1]}>
        {/* пиджак, рубашка, галстук */}
        <mesh position={[0, 0.33, 0]} scale={[1, 1, 0.8]} castShadow receiveShadow>
          <capsuleGeometry args={[0.21, 0.34, 8, 24]} />
          <meshStandardMaterial color={SUIT} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.36, 0.004]} scale={[0.34, 1, 0.82]}>
          <capsuleGeometry args={[0.214, 0.3, 8, 24]} />
          <meshStandardMaterial color="#f8f6f0" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.37, 0.182]}>
          <boxGeometry args={[0.05, 0.26, 0.012]} />
          <meshStandardMaterial color="#1b2f6e" roughness={0.6} />
        </mesh>
        {/* руки: левая покоится, правая указывает на домик */}
        {([-1, 1] as const).map((sx) => {
          const g = sx === 1 ? gesture : 0;
          const rest = stand > 0.5 ? 0.08 + sx * 0.35 * step : -0.55;
          const rx = rest * (1 - g) + (-1.25 + 0.1 * Math.sin(idle * 1.7)) * g - 0.12 * mouth * g;
          const rz = -sx * (0.18 * (1 - g) + 0.55 * g);
          return (
            <group key={sx} position={[sx * 0.25, 0.5, 0]} rotation={[rx, 0, rz]}>
              <mesh position={[0, -0.2, 0]} castShadow>
                <capsuleGeometry args={[0.06, 0.32, 6, 14]} />
                <meshStandardMaterial color={SUIT} roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.4, 0]} rotation={[0.3 * g, 0, 0]} scale={[1, 1.1, 0.7]} castShadow>
                <sphereGeometry args={[0.062, 16, 12]} />
                <meshStandardMaterial color={SKIN} roughness={0.8} />
              </mesh>
            </group>
          );
        })}
        <mesh position={[0, 0.66, 0]}>
          <cylinderGeometry args={[0.06, 0.07, 0.1, 14]} />
          <meshStandardMaterial color={SKIN} roughness={0.8} />
        </mesh>
        <group position={[0, 0.84, 0]}>
          <Head skin={SKIN} hair="#2b1d14" mouth={mouth} blink={blink} yaw={yaw} pitch={pitch} radius={0.2} beard cap />
        </group>
      </group>
    </group>
  );
};
