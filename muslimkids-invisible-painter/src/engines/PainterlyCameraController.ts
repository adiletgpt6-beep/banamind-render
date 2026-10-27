// PainterlyCameraController — плавная камера по ключевым кадрам.
// Интерполяция — кубический Эрмит с касательными по соседним ключам
// (неравномерные интервалы), зум — в логарифмической шкале: скорость
// приближения воспринимается равномерной. Ключ с hold:true — остановка.

export type CamKey = { f: number; x: number; y: number; zoom: number; rot?: number; hold?: boolean };
export type Cam = { x: number; y: number; zoom: number; rot: number };

export const W = 1080;
export const H = 1920;

export function cameraAt(keys: CamKey[], f: number): Cam {
  if (f <= keys[0].f) return { ...keys[0], rot: keys[0].rot ?? 0 };
  const last = keys[keys.length - 1];
  if (f >= last.f) return { ...last, rot: last.rot ?? 0 };
  let i = 0;
  while (keys[i + 1].f < f) i++;
  const a = keys[i], b = keys[i + 1];
  const dt = b.f - a.f;
  const t = (f - a.f) / dt;
  const tangent = (k: number, get: (c: CamKey) => number) => {
    const c = keys[k];
    if (c.hold || k === 0 || k === keys.length - 1) return 0;
    const p = keys[k - 1], n = keys[k + 1];
    return ((get(n) - get(p)) / (n.f - p.f)) * dt;
  };
  const herm = (get: (c: CamKey) => number) => {
    const p0 = get(a), p1 = get(b), m0 = tangent(i, get), m1 = tangent(i + 1, get);
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * m1;
  };
  return {
    x: herm((c) => c.x),
    y: herm((c) => c.y),
    zoom: Math.exp(herm((c) => Math.log(c.zoom))),
    rot: herm((c) => c.rot ?? 0),
  };
}

/** Применить камеру к контексту: мир → экран. depth>1 — дальний слой (параллакс). */
export function applyCamera(ctx: CanvasRenderingContext2D, cam: Cam, depth = 1, anchor = { x: W / 2, y: H / 2 }) {
  const z = 1 + (cam.zoom - 1) / depth;
  const cx = anchor.x + (cam.x - anchor.x) / depth;
  const cy = anchor.y + (cam.y - anchor.y) / depth;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(W / 2, H / 2);
  if (cam.rot) ctx.rotate(cam.rot);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
}

export const worldToScreen = (cam: Cam, x: number, y: number) => ({
  x: (x - cam.x) * cam.zoom + W / 2,
  y: (y - cam.y) * cam.zoom + H / 2,
});
