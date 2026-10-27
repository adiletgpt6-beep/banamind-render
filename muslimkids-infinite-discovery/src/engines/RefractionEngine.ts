// RefractionEngine — optics of a water drop resting on a leaf.
// A sessile drop behaves like a thick plano-convex lens: the centre is magnified and the rim
// compresses a wider field of view (fish-eye). We bake that mapping into a displacement map
// used by SVG feDisplacementMap, and expose the magnification as a function of the camera,
// so the lens can relax to 1× when the camera passes "through" the drop (object portal).
import { smoothstep } from "./math";

export const LENS_MAG = 1.55;
export const FISHEYE = 0.55; // sample radius grows as ρ(1 + FISHEYE ρ²)

let url: string | null = null;
/** data-URL of the displacement map (R = dx, G = dy, 0.5 = no shift); max shift = FISHEYE * r */
export const displacementMapURL = () => {
  if (url) return url;
  const N = 256, c = document.createElement("canvas");
  c.width = c.height = N;
  const g = c.getContext("2d")!, img = g.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const px = ((x + 0.5) / N) * 2 - 1, py = ((y + 0.5) / N) * 2 - 1;
    const r2 = px * px + py * py;
    const k = r2 < 1 ? FISHEYE * r2 : 0;
    const i = (y * N + x) * 4;
    img.data[i] = 128 + 127 * px * k / FISHEYE;
    img.data[i + 1] = 128 + 127 * py * k / FISHEYE;
    img.data[i + 2] = 128; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  url = c.toDataURL("image/png");
  return url;
};

/** lens strength 1 → 0 while the camera dives into the drop (J = journey depth) */
export const lensAmount = (J: number) => 1 - smoothstep(18.3, 19.3, J);
export const lensMagnification = (J: number) => 1 + (LENS_MAG - 1) * lensAmount(J);
