// Шерсть — мягкая, пушистая, матовая: сильный ворсистый sheen и «пух» в карте нормалей.
// Серебристая нить звёзд — шелковистая, с холодным блеском.
import type { FiberMaterialDef } from "./ThreadMaterialSystem";

export const WOOL: FiberMaterialDef = {
  tex: { size: 256, fibers: 18, tilt: 0.6, depth: 0.55, fuzz: 0.45, slub: 0.15, seed: 7 },
  normalScale: 1.1,
  roughness: 0.95,
  metalness: 0.0,
  sheen: 0.55,
  sheenRoughness: 0.85,
  sheenColor: "#b0b0b0",
  anisotropy: 0.0,
  specularIntensity: 0.2,
};

export const SILVER: FiberMaterialDef = {
  tex: { size: 256, fibers: 32, tilt: 0.55, depth: 0.5, fuzz: 0.03, slub: 0.03, seed: 17 },
  normalScale: 0.45,
  roughness: 0.28,
  metalness: 0.45,
  sheen: 0.35,
  sheenRoughness: 0.3,
  sheenColor: "#9aaab4",
  anisotropy: 0.6,
  specularIntensity: 0.9,
  emissive: "#9fd2ff",
};
