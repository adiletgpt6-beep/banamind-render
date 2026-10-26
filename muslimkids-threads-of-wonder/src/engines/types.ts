import type { MaterialKind } from "./palette";
import type { V3 } from "../utils/math";

/** Состояние одной нити в конкретном кадре — то, что получает TubeBuilder. */
export interface ThreadDraw {
  /** Постоянный ID (ThreadContinuityEngine): одинаковый во всех сценах для «той же» нити. */
  id: string;
  /** Центральная линия: n точек xyz. */
  pts: Float32Array;
  /** Цвет по точкам (линейный RGB, n×3) или единый цвет. */
  cols?: Float32Array;
  color?: V3;
  radius: number;
  /** Множитель радиуса по точкам (сужение ветвей, кончики). */
  radii?: Float32Array;
  mat: MaterialKind;
  /** Замкнутая петля (кольцо Земли и т. п.). */
  closed?: boolean;
  /** Видимое окно по длине нити (0..1) — рост/вытягивание нити. */
  s0?: number;
  s1?: number;
  /** Число граней сечения (LOD). */
  radial?: number;
  /** Длина сегмента по оси в долях радиуса (LOD). */
  segK?: number;
  /** Свечение (только для золотой нити-Солнца). */
  glow?: number;
}

export interface CameraState {
  pos: V3;
  target: V3;
  fov: number;
  roll?: number;
}

export interface LightState {
  keyDir: V3;
  keyColor: V3;
  keyIntensity: number;
  fillDir: V3;
  fillColor: V3;
  fillIntensity: number;
  rimDir: V3;
  rimColor: V3;
  rimIntensity: number;
  ambient: number;
  hemiSky: V3;
  hemiGround: V3;
  env: number;
  shadowCenter: V3;
  shadowSize: number;
  fogNear: number;
  fogFar: number;
}

export interface FrameState {
  threads: ThreadDraw[];
  camera: CameraState;
  light: LightState;
  /** Тусклый «тканый» фон неба (плоскость с процедурной фактурой) — прозрачность 0..1. */
  skyBacking: number;
  /** Мягкое свечение вокруг золотого Солнца: позиция и сила. */
  sunGlow: { pos: V3; strength: number; size: number };
}
