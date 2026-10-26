// Геометрические горы: треугольная сетка, вершины которой поднимаются
// (Vertex Displacement) с небольшой задержкой по шуму — треугольники
// «вырастают» один за другим. Цвет грани — по высоте и крутизне:
// долина изумрудная, склоны сине-каменные, вершины в снегу.
import { useMemo } from "react";
import * as THREE from "three";
import { clamp, lerp, ramp } from "../engines/GeometryWondersEngine";
import { noise2, terrainHeight } from "../engines/ProceduralWorldBuilder";
import { triangleGrid } from "../engines/TessellationEngine";

export const TERRAIN = { cols: 66, rows: 70, cell: 0.62 };

export type TerrainData = ReturnType<typeof buildTerrain>;

function buildTerrain() {
  const { verts, tris } = triangleGrid(TERRAIN.cols, TERRAIN.rows, TERRAIN.cell);
  const hFinal = verts.map((v) => terrainHeight(v.x, v.z));
  const delay = verts.map((v) => clamp(noise2(v.x * 0.25, v.z * 0.25, 91) * 0.7 + Math.min(1, Math.hypot(v.x, v.z + 6) / 26) * 0.5));
  const flat = ["#3CA68B", "#36997f", "#45b293", "#2f8a73"].map((h) => new THREE.Color(h));
  const faceFlat = tris.map((_, i) => flat[(i * 7 + Math.floor(i / 3)) % flat.length]);
  return { verts, tris, hFinal, delay, faceFlat };
}

let cache: TerrainData | null = null;
export const getTerrain = () => (cache ??= buildTerrain());

/** Высота вершины i в момент t. */
export function heightAt(d: TerrainData, i: number, t: number, rise: readonly [number, number]) {
  const span = rise[1] - rise[0];
  const k = ramp(t, rise[0] + d.delay[i] * span * 0.45, rise[0] + d.delay[i] * span * 0.45 + span * 0.55, "inOut");
  return d.hFinal[i] * k;
}

const ROCK = new THREE.Color("#4f7fae");
const ROCK_DARK = new THREE.Color("#205A91");
const MOSS = new THREE.Color("#2f8a73");
const SNOW = new THREE.Color("#F5F2E9");
const ICE = new THREE.Color("#A4D8F0");

export const GeometryMountains: React.FC<{ t: number; rise: readonly [number, number]; snow: readonly [number, number] }> = ({
  t,
  rise,
  snow,
}) => {
  const d = getTerrain();
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(d.tris.length * 9), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(d.tris.length * 9), 3));
    return g;
  }, [d]);
  const pos = geom.attributes.position.array as Float32Array;
  const col = geom.attributes.color.array as Float32Array;
  const h = d.verts.map((_, i) => heightAt(d, i, t, rise));
  const snowK = ramp(t, snow[0], snow[1], "inOut");
  const colorK = ramp(t, rise[0] + 0.4, rise[1], "inOut");
  const c = new THREE.Color();
  const tmp = new THREE.Color();
  d.tris.forEach((tri, i) => {
    const ids = [tri.a, tri.b, tri.c];
    ids.forEach((vi, j) => {
      const v = d.verts[vi];
      pos.set([v.x, h[vi], v.z], (i * 3 + j) * 3);
    });
    // Итоговый цвет грани — по финальной высоте и крутизне.
    const hf = (d.hFinal[tri.a] + d.hFinal[tri.b] + d.hFinal[tri.c]) / 3;
    const steep = Math.max(d.hFinal[tri.a], d.hFinal[tri.b], d.hFinal[tri.c]) - Math.min(d.hFinal[tri.a], d.hFinal[tri.b], d.hFinal[tri.c]);
    const n = noise2(tri.cx * 0.8, tri.cz * 0.8, 5);
    if (hf < 1.3) tmp.copy(d.faceFlat[i]);
    else if (hf < 2.8) tmp.copy(MOSS).lerp(ROCK, clamp((hf - 1.3) / 1.5 + steep * 0.15));
    else tmp.copy(ROCK).lerp(ROCK_DARK, clamp(steep * 0.35 + n * 0.3));
    const snowLine = 5.0 + n * 1.4;
    if (hf > snowLine) tmp.lerp(n > 0.5 ? SNOW : ICE, snowK * clamp((hf - snowLine) / 1.2 + 0.35));
    c.copy(d.faceFlat[i]).lerp(tmp, colorK);
    for (let j = 0; j < 3; j++) col.set([c.r, c.g, c.b], (i * 3 + j) * 3);
  });
  geom.attributes.position.needsUpdate = true;
  geom.attributes.color.needsUpdate = true;
  geom.computeVertexNormals();
  geom.computeBoundingSphere();
  return (
    <mesh geometry={geom} receiveShadow castShadow>
      <meshStandardMaterial vertexColors flatShading roughness={0.82} metalness={0.02} />
    </mesh>
  );
};

/** Высота поверхности в точке (x, z) в момент t (для деревьев и цветка). */
export function groundAt(x: number, z: number, t: number, rise: readonly [number, number]) {
  const k = ramp(t, rise[0], rise[1], "inOut");
  return lerp(0, terrainHeight(x, z), k);
}
