// PainterlyDepthEngine — художественный параллакс слоёв холста.
// Дальний слой (depth > 1) смещается и масштабируется камерой слабее ближнего,
// поэтому при движении камеры горы «отстают» от берега и между слоями появляется
// глубина, а фактура мазков остаётся плоской живописью.
import type { PaintCtx } from "./InvisiblePainterEngine";

export function withDepth(pc: PaintCtx, depth: number, draw: () => void) {
  pc.world(depth);
  draw();
  pc.world(1);
}
