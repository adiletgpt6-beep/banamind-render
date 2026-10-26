// Карта Земли для анимации: настоящие очертания материков (Natural Earth,
// пакет world-atlas, 1:50 млн) → равнопромежуточная текстура.
// Материки окрашены по широте (тропики/умеренный пояс/пустыни/полярные льды)
// со стилизованным шумом; океан — с более светлым мелководьем у берегов.
// Всё детерминировано и считается один раз на вкладку браузера.
import { geoEquirectangular, geoPath } from "d3-geo";
import * as THREE from "three";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land50 from "world-atlas/land-50m.json";
import { fbm } from "../engines/ProceduralWorldBuilder";

const W = 2048;
const H = 1024;

type EarthData = {
  texture: THREE.CanvasTexture;
  clouds: THREE.CanvasTexture;
  pixels: Uint8ClampedArray;
  landMask: Uint8Array;
};

let cache: EarthData | null = null;

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const C = {
  oceanDeep: hex("#1b4f86"),
  ocean: hex("#2a6fb0"),
  shelf: hex("#4fa6cf"),
  tropic: hex("#3ca66b"),
  green: hex("#4caf73"),
  forest: hex("#2f8a62"),
  steppe: hex("#9fb866"),
  desert: hex("#cf9f62"),
  desertDeep: hex("#b98146"),
  ice: hex("#f2f0ea"),
  tundra: hex("#9fb7a6"),
};
const mixc = (a: number[], b: number[], t: number) => a.map((x, i) => x + (b[i] - x) * Math.min(1, Math.max(0, t)));

// Засушливые области (стилизация): центр, радиусы по широте/долготе, сила.
const DRY: [number, number, number, number, number][] = [
  [22, 8, 11, 30, 1.0], // Сахара
  [23, 47, 8, 12, 1.0], // Аравия
  [-25, 132, 9, 15, 0.9], // Австралия
  [-23, 20, 6, 7, 0.65], // Калахари
  [32, -111, 5, 7, 0.7], // юго-запад Северной Америки
  [-24, -69, 6, 3, 0.6], // Атакама
  [-42, -68, 6, 4, 0.5], // Патагония
];

function landColor(lat: number, lon: number): number[] {
  const n = fbm(lon * 0.09, lat * 0.09, 4, 5);
  const a = Math.abs(lat);
  if (lat < -62 || a > 74 + n * 6) return C.ice;
  if (a > 63) return mixc(C.tundra, C.ice, (a - 63) / 11);
  let dry = 0;
  for (const [la, lo, rl, ro, k] of DRY) {
    const d = ((lat - la) / rl) ** 2 + ((lon - lo) / ro) ** 2;
    dry = Math.max(dry, k * Math.exp(-d * 0.9));
  }
  dry *= 0.55 + 0.8 * fbm(lon * 0.16 + 4, lat * 0.16, 3, 13);
  const sm = (a0: number, a1: number, x: number) => {
    const u = Math.min(1, Math.max(0, (x - a0) / (a1 - a0)));
    return u * u * (3 - 2 * u);
  };
  let base: number[];
  if (a < 14) base = mixc(C.tropic, C.forest, n);
  else if (a > 50) base = mixc(C.forest, C.tundra, (a - 50) / 16);
  else base = mixc(C.green, C.forest, n * 1.2 - 0.2);
  const steppe = mixc(base, C.steppe, sm(0.22, 0.42, dry));
  return mixc(steppe, mixc(C.desert, C.desertDeep, sm(0.6, 0.95, dry)), sm(0.4, 0.62, dry));
}

