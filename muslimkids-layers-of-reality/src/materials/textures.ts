// Texture cache: file textures are loaded once (Remotion waits via
// delayRender); procedural canvas textures use fixed seeds.
import * as THREE from "three";
import { continueRender, delayRender, staticFile } from "remotion";
import { leafSurface, veinField } from "../engines/ScientificCutawayEngine";
import { seeded } from "../utils/math";

export interface FileTextures {
  earthColor: THREE.Texture;
  earthRough: THREE.Texture;
  clouds: THREE.Texture;
}
let fileTextures: FileTextures | null = null;
let pending: Promise<FileTextures> | null = null;

export const loadFileTextures = () => {
  if (fileTextures) return Promise.resolve(fileTextures);
  if (pending) return pending;
  const handle = delayRender("textures");
  const loader = new THREE.TextureLoader();
  const load = (f: string, srgb: boolean) =>
    loader.loadAsync(staticFile(`textures/${f}`)).then((t) => {
      t.wrapS = THREE.RepeatWrapping;
      t.anisotropy = 8;
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      return t;
    });
  pending = Promise.all([
    load("earth_color.jpg", true),
    load("earth_rough.jpg", false),
    load("earth_clouds.jpg", false),
  ]).then(([earthColor, earthRough, clouds]) => {
    fileTextures = { earthColor, earthRough, clouds };
    continueRender(handle);
    return fileTextures;
  });
  return pending;
};
export const getFileTextures = () => {
  if (!fileTextures) throw new Error("textures not loaded");
  return fileTextures;
};

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const memo = <T,>(f: () => T) => {
  let v: T | undefined;
  return () => (v ??= f());
};

/** Leaf upper surface: green blade with lighter vein network (UV = u,v). */
export const leafUpperTexture = memo(() =>
  canvasTex(1024, 512, (g) => {
    const W = 1024, H = 512;
    const img = g.createImageData(W, H);
    const rnd = seeded(7);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const u = x / (W - 1), v = 1 - y / (H - 1);
        const vein = veinField(u, v);
        const edge = Math.abs(v * 2 - 1);
        const n = rnd() * 0.05;
        const base = [0.2 + 0.08 * edge + n, 0.6 - 0.06 * edge + n, 0.33 + n];
        const vc = [0.72, 0.86, 0.48];
        const k = vein * 0.85;
        const i = (y * W + x) * 4;
        img.data[i] = 255 * (base[0] * (1 - k) + vc[0] * k);
        img.data[i + 1] = 255 * (base[1] * (1 - k) + vc[1] * k);
        img.data[i + 2] = 255 * (base[2] * (1 - k) + vc[2] * k);
        img.data[i + 3] = 255;
      }
    g.putImageData(img, 0, 0);
  }),
);

const cellsPattern = (
  seed: number, count: number, bg: string, fill: string, wall: string,
  rx: [number, number], ry: [number, number], dots?: string,
) =>
  canvasTex(1024, 512, (g) => {
    const rnd = seeded(seed);
    g.fillStyle = bg;
    g.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < count; i++) {
      const x = rnd() * 1024, y = rnd() * 512;
      const a = rx[0] + rnd() * (rx[1] - rx[0]);
      const b = ry[0] + rnd() * (ry[1] - ry[0]);
      g.beginPath();
      g.ellipse(x, y, a, b, rnd() * Math.PI, 0, Math.PI * 2);
      g.fillStyle = fill;
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = wall;
      g.stroke();
      if (dots) {
        g.fillStyle = dots;
        for (let k = 0; k < 5; k++) {
          g.beginPath();
          g.arc(x + (rnd() - 0.5) * a, y + (rnd() - 0.5) * b, 2.2, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
  });

/** Palisade tissue seen from above: densely packed columnar cells. */
export const palisadeTexture = memo(() =>
  cellsPattern(11, 2600, "#1F6B3F", "#3FA25E", "#BFE6A5", [7, 10], [7, 10], "#1B5E34"),
);
/** Spongy tissue: loose irregular cells with air spaces. */
export const spongyTexture = memo(() =>
  cellsPattern(23, 900, "#2B5E3A", "#6CBF7F", "#D4EFC2", [10, 18], [8, 13], "#2F8A4E"),
);
/** Lower epidermis: pale cells with stomata (pairs of guard cells). */
export const lowerTexture = memo(() =>
  canvasTex(1024, 512, (g) => {
    const rnd = seeded(31);
    g.fillStyle = "#8FCB8E";
    g.fillRect(0, 0, 1024, 512);
    g.strokeStyle = "rgba(240,255,230,0.55)";
    g.lineWidth = 1.5;
    for (let i = 0; i < 1400; i++) {
      const x = rnd() * 1024, y = rnd() * 512;
      g.beginPath();
      g.ellipse(x, y, 9 + rnd() * 5, 6 + rnd() * 4, rnd() * 3, 0, Math.PI * 2);
      g.stroke();
    }
    for (let i = 0; i < 160; i++) {
      const x = rnd() * 1024, y = rnd() * 512, r = rnd() * Math.PI;
      g.save();
      g.translate(x, y);
      g.rotate(r);
      g.fillStyle = "#3E8F57";
      g.beginPath();
      g.ellipse(0, 0, 6, 3.6, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#1E4A30";
      g.fillRect(-4, -0.7, 8, 1.4);
      g.restore();
    }
  }),
);

/** Soft round sprite for clouds / glows. */
export const softDotTexture = memo(() =>
  canvasTex(128, 128, (g) => {
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.5, "rgba(255,255,255,0.45)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  }),
);

export { leafSurface };
