// Пчелиные соты: шестиугольные ячейки-трубки с глубиной, мёд на дне,
// восковые крышечки. Ячейки появляются по спирали (1, 2, 3, затем кольца) —
// шестиугольники смыкаются без промежутков. Затем Grid Transformation:
// глубина уходит, ячейки поворачиваются на 30°, между ними раскрываются
// треугольники — получается плоский орнамент для следующей сцены.
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clamp, lerp, mixHex, polygonShape, ramp, seeded } from "../engines/GeometryWondersEngine";
import { hexagon } from "../engines/PatternGenerator";
import { hexSpiral } from "../engines/TessellationEngine";
import { PALETTE } from "../styles/palette";

export const COMB = { rings: 10, size: 0.5, depth: 1.25 };

export type CombTimes = {
  first: number; // первая ячейка
  second: number;
  third: number;
  grow: readonly [number, number];
  repeat: readonly [number, number];
  flatten: readonly [number, number];
};

const wallGeo = (() => {
  const s = COMB.size;
  const g = new THREE.ExtrudeGeometry(polygonShape(hexagon(s * 0.995, Math.PI / 6), hexagon(s * 0.86, Math.PI / 6)), {
    depth: 1,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 1,
  });
  g.translate(0, 0, -1); // стенки уходят вглубь (−z), открытые концы — к зрителю
  return g;
})();
const floorGeo = new THREE.ShapeGeometry(polygonShape(hexagon(COMB.size * 0.87, Math.PI / 6)));
const triGeo = new THREE.ShapeGeometry(
  polygonShape([
    [0, 0.2],
    [-0.173, -0.1],
    [0.173, -0.1],
  ]),
);

const m = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const p = new THREE.Vector3();
const s = new THREE.Vector3();

export const Honeycomb: React.FC<{ t: number; times: CombTimes; fade?: number }> = ({ t, times, fade = 0 }) => {
  const cells = useMemo(() => hexSpiral(COMB.rings, COMB.size), []);
  const meta = useMemo(() => {
    const rnd = seeded(2024);
    return cells.map(() => ({ fill: 0.25 + rnd() * 0.6, capped: rnd() < 0.22, tone: rnd() }));
  }, [cells]);
  // Вершины решётки (по 2 на ячейку) — сюда встанут треугольники орнамента.
  const verts = useMemo(() => {
    const out: { x: number; y: number; up: boolean; ring: number }[] = [];
    cells.forEach((c) => {
      for (const k of [0, 1]) {
        const a = Math.PI / 2 + k * Math.PI; // верхняя и нижняя вершины
        out.push({ x: c.x + Math.cos(a) * COMB.size, y: c.y + Math.sin(a) * COMB.size, up: k === 0, ring: c.ring });
      }
    });
    return out;
  }, [cells]);
  const wallRef = useRef<THREE.InstancedMesh>(null);
  const floorRef = useRef<THREE.InstancedMesh>(null);
  const triRef = useRef<THREE.InstancedMesh>(null);

  const appearAt = (i: number) => {
    if (i === 0) return times.first;
    if (i === 1) return times.second;
    if (i === 2) return times.third;
    const span = times.grow[1] - times.grow[0];
    return times.grow[0] + ((i - 3) / (cells.length - 3)) ** 0.8 * span;
  };

  useLayoutEffect(() => {
    const flat = ramp(t, times.flatten[0], times.flatten[1], "inOut");
    const turn = ramp(t, times.flatten[0] + 0.4, times.flatten[1], "inOut");
    const wax = new THREE.Color(PALETTE.wax);
    const night = new THREE.Color(PALETTE.night);
    const waveFront = lerp(-2, COMB.rings + 3, ramp(t, times.repeat[0], times.repeat[1], "linear"));
    cells.forEach((c, i) => {
      const k = ramp(t, appearAt(i), appearAt(i) + 0.45, "back");
      const vis = t >= appearAt(i) ? 1 : 0;
      const depth = lerp(COMB.depth, 0.14, flat) * clamp(ramp(t, appearAt(i), appearAt(i) + 0.7, "out"), 0.02, 1);
      const sc = lerp(1, 0.8, flat) * k * vis;
      p.set(c.x, c.y, 0);
      e.set(0, 0, (Math.PI / 6) * turn);
      q.setFromEuler(e);
      s.set(sc, sc, depth * vis + 1e-4);
      m.compose(p, q, s);
      wallRef.current!.setMatrixAt(i, m);
      // Повторение: золотая волна бежит по кольцам.
      const wave = Math.exp(-((c.ring - waveFront) ** 2) / 1.3);
      const wallCol = wax.clone().lerp(new THREE.Color("#fff1c4"), wave * 0.8);
      wallRef.current!.setColorAt(i, wallCol.lerp(new THREE.Color(PALETTE.gold), flat).lerp(night, fade));
      // Мёд: на глубине fill; крышечка — у самого края.
      const md = meta[i];
      const z = md.capped ? -0.06 : -depth * (1 - md.fill * (1 - flat));
      p.set(c.x, c.y, lerp(z, -0.13, flat));
      s.set(sc, sc, 1);
      m.compose(p, q, s);
      floorRef.current!.setMatrixAt(i, m);
      const honey = md.capped ? mixHex("#f6dc96", PALETTE.wax, md.tone) : mixHex(PALETTE.honey, PALETTE.honeyDeep, md.tone * 0.8);
      floorRef.current!.setColorAt(i, honey.lerp(new THREE.Color(md.tone > 0.5 ? PALETTE.royal : PALETTE.royalDeep), flat).lerp(night, fade));
    });
    verts.forEach((v, i) => {
      const k = ramp(t, times.flatten[0] + 0.6 + v.ring * 0.08, times.flatten[1] + 0.2 + v.ring * 0.08, "back");
      p.set(v.x, v.y, 0.02);
      e.set(0, 0, (v.up ? 0 : Math.PI) + (1 - k) * Math.PI);
      q.setFromEuler(e);
      const sc = 1.05 * k;
      s.set(sc, sc, 1);
      m.compose(p, q, s);
      triRef.current!.setMatrixAt(i, m);
      triRef.current!.setColorAt(i, new THREE.Color(v.ring % 2 ? PALETTE.turquoise : PALETTE.emerald).lerp(night, fade));
    });
    for (const r of [wallRef, floorRef, triRef]) {
      r.current!.instanceMatrix.needsUpdate = true;
      if (r.current!.instanceColor) r.current!.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={wallRef} args={[wallGeo, undefined, cells.length]} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.42} metalness={0.05} />
      </instancedMesh>
      <instancedMesh ref={floorRef} args={[floorGeo, undefined, cells.length]} receiveShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.22} metalness={0.0} emissive="#5a2e00" emissiveIntensity={0.35} />
      </instancedMesh>
      <instancedMesh ref={triRef} args={[triGeo, undefined, verts.length]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.5} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
};
