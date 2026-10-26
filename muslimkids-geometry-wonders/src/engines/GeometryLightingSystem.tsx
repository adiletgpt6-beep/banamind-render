// GeometryLightingSystem — свет подчёркивает объём, а не заливает всё.
//
// Пресет = ключевой направленный свет (с тенями при необходимости),
// мягкий заполняющий полусферный свет (небо/земля — «отражённый» свет),
// контровой свет по краю и тёплый точечный акцент. Пресеты смешиваются
// по времени — свет меняется вместе с превращением формы.
import { useMemo } from "react";
import * as THREE from "three";
import { clamp, lerp, mixHex, type Vec3 } from "./GeometryWondersEngine";

export type LightPreset = {
  key: { dir: Vec3; color: string; intensity: number };
  fill: { sky: string; ground: string; intensity: number };
  rim: { dir: Vec3; color: string; intensity: number };
  ambient: number;
  accent?: { pos: Vec3; color: string; intensity: number; distance: number };
};

export const LIGHTS = {
  // Плоский узор: мягкий фронтальный свет, грани читаются.
  pattern: {
    key: { dir: [-3, 4, 6], color: "#fff4e0", intensity: 2.9 },
    fill: { sky: "#cfe9f5", ground: "#205A91", intensity: 0.55 },
    rim: { dir: [4, -2, -3], color: "#59CED2", intensity: 0.8 },
    ambient: 0.25,
  },
  // Объёмная сфера: свет сбоку-сверху — проявляет глубину.
  sphere: {
    key: { dir: [-5, 3, 4], color: "#fff1dc", intensity: 3.0 },
    fill: { sky: "#A4D8F0", ground: "#173f6b", intensity: 0.55 },
    rim: { dir: [5, 1, -4], color: "#59CED2", intensity: 1.1 },
    ambient: 0.12,
  },
  // День и ночь: одно «Солнце» слева; ночная сторона — тёмно-синяя, не чёрная.
  sun: {
    key: { dir: [-10, 3.2, 0.6], color: "#fff3d6", intensity: 3.8 },
    fill: { sky: "#3a6ea8", ground: "#0b1d36", intensity: 0.3 },
    rim: { dir: [6, 2, -5], color: "#59CED2", intensity: 0.25 },
    ambient: 0.06,
  },
  // Горы и лес: утреннее солнце сбоку — каждая грань освещена по-своему.
  landscape: {
    key: { dir: [-8, 9, 4], color: "#fff0d8", intensity: 3.1 },
    fill: { sky: "#bfe4f6", ground: "#3CA68B", intensity: 0.95 },
    rim: { dir: [6, 3, -8], color: "#A4D8F0", intensity: 0.7 },
    ambient: 0.18,
  },
  // Соты: тёплый мёд, мягкие тени в ячейках.
  honey: {
    key: { dir: [-3, 6, 7], color: "#fff0cf", intensity: 2.6 },
    fill: { sky: "#ffe0a3", ground: "#7a4a10", intensity: 0.7 },
    rim: { dir: [4, -3, 3], color: "#ffcf73", intensity: 0.6 },
    ambient: 0.2,
    accent: { pos: [0, 0, 4], color: "#ffd27a", intensity: 14, distance: 16 },
  },
  // Орнамент: спокойный, ровный, с золотыми бликами.
  ornament: {
    key: { dir: [-3, 5, 8], color: "#fff6e6", intensity: 2.3 },
    fill: { sky: "#A4D8F0", ground: "#205A91", intensity: 0.85 },
    rim: { dir: [3, -4, 4], color: "#E8BB65", intensity: 0.6 },
    ambient: 0.3,
  },
} satisfies Record<string, LightPreset>;

export function blendPresets(a: LightPreset, b: LightPreset, k: number): LightPreset {
  const t = clamp(k);
  const v3 = (x: Vec3, y: Vec3): Vec3 => [lerp(x[0], y[0], t), lerp(x[1], y[1], t), lerp(x[2], y[2], t)];
  const col = (x: string, y: string) => `#${mixHex(x, y, t).getHexString()}`;
  return {
    key: { dir: v3(a.key.dir, b.key.dir), color: col(a.key.color, b.key.color), intensity: lerp(a.key.intensity, b.key.intensity, t) },
    fill: { sky: col(a.fill.sky, b.fill.sky), ground: col(a.fill.ground, b.fill.ground), intensity: lerp(a.fill.intensity, b.fill.intensity, t) },
    rim: { dir: v3(a.rim.dir, b.rim.dir), color: col(a.rim.color, b.rim.color), intensity: lerp(a.rim.intensity, b.rim.intensity, t) },
    ambient: lerp(a.ambient, b.ambient, t),
    accent: a.accent ?? b.accent,
  };
}

export type ShadowBox = { size: number; center?: Vec3; mapSize?: number };

export const GeometryLights: React.FC<{ preset: LightPreset; shadow?: ShadowBox }> = ({ preset, shadow }) => {
  const c = shadow?.center ?? [0, 0, 0];
  const target = useMemo(() => new THREE.Object3D(), []);
  const d = preset.key.dir;
  const len = Math.hypot(d[0], d[1], d[2]) || 1;
  const dist = shadow ? shadow.size * 1.6 : 10;
  const keyPos: Vec3 = [c[0] + (d[0] / len) * dist, c[1] + (d[1] / len) * dist, c[2] + (d[2] / len) * dist];
  return (
    <>
      <ambientLight intensity={preset.ambient} color="#ffffff" />
      <hemisphereLight args={[preset.fill.sky, preset.fill.ground, preset.fill.intensity]} />
      <directionalLight
        position={keyPos}
        color={preset.key.color}
        intensity={preset.key.intensity}
        castShadow={Boolean(shadow)}
        shadow-mapSize-width={shadow?.mapSize ?? 2048}
        shadow-mapSize-height={shadow?.mapSize ?? 2048}
        shadow-camera-left={-(shadow?.size ?? 10)}
        shadow-camera-right={shadow?.size ?? 10}
        shadow-camera-top={shadow?.size ?? 10}
        shadow-camera-bottom={-(shadow?.size ?? 10)}
        shadow-camera-near={0.5}
        shadow-camera-far={dist * 3}
        shadow-bias={-0.0008}
        shadow-normalBias={0.03}
        target={target}
      />
      <primitive object={target} position={c} />
      <directionalLight position={preset.rim.dir} color={preset.rim.color} intensity={preset.rim.intensity} />
      {preset.accent ? (
        <pointLight
          position={preset.accent.pos}
          color={preset.accent.color}
          intensity={preset.accent.intensity}
          distance={preset.accent.distance}
          decay={1.6}
        />
      ) : null}
    </>
  );
};

/** Материал с мягкими настройками для граней (без пластикового блеска). */
export function facetMaterialProps(roughness = 0.62, metalness = 0.05) {
  return { roughness, metalness, flatShading: true, side: THREE.DoubleSide } as const;
}
