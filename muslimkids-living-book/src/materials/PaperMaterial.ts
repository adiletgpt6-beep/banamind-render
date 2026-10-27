import * as THREE from "three";
import { coverTextures, endpaperTexture, pageEdgeTexture, pageTexture, paperGrain, paperTint } from "./textures";

// Материалы бумаги: матовые, с волокнами (bumpMap) и мягким рассеянием.

const cache = new Map<string, THREE.Material>();
const once = <T extends THREE.Material>(key: string, make: () => T): T => {
  let m = cache.get(key);
  if (!m) {
    m = make();
    cache.set(key, m);
  }
  return m as T;
};

export type PaperOpts = {
  roughness?: number;
  side?: THREE.Side;
  emissive?: string;
  emissiveIntensity?: number;
  flat?: boolean;
  transparent?: boolean;
  opacity?: number;
  metalness?: number;
};

/** Цветная бумага: оттенок × зерно. */
export const paper = (color: string, o: PaperOpts = {}) =>
  once(`paper:${color}:${JSON.stringify(o)}`, () => {
    const m = new THREE.MeshStandardMaterial({
      color,
      map: paperTint(),
      bumpMap: paperGrain(),
      bumpScale: 0.6,
      roughness: o.roughness ?? 0.88,
      metalness: o.metalness ?? 0,
      side: o.side ?? THREE.DoubleSide,
      flatShading: o.flat ?? false,
      transparent: o.transparent ?? false,
      opacity: o.opacity ?? 1,
      depthWrite: !(o.transparent ?? false),
    });
    if (o.emissive) {
      m.emissive = new THREE.Color(o.emissive);
      m.emissiveIntensity = o.emissiveIntensity ?? 0.3;
    }
    return m;
  });

/** Страница с иллюстрацией. */
export const pageMaterial = (key: string) =>
  once(`page:${key}`, () =>
    new THREE.MeshStandardMaterial({
      map: pageTexture(key),
      bumpMap: paperGrain(),
      bumpScale: 0.35,
      roughness: 0.92,
      metalness: 0,
    }),
  );

export const endpaperMaterial = () =>
  once("endpaper", () =>
    new THREE.MeshStandardMaterial({ map: endpaperTexture(), bumpMap: paperGrain(), bumpScale: 0.3, roughness: 0.9 }),
  );

export const pageEdgeMaterial = () =>
  once("edge", () => new THREE.MeshStandardMaterial({ map: pageEdgeTexture(), roughness: 0.95 }));

/** Тканевый переплёт обложки с золотым тиснением (metal/rough карта). */
export const coverOuterMaterial = () =>
  once("cover-outer", () => {
    const t = coverTextures();
    return new THREE.MeshStandardMaterial({
      map: t.map,
      metalnessMap: t.metal,
      roughnessMap: t.metal,
      metalness: 1,
      roughness: 1,
      bumpMap: t.bump,
      bumpScale: 2.2,
      envMapIntensity: 1.2,
    });
  });

export const coverClothMaterial = () =>
  once("cover-cloth", () =>
    new THREE.MeshStandardMaterial({
      color: "#152d47",
      map: paperTint(),
      bumpMap: paperGrain(),
      bumpScale: 0.8,
      roughness: 0.8,
    }),
  );
