// LayerMaterialSystem — one material family per explained object; nothing is
// "all glass" or "all metal". Materials are created once and reused across
// layers, models and canvases.
import * as THREE from "three";
import { getFileTextures, leafUpperTexture, lowerTexture, palisadeTexture, spongyTexture } from "../materials/textures";
import { SUN_DIR } from "../compositions/layout";

const memo = <T,>(f: () => T) => {
  let v: T | undefined;
  return () => (v ??= f());
};

const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);

/** Emissive tinted by the vertex colour: section faces stay readable (in
 *  their own colour) even when they face away from the key light. */
const selfLitVertexColors = (m: THREE.MeshStandardMaterial) => {
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      "vec3 totalEmissiveRadiance = emissive;",
      "vec3 totalEmissiveRadiance = emissive * vColor;",
    );
  };
  m.customProgramCacheKey = () => "selfLitVertexColors";
  return m;
};

export const earthMaterials = memo(() => {
  const tx = getFileTextures();
  const surface = std({ map: tx.earthColor, roughnessMap: tx.earthRough, roughness: 1, metalness: 0 });
  const layerOuter = {
    crust: surface,
    mantle: std({ color: "#A85A33", roughness: 0.75, emissive: "#A85A33", emissiveIntensity: 0.3 }),
    outerCore: std({ color: "#E39A3E", roughness: 0.6, emissive: "#6B3A10", emissiveIntensity: 0.35 }),
    innerCore: std({ color: "#F6D58A", roughness: 0.5, emissive: "#8A6420", emissiveIntensity: 0.45 }),
  };
  const layerInner = {
    crust: std({ color: "#7B5B40", roughness: 0.85, emissive: "#7B5B40", emissiveIntensity: 0.35 }),
    mantle: std({ color: "#A0552F", roughness: 0.8, emissive: "#A0552F", emissiveIntensity: 0.35 }),
    outerCore: std({ color: "#D88A34", roughness: 0.7, emissive: "#D88A34", emissiveIntensity: 0.35 }),
    innerCore: std({ color: "#F3C766", roughness: 0.6, emissive: "#F3C766", emissiveIntensity: 0.35 }),
  };
  // CUTAWAY SURFACE: vertex-coloured section faces, softly self-lit so the
  // inside is never pitch black.
  const section = selfLitVertexColors(std({
    vertexColors: true, roughness: 0.62, metalness: 0,
    emissive: "#FFFFFF", emissiveIntensity: 0.42,
  }));
  const clouds = std({
    color: "#FFFFFF", alphaMap: tx.clouds, transparent: true, depthWrite: false,
    roughness: 0.9, opacity: 0.8,
  });
  clouds.alphaMap!.wrapS = THREE.RepeatWrapping;
  const atmosphere = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color("#A0DCF1") },
      uSun: { value: SUN_DIR.clone() },
      uOpacity: { value: 1 },
      uBase: { value: 0.05 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        vN = normalize(normalMatrix * normal);
        vW = normalize(mat3(modelMatrix) * normal);
        vV = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform vec3 uSun; uniform float uOpacity; uniform float uBase;
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main(){
        float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
        float rim = pow(f, 3.2);
        float lit = 0.25 + 0.75 * smoothstep(-0.35, 0.55, dot(normalize(vW), normalize(uSun)));
        float a = (rim * 0.95 + uBase) * lit * uOpacity;
        gl_FragColor = vec4(uColor * a, a);
      }`,
  });
  const gold = new THREE.MeshBasicMaterial({ color: "#EFC374", transparent: true, toneMapped: false });
  return { surface, layerOuter, layerInner, section, clouds, atmosphere, gold };
});

export const rockMaterials = memo(() => ({
  strata: selfLitVertexColors(std({ vertexColors: true, roughness: 0.88, metalness: 0, emissive: "#FFFFFF", emissiveIntensity: 0.16 })),
  surface: std({ vertexColors: true, roughness: 0.78, metalness: 0 }),
  forest: std({ color: "#2E7D52", roughness: 0.8 }),
  cloud: new THREE.SpriteMaterial({ color: "#FFFFFF", transparent: true, depthWrite: false, opacity: 0.7 }),
}));

export const plantMaterials = memo(() => {
  const upper = new THREE.MeshPhysicalMaterial({
    map: leafUpperTexture(), roughness: 0.38, clearcoat: 0.35, clearcoatRoughness: 0.4,
    transparent: true, side: THREE.FrontSide,
  });
  const leafRim = std({ color: "#2F7A47", roughness: 0.6, transparent: true });
  return {
    upper,
    palisade: std({ map: palisadeTexture(), roughness: 0.6, transparent: true }),
    spongy: std({ map: spongyTexture(), roughness: 0.65, transparent: true }),
    lower: std({ map: lowerTexture(), roughness: 0.7, transparent: true }),
    bottomSide: std({ color: "#4E9E62", roughness: 0.7, transparent: true }),
    leafRim,
    rimPalisade: std({ color: "#2F8A4E", roughness: 0.6, transparent: true }),
    rimSpongy: std({ color: "#6CBF7F", roughness: 0.6, transparent: true }),
    vein: std({ color: "#D9EBA0", roughness: 0.45, emissive: "#C9E27A", emissiveIntensity: 0, transparent: true }),
    // PLANT TISSUE (magnified cells)
    cellWall: std({ color: "#9AD89A", roughness: 0.3, transparent: true, opacity: 0.3, depthWrite: false, emissive: "#2F7A47", emissiveIntensity: 0.25 }),
    cellWallBack: std({ color: "#2F7A47", roughness: 0.6, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.BackSide }),
    epidermisCell: std({ color: "#D8F2C4", roughness: 0.3, transparent: true, opacity: 0.32, depthWrite: false, emissive: "#6FB58A", emissiveIntensity: 0.2 }),
    chloroplast: std({ color: "#2E8B4A", roughness: 0.45, emissive: "#0E3B1C", emissiveIntensity: 0.3 }),
    nucleus: std({ color: "#A99BC4", roughness: 0.5 }),
    xylem: std({ color: "#C08A62", roughness: 0.55 }),
    phloem: std({ color: "#E8E3A6", roughness: 0.55 }),
    bundleSheath: std({ color: "#D9EBA0", roughness: 0.4, transparent: true, opacity: 0.35, depthWrite: false }),
    // tree
    bark: std({ color: "#7A5A40", roughness: 0.9 }),
    foliage: std({ color: "#FFFFFF", roughness: 0.6, side: THREE.DoubleSide }),
    grass: std({ vertexColors: true, roughness: 0.85 }),
    highlight: new THREE.MeshBasicMaterial({ color: "#EFC374", transparent: true, toneMapped: false }),
  };
});
