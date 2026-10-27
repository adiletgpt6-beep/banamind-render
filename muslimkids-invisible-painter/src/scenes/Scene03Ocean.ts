// СЦЕНА 3 — ЖИВОЙ ОКЕАН (00:15–00:24)
// Синяя заливка отступает к горизонту, открывая небо → нарисованные полосы моря →
// пробуждение волн → камера скользит над водой → море отступает, проступает
// берег, из зелёных пятен вырастает лес, вдали крупными мазками встают горы.
import { lifeAt } from "../engines/PaintToLifeEngine";
import { lerp, span } from "../utils/noise";

export const S3 = {
  skyReveal: [462, 500] as const,
  seaPaint: [458, 492] as const,
  seaAwaken: [488, 525] as const,
  recede: [548, 610] as const,
  shore: [552, 598] as const,
  forest: [558, 628] as const,
  forestAwaken: [600, 640] as const,
  mountains: [592, 650] as const,
  bank: [600, 650] as const,
};

export const s3 = (f: number) => {
  // PAINT-TO-LIFE: море — сначала рисунок, потом пробуждение волн
  const sea = lifeAt(f, { paint: [...S3.seaPaint], awaken: [...S3.seaAwaken] });
  return {
  skyReveal: span(f, ...S3.skyReveal),
  seaPaint: sea.paint,
  seaAwaken: sea.awaken,
  seaAlive: sea.alive,
  horizon: lerp(760, 862, span(f, ...S3.recede)),
  shore: span(f, ...S3.shore),
  forest: span(f, ...S3.forest),
  landAwaken: span(f, ...S3.forestAwaken),
  mountains: span(f, ...S3.mountains),
  bank: span(f, ...S3.bank),
  };
};
