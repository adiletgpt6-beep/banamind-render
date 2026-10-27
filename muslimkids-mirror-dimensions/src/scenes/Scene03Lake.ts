// СЦЕНА 3 — ЗЕРКАЛО СТАНОВИТСЯ ОЗЕРОМ (00:15–00:24).
// Камера возвращается к зеркалу; отражение космоса сменяется отражением горной
// долины (Reflection Blending). Зеркало ложится горизонтально, изгибается,
// по нему расходится волна, серебро становится водой (Surface-to-Water).
// Когда поверхность совпадает с озером, вокруг неё раскрывается сама долина
// (Optical Match / Reflection-to-World). Это художественный переход материалов.
import { CameraKey } from "../engines/MirrorCameraController";
import { BEATS } from "../engines/MirrorDimensionsEngine";
import { DEFAULT_MORPH, MorphState } from "../engines/ReflectionMorphEngine";
import { seg, windowed } from "../utils/math";

/** Масштаб: зеркало 2×3 м ложится на 40×60 м поверхности озера. */
export const VALLEY_SCALE = 20;

export const BLEND = [15.9, 17.3] as const; // отражение космоса → отражение долины
export const TILT = [17.1, 19.0] as const; // зеркало ложится горизонтально
export const WATER = [17.5, 19.4] as const; // серебро → вода
export const REVEAL = [18.9, 19.8] as const; // вокруг воды раскрывается долина

export const S3_SPACE_CAMERA: CameraKey[] = [
  { t: 15.3, pos: [2.62, 1.74, 6.85], look: [2.95, 1.6, 3.55], fov: 38 },
  { t: 16.85, pos: [-0.28, 1.92, 4.65], look: [0, 1.5, 0], fov: 40 },
];

/** Путь камеры в единицах долины (общий для зеркала-озера и самой долины). */
export const S3_VALLEY_CAMERA: CameraKey[] = [
  { t: 17.2, pos: [-5.4, 38.6, 92.4], look: [0, 30, 0], fov: 40 },
  { t: 18.3, pos: [-3, 31, 79], look: [0, 4, -6], fov: 42 },
  { t: 19.5, pos: [0, 18, 68], look: [0, 4, -70], fov: 44 },
  { t: 20.9, pos: [0, 10.5, 72], look: [0, 19, -160], fov: 44 },
  { t: 23.3, pos: [4, 9.6, 66], look: [3, 17, -160], fov: 44 },
];

export const mirrorPose = (t: number, yawBefore: number) => {
  const k = seg(t, TILT[0], TILT[1]);
  return {
    position: [0, 1.5 * (1 - k), 0] as [number, number, number],
    rotation: [-Math.PI / 2 * k, yawBefore * (1 - k), 0] as [number, number, number],
    frameOpacity: 1 - seg(t, 18.4, 19.3),
  };
};

export const mirrorMorphS3 = (t: number): Partial<MorphState> => {
  const [a, b] = WATER;
  const len = b - a;
  const bendIn = windowed(t, a, a + len * 0.35, a + len * 0.5, b);
  const wave = seg(t, a + len * 0.2, a + len * 0.45) * (1 - seg(t, a + len * 0.7, b));
  return {
    blend: seg(t, BLEND[0], BLEND[1]),
    blendCenter: [0.5, 0.55],
    bend: 0.07 * bendIn,
    distort: 0.02 * bendIn + 0.035 * wave,
    wave: 0.9 * wave,
    waveRadius: Math.max(0, (t - (a + len * 0.2)) * 0.55),
    swell: seg(t, a + len * 0.5, b) * 0.4,
    waterMix: seg(t, a + len * 0.3, b),
    ripple: seg(t, a + len * 0.5, b) * 0.55,
    rippleScale: VALLEY_SCALE,
    reflectivity: DEFAULT_MORPH.reflectivity + (1 - DEFAULT_MORPH.reflectivity) * seg(t, a, b),
  };
};

/** Время суток долины: день до вечера сцены 5. */
export const lakeShimmer = (t: number) => seg(t, BEATS.waterWord - 0.3, BEATS.waterWord + 1);
