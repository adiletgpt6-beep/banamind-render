// Текстуры загружаются один раз до первого кадра (delayRender на уровне
// композиции), затем доступны синхронно — 3D-холсты рендерят кадр сразу полностью.
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";

type Spec = { srgb: boolean; repeat: boolean };
export const TEXTURE_SPECS: Record<string, Spec> = {
  "earth_atmos_2048.jpg": { srgb: true, repeat: false },
  "earth_lights_2048.png": { srgb: true, repeat: false },
  "earth_clouds_alpha.png": { srgb: false, repeat: false },
  "earth_specular_2048.jpg": { srgb: false, repeat: false },
  "earth_normal_2048.jpg": { srgb: false, repeat: false },
  "waternormals.jpg": { srgb: false, repeat: true },
};

const ready = new Map<string, THREE.Texture>();
let loading: Promise<void> | null = null;

const loadAll = () =>
  (loading ??= Promise.all(
    Object.entries(TEXTURE_SPECS).map(
      ([file, spec]) =>
        new Promise<void>((resolve, reject) => {
          new THREE.TextureLoader().load(
            staticFile(`assets/textures/${file}`),
            (t) => {
              t.colorSpace = spec.srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
              t.anisotropy = 4;
              if (spec.repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
              ready.set(file, t);
              resolve();
            },
            undefined,
            reject,
          );
        }),
    ),
  ).then(() => undefined));

const allReady = () => ready.size === Object.keys(TEXTURE_SPECS).length;

/** На уровне композиции: true, когда все текстуры загружены. */
export const useTexturesReady = () => {
  const [ok, setOk] = useState(allReady);
  const [handle] = useState(() => (allReady() ? null : delayRender("textures")));
  useEffect(() => {
    if (ok) return;
    loadAll()
      .then(() => {
        setOk(true);
        if (handle !== null) continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [ok, handle]);
  return ok;
};

/** Синхронный доступ к заранее загруженной текстуре. */
export const useTexture = (file: string): THREE.Texture => {
  const t = ready.get(file);
  if (!t) throw new Error(`Текстура ${file} не загружена заранее`);
  return t;
};
