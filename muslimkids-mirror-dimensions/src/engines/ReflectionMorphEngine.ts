// ReflectionMorphEngine: осмысленные трансформации отражающей поверхности.
//
//  1. Mirror Bending        — uBend: поверхность плавно изгибается;
//  2. Surface Distortion    — uDistort: отражение смещается по нормали;
//  3. Reflection Blending   — uBlend: отражение A сменяется отражением B
//                             расходящимся кругом (как капля на стекле);
//  4. Surface-to-Water      — uWaterMix + uWave + uRipple: серебро → вода;
//  5. Reflection-to-World   — см. ReflectionSceneComposer (маска мира);
//  6. Mirror Recomposition  — см. MirrorKaleidoscopeEngine (раскладка панелей);
//  7. Optical Match         — совпадение отражённого кадра и прямого вида.
//
// Состояние морфа — обычный объект чисел, вычисляемый из времени; движок
// переносит его в uniforms шейдера.
import * as THREE from "three";
import { mirrorSurfaceFragment, mirrorSurfaceVertex } from "../shaders/mirrorSurface";
import { PALETTE } from "./MirrorLightingSystem";
import { seg, windowed } from "../utils/math";

export type MorphState = {
  blend: number;
  blendCenter: [number, number];
  bend: number;
  distort: number;
  wave: number;
  waveRadius: number;
  waveCenter: [number, number];
  swell: number;
  waterMix: number;
  ripple: number;
  rippleScale: number;
  reflectivity: number;
  sheen: number;
  sheenPos: number;
  glint: [number, number];
  glintStrength: number;
  edgeFade: number;
  opacity: number;
  levelDim: number;
};

export const DEFAULT_MORPH: MorphState = {
  blend: 0,
  blendCenter: [0.5, 0.5],
  bend: 0,
  distort: 0,
  wave: 0,
  waveRadius: 0,
  waveCenter: [0.5, 0.5],
  swell: 0,
  waterMix: 0,
  ripple: 0,
  rippleScale: 1,
  reflectivity: 0.92,
  sheen: 0,
  sheenPos: -1,
  glint: [0.5, 0.5],
  glintStrength: 0,
  edgeFade: 0,
  opacity: 1,
  levelDim: 1,
};

const black = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
black.needsUpdate = true;

export const createMirrorSurfaceMaterial = (waterNormal: THREE.Texture, size: [number, number]) =>
  new THREE.ShaderMaterial({
    vertexShader: mirrorSurfaceVertex,
    fragmentShader: mirrorSurfaceFragment,
    transparent: true,
    uniforms: {
      tReflA: { value: black },
      tReflB: { value: black },
      tWaterNormal: { value: waterNormal },
      uTexMatA: { value: new THREE.Matrix4() },
      uTexMatB: { value: new THREE.Matrix4() },
      uSize: { value: new THREE.Vector2(...size) },
      uBlend: { value: 0 },
      uBlendCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uBend: { value: 0 },
      uDistort: { value: 0 },
      uWave: { value: 0 },
      uWaveRadius: { value: 0 },
      uWaveCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uSwell: { value: 0 },
      uWaterMix: { value: 0 },
      uRipple: { value: 0 },
      uRippleScale: { value: 1 },
      uReflectivity: { value: 0.92 },
      uMirrorTint: { value: new THREE.Color(0.94, 0.97, 1.0) },
      uWaterDeep: { value: new THREE.Color(PALETTE.deepWater) },
      uWaterShallow: { value: new THREE.Color(PALETTE.turquoise).multiplyScalar(0.35) },
      uSheen: { value: 0 },
      uSheenPos: { value: -1 },
      uGlint: { value: new THREE.Vector2(0.5, 0.5) },
      uGlintStrength: { value: 0 },
      uEdgeFade: { value: 0 },
      uOpacity: { value: 1 },
      uTime: { value: 0 },
      uLevelDim: { value: 1 },
    },
  });

export const applyMorph = (m: THREE.ShaderMaterial, s: MorphState, time: number) => {
  const u = m.uniforms;
  u.uBlend.value = s.blend;
  u.uBlendCenter.value.set(...s.blendCenter);
  u.uBend.value = s.bend;
  u.uDistort.value = s.distort;
  u.uWave.value = s.wave;
  u.uWaveRadius.value = s.waveRadius;
  u.uWaveCenter.value.set(...s.waveCenter);
  u.uSwell.value = s.swell;
  u.uWaterMix.value = s.waterMix;
  u.uRipple.value = s.ripple;
  u.uRippleScale.value = s.rippleScale;
  u.uReflectivity.value = s.reflectivity;
  u.uSheen.value = s.sheen;
  u.uSheenPos.value = s.sheenPos;
  u.uGlint.value.set(...s.glint);
  u.uGlintStrength.value = s.glintStrength;
  u.uEdgeFade.value = s.edgeFade;
  u.uOpacity.value = s.opacity;
  u.uLevelDim.value = s.levelDim;
  u.uTime.value = time;
  m.depthWrite = s.opacity > 0.98;
};

/**
 * Surface-to-Water: художественный переход «зеркало → поверхность озера»
 * на интервале [a, b] секунд. Сначала изгиб, затем кольцевая волна из центра,
 * серебро постепенно «теплеет» в голубую воду, остаётся мелкая рябь.
 */
export const surfaceToWater = (t: number, a: number, b: number): Partial<MorphState> => {
  const len = b - a;
  const bendIn = windowed(t, a, a + len * 0.3, a + len * 0.45, a + len * 0.8);
  const wave = seg(t, a + len * 0.25, a + len * 0.45) * (1 - seg(t, b, b + 2.5));
  return {
    bend: 0.06 * bendIn,
    distort: 0.012 * bendIn + 0.006 * wave,
    wave: 0.9 * wave,
    waveRadius: (t - (a + len * 0.25)) * 0.45,
    swell: seg(t, a + len * 0.5, b),
    waterMix: seg(t, a + len * 0.35, b),
    ripple: seg(t, a + len * 0.55, b) * 0.6,
  };
};
