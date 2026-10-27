// Детальная увеличенная модель растительной (палисадной) клетки:
// клеточная стенка, мембрана, крупная центральная вакуоль, хлоропласты
// с гранами вдоль стенки (медленно движутся — круговое движение
// цитоплазмы), ядро с ядрышком, митохондрии.
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import { chloroMaterial, glass } from "../materials/cell";
import { PALETTE } from "../engines/LightingSystem";
import { mulberry32 } from "../utils/random";
import type { Cell } from "../engines/LayerDiscoveryEngine";
import type { DirectorState } from "../engines/InfiniteWonderDirector";

const R = 0.034;
const L = 0.1;

/** Точки для подписей (в координатах клетки). */
export const CELL_ANCHORS = {
  wall: new Vector3(R * 0.98, L * 0.32, R * 0.15),
  chloroplast: new Vector3(-R * 0.62, -L * 0.12, R * 0.5),
  vacuole: new Vector3(0, -L * 0.32, R * 0.3),
  nucleus: new Vector3(R * 0.5, L * 0.18, R * 0.55),
};

export const PlantCell: React.FC<{ st: DirectorState; cell: Cell; fade: number }> = ({ st, cell, fade }) => {
  const k = st.discovery.cellDetail;
  const mats = useMemo(
    () => ({
      wall: glass("#BFE8C6", "#E9FBEA", 0.42, 1.6),
      membrane: glass("#E9F7DF", "#FFFFFF", 0.12, 2.5),
      vacuole: glass(PALETTE.sky, "#E1F4FC", 0.28, 1.4),
      nucleus: glass(PALETTE.gold, "#FFF2CF", 0.75, 1.5),
      nucleolus: glass(PALETTE.brown, "#E8C99A", 0.9, 1.5),
      mito: glass("#E9A15A", "#FFE1BC", 0.85, 1.5),
      chl: chloroMaterial(),
    }),
    [],
  );
  const chl = useMemo(() => {
    const rnd = mulberry32(17);
    return Array.from({ length: 22 }, (_, i) => ({
      a: (i / 22) * Math.PI * 2 * 3.1 + rnd() * 0.4,
      h: -L * 0.62 + (i / 21) * L * 1.24 + (rnd() - 0.5) * 0.008,
      r: 0.79 + rnd() * 0.05,
      tilt: rnd() * Math.PI,
    }));
  }, []);

  // Простая клетка исчезает, детальная проявляется (уровень детализации).
  const op = k * fade;
  mats.wall.uniforms.uOpacity.value = 0.42 * op + 0.3 * (1 - k) * fade;
  mats.membrane.uniforms.uOpacity.value = 0.12 * op;
  mats.vacuole.uniforms.uOpacity.value = 0.28 * op;
  mats.nucleus.uniforms.uOpacity.value = 0.75 * op;
  mats.nucleolus.uniforms.uOpacity.value = 0.9 * op;
  mats.mito.uniforms.uOpacity.value = 0.85 * op;
  mats.chl.uniforms.uOpacity.value = fade;
  mats.chl.uniforms.uGrana.value = 0.4 + 0.6 * k;
  // Круговое движение цитоплазмы: хлоропласты медленно плывут вдоль стенки.
  const stream = st.t * 0.22;
  const up = new Vector3(0, 1, 0);
  const sc = cell.size.x / R;

  return (
    <group position={cell.pos} scale={[sc, cell.size.y / L, sc]}>
      <mesh material={mats.wall} renderOrder={26}>
        <capsuleGeometry args={[R, L, 8, 32]} />
      </mesh>
      {op > 0.001 ? (
        <>
          <mesh material={mats.membrane} scale={0.93} renderOrder={25}>
            <capsuleGeometry args={[R, L, 8, 32]} />
          </mesh>
          <mesh material={mats.vacuole} renderOrder={24}>
            <capsuleGeometry args={[R * 0.6, L * 0.74, 8, 28]} />
          </mesh>
          <mesh material={mats.nucleus} position={[R * 0.52, L * 0.18, R * 0.42]} renderOrder={23}>
            <sphereGeometry args={[R * 0.3, 28, 20]} />
          </mesh>
          <mesh material={mats.nucleolus} position={[R * 0.55, L * 0.2, R * 0.46]} renderOrder={22}>
            <sphereGeometry args={[R * 0.11, 16, 12]} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = i * 1.37 + 0.6 + stream * 0.7;
            return (
              <mesh
                key={i}
                material={mats.mito}
                position={[Math.cos(a) * R * 0.76, -L * 0.45 + i * L * 0.22, Math.sin(a) * R * 0.76]}
                rotation={[0.4 * i, a, 1.1]}
                renderOrder={23}
              >
                <capsuleGeometry args={[R * 0.07, R * 0.2, 4, 10]} />
              </mesh>
            );
          })}
        </>
      ) : null}
      {chl.map((c, i) => {
        const a = c.a + stream * (c.h > 0 ? 1 : 0.8);
        const n = new Vector3(Math.cos(a), 0, Math.sin(a));
        const q = new Quaternion().setFromUnitVectors(up, n).multiply(new Quaternion().setFromAxisAngle(up, c.tilt));
        return (
          <mesh
            key={i}
            material={mats.chl}
            position={n.multiplyScalar(R * c.r).add(new Vector3(0, c.h, 0))}
            quaternion={q}
            scale={[R * 0.36, R * 0.17, R * 0.25]}
            renderOrder={20}
          >
            <sphereGeometry args={[1, 24, 16]} />
          </mesh>
        );
      })}
    </group>
  );
};
