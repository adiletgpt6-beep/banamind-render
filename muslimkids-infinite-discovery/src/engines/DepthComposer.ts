// DepthComposer — parallax for layers that float above the ground (clouds, the drop above
// the leaf, out-of-focus foliage). A layer at altitude `pass` (in J units) grows like
// 1 / (h − h_layer): slowly at first, then it rushes past the camera and is gone.
export const layerScale = (J: number, pass: number, k = 1) => {
  const g = Math.pow(2, pass - J) - 1; // camera height above layer, in layer units
  return g <= 0.02 ? Infinity : k / g;
};
/** fade for a layer as the camera approaches/leaves its altitude */
export const layerAlpha = (J: number, pass: number, appear = 3.2) => {
  const d = pass - J;
  if (d <= 0.06) return 0;
  const near = Math.min(1, (d - 0.06) / 0.35);
  const far = Math.max(0, Math.min(1, (appear - d) / 0.9));
  return near * far;
};
