// Шёлк и декоративная золотая нить: гладкая поверхность, мягкий анизотропный блеск
// вдоль волокон, тонкие отражения. Золото — тёплое, «дорогое», но не металлическое зеркало.
import type { FiberMaterialDef } from "./ThreadMaterialSystem";

export const SILK: FiberMaterialDef = {
  tex: { size: 256, fibers: 30, tilt: 0.55, depth: 0.5, fuzz: 0.04, slub: 0.05, seed: 11 },
  normalScale: 0.45,
  roughness: 0.36,
  metalness: 0.0,
  sheen: 0.35,
  sheenRoughness: 0.32,
  sheenColor: "#9aa6b0",
  anisotropy: 0.55,
  specularIntensity: 0.5,
};

export const GOLD: FiberMaterialDef = {
  tex: { size: 256, fibers: 36, tilt: 0.6, depth: 0.55, fuzz: 0.03, slub: 0.04, seed: 5 },
  normalScale: 0.5,
  roughness: 0.3,
  metalness: 0.25,
  sheen: 0.4,
  sheenRoughness: 0.28,
  sheenColor: "#c8a060",
  anisotropy: 0.65,
  specularIntensity: 0.9,
  emissive: "#ffb648",
};
