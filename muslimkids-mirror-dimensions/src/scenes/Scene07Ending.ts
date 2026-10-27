// СЦЕНА 7 — ФИНАЛЬНОЕ ОТРАЖЕНИЕ (00:54–01:00).
// Зеркальная композиция складывается, её место занимает тихое ночное озеро.
// На берегу мальчик смотрит на звёзды, затем на воду; камера отходит над водой
// и опускается к поверхности — в озере отражаются Луна и звёзды.
import { CameraKey } from "../engines/MirrorCameraController";
import { heightAt } from "../geometry/terrain";
import { seg } from "../utils/math";

const BOY_X = -3;
/** Ближайшая к озеру сухая точка берега на линии x = BOY_X. */
const BOY_Z = (() => {
  for (let z = -6 + 64 * 0.9; z < 140; z += 0.25) if (heightAt(BOY_X, z) > 0.35) return z + 0.6;
  return 80;
})();
export const BOY_POS: [number, number, number] = [BOY_X, heightAt(BOY_X, BOY_Z + 0.6) - 0.02, BOY_Z + 0.6];

/** Луна над берегом, за спиной мальчика — её дорожка ложится на воду к камере. */
export const MOON_DIR: [number, number, number] = [-0.06, 0.3, 1];

export const S7_CAMERA: CameraKey[] = [
  { t: 55.0, pos: [BOY_X - 0.6, BOY_POS[1] + 1.9, BOY_POS[2] - 7.5], look: [BOY_X, BOY_POS[1] + 2.2, BOY_POS[2] + 6], fov: 42 },
  { t: 57.6, pos: [BOY_X + 0.4, BOY_POS[1] + 1.1, BOY_POS[2] - 17], look: [BOY_X, BOY_POS[1] + 2.8, BOY_POS[2] + 22], fov: 44 },
  { t: 60.0, pos: [BOY_X + 0.8, 0.42, BOY_POS[2] - 25], look: [BOY_X, BOY_POS[1] + 3.6, BOY_POS[2] + 30], fov: 46 },
];

/** Мальчик: сначала смотрит на звёздное небо, потом на озеро. */
export const boyHead = (t: number) => -0.55 * seg(t, 54.6, 55.6) + 0.85 * seg(t, 56.9, 58.0);
