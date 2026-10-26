// GeometryWondersEngine — ядро визуального языка «Pattern Bloom».
//
// Всё время в движке — абсолютные секунды ролика. Анимация описывается
// конфигурацией (треки ключевых кадров), а не ручным кодом в компонентах:
//   const track = makeTrack([{ t: 2, v: 0 }, { t: 3, v: 1, ease: "inOut" }]);
//   sample(track, time) → число или вектор.
// Каждая фигура — запись ShapeState (координаты, размер, цвет, вращение,
// положение в пространстве, прозрачность, глубина, состояние анимации).
// ShapeField переносит массив состояний в InstancedMesh (одна отрисовка
// на сотни фигур).
import * as THREE from "three";

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

// ---------- детерминированная случайность ----------
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- базовая математика ----------
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
export const smoother = (t: number) => {
  const x = clamp(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

export const EASE = {
  linear: (t: number) => clamp(t),
  in: (t: number) => clamp(t) ** 3,
  out: (t: number) => 1 - (1 - clamp(t)) ** 3,
  inOut: smoother,
  soft: smooth,
  // Мягкий «пружинный» выход без отскока назад ниже нуля.
  back: (t: number) => {
    const x = clamp(t);
    const c = 1.4;
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2;
  },
} as const;
export type EaseName = keyof typeof EASE;

/** 0→1 на отрезке [a, b] абсолютного времени с плавностью. */
export const ramp = (t: number, a: number, b: number, ease: EaseName = "inOut") =>
  EASE[ease]((t - a) / Math.max(1e-6, b - a));

/** 0→1→0: появление на [a, a+fi], исчезновение на [b-fo, b]. */
export const window01 = (t: number, a: number, b: number, fi = 0.4, fo = 0.4) =>
  Math.min(ramp(t, a, a + fi, "soft"), 1 - ramp(t, b - fo, b, "soft"));

// ---------- треки ключевых кадров ----------
export type Key<V> = { t: number; v: V; ease?: EaseName };
export type Track<V> = Key<V>[];

export function makeTrack<V>(keys: Track<V>): Track<V> {
  return [...keys].sort((a, b) => a.t - b.t);
}

function mix<V>(a: V, b: V, k: number): V {
  if (typeof a === "number") return lerp(a, b as number, k) as V;
  return (a as unknown as number[]).map((x, i) => lerp(x, (b as unknown as number[])[i], k)) as V;
}

export function sample<V>(track: Track<V>, t: number): V {
  if (t <= track[0].t) return track[0].v;
  for (let i = 1; i < track.length; i++) {
    const k = track[i];
    if (t <= k.t) {
      const p = track[i - 1];
      return mix(p.v, k.v, EASE[k.ease ?? "inOut"]((t - p.t) / (k.t - p.t)));
    }
  }
  return track[track.length - 1].v;
}

// ---------- цвет ----------
const tmpA = new THREE.Color();
const tmpB = new THREE.Color();
export function mixHex(a: string, b: string, t: number): THREE.Color {
  tmpA.set(a);
  tmpB.set(b);
  return tmpA.clone().lerp(tmpB, clamp(t));
}

// ---------- фигуры ----------
export function regularPolygon(n: number, r: number, rot = 0): Vec2[] {
  return Array.from({ length: n }, (_, i) => {
    const a = rot + (i / n) * Math.PI * 2;
    return [Math.cos(a) * r, Math.sin(a) * r] as Vec2;
  });
}

export function polygonShape(points: Vec2[], hole?: Vec2[]): THREE.Shape {
  const s = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  if (hole) s.holes.push(new THREE.Path([...hole].reverse().map(([x, y]) => new THREE.Vector2(x, y))));
  return s;
}

/** Состояние одной фигуры в пространстве и во времени. */
export type ShapeState = {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  color: THREE.Color | string;
  opacity: number; // в InstancedMesh 0 → фигура скрыта (масштаб 0)
  depth: number; // множитель толщины (масштаб по z)
  state?: "hidden" | "forming" | "formed" | "leaving";
};

const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const p = new THREE.Vector3();
const s = new THREE.Vector3();
const c = new THREE.Color();

/** Переносит состояния фигур в InstancedMesh (матрицы + цвета). */
export function applyShapeField(mesh: THREE.InstancedMesh | null, states: ShapeState[]) {
  if (!mesh) return;
  const n = Math.min(states.length, mesh.instanceMatrix.count);
  for (let i = 0; i < n; i++) {
    const st = states[i];
    const vis = st.opacity > 0.001 && st.state !== "hidden" ? 1 : 0;
    e.set(st.rotation[0], st.rotation[1], st.rotation[2]);
    q.setFromEuler(e);
    p.set(st.position[0], st.position[1], st.position[2]);
    s.set(st.scale[0] * vis, st.scale[1] * vis, st.scale[2] * st.depth * vis);
    m4.compose(p, q, s);
    mesh.setMatrixAt(i, m4);
    c.set(st.color as THREE.ColorRepresentation);
    mesh.setColorAt(i, c);
  }
  mesh.count = n;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

/** Точка на дуге между a и b с подъёмом h (для перелётов фигур без «телепорта»). */
export function arcPath(a: Vec3, b: Vec3, t: number, lift: number): Vec3 {
  const k = clamp(t);
  const base = lerp3(a, b, k);
  return [base[0], base[1] + Math.sin(k * Math.PI) * lift, base[2] + Math.sin(k * Math.PI) * lift * 0.5];
}
