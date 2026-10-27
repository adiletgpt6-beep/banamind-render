// Увеличенная схема поперечного среза листа: настоящая 3D-геометрия
// клеток в пяти слоях, которые раздвигаются и собираются обратно.
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CapsuleGeometry,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Quaternion,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { shader } from "../materials";
import { chloroMaterial, glass } from "../materials/cell";
import { backdropFragment, dirVertex } from "../shaders/nature";
import {
  BLOCK,
  Cell,
  epidermisCells,
  FOCUS_INDEX,
  palisadeCells,
  spongyCells,
  STOMATA,
} from "../engines/LayerDiscoveryEngine";
import { BLOCK_ON_LEAF, blockTransform } from "../engines/InfiniteJourneyEngine";
import { PALETTE } from "../engines/LightingSystem";
import { mulberry32, vnoise2 } from "../utils/random";
import { PlantCell } from "./PlantCell";
import type { DirectorState } from "../engines/InfiniteWonderDirector";

const up = new Vector3(0, 1, 0);

/** Хлоропласты прилегают к стенке: плоской стороной к ней. */
function chloroplastsFor(cells: Cell[], perCell: number, radial: number, spread: number, seed: number, skip = -1) {
  const rnd = mulberry32(seed);
  const out: Matrix4[] = [];
  cells.forEach((c, ci) => {
    if (ci === skip) return;
    for (let k = 0; k < perCell; k++) {
      const a = (k / perCell) * Math.PI * 2 * 2.618 + rnd() * 0.5;
      const h = (rnd() * 2 - 1) * spread * c.size.y;
      const n = new Vector3(Math.cos(a), 0, Math.sin(a));
      const p = c.pos.clone().add(n.clone().multiplyScalar(radial * c.size.x)).add(new Vector3(0, h, 0));
      const q = new Quaternion().setFromUnitVectors(up, n);
      q.multiply(new Quaternion().setFromAxisAngle(up, rnd() * Math.PI));
      out.push(new Matrix4().compose(p, q, new Vector3(0.0125, 0.006, 0.0085).multiplyScalar(c.size.x / 0.034)));
    }
  });
  return out;
}

function fill(mesh: InstancedMesh | null, mats: Matrix4[]) {
  if (!mesh) return;
  mats.forEach((m, i) => mesh.setMatrixAt(i, m));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}

const cellMatrix = (c: Cell, base: Vector3) =>
  new Matrix4().compose(c.pos, new Quaternion().setFromAxisAngle(up, c.rot), c.size.clone().divide(base));

