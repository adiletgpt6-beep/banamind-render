// Лес и луг: тысячи деревьев (инстансинг) и трава с цветами у главного дерева.
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { heightAt, placeForest, TREE_SPOT } from "../geometry/terrain";
import { NATURE_TRACK } from "../engines/InfiniteJourneyEngine";
import { posePosition } from "../engines/CameraTransitionEngine";
import { mulberry32, vnoise2 } from "../utils/random";

function paint(g: BufferGeometry, hex: string, shadeBottom = 0.75) {
  const c = new Color(hex);
  const pos = g.attributes.position;
  g.computeBoundingBox();
  const { min, max } = g.boundingBox!;
  const arr = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const k = (pos.getY(i) - min.y) / Math.max(1e-6, max.y - min.y);
    const f = shadeBottom + (1 - shadeBottom) * k;
    arr.set([c.r * f, c.g * f, c.b * f], i * 3);
  }
  g.setAttribute("color", new BufferAttribute(arr, 3));
  return g.toNonIndexed();
}

function coniferGeometry() {
  const trunk = paint(new CylinderGeometry(0.35, 0.5, 4, 6).translate(0, 2, 0), "#6B4E36", 0.8);
  const tiers = [0, 1, 2].map((i) =>
    paint(new ConeGeometry(3.6 - i * 0.9, 7 - i * 1.3, 8).translate(0, 5 + i * 4.4, 0), i === 2 ? "#3E8A5A" : "#2C6B47", 0.55),
  );
  return mergeGeometries([trunk.deleteAttribute("uv"), ...tiers.map((t) => t.deleteAttribute("uv"))].map((g) => g.deleteAttribute("normal")))!;
}

function broadleafGeometry() {
  const trunk = paint(new CylinderGeometry(0.3, 0.45, 5, 6).translate(0, 2.5, 0), "#6B4E36", 0.8);
  const crown = new IcosahedronGeometry(4.2, 1);
  const pos = crown.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const v = new Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    v.multiplyScalar(0.85 + 0.3 * vnoise2(v.x * 0.9, v.z * 0.9 + v.y, 4));
    pos.setXYZ(i, v.x, v.y * 0.85 + 8.5, v.z);
  }
  const c = paint(crown, "#4E9A4F", 0.55);
  return mergeGeometries([trunk.deleteAttribute("uv").deleteAttribute("normal"), c.deleteAttribute("uv").deleteAttribute("normal")])!;
}

const forestMat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.92, flatShading: true });

