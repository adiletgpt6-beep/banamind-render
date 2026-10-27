// PainterlyLightingSystem — мягкий свет поверх готовой акварели.
// Свет копится в очереди за кадр и применяется ПОСЛЕ наложения краски на бумагу
// (режим screen): так сияние Солнца и звёзд освещает и бумагу, и пигмент,
// не превращаясь в агрессивный bloom.

export type LightOp =
  | { kind: "glow"; x: number; y: number; r: number; color: string; alpha: number }
  | { kind: "wash"; color: string; alpha: number; mode: GlobalCompositeOperation };

export class LightQueue {
  ops: { op: LightOp; m: DOMMatrix }[] = [];
  push(ctx: CanvasRenderingContext2D, op: LightOp) {
    this.ops.push({ op, m: ctx.getTransform() });
  }
  apply(main: CanvasRenderingContext2D, w: number, h: number) {
    for (const { op, m } of this.ops) {
      main.save();
      if (op.kind === "glow") {
        main.setTransform(m);
        main.globalCompositeOperation = "screen";
        main.globalAlpha = Math.min(1, op.alpha);
        const g = main.createRadialGradient(op.x, op.y, 0, op.x, op.y, op.r);
        g.addColorStop(0, op.color);
        g.addColorStop(0.35, fade(op.color, 0.45));
        g.addColorStop(1, fade(op.color, 0));
        main.fillStyle = g;
        main.fillRect(op.x - op.r, op.y - op.r, op.r * 2, op.r * 2);
      } else {
        main.setTransform(1, 0, 0, 1, 0, 0);
        main.globalCompositeOperation = op.mode;
        main.globalAlpha = op.alpha;
        main.fillStyle = op.color;
        main.fillRect(0, 0, w, h);
      }
      main.restore();
    }
    this.ops = [];
  }
}

/** #RRGGBB → rgba с заданной альфой. */
export function fade(hex: string, a: number) {
  if (hex.startsWith("rgba")) return hex.replace(/,[^,]*\)$/, `,${a})`);
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Смешать два цвета #RRGGBB. */
export function mix(a: string, b: string, t: number) {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

export const PALETTE = {
  paper: "#F7F2E8",
  gold: "#E5AC51",
  deep: "#174A75",
  sky: "#79C5E8",
  green: "#398C65",
  brown: "#916849",
  night: "#101C39",
  white: "#FFFFFF",
} as const;