export function getEarth(): EarthData {
  if (cache) return cache;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  const topo = land50 as unknown as Topology<{ land: GeometryCollection }>;
  const landGeo = feature(topo, topo.objects.land);
  const proj = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]);
  ctx.beginPath();
  geoPath(proj, ctx)(landGeo);
  ctx.fillStyle = "#fff";
  ctx.fill();
  const img = ctx.getImageData(0, 0, W, H);
  const mask = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) mask[i] = img.data[i * 4] > 127 ? 1 : 0;
  // Мелководье: расстояние до берега (грубая дилатация маски).
  const near = new Float32Array(W * H);
  const R = 7;
  const tmp = new Float32Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let m = 0;
      for (let k = -R; k <= R; k++) if (mask[y * W + ((x + k + W) % W)]) m = Math.max(m, 1 - Math.abs(k) / (R + 1));
      tmp[y * W + x] = m;
    }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let m = 0;
      for (let k = -R; k <= R; k++) {
        const yy = Math.min(H - 1, Math.max(0, y + k));
        m = Math.max(m, tmp[yy * W + x] * (1 - Math.abs(k) / (R + 1)));
      }
      near[y * W + x] = m;
    }
  const d = img.data;
  for (let y = 0; y < H; y++) {
    const lat = 90 - ((y + 0.5) / H) * 180;
    for (let x = 0; x < W; x++) {
      const lon = ((x + 0.5) / W) * 360 - 180;
      const i = y * W + x;
      let col: number[];
      if (mask[i]) col = landColor(lat, lon);
      else {
        const depth = fbm(lon * 0.05 + 9, lat * 0.05, 3, 21);
        col = mixc(mixc(C.ocean, C.oceanDeep, depth * 0.9), C.shelf, near[i] * 0.75);
        if (Math.abs(lat) > 70) col = mixc(col, C.ice, (Math.abs(lat) - 70) / 12);
      }
      d[i * 4] = col[0];
      d[i * 4 + 1] = col[1];
      d[i * 4 + 2] = col[2];
      d[i * 4 + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  // Облака: мягкий шум с порогом, белые с прозрачностью.
  const cw = 1024;
  const ch = 512;
  const cc = document.createElement("canvas");
  cc.width = cw;
  cc.height = ch;
  const cctx = cc.getContext("2d")!;
  const cimg = cctx.createImageData(cw, ch);
  for (let y = 0; y < ch; y++) {
    const lat = 90 - (y / ch) * 180;
    const band = 0.6 + 0.4 * Math.cos((lat * Math.PI) / 30) ** 2;
    for (let x = 0; x < cw; x++) {
      const v = fbm(x / 70, y / 45, 5, 77) * band;
      const a = Math.min(1, Math.max(0, (v - 0.47) * 3.2));
      const i = (y * cw + x) * 4;
      cimg.data[i] = 255;
      cimg.data[i + 1] = 255;
      cimg.data[i + 2] = 255;
      cimg.data[i + 3] = a * 220;
    }
  }
  cctx.putImageData(cimg, 0, 0);
  const clouds = new THREE.CanvasTexture(cc);
  clouds.colorSpace = THREE.SRGBColorSpace;
  cache = { texture, clouds, pixels: d, landMask: mask };
  return cache;
}

/** Цвет поверхности в точке (широта/долгота в градусах). */
export function earthColorAt(lat: number, lon: number): THREE.Color {
  const { pixels } = getEarth();
  const x = Math.min(W - 1, Math.max(0, Math.floor(((lon + 180) / 360) * W)));
  const y = Math.min(H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * H)));
  const i = (y * W + x) * 4;
  return new THREE.Color().setRGB(pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255, THREE.SRGBColorSpace);
}

// ---------- сферические координаты ----------
const D = Math.PI / 180;
/** Локальные координаты Земли: север +y, долгота 0 смотрит на +z, восток +x. */
export function llToVec(lat: number, lon: number, r = 1): [number, number, number] {
  return [r * Math.cos(lat * D) * Math.sin(lon * D), r * Math.sin(lat * D), r * Math.cos(lat * D) * Math.cos(lon * D)];
}

/** Точка на расстоянии theta (рад) от (lat0, lon0) по азимуту bearing (рад, от севера по часовой). */
export function destination(lat0: number, lon0: number, theta: number, bearing: number) {
  const p1 = lat0 * D;
  const l1 = lon0 * D;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(theta) + Math.cos(p1) * Math.sin(theta) * Math.cos(bearing));
  const l2 = l1 + Math.atan2(Math.sin(bearing) * Math.sin(theta) * Math.cos(p1), Math.cos(theta) - Math.sin(p1) * Math.sin(p2));
  let lon = l2 / D;
  lon = ((((lon + 180) % 360) + 360) % 360) - 180;
  return { lat: p2 / D, lon };
}

/** UV-сфера с нашей ориентацией и UV для равнопромежуточной карты. */
export function earthGeometry(r: number, seg = 128): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const nrm: number[] = [];
  const idx: number[] = [];
  const rows = seg / 2;
  for (let j = 0; j <= rows; j++) {
    const lat = 90 - (j / rows) * 180;
    for (let i = 0; i <= seg; i++) {
      const lon = (i / seg) * 360 - 180;
      const v = llToVec(lat, lon, 1);
      pos.push(v[0] * r, v[1] * r, v[2] * r);
      nrm.push(...v);
      uv.push(i / seg, 1 - j / rows);
    }
  }
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < seg; i++) {
      const a = j * (seg + 1) + i;
      const b = a + seg + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}
