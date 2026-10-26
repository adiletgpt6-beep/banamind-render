// ThreadLightingSystem — кинематографический свет по сценам.
// Ключевой мягкий свет (с тенями — видны тени в местах пересечения нитей), заполняющий
// (различимость тёмных волокон), контровой (силуэты нитей), окружение (мягкие блики шёлка).
// Ключи плавно интерполируются, без резких переключений.
import type { LightState } from "./types";
import { interpolateKeys } from "./ThreadCameraController";
import { V3, hexLin, norm } from "../utils/math";

export interface LightKey {
  f: number;
  keyDir: V3; keyColor: V3; keyIntensity: number;
  fillDir: V3; fillColor: V3; fillIntensity: number;
  rimDir: V3; rimColor: V3; rimIntensity: number;
  ambient: number; hemiSky: V3; hemiGround: V3; env: number;
  shadowCenter: V3; shadowSize: number;
  fogNear: number; fogFar: number;
  hold?: boolean;
}

const WARM = hexLin("#FFE9C7");
const COOL = hexLin("#9CC9FF");
const SKYB = hexLin("#7FA8D8");
const GROUND = hexLin("#1A2A3A");

const base = (f: number, o: Partial<LightKey>): LightKey => ({
  f,
  keyDir: [-0.5, 0.75, 0.6], keyColor: WARM, keyIntensity: 2.0,
  fillDir: [0.7, 0.2, 0.6], fillColor: COOL, fillIntensity: 0.5,
  rimDir: [0.2, 0.5, -1], rimColor: hexLin("#BFE6FF"), rimIntensity: 1.0,
  ambient: 0.16, hemiSky: SKYB, hemiGround: GROUND, env: 0.14,
  shadowCenter: [0, 0, 0], shadowSize: 2, fogNear: 30, fogFar: 80,
  ...o,
});

