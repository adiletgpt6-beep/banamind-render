// ThreadMaterialSystem — разные волокна, единый стиль «Тканых миров».
// Не пластиковые трубки: у каждого типа своя микрофактура (карта нормалей волокон),
// шероховатость, «sheen» (бархатистый ворс ткани) и анизотропный блеск шёлка вдоль нити.
import * as THREE from "three";
import type { MaterialKind } from "../engines/palette";
import { SILK, GOLD } from "./SilkMaterial";
import { COTTON, COARSE } from "./CottonMaterial";
import { WOOL, SILVER } from "./WoolMaterial";
import { fiberNormalMap, FiberTexOptions } from "../textures/fiberTextures";

export interface FiberMaterialDef {
  tex: FiberTexOptions;
  normalScale: number;
  roughness: number;
  metalness: number;
  sheen: number;
  sheenRoughness: number;
  sheenColor: string;
  anisotropy: number;
  specularIntensity: number;
  clearcoat?: number;
  emissive?: string;
}

const DEFS: Record<MaterialKind, FiberMaterialDef> = {
  gold: GOLD, silk: SILK, cotton: COTTON, wool: WOOL, coarse: COARSE, silver: SILVER,
};

const built = new Map<string, THREE.MeshPhysicalMaterial>();

export const fiberMaterial = (kind: MaterialKind, hero = false): THREE.MeshPhysicalMaterial => {
  const key = hero ? "hero" : kind;
  const hit = built.get(key);
  if (hit) return hit;
  const d = DEFS[kind];
  const m = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    color: 0xffffff,
    roughness: d.roughness,
    metalness: d.metalness,
    normalMap: fiberNormalMap(d.tex),
    normalScale: new THREE.Vector2(d.normalScale, d.normalScale),
    sheen: d.sheen,
    sheenRoughness: d.sheenRoughness,
    sheenColor: new THREE.Color(d.sheenColor),
    anisotropy: d.anisotropy,
    anisotropyRotation: 0,
    specularIntensity: d.specularIntensity,
    clearcoat: d.clearcoat ?? 0,
    emissive: new THREE.Color(d.emissive ?? "#000000"),
    emissiveIntensity: 0,
  });
  built.set(key, m);
  return m;
};
