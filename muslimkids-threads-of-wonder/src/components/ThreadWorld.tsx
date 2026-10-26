// 3D-мир нитей: объединённые меши по материалам, камера, свет, тени, окружение.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { FrameState } from "../engines/types";
import { buildBuckets } from "../geometry/TubeBuilder";
import { fiberMaterial } from "../materials/ThreadMaterialSystem";
import { MATERIAL_KINDS, MaterialKind } from "../engines/palette";
import { glowTexture, twillTexture } from "../textures/fiberTextures";
import { SKY } from "../scenes/Scene05Tapestry";

const BUCKETS: string[] = [...MATERIAL_KINDS, "hero"];

interface GeoSlot { geo: THREE.BufferGeometry; cap: number; icap: number }

const useEnvironment = () => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    pmrem.dispose();
  }, [gl, scene]);
};

export const ThreadWorld: React.FC<{ state: FrameState }> = ({ state }) => {
  const { camera, scene, gl } = useThree();
  useEnvironment();

  const slots = useMemo(() => {
    const m = new Map<string, GeoSlot>();
    for (const k of BUCKETS) m.set(k, { geo: new THREE.BufferGeometry(), cap: 0, icap: 0 });
    return m;
  }, []);

  const lights = useMemo(() => {
    const key = new THREE.DirectionalLight(0xffffff, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.012;
    key.shadow.radius = 3;
    const fill = new THREE.DirectionalLight(0xffffff, 1);
    const rim = new THREE.DirectionalLight(0xffffff, 1);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 0.4);
    const amb = new THREE.AmbientLight(0xffffff, 0.2);
    return { key, fill, rim, hemi, amb };
  }, []);

  const backing = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ map: twillTexture(), roughness: 0.95, metalness: 0, transparent: true, opacity: 0 });
    const w = SKY.xMax - SKY.xMin + 0.6, h = SKY.yMax - SKY.yMin + 0.6;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set((SKY.xMin + SKY.xMax) / 2, (SKY.yMin + SKY.yMax) / 2, SKY.z - 0.18);
    mesh.receiveShadow = true;
    return mesh;
  }, []);

  const glow = useMemo(() => {
    const mat = new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
    return new THREE.Sprite(mat);
  }, []);

  // --- геометрия кадра ---
  const buckets = buildBuckets(state.threads);
  for (const k of BUCKETS) {
    const slot = slots.get(k)!;
    const b = buckets.get(k);
    const geo = slot.geo;
    if (!b || b.indexCount === 0) {
      geo.setDrawRange(0, 0);
      continue;
    }
    if (slot.cap !== b.positions.length || !geo.getAttribute("position") || (geo.getAttribute("position").array as Float32Array) !== b.positions) {
      geo.setAttribute("position", new THREE.BufferAttribute(b.positions, 3));
      geo.setAttribute("normal", new THREE.BufferAttribute(b.normals, 3));
      geo.setAttribute("uv", new THREE.BufferAttribute(b.uvs, 2));
      geo.setAttribute("color", new THREE.BufferAttribute(b.colors, 3));
      slot.cap = b.positions.length;
    } else {
      for (const n of ["position", "normal", "uv", "color"]) (geo.getAttribute(n) as THREE.BufferAttribute).needsUpdate = true;
    }
    if (slot.icap !== b.indices.length || !geo.index || geo.index.array !== b.indices) {
      geo.setIndex(new THREE.BufferAttribute(b.indices, 1));
      slot.icap = b.indices.length;
    } else geo.index.needsUpdate = true;
    geo.setDrawRange(0, b.indexCount);
  }

  // --- камера ---
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...state.camera.pos);
  cam.fov = state.camera.fov;
  cam.near = 0.02;
  cam.far = 120;
  cam.lookAt(...state.camera.target);
  cam.updateProjectionMatrix();

  // --- свет ---
  const L = state.light;
  const sc = new THREE.Vector3(...L.shadowCenter);
  const kd = new THREE.Vector3(...L.keyDir);
  lights.key.position.copy(sc).addScaledVector(kd, L.shadowSize * 4 + 4);
  lights.key.target.position.copy(sc);
  lights.key.target.updateMatrixWorld();
  lights.key.color.setRGB(...L.keyColor);
  lights.key.intensity = L.keyIntensity;
  const sCam = lights.key.shadow.camera;
  sCam.left = -L.shadowSize; sCam.right = L.shadowSize; sCam.top = L.shadowSize; sCam.bottom = -L.shadowSize;
  sCam.near = 0.1; sCam.far = L.shadowSize * 10 + 10;
  sCam.updateProjectionMatrix();
  lights.fill.position.set(...L.fillDir).multiplyScalar(10);
  lights.fill.color.setRGB(...L.fillColor);
  lights.fill.intensity = L.fillIntensity;
  lights.rim.position.set(...L.rimDir).multiplyScalar(10);
  lights.rim.color.setRGB(...L.rimColor);
  lights.rim.intensity = L.rimIntensity;
  lights.hemi.color.setRGB(...L.hemiSky);
  lights.hemi.groundColor.setRGB(...L.hemiGround);
  lights.hemi.intensity = L.ambient * 1.3;
  lights.amb.intensity = L.ambient * 0.5;
  scene.environmentIntensity = L.env;
  scene.fog = new THREE.Fog(0x0a1a2c, L.fogNear, L.fogFar);
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 0.95;

  // --- тканое Солнце ---
  const hero = fiberMaterial("gold", true);
  hero.emissiveIntensity = (state.sunGlow.strength ?? 0) * 0.55;
  glow.position.set(...state.sunGlow.pos);
  glow.scale.setScalar(state.sunGlow.size);
  (glow.material as THREE.SpriteMaterial).opacity = state.sunGlow.strength * 0.5;
  (backing.material as THREE.MeshStandardMaterial).opacity = state.skyBacking;
  backing.visible = state.skyBacking > 0.001;

  return (
    <>
      <primitive object={lights.key} />
      <primitive object={lights.key.target} />
      <primitive object={lights.fill} />
      <primitive object={lights.rim} />
      <primitive object={lights.hemi} />
      <primitive object={lights.amb} />
      <primitive object={backing} />
      <primitive object={glow} />
      {BUCKETS.map((k) => (
        <mesh
          key={k}
          geometry={slots.get(k)!.geo}
          material={k === "hero" ? hero : fiberMaterial(k as MaterialKind)}
          castShadow
          receiveShadow
          frustumCulled={false}
        />
      ))}
    </>
  );
};
