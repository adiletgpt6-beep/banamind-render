// СЦЕНА 1 — ЗАГАДОЧНОЕ ОТРАЖЕНИЕ (00:00–00:06).
// Тёмно-синий экран → световой блик скользит по тонкой серебряной поверхности →
// камера отъезжает, открывая объёмное зеркало → зеркало поворачивается, и в
// отражении становится различима Земля (сама планета пока вне кадра).
import { CameraKey } from "../engines/MirrorCameraController";
import { BEATS } from "../engines/MirrorDimensionsEngine";
import { seg, windowed } from "../utils/math";

export const MIRROR_SIZE: [number, number] = [2.0, 3.0];
export const MIRROR_CENTER: [number, number, number] = [0, 1.5, 0];

export const S1_CAMERA: CameraKey[] = [
  { t: 0.0, pos: [0.05, 1.56, 0.42], look: [0, 1.5, 0], fov: 30 },
  { t: 2.4, pos: [-0.12, 1.6, 1.5], look: [0, 1.5, 0], fov: 32 },
  { t: 4.3, pos: [-0.6, 1.62, 5.0], look: [0, 1.5, 0], fov: 38 },
  { t: 6.2, pos: [-0.42, 1.58, 3.5], look: [0.02, 1.5, 0], fov: 36 },
];

/** Световой блик и «полоса» по стеклу: первое, что видит зритель. */
export const s1Light = (t: number) => ({
  glint: [0.28 + 0.46 * seg(t, BEATS.glint, 3.2), 0.62 - 0.2 * seg(t, BEATS.glint, 3.2)] as [number, number],
  glintStrength: windowed(t, BEATS.glint, 1.0, 2.6, 3.6) * 0.45,
  sheen: windowed(t, 1.2, 2.2, 3.4, 4.6),
  sheenPos: -0.7 + 1.4 * seg(t, 1.2, 4.6),
});
