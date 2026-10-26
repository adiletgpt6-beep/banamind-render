// Процедурные текстуры волокон: карты нормалей с микроволокнами вдоль нити.
// u — вдоль длины (1 повтор на длину окружности нити), v — по окружности.
// Детерминированно (фиксированное зерно), генерируются один раз и переиспользуются.
import * as THREE from "three";
import { noise2 } from "../utils/math";

export interface FiberTexOptions {
  size: number;
  fibers: number; // волокон по окружности
  tilt: number; // наклон волокон (скрутка)
  depth: number; // глубина бороздок
  fuzz: number; // пушистость (шерсть)
  slub: number; // неровность (хлопок, грубое волокно)
  seed: number;
}

const cache = new Map<string, THREE.DataTexture>();

export const fiberNormalMap = (o: FiberTexOptions): THREE.DataTexture => {
  const key = JSON.stringify(o);
  const hit = cache.get(key);
  if (hit) return hit;
  const S = o.size;
  const h = new Float32Array(S * S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S;
      // волокна: синус по окружности со сдвигом вдоль длины (скрутка) и дрожанием
      const jitter = noise2(u * 6 + o.seed, v * o.fibers * 0.5) * 0.35;
      const ph = (v * o.fibers + u * o.fibers * o.tilt + jitter) * Math.PI * 2;
      let val = Math.pow(0.5 + 0.5 * Math.sin(ph), 0.7) * o.depth;
      val += noise2(u * 40 + o.seed * 3, v * 40) * o.fuzz;
      val += noise2(u * 3 + o.seed * 7, v * 9) * o.slub;
      h[y * S + x] = val;
    }
  }
  const data = new Uint8Array(S * S * 4);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const xl = (x - 1 + S) % S, xr = (x + 1) % S, yd = (y - 1 + S) % S, yu = (y + 1) % S;
      const dx = (h[y * S + xr] - h[y * S + xl]) * 0.5 * S * 0.02;
      const dy = (h[yu * S + x] - h[yd * S + x]) * 0.5 * S * 0.02;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * S + x) * 4;
      data[i] = Math.round(((-dx / l) * 0.5 + 0.5) * 255);
      data[i + 1] = Math.round(((-dy / l) * 0.5 + 0.5) * 255);
      data[i + 2] = Math.round(((1 / l) * 0.5 + 0.5) * 255);
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
};

/** Саржевое переплетение для подложки неба (большая поверхность — текстурой). */
export const twillTexture = (): THREE.DataTexture => {
  const hit = cache.get("twill");
  if (hit) return hit;
  const S = 256;
  const data = new Uint8Array(S * S * 4);
  const cell = 16;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
      const fx = (x % cell) / cell, fy = (y % cell) / cell;
      const warpOver = (cx + cy) % 3 !== 0;
      const t = warpOver ? Math.sin(fx * Math.PI) : Math.sin(fy * Math.PI);
      const n = noise2(x * 0.3, y * 0.3) * 0.08;
      const v = 0.55 + 0.35 * t + n;
      const i = (y * S + x) * 4;
      data[i] = Math.round(12 * v + 4);
      data[i + 1] = Math.round(32 * v + 6);
      data[i + 2] = Math.round(58 * v + 10);
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 20);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  cache.set("twill", tex);
  return tex;
};

/** Мягкое радиальное свечение для тканого Солнца. */
export const glowTexture = (): THREE.DataTexture => {
  const hit = cache.get("glow");
  if (hit) return hit;
  const S = 128;
  const data = new Uint8Array(S * S * 4);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const d = Math.hypot(x - S / 2 + 0.5, y - S / 2 + 0.5) / (S / 2);
      const a = Math.pow(Math.max(0, 1 - d), 2.2);
      const i = (y * S + x) * 4;
      data[i] = 255; data[i + 1] = 214; data[i + 2] = 140; data[i + 3] = Math.round(a * 255);
    }
  }
  const tex = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  cache.set("glow", tex);
  return tex;
};
