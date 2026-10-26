// Геометрический цветок: лепестки-ромбы и «воздушные змеи» в два яруса
// (радиальная симметрия), раскрываются от бутона; в центре — семь
// медовых шестиугольников (1 + 6) — из них вырастут соты.
import { useMemo } from "react";
import * as THREE from "three";
import { lerp, polygonShape, ramp } from "../engines/GeometryWondersEngine";
import { hexagon, kite, rhombus } from "../engines/PatternGenerator";
import { hexToPixel } from "../engines/TessellationEngine";
import { PALETTE } from "../styles/palette";

export const FLOWER = { centerHex: 0.085 };

const extrude = (pts: [number, number][], depth: number) =>
  new THREE.ExtrudeGeometry(polygonShape(pts), { depth, bevelEnabled: true, bevelThickness: depth * 0.4, bevelSize: depth * 0.4, bevelSegments: 1 });

export const GeometryFlower: React.FC<{ t: number; at: readonly [number, number]; position: [number, number, number] }> = ({
  t,
  at,
  position,
}) => {
  const geos = useMemo(
    () => ({
      outer: extrude(rhombus(0.62, 0.3).map(([x, y]) => [x + 0.31, y] as [number, number]), 0.025),
      inner: extrude(kite(0.02, 0.46, 0.13).map(([x, y]) => [x + 0.02, y] as [number, number]), 0.025),
      hex: extrude(hexagon(FLOWER.centerHex * 0.9, Math.PI / 6), 0.03),
      stem: new THREE.CylinderGeometry(0.035, 0.05, 1, 6).translate(0, -0.5, 0),
      leaf: extrude(rhombus(0.5, 0.18).map(([x, y]) => [x + 0.25, y] as [number, number]), 0.02),
    }),
    [],
  );
  const span = at[1] - at[0];
  const grow = ramp(t, at[0], at[0] + span * 0.35, "out");
  if (grow <= 0) return null;
  const petals = (n: number, layer: number) =>
    Array.from({ length: n }, (_, i) => {
      const k = ramp(t, at[0] + span * (0.25 + layer * 0.12 + (i / n) * 0.18), at[0] + span * (0.7 + layer * 0.1), "inOut");
      const open = lerp(1.35, layer ? 0.38 : 0.16, k); // наклон: бутон → раскрыт
      const a = (i / n) * Math.PI * 2 + layer * (Math.PI / n);
      return { a, open, k };
    });
  const centerK = ramp(t, at[0] + span * 0.55, at[0] + span * 0.9, "back");
  const hexes = [[0, 0], [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]].map(([q, r]) => hexToPixel(q, r, FLOWER.centerHex));
  return (
    <group position={position}>
      <mesh geometry={geos.stem} position={[0, 0, 0]} scale={[1, 0.6 * grow, 1]}>
        <meshStandardMaterial color="#2f8a73" flatShading />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} geometry={geos.leaf} position={[0, -0.3 * grow, 0]} rotation={[-Math.PI / 2 + 0.5, 0, i * Math.PI + 0.6]} scale={grow}>
          <meshStandardMaterial color="#45b293" flatShading side={THREE.DoubleSide} />
        </mesh>
      ))}
      <group scale={grow}>
        {petals(10, 0).map(({ a, open }, i) => (
          <group key={`o${i}`} rotation={[0, -a, 0]}>
            <mesh geometry={geos.outer} rotation={[-Math.PI / 2, -open, 0]} castShadow>
              <meshStandardMaterial color={i % 2 ? PALETTE.sky : "#7cc7e6"} flatShading roughness={0.5} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
        {petals(8, 1).map(({ a, open }, i) => (
          <group key={`i${i}`} rotation={[0, -a, 0]} position={[0, 0.03, 0]}>
            <mesh geometry={geos.inner} rotation={[-Math.PI / 2, -open, 0]} castShadow>
              <meshStandardMaterial color={PALETTE.milk} flatShading roughness={0.45} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
        {hexes.map(([x, y], i) => (
          <mesh
            key={`h${i}`}
            geometry={geos.hex}
            position={[x, 0.06, y]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={Math.max(0.001, ramp(centerK, i ? 0.15 + i * 0.08 : 0, i ? 0.6 + i * 0.05 : 0.5, "back"))}
          >
            <meshStandardMaterial color={i ? PALETTE.honey : PALETTE.gold} flatShading roughness={0.45} emissive="#7a4a10" emissiveIntensity={0.25} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
