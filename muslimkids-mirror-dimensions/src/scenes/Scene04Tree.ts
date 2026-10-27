// СЦЕНА 4 — ОТРАЖЕНИЕ ЖИЗНИ (00:24–00:34).
// Камера скользит над водой: сначала видно отражение дерева, затем камера
// поднимается — и мы видим само дерево на берегу. Рядом маленький росток:
// ускоренная анимация роста (ветви появляются последовательно), рост виден
// одновременно над водой и в отражении.
import { CameraKey } from "../engines/MirrorCameraController";
import { BEATS } from "../engines/MirrorDimensionsEngine";
import { DAY_LIGHT, DUSK_LIGHT, NIGHT_LIGHT, TerrainLight, mixLight } from "../components/MirrorMountains";
import { SkyState } from "../components/SkyDome";
import { lerp, seg } from "../utils/math";

export const S4_CAMERA: CameraKey[] = [
  { t: 25.6, pos: [7, 9, 20], look: [13, -8, -45], fov: 44 },
  { t: 27.3, pos: [11, 5.4, -33], look: [14, -3.5, -62], fov: 42 },
  { t: 28.6, pos: [12.6, 3.0, -46], look: [14.6, 4.6, -66], fov: 42 },
  { t: 29.9, pos: [16.7, 1.45, -56.4], look: [18.4, 1.3, -64.2], fov: 40 },
  { t: 32.1, pos: [16.1, 2.2, -54], look: [18.1, 2.2, -64.5], fov: 41 },
  { t: 34.0, pos: [15.4, 3.4, -51], look: [18, 4.0, -65], fov: 42 },
];

/** Рост ростка: от крошечного побега к молодому дереву. */
export const sproutGrowth = (t: number) =>
  t < BEATS.sproutWord - 0.6 ? 0 : 0.035 + 0.965 * seg(t, BEATS.sproutWord + 0.4, 33.6, (x) => x * x * (3 - 2 * x));

/** Время суток: день → вечер (сцена 5) → ночь. */
export const dayPhase = (t: number) => ({ dusk: seg(t, 32.8, 35.6), night: seg(t, 35.0, 37.6) });

export const valleyLight = (t: number): TerrainLight => {
  const { dusk, night } = dayPhase(t);
  return mixLight(mixLight(DAY_LIGHT, DUSK_LIGHT, dusk), NIGHT_LIGHT, night);
};

export const valleySky = (t: number): SkyState => {
  const { dusk, night } = dayPhase(t);
  const day = 1 - dusk;
  return {
    day: day * (1 - night),
    dusk: dusk * (1 - night),
    night,
    clouds: lerp(lerp(1, 0.3, dusk), 0.0, night),
    stars: night,
    moon: 0,
    sunDir: [lerp(-0.75, -0.55, dusk), lerp(0.5, 0.05, dusk), lerp(0.25, -0.85, dusk)],
  };
};