export const LeafCutaway: React.FC<{ st: DirectorState }> = ({ st }) => {
  const refs = {
    upper: useRef<InstancedMesh>(null),
    lower: useRef<InstancedMesh>(null),
    pal: useRef<InstancedMesh>(null),
    palChl: useRef<InstancedMesh>(null),
    spo: useRef<InstancedMesh>(null),
    spoChl: useRef<InstancedMesh>(null),
  };

  const data = useMemo(() => {
    const upper = epidermisCells("upper");
    const lower = epidermisCells("lower");
    const pal = palisadeCells();
    const spo = spongyCells();
    const box = new RoundedBoxGeometry(1, 1, 1, 3, 0.18);
    const capsule = new CapsuleGeometry(0.034, 0.1, 6, 16);
    // Губчатые клетки — неправильной «бугристой» формы.
    const lumpy = new IcosahedronGeometry(1, 3);
    const lp = lumpy.attributes.position;
    for (let i = 0; i < lp.count; i++) {
      const v = new Vector3(lp.getX(i), lp.getY(i), lp.getZ(i));
      v.multiplyScalar(0.86 + 0.28 * vnoise2(v.x * 1.8 + 3, v.y * 1.8 + v.z, 6));
      lp.setXYZ(i, v.x, v.y, v.z);
    }
    lumpy.computeVertexNormals();
    const ellipsoid = new SphereGeometry(1, 16, 12);
    const palChl = chloroplastsFor(pal, 12, 0.74, 0.32, 3, FOCUS_INDEX);
    const spoChl = chloroplastsFor(spo, 5, 0.7, 0.4, 4);
    return { upper, lower, pal, spo, box, capsule, lumpy, ellipsoid, palChl, spoChl };
  }, []);

  const mats = useMemo(
    () => ({
      cuticle: glass("#FFF6DA", PALETTE.gold, 0.16, 1.5),
      epi: glass("#E3F4E6", "#F7F3E9", 0.34, 2.0),
      pal: glass("#A8DDB0", "#D9F5DD", 0.3, 2.2),
      spo: glass("#BFE6C4", "#E8F8EA", 0.26, 2.2),
      xylem: glass("#7AC5EA", "#CDEFFC", 0.5, 1.6),
      phloem: glass(PALETTE.gold, "#FFF0C8", 0.5, 1.6),
      sheath: glass("#CDEBC4", "#F2FBEF", 0.36, 2.0),
      guard: glass("#7CCB86", "#DDF6DC", 0.6, 1.8),
      chl: chloroMaterial(),
      marker: glass(PALETTE.gold, PALETTE.gold, 1, 1),
      backdrop: shader({
        vertexShader: dirVertex,
        fragmentShader: backdropFragment,
        side: BackSide,
        transparent: true,
        uniforms: { uOpacity: { value: 0 } },
      }),
    }),
    [],
  );

  useLayoutEffect(() => {
    fill(refs.upper.current, data.upper.map((c) => cellMatrix(c, new Vector3(1, 1, 1))));
    fill(refs.lower.current, data.lower.map((c) => cellMatrix(c, new Vector3(1, 1, 1))));
    fill(
      refs.pal.current,
      data.pal.map((c, i) => (i === FOCUS_INDEX ? new Matrix4().makeScale(0, 0, 0) : cellMatrix(c, new Vector3(0.034, 0.1, 0.034)))),
    );
    fill(refs.palChl.current, data.palChl);
    fill(refs.spo.current, data.spo.map((c) => cellMatrix(c, new Vector3(1, 1, 1))));
    fill(refs.spoChl.current, data.spoChl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const tether = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(8 * 3), 3));
    return g;
  }, []);

  const d = st.discovery;
  const vis = Math.max(d.marker, Math.min(1, d.emerge * 8));

  const tr = blockTransform(d.emerge);
  const fade = Math.min(1, d.emerge * 6);
  const setOp = (m: ShaderMaterial, base: number) => (m.uniforms.uOpacity.value = base * fade);
  setOp(mats.cuticle, 0.16);
  setOp(mats.epi, 0.34);
  setOp(mats.pal, 0.3 * (1 - 0.35 * d.cellDetail));
  setOp(mats.spo, 0.26);
  setOp(mats.xylem, 0.5);
  setOp(mats.phloem, 0.5);
  setOp(mats.sheath, 0.36);
  setOp(mats.guard, 0.6);
  setOp(mats.chl, 1 - 0.6 * d.cellDetail);
  mats.marker.uniforms.uOpacity.value = d.marker;
  mats.backdrop.uniforms.uOpacity.value = d.backdrop;

  const ex = BLOCK.explode;
  const e = d.explode;
  const halfX = BLOCK.sizeX / 2;
  const halfZ = BLOCK.sizeZ / 2;

  // «Лупа»: рамка на листе и лучи к увеличенному блоку.
  const corners = [
    [-halfX, -halfZ],
    [halfX, -halfZ],
    [halfX, halfZ],
    [-halfX, halfZ],
  ];
  const onLeaf = new Matrix4().compose(BLOCK_ON_LEAF.pos, BLOCK_ON_LEAF.quat, new Vector3().setScalar(BLOCK_ON_LEAF.scale));
  const tp = tether.attributes.position as BufferAttribute;
  corners.forEach(([x, z], i) => {
    const a = new Vector3(x, BLOCK.sizeY, z).applyMatrix4(onLeaf);
    const b = new Vector3(x, 0, z).applyMatrix4(tr.matrix);
    tp.setXYZ(i * 2, a.x, a.y, a.z);
    tp.setXYZ(i * 2 + 1, b.x, b.y, b.z);
  });
  tp.needsUpdate = true;
  const tetherOp = d.marker * Math.min(1, d.emerge * 4) * (1 - d.explode);

  const bundleY = BLOCK.bundle.y;
  const rod = (r: number, len = BLOCK.sizeX) => <cylinderGeometry args={[r, r, len, 18, 1]} />;
  const ring = Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2);
  const xylem = [
    [-0.02, 0.028, 0.018],
    [0.022, 0.03, 0.016],
    [0.0, 0.05, 0.014],
    [-0.035, 0.002, 0.012],
    [0.036, 0.004, 0.012],
  ];
  const phloem = Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI * (1.15 + (i / 7) * 0.7);
    return [Math.cos(a) * 0.035, Math.sin(a) * 0.03 - 0.008, 0.0085];
  });

  return (
    <>
      {d.backdrop > 0.001 ? (
        <mesh material={mats.backdrop} position={tr.pos} renderOrder={10}>
          <sphereGeometry args={[0.5, 48, 32]} />
        </mesh>
      ) : null}
      {d.marker > 0.001 ? (
        <>
          <group matrixAutoUpdate={false} matrix={onLeaf}>
            {corners.map(([x, z], i) => {
              const [x2, z2] = corners[(i + 1) % 4];
              const len = Math.hypot(x2 - x, z2 - z);
              return (
                <mesh
                  key={i}
                  material={mats.marker}
                  position={[(x + x2) / 2, BLOCK.sizeY + 0.02, (z + z2) / 2]}
                  rotation={[0, x === x2 ? 0 : Math.PI / 2, 0]}
                  renderOrder={30}
                >
                  <boxGeometry args={[0.03, 0.03, len + 0.03]} />
                </mesh>
              );
            })}
          </group>
          <lineSegments geometry={tether} renderOrder={30}>
            <lineBasicMaterial color={PALETTE.gold} transparent opacity={tetherOp * 0.8} depthWrite={false} />
          </lineSegments>
        </>
      ) : null}
      <group matrixAutoUpdate={false} matrix={tr.matrix} visible={vis > 0.001}>
        {/* Верхняя кожица + кутикула */}
        <group position={[0, ex.upper * e, 0]}>
          <mesh material={mats.cuticle} position={[0, BLOCK.layers.cuticle[0] + 0.006, 0]} renderOrder={22}>
            <boxGeometry args={[BLOCK.sizeX, 0.012, BLOCK.sizeZ]} />
          </mesh>
          <instancedMesh ref={refs.upper} args={[data.box, mats.epi, data.upper.length]} renderOrder={21} />
        </group>
        {/* Палисадная ткань */}
        <group position={[0, ex.palisade * e, 0]}>
          <instancedMesh ref={refs.palChl} args={[data.ellipsoid, mats.chl, data.palChl.length]} renderOrder={20} />
          <instancedMesh ref={refs.pal} args={[data.capsule, mats.pal, data.pal.length]} renderOrder={21} />
          <PlantCell st={st} cell={data.pal[FOCUS_INDEX]} fade={fade} />
        </group>
        {/* Губчатая ткань и сосудистый пучок (прожилка) */}
        <group position={[0, ex.spongy * e, 0]}>
          <instancedMesh ref={refs.spoChl} args={[data.ellipsoid, mats.chl, data.spoChl.length]} renderOrder={20} />
          <instancedMesh ref={refs.spo} args={[data.lumpy, mats.spo, data.spo.length]} renderOrder={21} />
          <group position={[0, bundleY, BLOCK.bundle.z]} rotation={[0, 0, Math.PI / 2]}>
            {ring.map((a, i) => (
              <mesh key={i} material={mats.sheath} position={[Math.cos(a) * 0.064, 0, Math.sin(a) * 0.064]} renderOrder={21}>
                {rod(0.013)}
              </mesh>
            ))}
            {xylem.map(([x, z, r], i) => (
              <mesh key={`x${i}`} material={mats.xylem} position={[z, 0, x]} renderOrder={22}>
                {rod(r)}
              </mesh>
            ))}
            {phloem.map(([x, z, r], i) => (
              <mesh key={`p${i}`} material={mats.phloem} position={[z, 0, x]} renderOrder={22}>
                {rod(r)}
              </mesh>
            ))}
          </group>
        </group>
        {/* Нижняя кожица с устьицами */}
        <group position={[0, ex.lower * e, 0]}>
          <instancedMesh ref={refs.lower} args={[data.box, mats.epi, data.lower.length]} renderOrder={21} />
          {STOMATA.map((p, i) => (
            <group key={i} position={[p.x, -0.004, p.z]} rotation={[Math.PI / 2, 0, i * 0.7]}>
              {[-1, 1].map((sgn) => (
                <mesh key={sgn} material={mats.guard} position={[sgn * 0.016, 0, 0]} rotation={[0, 0, -sgn * Math.PI / 2]} renderOrder={23}>
                  <torusGeometry args={[0.026, 0.011, 10, 24, Math.PI]} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      </group>
    </>
  );
};
