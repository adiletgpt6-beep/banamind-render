// Фабрика шейдерных материалов и детерминированная загрузка текстур.
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import {
  NoColorSpace,
  RepeatWrapping,
  ShaderMaterial,
  ShaderMaterialParameters,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  UniformsLib,
  UniformsUtils,
} from "three";

export function shader(p: ShaderMaterialParameters & { fog?: boolean }) {
  const uniforms = p.fog ? UniformsUtils.merge([UniformsLib.fog, p.uniforms ?? {}]) : p.uniforms;
  // merge() клонирует значения: текстуры возвращаем по ссылке.
  if (p.fog && p.uniforms) {
    for (const k of Object.keys(p.uniforms)) {
      if (p.uniforms[k].value instanceof Texture) uniforms![k].value = p.uniforms[k].value;
    }
  }
  return new ShaderMaterial({ ...p, uniforms });
}

const cache = new Map<string, Texture>();

/** Все текстуры фильма: (путь, цветовая ли, повторяемая ли). */
const TEXTURES: [string, boolean, boolean][] = [
  ["textures/paper.jpg", false, true],
  ["textures/earth_day.jpg", true, false],
  ["textures/earth_data.png", false, false],
  ["textures/earth_clouds.jpg", false, false],
  ["textures/leaf.png", true, false],
  ["textures/leaf_bump.jpg", false, false],
];

/**
 * Загрузить все текстуры ДО монтирования WebGL-холста.
 * R3F рисует кадр по требованию: текстура, пришедшая после отрисовки,
 * не попала бы в кадр. Поэтому сцена появляется только когда всё готово.
 */
export function usePreloadTextures() {
  const [ready, setReady] = useState(() => TEXTURES.every(([p]) => cache.has(p)));
  useEffect(() => {
    if (ready) return;
    const handle = delayRender("Загрузка текстур");
    const loader = new TextureLoader();
    Promise.all(
      TEXTURES.map(async ([path, color, repeat]) => {
        const t = await loader.loadAsync(staticFile(path));
        t.colorSpace = color ? SRGBColorSpace : NoColorSpace;
        t.anisotropy = 8;
        t.wrapS = RepeatWrapping;
        if (repeat) t.wrapT = RepeatWrapping;
        cache.set(path, t);
      }),
    )
      .then(() => {
        setReady(true);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [ready]);
  return ready;
}

/** Текстура из public/ (предзагружена usePreloadTextures). */
export function useTex(path: string) {
  const t = cache.get(path);
  if (!t) throw new Error(`Текстура не предзагружена: ${path}`);
  return t;
}
