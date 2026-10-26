// Оригинальный знак «Раскрытие узора»: шесть треугольников — тот самый
// первый треугольник ролика, повторённый радиально, — бирюзовый круг
// в центре и тонкий золотой шестиугольный контур. Не копирует известные
// логотипы и не является религиозным символом.
import { useMemo } from "react";
import * as THREE from "three";
import { arcPath, lerp, polygonShape, ramp, type Vec3 } from "../engines/GeometryWondersEngine";
import { PALETTE } from "../styles/palette";

export const MARK = { center: [0, 1.5, 0.4] as Vec3, r: 0.85 };

export const LogoMark: React.FC<{ t: number; at: readonly [number, number]; fromRadius: number }> = ({ t, at, fromRadius }) => {
  const tri = useMemo(() => {
    const r = MARK.r;
    const a0 = Math.PI / 2;
    const a1 = Math.PI / 2 + Math.PI / 3;
    const pts: [number, number][] = [
      [0, 0],
      [Math.cos(a0) * r, Math.sin(a0) * r],
      [Math.cos(a1) * r, Math.sin(a1) * r],
    ];
    const c: [number, number] = [(pts[1][0] + pts[2][0]) / 3, (pts[1][1] + pts[2][1]) / 3];
    const inset = pts.map(([x, y]) => [c[0] + (x - c[0]) * 0.84, c[1] + (y - c[1]) * 0.84] as [number, number]);
    const g = new THREE.ExtrudeGeometry(polygonShape(inset), { depth: 0.07, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 1 });
    return { g, c };
  }, []);
  const outline = useMemo(() => {
    const v = (i: number) => {
      const a = Math.PI / 2 + (i * Math.PI) / 3;
      return new THREE.Vector3(Math.cos(a) * MARK.r * 1.16, Math.sin(a) * MARK.r * 1.16, 0);
    };
    const pts = Array.from({ length: 6 }, (_, i) => [v(i), v(i + 1)]).flat();
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  const span = at[1] - at[0];
  if (t < at[0]) return null;
  const circleK = ramp(t, at[0] + span * 0.6, at[0] + span, "back");
  const lineK = ramp(t, at[0] + span * 0.55, at[1] + 0.3, "inOut");
  return (
    <group position={MARK.center}>
      {Array.from({ length: 6 }, (_, i) => {
        const k = ramp(t, at[0] + i * span * 0.07, at[0] + span * 0.62 + i * span * 0.07, "inOut");
        // Треугольник прилетает из внешнего кольца орнамента.
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const from: Vec3 = [Math.cos(a) * fromRadius - MARK.center[0], Math.sin(a) * fromRadius - MARK.center[1], -0.4];
        const pos = arcPath(from, [0, 0, 0], k, 0.3);
        return (
          <group key={i} position={pos} rotation={[0, 0, (i * Math.PI) / 3 + (1 - k) * 2.5]} scale={lerp(0.5, 1, k)}>
            <mesh geometry={tri.g}>
              <meshStandardMaterial color={i % 2 ? PALETTE.goldWarm : PALETTE.gold} roughness={0.35} metalness={0.25} flatShading />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0, 0.09]} scale={Math.max(0.001, circleK)}>
        <circleGeometry args={[0.12, 48]} />
        <meshStandardMaterial color={PALETTE.turquoise} roughness={0.4} />
      </mesh>
      <lineSegments geometry={outline} visible={lineK > 0.01}>
        <lineBasicMaterial color={PALETTE.gold} transparent opacity={lineK} />
      </lineSegments>
    </group>
  );
};
