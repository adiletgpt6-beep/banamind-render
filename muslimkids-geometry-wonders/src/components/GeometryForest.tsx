// Геометрический лес (InstancedMesh: три отрисовки на весь лес).
// Shape Reassembly: части крон — это треугольные осколки, которые
// отделяются от склонов гор, летят по дуге вниз и на лету превращаются
// в многогранники кроны. Стволы и ветви растут (Procedural Branch Generation).
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { arcPath, clamp, lerp, mixHex, ramp, seeded, type Vec3 } from "../engines/GeometryWondersEngine";
import { buildForest, type Tree } from "../engines/ProceduralWorldBuilder";
import { getTerrain } from "./GeometryMountains";

type Piece = { tree: number; part: Tree["crown"][number]; from: Vec3; fromColor: string };

function buildPieces(trees: Tree[]) {
  const d = getTerrain();
  const rnd = seeded(808);
  // Источники — грани склонов (высота 2.5…7).
  const slopes = d.tris.filter((tr) => {
    const h = (d.hFinal[tr.a] + d.hFinal[tr.b] + d.hFinal[tr.c]) / 3;
    return h > 2.5 && h < 7 && tr.cz < -2;
  });
  const pieces: Piece[] = [];
  trees.forEach((tree, ti) =>
    tree.crown.forEach((part) => {
      // Ближайший к дереву по x склон — полёт выглядит «сверху вниз», не хаотично.
      let best = slopes[0];
      let bestD = Infinity;
      for (let k = 0; k < 24; k++) {
        const s = slopes[Math.floor(rnd() * slopes.length)];
        const dd = Math.abs(s.cx - tree.base[0]) + Math.abs(s.cz - (tree.base[2] - 9)) * 0.4;
        if (dd < bestD) {
          bestD = dd;
          best = s;
        }
      }
      const h = (d.hFinal[best.a] + d.hFinal[best.b] + d.hFinal[best.c]) / 3;
      pieces.push({ tree: ti, part, from: [best.cx, h + 0.1, best.cz], fromColor: h > 4 ? "#4f7fae" : "#3CA68B" });
    }),
  );
  return pieces;
}

const segGeo = new THREE.CylinderGeometry(1, 1, 1, 6).translate(0, 0.5, 0);
const polyGeo = new THREE.IcosahedronGeometry(1, 0);
const coneGeo = new THREE.ConeGeometry(1, 1, 6).translate(0, 0.5, 0);

const m = new THREE.Matrix4();
const q = new THREE.Quaternion();
const up = new THREE.Vector3(0, 1, 0);
const p = new THREE.Vector3();
const s = new THREE.Vector3();
const e = new THREE.Euler();

export const GeometryForest: React.FC<{ t: number; window: readonly [number, number]; count?: number }> = ({ t, window, count = 26 }) => {
  const trees = useMemo(() => {
    const list = buildForest(4004, count);
    // Сборка волной: от центра переднего плана к краям и вглубь.
    return list
      .map((tr) => ({ tr, k: Math.hypot(tr.base[0] * 0.7, tr.base[2] - 6) }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.tr);
  }, [count]);
  const pieces = useMemo(() => buildPieces(trees), [trees]);
  const segs = useMemo(() => trees.flatMap((tr, ti) => tr.segments.map((sg) => ({ ...sg, tree: ti }))), [trees]);
  const segRef = useRef<THREE.InstancedMesh>(null);
  const polyRef = useRef<THREE.InstancedMesh>(null);
  const coneRef = useRef<THREE.InstancedMesh>(null);
  const span = window[1] - window[0];
  const treeStart = (ti: number) => window[0] + (ti / Math.max(1, trees.length - 1)) * span * 0.5;
  const treeDur = span * 0.5;

  useLayoutEffect(() => {
    const bark = new THREE.Color("#7a5a3c");
    const barkDark = new THREE.Color("#5b4130");
    // Стволы и ветви.
    segs.forEach((sg, i) => {
      const k = ramp(t, treeStart(sg.tree) + sg.start * treeDur * 0.6, treeStart(sg.tree) + sg.start * treeDur * 0.6 + treeDur * 0.35, "out");
      const from = new THREE.Vector3(...sg.from);
      const dir = new THREE.Vector3(...sg.to).sub(from);
      const len = dir.length();
      q.setFromUnitVectors(up, dir.normalize());
      s.set(sg.radius * (k > 0 ? 1 : 0), len * k, sg.radius * (k > 0 ? 1 : 0));
      m.compose(from, q, s);
      segRef.current!.setMatrixAt(i, m);
      segRef.current!.setColorAt(i, sg.order === 0 ? barkDark : bark);
    });
    let pi = 0;
    let ci = 0;
    pieces.forEach((pc) => {
      const st = treeStart(pc.tree) + pc.part.start * treeDur * 0.75;
      const k = ramp(t, st, st + treeDur * 0.45, "inOut");
      const mesh = pc.part.kind === "cone" ? coneRef.current! : polyRef.current!;
      const idx = pc.part.kind === "cone" ? ci++ : pi++;
      // Перелёт по дуге; осколок плоский (как грань горы) → объёмный.
      const pos = arcPath(pc.from, pc.part.pos, k, 2.2);
      p.set(pos[0], pos[1], pos[2]);
      const spin = (1 - k) * 2.4;
      e.set(pc.part.rot[0] * k + spin, pc.part.rot[1] + spin * 0.7, pc.part.rot[2] * k);
      q.setFromEuler(e);
      const vis = t >= st ? 1 : 0;
      const size = lerp(0.32, pc.part.size, k) * vis;
      if (pc.part.kind === "cone") s.set(size, lerp(0.05, pc.part.height ?? 1, k) * vis, size);
      else s.set(size, size * lerp(0.12, 1, clamp(k * 1.4)), size);
      m.compose(p, q, s);
      mesh.setMatrixAt(idx, m);
      mesh.setColorAt(idx, mixHex(pc.fromColor, pc.part.color, k));
    });
    for (const ref of [segRef, polyRef, coneRef]) {
      ref.current!.instanceMatrix.needsUpdate = true;
      if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
    }
  });
  const polyCount = pieces.filter((x) => x.part.kind === "poly").length;
  const coneCount = pieces.length - polyCount;
  return (
    <group>
      <instancedMesh ref={segRef} args={[segGeo, undefined, segs.length]} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial flatShading roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={polyRef} args={[polyGeo, undefined, polyCount]} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial flatShading roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={coneRef} args={[coneGeo, undefined, coneCount]} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial flatShading roughness={0.75} />
      </instancedMesh>
    </group>
  );
};
