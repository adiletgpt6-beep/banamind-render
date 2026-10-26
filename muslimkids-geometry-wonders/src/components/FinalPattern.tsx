// Оригинальный радиальный орнамент (12-кратная симметрия) из объёмных
// плоских фигур: звезда, «воздушные змеи», шестиугольники, треугольники,
// ромбы, длинные лучи и тонкие кольца. Каждый ярус — один InstancedMesh.
// Фигуры прилетают по спирали к своим местам (Geometry Rearrangement),
// ярусы медленно вращаются в разные стороны, затем останавливаются
// и раздвигаются, освобождая центр для текста.
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clamp, lerp, mixHex, polygonShape, ramp, type Vec2 } from "../engines/GeometryWondersEngine";
import { hexagon, kite, radial, rhombus, starPolygon } from "../engines/PatternGenerator";
import { PALETTE } from "../styles/palette";

const BIG = 1.32; // крупнее фигуры — плотнее и читаемее композиция
const extrude = (pts: Vec2[], depth = 0.06) =>
  new THREE.ExtrudeGeometry(polygonShape(pts.map(([x, y]) => [x * BIG, y * BIG] as Vec2)), { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 1 });

export type Tier = {
  id: string;
  geo: THREE.BufferGeometry;
  count: number;
  radius: number;
  phase: number;
  colors: string[];
  orient: number; // поворот фигуры относительно радиуса
  spin: number; // скорость вращения яруса (рад/с), знак — направление
  inner: boolean; // внутренние ярусы раздвигаются для Земли/текста
  bloomAt: number; // доля окна раскрытия
};

export function buildTiers(): Tier[] {
  return [
    { id: "star", geo: extrude(starPolygon(12, 0.6, 0.4)), count: 1, radius: 0, phase: 0, colors: [PALETTE.gold], orient: 0, spin: 0.05, inner: true, bloomAt: 0 },
    { id: "kites", geo: extrude(kite(0.18, 0.3, 0.12)), count: 12, radius: 0.86, phase: 0, colors: [PALETTE.turquoise], orient: 0, spin: -0.07, inner: true, bloomAt: 0.08 },
    { id: "hexB", geo: extrude(hexagon(0.2, 0)), count: 12, radius: 1.38, phase: 0, colors: [PALETTE.royal, PALETTE.sky], orient: 0, spin: 0.05, inner: true, bloomAt: 0.18 },
    { id: "triB", geo: extrude([[0.13, 0], [-0.08, 0.11], [-0.08, -0.11]]), count: 12, radius: 1.3, phase: Math.PI / 12, colors: [PALETTE.gold], orient: 0, spin: 0.05, inner: true, bloomAt: 0.24 },
    { id: "rhC", geo: extrude(rhombus(0.42, 0.2)), count: 24, radius: 1.88, phase: 0, colors: [PALETTE.emerald, PALETTE.turquoise], orient: 0, spin: -0.04, inner: false, bloomAt: 0.34 },
    { id: "rays", geo: extrude(kite(0.12, 0.5, 0.13)), count: 12, radius: 2.42, phase: 0, colors: [PALETTE.milk], orient: 0, spin: 0.03, inner: false, bloomAt: 0.46 },
    { id: "hexD", geo: extrude(hexagon(0.17, Math.PI / 6)), count: 12, radius: 2.38, phase: Math.PI / 12, colors: [PALETTE.gold], orient: 0, spin: 0.03, inner: false, bloomAt: 0.52 },
    { id: "triE", geo: extrude([[0.1, 0], [-0.06, 0.085], [-0.06, -0.085]]), count: 36, radius: 3.0, phase: 0, colors: [PALETTE.gold, PALETTE.turquoise, PALETTE.gold], orient: Math.PI, spin: -0.02, inner: false, bloomAt: 0.62 },
  ];
}

export const RING_RADII = [1.1, 2.12, 2.72, 3.2];

export type OrnamentState = {
  bloom: number; // 0…1 сборка
  rotT: number; // «время вращения» (интеграл скорости — плавная остановка)
  part: number; // 0…1 внутренние ярусы раздвигаются (Земля в центре)
  open: number; // 0…1 освобождение центра под текст
  dim: number; // 0…1 приглушение (под логотип)
  fade: (tier: Tier) => number; // индивидуальная прозрачность (0…1)
};

const m = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const p = new THREE.Vector3();
const s = new THREE.Vector3();

export const FinalPattern: React.FC<{ state: OrnamentState }> = ({ state }) => {
  const tiers = useMemo(buildTiers, []);
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const night = new THREE.Color(PALETTE.night);
  useLayoutEffect(() => {
    tiers.forEach((tier, ti) => {
      const mesh = refs.current[ti];
      if (!mesh) return;
      const vis = state.fade(tier);
      const kRaw = clamp((state.bloom - tier.bloomAt) / 0.38);
      const k = ramp(kRaw, 0, 1, "inOut");
      const spread = tier.inner ? 1 + 0.32 * state.part + 0.5 * state.open : 1 + 0.42 * state.open;
      radial(tier.count, tier.radius, tier.phase).forEach(({ i, angle }) => {
        // Спираль: фигура приходит снаружи, доворачиваясь к радиусу.
        const a = angle + tier.spin * state.rotT + (1 - k) * 1.1;
        const r = tier.radius * spread * lerp(1.9, 1, k);
        p.set(Math.cos(a) * r, Math.sin(a) * r, lerp(1.2, 0, k));
        e.set(0, 0, a + tier.orient + (1 - k) * 2.2);
        q.setFromEuler(e);
        const shrink = tier.id === "star" ? 1 - state.part : 1;
        const sc = k * shrink * (vis > 0.01 ? 1 : 0);
        s.set(sc, sc, sc);
        m.compose(p, q, s);
        mesh.setMatrixAt(i, m);
        const base = mixHex(tier.colors[i % tier.colors.length], tier.id === "kites" ? PALETTE.sky : tier.colors[i % tier.colors.length], state.part);
        mesh.setColorAt(i, base.lerp(night, clamp(1 - vis + state.dim * 0.7)));
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  });
  const ringK = ramp(state.bloom, 0.55, 1);
  const discK = ramp(state.bloom, 0, 0.5) * (1 - state.dim * 0.5);
  return (
    <group>
      {/* Медальон: спокойный тёмный круг отделяет орнамент от фона. */}
      <mesh position={[0, 0, -0.2]} scale={(1 + 0.42 * state.open) * discK} visible={discK > 0.01}>
        <circleGeometry args={[3.42, 96]} />
        <meshBasicMaterial color="#0c2140" transparent opacity={0.88} />
      </mesh>
      {tiers.map((tier, ti) => (
        <instancedMesh
          key={tier.id}
          ref={(r) => {
            refs.current[ti] = r;
          }}
          args={[tier.geo, undefined, tier.count]}
          frustumCulled={false}
        >
          <meshStandardMaterial roughness={0.38} metalness={0.22} flatShading />
        </instancedMesh>
      ))}
      {RING_RADII.map((r, i) => {
        const inner = r < 1.5;
        const spread = inner ? 1 + 0.32 * state.part + 0.5 * state.open : 1 + 0.42 * state.open;
        const op = ringK * (inner ? 1 - state.open : 1) * (1 - state.dim * 0.6);
        return (
          <mesh key={r} scale={spread} visible={op > 0.01}>
            <torusGeometry args={[r, 0.014, 6, 160]} />
            <meshBasicMaterial color={PALETTE.gold} transparent opacity={op * 0.85} />
          </mesh>
        );
      })}
    </group>
  );
};
