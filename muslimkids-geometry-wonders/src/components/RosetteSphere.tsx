// Pattern Bloom → Земля: один и тот же набор треугольников проходит путь
// «треугольник → розетка → объёмная чаша → сфера → грани Земли».
// Вершины пересчитываются на CPU каждый кадр (486 треугольников —
// дёшево), геометрия одна (BufferGeometry), материал один.
import { useMemo } from "react";
import * as THREE from "three";
import { clamp, EASE, lerp, mixHex, ramp, type Vec2, type Vec3 } from "../engines/GeometryWondersEngine";
import { edgeUnfold, rollToSphere, sphereAngles } from "../engines/GeometricMorphEngine";
import { hexRadius, triangleRosette } from "../engines/PatternGenerator";
import { destination, earthColorAt, llToVec } from "../systems/earthTexture";
import { T } from "../timeline";

export const ROSETTE = { n: 9, R: 1.4 };
export const EARTH = { lat0: 28, lon0: 105, radius: 1.1 };
// Длина дуги «центр → край» в замкнутом шаре и радиус этого шара.
const ARC = ROSETTE.R;
const RS = ARC / (Math.PI * 0.995);
export const GROW_SCALE = EARTH.radius / RS;
// Поворот розетки к моменту замыкания: кратен 60° — узор симметричен.
const SPIN_TOTAL = Math.PI / 3;

export type RosetteGeo = ReturnType<typeof buildRosette>;

function buildRosette() {
  const tris = triangleRosette(ROSETTE.n, ROSETTE.R);
  const finalInset = 0.975;
  // Для каждой вершины — широта/долгота после сворачивания (грани Земли).
  const ll = tris.map((t) =>
    t.v.map((v) => {
      const c = t.centroid;
      const p: Vec2 = [c[0] + (v[0] - c[0]) * finalInset, c[1] + (v[1] - c[1]) * finalInset];
      const r = Math.hypot(p[0], p[1]);
      const rho = r < 1e-9 ? 0 : r / hexRadius(ROSETTE.R, Math.atan2(p[1], p[0]));
      const { theta, phi } = sphereAngles(p[0], p[1], rho);
      return destination(EARTH.lat0, EARTH.lon0, theta, Math.PI / 2 - (phi + SPIN_TOTAL));
    }),
  );
  const earthCol = ll.map((vs) => {
    // Цвет грани — по центру грани на карте (усреднение трёх вершин).
    const cs = vs.map((p) => earthColorAt(p.lat, p.lon));
    return new THREE.Color((cs[0].r + cs[1].r + cs[2].r) / 3, (cs[0].g + cs[1].g + cs[2].g) / 3, (cs[0].b + cs[1].b + cs[2].b) / 3);
  });
  const centroidRho = tris.map((t) => {
    const r = Math.hypot(t.centroid[0], t.centroid[1]);
    return r / hexRadius(ROSETTE.R, Math.atan2(t.centroid[1], t.centroid[0]));
  });
  return { tris, ll, earthCol, centroidRho };
}

let shared: RosetteGeo | null = null;
export const getRosette = () => (shared ??= buildRosette());

const rotZ = (p: Vec3, a: number): Vec3 => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
const rotX = (p: Vec3, a: number): Vec3 => [p[0], p[1] * Math.cos(a) - p[2] * Math.sin(a), p[1] * Math.sin(a) + p[2] * Math.cos(a)];

