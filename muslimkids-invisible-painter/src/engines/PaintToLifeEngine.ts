// PaintToLifeEngine — три состояния нарисованного объекта:
//   PAINT     — плоский рисунок на холсте (появляется мазками);
//   AWAKENING — приобретает объём, свет, тени, слои начинают расходиться;
//   ALIVE     — живая анимация (волны, листья, вращение), но с той же
//               фактурой краски: свет и тени кладутся тоже «пигментом»
//               (multiply-лессировки и гуашевые блики), а не 3D-шейдингом.
// RETURN TO CANVAS — обратный путь: alive и awaken плавно гаснут до нуля.

import { clamp01, smoother } from "../utils/noise";

export type LifeTimes = { paint: [number, number]; awaken: [number, number]; ret?: [number, number] };
export type Life = {
  /** раскрытие рисунка 0..1 */
  paint: number;
  /** объём/свет 0..1 */
  awaken: number;
  /** амплитуда движения 0..1 */
  alive: number;
};

export function lifeAt(f: number, t: LifeTimes): Life {
  const paint = smoother((f - t.paint[0]) / (t.paint[1] - t.paint[0]));
  let awaken = smoother((f - t.awaken[0]) / (t.awaken[1] - t.awaken[0]));
  let alive = smoother((f - t.awaken[0] - (t.awaken[1] - t.awaken[0]) * 0.4) / (t.awaken[1] - t.awaken[0]));
  if (t.ret) {
    const r = 1 - smoother((f - t.ret[0]) / (t.ret[1] - t.ret[0]));
    awaken *= r;
    alive *= r;
  }
  return { paint: clamp01(paint), awaken: clamp01(awaken), alive: clamp01(alive) };
}

/**
 * Объём для нарисованной формы: внутри неё — лессировка тени со стороны,
 * противоположной свету, и тёплый/светлый блик со стороны света.
 * amount — состояние AWAKENING. Рисуется в слое краски.
 */
export function paintVolume(
  ctx: CanvasRenderingContext2D,
  clip: Path2D,
  box: { x: number; y: number; r: number },
  light: { x: number; y: number },
  amount: number,
  shadow = "#174A75",
  highlight = "rgba(255,250,235,1)",
) {
  if (amount <= 0.002) return;
  const len = Math.hypot(light.x, light.y) || 1;
  const lx = light.x / len, ly = light.y / len;
  ctx.save();
  ctx.clip(clip);
  const g = ctx.createLinearGradient(box.x + lx * box.r, box.y + ly * box.r, box.x - lx * box.r, box.y - ly * box.r);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.5, "rgba(255,255,255,0)");
  g.addColorStop(1, shadow);
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.45 * amount;
  ctx.fillStyle = g;
  ctx.fillRect(box.x - box.r * 1.2, box.y - box.r * 1.2, box.r * 2.4, box.r * 2.4);
  const h = ctx.createRadialGradient(box.x + lx * box.r * 0.45, box.y + ly * box.r * 0.45, 0, box.x + lx * box.r * 0.45, box.y + ly * box.r * 0.45, box.r * 0.8);
  h.addColorStop(0, highlight);
  h.addColorStop(1, "rgba(255,255,255,0)");
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.35 * amount;
  ctx.fillStyle = h;
  ctx.fillRect(box.x - box.r * 1.2, box.y - box.r * 1.2, box.r * 2.4, box.r * 2.4);
  ctx.restore();
}
