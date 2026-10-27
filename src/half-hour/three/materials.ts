import * as THREE from "three";

// Материалы персонажей: процедурные текстуры прядей для волос (рисуются один
// раз на canvas, детерминированно), мягкая кожа, блестящие глаза.

const rand = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

let hairMaps: { height: THREE.CanvasTexture; normal: THREE.DataTexture } | null = null;

// Карта высот прядей: вертикальные тонкие полосы разной яркости.
const makeHairMaps = () => {
  if (hairMaps) return hairMaps;
  const S = 256;
  const r = rand(17);
  const h = new Float32Array(S * S);
  for (let k = 0; k < 900; k++) {
    const x0 = r() * S;
    const w = 0.6 + r() * 1.6;
    const amp = 0.3 + r() * 0.7;
    const wave = r() * 6;
    for (let y = 0; y < S; y++) {
      const xc = x0 + Math.sin((y / S) * Math.PI * 2 + wave) * 2.5;
      for (let dx = -3; dx <= 3; dx++) {
        const x = Math.floor(xc + dx);
        const d = Math.abs(xc - (x + 0.5)) / w;
        if (d > 1) continue;
        const xi = ((x % S) + S) % S;
        h[y * S + xi] = Math.max(h[y * S + xi], amp * (1 - d * d));
      }
    }
  }
  // яркость (альбедо-вариация) и нормали из высоты
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  const nrm = new Uint8Array(S * S * 4);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = y * S + x;
      const v = 150 + h[i] * 105;
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
      const hx = h[y * S + ((x + 1) % S)] - h[y * S + ((x + S - 1) % S)];
      const hy = h[((y + 1) % S) * S + x] - h[((y + S - 1) % S) * S + x];
      const n = new THREE.Vector3(-hx * 2.2, -hy * 0.6, 1).normalize();
      nrm[i * 4] = (n.x * 0.5 + 0.5) * 255;
      nrm[i * 4 + 1] = (n.y * 0.5 + 0.5) * 255;
      nrm[i * 4 + 2] = (n.z * 0.5 + 0.5) * 255;
      nrm[i * 4 + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const height = new THREE.CanvasTexture(canvas);
  height.wrapS = height.wrapT = THREE.RepeatWrapping;
  height.colorSpace = THREE.SRGBColorSpace;
  const normal = new THREE.DataTexture(nrm, S, S, THREE.RGBAFormat);
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  normal.needsUpdate = true;
  hairMaps = { height, normal };
  return hairMaps;
};

export const stylizeCharacter = (root: THREE.Object3D) => {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    const out = mats.map((mat) => {
      const src = mat as THREE.MeshStandardMaterial;
      switch (src.name) {
        case "hair": {
          const maps = makeHairMaps();
          const hm = new THREE.MeshStandardMaterial({
            name: "hair",
            color: src.color,
            map: maps.height,
            normalMap: maps.normal,
            normalScale: new THREE.Vector2(0.9, 0.9),
            roughness: 0.48,
            side: THREE.DoubleSide,
          });
          return hm;
        }
        case "skin":
          return new THREE.MeshPhysicalMaterial({
            name: "skin",
            color: src.color,
            roughness: 0.58,
            sheen: 0.4,
            sheenColor: new THREE.Color("#ffd9c4"),
            sheenRoughness: 0.6,
          });
        case "eyes":
          return new THREE.MeshPhysicalMaterial({
            name: "eyes",
            map: src.map,
            color: src.color,
            roughness: 0.15,
            clearcoat: 1,
            clearcoatRoughness: 0.05,
          });
        default:
          src.roughness = Math.max(src.roughness, 0.7);
          return src;
      }
    });
    m.material = Array.isArray(m.material) ? out : out[0];
  });
};
