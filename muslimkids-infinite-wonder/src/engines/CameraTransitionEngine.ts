// InfiniteCameraController: математика плавной кинокамеры.
//
// Поза камеры задаётся не координатами, а «вокруг цели»: точка интереса,
// логарифм расстояния, азимут, высота и фокусное. Интерполяция расстояния
// в логарифме даёт постоянную воспринимаемую скорость приближения — так
// камера одинаково ровно летит и от орбиты к горам, и от листа к клетке.
import { Matrix4, PerspectiveCamera, Quaternion, Vector3 } from "three";

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
export const smootherstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
/** Окно: плавно 0→1 на [a,b], 1 до c, плавно 1→0 на [c,d]. */
export const windowed = (x: number, a: number, b: number, c: number, d: number) =>
  smoothstep(a, b, x) * (1 - smoothstep(c, d, x));
export const DEG = Math.PI / 180;

/**
 * Монотонная кубическая интерполяция (Фрич–Карлсон): гладкая (C¹),
 * без «перелётов» между ключами — камера не дёргается и не откатывается.
 */
export class MonotoneCurve {
  private m: number[];
  constructor(private xs: number[], private ys: number[]) {
    const n = xs.length;
    const d: number[] = [];
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    const m = new Array<number>(n);
    m[0] = d[0];
    m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) {
        m[i] = 0;
        m[i + 1] = 0;
        continue;
      }
      const a = m[i] / d[i];
      const b = m[i + 1] / d[i];
      const h = a * a + b * b;
      if (h > 9) {
        const t = 3 / Math.sqrt(h);
        m[i] = t * a * d[i];
        m[i + 1] = t * b * d[i];
      }
    }
    // Ровный старт и финал: камера трогается и останавливается мягко.
    m[0] = 0;
    m[n - 1] = 0;
    this.m = m;
  }
  at(x: number) {
    const { xs, ys, m } = this;
    const n = xs.length;
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] +
      (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] +
      (t3 - t2) * h * m[i + 1]
    );
  }
}

export type V3 = [number, number, number];

export type Pose = {
  target: V3;
  dist: number;
  /** Азимут вокруг вертикали, градусы (0 — камера на +Z от цели). */
  az: number;
  /** Высота над горизонтом цели, градусы. */
  el: number;
  fov: number;
  roll?: number;
};

export type PoseKey = { s: number; pose: Pose };

/** Пространство ключей позы → гладкая кривая по каждой компоненте. */
export class PoseTrack {
  private curves: MonotoneCurve[];
  constructor(public keys: PoseKey[]) {
    const xs = keys.map((k) => k.s);
    const comp = (f: (p: Pose) => number) => new MonotoneCurve(xs, keys.map((k) => f(k.pose)));
    this.curves = [
      comp((p) => p.target[0]),
      comp((p) => p.target[1]),
      comp((p) => p.target[2]),
      comp((p) => Math.log(p.dist)),
      comp((p) => p.az),
      comp((p) => p.el),
      comp((p) => p.fov),
      comp((p) => p.roll ?? 0),
    ];
  }
  at(s: number): Pose {
    const c = this.curves.map((k) => k.at(s));
    return {
      target: [c[0], c[1], c[2]],
      dist: Math.exp(c[3]),
      az: c[4],
      el: c[5],
      fov: c[6],
      roll: c[7],
    };
  }
}

export function posePosition(p: Pose): Vector3 {
  const az = p.az * DEG;
  const el = p.el * DEG;
  return new Vector3(
    p.target[0] + p.dist * Math.sin(az) * Math.cos(el),
    p.target[1] + p.dist * Math.sin(el),
    p.target[2] + p.dist * Math.cos(az) * Math.cos(el),
  );
}

const _m = new Matrix4();
const _up = new Vector3(0, 1, 0);

export function poseQuaternion(p: Pose): Quaternion {
  const eye = posePosition(p);
  const tgt = new Vector3(...p.target);
  _m.lookAt(eye, tgt, _up);
  const q = new Quaternion().setFromRotationMatrix(_m);
  if (p.roll) {
    q.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), p.roll * DEG));
  }
  return q;
}

/** Применить позу к камере: положение, ориентация, фокусное, плоскости отсечения. */
export function applyPose(cam: PerspectiveCamera, p: Pose, aspect: number) {
  cam.position.copy(posePosition(p));
  cam.quaternion.copy(poseQuaternion(p));
  cam.fov = p.fov;
  cam.aspect = aspect;
  // Логарифмический буфер глубины держит огромный диапазон масштабов,
  // но ближняя плоскость всё равно следует за расстоянием до цели.
  cam.near = Math.max(1e-5, p.dist * 0.02);
  cam.far = Math.max(60, p.dist * 1e5);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
}

/** Камера-двойник для расчёта экранных координат подписей вне WebGL. */
export function makeProjector(p: Pose, width: number, height: number) {
  const cam = new PerspectiveCamera();
  applyPose(cam, p, width / height);
  return (pt: V3 | Vector3) => {
    const v = Array.isArray(pt) ? new Vector3(...pt) : pt.clone();
    v.project(cam);
    return {
      x: (v.x * 0.5 + 0.5) * width,
      y: (-v.y * 0.5 + 0.5) * height,
      visible: v.z < 1 && v.z > -1,
    };
  };
}