export const ForestWorld: React.FC = () => {
  const conRef = useRef<InstancedMesh>(null);
  const brdRef = useRef<InstancedMesh>(null);
  const grassRef = useRef<InstancedMesh>(null);
  const flowerRef = useRef<InstancedMesh>(null);

  const data = useMemo(() => {
    // Траектория камеры: возле неё деревьев нет (никаких «пролётов сквозь кроны»).
    const avoid: { x: number; y: number; z: number }[] = [];
    for (let s = 5; s <= 8.6; s += 0.02) {
      const p = posePosition(NATURE_TRACK.at(s));
      avoid.push({ x: p.x, y: p.y, z: p.z });
    }
    const spots = placeForest(5200, 2600, avoid);
    const con = coniferGeometry();
    con.computeVertexNormals();
    const brd = broadleafGeometry();
    brd.computeVertexNormals();
    return { spots, con, brd, conN: spots.filter((s) => s.kind === 0).length, brdN: spots.filter((s) => s.kind === 1).length };
  }, []);

  const grass = useMemo(() => {
    const blades: BufferGeometry[] = [];
    const rnd = mulberry32(8);
    for (let i = 0; i < 7; i++) {
      const h = 0.22 + rnd() * 0.25;
      const g = new ConeGeometry(0.018, h, 3, 1).translate((rnd() - 0.5) * 0.12, h / 2, (rnd() - 0.5) * 0.12);
      g.rotateZ((rnd() - 0.5) * 0.5);
      blades.push(paint(g, rnd() < 0.5 ? "#5A9A44" : "#6EA64C", 0.6).deleteAttribute("uv").deleteAttribute("normal"));
    }
    const geo = mergeGeometries(blades)!;
    geo.computeVertexNormals();
    return geo;
  }, []);

  useLayoutEffect(() => {
    const m = new Matrix4();
    const q = new Quaternion();
    const tint = new Color();
    let ic = 0;
    let ib = 0;
    for (const s of data.spots) {
      q.setFromAxisAngle(new Vector3(0, 1, 0), s.rot);
      m.compose(new Vector3(s.x, s.y, s.z), q, new Vector3(s.scale, s.scale * (0.9 + 0.3 * s.hue), s.scale));
      tint.setHSL(0.28 + (s.hue - 0.5) * 0.06, 0.25, 0.5 + (s.hue - 0.5) * 0.25);
      tint.multiplyScalar(2);
      if (s.kind === 0) {
        conRef.current!.setMatrixAt(ic, m);
        conRef.current!.setColorAt(ic++, tint);
      } else {
        brdRef.current!.setMatrixAt(ib, m);
        brdRef.current!.setColorAt(ib++, tint);
      }
    }
    for (const r of [conRef, brdRef]) {
      r.current!.instanceMatrix.needsUpdate = true;
      if (r.current!.instanceColor) r.current!.instanceColor.needsUpdate = true;
      r.current!.computeBoundingSphere();
    }
    // Луг вокруг главного дерева.
    const rnd = mulberry32(99);
    const gN = grassRef.current!.count;
    for (let i = 0; i < gN; i++) {
      const a = rnd() * Math.PI * 2;
      // Плотность травы плавно спадает — без заметного «круга» на лугу.
      let r = 0.6 + rnd() * 75;
      while (rnd() > Math.exp(-((r / 32) ** 2))) r = 0.6 + rnd() * 75;
      const x = TREE_SPOT.x + Math.cos(a) * r;
      const z = TREE_SPOT.z + Math.sin(a) * r;
      q.setFromAxisAngle(new Vector3(0, 1, 0), rnd() * 6.28);
      const sc = 0.8 + rnd() * 0.9;
      m.compose(new Vector3(x, heightAt(x, z) - 0.03, z), q, new Vector3(sc, sc, sc));
      grassRef.current!.setMatrixAt(i, m);
    }
    grassRef.current!.instanceMatrix.needsUpdate = true;
    grassRef.current!.computeBoundingSphere();
    const fN = flowerRef.current!.count;
    const fc = [new Color("#F7F3E9"), new Color("#EFC475"), new Color("#F2D7E6")];
    for (let i = 0; i < fN; i++) {
      const a = rnd() * Math.PI * 2;
      const r = 1.5 + Math.pow(rnd(), 0.7) * 22;
      const x = TREE_SPOT.x + Math.cos(a) * r;
      const z = TREE_SPOT.z + Math.sin(a) * r;
      m.compose(new Vector3(x, heightAt(x, z) + 0.25 + rnd() * 0.12, z), q, new Vector3(1, 0.5, 1));
      flowerRef.current!.setMatrixAt(i, m);
      flowerRef.current!.setColorAt(i, fc[i % 3]);
    }
    flowerRef.current!.instanceMatrix.needsUpdate = true;
    flowerRef.current!.instanceColor!.needsUpdate = true;
    flowerRef.current!.computeBoundingSphere();
  }, [data]);

  return (
    <>
      <instancedMesh ref={conRef} args={[data.con, forestMat, data.conN]} />
      <instancedMesh ref={brdRef} args={[data.brd, forestMat, data.brdN]} />
      <instancedMesh ref={grassRef} args={[grass, forestMat, 14000]} />
      <instancedMesh ref={flowerRef} args={[undefined, undefined, 420]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
    </>
  );
};
