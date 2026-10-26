// Хлопок — матовый, с небольшой шероховатостью и неровностями пряжи.
// Грубое коричневое волокно (ствол, корни) — глубже бороздки, заметная фактура.
import type { FiberMaterialDef } from "./ThreadMaterialSystem";

export const COTTON: FiberMaterialDef = {
  tex: { size: 256, fibers: 22, tilt: 0.7, depth: 0.8, fuzz: 0.12, slub: 0.18, seed: 23 },
  normalScale: 0.9,
  roughness: 0.82,
  metalness: 0.0,
  sheen: 0.3,
  sheenRoughness: 0.6,
  sheenColor: "#8a948a",
  anisotropy: 0.0,
  specularIntensity: 0.35,
};

export const COARSE: FiberMaterialDef = {
  tex: { size: 256, fibers: 16, tilt: 0.85, depth: 1.0, fuzz: 0.2, slub: 0.35, seed: 41 },
  normalScale: 1.3,
  roughness: 0.9,
  metalness: 0.0,
  sheen: 0.2,
  sheenRoughness: 0.7,
  sheenColor: "#8a7a6a",
  anisotropy: 0.0,
  specularIntensity: 0.3,
};
