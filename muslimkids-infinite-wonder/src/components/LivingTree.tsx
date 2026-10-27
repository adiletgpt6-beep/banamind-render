// Главное дерево: ветви-трубки, тысячи листьев с лёгким ветром,
// и Главный лист — детальная 3D-пластинка с жилками.
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Color,
  DoubleSide,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from "three";
import { useTex } from "../materials";
import { buildLeafGeometry } from "../geometry/leaf";
import { buildTree, HERO, HERO_BASE, HERO_LEN } from "../geometry/tree";
import { TREE } from "../engines/InfiniteJourneyEngine";
import { PALETTE } from "../engines/LightingSystem";
import type { DirectorState } from "../engines/InfiniteWonderDirector";

export const LivingTree: React.FC<{ st: DirectorState }> = ({ st }) => {
  const leafTex = useTex("textures/leaf.png");
  const veinTex = useTex("textures/leaf_bump.jpg");
  const leavesRef = useRef<InstancedMesh>(null);
  const blobsRef = useRef<InstancedMesh>(null);

  const tree = useMemo(() => buildTree(), []);
  const mats = useMemo(() => {
    const bark = new MeshStandardMaterial({ color: "#7A5A40", roughness: 0.95 });
    const leaf = new MeshStandardMaterial({ map: leafTex, alphaTest: 0.5, side: DoubleSide, roughness: 0.62 });
    const wind = { value: 0 };
    const amp = { value: 1 };
    leaf.onBeforeCompile = (sh) => {
      sh.uniforms.uWind = wind;
      sh.uniforms.uAmp = amp;
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uWind;\nuniform float uAmp;")
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          #ifdef USE_INSTANCING
            float ph = dot(instanceMatrix[3].xyz, vec3(3.1, 1.7, 2.3));
            transformed.y += sin(uWind * 2.6 + ph) * 0.18 * position.x * uAmp;
            transformed.z += sin(uWind * 1.9 + ph * 1.3) * 0.08 * position.x * uAmp;
          #endif`,
        );
    };
    const blob = new MeshStandardMaterial({ color: "#3B7A45", roughness: 0.9, flatShading: true });
    const hero = new MeshStandardMaterial({
      map: leafTex,
      bumpMap: veinTex,
      bumpScale: 1.4,
      emissiveMap: veinTex,
      emissive: new Color(PALETTE.gold),
      emissiveIntensity: 0,
      roughness: 0.55,
      side: DoubleSide,
      transparent: true,
      alphaTest: 0.02,
    });
    const petiole = new MeshStandardMaterial({ color: "#5E8A3A", roughness: 0.7 });
    return { bark, leaf, blob, hero, petiole, wind, amp };
  }, [leafTex, veinTex]);

  const geos = useMemo(() => {
    const small = buildLeafGeometry(0.12, 0.068, 6, 4, 0.14, 0.12);
    const big = buildLeafGeometry(HERO_LEN, HERO_LEN * 0.58, 72, 28, 0.13, 0.07);
    return { small, big, blob: new IcosahedronGeometry(1, 1) };
  }, []);

  useLayoutEffect(() => {
    const m = new Matrix4();
    tree.leaves.forEach((l, i) => {
      m.compose(l.pos, l.quat, new Vector3(l.scale, l.scale, l.scale));
      leavesRef.current!.setMatrixAt(i, m);
      const c = new Color().setHSL(0.27 + (l.tint - 0.5) * 0.05, 0.55, 0.42 + (l.tint - 0.5) * 0.14).multiplyScalar(2.1);
      leavesRef.current!.setColorAt(i, c);
    });
    leavesRef.current!.instanceMatrix.needsUpdate = true;
    leavesRef.current!.instanceColor!.needsUpdate = true;
    leavesRef.current!.computeBoundingSphere();
    tree.blobs.forEach((b, i) => {
      m.compose(b.pos, new Quaternion(), new Vector3(b.r, b.r * 0.85, b.r));
      blobsRef.current!.setMatrixAt(i, m);
    });
    blobsRef.current!.instanceMatrix.needsUpdate = true;
    blobsRef.current!.computeBoundingSphere();
  }, [tree]);

  const d = st.discovery;
  mats.wind.value = st.t;
  mats.amp.value = 0.25 + 0.75 * d.sway;
  // Лист «просвечивается»: поверхность полупрозрачна, жилки светятся.
  mats.hero.opacity = (1 - 0.62 * d.xray) * d.leafFade;
  mats.hero.depthWrite = d.xray < 0.05;
  mats.hero.emissiveIntensity = 0.55 * d.xray;
  // Внутри «увеличенной модели» настоящее дерево растворяется в фоне.
  const keep = 1 - d.backdrop;
  for (const m of [mats.bark, mats.leaf, mats.blob, mats.petiole]) {
    m.transparent = keep < 0.999;
    m.opacity = keep;
    m.depthWrite = keep > 0.5;
  }
  // Лёгкий ветер раскачивает всё дерево и сам лист; при изучении — замирает.
  const sway = d.sway;
  const treeRot = 0.004 * Math.sin(st.t * 1.1) * sway;
  const leafRot = 0.06 * Math.sin(st.t * 1.7 + 0.5) * sway;
  const leafQ = HERO.quat.clone().multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), leafRot));
  const bladeOffset = new Vector3(HERO.petiole, 0, 0).applyQuaternion(leafQ);

  return (
    <group position={TREE} rotation={[treeRot, 0, treeRot * 0.6]}>
      <mesh geometry={tree.bark} material={mats.bark} />
      <instancedMesh ref={leavesRef} args={[geos.small, mats.leaf, tree.leaves.length]} />
      <instancedMesh ref={blobsRef} args={[geos.blob, mats.blob, tree.blobs.length]} />
      {/* Черешок и Главный лист */}
      <group position={HERO_BASE} quaternion={leafQ}>
        <mesh material={mats.petiole} rotation={[0, 0, Math.PI / 2]} position={[HERO.petiole / 2, 0, 0]}>
          <cylinderGeometry args={[0.0011, 0.0016, HERO.petiole, 10]} />
        </mesh>
      </group>
      <mesh
        geometry={geos.big}
        material={mats.hero}
        position={HERO_BASE.clone().add(bladeOffset)}
        quaternion={leafQ}
        renderOrder={15}
      />
    </group>
  );
};