/** Состояние розетки во времени t: позиции вершин (мир) и цвета граней. */
function rosetteFrame(t: number, g: RosetteGeo, pos: Float32Array, col: Float32Array) {
  const { tris } = g;
  const fold = ramp(t, T.fold[0], T.fold[1], "inOut");
  const grow = lerp(1, GROW_SCALE, ramp(t, T.grow[0], T.grow[1], "inOut"));
  const inset = lerp(0.86, 0.975, ramp(t, T.fold[0], T.fold[0] + 2.2, "inOut"));
  // Вращение розетки: начинается после раскрытия и заканчивается к замыканию.
  const spin = SPIN_TOTAL * ramp(t, T.breathe - 0.6, T.fold[1] - 0.3, "inOut");
  const tilt = -0.42 * Math.sin(Math.PI * ramp(t, T.breathe, T.fold[1], "soft"));
  const lift = Math.sin(Math.PI * ramp(t, T.breathe, T.fold[0] + 0.8, "soft"));
  const colorK = (rho: number) => ramp(t, T.colors[0] + rho * 0.9, T.colors[0] + rho * 0.9 + 0.8, "inOut");
  const c = new THREE.Color();
  const glow = new THREE.Color("#fff6dc");

  tris.forEach((tri, i) => {
    let verts: Vec3[] = tri.v.map((v) => [v[0], v[1], 0]);
    let scale = 1;
    let landed = 1; // 0…1: как давно фигура заняла место (для мягкого блика)
    if (tri.row === 0) {
      if (tri.sector === 0) {
        const p = ramp(t, T.firstTri, T.firstTri + 0.7, "back");
        scale = p;
        // Лёгкий поворот вокруг собственного центра.
        const a = -0.7 * (1 - ramp(t, T.firstTri, T.fan, "inOut"));
        const cx = tri.centroid[0];
        const cy = tri.centroid[1];
        verts = verts.map((v) => {
          const r = rotZ([v[0] - cx, v[1] - cy, 0], a);
          return [r[0] + cx, r[1] + cy, 0];
        });
        landed = ramp(t, T.firstTri + 0.5, T.firstTri + 1.4);
      } else {
        // Радиальная расстановка: копия поворачивается от предыдущего сектора.
        const st = T.fan + (tri.sector - 1) * 0.16;
        const p = ramp(t, st, st + 0.5, "inOut");
        scale = t < st ? 0 : 1;
        const base = g.tris[0].v; // треугольник сектора 0
        verts = base.map((v) => rotZ([v[0], v[1], 0], (Math.PI / 3) * (tri.sector - 1 + p)));
        landed = ramp(t, st + 0.4, st + 1.2);
      }
    } else {
      const st = T.unfold + (tri.step - 1) * T.unfoldInterval;
      const p = ramp(t, st, st + T.unfoldDur, "inOut");
      if (t < st) scale = 0;
      const [a, b] = tri.hinge!;
      const k = tri.v.findIndex((v) => (v[0] !== a[0] || v[1] !== a[1]) && (v[0] !== b[0] || v[1] !== b[1]));
      const moved = edgeUnfold([a[0], a[1], 0], [b[0], b[1], 0], [tri.v[k][0], tri.v[k][1], 0], p);
      verts = verts.map((v, j) => (j === k ? moved : v));
      landed = ramp(t, st + T.unfoldDur * 0.8, st + T.unfoldDur + 0.7);
    }
    // Зазор между фигурами (читаемость узора) — к центру грани.
    const cx = (verts[0][0] + verts[1][0] + verts[2][0]) / 3;
    const cy = (verts[0][1] + verts[1][1] + verts[2][1]) / 3;
    const cz = (verts[0][2] + verts[1][2] + verts[2][2]) / 3;
    const k = inset * scale;
    const waveZ = 0.07 * lift * Math.sin(t * 2.2 - tri.row * 0.55);
    verts = verts.map((v) => {
      const x = cx + (v[0] - cx) * k;
      const y = cy + (v[1] - cy) * k;
      const z = cz + (v[2] - cz) * k + waveZ;
      // Сворачивание в шар (только для фигур, лежащих в плоскости).
      const r = Math.hypot(x, y);
      const rho = r < 1e-9 ? 0 : r / hexRadius(ROSETTE.R, Math.atan2(y, x));
      let w: Vec3 = fold > 0 ? rollToSphere(x, y, rho, ARC, fold) : [x, y, 0];
      w = [w[0], w[1], w[2] + z * (1 - fold)];
      w = rotX(rotZ(w, spin), tilt);
      // Центр шара уходит в начало координат, шар растёт до размера Земли.
      return [w[0] * grow, w[1] * grow, (w[2] + RS * EASE.inOut(fold)) * grow];
    });
    verts.forEach((v, j) => pos.set(v, (i * 3 + j) * 3));
    // Цвет: узор → Земля; при «посадке» — мягкий тёплый блик.
    c.set(tri.color);
    c.lerp(g.earthCol[i], colorK(g.centroidRho[i]));
    c.lerp(glow, 0.35 * (1 - landed) * (scale > 0 ? 1 : 0));
    for (let j = 0; j < 3; j++) col.set([c.r, c.g, c.b], (i * 3 + j) * 3);
  });
}

/** Розетка, сворачивающаяся в Землю (мировые координаты). */
export const RosetteSphere: React.FC<{ t: number; opacity: number }> = ({ t, opacity }) => {
  const g = getRosette();
  const geom = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(g.tris.length * 9), 3));
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(g.tris.length * 9), 3));
    return geo;
  }, [g]);
  rosetteFrame(t, g, geom.attributes.position.array as Float32Array, geom.attributes.color.array as Float32Array);
  geom.attributes.position.needsUpdate = true;
  geom.attributes.color.needsUpdate = true;
  geom.computeBoundingSphere();
  return (
    <mesh geometry={geom} visible={opacity > 0.001} renderOrder={1}>
      <meshStandardMaterial
        vertexColors
        flatShading
        side={THREE.DoubleSide}
        roughness={0.55}
        metalness={0.08}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
};

/** Те же грани в координатах Земли (вращаются вместе с ней). */
export function facetGeometry(radius: number) {
  const g = getRosette();
  const pos = new Float32Array(g.tris.length * 9);
  const col = new Float32Array(g.tris.length * 9);
  const lines: number[] = [];
  g.ll.forEach((vs, i) => {
    const p = vs.map((q) => llToVec(q.lat, q.lon, radius));
    p.forEach((v, j) => pos.set(v, (i * 3 + j) * 3));
    for (let j = 0; j < 3; j++) col.set([g.earthCol[i].r, g.earthCol[i].g, g.earthCol[i].b], (i * 3 + j) * 3);
    for (let j = 0; j < 3; j++) {
      const a = vs[j];
      const b = vs[(j + 1) % 3];
      lines.push(...llToVec(a.lat, a.lon, radius * 1.006), ...llToVec(b.lat, b.lon, radius * 1.006));
    }
  });
  const faces = new THREE.BufferGeometry();
  faces.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  faces.setAttribute("color", new THREE.BufferAttribute(col, 3));
  faces.computeVertexNormals();
  const edges = new THREE.BufferGeometry();
  edges.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
  return { faces, edges };
}

export const colorMix = (a: string, b: string, k: number) => `#${mixHex(a, b, clamp(k)).getHexString()}`;