/** Свет по всему фильму (кадры @30 fps). */
export const LIGHT_KEYS: LightKey[] = [
  // Сцена 1: макро золотой нити — мягкий тёплый ключ сверху-слева, тени переплетения
  base(0, { keyDir: [-0.45, 0.8, 0.55], keyIntensity: 1.98, shadowCenter: [0, 0, 0], shadowSize: 0.7, env: 0.18, fogNear: 4, fogFar: 14 }),
  base(150, { keyDir: [-0.45, 0.8, 0.55], keyIntensity: 1.98, shadowCenter: [0, 0, 0], shadowSize: 1.4, env: 0.18, fogNear: 6, fogFar: 20 }),
  // Сцена 2: Земля — боковой солнечный свет слева: ясные день и ночь
  base(215, { keyDir: [-1, 0.25, 0.8], keyIntensity: 3.4, fillIntensity: 0.06, fillDir: [-0.3, 0.2, 1], ambient: 0.035, env: 0.03, rimIntensity: 0.25, rimDir: [-0.6, 0.3, -1], shadowCenter: [0, 0, 0], shadowSize: 2.6, fogNear: 10, fogFar: 30 }),
  base(410, { keyDir: [-1, 0.25, 0.8], keyIntensity: 3.4, fillIntensity: 0.06, fillDir: [-0.3, 0.2, 1], ambient: 0.035, env: 0.03, rimIntensity: 0.25, rimDir: [-0.6, 0.3, -1], shadowCenter: [0, 0, 0], shadowSize: 2.6, fogNear: 10, fogFar: 30 }),
  // Расплетение → горы: свет скользит по склонам, низкий тёплый ключ
  base(500, { keyDir: [-0.7, 0.55, 0.45], keyIntensity: 1.98, fillIntensity: 0.42, ambient: 0.14, env: 0.12, shadowCenter: [0, -0.5, -1.5], shadowSize: 7, fogNear: 6, fogFar: 22 }),
  base(700, { keyDir: [-0.75, 0.5, 0.35], keyIntensity: 1.98, fillIntensity: 0.42, ambient: 0.14, env: 0.12, shadowCenter: [0, -0.5, -1.8], shadowSize: 7, fogNear: 6, fogFar: 22 }),
  // Дерево: свет разделяет ветви и листья, контровой — силуэт кроны
  base(780, { keyDir: [-0.6, 0.7, 0.55], keyIntensity: 2.05, fillIntensity: 0.48, rimIntensity: 1.20, ambient: 0.16, env: 0.14, shadowCenter: [-0.7, -0.4, 0.3], shadowSize: 3.2, fogNear: 5, fogFar: 20 }),
  base(1010, { keyDir: [-0.6, 0.7, 0.55], keyIntensity: 2.05, fillIntensity: 0.48, rimIntensity: 1.20, ambient: 0.16, env: 0.14, shadowCenter: [-0.7, 0.2, 0.0], shadowSize: 4.2, fogNear: 6, fogFar: 24 }),
  // Небо и гобелен: каждый слой отделён светом, без затемнения
  base(1150, { keyDir: [-0.45, 0.6, 0.8], keyIntensity: 1.86, fillIntensity: 0.60, rimIntensity: 1.08, ambient: 0.20, env: 0.16, shadowCenter: [0, 4.2, -1.5], shadowSize: 13, fogNear: 22, fogFar: 60 }),
  base(1360, { keyDir: [-0.45, 0.6, 0.8], keyIntensity: 1.86, fillIntensity: 0.60, rimIntensity: 1.08, ambient: 0.20, env: 0.16, shadowCenter: [0, 4.2, -1.5], shadowSize: 13, fogNear: 22, fogFar: 60 }),
  // Цитата: спокойный, чуть приглушённый свет
  base(1420, { keyDir: [-0.45, 0.6, 0.8], keyIntensity: 1.49, fillIntensity: 0.48, rimIntensity: 0.84, ambient: 0.17, env: 0.13, shadowCenter: [0, 4.2, -1.5], shadowSize: 13, fogNear: 22, fogFar: 64 }),
  base(1600, { keyDir: [-0.45, 0.6, 0.8], keyIntensity: 1.49, fillIntensity: 0.48, rimIntensity: 0.84, ambient: 0.17, env: 0.13, shadowCenter: [0, 4.2, -1.5], shadowSize: 13, fogNear: 22, fogFar: 64 }),
  // Финал: тёплый мягкий свет на золотой нити
  base(1700, { keyDir: [-0.4, 0.7, 0.7], keyIntensity: 1.86, fillIntensity: 0.54, rimIntensity: 0.96, ambient: 0.18, env: 0.17, shadowCenter: [0, 3, 3], shadowSize: 14, fogNear: 14, fogFar: 50 }),
];

export const lightAt = (f: number): LightState => {
  const r = interpolateKeys(f, LIGHT_KEYS as (LightKey & Record<string, unknown>)[], [
    { name: "keyDir", dims: 3 }, { name: "keyColor", dims: 3 }, { name: "keyIntensity", dims: 1 },
    { name: "fillDir", dims: 3 }, { name: "fillColor", dims: 3 }, { name: "fillIntensity", dims: 1 },
    { name: "rimDir", dims: 3 }, { name: "rimColor", dims: 3 }, { name: "rimIntensity", dims: 1 },
    { name: "ambient", dims: 1 }, { name: "hemiSky", dims: 3 }, { name: "hemiGround", dims: 3 }, { name: "env", dims: 1 },
    { name: "shadowCenter", dims: 3 }, { name: "shadowSize", dims: 1 }, { name: "fogNear", dims: 1 }, { name: "fogFar", dims: 1 },
  ]);
  return {
    keyDir: norm(r.keyDir as V3), keyColor: r.keyColor as V3, keyIntensity: r.keyIntensity[0],
    fillDir: norm(r.fillDir as V3), fillColor: r.fillColor as V3, fillIntensity: r.fillIntensity[0],
    rimDir: norm(r.rimDir as V3), rimColor: r.rimColor as V3, rimIntensity: r.rimIntensity[0],
    ambient: r.ambient[0], hemiSky: r.hemiSky as V3, hemiGround: r.hemiGround as V3, env: r.env[0],
    shadowCenter: r.shadowCenter as V3, shadowSize: r.shadowSize[0], fogNear: r.fogNear[0], fogFar: r.fogFar[0],
  };
};
